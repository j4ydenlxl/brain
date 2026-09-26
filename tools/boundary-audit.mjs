#!/usr/bin/env node
// tools/boundary-audit.mjs: every place a value leaves a thread or a process by structured
// clone (postMessage, workerData, transferList, structuredClone) or by child_process IPC
// (send), found in the source, measured live, and held to an allowlist with its bytes.
//
// A structured clone copies a typed array view TOGETHER WITH ITS WHOLE BUFFER (calibrate()
// below posts an 8192 byte view on a 1 MB buffer and reads back buffer.byteLength 1048576).
// Every hypervector core/simd.mjs makes is an 8192 byte window on one wasm heap (512 MB in
// the main thread), so one view posted unpacked copies the heap. runtime/protocol.mjs
// ownBytes is the fix; this tool finds where it is missing and proves where it is not.
//
//   node tools/boundary-audit.mjs --static                     every boundary: file, line, kind, what crosses
//   node tools/boundary-audit.mjs --drivers                    the drivers the probe runs
//   node tools/boundary-audit.mjs --probe [--label L] [--only a,b]   drivers under the probe, into state/boundary/L
//   node tools/boundary-audit.mjs --print-allowlist [--label L]      the ALLOWLIST block that probe run measured
//   node tools/boundary-audit.mjs --bar                        static + allowlist + probe + touched tests: bench/verdicts/boundary.json
//
// The same file is the probe. Loaded through NODE_OPTIONS=--require with
// BRAIN_BOUNDARY_PROBE_DIR set (--require reaches every worker thread; --import does not), it
// wraps MessagePort.prototype.postMessage, the Worker constructor, WebAssembly.Memory and
// Instance, child_process fork's send, process.send and structuredClone, and appends one
// JSON line per measured message to a file per thread. Its top level imports builtins only
// and has no top level await, so require(esm) can load it.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import v8 from 'node:v8';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire, syncBuiltinESMExports } from 'node:module';

const require = createRequire(import.meta.url);
const wtc = require('node:worker_threads');
const cpm = require('node:child_process');

const SELF = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SELF), '..');
export const CAP_BYTES = 16 * 1024 * 1024;
const PM = 'post' + 'Message';
const ENV = process.env;
const PROBE_DIR = ENV.BRAIN_BOUNDARY_PROBE_DIR || '';
const FAULT = ENV.BRAIN_BOUNDARY_FAULT || '';
const JAIL = ENV.BRAIN_BOUNDARY_JAIL || '';
const toPosix = (p) => p.split(path.sep).join('/');
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 12);
const firstLine = (e) => String((e && e.message) || e).split('\n')[0].slice(0, 200);
const short = (s, n = 110) => { const t = String(s).replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 3) + '...' : t; };
const MB = 1048576;

// ---------------------------------------------------------------- the byte walker
// What a structured clone of `value` copies: every ArrayBuffer backing store reached, once
// each, a view counted as its WHOLE buffer (a window on a larger non-shared buffer copies
// the larger buffer), SharedArrayBuffers and transferred buffers not copied. copied is the
// item's measure and the one the cap is held to. strings and scalars estimate the rest of the
// wire (one byte per Latin-1 char, two otherwise, nine per number): bytes = copied + strings +
// scalars is reported beside it as the wire size (calibrate() checks it against v8.serialize).
export function walkBytes(value, opts = {}) {
  const transfer = new Set();
  for (const t of opts.transfer || []) if (t instanceof ArrayBuffer) transfer.add(t);
  const isWasm = typeof opts.isWasm === 'function' ? opts.isWasm : null;
  const maxNodes = opts.maxNodes || 4e6;
  const hasSab = typeof SharedArrayBuffer !== 'undefined';
  const r = { bytes: 0, copied: 0, strings: 0, scalars: 0, viewOnly: 0, shared: 0, transferred: 0, views: 0, windows: 0, wasmViews: 0, wasmShared: 0, maxBuffer: 0, nodes: 0, truncated: false };
  const seen = new Set(), bufs = new Set();
  const buffer = (b) => {
    if (bufs.has(b)) return;
    bufs.add(b);
    if (hasSab && b instanceof SharedArrayBuffer) { r.shared += b.byteLength; return; }
    if (transfer.has(b)) { r.transferred += b.byteLength; return; }
    r.copied += b.byteLength;
    if (b.byteLength > r.maxBuffer) r.maxBuffer = b.byteLength;
  };
  const str = (s) => { r.strings += 5 + s.length * (/[^\x00-\xff]/.test(s) ? 2 : 1); };
  const stack = [value];
  while (stack.length) {
    const v = stack.pop();
    if (++r.nodes > maxNodes) { r.truncated = true; break; }
    const t = typeof v;
    if (t === 'string') { str(v); continue; }
    if (t === 'number' || t === 'bigint') { r.scalars += 9; continue; }
    if (v === null || v === undefined || t === 'boolean') { r.scalars += 1; continue; }
    if (t !== 'object') continue; // a function or a symbol: the clone throws, nothing crosses
    if (seen.has(v)) { r.scalars += 5; continue; } // a back reference
    seen.add(v);
    if (ArrayBuffer.isView(v)) {
      r.views++;
      r.viewOnly += v.byteLength;
      const b = v.buffer, shared = hasSab && b instanceof SharedArrayBuffer;
      if (!shared && v.byteLength !== b.byteLength) r.windows++;
      if (isWasm && isWasm(b)) { if (shared) r.wasmShared++; else if (!transfer.has(b)) r.wasmViews++; }
      buffer(b);
      continue;
    }
    if (v instanceof ArrayBuffer || (hasSab && v instanceof SharedArrayBuffer)) { buffer(v); continue; }
    if (v instanceof Map) { for (const [k, x] of v) stack.push(k, x); continue; }
    if (v instanceof Set) { for (const x of v) stack.push(x); continue; }
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) stack.push(v[i]); continue; }
    if (v instanceof Date || v instanceof RegExp) { r.scalars += 9; continue; }
    if (v instanceof Error) stack.push(v.message, v.stack);
    for (const k of Object.keys(v)) { str(k); stack.push(v[k]); }
  }
  r.bytes = r.copied + r.strings + r.scalars;
  return r;
}

/** child_process IPC with the default serialization is JSON: a typed array sends its elements only. */
export function measureJson(msg) {
  let s = '';
  try { s = JSON.stringify(msg); } catch { s = ''; }
  const bytes = s === undefined ? 0 : Buffer.byteLength(s);
  return { bytes, copied: 0, strings: bytes, scalars: 0, viewOnly: 0, shared: 0, transferred: 0, views: 0, windows: 0, wasmViews: 0, wasmShared: 0, maxBuffer: 0, nodes: 0, truncated: false, json: true };
}

/**
 * The ruler checked against the real thing: a view on a 1 MB buffer and a view on a 1 MB
 * SharedArrayBuffer go through a MessageChannel and are read back on this thread.
 */
export function calibrate(heapBytes = MB, viewBytes = 8192) {
  const heap = new ArrayBuffer(heapBytes);
  const view = new Int8Array(heap, heapBytes / 2, viewBytes);
  const sab = new SharedArrayBuffer(heapBytes);
  const sview = new Int8Array(sab, 0, viewBytes);
  const predicted = walkBytes({ view }).copied, predictedShared = walkBytes({ sview }).copied;
  const ch = new wtc.MessageChannel();
  ch.port1.postMessage({ view });
  const got = wtc.receiveMessageOnPort(ch.port2).message;
  ch.port1.postMessage({ sview });
  const gotShared = wtc.receiveMessageOnPort(ch.port2).message;
  ch.port1.close(); ch.port2.close();
  // the wire estimate against v8.serialize, on a message of strings and numbers (no buffers)
  const rows = Array.from({ length: 2000 }, (_, i) => ({ id: 'cell-' + i, kind: 'k' + (i % 40), state: { runs: i, last: 'x'.repeat(100 + (i % 300)) }, p: [i, i / 3, true, null] }));
  const wireSample = { type: 'snapshot', t: 1, cells: rows };
  const wireEstimate = walkBytes(wireSample).bytes, wireSerialized = v8.serialize(wireSample).length;
  return {
    wireEstimate, wireSerialized, wireRatio: +(wireEstimate / wireSerialized).toFixed(4),
    viewBytes, heapBytes, predicted, received: got.view.buffer.byteLength, arrivedViewBytes: got.view.byteLength,
    predictedShared, sharedArrived: gotShared.sview.buffer instanceof SharedArrayBuffer,
    owned: walkBytes({ view: view.slice() }).copied,
  };
}

