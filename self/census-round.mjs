// self/census-round.mjs: THE CENSUS ROUND. The organism spawns cells where a red bench misses and
// keeps only the ones that pay. Author: board 20 builder (queue item 5, the CLOUD part).
//
// His words, 2026-09-26 10:51 EDT: "12000 cells is a little isnt it?" and "it needs to adapat and
// generate cells or smthn". A count typed by a person is the wrong kind of number; this file makes
// the count come out of rounds the organism runs on its own red benches, model OFF.
//
// ONE ROUND (censusRound), both arms in the same round, the same path, the same n:
//
//   1. THE LEDGER. The gap ledger the loop writes (self/gaps.mjs readLedger, state/self/gaps.jsonl);
//      when that runtime file is absent on the host, the loop's own builder runs in memory
//      (self/gaps.mjs buildLedger, model off, nothing written) and the census says which.
//   2. THE BENCH. The first red line (kind missed, ladder or bar never completed, in ledger order)
//      whose bench is of a TYPED kind with a model-off item source (BENCH_KINDS below). Typed lines
//      with no item source are listed as skipped, with the reason.
//   3. THE REAL ARM. The first development item of that bench the organism's held cells miss, in
//      item order, for which the spawn operator (genome/spawn.mjs plan) expresses a circuit of the
//      bench's kind: that circuit is the ONE typed cell of the round.
//   4. THE PLACEBO ARM. A random circuit of the same kind (placeboCircuit: a random chain of the
//      spawn genome's own grid primitives, the same length as the real one), through the same path.
//   5. THE PATH, per arm: the arm's lineage state directory (a COPY: never the live state) is copied
//      to a trial directory, the brain is restored from it, the circuit is grown through
//      genome/spawn.mjs grow (ONE cell.add proposal through the brain's gate), the snapshot is
//      written back to the trial directory and the brain is restored AGAIN from what was written.
//      Then the bench is re-run on the trial: every development item asked through the organism's
//      own spawn path (act/spawn.mjs spawnAsk) with growth OFF (the gate rejects cell.add for the
//      pass), so only the cells the copy holds can answer. The control rows are the spawn bench's
//      own suites (bench/answer.mjs algebra, sequence, grid; 10 each) asked through act/prompt.mjs
//      ask() on a throwaway restore of the trial, provider null.
//   6. THE KEEP RULE, the same for both arms: KEPT only if the development score moved up AND no
//      development item that was right is lost AND the control rows answered no fewer right. A kept
//      trial becomes the arm's lineage; anything else is deleted and the deletion checked.
//
// THE SPLIT. The keep rule reads the development items only. The held-out items (for ARC: the
// evaluation split; the development items are the training split, as bench/grid.mjs names them)
// are graded by the same cells-only path at census open and at census close, never inside a round.
//
// THE TYPED KINDS are the queue's four names for what the spawn operator grows: its genes map as
// program = grid primitive, fit = sequence program, solve and eval = solved template (an exact
// solver bound to the question), cmp and arith = direct entry (one cell, one operation). A kind
// whose bench has no model-off item source is refused by name, never faked.
//
// The loop's call: runCensus({ rounds }) from a model-off pass (bench/spawn.mjs --census N is the
// bar command). MODEL OFF: nothing here opens a socket (provider 'null'; spawned answers never ask).
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, copyFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import { createHash } from 'node:crypto';
import '../cells/all.mjs';
import { Brain } from '../core/brain.mjs';
import { ask } from '../act/prompt.mjs';
import { spawnAsk } from '../act/spawn.mjs';
import { plan, grow, holds, regionCells, SPAWN_REGION, CAPS } from '../genome/spawn.mjs';
import { SEARCH_OPS } from '../tasks/grid.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const AUTHOR = 'board 20 builder';
export const BRAIN_NAME = 'dilation';
export const TYPED_KINDS = Object.freeze(['solved template', 'direct entry', 'sequence program', 'grid primitive']);
/** The spawn genome's genes, by the typed kind each one grows. */
export const GENE_KIND = Object.freeze({ program: 'grid primitive', fit: 'sequence program', solve: 'solved template', eval: 'solved template', cmp: 'direct entry', arith: 'direct entry' });
/** Ledger kinds that name a red BENCH (a gate row is a test, not a bench). */
export const RED_KINDS = Object.freeze(['missed', 'ladder', 'bar never completed']);
/**
 * A red ledger line to its typed kind and item source, first match wins. source null: the kind is
 * typed but no model-off item source exists for it on this host, and the round says why.
 */
