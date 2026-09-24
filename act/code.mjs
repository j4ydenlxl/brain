// act/code.mjs: THE LOOP. The organism writes code by RUNNING it, which is the one thing a
// model alone cannot do.
//
// A model hands back a function. The organism does not read it and decide whether it looks
// right; it executes it in act/run.mjs against the cases the task shows, and if a case
// fails it hands that failure back and asks again. The hidden cases are never in any
// prompt, so the score at the end is a score on inputs the model never saw.
//
//   round 1   spec + signature + the visible examples            -> candidate 1 -> run
//   round 2   the same, plus candidate 1 and the case it failed  -> candidate 2 -> run
//   round 3   the same, plus candidate 2 and the case it failed  -> candidate 3 -> run
//
// The first candidate that passes EVERY visible case is the one graded on the hidden cases.
// When no candidate passes them all, the LAST candidate is graded, so an arm always has a
// number and the number is never picked by looking at the hidden cases. That selection rule
// is the whole difference between this and one model call: the model is the same, the
// prompt of round 1 is the same, and the sandbox is the same.
//
// provider 'null' IS THE FLOOR, and it is not a model that failed. No socket is opened, no
// prompt is built, and the candidate is a function that returns undefined, graded by the
// same runner on the same hidden cases. Its result carries rounds 0.
//
// AUTHORITY. Nothing the model writes is ever imported, written to the tree, or run in this
// process. It exists as a string, it runs in the worker's pruned vm context, and it dies
// with that worker. The ledger records how many rounds were spent and how many candidates
// came back, never the prompt and never the code.
import { complete } from './llm.mjs';
import { runCases, renderValue } from './run.mjs';

/** The ledger event one solve writes. It carries counts, never the prompt and never the code. */
export const CODE_EVENT = 'act.code.solve';
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * The function name a task's signature declares.
 * @param {object} task { signature, entry }
 * @returns {string|null}
 */
