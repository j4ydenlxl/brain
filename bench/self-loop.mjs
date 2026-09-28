#!/usr/bin/env node
// bench/self-loop.mjs: THE BAR of self/loop.mjs (board 35 builder, item self-loop).
//
// One tick of the organism filling its own gaps is only worth something if a second tick can say what the first one
// left open, what closed and what is new, and hand every open group to something that can run it. This bench runs the
// CLI twice, as the 05:00 autopilot would on two mornings, into a scratch state dir, and grades every claim with a
// reading of its own:
//   1. the tests (node --test test/self-loop.test.mjs), their tally
//   2. two ticks in a row at the two held-out dates (their seeds are their day numbers), --learn dry, each printing
//      its one LOOP line; the record of each is read back
//   3. the second record names the first as previous
//   4. closed, opened and stayed of the second record equal this bench's own diff of the two misses files (the drawn
//      templates recomputed from self/queries.mjs generate(), not from self/loop.mjs), side by side, with a control:
//      the bench's copy of the second file without one group must differ
//   5. --plant-closed <a group open in the first tick that did not close at the second, by the bench's own diff> prints
//      closed 1 for that group, in dry mode, writing nothing; the control: the same dry tick without the plant closes it 0,
//      and a group never open at tick 1 is refused with its own line
//   6. every gap row of the second tick: its trial resolves through self/gaps.mjs trialOf() to the same command, and
//      runs (bench/gaps.mjs runTrial, the budget wrapper) to exit 0, prints the reading its parser reads, and that reading
//      equals the count the record holds (the same rows at the same seed); the counts are printed
//   7. node self/autopilot.mjs --dry lists the loop candidates, one line each, in the record's rank order
//   7b. the morning: tools/schedule-autopilot.mjs tickArgv() (the 05:00 command) is a soak, and the soak's loop tick plan
//      (self/autopilot.mjs loopTickPlan) runs on a day with no record and not on a ticked day, a dry soak, a planted root
//      or --loop-tick off (that the soak calls it before reading the ledger is graded by the tests)
//   8. sockets 0 across both ticks (each record's count and the stderr refusal lines), with a control: the guard's
//      canary counts a planted connect in the main thread and in a worker
//   9. wrong 0 at both ticks (a wrong exact answer is worse than a refusal)
// Bar met = all of it. The verdict bench/verdicts/self-loop.json is written only when the run is the bar (n 2000, the
// held-out dates, learn dry). MODEL OFF: no provider is ever named; the ticks count their own sockets.
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board35/self-loop -- node --max-old-space-size=4000 bench/self-loop.mjs --state-dir state/board35/self-loop
//   flags: --state-dir DIR (a scratch dir under state/, never state/self), --n N, --dates D1,D2, --learn dry|off, --nowrite
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate } from '../self/queries.mjs';
import { FORMS, trialOf } from '../self/gaps.mjs';
import { runTrial } from './gaps.mjs';
import { GUARD_URL, SOCKET_LINE, seedOfDay } from '../self/loop.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERDICT_REL = 'bench/verdicts/self-loop.json';
export const BAR_N = 2000;
export const BAR_DATES = Object.freeze(['2026-09-26', '2026-09-27']);
/** The held-out rows, fixed before any run at these seeds (also in notes/self-loop.md): sha256 of JSON.stringify(generate({seed, n: 2000})). */
export const HELD_OUT = Object.freeze({
  268: '206bb18053d368dfc5001ce1dee9d120256d538e06d7c7cea638cc0c838e91dc',
  269: '089d2ca9c3d486135b3b3158630b4fd554e60f610a88d5365fa20d3d35ef69f2',
});
/** The seeds asked while self/loop.mjs was built: its smoke runs, its tests and this bench's development runs (dates 2026-01-11 to 2026-01-14). */
export const DEV_SEEDS = Object.freeze([900001, 900002, 900003, 900010, 900011, 900012, 900013, 900014, 10, 11, 12, 13]);
export const SELF_QUERIES_DEV_SEEDS = Object.freeze([7, 8, 9]);
export const FREE_RAM_MB = 8000;
const LOOP_LINE_RE = /^LOOP \d{4}-\d{2}-\d{2}: asked \d+ answered \d+ correct \d+ wrong \d+ refused \d+; groups open \d+ closed \d+ opened \d+; ledger learned before \S+ after \S+; gaps written \d+$/;

