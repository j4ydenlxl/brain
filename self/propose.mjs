// self/propose.mjs: THE BRAIN PROPOSES CHANGES TO ITSELF. Input is the self model from
// self/observe.mjs. Output is a list of CANDIDATES, each one a genome delta (grow a
// region, change a kind mix, change a period, add a skill cell, rewire a conduit) carrying
// a HYPOTHESIS written as a sym expression over two variables:
//
//   treated   the metric measured on the clone the delta was applied to
//   control   the same metric on an untouched clone fed the identical input stream
//
// A candidate with no falsifiable hypothesis is not a candidate. Nothing here touches the
// live brain: proposing is computation, and computation is not authority (core/gate.mjs).
// The only thing that ever changes the organism is self/apply.mjs, through the gate.
import { S } from '../core/signal.mjs';
import { PRUNED } from '../core/connectome.mjs';
import { decimal, finite, round } from './observe.mjs';

export const DELTA_KINDS = Object.freeze([
  'region.grow', 'kind.mix', 'period.change', 'skill.add', 'conduit.add', 'conduit.prune',
]);

// Periods a period.change may move a circuit to, fastest first. A cell that never ran in a
// trial window is usually a cell whose period is longer than the window.
export const PERIOD_LADDER = Object.freeze([1, 2, 4, 8, 16, 64, 256, 1000]);

// ---------------------------------------------------------------- reading the model
// One metric path, resolved against a self model. 'self.<metric>' or
// 'region.<name>.<field>'. Unknown paths are null, never 0: a missing measurement is not
// a measurement of zero (the improver reads null as "no evidence").
export function readMetric(model, path) {
  const parts = path.split('.');
  if (parts[0] === 'self') { const v = model.metrics[parts.slice(1).join('.')]; return typeof v === 'number' ? v : null; }
  if (parts[0] === 'region') {
    const field = parts[parts.length - 1];
    const name = parts.slice(1, -1).join('.');
    const r = model.regions[name];
    if (!r) return null;
    const v = r[field];
    return typeof v === 'number' ? v : null;
  }
  if (parts[0] === 'suite') {
    const s = model.suites && model.suites[parts[1]];
    return s && typeof s[parts[2]] === 'number' ? s[parts[2]] : null;
  }
  return null;
}

// ---------------------------------------------------------------- hypotheses
/**
 * A falsifiable statement about one metric, as a sym expression over treated / control.
 * up:   treated > control * ratio      (ratio > 1)
 * down: treated < control * ratio      (ratio < 1)
 * A metric whose control value is 0 cannot be moved by a ratio, so the expression falls
 * back to an absolute bar: treated > floor (up) or treated < control (down).
 */
export function hypothesis({ metric, direction = 'up', ratio = 1.05, floor = 0, why = '' }) {
  const r = direction === 'up' ? Math.max(1.0000001, ratio) : Math.min(0.9999999, ratio);
  const sym = direction === 'up'
    ? S.or(
        S.gt(S.v('treated'), S.mul(S.num(decimal(r)), S.v('control'))),
        S.and(S.le(S.v('control'), S.num(decimal(floor))), S.gt(S.v('treated'), S.num(decimal(floor)))))
    : S.or(
        S.lt(S.v('treated'), S.mul(S.num(decimal(r)), S.v('control'))),
        S.and(S.gt(S.v('control'), S.num('0')), S.lt(S.v('treated'), S.num('0'))));
  const pct = round(Math.abs(r - 1) * 100, 3);
  return {
    metric, direction, ratio: r, floor, expectedPct: pct,
    sym,
    text: direction === 'up'
      ? metric + ' rises at least ' + pct + '% above the matched control'
      : metric + ' falls at least ' + pct + '% below the matched control',
    why,
  };
}

