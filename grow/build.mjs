// grow/build.mjs: THE BUILDER ARM'S VALIDATE, JUDGE AND PROMOTE (his NEXT-WEEK.md Day 2: "make me a todo app" makes
// the organism write it, run it in the sandbox and serve it at a URL). An app is a directory of top-level files
// (index.html, app.mjs, test.mjs; grow/probe-app.mjs holds the rules); the sandbox runs it with
// `node grow/sandbox.mjs run <appDir> --app` and writes <appDir>/result.json; this file does the rest.
//
// Three verbs, one JSON line on stdout each; a failure prints one stderr line and exits non-zero:
//   validate <appDir>              validateApp (grow/probe-app.mjs) plus the directory name is a slug and test.mjs
//                                  declares at least 3 tests; prints { ok, errors, slug }, exit 1 when not ok.
//   judge <appDir> [--out f]       reads <appDir>/result.json and writes <appDir>/verdict.json (or --out):
//                                  { candidate, slug, kind, survived, why, validate, tests, exitCode, error, at }.
//                                  survived only when validate.ok with no error, tests.failed 0, tests.exitCode 0,
//                                  tests.passed >= 3, exitCode 0 and error null; why names every clause that fails.
//                                  Exit 0 when a verdict is written (survived or not), 1 when result.json is unreadable.
//   promote <n> <slug> [--dir work/grow/gen-<n>/build] [--web web/dist] [--grown grown] [--root <dir>]
//                                  <dir>/<slug>/ with a survived verdict.json and the driver's app.json
//                                  ({ slug, name, prompt, generation, misses }) is served: its files but result.json,
//                                  verdict.json, app.json, brief.md and test.mjs go to <web>/apps/<slug>/, grown/apps.json
//                                  gains a row, grown/apps.mjs is regenerated (renderAppsMjs) and PROVEN (node --check,
//                                  import, appAnswer(the app's own prompt) is the slug), <web>/apps/index.html lists every
//                                  app. Any failure after the first write puts every file back. A slug already in
//                                  grown/apps.json is skipped (exit 0, nothing rewritten): a re-run converges.
// --root moves every default (state/, web/dist, grown) under another directory, and relative flags resolve against it.
// No language model, no socket: files in, files out.
// Author: Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01), his NEXT-WEEK.md builder arm.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateApp, declaredTests, MIN_TESTS } from './probe-app.mjs';
import { buildRequest, SLUG_RE } from './app-slug.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** What a driver commits after a promote. */
export const APP_FILES = ['grown/apps.json', 'grown/apps.mjs'];
/** The files of an app directory that are never served. */
export const NOT_SERVED = Object.freeze(['result.json', 'verdict.json', 'app.json', 'brief.md', 'test.mjs']);
/** Where a here result may come from (grow/sandbox.mjs CLOUD_ENV): anywhere else it ran on his PC and is never promoted. */
export const CLOUD_ENV = Object.freeze(['CLAUDE_CODE_REMOTE', 'GITHUB_ACTIONS', 'VERCEL', 'CI']);
export const USAGE = [
  'usage: node grow/build.mjs <verb> [args] [flags]',
  '  validate <appDir>                 prints {ok, errors, slug}; exit 1 when not ok',
  '  judge <appDir> [--out verdict.json]   reads <appDir>/result.json, writes the verdict; prints it',
  '  promote <n> <slug> [--dir work/grow/gen-<n>/build] [--web web/dist] [--grown grown] [--root <dir>]',
  '      serves <dir>/<slug>/ at /apps/<slug>/ (a survived verdict.json and app.json, else refused);',
  '      prints {promoted, skipped, apps, generation, path}',
].join('\n');

export class Fail extends Error {}
const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);
const posix = (p) => p.split(path.sep).join('/');
const fmt = (x) => (x === undefined ? 'missing' : JSON.stringify(x));

// ---------------------------------------------------------------- arguments
const FLAGS = new Set(['out', 'dir', 'web', 'grown', 'root']);
export function parseArgs(argv) {
  const pos = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!FLAGS.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)');
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '' || (eq < 0 && v.startsWith('--'))) throw new Fail('flag --' + name + ' needs a value');
    flags[name] = v;
  }
  return { pos, flags };
}

function readJson(file, what) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { throw new Fail(what + ' is unreadable: ' + (e?.code || oneLine(e?.message))); }
  try { return JSON.parse(text); } catch (e) { throw new Fail(what + ' is not JSON: ' + oneLine(e.message)); }
}

