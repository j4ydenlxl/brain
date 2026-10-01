// grow/store.mjs: THE CELL-STORE WRITER AND THE PROMOTER (grow/CONTRACT.md; his NEXT-WEEK.md loop, steps 5 and 8).
// His words: "CELL STORE: a separate private repo, j4ydenlxl/brain-cells, holding gzip shards and an index. It
// lives in the cloud only and is never cloned on his PC." and "Survivors are copied into the tab layer and the
// function, so the site answers natively."
//
// Four verbs:
//   shard <gen> <lane>   tars the lane directory (every candidate, winner or loser: the archive keeps losers for
//                        recombination, generations/archive.mjs) with a minimal ustar writer plus node:zlib, PUTs
//                        shards/gen-<gen>-<lane>.tar.gz, writes generations/gen-<gen>-<lane>.json from the verdicts
//                        and appends the candidates to index.json (GET, merge, PUT with sha; retried on a conflict).
//   promote <gen> <lane> copies every survivor into grown/cells/, appends grown/index.json, regenerates
//                        grown/index.mjs, then proves it: node --check, import, every cell answers its own
//                        examples[0].q through grownAnswer. Any failure puts grown/ back as it was. A survivor is a
//                        verdict.json whose survived is true AND whose own fields and result.json carry the whole
//                        CONTRACT conjunction (conjunctionFailures); a survived:true without it is refused, never copied.
//   index                prints the store index summary.
//   verify-local         imports grown/index.mjs and prints what every cell answers.
//
// The store is reached through the GitHub contents API only, never a clone and never a working copy: `gh api`
// when gh is present and logged in, else fetch with GITHUB_TOKEN (read by name, never printed), else it fails.
// --api-base points it at another contents API (the test stub on 127.0.0.1); GITHUB_TOKEN goes to
// https://api.github.com and nowhere else (never plain http, never another host or port). No language model and
// no other socket.
// Author: board 37 store builder, 2026-09-30.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateCell, ID_RE, FORBIDDEN } from './contract.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DEFAULT_REPO = 'j4ydenlxl/brain-cells';
export const DEFAULT_BRANCH = 'main';
export const GITHUB_API = 'https://api.github.com';
export const NO_TRANSPORT = 'no gh and no GITHUB_TOKEN: the cell store is unreachable from here';
export const MAX_SHARD_BYTES = 100 * 1024 * 1024;
export const LANE_RE = /^[a-z0-9][a-z0-9_-]{0,31}$/;
const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const PUT_TRIES = 5;

export const USAGE = [
  'usage: node grow/store.mjs <verb> [args] [flags]',
  '  shard <gen> <lane> [--dir work/grow/gen-<gen>/<lane>] [--repo ' + DEFAULT_REPO + '] [--branch main] [--api-base URL]',
  '      tar+gzip the lane, PUT shards/gen-<gen>-<lane>.tar.gz and generations/gen-<gen>-<lane>.json, append index.json;',
  '      prints {shard, bytes, candidates, survivors, indexCells}',
  '  promote <gen> <lane> [--dir work/grow/gen-<gen>/<lane>] [--grown grown]',
  '      the survivors (verdict.json survived:true AND the whole CONTRACT conjunction, else refused) into grown/cells/,',
  '      ONE cell per class (the champion): promoted only when its held-out score is above the class\'s current cell',
  '      (the parent lane promotes first and wins ties), the cell it beats is retired (the archive shard keeps it),',
  '      the rest stay in the archive; grown/index.json and grown/index.mjs regenerated and proven (node --check,',
  '      import, grownAnswer(examples[0].q) is the cell); prints {promoted, archived: [{id, class, score, holds, why}],',
  '      retired, cells, generation}',
  '  index [--repo ' + DEFAULT_REPO + '] [--branch main] [--api-base URL]   prints {shards, cells, survivors}',
  '  verify-local [--grown grown]   prints {cells, answers: [{id, q, ok}]}',
  'transport: gh api when gh is logged in, else GITHUB_TOKEN with fetch, else "' + NO_TRANSPORT + '"',
].join('\n');

export class Fail extends Error {}
const oneLine = (s) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, 300);

// ---------------------------------------------------------------- arguments

const FLAGS = new Set(['dir', 'repo', 'branch', 'api-base', 'grown']);
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
    let v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '' || (eq < 0 && v.startsWith('--'))) throw new Fail('flag --' + name + ' needs a value');
    flags[name] = v;
  }
  return { pos, flags };
}

function genOf(s) {
  if (!/^\d{1,6}$/.test(String(s ?? ''))) throw new Fail('generation "' + (s ?? '') + '" is not a whole number');
  return Number(s);
}
function laneOf(s) {
  if (!LANE_RE.test(String(s ?? ''))) throw new Fail('lane "' + (s ?? '') + '" is not a short word (' + LANE_RE + ')');
  return s;
}

// ---------------------------------------------------------------- ustar writer (POSIX.1-1988 headers)

