// bench/site-ask.mjs: THE PROMPT BOX, ASKED FROM A REAL BROWSER (queue item 12, docs/CLOUD-SESSION.md).
//
// The bar, as the brief writes it: from a browser on dilation.dev, "what is 17 times 23" answers 391
// with provenance exact, and a novel question answers with its route printed; both recorded in
// bench/verdicts/site-ask.json. This bench opens the page in Chromium (Playwright), types every prompt
// web/ask.mjs offers into the box, presses Enter, and reads what the PAGE printed: the answer, the
// route, the provenance and the nanoseconds per ask the page measured on this device. Each answer is
// compared with act/solve.mjs solve() run here in node on the same prompt (the CLI parity: the page
// runs the same bytes, so a difference is a defect). A TAB answer must make no request; a prompt the
// tab refuses must make exactly ONE request, a POST to /api/ask on the same origin, and the page must
// print the server's route (the TAB ROWS).
//
// THE SERVER ROWS (board 18 builder), on the same origin as the page: POST "what is 17 times 23" must
// answer 391 with provenance exact and an integer serverUs; POST "write a poem about the sea" must
// answer with its route printed (with no model configured on the host the row records llm.provider and
// llm.reason, which IS the printed route); POST a 2001 character prompt is 413; 30 rapid POSTs from
// this one client yield at least one 429 with Retry-After; GET prints the usage and the footer field
// names; OPTIONS carries no star origin; no response carries "sk-", "sk_", "Bearer " or
// "BRAIN_LLM_KEY=". The cold start is measured in a child node process on THIS host (the first and
// second handle() of act/ask-http.mjs), never on Vercel's.
//
// With --url on dilation.dev or ask.dilation.dev the verdict is bench/verdicts/site-ask.json
// (isTheBar true): the orchestrator runs that from a GitHub runner (.github/workflows/site-ask.yml),
// because the sandbox this was built in cannot reach dilation.dev. Without --url, bin/ask-serve.mjs is
// started on 127.0.0.1 (the built web/dist and the handler together) and the verdict is
// bench/verdicts/site-ask-local.json (isTheBar false); any other --url writes site-ask-local.json too.
// --static is the CONTROL: ask-serve with /api/ask unmounted, verdict site-ask-control.json.
// Playwright resolves from the tree, then PLAYWRIGHT_PATH (a directory holding the package), then
// npm root -g.
//
//   node bench/site-ask.mjs [--url https://dilation.dev/ask] [--static]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync, spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { solve } from '../act/solve.mjs';
import { converse } from '../act/converse.mjs';
import { EXAMPLES } from '../web/ask.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DIST = path.join(ROOT, 'web', 'dist');
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const say = (s) => console.log(s);
const NOVEL = 'write a poem about the sea';
const EXACT = 'what is 17 times 23';
const LONG = 'x'.repeat(2001);
const RAPID = 30;
const LIVE_HOSTS = ['dilation.dev', 'ask.dilation.dev'];
const SECRETS = ['sk-', 'sk_', 'Bearer ', 'BRAIN_LLM_KEY='];
// Board 25 (item tab-converse, his 2026-09-27 09:28 EDT "Yeah but i said hey to it and it said it couldnt
// respond"): the tab asks the conversation region (act/converse.mjs) first, so "hey" (a chip) and "hey, how
// are you" (typed) must be TAB answers, route direct, provenance native, zero requests, equal to converse()
// run here in node on the same prompt (computed, never typed). "tell me a joke" is recorded with the rule
// that its answer's first line does not start with "nothing in memory matches"; it depends on items
// converse-cover or ask-fallthrough being deployed, so it is a row and not a rule of the bar.
const HEY = 'hey';
const COMPOUND = 'hey, how are you';
const JOKE = 'tell me a joke';
// HIS PROBE (docs/VISION.md order 41, his 2026-09-27 14:37 EDT: "i said hey and it responded with the same thig as hi
// and i just said "h" and it couldnt respond. neither could it respond to complex questions"): the five prompts he
// typed are asked the same way and graded into their OWN verdict, bench/verdicts/site-probe.json (isTheBar on the
// live site). A row is ok when the page printed an answer whose first line is not the memory miss ("nothing in
// memory matches" or the wrapper "I do not carry that yet"); the greetings must be tab answers (route direct,
// provenance native). Whether "hey" and "hi" print one text is recorded as a fact, not a rule. These rows never
// change the rules of site-ask.json: order 2's bar and order 41's bar are two files.
const HIS_PROBE = ['h', 'hey', 'hi', 'What is the capital of France?', 'Write a short essay on why the ocean is salty.'];
const PROMPTS = EXAMPLES.concat([COMPOUND, JOKE].concat(HIS_PROBE).filter((q, i, a) => !EXAMPLES.includes(q) && a.indexOf(q) === i));
const IN_BAR = (q) => q !== JOKE && (EXAMPLES.includes(q) || q === COMPOUND);
const MISS_RE = /^(?:nothing in memory matches|I do not carry that yet)/;
/** What the page must print for q, in the tab's order: the conversation region, then the exact reader, then the server. */
function expected(q) {
  const c = converse(q);
  if (c) return { from: 'converse', answer: c.answer, kind: c.kind, route: 'direct', provenance: 'native' };
  const s = solve(q);
  if (s) return { from: 'solve', answer: s.answer, method: s.method, route: 'exact', provenance: 'exact' };
  return { from: 'server', answer: null, route: 'refused', provenance: 'none' };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function playwright() {
  // no bare import: the tree has zero dependencies (the gate scans); playwright is resolved from its global install or PLAYWRIGHT_PATH below
  const roots = [];
  if (process.env.PLAYWRIGHT_PATH) roots.push(process.env.PLAYWRIGHT_PATH);
  try { roots.push(execSync('npm root -g', { encoding: 'utf8' }).trim()); } catch { /* no npm */ }
  for (const root of roots) {
    try { const req = createRequire(path.join(root, 'noop.js')); return await import(pathToFileURL(req.resolve('playwright')).href); } catch { /* next */ }
  }
  throw new Error('playwright not found: install it globally (npm i -g playwright) or set PLAYWRIGHT_PATH');
}

/** bin/ask-serve.mjs as a child: the handler installs its egress guard in ITS process, not this one. */
function startServe(staticOnly) {
  return new Promise((ok, fail) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'bin', 'ask-serve.mjs'), '--port', '0', ...(staticOnly ? ['--static'] : [])], { stdio: ['ignore', 'pipe', 'pipe'] });
    let buf = '';
    const t = setTimeout(() => { child.kill(); fail(new Error('ask-serve printed no url in 15 s: ' + buf)); }, 15000);
    child.stdout.on('data', (d) => { buf += d; const m = /ask-serve (http:\/\/127\.0\.0\.1:\d+)/.exec(buf); if (m) { clearTimeout(t); ok({ child, base: m[1] }); } });
    child.stderr.on('data', () => {});
    child.on('exit', (c) => { clearTimeout(t); fail(new Error('ask-serve exited ' + c + ': ' + buf)); });
  });
}

