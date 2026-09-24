// test/autopilot-plant.mjs: the planted trees the autopilot is graded on (Board 10), shared by
// test/autopilot.test.mjs and bench/autopilot.mjs so the test and the bar plant the same code.
// Not a test file itself (no .test.mjs), so the gate does not run it.
//
// Each planted source is a miniature of the real one:
//   census   seed/gen-p: an index.mjs importing one edges file whose lines are e(...) calls, the
//            shape genome/emit.mjs writes; a census verdict whose liveness bitset marks two of
//            its five edges dead; lib/net.mjs walks the seed and test/net.test.mjs grades it
//   imagine  mind/imagine.mjs whose propose() returns one code patch (a unified diff)
//   notes    notes/<name>.md with a line starting "OPEN:" (the planted grammar) and a bullet
//            under an "Open" heading (the grammar the builders already write)
//   gate     bench/verdicts/gate.json with one red row and one slow green row
//   mutants  bench/verdicts/mutants.json with one mutant that survived
import { mkdirSync, writeFileSync, cpSync } from 'node:fs';
import path from 'node:path';

export const HEAD = "import test from 'node:test';\nimport assert from 'node:assert/strict';\n";

/** Write {rel: text} under dir. */
export function writeTree(dir, files) {
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(dir, ...rel.split('/'));
    mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, text);
  }
  return dir;
}

// ---------------------------------------------------------------- imagine: a fix to a clamp
export const CLAMP_BUGGY = 'export function clamp(x, lo, hi) { return x; }\n';
export const CLAMP_TEST = HEAD + "import { clamp } from '../lib/clamp.mjs';\ntest('clamp holds x inside [lo, hi]', () => {\n  assert.equal(clamp(5, 0, 3), 3);\n  assert.equal(clamp(-1, 0, 3), 0);\n  assert.equal(clamp(2, 0, 3), 2);\n});\n";
export const CLAMP_PATCH = '--- a/lib/clamp.mjs\n+++ b/lib/clamp.mjs\n@@ -1 +1 @@\n-export function clamp(x, lo, hi) { return x; }\n+export function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }\n';
export const IMAGINE = '// mind/imagine.mjs (planted): one imagined code patch.\nexport function propose() {\n  return [{ key: \'clamp-bounds\', file: \'lib/clamp.mjs\', test: \'test/clamp.test.mjs\', why: \'clamp ignores its bounds\', patch: '
  + JSON.stringify(CLAMP_PATCH) + ' }];\n}\n';

// ---------------------------------------------------------------- census: two dead edges
export const SEED_INDEX = '// gen-p/index.mjs: a planted seed in the shape genome/emit.mjs writes.\nimport edges_000 from "./edges-000.mjs";\nexport function load() { const out = []; edges_000((src, dst, w) => { out.push({ src, dst, w }); }); return out; }\n';
export const SEED_EDGES = [
  '// gen-p/edges-000.mjs: planted. e(src, dst, w).',
  'export default function edges(e) {',
  'e("a","b",1);',
  'e("b","c",2);',
  'e("x","y",9);',
  'e("c","d",3);',
  'e("y","z",9);',
  '}',
  '',
].join('\n');
export const SEED_DEAD_LINES = [5, 7]; // e("x","y",9) and e("y","z",9): never delivered
export const NET = "import { load } from '../seed/gen-p/index.mjs';\nexport function walk(from) {\n  const E = load();\n  let sum = 0, at = from;\n  const seen = new Set();\n  for (;;) {\n    const e = E.find((x) => x.src === at);\n    if (!e || seen.has(at)) return sum;\n    seen.add(at);\n    sum += e.w;\n    at = e.dst;\n  }\n}\n";
export const NET_TEST = HEAD + "// grades the planted seed seed/gen-p through lib/net.mjs\nimport { walk } from '../lib/net.mjs';\ntest('the walk from a sums the live path', () => {\n  assert.equal(walk('a'), 6);\n  assert.equal(walk('d'), 0);\n});\n";
// bit i of byte i>>3 at position i&7: edges 0, 1 and 3 live (a->b, b->c, c->d), 2 and 4 dead
export const CENSUS_BITS = Buffer.from([0b01011]).toString('base64');
export const CENSUS = JSON.stringify({
  bench: 'census', at: '2026-09-23T00:00:00.000Z', command: 'planted', seed: 'seed/gen-p',
  live: { edges: { n: 5, count: 3, encoding: 'bitset-lsb', b64: CENSUS_BITS } },
}, null, 2) + '\n';

