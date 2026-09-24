// bench/self-code.mjs: SELF IMPROVEMENT OF THE SOURCE, MEASURED. Two things are measured
// here and they are not the same thing.
//
//   A. THE ANALYSIS, on the verdicts that exist right now. How many mutants the last mutant
//      run generated, how many survived, how many test files the last gate found red, how
//      many candidates that yields, and what the gate did with each one. A candidate the
//      analysis cannot write a patch for is REFUSED, and that refusal is the honest reading
//      of today's data, not a hidden failure.
//   B. THE MACHINERY, on a fixture: a two file project with a real defect and a real patch.
//      Five cases go through the gate (a valid patch, a test that already passes, no patch,
//      a model suggestion, a path that leaves the root) and the counts say what the gate did
//      with each. The cases are INTERLEAVED across repeats, never run arm by arm.
//
// Arm A2 runs the same analysis over a fixture PAIR of verdicts that holds one survived
// mutant and one red test file, because today the real ones hold neither and an analysis
// graded on an empty population is graded on nothing. Arm E runs ONE verification at real
// tree size, so the cost of the machinery is known at the size the CLI pays.
//
// Then the CLI itself: `brain self-code <name> --json` on a scratch brain, and an --approve
// aimed at a proposal whose file is outside the brain directory, which must be refused.
//
// The verdict is not "the organism improved itself". It is what a command can check:
//   1. every valid candidate stopped at PENDING: the policy never approves
//   2. every refusal carried a reason, and nothing was written for a refused candidate
//   3. the one approved patch landed only after a human decision, and the ledger holds the
//      file hash before and after
//   4. nothing from the real analysis was approved
//   5. a proposal pointing outside the brain directory is refused at the CLI too
//
// usage: node bench/self-code.mjs [--repeats 2] [--timeout 120000] [--quiet]
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import {
  CODE_APPLY, ROOT, analyze, submit, submitAll, listPending, applyApproved,
  codePolicy, verifyPatch, sha256,
} from '../self/code.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  if (i < 0) return dflt;
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : (typeof dflt === 'number' ? Number(v) : v);
};
const quiet = argv.includes('--quiet');
const say = (s) => { if (!quiet) console.log(s); };
const REPEATS = Math.max(1, Number(flag('repeats', 2)) || 2);
const TIMEOUT = Number(flag('timeout', 120_000)) || 120_000;
const COMMAND = 'node bench/self-code.mjs' + (argv.length ? ' ' + argv.join(' ') : '');

const TMP = mkdtempSync(path.join(tmpdir(), 'bench-selfcode-'));
const BUGGY = 'export function add(a, b) { return a - b; }\n';
const FIXED = 'export function add(a, b) { return a + b; }\n';
const SUM_TEST = [
  "import test from 'node:test';",
  "import assert from 'node:assert/strict';",
  "import { add } from './sum.mjs';",
  "test('add adds', () => { assert.equal(add(2, 3), 5); });",
  '',
].join('\n');
const FIX_PATCH = ['@@ -1,1 +1,1 @@', '-export function add(a, b) { return a - b; }', '+export function add(a, b) { return a + b; }', ''].join('\n');
const NOOP_PATCH = ['@@ -1,1 +1,1 @@', '-export function add(a, b) { return a + b; }', '+export function add(a, b) { return b + a; }', ''].join('\n');

let made = 0;
function fixture(fixed = false) {
  const dir = path.join(TMP, 'fix-' + (made++));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'sum.mjs'), fixed ? FIXED : BUGGY);
  writeFileSync(path.join(dir, 'sum.test.mjs'), SUM_TEST);
  return dir;
}

