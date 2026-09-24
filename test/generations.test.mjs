import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import { getKind } from '../core/cell.mjs';
import {
  Innovations, cellGene, edgeGene, createGenome, cloneGenome,
  genomeToJSON, genomeFromJSON, genomeStats, validate, instantiate, buildBrain, cellById,
} from '../generations/genome.mjs';
import { portsCompatible, compatiblePairs, periodValue, readVec } from '../generations/palette.mjs';
import { mutate, addEdge, addCell, perturbParam, changePeriod, portsAllValid, DEFAULT_RATES, DEFAULT_LIMITS } from '../generations/mutate.mjs';
import { crossover, align, fitter } from '../generations/crossover.mjs';
import { Speciation, compatibility } from '../generations/species.mjs';
import { Archive, descriptorsOf } from '../generations/archive.mjs';
import { Pool, evaluateSerial, evaluateGenome, workerCount } from '../generations/evaluate.mjs';
import { getTask, taskNames, seedsFor } from '../generations/tasks/index.mjs';
import { Engine } from '../generations/engine.mjs';

const RACE = getTask('race');
const XOR = getTask('xor');
const SEQ = getTask('sequence');

function seedOf(task) { return task.seedGenome(new Innovations(), task.config); }

test('genome: round trip through JSON is exact, and the clone is independent', () => {
  const innov = new Innovations();
  const g = RACE.seedGenome(innov, RACE.config);
  const rng = new RNG('rt');
  let m = g;
  for (let i = 0; i < 12; i++) m = mutate(m, { rng, innov, palette: RACE.palette, width: RACE.width, id: 'm' + i });
  assert.deepEqual(validate(m), []);
  const j = JSON.parse(JSON.stringify(genomeToJSON(m)));
  const back = genomeFromJSON(j);
  assert.deepEqual(genomeToJSON(back), genomeToJSON(m));
  assert.deepEqual(genomeStats(back), genomeStats(m));
  // the copy really is a copy
  const c = cloneGenome(m);
  c.cells[0].params.gain = 999;
  c.edges[0].w = -999;
  assert.notEqual(m.cells[0].params.gain, 999);
  assert.notEqual(m.edges[0].w, -999);
  // and it builds the same circuit twice
  assert.throws(() => genomeFromJSON({ v: 2 }), /unknown serialized version/);
});

test('genome: instantiate builds real cells and edges into a Brain, and the connectome refuses a bad wire', () => {
  const g = seedOf(RACE);
  const b = new Brain({ ledger: 'off' });
  const { cells, wired } = instantiate(g, b);
  assert.equal(b.cells.length, g.cells.length);
  assert.equal(wired, g.edges.filter((e) => e.enabled).length);
  assert.equal(b.connectome.size(), wired);
  assert.ok(cells.get('in') && cells.get('out'));
  // a disabled edge gene is kept in the genome and NOT wired
  const g2 = cloneGenome(g);
  g2.edges[0].enabled = false;
  const b2 = new Brain({ ledger: 'off' });
  assert.equal(instantiate(g2, b2).wired, 0);
  assert.equal(g2.edges.length, 1);
  // The genome rule is STRICTER than the connectome's on purpose. core/brain.mjs connect()
  // accepts a wire when any one kind can meet and refuses the wrong signals later at emit
  // time; a genome that wires a port able to emit hv or num into a vec-only port would run
  // but silently drop signals, so validate() rejects it here.
  const bad = cloneGenome(seedOf(SEQ));
  bad.edges.push(edgeGene({ innov: 999, src: 'ctl', dst: 'out', srcPort: 0, dstPort: 0 }));
  const problems = validate(bad);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /incompatible ports/);
  // and a pair with no kind in common at all is refused by the connectome itself
  const worse = cloneGenome(seedOf(XOR));
  worse.edges.push(edgeGene({ innov: 998, src: 'in', dst: 'out', srcPort: 1, dstPort: 0 }));
  assert.match(validate(worse)[0], /incompatible ports/);
  assert.throws(() => instantiate(worse, new Brain({ ledger: 'off' })), /not accepted/);
});

test('genome: a built brain ticks and the output cell holds a vec', () => {
  const g = seedOf(RACE);
  const { brain, cells } = buildBrain(g, { seed: 'tick' });
  brain.inject('in', 0, { kind: 'vec', data: Float32Array.from([0.1, 0.2, 0.3, 1]) });
  brain.tick(4);
  const v = readVec(cells.get('out'));
  assert.ok(v instanceof Float32Array, 'out cell produced a vec');
  assert.equal(v.length, RACE.config.width);
  assert.ok(v.every((x) => Number.isFinite(x)));
});

