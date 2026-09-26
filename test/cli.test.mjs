// test/cli.test.mjs: the CLI is tested the way it is used: as a child process, against a
// throwaway state directory handed to it through BRAIN_STATE_DIR. Nothing here reaches into
// the module graph, so these tests fail exactly when a user would be failed.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BIN = path.join(ROOT, 'bin', 'brain.mjs');
const STATE = mkdtempSync(path.join(tmpdir(), 'brain-cli-'));
const ENV = { ...process.env, BRAIN_STATE_DIR: STATE, NO_COLOR: '1', FORCE_COLOR: '' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

after(() => { rmSync(STATE, { recursive: true, force: true }); });

function cli(args) {
  return spawnSync(process.execPath, [BIN, ...args], { cwd: ROOT, env: ENV, encoding: 'utf8', timeout: 120_000 });
}
function cliJSON(args) {
  const r = cli([...args, '--json']);
  assert.equal(r.status, 0, 'brain ' + args.join(' ') + ' exited ' + r.status + '\nstdout: ' + r.stdout + '\nstderr: ' + r.stderr);
  let p;
  try { p = JSON.parse(r.stdout); } catch (e) { assert.fail('brain ' + args.join(' ') + ' did not print JSON: ' + r.stdout.slice(0, 400)); }
  assert.equal(p.ok, true, 'brain ' + args.join(' ') + ' reported ' + JSON.stringify(p.error));
  return p;
}
function cliText(args) {
  const r = cli(args);
  assert.equal(r.status, 0, 'brain ' + args.join(' ') + ' exited ' + r.status + '\n' + r.stderr);
  return r.stdout;
}

// ---------------------------------------------------------------- init
test('init creates the state directory, a snapshot and a ledger, and refuses to clobber', () => {
  const p = cliJSON(['init', 'alpha']);
  assert.equal(p.name, 'alpha');
  assert.equal(p.seed, 'basic');
  assert.ok(existsSync(path.join(STATE, 'alpha', 'snapshot.json')), 'snapshot.json written');
  assert.ok(existsSync(path.join(STATE, 'alpha', 'ledger', 'ledger.jsonl')), 'ledger.jsonl written');
  assert.ok(existsSync(path.join(STATE, 'alpha', 'meta.json')), 'meta.json written');
  assert.ok(p.bytes > 1000, 'snapshot has content, got ' + p.bytes + ' bytes');
  assert.equal(p.summary.t, 0);
  assert.equal(p.summary.cells, 17);
  assert.equal(p.summary.edges, 13);

  const again = cli(['init', 'alpha', '--json']);
  assert.equal(again.status, 1, 'a second init refuses');
  assert.match(JSON.parse(again.stdout).error, /already exists/);
  assert.equal(JSON.parse(again.stdout).ok, false);

  const forced = cliJSON(['init', 'alpha', '--force']);
  assert.equal(forced.summary.t, 0);

  const listed = cliJSON(['list']);
  assert.ok(listed.brains.some((b) => b.name === 'alpha'));
});

// ---------------------------------------------------------------- the clock
test('tick advances t by exactly N, across separate processes', () => {
  cliJSON(['init', 'clockwork']);
  assert.equal(cliJSON(['status', 'clockwork']).summary.t, 0);
  const a = cliJSON(['tick', 'clockwork', '7']);
  assert.equal(a.ticked, 7);
  assert.equal(a.from, 0);
  assert.equal(a.t, 7);
  assert.equal(cliJSON(['status', 'clockwork']).summary.t, 7);
  const b = cliJSON(['tick', 'clockwork', '13']);
  assert.equal(b.t, 20);
  assert.equal(cliJSON(['status', 'clockwork']).summary.t, 20, 'the snapshot persisted the clock between processes');
  // --ticks=N is accepted as well as a positional
  const c = cliJSON(['tick', 'clockwork', '--ticks=5']);
  assert.equal(c.t, 25);
  // the periodic heartbeat cell has a 1 s period, so it has run exactly once by t=1000
  cliJSON(['tick', 'clockwork', '1000']);
  const beat = cliJSON(['inspect', 'clockwork', 'cell', 'h.tick']);
  assert.equal(beat.stats.runs, 2, 'h.tick fired at t=0 and t=1000');
});

// ---------------------------------------------------------------- exactness through the CLI
test('inject then tick puts the exact comparison of 9.11 and 9.9 in the outbox as -1', () => {
  cliJSON(['init', 'exact']);
  const ia = cliJSON(['inject', 'exact', 'c.cmp', 'a', 'num', '9.11']);
  assert.equal(ia.injected.text, '911/100', 'the decimal was read exactly, not as a float');
  const ib = cliJSON(['inject', 'exact', 'c.cmp', 'b', 'num', '9.9']);
  assert.equal(ib.injected.text, '99/10');

  const t = cliJSON(['tick', 'exact', '3']);
  const cmp = t.outbox.find((s) => s.cell === 'c.cmp');
  assert.ok(cmp, 'c.cmp emitted, outbox was ' + JSON.stringify(t.outbox));
  assert.equal(cmp.kind, 'event');
  assert.equal(cmp.data.cmp, -1, '9.11 is less than 9.9');
  assert.equal(cmp.data.a, '911/100');
  assert.equal(cmp.data.b, '99/10');

  // and the same result reads back in the human output
  cliJSON(['inject', 'exact', 'c.cmp', 'a', 'num', '9.9']);
  cliJSON(['inject', 'exact', 'c.cmp', 'b', 'num', '9.11']);
  const text = cliText(['tick', 'exact', '3']);
  assert.match(text, /"cmp":1/, 'the reversed comparison is +1: ' + text);

  const bad = cli(['inject', 'exact', 'c.cmp', 'a', 'hv', '"cat"', '--json']);
  assert.equal(bad.status, 1, 'a kind the port refuses is refused at inject time');
  assert.match(JSON.parse(bad.stdout).error, /does not accept hv/);

  const malformed = cli(['inject', 'exact', 'p.encode', 'in', 'event', '{not json', '--json']);
  assert.equal(malformed.status, 1);
  assert.match(JSON.parse(malformed.stdout).error, /not valid JSON/);
});

// ---------------------------------------------------------------- inspect
test('inspect prints the cell: ports, policy, stats, state and both edge directions', () => {
  cliJSON(['init', 'looking']);
  cliJSON(['inject', 'looking', 'p.encode', 'in', 'event', '{"text":"hello brain"}']);
  cliJSON(['tick', 'looking', '6']);

  const p = cliJSON(['inspect', 'looking', 'cell', 'p.encode']);
  assert.equal(p.what, 'cell');
  assert.equal(p.id, 'p.encode');
  assert.equal(p.kind, 'encode.hv');
  assert.equal(p.region, 'perception');
  assert.equal(p.circuit, 'text');
  assert.equal(p.periodLabel, 'event');
  assert.equal(p.stats.runs, 1);
  assert.deepEqual(p.portRows.filter((r) => r.dir === 'in').map((r) => r.name), ['in']);
  assert.deepEqual(p.portRows.filter((r) => r.dir === 'out').map((r) => r.name), ['hv']);
  assert.equal(p.edgesIn.length, 0);
  assert.equal(p.edgesOut.length, 4);
  assert.ok(p.edgesOut.some((e) => e.to === 'a.bundle.in'));

  const text = cliText(['inspect', 'looking', 'p.encode']);
  assert.match(text, /cell p\.encode/);
  assert.match(text, /encode\.hv/);
  assert.match(text, /a\.bundle\.in/);
  assert.match(text, /perception\/text/);

  // the other three things a brain is made of
  assert.equal(cliJSON(['inspect', 'looking', 'circuit', 'perception/text']).cells.length, 2);
  const region = cliJSON(['inspect', 'looking', 'region', 'association']);
  assert.equal(region.cells.length, 3);
  const edge = cliJSON(['inspect', 'looking', 'edge', 'p.encode>a.bundle']);
  assert.equal(edge.src, 'p.encode');
  assert.equal(edge.dst, 'a.bundle');
  assert.equal(edge.state, 'active');

  const missing = cli(['inspect', 'looking', 'cell', 'nope', '--json']);
  assert.equal(missing.status, 1);
  assert.match(JSON.parse(missing.stdout).error, /no cell nope/);
});

// ---------------------------------------------------------------- provenance
test('trace prints an upstream tree that reaches p.encode, naming cells, edges and memories', () => {
  cliJSON(['init', 'provenance']);
  cliJSON(['inject', 'provenance', 'p.encode', 'in', 'event', '{"text":"hello brain"}']);
  cliJSON(['tick', 'provenance', '8']);

  const runs = cliJSON(['ledger', 'provenance', '--type', 'cell.run', '--n', '50']);
  const downstream = runs.rows.filter((r) => r.what.startsWith('a.cleanup') || r.what.startsWith('a.predict'));
  assert.ok(downstream.length, 'something downstream of p.encode ran: ' + JSON.stringify(runs.rows));
  const seq = downstream[downstream.length - 1].seq;

  const tr = cliJSON(['trace', 'provenance', String(seq), '--depth', '10']);
  assert.equal(tr.root, seq);
  assert.ok(tr.cells.includes('p.encode'), 'the tree reaches p.encode, got ' + JSON.stringify(tr.cells));
  assert.ok(tr.cells.includes('a.bundle'), 'and the cell in between, got ' + JSON.stringify(tr.cells));
  assert.equal(tr.missing.length, 0, 'no ledger event on the path was missing');
  const encode = tr.nodes.find((n) => n.type === 'cell.run' && n.cell === 'p.encode');
  assert.equal(encode.kind, 'encode.hv');
  assert.equal(encode.region, 'perception');
  assert.ok(tr.nodes.some((n) => n.type === 'signal' && n.cell === 'external'), 'the tree terminates at the external injection');
  assert.ok(tr.edgeCount >= 1, 'at least one connectome edge was named on the path');
  const viaEdge = tr.nodes.find((n) => n.edge);
  assert.equal(typeof viaEdge.edge.w, 'number');

  const text = cliText(['trace', 'provenance', String(seq), '--depth', '10']);
  assert.match(text, /p\.encode/);
  assert.match(text, /a\.bundle/);
  assert.match(text, /external/);
  assert.match(text, /cells on this path/);

  // trace last is the same tree when the last run is the one we asked for
  assert.ok(cliJSON(['trace', 'provenance', 'last']).nodes.length >= 1);
});

// ---------------------------------------------------------------- versions
test('snapshot labels, replay reproduces the live brain exactly, and diff names what moved', () => {
  cliJSON(['init', 'versions']);
  const base = cliJSON(['snapshot', 'versions', '--label', 'base']);
  assert.equal(base.label, 'base');
  assert.ok(existsSync(path.join(STATE, 'versions', 'snapshots', 'base.json')));

  cliJSON(['tick', 'versions', '3000']);
  cliJSON(['snapshot', 'versions', '--label', 'later']);
  assert.deepEqual(cliJSON(['status', 'versions']).labels.map((l) => l.label).sort(), ['base', 'later']);

  const d = cliJSON(['diff', 'versions', 'base', 'later']);
  assert.equal(d.clock.a.t, 0);
  assert.equal(d.clock.b.t, 3000);
  assert.equal(d.cells.a, d.cells.b);
  const beat = d.cellChanges.find((c) => c.cell === 'h.tick');
  assert.ok(beat, 'the 1 s heartbeat cell moved: ' + JSON.stringify(d.cellChanges));
  assert.deepEqual(beat.runs, [0, 3], 'the 1 s heartbeat ran at t=0, t=1000 and t=2000');

  const r = cliJSON(['replay', 'versions', 'base', '--ticks', '3000']);
  assert.equal(r.label, 'base');
  assert.equal(r.ticks, 3000);
  assert.equal(r.from.t, 0);
  assert.equal(r.replayed.t, 3000);
  assert.equal(r.live.t, 3000);
  assert.equal(r.diff.clock.a.t, r.diff.clock.b.t);
  assert.deepEqual(r.diff.cellChanges, [], 'replaying the label reproduced the live brain cell for cell');
  assert.deepEqual(r.diff.edgesAdded, []);
  assert.deepEqual(r.diff.edgesRemoved, []);
  assert.deepEqual(r.diff.weightChanges, []);

  const text = cliText(['diff', 'versions', 'base', 'later']);
  assert.match(text, /diff base -> later/);
  assert.match(text, /h\.tick/);

  const nope = cli(['replay', 'versions', 'ghost', '--json']);
  assert.equal(nope.status, 1);
  assert.match(JSON.parse(nope.stdout).error, /no labelled snapshot "ghost"/);
});

// ---------------------------------------------------------------- authority
test('the gate holds a proposal, the CLI lists it, and approve applies it and logs the decision', () => {
  cliJSON(['init', 'authority']);
  const p = cliJSON(['propose', 'authority', 'region.add', '{"name":"experimental","doc":"an isolated research region"}']);
  assert.equal(p.proposal.status, 'pending', 'region.add is a human required kind and must be held');
  const id = p.proposal.id;

  const pending = cliJSON(['proposals', 'authority']);
  assert.equal(pending.pending.length, 1);
  assert.equal(pending.pending[0].id, id);
  assert.ok(pending.humanRequired.includes('region.add'));

  const ok = cliJSON(['approve', 'authority', String(id)]);
  assert.equal(ok.proposal.status, 'approved');
  assert.equal(ok.applied, true);
  assert.ok(Object.keys(cliJSON(['status', 'authority']).summary.regions).includes('experimental'));
  assert.equal(cliJSON(['proposals', 'authority']).pending.length, 0);

  const decisions = cliJSON(['ledger', 'authority', '--type', 'decision', '--n', '10']);
  assert.equal(decisions.rows.length, 1);
  assert.match(decisions.rows[0].what, /approved by human/);

  const p2 = cliJSON(['propose', 'authority', 'external.action', '{"do":"buy"}']);
  const no = cliJSON(['reject', 'authority', String(p2.proposal.id)]);
  assert.equal(no.proposal.status, 'rejected');
  assert.equal(no.applied, false);
});

// ---------------------------------------------------------------- catalogues and argument handling
test('kinds, primitives, help and the error envelope', () => {
  const k = cliJSON(['kinds']);
  assert.ok(k.kinds.length >= 20, 'registered ' + k.kinds.length + ' cell kinds');
  const enc = k.kinds.find((x) => x.kind === 'encode.hv');
  assert.equal(enc.in, 'in:event');
  assert.equal(enc.out, 'hv:hv');

  const pr = cliJSON(['primitives']);
  assert.ok(pr.primitives.some((x) => x.primitive === 'compare'));
  assert.ok(pr.primitives.some((x) => x.primitive === 'simulate'));

  const h = cliJSON(['help']);
  assert.ok(h.commands.length >= 20);
  assert.ok(h.commands.some((c) => c.name === 'run'));
  assert.ok(h.controlOps.includes('pause'));

  const bad = cli(['nonsense', '--json']);
  assert.equal(bad.status, 1);
  assert.equal(JSON.parse(bad.stdout).ok, false);
  assert.match(JSON.parse(bad.stdout).error, /unknown command/);

  const none = cli(['status', 'never-made', '--json']);
  assert.equal(none.status, 1);
  assert.match(JSON.parse(none.stdout).error, /no brain "never-made"/);

  // colour is off when stdout is not a TTY, so no escape sequences leak into a pipe
  assert.ok(!cliText(['help']).includes('['), 'no ANSI in piped output');
});

// ---------------------------------------------------------------- the persistent process
test('run --fast honours --ticks and autosaves along the way', () => {
  cliJSON(['init', 'runner']);
  const p = cliJSON(['run', 'runner', '--fast', '--ticks', '5000', '--autosave', '1000']);
  assert.equal(p.stoppedBy, 'ticks');
  assert.equal(p.runner.done, 5000);
  assert.equal(p.runner.mode, 'fast');
  assert.equal(p.runner.saves, 5, 'autosaved once per 1000 ticks, got ' + p.runner.saves);
  assert.equal(p.runner.lastSaveAt, 5000);
  assert.equal(p.summary.t, 5000);
  assert.equal(cliJSON(['status', 'runner']).summary.t, 5000, 'the final snapshot holds the clock');
  assert.ok(!existsSync(path.join(STATE, 'runner', 'control.json')), 'control.json removed on exit');
});

test('run --realtime holds one tick per millisecond of wall time and reports its drift', () => {
  cliJSON(['init', 'wallclock']);
  const p = cliJSON(['run', 'wallclock', '--realtime', '--spin', '--ticks', '1500', '--autosave', '0']);
  assert.equal(p.runner.mode, 'realtime');
  assert.equal(p.runner.done, 1500);
  assert.ok(p.runner.wallMs > 1400 && p.runner.wallMs < 2600, '1500 ticks took about 1500 ms of wall time, got ' + p.runner.wallMs + 'ms');
  assert.ok(p.runner.ticksPerSec > 600 && p.runner.ticksPerSec <= 1050, 'about 1000 ticks per second, got ' + p.runner.ticksPerSec);
  assert.ok(p.runner.drift.samples > 500, 'the loop corrected itself ' + p.runner.drift.samples + ' times');
  assert.ok(p.runner.drift.maxTicks < 250, 'drift stayed bounded, max ' + p.runner.drift.maxTicks + ' ticks');
});

test('the control plane answers a live brain: status, inspect, inject, pause, step, resume and stop', async () => {
  const name = 'living';
  cliJSON(['init', name]);
  const child = spawn(process.execPath, [BIN, 'run', name, '--realtime', '--spin', '--ticks', '600000', '--autosave', '500000', '--json'], { cwd: ROOT, env: ENV, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  const exited = new Promise((res) => child.on('exit', (code) => res(code)));

  try {
    // wait for the control plane to come up, polling exactly the way a user would
    let live = null;
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      const r = cli(['status', name, '--json']);
      if (r.status === 0) {
        const p = JSON.parse(r.stdout);
        if (p.ok && p.live) { live = p; break; }
      }
      await sleep(100);
    }
    assert.ok(live, 'the control plane never answered.\nstdout: ' + stdout + '\nstderr: ' + stderr);
    assert.equal(live.live, true);
    assert.equal(live.running, true);
    assert.match(live.control.url, /^http:\/\/127\.0\.0\.1:\d+$/);
    assert.equal(live.control.pid, child.pid);
    assert.ok(live.summary.t > 0, 'the live brain had already ticked past zero, t=' + live.summary.t);
    assert.equal(live.runner.mode, 'realtime');
    assert.ok(existsSync(path.join(STATE, name, 'control.json')), 'control.json is on disk while live');

    // inspect and inject reach the running organism, not the snapshot
    const insp = cliJSON(['inspect', name, 'cell', 'c.cmp']);
    assert.equal(insp.live, true);
    assert.equal(insp.id, 'c.cmp');

    cliJSON(['inject', name, 'c.cmp', 'a', 'num', '9.11']);
    const inj = cliJSON(['inject', name, 'c.cmp', 'b', 'num', '9.9']);
    assert.equal(inj.live, true);

    // pause freezes the clock, and two reads in a row agree
    const paused = cliJSON(['pause', name]);
    assert.equal(paused.paused, true);
    const s1 = cliJSON(['status', name]);
    await sleep(120);
    const s2 = cliJSON(['status', name]);
    assert.equal(s1.paused, true);
    assert.equal(s1.summary.t, s2.summary.t, 'a paused brain does not advance the clock');

    // step advances exactly N and hands back what came out
    const stepped = cliJSON(['step', name, '5']);
    assert.equal(stepped.stepped, 5);
    assert.equal(stepped.t, s2.summary.t + 5);
    assert.equal(stepped.live, true);
    const cmp = stepped.outbox.find((s) => s.cell === 'c.cmp');
    assert.ok(cmp, 'the injected comparison came out of the live brain: ' + JSON.stringify(stepped.outbox));
    assert.equal(cmp.data.cmp, -1);

    // resume, then stop through the control plane
    const resumed = cliJSON(['resume', name]);
    assert.equal(resumed.paused, false);
    await sleep(150);
    const moved = cliJSON(['status', name]);
    assert.ok(moved.summary.t > stepped.t, 'the clock moved again after resume');

    const stopping = cliJSON(['stop', name]);
    assert.equal(stopping.stopping, true);

    const code = await exited;
    assert.equal(code, 0, 'the run process exited cleanly.\nstdout: ' + stdout + '\nstderr: ' + stderr);
    const final = JSON.parse(stdout.trim());
    assert.equal(final.ok, true);
    assert.equal(final.cmd, 'run');
    assert.equal(final.stoppedBy, 'control');
    assert.equal(final.runner.precision, 'spin');
    // Realtime means one tick per millisecond of wall time. The loop corrects its own drift,
    // so what is asserted is that it stayed near the wall clock and never ran away.
    assert.ok(final.runner.drift.maxTicks < 250, 'drift stayed bounded, max was ' + final.runner.drift.maxTicks + ' ticks');
    assert.ok(final.runner.drift.samples > 100);

    assert.ok(!existsSync(path.join(STATE, name, 'control.json')), 'control.json removed on exit');
    const after = cliJSON(['status', name]);
    assert.equal(after.live, false, 'with the process gone, status falls back to the snapshot');
    assert.equal(after.summary.t, final.summary.t, 'the snapshot written on exit holds the final clock');
    assert.ok(readFileSync(path.join(STATE, name, 'ledger', 'ledger.jsonl'), 'utf8').length > 0);
  } finally {
    if (child.exitCode === null) { child.kill(); await exited.catch(() => {}); }
  }
});

test('a stale control.json is cleaned up and commands fall back to the snapshot', () => {
  cliJSON(['init', 'stale']);
  const file = path.join(STATE, 'stale', 'control.json');
  // port 1 on loopback refuses connections, which is what a killed process leaves behind
  writeFileSync(file, JSON.stringify({ name: 'stale', pid: 999999, host: '127.0.0.1', port: 1, url: 'http://127.0.0.1:1', token: 'x' }));
  const p = cliJSON(['status', 'stale']);
  assert.equal(p.live, false);
  assert.ok(!existsSync(file), 'the stale control file was removed');
});

// ---------------------------------------------------------------- startup cost
// `help` must not drag in the core module graph. This is asserted by observing what the
// process actually loads, through a module load hook, rather than by timing anything.
test('help loads neither the core modules nor the control plane; kinds loads both', () => {
  const spy = path.join(STATE, 'spy.mjs');
  writeFileSync(spy, [
    "import { registerHooks } from 'node:module';",
    'registerHooks({ load(url, ctx, next) {',
    "  if (url.includes('/cli/') || url.includes('/core/')) console.error('LOADED ' + url);",
    '  return next(url, ctx);',
    '} });',
  ].join('\n'));
  const loaded = (args) => {
    const r = spawnSync(process.execPath, ['--import', pathToFileURL(spy).href, BIN, ...args],
      { cwd: ROOT, env: ENV, encoding: 'utf8', timeout: 120_000 });
    assert.equal(r.status, 0, 'brain ' + args.join(' ') + ' exited ' + r.status + '\n' + r.stderr);
    return r.stderr.split('\n').filter((l) => l.startsWith('LOADED '))
      .map((l) => l.slice(7).replace(/^.*\/brain\//, ''));
  };

  const forHelp = loaded(['help']);
  assert.ok(forHelp.includes('cli/format.mjs'), 'help renders through format.mjs');
  assert.deepEqual(forHelp.filter((m) => m.startsWith('core/')), [], 'help loads no core module');
  assert.ok(!forHelp.includes('cli/ops.mjs'), 'help does not load cli/ops.mjs');
  assert.ok(!forHelp.includes('cli/control.mjs'), 'help does not load cli/control.mjs');
  assert.ok(!forHelp.includes('cli/run.mjs'), 'help does not load cli/run.mjs');

  // The same graph is still reachable: a command that needs it pulls it in on first use.
  const forKinds = loaded(['kinds']);
  assert.ok(forKinds.includes('cli/ops.mjs'), 'kinds loads cli/ops.mjs');
  assert.ok(forKinds.includes('core/cell.mjs'), 'kinds loads core/cell.mjs');
  assert.ok(forKinds.length > forHelp.length, 'kinds loads strictly more than help');
});

// ---------------------------------------------------------------- the learning subsystem
// learning/ belongs to another agent. Either it is present, in which case `rules` and `learn`
// must really work, or it is not, in which case both must say so plainly and exit non zero.
// Both outcomes are a pass; a crash or a silent success is not.
test('rules and learn either drive the learning subsystem or explain that it is absent', () => {
  const probe = cli(['rules', '--json']);
  const payload = JSON.parse(probe.stdout);
  if (probe.status !== 0) {
    assert.equal(payload.ok, false);
    assert.match(payload.error, /learning subsystem is not available yet/);
    const l = cli(['learn', 'alpha', '--json']);
    assert.equal(l.status, 1);
    assert.match(JSON.parse(l.stdout).error, /learning subsystem is not available yet/);
    return;
  }

  assert.equal(payload.ok, true);
  assert.ok(payload.rules.length > 0, 'at least one rule is registered');
  for (const r of payload.rules) {
    assert.equal(typeof r.rule, 'string');
    assert.ok(r.rule.length, 'every rule is named');
  }
  const names = payload.rules.map((r) => r.rule);

  cliJSON(['init', 'learner']);
  const p = cliJSON(['learn', 'learner', '--rules', names.slice(0, 2).join(','), '--ticks', '2000']);
  assert.equal(p.t.from, 0);
  assert.equal(p.t.to, 2000, 'learn advances the clock by exactly --ticks');
  assert.deepEqual(p.learning.rules, names.slice(0, 2), 'it ran the rules it was asked for');
  assert.ok(p.learning.ticks > 0, 'the engine saw ticks, got ' + p.learning.ticks);
  assert.ok(p.weights.edgesBefore > 0);
  assert.ok(p.weights.moved >= 0 && p.weights.moved <= p.weights.edgesBefore);
  assert.ok(p.weights.maxAbsDelta >= 0);

  // It persisted: a separate process sees the advanced clock.
  assert.equal(cliJSON(['status', 'learner']).summary.t, 2000);

  // An unknown rule is refused rather than silently ignored.
  const bad = cli(['learn', 'learner', '--rules', 'no-such-rule', '--ticks', '10', '--json']);
  assert.equal(bad.status, 1, 'an unknown rule name fails');
  assert.equal(JSON.parse(bad.stdout).ok, false);
});

// ---------------------------------------------------------------- ladder
test('ask --provider env takes variable NAMES, and a provider that did not answer prints its reason in the footer', () => {
  // 2026-09-26: --env-base/--env-key name environment variables; the CLI never sees a value. With the named
  // variable unset the model cell falls back to the null provider and the footer says so, instead of
  // presenting the null text as an answer. No network, no Ollama: the fall-back happens before any request.
  cliJSON(['init', 'envflags']);
  const out = cliText(['ask', 'envflags', 'write a function that merges two sorted arrays without duplicates in zig',
    '--provider', 'env', '--env-base', 'BRAIN_TEST_UNSET_BASE_VAR', '--env-key', 'BRAIN_TEST_UNSET_KEY_VAR', '--model', 'test-model']);
  assert.match(out, /fell back from env: environment variable BRAIN_TEST_UNSET_BASE_VAR is not set/, 'the footer names the unset variable: ' + out.slice(-400));
  assert.doesNotMatch(out, /BRAIN_TEST_UNSET_KEY_VAR=/, 'no value is ever printed');
});

test('ladder --quick prints the four columns, opens no socket and writes nothing', () => {
  const listed = cliJSON(['help']);
  assert.ok(listed.commands.some((c) => c.name === 'ladder'), 'ladder is a registered command');

  const LADDER_DIR = path.join(ROOT, 'bench', 'verdicts', 'ladder');
  const filesBefore = existsSync(LADDER_DIR) ? readdirSync(LADDER_DIR).length : 0;
  const p = cliJSON(['ladder', '--quick', '--date', '2026-09-18']);
  const filesAfter = existsSync(LADDER_DIR) ? readdirSync(LADDER_DIR).length : 0;
  assert.equal(p.date, '2026-09-18');
  assert.equal(p.quick, true);
  assert.equal(p.seed, 'ladder/2026-09-18');
  assert.equal(p.wrote, null, '--quick writes no dated file');
  assert.equal(filesAfter, filesBefore, '--quick adds no file under bench/verdicts/ladder');
  // The null arms and health, and no capability column: that is what --quick measures.
  assert.ok(p.columns.answer.score !== null && p.columns.code.score !== null);
  assert.equal(p.columns.answer.arm, 'null');
  assert.equal(p.columns.capability, undefined);
  assert.ok(p.columns.health.score > 0 && p.columns.health.score <= 1);
  assert.equal(p.composite, null, 'a column is absent, so there is no composite');
  assert.match(p.line, /target 5 to 10 percent/);

  // The text form is the bench's own lines, not a second rendering of the same numbers.
  const text = cliText(['ladder', '--quick', '--date', '2026-09-18']);
  assert.match(text, /^\s*LADDER 2026-09-18, tier 1/m);
  assert.match(text, /health {5}score/);
});
