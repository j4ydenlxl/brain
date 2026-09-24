// tasks/grid.mjs: THE YARDSTICK FOR PROGRAM INDUCTION. ARC-style tasks. Each one is a
// hidden composition of one to three grid primitives from cells/grid.mjs, shown only
// through three demonstration pairs. The solver never sees the program. It searches
// compositions up to depth three against the demonstrations, and the first composition
// that reproduces every demonstration exactly is applied to a held-out test input.
//
// The search runs on the pure functions (a tick per candidate would buy nothing but
// time), but the answer that gets graded does not: the winning program is wired as a
// chain of real grid cells in a real Brain, the test input is injected, the brain is
// ticked, and the grid that arrives in the outbox is what the grader compares. If the
// cells and the pure functions ever disagreed, the accuracy would fall, which is the
// only kind of check worth having.
//
// Colour maps are handled differently from the geometry, on purpose. Searching every
// possible recolouring is hopeless, so the solver INFERS one: given the grids a prefix
// produces and the grids the demonstrations want, it reads off the colour
// correspondence and checks it is consistent across every cell of every demonstration.
// Generated colour maps only ever permute non-background colours, which makes them
// commute with every other primitive in the vocabulary, so looking for the recolouring
// only at the end of a program costs no coverage.
import { RNG } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import { G } from '../cells/grid.mjs';
import '../cells/grid.mjs';

// ---------------------------------------------------------------- the vocabulary
// Each entry is one cell kind with one fixed parameter set, plus the pure function that
// the search uses. name is what the reports print.
function op(name, kind, params, apply) { return { name, kind, params, apply }; }

export const SEARCH_OPS = (() => {
  const list = [
    op('rotate1', 'grid.rotate', { turns: 1 }, (g) => G.rotate(g, 1)),
    op('rotate2', 'grid.rotate', { turns: 2 }, (g) => G.rotate(g, 2)),
    op('rotate3', 'grid.rotate', { turns: 3 }, (g) => G.rotate(g, 3)),
    op('flipH', 'grid.flip', { axis: 'h' }, (g) => G.flip(g, 'h')),
    op('flipV', 'grid.flip', { axis: 'v' }, (g) => G.flip(g, 'v')),
    op('transpose', 'grid.transpose', {}, (g) => G.transpose(g)),
    op('cropBBox', 'grid.crop', { mode: 'bbox', bg: 0 }, (g) => G.cropBBox(g, 0)),
  ];
  for (const dy of [-1, 0, 1]) for (const dx of [-1, 0, 1]) {
    if (dx === 0 && dy === 0) continue;
    list.push(op('roll(' + dx + ',' + dy + ')', 'grid.translate', { dx, dy, wrap: true, fill: 0 }, (g) => G.translate(g, dx, dy, { wrap: true })));
  }
  for (const [nx, ny] of [[2, 1], [1, 2], [2, 2]]) {
    list.push(op('tile' + nx + 'x' + ny, 'grid.tile', { nx, ny }, (g) => G.tile(g, nx, ny)));
  }
  return Object.freeze(list);
})();

const OP_BY_NAME = new Map(SEARCH_OPS.map(o => [o.name, o]));
const MAX_CELLS = 4096;   // a candidate that has grown past this is not the answer to a small task

// A colormap step carries its own inferred map, so it is built rather than looked up.
function colormapOp(map) {
  return op('colormap' + JSON.stringify(map), 'grid.colormap', { map }, (g) => G.colormap(g, map));
}

// ---------------------------------------------------------------- generator
export const GRID_COUNTS = Object.freeze({ depth1: 50, depth2: 55, depth3: 55 });

function randomPalette(rng) {
  const colors = [];
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const k = 2 + rng.int(3);
  for (let i = 0; i < k; i++) colors.push(pool.splice(rng.int(pool.length), 1)[0]);
  return colors;
}
function randomGrid(rng, palette, w, h, bgBias = 0.4) {
  const g = G.make(w, h, 0);
  for (let i = 0; i < g.cells.length; i++) g.cells[i] = rng.next() < bgBias ? 0 : palette[rng.int(palette.length)];
  return g;
}
// A permutation of the non-background colours with no fixed point where one is possible.
function randomColorMap(rng, palette) {
  if (palette.length < 2) return null;
  const shifted = palette.slice(1).concat(palette.slice(0, 1));
  const map = {};
  for (let i = 0; i < palette.length; i++) map[palette[i]] = shifted[i];
  if (rng.int(2) === 0) { const rev = {}; for (const k of Object.keys(map)) rev[map[k]] = Number(k); return rev; }
  return map;
}

function applyProgram(program, g) {
  let cur = g;
  for (const o of program) {
    cur = o.apply(cur);
    if (!cur || cur.cells.length > MAX_CELLS) return null;
  }
  return cur;
}

