// test/epochs.test.mjs: the organism genome, the MAP-Elites archive, the deep time engine
// and the emission path. Every organism built here is tiny on purpose: the point is that
// the mechanism is right, and a mechanism that is only right at 5000 majors is a mechanism
// nobody can test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { RNG } from '../core/rng.mjs';
import { REGIONS } from '../seeds/organism.mjs';
import { loadFrom, verify, diffOrganisms } from '../genome/load.mjs';
import {
  defaultOrganismGenome, randomOrganismGenome, cloneOrganismGenome,
  organismGenomeToJSON, organismGenomeFromJSON, validateOrganismGenome,
  mutateOrganismGenome, crossoverOrganismGenomes, evaluateOrganismGenome,
  buildFromOrganismGenome, expandRoster, behaviourDescriptors, descriptorVector,
  normalizedEntropy, hostableSuites, rosterVocabulary, rosterOf, suiteKinds, paretoFront,
  OBJECTIVE_WEIGHTS, BOUNDS, PERIOD_SLOTS,
} from '../generations/organism-genome.mjs';
import { Epochs, OrganismArchive, binOf, gridCapacity, DESCRIPTOR_AXES, SECONDS_PER_YEAR } from '../generations/epochs.mjs';

const TINY = { majors: 16, subcellsPerMajor: 3, edgesPerCell: 4, localWindow: 2 };
const tmp = () => mkdtempSync(path.join(os.tmpdir(), 'brain-epochs-'));

// ---------------------------------------------------------------- genome round trip
test('genome: the default genome is valid and carries every region', () => {
  const g = defaultOrganismGenome(TINY);
  assert.deepEqual(validateOrganismGenome(g), []);
  for (const r of REGIONS) {
    assert.ok(g.regions[r.name], 'no genes for ' + r.name);
    // The gene space of a region is rosterOf(r.name), not the seeds table: this module adds
    // the venue kinds to perception and motor without writing the exported REGIONS. Comparing
    // against r.roster.length asked the genome to carry a roster that is not the one it grows
    // from, and went red at 17 !== 16 the moment a kind was added. Compare the NAMES, not the
    // count, so a swap of one kind for another can no longer pass this, and assert separately
    // that the grown roster still contains every kind seeds declares: the two must agree about
    // what a region hosts, and the only permitted disagreement is what this module added.
    const mix = Object.keys(g.regions[r.name].kindMix).sort();
    assert.deepEqual(mix, rosterOf(r.name).sort(), 'the kindMix of ' + r.name + ' is not the gene space it is grown from');
    for (const kind of r.roster) assert.ok(mix.includes(kind), r.name + ' dropped the seeds kind ' + kind);
  }
});

test('genome: JSON round trip is exact and independent of the original', () => {
  const rng = new RNG('rt');
  const g = randomOrganismGenome(rng, TINY);
  const back = organismGenomeFromJSON(JSON.parse(JSON.stringify(organismGenomeToJSON(g))));
  assert.deepEqual(back.scale, g.scale);
  assert.deepEqual(back.regions, g.regions);
  assert.equal(back.id, g.id);
  back.scale.majors = 999;
  back.regions.perception.share = 0.5;
  assert.notEqual(g.scale.majors, 999, 'round trip shares the scale object with the original');
  assert.notEqual(g.regions.perception.share, 0.5, 'round trip shares a region block with the original');
});

test('genome: a serialized genome of the wrong version is refused', () => {
  assert.throws(() => organismGenomeFromJSON({ v: 2 }), /unknown serialized version/);
  assert.throws(() => organismGenomeFromJSON(null), /unknown serialized version/);
});

test('genome: expandRoster gives a kind twice the weight twice the slots', () => {
  const roster = ['a', 'b'];
  const out = expandRoster({ a: 2, b: 1 }, roster);
  assert.equal(out.length, BOUNDS.rosterLength);
  const a = out.filter((k) => k === 'a').length, b = out.filter((k) => k === 'b').length;
  assert.equal(a + b, BOUNDS.rosterLength);
  assert.ok(a > b, 'weight 2 got ' + a + ' slots, weight 1 got ' + b);
  assert.deepEqual(expandRoster({ a: 0, b: 0 }, roster), ['a'], 'a dead mix still yields one kind');
});

