// bench/ns.mjs. THE NS BAR (Board 15, item ns). Author: board 15 builder.
//
// reason/solved.mjs keeps every math-region program that was verified on a question as a
// TEMPLATE (the question with its numbers as slots, the program with the same slots, the
// verification it passed) and answers a question that matches one with provenance "solved" and
// no model call. This bench measures that region the way the bar asks, model OFF (nothing here
// opens the Ollama socket; it reads what is on disk):
//
//   (1) THE JOURNALS: every bench/verdicts/**/*.jsonl, per file its rows, its arm rows, the rows
//       that carry a program, and the GSM8K ids it names anywhere in its text. The DEVELOPMENT
//       records are every GSM8K id any journal names, plus bench/public.mjs gsm8kDevIds (the
//       records bench/verdicts/math.json lists and the three the math prompts were probed on).
//   (2) THE FILL: every journal row with a program, graded right against the gold answer and
//       reproduced by the sandbox, becomes a template (reason/solved.mjs fillFromRows). The
//       templates are written to state/self/ns-templates.jsonl (the file ask() reads for
//       opts.solved true or BRAIN_SOLVED=1), read back, and compared. The fill's own numbers are
//       written to bench/verdicts/ns-fill-partial.json (isTheBar false) before anything is timed.
//   (3) HELD OUT: 200 GSM8K test records that no journal names and that are not development,
//       drawn by bench/public.mjs sampleIds at the public bench seed. Each is asked as
//       ALONE_PROMPT(question) through act/prompt.mjs ask() with the model cell 'null' (no
//       socket) and the solved region on, and again with it off (the fall-through control: a
//       record solved does not answer must get the answer the ask path gives without solved).
//       Printed: the share answered by solved, its accuracy against the gold (bench/public.mjs
//       lastNumber and sameInteger) beside the published 405B row, the ns per response
//       (process.hrtime.bigint around each of 1,000 repeats of the same ask, each repeat a fresh
//       copy of the string, two passes for the run-to-run noise, beside an empty bracket), and
//       the share that fell through to the next region with the provenance it got there.
//   (4) THE MEMOISATION CONTROL: the same on the development records, all of them and the ones a
//       template was filled from. Those must be answered, and answered right: they are the
//       records the programs were verified on.
//   (5) RE-NUMBERED: each template's own question with its bound numbers doubled, matched by the
//       slot form; the compiled answer is compared with the sandbox run of the same program on the
//       same numbers. Not graded (no gold exists for a question nobody wrote).
//   (6) THE CEILING of an exact slot-form match on held-out GSM8K: how many held-out records share
//       a slot form with any other GSM8K record, and with a template.
//   (7) THE WIKI DIRECT CLASS, re-measured as bench/native.mjs measures it: the direct table
//       filled from the whole knowledge store on 2 worker threads, the 200 held-out wiki facts
//       asked through ask() with the solved region on and off and with the control table (the
//       drawn titles left out), and 1,000,000 lookups a run timed.
//   (8) THE GAP: a held-out share under 100% opens a gap of kind "ns class share" (distance to
//       100%) in state/self/ns-gap.jsonl, whose trial is the loop's own fill (a math region
//       answer the memory verifies becomes a template; needsModel true).
//
// Writes bench/verdicts/ns.json once, at the end, when every step printed. A narrower run
// (--limit under 200, fewer repeats, --no-wiki or --wiki-titles) writes bench/verdicts/ns-partial.json.
//
//   node --max-old-space-size=6000 bench/ns.mjs [--limit 200] [--repeats 1000] [--ask-repeats 1000]
//        [--miss-ask-repeats 100] [--workers 2] [--no-wiki] [--wiki-titles N (fill only N titles: a smoke)]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');
const AUTHOR = 'board 15 builder';
const GAP_REL = 'state/self/ns-gap.jsonl';
const GAP_KIND = 'ns class share';
const BAR = Object.freeze({ heldOut: 200, repeats: 1000, askRepeats: 1000, missAskRepeats: 100, published: 96.8, wiki: 200, lookups: 1_000_000, passes: 2 });

const argv = process.argv.slice(2);
const flag = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const r1 = (x) => (x === null || x === undefined ? null : Math.round(x * 10) / 10);
const r2 = (x) => (x === null || x === undefined ? null : Math.round(x * 100) / 100);
const r4 = (x) => (x === null || x === undefined ? null : Math.round(x * 1e4) / 1e4);
const pct = (x) => (x === null || x === undefined || !Number.isFinite(x) ? 'n/a' : (100 * x).toFixed(1) + '%');
const peakMb = () => r1(process.resourceUsage().maxRSS / 1024);
const count = (xs, f) => xs.reduce((n, x) => n + (f(x) ? 1 : 0), 0);
const tally = (xs, f) => xs.reduce((m, x) => { const k = f(x); if (k !== null && k !== undefined) m[k] = (m[k] || 0) + 1; return m; }, {});

// ------------------------------------------------------------------ distributions
function quant(sorted, p) { return sorted.length ? sorted[Math.floor(p * (sorted.length - 1))] : null; }
/** Median, p99 and friends of a Float64Array (sorted in place). */
function dist(a) {
  a.sort();
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return { n: a.length, median: r1(quant(a, 0.5)), p90: r1(quant(a, 0.9)), p99: r1(quant(a, 0.99)), min: a.length ? r1(a[0]) : null, max: a.length ? r1(a[a.length - 1]) : null, mean: a.length ? r1(s / a.length) : null };
}
/** The per-record arrays of some rows, joined into one. */
function pool(rows, key) {
  let n = 0;
  for (const r of rows) if (r[key]) n += r[key].length;
  const out = new Float64Array(n);
  let o = 0;
  for (const r of rows) if (r[key]) { out.set(r[key], o); o += r[key].length; }
  return out;
}
const distLine = (d) => (d && d.n ? `median ${d.median} ns, p99 ${d.p99} ns (p90 ${d.p90}, min ${d.min}, max ${d.max}, mean ${d.mean}; ${d.n} timed)` : 'nothing timed');

