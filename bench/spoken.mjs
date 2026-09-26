// bench/spoken.mjs: SPOKEN ARITHMETIC ON THE SUB-TOKEN PATH (2026-09-26, item 1 of the queue in his order).
//
// His order of 10:05 EDT: "Every request should be less than a token and it should be done in
// microseconds." At 10:12 EDT the organism answered "17 * 23" in microseconds and "what is 17 times
// 23" with "nothing in memory matches times." act/solve.mjs spokenExpression() now rewrites the
// spoken shapes into the operator grammar, and ask() tries the exact path right after the solved
// region, before every model cell. This bench measures that claim the way a bar has to be measured:
//
//   THE SPLIT. The eleven DEVELOPMENT prompts are the ones the rules were written against (they were
//   on the screen while the rules were typed). The HELD-OUT set is built here from nine phrasing
//   templates with operands drawn by a seeded generator, and every expected value is computed by
//   this file's own BigInt arithmetic, never parsed out of the prompt by the parser under test.
//   The phrasing templates are the same nine shapes; what is held out is the operands and the
//   values, so this bar measures "the rules compute the right number on numbers they never saw",
//   not "the rules cover every English phrasing" (that gap is stated in the verdict, not hidden).
//
//   THE CONTROL. The same held-out prompts with one word the table does not know inserted ("what
//   is 17 times 23 apples") must ALL be null: a front end that answers those is skipping words.
//
//   THE CLOCK. solve() is timed warm (the CLI pays module load and the first regex compile on every
//   process, about 1.7 ms measured 10:51 EDT; a resident organism pays it once): median and p90 ns
//   over REPS calls per prompt after WARM warm-up calls, on this machine, model off, no socket.
//
// The bar: every held-out prompt exact (n of n), every control prompt null, and the warm median
// under 10,000 ns. Verdict: bench/verdicts/spoken.json. Run: node bench/spoken.mjs [--out FILE].
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { solve } from '../act/solve.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? path.resolve(process.argv[i + 1]) : path.join(HERE, 'verdicts', 'spoken.json'); })();
const SEED = 'spoken/1';
const N = 200;
const WARM = 100, REPS = 1000;
const NS_BAR = 10_000;

// ---------------------------------------------------------------- this file's own arithmetic
function gcd(a, b) { if (a < 0n) a = -a; if (b < 0n) b = -b; while (b) { const t = a % b; a = b; b = t; } return a; }
function Q(n, d = 1n) { n = BigInt(n); d = BigInt(d); if (d < 0n) { n = -n; d = -d; } if (n === 0n) return { n: 0n, d: 1n }; const g = gcd(n, d); return { n: n / g, d: d / g }; }
const add = (a, b) => Q(a.n * b.d + b.n * a.d, a.d * b.d);
const sub = (a, b) => Q(a.n * b.d - b.n * a.d, a.d * b.d);
const mul = (a, b) => Q(a.n * b.n, a.d * b.d);
const div = (a, b) => Q(a.n * b.d, a.d * b.n);
const pow = (a, k) => { let r = Q(1n); for (let i = 0; i < k; i++) r = mul(r, a); return r; };
const str = (q) => q.d === 1n ? q.n.toString() : q.n.toString() + '/' + q.d.toString();

// A seeded generator (mulberry32 over a string hash): the same seed draws the same operands.
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));

// ---------------------------------------------------------------- the nine templates
// Each draws its operands, builds the prompt, and computes the expected value HERE.
const TEMPLATES = [
  { id: 'times', make: (r) => { const a = int(r, 2, 999), b = int(r, 2, 999); return { prompt: `what is ${a} times ${b}`, expect: mul(Q(a), Q(b)) }; } },
  { id: 'plus', make: (r) => { const a = int(r, 0, 99999), b = int(r, 0, 99999); return { prompt: `what is ${a} plus ${b}?`, expect: add(Q(a), Q(b)) }; } },
  { id: 'minus', make: (r) => { const a = int(r, 0, 9999), b = int(r, 0, 9999); return { prompt: `how much is ${a} minus ${b}`, expect: sub(Q(a), Q(b)) }; } },
  { id: 'divided', make: (r) => { const a = int(r, 1, 999), b = int(r, 1, 99); return { prompt: `what is ${a} divided by ${b}`, expect: div(Q(a), Q(b)) }; } },
  { id: 'power', make: (r) => { const a = int(r, 2, 12), k = int(r, 2, 9); return { prompt: `what is ${a} to the power of ${k}`, expect: pow(Q(a), k) }; } },
  { id: 'percent', make: (r) => { const p = int(r, 1, 99), a = int(r, 1, 9999); return { prompt: `what is ${p} percent of ${a}`, expect: div(mul(Q(p), Q(a)), Q(100n)) }; } },
  { id: 'sqrt', make: (r) => { const s = int(r, 1, 999); return { prompt: `what is the square root of ${s * s}`, expect: Q(s) }; } },
  { id: 'sum-of', make: (r) => { const a = int(r, 0, 9999999), b = int(r, 0, 9999999); return { prompt: `what's the sum of ${a} and ${b}`, expect: add(Q(a), Q(b)) }; } },
  { id: 'subtract-from', make: (r) => { const a = int(r, 0, 999), b = int(r, 0, 999); return { prompt: `subtract ${a} from ${b}`, expect: sub(Q(b), Q(a)) }; } },
];
const DEVELOPMENT = [
  'what is 17 times 23', '17 * 23', 'what is 12 plus 5', 'what is 2 to the power of 10', 'what is 15 percent of 200',
  'what is the square root of 144', "what's the sum of 1234567 and 7654321", 'subtract 3 from 10', 'how much is 7 x 8',
  'what is 17 * 23?', '17 times 23',
];