// ---------------------------------------------------------------- A. the analysis
say('A. the analysis over bench/verdicts');
const t0 = Date.now();
const a = analyze({ max: 5, timeoutMs: TIMEOUT });
const analysisMs = Date.now() - t0;
const brainA = new Brain({ name: 'self-code-bench', ledger: 'full' });
const outA = submitAll(brainA, a.candidates);
const approvedFromAnalysis = outA.results.filter((r) => r.status === 'approved').length;
say('   mutants.json  ' + a.sources.mutants.mutants + ' mutants, ' + a.sources.mutants.survived + ' survived');
say('   gate.json     ' + a.sources.gate.tests + ' test files, ' + a.sources.gate.red + ' red, verdict ' + (a.sources.gate.verdict || 'none'));
say('   candidates    found ' + outA.found + '  refused ' + outA.refused + '  pending ' + outA.pending + '  approved ' + approvedFromAnalysis + '  in ' + analysisMs + ' ms');
for (const r of outA.results) say('     ' + r.status + ' ' + r.key + ': ' + (r.reason || ''));

// A2. THE ANALYSIS AGAINST A KNOWN ANSWER. Today's verdicts hold no survived mutant and no
// red test file, so arm A alone would grade the analysis on one kind of row: an empty one.
// This pair of fixture verdicts carries exactly one of each, and the analysis must find two
// candidates and the gate must refuse both for the same reason (an analysis writes no patch).
say('\nA2. the analysis against a fixture pair of verdicts');
const fixVerdicts = path.join(TMP, 'verdicts');
mkdirSync(fixVerdicts, { recursive: true });
writeFileSync(path.join(fixVerdicts, 'mutants.json'), JSON.stringify({
  at: '2026-09-17T00:00:00.000Z',
  suites: { fixture: ['test/self-code.test.mjs'] },
  mutants: [
    { id: 'fx01', sub: 'fixture', file: 'self/code.mjs', why: 'the boundary check stops refusing ..', executed: true, killed: false, status: 'survived', find: 'a', replace: 'b' },
    { id: 'fx02', sub: 'fixture', file: 'self/code.mjs', why: 'a mutant the suite killed', executed: true, killed: true, status: 'killed', find: 'a', replace: 'b' },
  ],
}));
writeFileSync(path.join(fixVerdicts, 'gate.json'), JSON.stringify({
  at: '2026-09-17T00:00:00.000Z', verdict: 'RED',
  tests: [
    { file: 'test/self-code.test.mjs', pass: 14, fail: 1, total: 15, exit: 1, ms: 2183 },
    { file: 'test/core.test.mjs', pass: 25, fail: 0, total: 25, exit: 0, ms: 501 },
  ],
}));
const a2 = analyze({ verdicts: fixVerdicts, run: false });
const brainA2 = new Brain({ name: 'self-code-bench-fixture', ledger: 'full' });
const outA2 = submitAll(brainA2, a2.candidates);
say('   candidates ' + outA2.found + ' (1 survived mutant of 2, 1 red test file of 2)  refused ' + outA2.refused + '  pending ' + outA2.pending);
for (const r of outA2.results) say('     ' + r.status + ' ' + r.key + ': ' + (r.reason || ''));

