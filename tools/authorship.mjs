#!/usr/bin/env node
// tools/authorship.mjs: WHO WROTE THE BRAIN. His P15 (2026-09-23 17:44): "I wouldnt even need to
// pay $100 claude subscription anymore". The share that sentence is about is measured here, from
// two files and nothing else:
//
//   numerator    patches the organism authored and the autopilot KEPT: the lines of
//                state/self/authored.jsonl whose author is not 'given' (a model cell, the
//                deterministic census prune, or mind/imagine.mjs). The autopilot appends one line
//                per kept patch and never one for a revert or a refusal.
//   denominator  every kept patch (the organism's and any given one) PLUS every file a board
//                landed, read from docs/BOARDS.json (an array of {board, at, files}); a file named
//                twice inside one board counts once, a file landed by two boards counts twice
//                (each landing is work somebody other than the organism did). A board entry with
//                launched false (authored, not yet run) is listed and counts nothing.
//
// Reported per board, per ISO week (UTC) and cumulative, with the days since the last launched
// board (his P15 ruler: "patches proposed and kept per source per day, the authored share, and
// days since the last board"; the per source per day rows come from the autopilot's own decision
// ledgers, bench/verdicts/autopilot/<date>.jsonl, which only a live run writes). A share with a
// zero denominator is printed as "n/a", never as 0
// and never as NaN. `node tools/authorship.mjs [--root DIR] [--boards FILE] [--authored FILE]
// [--out FILE] [--json] [--no-write]` writes bench/verdicts/authorship.json once per run (under
// --root when one is given).
//
// THE DENOMINATOR FILLS ITSELF (Board 14, his 2026-09-24 12:02 order "EVERY GAP should be able to
// be filled by itself"). A board's entry is DERIVED, never typed:
//
//   node tools/authorship.mjs --derive N --commits SHA[,SHA] [--at ISO] [--run-id ID]
//                             [--skip KEY,KEY] [--not-launched] [--write-boards]
//
// reads docs/boards/board-N.js (the key and owns of every item; a "read only:" or "run only:"
// tail and a parenthetical that starts with "read" or "find" are instructions, not files; an item
// named in --skip was deferred and owns nothing; a path whose clause says "only if" counts only
// from a commit that changed it, never from a first commit that carries the whole tree), reads
// the files each checkpoint commit names (git show --name-only, read only: this file never runs a
// git command that writes), and keeps the owned paths the commits carry. "at" defaults to the
// latest checkpoint commit's author date in UTC. It prints the entry, and --write-boards puts it
// into docs/BOARDS.json in place of any entry for the same board. The run also names every
// docs/boards/board-N.js that has no entry yet, so a board that landed and was never counted is a
// printed gap, not a silent one.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const AUTHORED_REL = 'state/self/authored.jsonl';
export const BOARDS_REL = 'docs/BOARDS.json';
export const BOARD_SOURCES_REL = 'docs/boards';
export const VERDICT_REL = 'bench/verdicts/authorship.json';
export const LEDGER_DIR_REL = 'bench/verdicts/autopilot';
export const BAR_TEXT = 'MANUAL.md P15: the subscription is unneeded when the share of landed changes authored by the organism per week is 100 percent across N checkpoints and the ladder still climbs';
const DAY_MS = 86_400_000;

/** ISO 8601 week of a date, in UTC: '2026-W39'. Null for a date that does not parse. */
export function isoWeek(at) {
  const t = Date.parse(at);
  if (!Number.isFinite(t)) return null;
  const d = new Date(t);
  const day = d.getUTCDay() || 7;
  const th = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 4 - day));
  const y0 = new Date(Date.UTC(th.getUTCFullYear(), 0, 1));
  const w = Math.ceil(((th - y0) / 86_400_000 + 1) / 7);
  return th.getUTCFullYear() + '-W' + String(w).padStart(2, '0');
}

