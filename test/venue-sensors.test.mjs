// test/venue-sensors.test.mjs: BOARD 11, the sensor trader, graded on what it claims.
//
// Every test here runs on SYNTHETIC tapes built in this file (no trader.db, no network, no
// model). What each one proves:
//   1. each sensor reads exactly what its definition says, on a hand built tape whose every
//      value is computed by hand below, and births and origins read the pool table right
//   2. the age matched control has the arm's trade count and the arm's entry ages (within
//      the tolerance), never enters the trip's own instrument, and counts a trip it cannot
//      match instead of dropping it
//   3. the fee is charged on BOTH legs: a flat trip loses exactly the round trip fee, a
//      winner pays half the fee on its larger proceeds, and the legacy arithmetic is intact
//   4. the organism (sense.venue, venue.trader with a sensor gate, world.venue with the fee
//      on both legs) books the same trips as the kernel
//   5. the search never reads a holdout instrument, and the grade is deterministic
//   6. no file of this item carries an em-dash
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { RNG } from '../core/rng.mjs';
import '../cells/basic.mjs';
import {
  packTape, attachSensors, sensorColumns, SENSOR_NAMES, VENUE_SENSORS, birthsBefore, birthRecordOf, PUMPFUN_PROGRAM,
  replayAgeControl, replayTrader, tripFrom, tripFee, newAcc, normalizeTrader, splitByInstrument, nearestAgeReading,
  payableBuy, payableSell, FEE_ROUND_TRIP,
} from '../world/venue.mjs';
import {
  SensorEpochs, SENSOR_BASE, SENSOR_GENES, sensorParamsOf, clampSensorGenome, randomSensorGenome, mutateSensorGenome,
  gradeSensorElite, sensorAucs, organismAgrees, foldsOf, ageBinOf, AGE_EDGES, tailOf, weightedAuc,
} from '../generations/venue-suite.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const FEE = FEE_ROUND_TRIP;

// A synthetic market: n instruments born at staggered times, a reading every 20 s, the SOL
// reserve moving along the constant product curve by a seeded random swap (or not at all),
// every third instrument a migrated curve, births market wide a function of time.
function synthInstruments(n, len, seed, { vol = 0.08, still = 0.2 } = {}) {
  const rng = new RNG(seed);
  const out = [];
  for (let i = 0; i < n; i++) {
    let q = 30 + rng.next() * 170;
    const k = q * 1e9;
    let b = k / q;
    const readings = [];
    const born = 1757000000000 + i * 7000;
    const lenI = len + (i % 5) * 7;
    for (let s = 0; s < lenI; s++) {
      const age = s * 20 + (i % 3);
      readings.push({ tMs: born + age * 1000, ageS: age, births: (i * 7 + s) % 41, quote: q, base: b });
      if (rng.next() < still) continue;
      q = Math.max(3, q * (1 + vol * rng.gauss()));
      b = k / q;
    }
    out.push({ id: 'syn' + String(i).padStart(3, '0'), migrated: i % 3 === 0, readings });
  }
  return out;
}
const O = (extra = {}) => ({ size: 0.02, fee: FEE, maxImpact: 0.01, lag: 1, legs: true, draws: 8, ...extra });

