// test/boundary.test.mjs: the byte walker, the static scan, the live probe and the allowlist
// gate of tools/boundary-audit.mjs. No model calls; every child process ends on its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { walkBytes, calibrate, scanSource, scanTree, checkAllowlist, literalValue, ALLOWLIST, CAP_BYTES } from '../tools/boundary-audit.mjs';

const AUDIT = fileURLToPath(new URL('../tools/boundary-audit.mjs', import.meta.url));
const PM = 'post' + 'Message'; // built, so this file holds no boundary of its own
const MB = 1 << 20;

test('a view is its whole buffer: an 8192 byte window on 1 MB copies 1 MB, its slice copies 8192', () => {
  const v = new Int8Array(new ArrayBuffer(MB), 4096, 8192);
  const r = walkBytes({ hv: v });
  assert.equal(r.copied, MB);
  assert.equal(r.viewOnly, 8192);
  assert.equal(r.windows, 1);
  assert.equal(r.views, 1);
  const s = walkBytes({ hv: v.slice() });
  assert.equal(s.copied, 8192);
  assert.equal(s.windows, 0);
  assert.ok(r.bytes >= r.copied && r.bytes < r.copied + 64, 'bytes is copied plus a small wire estimate: ' + r.bytes);
});

test('a shared buffer is not copied, and is counted once however many views reach it', () => {
  const sab = new SharedArrayBuffer(MB);
  const r = walkBytes({ a: new Int8Array(sab, 0, 8192), b: new Int32Array(sab, 8192, 16), sab });
  assert.equal(r.copied, 0);
  assert.equal(r.shared, MB);
  assert.equal(r.views, 2);
  assert.equal(r.windows, 0);
});

test('a nested object: arrays, a Map, a Set, a back reference and a transferred buffer', () => {
  const big = new ArrayBuffer(65536);
  const v1 = new Float32Array(big, 0, 16), v2 = new Uint8Array(big, 1024, 8);
  const small = new Uint8Array(100), tb = new ArrayBuffer(4096);
  const value = { a: [v1, { b: new Map([['k', v2]]) }], s: new Set([small]), again: v1, t: new Uint8Array(tb), n: 1, str: 'x' };
  const r = walkBytes(value, { transfer: [tb], isWasm: (b) => b === big });
  assert.equal(r.copied, 65536 + 100, 'big once for two views on it, plus small');
  assert.equal(r.transferred, 4096);
  assert.equal(r.views, 4, 'v1 reached twice counts once');
  assert.equal(r.windows, 2);
  assert.equal(r.wasmViews, 2);
  assert.equal(r.maxBuffer, 65536);
});

test('calibrate: the walker agrees with what a real structured clone delivers', () => {
  const c = calibrate();
  assert.equal(c.predicted, MB);
  assert.equal(c.received, MB, 'the clone delivered the whole buffer behind an 8192 byte view');
  assert.equal(c.arrivedViewBytes, 8192);
  assert.equal(c.predictedShared, 0);
  assert.equal(c.sharedArrived, true);
  assert.equal(c.owned, 8192);
});

function planted(dir) {
  const lines = [
    "import { Worker } from 'node:worker_threads';",
    'const w = new Worker(new URL(import.meta.url), { workerData: { heap } });',
    'w.' + PM + '({ hv: vec });',
    "const src = ['parentPort." + PM + '({ type: "x", v })' + "'];",
    '// w.' + PM + '(heap) in a comment is not a boundary',
    'const re = /' + PM + "\\(/; const s = 'x.send(1)';",
  ];
  fs.mkdirSync(path.join(dir, 'lib'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'lib', 'planted.mjs'), lines.join('\n') + '\n');
}

