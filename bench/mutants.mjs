// bench/mutants.mjs - MUTATION TESTING, PER SUBSYSTEM, WITH EXECUTION PROVED.
//
// A test suite that passes proves nothing until something has tried to break the code
// under it. This copies the whole brain (minus state/, node_modules and .git) to a temp
// directory, applies exactly one deliberate defect per run to one file of the copy, runs
// THAT SUBSYSTEM'S OWN test file against the mutated copy, and records whether the suite
// noticed.
//
// Three rules, each one paid for on an earlier project:
//
//  1. A mutant that never executed is not "survived" and not "killed". It is NOT EXECUTED
//     and it gets its own column. Every mutant's replacement text must contain a call to
//     __MUTP(), the probe: a header is prepended to the mutated file that defines __MUTP
//     as "append one line to this mutant's own file in the temp directory, the first time
//     you are called, and append the total at process exit". After the suite runs the
//     probe file is read back. No probe line means the mutated code never ran, whatever
//     the tests said, and the mutant is graded NOT EXECUTED.
//
//  2. Grading is against a BASELINE, not against green. Each subsystem's suite is run once
//     unmutated (with no probe and no mutation) and every test that already fails there is
//     remembered by name. A mutant counts as killed only when a test that PASSED at
//     baseline fails under the mutation. Without that rule a file that is red before
//     anything is mutated would certify every mutant as killed and the tally would measure
//     nothing. The unmutated duration is printed, because it is what makes rule 3 legal.
//
//  3. A mutant can make the machine stop halting, so every mutant run is under a wall
//     clock. A timeout is credited as a kill ONLY if the unmutated run of the same suite
//     finished well inside that clock (at or under half of it). Otherwise the timeout is
//     recorded as a timeout and the mutant is graded NOT EXECUTED, because a clock that
//     the clean suite cannot beat measures the machine, not the mutation.
//
//   node bench/mutants.mjs                 every mutant of every subsystem
//   node bench/mutants.mjs --sub world     one subsystem (repeatable, comma separated)
//   node bench/mutants.mjs --only w03      one mutant (prefix match on the id, comma separated)
//   node bench/mutants.mjs --list          print the mutant table and exit
//   node bench/mutants.mjs --keep          leave the temp copy on disk and print its path
//   node bench/mutants.mjs --timeout 60000 per-mutant wall clock, default 60000
//   node bench/mutants.mjs --tag pass2     names the per-subsystem verdict file of this pass
//
// Exit code is the verdict: 0 only if every mutant chosen was executed and killed.
import { cpSync, mkdtempSync, readFileSync, writeFileSync, appendFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir, cpus, loadavg, totalmem, freemem } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from 'node:test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : null; };
const TEST_TIMEOUT_MS = Number(opt('--timeout') || 60000);
const SUITE_BUDGET_MS = Number(opt('--budget') || TEST_TIMEOUT_MS);

// ---------------------------------------------------------------- the suites
// Each subsystem is graded by ITS OWN test file. A mutant in world/ that only the lab
// suite would notice is not killed by world's tests, and saying so is the point.
const SUITES = {
  core: ['test/core.test.mjs', 'test/simd.test.mjs', 'test/universal.test.mjs', 'test/invariants.test.mjs', 'test/fuzz.test.mjs'],
  substrate: ['test/substrate.test.mjs'],
  fhrr: ['test/fhrr.test.mjs'],
  capability: ['test/capability.test.mjs'],
  mind: ['test/mind.test.mjs'],
  world: ['test/world.test.mjs'],
  self: ['test/self.test.mjs'],
  lab: ['test/lab.test.mjs'],
  epochs: ['test/epochs.test.mjs'],
  web: ['test/web.test.mjs'],
  viz: ['test/viz.test.mjs'],
  // The surfaces landed 2026-09-17. Each is graded by its own file, not by a combined act
  // suite: a defect in act/web.mjs that only act/shell.mjs's tests would notice is not
  // killed by the reading surface's tests, and the tally has to say so.
  'act-web': ['test/act-web.test.mjs'],
  'act-shell': ['test/act-shell.test.mjs'],
  'act-llm': ['test/act-llm.test.mjs'],
  // core/simd.mjs is already partly graded under `core` (m43, m44 are the kernel's lane
  // conditions). The slot allocator is graded here instead, because test/hvheap.test.mjs is
  // the only file that reads it and it is in no other suite.
  simd: ['test/hvheap.test.mjs', 'test/simd.test.mjs'],
};

