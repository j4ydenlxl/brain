#!/usr/bin/env node
// grow/teach.mjs: THE TEACHER (grow/NEO.md, "Self-opened tasks"): the part that lets the organism open new tasks by itself.
// His words (2026-10-01, verbatim at the head of NEO.md): "being a pro at everything", "every gap in my vision can be
// filled by the octopus being itself", "u are to build something that allows it to generate thousands of cells for a task".
// neo/syllabus.jsonl is the list of things to become good at, and it grows itself. frontier turns its next skills (in
// syllabus order, which the seed keeps round-robin across domains) into TEACHER BRIEFS: one teacher arm (a model) per brief
// writes one task per skill, dev and held-out rows whose answer is a function of the prompt, so the NEO engine
// (grow/neo.mjs) can learn them from examples with no model call, plus next.jsonl, the skills it saw the syllabus lacks.
// intake validates what the arms wrote, refuses a task the organism already answers, moves each valid task to
// neo/tasks/<task>/, freezes its two sets in neo/LEDGER.json (sha256, CRLF read as LF; append only) and appends the new
// skills to the syllabus (deduplicated, SKILL_CAP a generation, the cap printed when it binds). status counts.
// No model call anywhere here. It never opens judge/heldout/, judge/control.jsonl, state/ or any neo/tasks/*/heldout.jsonl
// (after intake only grow/neo.mjs SELECT reads one); the locked class names come from judge/dev/ by NAME.
// Success prints ONE JSON line; a failure one stderr line and a non-zero exit (2: usage); check that finds errors prints
// its JSON line and exits 1.
//   node grow/teach.mjs frontier [--gen <n>] [--k <briefs>] [--per <skills>]   [--root <dir>] on every verb
//   node grow/teach.mjs intake [--gen <n>] [--knowledge <dir>|none]
//   node grow/teach.mjs check <taskDir> [--gen <n>]      an arm's own check: intake's offline rules, no organism, no move
//   node grow/teach.mjs status
// Author: Opus 5.5 builder (the teacher) for the Fable 5.1 orchestrator, 2026-10-01, his NEO order.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REFUSAL_RE, FORBIDDEN } from './contract.mjs';
import { conciseDirective, nextGeneration, redact, DEFAULT_ROOT, CLASS_RE } from './generation.mjs';
import { CLAUSES, expectErrors, expectFailures, expectOk } from '../judge/judge.mjs';

/** A task (and a skill) name. */
export const TASK_RE = /^[a-z0-9][a-z0-9-]{2,40}$/;
export const SYLLABUS = 'neo/syllabus.jsonl';
export const LEDGER = 'neo/LEDGER.json';
export const TASKS_DIR = 'neo/tasks';
/** What intake moves; anything else of a task directory (next.jsonl, notes) stays in work/. */
export const TASK_FILES = Object.freeze(['task.json', 'dev.jsonl', 'heldout.jsonl']);
export const MIN_ROWS = Object.freeze({ dev: 20, heldout: 10 });
/** What a brief asks of an arm for each skill. */
export const BRIEF_ROWS = Object.freeze({ dev: 40, heldout: 20, next: 5 });
/** New syllabus skills a generation may add. */
export const SKILL_CAP = 40;
export const DEFAULTS = Object.freeze({ k: 8, per: 5 });
export const LIMITS = Object.freeze({ k: 64, per: 40 });
export const ALREADY = 'the organism already answers it';
export const OPENED_MARK = 'opened.json';
export const REFUSED_MARK = 'refused.json';
const MAX_WHY = 12;
export const USAGE = [
  'usage: node grow/teach.mjs <verb> [flags]   (--root <dir>: another tree root)',
  '  frontier [--gen <n>] [--k ' + DEFAULTS.k + '] [--per ' + DEFAULTS.per + ']   teacher briefs for the next skills of ' + SYLLABUS,
  '  intake [--gen <n>] [--knowledge <dir>|none]         validate, move to ' + TASKS_DIR + '/, append ' + LEDGER + ' and the syllabus',
  '  check <taskDir> [--gen <n>]                        intake\'s offline rules on one task directory (an arm\'s own check)',
  '  status                                             { syllabus, opened, pending, tasks }',
].join('\n');

class Fail extends Error { constructor(line, code = 1) { super(line); this.code = code; } }

