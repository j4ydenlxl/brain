// runtime/cluster.mjs : the main thread coordinator. It owns the brain's identity: the
// full cell list, the global connectome, the gate, the co-activation tracker and the seed.
// The shards own the compute.
//
// Per tick it does exactly four things:
//   1. tells every shard to run tick t and waits for all of them (the barrier);
//   2. checks the barrier invariant in shared memory (ARRIVED == (t + 1) * shards);
//   3. rebuilds the global fired list in the order one process would have produced it,
//      and runs growth and pruning against the global connectome, through the gate;
//   4. hands the resulting structural changes to the shards before tick t + 1.
// Signal payloads never pass through here. They go shard to shard through a shared arena.
import { Worker } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ACTIVE } from '../core/connectome.mjs';
import {
  CTL, SH, CTL_WORDS, REC, shardSlot, canonicalKey,
  normalizeSpec, buildBrain, assignPartition, planArenas, kindMask, ownBytes,
} from './protocol.mjs';

export { buildBrain, assignPartition, normalizeSpec } from './protocol.mjs';

/**
 * A spec that rebuilds an already built Brain. The emitted organism is a Brain, not a
 * spec, so this is how a loaded organism reaches the cluster: cells by index in the order
 * they were added (the order every edge refers to), edges straight off the connectome.
 * Cell state is not copied; each shard runs the same kind.init(params) the loader ran,
 * which is deterministic in params, so the rebuilt cells start where the loaded ones did.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {{ modules: string[], name?: string, seed?: string, ledger?: string, pruneEvery?: number, growth?: object, gate?: object, kernels?: boolean, maxPayloadBytes?: number }} opts
 */
export function specFromBrain(brain, opts = {}) {
  const c = brain.connectome, edges = new Array(c.n);
  for (let e = 0; e < c.n; e++) edges[e] = { src: c.src[e], srcPort: c.srcPort[e], dst: c.dst[e], dstPort: c.dstPort[e], w: c.w[e], delay: c.delay[e], conf: c.conf[e] };
  return {
    name: opts.name || brain.name,
    seed: opts.seed ?? brain.name,
    ledger: opts.ledger || 'off',
    pruneEvery: opts.pruneEvery ?? brain.pruneEvery,
    hebbian: brain.hebbian,
    growth: opts.growth || {},
    gate: opts.gate || {},
    kernels: opts.kernels === true,
    maxPayloadBytes: opts.maxPayloadBytes ?? 8192,
    modules: opts.modules || [],
    regions: [...brain.regions.values()].map(r => ({ name: r.name, budget: Number.isFinite(r.budget) ? r.budget : null })),
    cells: brain.cells.map(x => ({ id: x.id, kind: x.kind, region: x.region, circuit: x.circuit, params: x.params, policy: x.policy })),
    edges,
  };
}

const SHARD_URL = new URL('./shard.mjs', import.meta.url);

export class Cluster {
  constructor(spec, { shards = 4, partition = null, payload = 'shared', ordered = true, ledger = null, growth = true } = {}) {
    this.spec = normalizeSpec(spec);
    this.S = Math.max(1, shards | 0);
    this.opts = { shards: this.S, partition, payload, ordered, ledger, growth };
    this.started = false; this.stopped = false;
    this.t = 0;
    this.workers = [];
    this.crossMessages = 0;
    this.grownEdges = 0; this.prunedEdges = 0;
    this.coord = { ticks: 0, roundTripUs: 0, replyUs: 0, firedUs: 0, structUs: 0, pruneUs: 0 };
  }