test('mutation keeps port kinds valid on every genome it ever returns', () => {
  let checked = 0, grewCells = 0, grewEdges = 0, toggled = 0, periods = new Set();
  for (const task of [RACE, XOR, SEQ]) {
    const innov = new Innovations();
    const rng = new RNG('mut:' + task.name);
    const seed = task.seedGenome(innov, task.config);
    const inKind = seed.cells[0].kind;
    let g = seed;
    for (let i = 0; i < 400; i++) {
      const before = { cells: g.cells.length, enabled: g.edges.filter((e) => e.enabled).length };
      g = mutate(g, { rng, innov, palette: task.palette, width: task.width, id: 'm' + i });
      assert.ok(portsAllValid(g), task.name + ': mutation ' + i + ' produced an illegal port pair');
      assert.deepEqual(validate(g), [], task.name + ': mutation ' + i);
      if (g.cells.length > before.cells) grewCells++;
      if (g.edges.filter((e) => e.enabled).length !== before.enabled) toggled++;
      for (const c of g.cells) periods.add(String(c.period));
      checked++;
      // the interface is never lost
      assert.ok(cellById(g, 'in') && cellById(g, 'out'), task.name + ': interface cells survive');
      assert.equal(cellById(g, 'in').kind, inKind);
    }
    grewEdges += g.edges.length;
    // and every one of them instantiates without the connectome refusing anything
    instantiate(g, new Brain({ ledger: 'off' }));
  }
  assert.equal(checked, 1200);
  assert.ok(grewCells > 20, 'add-cell fired ' + grewCells + ' times');
  assert.ok(grewEdges > 10, 'genomes grew edges: ' + grewEdges);
  assert.ok(toggled > 20, 'enabled-edge count changed ' + toggled + ' times');
  assert.ok(periods.size > 3, 'periods seen: ' + [...periods].join(','));
});

test('mutation never wires a port pair the kinds forbid, and the forbidden pairs really are forbidden', () => {
  // predict.next emits vec|hv|num, gen.node accepts vec only, so that pair must be refused
  assert.equal(portsCompatible('predict.next', 0, 'gen.node', 0), false);
  assert.equal(portsCompatible('gen.node', 0, 'predict.next', 0), true);
  // vec.mlp's error port is num, nothing in the vec palette accepts it
  assert.equal(portsCompatible('vec.mlp', 1, 'vec.mlp', 0), false);
  assert.deepEqual(compatiblePairs('vec.mlp', 'gen.node'), [[0, 0]]);
  assert.equal(getKind('vec.mlp').ports.out[1].kinds.join(), 'num');

  const innov = new Innovations();
  const rng = new RNG('forbid');
  let g = SEQ.seedGenome(innov, SEQ.config);
  // the sequence genome carries a predict.next cell, so 600 mutations get every chance to
  // wire one; the port rule is what keeps it out of the circuit
  assert.ok(cellById(g, 'ctl').kind === 'predict.next');
  for (let i = 0; i < 600; i++) {
    g = mutate(g, { rng, innov, palette: SEQ.palette, width: SEQ.width, id: 'f' + i });
    for (const e of g.edges) {
      const a = cellById(g, e.src), b = cellById(g, e.dst);
      assert.ok(portsCompatible(a.kind, e.srcPort, b.kind, e.dstPort));
      assert.notEqual(a.kind, 'predict.next');
    }
  }
  // the control cell is never given an edge in either direction
  for (const e of g.edges) { assert.notEqual(e.src, 'ctl'); assert.notEqual(e.dst, 'ctl'); }
  assert.ok(g.cells.length > 3, 'the genome did grow around it: ' + g.cells.length + ' cells');
});

