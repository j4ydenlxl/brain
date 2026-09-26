// bench/yield-site.mjs: THE KEPT-PER-HOUR LINE, READ BACK FROM THE BUILT SITE (queue item 7, the CLOUD part).
// Author: board 20 builder (board 21, item yield), 2026-09-26.
//
// His words (docs/CLOUD-SESSION.md, item 7): "the kept-per-hour line and the organism-years line on
// the site, read from the verdict, so the loop's yield is visible without a terminal." The block is
// web/yield.mjs (registered in web/build.mjs); this is its site bar. What it does:
//
//   1. copies the tree to a temp directory (without organism/, state/, bench/fixtures/, web/dist/,
//      .git/ and node_modules/) and runs node web/build.mjs there SEVEN times: with the live clock,
//      block off twice (the run-to-run noise) and on once; with the clock frozen at one instant
//      (node --import of a module written into the temp directory), off twice and on twice. The real
//      web/dist is never written. BRAIN_YIELD_BLOCK=off is the control switch.
//   2. hashes every file each build wrote (sha256) and prints the pages. A build stamps its clock
//      into three pages, so with the live clock no two builds are byte-identical; the noise is
//      printed and must vanish when those three stamps are masked. With the frozen clock the builds
//      must be reproducible, every file but findings/index.html must be byte-identical off and on
//      by raw sha256, and the findings page must be the off page plus the block, byte for byte.
//   3. reads the block back out of the built findings page and compares EVERY number in it with the
//      verdict files, by its own code (this file does not import tools/yield.mjs): a field is read
//      at its path and must print the same; hours and kept per hour are recomputed from the fields;
//      the ledger counts are recounted from bench/verdicts/autopilot/*.jsonl; the summary is
//      recomputed from scratch. A digit in the block outside a tagged span is a failure. The newest
//      verdict (largest "at" of autopilot.json, autopilot-*.json, soak.json, soak-history.jsonl)
//      must be the one the block names first, with its at beside it.
//   4. CONTROLS: a copy of the block with one number changed must FAIL the comparison (a checker
//      that cannot fail proves nothing), and the off build must carry no block.
//
// Verdict: bench/verdicts/yield-site.json (isTheBar true). With no autopilot verdict in the verdict
// directory it prints "no autopilot verdict on this host" and writes yield-site-partial.json
// (isTheBar false) without building.
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/yield-site.mjs
//   options: --verdicts DIR (default bench/verdicts), --out-dir DIR (default bench/verdicts), --root DIR (the tree to copy)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const BEGIN = '<!-- yield:begin -->';
export const END = '<!-- yield:end -->';
export const NO_VERDICT = 'no autopilot verdict on this host';
const HOUR = 3600000, DAY = 86400000, SEVEN = 7;
const TOL = 5e-5 + 1e-9; // a value printed at 4 places is within half a unit of its exact value
const EXCLUDE = new Set(['organism', 'state', '.git', 'node_modules', 'web/dist', 'bench/fixtures']);
const FINDINGS = 'findings/index.html';
const PAGES = ['index.html', 'findings/index.html', 'portfolio/index.html', 'ladder/index.html', 'handoff/index.html', 'ask/index.html'];

const say = (s) => console.log(s);
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const get = (o, p) => { for (const k of p.split('.')) { if (o == null || typeof o !== 'object') return undefined; o = o[k]; } return o; };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };

// ------------------------------------------------------------------ the verdicts, read by this file