  // ------------------------------------------------------------ start
  async start() {
    if (this.started) return this;
    const spec = this.spec, S = this.S;
    for (const m of spec.modules) await import(m);

    // The shadow brain is the whole brain, built exactly as one process would build it.
    // It is never ticked. It exists so growth, pruning and the gate see one connectome.
    this.shadow = buildBrain(spec, this.opts.ledger ? { ledger: this.opts.ledger } : {});
    // The shadow never ticks, so it has no usage counters and core's prune sweep would
    // read every edge as stale. In a cluster an in-shard edge is pruned by the shard that
    // owns it and a cross edge by _pruneCross below, both from real usage, so the shadow's
    // own sweep is switched off. spec.pruneEvery still drives both of those.
    this.shadow.pruneEvery = 0;
    const N = this.shadow.cells.length;
    const of = assignPartition(spec, S, this.opts.partition);
    this.shardOf = of;

    const local = new Int32Array(N).fill(-1);
    const cellIdx = Array.from({ length: S }, () => []);
    for (let g = 0; g < N; g++) { local[g] = cellIdx[of[g]].length; cellIdx[of[g]].push(g); }
    this.localOf = local;
    this.cellsPerShard = cellIdx.map(a => a.length);

    this.cellKey = new Float64Array(N);
    this.regionOfCell = new Array(N);
    for (let g = 0; g < N; g++) { this.cellKey[g] = canonicalKey(this.shadow.cells[g], g); this.regionOfCell[g] = this.shadow.cells[g].region; }
    this.anyFiniteBudget = [...this.shadow.regions.values()].some(r => Number.isFinite(r.budget));
    this.firedFlag = new Uint8Array(N);
    this.touched = new Int32Array(N);

    // classify every edge: in-shard, or a message
    const c = this.shadow.connectome;
    const inEdges = Array.from({ length: S }, () => []);
    const crossOut = Array.from({ length: S }, () => []);
    const crossIn = Array.from({ length: S }, () => []);
    const crossPairs = new Int32Array(S * S), crossInto = new Int32Array(S);
    this.crossEdges = [];
    for (let e = 0; e < c.n; e++) {
      const sg = c.src[e], dg = c.dst[e], ss = of[sg], ds = of[dg];
      if (ss === ds) {
        inEdges[ss].push({ ge: e, ls: local[sg], sp: c.srcPort[e], ld: local[dg], dp: c.dstPort[e], w: c.w[e], delay: c.delay[e], conf: c.conf[e] });
      } else {
        crossOut[ss].push({ ge: e, ls: local[sg], sp: c.srcPort[e], dstShard: ds, dstLocal: local[dg], dp: c.dstPort[e], w: c.w[e], delay: c.delay[e], mask: this._mask(dg, c.dstPort[e]) });
        crossIn[ds].push({ ge: e, ld: local[dg], dp: c.dstPort[e], w: c.w[e], delay: c.delay[e], conf: c.conf[e] });
        crossPairs[ss * S + ds]++; crossInto[ds]++; this.crossEdges.push(e);
      }
    }
    this.crossEdgeCount = this.crossEdges.length;
    this.inShardEdgeCount = c.n - this.crossEdgeCount;

    const maxOutPorts = Math.max(1, ...this.shadow.cells.map(x => x.ports.out.length));
    const plan = planArenas({ cellsPerShard: this.cellsPerShard, crossPairs, crossInto, shards: S, maxPayloadBytes: spec.maxPayloadBytes });
    this.plan = plan;

    this.ctlSab = new SharedArrayBuffer(CTL_WORDS * 4);
    this.ctl = new Int32Array(this.ctlSab);
    this.payloadSabs = plan.payloadBytes.map(b => new SharedArrayBuffer(b));
    this.descSabs = plan.descWords.map(w => new SharedArrayBuffer((w + 2 * S + 16) * 4));
    this.metaSabs = this.cellsPerShard.map(n => new SharedArrayBuffer((2 + 2 * Math.max(1, n)) * 4));
    this.wbSabs = plan.wbCap.map(n => new SharedArrayBuffer((2 + 2 * n) * 4));
    this.metaI32 = this.metaSabs.map(b => new Int32Array(b));
    this.wbI32 = this.wbSabs.map(b => new Int32Array(b));
    this.wbF32 = this.wbSabs.map(b => new Float32Array(b));
    this.sharedBytes = CTL_WORDS * 4 + plan.payloadBytes.reduce((a, b) => a + b, 0)
      + this.descSabs.reduce((a, b) => a + b.byteLength, 0)
      + this.metaSabs.reduce((a, b) => a + b.byteLength, 0)
      + this.wbSabs.reduce((a, b) => a + b.byteLength, 0);

    const regionBudget = {};
    for (const [name, r] of this.shadow.regions) regionBudget[name] = Number.isFinite(r.budget) ? r.budget : null;

    this.growFor = Array.from({ length: S }, () => null);
    this.pruneFor = Array.from({ length: S }, () => null);
    this.wbFor = Array.from({ length: S }, () => null);
    this.clonesFor = Array.from({ length: S }, () => null);

    // A shard never reads spec.edges: the coordinator has already split them into its
    // inEdges, crossOut and crossIn lists. Sending the edge list anyway costs one
    // structured clone of every edge per worker, which on the organism is 440578 objects
    // times the shard count, so it is dropped here.
    // A cell param that is a hypervector would carry the whole wasm heap into every worker
    // (see ownBytes in protocol.mjs), so the cells go through the same copy on write.
    const workerSpec = { ...spec, cells: ownBytes(spec.cells), edges: [] };

    const ready = [];
    for (let s = 0; s < S; s++) {
      const w = new Worker(SHARD_URL, {
        workerData: {
          shard: s, shards: S, spec: workerSpec,
          cellIdx: Int32Array.from(cellIdx[s]), localOf: local, shardOf: of,
          inEdges: inEdges[s], crossOut: crossOut[s], crossIn: crossIn[s],
          regionBudget, maxOutPorts, maxPayloadBytes: spec.maxPayloadBytes,
          ctlSab: this.ctlSab, payloadSabs: this.payloadSabs, descSabs: this.descSabs,
          metaSabs: this.metaSabs, wbSabs: this.wbSabs,
          payloadSlab: plan.payloadSlab, descOffsets: plan.descOffsets, descCap: plan.descCap,
          options: { payload: this.opts.payload, ordered: this.opts.ordered },
        },
      });
      this.workers.push(w);
      ready.push(new Promise((res, rej) => {
        w.once('message', (m) => m.type === 'ready' ? res(m) : rej(new Error('shard ' + s + ': ' + (m.error || m.type))));
        w.once('error', rej);
      }));
    }
    this.ready = await Promise.all(ready);
    for (let s = 0; s < S; s++) {
      const w = this.workers[s];
      w.on('message', (m) => this._onMessage(s, m));
      w.on('error', (e) => this._fail(e));
      w.on('exit', (code) => { if (!this.stopped) this._fail(new Error('shard ' + s + ' exited with code ' + code)); });
    }
    this.started = true;
    return this;
  }