// ---------------------------------------------------------------- the mutants
// Every entry is an exact string replacement, applied with split/join so that a dollar
// sign in the replacement is a dollar sign and not a back-reference. `find` must occur
// EXACTLY ONCE in the file or the whole run aborts before a single test is executed: a
// mutation that does not apply is a mutant that cannot be killed, and silently skipping it
// would inflate the tally. Every `replace` must call __MUTP() at the mutated point, which
// is what proves the mutated line ran.
const MUTANTS = [
  // ============================================================ core (the original 44)
  // ---- core/brain.mjs
  { id: 'm01', sub: 'core', file: 'core/brain.mjs', why: 'connect never refuses a port pair whose kinds cannot meet',
    find: "if (!outKinds.some(k => inKinds.includes(k))) throw new Error('connect '",
    replace: "if (__MUTP() && false && !outKinds.some(k => inKinds.includes(k))) throw new Error('connect '" },
  { id: 'm02', sub: 'core', file: 'core/brain.mjs', why: 'connect demands EVERY out kind fit instead of one',
    find: 'if (!outKinds.some(k => inKinds.includes(k)))', replace: 'if (__MUTP() && !outKinds.every(k => inKinds.includes(k)))' },
  { id: 'm03', sub: 'core', file: 'core/brain.mjs', why: 'compatiblePorts accepts a pair where only SOME kinds fit',
    find: 'if (a.ports.out[sp].kinds.every(k => b.ports.in[dp].kinds.includes(k))) return [sp, dp];',
    replace: 'if (__MUTP() && a.ports.out[sp].kinds.some(k => b.ports.in[dp].kinds.includes(k))) return [sp, dp];' },
  { id: 'm04', sub: 'core', file: 'core/brain.mjs', why: 'the emit-time kind check is gone, a port receives a kind it never declared',
    find: 'if (!dstCell.ports.in[this.connectome.dstPort[e]].kinds.includes(out.kind)) { this.stats.refused++;',
    replace: 'if (__MUTP() && false) { this.stats.refused++;' },
  { id: 'm05', sub: 'core', file: 'core/brain.mjs', why: 'a signal scheduled into an already drained tick is lost',
    find: '_schedule(at, item) { if (at <= this.drainedT) at = this.drainedT + 1;', replace: '_schedule(at, item) { __MUTP();' },
  { id: 'm06', sub: 'core', file: 'core/brain.mjs', why: 'hebbian post is always 1, so a silent cell learns as if it had fired',
    find: 'const post = firedHere ? 1 : 0;', replace: 'const post = (__MUTP(), 1);' },

  // ---- core/connectome.mjs
  { id: 'm07', sub: 'core', file: 'core/connectome.mjs', why: 'a signal takes two ticks of travel instead of one',
    find: 'arrival(e, t) { return t + 1 + this.delay[e]; }', replace: 'arrival(e, t) { __MUTP(); return t + 2 + this.delay[e]; }' },
  { id: 'm08', sub: 'core', file: 'core/connectome.mjs', why: 'the edge delay is dropped from the arrival tick',
    find: 'arrival(e, t) { return t + 1 + this.delay[e]; }', replace: 'arrival(e, t) { __MUTP(); return t + 1; }' },
  { id: 'm09', sub: 'core', file: 'core/connectome.mjs', why: 'hebbian sign flipped: co-firing weakens the edge',
    find: 'const dw = eta * pre * post - alpha', replace: 'const dw = (__MUTP(), -eta) * pre * post - alpha' },
  { id: 'm10', sub: 'core', file: 'core/connectome.mjs', why: 'the alpha term grows the weight instead of decaying it',
    find: 'pre * post - alpha * this.w[e];', replace: 'pre * post + (__MUTP(), alpha) * this.w[e];' },
  { id: 'm11', sub: 'core', file: 'core/connectome.mjs', why: 'prune candidates take STRONG weights instead of weak ones',
    find: 'Math.abs(this.w[e]) < floor', replace: '__MUTP() && Math.abs(this.w[e]) > floor' },
  { id: 'm12', sub: 'core', file: 'core/connectome.mjs', why: 'staleness is not required to prune',
    find: '(this.lastT[e] < 0 || t - this.lastT[e] > staleTicks)', replace: '(__MUTP() && (this.lastT[e] < 0 || t - this.lastT[e] >= 0))' },
  { id: 'm13', sub: 'core', file: 'core/connectome.mjs', why: 'a pruned edge is a prune candidate again',
    find: 'if (!(this.flags[e] & ACTIVE)) continue;', replace: 'if (__MUTP() && (this.flags[e] & DORMANT)) continue;' },
  { id: 'm14', sub: 'core', file: 'core/connectome.mjs', why: 'the co-activation sample budget is spent twice over',
    find: 'for (let s = 0; s < this.sampleBudget; s++)', replace: 'for (let s = 0; __MUTP() && s < this.sampleBudget * 2; s++)' },
  { id: 'm15', sub: 'core', file: 'core/connectome.mjs', why: 'the sampled pair may be a cell with itself',
    find: 'const i = rng.int(n); let j = rng.int(n - 1); if (j >= i) j++;', replace: 'const i = rng.int(n); let j = (__MUTP(), rng.int(n - 1));' },
  { id: 'm16', sub: 'core', file: 'core/connectome.mjs', why: 'co-activation needs one count more than the threshold',
    find: 'if (c >= this.threshold)', replace: 'if (__MUTP() && c > this.threshold)' },
  { id: 'm17', sub: 'core', file: 'core/connectome.mjs', why: 'find ignores the pruned flag and hands back a dead edge',
    find: 'return e === undefined || (this.flags[e] & PRUNED) ? -1 : e;', replace: '__MUTP(); return e === undefined ? -1 : e;' },

  // ---- core/gate.mjs
  { id: 'm18', sub: 'core', file: 'core/gate.mjs', why: 'growth needs strictly more evidence than the threshold',
    find: "(ev.coActivations ?? 0) >= growThreshold ? 'approve' : 'reject'", replace: "(__MUTP() && (ev.coActivations ?? 0) > growThreshold) ? 'approve' : 'reject'" },
  { id: 'm19', sub: 'core', file: 'core/gate.mjs', why: 'a humanRequired kind is auto-approved instead of held for a human',
    find: "this.humanRequired.has(p.kind) ? 'hold' : this.policy(proposal, ctx)", replace: "(__MUTP() && this.humanRequired.has(p.kind)) ? 'approve' : this.policy(proposal, ctx)" },
  { id: 'm20', sub: 'core', file: 'core/gate.mjs', why: 'a prune is approved on staleness alone, whatever the weight',
    find: "return (ev.staleTicks ?? 0) >= pruneStale && Math.abs(ev.w ?? 1) < pruneFloor ? 'approve' : 'reject';",
    replace: "return (__MUTP() && (ev.staleTicks ?? 0) >= pruneStale) ? 'approve' : 'reject';" },

  // ---- core/scheduler.mjs
  { id: 'm21', sub: 'core', file: 'core/scheduler.mjs', why: 'bids are funded from the lowest up',
    find: 'cells.sort((a, b) => Scheduler.bid(b) - Scheduler.bid(a));', replace: 'cells.sort((a, b) => (__MUTP(), Scheduler.bid(a) - Scheduler.bid(b)));' },
  { id: 'm22', sub: 'core', file: 'core/scheduler.mjs', why: 'priority drops out of the bid',
    find: 'return cell.policy.priority * (1 + cell.stats.surprise)', replace: 'return (__MUTP(), 1) * (1 + cell.stats.surprise)' },
  { id: 'm23', sub: 'core', file: 'core/scheduler.mjs', why: 'the cost of the cell being funded is not charged to the budget',
    find: 'if (spent + cost <= budget)', replace: 'if (__MUTP() && spent <= budget)' },

  // ---- core/signal.mjs
  { id: 'm24', sub: 'core', file: 'core/signal.mjs', why: 'the bundle tie vector is dropped, ties follow the first member',
    find: '\n  for (let i = 0; i < n; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * TIE[i] || 1);',
    replace: '\n  for (let i = 0; i < n; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (__MUTP() && f[i] || 1);' },
  { id: 'm25', sub: 'core', file: 'core/signal.mjs', why: 'the tie vector is not rebuilt when the width changes',
    find: '\n  if (!TIE || TIE.length !== n) TIE = hvRandom', replace: '\n  if (__MUTP() && !TIE) TIE = hvRandom' },
  { id: 'm26', sub: 'core', file: 'core/signal.mjs', why: 'scalar bind adds instead of multiplying, so it is not self inverse',
    find: '\n  const out = new Int8Array(n);\n  for (let i = 0; i < n; i++) out[i] = a[i] * b[i];',
    replace: '\n  const out = new Int8Array(n);\n  for (let i = 0; i < n; i++) out[i] = (__MUTP(), a[i] + b[i]);' },
  { id: 'm27', sub: 'core', file: 'core/signal.mjs', why: 'permute rolls the other way',
    find: 'for (let i = 0; i < n; i++) out[(i + s) % n] = a[i];', replace: 'for (let i = 0; i < n; i++) out[i] = (__MUTP(), a[(i + s) % n]);' },
  { id: 'm28', sub: 'core', file: 'core/signal.mjs', why: 'a negative shift is not normalized into range',
    find: 'const n = a.length, out = new Int8Array(n), s = ((k % n) + n) % n;', replace: 'const n = a.length, out = new Int8Array(n), s = (__MUTP(), k % n);' },
  { id: 'm29', sub: 'core', file: 'core/signal.mjs', why: 'rationals are never reduced to lowest terms',
    find: 'const g = gcd(n, d) || 1n;', replace: 'const g = (__MUTP(), 1n);' },
  { id: 'm30', sub: 'core', file: 'core/signal.mjs', why: 'gcd does not take the absolute value of its first argument',
    find: 'a = a < 0n ? -a : a; b = b < 0n ? -b : b;', replace: '__MUTP(); b = b < 0n ? -b : b;' },
  { id: 'm31', sub: 'core', file: 'core/signal.mjs', why: 'a negative denominator loses the sign instead of moving it to the numerator',
    find: 'if (d < 0n) { n = -n; d = -d; }', replace: 'if (d < 0n) { __MUTP(); d = -d; }' },
  { id: 'm32', sub: 'core', file: 'core/signal.mjs', why: 'ratCmp returns the opposite order',
    find: 'return l < r ? -1 : l > r ? 1 : 0;', replace: '__MUTP(); return l < r ? 1 : l > r ? -1 : 0;' },
  { id: 'm33', sub: 'core', file: 'core/signal.mjs', why: 'ratCmp cross multiplies the wrong pairs',
    find: 'const l = a.n * b.d, r = b.n * a.d;', replace: 'const l = (__MUTP(), a.n * b.n), r = b.d * a.d;' },
  { id: 'm34', sub: 'core', file: 'core/signal.mjs', why: 'a decimal exponent is applied to the wrong side of the fraction',
    find: 'if (e > 0) n *= 10n ** BigInt(e); else if (e < 0) d *= 10n ** BigInt(-e);',
    replace: 'if (__MUTP() && e > 0) d *= 10n ** BigInt(e); else if (e < 0) n *= 10n ** BigInt(-e);' },

  // ---- core/ledger.mjs
  { id: 'm35', sub: 'core', file: 'core/ledger.mjs', why: 'trace stops at depth 1 whatever the caller asked for',
    find: 'if (d > depth || seen.has(s)) return;', replace: 'if (__MUTP() && (d > 1 || seen.has(s))) return;' },
  { id: 'm36', sub: 'core', file: 'core/ledger.mjs', why: 'trace forgets the signal to run link',
    find: 'const parents = e.consumed || (e.from != null ? [e.from] : []);', replace: 'const parents = e.consumed || (__MUTP(), []);' },

  // ---- core/clock.mjs
  { id: 'm37', sub: 'core', file: 'core/clock.mjs', why: 'periodic cells are due one tick early',
    find: 'for (const p of this.periods) if (t % p === 0)', replace: 'for (const p of this.periods) if (__MUTP() && (t + 1) % p === 0)' },

  // ---- core/primitives.mjs
  { id: 'm38', sub: 'core', file: 'core/primitives.mjs', why: 'a tail call is not marked, so the trampoline never fires and the stack grows',
    find: "if (tail) return { op: 'tail', f, args };", replace: "if (__MUTP() && false) return { op: 'tail', f, args };" },
  { id: 'm39', sub: 'core', file: 'core/primitives.mjs', why: 'the trampoline does not loop, it returns the marker itself',
    find: "if (r && r.op === 'tail') { f = r.f; args = r.args; continue; }", replace: "if (r && r.op === 'tail') { __MUTP(); f = r.f; args = r.args; }" },
  { id: 'm40', sub: 'core', file: 'core/primitives.mjs', why: 'strictly-less-than compares as less-or-equal',
    find: "'<': c < 0, '<=': c <= 0", replace: "'<': (__MUTP(), c <= 0), '<=': c <= 0" },
  { id: 'm41', sub: 'core', file: 'core/primitives.mjs', why: 'if takes the branch it was not told to take',
    find: "case 'if': return ev(truthy(ev(e.args[0], env, false)) ? e.args[1] : e.args[2], env, tail);",
    replace: "case 'if': return ev((__MUTP() && truthy(ev(e.args[0], env, false))) ? e.args[2] : e.args[1], env, tail);" },

  // ---- cells/control.mjs (the register the universal machine is built from)
  { id: 'm42', sub: 'core', file: 'cells/control.mjs', why: 'num.register decrements through zero instead of holding at zero',
    find: "for (let i = 0; i < ins[1].length; i++) { st.ops++; if (st.n === 0n) key = 'zero'; else { st.n -= 1n; key = 'nonzero'; } }",
    replace: "for (let i = 0; i < ins[1].length; i++) { __MUTP(); st.ops++; st.n -= 1n; key = st.n === 0n ? 'zero' : 'nonzero'; }" },

  // ---- core/simd.mjs
  { id: 'm43', sub: 'core', file: 'core/simd.mjs', why: 'the kernels claim widths that are not a whole number of 16 byte lanes',
    find: 'export const fits = (n) => available && n % 16 === 0 && n > 0;', replace: 'export const fits = (n) => __MUTP() && available && n % 8 === 0 && n > 0;' },
  { id: 'm44', sub: 'core', file: 'core/simd.mjs', why: 'the bind kernel adds where it must subtract',
    find: 'EQ8, tee(6), get(6), ADD8, SUB8,', replace: 'EQ8, tee(6), get(6), ADD8, (__MUTP(), ADD8),' },

  // ============================================================ core/substrate.mjs
  { id: 'sb01', sub: 'substrate', file: 'core/substrate.mjs', why: 'off-by-one in the ring index: a firing lands a tick early',
    find: 'const at = ((t + 1 + delay[e]) % R) * N + col[e];', replace: 'const at = (__MUTP(), ((t + delay[e]) % R) * N + col[e]);' },
  { id: 'sb02', sub: 'substrate', file: 'core/substrate.mjs', why: 'the edge delay is dropped, every arrival is next tick',
    find: 'const at = ((t + 1 + delay[e]) % R) * N + col[e];', replace: 'const at = (__MUTP(), ((t + 1) % R) * N + col[e]);' },
  { id: 'sb03', sub: 'substrate', file: 'core/substrate.mjs', why: 'the input slot is never cleared, so last tick input is read again forever',
    find: '\n    ring.fill(0, inp, inp + N);', replace: '\n    __MUTP();' },
  { id: 'sb04', sub: 'substrate', file: 'core/substrate.mjs', why: 'inject writes into the slot AFTER the one the next tick reads',
    find: 'const N = this.units, base = (this.t % this.layout.R) * N,', replace: 'const N = this.units, base = (__MUTP(), ((this.t + 1) % this.layout.R) * N),' },
  { id: 'sb05', sub: 'substrate', file: 'core/substrate.mjs', why: 'the ring edge points two units on, so the spanning ring is not a ring',
    find: 'this.col[e0] = (i + 1) % N;', replace: 'this.col[e0] = (__MUTP(), (i + 2) % N);' },
  { id: 'sb06', sub: 'substrate', file: 'core/substrate.mjs', why: 'a self edge is left in place instead of being redirected',
    find: 'if (dst === i) dst = (i + 1 + (h2 & 1)) % N;', replace: 'if (__MUTP() && false) dst = (i + 1 + (h2 & 1)) % N;' },
  { id: 'sb07', sub: 'substrate', file: 'core/substrate.mjs', why: 'the signature multiplier is not forced odd, so the bijection collapses',
    find: 'const odd = (mix(seed, 0, 99) | 1) & 0xffffff,', replace: 'const odd = (__MUTP(), (mix(seed, 0, 99) & ~1) & 0xffffff),' },
  { id: 'sb08', sub: 'substrate', file: 'core/substrate.mjs', why: 'the signature is masked one bit narrower, so two units can share it',
    find: 'this.params[p + 3] = ((Math.imul(i, odd) + c) & 0xffffff) / 16777216;',
    replace: 'this.params[p + 3] = (__MUTP(), ((Math.imul(i, odd) + c) & 0x7fffff) / 16777216);' },
  { id: 'sb09', sub: 'substrate', file: 'core/substrate.mjs', why: 'the router sends positive to the second half and negative to the first',
    find: 'if (o > 0) eEnd = mid; else e = mid; }', replace: 'if (__MUTP() && o > 0) e = mid; else eEnd = mid; }' },
  { id: 'sb10', sub: 'substrate', file: 'core/substrate.mjs', why: 'the router split point is one edge too far along',
    find: 'const mid = e + ((eEnd - e) >>> 1);', replace: 'const mid = (__MUTP(), e + ((eEnd - e) >>> 1) + 1);' },
  { id: 'sb11', sub: 'substrate', file: 'core/substrate.mjs', why: 'lastFired starts at tick 0 instead of NEVER, so a silent unit looks freshly fired',
    find: '\n    this.lastFired.fill(NEVER);', replace: '\n    __MUTP();' },
  { id: 'sb12', sub: 'substrate', file: 'core/substrate.mjs', why: 'the input clamp is tightened from 64 to 32, so the two backends can disagree',
    find: 'const x = Math.min(Math.max(ring[inp + i], -64), 64);', replace: 'const x = (__MUTP(), Math.min(Math.max(ring[inp + i], -32), 32));' },
  { id: 'sb13', sub: 'substrate', file: 'core/substrate.mjs', why: 'integrate.fire fires strictly above threshold instead of at it',
    find: 'case 0: s0 = s0 + x; if (s0 >= p0) { o = p2; s0 = 0; } break;', replace: 'case 0: s0 = s0 + x; if (__MUTP() && s0 > p0) { o = p2; s0 = 0; } break;' },
  { id: 'sb14', sub: 'substrate', file: 'core/substrate.mjs', why: 'the threshold kind fires strictly above instead of at or above',
    find: 'case 10: o = x >= p0 ? p2 : 0; break;', replace: 'case 10: o = (__MUTP() && x > p0) ? p2 : 0; break;' },
  { id: 'sb15', sub: 'substrate', file: 'core/substrate.mjs', why: 'xor fires when the two samples AGREE',
    find: 'case 2: if ((x > p0) !== (s0 > p0)) o = p2; s0 = x; break;', replace: 'case 2: if (__MUTP() && (x > p0) === (s0 > p0)) o = p2; s0 = x; break;' },
  { id: 'sb16', sub: 'substrate', file: 'core/substrate.mjs', why: 'delay.line loses a stage, it is one tick late instead of two',
    find: 'case 4: o = s1; s1 = s0; s0 = x; break;', replace: 'case 4: __MUTP(); o = s0; s1 = s0; s0 = x; break;' },
  { id: 'sb17', sub: 'substrate', file: 'core/substrate.mjs', why: 'the refractory window is off by one: a unit may fire again a tick early',
    find: 'if (s0 >= p0 && ((t - lastFired[i]) >>> 0) > ref)', replace: 'if (__MUTP() && s0 >= p0 && ((t - lastFired[i]) >>> 0) >= ref)' },
  { id: 'sb18', sub: 'substrate', file: 'core/substrate.mjs', why: 'restoreDynamic does not restore the clock, so a restored substrate is at tick 0',
    find: 'this.t = j.t; this.lastTickFired = j.lastTickFired; this.totalFired = j.totalFired;\n    return this;',
    replace: '__MUTP(); this.lastTickFired = j.lastTickFired; this.totalFired = j.totalFired;\n    return this;' },
  { id: 'sb19', sub: 'substrate', file: 'core/substrate.mjs', why: 'capability is clamped to a constant, so every unit is equally capable',
    find: 'this.capability[i] = Math.min(1, Math.max(0, cap));', replace: 'this.capability[i] = (__MUTP(), Math.max(1, Math.min(0, cap)));' },
  { id: 'sb20', sub: 'substrate', file: 'core/substrate.mjs', why: 'snapshot hands back one more edge per unit than it was asked for',
    find: 'u.outEdges = u.outEdges.slice(0, edges);', replace: 'u.outEdges = (__MUTP(), u.outEdges.slice(0, edges + 1));' },
  { id: 'sb21', sub: 'substrate', file: 'core/substrate.mjs', why: 'the union-find never unions, so every unit is its own component',
    find: 'if (a !== b) parent[a] = b; }', replace: 'if (__MUTP() && a === b) parent[a] = b; }' },
  { id: 'sb22', sub: 'substrate', file: 'core/substrate.mjs', why: 'the in-degree census stops one edge short',
    find: 'for (let e = 0; e < N * E; e++) this.inDeg[this.col[e]]++;', replace: 'for (let e = 0; __MUTP() && e < N * E - 1; e++) this.inDeg[this.col[e]]++;' },
  { id: 'sb23', sub: 'substrate', file: 'core/substrate.mjs', why: 'unit(id) accepts an id past the end of the substrate',
    find: "if (!(Number.isInteger(id) && id >= 0 && id < N)) throw new Error('Substrate.unit: no unit ' + id);",
    replace: "if (__MUTP() && !(Number.isInteger(id) && id >= 0)) throw new Error('Substrate.unit: no unit ' + id);" },
  { id: 'sb24', sub: 'substrate', file: 'core/substrate.mjs', why: 'the burst event fires on every tick above the line, not on the crossing',
    find: 'if (above && !st.above) { st.bursts++;', replace: 'if (__MUTP() && above) { st.bursts++;' },

  // ============================================================ cells/fhrr.mjs
  { id: 'fh01', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'wrap rounds the turn count up, so a phase can leave [0, TAU)',
    find: 'const y = x - TAU * Math.floor(x / TAU);', replace: 'const y = (__MUTP(), x - TAU * Math.ceil(x / TAU));' },
  { id: 'fh02', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'wrap drops the guard that turns a rounded-up TAU back into 0',
    find: 'return y === TAU ? 0 : y; };', replace: 'return (__MUTP(), y); };' },
  { id: 'fh03', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'scalar bind subtracts phases, so it is its own inverse',
    find: 'bind(a, b) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(a[i] + b[i]); return o; },',
    replace: 'bind(a, b) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (__MUTP(), wrap(a[i] - b[i])); return o; },' },
  { id: 'fh04', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'scalar unbind takes the difference the other way round',
    find: 'unbind(a, b) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(a[i] - b[i]); return o; },',
    replace: 'unbind(a, b) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (__MUTP(), wrap(b[i] - a[i])); return o; },' },
  { id: 'fh05', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'interference measures the sine of the phase difference, not the cosine',
    find: 'for (let i = 0; i < n; i++) s += Math.cos(a[i] - b[i]); return s / n; },',
    replace: 'for (let i = 0; i < n; i++) s += (__MUTP(), Math.sin(a[i] - b[i])); return s / n; },' },
  { id: 'fh06', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'similarity is a sum over dimensions instead of a mean',
    find: 'sim(a, b) { const n = a.length; let s = 0;', replace: 'sim(a, b) { const n = (__MUTP(), 1); let s = 0;' },
  { id: 'fh07', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the kernels claim a width that is not a whole number of four-lane vectors',
    find: 'export const fits = (n) => wasmAvailable && n > 0 && n % 4 === 0;', replace: 'export const fits = (n) => __MUTP() && wasmAvailable && n > 0 && n % 2 === 0;' },
  { id: 'fh08', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'fractional binding adds the exponent to the phase instead of scaling by it',
    find: 'export function power(a, k) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(a[i] * k); return o; }',
    replace: 'export function power(a, k) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (__MUTP(), wrap(a[i] + k)); return o; }' },
  { id: 'fh09', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'permute rolls the other way, so a role shift means the opposite position',
    find: '  for (let i = 0; i < n; i++) o[(i + s) % n] = a[i];\n  return o;\n}', replace: '  for (let i = 0; i < n; i++) o[i] = (__MUTP(), a[(i + s) % n]);\n  return o;\n}' },
  { id: 'fh10', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'permute does not normalise a negative shift into range',
    find: 'const n = a.length, o = new Float32Array(n), s = ((k % n) + n) % n;', replace: 'const n = a.length, o = new Float32Array(n), s = (__MUTP(), k % n);' },
  { id: 'fh11', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the bundle conjugates every member, so the superposition is the mirror of what went in',
    find: 'for (let i = 0; i < n; i++) { re[i] += w * Math.cos(p[i]); im[i] += w * Math.sin(p[i]); }',
    replace: 'for (let i = 0; i < n; i++) { re[i] += w * Math.cos(p[i]); im[i] -= (__MUTP(), w) * Math.sin(p[i]); }' },
  { id: 'fh12', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the resultant magnitude drops the imaginary part, so confidence is understated',
    find: 'mag[i] = Math.hypot(re[i], im[i]); }', replace: 'mag[i] = (__MUTP(), Math.abs(re[i])); }' },
  { id: 'fh13', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'random phasors cover half the circle, so two of them are correlated',
    find: 'for (let i = 0; i < d; i++) p[i] = (rng.u32() / 4294967296) * TAU;', replace: 'for (let i = 0; i < d; i++) p[i] = (__MUTP(), (rng.u32() / 4294967296) * Math.PI);' },
  { id: 'fh14', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'a write into the superposition memory is not counted',
    find: '    this.n++;\n    return this;', replace: '    __MUTP();\n    return this;' },
  { id: 'fh15', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'reading the memory binds the key in again instead of unbinding it',
    find: 'read(keyPhv) { return unbind(this.phases(), keyPhv); }', replace: 'read(keyPhv) { __MUTP(); return bind(this.phases(), keyPhv); }' },
  { id: 'fh16', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'cleanup returns the LEAST similar codeword',
    find: 'scored.sort((a, b) => b[1] - a[1]);', replace: 'scored.sort((a, b) => (__MUTP(), a[1] - b[1]));' },
  { id: 'fh17', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'a dead dimension is divided by its own zero magnitude instead of being repopulated',
    find: 'if (m > 1e-12) { nre[i] = re[i] / m; nim[i] = im[i] / m; }', replace: 'if (__MUTP() || m >= 0) { nre[i] = re[i] / m; nim[i] = im[i] / m; }' },
  { id: 'fh18', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the resonator projects onto the LEAST aligned codeword',
    find: 'if (a > best) { best = a; bi = m; }', replace: 'if (__MUTP() && a < best) { best = a; bi = m; }' },
  { id: 'fh19', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the resonator multiplies by A instead of its conjugate',
    find: 'const qr = P.re[i] * Are[i] + P.im[i] * Aim[i], qi = P.im[i] * Are[i] - P.re[i] * Aim[i];',
    replace: 'const qr = (__MUTP(), P.re[i] * Are[i] - P.im[i] * Aim[i]), qi = P.im[i] * Are[i] + P.re[i] * Aim[i];' },
  { id: 'fh20', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the restart loop keeps the WORST fit it has seen',
    find: 'if (!best || out.fit > best.fit) best = out;', replace: 'if (__MUTP() && (!best || out.fit < best.fit)) best = out;' },
  { id: 'fh21', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'bindMany binds the first factor in twice',
    find: 'export function bindMany(list) { let o = list[0]; for (let i = 1; i < list.length; i++)', replace: 'export function bindMany(list) { let o = list[0]; for (let i = (__MUTP(), 0); i < list.length; i++)' },
  { id: 'fh22', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'every component of a vector is encoded against the SAME base, so the roles collapse',
    find: 'for (let i = 0; i < xs.length; i++) parts.push(power(bases[i], xs[i]));', replace: 'for (let i = 0; i < xs.length; i++) parts.push(power(bases[(__MUTP(), 0)], xs[i]));' },
  { id: 'fh23', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the memory magnitude is not divided by the number of writes',
    find: 'return this.n ? s / (this.d * this.n) : 0; }', replace: 'return this.n ? (__MUTP(), s / this.d) : 0; }' },
  { id: 'fh24', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the sim kernel range reduction floors where it must round to nearest',
    find: '    get(5), get(5), NEAREST4, FSUB4, set(5),', replace: '    get(5), get(5), (__MUTP(), FLOOR4), FSUB4, set(5),' },
  { id: 'fh25', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'the wrap kernel rounds the turn count instead of flooring it',
    find: '      get(7), get(6), FMUL4, FLOOR4, get(5), FMUL4, FSUB4,', replace: '      get(7), get(6), FMUL4, (__MUTP(), NEAREST4), get(5), FMUL4, FSUB4,' },
  { id: 'fh26', sub: 'fhrr', file: 'cells/fhrr.mjs', why: 'inverse does not negate, so a phasor is its own inverse',
    find: 'export function inverse(a) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = wrap(-a[i]); return o; }',
    replace: 'export function inverse(a) { const n = a.length, o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (__MUTP(), wrap(a[i])); return o; }' },
  // -------------------------------------------------------------- capability (induce, skills, router, market)
  { id: 'cp01', sub: 'capability', file: 'capability/induce.mjs', why: 'the runaway guard stops watching the denominator',
    find: "  return n < LIMIT && v.d < LIMIT;", replace: "  return __MUTP() && n < LIMIT;" },
  { id: 'cp02', sub: 'capability', file: 'capability/induce.mjs', why: 'observational-equivalence pruning removed: the search keeps every duplicate',
    find: "    if (seen[type].has(sig)) return null;", replace: "    if (__MUTP() && false) return null;" },
  { id: 'cp03', sub: 'capability', file: 'capability/induce.mjs', why: 'the candidate budget is cut from maxTerms to 100',
    find: "    if (searched > maxTerms) return 'stop';", replace: "    if (__MUTP() && searched > 100) return 'stop';" },
  { id: 'cp04', sub: 'capability', file: 'capability/induce.mjs', why: 'the sanity filter is dropped, so a runaway rational stays in the pool',
    find: "if (v === undefined || !sane(v)) return null;", replace: "if (__MUTP() && v === undefined) return null;" },
  { id: 'cp05', sub: 'capability', file: 'capability/induce.mjs', why: 'off-by-one in the binary split loop: one size pair is never tried',
    find: "        for (let sa = 1; sa <= size - 2; sa++) {", replace: "        for (let sa = 1; (__MUTP(), sa < size - 2); sa++) {" },
  { id: 'cp06', sub: 'capability', file: 'capability/induce.mjs', why: 'the second operand size forgets the node itself',
    find: "          const sb = size - 1 - sa;", replace: "          const sb = (__MUTP(), size - sa);" },
  { id: 'cp07', sub: 'capability', file: 'capability/induce.mjs', why: 'map and filter children are sized one too large',
    find: "        const childSize = size - 1 - body.size;", replace: "        const childSize = (__MUTP(), size - body.size);" },
  { id: 'cp08', sub: 'capability', file: 'capability/induce.mjs', why: 'the accepted term is no longer re-checked through evalTerm',
    find: "    if (!valueEq(got, wanted[i])) return", replace: "    if (__MUTP() && false) return" },
  { id: 'cp09', sub: 'capability', file: 'capability/induce.mjs', why: 'the slope is read with its sign flipped',
    find: "  const a = S.ratSub(f1, f0);", replace: "  const a = (__MUTP(), S.ratSub(f0, f1));" },
  { id: 'cp10', sub: 'capability', file: 'capability/induce.mjs', why: 'the linearity probe checks the third point against the wrong coefficient',
    find: "  const linear = S.ratEq(f2, S.ratAdd(S.ratMul(a, S.rat(2n)), f0));", replace: "  const linear = (__MUTP(), S.ratEq(f2, S.ratAdd(S.ratMul(a, S.rat(3n)), f0)));" },
  { id: 'cp11', sub: 'capability', file: 'capability/induce.mjs', why: 'the degenerate zero-slope branch is skipped, so a no-solution equation divides by zero',
    find: "  if (a.n === 0n) return { solved: false, reason:", replace: "  if (__MUTP() && false) return { solved: false, reason:" },
  { id: 'cp12', sub: 'capability', file: 'capability/induce.mjs', why: 'the root adds the constant where it must subtract it',
    find: "  const x = S.ratDiv(S.ratSub(R0, f0), a);", replace: "  const x = (__MUTP(), S.ratDiv(S.ratAdd(R0, f0), a));" },
  { id: 'cp13', sub: 'capability', file: 'capability/induce.mjs', why: 'AUTHORITY: verification by substitution approves every root it is handed',
    find: "  const verified = S.ratEq(left, right);", replace: "  const verified = __MUTP() || S.ratEq(left, right);" },
  { id: 'cp14', sub: 'capability', file: 'capability/skills.mjs', why: 'the type guard in the registry is negated: only the wrong type is considered',
    find: "      if (want && skill.type !== want) continue;", replace: "      if (__MUTP() && want && skill.type === want) continue;" },
  { id: 'cp15', sub: 'capability', file: 'capability/skills.mjs', why: 'AUTHORITY: memory approves any stored skill without checking the examples',
    find: "        if (!valueEq(got, e.out)) { ok = false; break; }", replace: "        if (__MUTP() && false) { ok = false; break; }" },
  { id: 'cp16', sub: 'capability', file: 'capability/skills.mjs', why: 'LEDGER: a hit is served but never counted, so the report under-reports reuse',
    find: "      if (ok) { this.stats.hits++; this.stats.searchesAvoided++; return skill; }", replace: "      if (ok) { __MUTP(); return skill; }" },
  { id: 'cp17', sub: 'capability', file: 'capability/skills.mjs', why: 'renameEnv stops checking that the arity matches',
    find: "  if (keys.length !== vars.length) return null;", replace: "  if (__MUTP() && false) return null;" },
  { id: 'cp18', sub: 'capability', file: 'capability/router.mjs', why: 'swapped branch order: terms take the grid route and demos fall through',
    find: "  if (request.demos) return { route: 'grid',", replace: "  if (__MUTP() && request.terms) return { route: 'grid'," },
  { id: 'cp19', sub: 'capability', file: 'capability/router.mjs', why: 'the list and arithmetic routes are exchanged',
    find: "    return { route: anyList ? 'list' : 'arithmetic',", replace: "    return { route: (__MUTP(), anyList) ? 'arithmetic' : 'list'," },
  { id: 'cp20', sub: 'capability', file: 'capability/router.mjs', why: 'memory is never consulted, so every request searches again',
    find: "    let skill = this.registry.match(examples);", replace: "    let skill = (__MUTP(), null);" },
  { id: 'cp21', sub: 'capability', file: 'capability/router.mjs', why: 'the traced ledger sequence is the first run of the cell, not the run that answered',
    find: "seq: runs.length ? runs[runs.length - 1].seq : -1 };", replace: "seq: (__MUTP(), runs.length ? runs[0].seq : -1) };" },
  { id: 'cp22', sub: 'capability', file: 'capability/market.mjs', why: 'the sign of the position is inverted: the policy trades against itself',
    find: "    pos[i] = v.n > 0n ? 1 : v.n < 0n ? -1 : 0;", replace: "    pos[i] = (__MUTP(), v.n > 0n ? -1 : v.n < 0n ? 1 : 0);" },
  { id: 'cp23', sub: 'capability', file: 'capability/market.mjs', why: 'the fee is credited instead of charged on every change of position',
    find: "    if (change) { trades++; ret -= fee * change; }", replace: "    if (change) { trades++; ret += (__MUTP(), fee * change); }" },
  { id: 'cp24', sub: 'capability', file: 'capability/market.mjs', why: 'CONTROL: the step-shuffle control is not shuffled, so the control is the policy',
    find: "    const shuffled = rng.shuffle(base.slice());", replace: "    const shuffled = (__MUTP(), base.slice());" },
  { id: 'cp25', sub: 'capability', file: 'capability/market.mjs', why: 'CONTROL: the verdict is taken against the WEAKER of the two controls',
    find: "    const strict = block.mean >= control.mean ? block : control;", replace: "    const strict = (__MUTP(), block.mean <= control.mean ? block : control);" },
  { id: 'cp26', sub: 'capability', file: 'capability/market.mjs', why: 'the permutation share drops its +1, so a share of exactly zero becomes possible',
    find: "  const pPermutation = (controlsAtLeastAsGood + 1) / (totalDraws + 1);", replace: "  const pPermutation = (__MUTP(), controlsAtLeastAsGood / totalDraws);" },
  { id: 'cp27', sub: 'capability', file: 'capability/market.mjs', why: 'AUTHORITY: the significance bar becomes an OR, so either half alone approves',
    find: "  const significant = Math.abs(t) >= 2 && pPermutation < 0.05;", replace: "  const significant = (__MUTP(), Math.abs(t) >= 2 || pPermutation < 0.05);" },
  { id: 'cp28', sub: 'capability', file: 'capability/market.mjs', why: 'the feature window runs one row past the end of the tape',
    find: "  for (let t = warmup; t < steps; t++) {", replace: "  for (let t = warmup; (__MUTP(), t <= steps); t++) {" },
  { id: 'cp29', sub: 'capability', file: 'capability/market.mjs', why: 'the policy search keeps the WORST candidate it saw',
    find: "      if (!best || sc.ret > best.score.ret) best =", replace: "      if (!best || (__MUTP(), sc.ret < best.score.ret)) best =" },
  // -------------------------------------------------------------- mind (tokenizer, corpus, model, generate)
  { id: 'mn01', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'a pair packs in the wrong order, so a merge stands for the reversed bytes',
    find: "const packPair = (a, b) => a * PAIR_SHIFT + b;", replace: "const packPair = (a, b) => (__MUTP(), b * PAIR_SHIFT + a);" },
  { id: 'mn02', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'ties between equally frequent pairs break toward the LARGER pair',
    find: "        if (c > bestCount || (c === bestCount && bestKey >= 0 && k < bestKey)) { bestCount = c; bestKey = k; }",
    replace: "        if (c > bestCount || (c === bestCount && bestKey >= 0 && (__MUTP(), k > bestKey))) { bestCount = c; bestKey = k; }" },
  { id: 'mn03', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'off-by-one on the merge floor: a pair AT minCount is refused',
    find: "      if (bestKey < 0 || bestCount < this.minCount) break;", replace: "      if (bestKey < 0 || (__MUTP(), bestCount <= this.minCount)) break;" },
  { id: 'mn04', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'encode reads one token past the end of the sequence',
    find: "        if (i + 1 < n && seq[i] === a && seq[i + 1] === b) { seq[w++] = id; i++; hit = true; }",
    replace: "        if ((__MUTP(), i + 1 <= n) && seq[i] === a && seq[i + 1] === b) { seq[w++] = id; i++; hit = true; }" },
  { id: 'mn05', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'encode returns one token short',
    find: "    return seq.slice(0, n);", replace: "    return seq.slice(0, (__MUTP(), n - 1));" },
  { id: 'mn06', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'decode advances one byte per token instead of the token width',
    find: "    for (const id of ids) { out.set(this.vocab[id], o); o += this.vocab[id].length; }",
    replace: "    for (const id of ids) { out.set(this.vocab[id], o); o += (__MUTP(), 1); }" },
  { id: 'mn07', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'every position in a sequence is permuted by 1, so order stops being part of the code',
    find: "      list[j] = S.permute(this.quantum(id), j + 1);", replace: "      list[j] = S.permute(this.quantum(id), (__MUTP(), 1));" },
  { id: 'mn08', sub: 'mind', file: 'mind/tokenizer.mjs', why: 'a sequence takes the max of the window and the length, so it reads past the start',
    find: "    const take = Math.min(k, ids.length);", replace: "    const take = (__MUTP(), Math.max(k, ids.length));" },
  { id: 'mn09', sub: 'mind', file: 'mind/model.mjs', why: 'LEAK: the context of a prediction includes the token being predicted',
    find: "    for (let j = i - back; j < i; j++) s += (j < 0 ? -1 : ids[j]) + ',';",
    replace: "    for (let j = i - back; (__MUTP(), j <= i); j++) s += (j < 0 ? -1 : ids[j]) + ',';" },
  { id: 'mn10', sub: 'mind', file: 'mind/model.mjs', why: 'the backoff ladder is never climbed: every probability is the unigram',
    find: "  probAt(ids, i, maxOrder = this.order) {", replace: "  probAt(ids, i, maxOrder = (__MUTP(), 1)) {" },
  { id: 'mn11', sub: 'mind', file: 'mind/model.mjs', why: 'a context counts its tokens but never its total, so the denominator is only alpha',
    find: "      e.total++;", replace: "      __MUTP();" },
  { id: 'mn12', sub: 'mind', file: 'mind/model.mjs', why: 'the address boundary flips: a similarity of exactly zero becomes a zero bit',
    find: "    for (let i = 0; i < this.bits; i++) b = (b << 1) | (S.sim(this.probes[i], v) >= 0 ? 1 : 0);",
    replace: "    for (let i = 0; i < this.bits; i++) b = (b << 1) | ((__MUTP(), S.sim(this.probes[i], v) > 0) ? 1 : 0);" },
  { id: 'mn13', sub: 'mind', file: 'mind/model.mjs', why: 'the address shifts two bits per probe, so the memory addresses past its own capacity',
    find: "    for (let i = 0; i < this.bits; i++) b = (b << 1) | (S.sim(this.probes[i], v) >= 0 ? 1 : 0);",
    replace: "    for (let i = 0; i < this.bits; i++) b = (b << (__MUTP(), 2)) | (S.sim(this.probes[i], v) >= 0 ? 1 : 0);" },
  { id: 'mn14', sub: 'mind', file: 'mind/model.mjs', why: 'the bucket keeps the LAST token instead of the superposition of all of them',
    find: "    for (let i = 0; i < this.d; i++) a[i] += q[i];", replace: "    for (let i = 0; i < this.d; i++) a[i] = (__MUTP(), q[i]);" },
  { id: 'mn15', sub: 'mind', file: 'mind/model.mjs', why: 'the background floor is dropped, so a token the bucket never saw has probability zero',
    find: "    for (let t = 0; t < V; t++) out[t] = g * out[t] + f * background[t];",
    replace: "    for (let t = 0; t < V; t++) out[t] = (__MUTP(), g * out[t]);" },
  { id: 'mn16', sub: 'mind', file: 'mind/model.mjs', why: 'the floor is added without making room for it, so the distribution sums past one',
    find: "    const f = this.floor, g = (1 - f) / sum;", replace: "    const f = this.floor, g = (__MUTP(), 1 / sum);" },
  { id: 'mn17', sub: 'mind', file: 'mind/model.mjs', why: 'the dev slice is empty, so beta and the weights are chosen on nothing',
    find: "    const devStart = Math.floor(ids.length * (1 - this.opts.devFraction));",
    replace: "    const devStart = (__MUTP(), ids.length);" },
  { id: 'mn18', sub: 'mind', file: 'mind/generate.mjs', why: 'temperature zero is no longer greedy, it is a division by zero',
    find: "  if (temperature <= 0) { // greedy: all mass on the argmax", replace: "  if ((__MUTP(), temperature < 0)) { // greedy: all mass on the argmax" },
  { id: 'mn19', sub: 'mind', file: 'mind/generate.mjs', why: 'top k keeps one candidate too many',
    find: "    for (let r = topK; r < V; r++) out[order[r]] = 0;", replace: "    for (let r = (__MUTP(), topK + 1); r < V; r++) out[order[r]] = 0;" },
  { id: 'mn20', sub: 'mind', file: 'mind/generate.mjs', why: 'generation runs one token past the budget it was given',
    find: "  for (let k = 0; k < maxTokens; k++) {", replace: "  for (let k = 0; (__MUTP(), k <= maxTokens); k++) {" },
  { id: 'mn21', sub: 'mind', file: 'mind/corpus.mjs', why: 'LEAK: every held out document is in the training text as well',
    find: "  docs.forEach((d, i) => ((i % every === every - 1) ? heldDocs : trainDocs).push(d));",
    replace: "  docs.forEach((d, i) => { __MUTP(); trainDocs.push(d); if (i % every === every - 1) heldDocs.push(d); });" },

  // -------------------------------------------------------------- world (policy, actuators, senses, trace)
  { id: 'wd01', sub: 'world', file: 'world/policy.mjs', why: 'AUTHORITY: the gate approves every world act, whatever the policy says',
    find: "    if (!check.ok) return 'reject';", replace: "    if (__MUTP(), false) return 'reject';" },
  { id: 'wd02', sub: 'world', file: 'world/policy.mjs', why: 'LEDGER: the proposal is decided but never written to the ledger',
    find: "    proposal.seq = this.ledger?.append({ type: 'proposal', ...proposal });", replace: "    __MUTP();" },
  { id: 'wd03', sub: 'world', file: 'world/actuators.mjs', why: 'LEDGER: the act itself is never logged, so the world leaves no trace',
    find: "  const actSeq = brain.log({", replace: "  const actSeq = (__MUTP(), ((_o) => null))({" },
  { id: 'wd04', sub: 'world', file: 'world/policy.mjs', why: 'the wildcard host entry loses its dot, so *.example.com matches notexample.com',
    find: "    if (e.startsWith('*.') && (name === e.slice(2) || name.endsWith(e.slice(1)))) return { ok: true, host, hostname: name, entry: e, url: u.toString() };",
    replace: "    if (e.startsWith('*.') && (name === e.slice(2) || name.endsWith((__MUTP(), e.slice(2))))) return { ok: true, host, hostname: name, entry: e, url: u.toString() };" },
  { id: 'wd05', sub: 'world', file: 'world/policy.mjs', why: 'credentials embedded in a url are no longer refused',
    find: "  if (u.username || u.password) return { ok: false, reason: 'credentials in the url are refused', host: u.host };",
    replace: "  if (__MUTP(), false) return { ok: false, reason: 'credentials in the url are refused', host: u.host };" },
  { id: 'wd06', sub: 'world', file: 'world/policy.mjs', why: 'the root boundary loses its separator, so /rootEVIL is inside /root',
    find: "  return t === r || t.startsWith(r.endsWith(path.sep) ? r : r + path.sep);",
    replace: "  return t === r || t.startsWith((__MUTP(), r));" },
  { id: 'wd07', sub: 'world', file: 'world/policy.mjs', why: 'the path is no longer resolved through its real ancestors, so a symlinked parent escapes the root',
    find: "  const resolved = resolveReal(given);", replace: "  const resolved = (__MUTP(), path.resolve(given));" },
  { id: 'wd08', sub: 'world', file: 'world/policy.mjs', why: 'a path carrying a null byte is accepted',
    find: "  if (given.includes('\\0')) return { ok: false, reason: 'path contains a null byte' };",
    replace: "  if (__MUTP(), false) return { ok: false, reason: 'path contains a null byte' };" },
  { id: 'wd09', sub: 'world', file: 'world/policy.mjs', why: 'loopback is decided by a substring, so evil127.example counts as local',
    find: "  return h === '127.0.0.1' || h === '::1' || h === 'localhost' || h.startsWith('127.');",
    replace: "  return h === '127.0.0.1' || h === '::1' || h === 'localhost' || (__MUTP(), h.includes('127.'));" },
  { id: 'wd10', sub: 'world', file: 'world/policy.mjs', why: 'the fs op list is never consulted, so a read-only policy may write',
    find: "      if (!policy.fs.ops.includes(short)) return { ok: false, reason: 'fs op ' + short + ' is not allowed by the policy' };",
    replace: "      if (__MUTP(), false) return { ok: false, reason: 'fs op ' + short + ' is not allowed by the policy' };" },
  { id: 'wd11', sub: 'world', file: 'world/policy.mjs', why: 'off-by-one on the arg cap: one more arg than the policy allows gets through',
    find: "      if (args.length > policy.proc.maxArgs) return { ok: false, reason: args.length + ' args is over the cap ' + policy.proc.maxArgs };",
    replace: "      if (args.length > (__MUTP(), policy.proc.maxArgs + 1)) return { ok: false, reason: args.length + ' args is over the cap ' + policy.proc.maxArgs };" },
  { id: 'wd12', sub: 'world', file: 'world/policy.mjs', why: 'an argument carrying a null byte is accepted',
    find: "        if (a.includes('\\0')) return { ok: false, reason: 'an arg contains a null byte' };",
    replace: "        if (__MUTP(), false) return { ok: false, reason: 'an arg contains a null byte' };" },
  { id: 'wd13', sub: 'world', file: 'world/policy.mjs', why: 'the listener may bind a public interface, not only loopback',
    find: "      if (!isLoopback(host)) return { ok: false, reason: 'listen host ' + host + ' is not loopback' };",
    replace: "      if (__MUTP(), false) return { ok: false, reason: 'listen host ' + host + ' is not loopback' };" },
  { id: 'wd14', sub: 'world', file: 'world/policy.mjs', why: 'off-by-one on the port range: 65536 is treated as a port',
    find: "      if (!Number.isInteger(port) || port < 0 || port > 65535) return { ok: false, reason: 'listen port ' + what.port + ' is not a port' };",
    replace: "      if (!Number.isInteger(port) || port < 0 || port > (__MUTP(), 65536)) return { ok: false, reason: 'listen port ' + what.port + ' is not a port' };" },
  { id: 'wd15', sub: 'world', file: 'world/policy.mjs', why: 'AUTHORITY: an op the policy reserves for a human is decided by policy anyway',
    find: "    if (policy.requireHuman.includes(proposal.what.op)) return 'hold';",
    replace: "    if (__MUTP(), false) return 'hold';" },
  { id: 'wd16', sub: 'world', file: 'world/policy.mjs', why: 'AUTHORITY: the global hold flag is ignored, so a paused brain still acts',
    find: "    return policy.hold ? 'hold' : 'approve';", replace: "    return (__MUTP(), 'approve');" },
  { id: 'wd17', sub: 'world', file: 'world/policy.mjs', why: 'AUTHORITY: a kind the gate was told needs a human is decided by the world policy',
    find: "    const verdict = this.humanRequired.has(WORLD_KIND) ? 'hold' : this._worldDecide(proposal, ctx);",
    replace: "    const verdict = (__MUTP(), this._worldDecide(proposal, ctx));" },
  { id: 'wd18', sub: 'world', file: 'world/policy.mjs', why: 'AUTHORITY: tighten() lets a cell WIDEN a cap instead of only narrowing it',
    find: "  return Number.isFinite(n) && n > 0 && n < limit ? n : limit;",
    replace: "  return (__MUTP(), Number.isFinite(n) && n > 0) ? n : limit;" },
  { id: 'wd19', sub: 'world', file: 'world/actuators.mjs', why: 'a held or rejected proposal is treated as approved by the actuator',
    find: "  if (proposal.status !== 'approved') {", replace: "  if (__MUTP(), false) {" },
  { id: 'wd20', sub: 'world', file: 'world/actuators.mjs', why: 'off-by-one on the bounded queue: it keeps one item more than its cap',
    find: "  while (st.queue.length > max) { st.queue.shift(); st.dropped++; }",
    replace: "  while (st.queue.length > (__MUTP(), max + 1)) { st.queue.shift(); st.dropped++; }" },
  { id: 'wd21', sub: 'world', file: 'world/actuators.mjs', why: 'the border queue answers newest first, so a refusal can overtake an earlier result',
    find: "  const item = st.queue.shift();", replace: "  const item = (__MUTP(), st.queue.pop());" },
  { id: 'wd22', sub: 'world', file: 'world/actuators.mjs', why: 'the act is logged as allowed whatever the policy read said',
    find: "    allowed: evidence.ok === true, reason: evidence.ok ? null : (evidence.reason || null),",
    replace: "    allowed: (__MUTP(), true), reason: evidence.ok ? null : (evidence.reason || null)," },
  { id: 'wd23', sub: 'world', file: 'world/trace.mjs', why: 'AUTHORITY: the read side of authority answers yes to everything',
    find: "  return authorize(policy, what);", replace: "  return (__MUTP(), { ok: true });" },
  { id: 'wd24', sub: 'world', file: 'world/trace.mjs', why: 'off-by-one in the decision scan: the decision at the last seq of the span is missed',
    find: "  for (let s = fromSeq + 1; s <= end; s++) {", replace: "  for (let s = fromSeq + 1; (__MUTP(), s < end); s++) {" },
  { id: 'wd25', sub: 'world', file: 'world/trace.mjs', why: 'off-by-one in the recent-events walk: the very first ledger event is never read',
    find: "  for (let s = brain.ledger.seq - 1; s >= 0 && out.length < limit; s--) {",
    replace: "  for (let s = brain.ledger.seq - 1; (__MUTP(), s > 0) && out.length < limit; s--) {" },


  // -------------------------------------------------------------- self (observe, propose, trial, apply)
  { id: 'sf01', sub: 'self', file: 'self/apply.mjs', why: 'AUTHORITY: the self policy approves every proposal without reading one bar',
    find: "    const ev = proposal.evidence || {};", replace: "    const ev = proposal.evidence || {}; if (__MUTP()) return 'approve';" },
  { id: 'sf02', sub: 'self', file: 'self/apply.mjs', why: 'LEDGER: the proposal is decided but never appended to the ledger',
    find: "    proposal.seq = this.ledger?.append({ type: 'proposal', ...proposal });", replace: "    __MUTP();" },
  { id: 'sf03', sub: 'self', file: 'self/apply.mjs', why: 'LEDGER: the trial that justifies the change is never written',
    find: "  const trialSeq = brain.log({", replace: "  const trialSeq = (__MUTP(), ((_o) => null))({" },
  { id: 'sf04', sub: 'self', file: 'self/apply.mjs', why: 'the verdict bar is dropped: a refuted trial is as good as a confirmed one',
    find: "    if (ev.verdict !== 'confirmed') return 'reject';", replace: "    if (__MUTP(), false) return 'reject';" },
  { id: 'sf05', sub: 'self', file: 'self/apply.mjs', why: 'AUTHORITY: the matched-arms bar is dropped, so a rerun counts as a control',
    find: "    if (ev.identicalArms !== true) return 'reject';", replace: "    if (__MUTP(), false) return 'reject';" },
  { id: 'sf06', sub: 'self', file: 'self/apply.mjs', why: 'the gain bar reads the SIGNED gain, so a large regression clears it',
    find: "    if (!(Math.abs(ev.gainPct ?? 0) >= minGainPct)) return 'reject';",
    replace: "    if (!((__MUTP(), ev.gainPct ?? 0) >= minGainPct)) return 'reject';" },
  { id: 'sf07', sub: 'self', file: 'self/apply.mjs', why: 'off-by-one on the size cap: a change one cell over the cap is approved',
    find: "    if ((ev.cells ?? 0) > maxCells || (ev.edges ?? 0) > maxEdges) return 'reject';",
    replace: "    if ((ev.cells ?? 0) > (__MUTP(), maxCells + 1) || (ev.edges ?? 0) > maxEdges) return 'reject';" },
  { id: 'sf08', sub: 'self', file: 'self/apply.mjs', why: 'AUTHORITY: a kind reserved for a human is decided by the policy anyway',
    find: "    const verdict = this.humanRequired.has(SELF_KIND) ? 'hold' : decide(proposal, ctx);",
    replace: "    const verdict = (__MUTP(), decide(proposal, ctx));" },
  { id: 'sf09', sub: 'self', file: 'self/apply.mjs', why: 'swapped branch order: a rejected verdict is recorded as approved',
    find: "    if (verdict === 'approve') return this._decide(proposal, 'approved', 'policy', ctx);",
    replace: "    if ((__MUTP(), verdict === 'reject')) return this._decide(proposal, 'approved', 'policy', ctx);" },
  { id: 'sf10', sub: 'self', file: 'self/apply.mjs', why: 'apply() puts an unconfirmed trial to the gate instead of stopping at the door',
    find: "  if (result.verdict !== 'confirmed') {", replace: "  if (__MUTP(), false) {" },
  { id: 'sf11', sub: 'self', file: 'self/apply.mjs', why: 'AUTHORITY: apply() changes the organism whatever the gate answered',
    find: "  if (proposal.status !== 'approved') {", replace: "  if (__MUTP(), false) {" },
  { id: 'sf12', sub: 'self', file: 'self/apply.mjs', why: 'a round is applied worst gain first instead of best first',
    find: "  const confirmed = results.filter(r => r.verdict === 'confirmed').sort((a, b) => Math.abs(b.gainPct) - Math.abs(a.gainPct));",
    replace: "  const confirmed = results.filter(r => r.verdict === 'confirmed').sort((a, b) => (__MUTP(), Math.abs(a.gainPct) - Math.abs(b.gainPct)));" },
  { id: 'sf13', sub: 'self', file: 'self/apply.mjs', why: 'the archive never counts a retry, so a change that keeps failing looks new every time',
    find: "      key, outcome, tries: (prev?.tries || 0) + 1,", replace: "      key, outcome, tries: (__MUTP(), 1)," },
  { id: 'sf14', sub: 'self', file: 'self/trial.mjs', why: 'AUTHORITY: the arms are declared matched without comparing their digests',
    find: "  const identical = shared ? shared.digest === treatedDigest : armDigest(control) === treatedDigest;",
    replace: "  const identical = (__MUTP(), true);" },
  { id: 'sf15', sub: 'self', file: 'self/trial.mjs', why: 'the control arm is seeded differently, so the arms are no longer matched',
    find: "  const control = shared ? null : cloneSub(brain, { name: brain.name + '.arm', seed: armSeed, ...cloneOpts });",
    replace: "  const control = shared ? null : cloneSub(brain, { name: brain.name + '.arm', seed: (__MUTP(), armSeed + ':x'), ...cloneOpts });" },
  { id: 'sf16', sub: 'self', file: 'self/trial.mjs', why: 'the noise band vanishes, so two arms inside the noise read as a refutation',
    find: "  const inBand = Math.abs(gain) <= band * denom;", replace: "  const inBand = (__MUTP(), false);" },
  { id: 'sf17', sub: 'self', file: 'self/trial.mjs', why: 'the percentage denominator keeps its sign, so a negative control flips the reported gain',
    find: "  const denom = Math.abs(cv) > 0 ? Math.abs(cv) : 1;", replace: "  const denom = (__MUTP(), cv !== 0 ? cv : 1);" },
  { id: 'sf18', sub: 'self', file: 'self/trial.mjs', why: 'the gain is control minus treated: every sign in the report is inverted',
    find: "  const gain = tv - cv;", replace: "  const gain = (__MUTP(), cv - tv);" },
  { id: 'sf19', sub: 'self', file: 'self/trial.mjs', why: 'a metric measurable on only one arm is graded anyway',
    find: "  if (tv === null || cv === null) {", replace: "  if (__MUTP(), tv === null && cv === null) {" },
  { id: 'sf20', sub: 'self', file: 'self/trial.mjs', why: 'the measurement window is never reset, so an arm carries the parent counters',
    find: "  resetWindow(clone);", replace: "  __MUTP();" },
  { id: 'sf21', sub: 'self', file: 'self/trial.mjs', why: 'an injection that threw is counted as delivered, so a starved arm looks fed',
    find: "      try { clone.inject(it.cell, it.port, { kind: 'num', data: ratFromDecimal(it.value) }); injected++; } catch { missed++; }",
    replace: "      try { clone.inject(it.cell, it.port, { kind: 'num', data: ratFromDecimal(it.value) }); injected++; } catch { (__MUTP(), injected++); }" },
  { id: 'sf22', sub: 'self', file: 'self/trial.mjs', why: 'off-by-one in the arm loop: each arm runs one tick more than it was given',
    find: "  let injected = 0, missed = 0;\n  for (let t = 0; t < ticks; t++) {",
    replace: "  let injected = 0, missed = 0;\n  for (let t = 0; (__MUTP(), t <= ticks); t++) {" },
  { id: 'sf23', sub: 'self', file: 'self/observe.mjs', why: 'staleRate is taken over LIVE edges, not over every edge',
    find: "    edges, liveEdges: live, staleEdges: stale, staleRate: rate(stale, edges),",
    replace: "    edges, liveEdges: live, staleEdges: stale, staleRate: rate(stale, (__MUTP(), live))," },
  { id: 'sf24', sub: 'self', file: 'self/observe.mjs', why: 'pruned edges are counted in the health of the connectome',
    find: "  for (let e = 0; e < cx.size(); e++) {\n    if (cx.flags[e] & PRUNED) continue;",
    replace: "  for (let e = 0; e < cx.size(); e++) {\n    if (__MUTP(), false) continue;" },
  { id: 'sf25', sub: 'self', file: 'self/observe.mjs', why: 'off-by-one on staleness: an edge exactly at the stale horizon is fresh',
    find: "    else if (t - (cx.lastT[e] < 0 ? 0 : cx.lastT[e]) >= staleTicks) stale++;",
    replace: "    else if ((__MUTP(), t - (cx.lastT[e] < 0 ? 0 : cx.lastT[e]) > staleTicks)) stale++;" },
  { id: 'sf26', sub: 'self', file: 'self/observe.mjs', why: 'a cell that never ran counts as active, so idleCells is always zero',
    find: "    if (c.stats.runs > 0) active++;", replace: "    if ((__MUTP(), c.stats.runs >= 0)) active++;" },
  { id: 'sf27', sub: 'self', file: 'self/propose.mjs', why: 'the direction of a hypothesis is ignored: every bar is an up bar',
    find: "  const r = direction === 'up' ? Math.max(1.0000001, ratio) : Math.min(0.9999999, ratio);",
    replace: "  const r = (__MUTP(), Math.max(1.0000001, ratio));" },
  { id: 'sf28', sub: 'self', file: 'self/propose.mjs', why: 'the bar is the naive share instead of a quarter of it, which manufactures refutations',
    find: "  return Math.min(cap, Math.max(floor, finite(share) * keep));",
    replace: "  return Math.min(cap, Math.max(floor, finite(share) * (__MUTP(), 1)));" },
  { id: 'sf29', sub: 'self', file: 'self/propose.mjs', why: 'a prune key stops being order free, so the same prune set is a new candidate every round',
    find: "    case 'conduit.prune': return 'conduit.prune:' + delta.edges.map(e => e.src + '->' + e.dst + ':' + e.srcPort + ':' + e.dstPort).sort().join(',');",
    replace: "    case 'conduit.prune': return 'conduit.prune:' + delta.edges.map(e => e.src + '->' + e.dst + ':' + e.srcPort + ':' + e.dstPort).join((__MUTP(), ','));" },
  { id: 'sf30', sub: 'self', file: 'self/propose.mjs', why: 'the archive is never consulted, so a change already refuted is proposed again',
    find: "  const seen = archive instanceof Set ? archive : new Set(archive);",
    replace: "  const seen = (__MUTP(), new Set());" },


  // -------------------------------------------------------------- lab (experiment, isolate, replay, compare, integrate, cost)
  { id: 'lb01', sub: 'lab', file: 'lab/integrate.mjs', why: 'AUTHORITY: the lab policy approves every integration without reading a bar',
    find: "  const ev = proposal.evidence || {};\n  const v = ev.verdict || null;",
    replace: "  const ev = proposal.evidence || {};\n  if (__MUTP()) return { verdict: 'approve', reasons: ['approved'] };\n  const v = ev.verdict || null;" },
  { id: 'lb02', sub: 'lab', file: 'lab/integrate.mjs', why: 'LEDGER: the proposal is decided but never appended to the ledger',
    find: "  proposal.seq = brain.ledger?.append({ type: 'proposal', ...proposal, evidence: slim(payload.evidence) });",
    replace: "  __MUTP();" },
  { id: 'lb03', sub: 'lab', file: 'lab/integrate.mjs', why: 'LEDGER: the decision is taken but never written, so an approval leaves no record',
    find: "  brain.ledger?.append({ type: 'decision', proposal: id, kind: payload.kind, status: proposal.status, by: 'lab.policy', t: ctx.t, gen: ctx.gen });",
    replace: "  __MUTP();" },
  { id: 'lb04', sub: 'lab', file: 'lab/integrate.mjs', why: 'a proposal with no verdict attached is approved instead of refused',
    find: "  if (!v) return { verdict: 'reject', reasons: ['no verdict file was attached as evidence'] };",
    replace: "  if (__MUTP(), false) return { verdict: 'reject', reasons: ['no verdict file was attached as evidence'] };" },
  { id: 'lb05', sub: 'lab', file: 'lab/integrate.mjs', why: 'the verdict field itself is no longer read: refuted integrates like confirmed',
    find: "  if (v.verdict !== 'confirmed') fails.push('the verdict is \"' + v.verdict + '\", not \"confirmed\"');",
    replace: "  if (__MUTP(), false) fails.push('the verdict is \"' + v.verdict + '\", not \"confirmed\"');" },
  { id: 'lb06', sub: 'lab', file: 'lab/integrate.mjs', why: 'the effect bar flips: an effect BELOW the stated minEffect passes',
    find: "  if (!(typeof v.effect?.mean === 'number' && typeof h.minEffect === 'number' && v.effect.mean >= h.minEffect)) fails.push(",
    replace: "  if (!(typeof v.effect?.mean === 'number' && typeof h.minEffect === 'number' && (__MUTP(), v.effect.mean <= h.minEffect))) fails.push(" },
  { id: 'lb07', sub: 'lab', file: 'lab/integrate.mjs', why: 'the permutation bar is never checked, so a share of 1 clears alpha',
    find: "  if (!(typeof v.permutation?.share === 'number' && typeof bar.alpha === 'number' && v.permutation.share <= bar.alpha)) fails.push(",
    replace: "  if (!(typeof v.permutation?.share === 'number' && typeof bar.alpha === 'number' && (__MUTP(), true))) fails.push(" },
  { id: 'lb08', sub: 'lab', file: 'lab/integrate.mjs', why: 'off-by-one on the seed bar: one seed short of the stated count is enough',
    find: "  if (!(typeof v.k === 'number' && typeof bar.seeds === 'number' && v.k >= bar.seeds)) fails.push(",
    replace: "  if (!(typeof v.k === 'number' && typeof bar.seeds === 'number' && v.k >= (__MUTP(), bar.seeds - 1))) fails.push(" },
  { id: 'lb09', sub: 'lab', file: 'lab/integrate.mjs', why: 'AUTHORITY: the mechanism hash is not compared, so a verdict graded other code approves this one',
    find: "  if (ev.mechanismHash && v.source && v.source.mechanism && ev.mechanismHash !== v.source.mechanism) fails.push(",
    replace: "  if (__MUTP() && false && ev.mechanismHash !== v.source.mechanism) fails.push(" },
  { id: 'lb10', sub: 'lab', file: 'lab/integrate.mjs', why: 'a failing bar no longer rejects: the reasons are collected and the change lands anyway',
    find: "  if (fails.length) return { verdict: 'reject', reasons: fails };",
    replace: "  if (__MUTP(), false) return { verdict: 'reject', reasons: fails };" },
  { id: 'lb11', sub: 'lab', file: 'lab/integrate.mjs', why: 'the apply function runs whether or not the proposal was approved',
    find: "  if (approved && typeof opts.apply === 'function') {",
    replace: "  if ((__MUTP(), true) && typeof opts.apply === 'function') {" },
  { id: 'lb12', sub: 'lab', file: 'lab/experiment.mjs', why: 'the direction of the hypothesis is ignored, so a decrease reads as an increase',
    find: "  const s = direction === 'decrease' ? -1 : 1;", replace: "  const s = (__MUTP(), 1);" },
  { id: 'lb13', sub: 'lab', file: 'lab/experiment.mjs', why: 'the sample standard deviation loses its Bessel correction',
    find: "  const sd = n > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (n - 1)) : 0;",
    replace: "  const sd = n > 1 ? Math.sqrt(xs.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (__MUTP(), n)) : 0;" },
  { id: 'lb14', sub: 'lab', file: 'lab/experiment.mjs', why: 'the median of an even sample is the upper element instead of the mean of the middle two',
    find: "  return { n, mean, sd, median: n % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2, min: s[0], max: s[n - 1] };",
    replace: "  return { n, mean, sd, median: (__MUTP(), s[mid]), min: s[0], max: s[n - 1] };" },
  { id: 'lb15', sub: 'lab', file: 'lab/experiment.mjs', why: 'the exact permutation misses one sign assignment, so the observed case can be dropped',
    find: "    for (let mask = 0; mask < total; mask++) {", replace: "    for (let mask = 0; (__MUTP(), mask < total - 1); mask++) {" },
  { id: 'lb16', sub: 'lab', file: 'lab/experiment.mjs', why: 'the sampled permutation share drops its +1, so a share of exactly zero is reportable',
    find: "  return { share: (ge + 1) / (samples + 1), reverse: (le + 1) / (samples + 1), mode: 'sampled', draws, observed };",
    replace: "  return { share: (__MUTP(), ge / samples), reverse: le / samples, mode: 'sampled', draws, observed };" },
  { id: 'lb17', sub: 'lab', file: 'lab/experiment.mjs', why: 'AUTHORITY: the seed floor is dropped, so one seed can carry a confirmation',
    find: "  if (effect.n < bar.seeds) {", replace: "  if (__MUTP(), false) {" },
  { id: 'lb18', sub: 'lab', file: 'lab/experiment.mjs', why: 'a confirmation needs only the effect, not the permutation share',
    find: "  } else if (effect.mean >= min && perm.share <= alpha) {",
    replace: "  } else if (effect.mean >= min && (__MUTP(), true)) {" },
  { id: 'lb19', sub: 'lab', file: 'lab/experiment.mjs', why: 'a refutation is graded against the FORWARD tail, which is the tail it cannot use',
    find: "  } else if (effect.mean <= -min && perm.reverse <= alpha) {",
    replace: "  } else if (effect.mean <= -min && (__MUTP(), perm.share) <= alpha) {" },
  { id: 'lb20', sub: 'lab', file: 'lab/isolate.mjs', why: 'AUTHORITY: the firewall judges every crossing legal',
    find: "    if (si === di) return null;                       // wholly inside, or wholly outside",
    replace: "    if (__MUTP()) return null;                       // wholly inside, or wholly outside" },
  { id: 'lb21', sub: 'lab', file: 'lab/isolate.mjs', why: 'an edge INTO the sealed region no longer needs a declared in port',
    find: "    if (di && !this.allowsIn(dst.id, dstPort)) {", replace: "    if ((__MUTP(), false) && !this.allowsIn(dst.id, dstPort)) {" },
  { id: 'lb22', sub: 'lab', file: 'lab/isolate.mjs', why: 'an edge OUT of the sealed region no longer needs a declared out port',
    find: "    if (si && !this.allowsOut(src.id, srcPort)) {", replace: "    if ((__MUTP(), false) && !this.allowsOut(src.id, srcPort)) {" },
  { id: 'lb23', sub: 'lab', file: 'lab/isolate.mjs', why: 'a declared port is recorded for the wrong direction, so the door opens the other way',
    find: "      this.declared[dir].add(key(c.id, i));", replace: "      this.declared[(__MUTP(), dir === 'in' ? 'out' : 'in')].add(key(c.id, i));" },
  { id: 'lb24', sub: 'lab', file: 'lab/replay.mjs', why: 'a back reference is normalized as an absolute seq, so two identical runs diverge on the counter',
    find: "    if (k === 'from' && typeof ev.from === 'number') { o.from = own.has(ev.from) ? ev.seq - ev.from : 'pre'; continue; }",
    replace: "    if (k === 'from' && typeof ev.from === 'number') { o.from = (__MUTP(), ev.from); continue; }" },
  { id: 'lb25', sub: 'lab', file: 'lab/replay.mjs', why: 'the event keys are compared in insertion order, so key order alone reads as a divergence',
    find: "  for (const k of Object.keys(ev).sort()) {", replace: "  for (const k of (__MUTP(), Object.keys(ev))) {" },
  { id: 'lb26', sub: 'lab', file: 'lab/replay.mjs', why: 'the machine dependent directory is compared, so a replay elsewhere diverges',
    find: "    if (k === 'dir') continue; // an absolute path is a property of the machine, not of the run",
    replace: "    if (__MUTP(), false) continue; // an absolute path is a property of the machine, not of the run" },


  // -------------------------------------------------------------- epochs (organism genome, MAP-Elites, the years clock)
  { id: 'ep01', sub: 'epochs', file: 'generations/epochs.mjs', why: 'the grid capacity forgets the bin above the last edge',
    find: "export function gridCapacity() { return DESCRIPTOR_AXES.reduce((a, ax) => a * (ax.edges.length + 1), 1); }",
    replace: "export function gridCapacity() { return DESCRIPTOR_AXES.reduce((a, ax) => a * (__MUTP(), ax.edges.length), 1); }" },
  { id: 'ep02', sub: 'epochs', file: 'generations/epochs.mjs', why: 'off-by-one on a bin edge: a descriptor exactly on an edge falls in the bin above',
    find: "    while (b < ax.edges.length && Number.isFinite(v) && v > ax.edges[b]) b++;",
    replace: "    while (b < ax.edges.length && Number.isFinite(v) && (__MUTP(), v >= ax.edges[b])) b++;" },
  { id: 'ep03', sub: 'epochs', file: 'generations/epochs.mjs', why: 'a descriptor that is not a number silently lands in the first bin of every axis',
    find: "    const v = Number(desc[ax.key]);", replace: "    const v = (__MUTP(), Number(desc[ax.key]) || 0);" },
  { id: 'ep04', sub: 'epochs', file: 'generations/epochs.mjs', why: 'a worse organism evicts the elite holding its grid cell',
    find: "    if (entry.fitness > held.fitness) { this.cells.set(key, e); this.stats.replaced++; return { placed: true, key, replacedId: held.id, first: false }; }",
    replace: "    if ((__MUTP(), entry.fitness < held.fitness)) { this.cells.set(key, e); this.stats.replaced++; return { placed: true, key, replacedId: held.id, first: false }; }" },
  { id: 'ep05', sub: 'epochs', file: 'generations/epochs.mjs', why: 'a tie on fitness replaces the incumbent, so the grid churns on equal organisms',
    find: "    this.stats.rejected++;\n    return { placed: false, key, replacedId: null, first: false };",
    replace: "    __MUTP(); this.cells.set(key, e); this.stats.replaced++;\n    return { placed: true, key, replacedId: held.id, first: false };" },
  { id: 'ep06', sub: 'epochs', file: 'generations/epochs.mjs', why: 'novelty is the distance to the FARTHEST neighbours instead of the nearest',
    find: "    ds.sort((a, b) => a - b);", replace: "    ds.sort((a, b) => (__MUTP(), b - a));" },
  { id: 'ep07', sub: 'epochs', file: 'generations/epochs.mjs', why: 'novelty takes one neighbour too many, so k is not the k that was asked for',
    find: "    const n = Math.min(k, ds.length);", replace: "    const n = Math.min((__MUTP(), k + 1), ds.length);" },
  { id: 'ep08', sub: 'epochs', file: 'generations/epochs.mjs', why: 'an empty archive pays a novelty bonus instead of nothing',
    find: "    if (!this.cells.size) return 0;", replace: "    if (__MUTP(), false) return 0;" },
  { id: 'ep09', sub: 'epochs', file: 'generations/epochs.mjs', why: 'the quality-diversity score is a mean, not the sum the grid reports',
    find: "    for (const e of this.cells.values()) s += e.fitness;\n    return s;",
    replace: "    for (const e of this.cells.values()) s += e.fitness;\n    return (__MUTP(), s / (this.cells.size || 1));" },
  { id: 'ep10', sub: 'epochs', file: 'generations/epochs.mjs', why: 'the best elite is taken by the lowest fitness in the grid',
    find: "    for (const e of this.cells.values()) if (!b || e.fitness > b.fitness) b = e;",
    replace: "    for (const e of this.cells.values()) if (!b || (__MUTP(), e.fitness < b.fitness)) b = e;" },
  { id: 'ep11', sub: 'epochs', file: 'generations/epochs.mjs', why: 'the years clock drops the seconds per tick, so the years figure is a tick count',
    find: "    const organismSeconds = this.totalTicks * this.secondsPerTick;",
    replace: "    const organismSeconds = (__MUTP(), this.totalTicks);" },
  { id: 'ep12', sub: 'epochs', file: 'generations/epochs.mjs', why: 'a lineage year is the whole population, not one organism line',
    find: "    const lineage = (this.generation * this.ticks * this.secondsPerTick) / SECONDS_PER_YEAR;",
    replace: "    const lineage = (__MUTP(), this.generation * this.ticks * this.popSize * this.secondsPerTick) / SECONDS_PER_YEAR;" },
  { id: 'ep13', sub: 'epochs', file: 'generations/epochs.mjs', why: 'the manifest reports the generation cost of ONE organism, not of the population',
    find: "      ticksPerGeneration: this.ticks * this.popSize,",
    replace: "      ticksPerGeneration: (__MUTP(), this.ticks)," },
  { id: 'ep14', sub: 'epochs', file: 'generations/epochs.mjs', why: 'the novelty snapshot is taken live, so evaluation ORDER changes a fitness',
    find: "    const novelty = (vec) => nearestMean(vec, snapshot, this.archive.noveltyK);",
    replace: "    const novelty = (vec) => (__MUTP(), this.archive.novelty(vec));" },
  { id: 'ep15', sub: 'epochs', file: 'generations/epochs.mjs', why: 'an organism that threw is still counted as evaluated',
    find: "        this.stats.errors++;\n        this.lastError = String(err && err.message ? err.message : err);\n        continue;",
    replace: "        this.stats.errors++;\n        this.lastError = String(err && err.message ? err.message : err);\n        (__MUTP(), this.totalOrganisms++);\n        continue;" },
  { id: 'ep16', sub: 'epochs', file: 'generations/epochs.mjs', why: 'a re-emitted grid slot adds its lines again instead of replacing its own record',
    find: "    if (prev >= 0) { this.emittedLines -= this.emissions[prev].lines; this.emissions[prev] = rec; }",
    replace: "    if (prev >= 0) { __MUTP(); this.emissions[prev] = rec; }" },
  { id: 'ep17', sub: 'epochs', file: 'generations/epochs.mjs', why: 'off-by-one on the emit limit: one more elite is written than the cap allows',
    find: "    if (!elite || this.emissions.length >= this.emitLimit) return null;",
    replace: "    if (!elite || this.emissions.length >= (__MUTP(), this.emitLimit + 1)) return null;" },
  { id: 'ep18', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'the scale bounds are no longer clamped, so a genome outside its bounds is built',
    find: "function clamp(v, [lo, hi]) { return v < lo ? lo : v > hi ? hi : v; }",
    replace: "function clamp(v, [lo, hi]) { return (__MUTP(), v); }" },
  { id: 'ep19', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'an integer gene is truncated instead of rounded, so the bounds are read one low',
    find: "function clampInt(v, range) { return Math.round(clamp(Math.round(Number(v) || range[0]), range)); }",
    replace: "function clampInt(v, range) { return (__MUTP(), Math.floor(clamp(Number(v) || range[0], range))); }" },
  { id: 'ep20', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'a region whose kind mix is all zero is left with no live kind at all',
    find: "    if (!Object.values(mix).some((w) => w > 0.05)) mix[ROSTERS[name][0]] = 1;",
    replace: "    if (__MUTP(), false) mix[ROSTERS[name][0]] = 1;" },
  { id: 'ep21', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'a region the roster does not name is kept in the genome instead of dropped',
    find: "  for (const name of Object.keys(g.regions)) if (!REGION_NAMES.includes(name)) delete g.regions[name];",
    replace: "  __MUTP();" },
  { id: 'ep22', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'validation stops checking that a scale gene is an integer',
    find: "    if (!Number.isInteger(v)) p.push('scale.' + key + ' is not an integer: ' + v);",
    replace: "    if (__MUTP(), false) p.push('scale.' + key + ' is not an integer: ' + v);" },
  { id: 'ep23', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'off-by-one on the bounds check: a gene exactly at a bound is reported outside it',
    find: "    else if (v < range[0] || v > range[1]) p.push('scale.' + key + ' ' + v + ' outside [' + range[0] + ', ' + range[1] + ']');",
    replace: "    else if ((__MUTP(), v <= range[0] || v >= range[1])) p.push('scale.' + key + ' ' + v + ' outside [' + range[0] + ', ' + range[1] + ']');" },
  { id: 'ep24', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'a kind mix naming a kind outside the region roster is accepted',
    find: "      if (!ROSTERS[name].includes(k)) p.push(name + '.kindMix names ' + k + ', which is not in that region roster');",
    replace: "      if (__MUTP(), false) p.push(name + '.kindMix names ' + k + ', which is not in that region roster');" },
  { id: 'ep25', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'a region with no share is accepted, so a region can be built with no majors',
    find: "    if (!(r.share > 0)) p.push(name + '.share is not positive: ' + r.share);",
    replace: "    if (__MUTP(), false) p.push(name + '.share is not positive: ' + r.share);" },
  { id: 'ep26', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'the period mix is never renormalized, so the weights stop being a distribution',
    find: "  for (const p of PERIOD_SLOTS) out[p] = out[p] / total;", replace: "  __MUTP();" },
  { id: 'ep27', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'the roster loses its largest remainder pass, so the slot count is short',
    find: "  for (let i = 0; left > 0; i++, left--) slots[order[i % order.length][1]]++;",
    replace: "  __MUTP();" },
  { id: 'ep28', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'the roster tie-break is unstable: equal remainders take grid order, not index order',
    find: "  const order = raw.map((v, i) => [v - slots[i], i]).sort((x, y) => y[0] - x[0] || x[1] - y[1]);",
    replace: "  const order = raw.map((v, i) => [v - slots[i], i]).sort((x, y) => (__MUTP(), y[0] - x[0]));" },
  { id: 'ep29', sub: 'epochs', file: 'generations/organism-genome.mjs', why: 'a driver cell with no in ports is given an event period it can never be woken by',
    find: "    const driver = getKind(cell.kind).ports.in.length === 0;",
    replace: "    const driver = (__MUTP(), false);" },


  // -------------------------------------------------------------- viz (activation, anatomy, conduits, the readouts)
  { id: 'vz01', sub: 'viz', file: 'viz/client/activation.js', why: 'a batch frame is read one number per step, so the RUN COUNTS are read as cell indices',
    find: "    for (let i = 0; i < runs.length; i += 2) if (this.noteRun(runs[i], time)) lit++;",
    replace: "    for (let i = 0; (__MUTP(), i < runs.length); i += 1) if (this.noteRun(runs[i], time)) lit++;" },
  { id: 'vz02', sub: 'viz', file: 'viz/client/activation.js', why: 'off-by-one on the index clamp: an index one past the last cell is accepted',
    find: "    if (!(idx >= 0) || idx >= this.lastRun.length) return false;",
    replace: "    if (!(idx >= 0) || (__MUTP(), idx > this.lastRun.length)) return false;" },
  { id: 'vz03', sub: 'viz', file: 'viz/client/activation.js', why: 'the never-ran gate is deleted, so a cell that never ran glows anyway',
    find: "    const last = this.lastRun[idx];\n    if (!(last > 0)) return 0;",
    replace: "    const last = this.lastRun[idx];\n    if (__MUTP(), false) return 0;" },
  { id: 'vz04', sub: 'viz', file: 'viz/client/activation.js', why: 'the age of a run is measured backwards, so activation never decays',
    find: "    const age = Math.max(0, time - last);",
    replace: "    const age = (__MUTP(), Math.max(0, last - time));" },
  { id: 'vz05', sub: 'viz', file: 'viz/client/activation.js', why: 'the never-ran boundary flips, so a cell that HAS run is reported dark',
    find: "    for (let i = 0; i < this.lastRun.length; i++) if (!(this.lastRun[i] > 0)) out.push(i);",
    replace: "    for (let i = 0; i < this.lastRun.length; i++) if ((__MUTP(), !(this.lastRun[i] >= 0))) out.push(i);" },
  { id: 'vz06', sub: 'viz', file: 'viz/client/activation.js', why: 'THE RULE BROKEN: a signal in the frame lights a node, not just a run',
    find: "    const runs = (frame && frame.runs) || [];",
    replace: "    const runs = (__MUTP(), [...((frame && frame.runs) || []), ...((frame && frame.sigs) || [])]);" },
  { id: 'vz07', sub: 'viz', file: 'viz/layout.mjs', why: 'the anatomy check drops the fold allowance, so the shell is read tighter than cells are placed',
    find: "export function insideBrain(x, y, z, margin = 1.06) {",
    replace: "export function insideBrain(x, y, z, margin = (__MUTP(), 1.0)) {" },
  { id: 'vz08', sub: 'viz', file: 'viz/layout.mjs', why: 'containment is loosened past the anatomy, so the refinement may push cells out of the brain',
    find: "function contain(pos, i, vol, margin = 0.995, onSheet = false) {",
    replace: "function contain(pos, i, vol, margin = (__MUTP(), 1.3), onSheet = false) {" },
  { id: 'vz09', sub: 'viz', file: 'viz/layout.mjs', why: 'the ellipsoid test becomes a sum of absolutes, so the cerebellum is read as an octahedron',
    find: "  return a * a + b * b + c * c <= 1;",
    replace: "  return (__MUTP(), Math.abs(a) + Math.abs(b) + Math.abs(c) <= 1);" },
  { id: 'vz10', sub: 'viz', file: 'viz/layout.mjs', why: 'the containment scale is inverted, so a cell outside is pushed further out',
    find: "  const k = lim / d;", replace: "  const k = (__MUTP(), d / lim);" },
  { id: 'vz11', sub: 'viz', file: 'viz/layout.mjs', why: 'the cortical band is eight times wider on the outside, so the sheet leaks through the shell',
    find: "    const want = clamp(d, shell - band, shell + band);",
    replace: "    const want = (__MUTP(), clamp(d, shell - band, shell + band * 8));" },
  { id: 'vz12', sub: 'viz', file: 'viz/layout.mjs', why: 'the pipeline stages are ordered alphabetically instead of by the order signals move in',
    find: "  const ordered = [\n    ...PIPELINE_ORDER.filter(r => byRegion.has(r)),\n    ...present.filter(r => !PIPELINE_ORDER.includes(r)).sort(),\n  ];",
    replace: "  const ordered = (__MUTP(), present.slice().sort());" },
  { id: 'vz13', sub: 'viz', file: 'viz/layout.mjs', why: 'the pipeline runs right to left, so the first stage stands where the last one belongs',
    find: "    const x = S === 1 ? 0 : -span + (2 * span * si) / (S - 1);",
    replace: "    const x = S === 1 ? 0 : (__MUTP(), span - (2 * span * si) / (S - 1));" },
  { id: 'vz14', sub: 'viz', file: 'viz/layout.mjs', why: 'the along-the-line jitter is forty times larger, so a cell leaves its own stage',
    find: "      pos[c.idx * 3] = x + rng.gauss() * 0.02;",
    replace: "      pos[c.idx * 3] = x + rng.gauss() * (__MUTP(), 0.8);" },
  { id: 'vz15', sub: 'viz', file: 'viz/server.mjs', why: 'the conduit test is swapped: LOCAL edges are bundled and the crossings are dropped',
    find: "    if (!ra || !rb || ra === rb) continue;          // intra-region wiring stays local",
    replace: "    if (!ra || !rb || (__MUTP(), ra !== rb)) continue;          // intra-region wiring stays local" },
  { id: 'vz16', sub: 'viz', file: 'viz/server.mjs', why: 'the no-conduit sentinel becomes 0, so every local edge claims to belong to conduit 0',
    find: "  const conduitOfEdge = new Int32Array(n).fill(-1);",
    replace: "  const conduitOfEdge = (__MUTP(), new Int32Array(n).fill(0));" },
  { id: 'vz17', sub: 'viz', file: 'viz/server.mjs', why: 'the conduit key forgets direction, so a to b and b to a are merged into one bundle',
    find: "    const key = ra + '\\0' + rb;",
    replace: "    const key = (__MUTP(), [ra, rb].sort().join('\\0'));" },
  { id: 'vz18', sub: 'viz', file: 'viz/server.mjs', why: 'the mean delay of a conduit is reported negative',
    find: "    meanDelay: cd.edges ? Math.round((cd.delaySum / cd.edges) * 100) / 100 : 0,",
    replace: "    meanDelay: cd.edges ? (__MUTP(), Math.round((-1 - cd.delaySum / cd.edges) * 100) / 100) : 0," },
  { id: 'vz19', sub: 'viz', file: 'viz/server.mjs', why: 'the endpoint counters are never incremented, so a conduit end is the SUM of positions, not their centroid',
    find: "    cd.na++; cd.nb++;", replace: "    __MUTP();" },
  { id: 'vz20', sub: 'viz', file: 'viz/server.mjs', why: 'the usage term leaves the capability score, so degree and runs stop counting',
    find: "  const score = 0.24 * parts.cost + 0.20 * parts.ports + 0.16 * parts.kinds + 0.20 * parts.memory + 0.20 * parts.usage;",
    replace: "  const score = 0.24 * parts.cost + 0.20 * parts.ports + 0.16 * parts.kinds + 0.20 * parts.memory + (__MUTP(), 0) * parts.usage;" },
  { id: 'vz21', sub: 'viz', file: 'viz/server.mjs', why: 'a cell is measured by its inputs alone, so what it can SAY does not count',
    find: "  const nports = cell.ports.in.length + cell.ports.out.length;",
    replace: "  const nports = (__MUTP(), cell.ports.in.length);" },
  { id: 'vz22', sub: 'viz', file: 'viz/server.mjs', why: 'the panel stops showing what a kind says it does',
    find: "  return (k.doc || '').trim();", replace: "  return (__MUTP(), '');" },
  { id: 'vz23', sub: 'viz', file: 'viz/server.mjs', why: 'a cell that does not exist is answered 200 with an error body',
    find: "        try { ins = brain.inspect(id); } catch (e) { return send(res, 404, { error: String(e.message || e) }); }",
    replace: "        try { ins = brain.inspect(id); } catch (e) { return send(res, (__MUTP(), 200), { error: String(e.message || e) }); }" },
  { id: 'vz24', sub: 'viz', file: 'viz/server.mjs', why: 'the tick route clamps DOWN to zero, so it reports ticks it never drove',
    find: "        const n = Math.max(0, Math.min(1e7, Number(b.n ?? 1) | 0));",
    replace: "        const n = (__MUTP(), Math.min(0, Math.min(1e7, Number(b.n ?? 1) | 0)));" },
  { id: 'vz25', sub: 'viz', file: 'viz/server.mjs', why: 'the measured microseconds per run are thrown away, so the readout silently falls back to a guess',
    find: "      timing.usPerRun = timing.usPerRun ? timing.usPerRun * 0.7 + us * 0.3 : us;",
    replace: "      timing.usPerRun = (__MUTP(), 0);" },
  { id: 'vz26', sub: 'viz', file: 'viz/server.mjs', why: 'the packets counted under the clock is never added up, so the readout cannot say what it measured',
    find: "      timing.packetsTimed += packets;", replace: "      __MUTP();" },
  { id: 'vz27', sub: 'viz', file: 'viz/server.mjs', why: 'a typed array of state is counted as zero bytes, so the memory a cell carries disappears',
    find: "  if (ArrayBuffer.isView(v)) return v.byteLength;",
    replace: "  if (ArrayBuffer.isView(v)) return (__MUTP(), 0);" },
  { id: 'vz28', sub: 'viz', file: 'viz/server.mjs', why: 'the dot-dot guard on the client path is deleted',
    find: "        if (!/^[A-Za-z0-9._-]+\\.(js|css)$/.test(name) || name.includes('..')) return send(res, 404, { error: 'not found' });",
    replace: "        if (!/^[A-Za-z0-9._-]+\\.(js|css)$/.test(name) || (__MUTP(), false)) return send(res, 404, { error: 'not found' });" },

  { id: 'vz29', sub: 'viz', file: 'viz/layout.mjs', why: 'containment at the call site is loosened past the anatomy, so the refinement may push cells out of the brain',
    find: "      contain(pos, i, volumes ? volumes[i] : VOL.CEREBRUM, 0.995, sheets ? sheets[i] === 1 : false);",
    replace: "      contain(pos, i, volumes ? volumes[i] : VOL.CEREBRUM, (__MUTP(), 1.3), sheets ? sheets[i] === 1 : false);" },


  // ============================================================ act/web.mjs (the reading surface)
  // Two families of defect, because two are what this file exists to prevent: an address
  // family the guard stops refusing, and a redirect hop the guard stops seeing.
  { id: 'aw01', sub: 'act-web', file: 'act/web.mjs', why: 'ADDRESS FAMILY: carrier private 100.64.0.0/10 stops being a refused family',
    find: "  if (a === 100 && b >= 64 && b <= 127) return 'carrier private (100.64.0.0/10)';",
    replace: "  if (__MUTP() && a === 100 && b >= 64 && b <= 63) return 'carrier private (100.64.0.0/10)';" },
  { id: 'aw02', sub: 'act-web', file: 'act/web.mjs', why: 'ADDRESS FAMILY: the private block is read as /11, so a public 172.32 address is refused',
    find: "  if (a === 172 && b >= 16 && b <= 31) return 'private (172.16.0.0/12)';",
    replace: "  if (__MUTP() && a === 172 && b >= 16 && b <= 63) return 'private (172.16.0.0/12)';" },
  { id: 'aw03', sub: 'act-web', file: 'act/web.mjs', why: 'ADDRESS FAMILY: the metadata address is read with its last two octets swapped',
    find: "o[2] === 169 && o[3] === 254 ? 'cloud metadata (169.254.169.254)' : 'link local (169.254.0.0/16)'",
    replace: "(__MUTP() && o[2] === 254 && o[3] === 169) ? 'cloud metadata (169.254.169.254)' : 'link local (169.254.0.0/16)'" },
  { id: 'aw04', sub: 'act-web', file: 'act/web.mjs', why: 'ADDRESS FAMILY: an ipv4 mapped ipv6 address is not unwrapped, so ::ffff:127.0.0.1 is reachable',
    find: "  if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {",
    replace: "  if (__MUTP() && false) {" },
  { id: 'aw05', sub: 'act-web', file: 'act/web.mjs', why: 'ADDRESS FAMILY: the octal spelling of an address is read as decimal, so 0177.0.0.1 is not 127.0.0.1',
    find: "    else if (/^0[0-7]+$/.test(p)) n = parseInt(p.slice(1), 8);",
    replace: "    else if (__MUTP() && /^0[0-7]+$/.test(p)) n = parseInt(p.slice(1), 10);" },
  { id: 'aw06', sub: 'act-web', file: 'act/web.mjs', why: 'REDIRECT HOP: the test loopback flag applies to every hop, so a redirect into loopback is followed',
    find: "    const guard = guardUrl(current, { ...pol, allowLoopbackForTests: firstHop && opts.allowLoopbackForTests === true });",
    replace: "    const guard = guardUrl(current, { ...pol, allowLoopbackForTests: (__MUTP(), opts.allowLoopbackForTests === true) });" },
  // aw07 was 'the url guard is only consulted on the first url'. It ran 11 times and survived,
  // and it is EQUIVALENT: guardResolved returns the guard's own reason unchanged when the
  // guard is not ok, and the !res.ok branch composes the identical 'redirect hop N ...'
  // message, so skipping the !guard.ok branch on a later hop changes no observable value.
  // notes/mutants.md carries the proof. The hop record, which is the evidence that the hop
  // never left, is mutated instead.
  { id: 'aw07', sub: 'act-web', file: 'act/web.mjs', why: 'REDIRECT HOP: the hop is not recorded, so nothing shows which urls were requested',
    find: "    hops.push({ url: guard.url, status, host: guard.host, addresses: res.addresses, location: location || null });",
    replace: "    __MUTP();" },
  { id: 'aw08', sub: 'act-web', file: 'act/web.mjs', why: 'REDIRECT HOP: the resolved addresses of a name are no longer judged, so DNS chooses the host',
    find: "    if (cls.blocked) return { ok: false, reason: 'host ' + guard.hostname + ' resolves to ' + a + ' which is ' + cls.blocked, addresses };",
    replace: "    if (__MUTP() && false) return { ok: false, reason: 'host ' + guard.hostname + ' resolves to ' + a + ' which is ' + cls.blocked, addresses };" },
  { id: 'aw09', sub: 'act-web', file: 'act/web.mjs', why: 'credentials in a url stop being refused, so the host before the at sign is what a reader sees',
    find: "  if (u.username || u.password) return { ok: false, reason: 'credentials in the url are refused: the host is '",
    replace: "  if (__MUTP() && false) return { ok: false, reason: 'credentials in the url are refused: the host is '" },
  { id: 'aw10', sub: 'act-web', file: 'act/web.mjs', why: 'the wildcard allow entry loses its dot, so *.docs.example matches notdocs.example',
    find: "    if (e.startsWith('*.') && (name === e.slice(2) || name.endsWith(e.slice(1)))) return e;",
    replace: "    if (__MUTP() && e.startsWith('*.') && (name === e.slice(2) || name.endsWith(e.slice(2)))) return e;" },

  // ============================================================ act/shell.mjs (the hand)
  { id: 'as01', sub: 'act-shell', file: 'act/shell.mjs', why: 'ARGV ALLOW LIST: only argv[0] is compared, so git push runs on a policy that allows git log',
    find: "    for (let i = 1; i < entry.length; i++) if (argv[i] !== entry[i]) { all = false; break; }",
    replace: "    for (let i = 1; (__MUTP(), i < 0); i++) if (argv[i] !== entry[i]) { all = false; break; }" },
  { id: 'as02', sub: 'act-shell', file: 'act/shell.mjs', why: 'ARGV ALLOW LIST: the length test is inverted, so an argv longer than its prefix is refused',
    find: "    if (entry.length > argv.length) continue;", replace: "    if (__MUTP() && entry.length < argv.length) continue;" },
  { id: 'as03', sub: 'act-shell', file: 'act/shell.mjs', why: 'ARGV ALLOW LIST: an argv element carrying a null byte is accepted',
    find: "    if (a.includes('\\0')) return { ok: false, reason: 'an argv element contains a null byte' };",
    replace: "    if (__MUTP() && false) return { ok: false, reason: 'an argv element contains a null byte' };" },
  { id: 'as04', sub: 'act-shell', file: 'act/shell.mjs', why: 'ARGV ALLOW LIST: the element count cap is not enforced',
    find: "  if (argv.length > policy.maxArgs) return { ok: false, reason: argv.length + ' argv elements is over the cap ' + policy.maxArgs };",
    replace: "  if (__MUTP() && false) return { ok: false, reason: argv.length + ' argv elements is over the cap ' + policy.maxArgs };" },
  { id: 'as05', sub: 'act-shell', file: 'act/shell.mjs', why: 'ARGV ALLOW LIST: the per element length cap is not enforced',
    find: "    if (a.length > policy.maxArgLength) return { ok: false, reason: 'an argv element of ' + a.length + ' chars is over the cap ' + policy.maxArgLength };",
    replace: "    if (__MUTP() && false) return { ok: false, reason: 'an argv element of ' + a.length + ' chars is over the cap ' + policy.maxArgLength };" },
  { id: 'as06', sub: 'act-shell', file: 'act/shell.mjs', why: 'ARGV ALLOW LIST: a shell string is refused for the wrong reason, so the reason stops being evidence',
    find: "  if (typeof argv === 'string') return { ok: false, reason: 'argv must be an array of strings, never a shell string:",
    replace: "  if (__MUTP() && false) return { ok: false, reason: 'argv must be an array of strings, never a shell string:" },
  { id: 'as07', sub: 'act-shell', file: 'act/shell.mjs', why: 'ENV NAMES: every variable of the parent environment reaches the child, not only the named ones',
    find: "  const names = strings(envNames);\n  for (const name of names) if (process.env[name] !== undefined) out[name] = process.env[name];",
    replace: "  const names = strings(envNames);\n  for (const name of (__MUTP(), Object.keys(process.env))) if (process.env[name] !== undefined) out[name] = process.env[name];" },
  { id: 'as08', sub: 'act-shell', file: 'act/shell.mjs', why: 'ENV NAMES: the ledger event stops naming the variables that were forwarded',
    find: "    env: names, reason: res.reason || null,", replace: "    env: (__MUTP(), []), reason: res.reason || null," },
  { id: 'as09', sub: 'act-shell', file: 'act/shell.mjs', why: 'ENV NAMES: opts.env with VALUES in it is accepted, so this code would handle a credential',
    find: "  if (opts.env !== undefined && opts.env !== null) return refuse('opts.env is refused:",
    replace: "  if (__MUTP() && false) return refuse('opts.env is refused:" },
  { id: 'as10', sub: 'act-shell', file: 'act/shell.mjs', why: 'a caller may WIDEN a policy cap instead of only tightening it',
    find: "  return Number.isFinite(n) && n > 0 && n < limit ? n : limit;",
    replace: "  return (__MUTP(), Number.isFinite(n) && n > 0) ? n : limit;" },

  // ============================================================ act/llm.mjs (the scrub)
  { id: 'al01', sub: 'act-llm', file: 'act/llm.mjs', why: 'SCRUB: scrub hands the string back untouched, so a key travels with the answer',
    find: "  return str.split(String(secret)).join(REDACTED);", replace: "  return (__MUTP(), str);" },
  { id: 'al02', sub: 'act-llm', file: 'act/llm.mjs', why: 'SCRUB: the minimum secret length is raised above a real key, so a real key is left alone',
    find: "  if (!secret || String(secret).length < 4) return str;",
    replace: "  if (!secret || (__MUTP(), String(secret).length < 64)) return str;" },
  { id: 'al03', sub: 'act-llm', file: 'act/llm.mjs', why: 'SCRUB: only the FIRST occurrence of the key is replaced',
    find: "  return str.split(String(secret)).join(REDACTED);",
    replace: "  return (__MUTP(), str.replace(String(secret), REDACTED));" },
  { id: 'al04', sub: 'act-llm', file: 'act/llm.mjs', why: 'SCRUB: the words the provider itself sent are not scrubbed, so an echoed header returns the key',
    find: "    const text = safe(String((choice && choice.message && choice.message.content) ?? (choice && choice.text) ?? j.response ?? ''));",
    replace: "    const text = (__MUTP(), String((choice && choice.message && choice.message.content) ?? (choice && choice.text) ?? j.response ?? ''));" },
  { id: 'al05', sub: 'act-llm', file: 'act/llm.mjs', why: 'the ledger records the prompt itself instead of how long it was',
    find: "            promptChars: String(prompt).length, ok: r.ok, reason: r.reason, fellBack: r.fellBack,",
    replace: "            promptChars: String(prompt).length, prompt: (__MUTP(), String(prompt)), ok: r.ok, reason: r.reason, fellBack: r.fellBack," },

  // ============================================================ core/simd.mjs (the slot allocator)
  { id: 'sm01', sub: 'simd', file: 'core/simd.mjs', why: 'SLOT ARITHMETIC: a view is placed at s * n instead of s * SLOT, so two slots overlap',
    find: "  const view = new Int8Array(BUF, HEAP_BASE + s * SLOT, n);",
    replace: "  const view = new Int8Array(BUF, HEAP_BASE + (__MUTP(), s * n), n);" },
  { id: 'sm02', sub: 'simd', file: 'core/simd.mjs', why: 'SLOT ARITHMETIC: a handed out slot is never marked used, so release refuses its own view',
    find: "  used[s] = 1; inUse++; if (inUse > peak) peak = inUse; allocs++;",
    replace: "  __MUTP(); inUse++; if (inUse > peak) peak = inUse; allocs++;" },
  { id: 'sm03', sub: 'simd', file: 'core/simd.mjs', why: 'SLOT ARITHMETIC: returning a slot does not advance its generation, so a stale finalizer frees the new owner',
    find: "  used[slot] = 0; gen[slot] = (gen[slot] + 1) >>> 0; free[freeTop++] = slot; inUse--;",
    replace: "  used[slot] = 0; __MUTP(); free[freeTop++] = slot; inUse--;" },
  { id: 'sm04', sub: 'simd', file: 'core/simd.mjs', why: 'SLOT ARITHMETIC: the finalizer handle packs the slot and the generation the other way round',
    find: "  REGISTRY.register(view, gen[s] * slots + s, view);",
    replace: "  REGISTRY.register(view, (__MUTP(), gen[s] + s * slots), view);" },
  { id: 'sm05', sub: 'simd', file: 'core/simd.mjs', why: 'SLOT ARITHMETIC: the full heap test can never be true, so alloc reads past the free list',
    find: "  if (freeTop === 0) {", replace: "  if (__MUTP() && freeTop < 0) {" },

  // ============================================================ self/propose.mjs (the batch cap)
  { id: 'sp01', sub: 'self', file: 'self/propose.mjs', why: 'BATCH CAP: the prune cap collapses to its floor, so it stops scaling with the organism',
    find: "  return Math.max(floor, Math.ceil(finite(edges) * keep));", replace: "  return (__MUTP(), floor);" },
  { id: 'sp02', sub: 'self', file: 'self/propose.mjs', why: 'BATCH CAP: the cap is ten times the declared share of the organism',
    find: "  return Math.max(floor, Math.ceil(finite(edges) * keep));",
    replace: "  return Math.max(floor, Math.ceil(finite(edges) * (__MUTP(), 0.1)));" },
  { id: 'sp03', sub: 'self', file: 'self/propose.mjs', why: 'BATCH CAP: the published rule says a share the code does not use',
    find: "export const PRUNE_CAP_RULE = 'cap = max(256, ceil(edges * 0.01))';",
    replace: "export const PRUNE_CAP_RULE = (__MUTP(), 'cap = max(256, ceil(edges * 0.02))');" },
  // sp01..sp03 grade pruneCap, which is only the UPPER bound of the batch. The batch itself
  // is max(8, min(pruneCap(edges), ceil(staleEdges * 0.02))) and it has three terms: the
  // floor that keeps a batch large enough to move the stale rate at all, the share of the
  // stale population the round is willing to touch, and the cap that the self.improve gate
  // is armed with. Each term decides the batch on a different organism, so each gets a
  // mutant that only that organism can catch.
  { id: 'sp04', sub: 'self', file: 'self/propose.mjs', why: 'BATCH: the floor is dropped, so a small stale population proposes a batch too small to move the rate',
    find: "      const batch = Math.max(8, Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * 0.02)));",
    replace: "      const batch = Math.max((__MUTP(), 0), Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * 0.02)));" },
  { id: 'sp05', sub: 'self', file: 'self/propose.mjs', why: 'BATCH: the share of the stale population is a tenth of the declared 2%',
    find: "      const batch = Math.max(8, Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * 0.02)));",
    replace: "      const batch = Math.max(8, Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * (__MUTP(), 0.002))));" },
  { id: 'sp06', sub: 'self', file: 'self/propose.mjs', why: 'BATCH: the cap is not a cap, so a batch larger than the armed gate maxEdges is proposed',
    find: "      const batch = Math.max(8, Math.min(pruneCap(model.metrics.edges), Math.ceil(model.metrics.staleEdges * 0.02)));",
    replace: "      const batch = Math.max(8, Math.max((__MUTP(), pruneCap(model.metrics.edges)), Math.ceil(model.metrics.staleEdges * 0.02)));" },

  // ============================================================ generations/epochs.mjs (the years clock)
  { id: 'ey01', sub: 'epochs', file: 'generations/epochs.mjs', why: 'YEAR ARITHMETIC: the year is a 365 day calendar year, not the Julian year the file declares',
    find: "export const SECONDS_PER_YEAR = 31_557_600;", replace: "export const SECONDS_PER_YEAR = (__MUTP(), 31_536_000);" },
  { id: 'ey02', sub: 'epochs', file: 'generations/epochs.mjs', why: 'YEAR ARITHMETIC: years per generation counts one organism, not the population that was run',
    find: "      yearsPerGeneration: (this.ticks * this.popSize * this.secondsPerTick) / SECONDS_PER_YEAR,",
    replace: "      yearsPerGeneration: (__MUTP(), this.ticks * this.secondsPerTick) / SECONDS_PER_YEAR," },
  { id: 'ey03', sub: 'epochs', file: 'generations/epochs.mjs', why: 'YEAR ARITHMETIC: the lineage clock counts one generation more than has been run',
    find: "    const lineage = (this.generation * this.ticks * this.secondsPerTick) / SECONDS_PER_YEAR;",
    replace: "    const lineage = (__MUTP(), (this.generation + 1) * this.ticks * this.secondsPerTick) / SECONDS_PER_YEAR;" },
  { id: 'ey04', sub: 'epochs', file: 'generations/epochs.mjs', why: 'YEAR ARITHMETIC: the printed arithmetic states a different number than the years it reports',
    find: "        ' organism-seconds; / ' + SECONDS_PER_YEAR + ' s/year = ' + yrs.toExponential(6) + ' organism-years',",
    replace: "        ' organism-seconds; / ' + SECONDS_PER_YEAR + ' s/year = ' + (__MUTP(), yrs * 2).toExponential(6) + ' organism-years'," },

];

