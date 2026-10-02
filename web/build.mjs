// web/build.mjs: our own bundler. No dependencies, because the whole point of this
// directory is that the thing we hand to a deploy tool is small and is text we wrote.
//
// WHAT IT DOES. The sources in web/src are ES modules that only ever import from each
// other by relative path and only ever export declarations. That is a narrow enough
// dialect that bundling is a rewrite, not a compiler: drop the import lines, drop the
// `export ` keyword in front of the declarations, concatenate the files in dependency
// order, and wrap the result in one function scope. Names are kept unique by hand across
// the eight files, and the build FAILS if they are not (see collide() below), so the
// rewrite can never silently shadow one function with another.
//
// The minifier is whitespace and comments only. It walks the file character by character
// and knows what it is inside of: a single quoted string, a double quoted string, a
// template literal and its ${} holes, a line comment, a block comment, or a regular
// expression literal. It never edits anything inside a string, a template or a regex, so
// the GLSL that lives in template literals in scene.js and the digit grouping regex in
// hud.js come out the other side character for character.
//
// Run: node web/build.mjs
//      node web/build.mjs --pocket <dir> [--root <dir>]   only /ask, the pocket and THE BODY into <dir>, with the list
//      and sizes of what the body's worker needs (web/pocket-era.mjs); nothing under web/dist is written
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// The findings page is part of the site, so it is built when the site is built. It reads
// the verdict files at generation time and refuses to emit a number it did not read, which
// is why it can throw here: a build that would publish an untraceable number is a failure.
import { generate as generateFindings } from '../tools/findings.mjs';
// The portfolio page is docs/PORTFOLIO.md rendered whole at build time (his 2026-09-23 line:
// on dilation.dev, always copyable, always current). It throws if a block would be dropped.
import { generatePortfolio } from '../tools/portfolio-page.mjs';
// The ladder page is his P4 ruler rendered from bench/verdicts at build time (web/ladder.mjs).
// It throws when a digit on the page is not a traced field, so a build cannot publish one.
import { generateLadder } from './ladder.mjs';
// The portfolio's "The vision, counted" and "Live" blocks and the ladder's header line (board 24b, item web-vision):
// read from bench/verdicts/vision-count.json, site-ask.json and gate.json at build time (the section before write()).
import { existsSync as existsSyncW } from 'node:fs';
import { createHash } from 'node:crypto';
import { countVision, countLine, STATUS_WORDS } from '../tools/vision-count.mjs';
import { traceCheck } from './ladder.mjs';
import { walkLadder } from './ladder-walk.mjs';
// The handoff page is docs/HANDOFF.md (written by tools/handoff.mjs from the machine's own
// measurements) rendered at /handoff at every build. It throws when a secret pattern is in the file.
import { generateHandoff } from './handoff.mjs';
// The prompt box (queue item 12): /ask and the organism modules the landing page and /ask import,
// copied byte for byte from act/ and tasks/ with a sha256 manifest (web/ask.mjs throws on a mismatch).
import { generateAsk } from './ask.mjs';
// The census block (board 20 builder): cells, kinds and kept per hour read from bench/verdicts/spawn-census.json.
import { injectCensus, readCensusBlock } from './spawn-census.mjs';
// The kept-per-hour block (queue item 7): the loop's yield read from its verdicts, put on the findings page
// after it is written (web/yield.mjs; board 20 builder). BRAIN_YIELD_BLOCK=off builds without it.
import { injectYield } from './yield.mjs';
// The living page (his plan: "A living page, dilation.dev/alive"; Day 3 board, alive builder): grown/ and the two grow/ jsonl
// files rendered at /alive with the same numbers in /alive/data.json (web/alive.mjs). The stamp is this build's clock, passed in.
import { generateAlive } from './alive.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, 'src');
const DIST = join(HERE, 'dist');

// dependency order: a file may only import from files above it
export const ORDER = ['rng.js', 'kinds.js', 'organism.js', 'engine.js', 'layout.js', 'scene.js', 'hud.js', 'main.js'];

const IMPORT = /^\s*import\s+[^;]*?from\s*['"][^'"]+['"]\s*;?\s*$/;
const BARE_IMPORT = /^\s*import\s*['"][^'"]+['"]\s*;?\s*$/;
const EXPORT_DECL = /^(\s*)export\s+(?=(?:default\s+)?(?:function|class|const|let|var|async))/;
const EXPORT_LIST = /^\s*export\s*\{[^}]*\}\s*;?\s*$/;

/** Strip the module syntax out of one source file. */
export function rewrite(src, name) {
  const out = [];
  for (const line of src.split('\n')) {
    if (IMPORT.test(line) || BARE_IMPORT.test(line) || EXPORT_LIST.test(line)) continue;
    out.push(line.replace(EXPORT_DECL, '$1'));
  }
  return '// ---- ' + name + '\n' + out.join('\n');
}

/**
 * Whitespace and comment minifier that knows where it is.
 * @param {string} s
 * @returns {string}
 */
