// test/world.test.mjs: the world region, end to end, with a real socket, a real file, a
// real child process and a real loopback server. Nothing here talks to the network: the
// only host any test allows is a node:http server started inside the test itself, which is
// what makes "a denied host never fetched" a measurement and not an assumption. If a denied
// request had gone out it would have hit that same server, and the server counts its hits.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import path from 'node:path';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { serializeCell, deserializeCell } from '../core/cell.mjs';
import { hostAllowed } from '../world/policy.mjs';
import '../cells/basic.mjs';
import {
  attachWorld, authorize, closeWorld, worldStatus, worldTrace, worldActions, wouldAllow,
  isArmed, loadPolicy, normalizePolicy, waitForListen, WORLD_KIND, WORLD_KINDS,
  bookOf, loadTape, midOf, payableBuy, payableSell, resetScript, resetTape, synthTape, tapeSummary,
  FEE_ROUND_TRIP, VENUE_KINDS,
} from '../world/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');

// ---------------------------------------------------------------- harness
function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

// Tick and wait in alternation until done() is true. Everything the world does is
// asynchronous, and the only way a brain observes an answer is by running again.
async function pump(brain, done, { ticks = 1, rounds = 200, ms = 5 } = {}) {
  for (let i = 0; i < rounds; i++) {
    brain.tick(ticks);
    if (done()) return true;
    await wait(ms);
  }
  brain.tick(ticks);
  return done();
}

// A local server that counts every request it is asked to serve. The count is the whole
// point: a denied host must leave it at zero.
async function startServer(t, handler = null) {
  const state = { hits: 0, paths: [], bodies: [] };
  const server = http.createServer((req, res) => {
    state.hits++;
    state.paths.push(req.url);
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      state.bodies.push(body);
      if (handler) return handler(req, res, body);
      const text = JSON.stringify({ hello: 'world', path: req.url, method: req.method, echo: body || null, n: state.hits });
      res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
      res.end(text);
    });
  });
  server.on('connection', (s) => s.unref());
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  state.port = server.address().port;
  state.origin = 'http://127.0.0.1:' + state.port;
  t.after(() => new Promise((resolve) => { server.closeAllConnections?.(); server.close(() => resolve()); }));
  return state;
}

function newTmpDir(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-world-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function newBrain(t, policy, opts = {}) {
  const brain = new Brain({ name: 'world-test', seed: 'world-test' });
  const report = attachWorld(brain, policy, { wire: false, ...opts });
  t.after(() => closeWorld(brain));
  return { brain, report };
}

const events = (brain) => brain.takeOutbox().filter((s) => s.kind === 'event').map((s) => s.data);
// The border passes one event per run, so reading what crossed it means ticking first.
const harvest = (brain, ticks = 24) => { brain.tick(ticks); return events(brain); };
const ledgerHas = (brain, type, op) => worldActions(brain, { limit: 200, type }).some((e) => !op || e.op === op);

// ================================================================== the gate is the door

test('a gate that was never armed refuses every world act, and nothing leaves the process', async (t) => {
  const server = await startServer(t);
  const brain = new Brain({ name: 'unarmed' });
  brain.addCell({ id: 'http', kind: 'world.http', region: 'world', circuit: 'actuators', policy: { period: 1 } });
  t.after(() => closeWorld(brain));

  assert.equal(isArmed(brain.gate), false, 'a fresh gate knows nothing about world.act');
  brain.inject('http', 'req', { kind: 'event', data: { url: server.origin + '/nope' } });
  await pump(brain, () => brain.cell('http').state.refused > 0, { rounds: 20 });

  assert.equal(server.hits, 0, 'the server was never contacted');
  assert.equal(brain.cell('http').state.refused, 1, 'the request was refused');
  const errs = events(brain);
  assert.ok(errs.some((e) => /never armed/.test(String(e.reason))), 'the refusal names the missing arm: ' + JSON.stringify(errs));
});

test('the gate re-derives its own verdict: evidence from a lying cell changes nothing', async (t) => {
  const server = await startServer(t);
  const { brain } = newBrain(t, { http: { hosts: ['127.0.0.1:' + server.port] } });
  // Propose by hand with evidence that claims the action is fine. The what is what counts.
  const p = brain.gate.propose({
    kind: WORLD_KIND,
    what: { op: 'http.get', url: 'http://evil.example.com/x', method: 'GET' },
    why: 'a cell that lies about its evidence',
    by: 'test',
    evidence: { ok: true, reason: null, host: '127.0.0.1:' + server.port },
  }, brain.ctx);
  assert.equal(p.status, 'rejected', 'the gate rejected it on its own reading of the policy');
  assert.equal(server.hits, 0, 'proposing is computation: nothing was fetched');
});

// ================================================================== world.http

test('a denied host never fetches: the only allowed host is a local server, and it is never hit', async (t) => {
  const server = await startServer(t);
  // localhost and 127.0.0.1 are the SAME machine and the same port. Only one spelling is
  // on the allowlist, so a request for the other must be refused before a socket opens.
  // If the refusal leaked, the request would land on this very server and raise hits.
  const { brain } = newBrain(t, { http: { hosts: ['127.0.0.1:' + server.port] } });
  const cell = brain.cell('w.http');

  brain.inject('w.http', 'req', { kind: 'event', data: { url: 'http://localhost:' + server.port + '/denied' } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40 });
  await wait(50);
  brain.tick(4);

  assert.equal(server.hits, 0, 'no request was made: the server counted zero hits');
  assert.equal(cell.state.refused, 1, 'the cell recorded exactly one refusal');
  assert.equal(cell.state.inflight, 0, 'nothing was left in flight');
  assert.equal(cell.state.sent, 0, 'nothing was sent');
  assert.ok(brain.gate.stats.rejected >= 1, 'the gate rejected the proposal');
  assert.ok(ledgerHas(brain, 'world.refused', 'http.get'), 'the refusal is in the ledger');
  const errs = harvest(brain);
  assert.ok(errs.some((e) => /not on the allowlist/.test(String(e.reason))), 'the error names the allowlist: ' + JSON.stringify(errs));
});

test('an allowed loopback fetch succeeds and traces back to the cell run and signal that caused it', async (t) => {
  const server = await startServer(t);
  const { brain } = newBrain(t, { http: { hosts: ['127.0.0.1:' + server.port] } });
  const cell = brain.cell('w.http');

  // Injected into the MOTOR border, not into the actuator, so the chain has a real cell
  // run in the middle of it: inject -> w.motor runs -> signal -> w.http runs -> act.
  brain.inject('w.motor', 'in', { kind: 'event', data: { url: server.origin + '/ok', method: 'GET' } });
  await pump(brain, () => cell.state.sent > 0, { rounds: 100 });

  assert.equal(server.hits, 1, 'the allowed host was contacted exactly once');
  assert.equal(cell.state.sent, 1, 'the cell recorded one successful response');
  const got = harvest(brain).filter((e) => e.status === 200);
  assert.equal(got.length, 1, 'one response crossed the border into perception');
  assert.equal(got[0].json.hello, 'world', 'the body arrived intact');
  assert.equal(typeof got[0].trace.outcome, 'number', 'the response carries its own provenance');

  const chain = worldTrace(brain, got[0].trace.outcome, { print: false });
  assert.ok(chain.found, 'the trace found the chain');
  const types = chain.nodes.map((n) => n.type);
  for (const want of ['signal', 'cell.run', 'proposal', 'decision', 'world.act', 'world.outcome']) {
    assert.ok(types.includes(want), 'the chain contains a ' + want + ': ' + types.join(', '));
  }
  assert.ok(chain.nodes.some((n) => n.type === 'cell.run' && n.cell === 'w.motor'), 'the chain reaches the cell run that decided to act');
  assert.ok(chain.nodes.some((n) => n.type === 'decision' && n.status === 'approved'), 'the chain shows the approval that authorized it');
  assert.ok(chain.cells.includes('w.http'), 'the chain names the acting cell');
  assert.ok(chain.text.includes('world.trace'), 'the chain prints as text');
  assert.ok(chain.nodes[0].seq < chain.root, 'the chain is ordered cause first');

  const printed = [];
  worldTrace(brain, got[0].trace.outcome, { log: (s) => printed.push(s) });
  assert.equal(printed.length, 1, 'printing the chain is one block, not a line at a time');
  assert.ok(printed[0].split('\n').length >= 7, 'a line for the header and one per event: ' + printed[0]);
});

test('a POST to an allowed host carries its body, and a response can arrive as a vec', async (t) => {
  const server = await startServer(t, (req, res, body) => {
    const text = req.url === '/nums' ? '[1, 2, 3.5]' : JSON.stringify({ got: body });
    res.writeHead(200, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text) });
    res.end(text);
  });
  const { brain } = newBrain(t, { http: { hosts: ['127.0.0.1:' + server.port], methods: ['GET', 'POST'] } });
  const cell = brain.cell('w.http');

  brain.inject('w.http', 'req', { kind: 'event', data: { url: server.origin + '/echo', method: 'POST', body: { a: 1 } } });
  await pump(brain, () => cell.state.sent > 0, { rounds: 100 });
  assert.equal(JSON.parse(server.bodies[0]).a, 1, 'the POST body reached the server');

  brain.inject('w.http', 'req', { kind: 'event', data: { url: server.origin + '/nums', as: 'vec' } });
  await pump(brain, () => cell.state.sent > 1, { rounds: 100 });
  brain.tick(2);
  // as vec is refused at the event-only border on purpose, so it is counted, not emitted.
  assert.ok(brain.stats.refused >= 1, 'a vec response is refused by the event border, by design');
  assert.equal(cell.state.failed, 0, 'the fetch itself did not fail');
});

