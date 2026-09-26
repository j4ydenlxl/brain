#!/usr/bin/env node
// bench/resume.mjs: THE BAR of Board 15, item resume. Author: board 15 builder.
//
// A bounded resume of the GSM8K chain on the REAL tree, through the budget wrapper, twice:
//   FIRST   self/resume.mjs resumeOnce with a 20-minute wall (tools/budget.mjs around
//           bench/public.mjs --resume --wall-minutes 20), the journal read before and after
//   SECOND  the same with a 2-minute wall, which must continue from the line count the first
//           left, without repeating a record
// The bar is met when both resumes ran, the journal grew, no record was repeated, and every cut
// left the journal parseable (the last line parses, the file ends with a newline, and every
// record the journal holds is whole). Nothing else is part of the bar.
//
// Every claim carries its control, printed before the claim:
//   - the journal is read by an INDEPENDENT reader here (not self/resume.mjs), and both counts print
//   - the checkers are shown to FIRE: a planted duplicate and a torn copy of the real lines (in
//     memory, nothing written) must read 1 duplicate and "last line parses: no"
//   - a 2-minute window with NO resume: the journal must not grow on its own (growth 0), so any
//     growth after is the resume's
//   - the earlier rate is parsed from whole-gsm8k.log as it stood before any resume: the running
//     tasks/min at task 13 and at the cut, and the noise band of 10-record windows by the arm
//     seconds each line prints; the resumed records are read with the SAME ruler from the log
//     sections the resumes appended
//   - every consumer file written by someone else during a resume is listed (a shared Ollama
//     queue would slow the rate), with /api/ps before and after
// After the bar the chain stays paused: no bench/public.mjs process may be alive, and
// bench/verdicts/public/chain-cut.txt must have been rewritten by the second resume.
//
// The verdict is bench/verdicts/resume.json (isTheBar true, barMet boolean), written ONCE; a run
// that is not the bar (other minutes, a queue that never went idle, a bar file already on disk)
// writes bench/verdicts/resume-partial.json with isTheBar false.
//
// Usage (the BUDGETS rule: under the budget wrapper, one bench of my own at a time):
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 200 --dir bench/verdicts/public
//     --record bench/verdicts/public/budget-resume-bar.json -- node --max-old-space-size=6000
//     bench/resume.mjs [--first 20] [--second 2] [--control-s 120] [--wait-idle-min 30]
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, copyFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as R from '../self/resume.mjs';

const ROOT = R.ROOT;
const AUTHOR = 'board 15 builder';
const VERDICT_REL = 'bench/verdicts/resume.json';
const PARTIAL_REL = 'bench/verdicts/resume-partial.json';
const JOURNAL_REL = 'bench/verdicts/public/gsm8k-public_1.jsonl';
const LOG_REL = 'bench/verdicts/public/whole-gsm8k.log';
const ARMS = R.BAR_ARMS.gsm8k;
const BAR = { first: 20, second: 2 };

const argv = process.argv.slice(2);
const num = (k, d) => { const i = argv.indexOf('--' + k); const v = i >= 0 ? Number(argv[i + 1]) : NaN; return Number.isFinite(v) && v >= 0 ? v : d; };
const FIRST = num('first', BAR.first), SECOND = num('second', BAR.second);
const CONTROL_S = num('control-s', 120), WAIT_IDLE_MIN = num('wait-idle-min', 30);
const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 10000) / 10000;
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const wait = (ms) => new Promise((res) => setTimeout(res, ms));
const say = (l) => console.log(l);
const yes = (b) => (b ? 'yes' : 'NO');

let peakRss = process.memoryUsage().rss;
const rssTimer = setInterval(() => { peakRss = Math.max(peakRss, process.memoryUsage().rss); }, 2000);
rssTimer.unref();

