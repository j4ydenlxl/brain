// self/gaps.mjs: THE GAP LEDGER. Every place the brain stands short of its own bar, one line
// each, with the command that measured it and the smallest bounded trial that measures it again.
// Author: board 14 builder. MODEL OFF: nothing here opens a socket.
//
// His order (Sep 24 2026): "EVERY GAP should be able to be filled by itself". A gap the organism
// cannot see is a gap it cannot fill, and this file is how it sees them. It READS the verdicts,
// ladder.json, gate.json, notes/ and the census records, and WRITES only state/self/gaps.jsonl.
//
// THE SOURCES
//   (a) every bench/verdicts/*.json with isTheBar true, classified met, missed or undecidable
//       from a top-level barMet, a top-level met, met.bar, bar.met, or a verdict word, in that
//       order (classifyBar). A missed file is a gap of kind "missed"; an undecidable one is a gap
//       of kind "unreadable bar", whose fill is a top-level barMet written by its own bench.
//   (b) every <name>-partial.json with no <name>.json and no bar file for any dash prefix of
//       <name> (census-dormant-partial is a narrow census, not a missing bar): "bar never completed".
//   (c) ladder.json blocks with a measured number beside a bar, read from its FIELDS, never its
//       statement: "ladder". A block or a value reading "not measured" is no gap.
//   (d) gate.json: a test file that failed or a row that is not ok is "gate red"; a test file at
//       15000 ms or more is "gate slow".
//   (e) the OPEN lines of notes/, read by self/autopilot.mjs notesCandidates (imported, not
//       copied): "open".
//   (f) the census dead share of every emitted seed above 0, from bench/gate.mjs censusFor over
//       censusRecords (imported): "dead share".
//
// ONE LINE: {id, kind, subsystem, measured, bar, unit, distance, verdictFile, benchCommand,
// trial, files, since} plus better (which way is up) and why. distance is bar minus measured, so
// its sign says which way the measured number must move. subsystem is the docs/ARCHITECTURE.md
// section 12 or 13 entry whose command names the bench or test file, else "unmapped". files is
// what a fill would change: the entry's files, or for an unmapped gap the relative imports of its
// bench outside bench/, tools/, test/ and self/ (the rulers are never the patch).
//
// A TRIAL is the bench's smallest documented form, bounded under 10 minutes and a 6000 MB working
// set, launched through tools/budget.mjs by bench/gaps.mjs runTrial. A gap with no bounded form
// has trial null and a why; bench/gaps.mjs prints it by name.
//
// THE FILE: state/self/gaps.jsonl is rewritten whole by every run. The file it replaces is kept as
// gaps-<its date>.jsonl, and at most 7 dated files are kept (the newest by date).
//
// BOARD ITEMS (board 15 builder): (g) every undone item of every docs/boards/board-N.js and
// docs/boards/proposed/*.md, read by self/boards.mjs without running the script, is one line of
// kind "board item" {id: board-N:key, board, key, owns, brief (the whole task text), verdictFile,
// bar (the BAR sentence), trial (the bar command string, or null), needsModel, minutes: 60, files}.
// They are merged by the WRITER, never by buildLedger: writeLedger drops the board-item lines it is
// handed and appends a fresh scan, so every writer of the ledger carries them, while buildLedger's
// lines (the ones bench/gaps.mjs runs as bounded trials) never do: a board item's trial is a whole
// bar run, sized for the brief operator, not a 10-minute trial.
//
//   node self/gaps.mjs           build and write the ledger, print the counts
//   node self/gaps.mjs --dry     build it, write nothing, print the counts as one JSON line
//   node self/gaps.mjs --json    build and write it, and print every line
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync, renameSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { boardItemLines, BOARD_ITEM_KIND } from './boards.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'board 14 builder';
export const LEDGER_REL = 'state/self/gaps.jsonl';
export const KEEP_DATED = 7;
export const DATED_RE = /^gaps-(\d{4}-\d{2}-\d{2})\.jsonl$/;
/** The gate's slow line: a test file at this many ms or more is a gap (self/autopilot.mjs SLOW_MS). */
export const GATE_SLOW_MS = 15_000;
export const KINDS = Object.freeze(['missed', 'unreadable bar', 'bar never completed', 'ladder', 'gate red', 'gate slow', 'open', 'dead share', BOARD_ITEM_KIND]);
/** The kinds whose every gap must carry a trial for bench/gaps.mjs to meet its bar. */
export const REQUIRED_KINDS = Object.freeze(['missed', 'ladder', 'gate red', 'gate slow']);
export const HEAP = '--max-old-space-size=6000';
export const RAM_MB = 6000;
export const TRIAL_MAX_MINUTES = 10;

const r6 = (x) => Math.round(x * 1e6) / 1e6;
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const relOf = (root, p) => path.relative(root, p).replaceAll('\\', '/');
const byStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const NOT_MEASURED = /^\s*not measured\b/i;
const notMeasured = (x) => typeof x === 'string' && NOT_MEASURED.test(x);

/** A dotted field of an object, or undefined. */
export function get(o, dotted) {
  let cur = o;
  for (const k of String(dotted).split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = cur[k];
  }
  return cur;
}

function readJson(file) {
  try { return { v: JSON.parse(readFileSync(file, 'utf8')), error: null }; } catch (e) { return { v: null, error: String((e && e.message) || e).split('\n')[0] }; }
}

// ------------------------------------------------------------------ (a) what a bar file says
const MISSED_WORD = /^(NOT\s+MET|MISSED|MISS|RED|FAIL(?:ED|S)?|NULL|LOSES|LOST|BELOW)\b/;
const MET_WORD = /^(MET|GREEN|BEATS?|PASS(?:ED)?|ABOVE)\b/;

/**
 * Met, missed or undecidable, and the field that decided it. Order: a top-level boolean barMet,
 * a top-level boolean met, met.bar, bar.met, the verdict word; anything else is undecidable.
 * @returns {{state: 'met'|'missed'|'undecidable', field: string|null, why: string|null}}
 */
export function classifyBar(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { state: 'undecidable', field: null, why: 'not a JSON object' };
  if (typeof v.barMet === 'boolean') return { state: v.barMet ? 'met' : 'missed', field: 'barMet', why: null };
  if (typeof v.met === 'boolean') return { state: v.met ? 'met' : 'missed', field: 'met', why: null };
  if (v.met && typeof v.met === 'object' && typeof v.met.bar === 'boolean') return { state: v.met.bar ? 'met' : 'missed', field: 'met.bar', why: null };
  if (v.bar && typeof v.bar === 'object' && !Array.isArray(v.bar) && typeof v.bar.met === 'boolean') return { state: v.bar.met ? 'met' : 'missed', field: 'bar.met', why: null };
  if (typeof v.verdict === 'string') {
    const w = v.verdict.trim().toUpperCase();
    if (MISSED_WORD.test(w)) return { state: 'missed', field: 'verdict', why: null };
    if (MET_WORD.test(w)) return { state: 'met', field: 'verdict', why: null };
    return { state: 'undecidable', field: null, why: 'the verdict word "' + v.verdict.slice(0, 40) + '" is neither met nor missed' };
  }
  const has = typeof v.bar === 'string' ? 'its bar is prose' : v.bar && typeof v.bar === 'object' ? 'its bar object has no boolean met' : 'no bar field';
  return { state: 'undecidable', field: null, why: 'no barMet, met, met.bar, bar.met or verdict word; ' + has };
}