export const BENCH_KINDS = Object.freeze([
  { test: /grid|arc/i, kind: 'grid primitive', source: 'arc' },
  { test: /sequence/i, kind: 'sequence program', source: 'answer:sequence' },
  { test: /(^|[:/])(spawn|answer)(\.json|$)|algebra/i, kind: 'solved template', source: 'answer:algebra' },
  { test: /(^|[:/])(ns|math)(\.json|$)|gsm8k|solved/i, kind: 'solved template', source: null, why: 'its items are word problems: no gene of genome/spawn.mjs expresses one model off (a solved template needs a verified program, which the model writes)' },
  { test: /native|knowledge|direct|word/i, kind: 'direct entry', source: null, why: 'its items are wiki facts and word problems: no gene of genome/spawn.mjs expresses one model off' },
]);
export const CONTROL_TASKS = 10;
export const CONTROL_SUITES = Object.freeze(['algebra', 'sequence', 'grid']);

// ---------------------------------------------------------------- small pure helpers
/** A seeded generator (sha256 of the seed, then xorshift128+ halves): the placebo and the bootstrap draw from it. */
export function rngFrom(seed) {
  const h = createHash('sha256').update(String(seed)).digest();
  let a = h.readUInt32LE(0) | 1, b = h.readUInt32LE(4) | 1, c = h.readUInt32LE(8) | 1, d = h.readUInt32LE(12) | 1;
  const next = () => { const t = a ^ (a << 11); a = b; b = c; c = d; d = (d ^ (d >>> 19) ^ (t ^ (t >>> 8))) >>> 0; return d / 4294967296; };
  return { next, int: (n) => Math.floor(next() * n) };
}

const rows = (g) => g.map((r) => r.join('')).join('|');
/** An ARC task as the grid prompt the spawn genome reads (bench/answer.mjs gridQuestion's words). */
export function arcPrompt(j, test = 0) {
  return 'Each line below is an input grid and its output grid, rows separated by | and every cell a single digit. '
    + 'One transformation makes every output from its input.\n'
    + j.train.map((d) => rows(d.input) + ' -> ' + rows(d.output)).join('\n')
    + '\nApply that same transformation to this input: ' + rows(j.test[test].input)
    + '\nAnswer with the output grid only, rows separated by |.';
}

/** Pick the bench: the first red line of a typed kind with an item source; typed lines without one are listed. */
export function pickBench(lines) {
  const skipped = [];
  for (const l of Array.isArray(lines) ? lines : []) {
    if (!l || !RED_KINDS.includes(l.kind)) continue;
    // the bench's own name only: a file it touches (memory/direct.mjs, daemon/run.mjs) says nothing about its kind
    const hay = [l.id, l.verdictFile].filter(Boolean).join(' ');
    const rule = BENCH_KINDS.find((r) => r.test.test(hay));
    if (!rule) continue;
    if (!rule.source) { skipped.push({ id: l.id, kind: rule.kind, why: rule.why }); continue; }
    return { line: { id: l.id, kind: l.kind, measured: l.measured ?? null, bar: l.bar ?? null, verdictFile: l.verdictFile ?? null }, kind: rule.kind, source: rule.source, skipped };
  }
  return { line: null, kind: null, source: null, skipped };
}

