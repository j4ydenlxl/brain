#!/usr/bin/env node
// lab/compare.mjs : COMPARE VERSIONS. His manual asks for exactly this verb next to replay:
// "pause computation, inspect state, replay events, compare versions, analyze connectivity".
// tools/diff.mjs already answers "what changed structurally between two snapshots", and this
// file does not repeat it: it CALLS it, and adds the three things a research comparison
// needs that a structural diff does not carry.
//
//   structure        cells added and removed, edges added, pruned, dormancy changes, weight
//                    drift. Straight from tools/diff.mjs diffSnapshots(a, b).
//   per-region runs  where the computation actually went, per region, from the per-cell
//                    counters core keeps (cell.stats.runs / fired / skips), so a routing
//                    change is visible as a shift in run counts and not only as a metric.
//   error curves     the prediction error each cell published over time. core/brain.mjs
//                    writes `surprise` on every cell.run ledger event, so the curve is read
//                    off the ledger rather than recomputed, and the two runs are bucketed
//                    on the SAME tick grid so the curves are comparable point by point.
//
// Two runs or two snapshots: compareStates(dirA, dirB) reads two state dirs from disk,
// compareBrains(a, b) takes two live Brain objects that are still in memory.
//
// Usage: node lab/compare.mjs <a: snapshot-or-dir> <b: snapshot-or-dir> [--buckets N] [--json]
import { fileURLToPath } from 'node:url';

import { diffSnapshots } from '../tools/diff.mjs';
import { loadBrainAt, loadLedger, ledgerEventsFor, parseArgs, renderTable, fmtNum } from '../tools/lib.mjs';

export const DEFAULT_BUCKETS = 10;

// ---------------------------------------------------------------- per-region run counts
/**
 * Where the computation went. Counted from the per-cell counters core keeps, which is the
 * same source core/scheduler.mjs charges, so this never disagrees with the budget report.
 * @param {Brain} brain @returns {object} region -> { cells, runs, fired, skips, errors }
 */
export function regionRuns(brain) {
  const out = {};
  for (const cell of brain.cells) {
    const r = out[cell.region] || (out[cell.region] = { region: cell.region, cells: 0, runs: 0, fired: 0, skips: 0, errors: 0 });
    r.cells++; r.runs += cell.stats.runs; r.fired += cell.stats.fired; r.skips += cell.stats.skips; r.errors += cell.stats.errors;
  }
  return out;
}

/**
 * Mean prediction error per tick bucket, read off cell.run ledger events.
 * @param {object[]} events ledger events
 * @param {object} [opts] { buckets, cell, region, t0, t1 }
 * @returns {{buckets: object[], n, mean, first, last, t0, t1}}
 */
export function errorCurve(events, opts = {}) {
  const buckets = opts.buckets ?? DEFAULT_BUCKETS;
  const rows = events.filter((e) => e.type === 'cell.run' && typeof e.surprise === 'number' && (!opts.cell || e.cell === opts.cell));
  if (!rows.length) return { buckets: [], n: 0, mean: null, first: null, last: null, t0: null, t1: null };
  const t0 = opts.t0 ?? Math.min(...rows.map((e) => e.t));
  const t1 = opts.t1 ?? Math.max(...rows.map((e) => e.t));
  const span = Math.max(1, t1 - t0 + 1);
  const acc = Array.from({ length: buckets }, () => ({ n: 0, sum: 0 }));
  for (const e of rows) {
    let b = Math.floor(((e.t - t0) / span) * buckets);
    if (b < 0) b = 0; if (b >= buckets) b = buckets - 1;
    acc[b].n++; acc[b].sum += e.surprise;
  }
  const out = acc.map((a, i) => ({
    bucket: i,
    tFrom: Math.round(t0 + (i * span) / buckets),
    tTo: Math.round(t0 + ((i + 1) * span) / buckets) - 1,
    n: a.n,
    meanError: a.n ? a.sum / a.n : null,
  }));
  const withN = out.filter((b) => b.n);
  return {
    buckets: out, n: rows.length,
    mean: rows.reduce((a, e) => a + e.surprise, 0) / rows.length,
    first: withN.length ? withN[0].meanError : null,
    last: withN.length ? withN[withN.length - 1].meanError : null,
    t0, t1,
  };
}

