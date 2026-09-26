// test/act-shell.test.mjs: the hand that runs a command, on this machine, for real.
//
// Nothing here reaches the network and nothing here uses a shell. Every process this file
// starts is this same node binary, spawned with an argv array, under a policy the test
// wrote itself. The three claims worth proving are behavioural, not textual:
//   a shell metacharacter inside an argument comes back as characters and leaves no trace,
//   a 10 second sleep with a grandchild is dead 1 second in AND SO IS THE GRANDCHILD,
//   a 5 MB stdout is capped, measured against the bytes the child actually produced.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { attachWorld, closeWorld } from '../world/index.mjs';
import {
  allowArgv, allowCwd, childEnv, closeShell, denyAll, descendants, loadShellPolicy, normalizeShellPolicy, parseProcStat,
  registerShellKind, runArgv, shellActuator, tightenTo,
  BASE_ENV_NAMES, PROPOSAL_OP, SHELL_CELL_KIND, SHELL_SIGNAL_KIND,
} from '../act/shell.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NODE = process.execPath;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function newTmpDir(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-act-shell-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
// A policy that allows this node binary and nothing else, rooted wherever the test needs.
const nodeOnly = (roots, extra = {}) => normalizeShellPolicy({ argv: [NODE], roots, maxBytes: 262144, timeoutMs: 15000, ...extra });

// Tick and wait in alternation: everything the actuator does is asynchronous, and the only
// way a brain observes an answer is by running again.
async function pump(brain, done, { ticks = 1, rounds = 300, ms = 5 } = {}) {
  for (let i = 0; i < rounds; i++) {
    brain.tick(ticks);
    if (done()) return true;
    await wait(ms);
  }
  brain.tick(ticks);
  return done();
}
const events = (brain) => brain.takeOutbox().filter((s) => s.kind === 'event').map((s) => s.data);
const harvest = (brain, ticks = 24) => { brain.tick(ticks); return events(brain).filter((e) => e && e.kind === SHELL_SIGNAL_KIND); };

// The ledger's own ring is read from its tail, and a few hundred ticks of a world region
// push an early event past the window. A listener keeps every event this test's brain ever
// wrote, so "the ledger holds one event per run" is counted over the whole run and not
// over whatever was still in the ring.
const TAPE = new WeakMap();
function record(brain) { const all = []; brain.ledger.on((e) => all.push(e)); TAPE.set(brain, all); return brain; }
const ledgerOf = (brain, type) => (TAPE.get(brain) || []).filter((e) => e.type === type);
const acts = (brain, op) => ledgerOf(brain, 'world.act').filter((e) => e.op === op);

// A brain with the world region armed for this node binary, plus the shell actuator.
function newBrain(t, { dir, worldExec = [NODE], roots = null, act = null } = {}) {
  const fsRoots = roots || [dir, ROOT];
  const brain = record(new Brain({ name: 'act-shell', seed: 'act-shell' }));
  attachWorld(brain, { proc: { exec: worldExec, timeoutMs: 20000, maxBytes: 1048576 }, fs: { roots: fsRoots } }, { wire: false });
  const at = shellActuator(brain, act || nodeOnly(fsRoots), { prefix: 'w' });
  t.after(() => { closeShell(brain); closeWorld(brain); });
  return { brain, at, cell: brain.cell(at.id) };
}

// ================================================================== allowArgv

test('allowArgv: a shell string, an empty argv and a bad element are all refused before anything runs', () => {
  const p = nodeOnly([ROOT]);
  assert.equal(allowArgv('node -e "1" && echo pwned', p).ok, false, 'a string is not an argv');
  assert.match(allowArgv('node -e 1', p).reason, /never a shell string/);
  assert.equal(allowArgv([], p).ok, false, 'an empty argv is refused');
  assert.equal(allowArgv([NODE, 42], p).ok, false, 'a non string element is refused');
  assert.equal(allowArgv([NODE, 'a\0b'], p).ok, false, 'a null byte is refused');
  assert.equal(allowArgv([NODE, 'x'.repeat(5000)], p).ok, false, 'an over long element is refused');
  assert.equal(allowArgv(new Array(100).fill(NODE), p).ok, false, 'too many elements are refused');
  assert.equal(allowArgv([NODE, '-e', 'process.exit(0)'], p).ok, true, 'the allowed program is allowed');
});

