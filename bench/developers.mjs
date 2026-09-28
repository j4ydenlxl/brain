#!/usr/bin/env node
// bench/developers.mjs: THE DEVELOPERS BAR (board 32, item developers; docs/VISION.md order 44 clause (2),
// his 2026-09-27 "and for developesr all across").
//
// README.md (the repository root, the page GitHub shows every developer) and docs/DEVELOPERS.md promise
// one command per surface: the CLI, the library, the HTTP route, the MCP server and the packed install.
// A promise a developer copies and pastes is only worth what it prints, so this bar runs the documents:
//
//   1. every fenced block tagged bash whose first word is node, curl or npm is RUN (node as this very
//      node binary, npm through the npm-cli.js beside it, curl with a 20 second timeout; a curl that
//      fails is recorded failed, never skipped), and the first non-empty line it printed on stdout,
//      ANSI stripped and trailing space trimmed, is compared with the directive under the block;
//   2. THE ANSWER, not only the header: every block that asks (a CLI ask, or a curl whose first line is
//      JSON) must state at least one answer directive, and every answer directive is checked against
//      the whole output (a CLI ask's header depends only on the prompt, so a header alone would pass on
//      any answer that exits 0; an error body with a text field would pass a bare prints-json);
//   3. the js example is written to a scratch file and run (its ./ imports rewritten to this
//      checkout's file URLs, and the count of rewrites is recorded: it is ADAPTED, not run as written);
//   4. the MCP registration snippet is spawned (initialize, notifications/initialized, tools/list) with
//      its placeholder args[0] set to this checkout (ADAPTED) and every tool it names must be listed;
//   5. the claims tables are asked in this process through act/prompt.mjs ask() with provider null;
//   6. the sources tables: every number a row states must EQUAL the verdict field the row names for it
//      (one field per number, in order; a value may be rounded to the decimals the row wrote);
//   7. every double-quoted span in prose must be his words, byte for byte from docs/VISION.md, under
//      15 words; the README's ladder line must be a line bench/verdicts/ladder.json (or a dated
//      ladder file) printed;
//   8. node tools/docs-numbers.mjs --json over both documents (numbersChecked, numbersFailed), and a
//      strict pass of the same checkDoc() whose known values leave out this bar's own verdict.
//
// THE CONTROLS (the verdict's canary): every check above that passed is re-run against a PLANTED wrong
// expectation and must fail: each passing first line, each exercised answer directive, each claims row
// (a wrong answer or kind, and a claimed miss on a prompt that answers), each number of each sources row
// (the number minus one, so "4 of 5" becomes "3 of 5"), each quote (a word appended) and one span of
// docs/VISION.md of 15 words (too long). A check that cannot reject a planted error proves nothing.
//
// THE DIRECTIVES, HTML comments on the lines right after a closing fence (GitHub does not render them):
//   <!-- prints: LINE -->            the first printed line equals LINE exactly
//   <!-- prints-matches: REGEX -->   the first printed line matches REGEX
//   <!-- prints-json: FIELD -->      the first printed line parses as a JSON object whose FIELD is a string
//   <!-- line: LINE -->              (repeatable) some printed line equals LINE exactly
//   <!-- line-matches: REGEX -->     (repeatable) some printed line matches REGEX
//   <!-- store-line: LINE -->        (repeatable) as line, checked when the knowledge store is ready here
//   <!-- no-store-line: LINE -->     (repeatable) as line, checked when it is not (a block run from the
//                                    packed copy never has the store: the package does not carry it)
//   <!-- json: PATH = VALUE -->      (repeatable) the first line's JSON value at PATH equals VALUE (null,
//                                    true, false, a string, or an array written comma separated)
//   <!-- file: NAME -->              (a js block) written to scratch as NAME; a later block naming NAME runs it
//   <!-- cwd: fresh -->              run in an empty scratch directory whose sibling "brain" is a junction
//                                    to this checkout: the documents' empty directory beside the checkout
//   <!-- needs: PATH -->             run only when PATH exists; else skipped with a reason naming PATH
//   <!-- mcp-tools: a, b -->         (a json block) spawn its mcpServers entry and require these tools
// A runnable block with no prints directive FAILS, and so does an asking block with no answer directive.
//
// A PATH (a json directive, a sources field) is dot separated: a name, an array index, length on an
// array, or name[key=value], which keeps the array elements whose key reads value.
//
// THE ENVIRONMENT of every child: BRAIN_LLM_BASE, BRAIN_LLM_KEY, BRAIN_LLM_MODEL, VERCEL_OIDC_TOKEN and
// BRAIN_SOLVED removed (model OFF, every arm provider null), NO_COLOR=1, and BRAIN_STATE_DIR pointed at
// a scratch directory per document and working directory, so no command writes under state/. A CLI ask
// that does not name --provider null or --provider env is refused BEFORE it runs: with no provider,
// ask() probes a local Ollama (act/prompt.mjs askModel), and this bar opens no model socket.
//
//   node bench/developers.mjs [--out FILE] [--scratch DIR]
//     --out      the verdict path (default bench/verdicts/developers.json)
//     --scratch  the parent of this run's scratch directory (default: BRAIN_SCRATCH, else os.tmpdir())
//   runBar({ docTexts: { 'README.md': text } }) runs the bar on a planted text (the tests' mutant run).
//
// Zero dependencies. Node 24 ESM.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const DOCS = Object.freeze(['README.md', 'docs/DEVELOPERS.md']);
export const VERDICT = path.join(ROOT, 'bench', 'verdicts', 'developers.json');
export const COMMAND = 'node bench/developers.mjs';
export const RUNNABLE = Object.freeze(['node', 'curl', 'npm']);
export const TIMEOUT_MS = Object.freeze({ curl: 20_000, node: 60_000, npm: 120_000, mcp: 15_000 });
// The files of board 32 whose absence may excuse a skip (docs/VISION.md order 44 names them). A skip whose
// reason names any other file, or a board file that is present, is not an excuse and the bar is not met.
export const BOARD_FILES = Object.freeze([
  'tools/mcp.mjs', 'test/mcp.test.mjs', 'bench/mcp.mjs', 'bench/verdicts/mcp.json', 'notes/mcp.md',
  'test/install.test.mjs', 'bench/install.mjs', 'bench/verdicts/install.json', 'notes/install.md',
]);
const STRIP_ENV = ['BRAIN_LLM_BASE', 'BRAIN_LLM_KEY', 'BRAIN_LLM_MODEL', 'VERCEL_OIDC_TOKEN', 'BRAIN_SOLVED', 'FORCE_COLOR'];
const REPEAT_KEYS = ['needs', 'line', 'line-matches', 'store-line', 'no-store-line', 'json'];
const BLOCK_KEYS = new Set(['prints', 'prints-matches', 'prints-json', 'file', 'cwd', 'mcp-tools', ...REPEAT_KEYS]);
const RAW_KEYS = new Set(['prints', 'prints-matches', 'prints-json', 'line', 'line-matches', 'store-line', 'no-store-line']);
const PRINT_KEYS = ['prints', 'prints-matches', 'prints-json'];
// eslint-disable-next-line no-control-regex
const ANSI = /\u001b\[[0-9;?]*[ -/]*[@-~]/g;
const EM_DASH = String.fromCharCode(0x2014);

// ------------------------------------------------------------------ parsing
/**
 * Every fenced block of a markdown text, with the directives on the lines right after its closing fence.
 * @param {string} text
 * @returns {{lang: string, code: string, line: number, directives: object, unknown: string[]}[]}
 */
export function parseBlocks(text) {
  const lines = String(text).split(/\r?\n/);
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const open = /^\s*```\s*([A-Za-z0-9_+-]*)\s*$/.exec(lines[i]);
    if (!open) continue;
    const start = i;
    const body = [];
    i++;
    while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
    const directives = {};
    for (const k of REPEAT_KEYS) directives[k] = [];
    const unknown = [];
    let j = i + 1;
    for (; j < lines.length; j++) {
      const l = lines[j].replace(/\s+$/, '');
      if (!l.length) continue;
      const m = /^<!-- ([a-z][a-z-]*): (.*) -->$/.exec(l);
      if (!m || !BLOCK_KEYS.has(m[1])) break;
      const value = RAW_KEYS.has(m[1]) ? m[2] : m[2].trim();
      if (REPEAT_KEYS.includes(m[1])) directives[m[1]].push(value);
      else if (directives[m[1]] !== undefined) unknown.push('duplicate ' + m[1]);
      else directives[m[1]] = value;
    }
    blocks.push({ lang: open[1].toLowerCase(), code: body.join('\n'), line: start + 1, directives, unknown });
    i = Math.max(i, j - 1);
  }
  return blocks;
}

/** The expectation a block states: { kind, value } or null when it states none or more than one. */
export function expectationOf(block) {
  const found = PRINT_KEYS.filter((k) => block.directives[k] !== undefined);
  if (found.length !== 1) return null;
  return { kind: found[0], value: block.directives[found[0]] };
}

/** The first non-empty line of a command's stdout, ANSI stripped, trailing whitespace trimmed. */
export function firstLine(s) {
  for (const raw of String(s ?? '').split(/\r?\n/)) {
    const l = raw.replace(ANSI, '').replace(/\s+$/, '');
    if (l.length) return l;
  }
  return '';
}

/** Every line of a command's stdout, ANSI stripped, trailing whitespace trimmed. */
export function outLines(s) {
  return String(s ?? '').split(/\r?\n/).map((raw) => raw.replace(ANSI, '').replace(/\s+$/, ''));
}

/**
 * Compare what a command printed with what the document says it prints.
 * @param {{kind: string, value: string}|null} expect
 * @param {string} stdout
 * @returns {{ok: boolean, expected: string, got: string}}
 */
export function compare(expect, stdout) {
  const got = firstLine(stdout);
  if (!expect) return { ok: false, expected: '(no single prints, prints-matches or prints-json line under the block)', got };
  if (expect.kind === 'prints') return { ok: got === expect.value, expected: expect.value, got };
  if (expect.kind === 'prints-matches') {
    let re;
    try { re = new RegExp(expect.value); } catch (e) { return { ok: false, expected: '/' + expect.value + '/', got: 'the regex does not compile: ' + e.message }; }
    return { ok: re.test(got), expected: '/' + expect.value + '/', got };
  }
  if (expect.kind === 'prints-json') {
    let ok = false;
    try { const j = JSON.parse(got); ok = !!j && typeof j === 'object' && !Array.isArray(j) && typeof j[expect.value] === 'string'; } catch { ok = false; }
    return { ok, expected: 'one JSON object whose ' + expect.value + ' is a string', got: got.length > 300 ? got.slice(0, 300) + '...' : got };
  }
  return { ok: false, expected: 'an unknown directive ' + expect.kind, got };
}

/**
 * The value at a PATH of a parsed JSON value: dot separated names, array indexes, length on an array,
 * and name[key=value] (the array elements whose key reads value).
 * @returns {{ok: true, value: any}|{ok: false, why: string}}
 */
export function valueAt(obj, expr) {
  let cur = obj;
  for (const seg of String(expr).split('.')) {
    const m = /^([A-Za-z0-9_$-]*)(?:\[([A-Za-z0-9_$-]+)=([^\]]*)\])?$/.exec(seg);
    if (!m || (!m[1] && m[2] === undefined)) return { ok: false, why: 'the segment ' + JSON.stringify(seg) + ' is not a name, an index or name[key=value]' };
    if (m[1]) {
      if (cur === null || typeof cur !== 'object') return { ok: false, why: 'no field ' + m[1] + ' under a ' + (cur === null ? 'null' : typeof cur) };
      if (Array.isArray(cur) && m[1] === 'length') cur = cur.length;
      else if (!Object.prototype.hasOwnProperty.call(cur, m[1])) return { ok: false, why: 'no field ' + m[1] };
      else cur = cur[m[1]];
    }
    if (m[2] !== undefined) {
      if (!Array.isArray(cur)) return { ok: false, why: seg + ' filters a value that is not an array' };
      cur = cur.filter((el) => el !== null && typeof el === 'object' && String(el[m[2]]) === m[3]);
    }
  }
  return { ok: true, value: cur };
}

/** A json directive's VALUE against the value found: null, a scalar by its string, an array comma joined. */
export function jsonEquals(v, want) {
  if (want === 'null') return v === null;
  if (Array.isArray(v)) return v.every((x) => x === null || typeof x !== 'object') && v.join(',') === want;
  if (v === null || typeof v === 'object' || v === undefined) return false;
  return String(v) === want;
}

/**
 * The answer directives of a block checked against the whole output.
 * @param {{directives: object}} block
 * @param {string} stdout
 * @param {{storeReady?: boolean}} [ctx] whether the knowledge store is ready for the command that ran
 * @returns {{ok: boolean, checked: number, failed: {kind: string, expected: string, got?: string}[], notExercised: {kind: string, expected: string}[]}}
 */
export function checkAnswer(block, stdout, ctx = {}) {
  const d = block.directives;
  const lines = outLines(stdout);
  const res = { ok: true, checked: 0, failed: [], notExercised: [] };
  const has = (kind, t) => { res.checked++; if (!lines.includes(t)) res.failed.push({ kind, expected: t, got: 'no printed line equals it' }); };
  for (const t of d.line || []) has('line', t);
  for (const r of d['line-matches'] || []) {
    res.checked++;
    let re;
    try { re = new RegExp(r); } catch (e) { res.failed.push({ kind: 'line-matches', expected: '/' + r + '/', got: 'the regex does not compile: ' + e.message }); continue; }
    if (!lines.some((l) => re.test(l))) res.failed.push({ kind: 'line-matches', expected: '/' + r + '/', got: 'no printed line matches it' });
  }
  for (const t of d['store-line'] || []) { if (ctx.storeReady) has('store-line', t); else res.notExercised.push({ kind: 'store-line', expected: t }); }
  for (const t of d['no-store-line'] || []) { if (!ctx.storeReady) has('no-store-line', t); else res.notExercised.push({ kind: 'no-store-line', expected: t }); }
  if ((d.json || []).length) {
    let obj = null;
    try { obj = JSON.parse(firstLine(stdout)); } catch { obj = null; }
    for (const e of d.json) {
      res.checked++;
      const m = /^(\S+) = (.*)$/.exec(e);
      if (!m) { res.failed.push({ kind: 'json', expected: e, got: 'not PATH = VALUE' }); continue; }
      if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) { res.failed.push({ kind: 'json', expected: e, got: 'the first line is not a JSON object' }); continue; }
      const v = valueAt(obj, m[1]);
      if (!v.ok) res.failed.push({ kind: 'json', expected: e, got: v.why });
      else if (!jsonEquals(v.value, m[2])) res.failed.push({ kind: 'json', expected: e, got: m[1] + ' = ' + JSON.stringify(v.value).slice(0, 160) });
    }
  }
  res.ok = res.failed.length === 0;
  return res;
}

/**
 * Whether a block asks, and so must state its answer: 'json' for a prints-json block (its JSON must be
 * checked field by field), 'line' for a CLI ask (the word after a path ending in brain.mjs is ask).
 */
export function requiresAnswer(block, argv) {
  const e = expectationOf(block);
  if (e && e.kind === 'prints-json') return 'json';
  const i = (argv || []).findIndex((a) => /(^|\/)brain\.mjs$/.test(String(a).replace(/\\/g, '/')));
  if (i >= 0 && argv[i + 1] === 'ask') return 'line';
  return null;
}

/**
 * Whether a CLI ask keeps the model off: it names --provider null, or --provider env (whose variable
 * names the bar removes from every child). With no --provider, ask() probes a local Ollama.
 */
export function modelOff(argv) {
  const i = (argv || []).indexOf('--provider');
  const p = i >= 0 ? argv[i + 1] : undefined;
  if (p === 'null' || p === 'env') return { ok: true, provider: p, why: null };
  return { ok: false, provider: p ?? null, why: p === undefined ? 'no --provider, so the ask would probe a local Ollama' : '--provider ' + p + ' could call a model' };
}

/**
 * A bash command line split into argv the way a POSIX shell would for the subset the documents use:
 * whitespace, single quotes, double quotes, backslash escapes and trailing-backslash continuations.
 * Anything that needs a real shell (a pipe, a redirect, a list, an expansion, a glob) is refused, so
 * the bar never runs something other than what the document shows.
 * @param {string} code
 * @returns {{argv: string[]|null, error: string|null}}
 */
export function splitArgv(code) {
  const joined = String(code).replace(/\\\r?\n/g, ' ');
  const lines = joined.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length && !l.startsWith('#'));
  if (lines.length !== 1) return { argv: null, error: 'one command per block (found ' + lines.length + ' command lines)' };
  const s = lines[0];
  const argv = [];
  let cur = '', has = false, q = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q === "'") { if (c === "'") q = null; else cur += c; continue; }
    if (q === '"') {
      if (c === '"') { q = null; continue; }
      if (c === '\\' && i + 1 < s.length && '"\\$`'.includes(s[i + 1])) { cur += s[++i]; continue; }
      if (c === '$' || c === '`') return { argv: null, error: 'a shell expansion (' + c + ') the bar does not run' };
      cur += c; continue;
    }
    if (c === "'" || c === '"') { q = c; has = true; continue; }
    if (c === '\\' && i + 1 < s.length) { cur += s[++i]; has = true; continue; }
    if (/\s/.test(c)) { if (has) { argv.push(cur); cur = ''; has = false; } continue; }
    if ('|&;<>()$`*?'.includes(c)) return { argv: null, error: 'a shell operator (' + c + ') the bar does not run' };
    cur += c; has = true;
  }
  if (q) return { argv: null, error: 'an unclosed ' + q + ' quote' };
  if (has) argv.push(cur);
  return { argv, error: null };
}

