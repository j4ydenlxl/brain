// core/gate.mjs: COMPUTATION IS NOT AUTHORITY. Reasoning about a change never grants
// permission to make it. Structural changes (grow, prune, replace), learning-rule changes,
// and external actions are Proposals. A policy decides: approve, reject, or hold for a
// human. Every proposal and decision is a ledger event. Nothing bypasses this.
export const PROPOSAL_KINDS = Object.freeze([
  'edge.grow', 'edge.prune', 'edge.replace',
  'cell.add', 'cell.remove', 'cell.rule',
  'region.add', 'external.action', 'genome.promote',
]);

// ---------------------------------------------------------------- registrable kinds
// The nine kinds above are frozen and core owns both the list and the policy that judges
// them. A subsystem that needs a kind of its own registers it here (notes/lab.md request 1):
// the kind then travels through THIS gate, with one id space, one pending map, one statistics
// block and the same two ledger events, while the judgment stays with the subsystem that
// defined it. A registered kind with no policy holds, which is the safe default: a kind
// nobody judges waits for a human.
//   registerProposalKind(name, { policy, slim })  open a kind
//   registerPolicy(kind, fn)                      give it (or replace) its policy
//   slim(evidence)                                what the ledger line carries when the
//                                                 evidence is too big for one event
const REGISTERED = new Map(); // kind -> { policy, slim }

export function registerProposalKind(name, { policy = null, slim = null } = {}) {
  if (typeof name !== 'string' || !name) throw new Error('gate: a proposal kind must be a non empty string');
  if (PROPOSAL_KINDS.includes(name)) throw new Error('gate: ' + name + ' is a built in kind: the nine core kinds are frozen and cannot be re-registered');
  if (policy !== null && typeof policy !== 'function') throw new Error('gate: the policy for ' + name + ' must be a function');
  if (slim !== null && typeof slim !== 'function') throw new Error('gate: the slim for ' + name + ' must be a function');
  const prev = REGISTERED.get(name) || { policy: null, slim: null };
  REGISTERED.set(name, { policy: policy || prev.policy, slim: slim || prev.slim });
  return name;
}
/** Register (or replace) the policy that judges one registered kind. @returns {string} the kind */
export function registerPolicy(kind, fn) {
  if (typeof fn !== 'function') throw new Error('gate: registerPolicy needs a function for ' + kind);
  return registerProposalKind(kind, { policy: fn });
}
/** The policy registered for a kind, or null. */
export function policyFor(kind) { const r = REGISTERED.get(kind); return r ? r.policy : null; }
/** Every kind this gate will accept: the nine built in ones and the registered ones. */
export function knownKind(kind) { return PROPOSAL_KINDS.includes(kind) || REGISTERED.has(kind); }
/** The registered kinds, in registration order. */
export function registeredKinds() { return [...REGISTERED.keys()]; }

export class Gate {
  constructor({ ledger, policy = null, humanRequired = ['external.action', 'cell.rule', 'region.add'] } = {}) {
    this.ledger = ledger;
    this.humanRequired = new Set(humanRequired);
    this.policy = policy || defaultPolicy;
    this.pending = new Map();
    this.nextId = 1;
    this.stats = { proposed: 0, approved: 0, rejected: 0, held: 0 };
  }
  propose(p, ctx = {}) {
    const reg = REGISTERED.get(p.kind) || null;
    if (!reg && !PROPOSAL_KINDS.includes(p.kind)) throw new Error('gate: unknown proposal kind ' + p.kind);
    const id = this.nextId++;
    const proposal = { id, kind: p.kind, what: p.what, why: p.why || '', evidence: p.evidence || {}, by: p.by || 'unknown', t: ctx.t ?? 0, gen: ctx.gen ?? 0, status: 'pending' };
    this.stats.proposed++;
    // The proposal keeps its whole evidence; the LEDGER LINE carries the kind's slim view of
    // it when the kind registered one, because a verdict file is too big for one event.
    proposal.seq = this.ledger?.append({ type: 'proposal', ...proposal, ...(reg && reg.slim ? { evidence: reg.slim(proposal.evidence) } : null) });
    let verdict = this.humanRequired.has(p.kind) ? 'hold' : this.policy(proposal, ctx);
    if (verdict === 'approve') return this._decide(proposal, 'approved', 'policy', ctx);
    if (verdict === 'reject') return this._decide(proposal, 'rejected', 'policy', ctx);
    this.stats.held++;
    this.pending.set(id, proposal);
    return proposal;
  }
  decide(id, ok, by = 'human', ctx = {}) {
    const p = this.pending.get(id);
    if (!p) throw new Error('gate: no pending proposal ' + id);
    this.pending.delete(id);
    this.stats.held--;
    return this._decide(p, ok ? 'approved' : 'rejected', by, ctx);
  }
  _decide(p, status, by, ctx) {
    p.status = status; p.decidedBy = by;
    if (status === 'approved') this.stats.approved++; else this.stats.rejected++;
    this.ledger?.append({ type: 'decision', proposal: p.id, kind: p.kind, status, by, t: ctx.t ?? p.t, gen: ctx.gen ?? p.gen });
    return p;
  }
  listPending() { return [...this.pending.values()]; }
  serialize() { return { nextId: this.nextId, stats: this.stats, pending: this.listPending(), humanRequired: [...this.humanRequired] }; }
  restore(j) { this.nextId = j.nextId; this.stats = j.stats; for (const p of j.pending) this.pending.set(p.id, p); this.humanRequired = new Set(j.humanRequired); }
}

// Policy factory: growth needs enough co-activation evidence, pruning needs staleness and
// a weak weight, genome promotion needs a fitness gain that beat its control. A kind that
// registered a policy is judged by it, which is looked up at decision time so a kind
// registered after the brain was built is still judged by its owner. Everything else holds
// for a human. Thresholds are explicit so a brain's growth config and its gate agree.
export function makePolicy({ growThreshold = 8, pruneStale = 1000, pruneFloor = 0.05 } = {}) {
  return function policy(p, ctx) {
    const ev = p.evidence || {};
    switch (p.kind) {
      case 'edge.grow': return (ev.coActivations ?? 0) >= growThreshold ? 'approve' : 'reject';
      case 'edge.prune': return (ev.staleTicks ?? 0) >= pruneStale && Math.abs(ev.w ?? 1) < pruneFloor ? 'approve' : 'reject';
      case 'edge.replace': return (ev.coActivations ?? 0) >= growThreshold ? 'approve' : 'hold';
      case 'cell.add': case 'cell.remove': return ev.testsPassed === true ? 'approve' : 'hold';
      case 'genome.promote': return (ev.gain ?? 0) > 0 && ev.beatControl === true ? 'approve' : 'reject';
      default: { const fn = policyFor(p.kind); return fn ? fn(p, ctx) : 'hold'; }
    }
  };
}
export const defaultPolicy = makePolicy();
