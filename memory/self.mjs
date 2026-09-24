// memory/self.mjs. SELF MEMORY, the brain watching itself.
// Activity is bucketed into fixed time windows. Each window holds, per cell and per
// region, how many times it ran, how often it fired, what it cost, how many errors it
// raised and the mean surprise it reported. A bounded number of windows is kept, so the
// record is a moving picture of recent behaviour rather than an unbounded log. The
// ledger already holds the unbounded version.
export const SELF_DEFAULTS = Object.freeze({
  window: 1000,   // ticks per window
  keep: 64,       // windows retained, oldest dropped first
});

function emptyRow() { return { runs: 0, fired: 0, cost: 0, errors: 0, skips: 0, surpriseSum: 0, surpriseN: 0 }; }

function addRow(dst, src) {
  dst.runs += src.runs; dst.fired += src.fired; dst.cost += src.cost;
  dst.errors += src.errors; dst.skips += src.skips;
  dst.surpriseSum += src.surpriseSum; dst.surpriseN += src.surpriseN;
  return dst;
}

function finishRow(r, name) {
  return {
    name, runs: r.runs, fired: r.fired, cost: r.cost, errors: r.errors, skips: r.skips,
    surprise: r.surpriseN > 0 ? r.surpriseSum / r.surpriseN : 0,
    fireRate: r.runs > 0 ? r.fired / r.runs : 0,
  };
}

export class SelfMemory {
  /** @param {object} [opts] see SELF_DEFAULTS */
  constructor(opts = {}) {
    const o = { ...SELF_DEFAULTS, ...opts };
    this.window = o.window;
    this.keep = o.keep;
    this.windows = new Map();   // window index to { i, t0, t1, cells: Map, regions: Map }
    this.prev = new Map();      // cell id to the last observed cumulative stats
    this.stats = { records: 0, windows: 0, observations: 0, dropped: 0 };
  }

  /** @param {number} t @returns {number} the window index that contains tick t */
  indexOf(t) { return Math.floor(t / this.window); }

  /**
   * The window containing t, created on first write.
   * @param {number} t
   * @returns {object}
   */
  windowFor(t) {
    const i = this.indexOf(t);
    let w = this.windows.get(i);
    if (!w) {
      w = { i, t0: i * this.window, t1: (i + 1) * this.window - 1, cells: new Map(), regions: new Map() };
      this.windows.set(i, w);
      this.stats.windows++;
      while (this.windows.size > this.keep) {
        let oldest = Infinity;
        for (const k of this.windows.keys()) if (k < oldest) oldest = k;
        this.windows.delete(oldest);
        this.stats.dropped++;
      }
    }
    return w;
  }

  /**
   * Record one slice of activity.
   * @param {number} t tick the activity happened at
   * @param {object} a { cell, region, runs, fired, cost, errors, skips, surprise }
   * @returns {object} the window it landed in
   */
  record(t, a) {
    const w = this.windowFor(t);
    const slice = {
      runs: a.runs ?? 0, fired: a.fired ?? 0, cost: a.cost ?? 0,
      errors: a.errors ?? 0, skips: a.skips ?? 0,
      surpriseSum: Number.isFinite(a.surprise) ? a.surprise : 0,
      surpriseN: Number.isFinite(a.surprise) ? 1 : 0,
    };
    if (a.cell) {
      let r = w.cells.get(a.cell);
      if (!r) { r = emptyRow(); w.cells.set(a.cell, r); }
      addRow(r, slice);
    }
    if (a.region) {
      let r = w.regions.get(a.region);
      if (!r) { r = emptyRow(); w.regions.set(a.region, r); }
      addRow(r, slice);
    }
    this.stats.records++;
    return w;
  }

  /**
   * Sample a live brain. Cell stats are cumulative, so what lands in the window is the
   * change since the previous observation, which is what makes windows comparable.
   * @param {import('../core/brain.mjs').Brain} brain
   * @returns {{t: number, cells: number, changed: number}}
   */
  observeBrain(brain) {
    const t = brain.clock.t;
    let changed = 0;
    for (const cell of brain.cells) {
      const s = cell.stats;
      const p = this.prev.get(cell.id) || { runs: 0, fired: 0, cost: 0, errors: 0, skips: 0 };
      const d = {
        runs: s.runs - p.runs, fired: s.fired - p.fired, cost: s.cost - p.cost,
        errors: s.errors - p.errors, skips: s.skips - p.skips,
      };
      this.prev.set(cell.id, { runs: s.runs, fired: s.fired, cost: s.cost, errors: s.errors, skips: s.skips });
      if (d.runs === 0 && d.fired === 0 && d.errors === 0 && d.skips === 0) continue;
      changed++;
      this.record(t, { cell: cell.id, region: cell.region, ...d, surprise: s.surprise });
    }
    this.stats.observations++;
    return { t, cells: brain.cells.length, changed };
  }

