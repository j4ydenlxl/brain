// bench/tab-converse.mjs: THE CONVERSATION REGION IN THE VISITOR TAB (board 25, item tab-converse).
//
// His words, 2026-09-27 09:28 EDT: "Yeah but i said hey to it and it said it couldnt respond". What he
// saw on dilation.dev/ask after "hey": three refusal lines first, then the server's greeting printed
// twice. This bench builds the /ask page through web/ask.mjs generateAsk() into a scratch directory
// and asserts, on the built HTML and its script, the four facts the item's bar names:
//   (1) the manifest carries act/converse.mjs with the sha256 of the repository file (and the copy);
//   (2) the page calls converse(q) before readExact(q, opts): by index in the ask() source AND by
//       running the page script against recording wrappers of the two readers (behaviour, not text);
//   (3) a refused prompt shows the server block before the tab's refusal lines, while the request is
//       in flight and after the answer arrives;
//   (4) a server answer whose text ends with its native (or exact) answer prints that answer once.
// It also runs converse("hey") in node and asks the built page "hey" (route direct, provenance native,
// no request). THE CONTROL: the page as committed before this item (git show HEAD:web/ask.mjs), built
// the same way in the scratch dir from the same organism modules and run through the same harness; it
// must MISS (a refused "hey", the refusal before the server block, the greeting printed twice), or the
// checks measure nothing.
// PHONE WIDTH: when a Chromium binary is already on this machine (CHROME_PATH, or a Playwright
// browser cache; nothing is installed), the built page is served on 127.0.0.1 with a planted
// /api/ask reply and loaded headless at 375 px wide for three prompts; the page records its own
// scrollWidth against innerWidth and the elements past the right edge. Without a binary the row is
// "not measured" and says so.
//
//   node bench/tab-converse.mjs [--out <scratch dir>] [--no-phone]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const arg = (k) => { const i = argv.indexOf('--' + k); return i >= 0 ? argv[i + 1] : undefined; };
const say = (s) => console.log(s);
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const SCRATCH = path.resolve(arg('out') || path.join(os.tmpdir(), 'tab-converse-' + process.pid));
const SERVER_ONLY = 'summarise the history of rome';
const NATALIA = 'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?';
const t0 = performance.now();

const { converse } = await import(pathToFileURL(path.join(ROOT, 'act', 'converse.mjs')).href);
const { solve } = await import(pathToFileURL(path.join(ROOT, 'act', 'solve.mjs')).href);
const ask = await import(pathToFileURL(path.join(ROOT, 'web', 'ask.mjs')).href);

