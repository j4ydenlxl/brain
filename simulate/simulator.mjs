// simulate/simulator.mjs : INTERNAL SIMULATION. Clone a sub-brain, inject a candidate
// action sequence one action per tick, let the cloned predictor cells say what happens
// next, feed that prediction back in as the next observation, and keep the whole per-tick
// trace. Candidates come back ranked by score minus lambda times uncertainty.
//
// Uncertainty has two honest sources and they are reported separately, never blended:
//   across seeds      variance of the candidate's score over independent perturbed runs
//   across predictors variance of the predictor cells' readings at the same tick
// 'auto' uses seeds when there is more than one seed, predictors otherwise.
//
// Determinism: one seed gives one trace, always. Nothing here calls Math.random.
import { RNG } from '../core/rng.mjs';
import * as S from '../core/signal.mjs';
import { cloneSub } from './clone.mjs';
import { getWorld } from './world.mjs';

// Cell kinds that hold a forward model and can be read as predictors.
export const PREDICTOR_KINDS = new Set(['predict.next', 'vec.mlp']);
export const EVALUATOR_PREFIX = 'evaluate.';

// One number out of any signal, so variance and scores are comparable across kinds.
export function scalarize(kind, data) {
  if (data == null) return 0;
  switch (kind) {
    case 'vec': case 'hv': { let s = 0; for (let i = 0; i < data.length; i++) s += data[i]; return data.length ? s / data.length : 0; }
    case 'sdr': return data.idx.length / Math.max(1, data.n);
    case 'num': {
      if (data.type === 'float') return Number.isFinite(data.x) ? data.x : 0;
      try { return S.ratToNumber(data); } catch { return 0; }
    }
    case 'event': {
      if (typeof data.value === 'number') return data.value;
      if (typeof data.score === 'number') return data.score;
      if (typeof data.sim === 'number') return data.sim;
      if (typeof data.pass === 'boolean') return data.pass ? 1 : 0;
      if (typeof data.cmp === 'number') return data.cmp;
      return 0;
    }
    default: return 0;
  }
}

// What a cell currently believes. predict.next holds its hypothesis and the error of the
// previous one; vec.mlp holds its last forward pass and its last training error.
export function readout(cell) {
  const st = cell.state || {};
  if (cell.kind === 'predict.next') return { kind: st.kind || 'vec', value: st.lastPrediction ?? null, error: st.lastError ?? null };
  if (cell.kind === 'vec.mlp') return { kind: 'vec', value: st.lastY ?? null, error: st.err ?? null };
  if (st.lastPrediction != null) return { kind: st.kind || 'vec', value: st.lastPrediction, error: st.lastError ?? null };
  if (st.lastY != null) return { kind: 'vec', value: st.lastY, error: st.err ?? null };
  if (st.acc != null) return { kind: 'vec', value: st.acc, error: null };
  return null;
}

export function mean(xs) { return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0; }
export function variance(xs) {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return s / xs.length;
}

function asList(v) { return v == null ? [] : (Array.isArray(v) ? v : [v]); }

