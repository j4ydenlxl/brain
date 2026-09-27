#!/usr/bin/env node
// tools/split-stamp.mjs: stamp a split object into a bar verdict whose writer cannot write it again
// tonight (board 24b builder, item unsplit-bars; Board 13 RULES (1): a bar verdict names its split,
// graded by the gate's CONTAMINATION row).
//
// A verdict's numbers are never altered by hand, so a stamp adds fields and touches nothing else:
//   split             the writer's CURRENT split logic applied to arguments read from the file itself
//                     (for a writer with an exported splitFor, that function's source is cut out of
//                     the writer and compiled alone, never imported: web/ladder-bar.mjs runs on import)
//   splitStampedAt    ISO time of the stamp
//   splitStampedBy    'tools/split-stamp.mjs'
//   splitSource       the writer, the function, the arguments, the sha256 of the function source, why
//                     the writer did not re-run it, and what the stamp did about the top-level mark
//   splitStampedOver  sha256 and length of the file BEFORE the stamp, and where the stamp sits in it:
//                     cutting the stamp out gives the old bytes back, so "nothing else changed" is a
//                     check (--check, test/unsplit-bars.test.mjs), not a promise
// The stamp is spliced in as text before the closing brace, in the file's own indentation, so the
// bytes of every field the run wrote are kept as they were. A file whose split came from its own run
// is never stamped; a stamped file is re-stamped from its reconstructed original (idempotent).
//
// The reader is told (board 24b fix pass; the gate's rule is "the reader is told, not that no bench
// may reuse a record"): when the split gives a contamination reason, the stamp also adds top-level
// contaminated true (the mark the gate reads) and appends ONE sentence to the statement, STAMP_SENTENCE,
// which names the stamp and quotes the reason. It is the rule bench/compress.mjs, bench/math.mjs and
// bench/synth.mjs apply on their own runs. splitStampedOver records where the sentence went and how
// long it is, so cutting the sentence and the tail block out still gives the old bytes back.
//
// Usage (MODEL OFF: no model call, no socket):
//   node tools/split-stamp.mjs                 dry run: every file's before and after shape, writes nothing
//   node tools/split-stamp.mjs --write         writes the stamps
//   node tools/split-stamp.mjs --check         every stamped file gives its old bytes back and its split
//                                              equals the writer's logic now; exit 1 on any failure
//   node tools/split-stamp.mjs --bar           runs node bench/gate.mjs --contamination, prints its line and
//                                              writes bench/verdicts/unsplit-bars.json from what it printed
//   --dir <verdicts dir>   (default bench/verdicts)    --only a.json,b.json
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const STAMP_BY = 'tools/split-stamp.mjs';
export const STAMP_KEYS = Object.freeze(['split', 'splitStampedAt', 'splitStampedBy', 'splitSource', 'splitStampedOver']);
/** The eleven bar files the CONTAMINATION row named with no split when this item began (grid.json is item ladder-arc's). */
export const ELEVEN = Object.freeze(['autopilot-board10.json', 'census-prune.json', 'census-scale-static.json', 'census.json', 'code.json', 'compress-board10.json', 'compress.json', 'math.json', 'public-launch.json', 'synth.json', 'web-ladder.json']);
const MARK_NOTE = 'added by the stamp: the split gives a contamination reason, so the file carries contaminated true at its top level and one sentence appended to its statement (splitStampedOver.statementAppended), the rule bench/compress.mjs, bench/math.mjs and bench/synth.mjs apply on their own runs; cutting both out gives the old bytes back';
/** The one sentence a stamp appends to a statement when the split gives a reason. */
export const STAMP_SENTENCE = (reason) => ' Contaminated, as the split stamped by tools/split-stamp.mjs says: ' + reason + '.';

