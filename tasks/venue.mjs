// tasks/venue.mjs : THE YARDSTICK FOR A MARKET. Millions of years of the real world like
// ticks, on a tape that was recorded once and is replayed read only.
//
// The other three suites ask for an exact answer: an arithmetic result, the next term of a
// sequence, a grid. A market has no exact answer, so this suite is built the way the other
// three are built (a seeded generator, a solver made of cells, a grader that prints a
// number) and the number it prints is a DIFFERENCE against a control, never a profit.
//
//   a task      one instrument window of N consecutive readings from the tape. The tape is
//               the frozen trader package's recorded reserves, opened read only by
//               world/venue.mjs, or a seeded synthetic tape when that database is absent,
//               and every problem carries `synthetic` so a reader is never in doubt.
//
//   the solver  the organism's own venue.trader path, grown by attachVenue: sense.venue
//               replays the window, venue.trader decides, world.venue fills a PAPER order
//               at the payable price off the reserves, and a closed round trip is charged
//               the borrowed round trip fee. No order leaves this process, ever.
//
//   the grade   return on deployed after fees, MINUS the same number for a matched random
//               control on the SAME window: the same count of round trips, the same sizes
//               and the same holding times, entered at random. A score above zero means
//               this window was beaten by the brain against its own control, and nothing
//               else. A score of zero is what a window with no trade scores.
//
// THREE THINGS THIS FILE REFUSES TO DO.
//
// 1. It never grades the brain with the brain. The bar is a random control that travels
//    the identical edges through venue.script, and the prices both arms pay come from
//    world/venue.mjs, which this file only imports.
//
// 2. It never claims profit. The fee is BORROWED (FEE_SOURCE says measured on pump.fun,
//    applied to pumpswap, which has never been measured), and the report carries
//    clearsFeeBar next to beatsControl so the two questions are never merged into one.
//
// 3. It never lets a control belong to another arm. One control is built from the trades
//    of the brain arm on that window and is used for that window only.
//
// SIZE. bench/verdicts/venue.json publishes, at the incumbent 0.02 SOL, a median quote
// reserve on its seed 1 tape far under that size, which is the same file's way of saying
// the order IS the book at that size. This suite therefore defaults to the small size that
// bench swept, 0.0005 SOL, so what is measured is the rule and not our own footprint.
// Impact is still paid by both arms at the payable price.
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import {
  attachWorld, closeWorld, bookOf, loadTape, synthTape, resetTape, resetScript,
  FEE_ROUND_TRIP, FEE_SOURCE,
} from '../world/index.mjs';
import { nameCells } from './host.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** The frozen trader package's recorded tape. Opened READ ONLY, by world/venue.mjs. */
export const TRADER_DB = path.resolve(HERE, '..', '..', 'trader', 'data', 'trader.db');
/** The venue the recorded rows are a tape of. */
export const TAPE_VENUE = 'pumpswap';
/** Quote per entry. See SIZE in the header for why it is not the incumbent 0.02. */
export const DEFAULT_SIZE = 0.0005;
export const VENUE_COUNTS = Object.freeze({ windows: 8, readings: 24, instruments: 16 });
/** The draw seed. See THE POPULATION OF WINDOWS in the header. */
export const DEFAULT_DRAW_SEED = 'venue.tape/1';

// The cell kinds the solver path is made of. generations/organism-genome.mjs asks whether
// an organism CONTAINS these before it scores this suite, exactly as it does for the grid
// family, so this list is the one declaration of what hosting this suite requires.
export const VENUE_KINDS_NEEDED = Object.freeze(['sense.venue', 'world.venue', 'venue.trader']);

// The same three kinds as ROLES, in the shape tasks/host.mjs nameCells takes, so this
// suite says which cells of a brain SOMEBODY ELSE built would carry it, by id, the way
// algebraCellsOf and sequenceCellsOf do. A brain that is missing a role is reported by
// name in `missing` rather than by a wrong answer for it, and that is the same question
// generations/organism-genome.mjs asks of a kind set before it scores this suite.
export const VENUE_ROLES = Object.freeze([
  { role: 'sense', kind: 'sense.venue', why: 'replays the window one reading per run' },
  { role: 'book', kind: 'world.venue', why: 'fills the paper order at the payable price and charges the round trip fee' },
  { role: 'decide', kind: 'venue.trader', why: 'the decision cell whose parameters are what a search moves' },
]);

