// runtime/shard.mjs : one worker thread hosts one partition of the brain as its own
// Brain instance. It owns its cells, its in-shard edges and the ghost stubs of every
// cross-shard edge that lands on it (ghosts exist so core's hebbian rule can learn on a
// cross edge exactly as it would in one process). It ticks on command and reports.
//
// The only two things it does that a plain Brain does not:
//   1. an out-edge whose destination lives elsewhere becomes a record in shared memory
//      stamped with arriveAt = t + 1 + delay, which is what Brain._emit would have
//      scheduled locally, so the destination sees it on exactly the tick it is due;
//   2. it drains the other shards' records at the top of the tick, before anything runs.
import { parentPort, workerData } from 'node:worker_threads';
import { Brain } from '../core/brain.mjs';
import { serializeCell } from '../core/cell.mjs';
import { CTL, SH, REC, R, KIND_CODE, CODE_KIND, VIEW_OF, JSON_CODE, kindIndex, ordKey, canonicalKey, shardSlot, kindBit, ownBytes } from './protocol.mjs';
import { KINDS, dataToJSON, dataFromJSON } from '../core/signal.mjs';

const ENC = new TextEncoder(), DEC = new TextDecoder();

const W = workerData;
// Cell kinds are registered by importing the modules the spec names. A kind is code, so it
// cannot be serialized; the spec carries the module URL and every thread imports it.
for (const m of W.spec.modules) await import(m);
// Accelerated compute for the measured-hot kinds, so a sharded arm and a single process
// arm run the same functions and their tick rates can be compared.
if (W.spec.kernels) (await import('./kernels.mjs')).install();
const ME = W.shard, S = W.shards;
const HDR = 2 * S + 16;

const ctl = new Int32Array(W.ctlSab);
const payloadU8 = W.payloadSabs.map(b => new Uint8Array(b));
const descI32 = W.descSabs.map(b => new Int32Array(b));
const descF32 = W.descSabs.map(b => new Float32Array(b));
const meta = new Int32Array(W.metaSabs[ME]);
const wbI32 = new Int32Array(W.wbSabs[ME]);
const wbF32 = new Float32Array(W.wbSabs[ME]);
const wbIn = W.wbSabs.map(b => ({ i: new Int32Array(b), f: new Float32Array(b) }));

const localOf = new Int32Array(W.localOf);   // global cell idx -> local idx, or -1
const shardOf = new Int32Array(W.shardOf);   // global cell idx -> shard
const myCells = new Int32Array(W.cellIdx);   // local idx -> global cell idx

// Core drains a bucket in the order its signals were emitted, which is the order the
// emitting cells RAN: the due list of that tick (periods ascending, index inside a period)
// regrouped by region by Scheduler.allocate. The first version of this ranked a source by
// its raw global cell index, which is a different order in two ways: it puts an event cell
// before a period 1 cell of the same region, and it interleaves regions core keeps apart.
// Both were visible: on a 320 cell organism with growth on, 2 shards grew 1765 edges by
// tick 24 where one process grew 1743, because one predict.next cell saw its two inputs in
// the other order. Ranking by (region, core's own due key) makes 1, 2, 4 and 8 shards
// identical to one process for 120 ticks with growth running. See notes/runtime.md.
const ordRank = new Int32Array(W.spec.cells.length);
{
  const cells = W.spec.cells, n = cells.length;
  const key = new Float64Array(n), region = new Array(n);
  const regionMin = new Map();
  for (let i = 0; i < n; i++) {
    key[i] = canonicalKey(cells[i], i);
    const r = cells[i].region || 'default';
    region[i] = r;
    const m = regionMin.get(r);
    if (m === undefined || key[i] < m) regionMin.set(r, key[i]);
  }
  // regions ranked the way Scheduler.allocate meets them: the one whose earliest due cell
  // comes first runs first
  const regionOrder = [...regionMin.entries()].sort((a, b) => a[1] - b[1]);
  const regionRank = new Map(regionOrder.map(([r], i) => [r, i]));
  const idx = new Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  idx.sort((a, b) => (regionRank.get(region[a]) - regionRank.get(region[b])) || (key[a] - key[b]));
  for (let r = 0; r < n; r++) ordRank[idx[r]] = r;
}
const ordOf = (g) => (g < 0 ? -1 : ordRank[g]);

