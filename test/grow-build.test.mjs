// test/grow-build.test.mjs: the builder arm (grow/app-slug.mjs, grow/probe-app.mjs, grow/build.mjs; his NEXT-WEEK.md
// Day 2: "make me a todo app" makes the organism write it, run it in the sandbox and serve it at a URL).
// No network and no model: the fixtures under grow/fixtures/app-ok and app-bad, temporary roots for promote.
// Author: Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01), his NEXT-WEEK.md builder arm.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildRequest, slugOf, APP_NOUNS, SLUG_RE } from '../grow/app-slug.mjs';
import { validateApp, declaredTests, otherOrigins } from '../grow/probe-app.mjs';
import { verdictOf, renderAppsMjs, APP_FILES, NOT_SERVED } from '../grow/build.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = path.join(ROOT, 'grow', 'build.mjs');
const PROBE_APP = path.join(ROOT, 'grow', 'probe-app.mjs');
const OK = path.join(ROOT, 'grow', 'fixtures', 'app-ok');
const BAD = path.join(ROOT, 'grow', 'fixtures', 'app-bad');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-build-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });

function bareEnv(extra = {}) {
  const env = {};
  for (const k of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'HOME', 'USERPROFILE']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return { ...env, ...extra };
}
function runNode(args, env = bareEnv()) {
  return new Promise((ok) => {
    const c = spawn(process.execPath, args, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let out = '', err = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { err += d; });
    const t = setTimeout(() => c.kill(), 120_000);
    c.on('close', (code) => { clearTimeout(t); ok({ code, out, err }); });
  });
}
let seq = 0;
/** A copy of app-ok named `name` under TMP with the given files replaced (a string) or removed (null). */
function copyApp(name, changes = {}) {
  const d = path.join(TMP, 'apps-' + (++seq), name);
  fs.mkdirSync(d, { recursive: true });
  for (const f of ['index.html', 'app.mjs', 'test.mjs']) fs.copyFileSync(path.join(OK, f), path.join(d, f));
  for (const [f, v] of Object.entries(changes)) { if (v === null) fs.rmSync(path.join(d, f), { force: true }); else fs.writeFileSync(path.join(d, f), v); }
  return d;
}
const okHtml = fs.readFileSync(path.join(OK, 'index.html'), 'utf8');
const okApp = fs.readFileSync(path.join(OK, 'app.mjs'), 'utf8');
const okTest = fs.readFileSync(path.join(OK, 'test.mjs'), 'utf8');
const CLEAN = { candidate: 'state/grow/gen-1/build/todo', kind: 'app', slug: 'todo', backend: 'vercel', session: 'sbx_1', node: 'v24.0.0',
  startedAt: '2026-10-01T00:00:00.000Z', wallMs: 900, cpuMs: 120, validate: { ok: true, errors: [] },
  tests: { exitCode: 0, passed: 4, failed: 0, tail: '# pass 4' }, files: { 'index.html': 10, 'app.mjs': 10, 'test.mjs': 10 }, exitCode: 0, error: null };
const at = () => new Date('2026-10-01T01:02:03.000Z');

// ---------------------------------------------------------------- grow/app-slug.mjs
test('buildRequest: the build requests his NEXT-WEEK.md names, each with its name and slug', () => {
  const cases = [
    ['make me a todo app', 'todo', 'todo'],
    ['build a pomodoro timer', 'pomodoro timer', 'pomodoro-timer'],
    ['create a calculator', 'calculator', 'calculator'],
    ['write me a tip calculator app please', 'tip calculator', 'tip-calculator'],
    ['make a website', 'website', 'website'],
    ['Please can you build me a Snake Game!', 'snake game', 'snake-game'],
    ['could you code a 2048 game', '2048 game', '2048-game'],
    ['i want you to design a habit tracker', 'habit tracker', 'habit-tracker'],
    ['i need a todo list', null, null], // "i need" opens, but a verb must follow it
    ['make a todo web app', 'todo', 'todo'],
    ['make a web app', 'web app', 'web-app'],
    ['Generate a password generator.', 'password generator', 'password-generator'],
    ['develop us a unit converter tool', 'unit converter tool', 'unit-converter-tool'],
  ];
  for (const [p, name, slug] of cases) {
    const r = buildRequest(p);
    if (name === null) { assert.equal(r, null, p); continue; }
    assert.deepEqual(r, { name, slug }, p);
    assert.match(r.slug, SLUG_RE, p);
    assert.deepEqual(buildRequest(p), r, 'deterministic: ' + p);
  }
});

