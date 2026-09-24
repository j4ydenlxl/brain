// core/scheduler.mjs: RESOURCE ALLOCATION as an attention economy. Thousands of cells
// cannot all run at full intensity. Each region has a budget per tick. Due cells bid
// priority x (1 + surprise) x (1 + pending signals); the scheduler funds bids in order
// until the budget is spent. Unfunded cells sleep and keep their mailbox. Equal bids are
// broken by CELL ID, so an allocation is a function of the cells and their bids alone and
// never of the order the cells happened to be registered in.
export class Scheduler {
  constructor() { this.stats = { funded: 0, skipped: 0, ticks: 0 }; }
  static bid(cell) {
    let pending = 0;
    for (const m of cell.mailbox) pending += m.length;
    return cell.policy.priority * (1 + cell.stats.surprise) * (1 + Math.min(pending, 16));
  }
  /** The documented tie-break: cell id, ascending, by code unit order. */
  static byId(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }
  // dueCells: array of cell objects; regions: Map name -> { budget }
  // returns { run: cell[], skipped: cell[] }
  allocate(dueCells, regions) {
    this.stats.ticks++;
    const byRegion = new Map();
    for (const c of dueCells) {
      let l = byRegion.get(c.region);
      if (!l) { l = []; byRegion.set(c.region, l); }
      l.push(c);
    }
    const run = [], skipped = [];
    for (const [name, cells] of byRegion) {
      const budget = regions.get(name)?.budget ?? Infinity;
      if (budget === Infinity) { for (const c of cells) run.push(c); continue; }
      // THE TIE-BREAK IS THE CELL ID, not the order the cells were registered in
      // (notes/lab.md request 4, notes/simulate.md request 5). Equal bids used to be funded in
      // the order cells were added to the brain, so a benchmark inherited file order without
      // saying so. The id sort runs first and the bid sort below is stable, so inside a group
      // of equal bids the cells stay in id order whatever order they were added in.
      cells.sort(Scheduler.byId);
      cells.sort((a, b) => Scheduler.bid(b) - Scheduler.bid(a));
      let spent = 0;
      for (const c of cells) {
        const cost = c.policy.budget;
        if (spent + cost <= budget) { spent += cost; run.push(c); }
        else { skipped.push(c); c.stats.skips++; }
      }
    }
    this.stats.funded += run.length; this.stats.skipped += skipped.length;
    return { run, skipped };
  }
}
