#!/usr/bin/env node
// tools/inspect.mjs: a whole-brain report. Where core/brain.mjs's own summary() gives a
// handful of totals, this walks the region/circuit tree, the per-cell stats, the
// connectome's degree and weight distributions, and the gate's recent decisions, all from
// a snapshot plus its ledger, with nothing live required.
//
// Usage: node tools/inspect.mjs <snapshot-or-dir> [--json] [--color]
import { fileURLToPath } from 'node:url';

import { ACTIVE, DORMANT, PRUNED } from '../core/connectome.mjs';
import {
  loadBrainAt, ledgerEventsFor, parseArgs, makeStyler, renderTable, fmtNum, stats3, hr,
} from './lib.mjs';

// ---------------------------------------------------------------- pieces
function regionsAndCircuits(brain) {
  const out = [];
  for (const [rname, r] of brain.regions) {
    const circuits = [];
    for (const ckey of r.circuits) {
      const c = brain.circuits.get(ckey);
      const kinds = {};
      for (const idx of c.cells) { const k = brain.cells[idx].kind; kinds[k] = (kinds[k] || 0) + 1; }
      circuits.push({ key: ckey, name: c.name, period: c.period, cells: c.cells.size, kinds });
    }
    circuits.sort((a, b) => a.name.localeCompare(b.name));
    out.push({ region: rname, doc: r.doc, budget: Number.isFinite(r.budget) ? r.budget : 'inf', cells: r.cells.size, circuits });
  }
  out.sort((a, b) => a.region.localeCompare(b.region));
  return out;
}

function cellStatsTop(brain, n = 20) {
  return brain.cells
    .map((c) => ({ id: c.id, kind: c.kind, region: c.region, circuit: c.circuit, runs: c.stats.runs, skips: c.stats.skips, cost: c.stats.cost, surprise: c.stats.surprise, errors: c.stats.errors }))
    .sort((a, b) => b.runs - a.runs)
    .slice(0, n);
}

function degreeDistribution(brain) {
  const con = brain.connectome;
  const inDeg = [], outDeg = [];
  for (let idx = 0; idx < brain.cells.length; idx++) {
    let ind = 0, outd = 0;
    for (const e of con.into(idx)) if (con.flags[e] & ACTIVE) ind++;
    for (const e of con.outOf(idx)) if (con.flags[e] & ACTIVE) outd++;
    inDeg.push(ind); outDeg.push(outd);
  }
  return { in: stats3(inDeg), out: stats3(outDeg) };
}

// 10 equal width bins over the live edges' weights. All-equal weights collapse to one bin.
function weightHistogram(brain, bins = 10) {
  const con = brain.connectome;
  const ws = [];
  for (let e = 0; e < con.size(); e++) if (con.flags[e] & ACTIVE) ws.push(con.w[e]);
  if (!ws.length) return { min: null, max: null, bins: [] };
  const min = Math.min(...ws), max = Math.max(...ws);
  const span = max - min;
  const counts = new Array(bins).fill(0);
  for (const w of ws) {
    let b = span === 0 ? 0 : Math.min(bins - 1, Math.floor(((w - min) / span) * bins));
    counts[b]++;
  }
  const out = [];
  for (let b = 0; b < bins; b++) {
    const lo = span === 0 ? min : min + (span * b) / bins;
    const hi = span === 0 ? max : min + (span * (b + 1)) / bins;
    out.push({ lo, hi, count: counts[b] });
  }
  return { min, max, bins: out, n: ws.length };
}

function topEdgesByUsage(brain, n = 20) {
  const con = brain.connectome;
  const rows = [];
  for (let e = 0; e < con.size(); e++) {
    if (con.flags[e] & PRUNED) continue;
    const src = brain.cells[con.src[e]], dst = brain.cells[con.dst[e]];
    rows.push({
      e, src: src ? src.id : con.src[e], dst: dst ? dst.id : con.dst[e],
      srcPort: con.srcPort[e], dstPort: con.dstPort[e], w: con.w[e], delay: con.delay[e],
      usage: con.usage[e], conf: con.conf[e], dormant: !!(con.flags[e] & DORMANT),
    });
  }
  rows.sort((a, b) => b.usage - a.usage);
  return rows.slice(0, n);
}

function edgeFlagCounts(brain) {
  const con = brain.connectome;
  let active = 0, dormant = 0, pruned = 0;
  for (let e = 0; e < con.size(); e++) {
    if (con.flags[e] & PRUNED) pruned++;
    else if (con.flags[e] & DORMANT) dormant++;
    else if (con.flags[e] & ACTIVE) active++;
  }
  return { active, dormant, pruned, total: con.size() };
}

function lastDecisions(brain, n = 20) {
  const events = ledgerEventsFor(brain);
  const decisions = events.filter((e) => e.type === 'decision');
  return decisions.slice(-n);
}

// Exported for programmatic use.
export function inspectBrain(brain, { topCells = 20, topEdges = 20, bins = 10, decisions = 20 } = {}) {
  return {
    name: brain.name,
    clock: { t: brain.clock.t, gen: brain.clock.gen },
    regions: regionsAndCircuits(brain),
    cellCount: brain.cells.length,
    cellStatsTop: cellStatsTop(brain, topCells),
    degree: degreeDistribution(brain),
    weightHistogram: weightHistogram(brain, bins),
    topEdges: topEdgesByUsage(brain, topEdges),
    edgeFlags: edgeFlagCounts(brain),
    gate: { stats: brain.gate.stats, lastDecisions: lastDecisions(brain, decisions) },
  };
}