/**
 * Name the cells of a brain that would host this suite.
 * @param {object} brain
 * @returns {{cells: Record<string,string>, missing: string[], chosen: object[]}}
 */
export function venueCellsOf(brain) { return nameCells(brain, VENUE_ROLES); }

// ---------------------------------------------------------------- the source tape
// THE POPULATION OF WINDOWS. Drawing instruments out of the recorded database is a scan
// of every row of the venue, and it was measured at tens of seconds on this machine, so a
// suite that is run once per generation of a search cannot draw a new one each time.
//
// The draw is therefore split in two, and the split is the honest part:
//
//   the DRAW SEED   fixes which instruments the database hands over. It does not move with
//                   the problem seed, so one process reads the database once and every
//                   later run of the suite draws its windows out of THAT population.
//   the PROBLEM SEED chooses which of those instruments each task uses and where in the
//                   instrument its window starts. This is what varies between runs.
//
// So a run of this suite is a measurement over a FIXED population of instruments, and two
// runs with different seeds are not two independent draws from the venue: they are two
// draws from the same pool. Every report and every verdict carries instrumentPool and
// drawSeed for that reason.
const TAPES = new Map();

/** Forget the cached source tapes. A test calls this so one test cannot pay for another. */
export function clearTapeCache() { TAPES.clear(); }

function sourceTape({ db, drawSeed, instruments, readings }) {
  const key = JSON.stringify([String(db || ''), String(drawSeed), instruments, readings]);
  if (TAPES.has(key)) return TAPES.get(key);
  const span = Math.max(readings * 2, readings);
  let t = null, why = null;
  if (db && existsSync(db)) {
    try {
      t = loadTape({ db, instruments, minReadings: readings, maxReadings: span, seed: 'venue.tasks:' + drawSeed, venue: TAPE_VENUE });
      if (!t.instruments.length) { why = 'the recorded database held no ' + TAPE_VENUE + ' instrument with ' + readings + ' readings'; t = null; }
    } catch (err) {
      why = 'the recorded database could not be read: ' + String((err && err.message) || err);
      t = null;
    }
  } else {
    why = 'no recorded database at ' + String(db);
  }
  if (!t) {
    t = synthTape({ instruments, readings: span, seed: 'venue.tasks:' + drawSeed, drift: 0, vol: 0.06 });
    t.why = why;
  }
  TAPES.set(key, t);
  return t;
}

// A task's own tape: one instrument, one window, in the shape world/venue.mjs replays.
// That module builds this object in buildTape and does not export it, and this file may
// not edit it, so the shape is rebuilt here: instruments, byId, a time ordered flat list
// and the replay cursor `seen` that sense.venue moves and world.venue reads.
function windowTape(p) {
  const readings = p.readings.map((r) => ({ tMs: r.tMs, quote: r.quote, base: r.base, mid: r.mid }));
  const inst = { id: p.instrument, venue: p.venue, readings };
  const flat = readings.map((r, step) => ({ i: 0, id: inst.id, step, tMs: r.tMs, quote: r.quote, base: r.base, mid: r.mid }));
  return {
    source: p.source, db: p.db, venue: p.venue, seed: p.id, synthetic: !!p.synthetic,
    instruments: [inst], byId: { [inst.id]: inst }, flat, seen: {}, readings: flat.length,
  };
}

// ---------------------------------------------------------------- generator
/**
 * One instrument window per task, drawn from the recorded tape when there is one.
 *
 * @param {object} [opts]
 * @param {string} [opts.seed]
 * @param {{windows: number, readings: number}} [opts.counts]
 * @param {string} [opts.db] the recorded database; a missing file falls back to synthetic
 * @param {object} [opts.tape] a tape object to draw from instead, for a test
 * @param {number} [opts.size] quote per entry
 * @returns {object[]} problems
 */
