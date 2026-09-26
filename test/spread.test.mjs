// test/spread.test.mjs: the spread item (Board 14). No model, no network, no write to the real tree:
// every file this writes lives under a temp dir that is removed at the end. The suite is the
// synthetic one of daemon/multiply.mjs loadSuite (a few ms to build), the bursts are tiny.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, readdirSync, mkdirSync, statSync, existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import { cloneSub } from '../simulate/clone.mjs';
import { loadSuite, POPULATION_SIZE, spreadConduits, populationIds } from '../daemon/multiply.mjs';
import { defaultOrganismGenome, cloneOrganismGenome, organismGenomeToJSON, organismGenomeFromJSON } from '../generations/organism-genome.mjs';
import {
  loadRegistry, withOperatorGenes, operatorGenesOf, randomOperatorGenes, genesToJSON, normalizeOperatorGenes, validateOperatorGenes, defaultOperatorGenes, noiseOf,
} from '../generations/operators-gene.mjs';
import { SpreadPopulation, KIND, PROMOTED_KIND, REL, confirmSurvivors, promotedLine, promote, OPTIONS } from '../generations/spread.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reg = await loadRegistry({ say: () => {} });
const suite = loadSuite({ suite: { kind: 'synthetic', seed: 'spread-test' } });
const TINY = { burstGens: 4, burstPop: 16, window: 4, yardSeeds: 1, survive: 4, heldSeeds: 1, promoteSeeds: 2 };

const tmps = [];
const tmp = (tag) => { const d = mkdtempSync(path.join(os.tmpdir(), 'spread-test-' + tag + '-')); tmps.push(d); return d; };
test.after(() => { for (const d of tmps) rmSync(d, { recursive: true, force: true }); });

/** Every file under a dir with its bytes: what a test can see of a tree. */
function treeBytes(dir) {
  const out = {};
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else out[path.relative(dir, p)] = readFileSync(p, 'utf8'); } };
  if (existsSync(dir)) walk(dir);
  return out;
}

