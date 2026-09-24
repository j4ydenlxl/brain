// bench/answer.mjs: THE ANSWER BENCH. The organism against a model, on questions whose
// answers were known before the run started.
//
// Three arms, and the whole point is the third one:
//
//   organism  the ask path of act/prompt.mjs with provider 'ollama': act/solve.mjs first,
//             then the retrieval, then the model with that retrieval as its system block.
//             So this arm is what the organism COMPUTES, plus what it holds, plus the model.
//   alone     act/llm.mjs complete() with the same model, the same question, and no
//             organism context at all. This is the model by itself.
//   null      ask() with provider 'null': no socket is opened, and the answer is whatever
//             act/solve.mjs computes, else whatever the organism's own memory returns. This
//             is the control that says what the organism does with no AI at all.
//
// PROVENANCE IS COUNTED, for the two arms that have one. Every answer of the organism arm
// and of the null arm is 'exact' (solve computed it), 'memory' (the retrieval answered) or
// 'model' (the llm answered), and the counts are printed and written to the verdict. An arm
// that scores well is then readable as WHY it scored well, which an accuracy alone is not.
//
// INTERLEAVED QUESTION BY QUESTION, never arm by arm: all three arms answer question i
// before any arm sees question i+1, and the order of the three rotates with i. A machine
// that gets busy halfway through moves every arm, not the one that happened to run then.
//
// THE QUESTIONS. Exact graded items sampled from the three answer suites of
// tasks/index.mjs (algebra, sequence, grid), whose expected answers come from
// tasks/exact.mjs and were never produced by anything in core/, plus the forty items in
// bench/fixtures/answer-questions.json. The fixture text is appended to the organism's
// episodic memory before the run, so the null arm has something to retrieve; the suite
// questions are NOT in memory, which is why the verdict reports every arm by source. An
// arm that scores on the fixture and not on the suites was retrieving, not answering.
//
// GRADED EXACTLY, BY ONE RULER FOR ALL THREE ARMS. One extractor reads a candidate out of
// whatever the arm wrote (the last boxed value, else the last line that is not a
// delimiter), and one comparison decides: 'number' parses both sides as exact rationals
// through tasks/exact.mjs, so 7/8 and 0.875 are the same answer and 0.30000000000000004
// is not 0.3; 'exact' compares character for character. Case is part of 'exact' because
// one fixture item asks for upper case, so a second, looser count is reported beside the
// first rather than that choice being made silently.
//
// IF OLLAMA IS DOWN the two model arms are recorded absent with the reason, and their
// correct and accuracy are null. Zero would say the model answered and got everything
// wrong, which is a different measurement.
//
// --arms RUNS A SUBSET OF THE THREE. `--arms null` is the control on its own: it opens no
// socket, needs no model, and finishes in seconds, which is what makes the same measurement
// affordable immediately before and immediately after a change to the retrieval. A subset
// run is not the bench, so it does not overwrite the three arm verdict: it MERGES one named
// slot into the same file, <arms>Before the first time (the baseline, pinned once) and
// <arms>After on every run after it. Each slot carries the command that printed it, the
// question count it was measured on, and a digest of act/prompt.mjs, so two slots are
// readably two different pieces of code rather than two runs of one.
//
// --route CHOOSES HOW THE ORGANISM IS ASKED, and it is the one flag that changes the path
// rather than the questions: 'direct' is act/prompt.mjs answering in one call, 'region' is
// act/region.mjs, where the question is injected at ask.in and crosses five cells over seven
// conduits with the model as one of those cells. It applies to the two arms that go through
// ask() (organism and null); the alone arm is act/llm.mjs complete() and has no route at all.
// Absent, the route is whatever ask() picks for the brain, which for this bench's own brain
// is direct until a run asks for a region.
//
// --nowrite MEASURES WITHOUT TOUCHING A VERDICT FILE. run({ write: false }) is the same
// thing for a caller in process. Without it, a full three arm run REPLACES
// bench/verdicts/answer.json (carrying any --arms slots forward) and an --arms subset run
// MERGES one named slot into that same file.
//
//   node bench/answer.mjs [--model qwen3:1.7b] [--tasks 3] [--limit N] [--base url]
//                         [--arms null] [--route region|direct] [--seed s] [--timeoutMs ms]
//                         [--nowrite] [--quiet] [--json]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { bundle, hvFromSeed } from '../core/signal.mjs';
import { attachMemory } from '../memory/index.mjs';
import { ask, keywords, ROUTES } from '../act/prompt.mjs';
import { complete, probeOllama, OLLAMA_BASE } from '../act/llm.mjs';
import { generateAlgebra, generateSequences, generateGrids, exact as E } from '../tasks/index.mjs';
import { G } from '../cells/grid.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, 'fixtures', 'answer-questions.json');

