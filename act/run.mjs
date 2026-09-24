// act/run.mjs: THE SANDBOX. The organism runs code it did not write, on cases whose answers
// were known before the code existed, and learns nothing about the machine it runs on.
//
// Two walls, because one is never enough:
//
//   THE WORKER. Every candidate runs in a worker_threads Worker with resourceLimits, so a
//   candidate that allocates without bound dies inside its own heap and not inside the
//   process that is grading it, and so a candidate that never returns can be stopped at
//   all. A synchronous infinite loop cannot be interrupted from inside the thread it is
//   running in; worker.terminate() is the only thing that ends it, and it is what enforces
//   every case's wall clock limit here.
//
//   THE CONTEXT. Inside that worker the candidate is compiled into a node:vm context whose
//   global has been pruned down to Math, JSON, Array, Map, Set, String, Number, Boolean,
//   BigInt, RegExp, Object, Symbol and Error. There is no process, no require, no import,
//   no fetch, no WebAssembly, no Atomics, no SharedArrayBuffer, no timer and no console,
//   and code generation from strings is off, so eval and the Function constructor throw
//   rather than reaching an intrinsic the prune could not delete. A candidate that reaches
//   for the filesystem or the network gets a ReferenceError, and that ReferenceError is
//   recorded as that case's failure rather than as an error in the bench.
//
// THE DEADLINE IS PER CASE, and a case that hits it costs the worker: the worker is
// terminated and the next case starts a fresh one. That is deliberate. A candidate that
// wedged the thread has also wedged whatever state it left behind.
//
// ONE COMPARISON RULE FOR BOTH SIDES. renderValue() maps a value to a JSON value: a BigInt
// becomes its decimal string, -0 becomes 0, NaN and the infinities become their names, and
// object keys are sorted. The expected value from the fixture and the value the candidate
// returned go through the SAME function before they are compared, which is why a candidate
// that returns 123456789012345678901234567890n matches a fixture that can only hold that
// number as a string. A value JSON cannot hold (a Map, a Set, a function) renders as far as
// JSON can carry it and no further; expected values here are JSON values.
//
// Nothing in this file opens a socket or touches the filesystem.
import { Worker } from 'node:worker_threads';
import { performance } from 'node:perf_hooks';

/** The only names the candidate's global keeps. Everything else on it is pruned. */
export const SANDBOX_GLOBALS = Object.freeze([
  'Math', 'JSON', 'Array', 'Map', 'Set', 'String', 'Number', 'Boolean',
  'BigInt', 'RegExp', 'Object', 'Symbol', 'Error',
]);

// globalThis itself has to stay for the prune to have something to prune, and the three
// value properties below are non-configurable, so naming them keeps the prune honest about
// what it did rather than silently failing to delete them.
const KEEP = Object.freeze([...SANDBOX_GLOBALS, 'globalThis', 'undefined', 'NaN', 'Infinity']);

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * A value as JSON can hold it, by one rule applied to both sides of every comparison.
 * @param {*} v
 * @returns {*} a JSON value
 */
export function renderValue(v) {
  const t = typeof v;
  if (t === 'bigint') return v.toString();
  if (t === 'undefined') return '@undefined';
  if (t === 'function') return '@function';
  if (t === 'symbol') return '@symbol';
  if (t === 'number') {
    if (Number.isNaN(v)) return '@NaN';
    if (v === Infinity) return '@Infinity';
    if (v === -Infinity) return '@-Infinity';
    return v === 0 ? 0 : v;
  }
  if (v === null) return null;
  if (t !== 'object') return v;
  if (Array.isArray(v)) return v.map(renderValue);
  const out = {};
  for (const k of Object.keys(v).sort()) out[k] = renderValue(v[k]);
  return out;
}