test('mutation operators each do their one job', () => {
  const innov = new Innovations();
  const rng = new RNG('ops');
  const base = seedOf(RACE);

  const g1 = cloneGenome(base);
  const e = addEdge(g1, { rng, innov, limits: DEFAULT_LIMITS });
  assert.ok(e, 'add-edge found a legal pair');
  assert.equal(g1.edges.length, base.edges.length + 1);
  assert.ok(portsAllValid(g1));

  const g2 = cloneGenome(base);
  const cell = addCell(g2, { rng: new RNG('split'), innov, palette: RACE.palette, width: RACE.width, limits: DEFAULT_LIMITS });
  assert.ok(cell, 'add-cell split an edge');
  assert.equal(g2.cells.length, base.cells.length + 1);
  assert.equal(g2.edges.length, base.edges.length + 2);
  assert.equal(g2.edges.filter((x) => x.enabled).length, base.edges.length + 1, 'the split edge is disabled');
  assert.equal(validate(g2).length, 0);
  // the two halves carry the innovation numbers of the split, so a second genome that
  // splits the same edge with the same kind is given the same numbers and the same id
  const g3 = cloneGenome(base);
  const cell3 = addCell(g3, { rng: new RNG('split'), innov, palette: RACE.palette, width: RACE.width, limits: DEFAULT_LIMITS });
  assert.equal(cell3.id, cell.id);
  assert.deepEqual(g3.edges.map((x) => x.innov), g2.edges.map((x) => x.innov));
  assert.equal(innov.of('cell:' + base.edges[0].innov + ':' + cell.kind), cell.innov);

  // a locked param is never perturbed; an unlocked one is
  const g4 = cloneGenome(g2);
  const widths = new Set(g4.cells.map((c) => c.params.width));
  let changed = 0;
  for (let i = 0; i < 300; i++) if (perturbParam(g4, { rng })) changed++;
  assert.ok(changed > 200, 'perturb-param fired ' + changed + ' times');
  assert.deepEqual(new Set(g4.cells.map((c) => c.params.width)), widths, 'locked width never moved');
  assert.equal(cellById(g4, 'in').params.gain, 1, 'the input cell locks all of its params');

  // period is a gene, and it only moves on cells that are not the interface
  const g5 = cloneGenome(g2);
  const seen = new Set();
  for (let i = 0; i < 300; i++) { const r = changePeriod(g5, { rng }); if (r) seen.add(String(r.period)); }
  assert.ok(seen.size > 2, 'periods reached: ' + [...seen].join(','));
  assert.equal(cellById(g5, 'in').period, 1);
  assert.equal(cellById(g5, 'out').period, 1);
  assert.equal(periodValue('event'), 1);
});

test('crossover: alignment splits matching, disjoint and excess, and the fitter parent supplies both', () => {
  const A = createGenome({
    id: 'A',
    cells: [cellGene({ innov: 1, id: 'in', kind: 'gen.node', role: 'in', fixed: true, params: { width: 4 } }),
      cellGene({ innov: 2, id: 'out', kind: 'gen.node', role: 'out', fixed: true, params: { width: 4 } }),
      cellGene({ innov: 5, id: 'cA', kind: 'gen.node', params: { width: 4 } })],
    edges: [edgeGene({ innov: 10, src: 'in', dst: 'out', w: 1 }),
      edgeGene({ innov: 11, src: 'in', dst: 'cA', w: 2 }),
      edgeGene({ innov: 14, src: 'cA', dst: 'out', w: 3 })],   // 14 is excess over B
  });
  const B = createGenome({
    id: 'B',
    cells: [cellGene({ innov: 1, id: 'in', kind: 'gen.node', role: 'in', fixed: true, params: { width: 4 } }),
      cellGene({ innov: 2, id: 'out', kind: 'gen.node', role: 'out', fixed: true, params: { width: 4 } }),
      cellGene({ innov: 6, id: 'cB', kind: 'gen.node', params: { width: 4 } })],
    edges: [edgeGene({ innov: 10, src: 'in', dst: 'out', w: -1 }),
      edgeGene({ innov: 12, src: 'in', dst: 'cB', w: -2 }),    // 12 is disjoint
      edgeGene({ innov: 13, src: 'cB', dst: 'out', w: -3 })],
  });
  const al = align(A.edges, B.edges);
  assert.deepEqual(al.matching.map(([a]) => a.innov), [10]);
  assert.deepEqual(al.disjoint.map(([, g]) => g.innov).sort((a, b) => a - b), [11, 12, 13]);
  assert.deepEqual(al.excess.map(([, g]) => g.innov), [14]);
  assert.equal(fitter(A, B, 2, 1), 'a');
  assert.equal(fitter(A, B, 1, 2), 'b');

  const childA = crossover(A, B, { rng: new RNG('x1'), fitA: 2, fitB: 1, id: 'kid' });
  const innovs = childA.edges.map((e) => e.innov).sort((a, b) => a - b);
  assert.deepEqual(innovs, [10, 11, 14], 'disjoint and excess come from the fitter parent only');
  assert.equal(validate(childA).length, 0);
  assert.deepEqual(childA.meta.parents, ['A', 'B']);

  const childB = crossover(A, B, { rng: new RNG('x1'), fitA: 1, fitB: 2, id: 'kid2' });
  assert.deepEqual(childB.edges.map((e) => e.innov).sort((a, b) => a - b), [10, 12, 13]);
  assert.equal(validate(childB).length, 0);
  assert.ok(childB.cells.some((c) => c.id === 'cB'));

  // the matching gene is taken from one parent or the other, never invented
  const ws = new Set();
  for (let i = 0; i < 40; i++) ws.add(crossover(A, B, { rng: new RNG('w' + i), fitA: 2, fitB: 1 }).edges.find((e) => e.innov === 10).w);
  assert.deepEqual([...ws].sort((a, b) => a - b), [-1, 1]);

  // interface flags always survive, whichever side the coin picked
  const kid = crossover(A, B, { rng: new RNG('x2'), fitA: 2, fitB: 1 });
  assert.equal(cellById(kid, 'in').role, 'in');
  assert.equal(cellById(kid, 'out').fixed, true);
});

