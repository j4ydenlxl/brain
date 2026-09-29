#!/usr/bin/env node
// bench/program-guard.mjs: THE PROGRAM GUARD'S BAR (board 35, item program-guard).
//
// A wrong exact answer is worse than a refusal. The program tier (act/prompt.mjs programAnswer()) answered by the SHAPE
// OF NUMBERS: card probabilities and ISO weekdays with integers (bench/verdicts/self-queries-misses.jsonl), gsm8k.991
// with 42, and the census rows alg-01, alg-02, alg-04 and word-08 before the exact solver. The guard is two gates in
// programAnswer(): 6, THE KIND (cue words that name a kind no kept program was induced for) and 7, THE FORM (the
// prompt's question form, reason/induce.mjs questionForm, is one the matching program fit in development).
//
//   node bench/program-guard.mjs --forms   writes the forms into bench/verdicts/induce-programs.json, add-only: every
//                                          entry without forms gets forms.roles, the role-level patterns of the
//                                          development records it fit (read through reason/induce.mjs makeRecordReader,
//                                          only ids of bench/verdicts/ns.json rows.development), and the store gets a
//                                          top-level forms descriptor, and devRows (the development index: the fit
//                                          records as [id, role form, leaf table, gold], for the learned load's
//                                          check). Nothing else in the store changes. devRows.split (board 36, item
//                                          learn, add-only beside devRows.rows): the index's records counted against
//                                          the 200 development ids of bench/verdicts/math.json and ns.json's split, and
//                                          the wording that every measure on them is development, never held out.
//   node bench/program-guard.mjs           THE BAR, through ask() with provider null and the real store, in process,
//                                          sockets and fetch refused and counted, a fresh Brain per prompt:
//     (a) the 60 must-refuse prompts of bench/verdicts/program-guard-heldout.jsonl: the tier answers 0
//     (b) the must-keep development problems of the same file: before (the file) and after; a drop over 2 fails
//     (c) the wrong rows of bench/verdicts/self-queries-misses.jsonl as the task named them (165 at
//         2026-09-28T17:51:40.859Z: MISSES_AT, the git object read and its id checked), plus any row wrong on disk
//         now: wrong by the tier 0
//     (d) alg-01, alg-02, alg-04, word-08 (bench/verdicts/mistakes-ledger.jsonl) and gsm8k.991 (asked as bench/public.mjs
//         ALONE_PROMPT asks it): the exact path or a refusal, never a wrong tier answer
//     (e) the control: the same prompts with PROGRAM_GUARD.on false and the exact-kind readers unplugged (act/solve.mjs
//         kindsReader(false), so the tier meets them); (a) and (c) must reproduce wrong tier answers. Every arm runs
//         twice, as shipped and unplugged, and the guard must hold 0 in both.
//     (f) the learned overlay (bench/verdicts/learned-programs.json) on the store's development rows (devRows): with the
//         development check on it adds 0 wrong tier answers over the induced store alone; the control (check off) prints
//         what the check refused
//     Two more arms print what each gate refuses alone (kind only, form only). Then node --test test/act-prompt.test.mjs.
//   flags: --no-write (print, write no verdict), --no-test (skip the tests; the bar is then not met)
//
// Run it under BUDGETS: node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node
// --max-old-space-size=4000 bench/program-guard.mjs
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const V = (f) => path.join(ROOT, 'bench', 'verdicts', f);
const HELD = V('program-guard-heldout.jsonl');
const OUT = V('program-guard.json');
const STORE = V('induce-programs.json');
const MISSES = V('self-queries-misses.jsonl');
const LEDGER = V('mistakes-ledger.jsonl');
const NS = V('ns.json');
const MATH = V('math.json');
const GSM = path.join(ROOT, 'bench', 'fixtures', 'public', 'gsm8k', 'test.jsonl');
const TEST_FILE = 'test/act-prompt.test.mjs';
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

// The held-out file was written BEFORE any guard code (its writer printed these two lines at writing):
//   ids sha256 10192e08c2bfd0e1a5770497da89c5273bffa1a2e1df657cea56bfc7b7d2d488
//   file sha256 eb9c56f4183b76df468906351f663dcd051925f5d836cb7a966709ce898e1b76
export const HELD_WRITTEN = Object.freeze({
  idsSha256: '10192e08c2bfd0e1a5770497da89c5273bffa1a2e1df657cea56bfc7b7d2d488',
  fileSha256: 'eb9c56f4183b76df468906351f663dcd051925f5d836cb7a966709ce898e1b76',
  rows: 112, refuse: 60, keep: 52,
  draw: 'the first 50 of the self-queries wrong rows of templates calendar.* and probability.*, ordered by sha256("program-guard/1\\n" + id); 10 written by hand; the keep rows: every development fit of the kept store the tier answered right through ask() before the guard, in the same order',
});
export const DRAW_SEED = 'program-guard/1';
export const D_ROWS = Object.freeze(['alg-01', 'alg-02', 'alg-04', 'word-08', 'gsm8k.991']);
/** bench/public.mjs ALONE_PROMPT, the way the mistakes census asked gsm8k.991 (checked against that file's source). */
export const ALONE_PROMPT = (question) => String(question ?? '') + '\n\nAnswer with the final number.';
export const BAR = Object.freeze({ maxKeepDrop: 2 });
/**
 * THE MISSES AS THE TASK NAMED THEM: bench/verdicts/self-queries-misses.jsonl as bench/verdicts/self-queries.json
 * (at 2026-09-28T17:51:40.859Z) printed it, 165 wrong rows (arithmetic 36, calendar 16, probability 113). The file on
 * disk is rewritten whenever self-queries re-runs (another item re-ran it and its wrong rows went from 165 to 0), so the
 * draw and (c) read this git object (committed in 718e358) and check its object id; the rows wrong on disk now are asked
 * as well (the union, by id and prompt).
 */
