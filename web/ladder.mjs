// web/ladder.mjs: the LADDER page of the site (/ladder), rendered at build time from the verdict
// files on disk. It is his P4 ruler on a page: per public set the organism against a model alone
// and a null, with their intervals; the published rows each verdict keeps with its sources; the
// answer classes (model in seconds, native in microseconds, direct in nanoseconds); the native
// verdict; organism-years per wall second with the arithmetic sentence from years.json; the P15
// rows the ladder board prints; and the daily series.
//
// THE RULE THE PAGE IS BUILT ON. No number is typed here. Every value that reaches the page text
// is a field of a verdict file, emitted as a span that names the file and the field path
// (data-src="bench/verdicts/<file>:<path>") and the declared format that turned the field into
// the text (data-fmt, one of FORMATS below). The static words of this file carry no digit, so a
// digit anywhere in the page text is either inside a traced span or a defect, and the build
// refuses the page (traceCheck). test/web-ladder.test.mjs walks the built page with its own
// walker, resolves every span against the files, and fails on a number with no field.
//
// MISSING AND PARTIAL. A set with no verdict file on disk renders "not measured", never zero and
// never a dash. A verdict is partial when its name ends -partial, isTheBar is false, complete is
// false, it records n below of, or its progress stopped short; a partial verdict renders the pill
// "partial" and its sample size, both sides traced. The primary verdict of a set is the newest
// whole one, else the newest partial one (the same rule bench/ladder.mjs uses), and every other
// file of the set is listed under "also on disk".
//
// THE LADDER BOARD. bench/verdicts/ladder.json holds the board bench/ladder.mjs computed (answer
// classes, Wilson intervals where a verdict stores none, the comparisons against the bars). Its
// per-set rows are shown only when the board read the same file this page chose as primary; a
// board that read another file is named as stale rather than quoted as current.
//
// Run: node web/ladder.mjs   (writes web/dist/ladder/index.html and prints its size and traces)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
export const TEMPLATE = path.join(ROOT, 'web', 'src', 'ladder.html');
export const OUT_DIR = path.join(ROOT, 'web', 'dist', 'ladder');
export const LABEL_DIR = 'bench/verdicts';
export const LADDER = 'ladder.json';

const EM = String.fromCharCode(0x2014);
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * The only ways a field becomes page text. raw prints the value as the file holds it (an em dash
 * in a string becomes a comma, because the page carries none); pct prints a fraction in [0, 1]
 * as percent points to two places; pts prints a value already in percent points to two places;
 * when prints an ISO time to the minute (the page says UTC beside it); path prints the field path
 * itself, for a label that is the name of the field it sits beside.
 */
export const FORMATS = {
  raw: (v) => String(v).split(EM).join(', '),
  pct: (v) => (v * 100).toFixed(2),
  pts: (v) => v.toFixed(2),
  when: (v) => String(v).slice(0, 16).replace('T', ' '),
};
const NUMERIC = new Set(['pct', 'pts']);
const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/** A dotted field path into parsed JSON; a numeric segment indexes an array. */
export function resolve(obj, p) {
  let cur = obj;
  for (const seg of String(p).split('.')) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    if (Array.isArray(cur)) cur = /^\d+$/.test(seg) ? cur[Number(seg)] : undefined;
    else cur = Object.prototype.hasOwnProperty.call(cur, seg) ? cur[seg] : undefined;
  }
  return cur;
}

/** The three public sets, matched by file name. The fallback labels carry no digit. */
export const SETS = [
  { key: 'gsm8k', fallback: 'grade school math', match: (n) => /^public-gsm8k.*\.json$/.test(n) },
  { key: 'humaneval', fallback: 'HumanEval', match: (n) => /^public-humaneval.*\.json$/.test(n) },
  { key: 'arc', fallback: 'ARC-AGI evaluation', match: (n) => /^public-arc.*\.json$/.test(n) || /^grid-evaluation.*\.json$/.test(n) },
];

/** Where a verdict records its sample size: n of `of`, else progress.done of progress.of. */
export function sampleOf(v) {
  if (!v || typeof v !== 'object') return null;
  if (isNum(v.n) && isNum(v.of)) return { kind: 'sample', n: 'n', of: 'of', short: v.n < v.of };
  const p = v.progress;
  if (p && isNum(p.done) && isNum(p.of)) return { kind: 'progress', n: 'progress.done', of: 'progress.of', short: p.done < p.of };
  return null;
}

/** Whole or partial, and every reason it is partial. */
export function classify(name, v) {
  const why = [];
  if (/-partial\.json$/.test(name)) why.push('name');
  if (v && v.isTheBar === false) why.push('isTheBar');
  if (v && v.complete === false) why.push('complete');
  const sample = sampleOf(v);
  if (sample && sample.short) why.push(sample.kind);
  return { partial: why.length > 0, why, sample };
}

const atMs = (v) => { const t = v && typeof v.at === 'string' ? Date.parse(v.at) : NaN; return Number.isFinite(t) ? t : 0; };

/** Newest whole, else newest partial. Unreadable files are never primary. */
export function pickPrimary(entries) {
  const readable = entries.filter((e) => e.json && typeof e.json === 'object');
  const byAt = readable.slice().sort((a, b) => atMs(b.json) - atMs(a.json) || (a.name < b.name ? -1 : 1));
  return byAt.find((e) => !e.cls.partial) || byAt[0] || null;
}

// ------------------------------------------------------------------ the trace context

class Ctx {
  constructor(dir) { this.dir = dir; this.cache = new Map(); this.spans = 0; this.numbers = 0; this.read = new Set(); }
  json(name) {
    if (!this.cache.has(name)) {
      let j = null;
      try { j = JSON.parse(readFileSync(path.join(this.dir, name), 'utf8')); } catch { j = null; }
      this.cache.set(name, j);
    }
    return this.cache.get(name);
  }
  count(text) { this.spans++; this.numbers += (String(text).match(/\d+(?:\.\d+)?/g) || []).length; }
  /** A traced value, or null when the field is absent or is not what the format needs. */
  t(name, p, fmt = 'raw', extra = '') {
    const v = resolve(this.json(name), p);
    if (v === undefined || v === null) return null;
    if (NUMERIC.has(fmt) && !isNum(v)) return null;
    if (typeof v === 'object') return null;
    const text = FORMATS[fmt](v);
    this.count(text);
    this.read.add(name);
    const file = LABEL_DIR + '/' + name;
    return '<span class="t' + (extra ? ' ' + extra : '') + '" data-src="' + esc(file + ':' + p) + '" data-fmt="' + fmt
      + '" title="' + esc(file + ', field ' + p) + '">' + esc(text) + '</span>';
  }
  /** A label that is the field path itself; the field must exist. */
  path(name, p) {
    if (resolve(this.json(name), p) === undefined) return null;
    this.count(p);
    const file = LABEL_DIR + '/' + name;
    return '<span class="t k" data-src="' + esc(file + ':' + p) + '" data-fmt="path" title="' + esc(file + ', field ' + p) + '">' + esc(p) + '</span>';
  }
  /** A verdict file named in the text; the file must be on disk. */
  file(name) {
    const file = LABEL_DIR + '/' + name;
    this.count(file);
    this.read.add(name);
    return '<span class="t f" data-file="' + esc(file) + '" title="' + esc(file + ', the file itself') + '">' + esc(file) + '</span>';
  }
}

