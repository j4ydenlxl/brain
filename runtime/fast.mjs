// runtime/fast.mjs : THE SAME TICK, WITHOUT THE OVERHEAD.
//
// FastBrain is core's Brain with four hot methods overridden. It computes the same thing:
// same cells run on the same ticks, on the same mail, in the same order, with the same
// weights, and every counter in stats ends equal. What it removes is work that carried no
// information, measured with node --cpu-prof on the organism (40000 cells, 440578 edges):
//
//   1. the due list. core asks clock.due(t), which walks a Map of Sets, and then tests
//      every one of the event cells with mailbox.some(m => m.length): 40000 closure calls
//      per tick to find the few thousand cells that actually have mail. Here each period
//      is a prebuilt Int32Array and a delivery flags its destination, so the event scan is
//      a linear read of a Uint8Array.
//   2. the mailbox. core allocates a fresh array per in port per run (449169 runs over 25
//      ticks is 449169 allocations of a fresh array of arrays). Here each cell owns two
//      mailboxes and they swap, so an array is reused only after that cell has run again.
//   3. the out edges. core calls connectome.outOf(cell), which makes a subarray, then
//      filters it by source port for every emitted signal, then asks the destination cell
//      whether its in port accepts the kind with an Array.includes. Here there is one
//      Int32Array per (cell, port) and one precomputed kind mask per edge.
//   4. the bookkeeping. getKind(cell.kind) is a Map lookup per run; the circuit a fired
//      cell belongs to was found by building the string region + '/' + circuit and looking
//      it up in a Map, per fired cell per tick. Both are resolved once in prepare().
//
// What it may NOT remove is order. core's Scheduler.allocate regroups the due list by
// region even when every budget is Infinity, and that regrouping is the order the fired
// list ends up in, which is the order growth reads. Skipping it because nothing was being
// rationed grew 4105 edges where core grew 4096 (320 cell organism, 50 ticks). _byRegion
// reproduces it.
//
// It is not a different brain and it is not allowed to become one: test/speed.test.mjs
// ticks a Brain and a FastBrain side by side for 50 ticks of a self rewiring organism and
// compares every per cell run count, every per cell fire count, every edge weight and the
// whole stats object.
import { Brain } from '../core/brain.mjs';
import { ACTIVE } from '../core/connectome.mjs';
import { getKind } from '../core/cell.mjs';
import { KINDS, activity, hashSignal } from '../core/signal.mjs';

const hashSafe = (kind, data) => { try { return hashSignal({ kind, data }); } catch { return '?'; } };

const kindBit = (kind) => { const i = KINDS.indexOf(kind); return i < 0 ? 0 : 1 << i; };
const maskOf = (kinds) => { let m = 0; for (const k of kinds) m |= kindBit(k); return m; };

export class FastBrain extends Brain {
  constructor(opts = {}) {
    super(opts);
    this._ready = false;
    this._indexedCells = -1; this._indexedEdges = -1;
    this._fastStats = { rebuilds: 0, dueScans: 0 };
  }

