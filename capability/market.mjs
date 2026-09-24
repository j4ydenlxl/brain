// capability/market.mjs: DECISION, PROVED ON A WORLD THE BRAIN CAN SEE ALL OF.
//
// His words: if the brain is done, it should already know how to trade. The claim here is
// narrow and it is measured: WITHOUT any trading code, any venue, any money and any data
// from the old trader project (the manual forbids old data leaking in), the same induction
// machinery that wrote "3x + 2" writes a decision policy over market features, and that
// policy is scored against a MATCHED RANDOM-DECISION CONTROL on seeds it never saw.
//
// The market is synthetic and its structure is planted on purpose, so there is a right
// answer to find: regimes switch between mean reversion, momentum bursts and pure noise.
// A synthetic world is the only kind where the gap between a policy and its control can be
// attributed, because the generator is the ground truth.
//
// What is NOT claimed: nothing here says anything about a real venue, a real fee schedule
// or real money. A policy that wins on a planted world has shown that the induction can
// find planted structure, which is exactly what the section is for.
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { enumerateTerms, evalTerm, printTerm, num } from './induce.mjs';

export const REGIMES = Object.freeze(['revert', 'momentum', 'noise']);
export const FEE = 0.0005; // charged per unit of position change, both sides of a flip

// ---------------------------------------------------------------- the world
// One seeded series. mu is a slow anchor; in the revert regime the price is pulled back
// toward it, in the momentum regime a direction persists, in the noise regime nothing is
// there to find. The regime labels are returned so a report can say how much of the tape
// was even learnable.
export function generateSeries(seed, { steps = 600, p0 = 100, switchProb = 0.03, kappa = 0.25, drift = 0.004, sigma = 0.006, anchorTau = 60 } = {}) {
  const rng = new RNG('market:' + seed);
  const price = new Float64Array(steps + 1);
  const regime = new Int8Array(steps + 1);
  let p = p0, mu = p0, reg = rng.int(3), dir = rng.sign();
  price[0] = p; regime[0] = reg;
  for (let t = 1; t <= steps; t++) {
    if (rng.next() < switchProb) { reg = rng.int(3); dir = rng.sign(); }
    const dev = (p - mu) / mu;
    let ret;
    if (reg === 0) ret = -kappa * dev + sigma * rng.gauss();
    else if (reg === 1) ret = dir * drift + sigma * rng.gauss();
    else ret = sigma * rng.gauss();
    p = p * (1 + ret);
    mu = mu + (p - mu) / anchorTau;
    price[t] = p; regime[t] = reg;
  }
  return { seed, steps, price, regime };
}

// ---------------------------------------------------------------- features, causal only
// Every feature at step t is a function of prices up to t and of nothing after it. They
// are exact rationals rounded to a thousandth so the policy is evaluated by the same
// evalSym that evaluates every other program in this brain.
const MILLI = 1000n;
function q(x) { return S.rat(BigInt(Math.round(x * 1000)), MILLI); }
export function featureRows(series, { window = 20, lookback = 5, warmup = 25 } = {}) {
  const { price, steps, regime } = series;
  const rows = [];
  for (let t = warmup; t < steps; t++) {
    let sma = 0;
    for (let i = t - window + 1; i <= t; i++) sma += price[i];
    sma /= window;
    let s2 = 0;
    for (let i = t - window + 2; i <= t; i++) { const r = (price[i] - price[i - 1]) / price[i - 1]; s2 += r * r; }
    const vol = Math.sqrt(s2 / (window - 1)) * 100;
    rows.push({
      t,
      env: {
        z: q(((price[t] - sma) / sma) * 100),
        m: q(((price[t] - price[t - lookback]) / price[t - lookback]) * 100),
        v: q(vol),
        r: q(((price[t] - price[t - 1]) / price[t - 1]) * 100),
      },
      fwd: (price[t + 1] - price[t]) / price[t],
      regime: REGIMES[regime[t]],
    });
  }
  return rows;
}