export function minify(s) {
  let out = '';
  let i = 0;
  const n = s.length;
  // the last character emitted that is not whitespace, used to decide whether a / starts
  // a regular expression or is a division sign
  let prev = '';
  while (i < n) {
    const c = s[i], d = s[i + 1];
    // comments
    if (c === '/' && d === '/') { while (i < n && s[i] !== '\n') i++; continue; }
    if (c === '/' && d === '*') { i += 2; while (i < n && !(s[i] === '*' && s[i + 1] === '/')) i++; i += 2; out += ' '; continue; }
    // strings
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === c) break; j++; }
      out += s.slice(i, j + 1); prev = c; i = j + 1; continue;
    }
    // A template literal is copied out verbatim, newlines and all. This bundler does not
    // support ${} holes and says so rather than guessing: every template in web/src is a
    // shader, and a shader has no holes. The check is not optional.
    if (c === '`') {
      let j = i + 1;
      while (j < n) { if (s[j] === '\\') { j += 2; continue; } if (s[j] === '`') break; j++; }
      const body = s.slice(i, j + 1);
      if (body.includes('${')) throw new Error('minify: a template literal with a ${} hole is not supported by this bundler');
      out += body; prev = '`'; i = j + 1; continue;
    }
    // a regular expression literal, never a division: decided by what came before it
    if (c === '/' && regexAllowed(prev)) {
      let j = i + 1, cls = false;
      while (j < n) {
        if (s[j] === '\\') { j += 2; continue; }
        if (s[j] === '[') cls = true;
        else if (s[j] === ']') cls = false;
        else if (s[j] === '/' && !cls) break;
        j++;
      }
      j++;
      while (j < n && /[a-z]/.test(s[j])) j++;
      out += s.slice(i, j); prev = '/'; i = j; continue;
    }
    // whitespace: a run containing a newline becomes one newline, everything else one space
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
      let j = i, nl = false;
      while (j < n && ' \t\r\n'.includes(s[j])) { if (s[j] === '\n') nl = true; j++; }
      if (out.length) out += nl ? '\n' : ' ';
      i = j; continue;
    }
    out += c; prev = c; i++;
  }
  // drop the space that a collapsed run left at the start or end of a line
  return out.split('\n').map(l => l.trim()).filter(l => l.length).join('\n') + '\n';
}

function regexAllowed(prev) {
  if (prev === '') return true;
  if (/[A-Za-z0-9_$)\]]/.test(prev)) return false;
  return true;
}

/**
 * Top level declaration names per file, so a collision is a build failure, not a bug.
 * Top level means column zero: an indented declaration is inside something and cannot
 * collide with anything in another file. A declaration list on one line (const a = 1,
 * b = 2) contributes every name it binds.
 */
export function topLevelNames(src) {
  const names = [];
  const re = /^(?:export\s+)?(?:async\s+)?(?:function|class|const|let|var)\s+([A-Za-z_$][\w$]*)(.*)$/gm;
  let m;
  while ((m = re.exec(src))) {
    names.push(m[1]);
    const more = /,\s*([A-Za-z_$][\w$]*)\s*=/g;
    let x;
    while ((x = more.exec(m[2]))) names.push(x[1]);
  }
  return names;
}

function collide(files) {
  const seen = new Map(), bad = [];
  for (const [name, src] of files) {
    for (const d of topLevelNames(src)) {
      if (seen.has(d)) bad.push(d + ' in ' + name + ' and ' + seen.get(d));
      else seen.set(d, name);
    }
  }
  return bad;
}

/**
 * Build the bundle.
 * @param {{minify?: boolean}} [opts]
 * @returns {{js: string, html: string, files: Array}}
 */
export function bundle(opts = {}) {
  const files = ORDER.map(f => [f, readFileSync(join(SRC, f), 'utf8')]);
  const bad = collide(files);
  if (bad.length) throw new Error('name collision across modules: ' + bad.join('; '));
  const body = files.map(([f, s]) => rewrite(s, f)).join('\n\n');
  const head = '// DILATION / BRAIN. Built by web/build.mjs from web/src. The organism is grown in\n'
    + '// this tab from a seed: there is no snapshot to download.\n';
  let js = head + '(function () {\n"use strict";\n' + body + '\n})();\n';
  if (opts.minify !== false) js = head + minify(js);
  const html = injectCensus(readFileSync(join(SRC, 'index.html'), 'utf8'), readCensusBlock());
  return { js, html, files };
}