const NM = '<span class="nm">not measured</span>';
const or = (x, alt = NM) => (x === null || x === undefined ? alt : x);
const pill = (cls, text) => '<span class="pill st ' + cls + '">' + text + '</span>';
const statusPill = (cls) => (cls.partial ? pill('partial', 'partial') : pill('whole', 'whole'));
const clamp = (x) => Math.max(0, Math.min(100, x));
const pos = (x) => clamp(x).toFixed(2) + '%';

/** Why a verdict is partial, with its sample size traced on both sides. */
function partialLine(ctx, e) {
  const parts = [];
  for (const w of e.cls.why) {
    if (w === 'name') parts.push('the file is named partial');
    else if (w === 'isTheBar') parts.push('isTheBar is false');
    else if (w === 'complete') parts.push('complete is false');
    else if (w === 'sample') parts.push('a sample of ' + ctx.t(e.name, 'n') + ' of ' + ctx.t(e.name, 'of') + ' records');
    else if (w === 'progress') parts.push('it stopped at ' + ctx.t(e.name, 'progress.done') + ' of ' + ctx.t(e.name, 'progress.of'));
  }
  let size;
  const s = e.cls.sample;
  if (s) size = 'sample size ' + ctx.t(e.name, s.n) + ' of ' + ctx.t(e.name, s.of);
  else size = 'sample size not recorded in this verdict';
  const reasons = Array.isArray(e.json.notTheBarBecause)
    ? e.json.notTheBarBecause.map((_, i) => ctx.t(e.name, 'notTheBarBecause.' + i)).filter(Boolean) : [];
  return '<p class="partial-note">' + pill('partial', 'partial') + ' ' + size + '. Partial because ' + parts.join('; ')
    + '. No bar can be claimed from a partial verdict.'
    + (reasons.length ? ' The verdict says: ' + reasons.join('; ') + '.' : '') + '</p>';
}

/** Where the verdict came from: file, time, command, model. */
function sourceLine(ctx, e) {
  const cmd = ctx.t(e.name, 'command');
  const model = ctx.t(e.name, 'model');
  return '<p class="src">read from ' + ctx.file(e.name) + ', written ' + or(ctx.t(e.name, 'at', 'when'), 'at a time it does not record')
    + (ctx.json(e.name).at ? ' UTC' : '') + (cmd ? ' by <code>' + cmd + '</code>' : '')
    + '; model ' + (model || (e.json.model === null ? 'none (no model arm)' : 'not recorded')) + '</p>';
}

// ------------------------------------------------------------------ one public set

function armRows(ctx, e, ls, lsi, consistent) {
  const v = e.json;
  const defs = [['organism', 'organism'], ['alone', 'model alone'], ['null', 'null']];
  const out = [], marks = [];
  for (const [arm, label] of defs) {
    const a = v.arms && v.arms[arm];
    const base = 'arms.' + arm;
    let correct = null, n = null, acc = null, iv = null, ms = null, frac = null, lo = null, hi = null, note = '';
    if (a && a.absent === true) {
      const why = ctx.t(e.name, base + '.absentReason') || ctx.t(e.name, base + '.reason');
      out.push('<tr><td>' + label + '</td><td colspan="5">' + NM + (why ? ', ' + why : '') + '</td></tr>');
      continue;
    }
    if (a) {
      const cKey = a.correct !== undefined ? 'correct' : 'solved';
      correct = ctx.t(e.name, base + '.' + cKey);
      n = ctx.t(e.name, base + '.n');
      acc = ctx.t(e.name, base + '.accuracy', 'pct');
      ms = ctx.t(e.name, base + '.meanMs');
      if (isNum(a.accuracy)) frac = a.accuracy;
      if (a.interval && isNum(a.interval.lo) && isNum(a.interval.hi)) {
        iv = '[' + ctx.t(e.name, base + '.interval.lo', 'pct') + ', ' + ctx.t(e.name, base + '.interval.hi', 'pct') + ']';
        lo = a.interval.lo; hi = a.interval.hi;
      }
    } else if (arm === 'organism' && isNum(v.solved) && isNum(v.n)) {
      // a verdict of the grid search: no arms block, the organism is the search itself
      correct = ctx.t(e.name, 'solved');
      n = ctx.t(e.name, 'n');
      acc = ctx.t(e.name, 'pct', 'pts');
      ms = ctx.t(e.name, 'meanMs');
      if (isNum(v.pct)) frac = v.pct / 100;
    } else {
      const why = v.model === null ? 'not run: this verdict records no model arm' : 'not recorded in this verdict';
      out.push('<tr><td>' + label + '</td><td colspan="5">' + NM + ', ' + why + '</td></tr>');
      continue;
    }
    if (!iv && consistent && ls.arms && ls.arms[arm] && ls.arms[arm].interval && isNum(ls.arms[arm].interval.lo)) {
      const lb = 'board.sets.' + lsi + '.arms.' + arm;
      iv = '[' + ctx.t(LADDER, lb + '.interval.lo', 'pct') + ', ' + ctx.t(LADDER, lb + '.interval.hi', 'pct') + ']';
      const from = ctx.t(LADDER, lb + '.intervalFrom');
      note = from ? '<div class="dim">interval from ' + from + '</div>' : '';
      lo = ls.arms[arm].interval.lo; hi = ls.arms[arm].interval.hi;
    }
    out.push('<tr><td>' + label + '</td><td class="n">' + or(correct, 'not recorded') + '</td><td class="n">' + or(n, 'not recorded')
      + '</td><td class="n">' + (acc ? acc + '%' : NM) + '</td><td class="n">' + (iv || '<span class="nm">no interval recorded</span>') + note
      + '</td><td class="n">' + (ms ? ms + ' ms' : 'not recorded') + '</td></tr>');
    if (frac !== null) marks.push({ arm, x: frac * 100, lo: lo !== null ? lo * 100 : null, hi: hi !== null ? hi * 100 : null });
  }
  return { html: '<div class="scroll"><table class="arms"><tr><th>arm</th><th class="n">correct</th><th class="n">of</th><th class="n">accuracy</th>'
    + '<th class="n">interval</th><th class="n">mean per record</th></tr>' + out.join('') + '</table></div>', marks };
}

/** Published rows kept inside the set's verdicts, each traced to the first file holding it. */
function publishedRows(entries) {
  const rows = [], seen = new Set();
  for (const e of entries) {
    if (!e.json || !Array.isArray(e.json.published)) continue;
    e.json.published.forEach((r, i) => {
      if (!r || typeof r !== 'object') return;
      const key = r.system + '|' + r.score + '|' + (r.metric === undefined ? '' : r.metric);
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({ e, i, r });
    });
  }
  return rows.sort((a, b) => (isNum(b.r.score) ? b.r.score : -1) - (isNum(a.r.score) ? a.r.score : -1));
}

/** The frontier row by the ladder's rule when the board is not current: the best frontier-class
 *  row held to one answer (a pass@k row with k above one is not one answer). */
