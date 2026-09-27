// test/contamination-split.test.mjs: every writer board 19 gave a split object (queue item 10, B2).
// board 19 builder.
//
// For each bench (or tool) that writes one of the 29 bar verdicts the gate's CONTAMINATION row
// named, the file now carries a pure `export function splitFor(opts)`. This test reads that
// function's own source text out of the file (many of these benches run their whole bar at top
// level when imported, so importing them is not an option), compiles it alone, and runs it on
// planted options. Each planted split must be an object with development, heldOut and
// contaminated fields, heldOut and development must be objects (never a string), and contaminated
// must be false or a one sentence reason. Then the planted splits are written as bar verdicts into
// a temp directory and graded by the gate's own functions (contaminationRecords and
// contaminationRow, imported from bench/gate.mjs): the row is GREEN on them. CONTROL: the same
// directory with one verdict's split replaced by the dataset-name string it used to carry is RED
// and names that file, so the green is the split objects and nothing else.
// Also checked: each writer file puts the split into the verdict it writes (a `split: splitFor(`
// line), so the function is not dead code. No model, no socket, nothing written in the real tree.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { contaminationRecords, contaminationRow, splitShapeOf } from '../bench/gate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The source text of `export function splitFor(...) {...}` in a file, found by a quote-aware brace walk. */
export function splitForSource(file) {
  const src = readFileSync(path.join(ROOT, file), 'utf8');
  const start = src.indexOf('export function splitFor(');
  if (start < 0) throw new Error(file + ': no export function splitFor(');
  let i = src.indexOf('{', src.indexOf(')', start));
  let depth = 0, q = null;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') { i++; continue; } if (c === q) q = null; continue; }
    if (c === '\'' || c === '"' || c === '`') { q = c; continue; }
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw new Error(file + ': splitFor has no closing brace');
}

/** The function alone, compiled as its own module: it must need nothing from the file around it. */
async function loadSplitFor(file) {
  const dir = mkdtempSync(path.join(tmpdir(), 'split-for-'));
  const mf = path.join(dir, path.basename(file).replace(/\.mjs$/, '') + '.split.mjs');
  writeFileSync(mf, splitForSource(file));
  const mod = await import(pathToFileURL(mf).href);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(typeof mod.splitFor, 'function', file);
  return mod.splitFor;
}

