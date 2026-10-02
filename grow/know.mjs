#!/usr/bin/env node
// grow/know.mjs: THE SHELF (contract c5, knowledge-backed cells). Every table the absorber pulled (grow/absorb.mjs, the
// sources of neo/sources.json) becomes a KNOWLEDGE PACK the know family of grow/neo-kernel.mjs reads, so a cell can
// look a fact up instead of remembering one answer per prompt.
// His words (2026-10-01, verbatim at the head of grow/NEO.md): "always burning, processing and scraping billioons of
// packets a second and abasorbing data so it constantly iterates in the cloud"; "All native btw, its ai data center in
// ur pocket, none of that ollama crap".
//
//   neo/know/<id>.json   { id, from, sha, columns: [..], rows: [[..], ..], at }   a cell is a string or a number
//   neo/know/INDEX.json  { packs: [{ id, columns, rows: <count>, sha }] }
// An id matches ^[a-z0-9-]+$; a pack is at most 2 MB (rows past the bar are cut, in source order, and the pack says how
// many), all packs at most 30 MB. shelve RE-PULLS a source through absorb's own fetchBytes (the host allowlist on every
// hop) and parses it with absorb's own recordsOf, keyOf and numOf, and keeps the bytes only when their sha256 is the one
// the absorber's latest pull of that source recorded in neo/ABSORB.json (the tasks were made from those very bytes). A
// pack whose sha is that one already is not fetched again. Bytes are DATA: parsed as text, never evaluated, never
// followed; a row with a cell that names a FORBIDDEN pattern of grow/contract.mjs is dropped.
//   lookup(pack, keyColumn, key, valueColumn)   the value, or null when the key is absent or has two values; keys match
//                                               after knowNorm of the kernel (case, accents, punctuation, a leading "the")
//
//   node grow/know.mjs shelve [--max-ms <ms>] [--era <n>] [--root <dir>]
//   node grow/know.mjs status [--root <dir>]
// It reads neo/sources.json, neo/ABSORB.json and neo/know/, writes only neo/know/, and never opens state/, judge/heldout/,
// judge/control.jsonl or any neo/tasks/*/heldout.jsonl. Success prints ONE JSON line and exits 0; a failure one stderr
// line and a non-zero exit (2: usage).
// Author: THE ENGINE builder, part 2 (knowledge and the cursor), 2026-10-01.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN } from './contract.mjs';
import { DEFAULT_ROOT, redact } from './generation.mjs';
import { ADAPTERS, DEFAULTS as ABSORB_DEFAULTS, fetchBytes, decode, recordsOf, keyOf, clean, numOf, mapped, getPath, listAnd, readRegistry, readAbsorb, sha256 } from './absorb.mjs';
import { knowLoad, knowGet, knowNorm } from './neo-kernel.mjs';

export const KNOW_DIR = 'neo/know';
export const INDEX = 'neo/know/INDEX.json';
export const PACK_RE = /^[a-z0-9-]+$/;
/** contract c5: at most 2 MB a pack, 30 MB in all. */
export const PACK_MAX_BYTES = 2 * 1024 * 1024;
export const PACKS_MAX_BYTES = 30 * 1024 * 1024;
export const DEFAULTS = Object.freeze({ maxMs: 30000, fetchTimeoutMs: 20000 });
export const USAGE = [
  'usage: node grow/know.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  shelve [--max-ms ' + DEFAULTS.maxMs + '] [--era <n>]   every source the absorber pulled into ' + KNOW_DIR + '/<id>.json and ' + INDEX,
  '  status                                  { packs, rows, bytes }',
].join('\n');

export class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }
const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o);
const first = (e) => String((e && e.message) || e).split(/\r?\n/)[0];
const tripped = (s) => FORBIDDEN.some(([re]) => re.test(s));
const isCell = (v) => typeof v === 'string' || (typeof v === 'number' && Number.isFinite(v));
const bytesOf = (o) => Buffer.byteLength(JSON.stringify(o) + '\n');
function writeAtomic(f, text) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.' + Date.now().toString(36) + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, f);
}