test('the operator genes round-trip through the genome and the clone', () => {
  const genes = randomOperatorGenes(new RNG('spread-test-genes'), reg);
  assert.deepEqual(validateOperatorGenes(genes, reg), [], 'random genes are valid genes');
  assert.notDeepEqual(genesToJSON(genes), genesToJSON(defaultOperatorGenes(reg)), 'the planted genes differ from the default, so a round trip that loses them would show');
  const genome = withOperatorGenes(defaultOrganismGenome({ id: 'og-spread', majors: 16 }), genes, reg);
  assert.ok(Object.isFrozen(genome.meta.operators) && Object.isFrozen(genome.meta.operators.order), 'the genes are frozen in meta, so a shallow meta copy cannot change them');
  // the genome: a deep clone, and a JSON round trip through the organism genome's own (de)serializer
  assert.deepEqual(genesToJSON(operatorGenesOf(cloneOrganismGenome(genome), reg)), genesToJSON(genes));
  const back = organismGenomeFromJSON(JSON.parse(JSON.stringify(organismGenomeToJSON(genome))));
  assert.deepEqual(genesToJSON(operatorGenesOf(back, reg)), genesToJSON(genes));
  assert.equal(operatorGenesOf(defaultOrganismGenome({ majors: 16 }), reg), null, 'a genome that never grew the field has no genes');
  // the clone: simulate/clone.mjs carries the genes, deep and frozen, and nothing else of the genome
  const brain = new Brain({ name: 'genes', ledger: 'off', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
  brain.addCell({ id: 'a', kind: KIND, policy: { period: 'event' } });
  brain.byId.get('a').state = { seen: {}, spread: false };
  assert.equal(cloneSub(brain, { cells: ['a'] }).operatorGenes, undefined, 'no genes on the brain, none on the clone');
  brain.organismGenome = genome;
  const twin = cloneSub(brain, { cells: ['a'] });
  assert.deepEqual(genesToJSON(normalizeOperatorGenes(twin.operatorGenes, reg)), genesToJSON(genes));
  assert.notEqual(twin.operatorGenes, genome.meta.operators, 'a copy, not the parent object');
  assert.ok(Object.isFrozen(twin.operatorGenes.order));
  assert.equal(twin.organismGenome, undefined, 'only the genes ride with the clone');
  // a spread organism's genes live in its cell state and survive the clone the trials run on
  const pop = new SpreadPopulation({ suite, seed: 'genes', spread: true, registry: reg, genes, trials: false, cfg: TINY });
  const t2 = cloneSub(pop.brain, { cells: ['i1'] });
  assert.deepEqual(t2.byId.get('i1').state.genes, genesToJSON(genes));
  // a broken genes object is refused by the validator and repaired by normalize
  const bad = { v: 1, order: ['knob-tune', 'knob-tune', 'nope'], step: 9, noise: { rule: 'loose', seeds: 1 }, budget: 0 };
  assert.ok(validateOperatorGenes(bad, reg).length >= 4);
  assert.deepEqual(validateOperatorGenes(normalizeOperatorGenes(bad, reg), reg), []);
  // no noise rule is looser than one seed-to-seed standard deviation
  const c = [0.5, 0.52], k = [0.49, 0.5];
  for (const rule of ['range', 'sd', 'sd2']) assert.ok(noiseOf(rule, c, k) >= noiseOf('sd', c, k) - 1e-15, rule);
});

test('a planted improvement in one instance reaches all instances within k generations on a 3-instance population', () => {
  assert.equal(POPULATION_SIZE, 3, 'N from daemon/multiply.mjs');
  const pop = new SpreadPopulation({ suite, seed: 'plant', spread: true, registry: reg, trials: false, cfg: TINY });
  assert.deepEqual(pop.ids, ['i0', 'i1', 'i2']);
  assert.equal(pop.brain.connectome.size(), spreadConduits(pop.ids).length, 'every conduit is a Brain edge');
  assert.equal(pop.k, 1, 'a ring of 3 wired both ways: one hop, no delay');
  const m = pop.plant('i1', { config: { lmax: 40 } }, { before: 0.5, after: 0.6 });
  for (let g = 0; g < pop.k + 2; g++) pop.generation();
  const r = pop.reach().find((x) => x.id === m.id);
  assert.ok(r.reachedAll, 'every instance received it');
  assert.ok(r.ticks <= pop.k && r.withinK, 'within k: ' + r.ticks + ' <= ' + pop.k);
  assert.equal(r.received.i1, m.gen, 'the origin records it the tick it was kept');
  for (const id of pop.ids) assert.equal(pop.state(id).config.lmax, 40, id + ' holds the move');
  assert.equal(pop.brain.outbox.length, 0, 'nothing leaked out of the conduits');
  // k is read off the connectome, so a slower wire or a bigger ring moves it, and it still holds
  for (const [n, delay, kWant] of [[5, 0, 2], [3, 2, 3], [6, 1, 6]]) {
    const p = new SpreadPopulation({ suite, seed: 'plant' + n, spread: true, registry: reg, trials: false, size: n, cfg: { ...TINY, delay } });
    assert.equal(p.k, kWant, 'N ' + n + ', delay ' + delay);
    const mm = p.plant('i0', { config: { bins: 7 } });
    for (let g = 0; g < p.k + 2; g++) p.generation();
    const rr = p.reach().find((x) => x.id === mm.id);
    assert.ok(rr.reachedAll && rr.ticks <= p.k, 'N ' + n + ': reached all in ' + rr.ticks + ' <= k ' + p.k);
    assert.equal(rr.ticks, p.k, 'the farthest instance is exactly k away');
  }
  // the control: the same plant with spread OFF never leaves its instance
  const off = new SpreadPopulation({ suite, seed: 'plant', spread: false, registry: reg, trials: false, cfg: TINY });
  const mo = off.plant('i1', { config: { lmax: 40 } });
  for (let g = 0; g < 5; g++) off.generation();
  const ro = off.reach().find((x) => x.id === mo.id);
  assert.deepEqual(Object.keys(ro.received), ['i1']);
  assert.equal(off.state('i0').config.lmax, OPTIONS.lmax);
});

test('the promotion line carries the required fields', async () => {
  const pop = new SpreadPopulation({ suite, seed: 'promote', spread: true, registry: reg, cfg: TINY });
  pop.run({ generations: 24 });
  pop.drain();
  assert.ok(pop.stats.kept > 0, 'the tiny run kept something (' + pop.stats.kept + ')');
  const surv = pop.survivors(TINY.survive);
  // a survivor from the run when there is one; the planted move otherwise, so the fields are always checked
  const move = surv[0] || pop.plant('i0', { config: { lmax: 36 } });
  const conf = confirmSurvivors(suite.matrix, [{ ...move, survivedTo: move.gen + TINY.survive }], { cfg: { ...pop.cfg, maxPromote: 6 } });
  assert.equal(conf.rows.length, 1);
  const row = conf.rows[0];
  const line = promotedLine(row, { runTag: 'test' });
  for (const f of ['id', 'kind', 'subsystem', 'measured', 'bar', 'unit', 'distance', 'verdictFile', 'benchCommand', 'trial', 'files', 'since', 'better', 'why', 'author', 'simulated']) assert.ok(f in line, 'field ' + f);
  assert.equal(line.kind, PROMOTED_KIND);
  assert.equal(line.measured, row.before); assert.equal(line.bar, row.after);
  assert.equal(line.simulated.before, row.before); assert.equal(line.simulated.after, row.after);
  assert.ok(Number.isFinite(line.simulated.before) && Number.isFinite(line.simulated.after), 'a simulated before and after');
  assert.match(line.author, /^organism \((knob-tune|strategy-swap|recombine|planted)\)$/);
  assert.equal(line.better, 'higher');
  assert.ok(!Number.isNaN(Date.parse(line.since)));
  assert.deepEqual(line.files, [REL]);
  assert.ok(line.trial.argv.includes('bench/spread.mjs') && line.trial.argv.includes('--trial') && line.trial.needsModel === false);
  assert.equal(new RegExp(line.trial.metric.regex, 'm').exec('x\nmetric 0.512345\n')[1], '0.512345', 'the trial metric regex reads a "metric <n>" line');
  // the file the line names has the knobs the real loop would turn (self/knobs.mjs reads them)
  const { knobsOf } = await import('../self/knobs.mjs');
  const names = knobsOf(REL, { root: ROOT }).knobs.map((k) => k.name);
  for (const k of Object.keys(OPTIONS)) assert.ok(names.includes('OPTIONS.' + k), 'knob OPTIONS.' + k);
  // written through self/gaps.mjs writeLedger into a planted tree, the old ledger kept beside it
  const root = tmp('promote');
  mkdirSync(path.join(root, 'state', 'self'), { recursive: true });
  const old = { id: 'missed:x.json', kind: 'missed', measured: 0, bar: 1 };
  writeFileSync(path.join(root, 'state', 'self', 'gaps.jsonl'), JSON.stringify(old) + '\n');
  const w = await promote([line], { root });
  assert.equal(w.written, 1);
  assert.match(w.how, /writeLedger/);
  const ledger = readFileSync(path.join(root, 'state', 'self', 'gaps.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(ledger.map((l) => l.id), [old.id, line.id]);
  assert.deepEqual(ledger[1], JSON.parse(JSON.stringify(line)));
  assert.ok(readdirSync(path.join(root, 'state', 'self')).some((n) => /^gaps-\d{4}-\d{2}-\d{2}\.jsonl$/.test(n)), 'the previous ledger kept as gaps-<date>.jsonl');
  assert.equal(readFileSync(path.join(root, 'state', 'self', 'spread-promoted.jsonl'), 'utf8').trim(), JSON.stringify(line));
  // a second promotion of the same id replaces it, never duplicates it
  await promote([line], { root });
  assert.equal(readFileSync(path.join(root, 'state', 'self', 'gaps.jsonl'), 'utf8').trim().split('\n').length, 2);
  // with no writer, appended directly and said so
  const root2 = tmp('promote-nowriter');
  const w2 = await promote([line], { root: root2, gapsFile: path.join(root2, 'no-such-gaps.mjs') });
  assert.match(w2.how, /appended directly/);
  assert.equal(JSON.parse(readFileSync(path.join(root2, 'state', 'self', 'gaps.jsonl'), 'utf8').trim()).id, line.id);
});

test('spread OFF changes nothing a test can see', async () => {
  const G = 12;
  const off = new SpreadPopulation({ suite, seed: 'off', spread: false, registry: reg, cfg: TINY });
  off.run({ generations: G });
  assert.ok(off.stats.trials > 0 && off.stats.kept > 0, 'the OFF arm improves itself (' + off.stats.kept + ' kept of ' + off.stats.trials + ' trials)');
  assert.equal(off.brain.connectome.size(), 0, 'no conduit');
  assert.equal(off.k, null);
  assert.equal(off.stats.adopted, 0);
  assert.equal(off.brain.outbox.length, 0, 'nothing emitted');
  for (const a of off.reach()) assert.deepEqual(Object.keys(a.received), [a.origin], 'a kept move stays with its organism');
  // each organism of the OFF population is, generation for generation, the organism run alone
  for (const id of off.ids) {
    const alone = new SpreadPopulation({ suite, seed: 'off', spread: false, registry: reg, cfg: TINY, ids: [id] });
    alone.run({ generations: G });
    assert.deepEqual(alone.history.map((h) => h.configs[id]), off.history.map((h) => h.configs[id]), id + ': the same configs and genes every generation');
    assert.deepEqual(alone.state(id), off.state(id), id + ': the same final state');
    assert.equal(alone.instYears[id], off.instYears[id], id + ': the same organism-years');
  }
  // and promotion with spread off writes nothing into a planted tree
  const root = tmp('off');
  mkdirSync(path.join(root, 'state', 'self'), { recursive: true });
  writeFileSync(path.join(root, 'state', 'self', 'gaps.jsonl'), JSON.stringify({ id: 'missed:y.json', kind: 'missed' }) + '\n');
  const before = treeBytes(root);
  const surv = off.survivors(TINY.survive);
  const lines = surv.length ? confirmSurvivors(suite.matrix, surv, { cfg: { ...off.cfg, maxPromote: 6 } }).rows.map((r) => promotedLine(r, { runTag: 'off' })) : [];
  const w = await promote(lines.length ? lines : [{ id: 'would-be', kind: PROMOTED_KIND }], { root, spread: false });
  assert.equal(w.written, 0);
  assert.deepEqual(treeBytes(root), before, 'the planted tree is byte for byte what it was');
  // the ON arm on the same seed takes the same first step: spread changes only what travels
  const on = new SpreadPopulation({ suite, seed: 'off', spread: true, registry: reg, cfg: TINY });
  on.run({ generations: 1 });
  const off1 = new SpreadPopulation({ suite, seed: 'off', spread: false, registry: reg, cfg: TINY });
  off1.run({ generations: 1 });
  for (const id of on.ids) assert.deepEqual(on.history[1].configs[id].config, off1.history[1].configs[id].config, id + ' generation 0 is the same with spread on');
});

test('a move is kept only when it beats the matched control by more than the noise', () => {
  const pop = new SpreadPopulation({ suite, seed: 'keep', spread: true, registry: reg, cfg: TINY });
  pop.run({ generations: 16 });
  const kept = [...pop.archive.values()];
  assert.ok(kept.length > 0 && pop.stats.trials > kept.length, kept.length + ' kept of ' + pop.stats.trials + ' trials: some refused by the rule');
  for (const a of kept) {
    assert.ok(a.gain > a.noise, a.id + ': gain ' + a.gain + ' over noise ' + a.noise);
    assert.ok(a.noise >= 1 / suite.matrix.T - 1e-6, a.id + ': the floor of one task holds');
  }
  // the control shares the candidate's engine seeds: the same config on the same seeds is a gain of exactly 0
  const st = pop.state('i0');
  const v = pop.judge('i0', { ...st, genes: { ...st.genes, noise: { rule: 'range', seeds: 2 } } }, { config: { ...st.config }, strategy: st.strategy }, 99, 0);
  assert.equal(v.gain, 0);
  assert.equal(v.s, 0, 'no move is kept against itself');
});

test('populationIds and spreadConduits: the ring daemon/multiply.mjs names', () => {
  assert.deepEqual(populationIds(), ['i0', 'i1', 'i2']);
  assert.deepEqual(spreadConduits(['a']), []);
  assert.deepEqual(spreadConduits(['a', 'b']), [['a', 'b'], ['b', 'a']]);
  assert.equal(spreadConduits(populationIds(5)).length, 10);
});

// ---------------------------------------------------------------- board 20 builder: added cases
import { runBand, spreadChecks, sampleSd as sd20, BEFORE_BOARD20, DEV_SEEDS, SPREAD as SPREAD20 } from '../generations/spread.mjs';

test('runBand: the run-to-run band of a planted pair of runs', () => {
  const a = [0.60, 0.62, 0.64], b = [0.61, 0.62, 0.66];
  const r = runBand(a, b);
  assert.equal(r.n, 3);
  assert.ok(Math.abs(r.meanA - 0.62) < 1e-12 && Math.abs(r.meanB - 0.63) < 1e-12, 'the two means');
  assert.ok(Math.abs(r.band - 0.01) < 1e-12, 'band is the gap between the two means: ' + r.band);
  assert.ok(Math.abs(r.perSeed - 0.02) < 1e-12, 'the largest gap on one seed: ' + r.perSeed);
  assert.ok(Math.abs(r.sd - Math.max(sd20(a), sd20(b))) < 1e-15 && Math.abs(r.sd - sd20(b)) < 1e-15, 'sd is the larger seed-to-seed sd, here run b');
  // the same run twice is a band of exactly zero; a run of other seeds is refused
  assert.equal(runBand(a, [...a]).band, 0);
  assert.equal(runBand(a, [...a]).perSeed, 0);
  assert.throws(() => runBand(a, [0.6, 0.62]), /same seeds/);
  assert.throws(() => runBand([], []), /same seeds/);
});

test('spreadChecks: the bar rule of bench/spread.mjs on planted gains and bands', () => {
  const off = [0.60, 0.61, 0.62, 0.63, 0.64];
  const noiseOff = sd20(off);
  // a gain far above the band, every kept move within k, one promoted: met
  const on = off.map((x) => x + 0.05);
  const r = spreadChecks({ on, off, keptOn: 10, withinK: 10, promoted: 1 });
  assert.ok(Math.abs(r.diff - 0.05) < 1e-12 && Math.abs(r.noise - noiseOff) < 1e-12, 'diff ' + r.diff + ', noise ' + r.noise);
  assert.deepEqual(r.checks, { onBeatsOffByMoreThanNoise: true, everyKeptReachedAllWithinK: true, promotedAtLeastOne: true });
  assert.equal(r.met, true);
  // a gain inside its band is not a gain: the same shift, but the band is wider than it
  const small = off.map((x) => x + noiseOff * 0.9);
  assert.equal(spreadChecks({ on: small, off, keptOn: 10, withinK: 10, promoted: 1 }).checks.onBeatsOffByMoreThanNoise, false, 'gain 0.9 of the band');
  assert.equal(spreadChecks({ on: off.map((x) => x + noiseOff * 1.1), off, keptOn: 10, withinK: 10, promoted: 1 }).checks.onBeatsOffByMoreThanNoise, true, 'gain 1.1 of the band');
  // the band is the LARGER sd of the two arms: a noisy ON arm widens it
  const noisyOn = [0.60, 0.75, 0.62, 0.78, 0.64];
  const rn = spreadChecks({ on: noisyOn, off, keptOn: 10, withinK: 10, promoted: 1 });
  assert.ok(Math.abs(rn.noise - sd20(noisyOn)) < 1e-12 && rn.noise > noiseOff);
  assert.equal(rn.checks.onBeatsOffByMoreThanNoise, rn.diff > rn.noise);
  // each other check fails the bar on its own
  assert.equal(spreadChecks({ on, off, keptOn: 10, withinK: 9, promoted: 1 }).met, false, 'one kept move late');
  assert.equal(spreadChecks({ on, off, keptOn: 0, withinK: 0, promoted: 1 }).met, false, 'nothing kept');
  assert.equal(spreadChecks({ on, off, keptOn: 10, withinK: 10, promoted: 0 }).met, false, 'nothing promoted');
  // one seed has no band: never met
  assert.equal(spreadChecks({ on: [0.9], off: [0.1], keptOn: 1, withinK: 1, promoted: 1 }).checks.onBeatsOffByMoreThanNoise, false);
});

test('replication: a received move is applied only after the receiver\'s own trial beats its noise', () => {
  assert.deepEqual({ ...BEFORE_BOARD20 }, { replicate: false, replicateAs: 'move', confirm: 'move' }, 'the control of the board 20 change is the population as it was');
  for (const d of DEV_SEEDS) assert.ok(!d.includes(':heldout') && !/:fresh\d/.test(d) && !/:draw\d/.test(d), d + ' is neither a held-out nor a searched draw name');
  const pop = new SpreadPopulation({ suite, seed: 'rep', spread: true, registry: reg, cfg: { ...TINY, replicate: true } });
  assert.equal(pop.replicate, true);
  const m = pop.plant('i1', { config: { lmax: 40 } });
  for (let t = 0; t <= pop.k; t++) pop.brain.tick(); // the origin emits on its tick, the receivers hear it k ticks later
  for (const id of ['i0', 'i2']) {
    const st = pop.state(id);
    assert.equal(st.config.lmax, OPTIONS.lmax, id + ' has not applied the move on arrival');
    assert.deepEqual(st.pending.map((p) => p.id), [m.id], id + ' holds it for its own trial');
  }
  assert.ok(pop.reach().find((x) => x.id === m.id).reachedAll, 'the move still reaches every organism');
  const trials0 = pop.stats.trials;
  pop.generation();
  for (const id of ['i0', 'i2']) assert.equal(pop.state(id).pending.length, 0, id + ' ran its pending trial');
  const s = pop.stats;
  assert.ok(s.trials - trials0 >= 2, 'each receiver spent a trial on it');
  assert.equal(s.replicated + s.replicaRefused + s.replicaHeld, 2, 'two receivers: each applied, refused or already held it');
  for (const id of ['i0', 'i2']) {
    const lmax = pop.state(id).config.lmax;
    assert.ok(lmax === OPTIONS.lmax || lmax === 40 || s.kept > 1, id + ' either kept its own value or took the replicated one');
  }
  // a population that runs no trials cannot replicate: it applies on arrival, as before
  const bare = new SpreadPopulation({ suite, seed: 'rep', spread: true, registry: reg, trials: false, cfg: { ...TINY, replicate: true } });
  assert.equal(bare.replicate, false);
  // spread OFF never replicates and carries no pending list
  const off = new SpreadPopulation({ suite, seed: 'rep', spread: false, registry: reg, cfg: { ...TINY, replicate: true } });
  assert.equal(off.replicate, false);
  assert.equal(off.state('i0').pending, undefined);
});

test('confirm config: a survivor is confirmed as the whole config it was kept in, against the file OPTIONS', () => {
  const pop = new SpreadPopulation({ suite, seed: 'confirm', spread: true, registry: reg, trials: false, cfg: TINY });
  pop.plant('i0', { config: { lmax: 40 } });
  const m = pop.plant('i0', { config: { bins: 7 } });
  const surv = [{ ...pop.archive.get(m.id), survivedTo: m.gen + TINY.survive }];
  const byMove = confirmSurvivors(suite.matrix, surv, { cfg: { ...pop.cfg, confirm: 'move' } }).rows[0];
  const byConfig = confirmSurvivors(suite.matrix, surv, { cfg: { ...pop.cfg, confirm: 'config' } }).rows[0];
  assert.deepEqual(byMove.knobs, ['bins'], 'move: only the knob the move turned');
  assert.equal(byMove.config.lmax, OPTIONS.lmax);
  assert.deepEqual(byConfig.knobs, ['bins', 'lmax'], 'config: every knob the kept config holds away from OPTIONS');
  assert.equal(byConfig.config.lmax, 40);
  assert.equal(byConfig.config.bins, 7);
  assert.deepEqual(byConfig.beforeXs, byMove.beforeXs, 'the same base: the file OPTIONS on the same promotion seeds');
  const line = promotedLine(byConfig, { runTag: 'confirm' });
  assert.deepEqual(Object.keys(line.simulated.knobs), ['bins', 'lmax']);
  assert.equal(line.simulated.confirm, 'config');
  assert.equal(line.id, 'promoted:spread:bins+lmax:confirm');
  assert.equal(SPREAD20.confirm === 'move' || SPREAD20.confirm === 'config', true);
});