/** Rewrite the ./ import specifiers of an example to file URLs under root. */
export function rewriteImports(code, root = ROOT) {
  let rewrote = 0;
  const out = String(code).replace(/(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])\.\/([^'"]+)\2/g, (_m, pre, q, rest) => {
    rewrote++;
    return pre + q + pathToFileURL(path.join(root, rest)).href + q;
  });
  return { code: out, rewrote };
}

/** Every markdown table right after a marker comment <!-- NAME --> or <!-- NAME: ARG -->. */
export function tablesAfter(text, name) {
  const lines = String(text).split(/\r?\n/);
  const out = [];
  const re = new RegExp('^<!-- ' + name + '(?:: (.*?))? -->\\s*$');
  for (let i = 0; i < lines.length; i++) {
    const m = re.exec(lines[i]);
    if (!m) continue;
    let j = i + 1;
    while (j < lines.length && !lines[j].trim()) j++;
    const rows = [];
    let seen = 0;
    for (; j < lines.length && /^\s*\|/.test(lines[j]); j++) {
      seen++;
      if (seen <= 2) continue; // the header row and the separator row
      rows.push({ line: j + 1, cells: lines[j].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()) });
    }
    out.push({ arg: m[1] ?? null, line: i + 1, rows });
  }
  return out;
}

