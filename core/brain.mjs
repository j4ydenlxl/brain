// core/brain.mjs: THE ORGANISM. Regions of circuits of cells, wired by a dynamic
// connectome, driven by a two-axis clock, funded by an attention scheduler, changed
// only through the gate, and recorded event by event in the ledger.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { RNG } from './rng.mjs';
import { signal, activity, hashSignal, signalToJSON, signalFromJSON, ownPayload, dropPayload } from './signal.mjs';
import { createCell, runCell, getKind, portIndex, serializeCell, deserializeCell } from './cell.mjs';
import { Connectome, CoActivation, ACTIVE } from './connectome.mjs';
import { Clock } from './clock.mjs';
import { Ledger } from './ledger.mjs';
import { Gate, makePolicy } from './gate.mjs';
import { Scheduler } from './scheduler.mjs';
import { writeJSONStreamed, readJSONStreamed, writeCheckpoint, writeCheckpointStreamed } from './persist.mjs';

export class Brain {
  constructor({ name = 'brain', seed = name, dir = null, ledger = 'full', policy = null, hebbian = { eta: 1e-2, alpha: 1e-4 }, pruneEvery = 1000, growth = {}, gate = {}, ledgerRing = 100_000, connectomeCapacity = 1024, outboxRing = 4096 } = {}) {
    this.name = name; this.dir = dir;
    this.rng = new RNG(seed);
    this.regions = new Map(); this.circuits = new Map();
    this.cells = []; this.byId = new Map();
    this.connectome = new Connectome(connectomeCapacity); // small for a throwaway episode brain (generations note 2)
    this.clock = new Clock();
    this.ledger = new Ledger({ dir: dir ? path.join(dir, 'ledger') : null, ring: ledgerRing });
    this.ledgerLevel = ledger; // 'full' | 'runs' | 'off'
    this.coact = new CoActivation(growth);
    this.gate = new Gate({ ledger: this.ledger, policy: policy || makePolicy(gate) }); // the gate's bar is its own argument, never derived from the growth tracker
    this.scheduler = new Scheduler();
    this.hebbian = hebbian; this.pruneEvery = pruneEvery;
    this.inflight = new Map(); // arriveAt -> [{ sig, w, e, from, dst, dstPort }]
    this.outbox = []; this.outboxRing = outboxRing; // unrouted signals wait here for takeOutbox(); bounded, or a persistent run grows without end (soak 2026-09-17: 47 per tick, 8 KB each)
    this.stats = { ticks: 0, runs: 0, signals: 0, delivered: 0, grown: 0, pruned: 0, errors: 0, refused: 0, outboxDropped: 0, mailDropped: 0 };
    this.lastError = null;
    this.drainedT = -1; // the latest tick whose inflight bucket has been delivered
    this.ctx = { brain: this, t: 0, gen: 0, rng: this.rng, ledger: this.ledger, emit: null };
    // afterTick(brain); snapshot(brain) -> object merged into snapshot.extras; restore(brain, extras)
    this.hooks = { afterTick: [], snapshot: [], restore: [] };
  }