  // ------------------------------------------------------------ messaging
  _onMessage(s, m) {
    if (m.type === 'error') return this._fail(new Error(m.error));
    const wait = this._wait;
    if (!wait) return;
    if (m.type !== wait.type) return;
    wait.got.push(m);
    if (wait.got.length === this.S) { this._wait = null; wait.res(wait.got); }
  }
  _fail(err) {
    const wait = this._wait;
    this._wait = null;
    if (wait) wait.rej(err); else this._deferred = err;
  }
  _all(type, make) {
    if (this._deferred) { const e = this._deferred; this._deferred = null; throw e; }
    const p = new Promise((res, rej) => { this._wait = { type, got: [], res, rej }; });
    for (let s = 0; s < this.S; s++) this.workers[s].postMessage(make(s));
    return p;
  }

  // ------------------------------------------------------------ injection
  async inject(cell, port, sig, opts = {}) {
    return this.injectMany([{ cell, port, kind: sig.kind, data: sig.data, delay: opts.delay | 0, w: opts.w ?? 1 }]);
  }
  async injectMany(list) {
    this._need();
    const per = Array.from({ length: this.S }, () => []);
    // inj.data is usually an hv: a window on the 514.7 MB wasm heap, which a postMessage
    // would copy whole to every shard. One memo for the call, so a vector injected into
    // 64 cells is copied once and stays one object, as the clone used to keep it.
    const memo = new Map();
    for (const inj of list) {
      const g = this.shadow.cell(inj.cell).idx;
      per[this.shardOf[g]].push({ ...inj, cell: g, data: ownBytes(inj.data, memo) });
    }
    await this._all('ok', (s) => ({ cmd: 'inject', id: 'inj', list: per[s] }));
    return this;
  }

  // ------------------------------------------------------------ the tick
  async tick(n = 1) {
    this._need();
    for (let i = 0; i < n; i++) await this._step();
    return this;
  }

