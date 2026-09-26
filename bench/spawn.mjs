// bench/spawn.mjs: DOES A QUESTION GROW THE CELLS THAT ANSWER IT, AND KEEP THEM?
//
// The algebra, sequence and grid suites bench/answer.mjs draws (--tasks per suite, 10 by
// default) are asked three times, on two brains built exactly as bench/answer.mjs builds its
// own (buildBrain, fixture episodes included):
//
//   off   brain A, spawn: false. The direct route: act/solve.mjs answers alone.
//   on1   brain B, spawn: true. Every question is read for features and grows cells.
//   on2   brain B again, the same questions in the same order: what on1 kept is reused.
//
// off and on1 are INTERLEAVED question by question, with the order of the two alternating,
// so a warm JIT or a slow second of the machine lands on both arms alike. on2 runs after, on
// purpose: it measures what on1 left behind.
//
// The bar, printed as GREEN or RED:
//   1. per suite accuracy, on1 >= off and on2 >= off (spawn is never worse)
//   2. cells spawned in on2 < cells spawned in on1 (the second run reuses what the first kept)
// and every row prints cellsBefore, cellsSpawned, cellsKept and ms for each arm. No model is
// asked anywhere: provider 'null', and a spawned answer never calls one.
//
// Writes bench/verdicts/spawn.json only for the bar itself (--tasks 10) run to completion;
// any other size, or a run that stopped early, writes spawn-partial.json with isTheBar false.
//   node bench/spawn.mjs [--tasks 10] [--nowrite] [--quiet]
//
// --census N (board 20 builder, queue item 5, the CLOUD part: "the organism grows its own census").
// Runs N rounds of self/census-round.mjs, model OFF: each round reads the gap ledger, picks the first
// red bench of a typed kind, spawns ONE typed cell for the first development item the organism's
// held cells miss (the real arm) and ONE random cell of the same kind (the placebo arm), wires each
// into a copy of the state directory, re-runs the bench there with growth off, and keeps a cell only
// when the bench moved and no development item or control row regressed. Prints every round, the
// kept counts and kept per hour of both arms, the 95 percent bootstrap band of their difference and
// the census (cells, edges, kinds) of the kept lineage. Writes bench/verdicts/spawn-census.json (the
// bar: N >= 20, every round ran) or spawn-census-partial.json (isTheBar false). The name is not
// census.json because that file is the P8 organism census (tools/organism-census.mjs), read by the
// autopilot's census source and by self/prune.mjs; overwriting it would break both.
//   node bench/spawn.mjs --census 20 [--tmp DIR] [--seed S] [--nowrite] [--quiet]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { buildBrain, buildQuestions, gradeAnswer } from './answer.mjs';
import { ask } from '../act/prompt.mjs';
import { regionCells } from '../genome/spawn.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SUITES = Object.freeze(['algebra', 'sequence', 'grid']);
const BAR_TASKS = 10;

async function one(brain, item, opts) {
  const cellsBefore = brain.cells.length;
  const t = performance.now();
  const a = await ask(brain, item.q, { provider: 'null', ...opts });
  const ms = performance.now() - t;
  const g = gradeAnswer(a.text, item);
  const r = a.spawn || null;
  return {
    ok: g.ok, route: a.route, method: a.provenance ? a.provenance.method : null, ms,
    cellsBefore, cellsSpawned: r ? r.cellsSpawned : 0, cellsKept: r ? r.cellsKept : 0, cellsPruned: r ? r.cellsPruned : 0,
    edgesKept: r ? r.edgesKept : 0, reused: r ? r.reused : 0, carried: r ? r.carried : null, ticks: r ? r.ticks : 0,
    declined: opts.spawn && !r ? 'spawn declined, answered by ' + a.route : null,
  };
}

const f2 = (x) => x.toFixed(2);
const pad = (s, n) => String(s).padEnd(n);
const lpad = (s, n) => String(s).padStart(n);

/**
 * @param {object} [o] { tasks, write, quiet }
 * @returns {Promise<object>} the verdict
 */