// ---------------------------------------------------------------- scoring
// A position is the sign of the policy's value: buy, hold or sell. Return is the position
// times the next step's return, minus the fee on every change of position.
export function positionsOf(program, rows) {
  const pos = new Int8Array(rows.length);
  for (let i = 0; i < rows.length; i++) {
    const v = S.toRat(evalTerm(program, rows[i].env));
    pos[i] = v.n > 0n ? 1 : v.n < 0n ? -1 : 0;
  }
  return pos;
}
export function scorePositions(pos, rows, fee = FEE) {
  let ret = 0, trades = 0, prev = 0, wins = 0, taken = 0;
  for (let i = 0; i < rows.length; i++) {
    const change = Math.abs(pos[i] - prev);
    if (change) { trades++; ret -= fee * change; }
    const pnl = pos[i] * rows[i].fwd;
    ret += pnl;
    if (pos[i] !== 0) { taken++; if (pnl > 0) wins++; }
    prev = pos[i];
  }
  return { ret, trades, taken, winRate: taken ? wins / taken : 0 };
}
// The control is MATCHED: it is a permutation of the policy's own positions, so it holds
// the same number of buys, holds and sells and pays fees on the same scale. What it does
// not have is any relation between a decision and the state of the market at that step.
export function controlScore(pos, rows, { draws = 64, seed = 'control', fee = FEE } = {}) {
  const rng = new RNG(seed);
  const rets = [];
  const base = Array.from(pos);
  for (let d = 0; d < draws; d++) {
    const shuffled = rng.shuffle(base.slice());
    rets.push(scorePositions(Int8Array.from(shuffled), rows, fee).ret);
  }
  rets.sort((a, b) => a - b);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, rets.length - 1));
  return { mean, sd, draws: rets.length, best: rets[rets.length - 1], worst: rets[0], rets };
}

// A shuffle of single steps breaks the RUNS as well as the timing, so it trades far more
// often and pays far more fees: it would flatter the policy for a reason that has nothing
// to do with knowing anything. The second control permutes the ORDER OF THE RUNS instead,
// which keeps the same holdings and very nearly the same number of position changes, and
// only destroys which piece of tape each run sits on. The verdict is taken against
// whichever of the two controls scores higher.
export function runsOf(pos) {
  const runs = [];
  for (let i = 0; i < pos.length; i++) {
    if (i === 0 || pos[i] !== pos[i - 1]) runs.push({ v: pos[i], len: 1 });
    else runs[runs.length - 1].len++;
  }
  return runs;
}
export function blockControlScore(pos, rows, { draws = 64, seed = 'block', fee = FEE } = {}) {
  const rng = new RNG(seed);
  const runs = runsOf(pos);
  const rets = [], changes = [];
  for (let d = 0; d < draws; d++) {
    const order = rng.shuffle(runs.slice());
    const out = new Int8Array(pos.length);
    let i = 0;
    for (const r of order) for (let k = 0; k < r.len && i < out.length; k++) out[i++] = r.v;
    const sc = scorePositions(out, rows, fee);
    rets.push(sc.ret); changes.push(sc.trades);
  }
  rets.sort((a, b) => a - b);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const sd = Math.sqrt(rets.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, rets.length - 1));
  return { mean, sd, draws: rets.length, rets, meanTrades: changes.reduce((a, b) => a + b, 0) / changes.length };
}

// ---------------------------------------------------------------- induction of a policy
// The same bottom-up enumeration, with one difference that matters: two programs are the
// same program when they produce the same DECISIONS, so the pruning is on the buy, hold
// and sell vector and not on the raw values. The objective is the training return, which
// is exactly the kind of objective that can be gamed by a search, which is why nothing is
// claimed until the held-out seeds and the matched control have spoken.
export function inducePolicy(trainRows, { maxSize = 5, maxTerms = 60000, fee = FEE } = {}) {
  const t0 = performance.now();
  const rows = trainRows.map(r => r.env);
  let best = null, scored = 0;
  const r = enumerateTerms({
    rows, varTypes: { z: 'num', m: 'num', v: 'num', r: 'num' }, maxSize, maxTerms,
    wantTypes: ['num'],
    signature: (outs) => { let s = ''; for (const o of outs) s += o.n > 0n ? '1' : o.n < 0n ? '2' : '0'; return s; },
    onNew: (entry) => {
      if (entry.type !== 'num') return;
      const pos = Int8Array.from(entry.outs, o => (o.n > 0n ? 1 : o.n < 0n ? -1 : 0));
      const sc = scorePositions(pos, trainRows, fee);
      scored++;
      if (!best || sc.ret > best.score.ret) best = { term: entry.term, size: entry.size, score: sc };
    },
  });
  const ms = performance.now() - t0;
  return {
    program: best ? best.term : null, text: best ? printTerm(best.term) : null,
    size: best ? best.size : null, trainReturn: best ? best.score.ret : null,
    trainTrades: best ? best.score.trades : 0,
    searched: r.searched, distinctPolicies: r.kept, scored, ms: Number(ms.toFixed(2)),
  };
}

