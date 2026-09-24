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
//   2. copy the tree to <temp>/brain-prune-XXXXXX/brain (the root keeps the name brain: a gate
//      test reads module URLs relative to "/brain/"), leaving out state/, .git/, node_modules/,
//      bench/fixtures/, web/dist/, bench/verdicts/.census/ and every seed under organism/ but
//      this one, except the paths named in `include` (gateIncludes: the fixture and web/dist
//      paths the authored code names, each at most INCLUDE_MAX_MB, and the SOURCES.md lines that
//      license them), plus the out-of-tree files the code names by '..' segments (the frozen
//      trader tape tasks/venue.mjs replays), COPIED beside the copy, never linked;
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
//   8. delete the copy, organism/ first, verify both deletions, read the disk space left, and
//      hash what this call could have touched in the real tree before and after.
//
// A control run (control: true) does steps 1, 2, 7 and 8 on the same kind of copy with no prune
// and no re-point, so the gate line with the intervention off is on record beside the one with
// it on. The returned prunedDir is a path, not a diff: a seed is up to 277 MB. When the real
// tree already holds that directory at the pruned hash (Board 12 emitted organism/gen-0-pruned),
// prunedOnReal says so, and the patch alone is then the whole change to the real tree.
//
//   node self/prune.mjs [--census bench/verdicts/census.json] [--seed organism/gen-0]
//        [--control] [--include auto|a,b,...] [--outside a,b,...] [--gate-cmd "node bench/gate.mjs --quiet"]
//        [--no-carry] [--no-gate] [--no-tests] [--work <dir>] [--out result.json] [--json]
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
/** A seed directory over this many bytes is watched by (path, size, mtime) rows, not by its bytes. */
export const WATCH_BYTES_CAP = 256 * 1024 * 1024;
/** gateIncludes leaves out any one path over this many MB, and says so. The knowledge store the
 *  daemon's ingest step opens (bench/fixtures/wiki/store) is 371 MB; the wiki dump beside it and
 *  the whole of bench/fixtures are over it. */
export const INCLUDE_MAX_MB = 512;
/** The directories a trial copy leaves out whose named paths gateIncludes carries back. */
export const INCLUDE_ROOTS = Object.freeze(['bench/fixtures', 'web/dist']);
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
 * census over many. Each record says whether it carries liveness bitsets. A census of a seed
 * outside organism/ (a scratch copy) keeps seed null and its path in seedPath, so a lookup by
 * content hash still finds it.
 */
