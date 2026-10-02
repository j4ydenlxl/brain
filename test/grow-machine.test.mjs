// test/grow-machine.test.mjs: grow/machine.mjs, offline. A fake browser (a Node script started exactly as the real one is,
// with the real flags) speaks the DevTools protocol over a WebSocket server written in this file, on 127.0.0.1 (the handshake,
// masked client frames, unmasked server frames), so every rule of the screen is exercised against the real client code with
// no network: the allowlist, every other scheme failed through the protocol, an off-list redirect, a tab that wanders off the
// list, a bot check left, a popup closed, downloads and permissions denied, nothing typed or clicked, the byte and time
// budgets, the JPEG cap, the caps of the screens and machine records with the index matching the files, 100 disjoint slices
// covering the queue, `land` refusing what is wrong, `skipped` with no browser, and the whole process tree killed and the
// profile removed on a hang and on a process exit. Temp roots only; a fake clock where time is the subject.
// MACHINE_MUTANTS=1 also breaks machine.mjs one rule at a time in temp trees and prints "killed k of n".
import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  step, land, status, checkUrl, decide, challengeOf, parseRead, sliceOf, parseShard, allowOf, queueOf, pageOf,
  capScreens, capMachines, writeScreen, readIndex, findBrowser, isJpeg, sha256, sha12,
  CAPS, LIMITS, PERMISSIONS, READ_EXPRESSION, JPEG_LADDER,
} from '../grow/machine.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const MACHINE = path.join(ROOT, 'grow', 'machine.mjs');
// NODE_TEST_CONTEXT dropped too: a `node --test` child that inherits it reports to this runner and exits 0 whatever fails
const ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !/^(SHARD|SHARDS|CI|CHROME_PATH|CHROME_BIN|MACHINE_MUTANTS|NODE_TEST_CONTEXT)$|^(GITHUB_|RUNNER_)/.test(k)));
const HOSTS = ['good.example.org', 'other.example.org'];
const LINE_KEYS = ['step', 'state', 'why', 'machine', 'era', 'shard', 'queue', 'slice', 'visited', 'screens', 'bytes', 'challenged', 'refused',
  'refusedBy', 'byState', 'netBytes', 'ms', 'browser', 'cpus', 'memoryBytes', 'os', 'out', 'kept', 'evicted'];
/** Every protocol method the rules let a computer send: nothing that types, clicks, submits or runs other code. */
const ALLOWED = new Set(['Browser.getVersion', 'Browser.setDownloadBehavior', 'Browser.setPermission', 'Target.setDiscoverTargets', 'Target.createTarget',
  'Target.attachToTarget', 'Target.closeTarget', 'Page.enable', 'Network.enable', 'Fetch.enable', 'Network.setBypassServiceWorker', 'Network.setBlockedURLs',
  'Emulation.setDeviceMetricsOverride', 'Page.getFrameTree', 'Page.navigate', 'Page.stopLoading', 'Page.createIsolatedWorld', 'Runtime.evaluate',
  'Input.dispatchMouseEvent', 'Page.getLayoutMetrics', 'Page.captureScreenshot', 'Fetch.continueRequest', 'Fetch.failRequest', 'Page.handleJavaScriptDialog']);

// ---------------------------------------------------------------- helpers
const tmp = (p = 'machine-test-') => fs.mkdtempSync(path.join(os.tmpdir(), p));
const rm = (d) => { try { fs.rmSync(d, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); } catch { /* best effort */ } };
const iso = (k, base = Date.UTC(2020, 0, 1)) => new Date(base + k * 1000).toISOString();
/** A buffer with the JPEG magic bytes, `tag` inside it so each is distinct, `n` bytes long. */
const jpg = (tag, n = 600) => { const b = Buffer.alloc(n, 0x41); Buffer.from([0xff, 0xd8, 0xff, 0xe0]).copy(b, 0); Buffer.from(String(tag)).copy(b, 4); b[n - 2] = 0xff; b[n - 1] = 0xd9; return b; };
function treeOf(urls, hosts = HOSTS, extra = {}) {
  const root = tmp('machine-root-');
  fs.mkdirSync(path.join(root, 'neo'), { recursive: true });
  fs.writeFileSync(path.join(root, 'neo', 'machines-seeds.json'), JSON.stringify({ about: 'test seeds', allowedHosts: hosts, urls }));
  for (const [f, v] of Object.entries(extra)) { fs.mkdirSync(path.dirname(path.join(root, f)), { recursive: true }); fs.writeFileSync(path.join(root, f), typeof v === 'string' ? v : JSON.stringify(v)); }
  return root;
}
function indexMatches(dir) {
  const idx = JSON.parse(fs.readFileSync(path.join(dir, 'INDEX.json'), 'utf8')).screens.map((e) => e.id).sort();
  const files = fs.readdirSync(dir).filter((n) => n !== 'INDEX.json').map((n) => n.replace(/\.jpg$/, '')).sort();
  assert.deepEqual(idx, files, 'the index matches the files');
}
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
async function deadWithin(pids, ms = 6000) {
  const end = Date.now() + ms;
  for (;;) {
    const live = pids.filter(alive);
    if (!live.length || Date.now() > end) return live;
    await new Promise((r) => setTimeout(r, 100));
  }
}
/** A clock that moves only when the step sleeps (and `tick` ms a call when asked). */
function fakeTime(tick = 0) {
  const t = { now: Date.UTC(2026, 9, 2, 12, 0, 0), sleeps: [] };
  t.clock = () => (t.now += tick);
  t.sleep = async (ms) => { t.sleeps.push(ms); t.now += ms; };
  return t;
}
const run = (argv, opts = {}) => new Promise((resolve) => {
  execFile(process.execPath, [MACHINE, ...argv], { env: ENV, timeout: 60000, windowsHide: true, maxBuffer: 1 << 22, ...opts }, (err, stdout, stderr) => resolve({ code: err ? (typeof err.code === 'number' ? err.code : -1) : 0, stdout: String(stdout), stderr: String(stderr) }));
});

