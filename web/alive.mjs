// web/alive.mjs: the living page, dilation.dev/alive. His plan, verbatim: "A living page, dilation.dev/alive: generations,
// cells, arms, and what it learned in the last hour, for him and for VCs." Author: Day 3 board, alive builder, 2026-10-01.
//
// WHAT IT IS. Pure functions, data in and HTML out. readAlive(root) reads the organism's own records (grown/generations.json,
// grown/index.json, grown/self.json, grown/cortex.json, grown/apps.json, grow/dreams.jsonl, grow/curriculum.jsonl) and never
// throws: a missing, empty or broken file is a source with a state, not an exception. aliveModel turns the records into the
// numbers the page shows, each next to the file it came from; aliveHtml renders that model, and aliveData IS that model, served
// beside the page as /alive/data.json, so a reader can check every number against the file and the bytes (sha256) it was read from.
// WHY THIS SHAPE. He reads it on his phone first and VCs pay for what they see, so the first screen is the verdict in large
// numbers. His standing rule is that every number is traceable, so nothing here types one: a section with nothing to show says
// "none yet" and why, and a rate whose denominator is 0 is "none yet", never a 0. builtAt is passed in by web/build.mjs (its own
// new Date().toISOString()); aliveHtml never reads a clock, so the same records and stamp always make the same bytes.
// Every string from a record is HTML-escaped (dream prompts are text the organism wrote for itself: untrusted) and an em dash in
// a record becomes a comma, so none reaches the page; data.json keeps the record's text and writes an em dash as its \u escape.
//
// Run: node web/alive.mjs   (writes web/dist/alive/index.html and data.json, prints one JSON line; web/build.mjs calls generateAlive)
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILES = Object.freeze({ generations: 'grown/generations.json', index: 'grown/index.json', self: 'grown/self.json', cortex: 'grown/cortex.json',
  apps: 'grown/apps.json', dreams: 'grow/dreams.jsonl', curriculum: 'grow/curriculum.jsonl' });
// grow/cortex.mjs DEFAULT_POINTER: with no ledger the cortex is the model the procedure names (GROW.md step 2)
export const DEFAULT_POINTER = 'claude-opus-5-5';
export const PAGE_CAP = 150000;
// The page grows by a row per generation (hourly); past these the rows live in data.json only, so the page stays under the cap.
export const GEN_ROWS = 120, HISTORY_ROWS = 40, DREAM_PROMPTS = 6;
const PROMPT_CHARS = 240;
const EM = String.fromCharCode(0x2014);