// ---------------------------------------------------------------- 1. the sensors
test('every sensor reads what its definition says, on a tape computed by hand (window 3)', () => {
  // one instrument, constant product 1000 until reading 6, where the product doubles (a
  // liquidity event: the reserves moved OFF the curve, which is not a trade)
  const qs = [10, 10, 11, 10.5, 10.5, 12, 24, 25];
  const ks = [1000, 1000, 1000, 1000, 1000, 1000, 2000, 2000];
  const ages = [0, 5, 20, 40, 60, 80, 100, 120];
  const births = [3, 3, 4, 4, 5, 9, 9, 10];
  const inst = { id: 'hand', migrated: true, readings: qs.map((q, s) => ({ tMs: 1757000000000 + s * 20000, ageS: ages[s], births: births[s], quote: q, base: ks[s] / q })) };
  const tape = packTape([inst, { ...inst, id: 'hand2', migrated: false }]);
  const { cols } = sensorColumns(tape, 3);
  const at = (name, s) => cols[name][s];
  // moved: r2 r3 r5 r7 (r6 is the liquidity event); rose: r2 r5 r7
  const trades = [0, 0, 1, 2, 2, 2, 1, 2];
  const buyers = [0, 0, 1, 1, 1, 1, 1, 2];
  const slope = [0, 0, 0.1, 0.05, 0.05, 12 / 11 - 1, 24 / 10.5 - 1, 25 / 10.5 - 1];
  for (let s = 0; s < qs.length; s++) {
    assert.equal(at('realSol', s), qs[s], 'realSol at ' + s);
    assert.equal(at('ageS', s), ages[s], 'ageS at ' + s);
    assert.equal(at('trades', s), trades[s], 'trades at ' + s);
    assert.equal(at('buyers', s), buyers[s], 'buyers at ' + s);
    assert.ok(Math.abs(at('slope', s) - slope[s]) < 1e-12, 'slope at ' + s + ': ' + at('slope', s) + ' vs ' + slope[s]);
    assert.equal(at('births', s), births[s], 'births at ' + s);
    assert.equal(at('migrated', s), 1, 'migrated at ' + s);
    assert.equal(cols.migrated[qs.length + s], 0, 'the second instrument was born by a wallet');
  }
  // the sensor list is typed and every sensor has a column
  assert.deepEqual(SENSOR_NAMES, VENUE_SENSORS.map((x) => x.name));
  for (const x of VENUE_SENSORS) assert.ok(['f64', 'i32', 'u8'].includes(x.type) && x.unit && x.doc, x.name + ' is not typed');
  // a tape without recorded ages counts seconds from the first reading
  const noAge = packTape([{ id: 'na', readings: [{ tMs: 1000, quote: 5, base: 5 }, { tMs: 21000, quote: 5, base: 5 }] }]);
  assert.deepEqual(Array.from(noAge.ageS), [0, 20]);
});

test('births count the pool table in (t - window, t] by t_local, and origins read the pump.fun program', () => {
  const born = Float64Array.from([1000, 2000, 3000, 600000, 601000]).sort();
  assert.equal(birthsBefore(born, 3000, 600), 3, 'three births at or before t = 3 s');
  assert.equal(birthsBefore(born, 2999, 600), 2, 'a birth AFTER the reading is not counted (no future)');
  assert.equal(birthsBefore(born, 601000, 600), 4, 'the window is (t - 600 s, t]: the birth at exactly t - 600 s has left, 2, 3, 600 and 601 s are in');
  assert.equal(birthsBefore(born, 603000, 600), 2, 'at t = 603 s every birth at or before 3 s has left the window');
  const db = new DatabaseSync(':memory:');
  db.exec('create table pool (signature text, venue text, t_local text, origin text)');
  const ins = db.prepare('insert into pool values (?, ?, ?, ?)');
  ins.run('a', 'pumpswap', '2026-09-08T00:00:02.000Z', 'cpi:' + PUMPFUN_PROGRAM);
  ins.run('b', 'pumpswap', '2026-09-08T00:00:01.000Z', 'wallet');
  ins.run('c', 'pumpswap', '2026-09-08T00:00:03.000Z', 'cpi:SomeOtherProgram');
  ins.run('d', 'other', '2026-09-08T00:00:03.000Z', 'wallet');
  const rec = birthRecordOf(db, 'pumpswap');
  assert.equal(rec.rows, 3);
  assert.deepEqual(Array.from(rec.bornMs), [Date.parse('2026-09-08T00:00:01.000Z'), Date.parse('2026-09-08T00:00:02.000Z'), Date.parse('2026-09-08T00:00:03.000Z')]);
  assert.equal(rec.origin.get('a'), 'migrated');
  assert.equal(rec.origin.get('b'), 'wallet');
  assert.equal(rec.origin.get('c'), 'other');
  const none = birthRecordOf(new DatabaseSync(':memory:'), 'pumpswap');
  assert.equal(none.rows, 0, 'a database with no pool table reads as no births, it does not throw');
  db.close();
});