// The bar a structural change is held to, derived from the SIZE of the change rather than
// picked. A change that touches a fraction f of a region cannot be asked to move that
// region by more than f; asking for more manufactures refutations, asking for nothing
// manufactures confirmations. The bar is a quarter of the naive share, floored and capped
// at 50%, and the number is printed in the hypothesis text. The floor is MEASURED, not
// picked (bench/self-null.mjs, 2026-09-17): a delta moves the metrics it did not target
// through scheduling coupling alone, p95 of that spillover 0.8256% at 240 cells, 0.4525%
// at 800, 0.1259% at 1600 (two arms with no delta differ by exactly 0% on 450 readings).
// A bar under the spillover can be met by coupling, so propose() passes the floor for the
// organism's size from spillFloor() below. The default here is 0.5%, the band at 800 cells
// and above, for direct calls; the old 0.1% was under the spillover at every size.
export function barFrom(share, { keep = 0.25, floor = 0.005, cap = 0.5 } = {}) {
  return Math.min(cap, Math.max(floor, finite(share) * keep));
}

// The spillover p95 by organism size, as bench/self-null.mjs measured it on 2026-09-17
// (verdicts self-null.json, self-null-100.json, self-null-200.json): how far a delta moves
// the metrics it did not target, at the 95th percentile, when two arms with no delta
// differ by exactly 0%. It falls with size, and a flat floor is wrong at both ends: 0.1%
// is under the noise everywhere, and 0.5% at 1600 cells turned 2 real effects (above the
// noise there, under 0.5%) into undecided. Between measured sizes the floor is a straight
// line; outside them it is clamped to the nearest measured point.
export const SPILL_P95 = Object.freeze([[240, 0.008256], [800, 0.004525], [1600, 0.001259]]);
export function spillFloor(cells) {
  const pts = SPILL_P95;
  if (!Number.isFinite(cells) || cells <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (cells <= pts[i][0]) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      if (cells === x1) return y1; // a measured point is returned exactly, not through the line's rounding
      return y0 + ((y1 - y0) * (cells - x0)) / (x1 - x0);
    }
  }
  return pts[pts.length - 1][1];
}

// The prune batch's upper bound, scaled to the organism instead of held at a fixed number.
// The old bound was a flat 256, which is fine below 25,600 total edges (256 / 0.01) but
// stops moving the stale rate once the organism grows past it: the live soak crossed that
// line at roughly 128,740 edges and every round from then on pruned exactly 256 (batch =
// max(8, min(256, ceil(staleEdges * 0.02))), the min always landing on the fixed 256 side),
// the same two candidates every time, edges climbing by exactly +256/round while health
// held flat at 0.920188 for five rounds straight (scratchpad/soak-run4.log, rounds 29-33 at
// t=145001..165001; read into notes/self.md 2026-09-17). 1% of the organism's own edges is
// the rule that keeps pace once it outgrows the flat floor: below 25,600 edges it equals
// the old 256, above it it grows with the organism. The self.improve gate's maxEdges is
// armed with this same number (self/daemon.mjs) so an approved batch this large is not
// rejected by a policy still holding the old flat cap.
export const PRUNE_CAP_RULE = 'cap = max(256, ceil(edges * 0.01))';
export function pruneCap(edges, { keep = 0.01, floor = 256 } = {}) {
  return Math.max(floor, Math.ceil(finite(edges) * keep));
}

// ---------------------------------------------------------------- candidate keys
// Stable across rounds and across processes: the archive of refuted changes is keyed by
// this, so a refuted candidate is never tried twice (learning from mistakes).
export function candidateKey(delta) {
  switch (delta.kind) {
    case 'region.grow': case 'kind.mix': case 'skill.add':
      return delta.kind + ':' + delta.region + ':' + delta.cellKind + ':' + delta.count;
    case 'period.change': return 'period.change:' + delta.circuit + ':' + delta.to;
    case 'conduit.add': return 'conduit.add:' + delta.src + '->' + delta.dst;
    case 'conduit.prune': return 'conduit.prune:' + delta.edges.map(e => e.src + '->' + e.dst + ':' + e.srcPort + ':' + e.dstPort).sort().join(',');
    default: return delta.kind + ':' + JSON.stringify(delta);
  }
}