// an em dash in a record becomes a comma (with the spaces around it folded), so the page never carries one
const DASH = new RegExp('\\s*' + EM + '\\s*', 'g');
const noDash = (s) => String(s).replace(DASH, ', ');
export const esc = (s) => noDash(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const count = (v) => (Number.isInteger(v) && v >= 0 ? v : null);
const finite = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const text = (v) => (typeof v === 'string' && v.trim() ? v : null);
const clip = (s, n) => (s.length > n ? s.slice(0, n - 3) + '...' : s);
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

// ------------------------------------------------------------------ reading (tolerant: a file is a source with a state)
function load(root, rel) {
  const src = { file: rel, state: 'missing', bytes: null, sha256: null };
  const file = path.join(root, ...rel.split('/'));
  let buf;
  try { if (!fs.existsSync(file)) return { src, body: null }; buf = fs.readFileSync(file); } catch { src.state = 'unreadable'; return { src, body: null }; }
  src.bytes = buf.length;
  src.sha256 = createHash('sha256').update(buf).digest('hex');
  const body = buf.toString('utf8').replace(/^﻿/, '');
  if (!body.trim()) { src.state = 'empty'; return { src, body: null }; }
  src.state = 'read';
  return { src, body };
}
function loadJson(root, rel, shapeOk) {
  const { src, body } = load(root, rel);
  if (body === null) return { src, json: null };
  let json;
  try { json = JSON.parse(body); } catch { src.state = 'not JSON'; return { src, json: null }; }
  if (!shapeOk(json)) { src.state = 'wrong shape'; return { src, json: null }; }
  return { src, json };
}
function loadJsonl(root, rel) {
  const { src, body } = load(root, rel);
  if (body === null) return { src, rows: [] };
  const rows = [];
  let bad = 0;
  for (const line of body.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try { const r = JSON.parse(line); if (isObj(r)) rows.push(r); else bad++; } catch { bad++; }
  }
  src.rows = rows.length;
  src.bad = bad;
  if (!rows.length) src.state = 'no JSON line';
  return { src, rows };
}

/** The organism's records under root, never throwing: { generations, index, self, cortex, apps, dreams, curriculum, sources }. */
export function readAlive(root = ROOT) {
  const g = loadJson(root, FILES.generations, (j) => isObj(j) && Array.isArray(j.generations));
  const ix = loadJson(root, FILES.index, (j) => isObj(j) && Array.isArray(j.cells));
  const sf = loadJson(root, FILES.self, isObj);
  const cx = loadJson(root, FILES.cortex, isObj);
  const ap = loadJson(root, FILES.apps, (j) => isObj(j) && Array.isArray(j.apps));
  const dr = loadJsonl(root, FILES.dreams), cu = loadJsonl(root, FILES.curriculum);
  return {
    generations: g.json ? g.json.generations.filter((e) => isObj(e) && Number.isInteger(e.generation)) : [],
    index: { generation: ix.json ? count(ix.json.generation) : null, cells: ix.json ? ix.json.cells.filter((c) => isObj(c) && text(c.id)) : [] },
    self: { trial: sf.json && isObj(sf.json.trial) ? sf.json.trial : null, history: sf.json && Array.isArray(sf.json.history) ? sf.json.history.filter(isObj) : [] },
    cortex: cx.json,
    apps: ap.json ? ap.json.apps.filter(isObj) : [],
    dreams: dr.rows, curriculum: cu.rows,
    sources: { generations: g.src, index: ix.src, self: sf.src, cortex: cx.src, apps: ap.src, dreams: dr.src, curriculum: cu.src },
  };
}

// ------------------------------------------------------------------ the model: every number the page shows, with its file
function lanesOf(e) {
  const lanes = isObj(e.lanes) ? e.lanes : {};
  return Object.keys(lanes).map((lane) => {
    const l = isObj(lanes[lane]) ? lanes[lane] : {};
    return { lane, candidates: count(l.candidates), survivors: count(l.survivors), parent: lane === e.parent };
  });
}
function genRow(e) {
  const lanes = lanesOf(e);
  const counted = lanes.filter((l) => l.candidates !== null && l.survivors !== null);
  const note = text(e.note);
  return {
    generation: e.generation, at: text(e.at), parent: text(e.parent), lanes,
    candidates: counted.length ? counted.reduce((a, l) => a + l.candidates, 0) : null,
    survivors: counted.length ? counted.reduce((a, l) => a + l.survivors, 0) : null,
    misses: Array.isArray(e.misses) ? e.misses.length : null, note, byHand: Boolean(note && /by hand/i.test(note)),
  };
}
/** Hours from a record's stamp to the build, one decimal; null when either is not an ISO stamp. */
export function hoursBefore(at, builtAt) {
  if (!text(at) || !text(builtAt) || !ISO.test(at) || !ISO.test(builtAt)) return null;
  const a = Date.parse(at), b = Date.parse(builtAt);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.round((b - a) / 360000) / 10 : null;
}
// a rate as the ledger holds it; a 0 denominator is no rate
const rateOf = (r) => (isObj(r) ? { generation: count(r.generation), candidates: count(r.candidates), survivors: count(r.survivors), rate: r.candidates === 0 ? null : finite(r.rate) } : null);
function tally(rows, key, empty) {
  const m = new Map();
  for (const r of rows) { const k = text(r[key]) || empty; m.set(k, (m.get(k) || 0) + 1); }
  return [...m].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(([k, n]) => ({ [key]: k, n }));
}
function challengerOf(c) {
  if (text(c)) return { model: c, by: null, at: null };
  if (!isObj(c)) return null;
  const model = text(c.model) || text(c.id) || text(c.name);
  return model ? { model, by: text(c.by), at: text(c.at) || text(c.since) } : null;
}
function cortexRow(h) {
  return {
    generation: count(h.generation), incumbent: text(h.incumbent), challenger: text(h.challenger) || (isObj(h.challenger) ? text(h.challenger.model) : null),
    pairs: finite(h.pairs), incumbentScore: finite(h.incumbentScore), challengerScore: finite(h.challengerScore),
    incumbentSurvivors: count(h.incumbentSurvivors), challengerSurvivors: count(h.challengerSurvivors), verdict: text(h.verdict), reason: text(h.reason), at: text(h.at) || text(h.judgedAt),
  };
}
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/, APP_PATH = /^\/apps\/[a-z0-9][a-z0-9-]{0,63}\/$/;

/** The page's numbers and their files. builtAt is the caller's stamp; nothing here reads a clock. */
export function aliveModel(data, { builtAt = null } = {}) {
  const d = isObj(data) ? data : {};
  const given = isObj(d.sources) ? d.sources : {};
  const sources = {};
  for (const k of Object.keys(FILES)) sources[k] = isObj(given[k]) ? { ...given[k], file: FILES[k] } : { file: FILES[k], state: 'missing', bytes: null, sha256: null };
  const built = text(builtAt);
  const generations = (Array.isArray(d.generations) ? d.generations : []).filter((e) => isObj(e) && Number.isInteger(e.generation)).map(genRow).sort((a, b) => a.generation - b.generation);
  const cells = (isObj(d.index) && Array.isArray(d.index.cells) ? d.index.cells : []).filter((c) => isObj(c) && text(c.id)).map((c) => {
    const h = isObj(c.heldout) ? c.heldout : {};
    return { id: c.id, class: text(c.class) || 'unclassed', generation: count(c.generation), lane: text(c.lane), score: finite(h.score), n: count(h.n), ok: count(h.ok), promotedAt: text(c.promotedAt) };
  }).sort((a, b) => (a.class < b.class ? -1 : a.class > b.class ? 1 : 0));
  const curriculum = (Array.isArray(d.curriculum) ? d.curriculum : []).filter(isObj);
  const dreamsAll = (Array.isArray(d.dreams) ? d.dreams : []).filter(isObj);
  // the octopus: one arm per domain (the curriculum's classes, in its order), then every other class a living cell holds
  const domains = [...new Set(curriculum.map((r) => text(r.class)).filter(Boolean))];
  const curByClass = tally(curriculum, 'class', 'unclassed');
  const extra = [...new Set(cells.map((c) => c.class))].filter((c) => !domains.includes(c)).sort();
  const arms = [...domains, ...extra].map((cls) => ({ class: cls, domain: domains.includes(cls), cells: cells.filter((c) => c.class === cls).map((c) => c.id),
    curriculum: (curByClass.find((x) => x.class === cls) || { n: 0 }).n }));
  const sf = isObj(d.self) ? d.self : {};
  const trial = isObj(sf.trial) ? sf.trial : null;
  const historyAll = (Array.isArray(sf.history) ? sf.history : []).filter(isObj).map((h) => ({
    generation: count(h.generation), target: text(h.target), verdict: text(h.verdict), baseline: rateOf(h.baseline), judged: rateOf(h.judged), reason: text(h.reason), judgedAt: text(h.judgedAt), appliedAt: text(h.appliedAt),
  }));
  const cx = isObj(d.cortex) ? d.cortex : null;
  const pointer = cx ? text(cx.pointer) : null;
  const cortexAll = (cx && Array.isArray(cx.history) ? cx.history.filter(isObj) : []).map(cortexRow);
  const apps = (Array.isArray(d.apps) ? d.apps : []).filter(isObj).map((a) => {
    const slug = text(a.slug) && SLUG.test(a.slug) ? a.slug : null;
    return { slug: text(a.slug), name: text(a.name) || text(a.slug) || 'unnamed', prompt: text(a.prompt), generation: count(a.generation),
      path: typeof a.path === 'string' && APP_PATH.test(a.path) ? a.path : slug ? '/apps/' + slug + '/' : null, at: text(a.at) };
  });
  const indexed = dreamsAll.map((r, i) => ({ r, i }));
  const newestDreams = indexed.sort((x, y) => { const a = text(x.r.at) || '', b = text(y.r.at) || ''; return a < b ? 1 : a > b ? -1 : y.i - x.i; }).slice(0, DREAM_PROMPTS)
    .map(({ r }) => ({ id: text(r.id), class: text(r.class) || 'unclassed', generation: count(r.generation), status: text(r.status), at: text(r.at), prompt: clip(text(r.prompt) || text(r.q) || '(no prompt)', PROMPT_CHARS) }));
  const newest = generations.length ? generations[generations.length - 1] : null;
  let last = null;
  if (newest) {
    const g = newest.generation;
    const collected = dreamsAll.filter((r) => r.generation === g);
    last = { ...newest, hoursBefore: hoursBefore(newest.at, built), promoted: cells.filter((c) => c.generation === g),
      self: historyAll.filter((h) => h.judged && h.judged.generation === g), cortex: cortexAll.filter((h) => h.generation === g),
      dreams: { count: collected.length, byClass: tally(collected, 'class', 'unclassed') } };
  }
  const genField = newest ? 'generations[generation ' + newest.generation + ']' : 'generations';
  return {
    page: '/alive', builtAt: built,
    vitals: {
      generations: { value: generations.length, file: FILES.generations, field: 'generations (records)' },
      cells: { value: cells.length, classes: new Set(cells.map((c) => c.class)).size, file: FILES.index, field: 'cells (records)' },
      lastGeneration: { generation: newest ? newest.generation : null, survivors: newest ? newest.survivors : null, candidates: newest ? newest.candidates : null, file: FILES.generations, field: genField + '.lanes' },
      dreams: { value: dreamsAll.length, classes: new Set(dreamsAll.map((r) => text(r.class) || 'unclassed')).size, file: FILES.dreams, field: 'lines' },
      cortex: { pointer: pointer || DEFAULT_POINTER, from: pointer ? 'file' : 'default', file: FILES.cortex, field: 'pointer' },
      heartbeat: { at: newest ? newest.at : null, hoursBefore: last ? last.hoursBefore : null, file: FILES.generations, field: genField + '.at' },
    },
    last, generations, cells, arms,
    self: { pending: trial ? { generation: count(trial.generation), next: count(trial.next), target: text(trial.target), baseline: rateOf(trial.baseline), appliedAt: text(trial.appliedAt), why: text(trial.why), hypothesis: text(trial.hypothesis) } : null,
      history: historyAll.slice(-HISTORY_ROWS).reverse(), count: historyAll.length },
    cortex: { pointer: pointer || DEFAULT_POINTER, from: pointer ? 'file' : 'default', since: cx ? (count(cx.since) ?? text(cx.since)) : null,
      challenger: cx ? challengerOf(cx.challenger) : null, history: cortexAll.slice(-HISTORY_ROWS).reverse(), count: cortexAll.length },
    dreams: { count: dreamsAll.length, byClass: tally(dreamsAll, 'class', 'unclassed'), byStatus: tally(dreamsAll, 'status', 'unmarked'), newest: newestDreams },
    curriculum: { count: curriculum.length, byClass: curByClass, byStatus: tally(curriculum, 'status', 'unmarked') },
    apps, sources,
  };
}

/** The JSON served at /alive/data.json: the model the page was rendered from. */
export const aliveData = (data, opts = {}) => aliveModel(data, opts);
/** data.json's bytes: an em dash is written as its \u escape, so the file holds none and still holds the record's text. */
export const jsonText = (model) => JSON.stringify(model, null, 2).split(EM).join('\\u2014') + '\n';

// ------------------------------------------------------------------ rendering
const STYLE = `:root { color-scheme: dark; --ink: #e8eefc; --dim: #7f8ba6; --line: rgba(150,180,255,0.14); --glass: rgba(10,14,26,0.62);
  --accent: #7fb0ff; --warm: #ffb27f; --violet: #c3b1ff; --live: #7fffb0; --bg: #02030a; }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); color: var(--ink); font: 12px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
body { padding: 0 16px 80px; overflow-x: hidden; background-image: radial-gradient(ellipse 90% 420px at 50% -60px, rgba(127,176,255,0.13), transparent 75%); background-repeat: no-repeat; }
.wrap { max-width: 1060px; margin: 0 auto; }
a { color: var(--accent); text-decoration: none; }
h1, h2, h3, .serif, .val, .verdict, .score, .gnum { font-family: "Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif; font-weight: 400; }
h1, h2, h3, .verdict, .gnum { font-style: italic; }
header.top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 22px 0 12px; border-bottom: 1px solid var(--line); }
.brand { letter-spacing: 0.22em; text-transform: uppercase; font-size: 11px; }
.dim, .brand .dim { color: var(--dim); }
nav.pills { display: flex; gap: 8px; flex-wrap: wrap; }
.pill { display: inline-block; background: var(--glass); border: 1px solid var(--line); border-radius: 999px; padding: 4px 12px; color: var(--ink);
  letter-spacing: 0.16em; text-transform: uppercase; font-size: 10.5px; font-style: normal; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); white-space: nowrap; }
a.pill:hover, .pill.here { border-color: var(--accent); text-shadow: 0 0 12px rgba(127,176,255,0.55); }
.pill.sm { padding: 1px 8px; font-size: 9.5px; letter-spacing: 0.12em; vertical-align: 2px; }
.pill.parent, .pill.hand, .pill.reverted, .pill.held { border-color: rgba(255,178,127,0.55); color: var(--warm); }
.pill.kept, .pill.moved { border-color: rgba(127,255,176,0.5); color: var(--live); }
.pill.pending { border-color: rgba(127,176,255,0.55); color: var(--accent); }
h1 { font-size: clamp(46px, 12vw, 78px); line-height: 1.02; margin: 26px 0 10px; text-shadow: 0 0 24px rgba(127,176,255,0.25); }
h2 { font-size: clamp(22px, 5.4vw, 28px); margin: 0 0 4px; line-height: 1.2; text-shadow: 0 0 16px rgba(127,176,255,0.18); }
h3 { font-size: 16px; margin: 20px 0 6px; color: #cfd9f5; }
.what { font-size: 14px; line-height: 1.7; color: #c9d3ec; max-width: 62ch; margin: 0; }
.verdict { font-size: clamp(19px, 4.8vw, 24px); line-height: 1.45; margin: 16px 0 0; color: #fff; max-width: 48ch; }
.verdict b, .lede b, .line b { font-weight: 400; color: var(--accent); }
.tiles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 18px 0 6px; }
.tile { background: var(--glass); border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px 10px; min-width: 0; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); box-shadow: 0 0 26px rgba(127,176,255,0.05); }
.tile.wide { grid-column: span 2; }
.tile .lbl { color: var(--dim); letter-spacing: 0.14em; text-transform: uppercase; font-size: 10px; }
.val { font-size: clamp(36px, 10.5vw, 48px); line-height: 1.08; margin: 4px 0 2px; color: #fff; text-shadow: 0 0 18px rgba(127,176,255,0.35); overflow-wrap: anywhere; }
.val.str { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: clamp(15px, 4.4vw, 20px); padding: 8px 0 5px; }
.val .of { color: var(--dim); font-size: 0.55em; margin: 0 5px; }
.val .nm { font-size: 0.5em; }
.tile .sub { color: #c9d3ec; font-size: 11px; }
.src { color: var(--dim); font-size: 10.5px; margin: 6px 0 0; overflow-wrap: anywhere; }
.src code, code { color: var(--warm); background: rgba(255,178,127,0.06); border: 1px solid rgba(255,178,127,0.14); border-radius: 4px; padding: 0 4px; overflow-wrap: anywhere; }
.pulse { display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: var(--live); margin-right: 8px; vertical-align: 3px; animation: beat 2.4s ease-out infinite; }
@keyframes beat { 0% { box-shadow: 0 0 0 0 rgba(127,255,176,0.6); } 70% { box-shadow: 0 0 0 11px rgba(127,255,176,0); } 100% { box-shadow: 0 0 0 0 rgba(127,255,176,0); } }
@media (prefers-reduced-motion: reduce) { .pulse { animation: none; } }
.card { background: var(--glass); border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; margin: 18px 0; backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); box-shadow: 0 0 26px rgba(127,176,255,0.05); }
.lede { color: #c9d3ec; font-size: 12.5px; line-height: 1.7; margin: 4px 0 0; max-width: 82ch; }
.line { margin: 8px 0 0; }
.nm { color: var(--dim); font-style: italic; }
.none { margin: 8px 0 0; color: #c9d3ec; }
.lane { display: grid; grid-template-columns: minmax(7em, 10em) minmax(0, 1fr) auto; gap: 10px; align-items: center; margin: 7px 0; }
.lane .ln { overflow-wrap: anywhere; }
.lane .n { white-space: nowrap; text-align: right; }
.bar { position: relative; height: 10px; background: rgba(150,180,255,0.10); border-radius: 5px; overflow: hidden; }
.bar i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 5px; background: linear-gradient(90deg, rgba(127,176,255,0.45), var(--accent)); box-shadow: 0 0 10px rgba(127,176,255,0.45); }
.bar.parent i { background: linear-gradient(90deg, rgba(255,178,127,0.45), var(--warm)); box-shadow: 0 0 10px rgba(255,178,127,0.4); }
.gen { border-top: 1px solid var(--line); padding: 12px 0 10px; }
.gen:first-of-type { border-top: 0; }
.ghead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; }
.gnum { font-size: 19px; color: #fff; }
.note { border-left: 2px solid rgba(255,178,127,0.55); padding: 4px 0 4px 12px; margin: 8px 0 0; color: #ead7c8; overflow-wrap: anywhere; }
.octo { display: block; width: 100%; max-width: 330px; margin: 8px auto 12px; }
.octo path { fill: none; stroke: rgba(150,180,255,0.16); stroke-width: 5; stroke-linecap: round; }
.octo .on path { stroke: rgba(127,176,255,0.55); }
.octo circle { fill: none; stroke: var(--dim); stroke-width: 1.5; }
.octo .on circle { fill: var(--accent); stroke: none; filter: drop-shadow(0 0 6px rgba(127,176,255,0.85)); }
.octo .body { fill: rgba(10,14,26,0.92); stroke: rgba(127,176,255,0.5); stroke-width: 1.5; }
.octo text { fill: #fff; text-anchor: middle; }
.octo .c { font: italic 28px "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; }
.octo .l { font: 9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; fill: var(--dim); letter-spacing: 0.14em; }
.arms { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin: 6px 0; }
.arm { border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px; background: rgba(10,14,26,0.45); min-width: 0; }
.arm.on { border-color: rgba(127,176,255,0.42); box-shadow: inset 0 0 18px rgba(127,176,255,0.07); }
.arm .cls { font-size: 13px; color: #fff; overflow-wrap: anywhere; }
.arm .score { font-size: 30px; line-height: 1.1; color: var(--accent); text-shadow: 0 0 14px rgba(127,176,255,0.4); }
.arm .score.nm { font-size: 15px; color: var(--dim); text-shadow: none; margin: 8px 0 4px; }
.arm .k { color: var(--dim); font-size: 10.5px; overflow-wrap: anywhere; }
.arm .id { color: #c9d3ec; font-size: 11px; overflow-wrap: anywhere; margin-top: 4px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0 0; }
.chip { border: 1px solid var(--line); border-radius: 999px; padding: 2px 10px; font-size: 11px; white-space: nowrap; color: #c9d3ec; }
.chip b { color: #fff; font-weight: 400; margin-left: 5px; }
.prompts { list-style: none; padding: 0; margin: 8px 0 0; }
.prompts li { border-left: 2px solid rgba(195,177,255,0.5); padding: 3px 0 3px 12px; margin: 10px 0; overflow-wrap: anywhere; }
.prompts .q { color: #fff; font-size: 13px; }
.big { font-size: clamp(26px, 7vw, 34px); color: #fff; }
.scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { border-collapse: collapse; width: 100%; margin: 6px 0; }
th { color: var(--dim); font-weight: 400; text-align: left; border-bottom: 1px solid var(--line); padding: 5px 12px 5px 0; white-space: nowrap; }
td { padding: 5px 12px 5px 0; vertical-align: top; border-bottom: 1px solid rgba(150,180,255,0.05); }
th.n, td.n { text-align: right; white-space: nowrap; }
td.why { min-width: 22ch; color: #c9d3ec; }
ul.apps { margin: 8px 0 0; padding-left: 18px; }
ul.apps li { margin: 6px 0; overflow-wrap: anywhere; }
footer { margin-top: 36px; color: var(--dim); border-top: 1px solid var(--line); padding-top: 12px; }
footer p { margin: 6px 0; }
ul.files { list-style: none; padding: 0; margin: 8px 0; }
ul.files li { margin: 5px 0; overflow-wrap: anywhere; }
ul.files code { white-space: nowrap; }
@media (min-width: 760px) { .tiles { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 640px) { .card { padding: 14px; border-radius: 12px; } body { padding: 0 16px 60px; } }`;

const b = (v) => '<b>' + esc(v) + '</b>';
const files = (...fs_) => '<p class="src">from ' + fs_.map((f) => '<code>' + esc(f) + '</code>').join(', ') + '</p>';
const noneYet = (why) => '<p class="none"><span class="nm">none yet</span>: ' + esc(why) + '</p>';
const WHY_STATE = Object.freeze({ missing: 'is not on disk', empty: 'is empty', unreadable: 'could not be read', 'not JSON': 'does not parse as JSON',
  'wrong shape': 'does not hold the shape the organism writes', 'no JSON line': 'holds no JSON line' });
/** Why a source shows nothing: its state, or (read) that it holds nothing yet. */
const whyEmpty = (s, what) => s.file + ' ' + (s.state === 'read' ? 'holds ' + what : WHY_STATE[s.state] || 'holds nothing to show');
const rateText = (r) => {
  if (!r) return '<span class="nm">none yet</span>';
  // the counts are printed beside a missing rate too (a 0-candidate baseline reads "none yet (0 of 0, ...)"): they are the file's
  const of = r.survivors !== null && r.candidates !== null ? ' (' + esc(r.survivors) + ' of ' + esc(r.candidates) + (r.generation !== null ? ', generation ' + esc(r.generation) : '') + ')' : '';
  return (r.rate === null ? '<span class="nm">none yet</span>' : esc(r.rate)) + of;
};
const pillFor = (v) => (v ? '<span class="pill sm ' + esc(v.replace(/[^a-z]/gi, '').toLowerCase()) + '">' + esc(v) + '</span>' : '<span class="nm">no verdict</span>');
const hoursText = (h) => (h === null ? 'its age is not computable (no build stamp or no ISO stamp)' : esc(Math.abs(h)) + ' hours ' + (h < 0 ? 'after' : 'before') + ' this page was built');

function laneBars(lanes) {
  return lanes.map((l) => {
    const n = l.candidates !== null && l.survivors !== null && l.candidates > 0;
    const width = n ? Math.min(100, (l.survivors / l.candidates) * 100).toFixed(2) : '0';
    return '<div class="lane"><span class="ln">' + esc(l.lane) + (l.parent ? ' <span class="pill sm parent">parent</span>' : '') + '</span>'
      + '<span class="bar' + (l.parent ? ' parent' : '') + '" role="img" aria-label="' + esc(l.lane + ': ' + (n ? l.survivors + ' of ' + l.candidates + ' survived' : 'none yet')) + '"><i style="width:' + width + '%"></i></span>'
      + '<span class="n">' + (n ? esc(l.survivors) + ' <span class="dim">of</span> ' + esc(l.candidates) : '<span class="nm">none yet</span>') + '</span></div>';
  }).join('');
}

function tile(label, value, sub, file, wide) {
  return '<div class="tile' + (wide ? ' wide' : '') + '"><div class="lbl">' + label + '</div>' + value + '<div class="sub">' + sub + '</div><div class="src">' + esc(file) + '</div></div>';
}

function hero(m) {
  const v = m.vitals, g = m.sources.generations, last = m.last;
  const none = '<div class="val"><span class="nm">none yet</span></div>';
  let verdict;
  if (!last) verdict = '<p class="verdict"><span class="nm">none yet</span>: ' + esc(whyEmpty(g, 'no generation yet')) + '.</p>';
  else {
    verdict = '<p class="verdict">Generation ' + b(last.generation) + ' ran ' + (last.hoursBefore === null ? 'at ' + esc(last.at || 'an unrecorded time') : b(Math.abs(last.hoursBefore) + ' hours') + (last.hoursBefore < 0 ? ' after' : ' before') + ' this page was built')
      + ': ' + (last.candidates ? b(last.survivors) + ' of ' + b(last.candidates) + ' candidate cells survived the locked judge' : 'it recorded no candidate')
      + ', and ' + (m.cells.length ? b(m.cells.length) + ' cells are alive.' : 'no cell is alive yet.')
      + (last.byHand ? ' Its record was corrected by hand; the note is under Generations.' : '') + '</p>';
  }
  const tiles = [
    tile('generations run', v.generations.value ? '<div class="val">' + esc(v.generations.value) + '</div>' : none,
      last ? 'newest: generation ' + esc(last.generation) : esc(whyEmpty(g, 'no generation yet')), v.generations.file),
    tile('cells alive', v.cells.value ? '<div class="val">' + esc(v.cells.value) + '</div>' : none,
      v.cells.value ? 'in ' + esc(v.cells.classes) + ' classes, one arm each' : esc(whyEmpty(m.sources.index, 'no cell yet')), v.cells.file),
    tile('last generation', last && last.candidates ? '<div class="val">' + esc(last.survivors) + '<span class="of">/</span>' + esc(last.candidates) + '</div>' : none,
      last ? 'survivors over candidates, generation ' + esc(last.generation) + (last.byHand ? ' <span class="pill sm hand">corrected by hand</span>' : '') : esc(whyEmpty(g, 'no generation yet')), v.lastGeneration.file),
    tile('dreams set for itself', v.dreams.value ? '<div class="val">' + esc(v.dreams.value) + '</div>' : none,
      v.dreams.value ? 'tasks it wrote for itself, in ' + esc(v.dreams.classes) + ' classes' : esc(whyEmpty(m.sources.dreams, 'no dream yet')), v.dreams.file),
    tile('cortex', '<div class="val str">' + esc(v.cortex.pointer) + '</div>',
      'the model that runs each generation' + (v.cortex.from === 'default' ? ', by default: ' + esc(whyEmpty(m.sources.cortex, 'no pointer')) : m.cortex.since !== null ? ', since ' + (typeof m.cortex.since === 'number' ? 'generation ' : '') + esc(m.cortex.since) : ''), v.cortex.file, true),
    tile('last heartbeat', v.heartbeat.at ? '<div class="val str"><span class="pulse" aria-hidden="true"></span>' + esc(v.heartbeat.at) + '</div>' : none,
      v.heartbeat.at ? hoursText(v.heartbeat.hoursBefore) : esc(whyEmpty(g, 'no generation yet')), v.heartbeat.file, true),
  ];
  return '<section id="now"><h1>Alive</h1>'
    + '<p class="what">A brain that grows its own cells in the cloud, every hour, with its owner\'s PC off: its arms write candidate cells, a locked judge grades each one on held-out questions, and only the survivors join it.</p>'
    + verdict + '<div class="tiles">' + tiles.join('') + '</div></section>';
}

function lastHour(m) {
  const head = '<section class="card" id="last-hour"><h2>The last hour</h2>';
  const l = m.last;
  if (!l) return head + noneYet(whyEmpty(m.sources.generations, 'no generation yet')) + files(FILES.generations) + '</section>';
  const out = [head, '<p class="lede">What generation ' + b(l.generation) + ' did: its heartbeat at ' + esc(l.at || 'an unrecorded time') + ', ' + hoursText(l.hoursBefore) + '.</p>'];
  out.push('<h3>The tournament</h3>' + (l.lanes.length ? laneBars(l.lanes) : noneYet('generation ' + l.generation + ' recorded no lane'))
    + '<p class="line">' + (l.candidates ? b(l.survivors) + ' of ' + b(l.candidates) + ' survived' : '<span class="nm">none yet</span>: no candidate recorded')
    + (l.parent ? '; the parent of the next generation is the ' + b(l.parent) + ' lane, the one with more survivors' : '; no parent lane recorded')
    + (l.misses !== null ? '; it worked on ' + b(l.misses) + ' misses' : '') + '.</p>' + files(FILES.generations));
  out.push('<h3>Cells it promoted</h3>' + (l.promoted.length
    ? '<div class="scroll"><table><tr><th>cell</th><th>class</th><th>lane</th><th class="n">held-out score</th><th class="n">rows</th></tr>'
      + l.promoted.map((c) => '<tr><td>' + esc(c.id) + '</td><td>' + esc(c.class) + '</td><td>' + esc(c.lane || '') + '</td><td class="n">' + (c.score === null ? '<span class="nm">none yet</span>' : esc(c.score)) + (c.ok !== null ? ' (' + esc(c.ok) + ' ok)' : '') + '</td><td class="n">' + (c.n === null ? '' : esc(c.n)) + '</td></tr>').join('') + '</table></div>'
    : noneYet('no cell in ' + FILES.index + ' carries generation ' + l.generation)) + files(FILES.index));
  out.push('<h3>Self-modification</h3>' + (l.self.length
    ? l.self.map((h) => '<p class="line">' + pillFor(h.verdict) + ' ' + esc(h.target || 'no target') + ': judged rate ' + rateText(h.judged) + ' against the baseline ' + rateText(h.baseline) + '.</p>').join('')
    : noneYet('no trial in ' + FILES.self + ' was judged by generation ' + l.generation + (m.self.pending ? '; one is pending (' + (m.self.pending.target || 'no target') + ')' : '')))
    + files(FILES.self));
  if (l.cortex.length) out.push('<h3>Cortex</h3>' + l.cortex.map((h) => '<p class="line">' + pillFor(h.verdict) + ' ' + esc(h.challenger || 'no challenger') + ' against ' + esc(h.incumbent || 'the pointer') + (h.pairs !== null ? ' over ' + b(h.pairs) + ' pairs' : '') + '.</p>').join('') + files(FILES.cortex));
  out.push('<h3>Dreams it set itself</h3>' + (l.dreams.count
    ? '<p class="line">' + b(l.dreams.count) + ' tasks it set itself after generation ' + b(l.generation) + '.</p><div class="chips">' + l.dreams.byClass.map((x) => '<span class="chip">' + esc(x.class) + '<b>' + esc(x.n) + '</b></span>').join('') + '</div>'
    : noneYet('no line of ' + FILES.dreams + ' carries generation ' + l.generation)) + files(FILES.dreams));
  return out.join('') + '</section>';
}

function generationsSection(m) {
  const head = '<section class="card" id="generations"><h2>Generations</h2><p class="lede">Every tournament, newest first: per lane, the survivors over the candidates the locked judge graded. The lane with more survivors parents the next generation. A record corrected by hand says so, with its note.</p>';
  if (!m.generations.length) return head + noneYet(whyEmpty(m.sources.generations, 'no generation yet')) + files(FILES.generations) + '</section>';
  const shown = m.generations.slice(-GEN_ROWS).reverse();
  const rows = shown.map((g) => '<div class="gen"><div class="ghead"><span class="gnum">Generation ' + esc(g.generation) + '</span><span class="dim">' + esc(g.at || 'no stamp') + '</span>'
    + (g.byHand ? '<span class="pill sm hand">corrected by hand</span>' : g.note ? '<span class="pill sm">note</span>' : '') + '</div>'
    + (g.lanes.length ? laneBars(g.lanes) : noneYet('no lane recorded'))
    + '<div class="dim">' + (g.candidates ? esc(g.survivors) + ' of ' + esc(g.candidates) + ' survived' : 'none yet: no candidate recorded') + (g.parent ? ', parent ' + esc(g.parent) : '') + (g.misses !== null ? ', ' + esc(g.misses) + ' misses' : '') + '</div>'
    + (g.note ? '<p class="note">' + esc(g.note) + '</p>' : '') + '</div>');
  const older = m.generations.length - shown.length;
  return head + rows.join('') + (older > 0 ? '<p class="src">' + esc(older) + ' older generations are in <a href="/alive/data.json">data.json</a>.</p>' : '') + files(FILES.generations) + '</section>';
}

function octopus(arms, alive) {
  if (!arms.length) return '';
  const C = 165, parts = arms.map((a, i) => {
    const t = -Math.PI / 2 + (2 * Math.PI * i) / arms.length;
    const p = (r, dt = 0) => (C + r * Math.cos(t + dt)).toFixed(1) + ' ' + (C + r * Math.sin(t + dt)).toFixed(1);
    const on = a.cells.length > 0, tip = p(136).split(' ');
    return '<g class="' + (on ? 'on' : 'off') + '"><title>' + esc(a.class + (on ? ': ' + a.cells.join(', ') : ': no cell yet')) + '</title><path d="M' + p(40) + ' Q' + p(96, 0.34) + ' ' + p(136) + '"/>'
      + '<circle cx="' + tip[0] + '" cy="' + tip[1] + '" r="' + (on ? 8 : 6) + '"/></g>';
  });
  return '<svg class="octo" viewBox="0 0 330 330" role="img" aria-label="' + esc(alive + ' cells alive on ' + arms.length + ' arms') + '">' + parts.join('')
    + '<circle class="body" cx="165" cy="165" r="40"/><text class="c" x="165" y="170">' + esc(alive) + '</text><text class="l" x="165" y="186">CELLS</text></svg>';
}

function cellsSection(m) {
  const head = '<section class="card" id="cells"><h2>Cells, one arm per domain</h2><p class="lede">The octopus: every domain of the curriculum is an arm, and an arm is lit when a living cell holds its class. One cell per class, the champion: a newer survivor replaces it only with a higher held-out score.</p>';
  if (!m.arms.length) return head + noneYet(whyEmpty(m.sources.index, 'no cell yet') + '; ' + whyEmpty(m.sources.curriculum, 'no curriculum row yet')) + files(FILES.index, FILES.curriculum) + '</section>';
  const byId = new Map(m.cells.map((c) => [c.id, c]));
  const cards = m.arms.map((a) => {
    if (!a.cells.length) return '<div class="arm"><div class="cls">' + esc(a.class) + '</div><div class="score nm">no cell yet</div><div class="k">' + (a.curriculum ? esc(a.curriculum) + ' curriculum rows wait for it' : 'no curriculum row') + '</div></div>';
    return a.cells.map((id) => {
      const c = byId.get(id);
      return '<div class="arm on"><div class="cls">' + esc(a.class) + (a.domain ? '' : ' <span class="dim">(not a curriculum domain)</span>') + '</div>'
        + '<div class="score">' + (c.score === null ? '<span class="nm">none yet</span>' : esc(c.score)) + '</div>'
        + '<div class="k">held-out score' + (c.ok !== null && c.n !== null ? ', ' + esc(c.ok) + ' of ' + esc(c.n) + ' rows ok' : c.n !== null ? ' on ' + esc(c.n) + ' rows' : '') + '</div>'
        + '<div class="id">' + esc(c.id) + '</div><div class="k">generation ' + (c.generation === null ? 'unrecorded' : esc(c.generation)) + ', lane ' + esc(c.lane || 'unrecorded') + (c.promotedAt ? ', promoted ' + esc(c.promotedAt) : '') + '</div>'
        + (a.curriculum ? '<div class="k">' + esc(a.curriculum) + ' curriculum rows in its class</div>' : '') + '</div>';
    }).join('');
  });
  return head + octopus(m.arms, m.cells.length) + '<div class="arms">' + cards.join('') + '</div>'
    + (m.cells.length ? '' : noneYet(whyEmpty(m.sources.index, 'no cell yet'))) + files(FILES.index, FILES.curriculum) + '</section>';
}

function selfSection(m) {
  const s = m.self;
  const head = '<section class="card" id="self"><h2>Self-modification</h2><p class="lede">One edit to its own procedure per generation, kept only when the next generation\'s survival rate (survivors over candidates, every lane) rises above the baseline; else the file is written back.</p>';
  const out = [head];
  if (s.pending) {
    const p = s.pending;
    out.push('<p class="line"><span class="pill sm pending">pending</span> ' + esc(p.target || 'no target') + ', applied ' + esc(p.appliedAt || 'at an unrecorded time') + (p.generation !== null ? ' after generation ' + esc(p.generation) : '')
      + (p.next !== null ? '; generation ' + esc(p.next) + ' judges it' : '') + '; baseline ' + rateText(p.baseline) + '.</p>' + (p.why ? '<p class="src">why: ' + esc(p.why) + '</p>' : ''));
  }
  if (s.history.length) {
    out.push('<p class="line">' + b(s.count) + ' trials in the history, newest first.</p><div class="scroll"><table><tr><th>after</th><th>target</th><th>baseline rate</th><th>judged rate</th><th>verdict</th><th>reason</th></tr>'
      + s.history.map((h) => '<tr><td>' + (h.generation === null ? '' : 'generation ' + esc(h.generation)) + '</td><td>' + esc(h.target || '') + '</td><td>' + rateText(h.baseline) + '</td><td>' + rateText(h.judged) + '</td><td>' + pillFor(h.verdict) + '</td><td class="why">' + esc(h.reason || '') + '</td></tr>').join('')
      + '</table></div>' + (s.count > s.history.length ? '<p class="src">' + esc(s.count - s.history.length) + ' older trials are in <a href="/alive/data.json">data.json</a>.</p>' : ''));
  }
  if (!s.pending && !s.history.length) out.push(noneYet(whyEmpty(m.sources.self, 'no trial yet')));
  else if (!s.history.length) out.push(noneYet('no trial has been judged yet'));
  return out.join('') + files(FILES.self) + '</section>';
}

function cortexSection(m) {
  const c = m.cortex;
  const out = ['<section class="card" id="cortex"><h2>Cortex</h2><p class="lede">The model whose arms write the cells. The pointer moves to a challenger only when the challenger scores higher on the held-out tasks over the paired arms of one tournament.</p>'];
  out.push('<p class="line"><span class="big">' + esc(c.pointer) + '</span></p><p class="line">' + (c.from === 'default' ? 'the default pointer: ' + esc(whyEmpty(m.sources.cortex, 'no pointer'))
    : 'the pointer' + (c.since !== null ? ', since ' + (typeof c.since === 'number' ? 'generation ' : '') + esc(c.since) : '')) + '.</p>');
  out.push(c.challenger ? '<p class="line"><span class="pill sm pending">challenger</span> ' + esc(c.challenger.model) + (c.challenger.at ? ', registered ' + esc(c.challenger.at) : '') + (c.challenger.by ? ', by ' + esc(c.challenger.by) : '') + '; the next tournament judges it.</p>'
    : noneYet('no challenger is pending in ' + FILES.cortex));
  if (c.history.length) {
    const sc = (a, b2) => (a === null && b2 === null ? '' : (a === null ? '?' : esc(a)) + ' vs ' + (b2 === null ? '?' : esc(b2)));
    out.push('<p class="line">' + b(c.count) + ' trials in the history, newest first.</p><div class="scroll"><table><tr><th>generation</th><th>pointer</th><th>challenger</th><th class="n">pairs</th><th class="n">held-out score</th><th class="n">survivors</th><th>verdict</th></tr>'
      + c.history.map((h) => '<tr><td>' + (h.generation === null ? '' : esc(h.generation)) + '</td><td>' + esc(h.incumbent || '') + '</td><td>' + esc(h.challenger || '') + '</td><td class="n">' + (h.pairs === null ? '' : esc(h.pairs)) + '</td><td class="n">'
        + sc(h.incumbentScore, h.challengerScore) + '</td><td class="n">' + sc(h.incumbentSurvivors, h.challengerSurvivors) + '</td><td>' + pillFor(h.verdict) + (h.reason ? ' <span class="dim">' + esc(h.reason) + '</span>' : '') + '</td></tr>').join('')
      + '</table></div>' + (c.count > c.history.length ? '<p class="src">' + esc(c.count - c.history.length) + ' older trials are in <a href="/alive/data.json">data.json</a>.</p>' : ''));
  } else out.push(noneYet('no cortex trial in ' + FILES.cortex + ' yet'));
  return out.join('') + files(FILES.cortex) + '</section>';
}

const chips = (list, key) => '<div class="chips">' + list.map((x) => '<span class="chip">' + esc(x[key]) + '<b>' + esc(x.n) + '</b></span>').join('') + '</div>';

function dreamsSection(m) {
  const d = m.dreams, c = m.curriculum;
  const out = ['<section class="card" id="dreams"><h2>Dreams and curriculum</h2><p class="lede">After each generation a proposer arm writes tasks just past what the brain answers, a solver arm answers them, and the ones the brain still misses become its next misses. The curriculum is the seed set a human session wrote, one class per domain.</p>'];
  out.push('<h3>Dreams</h3>');
  if (d.count) {
    out.push('<p class="line"><span class="big">' + esc(d.count) + '</span> <span class="dim">tasks set for itself</span></p>' + chips(d.byClass, 'class') + chips(d.byStatus, 'status')
      + '<ul class="prompts">' + d.newest.map((x) => '<li><div class="q">' + esc(x.prompt) + '</div><div class="dim">' + esc(x.class) + (x.generation !== null ? ', generation ' + esc(x.generation) : '') + (x.status ? ', ' + esc(x.status) : '') + '</div></li>').join('') + '</ul>');
  } else out.push(noneYet(whyEmpty(m.sources.dreams, 'no dream yet')));
  out.push(files(FILES.dreams) + '<h3>Curriculum</h3>');
  if (c.count) out.push('<p class="line"><span class="big">' + esc(c.count) + '</span> <span class="dim">curriculum rows</span></p>' + chips(c.byClass, 'class') + chips(c.byStatus, 'status'));
  else out.push(noneYet(whyEmpty(m.sources.curriculum, 'no curriculum row yet')));
  return out.join('') + files(FILES.curriculum) + '</section>';
}

function appsSection(m) {
  const out = ['<section class="card" id="apps"><h2>Apps it built</h2><p class="lede">A request for an app ("make me a todo app") is grown by the builder arm, judged by its own tests in the sandbox, and served on this site.</p>'];
  if (m.apps.length) {
    out.push('<ul class="apps">' + m.apps.map((a) => '<li>' + (a.path ? '<a href="' + esc(a.path) + '">' + esc(a.name) + '</a>' : esc(a.name) + ' <span class="nm">(no servable path)</span>')
      + (a.prompt ? ' <span class="dim">built from "' + esc(a.prompt) + '"</span>' : '') + (a.generation !== null ? ' <span class="dim">generation ' + esc(a.generation) + '</span>' : '') + '</li>').join('') + '</ul>');
  } else out.push(noneYet(whyEmpty(m.sources.apps, 'no app yet')));
  return out.join('') + files(FILES.apps) + '</section>';
}

function footer(m) {
  const rows = Object.values(m.sources).map((s) => '<li><code>' + esc(s.file) + '</code> ' + esc(s.state) + (typeof s.bytes === 'number' ? ', ' + esc(s.bytes) + ' bytes' : '')
    + (typeof s.rows === 'number' && s.state === 'read' ? ', ' + esc(s.rows) + ' lines' : '') + (s.bad ? ', ' + esc(s.bad) + ' unreadable lines' : '') + (s.sha256 ? ', sha256 ' + esc(s.sha256.slice(0, 16)) : '') + '</li>');
  return '<footer><p>Built at ' + (m.builtAt ? esc(m.builtAt) : '<span class="nm">no build stamp given</span>') + ' by <code>node web/build.mjs</code> from the files below. The organism rebuilds this page itself every generation, before its commit; no number on it is typed: each one is read from the file named under it, and the same numbers are served as <a href="/alive/data.json">data.json</a>.</p>'
    + '<ul class="files">' + rows.join('') + '</ul><p><a href="/">back to the organism</a></p></footer>';
}

/** The whole page for a model. */
export function renderAlive(m) {
  return '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
    + '<title>DILATION / BRAIN / ALIVE</title>\n'
    + '<meta name="description" content="The brain growing its own cells in the cloud: its generations, its cells by arm, its self-edits, its cortex and the tasks it set itself, read from its own records at every build.">\n'
    + (m.builtAt ? '<meta name="generated" content="' + esc(m.builtAt) + '">\n' : '')
    + '<style>\n' + STYLE + '\n</style>\n</head>\n<body>\n<div class="wrap">\n'
    + '<header class="top"><div class="brand">DILATION <span class="dim">/</span> BRAIN <span class="dim">/</span> ALIVE</div>'
    + '<nav class="pills"><a class="pill" href="/">organism</a><a class="pill" href="/ask">ask</a><a class="pill" href="/ladder/">ladder</a><a class="pill" href="/findings/">findings</a><a class="pill" href="/portfolio/">portfolio</a><span class="pill here">alive</span></nav></header>\n'
    + hero(m) + '\n' + lastHour(m) + '\n' + generationsSection(m) + '\n' + cellsSection(m) + '\n' + selfSection(m) + '\n' + cortexSection(m) + '\n' + dreamsSection(m) + '\n' + appsSection(m) + '\n'
    + footer(m) + '\n</div>\n</body>\n</html>\n';
}

/** The page for the records readAlive returned; builtAt is the caller's stamp. */
export const aliveHtml = (data, { builtAt = null } = {}) => renderAlive(aliveModel(data, { builtAt }));

/** Read the records under root and write <outDir>/index.html and <outDir>/data.json. Throws when no stamp is passed or an em dash would ship. */
export function generateAlive({ root = ROOT, outDir = null, builtAt } = {}) {
  if (!text(builtAt)) throw new Error('alive: no builtAt: the caller passes its own new Date().toISOString()');
  const dir = outDir || path.join(root, 'web', 'dist', 'alive');
  const m = aliveModel(readAlive(root), { builtAt });
  const html = renderAlive(m), json = jsonText(m);
  if (html.includes(EM) || json.includes(EM)) throw new Error('alive: an em dash reached the page');
  fs.mkdirSync(dir, { recursive: true });
  const page = path.join(dir, 'index.html'), dataPath = path.join(dir, 'data.json');
  fs.writeFileSync(page, html);
  fs.writeFileSync(dataPath, json);
  const lg = m.vitals.lastGeneration;
  return { path: page, dataPath, bytes: Buffer.byteLength(html), dataBytes: Buffer.byteLength(json), cap: PAGE_CAP, generations: m.generations.length, newest: lg.generation,
    survivors: lg.survivors, candidates: lg.candidates, cells: m.cells.length, dreams: m.dreams.count, pointer: m.cortex.pointer,
    notRead: Object.values(m.sources).filter((s) => s.state !== 'read').map((s) => s.file + ' ' + s.state) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const r = generateAlive({ builtAt: new Date().toISOString() });
    console.log(JSON.stringify({ ...r, path: path.relative(ROOT, r.path).split(path.sep).join('/'), dataPath: path.relative(ROOT, r.dataPath).split(path.sep).join('/') }));
  } catch (e) {
    console.error('alive: ' + String((e && e.message) || e).split('\n')[0]);
    process.exit(1);
  }
}
