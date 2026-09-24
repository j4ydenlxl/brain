// bench/venue.mjs: THE TRADING USE CASE, MEASURED, WITH A CONTROL.
//
// THE DEFAULT (board 11, the bar): the sensor trader. Every recorded pumpswap instrument
// with at least 20 readings, packed once; seven typed sensors per reading (world/venue.mjs
// VENUE_SENSORS: real SOL, age, trading intervals, buy intervals, reserve slope, market
// births, migrated origin); the holdout split by instrument; generations over the
// venue.trader gate on those sensors and over the trailing exit, selected on TRAIN only by
// the smaller fold t statistic of the gap to an age binned baseline (generations/
// venue-suite.mjs SensorEpochs); then the elite, once, on the HOLDOUT against its AGE
// MATCHED control (the same trade count, random entries on other holdout instruments at
// the same age, the same exit, size and fee), after the fee on both legs, at the payable
// price: the gap per instrument with its 95 percent interval and nFor95, the trade count,
// the tail share, the win rate, the payable price check, the per sensor AUCs on holdout,
// and the organism compared trip for trip with the kernel. The canonical configuration
// writes bench/verdicts/venue.json once, at the end, with isTheBar true; any other writes
// venue-partial.json with isTheBar false.
//
// --sampled (the first venue bench, below as runLegacy) writes venue-sampled.json:
// Three arms over the same recorded tape, interleaved inside one seed so that nothing that
// drifts between the start and the end of the run (this machine, this process, this
// heap) can land on one arm and not the others:
//
//   brain    the organism decides, through venue.trader, through the gate
//   control  the same NUMBER of round trips, of the same size, held for the same number of
//            readings, entered at random instruments and random times
//   hold     one round trip per instrument, first reading to last
//
// Every arm is the same organism with the same anatomy and the same fill code: the only
// difference is which decision cell sits in motor. An arm that placed its orders by hand
// straight into the book would be measuring a shortcut, so the control and hold arms use
// venue.script, which travels the identical edges with the identical latency.
//
// WHAT A NUMBER HERE MAY CLAIM. No claim of profit without the control: the brain beats
// the fee bar or it does not, it beats the control or it does not, and both are printed
// whichever way they come out. The verdict field of this bench is about whether the
// MEASUREMENT is sound (every arm ran, no order was refused, the replay is deterministic).
// Whether the brain made money is the claim field, and it is allowed to say no.
//
// --full (board 8, the bar): EVERY recorded pumpswap instrument with at least 20 readings,
// packed once into typed arrays; a holdout split by a stable hash of the instrument id;
// generations of the venue.trader genome through generations/venue-suite.mjs (an Epochs
// subclass) on net after the fee per trip on the training instruments; then, on the
// holdout the search never saw: the evolved trader against its matched random control
// (same trips per instrument, random entries, same exit rule) and hold, paired by
// instrument, with a 95 percent interval and nFor95; the perfect foresight entry ceiling;
// and the best genome run through the ORGANISM on a few holdout instruments and compared
// trip for trip with the kernel. The canonical configuration writes
// bench/verdicts/venue-full.json once, at the end; any other configuration (fewer
// generations, a sampled tape with --instruments N) writes venue-full-partial.json with
// isTheBar false. Nothing in either mode places an order: replay only.
//
// Run:  node --max-old-space-size=6000 bench/venue.mjs            (board 11, the bar)
//         [--generations 120] [--pop 64] [--draws 16] [--tol-s 30] [--instruments N]
//       node bench/venue.mjs --full [--generations 120] [--pop 64] [--draws 16]  (board 8)
//                                   [--instruments N] [--seed venue.full/1]
//       node bench/venue.mjs --sampled                                      (the first bench)
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import {
  attachWorld, closeWorld, bookOf, loadTape, synthTape, tapeSummary, resetTape, resetScript,
  payableBuy, payableSell, FEE_ROUND_TRIP, FEE_SOURCE,
} from '../world/index.mjs';
import {
  loadFullTape, splitByInstrument, cadenceOf, LIQ_EVENT, ceilingOf,
  attachSensors, normalizeTrader, SENSOR_WINDOW, VENUE_SENSORS, SENSOR_NAMES, BIRTH_WINDOW_S,
} from '../world/venue.mjs';
import {
  VenueEpochs, INCUMBENT, VENUE_GENES, evaluateArms, ceilingOver, pairedStats, gapsOf,
  organismAgrees, clampVenueGenome, venueGridCapacity,
  SensorEpochs, SENSOR_GENES, EXIT_GENES, SENSOR_BASE, clampSensorGenome, sensorParamsOf,
  gradeSensorElite, sensorAucs, AGE_BINS,
} from '../generations/venue-suite.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TRADER_DB = path.resolve(HERE, '..', '..', 'trader', 'data', 'trader.db');
const out = (s) => process.stdout.write(s + '\n');
const f = (x, n = 4) => (Number.isFinite(Number(x)) ? Number(x).toFixed(n) : 'n/a');
const pct = (x, n = 2) => (Number.isFinite(Number(x)) ? (Number(x) * 100).toFixed(n) + '%' : 'n/a');

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const INSTRUMENTS = 24;
const MIN_READINGS = 20;
const MAX_READINGS = 60;
// The sizes are swept, not assumed. 0.02 SOL is the desk's incumbent size (trader/bench/
// verdicts/desk.json pins "the incumbent exit is TP-/SL5/TR10 at 0.02 SOL"); the small one
// is here because the first run of this bench printed a median quote reserve far under the
// incumbent size, and a size that IS the book measures the size and not the rule.
const SIZES = [0.02, 0.0005];
const PRIMARY = 0.02;
const VENUE = 'pumpswap';       // what the recorded tape is a tape OF

// ---------------------------------------------------------------- the tape
let tapeFor, tapeSource, tapeNote;
if (existsSync(TRADER_DB)) {
  tapeFor = (seed) => loadTape({ db: TRADER_DB, instruments: INSTRUMENTS, minReadings: MIN_READINGS, maxReadings: MAX_READINGS, seed, venue: VENUE });
  tapeSource = 'trader.db';
  tapeNote = 'recorded reserves, read only, out of the frozen trader package';
} else {
  tapeFor = (seed) => synthTape({ instruments: INSTRUMENTS, readings: MAX_READINGS, seed, drift: 0, vol: 0.06 });
  tapeSource = 'synthetic';
  tapeNote = 'SYNTHESIZED by a seeded generator because the recorded schema could not be read: no rate below is a measurement of any market';
}

function policyFor(tape, size) {
  return {
    venue: {
      enabled: true, paper: true,
      tapes: tape.db ? [tape.db] : [], venues: [tape.venue],
      allowSynthetic: tape.source === 'synthetic',
      feeRoundTrip: FEE_ROUND_TRIP, maxNotional: size, maxReadings: 1000000,
    },
  };
}

// ---------------------------------------------------------------- one arm
// growth is off and pruning is off on purpose: an arm that grew itself an edge would be a
// different anatomy, and the comparison would be between two organisms rather than between
// two ways of deciding. The measured organism is fixed for the length of a run.
function runArm(tape, size, { decide, orders, trader }) {
  // One tape object is replayed by every arm of a seed, so the replay cursor and the fired
  // flags of a script are cleared before each arm. An arm that inherited the cursor of the
  // one before it would fill its first orders at the END of the tape.
  resetTape(tape);
  if (orders) resetScript(orders);
  const brain = new Brain({ name: 'venue', seed: 'venue', growth: false, pruneEvery: 0, ledger: 'runs' });
  attachWorld(brain, policyFor(tape, size), {
    actuators: false, senses: false, listen: false, wire: false, tape,
    venue: { size, decide, orders, trader, feeRoundTrip: FEE_ROUND_TRIP },
  });
  const sense = brain.cell('w.venue'), book = brain.cell('w.book'), cell = brain.cell('w.decide');
  const motor = brain.cell('w.motor'), percept = brain.cell('w.percept');
  const t0 = Date.now();
  let ticks = 0;
  const cap = 40 * tape.readings + 4000;
  for (let i = 0; i < cap; i++) {
    brain.tick(1);
    ticks++;
    const quiet = cell.state.queue.length === 0 && motor.state.queue.length === 0 && percept.state.queue.length === 0;
    if (sense.state.done && quiet && Object.keys(book.state.positions).length === 0) break;
  }
  const b = bookOf(book);
  const report = {
    ...b, ticks, ms: Date.now() - t0,
    gateProposed: brain.gate.stats.proposed, gateApproved: brain.gate.stats.approved, gateRejected: brain.gate.stats.rejected,
    senseEmitted: sense.state.emitted, senseReadings: sense.state.readings,
    decideSeen: cell.state.seenEvents, borderDropped: percept.state.dropped + motor.state.dropped,
    openAtEnd: b.openPositions,
  };
  closeWorld(brain);
  return report;
}

// ---------------------------------------------------------------- the control
// Rate matched AND duration matched: the same number of round trips, each held for the
// same number of readings as one of the brain's, at a random instrument and a random time.
// It controls the brain arm it was built from and nothing else.
function controlScript(tape, trades, seed) {
  const rng = new RNG('venue.control:' + seed);
  const orders = [];
  const busy = {};
  let collisions = 0;
  for (const t of trades) {
    const hold = Math.max(0, Number(t.heldSteps) || 0);
    let placed = false;
    for (let attempt = 0; attempt < 64 && !placed; attempt++) {
      const inst = tape.instruments[rng.int(tape.instruments.length)];
      const last = inst.readings.length - 1;
      if (hold > last) continue;
      const entry = rng.int(last - hold + 1);
      const win = busy[inst.id] || (busy[inst.id] = []);
      if (win.some((w) => entry <= w[1] && entry + hold >= w[0])) continue;
      win.push([entry, entry + hold]);
      orders.push({ instrument: inst.id, step: entry, side: 'buy', size: t.entryQuote });
      orders.push({ instrument: inst.id, step: entry + hold, side: 'sell', size: t.entryQuote });
      placed = true;
    }
    if (!placed) collisions++;
  }
  // A script fires in list order on the reading that reaches it, so sorting by step keeps
  // the buy of a pair ahead of its sell whatever order the trades arrived in.
  orders.sort((a, b) => (a.instrument < b.instrument ? -1 : a.instrument > b.instrument ? 1 : 0) || (a.step - b.step) || (a.side === 'buy' ? -1 : 1));
  return { orders, collisions };
}