/** The circuit spec gridProgram (genome/spawn.mjs) builds for a chain of ops: same ids, same kinds, same read head. */
export function chainCircuit(ops) {
  const cells = [], edges = [], names = [];
  let prev = null;
  for (const op of ops) {
    names.push(op.name);
    const id = 'spawn.grid/' + names.join('/');
    cells.push({ id, kind: op.kind, params: op.params, circuit: 'grid' });
    if (prev) edges.push({ src: prev, srcPort: 'out', dst: id, dstPort: 'in' });
    prev = id;
  }
  const tap = (prev || 'spawn.grid/identity') + '#tap';
  cells.push({ id: tap, kind: 'task.tap', params: {}, circuit: 'grid' });
  if (prev) edges.push({ src: prev, srcPort: 'out', dst: tap, dstPort: 'in' });
  return { gene: 'program', method: 'spawn.program', cells, edges, exit: tap, depth: ops.length, placebo: true };
}

/** The steps of a circuit (its cells minus the read head), for a record. */
const stepsOf = (c) => c.cells.filter((x) => x.kind !== 'task.tap').map((x) => x.id);

/**
 * A random circuit of the same kind, the placebo. Grid primitive: a chain of `length` ops drawn
 * uniformly from the genome's own vocabulary (tasks/grid.mjs SEARCH_OPS, the ops genome/spawn.mjs
 * searches), with a random colour map last when the real circuit ended in one. Any other kind: one
 * cell of the gene's kind at a fresh id, wired where the same path can reach it.
 */
export function placeboCircuit(kind, rng, { length = 1, colormap = false, template = null } = {}) {
  if (kind === 'grid primitive') {
    const ops = [];
    const n = Math.max(1, Math.min(CAPS.depth + 1, length)) - (colormap ? 1 : 0);
    for (let i = 0; i < n; i++) ops.push(SEARCH_OPS[rng.int(SEARCH_OPS.length)]);
    if (colormap) {
      const map = {};
      const k = 1 + rng.int(3);
      for (let i = 0; i < k; i++) map[rng.int(10)] = rng.int(10);
      ops.push({ name: 'colormap' + JSON.stringify(map), kind: 'grid.colormap', params: { map } });
    }
    return chainCircuit(ops);
  }
  const t = template && template.cells && template.cells[0] ? template.cells[0] : { kind: 'num.arith', params: { op: '+' } };
  const id = 'spawn.placebo.' + rng.int(0xffffffff).toString(16);
  return { gene: 'placebo', method: 'spawn.placebo', cells: [{ id, kind: t.kind, params: t.params, circuit: 'placebo' }], edges: [], exit: id, depth: 0, placebo: true };
}

/**
 * A 95 percent bootstrap band of keptPerHour(real) minus keptPerHour(placebo), resampling rounds.
 * Both arms are rated per hour of the whole census wall (open, planning, rounds, close), the same
 * denominator, so the band is the kept difference over that wall.
 */
export function bootstrapBand(rounds, { hours, resamples = 2000, seed = 'census/bootstrap' } = {}) {
  const n = rounds.length;
  if (!n || !(hours > 0)) return { lo: null, hi: null, resamples: 0 };
  const rng = rngFrom(seed), diffs = [];
  for (let b = 0; b < resamples; b++) {
    let d = 0;
    for (let i = 0; i < n; i++) { const r = rounds[rng.int(n)]; d += (r.real.kept ? 1 : 0) - (r.placebo.kept ? 1 : 0); }
    diffs.push(d / hours);
  }
  diffs.sort((x, y) => x - y);
  return { lo: diffs[Math.floor(0.025 * (resamples - 1))], hi: diffs[Math.ceil(0.975 * (resamples - 1))], resamples };
}