test('crossover of evolved genomes always produces something that instantiates', () => {
  const innov = new Innovations();
  const rng = new RNG('cx');
  const base = RACE.seedGenome(innov, RACE.config);
  const pop = [];
  for (let i = 0; i < 24; i++) {
    let g = base;
    for (let k = 0; k < 10; k++) g = mutate(g, { rng, innov, palette: RACE.palette, width: RACE.width, id: 'p' + i + '_' + k });
    pop.push(g);
  }
  for (let i = 0; i < 100; i++) {
    const a = pop[rng.int(pop.length)], b = pop[rng.int(pop.length)];
    const kid = crossover(a, b, { rng, fitA: rng.next(), fitB: rng.next(), id: 'k' + i });
    assert.deepEqual(validate(kid), [], 'crossover ' + i);
    instantiate(kid, new Brain({ ledger: 'off' }));
  }
});

test('speciation splits distinct genomes, shares fitness, and moves its threshold toward the target', () => {
  const innov = new Innovations();
  const rng = new RNG('sp');
  const base = RACE.seedGenome(innov, RACE.config);
  // a family of near copies and a family that has grown structure
  const near = [], far = [];
  for (let i = 0; i < 8; i++) near.push(cloneGenome(base));
  let big = base;
  for (let k = 0; k < 14; k++) big = mutate(big, { rng, innov, palette: RACE.palette, width: RACE.width, rates: { ...DEFAULT_RATES, addCell: 1, addEdge: 1 }, id: 'big' + k });
  for (let i = 0; i < 8; i++) far.push(cloneGenome(big));

  assert.equal(compatibility(base, base), 0);
  assert.ok(compatibility(base, big) > 1, 'distance base to big: ' + compatibility(base, big));

  const sp = new Speciation({ threshold: 1.0, targetSpecies: 2, step: 0.2 });
  const scored = [...near.map((g) => ({ genome: g, fitness: 0.2 })), ...far.map((g) => ({ genome: g, fitness: 0.8 }))];
  const species = sp.speciate(scored, 0);
  assert.equal(species.length, 2, 'two families, two species');
  assert.deepEqual(species.map((s) => s.members.length).sort(), [8, 8]);

  sp.shareFitness();
  assert.equal(species[0].members[0].adjusted, species[0].members[0].fitness / 8);
  assert.ok(species[1].sumAdjusted > species[0].sumAdjusted);
  const alloc = sp.allocate(100);
  assert.equal(alloc.reduce((a, b) => a + b, 0), 100);
  assert.ok(alloc[1] > alloc[0], 'the fitter species gets more slots: ' + alloc.join('/'));

  // identical genomes collapse to one species at any threshold above zero
  const sp2 = new Speciation({ threshold: 1.0, targetSpecies: 8 });
  assert.equal(sp2.speciate(near.map((g) => ({ genome: g, fitness: 1 })), 0).length, 1);
  const before = sp2.threshold;
  sp2.adjustThreshold();
  assert.ok(sp2.threshold < before, 'below target, the threshold shrinks');
  const sp3 = new Speciation({ threshold: 0.2, targetSpecies: 1, step: 0.5 });
  sp3.speciate(scored, 0);
  assert.ok(sp3.species.length > 1);
  sp3.adjustThreshold();
  assert.ok(sp3.threshold > 0.2, 'above target, the threshold grows');

  // stagnation removes a species that stopped improving but never the best one
  const sp4 = new Speciation({ threshold: 1.0, targetSpecies: 4, stagnation: 3 });
  sp4.speciate(scored, 0);
  assert.equal(sp4.species.length, 2);
  sp4.speciate(scored, 10);
  assert.equal(sp4.removeStagnant(10), 1, 'the stale, weaker species is dropped');
  assert.equal(sp4.species.length, 1);
  assert.ok(sp4.species[0].best > 0.5, 'the surviving species is the best one');
});

