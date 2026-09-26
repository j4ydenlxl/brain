// bench/boards.mjs: THE BOARDS BAR (Board 15, item boards). Author: board 15 builder. MODEL OFF:
// nothing here opens a socket, and the self-code runs it launches are --dry (they write nothing and
// call no model).
//
// What it measures, in order:
//   1. THE SCAN. self/boards.mjs reads every docs/boards/board-N.js and docs/boards/proposed/*.md
//      without running them, REPEATS times: microseconds per scan (min, median, max) and whether the
//      undone set is the same every time (the run-to-run noise of the reader).
//   2. PER BOARD, the items done and undone, each undone one with its reason, its verdict file and
//      whether a trial command was found (renderScan of self/boards.mjs).
//   3. THE MUST-LIST: Board 13's eight items undone, Board 12 enwiki undone, and every Board 14 item
//      whose verdict says barMet false undone; each printed with its verdict file and its trial.
//   4. THE LEDGER. self/gaps.mjs writeBoardItems rewrites state/self/gaps.jsonl, every other line
//      kept as it is on disk and the board items refreshed; the board-item lines read back from disk
//      afterwards are the lines printed.
//   5. THE SOURCE. node bin/brain.mjs self-code --auto --dry --json, run DRY_RUNS times (its noise),
//      and the CONTROL: the same command with --sources set to SOURCE_ORDER, the boards source off.
//   6. HELD OUT: every earlier committed revision of docs/boards/board-N.js (git show, read only),
//      none of which was read while the parser was written: does each parse clean, how many items.
//
// THE BAR (bench/verdicts/boards.json, isTheBar true): every undone item of boards 10 to 14 is a
// ledger line carrying its whole brief and the verdict file the item names (null only where the
// item names none, and those are listed by name), the must-list holds, and every dry run lists every
// one of them under source boards while the control lists none.
//
//   node --max-old-space-size=6000 bench/boards.mjs            the bar: bench/verdicts/boards.json
//   node --max-old-space-size=6000 bench/boards.mjs --no-dry   scan and ledger only: boards-partial.json
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanBoards, renderScan, parseBoardScript, BOARD_ITEM_KIND, AUTHOR } from '../self/boards.mjs';
import { writeBoardItems, readLedger, LEDGER_REL } from '../self/gaps.mjs';
import { SOURCE_ORDER, BOARDS_SOURCE } from '../self/autopilot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const REPEATS = 5;
export const DRY_RUNS = 2;
export const FROM = 10;
export const TO = 14;
export const MUST_13 = Object.freeze(['plateau', 'clock', 'math', 'code', 'direct', 'live', 'exit', 'rows']);
export const DRY_WALL_MS = 30 * 60_000;
const HEAP = '--max-old-space-size=6000';
const r2 = (x) => Math.round(x * 100) / 100;
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : null; };
const say = (l = '') => process.stdout.write(l + '\n');
const firstLine = (e) => String((e && e.message) || e).split('\n')[0];

/** The scan, REPEATS times: microseconds per scan and the undone id sets. */
export function timedScans(root = ROOT, repeats = REPEATS) {
  const runs = [];
  let last = null;
  for (let i = 0; i < repeats; i++) {
    const t0 = process.hrtime.bigint();
    const s = scanBoards({ root });
    const us = Number(process.hrtime.bigint() - t0) / 1000;
    runs.push({ us: r2(us), undone: s.boards.flatMap((b) => b.items.filter((x) => !x.done).map((x) => x.id)).sort() });
    last = s;
  }
  const key = (r) => r.undone.join('|');
  const differing = runs.filter((r) => key(r) !== key(runs[0])).length;
  const us = runs.map((r) => r.us);
  const warm = us.slice(1);
  return { scan: last, runs: runs.length, us, coldUs: us[0], minUs: Math.min(...warm), medianUs: r2(median(warm)), maxUs: Math.max(...warm), differing };
}

