// test/self-code.test.mjs: the self.code kind, held to the claim that makes it safe.
//
//   1. a proposal with NO evidence is refused by the policy, and so is one with no patch
//   2. a proposal whose test does NOT fail before the patch is refused: the test is not
//      evidence for a change it passes without
//   3. a valid one is PENDING, and the file on disk is byte for byte unchanged while it waits
//   4. --approve applies it and the ledger event holds the hash before AND after
//   5. a model suggestion (origin 'model') is refused until the human approved it, and even
//      then it only becomes pending, never applied
//   6. the patch cannot escape the brain directory: absolute, '..', outside ROOT and state/
//      are all refused before anything is copied or run
//
// Every verification runs against a FIXTURE root (two files), not against the brain tree, so
// the suite stays fast while exercising the same code path the CLI uses.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { Brain } from '../core/brain.mjs';
import {
  CODE_KIND, CODE_APPLY, ROOT, safePath, parsePatch, applyUnifiedPatch, verifyPatch,
  codePolicy, submit, submitAll, listPending, applyApproved, analyze, sha256, isSealed, suggestPatch,
} from '../self/code.mjs';

const TMP = mkdtempSync(path.join(tmpdir(), 'brain-selfcode-test-'));
test.after(() => { try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS will get it */ } });

const BUGGY = 'export function add(a, b) { return a - b; }\n';
const FIXED = 'export function add(a, b) { return a + b; }\n';
const SUM_TEST = [
  "import test from 'node:test';",
  "import assert from 'node:assert/strict';",
  "import { add } from './sum.mjs';",
  "test('add adds', () => { assert.equal(add(2, 3), 5); });",
  '',
].join('\n');
const FIX_PATCH = [
  '--- a/sum.mjs',
  '+++ b/sum.mjs',
  '@@ -1,1 +1,1 @@',
  '-export function add(a, b) { return a - b; }',
  '+export function add(a, b) { return a + b; }',
  '',
].join('\n');

let fixtures = 0;
/** A two file project: a module with a bug and a test that catches it. */
function fixture(fixed = false) {
  const dir = path.join(TMP, 'fix-' + (fixtures++));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'sum.mjs'), fixed ? FIXED : BUGGY);
  writeFileSync(path.join(dir, 'sum.test.mjs'), SUM_TEST);
  return dir;
}
function brainFor(root) {
  return new Brain({ name: 'self-code-test', ledger: 'full', policy: codePolicy({ root, timeoutMs: 60_000 }) });
}
function candidate(extra = {}) {
  return { key: 'fixture:add', source: 'test', kind: 'fixture', file: 'sum.mjs', test: 'sum.test.mjs', why: 'add subtracts', patch: FIX_PATCH, ...extra };
}
const ledgerEvents = (brain, type) => brain.ledger.recent(5000).filter((e) => e.type === type);

// ---------------------------------------------------------------- 6. the boundary
test('a file path outside the brain directory is refused', () => {
  assert.equal(safePath('self/code.mjs').ok, true);
  for (const bad of ['../trader/bench/run.mjs', 'self/../../trader/x.mjs', '/etc/passwd', 'C:/Windows/system32/x.mjs', 'state/soak/snapshot.json', '', 'a\0b']) {
    const r = safePath(bad);
    assert.equal(r.ok, false, JSON.stringify(bad) + ' was not refused');
    assert.equal(typeof r.reason, 'string');
  }
});

test('the policy refuses an escaping path before it copies or runs anything', () => {
  const root = fixture();
  const brain = brainFor(root);
  const r = submit(brain, candidate({ key: 'escape', file: '../outside.mjs' }), { root });
  assert.equal(r.status, 'rejected');
  assert.match(r.reason, /\.\./);
  assert.equal(r.verification, null); // nothing was verified: the boundary check comes first
});

