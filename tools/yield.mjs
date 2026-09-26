// tools/yield.mjs: THE LOOP'S YIELD, READ FROM ITS OWN VERDICTS (queue item 7, the CLOUD part).
// Author: board 20 builder (board 21, item yield), 2026-09-26.
//
// His words (docs/CLOUD-SESSION.md, item 7): "the kept-per-hour line and the organism-years line on
// the site, read from the verdict, so the loop's yield is visible without a terminal." This file is
// the reader: the findings page (web/yield.mjs) and the site bar (bench/yield-site.mjs) print what
// it reads, and it prints the same lines on a terminal.
//
// WHAT IT READS, under bench/verdicts (or --dir):
//   autopilot.json and autopilot-*.json   the autopilot bench. Its loop pass on the real tree is
//                                         realTree (a --dry run: it writes nothing), so a row reads
//                                         realTree.counts and realTree.ms.
//   soak.json                             the newest soak verdict (self-code --auto --soak N).
//   soak-history.jsonl                    every soak verdict soak.json replaced, one per line
//                                         under "previous".
//   autopilot/*.jsonl                     the loop's ledger: one record per candidate, grouped
//                                         here by runId (a run's kept, candidates, model calls).
//
// KEPT PER HOUR is kept divided by the wall the verdict itself records (soak.elapsedMs for a soak,
// realTree.ms for the dry pass), never by a clock: nothing here calls Date.now(). A ledger run has
// no wall of its own; it borrows the wall of the soak verdict with the same runId when one exists,
// and prints "no wall recorded" when none does. A zero is printed as 0.
//
// THE SUMMARY. The newest verdict (the largest "at" of the verdict files) and its kept per hour;
// then a window: the last 7 days before the newest verdict if the verdicts cover 7 days, else the
// whole span they cover. Over the window: kept per loop hour (the soak verdicts, one per runId, the
// newest grading of a run wins, kept over their summed walls) and kept per hour of the window
// (every run on record, soak verdicts and ledger runs without one, over the window's hours). The dry
// passes are listed and not summed: a --dry run writes nothing by construction.
//
// Run: node tools/yield.mjs [--dir bench/verdicts] [--json]
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERDICTS_DIR = path.join(ROOT, 'bench', 'verdicts');
export const NO_VERDICT = 'no autopilot verdict on this host';
export const HOUR_MS = 3600000;
export const DAY_MS = 86400000;
export const WINDOW_DAYS = 7;

/** Round to 4 places for printing; -0 prints as 0. */
export function r4(x) {
  if (x == null || !Number.isFinite(x)) return null;
  const n = Math.round(x * 1e4) / 1e4;
  return Object.is(n, -0) ? 0 : n;
}

const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const readJson = (file) => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; } };
const isDir = (p) => { try { return statSync(p).isDirectory(); } catch { return false; } };

/** Resolve a dotted path (a.b.0.c) in an object; undefined when absent. */
export function atPath(obj, p) {
  let o = obj;
  for (const k of p.split('.')) {
    if (o == null || typeof o !== 'object') return undefined;
    o = o[k];
  }
  return o;
}

/** The verdict files this reader opens, relative to dir, in a fixed order. */
export function verdictFiles(dir) {
  if (!isDir(dir)) return { json: [], history: null, ledgers: [] };
  const names = readdirSync(dir);
  const json = names.filter((n) => n === 'autopilot.json' || /^autopilot-.+\.json$/.test(n)).sort();
  if (names.includes('soak.json')) json.push('soak.json');
  const history = names.includes('soak-history.jsonl') ? 'soak-history.jsonl' : null;
  const ldir = path.join(dir, 'autopilot');
  const ledgers = isDir(ldir) ? readdirSync(ldir).filter((n) => n.endsWith('.jsonl')).sort().map((n) => 'autopilot/' + n) : [];
  return { json, history, ledgers };
}

function withRate(row) {
  row.wallHours = row.wallMs != null && row.wallMs > 0 ? r4(row.wallMs / HOUR_MS) : null;
  row.keptPerHour = row.kept != null && row.wallMs != null && row.wallMs > 0 ? r4(row.kept * HOUR_MS / row.wallMs) : null;
  return row;
}

/** The kept per hour a soak verdict printed in its own MAGNITUDE line, a second reading. */
export function magnitudeRate(j) {
  const m = /=\s*([\d.]+)\s*kept\/hour/.exec(typeof j?.magnitude === 'string' ? j.magnitude : '');
  return m ? Number(m[1]) : null;
}