// ---- the table of a source: its columns and rows, from the registry row's own make
/** A relation's labels as absorb names them (keyLabel and valueLabel, else the paths). */
const labelOf = (label, p) => (typeof label === 'string' && label.trim() ? label.trim() : String(p));
/** A numeric key's column name: the last segment of its path, or its template's fields (lower case). */
const keyName = (spec) => { const s = String(spec); return (s.includes('{') ? s.replace(/[{}]/g, '') : s.split('.').at(-1)).trim().toLowerCase() || 'key'; };

/**
 * The columns and rows of one source's records, by its kind: a relation gives a column per path (its label, the first
 * label a path gets), a numeric one the key and the noun (the value a number), a membership list "item" and "member"
 * ("yes" for a member, "no" for a decoy). A cell is text or a number; a missing one is "".
 * @param {object} src a registry row
 * @param {object[]} recs its records (absorb recordsOf)
 * @returns {{ columns: string[], rows: (string|number)[][] }}
 */
export function tableOf(src, recs) {
  const m = isObj(src.make) ? src.make : {};
  const cols = [], by = new Map();
  const col = (key, label, get) => {
    if (by.has(key)) return;
    let name = label, k = 2;
    while (cols.some((c) => c.name === name)) name = label + ' ' + k++;
    const c = { name, get };
    by.set(key, c);
    cols.push(c);
  };
  if (src.kind === 'csv-relation' || src.kind === 'json-relation') {
    for (const rel of Array.isArray(m.relations) ? m.relations.filter(isObj) : []) {
      col('k:' + rel.key, labelOf(rel.keyLabel, rel.key), (r) => keyOf(r, rel.key));
      col('v:' + rel.value + '\u0000' + JSON.stringify(rel.valueMap || null) + '\u0000' + (rel.many || ''), labelOf(rel.valueLabel, rel.value), (r) => {
        const raw = mapped(getPath(r, rel.value), rel);
        if (Array.isArray(raw)) {
          const xs = [...new Map(raw.map(clean).filter((x) => x !== null).map((x) => [knowNorm(x), x])).values()];
          if (rel.many === 'all') return xs.length && xs.length <= (Number.isInteger(rel.maxMany) ? rel.maxMany : 4) ? listAnd(xs) : null;
          return xs.length === 1 ? xs[0] : null;
        }
        return clean(raw);
      });
    }
  } else if (src.kind === 'csv-numeric' || src.kind === 'json-numeric') {
    for (const spec of Array.isArray(m.numerics) ? m.numerics.filter(isObj) : []) {
      const key = spec.key || m.key;
      col('k:' + key, keyName(key), (r) => keyOf(r, key));
      col('n:' + spec.value + '\u0000' + JSON.stringify(spec.valueMap || null), labelOf(spec.noun, spec.value), (r) => { const n = numOf(mapped(getPath(r, spec.value), spec)); return n ? n.n : null; });
    }
  } else if (src.kind === 'list-membership') {
    const items = recs.map((r) => clean(getPath(r, m.item || '$'))).filter((x) => x !== null);
    const decoys = (Array.isArray(m.decoys) ? m.decoys : typeof m.decoysPath === 'string' ? recs.map((r) => getPath(r, m.decoysPath)) : []).map(clean).filter((x) => x !== null);
    const seen = new Set(), rows = [];
    for (const x of items) { const k = knowNorm(x); if (k && !seen.has(k)) { seen.add(k); rows.push([x, 'yes']); } }
    for (const x of decoys) { const k = knowNorm(x); if (k && !seen.has(k)) { seen.add(k); rows.push([x, 'no']); } }
    return { columns: ['item', 'member'], rows };
  }
  const rows = [];
  for (const r of recs) {
    const row = cols.map((c) => { let v = null; try { v = c.get(r); } catch { v = null; } return isCell(v) ? v : ''; });
    if (row.some((v) => v !== '')) rows.push(row);
  }
  return { columns: cols.map((c) => c.name), rows };
}