function ownFrontier(rows) {
  const ok = rows.filter(({ r }) => typeof r.class === 'string' && /^frontier/.test(r.class) && !/no reasoning/.test(r.class)
    && !(typeof r.metric === 'string' && /pass@(\d+)/.test(r.metric) && Number(/pass@(\d+)/.exec(r.metric)[1]) > 1) && isNum(r.score));
  return ok.length ? ok[0] : null;
}

function publishedTable(ctx, rows, ls, consistent) {
  if (!rows.length) return '<p class="dim">No published row is kept inside this set\'s verdicts.</p>';
  const b = consistent && ls.bars ? ls.bars : null;
  const same = (bar, r) => bar && r.system === bar.system && r.score === bar.score;
  const front = b ? null : ownFrontier(rows);
  const body = rows.map(({ e, i, r }) => {
    const p = 'published.' + i;
    let role = '';
    if (b ? same(b.row405, r) : (typeof r.class === 'string' && /405B/.test(r.class))) role = '<span class="pill st bar">local-model bar</span>';
    if (b ? same(b.frontier, r) : (front && front.r === r)) role = '<span class="pill st bar">frontier bar</span>';
    const src = typeof r.source === 'string' ? /^https?:\/\/\S+/.exec(r.source) : null;
    return '<tr' + (role ? ' class="barrow"' : '') + '><td>' + role + '</td><td>' + or(ctx.t(e.name, p + '.system'), 'unnamed') + '</td><td class="n">'
      + or(ctx.t(e.name, p + '.score'), 'not recorded') + (r.unit === 'percent' ? '%' : '') + '</td><td>' + or(ctx.t(e.name, p + '.metric'), '<span class="dim">no metric recorded</span>')
      + '</td><td>' + or(ctx.t(e.name, p + '.class'), '') + '</td><td class="srccell">' + or(ctx.t(e.name, p + '.source'), 'no source recorded')
      + (src ? ' <a class="go" href="' + esc(src[0]) + '" rel="noopener noreferrer" target="_blank">open</a>' : '')
      + '</td><td class="nw">' + or(ctx.t(e.name, p + '.readAt'), '') + '</td><td>' + ctx.file(e.name) + '</td></tr>';
  }).join('');
  return '<div class="scroll"><table class="pub"><tr><th></th><th>system</th><th class="n">score</th><th>metric</th><th>class</th><th>source</th><th>read</th><th>kept in</th></tr>'
    + body + '</table></div>' + (b ? '' : '<p class="dim">The bars are marked by the ladder\'s rule applied here: the ladder board did not read this set\'s primary verdict.</p>');
}

function comparisons(ctx, ls, lsi) {
  const b = ls.bars;
  if (!b) return '';
  const base = 'board.sets.' + lsi + '.bars';
  const lines = [];
  for (const [k, label] of [['alone', 'against the model alone'], ['null', 'against the null']]) {
    const x = b[k];
    if (!x) continue;
    if (x.verdict === 'absent') { lines.push('<li>' + label + ': ' + NM + (x.reason ? ', ' + ctx.t(LADDER, base + '.' + k + '.reason') : '') + '</li>'); continue; }
    lines.push('<li>' + label + ': ' + or(ctx.t(LADDER, base + '.' + k + '.verdict'), 'not recorded') + ' (organism ' + or(ctx.t(LADDER, base + '.' + k + '.organism'), 'not recorded')
      + ', other ' + or(ctx.t(LADDER, base + '.' + k + '.other'), 'not recorded') + ')</li>');
  }
  for (const [k, label] of [['row405', 'the local-model bar'], ['frontier', 'the frontier bar'], ['orchestrator', 'the orchestrator\'s own row']]) {
    const x = b[k];
    const p = base + '.' + k;
    if (!x) { lines.push('<li>' + label + ': <span class="nm">no such row kept for this set</span></li>'); continue; }
    const decided = x.decided ? 'decided ' + or(ctx.t(LADDER, p + '.decided'), 'not recorded') + ' (the interval ' + or(ctx.t(LADDER, p + '.lo'), 'not recorded') + ' to ' + or(ctx.t(LADDER, p + '.hi'), 'not recorded') + ' excludes it)'
      : 'undecided (the interval ' + or(ctx.t(LADDER, p + '.lo'), 'not recorded') + ' to ' + or(ctx.t(LADDER, p + '.hi'), 'not recorded') + ' contains it)';
    lines.push('<li>' + label + ', ' + or(ctx.t(LADDER, p + '.system'), 'not recorded') + ' at ' + or(ctx.t(LADDER, p + '.score'), 'not recorded') + ': organism ' + or(ctx.t(LADDER, p + '.pct'), 'not recorded')
      + ', ' + or(ctx.t(LADDER, p + '.side'), 'not recorded') + ' by ' + or(ctx.t(LADDER, p + '.gapPoints'), 'not recorded') + ' points, ' + decided
      + (k === 'orchestrator' && x.source ? '; source ' + or(ctx.t(LADDER, p + '.source'), 'not recorded') : '') + '</li>');
  }
  const claim = b.claimable === true ? 'A bar can be claimed from this verdict.' : 'No bar can be claimed from this verdict.';
  return '<h3>Against the bars</h3><ul class="bars">' + lines.join('') + '</ul><p class="dim">' + claim + ' Read by ' + ctx.file(LADDER) + ' at '
    + or(ctx.t(LADDER, 'at', 'when'), 'a time it does not record') + ' UTC.</p>';
}

const CLASS_WORDS = { model: ['model', 'a model call, in seconds'], native: ['native', 'cells, no model call, in microseconds'], direct: ['direct', 'one hypervector lookup, in nanoseconds'] };

function classRows(ctx, ls, lsi) {
  if (!ls.classes) return '';
  const rows = [];
  for (const k of ['model', 'native', 'direct']) {
    const c = ls.classes[k];
    const p = 'board.sets.' + lsi + '.classes.' + k;
    if (!c) { rows.push('<tr><td>' + CLASS_WORDS[k][0] + '</td><td colspan="4">' + NM + '</td></tr>'); continue; }
    const lat = isNum(c.latency) ? ctx.t(LADDER, p + '.latency') + ' ' + or(ctx.t(LADDER, p + '.unit'), '') : NM + ' <span class="dim">(no answer of this class carries a time)</span>';
    const latC = isNum(c.latencyCorrect) ? ctx.t(LADDER, p + '.latencyCorrect') + ' ' + or(ctx.t(LADDER, p + '.unit'), '') : NM;
    const inferred = isNum(c.inferred) && c.inferred > 0 ? '<div class="dim">' + ctx.t(LADDER, p + '.inferred') + ' inferred: the verdict has no model, so its answers are counted native</div>' : '';
    rows.push('<tr><td>' + CLASS_WORDS[k][0] + ' <div class="dim">' + CLASS_WORDS[k][1] + '</div></td><td class="n">' + or(ctx.t(LADDER, p + '.share', 'pct'), 'not recorded')
      + '%<div class="dim">' + or(ctx.t(LADDER, p + '.records'), 'not recorded') + ' of ' + or(ctx.t(LADDER, p + '.of'), 'not recorded') + '</div></td><td class="n">'
      + or(ctx.t(LADDER, p + '.correct'), 'not recorded') + '</td><td class="n">' + lat + inferred + '</td><td class="n">' + latC + '</td></tr>');
  }
  return '<h3>Answer classes</h3><div class="scroll"><table class="classes"><tr><th>class</th><th class="n">share</th><th class="n">correct</th><th class="n">mean time</th><th class="n">mean time when correct</th></tr>'
    + rows.join('') + '</table></div>';
}

