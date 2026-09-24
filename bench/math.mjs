// bench/math.mjs: THE BAR FOR reason/math.mjs, the program of thought region.
//
// One question: does the organism answer GSM8K better when the model WRITES A PROGRAM and
// the organism RUNS it (k samples voted by value, reason/math.mjs solveMath) than when the
// same model answers in prose? Measured on the same records, same model, same token budget.
//
// THE RECORDS. The development split is GSM8K TRAIN (bench/fixtures/public/gsm8k-train.jsonl)
// when that file is on disk. When it is not, the bench takes a seeded slice of the TEST split
// and says so in every line it prints and in the verdict, with the record ids, so the public
// stage can print its own held-out numbers without these records. The sampler is
// bench/public.mjs sampleIds(), which is NESTED: at one seed a smaller sample is a subset of
// a larger one, so the public stage's seed 1 samples of up to this size are INSIDE this one.
//
// THE ARMS, all on qwen3:1.7b by default:
//   pot5v   solveMath k=5 with the verify arm
//   pot5    solveMath k=5
//   pot1    solveMath k=1
//   alone   the model alone in prose: bench/public.mjs ALONE_PROMPT, last number read
//   null    solveMath with the null provider: the whole region, no model, no socket
// then on the big model (qwen3:30b-a3b) pot1@big and alone@big on the first bigLimit records
// under a wall clock cap; what did not finish is written as partial fields in the same verdict.
//
// SHARED DRAWS, and why every arm is still its own measurement. Each record's model calls go
// through one memo keyed by (model, seed, token budget, prompt). solveMath draws sample i at
// seed + i, so pot1 IS the first sample of pot5 and pot5 IS the first round of pot5v; the prose
// fallback (seed + 300) and the alone arm use the same prompt and seed, so they are one draw.
// Every arm is run by the exported solveMath itself; the memo only answers a call it has
// already answered. Calls per record are counted as the arm makes them standalone, and the
// mean ms per record adds back the original wall time of every replayed call, so both read as
// if the arm had run alone. liveCalls says what the queue actually served.
//
// THE BAR. PoT k=5 beats model alone prose on the same records at the small model by more
// than the overlap of their intervals: the Wilson 95 percent interval of pot5 lies wholly
// above the interval of alone. A paired McNemar test is printed beside it and is not the bar.
//
// Run through tools/budget.mjs; the queue is one Ollama shared by other builders tonight, so
// every latency here was measured on a shared queue.
//
//   node --max-old-space-size=2000 bench/math.mjs [--limit 200] [--seed 1] [--resume]
//        [--model qwen3:1.7b] [--big qwen3:30b-a3b] [--bigLimit 60] [--bigMinutes 25]
//        [--k 5] [--maxTokens 3000] [--timeoutMs 2000] [--nobig] [--nowrite] [--quiet]
import { mkdirSync, writeFileSync, readFileSync, existsSync, appendFileSync, renameSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { complete as llmComplete, probeOllama, OLLAMA_BASE } from '../act/llm.mjs';
import { sampleIds, wilson, finalAnswer, sameInteger, lastNumber, ALONE_PROMPT } from './public.mjs';
import { solveMath, prosePrompt, SEED_OFFSETS, DEFAULTS } from '../reason/math.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const PUBLIC = path.join(HERE, 'fixtures', 'public');
export const VERDICT_DIR = path.join(HERE, 'verdicts');
export const TRAIN_FILE = path.join(PUBLIC, 'gsm8k-train.jsonl');
export const TEST_FILE = path.join(PUBLIC, 'gsm8k', 'test.jsonl');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const pct = (x) => (x === null || x === undefined ? 'n/a' : (x * 100).toFixed(2) + '%');

export const SMALL_ARMS = Object.freeze(['pot5v', 'pot5', 'pot1', 'alone', 'null']);
export const BIG_ARMS = Object.freeze(['pot1@big', 'alone@big']);
const ARM_DOC = Object.freeze({
  pot5v: 'reason/math.mjs solveMath k=5, verify on',
  pot5: 'reason/math.mjs solveMath k=5',
  pot1: 'reason/math.mjs solveMath k=1',
  alone: 'the model alone, prose, bench/public.mjs ALONE_PROMPT, last number read',
  null: 'solveMath with the null provider (no model, no socket)',
  'pot1@big': 'solveMath k=1 on the big model',
  'alone@big': 'the big model alone, prose',
});

// ---------------------------------------------------------------- records
/** The development records: train when it is on disk, else the test split, labelled. */
export function loadRecords({ trainFile = TRAIN_FILE, testFile = TEST_FILE } = {}) {
  const read = (f, prefix) => readFileSync(f, 'utf8').split(/\r?\n/).filter((l) => l.trim().length)
    .map((l, i) => ({ id: prefix + i, ...JSON.parse(l) }));
  if (existsSync(trainFile)) return { split: 'train', file: rel(trainFile), fallback: false, records: read(trainFile, 'gsm8k-train.') };
  return { split: 'test', file: rel(testFile), fallback: true, records: read(testFile, 'gsm8k.') };
}

// ---------------------------------------------------------------- statistics
/** Exact two sided McNemar p on the discordant pairs b (first arm only right) and c. */
export function mcnemar(b, c) {
  const n = b + c;
  if (n === 0) return 1;
  const m = Math.min(b, c);
  let term = Math.pow(0.5, n), sum = 0;
  for (let i = 0; i <= m; i++) {
    if (i > 0) term = term * (n - i + 1) / i;
    sum += term;
  }
  return Math.min(1, 2 * sum);
}

/** One arm's rows as the printed numbers. Absent rows are counted, never graded. */
export function summarizeArm(rows) {
  const graded = rows.filter((r) => !r.absent);
  const correct = graded.filter((r) => r.ok).length;
  const n = graded.length;
  const prov = {};
  for (const r of graded) {
    const p = r.provenance || 'none';
    prov[p] = prov[p] || { n: 0, correct: 0 };
    prov[p].n++;
    if (r.ok) prov[p].correct++;
  }
  const pot = graded.filter((r) => r.samplesDrawn > 0);
  const out = {
    n, correct, accuracy: n ? r4(correct / n) : null, interval: wilson(correct, n),
    absent: rows.length - n,
    meanMs: n ? r2(mean(graded.map((r) => r.standaloneMs))) : null,
    callsPerRecord: n ? r4(mean(graded.map((r) => r.calls))) : null,
    liveCallsPerRecord: n ? r4(mean(graded.map((r) => r.liveCalls))) : null,
    allProgramsFailed: pot.length ? pot.filter((r) => r.allFailed).length : null,
    allProgramsFailedShare: pot.length ? r4(pot.filter((r) => r.allFailed).length / n) : null,
    provenance: prov,
  };
  if (pot.length) {
    const s = { drawn: 0, ran: 0, extract: 0, run: 0, timeout: 0, model: 0 };
    for (const r of pot) for (const x of r.sampleStages || []) { s.drawn++; s[x] = (s[x] || 0) + 1; }
    out.samples = s;
    out.ties = pot.filter((r) => r.tie).length;
  }
  const ver = graded.filter((r) => r.verify);
  if (ver.length) {
    const v = { checked: ver.length, accept: 0, reject: 0, unparsed: 0, unreached: 0, resampled: 0, changed: 0, changedToRight: 0, changedToWrong: 0 };
    for (const r of ver) {
      if (!r.verify.reached) v.unreached++;
      else if (r.verify.verdict === 'accept') v.accept++;
      else if (r.verify.verdict === 'reject') v.reject++;
      else v.unparsed++;
      if (r.verify.resampled) v.resampled++;
      if (r.verify.changed) {
        v.changed++;
        if (r.ok) v.changedToRight++;
        else if (r.verify.beforeOk) v.changedToWrong++;
      }
    }
    out.verify = v;
  }
  return out;
}

/** Two arms paired on the records both graded. */
export function paired(rowsA, rowsB) {
  const b = new Map(rowsB.filter((r) => !r.absent).map((r) => [r.id, r]));
  let both = 0, onlyA = 0, onlyB = 0, neither = 0;
  for (const r of rowsA) {
    if (r.absent || !b.has(r.id)) continue;
    const o = b.get(r.id);
    if (r.ok && o.ok) both++; else if (r.ok) onlyA++; else if (o.ok) onlyB++; else neither++;
  }
  return { n: both + onlyA + onlyB + neither, both, onlyA, onlyB, neither, mcnemarP: r4(mcnemar(onlyA, onlyB)) };
}

/** The bar: pot5's interval wholly above alone's, on the same records, nothing absent. */
export function barOf(pot5, alone, planned) {
  const why = [];
  if (!pot5 || !alone || !pot5.n || !alone.n) return { met: false, gapPoints: null, why: ['an arm did not run'] };
  const gap = r2((pot5.accuracy - alone.accuracy) * 100);
  const lo = pot5.interval.lo, hi = alone.interval.hi;
  const met = lo !== null && hi !== null && lo > hi && pot5.n === planned && alone.n === planned;
  if (pot5.n !== planned || alone.n !== planned) why.push('graded ' + pot5.n + ' and ' + alone.n + ' of ' + planned + ' records');
  if (!(lo > hi)) why.push('the intervals overlap: pot5 lower edge ' + pct(lo) + ' is not above alone upper edge ' + pct(hi));
  return { met, gapPoints: gap, pot5Lo: lo, aloneHi: hi, clearance: lo !== null && hi !== null ? r4(lo - hi) : null, why };
}

// ---------------------------------------------------------------- the model, memoized per record
// think (optional) is passed to the program, verify and re-sample calls only: the prose call
// keeps the model's default, so the fallback and the alone arm stay one draw.
function memoModel({ completeFn, base, model, memo, stats, think }) {
  return async (req) => {
    const t = think === undefined || think === null || req.purpose === 'prose' ? undefined : think;
    const key = model + '\u0000' + req.seed + '\u0000' + req.maxTokens + '\u0000' + String(t) + '\u0000' + req.prompt;
    const hit = memo.get(key);
    if (hit) { stats.replayed++; stats.replayedMs += hit.ms || 0; return hit; }
    const call = { ...base, model, prompt: req.prompt, seed: req.seed, maxTokens: req.maxTokens };
    if (t !== undefined) call.think = t;
    const r = await completeFn(call);
    memo.set(key, r);
    stats.live++;
    return r;
  };
}

function compactSample(s) {
  return { v: s.ok ? s.value : null, st: s.stage, tok: s.tokens, ms: s.callMs, err: s.ok ? null : String(s.error || '').slice(0, 120) };
}

async function potArm({ rec, gold, cfg, k, verify, model, memo, completeFn }) {
  const stats = { live: 0, replayed: 0, replayedMs: 0 };
  const fn = memoModel({ completeFn, base: cfg.base ? { provider: 'ollama', base: cfg.base, probeMs: cfg.probeMs, timeoutMs: cfg.callTimeoutMs } : { provider: 'ollama' }, model, memo, stats, think: cfg.potThink });
  const r = await solveMath({
    question: rec.question, model: model === null ? null : fn, k, verify, seed: cfg.seedOf(rec), timeoutMs: cfg.timeoutMs,
    maxTokens: cfg.maxTokens, verifyMaxTokens: cfg.verifyMaxTokens, memoryMB: cfg.memoryMB,
  });
  const unreached = r.samples.filter((s) => s.stage === 'model').length;
  const absent = model !== null && r.provenance !== 'exact' && unreached === r.samples.length && !(r.fallback && r.fallback.reached);
  const row = {
    ok: sameInteger(r.answer, gold), got: r.answer, provenance: r.provenance, calls: r.calls, liveCalls: stats.live,
    replayed: stats.replayed, ms: r2(r.ms), standaloneMs: r2(r.ms + stats.replayedMs), modelMs: r.modelMs, execMs: r.execMs,
    allFailed: r.allFailed, samplesDrawn: r.samples.length, sampleStages: r.samples.map((s) => s.stage),
    samples: r.samples.map(compactSample), tie: !!(r.vote && r.vote.tie), votes: r.vote ? r.vote.groups : null,
    program: r.program, fallbackGot: r.fallback ? r.fallback.got : null, absent, unreached,
  };
  if (absent) row.reason = 'the model cell was not reached';
  if (r.verify) {
    row.verify = {
      reached: r.verify.reached, verdict: r.verify.verdict, before: r.verify.before, after: r.verify.after,
      beforeOk: sameInteger(r.verify.before, gold), resampled: r.verify.resampled, changed: r.verify.changed,
      resamples: r.verify.resamples.map(compactSample),
    };
  }
  return row;
}

async function aloneArm({ rec, gold, cfg, model, memo, completeFn }) {
  const stats = { live: 0, replayed: 0, replayedMs: 0 };
  const fn = memoModel({ completeFn, base: { provider: 'ollama', base: cfg.base, probeMs: cfg.probeMs, timeoutMs: cfg.callTimeoutMs }, model, memo, stats });
  const t0 = performance.now();
  const c = await fn({ prompt: ALONE_PROMPT(rec.question), seed: cfg.seedOf(rec) + SEED_OFFSETS.prose, maxTokens: cfg.maxTokens });
  const ms = performance.now() - t0;
  if (!c.ok) return { ok: false, got: null, absent: true, reason: c.reason || 'the model was not reached', calls: 1, liveCalls: stats.live, ms: r2(ms), standaloneMs: r2(ms) };
  const got = lastNumber(c.text);
  return {
    ok: sameInteger(got, gold), got, provenance: 'model', calls: 1, liveCalls: stats.live, replayed: stats.replayed,
    ms: r2(ms), standaloneMs: r2(ms + stats.replayedMs), tokens: c.tokens, capped: Number.isFinite(c.tokens) && c.tokens >= cfg.maxTokens,
    chars: String(c.text).length, absent: false,
  };
}

async function runArm(arm, ctx) {
  const { cfg } = ctx;
  const small = cfg.model, big = cfg.big;
  switch (arm) {
    case 'pot5v': return potArm({ ...ctx, k: 5, verify: true, model: small });
    case 'pot5': return potArm({ ...ctx, k: 5, verify: false, model: small });
    case 'pot1': return potArm({ ...ctx, k: 1, verify: false, model: small });
    case 'alone': return aloneArm({ ...ctx, model: small });
    case 'null': return potArm({ ...ctx, k: 5, verify: false, model: null });
    case 'pot1@big': return potArm({ ...ctx, k: 1, verify: false, model: big });
    case 'alone@big': return aloneArm({ ...ctx, model: big });
    default: throw new Error('unknown arm ' + arm);
  }
}

// ---------------------------------------------------------------- journal
const FINGERPRINT = ['split', 'seed', 'limit', 'model', 'big', 'maxTokens', 'verifyMaxTokens', 'timeoutMs', 'potThink', 'armsExplicit', 'tag'];
export function journalPath(dir, split, seed, tag = null) {
  return path.join(dir, 'math-journal-' + (tag ? tag + '-' : '') + split + '-' + String(seed).replace(/[^A-Za-z0-9._-]+/g, '_') + '.jsonl');
}

function openJournal({ dir, cfg, resume, write, readOnly = false }) {
  const fp = Object.fromEntries(FINGERPRINT.map((k) => [k, cfg[k] ?? null]));
  const none = { file: null, rows: new Map(), resumed: false, movedAside: null, append: () => {} };
  const file = journalPath(dir, cfg.split, cfg.seed, cfg.tag);
  if (readOnly && !existsSync(file)) throw new Error('--report found no journal at ' + rel(file));
  if (!write && !readOnly) return none;
  if (!readOnly) mkdirSync(dir, { recursive: true });
  const key = (id, arm) => id + '\u0000' + arm;
  if ((resume || readOnly) && existsSync(file)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean);
    let head = null;
    try { head = JSON.parse(lines[0]); } catch { head = null; }
    if (!head || head.type !== 'header') throw new Error('--resume refused: ' + rel(file) + ' has no header line');
    const diffs = FINGERPRINT.filter((k) => JSON.stringify(head.fingerprint[k] ?? null) !== JSON.stringify(fp[k]));
    if (diffs.length) throw new Error('--resume refused: ' + rel(file) + ' differs on ' + diffs.map((k) => k + ' ' + JSON.stringify(head.fingerprint[k]) + ' vs ' + JSON.stringify(fp[k])).join(', '));
    const rows = new Map();
    for (const l of lines.slice(1)) {
      let r = null;
      try { r = JSON.parse(l); } catch { continue; }
      if (r && r.type === 'arm' && !r.absent) rows.set(key(r.id, r.arm), r);
    }
    // a report reads a journal another process may still be appending to: it never writes
    if (readOnly) return { file, rows, resumed: true, movedAside: null, append: () => {} };
    const text = readFileSync(file, 'utf8');
    if (text.length && !text.endsWith('\n')) appendFileSync(file, '\n');
    return { file, rows, resumed: true, movedAside: null, append: (r) => appendFileSync(file, JSON.stringify(r) + '\n') };
  }
  let movedAside = null;
  if (existsSync(file)) {
    movedAside = file.replace(/\.jsonl$/, '.superseded-' + new Date().toISOString().replace(/[:.]/g, '-') + '.jsonl');
    renameSync(file, movedAside);
  }
  writeFileSync(file, JSON.stringify({ type: 'header', at: new Date().toISOString(), node: process.version, fingerprint: fp, command: cfg.command }) + '\n');
  return { file, rows: new Map(), resumed: false, movedAside, append: (r) => appendFileSync(file, JSON.stringify(r) + '\n') };
}