/**
 * Deep equality on JSON values, with BigInt rendered as a string on both sides.
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function sameValue(a, b) {
  return JSON.stringify(renderValue(a)) === JSON.stringify(renderValue(b));
}

// ---------------------------------------------------------------- the worker
// Built once, as a string, and run with eval so that the sandbox is one file. renderValue
// is injected by its own source text rather than rewritten here, so the comparison inside
// the worker and the comparison outside it cannot drift apart.
const WORKER_SRC = [
  "'use strict';",
  "const { parentPort, workerData } = require('node:worker_threads');",
  "const vm = require('node:vm');",
  "const { performance } = require('node:perf_hooks');",
  renderValue.toString(),
  'function same(a, b) { return JSON.stringify(renderValue(a)) === JSON.stringify(renderValue(b)); }',
  'function describe(e) {',
  '  if (e && typeof e === "object" && e.name) return String(e.name) + ": " + String(e.message);',
  '  return String(e);',
  '}',
  'let fn = null;',
  'let setupError = null;',
  'let ctx = null;',
  'try {',
  '  ctx = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });',
  '  const keep = workerData.keep;',
  '  vm.runInContext(',
  '    "(function (keep) { for (var i = 0, n = Object.getOwnPropertyNames(globalThis), L = n.length; i < L; i++) {"',
  '    + " var k = n[i]; if (keep.indexOf(k) >= 0) continue;"',
  '    + " try { delete globalThis[k]; } catch (e) {}"',
  '    + " try { if (k in globalThis) Object.defineProperty(globalThis, k, { value: undefined, writable: true, configurable: true }); } catch (e) {}"',
  '    + " } })(" + JSON.stringify(keep) + ")", ctx, { filename: "prune.js" });',
  '  let value = vm.runInContext(String(workerData.code), ctx, { filename: "candidate.js" });',
  '  if (typeof value !== "function" && workerData.entry) {',
  '    const probe = "(typeof " + workerData.entry + " === " + JSON.stringify("function") + " ? " + workerData.entry + " : undefined)";',
  '    value = vm.runInContext(probe, ctx, { filename: "entry.js" });',
  '  }',
  '  if (typeof value !== "function") {',
  '    const names = vm.runInContext("Object.getOwnPropertyNames(globalThis)", ctx, { filename: "scan.js" });',
  '    for (let i = names.length - 1; i >= 0; i--) {',
  '      if (workerData.keep.indexOf(names[i]) >= 0) continue;',
  '      const cand = vm.runInContext("globalThis[" + JSON.stringify(names[i]) + "]", ctx, { filename: "scan.js" });',
  '      if (typeof cand === "function") { value = cand; break; }',
  '    }',
  '  }',
  '  if (typeof value !== "function") throw new Error("no function was defined by the candidate");',
  '  fn = value;',
  '} catch (e) {',
  '  setupError = describe(e);',
  '}',
  'parentPort.on("message", (msg) => {',
  '  if (!msg || msg.type !== "case") return;',
  '  if (setupError !== null) { parentPort.postMessage({ type: "result", ok: false, got: null, ms: 0, error: setupError, setup: true }); return; }',
  '  let args = [];',
  '  const started = performance.now();',
  '  try {',
  '    args = vm.runInContext("(" + JSON.stringify(msg.args === undefined ? [] : msg.args) + ")", ctx, { filename: "args.js" });',
  '  } catch (e) {',
  '    parentPort.postMessage({ type: "result", ok: false, got: null, ms: performance.now() - started, error: describe(e), setup: false });',
  '    return;',
  '  }',
  '  let got, err = null;',
  '  try { got = fn.apply(undefined, args); } catch (e) { err = describe(e); }',
  '  const ms = performance.now() - started;',
  '  if (err !== null) { parentPort.postMessage({ type: "result", ok: false, got: null, ms, error: err, setup: false }); return; }',
  '  let ok = false, rendered = null, cmpError = null;',
  '  try { rendered = renderValue(got); ok = same(got, msg.expected); }',
  '  catch (e) { cmpError = describe(e); }',
  '  parentPort.postMessage({ type: "result", ok, got: rendered, ms, error: cmpError, setup: false });',
  '});',
].join('\n');

// ---------------------------------------------------------------- one worker, many cases
function spawn(code, entry, memoryMB) {
  return new Worker(WORKER_SRC, {
    eval: true,
    workerData: { code: String(code ?? ''), entry: entry && IDENT.test(entry) ? entry : null, keep: KEEP },
    // A candidate is not allowed to print. stdout and stderr are taken so that anything it
    // finds a way to write lands on a stream this process drops instead of the terminal.
    stdout: true, stderr: true,
    resourceLimits: {
      maxOldGenerationSizeMb: Math.max(16, memoryMB),
      maxYoungGenerationSizeMb: Math.max(4, Math.floor(memoryMB / 4)),
      codeRangeSizeMb: 16,
      stackSizeMb: 4,
    },
  });
}

/**
 * One case on a live worker, with the deadline enforced from here because a thread spinning
 * on a synchronous loop can neither answer a message nor time itself out.
 * @returns {Promise<{kind: string, msg?: object, ms: number, error?: string}>}
 */
