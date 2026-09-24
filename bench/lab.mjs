// bench/lab.mjs: THE RESEARCH INSTRUMENT, GRADED AS AN INSTRUMENT.
//
// A lab is only worth its verdicts if the same seeds give the same numbers, so this bench
// does not read lab/verdicts/*.json and repeat what it finds. It RE-RUNS every shipped
// experiment into a throwaway directory and compares the fresh numbers against the ones on
// disk, seed by seed. A verdict that cannot be reproduced is the loudest row in the table.
// Then it records a brain, replays it, tampers with one cell and replays again, so the
// determinism check is shown catching a divergence rather than asserted to work. Then it
// prices the fixed task list and counts the external API calls at every outbound door.
//
// Writes bench/verdicts/lab.json. Exit code is the verdict: 0 only when every experiment
// reproduced, the clean replay was deterministic, the tampered replay diverged, and the
// network counter read zero.
//
//   node bench/lab.mjs [--quiet] [--json] [--ticks N] [--skip-cost]
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Brain } from '../core/brain.mjs';
import '../cells/index.mjs';
import { run, readVerdict, VERDICTS_DIR } from '../lab/experiment.mjs';
import { EXPERIMENT_NAMES, loadExperiment } from '../lab/experiments/index.mjs';
import { record, replay } from '../lab/replay.mjs';
import { measureCost } from '../lab/cost.mjs';
import { renderTable, parseArgs } from '../tools/lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(HERE, 'verdicts', 'lab.json');

const round = (x, d = 6) => (typeof x === 'number' && Number.isFinite(x) ? Math.round(x * 10 ** d) / 10 ** d : x);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- 1. reproduction
// Every field checked here is one the verdict was graded on. `at` and `wallMs` are a clock
// reading and a stopwatch reading, so they are reported and never compared.
const GRADED = ['verdict', 'k', 'metric'];

async function reproduce(name, { verdictsDir }) {
  const shipped = readVerdict(name, VERDICTS_DIR);
  const exp = await loadExperiment(name);
  const t0 = performance.now();
  const fresh = await run(exp, { verdictsDir });
  const wallMs = round(performance.now() - t0, 1);

  const mismatches = [];
  for (const k of GRADED) if (shipped[k] !== fresh[k]) mismatches.push(k + ' shipped ' + shipped[k] + ' fresh ' + fresh[k]);
  for (const k of ['mean', 'sd', 'median', 'min', 'max', 'wins', 'losses', 'ties']) {
    if (shipped.effect[k] !== fresh.effect[k]) mismatches.push('effect.' + k + ' shipped ' + shipped.effect[k] + ' fresh ' + fresh.effect[k]);
  }
  for (const k of ['share', 'reverse', 'mode', 'draws']) {
    if (shipped.permutation[k] !== fresh.permutation[k]) mismatches.push('permutation.' + k + ' shipped ' + shipped.permutation[k] + ' fresh ' + fresh.permutation[k]);
  }
  for (const arm of ['treatment', 'control']) {
    if (!same(shipped[arm].values, fresh[arm].values)) mismatches.push(arm + ' per seed values differ');
  }
  if (!same(shipped.seeds, fresh.seeds)) mismatches.push('seed list differs');
  // The hash names the code the shipped verdict graded. A mismatch means the mechanism was
  // edited after the verdict was written, which is a stale verdict even if the numbers agree.
  for (const k of ['mechanism', 'control', 'measure', 'build']) {
    if (shipped.source[k] !== fresh.source[k]) mismatches.push('source.' + k + ' hash differs (the code moved since the verdict was written)');
  }

  return {
    name,
    verdict: fresh.verdict,
    metric: fresh.metric,
    seeds: fresh.k,
    treatmentMean: fresh.treatment.mean,
    controlMean: fresh.control.mean,
    effectMean: fresh.effect.mean,
    effectMin: fresh.effect.min,
    effectMax: fresh.effect.max,
    minEffect: fresh.hypothesis.minEffect,
    direction: fresh.hypothesis.direction,
    wins: fresh.effect.wins,
    losses: fresh.effect.losses,
    ties: fresh.effect.ties,
    share: fresh.permutation.share,
    reverse: fresh.permutation.reverse,
    alpha: fresh.bar.alpha,
    permMode: fresh.permutation.mode,
    permDraws: fresh.permutation.draws,
    refusedCrossings: fresh.isolation.refusedCrossings,
    undeclaredCrossings: fresh.isolation.undeclaredCrossings,
    mechanismHash: fresh.source.mechanism,
    shippedAt: shipped.at,
    shippedWallMs: shipped.wallMs,
    wallMs,
    reproduced: mismatches.length === 0,
    mismatches,
  };
}