// ---- helpers
const posix = (p) => p.split(path.sep).join('/');
const relOf = (root, p) => posix(path.relative(root, p));
const first = (e) => String((e && e.message) || e).split('\n')[0];
const isObj = (o) => Boolean(o) && typeof o === 'object' && !Array.isArray(o);
const words = (s) => typeof s === 'string' && s.trim().length > 0;
const writeJson = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n'); };
const readJson = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const round4 = (x) => Math.round(x * 1e4) / 1e4;
const teachDirOf = (root, n) => path.join(root, 'work', 'grow', 'gen-' + n, 'teach');
/** The non-blank lines of a JSONL text, each [lineNumber, trimmedText]. */
const linesOf = (text) => String(text ?? '').split(/\r?\n/).map((s, i) => [i + 1, s.trim()]).filter(([, s]) => s);
const cut = (why) => (why.length > MAX_WHY ? [...why.slice(0, MAX_WHY), '... and ' + (why.length - MAX_WHY) + ' more'] : why);

/** norm level 1 (the overlap rule): lower case, every character but a letter, a digit or a space removed, runs of spaces collapsed, trimmed. */
export const normQ = (q) => String(q ?? '').toLowerCase().replace(/\s/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').replace(/ +/g, ' ').trim();
/** sha256 hex of a text, CRLF read as LF (the ledger's freeze; judge/verify.mjs reads its files the same way). */
export const shaText = (t) => createHash('sha256').update(String(t).replace(/\r\n/g, '\n')).digest('hex');
/** sha256 hex of a file, CRLF read as LF. */
export const shaFile = (f) => shaText(fs.readFileSync(f, 'utf8'));

/** The locked classes: the basenames of judge/dev/*.jsonl, read by NAME (no file is opened). */
export function lockedClasses(root) {
  try { return fs.readdirSync(path.join(root, 'judge', 'dev')).filter((f) => f.endsWith('.jsonl')).map((f) => f.slice(0, -6)).filter((c) => CLASS_RE.test(c)).sort(); } catch { return []; }
}

// ---- the ledger (append only) and the syllabus
/**
 * neo/LEDGER.json: { doc (every key kept for the write back), tasks (the well formed rows) }. A missing file is empty;
 * a file that is not a JSON object fails (a rewrite would erase what it froze).
 */
export function readLedger(root) {
  const f = path.join(root, LEDGER);
  let text = null;
  try { text = fs.readFileSync(f, 'utf8'); } catch { text = null; }
  let doc = { tasks: [], generated: 0 };
  if (text !== null) {
    try { doc = JSON.parse(text); } catch (e) { throw new Fail(LEDGER + ' is not JSON (' + first(e) + '): a human session repairs it'); }
    if (!isObj(doc) || !Array.isArray(doc.tasks)) throw new Fail(LEDGER + ' is not { tasks: [..], generated }: a human session repairs it');
  }
  if (!Number.isFinite(doc.generated)) doc.generated = 0;
  return { doc, tasks: doc.tasks.filter((r) => isObj(r) && typeof r.task === 'string') };
}

/** A syllabus row is { skill (TASK_RE), domain, hint, by, at }; the first row of a skill wins. */
export function readSyllabus(root) {
  let text = '';
  try { text = fs.readFileSync(path.join(root, SYLLABUS), 'utf8'); } catch { text = ''; }
  const rows = [], seen = new Set(), all = [];
  let bad = 0;
  for (const [, s] of linesOf(text)) {
    let r = null;
    try { r = JSON.parse(s); } catch { r = null; }
    if (isObj(r) && typeof r.skill === 'string') all.push(r);
    if (!isObj(r) || !TASK_RE.test(String(r.skill)) || !words(r.domain) || !words(r.hint)) { bad++; continue; }
    if (seen.has(r.skill)) continue;
    seen.add(r.skill);
    rows.push(r);
  }
  return { rows, all, text, bad };
}

/** The skills the ledger's tasks carry (task.json's skill; a task's own name counts too: it can never be opened again). */
export function openedSkills(root, tasks) {
  const out = new Set();
  for (const r of tasks) {
    const t = readJson(path.join(root, TASKS_DIR, r.task, 'task.json'));
    if (isObj(t) && words(t.skill)) out.add(t.skill);
    out.add(r.task);
  }
  return out;
}

/** Skills a refused task proved the organism already answers (work/grow/gen-<m>/teach/<task>/refused.json, answered true). */
export function answeredSkills(root) {
  const out = new Set();
  const grow = path.join(root, 'work', 'grow');
  let gens = [];
  try { gens = fs.readdirSync(grow).filter((g) => /^gen-\d+$/.test(g)); } catch { gens = []; }
  for (const g of gens) {
    let dirs = [];
    try { dirs = fs.readdirSync(path.join(grow, g, 'teach'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name); } catch { dirs = []; }
    for (const d of dirs) {
      const r = readJson(path.join(grow, g, 'teach', d, REFUSED_MARK));
      if (isObj(r) && r.answered === true && words(r.skill)) out.add(r.skill);
    }
  }
  return out;
}

/** The syllabus rows no ledger task carries, no locked class names and the organism was not shown to answer, in syllabus order. */
export function pendingOf(root) {
  const syl = readSyllabus(root);
  const led = readLedger(root);
  const opened = openedSkills(root, led.tasks);
  const answered = answeredSkills(root);
  const locked = new Set(lockedClasses(root));
  const pending = syl.rows.filter((r) => !opened.has(r.skill) && !answered.has(r.skill) && !locked.has(r.skill));
  return { syl, led, opened, answered, locked, pending };
}

/**
 * Append next.jsonl skills to the syllabus: valid rows only, deduplicated by skill against the syllabus and each other,
 * at most SKILL_CAP new skills a generation (rows an earlier intake of the same generation added count).
 * @returns {{ added: number, total: number, dropped: number, cap: null | { max: number, left: number } }}
 */
export function appendSkills(root, n, rows, at) {
  const syl = readSyllabus(root);
  const have = new Set(syl.all.map((r) => r.skill));
  const locked = new Set(lockedClasses(root));
  const tag = 'gen-' + n + '/';
  let used = syl.all.filter((r) => typeof r.by === 'string' && r.by.startsWith(tag)).length;
  const fresh = [];
  let dropped = 0, left = 0;
  for (const { row, task } of rows) {
    if (!isObj(row) || !TASK_RE.test(String(row.skill)) || locked.has(row.skill) || !words(row.domain) || !words(row.hint)) { dropped++; continue; }
    if (have.has(row.skill)) continue;
    if (used >= SKILL_CAP) { left++; continue; }
    have.add(row.skill);
    used++;
    fresh.push({ skill: row.skill, domain: row.domain.trim(), hint: row.hint.trim(), by: tag + task, at });
  }
  if (fresh.length) {
    const f = path.join(root, SYLLABUS);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    const lead = syl.text.length && !syl.text.endsWith('\n') ? '\n' : '';
    fs.appendFileSync(f, lead + fresh.map((r) => JSON.stringify(r)).join('\n') + '\n');
  }
  return { added: fresh.length, total: readSyllabus(root).rows.length, dropped, cap: left ? { max: SKILL_CAP, left } : null };
}

// ---- one task directory (intake's offline rules)
const FORBID_WHAT = FORBIDDEN.map(([re, what]) => what + ' `' + re.source + '`');
/** What is wrong with one row { q, expect, answer }; an empty list means the row is well formed and its answer passes its expect. */
export function rowErrors(r) {
  if (!isObj(r)) return ['not a JSON object'];
  const out = [];
  if (!words(r.q)) out.push('q is not a non-empty string');
  else if (!normQ(r.q)) out.push('q is empty under norm level 1');
  const ee = expectErrors(r.expect);
  for (const e of ee) out.push('expect: ' + e);
  if (!words(r.answer)) out.push('answer is not a non-empty string');
  else if (REFUSAL_RE.test(r.answer.trim())) out.push('the answer is a refusal');
  else if (!ee.length) { const f = expectFailures(r.answer, r.expect); if (f.length) out.push('the answer fails its own expect: ' + f.join('; ')); }
  // a kept cell carries its rows as code text that validateCell reads: a forbidden pattern there voids the whole colony
  for (const [re, what] of FORBIDDEN) for (const k of ['q', 'answer']) if (typeof r[k] === 'string' && re.test(r[k])) out.push(k + ' uses ' + what + ' (grow/contract.mjs FORBIDDEN)');
  return out;
}

function rowsOfFile(file, label, why) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { why.push('no ' + label); return null; }
  const rows = [];
  for (const [ln, s] of linesOf(text)) {
    let r;
    try { r = JSON.parse(s); } catch { r = undefined; }
    const bad = rowErrors(r);
    for (const b of bad) why.push(label + ' line ' + ln + ': ' + b);
    if (!bad.length) rows.push(r);
    else rows.push(null);
  }
  return { text, rows };
}

/**
 * Validate one task directory by intake's offline rules: the name (TASK_RE, not a locked class, not in the ledger),
 * task.json, the row counts, every row well formed with an answer that passes its own expect, no duplicate inside a set
 * and no held-out prompt equal to a dev prompt under norm level 1. No organism, nothing moved.
 * @returns {{ ok: boolean, why: string[], task: object|null, skill: string|null, dev: object[], heldout: object[], devText: string|null, heldoutText: string|null }}
 */
export function validateTaskDir(dir, { n = null, locked = new Set(), taken = new Set() } = {}) {
  const name = path.basename(dir);
  const why = [];
  if (!TASK_RE.test(name)) why.push('the task name ' + JSON.stringify(name) + ' is not ' + String(TASK_RE));
  if (locked.has(name)) why.push('the task name ' + name + ' is a locked class');
  if (taken.has(name)) why.push('the task name ' + name + ' is already in the ledger');
  const t = readJson(path.join(dir, 'task.json'));
  if (!isObj(t)) why.push('task.json is missing or not a JSON object');
  else {
    if (t.task !== name) why.push('task.json task is not the directory name ' + name);
    if (!TASK_RE.test(String(t.skill))) why.push('task.json skill is not a skill name ' + String(TASK_RE));
    for (const k of ['domain', 'rule', 'by']) if (!words(t[k])) why.push('task.json ' + k + ' is not a non-empty string');
    if (n !== null ? t.generation !== n : !(Number.isInteger(t.generation) && t.generation >= 1)) why.push('task.json generation is not ' + (n !== null ? n : 'an integer from 1'));
  }
  const dev = rowsOfFile(path.join(dir, 'dev.jsonl'), 'dev.jsonl', why);
  const held = rowsOfFile(path.join(dir, 'heldout.jsonl'), 'heldout.jsonl', why);
  for (const [label, set, min] of [['dev.jsonl', dev, MIN_ROWS.dev], ['heldout.jsonl', held, MIN_ROWS.heldout]]) {
    if (!set) continue;
    if (set.rows.length < min) why.push(label + ' has ' + set.rows.length + ' rows, under ' + min);
    const seen = new Map();
    set.rows.forEach((r, i) => {
      if (!r) return;
      const k = normQ(r.q);
      if (seen.has(k)) why.push(label + ' repeats a prompt under norm level 1: row ' + (i + 1) + ' is row ' + seen.get(k) + ' (' + JSON.stringify(r.q) + ')');
      else seen.set(k, i + 1);
    });
  }
  if (dev && held) {
    const devKeys = new Set(dev.rows.filter(Boolean).map((r) => normQ(r.q)));
    held.rows.forEach((r, i) => { if (r && devKeys.has(normQ(r.q))) why.push('heldout.jsonl row ' + (i + 1) + ' is a dev prompt under norm level 1: ' + JSON.stringify(r.q)); });
  }
  return {
    ok: why.length === 0, why, task: isObj(t) ? t : null, skill: isObj(t) && TASK_RE.test(String(t.skill)) ? t.skill : null,
    dev: dev ? dev.rows.filter(Boolean) : [], heldout: held ? held.rows.filter(Boolean) : [], devText: dev ? dev.text : null, heldoutText: held ? held.text : null,
  };
}

/** next.jsonl of a task directory: its JSON rows (validity is appendSkills's to judge) and the count of lines that are not JSON. */
export function nextRowsOf(dir) {
  let text = '';
  try { text = fs.readFileSync(path.join(dir, 'next.jsonl'), 'utf8'); } catch { return { rows: [], bad: 0, present: false }; }
  const rows = [];
  let bad = 0;
  for (const [, s] of linesOf(text)) { try { rows.push(JSON.parse(s)); } catch { bad++; } }
  return { rows, bad, present: true };
}

// ---- the organism (prepare's way: judge/baseline.mjs runOrganism, the pack when present)
async function organismOf(root, knowledge) {
  const { runOrganism, PACK } = await import(pathToFileURL(path.join(root, 'judge', 'baseline.mjs')).href);
  if (typeof runOrganism !== 'function') throw new Error('judge/baseline.mjs exports no runOrganism');
  const k = knowledge === 'none' ? false : knowledge ? path.resolve(knowledge) : (PACK && fs.existsSync(PACK) ? PACK : undefined);
  return (rows) => runOrganism(rows, { knowledge: k });
}
/** Ask the organism every distinct prompt once: Map qKey -> got. */
async function askAll(run, qs) {
  const uniq = [...new Map(qs.map((q) => [normKey(q), q])).values()];
  const res = await run(uniq.map((q) => ({ q })));
  const rows = Array.isArray(res) ? res : isObj(res) && Array.isArray(res.rows) ? res.rows : null;
  if (!rows) throw new Error('runOrganism returned no rows');
  const got = new Map();
  for (const o of rows) if (isObj(o) && typeof o.q === 'string' && !got.has(normKey(o.q))) got.set(normKey(o.q), typeof o.got === 'string' ? o.got : null);
  return got;
}
const normKey = (q) => String(q ?? '').trim().toLowerCase(); // judge/judge.mjs qKey: how a result meets its row

function moveFile(from, to) {
  try { fs.renameSync(from, to); } catch (e) {
    if (!e || e.code !== 'EXDEV') throw e;
    fs.copyFileSync(from, to);
    fs.rmSync(from);
  }
}

// ---- intake
/**
 * Intake generation n: every directory of work/grow/gen-<n>/teach/ is a task an arm wrote. A valid one the organism does
 * not already answer in full moves to neo/tasks/<task>/ (TASK_FILES only), gets its ledger row and adds its next.jsonl
 * skills; a refused one stays where it is with refused.json saying why. A directory intake already moved (opened.json)
 * is skipped, so a second run opens nothing new and refuses nothing it moved.
 * @param {string} root the tree root
 * @param {{ gen?: number, runOrganism?: Function, knowledge?: string, now?: () => string }} opts runOrganism(rows) -> { rows: [{ q, got }] } replaces judge/baseline.mjs (a test's stub)
 * @returns {Promise<object>} { generation, opened, refused, already, syllabus, added, cap?, baseline, at }
 */
export async function intake(root, { gen, runOrganism = null, knowledge, now = () => new Date().toISOString() } = {}) {
  const n = gen ?? nextGeneration(root);
  const at = now();
  const teach = teachDirOf(root, n);
  const led = readLedger(root);
  const locked = new Set(lockedClasses(root));
  const taken = new Set(led.tasks.map((r) => r.task));
  let dirs = [];
  try { dirs = fs.readdirSync(teach, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort(); } catch { dirs = []; }
  const opened = [], refused = [], already = [], cands = [], nexts = [];
  const refuse = (dir, task, why, extra = {}) => {
    writeJson(path.join(dir, REFUSED_MARK), { task, generation: n, why, ...extra, at });
    refused.push({ task, why: cut(why) });
  };
  for (const name of dirs) {
    const dir = path.join(teach, name);
    if (fs.existsSync(path.join(dir, OPENED_MARK))) { already.push(name); continue; }
    const v = validateTaskDir(dir, { n, locked, taken });
    if (!v.ok) { refuse(dir, name, v.why, v.skill ? { skill: v.skill } : {}); continue; }
    cands.push({ name, dir, v });
  }
  let got = null, cannot = null;
  if (cands.length) {
    try {
      const run = typeof runOrganism === 'function' ? runOrganism : await organismOf(root, knowledge);
      got = await askAll(run, cands.flatMap((c) => c.v.dev.map((r) => r.q)));
    } catch (e) { cannot = redact(first(e)); }
  }
  for (const { name, dir, v } of cands) {
    let baseline = null;
    if (got) {
      const ok = v.dev.filter((r) => expectOk(got.has(normKey(r.q)) ? got.get(normKey(r.q)) : null, r.expect)).length;
      baseline = { n: v.dev.length, ok, score: round4(ok / v.dev.length) };
      if (ok === v.dev.length) { refuse(dir, name, [ALREADY], { skill: v.skill, answered: true, baseline }); continue; }
    }
    const dest = path.join(root, TASKS_DIR, name);
    if (fs.existsSync(dest)) { refuse(dir, name, [TASKS_DIR + '/' + name + '/ already exists but the ledger has no row for it: a human session repairs it']); continue; }
    const devSha = shaText(v.devText), heldoutSha = shaText(v.heldoutText);
    fs.mkdirSync(dest, { recursive: true });
    for (const f of TASK_FILES) moveFile(path.join(dir, f), path.join(dest, f));
    led.doc.tasks.push({
      task: name, generation: n, devSha, heldoutSha, dev: v.dev.length, heldout: v.heldout.length, by: v.task.by, at,
      baseline, ...(baseline === null ? { baselineWhy: 'the organism could not be asked: ' + cannot } : {}),
    });
    writeJson(path.join(root, LEDGER), led.doc);
    taken.add(name);
    try { fs.rmSync(path.join(dir, REFUSED_MARK), { force: true }); } catch { /* a stale refusal is harmless beside opened.json */ }
    writeJson(path.join(dir, OPENED_MARK), { task: name, generation: n, to: TASKS_DIR + '/' + name + '/', at });
    opened.push(name);
    for (const row of nextRowsOf(dir).rows) nexts.push({ row, task: name });
  }
  const s = appendSkills(root, n, nexts, at);
  return {
    generation: n, opened, refused, already: already.length, syllabus: s.total, added: s.added,
    ...(s.cap ? { cap: 'at most ' + s.cap.max + ' new skills a generation: ' + s.cap.left + ' left out' } : {}),
    baseline: !cands.length ? 'nothing to ask' : cannot === null ? 'asked' : 'the organism could not be asked: ' + cannot, at,
  };
}

// ---- frontier and the teacher brief
const CLAUSE_LINES = Object.freeze({
  equals: '`equals`: the whole answer is this text.',
  contains: '`contains`: every listed string appears in the answer.',
  containsAny: '`containsAny`: at least one listed string appears.',
  notContains: '`notContains`: no listed string appears.',
  minWords: '`minWords`: at least this many words (runs of non-space characters).',
  maxWords: '`maxWords`: at most this many words.',
  notRefusal: '`notRefusal`: `true`; the answer is not null and does not start with "nothing in memory matches", "I do not carry that yet" or "I am growing a cell".',
});

/**
 * One teacher brief: the CONCISE directive, the skills, the files and the row format, what makes a task learnable by an
 * engine with no model call, the files never opened, the check and the one line back.
 * @param {{ n: number, i: number, skills: { skill, domain, hint }[], directive: string, locked: string[] }} o
 * @returns {string}
 */
export function teachBrief({ n, i, skills, directive, locked }) {
  const base = 'work/grow/gen-' + n + '/teach/';
  const by = 'teach-g' + n + '-b' + i;
  const ex = skills[0] ? skills[0].skill : 'add-two-numbers';
  return [
    directive, '',
    '# Generation ' + n + ', TEACHER arm ' + i + ': open ' + skills.length + (skills.length === 1 ? ' task' : ' tasks') + ' the organism will learn', '',
    'You are TEACHER arm ' + i + ' of generation ' + n + ' (grow/NEO.md, "Self-opened tasks"). The organism grows NEO cells for a task with NO model call: its engine (grow/neo.mjs) composes orthogonal primitives (sense, transform, aggregate, compare, compute, memory, route, iterate, render) into thousands of candidate cells, keeps every cell your examples do not refute, and is graded on prompts it never saw. Your rows are all it learns from. Write one task per skill below, in its own directory, and nowhere else. Run every command from the tree root.', '',
    '## The skills (neo/syllabus.jsonl)', '',
    ...skills.map((s) => '- `' + s.skill + '` (' + s.domain + '): ' + s.hint), '',
    '## What you write for each skill', '',
    'The directory `' + base + '<task>/`, where `<task>` is the skill name (it must match `' + String(TASK_RE) + '`, must not be a locked class (' + locked.join(', ') + ') and must not be a task already opened in neo/LEDGER.json). Exactly these files:', '',
    '1. `task.json`: one JSON object, `{ "task": "<task>", "skill": "<skill>", "domain": "<domain>", "rule": "<one sentence: how the answer follows from the prompt>", "generation": ' + n + ', "by": "' + by + '" }`.',
    '2. `dev.jsonl`: ' + BRIEF_ROWS.dev + ' rows (at least ' + MIN_ROWS.dev + ' are required), one JSON object a line: `{ "q": <the prompt>, "expect": <clauses>, "answer": <the answer> }`.',
    '3. `heldout.jsonl`: ' + BRIEF_ROWS.heldout + ' rows (at least ' + MIN_ROWS.heldout + ' are required), the same format. After intake only the selector reads this file: no arm, no cell, not the engine.',
    '4. `next.jsonl`: at least ' + BRIEF_ROWS.next + ' rows `{ "skill": <a task name>, "domain": <a word>, "hint": <one sentence: the prompt shape and what the answer is> }`: sub-skills and neighbours of your skills that neo/syllabus.jsonl does not hold yet (open it to check). The syllabus grows from these.', '',
    'Example of one dev row for a skill like `add-two-numbers`: `{"q":"what is 48 plus 17","expect":{"contains":["65"],"notRefusal":true},"answer":"48 plus 17 is 65."}`', '',
    '## Make it LEARNABLE (an engine that composes primitives from examples, with no model call)', '',
    '- The answer is a FUNCTION of the prompt: computed (arithmetic on the numbers the prompt holds), looked up (a fixed fact the prompt names), or templated (the prompt\'s own words placed in a fixed sentence). Work out every value exactly (run node if you need to); never estimate.',
    '- One shape per task, in VARIED wording: the same question asked many ways ("what is 48 plus 17", "add 48 and 17", "48 + 17 = ?", "the sum of 48 and 17"), so a cell learns the shape and not one string.',
    '- The held-out prompts are OTHER instances of the same shape: other numbers, other subjects, the wordings the dev rows use; never a dev prompt. Overlap is checked under norm level 1 (lower case, every character but letters, digits and spaces removed, runs of spaces collapsed, trimmed): no held-out prompt may equal a dev prompt there, and no set may repeat a prompt.',
    '- `expect` is built from the exact computed value: `contains` with the value as plain digits ("65", never "sixty-five" or "65.0") or the exact word, plus `"notRefusal": true`. Clauses allowed (judge/judge.mjs; text trimmed, compared case-insensitively):',
    ...CLAUSES.map((k) => '  - ' + CLAUSE_LINES[k]),
    '- `answer` is the full sentence a person would read, holding the value ("48 plus 17 is 65."); every answer passes its own expect, is non-empty and is not a refusal.',
    '- The organism must not already answer the whole dev set: ask it a few prompts with `node grow/generation.mjs ask "<q>"`; a task whose every dev prompt it already answers right is refused ("' + ALREADY + '"). Prompts it refuses today are the point.',
    '- No prompt and no answer may contain any of these, even inside prose (a kept cell carries its rows as code text that grow/contract.mjs validateCell reads): ' + FORBID_WHAT.join('; ') + '. Write "the steps" or "the cycle", never the word those patterns name.', '',
    '## Files you may not open', '',
    'Never open, read, list or grep `judge/heldout/`, `judge/control.jsonl`, `state/` or any `neo/tasks/*/heldout.jsonl`: a task is real only because no arm saw the rows it is graded on. Do not open other arms\' directories under `' + base + '`.', '',
    '## How you validate', '',
    'For each task run `node grow/teach.mjs check ' + base + ex + '` (your task\'s directory) until it prints `"ok":true`; fix the files and re-run.', '',
    '## Your answer', '',
    'One line: the task names you wrote, comma separated. Nothing else.', '',
  ].join('\n');
}

/**
 * The next skills not yet opened, as k teacher briefs of per skills each: work/grow/gen-<n>/teach/brief-<i>.md and
 * plan.json ({ generation, briefs: [{ brief, skills, dir }] }). Earlier briefs of the generation are replaced.
 * @returns {{ generation: number, briefs: number, skills: number, syllabus: number, opened: number, plan: string }}
 */
export function frontier(root, { gen, k = DEFAULTS.k, per = DEFAULTS.per } = {}) {
  const n = gen ?? nextGeneration(root);
  const directive = conciseDirective(root); // a brief without it is not his order: no brief at all
  const { syl, led, pending, locked } = pendingOf(root);
  const pick = pending.slice(0, k * per);
  const teach = teachDirOf(root, n);
  fs.mkdirSync(teach, { recursive: true });
  for (const f of fs.readdirSync(teach)) if (/^brief-\d+\.md$/.test(f)) fs.rmSync(path.join(teach, f), { force: true });
  const briefs = [];
  for (let i = 0; i * per < pick.length; i++) {
    const skills = pick.slice(i * per, (i + 1) * per);
    const file = path.join(teach, 'brief-' + (i + 1) + '.md');
    fs.writeFileSync(file, teachBrief({ n, i: i + 1, skills, directive, locked: [...locked].sort() }));
    briefs.push({ brief: relOf(root, file), skills: skills.map((s) => s.skill), dir: relOf(root, teach) + '/' });
  }
  const plan = path.join(teach, 'plan.json');
  writeJson(plan, { generation: n, briefs });
  return { generation: n, briefs: briefs.length, skills: pick.length, syllabus: syl.rows.length, opened: led.tasks.length, plan: relOf(root, plan) };
}

/** { syllabus, opened, pending, tasks, answered }: the distinct skills, the ledger's tasks, the skills still to open. */
export function status(root) {
  const { syl, led, pending, answered } = pendingOf(root);
  return { syllabus: syl.rows.length, opened: led.tasks.length, pending: pending.length, tasks: led.tasks.map((r) => r.task), answered: answered.size };
}

/** check <taskDir>: intake's offline rules on one directory, plus next.jsonl's count (a short one is a warning, not a refusal). */
export function check(root, dirArg, gen = null) {
  if (!dirArg) throw new Fail('check needs a task directory: check <taskDir>', 2);
  const dir = path.isAbsolute(dirArg) ? dirArg : fs.existsSync(path.resolve(dirArg)) ? path.resolve(dirArg) : path.resolve(root, dirArg);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) throw new Fail('check: ' + posix(dirArg) + ' is not a directory', 1);
  const m = /[\\/]gen-(\d+)[\\/]teach[\\/][^\\/]+[\\/]?$/.exec(dir);
  const n = gen ?? (m ? Number(m[1]) : null);
  const taken = new Set(readLedger(root).tasks.map((r) => r.task));
  const v = validateTaskDir(dir, { n, locked: new Set(lockedClasses(root)), taken });
  const nx = nextRowsOf(dir);
  const warnings = nx.rows.length < BRIEF_ROWS.next ? ['next.jsonl has ' + nx.rows.length + ' rows, under ' + BRIEF_ROWS.next] : [];
  const out = { ok: v.ok, task: path.basename(dir), dev: v.dev.length, heldout: v.heldout.length, next: nx.rows.length, errors: cut(v.why), warnings };
  if (!out.ok) { const e = new Fail('check: ' + v.why.length + ' errors', 1); e.json = out; throw e; }
  return out;
}

// ---- arguments and main
const VALUE = new Set(['gen', 'k', 'per', 'root', 'knowledge']);
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
  if (!Number.isInteger(v) || v < lo || (hi !== null && v > hi)) throw new Fail('--' + name + ' is an integer from ' + lo + (hi !== null ? ' to ' + hi : '') + ', not ' + flags[name], 2);
  return v;
}

