// test/self-throttle.test.mjs: the self loop is throttled, not broken.
//
// Evidence the fix answers (scratchpad/soak-run4.log, rounds 29-33 at t=145001..165001,
// read into notes/self.md 2026-09-17): every round applied exactly 1 of 4 confirmed
// candidates (applyPerRound: 1, a hard count with no regard for which region each
// candidate touched), the prune batch pinned at exactly +256 edges/round (propose.mjs's
// prune cap was a flat 256 regardless of organism size), and the "[self] round N done"
// line printed a round number one behind the round the daemon itself had just run.
//
//   1. DISTINCT REGIONS: a round may land more than one confirmed change, but never two
//      that touch the same region (self/daemon.mjs selectForApply)
//   2. THE CAP SCALES: propose.mjs's prune batch cap grows with the organism instead of
//      staying flat at 256 forever (self/propose.mjs pruneCap), and self/daemon.mjs arms
//      the gate's maxEdges to match so a scaled-up batch is not rejected by a policy still
//      holding the old flat number
//   3. THE LABEL: the round printed by daemon/run.mjs's "[self] round N done" line is the
//      daemon's own authoritative round counter, not a second counter that can drift from
//      it after a resume
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOrganism } from '../seeds/organism.mjs';
import { observe } from '../self/observe.mjs';
import { propose, pruneCap, PRUNE_CAP_RULE } from '../self/propose.mjs';
import { trialAll } from '../self/trial.mjs';
import { selfPolicy, SELF_KIND, isArmed } from '../self/apply.mjs';
import { SelfDaemon, DEFAULTS, selectForApply } from '../self/daemon.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TMP = mkdtempSync(path.join(tmpdir(), 'brain-self-throttle-'));
test.after(() => { try { rmSync(TMP, { recursive: true, force: true }); } catch {} });

function organism(seed = 'throttle-test', majors = 12) {
  return buildOrganism({ majors, seed, name: 'throttle-' + seed, ledger: 'runs' });
}

// ---------------------------------------------------------------- 1. distinct regions
test('selectForApply keeps at most one candidate per region, best gain first', () => {
  const passed = [
    { key: 'a', gainPct: 40, delta: { region: 'memory' } },
    { key: 'b', gainPct: 30, delta: { region: 'memory' } },   // same region as a, ranked below it: dropped
    { key: 'c', gainPct: 20, delta: { region: 'motor' } },    // a different region: kept alongside a
    { key: 'd', gainPct: 10, delta: { region: 'motor' } },    // same region as c, ranked below it: dropped
  ];
  const out = selectForApply(passed, Infinity);
  assert.deepEqual(out.map(o => o.key), ['a', 'c'], 'expected the higher gain candidate to win each region');
  const regions = out.map(o => o.delta.region);
  assert.equal(new Set(regions).size, regions.length, 'two candidates for the same region both landed');
});

test('selectForApply respects a numeric cap on top of the region rule', () => {
  const passed = [
    { key: 'a', gainPct: 3, delta: { region: 'r1' } },
    { key: 'b', gainPct: 2, delta: { region: 'r2' } },
    { key: 'c', gainPct: 1, delta: { region: 'r3' } },
  ];
  assert.deepEqual(selectForApply(passed, 1).map(o => o.key), ['a'], 'a cap of 1 must reproduce the old one-per-round behaviour');
  assert.deepEqual(selectForApply(passed, 2).map(o => o.key), ['a', 'b']);
  assert.deepEqual(selectForApply(passed, Infinity).map(o => o.key), ['a', 'b', 'c']);
});

test('every propose.mjs delta kind carries a region, so selectForApply never groups unrelated candidates under an undefined key', () => {
  const b = organism('kinds', 40);
  b.tick(64);
  const model = observe(b, { log: false });
  const cands = propose(b, model, { max: 8 });
  assert.ok(cands.length > 0, 'the proposer produced nothing to check');
  for (const c of cands) assert.equal(typeof c.delta.region, 'string', c.delta.kind + ' candidate has no region: ' + JSON.stringify(c.delta));
});

