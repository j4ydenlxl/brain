// act/native.mjs: THE NATIVE ANSWER (contract c11). A question is answered by LOOKING UP and COMPOSING over the knowledge
// packs the cloud shelved (grow/know.mjs: neo/know/INDEX.json and neo/know/<id>.json), with no model, no network and no
// per-domain code: every pack is a table, every column a relation, and the question is read against all of them alike.
// His words (2026-10-02, verbatim at the head of grow/NEO.md): "$0 per token to run its ai datacenter in the cloud and
// works Exaxtly like a FRONTEIR LLM"; "it should fill all its own gaps".
//
//   nativeAnswer(q, { root, last, thread }) => null | { answer, via: { pack, key, column, keyColumn, op, packs }, ms }
//
// HOW A QUESTION IS READ. The question's words are matched against every column label of every pack (a word and its
// plural are one word). A column whose label words appear is a column the question may ask for; only the packs holding
// one are opened. Then every run of 1 to NATIVE.maxEntityWords words is looked up as a cell of the pack's other columns
// (the kernel's norm: case, accents, punctuation, a leading "the"): that run is an ENTITY and its column the key. A
// reading is kept only when EVERY word of the question is explained: an entity, a word of the asked column's label or
// of the key column's label, an operation word, or a function word. One unexplained word ("what is the capital GAINS
// tax of France") and the reading is dropped: a wrong fluent answer is the worst outcome, so it answers right or not at
// all. Two readings that explain the question equally well and answer differently are ambiguous: null.
//
// THE OPERATIONS, chosen by words, never by domain: lookup (one entity), each (two entities, a text column), larger and
// smaller (which of two, a numeric column), yes-no (is A larger than B), sum (combined, total), difference, count (how
// many rows have the entity), list (the rows that have it, when the question asks for a plural), member (is X a Y, a
// membership pack). A FOLLOW-UP ("and germany?", "what about peru") reuses the relation of the thread: opts.last (the via
// of the answer before) or opts.thread (the earlier prompts, newest last, read again here: the server keeps no state).
//
// Total: never throws; null when the packs are absent, the question does not parse, or the match is ambiguous.
// It reads neo/know/ only (never state/, judge/, any heldout.jsonl), writes nothing, and caches what it read per root.
// Author: Opus 5.5 builder (ASK) for the Fable 5.1 orchestrator, 2026-10-02.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packs as indexPacks, pack as readPack, KNOW_DIR, INDEX } from '../grow/know.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** maxEntityWords: the longest entity run; maxList: rows a list names; maxQ: the longest question read; follow: earlier prompts a follow-up reads. */
export const NATIVE = Object.freeze({ maxEntityWords: 8, maxList: 60, maxQ: 400, follow: 4, maxFacts: 6, keyRatio: 0.9 });
export const OPS = Object.freeze(['lookup', 'each', 'larger', 'smaller', 'yes-no', 'sum', 'difference', 'count', 'list', 'member', 'describe']);

// ---- the words
/** Function words: they carry no relation and no entity. */
const STOP = new Set(('a an the is are was were be been being am of to in on at by for with from and or but as into onto '
  + 'what whats which who whom whose how when where why do does did doing done can could would should will shall may might must '
  + 'have has had having it its this that these those there here their them they me my mine you your i we us our s '
  + 'please tell give show find name named called known say said list lists all every each any some one ones '
  + 'located situated found lie lies belong belongs part use uses used using official main primary current currently '
  + 'exactly just also really actually value number').split(' '));
/** Words that open a follow-up turn. */
const FOLLOW_HEAD = /^(?:and|but|also|ok|okay|now|then|so)?\s*(?:(?:what|how)\s+about|and\s+for|same\s+for|now\s+for|and\s+what\s+about|and\s+how\s+about|and|for)\s+/;
const MAX_W = new Set(['larger', 'bigger', 'greater', 'more', 'higher', 'longer', 'older', 'largest', 'biggest', 'greatest', 'highest', 'most']);
const MIN_W = new Set(['smaller', 'less', 'lower', 'fewer', 'shorter', 'younger', 'smallest', 'lowest', 'least', 'fewest']);
const SUM_W = new Set(['combined', 'total', 'sum', 'together', 'plus', 'altogether']);
const DIFF_W = new Set(['difference', 'minus', 'differ', 'differs']);
const LINK_W = new Set(['than', 'between', 'versus', 'vs', 'compared', 'compare', 'much', 'many', 'count', 'yes', 'no', 'not']);
const OP_W = new Set([...MAX_W, ...MIN_W, ...SUM_W, ...DIFF_W, ...LINK_W]);
/** A key column that names a time: its cell reads "in 1990", not "of 1990". */
const TIME_KEY = /^\s*(?:year|date|month|day|time)s?\s*$/i;