  async _step() {
    const hr = process.hrtime.bigint;
    const t0 = hr();
    const S = this.S, t = this.t;
    const pruneTick = this.spec.pruneEvery > 0 && t > 0 && t % this.spec.pruneEvery === 0;
    const grow = this.growFor, prune = this.pruneFor, wb = this.wbFor, clones = this.clonesFor;
    this.growFor = Array.from({ length: S }, () => null);
    this.pruneFor = Array.from({ length: S }, () => null);
    this.wbFor = Array.from({ length: S }, () => null);
    this.clonesFor = Array.from({ length: S }, () => null);

    const replies = await this._all('ticked', (s) => ({
      cmd: 'step', t, grow: grow[s], prune: prune[s], wb: wb[s], clones: clones[s], reportCrossUsage: pruneTick,
    }));

    const tA = hr();
    // the barrier invariant, checked in shared memory rather than assumed from the replies
    const arrived = Atomics.load(this.ctl, CTL.ARRIVED);
    if (arrived !== (t + 1) * S) throw new Error('barrier: t=' + t + ' expected ' + ((t + 1) * S) + ' arrivals, shared counter says ' + arrived);
    Atomics.store(this.ctl, CTL.TICK, t);

    for (const r of replies) {
      if (r.clones) for (let d = 0; d < S; d++) if (r.clones[d]) { (this.clonesFor[d] ??= []).push(...r.clones[d]); }
      if (r.pruned) for (const ge of r.pruned) { if (this.shadow.connectome.flags[ge] & ACTIVE) this.shadow.connectome.prune(ge); }
    }
    this._applyWeightBack();
    const tB = hr();
    const fired = this._globalFired();
    const tC = hr();
    this._structural(t, fired);
    const tD = hr();
    if (pruneTick) this._pruneCross(t, replies);

    // Where a tick's wall clock goes on THIS thread. roundTrip is the command out, the
    // shards' own work, and the replies back, so it contains the shards' compute; every
    // other field is coordinator-only serial work that no number of shards divides. A shard
    // reports its own compute into the control block (SH.BUSY_US), so roundTrip minus the
    // slowest shard's busy time is the dispatch and wake up cost of the barrier itself.
    const c = this.coord;
    c.ticks++;
    c.roundTripUs += Number(tA - t0) / 1e3;
    c.replyUs += Number(tB - tA) / 1e3;
    c.firedUs += Number(tC - tB) / 1e3;
    c.structUs += Number(tD - tC) / 1e3;
    c.pruneUs += Number(hr() - tD) / 1e3;
    this.t = t + 1;
  }

  // Cross edges learn at their destination (core's hebbian rule runs where the signal
  // lands), but they fire from their source. The destination reports the weights it moved
  // and they are written back to the global connectome and to the source shard.
  _applyWeightBack() {
    const c = this.shadow.connectome;
    for (let s = 0; s < this.S; s++) {
      const wi = this.wbI32[s], wf = this.wbF32[s], n = wi[0];
      for (let i = 0; i < n; i++) {
        const ge = wi[1 + i * 2], val = wf[2 + i * 2];
        c.w[ge] = val;
        const src = this.shardOf[c.src[ge]];
        (this.wbFor[src] ??= []).push(ge, val);
      }
    }
  }

  // Rebuild the fired list in the exact order Brain._tick would have produced it:
  // regions in the order their first due cell appears, cells within a region in due order.
  _globalFired() {
    const S = this.S, key = this.cellKey, reg = this.regionOfCell;
    const useDue = !this.anyFiniteBudget;
    const slots = new Map(), order = [];
    const flag = this.firedFlag, touched = this.touched;
    let tn = 0;
    if (useDue) {
      for (let s = 0; s < S; s++) {
        const m = this.metaI32[s], cap = this.cellsPerShard[s], fn = m[1];
        for (let i = 0; i < fn; i++) { const g = m[2 + cap + i]; flag[g] = 1; touched[tn++] = g; }
      }
      if (tn === 0) return EMPTY;
    }
    for (let s = 0; s < S; s++) {
      const m = this.metaI32[s], cap = this.cellsPerShard[s];
      const n = useDue ? m[0] : m[1];
      const base = useDue ? 2 : 2 + cap;
      for (let i = 0; i < n; i++) {
        const g = m[base + i], r = reg[g];
        let slot = slots.get(r);
        if (slot === undefined) { slot = { min: key[g], list: [], home: s, split: false }; slots.set(r, slot); order.push(slot); }
        else { if (key[g] < slot.min) slot.min = key[g]; if (slot.home !== s) slot.split = true; }
        slot.list.push(g);
      }
    }
    order.sort((a, b) => a.min - b.min);
    const out = [];
    for (const slot of order) {
      const l = slot.split ? slot.list.sort((a, b) => key[a] - key[b]) : slot.list;
      if (useDue) { for (let i = 0; i < l.length; i++) if (flag[l[i]]) out.push(l[i]); }
      else for (let i = 0; i < l.length; i++) out.push(l[i]);
    }
    for (let i = 0; i < tn; i++) flag[touched[i]] = 0;
    return out;
  }