export function generateVenue({ seed = 'venue/1', counts = VENUE_COUNTS, db = TRADER_DB, tape = null, size = DEFAULT_SIZE, drawSeed = DEFAULT_DRAW_SEED } = {}) {
  const c = { ...VENUE_COUNTS, ...counts };
  const windows = Math.max(1, Math.floor(Number(c.windows) || 1));
  const readings = Math.max(6, Math.floor(Number(c.readings) || 6));
  const instruments = Math.max(windows, Math.floor(Number(c.instruments) || windows));
  const src = tape || sourceTape({ db, drawSeed, instruments, readings });
  const rng = new RNG('venue.tasks.window:' + seed);
  const out = [];
  if (!src.instruments.length) return out;
  // Without replacement while the pool lasts: two windows of the same instrument would be
  // two readings of one price history, and a win on both would be one win counted twice.
  const order = src.instruments.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = rng.int(i + 1); const t = order[i]; order[i] = order[j]; order[j] = t; }
  for (let i = 0; i < windows; i++) {
    const inst = src.instruments[order[i % order.length]];
    const span = inst.readings.length - readings;
    const start = span > 0 ? rng.int(span + 1) : 0;
    const win = inst.readings.slice(start, start + readings);
    out.push({
      id: 'venue.win.' + i, kind: 'window', family: 'venue',
      instrument: inst.id, venue: src.venue, source: src.source, db: src.db, synthetic: !!src.synthetic,
      instrumentPool: src.instruments.length, drawSeed: String(drawSeed),
      startStep: start, n: win.length, size: Number(size),
      // There is no expected ANSWER here. The bar is the matched control, and it is
      // measured on this same window at solve time, never typed.
      expected: null,
      prompt: 'window of ' + win.length + ' readings of ' + String(inst.id).slice(0, 12) + ' from step ' + start + ' on ' + src.venue,
      readings: win.map((r) => ({ tMs: r.tMs, quote: r.quote, base: r.base, mid: r.mid })),
    });
  }
  return out;
}

// ---------------------------------------------------------------- one arm
// The same organism, the same anatomy, the same fill code for both arms: the only
// difference is which decision cell sits in motor. Growth and pruning are off so an arm
// cannot become a different animal halfway through the window.
function policyFor(tape, size, fee) {
  return {
    venue: {
      enabled: true, paper: true,
      tapes: tape.db ? [tape.db] : [], venues: [tape.venue],
      allowSynthetic: tape.source === 'synthetic',
      feeRoundTrip: fee, maxNotional: size, maxReadings: 1000000,
    },
  };
}

function runArm(tape, size, { decide, orders = null, trader = null, feeRoundTrip = FEE_ROUND_TRIP }) {
  resetTape(tape);
  if (orders) resetScript(orders);
  const brain = new Brain({ name: 'venue.task', seed: 'venue.task', growth: false, pruneEvery: 0, ledger: 'runs' });
  attachWorld(brain, policyFor(tape, size, feeRoundTrip), {
    actuators: false, senses: false, listen: false, wire: false, tape,
    venue: { size, decide, orders, trader, feeRoundTrip },
  });
  const sense = brain.cell('w.venue'), book = brain.cell('w.book'), cell = brain.cell('w.decide');
  const motor = brain.cell('w.motor'), percept = brain.cell('w.percept');
  let ticks = 0;
  const cap = 40 * tape.readings + 4000;
  for (let i = 0; i < cap; i++) {
    brain.tick(1);
    ticks++;
    const quiet = cell.state.queue.length === 0 && motor.state.queue.length === 0 && percept.state.queue.length === 0;
    if (sense.state.done && quiet && Object.keys(book.state.positions).length === 0) break;
  }
  const b = bookOf(book);
  const row = {
    decide: cell.kind,
    trips: b.trips, net: b.realized, deployed: b.deployed, fees: b.feesPaid,
    returnOnDeployed: b.returnOnDeployed, meanGrossReturnPerTrip: b.meanGrossReturnPerTrip,
    orders: b.orders, fills: b.fills, refused: b.refused, openAtEnd: b.openPositions,
    meanLagReadings: b.meanLagReadings,
    borderDropped: percept.state.dropped + motor.state.dropped,
    senseEmitted: sense.state.emitted, senseReadings: sense.state.readings,
    gateProposed: brain.gate.stats.proposed, gateApproved: brain.gate.stats.approved, gateRejected: brain.gate.stats.rejected,
    cells: brain.cells.length, ticks,
    trades: b.trades.map((t) => ({ entryStep: t.entryStep, exitStep: t.exitStep, heldSteps: t.heldSteps, entryQuote: t.entryQuote, fee: t.fee, pnl: t.pnl })),
  };
  closeWorld(brain);
  return row;
}

