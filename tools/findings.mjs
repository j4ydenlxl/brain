// tools/findings.mjs: the findings page. Generates web/dist/findings/index.html from the
// template web/src/findings.html by reading, at generation time, bench/verdicts/*.json,
// docs/NUMBERS.md, docs/PORTFOLIO.md, notes/*.md and the soak state directory.
//
// THE RULE THIS FILE ENFORCES. A number that no command printed does not exist, so this
// generator may not emit one. That is an assertion here, not a comment: every value on the
// page is emitted through val() or quote(), which record where the value was read, and
// trace() then re-parses the finished page and throws if a single digit on it does not
// resolve back to a field of a verdict, to the soak state, to a count this run printed, or
// to a verbatim quotation of the file named on the quoting element. Free prose in the
// template carries no digits at all, and trace() fails if a builder ever puts one there.
//
// The generator never opens state/soak/control.json: that file holds a token, and nothing
// here reads a credential value. It reads state/soak/meta.json and file sizes only.
//
// Run: node tools/findings.mjs   (web/build.mjs runs it on every build)
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERDICTS = path.join(ROOT, 'bench', 'verdicts');
const OUT_DIR = path.join(ROOT, 'web', 'dist', 'findings');
const TEMPLATE = path.join(ROOT, 'web', 'src', 'findings.html');

const MAX_NUMBERS_PER_CARD = 10;
const MAX_NOTE_CHARS = 320;

// ---------------------------------------------------------------- reading verdicts

/** Walk a verdict and return [path, value] pairs for numbers and short verdict strings. */
export function leaves(obj, prefix = '', out = [], depth = 0) {
  if (depth > 4 || out.length > 400) return out;
  if (Array.isArray(obj)) {
    if (obj.length > 6) { out.push([prefix + '.length', obj.length]); return out; }
    obj.forEach((v, i) => leaves(v, prefix + '[' + i + ']', out, depth + 1));
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) {
      // answer.json holds the keys "null.directBefore" and "null.regionBefore" (2026-09-18): a dot
      // inside a key. Joined bare, the path read null then directBefore and resolved to nothing,
      // so the key travels as a quoted segment ["null.directBefore"] that at() reads back whole.
      const seg = /[.[\]"]/.test(k) ? '["' + k.replace(/["\\]/g, '\\$&') + '"]' : k;
      leaves(v, !prefix ? seg : seg.startsWith('[') ? prefix + seg : prefix + '.' + seg, out, depth + 1);
    }
    return out;
  }
  if (typeof obj === 'number' && Number.isFinite(obj)) out.push([prefix, obj]);
  else if (typeof obj === 'string' && /^(GREEN|RED|PASS|FAIL)$/.test(obj)) out.push([prefix, obj]);
  return out;
}

/**
 * Resolve a path against a parsed verdict: dotted names, [i] indices, and ["quoted"] segments
 * for a key that itself contains a dot or a bracket (leaves() writes them). Anything the four
 * token shapes do not cover resolves to undefined rather than to a neighbour.
 */
export function at(obj, p) {
  let cur = obj;
  const token = /\["((?:[^"\\]|\\.)*)"\]|\[(\d+)\]|([^.[\]]+)|(\.)/g;
  let m, last = 0;
  while ((m = token.exec(p))) {
    if (m.index !== last) return undefined;
    last = token.lastIndex;
    if (m[4] !== undefined) continue;
    if (cur == null || typeof cur !== 'object') return undefined;
    if (m[1] !== undefined) cur = cur[m[1].replace(/\\(.)/g, '$1')];
    else if (m[2] !== undefined) { if (!Array.isArray(cur)) return undefined; cur = cur[Number(m[2])]; }
    else cur = cur[m[3]];
  }
  return last === p.length ? cur : undefined;
}

