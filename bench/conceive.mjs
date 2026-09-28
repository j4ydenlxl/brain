// bench/conceive.mjs: WHAT A PERSON CONCEIVES, ASKED OF THE ORGANISM. A breadth census, not a depth score.
//
// His words, 2026-09-16, re-sent 2026-09-27 15:05 EDT (docs/VISION.md order 42 clause (a)): "What if everything the
// human could concieve of in their brain was native to the brain and completely plausible finding ways to do it
// straight". At 14:56 EDT the live site answered 2 of his 5 probe prompts; a fact and an essay printed "I do not
// carry that yet". This bench asks the organism a few hundred prompts of the kinds a person actually types and
// prints, per kind, how many it answers natively, how many it refuses, and how many of its answers pass a rubric
// written down with the prompt before any arm answered. Authors: board 29 builder (the first draft, item conceive);
// board 31 builder (the re-run: the model arm's measured budgets, the journal, the per arm walls, the wrong native
// count, the parrot control and a mock ollama for the tests).
//
// THE PROMPTS, bench/conceive-prompts.json: 291 prompts over 41 kinds (arithmetic to riddles to code), each
// {id, kind, prompt, grade}. Written for this file; copyCheck() below re-reads bench/site-ask.mjs, web/ask.mjs,
// bench/essay-prompts.json and the public sets under bench/fixtures/public on every run and fails a check when a
// prompt is found in any of them. The whole file is the DEVELOPMENT set: there is no held out half, because nothing
// here is fit to a score (no tier, threshold or rubric was tuned on these rows), and the verdict says so.
//
// THE RUBRICS, stated without a model (the verifiable instruction idea of IFEval, Zhou et al. 2023, arXiv 2311.07911:
// word, sentence, paragraph and bullet counts, keywords, formats, checked by code):
//   exact     the candidate answer (the last meaningful line, a trailing label and edge punctuation stripped, the
//             answer.mjs ruler) equals the answer or an alt; a numeric answer compares the LAST number on that
//             line by value (fractions and decimals meet: 1/2 equals 0.5)
//   contains  every term of `all` and at least one of `any` appears on word boundaries (a term ending in * is a
//             prefix: refract* meets refraction); case folded unless caseSensitive
//   regex     the pattern matches the answer
//   code      the JavaScript in the answer (fenced blocks, else the whole text) defines `entry`, and entry(args)
//             returns `want` for every test, run in ONE worker thread at a time with a vm timeout and a wall timeout
//   length    every stated count is inside its band: words, sentences, paragraphs (blank line separated), lines
//             (non-empty), items (bullet or numbered lines; numbered counts numbered lines only; perLine counts
//             non-empty lines when no line is bulleted)
//   none      no rubric can be stated without a model (a greeting, an opinion, a joke's wit): graded is null
// STRICT is the rubric on the text as given. LOOSE is IFEval's loose accuracy: the rubric passes on any of eight
// variants (the text, without its first line, without its last line, without both, each with every * removed).
// A refusal is graded false BEFORE the rubric runs: a memory miss that happens to have three lines is not a haiku.
//
// THE ARMS, interleaved prompt by prompt with the first arm rotating (bench/essay.mjs's plan):
//   organism       act/prompt.mjs ask() on the brain the endpoint builds (seeds/basic.mjs seedBasic), with the
//                  endpoint's own options: provider null (no socket, no model), k 5. The knowledge tier is open when
//                  this host holds a finished ingest (knowledgeReady() is recorded).
//   organism-site  the same with the knowledge tier off (knowledge: false): dilation.dev carries no ingested store,
//                  so this arm is what the deployed host can answer; it models that ONE difference and no other.
//   model          the same ask() with provider ollama and model qwen3:1.7b (never a larger one): the organism with
//                  its model cell. It opens a socket ONLY when --model-arm is passed; `ollama list` runs first and
//                  its row for the model is recorded. Without the flag, or when ollama does not answer, the arm is
//                  ABSENT with its reason, never a zero and never a substitute. Its budgets are the ones bench/public.mjs
//                  measured for this model (a reasoning model that thinks through a small num_predict hands back an
//                  EMPTY answer): maxTokens 4000 and a 300 s timeout per call unless --maxTokens / --timeoutMs say.
//                  The model arm is slow (seconds a prompt, more for a math region prompt, which asks the cell k 5
//                  times and a checker once), so --journal PATH appends each model row as it lands and --resume
//                  reuses the journal's rows for the same prompt text, model and budgets; the verdict counts them.
// Per row: route, from, provenance, native (a non-empty answer that is not a miss text), refused, graded, the loose
// grade, ns (the wall of the ask() call on process.hrtime.bigint) and chars. Each arm prints its wall (the sum of its
// asks) beside the whole run's wall.
//
// THE CONTROL: the rubric run on an EMPTY answer grades 0 for every gradeable row, strict and loose (asserted and
// printed). Three more are printed: the prompt echoed back (how many rubrics an echo meets), the organism's own
// miss text graded by the rubric alone (how many rows the native gate is what keeps false), and THE PARROT: one
// constant answer ("ok") to every prompt refuses nothing, so it would meet the refusal half of the bar; the number of
// rubrics it passes is the floor any arm's correct count is read against.
// WRONG NATIVE: a native answer to a gradeable prompt that fails its rubric (an answer given with confidence, and
// wrong by the rubric) is counted per arm, with its ids, beside the refusals.
//
// THE BAR (the model arm is what it grades): isTheBar when --limit 0 with every arm selected and every structural
// check true; barMet when the model arm is present, its refused share is 0, and every gradeable row it answered was
// graded. --limit N (N prompts, round robin over the kinds) writes bench/verdicts/conceive-partial.json instead.
//
//   node bench/conceive.mjs [--limit N] [--arms organism,organism-site,model] [--model-arm] [--model qwen3:1.7b]
//                           [--timeoutMs ms] [--maxTokens n] [--probeMs ms] [--journal PATH] [--resume]
//                           [--quiet] [--json] [--nowrite] [--help]
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { execFile } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
export const PROMPTS_FILE = path.join(HERE, 'conceive-prompts.json');
export const VERDICTS = Object.freeze({ bar: 'bench/verdicts/conceive.json', partial: 'bench/verdicts/conceive-partial.json' });
export const ARMS = Object.freeze(['organism', 'organism-site', 'model']);
export const MODEL_DEFAULT = 'qwen3:1.7b';
/** The only models this bench will send a prompt to: the orders cap the model cell at qwen3:1.7b. */
export const MODELS_ALLOWED = Object.freeze(['qwen3:1.7b', 'qwen3:0.6b']);
export const GRADE_TYPES = Object.freeze(['exact', 'contains', 'regex', 'code', 'length', 'none']);
export const LENGTH_KEYS = Object.freeze(['words', 'sentences', 'paragraphs', 'lines', 'items']);
/** The warm up asks, the endpoint's two (act/ask-http.mjs coldStart) and one definitional question; none is a conceive prompt. */
export const WARM = Object.freeze(['what is 17 times 23', 'write a poem about the sea', 'what is water?']);
export const BOARD_MODEL_OFF = 'not requested: without --model-arm this bench opens no socket; board 31 runs every item MODEL OFF (the one ollama queue is held by the orchestrator\'s rungs), so the model arm waits for a free queue and --model-arm';
/** The one command that completes the bar once the ollama queue is free (the journal path is the runner's scratch). */
export const MODEL_ARM_COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/conceive.mjs --limit 0 --model-arm --journal <scratch>/model-journal.jsonl --resume';
/** The model arm's budgets, bench/public.mjs's measured ones for qwen3:1.7b (its maxTokens 4000 on HumanEval, 300 s timeout). */
export const MODEL_BUDGET = Object.freeze({ maxTokens: 4000, timeoutMs: 300000, probeMs: 1500 });
/** The parrot control's one answer to every prompt. */
export const PARROT = 'ok';

const r4 = (x) => Math.round(x * 10000) / 10000;
const pct = (x) => (x === null || x === undefined || !Number.isFinite(x) ? 'absent' : (x * 100).toFixed(2) + '%');
const median = (xs) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); return s[Math.floor((s.length - 1) / 2)]; };
const quantile = (xs, q) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ---------------------------------------------------------------- the miss detector
/** The first words of every text the organism gives when it does not carry a prompt. The first two are the memory
 * miss (act/prompt.mjs FALLTHROUGH_HEAD and memoryAnswer's line); the last two are a reasoning region that ran and
 * produced nothing (act/prompt.mjs NO_NUMBER and renderRegion), which only the model arm can reach. */
