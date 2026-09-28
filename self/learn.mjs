// self/learn.mjs: THE ORGANISM LEARNS FROM ITS OWN MISTAKES, MODEL OFF (board 35 builder, item self-learn).
//
// Before this file the mistake ledger (self/mistakes.mjs, bench/verdicts/mistakes-ledger.jsonl) was re-asked and printed
// "learned 0": nothing the organism got wrong ever changed what it did next. This is the step that does, and it is
// the whole of it:
//
//   1. THE DEVELOPMENT ROWS. Every ledger row that has a prompt and a gold answer and belongs to a DEVELOPMENT record:
//      a GSM8K id among the 200 bench/verdicts/math.json lists (its question and gold read from the test file ONLY for
//      those ids), then the other ids of those 200 (not ledger rows, development records all the same: every learned
//      program is checked against them), and every row of the GSM8K train split (bench/fixtures/public/gsm8k/train.jsonl,
//      MIT, its line in bench/fixtures/public/SOURCES.md) that bench/verdicts/self-learn-heldout.jsonl does not hold out. Every other
//      ledger row is refused with its reason (REASONS): a GSM8K test record, an ARC row, a row of another source. The
//      records are opened through reason/induce.mjs makeRecordReader, whose spy logs every id opened: a held-out id or a
//      test id outside the 200 opened here is a defect the result prints (opened.heldOut, opened.test must be 0).
//   2. THE SELF-QUERIES. Every development row is asked of the organism as it is (act/prompt.mjs ask(), provider 'null',
//      the kept store bench/verdicts/induce-programs.json as opts.programs, sockets and fetch refused and counted). A row
//      it answers wrong or refuses is ITS OWN MISTAKE on a development record, the train rows included: the train split
//      becomes ledger rows by asking, not by assumption.
//   3. INDUCTION. For every mistake row, reason/induce.mjs search() enumerates the programs of at most MAX_OPS operations
//      over the prompt's numbers that give the gold, and keeps those that read every positional quantity (the tier's
//      gate 5: a program that ignores a quantity is never answered with).
//   4. THE RULE (RULE). A candidate is filed under the row's cue pattern at each level the tier may answer from (a level
//      whose kept development leave-one-out precision is at or above the tier's floor, PROGRAM.floor). It is KEPT only
//      when it FITS at least RULE.others other development rows of the same LESSON (the ledger's shape of the row,
//      self/mistakes.mjs opOf, under the same pattern) and CONTRADICTS NONE of the development rows it could be asked.
//      Fits: the program applied to that row's numbers gives that row's gold. Contradicts: it gives a value the tier's
//      invariant accepts (a positive whole number) that is not the gold. The rows it could be asked are EVERY development
//      row of its pattern, of any lesson, of any question form, whatever answers them first: no gate of the tier is
//      relied on to keep a contradicted row away. A kept entry carries the question forms (reason/induce.mjs
//      questionForm) of the rows it fits, so the tier's gate 7 also refuses a form it never fit.
//   4b. THE SUPPORT GATE (GATE, supportGate). The rule's support is not taken on trust: before anything is kept, the
//      development rows are split in two by a salted hash of the id, the rule is run on one half and the programs it
//      keeps are asked on the other, both ways. A program learned there that answers a row of the other half WRONG is
//      the rule's own out-of-sample wrong answer on development (rule 6: a wrong answer is worse than a refusal). The
//      support rises by one (others 2, 3, 4, ...) until the halves' learned programs answer 0 rows wrong and at least
//      GATE.minRight (60) right: 0 wrong in 60 bounds the wrong rate of what the rule keeps below 5 percent at 95
//      percent (the rule of three). The full run keeps with that support. When the halves keep nothing before such a
//      support is found, NO support is validated and nothing is kept (the retractions still are: they only refuse).
//      learn({ gate: false }) keeps with RULE.others (the control the tests run).
//   5. THE RETRACTIONS (RETRACT). A kept entry of bench/verdicts/induce-programs.json that answered a development row
//      WRONG in the self-query has that row's question form retracted: the organism's own wrong answers are the
//      evidence, and a wrong answer is worse than a refusal (rule 6). The rows it answered right in a retracted form
//      are the cost, listed beside it. mergeStores removes a retracted form from the kept entry's forms.roles, so gate 7
//      refuses that form; the entry is never removed (a later entry never answers where the tier refused before).
//   6. THE STORE. The kept programs go to bench/verdicts/learned-programs.json in the shape the tier's store uses
//      (levels > pattern > ranked entries: program, ops, support, chain, records, chainRecords, tried, forms), each with
//      its provenance (learned: the ids it was induced from, the ids it fit, the lesson, the level and pattern, the rows
//      it was checked against, the date); the retractions go beside them (retract, each with the ids of the wrong and
//      the right rows of its forms). No held-out id and no test id outside the 200 can be in it: learn() throws before
//      it writes one.
//   7. THE SECOND SELF-QUERY. The development rows are asked again with the merged store (mergeStores: the kept store
//      with its retracted forms removed and the learned entries appended after the kept entries of their pattern, the
//      order act/prompt.mjs gives a learned store it loads), and the result prints fixed (a mistake now right), learned
//      (a REFUSAL now right, the mistakes bench's word), withdrawn (a wrong answer now refused), wrong-now (a refusal
//      now wrong: rule 6), lost (a right answer no longer right) and still.
//   8. THE CROSS-VALIDATION (crossValidate, the bench's (e)): the same steps on half the development rows (the support
//      gate included, run inside that half), graded on the other half, both ways: what a learned program and a
//      retraction do on development rows they never saw.
//
// MODEL OFF: no provider, no socket (a socket or a fetch is refused and counted), no model call.
//
//   node self/learn.mjs [--dry] [--limit N] [--json]
//     --dry     learn and print; write nothing
//     --limit N learn from the first N development rows only (ledger rows first, then the other math.json development
//               ids in id order, then the train split in file order)
//     --json    print the result as JSON
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as I from '../reason/induce.mjs';
import { opOf, UNSHAPED } from './mistakes.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'board 35 builder (item self-learn)';
export const FILES = Object.freeze({
  ledger: 'bench/verdicts/mistakes-ledger.jsonl',
  math: 'bench/verdicts/math.json',
  test: 'bench/fixtures/public/gsm8k/test.jsonl',
  train: 'bench/fixtures/public/gsm8k/train.jsonl',
  heldOut: 'bench/verdicts/self-learn-heldout.jsonl',
  kept: 'bench/verdicts/induce-programs.json',
  learned: 'bench/verdicts/learned-programs.json',
});
/** The keep rule. others: the development rows of the same lesson a candidate must fit beside the row it came from. */
export const RULE = Object.freeze({
  others: 2,
  contradictions: 0,
  maxQuantities: I.MAX_OPS + 1,
  programCap: 64,
  what: 'kept only when it fits at least 2 other development rows of the same lesson (ledger shape and cue pattern) and contradicts none of the development rows of its pattern (any lesson, any question form); it carries the question forms of the rows it fits',
});
/** The retraction rule: a kept entry's question form in which the self-query saw it answer at least `wrong` development rows wrong. */
export const RETRACT = Object.freeze({
  wrong: 1,
  what: 'a kept entry (level, pattern, program) has a question form retracted when the self-query saw it answer at least 1 development row of that form wrong; the rows it answered right in that form are the cost, listed; mergeStores removes the form from the entry\'s forms.roles and never removes the entry',
});
/** The support gate: the rule's own out-of-sample wrong answers on development, counted before anything is kept. */
export const GATE = Object.freeze({
  folds: 2,
  salt: 'self-learn support gate',
  wrong: 0,
  minRight: 60,
  what: 'the support the rule asks starts at RULE.others and rises by one; at each, the rule runs on one half of the development rows (a salted sha256 of the id, 2 halves, both ways) and the programs it keeps are asked on the other half. The first support at which they answer 0 rows wrong and at least 60 right (0 wrong in 60 bounds the wrong rate below 5 percent at 95 percent, the rule of three) is the support the full run keeps with; when the halves keep nothing before that, no support is validated and nothing is kept',
});
export const REASONS = Object.freeze({
  test: 'a GSM8K test record: not one of the 200 development ids bench/verdicts/math.json lists, so nothing that learns may read it',
  heldOut: 'a held-out row: bench/verdicts/self-learn-heldout.jsonl lists it, and the learner never opens it',
  arc: 'an ARC row: a grid task, not a prompt with a gold number',
  source: 'not a development record: only GSM8K rows (the math.json development ids or the train split) carry a gold number the learner may read',
  missing: 'the record is not on disk',
  noGold: 'the record has no integer after ####',
});
/** What the self-queries ask: the question and the public bench's instruction line (self/mistakes.mjs promptText). */
export const SUFFIX = '\n\nAnswer with the final number.';
export const ASK_OPTS = Object.freeze({ provider: 'null', k: 5 });

