// simulate/planner.mjs : PLANNING UNDER A TICK BUDGET. Candidate generation is three
// orthogonal moves: enumerate the alphabet exhaustively while it is small, sample it with
// a seeded RNG when it is not, and search locally around whatever is currently best.
// Ranking is score minus lambda times uncertainty, so a brilliant guess with a wide spread
// loses to a good one the predictors agree on.
//
// The budget is in TICKS, not in candidates, because a tick is what a rollout actually
// costs the machine. A round that cannot afford one more rollout does not start one, so
// ticksUsed never exceeds budgetTicks. Thinking is funded the same way cells are.
import { RNG } from '../core/rng.mjs';
import { getWorld } from './world.mjs';
import { simulateCandidates } from './simulator.mjs';

// ---------------------------------------------------------------- candidate generation
// Lexicographic order over the alphabet, capped. 3 actions over horizon 4 is 81 sequences.
export function enumerateCandidates(actions, horizon, cap = 256) {
  const out = [];
  const total = Math.pow(actions.length, horizon);
  const n = Math.min(total, cap);
  for (let i = 0; i < n; i++) {
    const seq = new Array(horizon);
    let x = i;
    for (let p = horizon - 1; p >= 0; p--) { seq[p] = actions[x % actions.length]; x = Math.floor(x / actions.length); }
    out.push({ id: 'e' + i, actions: seq, origin: 'enumerate' });
  }
  return out;
}

export function randomCandidates(actions, horizon, k, rng) {
  const r = rng instanceof RNG ? rng : new RNG(rng ?? 'plan');
  const out = [];
  for (let i = 0; i < k; i++) {
    const seq = new Array(horizon);
    for (let p = 0; p < horizon; p++) seq[p] = actions[r.int(actions.length)];
    out.push({ id: 'r' + i, actions: seq, origin: 'random' });
  }
  return out;
}

// Neighbours of a sequence: change up to `radius` positions to a different action.
export function localSearch(base, actions, k, rng, { radius = 1, tag = 'l' } = {}) {
  const r = rng instanceof RNG ? rng : new RNG(rng ?? 'local');
  const seqBase = (base && base.actions) || base || [];
  const out = [];
  if (!seqBase.length || actions.length < 2) return out;
  for (let i = 0; i < k; i++) {
    const seq = seqBase.slice();
    const flips = 1 + r.int(Math.max(1, radius));
    for (let f = 0; f < flips; f++) {
      const p = r.int(seq.length);
      const alt = actions.filter(a => !same(a, seq[p]));
      if (alt.length) seq[p] = alt[r.int(alt.length)];
    }
    out.push({ id: tag + i, actions: seq, origin: 'local' });
  }
  return out;
}
function same(a, b) { return a === b || (a != null && b != null && JSON.stringify(a) === JSON.stringify(b)); }

export function dedupe(candidates) {
  const seen = new Set(), out = [];
  for (const c of candidates) {
    const k = JSON.stringify(c.actions);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
}

// ---------------------------------------------------------------- the decision
// Ranked by score minus lambda times uncertainty. Ties break on id so the answer is stable.
export function decide(ranked, lambda = 0.5) {
  let best = null;
  for (const c of ranked) {
    const d = c.score - lambda * (c.uncertainty ?? 0);
    if (best === null || d > best.decision || (d === best.decision && String(c.id) < String(best.id))) best = { ...c, decision: d };
  }
  return best;
}

// ---------------------------------------------------------------- plan within a budget
// opts = { world, horizon, budgetTicks, seeds, lambda, actions, mode, width, rounds, radius,
//          goal, state0, seed, uncertaintyFrom }
// mode: 'auto' enumerates when the whole space fits in width, samples otherwise.
export function plan(brain, opts = {}) {
  const world = getWorld(opts.world);
  const actions = opts.actions ?? world.actions ?? [];
  if (!actions.length) throw new Error('plan: the world has no action alphabet');
  const horizon = opts.horizon ?? 4;
  const seeds = opts.seeds ?? [0];
  const lambda = opts.lambda ?? world.lambda ?? 0.5;
  const width = opts.width ?? 8;
  const rounds = opts.rounds ?? 2;
  const radius = opts.radius ?? 1;
  const budgetTicks = opts.budgetTicks ?? Infinity;
  const rng = new RNG(opts.seed ?? ('plan:' + world.name + ':' + horizon));

  const costPer = horizon * seeds.length;
  const merged = new Map();
  let ticksUsed = 0, roundsRun = 0, truncated = false;

  const affordable = () => (budgetTicks === Infinity ? width : Math.floor((budgetTicks - ticksUsed) / costPer));

  const space = Math.pow(actions.length, horizon);
  const mode = opts.mode ?? (space <= width ? 'enumerate' : 'random');
  const key = (c) => JSON.stringify(c.actions);
  const unseen = (c) => !merged.has(key(c));
  let stalled = 0;

  // After the seed round the batch is the neighbourhood of the best so far, topped up with
  // fresh samples. A radius-1 neighbourhood is finite (horizon x (|A| - 1) sequences) and
  // is exhausted in a round or two, so the radius widens and random restarts fill the batch.
  // Without that the search stops improving long before the budget is spent.
  const nextBatch = (round, best) => {
    const r = Math.min(horizon, radius + Math.floor(round / 2));
    const near = localSearch(best, actions, width * 2, rng, { radius: r, tag: 'l' + round + '_' });
    const far = randomCandidates(actions, horizon, width, rng).map((c, i) => ({ ...c, id: 'r' + round + '_' + i }));
    return dedupe([...near, ...far]).filter(unseen);
  };

  let batch = dedupe(mode === 'enumerate' ? enumerateCandidates(actions, horizon, width) : randomCandidates(actions, horizon, width, rng));
  for (let round = 0; round < Math.max(1, rounds); round++) {
    const room = affordable();
    if (room < 1) { truncated = true; break; }
    batch = batch.filter(unseen).slice(0, room);
    if (!batch.length) { stalled++; break; }
    const res = simulateCandidates(brain, {
      world, candidates: batch, horizon, seeds, lambda, goal: opts.goal, state0: opts.state0,
      uncertaintyFrom: opts.uncertaintyFrom, budgetTicks: budgetTicks - ticksUsed, cloneOpts: opts.cloneOpts,
    });
    ticksUsed += res.ticks;
    truncated = truncated || res.truncated;
    for (const c of res.ranked) merged.set(key(c), c);
    roundsRun++;
    batch = nextBatch(round, decide([...merged.values()], lambda));
  }

  const ranked = [...merged.values()].sort((a, b) => (b.decision - a.decision) || (String(a.id) < String(b.id) ? -1 : 1));
  return {
    best: ranked[0] ?? null, ranked, ticksUsed, budgetTicks, costPer, rounds: roundsRun,
    evaluated: ranked.length, truncated, stalled: stalled > 0, lambda, horizon, mode, actions,
  };
}
