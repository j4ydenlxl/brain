// lab/integrate.mjs : COMPUTATION IS NOT AUTHORITY, AND NEITHER IS A GOOD RESULT.
// His manual: "modifications to core architecture, learning rules, external interfaces, or
// persistent state should pass through explicit control mechanisms". A confirmed experiment
// is evidence, not permission. It becomes part of the main organism only through a gate
// proposal of kind 'lab.integrate' carrying the verdict file itself as evidence, and the
// default policy REFUSES unless that verdict says confirmed against the bar it stated
// before the run.
//
// Where the proposal actually goes. Core answered notes/lab.md request 1: the nine built in
// kinds are still frozen, but core/gate.mjs now takes a REGISTERED kind and a policy keyed to
// it. This file registers 'lab.integrate' with its own judgment and its own slim view of the
// evidence at import time, and every proposal then goes through the ordinary
// brain.gate.propose: core's id space, core's statistics, core's pending map, core's two
// ledger events. `brain proposals` cannot tell a lab.integrate from an edge.grow, and the
// workaround that used to decide the proposal here is gone.
//
// The four things the policy checks, all of them from the verdict file and none of them
// from the caller:
//   1. verdict === 'confirmed'
//   2. the effect reached the minEffect the hypothesis stated
//   3. the permutation share cleared the alpha the bar stated
//   4. the seed count reached the bar, and the mechanism hash in the file matches the
//      mechanism being integrated when the caller supplies one
import { knownKind, registerProposalKind } from '../core/gate.mjs';
import { readVerdict, contentHash } from './experiment.mjs';

export const LAB_INTEGRATE = 'lab.integrate';

/**
 * The default policy. Returns 'approve' | 'reject' | 'hold' and a reason list.
 * @param {object} proposal @returns {{verdict: string, reasons: string[]}}
 */
export function judge(proposal) {
  const ev = proposal.evidence || {};
  const v = ev.verdict || null;
  const reasons = [];
  if (!v) return { verdict: 'reject', reasons: ['no verdict file was attached as evidence'] };
  if (!ev.file) reasons.push('the verdict was passed inline, not read from lab/verdicts/');
  const bar = v.bar || {}, h = v.hypothesis || {};
  const fails = [];
  if (v.verdict !== 'confirmed') fails.push('the verdict is "' + v.verdict + '", not "confirmed"');
  if (!(typeof v.effect?.mean === 'number' && typeof h.minEffect === 'number' && v.effect.mean >= h.minEffect)) fails.push('effect ' + fmt(v.effect?.mean) + ' did not reach the stated minEffect ' + fmt(h.minEffect));
  if (!(typeof v.permutation?.share === 'number' && typeof bar.alpha === 'number' && v.permutation.share <= bar.alpha)) fails.push('permutation share ' + fmt(v.permutation?.share) + ' did not clear the stated alpha ' + fmt(bar.alpha));
  if (!(typeof v.k === 'number' && typeof bar.seeds === 'number' && v.k >= bar.seeds)) fails.push('only ' + fmt(v.k) + ' seeds against a bar of ' + fmt(bar.seeds));
  if (ev.mechanismHash && v.source && v.source.mechanism && ev.mechanismHash !== v.source.mechanism) fails.push('the mechanism being integrated hashes to ' + ev.mechanismHash + ', the verdict graded ' + v.source.mechanism);
  if (fails.length) return { verdict: 'reject', reasons: fails };
  reasons.push('confirmed: effect ' + fmt(v.effect.mean) + ' >= ' + fmt(h.minEffect) + ', share ' + fmt(v.permutation.share) + ' <= ' + fmt(bar.alpha) + ', ' + v.k + ' seeds >= ' + bar.seeds);
  return { verdict: 'approve', reasons };
}
function fmt(x) { return typeof x === 'number' ? String(Number(x.toFixed(6))) : String(x); }

/** The policy shape core/gate.mjs expects: proposal -> 'approve' | 'reject' | 'hold'. */
export function labPolicy(proposal) { return judge(proposal).verdict; }

// The whole verdict record is too big for a ledger line; the ledger keeps the pointer and
// the four numbers the decision turned on, and the file keeps everything. core/gate.mjs
// calls this when it writes the 'proposal' event for this kind.
function slim(ev) {
  return { file: ev.file, experiment: ev.experiment, metric: ev.metric, effect: ev.effect, share: ev.share, seeds: ev.seeds, verdict: ev.verdict ? ev.verdict.verdict : null, mechanismHash: ev.mechanismHash };
}

