// self/prune.mjs: THE CENSUS WALL, AUTHORED (Board 14, his order of 2026-09-24 12:02: "EVERY GAP
// should be able to be filled by itself").
//
// The autopilot's census source (self/autopilot.mjs censusCandidates) proposes one prune per edges
// file of the census seed, and every one of them was refused at the patch wall: the seed's
// manifest.json pins a content hash, so deleting lines from one file fails verify(), and the only
// prune that keeps a seed loadable re-emits the WHOLE seed through `genome/emit.mjs --prune`,
// a call nothing authored. This file authors it, on a copy of the tree, and never writes the tree
// it was given:
//
//   1. read the census verdict and decode its liveness bitsets exactly as the autopilot does
//      (decodeBits: bit i at byte i>>3, position i&7), refusing a bitset whose popcount is not
//      its recorded count, a census taken on another content hash, and a seed with no census;
//   2. copy the tree to a temp directory, leaving out state/, .git/, node_modules/,
//      bench/fixtures/, web/dist/, bench/verdicts/.census/ and every seed under organism/ but
//      this one, except the paths the caller names in `include` (what the gate's own tests read);
//   3. on the copy, genome/emit.mjs pruneOnCopy writes organism/<seed>-pruned with the copy's
//      own emitter;
//   4. re-point the seed: its index.mjs re-exports ../<seed>-pruned/index.mjs and its
//      manifest.json becomes the pruned manifest with its file paths re-rooted there. Those two
//      files are the whole change, returned as a unified diff that self/code.mjs
//      applyUnifiedPatch applies back to the old text (checked before it is returned);
//   5. load the re-pointed seed on the copy in a child process and verify() it against the new
//      manifest, so "the pruned seed is loaded" is a measurement, not a claim;
//   6. find a census on disk of the pruned CONTENT (a census whose manifest hash is the pruned
//      hash). Its load-bearing count is the dead share after. When `carry` is on, the copy also
//      gets a census record naming the re-pointed seed at that hash, derived from that census
//      and saying so: the gate's LOAD-BEARING row matches a census to a seed by path and hash,
//      and without it the re-pointed seed has no census at its new hash (the row goes red);
//   7. run the seed's own tests (every test file that names organism/<seed>) and the gate
//      (node bench/gate.mjs --quiet) on the copy;
//   8. delete the copy, verify the deletion, and read the disk space left.
//
// A control run (control: true) does steps 1, 2, 7 and 8 on the same kind of copy with no prune
// and no re-point, so the gate line with the intervention off is on record beside the one with
// it on. The returned prunedDir is a path, not a diff: a seed is up to 277 MB.
//
//   node self/prune.mjs [--census bench/verdicts/census.json] [--seed organism/gen-0]
//        [--control] [--include a,b,...] [--gate-cmd "node bench/gate.mjs --quiet"]
//        [--no-carry] [--no-gate] [--work <dir>] [--out result.json] [--json]
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, readdirSync, statSync,
  cpSync, statfsSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { pruneOnCopy } from '../genome/emit.mjs';
import { decodeBits, runGate, DEFAULT_GATE_CMD, GATE_TIMEOUT_MS } from './autopilot.mjs';
import { ROOT, runTest, applyUnifiedPatch } from './code.mjs';

export const AUTHOR = 'organism (prune)';
export const HEAP_MB = 6000;
export const TEST_TIMEOUT_MS = 10 * 60_000;
/** Top-level directories a trial copy never carries (the BUDGETS rule). */
export const COPY_SKIP_TOP = Object.freeze(['state', '.git', 'node_modules']);
/** Deeper paths a trial copy never carries, unless named in include. */
export const COPY_SKIP_PATHS = Object.freeze(['bench/fixtures', 'web/dist', 'bench/verdicts/.census']);
const MB = 1024 * 1024;
const SELF_FILE = fileURLToPath(import.meta.url);
const posix = (p) => String(p).replaceAll('\\', '/');
const relOf = (root, abs) => posix(path.relative(root, abs));
const round6 = (x) => Math.round(x * 1e6) / 1e6;
const readJson = (f) => { try { return { ok: true, j: JSON.parse(readFileSync(f, 'utf8')) }; } catch (e) { return { ok: false, reason: String((e && e.message) || e).split('\n')[0] }; } };
const newestBarFirst = (a, b) => (Number(b.isTheBar) - Number(a.isTheBar)) || ((Date.parse(b.at) || 0) - (Date.parse(a.at) || 0)) || (a.file < b.file ? -1 : 1);