// ---------------------------------------------------------------- the fake browser
const FAKE_BROWSER = String.raw`import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
const sc = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const args = process.argv.slice(3);
const log = (o) => fs.appendFileSync(sc.log, JSON.stringify(o) + '\n');
const profile = (args.find((a) => a.startsWith('--user-data-dir=')) || '').slice('--user-data-dir='.length);
log({ ev: 'start', pid: process.pid, args, profile });
if (profile) { fs.mkdirSync(path.join(profile, 'Default'), { recursive: true }); fs.writeFileSync(path.join(profile, 'Default', 'Cookies'), 'x'); }
if (sc.mode === 'exit') { process.stderr.write('[0:ERROR] something failed: no sandbox\n'); process.exit(3); }
if (sc.mode === 'silent' || sc.mode === 'hang') {
  const kid = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
  log({ ev: 'kid', pid: kid.pid });
}
const pages = sc.pages || {};
const pageOf = (u) => pages[u] || { title: 'Page ' + u, text: 'The text of ' + u };
const jpegOf = (u, n, bad) => {
  const b = Buffer.alloc(Math.max(16, n));
  const h = crypto.createHash('sha256').update(process.pid + '|' + u + '|' + n).digest();
  for (let i = 0; i < b.length; i++) b[i] = h[i % 32];
  if (bad) { b[0] = 0x89; b[1] = 0x50; b[2] = 0x4e; b[3] = 0x47; } else { b[0] = 0xff; b[1] = 0xd8; b[2] = 0xff; b[3] = 0xe0; }
  return b.toString('base64');
};
const sessions = new Map();
let tn = 0, rn = 0;
async function navigate(m, s, ok, ev, send) {
  const url = m.params.url;
  if (url === 'about:blank') { s.url = url; ok({ frameId: s.targetId, loaderId: 'L0' }); return; }
  const first = pageOf(url);
  if (first.hang) return;
  s.shot = 0;
  const pause = (u, type, redirected) => new Promise((res) => {
    const id = 'R' + (++rn);
    s.paused.set(id, res);
    log({ ev: 'paused', id, url: u, type });
    const params = { requestId: id, request: { url: u, method: 'GET', headers: {} }, frameId: s.targetId, resourceType: type };
    if (redirected) params.redirectedRequestId = redirected;
    ev('Fetch.requestPaused', params);
  }).then((go) => { log({ ev: go ? 'continued' : 'failed', url: u }); return go; });
  const blocked = () => ok({ frameId: s.targetId, loaderId: 'L1', errorText: 'net::ERR_BLOCKED_BY_CLIENT' });
  if (!(await pause(url, 'Document'))) return blocked();
  let cur = url, p = first;
  if (p.redirect) {
    if (!(await pause(p.redirect, 'Document', 'R' + rn))) return blocked();
    cur = p.redirect; p = pageOf(cur);
  }
  s.url = cur;
  const rid = 'D' + rn, bytes = p.bytes || 1000;
  ok({ frameId: s.targetId, loaderId: 'L1' });
  ev('Page.frameNavigated', { frame: { id: s.targetId, url: cur } });
  ev('Network.responseReceived', { requestId: rid, frameId: s.targetId, type: 'Document', response: { url: cur, status: p.status || 200, headers: p.headers || {} } });
  ev('Network.dataReceived', { requestId: rid, dataLength: bytes, encodedDataLength: bytes });
  for (const u of p.sub || []) await pause(u, 'Image');
  if (p.popup) send({ method: 'Target.targetCreated', params: { targetInfo: { targetId: 'P' + s.targetId, type: 'page', openerId: s.targetId, url: cur + '#popup' } } });
  ev('Network.loadingFinished', { requestId: rid, encodedDataLength: bytes });
  ev('Page.loadEventFired', { timestamp: 1 });
}
function onMsg(m, send) {
  log({ ev: 'cmd', method: m.method, params: m.params || {}, sessionId: m.sessionId || null });
  if (sc.mode === 'hang') return;
  const sid = m.sessionId ? { sessionId: m.sessionId } : {};
  const ok = (result = {}) => send({ id: m.id, result, ...sid });
  const ev = (method, params) => send({ method, params, ...sid });
  const s = m.sessionId ? sessions.get(m.sessionId) : null;
  const p = m.params || {};
  if (m.method === 'Browser.getVersion') return ok({ product: 'FakeChrome/1.0', protocolVersion: '1.3' });
  if (m.method === 'Target.createTarget') return ok({ targetId: 'T' + (++tn) });
  if (m.method === 'Target.attachToTarget') { const id = 'S' + p.targetId; sessions.set(id, { targetId: p.targetId, url: 'about:blank', paused: new Map(), shot: 0 }); return ok({ sessionId: id }); }
  if (m.method === 'Page.getFrameTree') return ok({ frameTree: { frame: { id: s.targetId, url: s.url } } });
  if (m.method === 'Page.createIsolatedWorld') return ok({ executionContextId: 7 });
  if (m.method === 'Runtime.evaluate') { const pg = pageOf(s.url); return ok({ result: { type: 'string', value: JSON.stringify({ title: pg.title || '', text: pg.text || '', href: pg.href || s.url }) } }); }
  if (m.method === 'Page.getLayoutMetrics') return ok({ cssVisualViewport: { pageX: 0, pageY: 600, clientWidth: 1280, clientHeight: 800 } });
  if (m.method === 'Page.captureScreenshot') { const pg = pageOf(s.url); const sizes = pg.jpeg || [9000]; const n = sizes[Math.min(s.shot, sizes.length - 1)]; s.shot++; return ok({ data: jpegOf(s.url, n, pg.notJpeg) }); }
  if (m.method === 'Fetch.continueRequest' || m.method === 'Fetch.failRequest') { ok(); const r = s && s.paused.get(p.requestId); if (r) { s.paused.delete(p.requestId); r(m.method === 'Fetch.continueRequest'); } return; }
  if (m.method === 'Page.navigate') { navigate(m, s, ok, ev, send); return; }
  if (m.method === 'Target.closeTarget') return ok({ success: true });
  return ok();
}
if (sc.mode === 'silent') setInterval(() => {}, 1000);
else {
  const server = http.createServer((q, r) => { r.writeHead(404); r.end(); });
  server.on('upgrade', (req, sock) => {
    const acc = crypto.createHash('sha1').update(req.headers['sec-websocket-key'] + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
    sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n\r\n');
    sock.setNoDelay(true);
    sock.on('error', () => {});
    const send = (o) => {
      const pl = Buffer.from(JSON.stringify(o));
      let h;
      if (pl.length < 126) h = Buffer.from([0x81, pl.length]);
      else if (pl.length < 65536) { h = Buffer.alloc(4); h[0] = 0x81; h[1] = 126; h.writeUInt16BE(pl.length, 2); }
      else { h = Buffer.alloc(10); h[0] = 0x81; h[1] = 127; h.writeBigUInt64BE(BigInt(pl.length), 2); }
      try { sock.write(Buffer.concat([h, pl])); } catch {}
    };
    let buf = Buffer.alloc(0);
    sock.on('data', (d) => {
      buf = Buffer.concat([buf, d]);
      for (;;) {
        if (buf.length < 2) return;
        const op = buf[0] & 0x0f, masked = (buf[1] & 0x80) !== 0;
        let len = buf[1] & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        const mk = masked ? buf.subarray(off, off + 4) : null;
        if (masked) off += 4;
        if (buf.length < off + len) return;
        const pl = Buffer.from(buf.subarray(off, off + len));
        buf = buf.subarray(off + len);
        if (mk) for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i & 3];
        if (op === 8) { try { sock.write(Buffer.from([0x88, 0])); sock.end(); } catch {} return; }
        if (op === 9) { try { sock.write(Buffer.concat([Buffer.from([0x8a, pl.length]), pl])); } catch {} continue; }
        if (op === 1) { let m = null; try { m = JSON.parse(pl.toString('utf8')); } catch {} if (m) onMsg(m, send); }
      }
    });
  });
  server.listen(0, '127.0.0.1', () => process.stderr.write('\nDevTools listening on ws://127.0.0.1:' + server.address().port + '/devtools/browser/fake\n'));
}
`;
const FAKE_DIR = tmp('machine-fake-');
const FAKE = path.join(FAKE_DIR, 'fake-browser.mjs');
fs.writeFileSync(FAKE, FAKE_BROWSER);
after(() => rm(FAKE_DIR));