test('a POST method the policy does not list is refused before the socket opens', async (t) => {
  const server = await startServer(t);
  const { brain } = newBrain(t, { http: { hosts: ['127.0.0.1:' + server.port], methods: ['GET'] } });
  const cell = brain.cell('w.http');
  brain.inject('w.http', 'req', { kind: 'event', data: { url: server.origin + '/x', method: 'POST', body: 'x' } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40 });
  assert.equal(server.hits, 0, 'no socket was opened for a method the policy does not allow');
  assert.equal(cell.state.refused, 1, 'refused once');
});

// ================================================================== world.fs

test('fs: a write outside the allowed root is refused and the file is never created; a write inside succeeds', async (t) => {
  const dir = newTmpDir(t);
  const allowed = path.join(dir, 'allowed');
  const outside = path.join(dir, 'outside', 'secret.txt');
  const inside = path.join(allowed, 'note.txt');
  const { brain } = newBrain(t, { fs: { roots: [allowed] } });
  const cell = brain.cell('w.fs');

  brain.inject('w.fs', 'req', { kind: 'event', data: { op: 'write', path: outside, data: 'escaped' } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40 });
  assert.equal(existsSync(outside), false, 'the file outside the root was never created');
  assert.equal(existsSync(path.dirname(outside)), false, 'not even its directory was created');
  assert.equal(cell.state.writes, 0, 'no write was recorded');
  assert.ok(ledgerHas(brain, 'world.refused', 'fs.write'), 'the refusal is in the ledger');

  brain.inject('w.fs', 'req', { kind: 'event', data: { op: 'write', path: inside, data: 'inside the root' } });
  await pump(brain, () => cell.state.writes > 0, { rounds: 40 });
  assert.equal(readFileSync(inside, 'utf8'), 'inside the root', 'the write inside the root landed');

  brain.inject('w.fs', 'req', { kind: 'event', data: { op: 'read', path: inside } });
  await pump(brain, () => cell.state.reads > 0, { rounds: 40 });

  const got = harvest(brain).filter((e) => e.op === 'fs.read');
  assert.equal(got.length, 1, 'the read came back across the border');
  assert.equal(got[0].data, 'inside the root', 'the file contents arrived');
  const chain = worldTrace(brain, got[0].trace.outcome, { print: false });
  assert.ok(chain.nodes.some((n) => n.type === 'world.act' && n.op === 'fs.read'), 'the read traces back to its act');
});