/** Every verdict the block may cite, read here: { files: Map ref -> json, rows, ledger: Map runId -> run }. */
export function readSources(dir) {
  const files = new Map(), rows = [], ledger = new Map();
  if (!isDir(dir)) return { files, rows, ledger, names: [] };
  const names = fs.readdirSync(dir);
  for (const n of names.filter((x) => x === 'autopilot.json' || /^autopilot-.+\.json$/.test(x) || x === 'soak.json')) {
    let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, n), 'utf8')); } catch { continue; }
    files.set(n, j);
    if (n === 'soak.json') rows.push({ ref: n, file: n, line: null, kind: 'soak', at: j.at, startedAt: get(j, 'soak.startedAt'), runId: get(j, 'soak.runId'), kept: get(j, 'totals.kept'), ms: get(j, 'soak.elapsedMs'), dry: get(j, 'soak.cfg.dry') === true });
    else rows.push({ ref: n, file: n, line: null, kind: 'autopilot', at: j.at, startedAt: null, runId: null, kept: get(j, 'realTree.counts.kept'), ms: get(j, 'realTree.ms'), dry: get(j, 'realTree.dry') === true });
  }
  if (names.includes('soak-history.jsonl')) {
    fs.readFileSync(path.join(dir, 'soak-history.jsonl'), 'utf8').split('\n').forEach((l, i) => {
      if (!l.trim()) return;
      let e; try { e = JSON.parse(l); } catch { return; }
      if (!e || !e.previous) return;
      const ref = 'soak-history.jsonl:' + (i + 1), p = e.previous;
      files.set(ref, e);
      rows.push({ ref, file: 'soak-history.jsonl', line: i + 1, kind: 'soak', at: p.at, startedAt: get(p, 'soak.startedAt'), runId: get(p, 'soak.runId'), kept: get(p, 'totals.kept'), ms: get(p, 'soak.elapsedMs'), dry: get(p, 'soak.cfg.dry') === true });
    });
  }
  const ldir = path.join(dir, 'autopilot');
  if (isDir(ldir)) for (const f of fs.readdirSync(ldir).filter((x) => x.endsWith('.jsonl'))) {
    for (const l of fs.readFileSync(path.join(ldir, f), 'utf8').split('\n')) {
      let r; try { r = JSON.parse(l); } catch { continue; }
      if (!r || typeof r.runId !== 'string') continue;
      const g = ledger.get(r.runId) || { records: 0, kept: 0, candidates: 0, calls: 0, ms: [], first: null, last: null, files: new Set() };
      ledger.set(r.runId, g);
      g.files.add('autopilot/' + f);
      g.records += 1;
      g.kept += r.decision === 'kept' ? 1 : 0;
      g.candidates += r.candidate === true ? 1 : 0;
      if (r.model && typeof r.model.calls === 'number') g.calls += r.model.calls;
      if (r.model && Array.isArray(r.model.ms)) for (const x of r.model.ms) if (typeof x === 'number') g.ms.push(x);
      if (typeof r.at === 'string') { if (!g.first || r.at < g.first) g.first = r.at; if (!g.last || r.at > g.last) g.last = r.at; }
    }
  }
  return { files, rows, ledger, names };
}

/** The summary, recomputed here from the sources (the definition in tools/yield.mjs, written again). */
export function recompute(src) {
  const rows = src.rows.filter((r) => typeof r.at === 'string');
  if (!rows.length && !src.ledger.size) return null;
  let newest = null;
  for (const r of rows) if (!newest || r.at > newest.at) newest = r;
  const starts = [...src.rows.map((r) => r.startedAt || r.at), ...[...src.ledger.values()].map((g) => g.first || g.last)].filter(Boolean).sort();
  const spanStart = starts[0];
  const spanEnd = newest ? newest.at : [...src.ledger.values()].map((g) => g.last).sort().pop();
  const spanMs = Date.parse(spanEnd) - Date.parse(spanStart);
  const seven = spanMs >= SEVEN * DAY;
  const windowStart = seven ? new Date(Date.parse(spanEnd) - SEVEN * DAY).toISOString() : spanStart;
  const windowMs = seven ? SEVEN * DAY : spanMs;
  const inW = (at) => at && at >= windowStart && at <= spanEnd;
  const latest = new Map();
  for (const r of src.rows) if (r.kind === 'soak' && r.runId) { const w = latest.get(r.runId); if (!w || r.at >= w.at) latest.set(r.runId, r); }
  const summed = [...latest.values()].filter((r) => !r.dry && inW(r.at) && typeof r.kept === 'number' && typeof r.ms === 'number' && r.ms > 0);
  const keptSum = summed.reduce((a, r) => a + r.kept, 0);
  const wallMs = summed.reduce((a, r) => a + r.ms, 0);
  const only = [...src.ledger.entries()].filter(([id, g]) => !latest.has(id) && inW(g.last));
  const allKept = keptSum + only.reduce((a, [, g]) => a + g.kept, 0);
  return {
    newest, spanStart, spanEnd, spanDays: spanMs / DAY, sevenDays: seven, windowStart, windowHours: windowMs / HOUR,
    keptSum, soakRuns: summed.length, wallHoursSum: summed.length ? wallMs / HOUR : null, keptPerLoopHour: wallMs > 0 ? keptSum * HOUR / wallMs : null,
    allKept, allRuns: summed.length + only.length, ledgerOnlyRuns: only.length, keptPerWindowHour: windowMs > 0 ? allKept * HOUR / windowMs : null,
    dryRows: src.rows.filter((r) => r.dry).length,
  };
}

