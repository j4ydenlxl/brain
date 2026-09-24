// self/observe.mjs: THE BRAIN LOOKS AT ITSELF. A region of the organism whose input is the
// organism. It reads what the running system already records (ledger counts, per cell run
// and error counters, connectome usage and staleness, gate decisions, the task suites) and
// folds them into ONE finite self model plus a `sym` signal the rest of self/ can reason
// over with core/primitives.evalSym.
//
// Three rules this file obeys and the tests enforce:
//   1. FINITE. Every number in the model passes Number.isFinite. A brain that has never
//      ticked reports zeros, never NaN from a 0/0 rate (notes/self.md request 1).
//   2. TOTAL. Every region of the brain appears, including regions with no runs. A self
//      model that only names the busy regions is a model of the busy half of the brain,
//      and the improver would never propose anything for the silent half.
//   3. READ ONLY. observe() never writes to the brain. It may append ONE ledger event
//      (the observation) so that a later change can be traced back to what motivated it.
import { evalSym } from '../core/primitives.mjs';
import { S, ratToNumber, ratToString } from '../core/signal.mjs';
import { ACTIVE, PRUNED, DORMANT } from '../core/connectome.mjs';

export const SELF_OBSERVE = 'self.observe';

// ---------------------------------------------------------------- finite arithmetic
// A rate whose denominator is zero is zero, not NaN. Every number that reaches the model,
// the sym expression or the ledger passes through here.
export function finite(x, fallback = 0) { return Number.isFinite(x) ? x : fallback; }
export function rate(num, den) { return den > 0 ? finite(num / den) : 0; }
export function round(x, places = 6) {
  const f = 10 ** places;
  return finite(Math.round(finite(x) * f) / f);
}
// A decimal string core/signal.ratFromDecimal accepts, for any finite JS number.
export function decimal(x) {
  const v = finite(x);
  if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
  const s = v.toFixed(9).replace(/0+$/, '').replace(/\.$/, '');
  return s === '' || s === '-' ? '0' : s;
}

// ---------------------------------------------------------------- measurement
// The scalar panel of a brain: the numbers a trial compares between a treated clone and
// its matched control. Every one of these is a counter the core already keeps, so a
// measurement costs one pass over cells and one over edges, never a second simulation.
export const METRICS = Object.freeze([
  'ticks', 'runs', 'runsPerTick', 'fired', 'firedRate', 'signals', 'delivered',
  'refused', 'refusedRate', 'errors', 'errorRate', 'surprise', 'activeCells',
  'activeCellRate', 'idleCells', 'edges', 'liveEdges', 'staleEdges', 'staleRate',
  'usedEdges', 'usedEdgeRate', 'grown', 'pruned', 'cells',
]);

export function measure(brain, { staleTicks = 64 } = {}) {
  const t = brain.clock.t;
  const st = brain.stats;
  let surprise = 0, surpriseN = 0, active = 0, fired = 0, errors = 0;
  for (const c of brain.cells) {
    if (c.stats.runs > 0) active++;
    fired += c.stats.fired;
    errors += c.stats.errors;
    if (Number.isFinite(c.stats.surprise)) { surprise += c.stats.surprise; surpriseN++; }
  }
  const cx = brain.connectome;
  let live = 0, stale = 0, used = 0;
  for (let e = 0; e < cx.size(); e++) {
    if (cx.flags[e] & PRUNED) continue;
    if (cx.flags[e] & ACTIVE) live++;
    if (cx.usage[e] > 0) used++;
    else if (t - (cx.lastT[e] < 0 ? 0 : cx.lastT[e]) >= staleTicks) stale++;
  }
  const edges = cx.size();
  const m = {
    ticks: st.ticks, runs: st.runs, runsPerTick: rate(st.runs, st.ticks),
    fired, firedRate: rate(fired, st.runs), signals: st.signals, delivered: st.delivered,
    refused: st.refused, refusedRate: rate(st.refused, st.signals),
    errors: st.errors + 0, errorRate: rate(st.errors, st.runs),
    surprise: rate(surprise, surpriseN),
    activeCells: active, activeCellRate: rate(active, brain.cells.length),
    idleCells: brain.cells.length - active,
    edges, liveEdges: live, staleEdges: stale, staleRate: rate(stale, edges),
    usedEdges: used, usedEdgeRate: rate(used, edges),
    grown: st.grown, pruned: st.pruned, cells: brain.cells.length,
  };
  for (const k of METRICS) m[k] = finite(m[k]);
  return m;
}