function pickProgram(rng, palette, length) {
  const program = [];
  let usedTile = false, usedCrop = false, usedMap = false;
  let guard = 0;
  while (program.length < length && guard++ < 200) {
    if (!usedMap && rng.int(4) === 0) {
      const map = randomColorMap(rng, palette);
      if (!map) continue;
      program.push(colormapOp(map)); usedMap = true; continue;
    }
    const o = SEARCH_OPS[rng.int(SEARCH_OPS.length)];
    if (o.name.startsWith('tile')) { if (usedTile) continue; usedTile = true; }
    if (o.name === 'cropBBox') { if (usedCrop) continue; usedCrop = true; }
    program.push(o);
  }
  return program.length === length ? program : null;
}

function makeTask(rng, id, length) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const palette = randomPalette(rng);
    const program = pickProgram(rng, palette, length);
    if (!program) continue;
    const w = 2 + rng.int(4), h = 2 + rng.int(4);
    const pairs = [];
    let ok = true, moved = false;
    for (let i = 0; i < 4; i++) {
      const input = randomGrid(rng, palette, w, h);
      const output = applyProgram(program, input);
      if (!output) { ok = false; break; }
      if (!G.equal(input, output)) moved = true;
      pairs.push({ input, output });
    }
    if (!ok || !moved) continue;
    return {
      id, length,
      program: program.map(o => o.name),
      demos: pairs.slice(0, 3),
      test: pairs[3],
      palette,
    };
  }
  return null;
}

export function generateGrids({ seed = 'grid/1', counts = GRID_COUNTS } = {}) {
  const c = { ...GRID_COUNTS, ...counts };
  const out = [];
  for (const [key, length] of [['depth1', 1], ['depth2', 2], ['depth3', 3]]) {
    const rng = new RNG(seed + ':' + key);
    let made = 0, guard = 0;
    while (made < c[key] && guard++ < c[key] * 20) {
      const t = makeTask(rng, 'grid.d' + length + '.' + made, length);
      if (!t) continue;
      out.push(t); made++;
    }
  }
  for (const t of out) t.prompt = t.demos.map(d => G.toString(d.input) + ' -> ' + G.toString(d.output).replace(/\n/g, '|')).join(' ; ');
  return out;
}

// ---------------------------------------------------------------- the search
// Given the grids a prefix produced and the grids wanted, read off the one colour
// correspondence that would close the gap, or null when no single map can.
export function inferColorMap(current, wanted) {
  const map = new Map();
  for (let d = 0; d < current.length; d++) {
    const a = current[d], b = wanted[d];
    if (!a || !b || a.w !== b.w || a.h !== b.h) return null;
    for (let i = 0; i < a.cells.length; i++) {
      const from = a.cells[i], to = b.cells[i];
      const seen = map.get(from);
      if (seen === undefined) map.set(from, to);
      else if (seen !== to) return null;
    }
  }
  let identity = true;
  const obj = {};
  for (const [k, v] of map) { obj[k] = v; if (k !== v) identity = false; }
  return identity ? null : obj;
}

function matches(current, wanted) {
  for (let i = 0; i < current.length; i++) if (!current[i] || !G.equal(current[i], wanted[i])) return false;
  return true;
}
function stateKey(grids) { return grids.map(G.key).join('|'); }

// searchProgram(demos, maxDepth) -> { program: op[], names: string[], searched: number } or
// { program: null, searched }. searched counts candidate programs tested against the
// demonstrations, which is the number the bench reports as search size.
export function searchProgram(demos, { maxDepth = 3 } = {}) {
  const inputs = demos.map(d => d.input), wanted = demos.map(d => d.output);
  let searched = 0;

  // depth zero: the identity, and the identity plus an inferred recolouring
  const tryTerminal = (prefix, current) => {
    searched++;
    if (matches(current, wanted)) return prefix;
    const map = inferColorMap(current, wanted);
    if (!map) return null;
    const step = colormapOp(map);
    searched++;
    const after = current.map(g => step.apply(g));
    if (matches(after, wanted)) return prefix.concat([step]);
    return null;
  };

  const hit0 = tryTerminal([], inputs);
  if (hit0) return { program: hit0, names: hit0.map(o => o.name), searched };

  for (let limit = 1; limit <= maxDepth; limit++) {
    const best = new Map([[stateKey(inputs), 0]]);
    const walk = (prefix, current, depth) => {
      if (depth === limit) return null;
      for (const o of SEARCH_OPS) {
        const next = current.map(g => o.apply(g));
        if (next.some(g => !g || g.cells.length > MAX_CELLS)) continue;
        const key = stateKey(next);
        const seen = best.get(key);
        if (seen !== undefined && seen <= depth + 1) continue;
        best.set(key, depth + 1);
        const hit = tryTerminal(prefix.concat([o]), next);
        if (hit) return hit;
        const deeper = walk(prefix.concat([o]), next, depth + 1);
        if (deeper) return deeper;
      }
      return null;
    };
    const hit = walk([], inputs, 0);
    if (hit) return { program: hit, names: hit.map(o => o.name), searched };
  }
  return { program: null, names: null, searched };
}