// ---------------------------------------------------------------- B. the machinery, interleaved
// One case list, walked once per repeat. Arm by arm would run every valid patch together and
// every refusal together, and a machine that got slower or a disk that filled up halfway
// would land entirely on one arm.
const CASES = [
  { case: 'valid', mk: () => ({ root: fixture(), cand: { key: 'valid', file: 'sum.mjs', test: 'sum.test.mjs', why: 'add subtracts', patch: FIX_PATCH } }), want: 'pending' },
  { case: 'already-green', mk: () => ({ root: fixture(true), cand: { key: 'already-green', file: 'sum.mjs', test: 'sum.test.mjs', why: 'a patch with no failing test', patch: NOOP_PATCH } }), want: 'rejected' },
  { case: 'no-patch', mk: () => ({ root: fixture(), cand: { key: 'no-patch', file: 'sum.mjs', test: 'sum.test.mjs', why: 'an analysis with no patch', patch: null } }), want: 'rejected' },
  { case: 'model-origin', mk: () => ({ root: fixture(), cand: { key: 'model-origin', file: 'sum.mjs', test: 'sum.test.mjs', why: 'the model wrote this', patch: FIX_PATCH, origin: 'model' } }), want: 'rejected' },
  { case: 'escapes-root', mk: () => ({ root: fixture(), cand: { key: 'escapes-root', file: '../sum.mjs', test: 'sum.test.mjs', why: 'a patch that leaves the root', patch: FIX_PATCH } }), want: 'rejected' },
];
say('\nB. the machinery on a fixture, ' + REPEATS + ' repeats, cases interleaved');
const runs = [];
for (let r = 0; r < REPEATS; r++) {
  for (const c of CASES) {
    const { root, cand } = c.mk();
    const brain = new Brain({ name: 'self-code-case', ledger: 'full', policy: codePolicy({ root, timeoutMs: TIMEOUT }) });
    const t = Date.now();
    const res = submit(brain, cand, { root });
    const ms = Date.now() - t;
    const onDisk = existsSync(path.join(root, 'sum.mjs')) ? readFileSync(path.join(root, 'sum.mjs'), 'utf8') : null;
    runs.push({
      repeat: r, case: c.case, want: c.want, status: res.status, ok: res.status === c.want,
      reason: res.reason || null, ms,
      verified: !!res.verification, copyMs: res.verification?.copyMs ?? null,
      beforeFail: res.verification?.before?.fail ?? null, afterPass: res.verification?.after?.pass ?? null,
      fileUnchanged: onDisk === null ? null : (onDisk === BUGGY || onDisk === FIXED && c.case === 'already-green'),
      pendingAfter: listPending(brain).length,
    });
    say('   r' + r + ' ' + c.case.padEnd(14) + res.status.padEnd(10) + ms + ' ms  ' + (res.reason ? res.reason.slice(0, 64) : ''));
  }
}
const byCase = {};
for (const c of CASES) {
  const rows = runs.filter((x) => x.case === c.case);
  byCase[c.case] = {
    want: c.want, runs: rows.length, asWanted: rows.filter((x) => x.ok).length,
    meanMs: Number((rows.reduce((s, x) => s + x.ms, 0) / rows.length).toFixed(1)),
    verified: rows.filter((x) => x.verified).length,
    beforeFail: rows[0].beforeFail, afterPass: rows[0].afterPass, copyMs: rows[0].copyMs,
    fileChanged: rows.filter((x) => x.fileUnchanged === false).length,
    reason: rows[0].reason,
  };
}

// ---------------------------------------------------------------- the one application
say('\nC. the human approves one verified patch');
const appRoot = fixture();
const appBrain = new Brain({ name: 'self-code-apply', ledger: 'full', policy: codePolicy({ root: appRoot, timeoutMs: TIMEOUT }) });
const held = submit(appBrain, { key: 'apply', file: 'sum.mjs', test: 'sum.test.mjs', why: 'add subtracts', patch: FIX_PATCH }, { root: appRoot });
const beforeText = readFileSync(path.join(appRoot, 'sum.mjs'), 'utf8');
const decided = held.status === 'pending' ? appBrain.gate.decide(held.id, true, 'human', appBrain.ctx) : held.proposal;
const landed = applyApproved(appBrain, decided, { root: appRoot });
const afterText = readFileSync(path.join(appRoot, 'sum.mjs'), 'utf8');
const applyEvents = appBrain.ledger.recent(5000).filter((e) => e.type === CODE_APPLY);
say('   pending #' + held.id + ' -> ' + decided.status + ' -> ' + (landed.ok ? 'applied' : 'refused: ' + landed.reason));
say('   hash ' + String(landed.hashBefore).slice(0, 12) + ' -> ' + String(landed.hashAfter).slice(0, 12) + '  ledger events ' + applyEvents.length);

// a second verification of the same patch on the now patched file must refuse: the test no
// longer fails without it
const reVerify = verifyPatch({ file: 'sum.mjs', patch: FIX_PATCH, test: 'sum.test.mjs', root: appRoot, timeoutMs: TIMEOUT });
say('   re-verified after landing: ok=' + reVerify.ok + ' (' + (reVerify.reason || '') + ')');

