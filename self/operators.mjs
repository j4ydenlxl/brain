// self/operators.mjs: THE HANDS THAT FILL A GAP (Board 14, item operators).
//
// His order of 2026-09-24 12:02: "Its gotta work without me. Thats the most important part. EVERY
// GAP should be able to be filled by itself, ur just the engineer to author it". The autopilot's
// evidence modes (fix, preserve, faster) each judge a patch that makes a test pass or run faster;
// none of them moves a NUMBER toward a BAR. An operator does: given a gap (a line of
// state/self/gaps.jsonl: a measured number, a bar, a trial command and the files that produce the
// number) and a copy of the tree, it proposes candidate patches, unified diffs against the copy,
// and self/improve.mjs runs the trial on the copy and says whether the number moved.
//
// Every operator is an ASYNC GENERATOR FUNCTION (gap, copyRoot, budget): it yields one candidate at
// a time and receives, as the value of its yield, the judged result of that candidate
// ({after, toward, noise, refused, reason}), so a search can choose its next step from the last
// one. When it is done it returns its best candidate (or null) for the confirmation walls.
//
//   knob-tune      one knob, one step: a coordinate search over the knobs of the gap's files
//                  (self/knobs.mjs), at most budget.trials (6) trials per gap per round. The first
//                  trial on a knob steps it UP; its sign picks the direction: toward the bar by
//                  more than the noise band keeps going up, away from it by more than the noise
//                  band turns round, inside the band moves on to the next knob. A step outside the
//                  knob's band is refused before anything runs and recorded with its reason.
//   strategy-swap  a file exporting STRATEGIES = { name: fn } beside a const STRATEGY = 'name'
//                  selector: every other name is tried once, the best kept.
//   recombine      grid gaps only: a new macro composed from the tail of one solved TRAINING
//                  program and the head of another (capability/grid-library.mjs splitProgram and
//                  corpusFromVerdict read the programs; capability/grid-dsl.mjs defineMacro, the
//                  library's own composer, type checks the composition), written as a word of
//                  capability/grid-dsl.mjs by capability/grid-invent.mjs patchFor.
//   author         the model cell on OPEN WEIGHTS: qwen3:30b-a3b through Ollama at
//                  http://localhost:11434, NEVER a Claude call (self/autopilot.mjs authorConfig
//                  refuses a model or base naming Claude or Anthropic before any socket opens, and
//                  its child refuses again). Asked with the gap line, its metric and bar, the
//                  target file, its knob list and the trial command; answers ONE unified diff of
//                  at most 60 changed lines. Refused when the answer touches a file outside the
//                  gap's files list or any file the autopilot's ceiling forbids (MANUAL.md,
//                  manual/, docs/, self/, bench/gate.mjs, bench/verdicts/, any test file). A
//                  budget of model calls per run (default 12) and a 120 s wall per call; every
//                  call's seconds are recorded in budget.model.calls.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseKnobs, setKnob, unifiedDiff, filesOfDiff, changedLines, knobLine } from './knobs.mjs';
import { allowTarget, authorConfig, extractDiff, normalizeImagined, AUTHOR_MODEL, AUTHOR_BASE } from './autopilot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
const AUTOPILOT_FILE = path.join(HERE, 'autopilot.mjs');

export const TRIALS_PER_ROUND = 6;
export const MODEL_CALLS_PER_RUN = 12;
export const CALL_WALL_MS = 120_000;
export const MAX_CHANGED_LINES = 60;
export const AUTHOR_MAX_TOKENS = 4000;
export const CHILD_HEAP_MB = 1024;
const MAX_FILE_CHARS = 12_000;

/** A fresh per-run budget. model.calls holds {ms, ok, reason} for every call made. */
export function makeBudget({ trials = TRIALS_PER_ROUND, modelCalls = MODEL_CALLS_PER_RUN, callWallMs = CALL_WALL_MS, author = null, model = null, base = null } = {}) {
  return { trials, callWallMs, author, modelName: model, base, model: { max: modelCalls, used: 0, calls: [] } };
}

const r6 = (x) => Number(Number(x).toPrecision(12));
const relOf = (root, abs) => path.relative(root, abs).replaceAll('\\', '/');

/**
 * The files an operator may patch for this gap: the gap's files list, each through the autopilot's
 * ceiling (safePath plus MANUAL.md, manual/, docs/, self/, bench/gate.mjs, bench/verdicts/, tests).
 */