// ---------------------------------------------------------------- mutation
test('mutate: every mutation changes at least one gene, over 200 draws', () => {
  const rng = new RNG('mut');
  const base = defaultOrganismGenome(TINY);
  let changedScale = 0, changedRegion = 0;
  for (let i = 0; i < 200; i++) {
    const m = mutateOrganismGenome(base, rng, { rate: 1 });
    assert.deepEqual(validateOrganismGenome(m), [], 'mutation ' + i + ' produced an invalid genome');
    assert.ok(m.meta.mutations.length >= 1, 'mutation ' + i + ' recorded no operator');
    const scaleSame = JSON.stringify(m.scale) === JSON.stringify(base.scale);
    const regionSame = JSON.stringify(m.regions) === JSON.stringify(base.regions);
    assert.ok(!(scaleSame && regionSame), 'mutation ' + i + ' changed nothing: ' + m.meta.mutations.join(','));
    if (!scaleSame) changedScale++;
    if (!regionSame) changedRegion++;
  }
  assert.ok(changedScale > 0 && changedRegion > 0, 'scale ' + changedScale + ', region ' + changedRegion);
});

test('mutate: a mutant never leaves the declared bounds', () => {
  const rng = new RNG('bounds');
  let g = randomOrganismGenome(rng, TINY);
  for (let i = 0; i < 400; i++) {
    g = mutateOrganismGenome(g, rng, { rate: 3 });
    for (const [key, range] of [['majors', BOUNDS.majors], ['subcellsPerMajor', BOUNDS.subcellsPerMajor], ['edgesPerCell', BOUNDS.edgesPerCell], ['localWindow', BOUNDS.localWindow]]) {
      assert.ok(Number.isInteger(g.scale[key]), key + ' left the integers at step ' + i);
      assert.ok(g.scale[key] >= range[0] && g.scale[key] <= range[1], key + ' = ' + g.scale[key] + ' at step ' + i);
    }
    for (const r of Object.values(g.regions)) {
      assert.ok(r.share >= BOUNDS.share[0] && r.share <= BOUNDS.share[1]);
      assert.ok(r.learnProb >= 0 && r.learnProb <= BOUNDS.learnProb[1]);
      const sum = PERIOD_SLOTS.reduce((a, p) => a + r.periodMix[p], 0);
      assert.ok(Math.abs(sum - 1) < 1e-9, 'period mix sums to ' + sum);
    }
  }
});

test('mutate: the same seed produces the same mutant', () => {
  const base = defaultOrganismGenome(TINY);
  const a = mutateOrganismGenome(base, new RNG('same'), { rate: 3, id: 'x' });
  const b = mutateOrganismGenome(base, new RNG('same'), { rate: 3, id: 'x' });
  assert.deepEqual(a, b);
});

// ---------------------------------------------------------------- crossover
test('crossover: a child of two valid parents is valid, and takes genes from both', () => {
  const rng = new RNG('x');
  const a = randomOrganismGenome(rng, { ...TINY, id: 'A' });
  const b = randomOrganismGenome(rng, { ...TINY, id: 'B' });
  let fromA = 0, fromB = 0, blended = 0;
  for (let i = 0; i < 120; i++) {
    const c = crossoverOrganismGenomes(a, b, rng, { id: 'C' + i });
    assert.deepEqual(validateOrganismGenome(c), [], 'child ' + i + ' invalid');
    assert.deepEqual(c.meta.parents, ['A', 'B']);
    for (const name of Object.keys(c.regions)) {
      const s = c.regions[name].share;
      if (s === a.regions[name].share) fromA++;
      else if (s === b.regions[name].share) fromB++;
      else blended++;
    }
  }
  assert.ok(fromA > 0 && fromB > 0 && blended > 0, 'fromA ' + fromA + ', fromB ' + fromB + ', blended ' + blended);
});

test('crossover: a child of one genome with itself is that genome', () => {
  const rng = new RNG('self');
  const a = defaultOrganismGenome(TINY);
  const c = crossoverOrganismGenomes(a, cloneOrganismGenome(a), rng, { id: 'self' });
  assert.deepEqual(c.scale, a.scale);
  for (const name of Object.keys(a.regions)) {
    assert.ok(Math.abs(c.regions[name].share - a.regions[name].share) < 1e-12);
  }
});