// ------------------------------------------------------------------ reading the block back

/** The block between the markers, or null. */
export function extractBlock(html) {
  const b = html.indexOf(BEGIN), e = html.indexOf(END);
  return b >= 0 && e > b ? html.slice(b, e + END.length) : null;
}

function resolveRef(src, ref) {
  const h = ref.indexOf('#');
  const file = ref.slice(0, h), p = ref.slice(h + 1);
  if (!src.files.has(file)) return { ok: false, why: 'no verdict ' + file };
  const v = get(src.files.get(file), p);
  return v === undefined ? { ok: false, why: 'nothing at ' + ref } : { ok: true, v };
}

const close = (page, exact) => typeof exact === 'number' && Number.isFinite(exact) && Math.abs(Number(page) - exact) <= TOL && /^-?\d+(\.\d+)?$/.test(page);

/**
 * Compare every number in the block with the verdicts in dir.
 * Returns { found, numbers, matched, problems, newest, newestNamed, newestPrinted, ... }.
 */
export function checkBlock(html, dir) {
  const src = readSources(dir);
  const block = extractBlock(html);
  const out = { found: !!block, numbers: 0, matched: 0, fields: 0, derived: 0, summary: 0, files: 0, runs: 0, problems: [], newest: null, newestNamed: false, newestPrinted: null, newestKept: null };
  if (!block) { out.problems.push('no yield block on the page'); return out; }
  const sum = recompute(src);
  const body = block.replace(/<style[\s\S]*?<\/style>/g, ' ');
  const spans = [];
  const re = /<span([^>]*)>([^<]*)<\/span>/g;
  let m;
  while ((m = re.exec(body))) {
    const attrs = {};
    for (const a of m[1].matchAll(/data-yield-([a-z]+)="([^"]*)"/g)) attrs[a[1]] = decode(a[2]);
    if (Object.keys(attrs).length) spans.push({ attrs, text: decode(m[2]).trim(), index: m.index });
  }
  const bad = (s, why) => out.problems.push(why + ' (page reads ' + JSON.stringify(s.text) + ')');
  let firstFile = null, firstRate = null;
  for (const s of spans) {
    const a = s.attrs;
    const hasDigit = /\d/.test(s.text);
    if (a.src != null) {
      out.fields++; out.numbers += hasDigit ? 1 : 0;
      const r = resolveRef(src, a.src);
      if (!r.ok) bad(s, r.why);
      else if (String(r.v) !== s.text) bad(s, a.src + ' is ' + JSON.stringify(r.v) + ' in the verdict');
      else out.matched++;
    } else if (a.derived != null) {
      out.derived++; out.numbers += hasDigit ? 1 : 0;
      const of = (a.of || '').split(' ').filter(Boolean);
      const f = a.derived;
      let exact, str = false;
      const val = (i) => { const r = resolveRef(src, of[i]); return r.ok ? r.v : undefined; };
      const run = () => src.ledger.get((of[0] || '').replace(/^run:/, ''));
      if (f === 'hours') exact = typeof val(0) === 'number' ? val(0) / HOUR : undefined;
      else if (f === 'perHour') exact = typeof val(0) === 'number' && typeof val(1) === 'number' && val(1) > 0 ? val(0) * HOUR / val(1) : undefined;
      else if (f === 'magnitude') { const mm = /=\s*([\d.]+)\s*kept\/hour/.exec(String(val(0) || '')); exact = mm ? Number(mm[1]) : undefined; }
      else if (f === 'meanModelMs') { const xs = Object.values(val(0) || {}).flatMap((x) => (Array.isArray(x?.modelMs) ? x.modelMs : [])); exact = xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length / 1000 : undefined; }
      else if (f.startsWith('ledger')) {
        const g = run();
        if (!g) exact = undefined;
        else if (f === 'ledgerRecords') exact = g.records;
        else if (f === 'ledgerKept') exact = g.kept;
        else if (f === 'ledgerCandidates') exact = g.candidates;
        else if (f === 'ledgerModelCalls') exact = g.calls;
        else if (f === 'ledgerMeanSeconds') exact = g.ms.length ? g.ms.reduce((p, q) => p + q, 0) / g.ms.length / 1000 : undefined;
        else if (f === 'ledgerFirstAt') { exact = g.first; str = true; }
        else if (f === 'ledgerLastAt') { exact = g.last; str = true; }
        else if (f === 'ledgerPerHour') { const ms = val(1); exact = typeof ms === 'number' && ms > 0 ? g.kept * HOUR / ms : undefined; }
      } else if (f.startsWith('summary.')) {
        out.summary++;
        const k = f.slice(8);
        exact = sum ? sum[k] : undefined;
        str = typeof exact === 'string';
      }
      if (exact === undefined || exact === null) bad(s, f + ' has no value in the verdicts');
      else if (str ? exact !== s.text : !close(s.text, exact)) bad(s, f + ' of ' + (a.of || 'the summary') + ' is ' + exact);
      else out.matched++;
      if (f === 'perHour' && firstRate == null) firstRate = { of, text: s.text, exact };
    } else if (a.file != null) {
      out.files++;
      const want = a.file + (a.line ? ' line ' + a.line : '');
      if (s.text !== want) bad(s, 'a file span claims ' + want);
      else if (!fs.existsSync(path.join(dir, a.file))) bad(s, 'names a file that does not exist: ' + a.file);
      else if (a.line && !src.files.has(a.file + ':' + a.line)) bad(s, 'names a line that holds no soak verdict: ' + want);
      else out.matched++;
      if (firstFile == null) firstFile = a.file + (a.line ? ':' + a.line : '');
    } else if (a.run != null) {
      out.runs++;
      if (s.text !== a.run || !src.ledger.has(a.run)) bad(s, 'names a run the ledger does not hold: ' + a.run);
      else out.matched++;
    } else if (a.const != null) {
      if (!(a.const === 'WINDOW_DAYS' && s.text === String(SEVEN))) bad(s, 'a constant that is not the seven day window');
      else out.matched++;
    }
  }
  // no digit may stand outside a tagged span
  const rest = decode(body.replace(/<span[^>]*data-yield-[^>]*>[^<]*<\/span>/g, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]*>/g, ' '));
  const stray = rest.match(/\d[\d.,:]*/g);
  if (stray) out.problems.push('digits outside a tagged span: ' + stray.slice(0, 8).join(' '));
  // the newest verdict is named first, its at beside it, and its rate is the block's first rate
  if (sum && sum.newest) {
    const n = sum.newest;
    out.newest = { ref: n.ref, at: n.at, kept: n.kept, ms: n.ms };
    out.newestKept = n.kept;
    const atRef = n.ref + '#' + (n.line ? 'previous.' : '') + 'at';
    const atShown = spans.some((s) => s.attrs.src === atRef && s.text === n.at);
    out.newestNamed = firstFile === n.ref && atShown;
    if (!out.newestNamed) out.problems.push('the block does not name the newest verdict ' + n.ref + ' at ' + n.at + ' first (it names ' + firstFile + ')');
    out.newestPrinted = firstRate ? firstRate.text : null;
    if (!firstRate || !(firstRate.of[0] || '').startsWith(n.ref + '#')) out.problems.push('the first kept per hour is not the newest verdict\'s');
  } else out.problems.push('no newest verdict in ' + dir);
  return out;
}

