// web/serve.mjs: the built site on this machine, with the daemon's health beside it.
//
// The organism page's live view asks for "health" on its own origin. On dilation.dev nothing
// answers there, so the view reads "daemon not running", which is true: no daemon is deployed.
// Here, this server serves web/dist and answers GET /health by asking the daemon's own health
// endpoint (daemon/health.mjs, started by bin/serve.mjs on HEALTH_PORT, 8080 by default) and
// passing its JSON through unchanged. A browser cannot read that endpoint directly from another
// port (it sends no CORS header), and this keeps it that way: the proxy is same origin, loopback
// only, GET only, and /health only. It never forwards /duplicate or anything else.
//
//   node web/serve.mjs [--port 8790] [--health http://127.0.0.1:8080/health]
//
// When the daemon's endpoint does not answer, /health returns 502 with ok false and the reason,
// and the page prints "daemon not running" with that reason beneath it.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'dist');
const TYPES = {   '.mjs': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json',
'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

export function defaultHealthUrl(env = process.env) {
  return 'http://127.0.0.1:' + (Number(env.HEALTH_PORT) || 8080) + '/health';
}

/** Ask the daemon's endpoint once; resolve { status, body } and never throw. */
export async function proxyHealth(healthUrl, timeoutMs = 2000) {
  try {
    const r = await fetch(healthUrl, { signal: AbortSignal.timeout(timeoutMs), redirect: 'error' });
    const text = await r.text();
    JSON.parse(text); // pass through only what parses
    return { status: r.status, body: text };
  } catch (e) {
    const why = (e && e.cause && e.cause.code) || (e && e.name === 'TimeoutError' ? 'timed out after ' + timeoutMs + ' ms' : String((e && e.message) || e).split('\n')[0]);
    return { status: 502, body: JSON.stringify({ ok: false, error: 'the daemon health endpoint did not answer: ' + why, from: healthUrl }) };
  }
}

/** Start the server. Resolves once listening; close() ends it and every open connection. */
export function startSite({ port = 8790, host = '127.0.0.1', dist = DIST, healthUrl = defaultHealthUrl() } = {}) {
  const server = http.createServer(async (req, res) => {
    const send = (status, type, body) => {
      res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'content-length': Buffer.byteLength(body) });
      res.end(body);
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(405, 'text/plain', 'GET only');
    let u;
    try { u = new URL(req.url, 'http://x'); } catch { return send(400, 'text/plain', 'bad url'); }
    if (u.pathname === '/health') {
      const h = await proxyHealth(healthUrl);
      return send(h.status, 'application/json', h.body);
    }
    let rel;
    try { rel = decodeURIComponent(u.pathname); } catch { return send(400, 'text/plain', 'bad path'); }
    const file = path.resolve(dist, '.' + rel);
    if (file !== dist && !file.startsWith(dist + path.sep)) return send(403, 'text/plain', 'outside the site');
    let target = file;
    try {
      if ((await stat(file)).isDirectory()) {
        // a directory without its slash would break the page's relative links
        if (!u.pathname.endsWith('/')) { res.writeHead(301, { location: u.pathname + '/' }); return res.end(); }
        target = path.join(file, 'index.html');
      }
      const body = await readFile(target);
      res.writeHead(200, { 'content-type': TYPES[path.extname(target)] || 'application/octet-stream', 'cache-control': 'no-store', 'content-length': body.length });
      return res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      return send(404, 'text/plain', 'not found');
    }
  });
  server.keepAliveTimeout = 1000;
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const a = server.address();
      resolve({ server, port: a.port, url: 'http://' + host + ':' + a.port + '/', healthUrl,
        close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }) });
    });
  });
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  const s = await startSite({ port: Number(arg('--port')) || 8790, healthUrl: arg('--health') || defaultHealthUrl() });
  console.log('serving ' + DIST + ' at ' + s.url + ' (ladder at ' + s.url + 'ladder/); /health asks ' + s.healthUrl);
}
