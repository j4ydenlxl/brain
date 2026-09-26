// test/gate-autonomy.test.mjs: the two rows Board 15 added to node bench/gate.mjs, on planted trees.
//
//   (a) the task as schtasks /query /fo LIST /v prints it: its fields, the tree its Task To Run
//       changes into, a task that is not registered, a query that throws.
//   (b) the installation: the tree the task names (compared resolved and case-insensitively), a
//       tree with .git and state/self when no task names one, and any other tree, which prints N/A
//       on both rows, graded false and ruling nothing.
//   (c) AUTONOMY GREEN: a fresh ledger whose every gap of kinds missed, ladder, gate red and gate
//       slow has a trial whose bench file exists (a gap of these rows themselves excluded as an
//       echo), BrainAutopilot registered and Ready, no STOP, a fresh decision file.
//   (d) AUTONOMY RED, one cause at a time and all at once, every cause printed with its count: not
//       registered (the register command printed), Disabled, stopped by hand, a stale ledger, a
//       stale decision file, no decision directory, no ledger, a gap with no trial, a trial whose
//       bench file is missing.
//   (e) the referee: a live pid holding state/self-code/autopilot.lock prints the row in full and
//       marks it not ruling; a stale lock does not.
//   (f) HANDOFF GREEN: a fresh footer, every listed command present (a script the doc names as to
//       be built by a board item, and the ledger's board item names, is pending; a <task>
//       placeholder is skipped), and undone counts equal to the ledger's.
//   (g) HANDOFF RED, each cause printed: no doc, an old footer, no footer, a missing script, a to be
//       built script no board item names, an unregistered task, an executable not on PATH, counts
//       that differ from the ledger (a heading and its bullets too).
//   (h) neither row writes anything: the planted tree is the same file for file after both run.
//
// No real task is queried (every call injects the task or the query), no model is called, and
// nothing is written outside the temp trees.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, utimesSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  AUTONOMY_TASK, AUTONOMY_KINDS, ROW_ECHO_GAPS, FRESH_HOURS, REGISTER_CMD,
  parseTaskFields, taskOf, taskRootOf, installationOf, pidAlive, refereeOf, trialBenchOf,
  autonomyRow, commandsIn, checksOfLine, undoneCountsIn, toBuildIn, handoffRow,
} from '../bench/gate.mjs';

const NOW = Date.parse('2026-09-26T12:00:00.000Z');
const H = 3_600_000;

function tree({ git = true, state = true } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'gate-autonomy-'));
  if (git) mkdirSync(path.join(root, '.git'));
  if (state) mkdirSync(path.join(root, 'state', 'self'), { recursive: true });
  return root;
}
function put(root, rel, text, ageMs = null) {
  const f = path.join(root, ...rel.split('/'));
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, text);
  if (ageMs !== null) { const t = (NOW - ageMs) / 1000; utimesSync(f, t, t); }
  return f;
}
const jl = (rows) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
const ready = (root, extra = {}) => ({ name: AUTONOMY_TASK, registered: true, status: 'Ready', state: 'Enabled', taskToRun: 'cmd /c cd /d ' + root + ' && node tools\\schedule-autopilot.mjs --tick', why: null, ...extra });
const NOT_REGISTERED = { name: AUTONOMY_TASK, registered: false, status: null, state: null, taskToRun: null, why: 'schtasks /query exited 1: ERROR: The system cannot find the file specified.' };
const noQuery = () => { throw new Error('a test queried a real task'); };
const dead = () => false;
function causeCount(line) { const m = /; CAUSES \((\d+)\): /.exec(line) || /^\S+ RED[^:]*: CAUSES \((\d+)\): /.exec(line); return m ? Number(m[1]) : 0; }
function listing(root) {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d)) { const f = path.join(d, n); const s = statSync(f); if (s.isDirectory()) walk(f); else out.push(path.relative(root, f) + ' ' + s.size + ' ' + s.mtimeMs); } };
  walk(root);
  return out.sort();
}