  // ------------------------------------------------------------ structure
  addRegion(name, { budget = Infinity, doc = '' } = {}) {
    if (this.regions.has(name)) return this.regions.get(name);
    const r = { name, budget, doc, circuits: new Set(), cells: new Set(), bus: [] };
    this.regions.set(name, r);
    this.log({ type: 'region.add', region: name, budget: Number.isFinite(budget) ? budget : 'inf' });
    return r;
  }
  addCircuit(region, name, { period = 1, doc = '' } = {}) {
    const key = region + '/' + name;
    if (this.circuits.has(key)) return this.circuits.get(key);
    this.addRegion(region);
    const c = { key, name, region, period, doc, cells: new Set(), working: [] };
    this.circuits.set(key, c);
    this.regions.get(region).circuits.add(key);
    this.log({ type: 'circuit.add', circuit: key, period });
    return c;
  }
  addCell(spec) {
    if (this.byId.has(spec.id)) throw new Error('duplicate cell id ' + spec.id);
    const cell = createCell(spec);
    cell.idx = this.cells.length;
    this.cells.push(cell); this.byId.set(cell.id, cell);
    this.addCircuit(cell.region, cell.circuit).cells.add(cell.idx);
    this.regions.get(cell.region).cells.add(cell.idx);
    this.clock.register(cell);
    this.log({ type: 'cell.add', cell: cell.id, idx: cell.idx, kind: cell.kind, region: cell.region, circuit: cell.circuit, period: cell.policy.period });
    return cell;
  }
  cell(id) { const c = typeof id === 'number' ? this.cells[id] : this.byId.get(id); if (!c) throw new Error('no cell ' + id); return c; }
  _port(cell, dir, p) { return typeof p === 'number' ? p : portIndex(cell.kind, dir, p); }
  // Wire src.out -> dst.in. Refused at wiring time if the kinds cannot meet.
  connect(srcId, srcPort, dstId, dstPort, opts = {}) {
    const a = this.cell(srcId), b = this.cell(dstId);
    const sp = this._port(a, 'out', srcPort), dp = this._port(b, 'in', dstPort);
    const outKinds = a.ports.out[sp].kinds, inKinds = b.ports.in[dp].kinds;
    // Refused at wiring time when no kind can meet; a polymorphic port (a source that emits
    // whatever it is configured with) may wire to a narrower port, and each signal is then
    // checked at emit time and refused there if its kind does not fit (stats.refused).
    if (!outKinds.some(k => inKinds.includes(k))) throw new Error('connect ' + a.id + '.' + a.ports.out[sp].name + ' -> ' + b.id + '.' + b.ports.in[dp].name + ': kinds ' + outKinds.join('|') + ' not accepted (cannot meet ' + inKinds.join('|') + ')');
    const existing = this.connectome.find(a.idx, b.idx, sp, dp);
    if (existing >= 0) return existing;
    const e = this.connectome.add(a.idx, b.idx, { srcPort: sp, dstPort: dp, ...opts });
    if (opts.by === 'growth') this.stats.grown++;
    this.log({ type: 'edge.add', e, src: a.id, dst: b.id, srcPort: sp, dstPort: dp, w: this.connectome.w[e], delay: this.connectome.delay[e], by: opts.by || 'wire' });
    return e;
  }
  // Find a compatible port pair between two cells (used by growth). Returns [sp, dp] or null.
  compatiblePorts(a, b) {
    for (let sp = 0; sp < a.ports.out.length; sp++) for (let dp = 0; dp < b.ports.in.length; dp++) {
      if (a.ports.out[sp].kinds.every(k => b.ports.in[dp].kinds.includes(k))) return [sp, dp];
    }
    return null;
  }