test('allowArgv: the shipped default allows nothing, and a prefix must match element by element', () => {
  const shipped = denyAll();
  assert.deepEqual(shipped.argv, [], 'the deny all policy has no prefix');
  assert.equal(allowArgv([NODE, '-e', '1'], shipped).ok, false, 'a fresh install runs no command');

  const gitLog = normalizeShellPolicy({ argv: [['git', 'log']], roots: [ROOT] });
  assert.equal(allowArgv(['git', 'log', '--oneline'], gitLog).ok, true, 'the declared prefix runs');
  assert.equal(allowArgv(['git', 'push'], gitLog).ok, false, 'a different subcommand is not the declared prefix');
  assert.equal(allowArgv(['git'], gitLog).ok, false, 'a prefix longer than the argv cannot match');
  assert.equal(allowArgv([NODE], gitLog).ok, false, 'a path never matches a bare name entry');
});

test('allowCwd: a path under a root is allowed, one outside every root is refused', (t) => {
  const dir = newTmpDir(t);
  const p = nodeOnly([dir]);
  assert.equal(allowCwd(dir, p).ok, true, 'the root itself is allowed');
  assert.equal(allowCwd(path.join(dir, 'sub', '..'), p).ok, true, 'a path that resolves inside is allowed');
  const out = allowCwd(path.resolve(dir, '..'), p);
  assert.equal(out.ok, false, 'the parent of the root is outside it');
  assert.match(out.reason, /outside every allowed root/);
  assert.equal(allowCwd(ROOT, p).ok, false, 'ROOT is outside a policy rooted at a tmp dir');
});

// ================================================================== runArgv

test('an allowed argv runs and returns its stdout, its code and its milliseconds', async (t) => {
  const dir = newTmpDir(t);
  const res = await runArgv([NODE, '-e', 'console.log(1)'], { cwd: dir, policy: nodeOnly([dir]) });
  assert.equal(res.ok, true, 'it ran: ' + JSON.stringify(res.reason));
  assert.equal(res.code, 0, 'it exited 0');
  assert.equal(res.stdout.trim(), '1', 'stdout came back');
  assert.equal(res.stderr, '', 'stderr was empty');
  assert.equal(res.truncated, false, 'nothing was truncated');
  assert.deepEqual(res.argv, [NODE, '-e', 'console.log(1)'], 'the result names the argv it ran');
  assert.ok(res.ms >= 0 && Number.isFinite(res.ms), 'the result carries milliseconds');
});

test('a shell metacharacter inside an argument stays a literal: nothing else runs, nothing is written', async (t) => {
  const dir = newTmpDir(t);
  const marker = path.join(dir, 'pwned.txt');
  const nasty = '&& echo pwned > ' + marker + ' & | ; `whoami` $(whoami) \n echo two';
  const res = await runArgv([NODE, '-e', 'process.stdout.write(process.argv[1])', nasty], { cwd: dir, policy: nodeOnly([dir]) });
  assert.equal(res.code, 0, 'the one process exited 0');
  assert.equal(res.stdout, nasty, 'the argument came back byte for byte, unparsed');
  assert.equal(existsSync(marker), false, 'no redirect happened: there is no shell to read one');
  assert.equal(res.stdout.includes('pwned\n'), false, 'no second command produced output');
});

test('a disallowed prefix is refused and no process is started', async (t) => {
  const dir = newTmpDir(t);
  const brain = record(new Brain({ name: 'refuse-prefix' }));
  const res = await runArgv(['cmd.exe', '/c', 'echo pwned'], { cwd: dir, policy: nodeOnly([dir]), brain });
  assert.equal(res.refused, true, 'it was refused');
  assert.equal(res.code, null, 'there is no exit code because there was no process');
  assert.equal(res.stdout, '', 'nothing was captured');
  assert.match(res.reason, /matches no allowed prefix/);
  assert.equal(ledgerOf(brain, 'act.shell').length, 0, 'no run event: nothing ran');
  assert.equal(ledgerOf(brain, 'act.shell.refused').length, 1, 'the refusal is in the ledger');
});

test('a cwd outside the roots is refused, even for an allowed program', async (t) => {
  const dir = newTmpDir(t);
  const res = await runArgv([NODE, '-e', 'console.log(1)'], { cwd: path.resolve(dir, '..'), policy: nodeOnly([dir]) });
  assert.equal(res.refused, true, 'it was refused');
  assert.match(res.reason, /outside every allowed root/);
  assert.equal(res.stdout, '', 'nothing ran');
});

test('opts.env with values is refused: this code never handles a credential', async (t) => {
  const dir = newTmpDir(t);
  const res = await runArgv([NODE, '-e', 'console.log(1)'], { cwd: dir, policy: nodeOnly([dir]), env: { TOKEN: 'sk-not-a-real-key' } });
  assert.equal(res.refused, true, 'it was refused');
  assert.match(res.reason, /never handles a credential value/);
});

