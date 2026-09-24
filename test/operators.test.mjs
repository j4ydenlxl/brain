// test/operators.test.mjs: THE OPERATORS, THE KNOBS AND THE IMPROVE MODE (Board 14, item operators).
//
// No Ollama: the author is test/operators-plant.mjs mockAuthor(), a fixed answer. No real tree is
// written: every improve() round runs on a planted temp tree (test/operators-plant.mjs plantTree,
// a fake gate that writes GREEN) and its own temp copy, and both are deleted here.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync, existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseKnobs, setKnob, bandOf, unifiedDiff, filesOfDiff, changedLines } from '../self/knobs.mjs';
import { knobTune, strategySwap, author, knobCandidate, gapKnobs, vetDiff, readStrategies, makeBudget, isGridGap } from '../self/operators.mjs';
import { improve, noiseBand, beatsNoise, hashTree, hashFiles, findBaseline, setGapsParser, setGapsParsers, readMetric, ledgerArgv, ledgerIncludes, applyTo, restore, copyTree, copyTop, deleteCopy, addGateKit, TOP_MARKER } from '../self/improve.mjs';
import { applyUnifiedPatch } from '../self/code.mjs';
import { plantTree, plantGaps, mockAuthor, AUTHOR_DIFF_GOOD, AUTHOR_DIFF_OUTSIDE, AUTHOR_DIFF_CEILING } from './operators-plant.mjs';

