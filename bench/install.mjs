#!/usr/bin/env node
// bench/install.mjs: THE INSTALL BAR. docs/VISION.md order 44 clause (3), his words (2026-09-27): "I want the
// Brain to be a very important tool, even for you for further ambitious projects, and for developesr all across".
// A developer across the world does not clone this tree: they install a tarball. This bar packs the tree the way
// npm would, installs the tarball into an EMPTY directory, and asks the installed copy his bare prompts.
//
// WHAT IT MEASURES, in order:
//   (a) the import tracer. From bin/brain.mjs and act/prompt.mjs it follows every static import, every import()
//       whose specifier is a relative string, and every quoted relative module path (bin/brain.mjs loads its heavy
//       commands through a lazy('../act/prompt.mjs') helper and a LEARNING_SPECS array, which no import regex
//       sees), transitively. Then the data files those modules name: readFileSync / readFile / createReadStream
//       with a string literal, new URL('<rel>', import.meta.url), path.join / path.resolve of a directory constant
//       and string literals (the constant resolved when the module defines it from import.meta.url), every .json
//       next to a reached module, and world/policy.json. A data file under an excluded prefix (bench/fixtures/,
//       bench/verdicts/, state/, ...) is listed as dataExcluded: it is runtime or reproducible data that never
//       ships, and the installed run below measures what the copy does without it. A path no file sits at is
//       listed as dataAbsent (a file the organism writes, or an optional one).
//   (b) npm pack --dry-run --json in the tree: every path the tarball would carry. missingImports = reached files
//       not in the tarball; excludedPresent = tarball paths under state/, bench/fixtures/, bench/verdicts/,
//       organism/, docs/, web/dist/, .vercel/, or a file named .env or .env.local (or any .env.<suffix>).
//   (c) the real pack into the scratch dir, npm install <tarball> --no-audit --no-fund --offline in an EMPTY
//       directory there, then the installed bin: --version, --help, init dilation, and ask dilation "<prompt>"
//       for his five bare prompts with --provider null and no knowledge store (the installed copy carries none).
//       Per prompt: answered (non-empty text that is not one of the two memory-miss texts), the route, the first
//       line. THE CONTROL: the same five prompts through the TREE's own bin, same fresh brain, same provider null,
//       where the knowledge store (bench/fixtures/wiki/store) and the kept programs (bench/verdicts/
//       induce-programs.json) are on disk. A prompt the tree answers and the install does not is a prompt that
//       rests on data the tarball does not carry, named in the verdict.
//   (d) bench/verdicts/install.json, written from the measurements above.
//
// MODEL OFF: provider null on every ask, every BRAIN_ variable removed from the child environment, no socket.
//
//   node bench/install.mjs                         the bar (writes bench/verdicts/install.json)
//   node bench/install.mjs --trace                 the tracer only, printed, nothing written
//   node bench/install.mjs --out F --scratch D     write the verdict to F, work under D (the test uses this)
//   node bench/install.mjs --no-control            skip the tree control arm
//
// Zero dependencies. Node 24 ESM.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const ENTRIES = Object.freeze(['bin/brain.mjs', 'act/prompt.mjs']);
export const EXCLUDED_PREFIXES = Object.freeze(['state/', 'bench/fixtures/', 'bench/verdicts/', 'organism/', 'docs/', 'web/dist/', '.vercel/']);
/** His five bare prompts (docs/VISION.md order 41 and 44). */
export const PROMPTS = Object.freeze(['hey', 'hi', '2+2', 'What is 12 times 12?', 'What is the capital of France?']);
/** The two memory-miss texts: an answer that carries either is a miss, not an answer. */
export const MISS_TEXTS = Object.freeze(['I do not carry that yet', 'nothing in memory matches']);
export const VERDICT = path.join(ROOT, 'bench', 'verdicts', 'install.json');

