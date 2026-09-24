// web/ladder-walk.mjs: the SECOND walker over the ladder page. It imports nothing from
// web/ladder.mjs on purpose. The page generator carries its own guard (traceCheck, a regex over
// the finished html); this one is written from scratch, so a defect in one is not repeated in
// the other: its own tokenizer (tags and text, one pass, a stack of open traced spans), its own
// entity decoder, its own field resolver, and its own copy of the four formats.
//
// What it proves about a page, given the directory of verdicts the page claims to be read from:
//   every run of digits in the page TEXT (script, style and head removed) sits inside a traced
//     span, and nothing else does;
//   a value span (data-src="bench/verdicts/<file>:<path>" data-fmt="<fmt>") names a file on disk
//     and a field in it, and its text is exactly that field under that format;
//   a path span (data-fmt="path") names a field that exists and shows the path itself;
//   a file span (data-file="bench/verdicts/<file>") names a file on disk and shows its name;
//   a traced span holds text only, never markup.
// It returns the counts and every defect found; it never throws on a bad page.
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const PREFIX = 'bench/verdicts/';
const EMDASH = String.fromCharCode(0x2014);

/** The formats, written out again here rather than imported. */
export const WALK_FORMATS = {
  raw: (v) => String(v).split(EMDASH).join(', '),
  pct: (v) => (typeof v === 'number' && Number.isFinite(v) ? (v * 100).toFixed(2) : undefined),
  pts: (v) => (typeof v === 'number' && Number.isFinite(v) ? v.toFixed(2) : undefined),
  when: (v) => String(v).slice(0, 16).replace('T', ' '),
};

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', micro: 'µ', times: '×', rarr: '→', larr: '←', hellip: '…', ndash: '–' };

/** Decode character references. A numeric reference becomes its character, so its digits are not text. */
export function decodeEntities(s) {
  return String(s).replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, ref) => {
    if (ref[0] === '#') {
      const code = ref[1] === 'x' || ref[1] === 'X' ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return Object.prototype.hasOwnProperty.call(NAMED, ref) ? NAMED[ref] : m;
  });
}

/** Walk a dotted path; an all-digit segment indexes an array. Missing means undefined. */
export function fieldAt(obj, dotted) {
  let cur = obj;
  for (const seg of String(dotted).split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined;
    if (Array.isArray(cur)) {
      if (!/^[0-9]+$/.test(seg)) return undefined;
      cur = cur[Number(seg)];
    } else {
      if (!Object.prototype.hasOwnProperty.call(cur, seg)) return undefined;
      cur = cur[seg];
    }
  }
  return cur;
}

function attrs(tag) {
  const out = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(tag))) out[m[1].toLowerCase()] = decodeEntities(m[2]);
  return out;
}

const RUN = /[0-9]+(?:\.[0-9]+)?/g;
const runs = (text) => (text.match(RUN) || []).length;

/**
 * Walk one page against one verdicts directory.
 * @returns {{ bad: string[], spans: number, valueSpans: number, pathSpans: number, fileSpans: number,
 *   numbers: number, valueNumbers: number, pathNumbers: number, fileNumbers: number, fields: Set<string>, files: Set<string> }}
 */
