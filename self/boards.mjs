// self/boards.mjs: THE BOARDS READER. Every board item the orchestrator ever authored, read from
// its script WITHOUT running it, and decided done or undone from the verdict file its BAR names.
// Author: board 15 builder. MODEL OFF: nothing here opens a socket or runs a board.
//
// His order (2026-09-24 14:29): "Time is approaching until my claude sub is ending self improving
// is extremely important it should be able to finish undone work". Until this file, an unfinished
// board item existed only as prose inside docs/boards/board-N.js, invisible to the loop. This file
// makes each one a gap line of kind "board item" (self/gaps.mjs writes them into
// state/self/gaps.jsonl), and self/autopilot.mjs's boards source hands each to the brief operator.
//
// THE GRAMMAR IT READS
//   docs/boards/board-N.js       a Workflow script. Every top-level `const NAME = <literal>` whose
//                                NAME ends in ITEMS or ITEM (ITEMS, ROWS_ITEM, PUBLIC_ITEM) is parsed
//                                by a small literal parser: objects, arrays, single and double
//                                quoted strings, template literals (escaped backticks and ${...}
//                                kept as text), numbers, booleans, identifiers (kept as a name),
//                                '+' concatenation, comments. Nothing is evaluated. A literal that
//                                does not parse is REPORTED by file, container and line, never
//                                skipped silently. `const MARKER = '...boardN.marker'` names the
//                                launch marker: present means the board was launched.
//   docs/boards/proposed/*.md    a board the organism proposes (self/nextboard.mjs writes them):
//                                a "# Board N (proposed)" title, "name: value" header lines, then
//                                one "## item <key>" heading per item with "wave:", "ollama:",
//                                "owns:" lines and a "task:" line whose text runs to the next item
//                                heading. renderProposedBoard() writes exactly what parseProposedBoard()
//                                reads.
//
// DONE OR UNDONE
//   The BAR is the first "BAR (", "BAR:" or "BAR," of the task text. The bar verdict file is the
//   first bench/verdicts/<name>.json (or a bare <name>.json, read under bench/verdicts/) after it;
//   when the BAR names none, the first bench/verdicts/*.json of the owns list (verdictFrom "owns").
//   DONE: the file exists, parses, and says isTheBar true with barMet true; a file with no barMet
//   says met true (or met.bar, bar.met) or a MET verdict word (older files, no isTheBar). And the
//   file's "at" (else its mtime) is not older than the board's reference time: the launch marker's
//   mtime, or for a board never launched the script's mtime, so a verdict an earlier board wrote
//   is never taken for this board's result. Everything else is UNDONE with its state: absent,
//   partial-only (only <name>-partial.json), missed (barMet false), not-the-bar, unreadable,
//   undecidable, stale, no-verdict-named.
//
// THE GAP LINE (one per undone item): {id: "board-N:key", kind: "board item", board, key, owns,
// brief (the task text, whole), verdictFile, bar (the BAR sentence: from BAR to the Tests clause),
// trial (the bar command when the BAR states one as a runnable `node ...` line, else a bench named
// inside the BAR's parenthesis as `node <bench>`, else null), needsModel (the ollama flag, else the
// words Ollama or model in the task unless it says MODEL OFF), minutes: 60, files (the owned list
// as paths)}, plus state, reason, wave, trialFrom, trialBench, trialBenchExists, source and the
// ledger's common fields (subsystem, measured, unit, distance, benchCommand, since, better, why).
//
//   node self/boards.mjs          print every board, done and undone per item
//   node self/boards.mjs --json   print the scan as one JSON object
//   node self/boards.mjs --gaps   print the undone items as gap lines, one per line
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'board 15 builder';
export const BOARD_ITEM_KIND = 'board item';
export const BOARDS_REL = 'docs/boards';
export const PROPOSED_REL = 'docs/boards/proposed';
export const GAP_MINUTES = 60;
export const SCRIPT_RE = /^board-(\d+)\.js$/;
export const PROPOSED_RE = /\.md$/;
/** Containers read from a board script: ITEMS, ROWS_ITEM, PUBLIC_ITEM and any other *ITEM(S). */
export const CONTAINER_RE = /(?:^|_)ITEMS?$/;

const relOf = (root, p) => path.relative(root, p).replaceAll('\\', '/');
const byStr = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

// ================================================================ the literal parser
class ParseError extends Error {}