// Every writer changed, the verdicts it writes, and planted options for each mode it has.
const WRITERS = [
  { file: 'bench/budget.mjs', verdicts: ['budget'], plants: [{ cases: ['ram', 'disk', 'pass'] }, {}] },
  { file: 'tools/boundary-audit.mjs', verdicts: ['boundary'], plants: [{ boundaries: 73, drivers: 28 }] },
  { file: 'bench/senses.mjs', verdicts: ['senses'], plants: [{ senses: ['sight', 'hearing', 'touch', 'smell', 'taste'], hardware: [] }] },
  { file: 'bench/daemon.mjs', verdicts: ['daemon'], plants: [{ tasks: 1000, seed: 'whole', suites: ['algebra', 'sequence', 'grid'] }] },
  { file: 'bench/multiply.mjs', verdicts: ['multiply'], plants: [{ suite: { kind: 'grid', seed: 'grid/velocity', draws: 4, fresh: 'grid/velocity:heldout', freshMore: 4 } }], clean: true },
  { file: 'bench/velocity.mjs', verdicts: ['velocity', 'velocity-heldout'], plants: [{ mode: 'bar', seed: 'grid/velocity' }, { mode: 'draws', searched: ['grid/velocity', 'grid/velocity:draw1'], heldout: { seed: 'grid/velocity:heldout', seen: 0 }, fresh: [{ seed: 'grid/velocity:fresh1', seen: 0 }] }] },
  { file: 'bench/spawn.mjs', verdicts: ['spawn'], plants: [{ suites: ['algebra', 'sequence', 'grid'], tasks: 10 }] },
  { file: 'bench/compress.mjs', verdicts: ['compress'], plants: [{ seed: 'compress-12', tasks: 10, tierN: 200, tierKeys: 4096 }] },
  { file: 'tools/organism-census.mjs', verdicts: ['census', 'census-prune', 'census-scale-static', 'census-scale-pruned'], plants: [{ mode: 'run', seed: 'organism/gen-0', ticks: 200 }, { mode: 'static', seed: 'organism/scale-52000' }, { mode: 'sharded', seed: null, ticks: 200 }] },
  { file: 'web/ladder-bar.mjs', verdicts: ['web-ladder'], plants: [{}] },
  { file: 'bench/years.mjs', verdicts: ['years'], plants: [{ seed: 'grid/velocity', gridFresh: ['grid/velocity:heldout'], synthSeed: 'years/synthetic', devSeeds: ['years/dev'], barSeedsSeen: true }] },
  { file: 'bench/grid.mjs', verdicts: ['grid', 'grid-evaluation', 'grid-library'], plants: [{ arcSplit: 'training' }, { arcSplit: 'evaluation' }, { arcSplit: 'evaluation', library: true, corpus: ['bench/verdicts/grid.json'] }, { arcSplit: 'training', library: true, devFold: 'even' }] },
  { file: 'bench/imagine.mjs', verdicts: ['imagine'], plants: [{ arcSplit: 'training', from: 'bench/verdicts/grid.json' }, { arcSplit: 'evaluation', from: 'bench/verdicts/grid-evaluation.json' }] },
  { file: 'bench/math.mjs', verdicts: ['math'], plants: [{ split: 'test', fallback: true, n: 200, seed: 1 }, { split: 'train', fallback: false, n: 200, seed: 1 }] },
  { file: 'bench/dream.mjs', verdicts: ['dream'], plants: [{ seed: 'whole', tasks: 0 }] },
  { file: 'bench/knowledge.mjs', verdicts: ['knowledge'], plants: [{ n: 200, seed: 'knowledge-draw-2026-09-23' }], clean: true },
  { file: 'bench/code.mjs', verdicts: ['code'], plants: [{ tasks: 40, inMemory: false }], clean: true },
  { file: 'bench/synth.mjs', verdicts: ['synth'], plants: [{}] },
  { file: 'bench/native.mjs', verdicts: ['native'], plants: [{ wiki: 200, seed: 'knowledge-draw-2026-09-23' }], clean: true },
  { file: 'bench/recall.mjs', verdicts: ['recall'], plants: [{ n: 200, perSuite: 100 }] },
];

/** The shape every split must have. */
function assertSplit(s, where) {
  assert.ok(s && typeof s === 'object' && !Array.isArray(s), where + ': split is an object');
  assert.equal(splitShapeOf({ split: s }), 'object', where + ': the gate reads it as an object');
  for (const k of ['development', 'heldOut', 'contaminated']) assert.ok(k in s, where + ': has ' + k);
  for (const k of ['development', 'heldOut']) {
    assert.ok(s[k] && typeof s[k] === 'object' && !Array.isArray(s[k]), where + ': ' + k + ' is an object, never a string');
    assert.equal(typeof s[k].what, 'string', where + ': ' + k + '.what says what it is');
    assert.ok(s[k].what.length > 10, where + ': ' + k + '.what is a sentence');
  }
  assert.ok(s.contaminated === false || (typeof s.contaminated === 'string' && s.contaminated.length > 20), where + ': contaminated is false or a reason');
  assert.ok(!JSON.stringify(s).includes(String.fromCharCode(0x2014)), where + ': no em dash');
}