test('a state/ path is refused: the running organism is never a patch target', () => {
  const root = fixture();
  const brain = brainFor(root);
  const r = submit(brain, candidate({ key: 'state', file: 'state/soak/snapshot.json' }), { root });
  assert.equal(r.status, 'rejected');
  assert.match(r.reason, /state\//);
});

// ---------------------------------------------------------------- 1. no evidence, no approval
test('a proposal without evidence is refused by the policy', () => {
  const root = fixture();
  const brain = brainFor(root);
  const bare = brain.gate.propose({ kind: CODE_KIND, what: {}, why: 'trust me', by: 'test', evidence: {} }, brain.ctx);
  assert.equal(bare.status, 'rejected');
  assert.match(bare.reason, /no evidence/);

  const noPatch = submit(brain, candidate({ key: 'nopatch', patch: null }), { root });
  assert.equal(noPatch.status, 'rejected');
  assert.match(noPatch.reason, /no patch/);
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY);
});

test('the kind is registered on an ordinary brain, and an empty proposal is rejected there too', () => {
  const brain = new Brain({ name: 'self-code-registry', ledger: 'full' }); // no policy option: the registry is the only wiring
  const p = brain.gate.propose({ kind: CODE_KIND, what: {}, why: '', by: 'test', evidence: {} }, brain.ctx);
  assert.equal(p.status, 'rejected');
  assert.match(p.reason, /no evidence/);
});

// ---------------------------------------------------------------- 2. the test must fail first
test('a proposal whose test does not fail before the patch is refused', () => {
  const root = fixture(true); // sum.mjs is already correct, so sum.test.mjs passes unpatched
  const noop = [
    '@@ -1,1 +1,1 @@',
    '-export function add(a, b) { return a + b; }',
    '+export function add(a, b) { return b + a; }',
    '',
  ].join('\n');
  const brain = brainFor(root);
  const r = submit(brain, candidate({ key: 'already-green', patch: noop }), { root });
  assert.equal(r.status, 'rejected');
  assert.equal(r.verification.failsBefore, false);
  assert.equal(r.verification.before.exit, 0);
  assert.match(r.reason, /does not fail/);
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), FIXED);
});

test('verifyPatch runs the test twice and seals what it measured', () => {
  const root = fixture();
  const v = verifyPatch({ file: 'sum.mjs', patch: FIX_PATCH, test: 'sum.test.mjs', root, timeoutMs: 60_000 });
  assert.equal(isSealed(v), true);
  assert.equal(v.ok, true);
  assert.equal(v.failsBefore, true);
  assert.equal(v.passesAfter, true);
  assert.equal(v.before.fail, 1);
  assert.equal(v.after.pass, 1);
  assert.equal(v.after.fail, 0);
  assert.equal(v.hashBefore, sha256(BUGGY));
  assert.equal(v.hashAfter, sha256(FIXED));
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY); // the copy was patched, not the file
});

test('an unsealed verification is not believed', () => {
  const root = fixture();
  const brain = new Brain({
    name: 'self-code-forged', ledger: 'full',
    // a policy whose verifier hands back a perfect result it never ran
    policy: codePolicy({ root, verify: () => ({ ok: true, failsBefore: true, passesAfter: true, before: { fail: 1 }, after: { pass: 1 } }) }),
  });
  const r = submit(brain, candidate({ key: 'forged' }), { root });
  assert.equal(r.status, 'rejected');
  assert.match(r.reason, /not run by this process/);
});

// ---------------------------------------------------------------- 3 and 4. pending, then the human
test('a valid proposal is pending until the human approves it, and then it lands with both hashes', () => {
  const root = fixture();
  const brain = brainFor(root);
  const r = submit(brain, candidate(), { root });
  assert.equal(r.status, 'pending');
  assert.equal(r.verification.ok, true);
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY, 'a pending proposal changed a file');

  const pending = listPending(brain);
  assert.equal(pending.length, 1);
  assert.equal(pending[0].id, r.id);
  assert.equal(pending[0].file, 'sum.mjs');
  assert.equal(pending[0].failsBefore, true);
  assert.equal(pending[0].passesAfter, true);

  // nothing lands without the decision, even for a caller holding the proposal
  const early = applyApproved(brain, r.proposal, { root });
  assert.equal(early.ok, false);
  assert.match(early.reason, /has not approved/);
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY);

  const decided = brain.gate.decide(r.id, true, 'human', brain.ctx);
  assert.equal(decided.status, 'approved');
  const landed = applyApproved(brain, decided, { root });
  assert.equal(landed.ok, true);
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), FIXED);
  assert.equal(landed.hashBefore, sha256(BUGGY));
  assert.equal(landed.hashAfter, sha256(FIXED));
  assert.notEqual(landed.hashBefore, landed.hashAfter);

  const events = ledgerEvents(brain, CODE_APPLY);
  assert.equal(events.length, 1);
  assert.equal(events[0].hashBefore, sha256(BUGGY));
  assert.equal(events[0].hashAfter, sha256(FIXED));
  assert.equal(events[0].file, 'sum.mjs');
  assert.equal(events[0].by, 'human');
  assert.equal(listPending(brain).length, 0);
});

