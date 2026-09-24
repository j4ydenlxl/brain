// tasks/index.mjs: THE YARDSTICK. Four suites the brain is measured against, each one
// a seeded generator, a solver made of cells, and a grader that prints a number.
//
//   algebra   exact arithmetic and one-variable algebra of the kinds language models get
//             wrong: decimal order (9.11 against 9.9), 0.1 + 0.2, 8 to 15 digit products,
//             fractions, nested expressions, integer powers, linear equations.
//   sequence  next element of an exact rational sequence, induced by verified sym programs.
//   grid      ARC-style tasks: a hidden composition of grid cell primitives, recovered
//             from demonstrations and executed through real cells on a held-out input.
//   venue     one instrument window of a recorded market tape per task, traded by the
//             organism's own venue.trader path, graded against a matched random control.
//
// Every expected answer in the algebra and sequence suites is computed by tasks/exact.mjs,
// which imports nothing from core/. Nothing here grades the brain with the brain.
//
// WHY `SUITES` IS STILL THE THREE. A row of the scoreboard bench/tasks.mjs writes is
// `correct of n`, and its totals add those rows up. The first three suites count ANSWERS,
// exact and checkable; the venue suite counts WINDOWS a control was beaten on, which is a
// different population with a different meaning of correct. Summing them would publish one
// accuracy over two populations, so `SUITES` keeps the exact answer suites and
// `SUITES_ALL` is the full list. getSuite() names any of the four.
import { algebraSuite } from './algebra.mjs';
import { sequenceSuite } from './sequence.mjs';
import { gridSuite } from './grid.mjs';
import { venueSuite } from './venue.mjs';

export { algebraSuite } from './algebra.mjs';
export { sequenceSuite } from './sequence.mjs';
export { gridSuite } from './grid.mjs';
export { venueSuite } from './venue.mjs';
export * as exact from './exact.mjs';
// Running a suite INSIDE a brain somebody else built: name the cells to inject into, and
// wire a read head so the answer can leave a brain whose every out port is already wired.
export { nameCells, attachTap, readHeads } from './host.mjs';

export { generateAlgebra, solveAlgebra, gradeAlgebra, runAlgebra, buildAlgebraBrain, specToSym, canonNum, ALGEBRA_COUNTS, ALGEBRA_ROLES, ALGEBRA_CELLS, algebraCellsOf, roleOfRoute } from './algebra.mjs';
export { generateSequences, solveSequences, gradeSequences, runSequences, buildSequenceBrain, fitSequence, SEQUENCE_COUNTS, SEQUENCE_ROLES, SEQUENCE_CELLS, sequenceCellsOf } from './sequence.mjs';
export { generateGrids, solveGrids, gradeGrids, runGrids, buildGridBrain, searchProgram, inferColorMap, runProgramInBrain, SEARCH_OPS, GRID_COUNTS } from './grid.mjs';
export { generateVenue, solveVenue, gradeVenue, runVenue, clearTapeCache, venueCellsOf, windowTapeOf, runWindowArm, matchedControl, VENUE_COUNTS, VENUE_KINDS_NEEDED, VENUE_ROLES, DEFAULT_SIZE as VENUE_SIZE, DEFAULT_DRAW_SEED as VENUE_DRAW_SEED, TRADER_DB as VENUE_TAPE_DB, TAPE_VENUE } from './venue.mjs';

/** The exact answer suites, whose rows bench/tasks.mjs adds up into one accuracy. */
export const SUITES = Object.freeze([algebraSuite, sequenceSuite, gridSuite]);
/** Every suite, including the one whose number is a difference against a control. */
export const SUITES_ALL = Object.freeze([algebraSuite, sequenceSuite, gridSuite, venueSuite]);

export function getSuite(name) {
  const s = SUITES_ALL.find(s => s.name === name);
  if (!s) throw new Error('tasks: unknown suite ' + name + ' (have ' + SUITES_ALL.map(s => s.name).join(', ') + ')');
  return s;
}

// Run the exact answer suites and return one report per suite, in declaration order.
// Pass `all` to include the venue suite, whose report is a difference and not an answer.
export function runAll(opts = {}) {
  const list = opts.all ? SUITES_ALL : SUITES;
  return list.map(s => s.run(opts[s.name] || {}).report);
}
