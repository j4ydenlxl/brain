// grow/probe.mjs: runs INSIDE the sandbox (grow/CONTRACT.md, result.json). Node built-ins only; it
// imports ./contract.mjs relatively because the runner's tarball puts the two side by side.
//   node grow/probe.mjs <dir> [--heldout heldout.jsonl] [--control control.jsonl] [--nonce-file nonce.txt]
// --nonce-file: the runner's one-run nonce; the probe reads it and DELETES the file before any candidate code
// runs, and echoes it as "nonce" in its line, so the runner can tell the probe's line from one a candidate wrote.
// It validates <dir>/cell.mjs STATICALLY first (validateCell on the source: that verdict is authoritative, the
// worker's may only add errors) and test.mjs statically (validateTest), imports the cell in a worker thread and
// validates the module, runs `node --test <dir>/test.mjs` (30 s budget) under the node permission model (read
// inside <dir> only; no write but node's own reporter file, no child process, no worker, no addon) and reads the
// pass/fail count from that reporter file (what test.mjs prints to stdout is never a count), then calls can(q)
// and answer(q) on every examples.jsonl and held-out row and can(q) on every control row, each row inside a
// worker thread with a 2000 ms budget measured with performance.now() (a throw gives can false and got null; a
// row that runs past the budget is cut off by terminating the worker). Every message the worker posts carries a
// per-worker secret the worker consumes from workerData before the cell's code runs, through postMessage bound
// before that code runs: a message without it (a cell that reached parentPort) is dropped, and a row is taken
// only for the row that is running. It prints ONE JSON line on stdout: the result shape minus the runner fields,
// plus node and probeCpuMs. Nothing else.
// Author: board 37 sandbox builder, 2026-09-30; the secret, static-first validation and the reporter file by the
// Fable 5.1 orchestrator after board 37's verify2 forged a validate message (2026-09-30).
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { validateCell, validateTest, parseJsonl } from './contract.mjs';

export const ROW_BUDGET_MS = 2000;
export const TEST_BUDGET_MS = 30000;
export const IMPORT_BUDGET_MS = 5000;
const USAGE = 'usage: node grow/probe.mjs <candidateDir> [--heldout <file.jsonl>] [--control <file.jsonl>] [--nonce-file <file>]';

// ------------------------------------------------------------------ the worker: one cell, many rows
if (!isMainThread && workerData && workerData.probe === 1) {
  const { cellPath, source, rows, start, validate } = workerData;
  // the secret is consumed before any candidate code runs: a cell that reads workerData finds null, and postMessage
  // is bound now, so a cell that patches parentPort.postMessage later patches a method the probe no longer calls
  const secret = workerData.secret;
  workerData.secret = null;
  const post = parentPort.postMessage.bind(parentPort);
  const send = (m) => post({ ...m, s: secret });
  const text = (e) => String((e && e.message) || e).slice(0, 300);
  let mod = null;
  try { mod = await import(pathToFileURL(cellPath).href); } catch (e) {
    send({ t: 'importFailed', error: text(e) });
  }
  if (mod) {
    const meta = mod.meta && typeof mod.meta === 'object' ? mod.meta : {};
    send({ t: 'imported', id: typeof meta.id === 'string' ? meta.id : null, class: typeof meta.class === 'string' ? meta.class : null });
    if (validate) {
      let v;
      try { v = validateCell(source, mod); } catch (e) { v = { ok: false, errors: ['validateCell threw: ' + text(e)] }; }
      send({ t: 'validate', v });
    }
    for (let i = start; i < rows.length; i++) {
      const r = rows[i];
      send({ t: 'begin', i });
      const t0 = performance.now();
      let can = false, got = null, err = null;
      try { can = typeof mod.can === 'function' && mod.can(r.q) === true; } catch (e) { can = false; err = 'can threw: ' + text(e); }
      if (r.kind !== 'control') {
        try {
          const a = typeof mod.answer === 'function' ? mod.answer(r.q) : null;
          got = typeof a === 'string' ? a : null;
        } catch (e) { got = null; err = (err ? err + '; ' : '') + 'answer threw: ' + text(e); }
      }
      send({ t: 'row', i, can, got, ms: performance.now() - t0, err });
    }
  }
  send({ t: 'done' });
}

// ------------------------------------------------------------------ the main thread
function arg(argv, name) {
  const i = argv.indexOf(name);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
}

