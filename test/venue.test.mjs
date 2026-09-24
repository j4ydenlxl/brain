// test/venue.test.mjs: the full-tape venue (board 8). The replay kernel IS the organism, the
// slippage cap binds on both, the holdout is a stable hash of the instrument and never of
// time, the statistics are arithmetic a reader can redo by hand, the ceiling is an upper
// bound, the search is deterministic and blind to the holdout, and the bar verdict and its
// note say the numbers its fields hold. node:test only; no network, no server, no timer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { RNG } from '../core/rng.mjs';
import { SECONDS_PER_YEAR } from '../generations/epochs.mjs';
import {
  FEE_ROUND_TRIP, admitsBuy, packTape, packReplayTape, synthTape, loadFullTape, splitByInstrument,
  newAcc, replayTrader, replayControl, replayHold, ceilingOf, cadenceOf,
} from '../world/venue.mjs';
import {
  INCUMBENT, VenueEpochs, randomVenueGenome, traderParamsOf, fitnessOf, evaluateVenueGenome,
  pairedStats, gapsOf, organismAgrees, ceilingOver, evaluateArms,
} from '../generations/venue-suite.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DB = path.resolve(ROOT, '..', 'trader', 'data', 'trader.db');
const BAR = path.join(ROOT, 'bench', 'verdicts', 'venue-full.json');
const NOTE = path.join(ROOT, 'notes', 'venue.md');
const O = Object.freeze({ size: 0.02, fee: FEE_ROUND_TRIP, maxImpact: 0.01, lag: 1, draws: 8 });
const every = (tape) => Int32Array.from({ length: tape.instruments }, (_, i) => i);
const fx = (x, n) => Number(x).toFixed(n);
const EM_DASH = String.fromCharCode(0x2014);

/** Pools that rise by a factor g per reading with the product held fixed (no liquidity event). */
function rampTape(specs) {
  return packTape(specs.map((s, r) => ({
    id: s.id,
    readings: Array.from({ length: s.n }, (_, k) => {
      const quote = s.q0 * Math.pow(s.g, k);
      return { tMs: 1757000000000 + k * 20000 + r * 7, quote, base: s.k / quote };
    }),
  })), { source: 'test', venue: 'test' });
}

test('the kernel IS the organism: four genomes, trip for trip, through sense.venue, venue.trader, the gate and world.venue', () => {
  const tape = packReplayTape(synthTape({ instruments: 5, readings: 50, seed: 'venue.test', vol: 0.08 }));
  const rng = new RNG('venue.test.genomes');
  const genomes = [
    INCUMBENT,
    { lookback: 2, entryUp: 0.03, entryDir: -1, trail: 0.2, maxHold: 9, takeProfit: 0.1, minQuote: 40, maxEntryStep: 30 },
    randomVenueGenome(rng), randomVenueGenome(rng),
  ];
  let traded = 0;
  for (const g of genomes) {
    const r = organismAgrees(tape, every(tape), g, O);
    assert.equal(r.organismTrips, r.kernelTrips, 'the same number of trips for ' + JSON.stringify(g));
    assert.equal(r.identical, true, 'the same trips at the same readings for the same pnl: ' + JSON.stringify(r));
    assert.ok(r.maxAbsDiff <= 1e-12, 'pnl agrees to 1e-12 SOL: ' + r.maxAbsDiff);
    // every fill lands one reading after its decision (the kernel lag), except a close at the
    // tape end, which lands on the last reading itself; so the mean is 1 or just under it
    if (r.organismTrips > 0) { traded++; assert.ok(r.lag > 0.9 && r.lag <= 1, 'the organism fill lag is the kernel lag: ' + r.lag); }
  }
  assert.ok(traded >= 2, 'at least two genomes traded, so the agreement is not between two empty books: ' + traded);
});