// ---------------------------------------------------------------- 2. the matched control
test('the age matched control has the arm trade count and the arm entry ages, and never enters the trip own instrument', () => {
  const tape = attachSensors(packTape(synthInstruments(24, 60, 'ctl')));
  const pool = Int32Array.from({ length: tape.instruments }, (_, i) => i);
  const o = O();
  const q = normalizeTrader(sensorParamsOf({ ...SENSOR_BASE, trail: 0.15, maxHold: 20, slopeMin: 0.02 }, o));
  const trips = [];
  for (const i of pool) replayTrader(tape, i, q, o, newAcc(), (x) => trips.push({ i, d: x.entryDecision }));
  assert.ok(trips.length > 20, 'the gated trader traded only ' + trips.length + ' times: nothing to match');
  const draws = 8, tolS = 30;
  const seen = [];
  const ac = replayAgeControl(tape, pool, trips, q, o, new RNG('ctl'), { draws, tolS, onTrip: (x) => seen.push(x) });
  assert.equal(ac.unmatched, 0);
  assert.equal(ac.drawn.length, trips.length, 'one control entry per trip of the arm');
  for (let t = 0; t < trips.length; t++) {
    assert.equal(ac.drawn[t], draws, 'trip ' + t + ' drew ' + ac.drawn[t] + ' of ' + draws);
    assert.ok(Number.isFinite(ac.perTrip[t]));
    for (let r = 0; r < draws; r++) assert.ok(Math.abs(ac.matchedAges[t * draws + r] - ac.ages[t]) <= tolS, 'a control entry landed outside the age tolerance');
  }
  assert.equal(ac.acc.trips, trips.length * draws, 'the control booked draws x the arm trade count');
  assert.ok(ac.maxAgeGap <= tolS);
  for (const x of seen) assert.notEqual(x.instrument, trips[x.trip].i, 'a control entry was drawn on the trip own instrument');
  // the control's exit is the arm's exit: a trip the control books is exactly tripFrom there
  const x0 = seen[0];
  const again = tripFrom(tape, x0.instrument, x0.entryDecision, q, o, newAcc());
  assert.equal(again, x0.ret, 'a control trip is not the same exit rule from its entry');
  // gradeSensorElite carries the same match through to the bar
  const g = gradeSensorElite(tape, pool, { ...SENSOR_BASE, trail: 0.15, maxHold: 20, slopeMin: 0.02 }, o, { draws, tolS, seed: 'ctl.grade', boot: 200 });
  assert.equal(g.ageControl.tripsMatched, g.evolved.trips, 'the matched control does not have the arm trade count');
  assert.equal(g.ageControl.drawnTrips, g.evolved.trips * draws);
  assert.equal(g.checks.unmatchedTrips, 0);
  assert.equal(g.checks.payableViolations, 0, 'a fill beat the ratio the pool reported');
});

test('a trip at an age no other instrument reaches is counted unmatched, never silently dropped', () => {
  const list = synthInstruments(6, 30, 'lonely');
  // one instrument lives far longer than every other
  const long = synthInstruments(1, 200, 'long')[0];
  long.id = 'long';
  list.push(long);
  const tape = attachSensors(packTape(list));
  const pool = Int32Array.from({ length: tape.instruments }, (_, i) => i);
  const o = O();
  const q = normalizeTrader(sensorParamsOf({ ...SENSOR_BASE, trail: 0.2, maxHold: 5 }, o));
  const iLong = tape.ids.indexOf('long');
  const dOld = nearestAgeReading(tape, iLong, 3000);
  const ac = replayAgeControl(tape, pool, [{ i: iLong, d: dOld }, { i: 0, d: 2 }], q, o, new RNG('lonely'), { draws: 4, tolS: 30 });
  assert.equal(ac.candidates[0], 0, 'an instrument was found alive at an age none reaches');
  assert.ok(Number.isNaN(ac.perTrip[0]), 'an unmatched trip got a control number');
  assert.equal(ac.drawn[0], 0);
  assert.equal(ac.unmatched, 4, 'the four missing draws were not counted');
  assert.equal(ac.drawn[1], 4, 'a matchable trip in the same call was hurt by the unmatched one');
});

