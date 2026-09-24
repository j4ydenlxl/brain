// bench/synth.mjs: THE CODE REGION ON THE PUBLIC RULER. Does sampling, testing against the
// prompt's own examples and one repair round (reason/synth.mjs) beat one sample from the same
// model, graded by the record's hidden tests?
//
// THREE STAGES, run in this order, each journaled row by row so a killed run loses nothing:
//
//   humaneval  MultiPL-E JavaScript HumanEval records 0 to 39 BY INDEX (HumanEval_0 to
//              HumanEval_41; the set skips 32 and 38), the small model (qwen3:1.7b). Arms,
//              interleaved record by record with the first arm rotating:
//                organism k=5+repair  synthesize({ k: 5, repair: true })
//                organism k=5         the same draws before the repair round: the pick among
//                                     the first up to 5 samples (sampling stops at the first
//                                     that passes every extracted example)
//                organism k=1         the first draw alone
//                model alone          bench/public.mjs's shape exactly: act/code.mjs
//                                     firstPrompt(humanEvalTask(record)), ONE call, extractCode,
//                                     cut at the record's stop tokens
//                null                 no model: a function that returns undefined
//              The three organism arms are NESTED: k=1 and k=5 are prefixes of the k=5+repair
//              draw stream. Every draw has a seed derived from the prompt and its position, so
//              a standalone k=1 run asks the model the same question with the same seed as the
//              first draw here. Their differences are selection and repair, not sampling luck.
//   code       the 40 task internal suite (bench/fixtures/code-tasks.json, notes/code.md), the
//              small model, the same five arms; the prompt the organism gets is the task
//              rendered as a MultiPL-E prompt (taskPrompt: spec, visible examples as doctests,
//              signature); model alone is bench/code.mjs's alone arm (firstPrompt, one call);
//              graded on the hidden cases by act/run.mjs runCases, every case must pass.
//   big        HumanEval records 0 to 39 again with the big model (qwen3:30b-a3b), arms
//              organism k=1 and model alone only, stopped at --bigMinutes (25) of wall clock;
//              a record not reached by then is absent and the stage is marked partial.
//
// ONE RULER. A HumanEval record counts when the record's own tests string runs to the end in
// act/run.mjs's sandbox on the arm's code cut at the record's stop tokens: exactly how
// bench/public.mjs grades. The tests string is read HERE, after synthesize() returned, and
// never passed to it (synthInput builds its input from the prompt alone, and
// test/synth.test.mjs holds that). Every candidate the organism drew is also graded here, for
// diagnostics only (oracle: did ANY draw pass): that grading happens after the choice was made
// and cannot change it.
//
// DEVELOPMENT RECORDS. HumanEval 0 to 39 and the internal suite are the records this region was
// built against: the extractor's patterns were written reading the prompts of records 0 to 39
// and nothing later. Records 40 to 160 are HELD OUT: no model call here touches them. The final
// verdict reads their PROMPTS only (never their tests) to report the extractor's coverage on
// prompts it was not written against.
//
// THE BAR FILE IS WRITTEN ONCE: bench/verdicts/synth.json, when all three stages ran over their
// whole record lists (the big stage may end at its time cap, and says so). Anything narrower,
// and a snapshot after each stage, is bench/verdicts/synth-partial.json with isTheBar false.
//
//   node bench/synth.mjs [--stages humaneval,code,big] [--limit N] [--resume] [--nowrite]
//                        [--model qwen3:1.7b] [--big qwen3:30b-a3b] [--k 5] [--maxTokens 4000]
//                        [--timeoutMs 3000] [--testMs 5000] [--bigMinutes 25] [--quiet]
//
// Latencies are wall clock on ONE Ollama queue shared with other builders' runs that night: a
// mean ms here is what this machine did, not what the model costs alone.
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { synthesize, summarize, stopSafe, toSource, extractAssertions, entryOf } from '../reason/synth.mjs';
import { runTests, runCases } from '../act/run.mjs';
import { firstPrompt, extractCode, entryName } from '../act/code.mjs';
import { complete, probeOllama, OLLAMA_BASE } from '../act/llm.mjs';
import { loadHumanEval, humanEvalTask, cutAtStopTokens, wilson } from './public.mjs';

export { wilson };
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
export const VERDICT = path.join(HERE, 'verdicts', 'synth.json');
export const PARTIAL = path.join(HERE, 'verdicts', 'synth-partial.json');
export const JOURNAL_DIR = path.join(HERE, 'verdicts', 'synth');
export const STAGES = Object.freeze(['humaneval', 'code', 'big']);
export const SMALL_MODEL = 'qwen3:1.7b';
export const BIG_MODEL = 'qwen3:30b-a3b';
const DEV = Object.freeze({ from: 0, to: 39 });
/** The HumanEval records this region was developed against, by index. */
export function heRange() { return { from: DEV.from, to: DEV.to }; }

const r2 = (x) => Math.round(x * 100) / 100;
const r6 = (x) => Math.round(x * 1e6) / 1e6;
const pct = (x) => (x === null || x === undefined ? 'n/a' : (x * 100).toFixed(2) + '%');
const EM_DASH = String.fromCharCode(0x2014);
const noDash = (s) => (s == null ? s : String(s).split(EM_DASH).join('-'));

