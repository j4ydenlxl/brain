#!/usr/bin/env node
// bench/recall.mjs. THE RECALL BAR (Board 10, his P4 native share and P10): the knowledge tier on
// the ask path. memory/knowledge.mjs landed on Board 9 and the ask path never called it; act/prompt.mjs
// now tries it after the exact path and before any model cell (notes/recall.md).
//
//   node bench/recall.mjs            the bar: 200 held-out wiki questions + 200 suite questions,
//                                    the ask path with the tier on and off, writes bench/verdicts/recall.json
//   node bench/recall.mjs --tune     chooses the confidence floor on the held-out records OUTSIDE
//                                    the bar's draw (writes bench/verdicts/recall-tune-partial.json)
//   options: --n 200 (wiki questions), --suite 100 (per suite), --store DIR, --floor F (a sweep:
//            writes recall-partial.json), --provider null|ollama, --model qwen3:1.7b,
//            --sample 40 (tune: tuning records the model cell is asked), --timeoutMs 60000
//
// THE TWO SETS.
//   wiki   the held-out rule of notes/knowledge.md: a seeded title mark hid an article's first
//          sentence from the ingest; the draw is bench/knowledge.mjs drawHeldout() with its own
//          DRAW_SEED, so these are the SAME 200 questions the knowledge bar graded. Asked as
//          "What is <title>?", graded on the hidden sentence's head noun (plural folded) found in
//          the answer line (bench/answer.mjs extractAnswer, the ruler every arm is read with). An
//          answer that says nothing in memory matches is an abstention and is graded wrong.
//   suite  bench/answer.mjs buildQuestions(): 100 algebra and 100 sequence questions, graded by
//          bench/answer.mjs gradeAnswer (exact rational comparison).
//
// THE TWO ARMS, interleaved per question (even questions ask tier on first, odd ones tier off
// first), on one bare brain (empty memory, direct route, no spawn):
//   on    ask() as it ships: the knowledge tier opened from --store when its ingest finished
//   off   ask() with knowledge:false: the path as it was before this board
//
// WHAT IS PRINTED, per set and arm: answered NATIVELY (the model cell was never reached: the answer
// is exact or came from memory before any model call), accuracy, mean microseconds of the whole
// ask() call over the native answers, and the model cell calls made. The model cell's provider is
// 'null' unless --provider says otherwise: the offline provider opens no socket and its text is not
// an answer (ask() then answers from memory and says so), so the model's own accuracy is not part
// of this bar and one Ollama queue shared by eight builders is not spent on it. The call is still
// a call: it is counted.
//
// THE BAR: the native share on the wiki questions rises with the tier on, and the suite accuracy
// does not fall.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash32 } from '../core/rng.mjs';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import { answerMatches, keyNounPhrase, normText, tokens } from '../memory/knowledge.mjs';
import { ask, KNOWLEDGE, KNOWLEDGE_DIR, KNOWLEDGE_TIER, knowledgeAnswer, knowledgeReady, knowledgeStore, closeKnowledge } from '../act/prompt.mjs';
import { buildQuestions, extractAnswer, gradeAnswer } from './answer.mjs';
import { DRAW_SEED, drawHeldout } from './knowledge.mjs';

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
// board 23 builder (item contamination-split): contaminated is decided from the run: the leak check's
// count (null when it did not run, never read as clean) and whether a knowledge bar verdict on disk
// grades the same draw seed (priorGrade, read by the caller from bench/verdicts/knowledge.json).
/** What the recall bar developed on and what it graded: pure, from the set sizes, the leak count and the prior grade. */
export function splitFor(opts = {}) {
  const leaks = Number.isInteger(opts.leaks) ? opts.leaks : null;
  const prior = opts.priorGrade && typeof opts.priorGrade === 'object' ? { file: String(opts.priorGrade.file), drawSeed: String(opts.priorGrade.drawSeed) } : null;
  return {
    development: { what: 'the confidence floor chosen by --tune on the held-out records OUTSIDE the bar\'s draw; the bench/answer.mjs algebra and sequence suites' },
    heldOut: { what: 'the wiki questions: bench/knowledge.mjs drawHeldout (its DRAW_SEED), first sentences hidden from the ingest; the suite questions are a no-regression check with no held-out set', wiki: opts.n ?? null, suitePerSuite: opts.perSuite ?? null, drawSeed: opts.drawSeed ?? null, leaks, gradedBefore: prior },
    contaminated: leaks === null
      ? 'the leak check did not run, so the drawn questions are not known to be absent from the store'
      : leaks > 0
        ? leaks + ' hidden sentences of the drawn articles were found in the store the tier reads'
        : prior
          ? 'the wiki draw (seed ' + prior.drawSeed + ') is the one ' + prior.file + ' grades, so its results were on disk while this tier was developed'
          : false,
  };
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VERDICTS = path.join(HERE, 'verdicts');
export const BAR = Object.freeze({ wiki: 200, perSuite: 100 });
export const TUNE_SEED = 'recall-tune-2026-09-23';
export const TUNE_MODEL = 'qwen3:1.7b';

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i === -1 ? def : process.argv[i + 1]; }
const pct = (x) => (100 * x).toFixed(1) + '%';
const r1 = (x) => Math.round(x * 10) / 10;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const nowUs = () => process.hrtime.bigint();
const since = (t0) => Number(process.hrtime.bigint() - t0) / 1e3;
const peakMb = () => r1(process.resourceUsage().maxRSS / 1024);

