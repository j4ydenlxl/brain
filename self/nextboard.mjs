// self/nextboard.mjs: THE NEXT BOARD, written by the organism from its own ledger.
// Author: board 15 builder (the code). The boards it writes carry "organism (nextboard)".
// MODEL OFF: nothing here opens a socket or runs a trial.
//
// His order (2026-09-24 14:29): "Time is approaching until my claude sub is ending self improving
// is extremely important it should be able to finish undone work". After the subscription ends
// nobody writes docs/boards/board-N.js. This file reads state/self/gaps.jsonl, ranks every gap by
// its distance to the bar over its trial minutes, takes the top 5 to 8 that carry a trial or a
// brief, and writes docs/boards/proposed/board-<N>.md in the grammar self/boards.mjs parses
// (renderProposedBoard / parseProposedBoard, imported by name). Then it refreshes the ledger through
// self/gaps.mjs so the autopilot's boards source lists the proposed items as board items.
//
// THE RANKING (every number from the gap line's own fields, nothing invented):
//   distance  unit free, in [0, 1]: |distance| / |bar| when the line carries numbers (|distance|
//             when the bar is 0), capped at 1; a line with no number (a board item, a missed file
//             with no measure) takes the normalised distance of a numeric line naming the same
//             verdict file when the ledger has one, else 1 (the whole bar is still to go).
//   minutes   the trial's minutes (trial.minutes), else the line's minutes (a board item: 60).
//   score     distance / minutes. Ties: a line with a trial first, fewer files, then the id.
// ELIGIBLE: a trial whose every script exists, or a board item with a brief; a verdict file named;
// not a line of a proposed board (a proposal of a proposal); not already the GAP of an undone item
// of another proposed board (so a new day's board takes the next gaps, not the same ones).
// SELECTION (default): the best line of each kind first (kinds in the order of their best score),
// then the rest by score with at most perKind (3) per kind, then without the cap if the board is
// still under min (5); at most max (8). Two lines with the same trial command are one item (the
// second is listed under "also measured by"). --pure takes the ranking in order instead.
//
// THE FILE: docs/boards/proposed/board-<N>.md, N = the highest board number on disk plus one
// (docs/boards/board-*.js, docs/boards/proposed/board-*.md, docs/BOARDS.json). One file per day:
// a second run on the same day rewrites that day's file unless a decision is recorded against it
// (a line naming board-N:<key> in bench/verdicts/autopilot/*.jsonl, state/self/authored.jsonl or
// state/self/brief/*.jsonl); a file with decisions is never overwritten, the run takes N + 1.
//
//   node self/nextboard.mjs               rank, write the proposed board, refresh the ledger, print
//   node self/nextboard.mjs --dry         rank and print, write nothing
//   node self/nextboard.mjs --json        print the result as one JSON object
//   flags: --root DIR, --min 5, --max 8, --per-kind 3, --pure, --no-refresh, --rebuild (a whole
//          node self/gaps.mjs run instead of writeBoardItems), --now ISO
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, renameSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'board 15 builder';
export const BOARD_AUTHOR = 'organism (nextboard)';
export const LEDGER_REL = 'state/self/gaps.jsonl';
export const PROMOTED_REL = 'state/self/spread-promoted.jsonl';
export const PROPOSED_REL = 'docs/boards/proposed';
export const BOARD_ITEM_KIND = 'board item';
export const DEFAULTS = Object.freeze({ min: 5, max: 8, perKind: 3, pure: false });
const DECISION_DIRS = ['bench/verdicts/autopilot', 'state/self/brief'];
const DECISION_FILES = ['state/self/authored.jsonl'];

const r6 = (x) => Math.round(x * 1e6) / 1e6;
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const byStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const toRel = (p) => String(p || '').replaceAll('\\', '/');
const EM = new RegExp('\\u2014', 'g');

