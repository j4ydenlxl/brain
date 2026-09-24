// self/apply.mjs: COMPUTATION IS NOT AUTHORITY. A confirmed trial is evidence, not
// permission. Every confirmed candidate is put to brain.gate as a proposal of kind
// 'self.improve' carrying the numbers that confirmed it; only an APPROVED proposal is
// applied to the live organism, and every application writes a ledger event whose `from`
// is the seq of the observation that produced the candidate, so ledger.trace(applySeq)
// walks back: apply -> trial -> proposal -> observation.
//
// core/gate.mjs is not edited by this file (its PROPOSAL_KINDS list is frozen, and core is
// not ours to change from here). arm() installs the new kind on a gate INSTANCE, keeping
// the gate's own accounting, its ledger events, its pending queue and its human-hold set
// exactly as core defines them. A gate that was never armed refuses 'self.improve'
// outright, which is the safe default: an unarmed brain cannot be rewritten by itself.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { applyDelta, deltaLine } from './propose.mjs';
import { round } from './observe.mjs';

export const SELF_KIND = 'self.improve';
export const SELF_APPLY = 'self.apply';
export const SELF_TRIAL = 'self.trial';

/**
 * The policy for self.improve proposals. Deliberately strict:
 *   - the trial verdict must be 'confirmed'
 *   - the treated arm must have beaten a MATCHED control (identicalArms), never a rerun
 *   - the gain must clear minGain in percent
 *   - the change must not be bigger than maxCells / maxEdges
 * Anything else is rejected. 'hold' is returned when a human must look (requireHuman).
 *
 * maxEdges defaults to the flat 256 that self/propose.mjs's pruneCap() also uses as its
 * floor: fine while the organism is small, but propose.mjs scales its prune batches up
 * past 256 once the organism outgrows 25,600 edges, and a policy still holding the flat
 * 256 here would reject every one of those larger, correctly-sized batches. self/daemon.mjs
 * arms the gate with maxEdges: pruneCap(brain.connectome.size()) so the two stay matched;
 * a caller arming its own gate should do the same.
 */
export function selfPolicy({ minGainPct = 1, maxCells = 8, maxEdges = 256, requireHuman = false, allow = null } = {}) {
  return function policy(proposal) {
    const ev = proposal.evidence || {};
    if (allow && !allow.includes(ev.deltaKind)) return 'reject';
    if (ev.verdict !== 'confirmed') return 'reject';
    if (ev.identicalArms !== true) return 'reject';
    if (!(Math.abs(ev.gainPct ?? 0) >= minGainPct)) return 'reject';
    if ((ev.cells ?? 0) > maxCells || (ev.edges ?? 0) > maxEdges) return 'reject';
    return requireHuman ? 'hold' : 'approve';
  };
}

/**
 * Teach one gate instance the 'self.improve' kind. Idempotent.
 * @param {import('../core/gate.mjs').Gate} gate
 * @param {object} [opts] policy options (selfPolicy) or { policy } for your own function
 */
export function arm(gate, opts = {}) {
  if (gate._selfArmed) return gate;
  const decide = opts.policy || selfPolicy(opts);
  const base = gate.propose.bind(gate);
  gate.propose = function (p, ctx = {}) {
    if (p.kind !== SELF_KIND) return base(p, ctx);
    const id = this.nextId++;
    const proposal = {
      id, kind: SELF_KIND, what: p.what, why: p.why || '', evidence: p.evidence || {},
      by: p.by || 'self', t: ctx.t ?? 0, gen: ctx.gen ?? 0, status: 'pending',
    };
    this.stats.proposed++;
    proposal.seq = this.ledger?.append({ type: 'proposal', ...proposal });
    const verdict = this.humanRequired.has(SELF_KIND) ? 'hold' : decide(proposal, ctx);
    if (verdict === 'approve') return this._decide(proposal, 'approved', 'policy', ctx);
    if (verdict === 'reject') return this._decide(proposal, 'rejected', 'policy', ctx);
    this.stats.held++;
    this.pending.set(id, proposal);
    return proposal;
  };
  gate._selfArmed = true;
  gate._selfPolicy = decide;
  return gate;
}
export function isArmed(gate) { return gate._selfArmed === true; }

/**
 * Put one trial result to the gate and, if approved, change the live organism.
 * @param {import('../core/brain.mjs').Brain} brain
 * @param {object} result   a trial result from self/trial.mjs
 * @param {object} [opts]
 * @param {object} [opts.archive] an Archive; refuted and rejected keys are remembered
 * @returns {object} { status, applied, proposal, seq, reason }
 */