export function allowedFiles(gap, root) {
  const out = [], refused = [];
  for (const f of Array.isArray(gap && gap.files) ? gap.files : []) {
    const a = allowTarget(f, null, { root });
    if (a.ok) { if (!out.includes(a.rel)) out.push(a.rel); } else refused.push({ file: f, reason: a.reason });
  }
  return { files: out, refused };
}

/**
 * Vet a candidate diff against a gap: every file it touches must be on the gap's files list and
 * pass the ceiling, and it may change at most maxLines lines. Returns {ok, files, lines, reason}.
 */
export function vetDiff(patch, gap, root, { maxLines = MAX_CHANGED_LINES } = {}) {
  const files = filesOfDiff(patch);
  const lines = changedLines(patch);
  if (!files.length) return { ok: false, files, lines, reason: 'the diff names no file' };
  const list = (Array.isArray(gap && gap.files) ? gap.files : []).map((f) => String(f).replaceAll('\\', '/'));
  const outside = files.filter((f) => !list.includes(f));
  if (outside.length) return { ok: false, files, lines, wall: 'files', reason: 'the diff touches ' + outside.join(', ') + ', outside the gap\'s files list (' + (list.join(', ') || 'empty') + ')' };
  for (const f of files) {
    const a = allowTarget(f, null, { root });
    if (!a.ok) return { ok: false, files, lines, wall: 'ceiling', reason: a.reason };
  }
  if (lines > maxLines) return { ok: false, files, lines, wall: 'size', reason: 'the diff changes ' + lines + ' lines, over the ' + maxLines + ' line cap' };
  return { ok: true, files, lines, reason: null };
}

// ================================================================== knob-tune
/**
 * The candidate that moves one knob to a value, on top of the values already accepted (base: a map
 * knob id -> value). Refused, with the band in the reason, when the value is outside the band.
 */
export function knobCandidate(root, knobs, base, knob, value) {
  const files = [...new Set([knob.file, ...Object.keys(base).map((id) => knobs.find((k) => k.id === id).file)])];
  const patches = [];
  for (const f of files) {
    const abs = path.join(root, f);
    const original = readFileSync(abs, 'utf8');
    // apply from the end of the file backwards so earlier offsets stay valid
    const moves = knobs.filter((k) => k.file === f && (k.id === knob.id || k.id in base))
      .map((k) => ({ k, v: k.id === knob.id ? value : base[k.id] })).sort((a, b) => b.k.start - a.k.start);
    let text = original;
    for (const { k, v } of moves) {
      const s = setKnob(text, k, v);
      if (!s.ok) return { refused: true, operator: 'knob-tune', knob: knob.name, file: knob.file, from: knob.value, value, reason: s.reason, band: [knob.lo, knob.hi] };
      text = s.text;
    }
    const d = unifiedDiff(f, original, text);
    if (d) patches.push(d);
  }
  return { refused: false, operator: 'knob-tune', knob: knob.name, knobId: knob.id, file: knob.file, from: knob.value, value, patch: patches.join(''), values: { ...base, [knob.id]: value } };
}

/** Every knob of the gap's allowed files, read on the copy (frozen and malformed knobs dropped). */
export function gapKnobs(gap, root) {
  const { files } = allowedFiles(gap, root);
  const out = [];
  for (const f of files) {
    const abs = path.join(root, f);
    if (!existsSync(abs)) continue;
    for (const k of parseKnobs(readFileSync(abs, 'utf8'), { file: f })) if (!k.frozen && !k.malformed) out.push(k);
  }
  // a gap may name the knobs to try first (gap.knobs: names or ids)
  const pref = Array.isArray(gap && gap.knobs) ? gap.knobs : [];
  const rank = (k) => { const i = pref.findIndex((p) => p === k.name || p === k.id); return i < 0 ? pref.length : i; };
  return out.sort((a, b) => rank(a) - rank(b) || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0) || a.start - b.start);
}

const sgn = (toward, noise) => (toward > noise ? 1 : toward < -noise ? -1 : 0);

