// test/multiply.test.mjs: daemon/multiply.mjs (his P15, "multiplying, duplicating, all within cloud").
// What it holds: a duplicate gets a distinct seed and its own state dir; the elite store keeps the
// better of two (a tie keeps the incumbent) and records the source; a dead instance is restarted
// from its own checkpoint (a scripted instance, then a real one: tiny organism, synthetic plane);
// every crossing of the worker boundary goes through ownBytes; the health endpoint prints the
// population fields; daemon/run.mjs calls the exchange hook at every checkpoint. No Ollama, no
// network beyond 127.0.0.1, every process it starts is waited for.
//
// Author: board 17 builder (the organism's item), gap gate-slow:test/multiply.test.mjs (the gate timed this
// file at 28924 ms against a bar of 15000): what it waited on was three in-process organism builds
// (about 2.3 s each, most of it training the language model on 40000 bytes), a real population
// whose instances live 20 s from their own first start, a heartbeat once a second before the kill,
// and the real population starting only after every other test. Now: every organism trains its
// language region on TINY_MIND bytes (live() opts.mindBytes, instance.json organism.mindBytes),
// the real population lives REAL_WALL_S seconds, heartbeats every 100 ms (instance --heartbeat-ms)
// and is polled every 50 ms, and it is started before the first test (its instances are child
// processes, so the in-process tests run beside it); its test awaits it, and the hook test's
// organism builds (synchronous, on this thread) wait until its killed instance runs again, so the
// supervisor's clocks never wait behind a build while the restart window is open. The planted
// instance of the scripted test writes whole files. Every test and every assertion is the one it was.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {
  EliteStore, PlaneSearch, PlaneWorker, Population, createInstance, duplicateInstance, instanceDir, plainLauncher,
  postToPlane, postFromPlane, planeWorkerOptions, storeCellOf, loadSuite, readJson, writeJsonAtomic, MULTIPLY_FILE, BRAIN_NAME,
} from '../daemon/multiply.mjs';
import { readHealth, startHealth, populationAlive } from '../daemon/health.mjs';
import { syntheticMatrix } from '../generations/velocity.mjs';