// Per region measurement. Every region of the brain is named, in the brain's own order.
export function measureRegions(brain, { staleTicks = 64 } = {}) {
  const t = brain.clock.t;
  const out = {};
  for (const [name, r] of brain.regions) {
    out[name] = {
      cells: r.cells.size, circuits: r.circuits.size,
      budget: Number.isFinite(r.budget) ? r.budget : -1,
      runs: 0, fired: 0, errors: 0, skips: 0, surprise: 0, active: 0, idle: 0,
      edgesOut: 0, edgesIn: 0, staleEdges: 0, periods: 0, kinds: {},
    };
  }
  const cx = brain.connectome;
  for (const c of brain.cells) {
    const r = out[c.region];
    if (!r) continue;
    r.runs += c.stats.runs; r.fired += c.stats.fired; r.errors += c.stats.errors; r.skips += c.stats.skips;
    if (Number.isFinite(c.stats.surprise)) r.surprise += c.stats.surprise;
    if (c.stats.runs > 0) r.active++; else r.idle++;
    r.periods += c.policy.period === 'event' ? 0 : c.policy.period;
    r.kinds[c.kind] = (r.kinds[c.kind] || 0) + 1;
    for (const e of cx.outOf(c.idx)) {
      if (cx.flags[e] & PRUNED) continue;
      r.edgesOut++;
      if (cx.usage[e] === 0 && t - (cx.lastT[e] < 0 ? 0 : cx.lastT[e]) >= staleTicks) r.staleEdges++;
    }
    for (const e of cx.into(c.idx)) { if (!(cx.flags[e] & PRUNED)) r.edgesIn++; }
  }
  for (const name of Object.keys(out)) {
    const r = out[name];
    r.surprise = round(rate(r.surprise, r.cells));
    r.runsPerCell = round(rate(r.runs, r.cells));
    r.firedRate = round(rate(r.fired, r.runs));
    r.errorRate = round(rate(r.errors, r.runs));
    r.idleRate = round(rate(r.idle, r.cells));
    r.staleRate = round(rate(r.staleEdges, r.edgesOut));
    r.meanPeriod = round(rate(r.periods, r.cells));
    r.kindCount = Object.keys(r.kinds).length;
    for (const k of Object.keys(r)) if (typeof r[k] === 'number') r[k] = finite(r[k]);
  }
  return out;
}

