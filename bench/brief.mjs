// bench/brief.mjs: THE BRIEF BAR (Board 15, item brief).
//
// His order (2026-09-25): "Needs to be fronteir level in microseconds. And self improving. Without
// your build." The brief operator (self/brief.mjs) finishes a board item with no orchestrator: the
// organism's ask() chain first (the direct table, the exact grammar, the code region), the model
// cell (qwen3:30b-a3b through Ollama, open weights, localhost only) last.
//
//   0. GATE BASE the gate on a copy made exactly as a brief makes its copy, with no item written: the
//                CONTROL for the gate wall. When it is RED, no item can be KEPT on this tree (KEPT
//                needs a GREEN gate), so the run is PARTIAL (brief-partial.json, isTheBar false) and
//                each run's gate is compared with it: the red files an item ADDS.
//   1. PLANTED   the planted board item of test/brief-plant.mjs (the real board grammar), attempted
//                end to end with the real model on a copy of this tree: every step, its provenance,
//                its ns, us or seconds, the model calls and their seconds, KEPT or the wall. The
//                direct table starts EMPTY (a fresh file under --tmp).
//   2. REPLAY    the same brief again on a fresh copy with the table the first run learned: the
//                library-learning claim. Its CONTROL is 3.
//   3. CONTROL   the same brief with the table OFF and 0 model calls: the chain falls back to the
//                grammar for the plan and stops at the budget wall at the first file.
//   4. MICRO     the PLAN ask 1000 times through ask() on the learned table (ns per lookup, us per
//                ask, median, p99, min, max), against two controls: ask() with the table off (the
//                miss path) and the grammar itself (the exact method the table replaced).
//   5. REAL      the smallest undone model-off item of board 13 by owned file count, once, with
//                --model-calls and --wall, on a copy: a verdict or a wall, every step printed.
//
// For 1, 2 and 5 the PROVENANCE SHARE and the mean latency per class are printed. The real tree is
// checked before and after (the planted files absent, the real item's owned files byte-identical).
// BAR (bench/verdicts/brief.json, isTheBar true): met when the planted item is KEPT and the real
// attempt ran to a wall or a verdict with every step and its provenance printed. A real attempt that
// stops at a wall also writes bench/verdicts/brief-real-partial.json (isTheBar false). A run cut
// short (--planted-only, or no model) writes bench/verdicts/brief-partial.json (isTheBar false).
// The learned table is saved as state/self/brief/direct.bin, the brief's library.
//
//   node tools/budget.mjs --ram-mb 6000 --disk-mb 8000 --dir <tmp> -- node --max-old-space-size=6000 bench/brief.mjs --tmp <tmp>
//        [--model-calls 40] [--wall 60] [--planted-only]
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import {
  runBrief, parseBoardText, gapOf, planPrompt, grammarPlan, smallestUndone, loadTable, provenanceShare, shareLines,
  directFileOf, gateBaseline, BRIEF_AUTHOR, MODEL_CALLS, WALL_MINUTES,
} from '../self/brief.mjs';
import { ask } from '../act/prompt.mjs';
import { AUTHOR_MODEL, AUTHOR_BASE } from '../self/autopilot.mjs';
import { freeMb } from '../self/improve.mjs';
import { PLANTED_BOARD } from '../test/brief-plant.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const argv = process.argv.slice(2);
const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const TMP = path.resolve(val('--tmp', path.join(os.tmpdir(), 'brain-brief-run')));
const MODEL_CALLS_ARG = Number(val('--model-calls', String(MODEL_CALLS)));
const WALL_ARG = Number(val('--wall', String(WALL_MINUTES)));
const PLANTED_ONLY = argv.includes('--planted-only');
const COMMAND = 'node bench/brief.mjs' + (argv.length ? ' ' + argv.join(' ') : '');
const r2 = (x) => Math.round(x * 100) / 100;
const say = (l) => console.log(l);
const sha = (f) => (existsSync(f) ? createHash('sha256').update(readFileSync(f)).digest('hex') : null);
let peakRssMb = 0;
const notePeak = (mb) => { if (Number.isFinite(mb) && mb > peakRssMb) peakRssMb = mb; };
const selfRss = () => notePeak(Math.round(process.memoryUsage().rss / 1048576));