/** One fake browser: its scenario file, its log, and what it saw. */
function fakeOf(mode, pages = {}) {
  const dir = tmp('machine-scenario-');
  const log = path.join(dir, 'log.jsonl');
  const file = path.join(dir, 'scenario.json');
  fs.writeFileSync(file, JSON.stringify({ mode, log, pages }));
  const read = () => {
    let t = '';
    try { t = fs.readFileSync(log, 'utf8'); } catch { return []; }
    return t.split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  };
  return {
    dir, file, read, browser: { path: process.execPath, pre: [FAKE, file] },
    cmds: (method) => read().filter((e) => e.ev === 'cmd' && (!method || e.method === method)),
    pids: () => read().filter((e) => e.ev === 'start' || e.ev === 'kid').map((e) => e.pid),
    profiles: () => read().filter((e) => e.ev === 'start').map((e) => e.profile).filter(Boolean),
  };
}
/** Whatever a broken copy left alive or on disk, gone (a test of the module never relies on this). */
function reap(f) {
  for (const pid of f.pids()) {
    if (!alive(pid)) continue;
    if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
  }
  for (const p of f.profiles()) rm(p);
  rm(f.dir);
}
const drive = (root, f, o = {}) => {
  const t = o.time || fakeTime();
  return step({ root, browser: f.browser, env: ENV, era: 0, shard: { i: 0, n: 1 }, tabs: 1, maxMs: 60000, clock: t.clock, sleep: t.sleep, ...o, limits: { settleMs: 0, ...(o.limits || {}) } });
};

// ---------------------------------------------------------------- pure rules
test('the rules of a URL: https only, no credentials, the default port, a host on the allowlist', () => {
  const allow = { hosts: new Set(HOSTS), urls: [] };
  const cases = [
    ['https://good.example.org/a#top', null], ['https://GOOD.example.org/b', null], ['https://evil.example.com/', 'host'],
    ['http://good.example.org/', 'scheme'], ['file:///etc/passwd', 'scheme'], ['javascript:alert(1)', 'scheme'], ['data:text/html,hi', 'scheme'],
    ['ftp://good.example.org/', 'scheme'], ['https://u:p@good.example.org/', 'url'], ['https://good.example.org:8443/', 'url'], ['not a url', 'url'],
    ['https://127.0.0.1/', 'host'], ['https://good.example.org.evil.example.com/', 'host'],
  ];
  for (const [u, why] of cases) {
    const c = checkUrl(u, allow);
    if (why === null) assert.equal(c.ok, true, u);
    else assert.deepEqual(c, { ok: false, why }, u);
  }
  assert.deepEqual(checkUrl('https://GOOD.example.org/a#top', allow), { ok: true, url: 'https://good.example.org/a', host: 'good.example.org' });
  assert.deepEqual(checkUrl('https://good.example.org/', null), { ok: false, why: 'host' });
});

test('decide: every other scheme failed through the protocol; a top-level request off the list, or not a GET, failed; an off-list redirect named; a page over budget failed', () => {
  const allow = { hosts: new Set(HOSTS), urls: [] };
  const main = new Set(['F1']);
  const req = (url, o = {}) => ({ request: { url, method: o.method || 'GET' }, resourceType: o.type || 'Document', frameId: o.frame || 'F1', ...(o.redirect ? { redirectedRequestId: 'R1' } : {}) });
  const d = (p, over = false) => decide(p, { mainFrameIds: main, allow, over });
  assert.deepEqual(d(req('https://good.example.org/')), { action: 'continue' });
  assert.deepEqual(d(req('https://evil.example.com/')), { action: 'fail', why: 'host' });
  assert.deepEqual(d(req('https://evil.example.com/', { redirect: true })), { action: 'fail', why: 'redirect' });
  assert.deepEqual(d(req('https://good.example.org/form', { method: 'POST' })), { action: 'fail', why: 'method' });
  assert.deepEqual(d(req('http://good.example.org/', {})), { action: 'fail', why: 'scheme' });
  assert.deepEqual(d(req('http://good.example.org/i.png', { type: 'Image' })), { action: 'fail', why: 'scheme' });
  assert.deepEqual(d(req('file:///c:/x', { type: 'Image' })), { action: 'fail', why: 'scheme' });
  assert.deepEqual(d(req('wss://good.example.org/s', { type: 'WebSocket' })), { action: 'fail', why: 'scheme' });
  assert.deepEqual(d(req('chrome://settings/')), { action: 'fail', why: 'scheme' });
  assert.deepEqual(d({ request: { url: 'nonsense' } }), { action: 'fail', why: 'scheme' });
  assert.deepEqual(d(req('https://cdn.example.net/x.js', { type: 'Script' })), { action: 'continue' }, 'a subresource of an https host loads');
  assert.deepEqual(d(req('https://evil.example.com/frame', { frame: 'F2' })), { action: 'continue' }, 'a child frame is not a top-level navigation');
  assert.deepEqual(d(req('https://good.example.org/x.js', { type: 'Script' }), true), { action: 'fail', why: 'budget' });
});

test('a bot check is recognised from the title, a short text, a header or a refusing status, and never on a long page that names one', () => {
  assert.equal(challengeOf({ title: 'Just a moment...' }), '^just a moment');
  assert.equal(challengeOf({ title: 'x', headers: { 'cf-mitigated': 'challenge' } }), 'cf-mitigated');
  assert.ok(challengeOf({ title: 'Robot check', text: 'Please verify you are a human to continue' }));
  assert.equal(challengeOf({ title: 'x', text: 'ok', headers: { 'x-datadome': '1' } }), 'bot wall header');
  assert.equal(challengeOf({ title: 'Forbidden', text: 'no', status: 403 }), 'refused 403');
  assert.equal(challengeOf({ title: 'News', text: 'a long article '.repeat(300) + ' captcha' }), null);
  assert.equal(challengeOf({ title: 'Docs', text: 'Hello', status: 200 }), null);
  assert.deepEqual(parseRead('{"title":"T","text":"x","href":"https://good.example.org/"}'), { title: 'T', text: 'x', href: 'https://good.example.org/' });
  assert.deepEqual(parseRead('alert(1)'), { title: '', text: '', href: '' });
  assert.deepEqual(parseRead('[1,2]'), { title: '', text: '', href: '' });
  const big = parseRead(JSON.stringify({ title: 't'.repeat(999), text: 'x'.repeat(9999) }));
  assert.equal(big.text.length, LIMITS.textChars);
  assert.equal(big.title.length, LIMITS.titleChars);
});

test('the allowlist: neo/machines.json made from the seeds, written only when asked, a host added later kept when the seeds change, no IP or localhost', () => {
  const root = treeOf(['https://good.example.org/a'], [...HOSTS, '127.0.0.1', 'localhost']);
  try {
    const f = path.join(root, 'neo', 'machines.json');
    const a = allowOf(root);
    assert.equal(a.wrote, false);
    assert.ok(!fs.existsSync(f));
    assert.deepEqual([...a.hosts].sort(), [...HOSTS].sort());
    assert.equal(allowOf(root, { write: true }).wrote, true);
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    j.allowedHosts.push('kept.example.org');
    fs.writeFileSync(f, JSON.stringify(j));
    assert.ok(allowOf(root).hosts.has('kept.example.org'));
    assert.equal(allowOf(root, { write: true }).wrote, false, 'the same seeds: nothing written');
    fs.writeFileSync(path.join(root, 'neo', 'machines-seeds.json'), JSON.stringify({ allowedHosts: [...HOSTS, 'new.example.org'], urls: [] }));
    const c = allowOf(root, { write: true });
    assert.equal(c.wrote, true);
    assert.ok(c.hosts.has('kept.example.org') && c.hosts.has('new.example.org'));
    assert.ok(!c.hosts.has('127.0.0.1') && !c.hosts.has('localhost'));
  } finally { rm(root); }
});