/** The lines of authored.jsonl: {lines, bad, present}. A line that does not parse is counted, not used. */
export function readAuthored(file) {
  if (!existsSync(file)) return { present: false, lines: [], bad: 0 };
  const lines = [];
  let bad = 0;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const l = raw.trim();
    if (!l) continue;
    try { const j = JSON.parse(l); if (j && typeof j === 'object') lines.push(j); else bad++; } catch { bad++; }
  }
  return { present: true, lines, bad };
}

/** docs/BOARDS.json: {boards, present, reason}. Each board {board, at, files: string[]}. */
export function readBoards(file) {
  if (!existsSync(file)) return { present: false, boards: [], reason: 'no ' + file };
  let j;
  try { j = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { return { present: true, boards: [], reason: 'does not parse: ' + String(e.message).split('\n')[0] }; }
  const arr = Array.isArray(j) ? j : Array.isArray(j?.boards) ? j.boards : null;
  if (!arr) return { present: true, boards: [], reason: 'not an array of boards' };
  return { present: true, boards: arr.filter((b) => b && typeof b === 'object'), reason: null };
}

/** Is this kept patch the organism's own? Everything but an explicitly given patch. */
export const isOrganism = (l) => l.organism === true || (l.organism !== false && l.author && l.author !== 'given');
/** A board entry counts unless it says launched false (authored, not yet run). */
export const isLaunched = (b) => b.launched !== false;

const ratio = (n, d) => (d > 0 ? n / d : null);

/**
 * The share arithmetic. Pure: two arrays in, the numbers out.
 * @param {{authored: object[], boards: object[], now?: Date}} o
 * @returns {{numerator, denominator, share, organism, given, kept, boardFiles, boards, weeks: object[], undated, lastBoard, daysSinceLastBoard}}
 */
export function computeShare({ authored = [], boards = [], now = null } = {}) {
  const weeks = new Map();
  const row = (w) => weeks.get(w) || (weeks.set(w, { week: w, organism: 0, given: 0, kept: 0, boardFiles: 0, boards: [] }), weeks.get(w));
  let undated = 0;
  let organism = 0, given = 0, boardFiles = 0;
  for (const l of authored) {
    const w = isoWeek(l.at);
    if (!w) { undated++; continue; }
    const r = row(w);
    r.kept++;
    if (isOrganism(l)) { r.organism++; organism++; } else { r.given++; given++; }
  }
  const perBoard = [];
  let lastBoard = null;
  for (const b of boards) {
    const files = [...new Set((Array.isArray(b.files) ? b.files : []).filter((f) => typeof f === 'string' && f))];
    const launched = isLaunched(b);
    const w = isoWeek(b.at);
    perBoard.push({
      board: b.board ?? null, at: b.at ?? null, week: w, files: launched ? files.length : 0, launched,
      items: Array.isArray(b.items) ? b.items.length : null, commits: Array.isArray(b.commits) ? b.commits.length : null, skipped: Array.isArray(b.skipped) ? b.skipped : [],
    });
    if (!launched) continue;
    if (!w) { undated++; continue; }
    const r = row(w);
    r.boardFiles += files.length;
    r.boards.push(b.board ?? null);
    boardFiles += files.length;
    if (!lastBoard || Date.parse(b.at) > Date.parse(lastBoard.at)) lastBoard = { board: b.board ?? null, at: b.at };
  }
  const kept = organism + given;
  const sorted = [...weeks.values()].sort((a, b) => (a.week < b.week ? -1 : 1));
  let cn = 0, cd = 0;
  for (const r of sorted) {
    r.numerator = r.organism;
    r.denominator = r.kept + r.boardFiles;
    r.share = ratio(r.numerator, r.denominator);
    cn += r.numerator; cd += r.denominator;
    r.cumulative = { numerator: cn, denominator: cd, share: ratio(cn, cd) };
  }
  const denominator = kept + boardFiles;
  const t = now instanceof Date ? now.getTime() : null;
  const daysSinceLastBoard = lastBoard && t !== null ? (t - Date.parse(lastBoard.at)) / DAY_MS : null;
  return { numerator: organism, denominator, share: ratio(organism, denominator), organism, given, kept, boardFiles, boards: perBoard, weeks: sorted, undated, lastBoard, daysSinceLastBoard };
}

export const fmtShare = (n, d) => n + '/' + d + ' = ' + (d > 0 ? (n / d).toFixed(4) + ' (' + ((100 * n) / d).toFixed(2) + ' percent)' : 'n/a (nothing in the denominator)');

/**
 * The autopilot's decision ledgers, bench/verdicts/autopilot/<YYYY-MM-DD>.jsonl: {files, lines, bad}.
 * A dry run writes none (self/autopilot.mjs), so these are live runs only.
 */
export function readLedgers(dir) {
  let names;
  try { names = readdirSync(dir).filter((n) => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(n)).sort(); } catch { return { files: 0, lines: [], bad: 0 }; }
  const lines = [];
  let bad = 0;
  for (const n of names) {
    for (const raw of readFileSync(path.join(dir, n), 'utf8').split('\n')) {
      const l = raw.trim();
      if (!l) continue;
      try { const j = JSON.parse(l); if (j && typeof j === 'object') lines.push(j); else bad++; } catch { bad++; }
    }
  }
  return { files: names.length, lines, bad };
}

/**
 * His P15 ruler "patches proposed and kept per source per day", from the ledger lines, with the
 * autopilot's own definitions: a candidate is a decision line, proposed is a line that carries a
 * patch author (self/autopilot.mjs counts proposed as decisions with an author), kept is a line
 * whose decision is kept. [{day, source, candidates, proposed, kept}], sorted by day then source.
 */
export function perSourcePerDay(lines = []) {
  const m = new Map();
  for (const l of lines) {
    const t = Date.parse(l.at);
    if (!Number.isFinite(t) || l.candidate === false) continue;
    const day = new Date(t).toISOString().slice(0, 10);
    const source = typeof l.source === 'string' && l.source ? l.source : 'unknown';
    const k = day + '|' + source;
    const r = m.get(k) || (m.set(k, { day, source, candidates: 0, proposed: 0, kept: 0 }), m.get(k));
    r.candidates++;
    if (l.author) r.proposed++;
    if (l.decision === 'kept') r.kept++;
  }
  return [...m.values()].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : a.source < b.source ? -1 : a.source > b.source ? 1 : 0));
}

