// test/reproduce.test.mjs: an organism makes children, the children are real saved
// organisms, and getting better is a claim that has to survive a control.
//   (a) N children are written as their own state directories and load back as brains, and
//       the control: they are not N copies of one thing, and a child rebuilt from the genome
//       in its own meta.json is the brain that was saved
//   (b) the best child does not score below the parent on the suites the parent hosted, or
//       no proposal was made and the refusal names the suites. The control: a fabricated
//       regression, and a fabricated lost suite, are both caught by the same policy
//   (c) without --approve the parent's genome, size and lineage are exactly what they were,
//       and the proposal is pending. The control is the same measurement after --approve,
//       which does move: a test that only asserted "unchanged" would also pass on a
//       reproduce that did nothing at all
//   (d) with --approve the lineage is a ledger event on the parent, and the control is the
//       run without it, which writes zero of them
//   (e) the same seed rebuilds the same children: the deterministic components exactly, the
//       scalar to a band because it carries a wall clock throughput term. A different seed
//       gives different children, which is the control on (e)
//   (f) the soak is refused by name before anything is read
//   (g) a parent with no recorded genome is fitted, and the policy refuses on that alone
//   (h) no em dashes in the files this work added
//   (i) the same genome on the same K build seeds gives the same K readings, and the control
//       is the same genome on a DIFFERENT seed set, which moves them
//   (j) a placebo child (rate 0, gene identical to its parent, which the test checks) is
//       refused, and the refusal names the parent's own seed spread
//   (k) a child constructed to host a suite its parent cannot host clears the bar, which is
//       the control on (j): a bar nothing can clear would pass (j) for the wrong reason
//   (l) the evidence carries the K readings of the parent and of the child, and when a
//       proposal is opened the gate holds that same evidence
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// The state root is redirected before anything imports cli/state.mjs for real work:
// stateRoot() reads the environment on every call, so this is enough to keep every byte
// this file writes inside a temp directory and state/soak untouched.
const TMP = mkdtempSync(path.join(os.tmpdir(), 'brain-reproduce-'));
process.env.BRAIN_STATE_DIR = TMP;

const {
  defaultOrganismGenome, organismGenomeFromJSON, buildFromOrganismGenome, clearSuiteCache,
  cloneOrganismGenome, suiteKinds, regionNames, rosterOf,
} = await import('../generations/organism-genome.mjs');
const {
  reproduce, saveOrganismState, parentGenomeOf, judgeReproduction, compareSuites, childStateName,
  SELF_REPRODUCE, PROTECTED_NAMES, DEFAULT_SEEDS, buildSeedsFor, evaluateOnSeeds, parentBarReadings,
  pairChild, meanReading, spreadOf, pairsNeededFor, falsePositiveRateOfBar,
} = await import('../generations/reproduce.mjs');
const { loadBrain, readMeta, readLedgerFile, layout } = await import('../cli/state.mjs');
const { knownKind, registeredKinds } = await import('../core/gate.mjs');

// A parent big enough that a smaller child can win on cost, and small enough that a whole
// generation costs about a second. Every test that mutates a parent gets its own name.
// `genomeId` and `genomeSeed` are separate from the state name on purpose: (e) needs two
// state directories holding the SAME organism, which is the only way to ask whether the same
// seed breeds the same children without saving one parent twice. See the open problem in
// notes/generations.md: a second save of any brain carrying a world.venue cell throws in
// world/venue.mjs, which is not this session's file, so no parent here is reproduced twice.
function makeParent(name, { majors = 40, genomeId = name + '-g0', genomeSeed = name } = {}) {
  const g = defaultOrganismGenome({ id: genomeId, seed: genomeSeed, majors, subcellsPerMajor: 4 });
  return saveOrganismState(name, g, { kind: 'organism.root', generation: 0 });
}
// SEEDS is the paired design's K. Three is the floor the bar allows and it is what the tests
// that are not about the pairing use, because every extra seed is another whole evaluation of
// every organism in the run. The tests that grade the bar itself use the shipped default.
const TICKS = 48, KIDS = 3, SEEDS = 3;

