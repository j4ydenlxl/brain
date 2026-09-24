// test/operators-plant.mjs: THE PLANTED SUBSYSTEM THE OPERATORS ARE GRADED ON (Board 14, item operators).
//
// A fixture, not a test file (the gate runs test/*.test.mjs only). It plants, into a directory the
// caller owns (a temp tree for the tests, a temp copy of the brain for bench/operators.mjs), four
// tiny modules under planted/, one bench per module that prints "metric <n>" as its last line, one
// test file that grades planted/tune.mjs, and the gap lines that point at them. Nothing here opens
// a socket: the author is mocked by mockAuthor(), which returns a fixed answer.
//
//   planted/tune.mjs      GAIN, a knob [4, 20] step 2; metric 100 - (GAIN - 16)^2; bar 95.
//                         From GAIN 10 (metric 64) two steps up reach 96: knob-tune closes the gap.
//   planted/strategy.mjs  STRATEGIES {slow 50, fast 97, mid 80} beside STRATEGY = 'slow'; bar 95.
//                         strategy-swap must keep fast (the better of the two others it tries).
//   planted/edge.mjs      EDGE, a knob [4, 20] step 2 sitting at 20; metric 50 + EDGE; bar 80.
//                         The first step (22) is outside the band: refused before anything runs.
//   planted/drift.mjs     DRIFT, a bare "// knob" at 1.0 (band 0.7 to 1.5, step 0.1); metric
//                         50 + 2 * (DRIFT - 1) plus a planted jitter that alternates +0.5, -0.5
//                         by run count (a counter file on the copy), so the two baseline runs
//                         differ by exactly 1.0 and one step (+0.2, read at +0.7 with the jitter)
//                         lands inside that band: the move is refused.
//   test/planted-tune.test.mjs  a touched test: GAIN inside its band and the metric finite.
import { mkdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const PLANT = Object.freeze({
  'planted/tune.mjs': [
    '// planted/tune.mjs: a planted module whose metric is a function of one knob.',
    'export const GAIN = 10; // knob [4, 20] 2',
    'export function score(g = GAIN) { return 100 - (g - 16) ** 2; }',
    '',
  ].join('\n'),
  'planted/tune-bench.mjs': [
    "import { score } from './tune.mjs';",
    "console.log('metric ' + score());",
    '',
  ].join('\n'),
  'planted/strategy.mjs': [
    '// planted/strategy.mjs: a planted STRATEGIES file beside its selector.',
    'export const STRATEGIES = {',
    '  slow: () => 50,',
    '  fast: () => 97,',
    '  mid: () => 80,',
    '};',
    "export const STRATEGY = 'slow';",
    'export function score() { return STRATEGIES[STRATEGY](); }',
    '',
  ].join('\n'),
  'planted/strategy-bench.mjs': [
    "import { score } from './strategy.mjs';",
    "console.log('metric ' + score());",
    '',
  ].join('\n'),
  'planted/edge.mjs': [
    '// planted/edge.mjs: a planted knob that sits at the top of its band.',
    'export const EDGE = 20; // knob [4, 20] 2',
    'export function score() { return 50 + EDGE; }',
    '',
  ].join('\n'),
  'planted/edge-bench.mjs': [
    "import { score } from './edge.mjs';",
    "console.log('metric ' + score());",
    '',
  ].join('\n'),
  'planted/drift.mjs': [
    '// planted/drift.mjs: a planted knob whose one step moves the metric less than the run-to-run noise.',
    'export const DRIFT = 1.0; // knob',
    'export function score() { return 50 + 2 * (DRIFT - 1); }',
    '',
  ].join('\n'),
  'planted/drift-bench.mjs': [
    "import { readFileSync, writeFileSync } from 'node:fs';",
    "import { score } from './drift.mjs';",
    "const file = new URL('./.drift-runs', import.meta.url);",
    "let n = 0; try { n = Number(readFileSync(file, 'utf8')) || 0; } catch { n = 0; }",
    'writeFileSync(file, String(n + 1));',
    'const jitter = n % 2 === 0 ? 0.5 : -0.5;',
    "console.log('metric ' + Number((score() + jitter).toFixed(6)));",
    '',
  ].join('\n'),
  'test/planted-tune.test.mjs': [
    "import test from 'node:test';",
    "import assert from 'node:assert/strict';",
    "import { GAIN, score } from '../planted/tune.mjs';",
    "test('planted tune: GAIN inside its band and the metric finite', () => {",
    '  assert.ok(GAIN >= 4 && GAIN <= 20);',
    '  assert.ok(Number.isFinite(score()));',
    '});',
    '',
  ].join('\n'),
});

/** A gate that needs nothing: writes bench/verdicts/gate.json GREEN and exits 0 (tests only). */
export const FAKE_GATE = [
  "import { mkdirSync, writeFileSync } from 'node:fs';",
  "mkdirSync('bench/verdicts', { recursive: true });",
  "writeFileSync('bench/verdicts/gate.json', JSON.stringify({ at: new Date().toISOString(), verdict: 'GREEN', tests: [] }));",
  "console.log('GATE GREEN: fixture gate');",
  '',
].join('\n');

/** A gate that is RED (tests only). */
export const RED_GATE = [
  "import { mkdirSync, writeFileSync } from 'node:fs';",
  "mkdirSync('bench/verdicts', { recursive: true });",
  "writeFileSync('bench/verdicts/gate.json', JSON.stringify({ at: new Date().toISOString(), verdict: 'RED', tests: [{ file: 'test/x.test.mjs', exit: 1 }] }));",
  "console.log('GATE RED: fixture gate');",
  'process.exitCode = 1;',
  '',
].join('\n');

/** The planted gap lines, in the shape of state/self/gaps.jsonl. */
export function plantGaps() {
  const g = (id, file, bench, measured, bar, extra = {}) => ({
    id, kind: 'planted', subsystem: 'planted', measured, bar, unit: 'points', distance: bar - measured,
    verdictFile: null, benchCommand: 'node ' + bench,
    trial: { command: 'node ' + bench, minutes: 1, needsModel: false, writes: [] },
    files: [file], since: null, ...extra,
  });
  return {
    tune: g('planted-tune', 'planted/tune.mjs', 'planted/tune-bench.mjs', 64, 95),
    strategy: g('planted-strategy', 'planted/strategy.mjs', 'planted/strategy-bench.mjs', 50, 95),
    edge: g('planted-edge', 'planted/edge.mjs', 'planted/edge-bench.mjs', 70, 80),
    drift: g('planted-drift', 'planted/drift.mjs', 'planted/drift-bench.mjs', 50, 60),
  };
}

/** Write the planted files into dir; gate: 'fake' | 'red' | null (leave the dir's own gate). */
export function plantInto(dir, { gate = null, test = true } = {}) {
  const written = [];
  for (const [rel, body] of Object.entries(PLANT)) {
    if (!test && rel.startsWith('test/')) continue;
    const abs = path.join(dir, ...rel.split('/'));
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, body);
    written.push(rel);
  }
  if (gate) {
    mkdirSync(path.join(dir, 'bench'), { recursive: true });
    writeFileSync(path.join(dir, 'bench', 'gate.mjs'), gate === 'red' ? RED_GATE : FAKE_GATE);
    written.push('bench/gate.mjs');
  }
  return written;
}

