// cells/simulate.mjs : the cells of planning, decision, the global workspace and attention.
// Importing this module registers the kinds. Params stay serializable: a planning cell
// carries the NAME of a world (simulate/world.mjs), never a closure, so it survives a
// snapshot and a restore like any other cell.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { plan } from '../simulate/planner.mjs';
import { simulateCandidates } from '../simulate/simulator.mjs';
import { getWorld } from '../simulate/world.mjs';

const ANY = ['hv', 'sdr', 'num', 'sym', 'vec', 'event'];
const last = (m) => (m.length ? m[m.length - 1].sig : null);
// A planner must never clone the planner. Cloning itself would plan about planning, forever.
const NEVER_CLONE = ['simulate.plan', 'simulate.counterfactual'];
const light = (c) => (c ? { id: c.id, actions: c.actions, score: c.score, uncertainty: c.uncertainty, decision: c.decision, state: c.state } : null);

// ---------------------------------------------------------------- planning
defineKind('simulate.plan', {
  doc: 'Goal event in, ranked plan event out. Clones the world subgraph, rolls k candidate action sequences forward under a tick budget, ranks them by score minus lambda times uncertainty.',
  ports: { in: [{ name: 'goal', kinds: ['event'] }, { name: 'actions', kinds: ['event'] }], out: [{ name: 'plan', kinds: ['event'] }] },
  defaults: { world: null, horizon: 4, budgetTicks: 256, lambda: 0.5, seeds: [0], width: 8, rounds: 2, keep: 4, seed: 'plan' },
  cost: 8,
  init: () => ({ goal: null, actions: null, state0: undefined, plans: 0, lastTicks: 0 }),
  compute: (ins, cell, ctx) => {
    const st = cell.state, p = cell.params;
    const a = last(ins[1]);
    if (a && Array.isArray(a.data.actions)) st.actions = a.data.actions;
    const g = last(ins[0]);
    if (!g) return [null];
    if (g.data.goal !== undefined) st.goal = g.data.goal;
    if (g.data.state !== undefined) st.state0 = g.data.state;
    if (!p.world || !ctx.brain) return [null];
    const world = getWorld(p.world);
    const res = plan(ctx.brain, {
      world, horizon: p.horizon, budgetTicks: p.budgetTicks, lambda: p.lambda,
      seeds: p.seeds, width: p.width, rounds: p.rounds,
      actions: st.actions ?? world.actions, goal: st.goal, state0: st.state0,
      seed: p.seed + ':' + cell.id + ':' + st.plans,
      cloneOpts: { excludeKinds: NEVER_CLONE },
    });
    st.plans++; st.lastTicks = res.ticksUsed;
    cell.stats.surprise = res.best ? Math.min(1, res.best.uncertainty) : 0;
    return [{ kind: 'event', data: {
      goal: st.goal, best: light(res.best), ranked: res.ranked.slice(0, p.keep).map(light),
      ticksUsed: res.ticksUsed, budgetTicks: res.budgetTicks, evaluated: res.evaluated,
      rounds: res.rounds, truncated: res.truncated, lambda: res.lambda, horizon: res.horizon,
    } }];
  },
  serialize: (s) => ({ goal: s.goal, actions: s.actions, state0: s.state0, plans: s.plans, lastTicks: s.lastTicks }),
});

// ---------------------------------------------------------------- decision
defineKind('decide.argmax', {
  doc: 'Candidate events in, one chosen event out. Ranks by score minus lambda times uncertainty over a window of ticks; an event carrying a ranked array contributes all of its entries.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'choice', kinds: ['event'] }] },
  defaults: { lambda: 0, field: 'score', uncertaintyField: 'uncertainty', window: 1 },
  init: () => ({ ring: [], chosen: 0 }),
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    const fresh = [];
    for (const it of ins[0]) {
      const d = it.sig.data;
      const list = Array.isArray(d.ranked) ? d.ranked : Array.isArray(d.candidates) ? d.candidates : [d];
      for (const c of list) if (c && typeof c[p.field] === 'number') fresh.push(c);
    }
    if (!fresh.length) return [null];
    st.ring.push(fresh);
    while (st.ring.length > Math.max(1, p.window)) st.ring.shift();
    const pool = st.ring.flat();
    let best = null, bd = -Infinity;
    for (const c of pool) {
      const d = c[p.field] - p.lambda * (c[p.uncertaintyField] ?? 0);
      if (d > bd || (d === bd && String(c.id ?? '') < String(best?.id ?? ''))) { bd = d; best = c; }
    }
    if (!best) return [null];
    st.chosen++;
    return [{ kind: 'event', data: { ...best, decision: bd, chosen: st.chosen, considered: pool.length } }];
  },
  serialize: (s) => ({ ring: s.ring, chosen: s.chosen }),
});

