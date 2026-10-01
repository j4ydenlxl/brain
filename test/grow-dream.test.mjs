// test/grow-dream.test.mjs: the DREAM step (grow/dream.mjs, GROW.md step 7) against a stub tree.
// Every test builds a temporary root: copies of grow/contract.mjs, grow/generation.mjs, grow/misses.mjs,
// act/converse.mjs, judge/judge.mjs, judge/verify.mjs and CLAUDE.md, a STUB judge/baseline.mjs whose organism answers
// only the prompts named in STUB_ANSWERS (and throws under STUB_THROW), a dev and a held-out set for class alpha (the
// held-out prompts are sentinels a brief may never carry), a dev set only for class beta, and grown/ at generation 1.
// The CLI runs with --root <tmp>, so nothing here reaches the real grown/, judge/ or grow/dreams.jsonl.
// Author: Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01), his NEXT-WEEK.md step 7.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { FILE_ID, idPrefix, checkText, USAGE } from '../grow/dream.mjs';

const BRAIN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(BRAIN, 'grow', 'dream.mjs');
const DIRECTIVE = '[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]';
const COPIES = ['grow/contract.mjs', 'grow/generation.mjs', 'grow/misses.mjs', 'act/converse.mjs', 'judge/judge.mjs', 'judge/verify.mjs', 'CLAUDE.md'];
const DEV_ALPHA = [
  { q: 'the capital of Peru', expect: { contains: ['Lima'], notRefusal: true } },
  { q: 'the capital of Chile', expect: { contains: ['Santiago'], maxWords: 5 } },
  { q: 'capital of Kenya', expect: { equals: 'Nairobi' } },
];
const HELDOUT_ALPHA = ['HELDOUT-SENTINEL-alpha-1', 'HELDOUT-SENTINEL-alpha-2'];
const DEV_BETA = [{ q: 'DEVQ-beta-one', expect: { minWords: 3, notRefusal: true } }];
const GOOD = [
  { q: 'the capital of Mongolia', expect: { contains: ['Ulaanbaatar'], maxWords: 5 }, answer: 'Ulaanbaatar' },
  { q: 'capital of Bhutan', expect: { containsAny: ['Thimphu', 'Thimpu'], notRefusal: true }, answer: 'Thimphu' },
  { q: 'Laos capital', expect: { equals: 'Vientiane' }, answer: 'Vientiane' },
];
const GOOD_BETA = [{ q: 'a beta task past the cells', expect: { minWords: 3, notRefusal: true }, answer: 'three whole words' }];
const STUB_BASELINE = `import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PACK = path.join(ROOT, 'no-pack-here');
export async function runOrganism(rows, opts = {}) {
  fs.appendFileSync(path.join(ROOT, 'asked.log'), JSON.stringify({ qs: rows.map((r) => r.q), knowledge: opts.knowledge === undefined ? 'undefined' : opts.knowledge }) + '\\n');
  if (process.env.STUB_THROW) throw new Error('stub organism down');
  const a = (process.env.STUB_ANSWERS || '').split('|').filter(Boolean);
  return { rows: rows.map((r) => ({ q: r.q, got: a.includes(r.q) ? 'stub organism: ' + r.q : 'nothing in memory matches ' + r.q, route: 'stub-route', via: 'ask' })), grown: 0 };
}
`;

const jsonl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); return f; };
const clean = (root) => fs.rmSync(root, { recursive: true, force: true });
const readJsonl = (f) => fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l));
const asked = (root) => { try { return readJsonl(path.join(root, 'asked.log')); } catch { return []; } };

function makeRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-dream-'));
  for (const rel of COPIES) put(root, rel, fs.readFileSync(path.join(BRAIN, rel)));
  put(root, 'judge/baseline.mjs', STUB_BASELINE);
  put(root, 'judge/dev/alpha.jsonl', jsonl(DEV_ALPHA));
  put(root, 'judge/heldout/alpha.jsonl', jsonl(HELDOUT_ALPHA.map((q) => ({ q, expect: { minWords: 1 } }))));
  put(root, 'judge/dev/beta.jsonl', jsonl(DEV_BETA));
  put(root, 'grown/index.json', JSON.stringify({ generation: 1, cells: [] }));
  put(root, 'grown/generations.json', JSON.stringify({ generations: [{ generation: 1, parent: 'direct', lanes: {}, misses: [] }] }));
  return root;
}
function envOf(extra = {}) {
  const env = { ...process.env };
  for (const k of ['NODE_TEST_CONTEXT', 'NODE_OPTIONS']) delete env[k];
  for (const k of Object.keys(env)) if (k.startsWith('STUB_')) delete env[k];
  return { ...env, ...extra };
}
function run(root, args, extra = {}) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args, '--root', root], { cwd: root, env: envOf(extra), encoding: 'utf8', timeout: 60000, windowsHide: true });
  const line = String(r.stdout || '').trim().split(/\r?\n/).pop() || '';
  let json = null;
  try { json = JSON.parse(line); } catch { json = null; }
  return { code: r.status, json, stdout: r.stdout || '', stderr: r.stderr || '' };
}
const dreamFile = (root, cls, rows, n = 2) => put(root, 'work/grow/gen-' + n + '/dream/' + cls + '.jsonl', typeof rows === 'string' ? rows : jsonl(rows));

test('propose: one brief per class with both sets, beta blocked, generation defaults to 2, k defaults to 4', () => {
  const root = makeRoot();
  try {
    const r = run(root, ['propose']);
    assert.equal(r.code, 0, r.stderr);
    for (const k of ['generation', 'perClass', 'classes', 'briefs', 'blocked', 'at']) assert.ok(k in r.json, 'missing ' + k);
    assert.equal(r.json.generation, 2);
    assert.equal(r.json.perClass, 4);
    assert.deepEqual(r.json.classes, ['alpha']);
    assert.deepEqual(r.json.briefs, ['work/grow/gen-2/dream/brief-alpha.md']);
    assert.deepEqual(r.json.blocked, ['no held-out set: beta: a human session adds truth']);
    assert.ok(fs.existsSync(path.join(root, 'work/grow/gen-2/dream/brief-alpha.md')));
    assert.ok(!fs.existsSync(path.join(root, 'work/grow/gen-2/dream/brief-beta.md')));
    assert.ok(Number.isFinite(Date.parse(r.json.at)));
  } finally { clean(root); }
});

test('propose: the brief holds the title, the CONCISE directive, the dev rows verbatim, the one file, the sections in order, never a held-out row', () => {
  const root = makeRoot();
  try {
    const r = run(root, ['propose', '--per-class', '3', '--gen', '5']);
    assert.equal(r.code, 0, r.stderr);
    const b = fs.readFileSync(path.join(root, r.json.briefs[0]), 'utf8');
    assert.ok(b.startsWith('# Generation 5, DREAM arm, class alpha: propose and solve 3 tasks\n'));
    assert.ok(b.includes(DIRECTIVE));
    assert.ok(b.includes('exactly ONE file, `work/grow/gen-5/dream/alpha.jsonl`'));
    assert.ok(b.includes('GROW.md step 7'));
    for (const row of DEV_ALPHA) assert.ok(b.includes(JSON.stringify(row)), 'dev row missing: ' + row.q);
    assert.ok(b.includes('```jsonl'));
    assert.ok(b.includes('what those rows share'));
    for (const c of ['equals', 'contains', 'containsAny', 'notContains', 'minWords', 'maxWords', 'notRefusal']) assert.ok(b.includes('- `' + c + '`:'), 'clause undefined: ' + c);
    assert.ok(b.includes('node grow/generation.mjs ask "<q>"'));
    assert.ok(b.includes('node grow/dream.mjs check work/grow/gen-5/dream/alpha.jsonl'));
    assert.ok(b.includes('"ok":true'));
    for (const f of ['judge/heldout/', 'judge/control.jsonl', 'state/grow/baseline/']) assert.ok(b.includes(f));
    const order = ['## The class', '## What a dreamed task is', '## Files you may not open', '## How you validate', '## Your answer'].map((h) => b.indexOf(h));
    assert.ok(order.every((i) => i > 0), 'a section is missing');
    assert.deepEqual([...order].sort((x, y) => x - y), order, 'sections out of order');
    assert.ok(b.indexOf(DIRECTIVE) < order[0], 'the directive comes before the class');
    for (const q of HELDOUT_ALPHA) assert.ok(!b.includes(q), 'a held-out prompt reached the brief');
    assert.ok(!b.includes(String.fromCharCode(0x2014)), 'an em-dash in the brief');
  } finally { clean(root); }
});