export const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/** The source text of `export function <name>(...) {...}` in a file's text, by a quote-aware brace walk. */
export function functionSource(text, name = 'splitFor') {
  const start = text.indexOf('export function ' + name + '(');
  if (start < 0) return null;
  let i = text.indexOf('{', text.indexOf(')', start));
  let depth = 0, q = null;
  for (; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '\'' || c === '"' || c === '`') { q = c; continue; }
    if (c === '/' && text[i + 1] === '/') { i = text.indexOf('\n', i); continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return text.slice(start, i + 1); }
  }
  return null;
}

/** A writer's splitFor, cut out and compiled alone (it must need nothing around it), with its source hash. */
export async function writerSplitFor(writerRel, root = ROOT) {
  const src = functionSource(readFileSync(path.join(root, writerRel), 'utf8'), 'splitFor');
  if (!src) throw new Error(writerRel + ': no export function splitFor(');
  const mod = await import('data:text/javascript;base64,' + Buffer.from(src, 'utf8').toString('base64'));
  if (typeof mod.splitFor !== 'function') throw new Error(writerRel + ': splitFor did not compile to a function');
  return { fn: mod.splitFor, fnSha256: sha256(src) };
}

// The per board check counts are bench/autopilot.mjs's own verdict.split line, applied to this file's
// checks (checks 0 to 20 are Boards 8 and 10, 21 to 25 Board 14, the rest Board 15).
/** The split of Board 10's archived autopilot verdict: pure, from its fixture and its checks. */
export function autopilotBoard10Split(v) {
  const checks = Array.isArray(v && v.checks) ? v.checks : [];
  const passed = (xs) => xs.filter((x) => x && x.pass).length + '/' + xs.length;
  return {
    development: {
      what: 'the planted fixture tree the checks of Boards 8 and 10 were written with (a copied tree holding the real gate program and the planted files below, with three planted patches), one dry pass on the real tree and one wet pass on a planted repository copy',
      files: v && v.fixture && Array.isArray(v.fixture.files) ? v.fixture.files : null,
      checks: checks.length,
      byBoard: { board8and10: passed(checks.slice(0, 21)), board14: passed(checks.slice(21, 26)), board15: passed(checks.slice(26)) },
    },
    heldOut: { what: 'none: every check grades a patch planted together with the check, so no record here was held out from the code it grades', n: 0 },
    contaminated: 'no held-out set: the ' + checks.length + ' checks grade planted patches the autopilot was built and tested against',
  };
}

const n0 = (x) => (Number.isFinite(x) ? x : null);
/**
 * One row per stamped file: the writer, how its split arguments are read from the file, and why the
 * writer did not re-run it tonight (every number in a reason is read from the file, never typed).
 */