// ---------------------------------------------------------------- 3. the fee on both legs
test('the fee is charged on both legs: a flat trip loses exactly the fee, a winner pays half the fee on its proceeds', () => {
  // reserves so deep that 0.02 SOL moves nothing measurable: the payable price is the mid
  // the arithmetic first: proceeds equal to the notional pay exactly the round trip fee
  assert.equal(tripFee(0.02, O()), FEE, 'fee/2 on the buy plus fee/2 on proceeds equal to the notional is not the round trip fee');
  // then a flat pool deep enough that 0.02 SOL moves the price by 2e-7 a leg
  const flat = packTape([{ id: 'flat', readings: [0, 1, 2, 3].map((s) => ({ tMs: 1757000000000 + s * 20000, ageS: s * 20, quote: 1e5, base: 1e8 })) }]);
  const q = normalizeTrader({ entryDir: 0, trail: 0.5, maxHold: 1, size: 0.02, maxOpen: 1 });
  const legs = O({ maxImpact: 1 }), once = O({ maxImpact: 1, legs: false });
  const got = [];
  const rFlat = tripFrom(flat, 0, 0, q, legs, newAcc(), (x) => got.push(x));
  assert.ok(Math.abs(rFlat + FEE) < 1e-6, 'a flat trip with the fee on both legs lost ' + rFlat + ', not ' + -FEE);
  assert.ok(rFlat < -FEE, 'a flat trip must also pay the (tiny) price impact of both legs');
  assert.ok(Math.abs(got[0].fee - FEE) < 1e-6, 'a flat trip paid ' + got[0].fee);
  const rOnce = tripFrom(flat, 0, 0, q, once, newAcc());
  assert.ok(Math.abs(rOnce + FEE) < 1e-6, 'the legacy flat trip lost ' + rOnce);

  // a winner: the SOL reserve doubles along the curve between the buy and the sell
  const k = 1e9 * 1e12;
  const up = packTape([{ id: 'up', readings: [1e9, 1e9, 2e9, 2e9].map((qq, s) => ({ tMs: 1757000000000 + s * 20000, ageS: s * 20, quote: qq, base: k / qq })) }]);
  const w = [];
  const rUp = tripFrom(up, 0, 0, q, legs, newAcc(), (x) => w.push(x));
  const gross = w[0].gross;
  assert.ok(gross > 0.079 && gross < 0.081, 'price x4 along the curve (SOL reserve x2): proceeds ' + gross);
  assert.ok(Math.abs(w[0].fee - (FEE / 2) * (1 + gross / 0.02)) < 1e-12, 'the winner did not pay half the fee on each leg');
  assert.ok(w[0].fee > FEE, 'a winner pays more than the flat fee when the sell leg is charged on its proceeds');
  assert.ok(Math.abs(rUp - ((gross * (1 - FEE / 2) - 0.02 * (1 + FEE / 2)) / 0.02)) < 1e-12);
  assert.ok(Math.abs((gross / 0.02 - 1) - rUp - w[0].fee) < 1e-12, 'net is not gross minus the fee');
  assert.equal(tripFee(gross, once), FEE, 'the legacy fee is once on the notional');
});