test('the queue is general: the allowlist urls, then every URL and host the organism holds, each once, each on the list, the rest counted', () => {
  const root = treeOf(['https://good.example.org/a', 'https://good.example.org/a#again'], [...HOSTS, 'github.com'], {
    'neo/sources.json': { sources: [{ url: 'https://raw.githubusercontent.com/owner/repo/main/data.json' }, { url: 'http://good.example.org/old' }, { url: 'https://api.github.com/repos/o2/r2/contents/x' }] },
    'neo/frontier.json': { allowedHosts: ['other.example.org', 'evil.example.com'] },
  });
  try {
    const q = queueOf(root, allowOf(root));
    assert.deepEqual(q.urls, ['https://good.example.org/a', 'https://github.com/owner/repo', 'https://github.com/o2/r2', 'https://other.example.org/']);
    assert.deepEqual(q.refused, { url: 0, scheme: 1, host: 1 });
    assert.equal(q.held, 5);
    assert.equal(pageOf('https://raw.githubusercontent.com/a/b/main/x.json'), 'https://github.com/a/b');
    assert.equal(pageOf('::'), null);
  } finally { rm(root); }
});

test('100 computers: 100 disjoint slices that cover the queue, every computer with a page of this tree, each slice rotated by the era', () => {
  const q = Array.from({ length: 1013 }, (_, k) => 'https://good.example.org/p' + k);
  for (const rot of [0, 1, 7, 12345]) {
    const seen = new Map();
    for (let i = 0; i < 100; i++) for (const u of sliceOf(q, i, 100, rot)) { assert.ok(!seen.has(u), 'disjoint: ' + u); seen.set(u, i); }
    assert.equal(seen.size, q.length, 'covering');
  }
  const sizes = Array.from({ length: 100 }, (_, i) => sliceOf(q, i, 100).length);
  assert.ok(Math.max(...sizes) - Math.min(...sizes) <= 1, 'even');
  const s0 = sliceOf(q, 3, 100, 0), s1 = sliceOf(q, 3, 100, 1);
  assert.notEqual(s0[0], s1[0]);
  assert.deepEqual([...s0].sort(), [...s1].sort());
  const real = queueOf(ROOT, allowOf(ROOT));
  assert.ok(real.urls.length >= 100, 'the queue of this tree holds a page for each of 100 computers: ' + real.urls.length);
  const all = [];
  for (let i = 0; i < 100; i++) { const s = sliceOf(real.urls, i, 100, 5); assert.ok(s.length >= 1, 'computer ' + i + ' has a page'); all.push(...s); }
  assert.equal(all.length, real.urls.length);
  assert.equal(new Set(all).size, real.urls.length);
  assert.deepEqual(parseShard('99/100'), { i: 99, n: 100 });
  assert.deepEqual(parseShard('255/256'), { i: 255, n: 256 });
  for (const bad of ['100/100', '0/257', '0/0', 'x', '-1/3', '1/2/3', '', null]) assert.equal(parseShard(bad), null, String(bad));
});

test('caps: at most 600 screens and 4 MB with the index, at most 2000 machine records, the oldest evicted, the index always matching the files', () => {
  const d = tmp();
  try {
    const sdir = path.join(d, 'count');
    fs.mkdirSync(sdir);
    const add = [];
    for (let k = 0; k < CAPS.screens + 5; k++) add.push(writeScreen(sdir, jpg('n' + k, 200), { url: 'https://good.example.org/' + k, host: 'good.example.org', title: 't', at: iso(k), machine: 'aaaaaaaaaaaa', textBytes: 1, era: 0, shard: '0/1' }));
    fs.writeFileSync(path.join(sdir, 'abcdefabcdef.jpg'), jpg('orphan'));
    fs.writeFileSync(path.join(sdir, 'x.jpg.123.tmp'), 'half');
    add.push({ ...add[add.length - 1], id: 'ffffffffffff', at: iso(99999) });
    const r = capScreens(sdir, add);
    assert.equal(r.screens, CAPS.screens);
    assert.equal(r.evicted, 5);
    assert.ok(r.removed >= 2, 'the orphan and the half-written file removed');
    indexMatches(sdir);
    const ats = new Set(readIndex(sdir).map((e) => e.at));
    for (let k = 0; k < 5; k++) assert.ok(!ats.has(iso(k)), 'the oldest evicted');
    assert.ok(ats.has(iso(5)) && !ats.has(iso(99999)), 'an entry with no file is dropped');
    const bdir = path.join(d, 'bytes');
    fs.mkdirSync(bdir);
    const big = [];
    for (let k = 0; k < 270; k++) big.push(writeScreen(bdir, jpg('b' + k, 16000), { url: 'https://good.example.org/b' + k, host: 'good.example.org', title: 't', at: iso(k), machine: 'aaaaaaaaaaaa', textBytes: 1, era: 0, shard: '0/1' }));
    const rb = capScreens(bdir, big);
    const onDisk = fs.readdirSync(bdir).reduce((s, n) => s + fs.statSync(path.join(bdir, n)).size, 0);
    assert.ok(onDisk <= CAPS.screensDirBytes, 'the directory fits: ' + onDisk);
    assert.ok(rb.evicted >= 1 && rb.screens + rb.evicted === 270);
    indexMatches(bdir);
    const kept = readIndex(bdir).map((e) => e.at).sort();
    assert.equal(kept[0], iso(rb.evicted), 'the oldest evicted, the newest kept');
    const mdir = path.join(d, 'machines');
    fs.mkdirSync(mdir);
    for (let k = 0; k < CAPS.machines + 3; k++) { const id = sha12('m' + k); fs.writeFileSync(path.join(mdir, id + '.json'), JSON.stringify({ id, at: iso(k) })); }
    fs.writeFileSync(path.join(mdir, '0123456789ab.json'), JSON.stringify({ id: 'ba9876543210', at: iso(0) }));
    fs.writeFileSync(path.join(mdir, 'notanid.json'), '{}');
    fs.writeFileSync(path.join(mdir, 'fedcba987654.json'), 'not json');
    const rm2 = capMachines(mdir);
    assert.deepEqual(rm2, { machines: CAPS.machines, evicted: 3, removed: 3 });
    const left = new Set(fs.readdirSync(mdir));
    assert.equal(left.size, CAPS.machines);
    for (let k = 0; k < 3; k++) assert.ok(!left.has(sha12('m' + k) + '.json'), 'the oldest record evicted');
    assert.ok(left.has(sha12('m3') + '.json'));
  } finally { rm(d); }
});

