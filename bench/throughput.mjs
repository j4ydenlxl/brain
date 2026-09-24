// bench/throughput.mjs: how fast does the organism tick? Builds synthetic brains of N
// cells with a sparse random connectome (K out-edges per cell), runs T ticks, prints cells
// per second, signals per second and ticks per second, at three ledger levels. Every number
// printed here comes from this run. Usage: node bench/throughput.mjs [--sizes 1000,5000] [--ticks 200]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { RNG } from '../core/rng.mjs';
import { defineKind, hasKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true] : []).filter(Boolean));
const sizes = String(args.sizes || '1000,5000').split(',').map(Number);
const ticks = Number(args.ticks || 200);
const K = Number(args.k || 8);

// A minimal hv relay cell: bundles what it receives and re-emits it. Pure propagation load.
if (!hasKind('bench.relay')) defineKind('bench.relay', {
  ports: { in: [{ name: 'in', kinds: ['hv'] }], out: [{ name: 'out', kinds: ['hv'] }] },
  compute: (ins) => { const m = ins[0]; if (!m.length) return [null]; if (m.length === 1) return [{ kind: 'hv', data: m[0].sig.data }]; return [{ kind: 'hv', data: S.bundle(m.map(it => it.sig.data)) }]; },
});

function build(n, ledger) {
  const b = new Brain({ name: 'bench' + n, seed: 'bench', ledger, pruneEvery: 0 });
  const rng = new RNG('bench:' + n);
  const regions = ['perception', 'association', 'cognitive', 'motor'];
  for (let i = 0; i < n; i++) b.addCell({ id: 'c' + i, kind: 'bench.relay', region: regions[i % 4], circuit: 'k' + (i % 16), policy: { period: 'event', learn: i % 2 ? 'hebbian' : null } });
  for (let i = 0; i < n; i++) for (let k = 0; k < K; k++) { const j = rng.int(n); if (j !== i) b.connect('c' + i, 0, 'c' + j, 0, { w: 0.5 + rng.next(), delay: rng.int(3) }); }
  return b;
}

const results = [];
for (const n of sizes) for (const ledger of ['off', 'runs', 'full']) {
  const b = build(n, ledger);
  const hv = S.hvFromSeed('seed');
  for (let i = 0; i < Math.min(n, 64); i++) b.inject('c' + i, 0, { kind: 'hv', data: hv });
  const t0 = process.hrtime.bigint();
  b.tick(ticks);
  const dt = Number(process.hrtime.bigint() - t0) / 1e9;
  const r = { cells: n, edges: b.connectome.size(), ledger, ticks, seconds: +dt.toFixed(3), runs: b.stats.runs, signals: b.stats.signals, delivered: b.stats.delivered, runsPerSec: Math.round(b.stats.runs / dt), signalsPerSec: Math.round(b.stats.signals / dt), deliveriesPerSec: Math.round(b.stats.delivered / dt), ticksPerSec: Math.round(ticks / dt), grown: b.stats.grown, proposals: b.gate.stats.proposed };
  results.push(r);
  console.log(Object.entries(r).map(([k, v]) => k + '=' + v).join(' '));
}
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'throughput.json'), JSON.stringify({ at: new Date().toISOString(), node: process.version, cpus: (await import('node:os')).availableParallelism(), results }, null, 2));
console.log('wrote bench/verdicts/throughput.json');
