#!/usr/bin/env node
// tools/diff.mjs: what changed between two snapshots of the same brain. Cells and edges
// are compared by stable identity (cell id; edge by src/srcPort/dst/dstPort, since the raw
// connectome index is just an append slot, not an identity), so this reads the same
// whether the two snapshots came from one continuously ticking brain or from two labelled
// captures. DESIGN.md section 12: "diff between snapshots."
//
// Each side's "ledger seq delta" needs its own ledger.jsonl truncated to that moment: a
// state dir is <dir>/snapshot.json plus <dir>/ledger/ledger.jsonl taken together, so
// comparing two points in one brain's history means capturing two such dirs (see
// test/tools.test.mjs for how the fixture does this with a plain file copy).
//
// Usage: node tools/diff.mjs <a: snapshot-or-dir> <b: snapshot-or-dir> [--json] [--color]
import { fileURLToPath } from 'node:url';

import { ACTIVE, DORMANT, PRUNED } from '../core/connectome.mjs';
import { loadBrainAt, parseArgs, makeStyler, fmtNum, hr } from './lib.mjs';

function flagName(flags) {
  if (flags & PRUNED) return 'pruned';
  if (flags & DORMANT) return 'dormant';
  if (flags & ACTIVE) return 'active';
  return 'unknown';
}

// Key an edge by identity, not by its array index: the same logical wire keeps this key
// across snapshots even as unrelated edges are appended ahead of or behind it.
function edgeKey(brain, e) {
  const con = brain.connectome;
  const src = brain.cells[con.src[e]], dst = brain.cells[con.dst[e]];
  return (src ? src.id : con.src[e]) + '#' + con.srcPort[e] + '->' + (dst ? dst.id : con.dst[e]) + '#' + con.dstPort[e];
}
function edgeSnapshot(brain) {
  const con = brain.connectome, m = new Map();
  for (let e = 0; e < con.size(); e++) m.set(edgeKey(brain, e), { w: con.w[e], delay: con.delay[e], flags: con.flags[e], usage: con.usage[e] });
  return m;
}

// Exported for programmatic use: diffSnapshots(a, b) where a and b are Brain instances
// (as returned by tools/lib.mjs loadBrainAt), a being the earlier state.
export function diffSnapshots(a, b) {
  const aCells = new Map(a.cells.map((c) => [c.id, c]));
  const bCells = new Map(b.cells.map((c) => [c.id, c]));
  const cellsAdded = [...bCells.keys()].filter((id) => !aCells.has(id)).sort();
  const cellsRemoved = [...aCells.keys()].filter((id) => !bCells.has(id)).sort();

  const aE = edgeSnapshot(a), bE = edgeSnapshot(b);
  const edgesAdded = [], edgesPruned = [], dormantChanges = [];
  for (const [key, be] of bE) {
    const ae = aE.get(key);
    if (!ae) { edgesAdded.push({ key, w: be.w, delay: be.delay }); continue; }
    const wasPruned = !!(ae.flags & PRUNED), isPruned = !!(be.flags & PRUNED);
    if (!wasPruned && isPruned) edgesPruned.push({ key });
    const fromName = flagName(ae.flags), toName = flagName(be.flags);
    if (fromName !== toName && (fromName === 'dormant' || toName === 'dormant')) dormantChanges.push({ key, from: fromName, to: toName });
  }

  // Weight drift over edges present in both snapshots (regardless of flag changes): the
  // mean and max absolute change in weight, and how many of those shared edges moved at all.
  let sumAbs = 0, maxAbs = 0, changed = 0, considered = 0;
  for (const [key, ae] of aE) {
    const be = bE.get(key);
    if (!be) continue;
    considered++;
    const d = Math.abs(be.w - ae.w);
    if (d > 0) changed++;
    sumAbs += d;
    if (d > maxAbs) maxAbs = d;
  }
  const weightDrift = { considered, changed, meanAbsDelta: considered ? sumAbs / considered : 0, maxAbsDelta: maxAbs };

  return {
    cellsAdded, cellsRemoved,
    edgesAdded, edgesPruned, dormantChanges,
    weightDrift,
    clockDelta: { t: b.clock.t - a.clock.t, gen: b.clock.gen - a.clock.gen },
    ledgerSeqDelta: b.ledger.seq - a.ledger.seq,
  };
}

// ---------------------------------------------------------------- rendering
function renderReport(d, ST) {
  const lines = [];
  lines.push(ST.bold('diff') + ST.grey('  clock t' + (d.clockDelta.t >= 0 ? '+' : '') + d.clockDelta.t + ' gen' + (d.clockDelta.gen >= 0 ? '+' : '') + d.clockDelta.gen + '  ledger seq+' + d.ledgerSeqDelta));
  lines.push(hr());

  lines.push(ST.bold('cells') + ST.grey('  added=' + d.cellsAdded.length + ' removed=' + d.cellsRemoved.length));
  if (d.cellsAdded.length) lines.push('  + ' + d.cellsAdded.join(', '));
  if (d.cellsRemoved.length) lines.push('  - ' + d.cellsRemoved.join(', '));
  lines.push('');

  lines.push(ST.bold('edges') + ST.grey('  added=' + d.edgesAdded.length + ' pruned=' + d.edgesPruned.length + ' dormant-changes=' + d.dormantChanges.length));
  for (const e of d.edgesAdded.slice(0, 20)) lines.push('  + ' + e.key + ST.grey('  w=' + fmtNum(e.w) + ' delay=' + e.delay));
  if (d.edgesAdded.length > 20) lines.push('  ... and ' + (d.edgesAdded.length - 20) + ' more');
  for (const e of d.edgesPruned.slice(0, 20)) lines.push('  x ' + e.key);
  if (d.edgesPruned.length > 20) lines.push('  ... and ' + (d.edgesPruned.length - 20) + ' more');
  for (const e of d.dormantChanges.slice(0, 20)) lines.push('  ~ ' + e.key + '  ' + e.from + ' -> ' + e.to);
  lines.push('');

  lines.push(ST.bold('weight drift') + ST.grey('  over ' + d.weightDrift.considered + ' edges present in both'));
  lines.push('  changed=' + d.weightDrift.changed + '  mean |delta|=' + fmtNum(d.weightDrift.meanAbsDelta) + '  max |delta|=' + fmtNum(d.weightDrift.maxAbsDelta));
  return lines.join('\n');
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const { opts, pos } = parseArgs(argv, ['json', 'color', 'help']);
  if (opts.help || pos.length < 2) {
    process.stdout.write([
      'usage: node tools/diff.mjs <a: snapshot-or-dir> <b: snapshot-or-dir> [--json] [--color]',
      '',
      '  a, b     two brain state dirs (or direct paths to their snapshot.json), a earlier than b',
      '  --json   print the full diff as JSON',
      '  --color  colorize the report (off by default)',
    ].join('\n') + '\n');
    return opts.help ? 0 : 1;
  }
  const a = loadBrainAt(pos[0]);
  const b = loadBrainAt(pos[1]);
  const d = diffSnapshots(a, b);
  if (opts.json) { process.stdout.write(JSON.stringify(d, null, 2) + '\n'); return 0; }
  const ST = makeStyler(!!opts.color);
  process.stdout.write(renderReport(d, ST) + '\n');
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main(process.argv.slice(2)).then((code) => process.exit(code)).catch((err) => { process.stderr.write('diff: ' + (err && err.message || err) + '\n'); process.exit(1); });
}
