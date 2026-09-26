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
import { readFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const mod = await import('data:text/javascript,' + encodeURIComponent(splitForSource(file)));
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