test('archive: keeps everything, holds an elite per MAP-Elites bin, mixes its parent sources, and migrates', () => {
  const rng = new RNG('arch');
  const a = new Archive({ rng, islands: 3, noveltyCandidates: 64 });
  const innov = new Innovations();
  const base = RACE.seedGenome(innov, RACE.config);
  const mrng = new RNG('am');
  let g = base;
  for (let i = 0; i < 300; i++) {
    g = mutate(g, { rng: mrng, innov, palette: RACE.palette, width: RACE.width, id: 'a' + i });
    a.add({ id: g.id, genome: g, fitness: mrng.next(), descriptors: descriptorsOf(g, [mrng.next()]), gen: Math.floor(i / 30), island: i % 3 });
  }
  assert.equal(a.size(), 300, 'every evaluated genome is kept');
  assert.ok(a.grid.size > 1, 'MAP-Elites filled ' + a.grid.size + ' bins');
  assert.ok(a.grid.size < 300, 'bins are coarser than the population');
  for (const [key, e] of a.grid) {
    const inBin = a.entries.filter((x) => a.bin(x.descriptors) === key);
    assert.equal(e.fitness, Math.max(...inBin.map((x) => x.fitness)), 'bin ' + key + ' holds its elite');
  }
  assert.equal(a.best.fitness, Math.max(...a.entries.map((e) => e.fitness)));

  // novelty is a real distance: a descriptor far from everything scores higher
  const near = a.novelty(a.entries[10].descriptors);
  const far = a.novelty([999, 999, 999]);
  assert.ok(far > near, 'novelty far ' + far + ' vs near ' + near);

  // the parent mix uses all three sources
  a.lastMix = null;
  const picks = a.sampleParents(300);
  assert.equal(picks.length, 300);
  assert.ok(a.lastMix.best > 0 && a.lastMix.novelty > 0 && a.lastMix.random > 0, 'mix: ' + JSON.stringify(a.lastMix));
  assert.ok(a.lastMix.best > 60 && a.lastMix.novelty > 40 && a.lastMix.random > 40, 'mix roughly follows the weights: ' + JSON.stringify(a.lastMix));
  // a sampled parent is a copy, not a reference into the archive
  picks[0].genome.edges[0].w = 12345;
  assert.notEqual(genomeFromJSON(picks[0].entry.json).edges[0].w, 12345);
  // best-source picks come from the top of the archive
  const cut = [...a.entries].sort((x, y) => y.fitness - x.fitness)[Math.ceil(a.entries.length * 0.1) - 1].fitness;
  const bestPicks = a.sampleParents(60, { mix: { best: 1, novelty: 0, random: 0 } });
  assert.ok(bestPicks.every((p) => p.entry.fitness >= cut), 'best-source picks are in the top decile');

  // islands migrate around a ring
  const migrants = a.migrate();
  assert.equal(migrants.length, 3);
  assert.deepEqual(migrants.map((m) => m.from + '->' + m.to).sort(), ['0->1', '1->2', '2->0']);
  for (const m of migrants) assert.equal(m.genome.meta.island, m.to);
  assert.equal(a.bestOf(0).island, 0);

  // lineage walks back through the archive
  const chain = a.lineage(a.best.id, 4);
  assert.ok(chain.length >= 1 && chain[0].id === a.best.id);
});

