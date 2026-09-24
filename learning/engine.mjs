// learning/engine.mjs : the driver. attach(brain, config) puts exactly ONE function on
// brain.hooks.afterTick and exactly ONE listener on brain.ledger, and detach() takes both
// back off. Those two are the only integration points; nothing in this directory edits
// core.
//
// What the engine owns, and what every rule reads instead of recomputing it:
//   firedNow    the cells that emitted on this tick (diffed from cell.stats.fired)
//   fireT[i]    the tick a cell last emitted, which is the t stamp its signals carry
//   pre(i, t)   a decaying activity trace, evaluated lazily so the cost is per fired cell
//   z[e]        eligibility traces, also lazy, also per active edge
//   reward      per region, drained from learn.reward ledger events
//   gain        per region, from learn.modulator ledger events
//   surprise    per cell, written by the predictive rule
//
// Cost: the engine counts every rule application and every microsecond it spends, against
// a per tick budget. Over budget, the remaining rules stop for this tick and a learn.budget
// event goes in the ledger. printEvery > 0 prints the measured line.
import { getRule, ruleNames, namesRule } from './registry.mjs';

export const DEFAULT_ORDER = Object.freeze(['predictive', 'hebbian', 'delta', 'reinforcement', 'homeostatic', 'structural']);

export const DEFAULTS = Object.freeze({
  rules: null,          // names to run brain wide. null: only rules a cell policy names
  order: DEFAULT_ORDER, // the order they run in each tick
  budget: 50000,        // rule applications per tick
  printEvery: 0,        // print the measured cost line every N ticks, 0 for never
  print: null,          // a function taking one line, or null for console.log
  traceDecay: 0.8,      // per tick decay of the pre activity trace
  warn: true,           // warn when a cell policy collides with the core built in hebbian
});

export class LearningEngine {
  constructor(brain, config = {}) {
    this.brain = brain;
    this.ledger = brain.ledger;
    this.config = { ...DEFAULTS, ...config };
    this.rules = [];
    for (const name of this.config.order) {
      if (!ruleNames().includes(name)) continue;
      const rule = getRule(name);
      if (this._enabled(name)) this.rules.push(rule);
    }
    this.states = new Map();
    this.cfgs = new Map();
    for (const r of this.rules) {
      this.cfgs.set(r.name, Object.freeze({ ...r.defaults, ...(this.config[r.name] || {}) }));
      this.states.set(r.name, r.init ? r.init(this, this.cfgs.get(r.name)) : {});
    }

    const n = Math.max(16, brain.cells.length);
    this.nCells = n;
    this.prevFired = new Float64Array(n);
    this.fireT = new Float64Array(n).fill(-1);
    this.preTrace = new Float32Array(n);
    this.traceT = new Float64Array(n);
    this.lrScale = new Float32Array(n).fill(1);
    this.surprise = new Float32Array(n);
    this.firedNow = new Set();
    this.seen = new Set();
    this.targets = new Map();

    this.z = new Map();      // edge -> eligibility
    this.zT = new Map();     // edge -> tick of the last eligibility write
    this.rewards = new Map();// region -> reward accumulated since the last drain
    this.gains = new Map();  // region -> modulator gain
    this.errors = new Map(); // circuit key -> last aggregated error

    this.cost = { ticks: 0, applied: 0, skipped: 0, overBudget: 0, ns: 0, maxNs: 0, byRule: new Map() };
    this.tickApplied = 0;
    this._hook = null;
    this._off = null;
    this.attached = false;
  }

  _enabled(name) {
    if (Array.isArray(this.config.rules) && this.config.rules.includes(name)) return true;
    if (this.config[name] && this.config[name].enabled === true) return true;
    for (const c of this.brain.cells) if (namesRule(c, name)) return true;
    return false;
  }

  // ------------------------------------------------------------ attach and detach
  _attach() {
    if (this.attached) return this;
    const b = this.brain;
    const s = stackFor(b);
    s.list.push(this);
    b.ctx.learning = this;
    this._hook = (brain, t) => this._tick(t);
    b.hooks.afterTick.push(this._hook);
    this._off = b.ledger.on((ev) => this._onLedger(ev));
    this._sync();
    for (let i = 0; i < b.cells.length; i++) this.prevFired[i] = b.cells[i].stats.fired;
    if (this.config.warn) {
      const collide = b.cells.filter(c => c.policy.learn === 'hebbian').map(c => c.id);
      if (collide.length) this._print('[learning] ' + collide.length + ' cell(s) set policy.learn = "hebbian" as a plain string: core/brain.mjs runs its own edge update for those too. Use ["hebbian"] to leave the update to this engine. cells: ' + collide.join(', '));
    }
    b.ledger.append({ type: 'learn.attach', t: b.clock.t, gen: b.clock.gen, rules: this.rules.map(r => r.name), budget: this.config.budget });
    this.attached = true;
    return this;
  }