function provenanceLine(ctx, e) {
  const prov = e.json.arms && e.json.arms.organism && e.json.arms.organism.provenance;
  if (!prov || typeof prov !== 'object') return '';
  const bits = [];
  for (const [k, x] of Object.entries(prov)) {
    if (/\d/.test(k) || /\./.test(k) || !x || typeof x !== 'object') continue;
    const p = 'arms.organism.provenance.' + k;
    bits.push('<b>' + esc(k) + '</b> ' + or(ctx.t(e.name, p + '.n'), 'not recorded') + (x.correct !== undefined ? ' answers, ' + ctx.t(e.name, p + '.correct') + ' correct' : ' answers'));
  }
  return bits.length ? '<p class="src">The organism\'s answers by provenance, as the verdict records them: ' + bits.join('; ') + '.</p>' : '';
}

function alsoOnDisk(ctx, others, ls, lsi) {
  if (!others.length) return '';
  const items = others.map((e) => {
    if (!e.json) return '<li>' + ctx.file(e.name) + ': unreadable, not parsed as JSON</li>';
    const s = e.cls.sample;
    const size = s ? ', ' + ctx.t(e.name, s.n) + ' of ' + ctx.t(e.name, s.of) : '';
    const a = e.json.arms && e.json.arms.organism;
    let org = '';
    if (a && a.absent !== true && (a.correct !== undefined || a.solved !== undefined)) {
      org = ', organism ' + ctx.t(e.name, 'arms.organism.' + (a.correct !== undefined ? 'correct' : 'solved')) + ' of ' + or(ctx.t(e.name, 'arms.organism.n'), 'not recorded');
    } else if (ls && Array.isArray(ls.alsoOnDisk)) {
      const j = ls.alsoOnDisk.findIndex((x) => x && x.file === LABEL_DIR + '/' + e.name);
      if (j >= 0 && ls.alsoOnDisk[j].organism) org = ', organism ' + ctx.t(LADDER, 'board.sets.' + lsi + '.alsoOnDisk.' + j + '.organism') + ' (counted by the ladder)';
    }
    return '<li>' + ctx.file(e.name) + ' ' + statusPill(e.cls) + ' written ' + or(ctx.t(e.name, 'at', 'when'), 'at an unrecorded time') + (e.json.at ? ' UTC' : '') + size + org + '</li>';
  });
  return '<h3>Also on disk</h3><ul class="also">' + items.join('') + '</ul>';
}

function rulerHtml(marks, pubs, ls, consistent) {
  if (!marks.length && !pubs.length) return '';
  const parts = ['<div class="track"></div>'];
  const org = marks.find((m) => m.arm === 'organism');
  if (org && org.lo !== null && org.hi !== null) parts.push('<div class="band" style="left:' + pos(org.lo) + ';width:' + pos(org.hi - org.lo) + '"></div>');
  const b = consistent && ls && ls.bars ? ls.bars : null;
  for (const { r } of pubs) {
    if (!isNum(r.score) || r.unit !== 'percent') continue;
    const isBar = b && ((b.row405 && b.row405.system === r.system && b.row405.score === r.score) || (b.frontier && b.frontier.system === r.system && b.frontier.score === r.score));
    parts.push('<div class="tick' + (isBar ? ' bar' : '') + '" style="left:' + pos(r.score) + '" title="' + esc('published: ' + r.system) + '"></div>');
  }
  for (const m of marks.slice().reverse()) parts.push('<div class="dot ' + m.arm + '" style="left:' + pos(m.x) + '" title="' + esc(m.arm) + '"></div>');
  return '<div class="ruler" aria-hidden="true">' + parts.join('') + '</div>'
    + '<div class="legend"><span><i class="org"></i>organism</span><span><i class="alone"></i>model alone</span><span><i class="null"></i>null</span>'
    + '<span><i class="tk"></i>published row</span><span><i class="tk bar"></i>a bar</span><span class="dim">left edge none right, right edge all right; the band is the organism\'s interval</span></div>';
}

function setCard(ctx, set, names, ladder) {
  const sets = ladder && ladder.board && Array.isArray(ladder.board.sets) ? ladder.board.sets : [];
  const lsi = sets.findIndex((s) => s && s.key === set.key);
  const ls = lsi >= 0 ? sets[lsi] : null;
  const label = ls ? (ctx.t(LADDER, 'board.sets.' + lsi + '.name') || esc(set.fallback)) : esc(set.fallback);
  const entries = names.map((name) => { const json = ctx.json(name); return { name, json, cls: classify(name, json) }; });
  const primary = pickPrimary(entries);
  if (!primary) {
    return { key: set.key, status: 'not measured', html: '<section class="card set missing" id="set-' + set.key + '"><div class="head"><h2>' + label + '</h2>' + pill('none', 'not measured')
      + '</div><p>' + NM + ': no verdict file for this set is on disk' + (entries.length ? ' that parses' : '') + ', so there is no accuracy, no interval and no answer class to show.</p>'
      + (entries.length ? alsoOnDisk(ctx, entries, null, -1) : '') + '</section>' };
  }
  const others = entries.filter((e) => e !== primary).sort((a, b) => atMs(b.json) - atMs(a.json));
  const consistent = Boolean(ls && ls.primary && ls.primary.file === LABEL_DIR + '/' + primary.name);
  const arms = armRows(ctx, primary, ls, lsi, consistent);
  const pubs = publishedRows([primary, ...others]);
  let board;
  if (consistent) board = comparisons(ctx, ls, lsi) + classRows(ctx, ls, lsi) + (lsi >= 0 && ladder.board.direct ? '<p class="dim">' + or(ctx.t(LADDER, 'board.direct.note'), '') + '</p>' : '');
  else if (ls && ls.primary && ls.primary.file) board = '<p class="stale">The ladder board read ' + ctx.t(LADDER, 'board.sets.' + lsi + '.primary.file') + ', not this primary, so its comparisons and answer classes are not quoted here. They come back when node bench/ladder.mjs runs again.</p>';
  else board = '<p class="stale">' + NM + ': the ladder board has no row for this set' + (ladder ? '' : ' (no ladder.json on disk)') + ', so the comparisons and the answer classes are not shown.</p>';
  const html = '<section class="card set" id="set-' + set.key + '"><div class="head"><h2>' + label + '</h2>' + statusPill(primary.cls) + '</div>'
    + sourceLine(ctx, primary) + (primary.cls.partial ? partialLine(ctx, primary) : '')
    + rulerHtml(arms.marks, pubs, ls, consistent) + arms.html + provenanceLine(ctx, primary)
    + '<h3>Published rows, kept inside the verdicts</h3>' + publishedTable(ctx, pubs, ls, consistent)
    + board + alsoOnDisk(ctx, others, ls, lsi) + '</section>';
  return { key: set.key, status: primary.cls.partial ? 'partial' : 'whole', primary: primary.name, consistent, html };
}

