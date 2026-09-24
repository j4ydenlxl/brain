// cli/control.mjs: THE LIVE CONTROL PLANE. His manual asks to pause computation, inspect
// state, replay events and compare versions. A brain that is ticking cannot be inspected by
// loading its snapshot, because the snapshot is already stale, so `run` opens a loopback
// HTTP server and writes host, port and a token to state/<name>/control.json. Every other
// command looks for that file first and talks to the running organism; with no live brain it
// falls back to the snapshot. Node's built in http only, no dependency.
import http from 'node:http';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export const CONTROL_OPS = Object.freeze([
  'health', 'status', 'inspect', 'inject', 'tick', 'pause', 'resume', 'step',
  'snapshot', 'proposals', 'approve', 'reject', 'propose', 'ledger', 'trace', 'stop',
]);

// ---------------------------------------------------------------- server side
export async function startControl({ dir, name, handler, port = 0, host = '127.0.0.1' }) {
  const token = randomBytes(16).toString('hex');
  const file = path.join(dir, 'control.json');

  const server = http.createServer((req, res) => {
    const send = (code, body) => {
      const text = JSON.stringify(body);
      res.writeHead(code, { 'content-type': 'application/json', 'content-length': Buffer.byteLength(text), connection: 'close' });
      res.end(text);
    };
    const url = new URL(req.url, 'http://127.0.0.1');
    if (req.method === 'GET' && url.pathname === '/health') {
      Promise.resolve().then(() => handler('health', {}))
        .then((r) => send(200, { ok: true, result: { name, pid: process.pid, ...r } }))
        .catch((e) => send(500, { ok: false, error: String(e && e.message || e) }));
      return;
    }
    if (req.method !== 'POST' || url.pathname !== '/rpc') return send(404, { ok: false, error: 'POST /rpc or GET /health' });
    if (req.headers['x-brain-token'] !== token) return send(403, { ok: false, error: 'bad or missing x-brain-token' });
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (c) => { body += c; if (body.length > 8_000_000) { req.destroy(); } });
    req.on('end', () => {
      let msg;
      try { msg = JSON.parse(body || '{}'); } catch (e) { return send(400, { ok: false, error: 'bad JSON body: ' + e.message }); }
      if (!CONTROL_OPS.includes(msg.op)) return send(400, { ok: false, error: 'unknown op ' + msg.op + ' (have: ' + CONTROL_OPS.join(', ') + ')' });
      Promise.resolve().then(() => handler(msg.op, msg.args || {}))
        .then((result) => send(200, { ok: true, result }))
        .catch((e) => send(200, { ok: false, error: String(e && e.message || e) }));
    });
  });
  server.on('connection', (s) => s.unref());

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => { server.removeListener('error', reject); resolve(); });
  });
  const actual = server.address().port;
  const info = { name, pid: process.pid, host, port: actual, url: 'http://' + host + ':' + actual, token, started: new Date().toISOString(), node: process.version };
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(info, null, 2) + '\n');

  return {
    ...info,
    server,
    close: () => new Promise((resolve) => {
      try { rmSync(file, { force: true }); } catch { /* already gone */ }
      server.close(() => resolve());
      server.closeAllConnections?.();
    }),
  };
}

// ---------------------------------------------------------------- client side
export function readControlFile(dir) {
  const file = path.join(dir, 'control.json');
  if (!existsSync(file)) return null;
  try {
    const j = JSON.parse(readFileSync(file, 'utf8'));
    if (!j || !j.port || !j.token) return null;
    return j;
  } catch { return null; }
}

function request(info, method, pathname, body, timeout) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.from(JSON.stringify(body));
    const req = http.request({
      host: info.host || '127.0.0.1', port: info.port, method, path: pathname, agent: false,
      headers: {
        'x-brain-token': info.token,
        ...(payload ? { 'content-type': 'application/json', 'content-length': payload.length } : {}),
      },
    }, (res) => {
      let text = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { text += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(text)); } catch (e) { reject(new Error('control plane sent non JSON (' + res.statusCode + '): ' + text.slice(0, 200))); }
      });
    });
    req.setTimeout(timeout, () => { req.destroy(Object.assign(new Error('control plane timed out after ' + timeout + 'ms'), { code: 'ETIMEDOUT' })); });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

// Returns a client for a live brain, or null. A control.json whose port refuses the
// connection is a leftover from a killed process and is deleted on the spot.
export async function connect(dir, { timeout = 1500, cleanStale = true } = {}) {
  const info = readControlFile(dir);
  if (!info) return null;
  try {
    const h = await request(info, 'GET', '/health', null, timeout);
    if (!h || !h.ok) return null;
    return {
      info, health: h.result,
      async rpc(op, args = {}, rpcTimeout = 30_000) {
        const r = await request(info, 'POST', '/rpc', { op, args }, rpcTimeout);
        if (!r.ok) throw new Error(r.error);
        return r.result;
      },
    };
  } catch (e) {
    const dead = e.code === 'ECONNREFUSED' || e.code === 'ECONNRESET' || e.code === 'EHOSTUNREACH';
    if (dead && cleanStale) { try { rmSync(path.join(dir, 'control.json'), { force: true }); } catch { /* raced with the owner */ } }
    return null;
  }
}