export const STAMPS = Object.freeze({
  'autopilot-board10.json': {
    writer: 'bench/autopilot.mjs', fn: 'autopilotBoard10Split (tools/split-stamp.mjs; the byBoard counts are bench/autopilot.mjs verdict.split applied to this file)', local: autopilotBoard10Split,
    args: () => null,
    why: () => 'an archived copy of Board 10\'s autopilot.json: bench/autopilot.mjs now writes autopilot.json and never this file',
  },
  'census-prune.json': {
    writer: 'tools/organism-census.mjs',
    args: (v) => ({ mode: 'run', seed: v.seed ?? null, ticks: n0(v.ticks) }),
    why: (v) => 'its run does not fit this board\'s 4000 MB cap: its own memoryMB.rssEnd was ' + (v.memoryMB && v.memoryMB.rssEnd) + ' MB and rssAfterFull ' + (v.memoryMB && v.memoryMB.rssAfterFull) + ' MB',
  },
  'census.json': {
    writer: 'tools/organism-census.mjs',
    args: (v) => ({ mode: 'run', seed: v.seed ?? null, ticks: n0(v.ticks) }),
    why: (v) => 'its run does not fit this board\'s 4000 MB cap: its own memoryMB.rssAfterFull was ' + (v.memoryMB && v.memoryMB.rssAfterFull) + ' MB',
  },
  'code.json': {
    writer: 'bench/code.mjs',
    args: (v) => ({ tasks: n0(v.tasks && v.tasks.total), inMemory: !!((v.tasks && v.tasks.inMemory) || (v.shape && v.shape.inMemory)), seed: (v.tasks && v.tasks.seed) ?? null }),
    why: (v) => 'its bar asks Ollama (' + v.model + ') and the one queue is taken tonight (MODEL OFF); its own run took ms ' + v.ms,
  },
  'compress-board10.json': {
    writer: 'bench/compress.mjs',
    args: (v) => ({ seed: (v.params && v.params.seed) ?? null, tasks: n0(v.params && v.params.tasks), daemon: false, tiers: false }),
    why: (v) => 'an archived copy of Board 10\'s compress.json: bench/compress.mjs reads it and never writes it (its own run took wallMs ' + v.wallMs + ')',
  },
  'compress.json': {
    writer: 'bench/compress.mjs',
    args: (v) => ({ seed: (v.params && v.params.seed) ?? null, tasks: n0(v.params && v.params.tasks), tierN: n0(v.params && v.params.tierN), tierKeys: n0(v.params && v.params.tierKeys), daemon: !!v.daemon, tiers: !!(v.tiers && !v.tiers.skipped) }),
    why: (v) => 'its own run took wallMs ' + v.wallMs + ' (over 120000) at peakRssMb ' + v.peakRssMb + ' (over this board\'s 4000), and a bar-shaped re-run writes compress-delta-rerun.json, never this file (written once)',
  },
  'math.json': {
    writer: 'bench/math.mjs',
    args: (v) => { const r = v.records || {}; return { split: r.split ?? null, file: r.file ?? null, fallback: r.fallbackToTest === true, n: n0(r.n), seed: r.seed ?? null, overlapWithPublicStage: r.overlapWithPublicStage ?? null }; },
    why: (v) => 'its bar asks Ollama (' + (v.model && v.model.small) + ', and ' + (v.model && v.model.big) + ' for the big stage) and the one queue is taken tonight (MODEL OFF)',
  },
  'public-launch.json': {
    writer: 'bench/public.mjs',
    args: (v) => {
      const sets = {};
      for (const name of Object.keys((v && v.smoke) || {}).sort()) {
        const sp = v.smoke[name] && v.smoke[name].splits;
        const org = sp && sp.organism, alone = sp && sp.alone;
        const d = org && org.development ? org.development.n : null;
        const h = org && org.heldOut ? org.heldOut.n : null;
        if (alone && (alone.development.n !== d || alone.heldOut.n !== h)) throw new Error('public-launch.json: the ' + name + ' arms place different counts on the split');
        sets[name] = { development: d, heldOut: h };
      }
      return { sets };
    },
    why: () => 'it has no single writer: its command is a detached cmd.exe chain of bench/public.mjs runs, and the two smokes it grades asked Ollama (MODEL OFF tonight); the counts are the smokes\' own splits in this file',
  },
  'synth.json': {
    writer: 'bench/synth.mjs',
    args: () => ({}),
    why: (v) => 'its bar asks Ollama (' + v.model + ', and ' + v.bigModel + ' for the big stage) and the one queue is taken tonight (MODEL OFF)',
  },
  'web-ladder.json': {
    writer: 'web/ladder-bar.mjs',
    args: () => ({}),
    why: (v) => 'web/ladder-bar.mjs refuses to start while web-ladder.json exists (a bar file is written once; tonight it printed [refused] and exit 2), and a bar run rebuilds web/dist, which this board never edits (its own run took wallMs ' + v.wallMs + ')',
  },
});

/** Where the closing brace's leading whitespace begins: the stamp goes there. */
function cutPoint(text) {
  const close = text.lastIndexOf('}');
  if (close < 0) throw new Error('no closing brace');
  let k = close;
  while (k > 0 && /\s/.test(text[k - 1])) k--;
  return k;
}
/**
 * Where the closing quote of the TOP-LEVEL statement string sits in a file's text: the key at the
 * file's own top-level indentation (a nested "statement" sits deeper), found exactly once, then a
 * JSON string walk to its end. Null when there is none or it is ambiguous.
 */