  _windowsIn(from, to) {
    const out = [];
    for (const w of this.windows.values()) {
      if (w.t1 < from || w.t0 > to) continue;
      out.push(w);
    }
    out.sort((a, b) => a.i - b.i);
    return out;
  }

  /**
   * Per window activity of one cell, oldest window first.
   * @param {string} id cell id
   * @param {object} [opts] { from, to }
   * @returns {Array<object>} rows with t0, t1 and the finished metrics
   */
  cellSeries(id, opts = {}) {
    const from = opts.from ?? -Infinity, to = opts.to ?? Infinity;
    const out = [];
    for (const w of this._windowsIn(from, to)) {
      const r = w.cells.get(id);
      if (!r) continue;
      out.push({ t0: w.t0, t1: w.t1, ...finishRow(r, id) });
    }
    return out;
  }

  /**
   * Per window activity of one region, oldest window first.
   * @param {string} name region name
   * @param {object} [opts] { from, to }
   * @returns {Array<object>}
   */
  regionSeries(name, opts = {}) {
    const from = opts.from ?? -Infinity, to = opts.to ?? Infinity;
    const out = [];
    for (const w of this._windowsIn(from, to)) {
      const r = w.regions.get(name);
      if (!r) continue;
      out.push({ t0: w.t0, t1: w.t1, ...finishRow(r, name) });
    }
    return out;
  }

  /**
   * Totals over a time range.
   * @param {object} [opts] { from, to }
   * @returns {{windows: number, cells: object[], regions: object[]}}
   */
  totals(opts = {}) {
    const from = opts.from ?? -Infinity, to = opts.to ?? Infinity;
    const cells = new Map(), regions = new Map();
    const ws = this._windowsIn(from, to);
    for (const w of ws) {
      for (const [id, r] of w.cells) { let a = cells.get(id); if (!a) { a = emptyRow(); cells.set(id, a); } addRow(a, r); }
      for (const [nm, r] of w.regions) { let a = regions.get(nm); if (!a) { a = emptyRow(); regions.set(nm, a); } addRow(a, r); }
    }
    return {
      windows: ws.length,
      cells: [...cells].map(([id, r]) => finishRow(r, id)).sort((a, b) => b.runs - a.runs),
      regions: [...regions].map(([nm, r]) => finishRow(r, nm)).sort((a, b) => b.runs - a.runs),
    };
  }

  /**
   * The k busiest cells by a metric over a range.
   * @param {string} [metric] one of runs, fired, cost, errors, skips, surprise, fireRate
   * @param {number} [k]
   * @param {object} [opts] { from, to, scope }
   * @returns {object[]}
   */
  top(metric = 'runs', k = 5, opts = {}) {
    const t = this.totals(opts);
    const rows = (opts.scope === 'region') ? t.regions : t.cells;
    return [...rows].sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0)).slice(0, k);
  }

  /**
   * Mean surprise reported by one cell over a range.
   * @param {string} id
   * @param {object} [opts] { from, to }
   * @returns {number}
   */
  surpriseOf(id, opts = {}) {
    let sum = 0, n = 0;
    for (const w of this._windowsIn(opts.from ?? -Infinity, opts.to ?? Infinity)) {
      const r = w.cells.get(id);
      if (!r) continue;
      sum += r.surpriseSum; n += r.surpriseN;
    }
    return n > 0 ? sum / n : 0;
  }

  /** @returns {object} JSON safe form */
  serialize() {
    return {
      version: 1, window: this.window, keep: this.keep, stats: { ...this.stats },
      windows: [...this.windows.values()].sort((a, b) => a.i - b.i).map(w => ({
        i: w.i, t0: w.t0, t1: w.t1,
        cells: [...w.cells].map(([id, r]) => [id, r]),
        regions: [...w.regions].map(([nm, r]) => [nm, r]),
      })),
      prev: [...this.prev].map(([id, p]) => [id, p]),
    };
  }

  /**
   * Rebuild from serialize().
   * @param {object} j
   * @returns {SelfMemory}
   */
  static from(j) {
    const s = new SelfMemory({ window: j.window, keep: j.keep });
    for (const w of j.windows || []) {
      s.windows.set(w.i, { i: w.i, t0: w.t0, t1: w.t1, cells: new Map(w.cells), regions: new Map(w.regions) });
    }
    s.prev = new Map(j.prev || []);
    s.stats = { ...s.stats, ...(j.stats || {}) };
    return s;
  }
}