// ------------------------------------------------ the portfolio and ladder pages: the measured blocks
// Board 24b, item web-vision. His 2026-09-26 11:55 EDT "Listen vcs must yell", 20:20 EDT "I wouldnt declare the
// project EVER over until the vision is 100 percent fulfilled", 21:03 EDT "No lies"; docs/VISION.md orders 9 and 14.
// After tools/portfolio-page.mjs writes the portfolio page, two blocks go where its template carries a marker:
//   "The vision, counted": bench/verdicts/vision-count.json (written by node tools/vision-count.mjs --json): its line,
//     each status word with its count, its at, and whether docs/VISION.md still counts that line when the page is built;
//   "Live": bench/verdicts/site-ask.json (bench/site-ask.mjs against the live site): the url asked, the tab nanoseconds
//     per ask, the server microseconds, the round trips, the run's at, and a GitHub run id when the file carries one.
// After web/ladder.mjs writes the ladder page, its header gains one line: the gate and the counter line, each value a
// traced span, checked with the ladder's own traceCheck before it is written (a digit on that page is a field or nothing).
// Nothing here types a number: a missing or unreadable file prints "not measured" in its block, never a digit.
const ROOT_DIR = join(HERE, '..');
export const VERDICTS_DIR = join(ROOT_DIR, 'bench', 'verdicts');
export const VISION_DOC = join(ROOT_DIR, 'docs', 'VISION.md');
export const MARKS = Object.freeze({ vision: '<!-- vision-count -->', live: '<!-- live -->', ladder: '<!-- header-line -->' });
const VPREFIX = 'bench/verdicts/';
const EMDASH_CHAR = String.fromCharCode(0x2014);
const MICRO = String.fromCharCode(0xb5) + 's';
const noDash = (s) => String(s).split(EMDASH_CHAR).join(', ');
const escHtml = (s) => noDash(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
const WORD_WHY = Object.freeze({ MET: 'a verdict file with barMet true', PARTIAL: 'a printed number under the bar', OPEN: 'no bar run yet',
  FROZEN: 'his own later order stopped it', UNSTATED: 'no status word on the line' });

/** One verdict file: its JSON, or null and a sentence (no digit in it) saying why not. */
export function readVerdict(dir, name) {
  const file = join(dir, name);
  if (!existsSyncW(file)) return { json: null, why: VPREFIX + name + ' is not on disk' };
  try {
    const json = JSON.parse(readFileSync(file, 'utf8'));
    if (!json || typeof json !== 'object' || Array.isArray(json)) return { json: null, why: VPREFIX + name + ' holds no verdict object' };
    return { json, why: null };
  } catch { return { json: null, why: VPREFIX + name + ' does not parse as JSON' }; }
}

/** The counter verdict and whether docs/VISION.md, as it is at build time, still counts the same line. */
export function visionState({ verdictsDir = VERDICTS_DIR, visionDoc = VISION_DOC } = {}) {
  let docLine = null, docSha = null;
  if (existsSyncW(visionDoc)) {
    const md = readFileSync(visionDoc, 'utf8');
    docLine = countLine(countVision(md));
    docSha = createHash('sha256').update(md).digest('hex');
  }
  const r = readVerdict(verdictsDir, 'vision-count.json');
  const j = r.json;
  if (!j) return { measured: false, why: r.why, docLine };
  const c = j.counts;
  if (typeof j.line !== 'string' || !c || typeof c !== 'object' || !isFiniteNum(j.total)) return { measured: false, why: VPREFIX + 'vision-count.json holds no counter line', docLine };
  const words = STATUS_WORDS.concat('UNSTATED');
  if (!STATUS_WORDS.every((w) => isFiniteNum(c[w])) || words.reduce((a, w) => a + (isFiniteNum(c[w]) ? c[w] : 0), 0) !== j.total) {
    return { measured: false, why: 'the counts in ' + VPREFIX + 'vision-count.json do not sum to its total', docLine };
  }
  if (countLine({ total: j.total, counts: c, unstated: Array.isArray(j.unstated) ? j.unstated : [] }) !== j.line) {
    return { measured: false, why: 'the line in ' + VPREFIX + 'vision-count.json is not the line its counts make', docLine };
  }
  return { measured: true, json: j, docLine, fresh: docLine !== null && j.line === docLine,
    sameBytes: typeof j.sourceSha256 === 'string' && docSha ? j.sourceSha256 === docSha : null };
}

/** The "The vision, counted" block of the portfolio page. */
export function visionBlock(s) {
  const head = '<section class="block" id="vision" aria-labelledby="vision-h"><h2 id="vision-h">The vision, counted</h2>';
  if (!s.measured) {
    return head + '<p class="count-line nm">not measured</p><p class="src">' + escHtml(s.why) + ' when this page was built. The count is written by <code>node tools/vision-count.mjs --json</code>, which reads his orders in docs/VISION.md.</p></section>';
  }
  const j = s.json, c = j.counts;
  const words = STATUS_WORDS.concat(c.UNSTATED ? ['UNSTATED'] : []);
  const stack = words.filter((w) => c[w] > 0).map((w) => '<span class="s-' + w.toLowerCase() + '" style="width:' + (c[w] / j.total * 100).toFixed(3) + '%"></span>').join('');
  const list = words.map((w) => '<li><b>' + escHtml(c[w]) + '</b><span class="k">' + w + '</span><span class="why">' + WORD_WHY[w] + '</span></li>').join('');
  const over = 'The project is over when MET equals the total and not before: MET is ' + escHtml(c.MET) + ' of ' + escHtml(j.total)
    + (c.MET === j.total ? ', so by his rule it is over.' : ', so it is not over.');
  let fresh;
  if (s.docLine === null) fresh = '<p class="stale">docs/VISION.md was not on disk when this page was built, so this count was not checked against it.</p>';
  else if (!s.fresh) fresh = '<p class="stale">stale: docs/VISION.md now counts ' + escHtml(s.docLine) + ' Re-run <code>node tools/vision-count.mjs --json</code> and rebuild.</p>';
  else if (s.sameBytes === false) fresh = '<p class="src">docs/VISION.md has been edited since this count and still counts this line when this page was built.</p>';
  else fresh = '<p class="src">docs/VISION.md counts this line when this page was built' + (s.sameBytes ? ', byte for byte the document that was counted' : '') + '.</p>';
  return head + '<p class="count-line" id="vision-line">' + escHtml(j.line) + '</p>'
    + '<div class="stack" role="img" aria-label="' + escHtml(j.line) + '">' + stack + '</div>'
    + '<ul class="words">' + list + '</ul>'
    + '<p class="over">' + over + '</p>'
    + '<p class="src">Counted at ' + escHtml(typeof j.at === 'string' ? j.at : 'an unrecorded time') + ' by <code>' + escHtml(typeof j.command === 'string' ? j.command : 'an unrecorded command')
    + '</code> from docs/VISION.md, where every order he gave is a numbered plan ending in a status word; read from ' + VPREFIX + 'vision-count.json when this page was built.</p>'
    + fresh + '</section>';
}

/** A dotted field of a parsed verdict, or undefined. */
function fieldOf(obj, dotted) {
  let cur = obj;
  for (const k of dotted.split('.')) { if (!cur || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, k)) return undefined; cur = cur[k]; }
  return cur;
}
export const RUN_ID_FIELDS = Object.freeze(['githubRunId', 'runId', 'github.runId', 'github.run_id', 'run.id']);