/** The three arms, in declaration order. The run order rotates; this list does not. */
export const ARMS = Object.freeze(['organism', 'alone', 'null']);
/** The provenances act/prompt.mjs can stamp on an answer, printed in this order. */
export const PROVENANCE_ORDER = Object.freeze(['exact', 'memory', 'model']);
export const DEFAULT_MODEL = 'qwen3:1.7b';

/**
 * The arms this run measures. Unknown names are an error rather than a silent full run,
 * because a typo that quietly ran all three would cost the model arms' minutes and would
 * put a model's numbers in a slot that says it holds a control.
 * @param {string|string[]|null} spec 'null', 'organism,null', or nothing for all three
 * @returns {string[]} in ARMS order
 */
export function selectArms(spec) {
  if (spec === undefined || spec === null || spec === true || spec === '') return [...ARMS];
  const want = (Array.isArray(spec) ? spec : String(spec).split(',')).map((s) => String(s).trim()).filter(Boolean);
  const bad = want.filter((a) => !ARMS.includes(a));
  if (bad.length) throw new Error('--arms takes ' + ARMS.join(', ') + ' (comma separated); got ' + bad.join(', '));
  const out = ARMS.filter((a) => want.includes(a));
  if (!out.length) throw new Error('--arms selected no arm');
  return out;
}

/** sha256:16 of a file, or null when it cannot be read. The slots use it to tell code apart. */
function fileDigest(file) {
  try { return createHash('sha256').update(readFileSync(file)).digest('hex').slice(0, 16); }
  catch { return null; }
}

// ---------------------------------------------------------------- the interleaving
/**
 * The arm order for each of n questions: every question gets all three arms, and the
 * first arm rotates, so no arm is always the one measured on a warm machine or a cold one.
 * @param {number} n
 * @returns {string[][]} one array of three arm names per question
 */
export function planArms(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = ((i % ARMS.length) + ARMS.length) % ARMS.length;
    out.push([...ARMS.slice(k), ...ARMS.slice(0, k)]);
  }
  return out;
}