// ---------------------------------------------------------------- items
/** The development and held-out items of a source, each { id, prompt, grade(answer) }. */
export async function itemsFor(source, { root = ROOT, controlTasks = CONTROL_TASKS } = {}) {
  if (source === 'arc') {
    const dir = path.join(root, 'bench', 'fixtures', 'public', 'arc-agi-1');
    if (!existsSync(dir)) throw new Error('the ARC fixture is absent at ' + path.relative(root, dir) + ' (bench/grid.mjs reads it there)');
    const { loadSplit } = await import('../bench/grid.mjs');
    const load = (split) => loadSplit(split).map((t) => ({ t, j: JSON.parse(readFileSync(t.file, 'utf8')) }))
      .filter(({ j }) => Array.isArray(j.test) && j.test.length === 1 && Array.isArray(j.test[0].output))
      .map(({ t, j }) => { const want = rows(j.test[0].output); return { id: split + '/' + t.id, prompt: arcPrompt(j), want, grade: (a) => !!a && a.exact && a.exact.answer === want }; });
    return { dev: load('training'), heldOut: load('evaluation'), what: { dev: 'ARC-AGI-1 training split, every task with one test input', heldOut: 'ARC-AGI-1 evaluation split, every task with one test input' } };
  }
  const m = /^answer:(\w+)$/.exec(String(source));
  if (m) {
    const { buildQuestions, gradeAnswer } = await import('../bench/answer.mjs');
    const all = buildQuestions({ tasksPerSuite: controlTasks * 4 }).filter((q) => q.source === m[1]);
    const it = all.map((q) => ({ id: q.id, prompt: q.q, grade: (a) => !!a && gradeAnswer(a.text, q).ok }));
    return { dev: it.filter((_, i) => i % 2 === 0), heldOut: it.filter((_, i) => i % 2 === 1), what: { dev: 'bench/answer.mjs ' + m[1] + ' suite, even positions', heldOut: 'the same suite, odd positions' } };
  }
  throw new Error('no item source ' + source);
}

// ---------------------------------------------------------------- the path, shared by both arms
export function restore(dir) { return Brain.restore(dir, { ledger: 'off' }); }

/** What the spawn operator plans for an item, cached (plan is a pure function of the prompt). */
function planned(ctx, item) {
  if (!ctx.plans.has(item.id)) {
    const t = performance.now();
    const p = plan(item.prompt);
    ctx.planMs += performance.now() - t;
    ctx.plans.set(item.id, p.circuits);
  }
  return ctx.plans.get(item.id);
}

/**
 * The bench on a brain: every item asked through act/spawn.mjs spawnAsk with growth OFF, so only
 * held cells answer. An item none of whose planned circuits the brain holds cannot be answered by
 * cells and is not asked (spawnAsk would find no incumbent and try to grow).
 */
export function cellsScore(ctx, brain, items) {
  const t = performance.now();
  const policy = brain.gate.policy;
  brain.gate.policy = (p, c) => (p.kind === 'cell.add' ? 'reject' : policy(p, c));
  const right = new Set();
  let asked = 0;
  try {
    for (const item of items) {
      const circuits = planned(ctx, item);
      if (!circuits.some((c) => holds(brain, c))) continue;
      asked++;
      const r = spawnAsk(brain, item.prompt, { by: 'census.bench' });
      if (item.grade(r.answer)) right.add(item.id);
    }
  } finally { brain.gate.policy = policy; }
  return { right: right.size, n: items.length, asked, ids: right, ms: performance.now() - t };
}

/** The control rows: the spawn bench's own suites through ask() on a throwaway restore. */
export async function controlScore(ctx, dir) {
  const brain = restore(dir);
  let right = 0;
  for (const q of ctx.controls) {
    const a = await ask(brain, q.q, { provider: 'null', spawn: true });
    if (ctx.gradeControl(a.text, q).ok) right++;
  }
  return { right, n: ctx.controls.length };
}

function rmVerified(dir) {
  rmSync(dir, { recursive: true, force: true });
  if (existsSync(dir)) throw new Error('could not delete ' + dir);
}