const abs = (root, rel) => (path.isAbsolute(rel) ? rel : path.join(root, rel));
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
const today = (at) => String(at).slice(0, 10);

// ---------------------------------------------------------------- reading
function readJsonl(file) {
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
}
/** The 200 development ids bench/verdicts/math.json lists (records.ids). */
export function developmentIds(root = ROOT) {
  const f = abs(root, FILES.math);
  if (!fs.existsSync(f)) return new Set();
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  return new Set(((j && j.records && j.records.ids) || []).map(String));
}
/** The held-out ids: the id field of each line of bench/verdicts/self-learn-heldout.jsonl, nothing else of it. */
export function heldOutIds(root = ROOT) {
  const rows = readJsonl(abs(root, FILES.heldOut)) || [];
  return new Set(rows.map((r) => String(r.id)));
}
/** The lesson of a row: the ledger's shape when the row carries one, else self/mistakes.mjs opOf on its question. */
export function lessonOf(question, shape = null) {
  if (shape) return shape;
  const o = opOf(question);
  return o ? o.op : UNSHAPED;
}

/**
 * THE DEVELOPMENT ROWS: the ledger's development rows, then the train split's rows not held out.
 * @returns {{rows: object[], refused: object[], opened: object, counts: object}}
 */
export function collect({ root = ROOT, limit = 0 } = {}) {
  const dev = developmentIds(root);
  const held = heldOutIds(root);
  const testFile = abs(root, FILES.test), trainFile = abs(root, FILES.train);
  const testReader = fs.existsSync(testFile) ? I.makeRecordReader(testFile) : null;
  const trainReader = fs.existsSync(trainFile) ? I.makeRecordReader(trainFile, { idOf: (i) => 'gsm8k-train.' + i }) : null;
  const rows = [], refused = [];
  const full = () => limit > 0 && rows.length >= limit;
  const ledger = readJsonl(abs(root, FILES.ledger)) || [];
  const counts = { ledger: ledger.length, ledgerDevelopment: 0, mathDevelopment: 0, train: 0, trainHeldOut: 0, byLimit: 0 };
  const seen = new Set();
  const push = (rec, id, source, extra) => {
    const gold = I.goldOf(rec);
    if (gold === null) { refused.push({ id, source, reason: REASONS.noGold }); return; }
    rows.push({ id, source, question: String(rec.question), gold, answer: String(rec.answer || ''), lesson: lessonOf(rec.question, extra.shape), ledgerWhy: extra.why ?? null });
  };
  for (const r of ledger) {
    const id = String(r.id), source = String(r.source);
    if (source === 'arc') { refused.push({ id, source, reason: REASONS.arc }); continue; }
    if (source !== 'gsm8k') { refused.push({ id, source, reason: REASONS.source }); continue; }
    if (held.has(id)) { refused.push({ id, source, reason: REASONS.heldOut }); continue; }
    if (!dev.has(id)) { refused.push({ id, source, reason: REASONS.test }); continue; }
    if (seen.has(id)) continue;
    if (full()) { counts.byLimit++; continue; }
    const rec = testReader ? testReader.get(id) : null;
    if (!rec) { refused.push({ id, source, reason: REASONS.missing }); continue; }
    seen.add(id);
    counts.ledgerDevelopment++;
    push(rec, id, source, { shape: r.shape && r.shape !== UNSHAPED ? r.shape : null, why: r.why });
  }
  // the other development records bench/verdicts/math.json lists (the 200 the kept store was induced on): development
  // rows too, so a learned program is checked against every one of them and a kept entry's wrong answer there is seen
  if (testReader) {
    for (const id of [...dev].sort((a, b) => Number(a.split('.')[1]) - Number(b.split('.')[1]))) {
      if (seen.has(id) || held.has(id)) continue;
      if (full()) { counts.byLimit++; continue; }
      const rec = testReader.get(id);
      if (!rec) { refused.push({ id, source: 'gsm8k', reason: REASONS.missing }); continue; }
      seen.add(id);
      counts.mathDevelopment++;
      push(rec, id, 'gsm8k', {});
    }
  }
  if (trainReader) {
    const n = fs.readFileSync(trainFile, 'utf8').split(/\r?\n/).length;
    for (let i = 0; i < n; i++) {
      const id = 'gsm8k-train.' + i;
      if (held.has(id)) { counts.trainHeldOut++; continue; }
      if (full()) { counts.byLimit++; continue; }
      const rec = trainReader.get(id);
      if (!rec) continue;
      counts.train++;
      push(rec, id, 'gsm8k-train', {});
    }
  }
  const openedIds = [...(testReader ? testReader.opened : []), ...(trainReader ? trainReader.opened : [])];
  const opened = {
    total: openedIds.length,
    heldOut: openedIds.filter((id) => held.has(id)).length,
    test: (testReader ? testReader.opened : []).filter((id) => !dev.has(id)).length,
  };
  return { rows, refused, opened, counts, developmentIds: dev.size, heldOutIds: held.size };
}