/**
 * A pack of a source's bytes: { id, from, sha, columns, rows, at } (plus cut and dropped when rows were left out), its
 * rows FORBIDDEN-free and cut to fit maxBytes; null when the bytes give no table.
 */
export function packOf(src, bytes, { at, sha = sha256(bytes), maxBytes = PACK_MAX_BYTES } = {}) {
  const dflt = String(src.kind).startsWith('csv-') ? 'csv' : 'json';
  const recs = recordsOf(decode(bytes), isObj(src.make) ? src.make : {}, dflt);
  const t = tableOf(src, recs);
  if (!t.columns.length) return null;
  const kept = t.rows.filter((r) => !r.some((v) => typeof v === 'string' && tripped(v)));
  const dropped = t.rows.length - kept.length;
  const pk = { id: src.id, from: String(src.url), sha, columns: t.columns, rows: kept, at, ...(dropped ? { dropped } : {}) };
  if (bytesOf(pk) > maxBytes) {
    // the rows past the bar go (source order kept): the per-row sizes tell where to cut
    let budget = maxBytes - bytesOf({ ...pk, rows: [], cut: kept.length }), n = 0;
    for (const r of kept) { const b = Buffer.byteLength(JSON.stringify(r)) + 1; if (b > budget) break; budget -= b; n++; }
    pk.rows = kept.slice(0, n);
    pk.cut = kept.length - n;
  }
  return pk;
}

// ---- reading
/** neo/know/INDEX.json as { packs: [..] } (only well formed entries), or { packs: [] } when missing or unreadable. */
export function readIndex(root) {
  let doc = null;
  try { doc = JSON.parse(fs.readFileSync(path.join(root, ...INDEX.split('/')), 'utf8')); } catch { doc = null; }
  const ok = (p) => isObj(p) && typeof p.id === 'string' && PACK_RE.test(p.id) && Array.isArray(p.columns) && p.columns.every((c) => typeof c === 'string') && Number.isInteger(p.rows) && p.rows >= 0;
  return { packs: isObj(doc) && Array.isArray(doc.packs) ? doc.packs.filter(ok) : [] };
}
/** The index entries of every pack: [{ id, columns, rows, sha }]. */
export function packs(root = DEFAULT_ROOT) { return readIndex(root).packs; }
/**
 * One pack, read and checked: { id, from, sha, columns, rows, at }, or null (an id that is not a pack id, a file that is
 * missing, over PACK_MAX_BYTES, not JSON or not that shape).
 */
export function pack(root, id) {
  if (typeof id !== 'string' || !PACK_RE.test(id)) return null;
  const f = path.join(root, ...KNOW_DIR.split('/'), id + '.json');
  try {
    const st = fs.statSync(f);
    if (!st.isFile() || st.size > PACK_MAX_BYTES) return null;
    const p = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!isObj(p) || p.id !== id || !Array.isArray(p.columns) || !p.columns.every((c) => typeof c === 'string') || !Array.isArray(p.rows)) return null;
    if (!p.rows.every((r) => Array.isArray(r) && r.length === p.columns.length && r.every(isCell))) return null;
    return p;
  } catch { return null; }
}
/**
 * Every pack the index names, each read and checked, at most PACKS_MAX_BYTES in all (index order): the packs and the
 * lines of the ones left out.
 * @returns {{ packs: object[], blocked: string[] }}
 */
export function loadPacks(root = DEFAULT_ROOT, { maxBytes = PACKS_MAX_BYTES } = {}) {
  const out = [], blocked = [];
  let total = 0;
  for (const e of packs(root)) {
    const f = path.join(root, ...KNOW_DIR.split('/'), e.id + '.json');
    let size = 0;
    try { size = fs.statSync(f).size; } catch { blocked.push(e.id + ': not on disk'); continue; }
    if (total + size > maxBytes) { blocked.push(e.id + ': over the ' + maxBytes + ' bytes all packs may be'); continue; }
    const p = pack(root, e.id);
    if (!p) { blocked.push(e.id + ': not a pack (over ' + PACK_MAX_BYTES + ' bytes, not JSON, or not { id, columns, rows })'); continue; }
    total += size;
    out.push(p);
  }
  return { packs: out, blocked };
}