// ---------------------------------------------------------------- the page harness (a planted fetch, a small DOM)
async function runPage(html, modsDir, manifest, { order = null } = {}) {
  let src = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const mods = {};
  for (const f of manifest.files) mods['../organism/' + f.file] = await import(pathToFileURL(path.join(modsDir, f.file)).href);
  if (order) {
    const rec = (name, fn) => (...a) => { if (order.length < 64) order.push(name); return fn(...a); };
    const cv = mods['../organism/act/converse.mjs'], ex = mods['../organism/act/exact-read.mjs'];
    if (cv) mods['../organism/act/converse.mjs'] = { ...cv, converse: rec('converse', cv.converse) };
    mods['../organism/act/exact-read.mjs'] = { ...ex, readExact: rec('readExact', ex.readExact) };
  }
  src = src.replace(/import\s*\{([^}]*)\}\s*from\s*'([^']+)';/g, (m, names, from) => 'const {' + names + '} = __mods[' + JSON.stringify(from) + '];');
  const calls = [];
  let reply = null;
  const fetch = async (url, init) => { calls.push({ url, init }); return typeof reply === 'function' ? reply() : reply; };
  const el = (id) => ({ id, value: '', children: [], innerHTML: '', dataset: {}, addEventListener() {}, focus() {}, remove() {}, appendChild(c) { this.children.push(c); }, scrollIntoView() {} });
  const term = el('term'), nodes = { '#hello': el('hello'), '#term': term, '#f': el('f'), '#q': el('q') };
  const document = {
    querySelector: (s) => nodes[s] || null,
    querySelectorAll: () => [],
    createElement: () => {
      const e = el('entry');
      e.querySelector = (s) => (s === '.srv' ? { set outerHTML(v) { e.innerHTML = e.innerHTML.replace(/<div class="srv[^"]*" data-server-pending="1">[^<]*<\/div>/, v); } } : null);
      return e;
    },
  };
  const window = {};
  const AsyncFunction = (async () => {}).constructor;
  await new AsyncFunction('__mods', 'document', 'window', 'location', 'fetch', src)(mods, document, window, { search: '' }, fetch);
  return { ask: window.__brainAsk.ask, calls, term, setReply: (r) => { reply = r; } };
}
const respond = (json) => ({ status: 200, headers: { get: () => null }, json: async () => json });
const visible = (h) => h.replace(/<\/(div|pre)>/g, '\n').replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const countOf = (hay, needle) => hay.split(needle).length - 1;

/** The server's native reply shape (act/prompt.mjs answerFromNative), for a turn the TAB did not carry. */
function nativeReply(q) {
  const c = converse(q);
  return {
    ok: true, text: 'answered natively by the conversation region (kind ' + c.kind + ', ' + c.ns + ' ns), with no model, no memory read and no network.\n' + c.answer,
    native: { kind: c.kind, answer: c.answer, form: c.form, ns: c.ns }, exact: null, route: 'direct',
    provenance: { answer: 'native', memoryHits: 0, webPages: 0 }, llm: { provider: null, model: null, ok: false, reason: 'not asked: the native conversation region answered', fellBack: null },
    serverUs: 142, host: 'planted', knowledge: { ready: true },
  };
}

/** The four facts plus the "hey" row, measured on one built page. */
async function measure(label, html, modsDir, manifest) {
  const out = { label };
  const src = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1];
  const body = src.slice(Math.max(0, src.indexOf('async function ask(q)')));
  out.importsConverse = /^import \{ converse \} from '\.\.\/organism\/act\/converse\.mjs';$/m.test(src);
  out.index = { converse: body.indexOf('converse(q)'), readExact: body.indexOf('readExact(q, opts)'), server: body.indexOf('server(q)') };
  // (2) behaviour: the first two reader calls for an exact question, and the reader calls for "hey"
  const order = [];
  const po = await runPage(html, modsDir, manifest, { order });
  await po.ask('what is 17 times 23');
  out.orderExact = order.slice(0, 2);
  order.length = 0;
  po.setReply(respond({ ok: true, text: 'nothing in memory matches hey.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 1, host: 'planted', knowledge: { ready: true } }));
  await po.ask('hey');
  out.orderHey = [...new Set(order)];
  out.converseBeforeExact = out.importsConverse && out.index.converse > 0 && out.index.readExact > out.index.converse
    && out.orderExact[0] === 'converse' && out.orderExact[1] === 'readExact' && out.orderHey.length === 1 && out.orderHey[0] === 'converse';
  // "hey" in the tab
  const p = await runPage(html, modsDir, manifest);
  p.setReply(respond({ ok: true, text: 'nothing in memory matches hey.', route: 'direct', provenance: { answer: 'memory' }, serverUs: 1, host: 'planted', knowledge: { ready: true } }));
  const want = converse('hey');
  const r = await p.ask('hey');
  const hh = p.term.children[0].innerHTML;
  const ns = /data-ns="(\d+)"/.exec(hh);
  out.hey = { tab: r.tab === true, route: r.route || null, provenance: r.provenance || null, requests: p.calls.length, answerEqualsConverse: r.answer === want.answer, nsPerAsk: ns ? Number(ns[1]) : null, firstLine: visible(hh).split('\n').find((l) => l.trim() && !l.trim().startsWith('>')) || null };
  out.heyTab = out.hey.tab && out.hey.route === 'direct' && out.hey.provenance === 'native' && out.hey.requests === 0 && out.hey.answerEqualsConverse;
  // (3) a refused prompt: the server block first, in flight and after
  const q = await runPage(html, modsDir, manifest);
  let release;
  const gate = new Promise((ok) => { release = ok; });
  q.setReply({ status: 200, headers: { get: () => null }, json: () => gate });
  const pend = q.ask(SERVER_ONLY);
  await new Promise((ok) => setImmediate(ok));
  const during = q.term.children[0].innerHTML;
  release({ ok: true, text: 'nothing in memory matches history, rome.', route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: null, reason: 'not configured' }, serverUs: 142, host: 'planted', knowledge: { ready: true } });
  await pend;
  const after = q.term.children[0].innerHTML;
  const iRefusalDuring = during.search(/data-route="refused"/), iPendingDuring = during.indexOf('data-server-pending');
  const iRefusalAfter = after.search(/data-route="refused"/), iDoneAfter = after.indexOf('data-server-done');
  out.refused = { requests: q.calls.length, pendingIndex: iPendingDuring, refusalIndexDuring: iRefusalDuring, doneIndex: iDoneAfter, refusalIndexAfter: iRefusalAfter,
    firstLineDuring: visible(during).split('\n').filter((l) => l.trim())[1] || null, firstLineAfter: visible(after).split('\n').filter((l) => l.trim())[1] || null,
    refusalLinesPrinted: /no cell in this tab carries this question/.test(after) && /tab: route refused/.test(after) && /words the spoken reader could not read/.test(after) };
  out.serverBeforeRefusal = q.calls.length === 1 && iPendingDuring >= 0 && iRefusalDuring > iPendingDuring && iDoneAfter >= 0 && iRefusalAfter > iDoneAfter && out.refused.refusalLinesPrinted;
  // (4) once-only: a native server reply for a prompt the tab sent, and the same through the exported render
  const s = await runPage(html, modsDir, manifest);
  const nat = nativeReply('hey, how are you');
  s.setReply(respond(nat));
  await s.ask(SERVER_ONLY);
  const sh = s.term.children[0].innerHTML;
  out.once = { answerVisibleTimes: countOf(visible(sh), nat.native.answer), headLinePrinted: /answered natively by the conversation region/.test(visible(sh)) };
  out.onceOnly = out.once.answerVisibleTimes === 1 && out.once.headLinePrinted;
  return out;
}

// ---------------------------------------------------------------- the build
fs.mkdirSync(SCRATCH, { recursive: true });
const dist = path.join(SCRATCH, 'dist');
const built = ask.generateAsk(dist);
const html = fs.readFileSync(path.join(dist, 'ask', 'index.html'), 'utf8');
const mc = built.manifest.files.find((f) => f.file === 'act/converse.mjs') || null;
const repoSha = sha(fs.readFileSync(path.join(ROOT, 'act', 'converse.mjs')));
const copySha = mc ? sha(fs.readFileSync(path.join(dist, 'organism', 'act', 'converse.mjs'))) : null;
const manifestConverse = !!mc && mc.sha256 === repoSha && copySha === repoSha;
const pageBytes = Buffer.byteLength(html);
const totalBytes = pageBytes + built.manifest.files.reduce((k, f) => k + f.bytes, 0);
say('BUILD ' + path.relative(SCRATCH, path.join(dist, 'ask', 'index.html')).split(path.sep).join('/') + ' ' + pageBytes + ' bytes; organism modules ' + built.modules + ' (' + built.manifest.files.map((f) => f.file + ' ' + f.sha256.slice(0, 12)).join(', ') + '); with modules ' + totalBytes + ' bytes');
say('MANIFEST act/converse.mjs ' + (mc ? 'sha256 ' + mc.sha256.slice(0, 16) + ' repo ' + repoSha.slice(0, 16) + ' copy ' + String(copySha).slice(0, 16) : 'ABSENT') + ' -> ' + manifestConverse);

const node = converse('hey');
const nodeClock = ask.clock(() => converse('hey'));
say('NODE converse("hey") kind ' + node.kind + ' answer ' + JSON.stringify(node.answer.slice(0, 60) + '...') + ' first (cold) call ' + node.ns + ' ns; median of 7 batches ' + nodeClock.ns + ' ns per ask over ' + nodeClock.asks + ' asks');
const chips = { hey: html.indexOf('data-q="hey"'), whoAreYou: html.indexOf('data-q="who are you"'), exact: html.indexOf('data-q="what is 17 times 23"') };
const chipsOk = chips.hey > 0 && chips.whoAreYou > chips.hey && chips.exact > chips.whoAreYou;

const now = await measure('this page (web/ask.mjs in the working tree)', html, path.join(dist, 'organism'), built.manifest);

// ---------------------------------------------------------------- the control: the page before this item
let control = null;
try {
  const cdir = path.join(SCRATCH, 'control');
  const head = execFileSync('git', ['-C', ROOT, 'show', 'HEAD:web/ask.mjs'], { encoding: 'utf8', maxBuffer: 1 << 24 });
  const headSha = sha(head);
  fs.mkdirSync(path.join(cdir, 'web'), { recursive: true });
  fs.writeFileSync(path.join(cdir, 'web', 'ask.mjs'), head);
  for (const rel of ask.MODULES) {
    if (!fs.existsSync(path.join(ROOT, rel))) continue;
    fs.mkdirSync(path.dirname(path.join(cdir, rel)), { recursive: true });
    fs.copyFileSync(path.join(ROOT, rel), path.join(cdir, rel));
  }
  const old = await import(pathToFileURL(path.join(cdir, 'web', 'ask.mjs')).href);
  const ob = old.generateAsk();
  const ohtml = fs.readFileSync(path.join(cdir, 'web', 'dist', 'ask', 'index.html'), 'utf8');
  control = await measure('the control: git show HEAD:web/ask.mjs (sha256 ' + headSha.slice(0, 12) + '), built from the same organism modules', ohtml, path.join(cdir, 'web', 'dist', 'organism'), ob.manifest);
  control.source = 'git show HEAD:web/ask.mjs';
  control.sha256 = headSha;
  control.manifestConverse = ob.manifest.files.some((f) => f.file === 'act/converse.mjs');
} catch (e) {
  control = { label: 'the control could not be built', error: String(e && e.message || e) };
}

// ---------------------------------------------------------------- phone width, in a Chromium already on this machine
function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const roots = [path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright'), path.join(os.homedir(), '.cache', 'ms-playwright'), path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')];
  const rel = [['chromium_headless_shell-', 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'], ['chromium_headless_shell-', 'chrome-headless-shell-linux64', 'chrome-headless-shell'], ['chromium-', 'chrome-win64', 'chrome.exe'], ['chromium-', 'chrome-win', 'chrome.exe'], ['chromium-', 'chrome-linux', 'chrome']];
  for (const r of roots) {
    let names = [];
    try { names = fs.readdirSync(r).sort().reverse(); } catch { continue; }
    for (const [pre, dir, exe] of rel) for (const n of names) if (n.startsWith(pre) && !(pre === 'chromium-' && n.startsWith('chromium_'))) { const p = path.join(r, n, dir, exe); if (fs.existsSync(p)) return p; }
  }
  return null;
}
const MEASURE = `<script>addEventListener('load', () => setTimeout(() => {
  const d = document.documentElement, iw = innerWidth;
  const wide = [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > iw + 0.5).map((el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).split(' ').join('.') : '')).slice(0, 8);
  const e = [...document.querySelectorAll('#term .entry')].pop();
  const lines = e ? e.innerText.split('\\n').filter((l) => l.trim()).slice(0, 4) : [];
  const srv = e && e.querySelector('[data-server-done]'), ref = e && e.querySelector('[data-refusal]');
  document.body.setAttribute('data-measure', JSON.stringify({ iw, cw: d.clientWidth, sw: d.scrollWidth, bw: document.body.scrollWidth, wide, lines, pending: !!(e && e.querySelector('[data-server-pending]')), serverAboveRefusal: srv && ref ? srv.getBoundingClientRect().bottom <= ref.getBoundingClientRect().top + 0.5 : null }));
}, 1500));</script>`;
async function phone() {
  if (argv.includes('--no-phone')) return { measured: false, why: '--no-phone was passed' };
  const chrome = findChrome();
  if (!chrome) return { measured: false, why: 'no Chromium binary on this machine (CHROME_PATH unset, no Playwright browser cache); nothing was installed' };
  const planted = { ok: true, text: 'nothing in memory matches write, poem, about, sea.', route: 'direct', provenance: { answer: 'memory', memoryHits: 0, webPages: 0 }, llm: { provider: null, model: null, ok: false, reason: 'the model cell is not configured on this host', fellBack: null }, serverUs: 142, host: 'planted', knowledge: { ready: false, why: 'no finished ingest' } };
  const types = { '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json' };
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname === '/api/ask') { req.resume(); req.on('end', () => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(planted)); }); return; }
    let f = path.join(dist, decodeURIComponent(u.pathname));
    if (!f.startsWith(dist)) { res.writeHead(403); res.end(); return; }
    if (u.pathname.endsWith('/')) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    let body = fs.readFileSync(f);
    if (f.endsWith('index.html')) body = Buffer.from(body.toString('utf8').replace('</body>', (u.searchParams.has('wide') ? '<div data-planted-overflow="1" style="width:600px;height:1px"></div>' : '') + MEASURE + '</body>'));
    res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
    res.end(body);
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const base = 'http://127.0.0.1:' + srv.address().port;
  const profile = path.join(SCRATCH, 'chrome-profile');
  const rows = [];
  try {
    for (const q of ['hey', NATALIA, 'write a poem about the sea', 'hey (control: a planted 600 px element)']) {
      const control = q.startsWith('hey (control');
      const url = base + '/ask/?q=' + encodeURIComponent(control ? 'hey' : q) + (control ? '&wide=1' : '');
      const t = performance.now();
      const r = await new Promise((ok) => {
        const c = spawn(chrome, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--disable-extensions', '--user-data-dir=' + profile, '--window-size=375,812', '--virtual-time-budget=6000', '--dump-dom', url], { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        const kill = setTimeout(() => c.kill(), 20000);
        c.stdout.on('data', (d) => { out += d; });
        c.stderr.on('data', () => {});
        c.on('close', (code) => { clearTimeout(kill); ok({ code, out }); });
      });
      const m = /data-measure="([^"]*)"/.exec(r.out);
      const j = m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&amp;/g, '&')) : null;
      rows.push({ prompt: q, control, exit: r.code, ms: Math.round(performance.now() - t), ...(j || { error: 'the page wrote no measurement' }) });
    }
  } finally {
    srv.close();
  }
  const page = rows.filter((x) => !x.control), ctl = rows.find((x) => x.control);
  // the control must SEE the planted overflow, or a clean reading of the page means nothing
  const controlSeen = !!ctl && typeof ctl.sw === 'number' && ctl.sw > ctl.cw && ctl.wide.length > 0;
  const ok = page.length === 3 && controlSeen && page.every((x) => typeof x.sw === 'number' && x.iw === 375 && x.sw <= x.cw && x.cw <= x.iw && x.wide.length === 0);
  return { measured: rows.every((x) => typeof x.sw === 'number'), ok, controlSeen, chrome: path.basename(chrome), rows, serverReply: 'planted (a memory miss shaped like the live reply; this is a layout measurement, not the live server)' };
}
const ph = await phone();
if (ph.measured) for (const x of ph.rows) say('PHONE 375 px  ' + JSON.stringify(x.prompt.slice(0, 40)) + '  innerWidth ' + x.iw + '  clientWidth ' + x.cw + '  scrollWidth ' + x.sw + '  past the edge ' + x.wide.length + (x.wide.length ? ' (' + x.wide.join(', ') + ')' : '') + '  server above refusal ' + x.serverAboveRefusal + '  first lines ' + JSON.stringify(x.lines.slice(0, 2).map((l) => l.slice(0, 60))));
else say('PHONE not measured: ' + ph.why);