test('every changed writer exports a pure splitFor whose planted runs give a split object', async () => {
  let runs = 0;
  for (const w of WRITERS) {
    const splitFor = await loadSplitFor(w.file);
    for (const opts of w.plants) {
      const s = splitFor(opts);
      assertSplit(s, w.file + ' ' + JSON.stringify(opts));
      assert.deepEqual(splitFor(opts), s, w.file + ': pure (the same options give the same split)');
      runs++;
    }
    const src = readFileSync(path.join(ROOT, w.file), 'utf8');
    assert.match(src, /split: splitFor\(/, w.file + ': the verdict it writes carries split: splitFor(...)');
    assert.match(src, /board 19 builder/, w.file + ': the author line');
  }
  assert.ok(runs >= 29, 'planted runs ' + runs);
});

test('a held-out set that is really held out says contaminated false; one that is not gives the reason', async () => {
  for (const w of WRITERS.filter((x) => x.clean)) {
    const splitFor = await loadSplitFor(w.file);
    assert.equal(splitFor(w.plants[0]).contaminated, false, w.file);
  }
  const vel = await loadSplitFor('bench/velocity.mjs');
  const seenOnce = vel({ mode: 'draws', searched: ['a'], heldout: { seed: 'a:heldout', seen: 1 }, fresh: [{ seed: 'a:fresh1', seen: 0 }] });
  assert.equal(typeof seenOnce.contaminated, 'string', 'a fresh task seen in a searched draw is a contamination reason');
  assert.match(seenOnce.contaminated, /seenInSearched 1, 0/);
  const grid = await loadSplitFor('bench/grid.mjs');
  assert.equal(grid({ arcSplit: 'evaluation' }).contaminated, false);
  assert.equal(typeof grid({ arcSplit: 'training' }).contaminated, 'string');
  const years = await loadSplitFor('bench/years.mjs');
  assert.equal(years({ barSeedsSeen: false }).contaminated, false);
  assert.equal(typeof years({ barSeedsSeen: true }).contaminated, 'string');
});

test('the gate row grades the planted splits GREEN, and RED with one string split put back (control)', async () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'contam-split-'));
  try {
    const names = [];
    for (const w of WRITERS) {
      const splitFor = await loadSplitFor(w.file);
      w.verdicts.forEach((name, i) => {
        const split = splitFor(w.plants[Math.min(i, w.plants.length - 1)]);
        writeFileSync(path.join(dir, name + '.json'), JSON.stringify({ at: '2026-09-26T00:00:00.000Z', isTheBar: true, barMet: true, statement: 'planted by test/contamination-split.test.mjs', split }));
        names.push(name);
      });
    }
    assert.equal(names.length, 26, 'the 29 named verdicts less public-launch (board 18) and the two archived copies with no writer');
    const green = contaminationRow(contaminationRecords(dir));
    assert.equal(green.ok, true, green.line);
    assert.equal(green.counts.bar, 26);
    assert.equal(green.counts.withSplit, 26);
    assert.equal(green.counts.noSplit, 0);
    assert.equal(green.counts.splitNotObject, 0);
    assert.equal(green.counts.unlabelled, 0);
    // the control: grid.json with the string it carried before this item
    const g = JSON.parse(readFileSync(path.join(dir, 'grid.json'), 'utf8'));
    writeFileSync(path.join(dir, 'grid.json'), JSON.stringify({ ...g, split: 'training' }));
    const red = contaminationRow(contaminationRecords(dir));
    assert.equal(red.ok, false);
    assert.equal(red.counts.splitNotObject, 1);
    assert.match(red.line, /grid\.json \(string "training"\)/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('tools/contamination-row.mjs applies the gate row to HEAD and to the tree, and writes nothing with --nowrite', async () => {
  const { main, splitFor } = await import('../tools/contamination-row.mjs');
  assertSplit(splitFor({ rev: 'HEAD' }), 'tools/contamination-row.mjs');
  const target = path.join(ROOT, 'bench', 'verdicts', 'contamination.json');
  const beforeBytes = (() => { try { return readFileSync(target, 'utf8'); } catch { return null; } })();
  const v = await main(['--nowrite']);
  const afterBytes = (() => { try { return readFileSync(target, 'utf8'); } catch { return null; } })();
  assert.equal(afterBytes, beforeBytes, '--nowrite leaves contamination.json as it was');
  assert.equal(v.isTheBar, true);
  assert.equal(typeof v.barMet, 'boolean');
  assert.equal(v.barMet, v.after.ok === true, 'barMet is the row having no cause');
  const direct = contaminationRow(contaminationRecords(path.join(ROOT, 'bench', 'verdicts')));
  assert.deepEqual(v.after.counts, direct.counts, 'the after counts are the gate function on the same directory');
  assert.equal(v.after.withoutSplitObject, direct.counts.noSplit + direct.counts.splitNotObject);
  if (v.before.counts) assert.equal(typeof v.before.counts.bar, 'number');
});

// board 23 builder (item contamination-split): contaminated decided from the run's data, both kinds of
// row planted for each writer changed on board 23, and the re-run bar files carrying a split object.
test('board 23: senses, recall, native, knowledge and daemon decide contaminated from what the run measured', async () => {
  const senses = await loadSplitFor('bench/senses.mjs');
  const five = ['sight', 'hearing', 'touch', 'smell', 'taste'];
  assert.equal(senses({ senses: ['sight', 'touch'], hardware: ['sight', 'touch'] }).contaminated, false, 'every sense read live: clean');
  const fx = senses({ senses: five, hardware: ['sight', 'touch'] });
  assert.equal(typeof fx.contaminated, 'string');
  assert.match(fx.contaminated, /^3 of 5 senses \(hearing, smell, taste\)/);
  assert.deepEqual(fx.heldOut.fromFixture, ['hearing', 'smell', 'taste']);
  assert.equal(fx.heldOut.n, 2);
  assert.equal(typeof senses({}).contaminated, 'string', 'no sense graded is never clean');

  const recall = await loadSplitFor('bench/recall.mjs');
  assert.match(recall({ n: 200, perSuite: 100 }).contaminated, /leak check did not run/, 'an unmeasured leak count is not zero');
  assert.match(recall({ n: 200, leaks: 2 }).contaminated, /^2 hidden sentences/);
  const prior = recall({ n: 200, leaks: 0, drawSeed: 's', priorGrade: { file: 'bench/verdicts/knowledge.json', drawSeed: 's' } });
  assert.match(prior.contaminated, /bench\/verdicts\/knowledge\.json grades/);
  assert.deepEqual(prior.heldOut.gradedBefore, { file: 'bench/verdicts/knowledge.json', drawSeed: 's' });
  assert.equal(recall({ n: 200, leaks: 0, drawSeed: 's', priorGrade: null }).contaminated, false, 'no leak and no prior grade of the draw: clean');

  const native = await loadSplitFor('bench/native.mjs');
  assert.equal(native({ wiki: 200, drawnInTable: 199, drawnInControl: 0, tableRecallAt1: 122, controlRecallAt1: 122 }).contaminated, false, 'the control agrees: asking the drawn at fill moved nothing');
  const moved = native({ wiki: 200, drawnInTable: 199, drawnInControl: 0, tableRecallAt1: 130, controlRecallAt1: 122 });
  assert.match(moved.contaminated, /199 of the drawn questions, and it scored 130 at recall@1 against 122/);
  assert.equal(native({ wiki: 200, drawnInTable: 0, drawnInControl: 0, tableRecallAt1: 130, controlRecallAt1: 122 }).contaminated, false, 'none of the drawn in the table: the gap is not from them');

  const knowledge = await loadSplitFor('bench/knowledge.mjs');
  assert.equal(knowledge({ n: 200, seed: 's', leaks: 0 }).contaminated, false);
  assert.match(knowledge({ n: 200, seed: 's', leaks: 3 }).contaminated, /^3 hidden first sentences/);
  assert.equal(knowledge({ n: 200, seed: 's' }).heldOut.leaks, null, 'an unmeasured count is recorded as null, never 0');

  const daemon = await loadSplitFor('bench/daemon.mjs');
  assert.match(daemon({ suites: ['algebra', 'grid'] }).contaminated, /\(algebra, grid\)$/);
  assert.match(daemon({}).contaminated, /no suite was scored/);
});

test('board 23: the bar files re-run by their own writers carry a split object in the real tree', () => {
  const census = contaminationRecords(path.join(ROOT, 'bench', 'verdicts'));
  const byFile = new Map(census.records.map((r) => [r.file, r]));
  const rerun = ['senses.json', 'recall.json', 'native.json', 'knowledge.json', 'census-scale-pruned.json', 'daemon.json'];
  for (const f of rerun) {
    const r = byFile.get(f);
    assert.ok(r, f + ' is present');
    assert.equal(r.bar, true, f + ' is a bar file');
    assert.equal(r.split, 'object', f + ' has a split object');
    const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', f), 'utf8'));
    assertSplit(v.split, f);
    assert.ok(v.at > '2026-09-26', f + ' was written by a run after the row went red');
  }
  const row = contaminationRow(census);
  for (const f of rerun) assert.ok(!row.noSplit.includes(f), f + ' is not in the row\'s no-split list');
});

// board 23 builder (item contamination-split, FIX PASS): the verify plane found (1) an unmeasured leak
// count read as clean by bench/knowledge.mjs (and the same shape in bench/native.mjs's control), (2) a
// reason string in a split counted as clean by the gate row, which reads contaminated only when it is
// true, (3) re-run bar files with no top-level barMet, (4) daemon.json red with its cause only on
// stdout, and (5) knowledge.json graded on a scratch store that was deleted. Each case below plants
// both kinds of row, or reads the verdict the fixed writer wrote.
// Board 23 fix pass 2: the verify plane ruled that the committed board 19 plants (knowledge and native,
// no count passed, clean) stay as committed, so the unmeasured case a run can produce is the count
// passed as null (the writers always pass the key), and a call that passes no count states the
// construction rule (the board 19 planted case, asserted in the fix pass 2 test below).
test('board 23 fix pass: an unmeasured count or control is a reason, never clean', async () => {
  const knowledge = await loadSplitFor('bench/knowledge.mjs');
  const unmeasured = knowledge({ n: 200, seed: 's', leaks: null });
  assert.equal(unmeasured.heldOut.leaks, null);
  assert.equal(typeof unmeasured.contaminated, 'string', 'a leak count that was never taken is not clean');
  assert.match(unmeasured.contaminated, /leak check did not run/);
  assert.equal(knowledge({ n: 200, seed: 's', leaks: undefined }).contaminated, unmeasured.contaminated, 'a passed key with no count is the unmeasured case, not zero');
  assert.equal(knowledge({ n: 200, seed: 's', leaks: 0 }).contaminated, false, 'a measured zero is clean');

  const native = await loadSplitFor('bench/native.mjs');
  assert.match(native({ wiki: 200, seed: 's', drawnInTable: null }).contaminated, /control was not measured/, 'the fill count passed with no value');
  assert.match(native({ wiki: 200, drawnInTable: 199, drawnInControl: 0, tableRecallAt1: 122 }).contaminated, /control was not measured/, 'the drawn in the table and no control score');
  assert.equal(native({ wiki: 200, drawnInTable: 0, drawnInControl: 0 }).contaminated, false, 'none of the drawn in the table: nothing for them to move');
  assert.equal(native({ wiki: 200, drawnInTable: 199, drawnInControl: 0, tableRecallAt1: 122, controlRecallAt1: 122 }).contaminated, false, 'measured and equal: clean');

  const recall = await loadSplitFor('bench/recall.mjs');
  assert.match(recall({ n: 200, leaks: null }).contaminated, /leak check did not run/);
});

test('board 23 fix pass: the gate counts a split reason only with the top-level mark, and labels it only when the statement says so', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'contam-mark-'));
  try {
    const split = { development: { what: 'the development records of a planted bench' }, heldOut: { what: 'none: a planted bar with no held-out set', n: 0 }, contaminated: 'no held-out set: the planted bar is scored on its own development records' };
    const put = (v) => writeFileSync(path.join(dir, 'planted.json'), JSON.stringify({ at: '2026-09-26T00:00:00.000Z', isTheBar: true, barMet: true, split, ...v }));
    put({ statement: 'a planted bar' });
    let row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.counts.contaminated, 0, 'CONTROL: a reason string alone is counted clean (the gate reads contaminated only when it is true)');
    assert.equal(row.ok, true);
    put({ contaminated: true, statement: 'a planted bar' });
    row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, false, 'marked and not said: RED');
    assert.deepEqual(row.unlabelled, ['planted.json']);
    put({ contaminated: true, statement: 'a planted bar. Contaminated: ' + split.contaminated + '.' });
    row = contaminationRow(contaminationRecords(dir));
    assert.equal(row.ok, true, row.line);
    assert.deepEqual(row.labelled, ['planted.json']);
    assert.equal(row.counts.contaminated, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('board 23 fix pass: every bar file this item re-ran is counted by the gate as its split says, with a top-level barMet', () => {
  const census = contaminationRecords(path.join(ROOT, 'bench', 'verdicts'));
  const byFile = new Map(census.records.map((r) => [r.file, r]));
  // fix pass 2: the two census files left this list; their writer (tools/organism-census.mjs) may carry
  // the split only, so they are graded in the fix pass 2 test below
  const rerun = ['senses.json', 'recall.json', 'native.json', 'knowledge.json', 'daemon.json'];
  let marked = 0, clean = 0;
  for (const f of rerun) {
    const r = byFile.get(f);
    assert.ok(r, f + ' is present');
    assert.equal(r.bar, true, f + ' is a bar file');
    const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', f), 'utf8'));
    assertSplit(v.split, f);
    assert.equal(typeof v.contaminated, 'boolean', f + ': written by the fixed writer (the top-level mark)');
    const reason = typeof v.split.contaminated === 'string';
    assert.equal(v.contaminated, reason, f + ': the mark is the split having a reason');
    assert.equal(r.contaminated, reason, f + ': the gate counts contaminated exactly when the split gives a reason');
    if (reason) {
      assert.equal(r.labelled, true, f + ': the statement says so');
      assert.ok(v.statement.includes(v.split.contaminated), f + ': the statement quotes the split reason');
      marked++;
    } else clean++;
  }
  assert.ok(marked > 0 && clean > 0, 'both kinds of row: ' + marked + ' marked, ' + clean + ' clean');
  for (const f of ['senses.json', 'recall.json', 'native.json', 'knowledge.json', 'daemon.json']) {
    const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', f), 'utf8'));
    assert.equal(typeof v.barMet, 'boolean', f + ': a top-level barMet');
  }
  const senses = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'senses.json'), 'utf8'));
  assert.equal(senses.barMet, senses.met);
  const know = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'knowledge.json'), 'utf8'));
  assert.equal(know.barMet, know.bar.met);
  const row = contaminationRow(census);
  for (const f of rerun) {
    assert.ok(!row.noSplit.includes(f), f + ' is not in the no-split list');
    assert.ok(!row.unlabelled.includes(f), f + ' is not contaminated and unlabelled');
  }
});