const PAYLOAD_SHARED = W.options.payload !== 'clone';
const ORDERED = W.options.ordered !== false;
const MAXP = W.maxOutPorts;
const MAX_PAYLOAD = W.maxPayloadBytes;
const PAYLOAD_SLAB = W.payloadSlab[ME];
const DESC_OFF = W.descOffsets.map(a => new Int32Array(a));
const DESC_CAP = W.descCap.map(a => new Int32Array(a));

// ---------------------------------------------------------------- the shard's brain
function cmpOrd(a, b) { return (a.sig.t - b.sig.t) || (a.ord - b.ord); }

class ShardBrain extends Brain {
  constructor(opts) {
    super(opts);
    this.g = myCells;
    this.eG = [];          // local edge id -> global edge id
    this.crossOut = null;  // localIdx * MAXP + port -> [cross record]
    this.pending = [];     // cross deliveries produced this tick
    this.firedList = [];
    this.ordered = ORDERED;
    // Arrival ticks whose bucket holds at least one signal from another thread. Only those
    // buckets need the canonical sort; a bucket filled entirely by this shard is already in
    // core's own emission order and sorting it would REPLACE that order with a different
    // one (see notes/runtime.md, "delivery order"). Measured: with the sort applied to
    // every bucket, one shard grew 189 edges on a tick where one process grew 167.
    this.mixedTicks = new Set();
  }
  _emit(cell, p, out, runSeq) {
    const n0 = this.outbox.length;
    const sig = super._emit(cell, p, out, runSeq);
    const t = this.clock.t;
    if (cell._firedAt !== t) { cell._firedAt = t; this.firedList.push(this.g[cell.idx]); }
    sig.src = this.g[cell.idx]; // one brain, one cell numbering: signals carry the global index
    const list = this.crossOut[cell.idx * MAXP + p];
    if (list !== null && list.length) {
      const bit = kindBit(out.kind);
      let routed = 0;
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (!c.active) continue;
        // core refuses at emit time when the destination port does not take this kind.
        // The destination cell is in another thread, so its port mask travels with the edge.
        if (!(c.mask & bit)) {
          this.stats.refused++;
          if (this.ledgerLevel !== 'off') this.log({ type: 'signal.refused', e: c.ge, from: cell.id, to: c.dstShard + ':' + c.dstLocal, kind: out.kind });
          continue;
        }
        c.usage++; c.lastT = t;
        this.pending.push(c, sig);
        routed++;
      }
      // super pushed to the outbox only because nothing local took the signal; it is routed.
      if (routed > 0 && this.outbox.length > n0) this.outbox.pop();
    }
    return sig;
  }
  _schedule(at, item) {
    if (item.ord === undefined) {
      // emitted by a cell of this shard: it went into the bucket in core's emission order
      const src = item.from >= 0 ? this.g[item.from] : -1;
      const e = item.e >= 0 ? (this.eG[item.e] ?? -1) : -1;
      item.ord = ordKey(ordOf(src), item.sig.port, e);
    } else if (this.ordered) this.mixedTicks.add(at); // it came from another thread
    super._schedule(at, item);
  }
  _deliver(t) {
    if (this.mixedTicks.delete(t)) {
      const l = this.inflight.get(t);
      if (l !== undefined && l.length > 1) l.sort(cmpOrd);
    }
    super._deliver(t);
  }
}

const brain = new ShardBrain({
  name: W.spec.name + '#' + ME,
  seed: W.spec.seed + ':shard' + ME,
  ledger: W.spec.ledger,
  pruneEvery: W.spec.pruneEvery,
  hebbian: W.spec.hebbian,
  gate: W.spec.gate,
  // Growth is a change to the whole connectome and is decided once, by the coordinator,
  // on the global fired list. A shard that grew on its own local fired list would grow a
  // different brain for every partition, so its own tracker is switched off entirely.
  growth: { ...W.spec.growth, enabled: false },
});

// regions in the order their first cell appears, so the shard's scheduler groups them
// the way one process would
{
  const seen = new Set();
  for (let i = 0; i < myCells.length; i++) {
    const c = W.spec.cells[myCells[i]];
    const name = c.region || 'default';
    if (seen.has(name)) continue;
    seen.add(name);
    const r = W.regionBudget[name];
    brain.addRegion(name, { budget: r == null ? Infinity : r });
  }
  for (let i = 0; i < myCells.length; i++) brain.addCell(W.spec.cells[myCells[i]]);
  brain.crossOut = new Array(myCells.length * MAXP).fill(null);
}