/** A fresh temp tree holding only the plant (and a fake gate). The caller deletes it. */
export function plantTree({ gate = 'fake', prefix = 'brain-operators-plant-' } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), prefix));
  plantInto(dir, { gate });
  return dir;
}

/** A diff that sets GAIN from 10 to 14 (the mocked author's good answer), fenced like a model answer. */
export const AUTHOR_DIFF_GOOD = [
  '```diff',
  '--- a/planted/tune.mjs',
  '+++ b/planted/tune.mjs',
  '@@ -2,1 +2,1 @@',
  '-export const GAIN = 10; // knob [4, 20] 2',
  '+export const GAIN = 14; // knob [4, 20] 2',
  '```',
  '',
].join('\n');

/** A diff to a file OUTSIDE the tune gap's files list. */
export const AUTHOR_DIFF_OUTSIDE = [
  '--- a/planted/strategy.mjs',
  '+++ b/planted/strategy.mjs',
  '@@ -7,1 +7,1 @@',
  "-export const STRATEGY = 'slow';",
  "+export const STRATEGY = 'fast';",
  '',
].join('\n');

/** A diff to a file the ceiling forbids (self/). */
export const AUTHOR_DIFF_CEILING = [
  '--- a/self/improve.mjs',
  '+++ b/self/improve.mjs',
  '@@ -1,1 +1,1 @@',
  '-// x',
  '+// y',
  '',
].join('\n');

/**
 * The mocked model cell: budget.author for self/operators.mjs author(). Returns the fixed text,
 * records every request it was asked with in .asked, and never opens a socket.
 */
export function mockAuthor(text, { ms = 5, ok = true, model = 'fixture-author' } = {}) {
  const fn = async (req) => { fn.asked.push(req); return { ok, text: ok ? text : null, ms, model, reason: ok ? null : 'the fixture refused' }; };
  fn.asked = [];
  return fn;
}