// ---------------------------------------------------------------- inputs
/**
 * What synthesize() is given for a HumanEval record: the prompt and the run's settings. The
 * record's stop tokens are the harness format (every record carries the same four), not a
 * grade. Its tests, doctests and original fields are NEVER copied.
 */
export function synthInput(rec, cfg) {
  const input = {
    prompt: String(rec.prompt), model: cfg.model, k: cfg.k, timeoutMs: cfg.timeoutMs, repair: cfg.repair,
    maxTokens: cfg.maxTokens, modelTimeoutMs: cfg.modelTimeoutMs, base: cfg.base, probeMs: cfg.probeMs,
  };
  if (Array.isArray(rec.stop_tokens)) input.stopTokens = rec.stop_tokens.map(String);
  return input;
}

function wrap(text, width) {
  const out = [];
  let line = '';
  for (const w of String(text || '').split(/\s+/).filter(Boolean)) {
    if (line && line.length + 1 + w.length > width) { out.push(line); line = w; } else line = line ? line + ' ' + w : w;
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}

/** An internal suite task rendered as a MultiPL-E prompt: spec, visible cases as doctests, signature. */
export function taskPrompt(task) {
  const entry = entryName(task);
  const params = (/\(([^)]*)\)/.exec(String(task.signature || '')) || ['', ''])[1];
  const lines = wrap(task.spec, 90).map((l, i) => (i ? '// ' : '//') + l);
  for (const c of task.visible || []) {
    lines.push('// >>> ' + entry + '(' + (c.args || []).map(toSource).join(', ') + ')');
    lines.push('// ' + toSource(c.expected));
  }
  lines.push('function ' + entry + '(' + params + '){');
  return lines.join('\n');
}

// ---------------------------------------------------------------- the nested arms
const confirmed = (r, c) => !!(r.extractedCount > 0 && c && c.test && c.test.loaded && c.test.passed === c.test.of);

/** The k=1, k=5 and k=5+repair arms out of one synthesize() result. */
export function deriveArms(r) {
  const cands = r.candidates || [];
  const sample = cands.filter((c) => c.phase === 'sample');
  const mk = (cand, calls, ms) => (cand && cand.reached !== false
    ? { code: cand.code, rawCode: cand.rawCode, calls, ms, passedExtracted: cand.test ? cand.test.passed : 0, provenance: confirmed(r, cand) ? 'model+exact' : 'model' }
    : { absent: true, calls, ms });
  const first = sample[0] || null;
  return {
    k1: mk(first, first ? 1 : 0, first ? first.endMs : r.ms),
    k5: mk(r.sampledKeptIndex >= 0 ? cands[r.sampledKeptIndex] : null, sample.length, sample.length ? sample[sample.length - 1].endMs : r.ms),
    k5r: mk(r.keptIndex >= 0 ? cands[r.keptIndex] : null, r.calls, r.ms),
  };
}

// ---------------------------------------------------------------- statistics
/**
 * The bar: organism beats alone by MORE than the overlap of their 95% intervals. gap is the
 * difference of the point estimates, overlap the length of the two intervals' intersection
 * (0 when they are disjoint). disjoint is the stricter reading, printed beside it.
 */
export function barRule(org, alone) {
  const io = wilson(org.correct, org.n), ia = wilson(alone.correct, alone.n);
  const po = org.n ? org.correct / org.n : null, pa = alone.n ? alone.correct / alone.n : null;
  if (po === null || pa === null) return { gap: null, overlap: null, met: false, disjoint: false, organism: io, alone: ia };
  const gap = r6(po - pa);
  const overlap = r6(Math.max(0, Math.min(io.hi, ia.hi) - Math.max(io.lo, ia.lo)));
  return { gap, overlap, met: gap > overlap, disjoint: io.lo > ia.hi, organism: { p: r6(po), ...io }, alone: { p: r6(pa), ...ia } };
}

/** Exact two sided McNemar p on the discordant pairs: b records only the first arm got, c only the second. */
export function mcnemar(b, c) {
  const n = b + c;
  if (!n) return 1;
  const k = Math.min(b, c);
  let term = Math.pow(0.5, n), sum = 0;
  for (let i = 0; i <= k; i++) { sum += term; term = term * (n - i) / (i + 1); }
  return r6(Math.min(1, 2 * sum));
}

function armStats(rows, arm, opts = {}) {
  const got = rows.map((r) => r.arms[arm]).filter((a) => a && !a.absent);
  const n = got.length, correct = got.filter((a) => a.ok).length;
  const s = {
    n, correct, pass1: n ? r6(correct / n) : null, interval: wilson(correct, n),
    meanMs: n ? r2(got.reduce((t, a) => t + (a.ms || 0), 0) / n) : null,
    callsPerRecord: n ? r2(got.reduce((t, a) => t + (a.calls || 0), 0) / n) : null,
  };
  if (opts.extracts) {
    s.extracted = { records: got.filter((a) => a.extractedCount > 0).length, of: n };
    s.extractedShare = n ? r6(s.extracted.records / n) : null;
    const prov = {};
    for (const a of got) prov[a.provenance] = (prov[a.provenance] || 0) + 1;
    s.provenance = prov;
    const byProv = {};
    for (const a of got) { const b = byProv[a.provenance] || (byProv[a.provenance] = { n: 0, correct: 0 }); b.n++; if (a.ok) b.correct++; }
    s.correctByProvenance = byProv;
  } else s.extracted = null;
  return s;
}