  detach() {
    if (!this.attached) return this;
    const b = this.brain;
    const i = b.hooks.afterTick.indexOf(this._hook);
    if (i >= 0) b.hooks.afterTick.splice(i, 1);
    if (this._off) this._off();
    // ctx.learning always names an engine that is still attached, whatever order the
    // engines were detached in, and goes back to what it was when the last one leaves.
    const s = stackFor(b);
    const j = s.list.indexOf(this);
    if (j >= 0) s.list.splice(j, 1);
    if (s.list.length) b.ctx.learning = s.list[s.list.length - 1];
    else if (s.had) b.ctx.learning = s.prev;
    else delete b.ctx.learning;
    b.ledger.append({ type: 'learn.detach', t: b.clock.t, gen: b.clock.gen, ticks: this.cost.ticks, applied: this.cost.applied });
    this._hook = null; this._off = null; this.attached = false;
    return this;
  }

  // ------------------------------------------------------------ per tick
  _tick(t) {
    const started = process.hrtime.bigint();
    this.tickApplied = 0;
    this._sync();
    this._sample(t);
    const ctx = this.brain.ctx;
    for (const rule of this.rules) {
      if (!rule.tick) continue;
      this.seen.clear();
      const before = this.tickApplied;
      const t0 = process.hrtime.bigint();
      rule.tick(this, ctx);
      const ns = Number(process.hrtime.bigint() - t0);
      const rec = this.cost.byRule.get(rule.name) || { applied: 0, ns: 0 };
      rec.applied += this.tickApplied - before; rec.ns += ns;
      this.cost.byRule.set(rule.name, rec);
      if (this.tickApplied >= this.config.budget) break;
    }
    const ns = Number(process.hrtime.bigint() - started);
    this.cost.ticks++;
    this.cost.ns += ns;
    if (ns > this.cost.maxNs) this.cost.maxNs = ns;
    if (this.tickApplied >= this.config.budget) {
      this.cost.overBudget++;
      this.ledger.append({ type: 'learn.budget', t, gen: this.brain.clock.gen, applied: this.tickApplied, budget: this.config.budget });
    }
    if (this.config.printEvery && this.cost.ticks % this.config.printEvery === 0) this.printBudget();
  }

  _sync() {
    const n = this.brain.cells.length;
    if (n <= this.nCells) return;
    const cap = Math.max(n, this.nCells * 2);
    const grow = (Ctor, old, fill) => { const a = new Ctor(cap); if (fill !== undefined) a.fill(fill); a.set(old); return a; };
    this.prevFired = grow(Float64Array, this.prevFired);
    const ft = new Float64Array(cap).fill(-1); ft.set(this.fireT); this.fireT = ft;
    this.preTrace = grow(Float32Array, this.preTrace);
    this.traceT = grow(Float64Array, this.traceT);
    const ls = new Float32Array(cap).fill(1); ls.set(this.lrScale); this.lrScale = ls;
    this.surprise = grow(Float32Array, this.surprise);
    this.nCells = cap;
    this.targets.clear();
  }

  // Which cells fired on this tick. cell.stats.fired is incremented by core/cell.mjs
  // runCell exactly when a cell emitted, so the diff is exact and costs one pass.
  _sample(t) {
    this.firedNow.clear();
    const cells = this.brain.cells;
    for (let i = 0; i < cells.length; i++) {
      const f = cells[i].stats.fired;
      if (f <= this.prevFired[i]) continue;
      this.prevFired[i] = f;
      this.firedNow.add(i);
      this.preTrace[i] = this.pre(i, t) + 1;
      this.traceT[i] = t;
      this.fireT[i] = t;
    }
  }

  _onLedger(ev) {
    switch (ev.type) {
      case 'learn.reward': {
        const r = this.rewards.get(ev.region) || 0;
        this.rewards.set(ev.region, r + ev.value);
        break;
      }
      case 'learn.modulator': this.gains.set(ev.region, ev.gain); break;
      case 'learn.error': this.errors.set(ev.circuit, { error: ev.error, n: ev.n, t: ev.t }); break;
      default: break;
    }
  }

  // ------------------------------------------------------------ what rules read
  cfg(name) { return this.cfgs.get(name) || getRule(name).defaults; }
  st(name) { let s = this.states.get(name); if (!s) { s = {}; this.states.set(name, s); } return s; }

  pre(i, t) {
    const v = this.preTrace[i];
    if (v === 0) return 0;
    const age = t - this.traceT[i];
    if (age <= 0) return v;
    return v * Math.pow(this.config.traceDecay, age);
  }

  // When a signal emitted at tPre reaches the far end of edge e. core/brain.mjs _emit
  // schedules delivery at clock.t + 1 + delay: a signal takes at least one tick to travel
  // because the bucket for the current tick was already drained. Every ordering judgment
  // in this directory goes through this one function so a change in core is one edit here.
  travel(e) { return 1 + this.brain.connectome.delay[e]; }
  arrival(e, tPre) { return tPre + this.travel(e); }

  setScale(i, s) { this.lrScale[i] = s; }
  gainForCell(i) {
    const cell = this.brain.cells[i];
    const region = this.gains.has(cell.region) ? this.gains.get(cell.region) : (this.gains.get('*') ?? 1);
    return this.lrScale[i] * region;
  }
  gainFor(region) { return this.gains.has(region) ? this.gains.get(region) : (this.gains.get('*') ?? 1); }
  errorFor(circuitKey) { return this.errors.get(circuitKey) ?? null; }

