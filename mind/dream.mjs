// mind/dream.mjs: THE IMAGINATION REGION. His words (MANUAL.md section A, 2026-09-23): "It also
// should hallucinate." Section A also asks for "creativity", to "simulate possible futures", and
// for a system that "generates competing hypotheses". This file is that, built on what the
// organism already has, and measured by the ledger it already keeps.
//
// WHAT A DREAM IS. A signal (core/signal.mjs signal('event', ...)) whose data says
// provenance 'dream' and grounded false, and which makes ONE checkable claim about the future:
// "cell C, the next time it runs and consumes anything, will consume a signal whose data hash is
// H". The claim is concrete because the ledger already records, for every run, the seqs of the
// signals the cell consumed, and for every signal the hash of its data (core/brain.mjs _emit).
// So a dream is either grounded later (the observer's next run consumed a signal with that hash:
// the ledger event that matched is named), or falsified (it ran and consumed something else),
// or it expires unobserved. Nothing here needs a model to grade it.
//
// WHERE DREAMS COME FROM. Recombination of what the organism holds, four generators:
//   predict  the prediction loop: a predict.next cell's own history (cells/basic.mjs) run
//            through competing rules (repeat, arithmetic, geometric, second difference, the
//            cell's own last prediction, and a SPLICE that carries the step of a DIFFERENT
//            series onto this one, which is recombination across memories)
//   episode  the episodic tier: the recent values the memory cell stored, the same rules
//            applied to their numeric fields, the claim made about what the memory cell will
//            receive next
//   mind     the cell native language model (mind/model.mjs): the series rendered as text and
//            continued by the model over its numeral tokens, its most probable number the claim
//   hv       hypervector predictions for hv streams: permute, bundle of the last two, bind with a
//            pattern sampled from the semantic tier, and "what followed the nearest episode"
//            read out of the episodic tier
// Every rule for one series is a COMPETING hypothesis: at most one of them can be what the
// observer consumes next, and the score says which one was.
//
// THE CONTROL. For every dream, a matched control claim for the same observer at the same
// moment, its value drawn at random from that observer's own history: a replay of memory, not
// an imagination. Controls are scored on the same ruler and never proposed. A dream grounded
// rate that does not clear the replay rate is not imagination earning its keep.
//
// NOVELTY. A dream is novel when it is absent from memory: its content hypervector (the same
// word encoding act/prompt.mjs encodePrompt uses, so a kept dream is recallable by the ask path)
// sits at a normalized hv distance of at least `novelty` from its nearest neighbour in the
// episodic tier and in the semantic tier (for an hv claim the predicted vector itself is also
// checked there), and the observer has not already consumed that exact value (distance 0).
// Distance is (1 - sim) / 2: 0 identical, about 0.5 unrelated.
//
// THE TASK SCORE. A dream used as a memory item: the suite probe (loadSuiteProbe) asks the
// suite items the exact path gets wrong (the frontier) through the memory path with the dream as
// the only memory item, and counts how many it answers. A dream is USEFUL when it is novel and
// either grounded later or raises that count. Only useful dreams become proposals.
//
// THE GATE. A useful dream is proposed as kind 'dream.keep' (registered below through
// core/gate.mjs registerProposalKind, judged by dreamPolicy) and nothing is ever applied
// without an approved proposal: apply() refuses anything else. An approved dream is appended to
// the episodic tier as a memory item that still says provenance 'dream' and grounded false, with
// the seq of the ledger event that confirmed it. A held proposal (a gate that wants a human) is
// applied only after gate.decide() approves it. Everything else decays and is dropped.
//
// THE PERIOD. The region runs every `every` ticks from an afterTick hook, and only when no ask
// is active (askActive below): mail or inflight signals for the ask region, a caller holding
// brain.ctx.asking, or an act.ask event since the last cycle. A cycle has a wall budget
// (`budgetMs`): past it, no more dreams are made that cycle.
//
//   import { attachDream } from './mind/dream.mjs';
//   const region = attachDream(brain, { every: 64 });   // region.stats, region.detach()
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';
import { registerProposalKind } from '../core/gate.mjs';
import { EpisodicStore } from '../memory/episodic.mjs';
import { getMind, hasMind } from './index.mjs';

export const DREAM_PROVENANCE = 'dream';
export const DREAM_KIND = 'dream.keep';
export const GENERATORS = Object.freeze(['predict', 'episode', 'mind', 'hv']);
export const SUITE_SOURCES = Object.freeze(['algebra', 'sequence', 'grid']);
export const DREAM_DEFAULTS = Object.freeze({
  every: 64,            // ticks between cycles
  horizon: 2,           // a claim is about the observer's horizon-th consuming run after the dream is born
  series: 4,            // series sampled per cycle
  budgetMs: 40,         // wall milliseconds a cycle may spend making dreams, at most
  budgetShare: 0.05,    // and at most this share of the wall time since the last cycle
  budgetFloorMs: 1,     // but always this much, so a brain whose period takes microseconds still dreams
  novelty: 0.25,        // minimum normalized hv distance from memory for a dream to be novel
  decay: 0.5,           // strength multiplier per cycle
  floor: 0.05,          // strength under which a dream is dropped
  maxPool: 512,         // live dreams held at once
  history: 6,           // values per series
  scanBack: 512,        // episodes read back to find the episode series
  quiet: 8,             // unused by the counter check, kept for callers that pass it
  mindTokens: 6,         // numeral tokens the mind generator may write per claim
  seenPerObserver: 256, // consumed hashes remembered per observer, for novelty
  scanBelow: 256,       // episodic tiers this small are scanned exactly for novelty; larger ones use their LSH index
  control: true,
  logEvery: 16,         // cycles between one summary line to opts.log
  seed: 'dream',
});

// ---------------------------------------------------------------- the gate kind
/**
 * The policy that judges a dream.keep proposal. A dream is kept when it is still a dream
 * (provenance 'dream'), novel, and either confirmed by a later observation or raising the suite
 * probe. Everything else is rejected; a gate may still hold the kind for a human.
 * @param {object} p the proposal
 * @returns {'approve'|'reject'}
 */
export function dreamPolicy(p) {
  const ev = (p && p.evidence) || {};
  if (ev.provenance !== DREAM_PROVENANCE || ev.grounded !== false) return 'reject';
  if (ev.novel !== true) return 'reject';
  if (ev.confirmed === true) return 'approve';
  if (typeof ev.suiteGain === 'number' && ev.suiteGain > 0) return 'approve';
  return 'reject';
}
registerProposalKind(DREAM_KIND, { policy: dreamPolicy, slim: (ev) => ev });