/** The words of a text: no accents, lower case, letters and digits only (the kernel's knowWords). */
export function wordsOf(s) {
  return String(s ?? '').slice(0, 2000).normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(Boolean);
}
/** The kernel's key norm: wordsOf joined, a leading "the" dropped. */
export function keyNorm(s) {
  if (typeof s !== 'string' && !(typeof s === 'number' && Number.isFinite(s))) return '';
  const t = wordsOf(String(s)).join(' ');
  return t.startsWith('the ') ? t.slice(4) : t === 'the' ? '' : t;
}
/** One word and its plural are one word: countries, country; zones, zone; boxes, box. */
export function stem(w) {
  const s = String(w);
  if (s.length > 4 && s.endsWith('ies')) return s.slice(0, -3) + 'y';
  if (s.length > 4 && /(?:sses|xes|zes|ches|shes)$/.test(s)) return s.slice(0, -2);
  if (s.length > 3 && s.endsWith('s') && !/(?:ss|us|is)$/.test(s)) return s.slice(0, -1);
  return s;
}
/** The plural of a label (its last word). */
export function plural(label) {
  const s = String(label);
  if (/[^aeiou]y$/i.test(s)) return s.slice(0, -1) + 'ies';
  if (/(?:s|x|z|ch|sh)$/i.test(s)) return s + 'es';
  return s + 's';
}
/** The content stems of a label: its words less function words, each stemmed. */
export function labelStems(label) { return [...new Set(wordsOf(label).filter((w) => !STOP.has(w)).map(stem))]; }

/** A cell as the answer prints it: an integer from 10,000 up with thousands separators (a year or a code below stays as
 * it is: 1990, not 1,990), a fraction to at most 4 places, text as it is. */
export function show(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return Number.isInteger(v) ? (Math.abs(v) >= 10000 ? v.toLocaleString('en-US') : String(v)) : String(Math.round(v * 1e4) / 1e4);
  return String(v);
}
const numOf = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && /^-?\d+(?:\.\d+)?$/.test(v.trim()) ? Number(v.trim()) : null);
const listAnd = (xs) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// ---- the packs, read once per root and file
const CACHE = new Map(); // root -> { mtime, size, entries, packs: Map(id -> { sha, pk, idx: [] }) }
function shelfOf(root) {
  let st;
  try { st = fs.statSync(path.join(root, ...INDEX.split('/'))); } catch { return null; }
  let c = CACHE.get(root);
  if (!c || c.mtime !== st.mtimeMs || c.size !== st.size) {
    const entries = indexPacks(root).map((e) => ({ ...e, stems: e.columns.map(labelStems), idStems: labelStems(e.id.replace(/-/g, ' ')) }));
    c = { mtime: st.mtimeMs, size: st.size, entries, packs: new Map() };
    if (CACHE.size >= 8) CACHE.clear();
    CACHE.set(root, c);
  }
  return c;
}
function packOf(root, shelf, e) {
  const have = shelf.packs.get(e.id);
  if (have && have.sha === e.sha) return have.pk ? have : null;
  const pk = readPack(root, e.id);
  const slot = { sha: e.sha, pk, idx: [] };
  shelf.packs.set(e.id, slot);
  return pk ? slot : null;
}
/** The key index of one column: Map(keyNorm(cell) -> [row numbers]). */
function colIndex(slot, j) {
  if (slot.idx[j]) return slot.idx[j];
  const m = new Map();
  slot.pk.rows.forEach((r, i) => { const k = keyNorm(r[j]); if (!k) return; const a = m.get(k); if (a) a.push(i); else m.set(k, [i]); });
  slot.idx[j] = m;
  return m;
}
/** Drop the cache (a test's clean slate; a shelf rewritten under the same mtime). */
export function resetNative() { CACHE.clear(); }