/** Every top-level *.json of a verdicts dir, parsed. */
export function readVerdicts(verdictsDir) {
  let names; try { names = readdirSync(verdictsDir, { withFileTypes: true }); } catch { return []; }
  const out = [];
  for (const e of names) {
    if (!e.isFile() || !e.name.endsWith('.json')) continue;
    const { v, error } = readJson(path.join(verdictsDir, e.name));
    const stem = e.name.slice(0, -5);
    out.push({ file: e.name, stem, v, error, partial: stem.endsWith('-partial'), isTheBar: !!(v && v.isTheBar === true) });
  }
  return out.sort((a, b) => byStr(a.file, b.file));
}

/** The first .mjs or .js path of a command line (the bench a verdict names), or null. */
export function scriptOf(command) {
  if (typeof command !== 'string') return null;
  for (const tok of command.trim().split(/\s+/)) {
    if (tok.startsWith('-')) continue;
    if (/\.m?js$/.test(tok)) return tok.replaceAll('\\', '/').replace(/^\.\//, '');
  }
  return null;
}

/**
 * The number beside each missed bar, by verdict stem: the field that holds the measured value
 * and the field (or the fixed number, with where it comes from) that holds the bar.
 */
export const MEASURES = Object.freeze({
  compress: { measured: 'bar.measured', bar: 'bar.ratio', unit: 'x fall in checkpoint bytes per tick', better: 'higher' },
  math: { measured: 'bar.pot5Lo', bar: 'bar.aloneHi', unit: 'share correct (the pot5 interval low end against the alone interval high end)', better: 'higher' },
  'venue-full': { measured: 'holdout.gapVsControl.lo', bar: 0, barFrom: 'its claim: the 95 percent interval of the paired gap must exclude zero, so its low end must pass 0', unit: 'SOL per unit size per instrument (evolved minus matched control)', better: 'higher' },
  authorship: { measured: 'share', bar: 1, barFrom: 'its barRule: an organism share of exactly 1', unit: 'share of landed changes the organism authored', better: 'higher' },
});

/** Checks passed against checks present, from a checks array of {ok} or an object of booleans. */
export function checksOf(v) {
  const c = v && v.checks;
  let list = null;
  if (Array.isArray(c)) list = c.filter((x) => x && typeof x.ok === 'boolean').map((x) => x.ok);
  else if (c && typeof c === 'object') list = Object.values(c).filter((x) => typeof x === 'boolean');
  if (!list || !list.length) return null;
  return { passed: list.filter(Boolean).length, total: list.length };
}

/** The boolean conditions of a bar object (its own met flag left out), when it has at least two. */
export function barBooleansOf(v) {
  const bar = v && v.bar;
  if (!bar || typeof bar !== 'object' || Array.isArray(bar)) return null;
  const keys = Object.keys(bar).filter((k) => k !== 'met' && typeof bar[k] === 'boolean');
  if (keys.length < 2) return null;
  return { passed: keys.filter((k) => bar[k]).length, total: keys.length, falseKeys: keys.filter((k) => !bar[k]) };
}

/** The wall seconds a verdict records for its own run, or null. */
export function wallOf(v) {
  if (!v || typeof v !== 'object') return null;
  const s = num(v.wallS ?? v.wall_s ?? v.seconds);
  if (s !== null) return s;
  const ms = num(v.wallMs ?? v.ms);
  return ms !== null ? r6(ms / 1000) : null;
}

/** measured, bar, unit, better, distance and where each came from, for one missed verdict. */
export function measureOf(stem, v, measures = MEASURES) {
  const m = measures[stem];
  if (m) {
    const measured = num(get(v, m.measured));
    const bar = typeof m.bar === 'number' ? m.bar : num(get(v, m.bar));
    return {
      measured, bar, unit: m.unit, better: m.better,
      distance: measured !== null && bar !== null ? r6(bar - measured) : null,
      from: 'measured ' + m.measured + ', bar ' + (typeof m.bar === 'number' ? m.bar + ' (' + (m.barFrom || 'fixed') + ')' : m.bar),
    };
  }
  const c = checksOf(v);
  if (c) return { measured: c.passed, bar: c.total, unit: 'checks passed', better: 'higher', distance: c.total - c.passed, from: 'checks: ' + c.passed + ' of ' + c.total + ' ok' };
  const bb = barBooleansOf(v);
  if (bb) return { measured: bb.passed, bar: bb.total, unit: 'bar conditions true', better: 'higher', distance: bb.total - bb.passed, from: 'bar booleans: ' + bb.passed + ' of ' + bb.total + ' true (false: ' + bb.falseKeys.join(', ') + ')' };
  return { measured: null, bar: null, unit: null, better: null, distance: null, from: 'no registered field holds a number beside this bar' };
}

// ------------------------------------------------------------------ subsystems (ARCHITECTURE 12, 13)
function sectionText(text, n) {
  const start = text.search(new RegExp('^## ' + n + '\\.', 'm'));
  if (start < 0) return '';
  const rest = text.slice(start + 4);
  const end = rest.search(/^## /m);
  return end < 0 ? text.slice(start) : text.slice(start, start + 4 + end);
}

/**
 * The map of docs/ARCHITECTURE.md sections 12 and 13: per entry its name, its commands (every
 * backticked `node ...` span, joined across line breaks) and the files it names that exist.
 */
export function readArchitecture(root = ROOT) {
  let text; try { text = readFileSync(path.join(root, 'docs', 'ARCHITECTURE.md'), 'utf8'); } catch { return []; }
  const entries = [];
  const s12 = sectionText(text, 12);
  for (const chunk of s12.split(/^- \*\*/m).slice(1)) {
    const name = (chunk.match(/^(.+?)\*\*/) || [])[1];
    if (!name) continue;
    const body = chunk.replace(/\s*\r?\n\s*/g, ' ');
    const paren = (body.slice(name.length + 2).match(/^\s*\(([^)]*)\)/) || [])[1] || '';
    const dirs = [...paren.matchAll(/`([^`]+\/)`/g)].map((m) => m[1]);
    const spans = [...body.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
    const commands = spans.filter((s) => /^node\s/.test(s));
    const files = [];
    for (const s of spans) {
      if (!/^[\w./-]+\.mjs$/.test(s)) continue;
      const cands = s.includes('/') ? [s] : dirs.map((d) => d + s);
      const hit = cands.find((c) => existsSync(path.join(root, c)));
      if (hit && !files.includes(hit)) files.push(hit);
    }
    entries.push({ section: 12, name: name.trim(), commands, files });
  }
  const s13 = sectionText(text, 13);
  if (s13) {
    const commands = [...s13.replace(/\s*\r?\n\s*/g, ' ').matchAll(/`([^`]+)`/g)].map((m) => m[1].trim()).filter((s) => /^node\s/.test(s));
    entries.push({ section: 13, name: 'How to check any claim', commands, files: [] });
  }
  return entries;
}

/** The first entry whose commands name one of these paths as a whole token. */
export function subsystemFor(entries, targets) {
  const want = targets.filter(Boolean).map((t) => t.replaceAll('\\', '/'));
  for (const e of entries) {
    for (const c of e.commands) {
      const toks = c.split(/\s+/);
      if (want.some((w) => toks.includes(w))) return e;
    }
  }
  return null;
}

const RULER_DIR = /^(bench|tools|test|self)\//;
/** The relative imports of a source file that exist, outside the ruler dirs. */
export function relativeImports(root, relFile) {
  let src; try { src = readFileSync(path.join(root, relFile), 'utf8'); } catch { return []; }
  const specs = [];
  for (const m of src.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
  for (const m of src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
  for (const m of src.matchAll(/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g)) specs.push(m[1]);
  const out = [];
  for (const s of specs) {
    if (!s.startsWith('.')) continue;
    const r = relOf(root, path.resolve(root, path.dirname(relFile), s));
    if (r.startsWith('..') || RULER_DIR.test(r) || !existsSync(path.join(root, r))) continue;
    if (!out.includes(r)) out.push(r);
  }
  return out.sort(byStr);
}

function placeOf(root, entries, targets) {
  const e = subsystemFor(entries, targets);
  if (e) return { subsystem: e.name, files: e.files.slice(), filesFrom: 'the map' };
  const script = targets.find((t) => t && /\.m?js$/.test(t));
  return { subsystem: 'unmapped', files: script ? relativeImports(root, script) : [], filesFrom: script ? 'the imports of ' + script : 'nothing names a file' };
}

// ------------------------------------------------------------------ trials
/**
 * The bounded forms, each the bench's own documented narrowing. {tmp} is the trial's watched temp
 * dir and {copy} its copy root. where "copy" runs in a fresh copy of the tree (bench/gaps.mjs
 * COPY_EXCLUDE), "tree" runs read only in the tree. parser names the reader in PARSERS.
 */
export const FORMS = Object.freeze({
  compress: {
    bench: 'bench/compress.mjs', argv: [HEAP, 'bench/compress.mjs', '--daemon-wall-ms', '30000', '--skip-organism', '--skip-tiers', '--tmp', '{tmp}', '--quiet'],
    minutes: 6, needsModel: false, where: 'copy', writes: ['bench/verdicts/compress-partial.json'], parser: 'compress', diskMb: 800, fixtures: ['bench/fixtures/answer-questions.json'],
    doc: 'bench/compress.mjs usage: --daemon-wall-ms and the --skip flags narrow it to compress-partial.json; the daemon arms alone carry the ratio',
  },
  venue: {
    bench: 'bench/venue.mjs', argv: [HEAP, 'bench/venue.mjs', '--full', '--generations', '3', '--pop', '16'],
    minutes: 3, needsModel: false, where: 'copy', trader: true, writes: ['bench/verdicts/venue-full-partial.json'], parser: 'venue', diskMb: 200,
    doc: 'bench/venue.mjs: any configuration but the canonical one writes venue-full-partial.json',
  },
  grid: {
    bench: 'bench/grid.mjs', argv: [HEAP, 'bench/grid.mjs', '--split', 'evaluation', '--budget-ms', '3000', '--workers', '2', '--limit', '10'],
    minutes: 3, needsModel: false, where: 'copy', fixtures: ['bench/fixtures/public/arc-agi-1'], writes: ['bench/verdicts/grid-evaluation-partial.json'], parser: 'grid', diskMb: 200,
    doc: 'bench/grid.mjs: a --limit run writes grid-evaluation-partial.json',
  },
  daemon: {
    bench: 'bench/daemon.mjs', argv: [HEAP, 'bench/daemon.mjs', '--quick'],
    minutes: 5, needsModel: false, where: 'copy', writes: ['bench/verdicts/daemon-partial.json', 'state/daemon-bar'], parser: 'daemon', diskMb: 600, fixtures: ['bench/fixtures/answer-questions.json'],
    doc: 'bench/daemon.mjs --quick: 60 s + 20 s, writes daemon-partial.json',
  },
  authorship: {
    bench: 'tools/authorship.mjs', argv: ['tools/authorship.mjs', '--no-write', '--json'],
    minutes: 1, needsModel: false, where: 'tree', writes: [], parser: 'authorship', diskMb: 100,
    doc: 'tools/authorship.mjs --no-write --json prints the verdict and writes nothing',
  },
  schedule: {
    bench: 'tools/schedule-autopilot.mjs', argv: ['tools/schedule-autopilot.mjs', '--status'],
    minutes: 1, needsModel: false, where: 'tree', writes: [], parser: 'schedule', diskMb: 100,
    doc: 'tools/schedule-autopilot.mjs --status reads the task and changes nothing',
  },
  spread: {
    bench: 'bench/spread.mjs', argv: [HEAP, 'bench/spread.mjs', '--seeds', '2', '--wall-s', '20', '--no-promote'],
    minutes: 3, needsModel: false, where: 'copy', writes: ['bench/verdicts/spread-partial.json', 'bench/verdicts/spread-control-partial.json'], parser: 'spread', diskMb: 400,
    doc: 'bench/spread.mjs: --seeds 2 --wall-s 20 --no-promote is its documented partial run; it writes spread-partial.json with isTheBar false',
  },
  operators: {
    bench: 'bench/operators.mjs', argv: [HEAP, 'bench/operators.mjs', '--tmp', '{tmp}', '--no-model', '--planted-only'],
    minutes: 8, needsModel: false, where: 'copy', writes: ['bench/verdicts/operators-partial.json'], parser: 'operators', diskMb: 4096,
    doc: 'bench/operators.mjs: --no-model --planted-only is a documented PARTIAL run; it writes operators-partial.json with isTheBar false',
  },
  autopilot: {
    bench: 'bench/autopilot.mjs', argv: [HEAP, 'bench/autopilot.mjs', '--model', 'off'],
    minutes: 8, needsModel: false, where: 'copy', writes: ['bench/verdicts/autopilot-partial.json'], parser: 'autopilot', diskMb: 2048,
    doc: 'bench/autopilot.mjs --model off skips the one model call of stage 4b and writes autopilot-partial.json with isTheBar false',
  },
  cloud: {
    bench: 'bench/cloud.mjs', argv: [HEAP, 'bench/cloud.mjs', '--native', '--seconds', '60', '--episodes-max', '2048', '--out', 'bench/verdicts/cloud-partial.json'],
    minutes: 4, needsModel: false, where: 'copy', fixtures: ['bench/fixtures/wiki/store'], writes: ['bench/verdicts/cloud-partial.json'], parser: 'cloud', diskMb: 2048,
    doc: 'bench/cloud.mjs: an --episodes-max override (compose.yaml own 2048 here, so the organism runs as the bar runs it) always writes cloud-partial with isTheBar false; --seconds 60 bounds the wall',
  },
  'cloud-host': {
    bench: 'bench/cloud-host.mjs', argv: [HEAP, 'bench/cloud-host.mjs', '--days', '1', '--out', '{tmp}/cloud-host-trial.json'],
    minutes: 8, needsModel: false, where: 'tree', writes: [], parser: 'cloudHost', diskMb: 100,
    doc: 'bench/cloud-host.mjs without --checkout-trial reads gh and the tree only; --out under the trial temp dir keeps its always-isTheBar verdict out of bench/verdicts',
  },
  'cloud-fit': {
    bench: 'bench/cloud.mjs', argv: [HEAP, 'bench/cloud.mjs', '--native', '--seconds', '300', '--out', 'bench/verdicts/cloud-fit-partial.json'],
    minutes: 8, needsModel: false, where: 'copy', fixtures: ['bench/fixtures/wiki/store'], writes: ['bench/verdicts/cloud-fit-partial.json'], parser: 'cloudFit', diskMb: 2048,
    doc: 'bench/cloud.mjs --seconds 300 is the documented short form of the Board 13 fit bar (1800 s); under 1800 s it writes isTheBar false; the metric is instance A budget kills at the rss cap',
  },
  gaps: {
    bench: 'self/gaps.mjs', argv: ['self/gaps.mjs', '--dry'],
    minutes: 2, needsModel: false, where: 'tree', writes: [], parser: 'gapsDry', diskMb: 100,
    doc: 'self/gaps.mjs --dry builds the ledger and writes nothing',
  },
  math: {
    bench: 'bench/math.mjs', argv: [HEAP, 'bench/math.mjs', '--limit', '5', '--seed', '1', '--nobig', '--nowrite'],
    minutes: 9, needsModel: true, where: 'copy', writes: [], parser: null, dry: null, diskMb: 200,
    doc: 'bench/math.mjs --limit N --nowrite: a model run with no --dry form',
  },
  'public-gsm8k': {
    bench: 'bench/public.mjs', argv: [HEAP, 'bench/public.mjs', '--set', 'gsm8k', '--limit', '5', '--seed', '1', '--nowrite'],
    minutes: 9, needsModel: true, where: 'copy', writes: [], parser: null, dry: null, diskMb: 200,
    doc: 'bench/public.mjs --limit N --nowrite: a model run with no --dry form',
  },
  'public-humaneval': {
    bench: 'bench/public.mjs', argv: [HEAP, 'bench/public.mjs', '--set', 'humaneval', '--limit', '5', '--seed', '1', '--nowrite'],
    minutes: 9, needsModel: true, where: 'copy', writes: [], parser: null, dry: null, diskMb: 200,
    doc: 'bench/public.mjs --limit N --nowrite: a model run with no --dry form',
  },
  'ladder-daily': {
    bench: 'bench/ladder.mjs', argv: [HEAP, 'bench/ladder.mjs', '--daily'],
    minutes: 9, needsModel: true, where: 'copy', writes: ['bench/verdicts/ladder'], parser: null,
    fixtures: ['bench/fixtures/answer-questions.json', 'bench/fixtures/code-tasks.json'],
    dry: { argv: [HEAP, 'bench/ladder.mjs', '--daily', '--quick'], flag: '--quick', doc: 'bench/ladder.mjs: --quick opens no socket and writes nothing' },
    diskMb: 200, doc: 'bench/ladder.mjs --daily: the daily ruler, a model run',
  },
});

/** Which form measures a missed or unreadable verdict again, by stem. */
export const VERDICT_FORMS = Object.freeze({ compress: 'compress', math: 'math', 'venue-full': 'venue', venue: 'venue', authorship: 'authorship', 'schedule-autopilot': 'schedule', gaps: 'gaps', 'grid-evaluation': 'grid', daemon: 'daemon', spread: 'spread', 'spread-control': 'spread', operators: 'operators', autopilot: 'autopilot', 'autopilot-board10': 'autopilot', 'autopilot-board14-first': 'autopilot', cloud: 'cloud', 'cloud-2': 'cloud', 'cloud-host': 'cloud-host', 'cloud-fit': 'cloud-fit', 'cloud-fit-300': 'cloud-fit', 'cloud-fit-control': 'cloud-fit' });
/** Which form measures a ladder block again, by the block's id. */
export const LADDER_FORMS = Object.freeze({ 'sets.gsm8k': 'public-gsm8k', 'sets.humaneval': 'public-humaneval', 'sets.arc': 'grid', improvement: 'daemon', target: 'ladder-daily' });
/** Census ticks per seed where the bar's 200 does not fit: census-h20-partial.json ran gen-0 at 20 ticks with rssAfterFull 3600.6 MB. */
export const CENSUS_TICKS = Object.freeze({ 'organism/gen-0': 20 });
/** Seeds with no bounded census form, and why. */
export const CENSUS_NONE = Object.freeze({
  'organism/scale-52000': 'the BUDGETS rule says never load organism/scale-52000 whole, and every census form that measures its dead share (--static, --sample over all batches) reads all of it',
});

export function commandOf(t) {
  const dir = t.where === 'copy' ? '<copy>' : '<tmp>';
  const show = (a) => a.replaceAll('{tmp}', dir === '<copy>' ? '<copy>/tmp' : '<tmp>').replaceAll('{copy}', '<copy>');
  return 'node tools/budget.mjs --ram-mb ' + (t.ramMb || RAM_MB) + ' --disk-mb ' + t.diskMb + ' --dir ' + dir + ' -- node ' + t.argv.map(show).join(' ');
}

/** A ledger trial from a form (a key into FORMS or a form object). */
export function trialOf(key, form = FORMS[key]) {
  if (!form) return null;
  const t = {
    key, command: null, minutes: form.minutes, needsModel: form.needsModel, writes: (form.writes || []).slice(),
    where: form.where, bench: form.bench, argv: form.argv.slice(), parser: form.parser || null, runner: form.runner || 'budget',
    dry: form.dry ? { argv: form.dry.argv.slice(), flag: form.dry.flag, command: null } : null,
    seed: form.seed || null, fixtures: (form.fixtures || []).slice(), trader: !!form.trader, ramMb: RAM_MB, diskMb: form.diskMb, doc: form.doc || null,
  };
  t.command = commandOf(t);
  if (t.dry) t.dry.command = commandOf({ ...t, argv: t.dry.argv });
  return t;
}

/** A red gate row's bounded trial, where the tool has a row-only command. Rows without one keep trial null. */
export const ROW_FORMS = Object.freeze({
  contamination: {
    bench: 'bench/gate.mjs', argv: [HEAP, 'bench/gate.mjs', '--contamination'], minutes: 3, needsModel: false, where: 'tree', writes: [], parser: 'contamination', diskMb: 50,
    doc: 'bench/gate.mjs --contamination grades the CONTAMINATION row alone from bench/verdicts and prints its line; it reads only',
  },
  boundary: {
    bench: 'tools/boundary-audit.mjs', argv: [HEAP, 'tools/boundary-audit.mjs', '--bar'], minutes: 8, needsModel: false, where: 'copy', writes: ['bench/verdicts/boundary.json'], parser: 'boundary', diskMb: 2048,
    doc: 'tools/boundary-audit.mjs --bar runs the static scan, the allowlist check, the probe and the touched tests on the copy and prints the allowlist line (unlisted, stale, over cap)',
  },
});
export function rowTrial(name) { return ROW_FORMS[name] ? trialOf('row:' + name, ROW_FORMS[name]) : null; }

export function testTrial(file, ms) {
  const minutes = Math.min(TRIAL_MAX_MINUTES - 1, Math.max(1, Math.ceil((3 * (num(ms) || 60_000)) / 60_000)));
  return trialOf('test:' + file, {
    bench: file, argv: [HEAP, '--test', file], minutes, needsModel: false, where: 'tree', writes: [], parser: 'test', runner: 'test', diskMb: 2048,
    doc: 'the gate runs every test file this way (bench/gate.mjs runTestFile); three times its last wall, at least a minute',
  });
}

export function censusTrial(seed) {
  const name = seed.replace(/^organism\//, '');
  const ticks = CENSUS_TICKS[seed] || 200;
  return trialOf('census:' + name, {
    bench: 'tools/organism-census.mjs', argv: [HEAP, 'tools/organism-census.mjs', '--seed', seed, '--ticks', String(ticks), '--no-knockout', '--tag', 'gaps'],
    minutes: ticks === 200 ? 2 : 5, needsModel: false, where: 'copy', seed, writes: ['bench/verdicts/' + censusPartialName(seed, 'gaps')], parser: 'census', diskMb: 400,
    doc: 'tools/organism-census.mjs --no-knockout --tag t writes census[-seed]-t-partial.json' + (ticks !== 200 ? '; ' + ticks + ' ticks is the form census-h20-partial.json documents for this seed' : ''),
  });
}

/** tools/organism-census.mjs's output name for a tagged run: gen-0 is census.json's seed. */
export function censusPartialName(seed, tag) {
  const name = seed.replace(/^organism\//, '');
  return 'census' + (name === 'gen-0' ? '' : '-' + name) + '-' + tag + '-partial.json';
}

export function deadShareOf(lines) {
  const loaded = num(lines && lines.loaded), lb = num(lines && lines.loadBearing);
  if (loaded === null || lb === null || !(loaded > 0)) return null;
  return r6(1 - lb / loaded);
}

/** Per parser: where the metric is read (a file in the trial's cwd, or its stdout) and how. */
export const PARSERS = Object.freeze({
  compress: { name: 'ratio (x)', file: () => 'bench/verdicts/compress-partial.json', read: (v) => num(get(v, 'bar.measured')) },
  venue: { name: 'holdout gap low end', file: () => 'bench/verdicts/venue-full-partial.json', read: (v) => num(get(v, 'holdout.gapVsControl.lo')) ?? num(get(v, 'holdout.lo')) },
  grid: { name: 'percent solved', file: () => 'bench/verdicts/grid-evaluation-partial.json', read: (v) => num(v && v.pct) },
  daemon: { name: 'percent per second (carried)', file: () => 'bench/verdicts/daemon-partial.json', read: (v) => { const c = num(get(v, 'phaseA.perWallSecond.carried')); return c === null ? null : r6(c * 100); } },
  census: { name: 'dead share', file: (t) => 'bench/verdicts/' + censusPartialName(t.seed, 'gaps'), read: (v) => deadShareOf(v && v.lines) },
  authorship: { name: 'organism share', stdout: true, read: (out) => { try { return num(JSON.parse(out).share); } catch { return null; } } },
  schedule: { name: 'registered (1 or 0)', stdout: true, read: (out) => (/not registered/i.test(out) ? 0 : /\S/.test(out) ? 1 : null) },
  gapsDry: { name: 'required gaps without a trial', stdout: true, read: (out) => { const l = out.trim().split(/\r?\n/).pop(); try { return num(JSON.parse(l).requiredWithoutTrial); } catch { return null; } } },
  spread: { name: 'improvements kept per million organism-years', file: () => 'bench/verdicts/spread-partial.json', read: (v) => num(v && v.keptPerMillionOrganismYears) },
  operators: { name: 'planted defects kept', file: () => 'bench/verdicts/operators-partial.json', read: (v) => (v && Array.isArray(v.kept) ? v.kept.length : null) },
  autopilot: { name: 'checks passed', file: () => 'bench/verdicts/autopilot-partial.json', read: (v) => num(v && v.passed) },
  cloud: { name: 'restarts at the cap', file: () => 'bench/verdicts/cloud-partial.json', read: (v) => num(v && v.restartCount) },
  cloudHost: { name: 'workflow checks passed', stdout: true, read: (out) => { const m = String(out).match(/(\d+) of (\d+) checks/); return m ? num(Number(m[1])) : null; } },
  contamination: { name: 'bar files without a split object, plus contaminated and unlabelled', stdout: true, read: (out) => { const s = String(out); const a = s.match(/with no split (\d+)/), b = s.match(/split not an object (\d+)/), c = s.match(/contaminated and unlabelled (\d+)/); return a && b && c ? num(Number(a[1]) + Number(b[1]) + Number(c[1])) : null; } },
  boundary: { name: 'unlisted plus over-cap boundaries', stdout: true, read: (out) => { const m = String(out).match(/unlisted (\d+), stale (\d+), over cap (\d+)/); return m ? num(Number(m[1]) + Number(m[3])) : null; } },
  cloudFit: { name: 'budget kills at the rss cap, instance A', file: () => 'bench/verdicts/cloud-fit-partial.json', read: (v) => num(v && v.restartsBreakdown && v.restartsBreakdown.budgetKills) },
  test: { name: 'wall ms', row: true },
});

// ------------------------------------------------------------------ the sources
function lineOf(o) {
  return {
    id: o.id, kind: o.kind, subsystem: o.subsystem ?? 'unmapped',
    measured: o.measured ?? null, bar: o.bar ?? null, unit: o.unit ?? null,
    distance: o.distance ?? (num(o.bar) !== null && num(o.measured) !== null ? r6(o.bar - o.measured) : null),
    verdictFile: o.verdictFile ?? null, benchCommand: o.benchCommand ?? null, trial: o.trial ?? null,
    files: o.files || [], since: o.since ?? null, better: o.better ?? null, why: o.why ?? null,
  };
}

function verdictGaps({ root, verdictsDir, verdicts, entries, measures, forms }) {
  const lines = [];
  const report = { barFiles: 0, met: [], missed: [], undecidable: [], noTopLevelBarMet: [], fields: {}, unparseable: [], partialOnly: [] };
  const vdRel = relOf(root, verdictsDir);
  const barStems = new Set(verdicts.filter((x) => x.isTheBar && !x.partial).map((x) => x.stem));
  const allStems = new Set(verdicts.map((x) => x.stem));
  for (const x of verdicts) {
    const verdictFile = vdRel + '/' + x.file;
    if (x.error) {
      if (!x.partial) report.unparseable.push(x.file);
      if (!x.partial) {
        lines.push(lineOf({ id: 'unreadable:' + x.file, kind: 'unreadable bar', verdictFile, why: 'not JSON: ' + x.error + '; the fill is a bar file its bench writes whole', files: [] }));
      }
      continue;
    }
    if (!x.isTheBar) continue;
    report.barFiles++;
    const c = classifyBar(x.v);
    report.fields[x.stem] = c.field;
    if (typeof x.v.barMet !== 'boolean') report.noTopLevelBarMet.push(x.file);
    const script = scriptOf(x.v.command);
    const formKey = forms[x.stem] || null;
    const trial = formKey ? trialOf(formKey) : null;
    const place = placeOf(root, entries, [trial ? trial.bench : null, script, verdictFile]);
    if (c.state === 'met') { report.met.push(x.file); continue; }
    if (c.state === 'missed') {
      report.missed.push(x.file);
      const m = measureOf(x.stem, x.v, measures);
      lines.push(lineOf({
        id: 'missed:' + x.file, kind: 'missed', subsystem: place.subsystem, measured: m.measured, bar: m.bar, unit: m.unit, distance: m.distance, better: m.better,
        verdictFile, benchCommand: x.v.command ?? null, trial, files: place.files, since: x.v.at ?? null,
        why: 'decided by ' + c.field + '; ' + m.from + (trial ? '' : '; no bounded form is registered for this bench' + (wallOf(x.v) !== null ? ' (its own run took ' + wallOf(x.v) + ' s against the ' + TRIAL_MAX_MINUTES + ' minute bound, and no smaller form of ' + (script || 'it') + ' is registered)' : '')),
      }));
      continue;
    }
    report.undecidable.push(x.file);
    lines.push(lineOf({
      id: 'unreadable:' + x.file, kind: 'unreadable bar', subsystem: place.subsystem, verdictFile, benchCommand: x.v.command ?? null,
      trial: null, files: script ? [script] : [], since: x.v.at ?? null,
      why: c.why + '; the fill is a top-level boolean barMet written by ' + (script || 'its bench'),
    }));
  }
  // (b) a partial whose bar never landed: no <stem>.json and no bar for any dash prefix of it
  for (const x of verdicts) {
    if (!x.partial) continue;
    const base = x.stem.slice(0, -'-partial'.length);
    if (allStems.has(base)) continue;
    const parts = base.split('-');
    let family = null;
    for (let k = parts.length - 1; k >= 1 && !family; k--) { const p = parts.slice(0, k).join('-'); if (barStems.has(p)) family = p; }
    if (family) continue;
    report.partialOnly.push(x.file);
    const v = x.v || {};
    const script = scriptOf(v.command);
    const place = placeOf(root, entries, [script]);
    lines.push(lineOf({
      id: 'never:' + x.file, kind: 'bar never completed', subsystem: place.subsystem, verdictFile: vdRel + '/' + x.file, benchCommand: v.command ?? null,
      trial: null, files: place.files, since: v.at ?? null,
      why: 'no ' + base + '.json and no bar file for any prefix of it' + (typeof v.notTheBarBecause === 'string' ? '; the partial says: ' + v.notTheBarBecause.slice(0, 200) : '') + '; the fill is the whole bar run, which has no bounded form',
    }));
  }
  return { lines, report };
}

/** (c) The ladder's blocks with a number beside a bar, from ladder.json fields only. */
export function ladderGaps({ root = ROOT, ladder, file = 'bench/verdicts/ladder.json', entries = [], forms = LADDER_FORMS } = {}) {
  const lines = [], rungs = [];
  if (!ladder || typeof ladder !== 'object') return { lines, rungs };
  const b = ladder.board && typeof ladder.board === 'object' ? ladder.board : {};
  const common = { verdictFile: file, benchCommand: ladder.command ?? null, since: ladder.at ?? null };
  const push = (id, formId, o) => {
    const trial = forms[formId] ? trialOf(forms[formId]) : null;
    const place = placeOf(root, entries, [trial ? trial.bench : null, scriptOf(ladder.command)]);
    lines.push(lineOf({ ...common, id: 'ladder:' + id, kind: 'ladder', subsystem: place.subsystem, files: place.files, trial, ...o, why: (o.why || '') + (trial ? '' : '; no bounded form is registered for this block') }));
  };
  const frac = (s) => { const m = typeof s === 'string' && s.match(/^(\d+)\/(\d+)$/); return m && Number(m[2]) > 0 ? r6(Number(m[1]) / Number(m[2])) : null; };
  for (const s of Array.isArray(b.sets) ? b.sets : []) {
    if (!s || typeof s !== 'object' || !s.key) continue;
    if (notMeasured(s.status)) { rungs.push({ rung: 'sets.' + s.key, read: 'status not measured', gap: false }); continue; }
    const bars = s.bars && typeof s.bars === 'object' ? s.bars : {};
    for (const name of ['alone', 'null']) {
      const r = bars[name];
      if (!r || typeof r !== 'object' || typeof r.verdict !== 'string') continue;
      if (/^beats/i.test(r.verdict) || /^absent/i.test(r.verdict) || notMeasured(r.verdict)) continue;
      const measured = frac(r.organism), bar = frac(r.other);
      if (measured === null || bar === null) continue;
      push('sets.' + s.key + '.' + name, 'sets.' + s.key, { measured, bar, unit: 'share correct (organism against ' + name + ')', better: 'higher', why: 'board.sets[' + s.key + '].bars.' + name + ' reads "' + r.verdict + '": the bar is to beat it with intervals apart, so a point above it with overlapping intervals is still a gap and its fill is items, not score' });
    }
    for (const name of ['row405', 'frontier', 'orchestrator']) {
      const r = bars[name];
      if (!r || typeof r !== 'object') continue;
      const measured = num(r.pct), bar = num(r.score);
      if (measured === null || bar === null || notMeasured(r.pct)) continue;
      if (measured >= bar && r.side !== 'below') continue;
      push('sets.' + s.key + '.' + name, 'sets.' + s.key, { measured, bar, unit: 'percent', better: 'higher', why: 'board.sets[' + s.key + '].bars.' + name + ': ' + (r.system || 'the published row') + ' at ' + bar + ', the organism at ' + measured + ' (' + (r.side || 'side unread') + ')' });
    }
    rungs.push({ rung: 'sets.' + s.key, read: 'bars ' + Object.keys(bars).join(', '), gap: lines.some((l) => l.id.startsWith('ladder:sets.' + s.key + '.')) });
  }
  const imp = b.improvement, his = b.hisRate;
  if (imp && his) {
    const measured = num(imp.percentPerSecond) ?? (num(imp.carried) !== null ? r6(imp.carried * 100) : null);
    const bar = num(his.percentPerSecond);
    if (measured !== null && bar !== null && !notMeasured(imp.percentPerSecond) && measured < bar) {
      push('improvement', 'improvement', { measured, bar, unit: 'percent per wall second (carried)', better: 'higher', why: 'board.improvement against board.hisRate ("' + (his.words || '') + '")' });
    }
    rungs.push({ rung: 'improvement', read: measured === null ? 'not measured' : measured + ' against ' + bar, gap: measured !== null && bar !== null && measured < bar });
  } else rungs.push({ rung: 'improvement', read: 'absent from ladder.json', gap: false });
  const tg = ladder.target;
  if (tg && typeof tg === 'object' && tg.met === false) {
    const measured = num(ladder.lastDelta), bar = num(tg.low);
    if (measured !== null && bar !== null) push('target', 'target', { measured, bar, unit: 'percent (the daily delta)', better: 'higher', why: 'ladder.json target {low ' + tg.low + ', high ' + tg.high + '} with lastDelta ' + measured });
    rungs.push({ rung: 'target', read: 'lastDelta ' + ladder.lastDelta + ' against low ' + tg.low, gap: measured !== null && bar !== null });
  } else rungs.push({ rung: 'target', read: tg ? 'met ' + tg.met : 'absent from ladder.json', gap: false });
  const mult = b.multiplying && b.multiplying.bar;
  if (mult && typeof mult === 'object') {
    if (mult.met === false) push('multiplying', 'multiplying', { measured: num(mult.populationFresh), bar: num(mult.freshT), unit: 'fresh solves', better: 'higher', why: 'board.multiplying.bar.met is false' });
    rungs.push({ rung: 'multiplying', read: 'bar.met ' + mult.met, gap: mult.met === false });
  } else rungs.push({ rung: 'multiplying', read: 'absent from ladder.json', gap: false });
  const bpp = b.bytesPerPoint;
  if (bpp && bpp.bar && bpp.last) {
    const bar = num(bpp.bar.bytesPerScorePoint), measured = num(bpp.last.bytesPerScorePoint);
    if (bar !== null && measured !== null && measured > bar) push('bytesPerPoint', 'bytesPerPoint', { measured, bar, unit: 'bytes per score point', better: 'lower', why: 'board.bytesPerPoint.last above its bar' });
    rungs.push({ rung: 'bytesPerPoint', read: measured === null ? 'no last number' : measured + ' against ' + bar, gap: bar !== null && measured !== null && measured > bar });
  } else rungs.push({ rung: 'bytesPerPoint', read: 'absent from ladder.json', gap: false });
  const ks = b.knowledge && Array.isArray(b.knowledge.sources) ? b.knowledge.sources : null;
  if (ks) {
    for (const k of ks) {
      if (!k || notMeasured(k.status)) { rungs.push({ rung: 'knowledge.' + (k && k.name), read: 'not measured', gap: false }); continue; }
      const p = k.primary || {};
      const measured = num(p.recall1), bar = num(p.null1);
      if (measured !== null && bar !== null && measured <= bar) push('knowledge.' + k.name, 'knowledge', { measured, bar, unit: 'recall@1', better: 'higher', why: 'board.knowledge ' + k.name + ' recall@1 not above its null' });
      rungs.push({ rung: 'knowledge.' + k.name, read: measured === null ? 'no recall number' : 'recall@1 ' + measured + ' against null ' + bar, gap: measured !== null && bar !== null && measured <= bar });
    }
  } else rungs.push({ rung: 'knowledge', read: 'absent from ladder.json', gap: false });
  rungs.push({ rung: 'authored', read: b.authored ? 'share ' + b.authored.share + ', no bar number in the block (authorship.json carries the bar)' : 'absent from ladder.json', gap: false });
  for (const absent of ['plateau', 'years', 'load-bearing', 'venue', 'compress ratio']) rungs.push({ rung: absent, read: 'absent from ladder.json', gap: false });
  return { lines, rungs };
}

/** (d) Gate rows: a failed test file or a row not ok is red; a file at 15000 ms or more is slow. */
export function gateGaps({ root = ROOT, gate, file = 'bench/verdicts/gate.json', entries = [], slowMs = GATE_SLOW_MS } = {}) {
  const lines = [];
  if (!gate || typeof gate !== 'object') return lines;
  const common = { verdictFile: file, benchCommand: gate.command ?? null, since: gate.at ?? null };
  for (const t of Array.isArray(gate.tests) ? gate.tests : []) {
    if (!t || typeof t.file !== 'string') continue;
    const red = (typeof t.exit === 'number' && t.exit !== 0) || (typeof t.fail === 'number' && t.fail > 0) || (t.budget && t.budget.outcome && t.budget.outcome !== 'exit');
    const trial = testTrial(t.file, t.ms);
    const place = placeOf(root, entries, [t.file]);
    if (red) lines.push(lineOf({ ...common, id: 'gate-red:' + t.file, kind: 'gate red', subsystem: place.subsystem, files: place.files, trial, measured: num(t.fail), bar: 0, unit: 'failing tests', better: 'lower', why: 'exit ' + t.exit + ', ' + t.fail + ' failing of ' + t.total + (t.budget && t.budget.outcome !== 'exit' ? ', budget ' + t.budget.outcome : '') }));
    if (num(t.ms) !== null && t.ms >= slowMs) lines.push(lineOf({ ...common, id: 'gate-slow:' + t.file, kind: 'gate slow', subsystem: place.subsystem, files: place.files, trial, measured: t.ms, bar: slowMs, unit: 'ms', better: 'lower', why: t.file + ' took ' + t.ms + ' ms in the gate' }));
  }
  const rows = gate.rows && typeof gate.rows === 'object' ? gate.rows : {};
  const s13 = entries.find((e) => e.section === 13);
  for (const [name, row] of Object.entries(rows)) {
    if (!row || row.ok !== false) continue;
    lines.push(lineOf({ ...common, id: 'gate-red:row:' + name, kind: 'gate red', subsystem: s13 ? s13.name : 'unmapped', trial: rowTrial(name), files: [], why: 'row ' + name + ' is not ok: ' + String(row.line || '').slice(0, 200) + '; the row is computed over the whole gate run, which has no bounded form' }));
  }
  for (const [key, label] of [['badImports', 'an import that points nowhere'], ['emDash', 'an em dash']]) {
    const list = Array.isArray(gate[key]) ? gate[key] : [];
    if (!list.length) continue;
    lines.push(lineOf({ ...common, id: 'gate-red:' + key, kind: 'gate red', subsystem: s13 ? s13.name : 'unmapped', trial: null, files: [], measured: list.length, bar: 0, unit: 'findings', better: 'lower', why: list.length + ' x ' + label + '; the scan runs inside the whole gate' }));
  }
  return lines;
}

/** (e) OPEN lines through self/autopilot.mjs notesCandidates, one gap each. */
export async function openGaps({ root = ROOT, entries = [] } = {}) {
  const { notesCandidates } = await import(pathToFileURL(path.join(HERE, 'autopilot.mjs')).href);
  const r = notesCandidates({ root, max: Infinity });
  const lines = [];
  const mt = {};
  for (const c of r.candidates) {
    const note = c.where.replace(/:\d+$/, '');
    if (!(note in mt)) { try { mt[note] = statSync(path.join(root, note)).mtime.toISOString(); } catch { mt[note] = null; } }
    const h = createHash('sha1').update(c.openLine).digest('hex').slice(0, 10);
    const place = placeOf(root, entries, [c.test, c.file]);
    lines.push(lineOf({
      id: 'open:' + note + '#' + h, kind: 'open', subsystem: place.subsystem, files: c.file ? [c.file] : [], since: mt[note], trial: null,
      why: c.where + ' (' + c.grammar + '): ' + c.why.slice(0, 300) + '; judged by the autopilot\'s fix evidence, not by a bench',
    }));
  }
  return { lines, read: r.read, files: r.files, open: r.open };
}

/** (f) The dead share of every emitted seed above 0, through bench/gate.mjs's census pick. */
export async function deadShareGaps({ root = ROOT, verdictsDir = path.join(root, 'bench', 'verdicts') } = {}) {
  const gate = await import(pathToFileURL(path.join(ROOT, 'bench', 'gate.mjs')).href);
  const seeds = gate.emittedSeeds(root);
  const records = gate.censusRecords(verdictsDir);
  const lines = [], per = [];
  const cmdCache = {};
  const cmdOf = (f) => { if (!(f in cmdCache)) cmdCache[f] = (readJson(path.join(verdictsDir, f)).v || {}).command ?? null; return cmdCache[f]; };
  for (const s of seeds) {
    const c = gate.censusFor(s, records);
    const share = c.pick ? r6(1 - c.pick.loadBearing / c.pick.loaded) : null;
    per.push({ seed: s.seed, share, file: c.pick ? c.pick.file : null });
    if (share === 0) continue;
    const trial = CENSUS_NONE[s.seed] ? null : censusTrial(s.seed);
    lines.push(lineOf({
      id: 'dead:' + s.seed, kind: 'dead share', subsystem: 'unmapped', measured: share, bar: 0, unit: 'share of loaded lines that never ran', better: 'lower',
      verdictFile: c.pick ? relOf(root, path.join(verdictsDir, c.pick.file)) : null, benchCommand: c.pick ? cmdOf(c.pick.file) : null,
      trial, files: [s.seed], since: c.pick ? c.pick.at : s.changedAt,
      why: (c.pick ? 'census ' + c.pick.file + ' (' + (c.pick.mode || 'dynamic') + ', ' + c.pick.loaded + ' lines loaded, ' + c.pick.loadBearing + ' load bearing); the gate caps it at ' + gate.DEAD_SHARE_CAP + ' and MANUAL P8 asks for 0' : 'no counted census of this seed as it is now (' + c.records + ' records, ' + c.stale.length + ' stale)')
        + (CENSUS_NONE[s.seed] ? '; no bounded form: ' + CENSUS_NONE[s.seed] : ''),
    }));
  }
  return { lines, per, cap: gate.DEAD_SHARE_CAP };
}

// ------------------------------------------------------------------ the ledger
/**
 * Every gap, from the six sources. Pure over the files it reads.
 * @returns {Promise<{lines: object[], report: object}>}
 */
export async function buildLedger({ root = ROOT, verdictsDir = path.join(root, 'bench', 'verdicts'), measures = MEASURES, verdictForms = VERDICT_FORMS, ladderForms = LADDER_FORMS, notes = true, census = true } = {}) {
  const entries = readArchitecture(root);
  const verdicts = readVerdicts(verdictsDir);
  const a = verdictGaps({ root, verdictsDir, verdicts, entries, measures, forms: verdictForms });
  const vdRel = relOf(root, verdictsDir);
  const ladder = verdicts.find((x) => x.file === 'ladder.json');
  const c = ladderGaps({ root, ladder: ladder ? ladder.v : null, file: vdRel + '/ladder.json', entries, forms: ladderForms });
  const gate = verdicts.find((x) => x.file === 'gate.json');
  const d = gateGaps({ root, gate: gate ? gate.v : null, file: vdRel + '/gate.json', entries });
  const e = notes ? await openGaps({ root, entries }) : { lines: [], read: false, files: 0, open: 0 };
  const f = census ? await deadShareGaps({ root, verdictsDir }) : { lines: [], per: [], cap: null };
  const order = (l) => KINDS.indexOf(l.kind);
  const lines = [...a.lines, ...c.lines, ...d, ...e.lines, ...f.lines].sort((x, y) => (order(x) - order(y)) || byStr(x.id, y.id));
  const seen = new Set();
  for (const l of lines) { if (seen.has(l.id)) throw new Error('two gaps share the id ' + l.id); seen.add(l.id); }
  return {
    lines,
    report: {
      verdicts: { read: verdicts.length, ...a.report },
      ladder: { read: !!ladder, rungs: c.rungs },
      gate: { read: !!gate, at: gate && gate.v ? gate.v.at : null },
      notes: { read: e.read, files: e.files, open: e.open },
      census: { seeds: f.per.length, per: f.per, cap: f.cap },
      architecture: { entries: entries.length },
    },
  };
}

/** Counts a reader needs: by kind, with and without a trial, the required kinds without one. */
export function summarize(lines) {
  const byKind = Object.fromEntries(KINDS.map((k) => [k, 0]));
  for (const l of lines) byKind[l.kind] = (byKind[l.kind] || 0) + 1;
  const withTrial = lines.filter((l) => l.trial).length;
  const requiredWithoutTrial = lines.filter((l) => REQUIRED_KINDS.includes(l.kind) && !l.trial).map((l) => l.id);
  return { total: lines.length, byKind, withTrial, withoutTrial: lines.length - withTrial, requiredWithoutTrial };
}

const dateOf = (ms) => new Date(ms).toISOString().slice(0, 10);

/**
 * Rewrite state/self/gaps.jsonl whole. The file it replaces becomes gaps-<its date>.jsonl (a
 * second run on one day replaces that day's file); dated files past the newest `keep` are removed.
 */
export function writeLedger(lines, { root = ROOT, keep = KEEP_DATED, boards = true } = {}) {
  // The board-item kind (board 15 builder): the board-item lines handed in are replaced by a fresh
  // scan of docs/boards under this root; a scan that throws keeps the handed-in ones and says why.
  let boardItems = null;
  if (boards) {
    const b = boardItemGaps({ root });
    const handed = lines.filter((l) => l && l.kind === BOARD_ITEM_KIND);
    boardItems = b.error ? { lines: handed.length, error: b.error, kept: true } : { lines: b.lines.length, error: null, kept: false, boards: b.report.boards, parseErrors: b.report.errors };
    lines = [...lines.filter((l) => !(l && l.kind === BOARD_ITEM_KIND)), ...(b.error ? handed : b.lines)];
  }
  const file = path.join(root, LEDGER_REL);
  const dir = path.dirname(file);
  mkdirSync(dir, { recursive: true });
  let previous = null;
  if (existsSync(file)) {
    previous = 'gaps-' + dateOf(statSync(file).mtimeMs) + '.jsonl';
    renameSync(file, path.join(dir, previous));
  }
  const tmp = file + '.' + process.pid + '.tmp';
  writeFileSync(tmp, lines.map((l) => JSON.stringify(l)).join('\n') + (lines.length ? '\n' : ''));
  renameSync(tmp, file);
  const dated = readdirSync(dir).filter((n) => DATED_RE.test(n)).sort().reverse();
  const removed = [];
  for (const n of dated.slice(keep)) { rmSync(path.join(dir, n), { force: true }); removed.push(n); }
  return { file: relOf(root, file), lines: lines.length, previous, kept: dated.slice(0, keep).sort(), removed, boardItems };
}

/**
 * The board-item lines of this root (self/boards.mjs): one per undone item of every board, smallest
 * owned set first. Never throws: a failure comes back as error with no lines.
 */
export function boardItemGaps({ root = ROOT } = {}) {
  try {
    const { lines, scan } = boardItemLines({ root });
    return { lines, error: null, report: { boards: scan.totals.boards, items: scan.totals.items, done: scan.totals.done, undone: scan.totals.undone, errors: scan.errors } };
  } catch (e) {
    return { lines: [], error: 'self/boards.mjs threw: ' + String((e && e.message) || e).split('\n')[0], report: null };
  }
}

/** Rewrite the ledger with the board items refreshed and every other line kept as it is on disk. */
export function writeBoardItems({ root = ROOT, keep = KEEP_DATED } = {}) {
  const { lines, bad } = readLedger(root);
  return { ...writeLedger(lines, { root, keep }), unreadableLinesDropped: bad };
}

/** The ledger on disk, one object per line (an unreadable line is skipped and counted). */
export function readLedger(root = ROOT) {
  let text; try { text = readFileSync(path.join(root, LEDGER_REL), 'utf8'); } catch { return { lines: [], bad: 0, found: false }; }
  const lines = []; let bad = 0;
  for (const l of text.split(/\r?\n/)) { if (!l.trim()) continue; try { lines.push(JSON.parse(l)); } catch { bad++; } }
  return { lines, bad, found: true };
}

// ------------------------------------------------------------------ CLI
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const { lines, report } = await buildLedger();
  const s = summarize(lines);
  if (argv.includes('--dry')) {
    process.stdout.write(JSON.stringify({ total: s.total, byKind: s.byKind, withTrial: s.withTrial, withoutTrial: s.withoutTrial, requiredWithoutTrial: s.requiredWithoutTrial.length, undecidable: report.verdicts.undecidable.length }) + '\n');
  } else {
    const w = writeLedger(lines);
    if (argv.includes('--json')) for (const l of lines) process.stdout.write(JSON.stringify(l) + '\n');
    process.stdout.write('gaps ' + s.total + ': ' + KINDS.map((k) => k + ' ' + s.byKind[k]).join(', ') + '\n');
    process.stdout.write('with a trial ' + s.withTrial + ', without ' + s.withoutTrial + '; required kinds without a trial: ' + (s.requiredWithoutTrial.join(', ') || 'none') + '\n');
    process.stdout.write('wrote ' + w.file + (w.previous ? ' (the previous file kept as ' + w.previous + ')' : '') + (w.removed.length ? '; removed ' + w.removed.join(', ') : '') + '\n');
    if (w.boardItems) process.stdout.write('board items ' + w.boardItems.lines + ' appended by the writer (self/boards.mjs)' + (w.boardItems.error ? ': the scan failed, the previous board-item lines kept: ' + w.boardItems.error : '') + '\n');
  }
}