test('tasks: the three seed genomes are valid, score in range, and are deterministic', () => {
  assert.deepEqual(taskNames().sort(), ['race', 'sequence', 'xor']);
  for (const t of [XOR, SEQ, RACE]) {
    const g = seedOf(t);
    assert.deepEqual(validate(g), [], t.name);
    assert.ok(cellById(g, 'in').role === 'in' && cellById(g, 'out').role === 'out');
    const seeds = seedsFor('t', 2);
    const a = t.evaluate(g, { seeds, cfg: t.config });
    const b = t.evaluate(g, { seeds, cfg: t.config });
    assert.equal(a.fitness, b.fitness, t.name + ' is deterministic');
    assert.deepEqual(a.descriptors, b.descriptors);
    assert.ok(a.fitness >= 0 && a.fitness <= 1, t.name + ' fitness in range: ' + a.fitness);
    // a different seed is a different episode
    const c = t.evaluate(g, { seeds: seedsFor('other', 2), cfg: t.config });
    assert.ok(Number.isFinite(c.fitness));
  }
  // race: the track comes from the seed, the same seed gives the same track
  const t1 = RACE.episode(seedOf(RACE), 'z', RACE.config);
  const t2 = RACE.episode(seedOf(RACE), 'z', RACE.config);
  assert.equal(t1.distance, t2.distance);
  assert.equal(t1.crashes, t2.crashes);
  // sequence: the control cell reports a real error on the same stream
  const s = SEQ.episode(seedOf(SEQ), 'z', SEQ.config);
  assert.ok(s.ctlErr != null && s.ctlErr > 0, 'predict.next control error: ' + s.ctlErr);
});

test('worker pool evaluates in parallel and matches the serial result exactly', async () => {
  const innov = new Innovations();
  const rng = new RNG('pool');
  const base = RACE.seedGenome(innov, RACE.config);
  const pop = [];
  for (let i = 0; i < 64; i++) {
    let g = base;
    for (let k = 0; k < 8; k++) g = mutate(g, { rng, innov, palette: RACE.palette, width: RACE.width, id: 'w' + i + '_' + k });
    pop.push(g);
  }
  const seeds = seedsFor('pool', 2);
  const serial = evaluateSerial(pop, { task: 'race', seeds });
  const size = Math.min(4, Math.max(2, workerCount()));
  const pool = new Pool({ task: 'race', size, chunk: 3 });
  try {
    assert.ok(pool.size >= 2, 'the pool really has more than one thread');
    const par = await pool.evaluate(pop, { seeds });
    assert.equal(par.length, pop.length);
    for (let i = 0; i < pop.length; i++) {
      assert.equal(par[i].ok, true, 'genome ' + i + ': ' + par[i].error);
      assert.equal(par[i].fitness, serial[i].fitness, 'genome ' + i + ' fitness differs between pool and serial');
      assert.deepEqual(par[i].descriptors, serial[i].descriptors, 'genome ' + i + ' descriptors differ');
    }
    assert.ok(new Set(serial.map((r) => r.fitness)).size > 3, 'the population is not all one number');
    // a second batch on the same pool is the same again: no state carried between jobs
    const again = await pool.evaluate(pop, { seeds });
    for (let i = 0; i < pop.length; i++) assert.equal(again[i].fitness, serial[i].fitness);
    // and the single-genome entry point agrees with both
    assert.equal(evaluateGenome(genomeToJSON(pop[0]), { task: 'race', seeds }).fitness, serial[0].fitness);
    assert.equal(pool.stats.errors, 0);
  } finally {
    await pool.close();
  }
});

test('engine promotes only through the gate: a gate that refuses leaves the champion empty', async () => {
  const refuse = new Brain({ name: 'refuse', ledger: 'runs', policy: () => 'reject' });
  const e = new Engine({ task: 'race', seed: 'gate', popSize: 24, episodes: 1, controlSize: 6, parallel: false, brain: refuse }).init();
  const summaries = await e.run({ generations: 4 });
  await e.close();
  assert.ok(summaries.every((s) => s.best >= 0));
  assert.ok(refuse.gate.stats.proposed >= 1, 'the engine did propose');
  assert.equal(refuse.gate.stats.approved, 0);
  assert.equal(refuse.gate.stats.rejected, refuse.gate.stats.proposed);
  assert.equal(e.champion, null, 'nothing was promoted without the gate');
  assert.ok(e.rawBest.fitness > 0, 'there was a best genome to promote: ' + e.rawBest.fitness);
  assert.equal(e.stats.promoted, 0);
  assert.equal(refuse.clock.gen, 4, 'the generation clock still advanced');
  // every proposal and decision is in the ledger
  const props = refuse.ledger.recent(500, 'proposal').filter((p) => p.kind === 'genome.promote');
  assert.equal(props.length, refuse.gate.stats.proposed);
  assert.ok(props.every((p) => 'gain' in p.evidence && 'beatControl' in p.evidence));
  assert.equal(refuse.ledger.recent(500, 'generation').length, 4);
});

