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
//                (each landing is work somebody other than the organism did).
//
// Reported per ISO week (UTC) and cumulative. A share with a zero denominator is printed as
// "n/a", never as 0 and never as NaN. `node tools/authorship.mjs [--root DIR] [--boards FILE]
// [--authored FILE] [--out FILE] [--json] [--no-write]` writes bench/verdicts/authorship.json
// once per run (under --root when one is given).
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const AUTHORED_REL = 'state/self/authored.jsonl';
export const BOARDS_REL = 'docs/BOARDS.json';
export const VERDICT_REL = 'bench/verdicts/authorship.json';

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

const ratio = (n, d) => (d > 0 ? n / d : null);

/**
 * The share arithmetic. Pure: two arrays in, the numbers out.
 * @param {{authored: object[], boards: object[]}} o
 * @returns {{numerator, denominator, share, organism, given, kept, boardFiles, boards, weeks: object[], undated}}
 */
export function computeShare({ authored = [], boards = [] } = {}) {
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
  for (const b of boards) {
    const files = [...new Set((Array.isArray(b.files) ? b.files : []).filter((f) => typeof f === 'string' && f))];
    const w = isoWeek(b.at);
    perBoard.push({ board: b.board ?? null, at: b.at ?? null, week: w, files: files.length });
    if (!w) { undated++; continue; }
    const r = row(w);
    r.boardFiles += files.length;
    r.boards.push(b.board ?? null);
    boardFiles += files.length;
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
  return { numerator: organism, denominator, share: ratio(organism, denominator), organism, given, kept, boardFiles, boards: perBoard, weeks: sorted, undated };
}

export const fmtShare = (n, d) => n + '/' + d + ' = ' + (d > 0 ? (n / d).toFixed(4) + ' (' + ((100 * n) / d).toFixed(2) + ' percent)' : 'n/a (nothing in the denominator)');

/** The printed lines of one run. */
export function renderShare(s, { authoredRel = AUTHORED_REL, boardsRel = BOARDS_REL, authoredInfo = null, boardsInfo = null } = {}) {
  const L = [];
  L.push('authorship: organism-authored kept patches over (all kept patches + files landed by boards)');
  L.push('  authored  ' + authoredRel + ': ' + (authoredInfo && !authoredInfo.present ? 'absent, 0 lines' : s.kept + ' kept (' + s.organism + ' organism, ' + s.given + ' given)' + (authoredInfo && authoredInfo.bad ? ', ' + authoredInfo.bad + ' unreadable lines' : '')));
  L.push('  boards    ' + boardsRel + ': ' + s.boards.length + ' boards, ' + s.boardFiles + ' files landed' + (boardsInfo && boardsInfo.reason ? ' (' + boardsInfo.reason + ')' : ''));
  for (const b of s.boards) L.push('    board ' + b.board + ' at ' + b.at + ' (' + (b.week || 'undated') + '): ' + b.files + ' files');
  for (const r of s.weeks) {
    L.push('  week ' + r.week + '  organism ' + r.organism + '  kept ' + r.kept + '  board files ' + r.boardFiles + '  share ' + fmtShare(r.numerator, r.denominator) + '  cumulative ' + fmtShare(r.cumulative.numerator, r.cumulative.denominator));
  }
  if (s.undated) L.push('  undated rows left out: ' + s.undated);
  L.push('SHARE (cumulative): numerator ' + s.numerator + ' organism-authored kept patches, denominator ' + s.denominator + ' (' + s.kept + ' kept patches + ' + s.boardFiles + ' board files) = ' + fmtShare(s.numerator, s.denominator));
  return L.join('\n');
}

function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2);
    if (k === 'json' || k === 'no-write') { o[k] = true; continue; }
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
  const a = readAuthored(authoredFile);
  const b = readBoards(boardsFile);
  const s = computeShare({ authored: a.lines, boards: b.boards });
  const text = renderShare(s, { authoredRel: rel(authoredFile), boardsRel: rel(boardsFile), authoredInfo: a, boardsInfo: b });
  const command = 'node tools/authorship.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  const verdict = {
    at: now.toISOString(), command, node: process.version, isTheBar: true,
    statement: 'The organism authored ' + s.numerator + ' of the ' + s.denominator + ' units of change counted here: ' + s.numerator + ' kept patches in ' + rel(authoredFile)
      + ' carry an organism author (a model cell on open weights, the deterministic census prune, or mind/imagine.mjs), against a denominator of ' + s.kept + ' kept patches of any author plus '
      + s.boardFiles + ' files landed by ' + s.boards.length + ' boards in ' + rel(boardsFile) + ', so the cumulative share is ' + fmtShare(s.numerator, s.denominator)
      + '. Only these two files are read; a board that has not yet been appended to ' + rel(boardsFile) + ' is not in the denominator, and a patch the autopilot reverted or refused is in neither.',
    numerator: s.numerator, denominator: s.denominator, share: s.share,
    organism: s.organism, given: s.given, kept: s.kept, boardFiles: s.boardFiles,
    boards: s.boards, weeks: s.weeks, undated: s.undated,
    sources: { authored: { file: rel(authoredFile), present: a.present, lines: a.lines.length, bad: a.bad }, boards: { file: rel(boardsFile), present: b.present, reason: b.reason } },
  };
  if (!o['no-write']) { mkdirSync(path.dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n'); }
  return { share: s, text, verdict, out: o['no-write'] ? null : out, json: !!o.json };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const r = main();
  if (r.json) console.log(JSON.stringify(r.verdict, null, 2));
  else console.log(r.text + (r.out ? '\nwrote ' + path.relative(process.cwd(), r.out).replaceAll('\\', '/') : ''));
}
