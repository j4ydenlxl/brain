#!/usr/bin/env node
// grow/intake.mjs: SELF-OPENED TASKS (contract c10). The organism opens its own tasks, with no teacher arm and no model:
// what it was asked and could not answer, what it proposed to itself, and every relation of every knowledge pack it holds
// that no task covers yet each become neo/tasks/<task>/{task.json, dev.jsonl, heldout.jsonl}, frozen in neo/LEDGER.json
// exactly as grow/teach.mjs intake freezes a task, so the swarm grows a colony for it the next era.
// His words (2026-10-02, verbatim at the head of grow/NEO.md): "it should fill all its own gaps".
//
//   node grow/intake.mjs step [--root <dir>] [--max-ms <ms>] [--era <n>] [--gen <n>]
//   prints ONE JSON line {"opened":[..],"refused":[..],"pending":<n>} and replaces neo/INTAKE.json
//
// THE THREE SOURCES, in this order (a request outranks a probe, a probe outranks a bare pair):
//   1. requests: neo/requests.jsonl ({"at","q","from"}: the answer path's misses, appended only where a root is writable,
//      act/ask-http.mjs) and, when the environment holds SUPABASE_SERVICE_KEY (read by NAME, never printed), the open
//      rows of the site's miss log (grow/misses.mjs readMisses; without the name this source is skipped). A request is
//      read against every pack: a column whose label it names and ONE entity it names as a key of another column, that
//      key unique (a function, not a list). Its own wording, the entity replaced by {key}, is the task's first phrasing.
//   2. probes: neo/probes.jsonl (grow/measure.mjs probesPart: { task, pack, key, value, template }).
//   3. pairs: every (key column, value column) of every pack in neo/know/INDEX.json whose task is not in the ledger.
// A task has at least PHRASINGS.min phrasings, dealt round robin over its rows so every phrasing holds several prompts
// (grow/neo-core.mjs deriveTemplates needs at least two a shape). Its keys are split by a sha256 of the task and the key:
// a held-out key is never a dev key. Each row is { q, expect: { contains: [value], notRefusal: true }, answer }.
// A task is written to a scratch directory first and must pass grow/teach.mjs validateTaskDir (the name, task.json, the
// row counts, rowErrors, no repeat, no held-out prompt equal to a dev prompt); what it refuses is refused here, and the
// reason kept. Bounded: at most LIMITS.perStep tasks a step and LIMITS.perEra an era, inside --max-ms. Idempotent: a
// candidate decided once (neo/INTAKE.json decided) is not decided again, a task in the ledger is never rewritten, and a
// second step over the same inputs opens nothing. A held-out prompt the judge named (grow/retired.jsonl) is never read
// as a request.
// Reads neo/know/, neo/requests.jsonl, neo/probes.jsonl, neo/LEDGER.json, neo/INTAKE.json, neo/sources.json,
// grow/retired.jsonl and judge/dev/ by NAME (lockedClasses); writes neo/tasks/<task>/ (the three files), neo/LEDGER.json
// and neo/INTAKE.json. Never opens state/, judge/heldout/, judge/control.jsonl or any neo/tasks/*/heldout.jsonl.
// Exit 0 with the line; 2 on usage; 1 on a failure (one stderr line).
// Author: Opus 5.5 builder (ASK) for the Fable 5.1 orchestrator, 2026-10-02.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { TASK_RE, TASKS_DIR, LEDGER, TASK_FILES, MIN_ROWS, BRIEF_ROWS, lockedClasses, readLedger, rowErrors, normQ, shaText, validateTaskDir } from './teach.mjs';
import { nextGeneration } from './generation.mjs';
import { packs as indexPacks, pack as readPack, INDEX } from './know.mjs';
import { probeTask, PROBES_FILE } from './measure.mjs';
import { wordsOf, keyNorm, labelStems, stem } from '../act/native.mjs';
import { readRetired, isRetired } from './retire.mjs';