after(() => { try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS will */ } });

test('the kind is registered on core gate at import', () => {
  assert.equal(knownKind(SELF_REPRODUCE), true);
  assert.ok(registeredKinds().includes(SELF_REPRODUCE), 'self.reproduce must travel through core gate, not a gate of its own');
});

test('(a) every child is saved as its own state directory and loads back as a brain', async () => {
  makeParent('a-parent');
  const r = await reproduce({ name: 'a-parent', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'a' });
  assert.equal(r.rows.length, KIDS);
  const sizes = new Set();
  for (const row of r.rows) {
    assert.equal(row.name, childStateName('a-parent', row.k));
    assert.ok(existsSync(row.snapshot), 'no snapshot at ' + row.snapshot);
    assert.ok(row.bytes > 0, 'child ' + row.name + ' wrote an empty snapshot');
    const brain = await loadBrain(row.name, { ledger: 'off' });
    assert.equal(brain.cells.length, row.savedCells, row.name + ' loaded a different cell count than it saved');
    assert.equal(brain.connectome.size(), row.savedEdges);
    sizes.add(row.savedCells + ':' + row.savedEdges);
    // the genome travels with the child, which is what lets a child reproduce in its turn
    const meta = readMeta(row.name);
    assert.equal(meta.parent, 'a-parent');
    assert.equal(meta.generation, 1);
    const g = organismGenomeFromJSON(meta.organismGenome);
    assert.equal(g.id, row.id);
    // CONTROL on "loadable": a rebuild from the recorded genome is the brain that was
    // saved, so the snapshot is that genome's organism and not some other organism's.
    const rebuilt = buildFromOrganismGenome(g, { name: row.name, seed: g.id, ledger: 'off' });
    assert.equal(rebuilt.brain.cells.length, row.savedCells, row.name + ' does not rebuild from its own genome');
    assert.equal(rebuilt.brain.connectome.size(), row.savedEdges);
  }
  // CONTROL on "N children": N copies of one genome would satisfy every assertion above.
  assert.ok(sizes.size > 1, 'all ' + KIDS + ' children came out the same size: they are copies, not children');
  assert.equal(new Set(r.rows.map((x) => x.id)).size, KIDS, 'two children share an id');
});

test('(b) the best child does not regress, or the proposal is not made and says why', async () => {
  makeParent('b-parent');
  const r = await reproduce({ name: 'b-parent', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'b' });
  assert.ok(r.parent.suites.length > 0, 'the parent hosted no suite, so nothing was compared');
  if (r.proposed) {
    assert.equal(r.best.regressions.length, 0, 'a proposal was made for a child that regressed: ' + JSON.stringify(r.best.regressions));
    assert.ok(r.best.fitness > r.parent.fitness, 'a proposal was made for a child that did not beat the parent bar');
    assert.equal(r.proposal.kind, SELF_REPRODUCE);
    assert.equal(r.proposal.status, 'pending');
  } else {
    assert.ok(r.refusal && r.refusal.length > 0, 'no proposal and no reason given');
    assert.ok(r.reasons.length > 0);
  }
});