function candidate(delta, hyp, why, model) {
  return {
    key: candidateKey(delta),
    delta,
    hypothesis: hyp,
    why,
    from: model.seq,
    at: { t: model.t, gen: model.gen },
    before: readMetric(model, hyp.metric),
  };
}

// ---------------------------------------------------------------- the proposer
/**
 * Generate candidate changes to the brain itself from one self model.
 * @param {object} model         a self model from observe()
 * @param {import('../core/brain.mjs').Brain} brain  read for exemplar cells and ids only
 * @param {object} [opts]
 * @param {Set|Array} [opts.archive] keys already refuted or applied; never proposed again
 * @param {number} [opts.max]    how many candidates to return (highest pressure first)
 * @returns {object[]} candidates
 */
export function propose(brain, model, { archive = new Set(), max = 8, idleBar = 0.05, staleBar = 0.05, round: roundNo = 0, window = 48 } = {}) {
  const seen = archive instanceof Set ? archive : new Set(archive);
  const out = [];
  const names = Object.keys(model.regions);
  // every bar this round is floored at the measured spillover for an organism of this size
  const floor = spillFloor(finite(model.metrics && model.metrics.cells, NaN));
  const push = (c, pressure) => { if (!seen.has(c.key) && !out.some(o => o.key === c.key)) out.push({ ...c, pressure: round(pressure, 6) }); };

  // region pressure: silent cells, stale conduits, errors, and how little each region runs
  const runsPerCell = names.map(n => model.regions[n].runsPerCell);
  const meanRuns = runsPerCell.length ? runsPerCell.reduce((a, b) => a + b, 0) / runsPerCell.length : 0;

  for (const name of names) {
    const r = model.regions[name];

    // 1. SILENT CELLS -> shorten the period of the circuit holding them. A cell whose
    // period is longer than the observation window cannot be observed at all.
    if (r.idleRate > idleBar && r.cells > 0) {
      const circuit = slowestCircuit(brain, name);
      if (circuit) {
        // The new period must be observable INSIDE the trial window. Moving an hourly cell
        // to one second is invisible to a 32 tick trial: the cell still never fires, the
        // arms are identical, and the verdict is undecided for a change that may be right.
        // A candidate nobody can measure is not a candidate.
        const to = fasterPeriod(circuit.period, window);
        if (to !== null) {
          // the changed cells run circuit.period / to times as often, and they are
          // circuit.cells.size of the region's cells: that product is the predicted lift
          const share = (circuit.cells.size / r.cells) * (circuit.period / to - 1);
          push(candidate(
            { kind: 'period.change', circuit: circuit.key, region: name, from: circuit.period, to, cells: circuit.cells.size },
            hypothesis({ metric: 'region.' + name + '.runs', direction: 'up', ratio: 1 + barFrom(share, { keep: 0.1, floor }), why: circuit.cells.size + ' cells running ' + round(circuit.period / to, 3) + 'x more often' }),
            'region ' + name + ' has ' + r.idle + ' of ' + r.cells + ' cells that never ran (idleRate ' + r.idleRate + ')',
            model), 2 * r.idleRate + 0.5);
        }
      }
    }

    // 2. UNDER-RUNNING REGION -> grow it with more of the kind that already carries it.
    if (r.runsPerCell < meanRuns && r.cells > 0) {
      const kind = busiestKind(brain, name);
      if (kind) {
        const count = Math.max(1, Math.min(4, Math.round(r.cells * 0.02)));
        push(candidate(
          { kind: 'region.grow', region: name, cellKind: kind, count, circuit: 'self.grow.' + roundNo + '.' + name },
          hypothesis({ metric: 'region.' + name + '.runs', direction: 'up', ratio: 1 + barFrom(count / r.cells, { floor }), why: count + ' more cells of a kind that already fires here, on ' + r.cells + ' existing' }),
          'region ' + name + ' runs ' + r.runsPerCell + ' per cell against a brain mean of ' + round(meanRuns, 4),
          model), (meanRuns - r.runsPerCell) / Math.max(1e-9, meanRuns));
      }
    }

    // 3. KIND MIX -> a region running only a couple of kinds gets one more of its rarest.
    if (r.kindCount >= 2) {
      const kind = rarestKind(r);
      if (kind) {
        push(candidate(
          { kind: 'kind.mix', region: name, cellKind: kind, count: 1, circuit: 'self.mix.' + roundNo + '.' + name },
          hypothesis({ metric: 'region.' + name + '.fired', direction: 'up', ratio: 1 + barFrom(1 / r.cells, { floor }), why: 'a rarer kind widens what the region can answer' }),
          'region ' + name + ' holds ' + r.kindCount + ' kinds and only ' + r.kinds[kind] + ' cell(s) of ' + kind,
          model), 0.25);
      }
    }

    // 4. SKILL -> a kind the brain has elsewhere and this region does not have at all.
    const skill = missingKind(brain, model, name);
    if (skill) {
      push(candidate(
        { kind: 'skill.add', region: name, cellKind: skill, count: 1, circuit: 'self.skill.' + roundNo + '.' + name },
        hypothesis({ metric: 'region.' + name + '.runs', direction: 'up', ratio: 1 + barFrom(1 / r.cells, { floor }), why: 'a skill this region did not have, on ' + r.cells + ' existing cells' }),
        'region ' + name + ' has no ' + skill + ' cell and the rest of the brain does',
        model), 0.4);
    }

    // 5. STALE CONDUITS -> prune what has carried nothing.
    if (r.staleRate > staleBar && r.staleEdges > 0) {
      // Batch size is set by the measurement, not by taste: pruning p of the brain's S
      // stale conduits can move the stale rate by at most p/S, so a batch that is a
      // thousandth of S proposes a change nothing can detect. 2% of S, floor 8, cap
      // pruneCap(total edges): the old flat 256 stopped scaling once the organism grew
      // past 25,600 edges (see pruneCap's comment above; the fixed cap IS the measured
      // rate ceiling, not a coincidence of taste).
      const batch = Math.max(8, Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * 0.02)));
      const edges = staleEdgesOf(brain, name, batch);
      if (edges.length) {
        // pruning p of the brain's S stale conduits can lower the stale rate by at most p/S
        const share = edges.length / Math.max(1, model.metrics.staleEdges);
        push(candidate(
          { kind: 'conduit.prune', region: name, edges },
          hypothesis({ metric: 'self.staleRate', direction: 'down', ratio: 1 - barFrom(share, { floor }), why: 'a conduit that has carried nothing costs indexing and attention, ' + edges.length + ' of ' + model.metrics.staleEdges + ' stale' }),
          'region ' + name + ' holds ' + r.staleEdges + ' conduits that have carried nothing (staleRate ' + r.staleRate + ')',
          model), r.staleRate);
      }
    }
  }

  // 6. CROSS REGION CONDUIT: the busiest region reaches into the quietest one.
  const sorted = [...names].sort((a, b) => model.regions[b].runsPerCell - model.regions[a].runsPerCell);
  if (sorted.length >= 2) {
    const from = sorted[0], to = sorted[sorted.length - 1];
    const pair = crossPair(brain, from, to);
    if (pair) {
      push(candidate(
        { kind: 'conduit.add', region: to, src: pair.src, dst: pair.dst, srcPort: pair.srcPort, dstPort: pair.dstPort },
        // The claim is exact: ONE silent cell of the quiet region starts running, so the
        // count of cells that ran in that region goes up by one out of however many it has.
        hypothesis({ metric: 'region.' + to + '.active', direction: 'up', ratio: 1 + barFrom(1 / Math.max(1, model.regions[to].cells), { floor }), why: 'traffic from the busiest region wakes one silent cell of the quietest' }),
        'region ' + from + ' runs ' + model.regions[from].runsPerCell + ' per cell, ' + to + ' runs ' + model.regions[to].runsPerCell,
        model), 1.0);
    }
  }

  // 7. THE ASK REGION: the only candidates in this file graded on what the organism ANSWERS
  // rather than on how much of it is running. Two moves, both on conduits and neither on the
  // five cells themselves: reach out of the route into a memory or cognitive cell that can
  // carry the event, or cut a conduit of the route that carried nothing in the window. Both
  // are graded on suite.ask.accuracy, which act/region.mjs askSuite measures by asking the
  // exact items of the three answer suites through the region with provider null, so a trial
  // never opens a socket and never spends a model. The suite has to be MEASURED for either to
  // be gradeable: with no suite reading, readMetric returns null and a candidate whose before
  // is null is a candidate nobody can grade.
  if (model.regions[ASK_REGION] && brain.regions.has(ASK_REGION) && model.suites && model.suites[ASK_SUITE]) {
    const reach = askReach(brain);
    if (reach) {
      push(candidate(
        { kind: 'conduit.add', region: ASK_REGION, src: reach.src, dst: reach.dst, srcPort: reach.srcPort, dstPort: reach.dstPort },
        hypothesis({ metric: 'suite.' + ASK_SUITE + '.accuracy', direction: 'up', ratio: 1 + barFrom(1 / Math.max(1, model.regions[ASK_REGION].cells), { floor }), why: 'the route reaches ' + reach.dst + ', so what one question recalls is written where the next one can read it' }),
        'the ask region answers through ' + model.regions[ASK_REGION].cells + ' cells and reaches nothing outside itself',
        model), 0.9);
    }
    const dead = askDeadConduits(brain);
    if (dead.length) {
      // Ratio 1, which hypothesis() clamps to 1.0000001: the claim is that cutting a conduit
      // the route never used does not cost the exact suite anything. That is the same shape
      // block 5 uses for a stale prune, with the ask suite as the floor instead of staleRate.
      push(candidate(
        { kind: 'conduit.prune', region: ASK_REGION, edges: dead },
        hypothesis({ metric: 'suite.' + ASK_SUITE + '.accuracy', direction: 'up', ratio: 1, why: dead.length + ' conduit(s) this loop grew out of the route carried nothing in the window, and the exact suite must not fall when they go' }),
        'the ask route reaches out over ' + dead.length + ' conduit(s) that have carried nothing',
        model), 0.6);
    }
  }

  out.sort((a, b) => b.pressure - a.pressure);
  return out.slice(0, max).map((c, i) => ({ ...c, id: 'cand.' + roundNo + '.' + i }));
}