// Opening the kind on core's gate. Importing this file is what teaches core the kind, so a
// brain that never loaded lab/ still refuses a lab.integrate outright, which is the safe
// default. registerProposalKind is idempotent, so a second import changes nothing.
registerProposalKind(LAB_INTEGRATE, { policy: labPolicy, slim });

/**
 * Open a 'lab.integrate' proposal and let the policy decide it.
 * @param {Brain} brain
 * @param {object} opts
 *   verdict   a verdict record, or
 *   name      the name of a verdict under lab/verdicts/ (or a path to a .json file)
 *   what      what would change in the main organism, as data
 *   apply     optional function(brain) run only if the proposal is approved
 *   mechanism optional function whose hash must match the one the verdict graded
 * The policy is the one registered for the kind on core's gate; a caller that wants another
 * judgment registers it with registerPolicy(LAB_INTEGRATE, fn) rather than passing it here,
 * so the gate and the ledger always record the policy that actually decided.
 * @returns {object} { proposal, approved, applied, reasons }
 */
export function proposeIntegration(brain, opts = {}) {
  const v = opts.verdict ? { ...opts.verdict } : readVerdict(opts.name, opts.verdictsDir);
  const evidence = {
    verdict: v,
    file: v.file || opts.file || null,
    experiment: v.name,
    metric: v.metric,
    effect: v.effect ? v.effect.mean : null,
    share: v.permutation ? v.permutation.share : null,
    seeds: v.k,
    mechanismHash: opts.mechanism ? contentHash(opts.mechanism) : (opts.mechanismHash || null),
  };
  // The reasons are the registered policy's own, read here so the caller gets the sentences
  // as well as the verdict. A brain that installed a different gate policy can still decide
  // the proposal differently, and then the status below is the decision and these are only
  // what the lab policy would have said.
  const decision = judge({ evidence });
  const ctx = { t: brain.clock.t, gen: brain.clock.gen };
  const payload = {
    kind: LAB_INTEGRATE,
    what: opts.what ?? { experiment: v.name, region: v.region ?? null, metric: v.metric },
    why: opts.why || ('integrate the confirmed mechanism from experiment ' + v.name),
    evidence,
    by: opts.by || 'lab',
  };

  // Straight through core's gate: its id space, its statistics, its pending map, its two
  // ledger events, and the policy this file registered for the kind. coreKnowsKind says so.
  const coreKnowsKind = knownKind(LAB_INTEGRATE);
  const proposal = brain.gate.propose(payload, ctx);

  const approved = proposal.status === 'approved';
  let applied = false, applyError = null;
  if (approved && typeof opts.apply === 'function') {
    try { opts.apply(brain); applied = true; } catch (e) { applyError = String(e && e.message || e); }
    brain.ledger?.append({ type: 'lab.integrate.applied', t: brain.clock.t, gen: brain.clock.gen, proposal: proposal.id, experiment: v.name, ok: applied, error: applyError });
  }
  return { proposal, approved, applied, applyError, coreKnowsKind, reasons: decision.reasons, verdict: v.verdict, file: evidence.file };
}

/**
 * The whole path in one call: read the verdict, propose, and apply on approval.
 * @param {Brain} brain @param {string} name a verdict name under lab/verdicts/
 * @param {object} [opts] see proposeIntegration
 */
export function integrate(brain, name, opts = {}) {
  return proposeIntegration(brain, { ...opts, name });
}

/** Plain text for one integration attempt. */
export function renderIntegration(r) {
  const L = [];
  L.push('lab.integrate  proposal #' + r.proposal.id + '  ' + r.proposal.status.toUpperCase() + '  on the brain gate, decided by the lab policy' + (r.coreKnowsKind ? '  (core knows the kind: registered on core/gate.mjs)' : '  (core does not carry the kind: importing lab/integrate.mjs is what registers it)'));
  L.push('  experiment ' + (r.proposal.evidence.experiment || r.proposal.what.experiment) + '   verdict in the file: ' + r.verdict);
  if (r.file) L.push('  evidence   ' + r.file);
  for (const why of r.reasons) L.push('  because    ' + why);
  L.push('  applied    ' + r.applied + (r.applyError ? '   error ' + r.applyError : ''));
  return L.join('\n');
}