/** One row of a soak verdict (soak.json or a soak-history.jsonl line). */
function soakRow(j, file, line, base) {
  const P = base ? base + '.' : '';
  const s = j.soak || {};
  const cfg = s.cfg || {};
  const author = typeof cfg.authorOn === 'boolean' ? cfg.authorOn : (/--author on/.test(j.command || '') ? true : /--author off/.test(j.command || '') ? false : null);
  return withRate({
    kind: 'soak', file, line, id: line ? file + ':' + line : file,
    at: j.at ?? null, startedAt: s.startedAt ?? null, runId: s.runId ?? null, command: j.command ?? null,
    mode: 'soak, author ' + (author == null ? 'not recorded' : author ? 'on' : 'off') + (cfg.dry ? ', dry' : ''),
    dry: cfg.dry === true,
    kept: num(j.totals?.kept), candidates: num(j.totals?.attempts),
    modelCalls: num(j.modelCalls?.made), answered: num(j.modelCalls?.answered), meanSeconds: num(j.modelCalls?.meanSeconds),
    wallMs: num(s.elapsedMs), wallFrom: file + (line ? ':' + line : '') + ' soak.elapsedMs',
    magnitudeKeptPerHour: magnitudeRate(j),
    src: {
      at: P + 'at', runId: P + 'soak.runId', command: P + 'command', kept: P + 'totals.kept', candidates: P + 'totals.attempts',
      modelCalls: P + 'modelCalls.made', answered: P + 'modelCalls.answered', meanSeconds: P + 'modelCalls.meanSeconds', wallMs: P + 'soak.elapsedMs',
    },
  });
}

/** One row of an autopilot bench verdict: its loop pass on the real tree. */
function autopilotRow(j, file) {
  const rt = j.realTree || {};
  const c = rt.counts || {};
  const ms = [];
  for (const s of Object.values(rt.bySource || {})) if (Array.isArray(s?.modelMs)) ms.push(...s.modelMs.filter((x) => typeof x === 'number'));
  return withRate({
    kind: 'autopilot', file, line: null, id: file,
    at: j.at ?? null, startedAt: null, runId: null, command: rt.command ?? null,
    mode: 'real-tree pass' + (rt.dry === true ? ', dry' : ''), dry: rt.dry === true,
    kept: num(c.kept), candidates: num(c.candidates), modelCalls: num(c.modelCalls), answered: null,
    meanSeconds: ms.length ? r4(ms.reduce((a, b) => a + b, 0) / ms.length / 1000) : null,
    wallMs: num(rt.ms), wallFrom: file + ' realTree.ms', magnitudeKeptPerHour: null,
    src: { at: 'at', command: 'realTree.command', kept: 'realTree.counts.kept', candidates: 'realTree.counts.candidates', modelCalls: 'realTree.counts.modelCalls', wallMs: 'realTree.ms' },
  });
}

/** The ledger grouped by runId. */
export function ledgerRuns(dir, files) {
  const runs = new Map();
  for (const f of files) {
    let text;
    try { text = readFileSync(path.join(dir, f), 'utf8'); } catch { continue; }
    for (const l of text.split('\n')) {
      if (!l.trim()) continue;
      let r;
      try { r = JSON.parse(l); } catch { continue; }
      if (!r || typeof r.runId !== 'string') continue;
      let g = runs.get(r.runId);
      if (!g) runs.set(r.runId, g = { runId: r.runId, files: [], records: 0, kept: 0, candidates: 0, modelCalls: 0, modelMs: [], firstAt: null, lastAt: null });
      if (!g.files.includes(f)) g.files.push(f);
      g.records++;
      if (r.decision === 'kept') g.kept++;
      if (r.candidate === true) g.candidates++;
      if (r.model && typeof r.model === 'object') {
        if (typeof r.model.calls === 'number') g.modelCalls += r.model.calls;
        if (Array.isArray(r.model.ms)) g.modelMs.push(...r.model.ms.filter((x) => typeof x === 'number'));
      }
      if (typeof r.at === 'string') {
        if (g.firstAt == null || r.at < g.firstAt) g.firstAt = r.at;
        if (g.lastAt == null || r.at > g.lastAt) g.lastAt = r.at;
      }
    }
  }
  return [...runs.values()].sort((a, b) => (a.firstAt || '').localeCompare(b.firstAt || '') || a.runId.localeCompare(b.runId));
}

/**
 * Read every verdict and return { dir, rows, ledger, summary, message }.
 * rows: the verdict files (autopilot, soak, soak-history lines), ordered by at.
 * ledger: the ledger runs, each with the soak verdict it borrows a wall from (or none).
 */