// ---------------------------------------------------------------- the ask region's two moves
// Named here rather than imported, so self/ does not pull act/ into every proposal round.
export const ASK_REGION = 'ask';
export const ASK_SUITE = 'ask';
// The two cells the route may reach OUT of, in the order they are tried. ask.in, ask.solve
// and ask.llm are not on this list: the door and the solver are upstream of everything the
// route knows, and the llm cell is act/llm.mjs, whose ports this file does not get to rewire.
export const ASK_SOURCES = Object.freeze(['ask.recall', 'ask.verify']);
export const ASK_TARGET_REGIONS = Object.freeze(['memory', 'cognitive']);

function askReach(brain) {
  for (const src of ASK_SOURCES) {
    if (!brain.byId.has(src)) continue;
    const a = brain.cell(src);
    for (const region of ASK_TARGET_REGIONS) {
      const r = brain.regions.get(region);
      if (!r) continue;
      // deterministic: the region's cells in the brain's own index order, first legal pair wins
      for (const idx of [...r.cells].sort((x, y) => x - y)) {
        const b = brain.cells[idx];
        const pp = brain.compatiblePorts(a, b);
        if (!pp) continue;
        if (brain.connectome.find(a.idx, b.idx, pp[0], pp[1]) >= 0) continue;
        return { src: a.id, dst: b.id, srcPort: pp[0], dstPort: pp[1] };
      }
    }
  }
  return null;
}

