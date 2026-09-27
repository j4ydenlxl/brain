// capability/grid-search.mjs: THE PROGRAM SEARCH OVER capability/grid-dsl.mjs.
//
// Given the train pairs of a grid task and its test inputs, find ONE program (a chain of
// typed primitives, optionally closed by a learned last step) that turns every train input
// into its train output exactly, and run it on the test inputs. The rules, each one a
// refusal:
//
//   1. Uniform cost order. Programs are tried cheapest first (each primitive has a cost in
//      grid-dsl.mjs), up to maxDepth primitives, so the first program found is the cheapest
//      explanation the vocabulary has, not the first one this file happened to list.
//   2. Memoised intermediate grids. A state is the tuple of values a program prefix made for
//      every train AND test input; two prefixes that make the same tuple are one state, kept
//      at the shallower depth. Test inputs ride along so a prefix that breaks on a test input
//      dies before it can win on the train pairs alone.
//   3. Pruned by train pair agreement. If a prefix makes the SAME value for two train inputs
//      whose wanted outputs differ, no continuation can separate them (every primitive and
//      every learner is a function of the value), so the prefix is dropped. Exact, not a
//      heuristic.
//   4. A per task wall clock budget, checked between candidates. The search returns
//      'timeout' when it runs out of clock and 'exhausted' when it runs out of programs.
//   5. The answer is graded by CELLS. The winning program is wired as a chain of grid.dsl
//      cells in a real Brain; every train input is pushed through it into a grid.dsl.match
//      cell that compares with the wanted output, and only when every match cell says equal
//      are the test inputs pushed through the same kind of chain. What the cells emit is the
//      answer. If the cells ever disagreed with the pure functions the candidate is rejected
//      and the search goes on.
//   6. A test output holding a placeholder colour (10 or above) is not an answer. The
//      candidate is rejected and the search goes on.
//   7. When every train pair changes its input, a program that hands a test input back
//      unchanged has not found the task's rule on that input. Rejected, the search goes on.
import { PRIMS, LEARNERS, FALLBACK_LEARNERS, applyStep, hashValue, sameGrid, isAnswerGrid, fromRows, toRows } from './grid-dsl.mjs';
import { Brain } from '../core/brain.mjs';

export const SEARCH_DEFAULTS = Object.freeze({
  budgetMs: 3000,        // wall clock per task
  maxDepth: 4,           // primitives in a program, not counting a learned last step
  slowDepth: 2,          // the deepest prefix the expensive learners are tried on
  maxStates: 200_000,    // states kept for expansion; past it children are still tested, not stored
});

const FAST = LEARNERS.filter((l) => l.name === 'colormap');
const SLOW = LEARNERS.filter((l) => l.name !== 'colormap');
const now = () => performance.now();

function stateKey(vals, type) {
  let a = type === 'grid' ? 17 : type === 'objects' ? 31 : 47, b = 0x2545f491;
  for (const v of vals) {
    const h = hashValue(v);
    a = Math.imul(a ^ (h % 1000000007), 0x01000193) >>> 0;
    b = Math.imul(b ^ Math.floor(h / 1000000007), 0x5bd1e995) >>> 0;
  }
  return a * 2097152 + (b & 0x1fffff);
}

/** A task read from ARC's JSON rows into the DSL's grids. */
export function taskFromArc(json) {
  return {
    train: json.train.map((p) => ({ input: fromRows(p.input), output: fromRows(p.output) })),
    test: json.test.map((p) => ({ input: fromRows(p.input), output: p.output ? fromRows(p.output) : null })),
  };
}

// ---------------------------------------------------------------- the cells
export function buildSearchBrain(name = 'grid.search') {
  return new Brain({ name, ledger: 'runs', pruneEvery: 0, growth: { threshold: Number.MAX_SAFE_INTEGER } });
}

let wireSeq = 0;
/**
 * Wire a program as a chain of grid.dsl cells, push one input through it, and read what the
 * cells emit. With `want`, the chain ends in a grid.dsl.match cell and the result carries
 * the match cell's verdict; without it, the result carries the grid the chain emitted.
 */