test('a 10 second sleep is killed by a 1 second timeout, and its child dies with it', async (t) => {
  const dir = newTmpDir(t);
  const marker = path.join(dir, 'grandchild.log');
  // The grandchild appends every 100ms forever. If the tree kill misses it, the file keeps
  // growing after the parent is dead, and that is exactly what this measures.
  //
  // It is spawned DETACHED, and that detail is the whole test. Measured on this machine
  // (scratch probe, 4 arms): a grandchild spawned with detached false dies when its parent
  // is killed with taskkill /F alone, because windows put it in the parent's job; only a
  // DETACHED grandchild survives a parent-only kill and needs the /T. A test written with
  // the easy grandchild passes whether or not the tree flag is there, which is an assertion
  // true of nothing.
  const grand = 'const fs=require("fs");setInterval(()=>{try{fs.appendFileSync(' + JSON.stringify(marker) + ',"x")}catch(e){}},100);';
  const parent = 'const cp=require("child_process");const c=cp.spawn(process.execPath,["-e",' + JSON.stringify(grand) + '],{stdio:"ignore",detached:true});c.unref();process.stdout.write("pid "+c.pid+"\\n");setInterval(()=>{},1000);';

  const t0 = Date.now();
  const res = await runArgv([NODE, '-e', parent], { cwd: dir, policy: nodeOnly([dir]), timeoutMs: 1000 });
  const elapsed = Date.now() - t0;
  const pid = Number((res.stdout.match(/pid (\d+)/) || [])[1]);
  t.after(() => { if (pid) { try { process.kill(pid, 'SIGKILL'); } catch { /* already dead */ } } });

  assert.equal(res.timedOut, true, 'the run reports the timeout');
  assert.equal(res.ok, false, 'a killed run is not ok');
  assert.ok(elapsed < 5000, 'it was killed near the timeout, not near the sleep: ' + elapsed + 'ms');
  assert.ok(Number.isFinite(pid) && pid > 0, 'the parent told us its child pid: ' + JSON.stringify(res.stdout));

  await wait(400);
  const a = existsSync(marker) ? statSync(marker).size : 0;
  await wait(900);
  const b = existsSync(marker) ? statSync(marker).size : 0;
  assert.ok(a > 0, 'the grandchild was really alive and really writing before the kill, so this assertion is about something: ' + a + ' bytes');
  assert.equal(b, a, 'the grandchild stopped writing: the tree went down with the parent (' + a + ' then ' + b + ' bytes)');
});

test('a 5 MB stdout is capped, and the cap is measured against the bytes the child produced', async (t) => {
  const dir = newTmpDir(t);
  const res = await runArgv([NODE, '-e', 'process.stdout.write("x".repeat(5*1024*1024))'], {
    cwd: dir, policy: nodeOnly([dir]), maxBytes: 65536, timeoutMs: 20000,
  });
  assert.equal(res.code, 0, 'the child finished writing and exited 0: ' + JSON.stringify(res.reason));
  assert.equal(res.truncated, true, 'the result says it was truncated');
  assert.equal(res.stdout.length, 65536, 'exactly the cap was kept');
  assert.ok(res.seen >= 5 * 1024 * 1024, 'the child really produced 5 MB: ' + res.seen + ' bytes seen');
  assert.equal(res.maxBytes, 65536, 'the tightened cap is the one that was applied');
  assert.equal(tightenTo(65536, 1048576), 65536, 'a caller may not widen the policy cap');
  assert.equal(tightenTo(65536, 1024), 1024, 'a caller may tighten it');
});

