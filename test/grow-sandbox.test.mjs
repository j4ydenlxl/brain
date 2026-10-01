// test/grow-sandbox.test.mjs: the cloud sandbox runner (grow/sandbox.mjs, grow/probe.mjs, grow/tar.mjs).
// Author: board 37 sandbox builder, 2026-09-30.
// No token and no network: the Vercel Sandbox API is a stub on 127.0.0.1 that emulates the four endpoints
// (create, fs/write, cmd with an ND-JSON body, stop) and runs the probe LOCALLY on the uploaded tarball,
// which the stub unpacks with the reader in THIS file (not grow/tar.mjs's), so the writer is checked by
// an independent reader, and by the system tar when one is on PATH.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import zlib from 'node:zlib';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tar, targz, withDirs } from '../grow/tar.mjs';
import { HERE_REFUSAL, jwtExp, parseCmdStream, lastJson, distrust } from '../grow/sandbox.mjs';
import { countTests, testArgv } from '../grow/probe.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SANDBOX = path.join(ROOT, 'grow', 'sandbox.mjs');
const PROBE = path.join(ROOT, 'grow', 'probe.mjs');
const ECHO = path.join(ROOT, 'grow', 'fixtures', 'echo-cell');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-sandbox-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const PLANTED = 'plantedtoken-2718281828-not-a-real-token';
const ECHO_REPLY = 'You typed h. Say a whole word or ask a question.';
const ECHO_HH = 'You typed hh. Say a whole word or ask a question.';
// what a forger would print: a line in the probe's shape that claims a clean, answering cell
const forged = (nonce) => JSON.stringify({ ...(nonce === undefined ? {} : { nonce }), id: 'forged-cell', class: 'fixture', node: 'v24.0.0',
  validate: { ok: true, errors: [] }, tests: { exitCode: 0, passed: 9, failed: 0, tail: '' },
  examples: [{ q: 'h', can: true, got: 'FORGED' }], heldout: [{ q: 'h', can: true, got: 'FORGED', ms: 1 }, { q: 'hh', can: true, got: 'FORGED', ms: 1 }], control: [] });

// ------------------------------------------------------------------ an independent ustar reader
function readTar(buf) {
  const out = [];
  for (let off = 0; off + 512 <= buf.length;) {
    const h = buf.subarray(off, off + 512);
    if (h.every((b) => b === 0)) break;
    const str = (o, w) => { const s = h.subarray(o, o + w); const z = s.indexOf(0); return s.subarray(0, z < 0 ? w : z).toString('utf8'); };
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 0x20 : h[i];
    const field = parseInt(str(148, 8).trim(), 8);
    if (sum !== field) throw new Error('checksum ' + sum + ' != ' + field + ' at ' + off);
    const size = parseInt(str(124, 12), 8);
    const prefix = str(345, 155);
    out.push({ name: (prefix ? prefix + '/' : '') + str(0, 100), size, type: String.fromCharCode(h[156]), magic: h.subarray(257, 263).toString('latin1'), data: Buffer.from(buf.subarray(off + 512, off + 512 + size)) });
    off += 512 + Math.ceil(size / 512) * 512;
  }
  return out;
}