test('the slippage cap refuses a buy into a drained pool in the organism AND the kernel, and binds nothing else', () => {
  assert.equal(admitsBuy(1, 0.02, 0.01), false, '0.02 SOL into a 1 SOL reserve is 2% of it');
  assert.equal(admitsBuy(2, 0.02, 0.01), true, 'exactly at the cap fills');
  assert.equal(admitsBuy(0, 0.02, 0.01), false, 'an empty reserve never fills');
  assert.equal(admitsBuy(0.5, 0.02, 0), true, 'cap 0 is off, the board 1 behaviour');
  const tape = rampTape([
    { id: 'drained-a', q0: 0.5, g: 1.02, k: 5e7, n: 30 },
    { id: 'drained-b', q0: 1.0, g: 1.02, k: 1e8, n: 30 },
    { id: 'deep', q0: 50, g: 1.02, k: 5e9, n: 30 },
  ]);
  const g = { ...INCUMBENT, lookback: 1, entryUp: 0.001, trail: 0.5, maxHold: 5 };
  const q = traderParamsOf(g, O);
  const accs = [0, 1, 2].map((i) => { const acc = newAcc(); replayTrader(tape, i, q, O, acc); return acc; });
  assert.equal(accs[0].trips, 0, 'no trip on a pool under 2 SOL');
  assert.equal(accs[1].trips, 0, 'no trip on a pool under 2 SOL');
  assert.ok(accs[0].impactRefused > 0 && accs[1].impactRefused > 0, 'and the refusals are counted as the cap');
  assert.ok(accs[2].trips > 0 && accs[2].impactRefused === 0, 'the deep pool trades and the cap never touches it');
  const capped = organismAgrees(tape, every(tape), g, O);
  assert.equal(capped.identical, true, 'organism and kernel agree under the cap: ' + JSON.stringify(capped));
  assert.ok(capped.impactRefused > 0, 'the organism book refused at the cap too: ' + capped.impactRefused);
  const open = organismAgrees(tape, every(tape), g, { ...O, maxImpact: 0 });
  assert.equal(open.identical, true, 'and without the cap: ' + JSON.stringify(open));
  assert.equal(open.impactRefused, 0);
  assert.ok(open.kernelTrips > capped.kernelTrips, 'without the cap the drained pools trade: ' + open.kernelTrips + ' against ' + capped.kernelTrips);
});

test('the holdout is a stable hash of the instrument id: stable, order free, time free, disjoint, near its share, salted', () => {
  const ids = Array.from({ length: 2000 }, (_, i) => 'mint' + i.toString(36).padStart(6, '0'));
  const mk = (list, shift = 0) => packTape(list.map((id) => ({ id, readings: [{ tMs: 1 + shift, quote: 10, base: 1e6 }, { tMs: 2 + shift, quote: 10, base: 1e6 }] })), { source: 'test' });
  const a = mk(ids), b = mk(ids.slice().reverse()), c = mk(ids, 86400000);
  const idsOf = (tape, idx) => Array.from(idx, (i) => tape.ids[i]).sort();
  const s1 = splitByInstrument(a), s2 = splitByInstrument(a), s3 = splitByInstrument(b), s4 = splitByInstrument(c);
  assert.deepEqual(Array.from(s1.holdout), Array.from(s2.holdout), 'the same tape, the same split');
  assert.deepEqual(idsOf(a, s1.holdout), idsOf(b, s3.holdout), 'the order instruments arrive in changes nothing');
  assert.deepEqual(idsOf(a, s1.holdout), idsOf(c, s4.holdout), 'moving every reading a day later changes nothing: time never enters');
  const train = new Set(s1.train);
  for (const i of s1.holdout) assert.equal(train.has(i), false, 'disjoint');
  assert.equal(s1.train.length + s1.holdout.length, ids.length, 'and every instrument is on one side');
  const share = s1.holdout.length / ids.length;
  assert.ok(Math.abs(share - 0.25) < 0.035, 'the holdout share is near 0.25: ' + share);
  const s5 = splitByInstrument(a, { salt: 'another salt' });
  assert.notDeepEqual(idsOf(a, s5.holdout), idsOf(a, s1.holdout), 'a new salt is a new split');
});