// ---------------------------------------------------------------- 2. replay
// A brain with real traffic: five event cells in region a fanning into one sink in region b,
// fed a 40 item stream. Growth and pruning are off so the organism the replay rebuilds is
// the organism that was recorded (the co-activation counters are not in a snapshot, see
// notes/lab.md request 2).
function probeBrain(dir) {
  const b = new Brain({ name: 'bench.probe', seed: 'bench.probe', dir, ledger: 'full', growth: { enabled: false }, pruneEvery: 0 });
  b.addRegion('a', { doc: 'the stream' });
  b.addRegion('b', { doc: 'the sink' });
  b.addCell({ id: 'a.in', kind: 'event.filter', region: 'a', circuit: 'c', params: { field: 'k', values: [0, 1, 2, 3] }, policy: { period: 'event' } });
  for (let i = 0; i < 4; i++) b.addCell({ id: 'a.s' + i, kind: 'event.filter', region: 'a', circuit: 'c', params: { field: 'k', value: i }, policy: { period: 'event' } });
  b.addCell({ id: 'b.log', kind: 'sink.log', region: 'b', circuit: 'w', policy: { period: 'event' } });
  for (let i = 0; i < 4; i++) b.connect('a.in', 'out', 'a.s' + i, 'in');
  for (let i = 0; i < 4; i++) b.connect('a.s' + i, 'out', 'b.log', 'in');
  for (let i = 0; i < 40; i++) b.inject('a.in', 'in', { kind: 'event', data: { k: i % 4 } }, { delay: i + 1 });
  return b;
}

