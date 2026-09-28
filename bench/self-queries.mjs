#!/usr/bin/env node
// bench/self-queries.mjs: THE ORGANISM ASKED THOUSANDS OF GENERATED QUESTIONS WHOSE TRUTH IT DID NOT WRITE.
//
// His words, 2026-09-28: "simulating and stimulating itself by so many automatic queries and self iteration". The
// questions come from self/queries.mjs (a seeded generator that computes each truth itself and imports nothing under
// act/ or reason/); this bench asks every one through act/prompt.mjs ask() with the model OFF (provider 'null', in
// process, the brain bench/conceive.mjs builds: seeds/basic.mjs seedBasic with the full ledger and a 4096 ring), grades
// the answer's last line against the row's rule, and prints per kind: asked, answered, correct, wrong, refused, the
// median and p95 ask time in ns, and the run's asks per second. Author: board 34 builder (item self-queries).
//
// A WRONG EXACT ANSWER IS WORSE THAN A REFUSAL: wrong is counted apart from refused everywhere, and every wrong row is
// printed into the verdict with the whole given text (cut at 1500 characters) and the truth.
// REFUSED: an empty text or one of the miss heads (bench/conceive.mjs isMiss, the same four heads self/queries.mjs
// REFUSAL_HEADS copies; this bench checks the two lists are equal before it asks anything).
//
// THE CONTROLS, on every row before any ask, so a rule that cannot tell right from wrong never grades the organism:
//   oracle     the truth stated three ways (bare, "The answer is X.", the organism's shape of steps then the answer)
//              must grade correct on every row
//   perturbed  a nearby wrong answer (the value plus one, the other option, the other polarity, the next weekday, a
//              changed spelling) must grade wrong on every row
//   refusal    the empty text and each miss head must grade refused on every row
//   second     an independent second computation of each truth (floats, JS Date in UTC, brute force enumeration of
//              coins, dice and cards, Array reverse, regex counts), written here and sharing no code with the
//              generator, must agree with the generator's BigInt truth on every row
//   sockets    net.Socket connect and fetch are replaced before ask() loads; any attempt is counted and refused
//   instrument the ask path (act/prompt.mjs and what it imports, seeds/basic.mjs, the generator, this file) is hashed at
//              the start and at the end; a run whose code changed under it is not the bar
//   self test  node --test test/self-queries.test.mjs runs first (50 truths verified by hand, determinism, import
//              isolation, the rules); its pass and fail counts are recorded
//
// THE SPLIT: the development set is the census wording (bench/conceive-prompts.json) the templates were written from,
// and dev seeds 7, 8, 9 (the smoke runs and the test file). The held out rows are seeds 34 and 35: never generated or
// read while self/queries.mjs was written; the verdict records the sha256 of each seed's rows and the generator's sha
// and write stamp.
//
// THE BAR (board 34, item self-queries): isTheBar when --n 5000 ran to the end at each of two seeds, the self test
// passed with 0 failures, and every control above held; barMet when wrong is 0 on every kind AND the answered share
// (answered = correct + wrong) over all kinds is at least 0.5. Only the bar writes bench/verdicts/self-queries.json and
// bench/verdicts/self-queries-misses.jsonl; any other run writes the -partial pair (or nothing with --nowrite).
// THE ITERATION: the two seeds side by side; per template the answered and correct shares at each seed and their
// difference, and the templates answered at one seed and refused at the other. Same templates, other numbers: a
// difference is the reader depending on the numbers (GSM-Symbolic, arXiv 2410.05229, measured the same drop on GSM8K).
//
// The bar (model OFF; launched through the RAM and disk budget):
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/self-queries.mjs --n 5000 --seed 34 --seed 35
// Flags: --n N (default 5000), --seed S (repeatable; default 34 and 35), --nowrite, --json, --quiet, --no-selftest.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { generate, grade, oracleText, perturbedText, KINDS, TEMPLATES, REFUSAL_HEADS, GENERATOR_VERSION } from '../self/queries.mjs';
import { isMiss, MISS_HEADS, instrumentOf, WARM } from './conceive.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
export const BAR = Object.freeze({ n: 5000, seeds: 2, answeredShare: 0.5 });
export const DEFAULT_SEEDS = Object.freeze([34, 35]);
export const DEV_SEEDS = Object.freeze([7, 8, 9]);
export const VERDICTS = Object.freeze({
  bar: 'bench/verdicts/self-queries.json', misses: 'bench/verdicts/self-queries-misses.jsonl',
  partial: 'bench/verdicts/self-queries-partial.json', missesPartial: 'bench/verdicts/self-queries-misses-partial.jsonl',
});
export const BAR_COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/verdicts -- node --max-old-space-size=4000 bench/self-queries.mjs --n 5000 --seed 34 --seed 35';
export const TEST_FILE = 'test/self-queries.test.mjs';
export const INSTRUMENT_ROOTS = Object.freeze(['act/prompt.mjs', 'seeds/basic.mjs', 'self/queries.mjs', 'bench/self-queries.mjs']);
const GIVEN_CUT = 1500;