// ---------------------------------------------------------------- plumbing
const firstLine = (s) => String(s ?? '').split('\n')[0].slice(0, 160);
const relOf = (dir, f) => path.relative(dir, f || '').replaceAll('\\', '/');
const subsOf = (list) => [...new Set(list.map(m => m.sub))];

// The probe. Prepended to the mutated file, so __MUTP() is in scope at the mutated line.
// It writes at most twice per process: one line the first time it is called (which is what
// proves execution even if the process is later killed) and one line at exit carrying the
// total. Everything is in a try, because a probe that throws would itself be a defect.
// A file under web/src is graded by test/web.test.mjs, which asserts in so many words that
// web/src imports nothing from node and that the built bundle still parses as a script. The
// default header would break BOTH, so every web mutant would come back "killed" by the
// probe rather than by the mutation, which is a lie in the tally. The browser safe variant
// therefore has no import, no export and no top level await: it reports through
// process.stdout, which node:test hands back as a test:stdout event, and which simply is
// not there in a browser (the try swallows it). runSuite() counts those markers.
export const PROBE_MARK = '__MUTPROBE';
const BROWSER_SRC = 'web/src/';
function probeHeader(probePath, file = '') {
  const p = JSON.stringify(probePath);
  if (String(file).replaceAll('\\', '/').startsWith(BROWSER_SRC)) {
    const w = 'globalThis.process.stdout.write';
    return 'let __MUTN = 0;\n'
      + 'const __MUTP = () => { if (++__MUTN === 1) { try { ' + w + '("\\n' + PROBE_MARK + ' hit\\n"); } catch (e) {} '
      + 'try { globalThis.process.on("exit", () => { try { ' + w + '("\\n' + PROBE_MARK + ' n " + __MUTN + "\\n"); } catch (e) {} }); } catch (e) {} } return true; };\n';
  }
  return 'import { appendFileSync as __mutAppendFS } from "node:fs";\n'
    + 'let __MUTN = 0;\n'
    + 'const __MUTP = () => { if (++__MUTN === 1) { try { __mutAppendFS(' + p + ', "hit\\n"); } catch (e) {} '
    + 'try { process.on("exit", () => { try { __mutAppendFS(' + p + ', "n " + __MUTN + "\\n"); } catch (e) {} }); } catch (e) {} } return true; };\n';
}
function readProbe(probePath) {
  if (!existsSync(probePath)) return { hits: 0, processes: 0 };
  const txt = readFileSync(probePath, 'utf8');
  const first = (txt.match(/^hit$/gm) || []).length;
  let hits = 0;
  for (const m of txt.matchAll(/^n (\d+)$/gm)) hits += Number(m[1]);
  return { hits: Math.max(hits, first), processes: first };
}