test('pairedStats is arithmetic a reader can redo: mean, sd, the 1.96 interval, nFor95, the bootstrap, the counts', () => {
  const s = pairedStats([1, 2, 3, 4, 5], { boot: 500, seed: 'venue.test' });
  assert.equal(s.n, 5);
  assert.equal(s.mean, 3);
  assert.ok(Math.abs(s.sd - Math.sqrt(2.5)) < 1e-12, 'sample sd: ' + s.sd);
  assert.ok(Math.abs(s.se - Math.sqrt(2.5) / Math.sqrt(5)) < 1e-12);
  assert.ok(Math.abs(s.lo - (3 - 1.96 * Math.sqrt(0.5))) < 1e-12 && Math.abs(s.hi - (3 + 1.96 * Math.sqrt(0.5))) < 1e-12);
  assert.equal(s.nFor95, Math.ceil(Math.pow(1.96 * Math.sqrt(2.5) / 3, 2)), 'ceil((1.96 sd / |mean|)^2)');
  assert.equal(s.nFor95, 2);
  assert.equal(s.excludesZero, true);
  assert.ok(s.bootLo >= 1 && s.bootHi <= 5 && s.bootLo <= 3 && s.bootHi >= 3, 'the bootstrap lies inside the data: ' + s.bootLo + ' ' + s.bootHi);
  assert.deepEqual(pairedStats([1, 2, 3, 4, 5], { boot: 500, seed: 'venue.test' }), s, 'seeded, so repeatable');
  const z = pairedStats([0, 0, 0, 0]);
  assert.equal(z.nFor95, null, 'a zero mean has no nFor95');
  assert.equal(z.excludesZero, false);
  const m = pairedStats([-1, 1, 0, 2, -2, 0]);
  assert.equal(m.positive, 2); assert.equal(m.negative, 2); assert.equal(m.zero, 2);
  assert.deepEqual(Array.from(gapsOf(Float64Array.from([3, 1]), Float64Array.from([1, 4]))), [2, -3]);
});

test('the ceiling is an upper bound: no trader, control or hold trip on any instrument beats it, and swap only is under it', () => {
  const syn = synthTape({ instruments: 6, readings: 60, seed: 'venue.test.ceiling', vol: 0.1 });
  // one pool that gets liquidity added halfway, so swapOnly and best can differ
  const extra = {
    id: 'refill',
    readings: Array.from({ length: 60 }, (_, k) => {
      const add = k >= 30 ? 3 : 1;
      const quote = add * 20 * Math.pow(1.01, k);
      return { tMs: 1757000000000 + k * 20000, quote, base: add * add * 2e9 / quote };
    }),
  };
  const tape = packTape(syn.instruments.map((x) => ({ id: x.id, readings: x.readings })).concat([extra]), { source: 'test' });
  assert.ok(tape.liqEvents >= 1, 'the refill is seen as a liquidity event');
  const rng = new RNG('venue.test.ceiling.genomes');
  const genomes = [INCUMBENT, randomVenueGenome(rng), randomVenueGenome(rng), { ...INCUMBENT, lookback: 1, entryUp: 0.001, maxHold: 3 }];
  let compared = 0;
  for (let i = 0; i < tape.instruments; i++) {
    const c = ceilingOf(tape, i, O);
    assert.ok(c.swapOnly <= c.best + 1e-12, 'swap only is a subset of every trip');
    const check = (t) => {
      if (t.exitFill > t.entryFill) {
        compared++;
        assert.ok(t.ret <= c.best + 1e-12, 'instrument ' + i + ': a trip made ' + t.ret + ' over the ceiling ' + c.best);
      }
    };
    for (const g of genomes) {
      const q = traderParamsOf(g, O);
      const acc = newAcc();
      replayTrader(tape, i, q, O, acc, check);
      if (acc.trips > 0) replayControl(tape, i, q, acc.trips, new RNG('c' + i), O, newAcc(), check);
    }
    const h = newAcc();
    const hr = replayHold(tape, i, O, h);
    if (h.trips) { compared++; assert.ok(hr <= c.best + 1e-12, 'hold beat the ceiling on ' + i); }
  }
  assert.ok(compared > 50, 'the bound was checked on real trips: ' + compared);
  const over = ceilingOver(tape, every(tape), O);
  assert.equal(over.instruments, tape.instruments);
  assert.ok(over.clears <= over.instruments && over.clearsSwapOnly <= over.clears);
});

test('fitnessOf puts every genome under the trip floor below the worst real trader, and still gives it a slope', () => {
  const worst = -(1 + FEE_ROUND_TRIP); // a trip loses at most its whole size plus the fee
  for (const m of [1, 5, 22, 23, 213, 10000]) {
    let prev = -Infinity;
    for (const trips of [0, 1, Math.floor(m / 2), m - 1]) {
      if (trips >= m) continue;
      const fit = fitnessOf(0, trips, m);
      assert.ok(fit < worst, 'minTrips ' + m + ', ' + trips + ' trips scores ' + fit + ', under ' + worst);
      assert.ok(fit >= prev, 'more trips never scores lower under the floor');
      prev = fit;
    }
    assert.ok(Math.abs(fitnessOf(-1.0454 * m, m, m) + 1.0454) < 1e-12, 'at the floor it is net per trip');
  }
  assert.ok(fitnessOf(0, 0, 10) < fitnessOf(-1.04 * 10, 10, 10), 'never trading loses to a trader that loses almost everything');
});