export function apply(brain, result, { archive = null, by = 'self.apply' } = {}) {
  if (!isArmed(brain.gate)) {
    return { status: 'unarmed', applied: false, reason: 'gate has no self.improve kind: call arm(brain.gate) first', key: result.key };
  }
  if (result.verdict !== 'confirmed') {
    archive?.remember(result.key, result.verdict, result);
    return { status: 'not-confirmed', applied: false, reason: 'verdict ' + result.verdict, key: result.key };
  }
  // The trial itself is a ledger event, so the proposal's evidence can be found later
  // without the daemon's log file.
  const trialSeq = brain.log({
    type: SELF_TRIAL, from: result.from, key: result.key, delta: result.delta.kind, line: result.line,
    metric: result.metric, verdict: result.verdict, treated: result.treated, control: result.control,
    gain: result.gain, gainPct: result.gainPct, ticks: result.ticks, identicalArms: result.identicalArms,
  });
  const proposal = brain.gate.propose({
    kind: SELF_KIND,
    what: result.delta,
    why: result.hypothesis,
    by,
    evidence: {
      deltaKind: result.delta.kind, verdict: result.verdict, metric: result.metric,
      treated: result.treated, control: result.control, gain: result.gain, gainPct: result.gainPct,
      healthGain: result.healthGain, identicalArms: result.identicalArms, ticks: result.ticks,
      cells: result.applied?.cells ?? 0, edges: result.applied?.edges ?? 0,
      observation: result.from, trial: trialSeq,
    },
  }, brain.ctx);

  if (proposal.status !== 'approved') {
    archive?.remember(result.key, proposal.status === 'pending' ? 'held' : 'rejected', result);
    brain.log({ type: SELF_APPLY, from: trialSeq, key: result.key, proposal: proposal.id, status: proposal.status, applied: false });
    return { status: proposal.status, applied: false, proposal, reason: 'gate ' + proposal.status, key: result.key };
  }

  const landed = applyDelta(brain, result.delta, { by });
  const seq = brain.log({
    type: SELF_APPLY, from: trialSeq, key: result.key, proposal: proposal.id,
    status: landed.ok ? 'applied' : 'failed', applied: landed.ok === true,
    line: result.line, delta: result.delta.kind, region: result.delta.region ?? null,
    cells: landed.cells ?? 0, edges: landed.edges ?? 0, gainPct: result.gainPct,
    reason: landed.ok ? null : landed.reason, observation: result.from, trial: trialSeq,
  });
  archive?.remember(result.key, landed.ok ? 'applied' : 'failed', result);
  // Traced HERE, not later: the ledger's in-memory ring is finite, and an organism that
  // keeps running will roll a round's observation out of it. The chain is recorded at the
  // moment it is provable (apply -> trial -> observe).
  const trace = seq >= 0 ? traceApply(brain, seq) : { seq, chain: [], observation: null, reachedObservation: false };
  return {
    status: landed.ok ? 'applied' : 'failed', applied: landed.ok === true, proposal, seq, trialSeq, trace,
    reason: landed.ok ? null : landed.reason, key: result.key,
    cells: landed.cells ?? 0, edges: landed.edges ?? 0, line: result.line,
  };
}

// Apply a whole round of trial results, best gain first. Returns one report.
export function applyAll(brain, results, opts = {}) {
  const confirmed = results.filter(r => r.verdict === 'confirmed').sort((a, b) => Math.abs(b.gainPct) - Math.abs(a.gainPct));
  const other = results.filter(r => r.verdict !== 'confirmed');
  const decisions = [];
  for (const r of other) decisions.push(apply(brain, r, opts));
  for (const r of confirmed) decisions.push(apply(brain, r, opts));
  return {
    decisions,
    applied: decisions.filter(d => d.applied).length,
    rejected: decisions.filter(d => d.status === 'rejected').length,
    held: decisions.filter(d => d.status === 'pending').length,
    failed: decisions.filter(d => d.status === 'failed').length,
  };
}

// ---------------------------------------------------------------- the archive
// LEARNING FROM MISTAKES. A refuted, rejected or inapplicable change is remembered by its
// candidate key and never proposed again. Applied changes are remembered too: a delta that
// has landed is not a candidate any more. The file is plain JSON so a human can read what
// the brain tried and why it stopped trying it.
export class Archive {
  constructor(file = null) {
    this.file = file;
    this.entries = new Map();
    if (file && existsSync(file)) {
      try {
        const j = JSON.parse(readFileSync(file, 'utf8'));
        for (const e of j.entries || []) this.entries.set(e.key, e);
      } catch { /* a corrupt archive is an empty archive, never a crash in the loop */ }
    }
  }
  has(key) { return this.entries.has(key); }
  get(key) { return this.entries.get(key) || null; }
  keys() { return new Set(this.entries.keys()); }
  get size() { return this.entries.size; }
  remember(key, outcome, result = {}) {
    const prev = this.entries.get(key);
    this.entries.set(key, {
      key, outcome, tries: (prev?.tries || 0) + 1,
      line: result.line || prev?.line || '', metric: result.metric || prev?.metric || '',
      gainPct: result.gainPct ?? prev?.gainPct ?? 0,
      reason: result.reason || prev?.reason || '',
      at: new Date().toISOString(),
    });
    return this;
  }
  counts() {
    const c = {};
    for (const e of this.entries.values()) c[e.outcome] = (c[e.outcome] || 0) + 1;
    return c;
  }
  toJSON() { return { v: 1, entries: [...this.entries.values()] }; }
  save(file = this.file) {
    if (!file) return null;
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(this.toJSON(), null, 2));
    return file;
  }
}

// ---------------------------------------------------------------- tracing
// Walk the ledger back from an apply event to the observation that motivated it. Returns
// the chain of event types, newest first, and the observation seq if it was reached.
export function traceApply(brain, seq, depth = 8) {
  const { nodes } = brain.ledger.trace(seq, depth);
  const chain = nodes.map(n => ({ seq: n.seq, type: n.type }));
  const observation = nodes.find(n => n.type === 'self.observe');
  return { seq, chain, observation: observation ? observation.seq : null, reachedObservation: !!observation };
}

export function applyLine(d) {
  if (d.applied) return `applied ${d.line} (+${d.cells} cells, +${d.edges} edges, gain ${round(d.gainPct, 3)}%) seq=${d.seq}`;
  return `not applied [${d.status}] ${d.key}: ${d.reason || ''}`;
}

export const DELTA_LINE = deltaLine;