const MODULE_EXT = /\.(?:mjs|js|cjs)$/;
const DATA_EXT = /\.(?:json|jsonl|bin|txt|csv|tsv|wasm|html|css)$/i;
const BARE_SPEC = /^(?:@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(?:\/[\w.-]+)*$/i;

/** Forward slashes, no leading ./ and no npm tarball 'package/' prefix. */
export function norm(p) {
  let n = String(p).replaceAll('\\', '/');
  while (n.startsWith('./')) n = n.slice(2);
  if (n.startsWith('package/')) n = n.slice('package/'.length);
  return n;
}

/**
 * True when a package-relative path must never be in the tarball.
 * @param {string} rel
 */
export function isExcluded(rel) {
  const n = norm(rel);
  for (const pre of EXCLUDED_PREFIXES) if (n === pre.slice(0, -1) || n.startsWith(pre)) return true;
  const base = n.split('/').pop();
  return base === '.env' || base === '.env.local' || base.startsWith('.env.');
}

function isFile(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function inside(root, p) { const r = path.relative(root, p); return r !== '' && !r.startsWith('..') && !path.isAbsolute(r); }
const lits = (s) => [...s.matchAll(/(['"])((?:(?!\1)[^\\\n])*)\1/g)].map((m) => m[2]);

/**
 * The directory constants a module defines from its own location, so path.join(HERE, '..', 'x.json') resolves
 * exactly: NAME = path.dirname(fileURLToPath(import.meta.url)), NAME = path.resolve|join(KNOWN, 'lit', ...),
 * NAME = fileURLToPath(new URL('lit', import.meta.url)).
 */
export function dirConstants(src, file) {
  const known = new Map([['__dirname', path.dirname(file)]]);
  const defs = [...src.matchAll(/(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/g)];
  for (let pass = 0; pass < 4; pass++) {
    for (const [, name, expr] of defs) {
      if (known.has(name)) continue;
      if (/^(?:path\.)?dirname\(\s*fileURLToPath\(\s*import\.meta\.url\s*\)\s*\)/.test(expr)) { known.set(name, path.dirname(file)); continue; }
      const u = expr.match(/^fileURLToPath\(\s*new URL\(\s*(['"])([^'"]+)\1\s*,\s*import\.meta\.url\s*\)\s*\)/);
      if (u) { known.set(name, path.resolve(path.dirname(file), u[2])); continue; }
      const j = expr.match(/^(?:path\.)?(?:resolve|join)\(\s*([A-Za-z_$][\w$]*)\s*((?:,\s*(['"])[^'"]*\3\s*)*)\)/);
      if (j && known.has(j[1])) known.set(name, path.resolve(known.get(j[1]), ...lits(j[2])));
    }
  }
  return known;
}

/**
 * Every relative module specifier and every data path a module names, with how it was found.
 * @param {string} src the module's source
 * @param {string} file its absolute path
 * @param {string} root the package root
 */
export function scanModule(src, file, root) {
  const dir = path.dirname(file);
  const mods = [], data = [], bare = [], blind = [];
  const push = (arr, spec, how) => arr.push({ spec, how });
  for (const m of src.matchAll(/^[ \t]*import\s+(?:[\w$*{}\s,])+?\s*from\s*(['"])([^'"\n]+)\1/gm)) push(mods, m[2], 'static');
  for (const m of src.matchAll(/^[ \t]*import\s*(['"])([^'"\n]+)\1/gm)) push(mods, m[2], 'static');
  for (const m of src.matchAll(/^[ \t]*export\s*(?:\*|\{[^}]*\})\s*(?:as\s+[\w$]+\s*)?from\s*(['"])([^'"\n]+)\1/gm)) push(mods, m[2], 'static');
  for (const m of src.matchAll(/\bimport\s*\(\s*(['"])([^'"\n]+)\1\s*[,)]/g)) push(mods, m[2], 'dynamic');
  for (const m of src.matchAll(/\bimport\s*\(\s*`([^`]*)`/g)) (m[1].includes('${') ? blind : mods).push({ spec: m[1], how: 'dynamic' });
  // import(<expression>): the literals inside it, joined as path segments against the module's directory and the
  // package root (pathToFileURL(path.join(root, 'mind', 'imagine.mjs')), new URL('./resume.mjs', import.meta.url),
  // u('act/run.mjs')). A literal that lands on a module is followed; an expression with none stays blind and is listed.
  for (const m of src.matchAll(/\bimport\s*\(\s*(?![\s'"`])([^;\n]{1,160})/g)) {
    const expr = m[1].trim();
    const segs = lits(expr);
    const lastMod = segs.length && MODULE_EXT.test(segs[segs.length - 1]);
    const alts = lastMod ? [path.resolve(dir, ...segs), path.resolve(root, ...segs)] : [];
    const hit = alts.find((a) => isFile(a));
    if (hit) mods.push({ abs: hit, spec: segs.join('/'), how: 'dynamic-computed' });
    else blind.push({ spec: expr.slice(0, 100), how: 'dynamic-expression' });
  }
  for (const m of src.matchAll(/(['"])(\.\.?\/[^'"\s\n]+\.(?:mjs|js|cjs))\1/g)) push(mods, m[2], 'literal');
  for (const m of mods) if (!m.abs && !m.spec.startsWith('.') && !m.spec.startsWith('node:') && m.how !== 'literal' && BARE_SPEC.test(m.spec)) bare.push(m);

  const consts = dirConstants(src, file);
  // a data candidate is a group of alternatives: one path when the base is known, the module's directory and the
  // package root when it is not (an imported or computed base), whichever holds the file
  const cand = (alts, how, known) => data.push({ alts, how, known });
  // a quoted relative data path, relative to the module
  for (const m of src.matchAll(/(['"])(\.\.?\/[^'"\s\n]+)\1/g)) if (DATA_EXT.test(m[2])) cand([path.resolve(dir, m[2])], 'relative-literal', true);
  // new URL('<rel>', import.meta.url)
  for (const m of src.matchAll(/new URL\(\s*(['"])([^'"\n]+)\1\s*,\s*import\.meta\.url/g)) if (!MODULE_EXT.test(m[2])) cand([path.resolve(dir, m[2])], 'new-url', true);
  // readFileSync / readFile / createReadStream / fs.promises reads with a string literal first argument
  for (const m of src.matchAll(/\b(?:readFileSync|readFile|createReadStream|openSync|open)\(\s*(['"])([^'"\n]+)\1/g)) {
    if (!DATA_EXT.test(m[2])) continue;
    if (path.isAbsolute(m[2])) continue;
    cand(m[2].startsWith('.') ? [path.resolve(dir, m[2])] : [path.resolve(root, m[2]), path.resolve(dir, m[2])], 'read-literal', m[2].startsWith('.'));
  }
  // path.join / path.resolve of a directory constant and string literals
  for (const m of src.matchAll(/\b(?:path\.)?(?:join|resolve)\(\s*([A-Za-z_$][\w$]*)\s*((?:,\s*(['"])[^'"\n]*\3\s*)+)\)/g)) {
    const segs = lits(m[2]);
    const last = segs[segs.length - 1] || '';
    if (MODULE_EXT.test(last)) {
      const alts = consts.has(m[1]) ? [path.resolve(consts.get(m[1]), ...segs)] : [path.resolve(dir, ...segs), path.resolve(root, ...segs)];
      const hit = alts.find((a) => isFile(a));
      if (hit) mods.push({ abs: hit, spec: segs.join('/'), how: 'join-module' });
      continue;
    }
    if (!DATA_EXT.test(last)) continue;
    if (consts.has(m[1])) { cand([path.resolve(consts.get(m[1]), ...segs)], 'join:' + m[1], true); continue; }
    cand([path.resolve(dir, ...segs), path.resolve(root, ...segs)], 'join?:' + m[1], false);
  }
  return { mods, data, bare, blind };
}

/**
 * The transitive closure from the entries.
 * @param {string} root package root
 * @param {string[]} entries package-relative entry modules
 * @param {{always?: string[]}} [opts] data files always named (world/policy.json)
 */
export function trace(root, entries, opts = {}) {
  const modules = new Map(); // rel -> how it was first reached
  const data = new Map(), dataExcluded = new Map(), dataAbsent = new Map(), modulesExcluded = new Map();
  const dataUnknownBase = [];
  const unresolved = [], bare = [], blind = [];
  const queue = [];
  const addModule = (abs, how, from) => {
    const rel = norm(path.relative(root, abs));
    if (modules.has(rel) || modulesExcluded.has(rel)) return;
    if (isExcluded(rel)) { modulesExcluded.set(rel, { how, from }); return; }
    modules.set(rel, { how, from });
    queue.push(abs);
  };
  for (const e of entries) {
    const abs = path.resolve(root, e);
    if (!isFile(abs)) throw new Error('entry not found: ' + e);
    addModule(abs, 'entry', null);
  }
  // one candidate group: a file that exists wins; else an excluded path (runtime data that never ships); else, when
  // the base was known, the one path is absent (a file the organism writes, or an optional one); else the base is
  // unknown and the group is listed as such, never guessed into a path
  const addData = (alts, how, from, known = true) => {
    const rows = alts.filter((a) => inside(root, a)).map((a) => ({ abs: a, rel: norm(path.relative(root, a)) }));
    if (!rows.length) return;
    if (rows.some((r) => modules.has(r.rel))) return;
    const file = rows.find((r) => !isExcluded(r.rel) && isFile(r.abs));
    if (file) { if (!data.has(file.rel)) data.set(file.rel, { how, from }); dataAbsent.delete(file.rel); return; }
    const ex = rows.find((r) => isExcluded(r.rel));
    if (ex) { if (!dataExcluded.has(ex.rel)) dataExcluded.set(ex.rel, { how, from }); return; }
    if (rows.some((r) => isDir(r.abs))) return;
    if (known) { if (!data.has(rows[0].rel) && !dataAbsent.has(rows[0].rel)) dataAbsent.set(rows[0].rel, { how, from }); return; }
    dataUnknownBase.push({ from, how, tail: rows[0].rel.split('/').pop() });
  };
  const nextToSeen = new Set();
  while (queue.length) {
    const abs = queue.shift();
    const from = norm(path.relative(root, abs));
    const src = fs.readFileSync(abs, 'utf8');
    const s = scanModule(src, abs, root);
    for (const m of s.mods) {
      if (!m.abs && !m.spec.startsWith('./') && !m.spec.startsWith('../')) continue;
      const target = m.abs || path.resolve(path.dirname(abs), m.spec);
      if (!inside(root, target)) { if (m.how !== 'literal') unresolved.push({ from, spec: m.spec, how: m.how, why: 'outside the package' }); continue; }
      if (isFile(target)) {
        if (MODULE_EXT.test(target)) addModule(target, m.how, from);
        else addData([target], m.how, from);
      } else if (m.how !== 'literal') unresolved.push({ from, spec: m.spec, how: m.how, why: 'no file' });
    }
    for (const b of s.bare) bare.push({ from, spec: b.spec, how: b.how });
    for (const b of s.blind) blind.push({ from, spec: b.spec, how: b.how });
    for (const d of s.data) addData(d.alts, d.how, from, d.known);
    const dir = path.dirname(abs);
    if (!nextToSeen.has(dir)) {
      nextToSeen.add(dir);
      for (const f of fs.readdirSync(dir)) if (f.endsWith('.json') && isFile(path.join(dir, f))) addData([path.join(dir, f)], 'next-to', from);
    }
  }
  for (const a of opts.always || []) addData([path.resolve(root, a)], 'always', null);
  // a data path first seen as absent under one base and present under the other is present
  for (const rel of [...dataAbsent.keys()]) if (data.has(rel)) dataAbsent.delete(rel);
  const sortObj = (m) => [...m.keys()].sort();
  return {
    modules: sortObj(modules), data: sortObj(data), reached: [...sortObj(modules), ...sortObj(data)].sort(),
    dataExcluded: sortObj(dataExcluded), dataAbsent: sortObj(dataAbsent), modulesExcluded: sortObj(modulesExcluded),
    dataUnknownBase, unresolved, bare, blind, how: { modules: Object.fromEntries(modules), data: Object.fromEntries(data) },
  };
}

/** Every top-level directory (or root file) a list of paths sits in, with its count. */
export function topCounts(paths) {
  const c = {};
  for (const p of paths) { const n = norm(p); const i = n.indexOf('/'); const k = i < 0 ? n : n.slice(0, i) + '/'; c[k] = (c[k] || 0) + 1; }
  return Object.fromEntries(Object.entries(c).sort((a, b) => a[0].localeCompare(b[0])));
}

// ---------------------------------------------------------------- npm
/** npm as node + npm-cli.js, so no .cmd shim and no shell on Windows. Null when npm is absent. */
export function npmCli() {
  const cands = [
    process.env.npm_execpath,
    path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(path.dirname(process.execPath), '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
  ];
  for (const c of cands) if (c && path.basename(c) === 'npm-cli.js' && isFile(c)) return c;
  return null;
}
function childEnv(extra = {}) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!k.toUpperCase().startsWith('BRAIN_')) env[k] = v;
  return { ...env, npm_config_update_notifier: 'false', npm_config_fund: 'false', npm_config_audit: 'false', NO_COLOR: '1', FORCE_COLOR: '0', ...extra };
}
function npm(cli, args, cwd) {
  const t = process.hrtime.bigint();
  const r = spawnSync(process.execPath, [cli, ...args], { cwd, env: childEnv(), encoding: 'utf8', timeout: 300_000, maxBuffer: 256 * 1024 * 1024, windowsHide: true });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', ms: Number(process.hrtime.bigint() - t) / 1e6, error: r.error ? String(r.error.message) : null };
}
/** The first JSON value in npm's stdout (npm may print lifecycle lines before it). */
export function parsePackJson(stdout) {
  const i = stdout.indexOf('[');
  if (i < 0) throw new Error('npm pack printed no JSON');
  return JSON.parse(stdout.slice(i));
}

// ---------------------------------------------------------------- the installed copy
/** answered: a non-empty text that is not a memory miss. */
export function isAnswered(text) {
  const t = typeof text === 'string' ? text.trim() : '';
  if (!t) return false;
  const low = t.toLowerCase();
  return !MISS_TEXTS.some((m) => low.includes(m.toLowerCase()));
}
function brainRun(bin, args, cwd, stateDir) {
  const t = process.hrtime.bigint();
  const r = spawnSync(process.execPath, [bin, ...args], { cwd, env: childEnv({ BRAIN_STATE_DIR: stateDir }), encoding: 'utf8', timeout: 120_000, maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  return { status: r.status, stdout: r.stdout || '', stderr: r.stderr || '', ms: Math.round(Number(process.hrtime.bigint() - t) / 1e6) };
}
/** init dilation, then each prompt through `ask dilation <prompt> --provider null --json`. */
export function askArm(bin, cwd, stateDir, prompts) {
  fs.mkdirSync(stateDir, { recursive: true });
  const init = brainRun(bin, ['init', 'dilation', '--json', '--no-color'], cwd, stateDir);
  const rows = [];
  for (const prompt of prompts) {
    const r = brainRun(bin, ['ask', 'dilation', prompt, '--provider', 'null', '--json', '--no-color'], cwd, stateDir);
    let p = null;
    try { p = JSON.parse(r.stdout); } catch { p = null; }
    const text = p && p.ok ? String(p.text ?? '') : '';
    const answered = r.status === 0 && !!p && p.ok === true && isAnswered(text);
    rows.push({
      prompt, answered, route: p && p.route ? p.route : null, chars: text.length,
      provenance: p && p.provenance && p.provenance.answer ? p.provenance.answer : null,
      llm: p && p.provenance && p.provenance.llm ? p.provenance.llm.provider : null,
      firstLine: text ? text.split('\n')[0].slice(0, 200) : (p && p.error ? 'error: ' + String(p.error).slice(0, 180) : (r.stderr.split('\n')[0] || '').slice(0, 200)),
      exit: r.status, wallMs: r.ms,
    });
  }
  return { initExit: init.status, initFirstLine: (init.stdout || init.stderr).split('\n')[0].slice(0, 200), rows };
}

// ---------------------------------------------------------------- the bar
function arg(name) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : undefined; }
function dirBytes(d) {
  let n = 0;
  const walk = (p) => { let st; try { st = fs.lstatSync(p); } catch { return; } if (st.isDirectory()) for (const f of fs.readdirSync(p)) walk(path.join(p, f)); else n += st.size; };
  walk(d);
  return n;
}

export async function run({ out = VERDICT, scratch, control = true, log = console.log } = {}) {
  const started = Date.now();
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const t = trace(ROOT, [...ENTRIES], { always: ['world/policy.json'] });
  log('tracer: ' + t.modules.length + ' modules + ' + t.data.length + ' data files reached from ' + ENTRIES.join(', '));
  log('tracer: dataExcluded ' + t.dataExcluded.length + ' (' + t.dataExcluded.join(', ') + ')');
  log('tracer: dataAbsent ' + t.dataAbsent.length + ', unresolved ' + t.unresolved.length + ', bare ' + t.bare.length + ', blind dynamic imports ' + t.blind.length);

  const verdict = {
    at: null, command: 'node bench/install.mjs', node: process.version, npm: null,
    isTheBar: true, barMet: false,
    tarballBytes: null, unpackedBytes: null, files: null, reached: t.reached.length,
    reachedModules: t.modules.length, reachedData: t.data.length,
    missingImports: [], excludedPresent: [],
    dataExcluded: t.dataExcluded, dataAbsent: t.dataAbsent, modulesExcluded: t.modulesExcluded,
    dataUnknownBase: t.dataUnknownBase.length,
    dataUnknownBaseTails: [...new Set(t.dataUnknownBase.map((d) => d.tail))].sort(),
    unresolved: t.unresolved, bare: t.bare, blindDynamicImports: t.blind,
    version: null, versionExpected: pkg.version, helpFirstLine: null,
    install: null, prompts: [], control: null, claimedBare: [],
    tarballTop: null, reachedTop: topCounts(t.reached),
    split: {
      development: 'none: the tracer, the pack lists and the installed run are measurements of this tree at this commit, nothing is fit',
      heldOut: 'none',
      why: 'a packaging bar has no model and no parameter to fit; the five prompts are his fixed probe set (docs/VISION.md orders 41 and 44), asked once each, never tuned on',
      contaminated: false,
    },
    statement: null,
  };

  const cli = npmCli();
  if (!cli) {
    log('npm: ABSENT (no npm-cli.js beside ' + process.execPath + ' and no npm_execpath); the bar cannot pack and stops with barMet false');
    verdict.npm = 'absent';
    return finish(verdict, out, started, log);
  }
  const v = npm(cli, ['--version'], ROOT);
  verdict.npm = v.stdout.trim().split('\n')[0] || ('npm --version exited ' + v.status);
  log('npm: ' + verdict.npm);

  // (b) the dry run in the tree
  const dry = npm(cli, ['pack', '--dry-run', '--json', '--ignore-scripts'], ROOT);
  if (dry.status !== 0) { log('npm pack --dry-run exited ' + dry.status + ': ' + dry.stderr.split('\n').slice(0, 3).join(' | ')); return finish(verdict, out, started, log); }
  const info = parsePackJson(dry.stdout)[0];
  const tarPaths = info.files.map((f) => norm(f.path)).sort();
  const tarSet = new Set(tarPaths);
  verdict.files = tarPaths.length;
  verdict.unpackedBytes = info.unpackedSize;
  verdict.tarballTop = topCounts(tarPaths);
  verdict.missingImports = t.reached.filter((r) => !tarSet.has(r));
  verdict.excludedPresent = tarPaths.filter(isExcluded);
  log('pack --dry-run: ' + tarPaths.length + ' files, unpacked ' + info.unpackedSize + ' bytes, missingImports ' + verdict.missingImports.length + ', excludedPresent ' + verdict.excludedPresent.length);

  // (c) the real pack and the install into an empty directory
  // The work happens in a fresh run-<pid>-<ms> directory under the scratch dir (or the OS temp dir), never inside the
  // tree and never over it: a scratch dir inside the package, or one that holds the package, is refused.
  const parent = scratch ? path.resolve(scratch) : os.tmpdir();
  if (inside(ROOT, parent) || parent === ROOT || inside(parent, ROOT)) throw new Error('refused: the scratch dir may not be inside the package or hold it');
  fs.mkdirSync(parent, { recursive: true });
  const base = fs.mkdtempSync(path.join(parent, 'brain-install-'));
  try {
    const packDir = path.join(base, 'pack');
    const app = path.join(base, 'app');
    fs.mkdirSync(packDir, { recursive: true });
    fs.mkdirSync(app, { recursive: true });
    const p = npm(cli, ['pack', '--json', '--ignore-scripts', '--pack-destination', packDir], ROOT);
    if (p.status !== 0) { log('npm pack exited ' + p.status + ': ' + p.stderr.split('\n').slice(0, 3).join(' | ')); return finish(verdict, out, started, log); }
    const packed = parsePackJson(p.stdout)[0];
    const tarball = path.join(packDir, packed.filename);
    verdict.tarballBytes = fs.statSync(tarball).size;
    log('pack: ' + packed.filename + ' ' + verdict.tarballBytes + ' bytes, ' + packed.entryCount + ' entries, ' + Math.round(p.ms) + ' ms');
    const empty = fs.readdirSync(app).length === 0;
    const ins = npm(cli, ['install', tarball, '--no-audit', '--no-fund', '--offline', '--ignore-scripts'], app);
    const bin = path.join(app, 'node_modules', 'brain', 'bin', 'brain.mjs');
    verdict.install = {
      command: 'npm install <tarball> --no-audit --no-fund --offline --ignore-scripts', emptyBefore: empty,
      exit: ins.status, ms: Math.round(ins.ms), binPresent: isFile(bin),
      installedFiles: null, installedBytes: null,
    };
    log('install: exit ' + ins.status + ' in ' + Math.round(ins.ms) + ' ms into an empty dir ' + empty + ', bin present ' + isFile(bin));
    if (ins.status !== 0 || !isFile(bin)) { log(ins.stderr.split('\n').slice(0, 5).join('\n')); return finish(verdict, out, started, log); }
    const instRoot = path.join(app, 'node_modules', 'brain');
    let nFiles = 0;
    const count = (d) => { for (const f of fs.readdirSync(d)) { const q = path.join(d, f); if (isDir(q)) count(q); else nFiles++; } };
    count(instRoot);
    verdict.install.installedFiles = nFiles;
    verdict.install.installedBytes = dirBytes(instRoot);

    const ver = brainRun(bin, ['--version'], app, path.join(base, 'state-version'));
    verdict.version = ver.stdout.trim();
    log('installed --version: ' + JSON.stringify(verdict.version) + ' exit ' + ver.status + ' (package.json ' + pkg.version + ')');
    const help = brainRun(bin, ['--help', '--no-color'], app, path.join(base, 'state-version'));
    verdict.helpFirstLine = (help.stdout.split('\n')[0] || '').trim();
    log('installed --help: exit ' + help.status + ' first line ' + JSON.stringify(verdict.helpFirstLine));

    const inst = askArm(bin, app, path.join(app, 'brain-state'), [...PROMPTS]);
    verdict.install.initExit = inst.initExit;
    verdict.install.initFirstLine = inst.initFirstLine;
    verdict.prompts = inst.rows;
    for (const r of inst.rows) log('installed ask ' + JSON.stringify(r.prompt) + ': answered ' + r.answered + ', route ' + r.route + ', provenance ' + r.provenance + ', ' + r.wallMs + ' ms, first line ' + JSON.stringify(r.firstLine));
    verdict.claimedBare = inst.rows.filter((r) => r.answered).map((r) => r.prompt);

    if (control) {
      const ctl = askArm(path.join(ROOT, 'bin', 'brain.mjs'), ROOT, path.join(base, 'tree-state'), [...PROMPTS]);
      verdict.control = {
        what: 'the same five prompts through the tree bin (knowledge store and kept programs on disk), same fresh brain, provider null',
        initExit: ctl.initExit, rows: ctl.rows,
        answered: ctl.rows.filter((r) => r.answered).length,
        restsOnUnshippedData: ctl.rows.filter((r, i) => r.answered && !inst.rows[i].answered).map((r) => r.prompt),
        // what the tree holds that the tarball does not, measured by a stat walk (sizes only, nothing read)
        knowledgeStoreBytes: dirBytes(path.join(ROOT, 'bench', 'fixtures', 'wiki', 'store')),
        keptProgramsBytes: isFile(path.join(ROOT, 'bench', 'verdicts', 'induce-programs.json')) ? fs.statSync(path.join(ROOT, 'bench', 'verdicts', 'induce-programs.json')).size : 0,
      };
      for (const r of ctl.rows) log('control (tree) ask ' + JSON.stringify(r.prompt) + ': answered ' + r.answered + ', route ' + r.route + ', provenance ' + r.provenance + ', ' + r.wallMs + ' ms');
      // every number the statement quotes about the control is printed here first (knowledge store and kept
      // programs are stat sizes on this tree; the tarball carries neither)
      log('control (tree): answered ' + verdict.control.answered + ' of ' + ctl.rows.length
        + ', knowledge store ' + verdict.control.knowledgeStoreBytes + ' bytes, kept programs ' + verdict.control.keptProgramsBytes + ' bytes'
        + ', rests on unshipped data ' + (verdict.control.restsOnUnshippedData.length ? verdict.control.restsOnUnshippedData.map((p) => JSON.stringify(p)).join(', ') : 'none'));
    }
    const scratchBytes = dirBytes(base);
    verdict.scratchBytes = scratchBytes;
    log('scratch: ' + scratchBytes + ' bytes written under the scratch dir' + (scratchBytes > 100 * 1024 * 1024 ? ' (OVER 100 MB)' : ''));
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
  return finish(verdict, out, started, log);
}

function finish(verdict, out, started, log) {
  const answeredN = verdict.prompts.filter((r) => r.answered).length;
  const hey = verdict.prompts.find((r) => r.prompt === 'hey');
  verdict.barMet = verdict.files !== null && verdict.missingImports.length === 0 && verdict.excludedPresent.length === 0
    && verdict.version === verdict.versionExpected && !!hey && hey.answered === true;
  verdict.at = new Date().toISOString();
  verdict.wallMs = Date.now() - started;
  const ctl = verdict.control;
  verdict.statement = verdict.files === null
    ? 'The install bar could not pack the tree (npm ' + verdict.npm + '), so nothing about the installed copy is measured and the bar is not met.'
    : 'A developer who installs the BRAIN from its packed tarball gets ' + verdict.files + ' files (' + verdict.tarballBytes + ' bytes packed) and nothing from state/, bench/fixtures/, bench/verdicts/, organism/, docs/ or web/dist/ (' + verdict.excludedPresent.length + ' excluded paths present). '
      + 'An import tracer followed every static import, every literal import() and every quoted module path from bin/brain.mjs and act/prompt.mjs and reached ' + verdict.reachedModules + ' modules and ' + verdict.reachedData + ' data files; ' + verdict.missingImports.length + ' of them are missing from the tarball. '
      + 'Installed with npm into an empty directory, the copy printed version ' + JSON.stringify(verdict.version) + ' against ' + JSON.stringify(verdict.versionExpected) + ' in package.json and, with no model (provider null) and no knowledge store, answered ' + answeredN + ' of ' + verdict.prompts.length + ' of his bare prompts (' + (verdict.claimedBare.join(', ') || 'none') + '). '
      + (ctl ? 'The control, the same prompts through the tree itself where the knowledge store (' + ctl.knowledgeStoreBytes + ' bytes) and the kept programs (' + ctl.keptProgramsBytes + ' bytes) sit on disk, answered ' + ctl.answered + ' of ' + ctl.rows.length + (ctl.restsOnUnshippedData.length ? '; the difference (' + ctl.restsOnUnshippedData.join(', ') + ') rests on data the tarball does not carry. ' : ', the same prompts as the install. ') : '')
      + 'The runtime data the tarball leaves out on purpose is listed as dataExcluded (' + verdict.dataExcluded.length + ' paths): the installed copy runs without it and the rows above are what it does then. '
      + (verdict.barMet ? 'The bar is met.' : 'The bar is not met.');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  log('wrote ' + path.relative(ROOT, out).replaceAll('\\', '/') + '  barMet ' + verdict.barMet + '  missingImports ' + verdict.missingImports.length + '  excludedPresent ' + verdict.excludedPresent.length + '  version ' + verdict.version + '  answered ' + answeredN + '/' + verdict.prompts.length);
  return verdict;
}

// ---------------------------------------------------------------- main
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--trace')) {
    const t = trace(ROOT, [...ENTRIES], { always: ['world/policy.json'] });
    console.log(JSON.stringify({ modules: t.modules.length, data: t.data, dataExcluded: t.dataExcluded, dataAbsent: t.dataAbsent, modulesExcluded: t.modulesExcluded, unresolved: t.unresolved, bare: t.bare, blind: t.blind, top: topCounts(t.reached) }, null, 2));
  } else {
    const out = arg('out') ? path.resolve(arg('out')) : VERDICT;
    const scratch = arg('scratch') ? path.resolve(arg('scratch')) : undefined;
    run({ out, scratch, control: !process.argv.includes('--no-control') }).then((v) => { process.exitCode = v.barMet ? 0 : 1; }, (e) => { console.error('install bar crashed: ' + (e && e.stack || e)); process.exitCode = 2; });
  }
}
