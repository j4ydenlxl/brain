// bench/self-null.mjs: the null-delta calibration the self loop asked for (notes/self.md
// request 5). The trial grader holds every hypothesis to a fixed noise band of 0.5%
// (self/trial.mjs, `band`), a placeholder someone picked. This bench measures the two
// nulls that band stands in for, and prints what the band should be:
//
//   (1) measurement noise: two clones of the same parent, same seed, same input stream, no
//       delta on either arm. Every metric's gain must be exactly 0 if the arms are
//       deterministic. It is printed, not assumed.
//   (2) spillover: a real candidate delta (what propose() emits) is applied to the treated
//       arm and graded on every metric it did NOT target. A change that adds cells to one
//       region moves another region's runs only through scheduling and attention coupling;
//       that spread is the floor a targeted claim has to clear to mean anything.
//
// The recommendation is the p95 of the untargeted |gainPct| over all candidates and seeds.
// The round's verdicts are then regraded at that band and the flips are counted, so the
// cost of moving the band is a number too. Verdict: bench/verdicts/self-null.json.
//
//   node bench/self-null.mjs [--majors 30] [--ticks 32] [--seeds 4] [--max 6]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOrganism } from '../seeds/organism.mjs';
import '../cells/index.mjs';
import { observe, METRICS, round } from '../self/observe.mjs';
import { propose, applyDelta, readMetric, deltaLine, hypothesis, spillFloor } from '../self/propose.mjs';
import { inputStream, runArm, grade, armDigest } from '../self/trial.mjs';
import { cloneSub } from '../simulate/clone.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? Number(args[i + 1]) : dflt; };
const MAJORS = opt('majors', 30), TICKS = opt('ticks', 32), SEEDS = opt('seeds', 4), MAX = opt('max', 6);
const WARM = 48;
let BAND = 0.005; // replaced by spillFloor(cells) once the first organism is built: the daemon's band

// The same arithmetic as grade(): gain over |control|, or over 1 when control is 0.
function pct(tv, cv) {
  const denom = Math.abs(cv) > 0 ? Math.abs(cv) : 1;
  return round(((tv - cv) / denom) * 100, 4);
}
function pick(arm, p) {
  const v = readMetric({ metrics: arm.metrics, regions: arm.regions, suites: null }, p);
  return v === null || !Number.isFinite(v) ? null : v;
}
function quantile(sorted, q) {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil(q * sorted.length) - 1));
  return sorted[i];
}
function paths(brain) {
  const out = [];
  for (const name of brain.regions.keys()) for (const m of ['runs', 'fired', 'active']) out.push('region.' + name + '.' + m);
  for (const m of METRICS) out.push('self.' + m);
  return out;
}