/**
 * The value of valueColumn in the row whose keyColumn is key, or null: the key absent, two rows with that key and two
 * values, a column the pack lacks. The match is the kernel's (knowNorm: case, accents, punctuation, a leading "the").
 * @param {{ id: string, columns: string[], rows: any[][] }} pk a pack
 * @returns {string|null}
 */
export function lookup(pk, keyColumn, key, valueColumn) {
  if (!isObj(pk) || typeof key !== 'string') return null;
  const id = 'q-' + (typeof pk.id === 'string' && PACK_RE.test(pk.id) ? pk.id : 'pack');
  // the kernel's own lookup, on a registry of this one pack (then the registry is emptied again)
  knowLoad([{ id, columns: pk.columns, rows: pk.rows }]);
  try { return knowGet(id, keyColumn, key, valueColumn); } finally { knowLoad([]); }
}

// ---- shelve
/**
 * shelve: for every source of neo/sources.json the absorber pulled (its latest pull in neo/ABSORB.json, not blocked),
 * the pack is written unless it already holds that pull's sha256; the bytes are fetched again through absorb's
 * fetchBytes and kept only when their sha256 is that pull's. Packs past PACKS_MAX_BYTES in all are not written. A spent
 * --max-ms leaves the rest to the next shelve. Writes neo/know/<id>.json and neo/know/INDEX.json atomically.
 * @param {string} root the tree
 * @param {{ fetch?: Function, maxMs?: number, fetchTimeoutMs?: number, era?: number|null, now?: () => string, clock?: () => number, maxPackBytes?: number, maxTotalBytes?: number }} o
 * @returns {Promise<object>} the JSON line
 */