test('the ledger holds one event per run, with argv, code and ms, and never an output or a secret value', async (t) => {
  const dir = newTmpDir(t);
  const brain = record(new Brain({ name: 'act-shell-ledger' }));
  const policy = nodeOnly([dir]);
  const SECRET = 'sk-test-value-that-must-never-be-logged';
  process.env.BRAIN_ACT_SHELL_SECRET = SECRET;
  t.after(() => { delete process.env.BRAIN_ACT_SHELL_SECRET; });

  const bare = await runArgv([NODE, '-e', 'process.stdout.write(String(process.env.BRAIN_ACT_SHELL_SECRET||"none"))'], { cwd: dir, policy, brain });
  const named = await runArgv([NODE, '-e', 'process.stdout.write(String(process.env.BRAIN_ACT_SHELL_SECRET||"none"))'], { cwd: dir, policy, brain, envNames: ['BRAIN_ACT_SHELL_SECRET'] });
  const failed = await runArgv([NODE, '-e', 'process.exit(3)'], { cwd: dir, policy, brain });

  assert.equal(bare.stdout, 'none', 'an unnamed variable never reaches the child');
  assert.equal(named.stdout, SECRET, 'a named variable does reach the child');
  assert.equal(failed.code, 3, 'an exit code comes back as itself');

  const runs = ledgerOf(brain, 'act.shell');
  assert.equal(runs.length, 3, 'one event per run, no more and no less');
  for (const e of runs) {
    assert.ok(Array.isArray(e.argv) && e.argv[0] === NODE, 'the event names the argv');
    assert.ok(Number.isFinite(e.ms), 'the event carries ms');
    assert.equal(typeof e.code, 'number', 'the event carries the exit code');
    assert.equal(e.stdout, undefined, 'the event carries no output');
  }
  assert.deepEqual(runs[1].env, ['BRAIN_ACT_SHELL_SECRET'], 'the event names the variable');
  assert.equal(JSON.stringify(runs).includes(SECRET), false, 'no ledger event carries the value');
  assert.equal(childEnv(null).env.BRAIN_ACT_SHELL_SECRET, undefined, 'the base environment carries no unnamed variable');
  assert.ok(BASE_ENV_NAMES.includes('PATH'), 'the base environment carries PATH');
});

// ================================================================== the actuator

test('a motor signal becomes a gate proposal, and the approved run crosses the border', async (t) => {
  const dir = newTmpDir(t);
  const { brain, at, cell } = newBrain(t, { dir });
  assert.equal(cell.kind, SHELL_CELL_KIND, 'the actuator is a cell in the world region');
  assert.equal(cell.region, 'world', 'it lives in the world region');
  assert.ok(at.wired.includes('w.motor.out -> w.shell.motor'), 'motor drives it: ' + JSON.stringify(at.wired));
  assert.ok(at.wired.includes('w.shell.out -> w.percept.in'), 'its answer is a perception: ' + JSON.stringify(at.wired));

  const before = brain.gate.stats.proposed;
  brain.inject('w.shell', 'motor', { kind: 'event', data: { kind: SHELL_SIGNAL_KIND, argv: [NODE, '-e', 'process.stdout.write("from the hand")'], cwd: dir } });
  const ran = await pump(brain, () => cell.state.ran > 0, { rounds: 300, ms: 10 });
  assert.equal(ran, true, 'the run finished');
  assert.ok(brain.gate.stats.proposed > before, 'the gate was asked');

  const got = harvest(brain).filter((e) => e.stdout !== undefined);
  assert.equal(got.length, 1, 'one answer crossed the border: ' + JSON.stringify(got));
  assert.equal(got[0].stdout, 'from the hand', 'stdout arrived intact');
  assert.equal(got[0].code, 0, 'the code came with it');
  assert.equal(ledgerOf(brain, 'act.shell').length, 1, 'the run is in the ledger');
  assert.ok(ledgerOf(brain, 'world.act').some((e) => e.op === PROPOSAL_OP), 'the act is in the ledger as ' + PROPOSAL_OP);
});

test('the gate is a second authority: an act policy that allows a program the world policy does not runs nothing', async (t) => {
  const dir = newTmpDir(t);
  // The act policy allows this node binary. The world policy allows no executable at all.
  const { brain, cell } = newBrain(t, { dir, worldExec: [] });
  brain.inject('w.shell', 'motor', { kind: 'event', data: { kind: SHELL_SIGNAL_KIND, argv: [NODE, '-e', 'process.stdout.write("should not happen")'], cwd: dir } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 60, ms: 5 });

  assert.equal(cell.state.ran, 0, 'nothing ran');
  assert.equal(cell.state.running, 0, 'nothing is running');
  assert.equal(ledgerOf(brain, 'act.shell').length, 0, 'no run event exists');
  assert.ok(ledgerOf(brain, 'world.refused').some((e) => e.op === PROPOSAL_OP), 'the gate refusal is in the ledger');
  const errs = harvest(brain).filter((e) => e.error);
  assert.ok(errs.length >= 1, 'the refusal crossed the border: ' + JSON.stringify(errs));
  assert.ok(errs[0].argv && errs[0].argv[0] === NODE, 'the refusal names the argv it refused');
});