// ---------------------------------------------------------------- the model-off guard
const guard = { sockets: 0, fetches: 0, depth: 0 };
function installGuard() {
  if (guard.depth++ > 0) return;
  guard.connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function refusedConnect() { guard.sockets++; throw new Error('self/learn.mjs runs model off: a socket was refused'); };
  guard.fetch = globalThis.fetch;
  globalThis.fetch = async () => { guard.fetches++; throw new Error('self/learn.mjs runs model off: a fetch was refused'); };
}
function removeGuard() {
  if (--guard.depth > 0) return;
  net.Socket.prototype.connect = guard.connect;
  globalThis.fetch = guard.fetch;
}
/** Sockets and fetches refused since the process started. */
export const socketAttempts = () => guard.sockets + guard.fetches;

// ---------------------------------------------------------------- the self-queries
let GR = null;
async function graders() {
  if (GR) return GR;
  const pub = await import('../bench/public.mjs');
  const con = await import('../bench/conceive.mjs');
  GR = { lastNumber: pub.lastNumber, sameInteger: pub.sameInteger, isNative: con.isNative, WARM: con.WARM };
  return GR;
}
/** Grade one answer text against a gold integer: right, wrong or refused (bench/conceive.mjs isNative is the refusal gate). */
export async function gradeText(text, gold) {
  const G = await graders();
  const t = String(text ?? '');
  if (!G.isNative(t)) return { state: 'refused', got: null };
  const got = G.lastNumber(t);
  return { state: G.sameInteger(got, String(gold)) ? 'right' : 'wrong', got };
}

/**
 * The asker the self-queries use: ask() model off, one fresh seeds/basic.mjs brain (warmed with bench/conceive.mjs WARM
 * on another), opts.programs the store object given. Returns ask(question) -> {text, from, program}.
 */
export async function makeAsker(store) {
  installGuard();
  try {
    const P = await import(pathToFileURL(path.join(ROOT, 'act/prompt.mjs')).href);
    const { seedBasic } = await import(pathToFileURL(path.join(ROOT, 'seeds/basic.mjs')).href);
    const G = await graders();
    const brain = seedBasic({ name: 'self-learn', ledger: 'full', ledgerRing: 4096 });
    const warm = seedBasic({ name: 'self-learn-warm', ledger: 'full', ledgerRing: 4096 });
    for (const q of G.WARM) await P.ask(warm, q, { ...ASK_OPTS, events: [], programs: store });
    const ask = async (prompt) => {
      const a = await P.ask(brain, prompt, { ...ASK_OPTS, events: [], programs: store });
      const pv = (a && a.provenance) || {};
      return { text: a && typeof a.text === 'string' ? a.text : '', from: a ? (a.from ?? (typeof pv === 'string' ? pv : pv.answer ?? null)) : null, program: a && a.program ? { text: a.program.text, level: a.program.level, pattern: a.program.pattern, learned: !!(a.program.learned) } : null };
    };
    return { ask, close: removeGuard, P };
  } catch (e) { removeGuard(); throw e; }
}

/**
 * Ask every row through the organism with one store. askFn(prompt) -> {text, from, program} replaces the default asker
 * (a test's); the default is makeAsker(store).
 * @returns {{states: Map<string, object>, counts: {asked, right, wrong, refused}, ms: number, sockets: number}}
 */
export async function selfQuery(rows, store, { askFn = null, learnedKeys = null } = {}) {
  const t0 = Date.now();
  const s0 = socketAttempts();
  const asker = askFn ? null : await makeAsker(store);
  const ask = askFn || asker.ask;
  const states = new Map();
  const counts = { asked: 0, right: 0, wrong: 0, refused: 0 };
  try {
    for (const r of rows) {
      const a = await ask(r.question + SUFFIX);
      const g = await gradeText(a.text, r.gold);
      counts.asked++;
      counts[g.state]++;
      const learned = !!(a.program && learnedKeys && learnedKeys.has(a.program.level + '|' + a.program.pattern + '|' + a.program.text));
      states.set(r.id, { state: g.state, got: g.got, from: a.from ?? null, program: a.program ?? null, learned });
    }
  } finally { if (asker) asker.close(); }
  return { states, counts, ms: Date.now() - t0, sockets: socketAttempts() - s0 };
}

// ---------------------------------------------------------------- the forms (the program guard's gate 7, when present)
/** The question form the program guard reads (reason/induce.mjs questionForm), or null when the tree has none. */
export function formOf(text) {
  if (typeof I.questionForm !== 'function') return null;
  try { const f = I.questionForm(text); return f && typeof f.role === 'string' ? f.role : null; } catch { return null; }
}

// ---------------------------------------------------------------- induction and the rule
const COMPILED = new Map();
const run = (text, L) => { let f = COMPILED.get(text); if (!f) { f = I.compile(I.readProgram(text)); COMPILED.set(text, f); } return f(L); };

