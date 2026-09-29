// test/self-loop.test.mjs: self/loop.mjs, one tick of the organism filling its own gaps (board 35 builder, item self-loop).
// Every test runs on planted data or a temp dir; none asks the self-queries held-out seeds (34, 35, 40, 41) or the bar's (268, 269).
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readdirSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as L from '../self/loop.mjs';
import * as G from '../self/gaps.mjs';
import * as A from '../self/autopilot.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = (tag) => mkdtempSync(path.join(tmpdir(), 'self-loop-' + tag + '-'));
const listAll = (d) => (existsSync(d) ? readdirSync(d, { recursive: true }).map(String).sort() : null);

const grp = (group, kind, asked, wrong, refused) => ({ group, kind, asked, count: wrong + refused, wrong, refused });
// two planted ticks: A stays, B closes, C opens, D was open and is not drawn now (undrawn), E is drawn and was never open
const PREV = [grp('calendar.a', 'calendar', 5, 0, 4), grp('comparison.b', 'comparison', 3, 1, 1), grp('units.d', 'units', 2, 0, 2)];
const CUR = [grp('calendar.a', 'calendar', 6, 0, 3), grp('probability.c', 'probability', 4, 0, 4)];
const DRAWN_NOW = ['calendar.a', 'comparison.b', 'probability.c', 'spelling.e'];

/** A fake self-queries verdict (the shape bench/self-queries.mjs run() returns) from open groups and drawn templates. */
function fakeVerdict(open, drawn) {
  const byTemplate = {};
  for (const t of drawn) byTemplate[t] = { asked: 2, answered: 2, correct: 2, wrong: 0, refused: 0, kind: t.split('.')[0] };
  for (const g of open) byTemplate[g.group] = { asked: g.asked, answered: g.asked - g.refused, correct: g.asked - g.count, wrong: g.wrong, refused: g.refused, kind: g.kind };
  const T = { asked: 0, answered: 0, correct: 0, wrong: 0, refused: 0 };
  for (const c of Object.values(byTemplate)) for (const k of Object.keys(T)) T[k] += c[k];
  return { totals: T, byTemplate, wrongRows: [], sockets: 0, controls: { checks: 9, failed: 0 }, secondOpinion: { agree: 1, disagree: 0, none: 0 }, selfTest: { tally: '1/1', ok: true } };
}