test('land: a wrong magic, an oversize file, a sha mismatch, a path that climbs out, an off-list url, a missing and an orphan file are refused; the good lands, the index matching', () => {
  const top = tmp();
  try {
    const root = path.join(top, 'root');
    fs.mkdirSync(path.join(root, 'neo'), { recursive: true });
    fs.writeFileSync(path.join(root, 'neo', 'machines-seeds.json'), JSON.stringify({ allowedHosts: HOSTS, urls: [] }));
    const stage = path.join(top, 'stage');
    const a = path.join(stage, 'machine-1-0'), b = path.join(stage, 'machine-1-1');
    fs.mkdirSync(path.join(a, 'machines'), { recursive: true });
    fs.mkdirSync(path.join(b, 'screens'), { recursive: true });
    const put = (dir, name, data) => fs.writeFileSync(path.join(dir, name), data);
    put(path.join(a, 'machines'), 'aaaaaaaaaaaa.json', JSON.stringify({ id: 'aaaaaaaaaaaa', at: '2026-10-02T00:00:00.000Z' }));
    put(path.join(a, 'machines'), 'bbbbbbbbbbbb.json', JSON.stringify({ id: 'cccccccccccc', at: '2026-10-02T00:00:00.000Z' }));
    put(path.join(a, 'machines'), 'notanid.json', JSON.stringify({ id: 'notanid' }));
    put(path.join(a, 'machines'), 'dddddddddddd.json', 'not json');
    put(path.join(a, 'machines'), 'eeeeeeeeeeee.json', JSON.stringify({ id: 'eeeeeeeeeeee', pad: 'x'.repeat(CAPS.machineBytes) }));
    const sd = path.join(b, 'screens');
    const entry = (buf, o = {}) => ({ id: sha12(buf), sha: sha256(buf), url: 'https://good.example.org/x', host: 'good.example.org', title: 'T', at: '2026-10-02T00:00:01.000Z', machine: 'aaaaaaaaaaaa', ...o });
    const good = jpg('good');
    put(sd, sha12(good) + '.jpg', good);
    const magic = Buffer.concat([Buffer.from('GIF89a'), Buffer.alloc(500, 1)]);
    put(sd, sha12(magic) + '.jpg', magic);
    const big = jpg('big', CAPS.screenBytes + 1);
    put(sd, sha12(big) + '.jpg', big);
    const mism = jpg('mismatch');
    put(sd, sha12(mism) + '.jpg', mism);
    const esc = jpg('escape');
    fs.writeFileSync(path.join(sd, '..', '..', 'escape.jpg'), esc);
    const off = jpg('offlist');
    put(sd, sha12(off) + '.jpg', off);
    put(sd, '0123456789ab.jpg', jpg('orphan'));
    const idx = [entry(good), entry(magic), entry(big), entry(mism, { sha: sha256(jpg('other')) }), entry(esc, { id: '../../escape' }),
      entry(off, { url: 'https://evil.example.com/' }), entry(good, { id: 'ffffffffffff', sha: 'f'.repeat(64) })];
    put(sd, 'INDEX.json', JSON.stringify({ screens: idx }));
    const r = land({ from: stage, root });
    assert.equal(r.stages, 2);
    assert.equal(r.machines, 1);
    assert.equal(r.screens, 1);
    assert.deepEqual(r.refusedBy, { json: 1, size: 2, magic: 1, sha: 2, path: 2, host: 1, missing: 1, orphan: 1 });
    assert.equal(r.refused, 11);
    const sdir = path.join(root, 'neo', 'screens');
    assert.deepEqual(fs.readdirSync(sdir).sort(), ['INDEX.json', sha12(good) + '.jpg'].sort());
    indexMatches(sdir);
    assert.deepEqual(fs.readdirSync(path.join(root, 'neo', 'machines')), ['aaaaaaaaaaaa.json']);
    assert.deepEqual(fs.readdirSync(top).sort(), ['root', 'stage'], 'nothing written outside the root');
    assert.deepEqual(fs.readdirSync(path.join(root, 'neo')).sort(), ['machines', 'machines-seeds.json', 'machines.json', 'screens']);
    assert.deepEqual(status(root), { machines: 1, screens: 1, bytes: good.length, hosts: 1, newest: '2026-10-02T00:00:01.000Z' });
    const again = land({ from: stage, root });
    assert.equal(again.kept.screens, 1, 'landing twice keeps one');
    assert.throws(() => land({ from: path.join(top, 'nothing'), root }), /no directory/);
  } finally { rm(top); }
});

// ---------------------------------------------------------------- the step against the fake browser
const E2E = {
  urls: ['https://good.example.org/a', 'http://good.example.org/plain', 'https://evil.example.com/', 'file:///etc/passwd', 'https://good.example.org/redir',
    'https://good.example.org/sub', 'https://other.example.org/check', 'https://other.example.org/again', 'https://good.example.org/popup',
    'https://good.example.org/wander', 'https://good.example.org/long', 'https://good.example.org/big'],
  pages: {
    'https://good.example.org/a': { title: 'Page A', text: 'Alpha text', jpeg: [20000, 9000] },
    'https://good.example.org/redir': { redirect: 'https://evil.example.com/x' },
    'https://good.example.org/sub': { title: 'Sub', text: 'Sub text', sub: ['http://good.example.org/i.png', 'file:///c:/x.png', 'https://cdn.example.net/ok.js'] },
    'https://other.example.org/check': { title: 'Just a moment...', text: 'Checking your browser before accessing', status: 503 },
    'https://good.example.org/popup': { title: 'Popup', text: 'opens a window', popup: true },
    'https://good.example.org/wander': { title: 'Gone', text: 'elsewhere', href: 'https://evil.example.com/landed' },
    'https://good.example.org/long': { title: 'Long', text: 'word '.repeat(2500) },
    'https://good.example.org/big': { title: 'Big', text: 'a heavy screen', jpeg: [30000] },
  },
};