// ---------------------------------------------------------------- task suites
// The yardstick, optional because it costs real time. suites: [{ name, fraction }] or
// ['algebra'], or { name, run } for a suite that does not live in tasks/: `run({ seed })`
// returns { n, correct, accuracy, ms } and may be asynchronous. That third form is what lets
// the loop score something the organism DOES (act/region.mjs askSuite asks the exact items
// through the ask region) rather than only what tasks/ can generate. Never throws into the
// loop: a suite that fails is reported as an error string with a null score, which the
// improver reads as "no evidence", not as "zero".
export async function measureSuites(suites, { seed = 'self' } = {}) {
  const out = {};
  if (!suites || suites.length === 0) return out;
  const tasks = await import('../tasks/index.mjs');
  const COUNTS = {
    algebra: tasks.ALGEBRA_COUNTS, sequence: tasks.SEQUENCE_COUNTS, grid: tasks.GRID_COUNTS,
  };
  for (const entry of suites) {
    const name = typeof entry === 'string' ? entry : entry.name;
    const fraction = typeof entry === 'string' ? 0.1 : (entry.fraction ?? 0.1);
    if (entry && typeof entry.run === 'function') {
      try {
        const r = await entry.run({ seed: name + '/' + seed });
        const n = Number(r && r.n) || 0;
        const correct = Number(r && r.correct) || 0;
        // accuracy comes from the suite when it gives one, and from its own two counts when
        // it does not: a suite that answered nothing has no accuracy, which is not zero
        const acc = r && Number.isFinite(r.accuracy) ? r.accuracy : (n > 0 ? correct / n : null);
        out[name] = { n, correct, accuracy: acc === null ? null : round(acc), ms: finite(r && r.ms), error: null };
      } catch (err) {
        out[name] = { n: 0, correct: 0, accuracy: null, ms: 0, error: String((err && err.message) || err) };
      }
      continue;
    }
    try {
      const suite = tasks.getSuite(name);
      const base = COUNTS[name] || null;
      const counts = base ? Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.max(1, Math.round(v * fraction))])) : undefined;
      const { report } = suite.run(counts ? { counts, seed: name + '/' + seed } : { seed: name + '/' + seed });
      out[name] = { n: report.n, correct: report.correct, accuracy: round(report.accuracy), ms: finite(report.ms), error: null };
    } catch (err) {
      out[name] = { n: 0, correct: 0, accuracy: null, ms: 0, error: String((err && err.message) || err) };
    }
  }
  return out;
}

// ---------------------------------------------------------------- the self model
/**
 * Read the brain into a self model. Read only: the brain is not modified, except for one
 * optional ledger event so later changes can be traced back here.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object} [opts]
 * @param {boolean} [opts.log] append the observation to the ledger (default true)
 * @param {number} [opts.staleTicks] ticks without traffic before an edge counts stale
 * @param {object} [opts.suites] task suite scores measured earlier (measureSuites)
 * @returns {object} the self model, every number finite, every region named
 */
export function observe(brain, { log = true, staleTicks = 64, suites = null } = {}) {
  const metrics = measure(brain, { staleTicks });
  const regions = measureRegions(brain, { staleTicks });
  const ledger = brain.ledger ? brain.ledger.summary() : {};
  const model = {
    kind: SELF_OBSERVE,
    name: brain.name,
    t: brain.clock.t, gen: brain.clock.gen,
    metrics,
    regions,
    regionNames: [...brain.regions.keys()],
    ledger: { seq: brain.ledger ? brain.ledger.seq : 0, counts: ledger },
    gate: { ...brain.gate.stats, pending: brain.gate.listPending().length },
    scheduler: { ...brain.scheduler.stats, skipRate: round(rate(brain.scheduler.stats.skipped, brain.scheduler.stats.funded + brain.scheduler.stats.skipped)) },
    lastError: brain.lastError ? { cell: brain.lastError.cell, t: brain.lastError.t, error: String(brain.lastError.error).slice(0, 200) } : null,
    suites: suites || null,
    seq: -1,
  };
  model.health = health(model);
  model.sym = selfSym(model);
  model.symText = symLines(model.sym).join('\n');
  if (log && brain.ledgerLevel !== 'off') {
    model.seq = brain.log({
      type: SELF_OBSERVE,
      t: brain.clock.t,
      cells: metrics.cells, edges: metrics.edges,
      runs: metrics.runs, runsPerTick: round(metrics.runsPerTick),
      errors: metrics.errors, refused: metrics.refused,
      idleCells: metrics.idleCells, staleEdges: metrics.staleEdges,
      surprise: round(metrics.surprise), health: round(model.health),
      regions: Object.fromEntries(Object.entries(regions).map(([n, r]) => [n, { cells: r.cells, runs: r.runs, idle: r.idle, errors: r.errors }])),
    });
  }
  return model;
}