// ---------------------------------------------------------------- the comparison
function build(a, b, evA, evB, labels, buckets) {
  const diff = diffSnapshots(a, b);
  const ra = regionRuns(a), rb = regionRuns(b);
  const regions = [...new Set([...Object.keys(ra), ...Object.keys(rb)])].sort().map((name) => {
    const x = ra[name] || { cells: 0, runs: 0, fired: 0, skips: 0 };
    const y = rb[name] || { cells: 0, runs: 0, fired: 0, skips: 0 };
    return { region: name, cellsA: x.cells, cellsB: y.cells, runsA: x.runs, runsB: y.runs, runsDelta: y.runs - x.runs, firedA: x.fired, firedB: y.fired, skipsA: x.skips, skipsB: y.skips };
  });
  // Both curves on one tick grid, so bucket i of A covers the same ticks as bucket i of B.
  const ts = [...evA, ...evB].filter((e) => e.type === 'cell.run' && typeof e.surprise === 'number').map((e) => e.t);
  const grid = ts.length ? { t0: Math.min(...ts), t1: Math.max(...ts), buckets } : { buckets };
  const curveA = errorCurve(evA, grid), curveB = errorCurve(evB, grid);
  return {
    labels,
    cells: { a: a.cells.length, b: b.cells.length, added: diff.cellsAdded, removed: diff.cellsRemoved },
    edges: { a: a.connectome.size(), b: b.connectome.size(), added: diff.edgesAdded.length, pruned: diff.edgesPruned.length, dormantChanges: diff.dormantChanges.length, addedKeys: diff.edgesAdded.slice(0, 20).map((e) => e.key), prunedKeys: diff.edgesPruned.slice(0, 20).map((e) => e.key) },
    weightDrift: diff.weightDrift,
    clock: { a: { t: a.clock.t, gen: a.clock.gen }, b: { t: b.clock.t, gen: b.clock.gen }, delta: diff.clockDelta },
    regions,
    error: { a: curveA, b: curveB, meanDelta: curveA.mean != null && curveB.mean != null ? curveB.mean - curveA.mean : null },
    diff,
  };
}

/** @param {Brain} a @param {Brain} b @param {object} [opts] { labels, buckets } */
export function compareBrains(a, b, opts = {}) {
  return build(a, b, ledgerEventsFor(a), ledgerEventsFor(b), opts.labels || ['a', 'b'], opts.buckets ?? DEFAULT_BUCKETS);
}

/** @param {string} dirA @param {string} dirB @param {object} [opts] { labels, buckets } */
export function compareStates(dirA, dirB, opts = {}) {
  const a = loadBrainAt(dirA), b = loadBrainAt(dirB);
  return build(a, b, loadLedger(dirA).events, loadLedger(dirB).events, opts.labels || [String(dirA), String(dirB)], opts.buckets ?? DEFAULT_BUCKETS);
}