export function readYield(opts = {}) {
  const dir = opts.dir || VERDICTS_DIR;
  const vf = verdictFiles(dir);
  const rows = [];
  for (const f of vf.json) {
    const j = readJson(path.join(dir, f));
    if (!j || typeof j !== 'object') continue;
    rows.push(f === 'soak.json' ? soakRow(j, f, null, '') : autopilotRow(j, f));
  }
  if (vf.history) {
    const lines = readFileSync(path.join(dir, vf.history), 'utf8').split('\n');
    lines.forEach((l, i) => {
      if (!l.trim()) return;
      let e;
      try { e = JSON.parse(l); } catch { return; }
      if (e && e.previous && typeof e.previous === 'object') rows.push(soakRow(e.previous, vf.history, i + 1, 'previous'));
    });
  }
  rows.sort((a, b) => (a.at || '').localeCompare(b.at || '') || a.id.localeCompare(b.id));

  // the newest grading of a run wins; an older verdict of the same runId is superseded
  const byRun = new Map();
  for (const r of rows) if (r.kind === 'soak' && r.runId) {
    const w = byRun.get(r.runId);
    if (!w || (r.at || '') >= (w.at || '')) byRun.set(r.runId, r);
  }
  for (const r of rows) if (r.kind === 'soak' && r.runId) {
    const w = byRun.get(r.runId);
    r.superseded = w !== r;
    r.supersededBy = w !== r ? w.id : null;
  }

  const ledger = ledgerRuns(dir, vf.ledgers).map((g) => {
    const v = byRun.get(g.runId) || null;
    return withRate({
      kind: 'ledger', id: g.files.join('+') + ' run ' + g.runId, files: g.files, runId: g.runId, at: g.lastAt, startedAt: g.firstAt,
      records: g.records, kept: g.kept, candidates: g.candidates, modelCalls: g.modelCalls,
      meanSeconds: g.modelMs.length ? r4(g.modelMs.reduce((a, b) => a + b, 0) / g.modelMs.length / 1000) : null,
      wallMs: v ? v.wallMs : null, wallFrom: v ? v.wallFrom : null, verdict: v ? v.id : null,
    });
  });

  if (!rows.length && !ledger.length) return { dir, rows, ledger, summary: null, message: NO_VERDICT };
  return { dir, rows, ledger, summary: summarize(rows, ledger), message: null };
}

/** The summary: the newest verdict, then the 7 day window or the span the verdicts cover. */
export function summarize(rows, ledger) {
  const dated = rows.filter((r) => r.at);
  const newest = dated.length ? dated.reduce((a, b) => ((b.at > a.at) ? b : a)) : null;
  const starts = [...rows, ...ledger].map((r) => r.startedAt || r.at).filter(Boolean);
  const ends = [...rows, ...ledger].map((r) => r.at).filter(Boolean);
  const spanStart = starts.length ? starts.reduce((a, b) => (b < a ? b : a)) : null;
  const spanEnd = newest ? newest.at : (ends.length ? ends.reduce((a, b) => (b > a ? b : a)) : null);
  const spanMs = spanStart && spanEnd ? Date.parse(spanEnd) - Date.parse(spanStart) : null;
  const spanDays = spanMs != null ? r4(spanMs / DAY_MS) : null;
  const seven = spanMs != null && spanMs >= WINDOW_DAYS * DAY_MS;
  const windowStart = seven ? new Date(Date.parse(spanEnd) - WINDOW_DAYS * DAY_MS).toISOString() : spanStart;
  const windowMs = seven ? WINDOW_DAYS * DAY_MS : spanMs;
  const inWindow = (r) => r.at && windowStart && r.at >= windowStart && r.at <= spanEnd;

  const soaks = rows.filter((r) => r.kind === 'soak' && !r.superseded && !r.dry && inWindow(r));
  const summed = soaks.filter((r) => r.kept != null && r.wallMs != null && r.wallMs > 0);
  const keptSum = summed.reduce((a, r) => a + r.kept, 0);
  const wallMsSum = summed.reduce((a, r) => a + r.wallMs, 0);
  const soakRuns = new Set(rows.filter((r) => r.kind === 'soak' && r.runId).map((r) => r.runId));
  const ledgerOnly = ledger.filter((g) => !soakRuns.has(g.runId) && inWindow(g));
  const allKept = keptSum + ledgerOnly.reduce((a, g) => a + g.kept, 0);
  const allRuns = summed.length + ledgerOnly.length;
  const dry = rows.filter((r) => r.dry);
  return {
    newest: newest ? { id: newest.id, file: newest.file, line: newest.line, kind: newest.kind, at: newest.at, kept: newest.kept, candidates: newest.candidates, wallMs: newest.wallMs, wallHours: newest.wallHours, keptPerHour: newest.keptPerHour, mode: newest.mode } : null,
    spanStart, spanEnd, spanDays, sevenDays: seven, windowStart, windowDays: windowMs != null ? r4(windowMs / DAY_MS) : null,
    windowHours: windowMs != null ? r4(windowMs / HOUR_MS) : null,
    soakRuns: summed.length, keptSum, wallMsSum, wallHoursSum: summed.length ? r4(wallMsSum / HOUR_MS) : null,
    keptPerLoopHour: wallMsSum > 0 ? r4(keptSum * HOUR_MS / wallMsSum) : null,
    summedIds: summed.map((r) => r.id),
    ledgerOnlyRuns: ledgerOnly.length, ledgerOnlyKept: ledgerOnly.reduce((a, g) => a + g.kept, 0),
    allRuns, allKept, keptPerWindowHour: windowMs > 0 ? r4(allKept * HOUR_MS / windowMs) : null,
    dryRows: dry.length, dryKept: dry.reduce((a, r) => a + (r.kept || 0), 0),
  };
}