test('board 23 fix pass: daemon.json names why self-code was refused, read from its own ledger file', () => {
  const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'daemon.json'), 'utf8'));
  const A = v.phaseA;
  assert.ok(A.selfCodeFit && typeof A.selfCodeFit.floorMb === 'number', 'the floor the step was held to');
  assert.ok(Array.isArray(A.selfCodeRefusals), 'the refusals read from the ledger file');
  assert.equal(A.selfCodeRefusals.length, A.refused['self-code'], 'one ledger row per refusal the loop counted');
  for (const x of A.selfCodeRefusals) assert.ok(typeof x.why === 'string' && x.why.length > 10, 'each refusal has its reason: ' + JSON.stringify(x));
  if (A.selfCodeRefusals.length) assert.ok(v.statement.includes(A.selfCodeRefusals[A.selfCodeRefusals.length - 1].why), 'the statement names the last refusal');
  assert.equal(v.met.everyStepKind, Object.values(A.steps).every((n) => n >= 1), 'everyStepKind is the step counts');
  assert.equal(v.barMet, Object.values(v.met).every(Boolean));
});

test('board 23 fix pass: knowledge.json carries the content hash of the store it graded, and storeFingerprint tells two stores apart', async () => {
  const { storeFingerprint } = await import('../bench/knowledge.mjs');
  const dir = mkdtempSync(path.join(tmpdir(), 'store-fp-'));
  try {
    const a = path.join(dir, 'a'), b = path.join(dir, 'b');
    for (const d of [a, b]) { mkdirSync(d); writeFileSync(path.join(d, 'records.bin'), 'abc'); writeFileSync(path.join(d, 'meta.json'), '{"n":1}'); }
    const fa = storeFingerprint(a), fb = storeFingerprint(b);
    assert.equal(fa.sha256, fb.sha256, 'the same bytes hash the same');
    assert.equal(fa.files, 2);
    assert.equal(fa.bytes, 10);
    assert.deepEqual(fa.perFile.map((x) => x.name), ['meta.json', 'records.bin']);
    writeFileSync(path.join(b, 'records.bin'), 'abd');
    assert.notEqual(storeFingerprint(b).sha256, fa.sha256, 'one byte changed: another hash');
    assert.equal(storeFingerprint(path.join(dir, 'absent')), null, 'an absent store is null, never a hash');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'knowledge.json'), 'utf8'));
  assert.equal(v.store.writtenByThisRun, true);
  assert.match(v.store.fingerprint.sha256, /^[0-9a-f]{64}$/);
  if (!v.store.isDefault) {
    assert.match(v.store.default.fingerprint.sha256, /^[0-9a-f]{64}$/, 'a scratch store is compared with the default store');
    assert.equal(v.store.sameAsDefault, v.store.fingerprint.sha256 === v.store.default.fingerprint.sha256);
    assert.ok(v.statement.includes(v.store.default.dir), 'the statement names the store the graded one is compared with');
  }
});