// ---- the reading of one question
function tokensOf(q) {
  const ws = wordsOf(q);
  return ws.map((w, i) => ({ w, s: stem(w), i, stop: STOP.has(w), op: OP_W.has(w) }));
}
/** The entity runs of a pack: for each column, the maximal runs of the question that are one of its cells. */
function mentionsOf(slot, toks, skipCol) {
  const out = [];
  const n = toks.length;
  for (let j = 0; j < slot.pk.columns.length; j++) {
    if (j === skipCol) continue;
    const idx = colIndex(slot, j);
    const found = [];
    for (let i = 0; i < n; i++) {
      for (let len = Math.min(NATIVE.maxEntityWords, n - i); len >= 1; len--) {
        const run = toks.slice(i, i + len);
        if (run.every((t) => t.stop || t.op)) continue;
        if (len === 1 && run[0].w.length < 2 && !/^\d$/.test(run[0].w)) continue;
        const key = run.map((t) => t.w).join(' ');
        const k = key.startsWith('the ') ? key.slice(4) : key;
        const rows = idx.get(k);
        if (rows) { found.push({ col: j, from: i, to: i + len, rows }); break; }
      }
    }
    // the maximal runs only: a run inside a longer one of the same column ("guinea" in "papua new guinea") goes
    for (const f of found) if (!found.some((g) => g !== f && g.from <= f.from && g.to >= f.to && (g.to - g.from) > (f.to - f.from))) out.push(f);
  }
  return out;
}
const overlaps = (a, b) => a.from < b.to && b.from < a.to;

/** The operation the words ask for, given how many entities there are. */
function opOf(toks, entities) {
  const has = (set) => toks.some((t) => set.has(t.w));
  const seq = (a, b) => toks.some((t, i) => t.w === a && toks[i + 1] && toks[i + 1].w === b);
  if (entities === 2) {
    if (has(DIFF_W) || seq('how', 'much') && (has(MAX_W) || has(MIN_W))) return 'difference';
    if (has(SUM_W)) return 'sum';
    const max = has(MAX_W), min = has(MIN_W);
    if (max && min) return null;
    if ((max || min) && toks.some((t) => t.w === 'than') && ['is', 'are', 'was', 'does', 'do', 'has'].includes(toks[0].w)) return 'yes-no';
    if (max) return 'larger';
    if (min) return 'smaller';
    if (has(LINK_W)) return null;
    return 'each';
  }
  if (entities === 1) {
    if (seq('how', 'many') || seq('number', 'of') || toks[0] && toks[0].w === 'count') return 'count';
    if (has(MAX_W) || has(MIN_W) || has(SUM_W) || has(DIFF_W) || toks.some((t) => t.w === 'than' || t.w === 'between')) return null;
    return 'lookup';
  }
  return null;
}