/** The "Live" block of the portfolio page, from bench/verdicts/site-ask.json. */
export function liveBlock(r) {
  const head = '<section class="block" id="live" aria-labelledby="live-h"><h2 id="live-h">Live</h2>';
  if (!r.json) return head + '<p class="count-line nm">not measured</p><p class="src">' + escHtml(r.why) + ' when this page was built. It is written by <code>bench/site-ask.mjs</code> asking the live site in a real browser.</p></section>';
  const j = r.json;
  const nr = '<span class="nm">not recorded</span>';
  const num = (v, unit) => (isFiniteNum(v) ? escHtml(v) + (unit ? ' ' + unit : '') : nr);
  const str = (v) => (typeof v === 'string' && v ? escHtml(v) : nr);
  const cut = (v, n) => { const t = String(v); return t.length > n ? t.slice(0, n - 3) + '...' : t; };
  const rows = Array.isArray(j.rows) ? j.rows.filter((x) => x && typeof x === 'object') : [];
  const tab = rows.filter((x) => Array.isArray(x.requests) && x.requests.length === 0 && isFiniteNum(x.nsPerAsk));
  const sent = rows.filter((x) => Array.isArray(x.requests) && x.requests.length > 0);
  const sr = j.serverRows && typeof j.serverRows === 'object' ? j.serverRows : {};
  const exact = sr.exact || {}, novel = sr.novel || {}, rapid = sr.rapid || {};
  const checks = j.met && typeof j.met === 'object' ? Object.values(j.met) : [];
  const runKey = RUN_ID_FIELDS.find((k) => { const v = fieldOf(j, k); return (typeof v === 'string' && v) || isFiniteNum(v); });
  const url = typeof j.url === 'string' && /^https:\/\//.test(j.url) ? j.url : null;
  const nsMin = tab.length ? Math.min(...tab.map((x) => x.nsPerAsk)) : null, nsMax = tab.length ? Math.max(...tab.map((x) => x.nsPerAsk)) : null;
  const tiles = '<div class="tiles">'
    + '<div class="tile"><div class="lbl">in the tab, no request</div><div class="val">' + (tab.length ? escHtml(nsMin) + ' to ' + escHtml(nsMax) + ' ns' : nr) + '</div><div class="sub">per ask, over ' + (tab.length ? escHtml(tab.length) : 'no') + ' prompts answered in the page</div></div>'
    + '<div class="tile"><div class="lbl">on the server</div><div class="val">' + num(fieldOf(exact, 'json.serverUs'), MICRO) + '</div><div class="sub">the arithmetic prompt on host ' + str(fieldOf(exact, 'json.host'))
    + '; median ' + num(fieldOf(rapid, 'serverUs.median'), MICRO) + ' over ' + num(fieldOf(rapid, 'serverUs.n')) + ' rapid asks</div></div>'
    + '<div class="tile"><div class="lbl">round trip</div><div class="val">' + num(exact.rttMs, 'ms') + '</div><div class="sub">the same ask, browser to server and back; median ' + num(fieldOf(rapid, 'rttMs.median'), 'ms') + ' over the rapid asks</div></div>'
    + '</div>';
  const head2 = '<p class="over">' + (url ? '<a href="' + escHtml(url) + '">' + escHtml(url) + '</a>' : nr) + ' asked at ' + str(j.at) + ' by <code>' + str(j.command) + '</code> (node ' + str(j.node) + ') in '
    + str(typeof j.browser === 'string' ? cut(j.browser, 140) : null) + '. Bar met: ' + (j.barMet === true ? 'true' : j.barMet === false ? 'false' : nr)
    + (checks.length ? ', ' + escHtml(checks.filter((v) => v === true).length) + ' of ' + escHtml(checks.length) + ' checks true' : '') + '; model calls ' + num(j.modelCalls) + '.</p>'
    + '<p class="src">' + (runKey ? 'GitHub run id ' + escHtml(fieldOf(j, runKey)) + ' (field ' + escHtml(runKey) + ').' : 'The file carries no GitHub run id.') + '</p>';
  const tabTable = tab.length ? '<div class="scroll"><table class="live"><tr><th>asked in the tab</th><th>answer</th><th>route</th><th class="n">ns per ask</th></tr>'
    + tab.map((x) => '<tr><td>' + escHtml(cut(x.prompt, 72)) + '</td><td>' + escHtml(cut(x.answer, 40)) + '</td><td>' + str(x.route) + '</td><td class="n">' + num(x.nsPerAsk) + '</td></tr>').join('') + '</table></div>' : '';
  const sentRows = sent.map((x) => '<tr><td>' + escHtml(cut(x.prompt, 72)) + '</td><td>the tab refused it; ' + escHtml(x.requests.length) + ' POST to the server, route ' + str(fieldOf(x, 'server.route'))
    + ', provider ' + str(fieldOf(x, 'server.provider')) + '</td><td class="n">' + num(fieldOf(x, 'server.serverUs'), MICRO) + '</td><td class="n">' + num(fieldOf(x, 'server.rttMs'), 'ms') + '</td></tr>');
  const srvRow = (label, row) => '<tr><td>' + label + '</td><td>status ' + num(row.status) + ', route ' + str(fieldOf(row, 'json.route')) + ', from ' + str(fieldOf(row, 'json.from')) + ' on host ' + str(fieldOf(row, 'json.host'))
    + '</td><td class="n">' + num(fieldOf(row, 'json.serverUs'), MICRO) + '</td><td class="n">' + num(row.rttMs, 'ms') + '</td></tr>';
  const rapidRow = isFiniteNum(rapid.n) ? '<tr><td>' + escHtml(rapid.n) + ' rapid repeats of the arithmetic prompt</td><td>statuses '
    + (rapid.statuses && typeof rapid.statuses === 'object' ? escHtml(Object.entries(rapid.statuses).map(([k, v]) => k + ' x' + v).join(', ')) : nr)
    + '</td><td class="n">' + num(fieldOf(rapid, 'serverUs.min')) + ' / ' + num(fieldOf(rapid, 'serverUs.median')) + ' / ' + num(fieldOf(rapid, 'serverUs.max'), MICRO)
    + '</td><td class="n">' + num(fieldOf(rapid, 'rttMs.min')) + ' / ' + num(fieldOf(rapid, 'rttMs.median')) + ' / ' + num(fieldOf(rapid, 'rttMs.max'), 'ms') + '</td></tr>' : '';
  const srvTable = '<div class="scroll"><table class="live"><tr><th>asked of the server</th><th>what came back</th><th class="n">server</th><th class="n">round trip</th></tr>'
    + (sr.exact ? srvRow('the arithmetic prompt', exact) : '') + (sr.novel ? srvRow('a prompt no cell answers', novel) : '') + sentRows.join('') + rapidRow + '</table></div>'
    + (rapidRow ? '<p class="src">Rapid rows are min / median / max.</p>' : '');
  return head + tiles + head2 + tabTable + srvTable + '<p class="src">Read from ' + VPREFIX + 'site-ask.json when this page was built.</p></section>';
}