// ---------------------------------------------------------------- sampling parameters
async function readSampling(base, model) {
  try {
    const res = await fetch(String(base).replace(/\/+$/, '') + '/api/show', { method: 'POST', body: JSON.stringify({ model }) });
    if (!res.ok) return null;
    const j = await res.json();
    const p = String(j.parameters || '');
    const num = (name) => { const m = new RegExp('^' + name + '\\s+([\\d.]+)', 'm').exec(p); return m ? Number(m[1]) : null; };
    return { temperature: num('temperature'), top_k: num('top_k'), top_p: num('top_p'), source: '/api/show parameters of ' + model };
  } catch { return null; }
}

async function waitForRam(minGb, log) {
  for (let i = 0; i < 180; i++) {
    const free = os.freemem() / 2 ** 30;
    if (free >= minGb) return r2(free);
    if (i === 0) log('free RAM ' + r2(free) + ' GB is under ' + minGb + ' GB: waiting (BUDGETS rule)');
    await new Promise((res) => setTimeout(res, 10_000));
  }
  throw new Error('free RAM stayed under ' + minGb + ' GB for 30 minutes');
}

// ---------------------------------------------------------------- run
export function makeCfg(opts = {}) {
  const num = (v, d) => (Number.isFinite(v) ? v : d);
  const seed = opts.seed === undefined || opts.seed === null ? '1' : String(opts.seed);
  return {
    seed, limit: num(opts.limit, 200),
    // next rung options: any of them makes the run a tagged partial, never the bar. Each is
    // null by default so a journal written before they existed still resumes.
    potThink: opts.potThink === undefined || opts.potThink === null ? null : !(opts.potThink === false || String(opts.potThink) === 'false'),
    armsExplicit: opts.arms === undefined || opts.arms === null || opts.arms === true ? null : String(opts.arms).split(',').map((x) => x.trim()).filter((x) => SMALL_ARMS.includes(x)),
    tag: opts.tag === undefined || opts.tag === null || opts.tag === true ? null : String(opts.tag).replace(/[^A-Za-z0-9._-]+/g, '_'),
    model: opts.model || 'qwen3:1.7b',
    big: opts.nobig ? null : (opts.big || 'qwen3:30b-a3b'),
    bigLimit: num(opts.bigLimit, 60), bigMinutes: num(opts.bigMinutes, 25),
    maxTokens: num(opts.maxTokens, DEFAULTS.maxTokens), verifyMaxTokens: num(opts.verifyMaxTokens, DEFAULTS.verifyMaxTokens),
    timeoutMs: num(opts.timeoutMs, DEFAULTS.timeoutMs), memoryMB: num(opts.memoryMB, DEFAULTS.memoryMB),
    callTimeoutMs: num(opts.callTimeoutMs, 300_000), probeMs: num(opts.probeMs, 1500),
    base: opts.base || OLLAMA_BASE, minFreeGb: num(opts.minFreeGb, 16), quiet: !!opts.quiet,
    command: 'node bench/math.mjs ' + (opts.argv || []).join(' '),
  };
}