// ------------------------------------------------------------------ timing
function copies(text, n) {
  const out = new Array(n);
  for (let i = 0; i < n; i++) out[i] = Buffer.from(text).toString();
  return out;
}
/** THE SOLVED STEP as ask() runs it (match, then resolve when a sandbox template is pending). */
async function timeStep(mem, text, reps) {
  const cs = copies(text, reps), ns = new Float64Array(reps);
  let hits = 0;
  for (let i = 0; i < reps; i++) {
    const t0 = process.hrtime.bigint();
    let m = mem.match(cs[i]);
    if (m.pending) m = await mem.resolve(m);
    ns[i] = Number(process.hrtime.bigint() - t0);
    if (m.hit) hits++;
  }
  // the same repeats in one bracket, for the cost without a clock read per call
  const cb = copies(text, reps);
  const b0 = process.hrtime.bigint();
  for (let i = 0; i < reps; i++) { const m = mem.match(cb[i]); if (m.pending) await mem.resolve(m); }
  const batchNs = Number(process.hrtime.bigint() - b0) / reps;
  return { ns, hits, batchNs };
}
/** A WHOLE ask() through act/prompt.mjs, and the solved step's ns as ask() itself printed it on a hit. */
async function timeAsk(P, brain, text, opts, reps) {
  const cs = copies(text, reps), ns = new Float64Array(reps), inner = [];
  for (let i = 0; i < reps; i++) {
    const t0 = process.hrtime.bigint();
    const a = await P.ask(brain, cs[i], opts);
    ns[i] = Number(process.hrtime.bigint() - t0);
    if (a.provenance.solved) inner.push(a.provenance.solved.ns);
  }
  return { ns, inner: Float64Array.from(inner) };
}
/** THE CONTROL: two clock reads with nothing between them. */
function timeEmpty(reps) {
  const ns = new Float64Array(reps);
  for (let i = 0; i < reps; i++) { const t0 = process.hrtime.bigint(); ns[i] = Number(process.hrtime.bigint() - t0); }
  return ns;
}

// ------------------------------------------------------------------ the journals
function journalFiles(dir) {
  const out = [];
  const walk = (d) => {
    let es = [];
    try { es = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of es) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile() && p.endsWith('.jsonl')) out.push(p);
    }
  };
  walk(dir);
  return out.sort((a, b) => (rel(a) < rel(b) ? -1 : rel(a) > rel(b) ? 1 : 0));
}
const GSM_ID_RE = /\bgsm8k\.(\d+)\b/g;
function gsmIdsIn(text) {
  const s = new Set();
  for (const m of text.matchAll(GSM_ID_RE)) s.add('gsm8k.' + m[1]);
  return s;
}

// ------------------------------------------------------------------ one set of GSM8K records
/**
 * Ask each record through ask() with solved on and off, then time the solved step and the whole
 * ask. Rows keep their per-repeat arrays so a subset can be pooled later.
 */