// One scalar the daemon prints before and after: what fraction of the organism is doing
// work that is not an error and not refused. 1 is perfect, 0 is a dead or broken brain.
// It is deliberately a RATE, not a total: a bigger brain does not score higher for being
// bigger (memory: a rate that rises when the window shrinks is not a rate).
export function health(model) {
  const m = model.metrics ? model.metrics : model;
  const clean = 1 - Math.min(1, m.errorRate + m.refusedRate);
  return round(finite(0.5 * m.activeCellRate + 0.3 * clean + 0.2 * m.usedEdgeRate));
}

// ---------------------------------------------------------------- the sym signal
// The model as an expression in the brain's own symbolic language, so a hypothesis about
// the brain can be written in the same language as a hypothesis about a number, and
// graded by the same evaluator. Shape:
//
//   let self.runsPerTick = <num> in let self.idleRate = <num> in ... in <health>
//
// evalSym on the whole expression returns the health number; evalSym on any subexpression
// with the same env returns that measurement.
export function selfSym(model) {
  const bindings = [];
  const m = model.metrics;
  for (const k of METRICS) bindings.push(['self.' + k, decimal(m[k])]);
  for (const [name, r] of Object.entries(model.regions)) {
    bindings.push(['region.' + name + '.runsPerCell', decimal(r.runsPerCell)]);
    bindings.push(['region.' + name + '.idleRate', decimal(r.idleRate)]);
    bindings.push(['region.' + name + '.errorRate', decimal(r.errorRate)]);
    bindings.push(['region.' + name + '.staleRate', decimal(r.staleRate)]);
    bindings.push(['region.' + name + '.surprise', decimal(r.surprise)]);
  }
  if (model.suites) for (const [name, s] of Object.entries(model.suites)) {
    if (s && s.accuracy !== null) bindings.push(['suite.' + name + '.accuracy', decimal(s.accuracy)]);
  }
  let body = S.num(decimal(model.health === undefined ? 0 : model.health));
  for (let i = bindings.length - 1; i >= 0; i--) body = S.let(bindings[i][0], S.num(bindings[i][1]), body);
  return body;
}

// The environment a hypothesis is graded in: every binding of the sym signal, flattened.
export function symEnv(sym, extra = {}) {
  const env = {};
  let e = sym;
  while (e && e.op === 'let') { env[e.name] = e.value.op === 'num' ? e.value.value : e.value; e = e.body; }
  return { ...env, ...extra };
}

export function symLines(sym) {
  const out = [];
  let e = sym;
  while (e && e.op === 'let') { out.push('let ' + e.name + ' = ' + ratToString(e.value.value)); e = e.body; }
  out.push('health = ' + (e && e.op === 'num' ? ratToString(e.value) : '?'));
  return out;
}

// Evaluate the model's own expression: proof the sym signal is well formed and that its
// value is the health number the model reports.
export function symValue(sym) { return ratToNumber(evalSym(sym)); }

// ---------------------------------------------------------------- the periodic eye
// Observation every K ticks, as an afterTick hook, so a running organism keeps a current
// self model without anyone asking for one. Returns a detach function.
export function watch(brain, { every = 256, keep = 8, ...opts } = {}) {
  const state = { every, models: [], last: null, count: 0 };
  const fn = (b, t) => {
    if (t % every !== 0) return;
    const model = observe(b, opts);
    state.last = model; state.count++;
    state.models.push(model);
    if (state.models.length > keep) state.models.shift();
  };
  brain.hooks.afterTick.push(fn);
  state.detach = () => {
    const i = brain.hooks.afterTick.indexOf(fn);
    if (i >= 0) brain.hooks.afterTick.splice(i, 1);
  };
  brain.selfWatch = state;
  return state;
}

// A short human line, the one the daemon prints.
export function observeLine(model) {
  const m = model.metrics;
  return `t=${model.t} cells=${m.cells} edges=${m.edges} runs/tick=${round(m.runsPerTick, 3)} idle=${m.idleCells} stale=${m.staleEdges} err=${m.errors} refused=${m.refused} health=${round(model.health, 4)}`;
}

export const UNUSED_FLAGS = Object.freeze({ ACTIVE, DORMANT, PRUNED });