const TMP = mkdtempSync(path.join(os.tmpdir(), 'brain-multiply-'));
process.on('exit', () => { try { rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const SYN = Object.freeze({ kind: 'synthetic', seed: 'multiply-test', tasks: 256, planted: 8, decoys: 504 });
const TINY_MIND = 2000;  // bytes of training text for each organism's language region (default 40000)
const REAL_WALL_S = 7;   // the real population's wall seconds per instance (was 20)

// The real population (the last test) runs in child processes: it starts here, before the first
// test, and its test awaits REAL and asserts on it. The steps are the ones that test ran inline:
// create i0 with a spawn plan, launch it, wait for its third exchange and its duplicate, SIGKILL
// it, wait for every member to settle, stop the supervisor; a population that never reached its
// third exchange is stopped at once (no kill, no wait), where the test stops asserting. RESTARTED
// resolves once the killed i0 runs its organism again (its heartbeat shows its second start
// resumed) or settled without: the hook test's synchronous organism builds wait for it, so the
// supervisor's heartbeat poll, request poll and restart timer (the restart window runs on the
// instance's wall clock) never wait behind a build on this thread.
let restarted = null;
const RESTARTED = new Promise((r) => { restarted = r; });
async function realPopulation() {
  const popDir = path.join(TMP, 'real');
  try {
    const { dir } = createInstance({
      popDir, id: 'i0', seed: '1', wallS: REAL_WALL_S, suite: SYN, minSpawnLeftS: 2,
      organism: { majors: 4, units: 64, checkpointEvery: 100, chunk: 5, ledgerBudgetMb: 1, mindBytes: TINY_MIND },
      spawnPlan: [{ id: 'i1', seed: '2', afterExchange: 2 }],
    });
    const lines = [];
    const launch = plainLauncher({ heapMb: 512, args: (d) => ['instance', '--dir', d, '--heartbeat-ms', '100'] });
    const pop = new Population({ popDir, launch, backoffMs: 200, pollMs: 50, log: (l) => lines.push(l) }).start();
    pop.add('i0');
    // wait for i0 to have exchanged at least twice (so it has duplicated) and checkpointed
    let hb = null;
    for (let i = 0; i < 300; i++) {
      hb = readJson(path.join(popDir, 'instances', 'i0.json'));
      if (hb && hb.exchanges >= 3 && hb.duplications >= 1) break;
      await sleep(50);
    }
    if (!(hb && hb.exchanges >= 3)) { await pop.stop(); return { popDir, dir, lines, hb, killedPid: null, s: null }; }
    const killedPid = pop.kill('i0');
    if (!(killedPid > 0)) { await pop.stop(); return { popDir, dir, lines, hb, killedPid, s: null }; }
    let settled = false;
    const watch = (async () => {
      for (;;) {
        const h = readJson(path.join(popDir, 'instances', 'i0.json'));
        const m = pop.members.get('i0');
        if (settled || !m || m.done || (h && h.starts >= 2 && h.resumed)) break;
        await sleep(50);
      }
      restarted();
    })();
    const s = await pop.waitAll({ timeoutMs: 60_000, pollMs: 50 });
    settled = true;
    await watch;
    await pop.stop();
    return { popDir, dir, lines, hb, killedPid, s };
  } finally { restarted(); }
}
const REAL = realPopulation().then((v) => ({ v }), (e) => ({ e }));

function fakeCheckpoint(instDir, { t = 42, planeId = 'i0' } = {}) {
  const b = path.join(instDir, BRAIN_NAME);
  mkdirSync(b, { recursive: true });
  writeFileSync(path.join(b, 'snapshot.json'), JSON.stringify({ fake: 'organism', t, pad: 'x'.repeat(1000) }));
  writeFileSync(path.join(b, 'meta.json'), JSON.stringify({ name: BRAIN_NAME, t }));
  writeFileSync(path.join(b, 'plane.json'), JSON.stringify({ id: planeId, base: 'multiply/1', planeIndex: 5, evalsDone: 1234, t, store: { id: planeId, rows: [] } }));
  writeFileSync(path.join(b, 'control.json'), JSON.stringify({ url: 'http://127.0.0.1:1', pid: 1 }));
}

test('duplicate produces a distinct seed and a distinct state dir, from the checkpoint', () => {
  const popDir = path.join(TMP, 'dup');
  const { dir: d0 } = createInstance({ popDir, id: 'i0', seed: '1', wallS: 60, suite: SYN });
  assert.equal(duplicateInstance({ popDir, fromDir: d0, id: 'i1', seed: '2' }).status, 404, 'no checkpoint yet: nothing to copy');
  fakeCheckpoint(d0, { t: 42 });
  const r = duplicateInstance({ popDir, fromDir: d0, id: 'i1', seed: '2' });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const d1 = instanceDir(popDir, 'i1');
  assert.equal(r.body.dir, d1);
  assert.notEqual(path.resolve(d1), path.resolve(d0));
  const i0 = readJson(path.join(d0, 'instance.json')), i1 = readJson(path.join(d1, 'instance.json'));
  assert.equal(i1.seed, '2');
  assert.notEqual(i1.seed, i0.seed);
  assert.equal(i1.parent, 'i0');
  assert.equal(i1.duplicatedFrom.tick, 42);
  assert.equal(r.body.fromTick, 42);
  // the checkpoint is copied byte for byte, and the live control file is not
  assert.equal(readFileSync(path.join(d1, BRAIN_NAME, 'snapshot.json'), 'utf8'), readFileSync(path.join(d0, BRAIN_NAME, 'snapshot.json'), 'utf8'));
  assert.ok(existsSync(path.join(d1, BRAIN_NAME, 'plane.json')));
  assert.ok(!existsSync(path.join(d1, BRAIN_NAME, 'control.json')), 'control.json belongs to the running parent');
  assert.ok(existsSync(path.join(popDir, 'requests', 'i1.json')), 'the duplicate asks to be launched');
  // refused: the same seed, an existing id, a bad id
  assert.equal(duplicateInstance({ popDir, fromDir: d0, id: 'i2', seed: '1' }).status, 400);
  assert.equal(duplicateInstance({ popDir, fromDir: d0, id: 'i1', seed: '3' }).status, 409);
  assert.equal(duplicateInstance({ popDir, fromDir: d0, id: '../x', seed: '3' }).status, 400);
  assert.ok(!existsSync(instanceDir(popDir, 'i2')));
});

test('a duplicate plane inherits its parent elites and starts its own plane list under its own seed', () => {
  const { matrix } = syntheticMatrix({ seed: 'inherit', tasks: 256 });
  const parent = new PlaneSearch({ id: 'i0', base: 'multiply/1', matrix });
  for (let k = 0; k < 20; k++) parent.slice(5);
  parent.harvest();
  const state = parent.toState();
  assert.ok(state.store.rows.length > 0);
  const child = new PlaneSearch({ id: 'i1', base: 'multiply/2', matrix, state });
  assert.equal(child.inherited.from, 'i0');
  assert.equal(child.inherited.rows, state.store.rows.length);
  assert.equal(child.planeIndex, 0);
  assert.equal(child.evals, child.engine.evals, 'the parent evaluations are not counted as the child');
  assert.notEqual(child.coord.seed, parent.coord.seed);
  assert.ok(child.store.rows().every((r) => r.source === 'i0'), 'inherited rows keep the instance that found them');
  // the same id resumes instead: counters and the plane index come back
  const again = new PlaneSearch({ id: 'i0', base: 'multiply/1', matrix, state });
  assert.equal(again.planeIndex, state.planeIndex);
  assert.equal(again.resumed.storeRows, state.store.rows.length);
});

test('the elite store keeps the better of two, a tie keeps the incumbent, and the source is recorded', () => {
  const s = new EliteStore({ id: 'a' });
  const row = (fitness, source) => ({ cell: 7, fitness, count: 1, len: 1, genome: [3], source });
  assert.equal(s.offer(row(0.5, 'a')), 'filled');
  assert.equal(s.offer(row(0.4, 'b')), 'kept');
  assert.equal(s.get(7).source, 'a');
  assert.equal(s.offer(row(0.5, 'b')), 'kept', 'a tie is not strictly better');
  assert.equal(s.get(7).source, 'a');
  assert.equal(s.offer(row(0.6, 'b'), { via: 'b' }), 'replaced');
  assert.equal(s.get(7).source, 'b');
  assert.equal(s.get(7).via, 'b');
  assert.equal(s.get(7).fitness, 0.6);
  assert.deepEqual(s.stats, { offered: 4, filled: 1, replaced: 1, kept: 2 });
  assert.equal(EliteStore.from(JSON.parse(JSON.stringify(s.toJSON()))).get(7).source, 'b');
});

test('the exchange keeps the better of two across instances, re-scores every import, and rejects a row from another matrix', () => {
  const { matrix, plantedIds } = syntheticMatrix({ seed: 'exchange', tasks: 256 });
  const storeDir = path.join(TMP, 'xstore');
  mkdirSync(storeDir, { recursive: true });
  const A = new PlaneSearch({ id: 'A', base: 'multiply/A', matrix });
  const B = new PlaneSearch({ id: 'B', base: 'multiply/B', matrix });
  // find two genomes in one store cell with different fitness (a deterministic walk over short libraries)
  const byCell = new Map();
  let pair = null;
  const ids = [...plantedIds, ...Array.from({ length: 64 }, (_, i) => i).filter((c) => !plantedIds.includes(c))];
  outer: for (const a of ids) for (const b of ids) {
    if (a === b) continue;
    const g = [a, b], s = A.rescore(g);
    const prev = byCell.get(s.cell);
    if (prev && prev.fitness !== s.fitness) { pair = prev.fitness < s.fitness ? [prev, { ...s, genome: g }] : [{ ...s, genome: g }, prev]; break outer; }
    if (!prev) byCell.set(s.cell, { ...s, genome: g });
  }
  assert.ok(pair, 'two libraries share a cell with different fitness');
  const [worse, better] = pair;
  // B holds the better one; A exports the worse one in the same cell and a row B lacks
  B.store.offer({ ...better, source: 'B' });
  const other = [...byCell.values()].find((r) => r.cell !== better.cell);
  A.store.offer({ ...worse, source: 'A' });
  A.store.offer({ ...other, source: 'A' });
  A.engine = { elites: () => [], evals: 0 }; // nothing running: export exactly the two rows above
  A.exportOwn(storeDir);
  const doc = readJson(path.join(storeDir, 'A.json'));
  doc.rows.push({ ...other, genome: other.genome, count: other.count + 1, source: 'A' }); // a count this matrix does not give
  writeJsonAtomic(path.join(storeDir, 'A.json'), doc);
  const r = B.importAll(storeDir);
  assert.equal(r.files, 1);
  assert.equal(r.rejected, 1, 'the tampered row is rejected after re-scoring');
  assert.equal(B.store.get(better.cell).source, 'B', 'the better own elite is kept');
  assert.equal(B.store.get(better.cell).fitness, better.fitness);
  assert.equal(B.store.get(other.cell).source, 'A', 'the imported elite records the instance that found it');
  assert.equal(B.store.get(other.cell).via, 'A');
  assert.equal(r.filled + r.replaced, 1);
  assert.equal(B.report().elitesImported, 1);
  // exported counts only rows new since the last export
  assert.equal(A.exportOwn(storeDir).fresh, 0);
});

test('ownBytes on every worker boundary: workerData, main to worker, worker to main', async () => {
  const big = new ArrayBuffer(1 << 16);
  const view = new Uint8Array(big, 128, 16);
  view.fill(7);
  const got = [];
  const port = { postMessage: (m) => got.push(m) };
  const a = postToPlane(port, { op: 'x', seq: 1, bytes: view });
  const b = postFromPlane(port, { op: 'y', seq: 2, nested: { bytes: view } });
  const o = planeWorkerOptions({ id: 'w', bytes: view }, 64);
  for (const v of [got[0].bytes, got[1].nested.bytes, o.workerData.multiplyPlane.bytes]) {
    assert.equal(v.byteLength, 16);
    assert.equal(v.buffer.byteLength, 16, 'the view crossed as its own 16 bytes, not the 64 KB buffer');
    assert.equal(v[0], 7);
  }
  assert.equal(a, got[0]); assert.equal(b, got[1]);
  assert.equal(o.resourceLimits.maxOldGenerationSizeMb, 64);
  // the census, with its control: the only postMessage calls in the file are inside the two helpers,
  // and the Worker is only ever built from planeWorkerOptions
  const src = readFileSync(MULTIPLY_FILE, 'utf8');
  const posts = src.split('\n').filter((l) => /\.postMessage\(/.test(l));
  assert.equal(posts.length, 2, posts.join('\n'));
  assert.ok(posts.every((l) => /ownBytes\(msg\)/.test(l)));
  const workers = src.split('\n').filter((l) => /new Worker\(/.test(l));
  assert.deepEqual(workers.map((l) => l.trim()), ['this.worker = new Worker(SELF, planeWorkerOptions(data, heapMb));']);
  // and a real worker answers through them: ready, exchange, report, stop
  const popDir = path.join(TMP, 'worker');
  const storeDir = path.join(popDir, 'store');
  mkdirSync(storeDir, { recursive: true });
  const w = new PlaneWorker({ id: 'w1', base: 'multiply/w', planeFile: path.join(popDir, 'plane.json'), storeDir, cacheDir: null, suite: SYN, heapMb: 128 });
  const ready = await w.start();
  assert.equal(ready.op, 'ready');
  assert.equal(ready.T, 256);
  await sleep(200);
  const ex = await w.exchange({ kind: 'checkpoint', t: 5 });
  assert.equal(ex.op, 'exchanged');
  assert.equal(ex.exchange.t, 5);
  assert.ok(ex.report.evals > 0);
  assert.ok(existsSync(path.join(storeDir, 'w1.json')) && existsSync(path.join(popDir, 'plane.json')));
  const st = await w.stop({ t: 6 });
  assert.equal(st.op, 'stopped');
  assert.ok(st.report.best && st.report.best.fresh !== null);
});

test('health prints instances alive, the instance id, duplications, elites imported and exported', async () => {
  const popDir = path.join(TMP, 'health');
  const instDir = instanceDir(popDir, 'i0');
  mkdirSync(path.join(instDir, BRAIN_NAME), { recursive: true });
  const now = Date.now();
  writeJsonAtomic(path.join(instDir, BRAIN_NAME, 'multiply.json'), { instance: 'i0', seed: '1', pid: process.pid, popDir, updatedAt: new Date(now).toISOString(), duplications: 2, elitesImported: 11, elitesExported: 13, storeRows: 40, tick: 77, ended: false });
  const hb = (id, extra) => writeJsonAtomic(path.join(popDir, 'instances', id + '.json'), { id, pid: process.pid, atMs: now, ended: false, ...extra });
  hb('i0', {}); hb('i1', {});
  hb('old', { atMs: now - 60_000 });                  // stale
  hb('gone', { ended: true });                        // ended
  hb('dead', { pid: 999999 });                        // a pid that does not answer
  const h = readHealth({ stateDir: instDir, name: BRAIN_NAME, atMs: now, seriesFile: path.join(TMP, 'no-series.json') });
  assert.equal(h.ok, true);
  assert.equal(h.instance, 'i0');
  assert.equal(h.instancesAlive, 2);
  assert.deepEqual(h.instances, ['i0', 'i1']);
  assert.equal(h.tick, 77);
  assert.equal(h.multiply.instance, 'i0');
  assert.equal(h.multiply.instancesAlive, 2);
  assert.equal(h.multiply.duplications, 2);
  assert.equal(h.multiply.elitesImported, 11);
  assert.equal(h.multiply.elitesExported, 13);
  assert.deepEqual(populationAlive(popDir, { atMs: now, checkPid: false }).ids, ['dead', 'i0', 'i1'], 'control: without the pid check the dead pid counts');
  // served, on its own port, with the instance's own duplicate behind /duplicate
  const srv = await startHealth({ port: 0, host: '127.0.0.1', stateDir: instDir, name: BRAIN_NAME, seriesFile: path.join(TMP, 'no-series.json'), onDuplicate: (seed) => ({ status: 200, body: { ok: true, seed } }) });
  const get = (p) => new Promise((resolve, reject) => http.get(srv.url + p, (res) => { let s = ''; res.on('data', (d) => { s += d; }); res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(s) })); }).on('error', reject));
  try {
    const r = await get('/health');
    assert.equal(r.status, 200);
    assert.equal(r.body.multiply.elitesExported, 13);
    const d = await get('/duplicate?seed=9');
    assert.deepEqual(d.body, { ok: true, seed: '9' });
  } finally { await srv.close(); }
});

test('daemon/run.mjs calls the exchange hook after every checkpoint, and a throwing hook never stops it', async () => {
  await RESTARTED; // the real population's restart window is past (RESTARTED above)
  process.env.BRAIN_STATE_DIR = path.join(TMP, 'hookstate');
  const { live } = await import('../daemon/run.mjs');
  const calls = [];
  const p = await live({ name: 'hook', majors: 4, substrateUnits: 64, seed: 'hook', ticks: 40, checkpointEvery: 20, ledger: 'summary', ledgerBudgetMb: 1, mindBytes: TINY_MIND, instance: 'h0', onCheckpoint: (info) => calls.push(info) });
  assert.deepEqual(calls.map((c) => c.kind), ['built', 'checkpoint', 'checkpoint', 'final']);
  assert.deepEqual(calls.map((c) => c.t), [0, 20, 40, 40]);
  assert.ok(calls.every((c) => c.bytes > 0 && c.name === 'hook'));
  assert.equal(p.exchange.calls, 4);
  assert.equal(p.instance, 'h0');
  const q = await live({ name: 'hook2', majors: 4, substrateUnits: 64, seed: 'hook', ticks: 20, checkpointEvery: 10, ledger: 'summary', ledgerBudgetMb: 1, mindBytes: TINY_MIND, onCheckpoint: () => { throw new Error('boom'); } });
  assert.equal(q.exchange.calls, 0);
  assert.equal(q.exchange.errors.length, 4);
  assert.equal(q.end.t, 20);
  const r = await live({ name: 'hook3', majors: 4, substrateUnits: 64, seed: 'hook', ticks: 10, checkpointEvery: 10, ledger: 'summary', ledgerBudgetMb: 1, mindBytes: TINY_MIND });
  assert.equal(r.exchange, null, 'no hook, no exchange record');
});

test('a dead instance restarts from its own checkpoint (a scripted instance)', async () => {
  const popDir = path.join(TMP, 'restart');
  const { dir } = createInstance({ popDir, id: 'i0', seed: '1', wallS: 60, suite: SYN });
  // the script: first start writes a checkpoint and waits to be killed; a later start reads it back and ends.
  // Every write lands whole (a temp file and one rename, as the real instance's writeJsonAtomic does): a plain
  // writeFileSync killed between its create and its write left an empty meta.json that the restart could not
  // parse (seen with the file beside other load; board 17 builder (the organism's item))
  const script = path.join(TMP, 'fake-instance.mjs');
  writeFileSync(script, `
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from 'node:fs';
import path from 'node:path';
const put = (f, v) => { writeFileSync(f + '.tmp', JSON.stringify(v)); renameSync(f + '.tmp', f); };
const dir = process.argv[process.argv.indexOf('--dir') + 1];
const b = path.join(dir, 'brain');
mkdirSync(b, { recursive: true });
const inst = JSON.parse(readFileSync(path.join(dir, 'instance.json'), 'utf8'));
inst.starts = (inst.starts || 0) + 1; if (!inst.firstStartMs) inst.firstStartMs = Date.now();
put(path.join(dir, 'instance.json'), inst);
if (!existsSync(path.join(b, 'meta.json'))) { put(path.join(b, 'meta.json'), { t: 314 }); setInterval(() => {}, 1000); }
else { const m = JSON.parse(readFileSync(path.join(b, 'meta.json'), 'utf8')); put(path.join(b, 'done.json'), { resumedAt: m.t, starts: inst.starts, pid: process.pid }); }
`);
  const lines = [];
  const pop = new Population({ popDir, launch: plainLauncher({ script, heapMb: 64 }), backoffMs: 100, log: (l) => lines.push(l) }).start();
  const m = pop.add('i0');
  for (let i = 0; i < 100 && !(m.pid && existsSync(path.join(dir, 'brain', 'meta.json'))); i++) await sleep(50);
  const pid = pop.kill('i0');
  assert.ok(pid > 0);
  const s = await pop.waitAll({ timeoutMs: 20_000 });
  await pop.stop();
  assert.equal(s[0].restarts, 1, lines.join('\n'));
  assert.equal(s[0].done, true);
  assert.notEqual(s[0].exits[0].code, 0, 'the first attempt died');
  const done = readJson(path.join(dir, 'brain', 'done.json'));
  assert.equal(done.resumedAt, 314, 'the second start read the checkpoint the first one left');
  assert.equal(done.starts, 2);
  assert.notEqual(done.pid, pid);
  assert.ok(lines.some((l) => /restart 1 from its checkpoint t=314/.test(l)), lines.join('\n'));
});

test('a real instance duplicates, is killed, comes back from its own checkpoint, and both end (tiny organism, synthetic plane)', async () => {
  // started before the first test (REAL above): created, launched, killed after its third exchange, waited for
  const got = await REAL;
  if (got.e) throw got.e;
  const { popDir, dir, lines, hb, killedPid, s } = got.v;
  assert.ok(hb && hb.exchanges >= 3, 'i0 exchanged: ' + JSON.stringify(hb));
  assert.ok(killedPid > 0);
  const byId = Object.fromEntries(s.map((x) => [x.id, x]));
  assert.ok(byId.i1, 'the duplicate was launched: ' + lines.join('\n'));
  assert.equal(byId.i0.restarts, 1, lines.join('\n'));
  const d0 = readJson(path.join(dir, BRAIN_NAME, 'done.json'));
  const d1 = readJson(path.join(instanceDir(popDir, 'i1'), BRAIN_NAME, 'done.json'));
  assert.ok(d0 && d1, 'both ended with done.json');
  assert.equal(d0.starts, 2);
  // the supervisor read meta.json after the death and before the restart; the new start resumed exactly there
  const said = lines.map((l) => /i0 exited .* restart 1 from its checkpoint t=(\d+)/.exec(l)).find(Boolean);
  assert.ok(said, lines.join('\n'));
  assert.equal(d0.resumedAt, Number(said[1]), 'i0 resumed at the tick of the checkpoint on disk when it died');
  assert.ok(d0.resumedAt > 0);
  assert.ok(d0.report.resumed && d0.report.resumed.storeRows > 0, 'the plane resumed from plane.json');
  assert.equal(d0.duplications, 1, 'the restarted instance did not duplicate again');
  const i1 = readJson(path.join(instanceDir(popDir, 'i1'), 'instance.json'));
  assert.equal(i1.seed, '2'); assert.equal(i1.parent, 'i0');
  assert.equal(d1.report.inherited.from, 'i0');
  assert.ok(d0.report.elitesImported + d1.report.elitesImported > 0, 'elites crossed between the two');
  assert.ok(d0.report.best.fresh !== null && d1.report.best.fresh !== null);
});