// ---------------------------------------------------------------- 4. the organism
test('the organism with a sensor gate and the fee on both legs books the same trips as the kernel', () => {
  const tape = attachSensors(packTape(synthInstruments(6, 90, 'org', { vol: 0.1 })));
  const o = O();
  const genomes = [
    { ...SENSOR_BASE, trail: 0.12, maxHold: 15, slopeMin: 0.03, buyersMin: 2 },
    { ...SENSOR_BASE, trail: 0.2, trailArm: 0.05, stopLoss: 0.3, maxHold: 40, migrated: 0, realSolMin: 40, maxEntries: 2 },
    { ...SENSOR_BASE, trail: 0.08, maxHold: 25, ageMin: 200, ageMax: 1400, birthsMax: 30, tradesMin: 3, takeProfit: 0.2 },
  ];
  let total = 0;
  for (const g of genomes) {
    const r = organismAgrees(tape, Int32Array.from([0, 1, 2, 3, 4, 5]), null, o, { params: sensorParamsOf(g, o) });
    assert.ok(r.kernelTrips > 0, 'the kernel made no trip for ' + JSON.stringify(g) + ', so nothing was compared');
    assert.equal(r.organismTrips, r.kernelTrips, 'trip counts differ for ' + JSON.stringify(g));
    assert.ok(r.identical, 'the organism and the kernel disagree for ' + JSON.stringify(g) + ' (max pnl difference ' + r.maxAbsDiff + ')');
    total += r.kernelTrips;
  }
  assert.ok(total >= 6);
});

// ---------------------------------------------------------------- 5. the search and the grade
test('the search never reads a holdout instrument: scrambling every holdout reading leaves its history unchanged', () => {
  const list = synthInstruments(40, 50, 'blind');
  const tapeA = attachSensors(packTape(list));
  const split = splitByInstrument(tapeA, { share: 0.25, salt: 'venue.holdout/1' });
  assert.ok(split.holdout.length > 3 && split.train.length > 20);
  const hold = new Set(Array.from(split.holdout, (i) => tapeA.ids[i]));
  const rng = new RNG('scramble');
  const scrambled = list.map((inst) => (hold.has(inst.id)
    ? { ...inst, migrated: !inst.migrated, readings: inst.readings.map((r) => ({ ...r, quote: r.quote * (0.2 + 3 * rng.next()), births: r.births + 7 })) }
    : inst));
  const tapeB = attachSensors(packTape(scrambled));
  const o = O();
  const run = (tape) => {
    const ep = new SensorEpochs({ tape, train: split.train, o, seed: 'blind', popSize: 12, minTrips: 5, secondsPerTick: 20 });
    ep.init();
    for (let g = 0; g < 4; g++) ep.step();
    return { hist: ep.history.map((r) => [r.best, r.bestTrips, r.genMean, r.fill]), best: ep.summary().best, entries: ep.baseline.entries };
  };
  const a = run(tapeA), b = run(tapeB);
  assert.deepEqual(b.hist, a.hist, 'the search history moved when only holdout readings changed');
  assert.deepEqual(b.best, a.best);
  assert.equal(b.entries, a.entries);
  // and the scramble is real: the holdout grade DOES move
  const gA = gradeSensorElite(tapeA, split.holdout, a.best.genome, o, { draws: 4, seed: 'blind.g', boot: 100 });
  const gB = gradeSensorElite(tapeB, split.holdout, a.best.genome, o, { draws: 4, seed: 'blind.g', boot: 100 });
  assert.notEqual(gA.evolved.net + gA.ageControl.net, gB.evolved.net + gB.ageControl.net, 'the scramble changed nothing, so this test proved nothing');
});

test('the grade is deterministic for a seed, and its gap is the evolved arm minus the age control, instrument by instrument', () => {
  const tape = attachSensors(packTape(synthInstruments(30, 60, 'det')));
  const idxs = Int32Array.from({ length: tape.instruments }, (_, i) => i);
  const o = O();
  const g = { ...SENSOR_BASE, trail: 0.1, maxHold: 20, buyersMin: 2 };
  const a = gradeSensorElite(tape, idxs, g, o, { draws: 6, seed: 'det.g', boot: 200 });
  const b = gradeSensorElite(tape, idxs, g, o, { draws: 6, seed: 'det.g', boot: 200 });
  assert.equal(a.gapAge.mean, b.gapAge.mean);
  assert.equal(a.gapAge.lo, b.gapAge.lo);
  assert.equal(a.ageControl.net, b.ageControl.net);
  assert.equal(a.within.net, b.within.net);
  const pi = a.perInstrument;
  for (let t = 0; t < idxs.length; t++) assert.ok(Math.abs(pi.gap[t] - (pi.evolved[t] - pi.ageControl[t])) < 1e-12, 'the gap is not evolved minus control on instrument ' + t);
  assert.equal(a.gapAge.n, idxs.length, 'an instrument that never traded must count as a zero gap, not vanish');
  assert.ok(a.checks.feeMaxDev < 1e-9, 'a trip did not pay the both legs fee of its own proceeds');
  const c = sensorAucs(tape, idxs, normalizeTrader(sensorParamsOf(g, o)), o, { boot: 50, seed: 'det.auc' });
  const d = sensorAucs(tape, idxs, normalizeTrader(sensorParamsOf(g, o)), o, { boot: 50, seed: 'det.auc' });
  assert.deepEqual(c, d);
  for (const name of SENSOR_NAMES) assert.ok(name in c.per, 'no AUC for ' + name);
});