export function readVerdicts() {
  const out = [], skipped = [];
  for (const file of readdirSync(VERDICTS).filter(n => n.endsWith('.json')).sort()) {
    const name = file.replace(/\.json$/, '');
    let json;
    try { json = JSON.parse(readFileSync(path.join(VERDICTS, file), 'utf8')); } catch { skipped.push(name); continue; }
    if (!json || typeof json !== 'object' || Array.isArray(json)) { skipped.push(name); continue; }
    // A narrow run of a bench (a smoke, a subset, one arm) writes beside the bar and marks itself
    // isTheBar false; that file is the bench keeping its own scratch, not a finding, so the page
    // counts it as skipped and shows it nowhere.
    if (json.isTheBar === false) { skipped.push(name); continue; }
    out.push({ name, file, json });
  }
  return { verdicts: out, skipped };
}

// ---------------------------------------------------------------- the printing command

const SEARCH_DIRS = ['bench', 'tools', 'lab', 'bin', 'test', 'daemon', 'self', 'runtime', 'core', 'act'];

function sourceFiles() {
  const files = [];
  for (const d of SEARCH_DIRS) {
    const dir = path.join(ROOT, d);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      const p = path.join(dir, f);
      if (!/\.mjs$/.test(f) || !statSync(p).isFile()) continue;
      files.push([d + '/' + f, readFileSync(p, 'utf8')]);
    }
  }
  return files;
}

/**
 * Which command writes this verdict. Derived, never invented: either the verdict says so
 * in a command field, or the verdict names the test file that produced it, or exactly one
 * source file in the tree contains the verdict's own file name as a literal. When none of
 * those holds the card says the command is not recorded rather than guessing at one.
 */
export function commandFor(v, files) {
  if (typeof v.json.command === 'string' && v.json.command.trim()) {
    return { text: v.json.command.trim(), kind: 'field', src: v.name + ':command' };
  }
  const hits = files.filter(([, s]) => s.includes("'" + v.file + "'") || s.includes('"' + v.file + '"') || s.includes('verdicts/' + v.file));
  const rank = (f) => (f.startsWith('bench/') ? 0 : f.startsWith('lab/') ? 1 : f.startsWith('tools/') ? 2 : f.startsWith('test/') ? 3 : 4);
  hits.sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
  if (hits.length) {
    const f = hits[0][0];
    return f.startsWith('test/')
      ? { text: 'node --test ' + f, kind: 'file', src: f }
      : { text: 'node ' + f, kind: 'file', src: f };
  }
  const testFile = at(v.json, 'tests.file') || (Array.isArray(v.json.files) ? v.json.files.find(f => typeof f === 'string' && f.startsWith('test/')) : null);
  if (typeof testFile === 'string' && existsSync(path.join(ROOT, testFile))) {
    return { text: 'node --test ' + testFile, kind: 'file', src: testFile };
  }
  return null;
}

// ---------------------------------------------------------------- notes

function readNotes() {
  const dir = path.join(ROOT, 'notes');
  return readdirSync(dir).filter(f => f.endsWith('.md')).sort()
    .map(f => ({ rel: 'notes/' + f, text: readFileSync(path.join(dir, f), 'utf8') }));
}