function octal(n, width) {
  const s = Math.floor(n).toString(8);
  if (s.length > width - 1) throw new Fail('tar: ' + n + ' does not fit a ' + width + ' byte field');
  return s.padStart(width - 1, '0') + '\0';
}

function splitName(name) {
  if (Buffer.byteLength(name) <= 100) return ['', name];
  for (let i = name.length - 1; i > 0; i--) {
    if (name[i] !== '/') continue;
    const pre = name.slice(0, i);
    const rest = name.slice(i + 1);
    if (rest && Buffer.byteLength(pre) <= 155 && Buffer.byteLength(rest) <= 100) return [pre, rest];
  }
  throw new Fail('tar: the path ' + name + ' is too long for a ustar header');
}

export function ustarHeader({ name, size = 0, mode = 0o644, mtime = 0, type = '0' }) {
  const h = Buffer.alloc(512, 0);
  const [prefix, base] = splitName(name);
  h.write(base, 0, 100, 'utf8');
  h.write(octal(mode, 8), 100, 8, 'ascii');
  h.write(octal(0, 8), 108, 8, 'ascii');
  h.write(octal(0, 8), 116, 8, 'ascii');
  h.write(octal(size, 12), 124, 12, 'ascii');
  h.write(octal(mtime, 12), 136, 12, 'ascii');
  h.fill(0x20, 148, 156);
  h.write(type, 156, 1, 'ascii');
  h.write('ustar\0', 257, 6, 'ascii');
  h.write('00', 263, 2, 'ascii');
  h.write('brain', 265, 32, 'ascii');
  h.write('brain', 297, 32, 'ascii');
  h.write(octal(0, 8), 329, 8, 'ascii');
  h.write(octal(0, 8), 337, 8, 'ascii');
  h.write(prefix, 345, 155, 'utf8');
  let sum = 0;
  for (const b of h) sum += b;
  h.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8, 'ascii');
  return h;
}

/** entries: [{ name, data?: Buffer, dir?: true, mode?, mtime? }] in order; returns the uncompressed tar. */
export function tarPack(entries) {
  const parts = [];
  for (const e of entries) {
    if (e.dir) { parts.push(ustarHeader({ name: e.name.endsWith('/') ? e.name : e.name + '/', mode: e.mode ?? 0o755, mtime: e.mtime ?? 0, type: '5' })); continue; }
    const data = e.data ?? Buffer.alloc(0);
    parts.push(ustarHeader({ name: e.name, size: data.length, mode: e.mode ?? 0o644, mtime: e.mtime ?? 0, type: '0' }));
    parts.push(data);
    const pad = (512 - (data.length % 512)) % 512;
    if (pad) parts.push(Buffer.alloc(pad, 0));
  }
  parts.push(Buffer.alloc(1024, 0));
  return Buffer.concat(parts);
}

/** Every directory and regular file under dir, sorted, as tar entries under the prefix. Symlinks are skipped. */
export function laneEntries(dir, prefix) {
  const out = [{ name: prefix + '/', dir: true, mtime: Math.floor(fs.statSync(dir).mtimeMs / 1000) }];
  const walk = (abs, rel) => {
    for (const name of fs.readdirSync(abs).sort()) {
      const a = path.join(abs, name);
      const r = rel ? rel + '/' + name : name;
      const st = fs.lstatSync(a);
      const mtime = Math.floor(st.mtimeMs / 1000);
      if (st.isDirectory()) { out.push({ name: prefix + '/' + r + '/', dir: true, mtime }); walk(a, r); }
      else if (st.isFile()) out.push({ name: prefix + '/' + r, data: fs.readFileSync(a), mtime });
    }
  };
  walk(dir, '');
  return out;
}

// ---------------------------------------------------------------- the lane on disk

function readJsonMaybe(file) {
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Fail(file + ' is not JSON: ' + oneLine(e.message)); }
}