// ---------------------------------------------------------------- validate
/** validateApp, plus: the directory name is a slug, and test.mjs declares at least MIN_TESTS tests. */
export function validate(appDir) {
  const abs = path.resolve(appDir);
  const slug = path.basename(abs);
  const errors = [...validateApp(abs).errors];
  if (!SLUG_RE.test(slug)) errors.push('the app directory name "' + slug + '" is not a slug (' + SLUG_RE + ')');
  const tf = path.join(abs, 'test.mjs');
  if (fs.existsSync(tf) && fs.lstatSync(tf).isFile()) {
    const n = declaredTests(fs.readFileSync(tf, 'utf8'));
    const e = 'test.mjs declares ' + n + ' tests: at least ' + MIN_TESTS;
    if (n < MIN_TESTS && !errors.includes(e)) errors.push(e);
  }
  return { ok: errors.length === 0, errors, slug };
}

// ---------------------------------------------------------------- judge
/** The verdict of an app's result.json: every failed clause named in why; survived only when why is empty. */
export function verdictOf(result, { appDir, now = () => new Date() } = {}) {
  const r = result && typeof result === 'object' && !Array.isArray(result) ? result : {};
  const why = [];
  const v = r.validate && typeof r.validate === 'object' ? r.validate : null;
  const errors = Array.isArray(v?.errors) ? v.errors.map((e) => String(e)) : [];
  const t = r.tests && typeof r.tests === 'object' ? r.tests : {};
  if (r.kind !== 'app') why.push('result.json kind is ' + fmt(r.kind) + ', not app');
  if (v?.ok !== true) why.push('validate.ok is not true' + (errors.length ? ': ' + errors.join('; ') : ''));
  else if (errors.length) why.push('validate lists ' + errors.length + ' error(s) beside ok: ' + errors.join('; '));
  if (t.failed !== 0) why.push('tests.failed is ' + fmt(t.failed) + ', not 0');
  if (t.exitCode !== 0) why.push('tests.exitCode is ' + fmt(t.exitCode) + ', not 0');
  if (!(Number.isInteger(t.passed) && t.passed >= MIN_TESTS)) why.push('tests.passed is ' + fmt(t.passed) + ', under ' + MIN_TESTS);
  if (r.exitCode !== 0) why.push('exitCode is ' + fmt(r.exitCode) + ', not 0');
  if (r.error !== null) why.push(r.error === undefined ? 'result.json carries no error field' : 'the run recorded an error: ' + oneLine(r.error));
  const dir = appDir ? path.resolve(appDir) : null;
  return {
    candidate: r.candidate ?? (dir ? (path.relative(ROOT, dir).startsWith('..') ? posix(dir) : posix(path.relative(ROOT, dir))) : null),
    slug: typeof r.slug === 'string' ? r.slug : (dir ? path.basename(dir) : null),
    kind: 'app', survived: why.length === 0, why,
    validate: { ok: v?.ok === true, errors },
    tests: { passed: t.passed ?? null, failed: t.failed ?? null, exitCode: t.exitCode ?? null },
    exitCode: r.exitCode ?? null, error: r.error ?? null, at: now().toISOString(),
  };
}