test('a gate that was never armed refuses the actuator, and nothing is spawned', async (t) => {
  const dir = newTmpDir(t);
  registerShellKind();
  const brain = record(new Brain({ name: 'unarmed-shell' }));
  const at = shellActuator(brain, nodeOnly([dir]), { prefix: 'u' });
  const cell = brain.cell(at.id);
  brain.inject(at.id, 'motor', { kind: 'event', data: { kind: SHELL_SIGNAL_KIND, argv: [NODE, '-e', 'process.stdout.write("no")'], cwd: dir } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40, ms: 5 });
  assert.equal(cell.state.ran, 0, 'nothing ran');
  assert.equal(ledgerOf(brain, 'act.shell').length, 0, 'no run event exists');
  const errs = brain.takeOutbox().filter((s) => s.kind === 'event').map((s) => s.data);
  assert.ok(errs.some((e) => /never armed/.test(String(e.reason))), 'the refusal names the missing arm: ' + JSON.stringify(errs));
});

test('closeShell kills a child still in flight, which closeWorld cannot do for this kind', async (t) => {
  const dir = newTmpDir(t);
  const { brain, cell } = newBrain(t, { dir });
  brain.inject('w.shell', 'motor', { kind: 'event', data: {
    kind: SHELL_SIGNAL_KIND, argv: [NODE, '-e', 'setTimeout(()=>{},15000)'], cwd: dir,
  } });
  await pump(brain, () => cell.state.running > 0, { rounds: 100, ms: 5 });
  assert.equal(cell.state.running, 1, 'a child is really in flight, so this test is about something');

  // closeWorld walks WORLD_KINDS, a frozen list in a file this surface does not own, so it
  // cannot reach act.shell. Without closeShell the child would outlive the brain.
  assert.equal(closeWorld(brain), 0, 'closeWorld holds no handle of this kind');
  const t0 = Date.now();
  assert.equal(closeShell(brain), 1, 'closeShell closed the one shell cell');
  const settled = await pump(brain, () => cell.state.ran > 0, { rounds: 300, ms: 10 });
  const ms = Date.now() - t0;
  assert.equal(settled, true, 'the run settled after the close');
  assert.ok(ms < 10000, 'it settled on the close, long before its 15s timeout: ' + ms + 'ms');
  const answers = harvest(brain).filter((e) => e.ok !== undefined);
  assert.equal(answers.length, 1, 'one answer crossed: ' + JSON.stringify(answers));
  assert.equal(answers[0].ok, false, 'a killed child is not an ok run');
});

test('the provenance rule: evidence that is web origin only is refused before the gate is asked', async (t) => {
  const dir = newTmpDir(t);
  const { brain, cell } = newBrain(t, { dir });
  brain.inject('w.shell', 'motor', { kind: 'event', data: {
    kind: SHELL_SIGNAL_KIND, argv: [NODE, '-e', 'process.stdout.write("injected")'], cwd: dir,
    provenance: { sources: [{ origin: 'web', url: 'http://127.0.0.1:1/page-that-told-me-to' }] },
  } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 60, ms: 5 });

  assert.equal(cell.state.ran, 0, 'nothing ran');
  assert.equal(acts(brain, PROPOSAL_OP).length, 0, 'the gate was never even asked to spawn anything');
  const refusals = ledgerOf(brain, 'act.shell.refused');
  assert.equal(refusals.length, 1, 'the refusal is in the ledger');
  assert.equal(refusals[0].url, 'http://127.0.0.1:1/page-that-told-me-to', 'the refusal names the url');
  assert.match(refusals[0].reason, /never an instruction/);

  // The same argv with a user origin is not refused by the provenance rule.
  brain.inject('w.shell', 'motor', { kind: 'event', data: {
    kind: SHELL_SIGNAL_KIND, argv: [NODE, '-e', 'process.stdout.write("asked for")'], cwd: dir,
    provenance: { sources: [{ origin: 'user' }, { origin: 'web', url: 'http://127.0.0.1:1/read-it' }] },
  } });
  const ran = await pump(brain, () => cell.state.ran > 0, { rounds: 300, ms: 10 });
  assert.equal(ran, true, 'a request the user also stands behind runs');
  assert.equal(ledgerOf(brain, 'act.shell.refused').length, 1, 'no second provenance refusal');
});