export const DEFAULT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const INTAKE_FILE = 'neo/INTAKE.json';
export const REQUESTS_FILE = 'neo/requests.jsonl';
export const SOURCES_FILE = 'neo/sources.json';
export const SERVICE_NAME = 'SUPABASE_SERVICE_KEY';
/** perStep, perEra: tasks opened; refuseStep: refusals a step records; requests: the newest request lines read; decided: decisions kept. */
export const LIMITS = Object.freeze({ perStep: 6, perEra: 12, refuseStep: 400, requests: 2000, requestsBytes: 4 * 1024 * 1024, misses: 200, decided: 20000, maxQ: 400, entityWords: 8, minValues: 3 });
export const DEFAULTS = Object.freeze({ maxMs: 60000 });
/** The phrasings of a relation: the request's or the probe's own first, then these until there are at least min. */
export const PHRASINGS = Object.freeze({ min: 3, max: 4, base: Object.freeze(['what is the {value} of {key}', 'tell me the {value} of {key}', 'name the {value} of {key}', 'give the {value} of {key}']) });
export const USAGE = [
  'node grow/intake.mjs step [--root <dir>] [--max-ms ' + DEFAULTS.maxMs + '] [--era <n>] [--gen <n>]',
  '  opens tasks by itself from ' + REQUESTS_FILE + ' (and the miss log with ' + SERVICE_NAME + '), ' + PROBES_FILE + ' and every pack column pair of ' + INDEX,
  '  prints {"opened":[..],"refused":[..],"pending":<n>} and replaces ' + INTAKE_FILE,
].join('\n');

export class Fail extends Error { constructor(msg, code = 1) { super(msg); this.code = code; } }
const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const sha6 = (s) => createHash('sha256').update(String(s)).digest('hex').slice(0, 6);
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
function writeAtomic(f, text) {
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const tmp = f + '.' + process.pid + '.tmp';
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, f);
}
const cellText = (x) => (typeof x === 'number' && Number.isFinite(x) ? String(x) : typeof x === 'string' && x.trim() && x.length <= 300 ? x.trim() : null);
const labelWords = (c) => String(c).replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();

// ---- the shelf
/** The shelf's signature: a refusal for want of a relation is tried again once the shelf changes. */
function shelfSig(root) {
  try { return sha6(fs.readFileSync(path.join(root, ...INDEX.split('/')), 'utf8')); } catch { return 'none'; }
}
function domainsOf(root) {
  const d = readJson(path.join(root, ...SOURCES_FILE.split('/')));
  const out = new Map();
  for (const s of isObj(d) && Array.isArray(d.sources) ? d.sources : []) if (isObj(s) && typeof s.id === 'string' && typeof s.domain === 'string' && s.domain.trim()) out.set(s.id, s.domain.trim());
  return out;
}

/**
 * The keys of a relation: the rows whose key occurs once and whose value is present and not the key ({ k, v }, in pack
 * order), and the count of distinct values.
 */
export function relationKeys(pk, ki, vi) {
  const seen = new Map();
  const values = new Set();
  for (const r of Array.isArray(pk && pk.rows) ? pk.rows : []) {
    if (!Array.isArray(r)) continue;
    const k = cellText(r[ki]), v = cellText(r[vi]);
    if (k === null || v === null) continue;
    const nk = keyNorm(k);
    if (!nk) continue;
    values.add(keyNorm(v));
    const s = seen.get(nk);
    if (s) s.n++;
    else seen.set(nk, { k, v, n: 1, same: keyNorm(v) === nk });
  }
  const keys = [];
  for (const s of seen.values()) if (s.n === 1 && !s.same) keys.push({ k: s.k, v: s.v });
  return { keys, values: values.size };
}

/** A template with one {key} slot: a probe's {<label>} slot is renamed {key}; null without exactly one slot. */
export function slotOf(t) {
  if (typeof t !== 'string') return null;
  const s = t.replace(/\{[^{}]*\}/g, '{key}').replace(/\s+/g, ' ').trim();
  return s.split('{key}').length === 2 && s.length <= LIMITS.maxQ ? s : null;
}
/** The phrasings of a task: its own first (deduplicated under norm level 1), then PHRASINGS.base, PHRASINGS.min to PHRASINGS.max. */
export function phrasingsOf(own, valueCol) {
  const v = labelWords(valueCol);
  const out = [], seen = new Set();
  const add = (t) => { const s = slotOf(t); if (!s) return; const k = normQ(s.replace('{key}', 'KEYSLOT')); if (seen.has(k)) return; seen.add(k); out.push(s); };
  for (const t of own) add(t);
  for (const t of PHRASINGS.base) { if (out.length >= PHRASINGS.min) break; add(t.replace('{value}', v)); }
  return out.slice(0, PHRASINGS.max);
}