export function judge(appDir, { out, now } = {}) {
  const abs = path.resolve(appDir);
  const result = readJson(path.join(abs, 'result.json'), posix(path.join(appDir, 'result.json')));
  const verdict = verdictOf(result, { appDir: abs, now });
  const file = path.resolve(out || path.join(abs, 'verdict.json'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  return verdict;
}

// ---------------------------------------------------------------- grown/apps.mjs and the apps page
const APPS_HEAD = '// grown/apps.mjs: GENERATED by `node grow/build.mjs promote` (his NEXT-WEEK.md Day 2 builder arm). The apps\n'
  + '// the organism built, in grown/apps.json order; each is served at its path. Do not edit by hand: the next promote\n';
export const APPS_BODY = [
  '/** The built app a build request names, or null. Shape: { slug, name, generation, path }. */',
  'export function appAnswer(prompt) {',
  '  const r = buildRequest(prompt);',
  '  if (!r) return null;',
  '  const a = APPS.find((x) => x.slug === r.slug);',
  '  return a ? { slug: a.slug, name: a.name, generation: a.generation, path: a.path } : null;',
  '}',
  '',
].join('\n');

/** grown/apps.mjs for a grown/apps.json: the header, the import, APPS (slug, name, generation, path, at), appAnswer. */
export function renderAppsMjs(appsJson) {
  const apps = Array.isArray(appsJson?.apps) ? appsJson.apps : [];
  const gen = apps.reduce((g, a) => (Number.isInteger(a?.generation) && a.generation > g ? a.generation : g), 0);
  const what = apps.length === 0 ? 'no app yet.' : apps.length + (apps.length === 1 ? ' app.' : ' apps.');
  const rows = apps.map((a) => '  Object.freeze(' + JSON.stringify({ slug: a.slug, name: a.name, generation: a.generation, path: a.path, at: a.at }) + '),');
  return APPS_HEAD + '// rewrites it. Generation ' + gen + ': ' + what + '\n'
    + "import { buildRequest } from '../grow/app-slug.mjs';\n\n"
    + (rows.length ? 'export const APPS = Object.freeze([\n' + rows.join('\n') + '\n]);\n' : 'export const APPS = Object.freeze([]);\n')
    + '\n' + APPS_BODY;
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** <web>/apps/index.html: every app as a link to its path, the prompt it was built from and its generation. Self contained. */
export function renderAppsIndex(appsJson) {
  const apps = Array.isArray(appsJson?.apps) ? appsJson.apps : [];
  const items = apps.map((a) => '    <li><a href="' + esc(a.path) + '">' + esc(a.name) + '</a><span>built from &ldquo;' + esc(a.prompt)
    + '&rdquo;, generation ' + esc(a.generation) + '</span></li>');
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<title>Built apps</title>',
    '<style>',
    '  :root { color-scheme: light dark; --ink: #1b1b1b; --paper: #fafaf7; --line: #d9d9d2; --muted: #6b6b66; }',
    '  @media (prefers-color-scheme: dark) { :root { --ink: #ecece6; --paper: #161615; --line: #34342f; --muted: #9a9a92; } }',
    '  body { margin: 0; background: var(--paper); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }',
    '  main { max-width: 40rem; margin: 3rem auto; padding: 0 16px; }',
    '  ul { list-style: none; padding: 0; }',
    '  li { display: flex; flex-wrap: wrap; gap: .25rem 1rem; padding: .6rem 0; border-bottom: 1px solid var(--line); }',
    '  a { color: inherit; font-weight: 600; }',
    '  span, p { color: var(--muted); }',
    '</style>',
    '</head>',
    '<body>',
    '<main>',
    '  <h1>Built apps</h1>',
    '  <p>Each app was written by the organism, run in the sandbox and judged by its own tests before it was served here.</p>',
    apps.length ? '  <ul>\n' + items.join('\n') + '\n  </ul>' : '  <p>No app yet.</p>',
    '</main>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------- promote
function readApps(file) {
  if (!fs.existsSync(file)) return { apps: [] };
  const j = readJson(file, file);
  if (!j || !Array.isArray(j.apps)) throw new Fail(file + ' is not { apps: [..] }');
  return j;
}

function nodeCheck(file) {
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Fail('node --check ' + file + ' failed: ' + oneLine(r.stderr || r.stdout));
}

/** The verdict clauses a survivor must carry, re-read from verdict.json's own fields (and result.json when present). */
export function survivorFailures(verdict, result, slug, env = process.env) {
  const v = verdict && typeof verdict === 'object' ? verdict : {};
  const f = [];
  if (v.survived !== true) f.push('survived is not true');
  if (v.kind !== 'app') f.push('kind is ' + fmt(v.kind) + ', not app');
  if (v.slug !== slug) f.push('the verdict names slug ' + fmt(v.slug) + ', not ' + slug);
  if (!Array.isArray(v.why) || v.why.length) f.push('why is not an empty list');
  if (!(v.validate?.ok === true && Array.isArray(v.validate.errors) && v.validate.errors.length === 0)) f.push('validate is not ok with no error');
  if (!(v.tests?.failed === 0 && v.tests?.exitCode === 0 && Number.isInteger(v.tests?.passed) && v.tests.passed >= MIN_TESTS)) f.push('tests are not failed 0, exit code 0, passed ' + MIN_TESTS + ' or more');
  if (v.exitCode !== 0) f.push('exitCode is ' + fmt(v.exitCode));
  if (v.error !== null) f.push('error is ' + fmt(v.error));
  if (result && result.backend === 'here' && !CLOUD_ENV.some((k) => env[k])) f.push('result.json backend is here and this is not a cloud VM: an app never runs on his PC');
  return f;
}

export async function promote({ gen, slug, dir, webDir, grownDir, now = () => new Date(), env = process.env }) {
  if (!SLUG_RE.test(String(slug ?? ''))) throw new Fail('slug "' + (slug ?? '') + '" is not a slug (' + SLUG_RE + ')');
  const appsPath = path.join(grownDir, 'apps.json');
  const mjsPath = path.join(grownDir, 'apps.mjs');
  const apps = readApps(appsPath);
  const pathOf = '/apps/' + slug + '/';
  if (apps.apps.some((a) => a && a.slug === slug)) return { promoted: [], skipped: [slug], apps: apps.apps.length, generation: gen, path: pathOf };
  const appDir = path.join(dir, slug);
  if (!fs.existsSync(appDir) || !fs.statSync(appDir).isDirectory()) throw new Fail('no app directory at ' + posix(appDir));
  const vFile = path.join(appDir, 'verdict.json');
  if (!fs.existsSync(vFile)) throw new Fail(slug + ': no verdict.json: run node grow/build.mjs judge first');
  const verdict = readJson(vFile, slug + '/verdict.json');
  if (verdict?.survived !== true) throw new Fail(slug + ': verdict.json says survived ' + fmt(verdict?.survived) + ': only a survivor is served');
  const rFile = path.join(appDir, 'result.json');
  const result = fs.existsSync(rFile) ? readJson(rFile, slug + '/result.json') : null;
  const broken = survivorFailures(verdict, result, slug, env);
  if (broken.length) throw new Fail(slug + ': verdict.json says survived true but the clauses fail: ' + broken.join('; '));
  const aFile = path.join(appDir, 'app.json');
  if (!fs.existsSync(aFile)) throw new Fail(slug + ': no app.json ({ slug, name, prompt, generation, misses }): the driver writes it');
  const app = readJson(aFile, slug + '/app.json');
  if (app?.slug !== slug) throw new Fail(slug + ': app.json names slug ' + fmt(app?.slug) + ', not its directory');
  if (typeof app.name !== 'string' || !app.name.trim()) throw new Fail(slug + ': app.json has no name');
  if (typeof app.prompt !== 'string' || !app.prompt.trim()) throw new Fail(slug + ': app.json has no prompt');
  if (app.generation !== undefined && app.generation !== gen) throw new Fail(slug + ': app.json says generation ' + fmt(app.generation) + ', not the promoted generation ' + gen);
  const asked = buildRequest(app.prompt);
  if (!asked || asked.slug !== slug) throw new Fail(slug + ': the prompt ' + JSON.stringify(app.prompt) + ' names ' + (asked ? 'slug ' + asked.slug : 'no app') + ', so appAnswer could never reach it');
  const v = validateApp(appDir);
  if (!v.ok) throw new Fail(slug + ': the app on disk fails validateApp: ' + v.errors.join('; '));
  const names = fs.readdirSync(appDir, { withFileTypes: true }).filter((d) => d.isFile() && !NOT_SERVED.includes(d.name)).map((d) => d.name).sort();
  for (const must of ['index.html', 'app.mjs']) if (!names.includes(must)) throw new Fail(slug + ': no ' + must + ' to serve');
  const slugModule = path.join(grownDir, '..', 'grow', 'app-slug.mjs');
  if (!fs.existsSync(slugModule)) throw new Fail('grown/apps.mjs imports ../grow/app-slug.mjs and there is none at ' + posix(slugModule));
  const appsWeb = path.join(webDir, 'apps');
  const target = path.join(appsWeb, slug);
  if (fs.existsSync(target) && fs.readdirSync(target).length) throw new Fail(posix(target) + ' already holds files: a promote never overwrites an app');

  const indexPath = path.join(appsWeb, 'index.html');
  const backup = { json: fs.existsSync(appsPath) ? fs.readFileSync(appsPath) : null, mjs: fs.existsSync(mjsPath) ? fs.readFileSync(mjsPath) : null, index: fs.existsSync(indexPath) ? fs.readFileSync(indexPath) : null };
  const madeTarget = !fs.existsSync(target);
  const written = [];
  try {
    fs.mkdirSync(target, { recursive: true });
    for (const n of names) { const to = path.join(target, n); fs.copyFileSync(path.join(appDir, n), to, fs.constants.COPYFILE_EXCL); written.push(to); }
    const row = { slug, name: app.name.trim(), prompt: app.prompt, generation: gen, at: now().toISOString(), path: pathOf, files: names, tests: { passed: verdict.tests.passed } };
    const next = { ...apps, apps: [...apps.apps, row] };
    fs.mkdirSync(grownDir, { recursive: true });
    fs.writeFileSync(appsPath, JSON.stringify(next, null, 2) + '\n');
    fs.writeFileSync(mjsPath, renderAppsMjs(next));
    nodeCheck(mjsPath);
    const mod = await import(pathToFileURL(mjsPath).href + '?v=' + Date.now() + '-' + Math.random().toString(36).slice(2));
    if (!Array.isArray(mod.APPS) || typeof mod.appAnswer !== 'function') throw new Fail('grown/apps.mjs does not export APPS and appAnswer');
    if (mod.APPS.length !== next.apps.length) throw new Fail('grown/apps.mjs exports ' + mod.APPS.length + ' apps, grown/apps.json lists ' + next.apps.length);
    const got = mod.appAnswer(app.prompt);
    if (!got || got.slug !== slug || got.path !== pathOf) throw new Fail('appAnswer(' + JSON.stringify(app.prompt) + ') is ' + JSON.stringify(got) + ', not the slug ' + slug);
    fs.writeFileSync(indexPath, renderAppsIndex(next));
    return { promoted: [slug], skipped: [], apps: next.apps.length, generation: gen, path: pathOf };
  } catch (e) {
    for (const f of written.reverse()) { try { fs.rmSync(f, { force: true }); } catch { /* best effort */ } }
    if (madeTarget) { try { fs.rmSync(target, { recursive: true, force: true }); } catch { /* best effort */ } }
    const put = (file, data) => { if (data) fs.writeFileSync(file, data); else fs.rmSync(file, { force: true }); };
    put(appsPath, backup.json); put(mjsPath, backup.mjs); put(indexPath, backup.index);
    const msg = e instanceof Fail ? e.message : 'promote failed: ' + oneLine(e?.message || e);
    throw new Fail(msg + ' (rolled back: grown/ and ' + posix(appsWeb) + ' are as they were)');
  }
}

// ---------------------------------------------------------------- CLI
/** { out, code }: out is the one JSON line's object (or usage text), code the exit code. */
export async function main(argv = process.argv.slice(2), { env = process.env } = {}) {
  const { pos, flags } = parseArgs(argv);
  if (flags.help) return { usage: true, code: 0 };
  const verb = pos[0];
  if (!verb) throw new Fail('no verb: validate, judge or promote (see --help)');
  if (verb === 'validate') {
    if (pos.length !== 2) throw new Fail('validate takes <appDir> (see --help)');
    const out = validate(pos[1]);
    return { out, code: out.ok ? 0 : 1, err: out.ok ? null : 'validate: ' + out.errors.length + ' error(s) in ' + out.slug + ': ' + out.errors[0] };
  }
  if (verb === 'judge') {
    if (pos.length !== 2) throw new Fail('judge takes <appDir> (see --help)');
    return { out: judge(pos[1], { out: flags.out }), code: 0 };
  }
  if (verb === 'promote') {
    if (pos.length !== 3) throw new Fail('promote takes <n> <slug> (see --help)');
    if (!/^\d{1,6}$/.test(pos[1])) throw new Fail('generation "' + pos[1] + '" is not a whole number');
    const gen = Number(pos[1]);
    const root = flags.root ? path.resolve(flags.root) : null;
    const at = (p, dflt) => (p ? path.resolve(root || process.cwd(), p) : path.join(root || ROOT, ...dflt));
    return { out: await promote({ gen, slug: pos[2], dir: at(flags.dir, ['work', 'grow', 'gen-' + gen, 'build']), webDir: at(flags.web, ['web', 'dist']), grownDir: at(flags.grown, ['grown']), env }), code: 0 };
  }
  throw new Fail('unknown verb ' + verb + ' (validate, judge, promote; see --help)');
}

const self = fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invoked && (process.platform === 'win32' ? invoked.toLowerCase() === self.toLowerCase() : invoked === self)) {
  main().then(
    (r) => {
      if (r.usage) { console.log(USAGE); return; }
      console.log(JSON.stringify(r.out));
      if (r.err) process.stderr.write(oneLine(r.err) + '\n');
      process.exitCode = r.code;
    },
    (e) => { process.stderr.write((e instanceof Fail ? oneLine(e.message) : 'build: ' + oneLine(e?.stack || e)) + '\n'); process.exitCode = 1; },
  );
}
