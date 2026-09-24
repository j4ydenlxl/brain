// self/trial.mjs: A CHANGE IS AN EXPERIMENT, NOT AN OPINION. Every candidate from
// self/propose.mjs is tried in an ISOLATED clone (simulate/clone.mjs: every typed array
// reallocated, nothing shared with the live organism) against a MATCHED CONTROL: a second
// clone of the same brain, at the same tick, fed the identical input stream for the same
// number of ticks, with the delta as the only difference between them.
//
// Three verdicts, never two:
//   confirmed  the hypothesis expression evaluates true on (treated, control)
//   refuted    it evaluates false and the two arms are further apart than the noise band
//   undecided  the arms are inside the band, or the metric was not measurable at all
//
// An undecided trial is not a pass. A change only reaches the gate on `confirmed`, and the
// numbers travel with it as evidence.
import { cloneSub } from '../simulate/clone.mjs';
import { hash32, hashBytes } from '../core/rng.mjs';
import { evalSym } from '../core/primitives.mjs';
import { RNG } from '../core/rng.mjs';
import { ratToNumber, ratFromDecimal } from '../core/signal.mjs';
import { measure, measureRegions, health, round, finite, decimal } from './observe.mjs';
import { applyDelta, readMetric, deltaLine } from './propose.mjs';

export const VERDICTS = Object.freeze(['confirmed', 'refuted', 'undecided', 'inapplicable']);

// ---------------------------------------------------------------- matched arms
// simulate/clone.fingerprint() builds ONE string out of the whole organism. At 1600 cells
// and 17926 edges that string is longer than a JS string can be and the proof itself
// throws RangeError: Invalid string length (MEASURED, notes/self.md request 7). The arms
// only have to be proved EQUAL, never printed, so the digest is folded incrementally over
// the same content: no intermediate string, constant memory, one 32 bit number.
export function armDigest(brain) {
  let h = 0x811c9dc5 >>> 0;
  const mix = (x) => { h = Math.imul(h ^ (x >>> 0), 0x01000193) >>> 0; };
  mix(hash32(brain.name)); mix(brain.clock.t); mix(brain.clock.gen); mix(brain.cells.length);
  for (const c of brain.cells) {
    mix(hash32(c.id + '|' + c.kind + '|' + c.region + '|' + c.circuit + '|' + c.policy.period + '|' + c.policy.priority + '|' + c.policy.budget + '|' + c.policy.learn));
    mix(c.stats.runs); mix(c.stats.fired); mix(c.stats.errors);
    let pending = 0;
    for (const m of c.mailbox) pending += m.length;
    mix(pending);
  }
  const cx = brain.connectome;
  mix(cx.size());
  for (const a of [cx.src, cx.dst, cx.srcPort, cx.dstPort, cx.flags, cx.w, cx.delay]) {
    mix(hashBytes(new Uint8Array(a.buffer, a.byteOffset, a.byteLength)));
  }
  return h >>> 0;
}

// ---------------------------------------------------------------- the input stream
// The SAME stream reaches both arms. It is a list of (cell id, port, signal) drawn once
// from the parent brain by a seeded walk over cells that accept a `num` on some in port,
// so it can be replayed into a clone that holds those cells. A brain with no such cell
// gets an empty stream and is driven by its own periodic cells alone, which is still a
// matched condition: both arms get the same nothing.
export function inputStream(brain, { ticks = 64, per = 4, seed = 'self:stream' } = {}) {
  const rng = new RNG(seed);
  const targets = [];
  for (const c of brain.cells) {
    for (let p = 0; p < c.ports.in.length; p++) {
      // MONOMORPHIC ports only: a port that declares several kinds is claimed by the first
      // kind that reaches it (genome/wire.mjs), and a cell that meets two kinds on one port
      // keeps a history it can no longer serialize with one kind. Injecting a num into a
      // port an hv already owns crashes that cell's serialize, which is a defect the input
      // stream must not manufacture. See notes/self.md request 1.
      if (c.ports.in[p].kinds.length === 1 && c.ports.in[p].kinds[0] === 'num') { targets.push([c.id, p]); break; }
    }
    if (targets.length >= 256) break;
  }
  const items = [];
  if (targets.length === 0) return { items, targets: 0, ticks };
  for (let t = 0; t < ticks; t++) {
    for (let i = 0; i < per; i++) {
      const [id, port] = targets[rng.int(targets.length)];
      items.push({ t, cell: id, port, value: String(1 + rng.int(999)) });
    }
  }
  return { items, targets: targets.length, ticks };
}