/** organism/<name> from any spelling of a seed path, else null. */
export function seedRel(p) {
  if (typeof p !== 'string') return null;
  const m = posix(p.trim()).match(/(?:^|\/)organism\/([A-Za-z0-9_][\w.-]*)\/?$/);
  return m ? 'organism/' + m[1] : null;
}

/**
 * Decode one liveness bitset the way the autopilot's census source does (self/autopilot.mjs
 * decodeBits), and refuse what that decode would silently accept or cannot explain: a missing
 * count, a byte length that is not ceil(n/8), a popcount that is not the count.
 * @returns {{ ok: true, n, count, dead, bit } | { ok: false, reason }}
 */
export function censusBits(live, what) {
  if (!live || typeof live !== 'object') return { ok: false, reason: 'the census carries no ' + what + ' liveness bitset' };
  if (!Number.isInteger(live.n) || live.n < 0 || typeof live.b64 !== 'string') return { ok: false, reason: 'the ' + what + ' liveness is not a bitset (n, count, b64)' };
  if (!Number.isInteger(live.count)) return { ok: false, reason: 'the ' + what + ' liveness records no count, so its popcount cannot be checked' };
  const bytes = Buffer.from(live.b64, 'base64');
  if (bytes.length !== ((live.n + 7) >> 3)) return { ok: false, reason: 'the ' + what + ' liveness holds ' + bytes.length + ' bytes for ' + live.n + ' bits' };
  const d = decodeBits(live);
  if (!d) {
    let pop = 0;
    for (let i = 0; i < live.n; i++) if ((bytes[i >> 3] >> (i & 7)) & 1) pop++;
    return { ok: false, reason: 'the ' + what + ' liveness popcount ' + pop + ' disagrees with its recorded count ' + live.count };
  }
  return { ok: true, n: d.n, count: d.count, dead: d.n - d.count, bit: d.bit };
}

/** The ruler a census measured with: its mode (a dynamic census has none) and its ticks. */
export const rulerOf = (v) => ({ mode: typeof v.mode === 'string' ? v.mode : 'dynamic', ticks: Number.isFinite(v.ticks) ? v.ticks : null });
export const sameRuler = (a, b) => !!a && !!b && a.mode === b.mode && a.ticks === b.ticks;
/** 1 - load-bearing lines / loaded lines, rounded to 6 places; null when the counts do not allow it. */
export const deadShareOf = (lines) => (lines && lines.loaded > 0 && Number.isFinite(lines.loadBearing) && lines.loadBearing >= 0 && lines.loadBearing <= lines.loaded ? round6(1 - lines.loadBearing / lines.loaded) : null);

/**
 * Every census record on disk under verdictsDir: a verdict naming one seed, and each row of a
 * census over many. Each record says whether it carries liveness bitsets.
 */
export function censusRecords(verdictsDir) {
  let names; try { names = readdirSync(verdictsDir); } catch { return []; }
  const out = [];
  for (const f of names.filter((n) => /^census.*\.json$/.test(n)).sort()) {
    const r = readJson(path.join(verdictsDir, f));
    if (!r.ok || !r.j || typeof r.j !== 'object') continue;
    const v = r.j;
    const push = (row, isRow) => {
      const seed = seedRel(row.seed);
      if (!seed) return;
      const live = row.live || null;
      const hash = (live && live.manifestHash) || (row.hash && row.hash.manifest) || row.manifestHash || null;
      out.push({
        file: f, row: isRow, seed, at: typeof v.at === 'string' ? v.at : null, isTheBar: v.isTheBar === true,
        ruler: rulerOf(isRow ? { ...row, ticks: row.ticks ?? v.ticks } : v), hash: typeof hash === 'string' ? hash : null,
        lines: row.lines && typeof row.lines === 'object' ? { loaded: row.lines.loaded ?? null, loadBearing: row.lines.loadBearing ?? null } : null,
        deadShare: deadShareOf(row.lines), hasBits: !!(live && live.cells && live.edges), carriedFrom: v.carriedFrom || null,
      });
    };
    if (typeof v.seed === 'string') push(v, false);
    if (v.seeds && typeof v.seeds === 'object') for (const s of Object.values(v.seeds)) if (s && typeof s === 'object') push(s, true);
  }
  return out;
}

/** The census verdicts on disk that can prune this seed as it is now: liveness bits at its hash. */
export function censusesFor(root, seed) {
  const s = seedRel(seed);
  const mf = s ? path.join(root, s, 'manifest.json') : null;
  const m = mf && existsSync(mf) ? readJson(mf) : null;
  const hash = m && m.ok ? m.j.hash : null;
  const recs = censusRecords(path.join(root, 'bench', 'verdicts')).filter((r) => r.seed === s);
  return {
    seed: s, hash, lines: m && m.ok && m.j.counts ? m.j.counts.lines : null, records: recs,
    usable: recs.filter((r) => r.hasBits && !r.row && r.hash && r.hash === hash).sort(newestBarFirst),
  };
}