test('fs: a symlink style escape is judged on the real path, and a read over the byte cap is refused', async (t) => {
  const dir = newTmpDir(t);
  const allowed = path.join(dir, 'allowed');
  mkdirSync(allowed, { recursive: true });
  writeFileSync(path.join(dir, 'outside.txt'), 'x');
  const { brain } = newBrain(t, { fs: { roots: [allowed], maxBytes: 8 } });
  const cell = brain.cell('w.fs');
  // A traversal that resolves out of the root is refused on the resolved path.
  brain.inject('w.fs', 'req', { kind: 'event', data: { op: 'read', path: path.join(allowed, '..', 'outside.txt') } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40 });
  assert.equal(cell.state.reads, 0, 'the traversal read nothing');

  writeFileSync(path.join(allowed, 'big.txt'), 'x'.repeat(64));
  brain.inject('w.fs', 'req', { kind: 'event', data: { op: 'read', path: path.join(allowed, 'big.txt') } });
  brain.tick(2);
  await wait(20);

  const errs = harvest(brain);
  assert.ok(errs.some((e) => /over the cap/.test(String(e.message || e.reason))), 'the byte cap refused the read: ' + JSON.stringify(errs));
});

// ================================================================== world.proc

test('proc: a non allowlisted executable is refused, an allowlisted one runs and returns its stdout', async (t) => {
  const { brain } = newBrain(t, { proc: { exec: [process.execPath] } });
  const cell = brain.cell('w.proc');

  brain.inject('w.proc', 'req', { kind: 'event', data: { exec: 'definitely-not-allowed-binary', args: ['--version'] } });
  await pump(brain, () => cell.state.refused > 0, { rounds: 40 });
  assert.equal(cell.state.ran, 0, 'nothing ran');
  assert.equal(cell.state.running, 0, 'nothing is running');
  assert.ok(ledgerHas(brain, 'world.refused', 'proc.spawn'), 'the refusal is in the ledger');

  brain.inject('w.proc', 'req', { kind: 'event', data: { exec: process.execPath, args: ['-e', 'process.stdout.write("from the world")'] } });
  await pump(brain, () => cell.state.ran > 0, { rounds: 200, ms: 10 });

  const got = harvest(brain).filter((e) => e.stdout !== undefined);
  assert.equal(got.length, 1, 'the child answered across the border');
  assert.equal(got[0].stdout, 'from the world', 'stdout arrived intact');
  assert.equal(got[0].code, 0, 'the child exited 0');
});

// ================================================================== world.net.listen

test('the loopback listener receives a POST and the brain ticks on it', async (t) => {
  let woken = 0;
  const brain = new Brain({ name: 'listener' });
  const report = attachWorld(brain, {
    listen: { enabled: true, host: '127.0.0.1', port: 0, path: '/signal' },
  }, { wire: false, wake: () => { woken++; brain.tick(3); } });
  t.after(() => closeWorld(brain));
  assert.ok(report.actuators.includes('w.listen'), 'the listener was attached');

  const cell = brain.cell('w.listen');
  brain.tick(1); // the first run proposes the endpoint and binds it
  const address = await waitForListen(cell, 3000);
  assert.ok(address.port > 0, 'the endpoint is bound to a real port');
  assert.equal(address.host, '127.0.0.1', 'it is bound to loopback');
  brain.takeOutbox();

  const ticksBefore = brain.stats.ticks;
  const res = await fetch(address.url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ hello: 'brain' }) });
  const body = await res.json();
  assert.equal(res.status, 200, 'the endpoint answered');
  assert.equal(body.ok, true, 'it accepted the signal');
  assert.equal(woken, 1, 'the arriving POST woke the brain exactly once');
  assert.ok(brain.stats.ticks > ticksBefore, 'the brain ticked on the POST: ' + ticksBefore + ' -> ' + brain.stats.ticks);

  const got = harvest(brain).filter((e) => e.payload);
  assert.equal(got.length, 1, 'the signal crossed the border into perception');
  assert.equal(got[0].payload.hello, 'brain', 'the payload arrived intact');
  assert.equal(cell.state.received, 1, 'the cell counted one arrival');

  const bad = await fetch('http://127.0.0.1:' + address.port + '/not-the-path', { method: 'POST', body: '{}' });
  assert.equal(bad.status, 404, 'an unknown path is refused');
  assert.equal(cell.state.rejected, 1, 'the refusal was counted');
});

test('a listener the policy does not enable never binds a port', async (t) => {
  const brain = new Brain({ name: 'no-listen' });
  attachWorld(brain, { listen: { enabled: false } }, { wire: false, listen: true });
  t.after(() => closeWorld(brain));
  const cell = brain.cell('w.listen');
  brain.tick(2);
  await wait(30);
  assert.equal(cell.state.listening, false, 'nothing is listening');
  assert.equal(cell.state.address, null, 'there is no address');
  assert.ok(/not enabled/.test(String(cell.state.reason)), 'the reason names the policy: ' + cell.state.reason);
});

// ================================================================== senses

test('sense.poll turns an allowlisted url into a periodic stream, and a denied one never opens', async (t) => {
  const server = await startServer(t);
  const { brain } = newBrain(t, {
    http: { hosts: ['127.0.0.1:' + server.port] },
    senses: { poll: [{ id: 'good', url: server.origin + '/poll', periodMs: 10 }, { id: 'bad', url: 'http://localhost:' + server.port + '/poll', periodMs: 10 }] },
  });
  const good = brain.cell('good'), bad = brain.cell('bad');
  await pump(brain, () => good.state.sent >= 2, { rounds: 200, ms: 10 });

  assert.ok(good.state.polls >= 2, 'the allowed poll ran more than once: ' + good.state.polls);
  assert.ok(server.hits >= 2, 'the server saw the stream: ' + server.hits);
  assert.equal(bad.state.polls, 0, 'the denied poll never polled');
  assert.ok(/not on the allowlist/.test(String(bad.state.reason)), 'the denied poll says why: ' + bad.state.reason);
  assert.ok(ledgerHas(brain, 'world.sense', 'sense.poll'), 'each arrival is a world.sense event');
  // One proposal opened the stream; the arrivals after it are logged, not re-proposed.
  const opens = worldActions(brain, { limit: 500, type: 'world.act' }).filter((e) => e.op === 'sense.poll');
  assert.equal(opens.length, 2, 'exactly two streams were ever proposed, one approved and one denied');
});