test('(b control) a regression and a lost suite are both refused by the policy', () => {
  // A child that cleared every paired term: three pairs, all three won, a gain of 0.2 over a
  // parent that disagreed with itself by 0.01.
  const paired = {
    seedCount: 3, pairsNeeded: 2, pairsWon: 3, parentSpread: 0.01, pairedMeanGain: 0.2,
    pairs: [{ seed: 's0', parent: 0.4, child: 0.6, gain: 0.2 }, { seed: 's1', parent: 0.4, child: 0.6, gain: 0.2 }, { seed: 's2', parent: 0.4, child: 0.6, gain: 0.2 }],
  };
  const base = { parent: 'p', child: 'c', childState: 'p-child-1', genomeSource: 'meta', onFront: true, parentFitness: 0.4, childFitness: 0.6, ...paired };
  // the same evidence with nothing wrong holds for a human
  assert.equal(judgeReproduction({ ...base, suites: ['algebra'], regressions: [] }).verdict, 'hold');

  // THE PAIRED TERMS, one at a time, each against that same passing evidence.
  // a gain under the parent's own seed spread is not a gain
  const under = judgeReproduction({ ...base, suites: ['algebra'], regressions: [], parentSpread: 0.3 });
  assert.equal(under.verdict, 'reject');
  assert.match(under.reasons.join(' '), /seed spread/);
  // two of three pairs is a majority, one is not, and the refusal still names the spread
  assert.equal(judgeReproduction({ ...base, suites: ['algebra'], regressions: [], pairsWon: 2 }).verdict, 'hold');
  const minority = judgeReproduction({ ...base, suites: ['algebra'], regressions: [], pairsWon: 1 });
  assert.equal(minority.verdict, 'reject');
  assert.match(minority.reasons.join(' '), /majority/);
  assert.match(minority.reasons.join(' '), /seed spread/);
  // one reading is the draw the old bar paid out on: fewer than three pairs is not a comparison
  const single = judgeReproduction({ ...base, suites: ['algebra'], regressions: [], seedCount: 1, pairsWon: 1, pairsNeeded: 1, pairs: [paired.pairs[0]] });
  assert.equal(single.verdict, 'reject');
  assert.match(single.reasons.join(' '), /at least 3/);
  // and the arithmetic of the majority itself
  assert.equal(pairsNeededFor(3), 2);
  assert.equal(pairsNeededFor(5), 3);
  assert.equal(pairsNeededFor(7), 4);
  assert.ok(falsePositiveRateOfBar(5) < 0.5, 'a majority of five pairs must be harder than a coin: ' + falsePositiveRateOfBar(5));
  assert.ok(falsePositiveRateOfBar(7) < falsePositiveRateOfBar(5), 'more pairs must not be easier');
  // one suite scored lower
  const lower = judgeReproduction({ ...base, suites: ['algebra'], regressions: [{ suite: 'algebra', parent: 1, child: 0.8 }] });
  assert.equal(lower.verdict, 'reject');
  assert.match(lower.reasons.join(' '), /algebra/);
  // a higher scalar does not buy a regression: this is the case the scalar alone would pass
  assert.equal(judgeReproduction({ ...base, childFitness: 0.99, suites: ['algebra'], regressions: [{ suite: 'algebra', parent: 1, child: 0 }] }).verdict, 'reject');
  // a child that beat nothing
  assert.equal(judgeReproduction({ ...base, childFitness: 0.4, suites: ['algebra'], regressions: [] }).verdict, 'reject');
  // a parent nobody measured
  assert.equal(judgeReproduction({ ...base, genomeSource: 'fitted', suites: ['algebra'], regressions: [] }).verdict, 'reject');
  // a child evaluated on no suite at all
  assert.equal(judgeReproduction({ ...base, suites: [], regressions: [] }).verdict, 'reject');

  // compareSuites is what feeds the policy: a suite the parent hosted and the child cannot
  // host is a regression with a null child score, not a silent pass.
  const parentEval = { raw: { perSuite: { algebra: 1, sequence: 0.9 }, taskEligible: ['algebra', 'sequence'] } };
  const lost = compareSuites(parentEval, { raw: { perSuite: { algebra: 1, sequence: null }, taskEligible: ['algebra'] } });
  assert.equal(lost.regressions.length, 1);
  assert.equal(lost.regressions[0].suite, 'sequence');
  assert.equal(lost.regressions[0].child, null);
  const same = compareSuites(parentEval, { raw: { perSuite: { algebra: 1, sequence: 0.9 }, taskEligible: ['algebra', 'sequence'] } });
  assert.equal(same.regressions.length, 0);
  const better = compareSuites(parentEval, { raw: { perSuite: { algebra: 1, sequence: 1 }, taskEligible: ['algebra', 'sequence'] } });
  assert.equal(better.gains.length, 1);
});