// ---------------------------------------------------------------- the independent reader
/** The journal read here, without self/resume.mjs: lines, the tail, keys, duplicates, whole records. */
function readJournalText(text) {
  const endsWithNewline = text.endsWith('\n');
  const raw = text.split('\n');
  if (raw.length && raw[raw.length - 1] === '') raw.pop();
  const lines = raw.filter((l) => l.trim() !== '');
  let lastLineParses = false, torn = 0, header = 0;
  const keys = new Set();
  let dup = 0;
  const armsOf = new Map();
  const order = [];
  lines.forEach((l, i) => {
    let j = null;
    try { j = JSON.parse(l); } catch { torn++; }
    if (i === lines.length - 1) lastLineParses = j !== null;
    if (!j) return;
    if (j.type === 'header') { header++; return; }
    if (j.type !== 'arm') return;
    const k = j.id + '\u0000' + j.arm;
    if (keys.has(k)) dup++; else keys.add(k);
    if (!armsOf.has(j.id)) { armsOf.set(j.id, new Set()); order.push(j.id); }
    armsOf.get(j.id).add(j.arm);
  });
  let whole = 0, incomplete = 0;
  for (const s of armsOf.values()) { if (ARMS.every((a) => s.has(a))) whole++; else incomplete++; }
  return { lines: lines.length, header, endsWithNewline, lastLineParses, torn, dup, keys, whole, incomplete, lastId: order.length ? order[order.length - 1] : null };
}
const readJournal = () => readJournalText(readFileSync(path.join(ROOT, JOURNAL_REL), 'utf8'));
const facts = (j) => j.lines + ' lines, ' + j.whole + ' whole records, ' + j.incomplete + ' incomplete, ' + j.dup + ' duplicated keys, last line parses ' + yes(j.lastLineParses) + ', ends with a newline ' + yes(j.endsWithNewline);
const parseable = (j) => j.lastLineParses && j.endsWithNewline && j.torn === 0 && j.incomplete === 0;

// ---------------------------------------------------------------- the log ruler
/** The records a log section ran in-process: per-record seconds (the sum of the arm seconds each line prints). */
function logRecords(text) {
  const recs = [];
  const running = [];
  for (const line of text.split('\n')) {
    const m = /^\s*(\d+)\/(\d+)\s+(\S+)\s+gold/.exec(line);
    if (!m) continue;
    const rate = /([\d.]+) tasks\/min/.exec(line);
    if (rate) running.push({ task: Number(m[1]), rate: Number(rate[1]) });
    let secs = 0, all = true;
    for (const a of ARMS) {
      const t = new RegExp('\\| ' + a + '\\s+\\S+\\s+\\S+\\s+([\\d.]+)s\\b').exec(line);
      if (!t) { all = false; break; }
      secs += Number(t[1]);
    }
    if (all) recs.push({ task: Number(m[1]), id: m[3], secs });
  }
  return { recs, running };
}
function band(recs, w = 10) {
  const rates = [];
  for (let i = 0; i + w <= recs.length; i += w) { const s = recs.slice(i, i + w).reduce((x, r) => x + r.secs, 0); if (s > 0) rates.push(w / (s / 60)); }
  const secs = recs.map((r) => r.secs);
  const total = secs.reduce((x, y) => x + y, 0);
  return { records: recs.length, medianSecs: secs.length ? r2(median(secs)) : null, rate: total > 0 ? r2(recs.length / (total / 60)) : null, windows: rates.length, min: rates.length ? r2(Math.min(...rates)) : null, median: rates.length ? r2(median(rates)) : null, max: rates.length ? r2(Math.max(...rates)) : null };
}
/** The section of the log one resume appended (from its # RESUME header to the next). */
function sectionOf(text, startedAt) {
  const i = text.indexOf('# RESUME ' + startedAt);
  if (i < 0) return '';
  const j = text.indexOf('\n# RESUME ', i + 10);
  return j < 0 ? text.slice(i) : text.slice(i, j);
}

// ---------------------------------------------------------------- the queue around a resume
function consumerFiles() {
  const out = new Map();
  for (const c of R.CONSUMERS) {
    let names = [];
    try { names = readdirSync(path.join(ROOT, c.dir)); } catch { continue; }
    for (const n of names) { if (!c.re.test(n)) continue; const rel = c.dir + '/' + n; try { const st = statSync(path.join(ROOT, rel)); if (st.isFile()) out.set(rel, st.mtimeMs); } catch { /* gone */ } }
  }
  return out;
}
function othersWritten(beforeMap, own) {
  const now = consumerFiles();
  const moved = [];
  for (const [rel, m] of now) if (!own.includes(rel) && m !== beforeMap.get(rel)) moved.push(rel);
  return moved;
}
async function ollamaPs() {
  try {
    const r = await fetch(R.OLLAMA_BASE + '/api/ps', { signal: AbortSignal.timeout(3000) });
    const j = await r.json();
    return (j.models || []).map((m) => m.name).join(', ') || 'none loaded';
  } catch (e) { return 'no answer (' + String(e && e.message || e).split('\n')[0] + ')'; }
}
async function freeMb() {
  if (process.platform === 'win32') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync('powershell', ['-NoProfile', '-Command', '(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory'], { encoding: 'utf8', windowsHide: true });
    const kb = Number(String(r.stdout || '').trim());
    if (Number.isFinite(kb) && kb > 0) return Math.round(kb / 1024);
  }
  return Math.round(os.freemem() / 1048576);
}
function budgetRecord(rel) {
  try { const j = JSON.parse(readFileSync(path.join(ROOT, rel), 'utf8')); return { file: rel, peakRssMb: j.peakRssMb ?? null, peakWsMb: j.peakWsBytes ? r2(j.peakWsBytes / 1048576) : null, wallS: j.wallS ?? null, exitCode: j.exitCode ?? null, outcome: j.outcome ?? null }; } catch { return { file: rel, missing: true }; }
}