const ISO = /\d{4}-\d{2}-\d{2}T[\d:.]+Z?/g;
// A command line, a table row, a bullet or a fenced block is not a write-up. A card that
// quotes one reads as a dump of the note rather than as a finding.
const NOT_PROSE = /^(node |npm |\$ |```|\||[-*#]\s|\d+\.\s)/;

/**
 * The distinctive values this verdict carries, as strings a writer would have typed. Small
 * integers are left out on purpose: nearly every verdict holds a 0 and a 1, so matching on
 * them would make "this paragraph quotes the measurement" true of any paragraph at all.
 */
export function verdictValues(json) {
  const out = new Set();
  for (const [, v] of leaves(json || {})) {
    if (typeof v !== 'number' || (Number.isInteger(v) && Math.abs(v) < 10)) continue;
    out.add(fmt(v));
    out.add(String(v));
  }
  return out;
}

/**
 * The paragraph in a note where this verdict is written up: of the prose paragraphs naming
 * the verdict file or the verdict itself, the one quoting the most of that verdict's own
 * distinctive values, because that is what reading the measurement means. A paragraph that
 * quotes none of them is not about this measurement, so the card then carries no note at
 * all rather than an unrelated sentence.
 *
 * The rule this replaced was most digits wins, and an ISO timestamp beat prose with it: 6
 * of 40 cards showed a provenance line ("written at 2026-09-17T21:28:08.424Z by the script
 * that ran each of these") whose only numbers were the clock. Ties go to the paragraph that
 * names the verdict file, then to the longer one.
 */
export function noteFor(v, notes) {
  const vals = verdictValues(v.json);
  const nameRe = new RegExp('(^|[^A-Za-z0-9-])' + v.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Za-z0-9-]|$)');
  let best = null;
  for (const n of notes) {
    for (const para of n.text.split(/\n{2,}/)) {
      const p = para.trim();
      if (!p || p.includes(' | ')) continue;
      if (!p.includes(v.file) && !nameRe.test(p)) continue;
      const clean = p.replace(/^#+\s*/, '').replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
      // the prose test runs on the stripped text, or a command inside backticks slips past
      if (!clean || NOT_PROSE.test(clean)) continue;
      const seen = new Set();
      let hit = 0, firstEnd = 0;
      for (const m of clean.replace(ISO, ' ').matchAll(/\d[\d.,]*\d/g)) {
        const tok = m[0];
        if (seen.has(tok) || !(vals.has(tok) || vals.has(tok.replace(/,/g, '')))) continue;
        seen.add(tok);
        hit++;
        if (!firstEnd) firstEnd = m.index + tok.length;
      }
      if (hit === 0) continue;
      const named = p.includes(v.file) ? 1 : 0;
      const wins = !best || hit > best.hit
        || (hit === best.hit && named > best.named)
        || (hit === best.hit && named === best.named && clean.length > best.clean.length);
      if (wins) best = { rel: n.rel, clean, hit, named, firstEnd };
    }
  }
  if (!best) return null;
  // the cut reaches past the first value the paragraph was chosen for, so a card never
  // shows the half of a sentence that carries no measurement
  const limit = Math.min(Math.max(MAX_NOTE_CHARS, best.firstEnd), MAX_NOTE_CHARS * 2);
  let text = best.clean;
  if (text.length > limit) {
    let sp = text.slice(0, limit).lastIndexOf(' ');
    // never cut inside the value the paragraph was chosen for, and never mid word
    if (sp <= best.firstEnd) {
      const next = text.indexOf(' ', best.firstEnd);
      sp = next === -1 ? text.length : next;
    }
    text = text.slice(0, sp).trim();
  }
  return { rel: best.rel, text, cut: text.length < best.clean.length, hit: best.hit };
}

// ---------------------------------------------------------------- null and negative results

const NEGATIVE_KEY = /(net|gain|delta|return|speedup|pct|Pct|improve|margin|advantage)/;

/**
 * Is this a null, a retraction or a negative result. The rule is stated on the page and
 * applied here only to values read out of the verdict: a RED or FAIL verdict string, a
 * refuted or failed count above zero, a negative value on a key that means a gain, or a
 * verdict whose own prose says it was refuted, retracted, or did not clear its bar.
 */
export function isNull(v) {
  const why = [];
  for (const [p, val] of leaves(v.json)) {
    if (val === 'RED' || val === 'FAIL') why.push(p);
    else if (typeof val === 'number' && val > 0 && /(^|\.)(refuted|failures|fail|failed|missing|unprotected|illegal|faults)$/.test(p)) why.push(p);
    else if (typeof val === 'number' && val < 0 && NEGATIVE_KEY.test(p)) why.push(p);
  }
  // Prose counts only where the verdict speaks in its own voice: a field named verdict,
  // what, note, conclusion, summary, finding or result. The same word elsewhere in a big
  // record is usually a quotation of something else and is not a claim about this run.
  const voice = /(^|\.)(verdict|what|note|conclusion|summary|finding|result)$/i;
  const said = /(refuted|retracted|retraction|does not clear|did not clear|no effect|null result|not purchasable)/i;
  (function walk(obj, prefix, depth) {
    if (depth > 4 || obj == null) return;
    if (typeof obj === 'string') { if (voice.test(prefix) && said.test(obj)) why.push(prefix); return; }
    if (typeof obj !== 'object') return;
    for (const [k, value] of Object.entries(obj)) walk(value, prefix ? prefix + '.' + k : k, depth + 1);
  })(v.json, '', 0);
  return why.length ? why : null;
}

// ---------------------------------------------------------------- emitting values

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** How a value is rendered. The test applies the same rule in reverse. */
export function fmt(value) {
  if (typeof value === 'string') return value;
  if (Number.isInteger(value)) return Math.abs(value) >= 10000 ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',') : String(value);
  const short = Number(value.toPrecision(6));
  return String(short);
}

/** A value, carrying where it was read from. Nothing else may put a digit on the page. */
function val(src, p, value) {
  return '<span class="v" data-src="' + esc(src + ':' + p) + '">' + esc(fmt(value)) + '</span>';
}

/** A measure name. It carries digits when the path indexes an array, so it is traced too. */
function key(src, p) {
  return '<span class="k" data-path="' + esc(src + ':' + p) + '">' + esc(p) + '</span>';
}

function numRow(src, p, value) {
  return '<div class="row">' + key(src, p) + val(src, p, value) + '</div>';
}

/** Verbatim text from a file, marked with the file it must be found in. */
function quote(tag, rel, text) {
  return '<' + tag + ' data-quoted="' + esc(rel) + '">' + esc(text) + '</' + tag + '>';
}

// ---------------------------------------------------------------- the cards

// majors, lines, planes, years, organisms, generations and descriptors are the words the scale and
// planes verdicts headline with; without them a ten row card shows a size's edge count and cuts
// its line count.
// Matched without regard to case: the planes verdict spells them simulatedYears and
// distinctDescriptors, and a case sensitive match left the years off the card. The timing
// suffix stays case sensitive on purpose: a row's buildMs and emitMs are not its headline, and
// matched loosely they took the slots of its line and byte counts.
const HEADLINE = /(pass|fail|total|verdict|speedup|ratio|cells|edges|ticks|ticksPerSec|net|gain|Pct|kills|killed|bytes|rounds|confirmed|refuted|applied|count|majors|lines|planes|years|organisms|generations|descriptors)/i;
const TIMING = /(ms|us)$/;

// what machine it ran on is not a finding, so it sorts last rather than taking a row a
// measurement wanted
const ENV = /^(cpus|platform|host|port|pid|arch|threads)$/;

function cardNumbers(v) {
  const all = leaves(v.json).filter(([p]) => p !== 'node' && !/^at$/.test(p));
  // A row array (the scale bench's sizes, a sweep's rounds) is written in the order the bench
  // walked it, so its last row is the one it reached; that row takes a card slot before the
  // earlier rows do, otherwise a ten row card shows the smallest size and cuts the largest.
  const ROW = /([^.[\]]+)\[(\d+)\]/g;
  const lastIndex = new Map();
  for (const [p] of all) for (const m of p.matchAll(ROW)) lastIndex.set(m[1], Math.max(lastIndex.get(m[1]) ?? 0, Number(m[2])));
  const row = p => { let r = 0; for (const m of p.matchAll(ROW)) if (Number(m[2]) !== lastIndex.get(m[1])) r = 1; return r; };
  const scored = all.map(([p, value], i) => ({ p, value, i, depth: p.split('.').length, head: ENV.test(p) ? 2 : HEADLINE.test(p) || TIMING.test(p) ? 0 : 1, row: row(p) }));
  scored.sort((a, b) => a.head - b.head || a.row - b.row || a.depth - b.depth || a.i - b.i);
  return scored.slice(0, MAX_NUMBERS_PER_CARD).sort((a, b) => a.i - b.i);
}

/**
 * A verdict may carry its own sentence (answer.json: "organism won: 43/49 ..."); that sentence is
 * the bench's report of itself and goes on the card verbatim, quoted from the verdict file. It is
 * shown only when the file holds it letter for letter (no JSON escapes), because the page's own
 * check reads the quote back out of the named file.
 */
function statementOf(v) {
  const t = v.json.statement;
  if (typeof t !== 'string' || !t.trim() || t.length > 600) return null;
  return JSON.stringify(t).slice(1, -1) === t ? t : null;
}

function card(v, cmd, note, nullWhy) {
  const rows = cardNumbers(v).map(n => numRow(v.name, n.p, n.value)).join('\n      ');
  const stmt = statementOf(v);
  const stmtLine = stmt ? '<p class="note"><span class="tag">its own sentence</span>' + quote('q', 'bench/verdicts/' + v.file, stmt) + '</p>' : '';
  const when = typeof v.json.at === 'string' ? '<span class="at" data-src="' + esc(v.name + ':at') + '">' + esc(v.json.at) + '</span>' : '<span class="at dim">undated</span>';
  const cmdLine = cmd
    ? '<p class="cmd">printed by <code data-cmd="' + esc(cmd.kind + '|' + cmd.src) + '">' + esc(cmd.text) + '</code></p>'
    : '<p class="cmd">the command that writes this verdict is not recorded in the tree</p>';
  const noteLine = note
    ? '<p class="note"><span class="tag">' + esc(note.rel) + '</span>' + quote('q', note.rel, note.text) + (note.cut ? ' <span class="dim">...</span>' : '') + '</p>'
    : '';
  const whyLine = nullWhy
    ? '<p class="note"><span class="tag">null or negative</span>'
      + nullWhy.slice(0, 4).map(p => (p === 'prose' ? '<span class="k">said so in its own words</span>' : key(v.name, p))).join(' ') + '</p>'
    : '';
  return '  <article class="card' + (nullWhy ? ' null' : '') + '" id="v-' + esc(v.name) + '">\n'
    + '    <div class="head"><h3 data-name="' + esc(v.file) + '">' + esc(v.name) + '</h3>' + when + '</div>\n'
    + '    ' + cmdLine + '\n'
    + '    <div class="rule"></div>\n'
    + '    <div class="nums">\n      ' + rows + '\n    </div>\n'
    + '    ' + stmtLine + whyLine + noteLine + '\n'
    + '  </article>';
}

// ---------------------------------------------------------------- the intro

const INTRO_PARAS = 2;

/**
 * What the brain is, in its own document's words: the opening paragraphs of
 * docs/PORTFOLIO.md, verbatim. Not literally the first ones. That file opens with a
 * provenance note about itself ("Written ... in the form he asked for"), which names
 * internal files and an unexplained "he" and says nothing about the brain, so the intro
 * starts at the first paragraph that states the subject. The subject is read off the H1
 * rather than hardcoded, so this keeps working if the document is reordered, and it throws
 * rather than falling back to the preamble if no such paragraph exists.
 */
function intro() {
  const rel = 'docs/PORTFOLIO.md';
  const text = readFileSync(path.join(ROOT, rel), 'utf8');
  const h1 = /^#\s+([A-Za-z]+)/m.exec(text);
  const paras = text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean).filter(p => !p.startsWith('#'));
  const start = h1 ? paras.findIndex(p => p.startsWith(h1[1] + ' ')) : 0;
  if (start < 0) throw new Error('findings: no paragraph in ' + rel + ' says what ' + h1[1] + ' is');
  const take = paras.slice(start, start + INTRO_PARAS);
  if (!take.length) throw new Error('findings: ' + rel + ' has no intro paragraph');
  return take.map(p => quote('p', rel, p)).join('\n');
}

// ---------------------------------------------------------------- the soak

function soak() {
  const dir = path.join(ROOT, 'state', 'soak');
  const metaPath = path.join(dir, 'meta.json');
  if (!existsSync(metaPath)) return '<div class="soak"><p class="dim">no soak state on this machine</p></div>';
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  const snapPath = path.join(dir, 'snapshot.json');
  const snapBytes = existsSync(snapPath) ? statSync(snapPath).size : 0;
  const kept = existsSync(path.join(dir, 'snapshots')) ? readdirSync(path.join(dir, 'snapshots')).length : 0;
  const ledger = existsSync(path.join(dir, 'ledger')) ? readdirSync(path.join(dir, 'ledger')).length : 0;
  const src = 'soak';
  const rows = [
    ['ticks', meta.t], ['cells', meta.cells], ['edges', meta.edges], ['live edges', meta.liveEdges],
    ['checkpoint bytes', snapBytes], ['checkpoints kept', kept], ['ledger files', ledger],
  ].filter(([, value]) => typeof value === 'number')
    .map(([k, value]) => '<div class="row"><span class="k">' + esc(k) + '</span>'
      + '<span class="v" data-src="' + esc(src + ':' + k.replace(/ /g, '_')) + '">' + esc(fmt(value)) + '</span></div>');
  const savedAt = typeof meta.savedAt === 'string'
    ? '<div class="row"><span class="k">last checkpoint</span><span class="v" data-src="soak:savedAt">' + esc(meta.savedAt) + '</span></div>' : '';
  return '<div class="soak">\n  <div class="nums">\n    ' + rows.join('\n    ') + '\n    ' + savedAt + '\n  </div>\n</div>';
}

/** The values the soak section is allowed to print, so trace() can resolve them. */
export function soakSources() {
  const dir = path.join(ROOT, 'state', 'soak');
  const metaPath = path.join(dir, 'meta.json');
  if (!existsSync(metaPath)) return {};
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  const snapPath = path.join(dir, 'snapshot.json');
  return {
    ticks: meta.t, cells: meta.cells, edges: meta.edges, live_edges: meta.liveEdges, savedAt: meta.savedAt,
    checkpoint_bytes: existsSync(snapPath) ? statSync(snapPath).size : 0,
    checkpoints_kept: existsSync(path.join(dir, 'snapshots')) ? readdirSync(path.join(dir, 'snapshots')).length : 0,
    ledger_files: existsSync(path.join(dir, 'ledger')) ? readdirSync(path.join(dir, 'ledger')).length : 0,
  };
}

// ---------------------------------------------------------------- the numbers index

/**
 * docs/NUMBERS.md is the generated index of every measure a document may quote. This page
 * does not take values from it (a stale index would then set the page); it reads it to say
 * how many of the measures shown here are carried in it, which is the honest relation
 * between the two files. The comparison is on bench and measure, never on the value.
 */
function indexedCount(verdicts) {
  const file = path.join(ROOT, 'docs', 'NUMBERS.md');
  if (!existsSync(file)) return { hit: 0, rows: 0 };
  const index = new Set();
  let rows = 0;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/.exec(line);
    if (!m || m[1] === 'bench' || /^-+$/.test(m[1])) continue;
    rows++;
    index.add(m[1] + '|' + m[2]);
  }
  let hit = 0;
  for (const v of verdicts) for (const n of cardNumbers(v)) if (index.has(v.name + '|' + n.p)) hit++;
  return { hit, rows };
}

// ---------------------------------------------------------------- the tracer

const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&middot;/g, '.').replace(/&amp;/g, '&');
const norm = (s) => s.replace(/\s+/g, ' ').trim();
// Quoted text is compared with markdown emphasis markers removed on both sides: a note
// writes a file name in backticks and the page shows it without them, and that is the only
// difference the page is allowed to introduce into a quotation.
// strip the marks first, then collapse whitespace: noteFor cleans a paragraph in that order, and a
// fenced block (three backticks on a line of their own) collapsed first leaves a double space the
// quote never had (2026-09-28: two cards quoting notes/self-queries.md past its fence failed the trace)
export const qnorm = (s) => norm(s.replace(/[`*_]/g, ''));