test('the pieces: genes clamp into their box, folds are balanced, age bins and AUCs are what they say', () => {
  const rng = new RNG('genes');
  for (let k = 0; k < 200; k++) {
    const g = clampSensorGenome(mutateSensorGenome(randomSensorGenome(rng), rng));
    for (const gene of SENSOR_GENES) {
      const v = g[gene.name];
      if (gene.values) { assert.ok(gene.values.includes(v)); continue; }
      if (gene.offNull && v === null) continue;
      if (gene.off && v === 0) continue;
      assert.ok(v >= gene.lo && v <= gene.hi, gene.name + ' = ' + v + ' left its box');
    }
  }
  const ids = Array.from({ length: 2000 }, (_, i) => 'id' + i);
  const tape = { ids };
  const all = Int32Array.from(ids.keys());
  const f = foldsOf(tape, all, 'venue.fold/1');
  const ones = f.reduce((a, x) => a + x, 0);
  assert.ok(ones > 900 && ones < 1100, 'fold 1 holds ' + ones + ' of 2000');
  // a fold drawn INSIDE a fold of another salt is still balanced (FNV's low bit was not)
  const g = foldsOf(tape, all, 'venue.dev/1');
  const inside = Array.from(all).filter((t) => g[t] === 0);
  const h = foldsOf(tape, Int32Array.from(inside), 'venue.fold/1');
  const hi = h.reduce((a, x) => a + x, 0);
  assert.ok(hi > 0.4 * inside.length && hi < 0.6 * inside.length, 'nested folds are correlated: ' + hi + ' of ' + inside.length);
  assert.equal(ageBinOf(0), 0);
  assert.equal(ageBinOf(AGE_EDGES[0]), 1);
  assert.equal(ageBinOf(1e9), AGE_EDGES.length);
  const x = Float64Array.from([1, 2, 3, 4]), y = Uint8Array.from([0, 0, 1, 1]);
  assert.equal(weightedAuc([0, 1, 2, 3], x, y), 1);
  assert.equal(weightedAuc([0, 1, 2, 3], x, Uint8Array.from([1, 1, 0, 0])), 0);
  assert.equal(weightedAuc([0, 1, 2, 3], Float64Array.from([1, 1, 1, 1]), y), 0.5, 'ties count half');
  const tl = tailOf([3, -0.5, -0.5, 0.2, -1]);
  assert.equal(tl.trips, 5);
  assert.equal(tl.wins, 2);
  assert.equal(tl.tailTrips, 1);
  assert.equal(tl.kFor100, 1, 'the one +300% trip carries the whole net of +120%');
});

// ---------------------------------------------------------------- 6. the house rule
test('no file of this item carries an em-dash', () => {
  const files = ['world/venue.mjs', 'generations/venue-suite.mjs', 'bench/venue.mjs', 'tasks/venue.mjs', 'capability/market.mjs',
    'test/venue.test.mjs', 'test/venue-suite.test.mjs', 'test/venue-sensors.test.mjs', 'notes/venue.md'];
  for (const f of files) {
    const text = readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!text.includes(String.fromCharCode(0x2014)), f + ' carries an em-dash');
  }
  void payableBuy; void payableSell;
});