test('a step over the DevTools protocol: the allowlist, every other scheme failed, the off-list redirect, the wandering tab, the bot check left, the popup closed, downloads and permissions denied, nothing typed or clicked, the JPEG cap, the line', async () => {
  const root = treeOf(E2E.urls);
  const f = fakeOf('ok', E2E.pages);
  try {
    const line = await drive(root, f);
    assert.deepEqual(Object.keys(line), LINE_KEYS, 'the shape of the line');
    assert.equal(line.step, 'machine');
    assert.equal(line.state, 'drove');
    assert.equal(line.why, null);
    assert.match(line.machine, /^[0-9a-f]{12}$/);
    assert.equal(line.era, 0);
    assert.equal(line.shard, '0/1');
    assert.equal(line.queue, 9);
    assert.equal(line.slice, 9);
    assert.deepEqual(line.byState, { read: 4, blocked: 2, challenged: 1, left: 1, failed: 1 });
    assert.equal(line.visited, 8);
    assert.equal(line.screens, 4);
    assert.equal(line.challenged, 1);
    assert.deepEqual(line.refusedBy, { url: 0, scheme: 4, host: 1, redirect: 1, method: 0, budget: 0, popup: 1 });
    assert.equal(line.refused, 7);
    assert.equal(line.netBytes, 7000);
    assert.equal(line.browser, 'FakeChrome/1.0');
    assert.equal(line.out, 'neo');
    assert.ok(Number.isInteger(line.cpus) && Number.isInteger(line.memoryBytes) && typeof line.os === 'string' && Number.isInteger(line.ms));
    assert.deepEqual(line.kept, { screens: 4, machines: 1 });
    assert.deepEqual(line.evicted, { screens: 0, machines: 0 });
    const rec = JSON.parse(fs.readFileSync(path.join(root, 'neo', 'machines', line.machine + '.json'), 'utf8'));
    assert.equal(rec.id, line.machine);
    const by = Object.fromEntries(rec.pages.map((p) => [p.url, p]));
    assert.equal(by['https://good.example.org/a'].quality, 40, 'captured again smaller until it fit');
    assert.equal(by['https://good.example.org/redir'].state, 'blocked');
    assert.equal(by['https://good.example.org/redir'].why, 'redirect');
    assert.equal(by['https://good.example.org/wander'].why, 'the tab left the allowlist');
    assert.equal(by['https://other.example.org/check'].why, '^just a moment');
    assert.equal(by['https://other.example.org/again'].state, 'left');
    assert.equal(by['https://good.example.org/long'].textBytes, LIMITS.textChars);
    assert.match(by['https://good.example.org/big'].why, /^no screen: oversize/);
    const sdir = path.join(root, 'neo', 'screens');
    indexMatches(sdir);
    const allow = allowOf(root);
    const idx = readIndex(sdir);
    assert.equal(idx.length, 4);
    for (const e of idx) {
      const b = fs.readFileSync(path.join(sdir, e.id + '.jpg'));
      assert.ok(isJpeg(b) && b.length <= CAPS.screenBytes, 'a JPEG of at most 16 KB');
      assert.equal(sha256(b), e.sha);
      assert.equal(e.machine, line.machine);
      assert.equal(e.shard, '0/1');
      assert.equal(e.era, 0);
      assert.ok(checkUrl(e.url, allow).ok);
    }
    assert.ok(fs.existsSync(path.join(root, 'neo', 'machines.json')), 'the allowlist seeded');
    for (const m of new Set(f.cmds().map((c) => c.method))) assert.ok(ALLOWED.has(m), 'a method the rules allow: ' + m);
    const wheels = f.cmds('Input.dispatchMouseEvent');
    assert.equal(wheels.length, 5);
    assert.ok(wheels.every((c) => c.params.type === 'mouseWheel'), 'one scroll a page, never a click');
    assert.deepEqual(f.cmds('Browser.setDownloadBehavior').map((c) => c.params.behavior), ['deny']);
    const perms = f.cmds('Browser.setPermission');
    assert.deepEqual(perms.map((c) => c.params.permission.name).sort(), [...PERMISSIONS].sort());
    assert.ok(perms.every((c) => c.params.setting === 'denied'));
    assert.equal(f.cmds('Fetch.enable').length, 1);
    for (const c of f.cmds('Fetch.enable')) assert.deepEqual(c.params.patterns, [{ urlPattern: '*', requestStage: 'Request' }]);
    for (const c of f.cmds('Network.setBlockedURLs')) assert.deepEqual(c.params.urls, ['ws://*', 'wss://*']);
    const evals = f.cmds('Runtime.evaluate');
    assert.equal(evals.length, 7, 'every page that loaded is read once; the refused redirect is not');
    for (const c of evals) { assert.equal(c.params.expression, READ_EXPRESSION); assert.equal(c.params.contextId, 7, 'read in an isolated world'); }
    for (const c of f.cmds('Page.navigate')) assert.ok(c.params.url === 'about:blank' || checkUrl(c.params.url, allow).ok, 'navigated only on the list: ' + c.params.url);
    const failed = f.read().filter((e) => e.ev === 'failed').map((e) => e.url).sort();
    assert.deepEqual(failed, ['file:///c:/x.png', 'http://good.example.org/i.png', 'https://evil.example.com/x'], 'failed through the protocol');
    assert.ok(f.read().some((e) => e.ev === 'continued' && e.url === 'https://cdn.example.net/ok.js'));
    assert.deepEqual(f.cmds('Target.closeTarget').map((c) => c.params.targetId), ['PT1'], 'the popup closed');
    const shots = f.cmds('Page.captureScreenshot');
    assert.ok(shots.every((c) => c.params.format === 'jpeg'));
    assert.deepEqual(shots.map((c) => c.params.quality), [55, 40, 55, 55, 55, ...JPEG_LADDER.map((x) => x[0])]);
    assert.deepEqual(await deadWithin(f.pids()), [], 'the browser is dead');
    const profiles = f.profiles();
    assert.equal(profiles.length, 1);
    for (const p of profiles) assert.ok(!fs.existsSync(p), 'the profile is removed: ' + p);
  } finally { reap(f); rm(root); }
});

test('at most one page a second per host, on the step clock (a fake clock), with three tabs at once', async () => {
  const root = treeOf(['https://good.example.org/1', 'https://good.example.org/2', 'https://other.example.org/1']);
  const f = fakeOf('ok');
  const t = fakeTime();
  try {
    const line = await drive(root, f, { tabs: 3, time: t });
    assert.equal(line.screens, 3);
    assert.equal(f.cmds('Target.createTarget').length, 3);
    assert.deepEqual(t.sleeps, [LIMITS.hostGapMs], 'the second page of a host waits its second; the other host does not');
  } finally { reap(f); rm(root); }
});

test('the byte budgets: a page over its budget is stopped and its later requests failed; a step over its budget stops', async () => {
  const urls = [1, 2, 3].map((k) => 'https://good.example.org/heavy' + k);
  const root = treeOf(urls);
  const f = fakeOf('ok', Object.fromEntries(urls.map((u) => [u, { title: 'Heavy', text: 'bytes', bytes: 5000, sub: ['https://good.example.org/late.js'] }])));
  try {
    const line = await drive(root, f, { limits: { pageBytes: 1000, stepBytes: 6000 } });
    assert.equal(line.why, 'the step byte budget is spent');
    assert.equal(line.visited, 2);
    assert.equal(line.refusedBy.budget, 2);
    assert.equal(line.netBytes, 10000);
    assert.ok(f.cmds('Page.stopLoading').length >= 2, 'stopped');
    assert.equal(f.cmds('Page.navigate').filter((c) => c.params.url !== 'about:blank').length, 2);
  } finally { reap(f); rm(root); }
});

test('the time budgets: a page that never loads is left at its own deadline; a step stops at its own (a fake clock)', async () => {
  const root = treeOf(['https://good.example.org/slow', 'https://good.example.org/fine']);
  const f = fakeOf('ok', { 'https://good.example.org/slow': { hang: true } });
  try {
    const line = await step({ root, browser: f.browser, env: ENV, era: 0, shard: { i: 0, n: 1 }, tabs: 1, maxMs: 8000, limits: { settleMs: 0, pageMs: 1500, hostGapMs: 0 } });
    assert.deepEqual(line.byState, { timeout: 1, read: 1 });
    assert.ok(line.ms < 5000, 'the page budget ended it, not the step: ' + line.ms);
  } finally { reap(f); rm(root); }
  const urls = Array.from({ length: 40 }, (_, k) => 'https://' + HOSTS[k % 2] + '/p' + k);
  const root2 = treeOf(urls);
  const f2 = fakeOf('ok');
  try {
    const line = await drive(root2, f2, { maxMs: 20000, time: fakeTime(50) });
    assert.equal(line.why, 'the step deadline');
    assert.ok(line.visited >= 1 && line.visited < line.slice, line.visited + ' of ' + line.slice);
    indexMatches(path.join(root2, 'neo', 'screens'));
  } finally { reap(f2); rm(root2); }
});