// A clone inherits every cell's lifetime counters, so a fresh window would be measured on
// top of the parent's whole history and a real effect would arrive diluted by however long
// the organism happened to have been running. Both arms are zeroed identically, so what a
// trial measures is the WINDOW, not the past (memory: a rate whose window is not the one
// you think you are measuring is not a rate). Surprise and lastT are kept: they are state
// the cells compute with, not counters of the window.
export function resetWindow(clone) {
  for (const c of clone.cells) { c.stats.runs = 0; c.stats.fired = 0; c.stats.errors = 0; c.stats.skips = 0; c.stats.cost = 0; }
  clone.stats = { ticks: 0, runs: 0, signals: 0, delivered: 0, grown: 0, pruned: 0, errors: 0, refused: 0 };
  clone.scheduler.stats = { funded: 0, skipped: 0, ticks: 0 };
  return clone;
}

// Run one arm: a clone, the stream, N ticks, then a measurement. The clone is discarded.
export function runArm(clone, stream, ticks) {
  resetWindow(clone);
  const byTick = new Map();
  for (const it of stream.items) {
    let l = byTick.get(it.t);
    if (!l) { l = []; byTick.set(it.t, l); }
    l.push(it);
  }
  let injected = 0, missed = 0;
  for (let t = 0; t < ticks; t++) {
    for (const it of byTick.get(t) || []) {
      if (!clone.byId.has(it.cell)) { missed++; continue; }
      try { clone.inject(it.cell, it.port, { kind: 'num', data: ratFromDecimal(it.value) }); injected++; } catch { missed++; }
    }
    clone.tick(1);
  }
  const m = measure(clone);
  // No fingerprint after the run: the arms are proved matched BEFORE the delta, and
  // fingerprinting a run out organism twice per trial costs more than the trial itself.
  return { metrics: m, regions: measureRegions(clone), health: health({ metrics: m }), injected, missed };
}

// ---------------------------------------------------------------- grading
// The hypothesis is a sym expression over `treated` and `control`. It is evaluated by the
// same evaluator the brain uses for algebra, so a hypothesis about the brain is graded by
// the brain's own arithmetic, exactly, with no floating point verdict flipping.
// The band is measured (bench/self-null.mjs, 2026-09-17): the spillover of a delta onto
// metrics it did not target has a p95 of 0.8256% at 240 cells, 0.4525% at 800 and 0.1259%
// at 1600. The daemon passes spillFloor(cells) from self/propose.mjs as the band; 0.5% here
// is the default for a direct call, the measured value at 800 cells.
export function grade(candidate, treated, control, { band = 0.005 } = {}) {
  const metric = candidate.hypothesis.metric;
  const tv = pick(treated, metric), cv = pick(control, metric);
  if (tv === null || cv === null) {
    return { verdict: 'undecided', reason: 'metric ' + metric + ' not measurable on both arms', treated: tv, control: cv, gain: 0, gainPct: 0 };
  }
  const gain = tv - cv;
  const denom = Math.abs(cv) > 0 ? Math.abs(cv) : 1;
  const gainPct = round((gain / denom) * 100, 4);
  const truth = ratToNumber(evalSym(candidate.hypothesis.sym, {
    treated: ratFromDecimal(decimal(tv)),
    control: ratFromDecimal(decimal(cv)),
  }));
  const inBand = Math.abs(gain) <= band * denom;
  if (truth === 1) return { verdict: 'confirmed', reason: candidate.hypothesis.text, treated: tv, control: cv, gain: round(gain, 6), gainPct };
  if (inBand) return { verdict: 'undecided', reason: 'arms within the noise band of ' + band * 100 + '% (gain ' + gainPct + '%)', treated: tv, control: cv, gain: round(gain, 6), gainPct };
  return { verdict: 'refuted', reason: 'hypothesis false: ' + candidate.hypothesis.text, treated: tv, control: cv, gain: round(gain, 6), gainPct };
}

// Read a metric path off an arm result (which holds metrics + regions, like a self model).
function pick(arm, path) {
  const model = { metrics: arm.metrics, regions: arm.regions, suites: null };
  const v = readMetric(model, path);
  return v === null ? null : finite(v);
}

// ---------------------------------------------------------------- one trial
/**
 * Try one candidate against a matched control.
 * @param {import('../core/brain.mjs').Brain} brain the live organism (never modified)
 * @param {object} candidate from propose()
 * @param {object} [opts]
 * @param {number} [opts.ticks] ticks each arm runs
 * @param {object} [opts.stream] a shared input stream (both arms and every candidate of a
 *                 round get the identical one; built here when not given)
 * @returns {object} { verdict, gain, treated, control, evidence, ms }
 */
