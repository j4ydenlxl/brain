// mind/corpus.mjs: OUR OWN TEXT, AND NOTHING ELSE.
//
// No external data. Nothing downloaded. The training text of this organism's language model
// is the organism's own prose and the comments its authors wrote in its own source:
//
//   research/*.md   notes/*.md   docs/*.md   and the comments inside brain/**/*.mjs
//
// MANUAL.md is excluded on purpose. Section A of it is HIS text, verbatim, and it is not
// training data for anything. organism/ is excluded too: it is emitted, not written.
//
// The split is by FILE, not by line, so no sentence straddles train and held out, and it is
// deterministic (files sorted by path, every fifth one held out). Byte counts are printed by
// whatever calls this; nothing here rounds or estimates.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SKIP_DIRS = new Set(['node_modules', 'state', 'organism', 'verdicts']);
const PROSE_DIRS = ['research', 'notes', 'docs'];

function walk(dir, out = []) {
  let names;
  try { names = readdirSync(dir); } catch { return out; }
  for (const name of names) {
    if (name.startsWith('.') || SKIP_DIRS.has(name)) continue;
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

/**
 * Lift the comments out of one ES module: line comments and block comments, with the comment
 * markers removed and the prose kept. Code itself is not training text; the prose engineers
 * wrote about the code is.
 * @param {string} src
 * @returns {string}
 */
export function commentsOf(src) {
  const out = [];
  const lines = src.split('\n');
  let inBlock = false;
  for (const raw of lines) {
    let line = raw;
    if (inBlock) {
      const end = line.indexOf('*/');
      const body = end >= 0 ? line.slice(0, end) : line;
      out.push(body.replace(/^\s*\*?\s?/, ''));
      if (end >= 0) inBlock = false;
      continue;
    }
    const block = line.indexOf('/*');
    if (block >= 0 && !insideString(line, block)) {
      const end = line.indexOf('*/', block + 2);
      if (end >= 0) { out.push(line.slice(block + 2, end).trim()); line = line.slice(0, block) + line.slice(end + 2); }
      else { out.push(line.slice(block + 2).trim()); inBlock = true; line = line.slice(0, block); }
    }
    const slash = line.indexOf('//');
    if (slash >= 0 && !insideString(line, slash)) out.push(line.slice(slash + 2).replace(/^\s?/, ''));
  }
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// A crude but sufficient string check: an odd number of unescaped quotes before the position
// means the marker is inside a literal and is not a comment.
function insideString(line, at) {
  let sq = 0, dq = 0, bt = 0;
  for (let i = 0; i < at; i++) {
    const c = line[i];
    if (c === '\\') { i++; continue; }
    if (c === "'") sq++;
    else if (c === '"') dq++;
    else if (c === '`') bt++;
  }
  return (sq % 2 === 1) || (dq % 2 === 1) || (bt % 2 === 1);
}

/**
 * Every corpus document: prose files whole, source files reduced to their comments.
 * @param {object} [opts] { root }
 * @returns {Array<{file: string, kind: 'prose'|'comments', text: string, bytes: number}>}
 */
export function documents({ root = ROOT } = {}) {
  const docs = [];
  for (const d of PROSE_DIRS) {
    for (const f of walk(path.join(root, d))) {
      if (!f.endsWith('.md')) continue;
      const text = readFileSync(f, 'utf8');
      docs.push({ file: rel(root, f), kind: 'prose', text, bytes: Buffer.byteLength(text) });
    }
  }
  for (const f of walk(root)) {
    if (!f.endsWith('.mjs')) continue;
    const text = commentsOf(readFileSync(f, 'utf8'));
    if (text.length < 64) continue; // a file with almost no prose in it contributes nothing
    docs.push({ file: rel(root, f), kind: 'comments', text, bytes: Buffer.byteLength(text) });
  }
  docs.sort((a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0));
  return docs;
}

const rel = (root, f) => path.relative(root, f).replaceAll('\\', '/');

/**
 * Split the corpus by file into train and held out. Deterministic: the sorted list, every
 * fifth document held out. No document appears in both.
 * @param {object} [opts] { root, every: hold out one document in this many }
 * @returns {{train: string, heldout: string, trainBytes: number, heldoutBytes: number, trainFiles: string[], heldoutFiles: string[], documents: number}}
 */
export function split({ root = ROOT, every = 5 } = {}) {
  const docs = documents({ root });
  const trainDocs = [], heldDocs = [];
  docs.forEach((d, i) => ((i % every === every - 1) ? heldDocs : trainDocs).push(d));
  const join = (list) => list.map(d => d.text).join('\n\n');
  const train = join(trainDocs), heldout = join(heldDocs);
  return {
    train, heldout,
    trainBytes: Buffer.byteLength(train), heldoutBytes: Buffer.byteLength(heldout),
    trainFiles: trainDocs.map(d => d.file), heldoutFiles: heldDocs.map(d => d.file),
    documents: docs.length,
  };
}