  // ------------------------------------------------------------ signals
  log(ev) { if (this.ledgerLevel === 'off') return -1; return this.ledger.append({ t: this.clock.t, gen: this.clock.gen, ...ev }); }
  // External input: deliver a signal to a cell port now (or after delay).
  inject(cellId, port, { kind, data }, { delay = 0, w = 1 } = {}) {
    const c = this.cell(cellId), dp = this._port(c, 'in', port);
    if (!c.ports.in[dp].kinds.includes(kind)) throw new Error('inject: ' + c.id + '.' + c.ports.in[dp].name + ' does not accept ' + kind);
    const seq = this.ledgerLevel === 'full' ? this.log({ type: 'signal', from: null, cell: 'external', port: dp, kind, hash: hashSignalSafe(kind, data) }) : -1;
    const sig = signal(kind, data, { t: this.clock.t, gen: this.clock.gen, src: -1, port: dp, seq });
    this._schedule(this.clock.t + delay, { sig, w, e: -1, from: -1, dst: c.idx, dstPort: dp });
    return sig;
  }
  // A schedule for a tick whose bucket was already drained (an inject from a hook or a cell
  // during the tick) lands on the next tick instead of vanishing.
  _schedule(at, item) { if (at <= this.drainedT) at = this.drainedT + 1; let l = this.inflight.get(at); if (!l) { l = []; this.inflight.set(at, l); } l.push(item); }
  // A port holds at most cell.policy.mailCap items: past that the oldest are dropped, so a
  // cell on a slow period fed by a fast source stays bounded instead of hoarding every arrival
  // (notes/whole.md request 1: 11,534 mailbox items at t=500 growing to 50,894 at t=4000).
  // The default is undefined, which is unbounded: nothing changes for a cell that sets none.
  _deliver(t) {
    this.drainedT = t;
    const l = this.inflight.get(t);
    if (!l) return;
    this.inflight.delete(t);
    for (const it of l) {
      const c = this.cells[it.dst], q = c.mailbox[it.dstPort];
      q.push(it); this.stats.delivered++;
      const cap = c.policy.mailCap;
      // a dropped mail has left the mailbox as surely as a consumed one, so the payload it
      // still owns goes back here: without this a capped port would leak every slot it drops
      if (typeof cap === 'number' && q.length > cap) { const over = q.length - cap; for (const d of q.splice(0, over)) dropPayload(d.sig); this.stats.mailDropped += over; }
    }
  }
  _emit(cell, p, out, runSeq) {
    const seq = this.ledgerLevel === 'full' ? this.log({ type: 'signal', from: runSeq, cell: cell.id, port: p, kind: out.kind, hash: hashSignalSafe(out.kind, out.data) }) : -1;
    const sig = signal(out.kind, out.data, { t: this.clock.t, gen: this.clock.gen, src: cell.idx, port: p, seq });
    this.stats.signals++;
    let routed = 0;
    for (const e of this.connectome.outOf(cell.idx)) {
      if (this.connectome.srcPort[e] !== p || !(this.connectome.flags[e] & ACTIVE)) continue;
      const dstCell = this.cells[this.connectome.dst[e]];
      if (!dstCell.ports.in[this.connectome.dstPort[e]].kinds.includes(out.kind)) { this.stats.refused++; if (this.ledgerLevel !== 'off') this.log({ type: 'signal.refused', e, from: cell.id, to: dstCell.id, kind: out.kind }); continue; }
      this.connectome.touch(e, this.clock.t);
      // A signal takes at least one tick to travel; edge delay adds to that. The bucket for
      // the current tick was drained at the start of this tick, so t + 0 would be lost.
      this._schedule(this.connectome.arrival(e, this.clock.t), { sig, w: this.connectome.w[e], e, from: cell.idx, dst: this.connectome.dst[e], dstPort: this.connectome.dstPort[e] });
      routed++;
    }
    if (routed === 0) { this.outbox.push(sig); if (this.outbox.length > this.outboxRing) { const over = this.outbox.length - this.outboxRing; this.outbox.splice(0, over); this.stats.outboxDropped += over; } }
    // The payload contract (core/signal.mjs): a producer that marks own has made this vector
    // fresh this run and keeps no reference to it, so the signal owns it for as many mailboxes
    // as it was scheduled to, and the last one to consume it returns the slot. A signal that
    // routed nowhere is in the outbox, which an external caller drains, so it is left alone.
    if (routed > 0 && out.own === true) ownPayload(sig, routed);
    return sig;
  }

  // ------------------------------------------------------------ the tick
  tick(n = 1) {
    for (let i = 0; i < n; i++) this._tick();
    return this;
  }
  _tick() {
    const t = this.clock.t;
    this.ctx.t = t; this.ctx.gen = this.clock.gen;
    this._deliver(t);
    // due: periodic cells at t, plus event cells with mail
    const dueIdx = this.clock.due(t);
    const due = [];
    for (const idx of dueIdx) due.push(this.cells[idx]);
    for (const idx of this.clock.eventCells) { const c = this.cells[idx]; if (c.mailbox.some(m => m.length)) due.push(c); }
    const { run } = this.scheduler.allocate(due, this.regions);
    const fired = [];
    for (const cell of run) {
      const ins = cell.mailbox;
      cell.mailbox = cell.ports.in.map(() => []);
      const consumed = [];
      if (this.ledgerLevel === 'full') for (const m of ins) for (const it of m) if (it.sig.seq >= 0) consumed.push(it.sig.seq);
      const outs = runCell(cell, ins, this.ctx);
      this.stats.runs++;
      const runSeq = this.ledgerLevel !== 'off' ? this.log({ type: 'cell.run', cell: cell.id, idx: cell.idx, consumed, nin: consumed.length, out: outs.map(o => o ? o.kind : null), surprise: cell.stats.surprise }) : -1;
      let firedHere = false;
      for (let p = 0; p < outs.length; p++) if (outs[p] != null) { this._emit(cell, p, outs[p], runSeq); firedHere = true; }
      if (firedHere) fired.push(cell.idx);
      // local edge learning (hebbian on the edges that delivered to this cell)
      // skipped when a learning engine is attached: its registry owns every rule named by a policy
      if (cell.policy.learn === 'hebbian' && !this.ctx.learning) {
        const post = firedHere ? 1 : 0;
        for (const m of ins) for (const it of m) if (it.e >= 0) this.connectome.strengthen(it.e, activity(it.sig), post, this.hebbian.eta, this.hebbian.alpha);
      }
      // circuit working memory keeps the last outputs (ring of 32)
      const circ = this.circuits.get(cell.region + '/' + cell.circuit);
      if (circ && firedHere) { circ.working.push({ t, cell: cell.id }); if (circ.working.length > 32) circ.working.shift(); }
      // The mail this cell was given has left its mailbox: every payload still owned by a
      // signal whose last copy this was goes back to the heap now. A vector the cell passed
      // straight through (it emitted the same array it was handed) travels on with the new
      // signal and is not released here, so a pass through cannot hand anybody a freed slot.
      let passed = null;
      for (let p = 0; p < outs.length; p++) { const o = outs[p]; if (o != null && o.kind === 'hv') (passed || (passed = new Set())).add(o.data); }
      for (const m of ins) for (const it of m) if (!(passed && passed.has(it.sig.data))) dropPayload(it.sig);
    }
    this._structural(t, fired);
    this.lastFired = fired;
    for (const fn of this.hooks.afterTick) fn(this, t, fired);
    this.stats.ticks++;
    this.clock.advance();
  }