// ---------------------------------------------------------------- grading, bench side only
async function gradeHumanEval(code, rec, cfg) {
  const cut = cutAtStopTokens(code, rec.stop_tokens);
  const g = await runTests(cut.text, rec.tests, { limitMs: cfg.testMs, memoryMB: 128 });
  return { ok: !!g.passed, cutAt: cut.cutAt, timedOut: !!g.timedOut, error: g.error ? noDash(String(g.error).slice(0, 160)) : null };
}

async function gradeCode(code, task) {
  const h = await runCases(code, task.hidden, { entry: entryName(task), limitMs: 2000, memoryMB: 128 });
  return { ok: task.hidden.length > 0 && h.failed === 0, passed: h.passed, of: task.hidden.length, error: h.error ? noDash(String(h.error).slice(0, 160)) : null };
}

// ---------------------------------------------------------------- the journal
function codeHash() {
  const h = createHash('sha256');
  for (const f of ['reason/synth.mjs', 'act/run.mjs', 'act/code.mjs']) h.update(readFileSync(path.join(ROOT, f)));
  return h.digest('hex').slice(0, 16);
}

function openJournal(stage, key, { resume, write, dir }) {
  const file = path.join(dir, stage + '-' + key.model.replace(/[^A-Za-z0-9.]+/g, '_') + '.jsonl');
  const rows = new Map();
  let torn = 0;
  if (write) mkdirSync(dir, { recursive: true });
  if (existsSync(file)) {
    const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
    let head = null;
    try { head = JSON.parse(lines[0]); } catch { head = null; }
    const same = head && head.config && JSON.stringify(head.config) === JSON.stringify(key);
    if (resume && same) {
      for (const l of lines.slice(1)) { try { const r = JSON.parse(l); rows.set(r.id, r); } catch { torn++; } }
    } else if (resume && !same) {
      throw new Error('--resume refused: ' + rel(file) + ' was written by a different configuration or code (' + JSON.stringify(head && head.config) + ' vs ' + JSON.stringify(key) + ')');
    } else if (write) {
      renameSync(file, file.replace(/\.jsonl$/, '.superseded-' + new Date().toISOString().replace(/[:.]/g, '-') + '.jsonl'));
    }
  }
  if (write && !rows.size && !existsSync(file)) appendFileSync(file, JSON.stringify({ config: key }) + '\n');
  return {
    file: rel(file), rows, torn,
    append(row) { if (write) appendFileSync(file, JSON.stringify(row) + '\n'); rows.set(row.id, row); },
  };
}

const rotate = (arms, i) => { const k = i % arms.length; return [...arms.slice(k), ...arms.slice(0, k)]; };

// ---------------------------------------------------------------- the model alone
async function alone(prompt, model, cfg, timeoutMs) {
  const t0 = performance.now();
  const c = await complete({ prompt, provider: 'ollama', model, base: cfg.base, probeMs: cfg.probeMs, timeoutMs: timeoutMs || cfg.modelTimeoutMs, maxTokens: cfg.maxTokens });
  if (!c.ok || c.provider !== 'ollama') return { absent: true, reason: c.reason || 'the model did not answer', ms: r2(performance.now() - t0) };
  return { text: c.text, tokens: c.tokens, capped: Number.isFinite(c.tokens) && c.tokens >= cfg.maxTokens, t0 };
}

// ---------------------------------------------------------------- one organism draw stream, graded
async function organismArms(input, grade) {
  const r = await synthesize(input);
  if (r.provenance === 'absent') return { absent: true, reason: r.reason || 'no candidate', calls: r.calls, ms: r2(r.ms) };
  const hidden = new Map();
  for (const c of r.candidates) if (c.reached && !hidden.has(c.code)) hidden.set(c.code, await grade(c.code));
  const d = deriveArms(r);
  const out = {};
  for (const [name, a] of Object.entries(d)) {
    if (a.absent) { out[name] = { absent: true, reason: 'no draw', calls: a.calls, ms: r2(a.ms) }; continue; }
    out[name] = { ok: hidden.get(a.code).ok, calls: a.calls, ms: r2(a.ms), provenance: a.provenance, passedExtracted: a.passedExtracted, extractedCount: r.extractedCount };
  }
  // diagnostics, never part of a choice: the first draw's raw code (before stopSafe), whether ANY
  // draw passed, and draws that pass the hidden tests while failing an extracted example
  const first = r.candidates.find((c) => c.phase === 'sample' && c.reached);
  let k1Raw = null;
  if (first) k1Raw = first.rawCode === first.code ? hidden.get(first.code).ok : (await grade(first.rawCode)).ok;
  const reached = r.candidates.filter((c) => c.reached);
  const diag = {
    extractedCount: r.extractedCount, shapes: r.shapes, calls: r.calls, ms: r2(r.ms),
    draws: reached.length, repairDraws: reached.filter((c) => c.phase === 'repair').length,
    oracle: reached.some((c) => hidden.get(c.code).ok),
    k1Raw, k1Normalized: !!(first && first.normalized),
    hiddenPassButExtractedFail: reached.filter((c) => hidden.get(c.code).ok && c.test && c.test.loaded && c.test.passed < c.test.of).length,
    extractedPassButHiddenFail: reached.filter((c) => !hidden.get(c.code).ok && c.test && c.test.loaded && c.test.passed === c.test.of && r.extractedCount > 0).length,
    candidates: summarize(r.candidates).map((s, i) => ({ ...s, error: noDash(s.error), hidden: r.candidates[i].reached ? hidden.get(r.candidates[i].code).ok : null })),
  };
  return { arms: out, diag };
}