// ---------------------------------------------------------------- rendering
export function renderCompare(c) {
  const [A, B] = c.labels;
  const L = [];
  L.push('compare  A = ' + A + '   B = ' + B);
  L.push('');
  L.push('structure');
  L.push(renderTable([
    { key: 'what', label: 'what', width: 20 },
    { key: 'a', label: 'A', width: 12, align: 'r' },
    { key: 'b', label: 'B', width: 12, align: 'r' },
    { key: 'delta', label: 'B - A', width: 12, align: 'r' },
  ], [
    { what: 'cells', a: c.cells.a, b: c.cells.b, delta: c.cells.b - c.cells.a },
    { what: 'edges', a: c.edges.a, b: c.edges.b, delta: c.edges.b - c.edges.a },
    { what: 'cells added', a: '', b: '', delta: c.cells.added.length },
    { what: 'cells removed', a: '', b: '', delta: c.cells.removed.length },
    { what: 'edges added', a: '', b: '', delta: c.edges.added },
    { what: 'edges pruned', a: '', b: '', delta: c.edges.pruned },
    { what: 'dormancy changes', a: '', b: '', delta: c.edges.dormantChanges },
    { what: 'clock t', a: c.clock.a.t, b: c.clock.b.t, delta: c.clock.delta.t },
  ]));
  if (c.cells.added.length) L.push('  cells only in B: ' + c.cells.added.slice(0, 20).join(', ') + (c.cells.added.length > 20 ? ' ... +' + (c.cells.added.length - 20) : ''));
  if (c.cells.removed.length) L.push('  cells only in A: ' + c.cells.removed.slice(0, 20).join(', ') + (c.cells.removed.length > 20 ? ' ... +' + (c.cells.removed.length - 20) : ''));
  if (c.edges.addedKeys.length) L.push('  edges only in B: ' + c.edges.addedKeys.join(', '));
  L.push('  weight drift over ' + c.weightDrift.considered + ' shared edges: ' + c.weightDrift.changed + ' moved, mean |delta| ' + fmtNum(c.weightDrift.meanAbsDelta, 6) + ', max ' + fmtNum(c.weightDrift.maxAbsDelta, 6));
  L.push('');
  L.push('per-region run counts');
  L.push(renderTable([
    { key: 'region', label: 'region', width: 16 },
    { key: 'cellsA', label: 'cells A', width: 8, align: 'r' },
    { key: 'cellsB', label: 'cells B', width: 8, align: 'r' },
    { key: 'runsA', label: 'runs A', width: 10, align: 'r' },
    { key: 'runsB', label: 'runs B', width: 10, align: 'r' },
    { key: 'runsDelta', label: 'B - A', width: 10, align: 'r' },
    { key: 'firedA', label: 'fired A', width: 9, align: 'r' },
    { key: 'firedB', label: 'fired B', width: 9, align: 'r' },
    { key: 'skipsA', label: 'skips A', width: 9, align: 'r' },
    { key: 'skipsB', label: 'skips B', width: 9, align: 'r' },
  ], c.regions));
  L.push('');
  L.push('prediction error curve (mean surprise per cell.run, same tick grid for both)');
  const rows = [];
  const n = Math.max(c.error.a.buckets.length, c.error.b.buckets.length);
  for (let i = 0; i < n; i++) {
    const x = c.error.a.buckets[i], y = c.error.b.buckets[i];
    rows.push({
      bucket: i,
      ticks: (x || y) ? ((x || y).tFrom + '..' + (x || y).tTo) : '',
      nA: x ? x.n : 0, errA: x && x.meanError != null ? fmtNum(x.meanError, 6) : 'n/a',
      nB: y ? y.n : 0, errB: y && y.meanError != null ? fmtNum(y.meanError, 6) : 'n/a',
    });
  }
  L.push(renderTable([
    { key: 'bucket', label: 'bucket', width: 7, align: 'r' },
    { key: 'ticks', label: 'ticks', width: 16 },
    { key: 'nA', label: 'runs A', width: 9, align: 'r' },
    { key: 'errA', label: 'error A', width: 12, align: 'r' },
    { key: 'nB', label: 'runs B', width: 9, align: 'r' },
    { key: 'errB', label: 'error B', width: 12, align: 'r' },
  ], rows));
  L.push('  A mean ' + (c.error.a.mean == null ? 'n/a' : fmtNum(c.error.a.mean, 6)) + ' over ' + c.error.a.n + ' runs, B mean ' + (c.error.b.mean == null ? 'n/a' : fmtNum(c.error.b.mean, 6)) + ' over ' + c.error.b.n + ' runs'
    + (c.error.meanDelta == null ? '' : ', B - A = ' + fmtNum(c.error.meanDelta, 6)));
  return L.join('\n');
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const { opts, pos } = parseArgs(argv, ['json', 'help']);
  if (opts.help || pos.length < 2) {
    process.stdout.write([
      'usage: node lab/compare.mjs <a: snapshot-or-dir> <b: snapshot-or-dir> [--buckets N] [--json]',
      '',
      '  a, b        two brain state dirs (or direct paths to their snapshot.json)',
      '  --buckets   how many tick buckets the error curves are drawn on (default ' + DEFAULT_BUCKETS + ')',
      '  --json      print the whole comparison as JSON',
    ].join('\n') + '\n');
    return opts.help ? 0 : 1;
  }
  const c = compareStates(pos[0], pos[1], { labels: [pos[0], pos[1]], buckets: opts.buckets ? Number(opts.buckets) : DEFAULT_BUCKETS });
  process.stdout.write((opts.json ? JSON.stringify({ ...c, diff: undefined }, null, 2) : renderCompare(c)) + '\n');
  return 0;
}
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main(process.argv.slice(2)).then((c) => process.exit(c)).catch((e) => { process.stderr.write('compare: ' + (e && e.message || e) + '\n'); process.exit(1); });
