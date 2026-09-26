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
// git command that writes), and keeps the owned paths the commits carry; "at" is read as below.
// It prints the entry, and --write-boards puts it
// into docs/BOARDS.json in place of any entry for the same board. The run also names every
// docs/boards/board-N.js that has no entry yet, and every entry that says launched false while
// docs/LOG.md says the board LANDED, so a board that landed and was never counted is a printed
// gap, not a silent one.
//
// "at" IS WHEN THE BOARD LANDED: the docs/LOG.md line "- YYYY-MM-DD HH:MM BOARD N ... LANDED",
// read in the zone that log is written in (LOG_ZONE, the local clock of the machine the
// orchestrator runs on), and the latest checkpoint commit's date only when no such line exists.
// A commit can be hours late: Board 10 LANDED at 04:12 local and first reached git in the
// repository's first commit at 09:33 local. entry.atSource names what was read, and a per-day
// rate over the boards reads "at".
//
//   node tools/authorship.mjs --fill [--write-boards]
//
// fills every entry that is missing or says launched false, with nothing typed: for each
// docs/boards/board-N.js whose LANDED line is in docs/LOG.md and whose landing a commit subject
// names ("Board N landed", "Boards A to B landed"; git log, read only), it derives the entry as
// --derive does, carrying an existing entry's skipped items and run id (the run id is otherwise
// read from the LANDED line). A board with no LANDED line, or with one and no commit yet, is
// printed with that reason and left as it is.
//
// THE COMMITS SINCE THE LAST DERIVED BOARD (author: board 17 builder (the organism's item), gap
// missed:authorship.json). The two files miss every change that landed after the checkpoint
// commits docs/BOARDS.json names. Those commits are read from git (log and cat-file, read only:
// git log HEAD --not <every checkpoint commit of a launched entry>) and each is attributed by its
// author line, in this order: a merge is listed and not counted (its changes are the merged
// commits'); the organism's when its subject says "organism authored"; a board's when its subject
// says the board landed (boardsLandedInSubject); a board's when a line it adds carries a "board N
// builder" author line (an "Author:" field, or a code comment); the organism's when the lines it
// adds carry "Author: organism (<operator>)" headers and no board's; the orchestrator's otherwise.
// A mention is not an author line: prose in a .md file, a JSON "author" value and a string are not
// read. The commits are counted apart, in commits (the COMMITS line and verdict.commits), since a
// commit is not a board file; barMet needs every counted commit of the latest week to be the
// organism's as well. --no-commits turns the window off (the control arm). The split names the
// commits the parser was written against (PARSER_HEAD and its ancestors) as development; a commit
// landed after it is held out.
//
// THE ROOT IS READ FROM THE CHECKOUT when --root names no directory on this host (the ledger's
// command carries his C:\ path, which on Linux would resolve under the working directory): the
// run prints that and reads the checkout this file is in.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, realpathSync } from 'node:fs';
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
export function renderShare(s, { authoredRel = AUTHORED_REL, boardsRel = BOARDS_REL, authoredInfo = null, boardsInfo = null, missing = [], stale = [], perDay = null, ledgerRel = LEDGER_DIR_REL } = {}) {
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
  if (missing.length) L.push('  NOT IN THE DENOMINATOR: ' + missing.map((m) => 'board ' + m.board + ' (' + m.source + ')').join(', ') + (missing.length === 1 ? ' has a source and no entry' : ' have a source and no entry') + ': node tools/authorship.mjs --fill --write-boards derives each once it LANDED (or --derive N --commits SHA --write-boards)');
  if (stale.length) L.push('  STALE: ' + stale.map((x) => 'board ' + x.board + ' says launched false and ' + x.landed.source + ' says it LANDED').join('; ') + ': node tools/authorship.mjs --fill --write-boards');
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

function git(root, args, input = undefined) {
  const r = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024, ...(input === undefined ? {} : { input }) });
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
export function deriveBoard({ root = ROOT, board, commits = [], at = null, runId = null, launched = true, skip = [], readCommitFn = readCommit, landed = undefined } = {}) {
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
  const log = landed === undefined ? landedFromLog(root, board) : landed;
  const entry = {
    board, at: at || (log && log.at) || latest,
    atSource: at ? 'given (--at)' : log ? log.source + ' (' + log.local + ')' : 'the latest checkpoint commit (no LANDED line in ' + LOG_REL + ')',
    runId: runId || (log && log.runId) || null, launched: true, source, items: items.map((i) => i.key),
    commits: cs.map((c) => c.sha), commitSubjects: cs.map((c) => c.subject), commitsAt: cs.map((c) => c.at), byItem, files: [...files].sort(),
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

// ================================================================ when a board landed, from docs/LOG.md
export const LOG_REL = 'docs/LOG.md';
/**
 * The zone of docs/LOG.md's dated lines: the local clock of the machine the orchestrator writes
 * it on (Intl resolved America/New_York there on 2026-09-24, and its git commits carry -04:00).
 */
export const LOG_ZONE = 'America/New_York';

/**
 * A wall-clock minute in a zone as a UTC ISO string ('2026-09-24T08:12:00Z'), through Intl, so the
 * answer does not depend on the zone of the machine that reads it. Null for a zone Intl refuses.
 */
export function zonedToUtc(y, mo, d, h, mi, zone = LOG_ZONE) {
  let fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  } catch { return null; }
  const wallOf = (t) => {
    const p = Object.fromEntries(fmt.formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour) % 24, Number(p.minute), Number(p.second));
  };
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let t = wall - (wallOf(wall) - wall);
  t = wall - (wallOf(t) - t);
  return new Date(t).toISOString().replace('.000Z', 'Z');
}