/** The cold start and the warm ask of act/ask-http.mjs, timed in a fresh child process. */
function coldStart() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'site-ask-cold-'));
  const code = "const t0=performance.now();const m=await import(" + JSON.stringify(pathToFileURL(path.join(ROOT, 'act', 'ask-http.mjs')).href) + ");const h=m.createHandler({stateDir:" + JSON.stringify(dir) + "});const b=JSON.stringify({prompt:'what is 17 times 23'});let a=performance.now();const r1=await h({method:'POST',body:b,ip:'c'});const c1=performance.now()-a;a=performance.now();const r2=await h({method:'POST',body:b,ip:'c'});const c2=performance.now()-a;console.log('importMs '+(a-t0-c1).toFixed(3)+' coldStartMs '+c1.toFixed(3)+' warmMs '+c2.toFixed(3)+' status '+r1.status+' '+r2.status+' serverUs '+r1.json.serverUs+' '+r2.json.serverUs);";
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', code], { encoding: 'utf8', timeout: 60000 });
  fs.rmSync(dir, { recursive: true, force: true });
  const line = String(r.stdout || '').split('\n').find((l) => l.startsWith('importMs ')) || null;
  const num = (k) => { const m = line && new RegExp(k + ' ([0-9.]+)').exec(line); return m ? Number(m[1]) : null; };
  return { line, importMs: num('importMs'), coldStartMs: num('coldStartMs'), warmMs: num('warmMs'), where: 'a fresh node ' + process.version + ' child process on the bench host (' + os.platform() + '), not the Vercel instance' };
}