// a green installation: three graded gaps with benches on disk, an open gap (not graded) and an echo
function plantGreen(root) {
  put(root, 'bench/a.mjs', '// a\n');
  put(root, 'bench/b.mjs', '// b\n');
  put(root, 'bench/c.mjs', '// c\n');
  put(root, 'state/self/gaps.jsonl', jl([
    { id: 'missed:a.json', kind: 'missed', trial: { command: 'node bench/a.mjs', bench: 'bench/a.mjs' } },
    { id: 'ladder:b', kind: 'ladder', trial: 'node tools/budget.mjs --ram-mb 100 -- node bench/b.mjs --x' },
    { id: 'gate-slow:c', kind: 'gate slow', trial: { argv: ['node', 'bench/c.mjs'] } },
    { id: 'open:notes/x.md#1', kind: 'open', trial: null },
    { id: 'gate-red:row:autonomy', kind: 'gate red', trial: null },
  ]), 1 * H);
  put(root, 'bench/verdicts/autopilot/2026-09-25.jsonl', jl([{ kind: 'self.code.auto', gap: 'missed:a.json', decision: 'refused', wall: 'test' }]), 2 * H);
  put(root, 'bench/verdicts/autopilot/2026-09-20.jsonl', jl([{ kind: 'self.code.auto' }]), 140 * H);
}

test('(a) the task as schtasks prints it: fields, the tree it runs in, not registered, a query that throws', () => {
  const out = [
    'Folder: \\',
    'HostName:                             DESKTOP-X',
    'TaskName:                             \\BrainAutopilot',
    'Next Run Time:                        9/27/2026 3:00:00 AM',
    'Status:                               Ready',
    'Task To Run:                          cmd /c cd /d C:\\Users\\me\\brain dir && node tools\\schedule-autopilot.mjs --tick',
    'Scheduled Task State:                 Enabled',
    'Status:                               Disabled',
  ].join('\r\n');
  const f = parseTaskFields(out);
  assert.equal(f.Status, 'Ready', 'the first of each label');
  assert.equal(f['Next Run Time'], '9/27/2026 3:00:00 AM');
  const t = taskOf(AUTONOMY_TASK, (name) => { assert.equal(name, AUTONOMY_TASK); return { status: 0, out, err: '' }; });
  assert.deepEqual(t, { name: AUTONOMY_TASK, registered: true, status: 'Ready', state: 'Enabled', taskToRun: 'cmd /c cd /d C:\\Users\\me\\brain dir && node tools\\schedule-autopilot.mjs --tick', why: null });
  assert.equal(taskRootOf(t.taskToRun), 'C:\\Users\\me\\brain dir');
  assert.equal(taskRootOf('cmd /c cd /d "C:\\a b\\brain" && node x.mjs'), 'C:\\a b\\brain');
  assert.equal(taskRootOf('node bench/x.mjs'), null);
  assert.equal(taskRootOf(null), null);
  const nr = taskOf(AUTONOMY_TASK, () => ({ status: 1, out: '', err: 'ERROR: first line\nsecond line' }));
  assert.equal(nr.registered, false);
  assert.equal(nr.why, 'schtasks /query exited 1: ERROR: first line');
  const th = taskOf(AUTONOMY_TASK, () => { throw new Error('spawn schtasks ENOENT'); });
  assert.equal(th.registered, false);
  assert.ok(th.why.includes('spawn schtasks ENOENT'), th.why);
});