test('caps through the workflow route: a step with --out writes nothing under the root, land keeps 600 screens and evicts the oldest; a step into the root does the same', async () => {
  const root = treeOf(['https://good.example.org/n1', 'https://good.example.org/n2']);
  const sdir = path.join(root, 'neo', 'screens');
  fs.mkdirSync(sdir, { recursive: true });
  const old = [];
  for (let k = 0; k < CAPS.screens; k++) old.push(writeScreen(sdir, jpg('old' + k, 300), { url: 'https://good.example.org/old' + k, host: 'good.example.org', title: 'old', at: iso(k), machine: 'aaaaaaaaaaaa', textBytes: 0, era: 0, shard: '0/1' }));
  assert.equal(capScreens(sdir, old).screens, CAPS.screens);
  const index0 = fs.readFileSync(path.join(sdir, 'INDEX.json'), 'utf8');
  const stage = tmp('machine-stage-');
  const f = fakeOf('ok'), g = fakeOf('ok');
  try {
    const out = path.join(stage, 'machine-7-0');
    const line = await drive(root, f, { out });
    assert.equal(line.out, out);
    assert.equal(line.screens, 2);
    assert.ok(!fs.existsSync(path.join(root, 'neo', 'machines.json')) && !fs.existsSync(path.join(root, 'neo', 'machines')), '--out writes nothing under the root');
    assert.equal(fs.readFileSync(path.join(sdir, 'INDEX.json'), 'utf8'), index0);
    const r = land({ from: stage, root });
    assert.deepEqual([r.machines, r.screens, r.refused], [1, 2, 0]);
    assert.equal(r.kept.screens, CAPS.screens);
    assert.equal(r.evicted.screens, 2);
    indexMatches(sdir);
    let ids = new Set(readIndex(sdir).map((e) => e.id));
    assert.ok(!ids.has(old[0].id) && !ids.has(old[1].id) && ids.has(old[2].id));
    const line2 = await drive(root, g);
    assert.equal(line2.out, 'neo');
    assert.deepEqual(line2.kept, { screens: CAPS.screens, machines: 2 });
    assert.equal(line2.evicted.screens, 2);
    indexMatches(sdir);
    ids = new Set(readIndex(sdir).map((e) => e.id));
    assert.ok(!ids.has(old[2].id) && !ids.has(old[3].id) && ids.has(old[4].id));
    assert.equal(status(root).screens, CAPS.screens);
  } finally { reap(f); reap(g); rm(stage); rm(root); }
});

test('no browser: `skipped` with why, the computer still recorded; the CLI prints one JSON line last and exits 0', async () => {
  const root = treeOf(['https://good.example.org/a']);
  try {
    const a = await step({ root, browser: 'none', env: ENV });
    assert.deepEqual(Object.keys(a), LINE_KEYS);
    assert.equal(a.state, 'skipped');
    assert.match(a.why, /--browser none/);
    assert.equal(a.browser, null);
    assert.equal(a.screens, 0);
    const b = await step({ root, env: {}, platform: process.platform === 'win32' ? 'linux' : 'win32' });
    assert.equal(b.state, 'skipped');
    assert.match(b.why, /no Chrome, Chromium or Edge on this computer/);
    for (const l of [a, b]) assert.ok(fs.existsSync(path.join(root, 'neo', 'machines', l.machine + '.json')));
    assert.equal(findBrowser({ env: {}, platform: 'linux', exists: () => false }), null);
    assert.deepEqual(findBrowser({ env: { CHROME_PATH: '/x/chrome' }, platform: 'linux', exists: (p) => p === '/x/chrome' }), { path: '/x/chrome', pre: [] });
    const cli = await run(['step', '--browser', 'none', '--root', root, '--out', path.join(root, 'stage'), '--era', '4', '--shard', '2/5']);
    assert.equal(cli.code, 0, cli.stderr);
    const lines = cli.stdout.trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    assert.deepEqual(Object.keys(last), LINE_KEYS);
    assert.equal(last.state, 'skipped');
    assert.equal(last.shard, '2/5');
    assert.equal(last.era, 4);
    assert.ok(fs.existsSync(path.join(root, 'stage', 'machines', last.machine + '.json')));
  } finally { rm(root); }
});

test('CLI: usage errors exit 2 with the usage; status prints its five keys; land of nothing exits 1', async () => {
  const root = treeOf(['https://good.example.org/a']);
  try {
    for (const argv of [['step', '--shard', '3/3'], ['step', '--shard', '0/257'], ['step', '--max-ms', '10'], ['step', '--era', 'x'], ['step', '--bogus'], ['step', 'extra'],
      ['step', '--tabs', '9'], ['step', '--browser', path.join(root, 'no-such-browser.exe')], ['land'], ['status', '--from', 'x'], ['frob']]) {
      const r = await run(argv);
      assert.equal(r.code, 2, argv.join(' ') + ': ' + r.stderr);
      assert.match(r.stderr, /usage: node grow\/machine\.mjs/);
    }
    const h = await run(['--help']);
    assert.equal(h.code, 0);
    assert.match(h.stdout, /step \[--max-ms/);
    const s = await run(['status', '--root', root]);
    assert.equal(s.code, 0, s.stderr);
    assert.deepEqual(Object.keys(JSON.parse(s.stdout.trim())), ['machines', 'screens', 'bytes', 'hosts', 'newest']);
    const l = await run(['land', '--from', path.join(root, 'nothing'), '--root', root]);
    assert.equal(l.code, 1);
    assert.match(l.stderr, /no directory/);
  } finally { rm(root); }
});

test('a browser that hangs: its whole process tree is killed and its profile removed, whether it never opens its endpoint or never answers', async () => {
  for (const [mode, limits, re] of [
    ['silent', { launchMs: 1500 }, /^no DevTools endpoint in 1500 ms/],
    ['hang', { cmdMs: 1000 }, /^the browser did not answer the protocol: Browser\.getVersion: no answer in 1000 ms/],
  ]) {
    const root = treeOf(['https://good.example.org/a']);
    const f = fakeOf(mode);
    try {
      const line = await step({ root, browser: f.browser, env: ENV, maxMs: 60000, limits: { settleMs: 0, ...limits } });
      assert.deepEqual(Object.keys(line), LINE_KEYS);
      assert.equal(line.state, 'skipped', mode);
      assert.match(line.why, re);
      const pids = f.pids();
      assert.equal(pids.length, 2, mode + ': the browser and its child started');
      assert.deepEqual(await deadWithin(pids), [], mode + ': the whole tree is dead');
      for (const p of f.profiles()) assert.ok(!fs.existsSync(p), mode + ': the profile is removed');
    } finally { reap(f); rm(root); }
  }
});

test('the exit path: a process that exits in the middle of a step still kills its browser tree and removes its profile', async () => {
  const root = treeOf(['https://good.example.org/a']);
  const f = fakeOf('hang');
  const d = tmp('machine-driver-');
  try {
    const driver = path.join(d, 'driver.mjs');
    fs.writeFileSync(driver, [
      'import { step } from ' + JSON.stringify(pathToFileURL(MACHINE).href) + ';',
      'const [root, fake, scen, ms] = process.argv.slice(2);',
      'setTimeout(() => process.exit(0), Number(ms));',
      "await step({ root, out: root + '/out', browser: { path: process.execPath, pre: [fake, scen] }, env: { ...process.env }, maxMs: 120000, limits: { cmdMs: 60000, settleMs: 0 } });",
      "console.log('the step ended first');",
    ].join('\n'));
    const r = await new Promise((resolve) => execFile(process.execPath, [driver, root, FAKE, f.file, '3000'], { env: ENV, timeout: 60000, windowsHide: true }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout: String(stdout), stderr: String(stderr) })));
    assert.equal(r.code, 0, r.stderr);
    assert.ok(!r.stdout.includes('the step ended first'), 'the exit came in the middle of the step');
    const pids = f.pids();
    assert.equal(pids.length, 2, 'the browser and its child started');
    assert.deepEqual(await deadWithin(pids), [], 'the whole tree is dead');
    const profiles = f.profiles();
    assert.equal(profiles.length, 1);
    assert.ok(!fs.existsSync(profiles[0]), 'the profile is removed');
  } finally { reap(f); rm(d); rm(root); }
});