/**
 * The rows of a relation task: keys ordered by sha256(task, key); the first third (at most BRIEF_ROWS.heldout) held out,
 * the next BRIEF_ROWS.dev the dev set, so no key is in both. Phrasings dealt round robin within each set.
 * @returns {{ dev: object[], heldout: object[], keys: number }}
 */
export function rowsOf(task, keys, phrasings, valueCol) {
  const vLabel = labelWords(valueCol);
  const ok = [];
  const seenQ = new Set();
  for (const { k, v } of keys) {
    const answer = 'The ' + vLabel + ' of ' + k + ' is ' + v + '.';
    const expect = { contains: [v], notRefusal: true };
    const qs = phrasings.map((p) => p.replace('{key}', k));
    if (qs.some((q) => rowErrors({ q, expect, answer }).length || seenQ.has(normQ(q)))) continue;
    for (const q of qs) seenQ.add(normQ(q));
    ok.push({ k, v, answer, expect, qs, h: createHash('sha256').update(task + '\u0000' + keyNorm(k)).digest('hex') });
  }
  ok.sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : 0));
  const nHeld = Math.min(BRIEF_ROWS.heldout, Math.ceil(ok.length / 3));
  const held = ok.slice(0, nHeld), dev = ok.slice(nHeld, nHeld + BRIEF_ROWS.dev);
  const deal = (set) => set.map((x, i) => ({ q: x.qs[i % x.qs.length], expect: x.expect, answer: x.answer }));
  return { dev: deal(dev), heldout: deal(held), keys: ok.length };
}

// ---- a request read against the packs
/** The words of a text with their spans in it: [{ w, from, to }], or null when they do not line up with wordsOf. */
function spansOf(q) {
  const out = [];
  for (const m of q.matchAll(/[\p{L}\p{N}\p{M}]+/gu)) for (const w of wordsOf(m[0])) out.push({ w, from: m.index, to: m.index + m[0].length });
  const flat = wordsOf(q);
  return out.length === flat.length && out.every((x, i) => x.w === flat[i]) ? out : null;
}
/**
 * The relation a request names: { pack, key, value, entity, template } or { why }. A column whose label stems the request
 * holds is the value; ONE run of 1 to LIMITS.entityWords words that is a unique key of another column is the entity (the
 * longest run wins); two relations that fit equally well are refused, never guessed.
 */