/** The must-list of the bar, from one scan. */
export function mustList(s) {
  const item = (board, key) => { const b = s.boards.find((x) => x.board === board); return b ? b.items.find((x) => x.key === key) || null : null; };
  const rows = [];
  for (const k of MUST_13) rows.push({ need: 'board 13 ' + k + ' undone', id: 'board-13:' + k, it: item(13, k) });
  rows.push({ need: 'board 12 enwiki undone', id: 'board-12:enwiki', it: item(12, 'enwiki') });
  const b14 = s.boards.find((x) => x.board === 14);
  const falses = b14 ? b14.items.filter((x) => x.verdict && x.verdict.exists && x.verdict.barMet === false) : [];
  for (const it of falses) rows.push({ need: 'board 14 ' + it.key + ' (its verdict says barMet false) undone', id: it.id, it });
  return {
    rows: rows.map((r) => ({ need: r.need, id: r.id, found: !!r.it, undone: r.it ? !r.it.done : null, state: r.it ? r.it.state : null, verdictFile: r.it ? r.it.bar.verdictFile : null, trial: r.it ? r.it.bar.trial : null, trialHint: r.it ? r.it.bar.trialHint ?? null : null, ok: !!r.it && !r.it.done })),
    board14BarMetFalse: falses.map((x) => x.id),
  };
}

/** The dry self-code run, parsed: the boards source line and every boards decision. */
export function dryRun(root = ROOT, { sources = null } = {}) {
  const args = [HEAP, 'bin/brain.mjs', 'self-code', '--auto', '--dry', '--json', ...(sources ? ['--sources', sources.join(',')] : [])];
  const t0 = Date.now();
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8', timeout: DRY_WALL_MS, windowsHide: true, maxBuffer: 512 * 1024 * 1024 });
  const seconds = r2((Date.now() - t0) / 1000);
  const command = 'node ' + args.join(' ');
  const out = String(r.stdout || '');
  let j = null;
  try { j = JSON.parse(out); } catch {
    const at = out.lastIndexOf('\n{');
    try { j = JSON.parse(at >= 0 ? out.slice(at + 1) : out.slice(out.indexOf('{'))); } catch { j = null; }
  }
  if (!j) return { ok: false, command, seconds, exit: r.status, reason: 'no JSON on stdout (exit ' + r.status + (r.error ? ', ' + r.error.code : '') + '): ' + (String(r.stderr || '').trim().split(/\r?\n/).pop() || '') };
  const decisions = Array.isArray(j.decisions) ? j.decisions : [];
  const boards = decisions.filter((d) => d.source === BOARDS_SOURCE);
  const byDecision = {};
  for (const d of boards) byDecision[d.decision] = (byDecision[d.decision] || 0) + 1;
  const src = j.sources && j.sources[BOARDS_SOURCE] ? j.sources[BOARDS_SOURCE] : null;
  return {
    ok: true, command, seconds, exit: r.status, candidates: j.counts ? j.counts.candidates : decisions.length, decisions: decisions.length,
    sourceKeys: Object.keys(j.sources || {}), boardsSource: src, boardsKeys: boards.map((d) => d.key), boardsDecisions: byDecision,
    otherCandidates: decisions.length - boards.length, sample: boards[0] ? { key: boards[0].key, decision: boards[0].decision, wall: boards[0].wall ?? null, reason: String(boards[0].reason || '').slice(0, 240) } : null,
  };
}

/** Every earlier committed revision of every board script, parsed (git show: read only). */
export function heldOut(root = ROOT) {
  const out = [];
  const names = scanBoards({ root }).boards.filter((b) => b.kind === 'script').map((b) => b.file);
  for (const rel of names) {
    const log = spawnSync('git', ['log', '--format=%h', '--', rel], { cwd: root, encoding: 'utf8', windowsHide: true });
    if (log.status !== 0) continue;
    let now = null;
    try { now = readFileSync(path.join(root, ...rel.split('/')), 'utf8'); } catch { now = null; }
    for (const h of String(log.stdout).split(/\r?\n/).filter(Boolean)) {
      const show = spawnSync('git', ['show', h + ':' + rel], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
      if (show.status !== 0) continue;
      const text = String(show.stdout);
      if (now !== null && text.replace(/\r\n/g, '\n') === now.replace(/\r\n/g, '\n')) continue; // the working file: development
      const p = parseBoardScript(text, { file: rel + '@' + h });
      out.push({ rev: h, file: rel, ok: p.ok, items: p.items.length, keys: p.items.map((x) => x.key), errors: p.errors.map((e) => (e.container || '-') + ': ' + e.reason) });
    }
  }
  return { revisions: out.length, parsedClean: out.filter((x) => x.ok).length, items: out.reduce((t, x) => t + x.items, 0), withNoItems: out.filter((x) => !x.items).map((x) => x.file + '@' + x.rev), failed: out.filter((x) => !x.ok).map((x) => ({ at: x.file + '@' + x.rev, errors: x.errors.slice(0, 3) })), rows: out };
}

function writeVerdict(root, name, v) {
  const f = path.join(root, 'bench', 'verdicts', name);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, JSON.stringify(v, null, 2) + '\n');
  return path.relative(root, f).replaceAll('\\', '/');
}