// board 23 builder (item contamination-split, FIX PASS 2): the verify plane found the committed test
// loosened (the split: splitFor( line, the knowledge and native plants), tools/organism-census.mjs
// carrying more than the split, senses.json's heldOut.n (a count of senses) under a what naming live
// samples, and knowledge.json's --store naming a scratch directory that was deleted. Each case below
// plants both kinds of call, or reads the verdict the writer in the tree wrote.
test('board 23 fix pass 2: a call that passes no count states the board 19 construction rule; the writers always pass the key', async () => {
  const knowledge = await loadSplitFor('bench/knowledge.mjs');
  const planted = knowledge({ n: 200, seed: 'knowledge-draw-2026-09-23' });
  assert.equal(planted.contaminated, false, 'the committed board 19 plant: no count passed, the construction rule');
  assert.match(planted.heldOut.leakCheck, /^not passed/);
  assert.equal(knowledge({ n: 200, seed: 's', leaks: 0 }).heldOut.leakCheck, 'counted by the run');
  assert.equal(typeof knowledge({ n: 200, seed: 's', leaks: null }).contaminated, 'string', 'CONTROL: the key passed with no count is a reason');
  const native = await loadSplitFor('bench/native.mjs');
  const nPlanted = native({ wiki: 200, seed: 'knowledge-draw-2026-09-23' });
  assert.equal(nPlanted.contaminated, false);
  assert.match(nPlanted.heldOut.control, /^not passed/);
  assert.equal(typeof native({ wiki: 200, seed: 's', drawnInTable: null }).contaminated, 'string', 'CONTROL: the key passed with no count is a reason');
  const kSrc = readFileSync(path.join(ROOT, 'bench', 'knowledge.mjs'), 'utf8');
  assert.match(kSrc, /split: splitFor\(\{ n: g\.n, seed: DRAW_SEED, leaks: g\.leaks \}\)/, 'knowledge main() passes the leak count key');
  const nSrc = readFileSync(path.join(ROOT, 'bench', 'native.mjs'), 'utf8');
  assert.match(nSrc, /split: splitFor\(\{ wiki: BAR\.wiki, seed: DRAW_SEED, drawnInTable: inFull, drawnInControl: inControl, tableRecallAt1: S\.direct\.recallAt1, controlRecallAt1: S\.control\.recallAt1 \}\)/, 'native bar() passes the fill counts and both scores');
  const kv = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'knowledge.json'), 'utf8'));
  assert.equal(kv.split.heldOut.leakCheck, 'counted by the run', 'knowledge.json was written with the count passed');
  assert.equal(kv.split.heldOut.leaks, kv.grade.leaksExcluded, 'the split count is the grade count');
  const nv = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'native.json'), 'utf8'));
  assert.equal(nv.split.heldOut.control, 'passed by the run', 'native.json was written with the control passed');
  assert.equal(nv.split.heldOut.drawnInTable, nv.fill.drawnInTable);
  assert.equal(nv.split.heldOut.controlRecallAt1, nv.wiki.arms.control.recallAt1);
});