export async function run({ tasks = BAR_TASKS, write = true, quiet = false } = {}) {
  const started = performance.now();
  const log = quiet ? () => {} : (s) => console.log(s);
  const all = buildQuestions({ tasksPerSuite: tasks });
  const items = all.filter((q) => SUITES.includes(q.source));
  const brainOff = buildBrain(all, { name: 'spawn-bench-off' });
  const brainOn = buildBrain(all, { name: 'spawn-bench-on' });
  const cellsAtStart = { off: brainOff.cells.length, on: brainOn.cells.length };
  const rows = items.map((q) => ({ id: q.id, suite: q.source, family: q.family }));
  // every gate decision on the spawn brain, by kind and status, read off its own ledger
  const decisions = {};
  const unlisten = brainOn.ledger.on((ev) => { if (ev.type === 'decision') { const k = ev.kind + ' ' + ev.status; decisions[k] = (decisions[k] || 0) + 1; } });
  let completed = false, error = null;
  try {
    for (let i = 0; i < items.length; i++) {
      if (i % 2 === 0) { rows[i].off = await one(brainOff, items[i], { spawn: false }); rows[i].on1 = await one(brainOn, items[i], { spawn: true }); }
      else { rows[i].on1 = await one(brainOn, items[i], { spawn: true }); rows[i].off = await one(brainOff, items[i], { spawn: false }); }
    }
    for (let i = 0; i < items.length; i++) rows[i].on2 = await one(brainOn, items[i], { spawn: true });
    completed = true;
  } catch (err) {
    error = err && err.stack ? err.stack.split('\n').slice(0, 3).join(' | ') : String(err);
  }
  unlisten();
  const done = rows.filter((r) => r.off && r.on1 && r.on2);

  log('spawn bench: ' + items.length + ' questions (' + SUITES.map((s) => s + ' ' + items.filter((q) => q.source === s).length).join(', ') + '), brain cells at start off ' + cellsAtStart.off + ' / on ' + cellsAtStart.on);
  log(pad('suite', 9) + pad('family', 16) + 'off on1 on2 | on1: before spawned kept    ms carried | on2: before spawned kept    ms | off ms');
  for (const r of done) {
    log(pad(r.suite, 9) + pad(r.family, 16)
      + lpad(r.off.ok ? 1 : 0, 3) + lpad(r.on1.ok ? 1 : 0, 4) + lpad(r.on2.ok ? 1 : 0, 4) + ' |'
      + lpad(r.on1.cellsBefore, 12) + lpad(r.on1.cellsSpawned, 9) + lpad(r.on1.cellsKept, 5) + lpad(f2(r.on1.ms), 6) + ' ' + pad(r.on1.carried || '-', 7) + ' |'
      + lpad(r.on2.cellsBefore, 12) + lpad(r.on2.cellsSpawned, 9) + lpad(r.on2.cellsKept, 5) + lpad(f2(r.on2.ms), 6) + ' |' + lpad(f2(r.off.ms), 7));
  }

  const sum = (list, f) => list.reduce((a, r) => a + f(r), 0);
  const suites = {};
  for (const s of SUITES) {
    const l = done.filter((r) => r.suite === s);
    suites[s] = {
      n: l.length,
      off: sum(l, (r) => (r.off.ok ? 1 : 0)), on1: sum(l, (r) => (r.on1.ok ? 1 : 0)), on2: sum(l, (r) => (r.on2.ok ? 1 : 0)),
      carried1: sum(l, (r) => (r.on1.carried ? 1 : 0)), carried2: sum(l, (r) => (r.on2.carried ? 1 : 0)),
      spawned1: sum(l, (r) => r.on1.cellsSpawned), spawned2: sum(l, (r) => r.on2.cellsSpawned),
      msOff: sum(l, (r) => r.off.ms), msOn1: sum(l, (r) => r.on1.ms), msOn2: sum(l, (r) => r.on2.ms),
    };
  }
  const arm = (k) => ({
    ok: sum(done, (r) => (r[k].ok ? 1 : 0)), n: done.length,
    spawned: sum(done, (r) => r[k].cellsSpawned), kept: sum(done, (r) => r[k].cellsKept), pruned: sum(done, (r) => r[k].cellsPruned),
    carried: sum(done, (r) => (r[k].carried ? 1 : 0)), reusedCells: sum(done, (r) => r[k].reused), ms: sum(done, (r) => r[k].ms),
  });
  const runs = { off: arm('off'), on1: arm('on1'), on2: arm('on2') };
  const onNotBelowOff = SUITES.every((s) => suites[s].on1 >= suites[s].off && suites[s].on2 >= suites[s].off);
  const reuse = { run1Spawned: runs.on1.spawned, run2Spawned: runs.on2.spawned, fewer: runs.on2.spawned < runs.on1.spawned };
  const gate = { approved: brainOn.gate.stats.approved, rejected: brainOn.gate.stats.rejected, pending: brainOn.gate.pending.size, byKind: decisions };
  const cellAdds = decisions['cell.add approved'] || 0;
  const region = regionCells(brainOn);
  const barMet = completed && done.length === items.length && onNotBelowOff && reuse.fewer;

  log('');
  log(pad('suite', 9) + '   n  off  on1  on2  carried1 carried2  spawned1 spawned2   ms off   ms on1   ms on2');
  for (const s of SUITES) {
    const x = suites[s];
    log(pad(s, 9) + lpad(x.n, 4) + lpad(x.off, 5) + lpad(x.on1, 5) + lpad(x.on2, 5) + lpad(x.carried1, 10) + lpad(x.carried2, 9) + lpad(x.spawned1, 10) + lpad(x.spawned2, 9) + lpad(f2(x.msOff), 9) + lpad(f2(x.msOn1), 9) + lpad(f2(x.msOn2), 9));
  }
  log('cells spawned: run 1 ' + reuse.run1Spawned + ', run 2 ' + reuse.run2Spawned + (reuse.fewer ? ' (fewer: run 2 reused what run 1 kept)' : ' (NOT fewer)')
    + '; kept by run 1 ' + runs.on1.kept + ', pruned by run 1 ' + runs.on1.pruned + '; spawn region now ' + region + ' cells, brain ' + brainOn.cells.length + ' cells');
  log('gate on the spawn brain: ' + gate.approved + ' approved, ' + gate.rejected + ' rejected, ' + gate.pending + ' pending; by kind: ' + (Object.entries(decisions).map(([k, n]) => k + ' ' + n).join(', ') || 'none'));
  log('spawn on not below spawn off on any suite: ' + (onNotBelowOff ? 'yes' : 'NO'));

  const isTheBar = tasks === BAR_TASKS && completed;
  const statement = 'On ' + done.length + ' questions (' + SUITES.map((s) => s + ' ' + suites[s].n).join(', ') + ', ' + tasks + ' per suite) drawn by bench/answer.mjs, spawn off answered '
    + runs.off.ok + ', spawn on answered ' + runs.on1.ok + ' on its first run and ' + runs.on2.ok + ' on its second; per suite, spawn on was '
    + (onNotBelowOff ? 'never below' : 'BELOW') + ' spawn off. The first spawn-on run grew ' + reuse.run1Spawned + ' cells through ' + cellAdds
    + ' approved cell.add proposals and kept ' + runs.on1.kept + '; spawned circuits carried ' + runs.on1.carried + ' answers on the first run and ' + runs.on2.carried
    + ' on the second, and the second run grew ' + reuse.run2Spawned + ' cells because it ran on the ones the first run kept. No model was asked.'
    + (completed ? '' : ' The run stopped early: ' + error);
  const verdict = {
    at: new Date().toISOString(),
    command: 'node bench/spawn.mjs' + (tasks === BAR_TASKS ? '' : ' --tasks ' + tasks),
    node: process.version,
    isTheBar,
    verdict: barMet ? 'GREEN' : 'RED',
    barMet,
    statement,
    split: splitFor({ suites: SUITES, tasks }),
    bar: { onNotBelowOff: 'per suite, on1 >= off and on2 >= off', reuse: 'cells spawned in run 2 < cells spawned in run 1' },
    suites, runs, reuse, onNotBelowOff, gate, regionCells: region, brainCells: { off: brainOff.cells.length, on: brainOn.cells.length }, cellsAtStart,
    completed, error,
    ms: performance.now() - started,
    perTask: done.map((r) => ({ id: r.id, suite: r.suite, family: r.family, off: r.off, on1: r.on1, on2: r.on2 })),
  };
  if (write) {
    const dir = path.join(HERE, 'verdicts');
    mkdirSync(dir, { recursive: true });
    const file = path.join(dir, isTheBar ? 'spawn.json' : 'spawn-partial.json');
    writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
    verdict.file = path.relative(path.join(HERE, '..'), file).replace(/\\/g, '/');
  }
  return verdict;
}

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
/** What the spawn bar developed on and what it graded: pure, from the suite names and the draw size. */
export function splitFor(opts = {}) {
  return {
    development: { what: 'the suites bench/answer.mjs draws (buildQuestions), asked on brains built as bench/answer.mjs builds its own; on1 grows cells on these questions', suites: Array.isArray(opts.suites) ? opts.suites.slice() : [], tasksPerSuite: opts.tasks ?? null },
    heldOut: { what: 'none: off, on1 and on2 are asked the same questions, and on2 re-asks the on1 questions on purpose to measure reuse', n: 0 },
    contaminated: 'no held-out set: the reuse arm re-asks the questions the first arm grew its cells on, by design',
  };
}