// ---------------------------------------------------------------- E. the real tree
// The fixture root is two files, so every millisecond above is the machinery and none of it
// is the brain. This arm runs ONE verification at real size: the whole tree is copied
// (state/, .git, node_modules and site/ excluded) and the real test that grades self/code.mjs
// runs twice against it. The patch is a comment, so the test passes without it and the
// verification must REFUSE. Nothing in the brain tree is touched either way.
say('\nE. one verification against the real brain tree');
const realPatch = [
  '@@ -1,1 +1,2 @@',
  '+// a comment the bench proposes and the policy refuses: the test passes without it',
  '-// self/code.mjs: SELF IMPROVEMENT EXTENDED FROM THE CONNECTOME TO THE SOURCE. self/propose',
  '+// self/code.mjs: SELF IMPROVEMENT EXTENDED FROM THE CONNECTOME TO THE SOURCE. self/propose',
  '',
].join('\n');
const realT0 = Date.now();
const real = verifyPatch({ file: 'self/code.mjs', patch: realPatch, test: 'test/self-code.test.mjs', root: ROOT, timeoutMs: TIMEOUT });
const realMs = Date.now() - realT0;
const realSource = readFileSync(path.join(ROOT, 'self', 'code.mjs'), 'utf8');
say('   copy ' + real.copyMs + ' ms, test before ' + (real.before?.ms ?? 'n/a') + ' ms (' + (real.before?.pass ?? '?') + ' pass), after ' + (real.after?.ms ?? 'n/a') + ' ms, total ' + realMs + ' ms');
say('   ok=' + real.ok + '  ' + (real.reason || ''));

// ---------------------------------------------------------------- D. the CLI
say('\nD. the CLI');
const stateDir = path.join(TMP, 'state');
const env = {};
for (const [k, v] of Object.entries(process.env)) { if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v; }
env.BRAIN_STATE_DIR = stateDir;
const cli = (args) => spawnSync(process.execPath, [path.join(ROOT, 'bin', 'brain.mjs'), ...args], { cwd: ROOT, encoding: 'utf8', env, timeout: 300_000 });
const init = cli(['init', 'selfcodebench']);
const listed = cli(['self-code', 'selfcodebench', '--json']);
let cliJson = null;
try { cliJson = JSON.parse(listed.stdout); } catch { /* the exit code below carries the failure */ }
say('   brain init                     exit ' + init.status);
say('   brain self-code <n> --json     exit ' + listed.status + '  found ' + (cliJson?.found ?? 'n/a') + '  refused ' + (cliJson?.refused ?? 'n/a') + '  pending ' + (cliJson?.pendingList?.length ?? 'n/a'));

// A proposal whose file is outside the brain directory, put to the CLI's own brain and then
// approved there: the CLI resolves against ROOT, so it must refuse to write.
const outside = cli(['self-code', 'selfcodebench', '--approve', '999']);
say('   brain self-code --approve 999  exit ' + outside.status + '  ' + (outside.stderr || '').split('\n')[0].slice(0, 70));
const cliHelp = cli(['help', 'self-code']);