test('buildRequest: asks for text, food, a function or a workout are not build requests; nor is an empty or long prompt', () => {
  const no = ['write an essay about the ocean', 'make a sandwich', 'create a function that reverses a string', 'build muscle',
    'create a list of animals', 'write a page about cats', 'what is 2+2', 'todo app', 'make me', 'make me a todo app, then email it to bob',
    '', '   ', 'make me a todo app ' + 'a'.repeat(110)];
  for (const p of no) assert.equal(buildRequest(p), null, JSON.stringify(p));
  for (const p of [null, undefined, 42, { prompt: 'make me a todo app' }]) assert.equal(buildRequest(p), null, String(p));
  // the 120 boundary: 120 characters is a request, 121 is not
  const p120 = 'build a ' + 'z'.repeat(106) + ' timer';
  assert.equal(p120.length, 120);
  assert.equal(buildRequest(p120).name, 'z'.repeat(106) + ' timer');
  assert.equal(buildRequest(p120 + 's'), null);
  // seven words is over the noun phrase's six
  assert.equal(buildRequest('make a very very very very small todo app'), null);
  assert.deepEqual(buildRequest('make a very very very small todo app'), { name: 'very very very small todo', slug: 'very-very-very-small-todo' });
});

test('slug rules: lower case, runs of other characters to one "-", trimmed, at most 40, SLUG_RE or null; APP_NOUNS frozen', () => {
  assert.equal(slugOf('Tip Calculator!!'), 'tip-calculator');
  assert.equal(slugOf("mom's  recipe   book"), 'mom-s-recipe-book');
  assert.equal(slugOf('to-do list'), 'to-do-list');
  assert.equal(slugOf('--x--'), 'x');
  assert.equal(slugOf('---'), null);
  assert.equal(slugOf(''), null);
  assert.equal(slugOf('a'.repeat(39) + ' b'), 'a'.repeat(39), 'cut at 40 leaves a trailing "-", trimmed');
  assert.equal(slugOf('b'.repeat(60)), 'b'.repeat(40));
  assert.equal(buildRequest('build a ' + 'z'.repeat(106) + ' timer').slug, 'z'.repeat(40));
  for (const s of ['tip-calculator', 'x', 'z'.repeat(40)]) assert.match(s, SLUG_RE);
  for (const s of ['-x', 'X', 'a_b', 'z'.repeat(41), '']) assert.doesNotMatch(s, SLUG_RE);
  assert.ok(Object.isFrozen(APP_NOUNS));
  assert.deepEqual(APP_NOUNS, ['app', 'application', 'web app', 'webapp', 'website', 'site', 'web page', 'webpage', 'page', 'tool', 'game', 'widget',
    'calculator', 'timer', 'stopwatch', 'clock', 'counter', 'todo', 'to-do', 'todo list', 'notes', 'notepad', 'checklist', 'tracker', 'converter',
    'dashboard', 'editor', 'planner', 'journal', 'quiz', 'calendar', 'player', 'generator', 'picker', 'board', 'list']);
  const src = fs.readFileSync(path.join(ROOT, 'grow', 'app-slug.mjs'), 'utf8');
  assert.doesNotMatch(src, /^\s*import\s/m, 'pure: no import at all (the Vercel function imports it)');
});

