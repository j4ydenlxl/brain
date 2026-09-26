#!/usr/bin/env node
// bench/dream.mjs: THE BAR for the imagination region (mind/dream.mjs, his P11: "It also should
// hallucinate"). One run, three organisms built from the same seed:
//   A  dreams: attachDream on its own period, from tick 0
//   B  does not dream: the no-dream arm for ticks per second and for the task effect
//   C  does not dream either: B's twin, so B against C is the timing noise band of two arms
//      that differ in NOTHING, measured in the same ticks and the same regime as A against B
// The arms are ticked in chunks of one dream period, and the order inside a chunk rotates
// through all six orders of A, B, C, so no arm always runs first (or last) on a warm cache.
//
// Printed: the ticks run, dreams per minute of the dreaming organism's wall time, the novelty
// fraction, the fraction grounded later against the matched replay control, proposals
// submitted and what the gate did with them, ticks per second with and without dreaming (and
// the B against C band), and the task effect: every algebra, sequence and grid item
// bench/answer.mjs draws, asked of A and of B after the dream phase through act/prompt.mjs ask
// with provider null (the exact path, then memory; no model call anywhere), accuracy per suite
// for both arms with Wilson intervals, the difference with a Newcombe interval, and whether A
// is below B on any suite.
//
//   node bench/dream.mjs                     the bar: writes bench/verdicts/dream.json once
//   node bench/dream.mjs --ticks 300 --tasks 5   a narrow run: writes dream-partial.json
//   flags: --ticks N --every N --majors N --units N --tasks N (0 = every item) --seed S --nowrite --json
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWhole } from '../seeds/whole.mjs';
import { attachDream, SUITE_SOURCES, GENERATORS } from '../mind/dream.mjs';
import { buildQuestions, gradeAnswer, wilson } from './answer.mjs';
import { ask } from '../act/prompt.mjs';

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
/** What the dream bar developed on and what it graded: pure, from the seed and the task count. */
export function splitFor(opts = {}) {
  return {
    development: { what: 'the organism seed all three arms are built from and the algebra, sequence and grid items bench/answer.mjs draws; mind/dream.mjs was written against these organisms', seed: opts.seed ?? null, tasksPerSuite: opts.tasks ?? null },
    heldOut: { what: 'none: the task effect asks the bench/answer.mjs suite items of the dreaming arm and the no-dream arm alike, and the grounding control is a matched replay of the same run, not a held-out set', n: 0 },
    contaminated: 'no held-out set: the task effect is read on the bench/answer.mjs suites, not on items set aside from development',
  };
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VERDICTS = path.join(HERE, 'verdicts');
export const BAR = Object.freeze({ ticks: 1200, every: 32, majors: 12, units: 256, tasks: 0, seed: 'dream-bench' });

function args(argv) {
  const o = { ...BAR, nowrite: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i], v = argv[i + 1];
    if (a === '--nowrite') o.nowrite = true;
    else if (a === '--json') o.json = true;
    else if (a === '--seed') { o.seed = String(v); i++; }
    else if (['--ticks', '--every', '--majors', '--units', '--tasks'].includes(a)) { o[a.slice(2)] = Number(v); i++; }
    else throw new Error('dream bench: unknown flag ' + a);
  }
  return o;
}

const r6 = (x) => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : null);
const r3 = (x) => (Number.isFinite(x) ? Math.round(x * 1e3) / 1e3 : null);
const pct = (x) => (Number.isFinite(x) ? (100 * x).toFixed(2) + '%' : 'n/a');
const frac = (a, b) => (b > 0 ? a / b : null);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const ORDERS = [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [2, 1, 0], [1, 0, 2]];

/** Newcombe's hybrid score interval for p1 - p2 from two Wilson intervals (method 10). */
export function newcombe(c1, n1, c2, n2) {
  if (!(n1 > 0 && n2 > 0)) return { diff: null, lo: null, hi: null };
  const p1 = c1 / n1, p2 = c2 / n2, w1 = wilson(c1, n1), w2 = wilson(c2, n2);
  const d = p1 - p2;
  return { diff: r6(d), lo: r6(d - Math.sqrt((p1 - w1.lo) ** 2 + (w2.hi - p2) ** 2)), hi: r6(d + Math.sqrt((w1.hi - p1) ** 2 + (p2 - w2.lo) ** 2)) };
}

