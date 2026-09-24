// bench/whole.mjs: THE WHOLE BRAIN at 1000 majors with 100,000 substrate units per region.
// Prints build ms, cells, edges, memory MB, ticks/s over 200 ticks, runs/s, signals/s and
// per-region runs, and writes bench/verdicts/whole.json. Every number in docs/WHOLE.md
// comes from this file's output.
//   node bench/whole.mjs [--majors N] [--units U] [--ticks T] [--ledger off|runs|full]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhole, timescaleReport, printable } from '../seeds/whole.mjs';
import { closeWorld } from '../world/index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const majors = Number(opt('majors', 1000));
const units = Number(opt('units', 100_000));
const ticks = Number(opt('ticks', 200));
const ledger = opt('ledger', 'off');
const mb = (b) => Number((b / 1048576).toFixed(1));
const now = () => Number(process.hrtime.bigint()) / 1e6;

const memBefore = process.memoryUsage();
const t0 = now();
const { brain, report } = buildWhole({ majors, substrateUnits: units, ledger, name: 'whole-bench', seed: 'whole-bench' });
const buildMs = now() - t0;
const memBuilt = process.memoryUsage();
console.log(printable(report));
console.log('build ' + buildMs.toFixed(0) + ' ms (organism ' + report.timing.organismMs.toFixed(0) + ', substrates ' + report.timing.substrateMs.toFixed(0) + ', skills ' + report.timing.skillsMs.toFixed(0) + ', mind ' + report.timing.mindMs.toFixed(0) + ', world ' + report.timing.worldMs.toFixed(0) + ')');
console.log('memory after build: rss ' + mb(memBuilt.rss) + ' MB, heap ' + mb(memBuilt.heapUsed) + ' MB, arrayBuffers ' + mb(memBuilt.arrayBuffers) + ' MB (rss before build ' + mb(memBefore.rss) + ' MB)');

const regionRunsBefore = {};
for (const [name, r] of brain.regions) { let s = 0; for (const idx of r.cells) s += brain.cells[idx].stats.runs; regionRunsBefore[name] = s; }
const rowsBefore = timescaleReport(brain);
const statsBefore = { runs: brain.stats.runs, signals: brain.stats.signals, delivered: brain.stats.delivered, grown: brain.stats.grown };
const t1 = now();
brain.tick(ticks);
const tickMs = now() - t1;
const memAfter = process.memoryUsage();
const runs = brain.stats.runs - statsBefore.runs, signals = brain.stats.signals - statsBefore.signals, delivered = brain.stats.delivered - statsBefore.delivered;
const ticksPerSec = ticks / (tickMs / 1000);
const perRegion = {};
for (const [name, r] of brain.regions) { let s = 0; for (const idx of r.cells) s += brain.cells[idx].stats.runs; perRegion[name] = { cells: r.cells.size, runs: s - regionRunsBefore[name] }; }
const periods = {};
for (const row of timescaleReport(brain)) { const b = rowsBefore.find((x) => x.label === row.label); periods[row.label] = { cells: row.cells, runs: row.runs - (b ? b.runs : 0) }; }
const substrates = {};
for (const [region, id] of Object.entries(report.ids.substrates)) { const c = brain.cell(id); substrates[region] = { runs: c.stats.runs, totalFired: c.state.sub.totalFired, backend: c.state.sub.backend || (c.state.sub.constructor && c.state.sub.constructor.name) || 'n/a' }; }

console.log(ticks + ' ticks in ' + tickMs.toFixed(0) + ' ms: ' + ticksPerSec.toFixed(2) + ' ticks/s, ' + (runs / (tickMs / 1000)).toFixed(0) + ' runs/s, ' + (signals / (tickMs / 1000)).toFixed(0) + ' signals/s, ' + (delivered / (tickMs / 1000)).toFixed(0) + ' deliveries/s (ledger ' + ledger + ', grown ' + (brain.stats.grown - statsBefore.grown) + ' edges)');
console.log('memory after ticks: rss ' + mb(memAfter.rss) + ' MB, heap ' + mb(memAfter.heapUsed) + ' MB, arrayBuffers ' + mb(memAfter.arrayBuffers) + ' MB');
console.log('per-region runs over ' + ticks + ' ticks: ' + Object.entries(perRegion).map(([k, v]) => k + ' ' + v.runs + ' (' + v.cells + ' cells)').join(', '));
console.log('runs per period: ' + Object.entries(periods).map(([k, v]) => k + ' ' + v.runs + ' (' + v.cells + ' cells)').join(', '));
console.log('substrate fired: ' + Object.entries(substrates).map(([k, v]) => k + ' ' + v.totalFired).join(', '));

const verdict = {
  at: new Date().toISOString(), node: process.version, majors, substrateUnits: units, ticks, ledger,
  build: { ms: Number(buildMs.toFixed(1)), timing: Object.fromEntries(Object.entries(report.timing).map(([k, v]) => [k, Number(v.toFixed(1))])) },
  cells: report.cells, edges: report.edges, liveEdges: report.liveEdges, regions: report.regions, kinds: report.kindCount, illegal: report.illegal,
  memoryMB: { rssBefore: mb(memBefore.rss), rssBuilt: mb(memBuilt.rss), rssAfter: mb(memAfter.rss), heapBuilt: mb(memBuilt.heapUsed), heapAfter: mb(memAfter.heapUsed), arrayBuffersBuilt: mb(memBuilt.arrayBuffers), arrayBuffersAfter: mb(memAfter.arrayBuffers) },
  tick: { ms: Number(tickMs.toFixed(1)), ticksPerSec: Number(ticksPerSec.toFixed(3)), runs, runsPerSec: Number((runs / (tickMs / 1000)).toFixed(1)), signals, signalsPerSec: Number((signals / (tickMs / 1000)).toFixed(1)), delivered, deliveredPerSec: Number((delivered / (tickMs / 1000)).toFixed(1)), grown: brain.stats.grown - statsBefore.grown },
  perRegion, periods, substrates,
};
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
const file = path.join(HERE, 'verdicts', 'whole.json');
writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
console.log('wrote ' + file);
try { closeWorld(brain); } catch { /* nothing open */ }
const learning = brain.whole && brain.whole.services && brain.whole.services.learning;
if (learning && typeof learning.detach === 'function') { try { learning.detach(); } catch { /* already detached */ } }
