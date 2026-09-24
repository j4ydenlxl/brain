// bench/operators.mjs: THE OPERATORS BAR (Board 14, item operators).
//
// His order of 2026-09-24 12:02: "Its gotta work without me. Thats the most important part. EVERY
// GAP should be able to be filled by itself, ur just the engineer to author it". self/operators.mjs
// holds the moves (knob-tune, strategy-swap, recombine, author) and self/improve.mjs judges a move
// against a NUMBER on a temp copy, never on the real tree. This bench grades both, in two parts.
//
//   PLANTED, six checks on a lean copy of the tree with test/operators-plant.mjs planted into it; the
//   REAL bench/gate.mjs decides every keep:
//     1. knob-tune closes a planted gap (GAIN 10, metric 64, bar 95) with the gate GREEN on the copy
//     2. strategy-swap keeps the better strategy (from slow 50: fast 97 against mid 80)
//     3. a knob step outside its band (EDGE 20 to 22, band [4, 20]) is refused before it runs
//     4. an author diff outside the gap's files list, and one under the ceiling, are refused
//     5. a real move inside the noise band (DRIFT 1.0 to 1.1 under a planted jitter of 0.5) is refused
//     6. the real qwen3:30b-a3b is asked ONCE (a 1-call budget) and its diff is judged, or refused
//        with the reason printed
//   REAL: state/self/gaps.jsonl, or while it is absent a two line stand-in built from
//   bench/verdicts/math.json and bench/verdicts/compress.json (said so, and written to
//   state/self/operators/gaps-standin.jsonl, never to the gaps item's file). Two gaps with a
//   model-free trial of at most 5 minutes and at least one knob; on each, knob-tune (at most 6
//   trials) and the author once; before, after, noise, and kept or the reason, printed.
//
// BAR MET = planted 6 of 6 AND the real set completes with every number printed.
// The CONTROL of every claim is the unpatched trial run twice on the same copy (the baseline, or
// today's baseline for the same command and file bytes); the noise band is printed beside it.
//
// The bar, through the budget wrapper:
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 4096 --dir <tmp> -- node --max-old-space-size=6000 bench/operators.mjs --tmp <tmp>
// Flags: --tmp DIR (where every copy goes; default the OS temp dir), --no-model (check 6 and the
// real author skipped), --planted-only, --real-only, --checks 1,2,5, --gaps FILE. Any of them makes
// the run PARTIAL: it writes bench/verdicts/operators-partial.json (isTheBar false), and only a
// full run writes bench/verdicts/operators.json.
// Exit 0: bar met. Exit 2: the run completed and the bar is missed. Exit 1: the run broke.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  improve, copyTree, deleteCopy, hashFiles, freeMb, today, baselinesFile, stateDirOf, COPY_PREFIX,
} from '../self/improve.mjs';
import { makeBudget, gapKnobs, allowedFiles, AUTHOR_MODEL, TRIALS_PER_ROUND, MODEL_CALLS_PER_RUN, CALL_WALL_MS } from '../self/operators.mjs';
import { readGaps } from '../self/knobs.mjs';
import { plantInto, plantGaps, mockAuthor, AUTHOR_DIFF_OUTSIDE, AUTHOR_DIFF_CEILING } from '../test/operators-plant.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');
const MB = 1048576;
const r2 = (x) => (x === null || x === undefined || !Number.isFinite(Number(x)) ? null : Math.round(Number(x) * 100) / 100);
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const val = (n) => { const i = argv.indexOf(n); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null; };
const TMP = path.resolve(val('--tmp') || process.env.OPERATORS_TMP || os.tmpdir());
const NO_MODEL = flag('--no-model');
const ONLY_PLANTED = flag('--planted-only');
const ONLY_REAL = flag('--real-only');
const CHECKS = val('--checks') ? val('--checks').split(',').map((x) => Number(x.trim())).filter(Number.isFinite) : [1, 2, 3, 4, 5, 6];
const GAPS_FILE = val('--gaps') ? path.resolve(val('--gaps')) : path.join(ROOT, 'state', 'self', 'gaps.jsonl');
const PARTIAL = NO_MODEL || ONLY_PLANTED || ONLY_REAL || !!val('--checks') || !!val('--gaps');
const STATE = stateDirOf(ROOT);
const STANDIN_FILE = path.join(STATE, 'gaps-standin.jsonl');