test('a motor signal of another kind is ignored, and a bad argv is refused without a proposal', async (t) => {
  const dir = newTmpDir(t);
  const { brain, cell } = newBrain(t, { dir });
  brain.inject('w.shell', 'motor', { kind: 'event', data: { kind: 'http.get', url: 'http://example.com' } });
  brain.tick(6);
  assert.equal(cell.state.refused, 0, 'a signal addressed to another hand is not a refusal');
  assert.equal(cell.state.ran, 0, 'and it runs nothing');

  brain.inject('w.shell', 'motor', { kind: 'event', data: { kind: SHELL_SIGNAL_KIND, argv: ['cmd.exe', '/c', 'echo pwned'], cwd: dir } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40, ms: 5 });
  assert.equal(acts(brain, PROPOSAL_OP).length, 0, 'a refused argv never became a proposal');
  assert.equal(ledgerOf(brain, 'act.shell').length, 0, 'nothing ran');
});

// ================================================================== the policy file

test('loadShellPolicy reads act/policy.json when it is there and denies everything when it is not', () => {
  const missing = loadShellPolicy(path.join(ROOT, 'act', 'no-such-policy.json'));
  assert.deepEqual(missing.argv, [], 'an absent file denies every prefix');
  assert.deepEqual(missing.roots, [ROOT], 'and roots at ROOT');

  const shipped = loadShellPolicy(null);
  assert.ok(Array.isArray(shipped.argv), 'the shipped policy has a prefix list');
  assert.equal(shipped.argv.length, 0, 'and it is empty: a fresh install runs no command');
  assert.ok(shipped.roots.length >= 1, 'it declares at least one root');
  assert.equal(allowArgv([NODE, '-e', '1'], shipped).ok, false, 'so the shipped policy runs nothing at all');
  assert.ok(shipped.timeoutMs > 0 && shipped.maxBytes > 0, 'the caps are set');
});

test('a policy is read from a nested shell block too, and a written file round trips', (t) => {
  const dir = newTmpDir(t);
  const file = path.join(dir, 'policy.json');
  writeFileSync(file, JSON.stringify({ hosts: [], shell: { argv: [['git', 'status']], roots: [dir], maxBytes: 4096, timeoutMs: 2000 } }));
  const p = loadShellPolicy(file);
  assert.deepEqual(p.argv, [['git', 'status']], 'the nested block was read');
  assert.equal(p.maxBytes, 4096, 'the cap was read');
  assert.equal(allowArgv(['git', 'status', '--short'], p).ok, true, 'the declared prefix is allowed');
  assert.equal(allowArgv(['git', 'commit'], p).ok, false, 'nothing else is');
  const broken = path.join(dir, 'broken.json');
  writeFileSync(broken, '{not json');
  const b = loadShellPolicy(broken);
  assert.deepEqual(b.argv, [], 'an unreadable policy denies everything rather than opening up');
  assert.ok(b.loadError, 'and it says why');
  assert.equal(readFileSync(file, 'utf8').length > 0, true, 'the test wrote its own policy, never the shipped one');
});

// ================================================================== the Linux tree kill
// board 17 builder (the organism's item), shell-linux. On Linux the child leads its own
// group and session, and a group kill alone missed test 9's detached grandchild on this host
// (13 then 22 bytes). act/shell.mjs now walks /proc and closes every ppid chain rooted at the
// child before the kill. These cases prove the walk two detached levels deep, with nothing
// below the child at all, against a planted /proc, and with the walk switched off (the
// control: the same grandchild keeps writing, so the walk is what kills it).

const HAS_PROC = process.platform !== 'win32' && existsSync('/proc/self/stat');
const J = JSON.stringify;
const sizeOf = (f) => (existsSync(f) ? statSync(f).size : 0);
const killPidFile = (f) => {
  try { const pid = Number(readFileSync(f, 'utf8')); if (pid > 1) process.kill(pid, 'SIGKILL'); } catch { /* never written or already dead */ }
};

