// reason/math.mjs: PROGRAM OF THOUGHT, WITH AN EXACT EXECUTOR.
//
// A word problem is two jobs that one prose answer from a small model does at once and
// badly: reading the problem into quantities and relations, and doing the arithmetic on
// them. This region splits them. The model cell is asked for a short JavaScript function
// solve() that RETURNS a number and never prose; the organism runs that function inside
// act/run.mjs's sandbox (a worker with a heap cap, a pruned vm context with no IO, and a
// wall clock enforced by worker.terminate()), so the arithmetic is the machine's and not
// the model's. k samples are drawn at the model's own temperature with k different seeds
// and voted by value (self-consistency). A sample that throws, times out, prints instead
// of returning, or returns anything that is not a finite number is discarded, never
// counted as a vote.
//
// THE ORDER OF THE PATHS, and the provenance each one prints:
//
//   1. exact        act/solve.mjs (tasks/exact.mjs rationals, tasks/algebra.mjs linear
//                   equations) answers a question it can parse COMPLETELY. No model call.
//   2. model+exact  the vote over programs the model wrote and the organism executed. It
//                   is never labelled native: the model authored the program. The ladder's
//                   native share counts exact and memory only.
//   3. model        every sample failed, so one prose answer is taken from the model cell
//                   and its last number read, exactly as bench/public.mjs reads prose.
//   4. none         nothing produced a number (the null provider lands here).
//
// THE VERIFY ARM (opt in, verify: true): after the vote, one model call is shown the
// question, the winning program and its value, and asked to end with ACCEPT or REJECT. On
// REJECT the region re-samples ONCE: k fresh programs, prompted with the rejected value as
// a caution, voted among themselves; their winner replaces the first one (it may be the
// same value again, which is the fresh samples overruling the checker). A reply with no
// verdict is not a rejection. Whether the arm helps is measured, not assumed: bench/math.mjs
// runs k=5 with and without it on the same records.
//
// SEEDS. Sample i of the first round uses seed + i, the verify call seed + 100, re-sample
// i seed + 200 + i, and the prose fallback seed + 300. So a k=1 run draws exactly the first
// sample of a k=5 run at the same seed, which is what lets bench/math.mjs compare nested
// arms on identical draws.
//
// THE MODEL ARGUMENT. solveMath({ model }) takes a function (a mocked cell: it is handed
// { prompt, seed, maxTokens, purpose, index } and returns { text, ok, ms, tokens } or a
// string), a string (an Ollama model name), an object of act/llm.mjs complete() options
// (provider, model, base, probeMs, timeoutMs, maxTokens, think, numCtx), or nothing (the
// deterministic null provider, which opens no socket). Tests only ever pass functions.
import { performance } from 'node:perf_hooks';
import { complete } from '../act/llm.mjs';
import { runCases } from '../act/run.mjs';
import { solve as solveExact } from '../act/solve.mjs';

export const PROVENANCES = Object.freeze(['exact', 'model+exact', 'model', 'none']);

export const DEFAULTS = Object.freeze({
  k: 5,               // samples in the vote
  timeoutMs: 2000,    // wall clock per program, enforced by worker.terminate()
  memoryMB: 64,       // the sandbox worker's old generation cap
  maxTokens: 3000,    // per sample; bench/public.mjs uses 3000 on GSM8K for the same model
  verifyMaxTokens: 2000,
  seed: 1,
});

export const SEED_OFFSETS = Object.freeze({ sample: 0, verify: 100, resample: 200, prose: 300 });

const THINK_RE = /<think>[\s\S]*?<\/think>/gi;
const r3 = (x) => Math.round(x * 1000) / 1000;

// ---------------------------------------------------------------- prompts
/** The program-of-thought prompt. It asks for code only: the value comes from running it. */
export function potPrompt(question) {
  return [
    'Solve this math word problem by writing a JavaScript program.',
    '',
    'PROBLEM: ' + String(question ?? ''),
    '',
    'Write ONE function named solve that takes no arguments and RETURNS the final answer as a single JavaScript number.',
    '- Give each quantity in the problem its own named variable, then compute the answer step by step.',
    '- Return a number: never a string, never an object, never a unit or a currency sign.',
    '- The function runs in a sandbox with only Math, Number, Array and Object: no console, no Date, no require, no input.',
    '- Reply with the function in one ```javascript code block and nothing after the block.',
  ].join('\n');
}