export async function shelve(root = DEFAULT_ROOT, { fetch: fetchFn = globalThis.fetch, maxMs = DEFAULTS.maxMs, fetchTimeoutMs = DEFAULTS.fetchTimeoutMs, era = null, now = () => new Date().toISOString(), clock = () => Date.now(), maxPackBytes = PACK_MAX_BYTES, maxTotalBytes = PACKS_MAX_BYTES } = {}) {
  const t0 = clock();
  const reg = readRegistry(root);
  const ab = readAbsorb(root);
  const latest = new Map();
  for (const p of ab.pulled) if (isObj(p) && typeof p.id === 'string') latest.set(p.id, p);
  const index = new Map(readIndex(root).packs.map((p) => [p.id, p]));
  const dir = path.join(root, ...KNOW_DIR.split('/'));
  const sizeOf = (id) => { try { return fs.statSync(path.join(dir, id + '.json')).size; } catch { return 0; } };
  let total = [...index.keys()].reduce((s, id) => s + sizeOf(id), 0);
  const shelved = [], blocked = [];
  let unchanged = 0, fetched = 0, bytes = 0, left = 0;
  const at = now();
  for (const src of reg.sources) {
    if (!isObj(src) || typeof src.id !== 'string' || !PACK_RE.test(src.id) || !Object.hasOwn(ADAPTERS, String(src.kind))) continue;
    const pull = latest.get(src.id);
    if (!pull || typeof pull.sha256 !== 'string' || pull.blocked) continue;
    const have = index.get(src.id);
    if (have && have.sha === pull.sha256 && sizeOf(src.id) > 0) { unchanged++; continue; }
    const spent = clock() - t0;
    if (spent >= maxMs) { left++; continue; }
    let got;
    try { got = await fetchBytes(src.url, { fetch: fetchFn, timeoutMs: Math.max(1, Math.min(fetchTimeoutMs, maxMs - spent)), maxBytes: ABSORB_DEFAULTS.maxBytes }); } catch (e) { blocked.push(redact(src.id + ': ' + first(e))); continue; }
    fetched++;
    bytes += got.bytes.length;
    const sha = sha256(got.bytes);
    if (sha !== pull.sha256) { blocked.push(src.id + ': sha drift: the bytes are not the ones the absorber pulled (' + sha.slice(0, 12) + ' now, ' + pull.sha256.slice(0, 12) + ' pulled); the next absorb pull settles it'); continue; }
    let pk;
    try { pk = packOf(src, got.bytes, { at, sha, maxBytes: maxPackBytes }); } catch (e) { blocked.push(redact(src.id + ': ' + first(e))); continue; }
    if (!pk || !pk.rows.length) { blocked.push(src.id + ': the bytes give no table'); continue; }
    const text = JSON.stringify(pk) + '\n', size = Buffer.byteLength(text);
    const prev = sizeOf(src.id);
    if (total - prev + size > maxTotalBytes) { blocked.push(src.id + ': over the ' + maxTotalBytes + ' bytes all packs may be: not shelved'); continue; }
    writeAtomic(path.join(dir, src.id + '.json'), text);
    total += size - prev;
    index.set(src.id, { id: pk.id, columns: pk.columns, rows: pk.rows.length, sha: pk.sha });
    shelved.push(src.id + (pk.cut ? ' (' + pk.cut + ' rows cut)' : ''));
  }
  const list = [...index.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  if (shelved.length || !fs.existsSync(path.join(root, ...INDEX.split('/')))) writeAtomic(path.join(root, ...INDEX.split('/')), JSON.stringify({ packs: list }, null, 2) + '\n');
  if (left) blocked.push('shelve: the time budget of ' + maxMs + ' ms is spent; ' + left + ' sources wait for the next shelve');
  return {
    packs: list.length, shelved, unchanged, fetched, bytes, rows: list.reduce((s, p) => s + p.rows, 0), total, blocked,
    ms: Math.max(0, clock() - t0), ...(era === null || era === undefined ? {} : { era }),
  };
}

/** { packs, rows, bytes }: what neo/know/ holds. */
export function status(root = DEFAULT_ROOT) {
  const list = packs(root);
  let total = 0;
  for (const p of list) { try { total += fs.statSync(path.join(root, ...KNOW_DIR.split('/'), p.id + '.json')).size; } catch { /* not on disk: not counted */ } }
  return { packs: list.length, rows: list.reduce((s, p) => s + p.rows, 0), bytes: total };
}

// ---- the CLI
const VALUE = new Set(['root', 'max-ms', 'era', 'fetch-timeout-ms']);
export function parseArgs(argv) {
  const pos = [], flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { flags.help = true; continue; }
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const eq = a.indexOf('=');
    const name = eq > 0 ? a.slice(2, eq) : a.slice(2);
    if (!VALUE.has(name)) throw new Fail('unknown flag --' + name + ' (see --help)', 2);
    const v = eq > 0 ? a.slice(eq + 1) : argv[++i];
    if (v === undefined || v === '') throw new Fail('--' + name + ' needs a value', 2);
    flags[name] = v;
  }
  return { verb: pos[0], pos: pos.slice(1), flags };
}
function intOf(flags, name, lo, hi, dflt) {
  if (flags[name] === undefined) return dflt;
  const v = Number(flags[name]);
  if (!Number.isInteger(v) || v < lo || v > hi) throw new Fail('--' + name + ' is an integer from ' + lo + ' to ' + hi + ', not ' + flags[name], 2);
  return v;
}
/** The CLI as a function: the printed object, or { usage: true }. o.fetch replaces the network (a test's stub). */
export async function main(argv, o = {}) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  if (pos.length) throw new Fail('one verb, no other word: ' + pos.join(' ') + ' (see --help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  if (verb === 'shelve') {
    return await shelve(root, {
      maxMs: intOf(flags, 'max-ms', 1, 86400000, DEFAULTS.maxMs),
      fetchTimeoutMs: intOf(flags, 'fetch-timeout-ms', 1, 600000, DEFAULTS.fetchTimeoutMs),
      era: intOf(flags, 'era', 0, Number.MAX_SAFE_INTEGER, null),
      ...(typeof o.fetch === 'function' ? { fetch: o.fetch } : {}),
    });
  }
  if (verb === 'status') return status(root);
  throw new Fail('unknown verb ' + verb + ': shelve or status (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(redact(coded ? e.message : 'know failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