/** A row's parse, patterns, leaf table and question form (computed once), of the text the tier reads: the question and SUFFIX. */
export function prepare(row) {
  if (row.parse) return row;
  row.parse = I.parse(row.question + SUFFIX);
  row.pats = I.patterns(row.parse);
  row.L = I.leafTable(row.parse);
  row.n = row.parse.pos.length;
  row.form = formOf(row.question + SUFFIX);
  return row;
}

/** Candidates of one row: every program search() finds that gives the gold and reads every positional quantity. */
export function candidatesOf(row, { maxLeaves = 12 } = {}) {
  prepare(row);
  if (row.cands && row.cands.maxLeaves === maxLeaves) return row.cands.result; // computed once per row (the cross-validation re-reads it)
  const result = searchCandidates(row, maxLeaves);
  row.cands = { maxLeaves, result };
  return result;
}
function searchCandidates(row, maxLeaves) {
  const n = row.n;
  const leaves = I.leavesOf(row.parse).length;
  if (n < 1 || n > RULE.maxQuantities || leaves > maxLeaves) return { programs: [], searched: false };
  const s = I.search(row.parse, row.gold, { programCap: RULE.programCap, maxLeaves });
  const chain = I.chainNumbers(row.answer);
  const out = [];
  for (const pr of s.programs) {
    const used = I.leafNames(pr.tree);
    let whole = true;
    for (let k = 0; k < n; k++) if (!used.has('q' + k)) { whole = false; break; }
    if (whole) out.push({ text: pr.text, ops: pr.ops, chain: I.followsChain(pr.tree, row.L, chain) });
  }
  return { programs: out, searched: true };
}

/**
 * THE RULE on one candidate within one pattern population. rows: every development row of the pattern (prepared).
 * Returns null (not kept, with why) or the kept entry's evidence.
 * @param {string} program
 * @param {object[]} rows
 * @param {string} lesson the lesson (ledger shape) of the row it was induced from
 * @param {string} invariant the kept store's invariant
 */
export const fitsGold = (v, gold) => Math.abs(v - gold) < 1e-6 * Math.max(1, Math.abs(gold));
export function judge(program, rows, lesson, invariant = 'whole', others = RULE.others) {
  // every row of the pattern, any lesson, any question form: the rows it fits and the rows it contradicts
  const fits = [], contra = [];
  for (const r of rows) {
    const v = run(program, r.L);
    if (!I.acceptable(v, r.L, invariant)) continue;
    if (fitsGold(v, r.gold)) fits.push(r); else contra.push(r);
  }
  const sameLesson = fits.filter((r) => r.lesson === lesson);
  const need = others + 1;
  if (contra.length) return { kept: false, reason: 'contradiction', why: 'contradicts ' + contra.length + ' development row(s) of its pattern (any lesson, any question form: every row the tier could ask it); fits ' + sameLesson.length + ' of its lesson', contra: contra.map((r) => r.id) };
  if (sameLesson.length < need) return { kept: false, reason: 'support', why: 'fits ' + sameLesson.length + ' development row(s) of its lesson, fewer than ' + need + ' (the row it came from and ' + others + ' others)', contra: [] };
  const formsOn = rows.some((r) => r.form !== null && r.form !== undefined);
  const forms = [...new Set(fits.map((r) => r.form).filter((f) => f !== null && f !== undefined))].sort();
  return { kept: true, fits, sameLesson, forms: formsOn ? forms : null, checked: rows.length };
}

/** The levels the tier may answer from: the kept store's development leave-one-out precision at or above the floor. */
export function answerableLevels(kept, floor) {
  const d = (kept && kept.devLoo) || {};
  return I.LEVELS.filter((lv) => d[lv] && Number.isFinite(d[lv].precision) && d[lv].precision >= floor);
}

/**
 * INDUCE AND KEEP. sources: the mistake rows; population: every development row (prepared). Returns the learned levels
 * and the per-candidate tallies.
 */
export function induceAndKeep(sources, population, { levels, invariant = 'whole', at = new Date().toISOString(), others = RULE.others } = {}) {
  const t0 = Date.now();
  for (const r of population) prepare(r);
  const tally = { others, sources: sources.length, searched: 0, withCandidates: 0, candidates: 0, judged: 0, kept: 0, refusedContradiction: 0, refusedSupport: 0, searchMs: 0 };
  // candidates by level and pattern: program -> the source ids it was induced from and its lesson(s)
  const byPat = {};
  for (const lv of levels) byPat[lv] = new Map();
  const s0 = Date.now();
  for (const r of sources) {
    const c = candidatesOf(r);
    if (c.searched) tally.searched++;
    if (!c.programs.length) continue;
    tally.withCandidates++;
    tally.candidates += c.programs.length;
    for (const lv of levels) {
      const pat = r.pats[lv];
      let m = byPat[lv].get(pat);
      if (!m) { m = new Map(); byPat[lv].set(pat, m); }
      for (const p of c.programs) {
        const key = p.text + '\u0000' + r.lesson;
        let e = m.get(key);
        if (!e) { e = { program: p.text, ops: p.ops, lesson: r.lesson, from: [] }; m.set(key, e); }
        e.from.push(r.id);
      }
    }
  }
  tally.searchMs = Date.now() - s0;
  // the population by level and pattern
  const popBy = {};
  for (const lv of levels) {
    popBy[lv] = new Map();
    for (const r of population) { const k = r.pats[lv]; let a = popBy[lv].get(k); if (!a) { a = []; popBy[lv].set(k, a); } a.push(r); }
  }
  const learned = {};
  for (const lv of I.LEVELS) learned[lv] = {};
  for (const lv of levels) {
    for (const [pat, m] of byPat[lv]) {
      const rows = popBy[lv].get(pat) || [];
      const list = [];
      for (const e of m.values()) {
        tally.judged++;
        const j = judge(e.program, rows, e.lesson, invariant, others);
        if (!j.kept) { if (j.reason === 'contradiction') tally.refusedContradiction++; else tally.refusedSupport++; continue; }
        const tree = I.readProgram(e.program);
        const chainRecords = [];
        for (const r of j.fits) if (I.followsChain(tree, r.L, I.chainNumbers(r.answer))) chainRecords.push(r.id);
        const entry = {
          program: e.program, ops: e.ops, support: j.fits.length, chain: chainRecords.length,
          records: j.fits.map((r) => r.id), chainRecords, tried: j.fits.length,
          learned: {
            inducedFrom: [...new Set(e.from)], lesson: e.lesson, level: lv, pattern: pat, fitsLesson: j.sameLesson.length,
            checkedRows: j.checked, contradictions: 0, date: today(at), at, by: AUTHOR,
          },
        };
        if (j.forms) entry.forms = { roles: j.forms };
        list.push(entry);
      }
      if (!list.length) continue;
      // one entry per set of rows fit: the fewest operations, then the most rows following the worked chain, then the text
      list.sort((a, b) => b.support - a.support || a.ops - b.ops || b.chain - a.chain || (a.program < b.program ? -1 : a.program > b.program ? 1 : 0));
      const seenFits = new Set();
      const out = [];
      for (const e of list) { const k = e.records.slice().sort().join(','); if (seenFits.has(k)) continue; seenFits.add(k); out.push(e); }
      learned[lv][pat] = out;
      tally.kept += out.length;
    }
  }
  tally.ms = Date.now() - t0;
  return { learned, tally };
}