test('the generations are deterministic, blind to the holdout, write no checkpoint, and print their years arithmetic', () => {
  const tape = packReplayTape(synthTape({ instruments: 16, readings: 60, seed: 'venue.test.epochs', vol: 0.08 }));
  const split = splitByInstrument(tape, { share: 0.25, salt: 'venue.test' });
  assert.ok(split.holdout.length > 0 && split.train.length > 0);
  const run = (t) => {
    const ep = new VenueEpochs({ tape: t, train: split.train, o: O, seed: 'venue.test', popSize: 12, minTrips: 2, secondsPerTick: cadenceOf(tape) });
    ep.init();
    for (let g = 0; g < 4; g++) ep.step();
    return ep;
  };
  const a = run(tape), b = run(tape);
  assert.deepEqual(a.best().genome, b.best().genome, 'the same seed, the same best genome');
  assert.equal(a.best().fitness, b.best().fitness);
  assert.deepEqual(a.history.map((r) => [r.best, r.genMean, r.fill]), b.history.map((r) => [r.best, r.genMean, r.fill]));
  // scramble every holdout reading: the search must not move
  const poisoned = { ...tape, quote: Float64Array.from(tape.quote), base: Float64Array.from(tape.base), mid: Float64Array.from(tape.mid) };
  for (const i of split.holdout) {
    for (let j = tape.off[i]; j < tape.off[i + 1]; j++) { poisoned.quote[j] *= 7; poisoned.base[j] /= 7; poisoned.mid[j] *= 49; }
  }
  const p = run(poisoned);
  assert.deepEqual(p.best().genome, a.best().genome, 'changing only holdout readings changes nothing the search chose');
  assert.equal(p.best().fitness, a.best().fitness);
  assert.equal(a.checkpointEvery, 0, 'no checkpoint, so nothing is written under state/');
  let trainReadings = 0;
  for (const i of split.train) trainReadings += tape.off[i + 1] - tape.off[i];
  const s = a.summary();
  assert.equal(s.readingsReplayed, s.evaluations * trainReadings, 'every evaluation replays exactly the train readings');
  assert.ok(s.yearsArithmetic.startsWith(s.evaluations + ' evaluations x ' + trainReadings + ' readings = ' + s.readingsReplayed + ' readings'), s.yearsArithmetic);
  assert.ok(Math.abs(s.marketYearsReplayed - s.readingsReplayed * cadenceOf(tape) / SECONDS_PER_YEAR) < 1e-9, 'years = readings x cadence / seconds per year');
  const ev = evaluateVenueGenome(tape, split.train, a.best().genome, O, { minTrips: 2 });
  assert.equal(ev.fitness, a.best().fitness, 'the best fitness is what one fresh evaluation of the best genome gives');
  const arms = evaluateArms(tape, split.holdout, a.best().genome, { ...O, draws: 4 }, 'venue.test.arms');
  assert.equal(arms.control.tripsMatched, arms.evolved.trips, 'the control is matched trip for trip on every traded instrument');
});

test('loadFullTape reads the recorded tape read only: a seeded sample in typed arrays, the database untouched', { skip: existsSync(DB) ? false : 'trader.db is not on this machine' }, () => {
  const before = statSync(DB);
  const t = loadFullTape({ db: DB, instruments: 24, seed: 'venue.test', minReadings: 20 });
  assert.equal(t.instruments, 24);
  assert.equal(t.sampled, true, 'a sample says it is one');
  assert.ok(t.eligible >= 24 && t.scanned >= t.readings);
  assert.equal(t.source, 'trader.db');
  assert.ok(t.quote instanceof Float64Array && t.off instanceof Int32Array);
  assert.equal(new Set(t.ids).size, 24, 'every instrument once');
  for (let i = 0; i < t.instruments; i++) {
    assert.ok(t.off[i + 1] - t.off[i] >= 20, 'every instrument has at least minReadings readings');
    for (let j = t.off[i] + 1; j < t.off[i + 1]; j++) assert.ok(t.tMs[j] >= t.tMs[j - 1], 'readings in time order');
  }
  assert.equal(t.off[t.instruments], t.readings);
  const again = loadFullTape({ db: DB, instruments: 24, seed: 'venue.test', minReadings: 20 });
  assert.deepEqual(again.ids, t.ids, 'the sample is a function of its seed');
  const after = statSync(DB);
  assert.equal(after.mtimeMs, before.mtimeMs, 'the database was not written');
  assert.equal(after.size, before.size);
});

