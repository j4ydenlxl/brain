// test/spawn-census.test.mjs: THE CENSUS ROUND (self/census-round.mjs) ON PLANTED BENCHES. Author: board 20
// builder (queue item 5, the CLOUD part).
//
// A planted ARC-like task (a mirror of each row) is the fixture bench. The round keeps nothing when the
// bench does not move (the planted test output is not what the spawned cell answers), keeps the cell
// when it does, and the placebo goes through the same path and the same rule. The site block equals
// the verdict it was read from. Every state directory lives under the OS temp dir and is deleted; the
// live state/ is never read (the lineage is seeded), nothing under the tree is written, no model is asked.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, rmSync, readdirSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  openCensus, censusRound, closeCensus, runArm, runCensus, chainCircuit, placeboCircuit, pickBench, arcPrompt,
  bootstrapBand, rngFrom, restore, cellsScore,
} from '../self/census-round.mjs';
import { plan, holds } from '../genome/spawn.mjs';
import { SEARCH_OPS } from '../tasks/grid.mjs';
import { gradeAnswer } from '../bench/answer.mjs';
import { censusBlock, injectCensus, readCensusBlock, CENSUS_FIELDS, CENSUS_ELEMENT_ID } from '../web/spawn-census.mjs';
import { censusRows } from '../web/src/hud.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mirror = (g) => g.map((r) => r.slice().reverse());
const rows = (g) => g.map((r) => r.join('')).join('|');
const DEMOS = [
  [[1, 2, 3], [4, 5, 6], [7, 8, 0]],
  [[3, 0, 1], [2, 2, 5], [9, 4, 6]],
  [[5, 6, 7], [0, 1, 2], [3, 4, 8]],
];
const TEST_IN = [[1, 0, 2], [3, 4, 5], [6, 7, 9]];

/** One planted item; `right` false plants a test output the mirror does not produce. */
function item(id, right = true) {
  const out = right ? mirror(TEST_IN) : TEST_IN;
  const j = { train: DEMOS.map((d) => ({ input: d, output: mirror(d) })), test: [{ input: TEST_IN, output: out }] };
  const want = rows(out);
  return { id, prompt: arcPrompt(j), want, grade: (a) => !!a && a.exact && a.exact.answer === want };
}

