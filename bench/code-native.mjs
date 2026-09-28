#!/usr/bin/env node
// bench/code-native.mjs: THE BAR for board 34 item code-native (his order 2026-09-28: code natively, no model).
//
// act/code-native.mjs answers code, code-reading, sql, command and format prompts with no model. This bench grades it
// on two populations and one control, and writes bench/verdicts/code-native.json:
//
//   development  the census rows of those five kinds (bench/conceive-prompts.json), each graded by ITS OWN grade
//                (conceive's rubric; a code row's function is RUN against its tests in act/run.mjs).
//   held-out     bench/code-native-heldout.jsonl, written before the readers, never edited after (its sha256 and write
//                stamp are pinned below and checked on every run). Same author as the readers: disclosed in the split.
//   control      codeNative on every census prompt of the OTHER kinds (poems, arithmetic, facts ...). It must answer
//                none of them: a reader that claims a poem is a reader that has stopped reading.
//
// Per kind and population it prints asked, answered, correct, wrong, refused and the median and p95 nanoseconds per
// answer (measured inside codeNative, prompt in, answer out). A wrong answer is a defect; a refusal is a gap.
//
// barMet = held-out correct share >= 0.5 over the five kinds AND >= 0.5 on code alone AND development wrong <= 2 AND
// the control answers 0 AND `node --test test/code-native.test.mjs test/act-prompt.test.mjs` exits 0. The tests are run
// by this bench, and the verdict is written only after their exit code is known.
//
// MODEL OFF: nothing here opens a socket or calls a model. Zero dependencies, Node 24 ESM.
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/code-native.mjs
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeNative, runAnswer, OPERATIONS, CATALOGUE, PRIMITIVES } from '../act/code-native.mjs';
import { loadPrompts, rubric, extractCode } from './conceive.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
export const KINDS = Object.freeze(['code', 'code-reading', 'sql', 'command', 'format']);
export const HELDOUT_FILE = path.join(HERE, 'code-native-heldout.jsonl');
export const HELDOUT_SHA256 = '2857dc7f035d73ac1e1f6439c6669a66c794da6c5740d6159959d19022260d41';
export const HELDOUT_WRITTEN = '2026-09-28T13:09:10.504Z';
export const VERDICT_FILE = path.join(HERE, 'verdicts', 'code-native.json');
export const COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/code-native.mjs';
export const TESTS_COMMAND = 'node --test test/code-native.test.mjs test/act-prompt.test.mjs';
export const BAR = Object.freeze({ heldOutShare: 0.5, heldOutCodeShare: 0.5, devWrongMax: 2, controlAnswers: 0 });
const CODE_FILE = path.join(ROOT, 'act', 'code-native.mjs');

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

export function loadHeldOut(file = HELDOUT_FILE) {
  const buf = readFileSync(file);
  const rows = buf.toString('utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  return { rows, sha256: sha256(buf) };
}

/** One row graded: { status: correct | wrong | refused, method, ns, head, why }. */
export async function gradeRow(row, opts = {}) {
  const a = await codeNative(row.prompt, { ...opts, explain: true });
  if (!a || a.refused) return { status: 'refused', method: null, ns: null, why: a ? a.refused : null };
  let ok;
  if (row.grade.type === 'code') {
    if (row.grade.lang && row.grade.lang !== 'javascript') ok = false;
    else ok = (await runAnswer(extractCode(a.text), row.grade.entry, row.grade.tests)).ok;
  } else ok = await rubric(a.text, row.grade, row.prompt);
  return { status: ok ? 'correct' : 'wrong', method: a.method, ns: a.ns, head: a.answer.replace(/\s+/g, ' ').slice(0, 160) };
}

export function quantile(xs, q) {
  if (!xs.length) return null;
  const s = xs.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil(q * s.length) - 1))];
}

function blank() { return { asked: 0, answered: 0, correct: 0, wrong: 0, refused: 0, correctShare: null, medianNs: null, p95Ns: null }; }
function close(t, ns) {
  t.correctShare = t.asked ? Number((t.correct / t.asked).toFixed(4)) : null;
  t.medianNs = quantile(ns, 0.5);
  t.p95Ns = quantile(ns, 0.95);
  return t;
}