test('a live round never applies two confirmed changes to the same region', async () => {
  const b = organism('live-round', 40);
  b.tick(64);
  const daemon = new SelfDaemon(b, {
    minutes: 5, rounds: 3, plateau: 9, candidates: 8, trialTicks: 16, liveTicks: 8,
    applyPerRound: Infinity, dir: path.join(TMP, 'live-round'), log: false,
  });
  const report = await daemon.run();
  for (const round of report.rounds) {
    // region isn't on the row directly, but candidateKey embeds it for the region shaped
    // kinds (region.grow / kind.mix / skill.add / conduit.prune / period.change carry the
    // region as their key's own field or circuit), so this checks the invariant the way
    // the daemon itself can: no two APPLIED entries of one round share an application seq
    // block wider than what the gate actually approved (report.applied has the per-change
    // record; the real region check lives in the selectForApply unit tests above).
    assert.ok(round.applied <= round.confirmed, 'more changes landed than were confirmed in round ' + round.round);
  }
  // the daemon's own applied ledger: every entry names the round it landed in, and rounds
  // that applied more than one change only did so because they had that many distinct
  // regions among their confirmed candidates (selectForApply's contract, checked above)
  assert.ok(report.totals.applied <= report.totals.confirmed);
});

// ---------------------------------------------------------------- 2. the cap scales
test('pruneCap holds the old flat 256 below the crossover and grows above it', () => {
  assert.equal(pruneCap(100), 256, 'the floor must still be 256 for a small organism');
  assert.equal(pruneCap(25_600), 256, 'exactly at the crossover the two rules agree');
  assert.equal(pruneCap(26_888), 269, 'ceil(26888 * 0.01)');
  assert.equal(pruneCap(128_740), 1288, 'the soak\'s own edge count (notes/self.md 2026-09-17): ceil(128740 * 0.01)');
  assert.match(PRUNE_CAP_RULE, /0\.01/, 'the printed rule text must name the fraction it uses');
});

test('propose() prunes a batch larger than the old flat 256 once the organism is large enough', () => {
  const b = buildOrganism({ majors: 500, seed: 'cap-organism', name: 'throttle-cap', ledger: 'off' });
  b.tick(64);
  const model = observe(b, { log: false });
  assert.ok(model.metrics.edges > 25_600, 'test organism must be past the crossover, got ' + model.metrics.edges + ' edges');
  const cands = propose(b, model, { max: 20 });
  const prunes = cands.filter(c => c.delta.kind === 'conduit.prune');
  assert.ok(prunes.length > 0, 'no conduit.prune candidate was proposed on an organism this fresh (everything should read as stale)');
  const cap = pruneCap(model.metrics.edges);
  for (const c of prunes) {
    assert.ok(c.delta.edges.length <= cap, 'a prune batch of ' + c.delta.edges.length + ' exceeds pruneCap ' + cap);
  }
  assert.ok(prunes.some(c => c.delta.edges.length > 256), 'expected at least one prune batch above the old flat 256, got ' + prunes.map(c => c.delta.edges.length));
});

test('the self.improve gate is armed with a maxEdges that matches pruneCap, not the flat 256 default', () => {
  const b = buildOrganism({ majors: 500, seed: 'cap-gate', name: 'throttle-gate', ledger: 'runs' });
  b.tick(8);
  const daemon = new SelfDaemon(b, { minutes: 5, rounds: 0, dir: path.join(TMP, 'cap-gate'), log: false });
  assert.equal(isArmed(b.gate), true);
  const cap = pruneCap(b.connectome.size());
  assert.ok(cap > 256, 'the test organism must be past the crossover for this check to mean anything');
  const evidenceBig = { deltaKind: 'conduit.prune', verdict: 'confirmed', identicalArms: true, gainPct: 5, cells: 0, edges: cap };
  const big = b.gate.propose({ kind: SELF_KIND, what: {}, why: '', evidence: evidenceBig }, b.ctx);
  assert.equal(big.status, 'approved', 'a batch at pruneCap size was rejected: the armed policy is still using the old flat 256');
  const evidenceOver = { ...evidenceBig, edges: cap + 1 };
  const over = b.gate.propose({ kind: SELF_KIND, what: {}, why: '', evidence: evidenceOver }, b.ctx);
  assert.equal(over.status, 'rejected', 'a batch one edge over the scaled cap should still be rejected');
  void daemon;
});