/** The knowledge bar verdict on disk when it grades the same draw seed (board 23, the split's data), else null. */
function priorGradeOf(seed) {
  try {
    const k = JSON.parse(fs.readFileSync(path.join(VERDICTS, 'knowledge.json'), 'utf8'));
    return k && k.heldout && k.heldout.drawSeed === seed ? { file: 'bench/verdicts/knowledge.json', drawSeed: seed } : null;
  } catch { return null; }
}

// ------------------------------------------------------------------ the grader
const ABSTAIN_RE = /^nothing in memory matches/im;
/**
 * Grade a wiki answer: the gold head noun among the words of the answer line. An abstention is wrong.
 * @param {string} text what ask() answered
 * @param {string} head the hidden sentence's head noun
 * @returns {{ok: boolean, abstained: boolean, line: string}}
 */
export function gradeWiki(text, head) {
  const t = String(text ?? '').trim();
  if (ABSTAIN_RE.test(t)) return { ok: false, abstained: true, line: t };
  const { line } = extractAnswer(t, 'exact');
  return { ok: answerMatches(tokens(line), head), abstained: false, line };
}

/** Whether ask() reached a model cell: every answer that did carries the provider it asked. */
export function modelAsked(a) { return !!(a && a.provenance && a.provenance.llm && a.provenance.llm.provider !== null); }

/** The held-out records outside the bar's draw: where the floor is chosen, never on the draw. */
export function tuningRecords(storeDir, n = BAR.wiki) {
  const lines = fs.readFileSync(path.join(storeDir, 'heldout.jsonl'), 'utf8').split('\n').filter(Boolean);
  const all = lines.map((l) => JSON.parse(l));
  const inDraw = new Set(drawHeldout(storeDir, n).drawn.map((h) => h.title));
  return all.filter((h) => !inDraw.has(h.title));
}

// A hidden sentence in the store would be a leak: the answer read back instead of recalled.
// The ingest drops it (KnowledgeWriter hidden set); this checks every item of the article.
function leaksOf(store, drawn) {
  let leaks = 0;
  for (const h of drawn) {
    const hidden = normText(h.sentence);
    for (const a of store.titleLookup(h.title)) for (const i of store.itemsOf(a)) if (normText(store.text(i)) === hidden) leaks++;
  }
  return leaks;
}

function newBrain(name) {
  const brain = new Brain({ name, ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name });
  return brain;
}

