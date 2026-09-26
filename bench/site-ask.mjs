// bench/site-ask.mjs: THE PROMPT BOX, ASKED FROM A REAL BROWSER (queue item 12, docs/CLOUD-SESSION.md).
//
// The bar, as the brief writes it: from a browser on dilation.dev, "what is 17 times 23" answers 391
// with provenance exact, and a novel question answers with its route printed; both recorded in
// bench/verdicts/site-ask.json. This bench opens the page in Chromium (Playwright), types every prompt
// web/ask.mjs offers into the box, presses Enter, and reads what the PAGE printed: the answer, the
// route, the provenance and the nanoseconds per ask the page measured on this device. Each answer is
// compared with act/solve.mjs solve() run here in node on the same prompt (the CLI parity: the page
// runs the same bytes, so a difference is a defect). The page must make no request after it loads:
// every request the browser makes after the load event is counted and must be 0.
//
// With --url on the host dilation.dev the verdict is bench/verdicts/site-ask.json (isTheBar true).
// Without --url the built web/dist is served from 127.0.0.1 and the verdict is
// bench/verdicts/site-ask-local.json (isTheBar false): the same page, not yet the live site.
//
//   node bench/site-ask.mjs [--url https://dilation.dev/ask]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { solve } from '../act/solve.mjs';
import { EXAMPLES } from '../web/ask.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'web', 'dist');
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const say = (s) => console.log(s);
const NOVEL = 'write a poem about the sea';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml' };

async function playwright() {
  try { return await import('playwright'); } catch { /* not local */ }
  const root = execSync('npm root -g', { encoding: 'utf8' }).trim();
  const req = createRequire(path.join(root, 'noop.js'));
  return import(pathToFileURL(req.resolve('playwright')).href);
}

/** web/dist on 127.0.0.1 with the site's clean urls (/ask serves ask/index.html). */
function serveDist() {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(DIST, u);
    if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    else if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f += '.html';
    if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

async function main() {
  const at = new Date().toISOString();
  let url = arg('url'), server = null;
  if (!url) { server = await serveDist(); url = 'http://127.0.0.1:' + server.address().port + '/ask'; }
  const live = /(^|\.)dilation\.dev$/.test(new URL(url).hostname);
  const pw = await playwright();
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__brainAsk && window.__brainAsk.ready, null, { timeout: 15000 });
  let after = 0;
  page.on('request', () => { after++; });
  const browserUA = await page.evaluate(() => navigator.userAgent);
  const rows = [];
  for (const q of EXAMPLES) {
    const n0 = await page.locator('#term .entry:not(#hello)').count();
    await page.fill('#q', q);
    await page.press('#q', 'Enter');
    await page.waitForFunction((n) => document.querySelectorAll('#term .entry:not(#hello)').length > n, n0, { timeout: 30000 });
    const got = await page.evaluate(() => {
      const e = [...document.querySelectorAll('#term .entry')].pop();
      const a = e.querySelector('.ans'), f = e.querySelector('[data-route]'), ns = e.querySelector('[data-ns]');
      return { answer: a ? a.dataset.answer : null, route: f ? f.dataset.route : null, provenance: f ? f.dataset.provenance : null, ns: ns ? Number(ns.dataset.ns) : null, text: e.innerText };
    });
    const cli = solve(q);
    const parity = (cli ? cli.answer : null) === got.answer;
    rows.push({ prompt: q, answer: got.answer, route: got.route, provenance: got.provenance, nsPerAsk: got.ns, cli: cli ? cli.answer : null, cliMethod: cli ? cli.method : null, parity, lines: got.text.split('\n').slice(0, 12) });
    say((got.answer !== null ? 'ANSWERED ' + got.answer : 'REFUSED') + '  route ' + got.route + '  provenance ' + got.provenance + (got.ns !== null ? '  ' + got.ns + ' ns per ask' : '') + '  cli ' + (cli ? cli.answer : 'null') + (parity ? '' : '  PARITY MISSED') + '  :: ' + q.slice(0, 70));
  }
  await browser.close();
  if (server) server.close();
  const r17 = rows.find((r) => r.prompt === 'what is 17 times 23');
  const novel = rows.find((r) => r.prompt === NOVEL);
  const met = {
    exact391: !!r17 && r17.answer === '391' && r17.provenance === 'exact' && Number.isFinite(r17.nsPerAsk),
    novelRoutePrinted: !!novel && novel.answer === null && novel.route === 'refused' && novel.lines.some((l) => /route/.test(l)),
    parity: rows.every((r) => r.parity),
    noRequestAfterLoad: after === 0,
    noPageErrors: errors.length === 0,
  };
  const barMet = Object.values(met).every(Boolean);
  const answered = rows.filter((r) => r.answer !== null);
  const ns = answered.map((r) => r.nsPerAsk).sort((a, b) => a - b);
  say(`BAR ${barMet ? 'MET' : 'MISSED'}${live ? '' : ' (local page, not the live site)'}: 17 times 23 -> ${r17 ? r17.answer : 'none'} provenance ${r17 ? r17.provenance : 'none'} at ${r17 ? r17.nsPerAsk : 'none'} ns per ask; novel question route ${novel ? novel.route : 'none'}; answered ${answered.length}/${rows.length}; cli parity ${rows.filter((r) => r.parity).length}/${rows.length}; requests after load ${after}; page errors ${errors.length}; ns per ask median ${ns.length ? ns[Math.floor(ns.length / 2)] : 'none'}, slowest ${ns.length ? ns[ns.length - 1] : 'none'}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'organism', 'manifest.json'), 'utf8'));
  const out = {
    at, command: 'node bench/site-ask.mjs' + (arg('url') ? ' --url ' + arg('url') : ''), node: process.version,
    isTheBar: live, barMet, met, url, browser: browserUA, modelCalls: 0, tokens: 0,
    split: { what: 'no learning happens here: the prompts are the page examples (web/ask.mjs EXAMPLES), graded against act/solve.mjs in node, not against a held-out set', development: EXAMPLES.slice(), heldOut: [], contaminated: false },
    statement: 'The prompt box on ' + url + ' answered in the browser tab with the organism exact reader (' + manifest.files.map((f) => f.file + ' sha256 ' + f.sha256.slice(0, 12)).join(', ') + '), no model and no request after load; every answer equals act/solve.mjs solve() on the same prompt.',
    requestsAfterLoad: after, pageErrors: errors, organism: manifest.files, rows,
  };
  const file = path.join(ROOT, 'bench', 'verdicts', live ? 'site-ask.json' : 'site-ask-local.json');
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  say('wrote ' + path.relative(ROOT, file).split(path.sep).join('/'));
  process.exitCode = barMet ? 0 : 1;
}

main().catch((e) => { console.error(e && e.stack || e); process.exit(2); });