/** The visible words of a block (tags dropped, entities decoded), for the build's own print and the tests. */
export function blockText(html) {
  return String(html).replace(/<[^>]*>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').replace(/ ([,;])/g, '$1').trim();
}

/** Put the two blocks on the written portfolio page. Throws when a marker is missing or an em dash would ship. */
export function injectPortfolio({ pagePath, verdictsDir = VERDICTS_DIR, visionDoc = VISION_DOC } = {}) {
  let page = readFileSync(pagePath, 'utf8');
  const vs = visionState({ verdictsDir, visionDoc });
  const lr = readVerdict(verdictsDir, 'site-ask.json');
  const html = { vision: visionBlock(vs), live: liveBlock(lr) };
  for (const k of ['vision', 'live']) {
    if (!page.includes(MARKS[k])) throw new Error('portfolio: the page has no ' + MARKS[k] + ' marker for the ' + k + ' block');
    page = page.replace(MARKS[k], () => html[k]);
  }
  if (page.includes(EMDASH_CHAR)) throw new Error('portfolio: an em dash reached the page');
  writeFileSync(pagePath, page);
  return {
    bytes: Buffer.byteLength(page),
    vision: vs.measured ? { measured: true, line: vs.json.line, at: vs.json.at || null, fresh: vs.fresh, docLine: vs.docLine } : { measured: false, why: vs.why, docLine: vs.docLine },
    live: lr.json ? { measured: true, url: lr.json.url || null, at: lr.json.at || null, barMet: lr.json.barMet } : { measured: false, why: lr.why },
    visionText: blockText(html.vision), liveText: blockText(html.live),
  };
}

/** The ladder header line: the gate and the counter line, every value a traced span of its verdict file. */
export function ladderHeaderLine({ verdictsDir = VERDICTS_DIR, visionDoc = VISION_DOC } = {}) {
  const span = (file, p, fmt, text) => '<span class="t" data-src="' + VPREFIX + file + ':' + p + '" data-fmt="' + fmt + '" title="' + VPREFIX + file + ', field ' + p + '">' + escHtml(text) + '</span>';
  const when = (v) => String(v).slice(0, 16).replace('T', ' ');
  const g = readVerdict(verdictsDir, 'gate.json').json;
  let gate;
  if (g && typeof g.verdict === 'string') {
    gate = 'gate on the build host ' + span('gate.json', 'verdict', 'raw', noDash(g.verdict))
      + (isFiniteNum(g.testsPassed) && isFiniteNum(g.testsTotal) ? ', ' + span('gate.json', 'testsPassed', 'raw', g.testsPassed) + ' of ' + span('gate.json', 'testsTotal', 'raw', g.testsTotal) + ' test files' : '')
      + (isFiniteNum(g.assertionsPassed) && isFiniteNum(g.assertionsFailed) ? ', ' + span('gate.json', 'assertionsPassed', 'raw', g.assertionsPassed) + ' assertions pass and ' + span('gate.json', 'assertionsFailed', 'raw', g.assertionsFailed) + ' fail' : '')
      + (typeof g.at === 'string' ? ' at ' + span('gate.json', 'at', 'when', when(g.at)) + ' UTC' : '');
  } else gate = 'gate <span class="nm">not measured</span>';
  const s = visionState({ verdictsDir, visionDoc });
  let vision;
  if (s.measured) {
    vision = 'vision ' + span('vision-count.json', 'line', 'raw', noDash(s.json.line))
      + (typeof s.json.at === 'string' ? ' at ' + span('vision-count.json', 'at', 'when', when(s.json.at)) + ' UTC' : '')
      + (s.docLine !== null && !s.fresh ? ' <span class="nm">stale: docs/VISION.md now counts another line, re-run node tools/vision-count.mjs --json</span>' : '')
      + ' <a href="../portfolio/#vision">counted</a>';
  } else vision = 'vision <span class="nm">not measured</span>';
  return { html: '<div class="hdr-line" id="hdr-line">' + gate + ' <span class="dim">/</span> ' + vision + '</div>', state: s, gate: g && typeof g.verdict === 'string' ? g.verdict : null };
}

/** Put the header line on the written ladder page, after the ladder's own traceCheck passes on it. */
export function injectLadder({ pagePath, verdictsDir = VERDICTS_DIR, visionDoc = VISION_DOC } = {}) {
  let page = readFileSync(pagePath, 'utf8');
  const h = ladderHeaderLine({ verdictsDir, visionDoc });
  const name = (label) => label.slice(VPREFIX.length);
  const check = traceCheck('<body>' + h.html + '</body>', (label) => readVerdict(verdictsDir, name(label)).json, (label) => existsSyncW(join(verdictsDir, name(label))));
  if (check.bad.length) throw new Error('ladder: the header line has ' + check.bad.length + ' untraced or mismatched numbers, first: ' + check.bad[0]);
  if (!page.includes(MARKS.ladder)) throw new Error('ladder: the page has no ' + MARKS.ladder + ' marker for the header line');
  page = page.replace(MARKS.ladder, () => h.html);
  if (page.includes(EMDASH_CHAR)) throw new Error('ladder: an em dash reached the page');
  writeFileSync(pagePath, page);
  return { bytes: Buffer.byteLength(page), numbers: check.numbers, text: blockText(h.html), gate: h.gate,
    vision: h.state.measured ? { measured: true, line: h.state.json.line, fresh: h.state.fresh } : { measured: false, why: h.state.why } };
}

/** One block of a written page by its id, or null. */
function sectionOf(html, id) {
  const i = html.indexOf('<section class="block" id="' + id + '"');
  if (i < 0) return null;
  const j = html.indexOf('</section>', i);
  return j < 0 ? null : html.slice(i, j + '</section>'.length);
}
/** The byte cap the portfolio page test has held since it was written (test/portfolio-page.test.mjs). */
export const PORTFOLIO_CAP = 160000;

/**
 * The item's own bar, measured on the pages the build just WROTE (read back from disk, not from the strings that made
 * them): node web/build.mjs --verdict writes it to bench/verdicts/web-vision.json. The control is the same block
 * builders over a verdicts directory that does not exist: they must print "not measured" and no digit.
 */
export function webVisionVerdict({ portfolioPath, ladderPath, verdictsDir = VERDICTS_DIR, visionDoc = VISION_DOC, command = 'node web/build.mjs --verdict' } = {}) {
  const page = readFileSync(portfolioPath, 'utf8'), lpage = readFileSync(ladderPath, 'utf8');
  const docLine = existsSyncW(visionDoc) ? countLine(countVision(readFileSync(visionDoc, 'utf8'))) : null;
  const vj = readVerdict(verdictsDir, 'vision-count.json').json, sj = readVerdict(verdictsDir, 'site-ask.json').json, gj = readVerdict(verdictsDir, 'gate.json').json;
  const vis = sectionOf(page, 'vision'), live = sectionOf(page, 'live');
  const lm = vis ? /<p class="count-line" id="vision-line">([^<]*)<\/p>/.exec(vis) : null;
  const lineOnPage = lm ? lm[1] : null;
  const hm = /<div class="hdr-line" id="hdr-line">[\s\S]*?<\/div>/.exec(lpage);
  const hdrText = hm ? blockText(hm[0]) : null;
  const liveText = live ? blockText(live) : '', visText = vis ? blockText(vis) : '';
  const exact = sj && sj.serverRows && sj.serverRows.exact ? sj.serverRows.exact : null;
  const tabNs = sj && Array.isArray(sj.rows) ? sj.rows.filter((x) => x && Array.isArray(x.requests) && x.requests.length === 0 && isFiniteNum(x.nsPerAsk)).map((x) => x.nsPerAsk) : [];
  const walk = walkLadder(lpage, verdictsDir);
  const absent = join(verdictsDir, 'web-vision-control-absent-dir');
  if (existsSyncW(absent)) throw new Error('web-vision: the control directory exists, so it is not a control: ' + absent);
  const ctl = {
    vision: blockText(visionBlock(visionState({ verdictsDir: absent, visionDoc }))),
    live: blockText(liveBlock(readVerdict(absent, 'site-ask.json'))),
    ladder: blockText(ladderHeaderLine({ verdictsDir: absent, visionDoc }).html),
  };
  const ctlDigits = Object.values(ctl).reduce((a, t) => a + (t.match(/\d/g) || []).length, 0);
  const checks = {
    visionBlockOnPage: vis !== null,
    lineIsTheDocumentByteForByte: docLine !== null && lineOnPage === docLine,
    lineIsTheVerdictLine: Boolean(vj) && lineOnPage === vj.line,
    everyStatusWordWithItsCount: Boolean(vj && vis) && STATUS_WORDS.every((w) => vis.includes('<li><b>' + vj.counts[w] + '</b><span class="k">' + w + '</span>')),
    verdictAtOnPage: Boolean(vj && vis) && typeof vj.at === 'string' && vis.includes(vj.at),
    overSentence: visText.includes('The project is over when MET equals the total and not before'),
    liveBlockOnPage: live !== null,
    liveUrl: Boolean(sj) && typeof sj.url === 'string' && liveText.includes(sj.url),
    liveAt: Boolean(sj) && typeof sj.at === 'string' && liveText.includes(sj.at),
    liveTabNs: tabNs.length > 0 && liveText.includes(Math.min(...tabNs) + ' to ' + Math.max(...tabNs) + ' ns'),
    liveServerUs: Boolean(exact && exact.json) && isFiniteNum(exact.json.serverUs) && liveText.includes(exact.json.serverUs + ' ' + MICRO),
    liveRoundTrip: Boolean(exact) && isFiniteNum(exact.rttMs) && liveText.includes(exact.rttMs + ' ms'),
    ladderHeaderLine: hdrText !== null && docLine !== null && hdrText.includes('vision ' + docLine) && Boolean(gj) && hdrText.includes('gate on the build host ' + gj.verdict),
    ladderEveryNumberTraced: walk.bad.length === 0,
    noEmDash: !page.includes(EMDASH_CHAR) && !lpage.includes(EMDASH_CHAR),
    portfolioUnderCap: Buffer.byteLength(page) < PORTFOLIO_CAP,
    controlNotMeasured: ctl.vision.includes('not measured') && ctl.live.includes('not measured') && ctl.ladder.includes('gate not measured') && ctl.ladder.includes('vision not measured'),
    controlNoDigit: ctlDigits === 0,
  };
  const failed = Object.keys(checks).filter((k) => !checks[k]);
  const barMet = failed.length === 0;
  return {
    at: new Date().toISOString(), command, node: process.version, isTheBar: true, barMet,
    met: checks, failed,
    portfolio: { path: 'web/dist/portfolio/index.html', bytes: Buffer.byteLength(page), cap: PORTFOLIO_CAP, visionLine: lineOnPage, visionText: visText, liveText },
    ladder: { path: 'web/dist/ladder/index.html', bytes: Buffer.byteLength(lpage), headerLine: hdrText, walkBad: walk.bad.slice(0, 5), walkNumbers: walk.numbers, walkSpans: walk.spans },
    docLine, verdictLine: vj ? vj.line : null, verdictAt: vj ? vj.at || null : null, liveAt: sj ? sj.at || null : null, liveUrl: sj ? sj.url || null : null,
    control: { what: 'the same three block builders over a verdicts directory that does not exist', dir: VPREFIX + 'web-vision-control-absent-dir', text: ctl, digits: ctlDigits },
    modelCalls: 0,
    split: {
      development: 'the verdict files on disk when the site was built (bench/verdicts/vision-count.json, site-ask.json, gate.json) and docs/VISION.md',
      heldOut: 'none',
      why: 'a page build reads files and prints them; nothing is learned or fitted, so there is no held-out set; the control is the absent directory',
      contaminated: false,
    },
    statement: 'The portfolio page on dilation.dev carries two blocks read from verdict files at build time, and the ladder page carries the same count in its header. '
      + (lineOnPage !== null ? 'The vision block prints "' + lineOnPage + '"' : 'The vision block printed no line')
      + (docLine !== null ? (lineOnPage === docLine ? ', byte for byte the line docs/VISION.md counts when the page was built' : ', while docs/VISION.md counts "' + docLine + '"') : '')
      + ', and says the project is over when MET equals the total and not before. The live block prints ' + (sj ? 'the ask of ' + sj.url + ' at ' + sj.at : 'not measured')
      + '. The ladder header line reads: ' + (hdrText || 'nothing') + '. Every number on the ladder page walks back to a field (' + walk.bad.length + ' defects). '
      + 'The control, the same builders over a directory with no verdict files, printed not measured with ' + ctlDigits + ' digits. '
      + (barMet ? 'Every check held.' : 'Checks that failed: ' + failed.join(', ') + '.'),
  };
}

export function write(opts = {}) {
  const { js, html } = bundle(opts);
  mkdirSync(DIST, { recursive: true });
  writeFileSync(join(DIST, 'app.js'), js);
  writeFileSync(join(DIST, 'index.html'), html);
  const findings = generateFindings();
  const yieldBlock = injectYield();
  const portfolio = generatePortfolio();
  portfolio.measured = injectPortfolio({ pagePath: portfolio.path });
  portfolio.bytes = portfolio.measured.bytes;
  const ladder = generateLadder();
  ladder.header = injectLadder({ pagePath: ladder.path });
  ladder.bytes = ladder.header.bytes;
  const handoff = generateHandoff();
  const ask = generateAsk();
  const alive = generateAlive({ root: ROOT_DIR, outDir: join(DIST, 'alive'), builtAt: new Date().toISOString() });
  return {
    js: Buffer.byteLength(js), html: Buffer.byteLength(html),
    total: Buffer.byteLength(js) + Buffer.byteLength(html),
    jsPath: join(DIST, 'app.js'), htmlPath: join(DIST, 'index.html'),
    findings, yieldBlock, portfolio, ladder, handoff, ask, alive,
  };
}

/**
 * The lines the build prints for the pocket and THE BODY (web/pocket.mjs, web/pocket-era.mjs): the pocket's counts, the
 * search core's state, and every file the body's worker needs with its size.
 * @param {{ bytes: number, pocket: object }} r what web/ask.mjs generateAsk returned
 */
export function pocketLines(r) {
  const p = r.pocket, e = p.era;
  const lines = ['dist ask/index.html ' + r.bytes + ' bytes; pocket: cells ' + p.cells + ', precache ' + p.precache + ' files ' + p.bytes + ' bytes, lazy '
    + p.lazy + ' files ' + p.lazyBytes + ' bytes, version ' + p.version.slice(0, 12)];
  lines.push('era: core ' + (e.core ? 'published' : 'NOT published (' + e.why + ')') + '; tasks with dev rows ' + e.tasks + ', mastered by the cloud ' + e.mastered
    + ', left out ' + e.left + '; NEO rows not served (kept off the tab) ' + e.silent);
  for (const f of e.files) lines.push('era ' + String(f.bytes).padStart(9) + ' bytes  ' + f.url);
  lines.push('era total ' + e.files.reduce((s, f) => s + f.bytes, 0) + ' bytes in ' + e.files.length + ' files');
  return lines;
}

const IS_MAIN = Boolean(process.argv[1] && process.argv[1].endsWith('build.mjs'));
const POCKET_AT = process.argv.indexOf('--pocket');
// --pocket <dir> [--root <dir>]: only /ask, the pocket and the body, into <dir>; nothing under web/dist is written.
const POCKET_MODE = IS_MAIN && POCKET_AT >= 0;

if (POCKET_MODE) {
  const dir = process.argv[POCKET_AT + 1];
  const rootAt = process.argv.indexOf('--root');
  const root = rootAt >= 0 ? process.argv[rootAt + 1] : ROOT_DIR;
  if (!dir || dir.startsWith('--') || !root || root.startsWith('--')) {
    process.stderr.write('usage: node web/build.mjs --pocket <dir> [--root <dir>]\n');
    process.exitCode = 2;
  } else {
    const r = generateAsk(resolve(dir), { root: resolve(root) });
    for (const l of pocketLines(r)) console.log(l);
  }
} else if (IS_MAIN) {
  const r = write();
  const raw = ORDER.reduce((a, f) => a + Buffer.byteLength(readFileSync(join(SRC, f), 'utf8')), 0);
  for (const f of ORDER) console.log('src  ' + f.padEnd(14) + String(Buffer.byteLength(readFileSync(join(SRC, f), 'utf8'))).padStart(7) + ' bytes');
  console.log('src  ' + 'TOTAL'.padEnd(14) + String(raw).padStart(7) + ' bytes');
  console.log('dist index.html   ' + String(r.html).padStart(7) + ' bytes');
  console.log('dist app.js       ' + String(r.js).padStart(7) + ' bytes');
  console.log('dist TOTAL        ' + String(r.total).padStart(7) + ' bytes   target 163840, cap 225280');
  console.log('dist findings/index.html ' + String(r.findings.bytes).padStart(7) + ' bytes   '
    + r.findings.verdicts + ' verdicts, ' + r.findings.values + ' values, ' + r.findings.nulls + ' null or negative');
  console.log('dist findings yield block ' + (r.yieldBlock.skipped ? 'skipped (' + r.yieldBlock.reason + ')' : r.yieldBlock.message ? r.yieldBlock.message
    : r.yieldBlock.rows + ' verdict rows, ' + r.yieldBlock.ledgerRuns + ' ledger runs; newest ' + r.yieldBlock.newest + ' at ' + r.yieldBlock.newestAt + ' kept per hour ' + r.yieldBlock.newestKeptPerHour));
  console.log('dist portfolio/index.html ' + String(r.portfolio.bytes).padStart(6) + ' bytes   '
    + r.portfolio.paragraphs + ' paragraphs from docs/PORTFOLIO.md (' + r.portfolio.mdBytes + ' bytes, served as portfolio/PORTFOLIO.md); gate '
    + (r.portfolio.gateVerdict || 'none') + ' at ' + (r.portfolio.gateAt || 'none'));
  const pv = r.portfolio.measured.vision, pl = r.portfolio.measured.live;
  console.log('dist portfolio vision block: ' + (pv.measured ? pv.line + ' at ' + pv.at + (pv.fresh ? ' (docs/VISION.md counts the same line)' : ' (STALE: docs/VISION.md counts ' + pv.docLine + ')') : 'not measured (' + pv.why + ')'));
  console.log('dist portfolio live block: ' + (pl.measured ? pl.url + ' asked at ' + pl.at + ', barMet ' + pl.barMet : 'not measured (' + pl.why + ')'));
  console.log('dist ladder/index.html ' + String(r.ladder.bytes).padStart(9) + ' bytes   ' + r.ladder.numbers + ' numbers traced in ' + r.ladder.spans
    + ' spans from ' + r.ladder.files + ' verdict files; ' + r.ladder.sets.map((x) => x.key + ' ' + x.status).join(', ')
    + '; native ' + r.ladder.native.status + ', years ' + r.ladder.years.status);
  console.log('dist ladder header line: ' + r.ladder.header.text + ' (' + r.ladder.header.numbers + ' numbers traced)');
  console.log('dist handoff/index.html ' + String(r.handoff.bytes).padStart(8) + ' bytes   '
    + (r.handoff.missing ? 'docs/HANDOFF.md absent: run node tools/handoff.mjs' : r.handoff.sections + ' sections, ' + r.handoff.blocks + ' blocks, '
      + r.handoff.commands + ' command lines from docs/HANDOFF.md (' + r.handoff.mdBytes + ' bytes, served as handoff/HANDOFF.md)'));
  console.log('dist ask/index.html ' + String(r.ask.bytes).padStart(12) + ' bytes   organism modules ' + r.ask.modules + ' copied byte for byte: ' + r.ask.manifest.files.map((f) => f.file + ' sha256 ' + f.sha256.slice(0, 12)).join(', '));
  for (const l of pocketLines(r.ask)) console.log(l);
  const al = r.alive;
  console.log('dist alive/index.html ' + String(al.bytes).padStart(10) + ' bytes   cap ' + al.cap + '; ' + al.generations + ' generations, ' + al.cells + ' cells, newest '
    + (al.newest === null ? 'none yet' : 'generation ' + al.newest + ' (' + al.survivors + ' of ' + al.candidates + ' survived)') + ', ' + al.dreams + ' dreams, cortex ' + al.pointer
    + '; alive/data.json ' + al.dataBytes + ' bytes' + (al.notRead.length ? '; not read: ' + al.notRead.join(', ') : ''));
  const pages = ['index.html', 'findings/index.html', 'portfolio/index.html', 'ladder/index.html', 'handoff/index.html', 'ask/index.html', 'alive/index.html'];
  console.log('pages built: ' + pages.length + ' (' + pages.join(', ') + ')');
  // --verdict (board 24b, item web-vision): the portfolio and ladder blocks measured on the pages just written
  if (process.argv.includes('--verdict')) {
    const v = webVisionVerdict({ portfolioPath: r.portfolio.path, ladderPath: r.ladder.path });
    const out = join(VERDICTS_DIR, 'web-vision.json');
    const text = JSON.stringify(v, null, 2) + '\n';
    writeFileSync(out, text);
    for (const [k, ok] of Object.entries(v.met)) console.log('web-vision ' + (ok ? 'ok  ' : 'FAIL') + ' ' + k);
    console.log('web-vision control: ' + v.control.digits + ' digits; ' + v.control.text.ladder);
    console.log('wrote bench/verdicts/web-vision.json (' + Buffer.byteLength(text) + ' bytes) barMet ' + v.barMet);
  }
}

// /tools: the Code Universe factory (his 2026-09-13 order; it lived at dilation.dev/tools/ from the
// universe/factory deploy and a later whole-site deploy of web/dist removed it). Static, copied verbatim.
import { cpSync as cpSyncTools } from 'node:fs';
if (!POCKET_MODE) {
  cpSyncTools(new URL('./tools/', import.meta.url), new URL('./dist/tools/', import.meta.url), { recursive: true });
  console.log('tools: /tools copied from web/tools');
}