test('(c) without approve the parent does not move, and with approve it does', async () => {
  // Two state directories holding the SAME organism: one run is held, the other approved,
  // and the two fingerprints are the arm and its control.
  makeParent('c-held', { genomeId: 'c-g0', genomeSeed: 'c' });
  makeParent('c-ok', { genomeId: 'c-g0', genomeSeed: 'c' });
  const beforeHeld = fingerprint('c-held'), beforeOk = fingerprint('c-ok');
  assert.equal(beforeHeld.genome, beforeOk.genome, 'the two arms did not start from the same organism');

  const held = await reproduce({ name: 'c-held', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'c' });
  const afterHeld = fingerprint('c-held');
  assert.equal(held.approved, false);
  assert.equal(afterHeld.genome, beforeHeld.genome, 'the parent genome changed while the proposal was only pending');
  assert.equal(afterHeld.generation, beforeHeld.generation, 'the parent generation moved without a human');
  assert.equal(afterHeld.lineage, beforeHeld.lineage, 'the parent recorded a lineage without a human');
  assert.equal(afterHeld.cells, beforeHeld.cells);
  assert.equal(afterHeld.edges, beforeHeld.edges);
  if (!held.proposed) return;

  // what DID change is the pending proposal, which is the point: it survives to the CLI
  const brain = await loadBrain('c-held', { ledger: 'off' });
  const pending = brain.gate.listPending();
  assert.equal(pending.length, 1, 'the held proposal did not survive into the parent snapshot');
  assert.equal(pending[0].kind, SELF_REPRODUCE);
  assert.equal(pending[0].status, 'pending');

  // CONTROL: the same three fields on the same organism after a run a human approved. An
  // "unchanged" reading means nothing until something is shown to be able to change it.
  const ok = await reproduce({ name: 'c-ok', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'c', approve: true });
  assert.equal(ok.proposed, true, 'the two arms started from the same organism, so the control must have proposed too');
  const afterOk = fingerprint('c-ok');
  assert.equal(ok.approved, true);
  assert.notEqual(afterOk.lineage, beforeOk.lineage, 'approving changed nothing, so the unchanged reading above measures nothing');
  assert.ok(afterOk.generation > beforeOk.generation);
  // the genome under the parent's name is still the parent's: approval records descent, it
  // does not silently swap the organism out from under the name
  assert.equal(afterOk.genome, beforeOk.genome);
});

test('(d) approving writes the lineage to the ledger, and not approving writes none', async () => {
  makeParent('d-held', { genomeId: 'd-g0', genomeSeed: 'd' });
  makeParent('d-ok', { genomeId: 'd-g0', genomeSeed: 'd' });
  const held = await reproduce({ name: 'd-held', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'd' });
  const none = readLedgerFile('d-held').filter((e) => e && e.type === 'self.reproduce.lineage');
  assert.equal(none.length, 0, 'a lineage event was written without a human decision');
  assert.ok(readLedgerFile('d-held').some((e) => e && e.type === 'proposal' && e.kind === SELF_REPRODUCE) || !held.proposed,
    'the proposal itself was not a ledger event');

  const ok = await reproduce({ name: 'd-ok', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'd', approve: true });
  if (!ok.proposed) {
    // the disjunction the contract allows: nothing was proposed, so nothing may be recorded
    assert.equal(readLedgerFile('d-ok').filter((e) => e && e.type === 'self.reproduce.lineage').length, 0);
    return;
  }
  const events = readLedgerFile('d-ok').filter((e) => e && e.type === 'self.reproduce.lineage');
  assert.equal(events.length, 1, 'expected exactly one lineage event, got ' + events.length);
  const e = events[0];
  assert.equal(e.parent, 'd-ok');
  assert.equal(e.child, ok.lineage.child);
  assert.equal(e.childState, ok.lineage.childState);
  assert.equal(e.fitness, ok.lineage.fitness);
  assert.equal(e.generation, ok.lineage.generation);
  assert.equal(e.proposal, ok.proposal.id);
  // the decision is a ledger event of core's, not a note this module wrote about itself
  const decisions = readLedgerFile('d-ok').filter((x) => x && x.type === 'decision' && x.kind === SELF_REPRODUCE);
  assert.equal(decisions.length, 1);
  assert.equal(decisions[0].status, 'approved');
  assert.match(String(decisions[0].by), /human/);
  // and the same record is in the parent's meta
  const meta = readMeta('d-ok');
  assert.equal(meta.lineage.length, 1);
  assert.equal(meta.lineage[0].child, ok.lineage.child);
  assert.equal(meta.generation, ok.lineage.generation);
});