const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const byName = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const yes = (b) => (b ? 'yes' : 'NO');
const say = (s) => console.log(s);
const env = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS'));
const runNode = (args, timeoutMs = 20 * 60_000) => spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8', windowsHide: true, timeout: timeoutMs, maxBuffer: 256 * 1024 * 1024, env: env() });
const linesOf = (s) => String(s || '').split(/\r?\n/).filter((l) => l.length);
const freeMb = () => Math.round(os.freemem() / 1048576);
async function waitRam(minMb, maxS = 1800) {
  const t0 = Date.now();
  while (freeMb() < minMb) {
    if (Date.now() - t0 > maxS * 1000) return null;
    await new Promise((r) => setTimeout(r, 5000));
  }
  return Math.round((Date.now() - t0) / 1000);
}
function listing(dir) { return existsSync(dir) ? readdirSync(dir, { recursive: true }).map(String).sort() : []; }

function parseArgs(argv) {
  const a = { stateDir: 'state/board35/self-loop', n: BAR_N, dates: [...BAR_DATES], learn: 'dry', write: true };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const val = () => { const v = argv[++i]; if (v === undefined) throw new Error(k + ' needs a value'); return v; };
    if (k === '--state-dir') a.stateDir = val();
    else if (k === '--n') a.n = Number(val());
    else if (k === '--dates') a.dates = val().split(',').map((s) => s.trim());
    else if (k === '--learn') a.learn = val();
    else if (k === '--nowrite') a.write = false;
    else throw new Error('unknown flag ' + k);
  }
  if (!Number.isInteger(a.n) || a.n < 1) throw new Error('--n must be a positive integer');
  if (a.dates.length !== 2 || !(a.dates[0] < a.dates[1])) throw new Error('--dates takes two dates, the first earlier');
  for (const d of a.dates) seedOfDay(d);
  if (!['dry', 'off'].includes(a.learn)) throw new Error('--learn is dry or off here: the bar never writes what learn() learns');
  const abs = path.resolve(ROOT, a.stateDir);
  const stateRoot = path.join(ROOT, 'state');
  if (!abs.startsWith(stateRoot + path.sep)) throw new Error('--state-dir must be a scratch dir under state/');
  if (abs === path.join(stateRoot, 'self') || abs.startsWith(path.join(stateRoot, 'self') + path.sep)) throw new Error('--state-dir must not be state/self: the bar runs in a scratch dir');
  a.abs = abs;
  return a;
}

/** The group rows of a misses file, by group. */
function groupsIn(file) {
  const m = new Map();
  for (const l of readFileSync(file, 'utf8').split(/\r?\n/)) { if (!l.trim()) continue; const o = JSON.parse(l); if (typeof o.group === 'string') m.set(o.group, o); }
  return m;
}
/** The bench's own diff: written here, not imported from self/loop.mjs. */
function benchDiff(prev, cur, drawn) {
  const closed = [...prev.keys()].filter((g) => drawn.has(g) && !cur.has(g)).sort(byName);
  const opened = [...cur.keys()].filter((g) => !prev.has(g)).sort(byName);
  const stayed = [...cur.keys()].filter((g) => prev.has(g)).sort(byName);
  return { closed, opened, stayed };
}
const same = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

