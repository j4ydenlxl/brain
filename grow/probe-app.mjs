// grow/probe-app.mjs: the APP probe, runs INSIDE the sandbox (his NEXT-WEEK.md Day 2 builder arm; grow/sandbox.mjs
// --app). Node built-ins plus ./probe.mjs and ./contract.mjs, which the runner's tarball puts beside it.
//   node grow/probe-app.mjs <appDir> [--nonce-file nonce.txt]
// It takes the nonce FIRST (probe.mjs takeNonce: read, delete the file, echo it), then validates the app
// STATICALLY (validateApp, below; grow/build.mjs validate imports the same function), then runs the app's own
// tests exactly as probe.mjs runs a cell's: `node --test test.mjs` under the permission model (read inside the
// app directory only), 30 s budget, the pass/fail count from node's TAP summary on the child's stdout, held only
// when that stdout carries exactly one summary (countTests). It prints ONE JSON line and exits 0:
//   { nonce, kind: 'app', slug, node, validate: { ok, errors }, tests: { exitCode, passed, failed, tail },
//     files: { <name>: <bytes> }, probeMs, probeCpuMs }
// An app is a directory of top-level files: index.html (self contained: no other origin, no inline code, at most
// one <script type="module" src="./app.mjs">), app.mjs (the logic; no network, no node, no eval; it exports what
// index.html wires and test.mjs imports) and test.mjs (node:test over ./app.mjs, at least 3 tests). The page is
// served at dilation.dev/apps/<slug>/, the site's own origin, so nothing of it may reach another host.
// Author: Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01), his NEXT-WEEK.md builder arm.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { countTests, testArgv, bareEnv, takeNonce, TEST_BUDGET_MS } from './probe.mjs';
import { importsOf, TEST_FORBIDDEN } from './contract.mjs';