// ---------------------------------------------------------------- building and evaluation
// buildFromOrganismGenome used to write the region genes INTO the exported REGIONS table of
// seeds/organism.mjs and put it back in a finally, and two tests pinned that restore: one on
// the happy path and one on a build that threw. buildOrganism takes a `regions` argument now
// (notes/generations.md request 4), so there is no patch and no finally, and a test that the
// table comes back is a test of nothing. The first of the two is kept in the only form that
// still says something real, that the exported table is never written at all; the second is
// replaced by the thing the request was FOR, two organisms with different rosters built in
// one process, which the patch made impossible.
test('build: the genome drives the brain and the exported region table is never written', () => {
  const before = REGIONS.map((r) => ({ share: r.share, roster: r.roster }));
  const g = defaultOrganismGenome(TINY);
  const { brain } = buildFromOrganismGenome(g, { name: 'built' });
  assert.equal(brain.cells.length, g.scale.majors * g.scale.subcellsPerMajor);
  assert.ok(brain.connectome.n > 0, 'no edges');
  REGIONS.forEach((r, i) => {
    assert.equal(r.share, before[i].share, r.name + ' share was written');
    assert.equal(r.roster, before[i].roster, r.name + ' roster was written');
  });
});

test('build: two organisms with different rosters are built in one process', () => {
  const kindsIn = (brain, region) => new Set([...brain.regions.get(region).cells].map((i) => brain.cells[i].kind));
  const roster = rosterOf('cognitive');
  const onlyFirst = roster[0], onlySecond = roster[1];
  assert.notEqual(onlyFirst, onlySecond, 'the cognitive roster is too short to make two different genomes');

  const a = defaultOrganismGenome({ ...TINY, id: 'og-a' });
  const b = defaultOrganismGenome({ ...TINY, id: 'og-b' });
  a.regions.cognitive.kindMix = { [onlyFirst]: 1 };
  b.regions.cognitive.kindMix = { [onlySecond]: 1 };

  // Built alternately, so a table patched by the first build and restored after it would
  // not be enough: the second build reads the table while the first organism is alive.
  const A1 = buildFromOrganismGenome(a, { name: 'roster-a' });
  const B1 = buildFromOrganismGenome(b, { name: 'roster-b' });
  const A2 = buildFromOrganismGenome(a, { name: 'roster-a2' });

  assert.deepEqual([...kindsIn(A1.brain, 'cognitive')], [onlyFirst], 'organism A is not built from its own roster');
  assert.deepEqual([...kindsIn(B1.brain, 'cognitive')], [onlySecond], 'organism B is not built from its own roster');
  assert.deepEqual([...kindsIn(A2.brain, 'cognitive')], [onlyFirst], 'organism A changed after B was built');
  assert.deepEqual(A1.roster.cognitive, A2.roster.cognitive);
  assert.notDeepEqual(A1.roster.cognitive, B1.roster.cognitive);
  // And the exported table still carries neither of the two single kind rosters.
  assert.deepEqual(REGIONS.find((r) => r.name === 'cognitive').roster, rosterOf('cognitive'));
});

test('build: the period and delay genes reach the built brain', () => {
  const slow = defaultOrganismGenome(TINY);
  const fast = defaultOrganismGenome(TINY);
  for (const name of Object.keys(slow.regions)) {
    slow.regions[name].delayScale = 4;
    fast.regions[name].delayScale = 0.25;
    slow.regions[name].periodMix = { event: 1, 1: 0, [1000]: 0, [60000]: 0, [3600000]: 0 };
  }
  const a = buildFromOrganismGenome(slow, { name: 'slow' }).brain;
  const b = buildFromOrganismGenome(fast, { name: 'fast' }).brain;
  const mean = (br) => { let s = 0; for (let e = 0; e < br.connectome.n; e++) s += br.connectome.delay[e]; return s / Math.max(1, br.connectome.n); };
  assert.ok(mean(a) > mean(b), 'delayScale 4 gave mean delay ' + mean(a).toFixed(3) + ', delayScale 0.25 gave ' + mean(b).toFixed(3));
  // The homeostasis clock circuit keeps its declared periods; every other cell obeys the mix.
  const offClock = a.cells.filter((c) => !(c.region === 'homeostasis' && (a.circuits.get(c.region + '/' + c.circuit)?.doc || '').startsWith('the homeostasis clock')));
  const driversOnly = offClock.filter((c) => c.policy.period !== 'event');
  for (const c of driversOnly) assert.equal(c.ports.in.length, 0, c.id + ' has in ports and a numeric period under an all-event mix');
});