async function main() {
  const t0 = Date.now();
  const a = parseArgs(process.argv.slice(2));
  const loopDir = path.join(a.abs, 'loop'), gapsRoot = path.join(a.abs, 'root');
  const loopRel = path.relative(ROOT, loopDir).split(path.sep).join('/'), gapsRel = path.relative(ROOT, gapsRoot).split(path.sep).join('/');
  const isTheBar = a.n === BAR_N && same(a.dates, BAR_DATES) && a.learn === 'dry';
  const command = 'node bench/self-loop.mjs' + (process.argv.length > 2 ? ' ' + process.argv.slice(2).join(' ') : '');
  say('self-loop bench: ' + command + '; n ' + a.n + ', dates ' + a.dates.join(' and ') + ' (seeds ' + a.dates.map(seedOfDay).join(' and ') + '), learn ' + a.learn + ', state ' + path.relative(ROOT, a.abs).split(path.sep).join('/') + '; free RAM ' + freeMb() + ' MB');
  for (const d of [loopDir, gapsRoot]) rmSync(d, { recursive: true, force: true });
  mkdirSync(loopDir, { recursive: true });

  // 1. the tests (after the free-RAM wait: one heavy bench at a time)
  const waited0 = await waitRam(FREE_RAM_MB);
  if (waited0 === null) throw new Error('free RAM stayed under ' + FREE_RAM_MB + ' MB for 30 minutes');
  const tr = runNode(['--test', 'test/self-loop.test.mjs'], 10 * 60_000);
  const tn = (re) => { const m = String(tr.stdout).match(re); return m ? Number(m[1]) : null; };
  const tests = { exit: tr.status, tests: tn(/^(?:ℹ|#) tests (\d+)/m), pass: tn(/^(?:ℹ|#) pass (\d+)/m), fail: tn(/^(?:ℹ|#) fail (\d+)/m) };
  const testsOk = tests.exit === 0 && tests.fail === 0 && tests.pass > 0 && tests.pass === tests.tests;
  say('tests: node --test test/self-loop.test.mjs exit ' + tests.exit + ', tests ' + tests.tests + ' pass ' + tests.pass + ' fail ' + tests.fail);

  // 2. two ticks
  const ticks = [];
  for (const [i, date] of a.dates.entries()) {
    const waited = await waitRam(FREE_RAM_MB);
    if (waited === null) throw new Error('free RAM stayed under ' + FREE_RAM_MB + ' MB for 30 minutes');
    const s0 = Date.now();
    const r = runNode(['self/loop.mjs', '--date', date, '--n', String(a.n), '--state-dir', loopDir, '--gaps-root', gapsRoot, '--learn', a.learn]);
    const out = linesOf(r.stdout);
    const line = out.find((l) => LOOP_LINE_RE.test(l)) || null;
    const socketLines = linesOf(r.stderr).filter((l) => l.startsWith(SOCKET_LINE)).length;
    const recFile = path.join(loopDir, date + '.json');
    const rec = existsSync(recFile) ? JSON.parse(readFileSync(recFile, 'utf8')) : null;
    ticks.push({ date, exit: r.status, line, out, socketLines, rec, ms: Date.now() - s0, stderrHead: linesOf(r.stderr).slice(0, 3) });
    say('tick ' + (i + 1) + ' (date ' + date + ', seed ' + (rec ? rec.seed : '?') + '): exit ' + r.status + ', ' + (Date.now() - s0) + ' ms, free RAM wait ' + waited + ' s');
    for (const l of out) say('  | ' + l);
    if (r.status !== 0) for (const l of linesOf(r.stderr).slice(0, 5)) say('  ! ' + l);
  }
  const [k1, k2] = ticks;
  const ticksOk = ticks.every((t) => t.exit === 0 && t.line && t.rec && t.rec.line === t.line && t.rec.dry === false);
  say('ticks: both exit 0 ' + yes(ticks.every((t) => t.exit === 0)) + ', each printed its LOOP line ' + yes(ticks.every((t) => t.line)) + ', each record holds the printed line ' + yes(ticks.every((t) => t.rec && t.rec.line === t.line)));
  if (!k1.rec || !k2.rec) throw new Error('a tick wrote no record: ' + ticks.map((t) => t.date + ' exit ' + t.exit + ' ' + t.stderrHead.join(' | ')).join('; '));
  const r1 = k1.rec, r2 = k2.rec;
  for (const [i, r] of [r1, r2].entries()) {
    const L = r.ledger || {};
    const fmt = (x) => (x && Number.isFinite(x.learned) ? 'asked ' + x.asked + ' learned ' + x.learned + ' fixed ' + x.fixed + ' refused ' + x.refused + ' wrong now ' + x.wrongNow : JSON.stringify(x));
    say('tick ' + (i + 1) + ' ledger: before ' + fmt(L.before) + '; learn ' + (L.learn && L.learn.ran ? 'ran dry ' + L.learn.dry + ', kept ' + L.learn.kept + ', tried ' + L.learn.tried + ', shapes ' + L.learn.shapes + ', ' + L.learn.ms + ' ms' : 'skipped (' + (L.learn && L.learn.reason) + ')') + '; after ' + fmt(L.after));
    say('tick ' + (i + 1) + ' queries: asked ' + r.queries.asked + ' answered ' + r.queries.answered + ' correct ' + r.queries.correct + ' wrong ' + r.queries.wrong + ' refused ' + r.queries.refused + '; controls failed ' + (r.queries.controls && r.queries.controls.failed) + ' of ' + (r.queries.controls && r.queries.controls.checks) + ' checks; second opinion disagree ' + (r.queries.secondOpinion && r.queries.secondOpinion.disagree) + '; self test ' + r.queries.selfTest + '; groups drawn ' + r.groups.drawn + ' open ' + r.groups.counts.open);
  }

  // 3. previous
  const prevOk = r1.previous === null && r2.previous === a.dates[0] + '.json' && r2.previousSeed === r1.seed;
  say('previous: tick 2 names ' + r2.previous + ' (seed ' + r2.previousSeed + '), tick 1 names ' + r1.previous + ': ' + yes(prevOk));

  // 4. the independent diff
  const m1 = groupsIn(path.join(loopDir, a.dates[0] + '-misses.jsonl')), m2 = groupsIn(path.join(loopDir, a.dates[1] + '-misses.jsonl'));
  const drawn2 = new Set(generate({ seed: r2.seed, n: a.n }).map((r) => r.template));
  const bd = benchDiff(m1, m2, drawn2);
  const rows = ['closed', 'opened', 'stayed'].map((k) => ({ k, loop: r2.groups[k], bench: bd[k], equal: same(r2.groups[k], bd[k]) }));
  say('diff of the two misses files      loop  bench  names equal');
  for (const x of rows) say('  ' + x.k.padEnd(32) + String(x.loop.length).padStart(5) + String(x.bench.length).padStart(7) + '  ' + yes(x.equal));
  const sum2 = [...m2.values()].reduce((s, g) => s + g.count, 0);
  say('  misses file 2: ' + m2.size + ' group rows holding ' + sum2 + ' rows; tick 2 wrong plus refused ' + (r2.queries.wrong + r2.queries.refused) + '; drawn templates loop ' + r2.groups.drawn + ', bench ' + drawn2.size);
  const pick = [...m2.keys()][0];
  let control = null;
  if (pick) {
    const m2c = new Map(m2); m2c.delete(pick);
    const c = benchDiff(m1, m2c, drawn2);
    const differs = !(same(c.closed, r2.groups.closed) && same(c.opened, r2.groups.opened) && same(c.stayed, r2.groups.stayed));
    control = { dropped: pick, closed: c.closed.length, opened: c.opened.length, stayed: c.stayed.length, differs };
    say('  control: the bench copy of misses file 2 without ' + pick + ': closed ' + c.closed.length + ' opened ' + c.opened.length + ' stayed ' + c.stayed.length + '; differs from the loop ' + yes(differs));
  } else say('  control: misses file 2 holds no group, nothing to drop');
  const diffOk = rows.every((x) => x.equal) && sum2 === r2.queries.wrong + r2.queries.refused && drawn2.size === r2.groups.drawn && !!control && control.differs;

  // 5. the plant
  // a group open in tick 1 that did NOT close at tick 2, chosen from the bench's own diff (stayed first, then open at
  // tick 1 and not drawn at tick 2), never one that closed anyway: a plant on a group that closes without it proves
  // nothing. The same dry command WITHOUT the plant is run too (the control), and must not close the group.
  const undrawnBench = [...m1.keys()].filter((g) => !drawn2.has(g)).sort(byName);
  const plantGroup = bd.stayed[0] || undrawnBench[0] || null;
  let plant = { group: plantGroup, ok: false, reason: plantGroup ? null : 'no group of tick 1 stayed open or went undrawn at tick 2: nothing a plant could move' };
  if (plantGroup) {
    const before = listing(a.abs);
    const pr = runNode(['self/loop.mjs', '--dry', '--date', a.dates[1], '--n', String(a.n), '--state-dir', loopDir, '--gaps-root', gapsRoot, '--no-reask', '--plant-closed', plantGroup]);
    const pl = linesOf(pr.stdout);
    const pline = pl.find((l) => l.startsWith('LOOP plant: ')) || null;
    const m = pline ? pline.match(/closed (\d+) for (\S+)$/) : null;
    // the control: the same dry tick without the plant, read from its own --json record
    const nr = runNode(['self/loop.mjs', '--dry', '--json', '--date', a.dates[1], '--n', String(a.n), '--state-dir', loopDir, '--gaps-root', gapsRoot, '--no-reask']);
    let nrec = null; try { nrec = JSON.parse(nr.stdout); } catch { nrec = null; }
    const closedWithout = nrec && nrec.groups && Array.isArray(nrec.groups.closed) ? (nrec.groups.closed.includes(plantGroup) ? 1 : 0) : null;
    const wroteNothing = same(listing(a.abs), before);
    const socketLines = linesOf(pr.stderr).filter((l) => l.startsWith(SOCKET_LINE)).length + linesOf(nr.stderr).filter((l) => l.startsWith(SOCKET_LINE)).length;
    const was = bd.stayed.includes(plantGroup) ? 'stayed' : 'undrawn';
    plant = { group: plantGroup, exit: pr.status, line: pline, loopLine: pl.find((l) => LOOP_LINE_RE.test(l)) || null, closedFor: m ? Number(m[1]) : null, forGroup: m ? m[2] : null, wroteNothing, socketLines, withoutPlant: was, controlExit: nr.status, closedWithout, movedAnOutcome: closedWithout === 0 && (m ? Number(m[1]) : null) === 1 };
    say('plant: node self/loop.mjs --dry --date ' + a.dates[1] + ' --no-reask --plant-closed ' + plantGroup + ': exit ' + pr.status);
    for (const l of pl) say('  | ' + l);
    say('  control: the same dry tick without the plant (exit ' + nr.status + '): closed ' + closedWithout + ' for ' + plantGroup + ' (the bench diff has it ' + was + '); the plant moved the outcome ' + yes(plant.movedAnOutcome));
    // control: a group drawn at tick 2 that was never open at tick 1 must be refused (exit 1), writing nothing
    const never = [...drawn2].filter((g) => !m1.has(g)).sort(byName)[0] || null;
    let refusal = null;
    if (never) {
      const cr = runNode(['self/loop.mjs', '--dry', '--date', a.dates[1], '--n', String(a.n), '--state-dir', loopDir, '--gaps-root', gapsRoot, '--no-reask', '--plant-closed', never]);
      refusal = { group: never, exit: cr.status, said: linesOf(cr.stderr).find((l) => /not open in the previous record/.test(l)) || null, printedLoopLine: linesOf(cr.stdout).some((l) => LOOP_LINE_RE.test(l)) };
      refusal.ok = cr.status === 1 && !!refusal.said && !refusal.printedLoopLine;
    }
    plant.refusal = refusal;
    plant.wroteNothing = wroteNothing && same(listing(a.abs), before);
    plant.ok = pr.status === 0 && plant.closedFor === 1 && plant.forGroup === plantGroup && !!plant.loopLine && plant.wroteNothing && !!refusal && refusal.ok && nr.status === 0 && plant.movedAnOutcome;
    say('  closed ' + plant.closedFor + ' for ' + plant.forGroup + ' (the bench diff of tick 2 has it ' + was + ', the dry tick without the plant closed ' + plant.closedWithout + '); dry wrote nothing ' + yes(plant.wroteNothing)
      + '; control: --plant-closed ' + (refusal ? refusal.group + ' (never open at tick 1) exit ' + refusal.exit + ', refused ' + yes(refusal.ok) : 'none: every drawn group was open at tick 1') + ': ' + yes(plant.ok));
  } else say('plant: ' + plant.reason + ': NO');

  // 6. every gap row's trial
  const gapRows = Array.isArray(r2.gapRows) ? r2.gapRows : [];
  const tri = { rows: gapRows.length, resolved: 0, exit0: 0, printed: 0, agree: 0, seconds: 0, failed: [] };
  for (const [i, g] of gapRows.entries()) {
    const key = g.trial && g.trial.key;
    const t = key && FORMS[key] ? trialOf(key, { ...FORMS[key], argv: g.trial.argv }) : null;
    const resolves = !!t && t.command === g.trial.command && existsSync(path.join(ROOT, t.bench));
    if (resolves) tri.resolved++;
    await waitRam(FREE_RAM_MB);
    const run = await runTrial(g.trial, { root: ROOT, freeRamMb: FREE_RAM_MB, log: () => {} });
    const ok0 = run.completed && run.exitCode === 0;
    if (ok0) tri.exit0++; else tri.failed.push(g.group + ': ' + run.firstLine);
    if (run.printedMetric) tri.printed++;
    if (run.metric === g.measured) tri.agree++;
    tri.seconds += run.seconds || 0;
    say('  trial ' + (i + 1) + '/' + gapRows.length + ' ' + g.group + ': resolves ' + yes(resolves) + ', exit ' + run.exitCode + ', read ' + run.metric + ' (record ' + g.measured + '), ' + run.seconds + ' s');
  }
  tri.seconds = Math.round(tri.seconds * 1000) / 1000;
  // exit 0 is not enough: every trial must print the reading its parser reads, and at the tick's own seed and n that
  // reading must equal the count the record holds (the same rows asked again, model off)
  const trialsOk = tri.rows > 0 && tri.resolved === tri.rows && tri.exit0 === tri.rows && tri.printed === tri.rows && tri.agree === tri.rows;
  say('trials: ' + tri.rows + ' gap rows of tick 2, resolved through trialOf() ' + tri.resolved + ', exit 0 ' + tri.exit0 + ', printed a reading ' + tri.printed + ', reading equal to the record ' + tri.agree + ', ' + tri.seconds + ' s');

  // 7. the autopilot lists them
  const ap = runNode(['self/autopilot.mjs', '--dry', '--loop-dir', loopDir], 5 * 60_000);
  const apLines = linesOf(ap.stdout);
  const shown = apLines.filter((l) => /^self-code autopilot --dry: |^ {2}loop: |^ {2}loop tick: |^ {2}LOOP CANDIDATE /.test(l));
  say('autopilot: node self/autopilot.mjs --dry --loop-dir ' + loopRel + ': exit ' + ap.status);
  for (const l of shown) say('  | ' + l);
  const cands = apLines.filter((l) => l.startsWith('  LOOP CANDIDATE ')).map((l) => l.match(/^ {2}LOOP CANDIDATE \d+ loop:(\S+) count (\d+) .* (\S+): node /) || []).map((m) => ({ group: m[1], count: Number(m[2]), decision: m[3] }));
  const wantOrder = r2.groups.open.filter((o) => gapRows.some((g) => g.group === o.group)).slice().sort((x, y) => y.count - x.count).map((o) => o.group);
  const apOk = ap.status === 0 && cands.length === wantOrder.length && cands.length > 0 && same(cands.map((c) => c.group), wantOrder) && cands.every((c) => c.decision === 'WOULD-RUN-TRIAL');
  say('  loop candidates listed ' + cands.length + ' of ' + wantOrder.length + ' open groups with a trial, in rank order ' + yes(same(cands.map((c) => c.group), wantOrder)) + ', each WOULD-RUN-TRIAL ' + yes(cands.length > 0 && cands.every((c) => c.decision === 'WOULD-RUN-TRIAL')));

  // 7b. the morning: the 05:00 BrainAutopilot command is a soak, and a soak runs the loop tick before it reads the
  // ledger when today has no record (self/autopilot.mjs loopTickPlan; the soak's call order is graded by the tests)
  const SA = await import('../tools/schedule-autopilot.mjs');
  const AP = await import('../self/autopilot.mjs');
  const morningArgv = SA.tickArgv();
  const isSoak = morningArgv.includes('self-code') && morningArgv.includes('--auto') && morningArgv.includes('--soak');
  const at5 = (d) => { const [y, m, dd] = d.split('-').map(Number); return new Date(y, m - 1, dd, 5, 0, 0); };
  const nextDay = (d) => { const t = at5(d); t.setDate(t.getDate() + 1); return t; };
  const plans = {
    ticked: AP.loopTickPlan({ root: ROOT, dir: loopDir, now: at5(a.dates[1]) }),
    fresh: AP.loopTickPlan({ root: ROOT, dir: loopDir, now: nextDay(a.dates[1]) }),
    dry: AP.loopTickPlan({ root: ROOT, dir: loopDir, now: nextDay(a.dates[1]), dry: true }),
    planted: AP.loopTickPlan({ root: a.abs, now: nextDay(a.dates[1]) }),
    off: AP.loopTickPlan({ root: ROOT, dir: loopDir, now: nextDay(a.dates[1]), off: true }),
  };
  const morningOk = isSoak && plans.ticked.run === false && plans.fresh.run === true && plans.dry.run === false && plans.planted.run === false && plans.off.run === false;
  say('morning: the 05:00 command node ' + morningArgv.join(' ') + ' is a soak ' + yes(isSoak) + '; the soak loop tick on this tree: ' + Object.entries(plans).map(([k, p]) => k + ' ' + p.date + ' run ' + p.run + ' (' + p.why + ')').join('; ') + ': ' + yes(morningOk));

  // 8. sockets, and the guard's canary
  const sk = (r) => r.sockets || {};
  const socketsTotal = (sk(r1).total || 0) + (sk(r2).total || 0) + k1.socketLines + k2.socketLines + (plant.socketLines || 0);
  const canarySrc = [
    "import net from 'node:net';", "import { Worker } from 'node:worker_threads';",
    "try { net.connect(9, '127.0.0.1'); } catch {}",
    "const w = new Worker(\"const net = process.getBuiltinModule('node:net'); try { net.connect(9, '127.0.0.1'); } catch {}\", { eval: true });",
    "await new Promise((r) => w.on('exit', r)); await new Promise((r) => setTimeout(r, 50));",
    "console.log(JSON.stringify({ main: globalThis.__BRAIN_LOOP_GUARD.main, workers: globalThis.__BRAIN_LOOP_GUARD.workers }));",
  ].join('\n');
  const cr = runNode(['--import', GUARD_URL, '--input-type=module', '-e', canarySrc], 60_000);
  let canary = null; try { canary = JSON.parse(linesOf(cr.stdout).pop()); } catch { canary = null; }
  const canaryLines = linesOf(cr.stderr).filter((l) => l.startsWith(SOCKET_LINE)).length;
  const canaryOk = !!canary && canary.main === 1 && canary.workers === 1 && canaryLines === 2;
  say('sockets: tick 1 ' + sk(r1).total + ' (main ' + sk(r1).main + ', workers ' + sk(r1).workers + ', self-queries ' + sk(r1).selfQueries + ', learn ' + sk(r1).learn + '), tick 2 ' + sk(r2).total + ' (main ' + sk(r2).main + ', workers ' + sk(r2).workers + ', self-queries ' + sk(r2).selfQueries + ', learn ' + sk(r2).learn + '), stderr refusal lines ' + (k1.socketLines + k2.socketLines + (plant.socketLines || 0)) + '; total ' + socketsTotal);
  say('  control: the guard canary counted a planted connect main ' + (canary && canary.main) + ' workers ' + (canary && canary.workers) + ' with ' + canaryLines + ' refusal lines: ' + yes(canaryOk));

  // 9. wrong
  const wrong = [r1.queries.wrong, r2.queries.wrong];
  const controlsOk = [r1, r2].every((r) => r.queries.controls && r.queries.controls.failed === 0 && r.queries.secondOpinion && r.queries.secondOpinion.disagree === 0);
  say('wrong: tick 1 ' + wrong[0] + ', tick 2 ' + wrong[1] + '; the self-queries controls held at both ticks ' + yes(controlsOk));

  // the split
  const heldSeeds = a.dates.map(seedOfDay);
  const shaNow = Object.fromEntries(heldSeeds.map((s) => [s, sha256(JSON.stringify(generate({ seed: s, n: a.n })))]));
  const overlap = heldSeeds.filter((s) => DEV_SEEDS.includes(s) || SELF_QUERIES_DEV_SEEDS.includes(s));
  const shaMatch = isTheBar ? heldSeeds.every((s) => HELD_OUT[s] === shaNow[s]) : null;
  const contaminated = overlap.length ? 'held-out seeds also asked in development: ' + overlap.join(', ') : shaMatch === false ? 'the generated rows at a held-out seed changed since notes/self-loop.md declared them' : false;
  say('split: development seeds ' + DEV_SEEDS.join(', ') + ' (self-queries dev seeds ' + SELF_QUERIES_DEV_SEEDS.join(', ') + '); held out ' + heldSeeds.join(', ') + ' at n ' + a.n + ', rows sha256 equal to the declared ' + (shaMatch === null ? 'n/a (not the bar)' : yes(shaMatch)) + '; contaminated ' + contaminated);

  const barMet = testsOk && ticksOk && prevOk && diffOk && plant.ok && trialsOk && apOk && morningOk && socketsTotal === 0 && canaryOk && wrong.every((w) => w === 0) && controlsOk && contaminated === false;
  const wallS = Math.round((Date.now() - t0) / 100) / 10;
  const statement = 'Two ticks of self/loop.mjs at ' + a.dates.join(' and ') + ' (seeds ' + heldSeeds.join(' and ') + ', n ' + a.n + ', learn ' + a.learn + ') asked ' + r1.queries.asked + ' and ' + r2.queries.asked + ' questions, wrong ' + wrong.join(' and ') + ', refused ' + r1.queries.refused + ' and ' + r2.queries.refused
    + '; tick 2 named tick 1 as previous and its diff (closed ' + r2.groups.closed.length + ', opened ' + r2.groups.opened.length + ', stayed ' + r2.groups.stayed.length + ') equalled the bench\'s own diff of the two misses files'
    + '; --plant-closed ' + plant.group + ' printed closed ' + plant.closedFor + ' for it and the same dry tick without the plant closed ' + plant.closedWithout + '; ' + tri.exit0 + ' of ' + tri.rows + ' gap-row trials exited 0 and ' + tri.agree + ' read the count their record holds; the autopilot listed ' + cands.length + ' loop candidates; the 05:00 command is a soak ' + isSoak + ' and its loop tick plan held ' + morningOk + '; sockets ' + socketsTotal + '; tests ' + tests.pass + ' of ' + tests.tests + '.';
  const verdict = {
    at: new Date().toISOString(), command: 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir ' + path.relative(ROOT, a.abs).split(path.sep).join('/') + ' -- node --max-old-space-size=4000 ' + command.slice(5),
    isTheBar, barMet, author: 'board 35 builder (item self-loop)',
    split: { development: { seeds: DEV_SEEDS, selfQueriesDevSeeds: SELF_QUERIES_DEV_SEEDS, what: 'the seeds self/loop.mjs, its tests and its smoke runs asked while it was built' }, heldOut: { dates: a.dates, seeds: heldSeeds, n: a.n, rowsSha256: shaNow, declared: 'bench/self-loop.mjs HELD_OUT and notes/self-loop.md, fixed before any run at these seeds', matchesDeclared: shaMatch }, contaminated },
    statement, wallS,
    tests, ticks: ticks.map((t) => ({ date: t.date, seed: t.rec ? t.rec.seed : null, exit: t.exit, ms: t.ms, line: t.line, socketLines: t.socketLines, record: loopRel + '/' + t.date + '.json' })),
    queries: [r1.queries, r2.queries], ledger: [r1.ledger, r2.ledger],
    previous: { tick2: r2.previous, tick1: r1.previous, ok: prevOk },
    diff: { rows: rows.map((x) => ({ name: x.k, loop: x.loop.length, bench: x.bench.length, equal: x.equal })), missesRows: sum2, wrongPlusRefused: r2.queries.wrong + r2.queries.refused, drawnLoop: r2.groups.drawn, drawnBench: drawn2.size, undrawn: r2.groups.undrawn.length, control, ok: diffOk },
    plant, trials: tri, autopilot: { exit: ap.status, lines: shown, listed: cands.length, wanted: wantOrder.length, ok: apOk },
    morning: { command: 'node ' + morningArgv.join(' '), isSoak, plans, ok: morningOk },
    sockets: { total: socketsTotal, tick1: sk(r1), tick2: sk(r2), stderrLines: k1.socketLines + k2.socketLines + (plant.socketLines || 0), canary: { ...canary, lines: canaryLines, ok: canaryOk } },
    wrong: { tick1: wrong[0], tick2: wrong[1] }, controlsHeld: controlsOk, gapsFile: gapsRel + '/state/self/gaps.jsonl',
  };
  say('BAR self-loop: barMet ' + barMet + ' (tests ' + testsOk + ', ticks ' + ticksOk + ', previous ' + prevOk + ', diff ' + diffOk + ', plant ' + plant.ok + ', trials ' + trialsOk + ', autopilot ' + apOk + ', morning ' + morningOk + ', sockets ' + socketsTotal + ', canary ' + canaryOk + ', wrong ' + wrong.join('/') + ', controls ' + controlsOk + ', contaminated ' + contaminated + '); ' + wallS + ' s');
  say('statement: ' + statement);
  if (isTheBar && a.write) {
    const f = path.join(ROOT, ...VERDICT_REL.split('/'));
    writeFileSync(f + '.tmp', JSON.stringify(verdict, null, 1) + '\n'); renameSync(f + '.tmp', f);
    say('verdict ' + VERDICT_REL + ' written (isTheBar true, barMet ' + barMet + ')');
  } else say('verdict not written (' + (isTheBar ? '--nowrite' : 'not the bar: n ' + a.n + ', dates ' + a.dates.join(',') + ', learn ' + a.learn) + ')');
  return barMet ? 0 : 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }, (e) => { console.error('bench/self-loop.mjs: ' + String((e && e.stack) || e).split('\n').slice(0, 3).join(' | ')); process.exitCode = 1; });
}