test('(e) the same seed makes the same children, a different seed does not', async () => {
  // three directories, ONE organism: the same genome id and the same genome seed. The
  // reproduce seed is keyed to the genome, not to the directory, so these are three runs of
  // the same experiment and the only thing that differs is the seed argument.
  makeParent('e-one', { genomeId: 'e-g0', genomeSeed: 'e' });
  makeParent('e-two', { genomeId: 'e-g0', genomeSeed: 'e' });
  makeParent('e-three', { genomeId: 'e-g0', genomeSeed: 'e' });
  clearSuiteCache();
  const a = await reproduce({ name: 'e-one', children: 2, ticks: TICKS, seeds: SEEDS, seed: 'same' });
  const b = await reproduce({ name: 'e-two', children: 2, ticks: TICKS, seeds: SEEDS, seed: 'same' });
  assert.deepEqual(a.rows.map((r) => r.savedCells), b.rows.map((r) => r.savedCells), 'the same seed grew different organisms');
  assert.deepEqual(a.rows.map((r) => r.savedEdges), b.rows.map((r) => r.savedEdges));
  for (let i = 0; i < a.rows.length; i++) {
    // prediction, task and cost are pure functions of the genome; throughput is a wall
    // clock measurement, so the scalar is graded to a band and never to the last digit
    for (const k of ['prediction', 'task', 'cost']) {
      assert.equal(a.rows[i].components[k], b.rows[i].components[k], 'component ' + k + ' is not reproducible');
    }
    assert.ok(Math.abs(a.rows[i].fitness - b.rows[i].fitness) < 0.05, 'fitness moved by more than the throughput band: ' + a.rows[i].fitness + ' vs ' + b.rows[i].fitness);
  }
  // CONTROL: a constant would pass everything above. A different seed must move the children.
  const c = await reproduce({ name: 'e-three', children: 2, ticks: TICKS, seeds: SEEDS, seed: 'different' });
  const moved = c.rows.some((row, i) => row.savedCells !== a.rows[i].savedCells || row.savedEdges !== a.rows[i].savedEdges);
  assert.ok(moved, 'a different seed produced the same children, so the seed is not reaching the mutation');
});

test('(f) the soak is protected by name', async () => {
  assert.ok(PROTECTED_NAMES.includes('soak'));
  await assert.rejects(() => reproduce({ name: 'soak', children: 1, ticks: 8 }), /protected/);
  assert.throws(() => saveOrganismState('soak', defaultOrganismGenome({ majors: 14 })), /protected/);
  // and the refusal happened before anything was read or written under that name
  assert.equal(existsSync(path.join(TMP, 'soak')), false);
  assert.notEqual(layout('a-parent').dir, layout('soak').dir);
});

test('(g) a parent with no recorded genome is fitted, and that fact stops the proposal', async () => {
  // `brain init` writes no genome. parentGenomeOf then stands a default genome of about the
  // right size in its place, which is a DIFFERENT organism, so no child of it may be called
  // better than the parent: the policy refuses on genomeSource alone.
  const p = makeParent('g-parent');
  const metaFile = path.join(p.dir, 'meta.json');
  const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  delete meta.organismGenome;
  writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n');
  const got = parentGenomeOf('g-parent');
  assert.equal(got.source, 'fitted');
  const r = await reproduce({ name: 'g-parent', children: 2, ticks: TICKS, seeds: SEEDS, seed: 'g' });
  assert.equal(r.genomeSource, 'fitted');
  assert.equal(r.proposed, false, 'a child of an unmeasured parent was proposed');
  assert.match(r.refusal, /no recorded genome/);
  // the children are still saved: the refusal is about the comparison, not about the birth
  assert.equal(r.rows.length, 2);
  for (const row of r.rows) assert.ok(existsSync(row.snapshot));
});