const META_CLASS_RE = /export\s+const\s+meta\s*=\s*(?:Object\.freeze\(\s*)?\{[^}]*?\bclass\s*:\s*['"]([^'"]+)['"]/s;

/** The candidate directories of a lane: every subdirectory holding cell.mjs, named by its id. */
export function candidatesOf(laneDir) {
  if (!fs.existsSync(laneDir) || !fs.statSync(laneDir).isDirectory()) throw new Fail('no lane directory at ' + laneDir);
  const out = [];
  for (const name of fs.readdirSync(laneDir).sort()) {
    const dir = path.join(laneDir, name);
    if (!fs.lstatSync(dir).isDirectory() || !fs.existsSync(path.join(dir, 'cell.mjs'))) continue;
    if (!ID_RE.test(name)) throw new Fail('candidate directory ' + name + ' is not an id (' + ID_RE + ')');
    const verdict = readJsonMaybe(path.join(dir, 'verdict.json'));
    const result = readJsonMaybe(path.join(dir, 'result.json'));
    for (const [what, o] of [['verdict.json', verdict], ['result.json', result]]) {
      if (o && o.id != null && o.id !== name) throw new Fail(name + '/' + what + ' names id ' + o.id + ', not its directory ' + name);
    }
    let klass = verdict?.class ?? result?.class ?? null;
    if (klass == null) klass = (META_CLASS_RE.exec(fs.readFileSync(path.join(dir, 'cell.mjs'), 'utf8')) || [])[1] ?? null;
    // a survivor is the whole CONTRACT conjunction, not a field: shard, index and promote read the same answer
    out.push({ id: name, dir, class: klass, verdict, result, survived: verdict?.survived === true && conjunctionFailures(verdict, result).length === 0 });
  }
  return out;
}

// ---------------------------------------------------------------- transport: the GitHub contents API

function parseIncluded(stdout, stderr) {
  const text = String(stdout ?? '');
  const m = /^HTTP\/[\d.]+ (\d{3})/.exec(text);
  if (!m) throw new Fail('gh api printed no HTTP status: ' + oneLine(stderr || text));
  const cut = /\r?\n\r?\n/.exec(text);
  const body = cut ? text.slice(cut.index + cut[0].length) : '';
  let json = null;
  try { json = body.trim() ? JSON.parse(body) : null; } catch { json = null; }
  return { status: Number(m[1]), json };
}

function ghTransport() {
  return {
    kind: 'gh',
    async request(method, apiPath, body) {
      const args = ['api', '-X', method, apiPath, '--include'];
      if (body !== undefined) args.push('--input', '-');
      const r = spawnSync('gh', args, {
        input: body === undefined ? undefined : JSON.stringify(body),
        encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, timeout: 600000, windowsHide: true,
      });
      if (r.error) throw new Fail('gh api could not run: ' + (r.error.code || oneLine(r.error.message)));
      return parseIncluded(r.stdout, r.stderr);
    },
  };
}

function fetchTransport(base, token) {
  const root = base.replace(/\/+$/, '');
  return {
    kind: token ? 'token' : 'fetch',
    async request(method, apiPath, body) {
      const headers = { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'dilation-brain-grow-store' };
      if (token) headers.authorization = 'Bearer ' + token;
      if (body !== undefined) headers['content-type'] = 'application/json';
      let res;
      try { res = await fetch(root + '/' + apiPath, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }); }
      catch (e) { throw new Fail('the store API at ' + root + ' is unreachable: ' + oneLine(e?.cause?.code || e?.message)); }
      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = null; }
      return { status: res.status, json };
    },
  };
}

function ghReady() {
  const r = spawnSync('gh', ['auth', 'status'], { stdio: 'ignore', timeout: 60000, windowsHide: true });
  return !r.error && r.status === 0;
}

/** gh first, then GITHUB_TOKEN, else the NO_TRANSPORT line. --api-base wins and never carries the token off https GitHub. */
export function makeTransport({ apiBase, env = process.env, ghCheck = ghReady } = {}) {
  if (apiBase) {
    let u;
    try { u = new URL(apiBase); } catch { throw new Fail('--api-base ' + apiBase + ' is not a URL'); }
    return fetchTransport(apiBase, u.protocol === 'https:' && u.host === 'api.github.com' ? env.GITHUB_TOKEN || null : null);
  }
  if (ghCheck()) return ghTransport();
  if (env.GITHUB_TOKEN) return fetchTransport(GITHUB_API, env.GITHUB_TOKEN);
  throw new Fail(NO_TRANSPORT);
}

const encodePath = (p) => p.split('/').map(encodeURIComponent).join('/');
const statusFail = (what, r) => new Fail(what + ': HTTP ' + r.status + (r.json?.message ? ' ' + oneLine(r.json.message) : ''));

/** GET one file of the store: null when absent, else { sha, content: Buffer } (the blob API past 1 MB). */
export async function getFile(tp, repo, p, branch, { shaOnly = false } = {}) {
  const r = await tp.request('GET', 'repos/' + repo + '/contents/' + encodePath(p) + '?ref=' + encodeURIComponent(branch));
  if (r.status === 404) return null;
  if (r.status !== 200) throw statusFail('GET ' + p, r);
  const j = r.json;
  if (!j || Array.isArray(j) || (j.type && j.type !== 'file') || typeof j.sha !== 'string') throw new Fail(p + ' in the store is not a file');
  if (shaOnly) return { sha: j.sha, content: null };
  let content;
  if (j.encoding === 'base64' && (j.content || j.size === 0)) content = Buffer.from(j.content || '', 'base64');
  else {
    const b = await tp.request('GET', 'repos/' + repo + '/git/blobs/' + j.sha);
    if (b.status !== 200 || b.json?.encoding !== 'base64') throw statusFail('GET blob of ' + p, b);
    content = Buffer.from(b.json.content || '', 'base64');
  }
  if (Number.isInteger(j.size) && content.length !== j.size) throw new Fail(p + ' decoded to ' + content.length + ' bytes, the store says ' + j.size);
  return { sha: j.sha, content };
}

async function putFile(tp, repo, p, buf, message, sha, branch) {
  const body = { message, content: buf.toString('base64'), branch };
  if (sha) body.sha = sha;
  return tp.request('PUT', 'repos/' + repo + '/contents/' + encodePath(p), body);
}