const tick = (cell) => { const m = /`([^`]*)`/.exec(cell || ''); return m ? m[1] : null; };
const ticks = (cell) => [...String(cell || '').matchAll(/`([^`]*)`/g)].map((m) => m[1]);

/** Prose lines: fences, code spans and HTML comments blanked (line numbers kept). */
export function proseLines(text) {
  let fenced = false;
  return String(text).split(/\r?\n/).map((l) => {
    if (/^\s*```/.test(l)) { fenced = !fenced; return ''; }
    if (fenced) return '';
    return l.replace(/<!--.*?-->/g, '').replace(/`[^`]*`/g, '');
  });
}

/** Every double-quoted span in prose. */
export function quotesIn(text) {
  const out = [];
  proseLines(text).forEach((l, i) => { for (const m of l.matchAll(/"([^"]+)"/g)) out.push({ line: i + 1, text: m[1] }); });
  return out;
}

// ------------------------------------------------------------------ numbers
/** The numbers a cell states, signed when a sign leads them ("+6.15", "4 of 5"). */
export function numberTokens(s) {
  return [...String(s).matchAll(/(?:(?<=^|\s)[-+])?\d[\d,]*(?:\.\d+)?/g)].map((m) => m[0].replace(/,$/, '').replace(/,/g, ''));
}

/**
 * A stated number against the value a verdict field holds: equal, or the value rounds to it at the
 * decimals the document wrote (100.9205858 may be written 100.92, never 100.93; 4 is never 3).
 */
export function numberMatches(token, value) {
  let y = value;
  if (typeof y === 'string' && /^-?\d+(?:\.\d+)?$/.test(y)) y = Number(y);
  if (typeof y !== 'number' || !Number.isFinite(y)) return false;
  const x = Number(token);
  if (!Number.isFinite(x)) return false;
  if (String(y) === String(x)) return true;
  const bare = String(token).replace(/^[-+]/, '');
  const dot = bare.indexOf('.');
  const half = 0.5 * Math.pow(10, -(dot < 0 ? 0 : bare.length - dot - 1));
  return y >= x - half && y < x + half + Number.EPSILON * Math.abs(x);
}

// The known values tools/docs-numbers.mjs builds (NUMBERS.md and every verdict), minus the files named.
function knownExcept(root, exclude) {
  const strings = new Set(); const nums = [];
  let md = '';
  try { md = fs.readFileSync(path.join(root, 'docs', 'NUMBERS.md'), 'utf8'); } catch { md = ''; }
  for (const line of md.split('\n')) {
    const cells = line.split('|').map((s) => s.trim());
    if (cells.length < 5 || cells[1] === 'docs-numbers') continue;
    const v = cells[3];
    if (!v || !/^-?\d/.test(v)) continue;
    strings.add(v); if (Number.isFinite(Number(v))) nums.push(Number(v));
  }
  const dir = path.join(root, 'bench', 'verdicts');
  for (const name of fs.readdirSync(dir).filter((n) => n.endsWith('.json') && n !== 'docs-numbers.json' && !exclude.includes(n))) {
    let text; try { text = fs.readFileSync(path.join(dir, name), 'utf8'); } catch { continue; }
    for (const m of text.matchAll(/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g)) { strings.add(m[0]); if (Number.isFinite(Number(m[0]))) nums.push(Number(m[0])); }
  }
  nums.sort((a, b) => a - b);
  return { strings, nums };
}

// ------------------------------------------------------------------ running
function npmCli() {
  const c = path.join(path.dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  return fs.existsSync(c) ? c : null;
}

/** The executable and argv a document command runs as, or an error. */
export function resolveCommand(argv) {
  const [first, ...rest] = argv;
  if (first === 'node') return { exe: process.execPath, args: rest };
  if (first === 'npm') {
    const cli = npmCli();
    if (cli) return { exe: process.execPath, args: [cli, ...rest] };
    if (process.platform === 'win32') return { exe: null, error: 'npm-cli.js was not found beside ' + process.execPath };
    return { exe: 'npm', args: rest };
  }
  if (first === 'curl') return { exe: 'curl', args: rest };
  return { exe: null, error: 'the first word is ' + first + ', not node, curl or npm' };
}

function childEnv(stateDir) {
  const env = { ...process.env };
  for (const k of STRIP_ENV) delete env[k];
  env.NO_COLOR = '1';
  env.BRAIN_STATE_DIR = stateDir;
  return env;
}

function run(exe, args, { cwd, env, timeoutMs }) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let out = '', err = '', done = false, timedOut = false;
    let child;
    try { child = spawn(exe, args, { cwd, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) {
      resolve({ exit: null, stdout: '', stderr: String(e.message || e), ms: 0, timedOut: false }); return;
    }
    const timer = setTimeout(() => { timedOut = true; try { child.kill(); } catch { /* gone */ } }, timeoutMs);
    child.stdout.on('data', (d) => { if (out.length < 1 << 20) out += d; });
    child.stderr.on('data', (d) => { if (err.length < 1 << 16) err += d; });
    const finish = (exit) => { if (done) return; done = true; clearTimeout(timer); resolve({ exit, stdout: out, stderr: err, ms: Number((performance.now() - t0).toFixed(1)), timedOut }); };
    child.on('error', (e) => { err += String(e.message || e); finish(null); });
    child.on('close', (code) => finish(code));
  });
}

// The handshake an MCP client makes: initialize, notifications/initialized, tools/list.
function mcpHandshake(cmd, args, env, timeoutMs) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    let child = null, buf = '', stage = 0, done = false, stderr = '';
    let timer = null;
    const finish = (r) => {
      if (done) return; done = true; clearTimeout(timer);
      try { if (child) child.kill(); } catch { /* gone */ }
      resolve({ ...r, ms: Number((performance.now() - t0).toFixed(1)), stderr: stderr.slice(0, 400) });
    };
    timer = setTimeout(() => finish({ ok: false, tools: [], error: 'no answer inside ' + timeoutMs + ' ms at stage ' + stage }), timeoutMs);
    try { child = spawn(cmd, args, { env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] }); } catch (e) { finish({ ok: false, tools: [], error: String(e.message || e) }); return; }
    const send = (o) => { try { child.stdin.write(JSON.stringify(o) + '\n'); } catch { /* closed */ } };
    child.on('error', (e) => finish({ ok: false, tools: [], error: String(e.message || e) }));
    child.on('close', (code) => finish({ ok: false, tools: [], error: 'the server exited with ' + code + ' at stage ' + stage }));
    child.stderr.on('data', (d) => { if (stderr.length < 4096) stderr += d; });
    child.stdout.on('data', (d) => {
      buf += d;
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line) continue;
        let msg; try { msg = JSON.parse(line); } catch { continue; }
        if (stage === 0 && msg.id === 1) {
          if (!msg.result) { finish({ ok: false, tools: [], error: 'initialize answered without a result' }); return; }
          stage = 1;
          send({ jsonrpc: '2.0', method: 'notifications/initialized' });
          send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
        } else if (stage === 1 && msg.id === 2) {
          const tools = msg.result && Array.isArray(msg.result.tools) ? msg.result.tools.map((t) => t && t.name).filter(Boolean) : [];
          finish({ ok: Boolean(msg.result), tools, error: msg.result ? null : 'tools/list answered without a result' });
          return;
        }
      }
    });
    send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'bench-developers', version: '0.1.0' } } });
  });
}