test('evaluate: every component is finite, in range, and printed', () => {
  const g = defaultOrganismGenome(TINY);
  const r = evaluateOrganismGenome(g, { ticks: 80, windows: 4, seed: 'ev' });
  assert.ok(Number.isFinite(r.fitness), 'fitness is not finite');
  for (const [k, w] of Object.entries(OBJECTIVE_WEIGHTS)) {
    const v = r.components[k];
    assert.ok(Number.isFinite(v), 'component ' + k + ' is not finite: ' + v);
    assert.ok(v >= 0 && v <= 1, 'component ' + k + ' = ' + v + ' outside [0, 1]');
    assert.ok(Number.isFinite(w));
  }
  let recomputed = 0;
  for (const k of Object.keys(OBJECTIVE_WEIGHTS)) recomputed += OBJECTIVE_WEIGHTS[k] * r.components[k];
  assert.ok(Math.abs(recomputed - r.fitness) < 1e-6, 'the scalar does not equal the weighted sum of the printed components');
  for (const key of ['runsPerSecond', 'cells', 'edges', 'buildMs', 'tickMs', 'ticks']) {
    assert.ok(Number.isFinite(r.raw[key]), 'raw.' + key + ' is not finite');
  }
  assert.equal(r.windows.length, 4);
  assert.ok(r.raw.cells > 0 && r.raw.edges > 0);
});

// Four of the five components are a pure function of the genome and the seed. The fifth,
// throughput, is cell runs per WALL second, and a wall second is not reproducible: this
// asserts the four that are exact and holds the fifth to a band, rather than asserting a
// determinism the measurement cannot have. The consequence, that two evaluations of one
// genome can disagree in the last places of the scalar and so decide an archive cell
// differently, is written down in notes/generations.md rather than hidden here.
test('evaluate: the same genome and seed give the same everything except the wall clock', () => {
  const g = defaultOrganismGenome(TINY);
  const a = evaluateOrganismGenome(g, { ticks: 60, windows: 3, seed: 'det' });
  const b = evaluateOrganismGenome(g, { ticks: 60, windows: 3, seed: 'det' });
  for (const k of ['prediction', 'task', 'cost', 'novelty']) {
    assert.equal(a.components[k], b.components[k], 'component ' + k + ' is not deterministic');
  }
  assert.deepEqual(a.descriptors, b.descriptors);
  assert.equal(a.raw.cells, b.raw.cells);
  assert.equal(a.raw.edges, b.raw.edges);
  assert.equal(a.raw.cellRuns, b.raw.cellRuns, 'the same genome ran a different number of cells');
  assert.equal(a.raw.signals, b.raw.signals);
  assert.deepEqual(a.windows.map((w) => [w.fires, w.samples, w.surprise]), b.windows.map((w) => [w.fires, w.samples, w.surprise]));
  assert.ok(Math.abs(a.components.throughput - b.components.throughput) < 0.25,
    'throughput moved from ' + a.components.throughput + ' to ' + b.components.throughput + ' on identical work');
  assert.ok(Math.abs(a.fitness - b.fitness) < 0.25 * OBJECTIVE_WEIGHTS.throughput + 1e-9);
});

test('evaluate: an invalid genome is refused rather than scored', () => {
  const g = defaultOrganismGenome(TINY);
  g.regions.cognitive.kindMix = { 'no.such.kind': 4 };
  assert.throws(() => evaluateOrganismGenome(g, { ticks: 8, windows: 2 }), /not in that region roster|kindMix/);
});