// ---------------------------------------------------------------- --census (board 20 builder)
export const CENSUS_BAR_ROUNDS = 20;
export const CENSUS_REL = 'bench/verdicts/spawn-census.json';
export const CENSUS_PARTIAL_REL = 'bench/verdicts/spawn-census-partial.json';

/** The census split: development is the red bench the round reads, held out is what it never reads. */
export function censusSplit(r) {
  const c = r.ctx;
  return {
    development: { what: 'the red bench read from the gap ledger (' + c.bench.line.id + ', kind ' + c.bench.kind + '): its development items decide every keep', ledger: c.ledger.from, bench: c.bench.line.id, items: c.items.what.dev, n: c.items.dev.length },
    heldOut: { what: c.items.what.heldOut + ': never read inside a round, graded by the same cells-only path at census open and close; the control rows (bench/answer.mjs algebra, sequence, grid, ' + c.controls.length + ' questions) are read only as a no-regression check', n: c.items.heldOut.length },
    contaminated: false,
  };
}

/**
 * Run the census bar and write its verdict from its own measurements.
 * @param {object} [o] { rounds, write, quiet, tmp, seed }
 */
export async function runCensusBench({ rounds = CENSUS_BAR_ROUNDS, write = true, quiet = false, tmp = null, seed = 'census' } = {}) {
  const { runCensus, AUTHOR } = await import('../self/census-round.mjs');
  const log = quiet ? () => {} : (x) => console.log(x);
  const r = await runCensus({ rounds, tmp: tmp || undefined, seed, log });
  const c = r.ctx;
  const f2x = (x) => (x === null || x === undefined ? 'null' : Number(x).toFixed(2));
  const isTheBar = rounds >= CENSUS_BAR_ROUNDS && r.completed;
  const above = r.keptPerHour > r.placeboKeptPerHour;
  const barMet = isTheBar && above && r.band.lo !== null && r.band.lo > 0;
  const realRounds = r.rounds.filter((x) => x.real.target).length;
  log('');
  log('census: ' + r.rounds.length + ' rounds on ' + c.bench.line.id + ' (' + c.bench.kind + '); real arm spawned in ' + realRounds + ' rounds, kept ' + r.kept + ', placebo kept ' + r.placeboKept + '; per hour of the census wall (' + f2x(r.wallS) + ' s, planning included): ' + f2x(r.keptPerHour) + ' vs ' + f2x(r.placeboKeptPerHour) + '; per hour of each arm\'s own round time (' + f2x(r.realMs / 1000) + ' s vs ' + f2x(r.placeboMs / 1000) + ' s): ' + f2x(r.armKeptPerHour) + ' vs ' + f2x(r.armPlaceboKeptPerHour));
  log('noise: the bench before any round ran twice on the start state: ' + c.noise.devRuns.join(' and ') + ' right (diff ' + c.noise.diff + '); bootstrap 95% band of kept per hour of the census wall, real minus placebo, resampling rounds (' + r.band.resamples + ' resamples): [' + f2x(r.band.lo) + ', ' + f2x(r.band.hi) + ']');
  log('held out (' + c.items.heldOut.length + ' items, never read in a round): cells answered ' + c.heldOutBefore.right + ' at open, ' + r.heldOutAfter.right + ' at close on the real lineage, ' + r.heldOutPlaceboAfter.right + ' on the placebo lineage');
  log('census of the kept lineage: ' + r.census.cells + ' cells, ' + r.census.edges + ' edges, ' + r.census.kinds + ' kinds, spawn region ' + r.census.spawnRegion + ' (start ' + c.startCensus.cells + ' cells, ' + c.startCensus.edges + ' edges, ' + c.startCensus.kinds + ' kinds); placebo lineage ' + r.placeboCensus.cells + ' cells');
  const statement = 'Model off, ' + r.rounds.length + ' census rounds (self/census-round.mjs) read the gap ledger (' + c.ledger.from + ') and picked the red bench ' + c.bench.line.id + ' of kind ' + c.bench.kind
    + '. The real arm spawned one ' + c.bench.kind + ' through genome/spawn.mjs for the first development item the held cells missed (' + realRounds + ' rounds had one) and kept ' + r.kept + '; the placebo arm spawned one random ' + c.bench.kind + ' per round by the same path and kept ' + r.placeboKept
    + '. A cell was kept only when the bench, re-run on a copy of the state with growth off, answered more of its ' + c.items.dev.length + ' development items with no item lost and no fewer of ' + c.controls.length + ' control rows right. Kept per hour of the ' + f2x(r.wallS) + ' s census wall: real ' + f2x(r.keptPerHour) + ', placebo ' + f2x(r.placeboKeptPerHour)
    + ', bootstrap 95% band of the difference [' + f2x(r.band.lo) + ', ' + f2x(r.band.hi) + ']. The ' + c.items.heldOut.length + ' held-out items were answered by cells ' + c.heldOutBefore.right + ' times at open and ' + r.heldOutAfter.right + ' at close. The kept lineage holds '
    + r.census.cells + ' cells, ' + r.census.edges + ' edges and ' + r.census.kinds + ' kinds (it started at ' + c.startCensus.cells + ' cells). The bar (kept per hour above the placebo with the band above zero, at least ' + CENSUS_BAR_ROUNDS + ' rounds) is ' + (barMet ? 'met' : 'NOT met') + '.'
    + (r.error ? ' The run stopped early: ' + r.error : '');
  const slim = (a) => ({ target: a.target || null, steps: a.steps || [], spawned: a.spawned, edges: a.edges, before: a.before, after: a.after, moved: a.moved, lost: a.lost.length, controlBefore: a.controlBefore, controlAfter: a.controlAfter, kept: a.kept, why: a.why, ms: a.ms });
  const verdict = {
    at: new Date().toISOString(),
    command: 'node bench/spawn.mjs --census ' + rounds,
    node: process.version,
    by: AUTHOR,
    isTheBar,
    barMet,
    verdict: barMet ? 'GREEN' : 'RED',
    statement,
    split: censusSplit(r),
    bar: { rule: 'keptPerHour > placeboKeptPerHour and the bootstrap 95% band of their difference above zero, at n >= ' + CENSUS_BAR_ROUNDS + ' rounds', rounds: CENSUS_BAR_ROUNDS },
    n: r.rounds.length, rounds: r.rounds.length, roundsAsked: rounds,
    cells: r.census.cells, edges: r.census.edges, kinds: r.census.kinds, spawnRegion: r.census.spawnRegion, spawnKinds: r.census.spawnKinds,
    kept: r.kept, keptPerHour: r.keptPerHour, placeboKept: r.placeboKept, placeboKeptPerHour: r.placeboKeptPerHour,
    perHourOf: 'the whole census wall (wallSeconds): open with the spawn operator\'s planning, every round of both arms, close',
    armKeptPerHour: r.armKeptPerHour, armPlaceboKeptPerHour: r.armPlaceboKeptPerHour,
    realSeconds: r.realMs / 1000, placeboSeconds: r.placeboMs / 1000, wallSeconds: r.wallS,
    band: r.band, noise: c.noise,
    bench: { ...c.bench.line, kind: c.bench.kind, source: c.bench.source, skipped: c.bench.skipped },
    ledger: c.ledger, start: c.start, startCensus: c.startCensus, placeboCensus: r.placeboCensus,
    heldOut: { n: c.items.heldOut.length, before: c.heldOutBefore.right, after: r.heldOutAfter.right, placeboAfter: r.heldOutPlaceboAfter.right },
    development: { n: c.items.dev.length, before: c.noise.devRuns[0], after: c.lineage.real.score.right, placeboAfter: c.lineage.placebo.score.right },
    controls: { n: c.controls.length, before: r.rounds.length ? r.rounds[0].real.controlBefore : null, after: c.lineage.real.control.right },
    planSeconds: c.planMs / 1000, openSeconds: c.openMs / 1000, workDeleted: r.workDeleted, modelCalls: 0,
    completed: r.completed, error: r.error,
    perRound: r.rounds.map((x) => ({ round: x.round, real: slim(x.real), placebo: slim(x.placebo) })),
  };
  if (write) {
    const rel = isTheBar ? CENSUS_REL : CENSUS_PARTIAL_REL;
    const file = path.join(HERE, '..', rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
    verdict.file = rel;
  }
  return verdict;
}

function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue;
    const k = argv[i].slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) out[k] = true; else { out[k] = v; i++; }
  }
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = args(process.argv.slice(2));
  if (a.census !== undefined) {
    const n = a.census === true ? CENSUS_BAR_ROUNDS : Number(a.census);
    if (!(Number.isInteger(n) && n > 0)) throw new Error('--census takes a positive integer');
    const v = await runCensusBench({ rounds: n, write: !a.nowrite, quiet: !!a.quiet, tmp: typeof a.tmp === 'string' ? a.tmp : null, seed: typeof a.seed === 'string' ? a.seed : 'census' });
    console.log('CENSUS ' + v.verdict + ' (isTheBar ' + v.isTheBar + ', barMet ' + v.barMet + '): kept ' + v.kept + ' vs placebo ' + v.placeboKept + ', kept per hour ' + v.keptPerHour.toFixed(2) + ' vs ' + v.placeboKeptPerHour.toFixed(2) + ', band [' + (v.band.lo === null ? 'null' : v.band.lo.toFixed(2)) + ', ' + (v.band.hi === null ? 'null' : v.band.hi.toFixed(2)) + '], cells ' + v.cells + ', edges ' + v.edges + ', kinds ' + v.kinds + ', ' + v.wallSeconds.toFixed(1) + ' s; ' + (v.file ? 'verdict written to ' + v.file : 'no verdict file was written (--nowrite)'));
    if (!v.barMet) process.exitCode = 1;
  } else {
  const tasks = a.tasks === undefined || a.tasks === true ? BAR_TASKS : Number(a.tasks);
  if (!(Number.isInteger(tasks) && tasks > 0)) throw new Error('--tasks takes a positive integer');
  const v = await run({ tasks, write: !a.nowrite, quiet: !!a.quiet });
  console.log('SPAWN ' + v.verdict + ': ' + v.statement + ' ' + f2(v.ms) + 'ms, ' + (v.file ? 'verdict written to ' + v.file : 'no verdict file was written (--nowrite)'));
  if (v.verdict !== 'GREEN') process.exitCode = 1;
  }
}