// ------------------------------------------------------------------ claims
const lastLine = (t) => String(t || '').trim().split('\n').filter((l) => l.trim()).slice(-1)[0] || '';
/** The memory miss: no computed, native or knowledge answer, and no model (provider null). */
export const isMiss = (a) => !!(a && a.provenance && a.provenance.answer === 'memory' && a.route !== 'knowledge' && !a.exact && !(a.native && a.native.answer != null));

/**
 * Ask every row of every claims table of the documents through ask(), provider null, and compare.
 * @param {{file: string, text: string}[]} docs
 */
export async function checkClaims(docs) {
  const P = await import('../act/prompt.mjs');
  const { seedBasic } = await import('../seeds/basic.mjs');
  const brain = seedBasic({ name: 'developers', ledger: 'off' });
  const noStore = { checked: 0, failed: [] };
  const store = { checked: 0, missChecked: 0, failed: [], ran: false, reason: null, withoutStore: 0 };
  const rows = [];
  const base = { provider: 'null', solved: false, events: [] };
  for (const d of docs) {
    for (const t of tablesAfter(d.text, 'claims')) {
      for (const r of t.rows) {
        const prompt = tick(r.cells[0]);
        if (prompt === null) continue;
        if (t.arg === 'no-store') {
          const want = tick(r.cells[1]); const value = tick(r.cells[2]);
          const a = await P.ask(brain, prompt, { ...base, knowledge: false });
          const got = { provenance: a.provenance && a.provenance.answer, route: a.route, kind: a.native ? a.native.kind : null, last: lastLine(a.text) };
          let ok;
          if (want === 'native') ok = got.provenance === 'native' && got.kind === value;
          else if (want === 'exact') ok = got.provenance === 'exact' && !!a.exact && String(a.exact.answer) === value;
          else if (want === 'program') ok = got.provenance === 'program' && got.last === value;
          else if (want === 'miss') ok = isMiss(a);
          else ok = false;
          noStore.checked++;
          rows.push({ doc: d.file, table: 'no-store', prompt, want, value, got: { provenance: got.provenance, route: got.route, kind: got.kind, last: got.last.slice(0, 120) }, ok });
          if (!ok) noStore.failed.push({ doc: d.file, line: r.line, prompt, expected: want + (value !== null ? ' ' + value : ''), got: got.provenance + ' ' + (got.kind || got.last.slice(0, 120)) });
        } else if (t.arg === 'store') {
          const article = tick(r.cells[1]); const answer = tick(r.cells[2]);
          const without = await P.ask(brain, prompt, { ...base, knowledge: false });
          const missOk = isMiss(without);
          store.withoutStore++;
          if (!missOk) store.failed.push({ doc: d.file, line: r.line, prompt, expected: 'the miss without the store', got: String(without.provenance && without.provenance.answer) + ' ' + lastLine(without.text).slice(0, 120) });
          const ready = P.knowledgeReady();
          if (!ready.ok) {
            store.reason = 'the knowledge store is not on this host: ' + String(ready.reason).split(ROOT + path.sep).join('').split(path.sep).join('/');
            rows.push({ doc: d.file, table: 'store', prompt, withoutStore: missOk, withStore: null });
            continue;
          }
          store.ran = true;
          const a = await P.ask(brain, prompt, { ...base });
          const ok = a.route === 'knowledge' && String(a.text).includes('article "' + article + '"') && lastLine(a.text).endsWith(': ' + answer);
          store.checked++;
          rows.push({ doc: d.file, table: 'store', prompt, withoutStore: missOk, withStore: ok, route: a.route, last: lastLine(a.text).slice(0, 120) });
          if (!ok) store.failed.push({ doc: d.file, line: r.line, prompt, expected: 'route knowledge, article ' + article + ', answer ' + answer, got: a.route + ' ' + lastLine(a.text).slice(0, 120) });
        } else if (t.arg === 'store-miss') {
          // a prompt the document says the store does NOT answer: the memory miss with the store present
          const ready = P.knowledgeReady();
          if (!ready.ok) { rows.push({ doc: d.file, table: 'store-miss', prompt, withStore: null }); continue; }
          const a = await P.ask(brain, prompt, { ...base });
          const ok = isMiss(a);
          store.missChecked++;
          rows.push({ doc: d.file, table: 'store-miss', prompt, withStore: ok, route: a.route, last: lastLine(a.text).slice(0, 120) });
          if (!ok) store.failed.push({ doc: d.file, line: r.line, prompt, expected: 'the miss with the store present', got: a.route + ' ' + lastLine(a.text).slice(0, 120) });
        } else {
          noStore.failed.push({ doc: d.file, line: r.line, prompt, expected: 'a claims table of kind no-store, store or store-miss', got: String(t.arg) });
        }
      }
    }
  }
  try { P.closeKnowledge(); } catch { /* nothing open */ }
  return { noStore, store, rows };
}

// ------------------------------------------------------------------ sources
/**
 * Every row of every sources table: what | number | verdict file | field | at. Each number the number
 * cell states must equal the field named for it, in order, in the verdict file the row cites.
 * @param {{file: string, text: string}[]} docs
 * @param {string} [root]
 */
