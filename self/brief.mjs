// self/brief.mjs: THE OPERATOR THAT FINISHES A BOARD ITEM (Board 15, item brief).
//
// His order (relayed 2026-09-25): "Needs to be fronteir level in microseconds. And self improving.
// Without your build." Today an unfinished board item is prose inside docs/boards/board-N.js and only
// an orchestrator can execute it. This file lets the ORGANISM execute it: on a COPY of the tree, in
// bounded steps, every step one ask() through act/prompt.mjs (the organism's own answer chain), with
// a schema-shaped answer validated before it is used.
//
//   1. PLAN   the files to write (inside the item's owned set; anything outside it, or under the
//             ceiling below, is refused), the test command, the bar command and the verdict file.
//             The chain: the direct table (one lookup, ns), then the organism's EXACT method, the
//             item's own grammar (owns list, BAR parenthesis, flags in the owns notes; us), and the
//             model cell only when both are silent.
//   2. WRITE  one whole file per ask. A file whose docstring block the task states (comment lines
//             over "export function f(...) {") goes to the code region of ask(): program synthesis
//             (reason/synth.mjs) that RUNS the candidates against the examples the comment states,
//             so its answer is "model+exact" when they pass. Every other file: the direct table,
//             then the model cell. An existing file over WHOLE_FILE_LINES lines is never rewritten
//             whole: it is dropped at the plan wall with its line count printed.
//   3. TEST   the item's test command on the copy under tools/budget.mjs; the first FAIL_LINES
//             lines of the failure go back to the chain as a REPAIR ask (FILE: <path> and one whole
//             file), at most REPAIR_ROUNDS rounds, shared with bar crashes.
//   4. BAR    the bar command, bounded by the gap's minutes; its verdict file must be written by
//             this run with isTheBar true (barMet may be false).
//   5. GATE   node bench/gate.mjs --quiet on the copy. GREEN keeps.
//
// KEPT: the tests pass, the verdict exists with isTheBar true, the gate is GREEN. The kept files come
// back as a patch set with author "organism (brief)". The run never writes the real tree: the copy
// is deleted after the decision line is on disk (state/self/brief/<date>.jsonl, one line per step,
// each with its provenance and its ns, us or seconds).
//
// SELF IMPROVING (library learning): the plan the grammar computed, and every file of a KEPT run
// (the final text, after repairs), is stored in the brief's direct table
// (state/self/brief/direct.bin, memory/direct.mjs) under the text of the ask that produced it. The
// same brief asked again is answered by one lookup per step, with no model call; a changed brief
// hashes to a different key and goes back down the chain.
//
// The model cell is LAST and runs on OPEN WEIGHTS only: qwen3:30b-a3b through Ollama at
// http://localhost:11434 (self/autopilot.mjs authorConfig refuses a model or base naming Claude or
// Anthropic before any socket opens). Budgets: --model-calls (40), --wall (60 min), 120 s per call,
// every call's seconds recorded. Walls: plan, ceiling, test, bar, gate, budget.
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync, statSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { builtinModules } from 'node:module';
import { ask, codeShape } from '../act/prompt.mjs';
import { DirectTable, textKey } from '../memory/direct.mjs';
import { copyTree, addGateKit, deleteCopy, runCapped, trialArgv, today } from './improve.mjs';
import { authorConfig } from './autopilot.mjs';
import { verdictValues } from '../tools/findings.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const BRIEF_AUTHOR = 'organism (brief)';
export const BRIEF_KIND = 'board item';
export const MODEL_CALLS = 40;
export const WALL_MINUTES = 60;
export const CALL_WALL_MS = 120_000;
export const REPAIR_ROUNDS = 4;
/** Model asks per step: the answer, then re-asks with the reason (a refused schema, or no answer inside the call wall). */
export const MODEL_ATTEMPTS = 3;
export const FAIL_LINES = 60;
export const WHOLE_FILE_LINES = 400;
export const BAR_MINUTES = 20;
export const TEST_WALL_MS = 10 * 60_000;
export const GATE_WALL_MS = 60 * 60_000;
export const STATE_REL = 'state/self/brief';
export const DIRECT_NAME = 'direct.bin';
export const COPY_PREFIX = 'brain-brief-';
export const DEFAULT_GATE_CMD = 'node bench/gate.mjs --quiet';
export const WALLS = Object.freeze(['plan', 'ceiling', 'test', 'bar', 'gate', 'budget']);
export const MODEL_OPTS = Object.freeze({ numCtx: 16384, think: true, maxTokens: 6000 });
export const CODE_REGION = Object.freeze({ k: 2, repair: true, repairK: 2 });
/** What the brief never writes, whatever an item owns (lower case; a trailing slash is a directory). */
export const BRIEF_CEILING = Object.freeze(['manual.md', 'manual/', 'docs/', 'self/', 'bench/gate.mjs', 'bench/ladder.mjs', 'bench/verdicts/', 'state/', 'organism/', '.git/', 'site/', 'node_modules/', 'claude.md']);
export const VERDICT_FIELDS = Object.freeze(['at', 'command', 'node', 'isTheBar', 'barMet', 'split', 'statement']);
const ISO_STAMP = /\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g;
/**
 * THE STATEMENT WALL, checked at the bar step before the gate spends its minutes: the findings page
 * (tools/findings.mjs, test/findings.test.mjs on the gate) shows a verdict's statement on its card
 * when the statement is plain text of at most 600 characters, and the card's note must quote one of
 * the verdict's OWN measured values (verdictValues: a number field of 10 or more, or a non-integer).
 * Measured 2026-09-26: a planted bench whose statement read "all tests passed" passed its tests and
 * its bar, then turned test/findings.test.mjs red on the copy after 518 s of gate.
 * @returns {{ok: boolean, shown: boolean, quoted: string[], values: string[]}}
 */
export function statementCheck(v) {
  const t = v ? v.statement : null;
  const shown = typeof t === 'string' && !!t.trim() && t.length <= 600 && JSON.stringify(t).slice(1, -1) === t;
  if (!shown) return { ok: true, shown: false, quoted: [], values: [] };
  const vals = verdictValues(v);
  const toks = new Set(t.replace(ISO_STAMP, ' ').match(/\d[\d.,]*\d/g) || []);
  const quoted = [...toks].filter((x) => vals.has(x) || vals.has(x.replace(/,/g, '')));
  return { ok: quoted.length > 0, shown: true, quoted, values: [...vals] };
}
const SYSTEM = 'You write files for a program that finishes its own work on a copy of its source tree. Think briefly. Answer exactly in the form asked for, with nothing else.';
const EM = String.fromCharCode(0x2014);

const firstLine = (e) => String((e && e.message) || e).split('\n')[0];
const r2 = (x) => Math.round(x * 100) / 100;
const nowNs = () => process.hrtime.bigint();
const usSince = (t) => Number(process.hrtime.bigint() - t) / 1000;
const sha = (s) => createHash('sha256').update(s).digest('hex');
const stampOf = (d = new Date()) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
const normRel = (f) => String(f ?? '').trim().replaceAll('\\', '/').replace(/^\.\//, '');

// ================================================================== the ceiling
/**
 * May the brief write rel? Inside the tree, not under BRIEF_CEILING, and (when owned is given) one
 * of the item's owned files. A test file is allowed when the item owns it.
 */
export function briefCeiling(rel, owned = null) {
  const r = normRel(rel);
  if (!r || path.isAbsolute(r) || /^[a-zA-Z]:/.test(r) || r.split('/').includes('..')) return { ok: false, reason: 'not a relative path inside the tree: ' + rel };
  const low = r.toLowerCase();
  for (const c of BRIEF_CEILING) if (c.endsWith('/') ? low.startsWith(c) : low === c) return { ok: false, reason: 'under the brief ceiling (' + c + '): ' + r };
  if (owned && !owned.includes(r)) return { ok: false, reason: 'outside the item\'s owned set: ' + r };
  return { ok: true, rel: r };
}

// ================================================================== the board grammar
const PROPS = new Set(['key', 'owns', 'task', 'ollama', 'wave']);

function readQuoted(t, i) {
  const q = t[i];
  let j = i + 1, out = '';
  while (j < t.length) {
    const c = t[j];
    if (c === '\\') { const n = t[j + 1]; out += n === 'n' ? '\n' : n === 't' ? '\t' : (n ?? ''); j += 2; continue; }
    if (c === q) return { value: out, end: j + 1, unterminated: false };
    if (q === '`' && c === '$' && t[j + 1] === '{') {
      let d = 0, k = j + 1;
      for (; k < t.length; k++) { if (t[k] === '{') d++; else if (t[k] === '}') { d--; if (d === 0) break; } }
      out += t.slice(j, k + 1); j = k + 1; continue;
    }
    if (q !== '`' && c === '\n') return { value: out, end: j, unterminated: true };
    out += c; j++;
  }
  return { value: out, end: j, unterminated: true };
}

/**
 * The items of a board script, read WITHOUT executing it: a tolerant scan for the properties key,
 * owns, task, ollama and wave outside comments and strings (single quotes, double quotes and
 * template literals, escapes decoded). A "key:" with a quoted value starts an item (key: it.key in
 * the script's own code closes the current item and starts none); an item with no task is dropped and
 * named in `dropped`. An unterminated string is an error, reported, never skipped silently.
 * @returns {{items: object[], errors: string[], dropped: string[], board: number|null}}
 */
export function parseBoardText(text, { file = '<board>' } = {}) {
  const t = String(text ?? '');
  const raw = [], errors = [];
  let cur = null, i = 0;
  while (i < t.length) {
    const c = t[i];
    if (c === '/' && t[i + 1] === '/') { const e = t.indexOf('\n', i); i = e < 0 ? t.length : e; continue; }
    if (c === '/' && t[i + 1] === '*') { const e = t.indexOf('*/', i + 2); i = e < 0 ? t.length : e + 2; continue; }
    if (c === "'" || c === '"' || c === '`') {
      const s = readQuoted(t, i);
      if (s.unterminated) errors.push(file + ': an unterminated ' + c + ' string at offset ' + i);
      i = Math.max(s.end, i + 1); continue;
    }
    if (/[A-Za-z_$]/.test(c) && !/[\w$]/.test(t[i - 1] || '')) {
      let j = i;
      while (j < t.length && /[\w$]/.test(t[j])) j++;
      const id = t.slice(i, j);
      let k = j;
      while (k < t.length && (t[k] === ' ' || t[k] === '\t')) k++;
      if (t[k] === ':' && PROPS.has(id)) {
        k++;
        while (k < t.length && /\s/.test(t[k])) k++;
        let value, end, quoted = false;
        if (t[k] === "'" || t[k] === '"' || t[k] === '`') {
          quoted = true;
          const s = readQuoted(t, k);
          if (s.unterminated) errors.push(file + ': the ' + id + ' string at offset ' + k + ' is unterminated');
          value = s.value; end = s.end;
        } else {
          const m = /^[^,}\n]*/.exec(t.slice(k));
          const v = m[0].trim();
          value = v === 'true' ? true : v === 'false' ? false : (v !== '' && Number.isFinite(Number(v)) ? Number(v) : v);
          end = k + m[0].length;
        }
        if (id === 'key') { if (quoted) { cur = { key: String(value) }; raw.push(cur); } else cur = null; } else if (cur && !(id in cur)) cur[id] = value;
        i = Math.max(end, j); continue;
      }
      i = j; continue;
    }
    i++;
  }
  const items = [], dropped = [];
  for (const it of raw) {
    if (typeof it.task === 'string' && it.task.trim() && typeof it.key === 'string' && it.key) items.push(it); else dropped.push(it.key);
  }
  const bm = /board-(\d+)\.js$/.exec(file) || /\bBOARD\s*=\s*(\d+)/.exec(t);
  return { items, errors, dropped, board: bm ? Number(bm[1]) : null };
}