export function statementEnd(text, ind) {
  const nl = text.includes('\r\n') ? '\r\n' : '\n';
  const key = nl + ind + '"statement": "';
  const at = text.indexOf(key);
  if (at < 0 || text.indexOf(key, at + 1) >= 0) return null;
  for (let i = at + key.length; i < text.length; i++) {
    const c = text[i];
    if (c === '\\') { i++; continue; }
    if (c === '"') return i;
  }
  return null;
}
/** The original bytes of a stamped text, from its splitStampedOver (null when it has none). */
export function originalOf(text, over) {
  if (!over || !Number.isInteger(over.prefixChars) || !Number.isInteger(over.suffixChars)) return null;
  let t = text;
  if (over.statementAt !== undefined) {
    if (!Number.isInteger(over.statementAt) || !Number.isInteger(over.statementChars)) return null;
    t = t.slice(0, over.statementAt) + t.slice(over.statementAt + over.statementChars);
  }
  return t.slice(0, over.prefixChars) + t.slice(t.length - over.suffixChars);
}
/**
 * The stamped text: the original with the fields spliced in before its closing brace, in its own
 * indentation; with a sentence, also contaminated true at the head of that block and the sentence
 * appended inside the top-level statement string (both recorded in splitStampedOver).
 */
export function stampText(original, fields, { sentence = null } = {}) {
  const nl = original.includes('\r\n') ? '\r\n' : '\n';
  const m = /^\{\r?\n([ \t]+)"/.exec(original);
  const ind = m ? m[1] : '  ';
  const unit = ind === '\t' ? '\t' : ind.length;
  const k = cutPoint(original);
  const over = { sha256: sha256(original), bytes: Buffer.byteLength(original, 'utf8'), prefixChars: k, suffixChars: original.length - k };
  let head = original.slice(0, k);
  const lead = {};
  if (sentence) {
    const p = statementEnd(original, ind);
    if (p === null || p >= k) throw new Error('no single top-level statement string to append the sentence to');
    const esc = JSON.stringify(sentence).slice(1, -1);
    head = original.slice(0, p) + esc + original.slice(p, k);
    Object.assign(over, { statementAt: p, statementChars: esc.length, statementAppended: sentence, markAdded: true });
    lead.contaminated = true;
  }
  const all = { ...lead, ...fields, splitStampedOver: over };
  const block = Object.entries(all).map(([key, val]) => ind + JSON.stringify(key) + ': ' + JSON.stringify(val, null, unit).split('\n').join(nl + ind)).join(',' + nl);
  return { text: head + ',' + nl + block + original.slice(k), over };
}

/** Every numeric leaf of a value, as path=value lines (sorted), for a before and after compare. */
export function numericLeaves(x, p = '$', out = []) {
  if (typeof x === 'number') out.push(p + '=' + String(x));
  else if (Array.isArray(x)) x.forEach((y, i) => numericLeaves(y, p + '[' + i + ']', out));
  else if (x && typeof x === 'object') for (const k of Object.keys(x)) numericLeaves(x[k], p + '.' + k, out);
  return p === '$' ? out.sort() : out;
}
/** The value with the stamp's fields taken out: its five keys, the mark it added, and the sentence it appended. */
export function withoutStamp(v) {
  const o = { ...v };
  const over = v && v.splitStampedOver;
  for (const k of STAMP_KEYS) delete o[k];
  if (over && over.markAdded === true) delete o.contaminated;
  if (over && typeof over.statementAppended === 'string' && typeof o.statement === 'string' && o.statement.endsWith(over.statementAppended)) {
    o.statement = o.statement.slice(0, o.statement.length - over.statementAppended.length);
  }
  return o;
}

/** The shape the gate reads, as a short word: object (its origin), none, or the typeof. */
export function shapeWord(v) {
  const s = v ? v.split : undefined;
  if (s === undefined || s === null) return 'none';
  if (Array.isArray(s)) return 'array';
  if (typeof s !== 'object') return typeof s + (typeof s === 'string' ? ' "' + s + '"' : '');
  const c = s.contaminated === false ? 'contaminated false' : typeof s.contaminated === 'string' ? 'contaminated a reason' : 'contaminated ' + JSON.stringify(s.contaminated);
  const mark = v.contaminated === true ? ', top-level contaminated true' : '';
  return 'object (' + c + mark + (v.splitStampedBy ? ', stamped' : ', from its own run') + ')';
}

/** The split a stamp would write for one file's original verdict, its splitSource, and the sentence (null when clean). */
export async function splitOf(name, v, { root = ROOT, at = new Date().toISOString() } = {}) {
  const row = STAMPS[name];
  if (!row) throw new Error(name + ': not in the stamp table');
  let split, fnName, fnSha256, args = row.args(v);
  if (row.local) { split = row.local(v); fnName = row.fn; fnSha256 = sha256(functionSource(readFileSync(fileURLToPath(import.meta.url), 'utf8'), 'autopilotBoard10Split')); }
  else { const w = await writerSplitFor(row.writer, root); split = w.fn(args); fnName = 'splitFor'; fnSha256 = w.fnSha256; }
  const reason = typeof split.contaminated === 'string' ? split.contaminated : null;
  const source = { writer: row.writer, fn: fnName, args, fnSha256, notRerunBecause: row.why(v), contaminatedMark: reason ? MARK_NOTE : 'none needed: contaminated false' };
  return { split, fields: { split, splitStampedAt: at, splitStampedBy: STAMP_BY, splitSource: source }, sentence: reason ? STAMP_SENTENCE(reason) : null };
}

/** The plan for one file: skip (why), or the stamped text with its before and after shapes. */
export async function planFile(dir, name, { root = ROOT, at } = {}) {
  const file = path.join(dir, name);
  if (!existsSync(file)) return { name, action: 'missing', before: 'absent', after: 'absent' };
  const text = readFileSync(file, 'utf8');
  const v = JSON.parse(text);
  const before = shapeWord(v);
  let original = text, prior = null;
  if (v.splitStampedBy === STAMP_BY) {
    original = originalOf(text, v.splitStampedOver);
    if (original === null || sha256(original) !== v.splitStampedOver.sha256) return { name, action: 'broken', before, after: before, why: 'the stamped file does not give its old bytes back' };
    prior = v;
  } else if (v.split !== undefined && v.split !== null) {
    return { name, action: 'own-run', before, after: before, why: 'its split came from its own run (at ' + v.at + '): never stamped' };
  }
  if (!STAMPS[name]) return { name, action: 'no-row', before, after: before, why: 'not in the stamp table' };
  const ov = JSON.parse(original);
  const { split, fields, sentence } = await splitOf(name, ov, { root, at: prior ? prior.splitStampedAt : at });
  if (sentence && Object.prototype.hasOwnProperty.call(ov, 'contaminated')) return { name, action: 'conflict', before, after: before, why: 'its run already wrote a top-level contaminated (' + JSON.stringify(ov.contaminated) + '): a stamp never overwrites a field its run wrote' };
  if (prior && JSON.stringify(prior.split) === JSON.stringify(split) && JSON.stringify(prior.splitSource) === JSON.stringify(fields.splitSource)
    && (prior.splitStampedOver.statementAppended ?? null) === sentence) {
    return { name, action: 'already', before, after: before, why: 'stamped at ' + prior.splitStampedAt + ' with the split the writer gives now' };
  }
  if (prior) fields.splitStampedAt = at || new Date().toISOString();
  const { text: out } = stampText(original, fields, { sentence });
  const after = shapeWord(JSON.parse(out));
  return { name, action: prior ? 'restamp' : 'stamp', before, after, text: out, file };
}

/** Check one stamped file: its old bytes come back, nothing numeric moved, and its split is the writer's now. */
export async function checkFile(dir, name, { root = ROOT } = {}) {
  const text = readFileSync(path.join(dir, name), 'utf8');
  const v = JSON.parse(text);
  if (v.splitStampedBy !== STAMP_BY) return { name, stamped: false, ok: v.split !== undefined && v.split !== null && typeof v.split === 'object' && !Array.isArray(v.split) };
  const problems = [];
  const orig = originalOf(text, v.splitStampedOver);
  if (orig === null || sha256(orig) !== v.splitStampedOver.sha256) problems.push('the old bytes do not come back (sha256)');
  let ov = null;
  try { ov = JSON.parse(orig); } catch { problems.push('the old bytes do not parse'); }
  if (ov) {
    if (JSON.stringify(numericLeaves(ov)) !== JSON.stringify(numericLeaves(withoutStamp(v)))) problems.push('a numeric field differs from the old bytes');
    if (JSON.stringify(ov) !== JSON.stringify(withoutStamp(v))) problems.push('a field differs from the old bytes');
    const { split, fields, sentence } = await splitOf(name, ov, { root, at: v.splitStampedAt });
    if (JSON.stringify(split) !== JSON.stringify(v.split)) problems.push('the split is not what ' + fields.splitSource.writer + ' gives now');
    if (fields.splitSource.fnSha256 !== v.splitSource.fnSha256) problems.push('the writer\'s split logic changed since the stamp');
    // the reader is told: a reason carries the top-level mark and the sentence; a clean split carries neither
    if (sentence) {
      if (v.contaminated !== true || v.splitStampedOver.markAdded !== true) problems.push('the split gives a reason and the top-level contaminated mark is missing');
      if (v.splitStampedOver.statementAppended !== sentence || typeof v.statement !== 'string' || !v.statement.endsWith(sentence)) problems.push('the split gives a reason and the statement does not end with the stamp sentence');
    } else if (v.splitStampedOver.markAdded !== undefined || v.splitStampedOver.statementAppended !== undefined) {
      problems.push('the split is clean and the stamp marked it contaminated');
    }
  }
  return { name, stamped: true, ok: problems.length === 0, problems };
}

/** The gate's row, run as its own process: the line it printed and its exit code. */
export function gateRowCli(root = ROOT) {
  const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT'));
  const r = spawnSync(process.execPath, [path.join(root, 'bench', 'gate.mjs'), '--contamination'], { cwd: root, encoding: 'utf8', env, timeout: 60000 });
  return { line: String(r.stdout || '').trim(), exit: r.status, stderr: String(r.stderr || '').trim() };
}
/** The files each cause of a CONTAMINATION line names. */
export function causeFilesOf(line) {
  const i = line.indexOf('; CAUSES (');
  if (i < 0) return { causes: 0, files: [] };
  const n = Number(/; CAUSES \((\d+)\)/.exec(line)[1]);
  const files = [...line.slice(i).matchAll(/([\w.-]+\.json)/g)].map((m) => m[1]);
  return { causes: n, files: [...new Set(files)] };
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
  const dir = path.resolve(opt('--dir') || path.join(ROOT, 'bench', 'verdicts'));
  const only = opt('--only') ? opt('--only').split(',') : null;
  const names = (only || ELEVEN).slice();
  if (argv.includes('--check')) {
    let bad = 0;
    for (const n of names) {
      const r = await checkFile(dir, n);
      if (!r.ok) bad++;
      console.log(n + ': ' + (r.stamped ? (r.ok ? 'stamped, old bytes back, split is the writer\'s now' : 'FAILED ' + r.problems.join('; ')) : (r.ok ? 'split from its own run' : 'FAILED no split object')));
    }
    console.log('split-stamp check: ' + (names.length - bad) + ' of ' + names.length + ' ok');
    process.exitCode = bad ? 1 : 0;
    return;
  }
  if (argv.includes('--bar')) return bar(dir);
  const write = argv.includes('--write');
  const at = new Date().toISOString();
  let stamped = 0;
  for (const n of names) {
    const p = await planFile(dir, n, { at });
    console.log(n + ': ' + p.before + ' -> ' + p.after + ' [' + p.action + (p.why ? ': ' + p.why : '') + ']');
    if (p.text && write) { writeFileSync(p.file, p.text); stamped++; }
  }
  console.log('split-stamp ' + (write ? 'wrote ' + stamped + ' file(s)' : 'dry run: nothing written (--write writes)'));
}

/** The files a CONTAMINATION line lists as contaminated and labelled, and the count it prints. */
export function labelledOf(line) {
  const m = /contaminated and labelled (\d+)(?: \(([^)]*)\))?/.exec(line);
  if (!m) return { n: null, files: [] };
  return { n: Number(m[1]), files: m[2] ? m[2].split(',').map((x) => x.trim()).filter(Boolean) : [] };
}

