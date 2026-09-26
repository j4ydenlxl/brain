// test/brief-plant.mjs: THE PLANTED BOARD ITEM THE BRIEF OPERATOR IS GRADED ON (Board 15, item brief).
//
// A fixture, not a test file (the gate runs test/*.test.mjs only). PLANTED_BOARD is a board script
// in the real grammar of docs/boards/board-N.js (an ITEMS array of { key, owns, task }), read by
// self/brief.mjs parseBoardText exactly as a real board is. Its one item, clamp, owns a new source
// module whose docstring block states three examples, a new test file, a new bench and its verdict.
// bench/brief.mjs attempts it with the real qwen3:30b-a3b; test/brief.test.mjs attempts it with
// mockAuthor(), which answers the planned files, then a FAILING test file, then the repair. Nothing
// here opens a socket.
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const BT = String.fromCharCode(96);

/** The clamp item's task, as a board states it. */
export const CLAMP_TASK = [
  'ITEM clamp (a planted item: the brief operator must finish it with no orchestrator). BUILD planted/clamp.mjs, one exported function:',
  '// clampSum(xs, lo, hi): the sum of the numbers in xs, each one first clamped into [lo, hi].',
  '// Throws a RangeError when lo > hi.',
  '// clampSum([1, 5, 9], 2, 6) returns 13',
  '// clampSum([], 0, 1) returns 0',
  '// clampSum([-3, 4], 0, 10) returns 4',
  'export function clampSum(xs, lo, hi) {',
  'Tests (test/planted-clamp.test.mjs): the three examples above, the RangeError when lo > hi, and the empty array. BAR (planted-clamp.json): bench/planted-clamp.mjs draws 1000 seeded cases (a linear congruential generator with seed 42; each case an array of 0 to 8 integers in [-50, 50] and lo, hi integers in [-20, 20] with lo <= hi), checks clampSum against a reference loop written in the bench itself, prints "checked N, mismatches M" and writes bench/verdicts/planted-clamp.json with barMet true when M is 0. MODEL OFF for the bar: the bench never opens a socket.',
].join('\n');

export const CLAMP_OWNS = 'planted/clamp.mjs (new), test/planted-clamp.test.mjs (new), bench/planted-clamp.mjs (new), bench/verdicts/planted-clamp.json (new)';

/** A board script in the real grammar, holding the one planted item. */
export const PLANTED_BOARD = [
  "// docs/boards/board-planted.js: a planted board (the brief operator's fixture). Same grammar as board-13.js.",
  "const BOARD = 'planted'",
  'const ITEMS = [',
  '  {',
  "    key: 'clamp',",
  "    owns: '" + CLAMP_OWNS + "',",
  '    task: ' + BT + CLAMP_TASK + BT + ',',
  '  },',
  ']',
  'async function run(it) { return { key: it.key } }',
  '',
].join('\n');

/** The correct function, as a model would complete it. */
export const CLAMP_SOURCE = [
  'function clampSum(xs, lo, hi) {',
  "  if (lo > hi) throw new RangeError('lo > hi');",
  '  let s = 0;',
  '  for (const x of xs) s += Math.min(hi, Math.max(lo, x));',
  '  return s;',
  '}',
].join('\n');

const TEST_HEAD = [
  "import { test } from 'node:test';",
  "import assert from 'node:assert/strict';",
  "import { clampSum } from '../planted/clamp.mjs';",
  '',
];
/** The test file the mock writes first: one expected value is wrong (14 for 13). */
export const CLAMP_TEST_FAILING = [...TEST_HEAD,
  "test('clampSum: the stated examples', () => {",
  '  assert.equal(clampSum([1, 5, 9], 2, 6), 14);',
  '  assert.equal(clampSum([-3, 4], 0, 10), 4);',
  '});',
  "test('clampSum: the empty array and lo > hi', () => {",
  '  assert.equal(clampSum([], 0, 1), 0);',
  '  assert.throws(() => clampSum([1], 3, 2), RangeError);',
  '});',
  ''].join('\n');
/** The repaired test file. */
export const CLAMP_TEST = CLAMP_TEST_FAILING.replace('2, 6), 14)', '2, 6), 13)');