function quantiles(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  return { n: s.length, min: r2(s[0]), median: r2(q(0.5)), p25: r2(q(0.25)), p75: r2(q(0.75)), p99: r2(q(0.99)), max: r2(s[s.length - 1]) };
}
const qLine = (name, unit, q) => '    ' + name.padEnd(34) + ' n ' + q.n + ', median ' + q.median + ' ' + unit + ', p25 ' + q.p25 + ', p75 ' + q.p75 + ', p99 ' + q.p99 + ', min ' + q.min + ', max ' + q.max;

/** One run's summary for the verdict: the steps without their texts, the share, the calls. */
function summary(r) {
  return {
    runId: r.runId, gap: r.gap, kept: r.kept, wall: r.wall, reason: r.reason, modelCalls: r.modelCalls, modelSeconds: r.modelSeconds, seconds: r.seconds,
    learned: r.learned, gateDelta: r.gateDelta, share: r.share, verdict: r.verdict ? { isTheBar: r.verdict.isTheBar, barMet: r.verdict.barMet, statement: r.verdict.statement ?? null } : null,
    patchSet: r.patchSet ? { author: r.patchSet.author, files: r.patchSet.files.map(({ content, ...f }) => f) } : null,
    copy: r.copy ? { files: r.copy.files, bytes: r.copy.bytes, deleted: r.copy.deleted, freeMb: r.copy.freeMb } : null,
    calls: r.calls,
    steps: r.steps.map(({ value, text, key, ...s }) => s),
  };
}
const runPeak = (r) => { for (const s of r.steps) if (s.kind === 'run') notePeak(s.peakRssMb); };
const everyStepPrinted = (r) => r.steps.length > 0 && r.steps.every((s) => (s.kind === 'ask' ? (s.ok ? !!s.provenance : !!s.reason) : typeof s.ok === 'boolean'));

async function ollamaHas(model) {
  try {
    const res = await fetch(AUTHOR_BASE.replace(/\/$/, '') + '/api/tags', { signal: AbortSignal.timeout(3000) });
    const j = await res.json();
    return { up: true, has: (j.models || []).some((m) => m.name === model), names: (j.models || []).map((m) => m.name) };
  } catch (e) { return { up: false, has: false, names: [], reason: String(e.message || e).split('\n')[0] }; }
}