export function runInCells(brain, steps, input, want = null) {
  const tag = 'dsl' + (wireSeq++);
  const ids = steps.map((s, i) => {
    const id = tag + '.' + i;
    brain.addCell({ id, kind: 'grid.dsl', region: 'cognitive', circuit: 'grid', params: { op: s.op, learned: s.learned ?? null }, policy: { period: 'event' } });
    if (i > 0) brain.connect(tag + '.' + (i - 1), 'out', id, 'in');
    return id;
  });
  let matchId = null;
  if (want) {
    matchId = tag + '.match';
    brain.addCell({ id: matchId, kind: 'grid.dsl.match', region: 'cognitive', circuit: 'grid', policy: { period: 'event' } });
    if (ids.length) brain.connect(ids[ids.length - 1], 'out', matchId, 'a');
    else brain.inject(matchId, 'a', { kind: 'event', data: input });
    brain.inject(matchId, 'b', { kind: 'event', data: want });
  }
  if (ids.length) brain.inject(ids[0], 'in', { kind: 'event', data: input });
  brain.tick(steps.length + 2);
  const out = brain.takeOutbox();
  if (want) {
    const idx = brain.cell(matchId).idx;
    const sig = out.filter((s) => s.src === idx).pop();
    return { match: sig ? sig.data : null, cells: ids.length + 1 };
  }
  if (!ids.length) return { value: input, cells: 0 };
  const idx = brain.cell(ids[ids.length - 1]).idx;
  const sig = out.filter((s) => s.src === idx).pop();
  return { value: sig ? sig.data : null, cells: ids.length };
}

/** Grade a program on the train pairs through match cells, then answer the tests through cells. */
export function gradeInCells(steps, train, tests, brain = buildSearchBrain()) {
  let cells = 0;
  for (const p of train) {
    const r = runInCells(brain, steps, p.input, p.output);
    cells += r.cells;
    if (!r.match || !r.match.equal) return { ok: false, cells, reason: 'a match cell said a train pair differs' };
  }
  const outputs = [];
  for (const t of tests) {
    const r = runInCells(brain, steps, t);
    cells += r.cells;
    if (!r.value || !isAnswerGrid(r.value)) return { ok: false, cells, reason: 'the cells made no answer grid for a test input' };
    outputs.push(r.value);
  }
  return { ok: true, cells, outputs, runs: brain.stats.runs };
}

// ---------------------------------------------------------------- the search
/**
 * Search the vocabulary for a program that explains every train pair, then answer the tests.
 *
 * Two options Board 11 added, both off by default so a call without them is the search that
 * was measured before:
 *   library   what capability/grid-library.mjs buildSearchLibrary() returns: { vocab, fast, slow,
 *             share }. vocab replaces PRIMS as the words expanded at each state, each word with a
 *             LEARNED cost (the prior from solved training programs), the macros among them; fast
 *             and slow are the learners in the learned order. Uniform cost order is unchanged:
 *             only the costs and the words differ. With share between 0 and 1 the clock is a
 *             PORTFOLIO: the hand ordered search of the base vocabulary runs first for
 *             (1 - share) of the budget, then the learned search for the rest of the SAME budget,
 *             looking for attempts the first phase did not find. Measured on the verdicts: the
 *             hand ordered search finds almost every answer it will ever find early (0 of 71
 *             evaluation solves after 1500 ms), so the tail of its clock is better spent on a
 *             different order than on more of the same one. The second phase is a HANDOFF, not a
 *             restart: it takes over the first phase's seen states and its frontier, re-costs every
 *             queued program under the learned costs, and puts each state the first phase expanded
 *             back in the queue for its MACRO children only. The first phase ends between two
 *             expansions, never inside one, so no state is generated, tested or expanded twice; only
 *             the order changes, and the macros add edges.
 *   attempts  how many different answers to find (ARC grades two tries per test input). After the
 *             first accepted program the search goes on, on the same clock, for a program whose
 *             test outputs differ from every earlier attempt on at least one test input. With 1,
 *             the first accepted program ends the search, as before.
 * @param {{train: {input, output}[], test: {input}[]}} task grids in the DSL's form
 * @param {object} [opts] budgetMs, maxDepth, slowDepth, maxStates, library, attempts
 * @returns {{status: 'found'|'exhausted'|'timeout', steps: object[]|null, names: string[]|null,
 *   depth: number|null, outputs: object[]|null, attempts: object[], firstMs: number|null,
 *   searched: number, states: number, rejected: number, ms: number, cells: number}}
 */