const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

function timeWarm(prompt) {
  for (let i = 0; i < WARM; i++) solve(prompt);
  const ns = [];
  for (let i = 0; i < REPS; i++) { const t0 = process.hrtime.bigint(); solve(prompt); ns.push(Number(process.hrtime.bigint() - t0)); }
  return { median: med(ns), p90: pct(ns, 0.9), p99: pct(ns, 0.99) };
}

// ---------------------------------------------------------------- the run
const printed = [];
const say = (s) => { printed.push(s); console.log(s); };
say('spoken bar: node bench/spoken.mjs');
const r = rng(SEED);
const rows = [];
const perTemplate = {};
let exact = 0, controlNull = 0;
for (let i = 0; i < N; i++) {
  const t = TEMPLATES[i % TEMPLATES.length];
  const { prompt, expect } = t.make(r);
  const got = solve(prompt);
  const ok = !!got && got.method === 'exact.arith' && got.answer === str(expect);
  const control = solve(prompt.replace(/^(what is|what's|how much is|subtract)/, '$1 apples'));
  const controlOk = control === null;
  if (ok) exact++;
  if (controlOk) controlNull++;
  perTemplate[t.id] = perTemplate[t.id] || { n: 0, exact: 0, controlNull: 0 };
  perTemplate[t.id].n++; if (ok) perTemplate[t.id].exact++; if (controlOk) perTemplate[t.id].controlNull++;
  rows.push({ i, template: t.id, prompt, expect: str(expect), got: got ? got.answer : null, ok, controlNull: controlOk });
}
for (const [id, v] of Object.entries(perTemplate)) say(`  ${id.padEnd(14)} exact ${v.exact}/${v.n}  control null ${v.controlNull}/${v.n}`);
say(`held-out: exact ${exact}/${N}, control null ${controlNull}/${N} (seed ${SEED}, ${TEMPLATES.length} templates, operands drawn here, values computed here)`);

// timing: one prompt per template from the held-out draw, warm
const timing = [];
for (const t of TEMPLATES) {
  const row = rows.find((x) => x.template === t.id);
  const tm = timeWarm(row.prompt);
  timing.push({ template: t.id, prompt: row.prompt, ...tm });
  say(`  ${t.id.padEnd(14)} warm median ${String(tm.median).padStart(6)} ns  p90 ${String(tm.p90).padStart(6)}  p99 ${String(tm.p99).padStart(7)}  ${row.prompt}`);
}
const medians = timing.map((x) => x.median);
const warmMedian = med(medians), warmMax = Math.max(...medians);
say(`warm: median of medians ${warmMedian} ns, slowest template median ${warmMax} ns (WARM ${WARM}, REPS ${REPS} per prompt)`);
const dev = DEVELOPMENT.map((p) => ({ prompt: p, got: (solve(p) || {}).answer ?? null }));
say(`development (the ${DEVELOPMENT.length} prompts the rules were written against): ${dev.filter((d) => d.got !== null).length}/${DEVELOPMENT.length} answered`);

const met = { heldOut: exact === N, control: controlNull === N, ns: warmMax < NS_BAR };
const barMet = met.heldOut && met.control && met.ns;
say(`BAR ${barMet ? 'MET' : 'MISSED'}: held-out ${exact}/${N} (bar ${N}), control null ${controlNull}/${N} (bar ${N}), slowest warm median ${warmMax} ns (bar under ${NS_BAR})`);

const verdict = {
  at: new Date().toISOString(),
  node: process.version,
  command: 'node bench/spoken.mjs',
  isTheBar: true,
  barMet,
  met,
  bar: { heldOut: N, control: N, warmMedianNsUnder: NS_BAR, rule: 'every held-out spoken prompt exact against arithmetic written in this bench, every control prompt (one unknown word inserted) null, and the slowest template warm median under ' + NS_BAR + ' ns' },
  split: {
    kind: 'operands',
    development: { n: DEVELOPMENT.length, prompts: DEVELOPMENT, what: 'the prompts on the screen while the rewrite rules were written' },
    heldOut: { n: N, seed: SEED, templates: TEMPLATES.map((t) => t.id), what: 'operands drawn by a seeded generator and values computed by this bench, never by the parser under test' },
    notHeldOut: 'the nine phrasing templates are the shapes the rules know; a phrasing outside them is null by contract, and this bar does not measure phrasing coverage',
  },
  control: { what: 'the same prompt with the word "apples" inserted after its first words; every one must be null', nullCount: controlNull, n: N },
  timing: { warm: WARM, reps: REPS, perTemplate: timing, medianOfMedians: warmMedian, slowestTemplateMedian: warmMax, cold: 'the CLI pays module load and the first regex compile per process (about 1.7 ms printed by bin/brain.mjs ask at 10:51 EDT 2026-09-26); not in this bar' },
  perTemplate,
  development: dev,
  rows,
  printed,
};
mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(verdict, null, 2) + '\n');
say('wrote ' + path.relative(process.cwd(), OUT));
process.exitCode = barMet ? 0 : 1;