const r4 = (x) => (x === null || !Number.isFinite(x) ? null : Math.round(x * 10000) / 10000);
const sha256 = (s) => createHash('sha256').update(s).digest('hex');
const quantile = (xs, q) => { if (!xs.length) return null; const s = Float64Array.from(xs).sort(); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const median = (xs) => { if (!xs.length) return null; const s = Float64Array.from(xs).sort(); return s[Math.floor((s.length - 1) / 2)]; };
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ---------------------------------------------------------------- args
export function parseArgs(argv) {
  const a = { n: BAR.n, seeds: [], write: true, json: false, quiet: false, selfTest: true };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const val = () => { const v = argv[++i]; if (v === undefined) throw new Error(k + ' needs a value'); return v; };
    if (k === '--n') a.n = Number(val());
    else if (k === '--seed') a.seeds.push(Number(val()));
    else if (k === '--nowrite') a.write = false;
    else if (k === '--json') a.json = true;
    else if (k === '--quiet') a.quiet = true;
    else if (k === '--no-selftest') a.selfTest = false;
    else throw new Error('unknown flag ' + k);
  }
  if (!a.seeds.length) a.seeds = [...DEFAULT_SEEDS];
  if (!Number.isInteger(a.n) || a.n < 1) throw new Error('--n must be a positive integer');
  for (const s of a.seeds) if (!Number.isInteger(s) || s < 0 || s > 0xFFFFFFFF) throw new Error('--seed must be an integer in [0, 2^32)');
  if (new Set(a.seeds).size !== a.seeds.length) throw new Error('a seed was given twice');
  return a;
}