// in-shard edges, replayed in global edge order so local edge ids rise with global ones
for (const e of W.inEdges) {
  const le = brain.connect(e.ls, e.sp, e.ld, e.dp, { w: e.w, delay: e.delay, conf: e.conf });
  brain.eG[le] = e.ge;
}
// cross out-edges: not in the local connectome, they leave the thread
const crossByGe = new Map();
for (const e of W.crossOut) addCrossOut(e);
function addCrossOut(e) {
  const rec = { ge: e.ge, dstShard: e.dstShard, dstLocal: e.dstLocal, dp: e.dp, w: e.w, delay: e.delay, mask: e.mask, usage: 0, lastT: -1, active: true };
  const k = e.ls * MAXP + e.sp;
  if (brain.crossOut[k] === null) brain.crossOut[k] = [];
  brain.crossOut[k].push(rec);
  crossByGe.set(e.ge, rec);
}
// cross in-edges: a dormant ghost per edge so core's hebbian rule has a weight to move.
// Dormant keeps them out of propagation, out of live() and out of pruneCandidates.
const GHOST_NODE = myCells.length;
const ghostOf = new Map(); // global edge -> local (ghost) edge id
const ghostLocal = [], ghostGe = [], ghostLastW = [];
for (const e of W.crossIn) addGhost(e);
function addGhost(e) {
  const le = brain.connectome.add(GHOST_NODE, e.ld, { srcPort: 0, dstPort: e.dp, w: e.w, delay: e.delay, conf: e.conf ?? 0.5 });
  brain.connectome.setFlags(le, 2 /* DORMANT */);
  brain.eG[le] = e.ge;
  ghostOf.set(e.ge, le);
  ghostLocal.push(le); ghostGe.push(e.ge); ghostLastW.push(e.w);
}
const hasHebbian = brain.cells.some(c => c.policy.learn === 'hebbian');

Atomics.store(ctl, shardSlot(ME, SH.CELLS), myCells.length);
Atomics.store(ctl, shardSlot(ME, SH.EDGES), brain.connectome.live());

// ---------------------------------------------------------------- per tick
let flagSnapshot = null;

function dueList() {
  const out = [];
  for (const idx of brain.clock.due(brain.clock.t)) out.push(idx);
  for (const idx of brain.clock.eventCells) {
    const c = brain.cells[idx];
    for (let p = 0; p < c.mailbox.length; p++) if (c.mailbox[p].length) { out.push(idx); break; }
  }
  return out;
}

function drainIncoming(t, clones) {
  if (t === 0) { applyClones(clones); return; }
  const slab = (t - 1) & 1;
  let got = 0;
  for (let s = 0; s < S; s++) {
    if (s === ME) continue;
    const di = descI32[s], df = descF32[s];
    const n = Atomics.load(di, slab * S + ME);
    if (!n) continue;
    const base = HDR + DESC_OFF[s][slab * S + ME];
    const bytes = payloadU8[s];
    for (let k = 0; k < n; k++) {
      const o = base + k * REC;
      const code = di[o + R.KIND], len = di[o + R.LEN], off = di[o + R.OFF];
      const ge = di[o + R.EDGE], src = di[o + R.SRC], port = di[o + R.PORT];
      let kind, data;
      if (code === JSON_CODE) {
        kind = KINDS[di[o + R.SKIND]];
        data = dataFromJSON(kind, JSON.parse(DEC.decode(bytes.subarray(off, off + len))));
      } else {
        const buf = new Uint8Array(len);
        buf.set(bytes.subarray(off, off + len));
        kind = CODE_KIND[code];
        data = new VIEW_OF[code](buf.buffer);
      }
      const sig = { kind, data, t: di[o + R.T], gen: di[o + R.GEN], src, port, seq: di[o + R.SEQ] };
      brain._schedule(di[o + R.ARRIVE], {
        sig, w: df[o + R.W], e: ghostOf.get(ge) ?? -1, from: -1,
        dst: di[o + R.DST], dstPort: di[o + R.DSTPORT], ord: ordKey(ordOf(src), port, ge),
      });
      got++;
    }
  }
  got += applyClones(clones);
  if (got) { Atomics.add(ctl, CTL.CROSS_IN, got); Atomics.add(ctl, shardSlot(ME, SH.CROSS_IN), got); }
}