/**
 * The owned entries of an owns list: split at commas outside parentheses; each entry's path is its
 * leading token, its note the parenthesis after it (the "(new)" marker, flags such as --exit).
 * @returns {Array<{path, note, isNew, flags: string[], dir: boolean}>}
 */
export function ownedFiles(owns) {
  const s = String(owns ?? '');
  const parts = [];
  let cur = '', depth = 0;
  for (const c of s) {
    if (c === '(') depth++;
    if (c === ')') depth = Math.max(0, depth - 1);
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  const out = [];
  for (const p of parts) {
    const m = /^\s*([\w.\-/]+)\s*(?:\(([\s\S]*)\))?/.exec(p);
    if (!m) continue;
    const f = normRel(m[1]);
    if (!f.includes('/') && !/\.\w+$/.test(f)) continue;
    const note = (m[2] || '').trim();
    if (out.some((o) => o.path === f)) continue;
    out.push({ path: f, note, isNew: /\bnew\b/i.test(note), flags: note.match(/--[a-z][\w-]*/g) || [], dir: f.endsWith('/') });
  }
  return out;
}

/** The verdict file of a task: the first *.json named after the word BAR, resolved against the owned set, else the first owned bench/verdicts file. */
export function verdictOf(task, owned = []) {
  const t = String(task ?? '');
  const at = t.search(/\bBAR\b/);
  const paths = owned.map((o) => (typeof o === 'string' ? o : o.path));
  const vs = paths.filter((p) => /^bench\/verdicts\/[^/]+\.json$/.test(p) && !/-partial\.json$/.test(p));
  if (at >= 0) {
    for (const m of t.slice(at).matchAll(/((?:bench\/verdicts\/)?[\w.-]+\.json)\b/g)) {
      const name = m[1].replace(/^bench\/verdicts\//, '');
      if (/-partial\.json$/.test(name)) continue;
      const hit = vs.find((p) => p.endsWith('/' + name));
      if (hit) return hit;
      if (m[1].startsWith('bench/verdicts/')) return m[1];
    }
  }
  return vs[0] || null;
}

/** needsModel: the ollama flag; else false when the task says MODEL OFF; else the words Ollama or model (the boards item's rule). */
export function needsModelOf(item) {
  if (item && item.ollama === true) return true;
  const t = String((item && (item.task || item.brief)) || '');
  if (/\bMODEL[ -]OFF\b|\bmodel off\b/i.test(t)) return false;
  return /\bOllama\b/i.test(t) || /\bmodel\b/i.test(t);
}

/** A gap line of kind "board item" for a parsed item (the boards item's schema). */
export function gapOf(item, board) {
  const owned = ownedFiles(item.owns);
  return {
    id: 'board-' + board + ':' + item.key, kind: BRIEF_KIND, board, key: item.key, owns: item.owns, brief: item.task,
    verdictFile: verdictOf(item.task, owned), bar: null, trial: null, needsModel: needsModelOf(item), minutes: 60,
    files: owned.map((o) => o.path), wave: item.wave ?? null,
  };
}

/** Normalise what a caller hands in: a gap line, or a parsed item plus its board. */
export function normalizeGap(g, board = null) {
  if (!g || typeof g !== 'object') return null;
  if (g.kind === BRIEF_KIND && typeof g.brief === 'string') return { minutes: 60, ...g, files: (g.files || ownedFiles(g.owns).map((o) => o.path)).map(normRel) };
  if (typeof g.task === 'string') return gapOf(g, board ?? g.board ?? null);
  return { ...g };
}

/**
 * The board items: the boards item's ledger (state/self/gaps.jsonl, lines of kind "board item")
 * when it holds any for this board, else docs/boards/board-<board>.js read with the tolerant parser
 * above, and `source` says which.
 */
export function boardItems({ root = ROOT, board = 13, ledger = null } = {}) {
  const lf = ledger || path.join(root, 'state', 'self', 'gaps.jsonl');
  const fromLedger = [];
  if (existsSync(lf)) {
    for (const line of readFileSync(lf, 'utf8').split('\n')) {
      if (!line.includes('"board item"')) continue;
      try { const j = JSON.parse(line); if (j.kind === BRIEF_KIND && (board === null || j.board === board)) fromLedger.push(normalizeGap(j)); } catch { /* a torn line */ }
    }
  }
  if (fromLedger.length) return { source: 'the boards ledger (' + path.relative(root, lf).replaceAll('\\', '/') + ')', items: fromLedger, errors: [] };
  const file = path.join(root, 'docs', 'boards', 'board-' + board + '.js');
  if (!existsSync(file)) return { source: 'none: no ledger line and no docs/boards/board-' + board + '.js', items: [], errors: ['absent: ' + file] };
  const p = parseBoardText(readFileSync(file, 'utf8'), { file: 'docs/boards/board-' + board + '.js' });
  return { source: 'docs/boards/board-' + board + '.js, read with the brief\'s tolerant parser (the boards ledger holds no board item line for board ' + board + ')', items: p.items.map((it) => gapOf(it, board)), errors: p.errors };
}

/** Is a gap done? Its verdict file exists with isTheBar true and barMet true. */
export function itemDone(gap, root = ROOT) {
  if (!gap.verdictFile) return { done: false, reason: 'no verdict file named after BAR' };
  const f = path.join(root, ...gap.verdictFile.split('/'));
  if (!existsSync(f)) return { done: false, reason: gap.verdictFile + ' is absent' };
  try {
    const v = JSON.parse(readFileSync(f, 'utf8'));
    if (v.isTheBar === true && (v.barMet === true || v.met === true)) return { done: true, reason: null };
    return { done: false, reason: gap.verdictFile + ' says isTheBar ' + v.isTheBar + ', barMet ' + v.barMet };
  } catch (e) { return { done: false, reason: gap.verdictFile + ' does not parse: ' + firstLine(e) }; }
}

/** The smallest undone model-off item of a board, by owned file count (ties in board order). */
export function smallestUndone({ root = ROOT, board = 13, modelOff = true } = {}) {
  const b = boardItems({ root, board });
  const rows = b.items.map((g, i) => ({ g, i, ...itemDone(g, root) }));
  const undone = rows.filter((r) => !r.done && (!modelOff || !r.g.needsModel));
  undone.sort((a, c) => a.g.files.length - c.g.files.length || a.i - c.i);
  return { source: b.source, rows, pick: undone.length ? undone[0].g : null, undone: undone.map((r) => r.g) };
}

// ================================================================== the exact plan
/** The docstring blocks a task states: comment lines directly over "export function f(...) {". */
export function codeBlocks(task) {
  const lines = String(task ?? '').split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const m = /^\s*(?:export\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$/.exec(lines[i]);
    if (!m) continue;
    let j = i;
    while (j > 0 && /^\s*\/\//.test(lines[j - 1])) j--;
    if (j === i) continue;
    const doc = lines.slice(j, i).map((l) => l.trim());
    const sig = lines[i].trim().replace(/^export\s+/, '');
    const prompt = doc.join('\n') + '\n' + sig;
    const before = lines.slice(0, j).join('\n');
    if (codeShape(prompt)) out.push({ entry: m[1], prompt, doc, sig, before });
  }
  return out;
}

const isTest = (f) => /^test\/.*\.test\.m?js$/.test(f);
const isBench = (f) => /^bench\/[^/]+\.m?js$/.test(f) && f !== 'bench/gate.mjs' && f !== 'bench/ladder.mjs';
const isCode = (f) => /\.m?js$/.test(f);
const lineCount = (abs) => { try { return readFileSync(abs, 'utf8').split('\n').length; } catch { return 0; } };

/**
 * THE ORGANISM'S EXACT PLAN: the item's own grammar, no model. Files to write are the owned code
 * files and new notes the ceiling allows, sources first, then tests, then the bench, then notes; an
 * existing file over WHOLE_FILE_LINES is dropped (a whole-file writer cannot carry it) and an
 * existing .md note is not rewritten. Tests: node --test over the owned test files. Bar: node over
 * the owned bench file, with the flags its note names. Null plan when a piece is missing.
 */
export function grammarPlan(gap, root = ROOT) {
  const owned = ownedFiles(gap.owns);
  const paths = owned.map((o) => o.path);
  const refused = [], dropped = [], files = [];
  for (const o of owned) {
    if (o.dir) continue;
    const c = briefCeiling(o.path, paths);
    if (!c.ok) { if (!/^bench\/verdicts\//.test(o.path)) refused.push({ file: o.path, reason: c.reason }); continue; }
    const abs = path.join(root, ...o.path.split('/'));
    const exists = existsSync(abs);
    if (/\.md$/.test(o.path)) { if (!exists) files.push(o.path); else dropped.push({ file: o.path, reason: 'an existing note is not rewritten whole by the brief', lines: lineCount(abs) }); continue; }
    if (!isCode(o.path) && !/\.json$/.test(o.path)) continue;
    const n = exists ? lineCount(abs) : 0;
    if (n > WHOLE_FILE_LINES) { dropped.push({ file: o.path, reason: 'whole-file cap: ' + n + ' lines, over ' + WHOLE_FILE_LINES, lines: n }); continue; }
    files.push(o.path);
  }
  const rank = (f) => (isTest(f) ? 1 : isBench(f) ? 2 : /\.md$/.test(f) ? 3 : 0);
  files.sort((a, b) => rank(a) - rank(b));
  const tests = paths.filter(isTest);
  const benches = owned.filter((o) => isBench(o.path));
  const verdict = gap.verdictFile || verdictOf(gap.brief, owned);
  const stem = verdict ? path.basename(verdict, '.json') : '';
  const bench = benches.find((o) => stem && stem.startsWith(path.basename(o.path).replace(/\.m?js$/, ''))) || benches[0] || null;
  const missing = [];
  if (!tests.length) missing.push('no owned test file');
  if (!bench) missing.push('no owned bench file');
  if (!verdict) missing.push('no verdict file after BAR');
  if (missing.length) return { plan: null, refused, dropped, reason: 'the grammar is silent: ' + missing.join(', ') };
  const bar = ['node', bench.path, ...bench.flags].join(' ');
  return { plan: { files, test: 'node --test ' + tests.join(' '), bar, verdict }, refused, dropped, reason: null };
}

/** The PLAN ask: the item as the brief reads it, and the JSON shape of the answer. */
export function planPrompt(gap) {
  return [
    'PLAN board item ' + gap.id + '.',
    'OWNED: ' + gap.owns,
    'TASK:', String(gap.brief ?? ''),
    '',
    'Answer with one JSON object and nothing else: {"files": [the owned files to write, whole, sources first], "test": "node --test <the owned test files>", "bar": "node <the owned bench file and its flags>", "verdict": "bench/verdicts/<the bar verdict file>"}.',
  ].join('\n');
}

const jsonIn = (text) => {
  const s = String(text ?? '').replace(/<think>[\s\S]*?<\/think>/g, '');
  const f = /```(?:json)?\s*\n([\s\S]*?)```/.exec(s);
  const body = f ? f[1] : s;
  const a = body.indexOf('{'), b = body.lastIndexOf('}');
  if (a < 0 || b <= a) return null;
  try { return JSON.parse(body.slice(a, b + 1)); } catch { return null; }
};

/**
 * THE PLAN SCHEMA. files: an array of owned paths the ceiling allows (the others are refused and
 * listed; none left is the ceiling wall); test: node --test over owned test files; bar: a node
 * command over an owned file; verdict: a bench/verdicts/*.json path.
 */
export function validatePlan(text, gap) {
  const j = typeof text === 'object' && text !== null ? text : jsonIn(text);
  if (!j || typeof j !== 'object') return { ok: false, reason: 'the answer holds no JSON object' };
  const owned = ownedFiles(gap.owns).map((o) => o.path);
  if (!Array.isArray(j.files) || !j.files.every((f) => typeof f === 'string')) return { ok: false, reason: 'files is not an array of paths' };
  const refused = [], files = [];
  for (const f of j.files) { const c = briefCeiling(f, owned); if (c.ok) { if (!files.includes(c.rel)) files.push(c.rel); } else refused.push({ file: f, reason: c.reason }); }
  if (!files.length) return { ok: false, ceiling: true, reason: 'every planned file is refused: ' + (refused.map((r) => r.reason).join('; ') || 'the plan names none'), refused };
  if (typeof j.test !== 'string' || !/^node --test(\s+\S+)+$/.test(j.test.trim())) return { ok: false, reason: 'test is not a "node --test <files>" command' };
  const tf = j.test.trim().split(/\s+/).slice(2).filter((a) => !a.startsWith('-'));
  const outT = tf.filter((f) => !owned.includes(normRel(f)));
  if (outT.length) return { ok: false, ceiling: true, reason: 'the test command runs files outside the owned set: ' + outT.join(', ') };
  if (typeof j.bar !== 'string' || !/^node\s+\S+/.test(j.bar.trim())) return { ok: false, reason: 'bar is not a node command' };
  const bf = normRel(j.bar.trim().split(/\s+/)[1]);
  if (!owned.includes(bf)) return { ok: false, ceiling: true, reason: 'the bar command runs a file outside the owned set: ' + bf };
  if (typeof j.verdict !== 'string' || !/^bench\/verdicts\/[\w.-]+\.json$/.test(normRel(j.verdict))) return { ok: false, reason: 'verdict is not a bench/verdicts/*.json path' };
  const dropped = Array.isArray(j.dropped) ? j.dropped : [];
  return { ok: true, value: { files, test: j.test.trim(), bar: j.bar.trim(), verdict: normRel(j.verdict), dropped, refused } };
}

// ================================================================== the file schema
/** The one fenced block of an answer (the longest when there are several), reasoning removed. */
export function fenceOf(text) {
  const s = String(text ?? '').replace(/<think>[\s\S]*?<\/think>/g, '');
  const fences = [...s.matchAll(/```[\w.-]*[ \t]*\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  if (!fences.length) return null;
  return fences.reduce((a, b) => (b.length > a.length ? b : a)).replace(/\r\n/g, '\n');
}

/** The import specifiers of a module's source. */
export function specifiersOf(src) {
  const out = [];
  for (const m of String(src).matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm)) out.push(m[1]);
  for (const m of String(src).matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) out.push(m[1]);
  for (const m of String(src).matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) out.push(m[1]);
  return out;
}

const BUILTINS = new Set(builtinModules.filter((m) => !m.startsWith('_') && !m.startsWith('node:'))); // node:-only modules (node:test) are listed prefixed; they have no bare form
/** A bare Node builtin specifier ('path', 'fs/promises') rewritten to its node: form, the only spelling the gate accepts; returns the text and the count. */
export function nodePrefixed(src) {
  let n = 0;
  const fix = (m, pre, q, spec) => (BUILTINS.has(spec) ? (n++, pre + q + 'node:' + spec + q) : m);
  const out = String(src)
    .replace(/(^\s*(?:import|export)\b[^;]*?\bfrom\s*)(['"])([^'"]+)\2/gm, fix)
    .replace(/(^\s*import\s*)(['"])([^'"]+)\2/gm, fix)
    .replace(/(\bimport\(\s*)(['"])([^'"]+)\2/g, fix);
  return { src: out, rewritten: n };
}

/**
 * THE FILE SCHEMA. One fenced block holding the whole file (fenced false: the text is the file); an
 * em-dash is replaced by a hyphen and the count recorded; a bare builtin ('path') becomes 'node:path',
 * counted; a module imports only node: builtins or
 * relative paths that exist on the copy or in the plan; node:test has no expect(); the source
 * parses (node --check on the copy); a JSON file parses; a note is not empty.
 * @returns {{ok, content, reason, emDashes}}
 */
export function validateFile(rel, text, { copyDir = null, planFiles = [], fenced = true, check = true } = {}) {
  let body = fenced ? fenceOf(text) : String(text ?? '');
  if (body === null) return { ok: false, reason: 'the answer holds no fenced code block' };
  const emDashes = body.split(EM).length - 1;
  if (emDashes) body = body.split(EM).join('-');
  if (!body.trim()) return { ok: false, reason: 'the fenced block is empty' };
  if (!body.endsWith('\n')) body += '\n';
  if (/\.json$/.test(rel)) { try { JSON.parse(body); } catch (e) { return { ok: false, reason: 'the JSON does not parse: ' + firstLine(e) }; } return { ok: true, content: body, emDashes }; }
  if (/\.md$/.test(rel)) return { ok: true, content: body, emDashes };
  const np = nodePrefixed(body);
  body = np.src;
  const builtinRewrites = np.rewritten;
  if (/\bimport\s*\{[^}]*\bexpect\b[^}]*\}\s*from\s*['"]node:test['"]/.test(body)) return { ok: false, reason: 'node:test has no expect(): use assert from node:assert/strict' };
  for (const spec of specifiersOf(body)) {
    if (spec.startsWith('node:')) continue;
    if (!spec.startsWith('./') && !spec.startsWith('../')) return { ok: false, reason: 'imports "' + spec + '": only node: builtins or relative paths (no dependencies)' };
    const target = normRel(path.posix.normalize(path.posix.join(path.posix.dirname(normRel(rel)), spec)));
    const onCopy = copyDir && existsSync(path.join(copyDir, ...target.split('/')));
    if (!onCopy && !planFiles.includes(target)) return { ok: false, reason: 'imports "' + spec + '" (' + target + '), which is neither on the copy nor in the plan' };
  }
  if (copyDir && check) {
    const probe = path.join(copyDir, '.brief-check-' + process.pid + path.extname(rel));
    try {
      writeFileSync(probe, body);
      const r = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8', timeout: 30_000, windowsHide: true });
      if (r.status !== 0) return { ok: false, reason: 'node --check refused it: ' + (String(r.stderr || '').split('\n').filter((l) => /Error/.test(l))[0] || 'exit ' + r.status) };
    } finally { try { rmSync(probe, { force: true }); } catch { /* gone */ } }
  }
  return { ok: true, content: body, emDashes, builtinRewrites };
}

/** The exported names and signatures of a module, one line each. */
export function exportsOf(src) {
  const out = [];
  for (const m of String(src).matchAll(/^export\s+((?:async\s+)?function\s*\*?\s*[\w$]+\s*\([^)]*\)|(?:const|let|class)\s+[\w$]+)/gm)) out.push('export ' + m[1].replace(/\s+/g, ' '));
  return out;
}

const RULES_COMMON = [
  'JavaScript ES modules for Node 24 with no dependencies: import only node: builtins or relative paths.',
  'No network, no child process, no em-dash character anywhere.',
];
/** The exact verdict boilerplate a bench ends with: the model copies it instead of reasoning it out. */
function benchSkeleton(plan) {
  return ['Keep the bench short (under 60 lines). Its imports and its verdict write are exactly these lines (fill in measured, an object holding each measured count, and barMet, split and statement from what it measured):',
    "import { writeFileSync, mkdirSync } from 'node:fs';",
    "import path from 'node:path';",
    "import { fileURLToPath } from 'node:url';",
    "const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '" + plan.verdict + "');",
    'mkdirSync(path.dirname(file), { recursive: true });',
    "writeFileSync(file, JSON.stringify({ at: new Date().toISOString(), command: '" + plan.bar + "', node: process.version, isTheBar: true, barMet, ...measured, split, statement }, null, 2));",
  ].join('\n');
}

function rulesFor(rel, plan) {
  if (/\.md$/.test(rel)) return ['Plain prose notes: what was built, the commands, the numbers are the ones the bar prints. No em-dash character.'];
  const r = [...RULES_COMMON];
  if (isTest(rel)) {
    r.push('A test file: import { test } from \'node:test\' and assert from \'node:assert/strict\'. node:test has no expect(). It finishes in under 60 s, writes nothing outside os.tmpdir(), and never calls process.exit.',
      'Import the module under test by its relative path from test/ (for example \'../planted/x.mjs\').');
  } else if (isBench(rel)) {
    r.push('A bench: print one line per measured thing, then write the verdict file ' + plan.verdict + ' (resolve it as path.resolve(path.dirname(fileURLToPath(import.meta.url)), \'..\', \'' + plan.verdict + '\'), mkdirSync its directory with recursive true) holding JSON with the fields ' + VERDICT_FIELDS.join(', ') + ': at (ISO time), command (the command line that ran it), node (process.version), isTheBar: true, barMet (a boolean), split and statement, written with JSON.stringify(v, null, 2). Never call process.exit before that write.',
      'Every measured count is its own field of the verdict (for example checked: 1000, mismatches: 0), and statement is one plain sentence that quotes at least one of those numbers of 10 or more exactly as the field holds it (for example "checked 1000, mismatches 0"): the gate refuses a statement that quotes none of the numbers of its own verdict ("all tests passed" is refused).',
      benchSkeleton(plan));
  } else r.push('A source module: export what the task names, with the exact names and signatures it states.');
  return r;
}

/** The WRITE ask for one file: the item, the plan, the exports already written, the rules. No run-specific text, so a replay asks the same text. */
export function writePrompt(gap, plan, rel, { current = null, written = {} } = {}) {
  const L = ['WRITE one whole file for board item ' + gap.id + ': ' + rel + (current === null ? ' (a new file).' : ' (an existing file; its current text is below).'), '', 'TASK:', String(gap.brief ?? ''), '', 'OWNED: ' + gap.owns,
    'PLAN: files ' + plan.files.join(', ') + '; tests `' + plan.test + '`; bar `' + plan.bar + '`; verdict ' + plan.verdict + '.'];
  const ex = Object.entries(written).filter(([f]) => f !== rel && isCode(f)).map(([f, src]) => '  ' + f + ': ' + (exportsOf(src).join('; ') || '(no export)'));
  if (ex.length) L.push('', 'EXPORTS of the files already written:', ...ex);
  if (current !== null) L.push('', 'CURRENT ' + rel + ':', '```', current.replace(/\n$/, ''), '```');
  L.push('', 'RULES:', ...rulesFor(rel, plan).map((r) => '- ' + r), '', 'Answer with ONE fenced code block holding the whole file ' + rel + ' and nothing else.');
  return L.join('\n');
}

/** The first FAIL_LINES lines of a failure, from its first failing line, BUDGET lines left out. */
export function failureLines(out, n = FAIL_LINES) {
  const lines = String(out ?? '').split(/\r?\n/).filter((l) => !/^BUDGET\b/.test(l));
  let i = lines.findIndex((l) => /^\s*not ok\b|Error\b|✖|failing tests|ERR_/.test(l));
  if (i < 0) i = Math.max(0, lines.length - n);
  return lines.slice(i, i + n).join('\n');
}

/** The REPAIR ask: the failing command, the failure, every written file whole, the answer shape. */
export function repairPrompt(gap, plan, written, { command, failure, round, rounds }) {
  const L = ['REPAIR board item ' + gap.id + ': the command `' + command + '` failed on the copy (repair round ' + round + ' of ' + rounds + ').', '', 'TASK:', String(gap.brief ?? ''), '', 'FAILURE (its first ' + FAIL_LINES + ' lines):', failure, '', 'FILES the brief wrote (whole):'];
  for (const [f, src] of Object.entries(written)) L.push('', 'FILE ' + f + ':', '```', src.replace(/\n$/, ''), '```');
  const allRules = [...new Set(Object.keys(written).flatMap((f) => rulesFor(f, plan)))];
  L.push('', 'RULES:', ...allRules.map((r) => '- ' + r), '',
    'Answer with a first line "FILE: <path>" naming the ONE file to rewrite (one of: ' + Object.keys(written).join(', ') + '), then ONE fenced code block holding that whole file, and nothing else.');
  return L.join('\n');
}

/** The target of a repair answer: its FILE: line, else the written file the failure names most, else the test file. */
export function repairTarget(text, written, failure = '') {
  const files = Object.keys(written);
  const m = /^\s*\**FILE:?\**\s*`?([\w./\\-]+\.\w+)`?/m.exec(String(text ?? '').replace(/<think>[\s\S]*?<\/think>/g, ''));
  if (m) return { file: normRel(m[1]), from: 'FILE line' };
  const counts = files.map((f) => ({ f, n: String(failure).split(path.basename(f)).length - 1 })).sort((a, b) => b.n - a.n);
  if (counts.length && counts[0].n > 0) return { file: counts[0].f, from: 'named in the failure' };
  return { file: files.find(isTest) || files[0], from: 'the test file (no FILE line)' };
}

// ================================================================== the chain
/** A per-run budget: model calls, the run wall, the per-call wall; calls[] holds every call. */
export function briefBudget({ modelCalls = MODEL_CALLS, wallMinutes = WALL_MINUTES, callWallMs = CALL_WALL_MS } = {}) {
  const t0 = Date.now();
  return { max: modelCalls, used: 0, calls: [], wallMs: wallMinutes * 60_000, callWallMs, t0, left() { return this.wallMs - (Date.now() - t0); } };
}

/** The share of one call's wall the model may spend thinking before its thinking is closed for it. */
export const THINK_SHARE = 0.45;
/** Tokens the forced answer may write (a whole file of up to WHOLE_FILE_LINES lines fits). */
export const FORCED_ANSWER_TOKENS = 4000;
const LOCAL_BASE = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/**
 * ONE MODEL CALL WITH A THINKING BUDGET (budget forcing). The call streams /api/chat with think on;
 * when the thinking has run thinkMs with no answer begun, the stream is cut, the thinking so far is
 * kept, and one raw /api/generate request closes the think block after it (the qwen3 chat template:
 * "<think>\n...\n</think>\n\n") so the model writes its answer from what it has already reasoned,
 * inside the same call wall. A call whose answer starts in time is returned as it streams. Only a
 * local base is reached; any other is refused before a socket opens.
 * @returns {{ok, text, reason, tokens, thinkChars, forced, thinkSeconds, answerSeconds, requests}}
 */
export async function thinkBudgetCall({ base, model, system, prompt, timeoutMs, thinkMs = Math.round(timeoutMs * THINK_SHARE), numCtx = MODEL_OPTS.numCtx, maxTokens = MODEL_OPTS.maxTokens, answerTokens = FORCED_ANSWER_TOKENS, seed = null, fetchFn = fetch } = {}) {
  const b = String(base || '').replace(/\/+$/, '');
  if (!LOCAL_BASE.test(b)) return { ok: false, refused: true, text: null, reason: 'the model cell reaches a local Ollama only; base ' + b + ' is refused', requests: 0 };
  const t0 = Date.now();
  const options = { num_ctx: numCtx, num_predict: maxTokens, ...(Number.isInteger(seed) ? { seed } : {}) };
  const out = { ok: false, text: null, reason: null, tokens: null, thinkChars: 0, forced: false, thinkSeconds: null, answerSeconds: null, requests: 1 };
  let thinking = '', content = '', done = false;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetchFn(b + '/api/chat', { method: 'POST', signal: ac.signal, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], stream: true, think: true, keep_alive: '30m', options }) });
    if (!res.ok) throw new Error('ollama answered http ' + res.status);
    const dec = new TextDecoder();
    let buf = '';
    for await (const chunk of res.body) {
      buf += dec.decode(chunk, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line) continue;
        const j = JSON.parse(line);
        if (j.error) throw new Error('ollama: ' + j.error);
        if (j.message && typeof j.message.thinking === 'string') thinking += j.message.thinking;
        if (j.message && typeof j.message.content === 'string') content += j.message.content;
        if (j.done) { done = true; out.tokens = Number.isFinite(j.eval_count) ? j.eval_count : null; }
      }
      if (done) break;
      if (!content.trim() && Date.now() - t0 >= thinkMs) { out.forced = true; break; }
    }
  } catch (e) {
    if (!out.forced) { clearTimeout(timer); return { ...out, thinkChars: thinking.length, reason: 'ollama request failed: ' + firstLine(e) }; }
  }
  if (out.forced || !done) try { ac.abort(); } catch { /* closed */ }
  clearTimeout(timer);
  out.thinkChars = thinking.length;
  out.thinkSeconds = r2((Date.now() - t0) / 1000);
  if (done) {
    if (!content.trim()) return { ...out, reason: 'the model answered nothing after ' + out.thinkSeconds + ' s' };
    return { ...out, ok: true, text: content };
  }
  if (!out.forced) return { ...out, reason: 'the stream ended with no answer' };
  // The forced answer: the thinking so far, closed, then the answer, inside what is left of the wall.
  const left = timeoutMs - (Date.now() - t0);
  if (left < Math.min(5000, timeoutMs * 0.1)) return { ...out, reason: 'the call wall left no time for the forced answer' };
  out.requests = 2;
  const raw = '<|im_start|>system\n' + system + '<|im_end|>\n<|im_start|>user\n' + prompt + '<|im_end|>\n<|im_start|>assistant\n<think>\n' + thinking.trim() + '\n</think>\n\n';
  const a0 = Date.now();
  const ac2 = new AbortController();
  const timer2 = setTimeout(() => ac2.abort(), left);
  try {
    const res = await fetchFn(b + '/api/generate', { method: 'POST', signal: ac2.signal, headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model, prompt: raw, raw: true, stream: false, keep_alive: '30m', options: { ...options, num_predict: answerTokens } }) });
    if (!res.ok) throw new Error('ollama answered http ' + res.status);
    const j = await res.json();
    out.answerSeconds = r2((Date.now() - a0) / 1000);
    out.tokens = Number.isFinite(j.eval_count) ? j.eval_count : null;
    const text = String(j.response ?? '');
    if (!text.trim()) return { ...out, reason: 'the forced answer was empty' };
    return { ...out, ok: true, text };
  } catch (e) {
    out.answerSeconds = r2((Date.now() - a0) / 1000);
    return { ...out, reason: 'the forced answer failed: ' + firstLine(e) };
  } finally { clearTimeout(timer2); }
}

/**
 * The model cell, LAST in every chain: open weights through a local Ollama (qwen3:30b-a3b) with a
 * thinking budget (thinkBudgetCall), or a caller's mock (tests). A spent budget or wall answers
 * {ok: false, budget: true} and opens no socket; a closed provider is refused by authorConfig
 * before any socket.
 */
export function makeCell(budget, { cell = null, model = null, base = null, log = null, fetchFn = fetch } = {}) {
  const cfg = authorConfig({ model, base, timeoutMs: budget.callWallMs - 5000, maxTokens: MODEL_OPTS.maxTokens, numCtx: MODEL_OPTS.numCtx, think: MODEL_OPTS.think });
  const fn = async (req = {}) => {
    if (!cfg.ok && typeof cell !== 'function') return { ok: false, refused: true, reason: cfg.reason, ms: 0 };
    if (budget.used >= budget.max) return { ok: false, budget: true, reason: 'the budget of ' + budget.max + ' model call(s) for this run is spent', ms: 0 };
    const left = budget.left();
    if (left < 10_000) return { ok: false, budget: true, reason: 'the run wall of ' + Math.round(budget.wallMs / 60_000) + ' min is spent', ms: 0 };
    budget.used++;
    const timeoutMs = Math.max(1000, Math.min(budget.callWallMs - 5000, left - 5000));
    const t0 = Date.now();
    let r;
    try {
      r = typeof cell === 'function'
        ? await cell({ ...req, timeoutMs })
        : await thinkBudgetCall({ prompt: req.prompt, system: req.system || SYSTEM, model: cfg.model, base: cfg.base, timeoutMs, maxTokens: MODEL_OPTS.maxTokens, numCtx: MODEL_OPTS.numCtx, seed: Number.isInteger(req.seed) ? req.seed : null, fetchFn });
    } catch (e) { r = { ok: false, text: null, reason: 'the model cell threw: ' + firstLine(e) }; }
    const ms = Date.now() - t0;
    const call = { n: budget.used, step: req.step || null, file: req.file || null, phase: req.phase || null, seconds: r2(ms / 1000), ok: !!(r && r.ok), tokens: r && Number.isFinite(r.tokens) ? r.tokens : null, reason: r && !r.ok ? r.reason || 'no answer' : null, promptChars: String(req.prompt || '').length, model: typeof cell === 'function' ? 'mock' : cfg.model,
      forced: !!(r && r.forced), thinkSeconds: r && Number.isFinite(r.thinkSeconds) ? r.thinkSeconds : null, answerSeconds: r && Number.isFinite(r.answerSeconds) ? r.answerSeconds : null, thinkChars: r && Number.isFinite(r.thinkChars) ? r.thinkChars : null, requests: r && Number.isFinite(r.requests) ? r.requests : 1 };
    budget.calls.push(call);
    const how = call.forced ? ', thinking closed at ' + call.thinkSeconds + ' s (' + call.thinkChars + ' chars), answer ' + call.answerSeconds + ' s' : '';
    if (log) log('    model call ' + call.n + '/' + budget.max + ': ' + call.step + (call.file ? ' ' + call.file : '') + (call.phase ? ' (' + call.phase + ')' : '') + ', ' + call.seconds + ' s' + how + ', ' + (call.ok ? 'answered' + (call.tokens !== null ? ' (' + call.tokens + ' tokens)' : '') : 'no answer: ' + call.reason));
    return { ...(r || {}), ok: !!(r && r.ok), ms };
  };
  fn.config = cfg;
  return fn;
}

const directBody = (a) => { const t = String(a.text); return t.slice(t.indexOf('\n') + 1); };

/**
 * ONE STEP'S ASK: ask() first (the direct table inside it, then for a code-shaped prompt the code
 * region with the model cell as its sampler), then the organism's exact method when the step has
 * one, then the model cell, then re-asks with the reason (MODEL_ATTEMPTS in all). Every tier's answer passes
 * validate() before it is used.
 * @returns {object} the step record: provenance, method, lookupNs, askUs, exactUs, stepUs, modelCalls, modelSeconds, value, text, ok, reason, attempts
 */
export async function askChain(prompt, { step, file = null, table = null, cell, budget, validate, exact = null, code = null, system = SYSTEM } = {}) {
  const rec = { kind: 'ask', step, file, key: code ? code.prompt : prompt, provenance: null, method: null, lookupNs: null, askUs: null, exactUs: null, stepUs: null, modelCalls: 0, modelSeconds: 0, ok: false, value: null, text: null, reason: null, budget: false, refused: false, ceiling: false, attempts: [] };
  const c0 = budget.used, n0 = budget.calls.length, s0 = nowNs();
  const tally = () => { rec.modelCalls = budget.used - c0; rec.modelSeconds = r2(budget.calls.slice(n0).reduce((t, c) => t + c.seconds, 0)); rec.stepUs = r2(usSince(s0)); return rec; };
  const accept = (prov, text, extra = {}, how = {}) => {
    const v = validate(text, how);
    rec.attempts.push({ tier: prov, ok: v.ok, reason: v.ok ? null : v.reason });
    if (!v.ok) { rec.reason = v.reason; if (v.ceiling) rec.ceiling = true; return false; }
    Object.assign(rec, { provenance: prov, ok: true, value: v.value ?? v.content ?? text, text: v.content ?? (typeof text === 'string' ? text : JSON.stringify(text)), reason: null, ceiling: false, emDashes: v.emDashes || 0, ...extra });
    return true;
  };
  // 1. ask(): the direct table, then (code-shaped) the code region
  const wrapped = (req) => cell({ ...req, step, file, system });
  const t0 = nowNs();
  let a = null;
  try {
    a = code
      ? await ask(null, code.prompt, { provider: 'ollama', cell: wrapped, regions: { code: { ...CODE_REGION, maxTokens: MODEL_OPTS.maxTokens }, math: false }, direct: table || false, knowledge: false, spawn: false, timeoutMs: budget.callWallMs - 5000 })
      : await ask(null, prompt, { provider: 'null', direct: table || false, knowledge: false, regions: false, spawn: false });
  } catch (e) { rec.attempts.push({ tier: 'ask', ok: false, reason: 'ask() threw: ' + firstLine(e) }); }
  rec.askUs = r2(usSince(t0));
  const pa = a && a.provenance ? a.provenance.answer : null;
  if (pa === 'direct') {
    rec.lookupNs = a.provenance.lookupNs;
    const note = String(a.provenance.method || '');
    if (accept('direct', directBody(a), { method: note }, { raw: true, verified: /^verified:/.test(note) })) return tally();
  } else if (code && a && a.region && a.region.reached && a.region.answer) {
    const src = a.region.answer;
    const exported = src.replace(new RegExp('(^|\\n)(\\s*)((?:async\\s+)?function\\s*\\*?\\s*' + code.entry.replace(/\$/g, '\\$') + '\\s*\\()'), '$1$2export $3');
    const content = '// ' + file + ': written by ' + BRIEF_AUTHOR + ' for board item ' + (code.gapId || '?') + ' (the code region of ask()).\n' + code.doc.join('\n') + '\n' + exported.replace(/\n$/, '') + '\n';
    if (accept(pa, content, { method: 'code region: ' + (a.region.calls ?? 0) + ' sample(s), ' + (a.region.passedExtracted ?? 0) + '/' + (a.region.extracted ?? 0) + ' stated examples passed' }, { raw: true })) return tally();
  } else if (code && a && a.region && !a.region.reached) {
    const why = a.provenance && a.provenance.llm ? a.provenance.llm.reason : null;
    rec.attempts.push({ tier: 'region', ok: false, reason: why || 'the code region was not reached' });
    if (why && /budget|wall|open weights/.test(why)) { rec.budget = /budget|wall/.test(why); rec.refused = /open weights/.test(why); rec.reason = why; return tally(); }
  } else if (pa === 'exact' && a && a.exact) {
    if (accept('exact', String(a.exact.answer), { method: a.exact.method })) return tally();
  }
  // 2. the organism's exact method for this step
  if (typeof exact === 'function') {
    const e0 = nowNs();
    let ex = null;
    try { ex = exact(); } catch (e) { rec.attempts.push({ tier: 'exact', ok: false, reason: 'the exact method threw: ' + firstLine(e) }); }
    rec.exactUs = r2(usSince(e0));
    if (ex && ex.answer !== null && ex.answer !== undefined) { if (accept('exact', ex.answer, { method: ex.method })) return tally(); }
    else if (ex) rec.attempts.push({ tier: 'exact', ok: false, reason: ex.reason || 'the exact method is silent' });
  }
  // 3. the model cell, last; 4. re-asks with the reason (a refused schema, or no answer inside the call wall)
  const fullPrompt = code ? code.writePrompt : prompt;
  let lastSilent = false;
  for (let attempt = 0; attempt < MODEL_ATTEMPTS; attempt++) {
    const p = attempt === 0 ? fullPrompt : fullPrompt + (lastSilent
      ? '\n\nYOUR PREVIOUS ANSWER DID NOT ARRIVE (' + rec.reason + '). Think for a few lines only, then answer.'
      : '\n\nYOUR PREVIOUS ANSWER WAS REFUSED: ' + rec.reason + '\nAnswer again, following every rule.');
    if (attempt > 0 || code) {
      // a text not yet asked goes down the chain from the top too (one lookup)
      try { const b = await ask(null, p, { provider: 'null', direct: table || false, knowledge: false, regions: false, spawn: false }); if (b && b.provenance && b.provenance.answer === 'direct' && accept('direct', directBody(b), { lookupNs: b.provenance.lookupNs, method: b.provenance.method }, { raw: true, verified: /^verified:/.test(String(b.provenance.method || '')) })) return tally(); } catch { /* the model below */ }
    }
    const m = await cell({ prompt: p, system, step, file, phase: attempt === 0 ? 'answer' : lastSilent ? 're-ask after no answer' : 'schema re-ask' });
    if (!m.ok) {
      rec.attempts.push({ tier: 'model', ok: false, reason: m.reason }); rec.reason = m.reason; rec.budget = !!m.budget; rec.refused = !!m.refused;
      if (rec.budget || rec.refused) break;
      lastSilent = true; continue; // a call with no answer inside its wall is asked again while the budget lasts
    }
    lastSilent = false;
    if (accept('model', m.text)) return tally();
  }
  return tally();
}

// ================================================================== the library
export const directFileOf = (stateRoot) => path.join(stateRoot, ...STATE_REL.split('/'), DIRECT_NAME);
/** The brief's direct table, or a fresh one when the file is absent or unreadable. */
export function loadTable(file) {
  if (file && existsSync(file)) { try { return { table: DirectTable.load(file), loaded: true, error: null }; } catch (e) { return { table: new DirectTable({ capacity: 256 }), loaded: false, error: firstLine(e) }; } }
  return { table: new DirectTable({ capacity: 256 }), loaded: false, error: null };
}
/** Learn one answer under the text of the ask that produced it. */
export function learn(table, askText, answer, note, title = null) {
  return table.set(textKey(askText), { source: 'exact', answer: String(answer), note, title, confidence: 1, item: -1 });
}

// ================================================================== the copy
/**
 * Pin a copy to git HEAD for every path the working tree changed that the caller does not keep: a
 * control against other builders' half-written files. Read-only git (status, show). Returns counts.
 */
export function pinCopy(copyDir, root, { keep = [] } = {}) {
  const st = spawnSync('git', ['-C', root, 'status', '--porcelain=v1', '-z'], { encoding: 'buffer', maxBuffer: 64 << 20, windowsHide: true });
  if (st.status !== 0) return { pinned: 0, removed: 0, kept: 0, missing: 0, changed: 0, skipped: 'git status failed: ' + String(st.stderr || '').split('\n')[0] };
  const parts = st.stdout.toString('utf8').split('\0').filter(Boolean);
  const keepSet = new Set(keep.map(normRel));
  let pinned = 0, removed = 0, kept = 0, missing = 0;
  const files = [];
  for (let i = 0; i < parts.length; i++) {
    const xy = parts[i].slice(0, 2), rel = normRel(parts[i].slice(3));
    if (xy[0] === 'R' || xy[0] === 'C') i++;
    files.push({ xy, rel });
  }
  const pinnedFiles = [], removedFiles = [];
  for (const { xy, rel } of files) {
    const bare = rel.replace(/\/$/, '');
    if (keepSet.has(bare) || [...keepSet].some((k) => k.endsWith('/') && bare.startsWith(k))) { kept++; continue; }
    const abs = path.join(copyDir, ...bare.split('/'));
    if (xy === '??') { if (existsSync(abs)) { rmSync(abs, { recursive: true, force: true }); removed++; removedFiles.push(bare); } continue; }
    const show = spawnSync('git', ['-C', root, 'show', 'HEAD:' + bare], { encoding: 'buffer', maxBuffer: 256 << 20, windowsHide: true });
    if (show.status !== 0) { if (existsSync(abs)) { rmSync(abs, { recursive: true, force: true }); removed++; removedFiles.push(bare); } else missing++; continue; }
    if (!existsSync(path.dirname(abs))) continue; // an excluded directory (state/, organism/): not on the copy
    writeFileSync(abs, show.stdout); pinned++; pinnedFiles.push(bare);
  }
  return { pinned, removed, kept, missing, changed: files.length, pinnedFiles, removedFiles };
}

// ================================================================== the patch set
/** Whole-file unified diffs of the kept files against the real tree, author "organism (brief)". */
export function patchSetOf(written, root = ROOT, meta = {}) {
  const files = [];
  let patch = '';
  for (const [f, after] of Object.entries(written)) {
    const abs = path.join(root, ...f.split('/'));
    const before = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
    const a = after.replace(/\n$/, '').split('\n');
    const b = before === null ? [] : before.replace(/\n$/, '').split('\n');
    patch += (before === null ? '--- /dev/null\n' : '--- a/' + f + '\n') + '+++ b/' + f + '\n' + '@@ -' + (b.length ? '1,' + b.length : '0,0') + ' +1,' + a.length + ' @@\n' + (b.length ? b.map((l) => '-' + l).join('\n') + '\n' : '') + a.map((l) => '+' + l).join('\n') + '\n';
    files.push({ file: f, isNew: before === null, lines: a.length, sha256: sha(after), content: after });
  }
  return { author: BRIEF_AUTHOR, evidence: 'brief', judged: true, files, patch, ...meta };
}

// ================================================================== provenance
const isModelClass = (p) => String(p).includes('model');
/** The provenance share of a run's asks: organism classes (direct, exact, memory, solved...) against the model cell, and the mean latency per class. */
export function provenanceShare(steps) {
  const asks = steps.filter((s) => s.kind === 'ask' && s.ok && s.provenance);
  const by = {};
  for (const s of asks) {
    const c = (by[s.provenance] = by[s.provenance] || { n: 0, stepUs: 0, askUs: 0, lookupNs: 0, lookups: 0, modelSeconds: 0, modelCalls: 0 });
    c.n++; c.stepUs += s.stepUs || 0; c.askUs += s.askUs || 0; c.modelSeconds += s.modelSeconds || 0; c.modelCalls += s.modelCalls || 0;
    if (Number.isFinite(s.lookupNs)) { c.lookupNs += s.lookupNs; c.lookups++; }
  }
  const byClass = {};
  for (const [k, c] of Object.entries(by)) byClass[k] = { n: c.n, meanStepUs: r2(c.stepUs / c.n), meanAskUs: r2(c.askUs / c.n), meanLookupNs: c.lookups ? Math.round(c.lookupNs / c.lookups) : null, meanModelSeconds: r2(c.modelSeconds / c.n), modelCalls: c.modelCalls };
  const organism = asks.filter((s) => !isModelClass(s.provenance)).length;
  return { asks: asks.length, organism, model: asks.length - organism, share: asks.length ? r2(organism / asks.length) : null, byClass };
}

/** The printed lines of a provenance share. */
export function shareLines(sh) {
  const L = ['  PROVENANCE SHARE: ' + sh.organism + ' of ' + sh.asks + ' accepted answers by the organism (direct, exact, memory), ' + sh.model + ' by the model cell' + (sh.share !== null ? ' (organism share ' + sh.share + ')' : '')];
  for (const [k, c] of Object.entries(sh.byClass)) L.push('    ' + k.padEnd(12) + ' n ' + c.n + ', mean step ' + (isModelClass(k) ? r2(c.meanStepUs / 1e6) + ' s (' + c.modelCalls + ' model call(s), ' + c.meanModelSeconds + ' s of model per step)' : c.meanStepUs + ' us') + (c.meanLookupNs !== null ? ', mean lookup ' + c.meanLookupNs + ' ns' : ''));
  return L;
}

// ================================================================== the run
const stepText = (s) => {
  if (s.kind !== 'ask') return s.step.toUpperCase() + ' ' + (s.ok ? 'ok' : 'FAILED') + ', ' + s.seconds + ' s' + (s.detail ? ': ' + s.detail : '');
  const lat = isModelClass(s.provenance || '') ? r2(s.stepUs / 1e6) + ' s' : s.stepUs + ' us';
  return s.step.toUpperCase() + (s.file ? ' ' + s.file : '') + (s.round ? ' (round ' + s.round + ')' : '') + ': ' + (s.ok ? s.provenance + (s.method ? ' (' + s.method + ')' : '') : 'no valid answer (' + s.reason + ')') +
    ', step ' + lat + (s.lookupNs !== null && s.lookupNs !== undefined ? ', lookup ' + s.lookupNs + ' ns' : '') + ', ask() ' + s.askUs + ' us' + (s.exactUs !== null ? ', exact ' + s.exactUs + ' us' : '') + ', ' + s.modelCalls + ' model call(s)' + (s.modelCalls ? ' ' + s.modelSeconds + ' s' : '') + (s.emDashes ? ', ' + s.emDashes + ' em-dash(es) replaced' : '');
};

const countIn = (s, re) => { const m = String(s || '').match(re); return m ? Number(m[1]) : null; };

/**
 * The gate on a copy WITH an item against the gate on the same kind of copy WITHOUT it (the base):
 * the red test files the item adds, and whether the em-dash or bad-import counts rose.
 */
export function gateDeltaOf(base, red, summary) {
  const baseRed = Array.isArray(base && base.red) ? base.red : [];
  const newRed = (red || []).filter((f) => !baseRed.includes(f));
  const emDash = countIn(summary, /em-dash files (\d+)/), badImports = countIn(summary, /bad imports (\d+)/);
  const rose = (a, b) => a !== null && b !== null && b !== undefined && a > b;
  const noNewRed = !(base && base.green) && newRed.length === 0 && !rose(emDash, base.emDash) && !rose(badImports, base.badImports);
  return { baseRed: baseRed.length, newRed, emDash, baseEmDash: base ? base.emDash ?? null : null, badImports, baseBadImports: base ? base.badImports ?? null : null, noNewRed };
}

/**
 * THE GATE BASE: the gate on a copy of the tree made exactly as a brief makes its copy (gate kit,
 * optional pin) with no item written: the control for the gate wall. The copy is deleted.
 * @returns {{green, red, summary, emDash, badImports, exit, outcome, seconds, peakRssMb, copyFiles, deleted}}
 */
export async function gateBaseline({ root = ROOT, tmpRoot = null, gateCmd = DEFAULT_GATE_CMD, gateKit = true, pin = false, ramMb = 6000, waitFreeRamMb = 0, wallMs = GATE_WALL_MS } = {}) {
  const c = copyTree(root, { tmpRoot, prefix: COPY_PREFIX });
  let out = null;
  try {
    if (gateKit) addGateKit(c.dir, root);
    if (pin) pinCopy(c.dir, root, { keep: [] });
    const g0 = Date.now();
    const gr = await runCapped(trialArgv(gateCmd), c.dir, { wallMs, ramMb, waitFreeRamMb });
    let gv = null;
    try { const j = JSON.parse(readFileSync(path.join(c.dir, 'bench', 'verdicts', 'gate.json'), 'utf8')); if (Date.parse(j.at) >= g0 - 1000) gv = j; } catch { gv = null; }
    const summary = (String(gr.out || '').match(/^GATE (?:GREEN|RED):.*$/m) || [null])[0];
    out = {
      green: gr.exit === 0 && !!gv && gv.verdict === 'GREEN', red: gv && Array.isArray(gv.tests) ? gv.tests.filter((t) => t.exit !== 0).map((t) => t.file) : [],
      summary, emDash: countIn(summary, /em-dash files (\d+)/), badImports: countIn(summary, /bad imports (\d+)/),
      exit: gr.exit, outcome: gr.outcome, seconds: gr.seconds, peakRssMb: gr.peakRssMb, copyFiles: c.files,
    };
  } finally {
    const d = deleteCopy(c.dir);
    if (out) out.deleted = d.deleted;
  }
  return out;
}

/**
 * Execute one board item's brief on a copy. See the header.
 * @param {object} gapIn a gap line of kind "board item" (or a parsed item with its board)
 * @param {object} o root, stateRoot, tmpRoot, modelCalls, wallMinutes, callWallMs, repairRounds,
 *   cell (a mock author for tests), model, base, direct (use and learn the table), directFile,
 *   gateCmd, gateKit, pin, keep, waitFreeRamMb, ramMb, log, hooks {beforeDelete}, runId
 */
export async function runBrief(gapIn, o = {}) {
  const cfg = {
    root: ROOT, stateRoot: null, tmpRoot: null, modelCalls: MODEL_CALLS, wallMinutes: WALL_MINUTES, callWallMs: CALL_WALL_MS, repairRounds: REPAIR_ROUNDS,
    cell: null, model: null, base: null, direct: true, directFile: null, gateCmd: DEFAULT_GATE_CMD, gateKit: true, pin: false, keep: [],
    waitFreeRamMb: 16384, ramMb: 6000, log: (l) => console.log(l), hooks: {}, runId: null, gateBase: null, ...o,
  };
  const t0 = Date.now();
  const runId = cfg.runId || stampOf();
  const say = (l) => { try { cfg.log(l); } catch { /* a sink that fails never stops the run */ } };
  const gap = normalizeGap(gapIn);
  const stateDir = path.join(cfg.stateRoot || cfg.root, ...STATE_REL.split('/'));
  mkdirSync(stateDir, { recursive: true });
  const recordFile = path.join(stateDir, today() + '.jsonl');
  const budget = briefBudget({ modelCalls: cfg.modelCalls, wallMinutes: cfg.wallMinutes, callWallMs: cfg.callWallMs });
  const cell = makeCell(budget, { cell: cfg.cell, model: cfg.model, base: cfg.base, log: say });
  const directFile = cfg.directFile || directFileOf(cfg.stateRoot || cfg.root);
  const lib = cfg.direct ? loadTable(directFile) : null;
  const table = lib ? lib.table : null;
  const steps = [];
  let copy = null, wall = null, reason = null, kept = false, patchSet = null, verdict = null, plan = null, phase = 'plan', learned = 0, pin = null, kit = null, gateDelta = null;
  const written = {}, keyOf = {};
  const record = (line) => { appendFileSync(recordFile, JSON.stringify({ at: new Date().toISOString(), runId, gap: gap ? gap.id : null, ...line, copy: copy ? copy.dir : null, copyExists: copy ? existsSync(copy.dir) : null }) + '\n'); };
  const push = (s) => { steps.push(s); const { value, text, key, ...slim } = s; record({ ...slim, answerSha: typeof text === 'string' ? sha(text) : null }); say('  ' + stepText(s)); };
  const stop = (w, r) => { if (wall) return; wall = w; reason = r; say('  REFUSED at the ' + w + ' wall: ' + r); };
  const left = () => budget.left();

  const finish = async () => {
    if (table && learned) { try { mkdirSync(path.dirname(directFile), { recursive: true }); table.save(directFile); } catch (e) { say('    the direct table was not saved: ' + firstLine(e)); } }
    const share = provenanceShare(steps);
    const seconds = r2((Date.now() - t0) / 1000);
    const modelSeconds = r2(budget.calls.reduce((t, c) => t + c.seconds, 0));
    record({ kind: 'decision', step: 'decision', decision: kept ? 'kept' : 'refused', wall, reason, author: kept ? BRIEF_AUTHOR : null, files: Object.keys(written), modelCalls: budget.used, modelSeconds, seconds, learned, gateDelta, share: { organism: share.organism, model: share.model, asks: share.asks } });
    say('  ' + (kept ? 'KEPT: ' + Object.keys(written).length + ' file(s) as a patch set by ' + BRIEF_AUTHOR + (verdict ? ', bar verdict isTheBar ' + verdict.isTheBar + ', barMet ' + verdict.barMet : '') : 'REFUSED at the ' + wall + ' wall') + '; ' + budget.used + ' model call(s), ' + modelSeconds + ' s of model, ' + seconds + ' s in all; ' + learned + ' answer(s) learned');
    for (const l of shareLines(share)) say(l);
    if (cfg.hooks && typeof cfg.hooks.beforeDelete === 'function') { try { await cfg.hooks.beforeDelete({ copy: copy ? copy.dir : null, recordFile, runId }); } catch (e) { say('    beforeDelete hook: ' + firstLine(e)); } }
    let del = null;
    if (copy) { del = deleteCopy(copy.dir); say('  copy deleted: ' + del.deleted + '; ' + del.freeMb + ' MB free on the temp drive'); }
    return {
      runId, gap: gap ? gap.id : null, kept, wall, reason, plan, steps, patchSet, verdict, modelCalls: budget.used, calls: budget.calls, modelSeconds, seconds, learned, gateDelta, share, recordFile,
      directFile: table ? directFile : null, pin, copy: copy ? { dir: copy.dir, files: copy.files, bytes: copy.bytes, deleted: del ? del.deleted : null, freeMb: del ? del.freeMb : null } : null,
    };
  };

  try {
    if (!gap || gap.kind !== BRIEF_KIND) { stop('plan', 'the brief operator takes a gap of kind "' + BRIEF_KIND + '"' + (gap ? ', this one is ' + gap.kind : '')); return await finish(); }
    say('BRIEF ' + gap.id + ': ' + gap.files.length + ' owned files; budget ' + budget.max + ' model calls, ' + cfg.wallMinutes + ' min wall, ' + budget.callWallMs / 1000 + ' s per call; direct table ' + (table ? table.n + ' entries' + (lib.loaded ? '' : ' (fresh)') : 'off') + '; run ' + runId);
    // 1. PLAN
    const pp = planPrompt(gap);
    const planRec = await askChain(pp, {
      step: 'plan', table, cell, budget, validate: (t) => validatePlan(t, gap),
      exact: () => { const g = grammarPlan(gap, cfg.root); return g.plan ? { answer: JSON.stringify({ ...g.plan, dropped: g.dropped, refused: g.refused }), method: 'brief-grammar' } : { answer: null, reason: g.reason }; },
    });
    push(planRec);
    if (!planRec.ok) { stop(planRec.budget || planRec.refused ? 'budget' : planRec.ceiling ? 'ceiling' : 'plan', planRec.reason || 'no plan'); return await finish(); }
    plan = planRec.value;
    const planJson = JSON.parse(planRec.text);
    if (planRec.provenance === 'exact' && table) { learn(table, pp, planRec.text, 'brief-grammar', gap.id); learned++; }
    say('    plan: write ' + (plan.files.join(', ') || 'nothing') + '; tests `' + plan.test + '`; bar `' + plan.bar + '`; verdict ' + plan.verdict);
    for (const d of planJson.dropped || []) { say('    dropped at the plan wall: ' + d.file + ' (' + d.reason + ')'); record({ kind: 'refusal', step: 'plan', wall: 'plan', file: d.file, reason: d.reason }); }
    for (const r of [...(planJson.refused || []), ...(plan.refused || [])]) { say('    refused at the ceiling wall: ' + r.file + ' (' + r.reason + ')'); record({ kind: 'refusal', step: 'plan', wall: 'ceiling', file: r.file, reason: r.reason }); }
    // the copy
    copy = copyTree(cfg.root, { tmpRoot: cfg.tmpRoot, prefix: COPY_PREFIX });
    if (cfg.gateKit) kit = addGateKit(copy.dir, cfg.root);
    if (cfg.pin) pin = pinCopy(copy.dir, cfg.root, { keep: cfg.keep });
    say('    copy: ' + copy.files + ' files, ' + Math.round(copy.bytes / 1048576) + ' MB in ' + copy.ms + ' ms' + (kit ? '; gate kit added' : '') + (pin ? '; pinned to git HEAD: ' + pin.pinned + ' changed file(s) restored, ' + pin.removed + ' untracked removed, ' + pin.kept + ' kept as the brief\'s own' + (pin.skipped ? ' (' + pin.skipped + ')' : '') : ''));
    record({ kind: 'copy', step: 'copy', files: copy.files, bytes: copy.bytes, ms: copy.ms, pin: pin ? { pinned: pin.pinned, removed: pin.removed, kept: pin.kept, skipped: pin.skipped || null } : null });
    // 2. WRITE
    phase = 'test';
    const blocks = codeBlocks(gap.brief);
    const sources = plan.files.filter((x) => !isTest(x) && !isBench(x) && isCode(x));
    for (const f of plan.files) {
      const abs = path.join(copy.dir, ...f.split('/'));
      const current = existsSync(abs) ? readFileSync(abs, 'utf8') : null;
      const wp = writePrompt(gap, plan, f, { current, written });
      let code = null;
      if (sources.includes(f) && current === null) {
        const blk = blocks.find((b) => b.before.includes(f)) || (sources.length === 1 ? blocks[0] : null);
        if (blk) code = { ...blk, gapId: gap.id, writePrompt: wp };
      }
      const rec = await askChain(wp, { step: 'write', file: f, table, cell, budget, code, validate: (t, how = {}) => validateFile(f, t, { copyDir: copy.dir, planFiles: plan.files, fenced: !how.raw, check: !how.verified }) });
      push(rec);
      if (!rec.ok) { stop(rec.budget || rec.refused ? 'budget' : 'test', 'no valid answer for ' + f + ': ' + rec.reason); return await finish(); }
      mkdirSync(path.dirname(abs), { recursive: true });
      writeFileSync(abs, rec.text);
      written[f] = rec.text; keyOf[f] = rec.key;
    }
    // 3. TEST and 4. BAR, repairs shared
    let rounds = 0;
    const repair = async (command, failure) => {
      rounds++;
      const rp = repairPrompt(gap, plan, written, { command, failure, round: rounds, rounds: cfg.repairRounds });
      let target = null;
      const rec = await askChain(rp, {
        step: 'repair', table, cell, budget,
        validate: (t) => {
          const tg = repairTarget(t, written, failure); target = tg.file;
          if (!Object.prototype.hasOwnProperty.call(written, tg.file)) return { ok: false, ceiling: true, reason: 'the repair names ' + tg.file + ', not a file the brief wrote' };
          return validateFile(tg.file, t, { copyDir: copy.dir, planFiles: plan.files });
        },
      });
      rec.file = rec.ok ? target : null; rec.round = rounds;
      push(rec);
      if (rec.ok) { writeFileSync(path.join(copy.dir, ...target.split('/')), rec.text); written[target] = rec.text; }
      return rec;
    };
    for (;;) {
      phase = 'test';
      if (left() <= 0) { stop('budget', 'the run wall of ' + cfg.wallMinutes + ' min is spent'); break; }
      const tr = await runCapped(trialArgv(plan.test), copy.dir, { wallMs: Math.max(1000, Math.min(TEST_WALL_MS, left())), ramMb: cfg.ramMb, waitFreeRamMb: cfg.waitFreeRamMb });
      const pass = (tr.out.match(/^# pass (\d+)$/m) || tr.out.match(/^ℹ pass (\d+)$/m) || [])[1];
      const fail = (tr.out.match(/^# fail (\d+)$/m) || tr.out.match(/^ℹ fail (\d+)$/m) || [])[1];
      push({ kind: 'run', step: 'test', command: plan.test, ok: tr.exit === 0, exit: tr.exit, outcome: tr.outcome, seconds: tr.seconds, peakRssMb: tr.peakRssMb, pass: pass !== undefined ? Number(pass) : null, fail: fail !== undefined ? Number(fail) : null, detail: 'exit ' + tr.exit + (pass !== undefined ? ', pass ' + pass + ', fail ' + fail : '') + (tr.outcome !== 'exit' ? ' (' + tr.outcome + ')' : '') });
      if (tr.exit !== 0) {
        if (rounds >= cfg.repairRounds) { stop('test', 'the tests still fail after ' + rounds + ' repair round(s): ' + failureLines(tr.out, 3).replace(/\s*\n\s*/g, ' | ').slice(0, 300)); break; }
        const rr = await repair(plan.test, failureLines(tr.out));
        if (!rr.ok && (rr.budget || rr.refused)) { stop('budget', rr.reason); break; }
        continue;
      }
      phase = 'bar';
      if (left() <= 0) { stop('budget', 'the run wall of ' + cfg.wallMinutes + ' min is spent'); break; }
      const barStart = Date.now();
      const barWall = Math.max(1000, Math.min((gap.minutes || BAR_MINUTES) * 60_000, left()));
      const br = await runCapped(trialArgv(plan.bar), copy.dir, { wallMs: barWall, ramMb: cfg.ramMb, waitFreeRamMb: cfg.waitFreeRamMb });
      const vf = path.join(copy.dir, ...plan.verdict.split('/'));
      let v = null, vWhy = null;
      if (!existsSync(vf)) vWhy = plan.verdict + ' was not written';
      else if (statSync(vf).mtimeMs < barStart - 2000) vWhy = plan.verdict + ' is older than this bar run';
      else { try { v = JSON.parse(readFileSync(vf, 'utf8')); } catch (e) { vWhy = plan.verdict + ' does not parse: ' + firstLine(e); } }
      if (v && v.isTheBar !== true) vWhy = plan.verdict + ' says isTheBar ' + v.isTheBar;
      const missingFields = v ? VERDICT_FIELDS.filter((k) => !(k in v)) : [];
      if (v && !vWhy && missingFields.length) vWhy = plan.verdict + ' lacks ' + missingFields.join(', ');
      const sc = v && !vWhy ? statementCheck(v) : null;
      if (sc && !sc.ok) vWhy = plan.verdict + ': its statement "' + String(v.statement).slice(0, 160) + '" quotes none of the measured values of its own verdict (' + (sc.values.length ? 'it holds ' + sc.values.slice(0, 8).join(', ') : 'it holds no number field of 10 or more') + '); the gate (the findings page) refuses it: put each measured count in the verdict as a field and quote it in the statement';
      const bOk = br.exit === 0 && !vWhy;
      const printed = String(br.out || '').split(/\r?\n/).filter((l) => l.trim() && !/^BUDGET\b/.test(l)).slice(0, 3).map((l) => l.slice(0, 160));
      push({ kind: 'run', step: 'bar', command: plan.bar, ok: bOk, exit: br.exit, outcome: br.outcome, seconds: br.seconds, peakRssMb: br.peakRssMb, printed, verdict: v ? { isTheBar: v.isTheBar, barMet: v.barMet, statement: v.statement } : null, detail: 'exit ' + br.exit + (br.outcome !== 'exit' ? ' (' + br.outcome + ')' : '') + (v ? ', verdict isTheBar ' + v.isTheBar + ', barMet ' + v.barMet : '') + (vWhy ? ', ' + vWhy : '') + (printed.length ? '; printed: ' + printed.join(' | ') : '') });
      if (!bOk) {
        const timedOut = br.outcome && br.outcome !== 'exit' && br.outcome !== 'error';
        if (timedOut || rounds >= cfg.repairRounds) { stop('bar', (timedOut ? 'the bar ran into its ' + Math.round(barWall / 60_000) + ' min wall (' + br.outcome + ')' : 'the bar still fails after ' + rounds + ' repair round(s)') + ': ' + (vWhy || 'exit ' + br.exit)); break; }
        const rr = await repair(plan.bar, (vWhy ? 'THE VERDICT: ' + vWhy + '\n' : '') + failureLines(br.out));
        if (!rr.ok && (rr.budget || rr.refused)) { stop('budget', rr.reason); break; }
        continue;
      }
      verdict = v;
      break;
    }
    // 5. GATE
    if (!wall) {
      phase = 'gate';
      if (left() <= 0) stop('budget', 'the run wall of ' + cfg.wallMinutes + ' min is spent');
      else {
        const gStart = Date.now();
        const gr = await runCapped(trialArgv(cfg.gateCmd), copy.dir, { wallMs: Math.max(1000, Math.min(GATE_WALL_MS, left())), ramMb: cfg.ramMb, waitFreeRamMb: cfg.waitFreeRamMb });
        let gv = null;
        try { const j = JSON.parse(readFileSync(path.join(copy.dir, 'bench', 'verdicts', 'gate.json'), 'utf8')); if (Date.parse(j.at) >= gStart - 1000) gv = j; } catch { gv = null; }
        const green = gr.exit === 0 && !!gv && gv.verdict === 'GREEN';
        const red = gv && Array.isArray(gv.tests) ? gv.tests.filter((t) => t.exit !== 0).map((t) => t.file) : [];
        const summary = (gr.out.match(/^GATE (?:GREEN|RED):.*$/m) || [null])[0];
        if (!green && cfg.gateBase) gateDelta = gateDeltaOf(cfg.gateBase, red, summary);
        push({ kind: 'run', step: 'gate', command: cfg.gateCmd, ok: green, exit: gr.exit, outcome: gr.outcome, seconds: gr.seconds, peakRssMb: gr.peakRssMb, red, gateDelta, detail: (summary ? summary.slice(0, 200) : 'exit ' + gr.exit + ', gate.json ' + (gv ? gv.verdict : 'not written by this run')) + (red.length ? '; red: ' + red.slice(0, 6).join(', ') : '') });
        if (!green) stop('gate', 'the gate on the copy is not GREEN' + (red.length ? ' (red: ' + red.slice(0, 6).join(', ') + ')' : ' (exit ' + gr.exit + ', ' + gr.outcome + ')') +
          (gateDelta ? (gateDelta.noNewRed ? '; the base gate is RED on the same ' + gateDelta.baseRed + ' file(s) without this item: it adds no new red' : '; new red over the base: ' + (gateDelta.newRed.join(', ') || 'the em-dash or import count rose')) : ''));
        else kept = true;
      }
    }
    // A KEPT item is learned as verified. An item whose tests and bar passed on the copy and whose
    // gate is RED only where the base gate (cfg.gateBase, the same copy without the item) is RED is
    // learned as tested: its answers are replayed through validate() (node --check) and never
    // carry a patch set.
    const tested = !kept && wall === 'gate' && !!gateDelta && gateDelta.noNewRed && !!verdict;
    if (kept) patchSet = patchSetOf(written, cfg.root, { gap: gap.id, runId, verdict: plan.verdict, barMet: verdict ? verdict.barMet : null });
    if ((kept || tested) && table) { for (const f of Object.keys(written)) { learn(table, keyOf[f], written[f], (kept ? 'verified:' : 'tested:') + runId, f); learned++; } }
    return await finish();
  } catch (e) {
    stop(phase, 'the brief threw: ' + firstLine(e));
    return await finish();
  }
}

// ================================================================== the operator
/**
 * The brief as an operator of self/operators.mjs OPERATORS: an async generator (gap, root, budget)
 * that runs runBrief with root as the tree it copies (never writes) and yields the kept patch set,
 * or a refusal with its wall.
 */
export async function* brief(gap, root, budget = {}) {
  const g = normalizeGap(gap);
  if (!g || g.kind !== BRIEF_KIND) { yield { refused: true, operator: 'brief', wall: 'plan', reason: 'the brief operator takes a gap of kind "' + BRIEF_KIND + '"' }; return { best: null, reason: 'not a board item' }; }
  const m = budget.model || null;
  const r = await runBrief(g, { root, modelCalls: m ? Math.max(0, m.max - m.used) : MODEL_CALLS, cell: typeof budget.author === 'function' ? budget.author : null, model: budget.modelName || null, base: budget.base || null, log: budget.log || (() => {}), ...(budget.brief || {}) });
  if (m) { m.used += r.modelCalls; for (const c of r.calls) m.calls.push({ gap: g.id, ms: Math.round(c.seconds * 1000), seconds: c.seconds, ok: c.ok, model: c.model, reason: c.reason, provenance: 'model', step: c.step }); }
  if (!r.kept) { yield { refused: true, operator: 'brief', wall: r.wall, reason: r.reason, run: r.runId }; return { best: null, reason: r.reason }; }
  const cand = { refused: false, operator: 'brief', name: 'brief', author: BRIEF_AUTHOR, files: r.patchSet.files.map((f) => f.file), patch: r.patchSet.patch, patchSet: r.patchSet, run: r.runId, share: r.share };
  yield cand;
  return { best: cand, reason: null };
}

// ================================================================== CLI
// node self/brief.mjs --list [--board 13]
// node self/brief.mjs [--item board-13:exit] [--model-calls 40] [--wall 60] [--tmp DIR] [--pin] [--json]
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const val = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
  const id = val('--item');
  const board = id && /board-(\d+)/.test(id) ? Number(/board-(\d+)/.exec(id)[1]) : Number(val('--board', '13'));
  const s = smallestUndone({ board });
  if (argv.includes('--list')) {
    console.log('board ' + board + ' items from ' + s.source + ':');
    for (const r of s.rows) console.log('  ' + r.g.id + ': ' + r.g.files.length + ' owned, ' + (r.g.needsModel ? 'model' : 'model-off') + ', ' + (r.done ? 'DONE' : 'undone (' + r.reason + ')'));
    console.log('smallest undone model-off: ' + (s.pick ? s.pick.id : 'none'));
  } else {
    const g = id ? s.rows.map((r) => r.g).find((x) => x.id === id) : s.pick;
    if (!g) { console.log('no board item ' + (id || '(smallest undone model-off)') + ' in ' + s.source); process.exitCode = 1; }
    else {
      const r = await runBrief(g, { modelCalls: Number(val('--model-calls', String(MODEL_CALLS))), wallMinutes: Number(val('--wall', String(WALL_MINUTES))), tmpRoot: val('--tmp', null), pin: argv.includes('--pin') });
      if (argv.includes('--json')) console.log(JSON.stringify({ ...r, steps: r.steps.map(({ value, text, key, ...st }) => st), patchSet: r.patchSet ? { ...r.patchSet, files: r.patchSet.files.map(({ content, ...f }) => f) } : null }));
      process.exitCode = r.kept ? 0 : 2;
    }
  }
}