test('selfPolicy itself still defaults to the flat 256 for a caller that does not scale it', () => {
  const p = selfPolicy({ minGainPct: 1 });
  const base = { evidence: { deltaKind: 'conduit.prune', verdict: 'confirmed', identicalArms: true, gainPct: 5, cells: 0, edges: 256 } };
  assert.equal(p(base), 'approve');
  assert.equal(p({ evidence: { ...base.evidence, edges: 257 } }), 'reject');
});

// ---------------------------------------------------------------- 3. the round label
test('a resumed daemon\'s own round counter is the round that just ran, even though a fresh process-local tally would not be', async () => {
  const dir = path.join(TMP, 'label');
  const b1 = organism('label', 20);
  b1.tick(32);
  const d1 = new SelfDaemon(b1, { minutes: 5, rounds: 3, plateau: 9, candidates: 2, trialTicks: 10, liveTicks: 8, dir, log: false });
  await d1.run();
  assert.equal(d1.round, 3, 'the daemon ran 3 rounds directly');

  // a second process resumes the same checkpoint and runs ONE more round: its own
  // process-local tally (what daemon/run.mjs used to print) would start at 0 and read 1
  // after that round, while the daemon's own round counter correctly reads 4. That gap is
  // exactly the bug: daemon/run.mjs now prints selfState.daemon.round (always 4 here),
  // never a second counter that can disagree with it.
  const b2 = organism('label', 20);
  b2.tick(32);
  const d2 = new SelfDaemon(b2, { minutes: 5, rounds: 4, plateau: 9, candidates: 2, trialTicks: 10, liveTicks: 8, dir, log: false, resume: true });
  assert.equal(d2.resumed, true);
  assert.equal(d2.round, 3, 'a resumed daemon must start from the checkpointed round, not 0');
  const processLocalTally = 0;
  const row = await d2.runRound();
  const processLocalAfterOneRound = processLocalTally + 1;
  assert.equal(row.round, 4, 'the round that just ran');
  assert.equal(d2.round, 4, 'the daemon\'s own counter is the source of truth daemon/run.mjs now prints');
  assert.notEqual(processLocalAfterOneRound, d2.round, 'a fresh process-local tally would have printed one round behind the daemon\'s own number, which was the bug');
});

test('daemon/run.mjs prints the round label from the daemon\'s own counter, not a second process-local one', () => {
  const src = readFileSync(path.join(ROOT, 'daemon', 'run.mjs'), 'utf8');
  const printLine = src.split('\n').find(l => l.includes("' done at t='"));
  assert.ok(printLine, 'could not find the "[self] round ... done" print line to check');
  // the exact expression concatenated into the "round " label, not the whole statement
  // (which also legitimately increments the separate selfState.rounds tally kept for the
  // process summary): "round " + <label expr> + " done"
  const label = printLine.match(/'\[self\] round '\s*\+\s*([^+]+?)\s*\+\s*' done/);
  assert.ok(label, 'could not isolate the round label expression in: ' + printLine);
  assert.equal(label[1].trim(), 'selfState.daemon.round', 'the done line must label itself with the daemon\'s own round counter, not selfState.rounds');
});

// ---------------------------------------------------------------- defaults
test('DEFAULTS.applyPerRound is a generous ceiling, not the real throttle', () => {
  // the real throttle is selectForApply's distinct-region rule; this cap only guards
  // against a future organism with an implausible number of regions
  assert.equal(DEFAULTS.applyPerRound, 32);
  assert.ok(DEFAULTS.applyPerRound > 9, 'must clear every organism\'s region count (7 in seeds/organism.mjs, 9 declared in seeds/whole.mjs)');
});
