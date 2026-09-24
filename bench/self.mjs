// bench/self.mjs: THE SELF IMPROVING LOOP, MEASURED. Grows a medium organism
// (seeds/organism.mjs at 200 majors), runs self/daemon.mjs unattended for --minutes, and
// writes bench/verdicts/self.json with every number the daemon printed: rounds,
// candidates, confirmed, refuted, undecided, inapplicable, applied, rejected, the metric
// before and after, and the stop rule with its numbers.
//
// The verdict is not "the loop improved the brain". It is four things a command can check:
//   1. the loop ran and observed itself at least once
//   2. every applied change went through the gate (approvals >= applications)
//   3. every applied change traces back through the ledger to the observation that
//      produced it (apply -> trial -> observe)
//   4. nothing was applied that the gate did not approve
// A run that confirms nothing is still GREEN: a plateau is a measurement, not a failure.
//
// usage: node bench/self.mjs [--minutes 3] [--majors 200] [--candidates 6] [--plateau 3]
//                            [--ticks 32] [--apply 1|all] [--seed organism] [--quiet]
//
// --throttle: instead of the single run above, grows TWO organisms from the SAME seed
// (seeds/organism.mjs, --majors, default 200) and runs self/daemon.mjs on each for
// --minutes (default 2) per arm, one arm capped at --apply 1 (the old one-change-per-round
// behaviour), the other at --apply all (every confirmed candidate whose region is distinct
// from the others already submitted that round, self/daemon.mjs's new default). Writes
// bench/verdicts/self-throttle.json with, per arm: rounds, candidates, confirmed, applied,
// edges before and after each round, health before and after, ms per round, and the same
// approval/trace checks bench/self.mjs already runs. Does not touch self.json.
//   node bench/self.mjs --throttle [--minutes 2] [--majors 200] [--seed organism]
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOrganism } from '../seeds/organism.mjs';
import { SelfDaemon } from '../self/daemon.mjs';
import { observe, observeLine } from '../self/observe.mjs';
import { PRUNE_CAP_RULE } from '../self/propose.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const flag = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  if (i < 0) return dflt;
  const v = argv[i + 1];
  return v === undefined || v.startsWith('--') ? true : (typeof dflt === 'number' ? Number(v) : v);
};
const quiet = argv.includes('--quiet');
// '1' | '2' | ... a number of confirmed changes per round; 'all' every distinct-region
// confirmed candidate (self/daemon.mjs's new default, no count cap in practice).
const parseApply = (v) => (v === 'all' ? Infinity : Number(v));

// ---------------------------------------------------------------- the checks both runs share
// recorded when each change landed, not re-walked now: the ledger ring is finite
function checksFor(report, gate) {
  const traces = report.traces;
  const untraceable = traces.filter(t => !t.reachedObservation).length;
  return [
    { name: 'observed', ok: report.totals.rounds > 0, got: report.totals.rounds, want: '> 0 rounds' },
    { name: 'gate.approved.covers.applied', ok: gate.approved >= report.totals.applied, got: gate.approved + ' approved / ' + report.totals.applied + ' applied', want: 'approved >= applied' },
    { name: 'every.application.traceable', ok: untraceable === 0, got: (traces.length - untraceable) + '/' + traces.length + ' reach their observation', want: 'all' },
    { name: 'no.application.without.approval', ok: report.totals.applied <= gate.approved, got: report.totals.applied, want: '<= ' + gate.approved },
    { name: 'archive.remembers.refutations', ok: report.archive.size >= report.totals.refuted, got: report.archive.size + ' archived / ' + report.totals.refuted + ' refuted', want: 'archive >= refuted' },
  ];
}