// ---------------------------------------------------------------- small helpers
const round = (x, k = 6) => (Number.isFinite(x) ? Math.round(x * 10 ** k) / 10 ** k : null);
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !ArrayBuffer.isView(v);
const NUMERIC = /^-?\d+(?:\.\d+)?(?:\/\d+)?$/;

/** The words of a claim, lower case: observer, kind, then the value's own tokens. */
export function claimWords(observer, kind, value, hash = null) {
  const w = [String(observer).toLowerCase(), String(kind)];
  if (kind === 'num') { const j = S.numToJSON(value); w.push(j.type, numText(value)); }
  else if (kind === 'hv') w.push(String(hash || S.hashData('hv', value)));
  else if (isPlain(value)) for (const k of Object.keys(value).sort()) { w.push(k.toLowerCase(), String(value[k]).toLowerCase()); }
  else w.push(String(value).toLowerCase());
  return w.filter((x) => x.length);
}

/**
 * The content hypervector of a list of words. The same function as act/prompt.mjs
 * encodePrompt (test/dream.test.mjs asserts the two agree lane for lane), repeated here so the
 * daemon's import of this file does not pull act/ in. The word vectors are released after the
 * fold: the hv heap is fixed and shared with the whole organism.
 * @param {string[]} words
 * @returns {Int8Array|null}
 */
export function encodeWords(words) {
  const list = (Array.isArray(words) ? words : []).filter((w) => typeof w === 'string' && w.length);
  if (!list.length) return null;
  const parts = list.map((w) => S.hvFromSeed('word:' + w));
  const out = S.bundle(parts);
  S.releaseAll(parts, out);
  return out;
}

/** Normalized hv distance: 0 identical, about 0.5 unrelated, 1 opposite. */
export const distanceOf = (sim) => round((1 - sim) / 2);

function numText(v) {
  if (!v) return '';
  if (v.type === 'float') return String(v.x);
  return S.ratToString(v);
}
function valueText(kind, v, hash) {
  if (kind === 'num') return numText(v);
  if (kind === 'hv') return 'hv#' + hash;
  if (isPlain(v)) return JSON.stringify(v);
  return String(v);
}
function jsonValue(kind, v) {
  if (kind === 'num') return S.numToJSON(v);
  if (kind === 'hv') return null;
  return v;
}

// A num of the same type as the template, from an exact rational.
function numLike(template, r) {
  if (template.type === 'float') return S.flt(S.ratToNumber(r));
  if (template.type === 'int') return r.d === 1n ? S.int(r.n) : S.rat(r.n, r.d);
  return S.rat(r.n, r.d);
}

// ---------------------------------------------------------------- competing rules on a series
// Each takes exact rationals (oldest first) and returns the next rational, or null.
export const RULES = Object.freeze({
  repeat: (xs) => (xs.length ? xs[xs.length - 1] : null),
  arithmetic: (xs) => {
    if (xs.length < 2) return null;
    const a = xs[xs.length - 2], b = xs[xs.length - 1];
    return S.ratAdd(b, S.ratSub(b, a));
  },
  geometric: (xs) => {
    if (xs.length < 2) return null;
    const a = xs[xs.length - 2], b = xs[xs.length - 1];
    if (a.n === 0n) return null;
    const q = S.ratDiv(b, a);
    if (S.ratEq(q, S.rat(1n))) return null; // the same claim as repeat
    return S.ratMul(b, q);
  },
  order2: (xs) => {
    if (xs.length < 3) return null;
    const [a, b, c] = xs.slice(-3);
    const d1 = S.ratSub(c, b), d0 = S.ratSub(b, a);
    return S.ratAdd(c, S.ratAdd(d1, S.ratSub(d1, d0)));
  },
});

function toRats(kind, values) {
  const out = [];
  for (const v of values) {
    try { out.push(S.toRat(v)); } catch { return null; }
  }
  return out;
}

// The step of another series carried onto this one: recombination across memories.
function splice(xs, other) {
  if (!xs.length || !other || other.length < 2) return null;
  const step = S.ratSub(other[other.length - 1], other[other.length - 2]);
  return S.ratAdd(xs[xs.length - 1], step);
}

// ---------------------------------------------------------------- is an ask active
/**
 * Whether an ask is in flight on this brain right now: the ask region holds mail or has a
 * signal in flight to one of its cells, or a caller holds brain.ctx.asking above zero.
 * @param {object} brain
 * @returns {string|null} the reason, or null when no ask is active
 */
export function askActive(brain) {
  if (brain && brain.ctx && Number(brain.ctx.asking) > 0) return 'ctx.asking';
  const reg = brain && brain.regions && typeof brain.regions.get === 'function' ? brain.regions.get('ask') : null;
  if (!reg || !reg.cells || !reg.cells.size) return null;
  for (const idx of reg.cells) {
    const c = brain.cells[idx];
    if (!c) continue;
    for (const q of c.mailbox) if (q.length) return 'ask mail';
  }
  if (brain.inflight) for (const list of brain.inflight.values()) for (const it of list) if (reg.cells.has(it.dst)) return 'ask inflight';
  return null;
}