setGapsParser(false); // the gaps item's parser is not part of these tests
const temps = [];
const tmp = (p) => { const d = mkdtempSync(path.join(os.tmpdir(), p)); temps.push(d); return d; };
const planted = (gate = 'fake') => { const d = plantTree({ gate }); temps.push(d); return d; };
test.after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });
const lines = (f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

// ------------------------------------------------------------------ the knob grammar
test('knob grammar: five forms read, and what is not a knob is not', () => {
  const src = [
    'export const A = 10; // knob [4, 20] 2',          // 1. band and step
    'const B = 0.5; // knob [0.1, 0.9]',               // 2. band, step 10 percent of the value
    'const C = 100; // knob',                          // 3. bare: 0.7x to 1.5x, step 10 percent
    'export const D = 2.0; // knob 0.25',              // 4. step only, real (the literal has a point)
    'export const LIMITS = Object.freeze({ hits: 5, minSim: 0.15, name: "x", nested: { deep: 3 }, expr: 2 * 3 });', // 5. object fields
    '  const E = 5; // knob',                          // indented: a local, never a knob
    'const F = 3; // knobby',                          // the word is not "knob"
    'const G = 7; // knob [x, y]',                     // malformed band: listed, never guessed
    'const H = 4; // a comment',                       // no knob comment
  ].join('\n');
  const ks = parseKnobs(src, { file: 'x.mjs' });
  const by = Object.fromEntries(ks.map((k) => [k.name, k]));
  assert.deepEqual(Object.keys(by).sort(), ['A', 'B', 'C', 'D', 'G', 'LIMITS.hits', 'LIMITS.minSim']);
  assert.deepEqual([by.A.lo, by.A.hi, by.A.step, by.A.integer, by.A.form], [4, 20, 2, true, 'band+step']);
  assert.deepEqual([by.B.lo, by.B.hi, by.B.step, by.B.integer, by.B.form], [0.1, 0.9, 0.05, false, 'band']);
  assert.deepEqual([by.C.lo, by.C.hi, by.C.step, by.C.integer, by.C.form], [70, 150, 10, true, 'default']);
  assert.deepEqual([by.D.lo, by.D.hi, by.D.step, by.D.integer, by.D.form], [1.4, 3, 0.25, false, 'step']);
  assert.deepEqual([by['LIMITS.hits'].lo, by['LIMITS.hits'].hi, by['LIMITS.hits'].step, by['LIMITS.hits'].kind], [4, 7, 1, 'field']);
  assert.deepEqual([by['LIMITS.minSim'].lo, by['LIMITS.minSim'].hi, by['LIMITS.minSim'].step], [0.105, 0.225, 0.015]);
  assert.ok(by.G.malformed && by.G.frozen, 'a malformed band is listed as malformed and frozen');
  // the offsets point at the literal, so setKnob edits exactly those characters
  assert.equal(src.slice(by.A.start, by.A.end), '10');
  assert.equal(src.slice(by['LIMITS.minSim'].start, by['LIMITS.minSim'].end), '0.15');
  // a knob at 0 has no multiplicative band; an integer 1 bare has one value: both frozen
  assert.equal(bandOf(0, 'knob', '0').frozen, true);
  assert.equal(bandOf(1, 'knob', '1').frozen, true);
  assert.equal(bandOf(1, 'knob', '1.0').frozen, false);
});

test('band refusal: a value outside the band is never written, and knob-tune records the refusal without running it', async () => {
  const src = 'export const EDGE = 20; // knob [4, 20] 2\n';
  const [k] = parseKnobs(src, { file: 'planted/edge.mjs' });
  const out = setKnob(src, k, 22);
  assert.equal(out.ok, false);
  assert.equal(out.band, true);
  assert.match(out.reason, /outside the band \[4, 20\]/);
  const inside = setKnob(src, k, 18);
  assert.equal(inside.ok, true);
  assert.equal(inside.text, 'export const EDGE = 18; // knob [4, 20] 2\n');
  // through the operator: the first step (up, to 22) is refused before any trial, then it turns round
  const root = planted();
  const gap = plantGaps().edge;
  const gen = knobTune(gap, root, makeBudget());
  const first = await gen.next();
  assert.equal(first.value.refused, true);
  assert.equal(first.value.value, 22);
  assert.match(first.value.reason, /outside the band/);
  const second = await gen.next({ refused: true });
  assert.equal(second.value.refused, false);
  assert.equal(second.value.value, 18);
  assert.match(second.value.patch, /^-export const EDGE = 20;/m);
  assert.match(second.value.patch, /^\+export const EDGE = 18;/m);
  // a candidate that would carry a refused value is refused whole
  const knobs = gapKnobs(gap, root);
  assert.equal(knobCandidate(root, knobs, {}, knobs[0], 2).refused, true);
});

// ------------------------------------------------------------------ the noise rule
test('noise rule: the spread of two baseline runs, or 5 percent of the distance when they agree; a move must exceed it', () => {
  const a = noiseBand([50.5, 49.5], 60);
  assert.deepEqual([a.mean, a.spread, a.noise], [50, 1, 1]);
  assert.match(a.how, /spread/);
  const b = noiseBand([64, 64], 95);
  assert.deepEqual([b.mean, b.spread, b.noise], [64, 0, 1.55]);
  assert.match(b.how, /5 percent/);
  assert.equal(noiseBand([64], 95).noise, null, 'one run measures no noise');
  assert.equal(beatsNoise(1.0, 1.0), false, 'a move equal to the noise band is inside it');
  assert.equal(beatsNoise(1.01, 1.0), true);
  assert.equal(beatsNoise(-5, 1.0), false);
  assert.equal(beatsNoise(null, 1.0), false);
  assert.equal(beatsNoise(3, null), false, 'no noise band: nothing is kept');
});

// ------------------------------------------------------------------ the diff helpers
test('unifiedDiff round-trips through the autopilot patcher, and the vetting walls hold', () => {
  const a = 'l1\nl2\nexport const GAIN = 10; // knob [4, 20] 2\nl4\nl5\n';
  const b = a.replace('GAIN = 10', 'GAIN = 12');
  const d = unifiedDiff('planted/tune.mjs', a, b);
  assert.deepEqual(filesOfDiff(d), ['planted/tune.mjs']);
  assert.equal(changedLines(d), 2);
  const r = applyUnifiedPatch(a, d);
  assert.equal(r.ok, true);
  assert.equal(r.text, b);
  const root = planted();
  const gap = plantGaps().tune;
  assert.equal(vetDiff(d, gap, root).ok, true);
  const out = vetDiff(AUTHOR_DIFF_OUTSIDE, gap, root);
  assert.equal(out.ok, false);
  assert.equal(out.wall, 'files');
  const ceil = vetDiff(AUTHOR_DIFF_CEILING, { ...gap, files: ['self/improve.mjs'] }, root);
  assert.equal(ceil.ok, false);
  assert.match(ceil.reason, /self\//);
  const big = unifiedDiff('planted/tune.mjs', a, a.replace(/l\d/g, (x) => x + 'x'));
  assert.equal(vetDiff(big, gap, root, { maxLines: 3 }).ok, false);
  // applyTo keeps the originals and restore puts the bytes back
  const before = readFileSync(path.join(root, 'planted/tune.mjs'));
  const ap = applyTo(root, unifiedDiff('planted/tune.mjs', before.toString(), before.toString().replace('GAIN = 10', 'GAIN = 12')));
  assert.equal(ap.ok, true);
  assert.match(readFileSync(path.join(root, 'planted/tune.mjs'), 'utf8'), /GAIN = 12/);
  restore(root, ap.originals);
  assert.deepEqual(readFileSync(path.join(root, 'planted/tune.mjs')), before);
});

test('strategy-swap reads the STRATEGIES file and tries every other name once; recombine is for grid gaps only', async () => {
  const root = planted();
  const s = readStrategies(readFileSync(path.join(root, 'planted/strategy.mjs'), 'utf8'));
  assert.deepEqual(s.names, ['slow', 'fast', 'mid']);
  assert.equal(s.current, 'slow');
  const gen = strategySwap(plantGaps().strategy, root, makeBudget());
  const c1 = await gen.next();
  assert.equal(c1.value.name, 'fast');
  const c2 = await gen.next({ before: 50, after: 97, toward: 47, towardRef: 47, noise: 2.25 });
  assert.equal(c2.value.name, 'mid');
  assert.equal(c2.value.ref, 97, 'the second name is compared with the best so far');
  const end = await gen.next({ before: 50, after: 80, toward: 30, towardRef: -17, noise: 2.25 });
  assert.equal(end.done, true);
  assert.equal(end.value.best.name, 'fast');
  assert.equal(isGridGap(plantGaps().tune), false);
  assert.equal(isGridGap({ id: 'ladder-arc', files: ['capability/grid-dsl.mjs'] }), true);
});

// ------------------------------------------------------------------ improve() on a planted tree
test('improve: knob-tune closes the planted gap on a copy, the tree stays byte-identical, the record is written before the copy is deleted, and a second run reuses the baseline', async () => {
  const root = planted();
  const stateDir = tmp('brain-operators-state-');
  const gap = plantGaps().tune;
  const treeBefore = hashTree(root);
  const filesBefore = hashFiles(root, gap.files).all;
  let seen = null;
  const r = await improve({
    root, stateDir, gap, operator: 'knob-tune',
    hooks: { beforeDelete: ({ copy, recordFile }) => { seen = { alive: existsSync(copy), rows: lines(recordFile), copy }; } },
  });
  assert.equal(r.kept, true, r.reason);
  assert.equal(r.before, 64);
  assert.equal(r.after, 96);
  assert.equal(r.closed, true);
  assert.equal(r.knob, 'GAIN');
  assert.equal(r.value, 14);
  assert.equal(r.noise, 1.55, 'the two baseline runs agree exactly, so 5 percent of 31');
  assert.equal(r.baselineRan, 2);
  assert.match(r.patch, /^\+export const GAIN = 14;/m);
  assert.ok(r.gateHash, 'the gate on the copy wrote its verdict and its hash is returned');
  assert.deepEqual(r.tests.map((t) => [t.test, t.exit]), [['test/planted-tune.test.mjs', 0]], 'the touched test ran on the copy and passed');
  // the real (planted) tree is byte-identical: the files list and the whole tree
  assert.equal(hashFiles(root, gap.files).all, filesBefore);
  assert.equal(hashTree(root).hash, treeBefore.hash);
  // the record: written while the copy was alive, closed by the decision, and the copy is gone now
  assert.ok(seen && seen.alive, 'the copy existed when the last record line was written');
  const kinds = seen.rows.map((x) => x.kind);
  assert.deepEqual(kinds, ['baseline', 'trial', 'trial', 'confirm', 'decision']);
  assert.ok(seen.rows.every((x) => x.copyAlive === true && x.operator === 'knob-tune'));
  assert.deepEqual(seen.rows.filter((x) => x.kind === 'trial').map((x) => [x.knob, x.value, x.after]), [['GAIN', 12, 84], ['GAIN', 14, 96]]);
  assert.ok(seen.rows.every((x) => 'seconds' in x && 'reason' in x && 'before' in x && 'after' in x));
  assert.equal(existsSync(seen.copy), false);
  assert.equal(r.copy.deleted, true);
  // a second run the same day: the unpatched trial does not run again
  const bl = findBaseline(stateDir, { command: gap.trial.command, filesHash: filesBefore });
  assert.deepEqual(bl.runs, [64, 64]);
  const r2 = await improve({ root, stateDir, gap, operator: 'knob-tune' });
  assert.equal(r2.kept, true, r2.reason);
  assert.equal(r2.baselineRan, 0);
  assert.equal(lines(r2.record).filter((x) => x.kind === 'baseline').length, 1, 'one baseline line in the day, from the first run');
});

test('improve: a move inside the noise band is refused, and a step outside its band is recorded as refused and never run', async () => {
  const root = planted();
  const stateDir = tmp('brain-operators-state-');
  const d = await improve({ root, stateDir, gap: plantGaps().drift, operator: 'knob-tune' });
  assert.equal(d.kept, false);
  assert.equal(d.noise, 1, 'the planted jitter makes the two baseline runs differ by exactly 1');
  const dt = lines(d.record).filter((x) => x.gap === 'planted-drift' && x.kind === 'trial');
  assert.equal(dt.length, 1);
  assert.equal(dt[0].value, 1.1);
  assert.equal(dt[0].towardRef, 0.7);
  assert.match(dt[0].reason, /inside the noise band 1/);
  assert.match(d.reason, /noise band/);
  const e = await improve({ root, stateDir, gap: plantGaps().edge, operator: 'knob-tune' });
  assert.equal(e.kept, false);
  const et = lines(e.record).filter((x) => x.gap === 'planted-edge' && x.kind === 'trial');
  assert.equal(et[0].value, 22);
  assert.equal(et[0].after, null);
  assert.equal(et[0].seconds, 0);
  assert.match(et[0].reason, /^refused: .*outside the band \[4, 20\]/);
  assert.equal(et[1].value, 18);
  assert.equal(et[1].after, 68);
  assert.ok(!et.some((x) => x.value === 22 && x.after !== null), 'the out-of-band value never ran');
});

test('improve: strategy-swap keeps the better strategy; a RED gate on the copy refuses a move that beat the noise', async () => {
  const root = planted();
  const stateDir = tmp('brain-operators-state-');
  const s = await improve({ root, stateDir, gap: plantGaps().strategy, operator: 'strategy-swap' });
  assert.equal(s.kept, true, s.reason);
  assert.equal(s.name, 'fast');
  assert.equal(s.after, 97);
  const red = planted('red');
  const r = await improve({ root: red, stateDir, gap: plantGaps().strategy, operator: 'strategy-swap' });
  assert.equal(r.kept, false);
  assert.equal(r.baselineRan, 0, 'same command, same bytes, same day: the baseline is reused across trees');
  assert.match(r.reason, /the gate on the copy is not GREEN/);
});

test('improve with the author mocked: a good diff is judged and kept, a diff outside the files list is refused, the budget is one call, and a closed provider is refused before any call', async () => {
  const root = planted();
  const stateDir = tmp('brain-operators-state-');
  const gap = plantGaps().tune;
  const good = mockAuthor(AUTHOR_DIFF_GOOD);
  const bud = makeBudget({ modelCalls: 1, author: good });
  const k = await improve({ root, stateDir, gap, operator: 'author', budget: bud });
  assert.equal(k.kept, true, k.reason);
  assert.equal(k.after, 96);
  assert.equal(good.asked.length, 1);
  assert.match(good.asked[0].prompt, /GAIN/);
  assert.match(good.asked[0].prompt, /node planted\/tune-bench\.mjs/);
  assert.equal(bud.model.calls.length, 1);
  assert.ok(typeof bud.model.calls[0].seconds === 'number', 'every call records its seconds');
  // the budget is spent: the next author round is refused without asking
  const again = await improve({ root, stateDir, gap, operator: 'author', budget: bud });
  assert.equal(again.kept, false);
  assert.equal(good.asked.length, 1);
  assert.match(lines(again.record).filter((x) => x.kind === 'trial').pop().reason, /budget of 1 model call/);
  // outside the files list
  const bad = mockAuthor(AUTHOR_DIFF_OUTSIDE);
  const o = await improve({ root, stateDir, gap, operator: 'author', budget: makeBudget({ modelCalls: 1, author: bad }) });
  assert.equal(o.kept, false);
  assert.match(lines(o.record).filter((x) => x.kind === 'trial').pop().reason, /outside the gap's files list/);
  // a closed provider: refused by the autopilot's authorConfig before any process or socket
  const gen = author(gap, root, makeBudget({ modelCalls: 1, model: 'claude-opus' }));
  const c = await gen.next();
  assert.equal(c.value.refused, true);
  assert.match(c.value.reason, /open weights only/);
});

// ------------------------------------------------------------------ the copy layout and the gate kit
test('the copy is nested in a marked temp top, deleteCopy removes exactly that top, and the kit puts a sibling only inside it', () => {
  // a small fake tree beside a fake sibling: <base>/tree (the root) and <base>/side/data.bin
  const base = tmp('brain-operators-layout-');
  const root = path.join(base, 'tree');
  mkdirSync(path.join(root, 'bench', 'fixtures', 'store'), { recursive: true });
  mkdirSync(path.join(root, 'state'), { recursive: true });
  mkdirSync(path.join(base, 'side'), { recursive: true });
  writeFileSync(path.join(root, 'a.mjs'), 'export const A = 1;');
  writeFileSync(path.join(root, 'state', 'live.json'), '{}');
  writeFileSync(path.join(root, 'bench', 'fixtures', 'small.json'), '[1]');
  writeFileSync(path.join(root, 'bench', 'fixtures', 'big.bin'), Buffer.alloc(4096));
  writeFileSync(path.join(root, 'bench', 'fixtures', 'store', 'part1.bin'), Buffer.alloc(3000));
  writeFileSync(path.join(root, 'bench', 'fixtures', 'store', 'part2.bin'), Buffer.alloc(3000));
  writeFileSync(path.join(base, 'side', 'data.bin'), Buffer.alloc(100));
  const tmpRoot = path.join(base, 'copies');
  const c = copyTree(root, { tmpRoot });
  assert.equal(path.basename(c.dir), 'tree', 'the copy keeps the root name one level down');
  assert.equal(path.dirname(c.dir), c.top);
  assert.ok(existsSync(path.join(c.top, TOP_MARKER)), 'the temp top carries the marker');
  assert.equal(copyTop(c.dir), c.top);
  assert.ok(existsSync(path.join(c.dir, 'a.mjs')) && !existsSync(path.join(c.dir, 'state')) && !existsSync(path.join(c.dir, 'bench', 'fixtures')), 'state/ and bench/fixtures/ are left out of the lean copy');
  const kit = addGateKit(c.dir, root, { fixturesMaxBytes: 1000, siblings: ['../side/data.bin', '../side/absent.bin'], wholeDirs: [{ rel: 'bench/fixtures/store', maxBytes: 10000 }] });
  assert.deepEqual(kit.whole.dirs, ['bench/fixtures/store'], 'a whole dir under its cap comes along whole');
  assert.ok(existsSync(path.join(c.dir, 'bench', 'fixtures', 'store', 'part2.bin')));
  assert.ok(existsSync(path.join(c.dir, 'bench', 'fixtures', 'small.json')) && !existsSync(path.join(c.dir, 'bench', 'fixtures', 'big.bin')), 'a fixture over the cap stays out');
  assert.deepEqual(kit.fixtures.left.map((x) => x.file), ['bench/fixtures/big.bin']);
  assert.deepEqual(kit.siblings.files, ['../side/data.bin']);
  assert.ok(existsSync(path.join(c.top, 'side', 'data.bin')), 'the sibling lands beside the copy, inside its own top');
  // a copy that is NOT nested gets no sibling: it would land on a shared path
  const flat = copyTree(root, { tmpRoot, nest: null });
  assert.equal(copyTop(flat.dir), flat.dir);
  const k2 = addGateKit(flat.dir, root, { siblings: ['../side/data.bin'], wholeDirs: [] });
  assert.deepEqual(k2.siblings.files, []);
  assert.equal(k2.siblings.left[0].why, 'the copy is not nested');
  assert.equal(existsSync(path.join(tmpRoot, 'side')), false, 'nothing was written beside a flat copy');
  // deleteCopy removes the marked top and nothing above it; a flat copy removes only itself
  const d1 = deleteCopy(c.dir);
  assert.equal(d1.deleted, true);
  assert.equal(existsSync(c.top), false);
  const d2 = deleteCopy(flat.dir);
  assert.equal(d2.deleted, true);
  assert.ok(existsSync(tmpRoot) && existsSync(root) && existsSync(path.join(base, 'side', 'data.bin')), 'the parent of the tops, the tree and the real sibling are untouched');
  assert.ok(existsSync(path.join(root, 'state', 'live.json')));
});

test('a gaps-ledger trial runs as the ledger wrote it: argv with {tmp} and {copy}, a named file parser, a row parser, and stdout apart from the budget lines', async () => {
  // the ledger shape (self/gaps.mjs trialOf): argv is run, the command is a display line and is never run
  const d = path.join(os.tmpdir(), 'x-copy');
  assert.deepEqual(ledgerArgv({ argv: ['--heap', 'b.mjs', '--tmp', '{tmp}', '--root', '{copy}'] }, d), ['node', '--heap', 'b.mjs', '--tmp', path.join(d, 'tmp'), '--root', d]);
  assert.equal(ledgerArgv({ argv: [] }, d), null);
  assert.deepEqual(ledgerIncludes({ seed: 'organism/gen-0', fixtures: ['bench/fixtures/public/arc-agi-1'] }), ['organism/gen-0', 'bench/fixtures/public/arc-agi-1']);
  assert.deepEqual(ledgerIncludes({ seed: null, fixtures: [] }), []);
  const PARSERS = {
    plant: { name: 'planted metric', file: () => 'tmp/out.json', read: (v) => v && v.metric },
    said: { name: 'said share', stdout: true, read: (o) => { try { return JSON.parse(o).share; } catch { return null; } } },
    test: { name: 'wall ms', row: true },
  };
  setGapsParsers(PARSERS);
  try {
    // row: the wall of a PASSING run; a failing run measured nothing
    const rowGap = { trial: { parser: 'test' } };
    assert.equal(readMetric(rowGap, { dir: d, run: { exit: 0, outcome: 'exit', seconds: 1.234 } }).value, 1234);
    const fail = readMetric(rowGap, { dir: d, run: { exit: 1, outcome: 'exit', seconds: 0.5 } });
    assert.equal(fail.value, null);
    assert.match(fail.reason, /a failing run is not a wall/);
    // stdout: the child's own stdout, not the mixed log the budget lines are in
    const sGap = { trial: { parser: 'said' } };
    assert.equal(readMetric(sGap, { dir: d, out: '[budget] start\n{"share":0.25}\n', stdout: '{"share":0.25}' }).value, 0.25);
    assert.equal(readMetric(sGap, { dir: d, out: '[budget] start\n{"share":0.25}\n', stdout: '' }).value, null);
    // an unknown parser name is a reason, never a guess
    assert.match(readMetric({ trial: { parser: 'nope' } }, { dir: d }).reason, /no parser named nope/);
    // end to end on the plant: the trial writes <copy>/tmp/out.json and the named parser reads it
    const root = planted();
    writeFileSync(path.join(root, 'planted', 'tune-json.mjs'), [
      "import { writeFileSync } from 'node:fs';",
      "import path from 'node:path';",
      "import { score } from './tune.mjs';",
      "writeFileSync(path.join(process.argv[2], 'out.json'), JSON.stringify({ metric: score() }));",
      '',
    ].join('\n'));
    const stateDir = tmp('brain-operators-state-');
    const base = plantGaps().tune;
    const gap = { ...base, id: 'planted-ledger', trial: { key: 'plant', command: 'node tools/budget.mjs --dir <copy> -- node planted/tune-json.mjs <copy>/tmp', argv: ['planted/tune-json.mjs', '{tmp}'], parser: 'plant', runner: 'budget', minutes: 1, needsModel: false, where: 'copy', writes: [], seed: null, fixtures: [], trader: false } };
    const treeBefore = hashTree(root).hash;
    const logs = [];
    const r = await improve({ root, stateDir, gap, operator: 'knob-tune', log: (l) => logs.push(l) });
    assert.equal(r.kept, true, r.reason);
    assert.equal(r.before, 64);
    assert.equal(r.after, 96);
    const argvLine = logs.find((l) => l.startsWith('trial argv (the ledger'));
    assert.ok(argvLine, 'the ledger argv was logged');
    const ran = argvLine.slice(argvLine.indexOf('): ') + 3);
    assert.ok(ran.startsWith('node planted/tune-json.mjs ') && ran.endsWith(path.sep + 'tmp') && !ran.includes('{tmp}'), 'the argv ran with {tmp} as <copy>/tmp: ' + ran);
    assert.ok(logs.some((l) => l.includes('PARSERS.plant')), 'the metric came from the named parser');
    assert.equal(hashTree(root).hash, treeBefore, 'the planted tree is byte-identical');
  } finally {
    setGapsParsers(null);
  }
});