const say = (s = '') => console.log(s);
let peak = 0;
const seePeak = (x) => { const n = Number(x); if (Number.isFinite(n) && n > peak) peak = n; };
const sampler = setInterval(() => seePeak(process.memoryUsage().rss / MB), 2000);
sampler.unref();
const copies = [];
const calls = [];

// ------------------------------------------------------------------ helpers
/** The control of a round: the two unpatched runs on its copy, or today's for the same command. */
function controlOf(r, gap) {
  const b = (r.trials || []).find((t) => t.kind === 'baseline' && t.before !== null && t.before !== undefined);
  if (b) return { runs: [b.before, b.after], noise: b.noise, how: b.reason, reused: false, at: b.at };
  const f = baselinesFile(STATE);
  if (existsSync(f)) {
    const lines = readFileSync(f, 'utf8').split('\n').filter(Boolean)
      .map((l) => { try { return JSON.parse(l); } catch { return null; } })
      .filter((x) => x && gap.trial && x.command === gap.trial.command && x.date === today());
    const last = lines[lines.length - 1];
    if (last) return { runs: last.runs, noise: last.noise, how: last.how, reused: true, at: last.at };
  }
  return { runs: null, noise: r.noise ?? null, how: null, reused: null, at: null };
}
const ctlText = (c) => (c.runs
  ? 'control: the unpatched trial ' + (c.reused ? '(today\'s baseline, reused from ' + c.at + ') ' : 'run twice on this copy ') + 'read ' + c.runs.join(' and ') + ', noise band ' + c.noise + ' (' + c.how + ')'
  : 'control: no baseline was read (' + (c.noise === null ? 'the round stopped before it' : 'noise ' + c.noise) + ')');

const what = (r) => (r.knob ? r.knob + ' ' + r.from + ' to ' + r.value : r.name || r.operator);
const decisionText = (r) => (r.kept
  ? 'KEPT ' + what(r) + ': before ' + r.before + ', after ' + r.after + ' (search run and confirmation ' + r.confirm + ', the less favourable kept), toward ' + r.toward + ' against noise ' + r.noise + ', closed ' + r.closed + ', gate on the copy ' + (r.gate ? r.gate.verdict + ' in ' + r.gate.seconds + ' s' : 'n/a')
  : 'REFUSED: ' + r.reason + ' (before ' + (r.before ?? 'n/a') + ', after ' + (r.after ?? 'n/a') + ', noise ' + (r.noise ?? 'n/a') + ')');

function trialRows(r) {
  return (r.trials || []).filter((t) => t.kind === 'trial' || t.kind === 'confirm').map((t) => ({
    kind: t.kind, knob: t.knob, name: t.name, value: t.value, from: t.from, before: t.before, ref: t.ref ?? null, after: t.after,
    towardRef: t.towardRef ?? null, noise: t.noise, seconds: t.seconds, reason: t.reason, patch: t.patch || null, answer: t.answer || null,
  }));
}

async function round(label, opts) {
  say('');
  say('== ' + label);
  const t0 = Date.now();
  const r = await improve({ tmpRoot: TMP, log: (l) => say('   ' + l), ...opts });
  r.wallSeconds = Math.round((Date.now() - t0) / 10) / 100;
  if (r.copy) copies.push({ label, ...r.copy });
  for (const t of r.trials || []) seePeak(t.peakRssMb);
  if (r.gate) seePeak(r.gate.peakRssMb);
  for (const t of r.tests || []) seePeak(t.peakRssMb);
  if (opts.budget && opts.budget.model) for (const c of opts.budget.model.calls) calls.push({ round: label, ...c });
  return r;
}