// The conduits this loop may cut, which are NEVER the seven the route is made of. The ask
// suite is measured on a CLONE (self/daemon.mjs askSuites), so on the live organism the seven
// founding conduits read usage 0 between one human question and the next: pruning by usage
// alone would propose deleting the whole route, and would propose it every round. A conduit
// out of an ask cell into a cell of ANOTHER region is one this loop grew itself, and that is
// the only kind a usage of 0 condemns.
function askDeadConduits(brain) {
  const cx = brain.connectome, out = [];
  for (const id of ['ask.in', 'ask.solve', 'ask.recall', 'ask.llm', 'ask.verify']) {
    if (!brain.byId.has(id)) continue;
    const c = brain.cell(id);
    for (const e of cx.outOf(c.idx)) {
      if (cx.flags[e] & PRUNED) continue;
      if (cx.usage[e] !== 0) continue;
      const dst = brain.cells[cx.dst[e]];
      if (dst.region === ASK_REGION) continue;
      out.push({ src: c.id, dst: dst.id, srcPort: cx.srcPort[e], dstPort: cx.dstPort[e] });
    }
  }
  return out;
}

// ---------------------------------------------------------------- helpers over the brain
// The fastest ladder period that is slower than nothing, faster than p, and fires at least
// four times inside `window` ticks. null when no such period exists.
export function fasterPeriod(p, window = Infinity) {
  if (p === 'event') return null;
  const ceiling = Number.isFinite(window) ? Math.floor(window / 4) : Infinity;
  if (ceiling < 1) return null;
  let best = null;
  for (const q of PERIOD_LADDER) if (q < p && q <= ceiling && (best === null || q > best)) best = q;
  return best;
}
function slowestCircuit(brain, region) {
  let best = null;
  for (const key of brain.regions.get(region).circuits) {
    const c = brain.circuits.get(key);
    if (!c || c.period === 'event') continue;
    const idle = [...c.cells].filter(idx => brain.cells[idx].stats.runs === 0).length;
    if (idle === 0) continue;
    if (!best || c.period > best.period) best = c;
  }
  return best;
}
function busiestKind(brain, region) {
  const runs = new Map();
  for (const idx of brain.regions.get(region).cells) {
    const c = brain.cells[idx];
    runs.set(c.kind, (runs.get(c.kind) || 0) + c.stats.runs);
  }
  let best = null, bestN = -1;
  for (const [k, n] of [...runs].sort((a, b) => (a[0] < b[0] ? -1 : 1))) if (n > bestN) { best = k; bestN = n; }
  return best;
}
function rarestKind(regionModel) {
  let best = null, bestN = Infinity;
  for (const [k, n] of Object.entries(regionModel.kinds).sort()) if (n < bestN) { best = k; bestN = n; }
  return best;
}
// The commonest kind elsewhere in the brain that this region does not have AND that can
// actually be wired to something here. A skill whose ports no cell of the region can meet
// is a cell that would arrive isolated, which the trial reports as inapplicable after
// paying for two clones: the check is cheaper than the trial.
function missingKind(brain, model, region) {
  const here = new Set(Object.keys(model.regions[region].kinds));
  const elsewhere = new Map();
  for (const [name, r] of Object.entries(model.regions)) {
    if (name === region) continue;
    for (const [k, n] of Object.entries(r.kinds)) if (!here.has(k)) elsewhere.set(k, (elsewhere.get(k) || 0) + n);
  }
  const ranked = [...elsewhere].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const pool = [...brain.regions.get(region).cells];
  for (const [kind] of ranked) {
    const ex = brain.cells.find(c => c.kind === kind);
    if (!ex) continue;
    if (pool.some(i => brain.compatiblePorts(brain.cells[i], ex) || brain.compatiblePorts(ex, brain.cells[i]))) return kind;
  }
  return null;
}
function staleEdgesOf(brain, region, limit) {
  const cx = brain.connectome, t = brain.clock.t, out = [];
  for (const idx of brain.regions.get(region).cells) {
    for (const e of cx.outOf(idx)) {
      // an edge already pruned is not a conduit any more: a clone does not carry it, and a
      // candidate that names it arrives at the trial as "none of the named conduits exist"
      if (cx.flags[e] & PRUNED) continue;
      if (cx.usage[e] !== 0) continue;
      if (t - (cx.lastT[e] < 0 ? 0 : cx.lastT[e]) < 64) continue;
      out.push({ src: brain.cells[cx.src[e]].id, dst: brain.cells[cx.dst[e]].id, srcPort: cx.srcPort[e], dstPort: cx.dstPort[e] });
      if (out.length >= limit) return out;
    }
  }
  return out;
}
// A legal (src, dst) pair between two regions, chosen deterministically: the busiest cell
// of `from` that has a port some cell of `to` accepts.
function crossPair(brain, from, to) {
  // the source must have FIRED (a cell that runs and emits nothing carries no traffic), and
  // the destination must be a silent event driven cell (one that mail can wake at all)
  const srcs = [...brain.regions.get(from).cells]
    .filter(i => brain.cells[i].stats.fired > 0)
    .sort((a, b) => brain.cells[b].stats.fired - brain.cells[a].stats.fired || a - b).slice(0, 16);
  const quiet = [...brain.regions.get(to).cells].filter(i => brain.cells[i].stats.runs === 0 && brain.cells[i].policy.period === 'event');
  const dsts = (quiet.length ? quiet : [...brain.regions.get(to).cells])
    .sort((a, b) => brain.cells[a].stats.runs - brain.cells[b].stats.runs || a - b).slice(0, 16);
  for (const a of srcs) for (const b of dsts) {
    if (a === b) continue;
    const pp = brain.compatiblePorts(brain.cells[a], brain.cells[b]);
    if (!pp) continue;
    if (brain.connectome.find(a, b, pp[0], pp[1]) >= 0) continue;
    return { src: brain.cells[a].id, dst: brain.cells[b].id, srcPort: pp[0], dstPort: pp[1] };
  }
  return null;
}