test('(i) the same genome on the same K build seeds gives the same K readings', () => {
  const g = defaultOrganismGenome({ id: 'i-child', seed: 'i', majors: 40, subcellsPerMajor: 4 });
  const seeds = buildSeedsFor('i:pair', SEEDS);
  assert.equal(seeds.length, SEEDS);
  const a = evaluateOnSeeds(g, seeds, { ticks: TICKS, windows: 4 });
  const b = evaluateOnSeeds(g, seeds, { ticks: TICKS, windows: 4 });
  for (let i = 0; i < seeds.length; i++) {
    assert.equal(a[i].buildSeed, seeds[i]);
    assert.equal(a[i].id, 'i-child', 'the reading must carry the genome id, not the build seed it was read under');
    // prediction, task and cost are pure functions of the genes and the build seed, so they
    // are graded to the last digit; throughput is a wall clock term and is not.
    for (const k of ['prediction', 'task', 'cost', 'novelty']) {
      assert.equal(a[i].components[k], b[i].components[k], 'component ' + k + ' moved between two readings of one genome on ' + seeds[i]);
    }
    assert.equal(a[i].cells, b[i].cells);
    assert.equal(a[i].edges, b[i].edges);
    assert.ok(Math.abs(a[i].fitness - b[i].fitness) < 0.05, 'fitness moved by more than the throughput band on ' + seeds[i] + ': ' + a[i].fitness + ' vs ' + b[i].fitness);
  }
  // CONTROL: a constant would pass every line above. A DIFFERENT seed set has to move the
  // readings, because the build seed is what the pairing holds fixed.
  const c = evaluateOnSeeds(g, buildSeedsFor('i:other', SEEDS), { ticks: TICKS, windows: 4 });
  const moved = c.some((r, i) => r.components.prediction !== a[i].components.prediction || r.edges !== a[i].edges);
  assert.ok(moved, 'a different build seed produced the same organism, so seed s of a pair is not a seed at all');
});

test('(j) a placebo child is refused, and the refusal names the parent own seed spread', async () => {
  makeParent('j-parent');
  const r = await reproduce({ name: 'j-parent', children: 2, ticks: TICKS, seeds: DEFAULT_SEEDS, seed: 'j', rate: 0 });
  assert.equal(r.seeds, DEFAULT_SEEDS);
  // the placebo has to BE a placebo: every gene of the parent, and only the id apart
  const parentGenes = JSON.stringify({ ...readMeta('j-parent').organismGenome, id: null, meta: null });
  for (const row of r.rows) {
    const childGenes = JSON.stringify({ ...readMeta(row.name).organismGenome, id: null, meta: null });
    assert.equal(childGenes, parentGenes, row.name + ' is not gene identical to its parent, so it is not a placebo');
  }
  assert.equal(r.proposed, false, 'a gene identical child was promoted: paired mean gains '
    + JSON.stringify(r.rows.map((x) => x.pairedMeanGain)) + ', pairs won ' + JSON.stringify(r.rows.map((x) => x.pairsWon))
    + ', parent seed spread ' + r.parentSpread);
  assert.match(r.refusal, /seed spread/);
  // and the placebo gain is the machine jitter, not a gene: it sits under the parent own
  // paired spread, which is the parent read twice on each of the same build seeds
  assert.ok(Math.abs(r.best.pairedMeanGain) <= Math.max(r.parentSpread, 0.01),
    'a gene identical child gained ' + r.best.pairedMeanGain + ' against a parent paired spread of ' + r.parentSpread);
});