/** Poll the queue (self/resume.mjs queueState, its 3-minute window) until idle or the limit. */
async function waitIdle(label, limitMs) {
  const qT0 = Date.now();
  let q = R.queueState({ root: ROOT });
  let lastWhy = null;
  while (!q.idle && Date.now() - qT0 < limitMs) {
    const why = q.busy.map((b) => b.what === 'file' ? b.file : b.what === 'process' ? 'pid ' + b.pid + ' ' + String(b.cmd).slice(0, 80) : b.reason).join('; ');
    if (why !== lastWhy) { say(label + ' QUEUE busy: ' + why); lastWhy = why; }
    await wait(15_000);
    q = R.queueState({ root: ROOT });
  }
  const waitedS = r2((Date.now() - qT0) / 1000);
  say(label + ' QUEUE ' + (q.idle ? 'idle' : 'STILL BUSY') + ' after ' + waitedS + ' s of waiting (' + q.checked + ' consumer files, newest ' + (q.newest ? q.newest.file + ' ' + q.newest.ageS + ' s ago' : 'none') + ')');
  return { idle: q.idle, waitedS };
}

// ---------------------------------------------------------------- one resume, read on both rulers
async function oneResume(label, minutes, step) {
  const deadline = Date.now() + WAIT_IDLE_MIN * 60_000;
  const w = await waitIdle(label, WAIT_IDLE_MIN * 60_000);
  if (!w.idle) return { out: { decision: 'waiting', ran: false, reason: 'the queue never went idle', waitedS: w.waitedS }, keysAfter: new Set(), keysBefore: new Set(), line: null };
  const own = [step.journalRel, step.log];
  const beforeFiles = consumerFiles();
  const psBefore = await ollamaPs();
  const jb = readJournal();
  say(label + ' START: ' + minutes + ' min wall; journal ' + facts(jb) + '; ollama loaded: ' + psBefore);
  let line = await R.resumeOnce({ root: ROOT, minutes, log: (l) => say('  ' + l) });
  while (line && line.decision === 'waiting' && Date.now() < deadline) {
    say(label + ' resumeOnce says waiting (' + line.wall + '): ' + line.reason);
    await wait(15_000);
    line = await R.resumeOnce({ root: ROOT, minutes, log: (l) => say('  ' + l) });
  }
  const ja = readJournal();
  const psAfter = await ollamaPs();
  const others = othersWritten(beforeFiles, own);
  const rec = budgetRecord('bench/verdicts/public/budget-resume-' + step.stem + '.json');
  if (!rec.missing) { try { copyFileSync(path.join(ROOT, rec.file), path.join(ROOT, 'bench/verdicts/public/budget-resume-' + step.stem + '-' + label.toLowerCase() + '.json')); rec.kept = 'bench/verdicts/public/budget-resume-' + step.stem + '-' + label.toLowerCase() + '.json'; } catch { /* the copy is a courtesy */ } }
  const added = [...ja.keys].filter((k) => !jb.keys.has(k));
  const addedIds = [...new Set(added.map((k) => k.split('\u0000')[0]))];
  let sect = { records: 0 };
  if (line && line.startedAt) sect = band(logRecords(sectionOf(readFileSync(path.join(ROOT, LOG_REL), 'utf8'), line.startedAt)).recs);
  const ran = !!line && (line.decision === 'resumed' || (line.decision === 'failed' && Number.isFinite(line.linesBefore)));
  const out = {
    decision: line ? line.decision : null, reason: line && line.reason ? line.reason : null, ran,
    minutes, startedAt: line.startedAt ?? null, endedAt: line.endedAt ?? null, cutAt: line.cutAt ?? null, cutPrinted: line.cutPrinted ?? null, exit: line.exit ?? null, killed: line.killed ?? null,
    wallMinutes: line.wallMinutes ?? null,
    linesBefore: jb.lines, linesAfter: ja.lines, linesAdded: ja.lines - jb.lines,
    toolLinesBefore: line.linesBefore ?? null, toolLinesAfter: line.linesAfter ?? null,
    recordsBefore: jb.whole, recordsAfter: ja.whole, recordsCompleted: ja.whole - jb.whole,
    recordsPerMinute: line.recordsPerMinute ?? null, benchRate: line.benchRate ?? null, armSecondsRate: sect.rate ?? null, armSecondsRecords: sect.records ?? 0,
    modelCalls: line.modelCalls ?? 0, keysAdded: added.length, idsAdded: addedIds.length, firstNewId: addedIds[0] ?? null, lastNewId: addedIds[addedIds.length - 1] ?? null,
    repeatedByTool: line.repeated ?? null, dupBefore: jb.dup, dupAfter: ja.dup, cleanCutByTool: line.cleanCut ?? null, parseableAfter: parseable(ja),
    lastLineParses: ja.lastLineParses, endsWithNewline: ja.endsWithNewline, incompleteAfter: ja.incomplete,
    othersWritten: others, ollamaBefore: psBefore, ollamaAfter: psAfter, budget: rec, command: line.command ?? null,
  };
  say(label + ' RESULT: lines ' + out.linesBefore + ' -> ' + out.linesAfter + ' (+' + out.linesAdded + '; self/resume.mjs read ' + out.toolLinesBefore + ' -> ' + out.toolLinesAfter + '), records ' + out.recordsBefore + ' -> ' + out.recordsAfter + ' (' + out.recordsCompleted + ' completed), '
    + out.recordsPerMinute + ' records/min over ' + out.wallMinutes + ' min of wall (bench RATE ' + out.benchRate + ' tasks/min; by arm seconds ' + out.armSecondsRate + ' over ' + out.armSecondsRecords + ' records), ' + out.modelCalls + ' model calls, cut ' + out.cutAt + ' (CUT line printed: ' + yes(out.cutPrinted) + '), exit ' + out.exit + (out.killed ? ', KILLED ' + out.killed : ''));
  say(label + ' CUT: last line parses ' + yes(out.lastLineParses) + ', ends with a newline ' + yes(out.endsWithNewline) + ', incomplete records ' + out.incompleteAfter + ', parseable ' + yes(out.parseableAfter) + ' (self/resume.mjs cleanCut ' + out.cleanCutByTool + '); new ids ' + out.firstNewId + ' .. ' + out.lastNewId + ' (' + out.idsAdded + ' ids, ' + out.keysAdded + ' arm keys); duplicated keys ' + out.dupBefore + ' -> ' + out.dupAfter);
  say(label + ' QUEUE: other consumer files written during it: ' + (others.length ? others.join(', ') : 'none') + '; ollama after: ' + psAfter + '; budget record ' + (rec.missing ? rec.file + ' MISSING' : rec.file + ' peak ram ' + rec.peakRssMb + ' MB, wall ' + rec.wallS + ' s, exit ' + rec.exitCode));
  return { out, keysAfter: ja.keys, keysBefore: jb.keys, line };
}

