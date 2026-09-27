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

// board 23 fix pass: board 24a's test/plateau.test.mjs brought the first test file whose only boundary
// is a structuredClone, and no driver ran it (80 boundaries, unexercised 4, unlisted 4). undriven had
// only met worker-source, workerData and send rows; here it meets every kind a test file can hold.
test('undriven sorts every kind a test file can hold: each needs a plain driver, only a worker source a fault driver', () => {
  const SC = 'structured' + 'Clone'; // built, so this file holds no boundary of its own
  const rows = [
    ...scanSource('test/clone.test.mjs', 'const y = ' + SC + '(matrixToWire(a));\n'),
    ...scanSource('test/src.test.mjs', "const src = ['parentPort." + PM + "({ error: String(e) })'];\n"),
    ...scanSource('test/wd.test.mjs', "import { Worker } from 'node:worker_threads';\nconst w = new Worker(u, { workerData: { job } });\n"),
    ...scanSource('test/send.test.mjs', "process.send({ op: 'stop' });\n"),
  ];
  assert.deepEqual(rows.map((b) => b.file + ' ' + b.kind + ' ' + b.where).sort(), [
    'test/clone.test.mjs structuredClone code', 'test/send.test.mjs send code', 'test/src.test.mjs postMessage string', 'test/wd.test.mjs workerData code',
  ]);
  const files = ['test/clone.test.mjs', 'test/send.test.mjs', 'test/src.test.mjs', 'test/wd.test.mjs'];
  const none = undriven(rows, []);
  assert.deepEqual(none.plain, files);
  assert.deepEqual(none.noFault, ['test/src.test.mjs']);
  const plain = files.map((f) => ({ name: 'test-' + f, test: f }));
  assert.deepEqual(undriven(rows, plain).plain, []);
  assert.deepEqual(undriven(rows, plain).noFault, ['test/src.test.mjs']);
  const all = [...plain, { name: 'test-src-url', test: 'test/src.test.mjs', fault: 'url' }];
  assert.deepEqual([undriven(rows, all).plain, undriven(rows, all).noFault], [[], []]);
  // control: a fault driver is not a plain driver, so the clone file under a fault alone is still named
  const faultOnly = undriven(rows, [...plain.filter((d) => d.test !== 'test/clone.test.mjs'), { name: 'x', test: 'test/clone.test.mjs', fault: 'url' }]);
  assert.deepEqual(faultOnly.plain, ['test/clone.test.mjs']);
  // the live tree holds more than one kind in its test files, so the sort above is not a check of one kind
  const live = scanTree().filter((b) => b.file.startsWith('test/'));
  assert.ok(new Set(live.map((b) => b.kind)).size >= 2, 'kinds in test files: ' + [...new Set(live.map((b) => b.kind))].join(', '));
  assert.deepEqual(undriven(live, DRIVERS).plain, []);
});

// board 26 boundary-statement: the board 23 statement said "1318 message records" and "16777216 byte cap",
// neither printed by --bar, and "Touched tests: test/boundary.test.mjs 12/12" while touched was []. The
// statement is now built from the verdict object; these cases parse its numbers with a regex of their own
// and hold each to the verdict field it names, on the real verdict and on a planted one with other counts.
import { statementOf, auditStatement } from '../tools/boundary-audit.mjs';

const VERDICT = fileURLToPath(new URL('../bench/verdicts/boundary.json', import.meta.url));
const field = (v, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), v);
const copyOf = (v) => JSON.parse(JSON.stringify(v)); // a JSON copy, so this file holds no clone boundary of its own
/** Number tokens, not glued to a word, a dot or a dash; the text field values (paths, names) blanked first. */
function numbersIn(text, v, textPaths) {
  let t = String(text);
  const vals = textPaths.map((p) => field(v, p)).filter((x) => typeof x === 'string').sort((a, b) => b.length - a.length);
  for (const x of vals) t = t.split(x).join(' ');
  return t.match(/(?<![\w.\-])\d+(?:\.\d+)?(?!\w)/g) || [];
}
function assertSourced(v, text, fields, label) {
  const toks = numbersIn(text, v, fields.texts);
  assert.equal(toks.length, fields.numbers.length, label + ': ' + toks.length + ' numbers in the statement, ' + fields.numbers.length + ' fields: ' + toks.join(' '));
  toks.forEach((tok, i) => {
    const x = field(v, fields.numbers[i]);
    assert.equal(typeof x, 'number', label + ': ' + fields.numbers[i] + ' is a number');
    assert.equal(tok, String(x), label + ': token ' + i + ' is ' + fields.numbers[i]);
  });
  return toks;
}