/**
 * The whole bench. Options beyond the CLI flags, for the test: completeFn replaces
 * act/llm.mjs complete (a mock cell), probeFn replaces the Ollama probe, trainFile and
 * testFile point at fixtures, verdictDir and journalDir at a temporary directory.
 */
export async function run(opts = {}) {
  const cfg = makeCfg(opts);
  cfg.arms = cfg.armsExplicit && cfg.armsExplicit.length ? SMALL_ARMS.filter((a) => cfg.armsExplicit.includes(a)) : [...SMALL_ARMS];
  const log = opts.log || ((s) => { if (!cfg.quiet) console.log(s); });
  const write = opts.write !== false;
  const completeFn = opts.completeFn || llmComplete;
  const probeFn = opts.probeFn || ((base, ms) => probeOllama(base, ms));
  const verdictDir = opts.verdictDir ? path.resolve(opts.verdictDir) : VERDICT_DIR;
  const journalDir = opts.journalDir ? path.resolve(opts.journalDir) : VERDICT_DIR;
  const t0 = Date.now();

  const data = loadRecords({ trainFile: opts.trainFile || TRAIN_FILE, testFile: opts.testFile || TEST_FILE });
  cfg.split = data.split;
  const byId = new Map(data.records.map((r) => [r.id, r]));
  const chosen = sampleIds(data.records.map((r) => r.id), cfg.limit, cfg.seed).map((id) => byId.get(id));
  const index = new Map(data.records.map((r, i) => [r.id, i]));
  // seed per record: the record's index in its split, so a record draws the same samples
  // whatever else is in the sample
  cfg.seedOf = (rec) => (index.get(rec.id) || 0) * 1000 + 1;
  const bigChosen = cfg.big ? chosen.slice(0, Math.min(cfg.bigLimit, chosen.length)) : [];

  // --report: read the journal (read only, another process may be writing it), make no model
  // call, and write a partial verdict from what is graded so far
  const report = !!opts.report;
  if (!opts.completeFn && !report) cfg.freeGbAtStart = await waitForRam(cfg.minFreeGb, log);
  const up = report ? true : await probeFn(cfg.base, cfg.probeMs);
  if (!up) throw new Error('no ollama at ' + cfg.base + ': the model arms cannot run, so nothing is measured');
  const sampling = opts.completeFn || report ? null : await readSampling(cfg.base, cfg.model);
  const samplingBig = opts.completeFn || report || !cfg.big ? null : await readSampling(cfg.base, cfg.big);

  const journal = openJournal({ dir: journalDir, cfg, resume: !!opts.resume, write, readOnly: report });
  const key = (id, arm) => id + '\u0000' + arm;
  const rows = new Map(journal.rows);
  const splitNote = data.fallback
    ? 'DEVELOPMENT RECORDS ARE A SEEDED SLICE OF THE GSM8K TEST SPLIT (' + data.file + '): the train split is not on disk'
    : 'development records: the GSM8K train split (' + data.file + ')';
  log('bench/math.mjs: ' + chosen.length + ' of ' + data.records.length + ' records at seed ' + cfg.seed + '; ' + splitNote);
  log('arms ' + SMALL_ARMS.join(',') + ' on ' + cfg.model + (cfg.big ? '; ' + BIG_ARMS.join(',') + ' on ' + cfg.big + ' for the first ' + bigChosen.length + ' records, cap ' + cfg.bigMinutes + ' min' : '')
    + '; maxTokens ' + cfg.maxTokens + ', program clock ' + cfg.timeoutMs + ' ms, sampling ' + JSON.stringify(sampling));
  if (journal.resumed) log('resumed ' + rel(journal.file) + ': ' + rows.size + ' arm rows already graded');

  const record = (row) => { rows.set(key(row.id, row.arm), row); journal.append(row); };
  const smallStart = Date.now();
  let smallRan = 0;
  for (let i = 0; i < chosen.length && !report; i++) {
    const rec = chosen[i];
    const gold = finalAnswer(rec);
    const todo = cfg.arms.filter((a) => !rows.has(key(rec.id, a)));
    if (!todo.length) continue;
    const memo = new Map();
    const tr = performance.now();
    for (const arm of todo) {
      const res = await runArm(arm, { rec, gold, cfg, memo, completeFn });
      record({ type: 'arm', id: rec.id, arm, model: arm === 'null' ? 'null' : cfg.model, at: new Date().toISOString(), gold, ...res });
    }
    smallRan++;
    const cell = (a) => { const r = rows.get(key(rec.id, a)); return a + ' ' + (r ? (r.absent ? 'ABSENT' : String(r.got ?? '-') + (r.ok ? ' ok' : ' x')) : '?'); };
    log(String(i + 1).padStart(4) + '/' + chosen.length + ' ' + rec.id.padEnd(16) + ' gold ' + String(gold).padStart(7) + ' | ' + cfg.arms.map(cell).join(' | ') + ' | ' + r2((performance.now() - tr) / 1000) + ' s');
  }
  const smallMs = Date.now() - smallStart;

  // the big model, under its own wall clock cap
  const bigCapMs = cfg.bigMinutes * 60_000;
  let bigSpentMs = 0, bigStopped = null, bigRan = 0;
  for (const rec of bigChosen) for (const a of BIG_ARMS) { const r = rows.get(key(rec.id, a)); if (r) bigSpentMs += r.ms || 0; }
  if (cfg.big && !report) {
    const bigStart = Date.now();
    const perRecord = [];
    for (let i = 0; i < bigChosen.length; i++) {
      const rec = bigChosen[i];
      const todo = BIG_ARMS.filter((a) => !rows.has(key(rec.id, a)));
      if (!todo.length) continue;
      const spent = bigSpentMs + (Date.now() - bigStart);
      const expect = perRecord.length ? mean(perRecord) : 0;
      if (spent + expect > bigCapMs) { bigStopped = 'the big model wall clock cap of ' + cfg.bigMinutes + ' min: ' + r2(spent / 60000) + ' min spent, the next record was expected to take ' + r2(expect / 1000) + ' s'; break; }
      const gold = finalAnswer(rec);
      const memo = new Map();
      const tr = Date.now();
      for (const arm of todo) {
        const res = await runArm(arm, { rec, gold, cfg, memo, completeFn });
        record({ type: 'arm', id: rec.id, arm, model: cfg.big, at: new Date().toISOString(), gold, ...res });
      }
      perRecord.push(Date.now() - tr);
      bigRan++;
      const cell = (a) => { const r = rows.get(key(rec.id, a)); return a + ' ' + (r ? (r.absent ? 'ABSENT' : String(r.got ?? '-') + (r.ok ? ' ok' : ' x')) : '?'); };
      log(' big ' + String(i + 1).padStart(3) + '/' + bigChosen.length + ' ' + rec.id.padEnd(16) + ' gold ' + String(gold).padStart(7) + ' | ' + BIG_ARMS.map(cell).join(' | ') + ' | ' + r2((Date.now() - tr) / 1000) + ' s');
    }
    bigSpentMs += Date.now() - bigStart;
  }

  // ------------------------------------------------------------ the verdict
  const armRows = (arm, recs) => recs.map((r) => rows.get(key(r.id, arm))).filter(Boolean).map((r) => ({ ...r }));
  const arms = {};
  for (const a of SMALL_ARMS) arms[a] = { model: a === 'null' ? 'null' : cfg.model, how: ARM_DOC[a], ...summarizeArm(armRows(a, chosen)) };
  const bigArms = {};
  if (cfg.big) {
    for (const a of BIG_ARMS) {
      const s = summarizeArm(armRows(a, bigChosen));
      bigArms[a] = { model: cfg.big, how: ARM_DOC[a], planned: bigChosen.length, partial: s.n < bigChosen.length, ...s };
    }
  }
  const planned = chosen.length;
  const complete = SMALL_ARMS.every((a) => arms[a].n === planned);
  const bar = barOf(arms.pot5, arms.alone, planned);
  const cmp = {
    pot5_vs_alone: paired(armRows('pot5', chosen), armRows('alone', chosen)),
    pot5v_vs_pot5: paired(armRows('pot5v', chosen), armRows('pot5', chosen)),
    pot5_vs_pot1: paired(armRows('pot5', chosen), armRows('pot1', chosen)),
    pot1_vs_alone: paired(armRows('pot1', chosen), armRows('alone', chosen)),
  };
  if (cfg.big) {
    cmp['pot1@big_vs_alone@big'] = paired(armRows('pot1@big', bigChosen), armRows('alone@big', bigChosen));
    cmp['pot1_vs_alone_on_big_records'] = paired(armRows('pot1', bigChosen), armRows('alone', bigChosen));
  }
  const whyNot = [];
  if (!complete) whyNot.push('not every small model arm graded all ' + planned + ' records');
  if (cfg.limit !== 200) whyNot.push('the bar is 200 records; this run took ' + cfg.limit);
  if (report) whyNot.push('a --report read of the journal ' + (journal.file ? rel(journal.file) : '') + ' at ' + new Date().toISOString() + ', no model call made');
  if (cfg.tag || cfg.potThink !== null || cfg.armsExplicit) whyNot.push('a next rung run (tag ' + cfg.tag + ', potThink ' + cfg.potThink + ', arms ' + cfg.arms.join(',') + ') is development, never the bar');
  const isTheBar = whyNot.length === 0;
  const ids = chosen.map((r) => r.id);
  const pubOverlap = data.fallback ? 'bench/public.mjs sampleIds is nested, so its GSM8K test samples at seed ' + cfg.seed + ' of up to ' + planned + ' records lie inside these ' + planned + ' development records (its 6 record partial at seed 1 is inside them)' : 'none: the train split is disjoint from the test split';
  const bigLine = cfg.big
    ? ' On ' + cfg.big + ' (first ' + bigChosen.length + ' of these records' + (bigArms['pot1@big'].partial || bigArms['alone@big'].partial ? ', PARTIAL: ' + (bigStopped || 'not every record finished') : '') + '): PoT k=1 ' + bigArms['pot1@big'].correct + ' of ' + bigArms['pot1@big'].n + ' = ' + pct(bigArms['pot1@big'].accuracy)
      + ', alone ' + bigArms['alone@big'].correct + ' of ' + bigArms['alone@big'].n + ' = ' + pct(bigArms['alone@big'].accuracy) + ', mean ' + r2((bigArms['pot1@big'].meanMs || 0) / 1000) + ' s and ' + r2((bigArms['alone@big'].meanMs || 0) / 1000) + ' s per record.'
    : '';
  const a = arms;
  const statement = (isTheBar ? '' : 'PARTIAL, isTheBar false (' + whyNot.join('; ') + '). ')
    + 'On ' + planned + ' GSM8K ' + data.split + ' records at seed ' + cfg.seed + (data.fallback ? ' (the train split was not on disk, so these are TEST records used for development; the public stage must print held-out numbers without them)' : '')
    + ', exact integer accuracy on ' + cfg.model + ': program of thought k=5 with verify ' + a.pot5v.correct + ' of ' + a.pot5v.n + ' = ' + pct(a.pot5v.accuracy)
    + ', k=5 ' + a.pot5.correct + ' of ' + a.pot5.n + ' = ' + pct(a.pot5.accuracy) + ' (95 percent interval ' + pct(a.pot5.interval.lo) + ' to ' + pct(a.pot5.interval.hi) + ')'
    + ', k=1 ' + a.pot1.correct + ' of ' + a.pot1.n + ' = ' + pct(a.pot1.accuracy)
    + ', the model alone in prose ' + a.alone.correct + ' of ' + a.alone.n + ' = ' + pct(a.alone.accuracy) + ' (' + pct(a.alone.interval.lo) + ' to ' + pct(a.alone.interval.hi) + ')'
    + ', null ' + a.null.correct + ' of ' + a.null.n + '. The bar (the k=5 interval wholly above the alone interval) is ' + (bar.met ? 'MET' : 'MISSED') + ': gap ' + bar.gapPoints + ' points, clearance ' + bar.clearance
    + ', paired McNemar p ' + cmp.pot5_vs_alone.mcnemarP + ' (' + cmp.pot5_vs_alone.onlyA + ' records only k=5 got, ' + cmp.pot5_vs_alone.onlyB + ' only alone got). '
    + 'Mean seconds per record standalone: k=5 verify ' + r2((a.pot5v.meanMs || 0) / 1000) + ', k=5 ' + r2((a.pot5.meanMs || 0) / 1000) + ', k=1 ' + r2((a.pot1.meanMs || 0) / 1000) + ', alone ' + r2((a.alone.meanMs || 0) / 1000)
    + '; model calls per record ' + a.pot5v.callsPerRecord + ', ' + a.pot5.callsPerRecord + ', ' + a.pot1.callsPerRecord + ', ' + a.alone.callsPerRecord
    + '; records whose programs all failed ' + a.pot5.allProgramsFailed + ' at k=5 and ' + a.pot1.allProgramsFailed + ' at k=1. '
    + (a.pot5v.verify ? 'The verifier accepted ' + a.pot5v.verify.accept + ', rejected ' + a.pot5v.verify.reject + ', said neither ' + a.pot5v.verify.unparsed + '; re-sampling changed ' + a.pot5v.verify.changed + ' answers, ' + a.pot5v.verify.changedToRight + ' to right and ' + a.pot5v.verify.changedToWrong + ' from right to wrong.' : '')
    + bigLine + ' Latencies were measured on one Ollama queue shared with other builders.';

  const verdict = {
    at: new Date().toISOString(), command: cfg.command, node: process.version, isTheBar, met: bar.met, whyNotTheBar: whyNot,
    statement,
    item: 'math: reason/math.mjs program of thought with an exact executor (P4 toward the 405B GSM8K row)',
    records: {
      split: data.split, file: data.file, fallbackToTest: data.fallback, of: data.records.length, n: planned, seed: cfg.seed,
      sampler: 'bench/public.mjs sampleIds (nested: a smaller sample at one seed is a subset of a larger one)',
      development: true, developmentNote: 'every record here is a DEVELOPMENT record for this item: the prompts in reason/math.mjs were probed on gsm8k.0 to gsm8k.2, which are outside this sample, and not tuned on these records, but they are still not held out',
      overlapWithPublicStage: pubOverlap, ids,
    },
    model: { small: cfg.model, big: cfg.big, sampling, samplingBig, potThink: cfg.potThink, tag: cfg.tag, armsRun: cfg.arms, maxTokens: cfg.maxTokens, verifyMaxTokens: cfg.verifyMaxTokens, seeds: 'sample i at recordIndex*1000+1+i, verify +100, re-sample +200+i, prose +300', callTimeoutMs: cfg.callTimeoutMs, base: cfg.base, sharedQueue: true },
    sandbox: { runner: 'act/run.mjs runCases, entry solve, no IO', timeoutMs: cfg.timeoutMs, memoryMB: cfg.memoryMB },
    arms, bar,
    big: cfg.big ? { model: cfg.big, planned: bigChosen.length, capMinutes: cfg.bigMinutes, spentMinutes: r2(bigSpentMs / 60000), stopped: bigStopped, partial: Object.values(bigArms).some((x) => x.partial), arms: bigArms } : null,
    compare: cmp,
    sharedDraws: 'one memo per record keyed by model, seed, token budget and prompt: pot1 is the first sample of pot5, pot5 the first round of pot5v, and the prose fallback and the alone arm are one draw; calls per record and mean ms count every arm as if it ran alone (replayed calls add back their original ms); liveCallsPerRecord is what the queue served',
    published: { gsm8k405B: 'Llama 3.1 405B GSM8K 96.8 (the row bench/public.mjs keeps inside each public verdict with its source, research/published.json)' },
    rate: { smallRecordsRunHere: smallRan, smallMinutes: r2(smallMs / 60000), bigRecordsRunHere: bigRan, wallMinutes: r2((Date.now() - t0) / 60000) },
    journal: journal.file ? rel(journal.file) : null,
  };

  let writtenTo = null;
  if (write) {
    mkdirSync(verdictDir, { recursive: true });
    const name = isTheBar ? 'math.json' : 'math-' + (cfg.tag ? cfg.tag + '-' : '') + 'partial.json';
    let file = path.join(verdictDir, name);
    if (isTheBar && existsSync(file) && !opts.overwrite) {
      file = path.join(verdictDir, 'math-partial.json');
      verdict.whyNotTheBar = ['bench/verdicts/math.json already exists and a bar file is written once; pass --overwrite to replace it'];
    }
    writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
    writtenTo = rel(file);
  }
  return { ...verdict, writtenTo };
}