function askWorker(worker, kase, limitMs) {
  return new Promise((resolve) => {
    const started = performance.now();
    let settled = false;
    const finish = (v) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.off('message', onMessage);
      worker.off('error', onError);
      worker.off('exit', onExit);
      resolve({ ...v, ms: v.ms === undefined ? performance.now() - started : v.ms });
    };
    const onMessage = (m) => finish({ kind: 'result', msg: m, ms: Number.isFinite(m && m.ms) ? m.ms : undefined });
    const onError = (e) => finish({ kind: 'error', error: String((e && e.message) || e) });
    const onExit = (c) => finish({ kind: 'exit', error: 'the worker exited with code ' + c + ' before the case returned' });
    const timer = setTimeout(() => finish({ kind: 'timeout' }), limitMs);
    worker.on('message', onMessage);
    worker.on('error', onError);
    worker.on('exit', onExit);
    worker.postMessage({ type: 'case', args: kase && kase.args !== undefined ? kase.args : [], expected: kase ? kase.expected : undefined });
  });
}

/**
 * Run one candidate function against test cases, inside the sandbox.
 *
 * @param {string} code the candidate's source, as the model wrote it
 * @param {object[]} cases each { args: any[], expected: any }
 * @param {object} [opts]
 *   limitMs   wall clock per case, enforced by worker.terminate(); default 2000
 *   memoryMB  the worker's old generation cap; default 128
 *   entry     the function's name, from the task's signature; discovery is the fallback
 * @returns {Promise<{passed: number, failed: number, cases: object[], error: string|null}>}
 */
export async function runCases(code, cases, opts = {}) {
  const limitMs = Number.isFinite(opts.limitMs) && opts.limitMs > 0 ? opts.limitMs : 2000;
  const memoryMB = Number.isFinite(opts.memoryMB) && opts.memoryMB > 0 ? opts.memoryMB : 128;
  const entry = opts.entry ? String(opts.entry) : null;
  const list = Array.isArray(cases) ? cases : [];
  const out = { passed: 0, failed: 0, cases: [], error: null };
  if (!list.length) return out;
  let worker = null;
  const kill = async () => {
    if (!worker) return;
    const w = worker;
    worker = null;
    try { await w.terminate(); } catch { /* already gone */ }
  };
  try {
    for (const kase of list) {
      if (!worker) worker = spawn(code, entry, memoryMB);
      const r = await askWorker(worker, kase, limitMs);
      const row = { args: kase && kase.args !== undefined ? kase.args : [], expected: renderValue(kase ? kase.expected : undefined), got: null, ok: false, ms: Math.round(r.ms * 1000) / 1000, error: null };
      if (r.kind === 'result') {
        const m = r.msg || {};
        row.ok = !!m.ok;
        row.got = m.got === undefined ? null : m.got;
        row.error = m.error === undefined ? null : m.error;
        if (m.setup && out.error === null) out.error = row.error;
      } else if (r.kind === 'timeout') {
        row.error = 'timeout: the case did not return within ' + limitMs + ' ms, and the worker was terminated';
        await kill();
      } else {
        row.error = r.error || ('the worker ended with no result (' + r.kind + ')');
        await kill();
      }
      if (row.ok) out.passed++; else out.failed++;
      out.cases.push(row);
    }
  } finally {
    await kill();
  }
  return out;
}