// Since 2026-09-25 the LOG line carries its zone after the clock ("18:06 EDT BOARD 16 CLOUD LANDED");
// the zone token is LOG_ZONE spelled out, so it is accepted and the time is still read in LOG_ZONE.
// The Linux cloud session's lines (2026-09-26) differ in three ways, each accepted here (board 17
// builder (the organism's item)): an item name in lower case ("BOARD 20 host LANDED"), a number
// among the words ("BOARD 17 WAVES 1 AND 2 LANDED"), and a second board ("BOARD 21 AND BOARD 20
// SPEED LANDED", which lands both). A "not" among the words is never a landing.
const LANDED_LINE = /^- (\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?: [A-Z]{2,4})? BOARD (\d+)((?: (?!(?:not|NOT)\b)(?:[A-Za-z][A-Za-z0-9-]*|\d+))*) LANDED\b/;
/** The boards one matched LANDED line lands: its first board and every "AND BOARD N" after it. */
const boardsOfLandedMatch = (m) => [Number(m[6]), ...[...String(m[7] || '').matchAll(/\bAND BOARD (\d+)\b/g)].map((x) => Number(x[1]))];

/**
 * The docs/LOG.md line that says board N LANDED ("- 2026-09-24 04:12 BOARD 10 LANDED (wf_...",
 * "BOARD 12 SELF LANDED"): {at (UTC), local, runId, line, lineNo, source}, or null. The first such
 * line wins: a board lands once, and a later line quoting it is not its landing.
 */
export function landedFromLog(root, board, { logRel = LOG_REL, zone = LOG_ZONE } = {}) {
  let text;
  try { text = readFileSync(path.join(root, ...logRel.split('/')), 'utf8'); } catch { return null; }
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = LANDED_LINE.exec(lines[i]);
    if (!m || !boardsOfLandedMatch(m).includes(Number(board))) continue;
    const at = zonedToUtc(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]), Number(m[5]), zone);
    if (!at) return null;
    const run = /\b(wf_[0-9a-f]+-[0-9a-f]+)\b/.exec(lines[i]);
    return { at, local: m[1] + '-' + m[2] + '-' + m[3] + ' ' + m[4] + ':' + m[5] + ' ' + zone, runId: run ? run[1] : null, line: lines[i].trim().slice(0, 120), lineNo: i + 1, source: logRel + ':' + (i + 1) };
  }
  return null;
}

/**
 * The boards a commit subject says landed: "Boards 8 to 11 landed" is 8, 9, 10 and 11; "Board 11
 * landed, Board 12 running, Board 13 authored" is 11 alone; "Board 12 SELF landed" is 12; a
 * "not landed" is nothing.
 */
export function boardsLandedInSubject(subject) {
  const out = new Set();
  // The Linux cloud session's subjects (board 17 builder (the organism's item)): a number among the
  // words ("board 17 waves 1 and 2 landed"), an item's hyphenated key ("board 17 missed-gaps
  // landed") and a second board ("board 21 and board 20 speed landed", both landed); the words stay
  // at most five and a "not" is never a landing.
  for (const m of String(subject).matchAll(/\bboards?\s+(\d+)(?:\s+to\s+(\d+))?((?:\s+(?!not\b)(?:[A-Za-z][A-Za-z0-9-]*|\d+)){0,5})\s+landed\b/gi)) {
    const a = Number(m[1]), b = m[2] ? Number(m[2]) : a;
    if (b >= a && b - a < 100) for (let n = a; n <= b; n++) out.add(n);
    for (const x of String(m[3] || '').matchAll(/\band\s+boards?\s+(\d+)\b/gi)) out.add(Number(x[1]));
  }
  return [...out].sort((x, y) => x - y);
}