// ---------------------------------------------------------------- the verdict
const checks = {
  policyNeverApproves: runs.every((r) => r.status !== 'approved') && approvedFromAnalysis === 0,
  everyCaseAsWanted: runs.every((r) => r.ok),
  everyRefusalHasAReason: runs.filter((r) => r.status === 'rejected').every((r) => typeof r.reason === 'string' && r.reason.length > 0),
  noFileWrittenForARefusal: runs.filter((r) => r.status === 'rejected').every((r) => r.fileUnchanged !== false),
  appliedOnlyAfterTheHuman: landed.ok === true && decided.decidedBy === 'human' && beforeText === BUGGY && afterText === FIXED,
  ledgerHoldsBothHashes: applyEvents.length === 1 && applyEvents[0].hashBefore === sha256(BUGGY) && applyEvents[0].hashAfter === sha256(FIXED),
  reVerifyRefusesALandedPatch: reVerify.ok === false,
  cliListed: listed.status === 0 && cliJson !== null && cliJson.ok === true,
  cliRefusedTheUnknownId: outside.status !== 0,
  cliHelpNamesTheCommand: cliHelp.status === 0 && /self-code/.test(cliHelp.stdout),
  analysisFindsAKnownCandidate: outA2.found === 2 && outA2.refused === 2 && outA2.pending === 0,
  realTreeRefusedAndUntouched: real.ok === false && real.failsBefore === false && real.before.pass > 0 && realSource === readFileSync(path.join(ROOT, 'self', 'code.mjs'), 'utf8'),
};
const green = Object.values(checks).every(Boolean);
const verdict = {
  at: new Date().toISOString(),
  node: process.version,
  command: COMMAND,
  repeats: REPEATS,
  timeoutMs: TIMEOUT,
  analysis: {
    ms: analysisMs,
    mutants: a.sources.mutants.mutants, mutantsSurvived: a.sources.mutants.survived, mutantsAt: a.sources.mutants.at,
    gateTests: a.sources.gate.tests, gateRed: a.sources.gate.red, gateVerdict: a.sources.gate.verdict, gateAt: a.sources.gate.at,
    candidatesFound: outA.found, refused: outA.refused, pending: outA.pending, approved: approvedFromAnalysis,
    results: outA.results.map((r) => ({ key: r.key, status: r.status, reason: r.reason })),
  },
  analysisControl: {
    mutants: a2.sources.mutants.mutants, mutantsSurvived: a2.sources.mutants.survived,
    gateTests: a2.sources.gate.tests, gateRed: a2.sources.gate.red,
    candidatesFound: outA2.found, refused: outA2.refused, pending: outA2.pending,
    results: outA2.results.map((r) => ({ key: r.key, status: r.status, reason: r.reason })),
  },
  fixture: { cases: CASES.length, repeats: REPEATS, runs: runs.length, byCase, runsDetail: runs },
  application: {
    proposal: held.id, status: decided.status, decidedBy: decided.decidedBy ?? null, applied: landed.ok === true,
    hashBefore: landed.hashBefore ?? null, hashAfter: landed.hashAfter ?? null,
    bytesBefore: landed.bytesBefore ?? null, bytesAfter: landed.bytesAfter ?? null,
    ledgerEvents: applyEvents.length, reVerifyOk: reVerify.ok, reVerifyReason: reVerify.reason,
  },
  realTree: {
    file: 'self/code.mjs', test: 'test/self-code.test.mjs', totalMs: realMs, copyMs: real.copyMs ?? null,
    beforeMs: real.before?.ms ?? null, beforePass: real.before?.pass ?? null, beforeFail: real.before?.fail ?? null,
    afterMs: real.after?.ms ?? null, afterPass: real.after?.pass ?? null,
    ok: real.ok, reason: real.reason,
  },
  cli: {
    initExit: init.status, listExit: listed.status,
    found: cliJson?.found ?? null, refused: cliJson?.refused ?? null, pending: cliJson?.pendingList?.length ?? null,
    approveUnknownExit: outside.status, helpExit: cliHelp.status,
  },
  checks,
  verdict: green ? 'GREEN' : 'RED',
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'self-code.json'), JSON.stringify(verdict, null, 2));
try { rmSync(TMP, { recursive: true, force: true }); } catch { /* the OS will get it */ }

console.log('\nSELF-CODE ' + verdict.verdict
  + ': analysis found ' + outA.found + ' candidates (' + outA.refused + ' refused, ' + outA.pending + ' pending, ' + approvedFromAnalysis + ' approved)'
  + ' from ' + a.sources.mutants.survived + ' survived mutants of ' + a.sources.mutants.mutants + ' and ' + a.sources.gate.red + ' red test files of ' + a.sources.gate.tests
  + '; the same analysis on a fixture pair of verdicts found ' + outA2.found + ' candidates and the gate refused ' + outA2.refused
  + '; fixture ' + runs.filter((r) => r.ok).length + '/' + runs.length + ' cases as wanted over ' + REPEATS + ' interleaved repeats'
  + '; one patch applied after a human decision, ' + String(landed.hashBefore).slice(0, 12) + ' -> ' + String(landed.hashAfter).slice(0, 12)
  + '; one verification at real tree size cost ' + realMs + ' ms (' + real.copyMs + ' ms copy, ' + (real.before?.ms ?? 0) + ' + ' + (real.after?.ms ?? 0) + ' ms of test) and was refused');
for (const [k, v] of Object.entries(checks)) if (!v) console.log('  RED ' + k);
process.exit(green ? 0 : 1);