// ---------------------------------------------------------------- applying a delta
// ONE implementation, used on a trial clone and on the live brain, so what a trial
// measured is exactly what an approved change does. Never throws into the loop: a delta
// that cannot land returns { ok: false, reason }, which the trial records as inapplicable
// and the archive remembers so it is not tried again.
export function applyDelta(brain, delta, { by = 'self', w = 0.2, conf = 0.25 } = {}) {
  try {
    switch (delta.kind) {
      case 'region.grow': case 'kind.mix': case 'skill.add': return addCells(brain, delta, { by, w, conf });
      case 'period.change': return changePeriod(brain, delta);
      case 'conduit.add': return addConduit(brain, delta, { by, w, conf });
      case 'conduit.prune': return pruneConduits(brain, delta);
      default: return { ok: false, reason: 'unknown delta kind ' + delta.kind };
    }
  } catch (err) {
    return { ok: false, reason: String((err && err.message) || err) };
  }
}

function exemplarOf(brain, kind, region) {
  let fallback = null;
  for (const c of brain.cells) {
    if (c.kind !== kind) continue;
    if (c.region === region) return c;
    if (!fallback) fallback = c;
  }
  return fallback;
}

function addCells(brain, delta, { by, w, conf }) {
  const region = brain.regions.get(delta.region);
  if (!region) return { ok: false, reason: 'no region ' + delta.region };
  const ex = exemplarOf(brain, delta.cellKind, delta.region);
  if (!ex) return { ok: false, reason: 'no exemplar cell of kind ' + delta.cellKind };
  const added = [], wired = [];
  const pool = [...region.cells];
  for (let i = 0; i < delta.count; i++) {
    let id = delta.circuit + '.' + i, n = 0;
    while (brain.byId.has(id)) id = delta.circuit + '.' + i + '_' + (++n);
    const cell = brain.addCell({
      id, kind: delta.cellKind, region: delta.region, circuit: delta.circuit,
      params: JSON.parse(JSON.stringify(ex.params)),
      policy: { ...ex.policy },
    });
    added.push(cell.id);
    // one afferent and one efferent, both legal by compatiblePorts, both deterministic
    let inWired = false, outWired = false;
    for (const idx of pool) {
      const other = brain.cells[idx];
      if (!inWired) { const pp = brain.compatiblePorts(other, cell); if (pp) { wired.push(brain.connect(other.id, pp[0], cell.id, pp[1], { w, conf, by })); inWired = true; } }
      if (!outWired) { const pp = brain.compatiblePorts(cell, other); if (pp) { wired.push(brain.connect(cell.id, pp[0], other.id, pp[1], { w, conf, by })); outWired = true; } }
      if (inWired && outWired) break;
    }
    if (!inWired && !outWired) return { ok: false, reason: 'cell ' + id + ' has no compatible port in region ' + delta.region, added, wired };
  }
  return { ok: true, added, wired, cells: added.length, edges: wired.length };
}