// ---------------------------------------------------------------- grow/probe-app.mjs validateApp and build validate
test('validateApp: the app-ok fixture is valid; build validate prints {ok, errors, slug} and exits 0', async () => {
  assert.deepEqual(validateApp(OK), { ok: true, errors: [] });
  assert.equal(declaredTests(okTest), 4);
  const r = await runNode([BUILD, 'validate', OK]);
  assert.equal(r.code, 0, r.err);
  assert.deepEqual(JSON.parse(r.out), { ok: true, errors: [], slug: 'app-ok' });
  assert.equal(r.err, '');
});

test('validateApp names each defect of the app-bad fixture; build validate prints the line and exits 1', async () => {
  const want = ['index.html references another origin: https://cdn.example.com/x.js',
    'index.html loads a script that is not ./app.mjs: https://cdn.example.com/x.js',
    'index.html loads 2 scripts by src: at most one, ./app.mjs'];
  assert.deepEqual(validateApp(BAD), { ok: false, errors: want });
  const r = await runNode([BUILD, 'validate', BAD]);
  assert.equal(r.code, 1);
  assert.deepEqual(JSON.parse(r.out), { ok: false, errors: want, slug: 'app-bad' });
  assert.equal(r.err.trim().split('\n').length, 1);
  assert.match(r.err, /^validate: 3 error\(s\) in app-bad/);
});

test('validateApp: one defect at a time on a copy of app-ok, each named; the unchanged copy is the control', () => {
  assert.deepEqual(validateApp(copyApp('control')), { ok: true, errors: [] });
  const html = (from, to) => ({ 'index.html': okHtml.replace(from, to) });
  const head = (extra) => html('</head>', extra + '\n</head>');
  const cases = [
    [html('<!doctype html>', '<html>'), 'index.html does not start with <!doctype html>'],
    [html('<title>Todo</title>', ''), 'index.html has no <title>'],
    [head('<script>document.title = "x";</script>'), 'index.html has an inline <script>: the code lives in app.mjs'],
    [head('<iframe src="./x.html"></iframe>'), 'index.html has an <iframe>'],
    [head('<link rel="stylesheet" href="//fonts.example.com/a.css">'), 'index.html references another origin: //fonts.example.com/a.css'],
    [head('<style>body { background: url("https://img.example.com/b.png"); }</style>'), 'index.html references another origin: https://img.example.com/b.png'],
    [head('<style>@import "http://css.example.com/c.css";</style>'), 'index.html references another origin: http://css.example.com/c.css'],
    [html('<button id="add" type="submit">', '<button id="add" type="submit" onclick="go()">'), 'index.html has an inline event handler onclick=: the code lives in app.mjs'],
    [html('<form id="add-form" autocomplete="off">', '<form id="add-form" action="https://collect.example.com/">'), 'index.html has a form that posts to another origin'],
    [html('src="./app.mjs"', 'src="./other.mjs"'), 'index.html loads a script that is not ./app.mjs: ./other.mjs'],
    [html('<script type="module" src="./app.mjs">', '<script src="./app.mjs">'), 'index.html loads ./app.mjs without type="module"'],
    [head('<a href="javascript:void(0)">x</a>'), 'index.html uses a javascript: address'],
    [{ 'app.mjs': okApp + '\nexport const load = () => fetch("./data.json");\n' }, 'app.mjs uses fetch()'],
    [{ 'app.mjs': "import fs from 'node:fs';\n" + okApp }, 'app.mjs imports "node:fs": only a ./x.mjs file of the app directory'],
    [{ 'app.mjs': "import fs from 'node:fs';\n" + okApp }, 'app.mjs uses a node: module'],
    [{ 'app.mjs': okApp + '\nexport const c = () => document.cookie;\n' }, 'app.mjs uses document.cookie'],
    [{ 'app.mjs': okApp + '\nexport const u = "https://example.com";\n' }, 'app.mjs uses an http(s):// address'],
    [{ 'app.mjs': okApp + '\nexport const w = () => new WebSocket("x");\n' }, 'app.mjs uses WebSocket'],
    [{ 'app.mjs': 'const x = 1;\n' }, 'app.mjs exports nothing: it exports the logic index.html wires and test.mjs imports'],
    [{ 'app.mjs': null }, 'no app.mjs in the app directory'],
    [{ 'index.html': null }, 'no index.html in the app directory'],
    [{ 'test.mjs': null }, 'no test.mjs in the app directory'],
    [{ 'test.mjs': okTest.replace(/\ntest\('removeTodo[\s\S]*?\n}\);\n/, '\n').replace(/\ntest\('render[\s\S]*?\n}\);\n/, '\n') }, 'test.mjs declares 2 tests: at least 3'],
    [{ 'test.mjs': "import fs from 'node:fs';\n" + okTest }, 'test.mjs imports "node:fs": only ./x.mjs of the app directory, node:test, node:assert, node:assert/strict'],
    [{ 'test.mjs': okTest + '\ntest("exits", () => process.exit(0));\n' }, 'test.mjs uses process'],
    [{ 'test.mjs': okTest.replace("from './app.mjs'", "from './other.mjs'") }, 'test.mjs does not import ./app.mjs'],
    [{ 'x.svg': '<svg xmlns="x"></svg>' }, 'x.svg: an app holds only .html, .mjs, .js, .css, .json, .txt, .md files'],
    [{ 'bad name.txt': 'x' }, 'the file name "bad name.txt" does not match ' + /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/],
    [{ 'style.css': 'body { background: url(https://img.example.com/s.png) }' }, 'style.css references another origin: https://img.example.com/s.png'],
    [{ 'index.html': okHtml + '<!--' + 'x'.repeat(530 * 1024) + '-->\n' }, 'index.html is over 524288 bytes'],
  ];
  for (const [changes, want] of cases) {
    const v = validateApp(copyApp('defect', changes));
    assert.equal(v.ok, false, want);
    assert.ok(v.errors.includes(want), want + '\n  got: ' + v.errors.join(' | '));
  }
  const sub = copyApp('subdir');
  fs.mkdirSync(path.join(sub, 'assets'));
  assert.deepEqual(validateApp(sub), { ok: false, errors: ['assets is a directory: an app is top-level files only'] });
  const big = copyApp('big');
  for (let i = 0; i < 5; i++) fs.writeFileSync(path.join(big, 'pad' + i + '.txt'), 'p'.repeat(450 * 1024));
  assert.ok(validateApp(big).errors.some((e) => /^the app is \d+ bytes: it must be under 2097152$/.test(e)));
  assert.deepEqual(otherOrigins('<a href="#top">x</a><a href="./b.html">b</a><a href="mailto:me@example.com">m</a><img src="data:image/png;base64,AA">'), []);
});

