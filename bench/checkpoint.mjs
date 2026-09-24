// bench/checkpoint.mjs: WHERE THE CHECKPOINT BYTES ARE, AND WHETHER THE POCKET HOLDS THEM.
//
// bench/verdicts/footprint.json (2026-09-18T08:28:38.107Z) declares a 50 MB checkpoint budget
// and misses it twice: 1000 majors at 256 units wrote 235782268 bytes and 12 majors at 100000
// units wrote 62061691. That verdict prints the total and nothing else, so nothing there says
// WHICH bytes to cut. This bench prints the total broken down by top level section of
// snapshot.json, and inside the cells section by field, so the cut is chosen from a
// measurement instead of a guess.
//
// HOW THE SECTIONS ARE MEASURED, stated because both ways are defensible: the file is read
// back as one Buffer and SCANNED, not re-serialized. A scanner walks the top level object and
// records the byte span of each section's value exactly as it sits on disk, so the section
// figures sum to the file size minus the keys and punctuation between them (that remainder is
// reported as `frame`). Measuring each section with its own JSON.stringify would instead
// report what a section would cost on its own, which is not what the file spends.
//
// Every row runs in its OWN child process, the way bench/footprint.mjs does it: a brain built
// earlier in the same process leaves a mind model and a skill registry behind in module level
// maps that a later build never frees, so an in-process loop would measure each later row on
// top of every row before it.
//
// The format arms named by --formats are INTERLEAVED inside one child row: the same brain
// object is snapshotted under every format back to back, so the before and after bytes belong
// to the same organism and no figure from one run is read against a figure from another. The
// default is the current comparison, 3 against 4; `--formats 2,3,4` measures all three.
//
//   node bench/checkpoint.mjs [--majors 12,100,1000] [--units 256] [--ticks 200]
//                             [--extra-majors 12] [--extra-units 100000] [--row-budget-ms 1200000]
//                             [--formats 3,4]
import { statSync, mkdirSync, writeFileSync, rmSync, openSync, readSync, closeSync, fstatSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { expandBlobTable, readJSONStreamed, writeJSONStreamed } from '../core/persist.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SELF = fileURLToPath(import.meta.url);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes('--' + k);
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const now = () => Number(process.hrtime.bigint()) / 1e6;
const bytesToMB = (b) => Number((b / 1048576).toFixed(3));

// The checkpoint budget this bench grades against. It is a DECLARED engineering target, never
// a measurement: the same 50 MB bench/footprint.mjs declares as POCKET_CHECKPOINT_MB and
// bench/verdicts/footprint.json publishes as pocketBudgets.checkpointMB. It is retyped here
// rather than imported so a run of this bench never depends on another bench's file being
// mid-edit.
export const POCKET_CHECKPOINT_MB = 50;

// ================================================================== the scanner
// A JSON value scanner over a Buffer. It never parses: it returns the index just past the
// value that starts at i, so a span can be measured on a 224 MB document without building a
// single string. Mirrors core/persist.mjs readJSONStreamed's own scanner.
const Q = 34, BS = 92, LB = 123, RB = 125, LS = 91, RS = 93, COMMA = 44, COLON = 58;

function ws(buf, i) {
  while (i < buf.length) { const b = buf[i]; if (b === 32 || b === 10 || b === 13 || b === 9) i++; else break; }
  return i;
}
function scanString(buf, i) {
  let j = i + 1;
  while (j < buf.length) { const b = buf[j]; if (b === BS) { j += 2; continue; } if (b === Q) return j + 1; j++; }
  throw new SyntaxError('unterminated string at ' + i);
}
function scanValue(buf, i) {
  const c = buf[i];
  if (c === Q) return scanString(buf, i);
  if (c === LB || c === LS) {
    let d = 0, j = i;
    while (j < buf.length) {
      const b = buf[j];
      if (b === Q) { j = scanString(buf, j); continue; }
      if (b === LB || b === LS) d++;
      else if (b === RB || b === RS) { d--; if (d === 0) return j + 1; }
      j++;
    }
    throw new SyntaxError('unterminated container at ' + i);
  }
  let j = i;
  while (j < buf.length) { const b = buf[j]; if (b === COMMA || b === RB || b === RS || b === 32 || b === 10 || b === 13 || b === 9) break; j++; }
  return j;
}

// [key, valueStart, valueEnd] for every member of the object that opens at i.
export function members(buf, i) {
  if (buf[i] !== LB) throw new SyntaxError('expected an object at ' + i);
  const out = [];
  let j = ws(buf, i + 1);
  if (buf[j] === RB) return out;
  for (;;) {
    if (buf[j] !== Q) throw new SyntaxError('expected a key at ' + j);
    const ke = scanString(buf, j);
    const key = JSON.parse(buf.toString('utf8', j, ke));
    j = ws(buf, ke);
    if (buf[j] !== COLON) throw new SyntaxError('expected : at ' + j);
    const vs = ws(buf, j + 1);
    const ve = scanValue(buf, vs);
    out.push([key, vs, ve]);
    j = ws(buf, ve);
    if (buf[j] === COMMA) { j = ws(buf, j + 1); continue; }
    if (buf[j] === RB) return out;
    throw new SyntaxError('expected , or } at ' + j);
  }
}
// [start, end] for every element of the array that opens at i.
export function elements(buf, i) {
  if (buf[i] !== LS) throw new SyntaxError('expected an array at ' + i);
  const out = [];
  let j = ws(buf, i + 1);
  if (buf[j] === RS) return out;
  for (;;) {
    const e = scanValue(buf, j);
    out.push([j, e]);
    j = ws(buf, e);
    if (buf[j] === COMMA) { j = ws(buf, j + 1); continue; }
    if (buf[j] === RS) return out;
    throw new SyntaxError('expected , or ] at ' + j);
  }
}

function readAll(file) {
  const fd = openSync(file, 'r');
  try {
    const size = fstatSync(fd).size;
    const buf = Buffer.allocUnsafe(size);
    let at = 0;
    while (at < size) {
      const n = readSync(fd, buf, at, Math.min(1 << 30, size - at), at);
      if (n <= 0) throw new Error('short read at ' + at + ' of ' + size);
      at += n;
    }
    return buf;
  } finally { closeSync(fd); }
}

// A flat array of numbers (or of true/false/null) holds no quote and no nested container, so
// one pass over its span decides it without parsing. This is the shape a typed array takes
// when it is written as a JSON list, and it is the shape a base64 string replaces.
function isFlatNumberList(buf, s, e) {
  if (buf[s] !== LS) return false;
  for (let i = s + 1; i < e; i++) { const b = buf[i]; if (b === Q || b === LB || b === LS) return false; }
  return e - s > 2;
}

// Bytes inside one cell object, by top level field, plus the share of those bytes that sits
// inside flat number lists at any depth (the typed array payloads) against everything else.
function cellAccount(buf, s, e, acc) {
  for (const [key, vs, ve] of members(buf, s)) {
    acc.byField[key] = (acc.byField[key] || 0) + (ve - vs);
    walkNumbers(buf, vs, ve, acc);
    if (key === 'state') for (const [k2, s2, e2] of members(buf, vs)) acc.byStateKey[k2] = (acc.byStateKey[k2] || 0) + (e2 - s2);
  }
  acc.cells++;
  acc.total += e - s;
}
function walkNumbers(buf, s, e, acc) {
  const c = buf[s];
  if (c === LS) {
    if (isFlatNumberList(buf, s, e)) { acc.numberListBytes += e - s; acc.numberLists++; return; }
    for (const [a, b] of elements(buf, s)) walkNumbers(buf, a, b, acc);
    return;
  }
  if (c === LB) { for (const [, a, b] of members(buf, s)) walkNumbers(buf, a, b, acc); return; }
  acc.scalarBytes += e - s;
}

// THE CENSUS THAT NAMES THE BULK. Every string in the document of at least `min` bytes,
// counted, and the base64 shaped ones counted again by DISTINCT value: the difference between
// the bytes they occupy and the bytes their distinct values occupy is the copy the file is
// paying for twice. This is the figure the format change is aimed at, so it rides in the
// verdict beside the sizes rather than being quoted from a command nothing recorded.
const CENSUS_PAYLOAD = /^[A-Za-z0-9+/=:]+$/;
function payloadCensus(buf, min = 48) {
  const Q = 34, BS = 92;
  const seen = new Map();
  let i = 0, strings = 0, bytes = 0, otherLongBytes = 0, otherLong = 0;
  while (i < buf.length) {
    if (buf[i] !== Q) { i++; continue; }
    let j = i + 1;
    while (j < buf.length) { const b = buf[j]; if (b === BS) { j += 2; continue; } if (b === Q) break; j++; }
    const len = j - i + 1;
    if (len >= min) {
      const v = buf.toString('latin1', i + 1, j);
      if (CENSUS_PAYLOAD.test(v)) { strings++; bytes += len; seen.set(v, (seen.get(v) || 0) + 1); }
      else { otherLong++; otherLongBytes += len; }
    }
    i = j + 1;
  }
  let distinctBytes = 0;
  for (const v of seen.keys()) distinctBytes += v.length + 2;
  return {
    min, strings, bytes, distinct: seen.size, distinctBytes,
    duplicateBytes: bytes - distinctBytes,
    duplicateSharePct: buf.length ? Number((100 * (bytes - distinctBytes) / buf.length).toFixed(2)) : 0,
    payloadSharePct: buf.length ? Number((100 * bytes / buf.length).toFixed(2)) : 0,
    otherLong, otherLongBytes,
  };
}

// ================================================================== step 1: what the table holds
// THE BLOB TABLE'S PAYLOADS, BY DECODED SHAPE. The format 3 note asserted that the table holds
// "distinct hypervector payloads as deflated base64 of int8" and that a bipolar vector would pack
// 10.7x smaller. Whether that is true of THIS organism is a measurement, not a premise, so the
// table is expanded and every payload classified before any packing is designed for it.
const B64_TEXT = /^[A-Za-z0-9+/]+={0,2}$/;
export function classifyPayload(s) {
  const colon = s.indexOf(':');
  if (colon > 0 && B64_TEXT.test(s.slice(colon + 1))) {
    // core/signal.mjs packHV: "b<lanes>:<base64 of one bit per lane>", already packed
    const b = Buffer.from(s.slice(colon + 1), 'base64');
    if (b.toString('base64') === s.slice(colon + 1)) return { kind: 'packedHV', decodedBytes: b.length, elements: Number(s.slice(1, colon)) || 0, bipolar: false };
  }
  if (B64_TEXT.test(s)) {
    const b = Buffer.from(s, 'base64');
    if (b.toString('base64') !== s) return { kind: 'nonCanonicalBase64', decodedBytes: 0, elements: 0, bipolar: false };
    let bip = b.length > 0;
    for (let i = 0; i < b.length; i++) { const x = b[i]; if (x !== 1 && x !== 255) { bip = false; break; } }
    return { kind: bip ? 'int8Bipolar' : 'base64Bytes', decodedBytes: b.length, elements: b.length, bipolar: bip };
  }
  return { kind: 'text', decodedBytes: 0, elements: 0, bipolar: false };
}

// The histogram the contract asks for: for each distinct decoded length, how many payloads, how
// many bytes of document text they hold, the decoded byte length, and whether every element is
// bipolar. Rows are the table's own entries, so every one of them is already distinct.
export function blobHistogram(buf) {
  const top = members(buf, ws(buf, 0));
  const entry = top.find(([k]) => k === 'blobs');
  if (!entry) return null;
  const table = JSON.parse(buf.toString('utf8', entry[1], entry[2]));
  const texts = expandBlobTable(table);
  const by = new Map();
  let textBytes = 0, bipolarCount = 0, bipolarTextBytes = 0, bipolarElements = 0;
  for (const s of texts) {
    const c = classifyPayload(s);
    textBytes += s.length;
    if (c.bipolar) { bipolarCount++; bipolarTextBytes += s.length; bipolarElements += c.elements; }
    const key = c.kind + ':' + c.decodedBytes;
    let row = by.get(key);
    if (!row) { row = { kind: c.kind, decodedBytes: c.decodedBytes, elements: c.elements, bipolar: c.bipolar, count: 0, textBytes: 0 }; by.set(key, row); }
    row.count++; row.textBytes += s.length;
    if (!c.bipolar) row.bipolar = false;
  }
  const rows = [...by.values()].sort((a, b) => b.textBytes - a.textBytes);
  return {
    enc: table.enc, count: texts.length, tableBytes: entry[2] - entry[1],
    payloadTextBytes: textBytes,
    bipolarCount, bipolarTextBytes, bipolarElements,
    // what one bit per element would cost those payloads, before any deflate
    bipolarPackedBytes: Math.ceil(bipolarElements / 8),
    rows: rows.slice(0, 16),
    distinctLengths: by.size,
  };
}

// ================================================================== step 1: what a section carries
// A SECTION BY SHAPE. 34.6 MB of inflight and 7.5 MB of mailboxes survived the format 3 blob pass;
// this says what those bytes ARE, so the next encoding is aimed at a shape that exists. A
// reference ("~b1234") is counted on its own, because a reference is what a payload BECOMES and
// counting it as a short string would hide the fact that the payload already left.
const CENSUS_REF = /^~b[0-9]+$/;
function newShapeAcc() {
  return {
    numberListBytes: 0, numberLists: 0,
    numericKeyObjectBytes: 0, numericKeyObjects: 0,
    shortStringBytes: 0, shortStrings: 0,
    longStringBytes: 0, longStrings: 0,
    blobRefBytes: 0, blobRefs: 0,
    scalarBytes: 0, scalars: 0,
    frameBytes: 0, totalBytes: 0,
  };
}
function censusWalk(buf, s, e, acc) {
  const c = buf[s];
  if (c === LS) {
    if (isFlatNumberList(buf, s, e)) { acc.numberListBytes += e - s; acc.numberLists++; return; }
    let inner = 0;
    for (const [a, b] of elements(buf, s)) { censusWalk(buf, a, b, acc); inner += b - a; }
    acc.frameBytes += (e - s) - inner;
    return;
  }
  if (c === LB) {
    const ms = members(buf, s);
    let numeric = ms.length > 0;
    for (const [k] of ms) if (!/^[0-9]+$/.test(k)) { numeric = false; break; }
    // a typed array that went through JSON.stringify without a toJSON is an object of numeric keys
    if (numeric) { acc.numericKeyObjectBytes += e - s; acc.numericKeyObjects++; return; }
    let inner = 0;
    for (const [, a, b] of ms) { censusWalk(buf, a, b, acc); inner += b - a; }
    acc.frameBytes += (e - s) - inner;
    return;
  }
  if (c === Q) {
    const len = e - s - 2; // the string's own characters, which is what BLOB_MIN is measured in
    const v = buf.toString('latin1', s + 1, e - 1);
    if (CENSUS_REF.test(v)) { acc.blobRefBytes += e - s; acc.blobRefs++; }
    else if (len >= 48) { acc.longStringBytes += e - s; acc.longStrings++; }
    else { acc.shortStringBytes += e - s; acc.shortStrings++; }
    return;
  }
  acc.scalarBytes += e - s; acc.scalars++;
}
export function shapeCensus(buf, s, e) {
  const acc = newShapeAcc();
  censusWalk(buf, s, e, acc);
  acc.totalBytes = e - s;
  return acc;
}

// The public measurement: a snapshot file in, a byte table out.
export function measureSnapshot(file, { census = true, shapes = true, blobs = true } = {}) {
  const buf = readAll(file);
  const top = members(buf, ws(buf, 0));
  const sections = {};
  let summed = 0;
  for (const [key, s, e] of top) { sections[key] = e - s; summed += e - s; }
  const cellsEntry = top.find(([k]) => k === 'cells');
  const acc = { byField: {}, byStateKey: {}, numberListBytes: 0, numberLists: 0, scalarBytes: 0, cells: 0, total: 0 };
  if (cellsEntry) for (const [s, e] of elements(buf, cellsEntry[1])) cellAccount(buf, s, e, acc);
  let sectionShapes = null, stateKeyShapes = null;
  if (shapes) {
    sectionShapes = {};
    for (const [key, s, e] of top) if (key === 'inflight' || key === 'mailboxes' || key === 'outbox') sectionShapes[key] = shapeCensus(buf, s, e);
    stateKeyShapes = {};
    if (cellsEntry) {
      for (const [cs] of elements(buf, cellsEntry[1])) {
        for (const [key, vs, ve] of members(buf, cs)) {
          if (key !== 'state') continue;
          for (const [k2, s2, e2] of members(buf, vs)) {
            if (!STATE_KEYS.includes(k2)) continue;
            if (!stateKeyShapes[k2]) stateKeyShapes[k2] = newShapeAcc();
            censusWalk(buf, s2, e2, stateKeyShapes[k2]);
            stateKeyShapes[k2].totalBytes += e2 - s2;
          }
        }
      }
    }
  }
  return {
    bytes: buf.length,
    sections,
    frame: buf.length - summed, // keys, colons, commas and the outer braces
    cellFields: {
      cells: acc.cells, cellsBytes: acc.total,
      byField: acc.byField, byStateKey: acc.byStateKey,
      numberListBytes: acc.numberListBytes, numberLists: acc.numberLists,
      otherBytes: acc.total - acc.numberListBytes,
    },
    payloads: census ? payloadCensus(buf) : null,
    sectionShapes, stateKeyShapes,
    blobs: blobs ? blobHistogram(buf) : null,
  };
}
// The cell state keys the contract names, measured by shape the same way the sections are.
const STATE_KEYS = ['vecs', 'values', 'times', 'keys', 'labels'];

// The four sections restore has to reproduce, compared as the bytes they occupy on disk: byte
// identity is stricter than a field walk and cannot miss a field nobody listed. The cells
// section is compared cell by cell, so a cell that does differ is named with the field that
// moved instead of being reported as one large unequal span.
//
// ONE field is excluded, and only after measuring what it is: the world cells (world.http,
// world.fs, world.proc) carry `queuedAtSnapshot`, which records how deep their queue was AT
// the moment the checkpoint was written. A brain restored from that checkpoint has an empty
// queue, so it records 0 and can never reproduce the original figure. Measured on 12 majors
// and 256 units before this change: 3 cells differ, in that field alone (31, 31 and 15
// against 0), under format 2 as well as format 3. Every other field of every other cell is
// byte identical.
const IDENTITY = ['clock', 'stats', 'cells', 'connectome'];
const RESTORE_DRIFT = ['queuedAtSnapshot'];

function sectionSpans(buf, keys) {
  const out = {};
  for (const [key, s, e] of members(buf, ws(buf, 0))) if (!keys || keys.includes(key)) out[key] = [s, e];
  return out;
}
export function compareSnapshots(fileA, fileB, { keys = IDENTITY, ignoreCellFields = RESTORE_DRIFT } = {}) {
  const a = readAll(fileA), b = readAll(fileB);
  const A = sectionSpans(a, keys), B = sectionSpans(b, keys);
  const differs = [], ignored = [];
  for (const k of keys) {
    if (!A[k] || !B[k]) { differs.push(k + ': missing in ' + (A[k] ? 'B' : 'A')); continue; }
    const sa = a.subarray(A[k][0], A[k][1]), sb = b.subarray(B[k][0], B[k][1]);
    if (sa.length === sb.length && sa.equals(sb)) continue;
    if (k !== 'cells') { differs.push(k + ': ' + sa.length + ' vs ' + sb.length + ' bytes, not identical'); continue; }
    const ea = elements(a, A[k][0]), eb = elements(b, B[k][0]);
    if (ea.length !== eb.length) { differs.push('cells: ' + ea.length + ' vs ' + eb.length + ' cells'); continue; }
    for (let i = 0; i < ea.length; i++) {
      const ca = a.subarray(ea[i][0], ea[i][1]), cb = b.subarray(eb[i][0], eb[i][1]);
      if (ca.length === cb.length && ca.equals(cb)) continue;
      const ja = JSON.parse(ca.toString('utf8')), jb = JSON.parse(cb.toString('utf8'));
      for (const f of new Set([...Object.keys(ja), ...Object.keys(jb)])) {
        const fa = JSON.stringify(ja[f]), fb = JSON.stringify(jb[f]);
        if (fa === fb) continue;
        if (f === 'state' && typeof ja[f] === 'object' && ja[f] !== null && typeof jb[f] === 'object' && jb[f] !== null) {
          for (const g of new Set([...Object.keys(ja[f]), ...Object.keys(jb[f])])) {
            const ga = JSON.stringify(ja[f][g]), gb = JSON.stringify(jb[f][g]);
            if (ga === gb) continue;
            (ignoreCellFields.includes(g) ? ignored : differs).push(ja.id + '.state.' + g + ': ' + String(ga).slice(0, 80) + ' vs ' + String(gb).slice(0, 80));
          }
          continue;
        }
        (ignoreCellFields.includes(f) ? ignored : differs).push(ja.id + '.' + f + ': ' + String(fa).slice(0, 80) + ' vs ' + String(fb).slice(0, 80));
      }
    }
  }
  return { identical: differs.length === 0, differs: differs.slice(0, 20), differCount: differs.length, ignored: ignored.slice(0, 8), ignoredCount: ignored.length };
}

// ================================================================== the fixture organism
// A small brain that carries the thing this format change is about: hypervector payloads that
// repeat, in cell state, in the signals in flight and in the mailboxes at once. It is built
// here rather than in the test so that test/fixtures/checkpoint-v2/snapshot.json and the brain
// the test compares it against come from ONE definition.
//
//   node bench/checkpoint.mjs --make-fixture [--fixture-ticks 30]
//
// writes that fixture as a FORMAT 2 file through the unchanged format 2 writer, which is
// exactly what the code wrote before 2026-09-18.
export async function buildFixtureBrain({ seed = 'checkpoint-fixture', ticks = 30 } = {}) {
  const { Brain } = await import('../core/brain.mjs');
  await import('../cells/all.mjs');
  const b = new Brain({ name: 'checkpoint-fixture', seed, dir: null, ledger: 'off', growth: { enabled: false }, pruneEvery: 0 });
  b.addRegion('fix');
  b.addCell({ id: 'src', kind: 'source.const', region: 'fix', params: { kind: 'event', data: { tokens: ['alpha', 'beta', 'gamma'] } } });
  b.addCell({ id: 'enc', kind: 'encode.hv', region: 'fix' });
  b.addCell({ id: 'perm', kind: 'hv.permute', region: 'fix', params: { k: 3 } });
  b.addCell({ id: 'bund', kind: 'hv.bundle', region: 'fix' });
  b.addCell({ id: 'clean', kind: 'hv.cleanup', region: 'fix' });
  b.addCell({ id: 'mem', kind: 'memory.assoc', region: 'fix' });
  b.addCell({ id: 'log', kind: 'sink.log', region: 'fix' });
  b.connect('src', 'out', 'enc', 'in');
  b.connect('enc', 'hv', 'perm', 'in');
  b.connect('enc', 'hv', 'bund', 'in', { delay: 2 }); // a delay leaves signals in flight at the checkpoint
  b.connect('perm', 'out', 'bund', 'in', { delay: 1 });
  b.connect('bund', 'out', 'clean', 'hv');
  b.connect('perm', 'out', 'mem', 'key');
  b.connect('src', 'out', 'mem', 'value');
  b.connect('enc', 'hv', 'mem', 'query', { delay: 3 });
  b.connect('bund', 'out', 'log', 'in', { delay: 4 });
  b.tick(ticks);
  return b;
}

if (isMain && has('make-fixture')) {
  const b = await buildFixtureBrain({ ticks: Number(opt('fixture-ticks', 30)) });
  const dir = path.join(ROOT, 'test', 'fixtures', 'checkpoint-v2');
  mkdirSync(dir, { recursive: true });
  const file = b.snapshot(dir, { version: 2 });
  console.log('wrote ' + file + ' ' + statSync(file).size + ' bytes, version 2');
  process.exit(0);
}

// ================================================================== child mode
// One row in a brand new process, printing exactly one JSON line on stdout. Built, ticked and
// snapshotted through the same public build bench/footprint.mjs runChildRow uses.
async function runChildRow() {
  const { buildWhole, restoreWhole } = await import('../seeds/whole.mjs');
  const { closeWorld } = await import('../world/index.mjs');
  const majors = Number(opt('majors', 12));
  const substrateUnits = Number(opt('units', 256));
  const ticks = Number(opt('ticks', 200));
  const label = String(opt('label', String(majors)));
  const seed = String(opt('seed', 'checkpoint-' + label));
  const formats = String(opt('formats', '3,4')).split(',').map(Number);

  const shutdown = (brain) => {
    try { closeWorld(brain); } catch { /* nothing open */ }
    const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
    if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
  };

  const dirs = formats.map((v) => path.join(ROOT, 'state', 'checkpoint-' + label + '-v' + v));
  const roundTrip = path.join(ROOT, 'state', 'checkpoint-' + label + '-rt');
  let brain = null;
  try {
    for (const d of [...dirs, roundTrip]) rmSync(d, { recursive: true, force: true });
    const built = buildWhole({ majors, substrateUnits, ledger: 'off', name: 'checkpoint-' + label, seed });
    brain = built.brain;
    brain.tick(ticks);

    // INTERLEAVED: the same ticked brain writes every format back to back, so the arms differ
    // by the format alone. Order is the order given on the command line.
    //
    // Formats 2 and 4 come straight out of brain.snapshot: core/brain.mjs line 288 passes
    // `intern: version >= 3`, a BOOLEAN, and core/persist.mjs writes its current best table for
    // `true`, which is format 4. That boolean cannot name format 3, so the format 3 arm is
    // written from the document the format 4 file READS BACK AS, with intern 3. That document is
    // the same organism at the same tick, and `reparseIdentical` proves the detour costs nothing:
    // re-writing the same parsed document with intern 4 reproduces brain.snapshot's own bytes.
    const arms = {};
    let reparseIdentical = null;
    // highest format first, because the format 3 arm is written FROM the format 4 file
    const writeOrder = [...formats].sort((a, b) => b - a);
    for (const version of writeOrder) {
      const dir = dirs[formats.indexOf(version)];
      let file;
      const t0 = now();
      if (version === 3) {
        const src = arms[4] ? arms[4].file : brain.snapshot(dir, { version: 3 });
        const doc = readJSONStreamed(src);
        mkdirSync(dir, { recursive: true });
        file = path.join(dir, 'snapshot.json');
        writeJSONStreamed(file, doc, { intern: 3 });
        if (arms[4] && reparseIdentical === null) {
          const check = path.join(ROOT, 'state', 'checkpoint-' + label + '-reparse.json');
          writeJSONStreamed(check, doc, { intern: 4 });
          reparseIdentical = readAll(check).equals(readAll(src));
          rmSync(check, { force: true });
        }
      } else {
        file = brain.snapshot(dir, { version: version === 4 ? 3 : version });
      }
      const writeMs = now() - t0;
      const m = measureSnapshot(file);
      arms[version] = {
        version, file, checkpointBytes: m.bytes, checkpointMB: bytesToMB(m.bytes),
        writeMs: Number(writeMs.toFixed(1)),
        sections: m.sections, frame: m.frame, cellFields: m.cellFields, payloads: m.payloads,
        sectionShapes: m.sectionShapes, stateKeyShapes: m.stateKeyShapes, blobs: m.blobs,
      };
    }

    // Restore, timed, per format, with the round trip identity check: the restored brain writes
    // its own snapshot in the SAME format and the two files' identity sections are compared. The
    // restored brain is shut down and dropped before the next format is restored, so a 1000
    // major row never holds two organisms at once.
    //
    // The round trip is written through brain.snapshot, which takes 2 or 3 only. A format 3 and a
    // format 4 document are byte identical apart from the `blobs` member (the same interner, the
    // same references, the same escapes, only a different table encoding), and the compared
    // sections exclude `blobs`, so a format 3 arm's round trip written with a format 4 table is a
    // fair comparison. `armsIdenticalSections` below MEASURES that instead of assuming it.
    const crossFiles = {};
    for (let i = 0; i < formats.length; i++) {
      const version = formats[i], dir = dirs[i];
      const t0 = now();
      const r = restoreWhole(dir, { ledger: 'off' });
      const restoreMs = now() - t0;
      rmSync(roundTrip, { recursive: true, force: true });
      const back = r.brain.snapshot(roundTrip, { version: version === 4 ? 3 : version });
      const cmp = compareSnapshots(path.join(dir, 'snapshot.json'), back);
      arms[version].restoreMs = Number(restoreMs.toFixed(1));
      arms[version].restoredIdentical = cmp.identical;
      arms[version].restoreDiffers = cmp.differs;
      arms[version].restoreIgnored = cmp.ignored;
      arms[version].restoreIgnoredCount = cmp.ignoredCount;
      // the same restored brain, written once as format 3, is what the cross format check
      // compares: a format 2 file and a format 3 file of the same organism must restore to the
      // same organism, which is the whole claim of the format change
      crossFiles[version] = path.join(ROOT, 'state', 'checkpoint-' + label + '-x' + version);
      rmSync(crossFiles[version], { recursive: true, force: true });
      r.brain.snapshot(crossFiles[version], { version: 3 });
      shutdown(r.brain);
    }
    let crossIdentical = null;
    if (formats.length >= 2) {
      const lo = formats[0], hi = formats[formats.length - 1];
      crossIdentical = compareSnapshots(path.join(crossFiles[lo], 'snapshot.json'), path.join(crossFiles[hi], 'snapshot.json'));
    }
    for (const d of Object.values(crossFiles)) rmSync(d, { recursive: true, force: true });

    // the two table encodings, on disk, outside the table: this is the claim that format 4 changed
    // the table and NOTHING about the document
    let armsIdenticalSections = null;
    if (arms[3] && arms[4]) armsIdenticalSections = compareSnapshots(arms[3].file, arms[4].file).identical;

    const best = arms[formats[formats.length - 1]];
    for (const a of Object.values(arms)) delete a.file; // a scratch path is not a measurement
    const result = {
      ok: true, majors, substrateUnits, ticks, label, seed,
      cells: brain.cells.length, edges: brain.connectome.size(),
      arms, crossIdentical, reparseIdentical, armsIdenticalSections,
      checkpointBytes: best.checkpointBytes, checkpointMB: best.checkpointMB,
      sections: best.sections, cellFields: best.cellFields,
      restoreMs: best.restoreMs, restoredIdentical: best.restoredIdentical,
    };
    process.stdout.write(JSON.stringify(result) + '\n');
  } finally {
    if (brain) shutdown(brain);
    // --keep leaves the scratch checkpoints on disk for inspection; the sweep never passes it.
    if (!has('keep')) for (const d of [...dirs, roundTrip]) rmSync(d, { recursive: true, force: true });
  }
}

if (isMain && has('child-row')) {
  await runChildRow();
  process.exit(0);
}

// ================================================================== parent mode
if (isMain) {
const BUDGET_MB = POCKET_CHECKPOINT_MB;
const majorsList = String(opt('majors', '12,100,1000')).split(',').map(Number);
const units = Number(opt('units', 256));
const ticks = Number(opt('ticks', 200));
const extraMajors = Number(opt('extra-majors', 12));
const extraUnits = Number(opt('extra-units', 100_000));
const rowBudgetMs = Number(opt('row-budget-ms', 20 * 60_000));
const formats = String(opt('formats', '3,4'));

function spawnRow(majors, substrateUnits, label) {
  // the 1000 major row holds a 225 MB format 2 document and its round trip copy in memory at
  // once, which is past the default heap on this machine
  const rowArgs = ['--max-old-space-size=12288', SELF, '--child-row', '--majors', String(majors), '--units', String(substrateUnits),
    '--ticks', String(ticks), '--label', label, '--seed', 'checkpoint-' + majors + 'x' + substrateUnits, '--formats', formats];
  const t0 = now();
  const res = spawnSync(process.execPath, rowArgs, { encoding: 'utf8', cwd: ROOT, maxBuffer: 1024 * 1024 * 64, timeout: rowBudgetMs });
  const wallMs = Number((now() - t0).toFixed(1));
  if (res.error && res.error.code === 'ETIMEDOUT') return { ok: false, majors, substrateUnits, label, wallMs, reason: 'killed after ' + wallMs + ' ms, over the ' + rowBudgetMs + ' ms budget' };
  if (res.status !== 0) return { ok: false, majors, substrateUnits, label, wallMs, reason: 'child exited ' + res.status + ': ' + String(res.stderr || '').slice(-2000) };
  const line = String(res.stdout || '').trim().split('\n').filter(Boolean).pop();
  if (!line) return { ok: false, majors, substrateUnits, label, wallMs, reason: 'no JSON line on stdout' };
  let row;
  try { row = JSON.parse(line); } catch (e) { return { ok: false, majors, substrateUnits, label, wallMs, reason: 'bad JSON: ' + e.message }; }
  row.wallMs = wallMs;
  return row;
}

function topN(obj, n) {
  return Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => k + ' ' + v).join(', ');
}

function shapeLine(s) {
  return 'total ' + s.totalBytes + ' B = number lists ' + s.numberListBytes + ' (' + s.numberLists + ')'
    + ', numeric key objects ' + s.numericKeyObjectBytes + ' (' + s.numericKeyObjects + ')'
    + ', strings under 48 ' + s.shortStringBytes + ' (' + s.shortStrings + ')'
    + ', strings 48 or more ' + s.longStringBytes + ' (' + s.longStrings + ')'
    + ', blob references ' + s.blobRefBytes + ' (' + s.blobRefs + ')'
    + ', scalars ' + s.scalarBytes + ' (' + s.scalars + ')'
    + ', frame ' + s.frameBytes;
}

function printRow(r) {
  if (!r.ok) { console.log('majors ' + r.majors + ' units ' + r.substrateUnits + ': NO, ' + r.reason); return; }
  const vs = Object.keys(r.arms).map(Number).sort((a, b) => a - b);
  const lo = r.arms[vs[0]], hi = r.arms[vs[vs.length - 1]];
  const head = 'majors ' + r.majors + ' units ' + r.substrateUnits + ' (' + r.cells + ' cells, ' + r.edges + ' edges)';
  if (lo !== hi) {
    const ratio = Number((lo.checkpointBytes / hi.checkpointBytes).toFixed(3));
    console.log(head + ': v' + lo.version + ' ' + lo.checkpointBytes + ' B (' + lo.checkpointMB + ' MB) -> v' + hi.version + ' ' + hi.checkpointBytes + ' B (' + hi.checkpointMB + ' MB), ' + ratio + 'x smaller, budget ' + BUDGET_MB + ' MB ' + (hi.checkpointMB <= BUDGET_MB ? 'MET' : 'MISSED'));
    console.log('  restoreMs v' + lo.version + ' ' + lo.restoreMs + ' -> v' + hi.version + ' ' + hi.restoreMs + ', restoredIdentical v' + lo.version + ' ' + lo.restoredIdentical + ' v' + hi.version + ' ' + hi.restoredIdentical + ', cross format identical ' + (r.crossIdentical ? r.crossIdentical.identical : 'n/a') + ', reparse identical ' + r.reparseIdentical + ', the two arms identical outside the table ' + r.armsIdenticalSections);
  } else {
    console.log(head + ': v' + hi.version + ' ' + hi.checkpointBytes + ' B (' + hi.checkpointMB + ' MB), restoreMs ' + hi.restoreMs + ', restoredIdentical ' + hi.restoredIdentical);
  }
  for (const v of vs) {
    const a = r.arms[v];
    console.log('  v' + v + ' sections: ' + topN(a.sections, 6) + ', frame ' + a.frame);
    console.log('  v' + v + ' cell fields: ' + topN(a.cellFields.byField, 6));
    console.log('  v' + v + ' cell state keys: ' + topN(a.cellFields.byStateKey, 6));
    console.log('  v' + v + ' cells ' + a.cellFields.cells + ', number lists ' + a.cellFields.numberLists + ' holding ' + a.cellFields.numberListBytes + ' B of the ' + a.cellFields.cellsBytes + ' B of cells, everything else ' + a.cellFields.otherBytes + ' B');
    const p = a.payloads;
    if (p) console.log('  v' + v + ' payload census (>= ' + p.min + ' B): ' + p.strings + ' strings holding ' + p.bytes + ' B (' + p.payloadSharePct + '% of the file), ' + p.distinct + ' distinct holding ' + p.distinctBytes + ' B, duplicate ' + p.duplicateBytes + ' B (' + p.duplicateSharePct + '% of the file)');
    const b = a.blobs;
    if (b) {
      console.log('  v' + v + ' blob table ' + b.enc + ': ' + b.count + ' payloads, ' + b.tableBytes + ' B on disk, ' + b.payloadTextBytes + ' B of payload text, ' + b.distinctLengths + ' distinct (kind, length) pairs');
      console.log('  v' + v + ' of those, bipolar int8: ' + b.bipolarCount + ' payloads, ' + b.bipolarTextBytes + ' B of text, ' + b.bipolarElements + ' elements, ' + b.bipolarPackedBytes + ' B at one bit each');
      for (const row of b.rows) console.log('    ' + row.kind + ' decoded ' + row.decodedBytes + ' B: count ' + row.count + ', text ' + row.textBytes + ' B, elements ' + row.elements + ', every element bipolar ' + row.bipolar);
    }
    if (a.sectionShapes) for (const k of Object.keys(a.sectionShapes)) console.log('  v' + v + ' ' + k + ' by shape: ' + shapeLine(a.sectionShapes[k]));
    if (a.stateKeyShapes) for (const k of Object.keys(a.stateKeyShapes)) console.log('  v' + v + ' cell state.' + k + ' by shape: ' + shapeLine(a.stateKeyShapes[k]));
  }
}

const rows = [];
for (const majors of majorsList) {
  const r = spawnRow(majors, units, String(majors) + 'x' + units);
  printRow(r);
  rows.push(r);
}
let extraRow = null;
if (!has('no-extra')) {
  extraRow = spawnRow(extraMajors, extraUnits, String(extraMajors) + 'x' + extraUnits);
  printRow(extraRow);
}

const all = [...rows, extraRow].filter(Boolean);
const bar = {
  budgetMB: BUDGET_MB,
  rowsMeasured: all.filter((r) => r.ok).length,
  allRestoredIdentical: all.filter((r) => r.ok).every((r) => Object.values(r.arms).every((a) => a.restoredIdentical === true)),
  crossFormatIdentical: all.filter((r) => r.ok && r.crossIdentical).every((r) => r.crossIdentical.identical),
  // the format 4 claim: the table changed and the document around it did not
  armsIdenticalOutsideTable: all.filter((r) => r.ok && r.armsIdenticalSections !== null && r.armsIdenticalSections !== undefined).every((r) => r.armsIdenticalSections === true),
  underBudget: all.filter((r) => r.ok).map((r) => ({ label: r.label, mb: r.checkpointMB, met: r.checkpointMB <= BUDGET_MB })),
};
console.log('bar: rows ' + bar.rowsMeasured + ', every row restored identical ' + bar.allRestoredIdentical + ', cross format identical ' + bar.crossFormatIdentical + ', arms identical outside the table ' + bar.armsIdenticalOutsideTable);
for (const u of bar.underBudget) console.log('  ' + u.label + ': ' + u.mb + ' MB against the ' + BUDGET_MB + ' MB budget: ' + (u.met ? 'met' : 'MISSED'));

// ---------------------------------------------------------------- verdict
// Written after the measurement and after every row's exit code is known, never before.
const verdict = {
  at: new Date().toISOString(), node: process.version,
  command: ['node', path.relative(ROOT, SELF).split(path.sep).join('/'), ...args].join(' '),
  units, ticks, formats,
  budgetMB: BUDGET_MB,
  rows: all.map((r) => (r.ok ? {
    majors: r.majors, units: r.substrateUnits, ticks: r.ticks, label: r.label,
    cells: r.cells, edges: r.edges,
    checkpointBytes: r.checkpointBytes, checkpointMB: r.checkpointMB,
    sections: r.sections, cellFields: r.cellFields,
    restoreMs: r.restoreMs, restoredIdentical: r.restoredIdentical,
    arms: r.arms, crossIdentical: r.crossIdentical, wallMs: r.wallMs,
    // printed by printRow and carried here too: a claim the run makes is a claim the verdict holds
    reparseIdentical: r.reparseIdentical, armsIdenticalSections: r.armsIdenticalSections,
  } : { majors: r.majors, units: r.substrateUnits, label: r.label, ok: false, reason: r.reason, wallMs: r.wallMs })),
  bar,
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
const file = path.join(HERE, 'verdicts', 'checkpoint.json');
writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
console.log('wrote ' + file);
} // isMain