// ---------------------------------------------------------------- reading an answer out
// Latex the model writes is unwrapped rather than deleted: a boxed 391 IS the answer, and
// a frac 7 over 8 is a value this file can compare. Every other backslash command is
// dropped, because it is typography and not an answer.
function cleanText(s) {
  let t = String(s ?? '').replace(/\r/g, '');
  t = t.replace(/<think>[\s\S]*?<\/think>/gi, ' ');
  // A fraction of two plain numbers becomes 7/8, which tasks/exact.mjs parses. Anything
  // else keeps its brackets, because (a + b)/(c) is not the same value as a + b/c.
  const plain = (x) => /^\s*-?\d+(?:\.\d+)?\s*$/.test(x);
  t = t.replace(/\\d?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, a, b) => (plain(a) && plain(b) ? a.trim() + '/' + b.trim() : '(' + a + ')/(' + b + ')'));
  t = t.replace(/\\(?:text|mathrm|mathbf|operatorname)\s*\{([^{}]*)\}/g, '$1');
  t = t.replace(/\\times/g, '*').replace(/\\cdot/g, '*').replace(/\\div/g, '/');
  t = t.replace(/\\[a-zA-Z]+\s*/g, ' ').replace(/[\\$`*_#{}]/g, '');
  return t;
}

const DELIMITER_ONLY = /^[\s\-=_.:|)(\[\]{}]*$/;

function lastMeaningfulLine(t) {
  const lines = t.split('\n').map((l) => l.trim()).filter((l) => l && !DELIMITER_ONLY.test(l));
  return lines.length ? lines[lines.length - 1] : '';
}

function stripEdges(s) {
  return String(s).trim()
    .replace(/^["'“‘([]+/, '')
    .replace(/["'”’)\]]+$/, '')
    .replace(/[.,;!]+$/, '')
    .trim();
}

const NUMBER_RE = /-?\d+(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?/g;
const stripThousands = (s) => s.replace(/(\d),(?=\d{3}(\D|$))/g, '$1');

/**
 * The one candidate every arm is graded on.
 * @param {string} text what the arm wrote
 * @param {string} grade 'exact' or 'number'
 * @returns {{candidate: string, tail: string, line: string}}
 */
export function extractAnswer(text, grade = 'exact') {
  const cleaned = cleanText(text);
  // One level of nesting, so \boxed{\frac{7}{8}} is read as a value and not as its last digit.
  const boxed = [...String(text ?? '').matchAll(/\\boxed\s*\{((?:[^{}]|\{[^{}]*\})*)\}/g)];
  let line = boxed.length ? cleanText(boxed[boxed.length - 1][1]).trim() : lastMeaningfulLine(cleaned);
  if (/answer|result|total/i.test(line) && line.includes(':')) line = line.slice(line.lastIndexOf(':') + 1);
  line = stripEdges(line);
  if (grade === 'number') {
    const hay = stripThousands(line);
    let hits = hay.match(NUMBER_RE);
    if (!hits || !hits.length) hits = stripThousands(cleaned).match(NUMBER_RE);
    const candidate = hits && hits.length ? hits[hits.length - 1].replace(/\s+/g, '') : '';
    return { candidate, tail: candidate, line };
  }
  const parts = line.split(/\s+/);
  return { candidate: line, tail: stripEdges(parts[parts.length - 1] || ''), line };
}

function sameNumber(a, b) {
  try { return E.qEq(E.qFromString(a), E.qFromString(b)); } catch { return false; }
}

// The generous edge of the same question. `ok` reads ONE candidate, which is the ruler the
// winner is decided on; `anywhere` asks only whether the right answer is somewhere in what
// the arm wrote. Both edges are reported because they disagree: the null arm answers with a
// list of cited episodes, so a ruler that reads the last line of that list can score zero on
// a question the organism did hold. Applied identically to all three arms.
function anywhereMatch(text, want, grade) {
  const cleaned = cleanText(text);
  if (grade === 'number') {
    const hits = stripThousands(cleaned).match(NUMBER_RE) || [];
    return hits.some((h) => sameNumber(h.replace(/\s+/g, ''), want));
  }
  for (const raw of cleaned.split('\n')) {
    const line = stripEdges(raw);
    if (line === want) return true;
    if (line.split(/\s+/).some((tok) => stripEdges(tok) === want)) return true;
  }
  return false;
}

/**
 * Grade one answer against one expected answer. Exact means exact.
 * @param {string} text what the arm wrote
 * @param {{a: string, grade: string}} item the question, with the answer known in advance
 * @returns {{ok: boolean, loose: boolean, anywhere: boolean, candidate: string}}
 */
export function gradeAnswer(text, item) {
  const grade = item.grade === 'number' ? 'number' : 'exact';
  const { candidate, tail } = extractAnswer(text, grade);
  const want = String(item.a);
  const anywhere = anywhereMatch(text, want, grade);
  if (grade === 'number') {
    const ok = candidate !== '' && sameNumber(candidate, want);
    return { ok, loose: ok, anywhere: ok || anywhere, candidate };
  }
  const ok = candidate === want || tail === want;
  const lw = want.toLowerCase();
  const loose = ok || candidate.toLowerCase() === lw || tail.toLowerCase() === lw;
  return { ok, loose, anywhere: ok || anywhere, candidate };
}

// ---------------------------------------------------------------- the questions
// A stride sample, not the first N: the suites emit their families in blocks, so the first
// five algebra items are five decimal comparisons and nothing else.
export function stride(list, n) {
  if (!(n > 0) || !list.length) return [];
  if (n >= list.length) return [...list];
  return Array.from({ length: n }, (_, i) => list[Math.floor(i * list.length / n)]);
}

function algebraQuestion(p) {
  if (p.kind === 'decimal.compare') {
    return 'Compare two numbers. Answer -1 if the first is smaller, 0 if they are equal, 1 if the first is larger. '
      + 'First ' + p.a + ', second ' + p.b + '. Answer with -1, 0 or 1 only.';
  }
  if (p.kind === 'linear.solve') return 'Solve for x, exactly. Answer with the value only, as an integer or a fraction: ' + p.prompt;
  return 'Compute this exactly. Answer with the value only, as an integer, a decimal or a fraction: ' + p.prompt;
}

function gridQuestion(t) {
  const line = (g) => G.toString(g).replace(/\n/g, '|');
  const demos = t.demos.map((d) => line(d.input) + ' -> ' + line(d.output)).join('\n');
  return 'Each line below is an input grid and its output grid, rows separated by | and every cell a single digit. '
    + 'One transformation makes every output from its input.\n' + demos
    + '\nApply that same transformation to this input: ' + line(t.test.input)
    + '\nAnswer with the output grid only, rows separated by |.';
}

/**
 * Every question of the run, with the sources round robin so no source is measured only at
 * the start of the run or only at the end.
 * @param {object} [opts] { tasksPerSuite, limit, seed }
 * @returns {object[]} each { id, source, family, q, a, grade }
 */
export function buildQuestions({ tasksPerSuite = 3, limit = 0, seed = null } = {}) {
  const fix = JSON.parse(readFileSync(FIXTURE, 'utf8'));
  let fixture = fix.items.map((it, i) => ({ id: 'fixture.' + i, source: 'fixture', family: it.family, q: it.q, a: String(it.a), grade: it.grade }));
  if (limit > 0) fixture = fixture.slice(0, limit);
  const algebra = stride(generateAlgebra(seed ? { seed: 'algebra/' + seed } : {}), tasksPerSuite)
    .map((p) => ({ id: p.id, source: 'algebra', family: p.kind, q: algebraQuestion(p), a: p.expected, grade: 'number' }));
  const sequence = stride(generateSequences(seed ? { seed: 'sequence/' + seed } : {}), tasksPerSuite)
    .map((p) => ({
      id: p.id, source: 'sequence', family: p.kind, a: p.expected, grade: 'number',
      q: 'Here are the first terms of an exact sequence: ' + p.terms.join(', ') + '. What is the next term? Answer with the value only.',
    }));
  const grid = stride(generateGrids(seed ? { seed: 'grid/' + seed } : {}), tasksPerSuite)
    .map((t) => ({ id: t.id, source: 'grid', family: 'depth' + t.length, q: gridQuestion(t), a: G.toString(t.test.output).replace(/\n/g, '|'), grade: 'exact' }));
  const lists = [fixture, algebra, sequence, grid].filter((l) => l.length);
  const total = lists.reduce((a, l) => a + l.length, 0);
  const out = [];
  for (let i = 0; out.length < total; i++) {
    for (const l of lists) if (i < l.length) out.push(l[i]);
  }
  return out;
}

// ---------------------------------------------------------------- the organism
// One brain, holding the fixture questions and their answers as episodes. The suite
// questions are deliberately not put here: that difference is what bySource measures.
export function buildBrain(questions, { name = 'answer-bench' } = {}) {
  const brain = new Brain({ name, ledger: 'full', pruneEvery: 0 });
  attachMemory(brain, { name });
  let t = 1;
  for (const q of questions) {
    if (q.source !== 'fixture') continue;
    // Joined with an arrow, not with the word "answer": every question already ends in
    // "Answer with the number only", and adding one more copy of that word to every
    // episode would hand the keyword recall one term that matches all forty of them.
    const text = q.q + ' => ' + q.a;
    const items = keywords(text, { max: 24 });
    brain.memory.episodic.append({
      key: items.length ? bundle(items.map((w) => hvFromSeed('word:' + w))) : hvFromSeed('q:' + text),
      value: { text, origin: 'self' }, items, t: t++,
    });
  }
  return brain;
}

// ---------------------------------------------------------------- statistics
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const r2 = (x) => Math.round(x * 100) / 100;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/** Wilson 95% interval for correct of n. Returned with its width, which is one edge. */
export function wilson(correct, n, z = 1.96) {
  if (!(n > 0)) return { lo: null, hi: null, width: null };
  const p = correct / n, z2 = z * z;
  const d = 1 + z2 / n;
  const c = (p + z2 / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / d;
  return { lo: r6(c - h), hi: r6(c + h), width: r6(2 * h) };
}

/** Questions per arm needed for a 95% interval on this gap to exclude zero at these rates. */
export function nFor95(p1, p2, z = 1.96) {
  const gap = Math.abs(p1 - p2);
  if (!(gap > 0)) return null;
  // At 100% against 0% both variance terms are zero and the normal approximation asks for
  // no questions at all, which is the approximation talking and not the measurement. One
  // question is the floor: a rate still has to be observed before it can be quoted.
  return Math.max(1, Math.ceil((z * z * (p1 * (1 - p1) + p2 * (1 - p2))) / (gap * gap)));
}

/** An arm that answered nothing is absent, with the reason. It is never zero correct. */
export function summarizeArm(acc, reason = null) {
  const bySource = {};
  for (const [k, v] of Object.entries(acc.bySource)) {
    bySource[k] = { n: v.n, correct: v.n ? v.correct : null, accuracy: v.n ? r6(v.correct / v.n) : null };
  }
  // The counts, and next to them what each provenance got RIGHT. An arm whose answers are
  // mostly 'exact' and whose exact answers are mostly wrong would be a different finding
  // from one whose exact answers are all right, and one number cannot tell them apart.
  const provenance = acc.prov ? { ...acc.prov } : null;
  if (!acc.answered) {
    return {
      absent: true, reason: reason || acc.reason || 'no answer was produced', asked: acc.asked, n: 0,
      correct: null, accuracy: null, correctLoose: null, accuracyLoose: null, correctAnywhere: null, accuracyAnywhere: null, meanMs: null,
      fellBack: acc.fellBack, interval: { lo: null, hi: null, width: null }, bySource, provenance,
      recall: { ownEpisodeAmongTheCitedLines: acc.held, ofFixtureQuestions: acc.heldOf },
    };
  }
  return {
    absent: false,
    reason: acc.fellBack ? 'answered ' + acc.answered + ' of ' + acc.asked + ', ' + acc.fellBack + ' fell back' : null,
    asked: acc.asked, n: acc.answered, correct: acc.correct, accuracy: r6(acc.correct / acc.answered),
    correctLoose: acc.loose, accuracyLoose: r6(acc.loose / acc.answered),
    correctAnywhere: acc.anywhere, accuracyAnywhere: r6(acc.anywhere / acc.answered),
    meanMs: r2(mean(acc.ms)), fellBack: acc.fellBack, interval: wilson(acc.correct, acc.answered), bySource, provenance,
    recall: { ownEpisodeAmongTheCitedLines: acc.held, ofFixtureQuestions: acc.heldOf },
  };
}

function newAcc() { return { asked: 0, answered: 0, correct: 0, loose: 0, anywhere: 0, ms: [], fellBack: 0, reason: null, bySource: {}, prov: null, held: 0, heldOf: 0 }; }

// One provenance count, created on first sight so the 'alone' arm (which has none: it is
// the raw model and nothing else) keeps a null rather than a row of zeros.
function countProvenance(acc, name, ok) {
  if (!name) return;
  if (!acc.prov) acc.prov = {};
  const e = acc.prov[name] || (acc.prov[name] = { n: 0, correct: 0 });
  e.n++;
  if (ok) e.correct++;
}

// ---------------------------------------------------------------- one arm, one question
// `held` is not part of the grade. It says whether the organism's own episode for this
// question was among the lines the recall returned, which separates "the organism does not
// hold the answer" from "it holds it and the recall did not put it in front".
async function answerOne(arm, brain, q, cfg) {
  const started = performance.now();
  if (arm === 'null') {
    const a = await ask(brain, q.q, { provider: 'null', route: cfg.route });
    const mine = q.q.slice(0, 40);
    return {
      // An exact answer counts as an answer: this arm opened no socket either way, and the
      // question is what the organism produced, not which of its two paths produced it.
      ok: a.provenance.answer === 'exact' || a.from === 'memory',
      text: a.text, ms: performance.now() - started, reason: null, provenance: a.provenance.answer,
      held: a.cites.some((c) => String(c.text || '').startsWith(mine)),
    };
  }
  if (arm === 'alone') {
    const r = await complete({ prompt: q.q, provider: 'ollama', model: cfg.model, base: cfg.base, probeMs: cfg.probeMs, timeoutMs: cfg.timeoutMs });
    return { ok: r.ok && r.provider === 'ollama', text: r.text, ms: performance.now() - started, reason: r.reason, provenance: null };
  }
  const a = await ask(brain, q.q, { provider: 'ollama', model: cfg.model, base: cfg.base, probeMs: cfg.probeMs, timeoutMs: cfg.timeoutMs, route: cfg.route });
  const l = a.provenance.llm;
  // solve() answering is not a fall back. The model was not asked because it was not needed,
  // and an arm that recorded that as a fall back would report its own best path as a failure.
  const exact = a.provenance.answer === 'exact';
  return {
    ok: exact || (!!l.ok && l.provider === 'ollama'), text: a.text, ms: performance.now() - started,
    reason: exact ? null : l.reason, provenance: a.provenance.answer,
    held: a.cites.some((c) => String(c.text || '').startsWith(q.q.slice(0, 40))),
  };
}

// ---------------------------------------------------------------- the run
export async function run(opts = {}) {
  const t0 = Date.now();
  const cfg = {
    model: opts.model || DEFAULT_MODEL,
    base: opts.base || OLLAMA_BASE,
    probeMs: Number.isFinite(opts.probeMs) ? opts.probeMs : 1500,
    timeoutMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 300_000,
    // null means "whatever ask() picks", which is what every caller before --route existed got
    route: opts.route === undefined || opts.route === null || opts.route === true ? null : String(opts.route),
  };
  if (cfg.route !== null && !ROUTES.includes(cfg.route)) throw new Error('--route takes ' + ROUTES.join(' or ') + '; got ' + cfg.route);
  const quiet = !!opts.quiet;
  const selected = selectArms(opts.arms);
  const subset = selected.length < ARMS.length;
  const questions = buildQuestions({ tasksPerSuite: opts.tasks ?? 3, limit: opts.limit ?? 0, seed: opts.seed || null });
  const brain = buildBrain(questions);
  // The plan is the full rotation whatever --arms says, so an arm measured alone is asked
  // its questions in the same order it would be asked them beside the other two.
  const plan = planArms(questions.length);
  // Probed only when an arm needs it: the null arm opens no socket, so a control only run
  // must not spend the probe timeout, and must not record a probe it never made.
  const needsModel = selected.some((a) => a !== 'null');
  const up = needsModel ? await probeOllama(cfg.base, cfg.probeMs) : false;
  const downReason = 'no ollama at ' + cfg.base + ': /api/tags did not answer within ' + cfg.probeMs + ' ms';
  const notSelected = 'not selected: this run was --arms ' + selected.join(',');
  const acc = { organism: newAcc(), alone: newAcc(), null: newAcc() };
  if (needsModel && !up) { acc.organism.reason = downReason; acc.alone.reason = downReason; }
  for (const arm of ARMS) if (!selected.includes(arm)) acc[arm].reason = notSelected;

  if (!quiet) {
    console.log('\nANSWER BENCH: the organism, the model alone, and the organism with no model, on ' + questions.length
      + ' questions whose answers were known before the run.');
    console.log((subset ? 'arms ' + selected.join(',') + ': the arms not named are absent, with that as their reason'
      : 'arms ' + selected.join(','))
      + ', route ' + (cfg.route || 'whatever ask() picks for this brain') + ' (the alone arm has no route: it is the model and nothing else)');
    console.log(needsModel
      ? 'model ' + cfg.model + ' at ' + cfg.base + ', ollama ' + (up ? 'up' : 'DOWN, so the two model arms are absent') + '\n'
      : 'no model is reachable from this run and none is wanted: no arm here opens a socket\n');
  }

  const rows = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const row = { i, id: q.id, source: q.source, grade: q.grade, expected: q.a, order: plan[i], arms: {} };
    for (const arm of plan[i]) {
      if (!selected.includes(arm)) { row.arms[arm] = { absent: true }; continue; }
      if (arm !== 'null' && !up) { row.arms[arm] = { absent: true }; continue; }
      const a = acc[arm];
      a.asked++;
      const r = await answerOne(arm, brain, q, cfg);
      if (!r.ok) { a.fellBack++; row.arms[arm] = { fellBack: true, reason: r.reason }; continue; }
      const g = gradeAnswer(r.text, q);
      a.answered++; a.ms.push(r.ms);
      if (g.ok) a.correct++;
      if (g.loose) a.loose++;
      if (g.anywhere) a.anywhere++;
      const b = a.bySource[q.source] || (a.bySource[q.source] = { n: 0, correct: 0 });
      b.n++; if (g.ok) b.correct++;
      countProvenance(a, r.provenance, g.ok);
      if (q.source === 'fixture' && r.held !== undefined) { a.heldOf++; if (r.held) a.held++; }
      row.arms[arm] = { ok: g.ok, loose: g.loose, candidate: g.candidate, ms: r2(r.ms), provenance: r.provenance ?? null };
    }
    rows.push(row);
    if (!quiet) {
      const cell = (arm) => {
        const c = row.arms[arm];
        if (c.absent) return arm + ' absent';
        if (c.fellBack) return arm + ' fellback';
        return arm + ' ' + (c.ok ? 'ok ' : 'no ') + String(c.ms).padStart(9) + 'ms';
      };
      console.log(String(i + 1).padStart(3) + ' ' + q.source.padEnd(9) + String(q.id).padEnd(16)
        + plan[i].map(cell).join(' | ') + '  want ' + JSON.stringify(q.a));
    }
  }

  const arms = {};
  for (const arm of ARMS) arms[arm] = summarizeArm(acc[arm], acc[arm].reason);

  // Which arm won, and by how much, over the arms that actually answered.
  const present = ARMS.filter((a) => !arms[a].absent).sort((a, b) => arms[b].accuracy - arms[a].accuracy);
  const winner = present[0] || null, runner = present[1] || null;
  const gap = winner && runner ? r6(arms[winner].accuracy - arms[runner].accuracy) : null;
  const need = winner && runner ? nFor95(arms[winner].accuracy, arms[runner].accuracy) : null;

  if (!quiet) {
    console.log('\n' + 'arm'.padEnd(10) + 'n'.padStart(5) + 'correct'.padStart(9) + 'accuracy'.padStart(10)
      + 'loose'.padStart(8) + 'anywhere'.padStart(10) + 'mean ms'.padStart(11) + '95% width'.padStart(12) + '  by source');
    console.log('-'.repeat(100));
    for (const arm of ARMS) {
      const s = arms[arm];
      if (s.absent) { console.log(arm.padEnd(10) + 'absent: ' + s.reason); continue; }
      console.log(arm.padEnd(10) + String(s.n).padStart(5) + String(s.correct).padStart(9)
        + (s.accuracy * 100).toFixed(2).padStart(9) + '%' + String(s.correctLoose).padStart(8) + String(s.correctAnywhere).padStart(10)
        + String(s.meanMs).padStart(11) + (s.interval.width * 100).toFixed(2).padStart(11) + 'pp  '
        + Object.entries(s.bySource).map(([k, v]) => k + ' ' + v.correct + '/' + v.n).join(', '));
    }
    for (const arm of ARMS) {
      const s = arms[arm];
      if (s.absent || !s.provenance) continue;
      console.log('   ' + arm + ' by provenance: '
        + PROVENANCE_ORDER.filter((p) => s.provenance[p]).map((p) => p + ' ' + s.provenance[p].correct + '/' + s.provenance[p].n).join(', '));
    }
    for (const arm of ARMS) {
      const s = arms[arm];
      if (s.absent || !s.recall.ofFixtureQuestions) continue;
      console.log('   ' + arm + ': the organism held its own episode for the question and the recall cited it '
        + s.recall.ownEpisodeAmongTheCitedLines + ' of ' + s.recall.ofFixtureQuestions + ' times');
    }
  }

  const statement = winner && runner
    ? winner + ' won: ' + arms[winner].correct + '/' + arms[winner].n + ' = ' + (arms[winner].accuracy * 100).toFixed(2)
      + '% against ' + runner + ' ' + arms[runner].correct + '/' + arms[runner].n + ' = ' + (arms[runner].accuracy * 100).toFixed(2)
      + '%, a gap of ' + (gap * 100).toFixed(2) + ' points. The 95% interval is ' + (arms[winner].interval.width * 100).toFixed(2)
      + ' points wide on the winner and ' + (arms[runner].interval.width * 100).toFixed(2)
      + ' on the runner up, and a gap this size at these rates needs ' + need + ' questions per arm to separate from zero.'
    : winner
      ? winner + ' is the only arm that answered: ' + arms[winner].correct + '/' + arms[winner].n
      : 'no arm answered anything.';
  if (!quiet) console.log('\n' + statement + '\n');

  const checks = {
    everyPresentArmAnsweredEveryQuestionItWasAsked: ARMS.every((a) => arms[a].absent || arms[a].n === arms[a].asked),
    everyQuestionGotAllThreeArms: plan.every((p) => new Set(p).size === ARMS.length),
    armsRotated: plan.length < 2 || plan.some((p, i) => i > 0 && p[0] !== plan[i - 1][0]),
    absentArmsCarryAReason: ARMS.every((a) => !arms[a].absent || !!arms[a].reason),
    // Every provenance an arm reports is one act/prompt.mjs declares, and the counts add up
    // to the answers. A provenance nobody recognises would make the printed rows arithmetic
    // nobody can check, which is worse than not printing them.
    provenanceCountsAddUp: ARMS.every((a) => {
      const s = arms[a];
      if (s.absent || !s.provenance) return true;
      const names = Object.keys(s.provenance);
      return names.every((p) => PROVENANCE_ORDER.includes(p))
        && names.reduce((t, p) => t + s.provenance[p].n, 0) === s.n;
    }),
  };
  const green = Object.values(checks).every(Boolean);

  const verdict = {
    at: new Date().toISOString(), node: process.version,
    command: 'node bench/answer.mjs' + (opts.model ? ' --model ' + opts.model : '')
      + (opts.tasks !== undefined ? ' --tasks ' + opts.tasks : '')
      + (subset ? ' --arms ' + selected.join(',') : '')
      + (cfg.route ? ' --route ' + cfg.route : '')
      + (opts.limit ? ' --limit ' + opts.limit : '') + (opts.seed ? ' --seed ' + opts.seed : '')
      + (opts.write === false ? ' --nowrite' : ''),
    verdict: green ? 'GREEN' : 'RED', checks, ms: Date.now() - t0,
    armsRun: selected, model: cfg.model, base: cfg.base, ollamaUp: needsModel ? up : null,
    // The route the two ask() arms took. null is what every run before --route existed took:
    // whatever ask() picks for this bench's brain, which is direct until a run asks otherwise.
    route: cfg.route, seed: opts.seed || null,
    questions: {
      total: questions.length, tasksPerSuite: opts.tasks ?? 3, fixtureInEpisodicMemory: brain.memory.episodic.size(),
      bySource: questions.reduce((m, q) => (m[q.source] = (m[q.source] || 0) + 1, m), {}),
    },
    interleaving: {
      how: 'question by question: all three arms answer question i before any arm sees question i+1, and the first arm rotates with i',
      order: plan.map((p) => p.join('>')),
    },
    grading: {
      how: 'one extractor and one comparison for all three arms; number compares exact rationals through tasks/exact.mjs, exact compares characters. The winner is decided on this ruler and no other',
      loose: 'accuracyLoose repeats the strict ruler with case ignored',
      anywhere: 'accuracyAnywhere is the generous edge: the right answer is somewhere in what the arm wrote, wherever it is. It is reported, never used to pick a winner',
      provenance: 'arms.<arm>.provenance counts each answer as exact (act/solve.mjs computed the whole prompt, with no model and no socket), memory (the retrieval answered) or model (the llm answered), with how many of each were right. The alone arm is the raw model and carries none',
    },
    arms, winner, runnerUp: runner, gap, nFor95: need, statement,
    rows: rows.map((r) => ({ ...r, order: r.order.join('>') })),
  };
  if (opts.write !== false) {
    mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
    const file = path.join(HERE, 'verdicts', 'answer.json');
    writeFileSync(file, JSON.stringify(subset ? mergeSlot(file, verdict, selected, cfg.route) : carrySlots(file, verdict), null, 2));
  }
  return verdict;
}

// A full run replaces the three arm verdict and carries the --arms slots of the prior file
// forward: a Before pinned by an earlier subset run is a baseline, and a fresh three arm run
// must not erase it.
function carrySlots(file, verdict) {
  let prior = null;
  try { prior = JSON.parse(readFileSync(file, 'utf8')); } catch { prior = null; }
  if (!prior || typeof prior !== 'object' || Array.isArray(prior)) return verdict;
  const out = { ...verdict };
  for (const k of Object.keys(prior)) if (/(Before|After)$/.test(k) || k === 'slots') out[k] = prior[k];
  return out;
}

// A subset run keeps the three arm verdict and adds one slot to it. The slot name is the
// selected arms plus Before or After: Before is written once and then pinned, so the
// baseline cannot be quietly replaced by a later run of the changed code, and After is
// rewritten every time, so it is always the newest measurement of that arm.
// The ROUTE is part of the slot name. Two runs of the same arm over the same path are a
// before and an after; two runs over DIFFERENT paths are two measurements that have to be
// readable side by side, which is the whole point of measuring both.
function mergeSlot(file, verdict, selected, route = null) {
  let prior = null;
  try { prior = JSON.parse(readFileSync(file, 'utf8')); } catch { prior = null; }
  const base = prior && typeof prior === 'object' && !Array.isArray(prior) ? prior : {};
  const stem = selected.join('+') + (route ? '.' + route : '');
  const slot = base[stem + 'Before'] ? stem + 'After' : stem + 'Before';
  const summary = {};
  for (const arm of selected) {
    const s = verdict.arms[arm];
    summary[arm] = {
      absent: s.absent, n: s.n, asked: s.asked,
      lastLine: { correct: s.correct, accuracy: s.accuracy },
      anywhere: { correct: s.correctAnywhere, accuracy: s.accuracyAnywhere },
      meanMs: s.meanMs, interval: s.interval, bySource: s.bySource, provenance: s.provenance, recall: s.recall,
    };
  }
  base[slot] = {
    at: verdict.at, node: verdict.node, command: verdict.command, ms: verdict.ms, route: verdict.route,
    // The two slots are only a before and an after if the code under them differed.
    promptSurfaceSha: fileDigest(path.join(HERE, '..', 'act', 'prompt.mjs')),
    questions: verdict.questions, arms: summary,
    ruler: 'lastLine is the one candidate the winner is decided on (the last boxed value, else the last meaningful line); anywhere is the generous edge',
  };
  base.slots = 'a --arms run merges here and leaves the three arm verdict above untouched; <arms>Before is pinned on first write, <arms>After is the newest';
  return base;
}

// ---------------------------------------------------------------- cli
function args(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const k = a.slice(2), v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { out[k] = true; continue; }
    out[k] = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v;
    i++;
  }
  return out;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = args(process.argv.slice(2));
  const v = await run({
    model: a.model === true ? undefined : a.model,
    base: a.base === true ? undefined : a.base,
    tasks: a.tasks === undefined ? undefined : Number(a.tasks),
    limit: a.limit ? Number(a.limit) : 0,
    seed: a.seed === true ? null : a.seed,
    arms: a.arms === undefined ? null : a.arms,
    route: a.route === undefined ? null : a.route,
    timeoutMs: a.timeoutMs ? Number(a.timeoutMs) : undefined,
    write: !a.nowrite,
    quiet: !!a.quiet,
  });
  if (a.json) console.log(JSON.stringify(v, null, 2));
  console.log('ANSWER ' + v.verdict + ': ' + v.statement + ' ' + v.ms + 'ms, '
    + (a.nowrite ? 'no verdict file was written (--nowrite)' : 'verdict written to bench/verdicts/answer.json'));
  if (v.verdict !== 'GREEN') process.exitCode = 1;
}