// ---------------------------------------------------------------- the whole experiment
export function runMarket({ trainSeeds = [1, 2, 3, 4, 5, 6, 7, 8], testSeeds = [101, 102, 103, 104, 105, 106, 107, 108], steps = 600, maxSize = 5, draws = 64, fee = FEE, registry = null } = {}) {
  const train = [];
  for (const s of trainSeeds) train.push(...featureRows(generateSeries(s, { steps })));
  const induced = inducePolicy(train, { maxSize, fee });
  if (!induced.program) return { ...induced, error: 'no policy found' };
  const perSeed = [];
  for (const s of testSeeds) {
    const rows = featureRows(generateSeries(s, { steps }));
    const pos = positionsOf(induced.program, rows);
    const policy = scorePositions(pos, rows, fee);
    const control = controlScore(pos, rows, { draws, seed: 'control:' + s, fee });
    const block = blockControlScore(pos, rows, { draws, seed: 'block:' + s, fee });
    // Always long is the third thing a policy has to beat, and it is not a control: it is
    // the answer to "did the search find anything beyond the drift of the tape".
    const hold = scorePositions(Int8Array.from(rows, () => 1), rows, fee);
    const strict = block.mean >= control.mean ? block : control;
    const beat = strict.rets.filter(x => x >= policy.ret).length;
    perSeed.push({
      seed: s, policyReturn: policy.ret, controlMean: control.mean, controlSd: control.sd,
      blockControlMean: block.mean, blockControlTrades: block.meanTrades,
      strictControl: strict === block ? 'run-order' : 'step-shuffle', strictControlMean: strict.mean,
      holdReturn: hold.ret,
      gap: policy.ret - strict.mean, trades: policy.trades, taken: policy.taken, winRate: policy.winRate,
      controlsAtLeastAsGood: beat, draws: strict.draws,
    });
  }
  const gaps = perSeed.map(r => r.gap);
  const n = gaps.length;
  const mean = gaps.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(gaps.reduce((a, b) => a + (b - mean) * (b - mean), 0) / Math.max(1, n - 1));
  const se = sd / Math.sqrt(n);
  const t = se > 0 ? mean / se : 0;
  const positives = gaps.filter(g => g > 0).length;
  const controlsAtLeastAsGood = perSeed.reduce((a, r) => a + r.controlsAtLeastAsGood, 0);
  const totalDraws = perSeed.reduce((a, r) => a + r.draws, 0);
  const pPermutation = (controlsAtLeastAsGood + 1) / (totalDraws + 1);
  // The bar, stated before the numbers are read: a gap is called real only when the paired
  // t across held-out seeds clears 2 and the permutation share is under 5 in 100. Anything
  // else is reported as not significant, in those words.
  const significant = Math.abs(t) >= 2 && pPermutation < 0.05;
  return {
    policy: induced.text, size: induced.size, searched: induced.searched,
    distinctPolicies: induced.distinctPolicies, scored: induced.scored, inductionMs: induced.ms,
    trainSeeds, testSeeds, steps, fee,
    trainReturn: induced.trainReturn, trainTrades: induced.trainTrades,
    policyReturn: perSeed.reduce((a, r) => a + r.policyReturn, 0),
    controlReturn: perSeed.reduce((a, r) => a + r.strictControlMean, 0),
    stepShuffleReturn: perSeed.reduce((a, r) => a + r.controlMean, 0),
    runOrderReturn: perSeed.reduce((a, r) => a + r.blockControlMean, 0),
    holdReturn: perSeed.reduce((a, r) => a + r.holdReturn, 0),
    gapOverHold: perSeed.reduce((a, r) => a + (r.policyReturn - r.holdReturn), 0),
    seedsBeatingHold: perSeed.filter(r => r.policyReturn > r.holdReturn).length,
    gap: perSeed.reduce((a, r) => a + r.gap, 0),
    meanGapPerSeed: mean, sdGap: sd, tStat: t, seedsWithPositiveGap: positives, seeds: n,
    controlsAtLeastAsGood, controlDraws: totalDraws, pPermutation, significant,
    verdict: significant ? 'the gap is significant by both the paired t and the permutation share' : 'the gap is NOT significant, and is reported as a number only',
    perSeed, program: induced.program,
    regimeShare: regimeShare(testSeeds, steps),
  };
}
function regimeShare(seeds, steps) {
  const counts = { revert: 0, momentum: 0, noise: 0 };
  for (const s of seeds) for (const row of featureRows(generateSeries(s, { steps }))) counts[row.regime]++;
  const total = counts.revert + counts.momentum + counts.noise;
  return { ...counts, total, revertShare: total ? counts.revert / total : 0 };
}

// Store the induced policy as an ordinary skill, so the router can answer a decision
// request with it and the connectome can hold it as a cell like any other capability.
export function storePolicy(registry, result, { name = 'market.policy' } = {}) {
  if (!result.program) return null;
  return registry.store({
    name, program: result.program, text: result.policy, type: 'num',
    vars: ['z', 'm', 'v', 'r'], inTypes: ['num', 'num', 'num', 'num'],
    examples: [], cost: result.size, family: 'decision',
  });
}