test('the verdict statement: every number it quotes is the verdict field it was read from and a number --bar printed', () => {
  const v = JSON.parse(fs.readFileSync(VERDICT, 'utf8'));
  assert.ok(v.statementFields && Array.isArray(v.statementFields.numbers) && Array.isArray(v.printed), 'the verdict carries statementFields and printed: re-run node tools/boundary-audit.mjs --bar');
  assert.equal(v.statement, statementOf(v).text, 'the stored statement is the one the verdict object builds');
  const toks = assertSourced(v, v.statement, v.statementFields, 'real');
  assert.ok(toks.length >= 30, 'the statement quotes the run: ' + toks.length + ' numbers');
  const said = new Set(v.printed.flatMap((l) => String(l).match(/(?<![\w.\-])\d+(?:\.\d+)?(?!\w)/g) || []));
  assert.deepEqual(toks.filter((t) => !said.has(t)), [], 'every quoted number is in a line the bar printed');
  assert.equal(v.cap, CAP_BYTES, 'the cap quoted is the constant the run enforces');
  assert.ok(v.printed.some((l) => l.includes(' ' + CAP_BYTES + ' bytes')), 'and the bar printed it');
  assert.ok(v.statement.includes(v.probe.measured + ' message records') && v.printed.some((l) => l.includes(v.probe.measured + ' message records')), 'the record count is measured and printed');
  if (!v.touched.length) assert.doesNotMatch(v.statement, /touched/i, 'touched is [], so the statement claims no touched test');
  for (const t of v.tests) if (!t.skipped) assert.ok(v.statement.includes(t.test + ' ' + t.pass + ' of ' + t.tests + ' pass'), t.test);
  assert.ok(v.statement.endsWith(v.barMet ? 'The bar is met.' : '.') && v.statement.includes(v.barMet ? 'The bar is met.' : 'The bar is not met: '), 'the statement says what barMet says');
  const a = auditStatement(v);
  assert.deepEqual([a.unsourced, a.unprinted, a.touchedClaim, a.ok], [[], [], false, true]);
});