test('board 23 fix pass 2: senses heldOut.n counts the senses read live and heldOut.samples their live samples', async () => {
  const senses = await loadSplitFor('bench/senses.mjs');
  const s = senses({ senses: ['sight', 'hearing', 'touch', 'smell', 'taste'], hardware: ['sight', 'touch'], liveSamples: 6 });
  assert.equal(s.heldOut.n, 2);
  assert.equal(s.heldOut.samples, 6);
  assert.match(s.heldOut.what, /n counts those senses, samples counts their live samples/);
  assert.equal(senses({ senses: ['sight'], hardware: [] }).heldOut.samples, null, 'no count passed: null, never 0');
  const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'senses.json'), 'utf8'));
  const live = v.rows.filter((r) => r.present && r.samples > 0 && r.hardwareSamples === r.samples);
  assert.deepEqual(v.split.heldOut.liveHardware, live.map((r) => r.sense));
  assert.equal(v.split.heldOut.n, live.length, 'n is the senses read live');
  assert.equal(v.split.heldOut.samples, live.reduce((n, r) => n + r.hardwareSamples, 0), 'samples is their live samples, from the rows');
  assert.deepEqual(v.split.heldOut.fromFixture, v.rows.filter((r) => !live.includes(r)).map((r) => r.sense));
});