async function main() {
  const at = new Date().toISOString();
  mkdirSync(TMP, { recursive: true });
  say('BRIEF BAR (Board 15, item brief): ' + COMMAND);
  say('  node ' + process.version + ', at ' + at + ', temp ' + TMP + ', ' + freeMb(TMP) + ' MB free there, ' + Math.round(os.freemem() / 1048576) + ' MB RAM free');
  if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(AUTHOR_BASE)) throw new Error('the model base is not localhost: ' + AUTHOR_BASE);
  const oh = await ollamaHas(AUTHOR_MODEL);
  say('  model cell: ' + AUTHOR_MODEL + ' at ' + AUTHOR_BASE + ': ' + (oh.up ? (oh.has ? 'present' : 'ABSENT (have ' + oh.names.join(', ') + ')') : 'Ollama not answering (' + oh.reason + ')'));

  // the planted item, read in the real board grammar
  const pb = parseBoardText(PLANTED_BOARD, { file: 'test/brief-plant.mjs PLANTED_BOARD' });
  const gapP = gapOf(pb.items[0], 'planted');
  say('  planted item ' + gapP.id + ': ' + gapP.files.length + ' owned files, verdict ' + gapP.verdictFile + ', parse errors ' + pb.errors.length);
  const plantedAbs = gapP.files.map((f) => path.join(ROOT, ...f.split('/')));
  const plantedBefore = plantedAbs.filter((f) => existsSync(f)).length;
  const directFile = path.join(TMP, 'direct.bin');
  rmSync(directFile, { force: true });

  say('\n0. GATE BASE, the gate on a copy of this tree with no item written (the control for the gate wall)');
  const base = await gateBaseline({ root: ROOT, tmpRoot: TMP, gateKit: true, pin: false, ramMb: 6000, waitFreeRamMb: 16384 });
  notePeak(base.peakRssMb);
  say('    ' + (base.summary || 'no GATE line (exit ' + base.exit + ', ' + base.outcome + ')'));
  say('    base gate ' + (base.green ? 'GREEN' : 'RED') + ' in ' + base.seconds + ' s on ' + base.copyFiles + ' files' + (base.red.length ? '; red without any item: ' + base.red.join(', ') : '') + '; copy deleted: ' + base.deleted);
  const partial = PLANTED_ONLY || !oh.has || !base.green;
  const partialWhy = PLANTED_ONLY ? '--planted-only' : !oh.has ? 'the model cell is absent' : !base.green ? 'the base gate is RED on ' + base.red.length + ' file(s) no item wrote, so no item can be KEPT on this tree' : null;
  const common = { root: ROOT, stateRoot: ROOT, tmpRoot: TMP, directFile, wallMinutes: WALL_ARG, pin: false, gateKit: true, waitFreeRamMb: 16384, ramMb: 6000, log: say, gateBase: base };

  say('\n1. PLANTED, the real model, a fresh direct table');
  const planted = await runBrief(gapP, { ...common, modelCalls: MODEL_CALLS_ARG, runId: 'bench-planted-' + at.replace(/[-:.]/g, '') });
  runPeak(planted); selfRss();

  say('\n2. PLANTED REPLAY, the table the first run learned');
  const replay = await runBrief(gapP, { ...common, modelCalls: MODEL_CALLS_ARG, runId: 'bench-replay-' + at.replace(/[-:.]/g, '') });
  runPeak(replay); selfRss();

  say('\n3. CONTROL, the same brief with the table off and 0 model calls');
  const control = await runBrief(gapP, { ...common, direct: false, modelCalls: 0, runId: 'bench-control-' + at.replace(/[-:.]/g, '') });
  runPeak(control); selfRss();

  say('\n4. MICRO, the PLAN ask through ask(), 1000 times on the learned table, and its controls');
  const lib = loadTable(directFile);
  const pp = planPrompt(gapP);
  const opts = { provider: 'null', direct: lib.table, knowledge: false, regions: false, spawn: false };
  for (let i = 0; i < 50; i++) await ask(null, pp, opts);
  const askUs = [], lookupNs = [], hits = [];
  for (let i = 0; i < 1000; i++) {
    const t0 = process.hrtime.bigint();
    const a = await ask(null, pp, opts);
    askUs.push(Number(process.hrtime.bigint() - t0) / 1000);
    lookupNs.push(a.direct ? a.direct.lookupNs : NaN);
    hits.push(a.provenance && a.provenance.answer === 'direct');
  }
  const offOpts = { ...opts, direct: false };
  for (let i = 0; i < 20; i++) await ask(null, pp, offOpts);
  const offUs = [], offProv = new Set();
  for (let i = 0; i < 200; i++) { const t0 = process.hrtime.bigint(); const a = await ask(null, pp, offOpts); offUs.push(Number(process.hrtime.bigint() - t0) / 1000); offProv.add(a.provenance ? a.provenance.answer : 'none'); }
  for (let i = 0; i < 50; i++) grammarPlan(gapP, ROOT);
  const gramUs = [];
  for (let i = 0; i < 1000; i++) { const t0 = process.hrtime.bigint(); grammarPlan(gapP, ROOT); gramUs.push(Number(process.hrtime.bigint() - t0) / 1000); }
  const micro = {
    table: { entries: lib.table.n, loaded: lib.loaded }, hits: hits.filter(Boolean).length, of: hits.length,
    lookupNs: quantiles(lookupNs.filter(Number.isFinite)), askUs: quantiles(askUs), tableOffAskUs: quantiles(offUs), tableOffProvenance: [...offProv], grammarUs: quantiles(gramUs),
  };
  say('    the table holds ' + micro.table.entries + ' entries; the plan ask hit it ' + micro.hits + ' of ' + micro.of + ' times');
  say(qLine('direct lookup (one probe)', 'ns', micro.lookupNs));
  say(qLine('ask() on the table (the whole call)', 'us', micro.askUs));
  say(qLine('CONTROL ask() with the table off', 'us', micro.tableOffAskUs) + ' (provenance ' + micro.tableOffProvenance.join(', ') + ', no plan in the answer)');
  say(qLine('CONTROL the grammar (the exact method)', 'us', micro.grammarUs));
  selfRss();

  let real = null, pick = null, realSource = null, realOwnedBefore = null, realOwnedAfter = null;
  if (!PLANTED_ONLY) {
    say('\n5. REAL, the smallest undone model-off item of board 13, once');
    const s = smallestUndone({ root: ROOT, board: 13, modelOff: true });
    realSource = s.source;
    say('    items from ' + s.source + ':');
    for (const row of s.rows) say('      ' + row.g.id + ': ' + row.g.files.length + ' owned, ' + (row.g.needsModel ? 'model' : 'model-off') + ', ' + (row.done ? 'done' : 'undone'));
    pick = s.pick;
    if (!pick) say('    no undone model-off item: nothing to attempt');
    else {
      say('    picked ' + pick.id + ' (' + pick.files.length + ' owned files, the fewest among ' + s.undone.length + ' undone model-off items)');
      realOwnedBefore = Object.fromEntries(pick.files.map((f) => [f, sha(path.join(ROOT, ...f.split('/')))]));
      real = await runBrief(pick, { ...common, modelCalls: MODEL_CALLS_ARG, runId: 'bench-real-' + at.replace(/[-:.]/g, '') });
      runPeak(real); selfRss();
      realOwnedAfter = Object.fromEntries(pick.files.map((f) => [f, sha(path.join(ROOT, ...f.split('/')))]));
    }
  }

  // the real tree, checked
  const plantedAfter = plantedAbs.filter((f) => existsSync(f)).length;
  const realSame = realOwnedBefore ? Object.keys(realOwnedBefore).filter((f) => realOwnedBefore[f] === realOwnedAfter[f]).length : null;
  say('\nTHE REAL TREE: planted files present before ' + plantedBefore + ', after ' + plantedAfter + (realOwnedBefore ? '; the real item\'s owned files byte-identical after the run: ' + realSame + ' of ' + Object.keys(realOwnedBefore).length : ''));

  // the library: the learned table becomes the brief's own
  const libOut = directFileOf(ROOT);
  let saved = null;
  if (lib.table.n > 0) { mkdirSync(path.dirname(libOut), { recursive: true }); lib.table.save(libOut); saved = path.relative(ROOT, libOut).replaceAll('\\', '/'); }
  say('THE LIBRARY: ' + lib.table.n + ' learned answers saved to ' + (saved || 'nothing (the table is empty)'));

  // the summary
  say('\nSUMMARY');
  const line = (name, r) => say('  ' + name.padEnd(9) + (r.kept ? 'KEPT' : 'REFUSED at the ' + r.wall + ' wall') + ', ' + r.modelCalls + ' model call(s), ' + r.modelSeconds + ' s of model, ' + r.seconds + ' s in all, ' + r.steps.length + ' steps printed, ' + r.learned + ' learned' + (r.gateDelta ? '; gate against the base: ' + r.gateDelta.newRed.length + ' new red file(s)' + (r.gateDelta.newRed.length ? ' (' + r.gateDelta.newRed.join(', ') + ')' : '') : ''));
  say('  gate base ' + (base.green ? 'GREEN' : 'RED on ' + base.red.length + ' file(s)') + ' (' + base.seconds + ' s)');
  line('planted', planted); for (const l of shareLines(planted.share)) say('  ' + l);
  line('replay', replay); for (const l of shareLines(replay.share)) say('  ' + l);
  line('control', control); say('    control plan step: ' + (control.steps[0] ? control.steps[0].provenance : 'none') + '; stopped: ' + control.reason);
  if (real) { line('real', real); for (const l of shareLines(real.share)) say('  ' + l); }
  const totalCalls = planted.modelCalls + replay.modelCalls + control.modelCalls + (real ? real.modelCalls : 0);
  const realOk = !!real && (real.wall !== null || !!real.verdict) && everyStepPrinted(real);
  const barMet = planted.kept === true && realOk;
  say('  model calls in all: ' + totalCalls + '; peak RSS of any child or this process: ' + peakRssMb + ' MB');

  const split = {
    planted: { item: gapP.id, from: 'test/brief-plant.mjs PLANTED_BOARD', seenInDevelopment: true, why: 'the item was written for this bench and run with a mocked author in test/brief.test.mjs and once with the real model on a fixture tree while the operator was built' },
    real: pick ? { item: pick.id, from: realSource, seenInDevelopment: false, why: 'picked by rule (the fewest owned files among undone model-off board-13 items) and attempted once, here' } : null,
    contaminated: true,
  };
  const statement = 'planted ' + gapP.id + ': ' + (planted.kept ? 'KEPT' : 'refused at the ' + planted.wall + ' wall') + ' with ' + planted.modelCalls + ' model call(s) (' + planted.modelSeconds + ' s), organism share ' + planted.share.share +
    '; replay: ' + (replay.kept ? 'KEPT' : 'refused at the ' + replay.wall + ' wall') + ' with ' + replay.modelCalls + ' model call(s), organism share ' + replay.share.share +
    '; control (table off, 0 calls): refused at the ' + control.wall + ' wall; plan ask on the table: median ' + micro.askUs.median + ' us (lookup ' + micro.lookupNs.median + ' ns) against ' + micro.tableOffAskUs.median + ' us with the table off' +
    (real ? '; real ' + real.gap + ': ' + (real.kept ? 'KEPT' : 'refused at the ' + real.wall + ' wall') + ' after ' + real.modelCalls + ' model call(s), ' + real.steps.length + ' steps printed' : '; real: not attempted') +
    '; base gate (no item) ' + (base.green ? 'GREEN' : 'RED on ' + base.red.join(', ')) +
    '. The planted item was seen in development (contaminated, labelled here); the real item was not.' + (partialWhy ? ' PARTIAL: ' + partialWhy + '.' : '');
  const verdict = {
    at, command: COMMAND, node: process.version, isTheBar: !partial, barMet: partial ? false : barMet, split, statement,
    author: BRIEF_AUTHOR, model: AUTHOR_MODEL, modelCalls: totalCalls, peakRssMb,
    partialWhy, gateBase: { green: base.green, red: base.red, summary: base.summary, seconds: base.seconds, peakRssMb: base.peakRssMb, emDash: base.emDash, badImports: base.badImports },
    planted: summary(planted), replay: summary(replay), control: summary(control), micro, real: real ? summary(real) : null,
    realTree: { plantedBefore, plantedAfter, realOwnedSame: realSame, realOwnedOf: realOwnedBefore ? Object.keys(realOwnedBefore).length : null },
    library: { entries: lib.table.n, file: saved },
  };
  const vdir = path.join(ROOT, 'bench', 'verdicts');
  mkdirSync(vdir, { recursive: true });
  const vf = path.join(vdir, partial ? 'brief-partial.json' : 'brief.json');
  writeFileSync(vf, JSON.stringify(verdict, null, 2) + '\n');
  if (real && !real.kept) {
    const rp = { at, command: COMMAND, node: process.version, isTheBar: false, barMet: false, split: { real: split.real, contaminated: false }, statement: 'the real attempt at ' + real.gap + ' was bounded: refused at the ' + real.wall + ' wall (' + real.reason + ') after ' + real.modelCalls + ' model call(s) and ' + real.seconds + ' s', real: summary(real) };
    writeFileSync(path.join(vdir, 'brief-real-partial.json'), JSON.stringify(rp, null, 2) + '\n');
    say('  the bounded real attempt: bench/verdicts/brief-real-partial.json (isTheBar false)');
  }
  say('\nBRIEF BAR ' + (partial ? 'PARTIAL (isTheBar false: ' + partialWhy + ')' : barMet ? 'MET' : 'NOT MET') + ': planted ' + (planted.kept ? 'KEPT' : 'not kept') + ', real ' + (real ? (realOk ? 'ran to ' + (real.kept ? 'a verdict' : 'the ' + real.wall + ' wall') + ' with every step printed' : 'did not run to a wall with every step printed') : 'not attempted') + '; verdict ' + path.relative(ROOT, vf).replaceAll('\\', '/'));
  say('  ' + freeMb(TMP) + ' MB free on the temp drive after the copies were deleted');
}

await main();