export const MAX_FILE_BYTES = 512 * 1024;
export const MAX_APP_BYTES = 2 * 1024 * 1024;
export const MIN_TESTS = 3;
export const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
export const APP_EXTS = Object.freeze(['.html', '.mjs', '.js', '.css', '.json', '.txt', '.md']);
export const APP_TEST_IMPORTS = Object.freeze(['node:test', 'node:assert', 'node:assert/strict']);
export const APP_FORBIDDEN = Object.freeze([
  [/\bfetch\s*\(/, 'fetch()'],
  [/XMLHttpRequest/, 'XMLHttpRequest'],
  [/WebSocket/, 'WebSocket'],
  [/EventSource/, 'EventSource'],
  [/sendBeacon/, 'sendBeacon'],
  [/\bimport\s*\(/, 'dynamic import()'],
  [/\brequire\s*\(/, 'require()'],
  [/\beval\s*\(/, 'eval()'],
  [/new\s+Function\b/, 'new Function'],
  [/\bprocess\b/, 'process'],
  [/\bnode:/, 'a node: module'],
  [/\bchild_process\b/, 'child_process'],
  [/\bworker_threads\b/, 'worker_threads'],
  [/https?:\/\//, 'an http(s):// address'],
  [/\bdocument\.cookie\b/, 'document.cookie'],
  [/\bindexedDB\b/, 'indexedDB'],
]);
/** The code words index.html may not carry either: inline code there would dodge APP_FORBIDDEN. */
const HTML_FORBIDDEN = APP_FORBIDDEN.filter(([, what]) => !['process', 'an http(s):// address', 'a node: module'].includes(what));
const USAGE = 'usage: node grow/probe-app.mjs <appDir> [--nonce-file <file>]';
const EXPORT_RE = /^\s*export\s+(?:default\b|(?:async\s+)?(?:const|let|var|function\*?|class)\s+[A-Za-z_$][\w$]*|\{[^}]*[A-Za-z_$][^}]*\})/m;
const EXPORT_FROM_RE = /^\s*export\s+(?:\*(?:\s+as\s+[A-Za-z_$][\w$]*)?|\{[^}]*\})\s*from\s+['"]([^'"]+)['"]/gm;
const TEST_DECL_RE = /\b(?:test|it)\s*\(/g;
const OTHER_ORIGIN = String.raw`(?:https?:)?\/\/`;

/** How many tests a test.mjs source declares: every `test(` or `it(`. */
export function declaredTests(source) {
  return [...String(source ?? '').matchAll(TEST_DECL_RE)].length;
}

const relOk = (spec, names) => spec.startsWith('./') && !spec.slice(2).includes('/') && spec.endsWith('.mjs') && names.includes(spec.slice(2));
const specsOf = (src) => [...importsOf(src), ...[...String(src).matchAll(EXPORT_FROM_RE)].map((m) => m[1])];

/** Every value of another origin an HTML or CSS text references (src=, href=, action=, url(, @import), deduplicated. */
export function otherOrigins(text) {
  const t = String(text ?? '');
  const out = new Set();
  const pats = [
    new RegExp(String.raw`\b(?:src|href|action|formaction|poster|srcset|data|background)\s*=\s*["']?\s*(` + OTHER_ORIGIN + String.raw`[^"'\s>]*)`, 'gi'),
    new RegExp(String.raw`url\(\s*["']?\s*(` + OTHER_ORIGIN + String.raw`[^"')\s]*)`, 'gi'),
    new RegExp(String.raw`@import\s+(?:url\(\s*)?["']?\s*(` + OTHER_ORIGIN + String.raw`[^"')\s;]*)`, 'gi'),
  ];
  for (const re of pats) for (const m of t.matchAll(re)) out.add(m[1]);
  return [...out];
}

function checkHtml(name, html, errors, isIndex) {
  if (isIndex) {
    if (!/^<!doctype html>/i.test(html.trim())) errors.push(name + ' does not start with <!doctype html>');
    if (!/<title\b[^>]*>[^<]*\S[^<]*<\/title>/i.test(html)) errors.push(name + ' has no <title>');
  }
  for (const o of otherOrigins(html)) errors.push(name + ' references another origin: ' + o);
  let bySrc = 0;
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const attrs = m[1];
    const src = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    if (src) {
      bySrc++;
      const v = (src[1] ?? src[2] ?? src[3] ?? '').trim();
      if (v !== './app.mjs' && v !== 'app.mjs') errors.push(name + ' loads a script that is not ./app.mjs: ' + v);
      else if (!/\btype\s*=\s*["']?module\b/i.test(attrs)) errors.push(name + ' loads ' + v + ' without type="module"');
    }
    if (m[2].trim()) errors.push(name + ' has an inline <script>: the code lives in app.mjs');
  }
  if (bySrc > 1) errors.push(name + ' loads ' + bySrc + ' scripts by src: at most one, ./app.mjs');
  for (const tag of ['iframe', 'frame', 'object', 'embed']) if (new RegExp('<' + tag + '\\b', 'i').test(html)) errors.push(name + ' has an <' + tag + '>');
  if (/<form\b[^>]*\baction\s*=\s*["']?\s*(?:https?:|\/\/)/i.test(html)) errors.push(name + ' has a form that posts to another origin');
  if (/<meta\b[^>]*http-equiv\s*=\s*["']?refresh/i.test(html)) errors.push(name + ' has a meta refresh');
  if (/javascript:/i.test(html)) errors.push(name + ' uses a javascript: address');
  const handlers = new Set();
  for (const m of html.matchAll(/<[a-z][^>]*>/gi)) for (const h of m[0].matchAll(/\s(on[a-z]+)\s*=/gi)) handlers.add(h[1].toLowerCase());
  for (const h of handlers) errors.push(name + ' has an inline event handler ' + h + '=: the code lives in app.mjs');
  for (const [re, what] of HTML_FORBIDDEN) if (re.test(html)) errors.push(name + ' uses ' + what);
}

/**
 * Validate an app directory by its files alone (no code runs): the rules in the header.
 * @param {string} dir the app directory
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateApp(dir) {
  const errors = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) {
    return { ok: false, errors: ['the app directory is unreadable: ' + String((e && e.code) || (e && e.message) || e)] };
  }
  const names = [];
  let total = 0;
  for (const d of entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const abs = path.join(dir, d.name);
    const st = fs.lstatSync(abs);
    if (st.isDirectory()) { errors.push(d.name + ' is a directory: an app is top-level files only'); continue; }
    if (!st.isFile()) { errors.push(d.name + ' is not a regular file'); continue; }
    if (!NAME_RE.test(d.name)) errors.push('the file name "' + d.name + '" does not match ' + NAME_RE);
    else if (!APP_EXTS.includes(path.extname(d.name).toLowerCase())) errors.push(d.name + ': an app holds only ' + APP_EXTS.join(', ') + ' files');
    total += st.size;
    names.push(d.name);
  }
  if (total >= MAX_APP_BYTES) errors.push('the app is ' + total + ' bytes: it must be under ' + MAX_APP_BYTES);
  const read = (n) => fs.readFileSync(path.join(dir, n), 'utf8');
  const sized = (n) => { const b = fs.statSync(path.join(dir, n)).size; if (b > MAX_FILE_BYTES) { errors.push(n + ' is over ' + MAX_FILE_BYTES + ' bytes'); return false; } return true; };

  if (!names.includes('index.html')) errors.push('no index.html in the app directory');
  else if (sized('index.html')) checkHtml('index.html', read('index.html'), errors, true);
  for (const n of names) if (n !== 'index.html' && /\.html$/i.test(n) && sized(n)) checkHtml(n, read(n), errors, false);
  for (const n of names) if (/\.css$/i.test(n) && sized(n)) for (const o of otherOrigins(read(n))) errors.push(n + ' references another origin: ' + o);

  if (!names.includes('app.mjs')) errors.push('no app.mjs in the app directory');
  for (const n of names) {
    if (n === 'test.mjs' || !/\.(?:mjs|js)$/i.test(n) || !sized(n)) continue;
    const src = read(n);
    for (const spec of specsOf(src)) if (!relOk(spec, names)) errors.push(n + ' imports "' + spec + '": only a ./x.mjs file of the app directory');
    for (const [re, what] of APP_FORBIDDEN) if (re.test(src)) errors.push(n + ' uses ' + what);
    if (n === 'app.mjs' && !EXPORT_RE.test(src)) errors.push('app.mjs exports nothing: it exports the logic index.html wires and test.mjs imports');
  }

  if (!names.includes('test.mjs')) errors.push('no test.mjs in the app directory');
  else if (sized('test.mjs')) {
    const src = read('test.mjs');
    const specs = specsOf(src);
    if (!specs.includes('./app.mjs')) errors.push('test.mjs does not import ./app.mjs');
    for (const spec of specs) if (!APP_TEST_IMPORTS.includes(spec) && !relOk(spec, names)) errors.push('test.mjs imports "' + spec + '": only ./x.mjs of the app directory, ' + APP_TEST_IMPORTS.join(', '));
    for (const [re, what] of TEST_FORBIDDEN) if (re.test(src)) errors.push('test.mjs uses ' + what);
    const n = declaredTests(src);
    if (n < MIN_TESTS) errors.push('test.mjs declares ' + n + ' tests: at least ' + MIN_TESTS);
  }
  return { ok: errors.length === 0, errors };
}

/** Run the app's tests exactly as probe.mjs runs a cell's (testArgv, bareEnv, TEST_BUDGET_MS, the one-summary rule). */
export function runAppTests(dir) {
  if (!fs.existsSync(path.join(dir, 'test.mjs'))) return { exitCode: null, passed: null, failed: null, tail: 'no test.mjs in the app directory' };
  const r = spawnSync(process.execPath, testArgv(dir), {
    cwd: dir, encoding: 'utf8', timeout: TEST_BUDGET_MS, env: bareEnv(), maxBuffer: 8 * 1024 * 1024, windowsHide: true,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const { passed, failed } = countTests(r.stdout || '');
  let tail = out.split(/\r?\n/).filter((l) => l.trim()).slice(-20).join('\n');
  if (r.error && r.error.code === 'ETIMEDOUT') tail = ('killed after ' + TEST_BUDGET_MS + ' ms\n' + tail).trim();
  if (passed === null || failed === null) tail = ('no single pass/fail summary on stdout: the count is null\n' + tail).trim();
  return { exitCode: typeof r.status === 'number' ? r.status : null, passed, failed, tail: tail.slice(-2000) };
}

/** Every top-level regular file of the directory and its bytes. */
export function filesOf(dir) {
  const out = {};
  try {
    for (const d of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const st = fs.lstatSync(path.join(dir, d.name));
      if (st.isFile()) out[d.name] = st.size;
    }
  } catch { /* an unreadable directory has no files; validateApp says why */ }
  return out;
}

export function probeApp(dir, nonce) {
  const t0 = performance.now();
  const cpu0 = process.cpuUsage();
  const validate = validateApp(dir);
  const tests = runAppTests(dir);
  return {
    nonce, kind: 'app', slug: path.basename(dir), node: process.version, validate, tests, files: filesOf(dir),
    probeMs: Math.round(performance.now() - t0),
    probeCpuMs: Math.round((() => { const c = process.cpuUsage(cpu0); return (c.user + c.system) / 1000; })()),
  };
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === '--help' || argv[0] === '-h') {
    process.stdout.write(USAGE + '\n');
    process.exit(argv.length ? 0 : 2);
  }
  const i = argv.indexOf('--nonce-file');
  const nonce = takeNonce(i >= 0 && i + 1 < argv.length ? argv[i + 1] : null); // before anything of the app is read
  const dir = path.resolve(argv[0]);
  let out;
  try { out = probeApp(dir, nonce); } catch (e) {
    out = { nonce, kind: 'app', slug: path.basename(dir), node: process.version,
      validate: { ok: false, errors: ['the probe failed: ' + String((e && e.message) || e).slice(0, 300)] },
      tests: { exitCode: null, passed: null, failed: null, tail: '' }, files: {}, probeMs: null, probeCpuMs: null };
  }
  process.stdout.write(JSON.stringify(out) + '\n', () => process.exit(0));
}