export function searchGrid(task, opts = {}) {
  const o = { ...SEARCH_DEFAULTS, ...opts };
  const lib = o.library || null;
  if (!lib && fallbackOn(o)) return searchWithFallback(task, o);
  if (lib && lib.share > 0 && lib.share < 1) {
    const t0 = now(), end = t0 + o.budgetMs;
    const a = searchCore(task, { ...o, library: null, deadline: t0 + o.budgetMs * (1 - lib.share), hardDeadline: end, t0, keepState: true }, []);
    const handoff = a.handoff;
    delete a.handoff;
    const want = Math.max(1, Math.floor(o.attempts || 1));
    a.attempts.forEach((h) => { h.phase = 'hand'; });
    if (a.attempts.length >= want) return { ...a, phases: { hand: a.ms, learned: 0 } };
    const b = searchCore(task, { ...o, deadline: end, t0 }, a.attempts, handoff);
    delete b.handoff;
    b.attempts.forEach((h) => { if (!h.phase) h.phase = 'learned'; });
    return { ...b, searched: a.searched + b.searched, states: b.states, rejected: a.rejected + b.rejected, cells: a.cells + b.cells, popped: b.popped, poppedHand: a.popped, poppedMacrosOnly: b.poppedMacrosOnly, phases: { hand: a.ms, learned: Math.round((b.ms - a.ms) * 100) / 100 } };
  }
  return searchCore(task, o, []);
}

// ---------------------------------------------------------------- the fallback phase (Board 23, item ladder-arc)
// THE CLOCK, measured: the uniform cost search finds almost every answer it will find early (on
// the TRAINING split, bench/verdicts/grid.json, 8 of 164 programs came after 1500 ms and 1 after
// 2500 ms). So the last `share` of a task's clock goes, when the search has not answered by then,
// to the FALLBACK learners of grid-dsl.mjs (the cell rule), tried on the task's input and then on
// every depth 1 state the search made whose train grids have the train outputs' sizes, cheapest
// first (pairs of descriptions), then on the same states with triples. A fallback answer is taken
// exactly the way the search takes one: every train pair through match cells, the test through
// cells, no placeholder colour, no test input handed back unchanged. When the fallback finds
// nothing and clock is left, the search RESUMES where it stopped (the handoff of the library's
// portfolio: its seen states and its frontier), so the fallback costs the search only the clock
// the fallback used. THE CONTROL: GRID_FIXED_VOCAB=1 in the environment (or opts.fallback false)
// runs the search exactly as it was before this phase existed.
export const FALLBACK_DEFAULTS = Object.freeze({
  share: 0.25,        // the part of the clock kept for the fallback when the search has not answered
  maxPrefixes: 256,   // depth 1 states kept for it
});
/** True when the fallback phase runs: not under the control flag, not switched off by opts. */
export function fallbackOn(o = {}) {
  return o.fallback !== false && process.env.GRID_FIXED_VOCAB !== '1' && FALLBACK_LEARNERS.length > 0;
}
function searchWithFallback(task, o) {
  const t0 = now(), end = t0 + o.budgetMs;
  const share = typeof o.fallbackShare === 'number' ? o.fallbackShare : FALLBACK_DEFAULTS.share;
  const want = Math.max(1, Math.floor(o.attempts || 1));
  const collect = [];
  const a = searchCore(task, { ...o, deadline: t0 + o.budgetMs * (1 - share), hardDeadline: end, t0, keepState: true, collect, maxCollect: o.maxPrefixes ?? FALLBACK_DEFAULTS.maxPrefixes }, []);
  const handoff = a.handoff;
  delete a.handoff;
  a.attempts.forEach((h) => { h.phase = 'search'; });
  if (a.attempts.length >= want) return { ...a, phases: { search: a.ms, fallback: 0, resumed: 0 } };
  const tests = task.test.map((t) => t.input || t);
  const root = { vals: task.train.map((p) => p.input).concat(tests), steps: [], cost: 0 };
  const prefixes = [root].concat(collect.sort((x, y) => x.cost - y.cost));
  const b = searchCore(task, { ...o, deadline: end, hardDeadline: end, t0, fallbackPrefixes: prefixes }, a.attempts);
  delete b.handoff;
  b.attempts.forEach((h) => { if (!h.phase) h.phase = 'fallback'; });
  const tFallback = Math.round((b.ms - a.ms) * 100) / 100;
  const merged = (last, status, resumed) => ({
    ...last, status: last.attempts.length ? 'found' : status,
    searched: a.searched + b.searched + (resumed ? last.searched : 0), rejected: a.rejected + b.rejected + (resumed ? last.rejected : 0),
    cells: a.cells + b.cells + (resumed ? last.cells : 0), states: resumed ? last.states : a.states,
    popped: resumed ? a.popped.map((x, k) => (x || 0) + (last.popped[k] || 0)).concat(last.popped.slice(a.popped.length)) : a.popped, fallbackTried: b.fallbackTried,
    phases: { search: a.ms, fallback: tFallback, resumed: resumed ? Math.round((last.ms - b.ms) * 100) / 100 : 0 },
  });
  if (b.attempts.length >= want || a.status === 'exhausted' || now() >= end) return merged(b, a.status === 'exhausted' ? 'exhausted' : 'timeout', false);
  // the fallback found nothing and clock is left: the search goes on where it stopped
  const c = searchCore(task, { ...o, deadline: end, t0 }, b.attempts, handoff);
  delete c.handoff;
  c.attempts.forEach((h) => { if (!h.phase) h.phase = 'search'; });
  return merged(c, c.status, true);
}

