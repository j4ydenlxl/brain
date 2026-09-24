// simulate/attention.mjs : ATTENTION IS AN ECONOMY, NOT A FLAG. A system with thousands
// of cells cannot run them all at full intensity, so something must decide where the
// computation goes. This scores the signals that are about to arrive and funds the cells
// that are about to receive the important ones.
//
// Relevance has three terms, each in [0, 1]:
//   novelty   how unlike the recent working memory this content is
//   surprise  the prediction error of whatever produced it, squashed by s / (1 + s)
//   goal      similarity to the current goal hypervector (hv signals only)
// It writes two fields core/scheduler.mjs already reads:
//   cell.stats.surprise   inherited from the source, for cells that do not own a predictor
//   cell.policy.priority  base * (1 + gain * relevance), clamped
// The scheduler's bid is priority x (1 + surprise) x (1 + pending), so a relevant cell
// outbids a boring one inside the same region budget.
//
// Ordering: the hook runs at the end of tick t, and core advances the clock after hooks,
// so what it scores is brain.inflight[t + 1] (about to be delivered) plus mail still
// sitting in the mailboxes of cells the scheduler did not fund. The priorities it writes
// are the ones the scheduler reads at t + 1.
import * as S from '../core/signal.mjs';

// Kinds that compute their own prediction error. Attention never overwrites those.
export const OWNS_SURPRISE = new Set(['predict.next', 'vec.mlp']);

export class Attention {
  constructor(brain, opts = {}) {
    this.brain = brain;
    this.regionNames = opts.regions ? new Set([].concat(opts.regions)) : null;
    this.weights = { novelty: 1, surprise: 1, goal: 1, ...(opts.weights || {}) };
    this.gain = opts.gain ?? 4;
    this.floor = opts.priorityFloor ?? 0.125;
    this.ceil = opts.priorityCeil ?? 16;
    this.goalCell = opts.goalCell ?? null;
    this.goalHv = opts.goalHv ?? null;
    this.wmSize = opts.workingMemory ?? 16;
    this.ownsSurprise = opts.ownsSurprise ? new Set(opts.ownsSurprise) : OWNS_SURPRISE;
    this.wm = [];        // recent hypervectors
    this.wmHash = [];    // recent content hashes for non-hv kinds
    this.base = new Map();   // cell id -> the priority it was created with
    this.scores = new Map(); // cell id -> last relevance breakdown
    this.reports = [];
    this.reportsMax = opts.reports ?? 256;
    // Scoring every tick cost 633 ms of a 1,063 ms 100 tick run on a 168 cell brain, so a
    // caller may buy the whole economy at 1/every of the price: the hook scores on ticks
    // where t % every === 0 and leaves the priorities it last wrote in place between them
    // (notes/whole.md request 6). every = 1 is the old behaviour and stays the default.
    this.every = opts.every ?? 1;
    if (!(Number.isInteger(this.every) && this.every >= 1)) throw new Error('attention: every must be a positive integer, got ' + JSON.stringify(opts.every));
    this.stats = { ticks: 0, skipped: 0, scored: 0, raised: 0, lowered: 0 };
    this._prev = new Map();  // cell id -> { runs, skips } at the end of the previous tick
    this._hook = null;
  }

  goal() {
    if (this.goalCell) {
      const c = this.brain.byId.get(this.goalCell);
      if (c && c.state && c.state.hv) return c.state.hv;
    }
    return this.goalHv;
  }
  inScope(cell) { return !this.regionNames || this.regionNames.has(cell.region); }