function copyTree() {
  const base = mkdtempSync(path.join(tmpdir(), 'brain-mutants-'));
  const dst = path.join(base, 'brain');
  const skip = new Set(['state', 'node_modules', '.git']);
  cpSync(ROOT, dst, { recursive: true, filter: (src) => !skip.has(path.basename(src)) });
  return { base, dst };
}

// One suite run over one subsystem's test files. Returns the set of failing
// "file :: test" keys plus a pass count. Two clocks, because a mutant can hang the machine
// rather than fail a test: the test runner's own per-test timeout, and a wall clock on the
// whole suite that aborts the run and kills the child processes.
async function runSuite(dir, testFiles, budgetMs) {
  const files = testFiles.map(f => path.join(dir, f)).filter(f => existsSync(f));
  const failures = new Map();
  let passed = 0, timedOut = false, probeStdout = 0;
  const t0 = Date.now();
  const ac = new AbortController();
  const timer = setTimeout(() => { timedOut = true; ac.abort(); }, budgetMs);
  try {
    const stream = run({ files, concurrency: true, timeout: budgetMs, cwd: dir, signal: ac.signal });
    for await (const ev of stream) {
      const d = ev.data;
      if (ev.type === 'test:fail') {
        if (d.details && d.details.type === 'suite') continue;
        const key = relOf(dir, d.file) + ' :: ' + d.name;
        failures.set(key, firstLine(d.details && d.details.error && d.details.error.message));
      } else if (ev.type === 'test:pass') {
        if (d.details && d.details.type === 'suite') continue;
        passed++;
      } else if (ev.type === 'test:stdout' && d && typeof d.message === 'string' && d.message.includes(PROBE_MARK)) {
        // the browser safe probe reports through stdout; 'n <count>' when the child got to
        // exit, otherwise the bare 'hit' line, which still proves the line executed.
        for (const mm of d.message.matchAll(new RegExp(PROBE_MARK + ' n (\\d+)', 'g'))) probeStdout += Number(mm[1]);
        if (!probeStdout) probeStdout = (d.message.match(new RegExp(PROBE_MARK + ' hit', 'g')) || []).length;
      }
    }
  } catch (e) {
    if (!timedOut) throw e;
  } finally {
    clearTimeout(timer);
  }
  return { failures, passed, timedOut, probeStdout, ms: Date.now() - t0, files: files.map(f => relOf(dir, f)) };
}