// ---------------------------------------------------------------- rendering
function renderReport(r, ST) {
  const lines = [];
  lines.push(ST.bold(r.name) + ST.grey('  t=' + r.clock.t + ' gen=' + r.clock.gen + '  cells=' + r.cellCount));
  lines.push(hr());

  lines.push(ST.bold('regions and circuits'));
  for (const reg of r.regions) {
    lines.push('  ' + ST.magenta(reg.region) + ST.grey('  cells=' + reg.cells + ' budget=' + reg.budget + (reg.doc ? '  ' + reg.doc : '')));
    for (const c of reg.circuits) {
      const kinds = Object.entries(c.kinds).map(([k, n]) => k + 'x' + n).join(', ');
      lines.push('    ' + ST.cyan(c.name) + ST.grey('  period=' + c.period + ' cells=' + c.cells + '  [' + kinds + ']'));
    }
  }
  lines.push('');

  lines.push(ST.bold('per-cell stats (top ' + r.cellStatsTop.length + ' by runs)'));
  lines.push(renderTable(
    [
      { key: 'id', label: 'cell', width: 14 }, { key: 'kind', label: 'kind', width: 16 },
      { key: 'region', label: 'region', width: 12 }, { key: 'runs', label: 'runs', width: 7, align: 'r' },
      { key: 'skips', label: 'skips', width: 7, align: 'r' }, { key: 'cost', label: 'cost', width: 8, align: 'r' },
      { key: 'surprise', label: 'surprise', width: 9, align: 'r' }, { key: 'errors', label: 'errors', width: 7, align: 'r' },
    ],
    r.cellStatsTop.map((c) => ({ ...c, cost: fmtNum(c.cost), surprise: fmtNum(c.surprise) })),
  ));
  lines.push('');

  lines.push(ST.bold('degree distribution (active edges)'));
  lines.push('  in : min=' + r.degree.in.min + ' median=' + fmtNum(r.degree.in.median) + ' max=' + r.degree.in.max);
  lines.push('  out: min=' + r.degree.out.min + ' median=' + fmtNum(r.degree.out.median) + ' max=' + r.degree.out.max);
  lines.push('');

  lines.push(ST.bold('weight histogram (' + (r.weightHistogram.n || 0) + ' active edges, 10 bins)'));
  if (r.weightHistogram.bins.length) {
    const maxCount = Math.max(...r.weightHistogram.bins.map((b) => b.count), 1);
    for (const b of r.weightHistogram.bins) {
      const bar = '#'.repeat(Math.round((b.count / maxCount) * 30));
      lines.push('  ' + fmtNum(b.lo).padStart(9) + ' .. ' + fmtNum(b.hi).padStart(9) + '  ' + String(b.count).padStart(5) + '  ' + ST.cyan(bar));
    }
  } else lines.push('  (no active edges)');
  lines.push('');

  lines.push(ST.bold('top edges by usage (' + r.topEdges.length + ')'));
  lines.push(renderTable(
    [
      { key: 'src', label: 'src', width: 12 }, { key: 'dst', label: 'dst', width: 12 },
      { key: 'w', label: 'w', width: 8, align: 'r' }, { key: 'delay', label: 'delay', width: 6, align: 'r' },
      { key: 'usage', label: 'usage', width: 7, align: 'r' }, { key: 'conf', label: 'conf', width: 6, align: 'r' },
      { key: 'dormant', label: 'dormant', width: 7 },
    ],
    r.topEdges.map((e) => ({ ...e, w: fmtNum(e.w), conf: fmtNum(e.conf), dormant: e.dormant ? 'yes' : '' })),
  ));
  lines.push('');

  lines.push(ST.bold('edges') + ST.grey('  active=' + r.edgeFlags.active + ' dormant=' + r.edgeFlags.dormant + ' pruned=' + r.edgeFlags.pruned + ' total=' + r.edgeFlags.total));
  lines.push('');

  lines.push(ST.bold('gate') + ST.grey('  proposed=' + r.gate.stats.proposed + ' approved=' + r.gate.stats.approved + ' rejected=' + r.gate.stats.rejected + ' held=' + r.gate.stats.held));
  lines.push('  last ' + r.gate.lastDecisions.length + ' decisions:');
  for (const d of r.gate.lastDecisions) lines.push('    #' + d.seq + ' t=' + d.t + '  ' + d.kind + ' -> ' + d.status + ST.grey('  (by ' + d.by + ', proposal ' + d.proposal + ')'));
  return lines.join('\n');
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const { opts, pos } = parseArgs(argv, ['json', 'color', 'help']);
  if (opts.help || !pos[0]) {
    process.stdout.write([
      'usage: node tools/inspect.mjs <snapshot-or-dir> [--json] [--color]',
      '',
      '  <snapshot-or-dir>  a brain state dir, or a direct path to its snapshot.json',
      '  --json             print the full report as JSON',
      '  --color            colorize the report (off by default)',
    ].join('\n') + '\n');
    return opts.help ? 0 : 1;
  }
  const brain = loadBrainAt(pos[0]);
  const report = inspectBrain(brain);
  if (opts.json) { process.stdout.write(JSON.stringify(report, null, 2) + '\n'); return 0; }
  const ST = makeStyler(!!opts.color);
  process.stdout.write(renderReport(report, ST) + '\n');
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main(process.argv.slice(2)).then((code) => process.exit(code)).catch((err) => { process.stderr.write('inspect: ' + (err && err.message || err) + '\n'); process.exit(1); });
}