// ---------------------------------------------------------------- the verdict
const met = {
  manifestConverse,
  converseBeforeExact: now.converseBeforeExact,
  serverBeforeRefusal: now.serverBeforeRefusal,
  onceOnly: now.onceOnly,
};
const also = { heyTab: now.heyTab, chips: chipsOk, pageUnderCap: pageBytes < 32768, phone375: ph.measured ? ph.ok : null };
const controlMisses = control && !control.error ? { heyTab: !control.heyTab, converseBeforeExact: !control.converseBeforeExact, serverBeforeRefusal: !control.serverBeforeRefusal, onceOnly: !control.onceOnly } : null;
const barMet = Object.values(met).every(Boolean) && also.heyTab && also.chips && also.pageUnderCap && also.phone375 !== false;
for (const [k, v] of Object.entries(met)) say('MET ' + k + ' ' + v);
say('THIS PAGE hey: tab ' + now.hey.tab + ' route ' + now.hey.route + ' provenance ' + now.hey.provenance + ' requests ' + now.hey.requests + ' parity ' + now.hey.answerEqualsConverse + ' ' + now.hey.nsPerAsk + ' ns per ask (node harness); order exact ' + now.orderExact.join('>') + ', hey ' + now.orderHey.join('>') + '; refused: first line in flight ' + JSON.stringify(now.refused.firstLineDuring) + ', after ' + JSON.stringify(now.refused.firstLineAfter) + '; native server answer visible ' + now.once.answerVisibleTimes + ' time(s)');
if (control && !control.error) say('CONTROL (HEAD page) hey: tab ' + control.hey.tab + ' requests ' + control.hey.requests + ' first line ' + JSON.stringify(control.hey.firstLine) + '; converseBeforeExact ' + control.converseBeforeExact + '; serverBeforeRefusal ' + control.serverBeforeRefusal + ' (refused first line after ' + JSON.stringify(control.refused.firstLineAfter) + '); native server answer visible ' + control.once.answerVisibleTimes + ' time(s)');
else say('CONTROL not built: ' + (control && control.error));
const wallMs = Math.round(performance.now() - t0);
say(`BAR ${barMet ? 'MET' : 'MISSED'}: manifest ${met.manifestConverse}, converse before readExact ${met.converseBeforeExact}, server block before refusal ${met.serverBeforeRefusal}, once-only ${met.onceOnly}, hey in the tab ${also.heyTab}, chips ${also.chips}, page ${pageBytes} bytes, phone 375 ${also.phone375 === null ? 'not measured' : also.phone375}; control misses ${controlMisses ? Object.values(controlMisses).filter(Boolean).length + '/' + Object.keys(controlMisses).length : 'n/a'}; ${wallMs} ms`);