export function censusRecords(verdictsDir) {
  let names; try { names = readdirSync(verdictsDir); } catch { return []; }
  const out = [];
  for (const f of names.filter((n) => /^census.*\.json$/.test(n)).sort()) {
    const r = readJson(path.join(verdictsDir, f));
    if (!r.ok || !r.j || typeof r.j !== 'object') continue;
    const v = r.j;
    const push = (row, isRow) => {
      if (typeof row.seed !== 'string') return;
      const live = row.live || null;
      const hash = (live && live.manifestHash) || (row.hash && row.hash.manifest) || row.manifestHash || null;
      out.push({
        file: f, row: isRow, seed: seedRel(row.seed), seedPath: posix(row.seed), at: typeof v.at === 'string' ? v.at : null, isTheBar: v.isTheBar === true,
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
  const recs = censusRecords(path.join(root, 'bench', 'verdicts')).filter((r) => r.seed && r.seed === s);
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

/**
 * Where the gate's tests read what a trial copy leaves out. A test reads a fixture itself or
 * through the module it calls (bench/public.mjs reads bench/fixtures/public, act/prompt.mjs the
 * knowledge store), so every authored source file is read: every .mjs, .js and .cjs outside the
 * skipped directories and organism/. A path under bench/fixtures or web/dist is named as a literal
 * ('bench/fixtures/code-tasks.json'), as root segments (path.join(ROOT, 'bench', 'fixtures',
 * 'senses')) or as segments from the file's own directory (path.join(HERE, 'fixtures', 'public')
 * in bench/). Each named path that exists is kept, with every SOURCES.md at or above it (the
 * gate's HIS DATA row needs the licence line that covers a data file); a path under another kept
 * directory is folded into it; a path over maxMb is left out and listed in tooBig. A path named by
 * segments that climb out of root ('..', '..', 'trader', 'data', 'trader.db' from tasks/) is listed
 * in outside, relative to root's parent, when it exists and is at most maxMb.
 * @returns {{ include: string[], mb: number, namedBy: Record<string, string[]>, tooBig: string[], outside: string[], outsideMb: number, scanned: number }}
 */
export function gateIncludes(root = ROOT, { maxMb = INCLUDE_MAX_MB } = {}) {
  const sources = authoredSources(root);
  const named = new Map(), out = new Map();
  const under = (p) => INCLUDE_ROOTS.some((r) => p === r || p.startsWith(r + '/'));
  const note = (p, file) => { const k = path.posix.normalize(posix(p)).replace(/\/+$/, ''); if (!under(k)) return; if (!named.has(k)) named.set(k, new Set()); named.get(k).add(file); };
  const segs = (list) => [...list.matchAll(/['"]([A-Za-z0-9_.-]+)['"]/g)].map((x) => x[1]);
  for (const rel of sources) {
    let src; try { src = readFileSync(path.join(root, rel), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/(?:bench\/fixtures|web\/dist)(?:\/[A-Za-z0-9_.\-/]*[A-Za-z0-9_-])?/g)) note(m[0], rel);
    for (const m of src.matchAll(/['"](bench|web)['"]\s*,\s*['"](fixtures|dist)['"]((?:\s*,\s*['"][A-Za-z0-9_.-]+['"])*)/g)) {
      if ((m[1] === 'bench') !== (m[2] === 'fixtures')) continue;
      note([m[1], m[2], ...segs(m[3])].join('/'), rel);
    }
    const dir = path.posix.dirname(rel);
    for (const m of src.matchAll(/['"]\.\.['"]((?:\s*,\s*['"][A-Za-z0-9_.-]+['"])+)/g)) {
      const p = path.posix.normalize(path.posix.join(dir, '..', ...segs(m[1])));
      if (p.startsWith('../') && !p.startsWith('../../') && p.split('/').length > 2) { if (!out.has(p)) out.set(p, new Set()); out.get(p).add(rel); }
    }
    for (const m of src.matchAll(/(['"](?:bench|web)['"]\s*,\s*)?['"](fixtures|dist)['"]((?:\s*,\s*['"][A-Za-z0-9_.-]+['"])*)/g)) {
      if (m[1]) continue; // the root form, read above
      note(path.posix.join(dir, m[2], ...segs(m[3])), rel);
    }
  }
  const exists = [...named.keys()].filter((p) => existsSync(path.join(root, p))).sort();
  const tooBig = [];
  const sized = exists.filter((p) => { const mb = dirBytes(path.join(root, p)) / MB; if (mb > maxMb) { tooBig.push(p); return false; } return true; });
  const withSources = new Set(sized);
  for (const p of sized) {
    if (!(p === 'bench/fixtures' || p.startsWith('bench/fixtures/'))) continue;
    let d = path.posix.dirname(p);
    for (;;) {
      if (!(d === 'bench/fixtures' || d.startsWith('bench/fixtures/'))) break;
      if (existsSync(path.join(root, d, 'SOURCES.md'))) withSources.add(d + '/SOURCES.md');
      if (d === 'bench/fixtures') break;
      d = path.posix.dirname(d);
    }
  }
  const all = [...withSources].sort();
  const include = all.filter((p) => !all.some((q) => q !== p && p.startsWith(q + '/')));
  const namedBy = Object.fromEntries(exists.map((p) => [p, [...named.get(p)].sort()]));
  const mb = Math.round((include.reduce((a, p) => a + dirBytes(path.join(root, p)), 0) / MB) * 1000) / 1000;
  const outside = [];
  for (const p of [...out.keys()].sort()) {
    const abs = path.resolve(root, p);
    if (!existsSync(abs)) continue;
    const q = p.slice(3);
    namedBy[p] = [...out.get(p)].sort();
    if (dirBytes(abs) / MB > maxMb) tooBig.push(p); else outside.push(q);
  }
  const outsideMb = Math.round((outside.reduce((a, q) => a + dirBytes(path.resolve(root, '..', q)), 0) / MB) * 1000) / 1000;
  return { include, mb, namedBy, tooBig, outside, outsideMb, scanned: sources.length };
}

/** Every authored source file of a tree (.mjs, .js, .cjs), relative and sorted, outside what a copy skips and organism/. */
export function authoredSources(root) {
  const out = [];
  const walk = (abs) => {
    const rel = relOf(root, abs);
    if (rel) {
      const top = rel.split('/')[0];
      if (COPY_SKIP_TOP.includes(top) || top === 'organism' || top.startsWith('.')) return;
      if (COPY_SKIP_PATHS.some((p) => rel === p || rel.startsWith(p + '/'))) return;
    }
    let ents; try { ents = readdirSync(abs, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      const p = path.join(abs, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(mjs|js|cjs)$/.test(e.name)) out.push(relOf(root, p));
    }
  };
  walk(root);
  return out.sort();
}

function dirBytes(abs) {
  let n = 0;
  const walk = (p) => { let st; try { st = statSync(p); } catch { return; } if (st.isDirectory()) { for (const x of readdirSync(p)) walk(path.join(p, x)); } else n += st.size; };
  walk(abs);
  return n;
}

/**
 * sha256 over sorted relative paths and bytes of every file under the given paths of root. A
 * directory over WATCH_BYTES_CAP is hashed by (path, size, mtime) rows instead of its bytes, and
 * the result says which were. A missing path hashes as missing, so appearing is a change.
 */
export function treeHash(root, rels = ['.'], { skip = [], capBytes = WATCH_BYTES_CAP } = {}) {
  const h = createHash('sha256');
  let files = 0, bytes = 0;
  const byStat = [];
  const walk = (abs, statOnly) => {
    const rel = relOf(root, abs);
    if (skip.some((s) => rel === s || rel.startsWith(s + '/'))) return;
    let st; try { st = statSync(abs); } catch { h.update('missing ' + rel + '\n'); return; }
    if (st.isDirectory()) { for (const n of readdirSync(abs).sort()) walk(path.join(abs, n), statOnly); return; }
    files++; bytes += st.size;
    if (statOnly) { h.update(rel + '\n' + st.size + '\n' + st.mtimeMs + '\n'); return; }
    const b = readFileSync(abs);
    h.update(rel + '\n' + b.length + '\n'); h.update(b);
  };
  for (const r of rels) {
    const abs = path.resolve(root, r);
    let big = false;
    try { big = statSync(abs).isDirectory() && dirBytes(abs) > capBytes; } catch { big = false; }
    if (big) byStat.push(relOf(root, abs));
    walk(abs, big);
  }
  return { hash: h.digest('hex'), files, bytes, byStat };
}

/** The names under root/organism, one per line, hashed: a seed directory created or removed changes it. */
export function organismListing(root) {
  let names; try { names = readdirSync(path.join(root, 'organism')).sort(); } catch { names = []; }
  return { names: names.length, hash: createHash('sha256').update(names.join('\n')).digest('hex') };
}

/** MB free on the volume holding p, read with statfs. */
export const freeDiskMb = (p) => { try { const s = statfsSync(p); return Math.round((s.bavail * s.bsize) / MB); } catch { return null; } };

/**
 * Copy root to dest for a trial: every file but the skipped directories and every seed under
 * organism/ except `seed`, plus each path of `include` (relative to root) however it is skipped.
 * Each path of `outside` (relative to root's parent) is COPIED to the same place relative to
 * dest's parent, which must then be a directory the trial owns; a .db file brings a -wal file
 * beside it when that one holds bytes. Nothing is linked, so nothing on the copy writes back.
 */
export function copyTree(root, dest, { seed, include = [], outside = [] } = {}) {
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
  const box = path.dirname(path.resolve(dest)), realParent = path.dirname(path.resolve(root));
  let outsideBytes = 0;
  const outCopied = [];
  for (const q of outside.map((p) => posix(p).replace(/\/+$/, ''))) {
    const src = path.resolve(realParent, q), dst = path.resolve(box, q);
    const rel = path.relative(box, dst);
    if (!rel || rel.startsWith('..') || path.isAbsolute(rel) || path.resolve(box) === realParent) throw new Error('copyTree: the outside path ' + q + ' does not land inside the trial directory ' + box);
    if (!existsSync(src)) { missing.push('../' + q); continue; }
    mkdirSync(path.dirname(dst), { recursive: true });
    cpSync(src, dst, { recursive: true, preserveTimestamps: true });
    if (/\.db$/.test(q) && existsSync(src + '-wal') && statSync(src + '-wal').size > 0) cpSync(src + '-wal', dst + '-wal', { preserveTimestamps: true });
    outsideBytes += dirBytes(dst);
    outCopied.push(q);
  }
  return { ms: Date.now() - t0, bytes: dirBytes(dest), include: inc, includedBytes, outside: outCopied, outsideBytes, missing };
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

/**
 * Run-to-run spread of the dead share at one content hash and one ruler: every census on disk
 * that measured that content with that ruler (carried records excluded), each with its share.
 * @returns {{ n, min, max, spread, files: Array<{file, seed, deadShare, lines}> }}
 */
export function repeatsAt(verdictsDir, hash, ruler) {
  const recs = censusRecords(verdictsDir).filter((r) => r.hash === hash && r.deadShare !== null && !r.carriedFrom && sameRuler(r.ruler, ruler));
  const shares = recs.map((r) => r.deadShare);
  const min = shares.length ? Math.min(...shares) : null, max = shares.length ? Math.max(...shares) : null;
  return { n: recs.length, min, max, spread: shares.length ? round6(max - min) : null, files: recs.map((r) => ({ file: r.file, seed: r.seed || r.seedPath, deadShare: r.deadShare, lines: r.lines })) };
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
 * @param {string[]} [o.include] paths copied although a skip rule covers them (gateIncludes)
 * @param {string[]} [o.outside] paths beside root (relative to its parent) copied beside the copy
 * @param {string} [o.gateCmd] @param {number} [o.gateTimeoutMs]
 * @param {boolean} [o.carry] write the carried census record on the copy (default true)
 * @param {string} [o.work] where the copy is made (default the OS temp directory)
 * @param {(s: string) => void} [o.log]
 * @returns {object} { ok, decision, seed, linesBefore, linesAfter, deadShareBefore, deadShareAfter,
 *   gate, ms, patch, prunedDir, prunedOnReal, ... }
 */
export function pruneSeed({
  root = ROOT, census = null, seed = null, control = false, include = [], outside = [], gateCmd = DEFAULT_GATE_CMD,
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
  // what this call could touch in the real tree: the seed, its pruned sibling, the census, and the
  // listing of organism/ (a directory appearing there is a write)
  const watch = [s, censusRel, prunedRel];
  const realBefore = { tree: treeHash(R, watch), organism: organismListing(R) };
  log((control ? 'control ' : 'prune ') + s + ' by ' + censusRel + ': cells ' + cb.count + ' of ' + cb.n + ' live, edges ' + eb.count + ' of ' + eb.n + ' live (popcount = count for both)');

  // 2. the copy
  mkdirSync(work, { recursive: true });
  const box = mkdtempSync(path.join(work, 'brain-prune-'));
  const copy = path.join(box, 'brain');
  const out = {
    ok: false, decision: null, control, seed: s,
    census: { file: censusRel, at: v.at ?? null, ruler: beforeRuler, lines: v.lines ? { loaded: v.lines.loaded, loadBearing: v.lines.loadBearing } : null, cells: { n: cb.n, live: cb.count, dead: cb.dead }, edges: { n: eb.n, live: eb.count, dead: eb.dead } },
    linesBefore: bm.counts.lines, linesAfter: null, deadShareBefore, deadShareAfter: null, gate: null, ms: 0, patch: null, prunedDir: null, prunedOnReal: null,
    copy: null, prune: null, repoint: null, load: null, after: null, carried: null, tests: null, cleanup: null, real: null,
  };
  try {
    const cp = copyTree(R, copy, { seed: s, include, outside });
    out.copy = { dir: copy, mb: Math.round((cp.bytes / MB) * 10) / 10, includedMb: Math.round((cp.includedBytes / MB) * 10) / 10, outside: cp.outside, outsideMb: Math.round((cp.outsideBytes / MB) * 10) / 10, ms: cp.ms, include: cp.include, missing: cp.missing };
    log('copy ' + copy + ': ' + out.copy.mb + ' MB in ' + cp.ms + ' ms' + (cp.include.length ? ', ' + cp.include.length + ' included path(s) = ' + out.copy.includedMb + ' MB' : '') + (cp.outside.length ? ', beside it ' + cp.outside.join(', ') + ' = ' + out.copy.outsideMb + ' MB' : '') + (cp.missing.length ? ', MISSING ' + cp.missing.join(', ') : ''));

    if (!control) {
      // 3. the prune, by the copy's own emitter
      let p;
      try { p = pruneOnCopy(copy, s, prunedRel, censusRel, { heapMb, timeoutMs: gateTimeoutMs }); }
      catch (e) { out.decision = 'refused'; out.wall = 'prune'; out.reason = String((e && e.message) || e).split('\n')[0]; return out; }
      out.prune = { ok: p.ok, exit: p.exit, ms: p.ms, hash: p.hash, lines: p.lines, cells: p.cells, edges: p.edges, printed: p.printed.slice(0, 16), error: p.error };
      for (const l of p.printed) log('  emit | ' + l);
      if (!p.ok) { out.decision = 'refused'; out.wall = 'prune'; out.reason = p.error; return out; }
      out.linesAfter = p.lines.after;
      out.prunedDir = prunedRel;
      const realPruned = path.join(R, prunedRel, 'manifest.json');
      const rp = existsSync(realPruned) ? readJson(realPruned) : null;
      out.prunedOnReal = { dir: prunedRel, exists: !!rp, hash: rp && rp.ok ? rp.j.hash : null, sameHash: !!(rp && rp.ok && rp.j.hash === p.hash) };
      log('pruned ' + prunedRel + ' on the copy: hash ' + String(p.hash).slice(0, 12) + '; the real tree ' + (out.prunedOnReal.exists ? 'holds ' + prunedRel + ' at hash ' + String(out.prunedOnReal.hash).slice(0, 12) + (out.prunedOnReal.sameHash ? ' (the same content: the patch alone is the whole change there)' : ' (a DIFFERENT content)') : 'holds no ' + prunedRel));
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
      out.after = after ? { file: after.file, seed: after.seed || after.seedPath, at: after.at, ruler: after.ruler, sameRuler: after.sameRuler, isTheBar: after.isTheBar, lines: after.lines, deadShare: after.deadShare } : null;
      out.deadShareAfter = after ? after.deadShare : null;
      log(after ? 'census of the pruned content: ' + after.file + ' (' + out.after.seed + ', hash ' + p.hash.slice(0, 12) + '): ' + after.lines.loadBearing + ' of ' + after.lines.loaded + ' loaded lines load bearing, dead share ' + after.deadShare + (after.sameRuler ? ', the same ruler as the census before' : ', a DIFFERENT ruler from the census before') : 'no census on disk measured content hash ' + String(p.hash).slice(0, 12) + ': census ' + prunedRel + ' before this prune can be judged');
      if (after && carry) {
        const name = 'census-' + s.slice('organism/'.length) + '-repointed-partial.json';
        const rec = {
          bench: 'census', at: new Date().toISOString(), command: 'self/prune.mjs (carried on a trial copy)', node: process.version, isTheBar: false,
          seed: s, ...(after.ruler.mode === 'dynamic' ? {} : { mode: after.ruler.mode }), ticks: after.ruler.ticks,
          hash: { manifest: p.hash }, lines: after.lines, carriedFrom: after.file,
          statement: s + ' on this trial copy was re-pointed to ' + prunedRel + ', whose content hash ' + p.hash + ' is the hash ' + after.file + ' measured under the name ' + out.after.seed + '. This record carries that census\'s own line counts (' + after.lines.loadBearing + ' of ' + after.lines.loaded + ' loaded lines load bearing) to the re-pointed seed so the gate can match a census to it by path and hash. Nothing was re-measured; it exists only on the copy.',
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
      if (!names.length) log('own tests: no test file names ' + s);
    }
    if (runGateStep) {
      out.gate = gateOn(copy, gateCmd, gateTimeoutMs);
      log('gate on the copy: ' + (out.gate.summary || out.gate.verdict + ' (no summary line)'));
      if (out.gate.loadBearing) log('  ' + out.gate.loadBearing);
      if (out.gate.red.length) log('  red files: ' + out.gate.red.join(', '));
      if (out.gate.tail) log('  tail: ' + out.gate.tail.replaceAll('\n', ' | '));
    }
    const testsOk = !out.tests || out.tests.every((t) => t.exit === 0);
    out.ok = control ? (!out.gate || out.gate.verdict === 'GREEN') && testsOk
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
    try { rmSync(box, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); copyGone = !existsSync(box); } catch (e) { error = error || String(e.message || e); }
    out.cleanup = { organismDeleted: orgGone, copyDeleted: copyGone, error, freeDiskMb: freeDiskMb(work) };
    log('cleanup: the copy\'s organism/ ' + (orgGone ? 'deleted' : 'NOT deleted') + ', the copy ' + (copyGone ? 'deleted' : 'NOT deleted') + ' (checked with existsSync); ' + out.cleanup.freeDiskMb + ' MB left on the disk of ' + work);
    const realAfter = { tree: treeHash(R, watch), organism: organismListing(R) };
    const same = realBefore.tree.hash === realAfter.tree.hash && realBefore.organism.hash === realAfter.organism.hash;
    out.real = { watched: watch.concat(['organism/ (listing)']), before: realBefore.tree.hash, after: realAfter.tree.hash, organismBefore: realBefore.organism.hash, organismAfter: realAfter.organism.hash, same, files: realAfter.tree.files, bytes: realAfter.tree.bytes, byStat: realAfter.tree.byStat };
    log('the real tree: ' + out.real.watched.join(', ') + ' hash ' + realBefore.tree.hash.slice(0, 12) + ' before, ' + realAfter.tree.hash.slice(0, 12) + ' after; organism/ listing ' + realBefore.organism.hash.slice(0, 12) + ' before, ' + realAfter.organism.hash.slice(0, 12) + ' after (' + (same ? 'unchanged' : 'CHANGED') + ')');
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
  const incOpt = opt('include', 'auto');
  let include, outside = (opt('outside', '') || '').split(',').filter(Boolean);
  if (incOpt === 'auto') { const g = gateIncludes(ROOT); include = g.include; if (!argv.includes('--outside')) outside = g.outside; log('outside the tree (copied beside the copy, ' + g.outsideMb + ' MB): ' + (g.outside.join(', ') || 'none')); log('include (the fixture and web/dist paths ' + g.scanned + ' authored files name, ' + g.mb + ' MB): ' + (include.join(', ') || 'none') + (g.tooBig.length ? '; left out as over ' + INCLUDE_MAX_MB + ' MB: ' + g.tooBig.join(', ') : '')); }
  else include = incOpt.split(',').filter(Boolean);
  const r = pruneSeed({
    census, seed, control: has('control'), include, outside,
    gateCmd: opt('gate-cmd', DEFAULT_GATE_CMD), carry: !has('no-carry'), runGateStep: !has('no-gate'), runOwnTests: !has('no-tests'), work: opt('work', tmpdir()), log,
  });
  const f = opt('out', null);
  if (f) writeFileSync(f, JSON.stringify(r, null, 2) + '\n');
  if (json) process.stdout.write(JSON.stringify(r) + '\n');
  else log('decision: ' + r.decision + (r.reason ? ' (' + r.reason + ')' : ''));
  process.exitCode = r.decision === 'refused' ? 1 : 0;
}