test('a browser that exits at start: skipped with its last words; on a CI linux computer whose kernel refuses the sandbox, started once more without it', async () => {
  const root = treeOf(['https://good.example.org/a']);
  const f = fakeOf('exit');
  try {
    const line = await step({ root, browser: f.browser, env: { ...ENV, CI: 'true' }, platform: 'linux', maxMs: 60000, limits: { settleMs: 0 } });
    assert.equal(line.state, 'skipped');
    assert.match(line.why, /^the browser exited before its DevTools endpoint: \[0:ERROR\] something failed: no sandbox/);
    const starts = f.read().filter((e) => e.ev === 'start');
    assert.equal(starts.length, 2);
    assert.ok(!starts[0].args.includes('--no-sandbox') && starts[1].args.includes('--no-sandbox'));
    assert.ok(starts[0].args.includes('--headless=new') && starts[0].args.includes('--remote-debugging-port=0'));
    for (const p of f.profiles()) assert.ok(!fs.existsSync(p));
  } finally { reap(f); rm(root); }
});

// ---------------------------------------------------------------- mutants
/** [name, the source text, what it becomes]: each breaks one rule; this file must fail on each. */
const MUTANTS = [
  ['http taken', "  if (x.protocol !== 'https:') return { ok: false, why: 'scheme' };\n  if (x.username", '  if (x.username'],
  ['any host', "  if (!allow || !allow.hosts || !allow.hosts.has(host)) return { ok: false, why: 'host' };\n", ''],
  ['off-list top level continues', "    if (!checkUrl(x.href, allow).ok) return { action: 'fail', why: params.redirectedRequestId ? 'redirect' : 'host' };\n", ''],
  ['other schemes continue', "  if (x.protocol !== 'https:') return { action: 'fail', why: 'scheme' };\n  const top", '  const top'],
  ['a POST continues', "    if (String(req.method || 'GET').toUpperCase() !== 'GET') return { action: 'fail', why: 'method' };\n", ''],
  ['a bot check read', '    if (ch) {', '    if (false) {'],
  ['a challenged host visited again', 'if (challengedHosts.has(c.host))', 'if (false)'],
  ['no host gap', 'nextAt.set(c.host, slot + limits.hostGapMs);', 'nextAt.set(c.host, slot);'],
  ['a JPEG over the cap kept', 'if (b.length <= CAPS.screenBytes) { jpeg = b;', 'if (b.length > 0) { jpeg = b;'],
  ['ten screens over the cap', 'all.length > CAPS.screens ||', 'all.length > CAPS.screens + 10 ||'],
  ['ten records over the cap', 'while (rows.length > CAPS.machines)', 'while (rows.length > CAPS.machines + 10)'],
  ['an index entry with no file', 'if (!st || !st.isFile()) continue;', 'if (!st) { byId.set(e.id, entryOf(e)); continue; }'],
  ['slices overlap', 'queue.filter((_, p) => p % n === i)', 'queue.filter((_, p) => p % n <= i)'],
  ['land takes a wrong magic', 'if (!isJpeg(b)) { refused.magic++; continue; }', ''],
  ['land takes an oversize screen', 'if (ls.size > CAPS.screenBytes) { refused.size++; continue; }', ''],
  ['land takes a sha mismatch', 'e.sha !== sha || ', ''],
  ['land takes a path that climbs', 'if (!ID_RE.test(id)) { refused.path++; continue; }', ''],
  ['land takes an off-list url', 'if (!checkUrl(e.url, allow).ok) { refused.host++; continue; }', ''],
  ['a killed hang named an exit', 'const died = exited;', 'const died = true;'],
  ['nothing killed','  if (!Number.isInteger(pid) || pid <= 0) return;\n', '  return;\n'],
  ['the profile kept', 'try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 150 }); } catch { /* reported below */ }', 'void 0;'],
  ['downloads allowed', "{ behavior: 'deny' }", "{ behavior: 'allow' }"],
  ['permissions granted', "setting: 'denied'", "setting: 'granted'"],
  ['a click', "type: 'mouseWheel'", "type: 'mousePressed', button: 'left', clickCount: 1"],
  ['sockets open', "{ urls: ['ws://*', 'wss://*'] }", '{ urls: [] }'],
  ['a refused request continues', "tab.send('Fetch.failRequest', { requestId: p.requestId, errorReason: 'BlockedByClient' })", "tab.send('Fetch.continueRequest', { requestId: p.requestId })"],
  ['a popup kept', "if (t.type === 'page' && t.openerId && !ours.has(t.targetId))", 'if (false)'],
  ['a wandering tab read', 'if (pg.blocked || (read.href && !checkUrl(read.href, allow).ok))', 'if (pg.blocked)'],
  ['read in the page world', '...(contextId ? { contextId } : {})', ''],
  ['text unbounded', 'text: str(o.text, LIMITS.textChars)', 'text: str(o.text, 1e9)'],
  ['no step byte budget', 'if (counts.netBytes > limits.stepBytes) stepOver = true;', ''],
  ['no page byte budget', 'if (pg.bytes > limits.pageBytes && !pg.over)', 'if (false)'],
  ['no page time budget', 'const pageEnd = Math.min(t0 + limits.pageMs, deadline - limits.reserveMs);', 'const pageEnd = deadline - limits.reserveMs;'],
  ['no step deadline', "if (left() <= limits.reserveMs + limits.minPageMs) { res.why = 'the step deadline'; return; }", ''],
  ['no browser drives', "    state = 'skipped';\n    why = o.browser === 'none'", "    state = 'drove';\n    why = o.browser === 'none'"],
];

test('mutants: each rule, budget, cap, slice and land check, broken one at a time in a temp tree, fails this file (MACHINE_MUTANTS=1)', { skip: process.env.MACHINE_MUTANTS === '1' ? false : 'set MACHINE_MUTANTS=1', timeout: 3600000 }, async () => {
  const src = fs.readFileSync(MACHINE, 'utf8');
  for (const [name, from] of MUTANTS) assert.equal(src.split(from).length, 2, 'the site of the mutant is in the source exactly once: ' + name);
  const self = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const seeds = fs.readFileSync(path.join(ROOT, 'neo', 'machines-seeds.json'), 'utf8');
  const runTree = (code) => new Promise((resolve) => {
    const d = tmp('machine-mutant-');
    for (const x of ['grow', 'test', 'neo']) fs.mkdirSync(path.join(d, x));
    fs.writeFileSync(path.join(d, 'grow', 'machine.mjs'), code);
    fs.writeFileSync(path.join(d, 'test', 'grow-machine.test.mjs'), self);
    fs.writeFileSync(path.join(d, 'neo', 'machines-seeds.json'), seeds);
    execFile(process.execPath, ['--test', '--test-reporter=dot', path.join(d, 'test', 'grow-machine.test.mjs')], { cwd: d, env: ENV, timeout: 300000, maxBuffer: 1 << 24, windowsHide: true }, (err, stdout, stderr) => {
      rm(d);
      resolve({ failed: Boolean(err), tail: String(stdout + stderr).slice(-1500) });
    });
  });
  const [control, canary] = await Promise.all([runTree(src), runTree(src + "\nthrow new Error('canary');\n")]);
  assert.equal(control.failed, false, 'the unbroken copy passes in its own tree: ' + control.tail);
  assert.equal(canary.failed, true, 'a copy that cannot load fails: the harness sees a failure');
  let killed = 0;
  const survived = [];
  for (let k = 0; k < MUTANTS.length; k += 5) {
    const batch = MUTANTS.slice(k, k + 5);
    const res = await Promise.all(batch.map(([, from, to]) => runTree(src.replace(from, () => to))));
    res.forEach((r, j) => { if (r.failed) killed++; else survived.push(batch[j][0]); });
  }
  console.log('killed ' + killed + ' of ' + MUTANTS.length);
  assert.deepEqual(survived, [], 'every mutant is killed');
});