test('board 23 fix pass 2: the census files carry the split tools/organism-census.mjs writes, and nothing more from this item', () => {
  const src = readFileSync(path.join(ROOT, 'tools', 'organism-census.mjs'), 'utf8');
  const fn = src.slice(src.indexOf('export function staticVerdictOf('), src.indexOf('export function staticVerdictOf(') + 600);
  assert.match(fn, /split: splitFor\(\{ mode: 'static', seed: rel\(r\.seed\.dir\) \}\)/, 'the static verdict carries the split');
  assert.ok(!/contaminated/.test(fn.slice(0, fn.indexOf('seed: rel(r.seed.dir),'))), 'no top-level mark and no statement suffix in the static verdict head');
  const census = contaminationRecords(path.join(ROOT, 'bench', 'verdicts'));
  const byFile = new Map(census.records.map((r) => [r.file, r]));
  for (const [f, seed] of [['census-scale-static.json', 'organism/scale-52000'], ['census-scale-pruned.json', 'organism/scale-52000-pruned']]) {
    const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', f), 'utf8'));
    assertSplit(v.split, f);
    assert.equal(v.split.development.seed, seed, f + ': the split names its seed');
    assert.ok(!('contaminated' in v), f + ': no top-level mark (the writer may carry the split only)');
    assert.ok(!/Contaminated, as the split says/.test(v.statement), f + ': the statement is the static statement alone');
    assert.equal(v.command, 'node --max-old-space-size=4000 tools/organism-census.mjs --static --seed ' + seed);
    assert.ok(v.at > '2026-09-27T01:25', f + ': re-written by this pass');
    const r = byFile.get(f);
    assert.equal(r.bar, true);
    assert.equal(r.split, 'object', f + ': the gate reads a split object');
    assert.equal(typeof v.split.contaminated, 'string', f + ': the split gives its reason');
    assert.equal(r.contaminated, false, f + ': CONTROL, the gate reads contaminated only when it is true, so a reason alone is counted clean');
  }
  const pruned = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'census-scale-pruned.json'), 'utf8'));
  const stat = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'census-scale-static.json'), 'utf8'));
  assert.equal(pruned.prune.before.at, stat.at, 'the pruned census read the static census this pass wrote');
});