export function relationOf(root, q, entries = null, ctx = {}) {
  const packFn = typeof ctx.pack === 'function' ? ctx.pack : (id) => readPack(root, id);
  const keysFn = typeof ctx.keys === 'function' ? ctx.keys : (id, pk, ki, vi) => relationKeys(pk, ki, vi);
  if (typeof q !== 'string' || !q.trim() || q.length > LIMITS.maxQ) return { why: 'the request is empty or over ' + LIMITS.maxQ + ' characters' };
  const spans = spansOf(q);
  if (!spans || !spans.length) return { why: 'the request has no words' };
  const toks = spans.map((s) => ({ ...s, s: stem(s.w) }));
  const qs = new Set(toks.map((t) => t.s));
  const fits = [];
  for (const e of entries || indexPacks(root)) {
    const stems = e.columns.map(labelStems);
    const asked = stems.map((st, ci) => [ci, st.filter((s) => qs.has(s)).length]).filter(([, n]) => n > 0);
    if (!asked.length) continue;
    const pk = packFn(e.id);
    if (!pk) continue;
    for (const [vi, hits] of asked) {
      for (let ki = 0; ki < pk.columns.length; ki++) {
        if (ki === vi) continue;
        const rel = keysFn(e.id, pk, ki, vi);
        if (rel.values < LIMITS.minValues) continue;
        const idx = rel.idx || (rel.idx = new Map(rel.keys.map((x) => [keyNorm(x.k), x])));
        let best = null;
        for (let i = 0; i < toks.length; i++) {
          for (let len = Math.min(LIMITS.entityWords, toks.length - i); len >= 1; len--) {
            const run = toks.slice(i, i + len);
            if (run.every((t) => stems[vi].includes(t.s))) continue;
            const hit = idx.get(keyNorm(run.map((t) => t.w).join(' ')));
            if (hit && (!best || len > best.len)) best = { i, len, hit };
            if (hit) break;
          }
        }
        if (!best) continue;
        const a = toks[best.i], b = toks[best.i + best.len - 1];
        const template = (q.slice(0, a.from) + '{key}' + q.slice(b.to)).replace(/\s+/g, ' ').trim();
        fits.push({ pack: e.id, key: pk.columns[ki], value: pk.columns[vi], entity: best.hit.k, template, score: hits / Math.max(1, stems[vi].length) + best.len * 0.01 });
      }
    }
  }
  if (!fits.length) return { why: 'no pack holds a relation it names (a column label and one unique key of another column)' };
  const top = Math.max(...fits.map((f) => f.score));
  const best = fits.filter((f) => Math.abs(f.score - top) < 1e-9);
  const rels = new Set(best.map((f) => JSON.stringify([f.pack, f.key, f.value])));
  if (rels.size > 1) return { why: 'it names ' + rels.size + ' relations equally well: ' + best.slice(0, 3).map((f) => f.pack + ' ' + f.key + ' -> ' + f.value).join(', ') };
  const { score, ...f } = best[0];
  return f;
}

// ---- the sources
function tailLines(f, bytes) {
  let fd;
  try {
    fd = fs.openSync(f, 'r');
    const size = fs.fstatSync(fd).size;
    const start = Math.max(0, size - bytes);
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split(/\r?\n/);
    if (start > 0) lines.shift();
    return lines.map((s) => s.trim()).filter(Boolean);
  } catch { return []; } finally { if (fd !== undefined) fs.closeSync(fd); }
}
const parse = (s) => { try { return JSON.parse(s); } catch { return null; } };

/** neo/requests.jsonl: { at, q, from } rows, newest last in the file, newest first here, at most LIMITS.requests. */
export function readRequests(root) {
  const rows = tailLines(path.join(root, ...REQUESTS_FILE.split('/')), LIMITS.requestsBytes).map(parse)
    .filter((r) => isObj(r) && typeof r.q === 'string' && r.q.trim() && r.q.length <= LIMITS.maxQ);
  return rows.slice(-LIMITS.requests).reverse().map((r) => ({ q: r.q.trim(), at: typeof r.at === 'string' ? r.at : null, from: typeof r.from === 'string' ? r.from : 'requests' }));
}
/** The site's open misses (grow/misses.mjs readMisses) when the environment holds SERVICE_NAME; skipped without it. */
export async function readLogMisses(env, { fetch } = {}) {
  if (!env || !env[SERVICE_NAME]) return { rows: [], note: 'skipped: ' + SERVICE_NAME + ' is not in the environment' };
  try {
    const { readMisses } = await import('./misses.mjs');
    const r = await readMisses({ env, status: 'open', limit: LIMITS.misses, ...(fetch ? { fetch } : {}) });
    return { rows: r.rows.filter((x) => typeof x.prompt === 'string').map((x) => ({ q: x.prompt.trim(), at: x.at || null, from: 'misses' })), note: r.summary.reason };
  } catch (e) {
    return { rows: [], note: 'not read: ' + String((e && e.message) || e).split('\n')[0].slice(0, 160) };
  }
}
/** neo/probes.jsonl rows with a TASK_RE task, a pack, a key, a value and a template. */
export function readProbes(root) {
  return tailLines(path.join(root, ...PROBES_FILE.split('/')), LIMITS.requestsBytes).map(parse)
    .filter((r) => isObj(r) && typeof r.task === 'string' && TASK_RE.test(r.task) && typeof r.pack === 'string' && typeof r.key === 'string' && typeof r.value === 'string');
}
/** The held-out prompts the judge named (grow/retired.jsonl of the root, read by grow/retire.mjs). */
function retiredOf(root) {
  const r = readRetired(root);
  return (q) => isRetired(r, q);
}