// ---------------------------------------------------------------- the control
// Rate matched AND duration matched, on this window and no other: one random round trip
// per round trip the brain closed, of the same size, held for the same number of readings.
// It fires through venue.script, which travels the identical edges with the identical
// latency, so the two arms differ in the DECISION and in nothing else.
function controlScript(tape, trades, seed) {
  const rng = new RNG('venue.tasks.control:' + seed);
  const inst = tape.instruments[0];
  const last = inst.readings.length - 1;
  const orders = [];
  const busy = [];
  let collisions = 0;
  for (const t of trades) {
    const hold = Math.max(0, Number(t.heldSteps) || 0);
    if (hold > last) { collisions++; continue; }
    let placed = false;
    for (let attempt = 0; attempt < 64 && !placed; attempt++) {
      const entry = rng.int(last - hold + 1);
      if (busy.some((w) => entry <= w[1] && entry + hold >= w[0])) continue;
      busy.push([entry, entry + hold]);
      orders.push({ instrument: inst.id, step: entry, side: 'buy', size: t.entryQuote });
      orders.push({ instrument: inst.id, step: entry + hold, side: 'sell', size: t.entryQuote });
      placed = true;
    }
    if (!placed) collisions++;
  }
  // venue.script fires in list order on the reading that reaches it, so the buy of a pair
  // has to sit ahead of its sell whatever order the trades arrived in.
  orders.sort((a, b) => (a.step - b.step) || (a.side === 'buy' ? -1 : 1));
  return { orders, collisions };
}

// ---------------------------------------------------------------- solver
/**
 * @param {object[]} problems
 * @param {object} [opts]
 * @param {number} [opts.size] override the size every problem carries
 * @param {number} [opts.feeRoundTrip]
 * @param {object} [opts.trader] params for the venue.trader cell
 * @param {string} [opts.seed] the control's seed, mixed with the problem id
 */
export function solveVenue(problems, { size = null, feeRoundTrip = FEE_ROUND_TRIP, trader = null, seed = 'venue/1' } = {}) {
  const results = [];
  let ticks = 0, cells = 0;
  for (const p of problems) {
    const tape = windowTape(p);
    const sz = Number(size ?? p.size ?? DEFAULT_SIZE);
    const brain = runArm(tape, sz, { decide: 'trader', trader, feeRoundTrip });
    const ctl = controlScript(tape, brain.trades, seed + ':' + p.id);
    const control = runArm(tape, sz, { decide: 'script', orders: ctl.orders, feeRoundTrip });
    ticks += brain.ticks + control.ticks;
    cells = Math.max(cells, brain.cells, control.cells);
    results.push({
      id: p.id, size: sz, instrument: p.instrument, readings: p.n,
      brain, control, collisions: ctl.collisions, controlOrders: ctl.orders.length,
    });
  }
  return { results, ticks, cells, feeRoundTrip };
}

// ---------------------------------------------------------------- the arms, named
// solveVenue runs the two arms this suite grades on. A bench that wants a THIRD arm on the
// same windows (the never trade arm, which deploys nothing and therefore returns nothing)
// must travel the identical path or it is measuring a shortcut, so the window tape, the
// arm runner and the matched control are exported here rather than copied there. They are
// the same functions solveVenue calls, not a second implementation of them.