// ---------------------------------------------------------------- the stages
async function stageHumanEval(cfg, st, big = false) {
  const stage = big ? 'big' : 'humaneval';
  const model = big ? cfg.big : cfg.model;
  const all = loadHumanEval();
  const recs = all.slice(DEV.from, DEV.to + 1).slice(0, cfg.limit > 0 ? cfg.limit : undefined);
  const key = { stage, model, k: big ? 1 : cfg.k, repair: !big, maxTokens: cfg.maxTokens, timeoutMs: cfg.timeoutMs, testMs: cfg.testMs, code: st.codeHash };
  const j = openJournal(stage, key, { resume: cfg.resume, write: cfg.write, dir: cfg.journalDir });
  const arms = big ? ['organism', 'alone'] : ['organism', 'alone', 'null'];
  const t0 = Date.now();
  const deadline = big ? t0 + cfg.bigMinutes * 60_000 : Infinity;
  let cutByClock = false, fromJournal = 0;
  const rows = [];
  for (let i = 0; i < recs.length; i++) {
    const rec = recs[i];
    if (j.rows.has(rec.name)) { rows.push(j.rows.get(rec.name)); fromJournal++; continue; }
    if (Date.now() >= deadline) { cutByClock = true; break; }
    const row = { id: rec.name, index: DEV.from + i, order: rotate(arms, i), arms: {}, diag: null, alone: null };
    const grade = (code) => gradeHumanEval(code, rec, cfg);
    let incomplete = null;
    for (const arm of row.order) {
      const left = deadline - Date.now();
      if (left <= 0) { incomplete = 'the ' + cfg.bigMinutes + ' minute clock ran out'; break; }
      const callMs = Math.min(cfg.modelTimeoutMs, left);
      if (arm === 'organism') {
        const input = { ...synthInput(rec, { ...cfg, model, k: big ? 1 : cfg.k, repair: !big }), modelTimeoutMs: callMs };
        const o = await organismArms(input, grade);
        if (o.absent) { incomplete = o.reason; break; }
        if (big) row.arms.k1 = o.arms.k1;
        else Object.assign(row.arms, o.arms);
        row.diag = o.diag;
      } else if (arm === 'alone') {
        const built = humanEvalTask(rec);
        const a = await alone(firstPrompt(built.task, built.task.entry), model, cfg, callMs);
        if (a.absent) { incomplete = a.reason; break; }
        const code = extractCode(a.text);
        const ms = r2(performance.now() - a.t0);
        const g = await grade(code);
        const norm = stopSafe(code, rec.stop_tokens).code;
        const gN = norm === code ? g : await grade(norm);
        row.arms.alone = { ok: g.ok, calls: 1, ms, tokens: a.tokens, capped: a.capped, cutAt: g.cutAt };
        row.alone = { normalizedOk: gN.ok, normalizedChanged: norm !== code, error: g.error };
      } else {
        const t = performance.now();
        const r = await synthesize({ prompt: rec.prompt, provider: 'null', stopTokens: rec.stop_tokens });
        const ms = r2(performance.now() - t);
        const g = await grade(r.completion);
        row.arms.null = { ok: g.ok, calls: 0, ms, provenance: 'null', extractedCount: r.extractedCount };
      }
    }
    if (incomplete) {
      if (!big) throw new Error('stage ' + stage + ' stopped on ' + rec.name + ': ' + incomplete);
      cutByClock = true;
      break;
    }
    j.append(row);
    rows.push(row);
    st.peakRss = Math.max(st.peakRss, process.memoryUsage().rss);
    if (!cfg.quiet) console.log(line(stage, i, recs.length, row));
  }
  return { stage, model, journal: j.file, torn: j.torn, rows, of: recs.length, fromJournal, cutByClock, wallMs: Date.now() - t0 };
}