  // The structural block of a tick, run ONCE for the whole brain. core/brain.mjs now owns
  // that block as Brain._structural(t, fired) (the note in notes/runtime.md asked for it),
  // so the cluster calls core's version on the shadow instead of duplicating it. The only
  // thing left here is routing: an edge core just grew has to reach the one or two shards
  // that own its endpoints, and the shadow's connectome is watched for new edges to find
  // them. The shadow's clock is advanced by hand because the shadow is never ticked.
  _structural(t, fired) {
    const sh = this.shadow;
    sh.ctx.t = t; sh.ctx.gen = sh.clock.gen;
    const before = sh.connectome.size();
    sh._structural(t, fired);
    for (let e = before; e < sh.connectome.size(); e++) {
      const c = sh.connectome;
      const srcG = c.src[e], dstG = c.dst[e], sp = c.srcPort[e], dp = c.dstPort[e];
      this.grownEdges++;
      const ss = this.shardOf[srcG], ds = this.shardOf[dstG];
      const cmd = [e, srcG, sp, dstG, dp, c.w[e], c.delay[e], c.conf[e], this.localOf[dstG], this._mask(dstG, dp)];
      (this.growFor[ss] ??= []).push(cmd);
      if (ds !== ss) { (this.growFor[ds] ??= []).push(cmd); this.crossEdges.push(e); this.crossEdgeCount++; }
      else this.inShardEdgeCount++;
    }
    sh.stats.ticks++;
    sh.clock.advance();
  }

  // In-shard edges are pruned by their own shard (it has the usage counters). Cross edges
  // are pruned here, from the usage the source shards report on prune ticks.
  _pruneCross(t, replies) {
    const c = this.shadow.connectome, sh = this.shadow;
    for (const r of replies) {
      if (!r.crossUsage) continue;
      for (let i = 0; i < r.crossUsage.length; i += 4) {
        const ge = r.crossUsage[i];
        c.usage[ge] = r.crossUsage[i + 1]; c.lastT[ge] = r.crossUsage[i + 2];
      }
    }
    for (const ge of this.crossEdges) {
      if (!(c.flags[ge] & ACTIVE)) continue;
      const stale = t - (c.lastT[ge] < 0 ? 0 : c.lastT[ge]);
      if (!(Math.abs(c.w[ge]) < 0.05 && (c.lastT[ge] < 0 || stale > this.spec.pruneEvery))) continue;
      const p = sh.gate.propose({ kind: 'edge.prune', what: { e: ge, src: sh.cells[c.src[ge]].id, dst: sh.cells[c.dst[ge]].id }, why: 'stale+weak', evidence: { staleTicks: stale, w: c.w[ge] }, by: 'prune' }, sh.ctx);
      if (p.status !== 'approved') continue;
      c.prune(ge); this.prunedEdges++;
      const ss = this.shardOf[c.src[ge]], ds = this.shardOf[c.dst[ge]];
      (this.pruneFor[ss] ??= []).push(ge);
      if (ds !== ss) (this.pruneFor[ds] ??= []).push(ge);
    }
  }

