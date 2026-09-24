// test/io.test.mjs: the senses and muscles, end to end. Every test here drives real IO
// (a temp file, a local node:http server, an fs.watch watcher) but never the network:
// source.http/sink.http talk to a node:http server started inside the test, on 127.0.0.1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { Brain } from '../core/brain.mjs';
import { createCell, runCell } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import '../io/sources.mjs';
import '../io/sinks.mjs';
import { closeSource } from '../io/sources.mjs';
import { Runner, runOnce } from '../io/runner.mjs';

function newTmpDir(t) {
  const dir = mkdtempSync(path.join(tmpdir(), 'brain-io-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

// ================================================================== io/sources.mjs + io/sinks.mjs, wired through a real Brain

test('source.file (jsonl) through a brain into sink.file reproduces all 50 rows, in order', (t) => {
  const dir = newTmpDir(t);
  const inPath = path.join(dir, 'in.jsonl'), outPath = path.join(dir, 'out.jsonl');
  const rows = [];
  for (let i = 0; i < 50; i++) rows.push({ i, val: 'row' + i });
  writeFileSync(inPath, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');

  const brain = new Brain({ ledger: 'off' });
  brain.addCell({ id: 'src', kind: 'source.file', region: 'r', params: { path: inPath }, policy: { period: 1 } });
  brain.addCell({ id: 'snk', kind: 'sink.file', region: 'r', params: { path: outPath, flushEvery: 1 }, policy: { period: 'event' } });
  brain.connect('src', 'out', 'snk', 'in');
  // row k (emitted at tick t=k) is scheduled to arrive at t=k+1 and needs that tick
  // processed to be delivered and run through the sink: 50 rows need ticks t=0..50.
  brain.tick(rows.length + 1);

  const lines = readFileSync(outPath, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(lines.length, rows.length, 'every row reached the file sink');
  for (let i = 0; i < rows.length; i++) assert.deepEqual(lines[i].data, rows[i], 'row ' + i + ' reproduced exactly');
});

test('source.file (csv): params.numeric columns parse to an exact num, other columns stay strings', (t) => {
  const dir = newTmpDir(t);
  const csvPath = path.join(dir, 'rows.csv');
  writeFileSync(csvPath, 'id,label,value\n0,a,1.5\n1,b,2\n2,c,3.25\n');
  const cell = createCell({ id: 'csv', kind: 'source.file', params: { path: csvPath, format: 'csv', numeric: ['id', 'value'] }, policy: { period: 1 } });
  const ctx = { t: 0, gen: 0 };
  const out = [runCell(cell, [], ctx), runCell(cell, [], ctx), runCell(cell, [], ctx), runCell(cell, [], ctx)];

  assert.equal(out[3][0], null, 'exhausted after the 3 data rows');
  assert.equal(S.ratToString(out[0][0].data.id), '0', 'id column is an exact num');
  assert.equal(out[0][0].data.label, 'a', 'label column stayed a plain string');
  assert.ok(S.ratEq(out[0][0].data.value, S.ratFromDecimal('1.5')), 'row 0 value is exactly 1.5, not a float approximation');
  assert.ok(S.ratEq(out[1][0].data.value, S.ratFromDecimal('2')), 'row 1 value is exactly 2');
  assert.ok(S.ratEq(out[2][0].data.value, S.ratFromDecimal('3.25')), 'row 2 value is exactly 3.25');
});

test('source.timer emits wallMs + t on every run', () => {
  const cell = createCell({ id: 'tm', kind: 'source.timer', policy: { period: 1 } });
  const before = Date.now();
  const out = runCell(cell, [], { t: 7, gen: 0 });
  assert.equal(out[0].data.t, 7);
  assert.ok(out[0].data.wallMs >= before, 'wallMs is a real Date.now() reading');
});

// ================================================================== io/runner.mjs

test('runOnce: ticks a brain synchronously and returns everything that landed in the outbox', () => {
  const brain = new Brain({ ledger: 'off' });
  brain.addCell({ id: 'tm', kind: 'source.timer', region: 'r', policy: { period: 1 } });
  const out = runOnce(brain, 5);
  assert.equal(out.length, 5, 'an unrouted source.timer signal reaches the outbox exactly once per tick');
  assert.equal(brain.clock.t, 5);
});

test('Runner: ticks in real time with drift correction, drains to a registered sink, reports sane stats', async (t) => {
  const dir = newTmpDir(t);
  const outPath = path.join(dir, 'ticks.jsonl');
  const brain = new Brain({ ledger: 'off' });
  brain.addCell({ id: 'tm', kind: 'source.timer', region: 'r', policy: { period: 1 } });
  const runner = new Runner(brain, { msPerTick: 2, maxTicks: 100, sinks: [{ id: 'out', kind: 'sink.file', params: { path: outPath, flushEvery: 1 } }] });

  runner.start();
  const stats = await runner.done;

  console.log('runner stats over 100 ticks at msPerTick=2: ' + JSON.stringify(stats));
  assert.equal(stats.ticks, 100, 'ran exactly maxTicks ticks');
  assert.equal(brain.clock.t, 100, 'the brain advanced exactly one clock tick per runner tick');
  assert.equal(runner.running, false, 'stopped itself at maxTicks');
  assert.ok(stats.meanMs >= 0, 'meanMs is a real, non-negative measurement');
  assert.ok(stats.maxMs >= stats.meanMs - 1e-9, 'maxMs is at least the mean');
  assert.ok(Number.isInteger(stats.lateTicks) && stats.lateTicks >= 0 && stats.lateTicks <= stats.ticks, 'lateTicks is a sane count');

  const lines = readFileSync(outPath, 'utf8').trim().split('\n');
  assert.equal(lines.length, 100, 'one drained timer event per tick reached the registered sink');
});

// ================================================================== source.http + sink.http, no network: a node:http server on 127.0.0.1

test('source.http and sink.http round trip through a local node:http server', async (t) => {
  const received = [];
  const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/data') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ hello: 'world', n: 42 }));
      return;
    }
    if (req.method === 'POST' && req.url === '/ingest') {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        received.push(JSON.parse(body));
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      });
      return;
    }
    res.writeHead(404); res.end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const brain = new Brain({ ledger: 'off' });
  brain.addCell({ id: 'h', kind: 'source.http', region: 'r', params: { url: `http://127.0.0.1:${port}/data`, timeoutMs: 2000 }, policy: { period: 1 } });
  brain.addCell({ id: 's', kind: 'sink.http', region: 'r', params: { url: `http://127.0.0.1:${port}/ingest` }, policy: { period: 'event' } });
  brain.connect('h', 'out', 's', 'in');

  const deadline = Date.now() + 5000;
  while (received.length < 1 && Date.now() < deadline) {
    brain.tick(1);
    await wait(20);
  }
  assert.ok(received.length >= 1, 'sink.http POSTed at least one signal to the local server within 5s');
  assert.equal(received[0].kind, 'event');
  assert.equal(received[0].data.hello, 'world', 'the GET body source.http fetched round-tripped through sink.http intact');
  assert.equal(received[0].data.n, 42);
  assert.equal(brain.cell('s').state.failed, 0, 'no retries were needed against a healthy server');
});

test('source.http emits an error event (not a throw) when the request times out', async () => {
  // A server that never responds: source.http must time out and emit on its error port,
  // never throw into runCell.
  const server = http.createServer(() => { /* never respond */ });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  try {
    const cell = createCell({ id: 'h', kind: 'source.http', params: { url: `http://127.0.0.1:${port}/never`, timeoutMs: 50 }, policy: { period: 1 } });
    const ctx = { t: 0, gen: 0 };
    let errorEvent = null;
    const deadline = Date.now() + 3000;
    while (!errorEvent && Date.now() < deadline) {
      const out = runCell(cell, [], ctx); // runCell's own try/catch would report a thrown error as cell.stats.errors
      if (out[1]) errorEvent = out[1];
      else await wait(20);
    }
    assert.ok(errorEvent, 'timed out and emitted an error event');
    assert.equal(errorEvent.data.timeout, true);
    assert.equal(cell.stats.errors, 0, 'compute() never threw; runCell never had to catch anything');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// ================================================================== source.watch

test('source.watch fires a debounced event when the watched file changes', async (t) => {
  const dir = newTmpDir(t);
  const filePath = path.join(dir, 'watched.txt');
  writeFileSync(filePath, 'initial');
  const cell = createCell({ id: 'w', kind: 'source.watch', params: { path: filePath, debounceMs: 20 }, policy: { period: 1 } });
  t.after(() => closeSource(cell));
  const ctx = { t: 0, gen: 0 };

  runCell(cell, [], ctx); // starts the watcher; nothing queued yet
  await wait(30);
  writeFileSync(filePath, 'changed');

  let event = null;
  const deadline = Date.now() + 3000;
  while (!event && Date.now() < deadline) {
    const out = runCell(cell, [], ctx);
    if (out[0]) event = out[0]; else await wait(15);
  }
  assert.ok(event, 'source.watch emitted an event after the file changed');
  assert.equal(event.data.path, filePath);
});