// ------------------------------------------------------------------ the boards grammar (imported)
let boardsMod = null, boardsWhy = null;
/** self/boards.mjs by name; absent or not importing, a printed "not landed yet" and a local stub. */
export async function boardsGrammar() {
  if (boardsMod || boardsWhy) return { mod: boardsMod, why: boardsWhy };
  const f = path.join(HERE, 'boards.mjs');
  try {
    const m = await import(pathToFileURL(f).href);
    if (typeof m.renderProposedBoard !== 'function' || typeof m.parseProposedBoard !== 'function') throw new Error('it exports no renderProposedBoard / parseProposedBoard');
    boardsMod = m;
  } catch (e) {
    boardsWhy = 'self/boards.mjs not landed yet: ' + String((e && e.message) || e).split('\n')[0];
    process.stderr.write(boardsWhy + '\n');
  }
  return { mod: boardsMod, why: boardsWhy };
}
function stubRender({ board, header = {}, items = [] }) {
  const out = ['# Board ' + board + ' (proposed)', ''];
  for (const [k, v] of Object.entries(header)) out.push(k + ': ' + String(v).replace(/\r?\n/g, ' '));
  for (const it of items) out.push('', '## item ' + it.key, 'wave: ' + it.wave, 'ollama: ' + (it.ollama === true), 'owns: ' + it.owns, 'task:', ...String(it.task).split(/\r?\n/).map((l) => (/^ *##\s+item\s/.test(l) ? ' ' + l : l)));
  return out.join('\n') + '\n';
}
function stubParse(text) {
  const out = { ok: true, errors: [], items: [], header: {}, board: null, title: null };
  let cur = null, inTask = false;
  for (const raw of String(text).split(/\r?\n/)) {
    const h = /^##\s+item\s+(\S+)\s*$/.exec(raw);
    if (h) { if (cur) out.items.push(cur); cur = { key: h[1], owns: '', wave: 1, ollama: false, task: '' }; inTask = false; continue; }
    if (!cur) { const t = /^#\s+(.*\S)\s*$/.exec(raw); if (t && !out.title) { out.title = t[1]; const n = /\bboard\s+(\d+)\b/i.exec(t[1]); if (n) out.board = Number(n[1]); continue; } const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(raw); if (kv) out.header[kv[1]] = kv[2].trim(); continue; }
    if (inTask) { cur.task += (cur.task ? '\n' : '') + (/^ +##\s+item\s+\S+\s*$/.test(raw) ? raw.slice(1) : raw); continue; }
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(raw);
    if (!kv) continue;
    if (kv[1] === 'task') { inTask = true; if (kv[2].trim()) cur.task = kv[2]; } else if (kv[1] === 'wave') cur.wave = Number(kv[2]); else if (kv[1] === 'ollama') cur.ollama = kv[2].trim() === 'true'; else cur[kv[1]] = kv[2].trim();
  }
  if (cur) out.items.push(cur);
  for (const it of out.items) it.task = it.task.trim();
  return out;
}
async function grammar() {
  const g = await boardsGrammar();
  return g.mod ? { render: g.mod.renderProposedBoard, parse: g.mod.parseProposedBoard, from: 'self/boards.mjs' } : { render: stubRender, parse: stubParse, from: 'a local stub (' + g.why + ')' };
}

// ------------------------------------------------------------------ the ledger
function readJsonl(file) {
  let text; try { text = readFileSync(file, 'utf8'); } catch { return { lines: [], bad: 0, found: false }; }
  const lines = []; let bad = 0;
  for (const l of text.split(/\r?\n/)) { if (!l.trim()) continue; try { lines.push(JSON.parse(l)); } catch { bad++; } }
  return { lines, bad, found: true };
}

/** The ledger on disk plus the promoted-from-simulation lines of spread-promoted.jsonl it does not already hold. */
export function readGaps(root = ROOT) {
  const abs = path.join(root, ...LEDGER_REL.split('/'));
  const l = readJsonl(abs);
  let mtime = null; try { mtime = statSync(abs).mtime.toISOString(); } catch { mtime = null; }
  const ids = new Set(l.lines.map((x) => x && x.id));
  const p = readJsonl(path.join(root, ...PROMOTED_REL.split('/')));
  const promoted = p.lines.filter((x) => x && x.id && !ids.has(x.id));
  const seen = new Set();
  const promotedNew = [];
  for (const x of promoted) { if (seen.has(x.id)) continue; seen.add(x.id); promotedNew.push(x); }
  return { lines: [...l.lines, ...promotedNew], found: l.found, bad: l.bad, mtime, ledgerLines: l.lines.length, promotedAdded: promotedNew.length, rel: LEDGER_REL };
}

// ------------------------------------------------------------------ one gap line read
/** The script files a command runs: every token that is a .mjs or .js path. */
export function scriptsOf(command) {
  const out = [];
  for (const tok of String(command || '').split(/\s+/)) {
    const t = tok.replace(/^['"`]+|['"`,;:.)]+$/g, '');
    if (/^[\w./\\{}-]+\.m?js$/.test(t) && !t.includes('{') && !out.includes(toRel(t))) out.push(toRel(t));
  }
  return out;
}

/** The trial of a gap line as a command the boards grammar reads: {command, minutes, scripts, needsModel, from} or null. */
export function trialOf(line) {
  const t = line && line.trial;
  if (!t) return null;
  if (typeof t === 'string') {
    return { command: t, minutes: num(line.minutes) ?? 60, scripts: scriptsOf(t), needsModel: line.needsModel === true, from: 'the board item\'s bar command' };
  }
  if (typeof t === 'object' && typeof t.command === 'string') {
    // the ledger prints the budget wrapper's dirs as <tmp>, <copy>, <out>; the argv form is {tmp}, {copy}, {out}
    const command = t.command.replace(/<(tmp|copy|out)>/g, '{$1}');
    return { command, minutes: num(t.minutes) ?? num(line.minutes) ?? 60, scripts: scriptsOf(command), needsModel: t.needsModel === true || line.needsModel === true, from: 'trial.command of ' + (t.key || 'no key') + ', run in the ' + (t.where || 'tree') };
  }
  return null;
}

/** |distance| / |bar| capped at 1 for a numeric line, else null. */
export function numericDistance(line) {
  const m = num(line && line.measured), b = num(line && line.bar);
  let d = num(line && line.distance);
  if (d === null && m !== null && b !== null) d = b - m;
  if (d === null) return null;
  const scale = b !== null && b !== 0 ? Math.abs(b) : 1;
  return Math.min(1, Math.abs(d) / scale);
}

/** Every line scored: {line, index, distance, distanceFrom, minutes, score, trial, eligible, why}. */
export function scoreLines(lines, { root = ROOT, proposedGapIds = new Set() } = {}) {
  const byVerdict = new Map();
  for (const l of lines) {
    if (!l || l.kind === BOARD_ITEM_KIND || !l.verdictFile) continue;
    const d = numericDistance(l);
    if (d === null) continue;
    const cur = byVerdict.get(l.verdictFile);
    if (!cur || d > cur.d) byVerdict.set(l.verdictFile, { d, id: l.id });
  }
  const exists = new Map();
  const has = (rel) => { if (!exists.has(rel)) exists.set(rel, existsSync(path.join(root, ...rel.split('/')))); return exists.get(rel); };
  return lines.map((line, index) => {
    const row = { line, index, id: line && line.id, kind: line && line.kind, distance: null, distanceFrom: null, minutes: null, score: null, trial: null, eligible: false, why: null };
    if (!line || typeof line !== 'object' || !line.id) { row.why = 'not a gap line'; return row; }
    const trial = trialOf(line);
    row.trial = trial;
    const d = numericDistance(line);
    if (d !== null) { row.distance = r6(d); row.distanceFrom = 'the line (|distance| / |bar|, capped at 1)'; }
    else if (line.verdictFile && byVerdict.has(line.verdictFile)) { const v = byVerdict.get(line.verdictFile); row.distance = r6(v.d); row.distanceFrom = 'the numeric line ' + v.id + ' on the same verdict file'; }
    else { row.distance = 1; row.distanceFrom = 'no number on the line: the whole bar'; }
    row.minutes = trial ? trial.minutes : num(line.minutes) ?? 60;
    row.score = r6(row.distance / Math.max(row.minutes, 1e-9));
    const src = toRel(line.source || '');
    if (line.kind === BOARD_ITEM_KIND && src.startsWith(PROPOSED_REL + '/')) { row.why = 'a line of a proposed board (' + src + ')'; return row; }
    if (proposedGapIds.has(line.id)) { row.why = 'already the gap of an undone item of a proposed board'; return row; }
    if (!line.verdictFile) { row.why = 'no verdict file: nothing could say the item is done'; return row; }
    if (trial) {
      const missing = trial.scripts.filter((s) => !has(s));
      if (!trial.scripts.length) { row.why = 'the trial names no script file'; return row; }
      if (missing.length) { row.why = 'the trial names a script that does not exist: ' + missing.join(', '); return row; }
      row.eligible = true; return row;
    }
    if (line.kind === BOARD_ITEM_KIND && typeof line.brief === 'string' && line.brief.trim()) { row.eligible = true; return row; }
    row.why = 'no trial and no brief';
    return row;
  });
}

/** The eligible rows by score, highest first (ties: a trial first, fewer files, then the id). */
export function rankRows(rows) {
  const nf = (r) => (Array.isArray(r.line.files) ? r.line.files.length : 0);
  return rows.filter((r) => r.eligible).sort((a, b) => (b.score - a.score) || ((b.trial ? 1 : 0) - (a.trial ? 1 : 0)) || (nf(a) - nf(b)) || byStr(String(a.id), String(b.id)));
}

/** The 5 to 8 rows the board takes, and the ones folded in by a shared trial command. */
export function selectRows(ranked, { min = DEFAULTS.min, max = DEFAULTS.max, perKind = DEFAULTS.perKind, pure = DEFAULTS.pure } = {}) {
  const picked = [], byCmd = new Map(), also = new Map();
  const kindCount = new Map();
  const take = (r) => { picked.push(r); kindCount.set(r.kind, (kindCount.get(r.kind) || 0) + 1); if (r.trial) byCmd.set(r.trial.command, r); };
  const dupOf = (r) => (r.trial && byCmd.has(r.trial.command) ? byCmd.get(r.trial.command) : null);
  const inBoard = (r) => picked.includes(r);
  const consider = (r, cap) => {
    if (picked.length >= max || inBoard(r)) return;
    const d = dupOf(r);
    if (d) { if (!also.has(d.id)) also.set(d.id, []); if (!also.get(d.id).includes(r.id)) also.get(d.id).push(r.id); return; }
    if (cap !== null && (kindCount.get(r.kind) || 0) >= cap) return;
    take(r);
  };
  if (pure) { for (const r of ranked) consider(r, null); }
  else {
    const firsts = [];
    const seenKind = new Set();
    for (const r of ranked) { if (dupOf(r)) continue; if (seenKind.has(r.kind)) continue; seenKind.add(r.kind); firsts.push(r); }
    for (const r of firsts) consider(r, null);
    for (const r of ranked) consider(r, perKind);
    if (picked.length < min) for (const r of ranked) consider(r, null);
  }
  return { picked, also: Object.fromEntries(also), policy: pure ? 'pure rank' : 'the best of each kind, then by score with at most ' + perKind + ' per kind' + ' (the cap lifted under ' + min + ')' };
}

// ------------------------------------------------------------------ board numbers, days, decisions
/** The highest board number on disk: scripts (board-15b counts as 15), proposed files, docs/BOARDS.json. */
export function highestBoard(root = ROOT) {
  const seen = [];
  const dir = path.join(root, 'docs', 'boards');
  let names = []; try { names = readdirSync(dir); } catch { names = []; }
  for (const n of names) { const m = /^board-(\d+)[a-z]?\.js$/i.exec(n); if (m) seen.push({ board: Number(m[1]), from: 'docs/boards/' + n }); }
  let pn = []; try { pn = readdirSync(path.join(dir, 'proposed')); } catch { pn = []; }
  for (const n of pn) { const m = /^board-(\d+)[^/]*\.md$/i.exec(n); if (m) seen.push({ board: Number(m[1]), from: PROPOSED_REL + '/' + n }); }
  try {
    const b = JSON.parse(readFileSync(path.join(root, 'docs', 'BOARDS.json'), 'utf8'));
    const list = Array.isArray(b) ? b : Array.isArray(b && b.boards) ? b.boards : [];
    for (const x of list) { const n = num(x && (x.board ?? x.n)); if (n !== null) seen.push({ board: n, from: 'docs/BOARDS.json' }); }
  } catch { /* no BOARDS.json is no board */ }
  const max = seen.length ? Math.max(...seen.map((s) => s.board)) : 0;
  return { max, from: seen.filter((s) => s.board === max).map((s) => s.from), seen: seen.length };
}

/** The decision lines recorded against a board's items: {count, files, ids}. */
export function decisionsAgainst(root, board, keys) {
  const want = new Set(keys.map((k) => 'board-' + board + ':' + k));
  const needle = 'board-' + board + ':';
  const files = [];
  for (const d of DECISION_DIRS) { let ns = []; try { ns = readdirSync(path.join(root, ...d.split('/'))); } catch { ns = []; } for (const n of ns) if (/\.jsonl$/.test(n)) files.push(d + '/' + n); }
  for (const f of DECISION_FILES) files.push(f);
  let count = 0; const hitFiles = new Set(), ids = new Set();
  for (const f of files) {
    let text; try { text = readFileSync(path.join(root, ...f.split('/')), 'utf8'); } catch { continue; }
    if (!text.includes(needle)) continue;
    for (const l of text.split(/\r?\n/)) {
      if (!l.includes(needle)) continue;
      let j; try { j = JSON.parse(l); } catch { continue; }
      const vals = ['gap', 'key', 'from', 'id'].map((k) => (typeof j[k] === 'string' ? j[k].replace(/^boards:/, '') : null)).filter(Boolean);
      const hit = vals.find((v) => want.has(v));
      if (hit) { count++; hitFiles.add(f); ids.add(hit); }
    }
  }
  return { count, files: [...hitFiles].sort(), ids: [...ids].sort() };
}

/** Every proposed board on disk, parsed, with its date, its gap ids and its decisions. */
export async function readProposed(root = ROOT) {
  const g = await grammar();
  const dir = path.join(root, ...PROPOSED_REL.split('/'));
  let names = []; try { names = readdirSync(dir); } catch { names = []; }
  const out = [];
  for (const n of names.filter((x) => /^board-\d+[^/]*\.md$/i.test(x)).sort()) {
    const abs = path.join(dir, n);
    let text = ''; try { text = readFileSync(abs, 'utf8'); } catch { continue; }
    const p = g.parse(text, { file: PROPOSED_REL + '/' + n });
    const board = p.board ?? Number(/^board-(\d+)/i.exec(n)[1]);
    let date = typeof p.header.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.header.date) ? p.header.date : null;
    if (!date) { try { date = statSync(abs).mtime.toISOString().slice(0, 10); } catch { date = null; } }
    const items = p.items.map((it) => ({ key: it.key, gap: (/^GAP:\s*(\S+)/m.exec(it.task || '') || [])[1] || null }));
    out.push({ rel: PROPOSED_REL + '/' + n, board, date, author: p.header.author || null, items, decisions: decisionsAgainst(root, board, items.map((x) => x.key)) });
  }
  return out;
}

/** Where today's board goes: {board, rel, mode, reason}. */
export function targetOf({ root = ROOT, proposed = [], today }) {
  const hi = highestBoard(root);
  const todays = proposed.filter((p) => p.date === today && p.author === BOARD_AUTHOR).sort((a, b) => b.board - a.board);
  const reusable = todays.find((p) => p.decisions.count === 0);
  if (reusable) return { board: reusable.board, rel: reusable.rel, mode: 'rewrite', reason: 'today\'s proposed board ' + reusable.rel + ' has no decision recorded against it: rewritten with today\'s ranking', highest: hi };
  const n = hi.max + 1;
  const withDecisions = todays.filter((p) => p.decisions.count > 0).map((p) => p.rel + ' (' + p.decisions.count + ' decision(s))');
  return { board: n, rel: PROPOSED_REL + '/board-' + n + '.md', mode: 'new', reason: 'the highest board on disk is ' + hi.max + ' (' + hi.from.join(', ') + ')' + (withDecisions.length ? '; today\'s ' + withDecisions.join(', ') + ' is never overwritten' : ''), highest: hi };
}

// ------------------------------------------------------------------ one item
/** Test files the gap's subsystem already has: tests that import one of its files, and test/<stem>.test.mjs. */
export function testsFor(root, targets, index = null) {
  const idx = index || testIndex(root);
  const want = targets.map(toRel).filter(Boolean);
  const out = new Set();
  for (const [test, imports] of idx) if (imports.some((i) => want.some((w) => i === w || i.startsWith(w.replace(/\/$/, '') + '/')))) out.add(test);
  for (const w of want) {
    const stem = path.basename(w).replace(/\.(m?js|json|md)$/, '').replace(/-partial$/, '').replace(/\.test$/, '');
    if (/^test\/.+\.test\.mjs$/.test(w) && existsSync(path.join(root, ...w.split('/')))) out.add(w);
    const t = 'test/' + stem + '.test.mjs';
    if (stem && existsSync(path.join(root, 'test', stem + '.test.mjs'))) out.add(t);
  }
  return [...out].sort(byStr);
}

/** Every test/*.test.mjs with the relative paths it imports. */
export function testIndex(root = ROOT) {
  const dir = path.join(root, 'test');
  let names = []; try { names = readdirSync(dir); } catch { names = []; }
  const idx = [];
  for (const n of names.filter((x) => /\.test\.mjs$/.test(x)).sort()) {
    let src = ''; try { src = readFileSync(path.join(dir, n), 'utf8'); } catch { continue; }
    const specs = [...src.matchAll(/\bfrom\s*['"](\.[^'"]+)['"]/g), ...src.matchAll(/\bimport\(\s*['"](\.[^'"]+)['"]\s*\)/g), ...src.matchAll(/path\.join\(\s*ROOT\s*,\s*['"]([\w./-]+)['"]/g)].map((m) => m[1]);
    const imports = [];
    for (const s of specs) {
      const r = s.startsWith('.') ? toRel(path.relative(root, path.resolve(dir, s))) : toRel(s);
      if (!r.startsWith('..') && !imports.includes(r)) imports.push(r);
    }
    idx.push(['test/' + n, imports]);
  }
  return idx;
}

/** A one-word item key from a gap id. */
export function keyOf(id, taken = new Set()) {
  let k = String(id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48).replace(/-+$/g, '') || 'gap';
  let out = k, i = 2;
  while (taken.has(out)) out = k + '-' + i++;
  taken.add(out);
  return out;
}

/** Text of a gap field fit for the grammar: no em-dash, and no BAR / Tests mark a reader would take for the item's own. */
const fieldText = (s) => String(s ?? '').replace(EM, ', ').replace(/\bBAR\b/g, 'bar').replace(/\bTests\b(?=\s*[(:])/g, 'tests');
const show = (x) => (x === null || x === undefined ? 'not measured' : String(x));

/** One proposed item from a picked row: {key, owns, wave, ollama, task, gap, trial, verdictFile, tests}. */
export function itemOf(row, { root = ROOT, taken = new Set(), index = null, also = [], ledgerRel = LEDGER_REL } = {}) {
  const g = row.line;
  const files = Array.isArray(g.files) ? g.files.map(toRel) : [];
  const trial = row.trial;
  const targets = [...files, ...(trial ? trial.scripts.filter((s) => s !== 'tools/budget.mjs') : []), g.verdictFile].filter(Boolean);
  const tests = testsFor(root, targets, index);
  const needsModel = g.kind === BOARD_ITEM_KIND ? g.needsModel === true : !!(trial && trial.needsModel);
  const key = keyOf(g.id, taken);
  const lines = [];
  lines.push('GAP: ' + g.id + ' (kind ' + g.kind + ', ' + ledgerRel + ' line ' + (row.index + 1) + ', since ' + show(g.since) + '; score ' + row.score + ' = distance ' + row.distance + ' / ' + row.minutes + ' trial minutes; distance from ' + row.distanceFrom + ')');
  if (g.kind === BOARD_ITEM_KIND) {
    lines.push('BUILD: finish ' + g.id + ' of ' + fieldText(g.source || ('board ' + g.board)) + ', undone (' + fieldText(g.state || 'undone') + '): ' + fieldText(g.reason) + '. Its owned files: ' + (files.join(', ') || 'none named') + '. Its brief is quoted whole under BRIEF below.');
  } else {
    lines.push('BUILD: fill ' + g.id + ' (subsystem ' + fieldText(g.subsystem || 'unmapped') + '): the ledger measured ' + show(g.measured) + (g.unit ? ' ' + fieldText(g.unit) : '') + ' against a bar of ' + show(g.bar) + (g.better ? ' (' + g.better + ' is better' : ' (') + ', distance ' + show(g.distance) + ') in ' + g.verdictFile + (g.benchCommand ? ', from ' + fieldText(g.benchCommand) : '') + '; a fill changes ' + (files.length ? files.join(', ') : 'no file the gap line names') + '. The ledger\'s reason: ' + fieldText(g.why) + (g.author ? ' (line author: ' + fieldText(g.author) + ')' : ''));
  }
  const reach = g.kind === BOARD_ITEM_KIND || num(g.bar) === null
    ? 'it must write ' + g.verdictFile + ' with isTheBar true and barMet true'
    : 'it must reach ' + g.bar + (g.unit ? ' ' + fieldText(g.unit) : '') + (g.better ? ' (' + g.better + ' is better)' : '') + ' where the ledger measured ' + show(g.measured);
  const trialText = trial ? 'the trial that measures it again (' + fieldText(trial.from).replace(/[()]/g, '') + '; ' + trial.minutes + ' min) is ' + trial.command + (/\.$/.test(trial.command) ? '' : '.') : 'no trial command is written for it.';
  lines.push('BAR (' + g.verdictFile + '): ' + reach + '; ' + trialText);
  if (also.length) lines.push('ALSO MEASURED BY THIS TRIAL: ' + also.join(', ') + '.');
  lines.push('Tests: ' + (tests.length ? tests.join(', ') : 'none found (no test file imports its files or is named after them)') + '.');
  lines.push(needsModel ? 'MODEL: needs the model cell (Ollama at localhost:11434, one queue), from ' + (g.kind === BOARD_ITEM_KIND ? fieldText(g.needsModelFrom || 'the board item') : 'the trial') + '.' : 'MODEL OFF.');
  if (g.kind === BOARD_ITEM_KIND && typeof g.brief === 'string') lines.push('BRIEF (the original item, whole, from ' + fieldText(g.source || 'board ' + g.board) + '):', String(g.brief).replace(EM, ', ').trim());
  return {
    key, owns: files.join(', ') || 'none named by the gap line', wave: 1, ollama: needsModel, task: lines.join('\n').replace(/\r\n?/g, '\n').trim(),
    gap: g.id, kind: g.kind, trial: trial ? trial.command : null, trialScripts: trial ? trial.scripts : [], verdictFile: g.verdictFile, tests, files, score: row.score, distance: row.distance, minutes: row.minutes,
  };
}

/** Waves: a model item alone in its wave (one Ollama, one queue); an item whose files overlap an earlier one's moves to the next wave. */
export function assignWaves(items) {
  const waves = [];
  for (const it of items) {
    let w = 0;
    for (;;) {
      if (!waves[w]) waves[w] = { model: false, files: new Set() };
      const cell = waves[w];
      const clash = it.files.some((f) => cell.files.has(f));
      if (!(it.ollama && cell.model) && !clash) { cell.model = cell.model || it.ollama; for (const f of it.files) cell.files.add(f); it.wave = w + 1; break; }
      w++;
    }
  }
  return items;
}

// ------------------------------------------------------------------ the board
/**
 * Rank, select, render. Pure over the files it reads; writes nothing.
 * @returns {Promise<object>} {board, rel, mode, reason, header, items, text, ranked, excluded, roundTrip, ...}
 */
export async function buildBoard({ root = ROOT, now = new Date(), min = DEFAULTS.min, max = DEFAULTS.max, perKind = DEFAULTS.perKind, pure = DEFAULTS.pure, gaps = null } = {}) {
  const at = new Date(now).toISOString();
  const today = at.slice(0, 10);
  const g = await grammar();
  const led = gaps || readGaps(root);
  const proposed = await readProposed(root);
  const target = targetOf({ root, proposed, today });
  // gaps already carried by an undone item of ANOTHER proposed board; undone = its board-item line is in the ledger
  const undoneIds = new Set(led.lines.filter((l) => l && l.kind === BOARD_ITEM_KIND).map((l) => l.id));
  const proposedGapIds = new Set();
  for (const p of proposed) { if (p.rel === target.rel) continue; for (const it of p.items) if (it.gap && undoneIds.has('board-' + p.board + ':' + it.key)) proposedGapIds.add(it.gap); }
  const rows = scoreLines(led.lines, { root, proposedGapIds });
  const ranked = rankRows(rows);
  const excluded = {};
  for (const r of rows) if (!r.eligible) excluded[r.why] = (excluded[r.why] || 0) + 1;
  const sel = selectRows(ranked, { min, max, perKind, pure });
  const taken = new Set(), index = testIndex(root);
  const items = assignWaves(sel.picked.map((r) => itemOf(r, { root, taken, index, also: sel.also[r.id] || [], ledgerRel: led.rel })));
  const kinds = {};
  for (const it of items) kinds[it.kind] = (kinds[it.kind] || 0) + 1;
  const header = {
    at, date: today, board: target.board, author: BOARD_AUTHOR, code: 'self/nextboard.mjs (' + AUTHOR + ')',
    ledger: led.rel + ' (' + led.ledgerLines + ' lines, written ' + (led.mtime || 'unknown') + (led.promotedAdded ? '; plus ' + led.promotedAdded + ' promoted line(s) from ' + PROMOTED_REL : '') + (led.bad ? '; ' + led.bad + ' unreadable line(s) skipped' : '') + ')',
    counts: 'lines ' + led.lines.length + ', eligible ' + ranked.length + ', excluded ' + (led.lines.length - ranked.length) + ', items ' + items.length + ' (' + Object.entries(kinds).map(([k, n]) => k + ' ' + n).join(', ') + ')',
    excluded: Object.entries(excluded).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + ' ' + n).join('; ') || 'none',
    ranking: 'score = distance to the bar (unit free, capped at 1) / trial minutes; ' + sel.policy,
    target: target.mode + ': ' + target.reason,
    grammar: g.from,
    placeholders: '{tmp} {copy} {out} are the trial\'s budget dirs, as in its argv',
  };
  const text = g.render({ board: target.board, header, items: items.map(({ key, owns, wave, ollama, task }) => ({ key, owns, wave, ollama, task })) });
  // the file must read back as it was written, in the grammar the boards item reads
  const back = g.parse(text, { file: target.rel });
  const mismatch = [];
  if (back.board !== target.board) mismatch.push('board ' + back.board + ' != ' + target.board);
  if (back.items.length !== items.length) mismatch.push('items ' + back.items.length + ' != ' + items.length);
  items.forEach((it, i) => { const b = back.items[i]; if (!b) return; for (const f of ['key', 'owns', 'wave', 'ollama', 'task']) if (String(b[f]) !== String(it[f])) mismatch.push(it.key + '.' + f); });
  if (back.ok === false) for (const e of back.errors || []) mismatch.push('parse: ' + e.reason);
  const emDashes = (text.match(EM) || []).length;
  return {
    at, today, board: target.board, rel: target.rel, mode: target.mode, reason: target.reason, highest: target.highest, header, items, text, ranked, rows, excluded,
    policy: sel.policy, also: sel.also, roundTrip: { ok: mismatch.length === 0, mismatch }, emDashes, ledger: { rel: led.rel, lines: led.lines.length, ledgerLines: led.ledgerLines, mtime: led.mtime, promotedAdded: led.promotedAdded, bad: led.bad },
    proposed: proposed.map((p) => ({ rel: p.rel, board: p.board, date: p.date, items: p.items.length, decisions: p.decisions.count })), grammar: g.from,
  };
}

/** Write the board (refusing a file with decisions), then refresh the ledger so the boards source lists it. */
export async function proposeNextBoard({ root = ROOT, now = new Date(), dry = false, refresh = true, rebuild = false, ...opts } = {}) {
  const b = await buildBoard({ root, now, ...opts });
  const out = { ...b, wrote: false, refresh: null, refused: null };
  if (!b.roundTrip.ok) { out.refused = 'the rendered board does not read back: ' + b.roundTrip.mismatch.join('; '); return out; }
  if (b.emDashes) { out.refused = 'the rendered board holds ' + b.emDashes + ' em-dash(es)'; return out; }
  if (b.items.length === 0) { out.refused = 'no eligible gap: nothing to propose'; return out; }
  if (dry) return out;
  const abs = path.join(root, ...b.rel.split('/'));
  if (existsSync(abs)) {
    const d = decisionsAgainst(root, b.board, (await grammar()).parse(readFileSync(abs, 'utf8')).items.map((x) => x.key));
    if (d.count > 0) { out.refused = b.rel + ' has ' + d.count + ' decision(s) recorded against it: never overwritten'; return out; }
  }
  mkdirSync(path.dirname(abs), { recursive: true });
  const tmp = abs + '.' + process.pid + '.tmp';
  writeFileSync(tmp, b.text);
  renameSync(tmp, abs);
  out.wrote = true;
  out.bytes = Buffer.byteLength(b.text);
  if (refresh) out.refresh = await refreshLedger({ root, rebuild });
  return out;
}

/** self/gaps.mjs: writeBoardItems (every other line kept as on disk), or with rebuild a whole `node self/gaps.mjs` run. */
export async function refreshLedger({ root = ROOT, rebuild = false } = {}) {
  const gapsFile = path.join(root, 'self', 'gaps.mjs');
  const codeFile = existsSync(gapsFile) ? gapsFile : path.join(HERE, 'gaps.mjs');
  if (!existsSync(codeFile)) return { ok: false, how: 'self/gaps.mjs not landed yet', lines: null };
  if (rebuild) {
    const r = spawnSync(process.execPath, ['--max-old-space-size=6000', codeFile], { cwd: root, encoding: 'utf8', timeout: 600_000, windowsHide: true });
    return { ok: r.status === 0, how: 'node self/gaps.mjs (a whole rebuild), exit ' + r.status, printed: String(r.stdout || '').trim().split(/\r?\n/), lines: null };
  }
  try {
    const g = await import(pathToFileURL(codeFile).href);
    const w = g.writeBoardItems({ root });
    return { ok: true, how: 'self/gaps.mjs writeBoardItems (board items rescanned, every other line kept as on disk)', lines: w.lines, boardItems: w.boardItems ? w.boardItems.lines : null, previous: w.previous, error: w.boardItems ? w.boardItems.error : null };
  } catch (e) {
    return { ok: false, how: 'self/gaps.mjs threw: ' + String((e && e.message) || e).split('\n')[0], lines: null };
  }
}

/** The ledger's board-item lines of one proposed file (what the boards source will list). */
export function ledgerLinesOf(root, rel) {
  const l = readJsonl(path.join(root, ...LEDGER_REL.split('/')));
  return l.lines.filter((x) => x && x.kind === BOARD_ITEM_KIND && toRel(x.source) === rel);
}

/** Plain lines for a terminal. */
export function renderResult(r, { top = 12 } = {}) {
  const out = [];
  out.push('NEXTBOARD read ' + r.ledger.rel + ': ' + r.ledger.ledgerLines + ' lines (written ' + r.ledger.mtime + ')' + (r.ledger.promotedAdded ? ' + ' + r.ledger.promotedAdded + ' promoted' : '') + '; eligible ' + r.ranked.length + ' of ' + r.ledger.lines);
  out.push('excluded: ' + (Object.entries(r.excluded).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + ' ' + n).join('; ') || 'none'));
  out.push('RANK (score = distance / trial minutes), top ' + Math.min(top, r.ranked.length) + ' of ' + r.ranked.length + ':');
  r.ranked.slice(0, top).forEach((x, i) => out.push('  ' + String(i + 1).padStart(2) + '. ' + x.score.toFixed(6) + ' = ' + x.distance + ' / ' + x.minutes + ' min  [' + x.kind + '] ' + x.id));
  out.push('SELECT ' + r.policy + (Object.keys(r.also).length ? '; folded by a shared trial: ' + Object.entries(r.also).map(([k, v]) => k + ' <- ' + v.join(', ')).join('; ') : ''));
  const verb = r.refused ? 'REFUSED ' : r.wrote ? 'WROTE ' : 'WOULD WRITE ';
  out.push(verb + r.rel + ': board ' + r.board + ', ' + r.items.length + ' items (' + r.mode + ': ' + r.reason + ')' + (r.bytes ? ', ' + r.bytes + ' bytes' : '') + '; round trip through ' + r.grammar + ': ' + (r.roundTrip.ok ? 'ok' : 'FAILED ' + r.roundTrip.mismatch.join('; ')) + (r.refused ? '; ' + r.refused : ''));
  for (const it of r.items) out.push('  ITEM ' + it.key + ' | gap ' + it.gap + ' | trial ' + (it.trial || 'none') + ' | verdict ' + it.verdictFile + ' | wave ' + it.wave + ' | ollama ' + it.ollama + ' | files ' + it.files.length + ' | tests ' + it.tests.length);
  if (r.refresh) out.push('REFRESH ' + r.refresh.how + ': ' + (r.refresh.ok ? 'ok' : 'FAILED') + (r.refresh.lines !== null && r.refresh.lines !== undefined ? ', ledger ' + r.refresh.lines + ' lines, board items ' + r.refresh.boardItems : '') + (r.refresh.error ? ', ' + r.refresh.error : ''));
  return out.join('\n');
}

// ------------------------------------------------------------------ CLI
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
  const root = path.resolve(val('--root', ROOT));
  const r = await proposeNextBoard({
    root, now: val('--now', null) ? new Date(val('--now')) : new Date(), dry: argv.includes('--dry'), refresh: !argv.includes('--no-refresh'), rebuild: argv.includes('--rebuild'),
    min: Number(val('--min', DEFAULTS.min)), max: Number(val('--max', DEFAULTS.max)), perKind: Number(val('--per-kind', DEFAULTS.perKind)), pure: argv.includes('--pure'),
  });
  if (r.wrote && r.refresh && r.refresh.ok) r.listed = ledgerLinesOf(root, r.rel).map((x) => x.id);
  if (argv.includes('--json')) {
    const { text, rows, ranked, ...rest } = r;
    process.stdout.write(JSON.stringify({ ...rest, ranked: ranked.map((x) => ({ id: x.id, kind: x.kind, score: x.score, distance: x.distance, minutes: x.minutes })) }) + '\n');
  } else {
    process.stdout.write(renderResult(r) + '\n');
    if (r.listed) process.stdout.write('LEDGER lines of ' + r.rel + ': ' + r.listed.length + ' (' + r.listed.join(', ') + ')\n');
  }
  process.exitCode = r.refused ? 1 : 0;
}