/**
 * Induce and keep with the gate's support; a null support (none validated) keeps nothing, and the tally counts the
 * entries the rule at RULE.others would have kept as refusedGate.
 */
export function keepByGate(g, sources, population, opts = {}) {
  const res = induceAndKeep(sources, population, { ...opts, others: g.others === null ? RULE.others : g.others });
  if (g.others !== null) return res;
  let n = 0;
  for (const lv of I.LEVELS) for (const l of Object.values(res.learned[lv])) n += l.length;
  const learned = {};
  for (const lv of I.LEVELS) learned[lv] = {};
  return { learned, tally: { ...res.tally, others: null, kept: 0, refusedGate: n } };
}

// ---------------------------------------------------------------- the retractions
/**
 * THE RETRACTIONS from a self-query with the kept store: per kept entry (level, pattern, program), the question forms in
 * which it answered at least RETRACT.wrong development rows wrong, with the ids of the wrong rows and of the rows it
 * answered right in those forms (the cost). rows: prepared development rows; states: id -> the self-query's state.
 * A row answered by another tier (no program) or by a learned entry is not the kept store's answer and is not read.
 * @returns {object[]} sorted by wrong rows, most first
 */
export function retractionsOf(rows, states) {
  const byForm = new Map();
  for (const r of rows) {
    const s = states.get(r.id);
    if (!s || !s.program || s.learned || (s.state !== 'right' && s.state !== 'wrong')) continue;
    prepare(r);
    if (r.form === null || r.form === undefined) continue;
    const k = s.program.level + '\u0000' + s.program.pattern + '\u0000' + s.program.text + '\u0000' + r.form;
    let g = byForm.get(k);
    if (!g) { g = { level: s.program.level, pattern: s.program.pattern, program: s.program.text, form: r.form, wrong: [], right: [] }; byForm.set(k, g); }
    g[s.state].push(r.id);
  }
  const byEntry = new Map();
  for (const g of byForm.values()) {
    if (g.wrong.length < RETRACT.wrong) continue;
    const k = g.level + '\u0000' + g.pattern + '\u0000' + g.program;
    let e = byEntry.get(k);
    if (!e) { e = { level: g.level, pattern: g.pattern, program: g.program, forms: [], wrongRows: [], rightRows: [] }; byEntry.set(k, e); }
    e.forms.push(g.form);
    e.wrongRows.push(...g.wrong);
    e.rightRows.push(...g.right);
  }
  const out = [...byEntry.values()];
  for (const e of out) { e.forms.sort(); e.wrongRows.sort(); e.rightRows.sort(); }
  out.sort((a, b) => b.wrongRows.length - a.wrongRows.length || (a.level + a.pattern + a.program < b.level + b.pattern + b.program ? -1 : 1));
  return out;
}

// ---------------------------------------------------------------- the merged store
/**
 * The kept store with its retracted forms removed (learned.retract: each form leaves the matching kept entry's
 * forms.roles; the entry stays, so gate 7 refuses that form and no later entry answers in its place) and the learned
 * entries appended after the kept entries of their pattern (a program already under that pattern is not added twice),
 * each marked learned: the order act/prompt.mjs gives a learned store it loads beside the default one. Neither input is
 * changed. out.merged counts added, retracted (forms removed) and unapplied (a retraction whose entry or forms list the
 * kept store does not hold).
 */
export function mergeStores(kept, learned) {
  const out = JSON.parse(JSON.stringify(kept));
  if (!out.levels || typeof out.levels !== 'object') out.levels = {};
  let added = 0, retracted = 0, unapplied = 0;
  for (const x of (learned && Array.isArray(learned.retract) ? learned.retract : [])) {
    const list = out.levels[x.level] && out.levels[x.level][x.pattern];
    const e = Array.isArray(list) ? list.find((y) => y.program === x.program) : null;
    if (!e || !e.forms || !Array.isArray(e.forms.roles) || !Array.isArray(x.forms)) { unapplied++; continue; }
    const had = e.forms.roles.length;
    e.forms = { ...e.forms, roles: e.forms.roles.filter((f) => !x.forms.includes(f)), retracted: [...new Set([...(e.forms.retracted || []), ...x.forms])].sort() };
    retracted += had - e.forms.roles.length;
  }
  for (const lv of I.LEVELS) {
    const pats = learned && learned.levels && learned.levels[lv];
    if (!pats) continue;
    const into = out.levels[lv] && typeof out.levels[lv] === 'object' ? out.levels[lv] : (out.levels[lv] = {});
    for (const [pat, list] of Object.entries(pats)) {
      if (!Array.isArray(list)) continue;
      const arr = Array.isArray(into[pat]) ? into[pat] : (into[pat] = []);
      for (const e of list) {
        if (!e || !Array.isArray(e.records) || !e.records.length) continue;
        if (arr.some((x) => x.program === e.program)) continue;
        arr.push({ ...e, learned: e.learned || true });
        added++;
      }
    }
  }
  out.merged = { kept: kept && kept.at ? kept.at : null, learned: learned && learned.at ? learned.at : null, added, retracted, unapplied };
  return out;
}