// ---- a step
/** neo/INTAKE.json: { decided: { id: { status, task?, why?, sig?, era, at } }, byEra: { era: opened } }. */
export function readIntake(root) {
  const d = readJson(path.join(root, ...INTAKE_FILE.split('/')));
  return { decided: isObj(d) && isObj(d.decided) ? d.decided : {}, byEra: isObj(d) && isObj(d.byEra) ? d.byEra : {} };
}

/**
 * One intake step over a root.
 * @param {string} root
 * @param {{ maxMs?: number, era?: number|null, gen?: number|null, env?: object, fetch?: Function, now?: () => string, clock?: () => number }} [o]
 * @returns {Promise<{ opened: string[], refused: { task: string, why: string }[], pending: number }>}
 */
export async function step(root = DEFAULT_ROOT, { maxMs = DEFAULTS.maxMs, era = null, gen = null, env = process.env, fetch, now = () => new Date().toISOString(), clock = () => Date.now() } = {}) {
  const t0 = clock();
  const at = now();
  const n = Number.isInteger(gen) && gen >= 1 ? gen : nextGeneration(root);
  const eraKey = Number.isInteger(era) ? String(era) : null;
  const sig = shelfSig(root);
  const state = readIntake(root);
  const led = readLedger(root);
  const taken = new Set(led.tasks.map((r) => r.task));
  const locked = new Set(lockedClasses(root));
  const domains = domainsOf(root);
  const entries = indexPacks(root);
  const retired = retiredOf(root);
  const misses = await readLogMisses(env, { fetch });

  // the candidates, in priority order; each { id, src, ... }
  const cands = [];
  const seenReq = new Set();
  for (const r of [...readRequests(root), ...misses.rows]) {
    const id = 'request:' + sha6(normQ(r.q));
    if (seenReq.has(id) || retired(r.q)) continue;
    seenReq.add(id);
    cands.push({ id, src: 'request', q: r.q });
  }
  for (const p of readProbes(root)) cands.push({ id: 'probe:' + p.task, src: 'probe', task: p.task, pack: p.pack, key: p.key, value: p.value, own: [p.template] });
  for (const e of [...entries].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))) {
    e.columns.forEach((key, a) => e.columns.forEach((value, b) => {
      if (a === b || !keyNorm(key) || keyNorm(key) === keyNorm(value)) return;
      const task = probeTask(e.id, key, value);
      cands.push({ id: 'pair:' + task, src: 'pack', task, pack: e.id, key, value, own: [] });
    }));
  }
  const live = (c) => {
    const d = state.decided[c.id];
    if (!d) return true;
    return d.status === 'refused' && d.retry === 'shelf' && d.sig !== sig;
  };

  const opened = [], refused = [];
  const decide = (c, status, extra) => { state.decided[c.id] = { status, ...extra, era: eraKey, at }; };
  const refuse = (c, task, why) => { decide(c, 'refused', { task, why: why.slice(0, 6) }); refused.push({ task, why: why.slice(0, 3).join('; ').slice(0, 300) }); };
  const eraOpened = () => (eraKey !== null ? Number(state.byEra[eraKey]) || 0 : 0);
  const packCache = new Map(), keyCache = new Map();
  const packOf = (id) => { if (!packCache.has(id)) packCache.set(id, readPack(root, id)); return packCache.get(id); };
  const keysOf = (id, pk, ki, vi) => { const k = id + '\u0000' + ki + '\u0000' + vi; if (!keyCache.has(k)) keyCache.set(k, relationKeys(pk, ki, vi)); return keyCache.get(k); };
  const baseShapes = (value) => new Set(phrasingsOf([], value).map((p) => normQ(p.replace('{key}', 'KEYSLOT'))));
  let pending = 0;
  for (const c of cands) {
    if (!live(c)) continue;
    const full = opened.length >= LIMITS.perStep || eraOpened() >= LIMITS.perEra || refused.length >= LIMITS.refuseStep || clock() - t0 > maxMs;
    if (full) { pending++; continue; }
    let rel = c;
    if (c.src === 'request') {
      const r = relationOf(root, c.q, entries, { pack: packOf, keys: keysOf });
      if (r.why) { decide(c, 'refused', { task: c.id, why: [r.why], retry: 'shelf', sig }); refused.push({ task: c.id, why: r.why }); continue; }
      const base = probeTask(r.pack, r.key, r.value);
      // a request worded as a phrasing every relation task carries is covered by the relation's own task
      if ((taken.has(base) || opened.includes(base)) && baseShapes(r.value).has(normQ(r.template.replace('{key}', 'KEYSLOT')))) { decide(c, 'covered', { task: base }); continue; }
      // the request's own wording opens the relation's task when it is not taken yet, else a task of its own wording
      const task = taken.has(base) || opened.includes(base) ? (base.slice(0, 34).replace(/-+$/, '') + '-' + sha6(normQ(r.template))) : base;
      rel = { ...c, task: TASK_RE.test(task) ? task : 'request-' + sha6(c.q), pack: r.pack, key: r.key, value: r.value, own: [r.template] };
    }
    if (taken.has(rel.task) || opened.includes(rel.task)) { decide(c, 'covered', { task: rel.task }); continue; }
    const pk = packOf(rel.pack);
    const ki = pk ? pk.columns.indexOf(rel.key) : -1, vi = pk ? pk.columns.indexOf(rel.value) : -1;
    if (!pk || ki < 0 || vi < 0) { decide(c, 'refused', { task: rel.task, why: ['the pack ' + rel.pack + ' or its columns are not on the shelf'], retry: 'shelf', sig }); refused.push({ task: rel.task, why: 'the pack ' + rel.pack + ' or its columns are not on the shelf' }); continue; }
    const { keys, values } = keysOf(rel.pack, pk, ki, vi);
    if (values < LIMITS.minValues) { refuse(c, rel.task, ['the column ' + rel.value + ' holds ' + values + ' distinct values: a class, not a relation to look up']); continue; }
    const phr = phrasingsOf(rel.own || [], rel.value);
    if (phr.length < PHRASINGS.min) { refuse(c, rel.task, ['under ' + PHRASINGS.min + ' phrasings']); continue; }
    const rows = rowsOf(rel.task, keys, phr, rel.value);
    if (rows.dev.length < MIN_ROWS.dev || rows.heldout.length < MIN_ROWS.heldout) {
      decide(c, 'refused', { task: rel.task, why: [keys.length + ' unique keys give ' + rows.dev.length + ' dev and ' + rows.heldout.length + ' held-out rows, under ' + MIN_ROWS.dev + ' and ' + MIN_ROWS.heldout], retry: 'shelf', sig });
      refused.push({ task: rel.task, why: 'too few unique keys (' + keys.length + ')' });
      continue;
    }
    const task = {
      task: rel.task, skill: rel.task, domain: domains.get(rel.pack) || 'knowledge',
      rule: 'the ' + labelWords(rel.value) + ' of a ' + labelWords(rel.key) + ', looked up in the knowledge pack ' + rel.pack + ' (' + String(pk.sha || '').slice(0, 12) + ')',
      by: 'intake:' + c.src, generation: n,
    };
    const devText = rows.dev.map((r) => JSON.stringify(r)).join('\n') + '\n';
    const heldText = rows.heldout.map((r) => JSON.stringify(r)).join('\n') + '\n';
    // teach's validators first, in a scratch directory: what they refuse never reaches neo/tasks/
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'intake-'));
    const sdir = path.join(scratch, rel.task);
    let v;
    try {
      fs.mkdirSync(sdir);
      fs.writeFileSync(path.join(sdir, 'task.json'), JSON.stringify(task, null, 2) + '\n');
      fs.writeFileSync(path.join(sdir, 'dev.jsonl'), devText);
      fs.writeFileSync(path.join(sdir, 'heldout.jsonl'), heldText);
      v = validateTaskDir(sdir, { n, locked, taken });
    } finally { fs.rmSync(scratch, { recursive: true, force: true }); }
    if (!v.ok) { refuse(c, rel.task, v.why); continue; }
    const dest = path.join(root, ...TASKS_DIR.split('/'), rel.task);
    if (fs.existsSync(dest)) { refuse(c, rel.task, [TASKS_DIR + '/' + rel.task + '/ already exists but the ledger has no row for it: a human session repairs it']); continue; }
    const texts = { 'task.json': JSON.stringify(task, null, 2) + '\n', 'dev.jsonl': devText, 'heldout.jsonl': heldText };
    for (const f of TASK_FILES) writeAtomic(path.join(dest, f), texts[f]);
    led.doc.tasks.push({
      task: rel.task, generation: n, devSha: shaText(devText), heldoutSha: shaText(heldText), dev: rows.dev.length, heldout: rows.heldout.length,
      by: task.by, at, baseline: null, baselineWhy: 'grow/intake.mjs opens a task without asking the organism (contract c10)',
    });
    writeAtomic(path.join(root, ...LEDGER.split('/')), JSON.stringify(led.doc, null, 2) + '\n');
    taken.add(rel.task);
    opened.push(rel.task);
    decide(c, 'opened', { task: rel.task, phrasings: phr.length, dev: rows.dev.length, heldout: rows.heldout.length });
    if (eraKey !== null) state.byEra[eraKey] = eraOpened() + 1;
  }
  // the decisions kept: the newest LIMITS.decided
  const ids = Object.keys(state.decided);
  if (ids.length > LIMITS.decided) for (const id of ids.slice(0, ids.length - LIMITS.decided)) delete state.decided[id];
  const out = { opened, refused, pending };
  writeAtomic(path.join(root, ...INTAKE_FILE.split('/')), JSON.stringify({
    at, era: eraKey === null ? null : Number(eraKey), generation: n, ...out, shelf: sig, misses: misses.note, ms: clock() - t0,
    limits: { perStep: LIMITS.perStep, perEra: LIMITS.perEra }, byEra: state.byEra, decided: state.decided,
  }, null, 2) + '\n');
  return out;
}