// ------------------------------------------------------------------ native.json and years.json

/** Scalar leaves under objects (arrays of objects are rows, not headline fields). */
export function leaves(obj, prefix = '', out = [], depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return out;
  for (const [k, v] of Object.entries(obj)) {
    if (k.includes('.')) continue;
    const p = prefix ? prefix + '.' + k : k;
    if (v === null || v === undefined) continue;
    if (Array.isArray(v)) {
      if (v.length <= 8 && v.every((x) => typeof x !== 'object' || x === null)) v.forEach((x, i) => { if (x !== null) out.push({ p: p + '.' + i, v: x }); });
      continue;
    }
    if (typeof v === 'object') leaves(v, p, out, depth + 1);
    else out.push({ p, v });
  }
  return out;
}

/** The first leaf whose path matches, trying each pattern in turn (the most specific first). */
function find(ls, re, want) {
  for (const one of Array.isArray(re) ? re : [re]) {
    const hit = ls.find(({ p, v }) => one.test(p) && (want === 'number' ? isNum(v) : typeof v === 'string'));
    if (hit) return hit;
  }
  return null;
}

const SKIP_TOP = new Set(['at', 'command', 'node', 'isTheBar', 'statement']);

function verdictCard(ctx, dirNames, base, title, lede, heads, special) {
  const names = dirNames.filter((n) => n === base + '.json' || n === base + '-partial.json');
  // other files named for the same item (a before-measurement, say) are listed, never read as the result
  const related = dirNames.filter((n) => n.startsWith(base + '-') && !names.includes(n))
    .map((name) => { const json = ctx.json(name); return { name, json, cls: classify(name, json) }; });
  const relatedHtml = related.length ? '<p class="dim">Other files named for this item are on disk. None is ' + esc(base) + '.json or ' + esc(base) + '-partial.json, so none is read here as the result:</p>'
    + alsoOnDisk(ctx, related, null, -1).replace('<h3>Also on disk</h3>', '') : '';
  const entries = names.map((name) => { const json = ctx.json(name); return { name, json, cls: classify(name, json) }; });
  const primary = pickPrimary(entries);
  const id = 'v-' + base;
  if (!primary) {
    return { base, status: 'not measured', html: '<section class="card" id="' + id + '"><div class="head"><h2>' + title + '</h2>' + pill('none', 'not measured') + '</div><p class="lede">' + lede
      + '</p><p>' + NM + ': no ' + esc(base) + '.json and no ' + esc(base) + '-partial.json is on disk under bench/verdicts when this page was built.</p>' + relatedHtml + '</section>' };
  }
  const all = leaves(primary.json);
  const rows = [];
  // a verdict whose shape this page knows is drawn by its own renderer; the named-field search is the fallback
  const own = special ? special(ctx, primary) : null;
  for (const h of own ? [] : heads) {
    const hit = find(all, h.re, h.want);
    if (!hit) { rows.push('<tr><td>' + h.label + '</td><td>' + NM + ' <span class="dim">(no field named like it)</span></td></tr>'); continue; }
    rows.push('<tr><td>' + h.label + '<div class="dim">field ' + ctx.path(primary.name, hit.p) + '</div></td><td class="' + (h.want === 'number' ? 'n big' : 'sentence') + '">'
      + ctx.t(primary.name, hit.p) + '</td></tr>');
  }
  const fields = all.filter(({ p, v }) => !SKIP_TOP.has(p) && (isNum(v) || typeof v === 'boolean')).slice(0, 48)
    .map(({ p }) => '<tr><td>' + ctx.path(primary.name, p) + '</td><td class="n">' + ctx.t(primary.name, p) + '</td></tr>').join('');
  const others = entries.filter((e) => e !== primary);
  const html = '<section class="card" id="' + id + '"><div class="head"><h2>' + title + '</h2>' + statusPill(primary.cls) + '</div><p class="lede">' + lede + '</p>'
    + sourceLine(ctx, primary) + (primary.cls.partial ? partialLine(ctx, primary) : '')
    + (own || '<div class="scroll"><table class="heads">' + rows.join('') + '</table></div>')
    + (primary.json.statement ? '<h3>Its statement</h3><p class="statement">' + ctx.t(primary.name, 'statement') + '</p>' : '')
    + (fields ? '<details><summary>every numeric field of the verdict</summary><div class="scroll"><table class="fields">' + fields + '</table></div></details>' : '')
    + alsoOnDisk(ctx, others, null, -1) + relatedHtml + '</section>';
  return { base, status: primary.cls.partial ? 'partial' : 'whole', primary: primary.name, html };
}

const NATIVE_HEADS = [
  { label: 'recall at one through ask()', re: [/recall.*share/i, /recall/i], want: 'number' },
  { label: 'native share', re: [/nativeShare|native.*share|share.*native|memoryShare/i], want: 'number' },
  { label: 'microseconds per native answer', re: [/native.*(meanUs|P50Us|Us$)/i, /(^|\.)(mean)?(us|micros|microseconds)\b|Us$|MeanUs|usPer|meanUs/i], want: 'number' },
  { label: 'direct share', re: [/directShare|direct.*share|hitShare/i, /direct.*hit/i], want: 'number' },
  { label: 'nanoseconds per direct hit', re: [/direct.*(Ns$|nanos)/i, /ns.*hit|hit.*ns|nsPer|Ns$|nanos/i], want: 'number' },
];
/**
 * years.json as bench/years.mjs writes it: runs[] and control, each with years (the count and its
 * arithmetic), projection (one billion organism-years at the measured rate, labelled a projection)
 * and fresh[] (the score on draws the loop never searched). Null when the verdict has no runs.
 */