/**
 * Every seed under organism/ with a pinned manifest hash, and the smallest one a census on disk
 * can prune (liveness bits at its hash, something dead in them). Each other seed says why not.
 */
export function pickSeed(root = ROOT) {
  const org = path.join(root, 'organism');
  let ents; try { ents = readdirSync(org, { withFileTypes: true }); } catch { ents = []; }
  const considered = [];
  for (const e of ents) {
    if (!e.isDirectory() || e.name.startsWith('.')) continue;
    const c = censusesFor(root, 'organism/' + e.name);
    if (!c.hash) { considered.push({ seed: c.seed, lines: c.lines, pinned: false, census: null, dead: null, reason: 'no manifest hash pins it' }); continue; }
    let reason = null, census = null, dead = null;
    if (!c.records.length) reason = 'no census on disk names it';
    else if (!c.usable.length) {
      const bits = c.records.filter((r) => r.hasBits);
      reason = !bits.length ? 'its census record(s) (' + [...new Set(c.records.map((r) => r.file))].join(', ') + ') carry no liveness bitset'
        : 'every census with liveness bits was taken on another content hash (' + [...new Set(bits.map((r) => r.file))].join(', ') + ')';
    } else {
      const pref = c.usable[0];
      const v = readJson(path.join(root, 'bench', 'verdicts', pref.file)).j;
      const cb = censusBits(v.live && v.live.cells, 'cell'), eb = censusBits(v.live && v.live.edges, 'edge');
      if (!cb.ok) reason = cb.reason; else if (!eb.ok) reason = eb.reason;
      else if (cb.dead + eb.dead === 0) reason = 'its census (' + pref.file + ') marks nothing dead: 0 of ' + cb.n + ' cells and 0 of ' + eb.n + ' edges';
      else { census = pref.file; dead = { cells: cb.dead, edges: eb.dead }; }
    }
    considered.push({ seed: c.seed, lines: c.lines, pinned: true, census, dead, reason });
  }
  considered.sort((a, b) => (a.lines ?? Infinity) - (b.lines ?? Infinity) || (a.seed < b.seed ? -1 : 1));
  const pick = considered.find((x) => x.census) || null;
  return { pick, considered };
}

/** sha256 over sorted relative paths and bytes of every file under the given paths of root. */
export function treeHash(root, rels = ['.'], { skip = [] } = {}) {
  const h = createHash('sha256');
  let files = 0, bytes = 0;
  const walk = (abs) => {
    const rel = relOf(root, abs);
    if (skip.some((s) => rel === s || rel.startsWith(s + '/'))) return;
    let st; try { st = statSync(abs); } catch { h.update('missing ' + rel + '\n'); return; }
    if (st.isDirectory()) { for (const n of readdirSync(abs).sort()) walk(path.join(abs, n)); return; }
    const b = readFileSync(abs);
    h.update(rel + '\n' + b.length + '\n'); h.update(b);
    files++; bytes += b.length;
  };
  for (const r of rels) walk(path.resolve(root, r));
  return { hash: h.digest('hex'), files, bytes };
}

function dirBytes(abs) {
  let n = 0;
  const walk = (p) => { let st; try { st = statSync(p); } catch { return; } if (st.isDirectory()) { for (const x of readdirSync(p)) walk(path.join(p, x)); } else n += st.size; };
  walk(abs);
  return n;
}
/** MB free on the volume holding p, read with statfs. */
export const freeDiskMb = (p) => { try { const s = statfsSync(p); return Math.round((s.bavail * s.bsize) / MB); } catch { return null; } };

/**
 * Copy root to dest for a trial: every file but the skipped directories and every seed under
 * organism/ except `seed`, plus each path of `include` (relative to root) however it is skipped.
 */
export function copyTree(root, dest, { seed, include = [] } = {}) {
  const keepSeed = seed ? seedRel(seed).slice('organism/'.length) : null;
  const inc = include.map((p) => posix(p).replace(/\/+$/, ''));
  const underInclude = (p) => inc.some((i) => p === i || p.startsWith(i + '/'));
  const aboveInclude = (p) => inc.some((i) => i.startsWith(p + '/'));
  const skipped = (p) => {
    const top = p.split('/')[0];
    if (COPY_SKIP_TOP.includes(top)) return true;
    if (COPY_SKIP_PATHS.some((s) => p === s || p.startsWith(s + '/'))) return true;
    if (top === 'organism') { const parts = p.split('/'); if (parts.length >= 2 && parts[1] !== keepSeed) return true; }
    return false;
  };
  const t0 = Date.now();
  cpSync(root, dest, {
    recursive: true, preserveTimestamps: true,
    filter: (src) => { const p = relOf(root, src); if (!p) return true; if (!skipped(p)) return true; return underInclude(p) || aboveInclude(p); },
  });
  const missing = inc.filter((i) => !existsSync(path.join(root, i)));
  const includedBytes = inc.reduce((a, i) => a + dirBytes(path.join(dest, i)), 0);
  return { ms: Date.now() - t0, bytes: dirBytes(dest), include: inc, includedBytes, missing };
}