test('(k) a child whose genes host a suite its parent cannot host clears the bar', () => {
  // CONSTRUCTED, not drawn: the child is the default genome and the parent is that genome
  // with one suite's kinds weighted to zero in every region, so the parent cannot host that
  // suite and the child can. This is the control on (j): if the bar refused this too, (j)
  // would be passing because nothing can ever clear the bar.
  const child = defaultOrganismGenome({ id: 'k-child', seed: 'k', majors: 40, subcellsPerMajor: 4 });
  const parent = cloneOrganismGenome(child);
  parent.id = 'k-parent';
  const need = suiteKinds().get('algebra');
  for (const region of regionNames()) for (const kind of rosterOf(region)) if (need.has(kind)) parent.regions[region].kindMix[kind] = 0;

  const seeds = buildSeedsFor('k:pair', DEFAULT_SEEDS);
  const pre = evaluateOnSeeds(parent, seeds, { ticks: TICKS, windows: 4 });
  const kid = evaluateOnSeeds(child, seeds, { ticks: TICKS, windows: 4 });
  const post = evaluateOnSeeds(parent, seeds, { ticks: TICKS, windows: 4 });
  // the construction is what this test says it is
  assert.ok(!pre[0].raw.taskEligible.includes('algebra'), 'the parent still hosts algebra, so nothing was made better');
  assert.ok(kid[0].raw.taskEligible.includes('algebra'), 'the child does not host algebra, so nothing was made better');

  const bar = parentBarReadings(pre, post);
  const paired = pairChild(bar, kid);
  // the floor the module uses: the parent read twice on each seed, not its range ACROSS seeds
  const parentSpread = spreadOf(pre.map((p, i) => Number((post[i].fitness - p.fitness).toFixed(6))));
  const cmp = compareSuites(meanReading(parent.id, pre), meanReading(child.id, kid));
  assert.ok(cmp.suites.length > 0, 'the parent hosted no suite at all, so there was nothing to defend');
  assert.equal(cmp.regressions.length, 0, 'the constructed child lost a suite: ' + JSON.stringify(cmp.regressions));
  const decision = judgeReproduction({
    parent: 'k-parent', child: 'k-child', childState: 'k-parent-child-1', genomeSource: 'meta', onFront: true,
    parentFitness: paired.parentMeanFitness, childFitness: paired.childMeanFitness,
    suites: cmp.suites, regressions: cmp.regressions, parentSpread, ...paired,
  });
  assert.equal(decision.verdict, 'hold', 'the constructed child was refused: ' + decision.reasons.join('; '));
  // a majority, not all of them: one build seed in this set reads the parent far above its
  // other four, which is the seed lottery the pairing exists to survive rather than to deny
  assert.ok(paired.pairsWon >= paired.pairsNeeded, 'a strictly better child won ' + paired.pairsWon + ' of ' + DEFAULT_SEEDS
    + ' pairs, short of ' + paired.pairsNeeded + ': ' + JSON.stringify(paired.pairs));
  assert.ok(paired.pairedMeanGain > parentSpread, 'gain ' + paired.pairedMeanGain + ' against paired spread ' + parentSpread
    + ', where the range across the seeds reads ' + spreadOf(bar));
});

