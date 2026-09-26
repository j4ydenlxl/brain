// api/ask.mjs: THE VERCEL FUNCTION at dilation.dev/api/ask (queue item 12, docs/CLOUD-SESSION.md).
// Author: board 18 builder.
//
// A thin shell around act/ask-http.mjs handle(): it reads the body, names the client address, calls
// the handler and writes its status, headers and JSON. Same origin only: no Access-Control-Allow-Origin
// header is ever written, so another site's page cannot read an answer; the OPTIONS answer is 204
// with Allow and nothing else. The model cell reads BRAIN_LLM_BASE, BRAIN_LLM_KEY and BRAIN_LLM_MODEL
// from the project's environment by NAME inside act/llm.mjs; this file never touches a value.
//
// Vercel's Node helpers may have read and parsed the body already (req.body): a parse error there is
// a 400 here, an object is handed on as it is, and a raw stream is read with a byte cap.
import { handle, LIMITS } from '../act/ask-http.mjs';

async function readBody(req) {
  let parsed, threw = false;
  try { parsed = req.body; } catch { threw = true; }
  if (threw) return '\u0000 the platform refused the body as JSON';
  if (parsed !== undefined && parsed !== null) return parsed;
  if (req.readableEnded || req.complete && !req.readable) return '';
  const chunks = [];
  let n = 0;
  for await (const c of req) {
    n += c.length;
    if (n > LIMITS.bodyBytes) return 'x'.repeat(LIMITS.bodyBytes + 1);
    chunks.push(c);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function clientIp(req) {
  // Vercel's edge sets x-forwarded-for (the client first) and x-real-ip; the socket is the edge
  const f = req.headers['x-forwarded-for'];
  const first = (Array.isArray(f) ? f[0] : String(f || '')).split(',')[0].trim();
  return first || String(req.headers['x-real-ip'] || '') || (req.socket && req.socket.remoteAddress) || 'unknown';
}

export default async function askFunction(req, res) {
  let out;
  try {
    const method = String(req.method || 'GET').toUpperCase();
    const body = method === 'POST' ? await readBody(req) : undefined;
    out = await handle({ method, headers: req.headers, body, ip: clientIp(req) });
  } catch (e) {
    out = { status: 500, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }, json: { ok: false, error: 'the function failed: ' + String(e && e.message || e).split('\n')[0].slice(0, 200) } };
  }
  res.statusCode = out.status;
  for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
  if (out.json === null || String(req.method).toUpperCase() === 'HEAD') return res.end();
  res.end(JSON.stringify(out.json));
}