test('sense.watch sees a file change under an allowed root and refuses one outside it', async (t) => {
  const dir = newTmpDir(t);
  const allowed = path.join(dir, 'allowed');
  mkdirSync(allowed, { recursive: true });
  writeFileSync(path.join(dir, 'x.txt'), 'seed');
  const target = path.join(allowed, 'watched.txt');
  writeFileSync(target, 'one');
  const { brain } = newBrain(t, {
    fs: { roots: [allowed] },
    senses: { watch: [{ id: 'seen', path: target, debounceMs: 5 }, { id: 'unseen', path: path.join(dir, 'x.txt'), debounceMs: 5 }] },
  });
  const seen = brain.cell('seen'), unseen = brain.cell('unseen');
  brain.tick(2);
  assert.equal(unseen.state.watching, false, 'the watcher outside the root never opened');
  assert.ok(/outside every allowed root/.test(String(unseen.state.reason)), 'it says why: ' + unseen.state.reason);
  assert.equal(seen.state.watching, true, 'the watcher inside the root opened');

  writeFileSync(target, 'two');
  await pump(brain, () => seen.state.changes > 0, { rounds: 200, ms: 10 });
  assert.ok(seen.state.changes >= 1, 'the change was sensed');
  assert.ok(ledgerHas(brain, 'world.sense', 'sense.watch'), 'the arrival is in the ledger');
});

test('sense.stdin is refused unless the policy enables it, and reads lines when it does', async (t) => {
  const { Readable } = await import('node:stream');
  const off = newBrain(t, { senses: { stdin: false } }, { senses: false });
  off.brain.addCell({ id: 'in', kind: 'sense.stdin', region: 'world', circuit: 'senses', params: { stream: Readable.from(['a\n']) }, policy: { period: 1 } });
  off.brain.tick(2);
  assert.ok(/not enabled/.test(String(off.brain.cell('in').state.reason)), 'stdin is refused by default');

  const on = newBrain(t, { senses: { stdin: true } }, { senses: false });
  const stream = Readable.from(['first line\nsecond line\n']);
  on.brain.addCell({ id: 'in', kind: 'sense.stdin', region: 'world', circuit: 'senses', params: { stream }, policy: { period: 1 } });
  const cell = on.brain.cell('in');
  await pump(on.brain, () => cell.state.lines >= 2, { rounds: 100, ms: 5 });
  assert.equal(cell.state.lines, 2, 'both lines arrived');
  assert.equal(cell.state.reason, null, 'nothing was refused');
});

// ================================================================== the region itself

test('attachWorld grows a world region, wires it to perception and motor, and reports every edge', (t) => {
  const brain = new Brain({ name: 'wired' });
  brain.addCell({ id: 'p.encode', kind: 'encode.hv', region: 'perception', circuit: 'text', policy: { period: 'event' } });
  brain.addCell({ id: 'mo.fsm', kind: 'state.machine', region: 'motor', circuit: 'act', params: { initial: 'idle', transitions: { idle: { act: 'acting' } } }, policy: { period: 'event' } });
  const report = attachWorld(brain, { http: { hosts: ['127.0.0.1:1'] } });
  t.after(() => closeWorld(brain));

  assert.ok(brain.regions.has('world'), 'the region exists');
  assert.ok(brain.circuits.has('world/senses') && brain.circuits.has('world/actuators'), 'both circuits exist');
  assert.equal(report.armed, true, 'the gate is armed for world.act');
  assert.ok(report.wired.some((w) => w.startsWith('w.percept.out -> p.encode')), 'the world reaches perception: ' + report.wired.join(' | '));
  assert.ok(report.wired.some((w) => w.startsWith('mo.fsm.out -> w.motor.in')), 'motor reaches the world: ' + report.wired.join(' | '));
  for (const id of ['w.http', 'w.fs', 'w.proc', 'w.clock']) assert.ok(brain.byId.has(id), id + ' was added');

  const status = worldStatus(brain);
  assert.equal(status.armed, true, 'status reports the gate is armed');
  assert.deepEqual(status.reach.hosts, ['127.0.0.1:1'], 'status reports the declared reach');
  assert.equal(status.cells.length, Object.keys(report.cells).length, 'status sees every world cell');
});

test('the default policy on disk denies everything, and wouldAllow answers without acting', (t) => {
  const shipped = loadPolicy(null);
  assert.deepEqual(shipped.http.hosts, [], 'no host is allowed by default');
  assert.deepEqual(shipped.fs.roots, [], 'no root is allowed by default');
  assert.deepEqual(shipped.proc.exec, [], 'no executable is allowed by default');
  assert.equal(shipped.listen.enabled, false, 'nothing listens by default');
  assert.equal(shipped.senses.stdin, false, 'stdin is closed by default');

  const empty = normalizePolicy({});
  assert.equal(empty.http.timeoutMs, 5000, 'an unnamed timeout still has a value');

  const { brain } = newBrain(t, { http: { hosts: ['api.example.com'] } });
  assert.equal(wouldAllow(brain, { op: 'http.get', url: 'https://api.example.com/v1' }).ok, true, 'a named host is inside the reach');
  assert.equal(wouldAllow(brain, { op: 'http.get', url: 'https://other.example.com/v1' }).ok, false, 'anything else is not');
  assert.equal(wouldAllow(brain, { op: 'fs.read', path: '/etc/passwd' }).ok, false, 'no root means no file');
  assert.equal(wouldAllow(brain, { op: 'http.get', url: 'file:///etc/passwd' }).ok, false, 'a non http protocol is not a fetch');
  assert.equal(wouldAllow(brain, { op: 'http.get', url: 'http://user:pw@api.example.com/' }).ok, false, 'credentials in a url are refused');
  assert.equal(wouldAllow(brain, { op: 'nonsense.op' }).ok, false, 'an unknown op is not an op');
  assert.equal(brain.gate.stats.proposed, 0, 'asking what would be allowed proposed nothing');
});