/** Create or replace one file (GET its sha first). */
async function writeFile(tp, repo, p, buf, message, branch) {
  for (let attempt = 1; ; attempt++) {
    const cur = await getFile(tp, repo, p, branch, { shaOnly: true });
    const r = await putFile(tp, repo, p, buf, message, cur?.sha, branch);
    if (r.status === 200 || r.status === 201) return r.status;
    if ((r.status === 409 || r.status === 422) && attempt < PUT_TRIES) continue;
    throw statusFail('PUT ' + p, r);
  }
}

// ---------------------------------------------------------------- the store index

function parseStoreIndex(buf) {
  let j;
  try { j = JSON.parse(buf.toString('utf8')); } catch (e) { throw new Fail('the store index.json is not JSON: ' + oneLine(e.message)); }
  if (!j || !Array.isArray(j.shards) || !Array.isArray(j.cells)) throw new Fail('the store index.json is not { shards: [..], cells: [..] }');
  return j;
}

/** Append a shard's rows; a re-run of the same shard replaces its own rows; an id held by another shard is refused. */
export function mergeStoreIndex(index, shard, rows) {
  const kept = index.cells.filter((c) => c.shard !== shard);
  const taken = new Map(kept.map((c) => [c.id, c.shard]));
  for (const r of rows) if (taken.has(r.id)) throw new Fail('id ' + r.id + ' is already in the store from ' + taken.get(r.id) + ': an id is unique across the store');
  const shards = index.shards.includes(shard) ? index.shards.slice() : [...index.shards, shard];
  return { ...index, shards, cells: [...kept, ...rows] };
}

async function readStoreIndex(tp, repo, branch) {
  const cur = await getFile(tp, repo, 'index.json', branch);
  return { sha: cur?.sha ?? null, index: cur ? parseStoreIndex(cur.content) : { shards: [], cells: [] } };
}

// ---------------------------------------------------------------- shard

export async function shard({ gen, lane, dir, repo = DEFAULT_REPO, branch = DEFAULT_BRANCH, tp, now = () => new Date() }) {
  if (!REPO_RE.test(repo)) throw new Fail('--repo ' + repo + ' is not owner/name');
  const cands = candidatesOf(dir);
  if (!cands.length) throw new Fail('no candidate (a directory with cell.mjs) in ' + dir + ': nothing to shard');
  const seen = new Set();
  for (const c of cands) { if (seen.has(c.id)) throw new Fail('id ' + c.id + ' appears twice in the lane'); seen.add(c.id); }
  const name = 'gen-' + gen + '-' + lane;
  const shardPath = 'shards/' + name + '.tar.gz';
  const gz = zlib.gzipSync(tarPack(laneEntries(dir, name)), { level: 9 });
  if (gz.length > MAX_SHARD_BYTES) throw new Fail(shardPath + ' is ' + gz.length + ' bytes, over the ' + MAX_SHARD_BYTES + ' byte contents API limit: split the lane');
  const rows = cands.map((c) => ({ id: c.id, class: c.class, generation: gen, lane, survived: c.survived, shard: shardPath }));
  const survivors = rows.filter((r) => r.survived).length;
  mergeStoreIndex((await readStoreIndex(tp, repo, branch)).index, shardPath, rows);
  await writeFile(tp, repo, shardPath, gz, 'shard ' + name + ': ' + rows.length + ' candidates, ' + survivors + ' survivors', branch);
  let cpu = null;
  for (const c of cands) if (Number.isFinite(c.result?.cpuMs)) cpu = (cpu ?? 0) + c.result.cpuMs;
  const genDoc = {
    generation: gen, lane, at: now().toISOString(),
    candidates: cands.map((c) => ({ id: c.id, class: c.class, survived: c.survived, heldout: c.verdict?.heldout ?? null, baseline: c.verdict?.baseline ?? null })),
    cpuMs: cpu,
  };
  await writeFile(tp, repo, 'generations/' + name + '.json', Buffer.from(JSON.stringify(genDoc, null, 2) + '\n'), 'generation ' + name, branch);
  for (let attempt = 1; ; attempt++) {
    const { sha, index } = await readStoreIndex(tp, repo, branch);
    const merged = mergeStoreIndex(index, shardPath, rows);
    const r = await putFile(tp, repo, 'index.json', Buffer.from(JSON.stringify(merged, null, 2) + '\n'), 'index: ' + name + ', ' + merged.cells.length + ' cells', sha, branch);
    if (r.status === 200 || r.status === 201) return { shard: shardPath, bytes: gz.length, candidates: rows.length, survivors, indexCells: merged.cells.length };
    if ((r.status === 409 || r.status === 422) && attempt < PUT_TRIES) continue;
    throw statusFail('PUT index.json', r);
  }
}