/** The re-sample prompt after a REJECT: the same request with the rejected value as a caution. */
export function resamplePrompt(question, rejected) {
  return potPrompt(question) + '\n\n'
    + 'A previous program for this problem returned ' + String(rejected) + ', and a checker judged that answer WRONG. '
    + 'Read the problem again, find the mistake, and write a corrected solve().';
}

/** The verify prompt: the question, the winning program and its value, ACCEPT or REJECT. */
export function verifyPrompt(question, program, value) {
  return [
    'A student wrote a JavaScript program to answer a math word problem. Check it.',
    '',
    'PROBLEM: ' + String(question ?? ''),
    '',
    'PROGRAM:',
    '```javascript',
    String(program ?? ''),
    '```',
    '',
    'The program returns ' + String(value) + '.',
    '',
    'Does the program model the problem correctly, so that ' + String(value) + ' is the right final answer? '
      + 'Check every quantity and every step against the problem.',
    'End your reply with one line that is exactly ACCEPT or exactly REJECT.',
  ].join('\n');
}

/** The prose prompt, the shape bench/public.mjs ALONE_PROMPT gives every GSM8K arm. */
export function prosePrompt(question) {
  return String(question ?? '') + '\n\nAnswer with the final number.';
}

// ---------------------------------------------------------------- reading the model
/**
 * The program out of a model answer, or null. The last fenced block that mentions solve,
 * else the last fenced block, else the text from `function solve(` on. A thinking block cut
 * off by the token budget holds no program. Module keywords and top level console calls are
 * the model's habits, not its answer, and the sandbox has neither, so they are removed.
 * @param {string} text
 * @returns {string|null}
 */