test('every world kind is registered and every one of them can be snapshotted', (t) => {
  const dir = newTmpDir(t);
  const brain = new Brain({ name: 'snap', dir });
  attachWorld(brain, { fs: { roots: [dir] }, senses: { stdin: false } }, { wire: false });
  t.after(() => closeWorld(brain));
  brain.tick(3);
  const file = brain.snapshot(dir);
  assert.ok(existsSync(file), 'the snapshot was written');
  const j = JSON.parse(readFileSync(file, 'utf8'));
  const kinds = j.cells.map((c) => c.kind);
  for (const k of ['world.http', 'world.fs', 'world.proc', 'world.clock', 'world.relay']) assert.ok(kinds.includes(k), k + ' is in the snapshot');
  assert.ok(j.cells.every((c) => c.state === null || typeof c.state === 'object'), 'every state serialized');
});

test('no em dashes anywhere in world/ or in this test', () => {
  const dash = String.fromCharCode(0x2014);
  const files = readdirSync(path.join(ROOT, 'world')).map((n) => path.join(ROOT, 'world', n));
  files.push(path.join(ROOT, 'test', 'world.test.mjs'), path.join(ROOT, 'notes', 'world.md'));
  let checked = 0;
  for (const f of files) {
    if (!existsSync(f)) continue;
    checked++;
    assert.equal(readFileSync(f, 'utf8').includes(dash), false, 'em dash in ' + path.basename(f));
  }
  assert.ok(checked >= 7, 'checked every world file: ' + checked);
  // nine, plus the four the venue adds (sense.venue is counted once: it is in SENSE_KINDS
  // and in VENUE_KINDS, and WORLD_KINDS is the union, not the concatenation)
  assert.equal(WORLD_KINDS.length, 13, 'thirteen world kinds: ' + WORLD_KINDS.join(', '));
  assert.equal(VENUE_KINDS.length, 4, 'four of them are the venue: ' + VENUE_KINDS.join(', '));
});

test('world policy: a host verdict is cached per policy object and a new policy gets its own', () => {
  const p1 = { http: { hosts: ['example.com', '*.dilation.dev'] } };
  const a = hostAllowed(p1, 'https://api.dilation.dev/x?y=1');
  assert.equal(a.ok, true); assert.equal(a.entry, '*.dilation.dev');
  assert.equal(hostAllowed(p1, 'https://api.dilation.dev/x?y=1'), a, 'the same url on the same policy is the cached verdict');
  const no = hostAllowed(p1, 'https://evil.example.org/');
  assert.equal(no.ok, false);
  assert.equal(hostAllowed(p1, 'https://evil.example.org/'), no);
  assert.equal(hostAllowed(p1, 'not a url').ok, false);
  const p2 = { http: { hosts: ['evil.example.org'] } };
  assert.equal(hostAllowed(p2, 'https://evil.example.org/').ok, true, 'a different policy object is checked on its own');
  assert.equal(hostAllowed(p1, 'https://evil.example.org/').ok, false, 'and the first policy still refuses');
  for (let i = 0; i < 5000; i++) hostAllowed(p1, 'https://example.com/' + i);
  assert.equal(hostAllowed(p1, 'https://example.com/1').ok, true, 'past the bound the cache clears and re-derives, it never refuses');
});

// ================================================================== the venue
// The trading use case, inside the organism, paper only. Nothing in this section opens a
// connection to anything: the tape is generated in the test process, the fills are
// arithmetic on its reserves, and the assertion that there is no order path out of this
// process is made against the SOURCE of world/venue.mjs, which is the only form of that
// assertion that stays true when somebody edits the file.

const VENUE_POLICY = (tape, size = 0.02, fee = FEE_ROUND_TRIP) => ({
  venue: {
    enabled: true, paper: true, allowSynthetic: true,
    tapes: tape && tape.db ? [tape.db] : [], venues: [tape ? tape.venue : 'synthetic'],
    feeRoundTrip: fee, maxNotional: size, maxReadings: 1000000,
  },
});
const allows = (policy, what) => authorize(normalizePolicy(policy), what);

// One arm, run to quiet. growth and pruning are off: a brain that grew itself an edge mid
// run would not be the brain the other arm was.
function venueArm(t, tape, { decide = 'trader', orders = null, trader = null, size = 0.02, fee = FEE_ROUND_TRIP, policy = null } = {}) {
  resetTape(tape);
  if (orders) resetScript(orders);
  const brain = new Brain({ name: 'venue-test', seed: 'venue-test', growth: false, pruneEvery: 0, ledger: 'runs' });
  attachWorld(brain, policy === null ? VENUE_POLICY(tape, size, fee) : policy, {
    actuators: false, senses: false, listen: false, wire: false, tape,
    venue: { size, decide, orders, trader, feeRoundTrip: fee },
  });
  t.after(() => closeWorld(brain));
  const sense = brain.cell('w.venue'), book = brain.cell('w.book'), cell = brain.cell('w.decide');
  const motor = brain.cell('w.motor'), percept = brain.cell('w.percept');
  for (let i = 0; i < 40 * tape.readings + 2000; i++) {
    brain.tick(1);
    const quiet = cell.state.queue.length === 0 && motor.state.queue.length === 0 && percept.state.queue.length === 0;
    if (sense.state.done && quiet && Object.keys(book.state.positions).length === 0) break;
  }
  return { brain, book: bookOf(book), cells: { sense, book, decide: cell } };
}