export async function storeIndex({ repo = DEFAULT_REPO, branch = DEFAULT_BRANCH, tp }) {
  if (!REPO_RE.test(repo)) throw new Fail('--repo ' + repo + ' is not owner/name');
  const cur = await getFile(tp, repo, 'index.json', branch);
  if (!cur) {
    const r = await tp.request('GET', 'repos/' + repo);
    if (r.status !== 200) throw statusFail('the store ' + repo + ' is not readable', r);
    return { shards: 0, cells: 0, survivors: 0 };
  }
  const index = parseStoreIndex(cur.content);
  return { shards: index.shards.length, cells: index.cells.length, survivors: index.cells.filter((c) => c.survived === true).length };
}

// ---------------------------------------------------------------- grown/: promote and verify-local

// Where the sandbox's here backend may run (grow/sandbox.mjs CLOUD_ENV): a cloud VM. Anywhere else a here result is a
// candidate that ran on his PC ("Every candidate runs in the cloud ... Never on his PC."), and it is never promoted.
export const CLOUD_ENV = Object.freeze(['CLAUDE_CODE_REMOTE', 'GITHUB_ACTIONS', 'VERCEL', 'CI']);
const finite = (x) => typeof x === 'number' && Number.isFinite(x);
const posInt = (x) => Number.isInteger(x) && x > 0;

/**
 * The CONTRACT survived conjunction, re-read from a verdict's own fields and its result.json (judge/select.mjs sets
 * survived only on all of it). Returns the clauses that fail, [] when the survivor carries every one.
 */
export function conjunctionFailures(verdict, result, env = process.env) {
  const v = verdict && typeof verdict === 'object' ? verdict : {};
  const f = [];
  if (v.survived !== true) f.push('survived is not true');
  if (!Array.isArray(v.why) || v.why.length) f.push('why is not an empty list');
  if (v.lockOk !== true) f.push('lockOk is not true');
  if (!(v.tests?.failed === 0 && posInt(v.tests?.passed))) f.push('verdict tests are not failed 0 with at least one passed');
  if (!(v.control?.shadows === 0 && posInt(v.control?.n))) f.push('control is not shadows 0 over at least one row');
  if (!(posInt(v.examples?.n) && v.examples.ok === v.examples.n)) f.push('not every example is ok');
  if (!(finite(v.heldout?.score) && finite(v.baseline?.score) && v.heldout.score > v.baseline.score)) f.push('heldout.score is not above baseline.score');
  if (!result || typeof result !== 'object') { f.push('there is no result.json'); return f; }
  if (result.validate?.ok !== true) f.push('result.json validate.ok is not true');
  if (!(result.tests?.exitCode === 0 && result.tests?.failed === 0)) f.push('result.json tests are not exit code 0 with failed 0');
  if (result.error) f.push('result.json records a sandbox error');
  if (result.exitCode != null && result.exitCode !== 0) f.push('result.json exitCode is ' + result.exitCode);
  if (result.backend === 'here') { if (!CLOUD_ENV.some((k) => env[k])) f.push('result.json backend is here and this is not a cloud VM: a candidate never runs on his PC'); }
  else if (result.backend !== 'vercel') f.push('result.json backend is ' + JSON.stringify(result.backend ?? null) + ', not vercel or here');
  return f;
}

const GROWN_HEAD_1 = '// grown/index.mjs: GENERATED by `node grow/store.mjs promote` (grow/CONTRACT.md). The survivors, in index\n';
// The body of the generation-0 grown/index.mjs, verbatim: act/prompt.mjs and the function depend on its shape.
export const GROWN_BODY = [
  '/** The first survivor that can answer q, or null. Shape: { id, class, generation, answer }. */',
  'export function grownAnswer(q) {',
  "  const text = String(q ?? '');",
  '  for (const c of GROWN) {',
  '    let can = false;',
  '    try { can = c.can(text) === true; } catch { can = false; }',
  '    if (!can) continue;',
  '    let a = null;',
  '    try { a = c.answer(text); } catch { a = null; }',
  "    if (typeof a === 'string' && a.trim().length) return { id: c.meta.id, class: c.meta.class, generation: c.meta.generation, answer: a };",
  '  }',
  '  return null;',
  '}',
  '',
].join('\n');

/** grown/index.mjs for a grown/index.json: static imports in index order, GROWN, grownAnswer. */
export function renderIndexMjs(index) {
  const n = index.cells.length;
  const what = n === 0 ? 'no cell yet.' : n + (n === 1 ? ' cell.' : ' cells.');
  const lines = [GROWN_HEAD_1 + '// order. Do not edit by hand: the next promote rewrites it. Generation ' + index.generation + ': ' + what];
  index.cells.forEach((c, i) => lines.push('import * as c' + i + " from './" + c.file + "';"));
  lines.push('export const GROWN = Object.freeze([' + index.cells.map((_, i) => 'c' + i).join(', ') + ']);');
  return lines.join('\n') + '\n\n' + GROWN_BODY;
}

function readGrownIndex(grownDir) {
  const file = path.join(grownDir, 'index.json');
  if (!fs.existsSync(file)) throw new Fail('no grown index at ' + file);
  let j;
  try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { throw new Fail(file + ' is not JSON: ' + oneLine(e.message)); }
  if (!j || !Number.isInteger(j.generation) || !Array.isArray(j.cells)) throw new Fail(file + ' is not { generation, cells: [..] }');
  return j;
}