/** The printed lines of one run. */
export function renderShare(s, { authoredRel = AUTHORED_REL, boardsRel = BOARDS_REL, authoredInfo = null, boardsInfo = null, missing = [], perDay = null, ledgerRel = LEDGER_DIR_REL } = {}) {
  const L = [];
  L.push('authorship: organism-authored kept patches over (all kept patches + files landed by boards)');
  L.push('  authored  ' + authoredRel + ': ' + (authoredInfo && !authoredInfo.present ? 'absent, 0 lines' : s.kept + ' kept (' + s.organism + ' organism, ' + s.given + ' given)' + (authoredInfo && authoredInfo.bad ? ', ' + authoredInfo.bad + ' unreadable lines' : '')));
  const launched = s.boards.filter((b) => b.launched !== false);
  L.push('  boards    ' + boardsRel + ': ' + s.boards.length + ' boards (' + launched.length + ' launched: ' + (launched.map((b) => b.board).join(', ') || 'none') + '), ' + s.boardFiles + ' files landed' + (boardsInfo && boardsInfo.reason ? ' (' + boardsInfo.reason + ')' : ''));
  for (const b of s.boards) {
    L.push('    board ' + b.board + (b.launched === false ? ' NOT LAUNCHED (authored, counts nothing)' : ' at ' + b.at + ' (' + (b.week || 'undated') + '): ' + b.files + ' files')
      + (b.items != null ? ', ' + b.items + ' items' : '') + (b.skipped && b.skipped.length ? ' (skipped: ' + b.skipped.join(', ') + ')' : '') + (b.commits != null ? ', ' + b.commits + ' checkpoint commits' : ''));
  }
  for (const r of s.weeks) {
    L.push('  week ' + r.week + '  organism ' + r.organism + '  kept ' + r.kept + '  board files ' + r.boardFiles + '  share ' + fmtShare(r.numerator, r.denominator) + '  cumulative ' + fmtShare(r.cumulative.numerator, r.cumulative.denominator));
  }
  if (s.undated) L.push('  undated rows left out: ' + s.undated);
  if (s.lastBoard) L.push('  days since the last board: ' + (s.daysSinceLastBoard === null ? 'n/a' : s.daysSinceLastBoard.toFixed(2)) + ' (board ' + s.lastBoard.board + ' at ' + s.lastBoard.at + ')');
  if (perDay) {
    L.push('  per source per day (' + ledgerRel + '/<date>.jsonl, live runs only)' + (perDay.length ? ':' : ': no decision lines'));
    for (const r of perDay) L.push('    ' + r.day + '  ' + r.source.padEnd(8) + '  candidates ' + r.candidates + '  proposed ' + r.proposed + '  kept ' + r.kept);
  }
  if (missing.length) L.push('  NOT IN THE DENOMINATOR: ' + missing.map((m) => 'board ' + m.board + ' (' + m.source + ')').join(', ') + ' has a source and no entry: node tools/authorship.mjs --derive N --commits SHA --write-boards');
  L.push('SHARE (cumulative): numerator ' + s.numerator + ' organism-authored kept patches, denominator ' + s.denominator + ' (' + s.kept + ' kept patches + ' + s.boardFiles + ' board files) = ' + fmtShare(s.numerator, s.denominator));
  return L.join('\n');
}