/** The bench the mock writes: the seeded draw, the reference loop, the verdict. */
export const CLAMP_BENCH = [
  "import { writeFileSync, mkdirSync } from 'node:fs';",
  "import path from 'node:path';",
  "import { fileURLToPath } from 'node:url';",
  "import { clampSum } from '../planted/clamp.mjs';",
  'let seed = 42;',
  'const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };',
  'const int = (a, b) => a + Math.floor(rnd() * (b - a + 1));',
  'let checked = 0, mismatches = 0;',
  'for (let i = 0; i < 1000; i++) {',
  '  const xs = Array.from({ length: int(0, 8) }, () => int(-50, 50));',
  '  let lo = int(-20, 20), hi = int(-20, 20);',
  '  if (lo > hi) [lo, hi] = [hi, lo];',
  '  let want = 0;',
  '  for (const x of xs) want += x < lo ? lo : x > hi ? hi : x;',
  '  checked++;',
  '  if (clampSum(xs, lo, hi) !== want) mismatches++;',
  '}',
  "console.log('checked ' + checked + ', mismatches ' + mismatches);",
  "const file = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'bench/verdicts/planted-clamp.json');",
  'mkdirSync(path.dirname(file), { recursive: true });',
  "const v = { at: new Date().toISOString(), command: 'node bench/planted-clamp.mjs', node: process.version, isTheBar: true, barMet: mismatches === 0, split: { cases: checked, seed: 42 }, statement: 'checked ' + checked + ', mismatches ' + mismatches };",
  'writeFileSync(file, JSON.stringify(v, null, 2));',
  ''].join('\n');

const fence = (s) => BT.repeat(3) + 'javascript\n' + s.replace(/\n$/, '') + '\n' + BT.repeat(3);

/**
 * The mocked author: the model cell's stand-in. It answers by the step it is asked for:
 * the code region with the correct function, the test file FAILING first, the bench whole, and a
 * repair with "FILE: test/planted-clamp.test.mjs" and the fixed file. Options change one behaviour
 * per test: repairFixes false keeps the test failing; malformedBench answers the bench once with no
 * fence; silentBench answers the bench once with no answer (a call wall); plan answers a PLAN ask
 * with that object. Every call is pushed to calls.
 */
export function mockAuthor({ repairFixes = true, malformedBench = false, silentBench = false, plan = null } = {}) {
  const calls = [];
  let benchAsked = 0;
  const fn = async (req) => {
    calls.push({ step: req.step, file: req.file, phase: req.phase || null });
    const ok = (text) => ({ ok: true, text, ms: 1, tokens: text.length });
    if (req.step === 'plan') return plan ? ok(JSON.stringify(plan)) : { ok: false, reason: 'the mock has no plan' };
    if (req.step === 'write' && req.file === 'planted/clamp.mjs') return ok(fence(CLAMP_SOURCE));
    if (req.step === 'write' && req.file === 'test/planted-clamp.test.mjs') return ok(fence(CLAMP_TEST_FAILING));
    if (req.step === 'write' && req.file === 'bench/planted-clamp.mjs') {
      benchAsked++;
      if (malformedBench && benchAsked === 1) return ok('Here is the bench, it draws 1000 cases.');
      if (silentBench && benchAsked === 1) return { ok: false, reason: 'ollama request failed: This operation was aborted' };
      return ok(fence(CLAMP_BENCH));
    }
    if (req.step === 'repair') return ok('FILE: test/planted-clamp.test.mjs\n' + fence(repairFixes ? CLAMP_TEST : CLAMP_TEST_FAILING));
    return { ok: false, reason: 'the mock does not answer ' + req.step };
  };
  fn.calls = calls;
  return fn;
}

/** A gate that needs nothing: writes bench/verdicts/gate.json GREEN and exits 0 (tests only). */
export const FAKE_GATE = [
  "import { mkdirSync, writeFileSync } from 'node:fs';",
  "mkdirSync('bench/verdicts', { recursive: true });",
  "writeFileSync('bench/verdicts/gate.json', JSON.stringify({ at: new Date().toISOString(), verdict: 'GREEN', tests: [] }));",
  "console.log('GATE GREEN: fixture gate');",
  ''].join('\n');

/** A gate RED on a file no brief touches (test/other.test.mjs), as a tree with another item's work in progress is (tests only). */
export const FAKE_GATE_RED = [
  "import { mkdirSync, writeFileSync } from 'node:fs';",
  "mkdirSync('bench/verdicts', { recursive: true });",
  "writeFileSync('bench/verdicts/gate.json', JSON.stringify({ at: new Date().toISOString(), verdict: 'RED', tests: [{ file: 'test/other.test.mjs', exit: 1 }] }));",
  "console.log('GATE RED: test files 0/1, em-dash files 0, bad imports 0; red: test/other.test.mjs');",
  'process.exitCode = 1;',
  ''].join('\n');

/**
 * A fresh temp tree standing in for the real one: the planted board under docs/boards/, a fake
 * gate (GREEN unless gate is given), a README. The brief copies it and must never write it. The
 * caller deletes it.
 */
export function plantBriefTree({ prefix = 'brain-brief-plant-', gate = FAKE_GATE } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
  const put = (rel, body) => { const f = path.join(dir, ...rel.split('/')); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, body); };
  put('docs/boards/board-planted.js', PLANTED_BOARD);
  put('bench/gate.mjs', gate);
  put('README.md', 'A planted tree for test/brief.test.mjs.\n');
  put('package.json', JSON.stringify({ type: 'module' }) + '\n');
  return dir;
}