// ---------------------------------------------------------------- the single run (self.json)
async function runSingle() {
  const minutes = flag('minutes', 3);
  const majors = flag('majors', 200);
  const candidates = flag('candidates', 6);
  const plateau = flag('plateau', 3);
  const trialTicks = flag('ticks', 32);
  const applyPerRound = parseApply(flag('apply', 1));
  const seed = flag('seed', 'organism');
  const stateDir = path.join(ROOT, 'state', 'self', 'bench');

  const t0 = Date.now();
  const brain = buildOrganism({ majors, seed, name: 'self-bench', ledger: 'runs', ledgerRing: 400_000 });
  const built = Date.now() - t0;
  brain.tick(64);

  const first = observe(brain, { log: false });
  if (!quiet) {
    console.log(`organism: ${majors} majors, ${brain.cells.length} cells, ${brain.connectome.size()} edges, built in ${built}ms`);
    console.log('before: ' + observeLine(first));
  }

  const daemon = new SelfDaemon(brain, {
    minutes, plateau, candidates, trialTicks, applyPerRound, liveTicks: 64,
    dir: stateDir, log: quiet ? false : undefined,
  });
  const report = await daemon.run();

  const gate = brain.gate.stats;
  const checks = checksFor(report, gate);
  const verdict = checks.every(c => c.ok) ? 'GREEN' : 'RED';

  const last = observe(brain, { log: false });
  const out = {
    at: new Date().toISOString(), node: process.version,
    args: { minutes, majors, candidates, plateau, trialTicks, applyPerRound: applyPerRound === Infinity ? 'all' : applyPerRound, seed },
    organism: { majors, cells: brain.cells.length, edges: brain.connectome.size(), buildMs: built },
    before: { health: first.health, runsPerTick: first.metrics.runsPerTick, idleCells: first.metrics.idleCells, staleEdges: first.metrics.staleEdges, cells: first.metrics.cells, edges: first.metrics.edges },
    after: { health: last.health, runsPerTick: last.metrics.runsPerTick, idleCells: last.metrics.idleCells, staleEdges: last.metrics.staleEdges, cells: last.metrics.cells, edges: last.metrics.edges },
    totals: report.totals,
    metric: report.metric,
    applied: report.applied,
    rounds: report.rounds,
    archive: report.archive,
    gate,
    traces: report.traces,
    stop: report.stop,
    elapsedMs: report.elapsedMs,
    checks, verdict,
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'self.json'), JSON.stringify(out, null, 2));

  const t = report.totals;
  console.log(`\nSELF ${verdict}: rounds ${t.rounds}, candidates ${t.candidates}, confirmed ${t.confirmed}, refuted ${t.refuted}, undecided ${t.undecided}, inapplicable ${t.inapplicable}, applied ${t.applied}, rejected by the gate ${t.rejected}, health ${report.metric.before} -> ${report.metric.after} (${report.metric.delta}), cells ${out.before.cells} -> ${out.after.cells}, edges ${out.before.edges} -> ${out.after.edges}, stop ${report.stop.reason}: ${report.stop.text}, ${report.elapsedMs}ms`);
  for (const c of checks) if (!c.ok) console.log(`FAIL ${c.name}: got ${c.got}, want ${c.want}`);
  process.exit(verdict === 'GREEN' ? 0 : 1);
}