test('the venue replay is deterministic per seed, and a different seed is a different tape', (t) => {
  const a1 = synthTape({ instruments: 5, readings: 24, seed: 'alpha', drift: 0.01, vol: 0.05 });
  const a2 = synthTape({ instruments: 5, readings: 24, seed: 'alpha', drift: 0.01, vol: 0.05 });
  const b1 = synthTape({ instruments: 5, readings: 24, seed: 'beta', drift: 0.01, vol: 0.05 });
  assert.deepEqual(a1.flat, a2.flat, 'the same seed builds the same tape, reading for reading');
  assert.notDeepEqual(a1.flat, b1.flat, 'a different seed is a different tape');
  assert.equal(tapeSummary(a1).readings, 5 * 24, 'the tape is every reading of every instrument');

  const one = venueArm(t, a1);
  const two = venueArm(t, a2);
  assert.ok(one.book.trips > 0, 'the organism traded at all: ' + one.book.trips + ' round trips');
  assert.equal(two.book.trips, one.book.trips, 'the same seed gives the same number of round trips');
  assert.equal(two.book.realized, one.book.realized, 'and the same realized p and l to the last bit: ' + one.book.realized);
  assert.equal(two.book.deployed, one.book.deployed, 'and the same deployed notional');
  assert.deepEqual(two.book.trades, one.book.trades, 'and trip for trip the same book');

  // The SAME tape object replayed a second time: the cursor is cleared, so the second arm
  // is not filling against the end of a tape it inherited from the first.
  const again = venueArm(t, a1);
  assert.equal(again.book.realized, one.book.realized, 'one tape object replays the same way twice');
});

test('the fee is charged on every round trip: the only difference between two identical runs is the fee', (t) => {
  // A flat tape: the reserves never move, so a round trip can only lose impact and the fee.
  const tape = synthTape({ instruments: 4, readings: 20, seed: 'fee', drift: 0, vol: 0 });
  const orders = [];
  for (const inst of tape.instruments) {
    orders.push({ instrument: inst.id, step: 2, side: 'buy', size: 0.02 });
    orders.push({ instrument: inst.id, step: 8, side: 'sell', size: 0.02 });
  }
  const charged = venueArm(t, tape, { decide: 'script', orders, fee: FEE_ROUND_TRIP });
  const freePolicy = { venue: { enabled: true, paper: true, allowSynthetic: true, venues: ['synthetic'], feeRoundTrip: 0, maxNotional: 0.02 } };
  const free = venueArm(t, tape, { decide: 'script', orders, fee: 0, policy: freePolicy });

  assert.equal(charged.book.trips, tape.instruments.length, 'every scripted round trip closed: ' + charged.book.trips);
  assert.equal(free.book.trips, charged.book.trips, 'the free run made the same round trips');
  assert.equal(charged.book.feesPaid, FEE_ROUND_TRIP * charged.book.deployed, 'the fee is the round trip fee on every entry notional');
  assert.equal(free.book.feesPaid, 0, 'a zero fee policy charges nothing');
  const gap = free.book.realized - charged.book.realized;
  assert.ok(Math.abs(gap - FEE_ROUND_TRIP * charged.book.deployed) < 1e-12, 'the whole difference between the two runs is the fee: ' + gap + ' against ' + (FEE_ROUND_TRIP * charged.book.deployed));
  assert.equal(charged.book.trades.length, tape.instruments.length, 'one trip per instrument');
  for (const tr of charged.book.trades) assert.equal(tr.fee, FEE_ROUND_TRIP * tr.entryQuote, 'every single trip paid it: ' + JSON.stringify(tr));
  assert.ok(charged.book.realized < 0, 'a pool that never moved still lost: ' + charged.book.realized);
});

test('world.venue serialize is idempotent: save twice, restore, save keeps the trade record', (t) => {
  // Closed round trips, same script as the fee test, so the live cell's trades array is
  // non-empty going in: a serialize that turns it into a bare number is invisible on an
  // empty book, and the reported defect only shows up once there is a record to lose.
  const tape = synthTape({ instruments: 3, readings: 20, seed: 'roundtrip', drift: 0, vol: 0 });
  const orders = [];
  for (const inst of tape.instruments) {
    orders.push({ instrument: inst.id, step: 2, side: 'buy', size: 0.02 });
    orders.push({ instrument: inst.id, step: 8, side: 'sell', size: 0.02 });
  }
  const { cells } = venueArm(t, tape, { decide: 'script', orders });
  const bookCell = cells.book;
  assert.ok(Array.isArray(bookCell.state.trades), 'the live cell holds trades as an array');
  assert.ok(bookCell.state.trades.length > 0, 'and the run actually closed trips: ' + bookCell.state.trades.length);

  // save twice, off the same live state, with no compute() run between the two calls
  const save1 = JSON.stringify(serializeCell(bookCell));
  const save2 = JSON.stringify(serializeCell(bookCell));
  assert.equal(save2, save1, 'serializing an unchanged live cell twice gives the same bytes');

  // restore into a fresh cell, then save a third time
  const restored = deserializeCell(JSON.parse(save1));
  assert.ok(Array.isArray(restored.state.trades), 'the restored cell still holds trades as an array');
  assert.equal(restored.state.trades.length, bookCell.state.trades.length, 'with the same length as the original');
  assert.deepEqual(restored.state.trades, bookCell.state.trades, 'and the same trip for trip content');

  const save3 = JSON.stringify(serializeCell(restored));
  assert.equal(save3, save1, 'save, restore, save again: byte identical');
  assert.equal(save3, save2, 'and identical to the second save too');
});

test('a fill is the payable price out of the reserves, never the mid', () => {
  const quote = 42.5, base = 1.75e8, size = 0.02;
  const mid = midOf(quote, base);
  const baseOut = payableBuy(quote, base, size);
  assert.ok(baseOut > 0, 'a buy receives something');
  assert.ok(size / baseOut > mid, 'a buy pays MORE per base than the mid: ' + (size / baseOut) + ' against ' + mid);
  const back = payableSell(quote, base, baseOut);
  assert.ok(back / baseOut < mid, 'a sell receives LESS per base than the mid: ' + (back / baseOut) + ' against ' + mid);
  assert.ok(back < size, 'and a round trip through the reserves alone already loses: ' + back + ' out of ' + size);
  assert.equal(payableBuy(0, base, size), 0, 'an empty quote reserve quotes nothing');
  assert.equal(payableSell(quote, 0, 1), 0, 'an empty base reserve quotes nothing');
});