// ---------------------------------------------------------------- the second opinion (independent of the generator)
const near = (x, y) => Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
const fnum = (s) => { const t = String(s); if (t.includes('/')) { const [p, q] = t.split('/'); return Number(p) / Number(q); } return Number(t); };
const UNIT_FACTOR = { millimeter: 0.001, centimeter: 0.01, meter: 1, kilometer: 1000, milligram: 0.001, gram: 1, kilogram: 1000, milliliter: 0.001, centiliter: 0.01, liter: 1, second: 1, minute: 60, hour: 3600, day: 86400, week: 604800 };
const SUNDAY_FIRST = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const utc = (isoOrYmd) => { const [y, m, d] = isoOrYmd; return Date.UTC(y, m - 1, d); };
const ymdOf = (s) => s.split('-').map(Number);
const isPrimeTrial = (n) => { if (n < 2) return false; for (let k = 2; k * k <= n; k++) if (n % k === 0) return false; return true; };
function coinOutcomes(n) { const out = []; for (let m = 0; m < 2 ** n; m++) { let h = 0; for (let b = 0; b < n; b++) if ((m >> b) & 1) h++; out.push(h); } return out; }
/** The truth of a row computed a second way: a number (compared within 1e-9) or a string (compared exactly), or null when no second way is written. */
export function secondOpinion(row) {
  const a = row.args, t = row.template, sub = row.sub || '';
  switch (row.kind) {
    case 'arithmetic': {
      if (sub === 'int.add') return a.a + a.b;
      if (sub === 'int.sub') return a.a - a.b;
      if (sub === 'int.mul') return a.a * a.b;
      if (sub === 'int.div') return a.a / a.b;
      if (sub.startsWith('dec.') || sub.startsWith('frac.')) { const x = fnum(a.a), y = fnum(a.b); return a.op === 'add' ? x + y : a.op === 'sub' ? x - y : a.op === 'mul' ? x * y : x / y; }
      if (sub === 'prec.add-mul') return a.a + a.b * a.c;
      if (sub === 'prec.sub-mul') return a.a - a.b * a.c;
      if (sub === 'prec.parens') return (a.a + a.b) * a.c;
      if (sub === 'prec.four') return a.a * a.b - a.c * a.d;
      if (sub === 'pct') return (a.p * a.x) / 100;
      if (sub === 'range') { let s = 0; for (let i = a.a; i <= a.b; i++) s += i; return s; }
      if (sub === 'mod') return a.a - Math.floor(a.a / a.b) * a.b;
      return null;
    }
    case 'sequence': {
      if (sub.startsWith('next.')) {
        const xs = a.shown.map(Number), L = xs.length;
        if (a.rule === 'arith') return xs[L - 1] + (xs[1] - xs[0]);
        if (a.rule === 'geom') return xs[L - 1] * (xs[1] / xs[0]);
        if (a.rule === 'square') { const r = Math.round(Math.sqrt(xs[L - 1])); return (r + 1) * (r + 1); }
        if (a.rule === 'fib') return xs[L - 1] + xs[L - 2];
        return null;
      }
      if (a.rule === 'arith') { let v = a.a; for (let i = 1; i < a.n; i++) v += a.d; return v; }
      if (a.rule === 'geom') { let v = a.a; for (let i = 1; i < a.n; i++) v *= a.q; return v; }
      if (a.rule === 'square') return a.n * a.n;
      if (a.rule === 'fib') { const f = [0, 1, 1]; for (let i = 3; i <= a.n; i++) f.push(f[i - 1] + f[i - 2]); return f[a.n]; }
      return null;
    }
    case 'units': return (Number(a.value) * UNIT_FACTOR[a.from]) / UNIT_FACTOR[a.to];
    case 'calendar': {
      if (sub === 'days-in-month') return new Date(Date.UTC(a.y, a.m, 0)).getUTCDate();
      if (sub === 'days-in-year') return (Date.UTC(a.y + 1, 0, 1) - Date.UTC(a.y, 0, 1)) / 86400000;
      if (sub === 'leap') return new Date(Date.UTC(a.y, 1, 29)).getUTCMonth() === 1 ? 'yes' : 'no';
      if (sub === 'weekday') return SUNDAY_FIRST[new Date(Date.UTC(a.y, a.m - 1, a.d)).getUTCDay()];
      if (sub === 'between') return (utc(ymdOf(a.to)) - utc(ymdOf(a.from))) / 86400000;
      if (sub === 'shift') return SUNDAY_FIRST[(SUNDAY_FIRST.indexOf(a.today) + a.k) % 7];
      return null;
    }
    case 'counting': {
      if (sub === 'letters') return Array.from(a.word).length;
      if (sub === 'vowels') return (a.word.match(/[aeiou]/g) || []).length;
      if (sub === 'occurrences') return a.word.split(a.letter).length - 1;
      if (sub === 'words') return a.sentence.trim().split(/\s+/).length;
      return null;
    }
    case 'spelling': {
      if (sub === 'backwards') return Array.from(a.word).reverse().join('');
      if (sub === 'nth-letter') return a.word.charAt(a.n - 1);
      return null;
    }
    case 'comparison': {
      const xs = a.options.map(fnum);
      if (a.relation) return (a.relation === 'greater' ? xs[0] > xs[1] : xs[0] < xs[1]) ? 'yes' : 'no';
      const dir = row.gradeRule.direction;
      let best = 0; for (let i = 1; i < xs.length; i++) if (dir === 'max' ? xs[i] > xs[best] : xs[i] < xs[best]) best = i;
      return a.options[best];
    }
    case 'probability': {
      if (t.endsWith('coin.one-flip-fraction')) return 0.5;
      if (t.endsWith('coin.all-alike-fraction')) { const o = coinOutcomes(a.n); return o.filter((h) => (a.side === 'heads' ? h === a.n : h === 0)).length / o.length; }
      if (t.endsWith('coin.exactly-k-heads')) { const o = coinOutcomes(a.n); return o.filter((h) => h === a.k).length / o.length; }
      if (t.endsWith('die.one-face')) return 1 / a.s;
      if (t.endsWith('die.class-of-faces')) {
        const test = { 'an even number': (f) => f % 2 === 0, 'an odd number': (f) => f % 2 !== 0, 'a multiple of 3': (f) => f % 3 === 0, 'a prime number': isPrimeTrial }[a.cls];
        let hit = 0; for (let f = 1; f <= a.s; f++) if (test(f)) hit++; return hit / a.s;
      }
      if (t.endsWith('die.greater-than')) { let hit = 0; for (let f = 1; f <= a.s; f++) if (f > a.k) hit++; return hit / a.s; }
      if (t.endsWith('dice.sum-of-two')) { let hit = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (x + y === a.S) hit++; return hit / 36; }
      if (t.includes('bag.')) return (a.color === 'red' ? a.red : a.blue) / (a.red + a.blue);
      if (t.endsWith('jar.three-colors')) return a[a.color] / (a.red + a.green + a.blue);
      if (t.endsWith('cards.multiple-of')) { let hit = 0; for (let c = 1; c <= a.N; c++) if (c % a.K === 0) hit++; return hit / a.N; }
      if (t.endsWith('letters.letter-of-a-word')) return (a.word.split(a.letter).length - 1) / Array.from(a.word).length;
      return null;
    }
    default: return null;
  }
}
/** agree, disagree or none (no second way written for this row). */
export function crossCheck(row) {
  const s = secondOpinion(row);
  if (s === null || s === undefined) return 'none';
  if (typeof s === 'number') return near(s, fnum(row.gradeRule.value ?? row.truth)) ? 'agree' : 'disagree';
  return String(s).toLowerCase() === String(row.truth).toLowerCase() ? 'agree' : 'disagree';
}