function holdScript(tape, size) {
  const orders = [];
  for (const inst of tape.instruments) {
    const last = inst.readings.length - 1;
    orders.push({ instrument: inst.id, step: 0, side: 'buy', size });
    orders.push({ instrument: inst.id, step: last, side: 'sell', size });
  }
  return orders;
}

// ---------------------------------------------------------------- the tape's own fee
// What a round trip costs in IMPACT alone, at this size, against these reserves: buy and
// sell back at the same reading. It is not the venue fee (a fee is a protocol constant and
// no balance sheet reveals it), it is what our own size costs us against the book. It is
// printed next to the borrowed fee so the two are never confused for each other.
function impactRoundTrip(tape, size, bar) {
  const losses = [];
  const quotes = [];
  for (const inst of tape.instruments) {
    for (const r of inst.readings) {
      const base = payableBuy(r.quote, r.base, size);
      if (!(base > 0)) continue;
      const back = payableSell(r.quote, r.base, base);
      losses.push((size - back) / size);
      quotes.push(r.quote);
    }
  }
  losses.sort((a, b) => a - b);
  quotes.sort((a, b) => a - b);
  const q = (arr, p) => (arr.length ? arr[Math.min(arr.length - 1, Math.floor(p * arr.length))] : 0);
  return {
    readings: losses.length,
    mean: losses.length ? losses.reduce((a, x) => a + x, 0) / losses.length : 0,
    p10: q(losses, 0.10), median: q(losses, 0.50), p90: q(losses, 0.90), worst: losses.length ? losses[losses.length - 1] : 0,
    shareOverFeeBar: losses.length ? losses.filter((x) => x > bar).length / losses.length : 0,
    quoteReserve: { p10: q(quotes, 0.10), median: q(quotes, 0.50), p90: q(quotes, 0.90) },
  };
}

// ---------------------------------------------------------------- run (the default: the sampled three arm sweep)
function runLegacy() {
  out('VENUE: the trading use case, inside the brain, paper only, no order path out of this process');
  out('tape source: ' + tapeSource + ' (' + tapeNote + ')');
  out('fee bar: ' + f(FEE_ROUND_TRIP, 4) + ' round trip, from ' + FEE_SOURCE.file + ' assertion "' + FEE_SOURCE.assertion + '" detail "' + FEE_SOURCE.detail + '"');
  out('   measured on ' + FEE_SOURCE.venueMeasuredOn + ', applied to ' + FEE_SOURCE.venueAppliedTo + ': a BORROWED constant, not a measurement of this venue');
  out('');

  const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);

  // One sided sign test: the chance of winning k or more of n seeds on a coin. A per seed
  // win count is only worth printing next to the chance that a coin would have done it.
  function signTest(k, n) {
    let c = 1, p = 0;
    for (let i = 0; i <= n; i++) {
      if (i >= k) p += c;
      c = c * (n - i) / (i + 1);
    }
    return p / Math.pow(2, n);
  }

  const tapes = new Map();
  const tapeAt = (seed) => { if (!tapes.has(seed)) tapes.set(seed, tapeFor(seed)); return tapes.get(seed); };
  let tape0 = null;

  // One whole sweep at one size: every seed, three arms, interleaved.
  function sweep(size) {
    const arms = { brain: [], control: [], hold: [] };
    const perSeed = [];
    let impact = null;
    for (const seed of SEEDS) {
      const tape = tapeAt(seed);
      if (!tape0) tape0 = tapeSummary(tape);
      if (!impact) impact = impactRoundTrip(tape, size, FEE_ROUND_TRIP);
      // interleaved: all three arms of one seed run back to back, on one tape, in one process
      const brain = runArm(tape, size, { decide: 'trader' });
      const ctl = controlScript(tape, brain.trades, seed);
      const control = runArm(tape, size, { decide: 'script', orders: ctl.orders });
      const hold = runArm(tape, size, { decide: 'script', orders: holdScript(tape, size) });
      arms.brain.push(brain); arms.control.push(control); arms.hold.push(hold);
      perSeed.push({
        seed, instruments: tape.instruments.length, readings: tape.readings,
        brain: { trips: brain.trips, net: brain.realized, deployed: brain.deployed, ret: brain.returnOnDeployed, gross: brain.meanGrossReturnPerTrip, fees: brain.feesPaid, refused: brain.refused, lag: brain.meanLagReadings },
        control: { trips: control.trips, net: control.realized, deployed: control.deployed, ret: control.returnOnDeployed, gross: control.meanGrossReturnPerTrip, fees: control.feesPaid, refused: control.refused, collisions: ctl.collisions },
        hold: { trips: hold.trips, net: hold.realized, deployed: hold.deployed, ret: hold.returnOnDeployed, gross: hold.meanGrossReturnPerTrip, fees: hold.feesPaid, refused: hold.refused },
      });
      out('  seed ' + String(seed).padStart(2) + '  brain trips ' + String(brain.trips).padStart(3) + ' net ' + f(brain.realized, 5).padStart(10) + ' SOL ' + pct(brain.returnOnDeployed).padStart(9) +
          '   control trips ' + String(control.trips).padStart(3) + ' net ' + f(control.realized, 5).padStart(10) + ' ' + pct(control.returnOnDeployed).padStart(9) +
          '   hold trips ' + String(hold.trips).padStart(3) + ' net ' + f(hold.realized, 5).padStart(10) + ' ' + pct(hold.returnOnDeployed).padStart(9));
    }
    // The same seed a second time must give the same book. A replay that is not deterministic
    // cannot support a comparison between arms at all.
    const repeat = runArm(tapeAt(SEEDS[0]), size, { decide: 'trader' });
    const first = arms.brain[0];
    const deterministic = repeat.trips === first.trips && repeat.realized === first.realized && repeat.deployed === first.deployed && repeat.grossReturnSum === first.grossReturnSum;

    const totals = {};
    for (const name of ['brain', 'control', 'hold']) {
      const rows = arms[name];
      const net = sum(rows, 'realized'), deployed = sum(rows, 'deployed'), trips = sum(rows, 'trips');
      const grossSum = sum(rows, 'grossReturnSum'), fees = sum(rows, 'feesPaid');
      totals[name] = {
        trips, net, deployed, fees,
        returnOnDeployed: deployed > 0 ? net / deployed : 0,
        meanGrossReturnPerTrip: trips > 0 ? grossSum / trips : 0,
        refused: sum(rows, 'refused'), orders: sum(rows, 'orders'), fills: sum(rows, 'fills'),
        openAtEnd: sum(rows, 'openAtEnd'), borderDropped: sum(rows, 'borderDropped'),
        seedsPositive: rows.filter((r) => r.realized > 0).length,
        meanLagReadings: rows.reduce((a, r) => a + r.meanLagReadings, 0) / rows.length,
      };
    }
    const brainWins = perSeed.filter((s) => s.brain.net > s.control.net).length;
    const brainBeatsHold = perSeed.filter((s) => s.brain.ret > s.hold.ret).length;
    const beatsControl = totals.brain.net > totals.control.net;
    const clearsFeeBar = totals.brain.meanGrossReturnPerTrip > FEE_ROUND_TRIP;
    const claim = beatsControl && clearsFeeBar
      ? 'the brain beats the matched random control AND clears the fee bar on this tape'
      : (beatsControl
        ? 'the brain beats the matched random control but does NOT clear the fee bar: nothing here is purchasable'
        : (clearsFeeBar
          ? 'the brain clears the fee bar but does NOT beat the matched random control: whatever is there is not the rule'
          : 'the brain does NOT beat the matched random control and does NOT clear the fee bar'));
    const checks = {
      everyArmRan: ['brain', 'control', 'hold'].every((n) => totals[n].trips > 0),
      noOrderRefused: totals.brain.refused === 0 && totals.control.refused === 0 && totals.hold.refused === 0,
      nothingOpenAtEnd: totals.brain.openAtEnd === 0 && totals.control.openAtEnd === 0 && totals.hold.openAtEnd === 0,
      nothingDroppedAtTheBorder: totals.brain.borderDropped === 0 && totals.control.borderDropped === 0 && totals.hold.borderDropped === 0,
      controlIsRateMatched: Math.abs(totals.control.trips - totals.brain.trips) <= SEEDS.length,
      deterministic,
      everyTripPaidTheFee: ['brain', 'control', 'hold'].every((n) => totals[n].fees > 0 && Math.abs(totals[n].fees - FEE_ROUND_TRIP * totals[n].deployed) < 1e-9),
    };
    return {
      size, arms: totals, perSeed, impact, deterministic, brainWins, brainBeatsHold,
      signTestVsControl: signTest(brainWins, SEEDS.length), signTestVsHold: signTest(brainBeatsHold, SEEDS.length),
      beatsControl, clearsFeeBar, claim, checks, sound: Object.values(checks).every(Boolean),
    };
  }

  const sweeps = [];
  for (const size of SIZES) {
    out('SIZE ' + size + ' SOL per entry, ' + SEEDS.length + ' seeds, three arms interleaved per seed');
    const s = sweep(size);
    sweeps.push(s);
    out('');
    out('  arm       trips   net SOL      deployed SOL   return on deployed   mean gross return per trip   fees SOL   seeds net positive');
    for (const name of ['brain', 'control', 'hold']) {
      const t = s.arms[name];
      out('  ' + name.padEnd(9) + String(t.trips).padStart(5) + '  ' + f(t.net, 5).padStart(10) + '  ' + f(t.deployed, 4).padStart(13) + '   ' + pct(t.returnOnDeployed).padStart(18) + '   ' + pct(t.meanGrossReturnPerTrip).padStart(26) + '   ' + f(t.fees, 5).padStart(8) + '   ' + String(t.seedsPositive).padStart(2) + ' of ' + SEEDS.length);
    }
    const im = s.impact;
    out('  impact ONLY (not a fee), a round trip at ' + size + ' SOL against the reserves of seed ' + SEEDS[0] + ' over ' + im.readings + ' readings:');
    out('     p10 ' + pct(im.p10, 4) + '   median ' + pct(im.median, 4) + '   p90 ' + pct(im.p90, 4) + '   worst ' + pct(im.worst, 4) + '   mean ' + pct(im.mean, 4));
    out('     ' + pct(im.shareOverFeeBar, 2) + ' of readings cost more in impact alone than the whole ' + pct(FEE_ROUND_TRIP, 2) + ' fee bar');
    out('  brain mean gross return per round trip ' + pct(s.arms.brain.meanGrossReturnPerTrip, 2) + ' against the ' + pct(FEE_ROUND_TRIP, 2) + ' fee bar');
    out('  brain beat the control on ' + s.brainWins + ' of ' + SEEDS.length + ' seeds (sign test p ' + s.signTestVsControl.toFixed(9) + '), beat hold on ' + s.brainBeatsHold + ' of ' + SEEDS.length + ' (p ' + s.signTestVsHold.toFixed(9) + '), deterministic ' + s.deterministic);
    out('  order path: ' + s.arms.brain.orders + ' brain orders, ' + s.arms.brain.fills + ' filled, ' + s.arms.brain.refused + ' refused by the gate, ' + s.arms.brain.openAtEnd + ' open at the end, mean fill lag ' + f(s.arms.brain.meanLagReadings, 3) + ' readings');
    out('  CLAIM at ' + size + ' SOL: ' + s.claim);
    out('');
  }

  const primary = sweeps.find((s) => s.size === PRIMARY) || sweeps[0];
  const quoteReserve = sweeps[0].impact.quoteReserve;
  out('the quote reserve on the seed ' + SEEDS[0] + ' tape: p10 ' + f(quoteReserve.p10, 6) + '  median ' + f(quoteReserve.median, 6) + '  p90 ' + f(quoteReserve.p90, 4) + ' SOL');
  out('so at the incumbent ' + PRIMARY + ' SOL the order IS the book on most readings, and what a fill costs is our own size, not the fee');

  const sound = sweeps.every((s) => s.sound);
  const verdict = {
    at: new Date().toISOString(),
    node: process.version, cpus: cpus().length, platform: process.platform,
    tape: { ...tape0, seeds: SEEDS, instrumentsPerSeed: INSTRUMENTS, minReadings: MIN_READINGS, maxReadings: MAX_READINGS, note: tapeNote, source: tapeSource },
    fee: { ...FEE_SOURCE, value: FEE_ROUND_TRIP, borrowed: true },
    sizes: SIZES, primarySize: PRIMARY,
    sweeps,
    primary: { size: primary.size, arms: primary.arms, beatsControl: primary.beatsControl, clearsFeeBar: primary.clearsFeeBar, claim: primary.claim, brainBeatControlOnSeeds: primary.brainWins, brainBeatHoldOnSeeds: primary.brainBeatsHold, seeds: SEEDS.length },
    claim: primary.claim,
    verdict: sound ? 'GREEN' : 'RED',
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'venue-sampled.json'), JSON.stringify(verdict, null, 2));

  out('');
  out('CLAIM at the primary size ' + PRIMARY + ' SOL: ' + primary.claim);
  const c = primary.checks;
  out('VENUE ' + verdict.verdict + ': every arm ran ' + c.everyArmRan + ', no order refused ' + c.noOrderRefused + ', nothing open at the end ' + c.nothingOpenAtEnd + ', nothing dropped at the border ' + c.nothingDroppedAtTheBorder + ', control rate matched ' + c.controlIsRateMatched + ', deterministic ' + c.deterministic + ', every trip paid the fee ' + c.everyTripPaidTheFee);
  out('wrote bench/verdicts/venue-sampled.json');
  process.exitCode = sound ? 0 : 1;
}