function row(n, name, pass, r, control, why, extra = {}) {
  const out = {
    n, name, pass, why: pass ? null : why, decision: decisionText(r), control,
    kept: !!r.kept, before: r.before ?? null, after: r.after ?? null, noise: r.noise ?? null, toward: r.toward ?? null, closed: r.closed ?? null,
    knob: r.knob || null, candidate: r.name || null, from: r.from ?? null, value: r.value ?? null,
    gate: r.gate ? { verdict: r.gate.verdict, green: r.gate.green, seconds: r.gate.seconds, summary: r.gate.summary, hash: r.gate.hash } : null,
    tests: (r.tests || []).map((t) => ({ test: t.test, exit: t.exit, pass: t.pass, fail: t.fail, seconds: t.seconds })),
    patch: r.kept ? r.patch : null, trials: trialRows(r), reason: r.kept ? null : r.reason, seconds: r.wallSeconds,
    copy: r.copy || null, record: r.record ? rel(r.record) : null, ...extra,
  };
  say('check ' + n + ' ' + (pass ? 'PASS' : 'FAIL') + ': ' + name);
  say('   ' + out.decision);
  say('   ' + ctlText(control));
  if (!pass) say('   why it fails: ' + why);
  return out;
}

// ------------------------------------------------------------------ PLANTED
async function planted() {
  const checks = [];
  say('PLANTED: a lean copy of the tree, the plant written into it; the real tree is never written');
  const plant = copyTree(ROOT, { tmpRoot: TMP });
  const written = plantInto(plant.dir, { gate: null });
  say('plant ' + plant.dir + ': ' + plant.files + ' files, ' + (plant.bytes / MB).toFixed(1) + ' MB in ' + plant.ms + ' ms; planted ' + written.join(', ') + '; the gate on it is the real bench/gate.mjs');
  const G = plantGaps();
  const common = { root: plant.dir, stateDir: STATE, kitRoot: ROOT };
  try {
    if (CHECKS.includes(1)) {
      const r = await round('check 1: knob-tune on planted-tune (GAIN 10, metric 64, bar 95), the real gate deciding the keep',
        { ...common, gap: G.tune, operator: 'knob-tune', budget: makeBudget({ trials: TRIALS_PER_ROUND, modelCalls: 0 }) });
      const pass = !!(r.kept && r.closed && r.gate && r.gate.green);
      checks.push(row(1, 'knob-tune closes the gap with the gate GREEN on the copy', pass, r, controlOf(r, G.tune),
        !r.kept ? r.reason : !r.closed ? 'kept but the gap is not closed (after ' + r.after + ', bar 95)' : 'the gate on the copy is not GREEN'));
    }
    if (CHECKS.includes(2)) {
      const r = await round('check 2: strategy-swap on planted-strategy (slow 50 selected; fast 97 and mid 80 declared; bar 95)',
        { ...common, gap: G.strategy, operator: 'strategy-swap', budget: makeBudget({ trials: TRIALS_PER_ROUND, modelCalls: 0 }) });
      const tried = trialRows(r).filter((t) => t.kind === 'trial' && t.after !== null).map((t) => t.name + ' ' + t.after);
      const pass = !!(r.kept && r.name === 'fast' && r.gate && r.gate.green);
      checks.push(row(2, 'strategy-swap picks the better strategy', pass, r, controlOf(r, G.strategy),
        !r.kept ? r.reason : r.name !== 'fast' ? 'kept ' + r.name + ', not fast' : 'the gate on the copy is not GREEN', { tried }));
      say('   strategies measured: ' + (tried.join(', ') || 'none'));
    }
    if (CHECKS.includes(3)) {
      const r = await round('check 3: knob-tune on planted-edge (EDGE 20 at the top of its band [4, 20], step 2, bar 80)',
        { ...common, gap: G.edge, operator: 'knob-tune', budget: makeBudget({ trials: TRIALS_PER_ROUND, modelCalls: 0 }) });
      const t = trialRows(r);
      const refused22 = t.find((x) => x.kind === 'trial' && Number(x.value) === 22 && x.after === null && /band/i.test(x.reason || ''));
      const ran22 = t.some((x) => x.kind === 'trial' && Number(x.value) === 22 && x.after !== null);
      const pass = !r.kept && !!refused22 && !ran22;
      checks.push(row(3, 'a knob step outside its band is refused', pass, r, controlOf(r, G.edge),
        r.kept ? 'a candidate was kept' : ran22 ? 'EDGE = 22 was run' : 'no refusal naming the band for EDGE = 22', { refusal: refused22 ? refused22.reason : null }));
      if (refused22) say('   the refusal: ' + refused22.reason);
    }
    if (CHECKS.includes(4)) {
      const a = mockAuthor(AUTHOR_DIFF_OUTSIDE);
      const r = await round('check 4a: author (a fixture answer, no socket) on planted-tune, the diff patches planted/strategy.mjs',
        { ...common, gap: G.tune, operator: 'author', budget: makeBudget({ trials: 1, modelCalls: 1, author: a }) });
      const refA = trialRows(r).find((x) => x.kind === 'trial' && x.after === null && /outside the gap's files list/.test(x.reason || ''));
      const gapC = { ...G.tune, id: 'planted-tune-ceiling', files: ['planted/tune.mjs', 'self/improve.mjs'] };
      const b = mockAuthor(AUTHOR_DIFF_CEILING);
      const rc = await round('check 4b: author (a fixture answer, no socket) on a gap that also lists self/improve.mjs, the diff patches self/improve.mjs',
        { ...common, gap: gapC, operator: 'author', budget: makeBudget({ trials: 1, modelCalls: 1, author: b }) });
      const refC = trialRows(rc).find((x) => x.kind === 'trial' && x.after === null && /self\/improve\.mjs|ceiling/i.test(x.reason || ''));
      const pass = !r.kept && !!refA && !rc.kept && !!refC;
      checks.push(row(4, 'a diff outside the files list is refused', pass, r, controlOf(r, G.tune),
        !refA ? 'the outside diff was not refused as outside the files list' : 'the ceiling diff was not refused', {
          refusal: refA ? refA.reason : null, ceiling: { kept: !!rc.kept, refusal: refC ? refC.reason : rc.reason, decision: decisionText(rc) },
        }));
      if (refA) say('   4a refusal: ' + refA.reason);
      say('   4b ' + (refC ? 'refusal: ' + refC.reason : decisionText(rc)));
    }
    if (CHECKS.includes(5)) {
      const r = await round('check 5: knob-tune on planted-drift (a bare "// knob" DRIFT 1.0, band 0.7 to 1.5, step 0.1; a planted jitter of 0.5 alternating by run)',
        { ...common, gap: G.drift, operator: 'knob-tune', budget: makeBudget({ trials: TRIALS_PER_ROUND, modelCalls: 0 }) });
      const t = trialRows(r);
      const inside = t.find((x) => x.kind === 'trial' && x.after !== null && x.towardRef !== null && x.towardRef > 0 && x.towardRef <= x.noise);
      const pass = !r.kept && !!inside;
      checks.push(row(5, 'a move inside the noise band is refused', pass, r, controlOf(r, G.drift),
        r.kept ? 'a move was kept' : 'no trial moved toward the bar by a positive amount inside the band', { inside: inside ? { value: inside.value, after: inside.after, towardRef: inside.towardRef, noise: inside.noise } : null }));
      if (inside) say('   the move: DRIFT ' + inside.value + ' read ' + inside.after + ', ' + inside.towardRef + ' toward the bar, inside the noise band ' + inside.noise);
    }
    if (CHECKS.includes(6)) {
      if (NO_MODEL) {
        say('');
        say('check 6 SKIPPED: --no-model');
      } else {
        const bud = makeBudget({ trials: 1, modelCalls: 1 });
        const r = await round('check 6: the real ' + AUTHOR_MODEL + ' asked ONCE (budget 1 call, wall ' + (bud.callWallMs / 1000) + ' s) on planted-tune',
          { ...common, gap: G.tune, operator: 'author', budget: bud });
        const c = bud.model.calls;
        const said = trialRows(r).find((x) => x.kind === 'trial') || null;
        const pass = c.length === 1 && c[0].model === AUTHOR_MODEL && c[0].ok && (!!r.kept || !!r.reason);
        checks.push(row(6, 'the real ' + AUTHOR_MODEL + ' is asked once and its diff judged or refused with the reason printed', pass, r, controlOf(r, G.tune),
          c.length !== 1 ? c.length + ' calls were made' : !c[0].ok ? 'the model did not answer: ' + c[0].reason : 'no decision',
          { calls: c, answer: said ? said.answer : null, modelPatch: said ? said.patch : null, modelReason: said ? said.reason : null }));
        for (const x of c) say('   model call: ' + x.model + ', ' + x.seconds + ' s, ok ' + x.ok + (x.reason ? ', ' + x.reason : '') + ', prompt ' + x.promptChars + ' chars');
        if (said && said.patch) say('   the model\'s diff:\n' + said.patch.split('\n').map((l) => '     | ' + l).join('\n'));
        else if (said && said.answer) say('   the model\'s answer (first 600 chars):\n' + String(said.answer).split('\n').map((l) => '     | ' + l).join('\n'));
      }
    }
  } finally {
    const del = deleteCopy(plant.dir);
    copies.push({ label: 'the plant', dir: plant.dir, mb: Math.round(plant.bytes / MB * 10) / 10, deleted: del.deleted, freeMbAfter: del.freeMb });
    say('');
    say('plant ' + (del.deleted ? 'deleted' : 'LEFT ON DISK') + ': ' + plant.dir + ', ' + del.freeMb + ' MB free after');
  }
  return checks;
}

// ------------------------------------------------------------------ REAL
/** The stand-in: one gap line from each of two verdicts, in the shape of state/self/gaps.jsonl. */
function standInGaps() {
  const m = JSON.parse(readFileSync(path.join(VERDICTS, 'math.json'), 'utf8'));
  const c = JSON.parse(readFileSync(path.join(VERDICTS, 'compress.json'), 'utf8'));
  const mathMs = Object.values(m.arms || {}).reduce((a, x) => a + (Number(x.meanMs) || 0) * (Number(x.n) || 0), 0);
  return [
    {
      id: 'standin-math', kind: 'standin', standIn: true, subsystem: 'math',
      measured: m.bar.clearance, bar: 0, unit: 'clearance: the k=5 interval lower edge minus the alone upper edge',
      distance: r2(0 - m.bar.clearance), verdictFile: 'bench/verdicts/math.json', benchCommand: m.command,
      trial: { command: m.command, minutes: r2(mathMs / 60000), minutesFrom: 'the sum of every arm\'s meanMs times n in bench/verdicts/math.json', needsModel: true, model: m.model && m.model.small, writes: ['bench/verdicts/math.json'] },
      files: ['reason/math.mjs'], since: m.at,
    },
    {
      id: 'standin-compress', kind: 'standin', standIn: true, subsystem: 'compress',
      measured: c.bar.measured, bar: c.bar.ratio, unit: 'times: the fall in checkpoint bytes per tick',
      distance: r2(c.bar.ratio - c.bar.measured), verdictFile: 'bench/verdicts/compress.json', benchCommand: c.command,
      trial: { command: c.command, minutes: r2(c.wallMs / 60000), minutesFrom: 'wallMs in bench/verdicts/compress.json', needsModel: false, writes: ['bench/verdicts/compress.json'] },
      files: ['core/checkpoint-delta.mjs'], since: c.at,
    },
  ];
}

function eligibility(g, i) {
  const why = [];
  const t = g && g.trial;
  if (!t || !t.command) why.push('no trial command');
  const needsModel = !!(t && t.needsModel);
  if (needsModel) why.push('its trial needs the model' + (t.model ? ' (' + t.model + ')' : ''));
  const minutes = t && t.minutes !== null && t.minutes !== undefined && Number.isFinite(Number(t.minutes)) ? Number(t.minutes) : null;
  if (minutes === null) why.push('its trial carries no minutes');
  else if (minutes > 5) why.push('its trial takes ' + minutes + ' min, over 5');
  if (g.bar === null || g.bar === undefined || !Number.isFinite(Number(g.bar))) why.push('no numeric bar');
  const allowed = allowedFiles(g, ROOT);
  let knobs = [];
  try { knobs = gapKnobs(g, ROOT); } catch (e) { why.push('its knobs could not be read: ' + e.message); }
  if (!allowed.files.length) why.push('no file of the gap passes the ceiling');
  else if (!knobs.length) why.push('0 knobs on ' + allowed.files.join(', '));
  return { i, id: g.id, ok: !why.length, why, minutes, needsModel, knobs: knobs.length, knobNames: knobs.slice(0, 8).map((k) => k.name), measured: g.measured ?? null, bar: g.bar ?? null, files: allowed.files };
}

function realRow(gap, operator, r) {
  const c = controlOf(r, gap);
  const out = {
    gap: gap.id, operator, kept: !!r.kept, before: r.before ?? null, after: r.after ?? null, noise: r.noise ?? null, closed: r.closed ?? null,
    reason: r.kept ? null : r.reason, decision: decisionText(r), control: c, patch: r.kept ? r.patch : null,
    author: r.kept ? (operator === 'author' ? 'organism (author, ' + AUTHOR_MODEL + ')' : 'organism (' + operator + ')') : null,
    trials: trialRows(r), seconds: r.wallSeconds, copy: r.copy || null,
  };
  say('real ' + gap.id + ' ' + operator + ': ' + out.decision);
  say('   ' + ctlText(c));
  return out;
}

async function real() {
  say('');
  say('REAL: the gaps ledger');
  let gaps, source, standIn = false;
  if (existsSync(GAPS_FILE)) {
    gaps = readGaps(GAPS_FILE);
    source = rel(GAPS_FILE) + ' (' + gaps.length + ' gap lines)';
    say('read ' + source);
  } else {
    gaps = standInGaps();
    standIn = true;
    mkdirSync(path.dirname(STANDIN_FILE), { recursive: true });
    writeFileSync(STANDIN_FILE, gaps.map((g) => JSON.stringify(g)).join('\n') + '\n');
    source = 'STAND-IN: ' + rel(GAPS_FILE) + ' is absent, so two gap lines were built from bench/verdicts/math.json and bench/verdicts/compress.json and written to ' + rel(STANDIN_FILE);
    say(source);
  }
  const rows = gaps.map((g, i) => eligibility(g, i));
  for (const x of rows) {
    say('  ' + x.id + ': ' + (x.ok ? 'ELIGIBLE' : 'not eligible: ' + x.why.join('; '))
      + ' [measured ' + x.measured + ', bar ' + x.bar + ', trial ' + x.minutes + ' min, needsModel ' + x.needsModel + ', knobs ' + x.knobs + (x.knobNames.length ? ' (' + x.knobNames.join(', ') + ')' : '') + ']');
  }
  const eligible = rows.filter((x) => x.ok).sort((a, b) => a.minutes - b.minutes || a.i - b.i);
  const picked = eligible.slice(0, 2);
  say('eligible ' + eligible.length + ' of ' + rows.length + '; picked ' + (picked.map((x) => x.id).join(', ') || 'none'));
  const rounds = [];
  for (const p of picked) {
    const gap = gaps[p.i];
    const files = allowedFiles(gap, ROOT).files;
    const h0 = hashFiles(ROOT, files).all;
    const rk = await round('real ' + gap.id + ': knob-tune (at most ' + TRIALS_PER_ROUND + ' trials)',
      { gap, operator: 'knob-tune', budget: makeBudget({ trials: TRIALS_PER_ROUND, modelCalls: 0 }) });
    rounds.push(realRow(gap, 'knob-tune', rk));
    if (NO_MODEL) say('real ' + gap.id + ': the author SKIPPED (--no-model)');
    else {
      const bud = makeBudget({ trials: 1, modelCalls: 1 });
      const ra = await round('real ' + gap.id + ': the author once (' + AUTHOR_MODEL + ', 1 call, wall ' + (bud.callWallMs / 1000) + ' s)',
        { gap, operator: 'author', budget: bud });
      rounds.push(realRow(gap, 'author', ra));
    }
    const h1 = hashFiles(ROOT, files).all;
    say('real tree: ' + files.join(', ') + (h0 === h1 ? ' byte identical before and after the rounds' : ' CHANGED during the rounds (sha256 ' + h0.slice(0, 12) + ' to ' + h1.slice(0, 12) + ')'));
    rounds[rounds.length - 1].treeIdentical = h0 === h1;
  }
  const printed = (x) => x.before !== null && x.noise !== null && (x.kept ? x.after !== null : !!x.reason);
  const completed = picked.length === 2 && rounds.length === picked.length * (NO_MODEL ? 1 : 2) && rounds.every(printed);
  const why = picked.length < 2
    ? 'only ' + eligible.length + ' of ' + rows.length + ' gaps are eligible (a model-free trial of at most 5 minutes and at least one knob): ' + rows.filter((x) => !x.ok).map((x) => x.id + ': ' + x.why.join('; ')).join(' | ')
    : !rounds.every(printed) ? 'a round ended without a before and a noise band: ' + rounds.filter((x) => !printed(x)).map((x) => x.gap + ' ' + x.operator + ': ' + x.reason).join(' | ')
      : null;
  return { source, standIn, gaps: rows.length, eligibility: rows, eligible: eligible.length, picked: picked.map((x) => x.id), rounds, completed, why };
}

// ------------------------------------------------------------------ main
async function main() {
  const t0 = Date.now();
  mkdirSync(TMP, { recursive: true });
  const command = 'node bench/operators.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
  say('OPERATORS (Board 14): ' + command);
  say('node ' + process.version + ', free RAM ' + Math.round(os.freemem() / MB) + ' MB, free disk under ' + TMP + ' ' + freeMb(TMP) + ' MB, records ' + rel(STATE) + '/' + today() + '.jsonl'
    + ', author ' + AUTHOR_MODEL + ' (' + MODEL_CALLS_PER_RUN + ' calls a run by default, ' + CALL_WALL_MS / 1000 + ' s wall each), ' + (PARTIAL ? 'PARTIAL run' : 'full run'));
  const plantedExisted = existsSync(path.join(ROOT, 'planted'));
  const checks = ONLY_REAL ? [] : await planted();
  const passed = checks.filter((c) => c.pass).length;
  const realPart = ONLY_PLANTED ? null : await real();
  const plantedAbsent = !plantedExisted && !existsSync(path.join(ROOT, 'planted'));

  // every copy made under TMP is gone
  let left = [];
  try { left = readdirSync(TMP).filter((n) => n.startsWith(COPY_PREFIX)); } catch { left = []; }
  const mbLeft = freeMb(TMP);
  const realCalls = calls.filter((c) => c.model === AUTHOR_MODEL);
  const barMet = !PARTIAL && passed === 6 && checks.length === 6 && !!(realPart && realPart.completed);
  const seconds = Math.round((Date.now() - t0) / 10) / 100;
  const kept = [
    ...checks.filter((c) => c.kept).map((c) => ({ where: 'planted check ' + c.n, author: 'organism (' + (c.n === 6 ? 'author, ' + AUTHOR_MODEL : c.n === 2 ? 'strategy-swap' : 'knob-tune') + ')', patch: c.patch, before: c.before, after: c.after, noise: c.noise, onRealTree: false })),
    ...((realPart && realPart.rounds) || []).filter((x) => x.kept).map((x) => ({ where: 'real ' + x.gap, author: x.author, patch: x.patch, before: x.before, after: x.after, noise: x.noise, onRealTree: false })),
  ];
  const statement = 'Planted ' + passed + ' of ' + checks.length + (checks.length === 6 ? '' : ' run (of 6)') + ': '
    + checks.map((c) => c.n + ' ' + (c.pass ? 'PASS' : 'FAIL') + ' (' + c.decision + '; ' + ctlText(c.control) + ')').join('; ')
    + '. REAL: ' + (realPart ? realPart.source + '; eligible ' + realPart.eligible + ' of ' + realPart.gaps + (realPart.picked.length ? ', picked ' + realPart.picked.join(', ') + ': ' + realPart.rounds.map((x) => x.gap + ' ' + x.operator + ' ' + x.decision).join('; ') : '') + (realPart.completed ? '; the real set completed' : '; the real set did NOT complete: ' + realPart.why) : 'not run')
    + '. Model calls to ' + AUTHOR_MODEL + ': ' + realCalls.length + (realCalls.length ? ' (' + realCalls.map((c) => c.seconds + ' s ' + (c.ok ? 'answered' : 'no answer: ' + c.reason)).join(', ') + ')' : '')
    + '. Copies: ' + copies.length + ' made, ' + copies.filter((c) => c.deleted).length + ' deleted, ' + left.length + ' left under ' + TMP + ', ' + mbLeft + ' MB free after'
    + '. Bar ' + (barMet ? 'MET' : 'NOT MET') + ': planted 6 of 6 and the real set completing with every number printed.';

  const verdict = {
    name: 'operators', board: 14, item: 'operators',
    at: new Date().toISOString(), command, node: process.version,
    isTheBar: !PARTIAL, barMet,
    split: {
      planted: { passed, of: 6, ran: checks.length, checks },
      real: realPart,
    },
    statement,
    control: 'every claim: the unpatched trial run twice on the same copy (or today\'s baseline for the same command and file bytes), with the noise band beside it',
    modelCalls: { n: realCalls.length, model: AUTHOR_MODEL, calls: realCalls, fixtureCalls: calls.length - realCalls.length },
    kept,
    copies: { made: copies.length, deleted: copies.filter((c) => c.deleted).length, leftUnderTmp: left, freeMbAfter: mbLeft, tmp: TMP, list: copies },
    realTree: { plantedDirAbsent: plantedAbsent, realGapFilesIdentical: realPart ? realPart.rounds.every((x) => x.treeIdentical !== false) : null },
    peakRssMb: Math.round(peak),
    seconds,
  };
  mkdirSync(VERDICTS, { recursive: true });
  const vf = path.join(VERDICTS, PARTIAL ? 'operators-partial.json' : 'operators.json');
  writeFileSync(vf, JSON.stringify(verdict, null, 1) + '\n');
  say('');
  say('planted ' + passed + ' of ' + checks.length + ': ' + checks.map((c) => c.n + ' ' + (c.pass ? 'PASS' : 'FAIL')).join(', '));
  if (realPart) say('real: eligible ' + realPart.eligible + ' of ' + realPart.gaps + ', ' + (realPart.completed ? 'completed' : 'NOT completed: ' + realPart.why));
  say('model calls to ' + AUTHOR_MODEL + ': ' + realCalls.length + (realCalls.length ? ' (' + realCalls.map((c) => c.seconds + ' s').join(', ') + ')' : ''));
  say('copies: ' + copies.length + ' made, ' + copies.filter((c) => c.deleted).length + ' deleted, ' + left.length + ' left under ' + TMP + '; ' + mbLeft + ' MB free after');
  say('real tree: planted/ ' + (plantedAbsent ? 'absent before and after' : 'PRESENT') + (realPart && realPart.rounds.length ? ', the real gaps\' files ' + (verdict.realTree.realGapFilesIdentical ? 'byte identical' : 'CHANGED') : ''));
  say('peak RSS seen by this bench ' + Math.round(peak) + ' MB (its own process, trials, touched tests, gates); ' + seconds + ' s');
  say('OPERATORS BAR ' + (barMet ? 'MET' : 'NOT MET') + (PARTIAL ? ' (PARTIAL run: isTheBar false)' : '') + ': planted ' + passed + '/6, real ' + (realPart ? (realPart.completed ? 'completed' : 'not completed') : 'not run') + '; verdict ' + rel(vf));
  process.exitCode = barMet ? 0 : 2;
}

main().catch((e) => { console.error('bench/operators.mjs broke: ' + ((e && e.stack) || e)); process.exitCode = 1; });