// ---------------------------------------------------------------- a test suite, not cases
// THE SECOND SHAPE OF A HIDDEN GRADE. runCases() knows the arguments and the answer of every
// case, because the bench that calls it wrote both. A public benchmark does not hand over
// cases: HumanEval hands over a PROGRAM that asserts, and the only reading of it is whether
// that program throws. runTests() runs that program against a candidate, behind the same two
// walls, and a throw is a failure.
//
// THE PRELUDE IS THE WHOLE TRICK. The suite's first line is `const assert =
// require('node:assert')`, and there is no require inside this sandbox and there will not be
// one. So the prelude defines a require of its own, in the context, before the suite is
// compiled: it answers node:assert with an assert object written out below in plain
// JavaScript, and it THROWS for every other name. A suite that reaches for node:fs therefore
// fails with a recorded SandboxError, in the worker, and the process doing the grading never
// learns that it asked. process, console and the filesystem are already gone: the prune below
// is the same prune runCases uses, and a suite that touches process gets a ReferenceError.
//
// The assert object is loose where node's assert.deepEqual is loose (primitives compared with
// ==, NaN equal to NaN, own enumerable keys compared both ways) because the suites in
// bench/fixtures/public/humaneval were written against that function and would otherwise fail
// on a float the reference implementation also produces.
//
// Nothing here is declared with let or const at the top level of the context, because the
// suite declares `const assert` at the top level of the SAME context and two lexical
// declarations of one name in one context is a SyntaxError.

/** The globals the prelude installs before the candidate is compiled. */
export const TEST_PRELUDE_GLOBALS = Object.freeze(['assert', 'require']);

/** The assert methods the prelude implements. A suite that calls another one fails. */
export const TEST_ASSERT_METHODS = Object.freeze(['deepEqual', 'equal', 'strictEqual', 'ok', 'notEqual']);

// Mirrors the prune inside WORKER_SRC above. It is written twice rather than lifted out of
// that string, because lifting it would change an export this file already ships. The claim
// that both prunes still delete the same things is not carried by this comment: the test
// asserts a suite that touches process fails here.
const PRUNE_SRC = '(function (keep) { for (var i = 0, n = Object.getOwnPropertyNames(globalThis), L = n.length; i < L; i++) {'
  + ' var k = n[i]; if (keep.indexOf(k) >= 0) continue;'
  + ' try { delete globalThis[k]; } catch (e) {}'
  + ' try { if (k in globalThis) Object.defineProperty(globalThis, k, { value: undefined, writable: true, configurable: true }); } catch (e) {}'
  + ' } })';

/** The prelude's source, run in the context before the candidate. Exported so a test can read it. */
export const TEST_PRELUDE = [
  "'use strict';",
  'function __deepEq(a, b, strict) {',
  '  if (a === b) return true;',
  '  if (typeof a === "number" && typeof b === "number" && a !== a && b !== b) return true;',
  '  if (a === null || b === null || typeof a !== "object" || typeof b !== "object") {',
  '    if (strict) return false;',
  '    return a == b;',
  '  }',
  '  if (Array.isArray(a) !== Array.isArray(b)) return false;',
  '  var ka = Object.keys(a), kb = Object.keys(b);',
  '  if (ka.length !== kb.length) return false;',
  '  for (var i = 0; i < ka.length; i++) {',
  '    if (!Object.prototype.hasOwnProperty.call(b, ka[i])) return false;',
  '    if (!__deepEq(a[ka[i]], b[ka[i]], strict)) return false;',
  '  }',
  '  return true;',
  '}',
  'function __show(v) { try { var s = JSON.stringify(v); return s === undefined ? String(v) : s; } catch (e) { return String(v); } }',
  'function __raise(what, a, b) {',
  '  var e = new Error(what + ": " + __show(a) + " and " + __show(b));',
  '  e.name = "AssertionError";',
  '  throw e;',
  '}',
  'globalThis.assert = {',
  '  deepEqual: function (a, b, m) { if (!__deepEq(a, b, false)) __raise(m || "deepEqual failed between", a, b); },',
  '  equal: function (a, b, m) { if (!(a == b)) __raise(m || "equal failed between", a, b); },',
  '  strictEqual: function (a, b, m) { if (a !== b) __raise(m || "strictEqual failed between", a, b); },',
  '  notEqual: function (a, b, m) { if (a == b) __raise(m || "notEqual failed between", a, b); },',
  '  ok: function (a, m) { if (!a) __raise(m || "ok failed on", a, true); },',
  '};',
  // The suite's own require line is not stripped; it is answered. A name that is not
  // node:assert is a refusal with the name in it, so the failure says what was reached for.
  'function require(name) {',
  '  if (name === "node:assert" || name === "assert") return globalThis.assert;',
  '  var e = new Error("require(" + JSON.stringify(String(name)) + ") is refused: this sandbox provides node:assert from its prelude and nothing else");',
  '  e.name = "SandboxError";',
  '  throw e;',
  '}',
].join('\n');