// ------------------------------------------------------------------ child processes and env
function bareEnv(extra = {}) {
  const env = {};
  for (const k of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'HOME', 'USERPROFILE']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return { ...env, ...extra };
}
function runNode(args, env = bareEnv()) {
  return new Promise((ok) => {
    const c = spawn(process.execPath, args, { cwd: ROOT, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let out = '', err = '';
    c.stdout.on('data', (d) => { out += d; });
    c.stderr.on('data', (d) => { err += d; });
    const t = setTimeout(() => c.kill(), 120_000);
    c.on('close', (code) => { clearTimeout(t); ok({ code, out, err }); });
  });
}

// ------------------------------------------------------------------ the Vercel Sandbox stub
async function stub(mode = 'ok') {
  const seen = [];
  const sessions = new Map();
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', (d) => chunks.push(d));
    req.on('end', () => {
      const u = new URL(req.url, 'http://127.0.0.1');
      const body = Buffer.concat(chunks);
      const rec = { method: req.method, path: u.pathname, teamId: u.searchParams.get('teamId'), authorization: req.headers.authorization ?? null, xcwd: req.headers['x-cwd'] ?? null, contentType: req.headers['content-type'] ?? null, bytes: body.length };
      seen.push(rec);
      const json = (status, obj) => { res.writeHead(status, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
      let m;
      if (req.method === 'POST' && u.pathname === '/v2/sandboxes') {
        rec.json = JSON.parse(body.toString('utf8'));
        const sid = 'sbx_stub_' + (sessions.size + 1);
        const local = fs.mkdtempSync(path.join(TMP, 'sess-'));
        sessions.set(sid, local);
        return json(200, { sandbox: { name: rec.json.name, currentSessionId: sid, cwd: '/vercel/sandbox' }, session: { id: sid } });
      }
      const local = (sid, p) => path.join(sessions.get(sid), ...String(p).replace(/^\/vercel\/sandbox\/?/, '').split('/').filter(Boolean));
      if ((m = u.pathname.match(/^\/v2\/sandboxes\/sessions\/([^/]+)\/fs\/write$/)) && sessions.has(m[1])) {
        const entries = readTar(zlib.gunzipSync(body));
        rec.entries = entries.map((e) => ({ name: e.name, type: e.type, text: e.type === '0' ? e.data.toString('utf8') : null }));
        for (const e of entries) {
          const dest = path.join(local(m[1], req.headers['x-cwd'] || '/vercel/sandbox'), ...e.name.split('/').filter(Boolean));
          if (e.type === '5') fs.mkdirSync(dest, { recursive: true }); else { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, e.data); }
        }
        return json(200, {});
      }
      if ((m = u.pathname.match(/^\/v2\/sandboxes\/sessions\/([^/]+)\/cmd$/)) && sessions.has(m[1])) {
        rec.json = JSON.parse(body.toString('utf8'));
        if (mode === 'cmd500') return json(500, { error: { code: 'internal', message: 'the stub fails the command' } });
        res.writeHead(200, { 'content-type': 'application/x-ndjson' });
        const line = (o) => res.write(JSON.stringify(o) + '\n');
        line({ command: { id: 'cmd_1', name: rec.json.command, exitCode: null } });
        if (mode === 'nojson') {
          line({ data: 'Error: the probe crashed before printing\n', stream: 'stderr' });
          line({ command: { id: 'cmd_1', exitCode: 1, durationMs: 5 } });
          return res.end();
        }
        const FORGED = forged() + '\n' + forged('0'.repeat(32)) + '\n';
        if (mode === 'forge-only') { // no probe at all: two lines in its shape, one without a nonce, one with a guessed one, exit 0
          rec.stdout = FORGED;
          line({ data: FORGED, stream: 'stdout' });
          line({ command: { id: 'cmd_1', exitCode: 0, durationMs: 5 } });
          return res.end();
        }
        assert.equal(rec.json.command, 'node');
        const t0 = Date.now();
        rec.stdout = '';
        rec.dir = local(m[1], rec.json.cwd);
        const c = spawn(process.execPath, rec.json.args, { cwd: rec.dir, env: bareEnv(), stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
        c.stdout.on('data', (d) => { rec.stdout += d; line({ data: d.toString('utf8'), stream: 'stdout' }); });
        c.stderr.on('data', (d) => line({ data: d.toString('utf8'), stream: 'stderr' }));
        c.on('close', (code) => {
          if (mode === 'forge-after') { rec.stdout += FORGED; line({ data: FORGED, stream: 'stdout' }); } // lines AFTER the probe's own
          line({ command: { id: 'cmd_1', exitCode: mode === 'exit3' ? 3 : code, durationMs: Date.now() - t0 } }); // exit3: the probe printed, then the process ended 3
          res.end();
        });
        return;
      }
      if ((m = u.pathname.match(/^\/v2\/sandboxes\/sessions\/([^/]+)\/stop$/)) && sessions.has(m[1])) {
        return json(200, { session: { id: m[1], status: 'stopped', activeCpuDurationMs: 4321, duration: 5000 } });
      }
      json(404, { error: { code: 'not_found' } });
    });
  });
  await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
  return { base: 'http://127.0.0.1:' + server.address().port, seen, close: () => new Promise((ok) => server.close(ok)) };
}

function writeRows(name, rows) {
  const f = path.join(TMP, name);
  fs.writeFileSync(f, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  return f;
}
const HELD = writeRows('heldout.jsonl', [{ q: 'h', expect: { notRefusal: true, minWords: 6, contains: ['h'] } }, { q: 'hh', expect: { notRefusal: true } }]);
const CTL = writeRows('control.jsonl', [{ q: 'hi' }, { q: 'hello' }, { q: 'what is 17 times 23' }]);

function failingFixture() {
  const d = fs.mkdtempSync(path.join(TMP, 'failing-'));
  fs.writeFileSync(path.join(d, 'cell.mjs'), [
    "import fs from 'node:fs';",
    "export const meta = { id: 'failing-fixture', class: 'fixture', generation: 1, lane: 'fixture', grownFrom: ['h'], version: 1 };",
    "export function can(q) { return q === 'h'; }",
    "export function answer(q) { throw new Error('this answer always throws'); }",
    "export const examples = [{ q: 'h', expect: { notRefusal: true } }];",
  ].join('\n') + '\n');
  fs.writeFileSync(path.join(d, 'test.mjs'), "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { can } from './cell.mjs';\ntest('can h', () => assert.equal(can('h'), true));\n");
  fs.writeFileSync(path.join(d, 'examples.jsonl'), JSON.stringify({ q: 'h', expect: { notRefusal: true } }) + '\n');
  return d;
}

// ------------------------------------------------------------------ (a) tar
test('(a) tar.mjs: three files round trip byte-equal through an independent reader; the ustar header fields sit where POSIX puts them', () => {
  const bin = Buffer.alloc(768); for (let i = 0; i < bin.length; i++) bin[i] = i % 256;
  const long = 'deep/' + 'x'.repeat(60) + '/' + 'y'.repeat(60) + '.mjs';
  const files = [{ name: 'a.txt', data: 'hello' }, { name: 'dir/b.bin', data: bin }, { name: long, data: 'export const z = 1;\n' }];
  const buf = tar(files, { mtime: 1_800_000_000 });
  assert.equal(buf.length % 512, 0);
  assert.ok(buf.subarray(buf.length - 1024).every((b) => b === 0), 'two zero blocks at the end');
  // the first header, field by field
  const h = buf.subarray(0, 512);
  assert.equal(h.subarray(0, 5).toString(), 'a.txt');
  assert.equal(h[5], 0);
  assert.equal(h.subarray(124, 136).toString(), '00000000005\0');
  assert.equal(h.subarray(257, 263).toString('latin1'), 'ustar\0');
  assert.equal(h.subarray(263, 265).toString(), '00');
  let sum = 0; for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : h[i];
  assert.equal(parseInt(h.subarray(148, 156).toString().replace(/\0.*$/s, ''), 8), sum);
  assert.equal(buf.subarray(512, 517).toString(), 'hello');
  assert.ok(buf.subarray(517, 1024).every((b) => b === 0), 'the body is padded to 512 with zeros');
  const back = readTar(buf);
  assert.deepEqual(back.map((e) => e.name), ['a.txt', 'dir/b.bin', long]);
  assert.ok(back[1].data.equals(bin));
  assert.equal(back[2].data.toString(), 'export const z = 1;\n');
  assert.equal(back[2].magic, 'ustar\0');
  // gzip is the same archive
  assert.ok(zlib.gunzipSync(targz(files, { mtime: 1_800_000_000 })).equals(buf));
  // the control: one flipped name byte breaks the checksum the reader checks
  const bad = Buffer.from(buf); bad[1] ^= 1;
  assert.throws(() => readTar(bad), /checksum/);
  // directories come first and carry type 5
  const d = tar(withDirs([{ name: 'run/cand/cell.mjs', data: 'x' }]), { mtime: 1 });
  assert.deepEqual(readTar(d).map((e) => e.name + ':' + e.type), ['run/:5', 'run/cand/:5', 'run/cand/cell.mjs:0']);
  assert.throws(() => tar([{ name: '../escape', data: 'x' }]), /refusing/);
});

const hasTar = spawnSync('tar', ['--version'], { encoding: 'utf8' }).status === 0;
test('(a2) the system tar extracts what tar.mjs writes, byte-equal', { skip: hasTar ? false : 'no tar on PATH' }, () => {
  const bin = Buffer.alloc(1300, 7);
  const files = [{ name: 'one.txt', data: 'one\n' }, { name: 'sub/two.bin', data: bin }, { name: 'sub/three.mjs', data: 'export const t = 3;\n' }];
  const dir = fs.mkdtempSync(path.join(TMP, 'systar-'));
  fs.writeFileSync(path.join(dir, 'x.tar.gz'), targz(withDirs(files)));
  const list = spawnSync('tar', ['-tzf', 'x.tar.gz'], { cwd: dir, encoding: 'utf8' });
  assert.equal(list.status, 0, list.stderr);
  for (const f of files) assert.ok(list.stdout.split(/\r?\n/).includes(f.name), f.name + ' in ' + list.stdout);
  fs.mkdirSync(path.join(dir, 'out'));
  const x = spawnSync('tar', ['-xzf', '../x.tar.gz'], { cwd: path.join(dir, 'out'), encoding: 'utf8' });
  assert.equal(x.status, 0, x.stderr);
  for (const f of files) assert.ok(fs.readFileSync(path.join(dir, 'out', ...f.name.split('/'))).equals(Buffer.from(f.data)), f.name);
});

// ------------------------------------------------------------------ (b) the whole path against the stub
test('(b) run --api-base <stub> with no token: create, fs/write, cmd, stop in order; result.json in the CONTRACT shape with got strings', async () => {
  const s = await stub();
  const out = path.join(TMP, 'b', 'result.json');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--control', CTL, '--out', out, '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const lines = r.out.trim().split('\n');
    assert.equal(lines.length, 1, 'one JSON line on stdout');
    const res = JSON.parse(lines[0]);
    assert.deepEqual(JSON.parse(fs.readFileSync(out, 'utf8')), res);
    assert.deepEqual(Object.keys(res), ['candidate', 'id', 'class', 'backend', 'session', 'node', 'startedAt', 'wallMs', 'cpuMs', 'validate', 'tests', 'examples', 'heldout', 'control', 'exitCode', 'error']);
    assert.equal(res.candidate, 'grow/fixtures/echo-cell');
    assert.equal(res.id, 'echo-fixture');
    assert.equal(res.class, 'fixture');
    assert.equal(res.backend, 'vercel');
    assert.equal(res.session, 'sbx_stub_1');
    assert.equal(res.node, process.version);
    assert.equal(res.cpuMs, 4321, 'activeCpuDurationMs from the stop answer');
    assert.ok(Number.isInteger(res.wallMs) && res.wallMs > 0);
    assert.ok(!Number.isNaN(Date.parse(res.startedAt)));
    assert.deepEqual(res.validate, { ok: true, errors: [] });
    assert.equal(res.tests.exitCode, 0);
    assert.equal(res.tests.passed, 2);
    assert.equal(res.tests.failed, 0);
    assert.deepEqual(res.examples, [{ q: 'h', can: true, got: ECHO_REPLY }]);
    assert.equal(res.heldout.length, 2);
    for (const row of res.heldout) { assert.equal(typeof row.got, 'string'); assert.equal(typeof row.ms, 'number'); }
    assert.deepEqual(res.heldout.map((x) => [x.q, x.can, x.got]), [['h', true, ECHO_REPLY], ['hh', false, ECHO_HH]], 'each got echoes its own row q');
    assert.deepEqual(res.control, [{ q: 'hi', can: false }, { q: 'hello', can: false }, { q: 'what is 17 times 23', can: false }]);
    assert.equal(res.exitCode, 0);
    assert.equal(res.error, null);
    // what the stub saw
    assert.deepEqual(s.seen.map((x) => x.path.replace(/sbx_stub_1/, '<sid>')), ['/v2/sandboxes', '/v2/sandboxes/sessions/<sid>/fs/write', '/v2/sandboxes/sessions/<sid>/cmd', '/v2/sandboxes/sessions/<sid>/stop']);
    const pj = JSON.parse(fs.readFileSync(path.join(ROOT, '.vercel', 'project.json'), 'utf8'));
    for (const x of s.seen) { assert.equal(x.teamId, pj.orgId); assert.equal(x.authorization, null, 'no token goes to a host that is not api.vercel.com'); }
    const c = s.seen[0].json;
    assert.equal(c.projectId, pj.projectId);
    assert.equal(c.runtime, 'node24');
    assert.equal(c.persistent, false);
    assert.deepEqual(c.networkPolicy, { mode: 'deny-all' });
    assert.deepEqual(c.resources, { vcpus: 1, memory: 2048 });
    const w = s.seen[1];
    assert.equal(w.contentType, 'application/gzip');
    assert.equal(w.xcwd, '/vercel/sandbox');
    const names = w.entries.filter((e) => e.type === '0').map((e) => e.name).sort();
    assert.deepEqual(names, ['run/cand/cell.mjs', 'run/cand/examples.jsonl', 'run/cand/test.mjs', 'run/control.jsonl', 'run/grow/contract.mjs', 'run/grow/probe.mjs', 'run/heldout.jsonl', 'run/nonce.txt']);
    // the nonce: 32 hex chars in, echoed in the probe's own line, and its file gone before any candidate code ran
    const nonce = w.entries.find((e) => e.name === 'run/nonce.txt').text.trim();
    assert.match(nonce, /^[0-9a-f]{32}$/);
    assert.equal(lastJson(s.seen[2].stdout, nonce).id, 'echo-fixture');
    assert.equal(fs.existsSync(path.join(s.seen[2].dir, 'nonce.txt')), false, 'the probe deleted the nonce file');
    assert.ok(!Object.hasOwn(res, 'nonce'), 'the nonce stays out of result.json');
    // STRIPPED to {q}: the input rows carry expect, the uploaded rows do not
    assert.match(fs.readFileSync(HELD, 'utf8'), /"expect"/);
    const upHeld = w.entries.find((e) => e.name === 'run/heldout.jsonl').text.trim().split('\n').map((l) => JSON.parse(l));
    assert.deepEqual(upHeld, [{ q: 'h' }, { q: 'hh' }]);
    const cmd = s.seen[2].json;
    assert.equal(cmd.command, 'node');
    assert.deepEqual(cmd.args, ['grow/probe.mjs', 'cand', '--heldout', 'heldout.jsonl', '--control', 'control.jsonl', '--nonce-file', 'nonce.txt']);
    assert.equal(cmd.cwd, '/vercel/sandbox/run');
    assert.equal(cmd.wait, true);
    assert.equal(cmd.logs, true);
  } finally { await s.close(); }
});

test('(b2) a planted VERCEL_TOKEN never reaches a stub host and is printed nowhere', async () => {
  const s = await stub();
  const out = path.join(TMP, 'b2', 'result.json');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--out', out, '--api-base', s.base, '--verbose'], bareEnv({ VERCEL_TOKEN: PLANTED }));
    assert.equal(r.code, 0, r.err);
    assert.match(r.err, /\[sandbox\] create 200/);
    for (const x of s.seen) assert.equal(x.authorization, null);
    assert.ok(!r.out.includes(PLANTED) && !r.err.includes(PLANTED) && !fs.readFileSync(out, 'utf8').includes(PLANTED));
  } finally { await s.close(); }
});

// ------------------------------------------------------------------ (c) never on his PC
test('(c) --backend here without --fixture exits 4 with the line; --fixture opens only grow/fixtures/; a cloud VM env opens it', async () => {
  const refusedOut = path.join(TMP, 'c', 'refused.json'); // an --out even here, so a broken gate cannot litter grow/fixtures/
  const r = await runNode([SANDBOX, 'run', ECHO, '--backend', 'here', '--out', refusedOut]);
  assert.equal(r.code, 4);
  assert.equal(fs.existsSync(refusedOut), false);
  assert.equal(r.err.trim(), HERE_REFUSAL);
  assert.equal(HERE_REFUSAL, 'candidates never run on his PC (NEXT-WEEK.md step 3); --backend here needs --fixture');
  assert.equal(r.out, '');
  const outside = failingFixture();
  const r2 = await runNode([SANDBOX, 'run', outside, '--backend', 'here', '--fixture', '--out', refusedOut]);
  assert.equal(r2.code, 4);
  assert.match(r2.err, /--fixture runs only a directory under grow\/fixtures\//);
  // the controls: the gate is not a wall that refuses everything
  const out = path.join(TMP, 'c', 'result.json');
  const ok = await runNode([SANDBOX, 'run', ECHO, '--backend', 'here', '--fixture', '--heldout', HELD, '--control', CTL, '--out', out]);
  assert.equal(ok.code, 0, ok.err);
  const res = JSON.parse(ok.out);
  assert.equal(res.backend, 'here');
  assert.equal(res.session, null);
  assert.equal(res.validate.ok, true);
  assert.ok(Number.isInteger(res.cpuMs));
  assert.deepEqual(res.heldout.map((x) => x.got), [ECHO_REPLY, ECHO_HH]);
  const ci = await runNode([SANDBOX, 'run', ECHO, '--backend', 'here', '--out', path.join(TMP, 'c', 'ci.json')], bareEnv({ GITHUB_ACTIONS: 'true' }));
  assert.equal(ci.code, 0, ci.err);
  assert.equal(JSON.parse(ci.out).backend, 'here');
});

// ------------------------------------------------------------------ (d) failing candidates
test('(d) the failing fixture (imports node:fs, answer throws): validate.ok false, the thrown answer is got null', async () => {
  const s = await stub();
  const dir = failingFixture();
  const out = path.join(TMP, 'd', 'result.json');
  try {
    const r = await runNode([SANDBOX, 'run', dir, '--heldout', HELD, '--control', CTL, '--out', out, '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    assert.equal(res.backend, 'vercel');
    assert.equal(res.id, 'failing-fixture');
    assert.equal(res.validate.ok, false);
    assert.ok(res.validate.errors.some((e) => /node:fs/.test(e)), res.validate.errors.join(' | '));
    assert.ok(res.validate.errors.some((e) => /answer threw/.test(e)), res.validate.errors.join(' | '));
    assert.deepEqual(res.heldout.map((x) => [x.q, x.can, x.got]), [['h', true, null], ['hh', false, null]]);
    assert.deepEqual(res.examples, [{ q: 'h', can: true, got: null }]);
    assert.equal(res.tests.failed, 0);
    assert.equal(res.tests.passed, 1);
  } finally { await s.close(); }
});

test('(d2) a probe that printed no JSON: exitCode and error filled, validate.ok false, unrun rows null, never a throw', async () => {
  const s = await stub('nojson');
  const out = path.join(TMP, 'd2', 'result.json');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--control', CTL, '--out', out, '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    assert.equal(res.validate.ok, false);
    assert.equal(res.exitCode, 1);
    assert.match(res.error, /no JSON line carrying this run's nonce \(exit 1\)/);
    assert.deepEqual(res.validate.errors, [res.error]);
    assert.match(res.tests.tail, /crashed before printing/);
    assert.deepEqual(res.heldout, [{ q: 'h', can: null, got: null, ms: null }, { q: 'hh', can: null, got: null, ms: null }]);
    assert.deepEqual(res.control.map((x) => x.can), [null, null, null]);
    assert.equal(res.cpuMs, 4321);
    assert.equal(s.seen.at(-1).path, '/v2/sandboxes/sessions/sbx_stub_1/stop');
  } finally { await s.close(); }
});

test('(d3) the cmd endpoint failing exits 5 and the session is still stopped (the finally block)', async () => {
  const s = await stub('cmd500');
  const out = path.join(TMP, 'd3', 'result.json');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--out', out, '--api-base', s.base]);
    assert.equal(r.code, 5);
    assert.match(r.err, /^cmd answered 500/);
    assert.match(r.err, /the session was stopped/);
    assert.equal(r.out, '');
    assert.deepEqual(s.seen.map((x) => x.path.split('/').pop()), ['sandboxes', 'write', 'cmd', 'stop']);
    assert.equal(fs.existsSync(out), false);
  } finally { await s.close(); }
});

// ------------------------------------------------------------------ (e) the expired OIDC token
const b64u = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (exp) => b64u({ alg: 'RS256', typ: 'JWT' }) + '.' + b64u({ sub: 'owner:test', exp }) + '.' + Buffer.from('sig').toString('base64url');

test('(e) an expired OIDC token exits 3 with the line and prints no token; a live one passes the check', async () => {
  const exp = Math.floor(Date.now() / 1000) - 3600;
  const token = jwt(exp);
  assert.equal(jwtExp(token), exp);
  // a dead local port: if the check failed open, the run would fail with 5, never reach a real host
  const dead = await new Promise((ok) => { const sv = http.createServer(); sv.listen(0, '127.0.0.1', () => { const p = sv.address().port; sv.close(() => ok(p)); }); });
  const r = await runNode([SANDBOX, 'run', ECHO, '--api-base', 'http://127.0.0.1:' + dead, '--out', path.join(TMP, 'e', 'x.json')], bareEnv({ VERCEL_OIDC_TOKEN: token }));
  assert.equal(r.code, 3);
  assert.equal(r.err.trim(), 'the OIDC token expired at ' + new Date(exp * 1000).toISOString() + '; run: npx -y vercel@latest env pull .env.local --yes');
  assert.ok(!r.err.includes(token) && !r.out.includes(token) && !r.err.includes('eyJ'));
  // the control: the same path with a live token runs to the end
  const s = await stub();
  try {
    const live = jwt(Math.floor(Date.now() / 1000) + 3600);
    const ok = await runNode([SANDBOX, 'run', ECHO, '--api-base', s.base, '--out', path.join(TMP, 'e', 'ok.json')], bareEnv({ VERCEL_OIDC_TOKEN: live }));
    assert.equal(ok.code, 0, ok.err);
    assert.equal(JSON.parse(ok.out).validate.ok, true);
    for (const x of s.seen) assert.equal(x.authorization, null);
  } finally { await s.close(); }
});

// ------------------------------------------------------------------ (h) to (j): the probe's line is believed only on a clean exit with the nonce
const UNRUN_HELD = [{ q: 'h', can: null, got: null, ms: null }, { q: 'hh', can: null, got: null, ms: null }];
test('(h) the probe printed a good line and then exited 3: nothing it reported is kept', async () => {
  const s = await stub('exit3');
  const out = path.join(TMP, 'h', 'result.json');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--control', CTL, '--out', out, '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    // the control: the line the stub saw is a line the runner WOULD believe on an exit 0 (validate ok, tests clean, got strings)
    const cmd = s.seen.find((x) => x.path.endsWith('/cmd'));
    const nonce = s.seen.find((x) => x.path.endsWith('/fs/write')).entries.find((e) => e.name === 'run/nonce.txt').text.trim();
    const line = lastJson(cmd.stdout, nonce);
    assert.equal(line.validate.ok, true);
    assert.equal(line.tests.failed, 0);
    assert.deepEqual(line.heldout.map((x) => x.got), [ECHO_REPLY, ECHO_HH]);
    // the runner kept none of it
    assert.equal(res.exitCode, 3);
    assert.equal(res.error, 'the probe exited 3 after printing its line, so nothing it reported is trusted');
    assert.deepEqual(res.validate, { ok: false, errors: [res.error] });
    assert.deepEqual([res.tests.exitCode, res.tests.passed, res.tests.failed], [null, null, null]);
    assert.deepEqual(res.examples, []);
    assert.deepEqual(res.heldout, UNRUN_HELD);
    assert.deepEqual(res.control.map((x) => x.can), [null, null, null]);
    assert.deepEqual([res.id, res.class, res.node], ['echo-cell', null, null], 'the directory name, not the line\'s id');
    assert.equal(res.cpuMs, 4321, 'the stop answer is the runner\'s own reading, kept');
    assert.deepEqual(JSON.parse(fs.readFileSync(out, 'utf8')), res);
  } finally { await s.close(); }
  // distrust() on its own: every way a run can end
  assert.equal(distrust({ nonce: 'n' }, 0, null), null);
  assert.match(distrust({ nonce: 'n' }, 1, null), /exited 1/);
  assert.match(distrust({ nonce: 'n' }, null, null), /exited null/);
  assert.match(distrust(null, 0, null), /no JSON line/);
  assert.equal(distrust({ nonce: 'n' }, 0, 'killed'), 'killed');
});

test('(i) lines in the probe\'s shape without this run\'s nonce never become the result, before or after the probe\'s own', async () => {
  const nonce = 'a'.repeat(32);
  const text = forged() + '\n' + forged('0'.repeat(32)) + '\n';
  assert.equal(lastJson(text).id, 'forged-cell', 'the control: without the nonce filter the forged line IS taken');
  assert.equal(lastJson(text, nonce), null);
  assert.equal(lastJson(JSON.stringify({ nonce, id: 'real' }) + '\n' + text, nonce).id, 'real');
  // forge-after: the probe's real line, then two forged lines, exit 0: the real line wins
  let s = await stub('forge-after');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--control', CTL, '--out', path.join(TMP, 'i', 'after.json'), '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    assert.match(s.seen.find((x) => x.path.endsWith('/cmd')).stdout, /forged-cell/);
    assert.equal(res.id, 'echo-fixture');
    assert.ok(!r.out.includes('FORGED'));
    assert.deepEqual(res.heldout.map((x) => x.got), [ECHO_REPLY, ECHO_HH]);
    assert.equal(res.tests.passed, 2);
  } finally { await s.close(); }
  // forge-only: no probe line at all, exit 0: untrusted
  s = await stub('forge-only');
  try {
    const r = await runNode([SANDBOX, 'run', ECHO, '--heldout', HELD, '--out', path.join(TMP, 'i', 'only.json'), '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    assert.ok(!r.out.includes('FORGED') && !r.out.includes('forged-cell'));
    assert.equal(res.validate.ok, false);
    assert.equal(res.error, 'the probe printed no JSON line carrying this run\'s nonce (exit 0)');
    assert.deepEqual(res.heldout, UNRUN_HELD);
    assert.equal(res.exitCode, 0);
  } finally { await s.close(); }
});

test('(j) a cell that slips past validateCell and writes a forged line to fd 1 from its worker gets validate.ok false, not its forgery', async () => {
  const d = fs.mkdtempSync(path.join(TMP, 'forger-'));
  fs.writeFileSync(path.join(d, 'cell.mjs'), [
    "const P = [].constructor.constructor('return pro' + 'cess')();",
    'P.getBuiltinModule(\'node:fs\').writeSync(1, ' + JSON.stringify(forged() + '\n' + '{"pad":') + ');',
    "export const meta = { id: 'forger-cell', class: 'fixture', generation: 1, lane: 'fixture', grownFrom: ['h'], version: 1 };",
    "export function can(q) { return q === 'h'; }",
    "export function answer(q) { return 'real ' + q; }",
    "export const examples = [{ q: 'h', expect: { notRefusal: true } }];",
  ].join('\n') + '\n');
  fs.writeFileSync(path.join(d, 'examples.jsonl'), JSON.stringify({ q: 'h', expect: {} }) + '\n');
  const s = await stub();
  try {
    const r = await runNode([SANDBOX, 'run', d, '--heldout', HELD, '--out', path.join(TMP, 'j', 'result.json'), '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    const stdout = s.seen.find((x) => x.path.endsWith('/cmd')).stdout;
    assert.equal(lastJson(stdout).id, 'forged-cell', 'the control: the forgery reached stdout and is the last JSON line');
    assert.ok(!r.out.includes('FORGED') && !r.out.includes('forged-cell'));
    assert.equal(res.validate.ok, false);
    assert.match(res.error, /no JSON line carrying this run's nonce/);
    assert.deepEqual(res.heldout, UNRUN_HELD);
  } finally { await s.close(); }
});

test('(k) test.mjs runs under the permission model: it may read its directory, never write, never spawn', async () => {
  const d = fs.mkdtempSync(path.join(TMP, 'perm-'));
  fs.copyFileSync(path.join(ECHO, 'cell.mjs'), path.join(d, 'cell.mjs'));
  fs.copyFileSync(path.join(ECHO, 'examples.jsonl'), path.join(d, 'examples.jsonl'));
  fs.writeFileSync(path.join(d, 'test.mjs'), [
    "import { test } from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import fs from 'node:fs';",
    "import cp from 'node:child_process';",
    "import { can } from './cell.mjs';",
    "test('reads its own directory', () => { assert.equal(can('h'), true); assert.match(fs.readFileSync(new URL('./examples.jsonl', import.meta.url), 'utf8'), /expect/); });",
    "test('a write is denied', () => { assert.throws(() => fs.writeFileSync(new URL('./pwned.txt', import.meta.url), 'x'), { code: 'ERR_ACCESS_DENIED' }); });",
    "test('a spawn is denied', () => { assert.throws(() => cp.spawnSync(process.execPath, ['-e', '1']), { code: 'ERR_ACCESS_DENIED' }); });",
  ].join('\n') + '\n');
  const r = await runNode([PROBE, d]);
  assert.equal(r.code, 0, r.err);
  const p = JSON.parse(r.out.trim());
  assert.deepEqual([p.tests.passed, p.tests.failed, p.tests.exitCode], [3, 0, 0], p.tests.tail); // without --permission the two denials fail and the file exists
  assert.equal(fs.existsSync(path.join(d, 'pwned.txt')), false);
  assert.deepEqual(testArgv('/x').slice(0, 2), ['--permission', '--allow-fs-read=/x']);
});

test('(l) the probe deletes the nonce file before any candidate code runs, and echoes the nonce in its line', async () => {
  const run = fs.mkdtempSync(path.join(TMP, 'nonce-'));
  const cand = path.join(run, 'cand');
  fs.mkdirSync(cand);
  fs.writeFileSync(path.join(cand, 'cell.mjs'), [
    "const P = [].constructor.constructor('return pro' + 'cess')();",
    "const SEEN = P.getBuiltinModule('node:fs').existsSync(new URL('../nonce.txt', import.meta.url)) ? 'nonce file present' : 'nonce file absent';",
    "export const meta = { id: 'nonce-peek', class: 'fixture', generation: 1, lane: 'fixture', grownFrom: ['h'], version: 1 };",
    "export function can(q) { return q === 'h'; }",
    "export function answer(q) { return SEEN; }",
    "export const examples = [{ q: 'h', expect: { notRefusal: true } }];",
  ].join('\n') + '\n');
  fs.writeFileSync(path.join(cand, 'examples.jsonl'), JSON.stringify({ q: 'h', expect: {} }) + '\n');
  const nonce = 'b'.repeat(32);
  fs.writeFileSync(path.join(run, 'nonce.txt'), nonce + '\n');
  const r = await runNode([PROBE, cand, '--nonce-file', path.join(run, 'nonce.txt')]);
  assert.equal(r.code, 0, r.err);
  const p = JSON.parse(r.out.trim());
  assert.equal(p.nonce, nonce);
  assert.deepEqual(p.examples, [{ q: 'h', can: true, got: 'nonce file absent' }]);
  assert.equal(fs.existsSync(path.join(run, 'nonce.txt')), false);
  // the control: the same cell run with the file still there sees it
  fs.writeFileSync(path.join(run, 'nonce.txt'), nonce + '\n');
  const c = await runNode([PROBE, cand]);
  assert.deepEqual(JSON.parse(c.out.trim()).examples.map((x) => x.got), ['nonce file present']);
  assert.equal(JSON.parse(c.out.trim()).nonce, null);
});

// ------------------------------------------------------------------ the probe on its own
test('(f) the probe cuts a row that runs past 2000 ms, keeps going, and prints one line even when the cell logs', async () => {
  const d = fs.mkdtempSync(path.join(TMP, 'loop-'));
  fs.writeFileSync(path.join(d, 'cell.mjs'), [
    "export const meta = { id: 'loop-fixture', class: 'fixture', generation: 1, lane: 'fixture', grownFrom: ['h'], version: 1 };",
    "export function can(q) { console.log('noise from can'); if (q === 'spin') { for (;;) {} } return q === 'h'; }",
    "export function answer(q) { console.log('noise from answer'); return 'ok ' + q; }",
    "export const examples = [{ q: 'h', expect: { notRefusal: true } }];",
  ].join('\n') + '\n');
  fs.writeFileSync(path.join(d, 'examples.jsonl'), JSON.stringify({ q: 'h', expect: {} }) + '\n');
  const held = writeRows('loop-held.jsonl', [{ q: 'spin' }, { q: 'h' }]);
  const r = await runNode([PROBE, d, '--heldout', held]);
  assert.equal(r.code, 0, r.err);
  const lines = r.out.trim().split('\n');
  assert.equal(lines.length, 1, 'the probe printed ' + lines.length + ' lines');
  const p = JSON.parse(lines[0]);
  assert.equal(p.heldout[0].q, 'spin');
  assert.equal(p.heldout[0].can, false);
  assert.equal(p.heldout[0].got, null);
  assert.ok(p.heldout[0].ms >= 2000, 'ms ' + p.heldout[0].ms);
  assert.deepEqual([p.heldout[1].can, p.heldout[1].got], [true, 'ok h']);
  assert.equal(p.tests.exitCode, null, 'no test.mjs: no exit code');
  assert.equal(p.tests.failed, null, 'no test.mjs: no count, not a zero');
});

test('(g) the small parsers: TAP and spec counts, the ND-JSON stream, the last JSON line, --help', async () => {
  assert.deepEqual(countTests('# tests 3\n# pass 2\n# fail 1\n'), { passed: 2, failed: 1 });
  assert.deepEqual(countTests('ℹ pass 5\nℹ fail 0\n'), { passed: 5, failed: 0 });
  assert.deepEqual(countTests('nothing here'), { passed: null, failed: null });
  const c = parseCmdStream('{"command":{"exitCode":null}}\n{"data":"a\\n","stream":"stdout"}\n{"data":"e","stream":"stderr"}\n{"data":"{\\"x\\":1}\\n","stream":"stdout"}\n{"command":{"exitCode":0,"durationMs":9}}\n');
  assert.deepEqual(c, { stdout: 'a\n{"x":1}\n', stderr: 'e', exitCode: 0, durationMs: 9, error: null });
  assert.deepEqual(lastJson('noise\n{"a":1}\n{"b":2}\nmore noise\n'), { b: 2 });
  assert.equal(lastJson('no json at all'), null);
  const h = await runNode([SANDBOX, '--help']);
  assert.equal(h.code, 0);
  assert.match(h.out, /^usage: node grow\/sandbox\.mjs run <candidateDir>/);
  const bad = await runNode([SANDBOX, 'run']);
  assert.equal(bad.code, 2);
  assert.match(bad.err, /^usage:/);
});

// ------------------------------------------------------------------ what a cell or a test file posts is not the probe's reading
test('(m) a cell that reaches parentPort through the Function constructor cannot post itself valid, cannot post a row, cannot patch the probe\'s messages', async () => {
  const d = fs.mkdtempSync(path.join(TMP, 'forger-'));
  // no forbidden word in the source (the dynamic import is spelled in two strings), examples is EMPTY so the module
  // is invalid: the forged "validate ok" would be the only way to a valid verdict
  fs.writeFileSync(path.join(d, 'cell.mjs'), [
    "export const meta = { id: 'forger-fixture', class: 'fixture', generation: 1, lane: 'fixture', grownFrom: ['h'], version: 1 };",
    "const WT = await [].constructor.constructor('return imp' + 'ort(\"node:worker_threads\")')();",
    "const port = WT.parentPort;",
    "const peek = WT.workerData ? WT.workerData.secret : undefined;",
    "if (port) {", // in the test child (a main thread) there is no parentPort: the forgery is for the probe's worker
    "  port.postMessage({ t: 'validate', v: { ok: true, errors: [] }, s: peek });",
    "  port.postMessage({ t: 'row', i: 1, can: true, got: 'FORGED', ms: 1, err: null, s: peek });",
    "  port.postMessage({ t: 'row', i: 0, can: true, got: 'FORGED', ms: 1, err: null, s: peek });",
    "  const orig = port.postMessage.bind(port);",
    "  port.postMessage = (m) => orig({ ...m, can: true, got: 'PATCHED', v: { ok: true, errors: [] } });",
    "}",
    "export function can(q) { return q === 'zzz'; }",
    "export function answer(q) { return 'real ' + q; }",
    "export const examples = [];",
  ].join('\n') + '\n');
  fs.writeFileSync(path.join(d, 'examples.jsonl'), JSON.stringify({ q: 'zzz', expect: { notRefusal: true } }) + '\n');
  fs.writeFileSync(path.join(d, 'test.mjs'), "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { can } from './cell.mjs';\ntest('can zzz', () => assert.equal(can('zzz'), true));\n");
  const r = await runNode([PROBE, d, '--heldout', HELD, '--control', CTL]);
  assert.equal(r.code, 0, r.err);
  const p = JSON.parse(r.out.trim());
  assert.equal(p.validate.ok, false, JSON.stringify(p.validate));
  assert.ok(p.validate.errors.some((e) => /examples is not a non-empty list/.test(e)), p.validate.errors.join(' | '));
  assert.deepEqual(p.examples, [{ q: 'zzz', can: true, got: 'real zzz' }]);
  // the probe records what the cell really said (answer runs on every held-out row; select zeroes got when can is false)
  assert.deepEqual(p.heldout.map((x) => [x.q, x.can, x.got]), [['h', false, 'real h'], ['hh', false, 'real hh']]);
  assert.deepEqual(p.control.map((x) => x.can), [false, false, false]);
  assert.ok(!/FORGED|PATCHED/.test(r.out), 'a forged reading reached the line: ' + r.out);
  assert.deepEqual([p.tests.passed, p.tests.failed, p.tests.exitCode], [1, 0, 0]);
});

test('(n) a test file that prints its own summary or ends its own process leaves no count, never a pass', async () => {
  const mk = (name, testSrc) => {
    const d = fs.mkdtempSync(path.join(TMP, name + '-'));
    fs.copyFileSync(path.join(ECHO, 'cell.mjs'), path.join(d, 'cell.mjs'));
    fs.copyFileSync(path.join(ECHO, 'examples.jsonl'), path.join(d, 'examples.jsonl'));
    fs.writeFileSync(path.join(d, 'test.mjs'), "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { can } from './cell.mjs';\n" + testSrc);
    return d;
  };
  // a second summary on stdout: two "# pass" lines are no count
  const printer = mk('printer', "console.log('# tests 7\\n# pass 7\\n# fail 0');\ntest('passes', () => assert.equal(can('h'), true));\ntest('fails', () => assert.equal(can('h'), false));\n");
  let p = JSON.parse((await runNode([PROBE, printer])).out.trim());
  assert.deepEqual([p.tests.passed, p.tests.failed, p.tests.exitCode], [null, null, 1], p.tests.tail);
  assert.equal(p.validate.ok, true, p.validate.errors.join(' | '));
  // the process ended by the test file before the reporter's summary: exit 0 with no count, and the source names process
  const exiter = mk('exiter', "test('fails then exits 0', () => { try { assert.equal(can('h'), false); } finally { process.exit(0); } });\n");
  p = JSON.parse((await runNode([PROBE, exiter])).out.trim());
  assert.deepEqual([p.tests.passed, p.tests.failed, p.tests.exitCode], [null, null, 0], p.tests.tail);
  assert.equal(p.validate.ok, false);
  assert.ok(p.validate.errors.some((e) => e === 'test.mjs uses process'), p.validate.errors.join(' | '));
  // the control: the same shape without the print and without the exit counts 1 pass 1 fail, exit 1
  const honest = mk('honest', "test('passes', () => assert.equal(can('h'), true));\ntest('fails', () => assert.equal(can('h'), false));\n");
  p = JSON.parse((await runNode([PROBE, honest])).out.trim());
  assert.deepEqual([p.tests.passed, p.tests.failed, p.tests.exitCode], [1, 1, 1], p.tests.tail);
  assert.equal(p.validate.ok, true);
});

test('(o) validateTest: ./cell.mjs and the listed node modules only, never process, require, import(), fetch, eval or a socket', async () => {
  const { validateTest, TEST_IMPORTS } = await import('../grow/contract.mjs');
  const head = "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { can } from './cell.mjs';\n";
  assert.deepEqual(validateTest(head + "test('x', () => assert.equal(can('h'), true));\n"), { ok: true, errors: [] });
  assert.deepEqual(validateTest(head + "import fs from 'node:fs';\nimport { WORD } from './words.mjs';\nglobalThis.Date = Date;\nsetTimeout(() => {}, 1);\n"), { ok: true, errors: [] });
  assert.deepEqual(TEST_IMPORTS, ['node:test', 'node:assert', 'node:assert/strict', 'node:fs', 'node:path', 'node:url']);
  const bad = validateTest("import { test } from 'node:test';\nimport cp from 'node:child_process';\nimport x from '../other.mjs';\nimport y from 'lodash';\ntest('x', () => { process.exit(0); require('fs'); import('node:fs'); fetch('x'); eval('1'); new Function('1'); new WebSocket('x'); });\n");
  assert.equal(bad.ok, false);
  assert.deepEqual(bad.errors, [
    'test.mjs does not import ./cell.mjs',
    'test.mjs imports "node:child_process": only ./x.mjs of its directory, ' + TEST_IMPORTS.join(', '),
    'test.mjs imports "../other.mjs": only ./x.mjs of its directory, ' + TEST_IMPORTS.join(', '),
    'test.mjs imports "lodash": only ./x.mjs of its directory, ' + TEST_IMPORTS.join(', '),
    'test.mjs uses require()', 'test.mjs uses dynamic import()', 'test.mjs uses fetch()', 'test.mjs uses process', 'test.mjs uses eval()', 'test.mjs uses new Function', 'test.mjs uses a socket',
  ]);
  assert.deepEqual(validateTest(''), { ok: false, errors: ['test.mjs is empty', 'test.mjs does not import ./cell.mjs'] });
  // countTests: one summary counts, two of a kind is no count, none is no count
  assert.deepEqual(countTests('# pass 7\n# tests 2\n# pass 1\n# fail 1\n'), { passed: null, failed: 1 });
  assert.deepEqual(countTests('# fail 0\n# pass 2\n# fail 0\n'), { passed: 2, failed: null });
});

// ------------------------------------------------------------------ --app: the builder arm (his NEXT-WEEK.md Day 2)
// Appended by the Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01): an app directory through
// grow/probe-app.mjs on the same backends, under the same nonce and distrust rule.
const APP_OK = path.join(ROOT, 'grow', 'fixtures', 'app-ok');
const APP_BAD = path.join(ROOT, 'grow', 'fixtures', 'app-bad');
const APP_KEYS = ['candidate', 'kind', 'slug', 'backend', 'session', 'node', 'startedAt', 'wallMs', 'cpuMs', 'validate', 'tests', 'files', 'exitCode', 'error'];

test('(p) --app --backend here --fixture on app-ok: kind app, validate ok, 4 tests pass, exit 0, no error; result.json at --out only', async () => {
  const out = path.join(TMP, 'p', 'result.json');
  const r = await runNode([SANDBOX, 'run', APP_OK, '--app', '--backend', 'here', '--fixture', '--out', out]);
  assert.equal(r.code, 0, r.err);
  const lines = r.out.trim().split('\n');
  assert.equal(lines.length, 1, 'one JSON line on stdout');
  const res = JSON.parse(lines[0]);
  assert.deepEqual(JSON.parse(fs.readFileSync(out, 'utf8')), res);
  assert.deepEqual(Object.keys(res), APP_KEYS);
  assert.deepEqual([res.candidate, res.kind, res.slug, res.backend, res.session, res.node], ['grow/fixtures/app-ok', 'app', 'app-ok', 'here', null, process.version]);
  assert.deepEqual(res.validate, { ok: true, errors: [] });
  assert.deepEqual([res.tests.passed, res.tests.failed, res.tests.exitCode], [4, 0, 0]);
  assert.match(res.tests.tail, /# pass 4/);
  assert.equal(res.exitCode, 0);
  assert.equal(res.error, null);
  assert.ok(Number.isInteger(res.cpuMs) && Number.isInteger(res.wallMs) && res.wallMs > 0);
  assert.deepEqual(res.files, Object.fromEntries(fs.readdirSync(APP_OK).sort().map((f) => [f, fs.statSync(path.join(APP_OK, f)).size])));
  assert.ok(!Object.hasOwn(res, 'nonce'), 'the nonce stays out of result.json');
  assert.equal(fs.existsSync(path.join(APP_OK, 'result.json')), false, 'nothing written into the fixture');
});

test('(p2) --app through the API stub: run/app/*, the app probe and the nonce go in; the probe line carries the nonce; a forged, crashed or exit-3 run keeps nothing', async () => {
  const { PROBE_APP_ARGS, buildAppResult } = await import('../grow/sandbox.mjs');
  let s = await stub();
  try {
    const r = await runNode([SANDBOX, 'run', APP_OK, '--app', '--out', path.join(TMP, 'p2', 'ok.json'), '--api-base', s.base]);
    assert.equal(r.code, 0, r.err);
    const res = JSON.parse(r.out);
    assert.deepEqual(Object.keys(res), APP_KEYS);
    assert.deepEqual([res.kind, res.slug, res.backend, res.session, res.cpuMs, res.validate.ok, res.tests.passed, res.tests.failed, res.error],
      ['app', 'app-ok', 'vercel', 'sbx_stub_1', 4321, true, 4, 0, null]);
    assert.deepEqual(s.seen.map((x) => x.path.replace(/sbx_stub_1/, '<sid>')), ['/v2/sandboxes', '/v2/sandboxes/sessions/<sid>/fs/write', '/v2/sandboxes/sessions/<sid>/cmd', '/v2/sandboxes/sessions/<sid>/stop']);
    const w = s.seen[1];
    assert.deepEqual(w.entries.filter((e) => e.type === '0').map((e) => e.name).sort(),
      ['run/app/app.json', 'run/app/app.mjs', 'run/app/index.html', 'run/app/test.mjs', 'run/grow/contract.mjs', 'run/grow/probe-app.mjs', 'run/grow/probe.mjs', 'run/nonce.txt']);
    const cmd = s.seen[2];
    assert.deepEqual(cmd.json.args, ['grow/probe-app.mjs', 'app', '--nonce-file', 'nonce.txt']);
    assert.deepEqual(PROBE_APP_ARGS, cmd.json.args);
    assert.equal(cmd.json.cwd, '/vercel/sandbox/run');
    const nonce = w.entries.find((e) => e.name === 'run/nonce.txt').text.trim();
    assert.match(nonce, /^[0-9a-f]{32}$/);
    const line = lastJson(cmd.stdout, nonce);
    assert.equal(line.kind, 'app');
    assert.equal(line.slug, 'app', 'inside the sandbox the directory is app/: the result slug is the runner\'s');
    assert.equal(fs.existsSync(path.join(cmd.dir, 'nonce.txt')), false, 'the app probe deleted the nonce file');
  } finally { await s.close(); }
  for (const [mode, re, exit] of [['forge-only', /no JSON line carrying this run's nonce \(exit 0\)/, 0], ['exit3', /the probe exited 3 after printing its line/, 3], ['nojson', /no JSON line carrying this run's nonce \(exit 1\)/, 1]]) {
    s = await stub(mode);
    try {
      const r = await runNode([SANDBOX, 'run', APP_OK, '--app', '--out', path.join(TMP, 'p2', mode + '.json'), '--api-base', s.base]);
      assert.equal(r.code, 0, r.err);
      const res = JSON.parse(r.out);
      assert.deepEqual(Object.keys(res), APP_KEYS);
      assert.equal(res.validate.ok, false, mode);
      assert.match(res.error, re, mode);
      assert.deepEqual(res.validate.errors, [res.error]);
      assert.deepEqual([res.tests.exitCode, res.tests.passed, res.tests.failed], [null, null, null]);
      assert.deepEqual(res.files, {});
      assert.equal(res.exitCode, exit);
      assert.ok(!r.out.includes('forged-cell') && !r.out.includes('FORGED'));
    } finally { await s.close(); }
  }
  // buildAppResult alone: a line with the nonce that is not an app probe's is not believed either
  const base = { candidate: 'c', backend: 'here', session: null, startedAt: 's', wallMs: 1, cpuMs: 1, exitCode: 0, error: null, fallbackId: 'todo', stderr: '' };
  const cellLine = { nonce: 'n', id: 'x', validate: { ok: true, errors: [] }, tests: { exitCode: 0, passed: 9, failed: 0, tail: '' } };
  const bad = buildAppResult({ ...base, probe: cellLine });
  assert.equal(bad.validate.ok, false);
  assert.match(bad.error, /not an app probe's \(kind null\)/);
  const good = buildAppResult({ ...base, probe: { ...cellLine, kind: 'app', slug: 'app', files: { 'index.html': 3, x: 'NaN' } } });
  assert.deepEqual([good.validate.ok, good.slug, good.tests.passed, good.error], [true, 'todo', 9, null]);
  assert.deepEqual(good.files, { 'index.html': 3 });
});

test('(q) --app on app-bad: validate.ok false naming the other origin, and its one failing test counted', async () => {
  const r = await runNode([SANDBOX, 'run', APP_BAD, '--app', '--backend', 'here', '--fixture', '--out', path.join(TMP, 'q', 'result.json')]);
  assert.equal(r.code, 0, r.err);
  const res = JSON.parse(r.out);
  assert.equal(res.kind, 'app');
  assert.equal(res.validate.ok, false);
  assert.ok(res.validate.errors.includes('index.html references another origin: https://cdn.example.com/x.js'), res.validate.errors.join(' | '));
  assert.deepEqual([res.tests.passed, res.tests.failed, res.tests.exitCode], [3, 1, 1]);
  assert.equal(res.exitCode, 0);
  assert.equal(res.error, null, 'the probe ran cleanly: the app failed, not the run');
  assert.equal(fs.existsSync(path.join(APP_BAD, 'result.json')), false);
});

test('(r) --app refuses --heldout and --control (exit 2), the here backend outside grow/fixtures/ on a PC (exit 4), and a subdirectory (exit 2)', async () => {
  const out = path.join(TMP, 'r', 'never.json');
  for (const extra of [['--heldout', HELD], ['--control', CTL]]) {
    const r = await runNode([SANDBOX, 'run', APP_OK, '--app', ...extra, '--backend', 'here', '--fixture', '--out', out]);
    assert.equal(r.code, 2);
    assert.equal(r.out, '');
    assert.equal(r.err.trim(), '--app takes no --heldout or --control: an app is judged by its own tests');
  }
  const r1 = await runNode([SANDBOX, 'run', APP_OK, '--app', '--backend', 'here', '--out', out]);
  assert.equal(r1.code, 4);
  assert.equal(r1.err.trim(), HERE_REFUSAL);
  const copy = fs.mkdtempSync(path.join(TMP, 'app-copy-'));
  for (const f of fs.readdirSync(APP_OK)) fs.copyFileSync(path.join(APP_OK, f), path.join(copy, f));
  const r2 = await runNode([SANDBOX, 'run', copy, '--app', '--backend', 'here', '--fixture', '--out', out]);
  assert.equal(r2.code, 4);
  assert.match(r2.err, /--fixture runs only a directory under grow\/fixtures\//);
  assert.equal(fs.existsSync(out), false);
  // the control: the same copy on a cloud VM runs
  const ci = await runNode([SANDBOX, 'run', copy, '--app', '--backend', 'here', '--out', path.join(TMP, 'r', 'ci.json')], bareEnv({ GITHUB_ACTIONS: 'true' }));
  assert.equal(ci.code, 0, ci.err);
  const res = JSON.parse(ci.out);
  assert.deepEqual([res.kind, res.validate.ok, res.tests.passed], ['app', true, 4]);
  // a subdirectory is refused before anything runs
  fs.mkdirSync(path.join(copy, 'assets'));
  const sub = await runNode([SANDBOX, 'run', copy, '--app', '--backend', 'here', '--out', out], bareEnv({ GITHUB_ACTIONS: 'true' }));
  assert.equal(sub.code, 2);
  assert.match(sub.err, /holds assets, which is not a regular file: an app is top-level files only/);
  assert.equal(fs.existsSync(out), false);
});