test('an approved patch is refused when the file moved after it was verified', () => {
  const root = fixture();
  const brain = brainFor(root);
  const r = submit(brain, candidate({ key: 'moved' }), { root });
  assert.equal(r.status, 'pending');
  const decided = brain.gate.decide(r.id, true, 'human', brain.ctx);
  writeFileSync(path.join(root, 'sum.mjs'), BUGGY + '// a second builder edited this file\n');
  const landed = applyApproved(brain, decided, { root });
  assert.equal(landed.ok, false);
  assert.match(landed.reason, /changed since it was verified/);
  assert.equal(ledgerEvents(brain, CODE_APPLY).length, 0);
});

test('a rejected proposal is never applied', () => {
  const root = fixture();
  const brain = brainFor(root);
  const r = submit(brain, candidate({ key: 'rejected-by-human' }), { root });
  const decided = brain.gate.decide(r.id, false, 'human', brain.ctx);
  assert.equal(decided.status, 'rejected');
  const landed = applyApproved(brain, decided, { root });
  assert.equal(landed.ok, false);
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY);
});

// ---------------------------------------------------------------- 5. the model may suggest
test('a model suggestion is never applied without the human saying so on the CLI', () => {
  const root = fixture();
  const brain = brainFor(root);
  const suggestion = candidate({ key: 'model:add', origin: 'model' });
  const refused = submit(brain, suggestion, { root });
  assert.equal(refused.status, 'rejected');
  assert.match(refused.reason, /origin model/);
  assert.equal(refused.verification, null); // the patch was never even run
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY);

  // the human passed --approve on the CLI: the same suggestion is now verified like any
  // other candidate, and the most it can reach is pending
  const held = submit(brain, suggestion, { root, humanApproved: true });
  assert.equal(held.status, 'pending');
  assert.equal(held.proposal.evidence.origin, 'model');
  assert.equal(readFileSync(path.join(root, 'sum.mjs'), 'utf8'), BUGGY);
  assert.equal(listPending(brain).filter((p) => p.origin === 'model').length, 1);
});

test('the llm cell can suggest, and what it suggests is marked origin model', async () => {
  const s = await suggestPatch(candidate({ patch: null }), { provider: 'null' });
  assert.equal(s.origin, 'model');
  assert.equal(s.humanApproved, false);
  assert.equal(s.patch, null); // the null provider writes no diff, so there is nothing to propose
  assert.equal(s.key.endsWith(':model'), true);
  const root = fixture();
  const brain = brainFor(root);
  const r = submit(brain, s, { root });
  assert.equal(r.status, 'rejected');
  // the null provider wrote no diff, so the missing patch is what the policy names first:
  // the origin check is the second wall, and the test above walks into it with a real patch
  assert.match(r.reason, /no patch/);
});

// ---------------------------------------------------------------- the patch itself
test('a patch that does not match, or matches twice, is refused rather than guessed at', () => {
  assert.equal(parsePatch('no hunks here').ok, false);
  assert.equal(parsePatch('@@ nonsense @@').ok, false);
  const twice = 'const a = 1;\nconst a = 1;\n';
  const amb = ['@@ -5,1 +5,1 @@', '-const a = 1;', '+const a = 2;', ''].join('\n');
  const r = applyUnifiedPatch(twice, amb);
  assert.equal(r.ok, false);
  assert.match(r.reason, /2 places/);
  const nomatch = applyUnifiedPatch('const b = 1;\n', amb);
  assert.equal(nomatch.ok, false);
  assert.match(nomatch.reason, /does not match/);
  // the same hunk at the wrong line number still lands when it is unique
  const moved = applyUnifiedPatch('// header\nconst a = 1;\n', amb);
  assert.equal(moved.ok, true);
  assert.equal(moved.text, '// header\nconst a = 2;\n');
  assert.deepEqual(moved.offsets, [-3]);
});