  // Structural block of a tick: growth through the gate, co-activation decay, pruning.
  // Public so a cluster runs it ONCE for the whole brain on a shadow Brain (runtime note).
  _structural(t, fired) {
    // growth from co-activation, through the gate
    for (const [a, b, c] of (this.coact.enabled ? this.coact.observe(fired, this.connectome, this.rng) : [])) {
      const A = this.cells[a], B = this.cells[b];
      let src = A, dst = B, pp = this.compatiblePorts(A, B);
      if (!pp) { src = B; dst = A; pp = this.compatiblePorts(B, A); }
      if (!pp) continue;
      const p = this.gate.propose({ kind: 'edge.grow', what: { src: src.id, dst: dst.id, srcPort: pp[0], dstPort: pp[1] }, why: 'co-activation', evidence: { coActivations: c }, by: 'coact' }, this.ctx);
      if (p.status === 'approved') this.connect(src.id, pp[0], dst.id, pp[1], { w: 0.1, conf: 0.2, by: 'growth' });
    }
    if (t > 0 && t % 64 === 0) this.coact.decay();
    // pruning, through the gate
    if (this.pruneEvery && t > 0 && t % this.pruneEvery === 0) {
      for (const e of this.connectome.pruneCandidates(t, { staleTicks: this.pruneEvery })) {
        const p = this.gate.propose({ kind: 'edge.prune', what: { e, src: this.cells[this.connectome.src[e]].id, dst: this.cells[this.connectome.dst[e]].id }, why: 'stale+weak', evidence: { staleTicks: t - (this.connectome.lastT[e] < 0 ? 0 : this.connectome.lastT[e]), w: this.connectome.w[e] }, by: 'prune' }, this.ctx);
        if (p.status === 'approved') { this.connectome.prune(e); this.stats.pruned++; this.log({ type: 'edge.prune', e }); }
      }
    }
  }

  // ------------------------------------------------------------ inspection
  inspect(id) {
    const c = this.cell(id);
    const edgesOut = [...this.connectome.outOf(c.idx)].map(e => this.connectome.edge(e)).map(e => ({ ...e, dst: this.cells[e.dst].id }));
    const edgesIn = [...this.connectome.into(c.idx)].map(e => this.connectome.edge(e)).map(e => ({ ...e, src: this.cells[e.src].id }));
    return { ...serializeCell(c), mailbox: c.mailbox.map(m => m.length), edgesOut, edgesIn };
  }
  summary() {
    const regions = {};
    for (const [n, r] of this.regions) regions[n] = { cells: r.cells.size, circuits: r.circuits.size, budget: Number.isFinite(r.budget) ? r.budget : 'inf' };
    // queued mail per cell, and the three fullest cells: the soak of 2026-09-17 grew by
    // 100 MB a minute with the outbox capped, so status has to show where signals wait
    let mail = 0; const mailTop = [];
    for (const c of this.cells) {
      let n = 0;
      if (c.mailbox) for (const q of c.mailbox) if (q) n += q.length;
      mail += n;
      if (n > 0 && (mailTop.length < 3 || n > mailTop[mailTop.length - 1].mail)) {
        if (mailTop.length === 3) mailTop.pop();
        mailTop.push({ id: c.id, mail: n });
        mailTop.sort((a, b) => b.mail - a.mail);
      }
    }
    return { name: this.name, t: this.clock.t, gen: this.clock.gen, cells: this.cells.length, edges: this.connectome.size(), liveEdges: this.connectome.live(), regions, stats: this.stats, scheduler: this.scheduler.stats, gate: this.gate.stats, connectome: this.connectome.stats, ledger: this.ledger.seq, outbox: this.outbox.length, mail, mailTop };
  }
  takeOutbox() { const o = this.outbox; this.outbox = []; return o; }