async function askSet(ctx, recs, label) {
  const { P, brain, quiet, mem, reps, askReps, missAskReps, passes, lastNumber, sameInteger, ALONE_PROMPT } = ctx;
  const rows = [];
  for (const r of recs) {
    const prompt = ALONE_PROMPT(r.question);
    let m = mem.match(prompt);
    if (m.pending) m = await mem.resolve(m);
    const on = await P.ask(brain, prompt, { ...quiet, solved: mem });
    const off = await P.ask(brain, prompt, { ...quiet, solved: false });
    const prov = on.provenance.answer, got = lastNumber(on.text), offGot = lastNumber(off.text);
    rows.push({
      id: r.id, gold: r.gold, hit: !!m.hit, why: m.hit ? null : m.why, via: m.via ?? null, run: m.run ?? null, template: m.hit ? m.template.id : null,
      provenance: prov, got, ok: sameInteger(got, r.gold), offProvenance: off.provenance.answer, offGot, offOk: sameInteger(offGot, r.gold),
      sameAsOff: prov === 'solved' ? null : prov === off.provenance.answer && got === offGot,
      step: [], stepBatch: [], ask: [], askInner: [],
    });
  }
  for (let p = 0; p < passes; p++) {
    const t0 = Date.now();
    for (let i = 0; i < recs.length; i++) {
      const prompt = ALONE_PROMPT(recs[i].question);
      const s = await timeStep(mem, prompt, reps);
      rows[i].step[p] = s.ns; rows[i].stepBatch[p] = s.batchNs;
      // a whole ask solved did not answer is the next region's answer (about a millisecond with the
      // model cell offline), so it is timed over fewer repeats; the solved step itself always gets reps
      const a = await timeAsk(P, brain, prompt, { ...quiet, solved: mem }, rows[i].provenance === 'solved' ? askReps : missAskReps);
      rows[i].ask[p] = a.ns; rows[i].askInner[p] = a.inner;
    }
    ctx.say(`  ${label}: timing pass ${p + 1} of ${passes}, ${recs.length} records x ${reps} solved steps, and ${askReps} whole asks a record solved answers (${missAskReps} a record it does not), ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  return rows;
}

/** The printed summary of some rows of a set. */
function summarize(rows, passes, wilson) {
  const n = rows.length;
  const solved = rows.filter((x) => x.provenance === 'solved');
  const correct = count(solved, (x) => x.ok);
  const fell = rows.filter((x) => x.provenance !== 'solved');
  const w = wilson(correct, solved.length);
  const byPass = (key) => {
    const out = [];
    for (let p = 0; p < passes; p++) out.push(dist(pool(rows.map((x) => ({ a: x[key][p] })), 'a')));
    return out;
  };
  const batch = [];
  for (let p = 0; p < passes; p++) { const xs = rows.map((x) => x.stepBatch[p]).filter(Number.isFinite); batch.push(xs.length ? r1(xs.reduce((s, x) => s + x, 0) / xs.length) : null); }
  return {
    n, solved: solved.length, share: n ? r4(solved.length / n) : null, correct, accuracy: solved.length ? r4(correct / solved.length) : null, wilson: w,
    matchHits: count(rows, (x) => x.hit), matchAgreesWithAsk: count(rows, (x) => x.hit === (x.provenance === 'solved')),
    fellThrough: fell.length, fellShare: n ? r4(fell.length / n) : null, fellByProvenance: tally(fell, (x) => x.provenance), fellSameAsOff: count(fell, (x) => x.sameAsOff === true),
    fellCorrect: count(fell, (x) => x.ok), offCorrect: count(rows, (x) => x.offOk), missWhy: tally(rows, (x) => x.why), via: tally(solved, (x) => x.via), run: tally(solved, (x) => x.run),
    step: byPass('step'), stepBatchMeanNs: batch, ask: byPass('ask'), askInner: byPass('askInner'),
  };
}
function setLines(say, label, s, pub) {
  say(`  ${label}: ${s.n} records; answered by solved ${s.solved}/${s.n} (${pct(s.share)}); standalone match hits ${s.matchHits}, agreeing with ask() on ${s.matchAgreesWithAsk}/${s.n}`);
  say(`    accuracy of the solved answers: ${s.solved ? `${s.correct}/${s.solved} (${pct(s.accuracy)}, Wilson 95% ${pct(s.wilson.lo)} to ${pct(s.wilson.hi)})` : 'none answered, so no accuracy (0 of 0 is not 0%)'}; the published row ${pub.system} ${pub.score} (${pub.metric})`);
  say(`    fell through to the next region: ${s.fellThrough}/${s.n} (${pct(s.fellShare)}), provenance there ${JSON.stringify(s.fellByProvenance)}, the same answer as ask() with solved off ${s.fellSameAsOff}/${s.fellThrough}; why solved passed: ${JSON.stringify(s.missWhy)}`);
  if (s.solved) say(`    solved answers by key ${JSON.stringify(s.via)}, by runner ${JSON.stringify(s.run)}`);
  for (let p = 0; p < s.step.length; p++) {
    say(`    pass ${p + 1}: the solved step (match${s.solved ? ', and the answer' : ', a miss'}) ${distLine(s.step[p])}; one bracket around each record's repeats ${s.stepBatchMeanNs[p]} ns a call (mean of records)`);
    say(`    pass ${p + 1}: a whole ask() ${distLine(s.ask[p])}${s.askInner[p].n ? '; the solved step as ask() printed it ' + distLine(s.askInner[p]) : ''}`);
  }
}

// ------------------------------------------------------------------ the wiki direct class
function timeTable(table, n, RNG, reps = 3) {
  const occ = new Int32Array(table.n);
  let m = 0;
  for (let s = 0; s < table.cap; s++) if (table.ref[s] >= 0) occ[m++] = s;
  const rng = new RNG('ns-lookups-2026-09-25');
  const H = new Uint32Array(4 * n), M = new Uint32Array(4 * n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const s = occ[rng.u32() % m];
    H[j] = table.kh[s]; H[j + 1] = table.kl[s]; H[j + 2] = table.vh[s]; H[j + 3] = table.vl[s];
    M[j] = rng.u32(); M[j + 1] = rng.u32(); M[j + 2] = rng.u32(); M[j + 3] = rng.u32();
  }
  let hitsFound = 0, missesFound = 0;
  for (let j = 0; j < 4 * n; j += 4) {
    if (table.lookup(H[j], H[j + 1], H[j + 2], H[j + 3]) >= 0) hitsFound++;
    if (table.lookup(M[j], M[j + 1], M[j + 2], M[j + 3]) >= 0) missesFound++;
  }
  const loop = (K) => { let acc = 0; const t0 = process.hrtime.bigint(); for (let j = 0; j < K.length; j += 4) acc += table.lookup(K[j], K[j + 1], K[j + 2], K[j + 3]); return { ns: Number(process.hrtime.bigint() - t0), acc }; };
  const bare = (K) => { let acc = 0; const t0 = process.hrtime.bigint(); for (let j = 0; j < K.length; j += 4) acc += (K[j] ^ K[j + 1] ^ K[j + 2] ^ K[j + 3]) & 1; return { ns: Number(process.hrtime.bigint() - t0), acc }; };
  const hit = [], miss = [], empty = [];
  let sink = 0;
  for (let r = 0; r < reps; r++) {
    const a = loop(H), b = loop(M), c = bare(H);
    hit.push(a.ns / n); miss.push(b.ns / n); empty.push(c.ns / n); sink += a.acc + b.acc + c.acc;
  }
  const med = (xs) => xs.slice().sort((x, y) => x - y)[xs.length >> 1];
  return { lookups: n, reps, hitNs: hit.map(r2), missNs: miss.map(r2), emptyLoopNs: empty.map(r2), hitNsMedian: r2(med(hit)), missNsMedian: r2(med(miss)), emptyLoopNsMedian: r2(med(empty)), hitsFound, missesFound, entries: table.n, slots: table.cap, sink };
}

async function wikiClass(ctx) {
  const { P, brain, say, mem, workers, wikiTitles } = ctx;
  const D = await import('../memory/direct.mjs');
  const K = await import('../memory/knowledge.mjs');
  const { RNG } = await import('../core/rng.mjs');
  const { gradeWiki, modelAsked } = await import('./recall.mjs');
  const { drawHeldout, DRAW_SEED } = await import('./knowledge.mjs');
  const kdir = P.KNOWLEDGE_DIR;
  const ks = K.KnowledgeStore.open(kdir);
  const { pool: wpool, drawn } = drawHeldout(kdir, BAR.wiki);
  const f0 = Date.now();
  let nextPct = 25;
  const cols = await D.fillFromStore({
    storeDir: kdir, pool: P.KNOWLEDGE.pool, from: 0, to: wikiTitles === null ? ks.A : Math.min(ks.A, wikiTitles), workers, chunk: 1000,
    onProgress: (done, total, entries) => {
      const p = (100 * done) / total;
      if (p >= nextPct) { say(`  wiki fill ${done}/${total} titles, ${entries} entries, ${((Date.now() - f0) / 1000).toFixed(1)} s`); while (nextPct <= p) nextPct += 25; }
    },
  });
  const meta = D.bindingOf(ks.meta, P.KNOWLEDGE.floor);
  const drawnCanon = new Set(drawn.map((h) => K.normTitle(h.title)));
  const full = D.tableFromColumns(cols, { meta });
  const control = D.tableFromColumns(cols, { meta, keep: (i) => !drawnCanon.has(K.normTitle(cols.asked[i])) });
  const fc = full.counts();
  say(`  wiki fill: ${wikiTitles === null ? ks.A : Math.min(ks.A, wikiTitles)} of ${ks.A} titles on ${workers} worker threads in ${(cols.ms / 1000).toFixed(1)} s, ${cols.n} answered by the tier; table ${fc.entries} entries, ${full.cap} slots; the control table (the ${drawn.length} drawn titles left out) ${control.n} entries`);
  const base = { provider: 'null', route: 'direct', spawn: false, knowledge: kdir };
  const items = drawn.map((h) => ({ q: 'What is ' + h.title + '?', title: h.title, head: h.head }));
  for (const it of items) await P.ask(brain, it.q, { ...base, direct: false, solved: false });
  const arms = { 'direct, solved on': { ...base, direct: full, solved: mem }, 'direct, solved off': { ...base, direct: full, solved: false }, 'control table': { ...base, direct: control, solved: false } };
  const names = Object.keys(arms), rows = Object.fromEntries(names.map((k) => [k, []]));
  for (let i = 0; i < items.length; i++) {
    for (let r = 0; r < names.length; r++) {
      const k = names[(i + r) % names.length], it = items[i];
      const t0 = process.hrtime.bigint();
      const a = await P.ask(brain, it.q, arms[k]);
      const ns = Number(process.hrtime.bigint() - t0);
      const g = gradeWiki(a.text, it.head);
      rows[k].push({ title: it.title, provenance: a.provenance.answer, ok: g.ok, native: !modelAsked(a), ns, lookupNs: a.provenance.lookupNs ?? null });
    }
  }
  const S = {};
  for (const k of names) {
    const rs = rows[k], hits = rs.filter((x) => x.provenance === 'direct');
    S[k] = {
      n: rs.length, direct: hits.length, directShare: r4(hits.length / rs.length), directCorrect: count(hits, (x) => x.ok),
      recallAt1: count(rs, (x) => x.ok && x.native && (x.provenance === 'memory' || x.provenance === 'direct')), solved: count(rs, (x) => x.provenance === 'solved'),
      byProvenance: tally(rs, (x) => x.provenance), hitAsk: dist(Float64Array.from(hits.map((x) => x.ns))), hitLookup: dist(Float64Array.from(hits.map((x) => x.lookupNs).filter(Number.isFinite))),
    };
    say(`  wiki ${k}: direct ${S[k].direct}/${S[k].n} (${pct(S[k].directShare)}), of them correct ${S[k].directCorrect}; recall@1 memory or direct ${S[k].recallAt1}; answered by solved ${S[k].solved}; provenance ${JSON.stringify(S[k].byProvenance)}`);
    if (hits.length) say(`    per direct hit: the lookup as ask() printed it ${distLine(S[k].hitLookup)}; a whole ask() ${distLine(S[k].hitAsk)}`);
  }
  let same = 0;
  rows[names[0]].forEach((x, i) => { const y = rows[names[1]][i]; if (x.provenance === y.provenance && x.ok === y.ok) same++; });
  say(`  wiki: the solved region on and off gave the same provenance and grade on ${same}/${items.length} (held out ${items.length} of ${wpool}, seed ${DRAW_SEED})`);
  const timing = timeTable(full, BAR.lookups, RNG, 3);
  say(`  wiki direct table, ${timing.lookups} lookups a run, ${timing.reps} runs: ns per hit ${timing.hitNs.join(' / ')} (median ${timing.hitNsMedian}), ns per miss ${timing.missNs.join(' / ')} (median ${timing.missNsMedian}), the loop without the lookup ${timing.emptyLoopNs.join(' / ')}; hit keys found ${timing.hitsFound}/${timing.lookups}, miss keys found ${timing.missesFound}/${timing.lookups}`);
  let before = null;
  try {
    const nv = JSON.parse(fs.readFileSync(path.join(VERDICTS, 'native.json'), 'utf8'));
    before = { at: nv.at, direct: nv.wiki.arms.direct.direct, directShare: nv.wiki.arms.direct.directShare, n: nv.wiki.arms.direct.n, hitNsMedian: nv.timing.hitNsMedian };
    say(`  bench/verdicts/native.json (${nv.at}) printed direct ${before.direct}/${before.n} (${pct(before.directShare)}) and a median ${before.hitNsMedian} ns a hit`);
  } catch { say('  bench/verdicts/native.json: not readable, no earlier measurement beside this one'); }
  ks.close();
  P.closeKnowledge();
  return { n: items.length, pool: wpool, seed: DRAW_SEED, titles: wikiTitles === null ? ks.A : Math.min(ks.A, wikiTitles), of: ks.A, fillMs: cols.ms, answered: cols.n, entries: fc.entries, controlEntries: control.n, arms: S, sameOnOff: same, timing, before };
}

// ------------------------------------------------------------------ the bar
async function main() {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  const command = 'node ' + ['bench/ns.mjs', ...argv].join(' ');
  const limit = Math.max(1, parseInt(arg('limit', String(BAR.heldOut)), 10) || BAR.heldOut);
  const reps = Math.max(1, parseInt(arg('repeats', String(BAR.repeats)), 10) || BAR.repeats);
  const askReps = Math.max(1, parseInt(arg('ask-repeats', String(BAR.askRepeats)), 10) || BAR.askRepeats);
  const missAskReps = Math.max(1, parseInt(arg('miss-ask-repeats', String(BAR.missAskRepeats)), 10) || BAR.missAskRepeats);
  const wikiTitles = arg('wiki-titles', null) === null ? null : Math.max(1, parseInt(arg('wiki-titles'), 10) || 1);
  const workers = Math.max(1, Math.min(2, parseInt(arg('workers', '2'), 10) || 2));
  const wiki = !flag('no-wiki');
  const narrow = limit < BAR.heldOut || reps < BAR.repeats || askReps < BAR.askRepeats || missAskReps < BAR.missAskRepeats || !wiki || wikiTitles !== null;
  say(`ns: ${command} (node ${process.version}, model off: no socket is opened)`);
  const code = Object.fromEntries(['reason/solved.mjs', 'act/prompt.mjs', 'memory/direct.mjs', 'bench/ns.mjs'].map((f) => [f, sha(path.join(ROOT, f)).slice(0, 16)]));
  say(`code: ${Object.entries(code).map(([f, h]) => f + ' ' + h).join(', ')}`);

  const S = await import('../reason/solved.mjs');
  const P = await import('../act/prompt.mjs');
  const PUB = await import('./public.mjs');
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  const { runProgram, valueKey } = await import('../reason/math.mjs');
  const gsm = PUB.loadGsm8k();
  const byId = new Map(gsm.map((r) => [r.id, r]));
  const pub = PUB.publishedFor('gsm8k')[0] || { system: 'no published row', score: null, metric: null, source: null };

  // (1) the journals
  const files = journalFiles(VERDICTS);
  const journals = [], devJournal = new Set();
  let rowsWithProgram = 0;
  for (const f of files) {
    const j = S.scanJournal(f);
    const ids = gsmIdsIn(fs.readFileSync(f, 'utf8'));
    for (const id of ids) devJournal.add(id);
    rowsWithProgram += j.withProgram;
    journals.push({ file: rel(f), rows: j.rows, arms: j.arms, withProgram: j.withProgram, programRecords: j.programRecords.size, gsm8kIds: ids.size, _j: j });
    say(`journal ${rel(f)}: ${j.rows} rows, ${j.arms} arm rows, ${j.withProgram} with a program (${j.programRecords.size} records), ${ids.size} GSM8K ids named`);
  }
  const devPublic = PUB.gsm8kDevIds();
  const dev = new Set([...devJournal, ...devPublic.set]);
  const devIds = gsm.map((r) => r.id).filter((id) => dev.has(id));
  say(`journals: ${files.length} files, ${rowsWithProgram} rows with a program; development GSM8K records: ${devJournal.size} named by a journal, ${devPublic.set.size} from ${devPublic.source}, ${devIds.length} together`);

  // (2) the fill
  const f0 = Date.now();
  const mem = new S.SolvedMemory({ capacity: 1024 });
  const fill = { rows: 0, graded: 0, right: 0, kept: 0, duplicate: 0, refused: {}, records: new Set(), fast: 0, sandbox: 0, fastWhy: {}, byJournal: [] };
  const questionOf = (id) => (byId.get(id) ? byId.get(id).question : null);
  for (const j of journals) {
    if (!j._j.withProgram) continue;
    const rep = await S.fillFromRows({ rows: j._j.rowsWithProgram, questionOf, memory: mem, file: j.file });
    for (const k of ['rows', 'graded', 'right', 'kept', 'duplicate', 'fast', 'sandbox']) fill[k] += rep[k];
    for (const [k, v] of Object.entries(rep.refused)) fill.refused[k] = (fill.refused[k] || 0) + v;
    for (const [k, v] of Object.entries(rep.fastWhy)) fill.fastWhy[k] = (fill.fastWhy[k] || 0) + v;
    for (const id of rep.records) fill.records.add(id);
    fill.byJournal.push({ file: j.file, rows: rep.rows, right: rep.right, kept: rep.kept, records: rep.records.size });
  }
  const fillMs = Date.now() - f0;
  const tc = mem.table.counts();
  say(`fill: ${fill.rows} rows with a program, ${fill.graded} graded, ${fill.right} graded right; ${fill.kept} templates kept (${fill.fast} compiled, ${fill.sandbox} sandbox), ${fill.duplicate} duplicates of a kept program, refused ${JSON.stringify(fill.refused)}; ${fill.records.size} records covered; why not compiled ${JSON.stringify(fill.fastWhy)}; ${(fillMs / 1000).toFixed(1)} s`);
  say(`fill: the solved table holds ${tc.keys} keys (${tc.text} text, ${tc.form} form) over ${tc.entries} entries; place collisions ${mem.table.stats.placeCollisions}, grows ${mem.table.stats.grows}`);
  const saved = mem.save(S.TEMPLATES_FILE);
  const back = S.SolvedMemory.load(S.TEMPLATES_FILE);
  let backSame = 0;
  const coveredIds = devIds.filter((id) => fill.records.has(id));
  for (const id of coveredIds) {
    const q = PUB.ALONE_PROMPT(byId.get(id).question);
    const a = await mem.answer(q), b = await back.answer(q);
    if (a.hit === b.hit && a.answer === b.answer) backSame++;
  }
  say(`fill: ${saved.templates} templates written to ${S.TEMPLATES_REL} (${fs.statSync(S.TEMPLATES_FILE).size} bytes), read back ${back.size}; the covered records answered the same by the written and the read memory ${backSame}/${coveredIds.length}`);
  const fillSummary = { rows: fill.rows, graded: fill.graded, right: fill.right, kept: fill.kept, fast: fill.fast, sandbox: fill.sandbox, duplicate: fill.duplicate, refused: fill.refused, fastWhy: fill.fastWhy, records: fill.records.size, byJournal: fill.byJournal, ms: fillMs, table: tc, tableStats: { ...mem.table.stats }, file: S.TEMPLATES_REL, fileTemplates: saved.templates, readBack: back.size, readBackSame: backSame, covered: coveredIds.length };
  fs.mkdirSync(VERDICTS, { recursive: true });
  fs.writeFileSync(path.join(VERDICTS, 'ns-fill-partial.json'), JSON.stringify({
    at, command, node: process.version, isTheBar: false, barMet: false, author: AUTHOR,
    split: { development: devIds.length, note: 'the fill only: the bar is bench/verdicts/ns.json' },
    statement: `The fill from the journals: ${fill.kept} templates from ${fill.rows} journal rows that carry a program (${fill.right} graded right), covering ${fill.records.size} GSM8K records; ${fill.fast} compiled, ${fill.sandbox} sandbox.`,
    journals: journals.map((j) => ({ ...j, _j: undefined })), fill: fillSummary, printed: lines.slice(),
  }, null, 2) + '\n');
  say('wrote bench/verdicts/ns-fill-partial.json (the fill, isTheBar false)');

  // the ask path, the model cell offline
  const brain = new Brain({ name: 'ns-bar', ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name: 'ns-bar' });
  const quiet = { provider: 'null', route: 'direct', regions: false, knowledge: false, direct: false, spawn: false };
  await P.ask(brain, 'What is a question that nothing answers?', { ...quiet, solved: false });
  const ctx = { P, brain, quiet, mem, reps, askReps, missAskReps, wikiTitles, passes: BAR.passes, lastNumber: PUB.lastNumber, sameInteger: PUB.sameInteger, ALONE_PROMPT: PUB.ALONE_PROMPT, say, workers };
  const recOf = (id) => ({ id, question: byId.get(id).question, gold: PUB.finalAnswer(byId.get(id)) });

  // the control of every timing: an empty bracket
  const empty = [];
  for (let p = 0; p < BAR.passes; p++) empty.push(dist(timeEmpty(limit * reps)));
  say(`control: two process.hrtime.bigint reads with nothing between, ${empty.map((d, i) => 'pass ' + (i + 1) + ' ' + distLine(d)).join('; ')}`);

  // (3) held out
  const heldPool = gsm.map((r) => r.id).filter((id) => !dev.has(id));
  const drawn = PUB.sampleIds(heldPool, limit, PUB.DEFAULT_SEED);
  const templateRecords = new Set(mem.templates.map((t) => t.source && t.source.record).filter(Boolean));
  const overlapDev = count(drawn, (id) => dev.has(id)), overlapTemplates = count(drawn, (id) => templateRecords.has(id));
  say(`held out: ${drawn.length} drawn by sampleIds at seed ${PUB.DEFAULT_SEED} from the ${heldPool.length} GSM8K test records no journal names and not development (of ${gsm.length}); drawn that are development ${overlapDev}, drawn a template was filled from ${overlapTemplates}`);
  const heldRows = await askSet(ctx, drawn.map(recOf), 'held out');
  const held = summarize(heldRows, BAR.passes, PUB.wilson);
  setLines(say, 'held out', held, pub);

  // (4) the memoisation control
  const devRows = await askSet(ctx, devIds.map(recOf), 'development');
  const devAll = summarize(devRows, BAR.passes, PUB.wilson);
  const devCov = summarize(devRows.filter((x) => fill.records.has(x.id)), BAR.passes, PUB.wilson);
  setLines(say, 'development, every record (the memoisation control)', devAll, pub);
  setLines(say, 'development, the records a template was filled from', devCov, pub);

  // (5) re-numbered
  const firstOf = new Map();
  for (const t of mem.templates) { const id = t.source && t.source.record; if (id && !firstOf.has(id)) firstOf.set(id, t); }
  const ren = { templates: firstOf.size, noBound: 0, unrenderable: 0, asked: 0, hits: 0, own: 0, via: {}, run: {}, missWhy: {}, sandboxChecked: 0, agree: 0, disagree: [], stepNs: [] };
  const renRows = [];
  for (const [id, t] of firstOf) {
    if (t.values.length === t.fixed.length) { ren.noBound++; continue; }
    const vals = t.values.map((x, j) => (t.fixed.includes(j) ? x : 2 * x));
    const q2 = S.renderForm({ parts: t.parts, styles: t.styles }, vals);
    if (q2 === null) { ren.unrenderable++; continue; }
    const prompt = PUB.ALONE_PROMPT(q2);
    ren.asked++;
    let m = mem.match(prompt);
    if (m.pending) m = await mem.resolve(m);
    if (!m.hit) { ren.missWhy[m.why] = (ren.missWhy[m.why] || 0) + 1; continue; }
    ren.hits++;
    if (m.template.id === t.id) ren.own++;
    ren.via[m.via] = (ren.via[m.via] || 0) + 1; ren.run[m.run] = (ren.run[m.run] || 0) + 1;
    const sb = await runProgram(S.programFor(m.template, m.values), { timeoutMs: 2000 });
    ren.sandboxChecked++;
    if (sb.ok && valueKey(sb.value) === m.answer) ren.agree++;
    else ren.disagree.push({ id, template: m.template.id, answer: m.answer, sandbox: sb.ok ? valueKey(sb.value) : sb.error });
    renRows.push({ id, prompt, run: m.run });
  }
  const renStep = [];
  for (let p = 0; p < BAR.passes; p++) {
    const arrs = [];
    for (const r of renRows) arrs.push({ a: (await timeStep(mem, r.prompt, r.run === 'compiled' ? reps : Math.min(reps, 20))).ns, run: r.run });
    renStep.push({ compiled: dist(pool(arrs.filter((x) => x.run === 'compiled'), 'a')), sandbox: dist(pool(arrs.filter((x) => x.run !== 'compiled'), 'a')) });
  }
  say(`re-numbered: the ${ren.templates} covered records' first templates with their bound numbers doubled: ${ren.noBound} bind no number, ${ren.unrenderable} cannot be spelled in their slot style, ${ren.asked} asked; answered ${ren.hits}/${ren.asked} (by the same template ${ren.own}), by key ${JSON.stringify(ren.via)}, by runner ${JSON.stringify(ren.run)}, not answered ${JSON.stringify(ren.missWhy)}; the sandbox run of the same program on the same numbers agrees ${ren.agree}/${ren.sandboxChecked}`);
  for (let p = 0; p < renStep.length; p++) say(`  pass ${p + 1}: compiled ${distLine(renStep[p].compiled)}; sandbox (at most 20 repeats a record) ${distLine(renStep[p].sandbox)}`);

  // (6) the ceiling of an exact slot-form match
  const formOf = new Map(), idsOfForm = new Map();
  for (const r of gsm) { const f = S.abstractNumbers(S.normText(r.question)).form; formOf.set(r.id, f); if (!idsOfForm.has(f)) idsOfForm.set(f, []); idsOfForm.get(f).push(r.id); }
  const repeatedForms = [...idsOfForm.values()].filter((xs) => xs.length > 1).length;
  const templateForms = new Set(mem.templates.map((t) => t.form));
  const templateTexts = new Set(mem.templates.map((t) => t.question));
  const heldShared = count(drawn, (id) => idsOfForm.get(formOf.get(id)).length > 1);
  const heldInForms = count(drawn, (id) => templateForms.has(formOf.get(id)));
  const heldInTexts = count(drawn, (id) => templateTexts.has(S.normText(byId.get(id).question)));
  const ceiling = { records: gsm.length, distinctForms: idsOfForm.size, repeatedForms, heldShared, heldInForms, heldInTexts };
  say(`ceiling: the ${gsm.length} GSM8K test records have ${idsOfForm.size} distinct slot forms, ${repeatedForms} held by more than one record; of the ${drawn.length} held out, ${heldShared} share a slot form with another record, ${heldInForms} with a template, ${heldInTexts} share a template's text`);

  // (7) the wiki direct class
  let wk = null;
  if (wiki) { say('wiki direct class, re-measured:'); wk = await wikiClass(ctx); } else say('wiki direct class: not measured (--no-wiki)');

  // (8) the gap
  const share = held.share;
  const gap = share !== null && share < 1 ? {
    id: GAP_KIND + ':gsm8k-heldout', kind: GAP_KIND, subsystem: 'reason/solved.mjs', measured: share, bar: 1, unit: 'share of ' + held.n + ' held-out GSM8K records answered by the solved region (provenance solved, no model call)',
    distance: r4(1 - share), better: 'higher', verdictFile: 'bench/verdicts/ns.json', benchCommand: 'node bench/ns.mjs',
    trial: {
      kind: 'the loop fill', needsModel: true, command: 'node bench/ns.mjs', env: { BRAIN_SOLVED: '1', BRAIN_SOLVED_LEARN: '1' },
      what: 'every math region answer ask() verifies (provenance model+exact, a majority vote, the checker not rejecting) becomes a template through act/prompt.mjs learnSolved and reason/solved.mjs learnFrom, appended to ' + S.TEMPLATES_REL + '; the next ask of that question, or of the same question with other numbers, is answered by solved; then node bench/ns.mjs measures the share again',
    },
    needsModel: true, files: ['reason/solved.mjs', 'act/prompt.mjs', 'memory/direct.mjs', S.TEMPLATES_REL], since: at, author: AUTHOR,
    why: `solved answered ${held.solved} of ${held.n} held-out GSM8K records; ${ceiling.repeatedForms} of ${ceiling.distinctForms} GSM8K slot forms repeat, so templates filled from other records reach ${ceiling.heldInForms} of them: the share grows only as the loop learns the held-out classes themselves`,
  } : null;
  const gapFile = path.join(ROOT, GAP_REL);
  fs.mkdirSync(path.dirname(gapFile), { recursive: true });
  fs.writeFileSync(gapFile, gap ? JSON.stringify(gap) + '\n' : '');
  say(gap ? `gap: ${GAP_KIND} opened in ${GAP_REL}: measured ${pct(gap.measured)}, distance ${gap.distance} to 100%, trial the loop fill (needsModel true)` : `gap: none (held-out share ${pct(share)})`);

  // the verdict
  const finite = (d) => d && d.n > 0 && Number.isFinite(d.median) && Number.isFinite(d.p99);
  const met = {
    fill: fill.kept > 0 && back.size === saved.templates && backSame === coveredIds.length,
    split: drawn.length === limit && overlapDev === 0 && overlapTemplates === 0,
    heldOut: held.n === limit && held.share !== null && held.step.every(finite) && held.ask.every(finite) && held.fellSameAsOff === held.fellThrough && held.matchAgreesWithAsk === held.n,
    control: devCov.n > 0 && devCov.solved === devCov.n && devCov.correct === devCov.solved && devCov.step.every(finite),
    wiki: !!wk && wk.arms['direct, solved on'].n === BAR.wiki && wk.timing.hitsFound === wk.timing.lookups && Number.isFinite(wk.timing.hitNsMedian),
    gap: share === 1 || !!gap,
  };
  const barMet = Object.values(met).every(Boolean);
  const peak = peakMb();
  say(`BAR: fill ${met.fill ? 'printed' : 'MISSED'}; split ${met.split ? 'disjoint' : 'MISSED'}; held out share ${pct(held.share)} with ns per response and the fall through ${met.heldOut ? 'printed' : 'MISSED'}; memoisation control ${devCov.solved}/${devCov.n} answered, ${devCov.correct} right: ${met.control ? 'behaves' : 'MISSED'}; wiki direct class ${met.wiki ? 'printed' : 'MISSED'}; gap ${met.gap ? (gap ? 'opened' : 'none needed') : 'MISSED'}; ${barMet ? 'BAR MET' : 'BAR NOT MET'}${narrow ? ' (a narrow run: written -partial)' : ''}`);
  say(`peak rss ${peak} MB (this process; the wiki fill workers are threads of it)`);

  const h1 = held.step[0], a1 = held.ask[0], d1 = devCov.step[0], da1 = devCov.ask[0];
  const statement = `The solved region (reason/solved.mjs, in act/prompt.mjs right after direct) was filled from the journals under bench/verdicts: ${fill.kept} templates from ${fill.rows} journal rows that carry a program, covering ${fill.records.size} GSM8K records (${fill.fast} compiled, ${fill.sandbox} sandbox). `
    + `On ${held.n} held-out GSM8K test records no journal names (sampleIds at seed ${PUB.DEFAULT_SEED}), asked through ask() with the model cell offline, solved answered ${held.solved} (${pct(held.share)}); ${held.solved ? `${held.correct} of them right (${pct(held.accuracy)})` : 'so it has no accuracy to set beside'} the published ${pub.system} ${pub.score}; ${held.fellThrough} fell through to the next region, ${held.fellSameAsOff} of them to the same answer the ask path gives with solved off. `
    + `The solved step took a median ${h1.median} ns and a p99 ${h1.p99} ns per response on those records (${reps} repeats each, a miss: what solved adds to an ask it does not answer), a whole ask() (the next region answering, ${missAskReps} repeats) a median ${a1.median} ns; an empty clock bracket reads a median ${empty[0].median} ns. `
    + `The slot forms of the ${gsm.length} GSM8K test records repeat ${repeatedForms} times, and ${heldInForms} held-out records share a template's form: an exact slot-form memory filled from other records cannot answer held-out GSM8K, and the gap "${GAP_KIND}" is opened with the loop's own fill as its trial. `
    + `The memoisation control, the ${devCov.n} development records a template was filled from, was answered by solved ${devCov.solved} times, ${devCov.correct} right, at a median ${d1.median} ns and a p99 ${d1.p99} ns a response (a whole ask() median ${da1.median} ns); the same questions with their numbers doubled were answered ${ren.hits} of ${ren.asked} times, the sandbox agreeing ${ren.agree} of ${ren.sandboxChecked}. `
    + (wk ? `The wiki direct class, re-measured with the solved region on: direct ${wk.arms['direct, solved on'].direct} of ${wk.arms['direct, solved on'].n} (${pct(wk.arms['direct, solved on'].directShare)}), ${wk.arms['direct, solved on'].directCorrect} right, a median ${wk.timing.hitNsMedian} ns a hit over ${wk.timing.lookups} lookups; the control table answered ${wk.arms['control table'].direct} direct.` : 'The wiki direct class was not re-measured in this run.');
  const strip = (s) => ({ ...s });
  const verdict = {
    at, command, node: process.version, isTheBar: !narrow, barMet, met, author: AUTHOR, modelCalls: 0,
    split: {
      development: { what: 'every GSM8K record a journal under bench/verdicts names (its id anywhere in the file), and the records bench/public.mjs gsm8kDevIds names; the templates were filled from these, and they are the memoisation control', journals: journals.filter((j) => j.gsm8kIds > 0).map((j) => j.file), namedByJournals: devJournal.size, publicDev: devPublic.source, records: devIds.length, covered: coveredIds.length },
      heldOut: { what: 'every other GSM8K test record; ' + limit + ' drawn by bench/public.mjs sampleIds at the public bench seed', pool: heldPool.length, drawn: drawn.length, seed: PUB.DEFAULT_SEED, overlapDevelopment: overlapDev, overlapTemplates, ids: drawn },
    },
    statement, code, published: pub, bar: BAR,
    journals: journals.map((j) => ({ ...j, _j: undefined })), fill: fillSummary,
    control: { emptyBracket: empty },
    heldOut: strip(held), development: { all: strip(devAll), covered: strip(devCov) },
    renumbered: { ...ren, step: renStep }, ceiling, wiki: wk, gap,
    rows: { heldOut: heldRows.map((x) => ({ id: x.id, gold: x.gold, provenance: x.provenance, got: x.got, ok: x.ok, why: x.why, sameAsOff: x.sameAsOff })), development: devRows.map((x) => ({ id: x.id, gold: x.gold, provenance: x.provenance, got: x.got, ok: x.ok, via: x.via, run: x.run, why: x.why })) },
    peakRssMb: peak, printed: lines,
  };
  const file = path.join(VERDICTS, narrow ? 'ns-partial.json' : 'ns.json');
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  console.log('wrote ' + rel(file));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