// ---------------------------------------------------------------- the analysis
test('the analysis reads the benches that exist and names a test for every candidate', () => {
  const a = analyze({ run: false }); // run: false keeps the suite fast; the bench re-runs the red files
  assert.equal(typeof a.sources.mutants.mutants, 'number');
  assert.equal(typeof a.sources.gate.tests, 'number');
  assert.equal(a.sources.mutants.survived <= a.sources.mutants.mutants, true);
  for (const c of a.candidates) {
    assert.equal(typeof c.key, 'string');
    assert.equal(safePath(c.file).ok, true, c.file + ' is not inside the brain directory');
    assert.equal(c.test, c.file);
    assert.equal(c.patch, null, 'an analysis does not write a patch: a candidate with no patch must be refused');
  }
  // a candidate with no patch, submitted, is refused: that is the loop being honest about
  // what it found rather than approving a change it cannot evidence
  if (a.candidates.length) {
    const brain = new Brain({ name: 'self-code-analysis', ledger: 'full' });
    const out = submitAll(brain, a.candidates.slice(0, 1));
    assert.equal(out.pending, 0);
    assert.equal(out.refused, 1);
  }
});

test('the analysis finds the candidate in a verdict pair that HAS one', () => {
  // The real verdicts can hold no survived mutant and no red test file, and an analysis
  // graded only on that population is graded on emptiness. This pair carries exactly one of
  // each, so the counts have a known answer.
  const dir = path.join(TMP, 'verdicts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'mutants.json'), JSON.stringify({
    at: '2026-09-17T00:00:00.000Z', suites: { fixture: ['test/self-code.test.mjs'] },
    mutants: [
      { id: 'fx01', sub: 'fixture', file: 'self/code.mjs', why: 'a hole in the suite', executed: true, killed: false },
      { id: 'fx02', sub: 'fixture', file: 'self/code.mjs', why: 'killed', executed: true, killed: true },
      { id: 'fx03', sub: 'fixture', file: 'self/code.mjs', why: 'never ran', executed: false, killed: false },
    ],
  }));
  writeFileSync(path.join(dir, 'gate.json'), JSON.stringify({
    at: '2026-09-17T00:00:00.000Z', verdict: 'RED',
    tests: [
      { file: 'test/self-code.test.mjs', pass: 14, fail: 1, total: 15, exit: 1, ms: 2183 },
      { file: 'test/core.test.mjs', pass: 25, fail: 0, total: 25, exit: 0, ms: 501 },
    ],
  }));
  const a = analyze({ verdicts: dir, run: false });
  assert.equal(a.sources.mutants.survived, 1, 'a mutant that never executed is not a survivor');
  assert.equal(a.sources.gate.red, 1);
  assert.deepEqual(a.candidates.map((c) => c.key), ['mutant:fx01', 'gate:test/self-code.test.mjs']);
  assert.equal(a.candidates[0].test, 'test/self-code.test.mjs');

  const brain = new Brain({ name: 'self-code-known', ledger: 'full' });
  const out = submitAll(brain, a.candidates);
  assert.equal(out.found, 2);
  assert.equal(out.refused, 2, 'an analysis writes no patch, so both candidates must be refused');
  assert.equal(out.pending, 0);
  // and the same candidates a second time are not proposed twice
  const again = submitAll(brain, a.candidates);
  assert.equal(again.refused, 2); // rejected proposals left the pending map, so they are re-judged, not skipped
  assert.equal(listPending(brain).length, 0);
});

test('ROOT is the brain directory and nothing above it', () => {
  // NOT asserted by name. MEASURED by bench/self-code.mjs: a verification runs this very
  // file from a COPY of the tree in a temp dir, so an assertion on the directory's name is
  // false there and would make every self.code proposal naming this test unverifiable. What
  // ROOT must be is the directory that holds self/ and core/, whatever it is called.
  assert.equal(ROOT, path.resolve(path.dirname(safePath('self/code.mjs').abs), '..'));
  assert.equal(safePath('core/gate.mjs').ok, true);
  assert.equal(safePath('bench/verdicts/gate.json').abs, path.join(ROOT, 'bench', 'verdicts', 'gate.json'));
});