export function entryName(task) {
  if (task && task.entry && IDENT.test(String(task.entry))) return String(task.entry);
  const m = /(?:function\s+)?([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/.exec(String((task && task.signature) || ''));
  return m ? m[1] : null;
}

/**
 * The code out of whatever the model wrote. The LAST fenced block wins, because a model
 * that explains itself first writes its working above its answer. With no fence the whole
 * answer is taken, which is a syntax error when the answer was prose, and a syntax error is
 * an honest failure rather than a skipped task.
 * @param {string} text
 * @returns {string}
 */
export function extractCode(text) {
  let t = String(text ?? '').replace(/<think>[\s\S]*?<\/think>/gi, ' ');
  const fences = [...t.matchAll(/```[a-zA-Z]*[ \t]*\r?\n([\s\S]*?)```/g)];
  let code = fences.length ? fences[fences.length - 1][1] : t;
  // A module keyword is a syntax error inside a vm script, and it is the model's habit and
  // not its answer, so it is removed rather than counted as a wrong answer.
  code = code.replace(/^[ \t]*export[ \t]+(?:default[ \t]+)?/gm, '');
  code = code.replace(/^[ \t]*module\.exports[^\n]*$/gm, '');
  return code.trim();
}

const oneLine = (s, max = 160) => {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max) + '...' : t;
};

const callOf = (entry, args) => entry + '(' + (Array.isArray(args) ? args : []).map((a) => JSON.stringify(renderValue(a))).join(', ') + ')';

/** The rules of the sandbox, told to the model, because a candidate that reaches for Date fails. */
export const SANDBOX_RULES = [
  'It runs in a sandbox whose only globals are Math, JSON, Array, Map, Set, String, Number,',
  'Boolean, BigInt, RegExp, Object, Symbol and Error. There is no Date, no console, no',
  'require, no import, no fetch, no process, no timers and no Promise. The function must be',
  'synchronous and must RETURN its answer, not print it.',
].join('\n');

/**
 * The first prompt: the spec, the signature and the visible examples. Never the hidden ones.
 * @param {object} task
 * @param {string} entry
 * @returns {string}
 */
export function firstPrompt(task, entry) {
  const ex = (task.visible || []).map((c) => '  ' + callOf(entry, c.args) + ' returns ' + JSON.stringify(renderValue(c.expected))).join('\n');
  return [
    'Write one JavaScript function.',
    '',
    'WHAT IT MUST DO: ' + String(task.spec || ''),
    'SIGNATURE: ' + String(task.signature || (entry + '(...)')),
    '',
    SANDBOX_RULES,
    '',
    'EXAMPLES:',
    ex || '  (none)',
    '',
    'Answer with one fenced javascript code block holding the whole function and nothing else.',
  ].join('\n');
}

/**
 * The repair prompt: the same task, the candidate that failed, and the ONE case it failed on.
 * @param {object} task
 * @param {string} entry
 * @param {string} code the candidate that failed
 * @param {object} bad the failing case row from runCases
 * @returns {string}
 */
export function repairPrompt(task, entry, code, bad) {
  const outcome = bad && bad.error
    ? 'it failed with ' + oneLine(bad.error)
    : 'it returned ' + JSON.stringify(bad ? bad.got : null) + ' and the answer is ' + JSON.stringify(bad ? bad.expected : null);
  return [
    firstPrompt(task, entry),
    '',
    'YOUR PREVIOUS ANSWER WAS RUN AND IT IS WRONG.',
    '',
    '```javascript',
    String(code || ''),
    '```',
    '',
    'On the call ' + callOf(entry, bad ? bad.args : []) + ', ' + outcome + '.',
    '',
    'Fix it. Answer with one fenced javascript code block holding the whole corrected function and nothing else.',
  ].join('\n');
}

function logEvent(brain, ev) {
  if (!brain || typeof brain.log !== 'function') return -1;
  return brain.log(ev);
}

const NULL_REASON = 'provider null: no prompt was built and no socket was opened; the candidate is a function that returns undefined';

/**
 * Solve one coding task by running candidates, and grade the winner on cases the model
 * never saw.
 *
 * @param {object} task { id, kind, spec, signature, entry, visible, hidden }
 * @param {object} [opts]
 *   provider  'null' (the floor, 0 rounds, no socket), 'ollama' or 'env'
 *   rounds    how many times the model may be asked; default 3. 1 is one call and no repair
 *   model, base, timeoutMs, probeMs, maxTokens, numCtx, seed  passed to act/llm.mjs
 *   limitMs, memoryMB  passed to act/run.mjs, per case
 *   brain     optional, for the ledger event
 * @returns {Promise<object>} the graded result
 */
export async function solveCode(task, opts = {}) {
  const started = Date.now();
  const entry = entryName(task);
  const provider = opts.provider == null ? 'null' : String(opts.provider);
  const visible = Array.isArray(task && task.visible) ? task.visible : [];
  const hidden = Array.isArray(task && task.hidden) ? task.hidden : [];
  const runOpts = {
    entry,
    limitMs: Number.isFinite(opts.limitMs) ? opts.limitMs : 2000,
    memoryMB: Number.isFinite(opts.memoryMB) ? opts.memoryMB : 128,
  };
  const base = {
    id: (task && task.id) || null, kind: (task && task.kind) || null, provider,
    model: opts.model || null, entry,
  };

  if (!entry) {
    return { ...base, absent: true, reason: 'the task names no function: neither entry nor signature holds an identifier', rounds: 0, candidates: 0, ok: false, ms: Date.now() - started };
  }

  if (provider === 'null') {
    const code = 'function ' + entry + '() { return undefined; }';
    const v = await runCases(code, visible, runOpts);
    const h = await runCases(code, hidden, runOpts);
    const out = {
      ...base, absent: false, reason: NULL_REASON, rounds: 0, candidates: 0,
      solvedVisible: false,
      visible: { passed: v.passed, failed: v.failed, all: visible.length },
      hidden: { passed: h.passed, failed: h.failed, all: hidden.length },
      ok: hidden.length > 0 && h.failed === 0,
      cases: h.cases, attempts: [], code, codeChars: code.length, modelMs: 0, ms: Date.now() - started,
    };
    out.seq = logEvent(opts.brain, { type: CODE_EVENT, id: out.id, kind: out.kind, provider, model: null, rounds: 0, candidates: 0, ok: out.ok, hiddenPassed: h.passed, hiddenOf: hidden.length, ms: out.ms });
    return out;
  }

  const maxRounds = Math.max(1, Number.isFinite(opts.rounds) ? Math.floor(opts.rounds) : 3);
  const attempts = [];
  let calls = 0, modelMs = 0, lastCode = null, lastRun = null, chosen = null, chosenRun = null, downReason = null;
  let bad = null;

  for (let r = 1; r <= maxRounds; r++) {
    const prompt = bad ? repairPrompt(task, entry, lastCode, bad) : firstPrompt(task, entry);
    const c = await complete({
      prompt, provider, model: opts.model, base: opts.base,
      timeoutMs: opts.timeoutMs, probeMs: opts.probeMs,
      maxTokens: opts.maxTokens, numCtx: opts.numCtx, seed: opts.seed,
    });
    calls++;
    modelMs += Number.isFinite(c.ms) ? c.ms : 0;
    if (!c.ok || c.provider !== provider) {
      // The model was not reached. That is an absent arm, not a wrong answer, so the loop
      // stops here rather than grading the offline provider's reversed sentence.
      downReason = c.reason || ('the ' + provider + ' provider did not answer');
      attempts.push({ round: r, reached: false, reason: downReason, modelMs: c.ms });
      break;
    }
    const code = extractCode(c.text);
    const v = await runCases(code, visible, runOpts);
    lastCode = code; lastRun = v;
    attempts.push({
      round: r, reached: true, codeChars: code.length, modelMs: c.ms, modelTokens: c.tokens,
      visiblePassed: v.passed, visibleOf: visible.length, setupError: v.error,
      firstFailure: v.error ? oneLine(v.error) : (v.cases.find((x) => !x.ok) ? oneLine((v.cases.find((x) => !x.ok).error) || ('returned ' + JSON.stringify(v.cases.find((x) => !x.ok).got))) : null),
    });
    if (visible.length > 0 && v.failed === 0) { chosen = code; chosenRun = v; break; }
    bad = v.cases.find((x) => !x.ok) || null;
  }

  if (chosen === null && lastCode !== null) { chosen = lastCode; chosenRun = lastRun; }

  if (chosen === null) {
    const out = {
      ...base, absent: true, reason: downReason || 'no candidate was produced', rounds: calls, candidates: 0,
      ok: false, attempts, modelMs, ms: Date.now() - started,
    };
    out.seq = logEvent(opts.brain, { type: CODE_EVENT, id: out.id, kind: out.kind, provider, model: opts.model || null, rounds: calls, candidates: 0, ok: false, hiddenPassed: null, hiddenOf: hidden.length, ms: out.ms, reason: out.reason });
    return out;
  }

  const h = await runCases(chosen, hidden, runOpts);
  const out = {
    ...base, absent: false, reason: null, rounds: calls, candidates: attempts.filter((a) => a.reached).length,
    solvedVisible: !!(chosenRun && visible.length > 0 && chosenRun.failed === 0),
    visible: { passed: chosenRun ? chosenRun.passed : 0, failed: chosenRun ? chosenRun.failed : visible.length, all: visible.length },
    hidden: { passed: h.passed, failed: h.failed, all: hidden.length },
    ok: hidden.length > 0 && h.failed === 0,
    cases: h.cases, attempts, code: chosen, codeChars: chosen.length, modelMs, ms: Date.now() - started,
  };
  out.seq = logEvent(opts.brain, {
    type: CODE_EVENT, id: out.id, kind: out.kind, provider, model: opts.model || null,
    rounds: out.rounds, candidates: out.candidates, ok: out.ok,
    visiblePassed: out.visible.passed, visibleOf: visible.length,
    hiddenPassed: h.passed, hiddenOf: hidden.length, codeChars: out.codeChars, modelMs, ms: out.ms,
  });
  return out;
}