// ---------------------------------------------------------------- the bar
async function main() {
  const t0 = Date.now();
  const at = new Date().toISOString();
  const command = 'node bench/resume.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  say('RESUME BAR ' + at + ': ' + command + ' on ' + ROOT + ' (node ' + process.version + ', pid ' + process.pid + ')');
  const asBar = FIRST === BAR.first && SECOND === BAR.second;
  const notBar = [];
  if (!asBar) notBar.push('the walls were ' + FIRST + ' and ' + SECOND + ' min, not ' + BAR.first + ' and ' + BAR.second);
  if (existsSync(path.join(ROOT, VERDICT_REL))) notBar.push(VERDICT_REL + ' is already on disk (a bar file is written once)');

  const plan = R.planResume({ root: ROOT });
  const group = plan.resumable.find((g) => g.step.stem === 'public-gsm8k');
  say('PLAN: ' + plan.never + ' bar-never-completed gaps; resumable ' + plan.resumable.map((g) => g.step.stem + ' (' + g.gaps.length + ' gaps)').join(', ') + '; not resumable ' + plan.notResumable.map((n) => n.id + ' (' + n.reason + ')').join('; '));
  if (!group || group.step.journalRel !== JOURNAL_REL) { say('NO BAR: the GSM8K chain step is not the resumable group the bar reads (' + (group ? group.step.journalRel : 'none') + ')'); return finish({ at, command, t0, isTheBar: false, why: ['the GSM8K chain step was not resumable'] }); }
  const step = group.step;

  const j0 = readJournal();
  const tool0 = R.inspectJournal(path.join(ROOT, JOURNAL_REL), ARMS);
  say('BEFORE: journal ' + JOURNAL_REL + ' ' + facts(j0) + ' (self/resume.mjs reads ' + tool0.lines + ' lines, ' + tool0.whole + ' whole)');
  let cut0 = '';
  try { cut0 = readFileSync(path.join(ROOT, R.CUT_REL), 'utf8'); } catch { cut0 = ''; }
  const cut0Mtime = existsSync(path.join(ROOT, R.CUT_REL)) ? statSync(path.join(ROOT, R.CUT_REL)).mtimeMs : null;
  say('BEFORE: ' + R.CUT_REL + ' first line: ' + (cut0.split('\n')[0] || '(empty)').slice(0, 160));

  // the checkers fire (in memory, nothing written)
  const text0 = readFileSync(path.join(ROOT, JOURNAL_REL), 'utf8');
  const ls0 = text0.split('\n').filter((l) => l.trim());
  const dupCopy = readJournalText(ls0.concat([ls0[ls0.length - 1]]).join('\n') + '\n');
  const tornCopy = readJournalText(text0.slice(0, text0.length - 25));
  const checkersFire = dupCopy.dup === j0.dup + 1 && !tornCopy.lastLineParses && !parseable(tornCopy);
  say('CHECKER CONTROL: a copy with its last arm line doubled reads ' + dupCopy.dup + ' duplicated key(s) (the journal ' + j0.dup + '); a copy torn 25 bytes short reads last line parses ' + yes(tornCopy.lastLineParses) + ', parseable ' + yes(parseable(tornCopy)) + ': the checkers fire ' + yes(checkersFire));

  // the earlier rate and its noise, from the log as it stood before any resume
  const logText = readFileSync(path.join(ROOT, LOG_REL), 'utf8');
  const pre = logText.indexOf('\n# RESUME ') >= 0 ? logText.slice(0, logText.indexOf('\n# RESUME ')) : logText;
  const lr = logRecords(pre);
  const at13 = lr.running.find((x) => x.task === 13) || null;
  const atCut = lr.running.length ? lr.running[lr.running.length - 1] : null;
  const noise = band(lr.recs);
  say('EARLIER RATE (' + LOG_REL + ' before any resume, ' + lr.running.length + ' lines with a rate): ' + (at13 ? at13.rate : 'n/a') + ' tasks/min at task 13, ' + (atCut ? atCut.rate + ' at the cut (task ' + atCut.task + ')' : 'n/a at the cut'));
  say('NOISE (same log, arm seconds per record over ' + noise.records + ' records run in-process): median ' + noise.medianSecs + ' s/record, overall ' + noise.rate + ' records/min; ' + noise.windows + ' windows of 10 records: min ' + noise.min + ' / median ' + noise.median + ' / max ' + noise.max + ' records/min');

  const ram = await freeMb();
  say('RAM: ' + ram + ' MB free (the BUDGETS floor ' + R.FREE_RAM_MB + ' MB; the wrapper waits under it)');

  // the no-resume control
  const psC = await ollamaPs();
  const cFiles = consumerFiles();
  const jc0 = readJournal();
  say('CONTROL START: ' + CONTROL_S + ' s with no resume; journal ' + jc0.lines + ' lines; ollama loaded: ' + psC);
  await wait(CONTROL_S * 1000);
  const jc1 = readJournal();
  const cOthers = othersWritten(cFiles, []);
  const control = { seconds: CONTROL_S, linesBefore: jc0.lines, linesAfter: jc1.lines, growth: jc1.lines - jc0.lines, consumersWritten: cOthers, ollama: psC };
  say('CONTROL: journal ' + jc0.lines + ' -> ' + jc1.lines + ' lines over ' + CONTROL_S + ' s with no resume (growth ' + control.growth + '); consumer files written in the window: ' + (cOthers.length ? cOthers.join(', ') : 'none'));

  const A = await oneResume('FIRST', FIRST, step);
  if (!A.out.ran && A.out.decision === 'waiting') return finish({ at, command, t0, isTheBar: false, why: ['the Ollama queue never went idle in ' + WAIT_IDLE_MIN + ' min before the first resume'], control, noise, earlier: { at13, atCut } });
  const B = A.out.ran ? await oneResume('SECOND', SECOND, step) : null;

  // the checks the bar names, each read here
  const bothRan = !!(A.out.ran && B && B.out.ran && A.out.decision === 'resumed' && B.out.decision === 'resumed');
  const final = readJournal();
  const grew = final.lines > j0.lines && A.out.linesAdded > 0;
  const continued = !!B && B.out.linesBefore === A.out.linesAfter;
  const overlap = B ? [...B.keysAfter].filter((k) => !B.keysBefore.has(k) && A.keysAfter.has(k)).length : null;
  const noRepeat = !!B && overlap === 0 && final.dup === j0.dup && A.out.dupAfter === j0.dup && B.out.dupAfter === j0.dup && A.out.repeatedByTool === 0 && B.out.repeatedByTool === 0;
  const allParseable = !!B && A.out.parseableAfter && B.out.parseableAfter && parseable(final);
  const barMet = bothRan && grew && noRepeat && allParseable;
  say('LINE COUNTS: first ' + A.out.linesBefore + ' -> ' + A.out.linesAfter + '; second ' + (B ? B.out.linesBefore + ' -> ' + B.out.linesAfter : 'did not run') + '; the second started from the first\'s count: ' + yes(continued));
  say('NO REPEAT: first added ' + A.out.keysAdded + ' arm keys, second ' + (B ? B.out.keysAdded : 0) + '; keys of the second already present after the first: ' + overlap + '; duplicated keys in the journal ' + j0.dup + ' -> ' + final.dup);
  say('RATE vs EARLIER: first ' + A.out.recordsPerMinute + ' records/min by wall (' + A.out.armSecondsRate + ' by arm seconds) vs the chain\'s ' + (atCut ? atCut.rate : 'n/a') + ' tasks/min at the cut (' + (at13 ? at13.rate : 'n/a') + ' at task 13); the earlier 10-record band ' + noise.min + ' .. ' + noise.max + ': by arm seconds ' + (A.out.armSecondsRate !== null && noise.min !== null ? (A.out.armSecondsRate >= noise.min && A.out.armSecondsRate <= noise.max ? 'INSIDE the band' : 'OUTSIDE the band') : 'not comparable'));

  // the chain stays paused
  const procs = R.nodeProcesses();
  const alive = (procs.list || []).filter((p) => /bench[\\/]public\.mjs/.test(String(p.cmd || '')));
  let cutNow = '';
  try { cutNow = readFileSync(path.join(ROOT, R.CUT_REL), 'utf8'); } catch { cutNow = ''; }
  const cutMtime = existsSync(path.join(ROOT, R.CUT_REL)) ? statSync(path.join(ROOT, R.CUT_REL)).mtimeMs : null;
  const cutFresh = !!(B && cutMtime && cutMtime !== cut0Mtime && B.out.endedAt && cutMtime >= Date.parse(B.out.endedAt) - 1000 && /^PAUSED /.test(cutNow));
  const paused = { processQuery: procs.ok, publicAlive: alive.map((p) => p.pid), cutNoteFresh: cutFresh, cutNoteFirstLine: cutNow.split('\n')[0].slice(0, 300) };
  say('PAUSED: bench/public.mjs processes alive: ' + (procs.ok ? alive.length : 'the process query failed') + '; ' + R.CUT_REL + ' rewritten after the second resume: ' + yes(cutFresh) + ': ' + paused.cutNoteFirstLine.slice(0, 200));

  const modelCalls = A.out.modelCalls + (B ? B.out.modelCalls : 0);
  const peaks = { first: A.out.budget, second: B ? B.out.budget : null, driverMb: r2(peakRss / 1048576) };
  say('PEAK RSS: first bench ' + (A.out.budget.peakRssMb ?? 'n/a') + ' MB, second bench ' + (B && B.out.budget ? B.out.budget.peakRssMb ?? 'n/a' : 'n/a') + ' MB, this driver ' + peaks.driverMb + ' MB; model calls ' + modelCalls);

  const split = {
    bothRan, grew, continuedFromFirstCount: continued, noRecordRepeated: noRepeat, everyCutParseable: allParseable,
    first: A.out, second: B ? B.out : null,
    journal: { before: { lines: j0.lines, whole: j0.whole, dup: j0.dup }, after: { lines: final.lines, whole: final.whole, dup: final.dup, incomplete: final.incomplete, lastLineParses: final.lastLineParses } },
  };
  const statement = (barMet ? 'BAR MET: ' : 'BAR MISSED: ')
    + 'two bounded resumes of the GSM8K chain through tools/budget.mjs on the real tree. First (' + FIRST + ' min wall): journal ' + A.out.linesBefore + ' -> ' + A.out.linesAfter + ' lines, ' + A.out.recordsCompleted + ' records completed at ' + A.out.recordsPerMinute + ' records/min over ' + A.out.wallMinutes + ' min (bench RATE ' + A.out.benchRate + ' tasks/min, ' + A.out.armSecondsRate + ' by arm seconds) against the chain\'s ' + (atCut ? atCut.rate : 'n/a') + ' tasks/min at the cut (' + (at13 ? at13.rate : 'n/a') + ' at task 13; earlier 10-record band ' + noise.min + ' .. ' + noise.max + '), cut ' + A.out.cutAt + ', last line parses ' + yes(A.out.lastLineParses) + ', incomplete records ' + A.out.incompleteAfter + '. '
    + (B ? 'Second (' + SECOND + ' min wall): ' + B.out.linesBefore + ' -> ' + B.out.linesAfter + ' lines, ' + B.out.recordsCompleted + ' records, cut ' + B.out.cutAt + ', last line parses ' + yes(B.out.lastLineParses) + ', keys already present ' + overlap + '. ' : 'The second did not run. ')
    + 'Both ran ' + yes(bothRan) + ', grew ' + yes(grew) + ', no record repeated ' + yes(noRepeat) + ' (duplicated keys ' + j0.dup + ' -> ' + final.dup + '), every cut parseable ' + yes(allParseable) + '. '
    + 'Control: ' + control.growth + ' lines of growth in ' + CONTROL_S + ' s with no resume; the checkers fire ' + yes(checkersFire) + '. ' + modelCalls + ' model calls. Paused after: ' + (procs.ok ? alive.length : '?') + ' bench/public.mjs alive, cut note fresh ' + yes(cutFresh) + '.';
  return finish({ at, command, t0, isTheBar: notBar.length === 0, why: notBar, barMet, split, statement, control, noise, earlier: { at13, atCut, band: noise }, checkersFire, paused, peaks, modelCalls });
}