/** The commits whose subject says board N landed, oldest first. Read only: git log. */
export function checkpointCommitsFor(root, board, { logFn = (r) => git(r, ['log', '--format=%H%x09%s']) } = {}) {
  const rows = String(logFn(root)).split('\n').map((l) => l.split('\t')).filter((p) => p.length >= 2 && /^[0-9a-f]{7,40}$/.test(p[0]));
  return rows.filter(([, ...s]) => boardsLandedInSubject(s.join('\t')).includes(Number(board))).map(([sha]) => sha).reverse();
}

/** Every entry that says launched false while docs/LOG.md has its LANDED line. */
export function staleBoards(root, boards) {
  const out = [];
  for (const b of boards) {
    if (isLaunched(b)) continue;
    const log = landedFromLog(root, b.board);
    if (log) out.push({ board: b.board, landed: log });
  }
  return out;
}

/**
 * THE DENOMINATOR FILLS ITSELF: for every docs/boards/board-N.js whose entry is missing or says
 * launched false, derive the entry when docs/LOG.md has its LANDED line AND a commit subject names
 * its landing; otherwise give the reason it is left as it is. [{board, action, why, entry?}].
 * Pure over its two readers, so a test can hand it a log and commits; the CLI writes with
 * --write-boards.
 */
export function fillBoards({ root = ROOT, boards = [], readCommitFn = readCommit, logFn = undefined } = {}) {
  let names;
  try { names = readdirSync(path.join(root, ...BOARD_SOURCES_REL.split('/'))); } catch { names = []; }
  const nums = names.map((n) => /^board-(\d+)\.js$/.exec(n)).filter(Boolean).map((m) => Number(m[1])).sort((a, b) => a - b);
  const out = [];
  for (const n of nums) {
    const cur = boards.find((b) => Number(b.board) === n) || null;
    if (cur && isLaunched(cur)) continue;
    const had = cur ? 'its entry says launched false' : 'it has no entry';
    const landed = landedFromLog(root, n);
    if (!landed) { out.push({ board: n, action: 'none', why: had + ' and ' + LOG_REL + ' has no "BOARD ' + n + ' ... LANDED" line: not landed yet' }); continue; }
    let commits;
    try { commits = checkpointCommitsFor(root, n, logFn ? { logFn } : {}); } catch (e) { out.push({ board: n, action: 'none', why: had + '; LANDED at ' + landed.source + ', and git log could not be read: ' + String(e.message).split('\n')[0] }); continue; }
    if (!commits.length) { out.push({ board: n, action: 'none', why: had + '; LANDED at ' + landed.source + ', and no commit subject says board ' + n + ' landed: the checkpoint is not committed yet' }); continue; }
    const entry = deriveBoard({ root, board: n, commits, runId: (cur && cur.runId) || landed.runId, skip: cur && Array.isArray(cur.skipped) ? cur.skipped : [], readCommitFn, landed });
    out.push({ board: n, action: 'derive', why: had + '; LANDED at ' + landed.source + ', checkpoint commits ' + commits.map((c) => c.slice(0, 7)).join(', '), entry });
  }
  return out;
}

// ================================================================ the commits since the last derived board
// Author: board 17 builder (the organism's item). The ruler made exact on a checkout: every commit
// since the checkpoint commits docs/BOARDS.json names is read from git (read only) and attributed
// by its author line. See THE COMMITS SINCE THE LAST DERIVED BOARD in the header.

/** The HEAD this parser was written against (the $250 cloud session, 2026-09-26): it and its ancestors are the development set. */
export const PARSER_HEAD = '596b011a43c9fc2663b6f512c74dae42b8ce7f65';

/** The --root the run reads: the one given when it is a directory here, else the checkout this file is in. */
export function resolveRoot(given, { fallback = ROOT, platform = process.platform, isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } } } = {}) {
  if (typeof given !== 'string' || !given) return { root: fallback, given: null, source: 'the checkout this file is in (no --root)' };
  const windowsPath = /^[A-Za-z]:[\\/]/.test(given) && platform !== 'win32';
  const abs = path.resolve(given);
  if (!windowsPath && isDir(abs)) return { root: abs, given, source: 'given (--root)' };
  return { root: fallback, given, source: 'the checkout this file is in: --root ' + given + (windowsPath ? ' is a Windows path on this ' + platform + ' host' : ' is not a directory here') };
}

