// test/gaps-plant.mjs: the planted trees test/gaps.test.mjs reads (board 14 builder). Every tree is
// a fresh dir under the OS temp dir, and the test that plants it deletes it. No model, no socket.
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function put(root, rel, data) {
  const p = path.join(root, rel);
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  return p;
}

const AT = '2026-09-24T12:00:00.000Z';
const bar = (extra) => ({ at: AT, node: 'v24', isTheBar: true, split: { development: 'd', heldOut: 'h' }, statement: 's', ...extra });

/** Five verdict files: one met, one missed, one undecidable, one partial with no bar, one bar object. */
export const VERDICTS = Object.freeze({
  'met.json': bar({ command: 'node bench/met.mjs', barMet: true }),
  'missed.json': bar({ command: 'node bench/missed.mjs', barMet: false }),
  'undecidable.json': bar({ command: 'node bench/undecidable.mjs', bar: 'a bar written only as prose' }),
  'lonely-partial.json': { at: AT, command: 'node bench/lonely.mjs --limit 3', isTheBar: false, notTheBarBecause: 'a sample of 3' },
  'barobj.json': bar({ command: 'node --max-old-space-size=6000 bench/barobj.mjs', bar: { ratio: 5, measured: 3, met: false } }),
});

/** The measure the test registers for barobj.json, so the number beside its bar is read. */
export const BAROBJ_MEASURE = Object.freeze({ barobj: { measured: 'bar.measured', bar: 'bar.ratio', unit: 'x', better: 'higher' } });

/** Exactly the lines the five files must yield, in ledger order. */
export const EXPECTED = Object.freeze([
  { id: 'missed:barobj.json', kind: 'missed', measured: 3, bar: 5, distance: 2, subsystem: 'unmapped' },
  { id: 'missed:missed.json', kind: 'missed', measured: null, bar: null, distance: null, subsystem: 'Things' },
  { id: 'unreadable:undecidable.json', kind: 'unreadable bar', measured: null, bar: null, distance: null, subsystem: 'unmapped' },
  { id: 'never:lonely-partial.json', kind: 'bar never completed', measured: null, bar: null, distance: null, subsystem: 'unmapped' },
]);

const ARCH = [
  '# Architecture', '', '## 12. The subsystems above `core/`, and the command that checks each', '',
  '- **Things** (`core/`). `thing.mjs`, the one thing. `node bench/missed.mjs` writes the verdict.',
  '  Check: `node --test', '  test/thing.test.mjs`.', '',
  '## 13. How to check any claim', '', 'One command: `node bench/gate.mjs`.', '',
].join('\n');

/** A tree with the given verdicts, a two-entry ARCHITECTURE map and the files it names. */
export function plantTree({ verdicts = VERDICTS, ladder = null, gate = null, notes = null } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'gaps-plant-'));
  for (const [f, v] of Object.entries(verdicts)) put(root, 'bench/verdicts/' + f, v);
  if (ladder) put(root, 'bench/verdicts/ladder.json', ladder);
  if (gate) put(root, 'bench/verdicts/gate.json', gate);
  if (notes) for (const [f, text] of Object.entries(notes)) put(root, 'notes/' + f, text);
  put(root, 'docs/ARCHITECTURE.md', ARCH);
  put(root, 'core/thing.mjs', 'export const thing = 1;\n');
  put(root, 'bench/missed.mjs', "import { thing } from '../core/thing.mjs';\nconsole.log(thing);\n");
  put(root, 'test/thing.test.mjs', "import '../core/thing.mjs';\n");
  return root;
}

/** A ladder whose only number beside a bar is ARC's frontier row; everything else reads not measured. */
export function plantedLadder() {
  return {
    at: AT, command: 'node bench/ladder.mjs', isTheBar: true, target: { low: 5, high: 10, met: true }, lastDelta: 6,
    board: {
      sets: [
        { key: 'gsm8k', status: 'not measured', bars: { row405: { system: 'R', score: 96.8, pct: 50, side: 'below' } } },
        { key: 'humaneval', status: 'PARTIAL', bars: { frontier: { system: 'F', score: 99.3, pct: 'not measured' }, alone: { verdict: 'not measured', organism: '1/2', other: '2/2' } } },
        { key: 'arc', status: 'whole', bars: { frontier: { system: 'G', score: 98, pct: 17.75, side: 'below' }, alone: { verdict: 'absent' } } },
      ],
      improvement: { percentPerSecond: 'not measured' }, hisRate: { words: '5 percent every second', percentPerSecond: 5 },
      knowledge: { sources: [{ name: 'enwiki', status: 'not measured' }] },
    },
  };
}

/** A gate verdict with one red file, one slow file, one fast green file and one red row. */
export function plantedGate() {
  return {
    at: AT, command: 'node bench/gate.mjs', verdict: 'RED', isTheBar: true,
    tests: [
      { file: 'test/thing.test.mjs', pass: 3, fail: 1, total: 4, exit: 1, ms: 900, budget: { outcome: 'exit' } },
      { file: 'test/slow.test.mjs', pass: 2, fail: 0, total: 2, exit: 0, ms: 15000, budget: { outcome: 'exit' } },
      { file: 'test/fast.test.mjs', pass: 2, fail: 0, total: 2, exit: 0, ms: 14999, budget: { outcome: 'exit' } },
    ],
    rows: { budget: { ok: true, line: 'green' }, boundary: { ok: false, line: 'one boundary finding' } },
    badImports: [], emDash: [],
  };
}