// One search over one vocabulary, until opts.deadline (absolute, performance.now()) or budgetMs.
// earlier: attempts an earlier phase found; they count toward opts.attempts, and a new attempt
// must answer differently from them too. With opts.keepState the result carries a handoff (the
// seen states, the unexpanded frontier, the expanded states), and the phase ends only BETWEEN two
// expansions at opts.deadline (inside one, only opts.hardDeadline, the whole budget, stops it);
// resume, a handoff, continues that search under this call's vocabulary instead of starting over.
function searchCore(task, o, earlier, resume = null) {
  const lib = o.library || null;
  const VOCAB = lib ? lib.vocab : PRIMS;
  const fastL = lib && lib.fast ? lib.fast : FAST;
  const slowL = lib && lib.slow ? lib.slow : SLOW;
  const want = Math.max(1, Math.floor(o.attempts || 1));
  const t0 = typeof o.t0 === 'number' ? o.t0 : now();
  const deadline = typeof o.deadline === 'number' ? o.deadline : t0 + o.budgetMs;
  const hard = typeof o.hardDeadline === 'number' ? o.hardDeadline : deadline; // inside an expansion
  const train = task.train, tests = task.test.map((t) => t.input || t);
  const nTrain = train.length;
  const wanted = train.map((p) => p.output);
  const alwaysChanges = train.every((p) => !sameGrid(p.input, p.output));
  let searched = 0, rejected = 0, stored = 0, cellsUsed = 0;
  const popped = [];      // states expanded at each depth: how far the clock let the search get
  let poppedMacrosOnly = 0; // handed over states expanded again for their macro children only
  const seen = resume ? resume.seen : new Map();
  const expanded = o.keepState ? [] : null;
  const MACRO_VOCAB = VOCAB.filter((p) => p.macro);
  const buckets = [];
  const heads = [];
  let minCost = 0;
  const hits = earlier.slice(); // accepted programs, in the order found: attempt 1, attempt 2, ...

  const finish = (status) => {
    const hit = hits[0] || null;
    return {
      status: hit ? 'found' : status, steps: hit ? hit.steps : null, names: hit ? hit.steps.map((s) => s.op) : null,
      depth: hit ? hit.steps.length : null, outputs: hit ? hit.outputs : null,
      attempts: hits.map((h) => ({ steps: h.steps, names: h.names || h.steps.map((s) => s.op), outputs: h.outputs, ms: h.ms, phase: h.phase })),
      firstMs: hit ? hit.ms : null,
      searched, states: seen.size, rejected, popped, poppedMacrosOnly, ms: Math.round((now() - t0) * 100) / 100, cells: cellsUsed,
      vocabulary: VOCAB.length + LEARNERS.length,
      handoff: o.keepState ? { seen, expanded, frontier: frontier() } : undefined,
    };
  };
  // the queued, unexpanded states in pop order (cheapest bucket first, first in first out)
  const frontier = () => {
    const out = [];
    for (let c = 0; c < buckets.length; c++) { const b = buckets[c]; if (b) for (let i = heads[c]; i < b.length; i++) if (b[i]) out.push(b[i]); }
    return out;
  };

  // A program that fits every train pair in the pure functions still has to fit through cells
  // and still has to make an answer grid for every test input.
  const accept = (steps, testOuts) => {
    if (!testOuts.every((g) => g && isAnswerGrid(g))) { rejected++; return null; }
    if (alwaysChanges && testOuts.some((g, i) => sameGrid(g, tests[i]))) { rejected++; return null; }
    const graded = gradeInCells(steps, train, tests);
    cellsUsed += graded.cells;
    if (!graded.ok) { rejected++; return null; }
    for (let i = 0; i < testOuts.length; i++) if (!sameGrid(graded.outputs[i], testOuts[i])) { rejected++; return null; }
    return { steps, outputs: graded.outputs };
  };
  // Take an accepted program as the next attempt. True when the search has all it wants. A later
  // attempt that answers every test input exactly as an earlier one did is not a new attempt.
  const take = (steps, testOuts) => {
    if (hits.length && hits.some((h) => testOuts.every((g, i) => g && sameGrid(g, h.outputs[i])))) return false;
    const r = accept(steps, testOuts);
    if (!r) return false;
    r.ms = Math.round((now() - t0) * 100) / 100;
    hits.push(r);
    return hits.length >= want;
  };

  const terminals = (state, learners, exact) => {
    if (state.type !== 'grid') return false;
    const tr = state.vals.slice(0, nTrain), te = state.vals.slice(nTrain);
    if (exact) {
      searched++;
      let all = true;
      for (let i = 0; i < nTrain; i++) if (!sameGrid(tr[i], wanted[i])) { all = false; break; }
      if (all && take(state.steps, te)) return true;
    }
    for (const L of learners) {
      if (now() > hard) return false;
      searched++;
      let params = null;
      try { params = L.learn(tr, wanted, te); } catch { params = null; }
      if (!params) continue;
      const step = { op: L.name, learned: params };
      let fits = true;
      for (let i = 0; i < nTrain; i++) { const g = applyStep(step, tr[i]); if (!g || !sameGrid(g, wanted[i])) { fits = false; break; } }
      if (!fits) continue;
      if (take(state.steps.concat([step]), te.map((g) => applyStep(step, g)))) return true;
    }
    return false;
  };

  const conflicts = (vals) => {
    for (let i = 0; i < nTrain; i++) for (let j = i + 1; j < nTrain; j++) {
      if (hashValue(vals[i]) === hashValue(vals[j]) && !sameGrid(wanted[i], wanted[j])) return true;
    }
    return false;
  };

  const push = (s) => {
    if (stored >= o.maxStates) return;
    stored++;
    (buckets[s.cost] || (buckets[s.cost] = [], heads[s.cost] = 0, buckets[s.cost])).push(s);
    if (s.cost < minCost) minCost = s.cost;
  };
  const pop = () => {
    for (let c = minCost; c < buckets.length; c++) {
      const b = buckets[c];
      if (b && heads[c] < b.length) { minCost = c; const s = b[heads[c]]; b[heads[c]++] = null; return s; }
    }
    return null;
  };

  if (o.fallbackPrefixes) {
    // THE FALLBACK PHASE (searchWithFallback): the fallback learners on the given prefixes, pairs of
    // descriptions on every prefix first, then triples on every prefix (input first), until the clock
    // runs out. Measured (Board 26): `node bench/grid.mjs --split training --budget-ms 3000 --workers 4
    // --tag local-training --control bench/verdicts/grid-split-training-control.json` printed
    // "solved 166 of 400 = 41.5 percent, one attempt per task" (bench/verdicts/grid-local-training.json).
    // Its control, run with --fixed-vocab --tag split-training-control (this phase off), printed
    // "solved 144 of 400 = 36 percent"; the other variants tried in Board 23 were not rerun (notes/grid.md).
    let tried = 0;
    const done = (status) => { const r = finish(status); r.fallbackTried = tried; return r; };
    for (const pass of [{ maxK: 2 }, { maxK: 3 }]) {
      for (const pre of o.fallbackPrefixes) {
        const tr = pre.vals.slice(0, nTrain), te = pre.vals.slice(nTrain);
        for (const L of FALLBACK_LEARNERS) {
          if (now() > hard) return done('timeout');
          searched++; tried++;
          let params = null;
          try { params = L.learn(tr, wanted, te, { maxK: pass.maxK, deadline: hard }); } catch { params = null; }
          if (!params) continue;
          const step = { op: L.name, learned: params };
          let fits = true;
          for (let i = 0; i < nTrain; i++) { const g = applyStep(step, tr[i]); if (!g || !sameGrid(g, wanted[i])) { fits = false; break; } }
          if (!fits) continue;
          if (take(pre.steps.concat([step]), te.map((g) => applyStep(step, g)))) return done('found');
        }
      }
    }
    return done('exhausted');
  }
  if (resume) {
    // THE HANDOFF: every handed over state is re-costed under this vocabulary's costs; the
    // frontier keeps its own order within a cost, and, when there are macros, each expanded state
    // comes back for its macro children only.
    const costOf = new Map(VOCAB.map((p) => [p.name, p.cost]));
    const recost = (x) => { let c = 0; for (const st of x.steps) c += costOf.get(st.op) ?? 1; return c; };
    for (const x of resume.frontier) { x.cost = recost(x); push(x); }
    if (MACRO_VOCAB.length) for (const x of resume.expanded) { x.cost = recost(x); x.macrosOnly = true; push(x); }
  } else {
    const root = { vals: train.map((p) => p.input).concat(tests), type: 'grid', steps: [], depth: 0, cost: 0 };
    seen.set(stateKey(root.vals, 'grid'), 0);
    if (terminals(root, fastL.concat(slowL), true)) return finish('found');
    push(root);
  }

  for (;;) {
    if (expanded && now() > deadline) return finish('timeout');
    const s = pop();
    if (!s) return finish('exhausted');
    const onlyMacros = s.macrosOnly === true;
    if (onlyMacros) poppedMacrosOnly++; else popped[s.depth] = (popped[s.depth] || 0) + 1;
    if (!onlyMacros && s.depth > 0 && s.depth <= o.slowDepth && s.type === 'grid') {
      if (terminals(s, slowL, false)) return finish('found');
      if (now() > hard) return finish('timeout');
    }
    for (const p of (onlyMacros ? MACRO_VOCAB : VOCAB)) {
      if (p.from !== s.type) continue;
      if (now() > hard) return finish('timeout');
      const vals = new Array(s.vals.length);
      let bad = false;
      for (let i = 0; i < s.vals.length; i++) {
        let v = null;
        try { v = p.apply(s.vals[i]); } catch { v = null; }
        if (!v) { bad = true; break; }
        vals[i] = v;
      }
      if (bad) continue;
      searched++;
      const depth = s.depth + 1;
      const key = stateKey(vals, p.to);
      const had = seen.get(key);
      if (had !== undefined && had <= depth) continue;
      seen.set(key, depth);
      if (conflicts(vals)) continue;
      const child = { vals, type: p.to, steps: s.steps.concat([{ op: p.name }]), depth, cost: s.cost + p.cost };
      if (child.type === 'grid') {
        if (terminals(child, fastL, true)) return finish('found');
        // the fallback phase's prefixes: depth 1 grids of the train outputs' sizes
        if (o.collect && depth === 1 && o.collect.length < (o.maxCollect || 0) && vals.slice(0, nTrain).every((g, i) => g.w === wanted[i].w && g.h === wanted[i].h)) o.collect.push({ vals, steps: child.steps, cost: child.cost });
      }
      if (depth < o.maxDepth) push(child);
    }
    if (expanded) expanded.push(s);
  }
}