export async function run(opts = {}) {
  const o = { ...BAR, ...opts };
  const narrow = o.ticks < BAR.ticks || o.majors < BAR.majors || o.units < BAR.units || o.tasks > 0;
  const say = opts.quiet ? () => {} : (l) => console.log(l);
  const t0 = performance.now();
  const arms = ['A', 'B', 'C'].map((k) => {
    const b0 = performance.now();
    const { brain, report } = buildWhole({ majors: o.majors, substrateUnits: o.units, seed: o.seed, name: 'dream-' + k + '-' + o.seed, ledger: 'full' });
    return { k, brain, hvPlan: report.hvPlan || null, buildMs: performance.now() - b0, ms: 0, chunks: [] };
  });
  const [A, B, C] = arms;
  say('dream bench: 3 organisms, ' + o.majors + ' majors, ' + o.units + ' substrate units, seed ' + o.seed + ', built in ' + arms.map((a) => (a.buildMs / 1000).toFixed(1) + ' s').join(' / ') + ', rss ' + (process.memoryUsage().rss / 1e6).toFixed(0) + ' MB');

  // the trace of the first kept dream, read out of A's ledger the moment it is applied
  let trace = null;
  const keepEvents = { proposal: 0, decision: 0 };
  const L = A.brain.ledger;
  const off = typeof L.on === 'function' ? L.on((e) => {
    if (e && (e.type === 'proposal' || e.type === 'decision') && e.kind === 'dream.keep') keepEvents[e.type]++;
    if (trace || !e || e.type !== 'dream.apply') return;
    const pick = (s) => { const x = s == null ? null : L.get(s); return x ? JSON.parse(JSON.stringify(x, (k, v) => (typeof v === 'bigint' ? String(v) : v))) : null; };
    const score = pick(e.scoreSeq);
    trace = { apply: pick(e.seq), dream: pick(e.dreamSeq), score, matched: pick(score && score.matchSeq), run: pick(score && score.runSeq), proposal: pick(e.proposalSeq) };
  }) : null;

  const region = attachDream(A.brain, { every: o.every, seed: o.seed });
  const readyT = performance.now();
  await region.ready;
  const suiteLoadMs = performance.now() - readyT;
  say('suite probe ' + region.suiteState + (region.suite ? ': ' + region.suite.items + ' items, ' + region.suite.frontier.length + ' the exact path gets wrong (the frontier a dream can move)' : '') + ', loaded in ' + (suiteLoadMs / 1000).toFixed(2) + ' s');

  // ------------------------------------------------------------ the dream phase
  let chunk = 0;
  const dreamMsAt = [];
  while (A.brain.clock.t < o.ticks) {
    const n = Math.min(o.every, o.ticks - A.brain.clock.t);
    const before = region.stats.ms;
    for (const i of ORDERS[chunk % ORDERS.length]) {
      const a = arms[i], s = performance.now();
      a.brain.tick(n);
      const dt = performance.now() - s;
      a.ms += dt; a.chunks.push(dt);
    }
    dreamMsAt.push(region.stats.ms - before);
    chunk++;
    if (chunk % 8 === 0) say('  t ' + A.brain.clock.t + ': ' + region.summaryLine());
  }
  const ticks = A.brain.clock.t;
  const wallA = A.ms;
  const dreamsMade = region.stats.dreams;
  // settle: every dream made in the last cycle gets the same horizon the others had (five
  // periods, when decay would drop it), with no new dreams made; all three arms tick it
  region.detach();
  const settle = 5 * o.every;
  for (let s = 0; s < settle; s += o.every) {
    for (const a of arms) a.brain.tick(Math.min(o.every, settle - s));
    region.observe(); // read the ledger before its ring wraps: the first bar run missed 9288 events here
  }
  const fl = region.flush();

  const tps = (a) => ticks / (a.ms / 1000);
  const ratioAB = A.ms / B.ms, ratioCB = C.ms / B.ms;
  const perChunkAB = A.chunks.map((x, i) => x / B.chunks[i]), perChunkCB = C.chunks.map((x, i) => x / B.chunks[i]);
  const rep = region.report();
  const timing = {
    ticks, chunks: chunk, chunkTicks: o.every, settleTicks: settle,
    tpsDreaming: r3(tps(A)), tpsNoDream: r3(tps(B)), tpsTwin: r3(tps(C)),
    msA: r3(A.ms), msB: r3(B.ms), msC: r3(C.ms),
    slowdownAB: r6(ratioAB - 1), bandCB: r6(ratioCB - 1),
    medianChunkAB: r6(median(perChunkAB)), medianChunkCB: r6(median(perChunkCB)),
    dreamMs: r3(rep.ms), dreamShareOfA: r6(rep.ms / A.ms), dreamMsMaxCycle: rep.msMax,
    suiteLoadMs: r3(suiteLoadMs),
  };
  const minutes = wallA / 60000;
  const dreams = {
    made: dreamsMade, perMinute: r3(dreamsMade / minutes), wallMinutesA: r6(minutes),
    novel: rep.novel, noveltyFraction: rep.noveltyFraction, noveltyThreshold: rep.noveltyThreshold,
    resolved: rep.resolved, grounded: rep.grounded, groundedInFlight: rep.groundedInFlight, falsified: rep.falsified, expired: rep.expired, pendingAtEnd: rep.pending,
    groundedLaterFraction: rep.groundedLaterFraction, groundedWilson: wilson(rep.grounded, rep.resolved),
    control: { ...rep.control, wilson: wilson(rep.control.grounded, rep.control.resolved) },
    groundedGapOverControl: newcombe(rep.grounded, rep.resolved, rep.control.grounded, rep.control.resolved),
    horizon: rep.horizon,
    groundedAfterBirth: rep.grounded - rep.groundedInFlight, controlAfterBirth: rep.control.grounded - rep.control.inFlight,
    strictFraction: r6(frac(rep.grounded - rep.groundedInFlight, rep.resolved)), strictControlFraction: r6(frac(rep.control.grounded - rep.control.inFlight, rep.control.resolved)),
    strictGapOverControl: newcombe(rep.grounded - rep.groundedInFlight, rep.resolved, rep.control.grounded - rep.control.inFlight, rep.control.resolved),
    proposals: rep.proposals, decayed: rep.decayed, cycles: rep.cycles, skippedForAsk: rep.skippedForAsk,
    suite: rep.suite, byGenerator: rep.byGenerator, byRule: rep.byRule, mind: rep.mind,
    budgetStops: rep.budgetStops, budgetMs: rep.budgetMs, observedRuns: rep.observedRuns, missedEvents: rep.missedEvents, errors: rep.errors, lastError: rep.lastError,
    observers: rep.observers, flush: fl,
  };
  const counts = {};
  for (const k of ['dream', 'dream.score', 'dream.decay', 'dream.apply', 'dream.cycle']) counts[k] = L.counts.get(k) || 0;
  counts['proposal dream.keep'] = keepEvents.proposal; counts['decision dream.keep'] = keepEvents.decision;
  dreams.ledger = { counts, everyDreamLogged: counts.dream === dreamsMade, everyResolutionScored: counts['dream.score'] === rep.resolved };

  say('ran ' + ticks + ' ticks per organism (' + chunk + ' chunks of ' + o.every + ', order rotated), then ' + settle + ' settle ticks with no new dreams');
  say('dreams per minute: ' + dreams.perMinute + ' (' + dreamsMade + ' dreams in ' + (wallA / 1000).toFixed(1) + ' s of the dreaming organism wall time, ' + rep.cycles + ' cycles)');
  say('novelty fraction: ' + pct(rep.noveltyFraction) + ' (' + rep.novel + ' of ' + dreamsMade + ' at hv distance >= ' + rep.noveltyThreshold + ' from memory)');
  say('grounded-later fraction: ' + pct(rep.groundedLaterFraction) + ' (' + rep.grounded + ' of ' + rep.resolved + ' resolved, Wilson ' + pct(dreams.groundedWilson.lo) + ' to ' + pct(dreams.groundedWilson.hi) + '; ' + rep.pending + ' unresolved at the end, ' + rep.expired + ' expired unobserved)');
  say('matched replay control: ' + pct(rep.control.fraction) + ' (' + rep.control.grounded + ' of ' + rep.control.resolved + '); dream minus control ' + pct(dreams.groundedGapOverControl.diff) + ' [' + pct(dreams.groundedGapOverControl.lo) + ', ' + pct(dreams.groundedGapOverControl.hi) + ']');
  say('grounded by a signal emitted AFTER the dream was born (horizon ' + rep.horizon + ' runs): ' + dreams.groundedAfterBirth + ' of ' + rep.resolved + ' (' + pct(dreams.strictFraction) + '), ' + rep.groundedInFlight + ' matched a signal already in flight at birth; control ' + dreams.controlAfterBirth + ' of ' + rep.control.resolved + ' (' + pct(dreams.strictControlFraction) + '); strict gap ' + pct(dreams.strictGapOverControl.diff) + ' [' + pct(dreams.strictGapOverControl.lo) + ', ' + pct(dreams.strictGapOverControl.hi) + ']');
  say('ledger events never read: ' + rep.missedEvents);
  for (const g of GENERATORS) { const x = rep.byGenerator[g]; say('  ' + g + ': ' + x.dreams + ' dreams, ' + x.novel + ' novel, ' + x.grounded + ' of ' + x.resolved + ' grounded, ' + x.proposed + ' proposed, ' + x.applied + ' kept'); }
  say('proposals submitted: ' + rep.proposals.submitted + ' (approved ' + rep.proposals.approved + ', held ' + rep.proposals.held + ', rejected ' + rep.proposals.rejected + ', applied ' + rep.proposals.applied + ' as dream episodes in memory)');
  say('ticks/s with dreaming: ' + timing.tpsDreaming + ', without: ' + timing.tpsNoDream + ' (twin without: ' + timing.tpsTwin + '); A over B ' + pct(timing.slowdownAB) + ' slower, C over B ' + pct(timing.bandCB) + ' (the no-difference band); the region itself ' + (rep.ms / 1000).toFixed(2) + ' s = ' + pct(timing.dreamShareOfA) + ' of A (budget ' + pct(rep.budgetShare) + ' of each period, at most ' + rep.budgetMs + ' ms), longest cycle ' + rep.msMax + ' ms');
  say('ledger: ' + JSON.stringify(counts) + (dreams.ledger.everyDreamLogged && dreams.ledger.everyResolutionScored ? ', every dream logged and every resolution scored' : ', COUNTS DISAGREE'));

  // ------------------------------------------------------------ the task effect
  const items = buildQuestions({ tasksPerSuite: o.tasks > 0 ? o.tasks : 1_000_000 }).filter((q) => SUITE_SOURCES.includes(q.source));
  const acc = { A: {}, B: {} };
  for (const s of SUITE_SOURCES) for (const k of ['A', 'B']) acc[k][s] = { correct: 0, n: 0, exact: 0, memory: 0 };
  const disc = Object.fromEntries(SUITE_SOURCES.map((s) => [s, { aOnly: 0, bOnly: 0 }]));
  const askT = performance.now();
  for (let i = 0; i < items.length; i++) {
    const q = items[i];
    const res = {};
    for (const a of (i % 2 ? [B, A] : [A, B])) {
      const r = await ask(a.brain, q.q, { provider: 'null', route: 'direct', spawn: false });
      const ok = gradeAnswer(r.text, q).ok;
      const x = acc[a.k][q.source];
      x.n++; if (ok) x.correct++;
      if (r.from === 'exact') x.exact++; else if (r.from === 'memory') x.memory++;
      res[a.k] = ok;
    }
    if (res.A && !res.B) disc[q.source].aOnly++;
    if (res.B && !res.A) disc[q.source].bOnly++;
  }
  const askMs = performance.now() - askT;
  // the region's next cycle after the asks must see them and wait
  const after = region.cycle();
  const task = {};
  let notBelowAll = true;
  for (const s of SUITE_SOURCES) {
    const a = acc.A[s], b = acc.B[s];
    const nc = newcombe(a.correct, a.n, b.correct, b.n);
    const notBelow = a.correct >= b.correct;
    if (!notBelow) notBelowAll = false;
    task[s] = { n: a.n, dream: { ...a, acc: r6(frac(a.correct, a.n)), wilson: wilson(a.correct, a.n) }, noDream: { ...b, acc: r6(frac(b.correct, b.n)), wilson: wilson(b.correct, b.n) }, gain: nc, discordant: disc[s], notBelow };
    say('task ' + s + ': dream ' + a.correct + '/' + a.n + ' (' + pct(frac(a.correct, a.n)) + '), no-dream ' + b.correct + '/' + b.n + ' (' + pct(frac(b.correct, b.n)) + '), gain ' + pct(nc.diff) + ' [' + pct(nc.lo) + ', ' + pct(nc.hi) + '], discordant ' + disc[s].aOnly + ' dream-only / ' + disc[s].bOnly + ' no-dream-only, ' + (notBelow ? 'not below' : 'BELOW'));
  }
  say('task effect: ' + items.length + ' items per arm asked in ' + (askMs / 1000).toFixed(1) + ' s, provider null (no model call); dream ' + (notBelowAll ? 'is not below' : 'IS BELOW') + ' no-dream on every suite; the cycle after the asks ' + (after.skipped ? 'waited (' + after.skipped + ')' : 'did not wait'));
  if (off) off();

  const barMet = notBelowAll && dreamsMade > 0 && rep.resolved > 0 && rep.proposals.submitted > 0 && dreams.ledger.everyDreamLogged && dreams.ledger.everyResolutionScored && !!after.skipped && rep.errors === 0;
  const frontier = region.suite ? region.suite.frontier.length : null;
  const statement = 'Three ' + o.majors + ' major organisms from one seed ran ' + ticks + ' ticks each in rotated chunks; A dreamed every ' + o.every + ' ticks, B and C did not. A made ' + dreamsMade + ' dreams (' + dreams.perMinute + ' per wall minute), every one a signal with provenance dream and grounded false and a ledger event with its novelty; '
    + rep.novel + ' of them (' + pct(rep.noveltyFraction) + ') sat at hv distance ' + rep.noveltyThreshold + ' or more from memory. Of ' + rep.resolved + ' resolved against the observer cell consuming run ' + rep.horizon + ' after birth, ' + rep.grounded + ' (' + pct(rep.groundedLaterFraction) + ') were grounded later by a named ledger event, against '
    + rep.control.grounded + ' of ' + rep.control.resolved + ' (' + pct(rep.control.fraction) + ') for the matched replay control; ' + dreams.groundedAfterBirth + ' of those groundings (' + pct(dreams.strictFraction) + ' of resolved) were by a signal emitted after the dream was born and ' + rep.groundedInFlight + ' by one already in flight, against ' + dreams.controlAfterBirth + ' (' + pct(dreams.strictControlFraction) + ') for the control. ' + rep.proposals.submitted + ' novel and grounded dreams were proposed to the gate as dream.keep, ' + rep.proposals.applied + ' applied as memory items still labelled dream; nothing was applied without an approved proposal. '
    + 'Ticks per second were ' + timing.tpsDreaming + ' dreaming and ' + timing.tpsNoDream + ' not (twin ' + timing.tpsTwin + '), the region taking ' + pct(timing.dreamShareOfA) + ' of A wall time. On the ' + items.length + ' algebra, sequence and grid items asked with no model call, dream was ' + (notBelowAll ? 'not below' : 'BELOW') + ' no-dream on every suite ('
    + SUITE_SOURCES.map((s) => s + ' ' + task[s].dream.correct + '/' + task[s].n + ' vs ' + task[s].noDream.correct + '/' + task[s].n).join(', ') + '); the exact path already answers all but ' + frontier + ' of ' + (region.suite ? region.suite.items : 'n/a') + ' suite items, so these suites leave a dream almost nothing to move, and the suite probe measured a total gain of ' + rep.suite.gain + '.';
  say('statement: ' + statement);
  say('bar ' + (barMet ? 'MET' : 'NOT MET') + (narrow ? ' (narrow run: partial)' : ''));

  const verdict = {
    at: new Date().toISOString(), command: 'node bench/dream.mjs' + (opts.argv && opts.argv.length ? ' ' + opts.argv.join(' ') : ''), node: process.version,
    isTheBar: !narrow, barMet, statement,
    split: splitFor({ seed: o.seed, tasks: o.tasks }),
    config: { ticks: o.ticks, every: o.every, majors: o.majors, substrateUnits: o.units, tasks: o.tasks, seed: o.seed, arms: { A: 'dreams', B: 'no dream', C: 'no dream, twin of B for the timing band' } },
    dreams, timing, task, taskItems: items.length, askMs: r3(askMs), afterAsks: after, trace,
    build: arms.map((a) => ({ arm: a.k, ms: r3(a.buildMs), hvPlan: a.hvPlan })), wallMs: r3(performance.now() - t0), rssMB: Math.round(process.memoryUsage().rss / 1e6),
  };
  if (!opts.nowrite) {
    mkdirSync(VERDICTS, { recursive: true });
    const file = path.join(VERDICTS, narrow ? 'dream-partial.json' : 'dream.json');
    writeFileSync(file, JSON.stringify(verdict, (k, v) => (typeof v === 'bigint' ? String(v) : v), 2) + '\n');
    say('wrote ' + path.relative(path.join(HERE, '..'), file).split(path.sep).join('/'));
  }
  return verdict;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const o = args(argv);
  const v = await run({ ...o, argv });
  if (o.json) console.log(JSON.stringify(v, (k, x) => (typeof x === 'bigint' ? String(x) : x)));
}