const TEST_WORKER_SRC = [
  "'use strict';",
  "const { parentPort, workerData } = require('node:worker_threads');",
  "const vm = require('node:vm');",
  "const { performance } = require('node:perf_hooks');",
  'function describe(e) {',
  '  if (e && typeof e === "object" && e.name) return String(e.name) + ": " + String(e.message);',
  '  return String(e);',
  '}',
  'const started = performance.now();',
  'let stage = "context";',
  'try {',
  '  const ctx = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });',
  '  vm.runInContext(workerData.prune + "(" + JSON.stringify(workerData.keep) + ")", ctx, { filename: "prune.js" });',
  '  stage = "prelude";',
  '  vm.runInContext(String(workerData.prelude), ctx, { filename: "prelude.js" });',
  '  stage = "candidate";',
  '  vm.runInContext(String(workerData.code), ctx, { filename: "candidate.js" });',
  '  stage = "tests";',
  '  vm.runInContext(String(workerData.tests), ctx, { filename: "tests.js" });',
  '  parentPort.postMessage({ passed: true, error: null, stage: "tests", ms: performance.now() - started });',
  '} catch (e) {',
  '  parentPort.postMessage({ passed: false, error: describe(e), stage, ms: performance.now() - started });',
  '}',
].join('\n');

/**
 * Run a candidate against a test suite that asserts, inside the sandbox.
 *
 * @param {string} code the candidate's source
 * @param {string} testsSource the suite, as the benchmark record carries it
 * @param {object} [opts]
 *   limitMs   wall clock for the whole suite, enforced by worker.terminate(); default 5000
 *   memoryMB  the worker's old generation cap; default 128
 * @returns {Promise<{passed: boolean, error: string|null, stage: string, ms: number, timedOut: boolean}>}
 */
export function runTests(code, testsSource, opts = {}) {
  const limitMs = Number.isFinite(opts.limitMs) && opts.limitMs > 0 ? opts.limitMs : 5000;
  const memoryMB = Number.isFinite(opts.memoryMB) && opts.memoryMB > 0 ? opts.memoryMB : 128;
  return new Promise((resolve) => {
    const started = performance.now();
    let worker = null, settled = false, timer = null;
    const finish = (v) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      const w = worker;
      worker = null;
      if (w) { try { w.terminate(); } catch { /* already gone */ } }
      resolve({ ms: Math.round((performance.now() - started) * 1000) / 1000, timedOut: false, ...v });
    };
    try {
      worker = new Worker(TEST_WORKER_SRC, {
        eval: true,
        workerData: {
          code: String(code ?? ''), tests: String(testsSource ?? ''),
          prelude: TEST_PRELUDE, prune: PRUNE_SRC, keep: KEEP,
        },
        stdout: true, stderr: true,
        resourceLimits: {
          maxOldGenerationSizeMb: Math.max(16, memoryMB),
          maxYoungGenerationSizeMb: Math.max(4, Math.floor(memoryMB / 4)),
          codeRangeSizeMb: 16,
          stackSizeMb: 4,
        },
      });
    } catch (e) {
      finish({ passed: false, error: 'the worker would not start: ' + String((e && e.message) || e), stage: 'spawn' });
      return;
    }
    timer = setTimeout(() => finish({
      passed: false, stage: 'tests', timedOut: true,
      error: 'timeout: the suite did not finish within ' + limitMs + ' ms, and the worker was terminated',
    }), limitMs);
    worker.on('message', (m) => finish({
      passed: !!(m && m.passed), error: m && m.error !== undefined ? m.error : null,
      stage: (m && m.stage) || 'tests',
    }));
    worker.on('error', (e) => finish({ passed: false, error: 'the worker failed: ' + String((e && e.message) || e), stage: 'worker' }));
    worker.on('exit', (c) => finish({ passed: false, error: 'the worker exited with code ' + c + ' before the suite finished', stage: 'worker' }));
  });
}