test('evaluate: the task score has a denominator the gene space can reach', () => {
  const { hostable, unreachable } = hostableSuites();
  const vocab = rosterVocabulary();
  assert.ok(hostable.length >= 1, 'no suite is hostable by any genome');
  for (const u of unreachable) {
    assert.ok(u.missing.length >= 1, u.suite + ' is called unreachable with nothing missing');
    for (const k of u.missing) assert.ok(!vocab.has(k) || k.startsWith('('), u.suite + ' misses ' + k + ' but the rosters carry it');
  }
  const g = defaultOrganismGenome(TINY);
  const r = evaluateOrganismGenome(g, { ticks: 40, windows: 2, seed: 'suite' });
  assert.equal(r.raw.taskEligible.length + r.raw.taskSkipped.length, hostable.length);
});

// The denominator is not typed anywhere: it is the union of the region rosters against the
// kinds each solver is made of. Before seeds/organism.mjs carried seq.fit and the grid
// family it was one of three (notes/generations.md request 6). This asserts every suite the
// module declares is now reachable, and names the ones that are not if that stops being so.
test('evaluate: every declared suite is reachable from some genome in this gene space', () => {
  const { hostable, unreachable } = hostableSuites();
  const declared = [...suiteKinds().keys()];
  assert.deepEqual(unreachable, [], 'unreachable: ' + unreachable.map((u) => u.suite + ' wants ' + u.missing.join(' ')).join('; '));
  assert.equal(hostable.length, declared.length, 'hostable ' + hostable.join(',') + ' of declared ' + declared.join(','));
  const vocab = rosterVocabulary();
  for (const [name, need] of suiteKinds()) {
    for (const k of need) assert.ok(vocab.has(k), 'suite ' + name + ' wants ' + k + ', which no region roster carries');
  }
  console.log('  hostable ' + hostable.length + ' of ' + declared.length + ': ' + hostable.join(', ') + ' over a roster vocabulary of ' + vocab.size + ' kinds');
});

test('evaluate: descriptors are the four declared axes, in range', () => {
  const g = defaultOrganismGenome(TINY);
  const r = evaluateOrganismGenome(g, { ticks: 60, windows: 3, seed: 'desc' });
  for (const ax of DESCRIPTOR_AXES) assert.ok(Number.isFinite(r.descriptors[ax.key]), ax.key + ' missing');
  assert.ok(r.descriptors.regionEntropy >= 0 && r.descriptors.regionEntropy <= 1);
  assert.ok(r.descriptors.firingFraction >= 0 && r.descriptors.firingFraction <= 1);
  assert.ok(r.descriptors.kindEntropy >= 0 && r.descriptors.kindEntropy <= 1);
  assert.ok(r.descriptors.meanDelay >= 0);
  assert.equal(descriptorVector(r.descriptors).length, 4);
  assert.equal(normalizedEntropy([5]), 0, 'one live bucket is not diverse');
  assert.ok(Math.abs(normalizedEntropy([1, 1, 1, 1]) - 1) < 1e-12, 'four equal buckets are maximally diverse');
});

test('evaluate: the Pareto front holds every evaluation nothing dominates', () => {
  const mk = (c) => ({ components: c });
  const a = mk({ prediction: 1, task: 0, throughput: 0, cost: 0, novelty: 0 });
  const b = mk({ prediction: 0, task: 1, throughput: 0, cost: 0, novelty: 0 });
  const c = mk({ prediction: 0.5, task: 0.5, throughput: 0, cost: 0, novelty: 0 });
  const dominated = mk({ prediction: 0.4, task: 0.4, throughput: 0, cost: 0, novelty: 0 });
  const front = paretoFront([a, b, c, dominated]);
  assert.ok(front.includes(a) && front.includes(b) && front.includes(c));
  assert.ok(!front.includes(dominated));
});

// ---------------------------------------------------------------- the archive
test('archive: a cell is taken once, and only beaten by a better fitness', () => {
  const ar = new OrganismArchive();
  const g = defaultOrganismGenome(TINY);
  const desc = { regionEntropy: 0.5, meanDelay: 3, firingFraction: 0.2, kindEntropy: 0.9 };
  const r1 = ar.add({ id: 'a', genome: g, fitness: 0.5, components: {}, descriptors: desc, gen: 0 });
  assert.ok(r1.placed && r1.first);
  const r2 = ar.add({ id: 'b', genome: g, fitness: 0.4, components: {}, descriptors: desc, gen: 0 });
  assert.ok(!r2.placed, 'a worse organism took an occupied cell');
  const r3 = ar.add({ id: 'c', genome: g, fitness: 0.9, components: {}, descriptors: desc, gen: 0 });
  assert.ok(r3.placed && r3.replacedId === 'a');
  assert.equal(ar.fill(), 1);
  assert.equal(ar.best().id, 'c');
});