/** One arm: copy, restore, grow ONE circuit, write, restore again, bench, controls, keep or delete. */
export async function runArm(ctx, which, circuit, meta = {}) {
  const t = performance.now();
  const L = ctx.lineage[which];
  const out = { arm: which, ...meta, spawned: 0, edges: 0, cells: [], before: L.score.right, after: null, moved: false, lost: [], controlBefore: L.control.right, controlAfter: null, kept: false, why: null, ms: 0 };
  const done = () => { out.ms = performance.now() - t; L.ms += out.ms; if (out.kept) L.kept.push({ round: meta.round, cells: out.cells, target: meta.target || null }); return out; };
  if (!circuit) { out.why = meta.why || 'no circuit'; return done(); }
  const trial = path.join(ctx.work, which + '-trial-' + (++ctx.trials));
  cpSync(L.dir, trial, { recursive: true });
  try {
    let brain = restore(trial);
    const g = grow(brain, [circuit], { by: 'census.' + which, why: 'census round ' + meta.round + ': ' + (which === 'real' ? 'spawned for ' + meta.target : 'placebo, a random ' + ctx.bench.kind) });
    out.spawned = g.cells.length; out.edges = g.edges.length; out.cells = g.cells;
    if (!g.ok || g.status === 'none') { out.why = g.ok ? 'the brain already holds every cell of this circuit' : 'the gate did not approve cell.add: ' + g.reason; rmVerified(trial); return done(); }
    brain.snapshot(trial);
    brain = restore(trial);
    const after = cellsScore(ctx, brain, ctx.items.dev);
    out.after = after.right;
    out.moved = after.right > L.score.right;
    out.lost = [...L.score.ids].filter((id) => !after.ids.has(id));
    const control = await controlScore(ctx, trial);
    out.controlAfter = control.right;
    const regressed = out.lost.length > 0 || control.right < L.control.right;
    out.kept = out.moved && !regressed;
    out.why = out.kept ? 'the bench moved ' + L.score.right + ' -> ' + after.right + ' with no regression'
      : !out.moved ? 'the bench did not move (' + L.score.right + ' -> ' + after.right + ')'
        : 'regressed: ' + (out.lost.length ? out.lost.length + ' development items lost' : 'control rows ' + L.control.right + ' -> ' + control.right);
    if (out.kept) {
      rmVerified(L.dir);
      renameSync(trial, L.dir);
      L.score = after; L.control = control;
    } else rmVerified(trial);
  } catch (e) {
    out.why = 'error: ' + (e && e.message ? e.message : String(e));
    out.kept = false;
    if (existsSync(trial)) rmVerified(trial);
  }
  return done();
}

/** The next development item the real arm spawns for: missed by the held cells, expressed by the operator in the bench's kind. */
export function nextTarget(ctx) {
  const L = ctx.lineage.real;
  while (ctx.cursor < ctx.items.dev.length) {
    const item = ctx.items.dev[ctx.cursor++];
    if (L.score.ids.has(item.id)) continue;
    const c = planned(ctx, item).find((x) => GENE_KIND[x.gene] === ctx.bench.kind);
    if (!c) continue;
    const brain = ctx.lineageBrain || (ctx.lineageBrain = restore(L.dir));
    if (holds(brain, c)) continue;
    return { item, circuit: c };
  }
  return null;
}

// ---------------------------------------------------------------- open, round, close
/**
 * Open a census: the ledger, the bench, the items, two lineages copied from the live state (or
 * seeded as `brain init` seeds one when the host has none), the baselines.
 * @param {object} [o] { root, tmp, name, seed, lines, items, controls, gradeControl, log }
 */