async function stageCode(cfg, st) {
  const fx = JSON.parse(readFileSync(path.join(HERE, 'fixtures', 'code-tasks.json'), 'utf8'));
  const tasks = fx.tasks.slice(0, cfg.limit > 0 ? cfg.limit : undefined);
  const key = { stage: 'code', model: cfg.model, k: cfg.k, repair: true, maxTokens: cfg.maxTokens, timeoutMs: cfg.timeoutMs, code: st.codeHash };
  const j = openJournal('code', key, { resume: cfg.resume, write: cfg.write, dir: cfg.journalDir });
  const t0 = Date.now();
  const rows = [];
  let fromJournal = 0;
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (j.rows.has(task.id)) { rows.push(j.rows.get(task.id)); fromJournal++; continue; }
    const row = { id: task.id, index: i, kind: task.kind, order: rotate(['organism', 'alone', 'null'], i), arms: {}, diag: null };
    const grade = (code) => gradeCode(code, task);
    const prompt = taskPrompt(task);
    for (const arm of row.order) {
      if (arm === 'organism') {
        // compare strict: this suite is graded by act/run.mjs renderValue identity, its documented contract
        const o = await organismArms({ prompt, model: cfg.model, k: cfg.k, repair: true, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens, modelTimeoutMs: cfg.modelTimeoutMs, base: cfg.base, probeMs: cfg.probeMs, compare: 'strict', stopTokens: [] }, grade);
        if (o.absent) throw new Error('stage code stopped on ' + task.id + ': ' + o.reason);
        Object.assign(row.arms, o.arms);
        row.diag = o.diag;
      } else if (arm === 'alone') {
        const a = await alone(firstPrompt(task, entryName(task)), cfg.model, cfg);
        if (a.absent) throw new Error('stage code stopped on ' + task.id + ': ' + a.reason);
        const code = extractCode(a.text);
        const ms = r2(performance.now() - a.t0);
        const g = await grade(code);
        row.arms.alone = { ok: g.ok, calls: 1, ms, tokens: a.tokens, capped: a.capped };
      } else {
        const t = performance.now();
        const r = await synthesize({ prompt, provider: 'null', compare: 'strict', stopTokens: [] });
        const ms = r2(performance.now() - t);
        const g = await grade(r.completion);
        row.arms.null = { ok: g.ok, calls: 0, ms, provenance: 'null', extractedCount: r.extractedCount };
      }
    }
    j.append(row);
    rows.push(row);
    st.peakRss = Math.max(st.peakRss, process.memoryUsage().rss);
    if (!cfg.quiet) console.log(line('code', i, tasks.length, row));
  }
  return { stage: 'code', model: cfg.model, journal: j.file, torn: j.torn, rows, of: tasks.length, fromJournal, cutByClock: false, wallMs: Date.now() - t0 };
}

function line(stage, i, n, row) {
  const a = row.arms;
  const mark = (x) => (!x ? '-' : x.absent ? 'absent' : x.ok ? 'PASS' : 'fail');
  const parts = [stage.padEnd(9), String(i + 1).padStart(2) + '/' + n, String(row.id).padEnd(34)];
  for (const [name, label] of [['k5r', 'k5+r'], ['k5', 'k5'], ['k1', 'k1'], ['alone', 'alone'], ['null', 'null']]) if (a[name]) parts.push(label + ' ' + mark(a[name]));
  if (row.diag) parts.push('extracted ' + row.diag.extractedCount + ', draws ' + row.diag.draws + (row.diag.repairDraws ? ' (' + row.diag.repairDraws + ' repair)' : '') + ', ' + (row.diag.ms / 1000).toFixed(1) + ' s');
  if (a.alone && !a.alone.absent) parts.push('alone ' + (a.alone.ms / 1000).toFixed(1) + ' s');
  return parts.join('  ');
}

// ---------------------------------------------------------------- summaries
const ARM_LABELS = Object.freeze({ k5r: 'organism k=5+repair', k5: 'organism k=5', k1: 'organism k=1', alone: 'model alone', null: 'null' });

