// core/clock.mjs: TIME IS A FUNDAMENTAL DIMENSION. Two axes:
//   t   wall ticks (1 tick = 1 ms logical). Every cell has a period; a tick wheel returns
//       exactly the cells due at t without scanning all of them.
//   gen generation ticks, advanced by the generations engine independently of t
//       (many simulated episodes per wall second: warped time).
export const MS = 1, SEC = 1000, MIN = 60_000, HOUR = 3_600_000, DAY = 86_400_000;

export class Clock {
  constructor({ t = 0, gen = 0 } = {}) {
    this.t = t; this.gen = gen;
    this.wheel = new Map();      // period -> Set(cellIdx)
    this.eventCells = new Set(); // cells with period 'event'
    this.periods = [];           // sorted numeric periods
  }
  register(cell) {
    const p = cell.policy.period;
    if (p === 'event') { this.eventCells.add(cell.idx); return; }
    let s = this.wheel.get(p);
    if (!s) { s = new Set(); this.wheel.set(p, s); this.periods = [...this.wheel.keys()].sort((a, b) => a - b); }
    s.add(cell.idx);
  }
  unregister(cell) {
    const p = cell.policy.period;
    if (p === 'event') { this.eventCells.delete(cell.idx); return; }
    const s = this.wheel.get(p);
    if (s) { s.delete(cell.idx); if (s.size === 0) { this.wheel.delete(p); this.periods = [...this.wheel.keys()].sort((a, b) => a - b); } }
  }
  // Cells due at the current tick by period. Event cells are due when their mailbox is non-empty (the brain checks).
  due(t = this.t) {
    const out = [];
    for (const p of this.periods) if (t % p === 0) for (const idx of this.wheel.get(p)) out.push(idx);
    return out;
  }
  advance(n = 1) { this.t += n; return this.t; }
  advanceGen(n = 1) { this.gen += n; return this.gen; }
  // Human-readable period label for the viz and inspect.
  static label(p) {
    if (p === 'event') return 'event';
    if (p % DAY === 0) return (p / DAY) + 'd';
    if (p % HOUR === 0) return (p / HOUR) + 'h';
    if (p % MIN === 0) return (p / MIN) + 'min';
    if (p % SEC === 0) return (p / SEC) + 's';
    return p + 'ms';
  }
  serialize() { return { t: this.t, gen: this.gen }; }
}