/** Every reading of the question over one pack and one asked column; each { score, answer, via } or { ambiguous }. */
function readingsOf(slot, e, ci, toks, mentionsByPack) {
  const pk = slot.pk;
  const vStems = new Set(e.stems[ci]);
  const out = [];
  const ments = mentionsByPack.get(e.id) || [];
  // group the mentions by key column
  const byCol = new Map();
  for (const m of ments) if (m.col !== ci) (byCol.get(m.col) || byCol.set(m.col, []).get(m.col)).push(m);
  for (const [kc, list0] of byCol) {
    const kStems = new Set(e.stems[kc]);
    // a run that is only label words of the asked column is the relation, not an entity
    const list = list0.filter((m) => !toks.slice(m.from, m.to).every((t) => t.stop || t.op || vStems.has(t.s)));
    if (!list.length) continue;
    // the entities: non-overlapping mentions, at most two, in question order
    const ents = [];
    for (const m of [...list].sort((a, b) => a.from - b.from || (b.to - b.from) - (a.to - a.from))) if (!ents.some((x) => overlaps(x, m))) ents.push(m);
    if (ents.length > 2) continue;
    // every word explained: an entity, a label word of the asked or the key column, an operation word, a function word
    const inEnt = (i) => ents.some((m) => i >= m.from && i < m.to);
    let unexplained = 0, vHit = 0, kHit = 0;
    for (const t of toks) {
      if (inEnt(t.i)) continue;
      if (vStems.has(t.s)) { vHit++; continue; }
      if (kStems.has(t.s)) { kHit++; continue; }
      if (t.stop || t.op) continue;
      unexplained++;
    }
    if (unexplained || !vHit) continue;
    const op = opOf(toks, ents.length);
    if (!op) continue;
    const vLabel = pk.columns[ci], kLabel = pk.columns[kc];
    const asksPlural = toks.some((t) => vStems.has(t.s) && t.w !== t.s);
    const valuesOf = (m) => [...new Map(m.rows.map((r) => pk.rows[r][ci]).filter((v) => v !== '' && v !== null && v !== undefined).map((v) => [keyNorm(v), v])).values()];
    const keyCell = (m) => pk.rows[m.rows[0]][kc];
    const score = vHit / Math.max(1, vStems.size) + (kHit ? 0.5 : 0) + ents.reduce((s, m) => s + (m.to - m.from), 0) * 0.01;
    const via = (o, key, extra = {}) => ({ pack: e.id, key, column: vLabel, keyColumn: kLabel, op: o, ...extra });
    if (ents.length === 1) {
      const m = ents[0], vals = valuesOf(m), ent = show(keyCell(m));
      if (!vals.length) continue;
      if (op === 'count') {
        out.push({ score, answer: 'There ' + (vals.length === 1 ? 'is 1 ' + vLabel : 'are ' + vals.length + ' ' + plural(vLabel)) + ' whose ' + kLabel + ' is ' + ent + '.', via: via('count', ent, { n: vals.length }) });
        continue;
      }
      if (vals.length === 1 && !(asksPlural && m.rows.length > 1)) {
        const v = show(vals[0]);
        if (keyNorm(v) === keyNorm(ent)) continue;
        out.push({ score, answer: kHit ? v + ' is the ' + vLabel + ' whose ' + kLabel + ' is ' + ent + '.' : 'The ' + vLabel + (TIME_KEY.test(kLabel) ? ' in ' : ' of ') + ent + ' is ' + v + '.', via: via('lookup', ent), value: vals[0] });
        continue;
      }
      if (asksPlural) {
        const names = vals.map(show).sort((a, b) => a.localeCompare(b));
        const shown = names.slice(0, NATIVE.maxList);
        out.push({ score, answer: 'The ' + plural(vLabel) + ' whose ' + kLabel + ' is ' + ent + ' are ' + listAnd(shown) + (names.length > shown.length ? ' (' + names.length + ' in all; the first ' + shown.length + ' by name)' : '') + '.', via: via('list', ent, { n: names.length }) });
        continue;
      }
      out.push({ score, ambiguous: true, via: via('lookup', ent) });
      continue;
    }
    // two entities of one key column
    const [a, b] = ents;
    const va = valuesOf(a), vb = valuesOf(b), ea = show(keyCell(a)), eb = show(keyCell(b));
    if (va.length !== 1 || vb.length !== 1 || keyNorm(ea) === keyNorm(eb)) { out.push({ score, ambiguous: true, via: via(op, ea + ' and ' + eb) }); continue; }
    const key = ea + ' and ' + eb;
    if (op === 'each') {
      out.push({ score, answer: 'The ' + vLabel + ' of ' + ea + ' is ' + show(va[0]) + ', and the ' + vLabel + ' of ' + eb + ' is ' + show(vb[0]) + '.', via: via('each', key) });
      continue;
    }
    const na = numOf(va[0]), nb = numOf(vb[0]);
    if (na === null || nb === null) continue;
    const both = ' (' + ea + ' ' + show(na) + ', ' + eb + ' ' + show(nb) + ')';
    if (op === 'sum') { out.push({ score, answer: 'The combined ' + vLabel + ' of ' + ea + ' and ' + eb + ' is ' + show(na + nb) + both + '.', via: via('sum', key) }); continue; }
    if (op === 'difference') { out.push({ score, answer: 'The difference in ' + vLabel + ' between ' + ea + ' and ' + eb + ' is ' + show(Math.abs(na - nb)) + both + '.', via: via('difference', key) }); continue; }
    if (na === nb) { out.push({ score, answer: ea + ' and ' + eb + ' have the same ' + vLabel + ', ' + show(na) + '.', via: via(op, key) }); continue; }
    if (op === 'yes-no') {
      const wantMax = toks.some((t) => MAX_W.has(t.w));
      const yes = wantMax ? na > nb : na < nb;
      out.push({ score, answer: (yes ? 'Yes' : 'No') + ': the ' + vLabel + ' of ' + ea + ' is ' + show(na) + ' and of ' + eb + ' is ' + show(nb) + '.', via: via('yes-no', key) });
      continue;
    }
    const pickA = op === 'larger' ? na > nb : na < nb;
    const [w, l, wv, lv] = pickA ? [ea, eb, na, nb] : [eb, ea, nb, na];
    out.push({ score, answer: w + ' has the ' + op + ' ' + vLabel + ': ' + show(wv) + ', against ' + show(lv) + ' for ' + l + '.', via: via(op, key) });
  }
  return out;
}