// ---------------------------------------------------------------- the executing organism
export function buildGridBrain({ name = 'grid', ledger = 'runs' } = {}) {
  return new Brain({ name, ledger, pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
}

// Wire the found program as a chain of grid cells, inject the test input, tick once per
// link, and return whatever grid reaches the outbox.
export function runProgramInBrain(brain, program, input, tag) {
  if (!program || program.length === 0) return { grid: input, cells: [] };
  const ids = [];
  for (let i = 0; i < program.length; i++) {
    const id = 'g.' + tag + '.' + i;
    brain.addCell({ id, kind: program[i].kind, region: 'cognitive', circuit: 'grid', params: program[i].params, policy: { period: 'event' } });
    ids.push(id);
    if (i > 0) brain.connect(ids[i - 1], 'out', id, 'in');
  }
  const lastIdx = brain.cell(ids[ids.length - 1]).idx;
  brain.inject(ids[0], 'in', { kind: 'event', data: input });
  brain.tick(program.length);
  const outs = brain.takeOutbox().filter(s => s.src === lastIdx);
  const sig = outs[outs.length - 1] ?? null;
  return { grid: sig ? sig.data : null, cells: ids };
}

export function solveGrids(tasks, { brain = null, maxDepth = 3 } = {}) {
  const b = brain || buildGridBrain();
  const results = [];
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const found = searchProgram(t.demos, { maxDepth });
    let got = null, cells = [];
    if (found.program) {
      const run = runProgramInBrain(b, found.program, t.test.input, String(i));
      got = run.grid; cells = run.cells;
    }
    results.push({
      id: t.id,
      found: found.names,
      searched: found.searched,
      got,
      cells: cells.length,
    });
  }
  return { brain: b, results };
}

// ---------------------------------------------------------------- grader
export function gradeGrids(tasks, results, { maxFailures = 20 } = {}) {
  const byId = new Map(results.map(r => [r.id, r]));
  const byDepth = {};
  const failures = [];
  let correct = 0, searchedTotal = 0, foundTotal = 0, sameProgram = 0, foundButWrong = 0, notFound = 0;
  for (const t of tasks) {
    const r = byId.get(t.id) || { got: null, found: null, searched: 0 };
    const ok = !!r.got && G.equal(r.got, t.test.output);
    if (ok) correct++;
    searchedTotal += r.searched || 0;
    if (r.found) {
      foundTotal++;
      if (r.found.join(' ') === t.program.join(' ')) sameProgram++;
      if (!ok) foundButWrong++;
    } else notFound++;
    const key = 'depth' + t.length;
    const e = byDepth[key] || (byDepth[key] = { n: 0, correct: 0, searched: 0, found: 0 });
    e.n++; if (ok) e.correct++; e.searched += r.searched || 0; if (r.found) e.found++;
    if (!ok) failures.push({ id: t.id, hidden: t.program, found: r.found, searched: r.searched, reason: r.found ? 'a different program fits every demonstration' : 'no program up to depth 3 fits the demonstrations' });
  }
  for (const k of Object.keys(byDepth)) {
    byDepth[k].accuracy = byDepth[k].n ? byDepth[k].correct / byDepth[k].n : 0;
    byDepth[k].meanSearched = byDepth[k].n ? byDepth[k].searched / byDepth[k].n : 0;
  }
  return {
    suite: 'grid', n: tasks.length, correct,
    accuracy: tasks.length ? correct / tasks.length : 0,
    meanSearchSize: tasks.length ? searchedTotal / tasks.length : 0,
    programsFound: foundTotal, programsNotFound: notFound,
    foundButWrong, recoveredHiddenProgram: sameProgram,
    byDepth, failures: failures.slice(0, maxFailures), failureCount: failures.length, allFailures: failures,
  };
}

export function runGrids(opts = {}) {
  const tasks = generateGrids(opts);
  const t0 = process.hrtime.bigint();
  const { brain, results } = solveGrids(tasks, opts);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const report = gradeGrids(tasks, results, opts);
  report.ms = Math.round(ms * 1000) / 1000;
  report.cells = brain.cells.length;
  report.ticks = brain.stats.ticks;
  report.cellRuns = brain.stats.runs;
  return { tasks, results, report, brain };
}

export const gridSuite = Object.freeze({
  name: 'grid',
  doc: 'ARC-style grid tasks: a hidden composition of one to three grid cell primitives, recovered from three demonstrations and executed through real cells on a held-out input',
  generate: generateGrids, solve: solveGrids, grade: gradeGrids, run: runGrids,
});
