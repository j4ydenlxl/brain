// test/grow-self.test.mjs: the SELF-MODIFICATION step (grow/self.mjs, GROW.md step 6) against stub trees.
// Every stub is a git repository under os.tmpdir() (check copies a tree through git ls-files) holding the tree's CLAUDE.md
// (the CONCISE directive), a GROW.md with every KEEP string, two targets under grow/ (notes.md with CRLF and a non-ASCII
// byte, so a revert is graded byte for byte, and tool.mjs), a file the stub's judge/LOCK.json names, a NEVER file and a
// .jsonl (neither is a target), and grown/generations.json at generation 1 with 1 of 2 survived (the baseline 0.5).
// No stub holds a suite unless a test plants ONE under a SELF_SUITES name (test/grow-misses.test.mjs, red when the
// candidate carries a marker), so check never runs the tree's real suites from here. The CLI runs from the tree with
// --root <stub>; the exported functions are imported directly. Every stub is removed in process.on('exit').
// The guards bind the file ON DISK: a mis-cased name, a hard link and a symbolic link to a locked or NEVER file are
// refused; the NEO tier's selector and teacher (grow/neo.mjs, grow/teach.mjs) are NEVER and KEEP, its kernel a target.
// Author: Day 3 board, test builder for grow/self.mjs, 2026-10-01.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs, rateOf, secretHit, lockedOf, neverOf, targetsOf, shipOf, judgedOf, verdictsOf, baselineOf, resolveTarget, suitesWith, TARGET_RE, NEVER, KEEP, FORBID, MAX_BYTES, MAX_TEXT, LEDGER, KEEP_DIR, SELF_SUITES, USAGE } from '../grow/self.mjs';
import { TRAILER, conciseDirective } from '../grow/generation.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(BRAIN, 'grow', 'self.mjs');
const DIRECTIVE = '[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]';
const CLAUDE_MD = fs.readFileSync(path.join(BRAIN, 'CLAUDE.md'));
const GROW_MD = ['# GROW (stub)', '', 'Step 6 is grow/self.mjs; the pointer rule is grow/cortex.mjs; the NEO tier is selected by grow/neo.mjs and opened by grow/teach.mjs; every arm gets the CONCISE directive; node judge/verify.mjs prints LOCK OK first.', '', '## Done', '', 'Paste the final line.', ''].join('\n');
const NEO_SUITES = ['test/neo-kernel.test.mjs', 'test/neo.test.mjs', 'test/grow-teach.test.mjs'];
/** The temp filesystem the stubs live on: whether it folds case (Windows, macOS) and may create a symbolic link (Windows without the privilege may not). */
const FS = (() => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-self-probe-'));
  try {
    fs.writeFileSync(path.join(d, 'a'), 'a');
    const folds = fs.existsSync(path.join(d, 'A'));
    let link = true;
    try { fs.symlinkSync(path.join(d, 'a'), path.join(d, 'b')); } catch { link = false; }
    return { folds, link };
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
})();
const NOTES = Buffer.from('# notes\r\nline one\r\nline two, café\n', 'utf8');
const AFTER = Buffer.concat([NOTES, Buffer.from('a trial line\n')]);
const TOOL = 'export const x = 1;\n';
const AT = '2026-10-01T00:00:00.000Z';
const BASE = { generation: 1, at: AT, candidates: 2, survivors: 1, rate: 0.5 };
const BEFORE_COPY = KEEP_DIR + '/trial-1.before.notes.md', AFTER_COPY = KEEP_DIR + '/trial-1.after.notes.md';
const PLANTED = 'test/grow-misses.test.mjs';
const RED = 'PLANTED-RED';
const PLANTED_NAME = 'planted: grow/notes.md carries no red marker';
const PLANTED_SRC = ["import { test } from 'node:test';", "import assert from 'node:assert/strict';", "import fs from 'node:fs';",
  'test(' + JSON.stringify(PLANTED_NAME) + ", () => assert.ok(!fs.readFileSync('grow/notes.md', 'utf8').includes(" + JSON.stringify(RED) + ')));', ''].join('\n');
// built at run time so no file of the tree holds a secret-shaped string (check's own rule, and any push scanner's)
const SECRET = ['sk', 'live', 'Q7'.repeat(12)].join('_');

