// test/cloud.test.mjs: the cloud item (his P13, P15). Five claims and the declarations under them:
//   1. bin/serve.mjs restarts a killed daemon child from its checkpoint and counts the restart
//   2. daemon/health.mjs answers from disk only (files change, the answer changes; no core import)
//   3. the egress guard refuses a host not on the list (in process and through --import)
//   4. no secret pattern is in the build context, and the scan sees a planted one (the control)
//   5. GET /duplicate copies a checkpoint byte for byte, once per seed
// node --test test/cloud.test.mjs    (no network: every socket is 127.0.0.1)
import test from 'node:test';
import assert from 'node:assert/strict';
import { fork, execFile } from 'node:child_process';
import http from 'node:http';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, copyFileSync } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { config, egressAllow, checkEgress, guardFetch, localControl, ownControlPorts, heartbeat, instancesAlive, nextLadderAt, rotateLedger, DEFAULT_MODEL_URL, EGRESS_CODE } from '../bin/serve.mjs';
import { readHealth, duplicate, startHealth, lastLadderRow } from '../daemon/health.mjs';
import { contextFiles, scanSecrets, readIgnore, compileIgnore, shq, TARGET_RE } from '../tools/deploy-host.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SERVE = path.join(ROOT, 'bin', 'serve.mjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const later = (ms, v) => new Promise((r) => setTimeout(r, ms, v).unref()); // a race timer that never holds the process open
const closedPort = () => new Promise((res) => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const tmp = (tag) => mkdtempSync(path.join(os.tmpdir(), 'brain-cloud-' + tag + '-'));
const readJson = (f) => { try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; } };
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
async function until(what, fn, ms, every = 100) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const v = fn(); if (v) return v; await sleep(every); }
  throw new Error('timed out after ' + ms + ' ms waiting for ' + what);
}
const get = async (url) => { const r = await fetch(url); return { status: r.status, body: await r.json() }; };