test('propose: --per-class out of 1 to 12, a bad --gen, a bad --classes and an unknown flag exit 2 with one stderr line', () => {
  const root = makeRoot();
  try {
    for (const args of [['--per-class', '0'], ['--per-class', '13'], ['--per-class', 'x'], ['--gen', '0'], ['--classes', 'Alpha'], ['--classes', 'alpha,alpha'], ['--bogus', '1']]) {
      const r = run(root, ['propose', ...args]);
      assert.equal(r.code, 2, args.join(' ') + ': ' + r.stdout);
      assert.equal(r.stdout.trim(), '');
      assert.equal(r.stderr.trim().split(/\r?\n/).length, 1);
    }
    assert.ok(!fs.existsSync(path.join(root, 'work')), 'a refused propose wrote a brief');
    for (const k of ['1', '12']) assert.equal(run(root, ['propose', '--per-class', k]).json.perClass, Number(k));
  } finally { clean(root); }
});

test('propose --classes: a named class with no held-out set is blocked and gets no brief', () => {
  const root = makeRoot();
  try {
    const r = run(root, ['propose', '--classes', 'beta']);
    assert.equal(r.code, 0, r.stderr);
    assert.deepEqual(r.json.classes, []);
    assert.deepEqual(r.json.briefs, []);
    assert.deepEqual(r.json.blocked, ['no held-out set: beta: a human session adds truth']);
    const both = run(root, ['propose', '--classes', 'alpha,beta']);
    assert.deepEqual(both.json.classes, ['alpha']);
    assert.equal(both.json.blocked.length, 1);
  } finally { clean(root); }
});

test('check: a good file is ok, prints { ok, class, rows, errors }, exit 0', () => {
  const root = makeRoot();
  try {
    const f = dreamFile(root, 'alpha', GOOD);
    const r = run(root, ['check', f]);
    assert.equal(r.code, 0, r.stdout + r.stderr);
    assert.deepEqual(r.json, { ok: true, class: 'alpha', rows: 3, errors: [] });
    const rel = run(root, ['check', 'work/grow/gen-2/dream/alpha.jsonl']); // root-relative, as the brief says
    assert.equal(rel.code, 0, rel.stdout + rel.stderr);
  } finally { clean(root); }
});

test('check: a dev duplicate (trimmed, any case) and a repeated q are errors, exit 1, the JSON line still printed', () => {
  const root = makeRoot();
  try {
    const dup = run(root, ['check', dreamFile(root, 'alpha', [GOOD[0], { ...GOOD[1], q: '  THE CAPITAL OF PERU ' }])]);
    assert.equal(dup.code, 1);
    assert.equal(dup.json.ok, false);
    assert.equal(dup.json.errors.length, 1);
    assert.match(dup.json.errors[0], /^row 2: q equals a dev row of alpha/);
    const rep = run(root, ['check', dreamFile(root, 'alpha', [GOOD[0], GOOD[1], { ...GOOD[2], q: 'The Capital of Mongolia' }])]);
    assert.equal(rep.code, 1);
    assert.equal(rep.json.errors.length, 1);
    assert.match(rep.json.errors[0], /^row 3: q repeats an earlier row/);
  } finally { clean(root); }
});