  // Build every index. Safe to call at any time; the tick calls it when the structure has
  // changed under it (a grown edge, a new cell), which is how growth stays supported.
  prepare() {
    const n = this.cells.length, c = this.connectome;
    // per cell: kind definition, circuit object, spare mailbox, port count
    this.kindOf = new Array(n); this.circOf = new Array(n); this.spare = new Array(n);
    this.learnHebbian = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      const cell = this.cells[i];
      this.kindOf[i] = getKind(cell.kind);
      this.circOf[i] = this.circuits.get(cell.region + '/' + cell.circuit) || null;
      this.spare[i] = cell.ports.in.map(() => []);
      this.learnHebbian[i] = cell.policy.learn === 'hebbian' ? 1 : 0;
    }
    // per (cell, port): the edges that leave it, as one flat Int32Array with a pointer table
    let maxOut = 1;
    for (let i = 0; i < n; i++) if (this.cells[i].ports.out.length > maxOut) maxOut = this.cells[i].ports.out.length;
    this.maxOut = maxOut;
    const slots = n * maxOut;
    const ptr = new Int32Array(slots + 1);
    for (let e = 0; e < c.n; e++) ptr[c.src[e] * maxOut + c.srcPort[e] + 1]++;
    for (let s = 0; s < slots; s++) ptr[s + 1] += ptr[s];
    const list = new Int32Array(c.n), fill = ptr.slice();
    for (let e = 0; e < c.n; e++) list[fill[c.src[e] * maxOut + c.srcPort[e]]++] = e;
    this.outPtr = ptr; this.outList = list;
    // per edge: the kind mask of the destination port, so a refusal is a bit test
    const mask = new Int32Array(c.n);
    for (let e = 0; e < c.n; e++) mask[e] = maskOf(this.cells[c.dst[e]].ports.in[c.dstPort[e]].kinds);
    this.edgeMask = mask;
    // per period: the cells due on it, in registration order (core's order)
    this.periods = [...this.clock.wheel.keys()].sort((a, b) => a - b);
    this.periodCells = this.periods.map(p => Int32Array.from([...this.clock.wheel.get(p)].sort((a, b) => a - b)));
    this.eventCell = new Uint8Array(n);
    for (const idx of this.clock.eventCells) this.eventCell[idx] = 1;
    this.hasMail = new Uint8Array(n);
    for (let i = 0; i < n; i++) if (this.cells[i].mailbox.some(m => m.length)) this.hasMail[i] = 1;
    this.anyFiniteBudget = [...this.regions.values()].some(r => Number.isFinite(r.budget));
    // core's Scheduler.allocate buckets the due cells by region and then emits bucket by
    // bucket, which it does even when every budget is Infinity and nothing is being
    // rationed. The run order is therefore region grouped in first appearance order, not
    // raw due order, and the fired list handed to _structural inherits it. That order is
    // load bearing: CoActivation.observe pairs the fired list POSITIONALLY, so a different
    // order proposes different edges to the gate. Measured on a 320 cell organism over 50
    // ticks, running in raw due order grew 4105 edges where core grew 4096.
    const regionNames = [...this.regions.keys()];
    const regionIndex = new Map(regionNames.map((r, i) => [r, i]));
    this.regionIdx = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      const ri = regionIndex.get(this.cells[i].region);
      if (ri === undefined) throw new Error('fast: cell ' + this.cells[i].id + ' is in unregistered region ' + this.cells[i].region);
      this.regionIdx[i] = ri;
    }
    this.regionCount = regionNames.length;
    this.regionBucket = regionNames.map(() => []);
    this.regionSeen = new Uint8Array(this.regionCount);
    this.regionOrder = new Int32Array(this.regionCount);
    this._indexedCells = n; this._indexedEdges = c.n;
    this._ready = true;
    this._fastStats.rebuilds++;
    return this;
  }

  _stale() { return !this._ready || this.cells.length !== this._indexedCells || this.connectome.n !== this._indexedEdges; }

  // A delivery also marks the destination, which is what removes the per tick scan of
  // every event cell.
  _deliver(t) {
    this.drainedT = t;
    const l = this.inflight.get(t);
    if (l === undefined) return;
    this.inflight.delete(t);
    const cells = this.cells, mail = this.hasMail;
    for (let i = 0; i < l.length; i++) {
      const it = l[i];
      cells[it.dst].mailbox[it.dstPort].push(it);
      if (mail !== undefined) mail[it.dst] = 1;
    }
    this.stats.delivered += l.length;
  }

  _emit(cell, p, out, runSeq) {
    const kind = out.kind, bit = kindBit(kind);
    const seq = this.ledgerLevel === 'full' ? this.log({ type: 'signal', from: runSeq, cell: cell.id, port: p, kind, hash: hashSafe(kind, out.data) }) : -1;
    const sig = { kind, data: out.data, t: this.clock.t, gen: this.clock.gen, src: cell.idx, port: p, seq };
    this.stats.signals++;
    const c = this.connectome, t = this.clock.t;
    const slot = cell.idx * this.maxOut + p;
    const lo = this.outPtr[slot], hi = this.outPtr[slot + 1];
    let routed = 0;
    for (let k = lo; k < hi; k++) {
      const e = this.outList[k];
      if (!(c.flags[e] & ACTIVE)) continue;
      if (!(this.edgeMask[e] & bit)) {
        this.stats.refused++;
        if (this.ledgerLevel !== 'off') this.log({ type: 'signal.refused', e, from: cell.id, to: this.cells[c.dst[e]].id, kind });
        continue;
      }
      c.usage[e]++; c.lastT[e] = t;
      this._schedule(t + 1 + c.delay[e], { sig, w: c.w[e], e, from: cell.idx, dst: c.dst[e], dstPort: c.dstPort[e] });
      routed++;
    }
    if (routed === 0) this.outbox.push(sig);
    return sig;
  }

  _tick() {
    if (this._stale()) this.prepare();
    const t = this.clock.t;
    this.ctx.t = t; this.ctx.gen = this.clock.gen;
    this._deliver(t);

    // due: every numeric period that divides t, in ascending period order and index order
    // inside a period, then the event cells that hold mail, in index order. That is exactly
    // the order core/clock.mjs due() plus core's event scan produce.
    const due = [];
    const periods = this.periods, cells = this.cells;
    for (let pi = 0; pi < periods.length; pi++) {
      if (t % periods[pi] !== 0) continue;
      const l = this.periodCells[pi];
      for (let i = 0; i < l.length; i++) due.push(cells[l[i]]);
    }
    const hasMail = this.hasMail, eventCell = this.eventCell, n = cells.length;
    for (let i = 0; i < n; i++) if (hasMail[i] === 1 && eventCell[i] === 1) due.push(cells[i]);
    this._fastStats.dueScans++;

    // The attention economy only has something to decide when a region has a finite budget.
    // With every budget infinite core still reorders the due list into region groups, so
    // that grouping is reproduced here (see prepare) without the Map and the closure.
    let run;
    if (this.anyFiniteBudget) run = this.scheduler.allocate(due, this.regions).run;
    else {
      run = this.regionCount === 1 ? due : this._byRegion(due);
      this.scheduler.stats.ticks++; this.scheduler.stats.funded += run.length;
    }

    const fired = [];
    const full = this.ledgerLevel === 'full', anyLedger = this.ledgerLevel !== 'off';
    for (let ri = 0; ri < run.length; ri++) {
      const cell = run[ri], idx = cell.idx;
      const ins = cell.mailbox;
      cell.mailbox = this.spare[idx]; this.spare[idx] = ins;
      hasMail[idx] = 0;
      let consumed = null;
      if (full) { consumed = []; for (const m of ins) for (const it of m) if (it.sig.seq >= 0) consumed.push(it.sig.seq); }
      const outs = this._run(cell, ins);
      this.stats.runs++;
      const runSeq = anyLedger ? this.log({ type: 'cell.run', cell: cell.id, idx, consumed: consumed || [], nin: consumed ? consumed.length : 0, out: outs.map(o => o ? o.kind : null), surprise: cell.stats.surprise }) : -1;
      let firedHere = false;
      for (let p = 0; p < outs.length; p++) if (outs[p] != null) { this._emit(cell, p, outs[p], runSeq); firedHere = true; }
      if (firedHere) fired.push(idx);
      if (this.learnHebbian[idx] === 1 && !this.ctx.learning) {
        const post = firedHere ? 1 : 0;
        for (const m of ins) for (const it of m) if (it.e >= 0) this.connectome.strengthen(it.e, activity(it.sig), post, this.hebbian.eta, this.hebbian.alpha);
      }
      if (firedHere) {
        const circ = this.circOf[idx];
        if (circ) { circ.working.push({ t, cell: cell.id }); if (circ.working.length > 32) circ.working.shift(); }
      }
      // the mailbox this cell just consumed becomes its spare, emptied for the next run
      for (let q = 0; q < ins.length; q++) if (ins[q].length) ins[q].length = 0;
    }

    this._structural(t, fired);
    this.lastFired = fired;
    for (const fn of this.hooks.afterTick) fn(this, t, fired);
    this.stats.ticks++;
    this.clock.advance();
  }

  // Regroup a due list the way core's Scheduler.allocate does when nothing is rationed:
  // one bucket per region, buckets emitted in the order their first due cell appeared,
  // cells inside a bucket in due order. Buckets are reused arrays, so a tick allocates
  // only the output.
  _byRegion(due) {
    const rIdx = this.regionIdx, buckets = this.regionBucket, seen = this.regionSeen, order = this.regionOrder;
    let ro = 0;
    for (let i = 0; i < due.length; i++) {
      const cell = due[i], r = rIdx[cell.idx];
      if (seen[r] === 0) { seen[r] = 1; order[ro++] = r; buckets[r].length = 0; }
      buckets[r].push(cell);
    }
    if (ro === 1) { seen[order[0]] = 0; return buckets[order[0]]; }
    const run = [];
    for (let i = 0; i < ro; i++) {
      const b = buckets[order[i]];
      for (let j = 0; j < b.length; j++) run.push(b[j]);
      seen[order[i]] = 0;
    }
    return run;
  }

  // core/cell.mjs runCell, with the kind resolved from the table instead of a Map lookup
  // and without the two closures. The validation, the error path and the learn hook are
  // the same, in the same order.
  _run(cell, ins) {
    const kind = this.kindOf[cell.idx];
    let outs;
    try {
      outs = kind.compute(ins, cell, this.ctx) || [];
    } catch (err) {
      cell.stats.errors++;
      const msg = String(err && err.message || err);
      this.ledger?.append({ type: 'cell.error', cell: cell.id, t: this.ctx.t, gen: this.ctx.gen, error: msg });
      this.stats.errors = (this.stats.errors || 0) + 1;
      this.lastError = { cell: cell.id, t: this.ctx.t, error: msg };
      return [];
    }
    if (!Array.isArray(outs)) throw new Error('cell ' + cell.id + ': compute must return an array per out port');
    let any = false;
    for (let p = 0; p < outs.length; p++) {
      const o = outs[p];
      if (o == null) continue;
      any = true;
      const port = kind.ports.out[p];
      if (!port) throw new Error('cell ' + cell.id + ': emitted on undeclared out port ' + p);
      if (!port.kinds.includes(o.kind)) throw new Error('cell ' + cell.id + ': out port ' + port.name + ' declares ' + port.kinds.join('|') + ', got ' + o.kind);
    }
    cell.stats.runs++;
    cell.stats.lastT = this.ctx.t;
    cell.stats.cost += kind.cost * cell.policy.budget;
    if (any) cell.stats.fired++;
    if (kind.learn && cell.policy.learn !== false) {
      try { kind.learn(ins, outs, cell, this.ctx); } catch (err) { cell.stats.errors++; this.ledger?.append({ type: 'cell.learn.error', cell: cell.id, t: this.ctx.t, error: String(err && err.message || err) }); }
    }
    return outs;
  }

  fastStats() { return { ...this._fastStats, cells: this._indexedCells, edges: this._indexedEdges, maxOutPorts: this.maxOut, periods: this.periods.length }; }
}

/**
 * Turn an already built Brain into a FastBrain without rebuilding it. The organism costs
 * seconds to load, so a bench that wants both arms loads twice; a caller that only wants
 * the fast arm can hand its brain over here instead.
 * @param {Brain} brain
 * @returns {FastBrain}
 */
export function accelerate(brain) {
  const f = new FastBrain({ name: brain.name, seed: brain.name, ledger: 'off' });
  for (const k of Object.keys(brain)) f[k] = brain[k];
  f.ctx = { ...brain.ctx, brain: f };
  f._ready = false; f._indexedCells = -1; f._indexedEdges = -1;
  f._fastStats = { rebuilds: 0, dueScans: 0 };
  f.prepare();
  return f;
}