// ---- the command line
const VALUE = new Set(['root', 'max-ms', 'era', 'gen']);
export function parseArgs(argv) {
  const [verb, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === '--help' || a === '-h') { flags.help = true; continue; }
    if (!a.startsWith('--')) throw new Fail('unexpected argument ' + JSON.stringify(a) + '\n' + USAGE, 2);
    const k = a.slice(2);
    if (!VALUE.has(k)) throw new Fail('unknown flag --' + k + '\n' + USAGE, 2);
    if (i + 1 >= rest.length) throw new Fail('--' + k + ' needs a value\n' + USAGE, 2);
    flags[k] = rest[++i];
  }
  return { verb, flags };
}
const intFlag = (flags, k, lo) => {
  if (flags[k] === undefined) return null;
  const v = Number(flags[k]);
  if (!Number.isInteger(v) || v < lo) throw new Fail('--' + k + ' is an integer from ' + lo + ', not ' + flags[k], 2);
  return v;
};
export async function main(argv, { env = process.env, fetch } = {}) {
  const { verb, flags } = parseArgs(argv);
  if (flags.help || verb === undefined || verb === 'help' || verb === '--help') return { usage: USAGE };
  if (verb !== 'step') throw new Fail('unknown verb ' + verb + ': step (--help)', 2);
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  return step(root, { maxMs: intFlag(flags, 'max-ms', 1) ?? DEFAULTS.maxMs, era: intFlag(flags, 'era', 0), gen: intFlag(flags, 'gen', 1), env, fetch });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then((r) => {
    if (r && r.usage) { process.stdout.write(r.usage + '\n'); return; }
    process.stdout.write(JSON.stringify(r) + '\n');
  }, (e) => {
    process.stderr.write('intake: ' + String((e && e.message) || e).split('\n')[0] + '\n');
    process.exitCode = e instanceof Fail ? e.code : 1;
  });
}