test('(l) the evidence carries the K readings of both sides, and the gate holds that evidence', async () => {
  makeParent('l-parent');
  const r = await reproduce({ name: 'l-parent', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'l' });
  const ev = r.evidence;
  assert.equal(ev.seedCount, SEEDS);
  assert.deepEqual(ev.readings.seeds, r.buildSeeds);
  for (const side of ['parent', 'parentPre', 'parentPost', 'child']) {
    assert.equal(ev.readings[side].length, SEEDS, 'the evidence carries ' + ev.readings[side].length + ' readings for ' + side + ' and not ' + SEEDS);
    for (const v of ev.readings[side]) assert.equal(typeof v, 'number');
  }
  assert.equal(ev.pairs.length, SEEDS);
  // the pairs are the readings, not a second set of numbers: pair s is child s minus parent s
  for (let i = 0; i < SEEDS; i++) {
    assert.equal(ev.pairs[i].child, ev.readings.child[i]);
    assert.equal(ev.pairs[i].parent, ev.readings.parent[i]);
    assert.equal(ev.pairs[i].parent, Math.max(ev.readings.parentPre[i], ev.readings.parentPost[i]));
    assert.equal(ev.pairs[i].gain, Number((ev.readings.child[i] - ev.readings.parent[i]).toFixed(6)));
  }
  // the two floors are both carried, and each is the spread of what its name says: the
  // paired one is post minus pre seed by seed, the seed range is the bar readings themselves
  assert.equal(ev.parentSpread, spreadOf(ev.readings.parentPre.map((v, i) => Number((ev.readings.parentPost[i] - v).toFixed(6)))));
  assert.equal(ev.parentSeedRange, spreadOf(ev.readings.parent));
  if (!r.proposed) return; // the disjunction the bar allows: no child cleared it this run
  const brain = await loadBrain('l-parent', { ledger: 'off' });
  const pending = brain.gate.listPending();
  assert.equal(pending.length, 1);
  assert.equal(pending[0].evidence.seedCount, SEEDS);
  assert.deepEqual(pending[0].evidence.readings, ev.readings, 'the gate holds different readings than the run computed');
});

test('(m) the old ruler is measured on the same children, from own id readings, and applied to nothing', async () => {
  makeParent('m-parent');
  const r = await reproduce({ name: 'm-parent', children: KIDS, ticks: TICKS, seeds: SEEDS, seed: 'm', rate: 2 });
  // the old ruler's numbers are readings, not copies of the paired ones
  assert.equal(typeof r.oldBar.parentPre, 'number');
  assert.equal(typeof r.oldBar.parentPost, 'number');
  assert.equal(r.oldBar.parent, Number(Math.max(r.oldBar.parentPre, r.oldBar.parentPost).toFixed(6)));
  assert.equal(typeof r.oldBar.childFitness, 'number');
  for (const row of r.rows) assert.equal(typeof row.ownFitness, 'number', row.name + ' carries no own id reading');
  assert.ok(r.rows.some((row) => row.id === r.oldBar.child && row.ownFitness === r.oldBar.childFitness), 'the old ruler judged a child that is not in the rows');
  // its verdict is the rule restated from its own numbers
  const rule = r.rows.find((row) => row.id === r.oldBar.child).onOldFront && r.oldBar.regressions === 0 && r.oldBar.childFitness > r.oldBar.parent;
  assert.equal(r.wouldPromoteAtOldBar, rule);
  assert.equal(r.oldBar.wouldPromote, rule);
  // and it decided nothing: the proposal follows the paired bar alone
  const paired = r.evidence.pairedMeanGain > r.parentSpread && r.evidence.pairsWon >= r.evidence.pairsNeeded
    && r.evidence.regressions.length === 0 && r.evidence.onFront && r.evidence.childFitness > r.evidence.parentFitness;
  assert.equal(r.proposed, paired, 'the proposal did not follow the paired bar: ' + JSON.stringify(r.reasons));
  assert.equal(JSON.stringify(r.evidence).includes('oldBar'), false, 'the old ruler leaked into the proposal evidence');
});

test('(h) no em dashes in the files this work added', () => {
  const dash = String.fromCharCode(0x2014);
  for (const f of ['generations/reproduce.mjs', 'test/reproduce.test.mjs', 'bench/reproduce.mjs']) {
    const p = path.join(ROOT, f);
    if (!existsSync(p)) continue;
    assert.ok(!readFileSync(p, 'utf8').includes(dash), f + ' carries an em dash');
  }
});

// The three things about a parent that reproduction is not allowed to move on its own.
function fingerprint(name) {
  const meta = readMeta(name) || {};
  return {
    genome: JSON.stringify(meta.organismGenome ?? null),
    generation: meta.generation ?? 0,
    lineage: JSON.stringify(meta.lineage ?? null),
    cells: meta.cells ?? null,
    edges: meta.edges ?? null,
  };
}