// ------------------------------------------------------------------ one arm over one set
function summarize(rows) {
  const n = rows.length || 1;
  const native = rows.filter((x) => x.native);
  const us = native.map((x) => x.us).sort((a, b) => a - b);
  return {
    n: rows.length,
    native: native.length, nativeShare: r4(native.length / n),
    correct: rows.filter((x) => x.ok).length, accuracy: r4(rows.filter((x) => x.ok).length / n),
    nativeCorrect: native.filter((x) => x.ok).length,
    nativeMeanUs: us.length ? r1(us.reduce((s, x) => s + x, 0) / us.length) : null,
    nativeP50Us: us.length ? r1(us[Math.floor(0.5 * (us.length - 1))]) : null,
    nativeP95Us: us.length ? r1(us[Math.floor(0.95 * (us.length - 1))]) : null,
    modelCalls: rows.filter((x) => x.modelCall).length,
    abstained: rows.filter((x) => x.abstained).length,
    byProvenance: rows.reduce((m, x) => { m[x.provenance] = (m[x.provenance] || 0) + 1; return m; }, {}),
    byRoute: rows.reduce((m, x) => { m[x.route] = (m[x.route] || 0) + 1; return m; }, {}),
  };
}

// ------------------------------------------------------------------ the bar
async function bar(cfg) {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  say(`recall bar: ${cfg.command}`);
  const ready = knowledgeReady(cfg.store);
  say(`store ${path.relative(path.join(HERE, '..'), cfg.store)}: ${ready.ok ? 'a finished ingest' : 'NOT READY, ' + ready.reason}`);
  if (!ready.ok) { process.exitCode = 1; return; }

  const { pool, drawn } = drawHeldout(cfg.store, cfg.n);
  const wiki = drawn.map((h, i) => ({ id: 'wiki.' + i, set: 'wiki', q: 'What is ' + h.title + '?', title: h.title, head: h.head, gold: h.np }));
  const suiteAll = buildQuestions({ tasksPerSuite: cfg.perSuite });
  const suite = suiteAll.filter((q) => q.source === 'algebra' || q.source === 'sequence').map((q) => ({ ...q, set: 'suite' }));
  const counts = suite.reduce((m, q) => { m[q.source] = (m[q.source] || 0) + 1; return m; }, {});
  say(`wiki: ${wiki.length} of ${pool} held-out questions drawn by seed ${DRAW_SEED} (the knowledge bar's draw); suite: ${suite.length} (algebra ${counts.algebra || 0}, sequence ${counts.sequence || 0}) from bench/answer.mjs buildQuestions`);
  say(`floor ${cfg.floor ?? KNOWLEDGE.floor}${cfg.floor === null ? ' (KNOWLEDGE.floor as shipped)' : ' (a sweep, not the shipped floor)'}, model cell provider ${cfg.provider}${cfg.provider === 'ollama' ? ' model ' + cfg.model : ' (offline: no socket, calls counted)'}`);

  const brain = newBrain('recall-bench');
  const base = { provider: cfg.provider, model: cfg.model, timeoutMs: cfg.timeoutMs, route: 'direct', spawn: false, knowledge: cfg.store };
  if (cfg.floor !== null) base.knowledgeFloor = cfg.floor;
  const optsOf = (on) => (on ? base : { ...base, knowledge: false });

  // Warm-up, not counted: the first definitional question opens the store and pays for the JIT.
  const opens0 = KNOWLEDGE_TIER.opens;
  const tw = nowUs();
  await ask(brain, 'What is a question that no article answers?', optsOf(true));
  const warmUs = since(tw);
  await ask(brain, 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: 2 + 3', optsOf(false));
  say(`warm-up (not counted): store opened ${KNOWLEDGE_TIER.opens - opens0} time(s), first definitional ask ${r1(warmUs)} us`);
  const store = knowledgeStore(cfg.store);
  const leaks = leaksOf(store, drawn);
  say(`leak check: ${leaks} hidden sentences of the ${drawn.length} drawn articles found in the store`);

  const tier0 = { ...KNOWLEDGE_TIER };
  const rows = { wiki: { on: [], off: [] }, suite: { on: [], off: [] } };
  const items = [];
  for (let i = 0; i < Math.max(wiki.length, suite.length); i++) { if (i < wiki.length) items.push(wiki[i]); if (i < suite.length) items.push(suite[i]); }
  const t0 = Date.now();
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    for (const on of (i % 2 === 0 ? [true, false] : [false, true])) {
      const ts = nowUs();
      const a = await ask(brain, it.q, optsOf(on));
      const us = since(ts);
      const g = it.set === 'wiki' ? gradeWiki(a.text, it.head) : { ...gradeAnswer(a.text, it), abstained: false };
      rows[it.set][on ? 'on' : 'off'].push({
        id: it.id, native: !modelAsked(a), modelCall: modelAsked(a), ok: g.ok, abstained: !!g.abstained, us,
        provenance: a.provenance.answer, route: a.route, title: a.provenance.title ?? null,
        answer: a.knowledge ? a.knowledge.answer : null, confidence: a.provenance.knowledge ? a.provenance.knowledge.confidence : null,
      });
    }
  }
  const runMs = Date.now() - t0;
  const tier = Object.fromEntries(Object.keys(KNOWLEDGE_TIER).map((k) => [k, KNOWLEDGE_TIER[k] - tier0[k]]));

  const S = { wiki: { on: summarize(rows.wiki.on), off: summarize(rows.wiki.off) }, suite: { on: summarize(rows.suite.on), off: summarize(rows.suite.off) } };
  for (const set of ['wiki', 'suite']) {
    for (const arm of ['on', 'off']) {
      const s = S[set][arm];
      say(`${set.padEnd(5)} tier ${arm.padEnd(3)}: native ${s.native}/${s.n} (${pct(s.nativeShare)}), accuracy ${s.correct}/${s.n} (${pct(s.accuracy)}), native correct ${s.nativeCorrect}/${s.native}, native mean ${s.nativeMeanUs === null ? 'n/a (none native)' : s.nativeMeanUs + ' us (p50 ' + s.nativeP50Us + ', p95 ' + s.nativeP95Us + ')'}, model calls ${s.modelCalls}${set === 'wiki' ? ', abstained ' + s.abstained : ''}, provenance ${JSON.stringify(s.byProvenance)}`);
    }
  }
  const wikiOnAbove = rows.wiki.on.filter((x) => x.route === 'knowledge');
  const wikiOnBelow = rows.wiki.on.filter((x) => x.route !== 'knowledge');
  say(`knowledge tier during the run: asked ${tier.asked}, answered at or above the floor ${tier.answered}, below ${tier.below}, opens ${tier.opens}`);
  say(`wiki with the tier on: ${wikiOnAbove.length} answered by the tier (${wikiOnAbove.filter((x) => x.ok).length} correct), ${wikiOnBelow.length} fell through to the model cell`);
  say(`run: ${items.length} questions x 2 arms in ${(runMs / 1000).toFixed(1)} s; peak rss ${peakMb()} MB`);

  const checks = {
    drewWiki: wiki.length >= BAR.wiki,
    drewSuite: suite.length >= 2 * BAR.perSuite,
    wikiNativeRises: S.wiki.on.nativeShare > S.wiki.off.nativeShare,
    suiteAccuracyHolds: S.suite.on.correct >= S.suite.off.correct,
    noLeaks: leaks === 0,
  };
  const full = cfg.n >= BAR.wiki && cfg.perSuite >= BAR.perSuite && cfg.floor === null && cfg.provider === 'null' && checks.drewWiki && checks.drewSuite;
  const barMet = checks.wikiNativeRises && checks.suiteAccuracyHolds && checks.noLeaks && checks.drewWiki && checks.drewSuite;
  say(`checks: ${Object.entries(checks).map(([k, v]) => k + ' ' + (v ? 'yes' : 'NO')).join(', ')}`);
  say(`bar ${barMet ? 'MET' : 'NOT MET'}${full ? '' : ' (a narrow run: written as recall-partial.json)'}`);

  const w = S.wiki, s = S.suite;
  const statement = `On ${wiki.length} held-out Simple English Wikipedia questions (the knowledge bar's own draw, first sentences hidden from the ingest) and ${suite.length} algebra and sequence questions, the ask path of act/prompt.mjs was run on one bare brain with the knowledge tier on and off, interleaved per question, the model cell on provider ${cfg.provider}. With the tier on, ${w.on.native} of ${w.on.n} wiki questions (${pct(w.on.nativeShare)}) were answered natively, without reaching a model cell, against ${w.off.native} (${pct(w.off.nativeShare)}) with it off; wiki accuracy was ${pct(w.on.accuracy)} on and ${pct(w.off.accuracy)} off, the native answers took a mean ${w.on.nativeMeanUs === null ? 'n/a' : w.on.nativeMeanUs} microseconds, and the model cell was called ${w.on.modelCalls} times on and ${w.off.modelCalls} off. On the suite the tier changed nothing it could: accuracy ${pct(s.on.accuracy)} on and ${pct(s.off.accuracy)} off, ${s.on.native} and ${s.off.native} native, ${s.on.modelCalls} and ${s.off.modelCalls} model calls. The confidence floor was ${cfg.floor ?? KNOWLEDGE.floor}, chosen on the ${pool - wiki.length} held-out records outside this draw. ${leaks} hidden sentences were found in the store. The bar ${barMet ? 'is met' : 'is not met'}.`;
  const verdict = {
    at, command: cfg.command, node: process.version, isTheBar: full, barMet, contaminated: null, statement,
    split: splitFor({ n: cfg.n, perSuite: cfg.perSuite, drawSeed: DRAW_SEED, leaks, priorGrade: priorGradeOf(DRAW_SEED) }),
    bar: 'the native share on the wiki questions rises with the tier on, and the suite accuracy does not fall',
    checks,
    config: { n: cfg.n, perSuite: cfg.perSuite, store: path.relative(path.join(HERE, '..'), cfg.store), floor: cfg.floor ?? KNOWLEDGE.floor, floorShipped: KNOWLEDGE.floor, pool: KNOWLEDGE.pool, provider: cfg.provider, model: cfg.provider === 'ollama' ? cfg.model : null, drawSeed: DRAW_SEED, route: 'direct', interleaved: 'even questions tier on first, odd questions tier off first' },
    definitions: {
      native: 'the model cell was never reached: provenance.llm.provider is null (an exact answer, or the knowledge tier at or above its floor)',
      accuracyWiki: 'the hidden first sentence head noun (plural folded) among the words of the answer line read by bench/answer.mjs extractAnswer; an answer beginning "nothing in memory matches" is an abstention and wrong',
      accuracySuite: 'bench/answer.mjs gradeAnswer, exact rational comparison',
      nativeMeanUs: 'mean wall time of the whole ask() call, in microseconds, over the native answers',
      modelCalls: 'answers whose provenance.llm.provider is not null: askModel was called',
    },
    wiki: S.wiki, suite: S.suite,
    knowledgeTier: tier,
    warmUpUs: r1(warmUs), leaks, runSeconds: r1(runMs / 1000), peakRssMb: peakMb(),
    heldoutPool: pool,
    printed: lines,
  };
  // board 23 builder (item contamination-split, fix pass): the gate counts contaminated only when it is
  // true, so a reason in the split is marked at the top level and said in the statement
  verdict.contaminated = typeof verdict.split.contaminated === 'string';
  if (verdict.contaminated) verdict.statement += ' Contaminated: ' + verdict.split.contaminated + '.';
  say(`split: contaminated ${verdict.contaminated ? verdict.split.contaminated : 'false'}`);
  fs.mkdirSync(VERDICTS, { recursive: true });
  const file = path.join(VERDICTS, full ? 'recall.json' : 'recall-partial.json');
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  console.log(`wrote ${path.relative(path.join(HERE, '..'), file)}`);
  closeKnowledge();
}