test('archive: binOf puts different behaviours in different cells', () => {
  const a = binOf({ regionEntropy: 0.1, meanDelay: 0.5, firingFraction: 0.01, kindEntropy: 0.1 });
  const b = binOf({ regionEntropy: 0.99, meanDelay: 64, firingFraction: 0.99, kindEntropy: 0.999 });
  assert.notEqual(a, b);
  assert.equal(a, '0-0-0-0');
  assert.equal(b, DESCRIPTOR_AXES.map((ax) => ax.edges.length).join('-'));
  assert.equal(gridCapacity(), DESCRIPTOR_AXES.reduce((n, ax) => n * (ax.edges.length + 1), 1));
});

test('archive: novelty is zero on an empty archive and positive once it is not', () => {
  const ar = new OrganismArchive();
  assert.equal(ar.novelty([0.5, 0.5, 0.5, 0.5]), 0);
  ar.add({ id: 'a', genome: defaultOrganismGenome(TINY), fitness: 1, components: {}, descriptors: { regionEntropy: 0, meanDelay: 0, firingFraction: 0, kindEntropy: 0 }, gen: 0 });
  assert.ok(ar.novelty([1, 1, 1, 1]) > 0);
  assert.equal(ar.novelty([0, 0, 0, 0]), 0, 'a behaviour already held is not novel');
});

test('archive: JSON round trip keeps the cells and the fill history', () => {
  const ar = new OrganismArchive();
  ar.add({ id: 'a', genome: defaultOrganismGenome(TINY), fitness: 0.3, components: { cost: 1 }, descriptors: { regionEntropy: 0.5, meanDelay: 3, firingFraction: 0.2, kindEntropy: 0.9 }, gen: 2 });
  ar.fillHistory.push([1, 1]);
  const back = OrganismArchive.fromJSON(JSON.parse(JSON.stringify(ar.toJSON())));
  assert.equal(back.fill(), ar.fill());
  assert.deepEqual(back.fillHistory, ar.fillHistory);
  assert.equal(back.best().id, 'a');
});

