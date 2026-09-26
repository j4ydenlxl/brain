// bench/gaps.mjs: THE GAP BAR. Writes the gap ledger (self/gaps.mjs), then RUNS every trial with
// needsModel false once, sequentially, one process at a time, each through tools/budget.mjs, and
// records per trial: ran, seconds, the metric its registered parser read, or the failure's first
// line. A trial that needs a model is proved by its dry form when one exists (a documented flag
// that opens no socket), else recorded as unproved by name. Author: board 14 builder. MODEL OFF.
//
// THE BAR (bench/verdicts/gaps.json, isTheBar true): every gap of kinds missed, ladder, gate red
// and gate slow carries a trial command, and every model-free trial printed its metric in ONE run
// whose trials took under 10 minutes of wall clock in all.
//
// A COPY TRIAL runs in a fresh copy of the tree under the OS temp dir: real bytes, no links (a
// copy of the 719 files costs 0.34 s, the same as hard links, and shares no inode with the tree).
// It EXCLUDES organism/ (except the one seed the trial needs), state/, bench/fixtures/ (except
// the one fixture set the trial reads), web/dist/ and .git/. trader.db is copied beside it only for
// the venue trial, whose bench reads it read only. The trial's own output files are removed from
// the copy before it starts, so a metric is never read from a stale file, and its budget watches
// the whole copy. The copy is deleted when the trial ends; the deletion is verified and the MB
// left on the temp volume printed. A TREE TRIAL reads only (a test file, --no-write, --status).
//
// CONTROLS printed with the run: the ledger built twice (identical ids, or how many differ, since
// the tree is live), each trial's metric beside the number the ledger recorded for its gap, the
// real tree's copy of every file a copy trial writes checked unchanged, and the fastest copy trial
// run a second time for run-to-run noise (outside the bar's 10 minutes, said so).
//
// THE NUMBER BESIDE THE BAR (board 17 builder (the organism's item)): the bar above is one share.
// Of the gap lines it covers (self/gaps.mjs barLines: every line of the four required kinds, and
// every line carrying a model-free trial), the share that meet it: the line carries a trial, and a
// model-free trial printed its metric in this run before the trials' wall clock passed 10
// minutes (barShare). The rule is "every", so the bar is a share of exactly 1 (SHARE_BAR), and
// barMet is bar.share >= bar.shareBar and nothing else: a trial that failed, a required gap with no
// trial, or a metric printed past the bound each leaves one covered line short. Why this number
// and not recall on a planted tree: this header's bar is about trials that run, and the planted
// trees of test/gaps.test.mjs already hold recall exact. self/gaps.mjs MEASURES registers
// bar.share beside bar.shareBar, so the ledger's own line for a missed gaps.json carries a number
// and a distance. The control printed with every run: the ledger's reading of the gaps.json on
// disk before the run beside its reading of the one this run wrote.
//
//   node --max-old-space-size=6000 bench/gaps.mjs              the bar: bench/verdicts/gaps.json
//   node --max-old-space-size=6000 bench/gaps.mjs --only K     the trial keyed K (else every key holding K): gaps-partial.json
//   node --max-old-space-size=6000 bench/gaps.mjs --no-trials  the ledger only: gaps-partial.json
//   --wait-free-ram-mb N   each trial waits for N MB free instead of FREE_RAM_MB (16384), for a host
//                          with less RAM than the rule assumes (bench/gate.mjs has the same flag);
//                          the value is printed and written to the verdict (board 17 builder (the organism's item))
//   --trial-ram-mb N       each trial's working-set cap instead of its ledger's (6000 MB), so on a host where this
//                          whole run sits under one smaller budget a heavy trial is killed and recorded alone, not
//                          the run; printed and written to the verdict (board 17 builder (the organism's item))
import { readdirSync, readFileSync, statSync, existsSync, mkdirSync, mkdtempSync, rmSync, copyFileSync, writeFileSync, statfsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { budget } from '../tools/budget.mjs';
import { buildLedger, writeLedger, summarize, PARSERS, REQUIRED_KINDS, KINDS, AUTHOR, TRIAL_MAX_MINUTES, barLines, measureOf, classifyBar, RAM_MB } from '../self/gaps.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const COPY_EXCLUDE = Object.freeze(['organism', 'state', 'bench/fixtures', 'web/dist', '.git']);
export const BAR_WALL_S = TRIAL_MAX_MINUTES * 60;
export const FREE_RAM_MB = 16384;
const MB = 1024 * 1024;
const r2 = (x) => Math.round(x * 100) / 100;
const r3 = (x) => Math.round(x * 1000) / 1000;
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);