// ---------------------------------------------------------------- the controls
/** Every control on one row: [name, passed]. */
export function controlsOf(row) {
  const out = [];
  for (const style of [0, 1, 2]) out.push(['oracle' + style, grade(oracleText(row, style), row.gradeRule).state === 'correct']);
  out.push(['perturbed', grade(perturbedText(row), row.gradeRule).state === 'wrong']);
  out.push(['empty', grade('', row.gradeRule).state === 'refused']);
  for (const h of REFUSAL_HEADS) out.push(['head', grade(h + ': ' + row.prompt, row.gradeRule, { refusal: refusalOf }).state === 'refused']);
  return out;
}
/** The refusal test the organism's answers are graded with: empty, or bench/conceive.mjs isMiss. */
export const refusalOf = (t) => !String(t ?? '').trim() || isMiss(t);

// ---------------------------------------------------------------- the model-off guard
const guard = { sockets: 0, fetches: 0, installed: false };
function installGuard() {
  if (guard.installed) return guard;
  const connect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function refusedConnect() { guard.sockets++; throw new Error('bench/self-queries.mjs runs model off: a socket was refused'); };
  guard.restoreConnect = () => { net.Socket.prototype.connect = connect; };
  if (typeof globalThis.fetch === 'function') {
    const f = globalThis.fetch;
    globalThis.fetch = async () => { guard.fetches++; throw new Error('bench/self-queries.mjs runs model off: a fetch was refused'); };
    guard.restoreFetch = () => { globalThis.fetch = f; };
  }
  guard.installed = true;
  return guard;
}
function removeGuard() {
  if (!guard.installed) return;
  guard.restoreConnect?.(); guard.restoreFetch?.();
  guard.installed = false;
}

// ---------------------------------------------------------------- the self test
/** node --test on the item's test file, its tally read from the TAP summary. */
export function runSelfTest() {
  const cmd = ['--test', '--test-reporter=tap', TEST_FILE];
  let out = '', code = 0;
  try { out = execFileSync(process.execPath, cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, env: { ...process.env, SELF_QUERIES_CHILD: '1' } }); }
  catch (e) { out = String(e.stdout || '') + String(e.stderr || ''); code = e.status ?? 1; }
  const num = (k) => { const m = new RegExp('^# ' + k + ' (\\d+)', 'm').exec(out); return m ? Number(m[1]) : null; };
  const r = { command: 'node --test --test-reporter=tap ' + TEST_FILE, exit: code, tests: num('tests'), pass: num('pass'), fail: num('fail') };
  r.ok = code === 0 && r.fail === 0 && r.pass !== null && r.pass > 0 && r.pass === r.tests;
  r.tally = '# tests ' + r.tests + ' # pass ' + r.pass + ' # fail ' + r.fail;
  return r;
}

// ---------------------------------------------------------------- the counters
const emptyCell = () => ({ asked: 0, answered: 0, correct: 0, wrong: 0, refused: 0 });
function bump(cell, state) { cell.asked++; cell[state]++; if (state !== 'refused') cell.answered++; }
function finishCell(c, ns) {
  const out = { ...c, answeredShare: c.asked ? r4(c.answered / c.asked) : null, correctShare: c.asked ? r4(c.correct / c.asked) : null };
  if (ns) { out.medianNs = median(ns); out.p95Ns = quantile(ns, 0.95); }
  return out;
}
/** Every wrong and refused row grouped by template, the groups ranked by count (then by template id). */
export function groupMisses(rows) {
  const g = new Map();
  for (const r of rows) {
    if (r.state !== 'wrong' && r.state !== 'refused') continue;
    if (!g.has(r.template)) g.set(r.template, { template: r.template, kind: r.kind, count: 0, wrong: 0, refused: 0, rows: [] });
    const x = g.get(r.template);
    x.count++; x[r.state]++; x.rows.push(r);
  }
  return [...g.values()].sort((a, b) => b.count - a.count || (a.template < b.template ? -1 : a.template > b.template ? 1 : 0));
}

// ---------------------------------------------------------------- the run
async function newBrain(name) {
  const { seedBasic } = await import(pathToFileURL(path.join(ROOT, 'seeds/basic.mjs')).href);
  return seedBasic({ name, ledger: 'full', ledgerRing: 4096 });
}

/**
 * Ask n generated rows at each seed. cfg: { n, seeds, write, selfTest, log }.
 * @returns the verdict object (written only when cfg.write)
 */