export function main(argv = process.argv.slice(2), root = ROOT) {
  const t0 = Date.now();
  const noDry = argv.includes('--no-dry');
  const command = 'node ' + HEAP + ' bench/boards.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  say('BOARDS BAR (' + AUTHOR + '), model off; ' + new Date().toISOString());

  // 1. the scan, and its noise
  const T = timedScans(root);
  const s = T.scan;
  say('');
  say('1. SCAN x' + T.runs + ': ' + s.totals.boards + ' boards (' + s.totals.parsedOk + ' parse clean), ' + s.totals.items + ' items, done ' + s.totals.done + ', undone ' + s.totals.undone + ', parse errors ' + s.totals.errors);
  say('   us per scan: cold (the first, every verdict JSON parsed) ' + T.coldUs + '; warm (parse and verdict caches hit, every file still read or stat-ed) min ' + T.minUs + ', median ' + T.medianUs + ', max ' + T.maxUs + ' (all: ' + T.us.join(', ') + '); per item warm ' + r2(T.medianUs / Math.max(1, s.totals.items)) + ' us, cold ' + r2(T.coldUs / Math.max(1, s.totals.items)) + ' us');
  say('   undone set identical across the ' + T.runs + ' scans: ' + (T.differing === 0 ? 'yes' : 'NO, ' + T.differing + ' differ'));

  // 2. per board
  say('');
  say('2. PER BOARD (done and undone, each undone with its reason, verdict file, trial)');
  for (const l of renderScan(s).split('\n')) say('   ' + l);

  // 3. the must-list
  const M = mustList(s);
  say('');
  say('3. MUST-LIST (' + M.rows.length + ' rows; board 14 items whose verdict says barMet false: ' + (M.board14BarMetFalse.join(', ') || 'none') + ')');
  for (const r of M.rows) say('   ' + (r.ok ? 'ok     ' : 'FAILED ') + r.id.padEnd(18) + ' ' + (r.found ? (r.undone ? 'undone [' + r.state + ']' : 'DONE') : 'NOT FOUND') + ' | verdict ' + (r.verdictFile || 'none') + ' | trial ' + (r.trial ? 'found: ' + r.trial : 'none found' + (r.trialHint ? ' (hint ' + r.trialHint + ')' : '')));
  const mustOk = M.rows.every((r) => r.ok);

  // 4. the ledger
  const w = writeBoardItems({ root });
  const L = readLedger(root);
  const bl = L.lines.filter((l) => l && l.kind === BOARD_ITEM_KIND);
  say('');
  say('4. LEDGER ' + w.file + ': ' + w.lines + ' lines written, ' + bl.length + ' of kind "' + BOARD_ITEM_KIND + '" read back' + (w.boardItems && w.boardItems.error ? '; SCAN ERROR ' + w.boardItems.error : '') + (w.previous ? '; previous kept as ' + w.previous : '') + (w.unreadableLinesDropped ? '; ' + w.unreadableLinesDropped + ' unreadable line(s) dropped' : ''));
  for (const l of bl) say('   ' + String(l.id).padEnd(22) + ' verdict ' + (l.verdictFile || 'none (the item names none)') + ' | trial ' + (l.trial || 'none') + ' | brief ' + String(l.brief || '').length + ' chars | files ' + (Array.isArray(l.files) ? l.files.length : 0) + ' | needsModel ' + l.needsModel + ' | minutes ' + l.minutes);
  const required = s.boards.filter((b) => b.board !== null && b.board >= FROM && b.board <= TO).flatMap((b) => b.items.filter((x) => !x.done));
  const byId = new Map(bl.map((l) => [l.id, l]));
  const ledgerRows = required.map((it) => {
    const l = byId.get(it.id);
    const why = !l ? 'no ledger line' : l.brief !== it.task ? 'the brief differs from the task' : !('verdictFile' in l) ? 'no verdictFile field' : l.verdictFile !== it.bar.verdictFile ? 'verdictFile ' + l.verdictFile + ' is not the item\'s ' + it.bar.verdictFile : null;
    return { id: it.id, ok: !why, why, verdictFile: l ? l.verdictFile : null, trial: l ? l.trial : null };
  });
  const ledgerOk = ledgerRows.every((r) => r.ok);
  const noVerdictNamed = required.filter((it) => !it.bar.verdictFile).map((it) => it.id);
  say('   boards ' + FROM + ' to ' + TO + ': ' + required.length + ' undone items, ' + ledgerRows.filter((r) => r.ok).length + ' in the ledger with their whole brief and the verdict file they name' + (noVerdictNamed.length ? ' (' + noVerdictNamed.length + ' name no verdict file: ' + noVerdictNamed.join(', ') + ')' : ''));
  for (const r of ledgerRows.filter((x) => !x.ok)) say('   MISSING ' + r.id + ': ' + r.why);

  // 5. the source, its noise, and the control
  let dry = [], control = null, sourceOk = false;
  if (!noDry) {
    say('');
    say('5. SOURCE: node bin/brain.mjs self-code --auto --dry --json, ' + DRY_RUNS + ' runs, then the control with the boards source off');
    for (let i = 0; i < DRY_RUNS; i++) {
      const d = dryRun(root);
      dry.push(d);
      if (!d.ok) { say('   run ' + (i + 1) + ' FAILED: ' + d.reason); continue; }
      const missing = required.filter((it) => !d.boardsKeys.includes('boards:' + it.id)).map((it) => it.id);
      d.missing = missing;
      say('   run ' + (i + 1) + ': exit ' + d.exit + ', ' + d.seconds + ' s, ' + d.candidates + ' candidates, sources [' + d.sourceKeys.join(', ') + ']; boards decisions ' + d.boardsKeys.length + ' ' + JSON.stringify(d.boardsDecisions) + ', other sources ' + d.otherCandidates + '; required listed ' + (required.length - missing.length) + ' of ' + required.length + (missing.length ? ', MISSING ' + missing.join(', ') : ''));
      if (i === 0) {
        say('   SOURCE LINE "boards": ' + JSON.stringify(d.boardsSource));
        if (d.sample) say('   first boards decision: ' + JSON.stringify(d.sample));
      }
    }
    control = dryRun(root, { sources: [...SOURCE_ORDER] });
    if (control.ok) say('   CONTROL (--sources ' + SOURCE_ORDER.join(',') + '): exit ' + control.exit + ', ' + control.seconds + ' s, ' + control.candidates + ' candidates, sources [' + control.sourceKeys.join(', ') + ']; boards decisions ' + control.boardsKeys.length + ', other sources ' + control.otherCandidates);
    else say('   CONTROL FAILED: ' + control.reason);
    const others = dry.filter((d) => d.ok).map((d) => d.otherCandidates);
    say('   run-to-run: boards decisions ' + dry.filter((d) => d.ok).map((d) => d.boardsKeys.length).join(' / ') + ', other sources ' + others.join(' / ') + (control.ok ? ', control other sources ' + control.otherCandidates : '') + ' (the live tree moves between runs; the boards count is the scan\'s)');
    sourceOk = dry.length === DRY_RUNS && dry.every((d) => d.ok && d.missing.length === 0) && control.ok && control.boardsKeys.length === 0;
  }

  // 6. held out
  const H = heldOut(root);
  say('');
  say('6. HELD OUT: ' + H.revisions + ' earlier committed revisions of the board scripts (git show, read only), ' + H.parsedClean + ' parse clean, ' + H.items + ' items' + (H.withNoItems.length ? '; with no items: ' + H.withNoItems.join(', ') : ''));
  for (const f of H.failed) say('   DOES NOT PARSE ' + f.at + ': ' + f.errors.join(' | '));

  const barMet = mustOk && ledgerOk && sourceOk && T.differing === 0;
  const seconds = r2((Date.now() - t0) / 1000);
  const rssMb = Math.round(process.resourceUsage().maxRSS / 1024);
  const partial = noDry;
  const d0 = dry.find((d) => d.ok) || null;
  const statement = partial
    ? 'A partial run (--no-dry): the scan, the must-list and the ledger were measured, the self-code source was not, so this is not the bar.'
    : 'The reader parsed ' + s.totals.boards + ' board files (' + s.totals.parsedOk + ' clean) into ' + s.totals.items + ' items, ' + s.totals.undone + ' undone, in ' + T.coldUs + ' us cold and a warm median of ' + T.medianUs + ' us over ' + (T.runs - 1) + ' more scans, with ' + T.differing + ' differing undone sets. '
      + 'Boards ' + FROM + ' to ' + TO + ' hold ' + required.length + ' undone items; ' + ledgerRows.filter((r) => r.ok).length + ' are ledger lines with their whole brief and the verdict file they name'
      + (noVerdictNamed.length ? ' (' + noVerdictNamed.join(' and ') + ' name no verdict file in their BAR or owns list, so their line carries verdictFile null and the reason)' : '') + '. '
      + 'The must-list (' + M.rows.length + ' rows) ' + (mustOk ? 'holds' : 'FAILS') + '. '
      + (d0 ? 'The dry self-code run listed ' + d0.boardsKeys.length + ' boards candidates (' + JSON.stringify(d0.boardsDecisions) + ') in each of ' + dry.length + ' runs where required items missing were ' + dry.map((d) => (d.ok ? d.missing.length : 'failed')).join(' and ') + '; the control with the boards source off listed ' + (control && control.ok ? control.boardsKeys.length : 'no run') + '. ' : 'The dry self-code run failed. ')
      + 'Held out: ' + H.parsedClean + ' of ' + H.revisions + ' earlier committed board revisions parse clean. Bar ' + (barMet ? 'MET' : 'MISSED') + '.';
  const verdict = {
    at: new Date().toISOString(), command, node: process.version, isTheBar: !partial, barMet: partial ? false : barMet, author: AUTHOR, modelCalls: 0, seconds, peakRssMbSelf: rssMb,
    split: {
      development: 'the working copies of docs/boards/board-10.js to board-15.js and the planted boards 90 and 91 of test/boards-plant.mjs: the parser and the done rule were written against them',
      heldOut: 'every earlier committed revision of each board script (git show), none read while the parser was written: ' + H.parsedClean + ' of ' + H.revisions + ' parse clean, ' + H.items + ' items',
    },
    statement,
    scan: { runs: T.runs, us: T.us, coldUs: T.coldUs, warmMinUs: T.minUs, warmMedianUs: T.medianUs, warmMaxUs: T.maxUs, differing: T.differing, totals: s.totals },
    boards: s.boards.map((b) => ({ board: b.board, file: b.file, launched: b.launched, marker: b.marker, done: b.done, undone: b.undone, ok: b.ok, items: b.items.map((x) => ({ key: x.key, done: x.done, state: x.state, reason: x.reason, verdictFile: x.bar.verdictFile, trial: x.bar.trial, trialHint: x.bar.trialHint ?? null, files: x.files.length, needsModel: x.needsModel })) })),
    must: { ok: mustOk, rows: M.rows, board14BarMetFalse: M.board14BarMetFalse },
    ledger: { ok: ledgerOk, file: LEDGER_REL, lines: w.lines, boardItemLines: bl.length, required: required.length, noVerdictNamed, missing: ledgerRows.filter((r) => !r.ok) },
    source: noDry ? null : { ok: sourceOk, runs: dry.map(({ boardsKeys, ...d }) => ({ ...d, boardsCount: boardsKeys ? boardsKeys.length : null })), control: control ? (({ boardsKeys, ...c }) => ({ ...c, boardsCount: boardsKeys ? boardsKeys.length : null }))(control) : null },
    heldOut: { revisions: H.revisions, parsedClean: H.parsedClean, items: H.items, withNoItems: H.withNoItems, failed: H.failed },
  };
  const file = writeVerdict(root, partial ? 'boards-partial.json' : 'boards.json', verdict);
  say('');
  say('VERDICT ' + file + ': isTheBar ' + verdict.isTheBar + ', barMet ' + verdict.barMet + '; ' + seconds + ' s; peak RSS of this process ' + rssMb + ' MB; model calls 0');
  return verdict;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try { const v = main(); process.exitCode = v.isTheBar && v.barMet ? 0 : 1; }
  catch (e) {
    const f = writeVerdict(ROOT, 'boards-partial.json', { at: new Date().toISOString(), command: 'node ' + HEAP + ' bench/boards.mjs', node: process.version, isTheBar: false, barMet: false, author: AUTHOR, split: null, statement: 'The bench threw before the bar was measured: ' + firstLine(e) });
    say('THREW: ' + firstLine(e) + '; wrote ' + f);
    process.exitCode = 2;
  }
}