function readRows(file, kind, errors) {
  if (!file) return [];
  let rows;
  try { rows = parseJsonl(fs.readFileSync(file, 'utf8')); } catch (e) {
    errors.push(kind + ' rows unreadable: ' + String((e && e.message) || e).slice(0, 200));
    return [];
  }
  return rows.filter((r) => r && typeof r.q === 'string').map((r) => ({ kind, q: r.q }));
}

/** Only what node and a temp dir need: no token, no key, nothing of the host reaches candidate code. */
export function bareEnv(env = process.env) {
  const keep = ['PATH', 'Path', 'HOME', 'USERPROFILE', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'TMPDIR', 'LANG'];
  const out = {};
  for (const k of keep) if (env[k] !== undefined) out[k] = env[k];
  return out;
}

/**
 * Count pass/fail from node --test output: the TAP "# pass N" / "# fail N" summary, or the spec reporter's.
 * The count holds only when the output carries EXACTLY ONE summary line of each kind: test.mjs shares the
 * child's stdout under --test-isolation=none, so a "# pass N" it prints itself makes two, and two is no count
 * (null, which the judge reads as tests that did not pass). No summary at all (a file that ends its own
 * process before the reporter writes one) is null too, never a zero.
 */
export function countTests(text) {
  const one = (re) => { const m = [...String(text).matchAll(re)]; return m.length === 1 ? Number(m[0][1]) : null; };
  const has = (re) => re.test(String(text));
  return {
    passed: has(/^# pass \d+\s*$/m) ? one(/^# pass (\d+)\s*$/gm) : one(/^\S*\s*pass (\d+)\s*$/gm),
    failed: has(/^# fail \d+\s*$/m) ? one(/^# fail (\d+)\s*$/gm) : one(/^\S*\s*fail (\d+)\s*$/gm),
  };
}

/**
 * The test child's argv: node's permission model confines test.mjs to READING its own directory (it may not
 * write a file, spawn a process, start a worker or load an addon), and --test-isolation=none keeps the test
 * file in that one confined process instead of a subprocess the model would have to allow. (A reporter FILE
 * cannot be the destination: the permission model disables fsync, so node's WriteStream fails on close and the
 * child exits 1 with the summary written; the summary stays on stdout, counted by countTests' one-summary rule.)
 */
export function testArgv(dir, version = process.versions.node) {
  // node 22 (the heartbeat VM's own node) spells the flag --experimental-test-isolation; 23.6 renamed it
  const [major, minor] = String(version).split('.').map(Number);
  const isolation = (major > 23 || (major === 23 && minor >= 6) ? '--test-isolation' : '--experimental-test-isolation') + '=none';
  return ['--permission', '--allow-fs-read=' + dir, '--test', isolation, '--test-reporter=tap', 'test.mjs'];
}

function runTests(dir) {
  const file = path.join(dir, 'test.mjs');
  if (!fs.existsSync(file)) return { exitCode: null, passed: null, failed: null, tail: 'no test.mjs in the candidate directory' };
  const r = spawnSync(process.execPath, testArgv(dir), {
    cwd: dir, encoding: 'utf8', timeout: TEST_BUDGET_MS, env: bareEnv(), maxBuffer: 8 * 1024 * 1024, windowsHide: true,
  });
  const out = (r.stdout || '') + (r.stderr || '');
  const { passed, failed } = countTests(r.stdout || '');
  let tail = out.split(/\r?\n/).filter((l) => l.trim()).slice(-20).join('\n');
  if (r.error && r.error.code === 'ETIMEDOUT') tail = ('killed after ' + TEST_BUDGET_MS + ' ms\n' + tail).trim();
  if (passed === null || failed === null) tail = ('no single pass/fail summary on stdout: the count is null\n' + tail).trim();
  return { exitCode: typeof r.status === 'number' ? r.status : null, passed, failed, tail: tail.slice(-2000) };
}

/** Run the rows in worker threads, restarting past any row that blows its budget or kills its worker. */
function evalRows(cellPath, source, rows, nExamples) {
  return new Promise((resolve) => {
    const results = new Array(rows.length).fill(null);
    const state = { id: null, class: null, validate: null, importError: null };
    const budgetImport = Math.min(30000, IMPORT_BUDGET_MS + ROW_BUDGET_MS * Math.max(1, nExamples));
    const launch = (start, validate) => {
      let current = -1, t0 = 0, timer = null, finished = false, expected = start, imported = false;
      const secret = randomBytes(16).toString('hex'); // one per worker; the worker consumes it before the cell runs
      const w = new Worker(new URL(import.meta.url), {
        workerData: { probe: 1, cellPath, source, rows, start, validate, secret },
        stdout: true, stderr: true, env: {}, resourceLimits: { maxOldGenerationSizeMb: 1024 },
      });
      w.stdout.resume(); w.stderr.resume(); // a cell's console output never reaches the probe's stdout
      const arm = (ms, onFire) => { clearTimeout(timer); timer = setTimeout(onFire, ms); };
      const end = (next) => { if (finished) return; finished = true; clearTimeout(timer); w.terminate().catch(() => {}); next(); };
      const cutRow = (why) => {
        if (current >= 0 && current < rows.length && !results[current]) {
          results[current] = { can: false, got: null, ms: performance.now() - t0, err: why };
        }
        const nextStart = current + 1;
        end(() => (nextStart < rows.length ? launch(nextStart, false) : resolve({ results, ...state })));
      };
      arm(budgetImport, () => {
        if (!state.validate && validate) state.validate = { ok: false, errors: ['importing and validating the cell took over ' + budgetImport + ' ms'] };
        state.importError = state.importError || 'the cell did not import within ' + budgetImport + ' ms';
        end(() => resolve({ results, ...state }));
      });
      w.on('message', (m) => {
        // only the probe's own worker code holds the secret: a message without it came from the cell
        if (!m || typeof m !== 'object' || m.s !== secret) return;
        if (m.t === 'importFailed') { if (!imported && state.importError === null) state.importError = String(m.error).slice(0, 300); }
        else if (m.t === 'imported') { if (imported) return; imported = true; state.id = state.id ?? m.id; state.class = state.class ?? m.class; if (!validate) clearTimeout(timer); }
        else if (m.t === 'validate') { if (!validate || state.validate) return; state.validate = m.v && typeof m.v === 'object' ? { ok: m.v.ok === true, errors: Array.isArray(m.v.errors) ? m.v.errors.map((e) => String(e)) : [] } : { ok: false, errors: ['the worker posted no validation'] }; clearTimeout(timer); }
        else if (m.t === 'begin') { if (m.i !== expected || results[m.i]) return; current = m.i; t0 = performance.now(); arm(ROW_BUDGET_MS + 50, () => cutRow('over the ' + ROW_BUDGET_MS + ' ms budget')); }
        else if (m.t === 'row') {
          if (m.i !== current || results[m.i]) return; // only the row that is running, once
          clearTimeout(timer);
          const ms = typeof m.ms === 'number' ? m.ms : performance.now() - t0;
          const over = ms > ROW_BUDGET_MS;
          results[m.i] = over ? { can: false, got: null, ms, err: 'over the ' + ROW_BUDGET_MS + ' ms budget' } : { can: m.can === true, got: typeof m.got === 'string' ? m.got : null, ms, err: m.err == null ? null : String(m.err) };
          expected = m.i + 1;
        } else if (m.t === 'done') end(() => resolve({ results, ...state }));
      });
      w.on('error', (e) => {
        const why = 'the worker died: ' + String((e && e.message) || e).slice(0, 200);
        if (current < 0) { state.importError = state.importError || why; end(() => resolve({ results, ...state })); }
        else cutRow(why);
      });
      w.on('exit', () => {
        if (finished) return;
        if (current < 0) { state.importError = state.importError || 'the worker exited before the cell imported'; end(() => resolve({ results, ...state })); }
        else cutRow('the worker exited mid-row');
      });
    };
    launch(0, true);
  });
}

/** Read the nonce and delete its file at once; null when none was given or it cannot be read. */
export function takeNonce(file) {
  if (!file) return null;
  let n = null;
  try { n = fs.readFileSync(file, 'utf8').trim() || null; } catch { return null; }
  try { fs.rmSync(file, { force: true }); } catch { /* the line still carries it */ }
  return n;
}

async function main(argv, nonce) {
  const t0 = performance.now();
  const cpu0 = process.cpuUsage();
  const dir = path.resolve(argv[0]);
  const rowErrors = [];
  const cellPath = path.join(dir, 'cell.mjs');
  const source = fs.existsSync(cellPath) ? fs.readFileSync(cellPath, 'utf8') : '';
  const exRows = readRows(path.join(dir, 'examples.jsonl'), 'examples', rowErrors);
  if (!fs.existsSync(path.join(dir, 'examples.jsonl'))) rowErrors.push('no examples.jsonl in the candidate directory');
  const held = readRows(arg(argv, '--heldout'), 'heldout', rowErrors);
  const ctl = readRows(arg(argv, '--control'), 'control', rowErrors);
  const rows = [...exRows, ...held, ...ctl];

  let validate, id = null, klass = null, results = new Array(rows.length).fill(null), importError = null;
  if (!source) {
    validate = { ok: false, errors: ['no cell.mjs in the candidate directory'] };
  } else {
    // the source verdict comes first and is authoritative; the worker's (the module under validateCell) may add
    // errors and never clears one: a cell that reaches parentPort cannot post itself valid
    const fixed = validateCell(source, null);
    const r = await evalRows(cellPath, source, rows, exRows.length);
    ({ results, importError } = r);
    id = r.id; klass = r.class;
    const errors = [...fixed.errors];
    const add = (e) => { if (!errors.includes(e)) errors.push(e); };
    if (r.validate) for (const e of r.validate.errors) add(e);
    else if (!importError) add('the worker returned no validation of the module');
    if (importError) add('the cell did not import: ' + importError);
    validate = { ok: fixed.ok === true && Boolean(r.validate && r.validate.ok === true) && errors.length === 0, errors };
  }
  const testFile = path.join(dir, 'test.mjs');
  if (fs.existsSync(testFile)) {
    const tv = validateTest(fs.readFileSync(testFile, 'utf8'));
    if (!tv.ok) validate = { ok: false, errors: [...validate.errors, ...tv.errors] };
  }
  if (rowErrors.length) validate = { ok: false, errors: [...validate.errors, ...rowErrors] };
  const tests = runTests(dir);

  const ms = (x) => (typeof x === 'number' ? Math.round(x * 1000) / 1000 : null);
  const pick = (kind) => rows.map((r, i) => [r, results[i]]).filter(([r]) => r.kind === kind);
  const out = {
    nonce,
    id: id ?? (source.match(/\bid\s*:\s*['"]([a-z0-9][a-z0-9-]{2,63})['"]/) || [])[1] ?? path.basename(dir),
    class: klass ?? (source.match(/\bclass\s*:\s*['"]([^'"]+)['"]/) || [])[1] ?? null,
    node: process.version,
    validate,
    tests,
    examples: pick('examples').map(([r, x]) => ({ q: r.q, can: x ? x.can : null, got: x ? x.got : null })),
    heldout: pick('heldout').map(([r, x]) => ({ q: r.q, can: x ? x.can : null, got: x ? x.got : null, ms: x ? ms(x.ms) : null })),
    control: pick('control').map(([r, x]) => ({ q: r.q, can: x ? x.can : null })),
    rowErrors: rows.map((r, i) => (results[i] && results[i].err ? { kind: r.kind, q: r.q, error: results[i].err } : null)).filter(Boolean),
    probeMs: Math.round(performance.now() - t0),
    probeCpuMs: Math.round((() => { const c = process.cpuUsage(cpu0); return (c.user + c.system) / 1000; })()),
  };
  return out;
}

const same = (x, y) => (process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y);
if (isMainThread && process.argv[1] && same(path.resolve(process.argv[1]), fileURLToPath(import.meta.url))) {
  const argv = process.argv.slice(2);
  if (!argv.length || argv[0] === '--help' || argv[0] === '-h') {
    process.stdout.write(USAGE + '\n');
    process.exit(argv.length ? 0 : 2);
  }
  const nonce = takeNonce(arg(argv, '--nonce-file')); // before any candidate code
  let out;
  try { out = await main(argv, nonce); } catch (e) {
    out = { nonce, id: null, class: null, node: process.version, validate: { ok: false, errors: ['the probe failed: ' + String((e && e.message) || e).slice(0, 300)] },
      tests: { exitCode: null, passed: null, failed: null, tail: '' }, examples: [], heldout: [], control: [], rowErrors: [] };
  }
  process.stdout.write(JSON.stringify(out) + '\n', () => process.exit(0));
}