// ------------------------------------------------------------------ the floor
/**
 * The expected number right at each floor on the tuning records: the tier's correct answers at
 * or above the floor, plus the model cell's accuracy times the questions that fall below it.
 * @param {Array<{confidence: number, ok: boolean, answered: boolean}>} rows
 * @param {number} pModel
 * @returns {Array<{floor, answered, correct, precision, below, expected}>}
 */
export function floorTable(rows, pModel) {
  const out = [];
  for (let k = 0; k <= 100; k++) {
    const f = k / 100;
    const above = rows.filter((x) => x.answered && x.confidence >= f);
    const correct = above.filter((x) => x.ok).length;
    const below = rows.length - above.length;
    out.push({ floor: f, answered: above.length, correct, precision: above.length ? r4(correct / above.length) : null, below, expected: r4(correct + pModel * below) });
  }
  return out;
}
/** The floor with the most expected right; ties go to the lowest floor (more native answers). */
export function chooseFloor(table) {
  let best = table[0];
  for (const r of table) if (r.expected > best.expected + 1e-9) best = r;
  return best;
}

/** How the model cell's prose is read: strict is the key noun phrase of its first sentence (the tier's ruler), loose is the head anywhere. */
export function gradeModel(text, title, head) {
  const t = String(text ?? '').replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  const first = (t.split(/(?<=[.!?])\s+|\n+/).find((s) => s.trim().length) || '').trim();
  const kp = keyNounPhrase(first, title);
  return { strict: !!(kp && answerMatches(kp.words, head)), loose: answerMatches(tokens(t), head) };
}