test('the diff on planted misses files: closed, opened and stayed exact, undrawn apart', () => {
  const d = tmp('diff');
  try {
    const f1 = path.join(d, '2026-01-02-misses.jsonl'), f2 = path.join(d, '2026-01-03-misses.jsonl');
    writeFileSync(f1, L.missesLines({ open: PREV, seed: 1, n: 10 }).join('\n') + '\n');
    writeFileSync(f2, L.missesLines({ open: CUR, wrongRows: [{ template: 'x', id: 'x.1', prompt: 'p', truth: 1, candidate: 2 }], seed: 2, n: 10 }).join('\n') + '\n');
    const m1 = L.readMisses(readFileSync(f1, 'utf8')), m2 = L.readMisses(readFileSync(f2, 'utf8'));
    assert.deepEqual([...m1.groups.keys()], ['calendar.a', 'comparison.b', 'units.d'], 'group rows come back ranked');
    assert.equal(m2.wrong.length, 1, 'the wrong row is read apart from the group rows');
    const diff = L.diffGroups([...m1.groups.keys()], [...m2.groups.keys()], DRAWN_NOW);
    assert.deepEqual(diff.closed, ['comparison.b']);
    assert.deepEqual(diff.opened, ['probability.c']);
    assert.deepEqual(diff.stayed, ['calendar.a']);
    assert.deepEqual(diff.undrawn, ['units.d'], 'a group not drawn now is neither closed nor stayed');
    assert.deepEqual(diff.counts, { closed: 1, opened: 1, stayed: 1, undrawn: 1 });
    // control: had units.d been drawn and answered, it would close; the diff reads drawn, not only the two files
    assert.deepEqual(L.diffGroups([...m1.groups.keys()], [...m2.groups.keys()], [...DRAWN_NOW, 'units.d']).closed, ['comparison.b', 'units.d']);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('the seed of the day is deterministic for a planted date and refuses a malformed one', () => {
  assert.equal(L.seedOfDay('2026-01-01'), 0);
  assert.equal(L.seedOfDay('2026-03-01'), 59);
  assert.equal(L.seedOfDay('2026-09-28'), 270);
  assert.equal(L.seedOfDay('2026-09-28'), L.seedOfDay('2026-09-28'));
  assert.equal(L.seedOfDay('2027-01-01'), 365);
  assert.throws(() => L.seedOfDay('2026-02-30'), /no such day/);
  assert.throws(() => L.seedOfDay('2025-12-31'), /before/);
  assert.throws(() => L.seedOfDay('26-1-1'), /YYYY-MM-DD/);
  assert.match(L.todayOf(new Date(2026, 8, 28, 5, 0)), /^2026-09-28$/);
  assert.equal(L.parseArgs(['--date', '2026-09-28']).date, '2026-09-28');
  assert.throws(() => L.parseArgs(['--learn', 'maybe']), /--learn/);
});

test('dry mode writes nothing: an in-process tick and the CLI', async () => {
  const d = tmp('dry');
  try {
    const state = path.join(d, 'loop'), groot = path.join(d, 'root');
    mkdirSync(state, { recursive: true });
    writeFileSync(path.join(state, '2026-01-02.json'), JSON.stringify({ kind: L.RECORD_KIND, date: '2026-01-02', seed: 1, groups: { open: PREV } }));
    const before = listAll(d);
    const r = await L.tick({ dry: true, date: '2026-01-03', seed: 900010, n: 10, stateDir: state, gapsRoot: groot, reask: false, runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) });
    assert.deepEqual(listAll(d), before, 'no record, no misses file, no ledger');
    assert.equal(r.previous, '2026-01-02.json');
    assert.match(r.line, /^LOOP 2026-01-03: asked \d+ answered \d+ correct \d+ wrong 0 refused \d+; groups open 2 closed 1 opened 1; ledger learned before n\/a after n\/a; gaps written 0$/);
    // the CLI, at a development seed, small n
    const c = spawnSync(process.execPath, ['self/loop.mjs', '--dry', '--n', '40', '--seed', '900003', '--date', '2026-01-04', '--state-dir', state, '--gaps-root', groot, '--no-reask', '--no-selftest'], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
    assert.equal(c.status, 0, c.stderr);
    assert.match(c.stdout, /^LOOP 2026-01-04: asked 40 answered \d+ correct \d+ wrong \d+ refused \d+; groups open \d+ closed \d+ opened \d+; ledger learned before n\/a after n\/a; gaps written 0\r?$/m);
    assert.deepEqual(listAll(d), before, 'the CLI in dry mode wrote nothing');
    assert.doesNotMatch(c.stderr, new RegExp(L.SOCKET_LINE));
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('a live tick writes its record, names the previous one, and a gap row has kind, trial and files', async () => {
  const d = tmp('live');
  try {
    const state = path.join(d, 'loop'), groot = path.join(d, 'root');
    const t1 = await L.tick({ date: '2026-01-02', seed: 900011, n: 10, stateDir: state, gapsRoot: groot, reask: false, runQueries: async () => fakeVerdict(PREV, ['calendar.a', 'comparison.b', 'units.d']) });
    const t2 = await L.tick({ date: '2026-01-03', seed: 900012, n: 10, stateDir: state, gapsRoot: groot, reask: false, runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) });
    assert.equal(t1.previous, null);
    assert.equal(t2.previous, '2026-01-02.json');
    assert.deepEqual([t2.groups.closed, t2.groups.opened, t2.groups.stayed], [['comparison.b'], ['probability.c'], ['calendar.a']]);
    assert.ok(existsSync(path.join(state, '2026-01-03.json')) && existsSync(path.join(state, '2026-01-03-misses.jsonl')));
    const ledger = G.readLedger(groot);
    const rows = ledger.lines.filter((l) => l.kind === L.GAP_KIND);
    assert.deepEqual(rows.map((r) => r.group), ['probability.c', 'calendar.a'], 'the second tick replaced the first tick\'s loop rows, ranked by count');
    assert.ok(ledger.lines.length > rows.length, 'the rest of the ledger was rebuilt beside them');
    for (const g of rows) {
      assert.equal(g.kind, 'self-query group');
      assert.equal(g.subsystem, 'act');
      assert.equal(g.bar, 0); assert.equal(g.barWrong, 0); assert.equal(g.barRefused, 0);
      assert.equal(g.measured, g.measuredWrong + g.measuredRefused);
      assert.ok(g.trial && g.trial.key === L.FORM_KEY, 'a trial');
      assert.match(g.trial.command, new RegExp('--seed 900012 --group ' + g.group.replace('.', '\\.') + '$'));
      assert.ok(Array.isArray(g.files) && g.files.length > 0, 'files');
      for (const f of g.files) assert.ok(existsSync(path.join(ROOT, f)), f + ' exists');
    }
    const rec = JSON.parse(readFileSync(path.join(state, '2026-01-03.json'), 'utf8'));
    assert.equal(rec.gaps.written, 2);
    assert.match(rec.line, /; gaps written 2$/);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('the plant: a group open before, planted answered now, prints closed 1; a group not open before is refused', async () => {
  const d = tmp('plant');
  try {
    const state = path.join(d, 'loop');
    mkdirSync(state, { recursive: true });
    writeFileSync(path.join(state, '2026-01-02.json'), JSON.stringify({ kind: L.RECORD_KIND, date: '2026-01-02', seed: 1, groups: { open: PREV } }));
    const lines = [];
    const r = await L.tick({ dry: true, date: '2026-01-03', seed: 900013, n: 10, stateDir: state, reask: false, plantClosed: 'calendar.a', log: (s) => lines.push(s), runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) });
    assert.ok(r.groups.closed.includes('calendar.a'));
    assert.equal(r.plant.closedForGroup, 1);
    assert.ok(lines.some((l) => /closed 1 for calendar\.a$/.test(l)), lines.join('\n'));
    // control: without the plant the same data keeps calendar.a stayed
    const r0 = await L.tick({ dry: true, date: '2026-01-03', seed: 900013, n: 10, stateDir: state, reask: false, runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) });
    assert.deepEqual(r0.groups.stayed, ['calendar.a']);
    await assert.rejects(L.tick({ dry: true, date: '2026-01-03', seed: 900013, n: 10, stateDir: state, reask: false, plantClosed: 'spelling.e', runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) }), /not open in the previous record/);
    await assert.rejects(L.tick({ dry: true, date: '2026-01-03', seed: 34, n: 10, stateDir: state, reask: false, runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) }), /held-out seed/);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('the FORMS entry resolves via trialOf() to an existing bench file, and its parser reads the SELECTED line', () => {
  const t = G.trialOf(L.FORM_KEY);
  assert.equal(t.bench, 'bench/self-queries.mjs');
  assert.ok(existsSync(path.join(ROOT, t.bench)));
  assert.ok(t.argv.includes(t.bench), 'the argv runs that bench');
  assert.equal(t.needsModel, false);
  assert.deepEqual(t.writes, []);
  assert.match(t.command, /^node tools\/budget\.mjs .* -- node --max-old-space-size=4000 bench\/self-queries\.mjs --n 2000 --nowrite$/);
  const p = G.PARSERS[t.parser];
  assert.ok(p && p.stdout);
  assert.equal(p.read('x\nSELECTED group a.b asked 5 answered 3 correct 3 wrong 1 refused 2\n'), 3);
  assert.equal(p.read('SELECTED group a.b asked 0 answered 0 correct 0 wrong 0 refused 0\r\n'), null, 'a group never drawn reads nothing, not 0');
  assert.equal(p.read('total asked 5 answered 3 correct 3 wrong 1 refused 2\n'), null, 'only the SELECTED line is read');
});

test('the model-off guard counts a planted connect in the main thread and in a worker (the control can fail)', () => {
  const src = [
    "import net from 'node:net';",
    "import { Worker } from 'node:worker_threads';",
    "try { net.connect(9, '127.0.0.1'); } catch {}",
    "const w = new Worker(\"const net = process.getBuiltinModule('node:net'); try { net.connect(9, '127.0.0.1'); } catch {}\", { eval: true });",
    "await new Promise((r) => w.on('exit', r));",
    "await new Promise((r) => setTimeout(r, 50));",
    "console.log(JSON.stringify({ main: globalThis.__BRAIN_LOOP_GUARD.main, workers: globalThis.__BRAIN_LOOP_GUARD.workers }));",
  ].join('\n');
  const r = spawnSync(process.execPath, ['--import', L.GUARD_URL, '--input-type=module', '-e', src], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(r.stdout.trim().split(/\r?\n/).pop()), { main: 1, workers: 1 });
  assert.equal(r.stderr.split(/\r?\n/).filter((l) => l.startsWith(L.SOCKET_LINE)).length, 2);
});

test('the autopilot loop source: guarded without a record, ranked by count with one, dry would-run-trial, one trial per run', async () => {
  const d = tmp('ap');
  try {
    const none = A.loopCandidates({ root: d });
    assert.equal(none.read, false);
    assert.equal(none.candidates.length, 0);
    const col0 = A.collectCandidates({ root: d, run: false, sources: ['loop'] });
    assert.equal(col0.candidates.length, 0, 'no record, no candidate');
    const state = path.join(d, 'state', 'self', 'loop');
    await L.tick({ date: '2026-01-02', seed: 900014, n: 10, root: d, stateDir: state, gapsRoot: path.join(d, 'g'), reask: false, runQueries: async () => fakeVerdict([grp('units.z', 'units', 2, 0, 1), ...PREV], []) });
    const got = A.loopCandidates({ root: d });
    assert.deepEqual(got.candidates.map((c) => [c.key, c.count]), [['loop:calendar.a', 4], ['loop:comparison.b', 2], ['loop:units.d', 2], ['loop:units.z', 1]]);
    assert.ok(got.candidates.every((c) => c.source === A.LOOP_SOURCE && c.trial && c.trial.command.includes('--group ' + c.gap.group)));
    const col = A.collectCandidates({ root: d, run: false, sources: ['loop'] });
    assert.equal(col.sources.loop.candidates, 4);
    const r = A.runAutopilot({ root: d, dry: true, candidates: got.candidates, rerun: false, lock: false });
    assert.deepEqual(r.decisions.filter((x) => x.candidate).map((x) => x.decision), ['would-run-trial', 'would-run-trial', 'would-run-trial', 'would-run-trial']);
    assert.equal(r.bySource.loop.candidates, 4);
    const b = { left: 0 };
    assert.equal(A.loopRound(got.candidates[0], { root: d, budget: b }).wall, 'budget');
    let spawned = 0;
    const fake = () => { spawned++; return { status: 0, stdout: 'noise\n' + A.LOOP_TRIAL_MARK + JSON.stringify({ completed: true, exitCode: 0, metric: 0, printedMetric: true }) + '\n' }; };
    const b1 = { left: A.LOOP_TRIALS_PER_RUN };
    const one = A.loopRound(got.candidates[0], { root: d, budget: b1, spawn: fake });
    assert.deepEqual([one.decision, one.before, one.after], ['trial-closed', 4, 0]);
    assert.equal(A.loopRound(got.candidates[1], { root: d, budget: b1, spawn: fake }).wall, 'budget');
    assert.equal(spawned, 1, 'one trial per run');
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('a wrong answer is a problem: exit 1, the record and the gap row still written; counts that do not partition are one too', async () => {
  const d = tmp('wrong');
  try {
    const state = path.join(d, 'loop'), groot = path.join(d, 'root');
    const wrongGroup = grp('comparison.w', 'comparison', 4, 1, 1);
    const r = await L.tick({ date: '2026-01-05', seed: 900010, n: 10, stateDir: state, gapsRoot: groot, reask: false, runQueries: async () => fakeVerdict([wrongGroup], ['calendar.a']) });
    assert.equal(r.queries.wrong, 1);
    assert.equal(r.exitCode, 1);
    assert.ok(r.problems.includes('wrong 1'), r.problems.join('; '));
    assert.ok(existsSync(path.join(state, '2026-01-05.json')), 'the record is written: the wrong row is the gap to fill');
    const row = G.readLedger(groot).lines.find((l) => l.kind === L.GAP_KIND);
    assert.deepEqual([row.group, row.measuredWrong, row.measuredRefused], ['comparison.w', 1, 1]);
    // the control: the same tick with no wrong row has no problem
    const ok = await L.tick({ dry: true, date: '2026-01-05', seed: 900010, n: 10, stateDir: state, reask: false, runQueries: async () => fakeVerdict([grp('comparison.w', 'comparison', 4, 0, 2)], ['calendar.a']) });
    assert.deepEqual([ok.exitCode, ok.problems], [0, []]);
    // counts that do not partition (asked 10 = answered 7 + refused 3, and a wrong row on top) are a problem
    const bad = fakeVerdict([grp('comparison.w', 'comparison', 4, 0, 2)], ['calendar.a']);
    bad.totals = { asked: 10, answered: 7, correct: 7, wrong: 1, refused: 3 };
    const rb = await L.tick({ dry: true, date: '2026-01-05', seed: 900010, n: 10, stateDir: state, reask: false, runQueries: async () => bad });
    assert.equal(rb.exitCode, 1);
    assert.ok(rb.problems.includes('wrong 1'));
    assert.ok(rb.problems.some((p) => /^totals do not add up/.test(p)), rb.problems.join('; '));
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('a --group run of bench/self-queries.mjs is never the bar, by wholeRun, and ran to the end of its selection', async () => {
  const SQ = await import('../bench/self-queries.mjs');
  const { generate } = await import('../self/queries.mjs');
  const rows = generate({ seed: 900001, n: 40 });
  const group = rows[0].template;
  const want = rows.filter((r) => r.template === group).length;
  const lines = [];
  const v = await SQ.run({ n: 40, seeds: [900001], group, write: false, selfTest: false, log: (s) => lines.push(s) });
  assert.equal(v.isTheBar, false);
  assert.equal(v.checks.wholeRun, false);
  assert.equal(v.checks.ranToTheEnd, true, 'every selected row was asked: not a cut run');
  assert.match(v.notTheBarBecause, /wholeRun/);
  assert.doesNotMatch(v.notTheBarBecause, /ranToTheEnd/);
  assert.equal(v.totals.asked, want);
  const sel = 'SELECTED group ' + group + ' asked ' + want + ' answered ' + v.totals.answered + ' correct ' + v.totals.correct + ' wrong ' + v.totals.wrong + ' refused ' + v.totals.refused;
  assert.ok(lines.includes(sel), lines.filter((l) => l.startsWith('SELECTED')).join('\n'));
  // the control: the whole run at the same seed is a whole run and ran to its end
  const w = await SQ.run({ n: 40, seeds: [900001], write: false, selfTest: false, log: () => {} });
  assert.deepEqual([w.checks.wholeRun, w.checks.ranToTheEnd, w.totals.asked], [true, true, 40]);
});

test('the loop tick plan: runs on this tree on a day with no record, never on a ticked day, a dry soak, a planted root or off', () => {
  const d = tmp('plan');
  try {
    const dir = path.join(d, 'loop');
    mkdirSync(dir, { recursive: true });
    writeFileSync(path.join(dir, '2026-01-06.json'), '{}');
    const at = (y, m, dd) => new Date(y, m - 1, dd, 5, 0, 0);
    const fresh = A.loopTickPlan({ root: ROOT, dir, now: at(2026, 1, 7) });
    assert.deepEqual([fresh.run, fresh.date], [true, '2026-01-07']);
    const ticked = A.loopTickPlan({ root: ROOT, dir, now: at(2026, 1, 6) });
    assert.equal(ticked.run, false);
    assert.match(ticked.why, /today ticked already/);
    assert.equal(A.loopTickPlan({ root: ROOT, dir, now: at(2026, 1, 7), dry: true }).run, false);
    assert.equal(A.loopTickPlan({ root: ROOT, dir, now: at(2026, 1, 7), wantGaps: false }).run, false);
    assert.equal(A.loopTickPlan({ root: ROOT, dir, now: at(2026, 1, 7), off: true }).run, false);
    assert.equal(A.loopTickPlan({ root: d, now: at(2026, 1, 7) }).run, false, 'a planted root never spawns the tick');
    assert.equal(A.loopTickPlan({ root: d, tree: d, now: at(2026, 1, 7) }).run, true, 'the seam: a planted tree named as the tree');
    // runLoopTick reads the LOOP line and the exit of its child
    const seen = [];
    const fake = (exe, args) => { seen.push(args); return { status: 0, stdout: 'LOOP plant: x\nLOOP 2026-01-07: asked 1 answered 1 correct 1 wrong 0 refused 0; groups open 0 closed 0 opened 0; ledger learned before 0 after 0; gaps written 0\n', stderr: '' }; };
    const lt = A.runLoopTick({ root: ROOT, date: '2026-01-07', spawn: fake });
    assert.equal(lt.exit, 0);
    assert.match(lt.line, /^LOOP 2026-01-07: asked 1 /);
    assert.deepEqual(seen[0].slice(-3), [path.join(ROOT, 'self', 'loop.mjs'), '--date', '2026-01-07']);
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('the soak runs the loop tick once a day BEFORE it reads the ledger, so the queue holds the loop rows; off and a ticked day do not', { timeout: 120_000 }, async () => {
  const { plantInto } = await import('./operators-plant.mjs');
  const base = tmp('soak');
  try {
    const root = path.join(base, 'tree');
    plantInto(root, { gate: 'fake' });
    const tmpBase = path.join(base, 'copies');
    mkdirSync(tmpBase, { recursive: true });
    const calls = [];
    const loopTickFn = async ({ root: r, date }) => {
      calls.push(date);
      const ld = path.join(r, 'state', 'self', 'loop');
      mkdirSync(ld, { recursive: true });
      writeFileSync(path.join(ld, date + '.json'), JSON.stringify({ kind: L.RECORD_KIND, date, seed: 1, groups: { open: [] } }));
      const row = { id: L.GAP_ID_PREFIX + 'calendar.a', kind: L.GAP_KIND, subsystem: 'act', measured: 2, bar: 0, better: 'lower', files: [], trial: G.trialOf(L.FORM_KEY) };
      writeFileSync(path.join(r, 'state', 'self', 'gaps.jsonl'), JSON.stringify(row) + '\n');
      return { exit: 0, line: 'LOOP ' + date + ': asked 1 answered 0 correct 0 wrong 0 refused 1; groups open 1 closed 0 opened 1; ledger learned before n/a after n/a; gaps written 1', ms: 1 };
    };
    const SOAK = { author: 'off', 'gate-minutes': 0, 'idle-step-ms': 200, rateFn: () => ({ ok: false, reason: 'not read in a test' }), soak: 0.03, sources: 'gaps', root, tmpBase, loopTree: root, loopTickFn };
    const logs = [];
    const r = await A.runSoak({ ...SOAK, log: (l) => logs.push(l) });
    assert.equal(calls.length, 1, 'ticked once');
    const iTick = logs.findIndex((l) => l.startsWith('LOOP tick ' + calls[0] + ':'));
    const iGaps = logs.findIndex((l) => l.startsWith('gaps: '));
    assert.ok(iTick >= 0 && iGaps > iTick, 'the tick ran before the ledger was read\n' + logs.join('\n'));
    assert.match(logs[iGaps], /^gaps: 1 ledger lines, 1 with a trial;/, 'the queue read the row the tick wrote');
    const sf = JSON.parse(readFileSync(path.join(root, r.soakFile), 'utf8'));
    assert.deepEqual([sf.loopTick.date, sf.loopTick.exit], [calls[0], 0]);
    // the control: the same day again does not tick, and --loop-tick off does not tick
    const logs2 = [];
    await A.runSoak({ ...SOAK, log: (l) => logs2.push(l) });
    assert.equal(calls.length, 1);
    assert.ok(logs2.some((l) => /^LOOP tick: not run \(.*today ticked already\)$/.test(l)), logs2.join('\n'));
    rmSync(path.join(root, 'state', 'self', 'loop'), { recursive: true, force: true });
    const logs3 = [];
    await A.runSoak({ ...SOAK, 'loop-tick': 'off', log: (l) => logs3.push(l) });
    assert.equal(calls.length, 1);
    assert.ok(logs3.includes('LOOP tick: not run (--loop-tick off)'), logs3.join('\n'));
    // a planted root with no loopTree seam never spawns the tick and prints nothing about it
    const logs4 = [];
    await A.runSoak({ ...SOAK, loopTree: undefined, log: (l) => logs4.push(l) });
    assert.equal(calls.length, 1);
    assert.ok(!logs4.some((l) => l.startsWith('LOOP tick')));
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test('board 36 pins: --plant-closed without --dry is refused (parseArgs, tick() and the CLI: the refusal printed, exit 2, nothing written); with --dry it parses', async () => {
  assert.throws(() => L.parseArgs(['--plant-closed', 'calendar.a']), /--plant-closed needs --dry/);
  assert.throws(() => L.parseArgs(['--date', '2026-01-04', '--plant-closed', 'calendar.a']), /a planted closure written into a real record is a lie/);
  // the control: the same flag with --dry parses, before or after it
  assert.equal(L.parseArgs(['--dry', '--plant-closed', 'calendar.a']).plantClosed, 'calendar.a');
  assert.equal(L.parseArgs(['--plant-closed', 'calendar.a', '--dry']).plantClosed, 'calendar.a');
  await assert.rejects(L.tick({ date: '2026-01-03', seed: 900013, n: 10, stateDir: path.join(tmpdir(), 'never-written'), reask: false, plantClosed: 'calendar.a', runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) }), /--plant-closed needs --dry/);
  const d = tmp('nodry');
  try {
    const state = path.join(d, 'loop'), groot = path.join(d, 'root');
    mkdirSync(state, { recursive: true });
    writeFileSync(path.join(state, '2026-01-02.json'), JSON.stringify({ kind: L.RECORD_KIND, date: '2026-01-02', seed: 1, groups: { open: PREV } }));
    const before = listAll(d);
    const c = spawnSync(process.execPath, ['self/loop.mjs', '--n', '40', '--seed', '900003', '--date', '2026-01-03', '--state-dir', state, '--gaps-root', groot, '--no-reask', '--no-selftest', '--plant-closed', 'calendar.a'], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
    assert.equal(c.status, 2, c.stdout + c.stderr);
    assert.match(c.stderr, /^self\/loop\.mjs: --plant-closed needs --dry: a planted closure written into a real record is a lie\r?$/m);
    assert.doesNotMatch(c.stdout, /^LOOP /m, 'no tick ran');
    assert.deepEqual(listAll(d), before, 'nothing written');
  } finally { rmSync(d, { recursive: true, force: true }); }
});

test('board 36 pins: in the loop shape (a file main under the preload) the guard covers the main thread and file workers, not eval:true workers; the record says so', async () => {
  const d = tmp('coverage');
  try {
    const has = "net.Socket.prototype.connect.name === 'refusedByLoop' && !!(globalThis.__BRAIN_LOOP_GUARD && globalThis.__BRAIN_LOOP_GUARD.preload)";
    const evalSrc = (where) => "const net = process.getBuiltinModule('node:net'); const fs = process.getBuiltinModule('node:fs'); setTimeout(() => fs.appendFileSync(process.env.BRAIN_LOOP_COVERAGE_OUT, JSON.stringify({ where: '" + where + "', guarded: " + has + " }) + '\\n'), 50);";
    // no worker posts a message: every thread appends one JSON line to the file main names in its env (workers copy the env), so the probe adds no message boundary to the tree
    const collect = "const run = (spec, opts) => new Promise((res) => { const w = new Worker(spec, opts); w.on('error', (e) => { try { appendFileSync(process.env.BRAIN_LOOP_COVERAGE_OUT, JSON.stringify({ where: 'error', error: String(e) }) + '\\n'); } catch {} }); w.on('exit', () => res()); });";
    writeFileSync(path.join(d, 'leaf.mjs'), "import net from 'node:net';\nimport { appendFileSync } from 'node:fs';\nappendFileSync(process.env.BRAIN_LOOP_COVERAGE_OUT, JSON.stringify({ where: 'fileInFile', guarded: " + has + " }) + '\\n');\n");
    writeFileSync(path.join(d, 'file-worker.mjs'), "import net from 'node:net';\nimport { appendFileSync } from 'node:fs';\nimport { Worker } from 'node:worker_threads';\n" + collect + "\nappendFileSync(process.env.BRAIN_LOOP_COVERAGE_OUT, JSON.stringify({ where: 'file', guarded: " + has + " }) + '\\n');\nawait run(" + JSON.stringify(evalSrc('evalInFile')) + ", { eval: true });\nawait run(new URL('./leaf.mjs', import.meta.url));\n");
    writeFileSync(path.join(d, 'main.mjs'), "import net from 'node:net';\nimport { appendFileSync, readFileSync, writeFileSync } from 'node:fs';\nimport { fileURLToPath } from 'node:url';\nimport { Worker } from 'node:worker_threads';\nconst OUT = fileURLToPath(new URL('./coverage.jsonl', import.meta.url));\nprocess.env.BRAIN_LOOP_COVERAGE_OUT = OUT;\nwriteFileSync(OUT, '');\n" + collect + "\nconst out = { main: " + has + " };\nawait run(" + JSON.stringify(evalSrc('eval')) + ", { eval: true });\nawait run(new URL('./file-worker.mjs', import.meta.url));\nfor (const l of readFileSync(OUT, 'utf8').split('\\n').filter(Boolean)) { const m = JSON.parse(l); out[m.where] = m.guarded ?? m.error; }\nconsole.log(JSON.stringify(out));\n");
    const r = spawnSync(process.execPath, ['--import', L.GUARD_URL, path.join(d, 'main.mjs')], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 });
    assert.equal(r.status, 0, r.stderr);
    const got = JSON.parse(r.stdout.trim().split(/\r?\n/).pop());
    assert.deepEqual(got, { main: true, eval: false, file: true, evalInFile: false, fileInFile: true });
    // the control: the same probe with no preload reads every thread unguarded, so a true above is the preload's
    const r0 = spawnSync(process.execPath, [path.join(d, 'main.mjs')], { cwd: ROOT, encoding: 'utf8', timeout: 60_000 });
    assert.deepEqual(JSON.parse(r0.stdout.trim().split(/\r?\n/).pop()), { main: false, eval: false, file: false, evalInFile: false, fileInFile: false });
    // the words: what is not covered is named in the constant and in a record
    assert.match(L.NOT_COVERED, /eval:true workers at any depth/);
    assert.match(L.NOT_COVERED, /child processes/);
    // the CLI (the preload shape) names NOT_COVERED; an in-process tick with no preload names every worker thread
    const c = spawnSync(process.execPath, ['self/loop.mjs', '--dry', '--json', '--n', '40', '--seed', '900003', '--date', '2026-01-04', '--state-dir', path.join(d, 'loop'), '--gaps-root', path.join(d, 'root'), '--no-reask', '--no-selftest'], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
    assert.equal(c.status, 0, c.stderr);
    const cli = JSON.parse(c.stdout);
    assert.equal(cli.sockets.notCovered, L.NOT_COVERED);
    assert.match(cli.sockets.guard, /^preload in the main thread and every file worker/);
    const rec = await L.tick({ dry: true, date: '2026-01-03', seed: 900013, n: 10, stateDir: path.join(d, 'loop'), reask: false, runQueries: async () => fakeVerdict(CUR, DRAWN_NOW) });
    assert.equal(rec.sockets.notCovered, L.NOT_COVERED_IN_PROCESS);
    assert.match(rec.sockets.guard, /^main thread only/);
    assert.doesNotMatch(readFileSync(path.join(ROOT, 'self', 'loop.mjs'), 'utf8'), /EVERY thread|every thread of the process|preload in every thread/, 'no word claims every thread');
  } finally { rmSync(d, { recursive: true, force: true }); }
});