export function extractProgram(text) {
  let t = String(text ?? '').replace(THINK_RE, ' ');
  t = t.replace(/<think>[\s\S]*$/i, ' ');
  const fences = [...t.matchAll(/```[a-zA-Z]*[ \t]*\r?\n([\s\S]*?)```/g)].map((m) => m[1]);
  let code = null;
  for (let i = fences.length - 1; i >= 0; i--) if (/\bsolve\b/.test(fences[i])) { code = fences[i]; break; }
  if (code === null && fences.length) code = fences[fences.length - 1];
  if (code === null) {
    const m = /function\s+solve\s*\(/.exec(t);
    if (!m) return null;
    code = t.slice(m.index);
  }
  code = code.replace(/^[ \t]*export[ \t]+(?:default[ \t]+)?/gm, '');
  code = code.replace(/^[ \t]*module\.exports[^\n]*$/gm, '');
  code = code.replace(/^console\.[A-Za-z]+\([^\n]*$/gm, '');
  code = code.trim();
  return code.length ? code : null;
}

/**
 * The last number in prose, decimals included, thousands commas removed: the rule
 * bench/public.mjs lastNumber() reads every GSM8K prose arm with, restated here so this
 * region does not import a bench.
 * @param {string} text
 * @returns {string|null}
 */
export function lastNumber(text) {
  const t = String(text ?? '').replace(THINK_RE, ' ').replace(/(\d),(?=\d\d\d\b)/g, '$1');
  const ms = [...t.matchAll(/-?\d+(?:\.\d+)?/g)];
  return ms.length ? ms[ms.length - 1][0] : null;
}

/**
 * ACCEPT, REJECT, or null for a reply that says neither. The LAST occurrence wins, because
 * a checker that quotes the instruction ("ACCEPT or REJECT") before deciding has not decided.
 * @param {string} text
 * @returns {'accept'|'reject'|null}
 */
export function parseVerdict(text) {
  const t = String(text ?? '').replace(THINK_RE, ' ');
  const ms = [...t.matchAll(/\b(ACCEPT|REJECT)(?:ED|S)?\b/gi)];
  if (!ms.length) return null;
  return ms[ms.length - 1][1].toLowerCase() === 'reject' ? 'reject' : 'accept';
}

// ---------------------------------------------------------------- the executor
/**
 * Run one program inside act/run.mjs's sandbox and read its value. Only a finite number
 * counts: a string, a BigInt, NaN, an object, undefined, a throw, a syntax error, a missing
 * solve() and a timeout are each a discarded sample with the reason recorded.
 * @param {string} code
 * @param {{timeoutMs?: number, memoryMB?: number}} [opts]
 * @returns {Promise<{ok: boolean, value: number|null, error: string|null, timedOut: boolean, ms: number}>}
 */
export async function runProgram(code, opts = {}) {
  const timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? opts.timeoutMs : DEFAULTS.timeoutMs;
  const memoryMB = Number.isFinite(opts.memoryMB) && opts.memoryMB > 0 ? opts.memoryMB : DEFAULTS.memoryMB;
  const t0 = performance.now();
  const r = await runCases(String(code ?? ''), [{ args: [], expected: null }], { limitMs: timeoutMs, memoryMB, entry: 'solve' });
  const ms = r3(performance.now() - t0);
  const row = r.cases[0];
  if (!row) return { ok: false, value: null, error: 'no case ran', timedOut: false, ms };
  const timedOut = typeof row.error === 'string' && row.error.startsWith('timeout');
  if (row.error) return { ok: false, value: null, error: row.error, timedOut, ms };
  if (typeof row.got !== 'number' || !Number.isFinite(row.got)) {
    return { ok: false, value: null, error: 'returned a non-number: ' + JSON.stringify(row.got).slice(0, 80), timedOut: false, ms };
  }
  return { ok: true, value: row.got, error: null, timedOut: false, ms };
}

// ---------------------------------------------------------------- the vote
/**
 * The key a value votes under. Twelve significant digits absorb binary float noise
 * (0.1 + 0.2 and 0.3 are one vote, 17.999999999999996 and 18 are one vote) and nothing a
 * word problem's answer could mean.
 * @param {number} x
 * @returns {string|null}
 */
export function valueKey(x) {
  if (typeof x !== 'number' || !Number.isFinite(x)) return null;
  const v = Number(x.toPrecision(12));
  return String(v === 0 ? 0 : v);
}

/** A voted value as the answer string: the key's spelling, so 18.000000000001 prints 18. */
export function renderAnswer(x) {
  const k = valueKey(x);
  return k === null ? null : k;
}

/**
 * Self-consistency by value. The most votes wins; a tie goes to an integer value over a
 * non-integer one (a count of things is an integer far more often than not), then to the
 * value whose first sample came earliest, so the rule is total and deterministic.
 * @param {{ok: boolean, value: number}[]} samples
 * @returns {{value: number|null, key: string|null, count: number, valid: number, of: number,
 *   winner: number, tie: boolean, tied: string[], groups: {key: string, count: number, first: number}[]}}
 */
export function vote(samples) {
  const list = Array.isArray(samples) ? samples : [];
  const groups = new Map();
  let valid = 0;
  list.forEach((s, i) => {
    if (!s || !s.ok) return;
    const key = valueKey(s.value);
    if (key === null) return;
    valid++;
    let g = groups.get(key);
    if (!g) { g = { key, value: Number(key), count: 0, first: i }; groups.set(key, g); }
    g.count++;
  });
  const gs = [...groups.values()];
  if (!gs.length) return { value: null, key: null, count: 0, valid: 0, of: list.length, winner: -1, tie: false, tied: [], groups: [] };
  const isInt = (g) => (Number.isInteger(g.value) ? 1 : 0);
  gs.sort((a, b) => (b.count - a.count) || (isInt(b) - isInt(a)) || (a.first - b.first));
  const top = gs[0];
  const tied = gs.filter((g) => g.count === top.count).map((g) => g.key);
  return {
    value: top.value, key: top.key, count: top.count, valid, of: list.length, winner: top.first,
    tie: tied.length > 1, tied, groups: gs.map(({ key, count, first }) => ({ key, count, first })),
  };
}

// ---------------------------------------------------------------- the model cell
function normalize(r) {
  if (typeof r === 'string') return { text: r, ok: true, provider: 'mock', model: null, ms: 0, tokens: null, reason: null };
  const o = r || {};
  return {
    text: String(o.text ?? ''), ok: o.ok !== false, provider: o.provider ?? null, model: o.model ?? null,
    ms: Number.isFinite(o.ms) ? o.ms : 0, tokens: Number.isFinite(o.tokens) ? o.tokens : null,
    reason: o.reason ?? null,
  };
}

/**
 * The model argument as one async function of { prompt, seed, maxTokens, purpose, index }.
 * @param {Function|string|object|null} model
 */
export function makeCell(model) {
  if (typeof model === 'function') {
    return async (req) => {
      const t0 = performance.now();
      const r = normalize(await model(req));
      if (!r.ms) r.ms = r3(performance.now() - t0);
      return r;
    };
  }
  let base;
  if (model === null || model === undefined) base = { provider: 'null' };
  else if (typeof model === 'string') base = { provider: 'ollama', model };
  else base = { ...model };
  return async (req) => normalize(await complete({
    ...base, prompt: req.prompt, seed: req.seed,
    maxTokens: Number.isInteger(req.maxTokens) ? req.maxTokens : base.maxTokens,
  }));
}

// ---------------------------------------------------------------- solveMath
/**
 * Answer one math question: exact path, then k voted programs, then (on request) the
 * verifier, then one prose answer when every program failed.
 *
 * @param {object} opts
 *   question    the problem text; it reaches the exact parser, the model and nothing else
 *   model       a function, an Ollama model name, complete() options, or nothing (null provider)
 *   k           samples in the vote, default 5
 *   timeoutMs   wall clock per program in the sandbox, default 2000
 *   verify      true runs the verify arm, default false
 *   seed        the base seed, default 1 (see SEED OFFSETS above)
 *   maxTokens   per sample, default 3000; verifyMaxTokens for the checker, default 2000
 *   memoryMB    the sandbox worker's heap cap, default 64
 *   exact       false skips the exact path (a bench measuring the model arms alone)
 * @returns {Promise<{answer: string|null, provenance: string, samples: object[], program: string|null,
 *   calls: number, ms: number, modelMs: number, execMs: number, allFailed: boolean,
 *   vote: object|null, verify: object|null, fallback: object|null, exact: object|null}>}
 */
export async function solveMath(opts = {}) {
  const t0 = performance.now();
  const question = String(opts.question ?? '');
  const k = Number.isInteger(opts.k) && opts.k > 0 ? opts.k : DEFAULTS.k;
  const timeoutMs = Number.isFinite(opts.timeoutMs) && opts.timeoutMs > 0 ? opts.timeoutMs : DEFAULTS.timeoutMs;
  const memoryMB = Number.isFinite(opts.memoryMB) && opts.memoryMB > 0 ? opts.memoryMB : DEFAULTS.memoryMB;
  const maxTokens = Number.isInteger(opts.maxTokens) && opts.maxTokens > 0 ? opts.maxTokens : DEFAULTS.maxTokens;
  const verifyMaxTokens = Number.isInteger(opts.verifyMaxTokens) && opts.verifyMaxTokens > 0 ? opts.verifyMaxTokens : DEFAULTS.verifyMaxTokens;
  const seed = Number.isInteger(opts.seed) ? opts.seed : DEFAULTS.seed;
  const out = {
    answer: null, provenance: 'none', samples: [], program: null, calls: 0, ms: 0, modelMs: 0, execMs: 0,
    allFailed: false, vote: null, verify: null, fallback: null, exact: null,
  };
  const done = () => { out.ms = r3(performance.now() - t0); out.modelMs = r3(out.modelMs); out.execMs = r3(out.execMs); return out; };

  // 1. the exact path: a question act/solve.mjs parses completely needs no model at all
  if (opts.exact !== false) {
    let s = null;
    try { s = solveExact(question); } catch { s = null; }
    if (s && s.answer !== null && s.answer !== undefined) {
      out.answer = String(s.answer);
      out.provenance = 'exact';
      out.exact = { method: s.method, steps: s.steps || [] };
      return done();
    }
  }

  const cell = makeCell(opts.model);
  const ask = async (req) => {
    out.calls++;
    const r = await cell(req);
    out.modelMs += r.ms;
    return r;
  };
  const draw = async (prompt, seed0, purpose) => {
    const samples = [];
    for (let i = 0; i < k; i++) {
      const s = seed0 + i;
      const r = await ask({ prompt, seed: s, maxTokens, purpose, index: i });
      const row = { i, seed: s, ok: false, value: null, stage: null, error: null, program: null, tokens: r.tokens, callMs: r3(r.ms), execMs: 0 };
      if (!r.ok) {
        row.stage = 'model';
        row.error = 'the model cell was not reached: ' + String(r.reason || 'no reason given');
      } else {
        const code = extractProgram(r.text);
        if (!code) {
          row.stage = 'extract';
          row.error = 'no program in the answer (' + String(r.text).length + ' chars)';
        } else {
          row.program = code;
          const run = await runProgram(code, { timeoutMs, memoryMB });
          out.execMs += run.ms;
          row.execMs = run.ms;
          row.ok = run.ok;
          row.value = run.value;
          row.error = run.error;
          row.stage = run.ok ? 'ran' : (run.timedOut ? 'timeout' : 'run');
        }
      }
      samples.push(row);
    }
    return samples;
  };

  // 2. k programs, executed, voted
  out.samples = await draw(potPrompt(question), seed + SEED_OFFSETS.sample, 'sample');
  let v = vote(out.samples);
  let program = v.value !== null ? out.samples[v.winner].program : null;
  out.vote = { key: v.key, count: v.count, valid: v.valid, of: v.of, tie: v.tie, tied: v.tied, groups: v.groups };

  // 3. the verify arm: one checker call, and on REJECT one re-sampling round
  if (opts.verify && v.value !== null) {
    const before = renderAnswer(v.value);
    const r = await ask({ prompt: verifyPrompt(question, program, before), seed: seed + SEED_OFFSETS.verify, maxTokens: verifyMaxTokens, purpose: 'verify', index: 0 });
    const verdict = r.ok ? parseVerdict(r.text) : null;
    out.verify = { reached: r.ok, verdict, before, after: before, resampled: false, changed: false, resamples: [], vote: null };
    if (verdict === 'reject') {
      const fresh = await draw(resamplePrompt(question, before), seed + SEED_OFFSETS.resample, 'resample');
      const v2 = vote(fresh);
      out.verify.resampled = true;
      out.verify.resamples = fresh;
      out.verify.vote = { key: v2.key, count: v2.count, valid: v2.valid, of: v2.of, tie: v2.tie, tied: v2.tied, groups: v2.groups };
      if (v2.value !== null) {
        v = v2;
        program = fresh[v2.winner].program;
        out.verify.after = renderAnswer(v2.value);
        out.verify.changed = out.verify.after !== before;
      }
    }
  }

  if (v.value !== null) {
    out.answer = renderAnswer(v.value);
    out.provenance = 'model+exact';
    out.program = program;
    return done();
  }

  // 4. every program failed: one prose answer, labelled for what it is
  out.allFailed = true;
  const r = await ask({ prompt: prosePrompt(question), seed: seed + SEED_OFFSETS.prose, maxTokens, purpose: 'prose', index: 0 });
  const got = r.ok ? lastNumber(r.text) : null;
  out.fallback = { reached: r.ok, got, chars: String(r.text).length, tokens: r.tokens, reason: r.ok ? null : r.reason };
  if (got !== null) {
    out.answer = got;
    out.provenance = 'model';
  }
  return done();
}