/** One unified diff hunk replacing what differs between two texts (the common head and tail kept out). */
export function unifiedDiff(oldText, newText, rel) {
  const a = String(oldText).split(/\r?\n/), b = String(newText).split(/\r?\n/);
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  let s = 0;
  while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
  if (p === a.length && p === b.length) return null;
  // a hunk with no old line is an insertion, which appliers place differently; keep one old line in it
  if (a.length - p - s === 0) { if (p > 0) p--; else s--; }
  const oldMid = a.slice(p, a.length - s), newMid = b.slice(p, b.length - s);
  const L = ['--- a/' + rel, '+++ b/' + rel, '@@ -' + (p + 1) + ',' + oldMid.length + ' +' + (p + 1) + ',' + newMid.length + ' @@'];
  for (const l of oldMid) L.push('-' + l);
  for (const l of newMid) L.push('+' + l);
  return L.join('\n') + '\n';
}

/** The two re-pointed files of a seed whose declarations now live in `pruned`. */
export function repointTexts({ seed, pruned, manifest, before, census }) {
  const name = pruned.slice('organism/'.length);
  const index = [
    '// ' + seed.slice('organism/'.length) + '/index.mjs: RE-POINTED by self/prune.mjs to ' + pruned + ' (author: ' + AUTHOR + ').',
    '// This seed now loads the declarations the census kept: ' + manifest.counts.cells + ' of ' + before.counts.cells + ' cells and ' + manifest.counts.edges + ' of ' + before.counts.edges + ' edges,',
    '// pruned by ' + census.file + ' (census at ' + census.at + '). The declarations live in ../' + name + '/; this file',
    '// and manifest.json are the whole change, so undoing it is this patch reversed.',
    'export * from ' + JSON.stringify('../' + name + '/index.mjs') + ';',
    'export { default } from ' + JSON.stringify('../' + name + '/index.mjs') + ';',
    '',
  ].join('\n');
  const m = {
    ...manifest,
    files: (manifest.files || []).map((f) => ({ ...f, path: '../' + name + '/' + f.path })),
    repointed: {
      by: 'self/prune.mjs', author: AUTHOR, to: pruned,
      from: { name: before.name, hash: before.hash, counts: before.counts },
      census: { file: census.file, at: census.at },
    },
  };
  return { index, manifest: JSON.stringify(m, null, 2) + '\n' };
}

const childEnv = () => { const env = {}; for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v; return env; };

/** Load a seed of a copy in a child and verify it against its manifest. */
export function loadCheck(copy, seed, { heapMb = HEAP_MB, timeoutMs = TEST_TIMEOUT_MS } = {}) {
  const url = (...p) => JSON.stringify(pathToFileURL(path.join(copy, ...p)).href);
  const code = [
    'await import(' + url('cells', 'all.mjs') + ');',
    'const { loadFrom, verify } = await import(' + url('genome', 'load.mjs') + ');',
    'const t0 = Date.now();',
    'const { brain, manifest, meta } = await loadFrom(' + JSON.stringify(path.join(copy, ...seed.split('/'))) + ');',
    'const v = verify(brain, manifest);',
    'process.stdout.write("LOADCHECK " + JSON.stringify({ name: meta && meta.name, cells: brain.cells.length, edges: brain.connectome.n, hash: v.hash, manifestHash: manifest.hash, ok: v.ok, errors: v.errors.slice(0, 3), ms: Date.now() - t0, rssMb: Math.round(process.memoryUsage().rss / 1048576) }) + "\\n");',
    'process.exit(0);',
  ].join('\n');
  const r = spawnSync(process.execPath, ['--max-old-space-size=' + heapMb, '--input-type=module', '-e', code], { cwd: copy, encoding: 'utf8', timeout: timeoutMs, maxBuffer: 16 * MB, env: childEnv(), windowsHide: true });
  const line = ((r.stdout || '').match(/^LOADCHECK (.*)$/m) || [])[1];
  if (!line) return { ok: false, exit: r.status, error: ((r.stderr || '') + (r.stdout || '')).split('\n').filter(Boolean).slice(-3).join(' | ') };
  return { ...JSON.parse(line), exit: r.status };
}