/** The level|pattern|program keys of the learned entries a merge adds to kept (a program kept already holds is not one). */
export function learnedKeysOf(kept, learned) {
  const keys = new Set();
  for (const lv of I.LEVELS) {
    for (const [pat, list] of Object.entries((learned && learned.levels && learned.levels[lv]) || {})) {
      const had = (kept && kept.levels && kept.levels[lv] && kept.levels[lv][pat]) || [];
      for (const e of list || []) if (!had.some((x) => x.program === e.program)) keys.add(lv + '|' + pat + '|' + e.program);
    }
  }
  return keys;
}

/** Every record id the learned store names in its provenance (records, chainRecords, inducedFrom). */
export function provenanceIds(store) {
  const ids = new Set();
  for (const lv of Object.keys((store && store.levels) || {})) {
    for (const list of Object.values(store.levels[lv] || {})) {
      for (const e of list || []) {
        for (const k of ['records', 'chainRecords']) for (const id of e[k] || []) ids.add(String(id));
        for (const id of (e.learned && e.learned.inducedFrom) || []) ids.add(String(id));
      }
    }
  }
  for (const x of (store && Array.isArray(store.retract) ? store.retract : [])) for (const k of ['wrongRows', 'rightRows']) for (const id of x[k] || []) ids.add(String(id));
  for (const t of (store && store.gate && Array.isArray(store.gate.tried) ? store.gate.tried : [])) for (const id of t.wrongRows || []) ids.add(String(id));
  return ids;
}

// ---------------------------------------------------------------- the step
/** Before and after for one row: fixed (a wrong now right), learned (a refusal now right), withdrawn (a wrong now refused), wrong-now, still, kept-right, lost. */
export function outcomeOf(before, after) {
  if (before === 'right') return after === 'right' ? 'kept-right' : 'lost';
  if (after === 'right') return before === 'refused' ? 'learned' : 'fixed';
  if (after === 'wrong') return before === 'refused' ? 'wrong-now' : 'still';
  return before === 'wrong' ? 'withdrawn' : 'refused';
}

/**
 * THE STEP. Collect the development rows, ask them, induce from the mistakes, keep by the rule, retract the kept forms
 * that answered wrong, write the store (not when dry), ask them again with the merged store.
 * @param {{root?: string, dry?: boolean, limit?: number, askFn?: Function, log?: Function, at?: string}} [opts]
 *   askFn(store) -> ask(prompt): a test's asker factory, in place of act/prompt.mjs ask()
 */