/**
 * Re-parse the finished page and resolve every digit on it. Throws on the first value that
 * does not come back to its source. sources: {verdicts: Map name -> json, soak, gen, files}
 */
export function trace(html, sources) {
  const problems = [];
  let body = html.replace(/<head[\s\S]*?<\/head>/i, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ');

  body = body.replace(/<([a-z]+)[^>]*?data-quoted="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g, (m, tag, rel, inner) => {
    rel = decode(rel);
    const text = norm(decode(inner.replace(/<[^>]*>/g, '')));
    const file = sources.files.get(rel) ?? (existsSync(path.join(ROOT, rel)) ? readFileSync(path.join(ROOT, rel), 'utf8') : null);
    if (file == null) problems.push('quoted from a file that does not exist: ' + rel);
    else {
      sources.files.set(rel, file);
      if (!qnorm(file).includes(qnorm(text))) problems.push('quoted text is not verbatim in ' + rel + ': ' + text.slice(0, 70));
    }
    return ' ';
  });

  body = body.replace(/<([a-z]+)[^>]*?data-src="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g, (m, tag, src, inner) => {
    const text = norm(decode(inner.replace(/<[^>]*>/g, '')));
    // the attribute is HTML encoded (a quoted path segment carries &quot;): decode before resolving
    src = decode(src);
    const i = src.indexOf(':');
    const owner = src.slice(0, i), p = src.slice(i + 1);
    let value;
    // 'soak' names two things: the state/soak directory (keys in soakSources) and, since Board 15,
    // the verdict bench/verdicts/soak.json. The state source answers only for keys it holds.
    if (owner === 'soak' && Object.hasOwn(sources.soak, p)) value = sources.soak[p];
    else if (owner === 'gen') value = sources.gen[p];
    else if (sources.verdicts.has(owner)) value = at(sources.verdicts.get(owner), p);
    else if (owner === 'soak') value = undefined;
    else { problems.push('no source named ' + owner); return ' '; }
    if (value === undefined) problems.push('nothing at ' + src);
    else if (fmt(value) !== text) problems.push(src + ' reads ' + text + ' on the page but ' + fmt(value) + ' at its source');
    return ' ';
  });

  body = body.replace(/<([a-z]+)[^>]*?data-cmd="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g, (m, tag, cmd, inner) => {
    cmd = decode(cmd);
    const text = norm(decode(inner.replace(/<[^>]*>/g, '')));
    const bar = cmd.indexOf('|');
    const kind = cmd.slice(0, bar), ref = cmd.slice(bar + 1);
    if (kind === 'file') {
      if (!existsSync(path.join(ROOT, ref))) problems.push('command names a file that does not exist: ' + ref);
      if (!text.endsWith(ref)) problems.push('command ' + text + ' does not name ' + ref);
    } else if (kind === 'field') {
      const j = ref.indexOf(':');
      const value = sources.verdicts.has(ref.slice(0, j)) ? at(sources.verdicts.get(ref.slice(0, j)), ref.slice(j + 1)) : undefined;
      if (norm(String(value)) !== text) problems.push('command does not match its field ' + ref);
    } else problems.push('unknown command kind ' + kind);
    return ' ';
  });

  body = body.replace(/<([a-z]+)[^>]*?data-path="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g, (m, tag, src, inner) => {
    const text = norm(decode(inner.replace(/<[^>]*>/g, '')));
    // the attribute is HTML encoded (a quoted path segment carries &quot;): decode before resolving
    src = decode(src);
    const i = src.indexOf(':');
    const owner = src.slice(0, i), p = src.slice(i + 1);
    if (!sources.verdicts.has(owner)) problems.push('a measure name belongs to no verdict: ' + src);
    else if (at(sources.verdicts.get(owner), p) === undefined) problems.push('a measure name resolves to nothing: ' + src);
    else if (text !== p) problems.push('a measure name reads ' + text + ' but claims to be ' + p);
    return ' ';
  });

  body = body.replace(/<([a-z0-9]+)[^>]*?data-name="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g, (m, tag, file, inner) => {
    file = decode(file);
    const text = norm(decode(inner.replace(/<[^>]*>/g, '')));
    if (!existsSync(path.join(VERDICTS, file))) problems.push('a card names a verdict file that does not exist: ' + file);
    if (file !== text + '.json') problems.push('a card titled ' + text + ' claims the file ' + file);
    return ' ';
  });

  const rest = decode(body.replace(/<[^>]*>/g, ' '));
  const stray = rest.match(/\d[\d.,:]*/g);
  if (stray) problems.push('free prose on the page carries digits that resolve to nothing: ' + stray.slice(0, 6).join(' '));
  if (problems.length) throw new Error('findings: the page does not trace back to its sources\n  ' + problems.join('\n  '));
  return true;
}