function summarizeStage(res) {
  const complete = res.rows.filter((r) => Object.values(r.arms).every((a) => a && !a.absent));
  const armNames = [...new Set(res.rows.flatMap((r) => Object.keys(r.arms)))].sort((a, b) => Object.keys(ARM_LABELS).indexOf(a) - Object.keys(ARM_LABELS).indexOf(b));
  const arms = {};
  for (const a of armNames) arms[a] = { label: ARM_LABELS[a], ...armStats(complete, a, { extracts: a !== 'alone' }) };
  const out = {
    model: res.model, journal: res.journal, tornLines: res.torn, records: complete.length, of: res.of,
    fromJournal: res.fromJournal, partial: complete.length < res.of, cutByClock: res.cutByClock, wallMs: res.wallMs, arms,
  };
  const diags = complete.map((r) => r.diag).filter(Boolean);
  if (diags.length) {
    const shapes = { doctest: 0, example: 0, returns: 0 };
    for (const d of diags) for (const k of Object.keys(shapes)) shapes[k] += (d.shapes && d.shapes[k]) || 0;
    out.diagnostics = {
      assertionsExtracted: diags.reduce((t, d) => t + d.extractedCount, 0), shapes,
      oracle: { records: diags.filter((d) => d.oracle).length, of: diags.length, note: 'records where ANY organism draw passed the hidden tests: the ceiling selection could reach' },
      k1Raw: diags.some((d) => d.k1Raw !== null) ? { correct: diags.filter((d) => d.k1Raw).length, of: diags.length, normalizedDraws: diags.filter((d) => d.k1Normalized).length, note: 'the first draw graded BEFORE stopSafe: organism k=1 minus this is what the stop-token rewrite did' } : null,
      hiddenPassButExtractedFail: diags.reduce((t, d) => t + d.hiddenPassButExtractedFail, 0),
      extractedPassButHiddenFail: diags.reduce((t, d) => t + d.extractedPassButHiddenFail, 0),
      repairRecords: diags.filter((d) => d.repairDraws > 0).length,
    };
  }
  const al = complete.filter((r) => r.alone);
  if (al.length) out.aloneNormalized = { correct: al.filter((r) => r.alone.normalizedOk).length, of: al.length, changed: al.filter((r) => r.alone.normalizedChanged).length, note: 'model alone graded after the same stopSafe rewrite the organism applies: the share of the gap that is formatting' };
  if (arms.alone && (arms.k5r || arms.k1)) {
    const top = arms.k5r ? 'k5r' : 'k1';
    const b = complete.filter((r) => r.arms[top].ok && !r.arms.alone.ok).length;
    const c = complete.filter((r) => !r.arms[top].ok && r.arms.alone.ok).length;
    out.paired = { arm: top, onlyOrganism: b, onlyAlone: c, mcnemarP: mcnemar(b, c) };
    out.bar = { ...barRule(arms[top], arms.alone), rule: 'organism ' + ARM_LABELS[top] + ' beats model alone by more than the overlap of their 95% Wilson intervals' };
  }
  const capped = complete.filter((r) => r.arms.alone && r.arms.alone.capped).length;
  if (arms.alone) out.aloneCappedAtMaxTokens = capped;
  return out;
}

function printStage(name, s) {
  console.log('\n== ' + name + ': ' + s.model + ', ' + s.records + ' of ' + s.of + ' records' + (s.partial ? ' (PARTIAL' + (s.cutByClock ? ', stopped by its clock' : '') + ')' : '') + ', wall ' + (s.wallMs / 60000).toFixed(1) + ' min');
  for (const [k, a] of Object.entries(s.arms)) {
    const iv = a.interval;
    console.log('  ' + a.label.padEnd(20) + ' pass@1 ' + String(a.correct).padStart(2) + '/' + a.n + ' = ' + pct(a.pass1).padStart(7)
      + ' [' + pct(iv.lo) + ', ' + pct(iv.hi) + ']'
      + '  extracted ' + (a.extracted ? a.extracted.records + '/' + a.extracted.of : '-').padEnd(6)
      + '  mean ' + (a.meanMs === null ? 'n/a' : (a.meanMs / 1000).toFixed(2) + ' s').padStart(9)
      + '  calls ' + (a.callsPerRecord === null ? 'n/a' : a.callsPerRecord.toFixed(2)) + '/record');
  }
  if (s.diagnostics) {
    const d = s.diagnostics;
    console.log('  diagnostics: ' + d.assertionsExtracted + ' assertions (doctest ' + d.shapes.doctest + ', example ' + d.shapes.example + ', returns ' + d.shapes.returns + '); oracle ' + d.oracle.records + '/' + d.oracle.of
      + (d.k1Raw ? '; k=1 before stopSafe ' + d.k1Raw.correct + '/' + d.k1Raw.of + ' (' + d.k1Raw.normalizedDraws + ' first draws rewritten)' : '')
      + '; draws passing hidden but failing an example ' + d.hiddenPassButExtractedFail + ', passing every example but failing hidden ' + d.extractedPassButHiddenFail + '; repair ran on ' + d.repairRecords + ' records');
  }
  if (s.aloneNormalized) console.log('  model alone after stopSafe: ' + s.aloneNormalized.correct + '/' + s.aloneNormalized.of + ' (' + s.aloneNormalized.changed + ' answers rewritten); capped at maxTokens ' + s.aloneCappedAtMaxTokens);
  if (s.paired) console.log('  paired: only ' + ARM_LABELS[s.paired.arm] + ' ' + s.paired.onlyOrganism + ', only model alone ' + s.paired.onlyAlone + ', exact McNemar p ' + s.paired.mcnemarP);
  if (s.bar) console.log('  bar: gap ' + pct(s.bar.gap) + ' vs interval overlap ' + pct(s.bar.overlap) + ' -> ' + (s.bar.met ? 'MET' : 'NOT MET') + ' (intervals ' + (s.bar.disjoint ? 'disjoint' : 'overlap') + ')');
}

/** The extractor on prompts it was NOT written against: records 40 to 160, prompts only. */
export function heldOutExtraction() {
  const all = loadHumanEval();
  const held = all.slice(DEV.to + 1);
  const shapes = { doctest: 0, example: 0, returns: 0 };
  let withAny = 0, total = 0;
  for (const r of held) {
    const e = extractAssertions(r.prompt, entryOf(r.prompt));
    if (e.assertions.length) withAny++;
    total += e.assertions.length;
    for (const k of Object.keys(shapes)) shapes[k] += e.shapes[k];
  }
  return { records: held.length, from: DEV.to + 1, to: all.length - 1, withAtLeastOne: withAny, share: r6(withAny / held.length), assertions: total, shapes, note: 'prompts only; no model call, no tests string; the extractor was not tuned on these prompts' };
}