export const MISS_HEADS = Object.freeze([
  'I do not carry that yet',
  'nothing in memory matches',
  'the math region produced no number',
  'the code region produced no candidate',
]);
export const MISS_RE = new RegExp('^\\s*(?:' + MISS_HEADS.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')');
/** Is this answer text the organism saying it does not carry the prompt? */
export const isMiss = (text) => MISS_RE.test(String(text ?? ''));
/** Native: a non-empty answer that is not a miss text. */
export const isNative = (text) => String(text ?? '').trim().length > 0 && !isMiss(text);

// ---------------------------------------------------------------- the counters
const ALNUM = /[\p{L}\p{N}]/u;
const BULLET_RE = /^\s*(?:[-*•+]|\d+[.)]|\*\*\d+[.)]\*\*)\s+\S/;
const NUMBERED_RE = /^\s*(?:\*\*)?\d+[.)](?:\*\*)?\s+\S/;
/** Non-empty lines (a line needs a letter or a digit), trimmed. */
export const linesOf = (t) => String(t ?? '').split(/\r?\n/).map((s) => s.trim()).filter((s) => ALNUM.test(s));
/** Paragraphs: split on blank lines; a paragraph needs a letter or a digit. */
export const paragraphsOf = (t) => String(t ?? '').replace(/\r\n?/g, '\n').split(/\n[ \t]*\n+/).map((p) => p.trim()).filter((p) => ALNUM.test(p));
/** Words: whitespace separated tokens holding a letter or a digit. */
export const wordsOf = (t) => String(t ?? '').split(/\s+/).filter((w) => ALNUM.test(w));
/** Sentences: the text on one line, split after . ! ? (and a closing quote or bracket). */
export const sentencesOf = (t) => String(t ?? '').replace(/\s+/g, ' ').split(/(?<=[.!?]["'”’)\]]?)\s+/).filter((s) => ALNUM.test(s));
/** Items: bullet or numbered lines; numbered counts numbered lines only; perLine falls back to non-empty lines when no line is a bullet. */
export function itemsOf(t, { numbered = false, perLine = false } = {}) {
  const raw = String(t ?? '').split(/\r?\n/);
  const n = raw.filter((l) => (numbered ? NUMBERED_RE : BULLET_RE).test(l)).length;
  if (n === 0 && perLine && !numbered) return linesOf(t).length;
  return n;
}
const COUNTERS = {
  words: (t) => wordsOf(t).length,
  sentences: (t) => sentencesOf(t).length,
  paragraphs: (t) => paragraphsOf(t).length,
  lines: (t) => linesOf(t).length,
  items: (t, band) => itemsOf(t, band),
};

// ---------------------------------------------------------------- exact
const NUM_RE = /-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?(?:\s*\/\s*-?\d+(?:\.\d+)?)?/g;
const NUMERIC_WANT = /^-?\d+(?:\.\d+)?(?:\/-?\d+(?:\.\d+)?)?$/;
export function numValue(s) {
  const [a, b] = String(s).replace(/,/g, '').replace(/\s+/g, '').split('/');
  const x = Number(a);
  if (b === undefined) return x;
  const y = Number(b);
  return y === 0 ? NaN : x / y;
}
export const numbersIn = (s) => (String(s ?? '').replace(/−/g, '-').match(NUM_RE) || []);
const sameNum = (a, b) => { const x = numValue(a), y = numValue(b); return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y)); };
const normText = (s) => String(s ?? '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();

/** The candidate answer of a text: its last meaningful line, a label before the last colon, markdown, quotes, a lead in and edge punctuation stripped. */
export function candidateOf(text) {
  const ls = linesOf(text);
  let line = ls.length ? ls[ls.length - 1] : '';
  if (line.includes(':')) {
    const after = line.slice(line.lastIndexOf(':') + 1).trim();
    if (ALNUM.test(after)) line = after;
  }
  line = line.replace(/[*_`"“”]/g, '').trim();
  line = line.replace(/^(?:the\s+answer\s+is|answer|it\s+is|it(?:'|’)s|that\s+is|this\s+is|you\s+are|i\s+am)\s+/i, '');
  line = line.replace(/^(?:a|an|the|your)\s+/i, '');
  line = line.replace(/^['‘’]+|['‘’]+$/g, '');
  line = line.replace(/[.!?,;]+$/, '').replace(/^['‘’]+|['‘’]+$/g, '').trim();
  return line;
}

export function exactPass(text, g) {
  const cand = candidateOf(text);
  if (!cand) return false;
  for (const w of [g.answer, ...(g.alts || [])].map(String)) {
    if (NUMERIC_WANT.test(w)) {
      const nums = numbersIn(cand);
      if (nums.length && sameNum(nums[nums.length - 1], w)) return true;
      continue;
    }
    const c = normText(cand), ww = normText(w);
    if (c === ww) return true;
    const toks = c.split(' ');
    if (toks[toks.length - 1] === ww) return true;
  }
  return false;
}

// ---------------------------------------------------------------- contains, regex, length
export function termRe(term, caseSensitive = false) {
  const prefix = term.endsWith('*');
  const core = (prefix ? term.slice(0, -1) : term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return new RegExp('(?<![\\p{L}\\p{N}])' + core + (prefix ? '' : '(?![\\p{L}\\p{N}])'), caseSensitive ? 'u' : 'iu');
}
export function containsPass(text, g) {
  const t = String(text ?? '');
  const all = g.all || [], any = g.any || [];
  if (!all.length && !any.length) return false;
  if (!all.every((w) => termRe(w, !!g.caseSensitive).test(t))) return false;
  return !any.length || any.some((w) => termRe(w, !!g.caseSensitive).test(t));
}
export const regexPass = (text, g) => new RegExp(g.pattern, g.flags || '').test(String(text ?? ''));
export function lengthCounts(text, g) {
  const out = {};
  for (const k of LENGTH_KEYS) if (g[k]) out[k] = COUNTERS[k](text, g[k]);
  return out;
}
export function lengthPass(text, g) {
  const counts = lengthCounts(text, g);
  const keys = Object.keys(counts);
  if (!keys.length) return false;
  return keys.every((k) => counts[k] >= (g[k].min ?? 0) && counts[k] <= (g[k].max ?? Infinity));
}

// ---------------------------------------------------------------- code, in a worker with a timeout
/** The JavaScript in an answer: its js fenced blocks (else every fenced block, else the whole text), export keywords dropped. */
export function extractCode(text) {
  const t = String(text ?? '');
  const blocks = [...t.matchAll(/```[ \t]*([A-Za-z0-9_+-]*)[^\n]*\r?\n([\s\S]*?)```/g)];
  const js = blocks.filter((b) => !b[1] || /^(?:js|javascript|mjs|node|jsx)$/i.test(b[1])).map((b) => b[2]);
  const code = js.length ? js.join('\n') : blocks.length ? blocks.map((b) => b[2]).join('\n') : t;
  return code.replace(/^\s*export\s+default\s+/gm, '').replace(/^(\s*)export\s+(?=(?:async\s+)?function|const|let|var|class)/gm, '$1');
}

const WORKER_SRC = [
  "const { parentPort, workerData } = require('node:worker_threads');",
  "const vm = require('node:vm');",
  'const { sources, entry, tests, ms } = workerData;',
  "let best = { ok: false, passed: 0, total: tests.length, error: 'no source ran' };",
  'for (const src of sources) {',
  '  let ctx;',
  '  try {',
  '    ctx = vm.createContext({ console: { log() {}, error() {}, warn() {}, info() {} }, module: { exports: {} }, exports: {} });',
  "    vm.runInContext(src + '\\n;globalThis.__entry = (typeof ' + entry + ' === \"function\") ? ' + entry + ' : (module.exports && typeof module.exports.' + entry + ' === \"function\") ? module.exports.' + entry + ' : undefined;', ctx, { timeout: ms });",
  '  } catch (e) { if (best.passed === 0) best = { ok: false, passed: 0, total: tests.length, error: String((e && e.message) || e).slice(0, 160) }; continue; }',
  "  if (typeof ctx.__entry !== 'function') { if (best.passed === 0) best = { ok: false, passed: 0, total: tests.length, error: 'no function named ' + entry }; continue; }",
  '  let passed = 0, error = null;',
  '  for (const t of tests) {',
  '    try {',
  "      const got = vm.runInContext('JSON.stringify(__entry(...' + JSON.stringify(t.args) + '))', ctx, { timeout: ms });",
  "      if (got === JSON.stringify(t.want)) passed++; else if (!error) error = 'got ' + String(got).slice(0, 60) + ' want ' + JSON.stringify(t.want);",
  '    } catch (e) { if (!error) error = String((e && e.message) || e).slice(0, 160); }',
  '  }',
  '  if (passed >= best.passed) best = { ok: passed === tests.length, passed, total: tests.length, error: passed === tests.length ? null : error };',
  '  if (best.ok) break;',
  '}',
  'parentPort.postMessage(best);',
].join('\n');

/** Run candidate sources against the tests in ONE worker thread (the caller awaits it, so never two at once). */
export function runCode(sources, entry, tests, { ms = 1000 } = {}) {
  const total = tests.length;
  if (!/^[A-Za-z_$][\w$]*$/.test(entry)) return Promise.resolve({ ok: false, passed: 0, total, error: 'entry is not an identifier' });
  const live = sources.filter((s) => String(s).trim().length > 0);
  if (!live.length) return Promise.resolve({ ok: false, passed: 0, total, error: 'no code' });
  return new Promise((resolve) => {
    let done = false;
    const w = new Worker(WORKER_SRC, { eval: true, workerData: { sources: live, entry, tests, ms }, resourceLimits: { maxOldGenerationSizeMb: 64, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 } });
    const finish = (r, kill) => { if (done) return; done = true; clearTimeout(wall); if (kill) w.terminate().catch(() => {}); resolve(r); };
    const wall = setTimeout(() => finish({ ok: false, passed: 0, total, error: 'wall timeout' }, true), ms * (total + 1) * live.length + 3000);
    w.once('message', (r) => finish(r, true));
    w.once('error', (e) => finish({ ok: false, passed: 0, total, error: 'worker error: ' + String((e && e.message) || e).slice(0, 160) }, true));
    w.once('exit', (code) => finish({ ok: false, passed: 0, total, error: 'worker exited ' + code }, false));
  });
}

/** The code rubric: the answer's code, and for a prompt that opens a function (HumanEval shape) the prompt plus the answer too. */
export async function codePass(text, g, promptText = '') {
  const code = extractCode(text);
  const sources = [code];
  if (new RegExp('function\\s+' + g.entry + '\\s*\\(').test(String(promptText)) && !new RegExp('function\\s+' + g.entry + '\\s*\\(').test(code)) sources.push(String(promptText) + '\n' + code + '\n}');
  const r = await runCode(sources, g.entry, g.tests, { ms: g.ms || 1000 });
  return r.ok;
}

// ---------------------------------------------------------------- the rubric
/** The rubric alone on a text: true or false for a gradeable grade, null for none. */
export async function rubric(text, grade, promptText = '') {
  switch (grade && grade.type) {
    case 'none': return null;
    case 'exact': return exactPass(text, grade);
    case 'contains': return containsPass(text, grade);
    case 'regex': return regexPass(text, grade);
    case 'length': return lengthPass(text, grade);
    case 'code': return codePass(text, grade, promptText);
    default: throw new Error('unknown grade type ' + (grade && grade.type));
  }
}

/** IFEval loose accuracy: the eight variants the rubric may pass on (the text, without its first line, its last line, both; each with every * removed). */
export function looseVariants(text) {
  const ls = String(text ?? '').split(/\r?\n/);
  const base = [ls.join('\n'), ls.slice(1).join('\n'), ls.slice(0, -1).join('\n'), ls.slice(1, -1).join('\n')];
  return [...base, ...base.map((s) => s.replace(/\*/g, ''))];
}
export async function rubricLoose(text, grade, promptText = '') {
  if (!grade || grade.type === 'none') return null;
  if (grade.type === 'code') return rubric(text, grade, promptText);
  for (const v of looseVariants(text)) if (await rubric(v, grade, promptText)) return true;
  return false;
}

/** One answer graded: native first; a refusal is graded false before any rubric runs; none is null. */
export async function gradeAnswer(text, row) {
  const native = isNative(text);
  if (!row.grade || row.grade.type === 'none') return { native, graded: null, gradedLoose: null };
  if (!native) return { native, graded: false, gradedLoose: false };
  return { native, graded: await rubric(text, row.grade, row.prompt), gradedLoose: await rubricLoose(text, row.grade, row.prompt) };
}

// ---------------------------------------------------------------- the prompts
export function loadPrompts(file = PROMPTS_FILE) { return JSON.parse(readFileSync(file, 'utf8')); }

/** The shape problems of a prompt set (an empty list is a sound file). */
export function validatePrompts(set) {
  const bad = [];
  const ids = new Set();
  for (const p of set.prompts || []) {
    if (!p.id || ids.has(p.id)) bad.push('id ' + p.id + ' missing or repeated');
    ids.add(p.id);
    if (!(set.kinds || []).includes(p.kind)) bad.push(p.id + ' kind ' + p.kind + ' not in kinds');
    if (typeof p.prompt !== 'string' || !p.prompt.trim()) bad.push(p.id + ' has no prompt');
    const g = p.grade || {};
    if (!GRADE_TYPES.includes(g.type)) { bad.push(p.id + ' grade type ' + g.type + ' unknown'); continue; }
    if (g.type === 'exact' && !String(g.answer ?? '').trim()) bad.push(p.id + ' exact with no answer');
    if (g.type === 'contains' && !((g.all || []).length || (g.any || []).length)) bad.push(p.id + ' contains with no terms');
    if (g.type === 'regex') { try { new RegExp(g.pattern, g.flags || ''); } catch (e) { bad.push(p.id + ' regex does not compile: ' + e.message); } }
    if (g.type === 'length' && !LENGTH_KEYS.some((k) => g[k])) bad.push(p.id + ' length with no count');
    if (g.type === 'code' && (!/^[A-Za-z_$][\w$]*$/.test(g.entry || '') || !(g.tests || []).length)) bad.push(p.id + ' code with no entry or no tests');
  }
  return bad;
}

/** N prompts round robin over the kinds in the file's kind order (N <= 0: every prompt in file order). */
export function selectPrompts(set, limit = 0) {
  if (!(limit > 0)) return [...set.prompts];
  const byKind = set.kinds.map((k) => set.prompts.filter((p) => p.kind === k));
  const out = [];
  for (let i = 0; out.length < limit; i++) {
    let took = false;
    for (const list of byKind) { if (i < list.length && out.length < limit) { out.push(list[i]); took = true; } }
    if (!took) break;
  }
  return out;
}

// ---------------------------------------------------------------- the copy check
const normCopy = (s) => String(s ?? '').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
function stringsIn(v, out) {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) for (const x of v) stringsIn(x, out);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) stringsIn(x, out);
  return out;
}
const literalsIn = (src) => [...src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)].map((m) => m[1] ?? m[2]);

/** Is any prompt a copy of a prompt in the sets conceive must not reuse? Equality after normalising, or containment when the shorter side has 6 or more words. */
export function copyCheck(prompts, root = ROOT) {
  const specs = [
    { file: 'bench/site-ask.mjs', read: (t) => literalsIn(t) },
    { file: 'web/ask.mjs', read: (t) => literalsIn(t) },
    { file: 'bench/essay-prompts.json', read: (t) => stringsIn(JSON.parse(t), []) },
    { file: 'bench/fixtures/public/gsm8k/test.jsonl', read: (t) => t.split('\n').filter(Boolean).flatMap((l) => stringsIn(JSON.parse(l), [])) },
    { file: 'bench/fixtures/public/humaneval/HumanEval.jsonl', read: (t) => t.split('\n').filter(Boolean).flatMap((l) => stringsIn(JSON.parse(l), [])) },
    { file: 'bench/fixtures/public/humaneval/humaneval-js.jsonl', read: (t) => t.split('\n').filter(Boolean).flatMap((l) => stringsIn(JSON.parse(l), [])) },
  ];
  const sources = [];
  const all = [];
  for (const s of specs) {
    const f = path.join(root, s.file);
    if (!existsSync(f)) { sources.push({ file: s.file, present: false, strings: 0 }); continue; }
    const strs = s.read(readFileSync(f, 'utf8')).map((x) => ({ n: normCopy(x), file: s.file })).filter((x) => x.n.length > 0);
    sources.push({ file: s.file, present: true, strings: strs.length });
    all.push(...strs);
  }
  const exact = new Map(all.map((x) => [x.n, x.file]));
  const hay = all.map((x) => x.n).join('\n');
  const longs = all.filter((x) => x.n.split(' ').length >= 6);
  const copied = [];
  for (const p of prompts) {
    const P = normCopy(p.prompt);
    if (!P) continue;
    if (exact.has(P)) { copied.push({ id: p.id, source: exact.get(P), how: 'equal' }); continue; }
    if (P.split(' ').length >= 6 && hay.includes(P)) { copied.push({ id: p.id, source: (all.find((x) => x.n.includes(P)) || {}).file, how: 'prompt inside a source string' }); continue; }
    const inside = longs.find((x) => x.n.length <= P.length && P.includes(x.n));
    if (inside) copied.push({ id: p.id, source: inside.file, how: 'source string inside the prompt' });
  }
  return { sources, checked: prompts.length, copied };
}

// ---------------------------------------------------------------- the arms
async function newBrain(name) {
  const { seedBasic } = await import('../seeds/basic.mjs');
  // the brain the endpoint builds at cold start (act/ask-http.mjs), one per arm so no arm reads another's asks
  return seedBasic({ name, ledger: 'full', ledgerRing: 4096 });
}

/** The model arm's budgets after the flags: MODEL_BUDGET unless a flag says otherwise. */
export function modelBudget(cfg = {}) {
  return {
    maxTokens: Number.isFinite(cfg.maxTokens) ? cfg.maxTokens : MODEL_BUDGET.maxTokens,
    timeoutMs: Number.isFinite(cfg.timeoutMs) ? cfg.timeoutMs : MODEL_BUDGET.timeoutMs,
    probeMs: Number.isFinite(cfg.probeMs) ? cfg.probeMs : MODEL_BUDGET.probeMs,
  };
}

export function optsFor(arm, cfg) {
  if (arm === 'organism') return { provider: 'null', k: 5, events: [] };
  if (arm === 'organism-site') return { provider: 'null', k: 5, events: [], knowledge: false };
  return { provider: 'ollama', model: cfg.model, k: 5, events: [], ...modelBudget(cfg), ...(cfg.base ? { base: cfg.base } : {}) };
}

// ---------------------------------------------------------------- the instrument (what code produced the answers)
// Board 31 verify: the builder's list of wrong native ids did not reproduce, because act/prompt.mjs (owned by another
// item) was edited at 19:39:03 EDT while the run was going. The ask path is now hashed at the start and at the end of
// every run: the verdict names the code it measured, a run whose ask path changed under it is not the bar, and a
// journal row made by other code is never reused.
const SPEC_RE = /(?:^|[;\s}])(?:import|export)\s[^'"`;]*?from\s*['"]([^'"]+)['"]|(?:^|[;\s])import\s*['"]([^'"]+)['"]|\bimport\(\s*['"]([^'"]+)['"]\s*\)/gm;
/** The relative module specifiers a source names (static imports and exports, bare imports, literal dynamic imports). */
export function specifiersOf(src) {
  const out = [];
  for (const m of String(src).matchAll(SPEC_RE)) { const sp = m[1] ?? m[2] ?? m[3]; if (sp && (sp.startsWith('./') || sp.startsWith('../'))) out.push(sp); }
  return out;
}
/** Every file under ROOT reachable from the roots by relative imports, and one sha256 over their paths and bytes. */
export function instrumentOf(roots = ['act/prompt.mjs', 'bench/conceive.mjs', 'seeds/basic.mjs'], root = ROOT) {
  const seen = new Set(), queue = roots.map((r) => path.join(root, r)), missing = [];
  while (queue.length) {
    const f = queue.shift();
    const k = path.relative(root, f).split(path.sep).join('/');
    if (seen.has(k)) continue;
    if (!existsSync(f)) { missing.push(k); continue; }
    seen.add(k);
    for (const sp of specifiersOf(readFileSync(f, 'utf8'))) { const t = path.resolve(path.dirname(f), sp); if (t.startsWith(path.resolve(root))) queue.push(t); }
  }
  const files = [...seen].sort();
  const h = createHash('sha256');
  for (const k of files) { h.update(k + '\0'); h.update(readFileSync(path.join(root, k))); h.update('\0'); }
  const p = path.join(root, 'act/prompt.mjs');
  return {
    sha: h.digest('hex').slice(0, 16), files: files.length, list: files, missing,
    promptMjs: existsSync(p) ? { sha: createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16), mtime: statSync(p).mtime.toISOString() } : null,
  };
}

// ---------------------------------------------------------------- the journal (the model arm only)
const sha = (s) => createHash('sha256').update(String(s)).digest('hex').slice(0, 16);
/** The key a journal row is reused under: the prompt's id and text, the model, its budgets and the instrument's sha. A changed prompt, budget or ask path is not reused. */
export const journalKey = (p, cfg) => [p.id, sha(p.prompt), cfg.model, modelBudget(cfg).maxTokens, modelBudget(cfg).timeoutMs, cfg.instrument || 'no-instrument'].join('|');
/** The journal's rows by key (the last row for a key wins); a torn last line is skipped and counted. */
export function readJournal(file) {
  const out = new Map();
  let torn = 0;
  if (!file || !existsSync(file)) return { rows: out, torn, lines: 0 };
  const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  for (const l of lines) {
    try { const j = JSON.parse(l); if (j && j.key && j.row) out.set(j.key, j.row); else torn++; } catch { torn++; }
  }
  return { rows: out, torn, lines: lines.length };
}

/** The arm order for each of n prompts: every selected arm, the first one rotating. */
export function planArms(n, arms = ARMS) {
  const out = [];
  for (let i = 0; i < n; i++) { const k = i % arms.length; out.push([...arms.slice(k), ...arms.slice(0, k)]); }
  return out;
}

/** `ollama list`, run only for the model arm: the listed row for the model, or why there is none. */
export function ollamaList(model, timeoutMs = 15000) {
  return new Promise((resolve) => {
    execFile('ollama', ['list'], { timeout: timeoutMs, windowsHide: true }, (err, stdout) => {
      if (err) { resolve({ ran: true, ok: false, error: String(err.code || err.message || err).slice(0, 160), row: null }); return; }
      const rows = String(stdout).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const row = rows.find((l) => l.split(/\s+/)[0] === model) || null;
      resolve({ ran: true, ok: true, listed: rows.length - 1, row, modelListed: !!row });
    });
  });
}

async function askRow(ask, brain, p, arm, cfg) {
  const t0 = process.hrtime.bigint();
  let a = null, error = null;
  try { a = await ask(brain, p.prompt, optsFor(arm, cfg)); } catch (e) { error = String((e && e.message) || e).slice(0, 200); }
  const ns = Number(process.hrtime.bigint() - t0);
  const text = a && typeof a.text === 'string' ? a.text : '';
  const pv = (a && a.provenance) || {};
  const l = pv.llm || {};
  const base = { id: p.id, kind: p.kind, arm, gradeType: p.grade.type, ns, chars: text.length, route: a ? a.route ?? null : null, from: a ? a.from ?? null : null, provenance: pv.answer ?? null };
  // What the model cell did on this row (the model arm only): the tokens it spent, whether it hit maxTokens, its reason.
  const llm = arm === 'model' && a ? {
    provider: l.provider ?? null, ok: l.ok ?? null, ms: l.ms ?? null, tokens: l.tokens ?? null, calls: l.calls ?? (l.provider === 'ollama' ? 1 : 0),
    // capped: a direct model answer that spent the whole maxTokens; null where it cannot be read (no model call, or a
    // region, whose record sums its calls' tokens)
    capped: l.provider === 'ollama' && Number.isFinite(l.tokens) && !pv.region ? l.tokens >= modelBudget(cfg).maxTokens : null, reason: l.reason ?? null,
  } : undefined;
  // A model cell that was asked and not reached leaves this row ABSENT for the model arm, never a refusal.
  if (arm === 'model' && a && (l.fellBack === 'ollama' || (pv.region && pv.region.reached === false))) {
    return { ...base, llm, absent: true, reason: l.reason || 'the model cell was not reached', native: null, refused: null, graded: null, gradedLoose: null };
  }
  const g = await gradeAnswer(text, p);
  // A native answer's text is kept (cut at 1500 characters) so a reader can audit its grade; a refusal keeps its first line.
  return {
    ...base, ...(llm ? { llm } : {}), absent: false, native: g.native, refused: !g.native, graded: g.graded, gradedLoose: g.gradedLoose,
    firstLine: (linesOf(text)[0] || '').slice(0, 120), ...(g.native ? { text: text.slice(0, 1500) } : {}), ...(error ? { error } : {}),
  };
}

export function summarize(rows, gradeable) {
  const present = rows.filter((r) => !r.absent);
  const native = present.filter((r) => r.native);
  const gr = present.filter((r) => r.gradeType !== 'none');
  const correct = gr.filter((r) => r.graded === true).length;
  const correctLoose = gr.filter((r) => r.gradedLoose === true).length;
  const answeredBy = {};
  for (const r of present) { const k = (r.route || 'none') + '/' + (r.from || 'none'); answeredBy[k] = (answeredBy[k] || 0) + 1; }
  return {
    asked: rows.length, present: present.length, absent: rows.length - present.length,
    native: native.length, refused: present.length - native.length,
    nativeShare: present.length ? r4(native.length / present.length) : null,
    refusedShare: present.length ? r4((present.length - native.length) / present.length) : null,
    gradeable: gradeable ?? gr.length, gradeablePresent: gr.length,
    graded: gr.filter((r) => r.graded !== null && r.graded !== undefined).length,
    correct, correctLoose,
    correctShare: gr.length ? r4(correct / gr.length) : null,
    correctLooseShare: gr.length ? r4(correctLoose / gr.length) : null,
    correctOfNative: native.filter((r) => r.graded === true).length,
    gradeableNative: native.filter((r) => r.gradeType !== 'none').length,
    wrongNative: native.filter((r) => r.gradeType !== 'none' && r.graded === false).length,
    wrongNativeIds: native.filter((r) => r.gradeType !== 'none' && r.graded === false).map((r) => r.id),
    errors: rows.filter((r) => r.error).length,
    wallMs: Math.round(present.reduce((t, r) => t + r.ns, 0) / 1e4) / 100,
    ns: { median: median(present.map((r) => r.ns)), p90: quantile(present.map((r) => r.ns), 0.9), nativeMedian: median(native.map((r) => r.ns)), nativeP90: quantile(native.map((r) => r.ns), 0.9), total: present.reduce((t, r) => t + r.ns, 0) },
    answeredBy,
  };
}

/** THE BAR: the full run, the model arm present, refusing nothing (share exactly 0), with no gradeable row left ungraded. */
export const barMetOf = ({ isTheBar, present, refusedShare, ungraded }) => isTheBar === true && present === true && refusedShare === 0 && ungraded === 0;

// ---------------------------------------------------------------- the run
export async function run(opts = {}) {
  const wall0 = Date.now();
  const say = opts.quiet ? () => {} : (s) => console.log(s);
  const set = opts.set || loadPrompts();
  const limit = Number.isFinite(opts.limit) ? Math.floor(opts.limit) : 0;
  const arms = opts.arms ? String(opts.arms).split(',').map((s) => s.trim()).filter((a) => ARMS.includes(a)) : [...ARMS];
  if (!arms.length) throw new Error('--arms takes ' + ARMS.join(', ') + ' (comma separated)');
  const model = opts.model || MODEL_DEFAULT;
  if (!MODELS_ALLOWED.includes(model)) throw new Error('--model takes ' + MODELS_ALLOWED.join(' or ') + ' (never a larger model); got ' + model);
  // base: a test's mock ollama (never set from the command line); listFn: a test's stand in for `ollama list`.
  // instrumentFn: a test's stand in for instrumentOf (to plant a change of code during the run).
  const instrumentFn = typeof opts.instrumentFn === 'function' ? opts.instrumentFn : () => instrumentOf();
  const instrumentStart = instrumentFn();
  const cfg = { model, timeoutMs: opts.timeoutMs, maxTokens: opts.maxTokens, probeMs: opts.probeMs, base: opts.base || null, instrument: instrumentStart.sha };
  const shape = validatePrompts(set);
  const prompts = selectPrompts(set, limit);
  const gradeableRows = prompts.filter((p) => p.grade.type !== 'none');

  const promptMod = await import('../act/prompt.mjs');
  const { ask, knowledgeReady, FALLTHROUGH_HEAD, FALLTHROUGH_TRY } = promptMod;
  const kr = knowledgeReady();
  const knowledge = { ready: !!kr.ok, why: kr.ok ? 'a finished ingest is on this host and the organism arm opens it' : String(kr.reason || '').split(ROOT).join('.') };

  // The model arm: a socket only when asked for by --model-arm; ollama list first, then the probe.
  const modelArm = { selected: arms.includes('model'), requested: !!opts.modelArm, model, present: false, why: null, ollamaList: null, budget: modelBudget(cfg), base: cfg.base ? 'a mock base handed in by the caller' : 'the act/llm.mjs default' };
  if (modelArm.selected && !modelArm.requested) modelArm.why = BOARD_MODEL_OFF;
  else if (!modelArm.selected) modelArm.why = 'not selected (--arms)';
  else {
    modelArm.ollamaList = await (typeof opts.listFn === 'function' ? opts.listFn(model) : ollamaList(model));
    if (!modelArm.ollamaList.ok) modelArm.why = 'ollama list failed: ' + modelArm.ollamaList.error;
    else if (!modelArm.ollamaList.modelListed) modelArm.why = 'ollama list has no row for ' + model;
    else {
      const { probeOllama, OLLAMA_BASE } = await import('../act/llm.mjs');
      const up = await probeOllama(cfg.base || OLLAMA_BASE, modelBudget(cfg).probeMs);
      if (!up) modelArm.why = 'no ollama at the ' + (cfg.base ? 'mock' : 'default') + ' base: /api/tags did not answer';
      else modelArm.present = true;
    }
  }
  const asking = arms.filter((a) => a !== 'model' || modelArm.present);
  // The journal: model rows appended as they land; --resume reuses the rows whose key (id, prompt text, model, budgets) matches.
  const journal = { file: opts.journal ? path.resolve(String(opts.journal)) : null, resume: !!opts.resume, read: 0, torn: 0, reused: 0, appended: 0 };
  const prior = journal.resume && journal.file ? readJournal(journal.file) : { rows: new Map(), torn: 0, lines: 0 };
  journal.read = prior.rows.size; journal.torn = prior.torn;
  if (journal.file) mkdirSync(path.dirname(journal.file), { recursive: true });

  say('\nCONCEIVE: ' + prompts.length + ' of ' + set.prompts.length + ' prompts over ' + new Set(prompts.map((p) => p.kind)).size + ' of ' + set.kinds.length + ' kinds (bench/conceive-prompts.json, the development set, no held out half); gradeable ' + gradeableRows.length);
  say('arms: organism (provider null, knowledge tier ' + (knowledge.ready ? 'open' : 'absent: ' + knowledge.why) + '), organism-site (provider null, knowledge tier off), model (ollama ' + model + '): ' + (modelArm.present ? 'present, ollama list row "' + modelArm.ollamaList.row + '"' : 'ABSENT, ' + modelArm.why));

  say('instrument: sha ' + instrumentStart.sha + ' over ' + instrumentStart.files + ' files on the ask path (act/prompt.mjs sha ' + (instrumentStart.promptMjs ? instrumentStart.promptMjs.sha + ', modified ' + instrumentStart.promptMjs.mtime : 'absent') + ')');
  const brains = {};
  for (const a of asking) brains[a] = await newBrain('conceive-' + a);
  // Warm the ask path the way the endpoint does at cold start (two asks on a throwaway brain, provider null), plus one
  // definitional question so the knowledge store is opened before the first timed row; none of WARM is in the prompt file.
  const warmBrain = await newBrain('conceive-warm');
  for (const q of WARM) await ask(warmBrain, q, { provider: 'null', k: 5, events: [] });
  const rows = [];
  const plan = planArms(prompts.length, arms);
  const loop0 = Date.now();
  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    for (const arm of plan[i]) {
      if (!asking.includes(arm)) { rows.push({ id: p.id, kind: p.kind, arm, gradeType: p.grade.type, absent: true, reason: modelArm.why || 'not asked', native: null, refused: null, graded: null, gradedLoose: null, ns: null, chars: null, route: null, from: null, provenance: null }); continue; }
      if (arm === 'model' && journal.file) {
        const key = journalKey(p, cfg);
        const old = prior.rows.get(key);
        // an absent row (the cell not reached) is asked again, never carried forward
        if (old && !old.absent) { rows.push({ ...old, resumed: true }); journal.reused++; continue; }
        const row = await askRow(ask, brains[arm], p, arm, cfg);
        appendFileSync(journal.file, JSON.stringify({ key, at: new Date().toISOString(), row }) + '\n');
        journal.appended++;
        rows.push(row);
        continue;
      }
      rows.push(await askRow(ask, brains[arm], p, arm, cfg));
    }
    // One progress line every 10 prompts while the model arm is asked: it is the only slow arm.
    if (asking.includes('model') && ((i + 1) % 10 === 0 || i === prompts.length - 1)) {
      const mr = rows.filter((r) => r.arm === 'model');
      say('progress ' + (i + 1) + '/' + prompts.length + ' prompts, wall ' + Math.round((Date.now() - loop0) / 1000) + ' s; model rows ' + mr.length + ': native ' + mr.filter((r) => r.native === true).length + ', refused ' + mr.filter((r) => r.native === false).length + ', absent ' + mr.filter((r) => r.absent).length + (journal.reused ? ', reused from the journal ' + journal.reused : ''));
    }
  }

  // The controls: the rubric on an empty answer (asserted 0), on the prompt echoed, on the organism's own miss text.
  const missText = FALLTHROUGH_HEAD + '\nnothing in memory matches this prompt.\n' + FALLTHROUGH_TRY;
  const control = { empty: { strict: 0, loose: 0, graded: 0, ids: [] }, echo: { strict: 0, ids: [] }, missByRubricAlone: { strict: 0, ids: [] }, parrot: { text: PARROT, refused: 0, strict: 0, loose: 0, ids: [] }, gradeable: gradeableRows.length };
  for (const p of gradeableRows) {
    const s = await rubric('', p.grade, p.prompt), l = await rubricLoose('', p.grade, p.prompt), g = await gradeAnswer('', p);
    if (s || l || g.graded) { control.empty.ids.push(p.id); if (s) control.empty.strict++; if (l) control.empty.loose++; if (g.graded) control.empty.graded++; }
    if (await rubric(p.prompt, p.grade, p.prompt)) { control.echo.strict++; control.echo.ids.push(p.id); }
    if (await rubric(missText, p.grade, p.prompt)) { control.missByRubricAlone.strict++; control.missByRubricAlone.ids.push(p.id); }
    const pg = await gradeAnswer(PARROT, p);
    if (!pg.native) control.parrot.refused++;
    if (pg.graded) { control.parrot.strict++; control.parrot.ids.push(p.id); }
    if (pg.gradedLoose) control.parrot.loose++;
  }
  control.emptyGradesZero = control.empty.ids.length === 0;

  const instrumentEnd = instrumentFn();
  const instrument = { ...instrumentStart, endSha: instrumentEnd.sha, stable: instrumentEnd.sha === instrumentStart.sha, endPromptMjs: instrumentEnd.promptMjs };
  const copy = copyCheck(set.prompts);
  const armStats = {};
  for (const a of ARMS) armStats[a] = { selected: arms.includes(a), ...summarize(rows.filter((r) => r.arm === a), gradeableRows.length) };
  for (const a of ARMS) armStats[a].armPresent = arms.includes(a) && (a !== 'model' || modelArm.present);
  const kinds = {};
  for (const k of set.kinds) {
    const mine = prompts.filter((p) => p.kind === k);
    if (!mine.length) continue;
    kinds[k] = { n: mine.length, gradeable: mine.filter((p) => p.grade.type !== 'none').length };
    for (const a of ARMS) {
      const s = summarize(rows.filter((r) => r.arm === a && r.kind === k));
      kinds[k][a] = { nativeShare: s.nativeShare, refusedShare: s.refusedShare, correctShare: s.correctShare, native: s.native, refused: s.refused, correct: s.correct, present: s.present };
    }
  }
  const refusesAll = (a) => Object.entries(kinds).filter(([, v]) => v[a].present > 0 && v[a].native === 0).map(([k]) => k);
  const kindsRefusedAll = { organism: refusesAll('organism'), 'organism-site': refusesAll('organism-site'), model: modelArm.present ? refusesAll('model') : null };

  const checks = {
    promptsAtLeast200: set.prompts.length >= 200,
    kindsAtLeast20: set.kinds.length >= 20,
    promptShapeSound: shape.length === 0,
    emptyAnswerGradesZero: control.emptyGradesZero,
    noPromptCopied: copy.copied.length === 0,
    everyPromptGotEverySelectedArm: prompts.every((p) => arms.every((a) => rows.some((r) => r.id === p.id && r.arm === a))),
    absentRowsCarryAReason: rows.every((r) => !r.absent || !!r.reason),
    nullArmsNeverAbsent: rows.every((r) => r.arm === 'model' || !r.absent),
    askPathStableDuringRun: instrument.stable,
  };
  const full = limit <= 0 && arms.length === ARMS.length;
  const isTheBar = full && Object.values(checks).every(Boolean);
  const m = armStats.model;
  const modelUngraded = modelArm.present ? rows.filter((r) => r.arm === 'model' && r.gradeType !== 'none' && (r.absent || r.graded === null || r.graded === undefined)).length : null;
  const barMet = barMetOf({ isTheBar, present: modelArm.present, refusedShare: m.refusedShare, ungraded: modelUngraded });
  const wroteTo = full ? VERDICTS.bar : VERDICTS.partial;
  const o = armStats.organism, st = armStats['organism-site'];
  const wallMs = Date.now() - wall0;

  const nsLine = (s) => 'median ' + s.ns.median + ' ns per ask, ' + s.ns.nativeMedian + ' ns per native answer';
  const statement = 'Asked ' + prompts.length + ' prompts a person conceives, over ' + Object.keys(kinds).length + ' kinds from arithmetic and code to poems, riddles and small talk, the organism alone (no language model, no socket) answered '
    + o.native + ' natively (' + pct(o.nativeShare) + ') and said it does not carry the other ' + o.refused + ' (' + pct(o.refusedShare) + '); of the ' + o.gradeablePresent + ' prompts with a rubric that needs no model, '
    + o.correct + ' of its answers passed (' + pct(o.correctShare) + ' strict, ' + pct(o.correctLooseShare) + ' under IFEval\'s loose reading), at a ' + nsLine(o) + '. '
    + 'With its knowledge tier off, as on dilation.dev where no ingested store is deployed, it answered ' + st.native + ' (' + pct(st.nativeShare) + ') and passed ' + st.correct + ' (' + pct(st.correctShare) + '). '
    + 'It refuses every prompt of ' + kindsRefusedAll.organism.length + ' of ' + Object.keys(kinds).length + ' kinds' + (kindsRefusedAll.organism.length ? ' (' + kindsRefusedAll.organism.join(', ') + ')' : '') + '. '
    + 'Of the organism\'s native answers to prompts with a rubric, ' + o.wrongNative + ' of ' + o.gradeableNative + ' failed it (given with confidence and wrong by the rubric' + (o.wrongNativeIds.length ? ': ' + o.wrongNativeIds.join(', ') : '') + '). '
    + (modelArm.present
      ? 'With its model cell (ollama ' + model + ', maxTokens ' + modelArm.budget.maxTokens + ', ' + modelArm.budget.timeoutMs + ' ms a call) it answered ' + m.native + ' of ' + m.present + ' natively (' + pct(m.nativeShare) + '), refused ' + m.refused + ' (' + pct(m.refusedShare) + '), was not reached on ' + m.absent + ', and passed ' + m.correct + ' of ' + m.gradeablePresent + ' rubrics (' + pct(m.correctShare) + ' strict, ' + pct(m.correctLooseShare) + ' loose); ' + m.wrongNative + ' of its native gradeable answers failed their rubric; the arm took ' + Math.round(m.wallMs / 1000) + ' s of asks. '
        + (barMet ? 'The bar is met: that arm refused nothing and every gradeable answer was graded. ' : 'The bar is not met: ' + (m.refused ? m.refused + ' refusal(s)' : '') + (m.refused && modelUngraded ? ' and ' : '') + (modelUngraded ? modelUngraded + ' gradeable row(s) not graded' : '') + (!m.refused && !modelUngraded && !isTheBar ? 'this run is narrow, not the bar' : '') + '. ')
      : 'The organism with its model cell was not measured in this run (' + modelArm.why + '), so the bar, which asks that arm to refuse nothing and to have every gradeable answer graded, is not met. ')
    + 'The controls: an empty answer passes ' + control.empty.ids.length + ' of ' + control.gradeable + ' rubrics, the prompt echoed back passes ' + control.echo.strict + ', and a refusal is graded false before any rubric runs; a parrot that answers "' + PARROT + '" to every prompt refuses nothing (it would meet the refusal half of the bar) and passes ' + control.parrot.strict + ' of ' + control.gradeable + ' rubrics, which is why the correct count is printed beside the refusal share. The rubrics check form and keywords, not truth: a passing answer can still be wrong in ways only a reader would see.';

  const verdict = {
    at: new Date().toISOString(),
    command: 'node bench/conceive.mjs --limit ' + limit + (arms.length < ARMS.length ? ' --arms ' + arms.join(',') : '') + (opts.modelArm ? ' --model-arm --model ' + model : '')
      + (Number.isFinite(opts.maxTokens) ? ' --maxTokens ' + opts.maxTokens : '') + (Number.isFinite(opts.timeoutMs) ? ' --timeoutMs ' + opts.timeoutMs : '')
      + (journal.file ? ' --journal <scratch journal>' + (journal.resume ? ' --resume' : '') : ''),
    node: process.version,
    isTheBar,
    barMet,
    notTheBarBecause: isTheBar ? null : (!full ? 'narrow: --limit ' + limit + ', arms ' + arms.join(',') : 'a structural check failed: ' + Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', ')),
    barRule: 'isTheBar: --limit 0, every arm selected, every structural check true (the ask path unchanged from the first ask to the last among them). barMet: the model arm is present, its refused share is 0, and every gradeable row it answered was graded (no absent row, no null grade).',
    barBlockedBy: barMet ? null : (!modelArm.present ? 'the model arm is absent: ' + modelArm.why : !isTheBar ? 'not the bar run' : 'the model arm refused or left gradeable rows ungraded'),
    nextCommand: modelArm.present ? null : MODEL_ARM_COMMAND,
    instrument: { ...instrument, what: 'sha256 over the path and bytes of every file reachable by relative import from act/prompt.mjs, bench/conceive.mjs and seeds/basic.mjs, taken before the first ask and after the last; the wrong native ids and every count here belong to that code' },
    wroteTo,
    wallMs,
    prompts: { file: 'bench/conceive-prompts.json', total: set.prompts.length, asked: prompts.length, kinds: set.kinds.length, gradeable: gradeableRows.length, byType: Object.fromEntries(GRADE_TYPES.map((t) => [t, prompts.filter((p) => p.grade.type === t).length])), shapeProblems: shape },
    knowledge,
    warm: { asks: WARM, what: 'asked once on a throwaway brain before the first timed row, provider null, so no row pays a first call module or store cost' },
    model: { ...modelArm, ungradedGradeableRows: modelUngraded, capped: rows.filter((r) => r.arm === 'model' && r.llm && r.llm.capped === true).length, llmCalls: rows.filter((r) => r.arm === 'model' && r.llm).reduce((t, r) => t + (Number.isFinite(r.llm.calls) ? r.llm.calls : 0), 0) },
    journal: { ...journal, file: journal.file ? 'a scratch file (' + path.basename(journal.file) + '), never committed' : null },
    walls: { runMs: wallMs, armsMs: Object.fromEntries(ARMS.map((a) => [a, armStats[a].wallMs])), what: 'an arm\'s wall is the sum of its ask() calls on process.hrtime.bigint (rows reused from the journal carry the ns of the run that asked them); the run\'s wall is Date.now() around the whole run' },
    arms: armStats,
    armsWhat: {
      organism: 'act/prompt.mjs ask() on seeds/basic.mjs seedBasic, provider null, k 5 (the endpoint\'s options); the knowledge tier open when this host holds a finished ingest',
      'organism-site': 'the same with knowledge: false, the one difference the deployed host has (no ingested store); nothing else about that host is modelled',
      model: 'the same ask() with provider ollama and model ' + model + ' (knowledge tier as the organism arm, maxTokens ' + modelArm.budget.maxTokens + ', timeout ' + modelArm.budget.timeoutMs + ' ms a call), asked only with --model-arm',
    },
    kinds,
    kindsRefusedAll,
    rubric: {
      strict: 'the rubric on the answer text as given',
      loose: 'IFEval loose accuracy (Zhou et al. 2023, arXiv 2311.07911): the rubric passes on any of eight variants, the text, without its first line, without its last line, without both, each with every * removed; code is graded strict only',
      nativeGate: 'a refusal (a text that starts with a miss head, or an empty text) is graded false before the rubric runs',
      missHeads: MISS_HEADS,
      measures: 'answers, keywords, counts and formats a program can check',
      doesNotMeasure: 'truth beyond the stated answer or keyword, quality, style, or whether a greeting, an opinion or a joke is any good (those rows are type none)',
    },
    control: {
      what: 'the rubric run on an empty answer must grade 0 for every gradeable row (strict, loose and through the native gate); printed beside it, the prompt echoed back, the organism\'s own miss text graded by the rubric alone, and the parrot (one constant answer to every prompt: it refuses nothing, so the refusal half of the bar alone cannot tell it from a mind; its rubric passes are the floor for the correct count)',
      ...control,
    },
    split: {
      development: { what: 'bench/conceive-prompts.json, every prompt: the rubrics were written with the prompts, before any arm answered; no tier, threshold or rubric was fit to a score on them', n: set.prompts.length },
      heldOut: 'none',
      whyNoHeldOut: 'this is a census of what the organism answers across kinds, not a tuned score: nothing is selected or fit on these rows, so there is nothing a held out half would guard',
      contaminated: copy.copied.length ? 'copied prompts: ' + copy.copied.map((c) => c.id + ' from ' + c.source).join(', ') : false,
      contaminationReason: copy.copied.length ? null : 'the prompts were written for this file by the board 29 builder (item conceive) and kept by the board 31 re-run; copyCheck found 0 of ' + copy.checked + ' prompts in ' + copy.sources.filter((s) => s.present).map((s) => s.file).join(', ') + (copy.sources.some((s) => !s.present) ? ' (absent on this host, so not checked: ' + copy.sources.filter((s) => !s.present).map((s) => s.file).join(', ') + ')' : ''),
      copyCheck: copy,
    },
    checks,
    statement,
    rows,
  };
  if (opts.write !== false) {
    mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
    writeFileSync(path.join(ROOT, wroteTo), JSON.stringify(verdict, null, 1) + '\n');
  }

  // ---- print
  const armLine = (a) => {
    const s = armStats[a];
    if (!s.selected) return a.padEnd(14) + 'not selected';
    if (a === 'model' && !modelArm.present) return a.padEnd(14) + 'ABSENT: ' + modelArm.why;
    return a.padEnd(14) + String(s.present).padStart(6) + String(s.native).padStart(8) + String(s.refused).padStart(9) + pct(s.nativeShare).padStart(9) + pct(s.refusedShare).padStart(10)
      + (s.correct + '/' + s.gradeablePresent).padStart(10) + pct(s.correctShare).padStart(9) + pct(s.correctLooseShare).padStart(9) + String(s.ns.median).padStart(12) + String(s.ns.nativeMedian).padStart(12) + String(s.ns.p90).padStart(12);
  };
  say('\n' + 'arm'.padEnd(14) + 'asked'.padStart(6) + 'native'.padStart(8) + 'refused'.padStart(9) + 'native%'.padStart(9) + 'refused%'.padStart(10) + 'correct'.padStart(10) + 'strict%'.padStart(9) + 'loose%'.padStart(9) + 'med ns'.padStart(12) + 'med ns nat'.padStart(12) + 'p90 ns'.padStart(12));
  for (const a of ARMS) say(armLine(a));
  for (const a of ARMS) if (armStats[a].selected && armStats[a].present > 0) say('  ' + a + ' answered by route/from: ' + Object.entries(armStats[a].answeredBy).sort((x, y) => y[1] - x[1]).map(([k, v]) => k + ' ' + v).join(', ') + (armStats[a].errors ? '; ask() threw on ' + armStats[a].errors : ''));
  for (const a of ARMS) if (armStats[a].selected && armStats[a].present > 0) say('  ' + a + ' wrong native (a native answer that fails its rubric): ' + armStats[a].wrongNative + ' of ' + armStats[a].gradeableNative + (armStats[a].wrongNativeIds.length ? ' (' + armStats[a].wrongNativeIds.join(', ') + ')' : ''));
  if (modelArm.present) say('  model cell: ' + verdict.model.llmCalls + ' calls, ' + verdict.model.capped + ' direct answers hit maxTokens ' + modelArm.budget.maxTokens + ', ' + armStats.model.absent + ' rows not reached' + (journal.file ? '; journal appended ' + journal.appended + ', reused ' + journal.reused + (journal.torn ? ', torn lines ' + journal.torn : '') : ''));
  say('wall: organism ' + armStats.organism.wallMs + ' ms, organism-site ' + armStats['organism-site'].wallMs + ' ms, model ' + (modelArm.present ? Math.round(armStats.model.wallMs) + ' ms' : 'absent') + ' (each the sum of its asks); the whole run ' + wallMs + ' ms');
  say('\nper kind, native% / refused% / correct% (correct over the kind\'s gradeable rows):');
  say('kind'.padEnd(16) + 'n'.padStart(4) + 'gr'.padStart(4) + '  ' + 'organism'.padEnd(28) + 'organism-site'.padEnd(28) + 'model');
  const cell = (v) => (v.present ? [pct(v.nativeShare), pct(v.refusedShare), v.correctShare === null ? '-' : pct(v.correctShare)].join(' / ') : 'absent');
  for (const [k, v] of Object.entries(kinds)) say(k.padEnd(16) + String(v.n).padStart(4) + String(v.gradeable).padStart(4) + '  ' + cell(v.organism).padEnd(28) + cell(v['organism-site']).padEnd(28) + cell(v.model));
  say('\nkinds where the organism alone refuses every prompt (' + kindsRefusedAll.organism.length + ' of ' + Object.keys(kinds).length + '): ' + (kindsRefusedAll.organism.join(', ') || 'none'));
  say('kinds where organism-site refuses every prompt (' + kindsRefusedAll['organism-site'].length + ' of ' + Object.keys(kinds).length + '): ' + (kindsRefusedAll['organism-site'].join(', ') || 'none'));
  say('\ncontrol: an empty answer passes ' + control.empty.ids.length + ' of ' + control.gradeable + ' gradeable rubrics (strict ' + control.empty.strict + ', loose ' + control.empty.loose + ', through the native gate ' + control.empty.graded + ')'
    + '; the prompt echoed passes ' + control.echo.strict + (control.echo.ids.length ? ' (' + control.echo.ids.join(', ') + ')' : '')
    + '; the miss text passes ' + control.missByRubricAlone.strict + ' by the rubric alone' + (control.missByRubricAlone.ids.length ? ' (' + control.missByRubricAlone.ids.join(', ') + '), all graded false by the native gate' : ''));
  say('control (parrot): "' + PARROT + '" to every prompt refuses ' + control.parrot.refused + ' of ' + control.gradeable + ' and passes ' + control.parrot.strict + ' strict, ' + control.parrot.loose + ' loose' + (control.parrot.ids.length ? ' (' + control.parrot.ids.join(', ') + ')' : ''));
  say('copy check: ' + copy.copied.length + ' of ' + copy.checked + ' prompts found in ' + copy.sources.filter((s) => s.present).map((s) => s.file + ' (' + s.strings + ' strings)').join(', ') + (copy.sources.some((s) => !s.present) ? '; absent: ' + copy.sources.filter((s) => !s.present).map((s) => s.file).join(', ') : ''));
  say('instrument at the end: sha ' + instrument.endSha + (instrument.stable ? ', unchanged during the run' : ', CHANGED during the run (act/prompt.mjs ' + (instrument.endPromptMjs ? instrument.endPromptMjs.sha + ' modified ' + instrument.endPromptMjs.mtime : 'absent') + '): this run is not the bar'));
  say('checks: ' + Object.entries(checks).map(([k, v]) => k + ' ' + v).join(', '));
  say('\n' + statement + '\n');
  return verdict;
}

// ---------------------------------------------------------------- cli
export const FLAGS = Object.freeze({
  limit: 'number', arms: 'string', model: 'string', timeoutMs: 'number', maxTokens: 'number', probeMs: 'number',
  journal: 'string', resume: 'bool',
  'model-arm': 'bool', quiet: 'bool', json: 'bool', nowrite: 'bool', help: 'bool',
});
export const USAGE = [
  'node bench/conceive.mjs [--limit N] [--arms organism,organism-site,model] [--model-arm] [--model qwen3:1.7b]',
  '                        [--timeoutMs ms] [--maxTokens n] [--probeMs ms] [--journal PATH] [--resume]',
  '                        [--quiet] [--json] [--nowrite] [--help]',
  '',
  '--limit 0 (every prompt) with every arm writes ' + VERDICTS.bar + ' (isTheBar); --limit N writes ' + VERDICTS.partial + '.',
  'The model arm opens a socket only with --model-arm (ollama list first; ' + MODELS_ALLOWED.join(' or ') + ' only); otherwise it is absent with its reason.',
  'Its budgets default to maxTokens ' + MODEL_BUDGET.maxTokens + ' and ' + MODEL_BUDGET.timeoutMs + ' ms a call. --journal appends each model row to PATH; --resume reuses its rows.',
].join('\n');

/** The parsed flags and everything wrong with them; the caller runs nothing when bad is not empty. */
export function args(argv) {
  const out = {}, bad = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { bad.push('stray argument ' + JSON.stringify(a)); continue; }
    const k = a.slice(2);
    const kind = FLAGS[k];
    if (!kind) { bad.push('unknown flag --' + k); continue; }
    if (kind === 'bool') { out[k] = true; continue; }
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) { bad.push('--' + k + ' needs a value'); continue; }
    i++;
    if (kind === 'number') { if (!/^\d+$/.test(v)) { bad.push('--' + k + ' needs a whole number, got ' + JSON.stringify(v)); continue; } out[k] = Number(v); continue; }
    out[k] = v;
  }
  if (out.model !== undefined && !MODELS_ALLOWED.includes(out.model)) bad.push('--model takes ' + MODELS_ALLOWED.join(' or ') + ', got ' + JSON.stringify(out.model));
  if (out.arms !== undefined && !String(out.arms).split(',').every((s) => ARMS.includes(s.trim()))) bad.push('--arms takes ' + ARMS.join(', ') + ', got ' + JSON.stringify(out.arms));
  if (out.resume && !out.journal) bad.push('--resume needs --journal PATH');
  return { opts: out, bad };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const parsed = args(process.argv.slice(2));
  const a = parsed.opts;
  if (parsed.bad.length) {
    console.error('bench/conceive.mjs ran nothing, because of ' + parsed.bad.length + ': ' + parsed.bad.join('; ') + '\n\n' + USAGE);
    process.exitCode = 2;
  } else if (a.help) {
    console.log(USAGE);
  } else {
    const v = await run({ limit: a.limit ?? 0, arms: a.arms, model: a.model, modelArm: !!a['model-arm'], timeoutMs: a.timeoutMs, maxTokens: a.maxTokens, probeMs: a.probeMs, journal: a.journal, resume: !!a.resume, quiet: !!a.quiet, write: !a.nowrite });
    if (a.json) console.log(JSON.stringify(v, null, 1));
    const s = (x) => v.arms[x];
    console.log('CONCEIVE isTheBar ' + v.isTheBar + ' barMet ' + v.barMet + ': asked ' + v.prompts.asked + ' prompts over ' + Object.keys(v.kinds).length + ' kinds; '
      + ['organism', 'organism-site', 'model'].map((x) => x + ' ' + (s(x).armPresent ? 'native ' + pct(s(x).nativeShare) + ' refused ' + pct(s(x).refusedShare) + ' correct ' + s(x).correct + '/' + s(x).gradeablePresent : 'absent')).join('; ')
      + '; wall ' + v.wallMs + ' ms' + (a.nowrite ? ', nothing written (--nowrite)' : ', verdict written to ' + v.wroteTo)
      + (v.notTheBarBecause ? '. THIS IS NOT THE BAR: ' + v.notTheBarBecause : ''));
    if (!Object.values(v.checks).every(Boolean)) process.exitCode = 1;
  }
}