function yearsRuns(ctx, e) {
  const j = e.json;
  const list = [];
  if (Array.isArray(j.runs)) j.runs.forEach((r, i) => { if (r && typeof r === 'object' && r.years) list.push({ r, p: 'runs.' + i }); });
  if (j.control && typeof j.control === 'object' && j.control.years) list.push({ r: j.control, p: 'control' });
  if (!list.length) return null;
  const f = (p, fmt, alt) => or(ctx.t(e.name, p, fmt), alt === undefined ? NM : alt);
  const num = (p) => { const v = resolve(j, p); return isNum(v) && !Number.isInteger(v) ? f(p, 'pts') : f(p); };
  const rows = list.map(({ r, p }) => {
    const fr = Array.isArray(r.fresh) && r.fresh[0] ? p + '.fresh.0' : null;
    return '<tr><td>' + f(p + '.label', 'raw', esc(p)) + '<div class="dim">' + f(p + '.plane', 'raw', '') + '</div></td>'
      + '<td class="n">' + num(p + '.years.organismYears') + '</td>'
      + '<td class="n">' + num(p + '.years.wallMs') + '</td>'
      + '<td class="n big">' + num(p + '.years.generationsPerSecond') + '</td>'
      + '<td class="n">' + (fr ? f(fr + '.start') + ' to ' + f(fr + '.end') + ' of ' + f(fr + '.tasks') + '<div class="dim">' + f(fr + '.name', 'raw', '') + '</div>' : NM) + '</td>'
      + '<td class="n">' + (fr ? num(fr + '.perMillionYears') : NM) + '</td>'
      + '<td class="n">' + (r.firstPlateauS === null ? '<span class="dim">no plateau fired</span>' : num(p + '.firstPlateauS')) + '</td></tr>';
  }).join('');
  const sentences = list.map(({ r, p }) => '<li>' + f(p + '.label', 'raw', esc(p)) + ': ' + f(p + '.years.arithmetic', 'raw', '<span class="nm">no arithmetic recorded</span>')
    + (r.projection ? '<div class="dim">' + f(p + '.projection.arithmetic', 'raw', '') + '</div>' : '') + '</li>').join('');
  const planes = j.bar && Array.isArray(j.bar.perPlane) ? j.bar.perPlane.map((x, i) => f('bar.perPlane.' + i + '.plane', 'raw', 'a plane') + ' ran: ' + f('bar.perPlane.' + i + '.ran')).join('; ') : '';
  return (j.declaration && j.declaration.declaration ? '<p>The declaration: ' + f('declaration.declaration') + '.</p>' : '')
    + '<div class="scroll"><table class="years"><tr><th>run</th><th class="n">organism-years</th><th class="n">wall ms</th><th class="n">organism-years per wall second</th>'
    + '<th class="n">fresh draw, start to end</th><th class="n">gained per million organism-years</th><th class="n">first plateau, s</th></tr>' + rows + '</table></div>'
    + '<p class="dim">The per-second column is the field years.generationsPerSecond of each run: by the declaration above, one generation is one organism-year.</p>'
    + '<h3>The arithmetic, as the verdict prints it</h3><ul class="also">' + sentences + '</ul>'
    + (j.bar ? '<p>The bar: ' + f('bar.rule', 'raw', '<span class="nm">no rule recorded</span>') + '. Met: ' + f('barMet', 'raw', 'not recorded') + (planes ? '; ' + planes : '') + '.</p>' : '');
}

const YEARS_HEADS = [
  { label: 'organism-years per wall second', re: /years?.*per.*(wall|sec)|yearsPerS/i, want: 'number' },
  { label: 'the arithmetic', re: /arithmetic/i, want: 'string' },
  { label: 'score gained per million organism-years', re: /perMillion|per.*million/i, want: 'number' },
  { label: 'seconds to one billion organism-years, a projection', re: /billion/i, want: 'number' },
  { label: 'plateau second', re: /plateau/i, want: 'number' },
];

// ------------------------------------------------------------------ organism-years per wall hour
//
// Board 20 builder. One line: organism-years per wall hour, for the grid plane of years.json and
// for the spread run of spread.json. The page types no number, so each per-hour figure is a field
// of bench/verdicts/spread-rate.json (node bench/spread.mjs --rate writes it, and so does every
// spread run at its end). At build time this file does the arithmetic again over the two source
// verdicts on disk and shows a figure only when the record holds exactly that arithmetic. A source
// verdict on disk without its field throws: the line is never drawn from a guess. A record that
// no longer matches its source (the source was re-run since) is named, with no number.

export const RATE = 'spread-rate.json';
export const HOUR_S = 3600;
const RATE_KEYS = ['years', 'spread'];
const fmtInt = (x) => Math.round(x).toLocaleString('en-US');

/** Where a source verdict keeps its organism-years and its wall; null when the file is absent or does not parse. */
export function rateSource(key, json) {
  if (!json || typeof json !== 'object') return null;
  if (key === 'years') {
    const runs = Array.isArray(json.runs) ? json.runs : [];
    let best = -1;
    runs.forEach((r, i) => { if (r && r.plane === 'grid' && (best < 0 || (Number(r.budgetS) || 0) > (Number(runs[best].budgetS) || 0))) best = i; });
    if (best < 0) throw new Error('ladder: years.json has no grid run in runs, so organism-years per wall hour cannot be computed from it');
    return { key, file: 'years.json', labelField: 'runs.' + best + '.label', organismYearsField: 'runs.' + best + '.years.organismYears', wallField: 'runs.' + best + '.years.wallMs', wallUnit: 'ms' };
  }
  if (key === 'spread') return { key, file: 'spread.json', labelField: null, organismYearsField: 'organismYears', wallField: 'wallS', wallUnit: 's' };
  throw new Error('rateSource: unknown source ' + key);
}

/** One source's arithmetic: organism-years over its wall in seconds, times the seconds of an hour. Throws when a field is missing. */
export function rateOf(key, json) {
  const s = rateSource(key, json);
  if (!s) return null;
  const y = resolve(json, s.organismYearsField), w = resolve(json, s.wallField);
  if (!isNum(y) || y < 0) throw new Error('ladder: ' + s.file + ' has no organism-years at ' + s.organismYearsField + ', so organism-years per wall hour cannot be computed');
  if (!isNum(w) || w <= 0) throw new Error('ladder: ' + s.file + ' has no wall at ' + s.wallField + ', so organism-years per wall hour cannot be computed');
  const wallS = s.wallUnit === 'ms' ? w / 1000 : w;
  const perWallHour = Math.round((y / wallS) * HOUR_S);
  return {
    ...s, at: json.at ?? null, label: s.labelField ? (resolve(json, s.labelField) ?? null) : 'spread, both arms', organismYears: y, wall: w, wallS, perWallHour,
    arithmetic: fmtInt(y) + ' organism-years / ' + wallS.toFixed(3) + ' s x ' + fmtInt(HOUR_S) + ' s per hour = ' + fmtInt(perWallHour) + ' organism-years per wall hour (bench/verdicts/' + s.file + ', ' + s.organismYearsField + ' over ' + s.wallField + ')',
  };
}

/** The record bench/spread.mjs --rate writes as bench/verdicts/spread-rate.json, from the parsed source verdicts. */
export function rateRecord(sources, { command = null, node = process.version, at = new Date().toISOString() } = {}) {
  const rows = RATE_KEYS.map((k) => rateOf(k, sources[k])).filter(Boolean);
  return {
    name: 'spread-rate', at, command, node, isTheBar: false, derived: true, author: 'board 20 builder',
    rule: 'organism-years per wall hour = organism-years / wall seconds x ' + HOUR_S + ', each pair read from one verdict file (years.json: its longest grid run; spread.json: organismYears over wallS, the whole run)',
    sources: rows,
    statement: rows.length ? rows.map((r) => r.label + ': ' + r.arithmetic).join('; ') + '.' : 'no source verdict on disk.',
  };
}