/** "is X a Y": a membership pack (columns item and member) whose id names Y. */
function memberReadings(root, shelf, toks) {
  const out = [];
  if (!toks.length || !['is', 'are', 'was'].includes(toks[0].w)) return out;
  for (const e of shelf.entries) {
    if (e.columns.length !== 2 || keyNorm(e.columns[0]) !== 'item' || keyNorm(e.columns[1]) !== 'member') continue;
    const idHit = toks.filter((t) => !t.stop && e.idStems.includes(t.s));
    if (!idHit.length) continue;
    const slot = packOf(root, shelf, e);
    if (!slot) continue;
    const ents = mentionsOf(slot, toks, 1).filter((m) => !toks.slice(m.from, m.to).some((t) => e.idStems.includes(t.s)));
    if (ents.length !== 1) continue;
    const m = ents[0];
    if (toks.some((t) => !t.stop && !(t.i >= m.from && t.i < m.to) && !e.idStems.includes(t.s))) continue;
    const vals = [...new Set(m.rows.map((r) => keyNorm(slot.pk.rows[r][1])))];
    if (vals.length !== 1 || !['yes', 'no'].includes(vals[0])) continue;
    // the noun is the question's own words from the first to the last word of the pack's name ("programming language")
    const ent = show(slot.pk.rows[m.rows[0]][0]);
    const noun = toks.slice(idHit[0].i, idHit[idHit.length - 1].i + 1).filter((t) => !t.stop || t.i > idHit[0].i).map((t) => t.w).join(' ');
    const an = /^[aeiou]/.test(noun) ? 'an ' : 'a ';
    out.push({ score: 1, answer: vals[0] === 'yes' ? 'Yes, ' + ent + ' is ' + an + noun + '.' : 'No, ' + ent + ' is not ' + an + noun + '.', via: { pack: e.id, key: ent, column: e.columns[1], keyColumn: e.columns[0], op: 'member' } });
  }
  return out;
}

/**
 * "what is X", "define X", "what does X mean": the shelf's facts about one entity X (op describe). X is the longest run
 * of the question that is a cell of a KEY column (one whose cells are nearly all distinct, NATIVE.keyRatio), in a pack
 * where X's rows agree on every other column; every other word is a function word, a word that asks what a thing is
 * (DEF_W), or a label word of X's column, and those label words pick the columns X may be read in ("HTTP status 404":
 * the HTTP status code, not a numeric country code). Every column X is read in is a SENSE of X, a key column or not,
 * and a membership pack that holds X as yes is one too: X with two senses is null ("gold": an element and a Crayola
 * color; "Jupiter": a planet and a US city; "Zeus": a Greek god and a crypto ticker), since the shelf cannot tell which
 * one is asked. The facts are the other columns of the key-column senses, in shelf order, at most NATIVE.maxFacts.
 */