/** The CLI as a function: the printed object, or { usage: true }. */
export async function main(argv) {
  const { verb, pos, flags } = parseArgs(argv);
  if (flags.help || !verb || verb === 'help') return { usage: true };
  const root = flags.root ? path.resolve(flags.root) : DEFAULT_ROOT;
  const gen = flags.gen === undefined ? undefined : intOf(flags, 'gen', 1, null, null);
  if (verb === 'frontier') return frontier(root, { gen, k: intOf(flags, 'k', 1, LIMITS.k, DEFAULTS.k), per: intOf(flags, 'per', 1, LIMITS.per, DEFAULTS.per) });
  if (verb === 'intake') return await intake(root, { gen, knowledge: flags.knowledge });
  if (verb === 'check') return check(root, pos[0], gen ?? null);
  if (verb === 'status') return status(root);
  throw new Fail('unknown verb ' + verb + ': frontier, intake, check or status (--help)', 2);
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const done = (code) => process.stdout.write('', () => process.exit(code));
  main(process.argv.slice(2)).then((r) => { process.stdout.write((r.usage ? USAGE : JSON.stringify(r)) + '\n'); done(0); }, (e) => {
    if (e && e.json) { process.stdout.write(JSON.stringify(e.json) + '\n'); done(e.code); return; }
    const coded = e instanceof Error && Number.isInteger(e.code);
    process.stderr.write(redact(coded ? e.message : 'teach failed: ' + ((e && e.stack) || e)).split('\n')[0] + '\n');
    done(coded ? e.code : 1);
  });
}