// ---------------------------------------------------------------- the region
export class DreamRegion {
  /**
   * @param {object} brain
   * @param {object} [opts] DREAM_DEFAULTS, plus { mind: name|model|null, suite: probe|false,
   *   episodeObserver: cellId, observers: cellIds, log: fn }
   */
  constructor(brain, opts = {}) {
    if (!brain || !brain.ledger || !brain.gate) throw new Error('dream: needs a brain with a ledger and a gate');
    this.brain = brain;
    this.o = { ...DREAM_DEFAULTS, ...Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined)) };
    this.every = Number(this.o.every) || 0;
    // Horizon 1 is the run that consumes what the previous tick already emitted: the first bar
    // run found 74 of 76 groundings matched a signal in flight at birth. Horizon 2 claims a
    // value the organism has not produced yet when the dream is made.
    this.horizon = Math.max(1, Math.floor(Number(this.o.horizon) || 1));
    this.rng = new RNG(String(this.o.seed) + ':' + (brain.name || 'brain'));
    this.log = typeof opts.log === 'function' ? opts.log : null;
    this.cursor = brain.ledger.seq;
    this.n = 0;
    this.pool = new Map();        // id -> dream (live: pending, or resolved and awaiting a verdict)
    this.pending = new Map();     // observer -> [claims awaiting that observer's next run]
    this.seen = new Map();        // observer -> { set: Set<hash>, fifo: hash[] }
    this.candidates = [];         // resolved dreams to judge for a proposal
    this.held = new Map();        // proposal id -> dream, waiting on a human
    this.hook = null;
    this.suite = opts.suite && typeof opts.suite.probe === 'function' ? opts.suite : null;
    this.suiteState = opts.suite === false ? 'off' : (this.suite ? 'ready' : 'none');
    this.suiteReason = null;
    this.askCount = this._askCount();
    this.stats = {
      cycles: 0, skippedForAsk: 0, lastSkip: null, dreams: 0, novel: 0, resolved: 0, grounded: 0, falsified: 0, expired: 0,
      proposed: 0, approved: 0, rejected: 0, held: 0, applied: 0, decayed: 0, suiteProbed: 0, suiteGain: 0,
      control: { made: 0, resolved: 0, grounded: 0, inFlight: 0 }, groundedInFlight: 0,
      byGenerator: Object.fromEntries(GENERATORS.map((g) => [g, { dreams: 0, novel: 0, resolved: 0, grounded: 0, proposed: 0, applied: 0 }])),
      byRule: {}, mindEmpty: 0, mindTokens: 0, mindMs: 0, mindMass: 0, budgetStops: 0,
      observedRuns: 0, missedEvents: 0, ms: 0, msMax: 0, errors: 0, lastError: null,
    };
    this.observers = new Set(Array.isArray(opts.observers) ? opts.observers : []);
    this._findObservers();
  }

  // The prediction cells and the episodic memory cell are the observers dreams are made about.
  _findObservers() {
    this.predictCells = [];
    this.episodeObserver = this.o.episodeObserver || null;
    for (const c of this.brain.cells) {
      if (c.kind === 'predict.next') { this.predictCells.push(c.id); this.observers.add(c.id); }
      else if (!this.episodeObserver && c.kind === 'memory.episodic') this.episodeObserver = c.id;
    }
    if (this.episodeObserver) this.observers.add(this.episodeObserver);
  }

  _askCount() { const c = this.brain.ledger.counts; return c && typeof c.get === 'function' ? (c.get('act.ask') || 0) : 0; }
  _mem() { return this.brain.memory || null; }
  _mind() {
    const m = this.o.mind;
    if (m === null || m === false) return null;
    if (m && typeof m.dist === 'function') return m;
    const name = typeof m === 'string' ? m : (this.brain.whole && this.brain.whole.mind && this.brain.whole.mind.model) || null;
    return name && hasMind(name) ? getMind(name) : null;
  }
  _logEv(ev) { return typeof this.brain.log === 'function' ? this.brain.log(ev) : this.brain.ledger.append(ev); }

  /** Start the periodic cycle from an afterTick hook. @returns {DreamRegion} */
  attach() {
    if (this.hook || !(this.every > 0)) return this;
    this.lastCycleAt = performance.now();
    this.hook = (b, t) => { if (t > 0 && t % this.every === 0) this.cycle(); };
    this.brain.hooks.afterTick.push(this.hook);
    return this;
  }
  /** Stop the periodic cycle. @returns {DreamRegion} */
  detach() {
    if (!this.hook) return this;
    const i = this.brain.hooks.afterTick.indexOf(this.hook);
    if (i >= 0) this.brain.hooks.afterTick.splice(i, 1);
    this.hook = null;
    return this;
  }

  /** Why dreaming should wait this cycle, or null. */
  askReason() {
    const now = this._askCount();
    const changed = now !== this.askCount;
    this.askCount = now;
    if (changed) return 'act.ask since the last cycle';
    return askActive(this.brain);
  }

  // ------------------------------------------------------------ one cycle
  /**
   * Observe the ledger since the last cycle, settle held proposals, and, when no ask is
   * active, judge the resolved dreams, make new ones and decay the rest. Never throws: a
   * failure is counted and the tick goes on.
   * @returns {object} this cycle's counts
   */
  cycle() {
    const t0 = performance.now();
    // the budget is a share of the wall time the organism spent since the last cycle, so the
    // region scales with the organism it runs in and never takes more than that share of it
    const since = this.lastCycleAt != null ? t0 - this.lastCycleAt : Infinity;
    this.budgetNow = Math.max(this.o.budgetFloorMs, Math.min(this.o.budgetMs, this.o.budgetShare > 0 ? this.o.budgetShare * since : Infinity));
    const row = { t: this.brain.clock.t, made: 0, resolved: 0, grounded: 0, proposed: 0, skipped: null, ms: 0 };
    try {
      const r = this.observe();
      row.resolved = r.resolved; row.grounded = r.grounded;
      this._settleHeld();
      const why = this.askReason();
      if (why) { this.stats.skippedForAsk++; this.stats.lastSkip = why; row.skipped = why; }
      else {
        row.proposed = this._judge();
        row.made = this.dream(t0).length;
        this._decay();
      }
    } catch (e) {
      this.stats.errors++; this.stats.lastError = String(e && e.stack || e).split('\n').slice(0, 3).join(' | ');
    }
    row.ms = round(performance.now() - t0, 3); row.budget = round(this.budgetNow, 3);
    this.lastCycleAt = performance.now();
    this.stats.cycles++; this.stats.ms += row.ms; if (row.ms > this.stats.msMax) this.stats.msMax = row.ms;
    this._logEv({ type: 'dream.cycle', ...row, pool: this.pool.size });
    if (this.log && this.o.logEvery > 0 && this.stats.cycles % this.o.logEvery === 0) this.log(this.summaryLine());
    return row;
  }

  /** Observe and judge without making new dreams: the end of a run. */
  flush() {
    const r = this.observe();
    this._settleHeld();
    const proposed = this._judge();
    return { ...r, proposed };
  }

  // ------------------------------------------------------------ observe the ledger
  /**
   * Read every ledger event since the cursor. A cell.run of an observer that consumed at least
   * one signal resolves every claim made about that observer before the run: grounded when one
   * consumed signal carries the claimed hash (the matching signal seq is kept), falsified
   * otherwise. Events that left the ring before they were read are counted, never guessed.
   * @returns {{resolved: number, grounded: number, runs: number}}
   */
  observe() {
    const L = this.brain.ledger, end = L.seq;
    let s = this.cursor;
    const oldest = Math.max(0, end - L.ringSize);
    if (s < oldest) { this.stats.missedEvents += oldest - s; s = oldest; }
    let resolved = 0, grounded = 0, runs = 0;
    for (; s < end; s++) {
      const e = L.ring[s % L.ringSize];
      if (!e || e.seq !== s) { this.stats.missedEvents++; continue; }
      if (e.type !== 'cell.run' || !this.observers.has(e.cell)) continue;
      const consumed = e.consumed || [];
      if (!consumed.length) continue;
      const hashes = new Map();
      for (const cs of consumed) {
        const sig = L.ring[cs % L.ringSize];
        if (sig && sig.seq === cs && sig.type === 'signal' && !hashes.has(sig.hash)) hashes.set(sig.hash, cs);
      }
      if (!hashes.size) continue;
      runs++;
      this._remember(e.cell, hashes.keys());
      const pend = this.pending.get(e.cell);
      if (!pend || !pend.length) continue;
      const keep = [];
      for (const d of pend) {
        if (d.birthSeq >= s) { keep.push(d); continue; }
        d.runsSeen = (d.runsSeen || 0) + 1;
        if (d.runsSeen < d.horizon) { keep.push(d); continue; }
        const m = hashes.get(d.hash);
        if (m !== undefined && m < d.birthSeq) { if (d.control) this.stats.control.inFlight++; else this.stats.groundedInFlight++; }
        this._resolve(d, m !== undefined, m === undefined ? null : m, s, e.t);
        if (!d.control) { resolved++; if (m !== undefined) grounded++; }
      }
      if (keep.length) this.pending.set(e.cell, keep); else this.pending.delete(e.cell);
    }
    this.cursor = end;
    this.stats.observedRuns += runs;
    return { resolved, grounded, runs };
  }

  _remember(observer, hashes) {
    let r = this.seen.get(observer);
    if (!r) this.seen.set(observer, (r = { set: new Set(), fifo: [] }));
    for (const h of hashes) {
      if (r.set.has(h)) continue;
      r.set.add(h); r.fifo.push(h);
      if (r.fifo.length > this.o.seenPerObserver) r.set.delete(r.fifo.shift());
    }
  }

  _resolve(d, ok, matchSeq, runSeq, t) {
    if (d.control) {
      this.stats.control.resolved++; if (ok) this.stats.control.grounded++;
      return;
    }
    d.status = ok ? 'grounded' : 'falsified';
    d.matchSeq = matchSeq; d.runSeq = runSeq; d.resolvedAt = t;
    const g = this.stats.byGenerator[d.generator];
    this.stats.resolved++; g.resolved++;
    const br = this.stats.byRule[d.generator + '/' + d.rules[0]];
    if (br) { br.resolved++; if (ok) br.grounded++; }
    if (ok) { this.stats.grounded++; g.grounded++; } else this.stats.falsified++;
    d.scoreSeq = this._logEv({
      type: 'dream.score', id: d.id, provenance: DREAM_PROVENANCE, grounded: false, confirmed: ok, status: d.status,
      observer: d.observer, hash: d.hash, matchSeq, runSeq, dreamSeq: d.seq,
      novelty: d.novelty.distance, novel: d.novelty.novel, generator: d.generator, rules: d.rules,
    });
    if (ok) this.candidates.push(d);
    else this._drop(d, 'falsified', false);
  }

  // ------------------------------------------------------------ judge, propose, apply
  _judge() {
    let proposed = 0;
    for (const d of this.candidates.splice(0)) {
      if (!this.pool.has(d.id)) continue;
      const suiteGain = this._suiteGain(d);
      d.suiteGain = suiteGain;
      const useful = d.novelty.novel && (d.status === 'grounded' || (typeof suiteGain === 'number' && suiteGain > 0));
      if (!useful) { d.verdict = d.novelty.novel ? 'not useful' : 'not novel'; continue; }
      this.propose(d); proposed++;
    }
    return proposed;
  }

  _suiteGain(d) {
    if (!this.suite) return null;
    try { this.stats.suiteProbed++; const g = this.suite.probe(d); this.stats.suiteGain += g > 0 ? g : 0; return g; }
    catch (e) { this.suiteReason = 'probe: ' + String(e && e.message).split('\n')[0]; return null; }
  }

  /**
   * Propose one dream to the gate as dream.keep. Applied at once when the gate approves, kept
   * waiting when it holds, decayed when it rejects.
   * @param {object} d a dream from the pool
   * @returns {object} the proposal
   */
  propose(d) {
    const p = this.brain.gate.propose({
      kind: DREAM_KIND, by: 'dream',
      what: { id: d.id, text: d.text, words: d.words, observer: d.observer, kind: d.kind, hash: d.hash, value: d.value, generator: d.generator, rules: d.rules },
      why: 'dream ' + d.id + ' (' + d.generator + '/' + d.rules.join('+') + ') was ' + (d.status === 'grounded' ? 'confirmed by ledger event ' + d.matchSeq : 'unconfirmed') + ', novelty ' + d.novelty.distance + (d.suiteGain != null ? ', suite gain ' + d.suiteGain : ''),
      evidence: {
        provenance: DREAM_PROVENANCE, grounded: false, confirmed: d.status === 'grounded', matchSeq: d.matchSeq ?? null,
        novelty: d.novelty.distance, novel: d.novelty.novel, threshold: this.o.novelty, suiteGain: d.suiteGain ?? null,
        dreamSeq: d.seq, scoreSeq: d.scoreSeq ?? null,
      },
    }, { t: this.brain.clock.t, gen: this.brain.clock.gen });
    d.proposal = p;
    this.stats.proposed++; this.stats.byGenerator[d.generator].proposed++;
    if (p.status === 'approved') { this.stats.approved++; this.apply(d, p); }
    else if (p.status === 'rejected') { this.stats.rejected++; d.verdict = 'rejected'; }
    else { this.stats.held++; this.held.set(p.id, d); d.verdict = 'held'; }
    return p;
  }

  _settleHeld() {
    for (const [id, d] of [...this.held]) {
      const p = d.proposal;
      if (!p || p.status === 'pending') continue;
      this.held.delete(id);
      if (p.status === 'approved') { this.stats.approved++; this.apply(d, p); }
      else { this.stats.rejected++; d.verdict = 'rejected'; }
    }
  }

  /**
   * Append an approved dream to the episodic tier. Refuses anything but an approved dream.keep
   * proposal for this very dream: nothing is applied without the gate.
   * @param {object} d the dream
   * @param {object} p its proposal, as the gate returned it
   * @returns {number} the new episode id
   */
  apply(d, p) {
    if (!p || p !== d.proposal || p.kind !== DREAM_KIND || p.status !== 'approved' || !p.what || p.what.id !== d.id) {
      throw new Error('dream: nothing is applied without an approved ' + DREAM_KIND + ' proposal for this dream (got ' + (p ? p.kind + ' ' + p.status : 'none') + ')');
    }
    const mem = this._mem();
    if (!mem || !mem.episodic) throw new Error('dream: no episodic memory to keep ' + d.id + ' in');
    const key = encodeWords(d.words);
    const id = mem.episodic.append({
      key, items: d.words, t: this.brain.clock.t, gen: this.brain.clock.gen,
      value: { text: d.memoryText, origin: DREAM_PROVENANCE, provenance: DREAM_PROVENANCE, grounded: false, confirmedBy: d.matchSeq ?? null, dream: d.id, proposal: p.id },
    });
    S.release(key);
    d.episode = id; d.verdict = 'kept';
    this.stats.applied++; this.stats.byGenerator[d.generator].applied++;
    this._logEv({ type: 'dream.apply', id: d.id, proposal: p.id, episode: id, provenance: DREAM_PROVENANCE, grounded: false, confirmedBy: d.matchSeq ?? null, dreamSeq: d.seq, scoreSeq: d.scoreSeq ?? null, proposalSeq: p.seq ?? null, runSeq: d.runSeq ?? null, text: d.text });
    this.pool.delete(d.id);
    return id;
  }

  // ------------------------------------------------------------ decay
  _decay() {
    for (const d of [...this.pool.values()]) {
      if (d.proposal && d.proposal.status === 'pending') continue; // a human still owes a verdict
      d.strength *= this.o.decay;
      const done = d.status !== 'pending';
      if (done || d.strength < this.o.floor) this._drop(d, done ? (d.verdict || d.status) : 'expired unobserved', true);
    }
    while (this.pool.size > this.o.maxPool) {
      const first = this.pool.values().next().value;
      this._drop(first, 'pool full', true);
    }
  }

  _drop(d, reason, log) {
    if (!this.pool.has(d.id)) return;
    this.pool.delete(d.id);
    if (d.status === 'pending') {
      this.stats.expired++;
      const pend = this.pending.get(d.observer);
      if (pend) { const i = pend.indexOf(d); if (i >= 0) pend.splice(i, 1); }
    }
    this.stats.decayed++;
    if (log) this._logEv({ type: 'dream.decay', id: d.id, reason, status: d.status, strength: round(d.strength, 4) });
  }

  // ------------------------------------------------------------ making dreams
  /**
   * Make one cycle of dreams: sample series from the prediction cells and the episodic tier,
   * run every rule and the mind model over each, and keep each distinct claim as a dream with
   * a matched control. Stops when the cycle's wall budget is spent.
   * @param {number} [started] performance.now() at the start of the cycle
   * @returns {object[]} the dreams made
   */
  dream(started = performance.now()) {
    const series = this._series();
    const made = [];
    const numSeries = series.filter((x) => x.numeric);
    for (const sr of series) {
      if (performance.now() - started > this.budget()) break;
      const claims = sr.numeric ? this._numericClaims(sr, numSeries) : this._hvClaims(sr);
      const byHash = new Map();
      for (const c of claims) {
        const prev = byHash.get(c.hash);
        if (prev) { if (!prev.rules.includes(c.rule)) prev.rules.push(c.rule); continue; }
        byHash.set(c.hash, { ...c, rules: [c.rule] });
      }
      for (const c of byHash.values()) {
        if (performance.now() - started > this.budget()) { this.stats.budgetStops++; break; }
        if (this._alreadyDreamt(sr.observer, c.hash)) continue;
        const d = this._birth(sr, c);
        made.push(d);
        if (this.o.control) this._control(sr, d);
      }
      // the vectors this series made are the region's own; each is returned to the heap once
      for (const c of claims) if (c._release) S.release(c.value);
    }
    return made;
  }

  budget() { return Number.isFinite(this.budgetNow) ? this.budgetNow : this.o.budgetMs; }

  _alreadyDreamt(observer, hash) {
    const pend = this.pending.get(observer);
    return !!(pend && pend.some((d) => !d.control && d.hash === hash));
  }

  // The series this cycle dreams about: every prediction cell with a history of two or more,
  // and the episodic tier's most recent value shape, shuffled and cut to o.series.
  _series() {
    const out = [];
    for (const id of this.predictCells) {
      const c = this.brain.cell(id);
      const st = c && c.state;
      if (!st || !Array.isArray(st.history) || st.history.length < 2) continue;
      if (st.kind === 'num') {
        const vals = st.history.slice(-this.o.history);
        const xs = toRats('num', vals);
        if (xs) out.push({ generator: 'predict', observer: id, kind: 'num', numeric: true, template: vals[vals.length - 1], values: vals, xs, cell: c, parts: [{ tier: 'prediction', cell: id, history: vals.length }] });
      } else if (st.kind === 'hv') {
        out.push({ generator: 'hv', observer: id, kind: 'hv', numeric: false, values: st.history.slice(-this.o.history), cell: c, parts: [{ tier: 'prediction', cell: id, history: Math.min(st.history.length, this.o.history) }] });
      }
    }
    const ep = this._episodeSeries();
    if (ep) out.push(ep);
    this.rng.shuffle(out);
    return out.slice(0, Math.max(1, this.o.series));
  }

  // The latest plain event value shape in the episodic tier, its distinct values oldest first,
  // and the numeric fields that vary across them.
  _episodeSeries() {
    const mem = this._mem();
    if (!this.episodeObserver || !mem || !mem.episodic || !mem.episodic.size()) return null;
    const E = mem.episodic, n = E.size();
    let shape = null; const vals = [], ids = [];
    let last = null;
    for (let i = n - 1; i >= 0 && i >= n - this.o.scanBack && vals.length < this.o.history; i--) {
      const v = E.values[i];
      if (!isPlain(v) || v.origin === DREAM_PROVENANCE) continue;
      const keys = Object.keys(v).sort();
      if (!keys.length || keys.some((k) => v[k] !== null && typeof v[k] === 'object')) continue;
      const sh = keys.map((k) => k + ':' + typeof v[k]).join(',');
      if (shape === null) shape = sh; else if (sh !== shape) continue;
      const j = JSON.stringify(keys.map((k) => v[k]));
      if (j === last) continue;
      last = j; vals.unshift(v); ids.unshift(i);
    }
    if (vals.length < 2) return null;
    const keys = Object.keys(vals[0]).sort();
    const fields = keys.filter((k) => {
      const col = vals.map((v) => v[k]);
      const numeric = col.every((x) => typeof x === 'number' ? Number.isFinite(x) : (typeof x === 'string' && NUMERIC.test(x)));
      return numeric && new Set(col.map(String)).size > 1;
    });
    if (!fields.length) return null;
    const cols = {};
    for (const k of fields) cols[k] = vals.map((v) => S.ratFromDecimal(String(v[k])));
    return { generator: 'episode', observer: this.episodeObserver, kind: 'event', numeric: true, template: vals[vals.length - 1], values: vals, fields, cols, xs: cols[fields[0]], parts: [{ tier: 'episodic', ids: ids.slice(-4) }] };
  }

  // Every rule over a numeric series, the splice from another series, and the mind model.
  _numericClaims(sr, all) {
    const out = [];
    const others = all.filter((x) => x !== sr);
    const other = others.length ? this.rng.pick(others) : null;
    // a rule applied horizon times: its own prediction appended and predicted from again
    const H = this.horizon;
    const ahead = (rule, xs) => { const ys = xs.slice(); let r = null; for (let i = 0; i < H; i++) { r = rule(ys); if (!r) return null; ys.push(r); } return r; };
    const next = (rule) => {
      if (sr.kind === 'num') return ahead(rule, sr.xs);
      const v = { ...sr.template };
      for (const k of sr.fields) {
        const r = ahead(rule, sr.cols[k]);
        if (!r) return null;
        v[k] = typeof sr.template[k] === 'string' ? S.ratToString(r) : S.ratToNumber(r);
      }
      return v;
    };
    const make = (rule, gen, value, extraParts = []) => {
      if (value === null || value === undefined) return;
      const data = sr.kind === 'num' ? numLike(sr.template, value) : value;
      out.push({ rule, generator: gen, value: data, hash: S.hashData(sr.kind, data), parts: [...sr.parts, ...extraParts] });
    };
    for (const [name, fn] of Object.entries(RULES)) {
      const v = next(fn);
      if (v !== null) make(name, sr.generator, sr.kind === 'num' ? v : v);
    }
    // the prediction cell's own guess, which the organism already made
    if (sr.cell && sr.cell.state && sr.cell.state.lastPrediction && sr.kind === 'num') {
      try { make('cell', sr.generator, S.toRat(sr.cell.state.lastPrediction)); } catch { /* not a num */ }
    }
    // the splice: this series' last value plus the other series' last step
    if (other) {
      const ox = other.xs;
      const v = next((xs) => splice(xs, ox));
      if (v) make('splice', sr.generator, v, [{ tier: 'splice', from: other.observer, generator: other.generator }]);
    }
    // the mind model continues a num series written out as text, horizon numbers ahead
    const v = sr.kind === 'num' && this._mind() ? ahead((ys) => this._mindNext(ys), sr.xs) : null;
    if (v) make('continue', 'mind', v, [{ tier: 'mind', model: this._mindName() }]);
    return out;
  }

  _mindName() {
    const m = this.o.mind;
    if (typeof m === 'string') return m;
    return (this.brain.whole && this.brain.whole.mind && this.brain.whole.mind.model) || (m && m.name) || 'model';
  }

  // The cell native language model continues the series written out as text. Free sampling
  // (mind/generate.mjs) wrote no number in 25 of 25 tries on the 12 major organism, so the
  // continuation is decoded over the numeral tokens only: at each step the model's own
  // distribution, restricted to tokens that are digits (or a leading minus, or a terminator once
  // a digit is written), and its most probable token taken. The claim is the model's most
  // probable NUMBER after the prompt; stats.mindMass is the probability mass the model itself
  // put on the tokens it chose, so a guess the model barely believed is visible as one.
  _mindClasses(model) {
    if (this._mc && this._mc.model === model) return this._mc;
    const voc = model.tok.vocab, digit = [], sign = [], term = [];
    const isD = (b) => (b >= 48 && b <= 57) || b === 46 || b === 47;
    for (let id = 0; id < voc.length; id++) {
      const bs = voc[id];
      if (!bs || !bs.length) continue;
      if (bs.every(isD)) digit.push(id);
      else if (bs[0] === 45 && bs.length > 1 && bs.slice(1).every(isD)) sign.push(id);
      else if (bs[0] === 44 || bs[0] === 32 || bs[0] === 10 || bs[0] === 59) term.push(id);
    }
    return (this._mc = { model, digit, sign, term });
  }
  _mindNext(xs) {
    const model = this._mind();
    if (!model || !model.tok || typeof model.dist !== 'function') return null;
    const t0 = performance.now();
    const prompt = xs.map((x) => S.ratToString(x)).join(', ') + ', ';
    let text = '';
    try {
      const cls = this._mindClasses(model);
      const ids = Array.from(model.tok.encode(Buffer.from(prompt, 'utf8')));
      for (let k = 0; k < this.o.mindTokens; k++) {
        const p = model.dist(Int32Array.from(ids), ids.length);
        const pool = text ? [cls.digit, cls.term] : [cls.digit, cls.sign];
        let best = -1, bp = -1;
        for (const list of pool) for (const id of list) if (p[id] > bp) { bp = p[id]; best = id; }
        if (best < 0) break;
        this.stats.mindTokens++; this.stats.mindMass += bp;
        if (text && cls.term.includes(best)) break;
        ids.push(best);
        text += Buffer.from(model.tok.vocab[best]).toString('latin1');
      }
    } catch (e) { this.stats.mindEmpty++; this.stats.mindMs += performance.now() - t0; return null; }
    this.stats.mindMs += performance.now() - t0;
    const m = /-?\d+(?:\/\d+|\.\d+)?/.exec(text);
    if (!m) { this.stats.mindEmpty++; return null; }
    try { return S.ratFromDecimal(m[0]); } catch { this.stats.mindEmpty++; return null; }
  }

  // Hypervector predictions: permute, bundle of the last two, bind with a semantic pattern,
  // and what followed the nearest episode.
  _hvClaims(sr) {
    const out = [], made = [];
    const h = sr.values, last = h[h.length - 1], prev = h.length > 1 ? h[h.length - 2] : null;
    const push = (rule, v, parts = []) => { if (!v) return; out.push({ rule, generator: 'hv', value: v, hash: S.hashData('hv', v), parts: [...sr.parts, ...parts] }); };
    const H = this.horizon;
    push('repeat', last);
    const p = S.permute(last, H); made.push(p); push('permute', p);
    if (prev) {
      // the bundle rule run horizon times; every intermediate vector goes back to the heap
      let a = last, b = prev, v = null;
      for (let i = 0; i < H; i++) { const nv = S.bundle([a, b]); if (b !== prev && b !== last) S.release(b); b = a; a = nv; v = nv; }
      if (b !== prev && b !== last && b !== v) S.release(b);
      made.push(v); push('bundle', v);
    }
    const mem = this._mem();
    const sem = mem && mem.semantic;
    if (sem && sem.patterns && sem.patterns.length) {
      const slot = this.rng.int(sem.patterns.length);
      const b = S.bind(last, sem.patterns[slot]); made.push(b); push('bind.semantic', b, [{ tier: 'semantic', slot }]);
    }
    const E = mem && mem.episodic;
    if (E && E.size() > 1) {
      const r = E.retrieve(last, { k: 1 });
      if (r.length && r[0].id + H < E.size()) push('episodic.next', E.keyAt(r[0].id + H).slice(), [{ tier: 'episodic', id: r[0].id, sim: round(r[0].sim, 4) }]);
    }
    // the claims keep their hash; their vectors are needed only for novelty, at birth
    for (const c of out) c._release = made.includes(c.value);
    return out;
  }

  // ------------------------------------------------------------ birth, novelty, control
  _birth(sr, c) {
    const id = 'd' + (++this.n);
    const words = claimWords(sr.observer, sr.kind, c.value, c.hash);
    const novelty = this.novelty(words, { observer: sr.observer, hash: c.hash, hv: sr.kind === 'hv' ? c.value : null });
    const vText = valueText(sr.kind, c.value, c.hash);
    const when = this.horizon === 1 ? ' will next consume ' : ' will consume, ' + this.horizon + ' runs from now, ';
    const text = sr.observer + when + sr.kind + ' ' + vText + ' (' + c.generator + '/' + c.rules.join('+') + ')';
    const value = jsonValue(sr.kind, c.value);
    const data = {
      provenance: DREAM_PROVENANCE, grounded: false, id, generator: c.generator, rules: [...c.rules],
      claim: { observer: sr.observer, kind: sr.kind, hash: c.hash, value, horizon: this.horizon }, text, parts: c.parts,
    };
    const sig = S.signal('event', data, { t: this.brain.clock.t, gen: this.brain.clock.gen, src: -1, port: 0 });
    const seq = this._logEv({ type: 'dream', ...data, novelty: novelty.distance, novel: novelty.novel, nearest: novelty.nearest });
    sig.seq = seq;
    const d = {
      id, seq, birthSeq: seq, horizon: this.horizon, runsSeen: 0, t: this.brain.clock.t, generator: c.generator, rules: c.rules, observer: sr.observer, kind: sr.kind,
      hash: c.hash, value, words, text, memoryText: 'dream ' + id + ': ' + sr.observer + (this.horizon === 1 ? ' next consumes ' : ' consumes, ' + this.horizon + ' runs on, ') + sr.kind + ' ' + vText + ' => ' + vText,
      parts: c.parts, signal: sig, novelty, status: 'pending', strength: 1, matchSeq: null, proposal: null, control: false,
    };
    this.pool.set(id, d);
    const pend = this.pending.get(sr.observer) || [];
    pend.push(d); this.pending.set(sr.observer, pend);
    this.stats.dreams++;
    const g = this.stats.byGenerator[c.generator]; g.dreams++;
    const rk = c.generator + '/' + c.rules[0];
    const br = this.stats.byRule[rk] || (this.stats.byRule[rk] = { dreams: 0, novel: 0, resolved: 0, grounded: 0 });
    br.dreams++;
    if (novelty.novel) { this.stats.novel++; g.novel++; br.novel++; }
    return d;
  }

  _control(sr, d) {
    const pick = sr.values[this.rng.int(sr.values.length)];
    const data = sr.kind === 'num' ? pick : (sr.kind === 'hv' ? pick : pick);
    const hash = S.hashData(sr.kind, data);
    const ctl = { id: d.id + ':control', control: true, observer: sr.observer, hash, birthSeq: d.birthSeq, horizon: d.horizon, runsSeen: 0 };
    const pend = this.pending.get(sr.observer);
    pend.push(ctl);
    this.stats.control.made++;
  }

  /**
   * How far a claim sits from what memory already holds. The nearest neighbour of its content
   * vector in the episodic tier (the tier's own index) and in the semantic tier (one scan of
   * the patterns), for an hv claim the same for the predicted vector, and distance 0 when the
   * observer already consumed that exact value.
   * @param {string[]} words the claim's words
   * @param {object} [opts] { observer, hash, hv }
   * @returns {{distance: number, novel: boolean, nearest: string|null, episodic: number|null, semantic: number|null, seen: boolean}}
   */
  novelty(words, { observer = null, hash = null, hv = null } = {}) {
    const mem = this._mem();
    let best = -1, nearest = null, ep = null, se = null;
    const probe = (v, label) => {
      if (!v || !mem) return;
      if (mem.episodic && mem.episodic.size()) {
        const r = mem.episodic.retrieve(v, { k: 1, scan: mem.episodic.size() <= this.o.scanBelow });
        if (r.length) { ep = Math.max(ep ?? -1, r[0].sim); if (r[0].sim > best) { best = r[0].sim; nearest = label + ' episodic#' + r[0].id; } }
      }
      const sem = mem.semantic;
      if (sem && sem.patterns && sem.patterns.length) {
        const sims = typeof sem._sims === 'function' ? sem._sims(v) : null;
        if (sims) {
          let m = -1, at = -1;
          for (let i = 0; i < sims.length; i++) if (sims[i] > m) { m = sims[i]; at = i; }
          se = Math.max(se ?? -1, m);
          if (m > best) { best = m; nearest = label + ' semantic#' + at; }
        }
      }
    };
    const content = encodeWords(words);
    probe(content, 'content');
    if (content) S.release(content);
    if (hv) probe(hv, 'vector');
    const r = observer ? this.seen.get(observer) : null;
    const seen = !!(r && hash && r.set.has(hash));
    let distance = best > -1 ? distanceOf(best) : 0.5;
    if (seen) { distance = 0; nearest = 'already consumed by ' + observer; }
    return { distance, novel: distance >= this.o.novelty, nearest, episodic: ep === null ? null : round(ep, 4), semantic: se === null ? null : round(se, 4), seen };
  }

  // ------------------------------------------------------------ reporting
  /** Everything the region counted, with the fractions and their numerators. */
  report() {
    const st = this.stats;
    const frac = (a, b) => (b > 0 ? round(a / b) : null);
    return {
      every: this.every, horizon: this.horizon, cycles: st.cycles, skippedForAsk: st.skippedForAsk,
      dreams: st.dreams, novel: st.novel, noveltyFraction: frac(st.novel, st.dreams), noveltyThreshold: this.o.novelty,
      resolved: st.resolved, grounded: st.grounded, groundedInFlight: st.groundedInFlight, falsified: st.falsified, expired: st.expired, pending: [...this.pool.values()].filter((d) => d.status === 'pending').length,
      groundedLaterFraction: frac(st.grounded, st.resolved),
      control: { ...st.control, fraction: frac(st.control.grounded, st.control.resolved) },
      proposals: { submitted: st.proposed, approved: st.approved, rejected: st.rejected, held: st.held, applied: st.applied },
      decayed: st.decayed, suite: { state: this.suiteState, reason: this.suiteReason, probed: st.suiteProbed, gain: st.suiteGain, frontier: this.suite ? this.suite.frontier.length : null, items: this.suite ? this.suite.items : null },
      byGenerator: st.byGenerator, byRule: st.byRule,
      mind: { tokens: st.mindTokens, ms: round(st.mindMs, 3), empty: st.mindEmpty, meanTokenMass: st.mindTokens ? round(st.mindMass / st.mindTokens) : null, model: this._mind() ? this._mindName() : null },
      budgetStops: st.budgetStops, budgetMs: this.o.budgetMs, budgetShare: this.o.budgetShare,
      ms: round(st.ms, 3), msMax: st.msMax, observedRuns: st.observedRuns, missedEvents: st.missedEvents, errors: st.errors, lastError: st.lastError,
      observers: [...this.observers],
    };
  }

  summaryLine() {
    const r = this.report();
    return 'cycle ' + r.cycles + ' t=' + this.brain.clock.t + ': dreams ' + r.dreams + ', novel ' + r.novel + ', grounded ' + r.grounded + ' of ' + r.resolved
      + ' resolved (control ' + r.control.grounded + ' of ' + r.control.resolved + '), proposals ' + r.proposals.submitted + ' (applied ' + r.proposals.applied + ', held ' + r.proposals.held + '), skipped for asks ' + r.skippedForAsk + ', errors ' + r.errors;
  }
}