const show = (x, unit) => (x == null ? 'not recorded' : String(x) + (unit || ''));

/** One printed line per verdict row. */
export function rowLine(r) {
  const wall = r.wallMs == null ? 'no wall recorded' : 'wall ' + r.wallMs + ' ms = ' + show(r.wallHours) + ' h';
  const kph = r.keptPerHour == null ? 'kept per hour not recorded (no wall)' : 'kept per hour ' + r.keptPerHour;
  const model = 'model calls ' + show(r.modelCalls) + (r.answered != null ? ' (' + r.answered + ' answered)' : '') + ', mean ' + (r.meanSeconds == null ? 'none' : r.meanSeconds + ' s');
  const head = r.kind === 'ledger'
    ? 'yield ledger ' + r.id + ' ' + r.startedAt + ' to ' + r.at + ': ' + r.records + ' records'
    : 'yield ' + r.id + ' at ' + show(r.at) + ': ' + r.mode + (r.runId ? ', run ' + r.runId : '') + (r.superseded ? ', superseded by ' + r.supersededBy : '');
  const tail = r.kind === 'ledger' ? (r.verdict ? ' (wall of ' + r.verdict + ')' : '') : '';
  return head + ': kept ' + show(r.kept) + ' of ' + show(r.candidates) + ' candidates, ' + model + ', ' + wall + tail + ', ' + kph;
}

/** The summary lines. */
export function summaryLines(s) {
  if (!s) return [];
  const out = [];
  const n = s.newest;
  if (n) out.push('yield NEWEST ' + n.id + ' at ' + n.at + ' (' + n.mode + '): kept ' + show(n.kept) + ' in ' + show(n.wallHours) + ' wall hours = '
    + (n.keptPerHour == null ? 'not recorded' : n.keptPerHour) + ' kept per hour');
  const w = s.sevenDays
    ? 'the last 7 days, ' + s.windowStart + ' to ' + s.spanEnd + ' (the verdicts cover ' + s.spanDays + ' days)'
    : 'the span the verdicts cover, ' + s.spanStart + ' to ' + s.spanEnd + ' = ' + show(s.spanDays) + ' days (under 7)';
  out.push('yield WINDOW ' + w + ': ' + s.keptSum + ' kept in ' + s.soakRuns + ' soak runs over ' + show(s.wallHoursSum) + ' loop wall hours = '
    + (s.keptPerLoopHour == null ? 'not recorded' : s.keptPerLoopHour) + ' kept per loop hour; ' + s.allKept + ' kept in ' + s.allRuns
    + ' runs on record (' + s.ledgerOnlyRuns + ' ledger runs without a soak verdict) over ' + show(s.windowHours) + ' hours = '
    + (s.keptPerWindowHour == null ? 'not recorded' : s.keptPerWindowHour) + ' kept per hour of the window; ' + s.dryRows + ' dry passes listed, not summed');
  return out;
}

/** Every line the CLI prints. */
export function yieldLines(y) {
  if (y.message) return [y.message];
  return [...y.rows.map(rowLine), ...y.ledger.map(rowLine), ...summaryLines(y.summary)];
}

if (process.argv[1] && process.argv[1].endsWith(path.join('tools', 'yield.mjs'))) {
  const a = process.argv.slice(2);
  const i = a.indexOf('--dir');
  const dir = i >= 0 ? path.resolve(a[i + 1]) : VERDICTS_DIR;
  const y = readYield({ dir });
  if (a.includes('--json')) console.log(JSON.stringify(y, null, 2));
  else for (const l of yieldLines(y)) console.log(l);
}