// The statement shapes grow/contract.mjs importsOf reads, plus `export ... from`; text inside a string is left alone.
const IMPORT_STMT_RE = /^(\s*import\s+(?:[^'"]+?\s+from\s+)?)(['"])([^'"]+)\2/gm;
const EXPORT_FROM_RE = /^(\s*export\s+(?:\*(?:\s+as\s+[A-Za-z_$][\w$]*)?|\{[^}]*\})\s*from\s+)(['"])([^'"]+)\2/gm;
const flatName = (id, rel) => id + '-' + rel.split('/').join('-');
const isCode = (rel) => /\.(?:mjs|js)$/.test(rel);

/** The files a survivor brings: cell.mjs as <id>.mjs and every ./ sibling it reaches as <id>-<file>, imports rewritten. */
export function copyPlan(candDir, id) {
  const files = new Map();
  const queue = ['cell.mjs'];
  while (queue.length) {
    const rel = queue.shift();
    if (files.has(rel)) continue;
    const abs = path.join(candDir, ...rel.split('/'));
    if (!fs.existsSync(abs) || !fs.lstatSync(abs).isFile()) throw new Fail(id + ': ' + rel + ' is imported but is not a file in the candidate directory');
    const to = rel === 'cell.mjs' ? id + '.mjs' : flatName(id, rel);
    if (!isCode(rel)) { files.set(rel, { rel, to, data: fs.readFileSync(abs) }); continue; }
    let text = fs.readFileSync(abs, 'utf8');
    if (rel !== 'cell.mjs') for (const [re, what] of FORBIDDEN) if (re.test(text)) throw new Fail(id + ': the sibling ' + rel + ' uses ' + what);
    const deps = [];
    const rewrite = (m, pre, qt, spec) => {
      if (!spec.startsWith('./')) throw new Fail(id + ': ' + rel + ' imports "' + spec + '", not a relative file in the cell directory');
      const dep = path.posix.normalize(path.posix.join(path.posix.dirname(rel), spec));
      if (dep.startsWith('..') || path.posix.isAbsolute(dep)) throw new Fail(id + ': ' + rel + ' imports "' + spec + '" from outside the cell directory');
      deps.push(dep);
      return pre + qt + './' + (dep === 'cell.mjs' ? id + '.mjs' : flatName(id, dep)) + qt;
    };
    text = text.replace(IMPORT_STMT_RE, rewrite).replace(EXPORT_FROM_RE, rewrite);
    files.set(rel, { rel, to, data: Buffer.from(text, 'utf8') });
    queue.push(...deps);
  }
  return [...files.values()];
}

/** Import grown/index.mjs and ask every cell its own examples[0].q through grownAnswer. */
export async function answersOf(mjsPath) {
  const mod = await import(pathToFileURL(mjsPath).href + '?v=' + Date.now() + '-' + Math.random().toString(36).slice(2));
  if (!Array.isArray(mod.GROWN) || typeof mod.grownAnswer !== 'function') throw new Fail(mjsPath + ' does not export GROWN and grownAnswer');
  const answers = mod.GROWN.map((c) => {
    const id = c?.meta?.id ?? null;
    const q = c?.examples?.[0]?.q ?? null;
    let r = null;
    try { r = typeof q === 'string' ? mod.grownAnswer(q) : null; } catch { r = null; }
    return { id, q, ok: !!r && r.id === id, got: r ? r.id : null };
  });
  return { mod, answers };
}

function nodeCheck(file) {
  const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true });
  if (r.status !== 0) throw new Fail('node --check ' + file + ' failed: ' + oneLine(r.stderr || r.stdout));
}

/** The held-out score a verdict or an index row carries; none ranks below every real score. */
const heldScore = (h) => (h && typeof h.score === 'number' && Number.isFinite(h.score) ? h.score : -1);
/** The class a cell holds in grown/; a cell without one holds a class of its own. */
const classKey = (klass, id) => (klass == null ? 'id:' + id : 'class:' + klass);

/**
 * The survivors of a lane into grown/: ONE cell per class, the champion (generation 1, 2026-09-30: two lanes each
 * grew a survivor per class, and the second lane's cells could not answer their own example through grownAnswer
 * because the first lane's cell of the same class answered first). The lane's survivors are ranked by held-out
 * score, then n, then id; a survivor is promoted only when its score is ABOVE the class's current cell (a tie keeps
 * the cell already there, so the lane promoted first, the parent, wins ties), and the cell it beats is RETIRED: its
 * files leave grown/cells/ and its row leaves grown/index.json (the archive shard keeps it). Every other survivor
 * stays in the archive and is listed under `archived` with the id that holds its class. A transaction: any failure
 * after the first write restores grown/ exactly, retired files included.
 */