function changePeriod(brain, delta) {
  const circuit = brain.circuits.get(delta.circuit);
  if (!circuit) return { ok: false, reason: 'no circuit ' + delta.circuit };
  if (!(Number.isInteger(delta.to) && delta.to >= 1)) return { ok: false, reason: 'period must be a positive integer' };
  const changed = [];
  for (const idx of circuit.cells) {
    const cell = brain.cells[idx];
    if (cell.policy.period === 'event' || cell.policy.period === delta.to) continue;
    brain.clock.unregister(cell);
    changed.push({ cell: cell.id, from: cell.policy.period, to: delta.to });
    cell.policy.period = delta.to;
    brain.clock.register(cell);
  }
  circuit.period = delta.to;
  if (changed.length === 0) return { ok: false, reason: 'no periodic cell in ' + delta.circuit + ' to change' };
  return { ok: true, changed, cells: changed.length, edges: 0 };
}

function addConduit(brain, delta, { by, w, conf }) {
  if (!brain.byId.has(delta.src) || !brain.byId.has(delta.dst)) return { ok: false, reason: 'conduit endpoint not in this brain' };
  const a = brain.cell(delta.src), b = brain.cell(delta.dst);
  const sp = delta.srcPort ?? 0, dp = delta.dstPort ?? 0;
  if (brain.connectome.find(a.idx, b.idx, sp, dp) >= 0) return { ok: false, reason: 'conduit already exists' };
  const e = brain.connect(delta.src, sp, delta.dst, dp, { w, conf, by });
  return { ok: true, wired: [e], cells: 0, edges: 1 };
}