export async function run(cfg = {}) {
  const n = cfg.n ?? BAR.n, seeds = cfg.seeds ?? [...DEFAULT_SEEDS], log = cfg.log ?? (() => {});
  const at = new Date().toISOString();
  const t0 = Date.now();
  const command = cfg.command ?? ('node bench/self-queries.mjs --n ' + n + seeds.map((s) => ' --seed ' + s).join(''));
  const headsEqual = JSON.stringify([...REFUSAL_HEADS]) === JSON.stringify([...MISS_HEADS]);
  if (!headsEqual) throw new Error('self/queries.mjs REFUSAL_HEADS differ from bench/conceive.mjs MISS_HEADS');

  const selfTest = cfg.selfTest === false ? { command: 'node --test ' + TEST_FILE, skipped: true, ok: false } : runSelfTest();
  if (!selfTest.skipped) log('self test: ' + selfTest.command + ': ' + selfTest.tally + (selfTest.ok ? '' : ' (FAILED, exit ' + selfTest.exit + ')'));

  const genFile = path.join(ROOT, 'self/queries.mjs');
  const generator = { file: 'self/queries.mjs', version: GENERATOR_VERSION, sha: sha256(readFileSync(genFile)).slice(0, 16), mtime: statSync(genFile).mtime.toISOString(), templates: TEMPLATES.length };
  const instrumentStart = instrumentOf([...INSTRUMENT_ROOTS]);
  installGuard();
  const socketsBefore = guard.sockets + guard.fetches;
  let ask;
  try { ({ ask } = await import(pathToFileURL(path.join(ROOT, 'act/prompt.mjs')).href)); } catch (e) { removeGuard(); throw e; }

  const control = { rows: 0, checks: 0, failed: 0, byName: {} };
  const cross = { agree: 0, disagree: 0, none: 0, disagreeRows: [] };
  const perSeed = [];
  const all = [];
  const kindCells = Object.fromEntries(KINDS.map((k) => [k, emptyCell()]));
  const kindNs = Object.fromEntries(KINDS.map((k) => [k, []]));
  const tplCells = new Map(TEMPLATES.map((t) => [t.id, { kind: t.kind, ...emptyCell(), bySeed: {} }]));
  const subCells = new Map();
  const allNs = [];
  let askNsSum = 0;

  try {
    for (const seed of seeds) {
      const rows = generate({ seed, n });
      const rowsSha = sha256(rows.map((r) => JSON.stringify([r.id, r.template, r.prompt, r.truth, r.gradeRule])).join('\n'));
      for (const r of rows) {
        control.rows++;
        for (const [name, ok] of controlsOf(r)) {
          control.checks++;
          const c = (control.byName[name] ??= { checks: 0, failed: 0 });
          c.checks++;
          if (!ok) { control.failed++; c.failed++; }
        }
        const x = crossCheck(r);
        cross[x]++;
        if (x === 'disagree' && cross.disagreeRows.length < 50) cross.disagreeRows.push({ id: r.id, prompt: r.prompt, truth: r.truth, second: String(secondOpinion(r)) });
      }
      const brain = await newBrain('self-queries-' + seed);
      for (const w of WARM) await ask(brain, w, { provider: 'null', k: 5, events: [] });
      const cells = Object.fromEntries(KINDS.map((k) => [k, emptyCell()]));
      const ns = Object.fromEntries(KINDS.map((k) => [k, []]));
      const ts = Date.now();
      let done = 0;
      for (const r of rows) {
        const a0 = process.hrtime.bigint();
        let res, err = null;
        try { res = await ask(brain, r.prompt, { provider: 'null', k: 5, events: [] }); } catch (e) { err = e; }
        const dns = Number(process.hrtime.bigint() - a0);
        const text = err ? '' : String(res?.text ?? '');
        const g = grade(text, r.gradeRule, { refusal: refusalOf });
        const rec = {
          id: r.id, seed, index: r.index, kind: r.kind, template: r.template, sub: r.sub, prompt: r.prompt, truth: r.truth,
          state: g.state, candidate: g.candidate, read: g.read, why: g.why, ns: dns,
          route: err ? 'threw' : res?.route ?? null, from: err ? null : res?.from ?? null, error: err ? String(err.message || err).slice(0, 300) : null,
          given: text.length > GIVEN_CUT ? text.slice(0, GIVEN_CUT) + ' [cut at ' + GIVEN_CUT + ' of ' + text.length + ' characters]' : text,
        };
        all.push(rec);
        bump(cells[r.kind], g.state); ns[r.kind].push(dns);
        bump(kindCells[r.kind], g.state); kindNs[r.kind].push(dns);
        const tc = tplCells.get(r.template); bump(tc, g.state); bump((tc.bySeed[seed] ??= emptyCell()), g.state);
        const sk = r.kind + '.' + (r.sub || '-');
        if (!subCells.has(sk)) subCells.set(sk, emptyCell());
        bump(subCells.get(sk), g.state);
        allNs.push(dns); askNsSum += dns;
        done++;
      }
      const wallMs = Date.now() - ts;
      const byKind = Object.fromEntries(KINDS.map((k) => [k, finishCell(cells[k], ns[k])]));
      const tot = emptyCell();
      for (const k of KINDS) for (const f of Object.keys(tot)) tot[f] += cells[k][f];
      perSeed.push({ seed, n, ran: done, complete: done === n, rowsSha256: rowsSha, wallMs, byKind, total: finishCell(tot) });
      for (const k of KINDS) {
        const c = byKind[k];
        log('seed ' + seed + ' ' + k.padEnd(12) + ' asked ' + c.asked + ' answered ' + c.answered + ' correct ' + c.correct + ' wrong ' + c.wrong + ' refused ' + c.refused + ' median ' + c.medianNs + ' ns p95 ' + c.p95Ns + ' ns');
      }
      const T = perSeed[perSeed.length - 1].total;
      log('seed ' + seed + ' total        asked ' + T.asked + ' answered ' + T.answered + ' correct ' + T.correct + ' wrong ' + T.wrong + ' refused ' + T.refused + ' answered share ' + T.answeredShare + ' wall ' + wallMs + ' ms');
    }
  } finally {
    removeGuard();
  }
  const socketAttempts = guard.sockets + guard.fetches - socketsBefore;
  const instrumentEnd = instrumentOf([...INSTRUMENT_ROOTS]);
  const wallMs = Date.now() - t0;

  // ---- the aggregate
  const byKind = Object.fromEntries(KINDS.map((k) => {
    const c = finishCell(kindCells[k], kindNs[k]);
    c.bySeed = Object.fromEntries(perSeed.map((p) => [p.seed, p.byKind[k]]));
    return [k, c];
  }));
  const total = emptyCell();
  for (const k of KINDS) for (const f of Object.keys(total)) total[f] += kindCells[k][f];
  const totals = finishCell(total);
  const byTemplate = {};
  for (const [id, c] of tplCells) {
    const bySeed = Object.fromEntries(Object.entries(c.bySeed).map(([s, x]) => [s, finishCell(x)]));
    byTemplate[id] = { ...finishCell({ asked: c.asked, answered: c.answered, correct: c.correct, wrong: c.wrong, refused: c.refused }), kind: c.kind, bySeed };
  }
  const bySub = Object.fromEntries([...subCells].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, c]) => [k, finishCell(c)]));

  // ---- the paired difference between the first two seeds, per template
  let paired = null;
  if (seeds.length >= 2) {
    const [sa, sb] = seeds;
    const rowsP = [];
    for (const [id, c] of Object.entries(byTemplate)) {
      const A = c.bySeed[sa], B = c.bySeed[sb];
      if (!A || !B) { rowsP.push({ template: id, kind: c.kind, a: A || null, b: B || null, dAnswered: null, dCorrect: null, split: 'not drawn at both seeds' }); continue; }
      const dAnswered = r4(B.answeredShare - A.answeredShare), dCorrect = r4(B.correctShare - A.correctShare);
      const split = (A.answered > 0) !== (B.answered > 0) ? 'answered at one seed, refused at the other' : null;
      rowsP.push({ template: id, kind: c.kind, a: { asked: A.asked, answeredShare: A.answeredShare, correctShare: A.correctShare, wrong: A.wrong }, b: { asked: B.asked, answeredShare: B.answeredShare, correctShare: B.correctShare, wrong: B.wrong }, dAnswered, dCorrect, split });
    }
    rowsP.sort((x, y) => (Math.abs(y.dCorrect ?? 0) + Math.abs(y.dAnswered ?? 0)) - (Math.abs(x.dCorrect ?? 0) + Math.abs(x.dAnswered ?? 0)) || (x.template < y.template ? -1 : 1));
    const moved = rowsP.filter((p) => (p.dAnswered ?? 0) !== 0 || (p.dCorrect ?? 0) !== 0);
    paired = {
      seeds: [sa, sb], templates: rowsP.length, moved: moved.length,
      splitTemplates: rowsP.filter((p) => p.split === 'answered at one seed, refused at the other').map((p) => p.template),
      maxAbsDCorrect: rowsP.reduce((m, p) => Math.max(m, Math.abs(p.dCorrect ?? 0)), 0),
      rows: rowsP,
    };
    log('paired seeds ' + sa + ' and ' + sb + ': ' + moved.length + ' of ' + rowsP.length + ' templates moved; answered at one seed and refused at the other: ' + paired.splitTemplates.length + '; max |d correct share| ' + r4(paired.maxAbsDCorrect));
    for (const p of rowsP) {
      if (!p.a || !p.b) { log('  paired ' + p.template + ' not drawn at both seeds'); continue; }
      log('  paired ' + p.template.padEnd(48) + ' answered ' + p.a.answeredShare + ' -> ' + p.b.answeredShare + ' (' + (p.dAnswered >= 0 ? '+' : '') + p.dAnswered + ') correct ' + p.a.correctShare + ' -> ' + p.b.correctShare + ' (' + (p.dCorrect >= 0 ? '+' : '') + p.dCorrect + ')' + (p.split ? ' SPLIT' : ''));
    }
  }

  // ---- the wrong rows, the misses
  const wrongAll = all.filter((r) => r.state === 'wrong');
  const wrongRows = wrongAll.map((r) => ({ id: r.id, kind: r.kind, template: r.template, prompt: r.prompt, given: r.given, candidate: r.candidate, truth: r.truth, why: r.why, route: r.route, from: r.from }));
  const groups = groupMisses(all);

  // ---- the checks
  const everySeedComplete = perSeed.length === seeds.length && perSeed.every((p) => p.complete);
  const nsSorted = allNs.length;
  const checks = {
    ranToTheEnd: everySeedComplete,
    barSize: n === BAR.n && seeds.length >= BAR.seeds,
    selfTestPassed: selfTest.ok === true,
    controlsHeld: control.failed === 0 && control.checks > 0,
    secondOpinionAgrees: cross.disagree === 0 && cross.none === 0 && cross.agree === control.rows,
    modelOff: socketAttempts === 0,
    instrumentStable: instrumentStart.sha === instrumentEnd.sha && instrumentStart.missing.length === 0,
    refusalHeadsEqual: headsEqual,
  };
  const isTheBar = Object.values(checks).every(Boolean);
  const wrongByKind = Object.fromEntries(KINDS.map((k) => [k, byKind[k].wrong]));
  const wrongZeroEveryKind = KINDS.every((k) => byKind[k].wrong === 0 && byKind[k].asked > 0);
  const answeredShare = totals.asked ? totals.answered / totals.asked : null;
  const barMet = isTheBar && wrongZeroEveryKind && answeredShare !== null && answeredShare >= BAR.answeredShare;
  const notTheBarBecause = isTheBar ? null : Object.entries(checks).filter(([, v]) => !v).map(([k]) => k).join(', ');
  const qps = askNsSum > 0 ? r4(totals.asked / (askNsSum / 1e9)) : null;
  const wallQps = wallMs > 0 ? r4(totals.asked / (wallMs / 1000)) : null;

  const kindWords = KINDS.map((k) => k + ' ' + byKind[k].correct + ' correct, ' + byKind[k].wrong + ' wrong, ' + byKind[k].refused + ' refused of ' + byKind[k].asked).join('; ');
  const statement = 'The organism, model off, was asked ' + totals.asked + ' generated questions (' + n + ' at each of seeds ' + seeds.join(' and ')
    + ') whose truths self/queries.mjs computed without importing anything under act/ or reason/. It answered ' + totals.answered + ' ('
    + (answeredShare === null ? 'absent' : (answeredShare * 100).toFixed(2) + '%') + '), of which ' + totals.correct + ' were correct and ' + totals.wrong
    + ' wrong, and refused ' + totals.refused + '. By kind: ' + kindWords + '. A wrong answer is counted apart from a refusal because it is worse: '
    + (totals.wrong === 0 ? 'no row was answered wrong.' : totals.wrong + ' rows were answered wrong, every one listed in wrongRows with the whole given text.')
    + ' The grading rules were checked on every row first: the stated truth graded correct ' + (control.byName.oracle0 ? 'on all ' + control.byName.oracle0.checks + ' rows in three styles' : '') + ', a perturbed answer graded wrong and a refusal graded refused, with '
    + control.failed + ' failures in ' + control.checks + ' checks, and an independent second computation agreed with ' + cross.agree + ' of ' + control.rows + ' truths.'
    + (isTheBar ? ' This run is the bar; barMet is ' + barMet + (barMet ? '.' : ' because ' + [!wrongZeroEveryKind ? 'wrong is not 0 on every kind' : null, answeredShare !== null && answeredShare < BAR.answeredShare ? 'the answered share is under ' + BAR.answeredShare : null].filter(Boolean).join(' and ') + '.') : ' This run is not the bar (' + notTheBarBecause + ').');

  const verdict = {
    at, command, node: process.version, host: { platform: process.platform, cpus: os.cpus().length, freeMbAtEnd: Math.round(os.freemem() / 1048576) },
    item: 'board 34 self-queries', model: 'off (provider null, in process; sockets and fetch refused and counted)',
    isTheBar, barMet, notTheBarBecause, bar: { n: BAR.n, seeds: BAR.seeds, wrongOnEveryKind: 0, answeredShareAtLeast: BAR.answeredShare, answeredShare: r4(answeredShare), wrongByKind },
    checks,
    split: {
      development: { what: 'the census wording of bench/conceive-prompts.json the templates were written from, and dev seeds ' + DEV_SEEDS.join(', ') + ' (the smoke runs and test/self-queries.test.mjs)', seeds: [...DEV_SEEDS] },
      heldOut: { seeds: [...seeds], rowsSha256: Object.fromEntries(perSeed.map((p) => [p.seed, p.rowsSha256])), generatorSha: generator.sha, generatorWrittenAt: generator.mtime, note: 'rows at these seeds were never generated or read while self/queries.mjs was written; the sha256 is over each row\'s id, template, prompt, truth and rule' },
      contaminated: seeds.some((s) => DEV_SEEDS.includes(s)),
    },
    generator,
    selfTest,
    controls: { rows: control.rows, checks: control.checks, failed: control.failed, byName: control.byName },
    secondOpinion: { agree: cross.agree, disagree: cross.disagree, none: cross.none, disagreeRows: cross.disagreeRows },
    sockets: socketAttempts,
    instrument: { start: { sha: instrumentStart.sha, files: instrumentStart.files, missing: instrumentStart.missing }, end: { sha: instrumentEnd.sha, files: instrumentEnd.files }, stable: checks.instrumentStable, promptMjs: instrumentEnd.promptMjs },
    totals,
    bySeed: perSeed,
    byKind,
    byTemplate,
    bySub,
    paired,
    wrongRows,
    misses: { groups: groups.length, rows: groups.reduce((s, g) => s + g.count, 0), top: groups.slice(0, 15).map((g) => ({ template: g.template, count: g.count, wrong: g.wrong, refused: g.refused })) },
    ns: { asks: nsSorted, median: median(allNs), p95: quantile(allNs, 0.95), max: allNs.length ? Math.max(...allNs) : null, sum: askNsSum },
    qps, wallQps, wallMs,
    statement,
  };

  log('controls: ' + control.checks + ' checks on ' + control.rows + ' rows, ' + control.failed + ' failed; second opinion agree ' + cross.agree + ' disagree ' + cross.disagree + ' none ' + cross.none + '; sockets ' + socketAttempts + '; instrument ' + instrumentStart.sha + ' -> ' + instrumentEnd.sha);
  log('controls by name: ' + Object.entries(control.byName).map(([k, c]) => k + ' ' + (c.checks - c.failed) + '/' + c.checks).join(', '));
  // every per-kind number the statement quotes, summed over the seeds, is printed here so the statement quotes only printed lines
  for (const k of KINDS) {
    const c = byKind[k];
    log('seeds ' + seeds.join('+') + ' ' + k.padEnd(12) + ' asked ' + c.asked + ' answered ' + c.answered + ' correct ' + c.correct + ' wrong ' + c.wrong + ' refused ' + c.refused);
  }
  log('total asked ' + totals.asked + ' answered ' + totals.answered + ' (' + (answeredShare === null ? 'absent' : (answeredShare * 100).toFixed(2) + '%') + ') correct ' + totals.correct + ' wrong ' + totals.wrong + ' refused ' + totals.refused + ' answered share ' + r4(answeredShare) + '; median ' + verdict.ns.median + ' ns p95 ' + verdict.ns.p95 + ' ns; qps ' + qps + ' (in ask), ' + wallQps + ' (wall)');
  log('statement: ' + statement);
  for (const g of groups.slice(0, 10)) log('  miss group ' + g.template + ': ' + g.count + ' (' + g.wrong + ' wrong, ' + g.refused + ' refused)');

  if (cfg.write) {
    const target = isTheBar ? VERDICTS.bar : VERDICTS.partial;
    const missFile = isTheBar ? VERDICTS.misses : VERDICTS.missesPartial;
    verdict.wroteTo = target; verdict.missesFile = missFile;
    mkdirSync(path.join(ROOT, 'bench/verdicts'), { recursive: true });
    const lines = [];
    groups.forEach((g, i) => {
      lines.push(JSON.stringify({ group: g.template, rank: i + 1, kind: g.kind, count: g.count, wrong: g.wrong, refused: g.refused }));
      for (const r of g.rows) {
        lines.push(JSON.stringify(r.state === 'wrong'
          ? { template: r.template, id: r.id, state: r.state, prompt: r.prompt, truth: r.truth, candidate: r.candidate, why: r.why, given: r.given, route: r.route }
          : { template: r.template, id: r.id, state: r.state, prompt: r.prompt, truth: r.truth, head: String(r.given).split('\n')[0].slice(0, 120), route: r.route }));
      }
    });
    writeFileSync(path.join(ROOT, missFile), lines.join('\n') + (lines.length ? '\n' : ''));
    writeFileSync(path.join(ROOT, target), JSON.stringify(verdict, null, 2) + '\n');
    log('verdict ' + target + ' isTheBar ' + isTheBar + ' barMet ' + barMet + '; misses ' + missFile + ' (' + groups.length + ' groups, ' + verdict.misses.rows + ' rows)');
  } else {
    verdict.wroteTo = null;
    log('verdict not written (--nowrite) isTheBar ' + isTheBar + ' barMet ' + barMet);
  }
  return verdict;
}

// ---------------------------------------------------------------- main
const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const a = parseArgs(process.argv.slice(2));
  const command = 'node bench/self-queries.mjs ' + process.argv.slice(2).join(' ');
  const v = await run({ ...a, command, log: a.quiet || a.json ? () => {} : (s) => console.log(s) });
  if (a.json) console.log(JSON.stringify(v, null, 2));
  else console.log('isTheBar ' + v.isTheBar + ' barMet ' + v.barMet + (v.notTheBarBecause ? ' (not the bar: ' + v.notTheBarBecause + ')' : ''));
  if (!v.checks.controlsHeld || !v.checks.secondOpinionAgrees || !v.checks.modelOff) process.exitCode = 1;
}
