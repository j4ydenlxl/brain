// simulate/workspace.mjs : THE GLOBAL WORKSPACE. Cells submit candidate signals with a
// salience onto their region's bus (core/brain.mjs gives every region a bus array). Once
// per tick a manager takes the top k by salience and broadcasts them to hub cells and to
// subscribers in any region, so a local result becomes available to the whole organism.
//
// The broadcast set is measured, not assumed. Its entropy over distinct contents says how
// much the workspace is actually carrying. When entropy collapses (every winner the same
// thing) for collapseTicks ticks in a row, an intrinsic drive injects a novelty signal and
// puts it on the bus at high salience, which breaks the loop from the inside.
//
// Injection uses delay >= 1 on purpose: the hook runs after this tick's delivery, so an
// injection at delay 0 would land on a tick that has already been delivered and never
// arrive. See notes/simulate.md.
import * as S from '../core/signal.mjs';

export function entropy(labels) {
  const n = labels.length;
  if (n <= 1) return 0;
  const counts = new Map();
  for (const l of labels) counts.set(l, (counts.get(l) || 0) + 1);
  let h = 0;
  for (const c of counts.values()) { const p = c / n; h -= p * Math.log2(p); }
  return h / Math.log2(n); // normalized: 1 when every winner is distinct, 0 when all equal
}

export class Workspace {
  constructor(brain, opts = {}) {
    this.brain = brain;
    this.k = opts.k ?? 3;
    this.regionNames = opts.regions ? [].concat(opts.regions) : null; // null means every region
    this.hubs = opts.hubs ? [].concat(opts.hubs) : [];
    this.subs = [];
    this.collapseThreshold = opts.collapseThreshold ?? 0.2;
    this.collapseTicks = opts.collapseTicks ?? 2;
    this.minWinners = opts.minWinners ?? 2;
    this.novelty = opts.novelty ?? null;            // { cell, port, kind } to inject into
    this.noveltyRegion = opts.noveltyRegion ?? null; // which bus the novelty competes on
    this.noveltySalience = opts.noveltySalience ?? 8;
    this.noveltySeed = opts.noveltySeed ?? 'workspace.novelty';
    this.historyMax = opts.history ?? 256;
    this.history = [];
    this.stats = { ticks: 0, submitted: 0, winners: 0, broadcasts: 0, refused: 0, collapses: 0, novelty: 0, lastEntropy: null };
    this._run = 0;
    this._hook = null;
  }

  subscribe(cell, port = 'in') { this.subs.push({ cell, port }); return this; }
  addHub(cell) { this.hubs.push(cell); return this; }
  regions() {
    if (!this.regionNames) return [...this.brain.regions.values()];
    return this.regionNames.map(n => { const r = this.brain.regions.get(n); if (!r) throw new Error('workspace: no region ' + n); return r; });
  }

  attach() {
    if (this._hook) return this;
    this._hook = (b, t) => this.step(b, t);
    this.brain.hooks.afterTick.push(this._hook);
    return this;
  }
  detach() {
    if (!this._hook) return this;
    const i = this.brain.hooks.afterTick.indexOf(this._hook);
    if (i >= 0) this.brain.hooks.afterTick.splice(i, 1);
    this._hook = null;
    return this;
  }

  step(brain, t) {
    this.stats.ticks++;
    const cands = [];
    for (const r of this.regions()) { for (const item of r.bus) cands.push(item); r.bus.length = 0; }
    this.stats.submitted += cands.length;
    if (!cands.length) { this._record({ t, winners: [], entropy: null, collapsed: false, novelty: false }); return; }

    cands.sort((a, b) => (b.salience - a.salience) || (a.idx - b.idx) || (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));
    const winners = cands.slice(0, this.k);
    this.stats.winners += winners.length;

    for (const w of winners) {
      for (const h of this.hubs) this._inject(brain, h, 'broadcast', w);
      for (const s of this.subs) { if (s.cell === w.cell) continue; this._inject(brain, s.cell, s.port, w); }
    }

    const h = entropy(winners.map(w => w.hash));
    this.stats.lastEntropy = h;
    const collapsed = winners.length >= this.minWinners && h <= this.collapseThreshold;
    this._run = collapsed ? this._run + 1 : 0;
    let fired = false;
    if (this._run >= this.collapseTicks) { this.stats.collapses++; fired = this._drive(brain, t); this._run = 0; }
    this._record({ t, winners: winners.map(w => ({ cell: w.cell, salience: w.salience, hash: w.hash, kind: w.kind })), entropy: h, collapsed, novelty: fired });
  }

  // The intrinsic drive: a fresh hypervector nothing in the workspace has seen, injected
  // at the configured target and entered on the bus at high salience so it wins next tick.
  _drive(brain, t) {
    const n = this.stats.novelty + 1;
    const hv = S.hvFromSeed(this.noveltySeed + ':' + n);
    this.stats.novelty = n;
    if (this.novelty) {
      const kind = this.novelty.kind ?? 'hv';
      const data = kind === 'hv' ? hv : { novelty: true, n, t };
      this._inject(brain, this.novelty.cell, this.novelty.port ?? 'in', { kind, data });
    }
    const name = this.noveltyRegion ?? this.regions()[0]?.name;
    const r = name ? brain.regions.get(name) : null;
    if (r) r.bus.push({ t: t + 1, cell: '(novelty)', idx: -1, salience: this.noveltySalience, kind: 'hv', data: hv, hash: S.hashData('hv', hv) });
    return true;
  }

  _inject(brain, cellId, port, item) {
    try {
      brain.inject(cellId, port, { kind: item.kind, data: item.data }, { delay: 1 });
      this.stats.broadcasts++;
      return true;
    } catch {
      this.stats.refused++; // a port that does not accept this kind is refused, never coerced
      return false;
    }
  }

  _record(row) { this.history.push(row); if (this.history.length > this.historyMax) this.history.shift(); }
  at(t) { return this.history.find(r => r.t === t) ?? null; }
  report() {
    return {
      ticks: this.stats.ticks, submitted: this.stats.submitted, winners: this.stats.winners,
      broadcasts: this.stats.broadcasts, refused: this.stats.refused,
      collapses: this.stats.collapses, novelty: this.stats.novelty,
      entropy: this.stats.lastEntropy, k: this.k,
    };
  }
}

// Convenience: put a workspace on a brain and wire it to hubs and subscribers in one call.
export function attachWorkspace(brain, opts = {}) {
  const ws = new Workspace(brain, opts);
  for (const s of opts.subscribers || []) ws.subscribe(s.cell ?? s, s.port ?? 'in');
  return ws.attach();
}