// ================================================================ --full: board 8
// The canonical configuration. Exactly this, on the whole tape, writes venue-full.json;
// anything else writes venue-full-partial.json and says isTheBar false.
const FULL_CANON = Object.freeze({
  generations: 120, pop: 64, draws: 16, instruments: 0, seed: 'venue.full/1',
  share: 0.25, salt: 'venue.holdout/1', maxImpact: 0.01, size: 0.02, lag: 1,
  minReadings: 20, minTripsShare: 0.1, boot: 2000, check: 12,
});

function parseFull(argv) {
  const cfg = { ...FULL_CANON };
  const names = { 'max-impact': 'maxImpact', 'min-readings': 'minReadings', 'min-trips-share': 'minTripsShare' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--') || a === '--full') continue;
    const key = names[a.slice(2)] || a.slice(2);
    if (!(key in cfg)) throw new Error('unknown flag ' + a);
    const v = argv[i + 1];
    i++;
    cfg[key] = typeof FULL_CANON[key] === 'number' ? Number(v) : String(v);
    if (typeof FULL_CANON[key] === 'number' && !Number.isFinite(cfg[key])) throw new Error('flag ' + a + ' needs a number');
  }
  return cfg;
}

const sumArr = (a) => { let s = 0; for (let t = 0; t < a.length; t++) s += a[t]; return s; };
const readingsIn = (tape, idxs) => { let r = 0; for (const i of idxs) r += tape.off[i + 1] - tape.off[i]; return r; };
const statLine = (s) => 'mean ' + f(s.mean, 5) + '  95% interval [' + f(s.lo, 5) + ', ' + f(s.hi, 5) + ']  bootstrap [' + f(s.bootLo, 5) + ', ' + f(s.bootHi, 5) + ']  sd ' + f(s.sd, 4) + '  nFor95 ' + (s.nFor95 ?? 'n/a') + '  (' + s.positive + ' up, ' + s.negative + ' down, ' + s.zero + ' zero, n ' + s.n + ')';
const round = (x, n = 6) => (Number.isFinite(x) ? Number(x.toFixed(n)) : x);
const plainStats = (s) => ({ n: s.n, mean: round(s.mean, 8), sd: round(s.sd, 8), se: round(s.se, 8), lo: round(s.lo, 8), hi: round(s.hi, 8), bootLo: round(s.bootLo, 8), bootHi: round(s.bootHi, 8), boot: s.boot, nFor95: s.nFor95, positive: s.positive, negative: s.negative, zero: s.zero, excludesZero: s.excludesZero, bootExcludesZero: s.bootExcludesZero });
const armBlock = (arms, size) => ({
  instruments: arms.instruments,
  evolved: { ...arms.evolved, netSol: arms.evolved.net * size },
  control: { ...arms.control, netSol: arms.control.net * size },
  hold: { ...arms.hold, netSol: arms.hold.net * size },
});

function subset(xs, mask) { const out = []; for (let t = 0; t < xs.length; t++) if (mask[t]) out.push(xs[t]); return out; }