// ---------------------------------------------------------------- the two-arm run (self-throttle.json)
async function runThrottle() {
  const minutes = flag('minutes', 2);
  const majors = flag('majors', 200);
  const candidates = flag('candidates', 6);
  const plateau = flag('plateau', 3);
  const trialTicks = flag('ticks', 32);
  const seed = flag('seed', 'organism');

  const arms = [
    { label: 'apply1', applyPerRound: 1 },
    { label: 'applyAll', applyPerRound: Infinity },
  ];
  const results = [];
  for (const a of arms) {
    const t0 = Date.now();
    // same seed, same majors: both arms start from a structurally identical organism
    // (buildOrganism's own doc: "the whole organism is a function of [seed]"). They
    // diverge only from here, by what applyPerRound lets each one land.
    const brain = buildOrganism({ majors, seed, name: 'self-throttle-' + a.label, ledger: 'runs', ledgerRing: 400_000 });
    const built = Date.now() - t0;
    brain.tick(64);
    const first = observe(brain, { log: false });
    if (!quiet) console.log(`[${a.label}] organism: ${majors} majors, ${brain.cells.length} cells, ${brain.connectome.size()} edges, built in ${built}ms`);

    const dir = path.join(ROOT, 'state', 'self', 'throttle', a.label);
    const daemon = new SelfDaemon(brain, {
      minutes, plateau, candidates, trialTicks, applyPerRound: a.applyPerRound, liveTicks: 64,
      dir, log: quiet ? false : (l) => console.log(`[${a.label}] ${l}`),
    });
    const report = await daemon.run();
    const last = observe(brain, { log: false });

    const gate = brain.gate.stats;
    const checks = checksFor(report, gate);
    const armVerdict = checks.every(c => c.ok) ? 'GREEN' : 'RED';

    // edges before round N is edges after round N-1 (the organism's own initial edge
    // count for round 1): each row of report.rounds only carries its OWN "after", so the
    // "before" of the next round is read off the previous row rather than re-measured.
    let prevEdges = first.metrics.edges;
    const rounds = report.rounds.map((r) => {
      const edgesBefore = prevEdges;
      prevEdges = r.edges;
      return {
        round: r.round, candidates: r.candidates, confirmed: r.confirmed, applied: r.applied,
        edgesBefore, edgesAfter: r.edges, healthBefore: r.healthBefore, healthAfter: r.healthAfter, ms: r.ms,
      };
    });

    results.push({
      label: a.label, applyPerRound: a.applyPerRound === Infinity ? 'all' : a.applyPerRound,
      organism: { majors, cells: brain.cells.length, edges: brain.connectome.size(), buildMs: built },
      before: { health: first.health, edges: first.metrics.edges, staleEdges: first.metrics.staleEdges, cells: first.metrics.cells },
      after: { health: last.health, edges: last.metrics.edges, staleEdges: last.metrics.staleEdges, cells: last.metrics.cells },
      totals: report.totals, metric: report.metric, rounds,
      gate, checks, verdict: armVerdict, stop: report.stop, elapsedMs: report.elapsedMs,
    });
    if (!quiet) {
      const t = report.totals;
      console.log(`[${a.label}] ${armVerdict}: rounds ${t.rounds}, candidates ${t.candidates}, confirmed ${t.confirmed}, applied ${t.applied}, health ${report.metric.before} -> ${report.metric.after}, edges ${first.metrics.edges} -> ${last.metrics.edges}, ${report.elapsedMs}ms`);
    }
  }

  const verdict = results.every(r => r.verdict === 'GREEN') ? 'GREEN' : 'RED';
  const out = {
    at: new Date().toISOString(), node: process.version,
    args: { minutes, majors, candidates, plateau, trialTicks, seed },
    rule: { prune: PRUNE_CAP_RULE },
    arms: results,
    verdict,
  };
  mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
  writeFileSync(path.join(HERE, 'verdicts', 'self-throttle.json'), JSON.stringify(out, null, 2));

  console.log(`\nSELF-THROTTLE ${verdict}`);
  for (const r of results) {
    console.log(`  ${r.label} (apply ${r.applyPerRound}) ${r.verdict}: rounds ${r.totals.rounds}, candidates ${r.totals.candidates}, confirmed ${r.totals.confirmed}, applied ${r.totals.applied}, health ${r.metric.before} -> ${r.metric.after}, edges ${r.before.edges} -> ${r.after.edges}`);
    for (const c of r.checks) if (!c.ok) console.log(`  FAIL [${r.label}] ${c.name}: got ${c.got}, want ${c.want}`);
  }
  process.exit(verdict === 'GREEN' ? 0 : 1);
}

if (argv.includes('--throttle')) await runThrottle();
else await runSingle();