// ---------------------------------------------------------------- one rollout
// spec = { world, actions | candidate, horizon, seed, goal, state0, cloneOpts }
export function rollout(brain, spec = {}) {
  const world = getWorld(spec.world);
  const candidate = spec.candidate ?? { id: 'c0', actions: asList(spec.actions) };
  const actions = candidate.actions ?? [];
  const horizon = spec.horizon ?? Math.max(1, actions.length);
  const seed = spec.seed ?? 0;
  const goal = spec.goal ?? null;

  const clone = cloneSub(brain, {
    cells: world.cells, region: world.region, circuit: world.circuit,
    exclude: world.exclude, excludeKinds: world.excludeKinds,
    name: brain.name + '.sim', seed: 'sim:' + seed + ':' + candidate.id, ledger: 'off',
    ...(spec.cloneOpts || {}),
  });
  const rng = new RNG('sim:' + seed + ':' + candidate.id);

  const predictorIds = world.predictors ?? clone.cells.filter(c => PREDICTOR_KINDS.has(c.kind)).map(c => c.id);
  const evaluatorIds = world.evaluators ?? clone.cells.filter(c => c.kind.startsWith(EVALUATOR_PREFIX)).map(c => c.id);

  const base = { world, goal, seed, candidate, clone, rng, horizon };
  let state = spec.state0 !== undefined ? spec.state0 : (world.init ? world.init({ ...base, tick: -1, state: null }) : null);

  const trace = [];
  const perTickPredictorSpread = [];
  for (let i = 0; i < horizon; i++) {
    // an action sequence shorter than the horizon holds its last action
    const action = actions.length ? actions[Math.min(i, actions.length - 1)] : null;
    const ctx = { ...base, tick: i, t: clone.clock.t, state, action, trace };
    for (const inj of asList(world.encode(action, ctx))) {
      // delay 0: injected before the tick, so _deliver(t) hands it over inside this tick
      clone.inject(inj.cell, inj.port, { kind: inj.kind, data: inj.data }, { delay: inj.delay ?? 0, w: inj.w ?? 1 });
    }
    clone.tick(1);

    const emitted = clone.takeOutbox().map(s => ({ src: clone.cells[s.src]?.id ?? null, kind: s.kind, value: scalarize(s.kind, s.data) }));
    const predictions = {}, values = [];
    for (const id of predictorIds) {
      const c = clone.byId.get(id);
      if (!c) continue;
      const r = readout(c);
      if (!r || r.value == null) continue;
      const v = scalarize(r.kind, r.value);
      predictions[id] = { value: v, error: r.error, kind: r.kind };
      values.push(v);
    }
    const evaluations = {};
    for (const id of evaluatorIds) {
      const c = clone.byId.get(id);
      if (!c) continue;
      const hit = emitted.filter(e => e.src === id);
      if (hit.length) evaluations[id] = hit[hit.length - 1].value;
      else { const r = readout(c); if (r && r.value != null) evaluations[id] = scalarize(r.kind, r.value); }
    }
    perTickPredictorSpread.push(variance(values));

    let next = world.observe ? world.observe(clone, { ...ctx, emitted, predictions, evaluations }) : (values.length ? values[0] : state);
    if (world.perturb) next = world.perturb(next, rng, ctx);
    state = next;
    trace.push({ tick: i, t: clone.clock.t - 1, action, state, predictions, evaluations, emitted });
  }

  const score = world.score(trace, { ...base, state });
  return {
    id: candidate.id, actions, seed, horizon, score, state, trace,
    ticks: horizon,
    predictorVariance: mean(perTickPredictorSpread),
    predictors: predictorIds, evaluators: evaluatorIds,
    cloneMs: clone.origin.ms, cloneCells: clone.origin.cells, cloneEdges: clone.origin.edges,
  };
}

// ---------------------------------------------------------------- k candidates, ranked
// budgetTicks is hard: a rollout that would cross it is never started, and the result says
// it was truncated. That is the attention economy applied to thinking, not only to cells.
export function simulateCandidates(brain, opts = {}) {
  const world = getWorld(opts.world);
  const candidates = (opts.candidates || []).map((c, i) => (Array.isArray(c) ? { id: 'c' + i, actions: c } : c));
  const seeds = opts.seeds ?? [0];
  const horizon = opts.horizon ?? Math.max(1, ...candidates.map(c => (c.actions || []).length), 1);
  const lambda = opts.lambda ?? world.lambda ?? 0.5;
  const budgetTicks = opts.budgetTicks ?? Infinity;
  const from = opts.uncertaintyFrom ?? 'auto';

  const ranked = [];
  let ticks = 0, truncated = false;
  for (const cand of candidates) {
    const runs = [];
    for (const seed of seeds) {
      if (ticks + horizon > budgetTicks) { truncated = true; break; }
      const r = rollout(brain, { world, candidate: cand, horizon, seed, goal: opts.goal, state0: opts.state0, cloneOpts: opts.cloneOpts });
      ticks += r.ticks;
      runs.push(r);
    }
    if (!runs.length) { truncated = true; break; }
    if (runs.length < seeds.length) truncated = true;
    const scores = runs.map(r => r.score);
    const seedVar = variance(scores);
    const predVar = mean(runs.map(r => r.predictorVariance));
    const uncertainty = from === 'seeds' ? seedVar : from === 'predictors' ? predVar : (runs.length > 1 ? seedVar : predVar);
    const score = mean(scores);
    ranked.push({
      id: cand.id, actions: cand.actions, score, scores, uncertainty,
      uncertaintySeeds: seedVar, uncertaintyPredictors: predVar,
      decision: score - lambda * uncertainty,
      state: runs[0].state, trace: runs[0].trace, runs, ticks: runs.reduce((a, r) => a + r.ticks, 0),
    });
  }
  ranked.sort((a, b) => (b.decision - a.decision) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { ranked, best: ranked[0] ?? null, ticks, truncated, lambda, horizon, seeds: [...seeds], evaluated: ranked.length };
}