function runFull(argv) {
  const wall0 = Date.now();
  const cfg = parseFull(argv);
  const isBar = Object.keys(FULL_CANON).every((k) => FULL_CANON[k] === cfg[k]);
  const command = 'node bench/venue.mjs ' + argv.join(' ');
  const outName = isBar ? 'venue-full' : 'venue-full-partial';
  out('VENUE FULL: every recorded instrument, generations on the trader genome, a holdout by instrument, paper only, no order path out of this process');
  out('config ' + JSON.stringify(cfg) + (isBar ? '  (canonical: this run writes the bar)' : '  (not canonical: this run writes ' + outName + '.json, isTheBar false)'));
  out('fee: ' + f(FEE_ROUND_TRIP, 4) + ' round trip, BORROWED: measured on ' + FEE_SOURCE.venueMeasuredOn + ' (' + FEE_SOURCE.file + ', "' + FEE_SOURCE.assertion + '", detail "' + FEE_SOURCE.detail + '"), applied to ' + FEE_SOURCE.venueAppliedTo);
  if (!existsSync(TRADER_DB)) {
    out('NO TAPE: ' + TRADER_DB + ' does not exist, so the full tape cannot be measured and nothing is written');
    process.exitCode = 1;
    return;
  }

  // (a) the full tape, loaded once
  const tape = loadFullTape({ db: TRADER_DB, venue: VENUE, minReadings: cfg.minReadings, instruments: cfg.instruments, seed: cfg.seed });
  const cadence = cadenceOf(tape);
  out('tape: ' + tape.instruments + ' instruments, ' + tape.readings + ' readings (' + tape.eligible + ' instruments eligible with at least ' + cfg.minReadings + ' readings; ' + tape.scanned + ' rows scanned; loaded in ' + tape.loadMs + ' ms)' + (tape.sampled ? '  SAMPLED by seed, --instruments ' + cfg.instruments : '  every eligible instrument'));
  out('cadence ' + f(cadence, 3) + ' s between readings (median); liquidity events (reserve product moved more than ' + pct(LIQ_EVENT, 0) + ' in one reading): ' + tape.liqEvents);

  // (b) holdout by instrument, a stable hash, never by time
  const split = splitByInstrument(tape, { share: cfg.share, salt: cfg.salt });
  const trainSet = new Set(split.train);
  const disjoint = Array.from(split.holdout).every((i) => !trainSet.has(i)) && split.train.length + split.holdout.length === tape.instruments;
  const trainReadings = readingsIn(tape, split.train), holdoutReadings = readingsIn(tape, split.holdout);
  out('split by instrument (hash32 of "' + cfg.salt + ':" + id, holdout share ' + cfg.share + '): train ' + split.train.length + ' instruments ' + trainReadings + ' readings, holdout ' + split.holdout.length + ' instruments ' + holdoutReadings + ' readings, disjoint ' + disjoint);

  const o = { size: cfg.size, fee: FEE_ROUND_TRIP, maxImpact: cfg.maxImpact, lag: cfg.lag, draws: cfg.draws };
  out('fills: ' + cfg.size + ' SOL per entry at the payable price, lag ' + cfg.lag + ' reading, a buy fills only when size / quote reserve <= ' + cfg.maxImpact + ' (slippage cap), sells always fill');

  // (e) the entry ceiling
  const all = Int32Array.from({ length: tape.instruments }, (_, i) => i);
  const ceilAll = ceilingOver(tape, all, o), ceilTrain = ceilingOver(tape, split.train, o), ceilHold = ceilingOver(tape, split.holdout, o);
  out('ceiling (perfect foresight, one round trip, after the fee): clears the fee on ' + ceilAll.clears + ' of ' + ceilAll.instruments + ' instruments (' + pct(ceilAll.share) + '); train ' + ceilTrain.clears + ' of ' + ceilTrain.instruments + ' (' + pct(ceilTrain.share) + '); holdout ' + ceilHold.clears + ' of ' + ceilHold.instruments + ' (' + pct(ceilHold.share) + ')');
  out('   swap only (no liquidity event inside the trip): ' + ceilAll.clearsSwapOnly + ' of ' + ceilAll.instruments + ' (' + pct(ceilAll.shareSwapOnly) + '); no fillable entry at all on ' + ceilAll.noEntry + '; best trip median ' + pct(ceilAll.bestTrip.median) + ', p90 ' + pct(ceilAll.bestTrip.p90));

  // (f) the generations
  const minTrips = Math.ceil(cfg.minTripsShare * split.train.length);
  const ep = new VenueEpochs({ tape, train: split.train, o, seed: cfg.seed, popSize: cfg.pop, minTrips, secondsPerTick: cadence });
  ep.init();
  out('');
  out('GENERATIONS: ' + cfg.generations + ' x ' + cfg.pop + ' genomes of ' + VENUE_GENES.length + ' genes (' + VENUE_GENES.map((g) => g.name).join(', ') + '), fitness net after the fee per trip on train, minTrips ' + minTrips);
  const evo0 = Date.now();
  for (let g = 0; g < cfg.generations; g++) {
    const row = ep.step();
    if (row.gen === 1 || row.gen % 10 === 0 || row.gen === cfg.generations) {
      out('  gen ' + String(row.gen).padStart(4) + '  best ' + f(row.best, 5).padStart(9) + ' per trip (' + row.bestTrips + ' trips)  gen mean ' + f(row.genMean, 4).padStart(8) + '  archive ' + row.fill + ' of ' + venueGridCapacity() + '  fresh ' + row.fresh + '  ' + row.ms + ' ms');
    }
  }
  const evoMs = Date.now() - evo0;
  const summary = ep.summary();
  const best = ep.best();
  const genome = clampVenueGenome(best.genome);
  const evalsPerSec = evoMs > 0 ? summary.evaluations / (evoMs / 1000) : 0;
  out('search: ' + summary.evaluations + ' evaluations (' + summary.cacheHits + ' repeats served from cache) in ' + evoMs + ' ms, ' + f(evalsPerSec, 1) + ' evaluations per wall second, ' + f(summary.readingsReplayed / Math.max(1e-9, evoMs / 1000), 0) + ' readings replayed per wall second');
  out('   ' + summary.yearsArithmetic);
  out('best genome ' + JSON.stringify(genome) + '  train fitness ' + f(best.fitness, 5) + ' per trip on ' + best.ev.trips + ' trips');

  // the three arms on train (the number the search optimised) and on holdout (the one that means anything)
  const trainArms = evaluateArms(tape, split.train, genome, o, cfg.seed + ':train');
  const holdArms = evaluateArms(tape, split.holdout, genome, o, cfg.seed + ':holdout');
  const incumbentArms = evaluateArms(tape, split.holdout, INCUMBENT, o, cfg.seed + ':incumbent');
  const again = evaluateArms(tape, split.holdout, genome, o, cfg.seed + ':holdout');
  const deterministic = again.evolved.net === holdArms.evolved.net && again.control.net === holdArms.control.net && again.hold.net === holdArms.hold.net;

  const e = holdArms.perInstrument.evolved, c = holdArms.perInstrument.control, h = holdArms.perInstrument.hold, k = holdArms.perInstrument.trips;
  const gapC = pairedStats(gapsOf(e, c), { boot: cfg.boot, seed: cfg.seed + ':boot:control' });
  const gapH = pairedStats(gapsOf(e, h), { boot: cfg.boot, seed: cfg.seed + ':boot:hold' });
  const traded = Array.from(k, (x) => x > 0);
  const gapCTraded = pairedStats(subset(gapsOf(e, c), traded), { boot: cfg.boot, seed: cfg.seed + ':boot:traded' });
  const trainGapC = pairedStats(gapsOf(trainArms.perInstrument.evolved, trainArms.perInstrument.control), { boot: cfg.boot, seed: cfg.seed + ':boot:train' });
  const incGapC = pairedStats(gapsOf(incumbentArms.perInstrument.evolved, incumbentArms.perInstrument.control), { boot: cfg.boot, seed: cfg.seed + ':boot:incumbent' });

  // the organism, on the best genome, on holdout instruments with room to trade
  const pickCheck = [];
  for (const i of split.holdout) {
    if (pickCheck.length >= cfg.check) break;
    if (tape.off[i + 1] - tape.off[i] < 60) continue;
    if (ceilingOf(tape, i, o).entries < 20) continue;
    pickCheck.push(i);
  }
  const organism = pickCheck.length >= 3 ? organismAgrees(tape, Int32Array.from(pickCheck), genome, o) : null;

  out('');
  const armLine = (name, a) => '  ' + name.padEnd(9) + ' trips ' + String(a.trips ?? a.tripsMatched).padStart(6) + '   net ' + f(a.net * cfg.size, 5).padStart(11) + ' SOL   per trip ' + pct(a.netPerTrip).padStart(9);
  out('TRAIN (' + trainArms.instruments + ' instruments, the numbers the search optimised)');
  out(armLine('evolved', trainArms.evolved) + '   instruments traded ' + trainArms.evolved.instrumentsTraded);
  out(armLine('control', trainArms.control) + '   (matched trips, ' + cfg.draws + ' draws, fill share ' + pct(trainArms.control.fillShare) + ')');
  out(armLine('hold', trainArms.hold));
  out('  paired gap evolved minus control: ' + statLine(trainGapC));
  out('');
  out('HOLDOUT (' + holdArms.instruments + ' instruments the search never saw)');
  out(armLine('evolved', holdArms.evolved) + '   instruments traded ' + holdArms.evolved.instrumentsTraded + ', buys refused by the slippage cap ' + holdArms.evolved.impactRefused);
  out(armLine('control', holdArms.control) + '   (matched trips ' + holdArms.control.tripsMatched + ' of ' + holdArms.evolved.trips + ', ' + cfg.draws + ' draws, fill share ' + pct(holdArms.control.fillShare) + ', collisions ' + holdArms.control.collisions + ')');
  out(armLine('hold', holdArms.hold) + '   (' + holdArms.hold.noEntry + ' instruments with no fillable entry)');
  out('  paired gap evolved minus control, per instrument, in units of size: ' + statLine(gapC));
  out('  paired gap evolved minus hold, per instrument, in units of size:    ' + statLine(gapH));
  out('  the same control gap on the ' + gapCTraded.n + ' instruments the evolved trader traded: ' + statLine(gapCTraded));
  out('  liquidity events inside a trip: evolved ' + holdArms.evolved.liqTrips + ' of ' + holdArms.evolved.trips + ' trips carrying ' + f(holdArms.evolved.liqNet * cfg.size, 5) + ' SOL; hold ' + holdArms.hold.liqTrips + ' of ' + holdArms.hold.trips + ' carrying ' + f(holdArms.hold.liqNet * cfg.size, 5) + ' SOL');
  out('  incumbent (venue.trader defaults) on the same holdout: trips ' + incumbentArms.evolved.trips + ', per trip ' + pct(incumbentArms.evolved.netPerTrip) + ', gap to its own control ' + statLine(incGapC));
  if (organism) out('  organism check: the best genome through sense.venue, venue.trader, the gate and world.venue on ' + organism.instruments + ' holdout instruments (' + organism.readings + ' readings): organism ' + organism.organismTrips + ' trips, kernel ' + organism.kernelTrips + ' trips, identical ' + organism.identical + ', max pnl difference ' + organism.maxAbsDiff.toExponential(2) + ' SOL, mean fill lag ' + f(organism.lag, 3) + ' readings, gate refusals ' + organism.refused);

  // the claim, from the interval, with the fee bar beside it
  const verdictWord = gapC.lo > 0 ? 'BEATS' : gapC.hi < 0 ? 'LOSES TO' : 'NULL AGAINST';
  const clearsFee = holdArms.evolved.netPerTrip > 0;
  const claim = verdictWord === 'BEATS'
    ? 'the evolved trader BEATS its matched random control on the holdout (the 95 percent interval of the paired gap excludes zero)' + (clearsFee ? ' AND its trips clear the fee' : ' but its trips do NOT clear the fee: an edge over random entries, not a profit')
    : verdictWord === 'LOSES TO'
      ? 'the evolved trader LOSES TO its matched random control on the holdout (the interval sits under zero)'
      : 'NULL: the paired gap between the evolved trader and its matched random control on the holdout has a 95 percent interval that spans zero; nFor95 ' + (gapC.nFor95 ?? 'n/a') + ' instruments would be needed at the observed mean and spread';
  const feeCheck = Math.abs((holdArms.evolved.grossPerTrip - holdArms.evolved.netPerTrip) - FEE_ROUND_TRIP) < 1e-9 || holdArms.evolved.trips === 0;
  const checks = {
    tapeIsRecorded: tape.source === 'trader.db' && !tape.synthetic,
    everyEligibleInstrumentLoaded: tape.sampled || tape.instruments === tape.eligible,
    splitDisjointByInstrument: disjoint,
    searchSawOnlyTrain: ep.train === split.train,
    evolvedTraded: holdArms.evolved.trips > 0,
    controlTripMatched: holdArms.control.tripsMatched === holdArms.evolved.trips,
    everyTripPaidTheFee: feeCheck,
    deterministic,
    organismAgreesWithKernel: !!(organism && organism.identical && organism.organismTrips > 0),
  };
  const sound = Object.values(checks).every(Boolean);
  out('');
  out('CLAIM: ' + claim);
  out('fee bar: evolved holdout per trip after the fee ' + pct(holdArms.evolved.netPerTrip) + ' (before the fee ' + pct(holdArms.evolved.grossPerTrip) + '), clears the ' + pct(FEE_ROUND_TRIP) + ' bar ' + clearsFee);
  out('checks ' + JSON.stringify(checks) + '  sound ' + sound);

  const statement = 'On the recorded pumpswap tape read only from trader.db (' + tape.instruments + ' instruments, ' + tape.readings + ' readings' + (tape.sampled ? ', SAMPLED by seed to ' + cfg.instruments + ' instruments' : ', every instrument with at least ' + cfg.minReadings + ' readings') + '), split by a stable hash of the instrument id into ' + split.train.length + ' train and ' + split.holdout.length + ' holdout instruments, ' + cfg.generations + ' generations of ' + cfg.pop + ' venue.trader genomes (' + summary.evaluations + ' evaluations, ' + f(evalsPerSec, 1) + ' per wall second) were selected on net after the borrowed ' + FEE_ROUND_TRIP + ' round trip fee per trip on train. Perfect foresight clears the fee on ' + ceilHold.clears + ' of ' + ceilHold.instruments + ' holdout instruments. On the holdout the evolved trader made ' + holdArms.evolved.trips + ' trips on ' + holdArms.evolved.instrumentsTraded + ' instruments for ' + f(holdArms.evolved.net * cfg.size, 5) + ' SOL (' + pct(holdArms.evolved.netPerTrip) + ' per trip), its matched random control (the same trips per instrument, random fillable entries, the same exit rule) ' + f(holdArms.control.net * cfg.size, 5) + ' SOL (' + pct(holdArms.control.netPerTrip) + ' per trip), and hold ' + f(holdArms.hold.net * cfg.size, 5) + ' SOL over ' + holdArms.hold.trips + ' trips (' + pct(holdArms.hold.netPerTrip) + ' per trip). The paired gap evolved minus control is ' + f(gapC.mean, 5) + ' of size per instrument with a 95 percent interval [' + f(gapC.lo, 5) + ', ' + f(gapC.hi, 5) + '] and nFor95 ' + (gapC.nFor95 ?? 'n/a') + ', so the evolved trader ' + verdictWord + ' its control; against hold the gap is ' + f(gapH.mean, 5) + ' [' + f(gapH.lo, 5) + ', ' + f(gapH.hi, 5) + ']. The organism ran the best genome on ' + (organism ? organism.instruments : 0) + ' holdout instruments and its book was ' + (organism && organism.identical ? 'identical' : 'NOT identical') + ' to the kernel trip for trip. Nothing placed an order: replay only.';

  const verdict = {
    at: new Date().toISOString(), command, node: process.version, cpus: cpus().length, platform: process.platform,
    isTheBar: isBar, statement, claim, verdict: verdictWord, clearsFee, sound, checks,
    wallMs: Date.now() - wall0,
    config: cfg, canonical: FULL_CANON,
    units: 'every net, netPerTrip, grossPerTrip, liqNet and every paired gap is in units of the entry size (1.0 = one entry of size SOL); netSol = net x size in SOL; meanHeld is in readings',
    fee: { ...FEE_SOURCE, value: FEE_ROUND_TRIP, borrowed: true },
    fills: { size: cfg.size, lag: cfg.lag, maxImpact: cfg.maxImpact, note: 'payable price from the recorded reserves; a buy fills only when size / quote reserve <= maxImpact; sells always fill; the fee is charged once per closed trip on its size' },
    tape: { source: tape.source, db: tape.db, venue: tape.venue, instruments: tape.instruments, readings: tape.readings, eligible: tape.eligible, minReadings: cfg.minReadings, sampled: tape.sampled, scanned: tape.scanned, loadMs: tape.loadMs, cadenceSeconds: cadence, liqEvents: tape.liqEvents, liqThreshold: LIQ_EVENT },
    split: { by: 'instrument', hash: 'hash32(salt + ":" + signature) % 10000 < share * 10000', salt: cfg.salt, share: cfg.share, train: split.train.length, holdout: split.holdout.length, trainReadings, holdoutReadings, disjoint },
    ceiling: { all: ceilAll, train: ceilTrain, holdout: ceilHold },
    search: { ...summary, manifest: ep.manifest(), minTrips, evoMs, evaluationsPerWallSecond: evalsPerSec, readingsPerWallSecond: summary.readingsReplayed / Math.max(1e-9, evoMs / 1000), history: ep.history.map((r) => ({ gen: r.gen, best: round(r.best, 6), bestTrips: r.bestTrips, genMean: round(r.genMean, 6), fill: r.fill, fresh: r.fresh, ms: r.ms })) },
    best: { genome, trainFitness: best.fitness, trainTrips: best.ev.trips, trainNetPerTrip: best.ev.netPerTrip },
    train: { ...armBlock(trainArms, cfg.size), gapVsControl: plainStats(trainGapC) },
    holdout: { ...armBlock(holdArms, cfg.size), gapVsControl: plainStats(gapC), gapVsHold: plainStats(gapH), gapVsControlOnTraded: plainStats(gapCTraded) },
    incumbentOnHoldout: { genome: INCUMBENT, ...armBlock(incumbentArms, cfg.size), gapVsControl: plainStats(incGapC) },
    organism,
    unmodelled: [
      'the tape after our own order is the recorded tape: our fill moves nothing the next reading reports',
      'every instrument is its own book: no cap on positions open at once across instruments',
      'the fee is borrowed from pump.fun; the round trip cost of pumpswap has never been measured',
      'the holdout is split by instrument, not by time: holdout instruments share the train instruments calendar (2026-09-07 to 2026-09-11)',
    ],
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  const file = path.join(HERE, 'verdicts', outName + '.json');
  writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  out('wrote ' + path.relative(path.resolve(HERE, '..'), file).replaceAll('\\', '/') + ' (isTheBar ' + isBar + ') in ' + ((Date.now() - wall0) / 1000).toFixed(1) + ' s wall');
  process.exitCode = sound ? 0 : 1;
}

// ================================================================ the default: board 11, the sensor trader (the bar)
// The canonical configuration. Exactly this, on the whole tape, writes venue.json with
// isTheBar true; anything else writes venue-partial.json and says isTheBar false.
const SENSOR_CANON = Object.freeze({
  generations: 120, pop: 64, draws: 16, tolS: 30, instruments: 0, seed: 'venue.sensors/1',
  share: 0.25, salt: 'venue.holdout/1', foldSalt: 'venue.fold/1', maxImpact: 0.01, size: 0.02, lag: 1,
  minReadings: 20, minTripsShare: 0.1, window: SENSOR_WINDOW, boot: 2000, aucBoot: 200, check: 12,
});

function parseSensors(argv) {
  const cfg = { ...SENSOR_CANON };
  const names = { 'max-impact': 'maxImpact', 'min-readings': 'minReadings', 'min-trips-share': 'minTripsShare', 'tol-s': 'tolS', 'fold-salt': 'foldSalt', 'auc-boot': 'aucBoot' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--') || a === '--sensors') continue;
    const key = names[a.slice(2)] || a.slice(2);
    if (!(key in cfg)) throw new Error('unknown flag ' + a);
    const v = argv[i + 1];
    i++;
    cfg[key] = typeof SENSOR_CANON[key] === 'number' ? Number(v) : String(v);
    if (typeof SENSOR_CANON[key] === 'number' && !Number.isFinite(cfg[key])) throw new Error('flag ' + a + ' needs a number');
  }
  return cfg;
}

const gatesOn = (genome) => {
  const g = clampSensorGenome(genome);
  const on = [];
  for (const gene of SENSOR_GENES) {
    if (gene.part !== 'gate') continue;
    const v = g[gene.name];
    if (gene.values ? v !== -1 : gene.offNull ? v !== null : v > 0) on.push(gene.name + ' ' + (typeof v === 'number' && !Number.isInteger(v) ? Number(v.toPrecision(4)) : v));
  }
  return on;
};
const exitOf = (genome) => {
  const g = clampSensorGenome(genome);
  return EXIT_GENES.map((k) => k + ' ' + (g[k] === 0 ? 'off' : Number(Number(g[k]).toPrecision(4)))).join(', ');
};
const ungated = (genome) => {
  const g = { ...clampSensorGenome(genome) };
  for (const gene of SENSOR_GENES) if (gene.part === 'gate') g[gene.name] = SENSOR_BASE[gene.name];
  return g;
};
const pn = (x) => (x === null || x === undefined ? 'n/a' : pct(x));
const ivl = (st) => f(st.mean, 5) + ' [' + f(st.lo, 5) + ', ' + f(st.hi, 5) + ']';
const aucCell = (a) => f(a.auc, 4) + ' [' + f(a.lo, 4) + ', ' + f(a.hi, 4) + ']' + (a.excludesHalf ? ' *' : '  ');
const plainGrade = (g, size) => ({
  instruments: g.instruments, instrumentsTraded: g.instrumentsTraded,
  evolved: { ...g.evolved, netSol: g.evolved.net * size },
  ageControl: { ...g.ageControl, netSol: g.ageControl.net * size },
  within: { ...g.within, netSol: g.within.net * size },
  hold: { ...g.hold, netSol: g.hold.net * size },
  gapAge: plainStats(g.gapAge), gapAgeTraded: plainStats(g.gapAgeTraded), gapAgePerTrip: plainStats(g.gapAgePerTrip),
  gapWithin: plainStats(g.gapWithin), gapHold: plainStats(g.gapHold), checks: g.checks,
});
const plainAucs = (a) => {
  const per = {};
  for (const [k, v] of Object.entries(a.per)) per[k] = { win: { auc: round(v.win.auc, 6), lo: round(v.win.lo, 6), hi: round(v.win.hi, 6), excludesHalf: v.win.excludesHalf }, beatsAge: { auc: round(v.beatsAge.auc, 6), lo: round(v.beatsAge.lo, 6), hi: round(v.beatsAge.hi, 6), excludesHalf: v.beatsAge.excludesHalf } };
  return { entries: a.entries, instruments: a.instruments, winRate: round(a.winRate, 6), beatsAgeRate: round(a.beatsAgeRate, 6), meanPerEntry: round(a.meanPerEntry, 6), tailRate: round(a.tailRate, 6), boot: a.boot, per };
};

function runSensors(argv) {
  const wall0 = Date.now();
  const cfg = parseSensors(argv);
  const isBar = Object.keys(SENSOR_CANON).every((k) => SENSOR_CANON[k] === cfg[k]);
  const command = 'node bench/venue.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  const outName = isBar ? 'venue' : 'venue-partial';
  out('VENUE SENSORS (board 11): typed sensors into the venue.trader gate, generations over entry rules and the trailing exit on TRAIN, the elite graded once on HOLDOUT against an age matched control; replay only, read only, no network, no order path out of this process');
  out('config ' + JSON.stringify(cfg) + (isBar ? '  (canonical: this run writes the bar, bench/verdicts/venue.json)' : '  (not canonical: this run writes ' + outName + '.json, isTheBar false)'));
  out('fee: ' + f(FEE_ROUND_TRIP, 4) + ' round trip, BORROWED: measured on ' + FEE_SOURCE.venueMeasuredOn + ' (' + FEE_SOURCE.file + ', "' + FEE_SOURCE.assertion + '"), applied to ' + FEE_SOURCE.venueAppliedTo);
  out('   charged on BOTH legs: ' + f(FEE_ROUND_TRIP / 2, 4) + ' of the buy notional plus ' + f(FEE_ROUND_TRIP / 2, 4) + ' of the sell proceeds, so a flat trip pays exactly ' + f(FEE_ROUND_TRIP, 4) + ' and a winner pays more; every return below is at the PAYABLE price after that fee, never a mid price return');
  out('   this machine is shared (other sessions and one Ollama queue run beside it): wall times below are not latencies and no latency is claimed');
  if (!existsSync(TRADER_DB)) {
    out('NO TAPE: ' + TRADER_DB + ' does not exist, so the full tape cannot be measured and nothing is written');
    process.exitCode = 1;
    return;
  }

  // the tape, its sensors, its split
  const tape = loadFullTape({ db: TRADER_DB, venue: VENUE, minReadings: cfg.minReadings, instruments: cfg.instruments, seed: cfg.seed });
  attachSensors(tape, cfg.window);
  const cadence = cadenceOf(tape);
  out('tape: ' + tape.instruments + ' instruments, ' + tape.readings + ' readings (' + tape.eligible + ' eligible with at least ' + cfg.minReadings + ' readings; ' + tape.scanned + ' rows scanned; loaded in ' + tape.loadMs + ' ms), read only from ' + TRADER_DB.replaceAll('\\', '/') + (tape.sampled ? '  SAMPLED by seed' : '  every eligible instrument'));
  out('   births: ' + tape.birthRows + ' rows of the pool table; origins ' + JSON.stringify(tape.origins) + '; readings with no recorded age ' + tape.agesMissing + '; cadence ' + f(cadence, 3) + ' s (median)');
  out('sensors (window ' + cfg.window + ' readings): ' + VENUE_SENSORS.map((s) => s.name + ' ' + s.type + ' ' + s.unit).join(' | '));
  const split = splitByInstrument(tape, { share: cfg.share, salt: cfg.salt });
  const trainSet = new Set(split.train);
  const disjoint = Array.from(split.holdout).every((i) => !trainSet.has(i)) && split.train.length + split.holdout.length === tape.instruments;
  const trainReadings = readingsIn(tape, split.train), holdoutReadings = readingsIn(tape, split.holdout);
  out('split by instrument (hash32 of "' + cfg.salt + ':" + id, share ' + cfg.share + '): TRAIN ' + split.train.length + ' instruments ' + trainReadings + ' readings = DEVELOPMENT (the search, its folds, its baseline, and every line labelled TRAIN); HOLDOUT ' + split.holdout.length + ' instruments ' + holdoutReadings + ' readings = HELD OUT (read once, after the search, by the grade below); disjoint ' + disjoint);
  const o = { size: cfg.size, fee: FEE_ROUND_TRIP, maxImpact: cfg.maxImpact, lag: cfg.lag, legs: true, draws: cfg.draws };
  out('fills: ' + cfg.size + ' SOL per entry at the payable price, lag ' + cfg.lag + ' reading, a buy fills only when size / SOL reserve <= ' + cfg.maxImpact + '; sells always fill');

  // the generations, on train only
  const minTrips = Math.ceil(cfg.minTripsShare * split.train.length);
  const ep = new SensorEpochs({ tape, train: split.train, o, seed: cfg.seed, popSize: cfg.pop, minTrips, secondsPerTick: cadence, foldSalt: cfg.foldSalt });
  ep.init();
  const folds = [0, 0];
  for (const x of ep.fold) folds[x]++;
  out('');
  out('GENERATIONS (TRAIN only): ' + cfg.generations + ' x ' + cfg.pop + ' genomes of ' + SENSOR_GENES.length + ' genes (gate: ' + SENSOR_GENES.filter((g) => g.part === 'gate').map((g) => g.name).join(', ') + '; trailing exit: ' + EXIT_GENES.join(', ') + ')');
  out('   fitness: min over two train folds (' + folds[0] + ' and ' + folds[1] + ' instruments) of the t statistic over instruments of sum(trip return - mean return of every fillable entry of the same fold in the same age bin, same exit); ' + AGE_BINS + ' age bins; ' + ep.baseline.entries + ' fillable train entries in the baseline; minTrips ' + minTrips);
  const evo0 = Date.now();
  for (let g = 0; g < cfg.generations; g++) {
    const row = ep.step();
    if (row.gen === 1 || row.gen % 10 === 0 || row.gen === cfg.generations) {
      out('  gen ' + String(row.gen).padStart(4) + '  best t ' + f(row.best, 3).padStart(8) + ' (' + row.bestTrips + ' trips)  archive ' + row.fill + ' of ' + venueGridCapacity() + '  fresh ' + row.fresh + '  ' + row.ms + ' ms');
    }
  }
  const evoMs = Date.now() - evo0;
  const summary = ep.summary();
  const best = ep.best();
  const genome = clampSensorGenome(best.genome);
  out('search: ' + summary.evaluations + ' evaluations (' + summary.cacheHits + ' repeats from cache) in ' + evoMs + ' ms wall; age baselines computed ' + summary.baseline.computed + ', reused ' + summary.baseline.reused);
  out('   ' + summary.yearsArithmetic);
  out('elite: gates on [' + gatesOn(genome).join('; ') + ']; exit ' + exitOf(genome));
  out('   TRAIN fitness (min fold t) ' + f(best.fitness, 3) + ', fold t ' + f(best.ev.tFolds[0], 3) + ' and ' + f(best.ev.tFolds[1], 3) + ', ' + best.ev.trips + ' train trips, train gap to the age baseline ' + pct(best.ev.gapPerTrip) + ' per trip, train net ' + pct(best.ev.netPerTrip) + ' per trip');

  // the grade: train (development) then holdout (the bar)
  const gTrain = gradeSensorElite(tape, split.train, genome, o, { draws: cfg.draws, tolS: cfg.tolS, seed: cfg.seed + ':train', boot: cfg.boot });
  const g = gradeSensorElite(tape, split.holdout, genome, o, { draws: cfg.draws, tolS: cfg.tolS, seed: cfg.seed + ':holdout', boot: cfg.boot });
  const again = gradeSensorElite(tape, split.holdout, genome, o, { draws: cfg.draws, tolS: cfg.tolS, seed: cfg.seed + ':holdout', boot: cfg.boot });
  const deterministic = again.gapAge.mean === g.gapAge.mean && again.gapAge.lo === g.gapAge.lo && again.ageControl.net === g.ageControl.net && again.within.net === g.within.net && again.evolved.net === g.evolved.net;
  const gUngated = gradeSensorElite(tape, split.holdout, ungated(genome), o, { draws: cfg.draws, tolS: cfg.tolS, seed: cfg.seed + ':holdout:ungated', boot: cfg.boot });
  const gBase = gradeSensorElite(tape, split.holdout, SENSOR_BASE, o, { draws: cfg.draws, tolS: cfg.tolS, seed: cfg.seed + ':holdout:base', boot: cfg.boot });
  const qElite = normalizeTrader(sensorParamsOf(genome, o));
  const aucHold = sensorAucs(tape, split.holdout, qElite, o, { boot: cfg.aucBoot, seed: cfg.seed + ':auc:holdout' });
  const aucTrain = sensorAucs(tape, split.train, qElite, o, { boot: cfg.aucBoot, seed: cfg.seed + ':auc:train' });

  // the organism, on holdout instruments the elite trades early enough to survive the common cut
  const firstEntry = new Map();
  for (const x of g.trips) if (!firstEntry.has(x.i)) firstEntry.set(x.i, x.d);
  let pick = Array.from(split.holdout).filter((i) => firstEntry.has(i) && tape.off[i + 1] - tape.off[i] >= 80 && firstEntry.get(i) <= 40).slice(0, cfg.check);
  if (pick.length < 3) pick = Array.from(split.holdout).filter((i) => firstEntry.has(i)).slice(0, cfg.check);
  const organism = pick.length >= 3 ? organismAgrees(tape, Int32Array.from(pick), null, o, { params: sensorParamsOf(genome, o) }) : null;

  out('');
  const e = g.evolved, c = g.ageControl;
  out('TRAIN (DEVELOPMENT: the ' + gTrain.instruments + ' instruments the search optimised on; not evidence)');
  out('  evolved trips ' + gTrain.evolved.trips + ' on ' + gTrain.instrumentsTraded + ' instruments, per trip ' + pct(gTrain.evolved.netPerTrip) + '; age control per trip ' + pct(gTrain.ageControl.netPerTrip) + '; gap per instrument ' + statLine(gTrain.gapAge));
  out('');
  out('HOLDOUT (HELD OUT: ' + g.instruments + ' instruments the search never read)');
  out('  evolved      trips ' + e.trips + ' on ' + g.instrumentsTraded + ' instruments, net ' + f(e.net * cfg.size, 5) + ' SOL, per trip ' + pct(e.netPerTrip) + ' (before the fee ' + pct(e.grossPerTrip) + ', fee paid ' + pct(e.feesPerTrip) + ' per trip), mean hold ' + f(e.meanHeld, 2) + ' readings, exits ' + JSON.stringify(e.why) + ', buys refused by the slippage cap ' + e.impactRefused);
  out('  age control  trips matched ' + c.tripsMatched + ' of ' + e.trips + ', ' + c.draws + ' draws each (' + c.drawnTrips + ' drawn trips), per trip ' + pct(c.netPerTrip) + ', net ' + f(c.net * cfg.size, 5) + ' SOL; max age gap ' + f(c.maxAgeGap, 3) + ' s (tolerance ' + c.tolS + ' s); other instruments alive and fillable at the trip age: min ' + c.candidates.min + ', median ' + c.candidates.median + ', max ' + c.candidates.max + '; trips with none (excluded from BOTH arms) ' + g.checks.unmatchedTrips);
  out('  GAP evolved minus age control, per instrument, units of size: ' + statLine(g.gapAge));
  out('      = ' + f(g.gapAge.mean * cfg.size, 7) + ' SOL per holdout instrument, interval [' + f(g.gapAge.lo * cfg.size, 7) + ', ' + f(g.gapAge.hi * cfg.size, 7) + '] SOL');
  out('  the same gap on the ' + g.gapAgeTraded.n + ' traded instruments only: ' + statLine(g.gapAgeTraded));
  out('  the gap per trip (NOT clustered by instrument, a second ruler only): ' + statLine(g.gapAgePerTrip));
  out('  within instrument random time control (board 8 control, same trips per instrument, same exit), gap: ' + statLine(g.gapWithin));
  out('  hold (one trip per instrument, first fillable reading to the last), gap: ' + statLine(g.gapHold));
  out('  win rate: evolved ' + pct(e.tail.winRate) + ' (' + e.tail.wins + ' of ' + e.tail.trips + ') vs age control ' + pct(c.tail.winRate) + ' (' + c.tail.wins + ' of ' + c.tail.trips + ' drawn trips)');
  out('  tail: trips at +100% or more, evolved ' + e.tail.tailTrips + ' (' + pct(e.tail.tailRate, 3) + ') vs age control ' + pct(c.tail.tailRate, 3) + '; the top 5% of evolved trips (' + e.tail.top5pctTrips + ') carry ' + pn(e.tail.top5pctShareOfWinnings) + ' of its winnings (control ' + pn(c.tail.top5pctShareOfWinnings) + '); ' + (e.tail.kFor100 ? e.tail.kFor100 + ' trips carry 100% of the net' : 'the evolved net is not positive, so no set of trips carries it') + '; best trip ' + pct(e.tail.best) + ', worst ' + pct(e.tail.worst));
  out('  payable check: ' + g.checks.payableViolations + ' of ' + g.checks.tripsChecked + ' booked trips (evolved and every control draw) filled better than the ratio the pool reported (must be 0)');
  out('  fee check: max |fee paid - both legs fee of its own proceeds| or |gross - fee - net| = ' + g.checks.feeMaxDev.toExponential(2) + ' over ' + g.checks.tripsChecked + ' trips; ' + g.checks.feesAboveFlat + ' of ' + e.trips + ' evolved trips paid more than the flat ' + FEE_ROUND_TRIP + ' (their proceeds exceeded the notional)');
  out('  attribution (reference arms, NOT the bar): the elite exit with every gate removed, trips ' + gUngated.evolved.trips + ', per trip ' + pct(gUngated.evolved.netPerTrip) + ', gap to its own age control ' + statLine(gUngated.gapAge));
  out('                                            its gap PER TRIP ' + ivl(gUngated.gapAgePerTrip) + ' against the elite per trip gap ' + ivl(g.gapAgePerTrip) + ' (per instrument sums grow with trip count; per trip they do not)');
  out('                                            the ungated SENSOR_BASE (trail ' + SENSOR_BASE.trail + ', hold ' + SENSOR_BASE.maxHold + '), trips ' + gBase.evolved.trips + ', per trip ' + pct(gBase.evolved.netPerTrip) + ', gap ' + statLine(gBase.gapAge));
  out('                                            its gap PER TRIP ' + ivl(gBase.gapAgePerTrip));
  out('');
  const aucHeader = '  sensor     win AUC [95% by instrument]      beats-age-bin AUC [95%]      (* the interval excludes 0.5)';
  out('SENSOR AUCs on HOLDOUT (HELD OUT): every fillable entry once, the elite exit, no gate: ' + aucHold.entries + ' entries on ' + aucHold.instruments + ' instruments, win rate ' + pct(aucHold.winRate) + ', mean ' + pct(aucHold.meanPerEntry) + ' per entry after the fee, ' + aucHold.boot + ' instrument resamples');
  out(aucHeader);
  for (const name of SENSOR_NAMES) out('  ' + name.padEnd(9) + '  ' + aucCell(aucHold.per[name].win).padEnd(30) + '  ' + aucCell(aucHold.per[name].beatsAge));
  out('SENSOR AUCs on TRAIN (DEVELOPMENT): ' + aucTrain.entries + ' entries on ' + aucTrain.instruments + ' instruments');
  for (const name of SENSOR_NAMES) out('  ' + name.padEnd(9) + '  ' + aucCell(aucTrain.per[name].win).padEnd(30) + '  ' + aucCell(aucTrain.per[name].beatsAge));
  if (organism) out('organism check: the elite through sense.venue (sensors computed per reading), venue.trader (the gate), world.venue (the fee on both legs) on ' + organism.instruments + ' holdout instruments (' + organism.readings + ' readings): organism ' + organism.organismTrips + ' trips, kernel ' + organism.kernelTrips + ', identical ' + organism.identical + ', max pnl difference ' + organism.maxAbsDiff.toExponential(2) + ' SOL, mean fill lag ' + f(organism.lag, 3) + ' readings');
  else out('organism check: fewer than three holdout instruments traded, NOT RUN');

  const verdictWord = g.gapAge.lo > 0 ? 'BEATS' : g.gapAge.hi < 0 ? 'LOSES TO' : 'NULL AGAINST';
  const barMet = g.gapAge.lo > 0;
  const clearsFee = e.netPerTrip > 0;
  const aucSig = SENSOR_NAMES.filter((n) => aucHold.per[n].beatsAge.excludesHalf).map((n) => n + ' ' + f(aucHold.per[n].beatsAge.auc, 4));
  const checks = {
    tapeIsRecorded: tape.source === 'trader.db' && !tape.synthetic,
    tapeComplete: tape.sampled ? tape.instruments === cfg.instruments : tape.instruments === tape.eligible,
    splitDisjointByInstrument: disjoint,
    searchSawOnlyTrain: ep.train === split.train,
    evolvedTraded: e.trips > 0,
    controlMatchesTradeCount: c.tripsMatched + g.checks.unmatchedTrips === e.trips && c.shortDrawn === g.checks.unmatchedTrips && c.drawnTrips === c.tripsMatched * c.draws,
    controlMatchesAges: c.maxAgeGap <= cfg.tolS,
    payableNeverBeatsMid: g.checks.payableViolations === 0,
    feeOnBothLegs: g.checks.feeMaxDev < 1e-9,
    deterministic,
    organismAgreesWithKernel: !!(organism && organism.identical && organism.organismTrips > 0),
  };
  const sound = Object.values(checks).every(Boolean);
  const claim = verdictWord === 'BEATS'
    ? 'the sensor elite BEATS its age matched control on the holdout: the 95 percent interval of the per instrument gap excludes zero on the favourable side' + (clearsFee ? ', AND its trips clear the fee on both legs' : ', but its trips do NOT clear the fee on both legs (' + pct(e.netPerTrip) + ' per trip): an edge over random entries at the same ages, not a profit')
    : verdictWord === 'LOSES TO'
      ? 'the sensor elite LOSES TO its age matched control on the holdout (the interval sits under zero)'
      : 'NULL: the per instrument gap between the sensor elite and its age matched control on the holdout has a 95 percent interval that spans zero; nFor95 ' + (g.gapAge.nFor95 ?? 'n/a') + ' instruments would be needed at the observed mean and spread';
  out('');
  out('CLAIM: ' + claim);
  out('BAR (the holdout gap interval excludes zero on the favourable side): ' + (barMet ? 'MET' : 'NOT MET') + '; gap ' + f(g.gapAge.mean, 5) + ' [' + f(g.gapAge.lo, 5) + ', ' + f(g.gapAge.hi, 5) + '] nFor95 ' + (g.gapAge.nFor95 ?? 'n/a') + ', trades ' + e.trips + ', win rate ' + pct(e.tail.winRate) + ', top 5% share ' + pn(e.tail.top5pctShareOfWinnings) + ', payable violations ' + g.checks.payableViolations);
  out('checks ' + JSON.stringify(checks) + '  sound ' + sound);

  const pE = g.gapAgePerTrip, pU = gUngated.gapAgePerTrip;
  const attribution = (pU.lo > 0 ? 'the exit with no gate already beats random entries at the same ages, so part of the gap is the exit and the entry timing it allows' : 'the exit with no gate is not separable from its age control, so the gap is not the exit alone') +
    (pE.lo > pU.hi ? ', and the gate adds per trip gap beyond it (the two per trip intervals do not overlap)' : pE.hi < pU.lo ? ', and the gate LOWERS the per trip gap (the intervals do not overlap)' : ', and the two per trip intervals overlap, so what the gate adds per trip is not separated');
  const statement = 'On the recorded pumpswap tape read only from trader.db (' + tape.instruments + ' instruments, ' + tape.readings + ' readings' + (tape.sampled ? ', SAMPLED by seed' : ', every instrument with at least ' + cfg.minReadings + ' readings') + '), ' + VENUE_SENSORS.length + ' typed sensors (real SOL, age, trading and buying intervals in the last ' + cfg.window + ' readings, reserve slope, market births in ' + BIRTH_WINDOW_S + ' s, migrated origin) fed the venue.trader gate; ' + cfg.generations + ' generations of ' + cfg.pop + ' genomes (' + summary.evaluations + ' evaluations) over the gate and a trailing exit were selected on TRAIN only (' + split.train.length + ' instruments, the development set) by the smaller fold t statistic of the per instrument gap to an age binned baseline, and the one elite (gates ' + gatesOn(genome).join(', ') + '; exit ' + exitOf(genome) + ') was graded once on the ' + split.holdout.length + ' HELD OUT instruments at the payable price after the borrowed ' + FEE_ROUND_TRIP + ' fee charged on both legs. It made ' + e.trips + ' trips on ' + g.instrumentsTraded + ' instruments at ' + pct(e.netPerTrip) + ' per trip (' + f(e.net * cfg.size, 5) + ' SOL), win rate ' + pct(e.tail.winRate) + ', its top 5 percent of trips carrying ' + pn(e.tail.top5pctShareOfWinnings) + ' of its winnings; its age matched control (the same ' + c.tripsMatched + ' trips, ' + c.draws + ' random entries each on other holdout instruments within ' + cfg.tolS + ' s of the same age, the same exit, size and fee; ' + g.checks.unmatchedTrips + ' trips had no instrument alive at their age and were excluded from both arms) made ' + pct(c.netPerTrip) + ' per trip, win rate ' + pct(c.tail.winRate) + '. The per instrument gap is ' + f(g.gapAge.mean, 5) + ' of size with a 95 percent interval [' + f(g.gapAge.lo, 5) + ', ' + f(g.gapAge.hi, 5) + '] and nFor95 ' + (g.gapAge.nFor95 ?? 'n/a') + ', so the elite ' + verdictWord + ' its control and the bar is ' + (barMet ? 'MET' : 'NOT MET') + (barMet && !clearsFee ? ', though its trips do not clear the fee' : '') + '. Against random times on the SAME instruments (the board 8 control, same exit) the per instrument gap is ' + ivl(g.gapWithin) + '. Per trip the elite gains ' + ivl(g.gapAgePerTrip) + ' over its age control; the same exit with no gate (' + gUngated.evolved.trips + ' trips) gains ' + ivl(gUngated.gapAgePerTrip) + ' per trip over its own (per instrument ' + ivl(gUngated.gapAge) + '; a per instrument sum grows with trip count, a per trip gap does not): ' + attribution + '. On the holdout census the sensors whose beats-the-age-bin AUC interval excludes 0.5 are ' + (aucSig.length ? aucSig.join(', ') : 'none') + '. ' + g.checks.payableViolations + ' of ' + g.checks.tripsChecked + ' trips filled better than the reported ratio, every trip paid the both legs fee of its own proceeds, the organism book was ' + (organism && organism.identical ? 'identical' : 'NOT identical') + ' to the kernel on ' + (organism ? organism.instruments : 0) + ' holdout instruments, and a second grade was ' + (deterministic ? 'identical' : 'DIFFERENT') + '. Nothing placed an order; wall times are of a shared machine and no latency is claimed.';

  const verdict = {
    at: new Date().toISOString(), command, node: process.version, cpus: cpus().length, platform: process.platform,
    isTheBar: isBar, statement, claim, verdict: verdictWord, barMet, clearsFee, sound, checks,
    wallMs: Date.now() - wall0, rssMb: Number((process.memoryUsage().rss / 1048576).toFixed(1)),
    sharedMachine: 'measured on a shared machine (other sessions and one Ollama queue); wall times are not latencies and no latency is claimed',
    config: cfg, canonical: SENSOR_CANON,
    units: 'every net, netPerTrip, gap and tail number is in units of the entry size (1.0 = one entry of size SOL) at the payable price after the fee on both legs; netSol = net x size; meanHeld in readings; ages in seconds',
    fee: { ...FEE_SOURCE, value: FEE_ROUND_TRIP, borrowed: true, legs: 'fee/2 of the buy notional + fee/2 of the sell proceeds; a flat trip pays exactly the round trip fee' },
    fills: { size: cfg.size, lag: cfg.lag, maxImpact: cfg.maxImpact, note: 'payable price from the recorded reserves; a buy fills only when size / SOL reserve <= maxImpact; sells always fill' },
    tape: { source: tape.source, db: tape.db, venue: tape.venue, instruments: tape.instruments, readings: tape.readings, eligible: tape.eligible, sampled: tape.sampled, scanned: tape.scanned, loadMs: tape.loadMs, cadenceSeconds: cadence, birthRows: tape.birthRows, origins: tape.origins, agesMissing: tape.agesMissing },
    sensors: { window: cfg.window, list: VENUE_SENSORS },
    split: { by: 'instrument', hash: 'hash32(salt + ":" + signature) % 10000 < share * 10000', salt: cfg.salt, share: cfg.share, train: split.train.length, holdout: split.holdout.length, trainReadings, holdoutReadings, disjoint, development: 'train: the search, its two folds, its age baseline and every TRAIN line', heldOut: 'holdout: read once after the search by gradeSensorElite and sensorAucs' },
    search: { ...summary, manifest: ep.manifest(), minTrips, folds, evoMs, history: ep.history.map((r) => ({ gen: r.gen, best: round(r.best, 6), bestTrips: r.bestTrips, genMean: round(r.genMean, 6), fill: r.fill, fresh: r.fresh, ms: r.ms })) },
    elite: { genome, gatesOn: gatesOn(genome), exit: exitOf(genome), params: sensorParamsOf(genome, o), trainFitness: best.fitness, trainTFolds: best.ev.tFolds, trainTrips: best.ev.trips, trainGapPerTrip: best.ev.gapPerTrip, trainNetPerTrip: best.ev.netPerTrip },
    train: plainGrade(gTrain, cfg.size),
    holdout: plainGrade(g, cfg.size),
    reference: { eliteExitNoGate: { genome: ungated(genome), ...plainGrade(gUngated, cfg.size) }, sensorBase: { genome: SENSOR_BASE, ...plainGrade(gBase, cfg.size) } },
    aucs: { holdout: plainAucs(aucHold), train: plainAucs(aucTrain), note: 'every fillable entry once under the elite exit with no gate; win = return over zero after the fee; beatsAge = return over the mean of its age bin in the same census; intervals from resampling instruments' },
    organism,
    unmodelled: [
      'the tape after our own order is the recorded tape: our fill moves nothing the next reading reports',
      'every instrument is its own book: no cap on positions open at once across instruments',
      'the fee is borrowed from pump.fun; the round trip cost of pumpswap has never been measured',
      'the holdout is split by instrument, not by time: holdout instruments share the train instruments calendar',
      'trades and buyers count reading intervals with a move (or a rise) of the SOL reserve, not swaps or wallets, which the tape does not carry',
    ],
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  const file = path.join(HERE, 'verdicts', outName + '.json');
  writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  out('wrote ' + path.relative(path.resolve(HERE, '..'), file).replaceAll('\\', '/') + ' (isTheBar ' + isBar + ') in ' + ((Date.now() - wall0) / 1000).toFixed(1) + ' s wall, rss ' + verdict.rssMb + ' MB');
  process.exitCode = sound ? 0 : 1;
}

// ---------------------------------------------------------------- dispatch
const ARGV = process.argv.slice(2);
if (ARGV.includes('--full')) runFull(ARGV);
else if (ARGV.includes('--sampled')) runLegacy();
else runSensors(ARGV);