test('a detached great-grandchild, two detached levels below the child, stops writing with the tree', { skip: process.platform !== 'win32' && !HAS_PROC ? 'no /proc on this posix platform: the group kill fallback cannot reach a detached descendant' : false }, async (t) => {
  const dir = newTmpDir(t);
  const m2 = path.join(dir, 'grandchild.log'), m3 = path.join(dir, 'great-grandchild.log');
  const p2 = path.join(dir, 'grandchild.pid'), p3 = path.join(dir, 'great-grandchild.pid');
  // Every level is spawned DETACHED, so on Linux each one calls setsid and sits in a group
  // and a session of its own: only the ppid chain links the great-grandchild to the child.
  const great = 'const fs=require("fs");fs.writeFileSync(' + J(p3) + ',String(process.pid));setInterval(()=>{try{fs.appendFileSync(' + J(m3) + ',"x")}catch(e){}},100);';
  const grand = 'const fs=require("fs"),cp=require("child_process");fs.writeFileSync(' + J(p2) + ',String(process.pid));const c=cp.spawn(process.execPath,["-e",' + J(great) + '],{stdio:"ignore",detached:true});c.unref();setInterval(()=>{try{fs.appendFileSync(' + J(m2) + ',"x")}catch(e){}},100);';
  const parent = 'const cp=require("child_process");const c=cp.spawn(process.execPath,["-e",' + J(grand) + '],{stdio:"ignore",detached:true});c.unref();process.stdout.write("pid "+c.pid+"\\n");setInterval(()=>{},1000);';
  t.after(() => { killPidFile(p2); killPidFile(p3); });

  const t0 = Date.now();
  const res = await runArgv([NODE, '-e', parent], { cwd: dir, policy: nodeOnly([dir]), timeoutMs: 2000 });
  const elapsed = Date.now() - t0;
  assert.equal(res.timedOut, true, 'the run reports the timeout');
  assert.equal(res.ok, false, 'a killed run is not ok');
  assert.ok(elapsed < 7000, 'it was killed near the timeout: ' + elapsed + 'ms');
  if (HAS_PROC) {
    assert.equal(res.killedBy, 'tree', 'the /proc walk did the kill: ' + res.killedBy);
    assert.ok(res.tree && res.tree.proc === true && res.tree.found >= 2, 'the walk found the grandchild and the great-grandchild: ' + J(res.tree));
  }

  await wait(400);
  const a2 = sizeOf(m2), a3 = sizeOf(m3);
  await wait(900);
  const b2 = sizeOf(m2), b3 = sizeOf(m3);
  t.diagnostic('great-grandchild bytes ' + a3 + ' then ' + b3 + ', grandchild bytes ' + a2 + ' then ' + b2);
  assert.ok(a2 > 0 && a3 > 0, 'both descendants were really alive and writing before the kill: ' + a2 + ' and ' + a3 + ' bytes');
  assert.equal(b2, a2, 'the grandchild stopped writing (' + a2 + ' then ' + b2 + ' bytes)');
  assert.equal(b3, a3, 'the great-grandchild stopped writing: two detached levels down went with the tree (' + a3 + ' then ' + b3 + ' bytes)');
});

test('a timeout on a child with 0 descendants still kills it and reports the timeout', async (t) => {
  const dir = newTmpDir(t);
  const t0 = Date.now();
  const res = await runArgv([NODE, '-e', 'setInterval(()=>{},1000)'], { cwd: dir, policy: nodeOnly([dir]), timeoutMs: 1000 });
  const elapsed = Date.now() - t0;
  assert.equal(res.timedOut, true, 'the run reports the timeout');
  assert.equal(res.ok, false, 'a killed run is not ok');
  assert.equal(res.code, null, 'a killed child has no exit code');
  assert.match(String(res.reason), /killed by the 1000ms timeout/, 'the reason names the timeout: ' + res.reason);
  assert.ok(elapsed < 5000, 'it was killed near the timeout: ' + elapsed + 'ms');
  if (HAS_PROC) {
    assert.equal(res.killedBy, 'tree', 'the /proc walk ran: ' + res.killedBy);
    assert.equal(res.tree.found, 0, 'the walk found nothing below the child: ' + J(res.tree));
    assert.equal(res.tree.proc, true, 'the walk read /proc');
    assert.equal(res.signal, 'SIGKILL', 'the child itself was killed: ' + res.signal);
    assert.doesNotMatch(String(res.reason), /group kill alone/, 'no fallback is claimed when /proc was read');
  }
});