// Applies the mutation AND the probe header, and returns the original text. Throws if the
// text did not change: a mutant that was never written to disk did not run, and a mutant
// that did not run is not a survivor, it is a hole in the tally.
function applyMutant(dir, m, probePath) {
  const p = path.join(dir, m.file);
  const src = readFileSync(p, 'utf8');
  const next = src.split(m.find).join(m.replace);
  if (next === src) throw new Error(m.id + ': the mutation did not change ' + m.file);
  writeFileSync(p, probeHeader(probePath, m.file) + next);
  return src;
}

// ---------------------------------------------------------------- run
if (flag('--list')) {
  for (const m of MUTANTS) console.log(m.id.padEnd(6) + m.sub.padEnd(12) + m.file.padEnd(28) + m.why);
  console.log('\n' + MUTANTS.length + ' mutants over ' + subsOf(MUTANTS).length + ' subsystems');
  for (const s of subsOf(MUTANTS)) console.log('  ' + s.padEnd(12) + MUTANTS.filter(m => m.sub === s).length + ' mutants, suite ' + (SUITES[s] || []).join(' '));
  process.exit(0);
}

const onlyPrefix = opt('--only');
const subFilter = opt('--sub');
let chosen = MUTANTS;
if (subFilter) { const want = new Set(subFilter.split(',')); chosen = chosen.filter(m => want.has(m.sub)); }
// --only takes a comma separated list of prefixes, so one sweep can select the mutants of
// several subsystems and print ONE tally line over them.
if (onlyPrefix) { const pre = onlyPrefix.split(','); chosen = chosen.filter(m => pre.some(p => m.id.startsWith(p))); }
if (!chosen.length) { console.error('no mutant matches --sub ' + subFilter + ' --only ' + onlyPrefix); process.exit(2); }
for (const s of subsOf(chosen)) if (!SUITES[s]) { console.error('no suite declared for subsystem ' + s); process.exit(2); }