// ---------------------------------------------------------------- global workspace
defineKind('workspace.submit', {
  doc: 'Puts whatever it receives onto its region bus with a salience, competing for the global broadcast. Emits nothing: the bus is the only channel.',
  ports: { in: [{ name: 'in', kinds: ANY }], out: [] },
  defaults: { salience: 1, field: 'salience' },
  init: () => ({ submitted: 0 }),
  compute: (ins, cell, ctx) => {
    const r = ctx.brain?.regions.get(cell.region);
    if (!r) return [];
    for (const it of ins[0]) {
      const sig = it.sig;
      let sal = cell.params.salience;
      if (sig.kind === 'event' && typeof sig.data?.[cell.params.field] === 'number') sal = sig.data[cell.params.field];
      r.bus.push({ t: ctx.t, cell: cell.id, idx: cell.idx, salience: sal, kind: sig.kind, data: sig.data, hash: hashSafe(sig) });
      cell.state.submitted++;
    }
    return [];
  },
  serialize: (s) => ({ submitted: s.submitted }),
});

defineKind('workspace.hub', {
  doc: 'Receives the global broadcast and re-emits the most salient winner. The manager injects winners in salience order, so the first item in the mailbox is the top of the broadcast.',
  ports: { in: [{ name: 'broadcast', kinds: ANY }], out: [{ name: 'out', kinds: ANY }] },
  defaults: { keep: 32 },
  init: () => ({ received: 0, broadcasts: 0, lastKind: null }),
  compute: (ins, cell, ctx) => {
    const m = ins[0];
    if (!m.length) return [null];
    cell.state.received += m.length;
    cell.state.broadcasts++;
    const top = m[0].sig;
    cell.state.lastKind = top.kind;
    cell.memory.working.push({ t: ctx.t, kind: top.kind, hash: hashSafe(top), n: m.length });
    while (cell.memory.working.length > cell.params.keep) cell.memory.working.shift();
    return [{ kind: top.kind, data: top.data }];
  },
  serialize: (s) => ({ received: s.received, broadcasts: s.broadcasts, lastKind: s.lastKind }),
});

// ---------------------------------------------------------------- attention
defineKind('attention.goal', {
  doc: 'Holds the current goal hypervector and emits it. Attention scores every arriving hv against this. A signal on set replaces the goal.',
  ports: { in: [{ name: 'set', kinds: ['hv'] }], out: [{ name: 'goal', kinds: ['hv'] }] },
  defaults: { label: 'goal', emit: true },
  init: (p) => ({ hv: S.hvFromSeed(p.label), changes: 0 }),
  compute: (ins, cell) => {
    const s = last(ins[0]);
    // the goal is held for as long as nothing replaces it, which is past the tick it arrived
    // on, so the state takes its own copy and the payload goes back to the heap with the mail
    if (s) { cell.state.hv = S.hvCopy(s.data); cell.state.changes++; }
    return [cell.params.emit ? { kind: 'hv', data: cell.state.hv } : null];
  },
  serialize: (s) => ({ hv: S.dataToJSON('hv', s.hv), changes: s.changes }),
  deserialize: (j) => ({ hv: S.dataFromJSON('hv', j.hv), changes: j.changes ?? 0 }),
});

// ---------------------------------------------------------------- counterfactual
defineKind('simulate.counterfactual', {
  doc: 'What would have happened under a different action. Takes an episode { actions, at, alt }, rolls the factual and the altered sequence through two clones of the same state, and emits both outcomes and the difference.',
  ports: { in: [{ name: 'episode', kinds: ['event'] }], out: [{ name: 'answer', kinds: ['event'] }] },
  defaults: { world: null, horizon: 0, seeds: [0], lambda: 0 },
  cost: 6,
  init: () => ({ asked: 0 }),
  compute: (ins, cell, ctx) => {
    const p = cell.params, e = last(ins[0]);
    if (!e || !p.world || !ctx.brain) return [null];
    const d = e.data;
    const actions = Array.isArray(d.actions) ? d.actions.slice() : [];
    if (!actions.length) return [null];
    const at = Number.isInteger(d.at) ? d.at : actions.length - 1;
    if (at < 0 || at >= actions.length || d.alt === undefined) return [null];
    const alt = actions.slice();
    alt[at] = d.alt;
    const horizon = p.horizon > 0 ? p.horizon : actions.length;
    const res = simulateCandidates(ctx.brain, {
      world: p.world, horizon, seeds: p.seeds, lambda: p.lambda,
      goal: d.goal, state0: d.state,
      candidates: [{ id: 'factual', actions }, { id: 'counterfactual', actions: alt }],
      cloneOpts: { excludeKinds: NEVER_CLONE },
    });
    const f = res.ranked.find(r => r.id === 'factual'), c = res.ranked.find(r => r.id === 'counterfactual');
    cell.state.asked++;
    return [{ kind: 'event', data: {
      at, was: actions[at], alt: d.alt, horizon,
      factual: light(f), counterfactual: light(c),
      delta: (c?.score ?? 0) - (f?.score ?? 0),
      better: (c?.score ?? 0) > (f?.score ?? 0),
      ticks: res.ticks, asked: cell.state.asked,
    } }];
  },
  serialize: (s) => ({ asked: s.asked }),
});

function hashSafe(sig) { try { return S.hashSignal(sig); } catch { return '?'; } }