/** Grade a population: per kind and in total, plus the wrong rows. */
export async function gradePopulation(rows, name, opts = {}) {
  const byKind = {};
  const ns = {};
  const wrongRows = [];
  const refusedRows = [];
  const all = blank();
  const allNs = [];
  for (const k of KINDS) { byKind[k] = blank(); ns[k] = []; }
  for (const row of rows) {
    const g = await gradeRow(row, opts);
    const t = byKind[row.kind];
    if (!t) continue;
    t.asked++; all.asked++;
    if (g.status === 'refused') { t.refused++; all.refused++; refusedRows.push({ id: row.id, kind: row.kind, why: g.why }); continue; }
    t.answered++; all.answered++;
    ns[row.kind].push(g.ns); allNs.push(g.ns);
    if (g.status === 'correct') { t.correct++; all.correct++; } else { t.wrong++; all.wrong++; wrongRows.push({ population: name, id: row.id, kind: row.kind, method: g.method, answer: g.head }); }
  }
  for (const k of KINDS) close(byKind[k], ns[k]);
  return { total: close(all, allNs), byKind, wrongRows, refusedRows };
}

/** The precision control: codeNative on every census prompt of the other kinds; it must answer none. */
export async function runControl(rows) {
  const answered = [];
  const kinds = new Set();
  for (const row of rows) {
    kinds.add(row.kind);
    const a = await codeNative(row.prompt);
    if (a) answered.push({ id: row.id, kind: row.kind, method: a.method });
  }
  return { asked: rows.length, kinds: kinds.size, answered: answered.length, answeredRows: answered };
}

/** The test files, run as a child; the tally lines as node --test prints them. */
export function runTests() {
  const r = spawnSync(process.execPath, ['--test', 'test/code-native.test.mjs', 'test/act-prompt.test.mjs'], { cwd: ROOT, encoding: 'utf8', timeout: 600000, maxBuffer: 64 * 1024 * 1024 });
  const out = String(r.stdout || '') + String(r.stderr || '');
  // the tally as node --test prints it: "# pass 10" (tap) or "ℹ pass 10" (spec)
  const tally = out.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^(?:#|ℹ) (?:tests|suites|pass|fail|cancelled|skipped|todo) \d+$/.test(l));
  const num = (k) => { const l = tally.find((x) => x.slice(2).startsWith(k + ' ')); return l ? Number(l.split(' ')[2]) : null; };
  return { command: TESTS_COMMAND, exitCode: r.status, tally, pass: num('pass'), fail: num('fail'), tests: num('tests'), ok: r.status === 0 && num('fail') === 0 && num('pass') > 0 };
}

/** The bar, from the parts. */
export function barOf(dev, held, control, tests) {
  const code = held.byKind.code;
  const checks = {
    heldOutShare: held.total.asked > 0 && held.total.correct / held.total.asked >= BAR.heldOutShare,
    heldOutCodeShare: code.asked > 0 && code.correct / code.asked >= BAR.heldOutCodeShare,
    devWrong: dev.total.wrong <= BAR.devWrongMax,
    control: control.answered === BAR.controlAnswers,
    tests: !!(tests && tests.ok),
  };
  return { checks, barMet: Object.values(checks).every(Boolean) };
}

const pct = (a, b) => (b ? ((100 * a) / b).toFixed(1) + '%' : 'n/a');

/** The verdict object (the test file builds one from a small real run and checks its shape). */
export function buildVerdict({ at, dev, held, control, tests, heldOut, contamination, codeSha256, firstHeldOutRun }) {
  const { checks, barMet } = barOf(dev, held, control, tests);
  const statement = 'The organism answered code, code-reading, sql, command and format prompts with no model: on the held-out rows it was right on '
    + held.total.correct + ' of ' + held.total.asked + ' (' + pct(held.total.correct, held.total.asked) + '), '
    + held.byKind.code.correct + ' of ' + held.byKind.code.asked + ' on code, wrong on ' + held.total.wrong + ' and refused ' + held.total.refused
    + '; on the development census rows it was right on ' + dev.total.correct + ' of ' + dev.total.asked + ' and wrong on ' + dev.total.wrong
    + '; the control answered ' + control.answered + ' of ' + control.asked + ' census prompts of ' + control.kinds + ' other kinds; the tests exited ' + (tests ? tests.exitCode : 'unrun')
    + '. The held-out rows share an author with the readers, so they measure generalisation to prompts that author wrote, not to strangers. '
    + (barMet ? 'The bar is met.' : 'The bar is not met: ' + Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', ') + '.');
  return {
    at,
    command: COMMAND,
    node: process.version,
    isTheBar: true,
    barMet,
    bar: { ...BAR, checks },
    split: {
      development: { source: 'bench/conceive-prompts.json', kinds: KINDS, rows: dev.total.asked, contaminated: 'development: the readers were built and tuned on these rows' },
      heldOut: { source: 'bench/code-native-heldout.jsonl', rows: held.total.asked, sha256: heldOut.sha256, pinnedSha256: HELDOUT_SHA256, written: HELDOUT_WRITTEN, contaminated: contamination },
      firstHeldOutRun,
    },
    catalogue: { operations: OPERATIONS, entries: CATALOGUE.length, primitives: PRIMITIVES.length, codeSha256 },
    development: dev,
    heldOut: held,
    control: { asked: control.asked, kinds: control.kinds, answered: control.answered, answeredRows: control.answeredRows, what: 'codeNative on every census prompt of the other kinds; it must answer none' },
    tests,
    wrongRows: [...dev.wrongRows, ...held.wrongRows],
    ns: {
      development: { median: dev.total.medianNs, p95: dev.total.p95Ns },
      heldOut: { median: held.total.medianNs, p95: held.total.p95Ns },
      what: 'nanoseconds inside codeNative per answered prompt (process.hrtime.bigint), prompt in, answer out, including the act/run.mjs runs of stated examples',
    },
    statement,
  };
}