  attach() {
    if (this._hook) return this;
    this._hook = (b, t) => { if (this.every > 1 && t % this.every !== 0) { this.stats.skipped++; return; } this.step(b, t); };
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

  // ------------------------------------------------------------ one signal
  score(sig, srcCell = null) {
    const g = this.goal();
    let novelty = 1, goal = 0;
    if (sig.kind === 'hv') {
      let best = -1;
      for (const v of this.wm) { const s = S.sim(v, sig.data); if (s > best) best = s; }
      novelty = this.wm.length ? Math.min(1, Math.max(0, 1 - Math.max(0, best))) : 1;
      if (g && g.length === sig.data.length) goal = Math.min(1, Math.max(0, S.sim(g, sig.data)));
    } else {
      const h = safeHash(sig);
      novelty = this.wmHash.includes(h) ? 0 : 1;
    }
    const raw = srcCell ? (srcCell.stats.surprise || 0) : 0;
    const surprise = raw > 0 ? raw / (1 + raw) : 0;
    const w = this.weights, sum = w.novelty + w.surprise + w.goal;
    const relevance = sum > 0 ? (w.novelty * novelty + w.surprise * surprise + w.goal * goal) / sum : 0;
    return { novelty, surprise, goal, relevance, raw };
  }
  remember(sig) {
    if (sig.kind === 'hv') { this.wm.push(sig.data); if (this.wm.length > this.wmSize) this.wm.shift(); }
    else { this.wmHash.push(safeHash(sig)); if (this.wmHash.length > this.wmSize) this.wmHash.shift(); }
  }

  // ------------------------------------------------------------ one tick
  step(brain, t) {
    this.stats.ticks++;
    // what will be delivered next tick, to a cell in scope. An inflight item bound for a cell
    // outside the scope was collected and then never read, so it is skipped here.
    const pending = new Map(); // cell idx -> [{ sig, from }]
    for (const it of brain.inflight.get(t + 1) || []) {
      if (!this.inScope(brain.cells[it.dst])) continue;
      let l = pending.get(it.dst); if (!l) { l = []; pending.set(it.dst, l); } l.push(it);
    }

    const seen = [];
    for (const cell of brain.cells) {
      if (!this.inScope(cell)) continue;
      if (!this.base.has(cell.id)) this.base.set(cell.id, cell.policy.priority);
      const basePriority = this.base.get(cell.id);
      // plus the mail that was never funded. A cell with every port empty and nothing inbound
      // falls straight through: no working memory similarity is computed for it at all
      // (notes/whole.md request 6), which is what the old two pass collection paid for anyway.
      let mail = pending.get(cell.idx) || null;
      for (const m of cell.mailbox) {
        if (!m.length) continue;
        if (!mail) mail = [];
        for (const it of m) mail.push(it);
      }
      if (!mail) {
        cell.policy.priority = basePriority;
        if (!this.ownsSurprise.has(cell.kind)) cell.stats.surprise = 0;
        continue;
      }
      let best = { novelty: 0, surprise: 0, goal: 0, relevance: 0, raw: 0 };
      let inherited = 0;
      for (const it of mail) {
        const src = it.from >= 0 ? brain.cells[it.from] : null;
        const s = this.score(it.sig, src);
        this.stats.scored++;
        if (s.relevance > best.relevance) best = s;
        if (s.raw > inherited) inherited = s.raw;
        seen.push(it.sig);
      }
      if (!this.ownsSurprise.has(cell.kind)) cell.stats.surprise = inherited;
      const next = clamp(basePriority * (1 + this.gain * best.relevance), this.floor, this.ceil);
      if (next > cell.policy.priority) this.stats.raised++;
      else if (next < cell.policy.priority) this.stats.lowered++;
      cell.policy.priority = next;
      this.scores.set(cell.id, { ...best, priority: next, base: basePriority, pending: mail.length });
    }
    for (const sig of seen) this.remember(sig);
    this._budget(brain, t);
  }

  // ------------------------------------------------------------ budget report
  // Measured, not predicted: funded and skipped are the per-cell counters core keeps,
  // differenced across this tick. spent is what the funded cells actually cost.
  _budget(brain, t) {
    const rows = new Map();
    for (const cell of brain.cells) {
      if (!this.inScope(cell)) continue;
      const prev = this._prev.get(cell.id) || { runs: 0, skips: 0 };
      const dRuns = cell.stats.runs - prev.runs, dSkips = cell.stats.skips - prev.skips;
      this._prev.set(cell.id, { runs: cell.stats.runs, skips: cell.stats.skips });
      let row = rows.get(cell.region);
      if (!row) {
        const r = brain.regions.get(cell.region);
        row = { t, region: cell.region, budget: Number.isFinite(r.budget) ? r.budget : null, demand: 0, funded: 0, skipped: 0, spent: 0, top: [] };
        rows.set(cell.region, row);
      }
      row.funded += dRuns; row.skipped += dSkips; row.demand += dRuns + dSkips;
      if (dRuns > 0) row.spent += cell.policy.budget;
      if (this.scores.has(cell.id)) row.top.push({ cell: cell.id, priority: round4(cell.policy.priority), relevance: round4(this.scores.get(cell.id).relevance) });
    }
    for (const row of rows.values()) {
      row.headroom = row.budget === null ? null : row.budget - row.spent;
      row.top.sort((a, b) => b.priority - a.priority || (a.cell < b.cell ? -1 : 1));
      row.top = row.top.slice(0, 8);
      this.reports.push(row);
    }
    while (this.reports.length > this.reportsMax) this.reports.shift();
  }

  budgetReport(t = null, region = null) {
    const rows = this.reports.filter(r => (t === null || r.t === t) && (region === null || r.region === region));
    return t === null && region === null ? rows : (rows.length === 1 ? rows[0] : rows);
  }
  relevanceOf(cellId) { return this.scores.get(cellId) ?? null; }
}

function clamp(x, lo, hi) { return x < lo ? lo : x > hi ? hi : x; }
function round4(x) { return Math.round(x * 10000) / 10000; }
function safeHash(sig) { try { return S.hashSignal(sig); } catch { return '?'; } }

// opts: { regions, weights, gain, priorityFloor, priorityCeil, goalCell, goalHv,
//          workingMemory, ownsSurprise, reports, every }
export function attachAttention(brain, opts = {}) { return new Attention(brain, opts).attach(); }