const DEF_W = new Set(['define', 'definition', 'meaning', 'mean', 'means', 'meant', 'describe', 'explain', 'about', 'stand', 'stands']);
const DEF_HEAD = new Set(['what', 'who', 'define', 'describe', 'explain', 'tell']);
function describe(root, shelf, toks) {
  if (!toks.length || !(DEF_HEAD.has(toks[0].w) || toks.some((t) => DEF_W.has(t.w)))) return null;
  if (toks.some((t) => t.op)) return null;
  const all = [];
  for (const e of shelf.entries) {
    const member = e.columns.length === 2 && keyNorm(e.columns[0]) === 'item' && keyNorm(e.columns[1]) === 'member';
    const slot = packOf(root, shelf, e);
    if (!slot) continue;
    for (const m of mentionsOf(slot, toks, member ? 1 : -1)) {
      if (member && !m.rows.some((r) => keyNorm(slot.pk.rows[r][1]) === 'yes')) continue;
      all.push({ e, slot, member, ...m });
    }
  }
  // a reading of X explains every other word (a label word of X's own column, a function word or DEF_W): "http" is a
  // cell of some pack too, but "status 404" are not label words of that column, so only 404 reads
  const explains = (m) => toks.every((t) => (t.i >= m.from && t.i < m.to) || t.stop || DEF_W.has(t.w) || m.e.stems[m.col].includes(t.s));
  const ok = all.filter(explains);
  if (!ok.length) return null;
  // X: the longest such run; two different runs of that length are two entities
  const len = Math.max(...ok.map((m) => m.to - m.from));
  const spans = new Set(ok.filter((m) => m.to - m.from === len).map((m) => m.from));
  if (spans.size !== 1) return null;
  const from = [...spans][0], to = from + len;
  const reads = ok.filter((m) => m.from === from && m.to === to);
  // the senses: one column label (or one membership pack) for every reading, or the shelf cannot tell which is asked
  const kinds = new Set(reads.map((m) => (m.member ? 'member ' + m.e.id : m.e.stems[m.col].join(' '))));
  if (kinds.size !== 1) return null;
  const cards = [];
  for (const m of reads) {
    if (m.member) continue;
    const { pk } = m.slot;
    if (colIndex(m.slot, m.col).size < NATIVE.keyRatio * pk.rows.length) continue;
    const facts = [];
    let agree = true;
    for (let j = 0; j < pk.columns.length && agree; j++) {
      if (j === m.col) continue;
      const vals = [...new Map(m.rows.map((r) => pk.rows[r][j]).filter((v) => v !== '' && v !== null && v !== undefined).map((v) => [keyNorm(v), v])).values()];
      if (vals.length > 1) agree = false;
      else if (vals.length === 1) facts.push([pk.columns[j], vals[0]]);
    }
    if (agree && facts.length) cards.push({ m, facts });
  }
  if (!cards.length) return null;
  const first = cards[0].m;
  const ent = show(first.slot.pk.rows[first.rows[0]][first.col]);
  const kLabel = first.e.columns[first.col];
  const seen = new Set([keyNorm(kLabel)]), shownVals = new Set([keyNorm(ent)]);
  const facts = [];
  for (const c of cards) for (const [label, v] of c.facts) {
    const lk = keyNorm(label), vk = keyNorm(v);
    if (seen.has(lk) || shownVals.has(vk) || facts.length >= NATIVE.maxFacts) continue;
    seen.add(lk); shownVals.add(vk);
    facts.push('whose ' + label + ' is ' + show(v));
  }
  if (!facts.length) return null;
  return {
    answer: cap(ent) + ' is the ' + kLabel + ' ' + listAnd(facts) + '.',
    via: { pack: first.e.id, key: ent, column: cards[0].facts[0][0], keyColumn: kLabel, op: 'describe', packs: [...new Set(cards.map((c) => c.m.e.id))], n: facts.length },
  };
}

/** The best reading, or null: no reading, or two best readings that answer differently, or an ambiguous best. */
function choose(rs) {
  if (!rs.length) return null;
  const best = Math.max(...rs.map((r) => r.score));
  const top = rs.filter((r) => Math.abs(r.score - best) < 1e-9);
  if (top.some((r) => r.ambiguous)) return null;
  const answers = new Set(top.map((r) => keyNorm(r.answer)));
  if (answers.size !== 1) return null;
  const r = top[0];
  return { answer: r.answer, via: { ...r.via, packs: [...new Set(top.map((x) => x.via.pack))] } };
}