  // ------------------------------------------------------------ observation
  async stats() {
    this._need();
    const ctl = this.ctl, S = this.S;
    const shards = [];
    let runs = 0, signals = 0, delivered = 0, crossOut = 0, crossIn = 0, refused = 0, errors = 0;
    for (let s = 0; s < S; s++) {
      const r = {
        shard: s,
        cells: Atomics.load(ctl, shardSlot(s, SH.CELLS)),
        edges: Atomics.load(ctl, shardSlot(s, SH.EDGES)),
        runs: Atomics.load(ctl, shardSlot(s, SH.RUNS)),
        signals: Atomics.load(ctl, shardSlot(s, SH.SIGNALS)),
        delivered: Atomics.load(ctl, shardSlot(s, SH.DELIVERED)),
        crossOut: Atomics.load(ctl, shardSlot(s, SH.CROSS_OUT)),
        crossIn: Atomics.load(ctl, shardSlot(s, SH.CROSS_IN)),
        lastTick: Atomics.load(ctl, shardSlot(s, SH.TICK)),
        refused: Atomics.load(ctl, shardSlot(s, SH.REFUSED)),
        errors: Atomics.load(ctl, shardSlot(s, SH.ERRORS)),
        // Microseconds this shard has spent inside step() since it started, and the part of
        // that which was drainIncoming. A caller that reads these before and after a timed
        // run gets the compute half of the tick; the rest of the wall clock is the fence.
        busyUs: Atomics.load(ctl, shardSlot(s, SH.BUSY_US)),
        drainUs: Atomics.load(ctl, shardSlot(s, SH.DRAIN_US)),
      };
      runs += r.runs; signals += r.signals; delivered += r.delivered; crossOut += r.crossOut; crossIn += r.crossIn;
      refused += r.refused; errors += r.errors;
      shards.push(r);
    }
    return {
      t: this.t, shards: S, cells: this.shadow.cells.length,
      edges: this.shadow.connectome.size(), liveEdges: this.shadow.connectome.live(),
      inShardEdges: this.inShardEdgeCount, crossEdges: this.crossEdgeCount,
      runs, signals, delivered, refused, errors,
      crossMessages: crossOut, crossDelivered: crossIn,
      cloned: Atomics.load(ctl, CTL.CLONED), overflow: Atomics.load(ctl, CTL.OVERFLOW),
      grown: this.grownEdges, pruned: this.prunedEdges,
      arrived: Atomics.load(ctl, CTL.ARRIVED),
      sharedBytes: this.sharedBytes,
      gate: { ...this.shadow.gate.stats },
      coord: { ...this.coord },
      per: shards,
    };
  }

  // Per cell run and fire counts for the whole brain, in global cell order. This is the
  // cheap proof that a sharded run is the single process run: the cell that fired, fired.
  async counts() {
    this._need();
    const n = this.shadow.cells.length;
    const runs = new Int32Array(n), fired = new Int32Array(n);
    for (const p of await this._all('counts', () => ({ cmd: 'counts', id: 'counts' }))) {
      for (let i = 0; i < p.g.length; i++) { runs[p.g[i]] = p.runs[i]; fired[p.g[i]] = p.fired[i]; }
    }
    return { runs, fired };
  }

  async snapshot() {
    this._need();
    const parts = await this._all('snapshot', () => ({ cmd: 'snapshot', id: 'snap' }));
    const cells = new Array(this.shadow.cells.length);
    let inflight = 0, outbox = 0;
    const per = [];
    for (const p of parts.sort((a, b) => a.shard - b.shard)) {
      for (const { g, j } of p.cells) cells[g] = j;
      inflight += p.inflight; outbox += p.outbox;
      per.push({ shard: p.shard, t: p.t, cells: p.cells.length, edges: p.edges, stats: p.stats, gate: p.gate, ledger: p.ledger, inflight: p.inflight });
    }
    return {
      version: 1, name: this.spec.name, t: this.t, shards: this.S,
      partition: Array.from(this.shardOf), cells,
      connectome: this.shadow.connectome.serialize(),
      gate: this.shadow.gate.serialize(),
      stats: await this.stats(), inflight, outbox, per,
    };
  }

  async stop() {
    if (!this.started || this.stopped) return this;
    this.stopped = true;
    try { await this._all('stopped', () => ({ cmd: 'stop' })); } catch { /* a dead worker still gets terminated */ }
    await Promise.all(this.workers.map(w => w.terminate()));
    this.workers = [];
    return this;
  }

  // the kinds a destination in-port accepts, as a bitmask that can cross a thread boundary
  _mask(globalCell, port) { return kindMask(this.shadow.cells[globalCell].ports.in[port].kinds); }

  _need() { if (!this.started) throw new Error('cluster: call start() first'); if (this.stopped) throw new Error('cluster: stopped'); }
}

const EMPTY = [];

// Convenience for a CLI or a bench: build, run, report, tear down.
export async function runCluster(spec, { shards = 4, ticks = 1, inject = null, ...opts } = {}) {
  const c = new Cluster(spec, { shards, ...opts });
  await c.start();
  if (inject) await c.injectMany(inject);
  const t0 = process.hrtime.bigint();
  await c.tick(ticks);
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  const stats = await c.stats();
  await c.stop();
  return { seconds, stats };
}

export const shardEntry = path.resolve(fileURLToPath(SHARD_URL));
export { REC };