export async function* knobTune(gap, root, budget = makeBudget()) {
  const knobs = gapKnobs(gap, root);
  if (!knobs.length) return { best: null, reason: 'no knob in the gap\'s files (' + (allowedFiles(gap, root).files.join(', ') || 'none allowed') + ')' };
  const max = budget.trials ?? TRIALS_PER_ROUND;
  let trials = 0;
  let base = {};                 // accepted values: knob id -> value
  let best = null;               // the accepted candidate with the best metric
  let bestMetric = null;         // null until the first judged trial tells us the baseline
  for (const k of knobs) {
    if (trials >= max) break;
    let cur = k.value;
    let dir = 1, flipped = false, moved = false;
    for (;;) {
      if (trials >= max) break;
      const value = r6(cur + dir * k.step);
      const cand = knobCandidate(root, knobs, base, k, value);
      if (cand.refused) {
        yield cand;              // recorded as a refused trial, never run, never counted
        if (!flipped && !moved) { dir = -dir; flipped = true; continue; }
        break;
      }
      cand.ref = bestMetric;     // the metric this step is compared with (null: the baseline)
      const v = yield cand;
      trials++;
      if (!v || v.after === null || v.after === undefined) break;
      if (bestMetric === null) bestMetric = v.before;
      // the sign of the FIRST trial on a knob picks its direction; later trials only continue it
      const s = sgn(v.towardRef ?? v.toward, v.noise);
      if (s > 0) {
        base = cand.values; cur = value; bestMetric = v.after; best = { ...cand, after: v.after }; moved = true;
        if (v.closed) return { best, reason: 'the gap is closed at ' + k.name + ' = ' + value };
        continue;
      }
      if (s < 0 && !flipped && !moved) { dir = -dir; flipped = true; continue; }
      break;
    }
  }
  return { best, reason: best ? null : 'no knob step moved the metric toward the bar by more than the noise band in ' + trials + ' trial(s)' };
}

// ================================================================== strategy-swap
/** The top-level keys of the object literal whose "{" is at text[open]. */
export function objectKeys(text, open) {
  const keys = [];
  let depth = 0, i = open, expectKey = true;
  const n = text.length;
  while (i < n) {
    const ch = text[i];
    if (ch === '/' && text[i + 1] === '/') { const e = text.indexOf('\n', i); i = e < 0 ? n : e; continue; }
    if (ch === '/' && text[i + 1] === '*') { const e = text.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; continue; }
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch; let j = i + 1;
      while (j < n && text[j] !== q) { if (text[j] === '\\') j++; j++; }
      if (depth === 1 && expectKey) { keys.push(text.slice(i + 1, j)); expectKey = false; }
      i = j + 1; continue;
    }
    if (ch === '{' || ch === '[' || ch === '(') { depth++; i++; if (depth === 1) expectKey = true; continue; }
    if (ch === '}' || ch === ']' || ch === ')') { depth--; i++; if (depth === 0) return keys; continue; }
    if (depth === 1) {
      if (ch === ',') { expectKey = true; i++; continue; }
      if (expectKey && /[A-Za-z_$]/.test(ch)) {
        let j = i; while (j < n && /[\w$]/.test(text[j])) j++;
        keys.push(text.slice(i, j)); expectKey = false; i = j; continue;
      }
    }
    i++;
  }
  return keys;
}