test('check: a clause the judge does not carry and an answer failing its expect are errors with their row and the failures', () => {
  const root = makeRoot();
  try {
    const bad = run(root, ['check', dreamFile(root, 'alpha', [{ ...GOOD[0], expect: { startsWith: 'U' } }, GOOD[1]])]);
    assert.equal(bad.code, 1);
    assert.deepEqual(bad.json.errors, ['row 1: expect: unknown clause startsWith']);
    const wrong = run(root, ['check', dreamFile(root, 'alpha', [GOOD[0], { ...GOOD[2], answer: 'Vientiane is the capital of Laos' }])]);
    assert.equal(wrong.code, 1);
    assert.equal(wrong.json.errors.length, 1);
    assert.ok(wrong.json.errors[0].startsWith('row 2: the answer fails its expect: the answer does not equal "Vientiane"'), wrong.json.errors[0]);
    const noAnswer = run(root, ['check', dreamFile(root, 'alpha', [{ q: GOOD[0].q, expect: GOOD[0].expect }])]);
    assert.deepEqual(noAnswer.json.errors, ['row 1: answer is not a non-empty string']);
  } finally { clean(root); }
});

test('check: an empty file, a line that is not an object, a row without q and more than 12 rows are errors', () => {
  const root = makeRoot();
  try {
    const empty = run(root, ['check', dreamFile(root, 'alpha', '\n\n')]);
    assert.equal(empty.code, 1);
    assert.equal(empty.json.rows, 0);
    assert.match(empty.json.errors.join(' | '), /no rows/);
    const junk = run(root, ['check', dreamFile(root, 'alpha', JSON.stringify(GOOD[0]) + '\nnot json\n[1,2]\n' + JSON.stringify({ expect: { minWords: 1 }, answer: 'x' }) + '\n')]);
    assert.deepEqual(junk.json.errors, ['row 2: line 2 is not a JSON object', 'row 3: line 3 is not a JSON object', 'row 4: no q (a non-empty string)']);
    const many = Array.from({ length: 13 }, (_, i) => ({ q: 'capital of Place' + i, expect: { minWords: 1 }, answer: 'City' + i }));
    const big = run(root, ['check', dreamFile(root, 'alpha', many)]);
    assert.equal(big.code, 1);
    assert.deepEqual(big.json.errors, ['13 rows, over 12']);
    const noDev = run(root, ['check', dreamFile(root, 'gamma', GOOD)]);
    assert.equal(noDev.code, 1);
    assert.match(noDev.json.errors[0], /no dev set for class gamma/);
  } finally { clean(root); }
});

test('collect: keeps the rows the organism refuses, drops the one it answers, appends them to grow/dreams.jsonl, writes collect.json', () => {
  const root = makeRoot();
  try {
    dreamFile(root, 'alpha', GOOD);
    const r = run(root, ['collect'], { STUB_ANSWERS: GOOD[1].q });
    assert.equal(r.code, 0, r.stderr);
    for (const k of ['generation', 'at', 'proposed', 'kept', 'byClass', 'dropped', 'blocked', 'file']) assert.ok(k in r.json, 'missing ' + k);
    assert.equal(r.json.generation, 2);
    assert.equal(r.json.proposed, 3);
    assert.equal(r.json.kept, 2);
    assert.deepEqual(r.json.byClass, { alpha: { proposed: 3, kept: 2 } });
    assert.deepEqual(r.json.dropped, [{ class: 'alpha', q: GOOD[1].q, why: 'the organism answers it' }]);
    assert.deepEqual(r.json.blocked, []);
    assert.equal(r.json.file, 'grow/dreams.jsonl');
    const rows = readJsonl(path.join(root, 'grow/dreams.jsonl'));
    assert.deepEqual(rows.map((x) => x.id), ['dream-2-alpha-1', 'dream-2-alpha-2']);
    for (const [i, g] of [GOOD[0], GOOD[2]].entries()) {
      const x = rows[i];
      assert.deepEqual(Object.keys(x), ['id', 'at', 'prompt', 'reply', 'route', 'class', 'expect', 'status', 'generation']);
      assert.equal(x.prompt, g.q);
      assert.equal(x.reply, g.answer);
      assert.equal(x.route, 'dream');
      assert.equal(x.class, 'alpha');
      assert.deepEqual(x.expect, g.expect);
      assert.equal(x.status, 'open');
      assert.equal(x.generation, 2);
      assert.ok(Number.isFinite(Date.parse(x.at)));
      assert.match(x.id, FILE_ID);
    }
    const saved = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-2/dream/collect.json'), 'utf8'));
    assert.deepEqual(saved, r.json);
    assert.deepEqual(asked(root).map((a) => a.qs), [GOOD.map((g) => g.q)], 'the organism is asked every valid q once');
    assert.equal(asked(root)[0].knowledge, 'undefined', 'no pack: the organism default knowledge');
  } finally { clean(root); }
});