/** The line on the page: each figure a field of spread-rate.json that equals the arithmetic over its source now. */
function rateLine(ctx, names) {
  const head = '<section class="card" id="per-hour"><div class="head"><h2>Organism-years per wall hour</h2></div>';
  const now = RATE_KEYS.map((k) => (names.includes(k + '.json') ? rateOf(k, ctx.json(k + '.json')) : null)).filter(Boolean);
  if (!now.length) return head + '<p>organism-years per wall hour: ' + NM + ' (no years.json and no spread.json under bench/verdicts).</p></section>';
  const rec = names.includes(RATE) ? ctx.json(RATE) : null;
  const recRows = rec && Array.isArray(rec.sources) ? rec.sources : [];
  const parts = now.map((s) => {
    const i = recRows.findIndex((r) => r && r.key === s.key);
    const r = i >= 0 ? recRows[i] : null;
    const label = s.labelField ? or(ctx.t(s.file, s.labelField), esc(s.key)) : esc(s.label);
    const same = r && r.perWallHour === s.perWallHour && r.organismYears === s.organismYears && r.wall === s.wall && r.organismYearsField === s.organismYearsField && r.wallField === s.wallField;
    if (!same) return label + ': ' + NM + (rec ? ', ' + ctx.file(RATE) + ' was not computed from ' + ctx.file(s.file) + ' as it is on disk now; node bench/spread.mjs --rate rewrites it' : ', bench/verdicts/spread-rate.json is absent; node bench/spread.mjs --rate writes it');
    return '<b>' + ctx.t(RATE, 'sources.' + i + '.perWallHour') + '</b> for ' + label + ' (' + ctx.t(s.file, s.organismYearsField) + ' organism-years in '
      + ctx.t(s.file, s.wallField, s.wallUnit === 'ms' ? 'pts' : 'raw') + (s.wallUnit === 'ms' ? ' ms' : ' s') + ', ' + ctx.file(s.file) + ')'
      + ' <span class="dim">' + ctx.t(RATE, 'sources.' + i + '.arithmetic') + '</span>';
  });
  return head + '<p class="rate" id="organism-years-per-wall-hour">organism-years per wall hour: ' + parts.join('; ') + '</p>'
    + '<p class="dim">Read at build time from ' + (rec ? ctx.file(RATE) : 'bench/verdicts/spread-rate.json') + ', and shown only where it equals the arithmetic over the source verdict on disk now.</p></section>';
}

// ------------------------------------------------------------------ the board's own rows

function p15Card(ctx, ladder) {
  const b = ladder && ladder.board;
  if (!b) return '<section class="card" id="p15"><div class="head"><h2>The end-state rows</h2>' + pill('none', 'not measured') + '</div><p>' + NM
    + ': ' + (ladder ? 'ladder.json holds no board' : 'no ladder.json is on disk') + '.</p></section>';
  const r = [];
  const s = b.substrate;
  if (s) {
    const br = s.browser;
    r.push('<tr><td>substrate</td><td>' + (s.measured ? ctx.t(LADDER, 'board.substrate.measured') : '<span class="nm">no verdict file holds the browser organism\'s nanoseconds</span>')
      + (br ? '<div>browser organism: ' + or(ctx.t(LADDER, 'board.substrate.browser.nsPerCellRun'), 'not recorded') + ' ns per cell run, ' + or(ctx.t(LADDER, 'board.substrate.browser.nsPerHop'), 'not recorded')
        + ' ns per packet hop <span class="dim">(' + or(ctx.t(LADDER, 'board.substrate.browser.kind'), '') + ', ' + or(ctx.t(LADDER, 'board.substrate.browser.file'), '') + ' line ' + or(ctx.t(LADDER, 'board.substrate.browser.line'), 'not recorded') + ')</span></div>' : '')
      + (s.node ? '<div>Node organism: ' + or(ctx.t(LADDER, 'board.substrate.node.nsPerCellRunBest'), 'not recorded') + ' ns per cell run at best <span class="dim">(' + or(ctx.t(LADDER, 'board.substrate.node.file'), '') + ')</span></div>' : '')
      + '</td></tr>');
  }
  if (b.instances) r.push('<tr><td>instances alive</td><td>' + or(ctx.t(LADDER, 'board.instances.alive')) + ' ' + (b.instances.partial ? pill('partial', 'partial') : '')
    + ' <span class="dim">from ' + or(ctx.t(LADDER, 'board.instances.source'), 'no source') + '</span></td></tr>');
  if (b.authored) r.push('<tr><td>authored share</td><td>' + or(ctx.t(LADDER, 'board.authored.numerator')) + ' of ' + or(ctx.t(LADDER, 'board.authored.denominator'))
    + ' = ' + or(ctx.t(LADDER, 'board.authored.share', 'pct')) + '% <span class="dim">landed changes the organism authored, from ' + or(ctx.t(LADDER, 'board.authored.source'), '') + '</span></td></tr>');
  if (b.bytesPerPoint) r.push('<tr><td>bytes per score point</td><td>' + or(ctx.t(LADDER, 'board.bytesPerPoint.bar.bytesPerScorePoint')) + ' at the bar <span class="dim">('
    + or(ctx.t(LADDER, 'board.bytesPerPoint.bar.source'), '') + ')</span>' + (b.bytesPerPoint.last ? '<div>' + or(ctx.t(LADDER, 'board.bytesPerPoint.last.bytesPerScorePoint')) + ' at the last checkpoint header <span class="dim">('
    + or(ctx.t(LADDER, 'board.bytesPerPoint.last.where'), '') + ')</span></div>' : '') + '</td></tr>');
  if (b.improvement) r.push('<tr><td>improvement per wall second</td><td>' + or(ctx.t(LADDER, 'board.improvement.percentPerSecond')) + ' percent of the suite per second, over '
    + or(ctx.t(LADDER, 'board.improvement.seconds'), 'unrecorded') + ' s and ' + or(ctx.t(LADDER, 'board.improvement.ticks'), 'unrecorded') + ' ticks <span class="dim">('
    + or(ctx.t(LADDER, 'board.improvement.source'), '') + ')</span>' + (b.hisRate ? '<div>his words: ' + or(ctx.t(LADDER, 'board.hisRate.words'), '') + '</div>' : '') + '</td></tr>');
  const tot = b.totals;
  if (tot) {
    const cl = (k) => (tot.classes && tot.classes[k] ? or(ctx.t(LADDER, 'board.totals.classes.' + k + '.records'), 'not recorded') + ' ' + CLASS_WORDS[k][0] + ' (' + or(ctx.t(LADDER, 'board.totals.classes.' + k + '.share', 'pct'), 'not recorded')
      + '%, ' + (isNum(tot.classes[k].latency) ? ctx.t(LADDER, 'board.totals.classes.' + k + '.latency') + ' ' + ctx.t(LADDER, 'board.totals.classes.' + k + '.unit') : 'time not measured') + ')' : '');
    r.push('<tr><td>across the sets</td><td>organism ' + or(ctx.t(LADDER, 'board.totals.correct')) + ' of ' + or(ctx.t(LADDER, 'board.totals.n')) + ' on the primaries; '
      + ['model', 'native', 'direct'].map(cl).filter(Boolean).join(', ') + '<div class="dim">' + or(ctx.t(LADDER, 'board.totals.how'), '') + '</div></td></tr>');
  }
  return '<section class="card" id="p15"><div class="head"><h2>The end-state rows</h2></div><p class="lede">What the ladder board prints after the three sets: the substrate the answers run on, the instances alive, the share of changes the organism wrote itself, bytes per score point, and improvement per wall second beside his words. Read from '
    + ctx.file(LADDER) + '.</p><div class="scroll"><table class="p15">' + r.join('') + '</table></div></section>';
}

