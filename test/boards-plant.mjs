// test/boards-plant.mjs: a planted tree for test/boards.test.mjs. Author: board 15 builder.
// Board 90 is written in the real grammar of docs/boards/board-N.js: a MARKER constant, a meta
// name, and an ITEMS array of objects with key, owns and task, one task a single-quoted string
// with an escaped quote, one a template literal holding backticks in its prose (escaped, as the
// real boards write them) and a ${...} that is never evaluated, one with wave and ollama fields.
// Board 91 does not parse (an unterminated template literal). Nothing here runs a board.
import { mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import path from 'node:path';

const BT = '`';
const esc = (s) => s.replaceAll(BT, '\\' + BT);

export const ALPHA_TASK = "ITEM alpha (a done item). BUILD lib/alpha.mjs. BAR (bench/alpha.mjs, bench/verdicts/alpha.json, isTheBar true, barMet boolean): node bench/alpha.mjs --fast prints the count and writes bench/verdicts/alpha.json once. Tests: node --test test/alpha.test.mjs (the organism's own count).";
export const BETA_TASK = 'ITEM beta (an undone item whose prose quotes code: run ' + BT + 'node bench/beta.mjs --seed 3' + BT + ' by hand, never ' + BT + 'rm -rf' + BT + '; the template ${notEvaluated} stays text). BUILD lib/beta.mjs. BAR (bench/verdicts/beta.json, isTheBar true, barMet boolean): node bench/beta.mjs --seed 3 writes bench/verdicts/beta.json; bar met when beta beats null. Tests (test/beta.test.mjs): a planted case.';
export const GAMMA_TASK = 'ITEM gamma (never measured; the model cell answers through Ollama). BUILD lib/gamma.mjs. BAR: bench/verdicts/gamma.json isTheBar true with barMet, from the bench named nowhere as a command. Tests: none.';

/** The source text of board-90.js, in the real grammar. */
export function board90Source(root) {
  const marker = path.join(root, 'state', 'board90.marker').replaceAll('\\', '\\\\');
  return [
    "// Board 90: a planted board for test/boards.test.mjs.",
    "const MARKER = '" + marker + "'",
    "const MODEL_BUILD = 'opus'",
    "",
    "export const meta = {",
    "  name: 'board-90-planted',",
    "  description: 'three items: one done, two undone',",
    "}",
    "",
    "const ITEMS = [",
    "  {",
    "    key: 'alpha',",
    "    model: MODEL_BUILD,",
    "    owns: 'lib/alpha.mjs (new), bench/alpha.mjs (new), bench/verdicts/alpha.json (new)',",
    "    task: '" + ALPHA_TASK.replaceAll("'", "\\'") + "',",
    "  },",
    "  {",
    "    key: 'beta',",
    "    owns: 'lib/beta.mjs (new), bench/beta.mjs (new), test/beta.test.mjs (new), notes/beta.md (new), bench/verdicts/beta.json (new)',",
    "    task: " + BT + esc(BETA_TASK) + BT + ",",
    "  },",
    "  {",
    "    key: 'gamma', wave: 2, ollama: true,",
    "    owns: 'lib/gamma.mjs (the gamma function only, nothing else), bench/verdicts/gamma.json (new)',",
    "    task: " + BT + esc(GAMMA_TASK) + BT + ",",
    "  },",
    "]",
    "",
    "export default async function () { return ITEMS.map((x) => x.key) }",
    "",
  ].join('\n');
}

export const BROKEN_SOURCE = [
  "const MARKER = 'C:\\\\nowhere\\\\state\\\\board91.marker'",
  "const ITEMS = [",
  "  { key: 'lost', owns: 'lib/lost.mjs (new)', task: " + BT + "BAR (bench/verdicts/lost.json): never closed },",
  "]",
  "",
].join('\n');

const write = (root, rel, text) => { const f = path.join(root, ...rel.split('/')); mkdirSync(path.dirname(f), { recursive: true }); writeFileSync(f, text); return f; };

/**
 * Plant board 90 (launched: its marker exists), the broken board 91, and the verdict files:
 * alpha.json met, beta.json missed with beta-partial.json beside it, gamma.json absent.
 * The marker is dated one hour back so a verdict written now is this board's result.
 */
export function plantBoards(root, { broken = true } = {}) {
  write(root, 'docs/boards/board-90.js', board90Source(root));
  if (broken) write(root, 'docs/boards/board-91.js', BROKEN_SOURCE);
  const marker = write(root, 'state/board90.marker', 'launched\n');
  const hourAgo = new Date(Date.now() - 3_600_000);
  utimesSync(marker, hourAgo, hourAgo);
  const now = new Date().toISOString();
  write(root, 'bench/verdicts/alpha.json', JSON.stringify({ at: now, command: 'node bench/alpha.mjs', node: process.version, isTheBar: true, barMet: true, statement: 'planted' }, null, 2));
  write(root, 'bench/verdicts/beta.json', JSON.stringify({ at: now, command: 'node bench/beta.mjs', node: process.version, isTheBar: true, barMet: false, statement: 'planted' }, null, 2));
  write(root, 'bench/verdicts/beta-partial.json', JSON.stringify({ at: now, isTheBar: false, barMet: false }, null, 2));
  write(root, 'lib/gamma.mjs', 'export function gamma(x) {\n  return x + 1;\n}\n');
  write(root, 'test/gamma.test.mjs', "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { gamma } from '../lib/gamma.mjs';\ntest('gamma adds one', () => { assert.equal(gamma(1), 2); });\n");
  return root;
}

/** A whole-file diff of lib/gamma.mjs in the form of self/brief.mjs patchSetOf. */
export const SET_PATCH = '--- a/lib/gamma.mjs\n+++ b/lib/gamma.mjs\n@@ -1,3 +1,4 @@\n-export function gamma(x) {\n-  return x + 1;\n-}\n+// kept as a set\n+export function gamma(x) {\n+  return x + 1;\n+}\n';

/** A planted self/brief.mjs: `kind` picks what its runBrief returns (refuse, keep, red, whole, set, setnew). */
export function plantBrief(root, kind = 'refuse') {
  const body = {
    refuse: "return { kept: false, wall: 'plan', reason: 'the planted brief refuses ' + gap.id + ' with ' + opts.modelCalls + ' model calls', modelCalls: 0, steps: [] };",
    keep: "return { kept: true, modelCalls: 0, steps: [{ step: 'write' }], patch: '--- a/lib/gamma.mjs\\n+++ b/lib/gamma.mjs\\n@@ -1,3 +1,4 @@\\n export function gamma(x) {\\n+  // kept by the planted brief\\n   return x + 1;\\n }\\n' };",
    red: "return { kept: true, modelCalls: 0, steps: [], patch: '--- a/lib/gamma.mjs\\n+++ b/lib/gamma.mjs\\n@@ -1,3 +1,3 @@\\n export function gamma(x) {\\n-  return x + 1;\\n+  return x + 2;\\n }\\n' };",
    whole: "return { kept: true, modelCalls: 0, steps: [], patchSet: [{ file: 'lib/new.mjs', content: 'export const n = 1;\\n' }] };",
    // the shape self/brief.mjs runBrief returns: patchSet {files, patch}, whole-file diffs
    set: "return { kept: true, modelCalls: 0, steps: [], patchSet: { author: 'organism (brief)', files: [{ file: 'lib/gamma.mjs', isNew: false }], patch: " + JSON.stringify(SET_PATCH) + " } };",
    setnew: "return { kept: true, modelCalls: 0, steps: [], patchSet: { author: 'organism (brief)', files: [{ file: 'lib/gamma.mjs', isNew: false }, { file: 'lib/fresh.mjs', isNew: true }], patch: " + JSON.stringify(SET_PATCH + '--- /dev/null\n+++ b/lib/fresh.mjs\n@@ -0,0 +1,1 @@\n+export const fresh = 1;\n') + " } };",
  }[kind];
  return write(root, 'self/brief.mjs', 'export async function runBrief(gap, opts) {\n  ' + body + '\n}\n');
}

/** The planted gamma source, to prove a revert byte for byte. */
export const GAMMA_SOURCE = 'export function gamma(x) {\n  return x + 1;\n}\n';