function applyClones(clones) {
  if (!clones || !clones.length) return 0;
  let n = 0;
  for (const rec of clones) {
    brain._schedule(rec.arrive, {
      sig: { kind: rec.kind, data: rec.data, t: rec.t, gen: rec.gen, src: rec.src, port: rec.port, seq: rec.seq },
      w: rec.w, e: ghostOf.get(rec.e) ?? -1, from: -1,
      dst: rec.dst, dstPort: rec.dstPort, ord: ordKey(ordOf(rec.src), rec.port, rec.e),
    });
    n++;
  }
  return n;
}

function flushCross(t) {
  const pending = brain.pending;
  if (!pending.length) {
    const slab = t & 1;
    const di = descI32[ME];
    for (let d = 0; d < S; d++) Atomics.store(di, slab * S + d, 0);
    return null;
  }
  const slab = t & 1;
  const di = descI32[ME], df = descF32[ME];
  const counts = new Int32Array(S);
  const bytes = payloadU8[ME];
  const slabBase = slab * PAYLOAD_SLAB;
  let cursor = 0, cloned = 0, overflow = 0;
  const seen = new Map(), seenLen = new Map();
  let clones = null, owned = null;
  for (let i = 0; i < pending.length; i += 2) {
    const c = pending[i], sig = pending[i + 1];
    const d = c.dstShard;
    let code = KIND_CODE[sig.kind];
    let off = -1, len = 0;
    if (PAYLOAD_SHARED && code !== undefined && ArrayBuffer.isView(sig.data)) {
      len = sig.data.byteLength;
      const hit = seen.get(sig.data);
      if (hit !== undefined) off = hit;
      else if (len <= MAX_PAYLOAD && cursor + len <= PAYLOAD_SLAB) {
        off = slabBase + cursor; cursor += len;
        bytes.set(new Uint8Array(sig.data.buffer, sig.data.byteOffset, len), off);
        seen.set(sig.data, off);
      } else overflow++;
    } else if (PAYLOAD_SHARED) {
      // not a typed array: the same arena, as JSON. The cached entry is keyed by the
      // signal object, so a signal that leaves for three shards is encoded once.
      const hit = seen.get(sig);
      if (hit !== undefined) { off = hit; len = seenLen.get(sig); }
      else {
        let enc = null;
        try { enc = ENC.encode(JSON.stringify(dataToJSON(sig.kind, sig.data))); } catch { enc = null; }
        if (enc !== null && enc.length <= MAX_PAYLOAD && cursor + enc.length <= PAYLOAD_SLAB) {
          off = slabBase + cursor; len = enc.length; cursor += len;
          bytes.set(enc, off);
          seen.set(sig, off); seenLen.set(sig, len);
        } else overflow++;
      }
      code = JSON_CODE;
    }
    const k = counts[d];
    if (off >= 0 && k < DESC_CAP[ME][d]) {
      const o = HDR + DESC_OFF[ME][slab * S + d] + k * REC;
      di[o + R.OFF] = off; di[o + R.LEN] = len; di[o + R.KIND] = code;
      di[o + R.SKIND] = kindIndex(sig.kind);
      di[o + R.DST] = c.dstLocal; di[o + R.DSTPORT] = c.dp; di[o + R.EDGE] = c.ge;
      di[o + R.ARRIVE] = t + 1 + c.delay; df[o + R.W] = c.w;
      di[o + R.T] = sig.t; di[o + R.GEN] = sig.gen; di[o + R.SRC] = sig.src;
      di[o + R.PORT] = sig.port; di[o + R.SEQ] = sig.seq;
      counts[d] = k + 1;
    } else {
      if (off >= 0) overflow++;
      if (clones === null) { clones = new Array(S).fill(null); owned = new Map(); }
      if (clones[d] === null) clones[d] = [];
      // sig.data is a window on this shard's wasm heap: the reply would clone the whole heap
      // to the coordinator, which forwards it again (ownBytes in protocol.mjs)
      clones[d].push({ kind: sig.kind, data: ownBytes(sig.data, owned), dst: c.dstLocal, dstPort: c.dp, e: c.ge, arrive: t + 1 + c.delay, w: c.w, t: sig.t, gen: sig.gen, src: sig.src, port: sig.port, seq: sig.seq });
      cloned++;
    }
  }
  for (let d = 0; d < S; d++) Atomics.store(di, slab * S + d, counts[d]);
  const out = (pending.length >> 1);
  Atomics.add(ctl, CTL.CROSS_OUT, out); Atomics.add(ctl, shardSlot(ME, SH.CROSS_OUT), out);
  if (cloned) Atomics.add(ctl, CTL.CLONED, cloned);
  if (overflow) Atomics.add(ctl, CTL.OVERFLOW, overflow);
  brain.pending = [];
  return clones;
}