// An author FIELD: "Author: X", "// Author: X", "# Author: X", " * Author: X", or a Markdown header
// line "author: X". A JSON "author": value never matches (the quote before the colon).
const AUTHOR_FIELD = /^\s*(?:(?:\/\/+|\/\*+|\*+|#+|<!--)\s*)?author\s*:\s*(.+)$/i;
const ORGANISM_AUTHOR = /^organism \(([a-z][a-z0-9-]*)\)/i;
const BOARD_AUTHOR = /\bboard (\d+) builder\b/i;
const SLASH_COMMENTS = /\.(?:mjs|cjs|js|jsx|ts|tsx|css)$/i;
const HASH_COMMENTS = /(?:\.(?:ya?ml|sh|py|toml|ps1)|(?:^|\/)(?:Dockerfile|\.gitignore|\.dockerignore|\.gitattributes))$/i;
/** git log -G pre-filter (POSIX extended): a superset of what authorOfLine accepts. */
export const AUTHOR_PICKAXE = '[Bb][Oo][Aa][Rr][Dd] [0-9]+ [Bb][Uu][Ii][Ll][Dd][Ee][Rr]|[Aa][Uu][Tt][Hh][Oo][Rr][[:space:]]*:';

/** The comment text of one line of a code file, or null (prose, JSON and strings carry no author line). */
function commentOf(text, file) {
  const t = String(text);
  if (SLASH_COMMENTS.test(file)) {
    const s = t.trimStart();
    if (s.startsWith('//') || s.startsWith('/*') || s.startsWith('*')) return s;
    const i = t.search(/(?<![:'"`\\])\/\/|\/\*/);
    return i >= 0 ? t.slice(i) : null;
  }
  if (HASH_COMMENTS.test(file)) {
    const i = t.indexOf('#');
    return i >= 0 ? t.slice(i) : null;
  }
  if (/\.html?$/i.test(file)) { const i = t.indexOf('<!--'); return i >= 0 ? t.slice(i) : null; }
  return null;
}

/**
 * The author one added line names: {kind: 'organism', operator} | {kind: 'board', board} | null.
 * An "Author:" field names either; a code comment names a board ("(board 20 builder)"), never the
 * organism (an organism mention in a comment is a description, not a header).
 */
export function authorOfLine(text, file = '') {
  const f = AUTHOR_FIELD.exec(String(text));
  if (f && !/\.json$/i.test(file)) {
    const o = ORGANISM_AUTHOR.exec(f[1]);
    if (o) return { kind: 'organism', operator: o[1].toLowerCase() };
    const b = /^board (\d+) builder\b/i.exec(f[1]);
    if (b) return { kind: 'board', board: Number(b[1]) };
  }
  const c = commentOf(text, file);
  const m = c ? BOARD_AUTHOR.exec(c) : null;
  return m ? { kind: 'board', board: Number(m[1]) } : null;
}

/** The path of a "diff --git a/X b/X" line (--no-renames, so both sides name one path). */
function pathOfDiffGit(line) {
  let s = line.slice('diff --git '.length);
  if (s.startsWith('"')) { const m = /^"a\/((?:[^"\\]|\\.)*)"/.exec(s); return m ? m[1].replace(/\\(.)/g, '$1') : s; }
  const half = (s.length - 1) / 2;
  if (Number.isInteger(half) && s.slice(half) === ' b/' + s.slice(2, half)) return s.slice(2, half);
  const i = s.lastIndexOf(' b/');
  return i > 2 ? s.slice(2, i) : s;
}

/** Per commit, the author lines its added lines carry: Map sha -> [{file, line, kind, operator|board, text}]. */
export function marksFromPatches(text) {
  const out = new Map();
  for (const chunk of String(text).split('\u0000')) {
    const nl = chunk.indexOf('\n');
    const sha = (nl < 0 ? chunk : chunk.slice(0, nl)).trim();
    if (!/^[0-9a-f]{7,40}$/.test(sha)) continue;
    const marks = [];
    let file = null, hunk = false, n = 0;
    for (const l of chunk.slice(nl + 1).split('\n')) {
      if (l.startsWith('diff --git ')) { file = pathOfDiffGit(l); hunk = false; continue; }
      if (l.startsWith('@@')) { const m = /\+(\d+)/.exec(l); n = m ? Number(m[1]) : 0; hunk = true; continue; }
      if (!hunk || !l.startsWith('+')) continue;
      const a = authorOfLine(l.slice(1), file || '');
      if (a) marks.push({ file, line: n, ...a, text: l.slice(1).trim().slice(0, 100) });
      n++;
    }
    out.set(sha, marks);
  }
  return out;
}

/** The commit rows of git log --name-only --format=%x00%H%x09%P%x09%cI%x09%an%x09%s: [{sha, parents, at, gitAuthor, subject, files}]. */
export function commitsFromLog(text) {
  const rows = [];
  for (const chunk of String(text).split('\u0000')) {
    const lines = chunk.split('\n');
    const [sha, parents, at, gitAuthor, ...subject] = lines[0].split('\t');
    if (!/^[0-9a-f]{7,40}$/.test(sha || '')) continue;
    const d = Date.parse(at);
    rows.push({
      sha, parents: String(parents || '').split(' ').filter(Boolean), at: Number.isFinite(d) ? new Date(d).toISOString().replace('.000Z', 'Z') : null,
      gitAuthor: gitAuthor || '', subject: subject.join('\t'), files: [...new Set(lines.slice(1).map((l) => l.trim()).filter(Boolean))],
    });
  }
  return rows;
}

/** Does a commit subject say the organism authored it? A "not organism authored" does not. */
export const saysOrganismAuthored = (subject) => /(?<!\bnot\s)\borganism authored\b/i.test(String(subject));

/**
 * One commit's author: {author: 'organism' | 'board' | 'orchestrator' | 'merge', boards, operators, by, evidence}.
 * The order is the header's: merge, subject organism, subject board, board author line, organism author line, the orchestrator.
 */
export function attributeCommit(c, marks = []) {
  if (c.parents && c.parents.length > 1) return { author: 'merge', boards: [], operators: [], by: 'merge', evidence: 'a merge: its changes are the merged commits\', each counted where it appears' };
  if (saysOrganismAuthored(c.subject)) return { author: 'organism', boards: [], operators: [], by: 'subject', evidence: 'its subject says organism authored' };
  const landed = boardsLandedInSubject(c.subject);
  if (landed.length) return { author: 'board', boards: landed, operators: [], by: 'subject', evidence: 'its subject says board ' + landed.join(' and ') + ' landed' };
  const where = (k) => k.file + ':' + k.line + ' "' + k.text + '"';
  const b = marks.filter((k) => k.kind === 'board');
  if (b.length) return { author: 'board', boards: [...new Set(b.map((k) => k.board))].sort((x, y) => x - y), operators: [], by: 'author line', evidence: b.length + ' board author lines, first ' + where(b[0]) };
  const o = marks.filter((k) => k.kind === 'organism');
  if (o.length) return { author: 'organism', boards: [], operators: [...new Set(o.map((k) => k.operator))].sort(), by: 'author line', evidence: o.length + ' organism author lines, first ' + where(o[0]) };
  return { author: 'orchestrator', boards: [], operators: [], by: 'no author line', evidence: 'no organism or board author line in its ' + (c.files ? c.files.length : 0) + ' files; git author ' + (c.gitAuthor || 'unknown') };
}

/** The counts of attributed rows, per ISO week and in all: organism commits over counted (non-merge) commits. */
export function summarizeCommits(rows = []) {
  const blank = () => ({ counted: 0, merges: 0, organism: 0, board: 0, orchestrator: 0, byBoard: {} });
  const add = (s, r) => {
    if (r.author === 'merge') { s.merges++; return; }
    s.counted++;
    s[r.author]++;
    if (r.author === 'board') for (const n of r.boards) s.byBoard[n] = (s.byBoard[n] || 0) + 1;
  };
  const all = blank();
  const weeks = new Map();
  for (const r of rows) {
    add(all, r);
    const w = isoWeek(r.at);
    if (!w) continue;
    if (!weeks.has(w)) weeks.set(w, { week: w, ...blank() });
    add(weeks.get(w), r);
  }
  const fin = (s) => Object.assign(s, { numerator: s.organism, denominator: s.counted, share: ratio(s.organism, s.counted) });
  return { ...fin(all), weeks: [...weeks.values()].sort((a, b) => (a.week < b.week ? -1 : 1)).map(fin) };
}

/**
 * The commits since the last derived board, attributed. Read only (rev-parse, cat-file, log,
 * rev-list). {read: false, reason} when root is not the top of a git checkout.
 * @param {{root: string, boards: object[], gitFn?: (root, args, input?) => string, parserHead?: string}} o
 */
export function readCommitWindow({ root = ROOT, boards = [], gitFn = git, parserHead = PARSER_HEAD } = {}) {
  const why = (e) => String(e && e.message || e).split('\n')[0];
  let top;
  try { top = gitFn(root, ['rev-parse', '--show-toplevel']).trim(); } catch (e) { return { read: false, reason: 'no git checkout at ' + root + ': ' + why(e) }; }
  const real = (p) => { try { return realpathSync(p); } catch { return path.resolve(p); } };
  if (!top || real(top) !== real(root)) return { read: false, reason: root + ' is not the top of its git checkout (' + (top || 'none') + ')' };
  const derived = boards.filter((b) => isLaunched(b) && Array.isArray(b.commits) && b.commits.length);
  const named = [...new Set(derived.flatMap((b) => b.commits.filter((c) => typeof c === 'string' && /^[0-9a-f]{7,40}$/.test(c))))];
  const present = [], missing = [];
  if (named.length) {
    const check = gitFn(root, ['cat-file', '--batch-check=%(objectname) %(objecttype)'], named.join('\n') + '\n').split('\n').filter(Boolean);
    named.forEach((sha, i) => { const [full, type] = String(check[i] || '').split(' '); if (type === 'commit') present.push(full); else missing.push(sha); });
  }
  const dates = new Map();
  if (present.length) for (const l of gitFn(root, ['log', '--no-walk=unsorted', '--format=%H%x09%cI', ...present]).split('\n')) { const [h, d] = l.split('\t'); if (h && d) dates.set(h, new Date(d).toISOString().replace('.000Z', 'Z')); }
  let last = null;
  for (const b of derived) for (const c of b.commits) {
    const full = present.find((p) => p.startsWith(c));
    if (full && (!last || dates.get(full) > last.at)) last = { board: b.board ?? null, sha: full, at: dates.get(full) || null };
  }
  const not = present.length ? ['--not', ...present] : [];
  const rows = commitsFromLog(gitFn(root, ['log', '--name-only', '--no-renames', '--format=%x00%H%x09%P%x09%cI%x09%an%x09%s', 'HEAD', ...not]));
  const marks = marksFromPatches(gitFn(root, ['-c', 'core.quotePath=false', 'log', '-p', '--unified=0', '--no-renames', '--no-color', '--no-ext-diff', '--no-textconv', '-G' + AUTHOR_PICKAXE, '--format=%x00%H', 'HEAD', ...not]));
  let dev = null;
  try { dev = new Set(gitFn(root, ['rev-list', parserHead, ...not]).split('\n').map((l) => l.trim()).filter(Boolean)); } catch { dev = null; }
  const attributed = rows.map((c) => {
    const a = attributeCommit(c, marks.get(c.sha) || []);
    return { sha: c.sha.slice(0, 7), at: c.at, week: isoWeek(c.at), gitAuthor: c.gitAuthor, subject: c.subject.slice(0, 100), files: c.files.length, ...a, set: dev ? (dev.has(c.sha) ? 'development' : 'heldOut') : 'heldOut' };
  });
  const sum = summarizeCommits(attributed);
  const counted = attributed.filter((r) => r.author !== 'merge');
  const development = counted.filter((r) => r.set === 'development').length;
  return {
    read: true, reason: null,
    since: last ? { board: last.board, sha: last.sha.slice(0, 7), at: last.at } : null,
    range: 'git log HEAD' + (present.length ? ' --not ' + present.length + ' checkpoint commits of ' + derived.length + ' launched entries' : ' (no launched entry names a commit here: the whole history)'),
    missingBase: missing,
    ...sum,
    rows: attributed,
    split: {
      development: development + ' of the ' + counted.length + ' counted commits: the ones the author-line parser was written against (' + parserHead.slice(0, 7) + ' and its ancestors since the last derived board)' + (dev ? '' : '; ' + parserHead.slice(0, 7) + ' is not in this checkout, so none is known to be'),
      heldOut: (counted.length - development) ? (counted.length - development) + ((counted.length - development) === 1 ? ' commit' : ' commits') + ' landed after ' + parserHead.slice(0, 7) + ': the parser was not written against them and was not changed for them' : 'none',
      contaminated: development ? 'a ruler over its own repository has no held-out set when it is written: every development commit is one its parser was written while reading, and only a commit landed after ' + parserHead.slice(0, 7) + ' is unseen' : false,
    },
  };
}

/** The printed lines of the commit window. */
export function renderCommits(w) {
  if (!w) return [];
  if (!w.read) return ['  commits since the last derived board: not read (' + w.reason + ')'];
  const L = [];
  L.push('  commits since the last derived board' + (w.since ? ' (board ' + w.since.board + ', checkpoint ' + w.since.sha + ' at ' + w.since.at + ')' : '') + ', ' + w.range + ', read only: '
    + w.rows.length + ' commits, ' + w.counted + ' counted, ' + w.merges + (w.merges === 1 ? ' merge' : ' merges') + ' not counted' + (w.missingBase.length ? '; checkpoint commits absent from this checkout: ' + w.missingBase.join(', ') : ''));
  for (const r of w.rows) {
    const who = r.author === 'board' ? 'board ' + r.boards.join(',') : r.author === 'organism' ? 'organism' + (r.operators.length ? ' (' + r.operators.join(',') + ')' : '') : r.author;
    L.push('    ' + r.sha + ' ' + (r.at || 'undated') + '  ' + who.padEnd(12) + '  by ' + r.by.padEnd(14) + '  ' + r.set.padEnd(11) + '  ' + r.files + ' files  ' + r.subject.slice(0, 70));
  }
  for (const x of w.weeks) L.push('  commits week ' + x.week + '  organism ' + x.organism + '  board ' + x.board + '  orchestrator ' + x.orchestrator + '  merges ' + x.merges + '  share ' + fmtShare(x.numerator, x.denominator));
  const bb = Object.entries(w.byBoard).map(([n, k]) => 'board ' + n + ' ' + k).join(', ');
  L.push('COMMITS (since the last derived board): numerator ' + w.numerator + ' organism-authored commits, denominator ' + w.denominator + ' counted commits ('
    + w.organism + ' the organism\'s + ' + w.board + ' a board\'s' + (bb ? ' [' + bb + ']' : '') + ' + ' + w.orchestrator + ' the orchestrator\'s; ' + w.merges + (w.merges === 1 ? ' merge' : ' merges') + ' not counted) = ' + fmtShare(w.numerator, w.denominator));
  return L;
}

/**
 * barMet over both records: the latest ISO week that holds any counted unit (a kept patch, a board
 * file, a counted commit) has every one of them the organism's.
 */
export function barOf(s, w) {
  const fileWeeks = s.weeks.filter((r) => r.denominator > 0);
  const commitWeeks = w && w.read ? w.weeks.filter((r) => r.counted > 0) : [];
  const latest = [...fileWeeks.map((r) => r.week), ...commitWeeks.map((r) => r.week)].sort().at(-1) || null;
  if (!latest) return { week: null, met: false, files: null, commits: null };
  const f = fileWeeks.find((r) => r.week === latest) || null;
  const c = commitWeeks.find((r) => r.week === latest) || null;
  const met = (!f || f.numerator === f.denominator) && (!c || c.organism === c.counted);
  return { week: latest, met, files: f ? { numerator: f.numerator, denominator: f.denominator } : null, commits: c ? { numerator: c.organism, denominator: c.counted } : null };
}

// ================================================================ the CLI
const BOOLEAN = new Set(['json', 'no-write', 'not-launched', 'write-boards', 'fill', 'no-commits']);
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
  const rootInfo = resolveRoot(o.root); // the root read from the checkout when --root names no directory here (board 17 builder (the organism's item))
  const root = rootInfo.root;
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

  if (o.fill) {
    const b0 = readBoards(boardsFile);
    const rows = fillBoards({ root, boards: b0.boards });
    const L = ['fill: ' + rel(boardsFile) + ' holds ' + b0.boards.length + ' entries; board sources with no entry or launched false: ' + rows.length];
    for (const r of rows) L.push('  board ' + r.board + ': ' + (r.action === 'derive' ? 'DERIVED, ' + r.entry.files.length + ' files, at ' + r.entry.at + ' from ' + r.entry.atSource + '; ' : 'left as it is: ') + r.why);
    const derived = rows.filter((r) => r.action === 'derive');
    if (o['write-boards'] && derived.length) {
      let arr = [];
      for (const r of derived) arr = upsertBoard(boardsFile, r.entry);
      L.push('wrote ' + rel(boardsFile) + ' (' + arr.length + ' boards: ' + arr.map((x) => x.board).join(', ') + ')');
    } else if (derived.length) L.push('nothing written: --write-boards puts the ' + derived.length + ' derived ' + (derived.length === 1 ? 'entry' : 'entries') + ' into ' + rel(boardsFile));
    else L.push('nothing to derive');
    return { filled: rows, text: L.join('\n'), verdict: null, out: null, json: !!o.json };
  }

  const a = readAuthored(authoredFile);
  const b = readBoards(boardsFile);
  const s = computeShare({ authored: a.lines, boards: b.boards, now });
  const missing = o.boards ? [] : missingBoards(root, b.boards);
  const stale = o.boards ? [] : staleBoards(root, b.boards);
  const ledgerDir = path.join(root, ...LEDGER_DIR_REL.split('/'));
  const led = readLedgers(ledgerDir);
  const perDay = perSourcePerDay(led.lines);
  // the commits since the last derived board (board 17 builder (the organism's item)); --no-commits is the control arm
  const win = o['no-commits'] ? { read: false, reason: '--no-commits (the control arm: the two files alone)' } : o.boards ? { read: false, reason: '--boards names a file other than the checkout\'s' } : readCommitWindow({ root, boards: b.boards });
  const rootLine = rootInfo.source === 'given (--root)' ? [] : ['root: ' + root + ' (' + rootInfo.source + ')'];
  const text = [...rootLine, renderShare(s, { authoredRel: rel(authoredFile), boardsRel: rel(boardsFile), authoredInfo: a, boardsInfo: b, missing, stale, perDay, ledgerRel: rel(ledgerDir) }), ...renderCommits(win)].join('\n');
  const command = 'node tools/authorship.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  const bar = barOf(s, win);
  const barMet = bar.met;
  const launched = s.boards.filter((x) => x.launched !== false).map((x) => x.board);
  const verdict = {
    at: now.toISOString(), command, node: process.version, isTheBar: true, barMet,
    bar: BAR_TEXT,
    barRule: 'barMet is true when the latest ISO week that holds any counted unit (a kept patch, a landed board file, or a commit since the last derived board) has an organism share of exactly 1 in both records: every kept patch and every landed board file that week authored by the organism, and every counted commit that week attributed to the organism by its author line. MANUAL.md P15 gives N checkpoints no number, so this is the necessary per-week condition; the ladder climbing is read by bench/ladder.mjs, not here.',
    split: win.read ? { development: win.split.development + '; the files share is a count over two files, nothing fit or tuned', heldOut: win.split.heldOut, contaminated: win.split.contaminated } : { development: 'none: the share is a count over two files, nothing is fit or tuned', heldOut: 'none: every kept patch and every landed board file is counted', contaminated: false },
    statement: 'The organism authored ' + s.numerator + ' of the ' + s.denominator + ' units of change counted here: ' + s.numerator + ' kept patches in ' + rel(authoredFile)
      + ' carry an organism author (a model cell on open weights, the deterministic census prune, or mind/imagine.mjs), against a denominator of ' + s.kept + ' kept patches of any author plus '
      + s.boardFiles + ' files landed by ' + launched.length + ' launched boards (' + (launched.join(', ') || 'none') + ') in ' + rel(boardsFile) + ', so the cumulative share is ' + fmtShare(s.numerator, s.denominator)
      + '. ' + (win.read ? 'Apart from those files, the ' + win.counted + ' commits counted since the last derived board' + (win.since ? ' (board ' + win.since.board + ', checkpoint ' + win.since.sha + ')' : '') + ' are attributed by their author lines: ' + win.organism + ' the organism\'s, ' + win.board + ' a board\'s, ' + win.orchestrator + ' the orchestrator\'s (' + win.merges + (win.merges === 1 ? ' merge' : ' merges') + ' not counted), so the commit share is ' + fmtShare(win.numerator, win.denominator) + '. The split of that attribution: development ' + win.split.development + '; held out ' + win.split.heldOut + '; ' + (win.split.contaminated ? 'contaminated, because ' + win.split.contaminated : 'not contaminated') + '. ' : 'The commits since the last derived board were not read (' + win.reason + '). ')
      + 'The latest week with a counted unit, ' + (bar.week ? bar.week + ', holds ' + (bar.files ? fmtShare(bar.files.numerator, bar.files.denominator) + ' in files' : 'no file unit') + ' and ' + (bar.commits ? fmtShare(bar.commits.numerator, bar.commits.denominator) + ' in commits' : 'no counted commit') : 'none, holds nothing') + ', so the P15 bar (100 percent per week) is ' + (barMet ? 'MET' : 'NOT MET') + '. '
      + (s.lastBoard ? 'The last launched board is ' + s.lastBoard.board + ' at ' + s.lastBoard.at + ', ' + (s.daysSinceLastBoard === null ? 'n/a' : s.daysSinceLastBoard.toFixed(2)) + ' days before this run. ' : '')
      + (missing.length ? 'Board sources with no entry, so not yet in the denominator: ' + missing.map((m) => m.board).join(', ') + '. ' : '')
      + (stale.length ? 'Entries that say launched false while docs/LOG.md says the board LANDED: ' + stale.map((x) => x.board + ' (' + x.landed.source + ')').join(', ') + '. ' : '')
      + 'The files share reads only these two files (the per source per day rows read the ledgers in ' + rel(ledgerDir) + (win.read ? ', and the commit share reads git log, read only' : '') + '); a board that has not yet been appended to ' + rel(boardsFile) + ' is not in the files denominator' + (win.read ? ' (its commits are in the commit share until it is)' : '') + ', and a patch the autopilot reverted or refused is in neither.',
    numerator: s.numerator, denominator: s.denominator, share: s.share,
    organism: s.organism, given: s.given, kept: s.kept, boardFiles: s.boardFiles,
    boards: s.boards, weeks: s.weeks, undated: s.undated,
    lastBoard: s.lastBoard, daysSinceLastBoard: s.daysSinceLastBoard, missingBoards: missing,
    staleBoards: stale.map((x) => ({ board: x.board, landed: x.landed.source, at: x.landed.at })),
    root: { used: root, given: rootInfo.given, source: rootInfo.source },
    latestWeek: bar,
    commits: win.read ? { since: win.since, range: win.range, missingBase: win.missingBase, counted: win.counted, merges: win.merges, organism: win.organism, board: win.board, orchestrator: win.orchestrator, byBoard: win.byBoard, numerator: win.numerator, denominator: win.denominator, share: win.share, weeks: win.weeks, rows: win.rows, parserHead: PARSER_HEAD } : { read: false, reason: win.reason },
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
    if (r.json) console.log(JSON.stringify(r.verdict || r.derived || r.filled, null, 2));
    else console.log(r.text + (r.out ? '\nwrote ' + path.relative(process.cwd(), r.out).replaceAll('\\', '/') : ''));
  } catch (e) {
    console.error('authorship: ' + String(e && e.message || e));
    process.exitCode = 1;
  }
}