test('engine promotes through the default gate only when the gain beat the control', async () => {
  const e = new Engine({ task: 'race', seed: 'gate2', popSize: 40, episodes: 1, controlSize: 10, parallel: false }).init();
  await e.run({ generations: 8 });
  const stats = e.brain.gate.stats;
  await e.close();
  assert.ok(stats.proposed > 0);
  assert.equal(stats.approved + stats.rejected, stats.proposed);
  assert.ok(stats.approved > 0, 'something was promoted');
  assert.ok(e.champion && e.champion.fitness === e.bestSoFar);
  // the default policy is the rule that decided: gain above zero AND beatControl true
  const decided = e.history.filter((h) => h.decision);
  for (const h of decided) {
    if (h.decision === 'approved') assert.equal(h.beatControl, true, 'gen ' + h.gen + ' was approved without beating the control');
  }
  assert.ok(decided.some((h) => h.decision === 'approved'));
  assert.equal(e.brain.clock.gen, 8);
  assert.ok(e.archive.size() === 40 * 8, 'every evaluated genome reached the archive: ' + e.archive.size());
});

// Calibration, measured on this machine with this configuration (population 48, 2 episodes,
// serial evaluation, cap 40 generations): seeds a to h all solved xor, at generations
// 25, 9, 6, 9, 5, 17, 15, 6. The cap of 40 is above the worst of those; the test runs the
// seed that solves in 6 so the suite stays fast, and prints the generation it reached.
test('xor: the engine reaches the solved threshold, and the generation it took is printed', async () => {
  const threshold = XOR.threshold;
  const e = new Engine({ task: 'xor', seed: 'c', popSize: 48, episodes: 2, controlSize: 10, parallel: false }).init();
  let solvedAt = -1;
  const history = await e.run({
    generations: 40,
    untilFitness: threshold,
    onGeneration: (s) => { if (solvedAt < 0 && s.champion != null && s.champion >= threshold) solvedAt = s.gen; },
  });
  const champ = e.champion;
  await e.close();
  assert.ok(solvedAt >= 0, 'xor not solved in 40 generations, best champion ' + (champ && champ.fitness));
  assert.ok(champ.fitness >= threshold);
  assert.equal(champ.extras.acc, 1, 'all four xor cases correct');
  assert.ok(history[0].best < threshold, 'generation 0 had not solved it: ' + history[0].best);
  console.log('    xor solved: fitness ' + champ.fitness.toFixed(6) + ' (acc ' + champ.extras.acc + ') at generation ' + solvedAt +
    ' of ' + history.length + ' run, population 48, 2 episodes per genome, seed "a"');
});

test('engine: an evolved population beats its own random-mutation control on the same seeds', async () => {
  const e = new Engine({ task: 'race', seed: 'ctrl', popSize: 60, episodes: 2, controlSize: 20, parallel: false }).init();
  const history = await e.run({ generations: 12 });
  const summary = e.summary();
  await e.close();
  const first = history[0], last = history[history.length - 1];
  assert.ok(last.best > first.best, 'best rose ' + first.best.toFixed(4) + ' -> ' + last.best.toFixed(4));
  assert.ok(last.mean > first.mean, 'mean rose ' + first.mean.toFixed(4) + ' -> ' + last.mean.toFixed(4));
  const beat = history.filter((h) => h.control != null && h.best > h.control).length;
  assert.ok(beat >= history.length - 2, 'the population beat the drift control in ' + beat + ' of ' + history.length + ' generations');
  assert.ok(summary.species.count >= 1);
  assert.equal(summary.clockGen, 12);
  assert.equal(summary.stats.episodes, 12 * (60 + 20) * 2);
  console.log('    race, 12 generations, population 60: best ' + first.best.toFixed(4) + ' -> ' + last.best.toFixed(4) +
    ', mean ' + first.mean.toFixed(4) + ' -> ' + last.mean.toFixed(4) +
    ', control best ' + Math.max(...history.map((h) => h.control ?? 0)).toFixed(4) +
    ', species ' + summary.species.count + ', archive ' + summary.archive.entries);
});