/** The control: the same block with one printed number changed. Returns the tampered html. */
export function tamper(html) {
  return html.replace(/(<span[^>]*data-yield-src="[^"#]*#[^"]*(?:totals\.attempts|counts\.candidates)"[^>]*>)(\d+)(<\/span>)/, (m, a, d, c) => a + String(Number(d) + 1) + c);
}

// ------------------------------------------------------------------ the build, off and on

function copyTree(from, to) {
  fs.cpSync(from, to, {
    recursive: true,
    filter: (s) => {
      const rel = path.relative(from, s).split(path.sep).join('/');
      if (!rel) return true;
      for (const x of EXCLUDE) if (rel === x || rel.startsWith(x + '/')) return false;
      return true;
    },
  });
}

function hashDir(dir) {
  const out = {};
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else out[path.relative(dir, p).split(path.sep).join('/')] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    }
  };
  if (isDir(dir)) walk(dir);
  return out;
}


// A build stamps its own clock into three pages (findings gen:generatedAt, the ladder's generated
// meta, the portfolio footer), so no two builds are byte-identical with a live clock: measured on
// this host, off against off, those three files differ and nothing else does. The comparison is
// therefore made twice. LIVE: the real clock, the noise printed, the stamps masked by these three
// patterns only. FROZEN: every build started with --import of a module (written into the temp
// directory, never the tree) that fixes Date to one instant, the same for off and on, so the builds
// are reproducible and the other files are compared by raw sha256 with no mask at all.
const STAMPS = [
  /(data-src="gen:generatedAt">)[^<]*(<\/span>)/,
  /(<meta name="generated" content=")[^"]*(">)/,
  /(<footer>generated )\S+( from)/,
];
const mask = (page) => STAMPS.reduce((s, re) => s.replace(re, '$1MASKED$2'), page);
const FREEZE = 'const FIXED = Number(process.env.YIELD_FROZEN_MS);\n'
  + 'const R = Date;\n'
  + 'function D(...a) { if (!new.target) return new R(FIXED).toString(); return a.length ? new R(...a) : new R(FIXED); }\n'
  + 'D.prototype = R.prototype; D.now = () => FIXED; D.parse = R.parse; D.UTC = R.UTC;\n'
  + 'globalThis.Date = D;\n';

function build(copy, blockOn, label, freeze) {
  fs.rmSync(path.join(copy, 'web', 'dist'), { recursive: true, force: true });
  const env = { ...process.env, BRAIN_YIELD_BLOCK: blockOn ? 'on' : 'off' };
  const args = ['web/build.mjs'];
  if (freeze) { env.YIELD_FROZEN_MS = String(freeze.ms); args.unshift('--import', freeze.url); }
  const t0 = process.hrtime.bigint();
  const r = spawnSync(process.execPath, args, { cwd: copy, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const dist = path.join(copy, 'web', 'dist');
  const hashes = hashDir(dist);
  const text = {};
  for (const p of PAGES) if (fs.existsSync(path.join(dist, p))) text[p] = fs.readFileSync(path.join(dist, p), 'utf8');
  const line = (r.stdout || '').split('\n').find((l) => l.startsWith('dist findings yield block')) || null;
  say('build ' + label + ' (block ' + (blockOn ? 'on' : 'off') + ', clock ' + (freeze ? 'frozen at ' + new Date(freeze.ms).toISOString() : 'live') + '): exit ' + r.status + ' in ' + ms.toFixed(0) + ' ms, '
    + Object.keys(hashes).length + ' files' + (line ? '; ' + line : ''));
  if (r.status !== 0) say('build ' + label + ' stderr: ' + String(r.stderr || '').split('\n').slice(0, 6).join(' | '));
  return { label, blockOn, frozen: !!freeze, exit: r.status, ms: Math.round(ms), files: Object.keys(hashes).length, hashes, text, findings: text[FINDINGS] || '', line };
}

const differ = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]).sort();

/** The on page with the block (and the blank line insertBlock adds) taken out. */
function withoutBlock(onPage) {
  const b = onPage.indexOf(BEGIN), e = onPage.indexOf(END);
  if (b < 0 || e < b) return null;
  let rest = onPage.slice(0, b) + onPage.slice(e + END.length);
  if (rest.slice(b, b + 2) === '\n\n') rest = rest.slice(0, b) + rest.slice(b + 2);
  return rest;
}

/** Of the files that differ between two builds, those that are still different with the stamps masked. */
function beyondStamps(a, b, files) {
  return files.filter((k) => {
    if (k === FINDINGS && a.findings.includes(BEGIN) !== b.findings.includes(BEGIN)) return false; // the block is compared on its own
    if (!(k in a.text) || !(k in b.text)) return true;
    return mask(a.text[k]) !== mask(b.text[k]);
  });
}

function wrapperCommand() {
  try {
    const argv = fs.readFileSync('/proc/' + process.ppid + '/cmdline', 'utf8').split('\0').filter(Boolean);
    if (argv.some((a) => a.endsWith('tools/budget.mjs'))) return argv.map((a, i) => (i === 0 ? 'node' : a)).join(' ');
  } catch { /* not Linux, or no parent to read */ }
  return null;
}

// ------------------------------------------------------------------ main

export function run(args) {
  const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? path.resolve(args[i + 1]) : d; };
  const dir = opt('--verdicts', path.join(ROOT, 'bench', 'verdicts'));
  const outDir = opt('--out-dir', path.join(ROOT, 'bench', 'verdicts'));
  const root = opt('--root', ROOT);
  const command = wrapperCommand() || ('node bench/yield-site.mjs' + (args.length ? ' ' + args.join(' ') : ''));
  const base = { at: null, command, node: process.version };
  const src = readSources(dir);
  const relDir = path.relative(ROOT, dir).split(path.sep).join('/') || '.';
  if (!src.rows.length && !src.ledger.size) {
    say(NO_VERDICT);
    const file = path.join(outDir, 'yield-site-partial.json');
    const v = { ...base, at: new Date().toISOString(), isTheBar: false, barMet: false, notTheBarBecause: NO_VERDICT + ' (' + relDir + ')',
      split: { development: 'none: no verdict to read', heldOut: 'none', contaminated: false },
      statement: 'The verdict directory ' + relDir + ' holds no autopilot verdict, no soak verdict and no ledger, so the block prints "' + NO_VERDICT + '" and there is no number to compare; the site was not built.' };
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    say('wrote ' + path.relative(ROOT, file).split(path.sep).join('/'));
    return v;
  }
  say('verdicts read from ' + relDir + ': ' + src.rows.length + ' verdict rows (' + [...src.files.keys()].join(', ') + '), ' + src.ledger.size + ' ledger runs');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'yield-site-'));
  const copy = path.join(tmp, 'brain');
  const freezeFile = path.join(tmp, 'freeze-clock.mjs');
  const freeze = { ms: Date.parse(new Date().toISOString().slice(0, 19) + 'Z'), url: pathToFileURL(freezeFile).href };
  let B = {}, check = null, control = null, copyMs = 0;
  try {
    const t0 = Date.now();
    copyTree(root, copy);
    copyMs = Date.now() - t0;
    fs.writeFileSync(freezeFile, FREEZE);
    say('copy of the tree in ' + copyMs + ' ms (without ' + [...EXCLUDE].join(', ') + ')');
    B.liveOff1 = build(copy, false, 'live-off-1');
    B.liveOff2 = build(copy, false, 'live-off-2');
    B.liveOn1 = build(copy, true, 'live-on-1');
    B.frozenOff1 = build(copy, false, 'frozen-off-1', freeze);
    B.frozenOff2 = build(copy, false, 'frozen-off-2', freeze);
    B.frozenOn1 = build(copy, true, 'frozen-on-1', freeze);
    B.frozenOn2 = build(copy, true, 'frozen-on-2', freeze);
    check = checkBlock(B.frozenOn1.findings, dir);
    const t = tamper(B.frozenOn1.findings);
    const tc = t !== B.frozenOn1.findings ? checkBlock(t, dir) : null;
    control = { tampered: t !== B.frozenOn1.findings, caught: !!(tc && tc.problems.length), problems: tc ? tc.problems.slice(0, 2) : [] };
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    say('temp copy deleted: ' + (!fs.existsSync(tmp) ? 'yes' : 'NO'));
  }
  const builds = Object.values(B);
  const allExit0 = builds.length === 7 && builds.every((b) => b.exit === 0);
  const { liveOff1, liveOff2, liveOn1, frozenOff1, frozenOff2, frozenOn1, frozenOn2 } = B;

  // LIVE clock: the noise, then off against on with the three stamps masked
  const liveNoise = differ(liveOff1.hashes, liveOff2.hashes);
  const liveNoiseBeyond = beyondStamps(liveOff1, liveOff2, liveNoise);
  const liveEffect = differ(liveOff1.hashes, liveOn1.hashes);
  const liveEffectBeyond = beyondStamps(liveOff1, liveOn1, liveEffect).filter((k) => k !== FINDINGS);
  say('LIVE clock noise, off-1 against off-2: ' + liveNoise.length + ' files differ (' + (liveNoise.join(', ') || 'none') + '); with the build stamps masked: ' + liveNoiseBeyond.length);
  say('LIVE clock, off against on: ' + liveEffect.length + ' files differ (' + (liveEffect.join(', ') || 'none') + '); other than the findings page, with the stamps masked: ' + liveEffectBeyond.length);

  // FROZEN clock: reproducible builds, raw sha256, no mask
  const frozenNoiseOff = differ(frozenOff1.hashes, frozenOff2.hashes);
  const frozenNoiseOn = differ(frozenOn1.hashes, frozenOn2.hashes);
  const frozenEffect = differ(frozenOff1.hashes, frozenOn1.hashes);
  const others = frozenEffect.filter((k) => k !== FINDINGS);
  const otherNames = Object.keys(frozenOff1.hashes).filter((k) => k !== FINDINGS);
  say('FROZEN clock noise, off-1 against off-2: ' + frozenNoiseOff.length + ' files differ; on-1 against on-2: ' + frozenNoiseOn.length + ' files differ');
  for (const p of PAGES) say('sha256 ' + p.padEnd(22) + ' off ' + (frozenOff1.hashes[p] || 'absent') + '  on ' + (frozenOn1.hashes[p] || 'absent') + '  ' + (frozenOff1.hashes[p] === frozenOn1.hashes[p] ? 'same' : 'DIFFERS'));
  say('FROZEN clock, off against on: ' + (otherNames.length - others.length) + ' of ' + otherNames.length + ' files other than findings/index.html byte-identical' + (others.length ? '; differ: ' + others.join(', ') : ''));
  const stripped = withoutBlock(frozenOn1.findings);
  const onlyBlock = stripped != null && stripped === frozenOff1.findings;
  say('findings page: the on page minus the block is byte-identical to the off page (frozen clock, no mask): ' + (onlyBlock ? 'yes' : 'NO'));
  const blockLive = extractBlock(liveOn1.findings), blockFrozen = extractBlock(frozenOn1.findings);
  const clockFree = blockLive != null && blockLive === blockFrozen;
  say('the block built on the live clock equals the block built on the frozen clock (no number read from a clock): ' + (clockFree ? 'yes' : 'NO'));
  const offBlock = extractBlock(frozenOff1.findings) != null || extractBlock(liveOff1.findings) != null;
  say('control, block off: an off build carries a block: ' + (offBlock ? 'YES' : 'no'));
  say('block numbers: ' + check.numbers + ' numbers (' + check.fields + ' fields, ' + check.derived + ' derived of which ' + check.summary + ' summary), '
    + check.files + ' file names, ' + check.runs + ' runs; ' + check.matched + ' spans matched, ' + check.problems.length + ' problems');
  for (const p of check.problems.slice(0, 10)) say('  problem: ' + p);
  say('newest verdict: ' + (check.newest ? check.newest.ref + ' at ' + check.newest.at + ', kept ' + check.newest.kept + ', wall ' + check.newest.ms + ' ms' : 'none')
    + '; named first with its at: ' + (check.newestNamed ? 'yes' : 'NO') + '; the page prints ' + check.newestPrinted + ' kept per hour');
  say('control, one number changed on a copy of the block: caught ' + (control.caught ? 'yes' : 'NO') + (control.problems[0] ? ' (' + control.problems[0] + ')' : ''));

  const checks = {
    buildsExit0: allExit0,
    frozenBuildsReproducible: frozenNoiseOff.length === 0 && frozenNoiseOn.length === 0,
    otherFilesIdentical: others.length === 0 && otherNames.length > 0 && Object.keys(frozenOn1.hashes).length === Object.keys(frozenOff1.hashes).length,
    findingsChangedOnlyByBlock: onlyBlock,
    liveDiffersOnlyInStamps: liveNoiseBeyond.length === 0 && liveEffectBeyond.length === 0,
    blockIndependentOfClock: clockFree,
    blockOnPage: check.found,
    everyNumberMatches: check.found && check.problems.length === 0 && check.numbers > 0,
    newestNamed: check.newestNamed,
    controlOffHasNoBlock: !offBlock,
    controlTamperCaught: control.caught,
  };
  const barMet = Object.values(checks).every(Boolean);
  const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);
  const pages = {};
  for (const p of PAGES) pages[p] = { off: frozenOff1.hashes[p] || null, on: frozenOn1.hashes[p] || null, same: frozenOff1.hashes[p] === frozenOn1.hashes[p] };
  const v = {
    ...base, at: new Date().toISOString(), item: 'yield (queue item 7, the CLOUD part)', board: 'BOARD 21', isTheBar: true, barMet,
    bar: 'every number in the kept-per-hour block on the built findings page equals its verdict, the newest verdict is named beside its number, and every other file of the built site is byte-identical with the block off and on',
    split: {
      development: 'the verdict files the block reads, in ' + relDir + ': ' + [...src.files.keys()].join(', ') + ', and the ledger autopilot/*.jsonl (' + src.ledger.size + ' runs)',
      heldOut: 'none: the bar compares the built page with the same files it was built from, so nothing is held out; the controls are the builds with the block off, a second build of each (the noise), and a copy of the block with one number changed',
      contaminated: false,
    },
    checks, failed,
    newest: check.newest ? { ...check.newest, named: check.newestNamed, printedKeptPerHour: check.newestPrinted } : null,
    numbers: { total: check.numbers, fields: check.fields, derived: check.derived, summary: check.summary, fileNames: check.files, runs: check.runs, matched: check.matched, problems: check.problems },
    controls: { blockOffCarriesBlock: offBlock, tamper: control },
    builds: builds.map((b) => ({ label: b.label, blockOn: b.blockOn, frozenClock: b.frozen, exit: b.exit, ms: b.ms, files: b.files, yieldLine: b.line })),
    clock: { frozenAt: new Date(freeze.ms).toISOString(), how: 'node --import <temp>/freeze-clock.mjs web/build.mjs: Date and Date.now fixed to one instant for every frozen build', stamps: STAMPS.map(String) },
    live: { noiseOffVsOff: liveNoise, noiseBeyondStamps: liveNoiseBeyond, differOffVsOn: liveEffect, differBeyondStampsOtherThanFindings: liveEffectBeyond },
    frozen: { noiseOffVsOff: frozenNoiseOff, noiseOnVsOn: frozenNoiseOn, differOffVsOn: frozenEffect, otherFiles: otherNames.length, otherDiffer: others },
    pages, hashesOff: frozenOff1.hashes, hashesOn: frozenOn1.hashes, copyMs,
  };
  v.statement = 'The site was built seven times in a temp copy of the tree (live clock: block off twice and on once; clock frozen at ' + v.clock.frozenAt + ': off twice and on twice; every build exited '
    + (allExit0 ? '0' : 'non-zero on at least one') + '). With the live clock, off against off, ' + liveNoise.length + ' file(s) differed (' + (liveNoise.join(', ') || 'none') + '), each only in its build stamp ('
    + (liveNoiseBeyond.length === 0 ? 'nothing left with the stamps masked' : liveNoiseBeyond.join(', ') + ' differ beyond the stamps') + '). With the clock frozen the builds were reproducible (off against off '
    + frozenNoiseOff.length + ', on against on ' + frozenNoiseOn.length + ' files differ), and off against on ' + (otherNames.length - others.length) + ' of ' + otherNames.length
    + ' files other than findings/index.html were byte-identical by sha256' + (others.length ? ' while ' + others.join(', ') + ' differed' : '') + '; the findings page minus the block equalled the off page byte for byte: ' + (onlyBlock ? 'yes' : 'no')
    + '; the block itself was the same on both clocks: ' + (clockFree ? 'yes' : 'no') + '. Read back from the built findings page, the block carries ' + check.numbers + ' numbers (' + check.fields + ' verdict fields, '
    + check.derived + ' recomputed values of which ' + check.summary + ' are the summary) and ' + check.problems.length + ' of its spans disagree with the verdicts in ' + relDir + '. The newest verdict is '
    + (check.newest ? check.newest.ref + ' at ' + check.newest.at + ' with kept ' + check.newest.kept : 'none') + ', named first with its at: ' + (check.newestNamed ? 'yes' : 'no') + ', and the page prints '
    + check.newestPrinted + ' kept per hour for it. Controls: no off build carries a block (' + (!offBlock ? 'none found' : 'one found') + '); a copy of the block with one candidates count raised by one was '
    + (control.caught ? 'caught' : 'NOT caught') + '. ' + (barMet ? 'Every check met.' : 'Checks missed: ' + failed.join(', ') + '.');
  const file = path.join(outDir, 'yield-site.json');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
  say('BAR ' + (barMet ? 'MET' : 'MISSED') + (failed.length ? ' (' + failed.join(', ') + ')' : '') + '; wrote ' + path.relative(ROOT, file).split(path.sep).join('/'));
  say('peak RSS of this process ' + Math.round(process.resourceUsage().maxRSS / 1024) + ' MB');
  return v;
}

if (process.argv[1] && process.argv[1].endsWith('yield-site.mjs')) run(process.argv.slice(2));