test('the venue sources have no path to any network, no signer, no em-dash, and the tape opens read only', () => {
  const forbidden = [
    /\bfetch\s*\(/, /node:http\b/, /node:https\b/, /node:net\b/, /node:tls\b/, /node:dgram\b/,
    /XMLHttpRequest/, /WebSocket/, /node:child_process/, /privateKey/i, /secretKey/i,
    /signTransaction/i, /sendTransaction/i, /\bendpoint\b/i, /\brpc\b/i, /\bkeypair\b/i,
  ];
  for (const rel of ['world/venue.mjs', 'generations/venue-suite.mjs']) {
    const src = readFileSync(path.join(ROOT, rel), 'utf8');
    for (const re of forbidden) assert.equal(re.test(src), false, rel + ' must not contain ' + re);
  }
  const src = readFileSync(path.join(ROOT, 'world', 'venue.mjs'), 'utf8');
  assert.equal(/readOnly:\s*true/.test(src), true);
  for (const m of src.matchAll(/^\s*import\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm)) {
    assert.ok(m[1].startsWith('.') || m[1] === 'node:sqlite' || m[1] === 'node:path', 'world/venue.mjs imports ' + m[1]);
  }
  for (const rel of ['world/venue.mjs', 'generations/venue-suite.mjs', 'bench/venue.mjs', 'test/venue.test.mjs', 'notes/venue.md']) {
    const text = readFileSync(path.join(ROOT, rel), 'utf8');
    assert.equal(text.includes(EM_DASH), false, rel + ' has an em-dash');
  }
});

test('the bar verdict says in prose what its fields hold, and the note quotes the same numbers', { skip: existsSync(BAR) ? false : 'the bar has not been run' }, () => {
  const v = JSON.parse(readFileSync(BAR, 'utf8'));
  assert.equal(v.isTheBar, true);
  assert.equal(v.command, 'node bench/venue.mjs --full');
  assert.ok(Number.isFinite(Date.parse(v.at)) && /^v\d+/.test(v.node));
  assert.deepEqual(v.config, v.canonical, 'the bar ran the canonical configuration');
  assert.equal(v.tape.sampled, false, 'on every eligible instrument');
  assert.equal(v.sound, true);
  for (const [k, ok] of Object.entries(v.checks)) assert.equal(ok, true, 'check ' + k);
  const g = v.holdout.gapVsControl;
  assert.equal(v.verdict, g.lo > 0 ? 'BEATS' : g.hi < 0 ? 'LOSES TO' : 'NULL AGAINST', 'the word follows the interval');
  assert.equal(v.clearsFee, v.holdout.evolved.netPerTrip > 0);
  const said = [
    String(v.tape.instruments) + ' instruments', String(v.tape.readings) + ' readings',
    String(v.split.train) + ' train', String(v.split.holdout) + ' holdout',
    String(v.holdout.evolved.trips) + ' trips', fx(g.mean, 5), '[' + fx(g.lo, 5) + ', ' + fx(g.hi, 5) + ']', 'nFor95 ' + g.nFor95,
    fx(v.holdout.evolved.netSol, 5) + ' SOL', fx(v.holdout.control.netSol, 5) + ' SOL', fx(v.holdout.hold.netSol, 5) + ' SOL',
    String(v.ceiling.holdout.clears) + ' of ' + String(v.ceiling.holdout.instruments), String(v.search.evaluations) + ' evaluations',
  ];
  for (const s of said) assert.ok(v.statement.includes(s), 'the statement says ' + s);
  const note = readFileSync(NOTE, 'utf8');
  const quoted = [
    String(v.tape.instruments) + ' instruments', String(v.tape.readings) + ' readings', 'train ' + v.split.train, 'holdout ' + v.split.holdout,
    fx(g.mean, 5), '[' + fx(g.lo, 5) + ', ' + fx(g.hi, 5) + ']', 'nFor95 ' + g.nFor95,
    'evolved ' + v.holdout.evolved.trips + ' trips, ' + fx(v.holdout.evolved.netSol, 5) + ' SOL',
    fx(v.holdout.control.netSol, 5) + ' SOL', fx(v.holdout.hold.netSol, 5) + ' SOL',
    (v.holdout.evolved.netPerTrip * 100).toFixed(2) + '%', String(v.search.evaluations) + ' evaluations',
    v.search.marketYearsReplayed.toExponential(4) + ' market-years',
  ];
  for (const s of quoted) assert.ok(note.includes(s), 'notes/venue.md quotes ' + s + ' as the verdict holds it');
});