// The bar: the gate's own CLI row, run as a process, and a verdict written from what it printed.
// Every number the statement quotes is on the two lines this prints (the gate's line and the tally).
async function bar(dir) {
  const t0 = Date.now();
  const cli = gateRowCli(ROOT);
  const { causes, files } = causeFilesOf(cli.line);
  const lab = labelledOf(cli.line);
  const named = files.filter((f) => ELEVEN.includes(f));
  const others = files.filter((f) => f !== 'grid.json');
  const checks = [];
  for (const n of ELEVEN) checks.push(await checkFile(dir, n));
  const stampedFiles = checks.filter((c) => c.stamped).map((c) => c.name);
  const ownRun = checks.filter((c) => !c.stamped && c.ok).map((c) => c.name);
  const failed = checks.filter((c) => !c.ok).map((c) => c.name + (c.problems ? ' (' + c.problems.join('; ') + ')' : ''));
  const reasons = [];
  const originals = [];
  for (const n of ELEVEN) {
    try {
      const text = readFileSync(path.join(dir, n), 'utf8');
      const v = JSON.parse(text);
      if (v.split && typeof v.split.contaminated === 'string') reasons.push(n);
      if (v.splitStampedBy === STAMP_BY) originals.push({ file: n, v: JSON.parse(originalOf(text, v.splitStampedOver)) });
    } catch { /* counted by checkFile */ }
  }
  const stampedReasons = reasons.filter((n) => stampedFiles.includes(n));
  const stampedLabelled = stampedReasons.filter((n) => lab.files.includes(n));
  const ownRunReasonClean = reasons.filter((n) => ownRun.includes(n) && !lab.files.includes(n));
  // the control: the gate's own row function over the stamped files with their stamps cut out
  const { contaminationRow, splitShapeOf } = await import('../bench/gate.mjs');
  const controlRow = contaminationRow({ read: true, records: originals.map((o) => ({ file: o.file, unread: false, bar: o.v.isTheBar === true, split: splitShapeOf(o.v), contaminated: o.v.contaminated === true, labelled: false })) });
  const barMet = cli.line.startsWith('CONTAMINATION ') && named.length === 0 && others.length === 0 && failed.length === 0
    && stampedLabelled.length === stampedReasons.length;
  const split = {
    kind: 'census',
    development: { what: 'the eleven bar files the CONTAMINATION row named with no split when this item began: this item stamped or left them, so they are what it worked on', files: ELEVEN },
    heldOut: 'none',
    why: 'a census of verdict files has no held-out set: the row counts what the files carry',
    contaminated: 'the scored records are the files this item wrote its stamps into, so the row measures that the rule is kept, not a held-out result',
  };
  const tally = 'split-stamp bar: gate exit ' + cli.exit + ', stamped ' + stampedFiles.length + ', own run ' + ownRun.length + ', failed ' + failed.length
    + ', a reason in split.contaminated ' + reasons.length + ', stamped with a reason ' + stampedReasons.length + ', of those labelled by the row ' + stampedLabelled.length
    + ', own run with a reason the row reads as clean ' + ownRunReasonClean.length + ', causes ' + causes + ', eleven named ' + named.length + ', causes other than grid.json ' + others.length
    + ', control (stamps cut out) no split ' + controlRow.counts.noSplit + ' of ' + originals.length + ', barMet ' + barMet;
  const statement = 'node bench/gate.mjs --contamination, run as its own process, printed (exit ' + cli.exit + '): "' + cli.line + '". '
    + 'Of the eleven bar files this item was given (the row named them with no split when the board was written), ' + stampedFiles.length + ' now carry a split stamped by tools/split-stamp.mjs (' + stampedFiles.join(', ') + ') and ' + ownRun.length + ' carry the split their own run wrote (' + ownRun.join(', ') + '); '
    + (failed.length ? failed.length + ' failed the stamp check (' + failed.join(', ') + '); ' : 'every stamped file gives its old bytes back by sha256 once the stamp is cut out, so no field its run wrote moved; ')
    + 'the row now names ' + causes + ' cause(s)' + (files.length ? ' over ' + files.join(', ') : '') + ', ' + named.length + ' of them among the eleven. '
    + reasons.length + ' of the eleven give a contamination reason in split.contaminated (' + reasons.join(', ') + '); ' + stampedReasons.length + ' of those are stamped, and the stamp told the reader: top-level contaminated true and one sentence appended to the statement, so the row lists ' + stampedLabelled.length + ' of the ' + stampedReasons.length + ' as contaminated and labelled. '
    + (ownRunReasonClean.length ? ownRunReasonClean.length + ' own run file(s) give a reason with no top-level mark, so the row reads them as clean (' + ownRunReasonClean.join(', ') + '): a stamp never touches a split its own run wrote, and that writer is not this item\'s. ' : '')
    + 'The control, the gate\'s own row function over the ' + originals.length + ' stamped files with their stamps cut out, counts ' + controlRow.counts.noSplit + ' with no split. '
    + 'Bar ' + (barMet ? 'MET' : 'NOT MET') + ': the bar asks that none of the eleven is a cause (' + named.length + ' named), that every cause left names grid.json, item ladder-arc\'s (' + others.length + ' other), that every stamp passes its check (' + failed.length + ' failed) and that every stamped reason is labelled (' + stampedLabelled.length + ' of ' + stampedReasons.length + '). Contaminated, as the split says: ' + split.contaminated + '.';
  const verdict = {
    at: new Date().toISOString(), command: 'node tools/split-stamp.mjs --bar', node: process.version, isTheBar: true, barMet, contaminated: true,
    statement, split,
    bar: { command: 'node bench/gate.mjs --contamination', printed: cli.line, exit: cli.exit, causes, causeFiles: files, elevenNamed: named, otherThanGrid: others, labelled: lab.files, tally },
    eleven: { stamped: stampedFiles, ownRun, failed, contaminationReasons: reasons, stampedWithAReason: stampedReasons, stampedLabelled, ownRunReasonClean },
    control: { what: 'the gate\'s contaminationRow over the stamped files with their stamps cut out (originalOf): the row this item began from, on the same files', noSplit: controlRow.noSplit, counts: controlRow.counts, ok: controlRow.ok },
    model: 'off: no model call, no socket',
    ms: Date.now() - t0,
  };
  console.log(cli.line);
  console.log(tally);
  writeFileSync(path.join(ROOT, 'bench', 'verdicts', 'unsplit-bars.json'), JSON.stringify(verdict, null, 2) + '\n');
  process.exitCode = barMet ? 0 : 1;
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