function writeMeta(due, fired) {
  const cap = myCells.length;
  meta[0] = due.length; meta[1] = fired.length;
  for (let i = 0; i < due.length; i++) meta[2 + i] = myCells[due[i]];
  for (let i = 0; i < fired.length; i++) meta[2 + cap + i] = fired[i];
}

function writeWeightBack() {
  if (!hasHebbian) { wbI32[0] = 0; return; }
  const w = brain.connectome.w;
  let n = 0;
  for (let i = 0; i < ghostLocal.length; i++) {
    const cur = w[ghostLocal[i]];
    if (cur === ghostLastW[i]) continue;
    ghostLastW[i] = cur;
    wbI32[1 + n * 2] = ghostGe[i]; wbF32[2 + n * 2] = cur;
    n++;
  }
  wbI32[0] = n;
}

// Which of MY local edges core pruned since the last look. The coordinator needs them so
// its shadow connectome keeps the same live edge set (growth asks it whether a pair is
// already connected, and a pruned pair may be grown again).
function newlyPruned() {
  const c = brain.connectome, n = c.n, out = [];
  if (flagSnapshot === null) flagSnapshot = new Uint8Array(Math.max(16, n * 2));
  else if (flagSnapshot.length < n) { const f = new Uint8Array(n * 2); f.set(flagSnapshot); flagSnapshot = f; }
  for (let e = 0; e < n; e++) {
    if (c.flags[e] === flagSnapshot[e]) continue;
    if (c.flags[e] === 4 /* PRUNED */ && brain.eG[e] !== undefined) out.push(brain.eG[e]);
    flagSnapshot[e] = c.flags[e];
  }
  return out;
}

// Accumulated microseconds this shard spent inside step(), and inside drainIncoming alone.
// Everything else in a tick's wall clock is the fence: waiting for the command, and the
// coordinator's own work between the barrier and the next command.
let busyUs = 0, drainUs = 0;

function step(msg) {
  const tBusy = process.hrtime.bigint();
  const t = msg.t;
  if (brain.clock.t !== t) throw new Error('shard ' + ME + ': at t=' + brain.clock.t + ', told to run t=' + t);
  // 1. structural changes the coordinator decided after tick t - 1
  if (msg.grow) for (const g of msg.grow) applyGrow(g);
  if (msg.prune) for (const ge of msg.prune) { const r = crossByGe.get(ge); if (r) r.active = false; }
  if (msg.wb) for (let i = 0; i < msg.wb.length; i += 2) { const r = crossByGe.get(msg.wb[i]); if (r) r.w = msg.wb[i + 1]; }
  // 2. everything the other shards sent last tick, before anything of ours runs
  const tDrain = process.hrtime.bigint();
  drainIncoming(t, msg.clones);
  drainUs += Number(process.hrtime.bigint() - tDrain) / 1e3;
  // 3. the tick itself. _deliver first so the due list can be read the way core reads it.
  brain.firedList = [];
  brain._deliver(t);
  const due = dueList();
  brain.tick(1);
  // 4. report
  const clones = flushCross(t);
  writeMeta(due, brain.firedList);
  writeWeightBack();
  const pruned = brain.stats.pruned ? newlyPruned() : null;
  const st = brain.stats;
  Atomics.store(ctl, shardSlot(ME, SH.RUNS), st.runs);
  Atomics.store(ctl, shardSlot(ME, SH.SIGNALS), st.signals);
  Atomics.store(ctl, shardSlot(ME, SH.DELIVERED), st.delivered);
  Atomics.store(ctl, shardSlot(ME, SH.TICK), t);
  Atomics.store(ctl, shardSlot(ME, SH.REFUSED), st.refused);
  Atomics.store(ctl, shardSlot(ME, SH.ERRORS), st.errors);
  busyUs += Number(process.hrtime.bigint() - tBusy) / 1e3;
  Atomics.store(ctl, shardSlot(ME, SH.BUSY_US), busyUs | 0);
  Atomics.store(ctl, shardSlot(ME, SH.DRAIN_US), drainUs | 0);
  Atomics.add(ctl, CTL.ARRIVED, 1);
  Atomics.notify(ctl, CTL.ARRIVED);
  const reply = { type: 'ticked', shard: ME, t };
  if (clones) reply.clones = clones;
  if (pruned && pruned.length) reply.pruned = pruned;
  if (msg.reportCrossUsage) {
    const u = [];
    for (const r of crossByGe.values()) u.push(r.ge, r.usage, r.lastT, r.w);
    reply.crossUsage = u;
  }
  parentPort.postMessage(reply);
}