  // ------------------------------------------------------------ persistence
  // `version` picks the checkpoint format. 3 is the default and the only one anything should
  // write; 2 is kept writable so a bench can measure the two formats as interleaved arms of one
  // run and a test can build a format 2 fixture with the current code rather than a stale file.
  //
  // `container` picks the FILE: 1 is JSON text (the document versions above), 2 is the binary
  // checkpoint of core/persist.mjs writeCheckpoint (the version 3 document, every hypervector
  // bit packed, edges and cell state as typed arrays, a small JSON header carrying `ruler`).
  // A caller that names `version` gets the JSON file it named, so every bench and test that
  // measures format 2 against format 3 keeps measuring exactly that; a caller that names
  // neither gets this brain's `checkpointContainer` (seeds/whole.mjs sets 2 on every whole
  // organism) or 1. `ruler` (else this.ruler) is written into the container 2 header as it is.
  // `stream: true` (container 2 only; board 19 builder, the fit item) writes the SAME bytes through
  // core/persist.mjs writeCheckpointStreamed: the document's big lists (cells, mailboxes,
  // inflight, outbox) are lazy, one element serialized at a time as the walk reaches it, and the
  // sections go to disk in bounded blocks, so the checkpoint never holds the snapshot twice.
  // The daemon asks for it (daemon/run.mjs, BRAIN_CHECKPOINT_STREAM); every other caller gets
  // exactly the path it had.
  snapshot(dir = this.dir, { version, container, ruler, stream = false } = {}) {
    if (!dir) throw new Error('snapshot: no dir');
    const box = container !== undefined ? container : (version !== undefined ? 1 : (this.checkpointContainer || 1));
    if (box !== 1 && box !== 2) throw new Error('snapshot: container must be 1 or 2, got ' + box);
    if (version === undefined) version = 3;
    if (version !== 2 && version !== 3) throw new Error('snapshot: version must be 2 or 3, got ' + version);
    if (box === 2 && version !== 3) throw new Error('snapshot: container 2 holds a version 3 document, got version ' + version);
    mkdirSync(dir, { recursive: true });
    this.ledger.flush();
    const streamed = box === 2 && stream === true;
    const j = this.snapshotDoc(version, { lazy: streamed });
    const file = path.join(dir, 'snapshot.json');
    if (box === 2) this.lastCheckpoint = (streamed ? writeCheckpointStreamed : writeCheckpoint)(file, j, { ruler: ruler || this.ruler || null }).header; // atomic, like the JSON writer
    else writeJSONStreamed(file, j, { intern: version >= 3 }); // streamed and atomic: no single string, and a failed write keeps the last good checkpoint
    this.log(box === 2 ? { type: 'snapshot', dir, version, container: box } : { type: 'snapshot', dir, version });
    return path.join(dir, 'snapshot.json');
  }
  // The snapshot document (board 19 builder: moved out of snapshot() unchanged, so the streamed
  // writer and the test can build it). `lazy` makes cells, mailboxes, inflight and outbox lazy
  // lists (lazyList below): the same length, the same element at each index, built only when the
  // walk reads it, so no second copy of the organism is ever held. Serialization here reads
  // state and changes none, so building an element later in the same synchronous call gives the
  // element the eager list would have held (test/cloud-fit-stream.test.mjs compares the bytes).
  snapshotDoc(version = 3, { lazy = false } = {}) {
    let inflight;
    if (lazy) {
      const flat = [];
      for (const [at, l] of this.inflight) for (const it of l) flat.push([at, it]);
      inflight = lazyList(flat, ([at, it]) => ({ at, sig: signalToJSON(it.sig), w: it.w, e: it.e, from: it.from, dst: it.dst, dstPort: it.dstPort }));
    } else {
      inflight = [];
      for (const [at, l] of this.inflight) for (const it of l) inflight.push({ at, sig: signalToJSON(it.sig), w: it.w, e: it.e, from: it.from, dst: it.dst, dstPort: it.dstPort });
    }
    const each = lazy ? lazyList : (arr, fn) => arr.map((x) => fn(x));
    const j = {
      // version 2 adds `coact` (the co-activation counters) and `ledger` (the seq this brain's
      // ledger had reached), both optional: a version 1 file restores exactly as it always did.
      // version 3 changes nothing in this object. It is core/persist.mjs writing the same
      // sections with every repeated payload string held once in a deflated blob table, and the
      // reader puts them back before restore ever sees the document, so the three versions
      // restore through the same code below.
      version, name: this.name, clock: this.clock.serialize(), rng: this.rng.serialize(),
      regions: [...this.regions.values()].map(r => ({ name: r.name, budget: Number.isFinite(r.budget) ? r.budget : null, doc: r.doc })),
      circuits: [...this.circuits.values()].map(c => ({ name: c.name, region: c.region, period: c.period, doc: c.doc, working: c.working })),
      cells: each(this.cells, serializeCell),
      connectome: this.connectome.serialize(),
      // The counters that drive structural growth travel with the connectome they will change,
      // and the ledger seq travels with them, so a restored brain's ledger is continuous with
      // the one it came from (notes/lab.md requests 2 and 3). Both are sections of the same
      // streamed document: neither is ever built as a second copy of the snapshot.
      coact: this.coact.serialize(),
      ledger: { seq: this.ledger.seq },
      // The runtime the brain was constructed with. Before this section a restore took the
      // constructor defaults, so an organism built with pruneEvery 0 (seeds/organism.mjs) came
      // back pruning every 1000 ticks: bench/compress.mjs measured it on a 12 major whole at
      // t=2000, the restored organism pruned 15 edges on the first replay tick that the live one
      // never proposed, and matched it on 0 of 200 tick digests. Optional like coact: a file
      // without it restores with the defaults, and a caller that names an option still wins.
      runtime: { pruneEvery: this.pruneEvery, hebbian: this.hebbian, outboxRing: this.outboxRing, growth: { enabled: this.coact.enabled, window: this.coact.window, threshold: this.coact.threshold, maxPairs: this.coact.maxPairs, sampleBudget: this.coact.sampleBudget } },
      gate: this.gate.serialize(), stats: this.stats, inflight,
      outbox: each(this.outbox, signalToJSON),
      // a capped port serializes its last mailCap items only, so a snapshot can never be
      // larger than the mail the organism is allowed to hold
      mailboxes: each(this.cells, c => c.mailbox.map(m => capMail(m, c.policy.mailCap).map(it => ({ sig: signalToJSON(it.sig), w: it.w, e: it.e, from: it.from })))),
      extras: {},
    };
    for (const h of this.hooks.snapshot) Object.assign(j.extras, h(this) || {});
    return j;
  }
  // The argument order is part of the contract: `dir` first, `opts` spread after it, so a
  // caller can pass { dir: null } and get a brain that reads the snapshot in `dir` and writes
  // nothing back into it. A read only replay depends on that (notes/lab.md request 5): with
  // the order reversed it would append to the recording's own ledger and destroy the thing it
  // is checking. Do not swap them.
  static restore(dir, opts = {}) {
    const file = path.join(dir, 'snapshot.json');
    if (!existsSync(file)) throw new Error('no snapshot at ' + file);
    const j = readJSONStreamed(file); // any size: a whole-file string would fail past 512 MB (the soak's t=1000 snapshot was 615 MB)
    const rt = j.runtime || {}, recorded = {};
    for (const k of ['pruneEvery', 'hebbian', 'outboxRing', 'growth']) if (rt[k] !== undefined) recorded[k] = rt[k];
    const b = new Brain({ name: j.name, dir, ...recorded, ...opts });
    b.ledgerLevel = 'off';
    b.rng = RNG.from(j.rng); b.ctx.rng = b.rng;
    b.clock = new Clock(j.clock);
    for (const r of j.regions) b.addRegion(r.name, { budget: r.budget ?? Infinity, doc: r.doc });
    for (const c of j.circuits) { const cc = b.addCircuit(c.region, c.name, { period: c.period, doc: c.doc }); cc.working = c.working || []; }
    for (const cj of j.cells) {
      const cell = deserializeCell(cj);
      b.cells.push(cell); b.byId.set(cell.id, cell);
      b.circuits.get(cell.region + '/' + cell.circuit).cells.add(cell.idx);
      b.regions.get(cell.region).cells.add(cell.idx);
      b.clock.register(cell);
    }
    b.connectome = Connectome.from(j.connectome);
    // The co-activation counters come back with the connectome, so a brain restored part way
    // to a growth threshold crosses it where the original did instead of starting again at
    // zero. A version 1 snapshot has no section and the counters stay empty.
    if (j.coact) b.coact.restore(j.coact);
    b.gate.restore(j.gate); b.stats = j.stats;
    // A restored payload is a fresh vector nothing else holds, so the signal that carries it
    // owns it for its one mailbox, exactly as an emitted one does: the cell that consumes it
    // returns the slot. Nothing about what the snapshot writes or reads changes here.
    for (const it of j.inflight) { const sig = signalFromJSON(it.sig); ownPayload(sig, 1); b._schedule(it.at, { sig, w: it.w, e: it.e, from: it.from, dst: it.dst, dstPort: it.dstPort }); }
    b.outbox = (j.outbox || []).map(signalFromJSON); if (b.outbox.length > b.outboxRing) { b.stats.outboxDropped = (b.stats.outboxDropped || 0) + (b.outbox.length - b.outboxRing); b.outbox.splice(0, b.outbox.length - b.outboxRing); }
    // a snapshot written before a port was capped can carry more than the cap: the excess is
    // dropped here and counted, so the restored organism obeys its own policy from tick one
    (j.mailboxes || []).forEach((mb, idx) => {
      const cell = b.cells[idx], cap = cell.policy.mailCap;
      cell.mailbox = mb.map(m => { const kept = capMail(m, cap); b.stats.mailDropped = (b.stats.mailDropped || 0) + (m.length - kept.length); return kept.map(it => { const sig = signalFromJSON(it.sig); ownPayload(sig, 1); return { sig, w: it.w, e: it.e, from: it.from }; }); });
    });
    // The ledger continues from where the snapshot left it: the restore event takes the seq
    // the snapshot event took, so the two runs are one ledger and a seq is never spent twice
    // (notes/lab.md request 3). The counter only ever moves forward: a file backed ledger that
    // already resumed further ahead from its own tail keeps its own seq, so restoring into a
    // directory that has kept ticking cannot rewind it.
    const savedSeq = j.ledger && Number.isFinite(j.ledger.seq) ? j.ledger.seq : null;
    if (savedSeq !== null && savedSeq > b.ledger.seq) b.ledger.seq = savedSeq;
    b.ledgerLevel = opts.ledger || 'full';
    for (const h of (opts.hooks && opts.hooks.restore) || []) h(b, j.extras || {});
    b.log({ type: 'restore', dir });
    return b;
  }
}

function hashSignalSafe(kind, data) { try { return hashSignal({ kind, data }); } catch { return '?'; } }
// The last cap items of a port queue, or the queue itself when the cell sets no cap.
function capMail(m, cap) { return typeof cap === 'number' && m.length > cap ? m.slice(m.length - cap) : m; }
// A list that builds element i from src[i] when it is read (board 19 builder, the streamed
// checkpoint). Array.isArray holds and length is the source's, so core/persist.mjs walks it as
// the array it stands for; nothing is kept, a second read builds the element again.
function lazyList(src, fn) {
  return new Proxy(src, {
    get(t, k) {
      if (typeof k === 'string') { const i = k.length && k.length < 16 ? Number(k) : NaN; if (Number.isInteger(i) && i >= 0 && String(i) === k) return i < t.length ? fn(t[i]) : undefined; }
      return k === 'length' ? t.length : Reflect.get(t, k);
    },
  });
}
