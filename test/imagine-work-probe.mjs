// test/imagine-work-probe.mjs: board 24a fix pass, the probe that fitted WORK_MS in
// capability/grid-invent.mjs. It prints and writes nothing; it is not a test (the gate runs
// test/*.test.mjs only).
//
//   node test/imagine-work-probe.mjs [--every N] [--ms a,b] [--imagine N] [--points file] [--from file]
//
// --points writes the timed points to a file (the session scratchpad, never the repository) and
// --from re-fits from such a file without timing anything again.
//
// For every Nth timeout of bench/verdicts/grid.json (training) it times, on the WALL clock the bench
// used before the fix, (a) the fixed vocabulary's search and (b) an admission screen plus a search
// with an invented library (the collapsed words and imagination over the DSL, no mining, no
// knowledge store), each at every budget of --ms, and records what the work meter counted in each
// phase. Then it fits milliseconds = sum of weight x count over the four counts (least squares,
// no intercept, weights held at zero or above) and prints the weights and how far the fitted work
// ms sits from the wall ms, per phase.
import * as G from '../capability/grid-invent.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const every = Number(arg('--every', 10));
const budgets = String(arg('--ms', '3000,1000')).split(',').map(Number);
const imagineBudget = Number(arg('--imagine', 400));
const KEYS = ['calls', 'cells', 'learn', 'grade'];
const snap = () => ({ ...G.meter });
const diff = (a, b) => Object.fromEntries(KEYS.map((k) => [k, b[k] - a[k]]));

const from = arg('--from', null), pointsOut = arg('--points', null);
const gv = JSON.parse(readFileSync(path.join(ROOT, 'bench', 'verdicts', 'grid.json'), 'utf8'));
const timeouts = gv.rows.filter((r) => r.status === 'timeout').map((r) => r.id);
const solved = gv.rows.filter((r) => r.solved && Array.isArray(r.names));
const ids = timeouts.filter((_, i) => i % every === 0);
const load = (id) => JSON.parse(readFileSync(path.join(ROOT, 'bench', 'fixtures', 'public', 'arc-agi-1', 'training', id + '.json'), 'utf8'));

const points = from ? JSON.parse(readFileSync(from, 'utf8')) : [];
const collapsed = from ? [] : G.collapseSolved(solved);
const imagined = from ? { words: [] } : G.imagineWords({ memory: G.vocabularyMemory().concat(collapsed), budget: imagineBudget, seed: 'work-probe' });
const lib = collapsed.concat(imagined.words);
if (from) console.log('points ' + points.length + ' read from ' + from);
else console.log('tasks ' + ids.length + ' (every ' + every + 'th of ' + timeouts.length + ' timeouts), budgets ' + budgets.join(', ') + ' ms, invented library ' + lib.length + ' words');

if (!from) for (const ms of budgets) for (const id of ids) {
  const json = load(id), task = G.arcTask(json);
  // (a) the fixed vocabulary, as mining runs it
  let m0 = snap(), t0 = performance.now();
  G.searchWith(task, [], { budgetMs: ms });
  points.push({ phase: 'fixed', id, ms: performance.now() - t0, d: diff(m0, snap()) });
  // (b) admission on 40% of the clock, then the search to the same deadline
  const tb = performance.now();
  m0 = snap();
  const adm = G.admitFor(G.offerable(lib, [], id), task, 32, tb + ms * 0.4);
  const ta = performance.now();
  points.push({ phase: 'admit', id, ms: ta - tb, d: diff(m0, snap()) });
  const extras = adm.admitted.map((w) => G.asPrimitive(w)).filter(Boolean);
  m0 = snap();
  G.searchWith(task, extras, { deadline: tb + ms });
  points.push({ phase: 'invented', id, ms: performance.now() - ta, d: diff(m0, snap()) });
}

if (pointsOut) writeFileSync(pointsOut, JSON.stringify(points));
// non negative least squares by cyclic coordinate descent on the normal equations
const X = points.map((p) => KEYS.map((k) => p.d[k])), y = points.map((p) => p.ms);
const n = KEYS.length, A = Array.from({ length: n }, () => new Array(n).fill(0)), b = new Array(n).fill(0);
for (let r = 0; r < X.length; r++) for (let i = 0; i < n; i++) { b[i] += X[r][i] * y[r]; for (let j = 0; j < n; j++) A[i][j] += X[r][i] * X[r][j]; }
const w = new Array(n).fill(0);
for (let it = 0; it < 200000; it++) {
  const i = it % n;
  if (!A[i][i]) continue;
  let s = b[i];
  for (let j = 0; j < n; j++) if (j !== i) s -= A[i][j] * w[j];
  w[i] = Math.max(0, s / A[i][i]);
}
const sig = (x) => Number(x.toPrecision(3));
console.log('fitted work ms per count: ' + KEYS.map((k, i) => k + ' ' + sig(w[i])).join(', '));
const pred = (p) => KEYS.reduce((a, k, i) => a + w[i] * p.d[k], 0);
const q = (xs, f) => { const s = xs.slice().sort((a, c) => a - c); return s[Math.min(s.length - 1, Math.floor(f * (s.length - 1) + 0.5))]; };
for (const phase of ['fixed', 'admit', 'invented', 'all']) {
  const ps = points.filter((p) => phase === 'all' || p.phase === phase).filter((p) => p.ms >= 50);
  if (!ps.length) { console.log(phase + ': no timed phase of 50 ms or more'); continue; }
  const ratios = ps.map((p) => pred(p) / p.ms);
  const sumW = ps.reduce((a, p) => a + pred(p), 0), sumMs = ps.reduce((a, p) => a + p.ms, 0);
  console.log(phase + ': ' + ps.length + ' timed phases of 50 ms or more; work ms over wall ms: median ' + sig(q(ratios, 0.5)) + ', quartiles ' + sig(q(ratios, 0.25)) + ' to ' + sig(q(ratios, 0.75)) + ', range ' + sig(q(ratios, 0)) + ' to ' + sig(q(ratios, 1)) + '; summed work ms ' + Math.round(sumW) + ' against summed wall ms ' + Math.round(sumMs));
}