// ================================================================ deriving a board's entry
const unquote = (s) => s.replace(/\\(.)/g, '$1');

/**
 * The items of a board source (docs/boards/board-N.js): [{key, owns}]. Read as text, never
 * imported (a board file is a workflow script that would launch builders). Each owns string is
 * paired with the last key before it.
 */
export function itemsFromBoardSource(src) {
  const keys = [...String(src).matchAll(/\bkey:\s*(['"])((?:(?!\1)[^\\]|\\.)*)\1/g)].map((m) => ({ i: m.index, key: unquote(m[2]) }));
  const owns = [...String(src).matchAll(/\bowns:\s*(['"])((?:(?!\1)[^\\]|\\.)*)\1/g)].map((m) => ({ i: m.index, owns: unquote(m[2]) }));
  const out = [];
  for (const o of owns) {
    let k = null;
    for (const x of keys) if (x.i < o.i) k = x; else break;
    if (k) out.push({ key: k.key, owns: o.owns });
  }
  return out;
}

/** Remove the top-level parenthetical groups whose text the predicate accepts. */
function dropParens(s, pred) {
  let out = '', depth = 0, start = -1;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') { if (depth === 0) start = i; depth++; continue; }
    if (c === ')' && depth > 0) {
      depth--;
      if (depth === 0) { const inner = s.slice(start + 1, i); out += pred(inner) ? ' ' : '(' + inner + ')'; }
      continue;
    }
    if (depth === 0) out += c;
  }
  if (depth > 0) out += s.slice(start);
  return out;
}

const TOKEN = /(?:^|[\s(,:;])((?:\.?[A-Za-z0-9_*<>-][A-Za-z0-9_.*<>-]*\/)+(?:[A-Za-z0-9_.*<>-]+)?|\.dockerignore|Dockerfile|[A-Za-z0-9_*<>-][A-Za-z0-9_.*<>-]*\.(?:mjs|cjs|js|json|jsonl|md|yaml|yml|txt|csv|html|css|png|wav|bz2))(?=$|[\s),;:])/g;

/** Split at the commas and semicolons that sit outside every parenthesis. */
function topLevelSegments(s) {
  const out = [];
  let depth = 0, cur = '';
  for (const c of s) {
    if (c === '(') depth++;
    else if (c === ')' && depth > 0) depth--;
    if ((c === ',' || c === ';') && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

/**
 * The paths an owns string names as the item's own, as [{path, conditional}]: a "read only:" or
 * "run only:" tail is cut, a parenthetical that starts with "read" or "find" is an instruction
 * and is dropped, and a bare file name (compress-board10.json) lives in the directory of the path
 * named before it (the tree's root when none was). A path ending in / is a directory, * and
 * <date> are wildcards. A path whose own clause says "only if" (viz/ (only if the organism page
 * imports it)) is CONDITIONAL: it counts only where a commit shows it changed, never merely
 * because a first commit carries the whole tree.
 */
export function ownedFromOwns(owns) {
  let s = String(owns).replace(/[;,.]?\s*\b(?:read|run) only:[\s\S]*$/i, '');
  s = dropParens(s, (inner) => /^\s*(?:read|find)\b/i.test(inner));
  const out = [];
  let dir = '';
  for (const seg of topLevelSegments(s)) {
    const conditional = /\bonly if\b/i.test(seg);
    for (const m of (' ' + seg).matchAll(TOKEN)) {
      let t = m[1].replace(/\.+$/, '');
      if (!t) continue;
      if (t.includes('/')) dir = t.endsWith('/') ? t.slice(0, -1) : t.slice(0, t.lastIndexOf('/'));
      else if (dir && !/^(?:Dockerfile|\.dockerignore)$/.test(t)) t = dir + '/' + t;
      if (!out.some((x) => x.path === t)) out.push({ path: t, conditional });
    }
  }
  return out;
}

/** The owned paths alone. */
export const pathsFromOwns = (owns) => ownedFromOwns(owns).map((x) => x.path);

/** One owned path as a matcher over repository paths (forward slashes). */
export function pathMatcher(p) {
  if (p.endsWith('/')) return (f) => f.startsWith(p);
  if (/[*<]/.test(p)) {
    const re = new RegExp('^' + p.split(/(\*|<[^>]*>)/).map((x) => (x === '*' ? '[^/]*' : /^<.*>$/.test(x) ? '[^/]+' : x.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))).join('') + '$');
    return (f) => re.test(f);
  }
  return (f) => f === p;
}

function git(root, args) {
  const r = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
  if (r.error || r.status !== 0) throw new Error('git ' + args.join(' ') + ' failed: ' + String(r.error ? r.error.message : r.stderr).split('\n')[0]);
  return r.stdout;
}

/**
 * A checkpoint commit: {sha, at (UTC ISO), subject, root, files}. Read only: git show. root is
 * true for a commit with no parent, whose name list is the whole tree rather than a change.
 */
export function readCommit(root, rev) {
  const [sha, date, parents, ...subject] = git(root, ['show', '-s', '--format=%H%x09%aI%x09%P%x09%s', rev]).trim().split('\t');
  const files = git(root, ['show', '--name-only', '--format=', '--no-renames', sha]).split('\n').map((l) => l.trim()).filter(Boolean);
  return { sha, at: new Date(date).toISOString().replace('.000Z', 'Z'), subject: subject.join('\t'), root: !String(parents || '').trim(), files };
}

/**
 * One board's entry. The files are the owned paths of its items that its checkpoint commits
 * carry; an item the board skipped owns nothing, and a conditional path counts only from a commit
 * that is a change (not a first commit carrying the whole tree).
 * @param {{root?, board, commits?: string[], at?, runId?, launched?, skip?: string[], readCommitFn?}} o
 */
export function deriveBoard({ root = ROOT, board, commits = [], at = null, runId = null, launched = true, skip = [], readCommitFn = readCommit } = {}) {
  const source = BOARD_SOURCES_REL + '/board-' + board + '.js';
  const file = path.join(root, ...source.split('/'));
  if (!existsSync(file)) throw new Error('no ' + source);
  const items = itemsFromBoardSource(readFileSync(file, 'utf8'));
  const unknown = skip.filter((k) => !items.some((i) => i.key === k));
  if (unknown.length) throw new Error('--skip names no item of ' + source + ': ' + unknown.join(', '));
  if (!launched) return { board, at, runId, launched: false, source, items: items.map((i) => i.key), commits: [], files: [] };
  if (!commits.length) throw new Error('a launched board needs its checkpoint commits (--commits SHA[,SHA])');
  const cs = commits.map((c) => readCommitFn(root, c));
  const carried = [...new Set(cs.flatMap((c) => c.files))];
  const changed = new Set(cs.filter((c) => !c.root).flatMap((c) => c.files));
  const files = new Set();
  const byItem = {};
  for (const it of items) {
    if (skip.includes(it.key)) continue;
    const ms = ownedFromOwns(it.owns).map((o) => ({ m: pathMatcher(o.path), conditional: o.conditional }));
    const hit = carried.filter((f) => ms.some((x) => x.m(f) && (!x.conditional || changed.has(f))));
    byItem[it.key] = hit.length;
    for (const f of hit) files.add(f);
  }
  const latest = cs.map((c) => c.at).sort().at(-1);
  const entry = {
    board, at: at || latest, runId, launched: true, source, items: items.map((i) => i.key),
    commits: cs.map((c) => c.sha), commitSubjects: cs.map((c) => c.subject), byItem, files: [...files].sort(),
  };
  if (skip.length) entry.skipped = [...skip];
  if (cs.some((c) => c.root)) entry.note = 'a checkpoint here is the repository\'s first commit, whose name list is the whole tree: every owned path it holds is counted, including one the board owned and left unchanged (an overcount); a conditional path ("only if") is not counted from it';
  return entry;
}

/** Put an entry into docs/BOARDS.json in place of the one for the same board; sorted by board. */
export function upsertBoard(file, entry) {
  const cur = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const arr = (Array.isArray(cur) ? cur : cur.boards || []).filter((b) => b && b.board !== entry.board);
  arr.push(entry);
  arr.sort((a, b) => a.board - b.board);
  writeFileSync(file, JSON.stringify(arr, null, 1) + '\n');
  return arr;
}

/** Every docs/boards/board-N.js with no entry in the boards array. */
export function missingBoards(root, boards) {
  const dir = path.join(root, ...BOARD_SOURCES_REL.split('/'));
  let names;
  try { names = readdirSync(dir); } catch { return []; }
  const have = new Set(boards.map((b) => Number(b.board)));
  return names.map((n) => /^board-(\d+)\.js$/.exec(n)).filter(Boolean).map((m) => Number(m[1]))
    .filter((n) => !have.has(n)).sort((a, b) => a - b).map((n) => ({ board: n, source: BOARD_SOURCES_REL + '/board-' + n + '.js' }));
}

// ================================================================ the CLI
const BOOLEAN = new Set(['json', 'no-write', 'not-launched', 'write-boards']);
function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    if (BOOLEAN.has(k)) { o[k] = true; continue; }
    o[k] = argv[i + 1];
    i++;
  }
  return o;
}

export function main(argv = process.argv.slice(2), now = new Date()) {
  const o = parseArgs(argv);
  const root = o.root ? path.resolve(o.root) : ROOT;
  const authoredFile = o.authored ? path.resolve(o.authored) : path.join(root, ...AUTHORED_REL.split('/'));
  const boardsFile = o.boards ? path.resolve(o.boards) : path.join(root, ...BOARDS_REL.split('/'));
  const out = o.out ? path.resolve(o.out) : path.join(root, ...VERDICT_REL.split('/'));
  const rel = (p) => path.relative(root, p).replaceAll('\\', '/');

  if (o.derive !== undefined) {
    const board = Number(o.derive);
    if (!Number.isInteger(board) || board <= 0) throw new Error('--derive takes a board number');
    const list = (v) => (typeof v === 'string' ? v.split(',').map((s) => s.trim()).filter(Boolean) : []);
    const entry = deriveBoard({
      root, board, launched: !o['not-launched'], at: o.at || null, runId: o['run-id'] || null,
      commits: list(o.commits), skip: list(o.skip),
    });
    let text = JSON.stringify(entry, null, 1);
    if (o['write-boards']) { const arr = upsertBoard(boardsFile, entry); text += '\nwrote ' + rel(boardsFile) + ' (' + arr.length + ' boards: ' + arr.map((b) => b.board).join(', ') + ')'; }
    return { derived: entry, text, verdict: null, out: null, json: !!o.json };
  }

  const a = readAuthored(authoredFile);
  const b = readBoards(boardsFile);
  const s = computeShare({ authored: a.lines, boards: b.boards, now });
  const missing = o.boards ? [] : missingBoards(root, b.boards);
  const ledgerDir = path.join(root, ...LEDGER_DIR_REL.split('/'));
  const led = readLedgers(ledgerDir);
  const perDay = perSourcePerDay(led.lines);
  const text = renderShare(s, { authoredRel: rel(authoredFile), boardsRel: rel(boardsFile), authoredInfo: a, boardsInfo: b, missing, perDay, ledgerRel: rel(ledgerDir) });
  const command = 'node tools/authorship.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  const lastWeek = s.weeks.at(-1) || null;
  const barMet = !!lastWeek && lastWeek.share === 1;
  const launched = s.boards.filter((x) => x.launched !== false).map((x) => x.board);
  const verdict = {
    at: now.toISOString(), command, node: process.version, isTheBar: true, barMet,
    bar: BAR_TEXT,
    barRule: 'barMet is true when the latest ISO week in the record has an organism share of exactly 1 (every kept patch and every landed board file that week authored by the organism). MANUAL.md P15 gives N checkpoints no number, so this is the necessary per-week condition; the ladder climbing is read by bench/ladder.mjs, not here.',
    split: { development: 'none: the share is a count over two files, nothing is fit or tuned', heldOut: 'none: every kept patch and every landed board file is counted' },
    statement: 'The organism authored ' + s.numerator + ' of the ' + s.denominator + ' units of change counted here: ' + s.numerator + ' kept patches in ' + rel(authoredFile)
      + ' carry an organism author (a model cell on open weights, the deterministic census prune, or mind/imagine.mjs), against a denominator of ' + s.kept + ' kept patches of any author plus '
      + s.boardFiles + ' files landed by ' + launched.length + ' launched boards (' + (launched.join(', ') || 'none') + ') in ' + rel(boardsFile) + ', so the cumulative share is ' + fmtShare(s.numerator, s.denominator)
      + '. The latest week, ' + (lastWeek ? lastWeek.week + ', holds ' + fmtShare(lastWeek.numerator, lastWeek.denominator) : 'none, holds nothing') + ', so the P15 bar (100 percent per week) is ' + (barMet ? 'MET' : 'NOT MET') + '. '
      + (s.lastBoard ? 'The last launched board is ' + s.lastBoard.board + ' at ' + s.lastBoard.at + ', ' + (s.daysSinceLastBoard === null ? 'n/a' : s.daysSinceLastBoard.toFixed(2)) + ' days before this run. ' : '')
      + (missing.length ? 'Board sources with no entry, so not yet in the denominator: ' + missing.map((m) => m.board).join(', ') + '. ' : '')
      + 'The share reads only these two files (the per source per day rows read the ledgers in ' + rel(ledgerDir) + '); a board that has not yet been appended to ' + rel(boardsFile) + ' is not in the denominator, and a patch the autopilot reverted or refused is in neither.',
    numerator: s.numerator, denominator: s.denominator, share: s.share,
    organism: s.organism, given: s.given, kept: s.kept, boardFiles: s.boardFiles,
    boards: s.boards, weeks: s.weeks, undated: s.undated,
    lastBoard: s.lastBoard, daysSinceLastBoard: s.daysSinceLastBoard, missingBoards: missing,
    perSourcePerDay: perDay,
    sources: {
      authored: { file: rel(authoredFile), present: a.present, lines: a.lines.length, bad: a.bad },
      boards: { file: rel(boardsFile), present: b.present, reason: b.reason },
      ledgers: { dir: rel(ledgerDir), files: led.files, lines: led.lines.length, bad: led.bad },
    },
  };
  if (!o['no-write']) { mkdirSync(path.dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n'); }
  return { share: s, text, verdict, out: o['no-write'] ? null : out, json: !!o.json };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const r = main();
    if (r.json) console.log(JSON.stringify(r.verdict || r.derived, null, 2));
    else console.log(r.text + (r.out ? '\nwrote ' + path.relative(process.cwd(), r.out).replaceAll('\\', '/') : ''));
  } catch (e) {
    console.error('authorship: ' + String(e && e.message || e));
    process.exitCode = 1;
  }
}