test('the audit finds a planted boundary, and the gate fails until it is listed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-plant-'));
  try {
    planted(dir);
    const found = scanTree(dir);
    assert.deepEqual(found.map((b) => b.kind + ' ' + b.line).sort(), ['postMessage 3', 'postMessage 4', 'workerData 2']);
    assert.equal(found.find((b) => b.kind === 'workerData').expr, '{ heap }');
    assert.equal(found.find((b) => b.line === 3).expr, '{ hv: vec }');
    assert.equal(found.find((b) => b.line === 4).where, 'string');
    assert.equal(checkAllowlist(found, ALLOWLIST).unlisted.length, 3, 'three new boundaries, none listed');
    const listed = found.map((b) => ({ key: b.key, bytes: 100 }));
    assert.equal(checkAllowlist(found, listed).unlisted.length, 0);
    assert.equal(checkAllowlist(found, [...listed, { key: 'lib/gone.mjs|postMessage|x', bytes: 1 }]).stale.length, 1);
    assert.equal(checkAllowlist(found, [{ key: listed[0].key, bytes: CAP_BYTES }]).overCap.length, 1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('send: process.send anywhere, x.send only where child_process is imported', () => {
  assert.equal(scanSource('a.mjs', 'process.send({ ok: 1 });\nthing.send(2);\n').length, 1);
  assert.equal(scanSource('b.mjs', "import { fork } from 'node:child_process';\nconst c = fork('x');\nc.send({ op: 'stop' });\n").length, 1);
  assert.deepEqual(literalValue("{ op: 'stop' }"), { op: 'stop' });
  assert.equal(literalValue('{ id, op }'), undefined);
});

test('the probe measures a planted wasm heap view crossing a port, at its line', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-probe-'));
  try {
    const file = path.join(dir, 'cross.mjs');
    fs.writeFileSync(file, [
      "import { MessageChannel } from 'node:worker_threads';",
      'const mem = new WebAssembly.Memory({ initial: 4, maximum: 4 });',
      'const { port1, port2 } = new MessageChannel();',
      'port1.' + PM + '({ hv: new Int8Array(mem.buffer, 8192, 8192) });',
      'port1.' + PM + '({ hv: new Int8Array(mem.buffer, 8192, 8192).slice() });',
      'port1.close(); port2.close();',
    ].join('\n') + '\n');
    const probe = path.join(dir, 'probe');
    const env = { ...process.env, BRAIN_BOUNDARY_PROBE_DIR: probe, NODE_OPTIONS: '--require ' + JSON.stringify(AUDIT) };
    const r = spawnSync(process.execPath, [file], { env, encoding: 'utf8', timeout: 60000 });
    assert.equal(r.status, 0, r.stderr);
    const msgs = fs.readdirSync(probe).flatMap((f) => fs.readFileSync(path.join(probe, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))).filter((o) => o.t === 'msg');
    const at = (line) => msgs.find((o) => o.site && o.site.line === line && o.site.file.endsWith('cross.mjs'));
    assert.ok(at(4) && at(5), JSON.stringify(msgs));
    assert.equal(at(4).m.copied, 4 * 65536, 'the unpacked view copies the whole wasm memory');
    assert.equal(at(4).m.wasmViews, 1);
    assert.equal(at(5).m.copied, 8192);
    assert.equal(at(5).m.wasmViews, 0);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('control: the probe knows core/simd.mjs heap, so a real hypervector posted unpacked is flagged', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-simd-'));
  try {
    const file = path.join(dir, 'hv.mjs');
    const simd = new URL('../core/simd.mjs', import.meta.url).href;
    fs.writeFileSync(file, [
      "import { MessageChannel } from 'node:worker_threads';",
      'const { alloc, isHeap } = await import(' + JSON.stringify(simd) + ');',
      'const hv = alloc(8192); if (!hv || !isHeap(hv)) throw new Error("no heap view");',
      'const { port1, port2 } = new MessageChannel();',
      'port1.' + PM + '({ hv });',
      'port1.' + PM + '({ hv: hv.slice() });',
      'port1.close(); port2.close(); console.log(hv.buffer.byteLength);',
    ].join('\n') + '\n');
    const probe = path.join(dir, 'probe');
    const env = { ...process.env, BRAIN_HV_HEAP_MB: '4', BRAIN_BOUNDARY_PROBE_DIR: probe, NODE_OPTIONS: '--require ' + JSON.stringify(AUDIT) };
    const r = spawnSync(process.execPath, [file], { env, encoding: 'utf8', timeout: 60000 });
    assert.equal(r.status, 0, r.stderr);
    const heapBytes = Number(r.stdout.trim().split('\n').pop());
    const msgs = fs.readdirSync(probe).flatMap((f) => fs.readFileSync(path.join(probe, f), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))).filter((o) => o.t === 'msg' && o.site && o.site.file.endsWith('hv.mjs'));
    const at = (line) => msgs.find((o) => o.site.line === line);
    assert.ok(at(5) && at(6), JSON.stringify(msgs));
    assert.equal(at(5).m.wasmViews, 1, 'the simd heap view is recognised');
    assert.equal(at(5).m.copied, heapBytes, 'and costs the whole heap');
    assert.ok(heapBytes >= 4 * MB);
    assert.equal(at(6).m.wasmViews, 0);
    assert.equal(at(6).m.copied, 8192);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('GATE: every boundary in the tree is in the allowlist with measured bytes under the cap', (t) => {
  const found = scanTree();
  assert.ok(found.length >= 60, 'the scan saw the tree: ' + found.length + ' boundaries');
  const chk = checkAllowlist(found);
  const hint = 'a new boundary: run node tools/boundary-audit.mjs --probe --label L, then --print-allowlist --label L, and list it with its bytes';
  assert.deepEqual(chk.unlisted.map((b) => b.file + ':' + b.line + ' ' + b.kind + ' ' + b.key), [], hint);
  assert.deepEqual(chk.overCap.map((a) => a.key + ' ' + a.bytes), []);
  for (const a of ALLOWLIST) assert.ok(Number.isFinite(a.bytes) && a.bytes < CAP_BYTES, a.key);
  if (chk.stale.length) t.diagnostic('stale allowlist entries (a boundary removed): ' + chk.stale.map((a) => a.key).join(', '));
});

// board 23: the autopilot gap. A test file that holds a boundary must be one of the drivers (the
// gate went red when test/autopilot.test.mjs gained three and no driver ran it), and a test file
// that holds a worker source must also run under a fault, or its error post is never measured.
import { DRIVERS, splitFor } from '../tools/boundary-audit.mjs';
import { contaminationRecords, contaminationRow } from '../bench/gate.mjs';

/** Test files holding a boundary with no plain driver, and those holding a worker source with no fault driver. */
function undriven(found, drivers) {
  const inTests = found.filter((b) => b.file.startsWith('test/'));
  const files = [...new Set(inTests.map((b) => b.file))].sort();
  const withSource = [...new Set(inTests.filter((b) => b.where === 'string').map((b) => b.file))].sort();
  return {
    files,
    withSource,
    plain: files.filter((f) => !drivers.some((d) => d.test === f && !d.fault)),
    noFault: withSource.filter((f) => !drivers.some((d) => d.test === f && d.fault)),
  };
}

test('every test file holding a boundary is a driver, and one holding a worker source also runs under a fault', () => {
  const found = scanTree();
  const u = undriven(found, DRIVERS);
  assert.ok(u.files.includes('test/autopilot.test.mjs') && u.files.includes('test/cloud.test.mjs'), 'the scan saw a worker source test file and a send test file: ' + u.files.join(', '));
  assert.ok(u.withSource.includes('test/autopilot.test.mjs') && !u.withSource.includes('test/cloud.test.mjs'), u.withSource.join(', '));
  assert.deepEqual(u.plain, []);
  assert.deepEqual(u.noFault, []);
  // controls: without the autopilot pair both checks name it; without only its fault driver, only the second does
  const none = undriven(found, DRIVERS.filter((d) => d.test !== 'test/autopilot.test.mjs'));
  assert.deepEqual(none.plain, ['test/autopilot.test.mjs']);
  assert.deepEqual(none.noFault, ['test/autopilot.test.mjs']);
  const plainOnly = undriven(found, DRIVERS.filter((d) => !(d.test === 'test/autopilot.test.mjs' && d.fault)));
  assert.deepEqual(plainOnly.plain, []);
  assert.deepEqual(plainOnly.noFault, ['test/autopilot.test.mjs']);
});

test('the bar split is an object the gate CONTAMINATION row accepts, and the same verdict without it is a cause', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-split-'));
  try {
    const split = splitFor({ boundaries: 76, drivers: 30 });
    assert.equal(split.heldOut.n, 0);
    assert.match(split.heldOut.what, /^none/);
    assert.notEqual(split.contaminated, true);
    const file = path.join(dir, 'boundary.json');
    fs.writeFileSync(file, JSON.stringify({ isTheBar: true, barMet: true, statement: 'a boundary audit', split }));
    const ok = contaminationRow(contaminationRecords(dir));
    assert.equal(ok.ok, true, ok.line);
    assert.equal(ok.counts.withSplit, 1);
    assert.equal(ok.counts.contaminated, 0);
    fs.writeFileSync(file, JSON.stringify({ isTheBar: true, barMet: true, statement: 'a boundary audit' }));
    const bad = contaminationRow(contaminationRecords(dir));
    assert.equal(bad.ok, false);
    assert.deepEqual(bad.noSplit, ['boundary.json']);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