// g = [globalEdge, srcGlobal, srcPort, dstGlobal, dstPort, w, delay, conf, dstLocal].
// dstLocal is filled in by the coordinator, the only party that knows both partitions.
function applyGrow(g) {
  const ge = g[0], srcG = g[1], sp = g[2], dstG = g[3], dp = g[4], w = g[5], delay = g[6], conf = g[7], dstLocal = g[8], mask = g[9];
  // localOf holds every cell's index inside ITS OWN shard, so it is never negative.
  // Ownership is shardOf, and only shardOf.
  const mineSrc = shardOf[srcG] === ME, mineDst = shardOf[dstG] === ME;
  if (mineSrc && mineDst) {
    const le = brain.connect(localOf[srcG], sp, localOf[dstG], dp, { w, delay, conf });
    brain.eG[le] = ge;
  } else if (mineSrc) {
    addCrossOut({ ge, ls: localOf[srcG], sp, dstShard: shardOf[dstG], dstLocal, dp, w, delay, mask });
  } else if (mineDst) {
    addGhost({ ge, ld: localOf[dstG], dp, w, delay, conf });
  }
}

parentPort.on('message', (msg) => {
  try {
    switch (msg.cmd) {
      case 'step': step(msg); break;
      case 'inject': {
        for (const inj of msg.list) brain.inject(localOf[inj.cell], inj.port, { kind: inj.kind, data: inj.data }, { delay: inj.delay | 0, w: inj.w ?? 1 });
        parentPort.postMessage({ type: 'ok', id: msg.id, shard: ME });
        break;
      }
      // Per cell run and fire counts, as two typed arrays. A full snapshot would serialize
      // every cell's state, which on the organism is megabytes of hypervector per cell; a
      // caller proving that the cluster fired what one process fired only needs these.
      case 'counts': {
        const n = myCells.length, runs = new Int32Array(n), fired = new Int32Array(n);
        for (let i = 0; i < n; i++) { const st = brain.cells[i].stats; runs[i] = st.runs; fired[i] = st.fired; }
        parentPort.postMessage({ type: 'counts', id: msg.id, shard: ME, g: myCells, runs, fired });
        break;
      }
      case 'snapshot': {
        const cells = brain.cells.map((c, i) => ({ g: myCells[i], j: serializeCell(c) }));
        let inflight = 0;
        for (const l of brain.inflight.values()) inflight += l.length;
        parentPort.postMessage({
          type: 'snapshot', id: msg.id, shard: ME, t: brain.clock.t, cells,
          stats: { ...brain.stats }, inflight, outbox: brain.outbox.length,
          edges: brain.connectome.live(), gate: brain.gate.stats, ledger: brain.ledger.seq,
        });
        break;
      }
      case 'stop': {
        brain.ledger.flush();
        parentPort.postMessage({ type: 'stopped', shard: ME });
        break;
      }
      default: throw new Error('shard ' + ME + ': unknown command ' + msg.cmd);
    }
  } catch (err) {
    parentPort.postMessage({ type: 'error', shard: ME, error: String(err && err.stack || err) });
  }
});

parentPort.postMessage({ type: 'ready', shard: ME, cells: myCells.length, edges: brain.connectome.live(), ghosts: ghostLocal.length, crossOut: W.crossOut.length });