const CONTROLS = [{ id: 'c1', q: 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: 2 + 3', a: '5', grade: 'number' }];
const LINES = [{ id: 'missed:grid-fixture.json', kind: 'missed', verdictFile: 'bench/verdicts/grid-fixture.json' }];

async function open(dev, tmp, seed = 'census-test') {
  return openCensus({
    root: tmp, tmp, seed, startFrom: 'seed', lines: LINES, controls: CONTROLS, gradeControl: gradeAnswer,
    items: { dev, heldOut: [], what: { dev: 'planted', heldOut: 'none' } },
  });
}

test('pickBench: the first red bench of a typed kind with an item source; typed lines without one are listed', () => {
  const p = pickBench([
    { id: 'gate-red:test/grid.test.mjs', kind: 'gate red' },
    { id: 'missed:ns.json', kind: 'missed', files: ['act/word.mjs'] },
    { id: 'missed:compress.json', kind: 'missed', files: ['memory/direct.mjs'] },
    { id: 'ladder:sets.arc.frontier', kind: 'ladder' },
  ]);
  assert.equal(p.line.id, 'ladder:sets.arc.frontier');
  assert.equal(p.kind, 'grid primitive');
  assert.deepEqual(p.skipped.map((s) => s.id), ['missed:ns.json']);
  assert.equal(pickBench([{ id: 'missed:cloud.json', kind: 'missed' }]).line, null);
});

test('the round keeps nothing when the bench does not move', async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'census-test-'));
  try {
    const ctx = await open([item('wrong', false)], tmp);
    const before = restore(ctx.lineage.real.dir).cells.length;
    const r = await censusRound(ctx);
    assert.equal(r.real.target, 'wrong');
    assert.ok(r.real.spawned >= 2, 'the operator grew the circuit on the trial copy');
    assert.equal(r.real.moved, false);
    assert.equal(r.real.kept, false);
    assert.equal(restore(ctx.lineage.real.dir).cells.length, before, 'the lineage holds no new cell');
    assert.deepEqual(readdirSync(ctx.work).filter((d) => d.includes('trial')), [], 'every trial copy was deleted');
    const c = closeCensus(ctx);
    assert.equal(c.workDeleted, true);
    assert.equal(existsSync(ctx.work), false);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('the round keeps the cell when the bench moves, and the kept cell survives the snapshot', async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'census-test-'));
  try {
    const it = item('right', true);
    const ctx = await open([it], tmp);
    assert.equal(ctx.lineage.real.score.right, 0);
    const r = await censusRound(ctx);
    assert.equal(r.real.target, 'right');
    assert.equal(r.real.before, 0);
    assert.equal(r.real.after, 1);
    assert.equal(r.real.kept, true, r.real.why);
    assert.equal(r.real.controlAfter, r.real.controlBefore, 'the control rows did not regress');
    const brain = restore(ctx.lineage.real.dir);
    const c = plan(it.prompt).circuits[0];
    assert.ok(holds(brain, c), 'the kept lineage on disk holds the whole circuit');
    assert.equal(cellsScore(ctx, brain, ctx.items.dev).right, 1, 'the bench re-read from disk answers it by cells');
    const r2 = await censusRound(ctx);
    assert.equal(r2.real.target, undefined, 'nothing left to spawn for: the round says so');
    assert.equal(r2.real.kept, false);
    closeCensus(ctx);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('the placebo runs the same path and is judged by the same rule', async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'census-test-'));
  try {
    const it = item('right', true);
    const ctx = await open([it], tmp);
    const r = await censusRound(ctx);
    for (const k of ['spawned', 'edges', 'before', 'after', 'moved', 'lost', 'controlBefore', 'controlAfter', 'kept', 'why', 'ms']) assert.ok(k in r.placebo, 'placebo record has ' + k);
    assert.ok(r.placebo.spawned >= 2 || /already holds/.test(r.placebo.why), 'the placebo was grown through the operator: ' + r.placebo.why);
    assert.equal(r.placebo.steps.length, plan(it.prompt).circuits[0].depth, 'same length as the real cell');
    // the same rule keeps a placebo that pays and drops one that does not
    const names = plan(it.prompt).circuits[0].cells.filter((x) => x.kind !== 'task.tap').map((x) => x.id.split('/').pop());
    const paying = chainCircuit(names.map((n) => SEARCH_OPS.find((o) => o.name === n)));
    const other = chainCircuit([SEARCH_OPS.find((o) => !names.includes(o.name) && o.kind === 'grid.tile')]);
    const a = await runArm(ctx, 'placebo', other, { round: 99 });
    assert.equal(a.kept, false, a.why);
    const had = ctx.lineage.placebo.score.right;
    const b = await runArm(ctx, 'placebo', paying, { round: 100 });
    assert.equal(b.kept, had === 0, b.why);
    assert.equal(ctx.lineage.placebo.score.right, 1);
    closeCensus(ctx);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('placeboCircuit: a random chain of the genome vocabulary, same length, genome ids; seeded', () => {
  const a = placeboCircuit('grid primitive', rngFrom('x'), { length: 2 });
  const b = placeboCircuit('grid primitive', rngFrom('x'), { length: 2 });
  assert.deepEqual(a, b);
  assert.equal(a.depth, 2);
  assert.ok(a.cells.every((c) => c.id.startsWith('spawn.grid/')));
  assert.equal(a.cells.at(-1).kind, 'task.tap');
  const cm = placeboCircuit('grid primitive', rngFrom('y'), { length: 1, colormap: true });
  assert.equal(cm.cells[0].kind, 'grid.colormap');
});

test('bootstrapBand: a band on the kept difference per hour; empty rounds give nulls', () => {
  const rounds = Array.from({ length: 20 }, (_, i) => ({ real: { kept: i < 15 }, placebo: { kept: i < 2 } }));
  const b = bootstrapBand(rounds, { hours: 1, resamples: 500 });
  assert.ok(b.lo > 0 && b.hi >= b.lo);
  assert.deepEqual(bootstrapBand([], { hours: 1 }), { lo: null, hi: null, resamples: 0 });
});

test('runCensus on the planted bench: counts, per hour on the census wall, the work dir gone', async () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'census-test-'));
  try {
    const r = await runCensus({ rounds: 2, root: tmp, tmp, startFrom: 'seed', lines: LINES, controls: CONTROLS, gradeControl: gradeAnswer, items: { dev: [item('right')], heldOut: [item('held')], what: { dev: 'planted', heldOut: 'planted' } } });
    assert.equal(r.completed, true);
    assert.equal(r.kept, 1);
    assert.equal(r.keptPerHour, r.kept / (r.wallS / 3600));
    assert.equal(r.heldOutAfter.right, 1, 'the held-out twin is answered by the kept cell');
    assert.equal(r.workDeleted, true);
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});

test('the page block equals the verdict it was read from', () => {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'census-web-'));
  try {
    const v = { at: '2026-09-26T00:00:00.000Z', isTheBar: true, barMet: true, cells: 46, edges: 30, kinds: 22, kept: 14, keptPerHour: 536.5, placeboKept: 4, placeboKeptPerHour: 153.25, rounds: 20, extra: 'not on the page' };
    mkdirSync(path.join(tmp, 'bench', 'verdicts'), { recursive: true });
    writeFileSync(path.join(tmp, 'bench', 'verdicts', 'spawn-census.json'), JSON.stringify(v));
    const block = readCensusBlock(tmp);
    for (const k of CENSUS_FIELDS) assert.deepEqual(block[k], v[k], k);
    assert.equal(block.file, 'bench/verdicts/spawn-census.json');
    const html = injectCensus('<html><body><p>x</p></body></html>', block);
    const m = new RegExp('<script type="application/json" id="' + CENSUS_ELEMENT_ID + '">(.*?)</script>').exec(html);
    assert.deepEqual(JSON.parse(m[1]), block);
    const shown = censusRows(block);
    for (const s of ['46', '30 edges', '22 kinds', '536.50', '14 kept in 20 rounds', '153.25', '4 kept', 'bar met', 'bench/verdicts/spawn-census.json', v.at]) assert.ok(shown.includes(s), 'the block prints ' + s);
    assert.ok(censusRows(null).includes('not measured'));
    assert.equal(readCensusBlock(path.join(tmp, 'none')), null);
    // the tree's own verdict, when present, is what the page carries (read only)
    const real = path.join(ROOT, 'bench', 'verdicts', 'spawn-census.json');
    if (existsSync(real)) {
      const rv = JSON.parse(readFileSync(real, 'utf8'));
      const rb = readCensusBlock(ROOT);
      for (const k of CENSUS_FIELDS) assert.deepEqual(rb[k], rv[k] === undefined ? null : rv[k], 'tree ' + k);
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
});