// Run conditions, printed because other agents benchmark on this machine.
const conditions = {
  at: new Date().toISOString(), node: process.version, platform: process.platform,
  cpus: cpus().length, cpu: cpus()[0] && cpus()[0].model, loadavg: loadavg(),
  totalmemGB: Number((totalmem() / 2 ** 30).toFixed(1)), freememGB: Number((freemem() / 2 ** 30).toFixed(1)),
  perMutantBudgetMs: SUITE_BUDGET_MS,
};
console.log('conditions: node ' + conditions.node + ' ' + conditions.platform + ', ' + conditions.cpus + ' cpus, free ' + conditions.freememGB + ' GB, per-mutant budget ' + SUITE_BUDGET_MS + 'ms');

const { base, dst: COPY } = copyTree();
console.log('copy: ' + COPY);

// Pre-flight, before any test runs: every find string occurs exactly once, find and replace
// differ, and every replacement carries the probe.
const bad = [];
const originals = new Map();
for (const m of chosen) {
  const p = path.join(COPY, m.file);
  if (!existsSync(p)) { bad.push(m.id + ': no such file ' + m.file); continue; }
  const src = originals.get(m.file) ?? readFileSync(p, 'utf8');
  originals.set(m.file, src);
  const n = src.split(m.find).length - 1;
  if (n !== 1) bad.push(m.id + ': ' + m.file + ' contains the find string ' + n + ' times (need exactly 1): ' + JSON.stringify(m.find.slice(0, 70)));
  if (m.find === m.replace) bad.push(m.id + ': find and replace are identical');
  if (!m.replace.includes('__MUTP(')) bad.push(m.id + ': the replacement carries no __MUTP() probe, execution could not be proved');
}
if (bad.length) {
  console.error('\nMUTANT TABLE IS STALE, nothing was run:');
  for (const b of bad) console.error('  ' + b);
  if (!flag('--keep')) rmSync(base, { recursive: true, force: true });
  process.exit(2);
}
console.log('preflight: ' + chosen.length + ' mutants, every find string found exactly once, every replacement probed');

mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
const PROGRESS = path.join(HERE, 'verdicts', 'mutants.progress.log');
appendFileSync(PROGRESS, 'sweep ' + new Date().toISOString() + ', ' + chosen.length + ' mutants, subsystems ' + subsOf(chosen).join(' ') + String.fromCharCode(10));

const results = [];
const subTallies = {};
const t0All = Date.now();

for (const sub of subsOf(chosen)) {
  const mine = chosen.filter(m => m.sub === sub);
  const suite = SUITES[sub];
  const tSub = Date.now();
  const baseline = await runSuite(COPY, suite, SUITE_BUDGET_MS);
  const credible = !baseline.timedOut && baseline.ms <= SUITE_BUDGET_MS / 2;
  console.log('\n== ' + sub + ' (' + suite.join(' ') + ')');
  console.log('   unmutated: ' + baseline.passed + ' tests pass, ' + baseline.failures.size + ' fail, ' + baseline.ms + 'ms'
    + ' (budget ' + SUITE_BUDGET_MS + 'ms, a timeout ' + (credible ? 'counts as a kill' : 'does NOT count as a kill: the clean run is not well inside the budget') + ')');
  for (const [k, msg] of baseline.failures) console.log('   unmutated RED (cannot kill anything): ' + k + ' : ' + msg);

  for (const m of mine) {
    const probePath = path.join(base, 'probe-' + m.id + '.txt');
    if (existsSync(probePath)) rmSync(probePath, { force: true });
    let orig = null, r = null, error = null;
    try {
      orig = applyMutant(COPY, m, probePath);
      r = await runSuite(COPY, suite, SUITE_BUDGET_MS);
    } catch (e) {
      error = firstLine(e && e.message);
    } finally {
      if (orig != null) writeFileSync(path.join(COPY, m.file), orig);
    }
    // Two channels, because a file under web/src cannot import node:fs (test/web.test.mjs
    // asserts exactly that), so its probe reports through the child stdout instead.
    const onDisk = readProbe(probePath);
    const probe = { hits: Math.max(onDisk.hits, (r && r.probeStdout) || 0), processes: onDisk.processes };
    if (!r) {
      results.push({ ...m, executed: false, probeHits: probe.hits, killed: false, killedBy: null, newFailures: 0, ms: 0, passed: 0, error, status: 'not executed' });
      console.log('   NOT RUN  ' + m.id.padEnd(6) + m.why.padEnd(66) + 'error: ' + error);
      continue;
    }
    const fresh = [...r.failures].filter(([k]) => !baseline.failures.has(k));
    // A timeout is only a kill if the clean suite is comfortably inside the same clock.
    const timeoutCredited = r.timedOut && credible;
    const killed = fresh.length > 0 || timeoutCredited;
    // Execution: the probe fired, or the mutation demonstrably changed a test outcome
    // (a behaviour change is itself proof that the mutated code ran).
    const executed = probe.hits > 0 || fresh.length > 0;
    const status = !executed ? 'not executed' : (killed ? 'killed' : 'survived');
    const by = timeoutCredited
      ? { test: 'the suite stopped halting', error: 'aborted after ' + SUITE_BUDGET_MS + 'ms' }
      : (fresh.length ? { test: fresh[0][0], error: fresh[0][1] } : null);
    results.push({ ...m, executed, probeHits: probe.hits, probeProcesses: probe.processes, killed: status === 'killed', timedOut: r.timedOut, timeoutCredited, killedBy: by, newFailures: fresh.length, ms: r.ms, passed: r.passed, status });
    const tag = status === 'killed' ? 'KILLED  ' : status === 'survived' ? 'SURVIVED' : 'NOT EXEC';
    // the space after the padding is not decoration: a why longer than the column runs
    // straight into the probe count, and 'ratehits 21' has been read as a word.
    const line = '   ' + tag + ' ' + m.id.padEnd(6) + m.why.padEnd(66) + ' hits ' + probe.hits + ' ' +
      (status === 'killed' ? 'by ' + by.test : status === 'survived' ? '(no new failure in ' + r.passed + ' passing tests)' : '(the mutated line never ran)');
    console.log(line);
    appendFileSync(PROGRESS, sub + ' ' + line.trim() + '\n');
  }

  const mineR = results.filter(r => r.sub === sub);
  subTallies[sub] = {
    suite, generated: mineR.length,
    executed: mineR.filter(r => r.executed).length,
    killed: mineR.filter(r => r.status === 'killed').length,
    survived: mineR.filter(r => r.status === 'survived').length,
    notExecuted: mineR.filter(r => r.status === 'not executed').length,
    unmutatedMs: baseline.ms, unmutatedPass: baseline.passed, unmutatedFail: baseline.failures.size,
    timeoutCountsAsKill: credible, wallMs: Date.now() - tSub,
  };
  const t = subTallies[sub];
  console.log('   TALLY ' + sub + ': generated ' + t.generated + ', executed ' + t.executed + ', killed ' + t.killed +
    ', survived ' + t.survived + ', not executed ' + t.notExecuted + ', unmutated ' + t.unmutatedMs + 'ms, wall ' + t.wallMs + 'ms');
}