// ---------------------------------------------------------------- deep time
test('epochs: the archive fills at least 2 cells in 3 generations at tiny sizes', () => {
  const dir = tmp();
  try {
    const e = new Epochs({
      seed: 'fill', popSize: 6, ticks: 40, windows: 2, checkpointEvery: 0, dir,
      suites: false, scale: { majors: [14, 26], subcellsPerMajor: [2, 4], edgesPerCell: [3, 8], localWindow: [1, 4] },
    }).init();
    for (let i = 0; i < 3; i++) e.step();
    assert.equal(e.generation, 3);
    assert.ok(e.archive.fill() >= 2, 'archive filled ' + e.archive.fill() + ' cells in 3 generations');
    assert.equal(e.archive.fillHistory.length, 3);
    assert.equal(e.stats.errors, 0, 'errors during the run: ' + e.lastError);
    assert.equal(e.totalOrganisms, 18);
    assert.equal(e.totalTicks, 18 * 40);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('epochs: the years clock is the declared arithmetic and nothing else', () => {
  const dir = tmp();
  try {
    const e = new Epochs({ seed: 'yr', popSize: 4, ticks: 40, windows: 2, checkpointEvery: 0, dir, suites: false }).init();
    e.step();
    const y = e.years();
    const m = e.manifest();
    assert.equal(m.secondsPerYear, SECONDS_PER_YEAR);
    assert.equal(y.ticks, e.totalOrganisms * e.ticks);
    assert.equal(y.organismSeconds, y.ticks * m.secondsPerTick);
    assert.ok(Math.abs(y.years - (y.ticks * m.secondsPerTick) / SECONDS_PER_YEAR) < 1e-18);
    assert.ok(y.arithmetic.includes('organism-years'));
    assert.ok(y.arithmetic.includes(String(y.ticks)));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('epochs: a checkpoint resumes and continues the generation counter', () => {
  const dir = tmp();
  try {
    const a = new Epochs({ seed: 'ck', popSize: 4, ticks: 40, windows: 2, checkpointEvery: 2, dir, suites: false }).init();
    a.step(); a.step();
    assert.equal(a.stats.checkpoints, 1, 'no checkpoint at generation 2');
    assert.ok(existsSync(path.join(dir, 'latest.json')));

    const b = Epochs.resume(dir);
    assert.ok(b, 'resume found no checkpoint');
    assert.equal(b.generation, 2);
    assert.equal(b.totalOrganisms, a.totalOrganisms);
    assert.equal(b.totalTicks, a.totalTicks);
    assert.equal(b.archive.fill(), a.archive.fill());
    assert.equal(b.stats.resumed, 1);
    assert.equal(b.emitDir, a.emitDir, 'a resumed run would emit into a different tree');

    const row = b.step();
    assert.equal(row.gen, 3, 'the resumed run restarted the generation counter');
    assert.equal(b.generation, 3);
    assert.ok(b.totalTicks > a.totalTicks, 'the resumed run did not add ticks');
    assert.ok(b.years().years > a.years().years, 'the years clock did not carry over');
    assert.equal(Epochs.resume(path.join(dir, 'nothing-here')), null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('epochs: a checkpoint is the run, byte for byte on the fields that matter', () => {
  const dir = tmp();
  try {
    const a = new Epochs({ seed: 'byte', popSize: 4, ticks: 40, windows: 2, checkpointEvery: 1, dir, suites: false }).init();
    a.step();
    const j = JSON.parse(readFileSync(path.join(dir, 'gen-000001.json'), 'utf8'));
    assert.equal(j.v, 1);
    assert.equal(j.generation, 1);
    assert.equal(j.totalTicks, a.totalTicks);
    assert.equal(j.archive.cells.length, a.archive.fill());
    assert.deepEqual(j.manifest, a.manifest());
    assert.deepEqual(j.rng, a.rng.serialize());
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- emission
test('emission: an emitted elite loads back and is the same organism', async () => {
  const dir = tmp(), emitDir = tmp();
  try {
    const e = new Epochs({
      seed: 'emit', popSize: 3, ticks: 40, windows: 2, checkpointEvery: 0, dir,
      emit: true, emitLimit: 2, emitDir, suites: false,
      scale: { majors: [14, 20], subcellsPerMajor: [2, 3], edgesPerCell: [3, 6], localWindow: [1, 3] },
    }).init();
    e.step();
    assert.ok(e.emissions.length >= 1, 'nothing was emitted');
    assert.ok(e.emissions.length <= 2, 'the emit limit was not honoured: ' + e.emissions.length);
    assert.ok(e.emittedLines > 0);

    const rec = e.emissions[0];
    const out = path.join(emitDir, path.basename(rec.dir));
    assert.ok(existsSync(path.join(out, 'index.mjs')), 'no index.mjs at ' + out);
    assert.ok(existsSync(path.join(out, 'manifest.json')));

    const { brain, manifest } = await loadFrom(out);
    const v = verify(brain, manifest);
    assert.equal(v.ok, true, 'verify: ' + v.errors.join('; '));
    assert.equal(v.cells, rec.cells);
    assert.equal(v.edges, rec.edges);
    assert.equal(v.checkedEdges, rec.edges);

    // Rebuild the same genome and diff the two brains: the source is the organism.
    const elite = e.archive.elites().find((x) => x.id === rec.id);
    const rebuilt = buildFromOrganismGenome(organismGenomeFromJSON(elite.genome), { name: path.basename(rec.dir), seed: 'emit' }).brain;
    const d = diffOrganisms(brain, rebuilt);
    assert.equal(d.same, true, 'loaded and rebuilt differ: ' + d.differences.join('; '));

    // The emitter's line count is the count of the lines on disk.
    let onDisk = 0;
    for (const f of readdirSync(out)) onDisk += readFileSync(path.join(out, f), 'utf8').split('\n').length;
    assert.equal(onDisk, rec.lines, 'emitter claimed ' + rec.lines + ' lines, the files hold ' + onDisk);
    const counted = e.countEmittedLines();
    assert.ok(counted.files > 0);
  } finally { rmSync(dir, { recursive: true, force: true }); rmSync(emitDir, { recursive: true, force: true }); }
});

test('emission: behaviourDescriptors reads the brain it was given', () => {
  const { brain } = buildFromOrganismGenome(defaultOrganismGenome(TINY), { name: 'desc' });
  brain.tick(40);
  const trace = { firesByRegion: new Map([['perception', 10], ['cognitive', 10]]), distinctFired: brain.cells.length, windows: [] };
  const d = behaviourDescriptors(brain, trace);
  assert.equal(d.firingFraction, 1);
  assert.ok(Math.abs(d.regionEntropy - 1) < 1e-12, 'two equal regions should be maximally even, got ' + d.regionEntropy);
  assert.ok(d.meanDelay >= 0 && Number.isFinite(d.meanDelay));
});

// ---------------------------------------------------------------- the years clock, checked
// Added by the mutation plane (bench/mutants.mjs, pass 1, 2026-09-17). Four mutants of the
// years clock ran and survived the suite: ey01 made SECONDS_PER_YEAR a 365 day calendar year
// (1 hit), ey02 dropped the population from years per generation (4 hits), ey03 counted one
// generation too many in the lineage clock (14 hits), ey04 printed a number in the arithmetic
// string that is not the number reported beside it (14 hits). The existing years test could
// not catch any of them: it compares years() to an expression built from the SAME constant,
// which is circular, and it asserts only that the arithmetic string contains the substring
// 'organism-years'. Every number below is graded against its definition instead: the Julian
// year against 365.25 days, the manifest against its own declared ticks, the lineage clock
// against the generations actually run, and the printed sentence against the field it claims
// to explain.
test('the years clock is the Julian year, the population and the sentence it prints (mutants ey01, ey02, ey03, ey04)', () => {
  const dir = tmp();
  try {
    // 1. the constant, against its own definition rather than against itself
    assert.equal(SECONDS_PER_YEAR, 365.25 * 24 * 60 * 60, 'SECONDS_PER_YEAR is not a Julian year of 365.25 days');

    const popSize = 4, ticks = 40;
    const e = new Epochs({ seed: 'yr-graded', popSize, ticks, windows: 2, checkpointEvery: 0, dir, suites: false }).init();
    e.step(); e.step();
    const m = e.manifest(), y = e.years();

    // 2. the manifest: a generation runs the whole POPULATION, so its years are the
    //    population's years, which is the lineage figure times popSize
    assert.equal(m.ticksPerGeneration, ticks * popSize);
    assert.equal(m.yearsPerGeneration, (m.ticksPerGeneration * m.secondsPerTick) / m.secondsPerYear, 'years per generation is not the manifest arithmetic');
    assert.ok(Math.abs(m.yearsPerGeneration - m.yearsPerLineageGeneration * popSize) < 1e-24, 'a generation is not popSize lineage generations: ' + m.yearsPerGeneration + ' vs ' + m.yearsPerLineageGeneration * popSize);

    // 3. the lineage clock counts the generations that were RUN, not one more or one fewer
    assert.equal(y.generations, 2, 'two steps, two generations');
    assert.equal(y.lineageYears, (y.generations * ticks * m.secondsPerTick) / SECONDS_PER_YEAR, 'the lineage clock does not count the generations run');
    assert.ok(y.lineageYears > 0 && y.lineageYears < y.years, 'one line cannot have lived longer than the whole population');

    // 4. the printed sentence: the number after the last '=' is the number reported beside it
    const printed = /= ([0-9.e+-]+) organism-years$/.exec(y.arithmetic);
    assert.ok(printed, 'the arithmetic does not end in the years it computed: ' + y.arithmetic);
    assert.equal(printed[1], y.years.toExponential(6), 'the sentence states a different number than years');
    assert.ok(y.arithmetic.includes(' / ' + SECONDS_PER_YEAR + ' s/year'), 'the sentence divides by a year it does not name');
    assert.ok(y.arithmetic.includes(y.organismSeconds.toFixed(3) + ' organism-seconds'), 'the sentence states different organism-seconds');
    console.log('years clock: ' + y.arithmetic);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