// ---------------------------------------------------------------- judge
test('judge: a clean result.json survives; the verdict is written beside it in its shape; exit 0', async () => {
  const v = verdictOf(CLEAN, { now: at });
  assert.deepEqual(v, { candidate: 'state/grow/gen-1/build/todo', slug: 'todo', kind: 'app', survived: true, why: [],
    validate: { ok: true, errors: [] }, tests: { passed: 4, failed: 0, exitCode: 0 }, exitCode: 0, error: null, at: '2026-10-01T01:02:03.000Z' });
  const d = copyApp('todo');
  fs.writeFileSync(path.join(d, 'result.json'), JSON.stringify(CLEAN));
  const r = await runNode([BUILD, 'judge', d]);
  assert.equal(r.code, 0, r.err);
  const printed = JSON.parse(r.out);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(d, 'verdict.json'), 'utf8')), printed);
  assert.deepEqual(Object.keys(printed), ['candidate', 'slug', 'kind', 'survived', 'why', 'validate', 'tests', 'exitCode', 'error', 'at']);
  assert.equal(printed.survived, true);
  assert.ok(!Number.isNaN(Date.parse(printed.at)));
  const out = path.join(TMP, 'judge-out', 'v.json');
  const r2 = await runNode([BUILD, 'judge', d, '--out', out]);
  assert.equal(r2.code, 0, r2.err);
  assert.equal(JSON.parse(fs.readFileSync(out, 'utf8')).survived, true);
});