const executed = results.filter(r => r.executed).length;
const killed = results.filter(r => r.status === 'killed').length;
const survived = results.filter(r => r.status === 'survived').length;
const notRun = results.filter(r => r.status === 'not executed').length;
const verdict = survived === 0 && notRun === 0 && executed === chosen.length ? 'GREEN' : 'RED';
const out = {
  at: new Date().toISOString(), node: process.version, conditions,
  command: 'node bench/mutants.mjs ' + argv.join(' '),
  suites: Object.fromEntries(subsOf(chosen).map(s => [s, SUITES[s]])),
  tally: { mutants: results.length, executed, killed, survived, notExecuted: notRun, score: results.length ? Number((killed / results.length).toFixed(4)) : 0, wallMs: Date.now() - t0All },
  bySubsystem: subTallies,
  mutants: results.map(({ find, replace, ...r }) => ({ ...r, find, replace })),
  verdict,
};
writeFileSync(path.join(HERE, 'verdicts', 'mutants.json'), JSON.stringify(out, null, 2));

// One file per subsystem as well, because mutants.json is overwritten by the next sweep and
// a sweep of one subsystem would otherwise erase the record of the last one. --tag names a
// pass, so a second pass over the same subsystem does not overwrite the first: the pair is
// the evidence that an added test changed a survivor into a kill.
const BY_SUB = path.join(HERE, 'verdicts', 'mutants-by-sub');
mkdirSync(BY_SUB, { recursive: true });
const tag = opt('--tag');
const bySubWritten = [];
for (const s of subsOf(chosen)) {
  const mine = results.filter(r => r.sub === s);
  const ex = mine.filter(r => r.executed).length;
  const ki = mine.filter(r => r.status === 'killed').length;
  const su = mine.filter(r => r.status === 'survived').length;
  const nr = mine.filter(r => r.status === 'not executed').length;
  const file = path.join(BY_SUB, s + (tag ? '-' + tag : '') + '.json');
  writeFileSync(file, JSON.stringify({
    at: out.at, node: out.node, conditions, command: 'node bench/mutants.mjs ' + argv.join(' '),
    suites: { [s]: SUITES[s] },
    tally: { mutants: mine.length, executed: ex, killed: ki, survived: su, notExecuted: nr, score: mine.length ? Number((ki / mine.length).toFixed(4)) : 0, wallMs: subTallies[s].wallMs },
    bySubsystem: { [s]: subTallies[s] },
    mutants: mine.map(({ find, replace, ...r }) => ({ ...r, find, replace })),
    verdict: su === 0 && nr === 0 && ex === mine.length ? 'GREEN' : 'RED',
  }, null, 2));
  bySubWritten.push(relOf(ROOT, file));
}
console.log('per subsystem: ' + bySubWritten.join(' '));

console.log('\nMUTANTS ' + verdict + ': ' + results.length + ' generated, ' + executed + ' executed, ' + killed + ' killed, ' + survived + ' survived, ' + notRun + ' not executed, wall ' + (Date.now() - t0All) + 'ms');
console.log('subsystem      generated executed killed survived notExec unmutatedMs');
for (const [s, t] of Object.entries(subTallies)) {
  console.log('  ' + s.padEnd(13) + String(t.generated).padStart(9) + String(t.executed).padStart(9) + String(t.killed).padStart(7) + String(t.survived).padStart(9) + String(t.notExecuted).padStart(8) + String(t.unmutatedMs).padStart(12));
}
if (survived) for (const r of results.filter(x => x.status === 'survived')) console.log('  survivor ' + r.id + ' ' + r.file + ': ' + r.why);
if (notRun) for (const r of results.filter(x => x.status === 'not executed')) console.log('  NOT EXECUTED ' + r.id + ' ' + r.file + ': ' + (r.error || 'the mutated line never ran'));
if (flag('--keep')) console.log('copy kept at ' + COPY);
else rmSync(base, { recursive: true, force: true });
process.exit(verdict === 'GREEN' ? 0 : 1);