function statement(v) {
  const he = v.stages.humaneval, cd = v.stages.code, bg = v.stages.big;
  const s = [];
  if (he) {
    const o = he.arms.k5r, a = he.arms.alone;
    s.push('On MultiPL-E JavaScript HumanEval records 0 to 39 by index (development records) with ' + he.model + ', the organism sampling up to ' + v.k + ' candidates, testing each against the examples it extracted from the prompt and repairing once passed ' + o.correct + ' of ' + o.n + ' hidden suites (' + pct(o.pass1) + ', 95% interval ' + pct(o.interval.lo) + ' to ' + pct(o.interval.hi) + ') against ' + a.correct + ' of ' + a.n + ' for one sample from the same model in bench/public.mjs\'s shape (' + pct(a.pass1) + ', ' + pct(a.interval.lo) + ' to ' + pct(a.interval.hi) + ').');
    s.push('The nested arms read k=5 without repair ' + he.arms.k5.correct + ' of ' + he.arms.k5.n + ' and k=1 ' + he.arms.k1.correct + ' of ' + he.arms.k1.n + '; the no-model null passed ' + he.arms.null.correct + '.');
    if (he.bar) s.push('The bar asks the gap (' + pct(he.bar.gap) + ') to exceed the overlap of the two intervals (' + pct(he.bar.overlap) + '): ' + (he.bar.met ? 'it does' : 'it does not') + (he.bar.disjoint ? ', and the intervals are disjoint.' : ', and the intervals are not disjoint.'));
  }
  if (cd) s.push('On the 40 task internal suite the same arms read ' + cd.arms.k5r.correct + ', ' + cd.arms.k5.correct + ', ' + cd.arms.k1.correct + ', ' + cd.arms.alone.correct + ' and ' + cd.arms.null.correct + ' of ' + cd.records + '.');
  if (bg) s.push('With ' + bg.model + ' the organism at k=1 passed ' + (bg.arms.k1 ? bg.arms.k1.correct : 0) + ' and the model alone ' + (bg.arms.alone ? bg.arms.alone.correct : 0) + ' of ' + bg.records + ' records reached' + (bg.partial ? ', a partial stage cut by its ' + v.bigMinutes + ' minute clock' : '') + '.');
  s.push('Records 40 to 160 are held out: the public stage prints them separately. Latencies are wall clock on one Ollama queue shared with other runs.');
  return s.join(' ');
}

// ---------------------------------------------------------------- run
export function makeCfg(opts = {}) {
  const stages = opts.stages ? String(opts.stages).split(',').map((s) => s.trim()).filter(Boolean) : [...STAGES];
  for (const s of stages) if (!STAGES.includes(s)) throw new Error('unknown stage ' + s + ': one of ' + STAGES.join(', '));
  return {
    stages, limit: Number.isFinite(opts.limit) ? opts.limit : 0, resume: !!opts.resume, write: opts.write !== false, quiet: !!opts.quiet,
    model: opts.model || SMALL_MODEL, big: opts.big || BIG_MODEL, k: Number.isFinite(opts.k) ? opts.k : 5, repair: true,
    maxTokens: Number.isFinite(opts.maxTokens) ? opts.maxTokens : 4000, timeoutMs: Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 3000,
    testMs: Number.isFinite(opts.testMs) ? opts.testMs : 5000, bigMinutes: Number.isFinite(opts.bigMinutes) ? opts.bigMinutes : 25,
    modelTimeoutMs: Number.isFinite(opts.modelTimeoutMs) ? opts.modelTimeoutMs : 300_000, probeMs: 1500, base: opts.base || OLLAMA_BASE,
    journalDir: opts.journalDir ? path.resolve(opts.journalDir) : JOURNAL_DIR,
    command: 'node bench/synth.mjs' + (opts.argv && opts.argv.length ? ' ' + opts.argv.join(' ') : ''),
  };
}