async function tune(cfg) {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  say(`recall floor tune: ${cfg.command}`);
  const ready = knowledgeReady(cfg.store);
  if (!ready.ok) { say('store not ready: ' + ready.reason); process.exitCode = 1; return; }
  const recs = tuningRecords(cfg.store, cfg.n);
  say(`tuning records: ${recs.length} held-out records outside the bar's draw of ${cfg.n} (seed ${DRAW_SEED})`);
  const rows = recs.map((h) => {
    const k = knowledgeAnswer('What is ' + h.title + '?', { knowledge: cfg.store, knowledgeFloor: 0 });
    return { title: h.title, head: h.head, answered: !!(k && k.answer), confidence: k ? k.confidence : 0, ok: !!(k && k.answer && answerMatches(k.words, h.head)) };
  });
  say(`the tier answers ${rows.filter((x) => x.answered).length} of ${rows.length}, ${rows.filter((x) => x.ok).length} correct at floor 0`);

  // The model cell alone on a seeded sample of the tuning records: ask() with the tier off.
  const sample = recs.map((h) => [hash32(TUNE_SEED + '\u0000' + h.title), h]).sort((a, b) => a[0] - b[0] || (a[1].title < b[1].title ? -1 : 1)).slice(0, cfg.sample).map((x) => x[1]);
  const brain = newBrain('recall-tune');
  let strict = 0, loose = 0, asked = 0, failed = 0, msSum = 0;
  const modelRows = [];
  for (const h of sample) {
    const a = await ask(brain, 'What is ' + h.title + '?', { provider: 'ollama', model: cfg.model, timeoutMs: cfg.timeoutMs, probeMs: 2000, route: 'direct', spawn: false, knowledge: false });
    const l = a.provenance.llm;
    if (l.provider !== 'ollama' || !l.ok) { failed++; modelRows.push({ title: h.title, failed: l.reason }); continue; }
    asked++; msSum += l.ms;
    const g = gradeModel(a.text, h.title, h.head);
    if (g.strict) strict++; if (g.loose) loose++;
    modelRows.push({ title: h.title, head: h.head, strict: g.strict, loose: g.loose, ms: l.ms, text: a.text.replace(/\s+/g, ' ').slice(0, 160) });
  }
  if (!asked) { say(`the model cell answered none of ${sample.length} (${failed} failed: ${modelRows[0] && modelRows[0].failed}); no floor is chosen without it`); process.exitCode = 1; return; }
  const pStrict = strict / asked, pLoose = loose / asked;
  say(`model cell ${cfg.model} alone on ${asked} of ${sample.length} sampled tuning records (${failed} failed): strict ${strict}/${asked} (${pct(pStrict)}), loose ${loose}/${asked} (${pct(pLoose)}), mean ${(msSum / asked).toFixed(0)} ms per call`);
  say(`the floor is chosen against the LOOSE reading, the one most generous to the model: the tier answers alone only where it is expected to beat the model at its best`);
  const table = floorTable(rows, pLoose);
  const best = chooseFloor(table);
  for (const r of table.filter((x) => Math.round(x.floor * 100) % 5 === 0 || x.floor === best.floor)) {
    say(`floor ${r.floor.toFixed(2)}: tier answers ${r.answered} (${r.correct} correct, precision ${r.precision === null ? 'n/a' : pct(r.precision)}), ${r.below} to the model, expected right ${r.expected.toFixed(1)}${r.floor === best.floor ? '   <- chosen' : ''}`);
  }
  const strictBest = chooseFloor(floorTable(rows, pStrict));
  say(`chosen floor ${best.floor.toFixed(2)} (against the strict reading it would be ${strictBest.floor.toFixed(2)}); act/prompt.mjs ships KNOWLEDGE.floor ${KNOWLEDGE.floor}${KNOWLEDGE.floor === best.floor ? ' (the same)' : ' (DIFFERENT: update it)'}`);
  say(`peak rss ${peakMb()} MB`);
  const verdict = {
    at, command: cfg.command, node: process.version, isTheBar: false,
    statement: `On the ${rows.length} held-out records outside the recall bar's draw, the knowledge tier answered ${rows.filter((x) => x.answered).length} and was right on ${rows.filter((x) => x.ok).length} at floor 0. The model cell ${cfg.model} alone, asked ${asked} of them sampled by seed, was right on ${loose} when the head noun anywhere in its answer counts and ${strict} when only its first sentence's key noun phrase counts. Choosing the floor that maximises the expected number right (the tier's correct answers at or above it plus the model's loose accuracy times the questions below it) gives ${best.floor.toFixed(2)}: the tier answers ${best.answered} of ${rows.length} there at precision ${best.precision === null ? 'n/a' : pct(best.precision)}. This is not the bar; it is where the bar's floor comes from.`,
    chosenFloor: best.floor, strictFloor: strictBest.floor, shippedFloor: KNOWLEDGE.floor,
    model: { name: cfg.model, sample: sample.length, asked, failed, strict, loose, pStrict: r4(pStrict), pLoose: r4(pLoose), meanMs: r1(msSum / asked), seed: TUNE_SEED, rows: modelRows },
    tuning: { records: rows.length, answered: rows.filter((x) => x.answered).length, correct: rows.filter((x) => x.ok).length },
    table, printed: lines, peakRssMb: peakMb(),
  };
  fs.mkdirSync(VERDICTS, { recursive: true });
  const file = path.join(VERDICTS, 'recall-tune-partial.json');
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  console.log(`wrote ${path.relative(path.join(HERE, '..'), file)}`);
  closeKnowledge();
}

// ------------------------------------------------------------------------ main
async function main() {
  const floorArg = arg('floor', null);
  const cfg = {
    command: 'node bench/recall.mjs' + process.argv.slice(2).map((a) => ' ' + a).join(''),
    store: path.resolve(arg('store', KNOWLEDGE_DIR)),
    n: Number(arg('n', BAR.wiki)),
    perSuite: Number(arg('suite', BAR.perSuite)),
    floor: floorArg === null ? null : Number(floorArg),
    provider: String(arg('provider', 'null')),
    model: String(arg('model', TUNE_MODEL)),
    sample: Number(arg('sample', 40)),
    timeoutMs: Number(arg('timeoutMs', 60000)),
  };
  if (process.argv.includes('--tune')) await tune(cfg);
  else await bar(cfg);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((err) => { console.error(err && err.stack || err); process.exitCode = 1; });