const roots = new Set();
process.on('exit', () => { for (const r of roots) { try { fs.rmSync(r, { recursive: true, force: true, maxRetries: 3 }); } catch { /* exit is best effort; the next run's stubs have new names */ } } });
const put = (root, rel, data) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); return f; };
const read = (root, rel) => fs.readFileSync(path.join(root, rel));
const exists = (root, rel) => fs.existsSync(path.join(root, rel));
const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const sha = (b) => createHash('sha256').update(b).digest('hex');
const git = (root, args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
const lines = (s) => String(s || '').split(/\r?\n/).filter(Boolean);
const gen = (generation, survivors, candidates, lane = 'direct') => ({ generation, at: AT, lanes: { [lane]: { candidates, survivors } } });
const selfRel = (n) => 'work/grow/gen-' + n + '/self';
/** The tallies of a suitesWith run, without its timing and copy count. */
const pick = (s) => ({ files: s.files, pass: s.pass, fail: s.fail, exitCode: s.exitCode, line: s.line });

function makeRoot({ gens = [gen(1, 1, 2)], suite = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-self-'));
  roots.add(root);
  put(root, '.gitignore', 'work/\n');
  put(root, 'CLAUDE.md', CLAUDE_MD);
  put(root, 'GROW.md', GROW_MD);
  put(root, 'grow/notes.md', NOTES);
  put(root, 'grow/tool.mjs', TOOL);
  put(root, 'grow/locked.mjs', 'export const y = 2;\n');
  put(root, 'grow/sandbox.mjs', 'export const z = 3;\n');
  put(root, 'grow/rows.jsonl', '{}\n');
  put(root, 'judge/LOCK.json', JSON.stringify({ files: ['judge/judge.mjs', 'grow/locked.mjs'] }));
  put(root, 'grown/generations.json', JSON.stringify({ generations: gens }));
  if (suite) put(root, PLANTED, PLANTED_SRC);
  // the commit carries a local test identity on the command line: the stub's config stays empty unless a test sets it
  for (const args of [['init', '-q'], ['add', '-A'], ['-c', 'user.email=init@example.invalid', '-c', 'user.name=tester', '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', 'init']]) {
    const r = git(root, args);
    assert.equal(r.status, 0, 'git ' + args.join(' ') + ': ' + r.stderr);
  }
  return root;
}
function record(root, entry) {
  const gs = readJson(root, 'grown/generations.json');
  put(root, 'grown/generations.json', JSON.stringify({ generations: [...gs.generations.filter((e) => e.generation !== entry.generation), entry] }));
}
function candidate(root, n, target, content, extra = {}) {
  put(root, selfRel(n) + '/candidate.json', JSON.stringify({ target, why: 'the killed line of c1', hypothesis: 'the next rate rises', ...extra }));
  if (content !== null) put(root, selfRel(n) + '/file/' + target, content);
}
const wipe = (root, n) => fs.rmSync(path.join(root, selfRel(n)), { recursive: true, force: true });
/** One candidate directory per outcome under work/grow/gen-<m>/<lane>/c<i>/: a cell.mjs and the verdict.json judge/select.mjs writes. */
function verdictFiles(root, m, lane, outcomes) {
  outcomes.forEach((survived, i) => {
    const d = 'work/grow/gen-' + m + '/' + lane + '/c' + i;
    put(root, d + '/cell.mjs', 'export const cell = ' + i + ';\n');
    put(root, d + '/verdict.json', JSON.stringify({ survived, why: survived ? [] : ['held-out score is not above the baseline'] }));
  });
}
function run(root, args) {
  const env = { ...process.env };
  for (const k of ['NODE_TEST_CONTEXT', 'NODE_OPTIONS']) delete env[k];
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { cwd: root, env, encoding: 'utf8', timeout: 120000, windowsHide: true });
  const stdout = String(r.stdout || '');
  let json = null;
  try { json = JSON.parse(stdout.trim().split(/\r?\n/).pop() || ''); } catch { json = null; }
  return { code: r.status, json, stdout, stderr: String(r.stderr || '') };
}
/** A success: exit 0, ONE JSON line on stdout, nothing on stderr. */
function okRun(root, args) {
  const r = run(root, args);
  assert.equal(r.code, 0, args.join(' ') + ': ' + r.stderr + r.stdout);
  assert.equal(lines(r.stdout).length, 1, 'one line: ' + r.stdout);
  assert.ok(r.json && typeof r.json === 'object', 'a JSON line: ' + r.stdout);
  assert.equal(r.stderr, '');
  return r.json;
}
/** A stub with the notes.md trial applied after generation 1 (apply runs the check itself). */
function trialRoot(opts) {
  const root = makeRoot(opts);
  candidate(root, 1, 'grow/notes.md', AFTER);
  const a = okRun(root, ['apply', '--gen', '1']);
  assert.equal(a.applied, true, JSON.stringify(a));
  return root;
}

test('the rules: TARGET_RE, NEVER and judge/LOCK.json in each shape it may take decide the targets; SELF_SUITES names the planted suite', () => {
  for (const t of ['GROW.md', 'grow/notes.md', 'grow/tool.mjs', 'grow/CONTRACT.md', 'grow/a_b-c.d.mjs']) assert.ok(TARGET_RE.test(t), t);
  for (const t of ['README.md', 'grow/rows.jsonl', 'grow/sub/x.mjs', 'judge/judge.mjs', './GROW.md', 'grow/.hidden.mjs', 'grow/x.js', 'GROW.md.bak']) assert.ok(!TARGET_RE.test(t), t);
  assert.deepEqual([...NEVER], ['grow/self.mjs', 'grow/cortex.mjs', 'grow/sandbox.mjs', 'grow/probe.mjs', 'grow/neo.mjs', 'grow/teach.mjs']);
  assert.deepEqual([...KEEP], ['## Done', 'judge/verify.mjs', 'LOCK OK', 'grow/self.mjs', 'grow/cortex.mjs', 'grow/neo.mjs', 'grow/teach.mjs', 'CONCISE']);
  assert.ok(!NEVER.includes('grow/neo-kernel.mjs'), 'the kernel stays a target: a new primitive is the growth surface');
  for (const k of KEEP) assert.ok(GROW_MD.includes(k), 'the stub GROW.md holds ' + k);
  assert.ok(SELF_SUITES.includes(PLANTED) && SELF_SUITES.includes('test/grow-self.test.mjs'));
  for (const s of NEO_SUITES) assert.ok(SELF_SUITES.includes(s), s);
  const root = makeRoot();
  assert.deepEqual(lockedOf(root), ['judge/judge.mjs', 'grow/locked.mjs']);
  assert.deepEqual(neverOf(root), [...NEVER, 'judge/judge.mjs', 'grow/locked.mjs']);
  assert.deepEqual(targetsOf(root), ['GROW.md', 'grow/notes.md', 'grow/tool.mjs'], 'never the NEVER file, the locked file or a .jsonl');
  put(root, 'judge/LOCK.json', JSON.stringify({ files: [{ path: 'grow\\tool.mjs' }, { file: 'GROW.md' }, 7, null] }));
  assert.deepEqual(lockedOf(root), ['grow/tool.mjs', 'GROW.md']);
  assert.deepEqual(targetsOf(root), ['grow/locked.mjs', 'grow/notes.md']);
  put(root, 'judge/LOCK.json', JSON.stringify({ files: { 'grow/notes.md': 'sha' } }));
  assert.deepEqual(lockedOf(root), ['grow/notes.md']);
  fs.rmSync(path.join(root, 'judge/LOCK.json'));
  assert.deepEqual(lockedOf(root), []);
});

test('rateOf sums the lanes (a written rate field does not count); baselineOf is the newest tournament with candidates at or before n; secretHit names a kind, never the string', () => {
  assert.equal(rateOf(null), null);
  assert.equal(rateOf({ generation: 1, lanes: {} }), null);
  assert.equal(rateOf({ generation: 1, lanes: { direct: { candidates: 0, survivors: 0 } } }), null);
  assert.deepEqual(rateOf({ generation: 3, at: 'T', lanes: { direct: { candidates: 2, survivors: 1 }, baked: { candidates: 1, survivors: 0 }, junk: null, odd: { candidates: 1.5, survivors: '1' } } }), { generation: 3, at: 'T', candidates: 3, survivors: 1, rate: 0.3333 });
  assert.equal(rateOf({ generation: 4, rate: 0.9, lanes: { direct: { candidates: 2, survivors: 1 } } }).rate, 0.5, 'the lanes decide');
  const root = makeRoot({ gens: [gen(3, 3, 4), gen(1, 1, 2), gen(2, 0, 0)] });
  assert.deepEqual(baselineOf(root, 1), BASE);
  assert.equal(baselineOf(root, 2).generation, 1, 'a tournament with no candidates is no baseline');
  assert.equal(baselineOf(root, 9).rate, 0.75);
  const shapes = [['sk', 'Q7'.repeat(12)].join('-'), SECRET, 'gh' + 'p_' + 'a'.repeat(36), 'github' + '_pat_' + 'b'.repeat(40), 'AKIA' + 'C'.repeat(16), 'xox' + 'b-' + '1'.repeat(12), '-----BEGIN RSA ' + 'PRIVATE KEY-----', 'sb' + '_secret_' + 'd'.repeat(20), 'eyJ' + 'e'.repeat(20) + '.' + 'f'.repeat(20) + '.' + 'g'.repeat(10)];
  for (const s of shapes) {
    const k = secretHit('before ' + s + ' after');
    assert.equal(typeof k, 'string', s.slice(0, 4));
    assert.ok(k.endsWith('...') && k.length <= 15 && !k.includes(s.slice(-8)), k);
  }
  assert.equal(secretHit('no secret here, sk-short, AKIA1'), null);
});

test('status on a fresh stub: generation from the last recorded tournament, no trial, an empty history, the baseline and the targets', () => {
  const root = makeRoot();
  const s = okRun(root, ['status']);
  assert.deepEqual(Object.keys(s), ['generation', 'next', 'trial', 'history', 'baseline', 'targets', 'at']);
  assert.equal(s.generation, 1);
  assert.equal(s.next, 2);
  assert.equal(s.trial, null);
  assert.deepEqual(s.history, { count: 0, kept: 0, reverted: 0, last: [] });
  assert.deepEqual(s.baseline, BASE);
  assert.deepEqual(s.targets, ['GROW.md', 'grow/notes.md', 'grow/tool.mjs']);
  assert.ok(Number.isFinite(Date.parse(s.at)));
});

test('propose: the SELF BRIEF holds the CONCISE directive and the evidence in its sections, evidence.json the same facts; --gen defaults to the last recorded tournament', () => {
  const root = makeRoot();
  verdictFiles(root, 1, 'direct', [true, false]);
  put(root, 'work/grow/gen-1/direct/c2/cell.mjs', 'export const cell = 2;\n'); // a candidate that never ran
  put(root, 'work/grow/gen-1/direct/notacand/verdict.json', JSON.stringify({ survived: true })); // no cell.mjs: not a candidate
  put(root, 'work/grow/gen-1/build/buildonly/cell.mjs', 'export const b = 1;\n');
  put(root, 'work/grow/gen-1/build/buildonly/verdict.json', JSON.stringify({ survived: false, why: ['not a lane'] }));
  put(root, 'work/grow/gen-1/blocked.txt', 'sandbox: one blocked line\n\n');
  const p = okRun(root, ['propose']);
  assert.deepEqual({ ...p, at: 0 }, { generation: 1, brief: 'work/grow/gen-1/self/brief.md', baseline: BASE, candidates: 3, killed: 2, blocked: [], at: 0 });
  assert.ok(Number.isFinite(Date.parse(p.at)));
  const b = read(root, p.brief).toString('utf8');
  const directive = conciseDirective(root);
  assert.ok(directive.startsWith(DIRECTIVE));
  assert.ok(b.startsWith('# Generation 1, SELF arm: one edit to the procedure, kept only if the next generation\'s survival rate rises\n'));
  assert.ok(b.includes('\n' + directive + '\n'), 'the CONCISE directive, whole');
  const heads = ['## The rule', '## The evidence', '## Where a rate is lost', '## Files you may not open', '## How you validate', '## Your answer'].map((h) => b.indexOf('\n' + h + '\n'));
  assert.ok(heads.every((i) => i > 0), 'a section is missing');
  assert.deepEqual([...heads].sort((x, y) => x - y), heads, 'sections out of order');
  assert.ok(b.indexOf(DIRECTIVE) < heads[0], 'the directive comes before the rule');
  for (const want of ['- The tournaments: generation 1: 1 of 2 survived, rate 0.5.', '  - c0, direct: SURVIVED; survived', '  - c1, direct: killed; held-out score is not above the baseline',
    '  - c2, direct: unrun; no verdict.json (the candidate never ran)', '- Blocked lines of this generation:\n  - sandbox: one blocked line', '- Earlier trials: none.',
    '- The files you may edit: `GROW.md`, `grow/notes.md`, `grow/tool.mjs`.', '`work/grow/gen-1/self/file/<target>`', '`work/grow/gen-1/self/candidate.json`',
    'generation 1: 1 of 2 survived, rate 0.5, or the file goes back', '`node grow/self.mjs check --gen 1`', '"ok":true']) assert.ok(b.includes(want), 'missing: ' + want);
  for (const k of KEEP) assert.ok(b.includes('`' + k + '`'), 'KEEP string not named: ' + k);
  for (const f of ['judge/heldout/', 'judge/control.jsonl', 'state/grow/baseline/']) assert.ok(b.includes(f), f);
  assert.ok(!b.includes('buildonly') && !b.includes('notacand'), 'the build directory and a directory without cell.mjs are not candidates');
  assert.ok(!b.includes(String.fromCharCode(0x2014)), 'an em-dash in the brief');
  const ev = readJson(root, 'work/grow/gen-1/self/evidence.json');
  assert.deepEqual(Object.keys(ev), ['generation', 'baseline', 'rates', 'verdicts', 'blocked', 'history', 'targets', 'at']);
  assert.deepEqual({ ...ev, at: 0 }, {
    generation: 1, baseline: BASE, rates: [BASE], blocked: ['sandbox: one blocked line'], history: [], targets: ['GROW.md', 'grow/notes.md', 'grow/tool.mjs'], at: 0,
    verdicts: [{ id: 'c0', lane: 'direct', survived: true, why: 'survived' }, { id: 'c1', lane: 'direct', survived: false, why: 'held-out score is not above the baseline' }, { id: 'c2', lane: 'direct', survived: null, why: 'no verdict.json (the candidate never ran)' }],
  });
  assert.deepEqual(verdictsOf(root, 1), ev.verdicts);
  assert.ok(!exists(root, LEDGER), 'propose writes no ledger');
  assert.equal(okRun(root, ['propose', '--gen', '1']).brief, p.brief, 'a second propose rewrites the same brief');
});

test('propose refuses (brief null, one blocked line, exit 0, no brief written) with no tournament, a baseline rate of 1, a trial pending, no target', () => {
  const cases = [
    [{ gens: [] }, null, 'self: no tournament to beat yet (no generation with candidates in grown/generations.json)'],
    [{ gens: [gen(1, 0, 0)] }, null, 'self: no tournament to beat yet (no generation with candidates in grown/generations.json)'],
    [{ gens: [gen(1, 2, 2)] }, null, 'self: every candidate of generation 1 survived (rate 1): no edit can raise it, the procedure stands'],
    [{}, (root) => put(root, LEDGER, JSON.stringify({ trial: { generation: 1, target: 'grow/notes.md' }, history: [] })), 'self: a trial is pending (generation 1, grow/notes.md); judge it before proposing another'],
    [{}, (root) => { for (const f of ['GROW.md', 'grow/notes.md', 'grow/tool.mjs']) fs.rmSync(path.join(root, f)); }, (root) => 'self: nothing to edit (no GROW.md and no grow/*.mjs or *.md under ' + path.resolve(root) + ')'],
  ];
  for (const [opts, setup, line] of cases) {
    const root = makeRoot(opts);
    if (setup) setup(root);
    const p = okRun(root, ['propose', '--gen', '1']);
    assert.deepEqual({ ...p, at: 0 }, { generation: 1, brief: null, blocked: [typeof line === 'function' ? line(root) : line], at: 0 });
    assert.ok(!exists(root, selfRel(1)), 'a refused propose writes nothing');
  }
});

test('check refuses, each case with its own one error: exit 1, the JSON line on stdout, nothing on stderr, no check.json, the tree untouched', () => {
  const root = makeRoot();
  const notTarget = (t) => 'target: "' + t + '" is not GROW.md or an .mjs or .md under grow/';
  const cases = [
    ['README.md', 'x\n', notTarget('README.md')],
    ['grow/sub/x.mjs', TOOL, notTarget('grow/sub/x.mjs')],
    ['grow/rows.jsonl', '{}\n{}\n', notTarget('grow/rows.jsonl')],
    ['judge/judge.mjs', TOOL, notTarget('judge/judge.mjs')],
    ...NEVER.map((t) => [t, TOOL + '// an edit\n', 'target: ' + t + ' is never a candidate (it judges the trial or produces what the judge reads)']),
    ['grow/locked.mjs', 'export const y = 3;\n', 'target: grow/locked.mjs is locked (judge/LOCK.json names it; only a human session re-locks)'],
    ['grow/new.mjs', TOOL, 'target: grow/new.mjs does not exist in the tree (an edit, not a new file)'],
    ['grow/tool.mjs', null, 'file: the whole new file is missing at work/grow/gen-1/self/file/grow/tool.mjs'],
    ['grow/notes.md', NOTES, 'file: identical to the tree\'s grow/notes.md (no edit)'],
    ['grow/notes.md', 'x'.repeat(MAX_BYTES + 1), 'file: ' + (MAX_BYTES + 1) + ' bytes, over ' + MAX_BYTES],
    ...KEEP.map((k) => ['GROW.md', GROW_MD.split(k).join(''), 'GROW.md: the candidate dropped "' + k + '"']),
    ...FORBID.map((f) => ['grow/tool.mjs', TOOL + '// see ' + f + '\n', 'file: names ' + f + ' (an arm never opens it; the tree\'s file does not name it)']),
  ];
  for (const [target, content, error] of cases) {
    wipe(root, 1);
    candidate(root, 1, target, content);
    const r = run(root, ['check', '--gen', '1']);
    assert.equal(r.code, 1, target + ': ' + r.stdout + r.stderr);
    assert.equal(lines(r.stdout).length, 1);
    assert.equal(r.stderr, '');
    assert.equal(r.json.ok, false);
    assert.deepEqual(r.json.errors, [error], target);
    assert.equal(r.json.generation, 1);
    assert.equal(r.json.suites, null, 'no suite runs for a refused candidate');
    assert.ok(!exists(root, selfRel(1) + '/check.json'), 'a refused check writes no check.json');
  }
  const meta = [
    [() => put(root, selfRel(1) + '/candidate.json', 'not json'), 'candidate.json: missing or not JSON at work/grow/gen-1/self/candidate.json'],
    [() => {}, 'candidate.json: missing or not JSON at work/grow/gen-1/self/candidate.json'],
    [() => candidate(root, 1, 'grow/notes.md', AFTER, { why: '  ' }), 'why: a non-empty string is required in candidate.json'],
    [() => candidate(root, 1, 'grow/notes.md', AFTER, { hypothesis: 'h'.repeat(MAX_TEXT + 1) }), 'hypothesis: ' + (MAX_TEXT + 1) + ' characters, over ' + MAX_TEXT],
  ];
  for (const [setup, error] of meta) {
    wipe(root, 1);
    setup();
    const r = run(root, ['check', '--gen', '1']);
    assert.equal(r.code, 1, error);
    assert.deepEqual(r.json.errors, [error]);
  }
  for (const [rel, data] of [['GROW.md', GROW_MD], ['grow/notes.md', NOTES], ['grow/tool.mjs', TOOL]]) assert.ok(read(root, rel).equals(Buffer.from(data)), rel + ' changed');
  assert.ok(!exists(root, LEDGER) && !exists(root, KEEP_DIR));
});

test('check: a candidate holding a secret-shaped string is refused by its kind; the string is nowhere in stdout, stderr or check.json; a string the tree already holds is not the candidate\'s', () => {
  const root = makeRoot();
  candidate(root, 1, 'grow/notes.md', Buffer.concat([NOTES, Buffer.from('key ' + SECRET + '\n')]));
  const r = run(root, ['check', '--gen', '1']);
  assert.equal(r.code, 1, r.stdout + r.stderr);
  assert.deepEqual(r.json.errors, ['file: a secret-shaped string is in the candidate (' + secretHit(SECRET) + ')']);
  for (const s of [r.stdout, r.stderr]) assert.ok(!s.includes(SECRET) && !s.includes(SECRET.slice(8)), 'the secret leaked');
  assert.ok(!exists(root, selfRel(1) + '/check.json'));
  // the tree's module already names a secret-shaped string and a FORBID path: a candidate keeping both passes
  const tool = TOOL + '// ' + SECRET + ' judge/control.jsonl\n';
  put(root, 'grow/tool.mjs', tool);
  wipe(root, 1);
  candidate(root, 1, 'grow/tool.mjs', tool + 'export const w = 4;\n');
  const ok = run(root, ['check', '--gen', '1']);
  assert.equal(ok.code, 0, ok.stdout + ok.stderr);
  assert.equal(ok.json.ok, true);
  for (const s of [ok.stdout, ok.stderr, read(root, selfRel(1) + '/check.json').toString('utf8')]) assert.ok(!s.includes(SECRET) && !s.includes(SECRET.slice(8)), 'the secret leaked');
});

test('check: an .mjs candidate that fails node --check is refused with the line that says why, never the Node banner', () => {
  const root = makeRoot();
  candidate(root, 1, 'grow/tool.mjs', 'export const = ;\n');
  const r = run(root, ['check', '--gen', '1']);
  assert.equal(r.code, 1, r.stdout + r.stderr);
  assert.equal(r.json.errors.length, 1, JSON.stringify(r.json.errors));
  assert.ok(r.json.errors[0].startsWith('node --check: '), r.json.errors[0]);
  assert.match(r.json.errors[0], /SyntaxError/, 'the error names the syntax error: ' + r.json.errors[0]);
  assert.doesNotMatch(r.json.errors[0], /Node\.js v\d/);
});

test('check: a candidate under which the planted suite goes red is refused with the tallies and the failing test; check.json records it', () => {
  const root = makeRoot({ suite: true });
  candidate(root, 1, 'grow/notes.md', Buffer.concat([NOTES, Buffer.from(RED + '\n')]));
  const r = run(root, ['check', '--gen', '1']);
  assert.equal(r.code, 1, r.stdout + r.stderr);
  assert.equal(r.stderr, '');
  assert.deepEqual(r.json.errors, ['suites: 1 files, # pass 0, # fail 1, exit 1: failed: ' + PLANTED_NAME]);
  assert.deepEqual({ files: r.json.suites.files, pass: r.json.suites.pass, fail: r.json.suites.fail, exitCode: r.json.suites.exitCode }, { files: 1, pass: 0, fail: 1, exitCode: 1 });
  assert.deepEqual(readJson(root, selfRel(1) + '/check.json'), r.json);
  assert.ok(read(root, 'grow/notes.md').equals(NOTES), 'the scratch copy took the candidate, the tree did not');
});

test('check passes a good candidate: ok true, the sha of the file, the planted suite counted, check.json the same line; zero suites pass on the static rules', () => {
  const root = makeRoot({ suite: true });
  candidate(root, 1, 'grow/notes.md', AFTER);
  const c = okRun(root, ['check']);
  const listed = lines(git(root, ['ls-files', '--cached', '--others', '--exclude-standard']).stdout).length;
  assert.deepEqual({ ...c, at: 0, suites: { ...c.suites, ms: 0 } }, {
    ok: true, errors: [], generation: 1, target: 'grow/notes.md', bytes: AFTER.length, changed: true, sha: sha(AFTER), at: 0,
    suites: { files: 1, copied: listed, pass: 1, fail: 0, exitCode: 0, ms: 0, line: 'ok' },
  });
  assert.ok(Number.isFinite(c.suites.ms) && Number.isFinite(Date.parse(c.at)));
  assert.deepEqual(readJson(root, selfRel(1) + '/check.json'), c);
  assert.ok(read(root, 'grow/notes.md').equals(NOTES), 'check never writes the tree');
  const bare = makeRoot();
  candidate(bare, 1, 'grow/tool.mjs', TOOL + 'export const w = 4;\n');
  const z = okRun(bare, ['check', '--gen', '1']);
  assert.equal(z.ok, true);
  assert.deepEqual({ ...z.suites, ms: 0 }, { files: 0, copied: lines(git(bare, ['ls-files', '--cached', '--others', '--exclude-standard']).stdout).length, pass: null, fail: null, exitCode: null, ms: 0, line: 'no suite to run' });
});

test('apply: the target, grown/self.json with the pending trial and its baseline, the two copies; apply runs its own fresh check; a second apply is refused', () => {
  const root = makeRoot();
  candidate(root, 1, 'grow/notes.md', AFTER);
  const c = okRun(root, ['check', '--gen', '1']);
  const a = okRun(root, ['apply', '--gen', '1']);
  assert.deepEqual({ ...a, at: 0 }, {
    generation: 1, applied: true, next: 2, target: 'grow/notes.md', baseline: BASE,
    before: { file: BEFORE_COPY, sha: sha(NOTES), bytes: NOTES.length }, after: { file: AFTER_COPY, sha: sha(AFTER), bytes: AFTER.length },
    committed: 'skipped (no --commit)', pushed: 'skipped (no --commit)', blocked: [], at: 0,
  });
  assert.ok(read(root, 'grow/notes.md').equals(AFTER));
  assert.ok(read(root, BEFORE_COPY).equals(NOTES));
  assert.ok(read(root, AFTER_COPY).equals(AFTER));
  const l = readJson(root, LEDGER);
  assert.deepEqual(l, { trial: { generation: 1, next: 2, target: 'grow/notes.md', why: 'the killed line of c1', hypothesis: 'the next rate rises', baseline: BASE, before: a.before, after: a.after, check: { suites: { files: 0, pass: null, fail: null, exitCode: null }, at: l.trial.check.at }, appliedAt: a.at }, history: [] });
  assert.ok(Date.parse(l.trial.check.at) >= Date.parse(c.at) && l.trial.check.at === readJson(root, selfRel(1) + '/check.json').at, 'the check apply ran is the one recorded');
  const s = okRun(root, ['status']);
  assert.deepEqual(s.trial, { generation: 1, next: 2, target: 'grow/notes.md', baseline: BASE, appliedAt: a.at });
  const again = okRun(root, ['apply', '--gen', '1']);
  assert.deepEqual({ ...again, at: 0 }, { generation: 1, applied: false, blocked: ['self: a trial is pending (generation 1, grow/notes.md); judge it first'], at: 0 });
  assert.deepEqual(readJson(root, LEDGER), l);
  assert.ok(read(root, 'grow/notes.md').equals(AFTER));
  const p = okRun(root, ['propose', '--gen', '1']);
  assert.deepEqual(p.blocked, ['self: a trial is pending (generation 1, grow/notes.md); judge it before proposing another']);
});

test('apply: next is max(n+1, nextGeneration); refused without a tournament and for a failing candidate; a file edited after its check is checked again', () => {
  const late = makeRoot({ gens: [gen(1, 1, 2), gen(2, 1, 4)] });
  put(late, 'grown/index.json', JSON.stringify({ generation: 5, cells: [] }));
  candidate(late, 1, 'grow/tool.mjs', TOOL + 'export const w = 4;\n');
  const a = okRun(late, ['apply', '--gen', '1']);
  assert.deepEqual({ applied: a.applied, next: a.next, baseline: a.baseline, before: a.before.file, after: a.after.file }, { applied: true, next: 6, baseline: BASE, before: KEEP_DIR + '/trial-1.before.tool.mjs', after: KEEP_DIR + '/trial-1.after.tool.mjs' });
  const two = makeRoot({ gens: [gen(1, 1, 2), gen(2, 1, 4)] });
  candidate(two, 1, 'grow/notes.md', AFTER);
  assert.equal(okRun(two, ['apply', '--gen', '1']).next, 3);
  const none = makeRoot({ gens: [] });
  candidate(none, 1, 'grow/notes.md', AFTER);
  const n0 = okRun(none, ['apply', '--gen', '1']);
  assert.deepEqual({ applied: n0.applied, blocked: n0.blocked }, { applied: false, blocked: ['self: no tournament to beat yet (no generation with candidates in grown/generations.json)'] });
  const bad = makeRoot();
  candidate(bad, 1, 'grow/notes.md', NOTES);
  const b = okRun(bad, ['apply', '--gen', '1']);
  assert.deepEqual({ ...b, at: 0 }, { generation: 1, applied: false, target: 'grow/notes.md', blocked: ['self: file: identical to the tree\'s grow/notes.md (no edit)'], at: 0 });
  for (const r of [none, bad]) {
    assert.ok(!exists(r, LEDGER) && !exists(r, KEEP_DIR), 'a refused apply leaves no trial');
    assert.ok(read(r, 'grow/notes.md').equals(NOTES));
  }
  const ed = makeRoot();
  candidate(ed, 1, 'grow/notes.md', AFTER);
  const c = okRun(ed, ['check', '--gen', '1']);
  put(ed, selfRel(1) + '/file/grow/notes.md', NOTES); // edited back to the tree's bytes after a passing check
  const stale = okRun(ed, ['apply', '--gen', '1']);
  assert.deepEqual(stale.blocked, ['self: file: identical to the tree\'s grow/notes.md (no edit)'], 'a stale ok never lets a changed file through');
  const AFTER2 = Buffer.concat([AFTER, Buffer.from('edited after the check\n')]);
  put(ed, selfRel(1) + '/file/grow/notes.md', AFTER2);
  const e = okRun(ed, ['apply', '--gen', '1']);
  assert.equal(e.applied, true);
  assert.equal(e.after.sha, sha(AFTER2));
  assert.notEqual(readJson(ed, LEDGER).trial.check.at, c.at, 'the check of another file is not reused');
  assert.equal(readJson(ed, selfRel(1) + '/check.json').sha, sha(AFTER2));
  assert.ok(read(ed, 'grow/notes.md').equals(AFTER2));
});

test('apply: a target spelled ./grow/notes.md is the file check graded: apply checks it afresh and the trial names grow/notes.md', () => {
  const root = makeRoot();
  candidate(root, 1, './grow/notes.md', AFTER);
  const c = okRun(root, ['check', '--gen', '1']);
  assert.equal(c.target, 'grow/notes.md');
  const a = okRun(root, ['apply', '--gen', '1']);
  assert.equal(a.applied, true);
  assert.equal(a.target, 'grow/notes.md');
  const t = readJson(root, LEDGER).trial;
  assert.equal(t.target, 'grow/notes.md');
  assert.equal(t.check.at, readJson(root, selfRel(1) + '/check.json').at, 'the check apply ran itself is the one recorded');
});

test('apply: a FORGED check.json (ok true, the right target, sha and generation) is not believed: apply runs its own check', () => {
  const root = makeRoot();
  candidate(root, 1, 'grow/notes.md', NOTES); // no edit at all: a real check refuses it
  put(root, selfRel(1) + '/check.json', JSON.stringify({ ok: true, errors: [], generation: 1, target: 'grow/notes.md', sha: sha(NOTES), suites: { files: 0, pass: 99, fail: 0, exitCode: 0 }, at: '2026-01-01T00:00:00.000Z' }));
  const a = okRun(root, ['apply', '--gen', '1']);
  assert.equal(a.applied, false);
  assert.deepEqual(a.blocked, ['self: file: identical to the tree\'s grow/notes.md (no edit)']);
  assert.equal(fs.existsSync(path.join(root, LEDGER)), false, 'no trial is recorded');
});

test('a MIS-CASED target of a locked or NEVER file is refused by check and apply on any filesystem; the file is never written', () => {
  const root = makeRoot();
  // a case-insensitive filesystem (Windows, macOS) opens grow/Locked.mjs as grow/locked.mjs; a case-sensitive one finds no such file
  const folds = fs.existsSync(path.join(root, 'grow', 'LOCKED.mjs'));
  assert.equal(folds, FS.folds);
  const cases = [
    ['grow/Locked.mjs', 'grow/locked.mjs', 'is locked (judge/LOCK.json names it; only a human session re-locks)'],
    ['grow/SANDBOX.mjs', 'grow/sandbox.mjs', 'is never a candidate (it judges the trial or produces what the judge reads)'],
  ];
  for (const [target, onDisk, why] of cases) {
    const original = read(root, onDisk);
    const error = folds ? 'target: ' + target + ' (on disk ' + onDisk + ') ' + why : 'target: ' + target + ' does not exist in the tree (an edit, not a new file)';
    wipe(root, 1);
    candidate(root, 1, target, 'export const y = "overwritten through ' + target + '";\n');
    const c = run(root, ['check', '--gen', '1']);
    assert.equal(c.code, 1, target + ': ' + c.stdout + c.stderr);
    assert.deepEqual(c.json.errors, [error], target);
    assert.ok(!exists(root, selfRel(1) + '/check.json'));
    // a check.json the arm wrote itself names the mis-cased target with ok true: apply resolves and checks again
    put(root, selfRel(1) + '/check.json', JSON.stringify({ ok: true, errors: [], generation: 1, target, sha: sha(read(root, selfRel(1) + '/file/' + target)), at: AT }));
    const a = okRun(root, ['apply', '--gen', '1']);
    assert.deepEqual({ applied: a.applied, blocked: a.blocked }, { applied: false, blocked: ['self: ' + error] }, target);
    assert.ok(read(root, onDisk).equals(original), onDisk + ' was written through ' + target);
    assert.ok(!exists(root, LEDGER) && !exists(root, KEEP_DIR), 'a refused apply leaves no trial');
  }
  assert.equal(git(root, ['status', '--porcelain', '--', 'grow']).stdout, '', 'nothing under grow/ changed');
});

test('a mis-cased target of an editable file is the file on disk: check grades it, apply writes it and records the stored name', { skip: !FS.folds && 'a case-sensitive filesystem: the mis-cased name does not resolve (the refusal above covers it)' }, () => {
  const root = makeRoot();
  candidate(root, 1, 'grow/NOTES.md', AFTER);
  const c = okRun(root, ['check', '--gen', '1']);
  assert.equal(c.target, 'grow/notes.md');
  const a = okRun(root, ['apply', '--gen', '1']);
  assert.deepEqual({ applied: a.applied, target: a.target, before: a.before.file }, { applied: true, target: 'grow/notes.md', before: BEFORE_COPY });
  assert.ok(read(root, 'grow/notes.md').equals(AFTER));
  const t = readJson(root, LEDGER).trial;
  assert.deepEqual({ target: t.target, named: t.named, check: t.check.at }, { target: 'grow/notes.md', named: 'grow/NOTES.md', check: readJson(root, selfRel(1) + '/check.json').at });
  assert.deepEqual(fs.readdirSync(path.join(root, 'grow')).filter((f) => f.toLowerCase() === 'notes.md'), ['notes.md'], 'no second spelling was created');
});

test('resolveTarget: the stored path, relative and posix; outside the tree, missing, a directory and a hard link to a locked file are refused', () => {
  const root = makeRoot();
  const ok = resolveTarget(root, 'grow/notes.md');
  assert.deepEqual({ rel: ok.rel, error: ok.error }, { rel: 'grow/notes.md', error: null });
  assert.ok(read(root, 'grow/notes.md').equals(fs.readFileSync(ok.abs)));
  assert.deepEqual(resolveTarget(root, 'grow/new.mjs'), { rel: null, abs: null, error: 'target: grow/new.mjs does not exist in the tree (an edit, not a new file)' });
  assert.equal(resolveTarget(root, '../x.mjs').error, fs.existsSync(path.join(root, '..', 'x.mjs')) ? 'target: ../x.mjs resolves outside the tree' : 'target: ../x.mjs does not exist in the tree (an edit, not a new file)');
  const outside = put(fs.mkdtempSync(path.join(os.tmpdir(), 'grow-self-out-')), 'x.mjs', TOOL);
  roots.add(path.dirname(outside));
  assert.equal(resolveTarget(root, path.relative(root, outside).split(path.sep).join('/')).error, 'target: ' + path.relative(root, outside).split(path.sep).join('/') + ' resolves outside the tree');
  fs.mkdirSync(path.join(root, 'grow', 'dir.md'));
  assert.equal(resolveTarget(root, 'grow/dir.md').error, 'target: grow/dir.md is not a file');
  // a hard link has no other path to resolve to: the file identity is what names it locked
  fs.linkSync(path.join(root, 'grow', 'locked.mjs'), path.join(root, 'grow', 'alias.mjs'));
  assert.equal(resolveTarget(root, 'grow/alias.mjs').error, 'target: grow/alias.mjs is locked (judge/LOCK.json names it; only a human session re-locks)');
  fs.linkSync(path.join(root, 'grow', 'sandbox.mjs'), path.join(root, 'grow', 'box.md'));
  assert.equal(resolveTarget(root, 'grow/box.md').error, 'target: grow/box.md is never a candidate (it judges the trial or produces what the judge reads)');
  candidate(root, 1, 'grow/alias.mjs', 'export const y = 9;\n');
  const a = okRun(root, ['apply', '--gen', '1']);
  assert.equal(a.applied, false);
  assert.ok(read(root, 'grow/locked.mjs').equals(Buffer.from('export const y = 2;\n')));
});

test('a symbolic link under grow/ to a judge file resolves to that file and is refused', { skip: !FS.link && 'this filesystem refuses a symbolic link without a privilege' }, () => {
  const root = makeRoot();
  put(root, 'judge/judge.mjs', 'export const judge = 1;\n');
  fs.symlinkSync(path.join(root, 'judge', 'judge.mjs'), path.join(root, 'grow', 'link.mjs'));
  fs.symlinkSync(path.join(root, 'grow', 'locked.mjs'), path.join(root, 'grow', 'soft.mjs'));
  assert.equal(resolveTarget(root, 'grow/link.mjs').error, 'target: grow/link.mjs (on disk judge/judge.mjs) is not GROW.md or an .mjs or .md under grow/');
  assert.equal(resolveTarget(root, 'grow/soft.mjs').error, 'target: grow/soft.mjs (on disk grow/locked.mjs) is locked (judge/LOCK.json names it; only a human session re-locks)');
  candidate(root, 1, 'grow/link.mjs', 'export const judge = 2;\n');
  assert.equal(okRun(root, ['apply', '--gen', '1']).applied, false);
  assert.ok(read(root, 'judge/judge.mjs').equals(Buffer.from('export const judge = 1;\n')));
});

test('the NEO guard: grow/neo.mjs and grow/teach.mjs are never targets, grow/neo-kernel.mjs is; a NEO suite runs only when the checked root holds it', () => {
  const root = makeRoot();
  for (const f of ['grow/neo.mjs', 'grow/teach.mjs', 'grow/neo-kernel.mjs']) put(root, f, TOOL);
  assert.deepEqual(targetsOf(root), ['GROW.md', 'grow/neo-kernel.mjs', 'grow/notes.md', 'grow/tool.mjs']);
  for (const f of ['grow/neo.mjs', 'grow/teach.mjs']) {
    wipe(root, 1);
    candidate(root, 1, f, TOOL + 'export const w = 4;\n');
    assert.deepEqual(run(root, ['check', '--gen', '1']).json.errors, ['target: ' + f + ' is never a candidate (it judges the trial or produces what the judge reads)']);
  }
  wipe(root, 1);
  candidate(root, 1, 'GROW.md', GROW_MD.split('grow/teach.mjs').join('the teacher'));
  assert.deepEqual(run(root, ['check', '--gen', '1']).json.errors, ['GROW.md: the candidate dropped "grow/teach.mjs"']);
  // no NEO suite in the root: nothing to run is no failure; one planted: it runs and counts, the absent two are skipped
  assert.deepEqual(pick(suitesWith(root, 'grow/tool.mjs', TOOL + 'export const w = 4;\n')), { files: 0, pass: null, fail: null, exitCode: null, line: 'no suite to run' });
  put(root, 'test/neo.test.mjs', ["import { test } from 'node:test';", "import assert from 'node:assert/strict';", "import fs from 'node:fs';", "test('neo planted', () => assert.ok(fs.readFileSync('grow/tool.mjs', 'utf8').includes('w = 4')));", ''].join('\n'));
  assert.deepEqual(pick(suitesWith(root, 'grow/tool.mjs', TOOL + 'export const w = 4;\n')), { files: 1, pass: 1, fail: 0, exitCode: 0, line: 'ok' });
  assert.deepEqual(pick(suitesWith(root, 'grow/tool.mjs', TOOL + 'export const w = 5;\n')), { files: 1, pass: 0, fail: 1, exitCode: 1, line: 'failed: neo planted' });
});

test('apply --commit --no-push: exactly one commit as jayden, the subject and the trailer, holding only the target, the ledger and the two copies', () => {
  const root = makeRoot();
  assert.equal(git(root, ['config', 'user.email', 'tester@example.invalid']).status, 0);
  put(root, 'other.txt', 'staged, not the trial\n');
  assert.equal(git(root, ['add', 'other.txt']).status, 0);
  put(root, 'GROW.md', GROW_MD + 'an unstaged edit\n');
  candidate(root, 1, 'grow/notes.md', AFTER);
  const head = git(root, ['rev-parse', 'HEAD']).stdout.trim();
  const a = okRun(root, ['apply', '--gen', '1', '--commit', '--no-push']);
  assert.deepEqual({ applied: a.applied, committed: a.committed, pushed: a.pushed, blocked: a.blocked }, { applied: true, committed: true, pushed: 'skipped (--no-push)', blocked: [] });
  assert.equal(git(root, ['rev-list', '--count', head + '..HEAD']).stdout.trim(), '1');
  const log = git(root, ['log', '-1', '--format=%an%n%ae%n%s%n%b']).stdout.split(/\r?\n/);
  assert.deepEqual(log.slice(0, 3), ['jayden', 'tester@example.invalid', 'self: trial grow/notes.md after gen 1 (baseline 0.5)']);
  assert.ok(log.slice(3).includes(TRAILER), 'the trailer: ' + log.join(' | '));
  assert.deepEqual(lines(git(root, ['show', '--name-only', '--format=', 'HEAD']).stdout).sort(), ['grow/notes.md', LEDGER, AFTER_COPY, BEFORE_COPY].sort());
  assert.deepEqual(lines(git(root, ['diff', '--cached', '--name-only']).stdout), ['other.txt'], 'what was staged before stays staged, uncommitted');
  assert.equal(git(root, ['status', '--porcelain', '--', 'grow/notes.md', LEDGER, KEEP_DIR]).stdout.trim(), '');
  assert.equal(git(root, ['status', '--porcelain', '--', 'GROW.md']).stdout.trim(), 'M GROW.md');
});

test('judge: pending while the generation ran before the trial, is not recorded, or recorded zero candidates; nothing moves; a later generation then judges', () => {
  const root = trialRoot();
  const before = readJson(root, LEDGER);
  const pending = (m, reason) => {
    const j = okRun(root, ['judge', '--gen', String(m)]);
    assert.deepEqual({ ...j, at: 0 }, { generation: m, verdict: 'pending', target: 'grow/notes.md', baseline: BASE, reason, ship: [], at: 0 });
  };
  pending(1, 'generation 1 did not run under the trial (applied after generation 1); generation 2 or later judges');
  pending(2, 'generation 2 is not recorded in grown/generations.json');
  record(root, gen(2, 0, 0));
  pending(2, 'generation 2 had no candidates');
  assert.deepEqual(readJson(root, LEDGER), before);
  assert.ok(read(root, 'grow/notes.md').equals(AFTER) && exists(root, BEFORE_COPY) && exists(root, AFTER_COPY));
  record(root, gen(3, 3, 4));
  assert.equal(okRun(root, ['judge', '--gen', '3']).verdict, 'kept');
});

test('judge: KEPT when the judged rate is above the baseline: the file stays, the copies leave, the history holds the trial with its verdict', () => {
  const root = trialRoot();
  const trial = readJson(root, LEDGER).trial;
  record(root, gen(2, 3, 4));
  const k = okRun(root, ['judge']); // --gen defaults to the last recorded tournament
  const judged = { generation: 2, at: AT, candidates: 4, survivors: 3, rate: 0.75 };
  assert.deepEqual({ ...k, at: 0 }, { generation: 2, verdict: 'kept', target: 'grow/notes.md', baseline: BASE, judged, reason: 'rate 0.75 (3 of 4) is above the baseline 0.5', ship: [], at: 0 });
  assert.ok(read(root, 'grow/notes.md').equals(AFTER));
  assert.ok(!exists(root, BEFORE_COPY) && !exists(root, AFTER_COPY), 'the copies leave with the verdict');
  const l = readJson(root, LEDGER);
  assert.equal(l.trial, null);
  assert.deepEqual(l.history, [{ ...trial, verdict: 'kept', judged, reason: k.reason, judgedAt: k.at }]);
});

test('judge: REVERTED when the judged rate equals or is below the baseline: the before bytes are written back, ship names the target, the copies leave', () => {
  for (const [s, c, rate] of [[1, 2, 0.5], [1, 4, 0.25], [0, 3, 0]]) {
    const root = trialRoot();
    record(root, gen(2, s, c));
    const r = okRun(root, ['judge', '--gen', '2']);
    assert.deepEqual({ verdict: r.verdict, ship: r.ship, rate: r.judged.rate }, { verdict: 'reverted', ship: ['grow/notes.md'], rate });
    assert.equal(r.reason, 'rate ' + rate + ' (' + s + ' of ' + c + ') is not above the baseline 0.5; grow/notes.md written back');
    assert.ok(read(root, 'grow/notes.md').equals(NOTES), 'byte for byte, CRLF and all');
    assert.ok(!exists(root, BEFORE_COPY) && !exists(root, AFTER_COPY));
    const l = readJson(root, LEDGER);
    assert.equal(l.trial, null);
    assert.deepEqual(l.history.map((h) => [h.verdict, h.target, h.judged.rate]), [['reverted', 'grow/notes.md', rate]]);
  }
});

test('judge: SUPERSEDED when the target is no longer the trial\'s after text (edited or deleted): the file is left as it is', () => {
  const root = trialRoot();
  const edit = Buffer.from('someone else edited this\n');
  put(root, 'grow/notes.md', edit);
  record(root, gen(2, 0, 4)); // a rate that would revert: superseded wins, nothing is written back
  const r = okRun(root, ['judge', '--gen', '2']);
  assert.deepEqual({ verdict: r.verdict, ship: r.ship }, { verdict: 'superseded', ship: [] });
  assert.equal(r.reason, 'grow/notes.md changed since the trial (sha ' + sha(edit).slice(0, 12) + ' is not the trial\'s ' + sha(AFTER).slice(0, 12) + '); left as it is');
  assert.ok(read(root, 'grow/notes.md').equals(edit));
  assert.ok(!exists(root, BEFORE_COPY) && !exists(root, AFTER_COPY));
  assert.deepEqual(readJson(root, LEDGER).history.map((h) => h.verdict), ['superseded']);
  const gone = trialRoot();
  fs.rmSync(path.join(gone, 'grow/notes.md'));
  record(gone, gen(2, 3, 4));
  assert.equal(okRun(gone, ['judge', '--gen', '2']).verdict, 'superseded');
  assert.ok(!exists(gone, 'grow/notes.md'), 'a deleted target is not recreated');
});

test('judge: a trial that did not hold with its before copy missing or changed stays pending; nothing is written', () => {
  for (const spoil of [(root) => fs.rmSync(path.join(root, BEFORE_COPY)), (root) => put(root, BEFORE_COPY, 'tampered\n')]) {
    const root = trialRoot();
    spoil(root);
    const before = readJson(root, LEDGER);
    record(root, gen(2, 0, 2));
    const r = okRun(root, ['judge', '--gen', '2']);
    assert.equal(r.verdict, 'pending');
    assert.equal(r.reason, 'the trial did not hold and ' + BEFORE_COPY + ' is missing or changed: a human session restores grow/notes.md');
    assert.ok(read(root, 'grow/notes.md').equals(AFTER));
    assert.deepEqual(readJson(root, LEDGER), before);
    assert.ok(exists(root, AFTER_COPY));
  }
});

test('judge, the FORGED rule: a record claiming more survivors or fewer candidates than the verdict files is reverted; none on disk, a withdrawn class, another lane are trusted', () => {
  const cases = [
    [gen(2, 3, 4), [['direct', [true, false, false, false]]], 'reverted', 'the record (3 of 4) is not what the judge wrote (1 of 4 in the verdict files); grow/notes.md written back'],
    [gen(2, 2, 2), [['direct', [true, true, false, false]]], 'reverted', 'the record (2 of 2) is not what the judge wrote (2 of 4 in the verdict files); grow/notes.md written back'],
    [gen(2, 3, 4), [], 'kept', 'rate 0.75 (3 of 4) is above the baseline 0.5'], // a fresh cloud checkout: no verdict file on disk
    [gen(2, 3, 4), [['direct', [true, true, true, false]]], 'kept', 'rate 0.75 (3 of 4) is above the baseline 0.5'], // the files agree
    [gen(2, 3, 5), [['direct', [true, true, true, false]]], 'kept', 'rate 0.6 (3 of 5) is above the baseline 0.5'], // a withdrawn class has no verdict file and still counts
    [gen(2, 3, 4), [['baked', [false, false, false, false]]], 'kept', 'rate 0.75 (3 of 4) is above the baseline 0.5'], // a lane the record does not name
  ];
  for (const [entry, files, verdict, reason] of cases) {
    const root = trialRoot();
    record(root, entry);
    for (const [lane, outcomes] of files) verdictFiles(root, 2, lane, outcomes);
    put(root, 'work/grow/gen-2/direct/nocell/verdict.json', JSON.stringify({ survived: false })); // no cell.mjs: never counted
    const r = okRun(root, ['judge', '--gen', '2']);
    assert.deepEqual({ verdict: r.verdict, reason: r.reason }, { verdict, reason }, JSON.stringify(entry) + ' ' + JSON.stringify(files));
    assert.ok(read(root, 'grow/notes.md').equals(verdict === 'kept' ? AFTER : NOTES));
    assert.deepEqual(r.judged, rateOf(entry), 'the record\'s rate is reported, trusted or not');
  }
  const root = makeRoot();
  verdictFiles(root, 2, 'direct', [true, false]);
  verdictFiles(root, 2, 'baked', [true]);
  put(root, 'work/grow/gen-2/self/x/cell.mjs', '');
  put(root, 'work/grow/gen-2/self/x/verdict.json', JSON.stringify({ survived: true }));
  assert.deepEqual(judgedOf(root, 2), { candidates: 3, survivors: 2 });
  assert.deepEqual(judgedOf(root, 2, ['direct']), { candidates: 2, survivors: 1 });
  assert.equal(judgedOf(root, 3), null);
});

test('judge with no ledger is none; after a revert whose commit never landed the next judge still ships the target, until the file moves', () => {
  const fresh = makeRoot();
  const n = okRun(fresh, ['judge', '--gen', '1']);
  assert.deepEqual({ ...n, at: 0 }, { generation: 1, verdict: 'none', target: null, reason: 'no trial pending', ship: [], at: 0 });
  assert.ok(!exists(fresh, LEDGER), 'judge with no trial writes no ledger');
  const root = trialRoot();
  record(root, gen(2, 1, 4));
  assert.deepEqual(okRun(root, ['judge', '--gen', '2']).ship, ['grow/notes.md']);
  const again = okRun(root, ['judge', '--gen', '2']);
  assert.deepEqual({ verdict: again.verdict, ship: again.ship }, { verdict: 'none', ship: ['grow/notes.md'] });
  assert.deepEqual(shipOf(root), ['grow/notes.md']);
  put(root, 'grow/notes.md', 'a later edit\n');
  assert.deepEqual(okRun(root, ['judge', '--gen', '2']).ship, []);
  const kept = trialRoot();
  record(kept, gen(2, 3, 4));
  assert.equal(okRun(kept, ['judge', '--gen', '2']).verdict, 'kept');
  assert.deepEqual(okRun(kept, ['judge', '--gen', '2']).ship, [], 'a kept trial ships nothing more');
});

test('a full cycle in one stub: propose, a candidate, check on the planted suite, apply, a recorded generation, kept; a second trial reverted; status prints both', () => {
  const root = makeRoot({ suite: true });
  const p1 = okRun(root, ['propose']);
  assert.equal(p1.generation, 1);
  const b1 = read(root, p1.brief).toString('utf8');
  assert.ok(b1.includes(DIRECTIVE) && b1.includes('`work/grow/gen-1/self/candidate.json`'));
  const ONE = Buffer.concat([NOTES, Buffer.from('cycle one\n')]);
  candidate(root, 1, 'grow/notes.md', ONE); // where the brief says: self/candidate.json and self/file/<target>
  const c1 = okRun(root, ['check']);
  assert.deepEqual({ ok: c1.ok, files: c1.suites.files, pass: c1.suites.pass, fail: c1.suites.fail }, { ok: true, files: 1, pass: 1, fail: 0 });
  const a1 = okRun(root, ['apply']);
  assert.deepEqual({ applied: a1.applied, next: a1.next, rate: a1.baseline.rate }, { applied: true, next: 2, rate: 0.5 });
  record(root, gen(2, 3, 4));
  const j1 = okRun(root, ['judge']);
  assert.deepEqual({ generation: j1.generation, verdict: j1.verdict }, { generation: 2, verdict: 'kept' });
  const p2 = okRun(root, ['propose']);
  assert.deepEqual({ generation: p2.generation, brief: p2.brief, rate: p2.baseline.rate }, { generation: 2, brief: 'work/grow/gen-2/self/brief.md', rate: 0.75 });
  const b2 = read(root, p2.brief).toString('utf8');
  assert.ok(b2.includes('  - generation 1, grow/notes.md: kept (baseline 0.5, generation 2 rate 0.75); why: the killed line of c1'), 'the earlier trial is evidence');
  assert.ok(b2.includes('- This generation\'s candidates: none on disk'));
  const TWO = GROW_MD + 'One more rule for the cortex.\n';
  candidate(root, 2, 'GROW.md', TWO, { why: 'the second why' });
  assert.equal(okRun(root, ['check']).ok, true);
  const a2 = okRun(root, ['apply']);
  assert.deepEqual({ applied: a2.applied, generation: a2.generation, next: a2.next, rate: a2.baseline.rate, before: a2.before.file }, { applied: true, generation: 2, next: 3, rate: 0.75, before: KEEP_DIR + '/trial-2.before.GROW.md' });
  assert.equal(read(root, 'GROW.md').toString('utf8'), TWO);
  record(root, gen(3, 1, 4));
  const j2 = okRun(root, ['judge']);
  assert.deepEqual({ generation: j2.generation, verdict: j2.verdict, ship: j2.ship }, { generation: 3, verdict: 'reverted', ship: ['GROW.md'] });
  assert.ok(read(root, 'GROW.md').equals(Buffer.from(GROW_MD)));
  assert.ok(read(root, 'grow/notes.md').equals(ONE), 'the kept trial stays');
  const s = okRun(root, ['status']);
  assert.deepEqual({ generation: s.generation, next: s.next, trial: s.trial, rate: s.baseline.rate }, { generation: 3, next: 4, trial: null, rate: 0.25 });
  assert.deepEqual(s.history, { count: 2, kept: 1, reverted: 1, last: [
    { generation: 1, target: 'grow/notes.md', verdict: 'kept', judged: { generation: 2, at: AT, candidates: 4, survivors: 3, rate: 0.75 } },
    { generation: 2, target: 'GROW.md', verdict: 'reverted', judged: { generation: 3, at: AT, candidates: 4, survivors: 1, rate: 0.25 } },
  ] });
  assert.deepEqual(fs.readdirSync(path.join(root, KEEP_DIR)), [], 'no copy is left once both are judged');
});

test('parseArgs and the CLI: an unknown flag, --gen 0 and a valued boolean exit 2 with one stderr line; --help prints the usage', () => {
  assert.deepEqual(parseArgs(['apply', '--gen=3', '--commit', '--no-push', 'extra']), { verb: 'apply', pos: ['extra'], flags: { gen: '3', commit: true, 'no-push': true } });
  assert.deepEqual(parseArgs(['-h']), { verb: undefined, pos: [], flags: { help: true } });
  for (const [argv, line] of [[['judge', '--bogus'], 'unknown flag --bogus (--help)'], [['judge', '--gen'], '--gen needs a value'], [['judge', '--gen='], '--gen needs a value'], [['apply', '--commit=yes'], '--commit takes no value']]) {
    assert.throws(() => parseArgs(argv), (e) => e.code === 2 && e.message === line, argv.join(' '));
  }
  const root = makeRoot();
  for (const [args, line] of [[['judge', '--bogus'], 'unknown flag --bogus (--help)'], [['judge', '--gen', '0'], '--gen is an integer from 1, not 0'], [['propose', '--gen', '1.5'], '--gen is an integer from 1, not 1.5'],
    [['apply', '--commit=yes'], '--commit takes no value'], [['grow'], 'unknown verb grow: status, propose, check, apply or judge (--help)']]) {
    const r = run(root, args);
    assert.equal(r.code, 2, args.join(' ') + ': ' + r.stdout + r.stderr);
    assert.equal(r.stdout, '');
    assert.deepEqual(lines(r.stderr), [line]);
  }
  assert.ok(!exists(root, 'work') && !exists(root, LEDGER), 'a refused command writes nothing');
  for (const args of [['--help'], ['help'], []]) {
    const h = run(root, args);
    assert.equal(h.code, 0, args.join(' '));
    assert.equal(h.stdout.trim(), USAGE);
  }
});