export async function promote({ gen, lane, dir, grownDir, now = () => new Date(), env = process.env, render = renderIndexMjs }) {
  const index = readGrownIndex(grownDir);
  const survivors = candidatesOf(dir).filter((c) => c.verdict?.survived === true); // the verdict's own word: the conjunction is re-checked below, clause by clause, so a forged survivor is REFUSED, never skipped
  const idle = { promoted: [], archived: [], retired: [], cells: index.cells.length, generation: index.generation };
  if (!survivors.length) return idle;
  if (gen < 1) throw new Fail('generation ' + gen + ' holds a survivor but a cell generation is an integer from 1');
  const cellsDir = path.join(grownDir, 'cells');
  const held = new Set(index.cells.map((c) => c.id));
  const planned = new Set();
  const plan = [], archived = [], retiring = new Map(), taken = new Map(); // classKey -> the index row this run retires; classKey -> the id this run promotes
  const ranked = [...survivors].sort((a, b) => (heldScore(b.verdict?.heldout) - heldScore(a.verdict?.heldout))
    || ((b.verdict?.heldout?.n ?? 0) - (a.verdict?.heldout?.n ?? 0)) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  for (const c of ranked) {
    const broken = conjunctionFailures(c.verdict, c.result, env);
    if (broken.length) throw new Fail(c.id + ': verdict.json says survived true but the conjunction fails: ' + broken.join('; '));
    if (held.has(c.id)) { // a promote never overwrites a cell: the id is skipped, not refused, so a re-run of a half-landed generation converges
      archived.push({ id: c.id, class: c.class, score: heldScore(c.verdict?.heldout), holds: c.id, why: 'already in grown/ from an earlier promote: a promote never overwrites a cell' });
      continue;
    }
    // the guards every survivor passes, archived or not: a lane holding a survivor that breaks the contract or whose
    // siblings break the rules is refused whole, before any write (a defect is refused, never skipped)
    const src = fs.readFileSync(path.join(c.dir, 'cell.mjs'), 'utf8');
    const v = validateCell(src);
    if (!v.ok) throw new Fail(c.id + ': the cell fails the contract: ' + v.errors.join('; '));
    const files = copyPlan(c.dir, c.id);
    const key = classKey(c.class, c.id), score = heldScore(c.verdict?.heldout);
    if (taken.has(key)) { archived.push({ id: c.id, class: c.class, score, holds: taken.get(key), why: 'one cell per class: ' + taken.get(key) + ' ranks first in this lane' }); continue; }
    const current = index.cells.find((row) => classKey(row.class, row.id) === key) ?? null;
    if (current && !(score > heldScore(current.heldout))) {
      archived.push({ id: c.id, class: c.class, score, holds: current.id, why: 'one cell per class: ' + current.id + ' holds it at ' + heldScore(current.heldout) + ', and ' + score + ' is not above that' });
      continue;
    }
    if (current) retiring.set(key, current);
    taken.set(key, c.id);
    held.add(c.id);
    for (const f of files) {
      if (planned.has(f.to) || fs.existsSync(path.join(cellsDir, f.to))) throw new Fail('duplicate id ' + c.id + ': grown/cells/' + f.to + ' already exists, a promote never overwrites a cell');
      planned.add(f.to);
    }
    plan.push({ c, files });
  }
  if (!plan.length) return { ...idle, archived };
  const indexPath = path.join(grownDir, 'index.json');
  const mjsPath = path.join(grownDir, 'index.mjs');
  const backup = { json: fs.readFileSync(indexPath), mjs: fs.existsSync(mjsPath) ? fs.readFileSync(mjsPath) : null };
  // the files a retired cell owns in grown/cells/: <id>.mjs and the siblings copyPlan flattened under <id>-
  const retiredRows = [...retiring.values()];
  const retiredIds = new Set(retiredRows.map((row) => row.id));
  const owned = (id) => (fs.existsSync(cellsDir) ? fs.readdirSync(cellsDir) : []).filter((f) => f === id + '.mjs' || f.startsWith(id + '-')).map((f) => path.join(cellsDir, f));
  const written = [], removed = [];
  try {
    fs.mkdirSync(cellsDir, { recursive: true });
    for (const p of plan) for (const f of p.files) { const to = path.join(cellsDir, f.to); fs.writeFileSync(to, f.data, { flag: 'wx' }); written.push(to); }
    for (const row of retiredRows) for (const f of owned(row.id)) { removed.push({ file: f, data: fs.readFileSync(f) }); fs.rmSync(f); }
    const at = now().toISOString();
    const rows = [];
    for (const { c } of plan) {
      const file = path.join(cellsDir, c.id + '.mjs');
      const mod = await import(pathToFileURL(file).href);
      const v = validateCell(fs.readFileSync(file, 'utf8'), mod);
      if (!v.ok) throw new Fail(c.id + ': the promoted copy fails the contract: ' + v.errors.join('; '));
      if (mod.meta.id !== c.id) throw new Fail(c.id + ': meta.id is ' + mod.meta.id + ', not its directory');
      if (c.class != null && mod.meta.class !== c.class) throw new Fail(c.id + ': meta.class is ' + mod.meta.class + ' but the verdict says ' + c.class);
      if (mod.meta.generation !== gen) throw new Fail(c.id + ': meta.generation is ' + mod.meta.generation + ', not the promoted generation ' + gen);
      const h = c.verdict?.heldout ?? {};
      rows.push({ id: c.id, class: mod.meta.class, generation: gen, lane, file: 'cells/' + c.id + '.mjs', heldout: { score: h.score ?? null, n: h.n ?? null, ok: h.ok ?? null }, promotedAt: at });
    }
    const next = { ...index, generation: Math.max(index.generation, gen), cells: [...index.cells.filter((row) => !retiredIds.has(row.id)), ...rows] };
    fs.writeFileSync(indexPath, JSON.stringify(next, null, 2) + '\n');
    fs.writeFileSync(mjsPath, render(next));
    nodeCheck(mjsPath);
    const { mod, answers } = await answersOf(mjsPath);
    if (mod.GROWN.length !== next.cells.length) throw new Fail('grown/index.mjs exports ' + mod.GROWN.length + ' cells, grown/index.json lists ' + next.cells.length);
    next.cells.forEach((row, i) => { if (answers[i].id !== row.id) throw new Fail('grown/index.mjs cell ' + i + ' is ' + answers[i].id + ', grown/index.json says ' + row.id); });
    const bad = answers.filter((a) => !a.ok);
    if (bad.length) throw new Fail(bad.map((a) => a.id + ' does not answer its own examples[0].q through grownAnswer (got ' + (a.got ?? 'null') + ')').join('; '));
    return { promoted: rows.map((r) => r.id), archived, retired: [...retiredIds], cells: next.cells.length, generation: next.generation };
  } catch (e) {
    for (const f of written.reverse()) { try { fs.rmSync(f, { force: true }); } catch { /* best effort */ } }
    for (const r of removed.reverse()) { try { fs.writeFileSync(r.file, r.data); } catch { /* best effort */ } }
    fs.writeFileSync(indexPath, backup.json);
    if (backup.mjs) fs.writeFileSync(mjsPath, backup.mjs); else fs.rmSync(mjsPath, { force: true });
    const msg = e instanceof Fail ? e.message : 'promote failed: ' + oneLine(e?.message || e);
    throw new Fail(msg + ' (rolled back: grown/ is as it was)');
  }
}

export async function verifyLocal({ grownDir }) {
  const mjsPath = path.join(grownDir, 'index.mjs');
  if (!fs.existsSync(mjsPath)) throw new Fail('no ' + mjsPath);
  const { answers } = await answersOf(mjsPath);
  const bad = answers.filter((a) => !a.ok);
  if (bad.length) throw new Fail('verify-local: ' + bad.length + ' of ' + answers.length + ' cells do not answer their own examples[0].q: ' + bad.map((a) => a.id).join(', '));
  return { cells: answers.length, answers: answers.map(({ id, q, ok }) => ({ id, q, ok })) };
}

// ---------------------------------------------------------------- CLI

export async function main(argv = process.argv.slice(2), { env = process.env, ghCheck } = {}) {
  const { pos, flags } = parseArgs(argv);
  const verb = pos[0];
  if (flags.help) return { usage: true };
  if (!verb) throw new Fail('no verb: shard, promote, index or verify-local (see --help)');
  const grownDir = path.resolve(flags.grown || path.join(ROOT, 'grown'));
  const laneDir = (g, l) => path.resolve(flags.dir || path.join(ROOT, 'work', 'grow', 'gen-' + g, l));
  const store = () => ({ repo: flags.repo || DEFAULT_REPO, branch: flags.branch || DEFAULT_BRANCH, tp: makeTransport({ apiBase: flags['api-base'], env, ghCheck }) });
  if (verb === 'shard' || verb === 'promote') {
    if (pos.length !== 3) throw new Fail(verb + ' takes <gen> <lane> (see --help)');
    const gen = genOf(pos[1]);
    const lane = laneOf(pos[2]);
    if (verb === 'promote') return promote({ gen, lane, dir: laneDir(gen, lane), grownDir, env });
    return shard({ gen, lane, dir: laneDir(gen, lane), ...store() });
  }
  if (pos.length !== 1) throw new Fail(verb + ' takes no positional argument (see --help)');
  if (verb === 'index') return storeIndex(store());
  if (verb === 'verify-local') return verifyLocal({ grownDir });
  throw new Fail('unknown verb ' + verb + ' (shard, promote, index, verify-local; see --help)');
}

const self = fileURLToPath(import.meta.url);
const invoked = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invoked && (process.platform === 'win32' ? invoked.toLowerCase() === self.toLowerCase() : invoked === self)) {
  main().then(
    (out) => { if (out && out.usage === true) console.log(USAGE); else console.log(JSON.stringify(out)); },
    (e) => { process.stderr.write((e instanceof Fail ? e.message : 'store: ' + oneLine(e?.stack || e)) + '\n'); process.exitCode = 1; },
  );
}