const phoneLine = ph.measured
  ? 'Loaded headless at 375 px wide in ' + ph.chrome + ' (already on this machine) against the built page with a planted server reply, the document scroll width against its client width inside a ' + ph.rows[0].iw + ' px window was ' + ph.rows.filter((x) => !x.control).map((x) => x.sw + ' of ' + x.cw + ' px').join(', ') + ' for "hey", the Natalia word problem and "write a poem about the sea", with ' + ph.rows.filter((x) => !x.control).reduce((k, x) => k + x.wide.length, 0) + ' element(s) past the right edge; the control (the same "hey" page with a planted 600 px element) read ' + ph.rows.filter((x) => x.control).map((x) => x.sw + ' of ' + x.cw + ' px with ' + x.wide.length + ' element(s) past the edge').join('') + ', so the measurement sees an overflow when there is one (' + ph.controlSeen + ').'
  : 'Phone width was not measured in a browser: ' + ph.why + '.';
const out = {
  at: new Date().toISOString(),
  command: 'node bench/tab-converse.mjs' + (arg('out') ? ' --out <scratch dir>' : '') + (argv.includes('--no-phone') ? ' --no-phone' : ''),
  node: process.version,
  isTheBar: true,
  barMet,
  met,
  also,
  split: {
    kind: 'structural', heldOut: 'none',
    why: 'a page build has no held-out data; the live bar bench/site-ask.mjs on the GitHub runner is the held-out measurement',
    development: ['the built /ask page and its script', 'converse("hey") in node', 'planted server replies shaped like act/prompt.mjs answerFromNative and a memory miss', 'the control page from git show HEAD:web/ask.mjs'],
    contaminated: false,
  },
  control: control && !control.error ? { what: control.label, source: control.source, sha256: control.sha256, hey: control.hey, converseBeforeExact: control.converseBeforeExact, serverBeforeRefusal: control.serverBeforeRefusal, onceOnly: control.onceOnly, once: control.once, refused: control.refused, misses: controlMisses } : control,
  page: { bytes: pageBytes, withModules: totalBytes, manifest: built.manifest.files, chips, index: now.index, orderExact: now.orderExact, orderHey: now.orderHey },
  hey: { node: { kind: node.kind, answer: node.answer, singleCallNs: node.ns, medianNsPerAsk: nodeClock.ns, asks: nodeClock.asks }, page: now.hey },
  refused: now.refused,
  once: now.once,
  phone: ph,
  dependsOnDeploy: 'dilation.dev/ask serves the page committed before this item until the orchestrator rebuilds web/dist and deploys; the live check is bench/site-ask.mjs --url https://dilation.dev/ask on the GitHub runner',
  wallMs,
  statement: 'Built from web/ask.mjs into a scratch directory, the /ask page (' + pageBytes + ' bytes, ' + totalBytes + ' with its organism modules) now carries act/converse.mjs byte for byte (sha256 ' + (mc ? mc.sha256.slice(0, 12) : 'absent') + ', equal to the repository file: ' + manifestConverse + ') and asks the conversation region first: in the page script converse(q) runs before readExact(q, opts) ('
    + (now.converseBeforeExact ? 'true by source index and by the order of the recorded calls' : 'NOT true') + '). Typing "hey" into the built page answered in the tab with route ' + now.hey.route + ', provenance ' + now.hey.provenance + ', ' + now.hey.requests + ' requests and the same sentence converse("hey") returns in node (' + now.hey.answerEqualsConverse + '). A prompt no tab cell carries now shows the server block first ("' + ask.PENDING_LINE + '") and the tab refusal lines under it, dim and all still printed (' + now.serverBeforeRefusal + '), and a native server answer printed ' + now.once.answerVisibleTimes + ' time(s) where the old page printed it '
    + (control && !control.error ? control.once.answerVisibleTimes : 'an unmeasured number of') + ' time(s). The control is the page as committed before this item, built from the same modules and run through the same harness: it '
    + (control && !control.error ? (control.hey.tab ? 'answered "hey" in the tab' : 'refused "hey" and sent it to the server') + ', and missed ' + Object.values(controlMisses).filter(Boolean).length + ' of the ' + Object.keys(controlMisses).length + ' checks' : 'could not be built (' + (control && control.error) + ')') + '. '
    + phoneLine + ' ' + (barMet ? 'Every rule met.' : 'Rules missed: ' + Object.entries({ ...met, ...also }).filter(([, v]) => v === false).map(([k]) => k).join(', ') + '.') + ' The live site keeps the old page until the orchestrator rebuilds web/dist and deploys; bench/site-ask.mjs on the GitHub runner is the live measurement.',
};
const file = path.join(ROOT, 'bench', 'verdicts', 'tab-converse.json');
fs.writeFileSync(file, JSON.stringify(out, null, 2) + '\n');
say('wrote bench/verdicts/tab-converse.json');
if (!arg('out')) fs.rmSync(SCRATCH, { recursive: true, force: true });
process.exitCode = barMet ? 0 : 1;