function finish(v) {
  const isTheBar = !!v.isTheBar;
  const rel = isTheBar ? VERDICT_REL : PARTIAL_REL;
  const out = {
    at: v.at, command: v.command, node: process.version, author: AUTHOR, isTheBar, barMet: isTheBar ? !!v.barMet : false,
    notTheBarBecause: isTheBar ? [] : v.why || [], split: v.split || null,
    statement: v.statement || ('NOT THE BAR: ' + (v.why || []).join('; ')),
    control: v.control || null, noise: v.noise || null, earlier: v.earlier || null, checkersFire: v.checkersFire ?? null, paused: v.paused || null,
    peakRss: v.peaks || { driverMb: r2(peakRss / 1048576) }, modelCalls: v.modelCalls ?? 0, wallMinutes: r2((Date.now() - v.t0) / 60_000),
    bar: 'both resumes ran, the journal grew, no record was repeated, and every cut left the journal parseable',
  };
  writeFileSync(path.join(ROOT, rel), JSON.stringify(out, null, 2) + '\n');
  say('STATEMENT: ' + out.statement);
  say((isTheBar ? (out.barMet ? 'BAR MET' : 'BAR MISSED') : 'NOT THE BAR') + ': ' + rel + ' written (isTheBar ' + isTheBar + ', barMet ' + out.barMet + ', ' + out.wallMinutes + ' min)');
  clearInterval(rssTimer);
  return out;
}

main().then((v) => { process.exitCode = v && v.isTheBar ? 0 : 1; }).catch((e) => { console.error('RESUME BAR threw: ' + (e && e.stack || e)); process.exitCode = 2; });