// ---------------------------------------------------------------- generate

export function generate() {
  const { verdicts, skipped } = readVerdicts();
  const files = sourceFiles();
  const notes = readNotes();
  const cards = [], nulls = [];
  let shown = 0;
  for (const v of verdicts) {
    const why = isNull(v);
    const html = card(v, commandFor(v, files), noteFor(v, notes), why);
    shown += cardNumbers(v).length;
    (why ? nulls : cards).push(html);
  }
  const indexed = indexedCount(verdicts);
  const gen = {
    verdicts: verdicts.length, measured: cards.length, nulls: nulls.length, values: shown,
    skipped: skipped.length, indexed: indexed.hit, indexRows: indexed.rows,
  };
  const g = (k) => '<span class="v" data-src="gen:' + k + '">' + esc(fmt(gen[k])) + '</span>';
  const stats = '<p class="lede">'
    + g('verdicts') + ' verdict files read, ' + g('values') + ' measures on the cards, '
    + g('nulls') + ' verdicts null or negative, ' + g('skipped') + ' unreadable. '
    + g('indexed') + ' of the shown measures are also carried in docs/NUMBERS.md, which indexes '
    + g('indexRows') + ' rows.</p>';

  const generatedAt = new Date().toISOString();
  const fill = (s, key, value) => s.replace(key, () => value);
  let page = readFileSync(TEMPLATE, 'utf8');
  page = fill(page, '{{INTRO}}', intro());
  page = fill(page, '{{STATS}}', stats);
  page = fill(page, '{{CARDS}}', cards.join('\n'));
  page = fill(page, '{{NULLS}}', nulls.length ? nulls.join('\n') : '  <p class="dim">nothing here, which on this project means the classifier is broken</p>');
  page = fill(page, '{{SOAK}}', soak());
  page = fill(page, '{{GENERATED}}', '<span class="v" data-src="gen:generatedAt">' + generatedAt + '</span>');

  if (page.includes('{{')) throw new Error('findings: a template placeholder was left unfilled');
  if (page.includes(String.fromCharCode(0x2014))) throw new Error('findings: an em dash reached the page');

  const map = new Map(verdicts.map(v => [v.name, v.json]));
  trace(page, { verdicts: map, soak: soakSources(), gen: { ...gen, generatedAt }, files: new Map() });

  mkdirSync(OUT_DIR, { recursive: true });
  const out = path.join(OUT_DIR, 'index.html');
  writeFileSync(out, page);
  return { ...gen, path: out, bytes: Buffer.byteLength(page), generatedAt };
}

if (process.argv[1] && process.argv[1].endsWith('findings.mjs')) {
  const r = generate();
  console.log('findings  verdicts ' + r.verdicts + '  measured ' + r.measured + '  nulls ' + r.nulls
    + '  values ' + r.values + '  unreadable ' + r.skipped);
  console.log('findings  wrote ' + path.relative(ROOT, r.path) + '  ' + r.bytes + ' bytes at ' + r.generatedAt);
}