/** A strategy file: its STRATEGIES names and the STRATEGY selector, or null. */
export function readStrategies(text) {
  const src = String(text);
  const m = src.match(/^export\s+const\s+STRATEGIES\s*=\s*(?:Object\.freeze\s*\(\s*)?\{/m);
  const sel = src.match(/^(export\s+)?const\s+STRATEGY\s*=\s*(['"])([\w.$-]+)\2/m);
  if (!m || !sel) return null;
  const names = objectKeys(src, m.index + m[0].length - 1);
  const litStart = sel.index + sel[0].length - sel[3].length - 1;
  return { names, current: sel[3], start: litStart, end: litStart + sel[3].length, quote: sel[2] };
}

export async function* strategySwap(gap, root, budget = makeBudget()) {
  const { files } = allowedFiles(gap, root);
  let best = null, bestMetric = null, trials = 0;
  const max = budget.trials ?? TRIALS_PER_ROUND;
  let found = 0;
  for (const f of files) {
    const abs = path.join(root, f);
    if (!existsSync(abs)) continue;
    const original = readFileSync(abs, 'utf8');
    const s = readStrategies(original);
    if (!s) continue;
    found++;
    for (const name of s.names) {
      if (name === s.current) continue;
      if (trials >= max) break;
      const text = original.slice(0, s.start) + name + original.slice(s.end);
      const cand = { refused: false, operator: 'strategy-swap', name, from: s.current, file: f, patch: unifiedDiff(f, original, text), ref: bestMetric };
      const v = yield cand;
      trials++;
      if (!v || v.after === null || v.after === undefined) continue;
      if (bestMetric === null && best === null) bestMetric = v.before;
      if (sgn(v.towardRef ?? v.toward, v.noise) > 0) { best = { ...cand, after: v.after }; bestMetric = v.after; }
    }
  }
  if (!found) return { best: null, reason: 'no file of the gap exports STRATEGIES beside a const STRATEGY selector' };
  return { best, reason: best ? null : 'no other strategy moved the metric toward the bar by more than the noise band' };
}

// ================================================================== recombine
/** True for a gap on the grid (ARC) search: its subsystem, kind, id, verdict or files say grid or ARC. */
export function isGridGap(gap) {
  const hay = [gap && gap.id, gap && gap.kind, gap && gap.subsystem, gap && gap.verdictFile, ...(Array.isArray(gap && gap.files) ? gap.files : [])].join(' ');
  return /\bgrid\b|grid-|\barc\b|ARC/i.test(hay);
}

/**
 * New macro compositions from pairs of solved training programs: the last base step of program A
 * followed by the first one to three of program B, kept when the library's composer (defineMacro)
 * type checks it and no training program already holds it as a window.
 */
export async function recombinations(root, { max = 6 } = {}) {
  const lib = await import(pathToFileURL(path.join(root, 'capability', 'grid-library.mjs')).href);
  const dsl = await import(pathToFileURL(path.join(root, 'capability', 'grid-dsl.mjs')).href);
  const vdir = path.join(root, 'bench', 'verdicts');
  let corpus = [], from = null;
  for (const f of existsSync(vdir) ? readdirSync(vdir).filter((n) => /^grid.*\.json$/.test(n)).sort() : []) {
    try {
      const rows = lib.corpusFromVerdict(JSON.parse(readFileSync(path.join(vdir, f), 'utf8')));
      if (rows.length > corpus.length) { corpus = rows; from = f; }
    } catch { /* not a training verdict: the library refuses it, and so do we */ }
  }
  const progs = [];
  for (const row of corpus) for (const p of row.programs) { const s = lib.splitProgram(p); if (s && s.chain.length) progs.push({ id: row.id, chain: s.chain }); }
  const windows = new Set();
  for (const p of progs) for (let len = 2; len <= 4; len++) for (let i = 0; i + len <= p.chain.length; i++) windows.add(p.chain.slice(i, i + len).join('+'));
  const out = [];
  const seen = new Set();
  for (let a = 0; a < progs.length && out.length < max; a++) {
    for (let b = 0; b < progs.length && out.length < max; b++) {
      if (a === b || progs[a].id === progs[b].id) continue;
      for (let h = 1; h <= 3 && out.length < max; h++) {
        const ops = [progs[a].chain[progs[a].chain.length - 1], ...progs[b].chain.slice(0, h)];
        if (ops.length < 2 || ops.length > 4 || ops.length !== h + 1) continue;
        const key = ops.join('+');
        if (seen.has(key) || windows.has(key)) continue;
        seen.add(key);
        try { dsl.defineMacro(ops); } catch { continue; }   // the composer refuses a composition whose types do not chain
        out.push({ ops, from: [progs[a].id, progs[b].id] });
      }
    }
  }
  return { corpusFrom: from, programs: progs.length, candidates: out };
}

export async function* recombine(gap, root, budget = makeBudget()) {
  if (!isGridGap(gap)) return { best: null, reason: 'recombine works on grid gaps only' };
  let rc;
  try { rc = await recombinations(root, { max: budget.trials ?? TRIALS_PER_ROUND }); } catch (e) { return { best: null, reason: 'the grid library could not be read on the copy: ' + String(e && e.message || e).split('\n')[0] }; }
  if (!rc.candidates.length) return { best: null, reason: 'no new typed composition of two training programs (' + rc.programs + ' programs from ' + (rc.corpusFrom || 'no training verdict') + ')' };
  const invent = await import(pathToFileURL(path.join(root, 'capability', 'grid-invent.mjs')).href);
  let best = null, bestMetric = null;
  for (const c of rc.candidates) {
    const p = invent.patchFor({ key: c.ops.join('+'), spec: { k: 'chain', ops: c.ops }, solved: c.from });
    const n = p ? normalizeImagined(p, root) : null;
    if (!n || !n.patch) { yield { refused: true, operator: 'recombine', name: c.ops.join('+'), reason: 'the composition has no patch (the anchor line of capability/grid-dsl.mjs was not found once)' }; continue; }
    const v = yield { refused: false, operator: 'recombine', name: c.ops.join('+'), from: c.from.join(' x '), file: n.file, patch: n.patch, ref: bestMetric };
    if (!v || v.after === null || v.after === undefined) continue;
    if (bestMetric === null && best === null) bestMetric = v.before;
    if (sgn(v.towardRef ?? v.toward, v.noise) > 0) { best = { operator: 'recombine', name: c.ops.join('+'), file: n.file, patch: n.patch, after: v.after }; bestMetric = v.after; }
  }
  return { best, reason: best ? null : 'no recombined macro moved the metric toward the bar by more than the noise band' };
}

// ================================================================== author
/** The prompt the model cell is asked with. */
export function buildGapRequest(gap, root, { files = null } = {}) {
  const allowed = files || allowedFiles(gap, root).files;
  const system = 'You are the patch author inside a program that improves its own source code toward a measured bar. Think briefly. Answer with exactly one unified diff and nothing else.';
  const L = [];
  const t = gap.trial || {};
  L.push('GAP ' + (gap.id || '?') + ' (' + (gap.kind || 'gap') + '): measured ' + gap.measured + ' ' + (gap.unit || '') + ', bar ' + gap.bar + ' ' + (gap.unit || '') + ', distance ' + gap.distance + '.');
  L.push('GOAL: change the source so that the number printed by the trial moves toward the bar. Higher is better when the bar is above the measured number, lower when it is below.');
  L.push('TRIAL COMMAND (run on a copy after your patch): ' + (t.command || '(none)'));
  for (const f of allowed) {
    let body = '';
    try { body = readFileSync(path.join(root, f), 'utf8'); } catch { body = ''; }
    const knobs = parseKnobs(body, { file: f });
    if (knobs.length) L.push('', 'KNOBS of ' + f + ' (name, value, line, band, step):', ...knobs.slice(0, 30).map((k) => '  ' + knobLine(k)));
    L.push('', 'FILE ' + f + ':', '```js', body.length > MAX_FILE_CHARS ? body.slice(0, MAX_FILE_CHARS) + '\n/* (truncated) */' : body, '```');
  }
  L.push('', 'Answer with ONE unified diff that edits only: ' + (allowed.join(', ') || '(no file)') + ', and changes at most ' + MAX_CHANGED_LINES + ' lines.',
    'Start with "--- a/<path>" and "+++ b/<path>". Each hunk starts with "@@ -<line>,<count> +<line>,<count> @@". Removed lines start with "-" and are copied exactly from the file; added lines start with "+"; context lines start with one space.',
    'Output only the diff.');
  return { system, prompt: L.join('\n'), files: allowed };
}

/**
 * Ask the model cell once, from a child process (node self/autopilot.mjs --child author), with a
 * wall of wallMs. Resolves {ok, text, ms, model, reason}. The config is checked here first, so a
 * closed provider is refused before any process or socket is opened.
 */
export function askModel({ system, prompt, model = null, base = null, wallMs = CALL_WALL_MS, maxTokens = AUTHOR_MAX_TOKENS } = {}) {
  const cfg = authorConfig({ model, base, timeoutMs: Math.max(1000, wallMs - 5000), maxTokens, numCtx: 16384, think: true });
  if (!cfg.ok) return Promise.resolve({ ok: false, called: false, text: null, ms: 0, model: cfg.model, reason: cfg.reason });
  const t0 = Date.now();
  return new Promise((resolve) => {
    const env = {};
    for (const [k, v] of Object.entries(process.env)) if (!k.startsWith('NODE_TEST') && k !== 'NODE_OPTIONS') env[k] = v;
    const child = spawn(process.execPath, ['--max-old-space-size=' + CHILD_HEAP_MB, AUTOPILOT_FILE, '--child', 'author'], { env, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '', err = '', done = false;
    const finish = (r) => { if (done) return; done = true; clearTimeout(timer); resolve({ ms: Date.now() - t0, model: cfg.model, called: true, ...r }); };
    const timer = setTimeout(() => { try { child.kill(); } catch { /* gone */ } finish({ ok: false, text: null, reason: 'the model cell did not answer inside the ' + wallMs + ' ms wall' }); }, wallMs);
    child.stdout.setEncoding('utf8'); child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { if (err.length < 4000) err += d; });
    child.on('error', (e) => finish({ ok: false, text: null, reason: 'the author child did not start: ' + e.message }));
    child.on('close', (code) => {
      const line = out.split('\n').map((l) => l.trim()).filter(Boolean).reverse().find((l) => l.startsWith('{'));
      let ans = null; try { ans = line ? JSON.parse(line) : null; } catch { ans = null; }
      if (!ans) return finish({ ok: false, text: null, reason: 'the author child printed no answer (exit ' + code + ') ' + err.split('\n').filter(Boolean).slice(-1)[0] });
      finish({ ok: ans.ok === true, text: ans.text, modelMs: ans.ms ?? null, tokens: ans.tokens ?? null, thinkingChars: ans.thinkingChars ?? 0, reason: ans.ok === true ? null : ans.reason });
    });
    child.stdin.end(JSON.stringify({ system, prompt, model: cfg.model, base: cfg.base, timeoutMs: cfg.timeoutMs, maxTokens: cfg.maxTokens, numCtx: cfg.numCtx, think: cfg.think }));
  });
}

/** Every file a model answer's diff headers name, raw (before any section is chosen). */
export function filesNamedIn(text) {
  const s = String(text || '').replace(/<think>[\s\S]*?<\/think>/g, '');
  return filesOfDiff(s.split(/\r?\n/).filter((l) => l.startsWith('--- ') || l.startsWith('+++ ')).join('\n'));
}

export async function* author(gap, root, budget = makeBudget()) {
  const m = budget.model || (budget.model = { max: MODEL_CALLS_PER_RUN, used: 0, calls: [] });
  const req = buildGapRequest(gap, root);
  if (!req.files.length) { yield { refused: true, operator: 'author', reason: 'the gap names no file the author may write (ceiling or empty files list)' }; return { best: null, reason: 'no allowed file' }; }
  if (m.used >= m.max) { yield { refused: true, operator: 'author', reason: 'the budget of ' + m.max + ' model call(s) for this run is spent' }; return { best: null, reason: 'budget spent' }; }
  const ask = typeof budget.author === 'function' ? budget.author : (r) => askModel({ ...r, model: budget.modelName, base: budget.base, wallMs: budget.callWallMs || CALL_WALL_MS });
  // the closed-provider guard runs before the budget is charged and before any socket opens
  const cfg = authorConfig({ model: budget.modelName, base: budget.base });
  if (!cfg.ok && typeof budget.author !== 'function') { yield { refused: true, operator: 'author', reason: cfg.reason }; return { best: null, reason: cfg.reason }; }
  m.used++;
  const a = await ask({ system: req.system, prompt: req.prompt, gap });
  const call = { gap: gap.id || null, ms: a.ms ?? null, seconds: a.ms != null ? Math.round(a.ms / 10) / 100 : null, ok: !!a.ok, model: a.model || cfg.model, reason: a.reason || null, promptChars: req.prompt.length };
  m.calls.push(call);
  if (!a.ok) { yield { refused: true, operator: 'author', model: call, reason: 'the model cell did not answer: ' + (a.reason || 'no reason') }; return { best: null, reason: 'no answer' }; }
  const named = filesNamedIn(a.text);
  const list = (gap.files || []).map((f) => String(f).replaceAll('\\', '/'));
  const outside = named.filter((f) => !list.includes(f));
  if (outside.length) { yield { refused: true, operator: 'author', model: call, answer: String(a.text).slice(0, 600), reason: 'the answer touches ' + outside.join(', ') + ', outside the gap\'s files list (' + list.join(', ') + ')' }; return { best: null, reason: 'outside the files list' }; }
  const d = extractDiff(a.text, { root, targets: req.files });
  if (!d.patch) { yield { refused: true, operator: 'author', model: call, answer: String(a.text).slice(0, 600), reason: 'no usable diff: ' + d.reason }; return { best: null, reason: d.reason }; }
  const vet = vetDiff(d.patch, gap, root);
  if (!vet.ok) { yield { refused: true, operator: 'author', model: call, patch: d.patch, reason: vet.reason }; return { best: null, reason: vet.reason }; }
  const cand = { refused: false, operator: 'author', name: call.model, file: d.file, patch: d.patch, model: call, ref: null };
  const v = yield cand;
  if (v && v.after !== null && v.after !== undefined && sgn(v.towardRef ?? v.toward, v.noise) > 0) return { best: { ...cand, after: v.after }, reason: null };
  return { best: null, reason: v && v.reason ? v.reason : 'the model\'s patch did not move the metric toward the bar by more than the noise band' };
}

export const OPERATORS = Object.freeze({ 'knob-tune': knobTune, 'strategy-swap': strategySwap, recombine, author });
export const OPERATOR_NAMES = Object.freeze(Object.keys(OPERATORS));
export { AUTHOR_MODEL, AUTHOR_BASE };