test('(b) the installation: the tree the task names, else a tree with .git and state/self; any other tree is N/A', () => {
  const root = tree();
  const other = tree();
  const bare = tree({ git: false });
  try {
    const upper = ready(root.toUpperCase() + '\\');
    const a = installationOf({ root, task: upper });
    assert.equal(a.installed, true, 'compared resolved and case-insensitively, a trailing separator dropped');
    assert.equal(a.how, 'task');
    const b = installationOf({ root: other, task: ready(root) });
    assert.equal(b.installed, false);
    assert.equal(b.why, 'not the tree ' + AUTONOMY_TASK + ' runs in (' + root + ')');
    const c = installationOf({ root, task: NOT_REGISTERED });
    assert.deepEqual([c.installed, c.how], [true, 'tree']);
    assert.equal(c.why, AUTONOMY_TASK + ' is not registered, and this tree carries .git and state/self');
    const d = installationOf({ root: bare, task: NOT_REGISTERED });
    assert.equal(d.installed, false);
    assert.equal(d.why, AUTONOMY_TASK + ' is not registered, and this tree lacks .git');
    const e = installationOf({ root, task: ready(root, { taskToRun: 'node self/autopilot.mjs' }) });
    assert.deepEqual([e.installed, e.how], [true, 'tree']);
    assert.ok(e.why.startsWith(AUTONOMY_TASK + ' names no tree (Task To Run: node self/autopilot.mjs)'), e.why);
    // both rows on a tree that is not the installation: N/A, graded false, ruling nothing
    plantGreen(other);
    for (const [label, row] of [['AUTONOMY', autonomyRow({ root: other, now: NOW, task: ready(root), taskQuery: noQuery, alive: dead })], ['HANDOFF', handoffRow({ root: other, now: NOW, task: ready(root), taskQuery: noQuery, which: () => null, alive: dead })]]) {
      assert.deepEqual([row.ok, row.graded, row.rules], [true, false, false], label);
      assert.equal(row.line, label + ' N/A: not the tree ' + AUTONOMY_TASK + ' runs in (' + root + '); the row grades only the installation (the tree ' + AUTONOMY_TASK + ' runs in), so this tree holds nothing');
    }
    const na = autonomyRow({ root: bare, now: NOW, task: NOT_REGISTERED, taskQuery: noQuery, alive: dead });
    assert.equal(na.graded, false);
    assert.ok(na.line.startsWith('AUTONOMY N/A: ' + AUTONOMY_TASK + ' is not registered, and this tree lacks .git'), na.line);
  } finally { for (const r of [root, other, bare]) rmSync(r, { recursive: true, force: true }); }
});