function replayCheck(ticks) {
  const dir = mkdtempSync(path.join(tmpdir(), 'bench-lab-replay-'));
  try {
    const brain = probeBrain(dir);
    const manifest = record(brain, dir, { ticks });
    const clean = replay(dir, { ticks });
    // The same recording, replayed by a brain whose s2 cell was changed after the snapshot
    // was restored and before the first tick. The recording on disk is untouched, so this
    // is the determinism check being shown catching a divergence, not asserted to work.
    const tampered = replay(dir, { ticks, tamper: (b) => { const c = b.cell('a.s2'); if (c) c.params.value = 9; } });
    return {
      ticks,
      recordedEvents: manifest.events,
      coactPending: manifest.coactPending,
      clean: {
        ok: clean.ok, referenceEvents: clean.referenceEvents, replayedEvents: clean.replayedEvents, compared: clean.compared,
        cellRuns: clean.cellRuns, signals: clean.signals, runOrderMatch: clean.runOrderMatch,
        outputHashesMatch: clean.outputHashesMatch, fingerprint: clean.fingerprint, fingerprintMatch: clean.fingerprintMatch,
        divergence: clean.divergence, wallMs: clean.wallMs,
      },
      tampered: {
        ok: tampered.ok, referenceEvents: tampered.referenceEvents, replayedEvents: tampered.replayedEvents, compared: tampered.compared,
        cellRuns: tampered.cellRuns, signals: tampered.signals, fingerprint: tampered.fingerprint, fingerprintMatch: tampered.fingerprintMatch,
        divergence: tampered.divergence, wallMs: tampered.wallMs,
      },
      caught: tampered.divergence !== null,
    };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

// ---------------------------------------------------------------- the bench
export async function runBench({ quiet = false, ticks = 30, skipCost = false } = {}) {
  const t0 = performance.now();
  const verdictsDir = mkdtempSync(path.join(tmpdir(), 'bench-lab-verdicts-'));
  let experiments = [];
  try {
    for (const name of EXPERIMENT_NAMES) experiments.push(await reproduce(name, { verdictsDir }));
  } finally { rmSync(verdictsDir, { recursive: true, force: true }); }

  const rep = replayCheck(ticks);
  // write: false on purpose. bench/verdicts/cost.json belongs to `node lab/cost.mjs`, which
  // runs the task list in a process that did nothing else. This process already ran three
  // experiments and a replay, and process.resourceUsage().maxRSS is a process lifetime peak,
  // so the peak memory measured here is the bench's, not the task list's. Everything else in
  // the row (cpu, wall, solved) is per task and is comparable.
  const cost = skipCost ? null : await measureCost({ write: false });

  const reproduced = experiments.filter((e) => e.reproduced).length;
  const counts = { confirmed: 0, refuted: 0, undecided: 0 };
  for (const e of experiments) counts[e.verdict] = (counts[e.verdict] || 0) + 1;
  const ok = reproduced === experiments.length && rep.clean.ok && rep.caught
    && (!cost || cost.external.networkCalls === 0);

  const verdict = {
    at: new Date().toISOString(), node: process.version, platform: process.platform, arch: process.arch,
    experiments, reproduced, experimentsTotal: experiments.length, counts,
    replay: rep,
    cost: cost ? {
      file: cost.file || null,
      tasks: cost.tasks.map((t) => ({ task: t.task, doc: t.doc, n: t.n, solved: t.solved, accuracy: t.accuracy, cpuMs: t.cpuMs, wallMs: t.wallMs, cpuMsPerSolved: t.cpuMsPerSolved, detail: t.detail })),
      total: cost.total, external: cost.external,
    } : null,
    wallMs: round(performance.now() - t0, 1),
    verdict: ok ? 'GREEN' : 'RED',
  };
  mkdirSync(path.dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(verdict, null, 2));
  verdict.file = OUT;

  if (!quiet) console.log(render(verdict));
  return verdict;
}

export function render(v) {
  const L = [];
  L.push('');
  L.push('lab  ' + v.node + '  ' + v.platform + '/' + v.arch);
  L.push('');
  L.push('experiments re-run from their own mechanism source, then compared to lab/verdicts/ seed by seed');
  L.push(renderTable([
    { key: 'name', label: 'experiment', width: 16 },
    { key: 'verdict', label: 'verdict', width: 9 },
    { key: 'metric', label: 'metric', width: 18 },
    { key: 'seeds', label: 'seeds', width: 5, align: 'r' },
    { key: 'treatmentMean', label: 'treatment', width: 10, align: 'r' },
    { key: 'controlMean', label: 'control', width: 10, align: 'r' },
    { key: 'effectMean', label: 'effect', width: 10, align: 'r' },
    { key: 'bar', label: 'bar', width: 12, align: 'r' },
    { key: 'pairs', label: 'w/l/t', width: 8, align: 'r' },
    { key: 'share', label: 'share', width: 9, align: 'r' },
    { key: 'reverse', label: 'reverse', width: 9, align: 'r' },
    { key: 'reproduced', label: 'reproduced', width: 10 },
    { key: 'wallMs', label: 'ms', width: 8, align: 'r' },
  ], v.experiments.map((e) => ({
    ...e,
    treatmentMean: e.treatmentMean.toFixed(6),
    controlMean: e.controlMean.toFixed(6),
    effectMean: e.effectMean.toFixed(6),
    bar: (e.direction === 'increase' ? '+' : '-') + e.minEffect + ' a' + e.alpha,
    pairs: e.wins + '/' + e.losses + '/' + e.ties,
    share: e.share.toFixed(6),
    reverse: e.reverse.toFixed(6),
    reproduced: e.reproduced ? 'yes' : 'NO',
  }))));
  for (const e of v.experiments) {
    if (!e.reproduced) for (const m of e.mismatches) L.push('  ' + e.name + ' MISMATCH ' + m);
  }
  L.push('');
  L.push('  verdicts: confirmed ' + (v.counts.confirmed || 0) + ', refuted ' + (v.counts.refuted || 0) + ', undecided ' + (v.counts.undecided || 0)
    + ' of ' + v.experimentsTotal + '; reproduced ' + v.reproduced + '/' + v.experimentsTotal);
  L.push('  isolation: refused crossings ' + v.experiments.reduce((a, e) => a + e.refusedCrossings, 0)
    + ', undeclared crossings left ' + v.experiments.reduce((a, e) => a + e.undeclaredCrossings, 0));
  L.push('');
  L.push('replay of a recorded organism, and the same replay with one cell parameter changed');
  L.push(renderTable([
    { key: 'run', label: 'run', width: 10 },
    { key: 'events', label: 'events ref/replay', width: 18, align: 'r' },
    { key: 'compared', label: 'compared', width: 9, align: 'r' },
    { key: 'runs', label: 'cell.run ref/replay', width: 20, align: 'r' },
    { key: 'signals', label: 'signals ref/replay', width: 18, align: 'r' },
    { key: 'fp', label: 'fingerprint match', width: 18 },
    { key: 'where', label: 'first divergence', width: 34 },
  ], [
    { run: 'clean', events: v.replay.clean.referenceEvents + '/' + v.replay.clean.replayedEvents, compared: v.replay.clean.compared,
      runs: v.replay.clean.cellRuns.reference + '/' + v.replay.clean.cellRuns.replayed,
      signals: v.replay.clean.signals.reference + '/' + v.replay.clean.signals.replayed,
      fp: String(v.replay.clean.fingerprintMatch), where: v.replay.clean.divergence ? whereOf(v.replay.clean.divergence) : 'none' },
    { run: 'tampered', events: v.replay.tampered.referenceEvents + '/' + v.replay.tampered.replayedEvents, compared: v.replay.tampered.compared,
      runs: v.replay.tampered.cellRuns.reference + '/' + v.replay.tampered.cellRuns.replayed,
      signals: v.replay.tampered.signals.reference + '/' + v.replay.tampered.signals.replayed,
      fp: String(v.replay.tampered.fingerprintMatch), where: v.replay.tampered.divergence ? whereOf(v.replay.tampered.divergence) : 'NONE, the check is blind' },
  ]));
  L.push('  ' + v.replay.ticks + ' ticks recorded, ' + v.replay.recordedEvents + ' ledger events, co-activation counters pending at snapshot ' + v.replay.coactPending);
  L.push('  clean replay deterministic ' + v.replay.clean.ok + ', tampered replay caught ' + v.replay.caught);
  if (v.cost) {
    L.push('');
    L.push('cost of a fixed task list, and the external API calls counted at every outbound door');
    L.push(renderTable([
      { key: 'task', label: 'task', width: 10 },
      { key: 'n', label: 'n', width: 6, align: 'r' },
      { key: 'solved', label: 'solved', width: 7, align: 'r' },
      { key: 'accuracy', label: 'accuracy', width: 9, align: 'r' },
      { key: 'cpuMs', label: 'cpu ms', width: 9, align: 'r' },
      { key: 'wallMs', label: 'wall ms', width: 10, align: 'r' },
      { key: 'cpuMsPerSolved', label: 'cpu ms/solved', width: 14, align: 'r' },
      { key: 'detail', label: 'what it counted', width: 62 },
    ], v.cost.tasks.map((t) => ({ ...t, accuracy: Number(t.accuracy).toFixed(4), wallMs: Number(t.wallMs).toFixed(3), detail: JSON.stringify(t.detail) }))));
    L.push('  totals: ' + v.cost.total.solved + '/' + v.cost.total.n + ' solved, cpu ' + v.cost.total.cpuMs + ' ms, wall '
      + v.cost.total.wallMs + ' ms, peak memory ' + v.cost.total.peakRssMB + ' MB, '
      + v.cost.total.cpuMsPerSolvedTask + ' cpu ms per solved task');
    L.push('  cpu clock resolution ' + v.cost.total.cpuResolutionMs + ' ms measured in ' + v.cost.total.cpuResolutionSpins
      + ' spins, so a row printing 0 cpu ms cost less than this, not nothing');
    L.push('  peak memory is a process lifetime peak and this process also ran the experiments above:'
      + ' the task list on its own is bench/verdicts/cost.json, written by node lab/cost.mjs');
    L.push('  external API tokens ' + v.cost.external.apiTokens + ', network calls ' + v.cost.external.networkCalls
      + ' ' + JSON.stringify(v.cost.external.byDoor) + ', dependencies ' + v.cost.external.dependencies);
  }
  L.push('');
  return L.join('\n');
}
function whereOf(d) { return 'event ' + d.index + ' t' + d.tick + ' ' + d.cell + '#' + d.port + ' ' + d.field; }

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  const v = await runBench({ quiet: !!a.opts.quiet, ticks: a.opts.ticks ? Number(a.opts.ticks) : 30, skipCost: !!a.opts['skip-cost'] });
  if (a.opts.json) console.log(JSON.stringify(v, null, 2));
  console.log('LAB ' + v.verdict + ': experiments ' + v.experimentsTotal + ' (confirmed ' + (v.counts.confirmed || 0)
    + ', refuted ' + (v.counts.refuted || 0) + ', undecided ' + (v.counts.undecided || 0) + '), reproduced '
    + v.reproduced + '/' + v.experimentsTotal + ', replay deterministic ' + v.replay.clean.ok
    + ', tamper caught ' + v.replay.caught
    + (v.cost ? ', cost per solved task ' + v.cost.total.cpuMsPerSolvedTask + ' cpu ms over ' + v.cost.total.n + ' tasks, external API calls ' + v.cost.external.networkCalls : '')
    + ', ' + v.wallMs + ' ms, verdict written to bench/verdicts/lab.json');
  process.exit(v.verdict === 'GREEN' ? 0 : 1);
}