test('judge: every failed clause is named in why and survived is false; a failing verdict still exits 0', async () => {
  const cases = [
    [{ tests: { ...CLEAN.tests, failed: 1, exitCode: 1, passed: 3 } }, ['tests.failed is 1, not 0', 'tests.exitCode is 1, not 0']],
    [{ validate: { ok: false, errors: ['index.html references another origin: https://cdn.example.com/x.js'] } }, ['validate.ok is not true: index.html references another origin: https://cdn.example.com/x.js']],
    [{ validate: { ok: true, errors: ['a stray error'] } }, ['validate lists 1 error(s) beside ok: a stray error']],
    [{ exitCode: 1 }, ['exitCode is 1, not 0']],
    [{ error: 'the probe was killed after 90000 ms' }, ['the run recorded an error: the probe was killed after 90000 ms']],
    [{ tests: { ...CLEAN.tests, passed: 2 } }, ['tests.passed is 2, under 3']],
    [{ tests: { exitCode: null, passed: null, failed: null, tail: '' } }, ['tests.failed is null, not 0', 'tests.exitCode is null, not 0', 'tests.passed is null, under 3']],
    [{ kind: undefined }, ['result.json kind is missing, not app']],
    [{ error: undefined }, ['result.json carries no error field']],
  ];
  for (const [patch, why] of cases) {
    const r = { ...CLEAN, ...patch };
    for (const k of Object.keys(patch)) if (patch[k] === undefined) delete r[k];
    const v = verdictOf(r, { now: at });
    assert.equal(v.survived, false, JSON.stringify(patch));
    assert.deepEqual(v.why, why, JSON.stringify(patch));
  }
  // the whole path: a failing result through the CLI writes the verdict and exits 0
  const d = copyApp('failing');
  fs.writeFileSync(path.join(d, 'result.json'), JSON.stringify({ ...CLEAN, slug: 'failing', exitCode: 3, error: 'boom' }));
  const r = await runNode([BUILD, 'judge', d]);
  assert.equal(r.code, 0, r.err);
  const v = JSON.parse(fs.readFileSync(path.join(d, 'verdict.json'), 'utf8'));
  assert.equal(v.survived, false);
  assert.deepEqual(v.why, ['exitCode is 3, not 0', 'the run recorded an error: boom']);
  assert.equal(v.slug, 'failing');
});

test('judge: an unreadable result.json exits 1 with one stderr line and writes no verdict', async () => {
  const none = copyApp('noresult');
  let r = await runNode([BUILD, 'judge', none]);
  assert.equal(r.code, 1);
  assert.equal(r.out, '');
  assert.match(r.err, /result\.json is unreadable: ENOENT/);
  assert.equal(r.err.trim().split('\n').length, 1);
  assert.equal(fs.existsSync(path.join(none, 'verdict.json')), false);
  const broken = copyApp('brokenresult', { 'result.json': '{ not json' });
  r = await runNode([BUILD, 'judge', broken]);
  assert.equal(r.code, 1);
  assert.match(r.err, /result\.json is not JSON/);
  assert.equal(fs.existsSync(path.join(broken, 'verdict.json')), false);
});

// ---------------------------------------------------------------- promote
const SURVIVED = (slug) => ({ candidate: 'state/grow/gen-1/build/' + slug, slug, kind: 'app', survived: true, why: [], validate: { ok: true, errors: [] },
  tests: { passed: 4, failed: 0, exitCode: 0 }, exitCode: 0, error: null, at: '2026-10-01T01:00:00.000Z' });
const APPJSON = (slug, prompt = 'make me a todo app') => ({ slug, name: 'todo', prompt, generation: 1, misses: ['m-1'] });