/** The one instrument replay tape of one problem, in the shape world/venue.mjs replays. */
export function windowTapeOf(problem) { return windowTape(problem); }

/**
 * One arm over one window tape. `decide` is 'trader' or 'script'; a script with an empty
 * order list is the never trade arm, and it still ticks the same cells over the same
 * readings, so a zero from it is a measured zero.
 */
export function runWindowArm(tape, size, opts) { return runArm(tape, size, opts); }

/** The rate and duration matched random control for one window, for those trades only. */
export function matchedControl(tape, trades, seed) { return controlScript(tape, trades, seed); }

// ---------------------------------------------------------------- grader
// One sided sign test: the chance a coin wins k or more of n. A win count is only worth
// printing next to what a coin would have done with the same number of windows.
function signTest(k, n) {
  let c = 1, p = 0;
  for (let i = 0; i <= n; i++) {
    if (i >= k) p += c;
    c = c * (n - i) / (i + 1);
  }
  return p / Math.pow(2, n);
}

export function gradeVenue(problems, results, { maxFailures = 25, feeRoundTrip = FEE_ROUND_TRIP } = {}) {
  const byId = new Map(results.map((r) => [r.id, r]));
  const perWindow = [], failures = [];
  const byKind = { traded: { n: 0, correct: 0 }, flat: { n: 0, correct: 0 } };
  let wins = 0, traded = 0, scoreSum = 0, best = null, worst = null;
  let brainNet = 0, brainDeployed = 0, brainTrips = 0, brainFees = 0, brainGross = 0;
  let ctlNet = 0, ctlDeployed = 0, ctlTrips = 0, ctlFees = 0, ctlGross = 0;
  let refused = 0, openAtEnd = 0, dropped = 0, collisions = 0, synthetic = 0;

  for (const p of problems) {
    const r = byId.get(p.id);
    if (!r) {
      failures.push({ id: p.id, instrument: p.instrument, why: 'no result for this window' });
      byKind.flat.n++;
      perWindow.push({ id: p.id, instrument: p.instrument, score: 0, win: 0, brainTrips: 0, controlTrips: 0, brainReturn: 0, controlReturn: 0, collisions: 0 });
      continue;
    }
    if (p.synthetic) synthetic++;
    const score = r.brain.returnOnDeployed - r.control.returnOnDeployed;
    const win = r.brain.trips > 0 && score > 0;
    if (win) wins++;
    if (r.brain.trips > 0) { traded++; byKind.traded.n++; if (win) byKind.traded.correct++; }
    else byKind.flat.n++;
    scoreSum += score;
    if (best === null || score > best) best = score;
    if (worst === null || score < worst) worst = score;
    brainNet += r.brain.net; brainDeployed += r.brain.deployed; brainTrips += r.brain.trips;
    brainFees += r.brain.fees; brainGross += r.brain.meanGrossReturnPerTrip * r.brain.trips;
    ctlNet += r.control.net; ctlDeployed += r.control.deployed; ctlTrips += r.control.trips;
    ctlFees += r.control.fees; ctlGross += r.control.meanGrossReturnPerTrip * r.control.trips;
    refused += r.brain.refused + r.control.refused;
    openAtEnd += r.brain.openAtEnd + r.control.openAtEnd;
    dropped += r.brain.borderDropped + r.control.borderDropped;
    collisions += r.collisions;
    perWindow.push({
      id: p.id, instrument: p.instrument, readings: p.n, size: r.size,
      score, win: win ? 1 : 0,
      brainTrips: r.brain.trips, controlTrips: r.control.trips,
      brainReturn: r.brain.returnOnDeployed, controlReturn: r.control.returnOnDeployed,
      brainNet: r.brain.net, controlNet: r.control.net,
      brainFees: r.brain.fees, controlFees: r.control.fees,
      meanLagReadings: r.brain.meanLagReadings, collisions: r.collisions,
    });
    if (!win) failures.push({ id: p.id, instrument: p.instrument, score, brainReturn: r.brain.returnOnDeployed, controlReturn: r.control.returnOnDeployed, brainTrips: r.brain.trips, controlTrips: r.control.trips });
  }

  const n = problems.length;
  byKind.traded.accuracy = byKind.traded.n ? byKind.traded.correct / byKind.traded.n : 0;
  byKind.flat.accuracy = 0;
  const meanScore = n ? scoreSum / n : 0;
  const brainReturn = brainDeployed > 0 ? brainNet / brainDeployed : 0;
  const controlReturn = ctlDeployed > 0 ? ctlNet / ctlDeployed : 0;
  const meanGrossPerTrip = brainTrips > 0 ? brainGross / brainTrips : 0;
  const beatsControl = brainReturn > controlReturn;
  const clearsFeeBar = meanGrossPerTrip > feeRoundTrip;
  const claim = traded === 0
    ? 'the brain opened no round trip on any window: there is nothing here to compare with a control'
    : (beatsControl
      ? (clearsFeeBar
        ? 'the brain beats its own matched control on these windows AND clears the borrowed fee bar'
        : 'the brain beats its own matched control on these windows but does NOT clear the borrowed fee bar: nothing here is purchasable')
      : 'the brain does NOT beat its own matched control on these windows');
  const checks = {
    everyWindowRan: n > 0 && perWindow.length === n,
    noOrderRefused: refused === 0,
    nothingOpenAtEnd: openAtEnd === 0,
    nothingDroppedAtTheBorder: dropped === 0,
    controlIsRateMatched: Math.abs(ctlTrips - brainTrips) <= collisions,
    everyTripPaidTheFee: brainTrips === 0 || (brainFees > 0 && Math.abs(brainFees - feeRoundTrip * brainDeployed) < 1e-9),
  };
  return {
    suite: 'venue',
    n, correct: wins, accuracy: n ? wins / n : 0,
    windowsTraded: traded, windowsFlat: n - traded,
    winRateAmongTraded: traded ? wins / traded : 0,
    signTestVsControl: signTest(wins, n),
    meanScore, bestScore: best === null ? 0 : best, worstScore: worst === null ? 0 : worst,
    brainReturnOnDeployed: brainReturn, controlReturnOnDeployed: controlReturn,
    scoreOnDeployed: brainReturn - controlReturn,
    brainNet, controlNet: ctlNet, brainDeployed, controlDeployed: ctlDeployed,
    brainTrips, controlTrips: ctlTrips, brainFees, controlFees: ctlFees,
    meanGrossReturnPerTrip: meanGrossPerTrip,
    controlMeanGrossReturnPerTrip: ctlTrips > 0 ? ctlGross / ctlTrips : 0,
    feeRoundTrip, feeBorrowed: 1, feeSource: FEE_SOURCE,
    syntheticWindows: synthetic, recordedWindows: n - synthetic,
    controlCollisions: collisions, refused, openAtEnd, borderDropped: dropped,
    beatsControl, clearsFeeBar, claim, checks, sound: Object.values(checks).every(Boolean),
    byKind, perWindow,
    failures: failures.slice(0, maxFailures), failureCount: failures.length, allFailures: failures,
  };
}

export function runVenue(opts = {}) {
  const problems = generateVenue(opts);
  const t0 = process.hrtime.bigint();
  const solved = solveVenue(problems, opts);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const report = gradeVenue(problems, solved.results, { ...opts, feeRoundTrip: solved.feeRoundTrip });
  report.ms = Math.round(ms * 1000) / 1000;
  report.cells = solved.cells;
  report.ticks = solved.ticks;
  report.cellRuns = solved.ticks;
  return { problems, results: solved.results, report };
}

export const venueSuite = Object.freeze({
  name: 'venue',
  doc: 'one instrument window of a recorded tape per task, traded by the organism venue.trader path through attachVenue at the payable price with the round trip fee charged, graded as return on deployed MINUS a matched random control on the same window',
  generate: generateVenue, solve: solveVenue, grade: gradeVenue, run: runVenue,
  kinds: VENUE_KINDS_NEEDED,
});