test('a planted verdict with other counts gets a statement of its own numbers, and the audit catches a literal, a stale field and a touched claim', () => {
  const real = JSON.parse(fs.readFileSync(VERDICT, 'utf8'));
  assert.ok(real.statementFields && real.probe && real.summary.kinds, 're-run node tools/boundary-audit.mjs --bar');
  const p = copyOf(real);
  Object.assign(p, { cap: 65536, barMet: false, why: ['a boundary is missing from the allowlist'], touched: ['runtime/protocol.mjs'], drivers: real.drivers.slice(0, 3) });
  p.probe.measured = 4242;
  p.summary.static = real.summary.static + 7;
  p.summary.kinds.postMessage = real.summary.kinds.postMessage + 7;
  p.summary.messages = 5151;
  p.summary.before = null;
  p.summary.largest = null;
  p.allowlist.unlisted = ['a', 'b', 'c'];
  p.tests = [{ test: 'test/boundary.test.mjs', pass: 3, tests: 5, fail: 2 }, { test: 'test/runtime.test.mjs', skipped: 'free RAM' }];
  const st = statementOf(p);
  assertSourced(p, st.text, st, 'planted');
  for (const s of ['4242 message records', 'counted 5151 messages', 'The cap is 65536 copied bytes', 'ran 3 drivers', 'unlisted 3,', 'No before run was recorded', 'Touched files: runtime/protocol.mjs.', 'test/boundary.test.mjs 3 of 5 pass', 'test/runtime.test.mjs skipped (free RAM)', 'The bar is not met: a boundary is missing from the allowlist.']) assert.ok(st.text.includes(s), s);
  if (real.probe.measured !== 4242) assert.ok(!st.text.includes(real.probe.measured + ' message records'), 'no count carried over from the real run');
  const pa = auditStatement(p, st.text, st, real.printed);
  assert.deepEqual([pa.unsourced, pa.touchedClaim], [[], false]);
  assert.ok(pa.unprinted.includes('4242') && pa.unprinted.includes('65536'), 'numbers the bar never printed are unprinted: ' + pa.unprinted.join(' '));
  // controls, each a defect board 23 shipped: a literal count, a field changed after the statement was built, a touched claim with touched []
  const lit = auditStatement(real, real.statement + ' It wrote 1318 message records.');
  assert.ok(lit.unsourced.includes('1318 (no field)'), lit.unsourced.join('; '));
  assert.equal(lit.ok, false);
  const stale = copyOf(real);
  stale.probe.measured += 1;
  const sa = auditStatement(stale);
  assert.ok(sa.unsourced.some((u) => u.includes('probe.measured')), sa.unsourced.join('; '));
  const tc = copyOf(real);
  tc.touched = [];
  const ta = auditStatement(tc, tc.statement.replace('Tests re-run by the bar:', 'Touched tests:'));
  assert.equal(ta.touchedClaim, true);
  assert.equal(ta.ok, false);
  assert.equal(auditStatement(tc).touchedClaim, false, 'the bar statement itself makes no touched claim');
});

// board 26 boundary-statement fix pass: a builder edited bench/imagine.mjs while the bar ran, the scan and
// the probe read different lines, and the bar printed 2 orphan sites with no word of why (board 23 hit the
// same race on generations/plateau.mjs). The bar now hashes the tree at the static scan and after the probe.
import { stillTreeOf, BAR_COMMAND } from '../tools/boundary-audit.mjs';