test('(c) AUTONOMY GREEN: fresh ledger, every graded gap with a bench on disk, Ready, no STOP, a fresh decision', () => {
  const root = tree();
  try {
    plantGreen(root);
    const r = autonomyRow({ root, now: NOW, task: ready(root), taskQuery: noQuery, alive: dead });
    assert.equal(r.ok, true, r.line);
    assert.deepEqual([r.graded, r.rules], [true, true]);
    assert.deepEqual(AUTONOMY_KINDS, ['missed', 'ladder', 'gate red', 'gate slow']);
    assert.deepEqual(r.echoes, ['gate-red:row:autonomy']);
    assert.ok(ROW_ECHO_GAPS.includes('gate-red:row:handoff'));
    assert.equal(r.line, 'AUTONOMY GREEN: ledger 5 gaps, 1 h old; kinds missed, ladder, gate red, gate slow: 3 (missed 1, ladder 1, gate red 0, gate slow 1), 3 with a trial whose bench file exists, 0 with no trial, 0 with a missing bench; excluded as echoes of this gate row itself: gate-red:row:autonomy'
      + '; ' + AUTONOMY_TASK + ' registered, status Ready, Enabled; state/self/STOP absent; newest decision file 2026-09-25.jsonl, 2 h old, of 2; installation: the tree ' + AUTONOMY_TASK + ' runs in');
    assert.deepEqual(r.newestDecision, { file: '2026-09-25.jsonl', ageHours: 2, files: 2 });
    // Running is taken as working, and printed
    const run = autonomyRow({ root, now: NOW, task: ready(root, { status: 'Running' }), taskQuery: noQuery, alive: dead });
    assert.equal(run.ok, true);
    assert.ok(run.line.includes('registered, status Running, Enabled'), run.line);
    // just under the 48 h bar is fresh
    put(root, 'state/self/gaps.jsonl', greenLedger(), FRESH_HOURS * H - 7 * 60 * 1000);
    assert.equal(autonomyRow({ root, now: NOW, task: ready(root), taskQuery: noQuery, alive: dead }).ok, true);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
// the green ledger's text again (re-put with a new age)
function greenLedger() {
  return jl([
    { id: 'missed:a.json', kind: 'missed', trial: { command: 'node bench/a.mjs', bench: 'bench/a.mjs' } },
    { id: 'ladder:b', kind: 'ladder', trial: 'node tools/budget.mjs --ram-mb 100 -- node bench/b.mjs --x' },
    { id: 'gate-slow:c', kind: 'gate slow', trial: { argv: ['node', 'bench/c.mjs'] } },
    { id: 'open:notes/x.md#1', kind: 'open', trial: null },
    { id: 'gate-red:row:autonomy', kind: 'gate red', trial: null },
  ]);
}

test('(d) AUTONOMY RED: each cause alone, then all at once, every cause printed with its count', () => {
  const root = tree();
  try {
    plantGreen(root);
    const row = (task = ready(root)) => autonomyRow({ root, now: NOW, task, taskQuery: noQuery, alive: dead });
    // not registered: installed by the tree rule, RED, and the register command printed
    const nr = row(NOT_REGISTERED);
    assert.equal(nr.ok, false);
    assert.equal(nr.rules, true);
    assert.ok(nr.line.includes('; ' + AUTONOMY_TASK + ' NOT REGISTERED;'), nr.line);
    assert.ok(nr.line.endsWith('; CAUSES (1): ' + AUTONOMY_TASK + ' is not registered (' + NOT_REGISTERED.why + '); ' + REGISTER_CMD + ' registers it'), nr.line);
    // Disabled
    const di = row(ready(root, { state: 'Disabled' }));
    assert.ok(di.line.endsWith('; CAUSES (1): ' + AUTONOMY_TASK + ' is registered but Disabled (Ready is the bar)'), di.line);
    const qu = row(ready(root, { status: 'Queued' }));
    assert.ok(qu.line.endsWith('; CAUSES (1): ' + AUTONOMY_TASK + ' is registered but its status is Queued (Ready is the bar)'), qu.line);
    // stopped by hand
    put(root, 'state/self/STOP', 'stop\n');
    const st = row();
    assert.equal(st.stopped, true);
    assert.ok(st.line.includes('; state/self/STOP PRESENT;'), st.line);
    assert.ok(st.line.endsWith('; CAUSES (1): stopped by hand (state/self/STOP is present; delete it to let the loop run)'), st.line);
    rmSync(path.join(root, 'state', 'self', 'STOP'));
    // a stale ledger and a stale decision file
    put(root, 'state/self/gaps.jsonl', greenLedger(), 50 * H);
    put(root, 'bench/verdicts/autopilot/2026-09-25.jsonl', '{}\n', 49 * H);
    const stale = row();
    assert.deepEqual(stale.causes, [
      'state/self/gaps.jsonl is 50 h old (the bar is under 48 h; node self/gaps.mjs rewrites it)',
      'the newest decision file 2026-09-25.jsonl is 49 h old (the bar is under 48 h)',
    ]);
    assert.equal(causeCount(stale.line), 2);
    // a gap with no trial and a trial whose bench is missing; an unparsed ledger line
    put(root, 'state/self/gaps.jsonl', greenLedger() + jl([
      { id: 'missed:x.json', kind: 'missed', trial: null },
      { id: 'ladder:y', kind: 'ladder', trial: { command: 'node bench/gone.mjs', bench: 'bench/gone.mjs' } },
      { id: 'gate-red:row:boundary', kind: 'gate red' },
    ]) + 'not json\n', 1 * H);
    put(root, 'bench/verdicts/autopilot/2026-09-25.jsonl', '{}\n', 1 * H);
    const gaps = row();
    assert.deepEqual(gaps.causes, [
      '1 ledger line(s) do not parse',
      '2 gap(s) with no trial: missed:x.json, gate-red:row:boundary',
      '1 gap(s) whose trial bench file is missing: ladder:y (bench/gone.mjs)',
    ]);
    assert.ok(gaps.line.includes('kinds missed, ladder, gate red, gate slow: 6 (missed 2, ladder 2, gate red 1, gate slow 1), 3 with a trial whose bench file exists, 2 with no trial, 1 with a missing bench'), gaps.line);
    assert.equal(causeCount(gaps.line), 3);
    // no ledger, no decision directory, not registered, stopped: every cause printed
    rmSync(path.join(root, 'state', 'self', 'gaps.jsonl'));
    rmSync(path.join(root, 'bench', 'verdicts', 'autopilot'), { recursive: true });
    put(root, 'state/self/STOP', '');
    const all = row(NOT_REGISTERED);
    assert.deepEqual(all.causes, [
      'state/self/gaps.jsonl is not on disk (node self/gaps.mjs writes it)',
      AUTONOMY_TASK + ' is not registered (' + NOT_REGISTERED.why + '); ' + REGISTER_CMD + ' registers it',
      'stopped by hand (state/self/STOP is present; delete it to let the loop run)',
      'bench/verdicts/autopilot/ is not on disk: no decision was ever written',
    ]);
    assert.equal(causeCount(all.line), 4);
    assert.ok(all.line.startsWith('AUTONOMY RED: ledger not measured; '), all.line);
    assert.ok(all.line.includes('; newest decision file none;'), all.line);
    for (const c of all.causes) assert.ok(all.line.includes(c), c);
    // an empty decision directory
    mkdirSync(path.join(root, 'bench', 'verdicts', 'autopilot'), { recursive: true });
    assert.ok(row().causes.includes('no decision file (*.jsonl) under bench/verdicts/autopilot/'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(e) the referee: a live lock holder prints the row in full, not ruling; a stale lock rules', () => {
  const root = tree();
  try {
    plantGreen(root);
    put(root, 'state/self/STOP', '');
    assert.equal(refereeOf(root, { alive: dead }).why, 'no state/self-code/autopilot.lock');
    put(root, 'state/self-code/autopilot.lock', JSON.stringify({ pid: 424242, at: '2026-09-26T11:59:00.000Z' }));
    const live = autonomyRow({ root, now: NOW, task: ready(root), taskQuery: noQuery, alive: (pid) => pid === 424242 });
    assert.deepEqual([live.ok, live.graded, live.rules], [false, true, false]);
    assert.ok(live.line.startsWith('AUTONOMY RED (REFEREE, not ruling: autopilot pid 424242 holds state/self-code/autopilot.lock since 2026-09-26T11:59:00.000Z): ledger 5 gaps'), live.line);
    assert.ok(live.line.includes('CAUSES (1): stopped by hand'), 'computed in full');
    const hl = handoffRow({ root, now: NOW, task: ready(root), taskQuery: noQuery, which: () => null, alive: () => true });
    assert.deepEqual([hl.ok, hl.rules], [false, false]);
    assert.ok(hl.line.startsWith('HANDOFF RED (REFEREE, not ruling: '), hl.line);
    const stale = autonomyRow({ root, now: NOW, task: ready(root), taskQuery: noQuery, alive: dead });
    assert.equal(stale.rules, true);
    assert.equal(stale.referee.why, 'state/self-code/autopilot.lock is stale (pid 424242 is not running)');
    assert.ok(stale.line.startsWith('AUTONOMY RED: '), stale.line);
    assert.equal(pidAlive(process.pid), true);
    assert.equal(pidAlive(-1), false);
    assert.equal(pidAlive('12'), false);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(e2) trialBenchOf: the bench field, else the first script past the budget wrapper, never a placeholder', () => {
  assert.equal(trialBenchOf({ trial: { bench: 'bench/x.mjs', command: 'node bench/y.mjs' } }), 'bench/x.mjs');
  assert.equal(trialBenchOf({ trial: 'node tools/budget.mjs --ram-mb 1 -- node --max-old-space-size=6000 bench/y.mjs --bar' }), 'bench/y.mjs');
  assert.equal(trialBenchOf({ trial: { argv: ['node', 'bench/z.mjs'] } }), 'bench/z.mjs');
  assert.equal(trialBenchOf({ trial: { command: 'node <bench>.mjs' } }), null);
  assert.equal(trialBenchOf({ trial: null }), null);
  assert.equal(trialBenchOf({}), null);
});

// ---------------------------------------------------------------- HANDOFF
const FENCE = '```';
function doc({ generated = '2026-09-26T11:00:00.000Z', extra = [], undone = null, footer = true } = {}) {
  return [
    '# HANDOFF', '',
    '## WHAT IS UNDONE', '',
    ...(undone || ['### missed (1)', '- `missed:a.json` no trial yet', '', '### board item (1)', '- `board-15:resume` Board 15 item resume']), '',
    '## COMMANDS', '',
    FENCE, 'node bench/a.mjs', 'schtasks /query /tn ' + AUTONOMY_TASK, 'schtasks /query /tn <task>', ...extra, FENCE, '',
    'Later, run `node bench/plateau.mjs --bar` once it exists.', '',
    '## COMMANDS CHECKED', '',
    '- `node bench/plateau.mjs --bar` runs bench/plateau.mjs, to be built by its board item', '',
    ...(footer ? ['Generated ' + generated + ' under: GATE GREEN: test files 2/2'] : ['(no footer)']), '',
  ].join('\n');
}
function plantHandoff(root, md = doc()) {
  put(root, 'bench/a.mjs', '// a\n');
  put(root, 'state/self/gaps.jsonl', jl([
    { id: 'missed:a.json', kind: 'missed', trial: { command: 'node bench/a.mjs', bench: 'bench/a.mjs' } },
    { id: 'board-15:resume', kind: 'board item', board: 15, trial: 'node bench/plateau.mjs --bar' },
  ]), 1 * H);
  if (md !== null) put(root, 'docs/HANDOFF.md', md);
}
const hrow = (root, o = {}) => handoffRow({ root, now: NOW, task: ready(root), taskQuery: () => ({ status: 1, out: '', err: 'ERROR: not found' }), which: (x) => (x === 'schtasks' || x === 'git' ? 'C:\\Windows\\' + x + '.exe' : null), alive: dead, ...o });

test('(f) HANDOFF GREEN: a fresh footer, every command present or pending, a placeholder skipped, counts equal', () => {
  const root = tree();
  try {
    plantHandoff(root);
    const md = doc();
    assert.deepEqual(commandsIn(md), ['node bench/a.mjs', 'schtasks /query /tn ' + AUTONOMY_TASK, 'schtasks /query /tn <task>', 'node bench/plateau.mjs --bar']);
    assert.deepEqual(checksOfLine('schtasks /query /tn ' + AUTONOMY_TASK), [{ kind: 'exe', name: 'schtasks' }, { kind: 'task', name: AUTONOMY_TASK }]);
    assert.deepEqual(checksOfLine('schtasks /create /tn X /tr "node a.mjs"'), [{ kind: 'exe', name: 'schtasks' }, { kind: 'exe', name: 'node' }, { kind: 'file', name: 'a.mjs' }], 'a /create names no task to check');
    assert.deepEqual(undoneCountsIn(md), { found: true, headings: { missed: 1, 'board item': 1 }, bullets: { missed: 1, 'board item': 1 } });
    assert.deepEqual([...toBuildIn(md)], ['bench/plateau.mjs']);
    const r = hrow(root);
    assert.equal(r.ok, true, r.line);
    assert.deepEqual([r.graded, r.rules], [true, true]);
    assert.equal(r.line, 'HANDOFF GREEN: docs/HANDOFF.md generated 2026-09-26T11:00:00.000Z, 1 h ago; commands listed 4, 7 checks (files under the tree, executables on PATH, tasks by schtasks /query), missing 0, pending 1 (bench/plateau.mjs, named by an undone board item), placeholders skipped 1; undone 2 in the doc vs 2 in the ledger, kinds differing 0');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(g) HANDOFF RED: each cause printed', () => {
  const root = tree();
  try {
    // no doc
    plantHandoff(root, null);
    const none = hrow(root);
    assert.equal(none.ok, false);
    assert.equal(none.line, 'HANDOFF RED: CAUSES (1): docs/HANDOFF.md is not on disk (node tools/handoff.mjs writes it)');
    // an old footer
    put(root, 'docs/HANDOFF.md', doc({ generated: '2026-09-24T00:00:00.000Z' }));
    const old = hrow(root);
    assert.deepEqual(old.causes, ['generated 2026-09-24T00:00:00.000Z, 60 h ago (the bar is under 48 h; node tools/handoff.mjs rewrites it)']);
    // no footer
    put(root, 'docs/HANDOFF.md', doc({ footer: false }));
    assert.deepEqual(hrow(root).causes, ['its footer carries no "Generated <time> under:" line, so its age is not measured']);
    assert.ok(hrow(root).line.includes('generated at an unread time;'));
    // a missing script, an unregistered task, an executable not on PATH
    put(root, 'docs/HANDOFF.md', doc({ extra: ['node bench/nothere.mjs --x', 'schtasks /query /tn OtherTask', 'gh pr list', 'git log --oneline'] }));
    const miss = hrow(root);
    assert.deepEqual(miss.missing, ['file bench/nothere.mjs', 'task OtherTask', 'exe gh']);
    assert.deepEqual(miss.causes, ['3 listed command(s) name something that does not exist: file bench/nothere.mjs, task OtherTask, exe gh']);
    assert.ok(miss.line.endsWith('; CAUSES (1): 3 listed command(s) name something that does not exist: file bench/nothere.mjs, task OtherTask, exe gh'), miss.line);
    // a to be built script that no board item names is missing, not pending
    put(root, 'state/self/gaps.jsonl', jl([
      { id: 'missed:a.json', kind: 'missed', trial: { command: 'node bench/a.mjs', bench: 'bench/a.mjs' } },
      { id: 'board-15:resume', kind: 'board item', board: 15, trial: 'node bench/other.mjs --bar' },
    ]), 1 * H);
    put(root, 'docs/HANDOFF.md', doc());
    const unnamed = hrow(root);
    assert.deepEqual([unnamed.pending, unnamed.missing], [[], ['file bench/plateau.mjs']]);
    // counts that differ from the ledger
    plantHandoff(root);
    put(root, 'state/self/gaps.jsonl', jl([
      { id: 'missed:a.json', kind: 'missed', trial: { command: 'node bench/a.mjs', bench: 'bench/a.mjs' } },
      { id: 'missed:b.json', kind: 'missed', trial: null },
      { id: 'board-15:resume', kind: 'board item', board: 15, trial: 'node bench/plateau.mjs --bar' },
      { id: 'open:x', kind: 'open' },
    ]), 1 * H);
    const cnt = hrow(root);
    assert.deepEqual(cnt.causes, ['its undone counts differ from the ledger (doc 2, ledger 4): missed ledger 2 vs doc 1, open ledger 1 vs doc none']);
    assert.ok(cnt.line.includes('; undone 2 in the doc vs 4 in the ledger, kinds differing 2;'), cnt.line);
    // a heading whose bullets do not match it
    put(root, 'docs/HANDOFF.md', doc({ undone: ['### missed (2)', '- `missed:a.json` x', '', '### board item (1)', '- `board-15:resume` y', '', '### open (1)', '- `open:x` z'] }));
    assert.deepEqual(hrow(root).causes, ['its undone counts differ from the ledger (doc 4, ledger 4): missed ledger 2 vs doc 2 (1 listed)']);
    // no WHAT IS UNDONE section
    put(root, 'docs/HANDOFF.md', doc().replace('## WHAT IS UNDONE', '## SOMETHING ELSE'));
    assert.deepEqual(hrow(root).causes, ['no "## WHAT IS UNDONE" section, so its undone counts are not measured']);
    // no ledger
    rmSync(path.join(root, 'state', 'self', 'gaps.jsonl'));
    put(root, 'docs/HANDOFF.md', doc());
    const nl = hrow(root);
    assert.ok(nl.causes.includes('state/self/gaps.jsonl is not on disk, so the undone counts are not measured against it'), nl.causes.join(' | '));
    assert.ok(nl.line.includes('vs ledger not measured'), nl.line);
    for (const c of nl.causes) assert.ok(nl.line.includes(c), c);
    assert.equal(causeCount(nl.line), nl.causes.length);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('(h) neither row writes: the planted tree is the same file for file after both run', () => {
  const root = tree();
  try {
    plantGreen(root);
    put(root, 'docs/HANDOFF.md', doc());
    put(root, 'state/self-code/autopilot.lock', JSON.stringify({ pid: 424242, at: '2026-09-26T11:59:00.000Z' }));
    const before = listing(root);
    autonomyRow({ root, now: NOW, task: ready(root), taskQuery: noQuery, alive: () => true });
    hrow(root);
    autonomyRow({ root, now: NOW, task: NOT_REGISTERED, taskQuery: noQuery, alive: dead });
    assert.deepEqual(listing(root), before);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
