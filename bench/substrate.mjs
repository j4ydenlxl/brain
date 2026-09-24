// bench/substrate.mjs: HOW MANY UNITS FIT, AND HOW FAST DO THEY TICK?
//
// Builds 1,000,000 units with 8 edges each, prints build ms, memory MB (process.memoryUsage
// and the layout's own byte count), ticks/s over 100 ticks for the JS reference and for the
// wasm kernel, unit-updates/s, the mean firing fraction, and the connectivity check; then
// asserts wasm and JS agree on fireCount; then 4,000,000 units if the layout fits under
// 4 GB, else the largest size that does and why. Writes bench/verdicts/substrate.json.
// Every number here is measured by this run. Usage:
//
//   node bench/substrate.mjs [--sizes 1000000,4000000] [--ticks 100] [--edges 8]
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Substrate, KINDS, layoutFor } from '../core/substrate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : dflt; };
const sizes = String(arg('sizes', '1000000,4000000')).split(',').map(Number);
const ticks = Number(arg('ticks', 100));
const edges = Number(arg('edges', 8));
const LIMIT = 4 * 1024 ** 3;

const ms = () => Number(process.hrtime.bigint()) / 1e6;
const mb = (bytes) => +(bytes / 1048576).toFixed(1);
const per = (n, milli) => { if (!(milli > 0)) return 0; const r = n / (milli / 1000); return r >= 100 ? Math.round(r) : +r.toFixed(2); };
const mem = () => { const m = process.memoryUsage(); return { rssMB: mb(m.rss), heapUsedMB: mb(m.heapUsed), externalMB: mb(m.external), arrayBuffersMB: mb(m.arrayBuffers) }; };

function runBackend(units, backend) {
  const t0 = ms();
  const s = new Substrate({ units, seed: 'bench', edgesPerUnit: edges, backend });
  const buildMs = +(ms() - t0).toFixed(1);
  if (backend === 'wasm' && !s.wasmReady) return { backend, available: false, reason: s.wasmReason, sub: s };
  const t1 = ms();
  let firedSum = 0;
  for (let k = 0; k < ticks; k++) firedSum += s.tick();
  const tickMs = ms() - t1;
  return {
    backend: s.backend, available: true, buildMs, ticks, tickMs: +tickMs.toFixed(1), msPerTick: +(tickMs / ticks).toFixed(3),
    ticksPerS: per(ticks, tickMs), unitUpdatesPerS: per(ticks * units, tickMs), edgeVisitsPerS: per(ticks * units * edges, tickMs),
    meanFiringFraction: +(firedSum / ticks / units).toFixed(4), totalFired: firedSum, sub: s,
  };
}

const results = [];
for (const units of sizes) {
  const L = layoutFor(units, edges, 7);
  console.log(`\n== ${units.toLocaleString()} units x ${edges} edges: layout ${mb(L.bytes)} MB per instance (ring ${L.R} slots)`);
  if (L.bytes * 2 > LIMIT) {
    // find the largest size whose two instances (js + wasm) fit under the limit
    let lo = 1e5, hi = units;
    while (hi - lo > 1e4) { const mid = Math.floor((lo + hi) / 2); if (layoutFor(mid, edges, 7).bytes * 2 <= LIMIT) lo = mid; else hi = mid; }
    console.log(`does not fit: ${units.toLocaleString()} needs ${mb(L.bytes * 2)} MB for the js and wasm twins, limit ${mb(LIMIT)} MB; largest that fits is ${lo.toLocaleString()}`);
    results.push({ units, skipped: true, why: 'two instances need ' + mb(L.bytes * 2) + ' MB, limit ' + mb(LIMIT) + ' MB', largestThatFits: lo });
    continue;
  }
  const before = mem();
  const js = runBackend(units, 'js');
  const afterJs = mem();
  console.log(`js   build ${js.buildMs} ms; ${ticks} ticks in ${js.tickMs} ms = ${js.msPerTick} ms/tick, ${js.ticksPerS} ticks/s, ${js.unitUpdatesPerS.toLocaleString()} unit-updates/s, ${js.edgeVisitsPerS.toLocaleString()} edge-visits/s; firing fraction ${js.meanFiringFraction}`);
  const t2 = ms(); const components = js.sub.components(); const componentsMs = +(ms() - t2).toFixed(1);
  const t3 = ms(); const dupSig = js.sub.duplicateSignatures(); const dupMs = +(ms() - t3).toFixed(1);
  console.log(`connectivity: ${components} weakly connected component${components === 1 ? '' : 'S'} (${componentsMs} ms); duplicate signatures ${dupSig} (${dupMs} ms); kinds ${KINDS.length}`);
  const wasm = runBackend(units, 'wasm');
  const afterBoth = mem();
  let agree = null;
  if (wasm.available) {
    console.log(`wasm build ${wasm.buildMs} ms; ${ticks} ticks in ${wasm.tickMs} ms = ${wasm.msPerTick} ms/tick, ${wasm.ticksPerS} ticks/s, ${wasm.unitUpdatesPerS.toLocaleString()} unit-updates/s; firing fraction ${wasm.meanFiringFraction}; speedup x${(js.tickMs / wasm.tickMs).toFixed(2)}`);
    let diff = 0; const a = js.sub.fireCount, b = wasm.sub.fireCount;
    for (let i = 0; i < units; i++) if (a[i] !== b[i]) diff++;
    agree = diff === 0;
    console.log(`wasm vs js fireCount after ${ticks} ticks: ${diff} units differ (${agree ? 'IDENTICAL' : 'MISMATCH'})`);
  } else console.log(`wasm unavailable: ${wasm.reason}`);
  console.log(`memory: rss ${before.rssMB} -> ${afterJs.rssMB} (js) -> ${afterBoth.rssMB} MB (js + wasm); arrayBuffers ${afterBoth.arrayBuffersMB} MB; layout ${mb(L.bytes)} MB per instance`);
  const strip = ({ sub, ...r }) => r;
  results.push({ units, edges: L.E, layoutMB: mb(L.bytes), ringSlots: L.R, js: strip(js), wasm: strip(wasm), wasmAgreesWithJs: agree, components, componentsMs, duplicateSignatures: dupSig, memory: { before, afterJs, afterBoth }, sampleUnit: js.sub.unit(units >> 1) });
  js.sub.useBackend('js'); // keep references alive until here, then let both go
}

const verdict = { at: new Date().toISOString(), node: process.version, args: { sizes, ticks, edges, limitMB: mb(LIMIT) }, kinds: KINDS.map(k => k.name), results };
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'substrate.json'), JSON.stringify(verdict, null, 2));
const ok = results.every(r => r.skipped || (r.components === 1 && r.duplicateSignatures === 0 && r.wasmAgreesWithJs !== false));
console.log(`\nSUBSTRATE ${ok ? 'GREEN' : 'RED'}: ${results.filter(r => !r.skipped).map(r => `${r.units.toLocaleString()} units ${r.wasm.available ? r.wasm.ticksPerS + ' ticks/s wasm, ' : ''}${r.js.ticksPerS} ticks/s js, ${r.components} component`).join('; ')}; verdict bench/verdicts/substrate.json`);
process.exit(ok ? 0 : 1);