export async function openCensus(o = {}) {
  const t0 = performance.now();
  const root = o.root || ROOT;
  const name = o.name || BRAIN_NAME;
  const log = o.log || (() => {});
  const ctx = { root, name, seed: o.seed || 'census', rounds: [], plans: new Map(), planMs: 0, trials: 0, cursor: 0, lineageBrain: null, log };
  // 1. the ledger
  let lines = o.lines, ledgerFrom = 'injected';
  if (!lines) {
    const G = await import('./gaps.mjs');
    const read = G.readLedger(root);
    const got = Array.isArray(read) ? read : read && Array.isArray(read.lines) ? read.lines : [];
    if (got.length) { lines = got; ledgerFrom = G.LEDGER_REL; }
    else { lines = (await G.buildLedger({ root })).lines; ledgerFrom = 'self/gaps.mjs buildLedger, in memory, model off, nothing written (' + G.LEDGER_REL + ' absent on this host)'; }
  }
  ctx.ledger = { from: ledgerFrom, lines: lines.length };
  // 2. the bench
  ctx.bench = pickBench(lines);
  if (!ctx.bench.line) throw new Error('no red bench of a typed kind with a model-off item source in the ledger (' + lines.length + ' lines; typed but skipped: ' + ctx.bench.skipped.map((s) => s.id).join(', ') + ')');
  ctx.items = o.items || await itemsFor(ctx.bench.source, { root });
  // 3. the control rows
  if (o.controls) { ctx.controls = o.controls; ctx.gradeControl = o.gradeControl; }
  else {
    const { buildQuestions, gradeAnswer } = await import('../bench/answer.mjs');
    ctx.controls = buildQuestions({ tasksPerSuite: CONTROL_TASKS }).filter((q) => CONTROL_SUITES.includes(q.source));
    ctx.gradeControl = gradeAnswer;
  }
  // 4. the lineages, both from the same start
  if (o.tmp) mkdirSync(o.tmp, { recursive: true }); // the --tmp dir may not exist yet (the verify plane's defect finding)
  ctx.work = mkdtempSync(path.join(o.tmp || os.tmpdir(), 'brain-census-'));
  const start = path.join(ctx.work, 'start', name);
  mkdirSync(start, { recursive: true });
  const live = path.join(root, 'state', name, 'snapshot.json');
  if (o.startFrom === 'seed' || !existsSync(live)) {
    const { seedBasic } = await import('../seeds/basic.mjs');
    seedBasic({ name, dir: start, ledger: 'off' }).snapshot(start);
    ctx.start = 'seeded as brain init seeds a brain (seeds/basic.mjs): ' + (existsSync(live) ? 'asked for' : 'no live state/' + name + ' on this host');
  } else {
    copyFileSync(live, path.join(start, 'snapshot.json'));
    ctx.start = 'a copy of the live state/' + name + '/snapshot.json (the live state is never written)';
  }
  const startBrain = restore(start);
  ctx.startCensus = censusOf(startBrain);
  // the baselines: the bench twice (its run to run noise), the held-out items, the controls
  const b1 = cellsScore(ctx, startBrain, ctx.items.dev);
  const b2 = cellsScore(ctx, restore(start), ctx.items.dev);
  ctx.noise = { devRuns: [b1.right, b2.right], diff: Math.abs(b1.right - b2.right) };
  ctx.heldOutBefore = cellsScore(ctx, startBrain, ctx.items.heldOut);
  const control = await controlScore(ctx, start);
  ctx.lineage = {};
  for (const which of ['real', 'placebo']) {
    const dir = path.join(ctx.work, which, name);
    mkdirSync(path.dirname(dir), { recursive: true });
    cpSync(start, dir, { recursive: true });
    ctx.lineage[which] = { dir, score: { right: b1.right, ids: new Set(b1.ids) }, control: { ...control }, kept: [], ms: 0 };
  }
  ctx.rng = rngFrom(ctx.seed + '/placebo');
  ctx.openMs = performance.now() - t0;
  log('census open: bench ' + ctx.bench.line.id + ' (' + ctx.bench.kind + '), ledger ' + ctx.ledger.from + ', ' + ctx.items.dev.length + ' development items, ' + ctx.items.heldOut.length + ' held out, '
    + ctx.controls.length + ' control rows; start ' + ctx.startCensus.cells + ' cells; bench before ' + b1.right + ' and ' + b2.right + ' (noise ' + ctx.noise.diff + '); held out ' + ctx.heldOutBefore.right + '; controls ' + control.right + '/' + control.n
    + '; open ' + (ctx.openMs / 1000).toFixed(1) + ' s');
  return ctx;
}