/** Test files of a tree that name the seed by path (organism/<name>, not a longer name). */
export function ownTests(root, seed) {
  const dir = path.join(root, 'test');
  const esc = seed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(esc + '(?![\\w.-])');
  let names; try { names = readdirSync(dir); } catch { return []; }
  return names.filter((n) => n.endsWith('.test.mjs')).sort().filter((n) => { try { return re.test(readFileSync(path.join(dir, n), 'utf8')); } catch { return false; } }).map((n) => 'test/' + n);
}

/**
 * The census of the pruned content: a record whose manifest hash is the pruned hash, with loaded
 * and load-bearing counts. The same ruler as the census before is preferred, then a bar, then the
 * newest. A carried record (this file's own) never counts. Null when no census measured it.
 */
export function censusOfContent(verdictsDir, hash, ruler) {
  const recs = censusRecords(verdictsDir).filter((r) => r.hash === hash && r.deadShare !== null && !r.carriedFrom);
  if (!recs.length) return null;
  recs.sort((a, b) => (Number(sameRuler(b.ruler, ruler)) - Number(sameRuler(a.ruler, ruler))) || newestBarFirst(a, b));
  const r = recs[0];
  return { ...r, sameRuler: sameRuler(r.ruler, ruler) };
}

/** Where the gate on a copy stood: its exit, its summary line, its LOAD-BEARING line, its red files. */
function gateOn(copy, cmd, timeoutMs) {
  const g = runGate({ root: copy, cmd, timeoutMs });
  let j = null;
  const gj = path.join(copy, 'bench', 'verdicts', 'gate.json');
  if (g.gateAt && existsSync(gj)) { const r = readJson(gj); if (r.ok) j = r.j; }
  const rows = j && j.rows ? j.rows : {};
  return {
    verdict: g.timedOut ? 'TIMEOUT' : g.exit === 0 ? 'GREEN' : 'RED', exit: g.exit, cmd: g.cmd, ms: g.ms, summary: g.summary,
    loadBearing: rows.loadBearing ? rows.loadBearing.line : null,
    rows: Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v && typeof v.ok === 'boolean' ? v.ok : null])),
    tests: j ? { passed: j.testsPassed, total: j.testsTotal, assertionsPassed: j.assertionsPassed, assertionsFailed: j.assertionsFailed } : null,
    red: g.red || [], tail: g.summary ? null : g.tail, error: g.error,
  };
}

/**
 * Prune one seed of `root` by a census, on a copy; or, with control, run the same copy with no
 * prune. Never writes root.
 * @param {object} o
 * @param {string} [o.root] the tree (read only)
 * @param {string} [o.census] the census verdict, relative to root (default: the preferred usable one)
 * @param {string} [o.seed] the seed (default: the census's)
 * @param {boolean} [o.control] no prune, no re-point: the same copy, tests and gate
 * @param {string[]} [o.include] paths copied although a skip rule covers them
 * @param {string} [o.gateCmd] @param {number} [o.gateTimeoutMs]
 * @param {boolean} [o.carry] write the carried census record on the copy (default true)
 * @param {string} [o.work] where the copy is made (default the OS temp directory)
 * @param {(s: string) => void} [o.log]
 * @returns {object} { ok, decision, seed, linesBefore, linesAfter, deadShareBefore, deadShareAfter,
 *   gate, ms, patch, prunedDir, ... }
 */