export function walkLadder(html, verdictsDir) {
  const cache = new Map();
  const load = (name) => {
    if (!cache.has(name)) {
      const p = path.join(verdictsDir, name);
      let j;
      if (!existsSync(p)) j = { missing: true };
      else { try { j = { json: JSON.parse(readFileSync(p, 'utf8')) }; } catch (e) { j = { unreadable: String(e.message || e) }; } }
      cache.set(name, j);
    }
    return cache.get(name);
  };
  const r = { bad: [], spans: 0, valueSpans: 0, pathSpans: 0, fileSpans: 0, numbers: 0, valueNumbers: 0, pathNumbers: 0, fileNumbers: 0, fields: new Set(), files: new Set() };

  const body = String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<head[\s>][\s\S]*?<\/head>/i, '')
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s>][\s\S]*?<\/style>/gi, '');

  // one pass: a traced span opens a capture; any tag inside it is a defect; its close ends it
  let open = null; // { a: its attributes, text: what it shows }
  const token = /<[^>]*>|[^<]+/g;
  let m;
  while ((m = token.exec(body))) {
    const tok = m[0];
    if (tok[0] !== '<') {
      const text = decodeEntities(tok);
      if (open) { open.text += text; continue; }
      const loose = text.match(/\S*[0-9]\S*/g);
      if (loose) for (const w of loose) r.bad.push('a digit outside every traced span: ' + JSON.stringify(w));
      continue;
    }
    const isClose = /^<\//.test(tok);
    const name = (tok.match(/^<\/?\s*([a-zA-Z0-9]+)/) || [])[1];
    const lname = name ? name.toLowerCase() : '';
    if (open) {
      if (isClose && lname === 'span') { finish(open); open = null; continue; }
      r.bad.push('markup inside a traced span: ' + tok.slice(0, 60));
      continue;
    }
    if (lname !== 'span') continue;
    if (isClose) continue;
    const a = attrs(tok);
    if (a['data-src'] !== undefined || a['data-file'] !== undefined) open = { a, text: '' };
  }
  if (open) r.bad.push('a traced span never closed: ' + JSON.stringify(open.a));

  function finish(s) {
    r.spans++;
    const text = s.text;
    const n = runs(text);
    r.numbers += n;
    if (s.a['data-file'] !== undefined) {
      r.fileSpans++; r.fileNumbers += n;
      const ref = s.a['data-file'];
      if (!ref.startsWith(PREFIX)) { r.bad.push('a file span outside ' + PREFIX + ': ' + ref); return; }
      const name = ref.slice(PREFIX.length);
      if (load(name).missing) r.bad.push('a file span names a file not on disk: ' + ref);
      if (text !== ref) r.bad.push('a file span shows ' + JSON.stringify(text) + ' for ' + ref);
      r.files.add(name);
      return;
    }
    const ref = s.a['data-src'];
    const fmt = s.a['data-fmt'];
    const colon = ref.indexOf(':');
    if (!ref.startsWith(PREFIX) || colon < 0) { r.bad.push('a value span with no file and field: ' + ref); return; }
    const name = ref.slice(PREFIX.length, colon);
    const dotted = ref.slice(colon + 1);
    const f = load(name);
    if (f.missing) { r.bad.push('a value span names a file not on disk: ' + ref); return; }
    if (f.unreadable) { r.bad.push('a value span names a file that does not parse: ' + ref); return; }
    const v = fieldAt(f.json, dotted);
    r.files.add(name);
    if (fmt === 'path') {
      r.pathSpans++; r.pathNumbers += n;
      if (v === undefined) r.bad.push('a path label for a field that does not exist: ' + ref);
      else if (text !== dotted) r.bad.push('a path label shows ' + JSON.stringify(text) + ' for ' + ref);
      else r.fields.add(ref);
      return;
    }
    r.valueSpans++; r.valueNumbers += n;
    if (!Object.prototype.hasOwnProperty.call(WALK_FORMATS, fmt)) { r.bad.push('an unknown format ' + JSON.stringify(fmt) + ' on ' + ref); return; }
    if (v === undefined || v === null) { r.bad.push('no such field: ' + ref + ' (the page shows ' + JSON.stringify(text) + ')'); return; }
    if (typeof v === 'object') { r.bad.push('the field is an object, not a value: ' + ref); return; }
    const want = WALK_FORMATS[fmt](v);
    if (want !== text) r.bad.push(ref + ' shows ' + JSON.stringify(text) + ' but the field under ' + fmt + ' is ' + JSON.stringify(want));
    else r.fields.add(ref);
  }
  return r;
}

/** The page text as a reader sees it: script, style and head removed, inline tags dropped, block tags a space, entities decoded. */
export function pageText(html) {
  return decodeEntities(String(html)
    .replace(/<head[\s>][\s\S]*?<\/head>/i, '')
    .replace(/<script[\s>][\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s>][\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(?:span|a|code|b|i|em|strong)\b[^>]*>/gi, '')
    .replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
}

/** The html of one card by its id (a section element), or null. */
export function cardHtml(html, id) {
  const start = html.indexOf('id="' + id + '"');
  if (start < 0) return null;
  const open = html.lastIndexOf('<section', start);
  const close = html.indexOf('</section>', start);
  return open >= 0 && close > start ? html.slice(open, close + '</section>'.length) : null;
}