// ---------------------------------------------------------------- the suite probe
/**
 * The task score of one dream: the suite items the exact path gets wrong (the frontier) asked
 * through the memory path of act/prompt.mjs (recall, then memoryAnswer, the path ask() takes
 * with provider 'null' when solve() has no answer) with the dream as the only memory item, and
 * graded by bench/answer.mjs gradeAnswer. Loaded lazily so the daemon does not import act/ or
 * bench/ until a dream needs judging.
 * @param {object} [opts] { tasksPerSuite, sources }
 * @returns {Promise<{items: number, frontier: object[], probe: (d: object) => number}>}
 */
export async function loadSuiteProbe({ tasksPerSuite = 100_000, sources = SUITE_SOURCES } = {}) {
  const [answer, solver, prompt] = await Promise.all([import('../bench/answer.mjs'), import('../act/solve.mjs'), import('../act/prompt.mjs')]);
  const items = answer.buildQuestions({ tasksPerSuite }).filter((q) => sources.includes(q.source));
  const frontier = [];
  for (const q of items) {
    const s = solver.solve(q.q);
    if (!answer.gradeAnswer(s ? solver.renderSolved(s) : '', q).ok) frontier.push(q);
  }
  return {
    items: items.length, frontier, sources: [...sources],
    probe(d) {
      if (!frontier.length) return 0;
      const episodic = new EpisodicStore({ d: S.D, seed: 'dream-probe', capacity: 16 });
      const key = encodeWords(d.words);
      episodic.append({ key, value: { text: d.memoryText, origin: DREAM_PROVENANCE }, items: d.words, t: 0 });
      S.release(key);
      const scratch = { memory: { episodic, working: { keys: () => [] } }, clock: { t: 0 } };
      let gain = 0;
      for (const q of frontier) if (answer.gradeAnswer(prompt.memoryAnswer(prompt.recall(scratch, q.q, { events: [] })), q).ok) gain++;
      return gain;
    },
  };
}

// ---------------------------------------------------------------- the daemon's one call
/**
 * Attach the imagination region to a brain: build it, start its period, and load the suite
 * probe in the background (until it is loaded a dream's suite gain is null, not zero).
 * every 0 builds nothing and returns null, which is how a bounded run keeps it off.
 * @param {object} brain
 * @param {object} [opts] DREAM_DEFAULTS and DreamRegion options; suite false skips the probe
 * @returns {DreamRegion|null}
 */
export function attachDream(brain, opts = {}) {
  const every = opts.every === undefined ? DREAM_DEFAULTS.every : Number(opts.every);
  if (!(every > 0)) return null;
  const region = new DreamRegion(brain, { ...opts, every, suite: opts.suite === false ? false : (opts.suite || null) });
  region.attach();
  brain.dream = region;
  if (opts.suite !== false && !region.suite) {
    region.suiteState = 'loading';
    region.ready = loadSuiteProbe(opts.suiteOpts || {}).then((p) => { region.suite = p; region.suiteState = 'ready'; return region; })
      .catch((e) => { region.suiteState = 'unavailable'; region.suiteReason = String(e && e.message).split('\n')[0]; return region; });
  } else region.ready = Promise.resolve(region);
  return region;
}
