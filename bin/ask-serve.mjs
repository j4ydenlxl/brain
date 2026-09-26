#!/usr/bin/env node
// bin/ask-serve.mjs: THE SITE AND ITS ASK ON THIS HOST (queue item 12, docs/CLOUD-SESSION.md).
// Author: board 18 builder.
//
// node bin/ask-serve.mjs [--port 0] [--static]
//
// Mounts act/ask-http.mjs handle() at /api/ask on node:http, bound to 127.0.0.1 only (never 0.0.0.0),
// and serves the built web/dist beside it with the site's clean urls (/ask serves ask/index.html), so
// the page and the function run together here the way Vercel serves them on dilation.dev. Prints one
// line, `ask-serve http://127.0.0.1:PORT`, and exits on SIGINT or SIGTERM. --static leaves /api/ask
// unmounted (404): the control the bench runs with the server half off.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'web', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
const BODY_CAP = 64 * 1024;

function readBody(req) {
  return new Promise((ok) => {
    const chunks = [];
    let n = 0, over = false;
    req.on('data', (c) => { n += c.length; if (n > BODY_CAP) over = true; else chunks.push(c); });
    req.on('end', () => ok(over ? 'x'.repeat(BODY_CAP + 1) : Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => ok(''));
  });
}

function serveStatic(req, res) {
  let u;
  try { u = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }
  let f = path.resolve(DIST, '.' + u);
  if (f !== DIST && !f.startsWith(DIST + path.sep)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
  if (!fs.existsSync(f)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' });
  fs.createReadStream(f).pipe(res);
}

/** The server, not yet listening. opts: { static: true } leaves /api/ask unmounted. */
export async function createAskServer(opts = {}) {
  const handle = opts.static ? null : (opts.handle || (await import('../act/ask-http.mjs')).handle);
  return http.createServer(async (req, res) => {
    const p = new URL(req.url, 'http://x').pathname;
    if (p === '/api/ask' || p === '/api/ask/') {
      if (!handle) { res.writeHead(404, { 'content-type': 'application/json' }); return res.end('{"ok":false,"error":"the server half is off (--static)"}'); }
      const method = String(req.method || 'GET').toUpperCase();
      const body = method === 'POST' ? await readBody(req) : undefined;
      let out;
      try { out = await handle({ method, headers: req.headers, body, ip: req.socket.remoteAddress }); } catch (e) {
        out = { status: 500, headers: { 'content-type': 'application/json' }, json: { ok: false, error: String(e && e.message || e).split('\n')[0] } };
      }
      res.writeHead(out.status, out.headers);
      return res.end(out.json === null || method === 'HEAD' ? undefined : JSON.stringify(out.json));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
    serveStatic(req, res);
  });
}

async function main(argv) {
  const i = argv.indexOf('--port');
  const port = i >= 0 ? Number(argv[i + 1]) : 0;
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('--port takes 0 to 65535');
  const server = await createAskServer({ static: argv.includes('--static') });
  await new Promise((ok) => server.listen(port, '127.0.0.1', ok));
  console.log('ask-serve http://127.0.0.1:' + server.address().port + (argv.includes('--static') ? ' (static: /api/ask off)' : ''));
  const stop = () => { server.close(); server.closeAllConnections && server.closeAllConnections(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

const SELF = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === SELF) main(process.argv.slice(2)).catch((e) => { console.error(e && e.stack || e); process.exit(2); });