function dailyCard(ctx, ladder) {
  if (!ladder || !Array.isArray(ladder.days) || !ladder.days.length) {
    return '<section class="card" id="daily"><div class="head"><h2>The daily ruler</h2>' + pill('none', 'not measured') + '</div><p>' + NM + ': the ladder series has no day on disk.</p></section>';
  }
  const cols = ['answer', 'code', 'capability', 'health'];
  const rows = ladder.days.map((d, i) => '<tr><td>' + or(ctx.t(LADDER, 'days.' + i + '.date'), 'undated') + '</td><td class="n">' + or(ctx.t(LADDER, 'days.' + i + '.tier'), 'not recorded') + '</td>'
    + cols.map((c) => '<td class="n">' + or(ctx.t(LADDER, 'days.' + i + '.columns.' + c + '.score')) + '</td>').join('')
    + '<td class="n big">' + or(ctx.t(LADDER, 'days.' + i + '.composite')) + '</td></tr>').join('');
  return '<section class="card" id="daily"><div class="head"><h2>The daily ruler</h2></div><p class="lede">Four columns on a seed that is the date, so no day\'s items can be memorised; the composite is their mean. His target is a rise of five to ten percent a day.</p>'
    + '<div class="scroll"><table class="daily"><tr><th>date</th><th class="n">tier</th>' + cols.map((c) => '<th class="n">' + c + '</th>').join('') + '<th class="n">composite</th></tr>' + rows + '</table></div>'
    + (ladder.line ? '<p class="line">' + ctx.t(LADDER, 'line') + '</p>' : '') + '</section>';
}

// ------------------------------------------------------------------ the page

/**
 * Build the page. Returns the html and what it traced; writes it when write is true.
 * @param {{verdictsDir?: string, template?: string, outDir?: string, write?: boolean}} [o]
 */
export function generateLadder({ verdictsDir = VERDICTS, template = TEMPLATE, outDir = OUT_DIR, write = true } = {}) {
  const ctx = new Ctx(verdictsDir);
  let names = [];
  try { names = readdirSync(verdictsDir).filter((n) => n.endsWith('.json')).sort(); } catch { names = []; }
  const ladder = names.includes(LADDER) ? ctx.json(LADDER) : null;

  const cards = SETS.map((set) => setCard(ctx, set, names.filter(set.match), ladder));
  const native = verdictCard(ctx, names, 'native', 'Native and direct',
    'His microseconds and nanoseconds: questions answered through ask() with no model call, provenance memory or direct, and the direct-hit table\'s one lookup timed in nanoseconds. The page reads the fields by name and shows which field it read.', NATIVE_HEADS);
  const years = verdictCard(ctx, names, 'years', 'Organism-years',
    'His "billions of years in a bunch of seconds": generations of a whole population on a plane, counted as organism-years, with the arithmetic that makes the count, printed beside it.', YEARS_HEADS, yearsRuns);

  const body = '<section class="sets">' + cards.map((c) => c.html).join('') + '</section>' + native.html + years.html + rateLine(ctx, names) + p15Card(ctx, ladder) + dailyCard(ctx, ladder)
    + (ladder && ladder.statement ? '<section class="card" id="statement"><div class="head"><h2>The board\'s own statement</h2></div><p class="statement">' + ctx.t(LADDER, 'statement') + '</p><p class="dim">From '
      + ctx.file(LADDER) + ', printed by <code>' + or(ctx.t(LADDER, 'command'), 'an unrecorded command') + '</code>.</p></section>' : '');

  const fill = (s, key, value) => { if (!s.includes(key)) throw new Error('ladder: the template has no ' + key); return s.replace(key, () => value); };
  let page = readFileSync(template, 'utf8');
  page = fill(page, '{{BODY}}', body);
  page = fill(page, '{{GENERATED}}', esc(new Date().toISOString()));
  if (page.includes('{{')) throw new Error('ladder: a template placeholder was left unfilled');
  if (page.includes(EM)) throw new Error('ladder: an em dash reached the page');
  const check = traceCheck(page, (file) => ctx.json(file.slice(LABEL_DIR.length + 1)), (file) => names.includes(file.slice(LABEL_DIR.length + 1)));
  if (check.bad.length) throw new Error('ladder: ' + check.bad.length + ' untraced or mismatched numbers, first: ' + check.bad[0]);

  const bytes = Buffer.byteLength(page);
  if (write) {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, 'index.html'), page);
  }
  return {
    html: page, bytes, path: path.join(outDir, 'index.html'),
    spans: ctx.spans, numbers: check.numbers, files: ctx.read.size,
    sets: cards.map((c) => ({ key: c.key, status: c.status, primary: c.primary || null, consistent: c.consistent || false })),
    native: { status: native.status, primary: native.primary || null }, years: { status: years.status, primary: years.primary || null },
  };
}

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');

/**
 * The build's own guard: every digit in the page text sits in a traced span whose text is its
 * field under its format. (test/web-ladder.test.mjs walks the page again with a walker of its own.)
 */
export function traceCheck(html, jsonOf, exists) {
  const bad = [];
  let numbers = 0;
  const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<head>[\s\S]*?<\/head>/, '');
  const rest = body.replace(/<span class="t[^"]*" (data-src|data-file)="([^"]*)"(?: data-fmt="([^"]*)")?[^>]*>([^<]*)<\/span>/g, (m, kind, attr, fmt, inner) => {
    const text = decode(inner);
    numbers += (text.match(/\d+(?:\.\d+)?/g) || []).length;
    const ref = decode(attr);
    if (kind === 'data-file') { if (text !== ref || !exists(ref)) bad.push('file ' + ref); return ' '; }
    const i = ref.indexOf(':');
    const file = ref.slice(0, i), p = ref.slice(i + 1);
    const v = resolve(jsonOf(file), p);
    const want = fmt === 'path' ? (v === undefined ? null : p) : (v === undefined || v === null || !FORMATS[fmt] ? null : FORMATS[fmt](v));
    if (want !== text) bad.push(ref + ' shows ' + JSON.stringify(text) + ' but the field gives ' + JSON.stringify(want));
    return ' ';
  });
  const loose = decode(rest.replace(/<[^>]*>/g, ' ')).match(/\S*\d\S*/g) || [];
  for (const w of loose) bad.push('untraced ' + JSON.stringify(w));
  return { bad, numbers };
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const r = generateLadder();
  console.log('dist ladder/index.html ' + r.bytes + ' bytes, ' + r.numbers + ' numbers traced in ' + r.spans + ' spans from ' + r.files + ' verdict files');
  for (const s of r.sets) console.log('  ' + s.key.padEnd(10) + s.status + (s.primary ? ' from ' + s.primary : '') + (s.primary ? (s.consistent ? ', ladder board current' : ', ladder board read another file') : ''));
  console.log('  native    ' + r.native.status + (r.native.primary ? ' from ' + r.native.primary : ''));
  console.log('  years     ' + r.years.status + (r.years.primary ? ' from ' + r.years.primary : ''));
}