export function pruneSeed({
  root = ROOT, census = null, seed = null, control = false, include = [], gateCmd = DEFAULT_GATE_CMD,
  gateTimeoutMs = GATE_TIMEOUT_MS, testTimeoutMs = TEST_TIMEOUT_MS, carry = true, work = tmpdir(), heapMb = HEAP_MB,
  runOwnTests = true, runGateStep = true, log = () => {},
} = {}) {
  const t0 = Date.now();
  const R = path.resolve(root);
  const refuse = (reason, extra = {}) => ({ ok: false, decision: 'refused', wall: 'census', reason, seed: seedRel(seed) || seed || null, control, patch: null, prunedDir: null, gate: null, ms: Date.now() - t0, ...extra });
  // 1. the census, decoded exactly as the autopilot decodes it
  let s = seed ? seedRel(seed) : null;
  if (seed && !s) return refuse(seed + ' is not a seed under organism/');
  let censusRel = census ? posix(census) : null;
  if (!censusRel) {
    if (!s) return refuse('neither a census nor a seed was named');
    const c = censusesFor(R, s);
    if (!c.usable.length) return refuse(s + ' has no census on disk with liveness bits at its manifest hash' + (c.records.length ? ' (' + c.records.length + ' record(s) name it: ' + [...new Set(c.records.map((r) => r.file))].join(', ') + ')' : ''));
    censusRel = 'bench/verdicts/' + c.usable[0].file;
  }
  const cf = path.resolve(R, censusRel);
  if (!existsSync(cf)) return refuse('no census file at ' + censusRel);
  const cr = readJson(cf);
  if (!cr.ok) return refuse(censusRel + ' does not parse: ' + cr.reason);
  const v = cr.j;
  s = s || seedRel(v.seed);
  if (!s) return refuse(censusRel + ' names no seed under organism/');
  if (seedRel(v.seed) !== s) return refuse(censusRel + ' is a census of ' + (v.seed || 'nothing') + ', not ' + s);
  const mfPath = path.join(R, s, 'manifest.json');
  if (!existsSync(mfPath)) return refuse('no seed at ' + s + ' (no manifest.json)');
  const before = readJson(mfPath);
  if (!before.ok) return refuse(s + '/manifest.json does not parse: ' + before.reason);
  const bm = before.j;
  const live = v.live || {};
  if (!live.manifestHash || live.manifestHash !== bm.hash) return refuse(censusRel + ' was taken on content hash ' + String(live.manifestHash).slice(0, 12) + ', ' + s + ' is ' + String(bm.hash).slice(0, 12) + ' now');
  const cb = censusBits(live.cells, 'cell');
  if (!cb.ok) return refuse(cb.reason);
  const eb = censusBits(live.edges, 'edge');
  if (!eb.ok) return refuse(eb.reason);
  if (cb.n !== bm.counts.cells || eb.n !== bm.counts.edges) return refuse('the bitsets cover ' + cb.n + ' cells and ' + eb.n + ' edges, ' + s + ' declares ' + bm.counts.cells + ' and ' + bm.counts.edges);
  if (!control && cb.dead + eb.dead === 0) return refuse(censusRel + ' marks nothing dead in ' + s + ': there is nothing to prune');
  const beforeRuler = rulerOf(v);
  const deadShareBefore = deadShareOf(v.lines);
  const prunedRel = s + '-pruned';
  const watch = [s, censusRel].concat(existsSync(path.join(R, prunedRel)) ? [prunedRel + '/manifest.json', prunedRel + '/index.mjs'] : []);
  const realBefore = treeHash(R, watch);
  log((control ? 'control ' : 'prune ') + s + ' by ' + censusRel + ': cells ' + cb.count + ' of ' + cb.n + ' live, edges ' + eb.count + ' of ' + eb.n + ' live (popcount = count for both)');

  // 2. the copy
  mkdirSync(work, { recursive: true });
  const copy = mkdtempSync(path.join(work, 'brain-prune-'));
  const out = {
    ok: false, decision: null, control, seed: s,
    census: { file: censusRel, at: v.at ?? null, ruler: beforeRuler, lines: v.lines ? { loaded: v.lines.loaded, loadBearing: v.lines.loadBearing } : null, cells: { n: cb.n, live: cb.count, dead: cb.dead }, edges: { n: eb.n, live: eb.count, dead: eb.dead } },
    linesBefore: bm.counts.lines, linesAfter: null, deadShareBefore, deadShareAfter: null, gate: null, ms: 0, patch: null, prunedDir: null,
    copy: null, prune: null, repoint: null, load: null, after: null, carried: null, tests: null, cleanup: null, real: null,
  };
  try {
    const cp = copyTree(R, copy, { seed: s, include });
    out.copy = { dir: copy, mb: Math.round((cp.bytes / MB) * 10) / 10, includedMb: Math.round((cp.includedBytes / MB) * 10) / 10, ms: cp.ms, include: cp.include, missing: cp.missing };
    log('copy ' + copy + ': ' + out.copy.mb + ' MB in ' + cp.ms + ' ms' + (cp.include.length ? ', ' + cp.include.length + ' included path(s) = ' + out.copy.includedMb + ' MB' : '') + (cp.missing.length ? ', MISSING ' + cp.missing.join(', ') : ''));

    if (!control) {
      // 3. the prune, by the copy's own emitter
      const p = pruneOnCopy(copy, s, prunedRel, censusRel, { heapMb, timeoutMs: gateTimeoutMs });
      out.prune = { ok: p.ok, exit: p.exit, ms: p.ms, hash: p.hash, lines: p.lines, cells: p.cells, edges: p.edges, printed: p.printed.slice(0, 16), error: p.error };
      for (const l of p.printed) log('  emit | ' + l);
      if (!p.ok) { out.decision = 'refused'; out.wall = 'prune'; out.reason = p.error; return out; }
      out.linesAfter = p.lines.after;
      out.prunedDir = prunedRel;
      // 4. the re-point: the seed's index.mjs and manifest.json, as a diff checked by the applier
      const oldIndex = readFileSync(path.join(copy, s, 'index.mjs'), 'utf8');
      const oldManifest = readFileSync(path.join(copy, s, 'manifest.json'), 'utf8');
      const t = repointTexts({ seed: s, pruned: prunedRel, manifest: p.manifest, before: bm, census: { file: censusRel, at: v.at ?? null } });
      const dIndex = unifiedDiff(oldIndex, t.index, s + '/index.mjs');
      const dManifest = unifiedDiff(oldManifest, t.manifest, s + '/manifest.json');
      for (const [d, o, n, what] of [[dIndex, oldIndex, t.index, 'index.mjs'], [dManifest, oldManifest, t.manifest, 'manifest.json']]) {
        const a = applyUnifiedPatch(o, d);
        if (!a.ok || a.text !== n) throw new Error('prune: the ' + what + ' diff does not apply back to its new text' + (a.ok ? '' : ': ' + a.reason));
      }
      writeFileSync(path.join(copy, s, 'index.mjs'), t.index);
      writeFileSync(path.join(copy, s, 'manifest.json'), t.manifest);
      out.patch = dIndex + dManifest;
      out.repoint = { files: [s + '/index.mjs', s + '/manifest.json'], patchBytes: Buffer.byteLength(out.patch), patchLines: out.patch.split('\n').length - 1, hashBefore: bm.hash, hashAfter: p.hash };
      log('re-point ' + s + ' -> ' + prunedRel + ': a ' + out.repoint.patchLines + ' line diff of index.mjs and manifest.json (applies back byte for byte)');
      // 5. the re-pointed seed, loaded and verified on the copy
      out.load = loadCheck(copy, s, { heapMb, timeoutMs: testTimeoutMs });
      out.load.pruned = !!out.load.ok && out.load.hash === p.hash && out.load.cells === p.cells.after && out.load.edges === p.edges.after;
      log('load ' + s + ' on the copy: ' + (out.load.ok ? 'verify ok, ' + out.load.cells + ' cells, ' + out.load.edges + ' edges, hash ' + String(out.load.hash).slice(0, 12) + (out.load.pruned ? ' (the pruned content)' : ' (NOT the pruned content)') + ', ' + out.load.ms + ' ms, rss ' + out.load.rssMb + ' MB' : 'FAILED ' + (out.load.error || JSON.stringify(out.load.errors))));
      // 6. the census of the pruned content, and the carried record
      const vdir = path.join(copy, 'bench', 'verdicts');
      const after = censusOfContent(vdir, p.hash, beforeRuler);
      out.after = after ? { file: after.file, seed: after.seed, at: after.at, ruler: after.ruler, sameRuler: after.sameRuler, isTheBar: after.isTheBar, lines: after.lines, deadShare: after.deadShare } : null;
      out.deadShareAfter = after ? after.deadShare : null;
      log(after ? 'census of the pruned content: ' + after.file + ' (' + after.seed + ', hash ' + p.hash.slice(0, 12) + '): ' + after.lines.loadBearing + ' of ' + after.lines.loaded + ' loaded lines load bearing, dead share ' + after.deadShare + (after.sameRuler ? ', the same ruler as the census before' : ', a DIFFERENT ruler from the census before') : 'no census on disk measured content hash ' + String(p.hash).slice(0, 12) + ': census ' + prunedRel + ' before this prune can be judged');
      if (after && carry) {
        const name = 'census-' + s.slice('organism/'.length) + '-repointed-partial.json';
        const rec = {
          bench: 'census', at: new Date().toISOString(), command: 'self/prune.mjs (carried on a trial copy)', node: process.version, isTheBar: false,
          seed: s, ...(after.ruler.mode === 'dynamic' ? {} : { mode: after.ruler.mode }), ticks: after.ruler.ticks,
          hash: { manifest: p.hash }, lines: after.lines, carriedFrom: after.file,
          statement: s + ' on this trial copy was re-pointed to ' + prunedRel + ', whose content hash ' + p.hash + ' is the hash ' + after.file + ' measured under the name ' + after.seed + '. This record carries that census\'s own line counts (' + after.lines.loadBearing + ' of ' + after.lines.loaded + ' loaded lines load bearing) to the re-pointed seed so the gate can match a census to it by path and hash. Nothing was re-measured; it exists only on the copy.',
        };
        writeFileSync(path.join(vdir, name), JSON.stringify(rec, null, 2) + '\n');
        out.carried = { file: name, from: after.file };
        log('carried ' + after.file + ' to ' + s + ' on the copy as bench/verdicts/' + name);
      }
    }

    // 7. the seed's own tests, then the gate
    if (runOwnTests) {
      const names = ownTests(copy, s);
      out.tests = [];
      for (const rel of names) {
        const r = runTest(copy, rel, testTimeoutMs);
        out.tests.push({ file: rel, exit: r.exit, pass: r.pass, fail: r.fail, total: r.total, ms: r.ms, failures: r.failures.slice(0, 3) });
        log('own test ' + rel + ': ' + (r.exit === 0 ? 'PASS' : 'FAIL') + ' ' + r.pass + '/' + r.total + ' in ' + r.ms + ' ms');
      }
    }
    if (runGateStep) {
      out.gate = gateOn(copy, gateCmd, gateTimeoutMs);
      log('gate on the copy: ' + (out.gate.summary || out.gate.verdict + ' (no summary line)'));
      if (out.gate.loadBearing) log('  ' + out.gate.loadBearing);
      if (out.gate.red.length) log('  red files: ' + out.gate.red.join(', '));
    }
    const testsOk = !out.tests || out.tests.every((t) => t.exit === 0);
    out.ok = control ? !!out.gate && out.gate.verdict === 'GREEN' && testsOk
      : !!out.prune && out.prune.ok && !!out.load && out.load.pruned && (!out.gate || out.gate.verdict === 'GREEN') && testsOk;
    out.decision = control ? 'control' : out.ok ? 'would apply' : 'refused';
    if (!control && !out.ok) {
      out.wall = !out.load || !out.load.pruned ? 'load' : !testsOk ? 'tests' : 'gate';
      out.reason = out.wall === 'gate' ? 'the gate on the copy is ' + (out.gate && out.gate.verdict) : out.wall === 'tests' ? 'a test that names ' + s + ' fails on the copy' : 'the re-pointed seed did not load as the pruned content';
    }
    return out;
  } finally {
    // 8. the copy goes, organism/ first, and both deletions are checked
    const org = path.join(copy, 'organism');
    let orgGone = false, copyGone = false, error = null;
    try { rmSync(org, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); orgGone = !existsSync(org); } catch (e) { error = String(e.message || e); }
    try { rmSync(copy, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); copyGone = !existsSync(copy); } catch (e) { error = error || String(e.message || e); }
    out.cleanup = { organismDeleted: orgGone, copyDeleted: copyGone, error, freeDiskMb: freeDiskMb(work) };
    log('cleanup: the copy\'s organism/ ' + (orgGone ? 'deleted' : 'NOT deleted') + ', the copy ' + (copyGone ? 'deleted' : 'NOT deleted') + ' (checked with existsSync); ' + out.cleanup.freeDiskMb + ' MB left on the disk of ' + work);
    const realAfter = treeHash(R, watch);
    out.real = { watched: watch, before: realBefore.hash, after: realAfter.hash, same: realBefore.hash === realAfter.hash, files: realAfter.files, bytes: realAfter.bytes };
    log('the real tree: ' + watch.join(', ') + ' hash ' + realBefore.hash.slice(0, 12) + ' before, ' + realAfter.hash.slice(0, 12) + ' after (' + (out.real.same ? 'unchanged' : 'CHANGED') + ')');
    out.ms = Date.now() - t0;
  }
}

// ---------------------------------------------------------------- CLI
if (process.argv[1] && path.resolve(process.argv[1]) === SELF_FILE) {
  const argv = process.argv.slice(2);
  const opt = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const has = (k) => argv.includes('--' + k);
  const json = has('json');
  const log = json ? () => {} : (l) => process.stdout.write(l + '\n');
  let census = opt('census', null), seed = opt('seed', null);
  if (!census && !seed) { const p = pickSeed(ROOT); if (p.pick) { seed = p.pick.seed; census = 'bench/verdicts/' + p.pick.census; } }
  const r = pruneSeed({
    census, seed, control: has('control'), include: (opt('include', '') || '').split(',').filter(Boolean),
    gateCmd: opt('gate-cmd', DEFAULT_GATE_CMD), carry: !has('no-carry'), runGateStep: !has('no-gate'), work: opt('work', tmpdir()), log,
  });
  const f = opt('out', null);
  if (f) writeFileSync(f, JSON.stringify(r, null, 2) + '\n');
  if (json) process.stdout.write(JSON.stringify(r) + '\n');
  else log('decision: ' + r.decision + (r.reason ? ' (' + r.reason + ')' : ''));
  process.exitCode = r.decision === 'refused' ? 1 : 0;
}