test('the venue has no path to any network, no credential and no signer', () => {
  const src = readFileSync(path.join(ROOT, 'world', 'venue.mjs'), 'utf8');
  const forbidden = [
    /\bfetch\s*\(/, /node:http\b/, /node:https\b/, /node:net\b/, /node:tls\b/, /node:dgram\b/,
    /XMLHttpRequest/, /WebSocket/, /node:child_process/, /privateKey/i, /secretKey/i,
    /signTransaction/i, /sendTransaction/i, /\bendpoint\b/i, /\brpc\b/i, /\bkeypair\b/i,
  ];
  for (const re of forbidden) assert.equal(re.test(src), false, 'world/venue.mjs must not contain ' + re);
  const specs = [];
  for (const m of src.matchAll(/^\s*import\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
  for (const m of src.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) specs.push(m[1]);
  assert.ok(specs.length >= 4, 'read the import list: ' + specs.join(', '));
  for (const s of specs) {
    const ok = s.startsWith('.') || s === 'node:sqlite' || s === 'node:path';
    assert.ok(ok, 'world/venue.mjs imports ' + s + ', which is not a local module, node:sqlite or node:path');
  }
  assert.equal(/readOnly:\s*true/.test(src), true, 'and it opens the recorded tape read only');
});

test('a whole venue run files no proposal that reaches a network, a file or a process', (t) => {
  const tape = synthTape({ instruments: 4, readings: 20, seed: 'ops', drift: 0.01, vol: 0.04 });
  const { brain, book } = venueArm(t, tape);
  assert.ok(book.fills > 0, 'the run did something: ' + book.fills + ' fills');
  const acts = worldActions(brain, { limit: 100000, type: 'world.act' });
  assert.ok(acts.length > 0, 'the run filed proposals: ' + acts.length);
  const ops = [...new Set(acts.map((a) => a.op))].sort();
  assert.deepEqual(ops, ['sense.venue', 'venue.order'], 'the only ops a venue run asks for: ' + ops.join(', '));
  for (const a of acts) assert.equal(/^(http|fs|proc|net|clock)\./.test(String(a.op)), false, 'no reach outside the process: ' + a.op);
});

test('an order without a gate decision is never filled', async (t) => {
  const tape = synthTape({ instruments: 2, readings: 12, seed: 'nogate', drift: 0.01, vol: 0.04 });
  // 1. a gate that was never armed for world.act at all
  const bare = new Brain({ name: 'unarmed-venue', seed: 'unarmed', growth: false, pruneEvery: 0 });
  bare.addCell({ id: 'book', kind: 'world.venue', region: 'world', circuit: 'actuators', params: { tape, venue: 'synthetic', size: 0.02 }, policy: { period: 1 } });
  t.after(() => closeWorld(bare));
  tape.seen[tape.instruments[0].id] = 3; // the reading HAS been perceived: only authority is missing
  bare.inject('book', 'order', { kind: 'event', data: { instrument: tape.instruments[0].id, side: 'buy', size: 0.02 } });
  await pump(bare, () => bare.cell('book').state.refused > 0, { rounds: 20 });
  assert.equal(bare.cell('book').state.refused, 1, 'the order was refused');
  assert.equal(bare.cell('book').state.fills, 0, 'and nothing was filled');
  assert.deepEqual(Object.keys(bare.cell('book').state.positions), [], 'and the book holds nothing');
  assert.ok(events(bare).some((e) => /never armed/.test(String(e.reason))), 'the refusal names the missing arm');

  // 2. armed, but the shipped policy denies the venue outright
  const shipped = venueArm(t, tape, { policy: loadPolicy(null) });
  assert.equal(shipped.book.fills, 0, 'the shipped policy filled nothing');
  assert.equal(shipped.book.trips, 0, 'and closed no round trip');
  assert.equal(shipped.cells.sense.state.emitted, 0, 'and did not even replay the tape');

  // 3. enabled, but the gate re-derives every order out of the what, and paper is the only
  // mode there is
  const p = VENUE_POLICY(tape);
  const order = { op: 'venue.order', venue: 'synthetic', instrument: 'x', side: 'buy', notional: 0.02, paper: true };
  assert.equal(allows(p, order).ok, true, 'a paper order inside the caps is allowed');
  assert.equal(allows(p, { ...order, paper: undefined }).ok, false, 'an order that does not say paper is refused');
  assert.equal(allows(p, { ...order, paper: false }).ok, false, 'and so is one that says it is not');
  assert.equal(allows({ venue: { ...p.venue, paper: false } }, order).ok, false, 'a policy that turned paper off refuses every order, it does not open a live one');
  assert.equal(allows(p, { ...order, venue: 'binance' }).ok, false, 'an unnamed venue is refused');
  assert.equal(allows(p, { ...order, notional: 5 }).ok, false, 'a notional over the cap is refused');
  assert.equal(allows(p, { ...order, side: 'short' }).ok, false, 'a side that is not buy or sell is refused');
  assert.equal(allows(p, { op: 'sense.venue', tape: 'synthetic', readings: 10 }).ok, true, 'a generated tape is allowed when the policy says so');
  assert.equal(allows({ venue: { enabled: true, venues: ['synthetic'] } }, { op: 'sense.venue', tape: 'synthetic', readings: 10 }).ok, false, 'and refused when it does not');
  assert.equal(allows(p, { op: 'sense.venue', tape: path.join(ROOT, 'package.json'), readings: 10 }).ok, false, 'a tape that is not on the allowlist is refused');
});

test('the shipped world policy denies the venue, so an untouched organism cannot trade', () => {
  const shipped = loadPolicy(null);
  assert.equal(shipped.venue.enabled, false, 'the venue is off by default');
  assert.equal(shipped.venue.paper, true, 'and paper is the only mode there is');
  assert.deepEqual(shipped.venue.tapes, [], 'no tape is allowed by default');
  assert.deepEqual(shipped.venue.venues, [], 'no venue is allowed by default');
  assert.equal(shipped.venue.allowSynthetic, false, 'not even a generated one');
  assert.equal(shipped.venue.feeRoundTrip, 0.0454, 'the measured round trip fee, from trader/bench/verdicts/desk.json');
  const empty = normalizePolicy({});
  assert.equal(empty.venue.enabled, false, 'an unnamed venue section denies everything too');
  assert.equal(allows({}, { op: 'venue.order', venue: 'x', instrument: 'y', side: 'buy', notional: 0.01, paper: true }).ok, false, 'and an order under it is refused');
});

// The population every other venue test runs on is SYNTHETIC: a tape this process
// generated, whose rows are numbers by construction and whose readings are in time order
// by construction. The tape the bench actually replays comes out of the frozen trader
// database, and until this test nothing exercised loadTape at all, so a schema drift, a
// column that arrives as a string, or a row order that is not time order would have
// reached the bench with no test in the way.
test('the recorded tape really is the frozen trader package, read only, and its rows survive the trip', (t) => {
  const db = path.resolve(ROOT, '..', 'trader', 'data', 'trader.db');
  if (!existsSync(db)) { t.skip('the frozen trader database is not on this machine: ' + db); return; }
  const sidecars = [db + '-wal', db + '-shm', db + '-journal'];
  const before = statSync(db);
  const sidecarsBefore = sidecars.map((f) => existsSync(f));

  const opts = { db, instruments: 4, minReadings: 20, maxReadings: 40, seed: 'recorded', venue: 'pumpswap' };
  const tape = loadTape(opts);

  // 1. it is the recording, not the generator.
  assert.equal(tape.source, 'trader.db', 'the tape came out of the recorded database');
  assert.equal(tape.synthetic, false, 'and is not a generated one');
  assert.equal(tape.venue, 'pumpswap', 'of the venue that was asked for');
  assert.ok(tape.eligible > 0, 'the query found instruments to draw from: ' + tape.eligible);
  assert.equal(tape.instruments.length, opts.instruments, 'it drew the instruments it was asked for: ' + tape.instruments.length);
  assert.ok(tape.readings > 0, 'and the tape has readings: ' + tape.readings);

  // 2. what sqlite handed back is a NUMBER at every reading, not a string that only looks
  //    like one. A u64 balance arriving as text would multiply into NaN at the first fill
  //    and the whole bench would print a book of nothing.
  for (const inst of tape.instruments) {
    assert.ok(inst.readings.length >= opts.minReadings, inst.id + ' has at least the floor of readings: ' + inst.readings.length);
    assert.ok(inst.readings.length <= opts.maxReadings, inst.id + ' is capped: ' + inst.readings.length);
    for (const r of inst.readings) {
      assert.equal(typeof r.quote, 'number', 'the quote reserve is a number: ' + JSON.stringify(r));
      assert.equal(typeof r.base, 'number', 'the base reserve is a number: ' + JSON.stringify(r));
      assert.equal(Number.isFinite(r.quote) && r.quote > 0, true, 'and positive: ' + r.quote);
      assert.equal(Number.isFinite(r.base) && r.base > 0, true, 'and positive: ' + r.base);
      assert.equal(Number.isFinite(r.tMs) && r.tMs > 0, true, 'the timestamp parsed: ' + r.tMs);
      assert.equal(r.mid, r.quote / r.base, 'the mid is the ratio the reading reports');
    }
  }

  // 3. the replay order is TIME order across every instrument, which is the whole claim of
  //    the sense. On a generated tape this is true by construction; on recorded rows it is
  //    a fact about the rows and the sort, and only a test can say so.
  for (let i = 1; i < tape.flat.length; i++) {
    assert.equal(tape.flat[i].tMs >= tape.flat[i - 1].tMs, true, 'reading ' + i + ' is not before the one ahead of it: ' + tape.flat[i - 1].tMs + ' then ' + tape.flat[i].tMs);
  }
  assert.equal(tape.flat.length, tape.instruments.reduce((a, x) => a + x.readings.length, 0), 'every reading of every instrument is in the replay');

  // 4. the same seed draws the same instruments in the same order, on the recorded
  //    population and not only on the generated one.
  const twice = loadTape(opts);
  assert.deepEqual(twice.instruments.map((x) => x.id), tape.instruments.map((x) => x.id), 'the same seed drew the same instruments');
  assert.deepEqual(twice.flat, tape.flat, 'reading for reading the same tape');
  const other = loadTape({ ...opts, seed: 'recorded-other' });
  assert.notDeepEqual(other.instruments.map((x) => x.id), tape.instruments.map((x) => x.id), 'a different seed drew a different draw');

  // 5. READ ONLY means the frozen package is not touched: same size, same mtime, and no
  //    write ahead log or journal left behind.
  const after = statSync(db);
  assert.equal(after.size, before.size, 'the recorded database is the same size after the read');
  assert.equal(after.mtimeMs, before.mtimeMs, 'and was not modified');
  sidecars.forEach((f, i) => {
    assert.equal(existsSync(f), sidecarsBefore[i], 'the read left no sidecar behind: ' + f);
  });

  // 6. and the organism can actually trade it: the arm that the bench runs, on the rows
  //    the bench runs it on, through the gate, with the fee charged.
  const arm = venueArm(t, tape, { size: 0.0005 });
  assert.ok(arm.book.fills > 0, 'the organism filled orders against recorded reserves: ' + arm.book.fills);
  assert.ok(arm.book.trips > 0, 'and closed round trips: ' + arm.book.trips);
  assert.equal(arm.book.refused, 0, 'the policy approved every order it filed');
  assert.equal(arm.book.openPositions, 0, 'and nothing was left open when the tape ended');
  assert.ok(Math.abs(arm.book.feesPaid - FEE_ROUND_TRIP * arm.book.deployed) < 1e-12, 'every trip paid the borrowed round trip fee: ' + arm.book.feesPaid + ' against ' + (FEE_ROUND_TRIP * arm.book.deployed));
});