/** A temporary root: grow/app-slug.mjs (grown/apps.mjs imports it), and the app under state/grow/gen-1/build/<slug>/. */
function stage({ slug = 'todo', verdict = SURVIVED(slug), app = APPJSON(slug), result = { ...CLEAN, slug }, slugModule = null } = {}) {
  const root = path.join(TMP, 'root-' + (++seq));
  const dir = path.join(root, 'state', 'grow', 'gen-1', 'build', slug);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of ['index.html', 'app.mjs', 'test.mjs']) fs.copyFileSync(path.join(OK, f), path.join(dir, f));
  fs.writeFileSync(path.join(dir, 'brief.md'), 'what the arm was told\n');
  if (verdict) fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify(verdict, null, 2));
  if (app) fs.writeFileSync(path.join(dir, 'app.json'), JSON.stringify(app));
  if (result) fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(result));
  fs.mkdirSync(path.join(root, 'grow'), { recursive: true });
  if (slugModule) fs.writeFileSync(path.join(root, 'grow', 'app-slug.mjs'), slugModule);
  else fs.copyFileSync(path.join(ROOT, 'grow', 'app-slug.mjs'), path.join(root, 'grow', 'app-slug.mjs'));
  return { root, dir };
}
/** Every file under the root's grown/ and web/ with its bytes and mtime. */
function snapshot(root) {
  const out = {};
  const walk = (abs, rel) => {
    if (!fs.existsSync(abs)) return;
    for (const n of fs.readdirSync(abs).sort()) {
      const a = path.join(abs, n), r = rel + '/' + n;
      const st = fs.statSync(a);
      if (st.isDirectory()) walk(a, r); else out[r] = { bytes: fs.readFileSync(a).toString('base64'), mtimeMs: st.mtimeMs };
    }
  };
  walk(path.join(root, 'grown'), 'grown');
  walk(path.join(root, 'web'), 'web');
  return out;
}

test('promote: a survived app is served under web/dist/apps/<slug>/, listed in grown/apps.json, answered by grown/apps.mjs, linked from apps/index.html', async () => {
  const { root } = stage();
  const r = await runNode([BUILD, 'promote', '1', 'todo', '--root', root]);
  assert.equal(r.code, 0, r.err);
  assert.deepEqual(JSON.parse(r.out), { promoted: ['todo'], skipped: [], apps: 1, generation: 1, path: '/apps/todo/' });
  const served = path.join(root, 'web', 'dist', 'apps', 'todo');
  assert.ok(fs.readFileSync(path.join(served, 'index.html')).equals(fs.readFileSync(path.join(OK, 'index.html'))));
  assert.ok(fs.readFileSync(path.join(served, 'app.mjs')).equals(fs.readFileSync(path.join(OK, 'app.mjs'))));
  assert.deepEqual(fs.readdirSync(served).sort(), ['app.mjs', 'index.html'], 'never served: ' + NOT_SERVED.join(', '));
  const apps = JSON.parse(fs.readFileSync(path.join(root, 'grown', 'apps.json'), 'utf8'));
  assert.equal(apps.apps.length, 1);
  const row = apps.apps[0];
  assert.deepEqual(Object.keys(row), ['slug', 'name', 'prompt', 'generation', 'at', 'path', 'files', 'tests']);
  assert.deepEqual({ ...row, at: null }, { slug: 'todo', name: 'todo', prompt: 'make me a todo app', generation: 1, at: null, path: '/apps/todo/', files: ['app.mjs', 'index.html'], tests: { passed: 4 } });
  assert.ok(!Number.isNaN(Date.parse(row.at)));
  const mjs = path.join(root, 'grown', 'apps.mjs');
  assert.equal(fs.readFileSync(mjs, 'utf8'), renderAppsMjs(apps));
  const mod = await import(pathToFileURL(mjs).href + '?t=' + Date.now());
  assert.equal(mod.APPS.length, 1);
  assert.ok(Object.isFrozen(mod.APPS) && Object.isFrozen(mod.APPS[0]));
  assert.deepEqual(mod.appAnswer('make me a todo app'), { slug: 'todo', name: 'todo', generation: 1, path: '/apps/todo/' });
  assert.deepEqual(mod.appAnswer('Please build me a todo web app!'), { slug: 'todo', name: 'todo', generation: 1, path: '/apps/todo/' });
  assert.equal(mod.appAnswer('what is 2+2'), null);
  assert.equal(mod.appAnswer('build a pomodoro timer'), null, 'a build request for an app not built yet');
  const page = fs.readFileSync(path.join(root, 'web', 'dist', 'apps', 'index.html'), 'utf8');
  assert.match(page, /^<!doctype html>/);
  assert.match(page, /<a href="\/apps\/todo\/">todo<\/a>/);
  assert.match(page, /make me a todo app/);
  assert.match(page, /generation 1/);
  assert.deepEqual(otherOrigins(page), [], 'the apps page is self contained');
  assert.deepEqual(APP_FILES, ['grown/apps.json', 'grown/apps.mjs']);
});