// ---------------------------------------------------------------- the static scan
const REGEX_AFTER_WORD = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await']);
const REGEX_AFTER_PUNCT = new Set(['', '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
const RE_POST = new RegExp('\\b' + PM + '\\s*\\(', 'g');
const RE_WORKER = /\bnew\s+(?:[\w$]+\.)?Worker\s*\(/g;
const RE_SEND = /\.\s*send\s*\(/g;
const RE_CLONE = /\bstructuredClone\s*\(/g;
const RE_ANY = new RegExp('Worker|' + PM + '|send|structuredClone');

/**
 * A JavaScript lexer just good enough to tell code from strings, comments and regular
 * expressions. Returns the source with every non code character blanked (same length, same
 * newlines, so an index is still a line and column) and the string literals' spans.
 */
export function lex(src) {
  const n = src.length, out = src.split('');
  const strings = [], tmpl = [];
  let i = 0, depth = 0, last = '';
  const blank = (a, b) => { for (let k = a; k < b; k++) if (out[k] !== '\n' && out[k] !== '\r') out[k] = ' '; };
  const template = (j) => {
    const s = j;
    while (j < n) {
      const ch = src[j];
      if (ch === '\\') { j += 2; continue; }
      if (ch === '`') { strings.push({ start: s, end: j }); blank(s, j); return j + 1; }
      if (ch === '$' && src[j + 1] === '{') { strings.push({ start: s, end: j }); blank(s, j); tmpl.push(depth); depth++; return j + 2; }
      j++;
    }
    strings.push({ start: s, end: n }); blank(s, n);
    return n;
  };
  while (i < n) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
    if (c === '/' && src[i + 1] === '/') { let j = src.indexOf('\n', i); if (j < 0) j = n; blank(i, j); i = j; continue; }
    if (c === '/' && src[i + 1] === '*') { let j = src.indexOf('*/', i + 2); j = j < 0 ? n : j + 2; blank(i, j); i = j; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < n && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      j = Math.min(j, n);
      strings.push({ start: i + 1, end: j }); blank(i + 1, j);
      i = j + 1; last = 'x';
      continue;
    }
    if (c === '`') { i = template(i + 1); last = 'x'; continue; }
    if (c === '/') {
      if (REGEX_AFTER_PUNCT.has(last) || REGEX_AFTER_WORD.has(last)) {
        let j = i + 1, cls = false;
        while (j < n && src[j] !== '\n') {
          const ch = src[j];
          if (ch === '\\') { j += 2; continue; }
          if (cls) { if (ch === ']') cls = false; } else if (ch === '[') cls = true; else if (ch === '/') break;
          j++;
        }
        blank(i + 1, Math.min(j, n));
        j++;
        while (j < n && /[A-Za-z]/.test(src[j])) j++;
        i = j; last = 'x';
        continue;
      }
      i++; last = '/';
      continue;
    }
    if (/[A-Za-z_$]/.test(c) || c > '\x7f') {
      let j = i + 1;
      while (j < n && (/[\w$]/.test(src[j]) || src[j] > '\x7f')) j++;
      last = src.slice(i, j); i = j;
      continue;
    }
    if (c >= '0' && c <= '9') { let j = i + 1; while (j < n && /[\w.]/.test(src[j])) j++; last = 'x'; i = j; continue; }
    if (c === '{') { depth++; last = '{'; i++; continue; }
    if (c === '}') {
      depth--;
      if (tmpl.length && tmpl[tmpl.length - 1] === depth) { tmpl.pop(); i = template(i + 1); last = 'x'; continue; }
      last = '}'; i++;
      continue;
    }
    if (c === ')' || c === ']') { last = 'x'; i++; continue; }
    last = c; i++;
  }
  return { code: out.join(''), strings };
}

function lineIndex(src) { const a = [0]; for (let k = 0; k < src.length; k++) if (src.charCodeAt(k) === 10) a.push(k + 1); return a; }
function lineOf(starts, idx) { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= idx) lo = mid; else hi = mid - 1; } return lo + 1; }

/** The arguments of the call whose '(' is at `open`, split at top level commas. */
function callArgs(code, src, open) {
  const spans = [];
  let d = 0, start = open + 1, k = open;
  for (; k < code.length; k++) {
    const c = code[k];
    if (c === '(' || c === '[' || c === '{') d++;
    else if (c === ')' || c === ']' || c === '}') { d--; if (d === 0) { spans.push([start, k]); break; } }
    else if (c === ',' && d === 1) { spans.push([start, k]); start = k + 1; }
  }
  const closed = k < code.length;
  if (!closed) spans.push([start, code.length]);
  return { closed, args: spans.map(([a, b]) => ({ a, b, text: src.slice(a, b).trim() })).filter((x) => x.text !== '') };
}

/** The value of key `name` in the object literal spanning [a, b), or null. */
function objectField(code, src, a, b, name) {
  let k = a;
  while (k < b && /\s/.test(code[k])) k++;
  if (code[k] !== '{') return null;
  let d = 0;
  for (let p = k; p < b; p++) {
    const c = code[p];
    if (c === '(' || c === '[' || c === '{') { d++; continue; }
    if (c === ')' || c === ']' || c === '}') { d--; continue; }
    if (d !== 1 || !code.startsWith(name, p) || /[\w$]/.test(code[p - 1] || '') || /[\w$]/.test(code[p + name.length] || '')) continue;
    let back = p - 1;
    while (back > k && /\s/.test(code[back])) back--;
    if (code[back] !== '{' && code[back] !== ',') continue;
    let q = p + name.length;
    while (q < b && /\s/.test(code[q])) q++;
    if (code[q] === ':') {
      const vs = q + 1;
      let e = vs, dd = 0;
      for (; e < b; e++) {
        const ch = code[e];
        if (ch === '(' || ch === '[' || ch === '{') dd++;
        else if (ch === ')' || ch === ']' || ch === '}') { if (dd === 0) break; dd--; }
        else if (ch === ',' && dd === 0) break;
      }
      return { at: p, text: src.slice(vs, e).trim() };
    }
    if (code[q] === ',' || code[q] === '}') return { at: p, text: name };
  }
  return null;
}

function unescapeJs(s) {
  return s.replace(/\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_, e) => {
    if (e.length > 1 && e[0] === 'u') return String.fromCodePoint(parseInt(e[1] === '{' ? e.slice(2, -1) : e.slice(1), 16));
    if (e.length === 3 && e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
    const m = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', v: '\v', 0: '\0' };
    return m[e] !== undefined ? m[e] : e;
  });
}
const normExpr = (s) => String(s).replace(/[\s\\]+/g, '');

/**
 * Every boundary in one source file. kinds: postMessage (arg 0 crosses, arg 1 is the
 * transfer list), workerData (from a `new Worker(` options literal, with its transferList),
 * send (process.send anywhere, x.send in a file that imports child_process),
 * structuredClone. A worker given its source as a string (eval: true) posts from inside a
 * string literal, so postMessage is looked for inside strings too (where: 'string').
 */
export function scanSource(file, src) {
  const out = [];
  if (!RE_ANY.test(src)) return out;
  const { code, strings } = lex(src);
  const starts = lineIndex(src);
  const cpImport = src.includes('child_process');
  const colOf = (idx) => idx - starts[lineOf(starts, idx) - 1] + 1;
  for (const m of code.matchAll(RE_POST)) {
    const at = m.index, { args, closed } = callArgs(code, src, at + m[0].length - 1);
    const line = lineOf(starts, at);
    out.push({ file, kind: 'postMessage', where: 'code', line, callLine: line, col: colOf(at), expr: args[0] ? args[0].text : '', transfer: args[1] ? args[1].text : null, closed });
  }
  for (const m of code.matchAll(RE_WORKER)) {
    const at = m.index, { args } = callArgs(code, src, at + m[0].length - 1);
    const opt = args[1];
    if (!opt) continue;
    const literal = code.slice(opt.a, opt.b).trimStart().startsWith('{');
    const wd = objectField(code, src, opt.a, opt.b, 'workerData');
    const tl = objectField(code, src, opt.a, opt.b, 'transferList');
    if (!wd && literal) continue; // a worker that carries no data
    const callLine = lineOf(starts, at);
    out.push({ file, kind: 'workerData', where: 'code', line: wd ? lineOf(starts, wd.at) : callLine, callLine, col: colOf(at), expr: wd ? wd.text : '(options) ' + opt.text, transfer: tl ? tl.text : null, closed: true });
  }
  for (const m of code.matchAll(RE_SEND)) {
    const at = m.index;
    const recv = /([\w$.\])]+)\s*$/.exec(code.slice(Math.max(0, at - 60), at));
    const isProcess = !!recv && /(^|\.)process$/.test(recv[1]);
    if (!isProcess && !cpImport) continue;
    const sendAt = at + m[0].indexOf('send');
    const { args, closed } = callArgs(code, src, at + m[0].length - 1);
    const line = lineOf(starts, sendAt);
    out.push({ file, kind: 'send', where: 'code', line, callLine: line, col: colOf(sendAt), expr: args[0] ? args[0].text : '', transfer: null, closed });
  }
  for (const m of code.matchAll(RE_CLONE)) {
    const at = m.index, { args, closed } = callArgs(code, src, at + m[0].length - 1);
    const line = lineOf(starts, at);
    out.push({ file, kind: 'structuredClone', where: 'code', line, callLine: line, col: colOf(at), expr: args[0] ? args[0].text : '', transfer: args[1] ? args[1].text : null, closed });
  }
  for (const s of strings) {
    const raw = src.slice(s.start, s.end);
    if (!raw.includes(PM)) continue;
    const text = unescapeJs(raw);
    const inner = lex(text);
    const rawHits = [...text.matchAll(RE_POST)].map((m) => m.index);
    for (const m of inner.code.matchAll(RE_POST)) {
      const { args, closed } = callArgs(inner.code, text, m.index + m[0].length - 1);
      const line = lineOf(starts, s.start);
      out.push({ file, kind: 'postMessage', where: 'string', line, callLine: line, col: colOf(s.start) + m.index, ordinal: rawHits.filter((x) => x < m.index).length, strNorm: normExpr(text), expr: args[0] ? args[0].text : '', transfer: args[1] ? args[1].text : null, closed });
    }
  }
  return out;
}

/** Identity that survives other edits moving the line: file, kind, and what crosses. */
function keyed(list) {
  const seen = new Map();
  for (const b of list) {
    const e = normExpr(b.expr);
    let k = b.file + '|' + b.kind + '|' + (b.where === 'string' ? 'worker-source:' : '') + (e.length > 120 ? e.slice(0, 100) + '~' + sha(e) : e);
    const c = (seen.get(k) || 0) + 1;
    seen.set(k, c);
    if (c > 1) k += '#' + c;
    b.key = k;
  }
  return list;
}

const SKIP_DIRS = new Set(['node_modules', 'organism', 'state', 'docs']);
const SKIP_REL = new Set(['bench/fixtures', 'bench/verdicts']);
/** Every boundary under `root` (the brain by default): .mjs, .cjs and .js files, generated trees skipped. */
export function scanTree(root = ROOT) {
  const found = [];
  const walk = (dir) => {
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    ents.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const e of ents) {
      const abs = path.join(dir, e.name), rel = toPosix(path.relative(root, abs));
      if (e.isDirectory()) { if (!e.name.startsWith('.') && !SKIP_DIRS.has(e.name) && !SKIP_REL.has(rel)) walk(abs); continue; }
      if (!e.isFile() || !/\.(mjs|cjs|js)$/.test(e.name)) continue;
      let src;
      try { src = fs.readFileSync(abs, 'utf8'); } catch { continue; }
      for (const b of scanSource(rel, src)) found.push(b);
    }
  };
  walk(root);
  return keyed(found);
}

/** found against an allowlist: unlisted boundaries fail the gate; stale entries and over cap bytes are reported. */
export function checkAllowlist(found, allow = ALLOWLIST, cap = CAP_BYTES) {
  const have = new Map(allow.map((a) => [a.key, a]));
  const keys = new Set(found.map((b) => b.key));
  return {
    unlisted: found.filter((b) => !have.has(b.key)),
    stale: allow.filter((a) => !keys.has(a.key)),
    overCap: allow.filter((a) => !(Number.isFinite(a.bytes) && a.bytes < cap)),
  };
}