test('collect: a second collect of the same file keeps 0 (already dreamed) and leaves grow/dreams.jsonl as it was', () => {
  const root = makeRoot();
  try {
    dreamFile(root, 'alpha', GOOD);
    assert.equal(run(root, ['collect']).json.kept, 3);
    const before = fs.readFileSync(path.join(root, 'grow/dreams.jsonl'), 'utf8');
    const again = run(root, ['collect']);
    assert.equal(again.code, 0, again.stderr);
    assert.equal(again.json.kept, 0);
    assert.equal(again.json.proposed, 3);
    assert.deepEqual(again.json.dropped.map((d) => d.why), ['already dreamed', 'already dreamed', 'already dreamed']);
    assert.equal(fs.readFileSync(path.join(root, 'grow/dreams.jsonl'), 'utf8'), before);
    assert.equal(asked(root).length, 1, 'an already dreamed q is not asked again');
  } finally { clean(root); }
});

test('collect: ids continue from the rows already in grow/dreams.jsonl and those rows are never rewritten', () => {
  const root = makeRoot();
  try {
    const old = [{ id: 'dream-2-alpha-1', at: '2026-10-01T00:00:00.000Z', prompt: 'an older dream', reply: 'x', route: 'dream', class: 'alpha', expect: { minWords: 1 }, status: 'grown', generation: 2 }, { id: 'seed-9', prompt: 'not a dream' }];
    const text = jsonl(old).trimEnd(); // no final newline: the append must still start a new line
    put(root, 'grow/dreams.jsonl', text);
    dreamFile(root, 'alpha', [GOOD[0], { ...GOOD[1], q: 'An Older Dream' }]);
    const r = run(root, ['collect']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.kept, 1);
    assert.deepEqual(r.json.dropped, [{ class: 'alpha', q: 'An Older Dream', why: 'already dreamed' }]);
    const after = fs.readFileSync(path.join(root, 'grow/dreams.jsonl'), 'utf8');
    assert.ok(after.startsWith(text + '\n'));
    assert.deepEqual(readJsonl(path.join(root, 'grow/dreams.jsonl')).map((x) => x.id), ['dream-2-alpha-1', 'seed-9', 'dream-2-alpha-2']);
  } finally { clean(root); }
});

test('collect: a file failing check is dropped whole with its errors, the other class is kept', () => {
  const root = makeRoot();
  try {
    dreamFile(root, 'alpha', [GOOD[0], GOOD[1], { ...GOOD[2], answer: 'not it' }]);
    dreamFile(root, 'beta', GOOD_BETA);
    const r = run(root, ['collect']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.proposed, 4);
    assert.equal(r.json.kept, 1);
    assert.deepEqual(r.json.byClass, { alpha: { proposed: 3, kept: 0 }, beta: { proposed: 1, kept: 1 } });
    assert.equal(r.json.dropped.length, 1);
    assert.equal(r.json.dropped[0].class, 'alpha');
    assert.equal(r.json.dropped[0].q, null);
    assert.match(r.json.dropped[0].why, /^the file fails check \(1 errors\): row 3: the answer fails its expect/);
    assert.deepEqual(readJsonl(path.join(root, 'grow/dreams.jsonl')).map((x) => [x.id, x.prompt]), [['dream-2-beta-1', GOOD_BETA[0].q]]);
    assert.deepEqual(asked(root).map((a) => a.qs), [[GOOD_BETA[0].q]], 'a dropped file is never asked');
  } finally { clean(root); }
});

test('collect: no dream directory is proposed 0, kept 0, exit 0, and no grow/dreams.jsonl', () => {
  const root = makeRoot();
  try {
    const r = run(root, ['collect', '--gen', '7']);
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.generation, 7);
    assert.equal(r.json.proposed, 0);
    assert.equal(r.json.kept, 0);
    assert.deepEqual(r.json.byClass, {});
    assert.deepEqual(r.json.dropped, []);
    assert.ok(!fs.existsSync(path.join(root, 'grow/dreams.jsonl')));
    assert.equal(asked(root).length, 0);
  } finally { clean(root); }
});