export async function learn({ root = ROOT, dry = false, limit = 0, askFn = null, log = null, at = new Date().toISOString(), floor = null, gate = true } = {}) {
  const say = typeof log === 'function' ? log : () => {};
  const t0 = Date.now();
  const keptFile = abs(root, FILES.kept);
  const kept = fs.existsSync(keptFile) ? JSON.parse(fs.readFileSync(keptFile, 'utf8')) : { levels: {} };
  const c = collect({ root, limit });
  say(`rows: ledger ${c.counts.ledger} (development ${c.counts.ledgerDevelopment}, refused ${c.refused.length}), the other math.json development ids ${c.counts.mathDevelopment}, train ${c.counts.train} (held out ${c.counts.trainHeldOut} never opened), by limit ${c.counts.byLimit}; opened ${c.opened.total}, held-out ids among them ${c.opened.heldOut}, test ids outside the 200 ${c.opened.test}`);
  if (c.opened.heldOut || c.opened.test) throw new Error('self/learn.mjs opened a held-out or test record: held-out ' + c.opened.heldOut + ', test ' + c.opened.test);
  let F = floor;
  if (F === null) { const P = await import(pathToFileURL(path.join(ROOT, 'act/prompt.mjs')).href); F = P.PROGRAM.floor; }
  const levels = answerableLevels(kept, F);
  const mk = (store) => (askFn ? askFn(store) : null);
  for (const r of c.rows) prepare(r);
  // the self-queries, before
  const before = await selfQuery(c.rows, kept, { askFn: mk(kept) });
  say(`self-query before (the kept store): asked ${before.counts.asked}, right ${before.counts.right}, wrong ${before.counts.wrong}, refused ${before.counts.refused}; sockets ${before.sockets}; ${before.ms} ms`);
  const mistakes = c.rows.filter((r) => before.states.get(r.id).state !== 'right');
  // the support gate, then induce and keep with its support, then the retractions
  const g = gate ? await supportGate({ rows: c.rows, states: before.states, kept, levels, askFn, invariant: kept.invariant || 'whole', at }) : { others: RULE.others, tried: [], ms: 0, off: true };
  say(g.off ? 'support gate: off (the control), support ' + RULE.others + ' others' : 'support gate (0 wrong and at least ' + GATE.minRight + ' right on the other halves): ' + g.tried.map((t) => 'others ' + t.others + ' kept ' + t.entries + ' entries on the halves, asked ' + t.asked + ', learned right ' + t.right + ', wrong ' + t.wrong).join('; ') + '; ' + (g.others === null ? 'no support validated: nothing is kept' : 'the rule keeps with ' + g.others + ' others') + ' (' + g.ms + ' ms)');
  const res = keepByGate(g, mistakes, c.rows, { levels, invariant: kept.invariant || 'whole', at });
  const retract = retractionsOf(c.rows, before.states).map((x) => ({ ...x, date: today(at), by: AUTHOR }));
  const heldSet = heldOutIds(root), devSet = developmentIds(root);
  const store = {
    at, command: 'node self/learn.mjs' + (limit ? ' --limit ' + limit : ''), author: AUTHOR,
    what: 'programs the organism learned from its own mistakes on development GSM8K records (self/learn.mjs): induced from a row it answered wrong or refused, kept only when it fits at least as many other development rows as the support gate validated (2 or more; nothing is kept when it validates none) of the same lesson, and contradicts none of the development rows of its pattern; and the question forms retracted from kept entries of bench/verdicts/induce-programs.json that answered a development row wrong (retract). An overlay of bench/verdicts/induce-programs.json: its retracted forms removed, then the learned entries appended after its entries (self/learn.mjs mergeStores)',
    dsl: kept.dsl || null, maxOps: I.MAX_OPS, version: 2,
    minSupport: g.others === null ? null : g.others + 1, keepBy: 'support', rankBy: 'support', invariant: kept.invariant || 'whole',
    rule: RULE, retractRule: RETRACT, levelsAnswerable: levels, floor: F,
    gate: { rule: GATE, on: !g.off, others: g.others, tried: g.tried },
    development: {
      ledger: FILES.ledger, ledgerRows: c.counts.ledger, ledgerDevelopment: c.counts.ledgerDevelopment, mathDevelopment: c.counts.mathDevelopment,
      train: FILES.train, trainRows: c.counts.train, heldOut: FILES.heldOut, heldOutIds: c.heldOutIds,
      rows: c.rows.length, mistakes: mistakes.length, idsSha256: sha256(c.rows.map((r) => r.id).join('\n')),
    },
    levels: res.learned,
    retract,
    programs: 0, patterns: 0,
  };
  const distinct = new Set();
  for (const lv of I.LEVELS) for (const list of Object.values(store.levels[lv])) { store.patterns++; for (const e of list) distinct.add(e.program); }
  store.programs = distinct.size;
  // the provenance check, before any write
  const prov = provenanceIds(store);
  const leakHeld = [...prov].filter((id) => heldSet.has(id));
  const leakTest = [...prov].filter((id) => /^gsm8k\.\d+$/.test(id) && !devSet.has(id));
  if (leakHeld.length || leakTest.length) throw new Error('self/learn.mjs would write a held-out or test id into its provenance: ' + [...leakHeld, ...leakTest].slice(0, 5).join(', '));
  const text = JSON.stringify(store) + '\n';
  const outFile = abs(root, FILES.learned);
  if (!dry) fs.writeFileSync(outFile, text);
  const rt = { entries: retract.length, forms: retract.reduce((n, x) => n + x.forms.length, 0), wrongRows: retract.reduce((n, x) => n + x.wrongRows.length, 0), rightRows: retract.reduce((n, x) => n + x.rightRows.length, 0) };
  say(`learned: ${store.programs} programs under ${store.patterns} patterns (levels ${levels.join(', ')}), from ${mistakes.length} mistakes (${res.tally.withCandidates} with a candidate, ${res.tally.candidates} candidates, ${res.tally.judged} judged, refused ${res.tally.refusedContradiction} for a contradiction and ${res.tally.refusedSupport} for support${res.tally.refusedGate !== undefined ? ', and ' + res.tally.refusedGate + ' entries the rule keeps at ' + RULE.others + ' others refused by the gate' : ''}); retracted ${rt.forms} question forms of ${rt.entries} kept entries on ${rt.wrongRows} wrong development answers (the cost: ${rt.rightRows} right answers in those forms); ${dry ? 'dry: nothing written' : FILES.learned + ' written (' + Buffer.byteLength(text) + ' bytes)'}`);
  // the self-queries, after: the merged store
  const merged = mergeStores(kept, store);
  const learnedKeys = learnedKeysOf(kept, store);
  const after = await selfQuery(c.rows, merged, { askFn: mk(merged), learnedKeys });
  const outcomes = {};
  const learnedAnswered = { right: 0, wrong: 0 };
  for (const r of c.rows) {
    const b = before.states.get(r.id).state, a = after.states.get(r.id);
    const o = outcomeOf(b, a.state);
    outcomes[o] = (outcomes[o] || 0) + 1;
    if (a.learned) learnedAnswered[a.state === 'right' ? 'right' : 'wrong']++;
  }
  say(`self-query after (the merged store, ${merged.merged.added} learned entries added, ${merged.merged.retracted} forms retracted, ${merged.merged.unapplied} retractions unapplied): right ${after.counts.right}, wrong ${after.counts.wrong}, refused ${after.counts.refused}; outcomes ${Object.entries(outcomes).sort().map(([k, v]) => k + ' ' + v).join(', ')}; answered by a learned program: right ${learnedAnswered.right}, wrong ${learnedAnswered.wrong}; sockets ${after.sockets}`);
  const byLevel = {}, byLesson = {};
  for (const lv of I.LEVELS) for (const list of Object.values(store.levels[lv])) for (const e of list) { byLevel[lv] = (byLevel[lv] || 0) + 1; byLesson[e.learned.lesson] = (byLesson[e.learned.lesson] || 0) + 1; }
  return {
    at, dry, root, file: dry ? null : FILES.learned, bytes: Buffer.byteLength(text), sha256: sha256(text),
    rows: c.rows.length, counts: c.counts, refused: c.refused, refusedByReason: tallyBy(c.refused, 'reason'), opened: c.opened,
    levels, floor: F, mistakes: mistakes.length, tally: res.tally,
    programs: store.programs, patterns: store.patterns, byLevel, byLesson,
    inducedFrom: [...new Set(Object.values(store.levels).flatMap((o) => Object.values(o).flatMap((l) => l.flatMap((e) => e.learned.inducedFrom))))].length,
    retracted: rt, mergedCounts: merged.merged, gate: { on: !g.off, others: g.others, tried: g.tried, ms: g.ms },
    before: before.counts, after: after.counts, outcomes, learnedAnswered,
    sockets: before.sockets + after.sockets, ms: Date.now() - t0,
    store, merged, keptStore: kept, population: c.rows, beforeStates: before.states,
  };
}

/** The fold of a development row: the first byte of the sha256 of its id (after the salt, when one is given), modulo the folds. */
export const foldOf = (id, folds = 2, salt = '') => parseInt(sha256(salt ? salt + '\u0000' + String(id) : String(id)).slice(0, 2), 16) % folds;

/**
 * THE SUPPORT GATE (GATE). rows: prepared development rows; states: id -> the kept store's self-query state. For others
 * = RULE.others, RULE.others + 1, ...: on each half (foldOf with the salt), the rule keeps from the other half's
 * mistakes (retractions included, as the merge applies them), and the half's rows a learned entry could answer are
 * asked with that merged store. The first support at which the learned entries answer GATE.wrong (0) rows wrong and at
 * least GATE.minRight rows right is returned as others; when the halves keep no entry first, others is null (no
 * support is validated). Every support tried is listed: its entries, the rows asked, right, wrong and the wrong rows'
 * ids. It always ends: a support above every pattern's rows keeps nothing.
 * @returns {Promise<{others: number|null, tried: object[], ms: number}>}
 */