/** A pure literal expression ({ op: 'stop' }) has one value; a boundary no driver reaches is measured from it. */
export function literalValue(expr) {
  const s = String(expr).trim();
  if (!/^[[{]/.test(s) || /[`$()]|\.\.\./.test(s)) return undefined;
  try {
    const j = s.replace(/'([^'\\]*)'/g, (_, x) => JSON.stringify(x)).replace(/([{,]\s*)([A-Za-z_][\w]*)\s*:/g, (_, a, k) => a + JSON.stringify(k) + ':');
    return JSON.parse(j);
  } catch { return undefined; }
}

// ---------------------------------------------------------------- the probe
const INTERNAL_TYPES = new Set(['loadScript', 'stdioPayload', 'stdioWantsMoreData', 'upAndRunning', 'errorMessage', 'couldNotSerializeError']);
const SKIP_FRAME = /__probe|ProbeWorker|ProbeMemory|ProbeInstance/;

/** One V8 stack frame line as { file (repo relative, posix), line, col }, or null. */
export function parseFrame(ln) {
  const s = String(ln).trim();
  if (!s.startsWith('at ')) return null;
  let loc = s.slice(3);
  const par = /\(([^()]*)\)\s*$/.exec(loc);
  if (par) loc = par[1];
  const m = /^(.*):(\d+):(\d+)$/.exec(loc);
  if (!m) return null;
  let file = m[1];
  const line = Number(m[2]), col = Number(m[3]);
  if (file.startsWith('node:') || file === 'native') return { file: 'node:', line, col };
  if (file.startsWith('[worker eval')) return { file: '[worker eval]', line, col };
  if (file.startsWith('[eval') || file.startsWith('evalmachine')) return { file: '[eval]', line, col };
  if (file.startsWith('file://')) { try { file = fileURLToPath(file.split('?')[0].split('#')[0]); } catch { /* keep the URL */ } }
  if (path.isAbsolute(file)) {
    const r = path.relative(ROOT, file);
    file = r.startsWith('..') || path.isAbsolute(r) ? toPosix(file) : toPosix(r);
  }
  return { file, line, col };
}

/** The first frame outside the probe; with needUser, null when that frame is node's own. */
function __probeSite(needUser) {
  const lim = Error.stackTraceLimit;
  Error.stackTraceLimit = 40;
  const o = {};
  Error.captureStackTrace(o);
  Error.stackTraceLimit = lim;
  let first = true;
  for (const ln of String(o.stack || '').split('\n')) {
    if (!/^\s+at /.test(ln) || SKIP_FRAME.test(ln)) continue;
    const f = parseFrame(ln);
    if (!f) continue;
    if (f.file === 'node:') { if (needUser && first) return null; first = false; continue; }
    return f;
  }
  return null;
}

function installProbe() {
  if (globalThis.__boundaryProbe) return;
  const origOpen = fs.openSync, origWrite = fs.writeSync, origMkdir = fs.mkdirSync;
  const P = globalThis.__boundaryProbe = { mems: [], srcs: new Set() };
  try { origMkdir(PROBE_DIR, { recursive: true }); } catch { /* the open below says */ }
  const pid = process.pid, tid = wtc.threadId;
  let fd = -1;
  try { fd = origOpen(path.join(PROBE_DIR, 'p' + pid + '-t' + tid + '.jsonl'), 'a'); } catch { fd = -1; }
  const __probeEmit = (o) => { if (fd >= 0) { try { origWrite(fd, JSON.stringify(o) + '\n'); } catch { /* the disk said no */ } } };
  const __probeErr = (where, e) => __probeEmit({ t: 'probeError', where, error: String((e && e.stack) || e).slice(0, 1500) });
  __probeEmit({ t: 'boot', pid, ppid: process.ppid, tid, main: wtc.isMainThread, argv: process.argv.slice(1, 5).map(String), fault: FAULT || null });

  // wasm memories: every Memory constructed, and every Memory an instance exports
  const OrigMemory = WebAssembly.Memory, OrigInstance = WebAssembly.Instance;
  const track = (m) => { P.mems.push(new WeakRef(m)); };
  class ProbeMemory extends OrigMemory { constructor(d) { super(d); track(this); } }
  class ProbeInstance extends OrigInstance {
    constructor(mod, imp) {
      super(mod, imp);
      try { for (const v of Object.values(this.exports)) if (v instanceof OrigMemory) track(v); } catch { /* no exports */ }
    }
  }
  WebAssembly.Memory = ProbeMemory;
  WebAssembly.Instance = ProbeInstance;
  let wasmBufs = new WeakSet();
  const refresh = () => {
    wasmBufs = new WeakSet();
    P.mems = P.mems.filter((r) => { const m = r.deref(); if (!m) return false; try { wasmBufs.add(m.buffer); } catch { /* detached */ } return true; });
  };
  const isWasm = (b) => wasmBufs.has(b);

  const stats = new Map();
  const __probeRecord = (kind, site, m) => {
    const sk = kind + '|' + site.file + ':' + site.line + ':' + site.col;
    let s = stats.get(sk);
    if (!s) stats.set(sk, (s = { n: 0, max: -1, wasm: 0 }));
    s.n++;
    const worse = m.bytes > s.max;
    if (worse) s.max = m.bytes;
    const wasmNew = m.wasmViews > 0 && s.wasm++ < 16;
    if (s.n <= 32 || worse || wasmNew || (s.n & (s.n - 1)) === 0) __probeEmit({ t: 'msg', pid, tid, kind, site, n: s.n, m });
  };
  const __probeMeasure = (kind, site, value, transfer) => { refresh(); __probeRecord(kind, site, walkBytes(value, { transfer, isWasm })); };

  // 1. every MessagePort post; Worker.prototype.postMessage goes through the worker's public port
  const MP = wtc.MessagePort.prototype, origPost = MP.postMessage;
  MP.postMessage = function __probePost(msg, transfer) {
    try {
      if (!(msg && typeof msg === 'object' && INTERNAL_TYPES.has(msg.type))) {
        const site = __probeSite(false);
        if (site) __probeMeasure('postMessage', site, msg, Array.isArray(transfer) ? transfer : (transfer && Array.isArray(transfer.transfer) ? transfer.transfer : []));
      }
    } catch (e) { __probeErr('post', e); }
    return arguments.length < 2 ? origPost.call(this, msg) : origPost.call(this, msg, transfer);
  };

  // 2. faults, so the error posts of the worker sources run: a task that throws in the worker
  const OrigWorker = wtc.Worker;
  if (FAULT === 'poison') {
    const wp = OrigWorker.prototype.postMessage;
    OrigWorker.prototype.postMessage = function __probePoison(msg, ...rest) {
      if (msg && typeof msg === 'object' && !Array.isArray(msg) && ('task' in msg || 'train' in msg || 'test' in msg)) {
        msg = { ...msg };
        for (const k of ['task', 'train', 'test']) if (k in msg) msg[k] = null;
      }
      return wp.call(this, msg, ...rest);
    };
  }
  const __probeFault = (o) => {
    const wd = o.workerData;
    if (!wd || typeof wd !== 'object') return o;
    if (FAULT === 'url') { // a module URL that does not exist: the worker's boot fails
      const w2 = { ...wd };
      let hit = false;
      for (const k of Object.keys(w2)) if (typeof w2[k] === 'string' && /^file:.*\.[cm]?js$/.test(w2[k])) { w2[k] = 'file:///boundary-probe-missing/x.mjs'; hit = true; }
      return hit ? { ...o, workerData: w2 } : o;
    }
    if (FAULT === 'poison' && 'opts' in wd) return { ...o, workerData: { ...wd, opts: null } };
    return o;
  };

  // 3. the Worker constructor: workerData and its transferList cross here
  class ProbeWorker extends OrigWorker {
    constructor(file, options) {
      let o = options, m = null;
      const site = __probeSite(false);
      try {
        if (o && typeof o === 'object' && FAULT) o = __probeFault(o);
        if (site && o && typeof o === 'object' && 'workerData' in o) { refresh(); m = walkBytes(o.workerData, { transfer: Array.isArray(o.transferList) ? o.transferList : [], isWasm }); }
      } catch (e) { __probeErr('workerData', e); }
      super(file, o);
      try {
        const ev = !!(o && o.eval);
        const h = ev ? sha(String(file)) : null;
        if (ev && !P.srcs.has(h)) { P.srcs.add(h); __probeEmit({ t: 'src', hash: h, text: String(file) }); }
        __probeEmit({ t: 'spawn', pid, tid, child: this.threadId, site, eval: h, file: ev ? null : String(file && file.href ? file.href : file) });
        if (m) __probeRecord('workerData', site, m);
      } catch (e) { __probeErr('spawn', e); }
    }
  }
  wtc.Worker = ProbeWorker;

  // 4. child_process: fork's send (JSON unless serialization is advanced) and process.send
  const origFork = cpm.fork;
  cpm.fork = function __probeFork(...a) {
    const child = origFork.apply(this, a);
    try {
      const opts = a.slice(1).find((x) => x && typeof x === 'object' && !Array.isArray(x)) || {};
      const adv = opts.serialization === 'advanced';
      const orig = child.send;
      if (typeof orig === 'function') {
        child.send = function __probeSend(msg, ...rest) {
          try { const site = __probeSite(true); if (site) { refresh(); __probeRecord('send', site, adv ? walkBytes(msg, { isWasm }) : measureJson(msg)); } } catch (e) { __probeErr('send', e); }
          return orig.call(this, msg, ...rest);
        };
      }
    } catch (e) { __probeErr('fork', e); }
    return child;
  };
  if (typeof process.send === 'function') {
    const ps = process.send, adv = ENV.NODE_CHANNEL_SERIALIZATION_MODE === 'advanced';
    process.send = function __probeProcSend(msg, ...rest) {
      try { const site = __probeSite(true); if (site) { refresh(); __probeRecord('send', site, adv ? walkBytes(msg, { isWasm }) : measureJson(msg)); } } catch (e) { __probeErr('psend', e); }
      return ps.call(process, msg, ...rest);
    };
  }

  // 5. structuredClone
  const origClone = globalThis.structuredClone;
  if (typeof origClone === 'function') {
    globalThis.structuredClone = function __probeClone(v, opt) {
      try { const site = __probeSite(true); if (site) __probeMeasure('structuredClone', site, v, opt && Array.isArray(opt.transfer) ? opt.transfer : []); } catch (e) { __probeErr('clone', e); }
      return arguments.length < 2 ? origClone(v) : origClone(v, opt);
    };
  }
  syncBuiltinESMExports();
  if (JAIL) installJail(JAIL, origMkdir);
}

/**
 * A copy on write overlay for a driver that runs a bench which writes (bench/imagine.mjs has
 * no switch to stop it writing its verdict and state): every write under the brain lands in
 * the jail instead, and a read finds the jail's copy first.
 */
function installJail(jailDir, origMkdir) {
  const J = path.resolve(jailDir), own = [J, path.resolve(PROBE_DIR || J)];
  const origExists = fs.existsSync, origCopy = fs.copyFileSync;
  const map = (p) => {
    let s;
    if (typeof p === 'string') s = p; else if (p instanceof URL) s = fileURLToPath(p); else if (Buffer.isBuffer(p)) s = p.toString(); else return null;
    const abs = path.resolve(s), r = path.relative(ROOT, abs);
    if (!r || r.startsWith('..') || path.isAbsolute(r)) return null;
    for (const d of own) if (abs === d || abs.startsWith(d + path.sep)) return null;
    return path.join(J, r);
  };
  const writesFlag = (f) => (typeof f === 'number' ? (f & (fs.constants.O_WRONLY | fs.constants.O_RDWR | fs.constants.O_CREAT)) !== 0 : typeof f === 'string' && /[wa+]/.test(f));
  const toWrite = (p) => { const q = map(p); if (!q) return p; try { origMkdir(path.dirname(q), { recursive: true }); } catch { /* the call says */ } return q; };
  const toRead = (p) => { const q = map(p); return q && origExists(q) ? q : p; };
  const wrap = (obj, name, how) => {
    const f = obj && obj[name];
    if (typeof f !== 'function') return;
    obj[name] = function __probeJail(p, ...rest) {
      if (how === 'write') return f.call(this, toWrite(p), ...rest);
      if (how === 'open') return f.call(this, writesFlag(rest[0]) ? toWrite(p) : toRead(p), ...rest);
      if (how === 'two') { // rename or copy: the source is read (never moved out of the tree), the destination is written
        const src = toRead(p), dst = toWrite(rest[0]);
        if (name.startsWith('rename') && src === p && map(p)) {
          origCopy(p, dst);
          const cb = rest[rest.length - 1];
          return name.endsWith('Sync') ? undefined : typeof cb === 'function' ? cb(null) : Promise.resolve();
        }
        return f.call(this, src, dst, ...rest.slice(1));
      }
      return f.call(this, toRead(p), ...rest);
    };
  };
  for (const n of ['writeFileSync', 'appendFileSync', 'mkdirSync', 'rmSync', 'unlinkSync', 'rmdirSync', 'truncateSync', 'utimesSync', 'createWriteStream', 'writeFile', 'appendFile', 'mkdir', 'rm', 'unlink', 'rmdir']) wrap(fs, n, 'write');
  for (const n of ['openSync', 'open']) wrap(fs, n, 'open');
  for (const n of ['renameSync', 'copyFileSync', 'rename', 'copyFile']) wrap(fs, n, 'two');
  for (const n of ['readFileSync', 'existsSync', 'statSync', 'lstatSync', 'accessSync', 'createReadStream', 'readFile', 'stat', 'access']) wrap(fs, n, 'read');
  const fp = fs.promises;
  for (const n of ['writeFile', 'appendFile', 'mkdir', 'rm', 'unlink', 'rmdir']) wrap(fp, n, 'write');
  wrap(fp, 'open', 'open');
  for (const n of ['rename', 'copyFile']) wrap(fp, n, 'two');
  for (const n of ['readFile', 'stat', 'access']) wrap(fp, n, 'read');
  syncBuiltinESMExports();
}

// ---------------------------------------------------------------- the drivers
// Each runs in its own node process under the probe, one at a time, at most two workers.
// Test drivers run a test file that reaches boundaries; function drivers reach the ones no
// test does (the grid, imagine and public runners, the live-shards census, the generations
// worker, the self-code worker) and, with a fault, the error posts of the worker sources.
const TEST_DRIVERS = ['code', 'public', 'generations', 'velocity', 'years', 'knowledge', 'native', 'runtime', 'cloud', 'self-code', 'web-daemon', 'multiply'];
export const DRIVERS = [
  ...TEST_DRIVERS.map((t) => ({ name: 'test-' + t, test: 'test/' + t + '.test.mjs' })),
  { name: 'calibrate', fn: 'calibrate' },
  { name: 'act-extra', fn: 'act-extra' },
  { name: 'grid', fn: 'grid' },
  { name: 'grid-url', fn: 'grid-fault', fault: 'url' },
  { name: 'grid-poison', fn: 'grid-fault', fault: 'poison' },
  { name: 'imagine', fn: 'imagine', jail: true },
  { name: 'imagine-url', fn: 'imagine-fault', fault: 'url', jail: true },
  { name: 'imagine-poison', fn: 'imagine-fault', fault: 'poison', jail: true },
  { name: 'public-url', fn: 'public-fault', fault: 'url' },
  { name: 'public-poison', fn: 'public-fault', fault: 'poison' },
  { name: 'live-shards', fn: 'live-shards' },
  // the bench's own default size (node bench/live-shards.mjs asks majors 1000 units 256 first)
  { name: 'live-shards-bench', fn: 'live-shards', env: { BRAIN_BOUNDARY_MAJORS: '1000', BRAIN_BOUNDARY_UNITS: '256' }, timeoutMs: 900000 },
  { name: 'generations-worker', fn: 'generations-worker', state: true },
  { name: 'self-code', fn: 'self-code', state: true },
  { name: 'self-code-url', fn: 'self-code', fault: 'url', state: true },
  { name: 'self-code-poison', fn: 'self-code', fault: 'poison', state: true },
];
const u = (p) => pathToFileURL(path.join(ROOT, p)).href;
const TMP = () => ENV.BRAIN_BOUNDARY_TMP || fs.mkdtempSync(path.join(os.tmpdir(), 'boundary-'));
const expected = (what, e) => console.log('expected failure (' + what + '): ' + firstLine(e));

const DRIVER_FNS = {
  async calibrate() { console.log(JSON.stringify(calibrate())); },
  async 'act-extra'() {
    const A = await import(u('act/run.mjs'));
    // a BigInt argument crosses the clone but not the worker's JSON round trip: the args post
    console.log(JSON.stringify((await A.runCases('function f(x) { return x; }', [{ args: [1n], expected: 1 }], { entry: 'f' })).cases.map((c) => c.error)));
    console.log(JSON.stringify((await A.runCases('this is not javascript (', [{ args: [1], expected: 1 }], { entry: 'f' })).error));
    console.log(JSON.stringify((await A.runCases('function f() { throw new Error("thrown on purpose"); }', [{ args: [], expected: 1 }], { entry: 'f' })).cases.map((c) => c.error)));
    console.log(JSON.stringify(await A.runTests('function f(x) { return x + 1; }', 'assert.equal(f(1), 2);')));
    console.log(JSON.stringify(await A.runTests('function f(x) { return x + 1; }', 'assert.equal(f(1), 3);')));
  },
  async grid() {
    const G = await import(u('bench/grid.mjs'));
    const base = { ...G.parseArgs([]), limit: 3, budgetMs: 600, workers: 2, write: false };
    await G.runGridBench(base);
    const vf = path.join(ROOT, 'bench', 'verdicts', 'grid.json');
    if (fs.existsSync(vf)) {
      const L = await import(u('capability/grid-library.mjs'));
      const lib = L.learnLibrary(L.mergeCorpora(L.corpusFromVerdict(JSON.parse(fs.readFileSync(vf, 'utf8')), { keep: null })), {});
      await G.runGridBench({ ...base, limit: 2, libraryJson: lib, label: 'library' });
    }
  },
  async 'grid-fault'() {
    const G = await import(u('bench/grid.mjs'));
    try { await G.runGridBench({ ...G.parseArgs([]), limit: 1, budgetMs: 300, workers: 1, write: false }); } catch (e) { expected('grid', e); }
  },
  async imagine() {
    const I = await import(u('bench/imagine.mjs'));
    await I.runImagineBench(I.parseArgs(['--limit', '1', '--mine-ms', '300', '--budget-ms', '600', '--imagine-budget', '40', '--no-knowledge', '--quiet', '--workers', '1']));
  },
  async 'imagine-fault'() {
    const I = await import(u('bench/imagine.mjs'));
    try { await I.runImagineBench(I.parseArgs(['--limit', '1', '--mine-ms', '200', '--budget-ms', '300', '--imagine-budget', '20', '--no-knowledge', '--quiet', '--workers', '1'])); } catch (e) { expected('imagine', e); }
  },
  async 'public-fault'() {
    const P = await import(u('bench/public.mjs'));
    const t = P.loadArc()[0];
    try { console.log(JSON.stringify(await P.arcTask(JSON.parse(fs.readFileSync(t.file, 'utf8')), { budgetMs: 500, maxDepth: 1 })).slice(0, 300)); } catch (e) { expected('public', e); }
  },
  async 'live-shards'() {
    const LS = await import(u('bench/live-shards.mjs'));
    const { buildWhole } = await import(u('seeds/whole.mjs'));
    const C = await import(u('runtime/cluster.mjs'));
    const W = await import(u('world/index.mjs'));
    let brain = null;
    try {
      const majors = Number(ENV.BRAIN_BOUNDARY_MAJORS || 8), units = Number(ENV.BRAIN_BOUNDARY_UNITS || 64);
      ({ brain } = buildWhole({ majors, substrateUnits: units, ledger: 'off', name: 'boundary', seed: 'boundary' }));
      console.log('built majors ' + majors + ' units ' + units + ': cells ' + brain.cells.length + ', rss ' + Math.round(process.memoryUsage().rss / 1048576) + ' MB');
      const spec = C.specFromBrain(brain, { modules: [LS.WHOLE_MODULE], name: 'boundary', seed: 'boundary', ledger: 'off' });
      const cen = await LS.census(spec, 20);
      console.log('census: cells ' + cen.runs.length + ' errors ' + cen.errors);
      const c = new C.Cluster(spec, { shards: 2 });
      await c.start();
      await c.tick(10);
      await c.counts();
      await c.snapshot();
      await c.stats();
      try { await c._all('error', () => ({ cmd: 'boundary-probe-unknown' })); } catch (e) { expected('shard', e); }
      try { await c.stats(); } catch (e) { expected('shard deferred', e); }
      try { await c.stop(); } catch (e) { expected('stop', e); }
      for (const w of c.workers || []) { try { await w.terminate(); } catch { /* gone */ } }
    } finally { if (brain) { try { W.closeWorld(brain); } catch { /* nothing open */ } } }
  },
  async 'generations-worker'() {
    const D = await import(u('daemon/run.mjs'));
    const tmp = TMP();
    const g = new D.GenerationsWorker({ dir: path.join(tmp, 'gen'), seed: 'boundary', popSize: 2, ticks: 16, heapMb: 1024 });
    await g.start();
    await g.step();
    await g.call('summary');
    try { await g.call('boundary-probe-unknown'); } catch (e) { expected('op', e); }
    await g.stop();
    // a step before boot: epochs is still null, so the worker's catch posts the error
    const bad = new D.GenerationsWorker({ dir: path.join(tmp, 'gen-bad'), seed: 'boundary', popSize: 2, ticks: 16, heapMb: 512 });
    const call = bad.call;
    bad.call = function (op, args) { return call.call(this, op === 'boot' ? 'step' : op, args); };
    try { await bad.start(); } catch (e) { expected('step before boot', e); } finally { bad.call = call; await bad.stop(); }
  },
  async 'self-code'() {
    const D = await import(u('daemon/run.mjs'));
    const flags = path.join(TMP(), 'flags-none');
    fs.mkdirSync(flags, { recursive: true });
    const said = [];
    const r = await D.live({ majors: 4, substrateUnits: 64, checkpointEvery: 50, loopEvery: 10, suiteTasks: 4, plateauPatience: 1, selfCodeEvery: 100, selfCodeDry: true, selfCodeSources: ['mutants'], selfEvery: 0, name: 'boundary', seed: 'boundary', ticks: 120, ledger: 'off', benchFlagDir: flags, out: (l) => said.push(l) });
    console.log(JSON.stringify(r && r.loop && r.loop.selfCode ? r.loop.selfCode.last : null).slice(0, 400));
  },
};

export async function runDriver(name) {
  const f = DRIVER_FNS[name];
  if (!f) throw new Error('boundary-audit: no driver named ' + name);
  await f();
}

// ---------------------------------------------------------------- the orchestrator
async function waitFreeRam(mb, say) {
  const t0 = Date.now();
  let told = false;
  while (os.freemem() / MB < mb) {
    if (!told) { say('waiting: free RAM ' + Math.round(os.freemem() / MB) + ' MB is under ' + mb + ' MB'); told = true; }
    if (Date.now() - t0 > 30 * 60000) return false;
    await new Promise((r) => setTimeout(r, 10000));
  }
  return true;
}

function tapTallies(text) {
  const t = {};
  for (const k of ['tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo', 'duration_ms']) {
    const m = new RegExp('^# ' + k + ' ([\\d.]+)', 'm').exec(text);
    if (m) t[k] = Number(m[1]);
  }
  return t;
}

function killTree(child) {
  try {
    if (process.platform === 'win32') cpm.spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true });
    else child.kill('SIGKILL');
  } catch { /* already gone */ }
}

/** Run node with args, stdout and stderr to a log file, killed as a tree at the timeout. */
function runNode(args, env, log, timeoutMs) {
  return new Promise((resolve) => {
    fs.mkdirSync(path.dirname(log), { recursive: true });
    const fd = fs.openSync(log, 'w');
    const t0 = Date.now();
    const child = cpm.spawn(process.execPath, args, { cwd: ROOT, env, stdio: ['ignore', fd, fd], windowsHide: true });
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; killTree(child); }, timeoutMs);
    child.on('exit', (code, signal) => { clearTimeout(timer); try { fs.closeSync(fd); } catch { /* closed */ } resolve({ code, signal, timedOut, ms: Date.now() - t0 }); });
    child.on('error', (e) => { clearTimeout(timer); try { fs.closeSync(fd); } catch { /* closed */ } resolve({ code: -1, signal: null, timedOut, ms: Date.now() - t0, error: String(e) }); });
  });
}

function jailWatch() {
  const out = new Map();
  const add = (abs) => { try { const s = fs.statSync(abs); out.set(toPosix(path.relative(ROOT, abs)), s.size + ':' + s.mtimeMs); } catch { /* gone */ } };
  const vd = path.join(ROOT, 'bench', 'verdicts');
  try { for (const f of fs.readdirSync(vd)) if (f.startsWith('imagine')) add(path.join(vd, f)); } catch { /* none */ }
  const walk = (d) => { let es; try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; } for (const e of es) { const a = path.join(d, e.name); if (e.isDirectory()) walk(a); else add(a); } };
  walk(path.join(ROOT, 'state', 'imagine'));
  return out;
}

async function runOneDriver(d, base, say) {
  const dir = path.join(base, 'probe', d.name), tmp = path.join(base, 'tmp', d.name), log = path.join(base, 'logs', d.name + '.log');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(tmp, { recursive: true });
  if (!(await waitFreeRam(16384, say))) return { name: d.name, skipped: 'free RAM stayed under 16384 MB for 30 minutes' };
  const env = { ...ENV };
  for (const k of ['BRAIN_BOUNDARY_FAULT', 'BRAIN_BOUNDARY_JAIL']) delete env[k];
  const req = /\s/.test(SELF) ? JSON.stringify(SELF) : SELF;
  Object.assign(env, { BRAIN_BOUNDARY_PROBE_DIR: dir, BRAIN_BOUNDARY_TMP: tmp, BRAIN_BOUNDARY_DRIVER: d.name, NODE_OPTIONS: ((ENV.NODE_OPTIONS || '') + ' --require ' + req).trim() });
  if (d.fault) env.BRAIN_BOUNDARY_FAULT = d.fault;
  if (d.jail) env.BRAIN_BOUNDARY_JAIL = path.join(tmp, 'jail');
  if (d.state) env.BRAIN_STATE_DIR = path.join(tmp, 'state');
  if (d.env) Object.assign(env, d.env);
  const args = d.test
    ? ['--max-old-space-size=4096', '--test', '--test-concurrency=1', '--test-reporter=tap', d.test]
    : ['--max-old-space-size=4096', SELF, '--run-driver', d.fn]; // a file, not -e: --input-type would be inherited by eval workers
  const before = d.jail ? jailWatch() : null;
  const r = await runNode(args, env, log, d.timeoutMs || 300000);
  const row = { name: d.name, fault: d.fault || null, code: r.code, timedOut: r.timedOut, ms: r.ms, log: toPosix(path.relative(ROOT, log)) };
  if (d.test) row.tests = tapTallies(fs.readFileSync(log, 'utf8'));
  if (d.jail) {
    const after = jailWatch(), changed = [];
    for (const [k, v] of after) if (before.get(k) !== v) changed.push(k);
    for (const k of before.keys()) if (!after.has(k)) changed.push(k);
    row.jailLeaks = changed;
  }
  say('driver ' + d.name + ': exit ' + r.code + (r.timedOut ? ' TIMED OUT' : '') + ' in ' + (r.ms / 1000).toFixed(1) + ' s' + (row.tests ? ', tests ' + row.tests.tests + ' pass ' + row.tests.pass + ' fail ' + row.tests.fail : '') + (row.jailLeaks && row.jailLeaks.length ? ', JAIL LEAKED ' + row.jailLeaks.join(' ') : ''));
  return row;
}

/** Every JSONL line the probe wrote under dir/<driver>/. */
export function loadProbe(dir) {
  const P = { spawns: new Map(), srcs: new Map(), msgs: [], errors: [], boots: 0 };
  let drivers = [];
  try { drivers = fs.readdirSync(dir); } catch { return P; }
  for (const d of drivers) {
    let files = [];
    try { files = fs.readdirSync(path.join(dir, d)).filter((f) => f.endsWith('.jsonl')); } catch { continue; }
    for (const f of files) {
      for (const line of fs.readFileSync(path.join(dir, d, f), 'utf8').split('\n')) {
        if (!line) continue;
        let o;
        try { o = JSON.parse(line); } catch { continue; }
        if (o.t === 'boot') P.boots++;
        else if (o.t === 'src') P.srcs.set(o.hash, o.text);
        else if (o.t === 'spawn') P.spawns.set(d + ':' + o.pid + ':' + o.child, o);
        else if (o.t === 'msg') { o.driver = d; P.msgs.push(o); }
        else if (o.t === 'probeError') P.errors.push({ driver: d, where: o.where, error: String(o.error).split('\n')[0] });
      }
    }
  }
  return P;
}

/** The static boundary a measured message came from. */
function attribute(msg, byFile, P) {
  const s = msg.site;
  if (!s) return null;
  if (s.file === '[worker eval]') {
    const sp = P.spawns.get(msg.driver + ':' + msg.pid + ':' + msg.tid);
    const text = sp && sp.eval ? P.srcs.get(sp.eval) : null;
    if (text == null) return null;
    const lineText = text.split('\n')[s.line - 1];
    if (lineText == null) return null;
    const ord = [...lineText.matchAll(RE_POST)].filter((m) => m.index < s.col - 1).length;
    const nt = normExpr(lineText);
    const pick = (list) => list.filter((b) => b.where === 'string' && b.kind === msg.kind && b.strNorm === nt);
    let c = pick(byFile.get(sp.site && sp.site.file) || []);
    if (!c.length) c = [...byFile.values()].flatMap(pick);
    return c.find((b) => b.ordinal === ord) || c[0] || null;
  }
  let best = null, bd = Infinity;
  for (const b of byFile.get(s.file) || []) {
    if (b.kind !== msg.kind || b.where !== 'code') continue;
    const d = Math.abs(b.callLine - s.line) * 10000 + Math.abs((b.col || 0) - s.col);
    if (d < bd) { bd = d; best = b; }
  }
  return best && Math.abs(best.callLine - s.line) <= 3 ? best : null;
}

/** One row per static boundary: messages seen, the largest, wasm views; plus measured sites no boundary claims. */
export function aggregate(statics, P) {
  const byFile = new Map();
  for (const b of statics) { if (!byFile.has(b.file)) byFile.set(b.file, []); byFile.get(b.file).push(b); }
  const rows = new Map(statics.map((b) => [b.key, { key: b.key, file: b.file, line: b.line, kind: b.kind, where: b.where, expr: short(b.expr, 160), transfer: b.transfer ? short(b.transfer, 80) : null, how: 'unexercised', messages: 0, bytes: null, copied: null, strings: null, wasmViews: 0, windows: 0, maxBuffer: 0, drivers: new Set(), worstDriver: null }]));
  const counts = new Map(), orphans = new Map();
  for (const m of P.msgs) {
    const b = attribute(m, byFile, P);
    if (!b) {
      const ok = m.kind + ' ' + (m.site ? m.site.file + ':' + m.site.line : '?');
      const o = orphans.get(ok) || { site: ok, messages: 0, bytes: 0, drivers: new Set() };
      o.messages = Math.max(o.messages, m.n); o.bytes = Math.max(o.bytes, m.m.bytes); o.drivers.add(m.driver);
      orphans.set(ok, o);
      continue;
    }
    const r = rows.get(b.key);
    // the probe numbers each site's messages per thread: the largest n seen is that thread's count
    const sk = b.key + '\u0000' + m.driver + ':' + m.pid + ':' + m.tid + ':' + JSON.stringify(m.site);
    const c = counts.get(sk);
    if (!c) counts.set(sk, { key: b.key, n: m.n }); else if (m.n > c.n) c.n = m.n;
    r.how = 'probe';
    if (r.bytes === null || m.m.bytes > r.bytes) { r.bytes = m.m.bytes; r.copied = m.m.copied; r.strings = m.m.strings; r.worstDriver = m.driver; r.maxBuffer = m.m.maxBuffer; }
    if (m.m.wasmViews > 0) r.wasmViews = Math.max(r.wasmViews, m.m.wasmViews);
    r.windows = Math.max(r.windows, m.m.windows);
    r.drivers.add(m.driver);
  }
  for (const c of counts.values()) rows.get(c.key).messages += c.n;
  for (const b of statics) {
    const r = rows.get(b.key);
    if (r.how !== 'unexercised') continue;
    const v = literalValue(b.expr);
    if (v === undefined) continue;
    const mm = b.kind === 'send' ? measureJson(v) : walkBytes(v);
    Object.assign(r, { how: 'literal', bytes: mm.bytes, copied: mm.copied, strings: mm.strings });
  }
  return {
    rows: [...rows.values()].map((r) => ({ ...r, drivers: [...r.drivers].sort() })),
    orphans: [...orphans.values()].map((o) => ({ ...o, drivers: [...o.drivers].sort() })),
  };
}

function summarize(agg, cap = CAP_BYTES) {
  const rows = agg.rows;
  const over = rows.filter((r) => r.copied !== null && r.copied >= cap);
  const overWire = rows.filter((r) => r.bytes !== null && r.bytes >= cap);
  const wasm = rows.filter((r) => r.wasmViews > 0);
  const unex = rows.filter((r) => r.how === 'unexercised');
  const measured = rows.filter((r) => r.bytes !== null);
  const largest = [...measured].sort((a, b) => b.copied - a.copied || b.bytes - a.bytes)[0] || null;
  const largestWire = [...measured].sort((a, b) => b.bytes - a.bytes)[0] || null;
  const at = (r) => (r ? { key: r.key, file: r.file, line: r.line, copied: r.copied, bytes: r.bytes, driver: r.worstDriver } : null);
  const treeOrphans = agg.orphans.filter((o) => !/\[eval\]|node:|\?/.test(o.site));
  return { boundaries: rows.length, probe: rows.filter((r) => r.how === 'probe').length, literal: rows.filter((r) => r.how === 'literal').length, unexercised: unex.length, overCap: over.length, overCapWire: overWire.length, overCapWireRows: overWire.map(at), wasmViewRows: wasm.length, orphans: treeOrphans.length, largest: at(largest), largestWire: at(largestWire), messages: rows.reduce((a, r) => a + r.messages, 0) };
}

async function probeRun(label, only, say) {
  const base = path.join(ROOT, 'state', 'boundary', label);
  for (const d of ['probe', 'logs', 'tmp']) fs.rmSync(path.join(base, d), { recursive: true, force: true });
  fs.mkdirSync(base, { recursive: true });
  const statics = scanTree();
  const list = only ? DRIVERS.filter((d) => only.includes(d.name)) : DRIVERS;
  say('probe ' + label + ': ' + statics.length + ' static boundaries, ' + list.length + ' drivers, one at a time');
  const drivers = [];
  for (const d of list) drivers.push(await runOneDriver(d, base, say));
  const P = loadProbe(path.join(base, 'probe'));
  const agg = aggregate(statics, P);
  const sum = summarize(agg);
  const result = { at: new Date().toISOString(), label, node: process.version, cap: CAP_BYTES, summary: sum, drivers, probe: { boots: P.boots, measured: P.msgs.length, errors: P.errors.slice(0, 40) }, rows: agg.rows, orphans: agg.orphans };
  fs.writeFileSync(path.join(base, 'result.json'), JSON.stringify(result, null, 1) + '\n');
  return result;
}

function printRows(rows, say, cap = CAP_BYTES) {
  for (const r of rows) {
    const flag = r.how === 'unexercised' ? 'UNEXERCISED' : (r.copied >= cap ? 'OVER CAP' : '') + (r.bytes >= cap ? ' OVER CAP ON THE WIRE' : '') + (r.wasmViews > 0 ? ' WASM VIEW' : '');
    say((flag ? flag.trim() + ' ' : '') + r.file + ':' + r.line + ' ' + r.kind + (r.where === 'string' ? ' (worker source)' : '') + ' ' + short(r.expr, 70) + ' | ' + r.how + ' msgs ' + r.messages + ' copied ' + r.copied + ' B wire ' + r.bytes + ' B wasm ' + r.wasmViews + (r.drivers.length ? ' via ' + r.drivers.slice(0, 3).join(',') : ''));
  }
}

function allowlistText(rows) {
  const lines = rows.filter((r) => r.bytes !== null).map((r) => '  { key: ' + JSON.stringify(r.key) + ', bytes: ' + r.copied + ', wire: ' + r.bytes + ', how: ' + JSON.stringify(r.how) + ' },');
  return 'export const ALLOWLIST = [\n' + lines.join('\n') + '\n];';
}

/** The tests that import a touched file, by module path, plus this tool's own test. */
function testsOf(files) {
  const out = new Set(['test/boundary.test.mjs']);
  const tdir = path.join(ROOT, 'test');
  for (const t of fs.readdirSync(tdir).filter((f) => f.endsWith('.test.mjs'))) {
    const src = fs.readFileSync(path.join(tdir, t), 'utf8');
    for (const f of files) {
      const spec = '../' + f;
      if (src.includes("'" + spec + "'") || src.includes('"' + spec + '"')) out.add('test/' + t);
    }
  }
  return [...out].sort();
}

async function bar(say) {
  const at = new Date().toISOString();
  const statics = scanTree();
  const allow = checkAllowlist(statics);
  const cal = calibrate();
  say('boundary bar: ' + statics.length + ' boundaries in ' + new Set(statics.map((b) => b.file)).size + ' files (' + ['postMessage', 'workerData', 'send', 'structuredClone'].map((k) => k + ' ' + statics.filter((b) => b.kind === k).length).join(', ') + ')');
  say('calibrate: an ' + cal.viewBytes + ' byte view on a ' + cal.heapBytes + ' byte buffer: walker ' + cal.predicted + ' B, the clone delivered ' + cal.received + ' B; shared ' + cal.predictedShared + ' B, arrived shared ' + cal.sharedArrived + '; wire estimate ' + cal.wireEstimate + ' B vs v8.serialize ' + cal.wireSerialized + ' B (ratio ' + cal.wireRatio + ')');
  const res = await probeRun('after', null, say);
  const beforeFile = path.join(ROOT, 'bench', 'verdicts', 'boundary-before.json');
  const before = fs.existsSync(beforeFile) ? JSON.parse(fs.readFileSync(beforeFile, 'utf8')) : null;
  const beforeRows = before ? before.rows : [];
  const bmap = new Map(beforeRows.map((r) => [r.key, r]));
  const afterKeys = new Set(res.rows.map((r) => r.key));
  const used = new Set();
  const joinBefore = (r) => {
    let b = bmap.get(r.key) || bmap.get(RENAMED[r.key]) || null;
    if (!b) { // a key that changed with its expression: the nearest vanished key of the same file and kind
      let bd = Infinity;
      for (const x of beforeRows) {
        if (x.file !== r.file || x.kind !== r.kind || used.has(x.key) || afterKeys.has(x.key)) continue;
        const d = Math.abs(x.line - r.line);
        if (d < bd && d <= 20) { bd = d; b = x; }
      }
    }
    if (b) used.add(b.key);
    return b;
  };
  const table = res.rows.map((r) => {
    const b = joinBefore(r);
    const failedBefore = !!b && (b.copied >= CAP_BYTES || b.wasmViews > 0);
    const passAfter = r.how !== 'unexercised' && r.copied < CAP_BYTES && r.wasmViews === 0;
    return { key: r.key, file: r.file, line: r.line, kind: r.kind, where: r.where, expr: r.expr, transfer: r.transfer, how: r.how, messages: r.messages, beforeBytes: b ? b.copied : null, beforeWire: b ? b.bytes : null, beforeWasmViews: b ? b.wasmViews : null, afterBytes: r.copied, afterWire: r.bytes, afterWasmViews: r.wasmViews, underCap: passAfter, wireUnderCap: r.bytes !== null && r.bytes < CAP_BYTES, fixed: failedBefore && passAfter, worstDriver: r.worstDriver, drivers: r.drivers };
  });
  const sum = res.summary;
  const beforeSum = before ? before.summary : null;
  const lg = (x, k) => (x ? x[k] + ' B at ' + x.file + ':' + x.line : 'none');
  say('before: over cap ' + (beforeSum ? beforeSum.overCap : 'n/a') + ', rows with a wasm view ' + (beforeSum ? beforeSum.wasmViewRows : 'n/a') + ', largest copied ' + lg(beforeSum && beforeSum.largest, 'copied') + ', over cap on the wire ' + (beforeSum ? beforeSum.overCapWire : 'n/a'));
  say('after: over cap ' + sum.overCap + ', rows with a wasm view ' + sum.wasmViewRows + ', unexercised ' + sum.unexercised + ', measured by probe ' + sum.probe + ', by literal ' + sum.literal + ', orphan sites ' + sum.orphans + ', largest copied ' + lg(sum.largest, 'copied'));
  say('the wire (strings included, reported, not the cap measure): over cap ' + sum.overCapWire + ', largest ' + lg(sum.largestWire, 'bytes') + (sum.largestWire ? ' via ' + sum.largestWire.driver : ''));
  const fixedRows = table.filter((r) => r.fixed);
  for (const r of fixedRows) say('fixed: ' + r.file + ':' + r.line + ' ' + r.kind + ' copied ' + r.beforeBytes + ' B (wasm views ' + r.beforeWasmViews + ') to ' + r.afterBytes + ' B (wasm views ' + r.afterWasmViews + ')');
  printRows(res.rows.filter((r) => r.how === 'unexercised' || r.copied >= CAP_BYTES || r.bytes >= CAP_BYTES || r.wasmViews > 0), say);
  say('allowlist: ' + ALLOWLIST.length + ' listed, unlisted ' + allow.unlisted.length + ', stale ' + allow.stale.length + ', over cap ' + allow.overCap.length);
  for (const b of allow.unlisted) say('  unlisted ' + b.file + ':' + b.line + ' ' + b.kind + ' ' + short(b.expr, 80));
  // the touched files' tests, run plainly (no probe)
  const tests = [];
  for (const t of testsOf(TOUCHED)) {
    if (!(await waitFreeRam(16384, say))) { tests.push({ test: t, skipped: 'free RAM' }); continue; }
    const log = path.join(ROOT, 'state', 'boundary', 'after', 'logs', 'touched-' + path.basename(t) + '.log');
    const r = await runNode(['--test', '--test-concurrency=1', '--test-reporter=tap', t], ENV, log, 600000);
    const tal = tapTallies(fs.readFileSync(log, 'utf8'));
    tests.push({ test: t, code: r.code, timedOut: r.timedOut, ms: r.ms, ...tal });
    say('node --test ' + t + ': tests ' + tal.tests + ' pass ' + tal.pass + ' fail ' + tal.fail + ' cancelled ' + (tal.cancelled || 0) + ' (exit ' + r.code + ', ' + (r.ms / 1000).toFixed(1) + ' s)');
  }
  const leaks = res.drivers.flatMap((d) => d.jailLeaks || []);
  const incomplete = res.drivers.filter((d) => d.skipped || d.timedOut);
  const testsPass = tests.every((t) => t.code === 0 && t.fail === 0 && !t.skipped);
  const barMet = sum.overCap === 0 && sum.wasmViewRows === 0 && sum.unexercised === 0 && sum.orphans === 0 && allow.unlisted.length === 0 && allow.stale.length === 0 && allow.overCap.length === 0 && testsPass && leaks.length === 0 && cal.received === cal.predicted;
  const isTheBar = incomplete.length === 0;
  const kinds = ['postMessage', 'workerData', 'send', 'structuredClone'].map((k) => statics.filter((b) => b.kind === k).length + ' ' + k).join(', ');
  const statement = 'tools/boundary-audit.mjs found ' + statics.length + ' boundaries by static scan (' + kinds + ') and ran ' + res.drivers.length + ' drivers under the preload probe, which wrote ' + res.probe.measured + ' message records; '
    + sum.probe + ' boundaries were measured live, ' + sum.literal + ' from their literal value, ' + sum.unexercised + ' not at all. Before the fix '
    + (beforeSum ? beforeSum.overCap + ' boundaries carried a message whose copied buffers reached the ' + CAP_BYTES + ' byte cap and ' + beforeSum.wasmViewRows + ' carried a view on a wasm heap' + (beforeSum.largest ? ' (largest copied ' + beforeSum.largest.copied + ' bytes at ' + beforeSum.largest.file + ':' + beforeSum.largest.line + ')' : '') : 'no before run was recorded')
    + '; after it ' + sum.overCap + ' and ' + sum.wasmViewRows + (sum.largest ? ', the largest copied ' + sum.largest.copied + ' bytes at ' + sum.largest.file + ':' + sum.largest.line : '') + '. Fixed: ' + fixedRows.length
    + '. On the wire (strings included; reported, not the cap measure) ' + sum.overCapWire + ' boundaries reached the cap' + (sum.largestWire ? ', the largest ' + sum.largestWire.bytes + ' bytes at ' + sum.largestWire.file + ':' + sum.largestWire.line + ' via driver ' + sum.largestWire.driver : '') + ', and the wire estimate read ' + cal.wireRatio + ' of v8.serialize on a sample'
    + '. The allowlist lists ' + ALLOWLIST.length + ' boundaries (unlisted ' + allow.unlisted.length + ', stale ' + allow.stale.length + '). Touched tests: ' + tests.map((t) => t.test + ' ' + t.pass + '/' + t.tests).join(', ')
    + '. calibrate: the clone delivered ' + cal.received + ' bytes for an ' + cal.viewBytes + ' byte view, the walker said ' + cal.predicted + '.';
  const verdict = { at, command: BAR_COMMAND, node: process.version, isTheBar, barMet, statement, cap: CAP_BYTES, calibrate: cal, summary: { static: statics.length, ...sum, fixed: fixedRows.length, before: beforeSum }, allowlist: { listed: ALLOWLIST.length, unlisted: allow.unlisted.map((b) => b.key), stale: allow.stale.map((a) => a.key), overCap: allow.overCap.map((a) => a.key) }, touched: TOUCHED, tests, drivers: res.drivers, jailLeaks: leaks, incomplete: incomplete.map((d) => d.name), probeErrors: res.probe.errors, orphans: res.orphans, table };
  const out = path.join(ROOT, 'bench', 'verdicts', isTheBar ? 'boundary.json' : 'boundary-partial.json');
  fs.writeFileSync(out, JSON.stringify(verdict, null, 1) + '\n');
  say('barMet ' + barMet + ' (isTheBar ' + isTheBar + '); verdict ' + toPosix(path.relative(ROOT, out)));
  return barMet ? 0 : 1;
}

async function main(argv) {
  const say = (s) => console.log(s);
  const val = (f, d) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
  if (argv.includes('--static')) {
    const found = scanTree();
    for (const b of found) say(b.file + ':' + b.line + ' ' + b.kind + (b.where === 'string' ? ' (worker source)' : '') + ' ' + short(b.expr) + (b.transfer ? ' | transfer ' + short(b.transfer, 60) : '') + (b.closed ? '' : ' | UNCLOSED'));
    const chk = checkAllowlist(found);
    say(found.length + ' boundaries in ' + new Set(found.map((b) => b.file)).size + ' files: ' + ['postMessage', 'workerData', 'send', 'structuredClone'].map((k) => k + ' ' + found.filter((b) => b.kind === k).length).join(', ') + ' (worker sources ' + found.filter((b) => b.where === 'string').length + '); allowlist unlisted ' + chk.unlisted.length + ', stale ' + chk.stale.length);
    return 0;
  }
  if (argv.includes('--drivers')) { for (const d of DRIVERS) say(d.name + (d.test ? ' ' + d.test : ' fn ' + d.fn) + (d.fault ? ' fault ' + d.fault : '') + (d.jail ? ' jail' : '')); return 0; }
  if (argv.includes('--print-allowlist')) {
    const res = JSON.parse(fs.readFileSync(path.join(ROOT, 'state', 'boundary', val('--label', 'after'), 'result.json'), 'utf8'));
    say(allowlistText(res.rows));
    return 0;
  }
  if (argv.includes('--probe')) {
    const label = val('--label', 'probe');
    const onlyArg = val('--only', null);
    const res = await probeRun(label, onlyArg ? onlyArg.split(',') : null, say);
    printRows(res.rows.filter((r) => r.how === 'unexercised' || r.copied >= CAP_BYTES || r.bytes >= CAP_BYTES || r.wasmViews > 0), say);
    for (const o of res.orphans) say('ORPHAN ' + o.site + ' msgs ' + o.messages + ' max ' + o.bytes + ' B via ' + o.drivers.join(','));
    for (const e of res.probe.errors.slice(0, 10)) say('probe error in ' + e.driver + ' (' + e.where + '): ' + e.error);
    const s = res.summary;
    say('probe ' + label + ': ' + s.boundaries + ' boundaries, measured live ' + s.probe + ', literal ' + s.literal + ', unexercised ' + s.unexercised + ', over cap ' + s.overCap + ' (on the wire ' + s.overCapWire + '), rows with a wasm view ' + s.wasmViewRows + ', orphan sites ' + s.orphans + ', message records ' + res.probe.measured + (s.largest ? ', largest copied ' + s.largest.copied + ' B at ' + s.largest.file + ':' + s.largest.line : '') + (s.largestWire ? ', largest on the wire ' + s.largestWire.bytes + ' B at ' + s.largestWire.file + ':' + s.largestWire.line : ''));
    if (label === 'before' && !onlyArg) {
      const out = path.join(ROOT, 'bench', 'verdicts', 'boundary-before.json');
      fs.writeFileSync(out, JSON.stringify({ at: res.at, command: 'node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/boundary --record state/boundary/budget-before.json --wait-free-ram-mb 16384 -- node --max-old-space-size=6000 tools/boundary-audit.mjs --probe --label before', node: res.node, isTheBar: false, note: 'the probe on the tree before any fix; the bar joins its rows by key', summary: s, drivers: res.drivers, rows: res.rows, orphans: res.orphans }, null, 1) + '\n');
      say('wrote ' + toPosix(path.relative(ROOT, out)));
    }
    return 0;
  }
  if (argv.includes('--bar')) return bar(say);
  say('usage: node tools/boundary-audit.mjs --static | --drivers | --probe [--label L] [--only a,b] | --print-allowlist [--label L] | --bar');
  return 2;
}

// ---------------------------------------------------------------- the record
export const BAR_COMMAND = 'node tools/budget.mjs --ram-mb 6000 --disk-mb 2000 --dir state/boundary --record state/boundary/budget-bar.json --wait-free-ram-mb 16384 -- node --max-old-space-size=6000 tools/boundary-audit.mjs --bar';
/** The files this item changed at their crossing lines; their tests are re-run by --bar. */
export const TOUCHED = [];
/** A fixed boundary's key changes with its expression: after key to before key. */
export const RENAMED = {};
/** Every boundary in the tree, with the largest message the probe measured (bytes). */
export const ALLOWLIST = [
  { key: "act/run.mjs|postMessage|{type:'case',args:kase&&kase.args!==undefined?kase.args:[],expected:kase?kase.expected:undefined}", bytes: 0, wire: 176, how: "probe" },
  { key: "act/run.mjs|workerData|{code:String(code??''),entry:entry&&IDENT.test(entry)?entry:null,keep:KEEP}", bytes: 0, wire: 357, how: "probe" },
  { key: "act/run.mjs|workerData|{code:String(code??''),tests:String(testsSource??''),prelude:TEST_PRELUDE,prune:PRUNE_SRC,keep:KEEP,}", bytes: 0, wire: 2784, how: "probe" },
  { key: "act/run.mjs|postMessage|worker-source:{type:\"result\",ok:false,got:null,ms:0,error:setupError,setup:true}", bytes: 0, wire: 118, how: "probe" },
  { key: "act/run.mjs|postMessage|worker-source:{type:\"result\",ok:false,got:null,ms:performance.now()-started,error:describe(e),setup:false}", bytes: 0, wire: 127, how: "probe" },
  { key: "act/run.mjs|postMessage|worker-source:{type:\"result\",ok:false,got:null,ms,error:err,setup:false}", bytes: 0, wire: 146, how: "probe" },
  { key: "act/run.mjs|postMessage|worker-source:{type:\"result\",ok,got:rendered,ms,error:cmpError,setup:false}", bytes: 0, wire: 266, how: "probe" },
  { key: "act/run.mjs|postMessage|worker-source:{passed:true,error:null,stage:\"tests\",ms:performance.now()-started}", bytes: 0, wire: 59, how: "probe" },
  { key: "act/run.mjs|postMessage|worker-source:{passed:false,error:describe(e),stage,ms:performance.now()-started}", bytes: 0, wire: 175, how: "probe" },
  { key: "bench/cloud-host.mjs|send|{op:'stop'}", bytes: 0, wire: 13, how: "literal" },
  { key: "bench/cloud.mjs|send|{op:'stop'}", bytes: 0, wire: 13, how: "literal" },
  { key: "bench/grid.mjs|postMessage|{id,task}", bytes: 0, wire: 20622, how: "probe" },
  { key: "bench/grid.mjs|workerData|{searchUrl:pathToFileURL(path.join(ROOT,'capability','grid-search.mjs')).href,budgetMs:cfg.budgetMs,~420d5966c479", bytes: 0, wire: 11519, how: "probe" },
  { key: "bench/grid.mjs|postMessage|worker-source:{type:\"ready\",macros:library?library.macros.length:0}", bytes: 0, wire: 39, how: "probe" },
  { key: "bench/grid.mjs|postMessage|worker-source:{type:\"bootFailed\",error:String(e&&e.stack||e)}", bytes: 0, wire: 781, how: "probe" },
  { key: "bench/grid.mjs|postMessage|worker-source:{type:\"done\",id:msg.id,wallMs:performance.now()-t0,r:{status:r.status,solved:r.solved,solvedFirst:r.~72a687c3165e", bytes: 0, wire: 423, how: "probe" },
  { key: "bench/grid.mjs|postMessage|worker-source:{type:\"done\",id:msg.id,wallMs:performance.now()-t0,r:{status:\"error\",solved:false,error:String(e&&e.message||e)}}", bytes: 0, wire: 160, how: "probe" },
  { key: "bench/imagine.mjs|postMessage|msg", bytes: 0, wire: 1910, how: "probe" },
  { key: "bench/imagine.mjs|workerData|{inventUrl:pathToFileURL(path.join(ROOT,'capability','grid-invent.mjs')).href,libraries}", bytes: 0, wire: 93041, how: "probe" },
  { key: "bench/imagine.mjs|postMessage|worker-source:{type:\"ready\"}", bytes: 0, wire: 19, how: "probe" },
  { key: "bench/imagine.mjs|postMessage|worker-source:{type:\"bootFailed\",error:String(e&&e.stack||e)}", bytes: 0, wire: 781, how: "probe" },
  { key: "bench/imagine.mjs|postMessage|worker-source:{type:\"done\",id:msg.id,wallMs:performance.now()-t0,r:{status:r.status,mined:r.mined||[],baseline:r.baseline}}", bytes: 0, wire: 434, how: "probe" },
  { key: "bench/imagine.mjs|postMessage|worker-source:{type:\"done\",id:msg.id,wallMs:performance.now()-t0,r:{status:r.status,solved:r.solved,names:r.names,~d0b942e54d00", bytes: 0, wire: 365, how: "probe" },
  { key: "bench/imagine.mjs|postMessage|worker-source:{type:\"done\",id:msg.id,wallMs:performance.now()-t0,r:{status:\"error\",solved:false,error:String(e&&e.stack||e)}}", bytes: 0, wire: 513, how: "probe" },
  { key: "bench/live-shards.mjs|postMessage|{type:'census',runs,fired,errors:b.stats.errors,ticks:workerData.ticks|0,why:[...why.values()],}", bytes: 64616, wire: 65529, how: "probe" },
  { key: "bench/live-shards.mjs|workerData|{liveShardsCensus:true,spec,ticks}", bytes: 0, wire: 13892718, how: "probe" },
  { key: "bench/public.mjs|postMessage|{type:'task',train:task.train,test:task.test}", bytes: 0, wire: 146026, how: "probe" },
  { key: "bench/public.mjs|workerData|{gridUrl:pathToFileURL(path.join(ROOT,'tasks','grid.mjs')).href,cellsUrl:pathToFileURL(path.join(ROO~94bf17cdedf8", bytes: 0, wire: 329, how: "probe" },
  { key: "bench/public.mjs|postMessage|worker-source:{type:\"ready\"}", bytes: 0, wire: 19, how: "probe" },
  { key: "bench/public.mjs|postMessage|worker-source:{type:\"bootFailed\",error:describe(e)}", bytes: 0, wire: 80, how: "probe" },
  { key: "bench/public.mjs|postMessage|worker-source:{type:\"done\",names:found.names,searched:found.searched,outputs,induced}", bytes: 0, wire: 227, how: "probe" },
  { key: "bench/public.mjs|postMessage|worker-source:{type:\"done\",names:null,searched:0,outputs:[],induced:{applied:false,solved:false,program:null,searc~a3205a9a7362", bytes: 0, wire: 207, how: "probe" },
  { key: "bin/serve.mjs|send|{op:'stop'}", bytes: 0, wire: 13, how: "probe" },
  { key: "bin/serve.mjs|send|{type:'status',t:lastT,tps:lastTps,rssMb:Math.round(mu.rss/1048576),maxRssMb:Math.round((process.res~3754f7911147", bytes: 0, wire: 937, how: "probe" },
  { key: "daemon/generations-worker.mjs|postMessage|{id,ok:true,boot:boot()}", bytes: 0, wire: 209, how: "probe" },
  { key: "daemon/generations-worker.mjs|postMessage|{id,ok:true,row,best:elite(),summary:epochs.summary()}", bytes: 0, wire: 5085, how: "probe" },
  { key: "daemon/generations-worker.mjs|postMessage|{id,ok:true,summary:epochs?epochs.summary():null,best:epochs?elite():null}", bytes: 0, wire: 4644, how: "probe" },
  { key: "daemon/generations-worker.mjs|postMessage|{id,ok:true}", bytes: 0, wire: 24, how: "probe" },
  { key: "daemon/generations-worker.mjs|postMessage|{id,ok:false,error:'unknownop'+String(msg&&msg.op)}", bytes: 0, wire: 72, how: "probe" },
  { key: "daemon/generations-worker.mjs|postMessage|{id,ok:false,error:String((err&&err.stack)||err)}", bytes: 0, wire: 388, how: "probe" },
  { key: "daemon/multiply.mjs|postMessage|m", bytes: 0, wire: 76, how: "probe" },
  { key: "daemon/multiply.mjs|postMessage|m#2", bytes: 0, wire: 1236, how: "probe" },
  { key: "daemon/multiply.mjs|workerData|(options)planeWorkerOptions(data,heapMb)", bytes: 0, wire: 515, how: "probe" },
  { key: "daemon/run.mjs|postMessage|{id,op,...args}", bytes: 0, wire: 50, how: "probe" },
  { key: "daemon/run.mjs|workerData|{dir:this.dir,seed:this.seed,popSize:this.popSize,ticks:this.ticks}", bytes: 0, wire: 208, how: "probe" },
  { key: "generations/evaluate.mjs|postMessage|{type:'jobs',batch:this.batch,jobs:JSON.stringify(slice)}", bytes: 0, wire: 4151, how: "probe" },
  { key: "generations/evaluate.mjs|workerData|{task:this.task,cfg:this.cfg}", bytes: 0, wire: 299, how: "probe" },
  { key: "generations/velocity.mjs|postMessage|out", bytes: 1376, wire: 3080, how: "probe" },
  { key: "generations/velocity.mjs|workerData|{velocityAudit:{seed,counts,maxDepth,components,batch}}", bytes: 0, wire: 1720, how: "probe" },
  { key: "generations/worker.mjs|postMessage|{type:'results',batch:msg.batch,results:JSON.stringify(out)}", bytes: 0, wire: 711, how: "probe" },
  { key: "generations/worker.mjs|postMessage|{type:'ready'}", bytes: 0, wire: 19, how: "probe" },
  { key: "generations/years.mjs|postMessage|{k,seed:this.source.seedOf(k)}", bytes: 0, wire: 55, how: "probe" },
  { key: "generations/years.mjs|postMessage|msg", bytes: 0, wire: 4199, how: "probe" },
  { key: "generations/years.mjs|workerData|{yearsPrefetch:{seed:source.seed,maxDepth:source.maxDepth,counts:source.counts||null,port:ch.port2}}", bytes: 0, wire: 154, how: "probe" },
  { key: "memory/direct.mjs|postMessage|out", bytes: 0, wire: 719, how: "probe" },
  { key: "memory/direct.mjs|postMessage|{start:ranges[j][0],end:ranges[j][1],j}", bytes: 0, wire: 51, how: "probe" },
  { key: "memory/direct.mjs|postMessage|{stop:true}", bytes: 0, wire: 10, how: "probe" },
  { key: "memory/direct.mjs|workerData|{directFill:true,storeDir:o.storeDir,pool:o.pool??40}", bytes: 0, wire: 112, how: "probe" },
  { key: "runtime/cluster.mjs|postMessage|make(s)", bytes: 704512, wire: 800016, how: "probe" },
  { key: "runtime/cluster.mjs|workerData|{shard:s,shards:S,spec:workerSpec,cellIdx:Int32Array.from(cellIdx[s]),localOf:local,shardOf:of,inEdg~e7a92cc89b25", bytes: 82428, wire: 9706405, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|reply", bytes: 491520, wire: 609246, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|{type:'ok',id:msg.id,shard:ME}", bytes: 0, wire: 50, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|{type:'counts',id:msg.id,shard:ME,g:myCells,runs,fired}", bytes: 53292, wire: 53374, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|{type:'snapshot',id:msg.id,shard:ME,t:brain.clock.t,cells,stats:{...brain.stats},inflight,outbox:bra~eb391f1e3d6e", bytes: 0, wire: 28041254, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|{type:'stopped',shard:ME}", bytes: 0, wire: 40, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|{type:'error',shard:ME,error:String(err&&err.stack||err)}", bytes: 0, wire: 387, how: "probe" },
  { key: "runtime/shard.mjs|postMessage|{type:'ready',shard:ME,cells:myCells.length,edges:brain.connectome.live(),ghosts:ghostLocal.length,c~0d1a73ab8adf", bytes: 0, wire: 118, how: "probe" },
  { key: "test/cloud.test.mjs|send|{op:'stop'}", bytes: 0, wire: 13, how: "probe" },
  { key: "tools/boundary-audit.mjs|postMessage|{view}", bytes: 1048576, wire: 1048585, how: "probe" },
  { key: "tools/boundary-audit.mjs|postMessage|{sview}", bytes: 0, wire: 10, how: "probe" },
  { key: "tools/ingest-wiki.mjs|postMessage|{id,shared,spans:mine}", bytes: 0, wire: 64, how: "probe" },
  { key: "tools/ingest-wiki.mjs|postMessage|{id,results}", bytes: 0, wire: 88, how: "probe" },
  { key: "tools/ingest-wiki.mjs|workerData|{role:'bz2'}", bytes: 0, wire: 17, how: "probe" },
];

if (PROBE_DIR) installProbe();
if (wtc.isMainThread && process.argv[1] && path.resolve(process.argv[1]) === SELF && !globalThis.__boundaryMain) {
  globalThis.__boundaryMain = true; // loaded by --require and again as the entry: one run
  const argv = process.argv.slice(2);
  if (argv[0] === '--run-driver') runDriver(argv[1]).then(() => process.exit(0), (e) => { console.error(e && e.stack || e); process.exit(1); });
  else if (!PROBE_DIR) main(argv).then((code) => { process.exitCode = code; }, (e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