// ---------------------------------------------------------------- 1. restart from the checkpoint
test('serve restarts a killed daemon child from its checkpoint and counts it', { timeout: 100_000 }, async () => {
  const state = tmp('serve');
  const env = { ...process.env, BRAIN_STATE_DIR: state, BRAIN_NAME: 'rt', BRAIN_INSTANCE: 'test-rt', BRAIN_MAJORS: '4', BRAIN_UNITS: '64', BRAIN_CHECKPOINT_EVERY: '200', BRAIN_LADDER: 'off', HEALTH_PORT: '0', HEALTH_HOST: '127.0.0.1', BRAIN_SAMPLE_MS: '200', BRAIN_HEAP_MB: '160', BRAIN_RSS_CAP_MB: '400' };
  const p = fork(SERVE, [], { cwd: ROOT, env, execArgv: ['--max-old-space-size=96'], stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
  let out = '';
  p.stdout.on('data', (d) => { out += d; }); p.stderr.on('data', (d) => { out += d; });
  const exited = new Promise((r) => p.on('exit', (code, signal) => r({ code, signal })));
  const status = path.join(state, 'rt', 'serve.json'), meta = path.join(state, 'rt', 'meta.json');
  let childPids = [];
  try {
    const s0 = await until('a checkpoint and a ticking child', () => { const s = readJson(status), m = readJson(meta); return s && s.child && s.child.pid && s.child.lastT > 400 && m && m.t >= 200 ? s : null; }, 70_000);
    const pid = s0.child.pid;
    childPids.push(pid);
    const ckAtKill = readJson(meta).t;
    process.kill(pid, 'SIGKILL');
    const s1 = await until('the restart', () => { const s = readJson(status); return s && s.restarts === 1 && s.child && s.child.pid !== pid && s.child.resumedAt !== null ? s : null; }, 40_000);
    childPids.push(s1.child.pid);
    assert.equal(s1.restarts, 1, 'one kill, one restart');
    assert.equal(s1.child.built, false, 'the restarted child resumed, it did not build a new brain');
    assert.ok(s1.child.resumedAt >= ckAtKill, 'resumed at t=' + s1.child.resumedAt + ', the checkpoint at the kill was t=' + ckAtKill);
    assert.ok(s1.child.resumedAt > 0, 'resumed from a real checkpoint, not t=0');
    assert.equal(s1.lastExit.planned, false);
    assert.ok(!alive(pid), 'the killed pid is gone');
    assert.match(out, /restart 1 from checkpoint t=\d+/, 'the supervisor prints the restart count');
    // the health endpoint this supervisor serves reads the same restart from disk
    const inst = readJson(path.join(state, 'instances.json'));
    const me = inst.instances['test-rt'];
    const h = await get('http://127.0.0.1:' + me.port + '/health');
    assert.equal(h.body.restarts, 1);
    assert.equal(h.body.instancesAlive, 1);
    assert.equal(h.body.ok, true);
  } finally {
    try { p.send({ op: 'stop' }); } catch { /* gone */ }
    const r = await Promise.race([exited, later(30_000, null)]);
    if (!r) p.kill('SIGKILL');
    await sleep(300);
    for (const c of childPids) if (alive(c)) { try { process.kill(c, 'SIGKILL'); } catch { /* gone */ } }
    assert.ok(r, 'serve stops on {op:stop} within 30 s');
    assert.deepEqual(childPids.filter(alive), [], 'no daemon child outlives the supervisor');
    const inst = readJson(path.join(state, 'instances.json'));
    assert.equal(inst.instances['test-rt'], undefined, 'a clean stop removes the instance row');
    rmSync(state, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- 2. health reads only from disk
test('health reads only from disk: the files change, the answer changes', async () => {
  const state = tmp('health');
  const series = path.join(state, 'ladder.json');
  const bd = path.join(state, 'cloud');
  mkdirSync(bd, { recursive: true });
  const at = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const serve = (restarts, lastT) => ({ instance: 'h-1', startedAt: iso(at - 120_000), updatedAt: iso(at - 1000), restarts, budgetKills: 0, child: { pid: 4242, startedAt: iso(at - 60_000), resumedAt: 800, lastT, ticksPerSec: 300 }, lastExit: restarts ? { at: iso(at - 61_000), code: null, signal: 'SIGKILL', planned: false } : null, peak: { daemonRssMb: 300, serveRssMb: 50 }, ladder: { nextAt: iso(at + 3600_000), running: false }, ledger: { level: 'summary' }, egress: { allow: [{ host: '127.0.0.1', port: '11434' }] } });
  writeFileSync(path.join(bd, 'serve.json'), JSON.stringify(serve(0, 1000)));
  writeFileSync(path.join(bd, 'meta.json'), JSON.stringify({ t: 1000, savedAt: iso(at - 5000) }));
  writeFileSync(path.join(bd, 'snapshot.json'), JSON.stringify({ x: 'a'.repeat(1000) }));
  writeFileSync(series, JSON.stringify({ days: [{ date: '2026-09-22', composite: 0.41, columns: { web: { score: 0.5 } } }] }));
  heartbeat(state, { id: 'h-1', name: 'cloud' }, { at });
  const h = await startHealth({ port: 0, stateDir: state, name: 'cloud', seriesFile: series });
  try {
    const a = (await get(h.url + '/health')).body;
    assert.equal(a.ok, true);
    assert.equal(a.restarts, 0);
    assert.equal(a.tick, 1000);
    assert.equal(a.checkpoint.tick, 1000);
    assert.equal(a.checkpoint.bytes, readFileSync(path.join(bd, 'snapshot.json')).length);
    assert.equal(a.ladder.composite, 0.41);
    assert.equal(a.nativeShare, null);
    assert.equal(a.nativeReason, 'ladder.json has no native share yet');
    assert.equal(a.instancesAlive, 1);
    assert.deepEqual(a.egressAllow, ['127.0.0.1:11434']);
    // change the files only: nothing is told, the next answer follows
    writeFileSync(path.join(bd, 'serve.json'), JSON.stringify(serve(3, 5000)));
    writeFileSync(path.join(bd, 'meta.json'), JSON.stringify({ t: 5000, savedAt: iso(at) }));
    writeFileSync(path.join(bd, 'snapshot.json'), JSON.stringify({ x: 'b'.repeat(5000) }));
    writeFileSync(series, JSON.stringify({ days: [{ date: '2026-09-23', composite: 0.5, columns: {}, native: { share: 0.25 } }] }));
    heartbeat(state, { id: 'h-2', name: 'dup-1' }, { at });
    const b = (await get(h.url + '/health')).body;
    assert.equal(b.restarts, 3);
    assert.equal(b.tick, 5000);
    assert.equal(b.checkpoint.tick, 5000);
    assert.ok(b.checkpoint.bytes > a.checkpoint.bytes);
    assert.equal(b.ladder.date, '2026-09-23');
    assert.equal(b.nativeShare.share, 0.25);
    assert.equal(b.instancesAlive, 2);
    assert.deepEqual(b.instances, ['h-1', 'h-2']);
    // a stale status is not ok; a missing one is null, not a remembered value
    writeFileSync(path.join(bd, 'serve.json'), JSON.stringify({ ...serve(3, 5000), updatedAt: iso(Date.now() - 60_000) }));
    assert.equal((await get(h.url + '/health')).body.ok, false);
    rmSync(path.join(bd, 'serve.json'));
    const c = (await get(h.url + '/health')).body;
    assert.equal(c.ok, false);
    assert.equal(c.restarts, null);
    assert.equal(c.tick, null);
    // an instance row older than the alive window does not count
    heartbeat(state, { id: 'old' }, { at: Date.now() - 200_000 });
    assert.equal(readHealth({ stateDir: state, name: 'cloud', seriesFile: series }).instances.includes('old'), false);
    assert.equal((await get(h.url + '/nope')).status, 404);
  } finally { await h.close(); rmSync(state, { recursive: true, force: true }); }
  // the source: node builtins only, so it cannot hold a live organism in memory
  const src = readFileSync(path.join(ROOT, 'daemon', 'health.mjs'), 'utf8');
  const specs = [...src.matchAll(/^\s*import\s[^'"]*['"]([^'"]+)['"]/gm), ...src.matchAll(/import\(\s*['"]([^'"]+)['"]\s*\)/g)].map((m) => m[1]);
  assert.ok(specs.length >= 4, 'found the imports');
  assert.deepEqual(specs.filter((s) => !s.startsWith('node:')), [], 'daemon/health.mjs imports only node: builtins');
  assert.equal(lastLadderRow(path.join(state, 'missing.json')).reason, 'no series file');
});

// ---------------------------------------------------------------- 3. the egress guard
test('the fetch guard refuses a host not on the list, before any socket', async () => {
  const noPolicy = path.join(os.tmpdir(), 'no-such-policy-' + process.pid + '.json');
  const allow = egressAllow({ env: {}, policyFile: noPolicy });
  assert.deepEqual(allow.entries.map((e) => e.host + ':' + e.port), ['127.0.0.1:11434'], 'with no policy and no env, only the model endpoint');
  assert.equal(checkEgress(allow, 'https://example.com/').ok, false);
  assert.equal(checkEgress(allow, 'http://127.0.0.1:11434/api/tags').ok, true);
  assert.equal(checkEgress(allow, 'http://127.0.0.1:11435/').ok, false, 'the port is part of the entry');
  const calls = [], rows = [];
  const f = guardFetch(async (u) => { calls.push(String(u)); return new Response('{}'); }, allow, (r) => rows.push(r));
  await assert.rejects(f('https://example.com/x'), (e) => e.code === EGRESS_CODE && /not on the egress allowlist/.test(e.message));
  await assert.rejects(f(new URL('http://169.254.169.254/latest/meta-data/')), (e) => e.code === EGRESS_CODE);
  assert.deepEqual(calls, [], 'the real fetch was never called for a refused host');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].host, 'example.com');
  await f('http://127.0.0.1:11434/api/tags');
  assert.deepEqual(calls, ['http://127.0.0.1:11434/api/tags']);
  // inside a container the model is on the host: the built-in address is routed there
  const routed = egressAllow({ env: { BRAIN_MODEL_URL: 'http://host.docker.internal:11434' }, policyFile: noPolicy });
  const seen = [];
  await guardFetch(async (u) => { seen.push(String(u)); return new Response('{}'); }, routed)('http://127.0.0.1:11434/api/generate');
  assert.deepEqual(seen, ['http://host.docker.internal:11434/api/generate']);
  // a venue feed declared in the policy file is on the list; the checkpoint store too
  const pol = path.join(tmp('pol'), 'policy.json');
  writeFileSync(pol, JSON.stringify({ http: { hosts: ['https://feed.example.org'] }, venue: { venues: [{ feed: 'wss://ws.venue.test:9443/x' }] } }));
  const withVenue = egressAllow({ env: { BRAIN_CHECKPOINT_URL: 'https://store.example.net/b' }, policyFile: pol });
  assert.deepEqual(withVenue.entries.map((e) => e.host + ':' + e.port + ' ' + e.why), ['feed.example.org:443 venue feed (world/policy.json)', 'ws.venue.test:9443 venue feed (world/policy.json)', '127.0.0.1:11434 model endpoint', 'store.example.net:443 checkpoint store']);
  assert.equal(withVenue.venueDeclared, 2);
  rmSync(path.dirname(pol), { recursive: true, force: true });
  // the shipped policy declares no venue host today
  assert.equal(egressAllow({ env: {} }).venueDeclared, 0);

  // the same guard in another node process through --import, as the ladder and every child get it
  const state = tmp('egress');
  const port = await closedPort(); // not 1: port 1 is on fetch's bad-port list and fails without a code
  // the one loopback exception: the organism's own control plane, a live control.json under the state dir
  const serveOk = (q, res) => { res.setHeader('content-type', 'application/json'); res.end('{"ok":true}'); };
  const ctl = http.createServer(serveOk), stray = http.createServer(serveOk);
  await new Promise((r) => ctl.listen(0, '127.0.0.1', r));
  await new Promise((r) => stray.listen(0, '127.0.0.1', r)); // on loopback, but no control.json names it
  const ctlPort = ctl.address().port, strayPort = stray.address().port;
  mkdirSync(path.join(state, 'b1'));
  writeFileSync(path.join(state, 'b1', 'control.json'), JSON.stringify({ host: '127.0.0.1', port: ctlPort, token: 't', pid: process.pid }));
  mkdirSync(path.join(state, 'b2'));
  writeFileSync(path.join(state, 'b2', 'control.json'), JSON.stringify({ host: '127.0.0.1', port: strayPort, token: 't', pid: 2147483646 })); // a dead pid: stale
  assert.deepEqual([...ownControlPorts(state)], [String(ctlPort)], 'a control.json counts only while its pid lives');
  assert.ok(localControl(state)('127.0.0.1', String(ctlPort)));
  assert.equal(localControl(state)('10.0.0.1', String(ctlPort)), null, 'loopback only');
  assert.equal(localControl(state)('127.0.0.1', String(strayPort)), null);
  const script = `
    import { get } from 'node:http';
    const out = {};
    try { await fetch('https://example.com/'); out.fetch = 'reached'; } catch (e) { out.fetch = e.code || (e.cause && e.cause.code); }
    out.httpGet = await new Promise((res) => { const q = get('http://example.com/', (r) => { r.resume(); res('reached'); }); q.on('error', (e) => res(e.code)); });
    try { await fetch('http://127.0.0.1:' + process.env.CLOSED_PORT + '/', { signal: AbortSignal.timeout(5000) }); out.allowed = 'reached'; } catch (e) { out.allowed = e.code || (e.cause && e.cause.code); }
    try { const r = await fetch('http://127.0.0.1:' + process.env.CTL_PORT + '/health'); out.control = r.status; } catch (e) { out.control = e.code || (e.cause && e.cause.code); }
    try { const r = await fetch('http://127.0.0.1:' + process.env.STRAY_PORT + '/health'); out.stray = r.status; } catch (e) { out.stray = e.code || (e.cause && e.cause.code); }
    out.installed = Boolean(globalThis.__brainEgressGuard);
    console.log(JSON.stringify(out));
    process.exit(0);`;
  // async, so this process can answer the control plane while the child asks it
  const r = await promisify(execFile)(process.execPath, ['--max-old-space-size=64', '--import', pathToFileURL(SERVE).href, '--input-type=module', '-e', script], { cwd: ROOT, encoding: 'utf8', timeout: 30_000, env: { ...process.env, BRAIN_EGRESS_GUARD: '1', BRAIN_STATE_DIR: state, BRAIN_EGRESS_LIST: '', BRAIN_EGRESS_ALLOW: '127.0.0.1:' + port, CLOSED_PORT: String(port), CTL_PORT: String(ctlPort), STRAY_PORT: String(strayPort), BRAIN_MODEL_URL: '' } });
  await new Promise((res) => ctl.close(res)); await new Promise((res) => stray.close(res));
  const o = JSON.parse(r.stdout.trim().split('\n').pop());
  assert.equal(o.installed, true);
  assert.equal(o.fetch, EGRESS_CODE, 'fetch to example.com is refused');
  assert.equal(o.httpGet, EGRESS_CODE, 'http.get to example.com is refused');
  assert.equal(o.allowed, 'ECONNREFUSED', 'the control: an allowed host is really dialled (a closed local port answers ECONNREFUSED)');
  assert.equal(o.control, 200, 'the organism reaches its own live control plane (daemon/run.mjs asks it whether a daemon already runs)');
  assert.equal(o.stray, EGRESS_CODE, 'a loopback port no live control.json names is refused');
  const log = readFileSync(path.join(state, 'egress.log'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(log.map((x) => x.via + ' ' + x.host + (x.host === '127.0.0.1' ? ':' + x.port : '')), ['fetch example.com', 'http example.com', 'fetch 127.0.0.1:' + strayPort]);
  rmSync(state, { recursive: true, force: true });
});

// ---------------------------------------------------------------- 4. secrets
test('no secret pattern appears in the build context, and the scan sees a planted one', { timeout: 60_000 }, () => {
  const ctx = contextFiles(ROOT);
  const rels = new Set(ctx.files.map((f) => f.rel));
  for (const f of ['site/.env.local', 'web/dist/.env.local']) assert.equal(rels.has(f), false, f + ' is excluded');
  assert.equal([...rels].some((r) => r.startsWith('state/') || /^organism\/scale-/.test(r) || r.startsWith('.git/')), false, 'state, the big organisms and .git stay out');
  assert.ok(rels.has('bin/serve.mjs') && rels.has('Dockerfile') && rels.has('compose.yaml'));
  const scan = scanSecrets(ctx.files, ROOT);
  assert.ok(scan.scanned > 100, 'the scan read the tree (' + scan.scanned + ' text files)');
  assert.deepEqual(scan.hits.map((h) => h.rel + ':' + h.line + ' ' + h.kind), [], 'no secret in the build context');
  // the control: a planted key in a text file is found and its value never reported; a planted
  // .env is excluded by the same .dockerignore
  const dir = tmp('ctx');
  copyFileSync(path.join(ROOT, '.dockerignore'), path.join(dir, '.dockerignore'));
  const fake = 's' + 'k-' + 'ant-' + 'Q'.repeat(32);
  writeFileSync(path.join(dir, 'leak.mjs'), 'const k = "' + fake + '";\n');
  writeFileSync(path.join(dir, '.env'), 'API_' + 'KEY=' + fake + '\n');
  mkdirSync(path.join(dir, 'state'));
  writeFileSync(path.join(dir, 'state', 'x.json'), '{}');
  const c = contextFiles(dir);
  assert.deepEqual(c.files.map((f) => f.rel).sort(), ['.dockerignore', 'leak.mjs']);
  const s = scanSecrets(c.files, dir);
  assert.equal(s.hits.length, 1);
  assert.equal(s.hits[0].rel, 'leak.mjs');
  assert.equal(s.hits[0].line, 1);
  assert.equal(JSON.stringify(s).includes(fake), false, 'the scan reports where, never the value');
  rmSync(dir, { recursive: true, force: true });
  // the ignore compiler and the shell quoting the deploy relies on
  const m = compileIgnore(['state', 'organism/scale-*', '**/.env.*']);
  assert.equal(m('state/a.json'), true);
  assert.equal(m('organism/scale-52000/x'), true);
  assert.equal(m('organism/whole.json'), false);
  assert.equal(m('site/.env.local'), true);
  assert.ok(readIgnore(ROOT).includes('**/.env.*'));
  assert.equal(shq("it's"), "'it'\\''s'");
  assert.equal(TARGET_RE.test('x;rm -rf /'), false);
  assert.equal(TARGET_RE.test('ubuntu@10.0.0.5'), true);
});

// ---------------------------------------------------------------- 5. duplicate
test('the duplicate endpoint copies a checkpoint, once per seed', async () => {
  const state = tmp('dup');
  const bd = path.join(state, 'cloud');
  mkdirSync(bd, { recursive: true });
  writeFileSync(path.join(bd, 'snapshot.json'), JSON.stringify({ t: 7000, blob: Array.from({ length: 5000 }, (_, i) => (i * 2654435761) % 997) }));
  writeFileSync(path.join(bd, 'meta.json'), JSON.stringify({ name: 'cloud', t: 7000, savedAt: new Date().toISOString() }));
  const h = await startHealth({ port: 0, stateDir: state, name: 'cloud' });
  try {
    const r = await get(h.url + '/duplicate?seed=7');
    assert.equal(r.status, 200);
    assert.equal(r.body.name, 'dup-7');
    assert.equal(r.body.fromTick, 7000);
    const src = path.join(bd, 'snapshot.json'), dst = path.join(state, 'dup-7', 'snapshot.json');
    assert.equal(sha(dst), sha(src), 'byte for byte');
    assert.equal(r.body.sha256, sha(src));
    assert.equal(r.body.bytes, readFileSync(src).length);
    const m = readJson(path.join(state, 'dup-7', 'meta.json'));
    assert.equal(m.name, 'dup-7');
    assert.equal(m.duplicatedFrom, 'cloud');
    assert.equal(m.sourceTick, 7000);
    assert.equal(m.t, 7000, 'the copy resumes at the tick it was taken at');
    assert.equal((await get(h.url + '/duplicate?seed=7')).status, 409, 'a seed is used once');
    assert.equal((await get(h.url + '/duplicate?seed=..%2Fx')).status, 400);
    assert.equal((await get(h.url + '/duplicate')).status, 400);
    assert.equal((await get(h.url + '/duplicate?seed=1234567890')).status, 400);
    assert.deepEqual(readdirSync(state).filter((f) => f.includes('.tmp')), [], 'no temp dir left behind');
    assert.equal(duplicate({ stateDir: state, name: 'nobody', seed: 1 }).status, 404);
    assert.equal(duplicate({ stateDir: state, name: 'cloud', seed: 2, diskCapMb: 0 }).status, 507);
    assert.equal(existsSync(path.join(state, 'dup-2')), false);
  } finally { await h.close(); rmSync(state, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- the declarations under them
test('compose.yaml, the Dockerfile and serve declare the caps the item names', () => {
  const compose = readFileSync(path.join(ROOT, 'compose.yaml'), 'utf8');
  for (const line of ['mem_limit: 512m', 'cpus: 1.0', 'read_only: true', 'restart: always', 'user: "1000:1000"', '"host.docker.internal:host-gateway"', 'cap_drop: [ALL]', 'BRAIN_LEDGER: summary']) assert.ok(compose.includes(line), 'compose.yaml has ' + line);
  assert.match(compose, /EGRESS ALLOWLIST/);
  const docker = readFileSync(path.join(ROOT, 'Dockerfile'), 'utf8');
  assert.match(docker, /^FROM node:24-slim$/m);
  assert.match(docker, /^USER node$/m);
  assert.doesNotMatch(docker, /npm (install|ci)/);
  const ign = readIgnore(ROOT);
  for (const p of ['state', 'organism/scale-*']) assert.ok(ign.includes(p), '.dockerignore has ' + p);
  // the model endpoint default is act/llm.mjs's own (read as text: importing it would load core)
  const llm = readFileSync(path.join(ROOT, 'act', 'llm.mjs'), 'utf8');
  assert.equal(/export const OLLAMA_BASE = '([^']+)'/.exec(llm)[1], DEFAULT_MODEL_URL);
  const c = config({ BRAIN_STATE_DIR: '/state' });
  assert.equal(c.ledger, 'summary');
  assert.equal(c.checkpointEvery, 1000);
  assert.ok(c.heapMb + 64 < 512 && c.rssCapMb < 512, 'the daemon heap and rss cap sit under the 512 MB container cap');
  assert.throws(() => config({ BRAIN_MAJORS: 'many' }), /BRAIN_MAJORS must be a number/);
});

test('the ladder clock, the instance ruler and the ledger backstop', () => {
  const d = (y, mo, da, h, mi = 0) => new Date(y, mo - 1, da, h, mi).getTime();
  assert.equal(nextLadderAt(d(2026, 9, 23, 3, 59), 4), d(2026, 9, 23, 4));
  assert.equal(nextLadderAt(d(2026, 9, 23, 4, 0), 4), d(2026, 9, 24, 4), 'strictly after');
  assert.equal(nextLadderAt(d(2026, 9, 30, 23, 0), 4), d(2026, 10, 1, 4), 'across a month');
  const at = Date.now();
  const doc = { instances: { a: { id: 'a', lastSeen: new Date(at - 1000).toISOString() }, b: { id: 'b', lastSeen: new Date(at - 149_000).toISOString() }, c: { id: 'c', lastSeen: new Date(at - 151_000).toISOString() } } };
  assert.deepEqual(instancesAlive(doc, { at }), { alive: 2, ids: ['a', 'b'] });
  const state = tmp('inst');
  heartbeat(state, { id: 'x' }, { at: at - 700_000 });
  heartbeat(state, { id: 'y' }, { at });
  assert.deepEqual(Object.keys(readJson(path.join(state, 'instances.json')).instances), ['y'], 'rows older than 10 minutes are collected');
  heartbeat(state, { id: 'y' }, { at, remove: true });
  assert.deepEqual(readJson(path.join(state, 'instances.json')).instances, {});
  const lf = path.join(state, 'ledger.jsonl');
  writeFileSync(lf, 'x'.repeat(2000));
  assert.equal(rotateLedger(lf, 4000).rotated, false);
  assert.equal(rotateLedger(lf, 1000).rotated, true);
  assert.equal(existsSync(path.join(state, 'ledger.1.jsonl')), true);
  assert.equal(existsSync(lf), false);
  rmSync(state, { recursive: true, force: true });
});