function dirBytes(dir) {
  let bytes = 0, entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    try { bytes += e.isDirectory() ? dirBytes(p) : statSync(p).size; } catch { /* removed while we looked */ }
  }
  return bytes;
}

/** Free MB on the volume holding dir. */
export function freeDiskMb(dir = os.tmpdir()) {
  try { const s = statfsSync(dir); return Math.round((s.bavail * s.bsize) / MB); } catch { return null; }
}

function copyDir(src, dst, rel, skip, count) {
  mkdirSync(dst, { recursive: true });
  for (const e of readdirSync(src, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (skip(r, e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d, r, skip, count);
    else if (e.isFile()) { copyFileSync(s, d); count.files++; count.bytes += statSync(s).size; }
  }
}

/**
 * A fresh copy of the tree for one trial under base: base/<tree name> holds the tree minus
 * COPY_EXCLUDE, plus the trial's seed and fixture dirs; base/trader/data/trader.db when it reads one.
 */
export function makeCopy(root, base, trial) {
  const t0 = Date.now();
  const brain = path.join(base, path.basename(root));
  const count = { files: 0, bytes: 0 };
  copyDir(root, brain, '', (r, name) => COPY_EXCLUDE.includes(r) || name === 'node_modules', count);
  for (const extra of [trial.seed, ...(trial.fixtures || [])].filter(Boolean)) {
    const src = path.join(root, extra);
    if (!existsSync(src)) throw new Error('the trial needs ' + extra + ', which is not in the tree');
    if (statSync(src).isFile()) {
      mkdirSync(path.dirname(path.join(brain, extra)), { recursive: true });
      copyFileSync(src, path.join(brain, extra)); count.files++; count.bytes += statSync(src).size;
    } else copyDir(src, path.join(brain, extra), extra, (r, name) => name === 'node_modules', count);
  }
  if (trial.trader) {
    const db = path.resolve(root, '..', 'trader', 'data', 'trader.db');
    if (existsSync(db)) {
      const to = path.join(base, 'trader', 'data');
      mkdirSync(to, { recursive: true });
      copyFileSync(db, path.join(to, 'trader.db')); count.files++; count.bytes += statSync(db).size;
      const wal = db + '-wal';
      if (existsSync(wal) && statSync(wal).size > 0) { copyFileSync(wal, path.join(to, 'trader.db-wal')); count.files++; count.bytes += statSync(wal).size; }
    }
  }
  return { brain, files: count.files, mb: r2(count.bytes / MB), ms: Date.now() - t0 };
}

function stateOf(root, rels) {
  return rels.map((w) => { const p = path.join(root, w); try { const s = statSync(p); return { w, exists: true, mtimeMs: s.mtimeMs, size: s.size }; } catch { return { w, exists: false }; } });
}
const sameState = (a, b) => a.exists === b.exists && (!a.exists || (a.mtimeMs === b.mtimeMs && a.size === b.size));

/** Wait until the machine has freeMb free (the BUDGETS rule), at most maxS. Returns seconds waited, or null when it never came. */
export async function waitFreeRam(freeMb, maxS = 1800, log = () => {}) {
  if (!freeMb) return 0;
  const t0 = Date.now();
  let said = 0;
  while (os.freemem() / MB < freeMb) {
    if (Date.now() - t0 > maxS * 1000) return null;
    if (Date.now() - said > 30_000) { log('waiting: free RAM ' + Math.round(os.freemem() / MB) + ' MB under ' + freeMb + ' MB'); said = Date.now(); }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return r2((Date.now() - t0) / 1000);
}

const ERR_LINE = /\b(Error|error|ERR_|failed|FAIL|refused|not ok|Cannot|cannot|threw|Unhandled)\b/;
function firstErrorLine(err, out) {
  const lines = (s) => String(s || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const e = lines(err);
  return (e.find((l) => ERR_LINE.test(l)) || e[0] || lines(out).find((l) => ERR_LINE.test(l)) || lines(out).pop() || '').slice(0, 300);
}

/** Read a trial's metric with its registered parser, from its output file (fresh only) or stdout. */
export function readMetric(trial, { cwd, stdout, startMs }) {
  const p = PARSERS[trial.parser];
  if (!p) return { metric: null, name: null, from: null, why: 'no parser registered for ' + trial.key };
  if (p.stdout) return { metric: p.read(stdout), name: p.name, from: 'stdout', why: null };
  const rel = p.file(trial);
  const f = path.join(cwd, rel);
  let st; try { st = statSync(f); } catch { return { metric: null, name: p.name, from: rel, why: rel + ' was not written' }; }
  if (st.mtimeMs < startMs - 2000) return { metric: null, name: p.name, from: rel, why: rel + ' predates the trial' };
  let v; try { v = JSON.parse(readFileSync(f, 'utf8')); } catch (e) { return { metric: null, name: p.name, from: rel, why: rel + ' is not JSON: ' + e.message }; }
  return { metric: p.read(v), name: p.name, from: rel, why: null };
}

/**
 * Run one trial once. opts.dry runs trial.dry.argv instead (the socket-free proof of a model trial).
 * Test-file trials go through bench/gate.mjs runTestFile, so they are measured as the gate measures them.
 * @returns {Promise<object>} ran, completed, seconds, metric, printedMetric, failed, firstLine, ...
 */
export async function runTrial(trial, { root = ROOT, tmpRoot = os.tmpdir(), freeRamMb = FREE_RAM_MB, waitMaxS = 1800, dry = false, log = () => {}, ramMb = null } = {}) {
  const run = {
    key: trial.key, dry, where: trial.where, ran: false, completed: false, outcome: null, exitCode: null, seconds: null, waitedS: null,
    metric: null, metricName: null, metricFrom: null, printedMetric: false, failed: false, firstLine: null, peakRssMb: null,
    copy: null, copyGone: null, realWritesUnchanged: null,
  };
  const minutes = trial.minutes;
  run.waitedS = await waitFreeRam(freeRamMb, waitMaxS, log);
  if (run.waitedS === null) { run.failed = true; run.outcome = 'refused'; run.firstLine = 'free RAM stayed under ' + freeRamMb + ' MB for ' + waitMaxS + ' s'; return run; }

  if (trial.runner === 'test' && !dry) {
    const gate = await import(pathToFileURL(path.join(HERE, 'gate.mjs')).href);
    const caps = { ...gate.GATE_CAPS, timeoutMs: Math.round(minutes * 60_000), waitFreeRamMb: null, ...(ramMb ? { ramMb } : {}) };
    const file = trial.argv[trial.argv.length - 1];
    const { row, out } = await gate.runTestFile(file, { root, caps });
    const b = row.budget || {};
    run.ran = b.outcome !== 'refused' && b.outcome !== 'error';
    run.completed = b.outcome === 'exit';
    run.outcome = b.outcome; run.exitCode = row.exit; run.seconds = r3(row.ms / 1000); run.samples = b.samples ?? 0; run.peakRssMb = run.samples && num(b.peakRssMb) > 0 ? num(b.peakRssMb) : null;
    run.metricName = PARSERS.test.name; run.metricFrom = 'the node --test summary';
    run.metric = row.total !== null ? row.ms : null;
    run.pass = row.pass; run.fail = row.fail; run.total = row.total;
    run.printedMetric = run.completed && row.exit === 0 && run.metric !== null;
    run.failed = !run.printedMetric;
    if (run.failed) {
      run.firstLine = b.outcome === 'aborted' ? 'killed at its ' + minutes + ' minute bound' : b.outcome !== 'exit' ? 'budget ' + b.outcome + ': ' + (b.error || b.killed || '') : row.fail ? row.fail + ' failing of ' + row.total + ': ' + firstErrorLine('', out.split(/\r?\n/).filter((l) => /^\s*not ok|Error/.test(l)).join('\n')) : 'exit ' + row.exit + ': ' + firstErrorLine(out, '');
    }
    return run;
  }

  const argv = dry ? trial.dry.argv : trial.argv;
  const writes = dry ? [] : (trial.writes || []);
  const base = mkdtempSync(path.join(tmpRoot, 'gaps-'));
  const tmp = path.join(base, 'tmp');
  const before = trial.where === 'copy' ? stateOf(root, writes) : [];
  let stdout = '', stderr = '';
  const budgetLines = [];
  let timer = null;
  try {
    mkdirSync(tmp, { recursive: true });
    let cwd = root;
    if (trial.where === 'copy') {
      const c = makeCopy(root, base, trial);
      cwd = c.brain;
      run.copy = { files: c.files, mb: c.mb, ms: c.ms };
      for (const w of writes) rmSync(path.join(cwd, w), { recursive: true, force: true });
      if (trial.parser === 'census') rmSync(path.join(cwd, PARSERS.census.file(trial)), { force: true });
    }
    const baseMb = dirBytes(base) / MB;
    const env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT')), TEMP: tmp, TMP: tmp, TMPDIR: tmp };
    const args = argv.map((a) => a.replaceAll('{tmp}', tmp).replaceAll('{copy}', base));
    const ac = new AbortController();
    const startMs = Date.now();
    const rec = await budget('node', args, {
      ramMb: ramMb || trial.ramMb, diskMb: Math.ceil(baseMb) + trial.diskMb, dir: base, intervalMs: 1000, statusMs: 3_600_000,
      record: false, cwd, stdio: ['ignore', 'pipe', 'pipe'], env, signal: ac.signal,
      log: (line) => { budgetLines.push(line); },
      onSpawn: (child) => {
        // the bound starts at the spawn, so a wait for RAM or a slow copy never eats it
        timer = setTimeout(() => ac.abort(), Math.round(minutes * 60_000));
        child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
        child.stdout.on('data', (d) => { if (stdout.length < 16 * MB) stdout += d; });
        child.stderr.on('data', (d) => { if (stderr.length < 4 * MB) stderr += d; });
      },
    });
    run.ran = rec.pid !== null && rec.outcome !== 'refused';
    run.completed = rec.outcome === 'exit';
    run.outcome = rec.outcome; run.exitCode = rec.exitCode; run.seconds = r3(rec.wallS); run.samples = rec.samples ?? 0; run.peakRssMb = run.samples && num(rec.peakRssMb) > 0 ? num(rec.peakRssMb) : null;
    if (dry) {
      run.metricName = 'exit 0 of ' + trial.dry.flag; run.metricFrom = 'exit code';
      run.metric = run.completed && rec.exitCode === 0 ? 1 : null;
    } else if (run.completed && rec.exitCode === 0) {
      const m = readMetric(trial, { cwd, stdout, startMs });
      run.metric = num(m.metric); run.metricName = m.name; run.metricFrom = m.from;
      if (run.metric === null) run.firstLine = 'exit 0 and no ' + (m.name || 'metric') + ': ' + (m.why || 'the parser read nothing from ' + m.from);
    }
    run.printedMetric = run.completed && rec.exitCode === 0 && run.metric !== null;
    run.failed = !run.printedMetric;
    if (run.failed && !run.firstLine) {
      if (rec.outcome === 'aborted') run.firstLine = 'killed at its ' + minutes + ' minute bound after ' + r2(rec.wallS) + ' s';
      else if (rec.outcome === 'killed') run.firstLine = (budgetLines.find((l) => /BUDGET KILLED/.test(l)) || 'killed by the budget').slice(0, 300);
      else if (rec.outcome !== 'exit') run.firstLine = 'budget ' + rec.outcome + ': ' + (rec.error || '');
      else run.firstLine = 'exit ' + rec.exitCode + ': ' + firstErrorLine(stderr, stdout);
    }
  } catch (e) {
    run.failed = true;
    run.firstLine = 'the trial could not start: ' + String((e && e.message) || e).split('\n')[0];
  } finally {
    if (timer) clearTimeout(timer);
    try { rmSync(base, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch { /* measured below */ }
    run.copyGone = !existsSync(base);
    if (trial.where === 'copy') {
      const after = stateOf(root, writes);
      const moved = before.filter((b, i) => !sameState(b, after[i])).map((b) => b.w);
      run.realWritesUnchanged = moved.length === 0;
      if (moved.length) run.realWritesMoved = moved;
    }
  }
  return run;
}

// ------------------------------------------------------------------ the number (board 17 builder (the organism's item))
/** The header's rule is "every": the bar is a share of exactly 1. */
export const SHARE_BAR = 1;

/**
 * THE NUMBER BESIDE THE BAR. Of the gap lines the bar covers (self/gaps.mjs barLines; for a narrow
 * run, keys: the lines whose trial key was selected), the share that meet it: the line carries a
 * trial, and that trial either needs a model (the header asks such a line only to carry its
 * command) or printed its metric in this run with the trials' wall clock (run.endS, measured from
 * the first trial's start) still under wallS at its end. share is null when no model-free trial
 * ran: nothing was measured. trialShare is the half a run without trials sees (lines carrying one).
 * @returns {{share: number|null, covered: number, meeting: number, carrying: number, trialShare: number|null, notMeeting: {id: string, why: string}[]}}
 */
export function barShare(lines, runs, { wallS = BAR_WALL_S, keys = null } = {}) {
  const byKey = new Map(runs.map((r) => [r.key, r]));
  const covered = keys ? lines.filter((l) => l.trial && keys.has(l.trial.key)) : barLines(lines);
  const notMeeting = [];
  let meeting = 0;
  for (const l of covered) {
    const r = l.trial ? byKey.get(l.trial.key) : null;
    let why = null;
    if (!l.trial) why = 'no trial';
    else if (l.trial.needsModel) why = null;
    else if (!r) why = 'its trial ' + l.trial.key + ' did not run';
    else if (!r.printedMetric) why = 'its trial ' + l.trial.key + ' failed: ' + (r.firstLine || r.outcome);
    else if (!(num(r.endS) !== null && r.endS < wallS)) why = 'its trial ' + l.trial.key + ' printed at ' + r.endS + ' s of trial wall, past ' + wallS + ' s';
    if (why) notMeeting.push({ id: l.id, why }); else meeting++;
  }
  const carrying = covered.filter((l) => l.trial).length;
  return {
    share: runs.length > 0 && covered.length > 0 ? r6(meeting / covered.length) : null,
    covered: covered.length, meeting, carrying,
    trialShare: covered.length ? r6(carrying / covered.length) : null,
    notMeeting,
  };
}

// ------------------------------------------------------------------ the run
function parseArgs(argv) {
  const o = { only: null, trials: true, tmpRoot: os.tmpdir(), tmpRootGiven: false, freeRamMb: FREE_RAM_MB, trialRamMb: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--only') o.only = argv[++i];
    else if (a === '--no-trials') o.trials = false;
    else if (a === '--tmp-root') { o.tmpRoot = path.resolve(argv[++i]); o.tmpRootGiven = true; }
    else if (a === '--wait-free-ram-mb') { o.freeRamMb = Number(argv[++i]); if (!(o.freeRamMb >= 0)) throw new Error('bench/gaps.mjs: --wait-free-ram-mb needs a number of MB'); }
    else if (a === '--trial-ram-mb') { o.trialRamMb = Number(argv[++i]); if (!(o.trialRamMb > 0)) throw new Error('bench/gaps.mjs: --trial-ram-mb needs a number of MB'); }
    else throw new Error('bench/gaps.mjs: unknown flag ' + a);
  }
  return o;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const t0 = Date.now();
  const say = (s) => process.stdout.write(s + '\n');
  const freeDiskStart = freeDiskMb(o.tmpRoot);
  say('gaps bench (' + AUTHOR + '): free RAM ' + Math.round(os.freemem() / MB) + ' MB, free disk on the temp volume ' + freeDiskStart + ' MB; each trial waits for ' + o.freeRamMb + ' MB free' + (o.freeRamMb !== FREE_RAM_MB ? ' (--wait-free-ram-mb; the rule assumes ' + FREE_RAM_MB + ')' : '') + (o.trialRamMb ? '; each trial capped at ' + o.trialRamMb + ' MB working set (--trial-ram-mb; the ledger says ' + RAM_MB + ')' : ''));

  const { lines, report } = await buildLedger();
  const again = await buildLedger();
  const ids = new Set(lines.map((l) => l.id)), ids2 = new Set(again.lines.map((l) => l.id));
  const differ = [...ids].filter((x) => !ids2.has(x)).length + [...ids2].filter((x) => !ids.has(x)).length;
  const w = writeLedger(lines);
  const s = summarize(lines);
  // CONTROL (board 17 builder (the organism's item)): what the ledger read from the gaps.json on disk before this run
  const before = lines.find((l) => l.id === 'missed:gaps.json') || null;
  say('control   the ledger on the gaps.json before this run: ' + (before ? 'missed, measured ' + before.measured + ', bar ' + before.bar + ', distance ' + before.distance + ' (' + before.why + ')' : 'no missed line (met, absent or undecidable)'));
  say('gaps      ' + s.total + ' total: ' + KINDS.map((k) => k + ' ' + s.byKind[k]).join(', '));
  say('trials    ' + s.withTrial + ' gaps with a trial, ' + s.withoutTrial + ' without; of kinds ' + REQUIRED_KINDS.join(', ') + ': ' + s.requiredWithoutTrial.length + ' without a trial' + (s.requiredWithoutTrial.length ? ' (' + s.requiredWithoutTrial.join(', ') + ')' : ''));
  say('ledger    ' + w.file + ' rewritten (' + w.lines + ' lines' + (w.previous ? ', previous kept as ' + w.previous : '') + ', ' + w.kept.length + ' dated kept' + (w.removed.length ? ', removed ' + w.removed.join(' ') : '') + '); built twice: ' + (differ ? differ + ' ids differ (the tree is live)' : 'identical ids'));
  say('undecid.  ' + report.verdicts.undecidable.length + ' of ' + report.verdicts.barFiles + ' bar files: ' + report.verdicts.undecidable.join(', '));
  const noTrial = lines.filter((l) => !l.trial);
  const noTrialNamed = noTrial.filter((l) => l.kind !== 'open');
  say('no trial  ' + noTrial.length + ' gaps (' + (noTrial.length - noTrialNamed.length) + ' open lines, judged by fix evidence); by name: ' + noTrialNamed.map((l) => l.id).join(', '));

  // one entry per distinct trial, in ledger order
  const trials = new Map();
  for (const l of lines) {
    if (!l.trial) continue;
    if (!trials.has(l.trial.key)) trials.set(l.trial.key, { trial: l.trial, gaps: [], recorded: l.measured, unit: l.unit });
    trials.get(l.trial.key).gaps.push(l.id);
  }
  const exact = o.only && trials.has(o.only);
  const all = [...trials.values()].filter((x) => !o.only || (exact ? x.trial.key === o.only : x.trial.key.includes(o.only)));
  const free = all.filter((x) => !x.trial.needsModel);
  const model = all.filter((x) => x.trial.needsModel);
  const runs = [], dries = [], unproved = [];
  let trialWallMs = 0, peakRssMb = 0;
  if (o.trials) {
    say('run       ' + free.length + ' model-free trials, sequentially, each under tools/budget.mjs at ' + (o.trialRamMb || free[0]?.trial.ramMb) + ' MB');
    const tRun = Date.now();
    for (const x of free) {
      const r = await runTrial(x.trial, { tmpRoot: o.tmpRoot, freeRamMb: o.freeRamMb, ramMb: o.trialRamMb, log: (l) => say('          ' + l) });
      r.endS = r2((Date.now() - tRun) / 1000);
      r.gaps = x.gaps; r.recorded = x.recorded; r.unit = x.unit;
      runs.push(r);
      peakRssMb = Math.max(peakRssMb, r.peakRssMb || 0);
      say('trial     ' + x.trial.key.padEnd(34) + (r.printedMetric ? (r.metricName + ' ' + r.metric + ' (ledger ' + x.recorded + ')') : 'FAILED: ' + r.firstLine) + ' | ' + r.seconds + ' s' + (r.copy ? ', copy ' + r.copy.files + ' files ' + r.copy.mb + ' MB in ' + r.copy.ms + ' ms, deleted ' + (r.copyGone ? 'yes' : 'NO') + (r.realWritesUnchanged === false ? ', REAL FILE MOVED: ' + r.realWritesMoved.join(' ') : '') : '') + (r.peakRssMb === null ? ', peak unsampled (no live process in any sample)' : ', peak ' + r.peakRssMb + ' MB'));
    }
    trialWallMs = Date.now() - tRun;
    for (const x of model) {
      if (!x.trial.dry) { unproved.push(x.trial.key); continue; }
      const r = await runTrial(x.trial, { tmpRoot: o.tmpRoot, freeRamMb: o.freeRamMb, ramMb: o.trialRamMb, dry: true, log: (l) => say('          ' + l) });
      r.gaps = x.gaps;
      dries.push(r);
      peakRssMb = Math.max(peakRssMb, r.peakRssMb || 0);
      say('dry       ' + x.trial.key.padEnd(34) + (r.printedMetric ? 'proved by ' + x.trial.dry.flag + ' (exit 0, ' + r.seconds + ' s)' : 'FAILED: ' + r.firstLine));
    }
  }
  // CONTROL: the fastest copy trial again, for run-to-run noise (outside the bar's wall clock)
  let noise = null;
  const fastest = runs.filter((r) => r.printedMetric && r.where === 'copy').sort((a, b) => a.seconds - b.seconds)[0];
  if (fastest) {
    const x = trials.get(fastest.key);
    const r = await runTrial(x.trial, { tmpRoot: o.tmpRoot, freeRamMb: o.freeRamMb, ramMb: o.trialRamMb });
    noise = { key: fastest.key, metric: [fastest.metric, r.metric], seconds: [fastest.seconds, r.seconds], metricDelta: r.metric !== null ? r3(r.metric - fastest.metric) : null, secondsDelta: r.seconds !== null ? r3(r.seconds - fastest.seconds) : null, copyGone: r.copyGone };
    say('noise     ' + fastest.key + ' run twice: ' + fastest.metricName + ' ' + fastest.metric + ' then ' + r.metric + ', wall ' + fastest.seconds + ' s then ' + r.seconds + ' s (not counted in the bar)');
  }
  const freeDiskEnd = freeDiskMb(o.tmpRoot);
  const leftover = runs.concat(dries).filter((r) => r.copyGone === false).length + (noise && noise.copyGone === false ? 1 : 0);
  const completed = runs.filter((r) => r.completed).length;
  const printed = runs.filter((r) => r.printedMetric).length;
  const failed = runs.filter((r) => r.failed);
  say('trials    ' + runs.length + ' model-free: ran ' + runs.filter((r) => r.ran).length + ', ran to completion ' + completed + ', printed a metric ' + printed + ', failed ' + failed.length + '; wall ' + r2(trialWallMs / 1000) + ' s against ' + BAR_WALL_S + ' s');
  for (const f of failed) say('failed    ' + f.key + ': ' + f.firstLine);
  const proved = dries.filter((d) => d.printedMetric), dryFailed = dries.filter((d) => !d.printedMetric);
  say('model     ' + model.length + ' model trials: proved by a dry form ' + proved.length + (proved.length ? ' (' + proved.map((d) => d.key).join(', ') + ')' : '')
    + ', dry form failed ' + dryFailed.length + (dryFailed.length ? ' (' + dryFailed.map((d) => d.key + ': ' + d.firstLine).join('; ') + ')' : '')
    + ', unproved (no dry form) ' + unproved.length + (unproved.length ? ': ' + unproved.join(', ') : ''));
  say('disk      copies deleted ' + runs.concat(dries).filter((r) => r.copy).every((r) => r.copyGone) + ', gaps-* dirs left in the temp dir ' + leftover + ', free MB ' + freeDiskStart + ' before and ' + freeDiskEnd + ' after');
  const ownPeak = Math.round(process.resourceUsage().maxRSS / 1024);
  peakRssMb = Math.max(peakRssMb, ownPeak);

  const narrow = !!o.only || !o.trials;
  // THE NUMBER and barMet from it alone (board 17 builder (the organism's item))
  const sh = barShare(lines, runs, { keys: o.only ? new Set(all.map((x) => x.trial.key)) : null });
  const barMet = !narrow && sh.share !== null && sh.share >= SHARE_BAR;
  say('number    share ' + sh.share + ' against a bar of ' + SHARE_BAR + ': ' + sh.meeting + ' of ' + sh.covered + ' gap lines the bar covers meet it (' + sh.carrying + ' carry a trial, trialShare ' + sh.trialShare + ')');
  for (const m of sh.notMeeting) say('short     ' + m.id + ': ' + m.why);
  const statement = 'The gap ledger (self/gaps.mjs) read ' + report.verdicts.read + ' verdict files (' + report.verdicts.barFiles + ' bars: ' + report.verdicts.met.length + ' met, ' + report.verdicts.missed.length + ' missed, ' + report.verdicts.undecidable.length + ' undecidable), ladder.json, gate.json, ' + report.notes.files + ' notes and ' + report.census.seeds + ' emitted seeds, and wrote ' + s.total + ' gaps to state/self/gaps.jsonl: '
    + KINDS.map((k) => s.byKind[k] + ' ' + k).join(', ') + '. ' + s.withTrial + ' carry a bounded trial and ' + s.withoutTrial + ' do not (' + (noTrial.length - noTrialNamed.length) + ' of those are OPEN lines, judged by fix evidence); of the kinds the bar requires (' + REQUIRED_KINDS.join(', ') + ') ' + s.requiredWithoutTrial.length + ' lack one. '
    + (o.trials ? runs.length + ' distinct model-free trials ran once each, sequentially, each through tools/budget.mjs: ' + completed + ' ran to completion, ' + printed + ' printed their metric, ' + failed.length + ' failed' + (failed.length ? ' (' + failed.map((f) => f.key).join(', ') + ')' : '') + ', in ' + r2(trialWallMs / 1000) + ' s of wall clock against a bar of ' + BAR_WALL_S + ' s. ' + model.length + ' trials need a model and none was run: ' + dries.filter((d) => d.printedMetric).length + ' proved by a socket-free dry form, ' + unproved.length + ' unproved (' + unproved.join(', ') + '). ' : 'No trial ran (--no-trials). ')
    + (noise ? 'Run-to-run noise on ' + noise.key + ': metric ' + noise.metric.join(' then ') + ', wall ' + noise.seconds.join(' s then ') + ' s. ' : '')
    + 'The number beside the bar: of the ' + sh.covered + ' gap lines the bar covers (every line of the required kinds and every line carrying a model-free trial), ' + sh.meeting + ' meet it (a trial carried; a model-free trial printed its metric before the trials passed ' + BAR_WALL_S + ' s), a share of ' + sh.share + ' against a bar of ' + SHARE_BAR + '; ' + sh.carrying + ' carry a trial (trialShare ' + sh.trialShare + ')' + (sh.notMeeting.length ? '; short: ' + sh.notMeeting.map((m) => m.id).join(', ') : '') + '. '
    + 'Bar ' + (barMet ? 'MET' : 'NOT MET') + (narrow ? ' (a narrow run is never the bar)' : '') + ': every gap of kinds missed, ladder, gate red and gate slow has a trial command, and every model-free trial printed its metric in one run under ' + TRIAL_MAX_MINUTES + ' minutes, so the share must be ' + SHARE_BAR + '.';
  const heap = process.execArgv.find((a) => a.startsWith('--max-old-space-size'));
  const verdict = {
    name: 'gaps', item: 'gaps', board: 14, by: AUTHOR, at: new Date().toISOString(),
    command: 'node ' + (heap ? heap + ' ' : '') + 'bench/gaps.mjs' + (o.only ? ' --only ' + o.only : '') + (o.trials ? '' : ' --no-trials') + (o.freeRamMb !== FREE_RAM_MB ? ' --wait-free-ram-mb ' + o.freeRamMb : '') + (o.trialRamMb ? ' --trial-ram-mb ' + o.trialRamMb : '') + (o.tmpRootGiven ? ' --tmp-root ' + o.tmpRoot : ''),
    node: process.version, isTheBar: !narrow, barMet,
    bar: {
      rule: 'every gap of kinds ' + REQUIRED_KINDS.join(', ') + ' has a trial command, and every model-free trial printed its metric in one run under ' + TRIAL_MAX_MINUTES + ' minutes',
      number: 'share: of the gap lines the bar covers (self/gaps.mjs barLines: every line of the required kinds and every line carrying a model-free trial), the share that meet it (a trial carried; a model-free trial printed its metric in this run before the trials passed limitS of wall clock); barMet is share >= shareBar',
      share: sh.share, shareBar: SHARE_BAR, better: 'higher', coveredLines: sh.covered, meetingLines: sh.meeting, carryingTrial: sh.carrying, trialShare: sh.trialShare, notMeeting: sh.notMeeting,
      requiredWithoutTrial: s.requiredWithoutTrial, modelFreeTrials: runs.length, printedMetric: printed, trialWallS: r2(trialWallMs / 1000), limitS: BAR_WALL_S, met: barMet,
    },
    split: {
      development: 'test/gaps.test.mjs: five planted verdict files (met, missed, undecidable, partial only, bar object), a planted ladder with not measured fields, a trial past its minutes, nine dated ledgers, planted gaps.json files with and without bar.share, planted lines and runs for barShare, all under the OS temp dir',
      contaminated: false,
      contaminationNote: 'the share is computed from this run\'s own trials over the live ledger; no line, trial or bound was chosen by looking at this run',
      heldOut: 'the live tree as it stood at this run: every file under bench/verdicts/, ladder.json, gate.json, notes/, the census records and docs/ARCHITECTURE.md; nothing in self/gaps.mjs was tuned to it',
    },
    statement,
    ledger: { file: w.file, lines: s.total, byKind: s.byKind, withTrial: s.withTrial, withoutTrial: s.withoutTrial, withoutTrialByName: noTrialNamed.map((l) => ({ id: l.id, why: l.why })), builtTwiceIdsDiffer: differ, previous: w.previous, dated: w.kept, removed: w.removed },
    verdicts: { read: report.verdicts.read, barFiles: report.verdicts.barFiles, met: report.verdicts.met, missed: report.verdicts.missed, undecidable: report.verdicts.undecidable, noTopLevelBarMet: report.verdicts.noTopLevelBarMet, unparseable: report.verdicts.unparseable, partialOnly: report.verdicts.partialOnly, decidedBy: report.verdicts.fields },
    ladderRungs: report.ladder.rungs,
    census: report.census,
    trials: runs, dry: dries, unproved, noise, waitFreeRamMb: o.freeRamMb, trialRamMb: o.trialRamMb || RAM_MB,
    disk: { freeMbBefore: freeDiskStart, freeMbAfter: freeDiskEnd, leftoverDirs: leftover },
    peakRssMb, modelCalls: 0, wallS: r2((Date.now() - t0) / 1000),
    models: 'none: no trial that needs a model ran, and each dry proof is a documented flag that opens no socket',
  };
  const out = path.join(ROOT, 'bench', 'verdicts', narrow ? 'gaps-partial.json' : 'gaps.json');
  writeFileSync(out, JSON.stringify(verdict, null, 2) + '\n');
  const after = measureOf('gaps', verdict);
  say('control   the ledger on the gaps.json this run wrote: ' + classifyBar(verdict).state + ', measured ' + after.measured + ', bar ' + after.bar + ', distance ' + after.distance + ' (' + after.from + '); before it: ' + (before ? 'measured ' + before.measured + ', distance ' + before.distance : 'no missed line'));
  say('bar       ' + (barMet ? 'MET' : 'NOT MET') + ': share ' + sh.share + ' of ' + SHARE_BAR + '; required gaps without a trial ' + s.requiredWithoutTrial.length + ', model-free trials printing a metric ' + printed + ' of ' + runs.length + ', trial wall ' + r2(trialWallMs / 1000) + ' s of ' + BAR_WALL_S);
  say('peak      ' + peakRssMb + ' MB (the largest working set of any trial tree, or this process); model calls 0; wall ' + verdict.wallS + ' s');
  say('verdict   ' + path.relative(ROOT, out).replaceAll('\\', '/') + ' (isTheBar ' + verdict.isTheBar + ', barMet ' + barMet + ')');
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