export async function run(opts = {}) {
  const cfg = makeCfg(opts);
  const st = { codeHash: codeHash(), peakRss: process.memoryUsage().rss, started: new Date().toISOString() };
  const up = await probeOllama(cfg.base, cfg.probeMs);
  console.log('synth bench: stages ' + cfg.stages.join(', ') + ', model ' + cfg.model + ', big ' + cfg.big + ', k ' + cfg.k + ', maxTokens ' + cfg.maxTokens + ', sandbox ' + cfg.timeoutMs + ' ms per candidate, hidden grade ' + cfg.testMs + ' ms, free RAM ' + (os.freemem() / 1073741824).toFixed(1) + ' GB, ollama ' + (up ? 'up' : 'DOWN') + ', code ' + st.codeHash);
  if (!up) throw new Error('no ollama at ' + cfg.base + ': the model arms cannot be measured, nothing was written');
  const stages = {};
  const writeVerdict = (final) => {
    const full = final && cfg.limit === 0 && STAGES.every((s) => stages[s])
      && !stages.humaneval.partial && !stages.code.partial && (!stages.big.partial || stages.big.cutByClock);
    const v = {
      at: new Date().toISOString(), node: process.version, command: cfg.command, isTheBar: !!full,
      notTheBarBecause: full ? null : (final ? 'a narrower run: stages ' + Object.keys(stages).join(', ') + (cfg.limit ? ', limit ' + cfg.limit : '') : 'a snapshot while the run is still going'),
      startedAt: st.started, model: cfg.model, bigModel: cfg.big, k: cfg.k, repairK: cfg.k, maxTokens: cfg.maxTokens,
      sandboxMsPerCandidate: cfg.timeoutMs, hiddenGradeMs: cfg.testMs, bigMinutes: cfg.bigMinutes, codeHash: st.codeHash,
      development: {
        humaneval: 'records 0 to 39 by index of bench/fixtures/public/humaneval/humaneval-js.jsonl (HumanEval_0 to HumanEval_41): the extractor was written reading these prompts',
        code: 'the 40 task internal suite bench/fixtures/code-tasks.json',
        heldOut: 'HumanEval records 40 to 160 by index (121 records): no model call here touched them; only their prompts were read, for extraction coverage',
      },
      sharedQueue: 'every latency here was measured on one Ollama queue shared with other builders; wall clock, not the model alone',
      nesting: 'organism k=1 and k=5 are prefixes of the k=5+repair draw stream (seeded draws), graded separately',
      ruler: 'HumanEval: the record\'s own tests string in act/run.mjs\'s sandbox on the arm\'s code cut at the record\'s stop tokens, as bench/public.mjs grades; code suite: every hidden case by act/run.mjs runCases',
      stages, heldOutExtraction: heldOutExtraction(), peakRssMb: r2(st.peakRss / 1048576),
    };
    v.bar = stages.humaneval && stages.humaneval.bar ? { ...stages.humaneval.bar, measuredOn: 'HumanEval records 0 to 39, ' + cfg.model } : null;
    v.barMet = !!(full && v.bar && v.bar.met);
    v.statement = statement({ ...v, stages });
    const file = full ? VERDICT : PARTIAL;
    if (cfg.write) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(v, null, 2) + '\n'); }
    return { v, file: rel(file) };
  };
  for (const s of cfg.stages) {
    const res = s === 'code' ? await stageCode(cfg, st) : await stageHumanEval(cfg, st, s === 'big');
    stages[s] = summarizeStage(res);
    printStage(s, stages[s]);
    if (s !== cfg.stages[cfg.stages.length - 1]) writeVerdict(false);
  }
  const { v, file } = writeVerdict(true);
  console.log('\nheld-out extraction (prompts 40 to 160 only): ' + v.heldOutExtraction.withAtLeastOne + ' of ' + v.heldOutExtraction.records + ' records, ' + v.heldOutExtraction.assertions + ' assertions (doctest ' + v.heldOutExtraction.shapes.doctest + ', example ' + v.heldOutExtraction.shapes.example + ', returns ' + v.heldOutExtraction.shapes.returns + ')');
  console.log('peak RSS of this process ' + v.peakRssMb + ' MB');
  console.log((cfg.write ? 'wrote ' + file : 'nothing written (--nowrite)') + ', isTheBar ' + v.isTheBar + ', barMet ' + v.barMet);
  console.log(v.statement);
  return v;
}

// ---------------------------------------------------------------- cli
const FLAGS = { stages: 'string', limit: 'number', resume: 'bool', nowrite: 'bool', quiet: 'bool', model: 'string', big: 'string', k: 'number', maxTokens: 'number', timeoutMs: 'number', testMs: 'number', bigMinutes: 'number', base: 'string', help: 'bool' };
export const USAGE = 'node bench/synth.mjs [--stages humaneval,code,big] [--limit N] [--resume] [--nowrite] [--model qwen3:1.7b] [--big qwen3:30b-a3b] [--k 5] [--maxTokens 4000] [--timeoutMs 3000] [--testMs 5000] [--bigMinutes 25] [--quiet]';

export function parseArgv(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const m = /^--([A-Za-z]+)$/.exec(argv[i]);
    if (!m || !(m[1] in FLAGS)) throw new Error('unknown argument ' + argv[i]);
    const t = FLAGS[m[1]];
    if (t === 'bool') { o[m[1]] = true; continue; }
    const v = argv[++i];
    if (v === undefined) throw new Error('--' + m[1] + ' needs a value');
    o[m[1]] = t === 'number' ? Number(v) : v;
    if (t === 'number' && !Number.isFinite(o[m[1]])) throw new Error('--' + m[1] + ' needs a number');
  }
  return o;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  let o;
  try { o = parseArgv(process.argv.slice(2)); } catch (e) { console.error(e.message + '\n' + USAGE); process.exitCode = 2; }
  if (o && o.help) console.log(USAGE);
  else if (o) {
    run({ ...o, write: !o.nowrite, argv: process.argv.slice(2) }).then(
      (v) => { process.exitCode = 0; },
      (e) => { console.error('synth bench failed: ' + (e && e.stack || e)); process.exitCode = 1; },
    );
  }
}
