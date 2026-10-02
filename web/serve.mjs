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
//
// THE HOST'S RULES, MIRRORED. vercel.json sets cleanUrls true and trailingSlash false, so the host serves /ask (a
// directory) with its index.html and no redirect, and redirects /ask/ to /ask with a 308; its exact-source headers
// (Service-Worker-Allowed "/" and Cache-Control no-cache on /ask/sw.js) let the pocket's worker take the scope /.
// This server reads the same vercel.json (hostRules) and does the same for the paths in NO_SLASH and every exact
// source; a source with a pattern is not mirrored. Every other directory keeps its 301 to the slash, because its page
// links relative to it (the ladder).
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const DIST = path.resolve(HERE, 'dist');
export const VERCEL_JSON = path.resolve(HERE, '..', 'vercel.json');
/** The directories served at their bare path, as the host does with trailingSlash false; the slashed path answers 308. */
export const NO_SLASH = Object.freeze(['/ask']);
const TYPES = {   '.mjs': 'text/javascript; charset=utf-8', '.webmanifest': 'application/manifest+json',
'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

export function defaultHealthUrl(env = process.env) {
  return 'http://127.0.0.1:' + (Number(env.HEALTH_PORT) || 8080) + '/health';
}

const EXACT = /^\/[^:*()?+{}[\]\\]*$/;
/** vercel.json's exact-source headers as [{ source, headers: { lowercased key: value } }]; never throws (none on any error). */
export function hostRules(file = VERCEL_JSON) {
  let v;
  try { v = JSON.parse(readFileSync(file, 'utf8')); } catch { return { headers: [] }; }
  const headers = [];
  for (const h of Array.isArray(v && v.headers) ? v.headers : []) {
    if (!h || typeof h.source !== 'string' || !EXACT.test(h.source) || !Array.isArray(h.headers)) continue;
    const kv = {};
    for (const x of h.headers) if (x && typeof x.key === 'string' && typeof x.value === 'string' && /^[A-Za-z0-9-]+$/.test(x.key)) kv[x.key.toLowerCase()] = x.value;
    headers.push({ source: h.source, headers: kv });
  }
  return { headers };
}

/** The headers the rules add to a 200 on this path (an exact source equals the path). */
export function headersFor(pathname, rules) {
  const out = {};
  for (const h of (rules && rules.headers) || []) if (h.source === pathname) Object.assign(out, h.headers);
  return out;
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
export function startSite({ port = 8790, host = '127.0.0.1', dist = DIST, healthUrl = defaultHealthUrl(), rules = hostRules() } = {}) {
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
    if (u.pathname.length > 1 && u.pathname.endsWith('/') && NO_SLASH.includes(u.pathname.slice(0, -1))) {
      res.writeHead(308, { location: u.pathname.slice(0, -1) + u.search }); return res.end();
    }
    let rel;
    try { rel = decodeURIComponent(u.pathname); } catch { return send(400, 'text/plain', 'bad path'); }
    const file = path.resolve(dist, '.' + rel);
    if (file !== dist && !file.startsWith(dist + path.sep)) return send(403, 'text/plain', 'outside the site');
    let target = file;
    try {
      if ((await stat(file)).isDirectory()) {
        // a directory without its slash would break the page's relative links
        if (!u.pathname.endsWith('/') && !NO_SLASH.includes(u.pathname)) { res.writeHead(301, { location: u.pathname + '/' }); return res.end(); }
        target = path.join(file, 'index.html');
      }
      const body = await readFile(target);
      res.writeHead(200, { 'content-type': TYPES[path.extname(target)] || 'application/octet-stream', 'cache-control': 'no-store', ...headersFor(u.pathname, rules), 'content-length': body.length });
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