export const MISSES_AT = Object.freeze({ blob: '490740d35a6ab834628c10b830165302cb1638bf', commit: '718e358', verdictAt: '2026-09-28T17:51:40.859Z', wrong: 165, byKind: Object.freeze({ probability: 113, arithmetic: 36, calendar: 16 }) });
/** The pinned misses file: git cat-file of MISSES_AT.blob, its bytes hashed the way git names a blob. */
export function readPinnedMisses() {
  let buf = null, error = null;
  try { buf = execFileSync('git', ['cat-file', 'blob', MISSES_AT.blob], { cwd: ROOT, maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { error = String((e && e.message) || e).split('\n')[0]; }
  if (!buf) return { ok: false, rows: [], bytes: 0, error };
  const id = crypto.createHash('sha1').update('blob ' + buf.length + '\0').update(buf).digest('hex');
  const ok = id === MISSES_AT.blob;
  return { ok, id, bytes: buf.length, rows: ok ? buf.toString('utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l)) : [], error: ok ? null : 'object id ' + id };
}

const readJsonl = (f) => fs.readFileSync(f, 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));

// ---------------------------------------------------------------- the forms (add-only)
/**
 * Add forms to every store entry that has none, from the development records it fit. Never opens a record outside
 * bench/verdicts/ns.json rows.development (a held-out id throws before it is read).
 * @returns {object} the tally printed and recorded in the store's forms descriptor
 */
export async function writeForms({ write = true, log = console.log } = {}) {
  const I = await import(pathToFileURL(path.join(ROOT, 'reason', 'induce.mjs')).href);
  const text = fs.readFileSync(STORE, 'utf8');
  const store = JSON.parse(text);
  if (text !== JSON.stringify(store) + '\n') throw new Error(rel(STORE) + ' does not re-serialise byte for byte: forms are not added to a file they would reformat');
  const ns = JSON.parse(fs.readFileSync(NS, 'utf8'));
  const dev = new Set(ns.rows.development.map((r) => r.id));
  const held = new Set(ns.split.heldOut.ids);
  const reader = I.makeRecordReader(GSM);
  const roleOf = new Map();
  const formOf = (id) => {
    if (!dev.has(id) || held.has(id)) throw new Error('not a development id of ' + rel(NS) + ': ' + id);
    if (!roleOf.has(id)) { const r = reader.get(id); roleOf.set(id, r ? I.questionForm(r.question).role : null); }
    return roleOf.get(id);
  };
  const t = { entries: 0, added: 0, had: 0, roleEntries: 0, roleOwn: 0, cueEntries: 0, cuePrefix: 0, missing: 0 };
  for (const lv of I.LEVELS) {
    for (const [pat, list] of Object.entries(store.levels[lv] || {})) {
      for (const e of list) {
        t.entries++;
        const roles = [...new Set(e.records.map(formOf).filter((x) => x !== null))].sort();
        t.missing += e.records.length - e.records.map(formOf).filter((x) => x !== null).length;
        // two controls that can fail: a role-level entry's forms are exactly its own pattern, and every form of a
        // cue-level entry starts with its cue pattern (the reader is the store's own parse, or the store is not)
        if (lv === 'role') { t.roleEntries++; if (roles.length === 1 && roles[0] === pat) t.roleOwn++; }
        if (lv === 'cue') { t.cueEntries++; if (roles.length && roles.every((r) => r.startsWith(pat + '|r'))) t.cuePrefix++; }
        if (e.forms && Array.isArray(e.forms.roles)) { t.had++; continue; }
        e.forms = { roles, rows: e.records.length };
        t.added++;
      }
    }
  }
  const opened = [...reader.openedSet].sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]));
  const outside = opened.filter((id) => !dev.has(id) || held.has(id)).length;
  if (t.roleOwn !== t.roleEntries || t.cuePrefix !== t.cueEntries) throw new Error('forms control failed: role entries ' + t.roleOwn + ' of ' + t.roleEntries + ' own pattern, cue entries ' + t.cuePrefix + ' of ' + t.cueEntries + ' prefixed');
  // THE DEVELOPMENT INDEX (devRows, add-only): the development records the store fits, each as [id, role form, leaf
  // table, gold], the rows act/prompt.mjs checks a learned entry against before it loads it. The records are the ones
  // opened above (no other record is read); the control that can fail: every level's pattern derived from the role form
  // (reason/induce.mjs patternAt) equals the pattern the parse gives, on every row, or nothing is written.
  const idx = { rows: 0, derived: 0, noGold: 0 };
  const devRows = [];
  for (const id of opened) {
    const r = reader.get(id);
    const p = I.parse(r.question);
    const pats = I.patterns(p);
    const gold = I.goldOf(r);
    idx.rows++;
    if (I.LEVELS.every((lv) => I.patternAt(pats.role, lv) === pats[lv])) idx.derived++;
    if (gold === null) { idx.noGold++; continue; }
    devRows.push([id, pats.role, { ...I.leafTable(p) }, gold]);
  }
  if (idx.derived !== idx.rows) throw new Error('development index control failed: patterns derived from the role form ' + idx.derived + ' of ' + idx.rows);
  const at = new Date().toISOString();
  const rowsSha0 = store.devRows && Array.isArray(store.devRows.rows) ? sha(JSON.stringify(store.devRows.rows)) : null;
  if (!store.devRows) {
    const ids = devRows.map((r) => r[0]);
    store.devRows = {
      version: 1, at, by: 'node bench/program-guard.mjs --forms (board 35, item program-guard)',
      what: 'the development records the store fits, each [id, role form, leaf table, gold]: act/prompt.mjs refuses a learned entry that would answer one of them wrong (its pattern at the entry level, one of its forms, a value past the invariant that is not the gold)',
      reader: 'reason/induce.mjs parse(question): patterns(p).role and leafTable(p); goldOf(record)',
      source: rel(GSM), development: rel(NS) + ' rows.development', rows: devRows, count: devRows.length, idsSha256: sha(ids.join('\n')),
    };
    idx.added = true;
  }
  // THE SPLIT DESCRIPTOR (board 36, item learn; the rule 7 disclosure), add-only beside devRows.rows: the index's records
  // counted here against the 200 development ids of bench/verdicts/math.json and ns.json's split. No row changes.
  if (store.devRows && Array.isArray(store.devRows.rows) && !store.devRows.split) {
    const math = new Set(((JSON.parse(fs.readFileSync(MATH, 'utf8')).records || {}).ids || []).map(String));
    const ids = store.devRows.rows.map((r) => r[0]);
    const inMath = ids.filter((id) => math.has(id)).length;
    store.devRows.split = {
      at, by: 'node bench/program-guard.mjs --forms (board 36, item learn)',
      rows: ids.length, inMathDevelopment: inMath, outsideMathDevelopment: ids.length - inMath,
      inNsDevelopment: ids.filter((id) => dev.has(id)).length, inNsHeldOut: ids.filter((id) => held.has(id)).length,
      wording: 'the store was fit on these ' + ids.length + ' records before board 35 (bench/induce.mjs on ' + rel(NS) + ' rows.development); ' + (ids.length - inMath) + ' of them are GSM8K test records outside the ' + math.size + ' development ids of ' + rel(MATH) + ' (' + inMath + ' inside), so every measure on them is development, never held out',
    };
    idx.split = true;
  }
  const rowsSame = rowsSha0 === null || sha(JSON.stringify(store.devRows.rows)) === rowsSha0;
  if (!rowsSame) throw new Error('devRows.rows changed: the index is add-only');
  const sp = store.devRows && store.devRows.split;
  if (t.added > 0 || !store.forms) {
    store.forms = {
      version: 1, at, by: 'node bench/program-guard.mjs --forms (board 35, item program-guard)',
      reader: 'reason/induce.mjs questionForm(question).role: the role-level pattern (quantity count, the question cue classes, the named quantities, every positional quantity\'s role tag)',
      what: 'each entry\'s forms.roles lists the role-level patterns of the development records it fit (its records); act/prompt.mjs gate 7 answers only a prompt whose form is one of them; added to entries that had none, nothing else changed',
      source: rel(GSM), development: rel(NS) + ' rows.development', records: opened.length, idsSha256: sha(opened.join('\n')), openedOutsideDevelopment: outside,
      entries: t.entries, added: t.added,
    };
  }
  const outText = JSON.stringify(store) + '\n';
  if (write && (t.added > 0 || outText !== text)) fs.writeFileSync(STORE, outText);
  const line = 'forms: entries ' + t.entries + ' added ' + t.added + ' had ' + t.had + '; development records opened ' + opened.length + ' (outside development ' + outside + ', unreadable ' + t.missing + '); controls: role entries whose form is their own pattern ' + t.roleOwn + ' of ' + t.roleEntries + ', cue entries whose forms carry their cue pattern ' + t.cuePrefix + ' of ' + t.cueEntries + '; development index ' + (idx.added ? 'added' : 'had') + ': rows ' + store.devRows.count + ' (records ' + idx.rows + ', without a gold ' + idx.noGold + ', patterns derived from the role form ' + idx.derived + ' of ' + idx.rows + ', rows unchanged ' + rowsSame + '); split descriptor ' + (sp ? (idx.split ? 'added' : 'had') + ': rows ' + sp.rows + ', in math.json development ' + sp.inMathDevelopment + ', outside ' + sp.outsideMathDevelopment + ', in ns development ' + sp.inNsDevelopment + ', in ns heldOut ' + sp.inNsHeldOut : 'absent') + '; store bytes ' + Buffer.byteLength(text) + ' -> ' + Buffer.byteLength(outText) + ', sha256 ' + sha(outText).slice(0, 16) + (write ? '' : ' (not written: --no-write)');
  log(line);
  return { ...t, opened: opened.length, outside, index: idx, bytesBefore: Buffer.byteLength(text), bytesAfter: Buffer.byteLength(outText), storeSha256: sha(outText), line };
}

// ---------------------------------------------------------------- the model-off guard
const guard = { sockets: 0, fetches: 0, installed: false };
function installSocketGuard() {
  if (guard.installed) return;
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function refusedConnect() { guard.sockets++; throw new Error('bench/program-guard.mjs runs model off: a socket was refused'); };
  guard.restore = () => { net.Socket.prototype.connect = connect; };
  if (typeof globalThis.fetch === 'function') {
    const f = globalThis.fetch;
    globalThis.fetch = async () => { guard.fetches++; throw new Error('bench/program-guard.mjs runs model off: a fetch was refused'); };
    const r = guard.restore;
    guard.restore = () => { r(); globalThis.fetch = f; };
  }
  guard.installed = true;
}

// ---------------------------------------------------------------- the tests
export function runTests() {
  let out = '', code = 0;
  try { out = execFileSync(process.execPath, ['--test', '--test-reporter=tap', TEST_FILE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 }); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status ?? 1; }
  const num = (k) => { const m = new RegExp('^# ' + k + ' (\\d+)', 'm').exec(out); return m ? Number(m[1]) : null; };
  const r = { command: 'node --test ' + TEST_FILE, exit: code, tests: num('tests'), pass: num('pass'), fail: num('fail') };
  r.ok = code === 0 && r.fail === 0 && r.pass !== null && r.pass > 0 && r.pass === r.tests;
  r.tally = 'tests ' + r.tests + ' pass ' + r.pass + ' fail ' + r.fail;
  return r;
}

// ---------------------------------------------------------------- grading
const numeric = (s) => (/^-?\d+(?:\.\d+)?$/.test(String(s ?? '').trim()) ? Number(String(s).trim()) : null);
/** One asked row: the route, the tier's answer, and whether the tier's answer is right. */
function graded(a, truth) {
  const tier = a && a.from === 'program';
  const answer = tier ? String(a.program.answer) : String((a && a.text) || '').split('\n').pop();
  const tn = numeric(truth);
  const right = tier ? tn !== null && Number(a.program.answer) === tn : null;
  return { from: a ? a.from : null, tier, answer, right, program: tier ? a.program.text : null, level: tier ? a.program.level : null };
}
const tallyFrom = (rs) => rs.reduce((m, r) => { m[r.from] = (m[r.from] || 0) + 1; return m; }, {});

// ---------------------------------------------------------------- the bar
export async function run({ write = true, tests = true, log = console.log } = {}) {
  const at = new Date().toISOString();
  const t0 = Date.now();
  const command = 'node bench/program-guard.mjs' + (write ? '' : ' --no-write') + (tests ? '' : ' --no-test');
  installSocketGuard();
  const P = await import(pathToFileURL(path.join(ROOT, 'act', 'prompt.mjs')).href);
  const I = await import(pathToFileURL(path.join(ROOT, 'reason', 'induce.mjs')).href);
  const { Brain } = await import(pathToFileURL(path.join(ROOT, 'core', 'brain.mjs')).href);
  const printed = [];
  const say = (s) => { printed.push(s); log(s); };

  // the held-out file, written first: its bytes and its ids are the ones printed at writing
  const heldBytes = fs.readFileSync(HELD);
  const rows = readJsonl(HELD);
  const held = { file: rel(HELD), fileSha256: sha(heldBytes), idsSha256: sha(rows.map((r) => r.id).join('\n')), rows: rows.length };
  held.sameAsWritten = held.fileSha256 === HELD_WRITTEN.fileSha256 && held.idsSha256 === HELD_WRITTEN.idsSha256;
  const refuse = rows.filter((r) => r.set === 'refuse');
  const keep = rows.filter((r) => r.set === 'keep');
  // the draw reproduces from the misses file as the task named it (MISSES_AT: the pinned git object, not the live file)
  const pinned = readPinnedMisses();
  const misses = pinned.rows.filter((r) => !r.group);
  const key = (id) => sha(DRAW_SEED + '\n' + id);
  const pool = misses.filter((r) => r.state === 'wrong' && /^(calendar|probability)\./.test(r.template));
  const drawn = pool.slice().sort((a, b) => (key(a.id) < key(b.id) ? -1 : key(a.id) > key(b.id) ? 1 : 0)).slice(0, 50).map((r) => 'sq.' + r.id);
  held.drawReproduces = JSON.stringify(drawn) === JSON.stringify(refuse.filter((r) => r.id.startsWith('sq.')).map((r) => r.id));
  say('held out: ' + held.file + ' rows ' + held.rows + ' (refuse ' + refuse.length + ', keep ' + keep.length + '), ids sha256 ' + held.idsSha256.slice(0, 16) + ', file sha256 ' + held.fileSha256.slice(0, 16) + ', same as written first ' + held.sameAsWritten + ', draw reproduces ' + held.drawReproduces);

  // (c) the wrong rows of the misses file; (d) the five rows
  const pinnedWrong = misses.filter((r) => r.state === 'wrong');
  const kindsOf = (rs) => rs.reduce((m, r) => { const k = r.template.split('.')[0]; m[k] = (m[k] || 0) + 1; return m; }, {});
  const pinnedByKind = kindsOf(pinnedWrong);
  const nowWrong = readJsonl(MISSES).filter((r) => !r.group && r.state === 'wrong');
  const seenRow = new Set(pinnedWrong.map((r) => r.id + '\n' + r.prompt));
  const newer = nowWrong.filter((r) => !seenRow.has(r.id + '\n' + r.prompt));
  const wrongRows = pinnedWrong.concat(newer);
  const wrongByKind = kindsOf(wrongRows);
  const pinnedMet = pinned.ok && pinnedWrong.length === MISSES_AT.wrong && JSON.stringify(Object.entries(pinnedByKind).sort()) === JSON.stringify(Object.entries(MISSES_AT.byKind).sort());
  say('(c) rows: ' + rel(MISSES) + ' as of ' + MISSES_AT.verdictAt + ' (git blob ' + MISSES_AT.blob.slice(0, 8) + ', commit ' + MISSES_AT.commit + ', ' + pinned.bytes + ' bytes, object id checked ' + pinned.ok + (pinned.error ? ', ' + pinned.error : '') + ') wrong ' + pinnedWrong.length + ' (' + Object.entries(pinnedByKind).map(([k, v]) => k + ' ' + v).join(', ') + '), as named ' + pinnedMet + '; on disk now wrong ' + nowWrong.length + ', not in the pinned set ' + newer.length + '; asked ' + wrongRows.length);
  const ledger = readJsonl(LEDGER);
  const dRows = [];
  const reader = I.makeRecordReader(GSM);
  for (const id of D_ROWS) {
    const r = ledger.find((x) => x.id === id);
    if (!r) throw new Error(rel(LEDGER) + ' has no row ' + id);
    if (r.prompt) { dRows.push({ id, prompt: r.prompt, truth: String(r.wanted && r.wanted.answer) }); continue; }
    const rec = reader.get(id); // opened for grading only: nothing here learns
    dRows.push({ id, prompt: ALONE_PROMPT(rec.question), truth: String(I.goldOf(rec)) });
  }
  const pubSrc = fs.readFileSync(path.join(ROOT, 'bench', 'public.mjs'), 'utf8');
  const aloneSame = pubSrc.includes("String(question ?? '') + '\\n\\nAnswer with the final number.'");
  if (!aloneSame) throw new Error('bench/public.mjs ALONE_PROMPT changed: this bench asks gsm8k.991 the old way');

  // the store, as the tier loads it
  const store = P.programStore();
  let formed = 0, entries = 0;
  for (const lv of Object.keys(store.levels)) for (const list of Object.values(store.levels[lv])) for (const e of list) { entries++; if (e.forms && Array.isArray(e.forms.roles)) formed++; }
  const storeInfo = { file: rel(STORE), sha256: sha(fs.readFileSync(STORE)), formsDeclared: !!store.forms, entries, formed, learnedLoaded: P.PROGRAM_TIER.learned, learnedRefused: P.PROGRAM_TIER.learnedRefused, learnedContradicted: P.PROGRAM_TIER.learnedContradicted, learnedUnchecked: P.PROGRAM_TIER.learnedUnchecked, retracted: P.PROGRAM_TIER.retracted, retractUnapplied: P.PROGRAM_TIER.retractUnapplied, devRows: store.devRows && Array.isArray(store.devRows.rows) ? store.devRows.rows.length : 0, learnedFile: rel(P.LEARNED_STORE), learnedPresent: fs.existsSync(P.LEARNED_STORE) };
  say('store: ' + storeInfo.file + ' sha256 ' + storeInfo.sha256.slice(0, 16) + ', entries ' + entries + ', with forms ' + formed + ', forms declared ' + storeInfo.formsDeclared + ', development rows indexed ' + storeInfo.devRows + '; learned store ' + storeInfo.learnedFile + (storeInfo.learnedPresent ? ' present, loaded ' + storeInfo.learnedLoaded + ', refused ' + storeInfo.learnedRefused + ', contradicted by a development row ' + storeInfo.learnedContradicted + ', unchecked ' + storeInfo.learnedUnchecked + ', forms retracted ' + storeInfo.retracted + ', retractions unapplied ' + storeInfo.retractUnapplied : ' absent (no-op)'));
  // the rule 7 disclosure (board 36, item learn): the development index's split descriptor, written by --forms
  const dsp = store.devRows && store.devRows.split ? store.devRows.split : null;
  const mathIds = new Set(((JSON.parse(fs.readFileSync(MATH, 'utf8')).records || {}).ids || []).map(String));
  const keepOutsideMath = keep.filter((r) => !mathIds.has(String(r.id))).length;
  storeInfo.devRowsSplit = dsp;
  say('development index split (devRows.split, written by --forms): ' + (dsp ? 'rows ' + dsp.rows + ', in math.json development ' + dsp.inMathDevelopment + ', outside ' + dsp.outsideMathDevelopment + ', in ns development ' + dsp.inNsDevelopment + ', in ns heldOut ' + dsp.inNsHeldOut : 'absent') + '; must-keep rows (b) outside the ' + mathIds.size + ' math.json development ids ' + keepOutsideMath + ' of ' + keep.length);
  // THE RECOUNT (checkpoint 4; the skeptic of board 36: the descriptor above is printed as stored, so a stale one would
  // print unchanged). The same five counts taken now from the index's ids against math.json and ns.json, printed beside
  // the stored ones; the bar row split holds only when they are equal.
  const nsR = JSON.parse(fs.readFileSync(NS, 'utf8'));
  const nsDevR = new Set(nsR.rows.development.map((r) => r.id)), nsHeldR = new Set(nsR.split.heldOut.ids);
  const idsR = store.devRows && Array.isArray(store.devRows.rows) ? store.devRows.rows.map((r) => String(r[0])) : [];
  const splitRecount = { rows: idsR.length, inMathDevelopment: idsR.filter((id) => mathIds.has(id)).length, outsideMathDevelopment: idsR.filter((id) => !mathIds.has(id)).length, inNsDevelopment: idsR.filter((id) => nsDevR.has(id)).length, inNsHeldOut: idsR.filter((id) => nsHeldR.has(id)).length };
  const SPLIT_KEYS = ['rows', 'inMathDevelopment', 'outsideMathDevelopment', 'inNsDevelopment', 'inNsHeldOut'];
  const splitEqual = !!dsp && SPLIT_KEYS.every((k) => dsp[k] === splitRecount[k]);
  storeInfo.devRowsSplitRecount = { at, against: [rel(MATH), rel(NS)], ...splitRecount, equalsStored: splitEqual };
  say('development index split recounted now against ' + rel(MATH) + ' and ' + rel(NS) + ': ' + SPLIT_KEYS.map((k) => k + ' ' + splitRecount[k] + (dsp && dsp[k] !== splitRecount[k] ? ' (stored ' + dsp[k] + ')' : '')).join(', ') + '; equals the stored descriptor: ' + splitEqual);

  const sets = {
    a: refuse.map((r) => ({ id: r.id, prompt: r.prompt, truth: r.truth, kind: r.kind })),
    b: keep.map((r) => ({ id: r.id, prompt: r.prompt, truth: r.truth })),
    c: wrongRows.map((r) => ({ id: r.id, prompt: r.prompt, truth: r.truth, kind: r.template.split('.')[0], template: r.template })),
    d: dRows,
  };
  // Four arms of the guard's switches, each asked twice: 'real' (ask() as it ships) and 'exposed' (act/solve.mjs
  // kindsReader(false): the nine exact-kind readers unplugged, so every prompt they would catch reaches the tier, the
  // way a phrasing they miss would). The exact readers now answer most of (a) and (c) before the tier is asked, so the
  // real arms alone cannot show the guard doing anything; the exposed control is the one that must answer wrong.
  const ARMS = [
    ['guard', { on: true, kind: true, form: true }],
    ['control', { on: false, kind: true, form: true }],
    ['kindOnly', { on: true, kind: true, form: false }],
    ['formOnly', { on: true, kind: false, form: true }],
  ];
  const EXPOSURES = [['real', true], ['exposed', false]];
  const S_ = await import(pathToFileURL(path.join(ROOT, 'act', 'solve.mjs')).href);
  const socketsBefore = guard.sockets + guard.fetches;
  const arms = {};
  const saved = { ...P.PROGRAM_GUARD };
  const kindsWas = S_.kindsReader();
  try {
    for (const [ex, readers] of EXPOSURES) {
      S_.kindsReader(readers);
      for (const [name, sw] of ARMS) {
        Object.assign(P.PROGRAM_GUARD, sw);
        const c0 = { ...P.PROGRAM_TIER };
        const k0 = { ...P.PROGRAM_KINDS };
        const arm = {};
        for (const [s, list] of Object.entries(sets)) {
          const out = [];
          for (const r of list) {
            const brain = new Brain({ name: 'program-guard', ledger: 'off' });
            let a = null;
            try { a = await P.ask(brain, r.prompt, { provider: 'null' }); } catch (e) { a = { from: 'threw', text: String(e && e.message) }; }
            out.push({ id: r.id, kind: r.kind, template: r.template, truth: r.truth, ...graded(a, r.truth) });
          }
          arm[s] = out;
        }
        const delta = {};
        for (const k of ['asked', 'answered', 'kind', 'form', 'unformed', 'missed', 'partial', 'shape', 'noQuantity']) delta[k] = P.PROGRAM_TIER[k] - c0[k];
        const kinds = {};
        for (const [k, v] of Object.entries(P.PROGRAM_KINDS)) if (v - (k0[k] || 0)) kinds[k] = v - (k0[k] || 0);
        arms[name + '.' + ex] = { name, exposure: ex, kindsReader: readers, switches: sw, rows: arm, counters: delta, kinds };
      }
    }
  } finally { Object.assign(P.PROGRAM_GUARD, saved); S_.kindsReader(kindsWas); }

  // (f) THE LEARNED OVERLAY ON DEVELOPMENT (rule 6: nothing added may answer wrong where the tier did not before). The
  // development rows the store fits (its devRows index: the records --forms opened, ids of bench/verdicts/ns.json
  // rows.development, never a held-out id), each asked as its question through ask() with the guard on and the exact
  // path as shipped, against three stores: induced only (no overlay), induced plus the learned overlay as act/prompt.mjs
  // loads it (the development check on), and the control: the overlay loaded with PROGRAM_GUARD.learnedCheck false.
  // added wrong: a row the induced store did not answer wrong by the tier and the overlay store does.
  const nsJ = JSON.parse(fs.readFileSync(NS, 'utf8'));
  const devIds = new Set(nsJ.rows.development.map((r) => r.id));
  const heldIds = new Set(nsJ.split.heldOut.ids);
  const fIds = store.devRows && Array.isArray(store.devRows.rows) ? store.devRows.rows.map((r) => r[0]) : [];
  for (const id of fIds) if (!devIds.has(id) || heldIds.has(id)) throw new Error('(f) is asked only development ids: ' + id);
  const fRows = fIds.map((id) => { const rec = reader.get(id); return { id, prompt: rec.question, truth: String(I.goldOf(rec)) }; });
  const inducedOnly = P.programStore(STORE, { learned: false });
  const withLearned = P.programStore();
  let uncheckedStore = null, uncheckedCounts = null;
  const checkWas = P.PROGRAM_GUARD.learnedCheck;
  try {
    P.PROGRAM_GUARD.learnedCheck = false;
    P.resetPrograms();
    const c0 = { ...P.PROGRAM_TIER };
    uncheckedStore = P.programStore();
    uncheckedCounts = { learned: P.PROGRAM_TIER.learned - c0.learned, contradicted: P.PROGRAM_TIER.learnedContradicted - c0.learnedContradicted };
  } finally { P.PROGRAM_GUARD.learnedCheck = checkWas; P.resetPrograms(); }
  const checkedCounts = { learned: storeInfo.learnedLoaded, contradicted: storeInfo.learnedContradicted, unchecked: storeInfo.learnedUnchecked, retracted: storeInfo.retracted, retractUnapplied: storeInfo.retractUnapplied };
  const fArm = async (programs) => {
    const out = [];
    for (const r of fRows) {
      const brain = new Brain({ name: 'program-guard', ledger: 'off' });
      let a = null;
      try { a = await P.ask(brain, r.prompt, { provider: 'null', programs }); } catch (e) { a = { from: 'threw', text: String(e && e.message) }; }
      out.push({ id: r.id, truth: r.truth, ...graded(a, r.truth) });
    }
    return out;
  };
  const fInduced = await fArm(inducedOnly);
  const fChecked = await fArm(withLearned);
  const fUnchecked = await fArm(uncheckedStore);
  const wrongSet = (rs) => new Set(rs.filter((r) => r.tier && !r.right).map((r) => r.id));
  const baseWrong = wrongSet(fInduced);
  const added = (rs) => rs.filter((r) => r.tier && !r.right && !baseWrong.has(r.id));
  const fSum = (rs) => ({ asked: rs.length, tier: rs.filter((r) => r.tier).length, right: rs.filter((r) => r.tier && r.right).length, wrong: rs.filter((r) => r.tier && !r.right).length });
  const F = {
    rows: fRows.length, idsSha256: sha(fIds.join('\n')), learnedPresent: storeInfo.learnedPresent,
    induced: fSum(fInduced), checked: { ...fSum(fChecked), loaded: checkedCounts }, control: { ...fSum(fUnchecked), loaded: uncheckedCounts },
    addedWrong: added(fChecked).map((r) => r.id + '=' + r.answer + '/' + r.truth),
    addedWrongControl: added(fUnchecked).map((r) => r.id + '=' + r.answer + '/' + r.truth),
    addedRight: fChecked.filter((r) => r.tier && r.right && !fInduced.find((x) => x.id === r.id && x.tier && x.right)).map((r) => r.id),
  };
  const fLine = (s) => 'tier ' + s.tier + ' right ' + s.right + ' wrong ' + s.wrong;
  say('(f) the learned overlay on the ' + F.rows + ' development rows of the store (devRows, ids sha256 ' + F.idsSha256.slice(0, 16) + '), guard on: induced only ' + fLine(F.induced) + '; with the overlay, development check on (loaded ' + checkedCounts.learned + ', contradicted ' + checkedCounts.contradicted + ', unchecked ' + checkedCounts.unchecked + ', forms retracted ' + checkedCounts.retracted + ', unapplied ' + checkedCounts.retractUnapplied + ') ' + fLine(F.checked) + ', added wrong ' + F.addedWrong.length + (F.addedWrong.length ? ' ' + F.addedWrong.join(', ') : '') + ', added right ' + F.addedRight.length + '; control, check off (loaded ' + uncheckedCounts.learned + ') ' + fLine(F.control) + ', added wrong ' + F.addedWrongControl.length + (F.addedWrongControl.length ? ' ' + F.addedWrongControl.join(', ') : ''));
  // (f) THE CONTROL THAT CAN FAIL (checkpoint 4; the skeptic of board 36: while the learned file loads 0 entries the (f)
  // row above holds for any result). A planted overlay file of one entry at the role level of one development row the
  // induced store does not answer, whose program gives a whole value that is not the row's gold: with the development
  // check off the loader loads it (1) and the row is answered wrong by the tier (added wrong 1, that row); with the
  // check on the loader refuses it (contradicted 1, loaded 0, added wrong 0). The file is removed before the verdict is
  // written and never sits beside the store. The bar row f holds only when the plant moves both ways.
  const fPlant = await (async () => {
    const out = { row: null, program: null, tried: 0, off: null, on: null };
    const byId = new Map((store.devRows && Array.isArray(store.devRows.rows) ? store.devRows.rows : []).map((r) => [String(r[0]), r]));
    const tmp = path.join(os.tmpdir(), 'program-guard-plant-' + process.pid + '.json');
    const wholeNotGold = (v, gold) => Number.isFinite(v) && v > 0 && Math.abs(v - Math.round(v)) < 1e-6 && Math.round(v) !== gold;
    const arm = async (checkOn, id, prompt, truth) => {
      const was = P.PROGRAM_GUARD.learnedCheck;
      try {
        P.PROGRAM_GUARD.learnedCheck = checkOn;
        P.resetPrograms();
        const c0 = { ...P.PROGRAM_TIER };
        const s = P.programStore(STORE, { learned: tmp });
        const loaded = P.PROGRAM_TIER.learned - c0.learned, contradicted = P.PROGRAM_TIER.learnedContradicted - c0.learnedContradicted, refused = P.PROGRAM_TIER.learnedRefused - c0.learnedRefused;
        const brain = new Brain({ name: 'program-guard', ledger: 'off' });
        let a = null;
        try { a = await P.ask(brain, prompt, { provider: 'null', programs: s }); } catch (e) { a = { from: 'threw', text: String(e && e.message) }; }
        const g = graded(a, truth);
        return { loaded, contradicted, refused, tier: !!g.tier, right: !!g.right, answer: g.answer, program: g.program, addedWrong: g.tier && !g.right && !baseWrong.has(id) ? 1 : 0 };
      } finally { P.PROGRAM_GUARD.learnedCheck = was; P.resetPrograms(); }
    };
    try {
      for (const r of fInduced) {
        if (r.tier || out.tried >= 40) continue;
        const row = byId.get(String(r.id));
        if (!row) continue;
        const [id, role, L, gold] = row;
        // the program reads every positional quantity (gate 5 refuses one that does not): their sum, doubled or tripled
        // when the sum is the gold or not whole
        const qs = Object.keys(L).filter((k) => /^q[0-9]+$/.test(k)).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
        if (!qs.length) continue;
        const sumText = qs.slice(1).reduce((t, k) => 'add(' + t + ',' + k + ')', qs[0]);
        const sum = qs.reduce((t, k) => t + L[k], 0);
        let program = null;
        for (const [text, v] of [[sumText, sum], ['add(' + sumText + ',' + sumText + ')', 2 * sum], ['add(add(' + sumText + ',' + sumText + '),' + sumText + ')', 3 * sum]]) if (wholeNotGold(v, gold)) { program = text; break; }
        if (!program) continue;
        out.tried++;
        const entry = { program, records: [String(id)], learned: { inducedFrom: [String(id)], by: 'bench/program-guard.mjs, the (f) control, planted at ' + at }, forms: { roles: [role] } };
        fs.writeFileSync(tmp, JSON.stringify({ at, by: 'bench/program-guard.mjs (f) control (planted, removed after the read, never kept)', levels: { role: { [role]: [entry] } } }));
        const rec = fRows.find((x) => String(x.id) === String(id));
        const off = await arm(false, String(id), rec.prompt, rec.truth);
        if (!(off.tier && !off.right)) continue; // a gate refused the prompt before any program answered: not the row for this plant
        const on = await arm(true, String(id), rec.prompt, rec.truth);
        out.row = String(id); out.program = program; out.off = off; out.on = on;
        break;
      }
    } finally { fs.rmSync(tmp, { force: true }); }
    return out;
  })();
  F.planted = fPlant;
  const fPlantOk = !!(fPlant.row && fPlant.off && fPlant.on && fPlant.off.loaded === 1 && fPlant.off.addedWrong === 1 && fPlant.on.contradicted === 1 && fPlant.on.loaded === 0 && fPlant.on.addedWrong === 0);
  const fPlantLine = fPlant.row ? 'one entry ' + fPlant.program + ' at the role level of development row ' + fPlant.row + ' (rows tried ' + fPlant.tried + '): check off loaded ' + fPlant.off.loaded + ', the tier answered ' + fPlant.off.answer + ' by ' + fPlant.off.program + ', added wrong ' + fPlant.off.addedWrong + '; check on contradicted ' + fPlant.on.contradicted + ', loaded ' + fPlant.on.loaded + ', tier ' + fPlant.on.tier + ', added wrong ' + fPlant.on.addedWrong + (fPlantOk ? ' (the control moves both ways)' : ' (THE CONTROL DOES NOT MOVE)') : 'NO ROW TOOK THE PLANT among ' + fPlant.tried + ' tried (THE CONTROL DOES NOT MOVE)';
  say('(f) the control that can fail, a planted overlay: ' + fPlantLine);
  // (b) beside the store the tier loads (board 36, item learn; printed, not a bar): the must-keep rows with the guard on,
  // as shipped, and the induced store alone (no learned overlay, so no retraction applied)
  const bInduced = [];
  for (const r of sets.b) {
    const brain = new Brain({ name: 'program-guard', ledger: 'off' });
    let a = null;
    try { a = await P.ask(brain, r.prompt, { provider: 'null', programs: inducedOnly }); } catch (e) { a = { from: 'threw', text: String(e && e.message) }; }
    bInduced.push({ id: r.id, ...graded(a, r.truth) });
  }
  const sockets = guard.sockets + guard.fetches - socketsBefore;

  const sum = (rs) => ({ asked: rs.length, tier: rs.filter((r) => r.tier).length, right: rs.filter((r) => r.tier && r.right).length, wrong: rs.filter((r) => r.tier && !r.right).length, routes: tallyFrom(rs) });
  const byKind = (rs) => { const m = {}; for (const r of rs) { const k = r.kind || 'row'; m[k] = m[k] || { asked: 0, tier: 0, wrong: 0 }; m[k].asked++; if (r.tier) { m[k].tier++; if (!r.right) m[k].wrong++; } } return m; };
  const S = {};
  for (const k of Object.keys(arms)) S[k] = { a: sum(arms[k].rows.a), b: sum(arms[k].rows.b), c: sum(arms[k].rows.c), d: sum(arms[k].rows.d), cByKind: byKind(arms[k].rows.c), aByKind: byKind(arms[k].rows.a) };
  const routeLine = (o) => Object.entries(o).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ' ' + v).join(', ');
  for (const k of Object.keys(arms)) {
    const s = S[k], cn = arms[k].counters, sw = arms[k].switches;
    say('arm ' + k + ' (guard ' + (sw.on ? 'on' : 'OFF') + ', kind gate ' + (sw.on && sw.kind ? 'on' : 'off') + ', form gate ' + (sw.on && sw.form ? 'on' : 'off') + ', exact kinds ' + (arms[k].kindsReader ? 'on' : 'unplugged') + '): '
      + '(a) asked ' + s.a.asked + ' answered by the tier ' + s.a.tier + ' wrong ' + s.a.wrong
      + '; (b) asked ' + s.b.asked + ' answered right by the tier ' + s.b.right + ' wrong ' + s.b.wrong
      + '; (c) asked ' + s.c.asked + ' answered by the tier ' + s.c.tier + ' wrong by the tier ' + s.c.wrong
      + '; (d) asked ' + s.d.asked + ' answered by the tier ' + s.d.tier + ' wrong by the tier ' + s.d.wrong
      + '; tier counters: asked ' + cn.asked + ' answered ' + cn.answered + ' kind ' + cn.kind + ' form ' + cn.form + ' unformed ' + cn.unformed + ' missed ' + cn.missed + ' partial ' + cn.partial);
  }
  const G = S['guard.real'], GX = S['guard.exposed'], C = S['control.real'], CX = S['control.exposed'];
  say('(a) must refuse, guard: asked ' + G.a.asked + ', answered by the tier ' + G.a.tier + ', wrong ' + G.a.wrong + ' (exact kinds unplugged: answered by the tier ' + GX.a.tier + ', wrong ' + GX.a.wrong + '); routes ' + routeLine(G.a.routes) + '; refused by kind ' + JSON.stringify(arms['guard.real'].kinds) + ', unplugged ' + JSON.stringify(arms['guard.exposed'].kinds));
  say('(a) must refuse, control (guard off): answered by the tier ' + C.a.tier + ', wrong ' + C.a.wrong + ' (exact kinds unplugged: answered by the tier ' + CX.a.tier + ', wrong ' + CX.a.wrong + ')');
  const before = HELD_WRITTEN.keep;
  const drop = before - G.b.right;
  const dropX = before - GX.b.right;
  say('(b) must keep: before ' + before + ' (the held-out file, answered right by the tier before the guard), control arm now ' + C.b.right + ', after (guard) ' + G.b.right + ', drop ' + drop + ' (exact kinds unplugged: after ' + GX.b.right + ', drop ' + dropX + '; bar: at most ' + BAR.maxKeepDrop + '); routes after ' + routeLine(G.b.routes));
  const lostKeep = arms['guard.real'].rows.b.filter((r) => !(r.tier && r.right)).map((r) => r.id);
  if (lostKeep.length) say('(b) not answered right by the tier after: ' + lostKeep.join(', '));
  const bInducedRight = bInduced.filter((r) => r.tier && r.right).length;
  const bLostToOverlay = bInduced.filter((r) => r.tier && r.right && lostKeep.includes(r.id)).map((r) => r.id);
  say('(b) beside it, the guard on and the induced store alone (no learned overlay, no retraction applied): answered right by the tier ' + bInducedRight + ' of ' + keep.length + ', drop ' + (before - bInducedRight) + '; right there and not with the store the tier loads (the overlay: forms retracted ' + storeInfo.retracted + ') ' + bLostToOverlay.length);
  // (b) WHICH RETRACTION (board 36, item learn, the skeptic's re-run; printed, not a bar): every must-keep row the induced
  // store alone answers is matched to the learned file's retract list by (level, pattern, program, question form), the
  // key gate 7 refuses on. Its control can fail: a row still answered right as shipped must match no retraction (a
  // matcher that matched everything would print it above 0), and the rows lost must all match one for the drop to be
  // the retractions'.
  const learnedJ = (() => { try { return JSON.parse(fs.readFileSync(P.LEARNED_STORE, 'utf8')); } catch { return null; } })();
  const retractList = learnedJ && Array.isArray(learnedJ.retract) ? learnedJ.retract : [];
  const retractOf = (prompt) => {
    let a = null;
    try { a = P.programAnswer(prompt, { provider: 'null', programs: inducedOnly }); } catch { a = null; }
    if (!a || !a.hit) return null;
    const form = I.questionForm(prompt).role;
    return retractList.find((x) => x.level === a.hit.level && x.pattern === a.hit.pattern && x.program === a.hit.program && Array.isArray(x.forms) && x.forms.includes(form)) || null;
  };
  const promptOf = new Map(sets.b.map((r) => [r.id, r.prompt]));
  const keptRightNow = arms['guard.real'].rows.b.filter((r) => r.tier && r.right).map((r) => r.id);
  const bEntries = new Map();
  let bMatched = 0;
  for (const id of bLostToOverlay) {
    const x = retractOf(promptOf.get(id));
    if (!x) continue;
    bMatched++;
    const k = x.level + ' ' + x.pattern + ' ' + x.program;
    const e = bEntries.get(k) || { level: x.level, pattern: x.pattern, program: x.program, forms: x.forms.length, devWrong: x.wrongRows.length, devRight: x.rightRows.length, keepRows: [] };
    e.keepRows.push(id);
    bEntries.set(k, e);
  }
  const bKeptMatched = keptRightNow.filter((id) => retractOf(promptOf.get(id))).length;
  const bRetract = { file: rel(P.LEARNED_STORE), lost: bLostToOverlay.length, matched: bMatched, entries: bEntries.size, devWrong: [...bEntries.values()].reduce((n, e) => n + e.devWrong, 0), devRight: [...bEntries.values()].reduce((n, e) => n + e.devRight, 0), keptRightNow: keptRightNow.length, keptRightNowMatched: bKeptMatched, byEntry: [...bEntries.values()].sort((p, q) => q.keepRows.length - p.keepRows.length) };
  say('(b) the ' + bRetract.lost + ' rows lost to the overlay, each matched to a retraction of ' + bRetract.file + ' by (level, pattern, program, question form): matched ' + bRetract.matched + ' of ' + bRetract.lost + ', in ' + bRetract.entries + ' retraction entries of ' + retractList.length + ', which the self-query saw answer ' + bRetract.devWrong + ' development rows wrong and ' + bRetract.devRight + ' right in their retracted forms; control: rows still answered right as shipped ' + bRetract.keptRightNow + ', matched to a retraction ' + bRetract.keptRightNowMatched);
  const kindLine = (m) => Object.entries(m).map(([k, v]) => k + ' ' + v.asked + '/' + v.tier + '/' + v.wrong).join(', ');
  say('(c) the ' + wrongRows.length + ' wrong rows of ' + rel(MISSES) + ' (' + Object.entries(wrongByKind).map(([k, v]) => k + ' ' + v).join(', ') + '), by kind asked/tier/wrong-by-tier: guard ' + kindLine(G.cByKind) + '; guard unplugged ' + kindLine(GX.cByKind) + '; control ' + kindLine(C.cByKind) + '; control unplugged ' + kindLine(CX.cByKind));
  say('(c) wrong by the tier: guard ' + G.c.wrong + ', guard unplugged ' + GX.c.wrong + ', control ' + C.c.wrong + ', control unplugged ' + CX.c.wrong + '; routes with the guard ' + routeLine(G.c.routes) + '; unplugged ' + routeLine(GX.c.routes));
  const dLine = (rs) => rs.map((r) => r.id + ' ' + r.from + (r.tier ? ' ' + r.answer + ' (' + (r.right ? 'right' : 'WRONG') + ')' : '')).join('; ');
  const dHolds = arms['guard.real'].rows.d.every((r) => !r.tier || r.right) && arms['guard.exposed'].rows.d.every((r) => !r.tier || r.right);
  say('(d) guard: ' + dLine(arms['guard.real'].rows.d) + '; unplugged: ' + dLine(arms['guard.exposed'].rows.d) + '; holds ' + dHolds);
  say('(d) control: ' + dLine(arms['control.real'].rows.d));
  const eHolds = CX.a.wrong > 0 && CX.c.wrong > 0;
  say('(e) control answers wrong: exact kinds unplugged (a) ' + CX.a.wrong + ', (c) ' + CX.c.wrong + '; as shipped (a) ' + C.a.wrong + ', (c) ' + C.c.wrong + '; guard (a) ' + G.a.wrong + ' and ' + GX.a.wrong + ', (c) ' + G.c.wrong + ' and ' + GX.c.wrong + '; holds ' + eHolds);
  const KO = S['kindOnly.exposed'], FO = S['formOnly.exposed'];
  say('each gate alone, exact kinds unplugged: kind only (a) tier ' + KO.a.tier + ' (c) wrong ' + KO.c.wrong + ' (b) right ' + KO.b.right + ' (d) tier ' + KO.d.tier + '; form only (a) tier ' + FO.a.tier + ' (c) wrong ' + FO.c.wrong + ' (b) right ' + FO.b.right + ' (d) tier ' + FO.d.tier);
  say('sockets and fetches attempted: ' + sockets);

  const test = tests ? runTests() : { command: 'node --test ' + TEST_FILE, skipped: true, ok: false, tally: 'skipped (--no-test)' };
  say('tests: ' + test.command + ': ' + test.tally + (test.ok ? '' : ' (NOT PASSED)'));

  const met = {
    a: G.a.tier === 0 && GX.a.tier === 0,
    b: drop <= BAR.maxKeepDrop,
    c: G.c.wrong === 0 && GX.c.wrong === 0 && pinnedMet,
    d: dHolds,
    e: eHolds,
    f: F.addedWrong.length === 0 && F.rows > 0 && fPlantOk,
    split: splitEqual,
    heldOut: held.sameAsWritten && held.drawReproduces,
    sockets: sockets === 0,
    tests: test.ok,
  };
  const barMet = Object.values(met).every(Boolean);
  const wrongPrinted = G.a.wrong + G.c.wrong + G.d.wrong + GX.a.wrong + GX.c.wrong + GX.d.wrong;
  say('BAR ' + (barMet ? 'MET' : 'NOT MET') + ': (a) ' + met.a + ', (b) ' + met.b + ', (c) ' + met.c + ', (d) ' + met.d + ', (e) ' + met.e + ', (f) ' + met.f + ', held out as written ' + met.heldOut + ', sockets 0 ' + met.sockets + ', tests ' + met.tests + '; wrong by the tier with the guard (a+c+d, both exposures) ' + wrongPrinted + '; ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');

  const code = Object.fromEntries(['act/prompt.mjs', 'reason/induce.mjs', 'bench/program-guard.mjs', 'act/solve.mjs', 'act/exact-kinds.mjs'].map((f) => [f, sha(fs.readFileSync(path.join(ROOT, f))).slice(0, 16)]));
  const rowsOf = (k) => arms[k].rows.d;
  const verdict = {
    at, command, isTheBar: true, barMet, met,
    item: 'board 35 program-guard', model: 'off (provider null, in process; sockets and fetch refused and counted)',
    split: {
      development: { rows: keep.length, what: 'the must-keep rows (b): development GSM8K records, fits of ' + rel(STORE) + ' (ids of ' + rel(NS) + ' rows.development); the forms were read from the development records the store fit. ' + (dsp ? 'The rule 7 disclosure (board 36): ' + dsp.wording + ' (devRows.split: in ns.json development ' + dsp.inNsDevelopment + ', in its heldOut ' + dsp.inNsHeldOut + '); ' : 'devRows.split is absent; ') + keepOutsideMath + ' of the ' + keep.length + ' must-keep rows are outside the ' + mathIds.size + ' math.json development ids. Every measure on them, (b) and (f), is development, never held out', ids: keep.map((r) => r.id), devRowsSplit: dsp, keepOutsideMathDevelopment: keepOutsideMath },
      heldOut: { rows: refuse.length, what: 'the must-refuse rows (a), written before the guard code; (c) and (d) are the files named', idsSha256: held.idsSha256, fileSha256: held.fileSha256 },
      contaminated: 'yes, for (a) and (c): the kind cues of act/prompt.mjs gate 6 were written after the held-out file and checked against its must-refuse rows and the misses templates, so they measure the cues on the phrasings they were written beside, not on unseen phrasings; the form gate (7) was not tuned on them, and the per-gate arms print what each refuses alone. (b) is development by construction. (f) is development by construction too: its rows are the devRows index the learned load checks against, so with the check on it measures that the check and the tier agree (the level, the forms, the invariant), and its control (the check off) prints the wrong answers the check refused; neither is a held-out measure.',
    },
    heldOut: { ...held, writtenFirst: HELD_WRITTEN },
    store: storeInfo,
    exposures: 'real: ask() as shipped; exposed: act/solve.mjs kindsReader(false), the nine exact-kind readers unplugged so the tier meets every prompt they would catch',
    a: { guard: G.a, guardExposed: GX.a, control: C.a, controlExposed: CX.a, refusedByKind: arms['guard.real'].kinds, refusedByKindExposed: arms['guard.exposed'].kinds },
    b: { before, controlNow: C.b.right, after: G.b.right, drop, afterExposed: GX.b.right, dropExposed: dropX, maxDrop: BAR.maxKeepDrop, notRightAfter: lostKeep, routesAfter: G.b.routes, inducedAlone: { right: bInducedRight, drop: before - bInducedRight, lostToOverlay: bLostToOverlay }, retractions: bRetract },
    c: { file: rel(MISSES), pinned: { ...MISSES_AT, ok: pinned.ok, bytes: pinned.bytes, error: pinned.error, wrong: pinnedWrong.length, byKind: pinnedByKind, asNamed: pinnedMet }, onDiskNowWrong: nowWrong.length, newerThanPinned: newer.length, rows: wrongRows.length, byKind: wrongByKind, guard: { ...G.c, byKind: G.cByKind }, guardExposed: { ...GX.c, byKind: GX.cByKind }, control: { ...C.c, byKind: C.cByKind }, controlExposed: { ...CX.c, byKind: CX.cByKind } },
    d: { guard: rowsOf('guard.real'), guardExposed: rowsOf('guard.exposed'), control: rowsOf('control.real'), holds: dHolds },
    f: F,
    e: { controlExposedWrongA: CX.a.wrong, controlExposedWrongC: CX.c.wrong, controlWrongA: C.a.wrong, controlWrongC: C.c.wrong, holds: eHolds },
    gatesAlone: { kindOnly: { a: KO.a, b: KO.b, c: KO.c, d: KO.d }, formOnly: { a: FO.a, b: FO.b, c: FO.c, d: FO.d } },
    counters: Object.fromEntries(Object.keys(arms).map((k) => [k, { ...arms[k].counters, kinds: arms[k].kinds }])),
    wrong: wrongPrinted,
    sockets,
    tests: test,
    code,
    ms: Date.now() - t0,
    statement: 'With the guard on, the program tier answered ' + G.a.tier + ' of the ' + G.a.asked + ' must-refuse prompts (' + GX.a.tier + ' with the exact-kind readers unplugged), answered right ' + G.b.right + ' of the ' + keep.length + ' must-keep development problems it answered right before (drop ' + drop + ', the bar allows ' + BAR.maxKeepDrop + (bLostToOverlay.length ? '; the induced store alone, guard on, answered right ' + bInducedRight + ' (drop ' + (before - bInducedRight) + '), and the ' + bRetract.lost + ' rows lost sit in forms the retract list of ' + bRetract.file + ' retracts, which the production loader applies since board 36: matched ' + bRetract.matched + ' of ' + bRetract.lost + ' in ' + bRetract.entries + ' retraction entries that answered ' + bRetract.devWrong + ' development rows wrong and ' + bRetract.devRight + ' right in those forms, and ' + bRetract.keptRightNowMatched + ' of the ' + bRetract.keptRightNow + ' rows still right match one' : '') + '), and answered wrong ' + G.c.wrong + ' of the ' + wrongRows.length + ' wrong rows of the self-queries misses (' + GX.c.wrong + ' unplugged); alg-01, alg-02, alg-04, word-08 and gsm8k.991 went to ' + rowsOf('guard.real').map((r) => r.id + ' ' + r.from).join(', ') + ' (no wrong tier answer, both exposures: ' + dHolds + '). The control arm, the same prompts with the guard off and the exact-kind readers unplugged, answered ' + CX.a.wrong + ' must-refuse prompts and ' + CX.c.wrong + ' misses rows wrong by the tier (as shipped: ' + C.a.wrong + ' and ' + C.c.wrong + ', because the exact readers now answer those prompts first). The learned overlay on the ' + F.rows + ' development rows of the store: induced only wrong ' + F.induced.wrong + ', with the overlay and its development check wrong ' + F.checked.wrong + ' (added wrong ' + F.addedWrong.length + ', added right ' + F.addedRight.length + '), the control with the check off added wrong ' + F.addedWrongControl.length + '. The (f) control that can fail, a planted overlay: ' + fPlantLine + '. The development index split recounted against math.json and ns.json ' + (splitEqual ? 'equals' : 'DIFFERS FROM') + ' the stored descriptor. Sockets attempted ' + sockets + '. Tests: ' + test.tally + '. ' + (barMet ? 'BAR MET.' : 'BAR NOT MET.'),
    printed,
  };
  if (write) fs.writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');
  guard.restore?.();
  return verdict;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const write = !argv.includes('--no-write');
  if (argv.includes('--forms')) {
    await writeForms({ write });
  } else {
    const v = await run({ write, tests: !argv.includes('--no-test') });
    if (write) console.log('verdict: ' + rel(OUT));
    process.exitCode = v.barMet ? 0 : 1;
  }
}