// ---------------------------------------------------------------- printing
export function printVerdict(v, log = console.log) {
  const line = (name, s) => log('ARM ' + name.padEnd(10) + ' ' + String(s.model).padEnd(14) + ' n ' + String(s.n).padStart(3)
    + '  acc ' + pct(s.accuracy).padStart(7) + ' [' + pct(s.interval.lo) + ', ' + pct(s.interval.hi) + ']'
    + '  ms/record ' + String(s.meanMs).padStart(9) + '  calls/record ' + String(s.callsPerRecord).padStart(6)
    + '  live ' + String(s.liveCallsPerRecord).padStart(6)
    + '  all-programs-failed ' + (s.allProgramsFailedShare === null ? 'n/a' : pct(s.allProgramsFailedShare) + ' (' + s.allProgramsFailed + ')')
    + (s.partial ? '  PARTIAL ' + s.n + ' of ' + s.planned : ''));
  for (const [k, s] of Object.entries(v.arms)) line(k, s);
  if (v.big) for (const [k, s] of Object.entries(v.big.arms)) line(k, s);
  const p = v.compare.pot5_vs_alone;
  log('PAIRED pot5 vs alone: both ' + p.both + ', only pot5 ' + p.onlyA + ', only alone ' + p.onlyB + ', neither ' + p.neither + ', McNemar p ' + p.mcnemarP);
  const q = v.compare.pot5v_vs_pot5;
  log('PAIRED pot5v vs pot5: both ' + q.both + ', only pot5v ' + q.onlyA + ', only pot5 ' + q.onlyB + ', neither ' + q.neither + ', McNemar p ' + q.mcnemarP);
  if (v.arms.pot5v.verify) log('VERIFY ' + JSON.stringify(v.arms.pot5v.verify));
  log('BAR math: ' + (v.bar.met ? 'MET' : 'MISSED') + ', gap ' + v.bar.gapPoints + ' points, pot5 lower edge ' + pct(v.bar.pot5Lo) + ' vs alone upper edge ' + pct(v.bar.aloneHi) + (v.bar.why.length ? ' (' + v.bar.why.join('; ') + ')' : ''));
  log('VERDICT ' + (v.isTheBar ? '(THE BAR) ' : '(partial) ') + (v.writtenTo ? 'written to ' + v.writtenTo : 'not written'));
  log('STATEMENT ' + v.statement);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const name = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) { out[name] = true; continue; }
    out[name] = /^-?\d+(\.\d+)?$/.test(next) ? Number(next) : next;
    i++;
  }
  return out;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const argv = process.argv.slice(2);
  const a = parseArgs(argv);
  if (a.help) {
    console.log('node bench/math.mjs [--limit 200] [--seed 1] [--resume] [--model m] [--big m] [--bigLimit 60] [--bigMinutes 25] [--nobig] [--nowrite] [--overwrite] [--quiet]');
  } else {
    try {
      const v = await run({ ...a, argv, write: !a.nowrite });
      printVerdict(v);
    } catch (e) {
      console.error('bench/math.mjs stopped: ' + String((e && e.stack) || e));
      process.exitCode = 2;
    }
  }
}