async function post(base, body, extra = {}) {
  const t0 = performance.now();
  try {
    const res = await fetch(base + '/api/ask', { method: extra.method || 'POST', headers: { 'content-type': 'application/json', ...(extra.headers || {}) }, body: extra.method === 'GET' || extra.method === 'OPTIONS' ? undefined : body });
    const raw = await res.text();
    let json = null;
    try { json = raw ? JSON.parse(raw) : null; } catch { json = null; }
    return { status: res.status, retryAfter: res.headers.get('retry-after'), acao: res.headers.get('access-control-allow-origin'), raw, json, rttMs: Number((performance.now() - t0).toFixed(1)) };
  } catch (e) {
    return { status: 0, error: String(e && e.message || e), raw: '', json: null, rttMs: Number((performance.now() - t0).toFixed(1)) };
  }
}
/** A POST that waits out one 429 (a re-run inside the same minute), so a row reads the answer. */
async function postOnce(base, prompt) {
  let r = await post(base, JSON.stringify({ prompt }));
  if (r.status === 429) { await sleep(Math.min(65, Number(r.retryAfter) || 3) * 1000); r = await post(base, JSON.stringify({ prompt })); r.waitedFor429 = true; }
  return r;
}

async function main() {
  const at = new Date().toISOString();
  const staticOnly = argv.includes('--static');
  let url = arg('url'), serve = null;
  if (!url) { serve = await startServe(staticOnly); url = serve.base + '/ask'; }
  const base = new URL(url).origin;
  const live = LIVE_HOSTS.includes(new URL(url).hostname);
  const cold = coldStart();
  say('COLD START ' + (cold.line || 'not measured'));
  const pw = await playwright();
  const chromium = pw.chromium || (pw.default && pw.default.chromium);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/status of 404/.test(m.text())) errors.push(m.text()); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__brainAsk && window.__brainAsk.ready, null, { timeout: 15000 });
  const requests = [];
  page.on('request', (r) => { requests.push({ method: r.method(), url: r.url() }); });
  const browserUA = await page.evaluate(() => navigator.userAgent);
  const rows = [];
  for (const q of PROMPTS) {
    const n0 = await page.locator('#term .entry:not(#hello)').count();
    const r0 = requests.length;
    await page.fill('#q', q);
    await page.press('#q', 'Enter');
    await page.waitForFunction((n) => document.querySelectorAll('#term .entry:not(#hello)').length > n, n0, { timeout: 30000 });
    await page.waitForFunction(() => { const e = [...document.querySelectorAll('#term .entry')].pop(); return !e.querySelector('[data-server-pending]'); }, null, { timeout: 60000 });
    await sleep(150); // a request the page might make late would be counted, not missed
    const got = await page.evaluate(() => {
      const e = [...document.querySelectorAll('#term .entry')].pop();
      const a = e.querySelector('.ans:not(.srv-ans)'), f = e.querySelector('[data-route]'), ns = e.querySelector('[data-ns]'), s = e.querySelector('[data-server-done]');
      return {
        answer: a ? a.dataset.answer : null, route: f ? f.dataset.route : null, provenance: f ? f.dataset.provenance : null, ns: ns ? Number(ns.dataset.ns) : null,
        server: s ? { status: Number(s.dataset.status), route: s.dataset.srvRoute || null, provenance: s.dataset.srvProvenance || null, provider: s.dataset.srvProvider || null, serverUs: s.dataset.serverUs ? Number(s.dataset.serverUs) : null, rttMs: s.dataset.rttMs ? Number(s.dataset.rttMs) : null, text: s.innerText } : null,
        text: e.innerText,
      };
    });
    const made = requests.slice(r0);
    const cli = solve(q);
    const want = expected(q);
    const parity = want.answer === got.answer;
    const firstLine = got.answer !== null ? String(got.answer).split('\n')[0] : got.server ? (String(got.server.text || '').split('\n').find((l) => l.trim()) || '').trim() : null;
    rows.push({ prompt: q, answer: got.answer, route: got.route, provenance: got.provenance, nsPerAsk: got.ns, cli: cli ? cli.answer : null, cliMethod: cli ? cli.method : null, expected: want, parity, inBar: IN_BAR(q), firstLine, requests: made, server: got.server, lines: got.text.split('\n').slice(0, 14) });
    say((got.answer !== null ? 'TAB ANSWERED ' + String(got.answer).slice(0, 60) : 'TAB REFUSED') + '  route ' + got.route + '  provenance ' + got.provenance + (got.ns !== null ? '  ' + got.ns + ' ns per ask' : '') + '  expected ' + want.from + ' ' + (want.answer === null ? 'null' : String(want.answer).slice(0, 40)) + (parity ? '' : '  PARITY MISSED') + (IN_BAR(q) ? '' : '  (a row, not a rule)') + '  requests ' + made.length
      + (got.server ? '  SERVER ' + got.server.status + ' route ' + got.server.route + ' provenance ' + got.server.provenance + ' model ' + got.server.provider + ' ' + got.server.serverUs + ' us on the server, round trip ' + got.server.rttMs + ' ms' : '') + '  :: ' + q.slice(0, 60));
  }
  await browser.close();

  // ---------------------------------------------------------------- the server rows
  const server = {};
  server.exact = await postOnce(base, EXACT);
  server.novel = await postOnce(base, NOVEL);
  server.long = await post(base, JSON.stringify({ prompt: LONG }));
  server.get = await post(base, null, { method: 'GET' });
  server.options = await post(base, null, { method: 'OPTIONS' });
  const rapid = [];
  for (let i = 0; i < RAPID; i++) rapid.push(await post(base, JSON.stringify({ prompt: EXACT })));
  const e = server.exact.json || {}, n = server.novel.json || {};
  say('SERVER POST ' + EXACT + ' -> ' + server.exact.status + ' ' + (e.exact ? e.exact.answer : 'none') + ' provenance ' + (e.provenance ? e.provenance.answer : 'none') + ' route ' + e.route + ' serverUs ' + e.serverUs + ' host ' + e.host + ' round trip ' + server.exact.rttMs + ' ms');
  say('SERVER POST ' + NOVEL + ' -> ' + server.novel.status + ' route ' + n.route + ' provenance ' + (n.provenance ? n.provenance.answer : 'none') + ' llm ' + (n.llm ? n.llm.provider + '/' + n.llm.model + ' ok ' + n.llm.ok + ' fellBack ' + n.llm.fellBack + ' reason ' + n.llm.reason : 'none') + ' serverUs ' + n.serverUs + ' text ' + JSON.stringify(String(n.text || '').slice(0, 80)));
  say('SERVER POST 2001 chars -> ' + server.long.status + '; GET -> ' + server.get.status + ' footer ' + JSON.stringify(server.get.json && server.get.json.footer) + '; OPTIONS -> ' + server.options.status + ' access-control-allow-origin ' + server.options.acao);
  const statuses = {};
  for (const r of rapid) statuses[r.status] = (statuses[r.status] || 0) + 1;
  const first429 = rapid.findIndex((r) => r.status === 429);
  const us = rapid.filter((r) => r.status === 200 && r.json && Number.isInteger(r.json.serverUs)).map((r) => r.json.serverUs).sort((a, b) => a - b);
  const rtt = rapid.filter((r) => r.status === 200).map((r) => r.rttMs).sort((a, b) => a - b);
  const q = (xs, p) => (xs.length ? xs[Math.min(xs.length - 1, Math.floor(p * xs.length))] : null);
  say('SERVER ' + RAPID + ' rapid POSTs -> ' + JSON.stringify(statuses) + ' first 429 at ' + (first429 >= 0 ? '#' + (first429 + 1) : 'none') + ' Retry-After ' + (first429 >= 0 ? rapid[first429].retryAfter : 'none') + '; serverUs of the 200s min ' + q(us, 0) + ' median ' + q(us, 0.5) + ' max ' + (us.length ? us[us.length - 1] : null) + '; round trip ms min ' + q(rtt, 0) + ' median ' + q(rtt, 0.5) + ' max ' + (rtt.length ? rtt[rtt.length - 1] : null));
  if (serve) serve.child.kill('SIGINT');

  const all = [server.exact, server.novel, server.long, server.get, server.options, ...rapid];
  const secretHits = SECRETS.map((s) => ({ s, n: all.reduce((k, r) => k + (String(r.raw || '').split(s).length - 1), 0) }));
  const r17 = rows.find((r) => r.prompt === EXACT);
  const novel = rows.find((r) => r.prompt === NOVEL);
  const barRows = rows.filter((r) => r.inBar);
  const tabAnswered = barRows.filter((r) => r.answer !== null);
  const refused = barRows.filter((r) => r.answer === null);
  const nativeTab = (r) => !!r && r.expected.from === 'converse' && r.answer === r.expected.answer && r.route === 'direct' && r.provenance === 'native' && r.requests.length === 0 && Number.isFinite(r.nsPerAsk);
  const heyRow = rows.find((r) => r.prompt === HEY), compoundRow = rows.find((r) => r.prompt === COMPOUND), jokeRow = rows.find((r) => r.prompt === JOKE);
  const joke = jokeRow ? { prompt: JOKE, firstLine: jokeRow.firstLine, answeredIn: jokeRow.answer !== null ? 'tab' : jokeRow.server ? 'server' : 'nowhere', ok: typeof jokeRow.firstLine === 'string' && jokeRow.firstLine.length > 0 && !/^nothing in memory matches/.test(jokeRow.firstLine),
    dependsOn: 'items converse-cover (act/converse.mjs, the uncarried kind, in the deployed page and on the server) or ask-fallthrough (act/prompt.mjs, the memory-miss end) being deployed; recorded as a row, never a rule of this bar' } : null;
  const probeRows = HIS_PROBE.map((p) => {
    const r = rows.find((x) => x.prompt === p);
    if (!r) return { prompt: p, asked: false, ok: false };
    const answeredIn = r.answer !== null ? 'tab' : r.server ? 'server' : 'nowhere';
    const greeting = p === 'hey' || p === 'hi';
    const printed = typeof r.firstLine === 'string' && r.firstLine.length > 0 && !MISS_RE.test(r.firstLine);
    const ok = greeting ? printed && r.route === 'direct' && r.provenance === 'native' && r.requests.length === 0 : printed;
    return { prompt: p, asked: true, answeredIn, firstLine: r.firstLine, route: r.route, provenance: r.provenance, nsPerAsk: r.nsPerAsk, requests: r.requests.length, server: r.server ? { status: r.server.status, route: r.server.route, provenance: r.server.provenance, provider: r.server.provider, serverUs: r.server.serverUs } : null, ok };
  });
  const heyText = (rows.find((x) => x.prompt === 'hey') || {}).answer, hiText = (rows.find((x) => x.prompt === 'hi') || {}).answer;
  const probe = { rows: probeRows, sameGreetingText: heyText !== undefined && hiText !== undefined && heyText === hiText, ok: probeRows.filter((r) => r.ok).length, n: probeRows.length };
  for (const r of probeRows) say('HIS PROBE ' + JSON.stringify(r.prompt) + ' -> ' + (r.asked ? r.answeredIn + ' route ' + r.route + ' provenance ' + r.provenance + (r.server ? ' server ' + r.server.route + '/' + r.server.provenance + '/' + r.server.provider : '') + ' first line ' + JSON.stringify(r.firstLine) : 'not asked') + ' -> ' + (r.ok ? 'ok' : 'MISSED'));
  say('HIS PROBE ' + probe.ok + ' of ' + probe.n + ' answered; hey and hi print one text: ' + probe.sameGreetingText);
  const met = {
    exact391: !!r17 && r17.answer === '391' && r17.provenance === 'exact' && Number.isFinite(r17.nsPerAsk),
    novelRoutePrinted: !!novel && novel.answer === null && novel.route === 'refused' && !!novel.server && novel.server.status === 200 && !!novel.server.route && /route/.test(novel.server.text),
    heyInTheTab: nativeTab(heyRow),
    compoundInTheTab: nativeTab(compoundRow),
    parity: barRows.every((r) => r.parity),
    tabNoRequest: tabAnswered.every((r) => r.requests.length === 0),
    refusedOnePost: refused.length > 0 && refused.every((r) => r.requests.length === 1 && r.requests[0].method === 'POST' && r.requests[0].url === base + '/api/ask'),
    noPageErrors: errors.length === 0,
    serverExact391: server.exact.status === 200 && !!e.exact && e.exact.answer === '391' && !!e.provenance && e.provenance.answer === 'exact' && Number.isInteger(e.serverUs),
    serverNovelRoute: server.novel.status === 200 && typeof n.route === 'string' && n.route.length > 0 && !!n.llm && (n.llm.ok === true || (typeof n.llm.reason === 'string' && n.llm.reason.length > 0)),
    serverCap413: server.long.status === 413,
    server429: first429 >= 0 && !!rapid[first429].retryAfter,
    serverGetUsage: server.get.status === 200 && !!server.get.json && Array.isArray(server.get.json.footer) && server.get.json.footer.includes('serverUs'),
    optionsNoStar: server.options.status === 204 && server.options.acao !== '*',
    noSecretInResponses: secretHits.every((x) => x.n === 0),
  };
  const barMet = Object.values(met).every(Boolean);
  const ns = tabAnswered.map((r) => r.nsPerAsk).sort((a, b) => a - b);
  say('HEY ' + (heyRow ? 'route ' + heyRow.route + ' provenance ' + heyRow.provenance + ' requests ' + heyRow.requests.length + ' ' + heyRow.nsPerAsk + ' ns per ask parity ' + heyRow.parity : 'not asked') + '; "' + COMPOUND + '" ' + (compoundRow ? 'route ' + compoundRow.route + ' provenance ' + compoundRow.provenance + ' requests ' + compoundRow.requests.length + ' parity ' + compoundRow.parity : 'not asked') + '; "' + JOKE + '" first line ' + JSON.stringify(joke ? joke.firstLine : null) + ' in the ' + (joke ? joke.answeredIn : 'nowhere') + ' -> ' + (joke ? joke.ok : 'n/a') + ' (a row, not a rule)');
  say(`BAR ${barMet ? 'MET' : 'MISSED'}${live ? '' : staticOnly ? ' (CONTROL: server half off, local page)' : ' (local page, not the live site)'}: tab 17 times 23 -> ${r17 ? r17.answer : 'none'} provenance ${r17 ? r17.provenance : 'none'} at ${r17 ? r17.nsPerAsk : 'none'} ns per ask; hey in the tab ${met.heyInTheTab}; novel question tab ${novel ? novel.route : 'none'}, server ${novel && novel.server ? novel.server.status + ' route ' + novel.server.route + ' provenance ' + novel.server.provenance + ' model ' + novel.server.provider : 'none'}; tab answered ${tabAnswered.length}/${barRows.length}; parity ${barRows.filter((r) => r.parity).length}/${barRows.length}; tab requests ${tabAnswered.reduce((k, r) => k + r.requests.length, 0)}; refused prompts ${refused.length} with ${refused.reduce((k, r) => k + r.requests.length, 0)} POSTs; page errors ${errors.length}; server 391 ${met.serverExact391 ? 'yes' : 'no'} serverUs ${e.serverUs}; 413 ${server.long.status}; 429 ${first429 >= 0 ? 'at #' + (first429 + 1) : 'none'}; secrets ${secretHits.reduce((k, x) => k + x.n, 0)}; cold start ${cold.coldStartMs} ms warm ${cold.warmMs} ms; met ${Object.values(met).filter(Boolean).length}/${Object.keys(met).length}`);
  const manifest = JSON.parse(fs.readFileSync(path.join(DIST, 'organism', 'manifest.json'), 'utf8'));
  const failed = Object.entries(met).filter(([, v]) => !v).map(([k]) => k);
  const out = {
    at, command: 'node bench/site-ask.mjs' + (arg('url') ? ' --url ' + arg('url') : '') + (staticOnly ? ' --static' : ''), node: process.version,
    isTheBar: live && !staticOnly, barMet, met, url, origin: base, browser: browserUA, control: staticOnly,
    modelCalls: n.llm && n.llm.provider === 'env' && n.llm.ok ? 1 : 0,
    split: {
      what: 'no learning happens here: the tab prompts are the page examples (web/ask.mjs EXAMPLES) plus "' + COMPOUND + '" and "' + JOKE + '", each graded against what the tab order computes in node (act/converse.mjs converse() first, then act/solve.mjs solve()); the server prompts are the two the brief names plus a 2001 character cap probe and ' + RAPID + ' rapid repeats of the first; none is a held-out set',
      development: PROMPTS.slice().concat([EXACT, NOVEL, '2001 x characters (the 413 probe)']), heldOut: [], contaminated: false,
    },
    joke,
    statement: 'The prompt box on ' + url + ' answered in the browser tab with the organism modules it copies byte for byte (' + manifest.files.map((f) => f.file + ' sha256 ' + f.sha256.slice(0, 12)).join(', ') + '), ' + tabAnswered.length + ' of ' + barRows.length + ' graded prompts with no request; ' + barRows.filter((r) => r.parity).length + ' of ' + barRows.length + ' page results equal what the tab order computes in node on the same prompt (the conversation region first, then act/solve.mjs)' + (barRows.every((r) => r.parity) ? '' : ' (differs: ' + barRows.filter((r) => !r.parity).map((r) => JSON.stringify(r.prompt.slice(0, 40)) + ' page ' + JSON.stringify(r.answer === null ? null : String(r.answer).slice(0, 40)) + ' expected ' + r.expected.from + ' ' + JSON.stringify(r.expected.answer === null ? null : String(r.expected.answer).slice(0, 40))).join('; ') + ')') + '. "' + HEY + '" ' + (heyRow ? (met.heyInTheTab ? 'was answered in the tab by the conversation region (route direct, provenance native, no request, ' + heyRow.nsPerAsk + ' ns per ask on this device)' : 'was NOT answered in the tab by the conversation region (route ' + heyRow.route + ', ' + heyRow.requests.length + ' request(s)); the page deployed there predates board 25 item tab-converse') : 'was not asked') + ', and "' + COMPOUND + '" ' + (met.compoundInTheTab ? 'was too' : 'was not (it holds once the page carrying the compound turns of act/converse.mjs is deployed)') + '. "' + JOKE + '" is a row, not a rule: its first line ' + (joke && joke.ok ? 'does not start with "nothing in memory matches"' : 'is ' + JSON.stringify(joke ? joke.firstLine : null)) + ', which depends on ' + (joke ? joke.dependsOn : 'nothing asked') + '. The ' + refused.length + ' prompt(s) the tab refused made ' + refused.reduce((k, r) => k + r.requests.length, 0) + ' POST(s) to ' + base + '/api/ask and the page printed the server route (' + (novel && novel.server ? novel.server.route + ', provenance ' + novel.server.provenance + ', model ' + novel.server.provider : 'none') + '). On the server, "' + EXACT + '" answered ' + (e.exact ? e.exact.answer : 'none') + ' with provenance ' + (e.provenance ? e.provenance.answer : 'none') + ' in ' + e.serverUs + ' us on host ' + e.host + '; "' + NOVEL + '" answered with route ' + n.route + ' and llm ' + (n.llm ? n.llm.provider + ' (' + (n.llm.reason || 'ok') + ')' : 'none') + '; a 2001 character prompt got ' + server.long.status + '; ' + RAPID + ' rapid POSTs got ' + JSON.stringify(statuses) + '. The knowledge store on the server host: ' + (e.knowledge ? (e.knowledge.ready ? 'ready' : 'absent (' + e.knowledge.why + ')') : 'unknown') + ', so the knowledge tier answered nothing there. Cold start ' + cold.coldStartMs + ' ms and warm ' + cold.warmMs + ' ms were measured in ' + cold.where + '. ' + (barMet ? 'Every rule met.' : 'Rules missed: ' + failed.join(', ') + '.'),
    coldStartMs: cold.coldStartMs, warmMs: cold.warmMs, coldStart: cold,
    requestsAfterLoad: requests.length, pageErrors: errors, organism: manifest.files, rows,
    serverRows: {
      exact: { status: server.exact.status, rttMs: server.exact.rttMs, waitedFor429: !!server.exact.waitedFor429, json: server.exact.json },
      novel: { status: server.novel.status, rttMs: server.novel.rttMs, waitedFor429: !!server.novel.waitedFor429, json: server.novel.json },
      cap413: { status: server.long.status, json: server.long.json },
      get: { status: server.get.status, json: server.get.json },
      options: { status: server.options.status, accessControlAllowOrigin: server.options.acao },
      rapid: { n: RAPID, statuses, first429: first429 >= 0 ? first429 + 1 : null, retryAfter: first429 >= 0 ? rapid[first429].retryAfter : null, serverUs: { min: q(us, 0), median: q(us, 0.5), max: us.length ? us[us.length - 1] : null, n: us.length }, rttMs: { min: q(rtt, 0), median: q(rtt, 0.5), max: rtt.length ? rtt[rtt.length - 1] : null } },
      secrets: secretHits,
    },
  };
  const name = staticOnly ? 'site-ask-control.json' : live ? 'site-ask.json' : 'site-ask-local.json';
  const file = path.join(ROOT, 'bench', 'verdicts', name);
  fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
  say('wrote ' + path.relative(ROOT, file).split(path.sep).join('/'));
  const probeFile = path.join(ROOT, 'bench', 'verdicts', staticOnly ? 'site-probe-control.json' : live ? 'site-probe.json' : 'site-probe-local.json');
  fs.writeFileSync(probeFile, JSON.stringify({
    at, command: out.command, node: process.version, isTheBar: live && !staticOnly, barMet: probe.ok === probe.n, url, origin: base, control: staticOnly,
    prompts: HIS_PROBE, ok: probe.ok, n: probe.n, sameGreetingText: probe.sameGreetingText, rows: probeRows,
    modelConfigured: !!(server.get.json && server.get.json.model && server.get.json.model.configured), knowledgeReady: !!(server.get.json && server.get.json.knowledge && server.get.json.knowledge.ready),
    split: { what: 'his five probe prompts of 2026-09-27 14:37 EDT, asked from the page exactly as typed; no learning happens here', development: HIS_PROBE.slice(), heldOut: [], contaminated: false },
    control: staticOnly ? 'the server half off' : 'none: the miss is the page itself printing the memory miss',
    statement: 'His five probe prompts (docs/VISION.md order 41) asked from ' + url + ': ' + probe.ok + ' of ' + probe.n + ' answered (' + probeRows.map((r) => JSON.stringify(r.prompt.slice(0, 32)) + ' ' + (r.ok ? 'ok' : 'MISSED') + ' in the ' + (r.asked ? r.answeredIn : 'nowhere')).join('; ') + '). "hey" and "hi" print one text: ' + probe.sameGreetingText + '. The server reports model configured ' + !!(server.get.json && server.get.json.model && server.get.json.model.configured) + ' and knowledge ready ' + !!(server.get.json && server.get.json.knowledge && server.get.json.knowledge.ready) + '. ' + (probe.ok === probe.n ? 'Bar met.' : 'Bar missed: every prompt the page cannot carry ends in the memory miss until a model cell (BRAIN_LLM_BASE, BRAIN_LLM_KEY, BRAIN_LLM_MODEL on the Vercel project) and the knowledge store are on the server.'),
  }, null, 2) + '\n');
  say('wrote ' + path.relative(ROOT, probeFile).split(path.sep).join('/') + ' (his probe ' + probe.ok + ' of ' + probe.n + ')');
  process.exitCode = barMet ? 0 : 1;
}

main().catch((e) => { console.error(e && e.stack || e); process.exit(2); });