  // Eligibility traces, decayed lazily: a trace is only touched when its edge is active
  // or when a reward reads it, so an idle connectome costs nothing.
  eligibility(e, t, cfg) {
    const z = this.z.get(e);
    if (z === undefined) return 0;
    const age = t - (this.zT.get(e) ?? t);
    if (age <= 0) return z;
    return z * Math.pow(cfg.gamma * cfg.lambda, age);
  }
  bumpEligibility(e, t, amount, cfg) {
    const z = this.eligibility(e, t, cfg) + amount;
    this.z.set(e, z); this.zT.set(e, t);
    return z;
  }
  // Every trace still above the floor, decayed to t. Drops the rest as it goes.
  *eligibleEdges(t, cfg) {
    for (const [e] of this.z) {
      const z = this.eligibility(e, t, cfg);
      if (Math.abs(z) < cfg.floor) { this.z.delete(e); this.zT.delete(e); continue; }
      yield [e, z];
    }
  }
  resetTraces() {
    this.z.clear(); this.zT.clear();
    this.preTrace.fill(0); this.traceT.fill(0);
    return this;
  }
  takeRewards() {
    if (this.rewards.size === 0) return EMPTY_REWARDS;
    const out = [...this.rewards];
    this.rewards.clear();
    return out;
  }

  // The cells a rule owns: named by a cell policy, listed in config.<rule>.cells,
  // or every cell in config.<rule>.region / circuit when the rule runs brain wide.
  targetSet(name) {
    const cached = this.targets.get(name);
    if (cached && cached.n === this.brain.cells.length) return cached.set;
    const cfg = this.cfg(name);
    const global = Array.isArray(this.config.rules) && this.config.rules.includes(name);
    const set = new Set();
    let explicit = null;
    if (cfg.cells) { explicit = new Set(); for (const id of cfg.cells) explicit.add(this.brain.cell(id).idx); }
    for (const c of this.brain.cells) {
      if (explicit) { if (explicit.has(c.idx)) set.add(c.idx); continue; }
      if (cfg.region && c.region !== cfg.region) continue;
      if (cfg.circuit && c.circuit !== cfg.circuit) continue;
      if (global || namesRule(c, name)) set.add(c.idx);
    }
    this.targets.set(name, { n: this.brain.cells.length, set });
    return set;
  }

  spend(n = 1) {
    if (this.tickApplied + n > this.config.budget) { this.cost.skipped += n; return false; }
    this.tickApplied += n;
    this.cost.applied += n;
    return true;
  }

  // ------------------------------------------------------------ reporting
  report() {
    const c = this.cost, ticks = Math.max(1, c.ticks);
    return {
      attached: this.attached,
      rules: this.rules.map(r => r.name),
      ticks: c.ticks,
      applied: c.applied,
      appliedPerTick: c.applied / ticks,
      skipped: c.skipped,
      overBudget: c.overBudget,
      budget: this.config.budget,
      usPerTick: c.ns / ticks / 1000,
      maxUs: c.maxNs / 1000,
      byRule: Object.fromEntries([...c.byRule].map(([k, v]) => [k, { applied: v.applied, usPerTick: v.ns / ticks / 1000 }])),
    };
  }
  budgetLine() {
    const r = this.report();
    return '[learning] t=' + this.brain.clock.t + ' rules=' + r.rules.join(',') +
      ' applied/tick=' + r.appliedPerTick.toFixed(2) +
      ' us/tick=' + r.usPerTick.toFixed(2) +
      ' max=' + r.maxUs.toFixed(2) + 'us' +
      ' budget=' + r.budget + ' skipped=' + r.skipped + ' overBudget=' + r.overBudget;
  }
  printBudget() { this._print(this.budgetLine()); return this; }
  _print(line) { const out = typeof this.config.print === 'function' ? this.config.print : (this.config.print === false ? null : console.log); if (out) out(line); }
}

const EMPTY_REWARDS = Object.freeze([]);

// Which engines are attached to which brain, so that ctx.learning is correct no matter how
// many are attached and in what order they leave. A WeakMap keeps this out of the Brain.
const ATTACHED = new WeakMap();
function stackFor(brain) {
  let s = ATTACHED.get(brain);
  if (!s) { s = { had: 'learning' in brain.ctx, prev: brain.ctx.learning, list: [] }; ATTACHED.set(brain, s); }
  return s;
}
export function enginesOn(brain) { return [...stackFor(brain).list]; }

export function attach(brain, config = {}) {
  if (!brain || !brain.hooks || !Array.isArray(brain.hooks.afterTick)) throw new Error('attach: needs a Brain with hooks.afterTick');
  return new LearningEngine(brain, config)._attach();
}
export function detach(engine) {
  if (!engine) return null;
  if (engine.detach) return engine.detach();
  throw new Error('detach: pass the engine attach() returned');
}