test('promote: a second promote of the same slug prints it under skipped and changes nothing', async () => {
  const { root, dir } = stage();
  const first = await runNode([BUILD, 'promote', '1', 'todo', '--root', root]);
  assert.equal(first.code, 0, first.err);
  const before = snapshot(root);
  assert.ok(Object.keys(before).length >= 5);
  const again = await runNode([BUILD, 'promote', '1', 'todo', '--root', root]);
  assert.equal(again.code, 0, again.err);
  assert.deepEqual(JSON.parse(again.out), { promoted: [], skipped: ['todo'], apps: 1, generation: 1, path: '/apps/todo/' });
  assert.deepEqual(snapshot(root), before, 'not one byte and not one mtime moved');
  // converges even when the state directory is gone (a re-run after cleanup)
  fs.rmSync(dir, { recursive: true, force: true });
  const third = await runNode([BUILD, 'promote', '1', 'todo', '--root', root]);
  assert.equal(third.code, 0, third.err);
  assert.deepEqual(JSON.parse(third.out).skipped, ['todo']);
  assert.deepEqual(snapshot(root), before);
});

test('promote refuses a verdict that did not survive, a missing verdict, a missing app.json, a prompt for another app, a here run on a PC, and writes nothing', async () => {
  const cases = [
    [{ verdict: { ...SURVIVED('todo'), survived: false, why: ['tests.failed is 1, not 0'] } }, /todo: verdict\.json says survived false: only a survivor is served/],
    [{ verdict: null }, /todo: no verdict\.json: run node grow\/build\.mjs judge first/],
    [{ app: null }, /todo: no app\.json \(\{ slug, name, prompt, generation, misses \}\): the driver writes it/],
    [{ app: APPJSON('todo', 'build a pomodoro timer') }, /names slug pomodoro-timer, so appAnswer could never reach it/],
    [{ result: { ...CLEAN, backend: 'here' } }, /result\.json backend is here and this is not a cloud VM: an app never runs on his PC/],
    [{ verdict: { ...SURVIVED('todo'), tests: { passed: 2, failed: 0, exitCode: 0 } } }, /verdict\.json says survived true but the clauses fail: tests are not failed 0, exit code 0, passed 3 or more/],
  ];
  for (const [opts, re] of cases) {
    const { root } = stage(opts);
    const r = await runNode([BUILD, 'promote', '1', 'todo', '--root', root]);
    assert.equal(r.code, 1, re + ': ' + r.out);
    assert.equal(r.out, '');
    assert.match(r.err, re);
    assert.equal(r.err.trim().split('\n').length, 1);
    assert.deepEqual(snapshot(root), {}, 'nothing written for ' + re);
  }
  // the proof fails after the writes (grown/apps.mjs imports a slug module that answers nothing): every file goes back
  const { root } = stage({ slugModule: 'export function buildRequest() { return null; }\n' });
  const r = await runNode([BUILD, 'promote', '1', 'todo', '--root', root]);
  assert.equal(r.code, 1);
  assert.match(r.err, /appAnswer\("make me a todo app"\) is null, not the slug todo \(rolled back/);
  assert.deepEqual(Object.keys(snapshot(root)), [], 'apps.json, apps.mjs, the served files and the page all rolled back');
  assert.equal(fs.existsSync(path.join(root, 'web', 'dist', 'apps', 'todo')), false);
});

// ---------------------------------------------------------------- generation 0, the probe line, the CLI
test('grown/apps.json and grown/apps.mjs at generation 0: no app; apps.mjs is renderAppsMjs of apps.json; appAnswer is null', async () => {
  const apps = JSON.parse(fs.readFileSync(path.join(ROOT, 'grown', 'apps.json'), 'utf8'));
  assert.ok(Array.isArray(apps.apps));
  assert.equal(fs.readFileSync(path.join(ROOT, 'grown', 'apps.mjs'), 'utf8'), renderAppsMjs(apps), 'grown/apps.mjs is generated, never hand edited');
  assert.equal(renderAppsMjs({ apps: [] }).includes('Generation 0: no app yet.'), true);
  const mod = await import(pathToFileURL(path.join(ROOT, 'grown', 'apps.mjs')).href);
  assert.equal(mod.APPS.length, apps.apps.length);
  if (!apps.apps.length) assert.equal(mod.appAnswer('make me a todo app'), null);
  assert.equal(mod.appAnswer('what is 2+2'), null);
  assert.ok(!new RegExp(String.fromCharCode(0x2014)).test(renderAppsMjs({ apps: [] })), 'no em-dash');
});

test('probe-app.mjs: reads and deletes the nonce file first, echoes it, prints one JSON line, exits 0', async () => {
  const d = copyApp('noncecheck');
  const nf = path.join(TMP, 'apps-' + seq, 'nonce.txt');
  fs.writeFileSync(nf, 'abc123nonce\n');
  const r = await runNode([PROBE_APP, d, '--nonce-file', nf]);
  assert.equal(r.code, 0, r.err);
  const lines = r.out.trim().split('\n');
  assert.equal(lines.length, 1);
  const p = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(p), ['nonce', 'kind', 'slug', 'node', 'validate', 'tests', 'files', 'probeMs', 'probeCpuMs']);
  assert.equal(p.nonce, 'abc123nonce');
  assert.equal(fs.existsSync(nf), false, 'the nonce file is gone');
  assert.deepEqual([p.kind, p.slug, p.validate.ok, p.tests.passed, p.tests.failed, p.tests.exitCode], ['app', 'noncecheck', true, 4, 0, 0]);
  assert.deepEqual(p.files, Object.fromEntries(['app.mjs', 'index.html', 'test.mjs'].map((f) => [f, fs.statSync(path.join(d, f)).size])));
  // a directory that is not there: still one line, validate false, exit 0
  const gone = await runNode([PROBE_APP, path.join(TMP, 'no-such-app')]);
  assert.equal(gone.code, 0);
  const g = JSON.parse(gone.out.trim());
  assert.equal(g.validate.ok, false);
  assert.match(g.validate.errors[0], /the app directory is unreadable: ENOENT/);
});

test('build.mjs: --help prints usage; bad arguments fail with one stderr line', async () => {
  const h = await runNode([BUILD, '--help']);
  assert.equal(h.code, 0);
  assert.match(h.out, /^usage: node grow\/build\.mjs <verb>/);
  for (const [args, re] of [
    [[], /^no verb: validate, judge or promote/],
    [['frob'], /^unknown verb frob/],
    [['promote', 'x', 'todo'], /^generation "x" is not a whole number/],
    [['promote', '1', 'Bad_Slug', '--root', TMP], /^slug "Bad_Slug" is not a slug/],
    [['validate', OK, '--bogus', '1'], /^unknown flag --bogus/],
    [['judge'], /^judge takes <appDir>/],
  ]) {
    const r = await runNode([BUILD, ...args]);
    assert.equal(r.code, 1, args.join(' '));
    assert.match(r.err, re);
    assert.equal(r.err.trim().split('\n').length, 1);
  }
});