test('board 23 fix pass 2: the --store directory knowledge.json records is created by the run, so the command re-runs as recorded', async () => {
  const { ingest } = await import('../tools/ingest-wiki.mjs');
  const dir = mkdtempSync(path.join(tmpdir(), 'store-rerun-'));
  try {
    const dump = path.join(dir, 'tiny.xml');
    const page = (id, title, text) => ['<page>', '<title>' + title + '</title>', '<ns>0</ns>', '<id>' + id + '</id>', '<revision>', '<text xml:space="preserve">' + text + '</text>', '</revision>', '</page>'].join('\n');
    const pages = [page(1, 'Apple', 'An apple is a sweet fruit that grows on a tree. Apples are red or green.'), page(2, 'Pear', 'A pear is a fruit with a soft body. Pears grow in cool places.')];
    writeFileSync(dump, ['<mediawiki>', ...pages, '</mediawiki>', ''].join('\n'));
    const store = path.join(dir, 'deleted', 'scratch', 'store');
    assert.equal(existsSync(store), false, 'the directory is absent, as a deleted scratch store is');
    const r = await ingest({ dump, store });
    assert.equal(r.counts.articles, 2);
    assert.ok(existsSync(path.join(store, 'meta.json')), 'the run created the directory and wrote a whole store into it');
    assert.equal(existsSync(path.join(dir, 'deleted', 'scratch', 'other')), false, 'CONTROL: a sibling nobody wrote stays absent');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const v = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'knowledge.json'), 'utf8'));
  if (/--store \S+/.test(v.command)) {
    assert.equal(v.store.isDefault, false);
    assert.equal(v.store.sameAsDefault, true, 'the graded store hashed the same as the default store, which stays on disk');
    assert.ok(v.statement.includes('hash the same as bench/fixtures/wiki/store'), 'the statement names the store it equals');
  }
});