function pruneConduits(brain, delta) {
  const cx = brain.connectome, pruned = [];
  for (const spec of delta.edges) {
    if (!brain.byId.has(spec.src) || !brain.byId.has(spec.dst)) continue;
    const e = cx.find(brain.cell(spec.src).idx, brain.cell(spec.dst).idx, spec.srcPort, spec.dstPort);
    if (e < 0) continue;
    cx.prune(e);
    brain.stats.pruned++;
    pruned.push({ ...spec, e });
  }
  if (pruned.length === 0) return { ok: false, reason: 'none of the named conduits exist here' };
  return { ok: true, pruned, cells: 0, edges: pruned.length };
}

// A one line description a human can read in the ledger and the daemon log.
export function deltaLine(delta) {
  switch (delta.kind) {
    case 'region.grow': case 'kind.mix': case 'skill.add':
      return delta.kind + ' ' + delta.region + ' +' + delta.count + ' ' + delta.cellKind;
    case 'period.change': return 'period.change ' + delta.circuit + ' ' + delta.from + ' -> ' + delta.to;
    case 'conduit.add': return 'conduit.add ' + delta.src + ' -> ' + delta.dst;
    case 'conduit.prune': return 'conduit.prune ' + delta.edges.length + ' stale in ' + delta.region;
    default: return delta.kind;
  }
}

export const UNUSED = Object.freeze({ finite });