/**
 * One ARC task from its JSON: search, answer through cells, and grade against the test
 * outputs when the JSON carries them. With opts.attempts 1 (the default) ONE attempt per task,
 * as bench/public.mjs takes. With 2, ARC's own rule: each test input is answered by up to two
 * attempts, and the task is solved when every test input has a right answer among its tries.
 * solvedFirst is the first attempt alone, so a two attempt run still prints the one attempt score.
 */
export function solveArcTask(json, opts = {}) {
  const task = taskFromArc(json);
  const r = searchGrid(task, opts);
  const outputs = r.outputs ? r.outputs.map(toRows) : null;
  const tries = r.attempts.map((a) => a.outputs.map(toRows));
  let solved = null, solvedFirst = null, attemptRight = null;
  if (json.test.every((t) => Array.isArray(t.output))) {
    const eq = (g, i) => !!g && JSON.stringify(g) === JSON.stringify(json.test[i].output);
    solvedFirst = !!outputs && json.test.every((t, i) => eq(outputs[i], i));
    solved = tries.length > 0 && json.test.every((t, i) => tries.some((tr) => eq(tr[i], i)));
    attemptRight = tries.map((tr) => json.test.every((t, i) => eq(tr[i], i)));
  }
  return {
    ...r, outputs, solved, solvedFirst, attemptRight,
    attempts: r.attempts.map((a) => (a.phase ? { names: a.names, ms: a.ms, phase: a.phase } : { names: a.names, ms: a.ms })),
    steps: r.steps ? r.steps.map((s) => ({ op: s.op, learned: s.learned ? true : undefined })) : null,
  };
}