function readQuestion(root, shelf, q) {
  const toks = tokensOf(q);
  if (!toks.length || toks.length > 40) return null;
  const qs = new Set(toks.filter((t) => !t.stop).map((t) => t.s));
  const asked = [];
  for (const e of shelf.entries) e.stems.forEach((st, ci) => { if (st.some((s) => qs.has(s))) asked.push([e, ci]); });
  const rs = [];
  if (asked.length) {
    const mentionsByPack = new Map();
    for (const [e] of asked) {
      if (mentionsByPack.has(e.id)) continue;
      const slot = packOf(root, shelf, e);
      mentionsByPack.set(e.id, slot ? mentionsOf(slot, toks, -1) : []);
    }
    for (const [e, ci] of asked) {
      const slot = packOf(root, shelf, e);
      if (slot) rs.push(...readingsOf(slot, e, ci, toks, mentionsByPack));
    }
  }
  rs.push(...memberReadings(root, shelf, toks));
  // no reading of a relation at all: perhaps it asks what one thing is
  return rs.length ? choose(rs) : describe(root, shelf, toks);
}

/** A follow-up: the words after its head are one entity of the relation's key column, and nothing else. */
function followUp(root, shelf, rest, rel) {
  const e = shelf.entries.find((x) => x.id === rel.pack);
  if (!e) return null;
  const ci = e.columns.indexOf(rel.column), kc = e.columns.indexOf(rel.keyColumn);
  if (ci < 0 || kc < 0) return null;
  const slot = packOf(root, shelf, e);
  if (!slot) return null;
  const toks = tokensOf(rest).filter((t) => !t.stop);
  if (!toks.length || toks.length > NATIVE.maxEntityWords) return null;
  const k = keyNorm(toks.map((t) => t.w).join(' '));
  const rows = colIndex(slot, kc).get(k);
  if (!rows) return null;
  const vals = [...new Map(rows.map((r) => slot.pk.rows[r][ci]).filter((v) => v !== '' && v !== null && v !== undefined).map((v) => [keyNorm(v), v])).values()];
  if (vals.length !== 1) return null;
  const ent = show(slot.pk.rows[rows[0]][kc]);
  return { answer: 'The ' + rel.column + ' of ' + ent + ' is ' + show(vals[0]) + '.', via: { pack: e.id, key: ent, column: rel.column, keyColumn: rel.keyColumn, op: 'lookup', packs: [e.id], follow: true } };
}

/**
 * The native answer of a question over the knowledge packs of root (contract c11).
 * @param {string} q the question
 * @param {{ root?: string, last?: { pack: string, column: string, keyColumn: string }, thread?: string[] }} [o]
 * @returns {null | { answer: string, via: { pack: string, key: string, column: string, keyColumn: string, op: string, packs: string[] }, ms: number }}
 */
export function nativeAnswer(q, o = {}) {
  const t0 = performance.now();
  try {
    if (typeof q !== 'string' || !q.trim() || q.length > NATIVE.maxQ) return null;
    const root = typeof (o && o.root) === 'string' && o.root ? o.root : ROOT;
    const shelf = shelfOf(root);
    if (!shelf || !shelf.entries.length) return null;
    const done = (r) => (r ? { answer: r.answer, via: r.via, ms: Number((performance.now() - t0).toFixed(3)) } : null);
    const flat = wordsOf(q).join(' ');
    const fm = FOLLOW_HEAD.exec(flat);
    if (fm) {
      let rel = o && o.last && typeof o.last.pack === 'string' && typeof o.last.column === 'string' && typeof o.last.keyColumn === 'string' ? o.last : null;
      if (!rel && Array.isArray(o && o.thread)) {
        for (const p of o.thread.slice(-NATIVE.follow).reverse()) {
          if (typeof p !== 'string') continue;
          const r = readQuestion(root, shelf, p);
          if (r && r.via && ['lookup', 'each'].includes(r.via.op)) { rel = r.via; break; }
        }
      }
      if (rel) { const f = followUp(root, shelf, flat.slice(fm[0].length), rel); if (f) return done(f); }
    }
    return done(readQuestion(root, shelf, q));
  } catch {
    return null;
  }
}

/** The packs a root holds, for a status line: { packs, root, dir }. */
export function nativeStatus(root = ROOT) {
  const s = shelfOf(root);
  return { packs: s ? s.entries.length : 0, dir: KNOW_DIR };
}