function printPopulation(name, p) {
  console.log(name + ': asked ' + p.total.asked + ', answered ' + p.total.answered + ', correct ' + p.total.correct + ', wrong ' + p.total.wrong + ', refused ' + p.total.refused + ' (correct share ' + p.total.correctShare + '), median ' + p.total.medianNs + ' ns, p95 ' + p.total.p95Ns + ' ns');
  for (const k of KINDS) {
    const t = p.byKind[k];
    console.log('  ' + name + ' ' + k + ': asked ' + t.asked + ', answered ' + t.answered + ', correct ' + t.correct + ', wrong ' + t.wrong + ', refused ' + t.refused + ', median ' + t.medianNs + ' ns, p95 ' + t.p95Ns + ' ns');
  }
}

async function main() {
  const census = loadPrompts().prompts;
  const devRows = census.filter((r) => KINDS.includes(r.kind));
  const controlRows = census.filter((r) => !KINDS.includes(r.kind));
  const heldOut = loadHeldOut();
  if (heldOut.sha256 !== HELDOUT_SHA256) {
    console.error('held-out file changed: sha256 ' + heldOut.sha256 + ' is not the pinned ' + HELDOUT_SHA256 + '; the held-out rows are no longer the ones written before the readers');
    process.exitCode = 2;
    return;
  }
  const codeSha256 = sha256(readFileSync(CODE_FILE, 'utf8').replace(/\r\n/g, '\n'));
  let prior = null;
  try { if (existsSync(VERDICT_FILE)) prior = JSON.parse(readFileSync(VERDICT_FILE, 'utf8')); } catch { prior = null; }
  const at = new Date().toISOString();
  const firstHeldOutRun = (prior && prior.split && prior.split.firstHeldOutRun) || { at, codeSha256 };
  const reasons = ['same author: the held-out rows were written (stamp ' + HELDOUT_WRITTEN + ') before any reader, by the author of the readers, who knew the rows while writing them'];
  if (firstHeldOutRun.codeSha256 !== codeSha256) reasons.push('the readers changed after the first held-out run (' + firstHeldOutRun.at + ')');
  const contamination = reasons.join('; ');

  const dev = await gradePopulation(devRows, 'development');
  const held = await gradePopulation(heldOut.rows, 'held-out');
  const control = await runControl(controlRows);
  printPopulation('development', dev);
  printPopulation('held-out', held);
  console.log('control: codeNative on ' + control.asked + ' census prompts of ' + control.kinds + ' other kinds answered ' + control.answered);
  for (const w of [...dev.wrongRows, ...held.wrongRows]) console.log('wrong: ' + w.population + ' ' + w.id + ' ' + w.method + ' | ' + w.answer);
  for (const [pop, p] of [['development', dev], ['held-out', held]]) for (const r of p.refusedRows) console.log('refused: ' + pop + ' ' + r.id + ' | ' + r.why);
  const tests = runTests();
  console.log('tests: ' + tests.command + ' exit ' + tests.exitCode + ' | ' + tests.tally.join(' | '));
  const verdict = buildVerdict({ at, dev, held, control, tests, heldOut, contamination, codeSha256, firstHeldOutRun });
  writeFileSync(VERDICT_FILE, JSON.stringify(verdict, null, 2) + '\n');
  console.log('held-out correct share ' + pct(held.total.correct, held.total.asked) + ', code ' + pct(held.byKind.code.correct, held.byKind.code.asked) + '; development wrong ' + dev.total.wrong + '; control answered ' + control.answered + '; tests exit ' + tests.exitCode);
  console.log('barMet ' + verdict.barMet + ' -> bench/verdicts/code-native.json');
  process.exitCode = verdict.barMet ? 0 : 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((e) => { console.error(e); process.exitCode = 1; });