test('collect: an organism that cannot be asked drops nothing for it and says so in blocked; --knowledge none reaches it as false', () => {
  const root = makeRoot();
  try {
    dreamFile(root, 'alpha', GOOD);
    const r = run(root, ['collect', '--knowledge', 'none'], { STUB_THROW: '1', STUB_ANSWERS: GOOD[0].q });
    assert.equal(r.code, 0, r.stderr);
    assert.equal(r.json.kept, 3);
    assert.deepEqual(r.json.blocked, ['dream: the organism could not be asked: stub organism down']);
    assert.equal(asked(root)[0].knowledge, false);
  } finally { clean(root); }
});

test('the module: --help prints the usage, an unknown verb exits 2, an id stays inside the miss id rule for any class name', () => {
  const root = makeRoot();
  try {
    const h = run(root, ['--help']);
    assert.equal(h.code, 0);
    assert.equal(h.stdout.trim(), USAGE);
    const u = run(root, ['sleep']);
    assert.equal(u.code, 2);
    assert.match(u.stderr, /unknown verb sleep/);
    assert.equal(run(root, ['check']).code, 2);
    assert.equal(idPrefix(2, 'alpha'), 'dream-2-alpha-');
    const long = 'a'.repeat(64);
    assert.match(idPrefix(123, long) + '999999', FILE_ID);
    assert.equal(checkText(root, 'alpha', jsonl(GOOD)).tasks.length, 3);
  } finally { clean(root); }
});

test('collect --commit: the kept dreams are committed as jayden with the Opus trailer, --no-push keeps it local, a second collect commits nothing', () => {
  const root = makeRoot();
  try {
    const git = (args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true });
    assert.equal(git(['init', '-q']).status, 0);
    git(['config', 'user.email', 'test@example.invalid']);
    git(['config', 'user.name', 'tester']);
    git(['config', 'commit.gpgsign', 'false']);
    fs.writeFileSync(path.join(root, 'README.md'), 'x\n');
    git(['add', '-A']);
    assert.equal(git(['commit', '-q', '-m', 'init']).status, 0);
    fs.mkdirSync(path.join(root, 'work/grow/gen-2/dream'), { recursive: true });
    fs.writeFileSync(path.join(root, 'work/grow/gen-2/dream/alpha.jsonl'), GOOD.map((r) => JSON.stringify(r)).join('\n') + '\n');
    const r = run(root, ['collect', '--gen', '2', '--commit', '--no-push']);
    assert.equal(r.code, 0, r.stderr);
    assert.ok(r.json.kept >= 1, JSON.stringify(r.json));
    assert.equal(r.json.committed, true);
    assert.equal(r.json.pushed, 'skipped (--no-push)');
    const log = git(['log', '-1', '--format=%an%n%s%n%b']).stdout;
    assert.match(log, /^jayden\n/);
    assert.match(log, new RegExp('gen 2: dreamed ' + r.json.kept + ' tasks \\(alpha\\)'));
    assert.match(log, /Co-Authored-By: Claude Opus 5\.5/);
    assert.equal(git(['status', '--porcelain', '--', 'grow/dreams.jsonl']).stdout.trim(), '', 'the dreams file is clean after the commit');
    const again = run(root, ['collect', '--gen', '2', '--commit', '--no-push']);
    assert.equal(again.code, 0, again.stderr);
    assert.equal(again.json.kept, 0);
    assert.equal(again.json.committed, 'nothing to commit');
    const c = JSON.parse(fs.readFileSync(path.join(root, 'work/grow/gen-2/dream/collect.json'), 'utf8'));
    assert.equal(c.committed, 'nothing to commit', 'collect.json carries the ship fields');
    const bad = run(root, ['collect', '--gen', '2', '--commit=yes']);
    assert.equal(bad.code, 2);
  } finally { clean(root); }
});