test('the still tree: a file edited, added or removed between two scans is moved, an untouched or only re-stamped one is not, and only a moved file holding a boundary is the join race', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-still-'));
  try {
    const w = (f, s) => fs.writeFileSync(path.join(dir, f), s);
    w('a.mjs', "import { parentPort } from 'node:worker_threads';\nparentPort." + PM + "({ n: 1 });\n");
    w('b.mjs', 'export const b = 1;\n');
    w('c.mjs', "import { parentPort } from 'node:worker_threads';\nparentPort." + PM + "({ c: 1 });\n");
    w('e.mjs', "import { parentPort } from 'node:worker_threads';\nparentPort." + PM + "({ e: 1 });\n");
    const f0 = new Map(), s0 = scanTree(dir, { fingerprint: f0 });
    // control: a second scan of the same tree, and an mtime moved with the text unchanged, move nothing
    const past = new Date(Date.now() - 3600e3);
    fs.utimesSync(path.join(dir, 'c.mjs'), past, past);
    const fc = new Map(), sc = scanTree(dir, { fingerprint: fc });
    assert.deepEqual(stillTreeOf(f0, fc, s0, sc, []), { files: 4, moved: [], boundaryMoved: [], orphansInMoved: 0 });
    // the race: a line inserted above a.mjs's boundary, b.mjs edited, d.mjs added, e.mjs removed
    w('a.mjs', "import { parentPort } from 'node:worker_threads';\nconst pad = 0;\nparentPort." + PM + "({ n: 1 });\n");
    w('b.mjs', 'export const b = 2;\n');
    w('d.mjs', 'export const d = 1;\n');
    fs.rmSync(path.join(dir, 'e.mjs'));
    const f1 = new Map(), s1 = scanTree(dir, { fingerprint: f1 });
    const lineOfA = (s) => s.find((b) => b.file === 'a.mjs').line;
    assert.deepEqual([lineOfA(s0), lineOfA(s1)], [2, 3], 'the edit moved the scanned line: the join the probe relies on');
    const orphans = [{ site: 'postMessage a.mjs:3' }, { site: 'postMessage c.mjs:2' }, { site: 'send ?' }];
    const st = stillTreeOf(f0, f1, s0, s1, orphans);
    assert.deepEqual(st, { files: 4, moved: ['a.mjs', 'b.mjs', 'd.mjs', 'e.mjs'], boundaryMoved: ['a.mjs', 'e.mjs'], orphansInMoved: 1 });
    // control: the same edits to files that hold no boundary are moved but not the race
    const quiet = stillTreeOf(f0, f1, s0.filter((b) => b.file === 'c.mjs'), s1.filter((b) => b.file === 'c.mjs'), orphans);
    assert.deepEqual([quiet.moved.length, quiet.boundaryMoved], [4, []]);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('the verdict command is the command the bar runs: --bar under tools/budget.mjs with the board budget, and the verdict records the still tree it printed', () => {
  assert.equal(BAR_COMMAND, BAR_COMMAND.trim().replace(/\s+/g, ' '), 'one space between words');
  const tok = BAR_COMMAND.split(' ');
  const sep = tok.indexOf('--');
  assert.ok(sep > 0, 'a budget wrapper, then the command');
  const [wrap, cmd] = [tok.slice(0, sep), tok.slice(sep + 1)];
  const opt = (f) => { const i = wrap.indexOf(f); return i >= 0 ? wrap[i + 1] : undefined; };
  assert.deepEqual(wrap.slice(0, 2), ['node', 'tools/budget.mjs']);
  const ram = Number(opt('--ram-mb'));
  assert.ok(ram > 0 && ram <= 4000, 'RAM cap at most 4000 MB: ' + opt('--ram-mb'));
  assert.ok(Number(opt('--disk-mb')) > 0 && opt('--dir') === 'state/boundary', 'a disk cap on the dir the probe writes');
  assert.ok(Number(opt('--wait-free-ram-mb')) >= 8000, 'waits for at least 8000 MB free');
  const heap = /^--max-old-space-size=(\d+)$/.exec(cmd[1] || '');
  assert.ok(cmd[0] === 'node' && heap && Number(heap[1]) <= ram, 'a heap no larger than the RAM cap: ' + cmd.join(' '));
  assert.deepEqual(cmd.slice(2), ['tools/boundary-audit.mjs', '--bar']);
  const v = JSON.parse(fs.readFileSync(VERDICT, 'utf8'));
  assert.equal(v.command, BAR_COMMAND, 're-run node tools/boundary-audit.mjs --bar through BAR_COMMAND');
  const s = v.stillTree;
  assert.ok(s && Number.isInteger(s.files) && s.files > 0 && Array.isArray(s.moved) && Array.isArray(s.boundaryMoved) && Number.isInteger(s.orphansInMoved), 'the verdict carries the still tree');
  assert.ok(s.boundaryMoved.every((f) => s.moved.includes(f)) && s.orphansInMoved <= s.moved.length * 1e6);
  const line = v.printed.find((l) => l.startsWith('still tree: '));
  assert.ok(line && line.includes(s.files + ' source files') && line.includes('changed ' + s.moved.length) && line.includes('holding a boundary ' + s.boundaryMoved.length) && line.endsWith('orphan sites in them ' + s.orphansInMoved), 'printed: ' + line);
  const race = 'a file holding a boundary changed while the bar ran, so its scanned lines and the probe lines may not join';
  assert.equal(v.why.includes(race), s.boundaryMoved.length > 0, 'why names the race exactly when a boundary file moved');
  if (s.boundaryMoved.length) assert.equal(v.barMet, false);
  assert.ok(v.statement.includes(s.files + ' source files, ' + s.moved.length + ' changed while the bar ran, ' + s.boundaryMoved.length + ' of them holding a boundary'), 'the statement quotes it');
  // a planted verdict whose tree moved: its statement says so from its own fields
  const p = copyOf(v);
  p.stillTree = { files: 9, moved: ['x.mjs', 'y.mjs'], boundaryMoved: ['x.mjs'], orphansInMoved: 3 };
  assert.ok(statementOf(p).text.includes('9 source files, 2 changed while the bar ran, 1 of them holding a boundary, with 3 orphan sites in them.'));
});