// ---------------------------------------------------------------- notes: an OPEN line
export const MEAN_BUGGY = 'export function mean(xs) {\n  let s = 0;\n  for (let i = 1; i < xs.length; i++) s += xs[i];\n  return s / xs.length;\n}\n';
export const MEAN_TEST = HEAD + "import { mean } from '../lib/mean.mjs';\ntest('mean of a list', () => {\n  assert.equal(mean([2, 4, 6]), 4);\n  assert.equal(mean([5]), 5);\n});\n";
export const MEAN_PATCH = '--- a/lib/mean.mjs\n+++ b/lib/mean.mjs\n@@ -3 +3 @@\n-  for (let i = 1; i < xs.length; i++) s += xs[i];\n+  for (let i = 0; i < xs.length; i++) s += xs[i];\n';
export const MEAN_NOTE = '# mean\n\nlib/mean.mjs averages a list.\n\nOPEN: lib/mean.mjs test/mean.test.mjs mean([2, 4, 6]) must be 4 and mean([5]) must be 5; it returns the wrong value.\n\n## Open\n\n- a streaming mean for lists too long to hold\n  (no test names it yet)\n';

// ---------------------------------------------------------------- slow: a green test that waits
export const SLOW_LIB = 'export const DELAY = 1500;\nexport function work() { const t = Date.now(); while (Date.now() - t < DELAY) { /* busy */ } return 42; }\n';
export const SLOW_TEST = HEAD + "import { work } from '../lib/slow.mjs';\ntest('work returns 42', () => { assert.equal(work(), 42); });\n";
export const SLOW_PATCH = '--- a/lib/slow.mjs\n+++ b/lib/slow.mjs\n@@ -1 +1 @@\n-export const DELAY = 1500;\n+export const DELAY = 0;\n';

/** The gate verdict of a planted tree: rows as given, the shape bench/gate.mjs writes. */
export const gateJson = (tests, at = '2026-09-23T00:00:00.000Z') => JSON.stringify({ at, node: process.version, tests, emDash: [], badImports: [], notes: [], verdict: tests.every((t) => t.exit === 0) ? 'GREEN' : 'RED' }, null, 2) + '\n';
export const MUTANTS = JSON.stringify({ at: '2026-09-23T00:00:00.000Z', suites: { sum: ['test/mean.test.mjs'] }, mutants: [{ id: 'm1', sub: 'sum', file: 'lib/mean.mjs', executed: true, killed: false, why: 'planted survivor' }] }, null, 2) + '\n';

/**
 * A tree where every source yields at least one candidate (read with run:false: nothing is run).
 */
export function plantAllSources(dir) {
  return writeTree(dir, {
    'lib/clamp.mjs': CLAMP_BUGGY, 'test/clamp.test.mjs': CLAMP_TEST, 'mind/imagine.mjs': IMAGINE,
    'seed/gen-p/index.mjs': SEED_INDEX, 'seed/gen-p/edges-000.mjs': SEED_EDGES, 'lib/net.mjs': NET, 'test/net.test.mjs': NET_TEST,
    'bench/verdicts/census.json': CENSUS,
    'lib/mean.mjs': MEAN_BUGGY, 'test/mean.test.mjs': MEAN_TEST, 'notes/mean.md': MEAN_NOTE,
    'lib/slow.mjs': SLOW_LIB, 'test/slow.test.mjs': SLOW_TEST,
    'bench/verdicts/gate.json': gateJson([
      { file: 'test/mean.test.mjs', pass: 0, fail: 1, total: 1, exit: 1, ms: 300 },
      { file: 'test/slow.test.mjs', pass: 1, fail: 0, total: 1, exit: 0, ms: 20_000 },
      { file: 'test/net.test.mjs', pass: 1, fail: 0, total: 1, exit: 0, ms: 200 },
    ]),
    'bench/verdicts/mutants.json': MUTANTS,
  });
}

/**
 * The wet tree of the bar: the REAL gate program copied from `brainRoot`, a failing clamp that
 * mind/imagine.mjs proposes a fix for, and a census seed with two dead edges. No gate.json, no
 * notes, no mutants: the candidates come from imagine and census only.
 */
export function plantWet(dir, brainRoot) {
  mkdirSync(path.join(dir, 'bench'), { recursive: true });
  cpSync(path.join(brainRoot, 'bench', 'gate.mjs'), path.join(dir, 'bench', 'gate.mjs'));
  return writeTree(dir, {
    'lib/clamp.mjs': CLAMP_BUGGY, 'test/clamp.test.mjs': CLAMP_TEST, 'mind/imagine.mjs': IMAGINE,
    'seed/gen-p/index.mjs': SEED_INDEX, 'seed/gen-p/edges-000.mjs': SEED_EDGES, 'lib/net.mjs': NET, 'test/net.test.mjs': NET_TEST,
    'bench/verdicts/census.json': CENSUS,
  });
}

/** The model author's tree: the real gate, a failing mean, and a note with its OPEN line. */
export function plantModel(dir, brainRoot) {
  mkdirSync(path.join(dir, 'bench'), { recursive: true });
  cpSync(path.join(brainRoot, 'bench', 'gate.mjs'), path.join(dir, 'bench', 'gate.mjs'));
  return writeTree(dir, { 'lib/mean.mjs': MEAN_BUGGY, 'test/mean.test.mjs': MEAN_TEST, 'notes/mean.md': MEAN_NOTE });
}