function lineAt(text, pos) {
  let n = 1;
  for (let i = 0; i < pos && i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

const ID_START = /[A-Za-z_$]/;
const ID_PART = /[A-Za-z0-9_$]/;

/** A recursive descent parser for the literal subset a board script's items are written in. */
class Literal {
  constructor(text, pos) { this.t = text; this.p = pos; }
  fail(msg) { throw new ParseError(msg + ' at line ' + lineAt(this.t, this.p)); }
  peek(k = 0) { return this.t[this.p + k]; }
  ws() {
    const t = this.t;
    for (;;) {
      const c = t[this.p];
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n' || c === '﻿') { this.p++; continue; }
      if (c === '/' && t[this.p + 1] === '/') { while (this.p < t.length && t[this.p] !== '\n') this.p++; continue; }
      if (c === '/' && t[this.p + 1] === '*') {
        const end = t.indexOf('*/', this.p + 2);
        if (end < 0) this.fail('an unterminated comment');
        this.p = end + 2; continue;
      }
      return;
    }
  }
  expect(ch) { this.ws(); if (this.t[this.p] !== ch) this.fail('expected "' + ch + '", found ' + (this.p >= this.t.length ? 'the end of the file' : '"' + this.t[this.p] + '"')); this.p++; }
  ident() {
    const s = this.p;
    if (!ID_START.test(this.t[this.p] || '')) this.fail('expected a name');
    while (ID_PART.test(this.t[this.p] || '')) this.p++;
    return this.t.slice(s, this.p);
  }
  /** value ('+' value)*: strings join; anything else is kept as its source text. */
  value() {
    let v = this.primary();
    for (;;) {
      this.ws();
      if (this.t[this.p] === '+' && this.t[this.p + 1] !== '+' && this.t[this.p + 1] !== '=') {
        this.p++;
        const w = this.primary();
        v = typeof v === 'string' && typeof w === 'string' ? v + w : { expr: srcOf(v) + ' + ' + srcOf(w) };
        continue;
      }
      if ((this.t[this.p] === '|' && this.t[this.p + 1] === '|') || (this.t[this.p] === '&' && this.t[this.p + 1] === '&') || (this.t[this.p] === '?' && this.t[this.p + 1] === '?')) {
        const op = this.t.slice(this.p, this.p + 2);
        this.p += 2;
        const w = this.primary();
        v = { expr: srcOf(v) + ' ' + op + ' ' + srcOf(w) };
        continue;
      }
      return v;
    }
  }
  primary() {
    this.ws();
    const c = this.t[this.p];
    if (c === undefined) this.fail('a value was expected but the file ended');
    if (c === '{') return this.object();
    if (c === '[') return this.array();
    if (c === "'" || c === '"') return this.quoted(c);
    if (c === '`') return this.template();
    if (c === '(') { this.p++; const v = this.value(); this.expect(')'); return v; }
    if (c === '-' || c === '+' || /[0-9.]/.test(c)) {
      const m = /^[-+]?(?:0[xX][0-9a-fA-F_]+|(?:\d[\d_]*)?\.?\d[\d_]*(?:[eE][-+]?\d+)?)/.exec(this.t.slice(this.p, this.p + 64));
      if (!m || !m[0] || m[0] === '-' || m[0] === '+') this.fail('an unreadable number');
      this.p += m[0].length;
      return Number(m[0].replaceAll('_', ''));
    }
    if (c === '!') { this.p++; const v = this.primary(); return { expr: '!' + srcOf(v) }; }
    if (ID_START.test(c)) {
      const name = this.ident();
      if (name === 'true') return true;
      if (name === 'false') return false;
      if (name === 'null') return null;
      if (name === 'undefined') return undefined;
      let src = name;
      for (;;) {
        const save = this.p;
        this.ws();
        const d = this.t[this.p];
        if (d === '.' && this.t[this.p + 1] !== '.') { this.p++; this.ws(); src += '.' + this.ident(); continue; }
        if (d === '?' && this.t[this.p + 1] === '.') { this.p += 2; this.ws(); src += '?.' + this.ident(); continue; }
        if (d === '(' || d === '[') { const s = this.p; this.balanced(); src += this.t.slice(s, this.p); continue; }
        this.p = save;
        break;
      }
      return src === name ? { ref: name } : { expr: src };
    }
    this.fail('an unexpected "' + c + '"');
  }
  object() {
    this.expect('{');
    const o = {};
    const spreads = [];
    for (;;) {
      this.ws();
      if (this.t[this.p] === '}') { this.p++; break; }
      if (this.t.startsWith('...', this.p)) { this.p += 3; spreads.push(srcOf(this.value())); }
      else {
        let key;
        const c = this.t[this.p];
        if (c === "'" || c === '"') key = this.quoted(c);
        else if (c === '[') { this.p++; key = '[' + srcOf(this.value()) + ']'; this.expect(']'); }
        else if (/[0-9]/.test(c)) key = String(this.primary());
        else key = this.ident();
        this.ws();
        const d = this.t[this.p];
        if (d === ':') { this.p++; o[key] = this.value(); }
        else if (d === ',' || d === '}') o[key] = { ref: key };
        else if (d === '(') { const s = this.p; this.balanced(); this.ws(); const b = this.p; if (this.t[this.p] !== '{') this.fail('a method without a body'); this.balanced(); o[key] = { expr: key + this.t.slice(s, b) + this.t.slice(b, this.p) }; }
        else this.fail('expected ":" after the property ' + key);
      }
      this.ws();
      if (this.t[this.p] === ',') { this.p++; continue; }
      if (this.t[this.p] === '}') { this.p++; break; }
      this.fail('expected "," or "}" in an object');
    }
    if (spreads.length) Object.defineProperty(o, '__spreads', { value: spreads, enumerable: false });
    return o;
  }
  array() {
    this.expect('[');
    const a = [];
    for (;;) {
      this.ws();
      if (this.t[this.p] === ']') { this.p++; break; }
      if (this.t[this.p] === ',') { this.p++; a.push(undefined); continue; }
      if (this.t.startsWith('...', this.p)) { this.p += 3; a.push({ spread: srcOf(this.value()) }); }
      else a.push(this.value());
      this.ws();
      if (this.t[this.p] === ',') { this.p++; continue; }
      if (this.t[this.p] === ']') { this.p++; break; }
      this.fail('expected "," or "]" in an array');
    }
    return a;
  }
  escape() {
    // this.p is on the character after the backslash
    const t = this.t;
    const c = t[this.p++];
    switch (c) {
      case 'n': return '\n';
      case 't': return '\t';
      case 'r': return '\r';
      case 'b': return '\b';
      case 'f': return '\f';
      case 'v': return '\v';
      case '0': return /[0-9]/.test(t[this.p] || '') ? this.fail('an octal escape') : '\0';
      case 'x': { const h = t.slice(this.p, this.p + 2); if (!/^[0-9a-fA-F]{2}$/.test(h)) this.fail('a bad \\x escape'); this.p += 2; return String.fromCharCode(parseInt(h, 16)); }
      case 'u': {
        if (t[this.p] === '{') { const e = t.indexOf('}', this.p); const h = t.slice(this.p + 1, e); if (e < 0 || !/^[0-9a-fA-F]{1,6}$/.test(h)) this.fail('a bad \\u{} escape'); this.p = e + 1; return String.fromCodePoint(parseInt(h, 16)); }
        const h = t.slice(this.p, this.p + 4); if (!/^[0-9a-fA-F]{4}$/.test(h)) this.fail('a bad \\u escape'); this.p += 4; return String.fromCharCode(parseInt(h, 16));
      }
      case '\r': if (t[this.p] === '\n') this.p++; return '';
      case '\n': case ' ': case ' ': return '';
      case undefined: return this.fail('a backslash at the end of the file');
      default: return c;
    }
  }
  quoted(q) {
    this.p++;
    let s = '';
    const t = this.t;
    for (;;) {
      const c = t[this.p];
      if (c === undefined) this.fail('an unterminated string');
      if (c === '\n') this.fail('a line break inside a ' + (q === "'" ? 'single' : 'double') + ' quoted string');
      this.p++;
      if (c === q) return s;
      if (c === '\\') { s += this.escape(); continue; }
      s += c;
    }
  }
  template() {
    this.p++;
    let s = '';
    const t = this.t;
    for (;;) {
      const c = t[this.p];
      if (c === undefined) this.fail('an unterminated template literal');
      if (c === '`') { this.p++; return s; }
      if (c === '\\') { this.p++; s += this.escape(); continue; }
      if (c === '$' && t[this.p + 1] === '{') {
        const start = this.p;
        this.p += 1;
        this.balanced();
        s += t.slice(start, this.p); // ${...} kept as text: nothing is evaluated
        continue;
      }
      s += c;
      this.p++;
    }
  }
  /** Skip a balanced (), [] or {} group, strings, templates and comments inside it. */
  balanced() {
    const t = this.t;
    const open = t[this.p];
    const close = open === '(' ? ')' : open === '[' ? ']' : '}';
    const stack = [close];
    this.p++;
    while (stack.length) {
      const c = t[this.p];
      if (c === undefined) this.fail('an unbalanced "' + open + '"');
      if (c === "'" || c === '"') { this.quoted(c); continue; }
      if (c === '`') { this.template(); continue; }
      if (c === '/' && (t[this.p + 1] === '/' || t[this.p + 1] === '*')) { this.ws(); continue; }
      this.p++;
      if (c === '(') stack.push(')');
      else if (c === '[') stack.push(']');
      else if (c === '{') stack.push('}');
      else if (c === ')' || c === ']' || c === '}') {
        if (c !== stack[stack.length - 1]) this.fail('a "' + c + '" where "' + stack[stack.length - 1] + '" was expected');
        stack.pop();
      }
    }
  }
}

function srcOf(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v && typeof v === 'object') {
    if ('ref' in v) return v.ref;
    if ('expr' in v) return v.expr;
    if ('spread' in v) return '...' + v.spread;
  }
  return String(v);
}

/** The string a parsed value holds, or null (an identifier or an expression is not a string). */
const strOf = (v) => (typeof v === 'string' ? v : null);

/**
 * Parse one board script without running it.
 * @returns {{file, ok, errors: {container, line, reason}[], items: object[], containers: string[], marker: string|null, name: string|null}}
 */
export function parseBoardScript(text, { file = '<script>' } = {}) {
  const out = { file, ok: true, errors: [], items: [], containers: [], marker: null, name: null };
  const src = String(text ?? '');
  const mk = /^(?:export\s+)?const\s+MARKER\s*=\s*(['"])((?:\\.|(?!\1).)*)\1/m.exec(src);
  if (mk) out.marker = mk[2].replace(/\\\\/g, '\\');
  const nm = /\bname\s*:\s*(['"])((?:\\.|(?!\1).)*)\1/.exec(src.slice(0, 4000));
  if (nm) out.name = nm[2];
  const re = /^(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*/gm;
  let m;
  while ((m = re.exec(src))) {
    const name = m[1];
    if (!CONTAINER_RE.test(name)) continue;
    out.containers.push(name);
    const at = m.index + m[0].length;
    const p = new Literal(src, at);
    let v;
    try {
      const c = src[p.p];
      if (c !== '[' && c !== '{') throw new ParseError('the value is not an array or object literal at line ' + lineAt(src, at));
      v = p.value();
    } catch (e) {
      out.ok = false;
      out.errors.push({ container: name, line: lineAt(src, at), reason: e instanceof ParseError ? e.message : 'the parser threw: ' + String((e && e.message) || e) });
      continue;
    }
    re.lastIndex = Math.max(re.lastIndex, p.p);
    const list = Array.isArray(v) ? v : [v];
    list.forEach((it, i) => {
      if (!it || typeof it !== 'object' || Array.isArray(it) || 'ref' in it || 'expr' in it || 'spread' in it) {
        out.ok = false;
        out.errors.push({ container: name, line: lineAt(src, at), reason: 'element ' + i + ' of ' + name + ' is not an object literal (' + srcOf(it) + ')' });
        return;
      }
      const key = strOf(it.key);
      if (!key) { out.ok = false; out.errors.push({ container: name, line: lineAt(src, at), reason: 'element ' + i + ' of ' + name + ' has no string key' }); return; }
      const task = strOf(it.task);
      if (task === null) { out.ok = false; out.errors.push({ container: name, line: lineAt(src, at), reason: 'the item ' + key + ' has no string task' }); }
      out.items.push({
        key, owns: strOf(it.owns) ?? '', task: task ?? '',
        wave: typeof it.wave === 'number' ? it.wave : name === 'ITEMS' ? 1 : name.replace(/_?ITEMS?$/, '').toLowerCase() || name.toLowerCase(),
        waveFrom: typeof it.wave === 'number' ? 'wave' : name === 'ITEMS' ? 'ITEMS without a wave field (one parallel wave)' : 'the ' + name + ' stage',
        ollama: it.ollama === true, model: typeof it.model === 'string' ? it.model : it.model && it.model.ref ? it.model.ref : null,
        container: name,
      });
    });
  }
  if (!out.containers.length) { out.ok = false; out.errors.push({ container: null, line: null, reason: 'no top-level const ITEMS array or *_ITEM object' }); }
  const seen = new Set();
  for (const it of out.items) {
    if (seen.has(it.key)) { out.ok = false; out.errors.push({ container: it.container, line: null, reason: 'two items share the key ' + it.key }); }
    seen.add(it.key);
  }
  return out;
}

// ================================================================ the proposed grammar (.md)
const ITEM_HEAD = /^##\s+item\s+(\S+)\s*$/;
const ESCAPED_HEAD = /^ +##\s+item\s+\S+\s*$/;

/**
 * Parse a proposed board (docs/boards/proposed/*.md).
 * @returns {{file, ok, errors, items, header: object, board: number|null, title: string|null}}
 */
export function parseProposedBoard(text, { file = '<proposed>' } = {}) {
  const out = { file, ok: true, errors: [], items: [], header: {}, board: null, title: null, containers: ['## item'], marker: null, name: null };
  const lines = String(text ?? '').split(/\r?\n/);
  let cur = null, inTask = false;
  const flush = () => { if (cur) { cur.task = cur.taskLines.join('\n').trim(); delete cur.taskLines; out.items.push(cur); } };
  lines.forEach((raw, i) => {
    const h = ITEM_HEAD.exec(raw);
    if (h) { flush(); cur = { key: h[1], owns: '', task: '', wave: 1, waveFrom: 'the default', ollama: false, model: null, container: '## item', taskLines: [], line: i + 1 }; inTask = false; return; }
    if (!cur) {
      const t = /^#\s+(.*\S)\s*$/.exec(raw);
      if (t && !out.title) { out.title = t[1]; const n = /\bboard\s+(\d+)\b/i.exec(t[1]); if (n) out.board = Number(n[1]); return; }
      const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(raw);
      if (kv) out.header[kv[1]] = kv[2].trim();
      return;
    }
    if (inTask) { cur.taskLines.push(ESCAPED_HEAD.test(raw) ? raw.slice(1) : raw); return; }
    const kv = /^([A-Za-z][\w-]*):\s*(.*)$/.exec(raw);
    if (!kv) { if (raw.trim()) { out.ok = false; out.errors.push({ container: '## item ' + cur.key, line: i + 1, reason: 'a line before "task:" that is not "name: value"' }); } return; }
    const [, k, v] = kv;
    if (k === 'task') { inTask = true; if (v.trim()) cur.taskLines.push(v); return; }
    if (k === 'wave') { const n = Number(v); cur.wave = Number.isFinite(n) && v.trim() !== '' ? n : v.trim(); cur.waveFrom = 'wave'; return; }
    if (k === 'ollama') { cur.ollama = /^(true|yes|on|1)$/i.test(v.trim()); return; }
    if (k === 'owns') { cur.owns = v.trim(); return; }
    cur[k] = v.trim();
  });
  flush();
  if (!out.items.length) { out.ok = false; out.errors.push({ container: null, line: null, reason: 'no "## item <key>" heading' }); }
  const seen = new Set();
  for (const it of out.items) {
    if (!it.task) { out.ok = false; out.errors.push({ container: '## item ' + it.key, line: it.line, reason: 'the item ' + it.key + ' has no task text' }); }
    if (seen.has(it.key)) { out.ok = false; out.errors.push({ container: '## item ' + it.key, line: it.line, reason: 'two items share the key ' + it.key }); }
    seen.add(it.key);
    delete it.line;
  }
  return out;
}

/**
 * Write a proposed board in the grammar parseProposedBoard reads (self/nextboard.mjs uses this).
 * header: name -> value lines; items: {key, owns, wave, ollama, task}.
 */
export function renderProposedBoard({ board, title = null, header = {}, items = [] } = {}) {
  const out = ['# ' + (title || 'Board ' + board + ' (proposed)'), ''];
  for (const [k, v] of Object.entries(header)) out.push(k + ': ' + String(v).replace(/\r?\n/g, ' '));
  for (const it of items) {
    if (!/^\S+$/.test(String(it.key || ''))) throw new Error('an item key must be one word: ' + JSON.stringify(it.key));
    out.push('', '## item ' + it.key, 'wave: ' + (it.wave ?? 1), 'ollama: ' + (it.ollama === true), 'owns: ' + String(it.owns || '').replace(/\r?\n/g, ' '), 'task:');
    // a task line that reads as an item heading, or as an escaped one, gains one leading space; the parser takes it off
    for (const l of String(it.task || '').split(/\r?\n/)) out.push(ITEM_HEAD.test(l) || ESCAPED_HEAD.test(l) ? ' ' + l : l);
  }
  return out.join('\n') + '\n';
}

// ================================================================ the BAR of a task
const BAR_MARK = /\bBAR\b(?=\s*[(:,])/;
const VERDICT_TOKEN = /(^|[\s(,:;'"`])((?:bench\/verdicts\/)?([A-Za-z0-9_][A-Za-z0-9_.-]*?)\.json)(?![A-Za-z0-9_])/g;
const TESTS_MARK = /\bTests\b\s*(?:\(|:)/;

/** The verdict files a text names, in order: bench/verdicts/<name>.json or a bare <name>.json. */
export function verdictNames(text) {
  const out = [];
  VERDICT_TOKEN.lastIndex = 0;
  let m;
  while ((m = VERDICT_TOKEN.exec(String(text || '')))) {
    const name = m[3];
    if (name.includes('*') || name.includes('{') || name.startsWith('.')) continue;
    out.push({ file: 'bench/verdicts/' + name + '.json', at: m.index + m[1].length, bare: !m[2].startsWith('bench/') });
  }
  return out;
}

/** A word after a bare flag that is prose, not the flag's value ("--register prints the task"). */
const PROSE_WORD = /^(?:prints?|writes?|runs?|reads?|passes|exits?|returns?|lists?|takes?|builds?|and|then|with|under|must|shows?|gives?|emits?|produces?|records?|reports?|creates?|makes?|is|are|was|in|at|for|from|to|of|the|a|an|which|that|until|once)$/i;

/** The first `node <script>` command of a text with the flags and values that follow it. */
export function commandIn(text) {
  const s = String(text || '');
  const m = /\bnode\s+/.exec(s);
  if (!m) return null;
  const toks = s.slice(m.index).split(/\s+/);
  const out = [];
  let expectScript = true, lastFlag = false, script = null, afterScript = 0;
  const PUNCT = /[,;:)]+$|\.$/;
  for (let i = 0; i < toks.length && out.length < 48; i++) {
    let tok = toks[i];
    if (!tok) continue;
    const ended = PUNCT.test(tok) && !/\.m?js$/.test(tok);
    if (ended) tok = tok.replace(PUNCT, '');
    if (!tok) break;
    if (i === 0) { out.push(tok); continue; }
    if (expectScript) {
      if (tok.startsWith('-')) { out.push(tok); if (ended) break; continue; }
      if (/^[\w./\\-]+\.m?js$/.test(tok)) { out.push(tok); if (!script) script = tok; expectScript = false; afterScript = 0; lastFlag = false; if (ended) break; continue; }
      if (tok === 'node') { out.push(tok); continue; }
      break;
    }
    if (tok === '--') { out.push(tok); expectScript = true; lastFlag = false; if (ended) break; continue; }
    if (tok.startsWith('-')) { out.push(tok); lastFlag = !tok.includes('='); afterScript++; if (ended) break; continue; }
    if (lastFlag && /^[\w./\\:=,{}*-]+$/.test(tok) && !PROSE_WORD.test(tok)) { out.push(tok); lastFlag = false; afterScript++; if (ended) break; continue; }
    if (afterScript === 0 && /^[a-z][\w]*-[\w-]+$/.test(tok)) { out.push(tok); afterScript++; if (ended) break; continue; }
    break;
  }
  if (!script) return null;
  return { command: out.join(' '), script: script.replaceAll('\\', '/') };
}

/**
 * The BAR of a task text: its sentence, the verdict file it names and its command.
 * @returns {{found: boolean, sentence: string|null, verdictFile: string|null, verdictFrom: string|null, trial: string|null, trialFrom: string|null, trialBench: string|null}}
 */
/** The BAR marker of a task: the first "BAR (" whose parenthesis names a .json or .mjs file, else the first "BAR (", "BAR:" or "BAR,". */
export function barMarkOf(task) {
  const t = String(task || '');
  const re = new RegExp(BAR_MARK.source, 'g');
  let m, first = null;
  while ((m = re.exec(t))) {
    if (!first) first = m;
    const p = /^BAR\s*\(([^)]*)\)/.exec(t.slice(m.index));
    if (p && /\.m?js(?:on)?\b/.test(p[1])) return m;
  }
  return first;
}

export function barOf(task, owns = '') {
  const t = String(task || '');
  const m = barMarkOf(t);
  const out = { found: !!m, sentence: null, verdictFile: null, verdictFrom: null, trial: null, trialFrom: null, trialBench: null };
  const fromOwns = () => {
    const v = verdictNames(String(owns || '')).find((x) => !x.file.endsWith('-partial.json') && !x.bare);
    if (v) { out.verdictFile = v.file; out.verdictFrom = 'owns'; }
  };
  if (!m) { fromOwns(); return out; }
  const rest = t.slice(m.index);
  const tm = TESTS_MARK.exec(rest);
  out.sentence = (tm ? rest.slice(0, tm.index) : rest).trim();
  const named = verdictNames(rest);
  let v = named[0];
  if (v) {
    // The first file after BAR, unless the item neither owns it nor says it writes it, and owns a later
    // one the BAR sentence names: then the first is an input the bar reads (Board 10 imagine reads
    // grid.json and writes imagine.json; Board 10 autopilot writes autopilot.json, so it stays).
    const owned = new Set(verdictNames(String(owns || '')).map((x) => x.file));
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const written = (x) => new RegExp('\\bwrit(?:es|e|ten|ing)\\b[^.;]{0,120}?(?:bench/verdicts/)?' + esc(x.file.slice('bench/verdicts/'.length)), 'i').test(out.sentence);
    if (!owned.has(v.file) && !written(v)) {
      const w = verdictNames(out.sentence).find((x) => owned.has(x.file) && !x.file.endsWith('-partial.json'));
      if (w) { out.verdictSkipped = v.file; v = w; }
    }
    out.verdictFile = v.file;
    out.verdictFrom = (v.bare ? 'BAR (a bare name, read under bench/verdicts/)' : 'BAR') + (out.verdictSkipped ? ', the first the item owns (' + out.verdictSkipped + ' is named first but neither owned nor written)' : '');
  }
  else fromOwns();
  const paren = /^BAR\s*\(([^)]*)\)/.exec(rest);
  const bench = paren ? (paren[1].match(/\b((?:bench|tools)\/[\w./-]+\.m?js)\b/) || [])[1] : null;
  // The bar command, in order: a node line whose clause names the bar verdict file; a node line that
  // runs the bench the BAR parenthesis names; the first node line whose clause writes no OTHER verdict
  // file (Board 13 math's "node bench/ns.mjs writes ns-after-board13.json" is a follow-up, not the bar).
  // A `node --test` line is the item's tests, never its bar command.
  const cmds = commandsIn(out.sentence).filter((c) => !c.test);
  const pick = cmds.find((c) => out.verdictFile && c.names.includes(out.verdictFile))
    || (bench && cmds.find((c) => c.script === bench))
    || cmds.find((c) => !c.writes.some((f) => f !== out.verdictFile));
  if (pick) {
    out.trial = pick.command; out.trialBench = pick.script;
    out.trialFrom = 'a node line in the BAR' + (out.verdictFile && pick.names.includes(out.verdictFile) ? ' that writes the bar verdict' : bench && pick.script === bench ? ' running the bench the BAR parenthesis names' : '');
    return out;
  }
  if (bench) { out.trial = 'node ' + bench; out.trialFrom = 'the bench named in the BAR parenthesis'; out.trialBench = bench; }
  if (cmds.length && !out.trial) out.trialSkipped = cmds.map((c) => c.command);
  // Last: the BAR names no command, but the item owns bench/<stem>.mjs for its bench/verdicts/<stem>.json
  // (Board 14 gaps owns bench/gaps.mjs). A bench whose name is only a prefix of the stem (bench/grid.mjs
  // for grid-clock.json) is a hint, never a trial: its flags are not written anywhere.
  if (!out.trial && out.verdictFile) {
    const stem = out.verdictFile.slice('bench/verdicts/'.length).replace(/\.json$/, '');
    const own = ownedFiles(owns).filter((f) => /^bench\/[^/]+\.mjs$/.test(f));
    const exact = own.find((f) => f === 'bench/' + stem + '.mjs');
    if (exact) { out.trial = 'node ' + exact; out.trialBench = exact; out.trialFrom = 'the owned bench named after the verdict file (the BAR names no command)'; }
    else { const pre = own.find((f) => stem.startsWith(f.slice('bench/'.length, -'.mjs'.length) + '-')); if (pre) out.trialHint = pre; }
  }
  return out;
}

/**
 * Every node command of a text. Its clause runs to the next ". " or the next node command; names are
 * the verdict files the clause mentions, writes the ones a "write" word precedes. test: a node --test line.
 */
export function commandsIn(text) {
  const s = String(text || '');
  const out = [];
  const re = /\bnode\s+/g;
  let m, lastEnd = -1;
  while ((m = re.exec(s))) {
    if (m.index < lastEnd) continue;
    const c = commandIn(s.slice(m.index));
    if (!c) continue;
    const tail = s.slice(m.index);
    const after = c.command.length;
    const stops = [tail.slice(after).search(/\.\s|\.$/), tail.slice(after).search(/\bnode\s+(?:--?[\w-]+\s+)*[\w./\\-]+\.m?js\b/)].filter((x) => x >= 0);
    const clause = stops.length ? tail.slice(0, after + Math.min(...stops)) : tail;
    const writes = [];
    const wre = /\bwrit(?:es|e|ten|ing)\b/gi;
    let w;
    while ((w = wre.exec(clause))) { const v = verdictNames(clause.slice(w.index))[0]; if (v && !writes.includes(v.file)) writes.push(v.file); }
    out.push({ ...c, at: m.index, test: /^node\s+(?:--[\w-]+(?:=\S+)?\s+)*--test\b/.test(c.command), names: verdictNames(clause).map((x) => x.file), writes });
    lastEnd = m.index + c.command.length;
  }
  return out;
}

/** The owned list as paths: parentheses dropped, split on top-level commas and " and ". */
export function ownedFiles(owns) {
  const s = String(owns || '');
  let flat = '', depth = 0;
  for (const c of s) {
    if (c === '(') { depth++; continue; }
    if (c === ')') { depth = Math.max(0, depth - 1); continue; }
    if (depth === 0) flat += c;
  }
  const parts = [];
  let cur = '', brace = 0;
  for (const c of flat) {
    if (c === '{') brace++;
    if (c === '}') brace = Math.max(0, brace - 1);
    if (c === ',' && brace === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  const out = [];
  for (const p of parts) {
    for (const piece of p.split(/\s+and\s+/)) {
      for (const tok of piece.trim().split(/\s+/)) {
        const t = tok.replace(/^['"`]+|['"`.;:]+$/g, '');
        if (!/^[\w.*{}/-]+$/.test(t) || !(t.includes('/') || /\.[\w{},*]+$/.test(t))) continue;
        if (!out.includes(t)) out.push(t);
      }
    }
  }
  return out;
}

/** needsModel: the ollama flag; else false when the task says MODEL OFF; else the words Ollama or model. */
export function needsModelOf(item) {
  if (item && item.ollama === true) return { needsModel: true, from: 'the item\'s ollama flag' };
  const t = String((item && item.task) || '');
  if (/\bMODEL[ -]OFF\b|\bmodel-off\b|\bmodel off\b/i.test(t)) return { needsModel: false, from: 'the task says MODEL OFF' };
  if (/\bOllama\b/i.test(t)) return { needsModel: true, from: 'the word Ollama in the task' };
  if (/\bmodel\b/i.test(t)) return { needsModel: true, from: 'the word model in the task' };
  return { needsModel: false, from: 'no ollama flag and neither word in the task' };
}

// ================================================================ done or undone
const MISSED_WORD = /^(NOT\s+MET|MISSED|MISS|RED|FAIL(?:ED|S)?|NULL|LOSES|LOST|BELOW)\b/;
const MET_WORD = /^(MET|GREEN|BEATS?|PASS(?:ED)?|ABOVE)\b/;

// A verdict file is parsed once per (path, size, mtime, ctime) in a process: a warm scan pays one stat
// per file instead of a JSON.parse of up to 0.9 MB. Only the fields decideItem reads are kept.
const JSON_CACHE = new Map();
const slimVerdict = (v) => {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
  const met = v.met && typeof v.met === 'object' && !Array.isArray(v.met) ? { bar: v.met.bar } : v.met;
  const bar = v.bar && typeof v.bar === 'object' && !Array.isArray(v.bar) ? { met: v.bar.met } : v.bar;
  return { isTheBar: v.isTheBar, barMet: v.barMet, met, bar, verdict: v.verdict, at: v.at };
};
function readJson(file) {
  let st = null;
  try { st = statSync(file); } catch { st = null; }
  const key = st ? file + '|' + st.size + '|' + st.mtimeMs + '|' + st.ctimeMs : null;
  if (key && JSON_CACHE.has(key)) return JSON_CACHE.get(key);
  let out;
  try { out = { v: slimVerdict(JSON.parse(readFileSync(file, 'utf8'))), error: null }; } catch (e) { out = { v: null, error: String((e && e.message) || e).split('\n')[0] }; }
  if (key) { if (JSON_CACHE.size > 4096) JSON_CACHE.clear(); JSON_CACHE.set(key, out); }
  return out;
}
const mtimeOf = (f) => { try { return statSync(f).mtimeMs; } catch { return null; } };

/** Where the MARKER constant points, inside this root: state/<its file name>. */
export function markerRel(marker) {
  if (!marker) return null;
  const parts = String(marker).split(/[\\/]+/).filter(Boolean);
  const name = parts[parts.length - 1];
  const dir = parts.length > 1 ? parts[parts.length - 2] : null;
  return (dir === 'state' ? 'state/' : '') + name;
}

/**
 * Done or undone for one item, from its bar verdict file.
 * @param {{verdictFile: string|null}} bar the item's barOf()
 * @param {{refMs: number|null, refFrom: string}} ref the board's reference time
 * @returns {{done: boolean, state: string, reason: string, verdict: object}}
 */
export function decideItem(bar, { root = ROOT, refMs = null, refFrom = 'none' } = {}) {
  const verdict = { file: bar.verdictFile, from: bar.verdictFrom, exists: false, partialFile: null, isTheBar: null, barMet: null, field: null, at: null };
  const undone = (state, reason) => ({ done: false, state, reason, verdict });
  if (!bar.verdictFile) return undone('no-verdict-named', bar.found ? 'its BAR names no bench/verdicts/<name>.json and its owns list names none' : 'its task has no BAR and its owns list names no bench/verdicts/<name>.json');
  const abs = path.join(root, ...bar.verdictFile.split('/'));
  const partialRel = bar.verdictFile.replace(/\.json$/, '-partial.json');
  const partialAbs = path.join(root, ...partialRel.split('/'));
  if (existsSync(partialAbs)) verdict.partialFile = partialRel;
  if (!existsSync(abs)) {
    if (verdict.partialFile) return undone('partial-only', 'only ' + partialRel + ' exists: the bar run never completed');
    return undone('absent', bar.verdictFile + ' does not exist');
  }
  verdict.exists = true;
  const { v, error } = readJson(abs);
  if (error || !v || typeof v !== 'object' || Array.isArray(v)) return undone('unreadable', bar.verdictFile + ' is not a JSON object' + (error ? ': ' + error : ''));
  verdict.isTheBar = v.isTheBar === true ? true : v.isTheBar === false ? false : null;
  const atMs = typeof v.at === 'string' && Number.isFinite(Date.parse(v.at)) ? Date.parse(v.at) : mtimeOf(abs);
  verdict.at = atMs !== null ? new Date(atMs).toISOString() : null;
  verdict.atFrom = typeof v.at === 'string' && Number.isFinite(Date.parse(v.at)) ? 'at' : 'mtime';
  let met = null;
  if (typeof v.barMet === 'boolean') {
    verdict.barMet = v.barMet; verdict.field = 'barMet';
    if (v.isTheBar !== true) return undone('not-the-bar', bar.verdictFile + ' has barMet ' + v.barMet + ' but isTheBar is ' + JSON.stringify(v.isTheBar ?? null) + ': not a bar file');
    met = v.barMet;
  } else if (typeof v.met === 'boolean') { met = v.met; verdict.field = 'met'; }
  else if (v.met && typeof v.met === 'object' && typeof v.met.bar === 'boolean') { met = v.met.bar; verdict.field = 'met.bar'; }
  else if (v.bar && typeof v.bar === 'object' && !Array.isArray(v.bar) && typeof v.bar.met === 'boolean') { met = v.bar.met; verdict.field = 'bar.met'; }
  else if (typeof v.verdict === 'string') {
    const w = v.verdict.trim().toUpperCase();
    if (MISSED_WORD.test(w)) { met = false; verdict.field = 'verdict'; }
    else if (MET_WORD.test(w)) { met = true; verdict.field = 'verdict'; }
  }
  if (met === null) return undone('undecidable', bar.verdictFile + ' has no barMet, met, met.bar, bar.met or MET verdict word');
  if (verdict.barMet === null) verdict.barMet = met;
  if (!met) return undone('missed', bar.verdictFile + ' says ' + verdict.field + ' false' + (verdict.partialFile ? ' (and ' + verdict.partialFile + ' exists)' : ''));
  if (refMs !== null && atMs !== null && atMs < refMs) return undone('stale', bar.verdictFile + ' is met but dated ' + verdict.at + ', before ' + refFrom + ' (' + new Date(refMs).toISOString() + '): an earlier run, not this board\'s result');
  return { done: true, state: 'done', reason: bar.verdictFile + ' says ' + verdict.field + ' true', verdict };
}

// ================================================================ the scan
/** Every board file under root: scripts board-N.js, then docs/boards/proposed/*.md. */
export function listBoardFiles(root = ROOT) {
  const out = [];
  const dir = path.join(root, ...BOARDS_REL.split('/'));
  let names = [];
  try { names = readdirSync(dir, { withFileTypes: true }); } catch { names = []; }
  for (const e of names) {
    const m = e.isFile() && SCRIPT_RE.exec(e.name);
    if (m) out.push({ kind: 'script', board: Number(m[1]), rel: BOARDS_REL + '/' + e.name, abs: path.join(dir, e.name) });
  }
  const pdir = path.join(root, ...PROPOSED_REL.split('/'));
  let pnames = [];
  try { pnames = readdirSync(pdir, { withFileTypes: true }); } catch { pnames = []; }
  for (const e of pnames) {
    if (!e.isFile() || !PROPOSED_RE.test(e.name)) continue;
    const m = /board-(\d+)/i.exec(e.name);
    out.push({ kind: 'proposed', board: m ? Number(m[1]) : null, rel: PROPOSED_REL + '/' + e.name, abs: path.join(pdir, e.name) });
  }
  return out.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'script' ? -1 : 1) || ((a.board ?? 1e9) - (b.board ?? 1e9)) || byStr(a.rel, b.rel));
}

// A board text is parsed once per process (keyed by its exact text), and an item's BAR, owned list and
// model need once per (ollama, owns, task): a warm scan reads the files, stats the verdicts, and decides.
// Callers treat what a scan returns as read only.
const PARSE_CACHE = new Map();
const ITEM_CACHE = new Map();

/**
 * Read every board, decide every item.
 * @returns {{at, root, boards: object[], errors: {file, container, line, reason}[], totals: object}}
 */
export function scanBoards({ root = ROOT, from = null, to = null } = {}) {
  const boards = [], errors = [];
  for (const f of listBoardFiles(root)) {
    let text;
    try { text = readFileSync(f.abs, 'utf8'); } catch (e) { errors.push({ file: f.rel, container: null, line: null, reason: 'unreadable: ' + String((e && e.message) || e).split('\n')[0] }); continue; }
    const pk = f.kind + '|' + f.rel + '|' + text;
    let parsed = PARSE_CACHE.get(pk);
    if (!parsed) { parsed = f.kind === 'script' ? parseBoardScript(text, { file: f.rel }) : parseProposedBoard(text, { file: f.rel }); if (PARSE_CACHE.size > 256) PARSE_CACHE.clear(); PARSE_CACHE.set(pk, parsed); }
    const board = f.board ?? parsed.board ?? null;
    if (board !== null && ((from !== null && board < from) || (to !== null && board > to))) continue;
    for (const e of parsed.errors) errors.push({ file: f.rel, ...e });
    const mrel = markerRel(parsed.marker);
    const markerMs = mrel ? mtimeOf(path.join(root, ...mrel.split('/'))) : null;
    const scriptMs = mtimeOf(f.abs);
    const launched = f.kind === 'proposed' ? null : mrel ? markerMs !== null : null;
    const refMs = markerMs !== null ? markerMs : scriptMs;
    const refFrom = markerMs !== null ? 'the launch marker ' + mrel : (f.kind === 'proposed' ? 'the proposed file\'s mtime' : 'the script\'s mtime (' + (mrel ? mrel + ' absent: never launched' : 'no MARKER constant') + ')');
    const items = parsed.items.map((it) => {
      const ik = String(it.ollama) + '|' + it.owns + '|' + it.task;
      let memo = ITEM_CACHE.get(ik);
      if (!memo) { memo = { bar: barOf(it.task, it.owns), nm: needsModelOf(it), files: ownedFiles(it.owns) }; if (ITEM_CACHE.size > 4096) ITEM_CACHE.clear(); ITEM_CACHE.set(ik, memo); }
      const bar = memo.bar;
      const d = decideItem(bar, { root, refMs, refFrom });
      const nm = memo.nm;
      const files = memo.files;
      return {
        ...it, board, id: 'board-' + (board ?? f.rel) + ':' + it.key, source: f.rel, files, bar, needsModel: nm.needsModel, needsModelFrom: nm.from,
        trialBenchExists: bar.trialBench ? existsSync(path.join(root, ...bar.trialBench.split('/'))) : null,
        done: d.done, state: d.state, reason: d.reason + (launched === false && !d.done ? '; the board was never launched (' + mrel + ' absent)' : ''), verdict: d.verdict,
      };
    });
    boards.push({
      board, file: f.rel, kind: f.kind, name: parsed.name, title: parsed.title ?? null, ok: parsed.ok, errors: parsed.errors, containers: parsed.containers,
      marker: mrel ? { rel: mrel, exists: markerMs !== null, at: markerMs !== null ? new Date(markerMs).toISOString() : null } : null,
      launched, ref: { at: refMs !== null ? new Date(refMs).toISOString() : null, from: refFrom },
      items, done: items.filter((x) => x.done).length, undone: items.filter((x) => !x.done).length,
    });
  }
  const all = boards.flatMap((b) => b.items);
  return {
    at: new Date().toISOString(), root, boards, errors,
    totals: { boards: boards.length, parsedOk: boards.filter((b) => b.ok).length, items: all.length, done: all.filter((x) => x.done).length, undone: all.filter((x) => !x.done).length, errors: errors.length },
  };
}

/** One gap line of kind "board item" for an undone item of scanBoards(). */
export function gapLineOf(item) {
  return {
    id: item.id, kind: BOARD_ITEM_KIND, board: item.board, key: item.key, owns: item.owns, brief: item.task,
    verdictFile: item.bar.verdictFile, bar: item.bar.sentence, trial: item.bar.trial, needsModel: item.needsModel, minutes: GAP_MINUTES, files: item.files,
    wave: item.wave, state: item.state, reason: item.reason, verdictFrom: item.bar.verdictFrom, trialFrom: item.bar.trialFrom, trialBench: item.bar.trialBench, trialHint: item.bar.trialHint ?? null,
    trialBenchExists: item.trialBenchExists, needsModelFrom: item.needsModelFrom, source: item.source, author: AUTHOR,
    subsystem: 'board ' + item.board, measured: null, unit: null, distance: null, benchCommand: item.bar.trial, since: item.verdict && item.verdict.at ? item.verdict.at : null,
    better: null, why: 'undone board item (' + item.state + '): ' + item.reason,
  };
}

/** Every undone item as a gap line, smallest owned set first (ties by board, then key). */
export function boardItemLines({ root = ROOT, scan = null, from = null, to = null } = {}) {
  const s = scan || scanBoards({ root, from, to });
  const lines = s.boards.flatMap((b) => b.items.filter((x) => !x.done).map(gapLineOf));
  lines.sort((a, b) => a.files.length - b.files.length || (a.board ?? 0) - (b.board ?? 0) || byStr(a.key, b.key));
  return { lines, scan: s };
}

/** Plain lines for a terminal: per board, done and undone, each undone with its reason. */
export function renderScan(s) {
  const out = [];
  for (const b of s.boards) {
    out.push('board ' + b.board + ' (' + b.file + (b.kind === 'proposed' ? ', proposed' : b.launched === false ? ', never launched: ' + b.marker.rel + ' absent' : b.launched ? ', launched ' + b.marker.at : '') + '): '
      + b.items.length + ' items, done ' + b.done + ', undone ' + b.undone + (b.ok ? '' : ', PARSE ERRORS ' + b.errors.length));
    for (const e of b.errors) out.push('  DOES NOT PARSE ' + (e.container || '-') + (e.line ? ' line ' + e.line : '') + ': ' + e.reason);
    for (const it of b.items) {
      if (it.done) { out.push('  done    ' + it.key.padEnd(10) + ' ' + it.reason); continue; }
      out.push('  UNDONE  ' + it.key.padEnd(10) + ' [' + it.state + '] ' + it.reason + ' | verdict ' + (it.bar.verdictFile || 'none') + ' | trial ' + (it.bar.trial ? it.bar.trial + ' (' + it.bar.trialFrom + (it.trialBenchExists === false ? ', bench file absent' : '') + ')' : 'none found' + (it.bar.trialHint ? ' (hint: the item owns ' + it.bar.trialHint + ', flags unwritten)' : '')) + ' | files ' + it.files.length + ' | needsModel ' + it.needsModel);
    }
  }
  for (const e of s.errors.filter((x) => !s.boards.some((b) => b.file === x.file))) out.push('UNREADABLE ' + e.file + ': ' + e.reason);
  out.push('boards ' + s.totals.boards + ' (' + s.totals.parsedOk + ' parse clean), items ' + s.totals.items + ', done ' + s.totals.done + ', undone ' + s.totals.undone + ', parse errors ' + s.totals.errors);
  return out.join('\n');
}

// ================================================================ CLI (synchronous: no top-level await)
const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const s = scanBoards();
  if (argv.includes('--json')) process.stdout.write(JSON.stringify(s) + '\n');
  else if (argv.includes('--gaps')) for (const l of boardItemLines({ scan: s }).lines) process.stdout.write(JSON.stringify(l) + '\n');
  else process.stdout.write(renderScan(s) + '\n');
}