export function trial(brain, candidate, { ticks = 48, stream = null, band = 0.005, cloneOpts = {}, control: shared = null } = {}) {
  const t0 = process.hrtime.bigint();
  const s = stream || inputStream(brain, { ticks });
  // Both arms are seeded identically: the delta is the ONLY difference between them.
  const armSeed = brain.name + ':arm:' + brain.clock.t;
  // The name is part of the digest, so both arms carry the same one: two clones that
  // differ only by a label would report as unmatched arms.
  const treated = cloneSub(brain, { name: brain.name + '.arm', seed: armSeed, ...cloneOpts });
  const treatedDigest = armDigest(treated);
  const control = shared ? null : cloneSub(brain, { name: brain.name + '.arm', seed: armSeed, ...cloneOpts });
  const identical = shared ? shared.digest === treatedDigest : armDigest(control) === treatedDigest;
  const applied = applyDelta(treated, candidate.delta, { by: 'self.trial' });
  if (!applied.ok) {
    return {
      candidate: candidate.id, key: candidate.key, delta: candidate.delta, verdict: 'inapplicable',
      reason: applied.reason, ticks, ms: round(Number(process.hrtime.bigint() - t0) / 1e6, 3),
      treated: null, control: null, gain: 0, gainPct: 0, identicalArms: identical,
    };
  }
  const a = shared ? shared.arm : runArm(control, s, ticks);
  const b = runArm(treated, s, ticks);
  const g = grade(candidate, b, a, { band });
  const ms = round(Number(process.hrtime.bigint() - t0) / 1e6, 3);
  return {
    candidate: candidate.id, key: candidate.key, delta: candidate.delta, line: deltaLine(candidate.delta),
    hypothesis: candidate.hypothesis.text, metric: candidate.hypothesis.metric,
    verdict: g.verdict, reason: g.reason,
    treated: g.treated, control: g.control, gain: g.gain, gainPct: g.gainPct,
    identicalArms: identical,
    applied: { cells: applied.cells || 0, edges: applied.edges || 0 },
    arms: {
      control: { health: a.health, runs: a.metrics.runs, errors: a.metrics.errors, refused: a.metrics.refused, injected: a.injected, missed: a.missed },
      treated: { health: b.health, runs: b.metrics.runs, errors: b.metrics.errors, refused: b.metrics.refused, injected: b.injected, missed: b.missed },
    },
    healthGain: round(b.health - a.health, 6),
    ticks, ms,
    from: candidate.from,
  };
}

/**
 * Try a list of candidates against ONE control, run once for the whole round.
 *
 * The control arm is a deterministic function of (parent brain, stream, ticks) and none of
 * those three changes inside a round, so one control is matched to EVERY arm of that round:
 * same parent, same tick, same seed, same input, same window. It is not matched to any
 * other round (a matched control belongs to its own arm), which is why it is rebuilt at the
 * top of every round and never cached across them. Running it once halves the clone and
 * tick cost of a round, which at 1600 cells is the whole cost of the loop.
 */
export function trialAll(brain, candidates, opts = {}) {
  const ticks = opts.ticks ?? 48;
  const stream = opts.stream || inputStream(brain, { ticks });
  const armSeed = brain.name + ':arm:' + brain.clock.t;
  const clone = cloneSub(brain, { name: brain.name + '.arm', seed: armSeed, ...(opts.cloneOpts || {}) });
  const digest = armDigest(clone);
  const t0 = process.hrtime.bigint();
  const arm = runArm(clone, stream, ticks);
  const controlMs = round(Number(process.hrtime.bigint() - t0) / 1e6, 3);
  const shared = { arm, digest };
  const results = [];
  for (const c of candidates) results.push(trial(brain, c, { ...opts, ticks, stream, control: shared }));
  return {
    results,
    control: { digest, ms: controlMs, runs: arm.metrics.runs, health: arm.health, injected: arm.injected, missed: arm.missed },
    stream: { items: stream.items.length, targets: stream.targets },
  };
}

export function trialLine(r) {
  if (r.verdict === 'inapplicable') return `${r.candidate} ${r.verdict}: ${r.reason}`;
  return `${r.candidate} ${r.verdict} ${r.line}: ${r.metric} treated=${r.treated} control=${r.control} gain=${r.gain} (${r.gainPct}%) in ${r.ms}ms`;
}