/** One census round: the real arm, then the placebo arm, by the same path and the same rule. */
export async function censusRound(ctx) {
  const round = ctx.rounds.length + 1;
  const tr = performance.now();
  const target = nextTarget(ctx);
  const pickMs = performance.now() - tr;
  const realMeta = target ? { round, target: target.item.id, steps: stepsOf(target.circuit), gene: target.circuit.gene } : { round, why: 'no development item left that the held cells miss and the spawn operator expresses as a ' + ctx.bench.kind };
  const real = await runArm(ctx, 'real', target ? target.circuit : null, realMeta);
  real.ms += pickMs; ctx.lineage.real.ms += pickMs;
  if (real.kept) ctx.lineageBrain = null;
  const len = target ? target.circuit.depth : 1 + ctx.rng.int(CAPS.depth);
  const cm = !!target && target.circuit.cells.some((c) => c.kind === 'grid.colormap');
  const pc = placeboCircuit(ctx.bench.kind, ctx.rng, { length: len, colormap: cm, template: target ? target.circuit : null });
  const placebo = await runArm(ctx, 'placebo', pc, { round, steps: stepsOf(pc), gene: pc.gene });
  const r = { round, real, placebo };
  ctx.rounds.push(r);
  ctx.log('round ' + String(round).padStart(3) + '  real ' + (real.kept ? 'KEPT' : 'no  ') + ' ' + (realMeta.target || '-') + ' [' + (realMeta.steps || []).join(' ') + '] ' + real.before + '->' + (real.after ?? '-')
    + ' ' + (real.ms / 1000).toFixed(2) + 's | placebo ' + (placebo.kept ? 'KEPT' : 'no  ') + ' [' + placebo.steps.join(' ') + '] ' + placebo.before + '->' + (placebo.after ?? '-') + ' ' + (placebo.ms / 1000).toFixed(2) + 's');
  return r;
}

/** Cells, edges and kinds of a brain, and the spawn region by kind. */
export function censusOf(brain) {
  const kinds = new Map(), spawnKinds = {};
  for (const c of brain.cells) {
    kinds.set(c.kind, (kinds.get(c.kind) || 0) + 1);
    if (c.region === SPAWN_REGION) spawnKinds[c.kind] = (spawnKinds[c.kind] || 0) + 1;
  }
  return { cells: brain.cells.length, edges: brain.connectome.size(), kinds: kinds.size, spawnRegion: regionCells(brain), spawnKinds };
}

/** Close: the held-out items on the real lineage, the census of both lineages, the work dir deleted and checked. */
export function closeCensus(ctx) {
  const real = restore(ctx.lineage.real.dir), placebo = restore(ctx.lineage.placebo.dir);
  const out = {
    heldOutAfter: cellsScore(ctx, real, ctx.items.heldOut),
    heldOutPlaceboAfter: cellsScore(ctx, placebo, ctx.items.heldOut),
    census: censusOf(real), placeboCensus: censusOf(placebo),
  };
  rmVerified(ctx.work);
  out.workDeleted = !existsSync(ctx.work);
  return out;
}

/**
 * The loop's model-off call: open, N rounds, close. Returns every measurement; writes nothing but
 * its own work directory (deleted at close).
 */
export async function runCensus(o = {}) {
  const t0 = performance.now();
  const rounds = Number.isInteger(o.rounds) && o.rounds > 0 ? o.rounds : 1;
  const ctx = await openCensus(o);
  let error = null;
  try { for (let i = 0; i < rounds; i++) await censusRound(ctx); } catch (e) { error = e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e); }
  const closed = closeCensus(ctx);
  const R = ctx.lineage.real, P = ctx.lineage.placebo;
  const wallS = (performance.now() - t0) / 1000, hours = wallS / 3600;
  const perHour = (k, ms) => (ms > 0 ? k / (ms / 3_600_000) : 0);
  return {
    ctx, error, completed: !error && ctx.rounds.length === rounds, roundsAsked: rounds, rounds: ctx.rounds,
    kept: R.kept.length, placeboKept: P.kept.length, realMs: R.ms, placeboMs: P.ms,
    // per hour of the whole census wall: the planning the spawn operator did at open is in it
    keptPerHour: R.kept.length / hours, placeboKeptPerHour: P.kept.length / hours,
    // per hour of each arm's own round time, printed beside (the planning at open is in neither)
    armKeptPerHour: perHour(R.kept.length, R.ms), armPlaceboKeptPerHour: perHour(P.kept.length, P.ms),
    band: bootstrapBand(ctx.rounds, { hours, seed: ctx.seed + '/bootstrap' }),
    wallS, ...closed,
  };
}