export function checkSources(docs, root = ROOT) {
  const out = { rows: 0, numbers: 0, failed: [], stale: [] };
  for (const d of docs) {
    for (const t of tablesAfter(d.text, 'sources')) {
      for (const r of t.rows) {
        out.rows++;
        const what = r.cells[0];
        const fail = (expected, got) => out.failed.push({ doc: d.file, line: r.line, what, expected, got });
        if (r.cells.length !== 5) { fail('five cells: what, number, verdict file, field, at', r.cells.length + ' cells'); continue; }
        const numbers = numberTokens(String(r.cells[1]).replace(/`[^`]*`/g, ''));
        const file = tick(r.cells[2]); const fields = ticks(r.cells[3]); const at = tick(r.cells[4]);
        let json = null;
        try { json = JSON.parse(fs.readFileSync(path.join(root, String(file)), 'utf8')); } catch { json = null; }
        if (file === null || json === null) { fail('a readable JSON verdict file', String(file)); continue; }
        if (!numbers.length) { fail('at least one number', 'no number in the row'); continue; }
        if (fields.length !== numbers.length) { fail('one field per number (' + numbers.length + ' numbers)', fields.length + ' fields'); continue; }
        const bad = [];
        numbers.forEach((n, k) => {
          out.numbers++;
          const v = valueAt(json, fields[k]);
          if (!v.ok) bad.push(fields[k] + ': ' + v.why);
          else if (!numberMatches(n, v.value)) bad.push(n + ' is not ' + fields[k] + ' = ' + JSON.stringify(v.value).slice(0, 60));
        });
        if (bad.length) fail('every number equal to the field it names in ' + file, bad.join('; '));
        const fileAt = json && typeof json === 'object' && !Array.isArray(json) ? json.at ?? null : null;
        if (at !== fileAt) out.stale.push({ doc: d.file, line: r.line, file, stated: at, current: fileAt });
      }
    }
  }
  return out;
}

// ------------------------------------------------------------------ quotes
/**
 * Every double-quoted span in prose: his words, byte for byte in docs/VISION.md, under 15 words.
 * @param {{file: string, text: string}[]} docs
 * @param {string} vision the text of docs/VISION.md
 */
export function checkQuotes(docs, vision) {
  const out = { checked: 0, failed: [] };
  for (const d of docs) {
    for (const q of quotesIn(d.text)) {
      out.checked++;
      const words = q.text.trim().split(/\s+/).length;
      if (!vision.includes(q.text)) out.failed.push({ doc: d.file, line: q.line, quote: q.text, why: 'not byte for byte in docs/VISION.md' });
      else if (words >= 15) out.failed.push({ doc: d.file, line: q.line, quote: q.text, why: words + ' words, the rule is under 15' });
    }
  }
  return out;
}

// ------------------------------------------------------------------ the controls
/** A planted wrong value: an integer moved by one (down when it can), anything else with a word appended. */
export function plantValue(v) {
  const s = String(v);
  if (/^-?\d+$/.test(s)) { const n = Number(s); return String(n > 0 ? n - 1 : n + 1); }
  return s + ' planted';
}

/** A number cell with its k-th number planted (minus one): "4 of 5" becomes "3 of 5". */
export function plantNumber(cell, k) {
  let i = -1;
  return String(cell).replace(/(?:(?<=^|\s)[-+])?\d[\d,]*(?:\.\d+)?/g, (m) => {
    i++;
    if (i !== k) return m;
    const bare = m.replace(/,/g, '');
    const x = Number(bare);
    const dot = bare.indexOf('.');
    const dec = dot < 0 ? 0 : bare.length - dot - 1;
    const y = x >= 1 ? x - 1 : x + 1;
    return (/^\+/.test(m) ? '+' : '') + y.toFixed(dec);
  });
}

const SOURCES_HEAD = '| what | number | verdict file | field | at |\n| --- | --- | --- | --- | --- |\n';
const CLAIMS_HEAD = '| prompt | provenance | answer or kind |\n| --- | --- | --- |\n';

async function runControls({ docs, passes, vision }) {
  const c = { firstLine: { planted: 0, caught: 0 }, answer: { planted: 0, caught: 0 }, claims: { planted: 0, caught: 0 }, sources: { planted: 0, caught: 0 }, quotes: { planted: 0, caught: 0 }, escaped: [] };
  // every passing first line and every exercised answer directive, against the output the block printed
  for (const p of passes) {
    const e = expectationOf(p.block);
    if (e) {
      const planted = e.kind === 'prints' ? { kind: 'prints', value: e.value + ' (planted)' }
        : e.kind === 'prints-matches' ? { kind: 'prints-matches', value: '^planted$' }
          : { kind: 'prints-json', value: 'plantedFieldAbsent' };
      c.firstLine.planted++;
      if (!compare(planted, p.stdout).ok) c.firstLine.caught++; else c.escaped.push({ kind: 'firstLine', cmd: p.cmd });
    }
    const d = p.block.directives;
    const one = (key, value) => {
      const block = { directives: { line: [], 'line-matches': [], 'store-line': [], 'no-store-line': [], json: [], [key]: [value] } };
      c.answer.planted++;
      if (!checkAnswer(block, p.stdout, { storeReady: p.storeReady }).ok) c.answer.caught++; else c.escaped.push({ kind: key, cmd: p.cmd, planted: value });
    };
    for (const t of d.line) one('line', t + ' planted');
    for (const r of d['line-matches']) one('line-matches', '^planted ' + r.replace(/^\^/, ''));
    for (const t of d[p.storeReady ? 'store-line' : 'no-store-line']) one(p.storeReady ? 'store-line' : 'no-store-line', t + ' planted');
    for (const j of d.json) { const m = /^(\S+) = (.*)$/.exec(j); if (m) one('json', m[1] + ' = ' + plantValue(m[2])); }
  }
  // every claims row with a wrong expectation, and every row that answers claimed as the miss
  const planted = [];
  for (const d of docs) for (const t of tablesAfter(d.text, 'claims')) {
    if (t.arg !== 'no-store') continue;
    for (const r of t.rows) {
      const prompt = tick(r.cells[0]); const want = tick(r.cells[1]); const value = tick(r.cells[2]);
      if (prompt === null) continue;
      if (want === 'miss') planted.push('| `' + prompt + '` | `exact` | `planted` |');
      else { planted.push('| `' + prompt + '` | `' + want + '` | `' + plantValue(value) + '` |'); planted.push('| `' + prompt + '` | `miss` | `none` |'); }
    }
  }
  if (planted.length) {
    const r = await checkClaims([{ file: '(planted claims)', text: '<!-- claims: no-store -->\n' + CLAIMS_HEAD + planted.join('\n') + '\n' }]);
    c.claims.planted = r.noStore.checked;
    c.claims.caught = r.noStore.failed.length;
    if (c.claims.caught !== c.claims.planted) c.escaped.push({ kind: 'claims', escaped: r.rows.filter((x) => x.ok).map((x) => x.prompt + ' ' + x.want + ' ' + x.value) });
  }
  // every number of every sources row, one at a time, minus one
  for (const d of docs) for (const t of tablesAfter(d.text, 'sources')) for (const r of t.rows) {
    const n = numberTokens(String(r.cells[1] || '').replace(/`[^`]*`/g, '')).length;
    for (let k = 0; k < n; k++) {
      const cells = r.cells.slice(); cells[1] = plantNumber(cells[1], k);
      const s = checkSources([{ file: '(planted sources)', text: '<!-- sources -->\n' + SOURCES_HEAD + '| ' + cells.join(' | ') + ' |\n' }]);
      c.sources.planted++;
      if (s.failed.length === 1) c.sources.caught++; else c.escaped.push({ kind: 'sources', row: cells.join(' | ').slice(0, 160) });
    }
  }
  // every quote with a word appended, and one span of docs/VISION.md of 15 words
  for (const d of docs) for (const q of quotesIn(d.text)) {
    const s = checkQuotes([{ file: '(planted quote)', text: 'he wrote "' + q.text + ' planted"' }], vision);
    c.quotes.planted++;
    if (s.failed.length === 1) c.quotes.caught++; else c.escaped.push({ kind: 'quote', quote: q.text });
  }
  const long = vision.split(/\r?\n/).filter((l) => !/["`<>|]/.test(l)).map((l) => l.trim().split(' ').slice(0, 15).join(' ')).find((w) => w.split(' ').length === 15 && vision.includes(w) && !/\s{2}/.test(w));
  if (long) {
    const s = checkQuotes([{ file: '(planted quote)', text: 'he wrote "' + long + '"' }], vision);
    c.quotes.planted++;
    if (s.failed.length === 1 && /words, the rule is under 15$/.test(s.failed[0].why)) c.quotes.caught++; else c.escaped.push({ kind: 'quote-length' });
  }
  const kinds = ['firstLine', 'answer', 'claims', 'sources', 'quotes'];
  c.planted = kinds.reduce((a, k) => a + c[k].planted, 0);
  c.caughtTotal = kinds.reduce((a, k) => a + c[k].caught, 0);
  c.caught = kinds.every((k) => c[k].planted > 0 && c[k].caught === c[k].planted);
  return c;
}

// ------------------------------------------------------------------ the bar
function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') o.out = argv[++i];
    else if (argv[i] === '--scratch') o.scratch = argv[++i];
  }
  return o;
}

/**
 * Run the bar. Returns the verdict object (and writes it unless opts.write is false).
 * @param {{out?: string, scratch?: string, write?: boolean, log?: (s: string) => void, docTexts?: Record<string, string>}} [opts]
 */
export async function runBar(opts = {}) {
  const log = opts.log || ((s) => console.log(s));
  const out = opts.out ? path.resolve(opts.out) : VERDICT;
  const scratchParent = path.resolve(opts.scratch || process.env.BRAIN_SCRATCH || os.tmpdir());
  fs.mkdirSync(scratchParent, { recursive: true });
  const scratch = fs.mkdtempSync(path.join(scratchParent, 'developers-'));
  const fresh = path.join(scratch, 'fresh');
  const junction = path.join(scratch, path.basename(ROOT));
  fs.mkdirSync(fresh, { recursive: true });
  let junctionMade = false;
  const t0 = performance.now();
  const planted = opts.docTexts || null;
  const docs = DOCS.map((f) => {
    const p = path.join(ROOT, f);
    if (planted && typeof planted[f] === 'string') return { file: f, path: p, exists: true, text: planted[f], planted: true };
    const exists = fs.existsSync(p);
    return { file: f, path: p, exists, text: exists ? fs.readFileSync(p, 'utf8') : '', planted: false };
  });
  const P = await import('../act/prompt.mjs');
  const storeReadyHere = !!P.knowledgeReady().ok;
  const results = [];
  const runs = [];
  const passes = [];
  let example = null, mcp = null;
  let numbersDocs = [], tool = null, strictRows = [];
  try {
    for (const d of docs) {
      const r = { file: d.file, blocks: 0, ran: 0, passed: 0, asWritten: 0, adapted: 0, answersChecked: 0, answersNotExercised: 0, failed: [], skipped: [], other: [] };
      results.push(r);
      if (!d.exists) { r.failed.push({ cmd: '(the document)', expected: d.file + ' exists', got: 'absent' }); continue; }
      const files = new Map();
      for (const b of parseBlocks(d.text)) {
        if (b.unknown.length) r.failed.push({ cmd: '(block at line ' + b.line + ')', expected: 'one of each directive', got: b.unknown.join(', ') });
        if (b.lang === 'js' || b.lang === 'javascript' || b.lang === 'mjs') {
          if (b.directives.file) {
            const dir = path.join(scratch, 'example-' + results.length);
            fs.mkdirSync(dir, { recursive: true });
            const rw = rewriteImports(b.code);
            const file = path.join(dir, b.directives.file);
            fs.writeFileSync(file, rw.code + '\n');
            files.set(b.directives.file, { file, dir, rewrote: rw.rewrote, lines: b.code.split('\n').filter((l) => l.trim()).length });
          }
          continue;
        }
        if (b.lang === 'json' && b.directives['mcp-tools'] !== undefined) {
          r.blocks++;
          const want = b.directives['mcp-tools'].split(',').map((s) => s.trim()).filter(Boolean);
          const cmdLabel = 'mcp handshake on ' + (b.directives.needs[0] || 'tools/mcp.mjs') + ': initialize, tools/list';
          const absent = b.directives.needs.find((n) => !fs.existsSync(path.join(ROOT, n)));
          if (absent) { r.skipped.push({ cmd: cmdLabel, reason: absent + ' is absent at bar time', absent }); mcp = { ran: false, absent }; continue; }
          let cfg = null;
          try { cfg = JSON.parse(b.code); } catch (e) { r.failed.push({ cmd: cmdLabel, expected: 'the snippet parses as JSON', got: e.message }); continue; }
          const entry = cfg && cfg.mcpServers ? Object.values(cfg.mcpServers)[0] : null;
          if (!entry || entry.command !== 'node' || !Array.isArray(entry.args) || !/tools\/mcp\.mjs$/.test(String(entry.args[0] || '').replace(/\\/g, '/'))) {
            r.failed.push({ cmd: cmdLabel, expected: 'an mcpServers entry with command node and args[0] ending in tools/mcp.mjs', got: JSON.stringify(entry).slice(0, 200) });
            continue;
          }
          // ADAPTED: the snippet's placeholder path is set to this checkout's path on this host
          const args = [path.join(ROOT, 'tools', 'mcp.mjs'), ...entry.args.slice(1)];
          r.ran++; r.adapted++;
          const h = await mcpHandshake(process.execPath, args, childEnv(path.join(scratch, 'state', 'mcp')), TIMEOUT_MS.mcp);
          const missing = want.filter((t) => !h.tools.includes(t));
          const ok = h.ok && missing.length === 0;
          mcp = { ran: true, ok, tools: h.tools, want, missing, ms: h.ms, error: h.error || null, adapted: 'args[0] ' + JSON.stringify(entry.args[0]) + ' set to this checkout\'s tools/mcp.mjs' };
          runs.push({ doc: d.file, line: b.line, cmd: cmdLabel, asWritten: false, adapted: mcp.adapted, exit: h.ok ? 0 : null, firstLine: 'tools: ' + h.tools.join(', '), ms: h.ms, passed: ok });
          if (ok) r.passed++;
          else r.failed.push({ cmd: cmdLabel, expected: 'tools ' + want.join(', '), got: h.ok ? 'tools ' + h.tools.join(', ') + ' (missing ' + missing.join(', ') + ')' : String(h.error) + (h.stderr ? ' | ' + firstLine(h.stderr) : '') });
          continue;
        }
        if (b.lang !== 'bash') continue;
        const firstWord = (b.code.trim().split(/\s+/)[0] || '');
        r.blocks++;
        if (!RUNNABLE.includes(firstWord)) { r.other.push({ cmd: b.code.trim().slice(0, 160), reason: 'the first word is not node, curl or npm' }); continue; }
        const cmd = b.code.trim().replace(/\\\r?\n\s*/g, ' ');
        const sp = splitArgv(b.code);
        if (sp.error) { r.failed.push({ cmd, expected: 'a command the bar can run', got: sp.error }); continue; }
        const absent = b.directives.needs.find((n) => !fs.existsSync(path.join(ROOT, n)));
        if (absent) { r.skipped.push({ cmd, reason: absent + ' is absent at bar time', absent }); continue; }
        // npm pack reads package.json files; with no files field it would pack the checkout's runtime data
        if (firstWord === 'npm' && sp.argv[1] === 'pack') {
          let pf = null;
          try { pf = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).files; } catch { pf = null; }
          if (!Array.isArray(pf)) { r.skipped.push({ cmd, reason: 'package.json has no files field, so npm pack would pack the whole checkout', absent: null }); continue; }
        }
        const expect = expectationOf(b);
        // MODEL OFF: an ask with no --provider probes a local Ollama, so it is refused before it runs
        const need = requiresAnswer(b, sp.argv);
        const off = modelOff(sp.argv);
        if (need === 'line' && !off.ok) { r.failed.push({ cmd, expected: 'an ask that names --provider null or --provider env (model off, no socket)', got: off.why + '; not run' }); continue; }
        let cwd = ROOT, cwdName = 'root';
        if (b.directives.cwd === 'fresh') {
          cwd = fresh; cwdName = 'fresh';
          if (!junctionMade) { fs.symlinkSync(ROOT, junction, 'junction'); junctionMade = true; }
        } else if (b.directives.cwd) { r.failed.push({ cmd, expected: 'cwd fresh or none', got: 'cwd ' + b.directives.cwd }); continue; }
        const argv = sp.argv.slice();
        // a block that runs a file an earlier js block declared runs the scratch copy (ADAPTED)
        let ex = null;
        for (let k = 1; k < argv.length; k++) if (files.has(argv[k])) { ex = files.get(argv[k]); argv[k] = ex.file; cwd = ex.dir; cwdName = 'example'; }
        const rc = resolveCommand(argv);
        if (!rc.exe) { r.failed.push({ cmd, expected: 'a runnable command', got: rc.error }); continue; }
        const timeoutMs = TIMEOUT_MS[firstWord];
        const stateDir = path.join(scratch, 'state', d.file.replace(/[\\/.]/g, '-') + '-' + cwdName);
        r.ran++;
        if (ex) r.adapted++; else r.asWritten++;
        // the packed copy never carries the store; a root command reads the checkout's
        const storeReady = cwdName === 'fresh' ? false : storeReadyHere;
        const res = await run(rc.exe, rc.args, { cwd, env: childEnv(stateDir), timeoutMs });
        const c = compare(expect, res.stdout);
        const ans = checkAnswer(b, res.stdout, { storeReady });
        // an ask states an answer that holds in both cases: an unconditional line, or a store line AND a no-store line
        const bothCases = b.directives.line.length + b.directives['line-matches'].length > 0 || (b.directives['store-line'].length > 0 && b.directives['no-store-line'].length > 0);
        const needUnmet = need === 'json' ? b.directives.json.length === 0 : need === 'line' ? ans.checked === 0 || !bothCases : false;
        r.answersChecked += ans.checked; r.answersNotExercised += ans.notExercised.length;
        const ok = res.exit === 0 && c.ok && ans.ok && !needUnmet;
        const adapted = ex ? 'run from a scratch copy with its ' + ex.rewrote + ' ./ imports rewritten to this checkout' : null;
        runs.push({ doc: d.file, line: b.line, cmd, cwd: cwdName, asWritten: !ex, ...(adapted ? { adapted } : {}), exit: res.exit, timedOut: res.timedOut, firstLine: c.got, answers: { checked: ans.checked, failed: ans.failed, notExercised: ans.notExercised }, ms: res.ms, passed: ok });
        if (ex) example = { file: path.basename(ex.file), lines: ex.lines, rewroteImports: ex.rewrote, exit: res.exit, firstLine: c.got, answersChecked: ans.checked, passed: ok };
        if (ok) { r.passed++; passes.push({ block: b, stdout: res.stdout, storeReady, cmd }); }
        else {
          let expected = c.expected, why;
          if (res.exit !== 0) why = 'exit ' + res.exit + (res.timedOut ? ' (timed out after ' + timeoutMs + ' ms)' : '') + ': ' + (firstLine(res.stderr) || c.got || '(nothing printed)');
          else if (!c.ok) why = c.got;
          else if (needUnmet) { expected = need === 'json' ? 'at least one json directive under a block that prints JSON' : 'an answer line under an ask block that is checked here and holds with and without the store (a line, or a store-line and a no-store-line)'; why = 'none stated for every case, so an answer that exits 0 would pass unchecked'; }
          else { expected = ans.failed.map((f) => f.kind + ' ' + f.expected).join('; '); why = ans.failed.map((f) => f.got).join('; '); }
          r.failed.push({ cmd, expected: String(expected).slice(0, 400), got: String(why).slice(0, 400) });
        }
      }
    }
    // a planted text is checked for numbers from a scratch copy of the same name
    numbersDocs = docs.filter((d) => d.exists).map((d) => {
      if (!d.planted) return { file: d.file, path: d.path };
      const p = path.join(scratch, 'planted', d.file);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, d.text);
      return { file: d.file, path: p };
    });
    tool = await run(process.execPath, [path.join(ROOT, 'tools', 'docs-numbers.mjs'), '--json', ...numbersDocs.map((x) => x.path)], { cwd: ROOT, env: childEnv(path.join(scratch, 'state', 'numbers')), timeoutMs: 60_000 });
    const dn = await import('../tools/docs-numbers.mjs');
    const strictKnown = knownExcept(ROOT, [path.basename(out), 'developers.json']);
    strictRows = numbersDocs.map((x) => dn.checkDoc(x.path, strictKnown, []));
  } finally {
    // the junction first, and only then the scratch tree: a recursive delete must never walk into the checkout
    let junctionGone = !junctionMade;
    if (junctionMade) {
      try { fs.unlinkSync(junction); } catch { try { fs.rmdirSync(junction); } catch { /* reported below */ } }
      try { fs.lstatSync(junction); junctionGone = false; } catch { junctionGone = true; }
    }
    if (junctionGone && fs.existsSync(path.join(ROOT, 'package.json'))) { try { fs.rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } }
    else log('developers: scratch kept at ' + scratch + ' (the junction could not be removed first)');
  }

  const present = docs.filter((d) => d.exists);
  // the claims, in this process, model off
  const claims = await checkClaims(present);
  // the sources tables: every number equal to the field the row names
  const sources = checkSources(present);
  // his words: byte for byte from docs/VISION.md, under 15 words each
  const vision = fs.readFileSync(path.join(ROOT, 'docs', 'VISION.md'), 'utf8');
  const quotes = checkQuotes(present, vision);

  // the ladder line the README quotes
  const lm = /`bench\/verdicts\/ladder\.json` at `([^`]+)`[^\n]*\n+> (.+)/.exec(docs[0].text);
  let ladderJson = null;
  try { ladderJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'bench', 'verdicts', 'ladder.json'), 'utf8')); } catch { ladderJson = null; }
  const ladder = { quoted: lm ? lm[2].trim() : null, statedAt: lm ? lm[1] : null, currentLine: ladderJson ? ladderJson.line : null, currentAt: ladderJson ? ladderJson.at : null, current: false, dated: null, ok: false, stale: true };
  if (ladder.quoted) {
    ladder.current = ladder.quoted === ladder.currentLine;
    if (!ladder.current) {
      const ddir = path.join(ROOT, 'bench', 'verdicts', 'ladder');
      for (const n of (fs.existsSync(ddir) ? fs.readdirSync(ddir) : []).filter((x) => x.endsWith('.json')).sort()) {
        try { if (JSON.parse(fs.readFileSync(path.join(ddir, n), 'utf8')).line === ladder.quoted) ladder.dated = 'bench/verdicts/ladder/' + n; } catch { /* unreadable */ }
      }
    }
    ladder.ok = ladder.current || ladder.dated !== null;
    ladder.stale = ladder.statedAt !== ladder.currentAt;
  }

  // the numbers: the tool over both documents, then the strict pass without this bar's own verdict
  let toolRows = [];
  try { toolRows = JSON.parse(tool.stdout); } catch { toolRows = []; }
  const numbersChecked = toolRows.reduce((a, x) => a + x.protected + x.unprotected + x.allowed, 0);
  const numbersFailed = numbersDocs.length && toolRows.length === numbersDocs.length ? toolRows.reduce((a, x) => a + x.unprotected, 0) : null;
  const strict = {
    checked: strictRows.reduce((a, x) => a + x.protected + x.unprotected, 0),
    failed: strictRows.reduce((a, x) => a + x.unprotected, 0),
    weak: strictRows.reduce((a, x) => a + x.weakProtected, 0),
    misses: strictRows.flatMap((x) => x.misses.map((m) => ({ doc: x.doc, line: m.line, value: m.value }))),
  };

  // THE CONTROLS: every passing check against a planted wrong expectation
  const controls = await runControls({ docs: present, passes, vision });

  // skips: each must name an absent file of this board
  const skips = results.flatMap((r) => r.skipped.map((s) => ({ doc: r.file, ...s })));
  const badSkips = skips.filter((s) => !s.absent || !BOARD_FILES.includes(s.absent) || fs.existsSync(path.join(ROOT, s.absent)));
  const sum = (k) => results.reduce((a, r) => a + (Array.isArray(r[k]) ? r[k].length : r[k]), 0);
  const totals = { blocks: sum('blocks'), ran: sum('ran'), passed: sum('passed'), failed: sum('failed'), skipped: sum('skipped'), asWritten: sum('asWritten'), adapted: sum('adapted'), answersChecked: sum('answersChecked'), answersNotExercised: sum('answersNotExercised') };
  const emDash = docs.some((d) => d.text.includes(EM_DASH));
  const conditions = {
    everyDocRan: results.every((r) => r.ran > 0),
    failedZero: totals.failed === 0,
    answersChecked: totals.answersChecked > 0,
    numbersFailedZero: numbersFailed === 0 && tool.exit === 0,
    strictNumbersZero: strict.failed === 0,
    skipsNameAbsentBoardFiles: badSkips.length === 0,
    claimsHold: claims.noStore.checked > 0 && claims.noStore.failed.length === 0 && claims.store.failed.length === 0,
    sourcesHold: sources.rows > 0 && sources.failed.length === 0,
    quotesHold: quotes.checked > 0 && quotes.failed.length === 0,
    ladderQuoted: ladder.ok,
    exampleRan: !!(example && example.passed),
    canaryCaught: controls.caught,
    noEmDash: !emDash,
  };
  const barMet = Object.values(conditions).every(Boolean);
  const wallMs = Number((performance.now() - t0).toFixed(1));
  const unmet = Object.entries(conditions).filter(([, v]) => !v).map(([k]) => k);
  const reasons = [...new Set(skips.map((s) => s.reason))];
  const storeAsked = claims.store.checked - claims.store.failed.filter((f) => f.expected.startsWith('route knowledge')).length;
  const storeMissOk = claims.store.missChecked - claims.store.failed.filter((f) => f.expected === 'the miss with the store present').length;
  const withoutOk = claims.store.withoutStore - claims.store.failed.filter((f) => f.expected === 'the miss without the store').length;
  const statement = (planted ? 'PLANTED TEXT (a mutant run, not the documents on disk). ' : '')
    + 'The two developer documents, README.md at the repository root and docs/DEVELOPERS.md, hold ' + totals.blocks
    + ' runnable blocks; the bar ran ' + totals.ran + ' of them, ' + totals.asWritten + ' exactly as written and ' + totals.adapted
    + ' adapted (the library example from a scratch copy whose ./ imports point at this checkout, and the MCP snippet with its placeholder path set to this checkout), every child with the three model variable names removed and its state in a scratch directory, and every CLI ask naming --provider null or env, so nothing here called a model (a curl block asks the live site, whose own model cell the site reports): '
    + totals.passed + ' passed (the MCP snippet by answering the handshake with every tool it names, every other block by exiting 0 and printing the first line and every answer line the document states: ' + totals.answersChecked + ' answer checks of routes, provenances, answers and JSON fields'
    + (totals.answersNotExercised ? ', and ' + totals.answersNotExercised + ' conditional on the knowledge store not exercised on this host' : '') + '), '
    + totals.failed + ' failed and ' + totals.skipped + ' were skipped' + (totals.skipped ? ' (' + reasons.join('; ') + ')' : '') + '. '
    + (mcp && mcp.ran ? 'The MCP server answered the handshake with the tools ' + mcp.tools.join(', ') + '. ' : '')
    + 'Of ' + claims.noStore.checked + ' prompts the documents say answer (or miss) without the knowledge store, ' + (claims.noStore.checked - claims.noStore.failed.length) + ' did as stated with the store and the model off; '
    + (claims.store.ran ? storeAsked + ' of ' + claims.store.checked + ' prompts that need the store were answered from the knowledge tier as stated, ' + storeMissOk + ' of ' + claims.store.missChecked + ' the document says the store does not answer were the miss' : 'the prompts that need the store were not asked with it (' + claims.store.reason + ')')
    + ', and ' + withoutOk + ' of ' + claims.store.withoutStore + ' of them missed without it, as the document says. '
    + 'The sources tables hold ' + sources.rows + ' rows stating ' + sources.numbers + ' numbers, each compared with the verdict field the row names for it: ' + sources.failed.length + ' rows failed (' + sources.stale.length + ' cite an at that file has since moved past). '
    + 'Every number in prose is checked twice: tools/docs-numbers.mjs found ' + numbersFailed + ' unprotected of ' + numbersChecked + ', and a strict pass that ignores this bar\'s own verdict found ' + strict.failed + ' of ' + strict.checked + '. '
    + 'His words are quoted ' + quotes.checked + ' times, ' + quotes.failed.length + ' not byte for byte or too long. '
    + 'The control plants a wrong expectation into every check that passed (' + controls.firstLine.planted + ' first lines, ' + controls.answer.planted + ' answer checks, ' + controls.claims.planted + ' claims, ' + controls.sources.planted + ' source numbers, ' + controls.quotes.planted + ' quotes): '
    + controls.caughtTotal + ' of ' + controls.planted + ' were rejected. '
    + (barMet ? 'Bar met.' : 'Bar not met: ' + unmet.join(', ') + '.');
  const verdict = {
    at: new Date().toISOString(),
    command: COMMAND,
    node: process.version,
    isTheBar: true,
    barMet,
    conditions,
    ...(planted ? { planted: Object.keys(planted) } : {}),
    split: {
      development: 'none: the bar trains and tunes nothing; it runs the two documents as a developer would',
      heldOut: 'none',
      why: 'the population is every runnable block, answer line, claim, source row and quote in README.md and docs/DEVELOPERS.md, and all of it is checked; there is nothing to hold out',
      contaminated: false,
    },
    control: 'every check that passed is re-run against a planted wrong expectation and must fail: each first line (a word appended), each exercised answer line and JSON field (a word appended, an integer moved by one), each no-store claims row (a wrong answer or kind, and a claimed miss on a prompt that answers), each number of each sources row (minus one) and each quote (a word appended, plus one 15 word span of docs/VISION.md); the claims run with provider null, and with the knowledge tier off for every no-store row',
    totals,
    docs: results.map((r) => ({ file: r.file, blocks: r.blocks, ran: r.ran, passed: r.passed, asWritten: r.asWritten, adapted: r.adapted, answersChecked: r.answersChecked, failed: r.failed, skipped: r.skipped.map(({ cmd, reason }) => ({ cmd, reason })), ...(r.other.length ? { other: r.other } : {}) })),
    runs,
    storeReadyHere,
    example,
    mcp,
    canary: controls,
    claims,
    sources,
    quotes,
    ladder,
    numbersChecked,
    numbersFailed,
    numbersTool: { command: 'node tools/docs-numbers.mjs --json ' + present.map((d) => d.file).join(' '), exit: tool.exit, docs: toolRows.map((x) => ({ doc: x.doc, protected: x.protected, weakProtected: x.weakProtected, unprotected: x.unprotected, skipped: x.skipped, misses: x.misses })) },
    numbersStrict: strict,
    skipsChecked: { total: skips.length, notAnAbsentBoardFile: badSkips.map((s) => ({ doc: s.doc, cmd: s.cmd, reason: s.reason })) },
    boardFiles: BOARD_FILES.map((f) => ({ file: f, present: fs.existsSync(path.join(ROOT, f)) })),
    wallMs,
    writesOver100MB: false,
    statement,
  };
  if (opts.write !== false) {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  }
  for (const r of results) {
    log('developers: ' + r.file + ' blocks ' + r.blocks + ' ran ' + r.ran + ' passed ' + r.passed + ' failed ' + r.failed.length + ' skipped ' + r.skipped.length + ' answer checks ' + r.answersChecked);
    for (const f of r.failed) log('  FAILED ' + f.cmd + ' | expected ' + f.expected + ' | got ' + f.got);
    for (const s of r.skipped) log('  skipped ' + s.cmd + ' | ' + s.reason);
  }
  log('developers: total blocks ' + totals.blocks + ' ran ' + totals.ran + ' (as written ' + totals.asWritten + ', adapted ' + totals.adapted + ') passed ' + totals.passed + ' failed ' + totals.failed + ' skipped ' + totals.skipped + ' answer checks ' + totals.answersChecked + ' not exercised ' + totals.answersNotExercised + ' (store ready here ' + storeReadyHere + ')');
  log('example: ' + (example ? example.file + ' rewrote ' + example.rewroteImports + ' imports, first line ' + JSON.stringify(example.firstLine) + ', passed ' + example.passed : 'none'));
  log('mcp: ' + (mcp ? (mcp.ran ? 'tools ' + mcp.tools.join(', ') + ' ok ' + mcp.ok : 'skipped, ' + mcp.absent + ' absent') : 'no snippet'));
  log('claims: no-store ' + (claims.noStore.checked - claims.noStore.failed.length) + '/' + claims.noStore.checked + ', store ' + (claims.store.ran ? storeAsked + '/' + claims.store.checked + ', store-miss ' + storeMissOk + '/' + claims.store.missChecked + ', store failures ' + claims.store.failed.length : 'not asked (' + claims.store.reason + ')') + ', missed without the store ' + withoutOk + '/' + claims.store.withoutStore);
  for (const f of [...claims.noStore.failed, ...claims.store.failed]) log('  CLAIM FAILED ' + f.prompt + ' | expected ' + f.expected + ' | got ' + f.got);
  log('sources: ' + sources.rows + ' rows, ' + sources.numbers + ' numbers, failed ' + sources.failed.length + ', stale at ' + sources.stale.length);
  for (const f of sources.failed) log('  SOURCE FAILED ' + f.doc + ':' + f.line + ' ' + f.what + ' | ' + f.got);
  log('quotes: ' + quotes.checked + ' checked, failed ' + quotes.failed.length);
  for (const f of quotes.failed) log('  QUOTE FAILED ' + f.doc + ':' + f.line + ' ' + f.why);
  log('ladder: quoted ' + JSON.stringify(ladder.quoted) + ' current ' + ladder.current + (ladder.dated ? ' dated ' + ladder.dated : '') + ' stale at ' + ladder.stale);
  log('numbers: checked ' + numbersChecked + ' failed ' + numbersFailed + ' (tool exit ' + tool.exit + '); strict checked ' + strict.checked + ' failed ' + strict.failed);
  for (const m of strict.misses) log('  NUMBER ' + m.doc + ':' + m.line + ' ' + m.value);
  log('controls: planted ' + controls.planted + ' caught ' + controls.caughtTotal + ' (first lines ' + controls.firstLine.caught + '/' + controls.firstLine.planted + ', answers ' + controls.answer.caught + '/' + controls.answer.planted + ', claims ' + controls.claims.caught + '/' + controls.claims.planted + ', sources ' + controls.sources.caught + '/' + controls.sources.planted + ', quotes ' + controls.quotes.caught + '/' + controls.quotes.planted + ')');
  for (const e of controls.escaped) log('  CONTROL ESCAPED ' + JSON.stringify(e).slice(0, 300));
  log('barMet ' + barMet + (unmet.length ? ' (unmet: ' + unmet.join(', ') + ')' : '') + '  wall ' + wallMs + ' ms  verdict ' + (opts.write === false ? '(not written)' : path.relative(ROOT, out).split(path.sep).join('/')));
  return verdict;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const o = parseArgs(process.argv.slice(2));
  runBar(o).then((v) => { process.exitCode = v.barMet ? 0 : 1; }, (e) => { console.error('developers: ' + (e && e.stack || e)); process.exitCode = 2; });
}