// ---------------------------------------------------------------- 7. the bar says what it measured
// Reads bench/verdicts/venue.json (written once by the canonical run of bench/venue.mjs) and
// holds it to itself: the word follows the interval, the control accounts for every trip,
// the statement and notes/venue.md quote the numbers the file holds. It reads files only.
test('the bar verdict says what it measured, and the notes quote it', () => {
  const fx = (x, n) => Number(x).toFixed(n);
  const raw = readFileSync(path.join(ROOT, 'bench', 'verdicts', 'venue.json'), 'utf8');
  assert.ok(!raw.includes(String.fromCharCode(0x2014)), 'the verdict carries an em-dash');
  const v = JSON.parse(raw);
  assert.equal(v.isTheBar, true, 'venue.json is written only by the canonical run');
  assert.equal(v.command, 'node bench/venue.mjs');
  assert.ok(!Number.isNaN(Date.parse(v.at)) && v.at === new Date(v.at).toISOString(), 'at is ISO');
  assert.match(v.node, /^v\d+\./);
  assert.ok(typeof v.statement === 'string' && v.statement.length > 200 && !v.statement.includes('\n'), 'one paragraph');
  assert.ok(/shared machine/.test(v.sharedMachine), 'the verdict notes the shared machine');
  for (const [k, ok] of Object.entries(v.checks)) assert.equal(ok, true, 'check ' + k);
  assert.equal(v.sound, true);
  const g = v.holdout.gapAge;
  assert.equal(v.verdict, g.lo > 0 ? 'BEATS' : g.hi < 0 ? 'LOSES TO' : 'NULL AGAINST', 'the word follows the interval');
  assert.equal(v.barMet, g.lo > 0, 'the bar is the favourable side of the interval, nothing wider');
  assert.equal(v.clearsFee, v.holdout.evolved.netPerTrip > 0);
  assert.equal(g.n, v.split.holdout, 'the gap is paired over every holdout instrument');
  const e = v.holdout.evolved, c = v.holdout.ageControl;
  assert.equal(c.tripsMatched + v.holdout.checks.unmatchedTrips, e.trips, 'the control has the arm trade count');
  assert.equal(c.drawnTrips, c.tripsMatched * c.draws, 'every matched trip drew every draw');
  assert.ok(c.maxAgeGap <= c.tolS, 'every control entry is at the trip age');
  assert.equal(v.holdout.checks.payableViolations, 0);
  assert.ok(v.holdout.checks.feeMaxDev < 1e-9);
  assert.equal(v.fills.maxImpact, 0.01);
  assert.equal(v.fee.value, FEE_ROUND_TRIP);
  for (const name of SENSOR_NAMES) assert.ok(Number.isFinite(v.aucs.holdout.per[name].beatsAge.auc), 'holdout AUC of ' + name);
  const said = [
    v.tape.instruments + ' instruments', v.tape.readings + ' readings', v.split.train + ' instruments, the development set',
    v.split.holdout + ' HELD OUT', e.trips + ' trips', fx(g.mean, 5), '[' + fx(g.lo, 5) + ', ' + fx(g.hi, 5) + ']', 'nFor95 ' + g.nFor95,
    v.search.evaluations + ' evaluations',
  ];
  for (const s of said) assert.ok(v.statement.includes(s), 'the statement says ' + s);
  const note = readFileSync(path.join(ROOT, 'notes', 'venue.md'), 'utf8');
  const quoted = [
    'train ' + v.split.train, 'holdout ' + v.split.holdout, fx(g.mean, 5), '[' + fx(g.lo, 5) + ', ' + fx(g.hi, 5) + ']', 'nFor95 ' + g.nFor95,
    e.trips + ' trips', (e.netPerTrip * 100).toFixed(2) + '%', (c.netPerTrip * 100).toFixed(2) + '%', (e.tail.winRate * 100).toFixed(2) + '%',
  ];
  for (const s of quoted) assert.ok(note.includes(s), 'notes/venue.md quotes ' + s + ' as the verdict holds it');
});