test('the control: with /proc unreadable the group kill alone runs, the reason says so, and the detached grandchild keeps writing', { skip: process.platform === 'win32' ? 'win32 kills with taskkill /T, there is no group kill to control' : false }, async (t) => {
  const dir = newTmpDir(t);
  const marker = path.join(dir, 'grandchild.log');
  // Test 9's grandchild, byte for byte, with the walk switched off by a /proc that is not there.
  const grand = 'const fs=require("fs");setInterval(()=>{try{fs.appendFileSync(' + J(marker) + ',"x")}catch(e){}},100);';
  const parent = 'const cp=require("child_process");const c=cp.spawn(process.execPath,["-e",' + J(grand) + '],{stdio:"ignore",detached:true});c.unref();process.stdout.write("pid "+c.pid+"\\n");setInterval(()=>{},1000);';
  const res = await runArgv([NODE, '-e', parent], { cwd: dir, policy: nodeOnly([dir]), timeoutMs: 1000, procRoot: path.join(dir, 'no-proc-here') });
  const pid = Number((res.stdout.match(/pid (\d+)/) || [])[1]);
  t.after(() => { if (pid) { try { process.kill(pid, 'SIGKILL'); } catch { /* already dead */ } } });

  assert.equal(res.timedOut, true, 'the run reports the timeout');
  assert.equal(res.killedBy, 'group', 'the fallback is the process group kill: ' + res.killedBy);
  assert.match(String(res.reason), /killed by the 1000ms timeout; no readable .*no-proc-here on this platform: the process group kill alone, which misses a detached grandchild/, 'the reason says the walk did not run: ' + res.reason);
  assert.equal(res.tree.proc, false, 'the report says /proc was not read');
  assert.ok(Number.isFinite(pid) && pid > 0, 'the parent told us its child pid: ' + J(res.stdout));

  await wait(400);
  const a = sizeOf(marker);
  await wait(900);
  const b = sizeOf(marker);
  t.diagnostic('control grandchild bytes ' + a + ' then ' + b);
  assert.ok(a > 0, 'the grandchild was alive before the kill: ' + a + ' bytes');
  assert.ok(b > a, 'with the walk off the group kill misses the detached grandchild, which is why the walk exists (' + a + ' then ' + b + ' bytes)');
});

test('descendants walks a planted /proc: every ppid chain from the root, deepest first, orphans by session or group, never the root, this process or pid 1', (t) => {
  const dir = newTmpDir(t);
  const proc = path.join(dir, 'proc');
  const stat = (pid, comm, ppid, pgrp, sid, start) => pid + ' (' + comm + ') S ' + ppid + ' ' + pgrp + ' ' + sid + ' 0 -1 4194304 0 0 0 0 0 0 0 0 20 0 1 0 ' + start + ' 1000 100';
  const plant = (name, text) => { mkdirSync(path.join(proc, name), { recursive: true }); if (text != null) writeFileSync(path.join(proc, name, 'stat'), text); };
  const ROOTPID = 700001;
  plant('1', stat(1, 'init', 0, 1, 1, 5));
  plant(String(ROOTPID), stat(ROOTPID, 'node', 699999, ROOTPID, ROOTPID, 100));
  plant('700002', stat(700002, 'a (b) c', ROOTPID, 700002, 700002, 101));    // detached child of the root, a name with spaces and parens
  plant('700003', stat(700003, 'node', 700002, 700003, 700003, 102));        // detached, two levels down
  plant('700004', stat(700004, 'node', 700003, 700004, 700004, 103));        // detached, three levels down
  plant('700005', stat(700005, 'orphan', 1, ROOTPID, ROOTPID, 104));        // reparented to 1, still in the root's session
  plant('700006', stat(700006, 'node', 700005, 700006, 700006, 105));        // below the orphan
  plant('700007', stat(700007, 'stranger', 1, 700007, 700007, 106));        // unrelated
  plant('700008', stat(700008, 'stranger', 700007, 700007, 700007, 107));   // below the stranger
  plant(String(process.pid), stat(process.pid, 'self', ROOTPID, ROOTPID, ROOTPID, 108)); // never this process
  plant('700009', 'garbled');                                                 // unreadable stat, skipped
  plant('700010', null);                                                      // no stat at all, skipped
  plant('self', stat(ROOTPID, 'node', 699999, ROOTPID, ROOTPID, 100));         // not a pid, skipped

  assert.deepEqual(parseProcStat(stat(700002, 'a (b) c', ROOTPID, 700002, 700002, 101)), { pid: 700002, state: 'S', ppid: ROOTPID, pgrp: 700002, session: 700002, start: '101' }, 'the fields are read after the LAST paren');
  assert.equal(parseProcStat('garbled'), null, 'a garbled line is no process');

  const d = descendants(ROOTPID, proc);
  assert.deepEqual(d.map((x) => x.pid), [700004, 700003, 700006, 700002, 700005], 'the whole tree, deepest first, and nothing else: ' + J(d));
  assert.deepEqual(d.map((x) => x.depth), [3, 2, 2, 1, 1], 'the depths of the walk');
  assert.equal(d.some((x) => x.pid === process.pid || x.pid === 1 || x.pid === ROOTPID), false, 'never the root, this process or pid 1');
  assert.deepEqual(descendants(700004, proc), [], 'a leaf has 0 descendants');
  assert.equal(descendants(ROOTPID, path.join(dir, 'missing')), null, 'an unreadable /proc answers null, which is the group kill fallback');
});