export async function supportGate({ rows, states, kept, levels, askFn = null, invariant = 'whole', at = new Date().toISOString(), folds = GATE.folds, salt = GATE.salt }) {
  const t0 = Date.now();
  for (const r of rows) prepare(r);
  const halves = [];
  for (let f = 0; f < folds; f++) halves.push({ A: rows.filter((r) => foldOf(r.id, folds, salt) !== f), B: rows.filter((r) => foldOf(r.id, folds, salt) === f) });
  const tried = [];
  for (let others = RULE.others; ; others++) {
    const t = { others, entries: 0, asked: 0, right: 0, wrong: 0, wrongRows: [] };
    for (const { A, B } of halves) {
      const res = induceAndKeep(A.filter((r) => states.get(r.id).state !== 'right'), A, { levels, invariant, at, others });
      let n = 0;
      for (const lv of I.LEVELS) for (const l of Object.values(res.learned[lv])) n += l.length;
      t.entries += n;
      if (!n) continue;
      const store = { at, levels: res.learned, retract: retractionsOf(A, states) };
      const ask = B.filter((r) => levels.some((lv) => res.learned[lv][r.pats[lv]]));
      if (!ask.length) continue;
      const merged = mergeStores(kept, store);
      const q = await selfQuery(ask, merged, { askFn: askFn ? askFn(merged) : null, learnedKeys: learnedKeysOf(kept, store) });
      t.asked += ask.length;
      for (const r of ask) {
        const a = q.states.get(r.id);
        if (!a.learned) continue;
        if (a.state === 'right') t.right++;
        else if (a.state === 'wrong') { t.wrong++; t.wrongRows.push(r.id); }
      }
    }
    t.wrongRows.sort();
    tried.push(t);
    if (t.wrong <= GATE.wrong && t.right >= GATE.minRight) return { others, tried, ms: Date.now() - t0 };
    if (!t.entries || others > rows.length) return { others: null, tried, ms: Date.now() - t0 };
  }
}

/**
 * THE CROSS-VALIDATION, development rows only: for each fold, the learner's steps (the support gate, run inside the
 * other folds with its own salt, then induce and keep, the retractions) on
 * the other folds' rows and their kept-store states, then the fold's rows asked with that merged store and graded
 * against their kept-store states. Also the ceiling of any selection rule over the same store shape: the fold's rows
 * that some candidate of an other-fold row of the same role pattern (the question form: a cue entry answers only its
 * forms) answers right.
 * @param {{rows: object[], states: Map, kept: object, levels: string[], folds?: number, askFn?: Function, invariant?: string}} o
 */
export async function crossValidate({ rows, states, kept, levels, folds = 2, askFn = null, invariant = 'whole', at = new Date().toISOString(), gate = true }) {
  const t0 = Date.now();
  const tot = { folds, rows: 0, keptRight: 0, keptWrong: 0, mergedRight: 0, mergedWrong: 0, learnedRight: 0, learnedWrong: 0, fixed: 0, learned: 0, withdrawn: 0, wrongNow: 0, lost: 0, learnedEntries: 0, retractedForms: 0, ceiling: 0, others: [] };
  for (const r of rows) prepare(r);
  for (let f = 0; f < folds; f++) {
    const A = rows.filter((r) => foldOf(r.id, folds) !== f), B = rows.filter((r) => foldOf(r.id, folds) === f);
    const mistakes = A.filter((r) => states.get(r.id).state !== 'right');
    const g = gate ? await supportGate({ rows: A, states, kept, levels, askFn, invariant, at, salt: GATE.salt + ' ' + f }) : { others: RULE.others };
    tot.others.push(g.others);
    const res = keepByGate(g, mistakes, A, { levels, invariant, at });
    const store = { at, levels: res.learned, retract: retractionsOf(A, states) };
    for (const lv of I.LEVELS) for (const l of Object.values(store.levels[lv])) tot.learnedEntries += l.length;
    const merged = mergeStores(kept, store);
    tot.retractedForms += merged.merged.retracted;
    const q = await selfQuery(B, merged, { askFn: askFn ? askFn(merged) : null, learnedKeys: learnedKeysOf(kept, store) });
    // the ceiling: every other-fold row's candidates, by role pattern
    const byRole = new Map();
    for (const r of A) { const s = byRole.get(r.pats.role) || byRole.set(r.pats.role, new Set()).get(r.pats.role); for (const p of candidatesOf(r).programs) s.add(p.text); }
    for (const r of B) {
      const b = states.get(r.id).state, a = q.states.get(r.id);
      tot.rows++;
      if (b === 'right') tot.keptRight++;
      if (b === 'wrong') tot.keptWrong++;
      if (a.state === 'right') tot.mergedRight++;
      if (a.state === 'wrong') tot.mergedWrong++;
      if (a.learned) { if (a.state === 'right') tot.learnedRight++; else if (a.state === 'wrong') tot.learnedWrong++; }
      const o = outcomeOf(b, a.state);
      if (o === 'fixed') tot.fixed++; else if (o === 'learned') tot.learned++; else if (o === 'withdrawn') tot.withdrawn++; else if (o === 'wrong-now') tot.wrongNow++; else if (o === 'lost') tot.lost++;
      const s = byRole.get(r.pats.role);
      if (s && [...s].some((p) => { const v = run(p, r.L); return I.acceptable(v, r.L, invariant) && fitsGold(v, r.gold); })) tot.ceiling++;
    }
  }
  tot.ms = Date.now() - t0;
  return tot;
}
function tallyBy(xs, k) { const o = {}; for (const x of xs) o[x[k]] = (o[x[k]] || 0) + 1; return o; }

// ---------------------------------------------------------------- CLI
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const dry = argv.includes('--dry');
  const json = argv.includes('--json');
  const li = argv.indexOf('--limit');
  const limit = li >= 0 ? Math.max(0, parseInt(argv[li + 1], 10) || 0) : 0;
  const r = await learn({ dry, limit, log: json ? null : (s) => console.log('LEARN ' + s) });
  if (json) { const { store, merged, keptStore, population, beforeStates, ...rest } = r; console.log(JSON.stringify(rest, null, 1)); }
}