const t0 = process.hrtime.bigint();
const spill = [], targeted = [], byKind = new Map(), perSeed = [];
let noiseMax = 0, noiseMetrics = 0, candidates = 0, applied = 0, inapplicable = 0;
const regrade = [];
for (let s = 0; s < SEEDS; s++) {
  const seed = 'null-' + String.fromCharCode(97 + s);
  const b = buildOrganism({ majors: MAJORS, seed, name: 'self-' + seed, ledger: 'off' });
  b.tick(WARM);
  if (s === 0) BAND = spillFloor(b.cells.length);
  const model = observe(b, { log: false });
  const cands = propose(b, model, { max: MAX, round: 1 });
  const stream = inputStream(b, { ticks: TICKS });
  const armSeed = b.name + ':arm:' + b.clock.t;
  const clone = () => cloneSub(b, { name: b.name + '.arm', seed: armSeed });
  // (1) measurement noise: two arms, no delta.
  const c1 = clone(), c2 = clone();
  const matched = armDigest(c1) === armDigest(c2);
  const r1 = runArm(c1, stream, TICKS), r2 = runArm(c2, stream, TICKS);
  const ps = paths(b);
  let seedNoise = 0;
  for (const p of ps) {
    const a = pick(r1, p), c = pick(r2, p);
    if (a === null || c === null) continue;
    noiseMetrics++;
    seedNoise = Math.max(seedNoise, Math.abs(pct(a, c)));
  }
  noiseMax = Math.max(noiseMax, seedNoise);
  // (2) spillover: each candidate against the control arm r1, on every metric it did not name.
  let seedApplied = 0;
  const seedSpill = [];
  for (const cand of cands) {
    candidates++;
    const treated = clone();
    const ok = applyDelta(treated, cand.delta, { by: 'self.null' });
    if (!ok.ok) { inapplicable++; continue; }
    applied++; seedApplied++;
    const rt = runArm(treated, stream, TICKS);
    const kind = cand.delta.kind;
    let k = byKind.get(kind);
    if (!k) { k = { candidates: 0, spill: [], targeted: [] }; byKind.set(kind, k); }
    k.candidates++;
    for (const p of ps) {
      const tv = pick(rt, p), cv = pick(r1, p);
      if (tv === null || cv === null) continue;
      const g = Math.abs(pct(tv, cv));
      if (p === cand.hypothesis.metric) { targeted.push(g); k.targeted.push(g); }
      else { spill.push(g); seedSpill.push(g); k.spill.push(g); }
    }
    regrade.push({ seed, id: cand.id, kind, line: deltaLine(cand.delta), metric: cand.hypothesis.metric, treated: rt, control: r1, cand });
  }
  seedSpill.sort((x, y) => x - y);
  perSeed.push({ seed, cells: b.cells.length, edges: b.connectome.size(), candidates: cands.length, applied: seedApplied, matchedArms: matched, noiseMaxPct: seedNoise, spillP95Pct: quantile(seedSpill, 0.95), spillMaxPct: seedSpill.length ? seedSpill[seedSpill.length - 1] : 0 });
  console.log(`seed ${seed}: ${b.cells.length} cells ${b.connectome.size()} edges, arms matched ${matched}, noise max ${seedNoise}%, ${cands.length} candidates ${seedApplied} applied, spill p95 ${quantile(seedSpill, 0.95)}% max ${seedSpill.length ? seedSpill[seedSpill.length - 1] : 0}% over ${seedSpill.length} metric readings`);
}
spill.sort((x, y) => x - y); targeted.sort((x, y) => x - y);
const p50 = quantile(spill, 0.5), p90 = quantile(spill, 0.9), p95 = quantile(spill, 0.95), max = spill.length ? spill[spill.length - 1] : 0;
// The recommended band is the spillover p95, rounded up to the next 0.05%, never below 0.05%.
const recommendedPct = round(Math.max(0.05, Math.ceil(p95 / 0.05) * 0.05), 4);
const recommended = round(recommendedPct / 100, 6);
const tally = (band) => {
  const t = { confirmed: 0, refuted: 0, undecided: 0 };
  for (const r of regrade) t[grade(r.cand, r.treated, r.control, { band }).verdict]++;
  return t;
};
const atCurrent = tally(BAND), atRecommended = tally(recommended);
let flips = 0;
for (const r of regrade) if (grade(r.cand, r.treated, r.control, { band: BAND }).verdict !== grade(r.cand, r.treated, r.control, { band: recommended }).verdict) flips++;
// The bar side: barFrom() floors a hypothesis at 0.1%, below the spillover p95, so a claim
// that small can be met by coupling alone. Every candidate is regraded with its bar raised
// to the recommended band (a hypothesis already above it is unchanged) and the flips counted.
const floorTo = Math.max(recommended, BAND);
const raised = (cand) => {
  const h = cand.hypothesis;
  const ratio = h.direction === 'up' ? Math.max(h.ratio, 1 + floorTo) : Math.min(h.ratio, 1 - floorTo);
  return { ...cand, hypothesis: hypothesis({ metric: h.metric, direction: h.direction, ratio, floor: h.floor, why: h.why }) };
};
const atRaisedFloor = { confirmed: 0, refuted: 0, undecided: 0 };
let floorFlips = 0, floorRaisedOn = 0;
for (const r of regrade) {
  const c2 = raised(r.cand);
  if (c2.hypothesis.ratio !== r.cand.hypothesis.ratio) floorRaisedOn++;
  const v2 = grade(c2, r.treated, r.control, { band: recommended }).verdict;
  atRaisedFloor[v2]++;
  if (v2 !== grade(r.cand, r.treated, r.control, { band: recommended }).verdict) floorFlips++;
}
const kinds = {};
for (const [k, v] of byKind) {
  v.spill.sort((x, y) => x - y); v.targeted.sort((x, y) => x - y);
  kinds[k] = { candidates: v.candidates, spillP50Pct: quantile(v.spill, 0.5), spillP95Pct: quantile(v.spill, 0.95), spillMaxPct: v.spill.length ? v.spill[v.spill.length - 1] : 0, targetedP50Pct: quantile(v.targeted, 0.5), targetedMaxPct: v.targeted.length ? v.targeted[v.targeted.length - 1] : 0 };
}
const ms = round(Number(process.hrtime.bigint() - t0) / 1e6, 1);
console.log(`measurement noise over ${noiseMetrics} metric readings: max ${noiseMax}% (two arms, no delta)`);
console.log(`spillover over ${spill.length} untargeted readings from ${applied} applied candidates (${inapplicable} inapplicable): p50 ${p50}% p90 ${p90}% p95 ${p95}% max ${max}%`);
console.log(`targeted effect over ${targeted.length} readings: p50 ${quantile(targeted, 0.5)}% max ${targeted.length ? targeted[targeted.length - 1] : 0}%`);
for (const [k, v] of Object.entries(kinds)) console.log(`  ${k.padEnd(14)} ${v.candidates} candidates: spill p50 ${v.spillP50Pct}% p95 ${v.spillP95Pct}% max ${v.spillMaxPct}%, targeted p50 ${v.targetedP50Pct}% max ${v.targetedMaxPct}%`);
console.log(`band: current ${round(BAND * 100, 4)}% (spillFloor at this size) -> recommended ${recommendedPct}% (spill p95 rounded up); verdicts at current confirmed ${atCurrent.confirmed} refuted ${atCurrent.refuted} undecided ${atCurrent.undecided}; at recommended confirmed ${atRecommended.confirmed} refuted ${atRecommended.refuted} undecided ${atRecommended.undecided}; ${flips} of ${regrade.length} verdicts flip; ${ms} ms`);
console.log(`bar floor raised to ${round(floorTo * 100, 4)}% on ${floorRaisedOn} of ${regrade.length} hypotheses: confirmed ${atRaisedFloor.confirmed} refuted ${atRaisedFloor.refuted} undecided ${atRaisedFloor.undecided}; ${floorFlips} verdicts flip against the recommended band alone`);
const verdict = {
  at: new Date().toISOString(), node: process.version, majors: MAJORS, ticks: TICKS, warm: WARM, seeds: SEEDS, maxPerSeed: MAX,
  candidates, applied, inapplicable, noiseMetrics, noiseMaxPct: noiseMax,
  spill: { n: spill.length, p50Pct: p50, p90Pct: p90, p95Pct: p95, maxPct: max },
  targeted: { n: targeted.length, p50Pct: quantile(targeted, 0.5), maxPct: targeted.length ? targeted[targeted.length - 1] : 0 },
  byKind: kinds,
  band: { currentPct: round(BAND * 100, 4), recommendedPct, recommended },
  verdicts: { atCurrent, atRecommended, flips, graded: regrade.length, floorToPct: round(floorTo * 100, 4), atRaisedFloor, floorRaisedOn, floorFlips },
  perSeed, ms,
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
const out = MAJORS === 30 ? 'self-null.json' : 'self-null-' + MAJORS + '.json';
writeFileSync(path.join(HERE, 'verdicts', out), JSON.stringify(verdict, null, 2) + '\n');
console.log('verdict written to bench/verdicts/' + out);
