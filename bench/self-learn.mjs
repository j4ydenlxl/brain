// bench/self-learn.mjs: THE SELF-LEARN BAR (board 35 builder, item self-learn). Does the organism, with the model off,
// learn from its own mistakes something that answers rows it has never seen?
//
//   node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir <scratch> -- node --max-old-space-size=4000 bench/self-learn.mjs
//
// Stage 1, written before the learner (--write-heldout, refuses to overwrite): bench/verdicts/self-learn-heldout.jsonl,
// 60 rows of the GSM8K train split (bench/fixtures/public/gsm8k/train.jsonl) drawn by a seeded shuffle of every train id.
// The learner (self/learn.mjs) reads that list for its ids only and never opens those records (its spy counts them).
//
// The bar, in order, MODEL OFF (sockets and fetch refused and counted from the first line):
//   (a) LEARN: self/learn.mjs learn() (not dry) writes bench/verdicts/learned-programs.json; the support gate prints every
//       support it tried (the rule on one half of the development rows, asked on the other: learned right and wrong) and
//       the support the rule keeps with (none when no support is validated); every kept program is printed
//       with its level, pattern, the rows it fits, the rows it was induced from and its lesson; the retractions (kept
//       entries' question forms that answered a development row wrong) with their wrong and right rows. THE RECOUNT:
//       every learned entry read back from the file and run here over a fresh read of the development rows (parsed by
//       this bench, not by the learner's judge): the rows of its pattern it contradicts must be 0, and it must fit at
//       least the store's minSupport rows of its lesson (the gate's support + 1, 3 or more).
//   (b) THE MERGED ARM: the 60 held-out rows asked through act/prompt.mjs ask() (provider 'null', a fresh seeds/basic
//       brain, the question and "Answer with the final number."), opts.programs the merged object: the kept store
//       bench/verdicts/induce-programs.json with its retracted forms removed and the learned store read back from disk
//       appended (self/learn.mjs mergeStores). answered, correct, wrong, refused; every wrong row.
//   (b2) THE PRODUCTION LOADER, printed and not graded: the same rows with no opts.programs, so act/prompt.mjs loads the
//       default store and applies the learned file itself: since board 36 (item learn) it removes the retracted forms
//       from the kept entries as mergeStores does, and it loads only the learned entries its own devRows check passes
//       (the PROGRAM_TIER counters are printed, retracted and retractUnapplied among them).
//   (c) THE CONTROL: the same rows, the kept store alone. It can fail: it answers rows wrong (its wrong count is printed).
//   (d) THE LEDGER AND THE TEST POPULATION: the 130 GSM8K rows of bench/verdicts/mistakes-ledger.jsonl and every other
//       GSM8K test record outside the 200 development ids (bench/fixtures/public/gsm8k/test.jsonl, read here only, after
//       the learner ran), asked both ways, once each, graded once per bar run and never iterated on: the ledger's
//       development rows, the ledger's test rows, and the test population (every test record outside the 200), with
//       every row a learned program answered wrong.
//   (e) THE CROSS-VALIDATION, development rows only: the learner's steps (the support gate run inside the half) on one
//       half, graded on the other, both ways,
//       and the ceiling of any selection rule over role-pattern programs (self/learn.mjs crossValidate).
//   tests: node --test test/self-learn.test.mjs, pass and fail counted.
// BAR MET when the merged held-out correct is at least the control's + 8, the merged held-out wrong is 0, the tests
// pass, no socket was opened, no held-out record was opened, the recount finds 0 contradicted rows and no entry under
// the rule, a learned program answers 0 development rows wrong in the cross-validation (e), and 0 rows of the test
// population wrong (d). The verdict: bench/verdicts/self-learn.json.
// --iterate runs (a), (b), (b2), (c) and (e) only, grades no ledger row and writes no verdict: the edit and re-run loop.
//   (f) THE CEILING BY CAUSE (board 36, item learn-2), development rows only: a row is reachable when a program another
//       development row of its role pattern offers gives its gold (self/learn.mjs ceilingByCause); every other row is filed
//       under the first of five causes that holds (self/learn.mjs CAUSES: (1) a word quantity, (2) the worked chain is longer
//       than MAX_OPS, (3) a number of the chain comes from the text, (4) the pattern, (5) other). Printed before (the search's
//       programs only) and after (with the straight-line programs read from the worked chains, self/learn.mjs CHAIN), with
//       crossValidate's two-fold ceiling both ways and the support gate's table both ways (the gate before runs with the
//       chain programs off). The verdict carries the tables.
// --ceiling prints (f)'s two cause tables only and writes nothing.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { RNG } from '../core/rng.mjs';
import { opOf } from '../self/mistakes.mjs';
import { goldOf } from '../reason/induce.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
export const TRAIN = 'bench/fixtures/public/gsm8k/train.jsonl';
export const HELDOUT = 'bench/verdicts/self-learn-heldout.jsonl';
export const HELDOUT_SEED = 'self-learn/heldout/1';
export const HELDOUT_N = 60;
export const VERDICT = 'bench/verdicts/self-learn.json';
export const COMMAND = 'node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir state/board36/learn-2 --record state/board36/learn-2/budget-self-learn.json -- node --max-old-space-size=4000 bench/self-learn.mjs';
export const BAR = Object.freeze({ gain: 8, wrong: 0 });
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

/** The held-out rows: HELDOUT_N train ids by a seeded shuffle of every train id, in file order. Refuses to overwrite. */
export function writeHeldout({ root = ROOT, force = false } = {}) {
  const out = path.join(root, HELDOUT);
  if (fs.existsSync(out) && !force) throw new Error(HELDOUT + ' exists: the held-out set is written once, before the learner');
  const lines = fs.readFileSync(path.join(root, TRAIN), 'utf8').split(/\r?\n/);
  const ids = [];
  for (let i = 0; i < lines.length; i++) if (lines[i].trim()) ids.push(i);
  const pool = new RNG(HELDOUT_SEED).shuffle([...ids]);
  const chosen = pool.slice(0, HELDOUT_N);
  const draw = new Map(chosen.map((i, k) => [i, k]));
  const rows = chosen.slice().sort((a, b) => a - b).map((i) => {
    const r = JSON.parse(lines[i]);
    const o = opOf(r.question);
    return { id: 'gsm8k-train.' + i, source: 'gsm8k-train', file: TRAIN, line: i + 1, questionSha256: sha(r.question), shape: o ? o.op : 'unshaped', seed: HELDOUT_SEED, draw: draw.get(i) };
  });
  fs.writeFileSync(out, rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
  return { file: HELDOUT, rows: rows.length, of: ids.length, idsSha256: sha(rows.map((r) => r.id).join('\n')) };
}

/** The held-out rows read back: each train line by its number, its question checked against the sha256 written first. */
export function readHeldout(root = ROOT) {
  const list = fs.readFileSync(path.join(root, HELDOUT), 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
  const lines = fs.readFileSync(path.join(root, TRAIN), 'utf8').split(/\r?\n/);
  const rows = list.map((h) => {
    const r = JSON.parse(lines[h.line - 1]);
    if (sha(r.question) !== h.questionSha256) throw new Error(h.id + ': the train line no longer holds the question the held-out list hashed');
    return { id: h.id, question: r.question, gold: goldOf(r), lesson: h.shape };
  });
  return { rows, idsSha256: sha(list.map((h) => h.id).join('\n')), seed: list[0] ? list[0].seed : null };
}

// ---------------------------------------------------------------- the ceiling by cause (board 36, item learn-2)
/** One cause table as a printed line and an object (the verdict's). */
export function ceilingLine(L, tag, t, two) {
  const sum = Object.values(t.causes).reduce((a, b) => a + b, 0);
  const line = 'SELF-LEARN (f) ceiling by cause ' + tag + ': development rows ' + t.rows + ', reachable ' + t.reachable + ', unreachable ' + t.unreachable + ': ' + L.CAUSES.map((c) => '(' + c.k + ') ' + c.name + ' ' + t.causes[c.k] + (c.k === 4 ? ' (the parse reads a quantity the chain never uses ' + t.pattern.notWhole + ', more leaves than the window ' + t.pattern.window + ', own role form ' + t.pattern.ownForm + ', shared role form ' + t.pattern.sharedForm + ')' : '')).join(', ') + '; sum ' + sum + ' (equals unreachable: ' + (sum === t.unreachable) + '); two-fold ceiling (crossValidate\'s ruler) ' + two + '; ' + t.ms + ' ms';
  const largest = L.CAUSES.map((c) => ({ k: c.k, name: c.name, rows: t.causes[c.k] })).sort((a, b) => b.rows - a.rows || a.k - b.k)[0];
  const examples = {};
  for (const c of L.CAUSES) examples[c.k] = t.ids[c.k].slice(0, 3);
  return { line, table: { chain: t.chain, rows: t.rows, reachable: t.reachable, unreachable: t.unreachable, causes: t.causes, pattern: t.pattern, sum, sumEqualsUnreachable: sum === t.unreachable, twoFold: two, largest, examples, ms: t.ms } };
}
/** (f) both ways over the development rows. */
export function ceilings(L, rows) {
  const before = ceilingLine(L, 'before (the search programs only, at most 4 operations)', L.ceilingByCause(rows, { chain: false }), L.ceilingTwoFold(rows, { chain: false }));
  const after = ceilingLine(L, 'after (with the straight-line programs read from the worked chains, at most ' + L.CHAIN.maxOps + ' operations)', L.ceilingByCause(rows, { chain: true }), L.ceilingTwoFold(rows, { chain: true }));
  return { before, after };
}
async function ceilingOnly() {
  guardSockets();
  const L = await import('../self/learn.mjs');
  const c = L.collect({ root: ROOT });
  console.log('SELF-LEARN --ceiling: development rows ' + c.rows.length + ', held-out records opened ' + c.opened.heldOut + ', test records outside the 200 opened ' + c.opened.test);
  const { before, after } = ceilings(L, c.rows);
  console.log(before.line);
  console.log(after.line);
  console.log('SELF-LEARN --ceiling: sockets ' + (SOCKETS.connect + SOCKETS.fetch + L.socketAttempts()) + '; nothing written');
}

// ---------------------------------------------------------------- the model-off guard, before any organism import
const SOCKETS = { connect: 0, fetch: 0 };
function guardSockets() {
  net.Socket.prototype.connect = function refused() { SOCKETS.connect++; throw new Error('bench/self-learn.mjs runs model off: a socket was refused'); };
  globalThis.fetch = async () => { SOCKETS.fetch++; throw new Error('bench/self-learn.mjs runs model off: a fetch was refused'); };
}

async function main() {
  guardSockets();
  const iterate = process.argv.includes('--iterate');
  const t0 = Date.now();
  const at = new Date().toISOString();
  const printed = [];
  const out = (s) => { printed.push(s); console.log(s); };
  const L = await import('../self/learn.mjs');
  const I = await import('../reason/induce.mjs');
  const P = await import(pathToFileURL(path.join(ROOT, 'act/prompt.mjs')).href);
  const kept = JSON.parse(fs.readFileSync(path.join(ROOT, L.FILES.kept), 'utf8'));
  if (iterate) out('SELF-LEARN --iterate: (a), (b), (b2), (c) and (e) only; the ledger (d) is not graded and no verdict is written');

  // (a) learn
  const r = await L.learn({ at, log: (s) => out('SELF-LEARN (a) ' + s) });
  const stored = JSON.parse(fs.readFileSync(path.join(ROOT, L.FILES.learned), 'utf8'));
  const entries = [];
  for (const lv of Object.keys(stored.levels)) for (const [pat, list] of Object.entries(stored.levels[lv])) for (const e of list) entries.push({ lv, pat, e });
  out(`SELF-LEARN (a) kept ${r.programs} distinct programs in ${entries.length} entries under ${r.patterns} patterns; induced from ${r.inducedFrom} development rows; by level ${Object.entries(r.byLevel).map(([k, v]) => k + ' ' + v).join(', ') || 'none'}; by lesson ${Object.entries(r.byLesson).map(([k, v]) => k + ' ' + v).join(', ') || 'none'}`);
  for (const { lv, pat, e } of entries) out(`SELF-LEARN (a)   ${lv} ${pat} ${e.program} fits ${e.support} (lesson ${e.learned.fitsLesson}) induced from ${e.learned.inducedFrom.length} lesson ${e.learned.lesson} forms ${(e.forms && e.forms.roles.length) || 0}`);
  const retract = stored.retract || [];
  out(`SELF-LEARN (a) retracted ${r.retracted.forms} question forms of ${r.retracted.entries} kept entries on ${r.retracted.wrongRows} wrong development answers (cost ${r.retracted.rightRows} right answers in those forms); merged: ${r.mergedCounts.retracted} forms removed, ${r.mergedCounts.unapplied} unapplied`);
  for (const x of retract.slice(0, 12)) out(`SELF-LEARN (a)   retract ${x.level} ${x.pattern} ${x.program} forms ${x.forms.length} wrong ${x.wrongRows.length} right ${x.rightRows.length}`);
  if (retract.length > 12) out(`SELF-LEARN (a)   retract ... ${retract.length - 12} more entries in ${L.FILES.learned}`);
  const heldIds = L.heldOutIds(ROOT);
  const prov = L.provenanceIds(stored);
  const leak = [...prov].filter((id) => heldIds.has(id));
  out(`SELF-LEARN (a) provenance names ${prov.size} ids; held-out ids among them ${leak.length}; held-out records the learner opened ${r.opened.heldOut}; test records outside the 200 it opened ${r.opened.test}`);

  // (a) the recount, from the file, over a fresh read of the development rows, parsed here (not by the learner's judge)
  const pop = L.collect({ root: ROOT });
  const parsed = pop.rows.map((x) => { const p = I.parse(x.question + L.SUFFIX); return { id: x.id, gold: x.gold, lesson: x.lesson, pats: I.patterns(p), L: I.leafTable(p) }; });
  const minFit = Math.max(L.RULE.others + 1, Number(stored.minSupport) || 0);
  const recount = { entries: entries.length, minFit, rows: 0, contradicted: 0, ownLesson: 0, entriesContradicting: 0, fitsBelowRule: 0 };
  for (const { lv, pat, e } of entries) {
    const f = I.compile(I.readProgram(e.program));
    let c = 0, fitLesson = 0;
    for (const x of parsed) {
      if (x.pats[lv] !== pat) continue;
      const v = f(x.L);
      if (!I.acceptable(v, x.L, stored.invariant || 'whole')) continue;
      recount.rows++;
      if (L.fitsGold(v, x.gold)) { if (x.lesson === e.learned.lesson) fitLesson++; continue; }
      c++; if (x.lesson === e.learned.lesson) recount.ownLesson++;
    }
    recount.contradicted += c;
    if (c) recount.entriesContradicting++;
    if (fitLesson < minFit) recount.fitsBelowRule++;
  }
  out(`SELF-LEARN (a) recount from the file over ${parsed.length} development rows (opened held-out ${pop.opened.heldOut}): learned entries ${recount.entries}, rows of their patterns they answer ${recount.rows}, contradicted ${recount.contradicted} (of their own lesson ${recount.ownLesson}), entries contradicting any ${recount.entriesContradicting}, entries fitting fewer than ${minFit} of their lesson ${recount.fitsBelowRule}`);

  // (f) the ceiling by cause, before and after the chain programs, and the support gate before (chain programs off)
  const ceil = ceilings(L, r.population);
  out(ceil.before.line);
  out(ceil.after.line);
  const gb = await L.supportGate({ rows: r.population, states: r.beforeStates, kept, levels: r.levels, invariant: kept.invariant || 'whole', at, chain: false });
  const gateLine = (g) => g.tried.map((t) => 'others ' + t.others + ' kept ' + t.entries + ' entries, learned right ' + t.right + ', wrong ' + t.wrong).join('; ') + '; ' + (g.others === null ? 'no support validated' : 'validated ' + g.others + ' others');
  out('SELF-LEARN (f) support gate before (chain programs off): ' + gateLine(gb));
  out('SELF-LEARN (f) support gate after (chain programs on, the run above): ' + gateLine(r.gate) + '; chain candidates added to the mistakes\' candidates ' + r.tally.fromChain);

  // (b), (b2) and (c): the held-out rows, the merged store, the production loader, then the kept store alone
  const H = readHeldout(ROOT);
  const merged = L.mergeStores(kept, stored);
  const keys = L.learnedKeysOf(kept, stored);
  const arm = async (name, store, rows) => {
    const q = await L.selfQuery(rows, store, { learnedKeys: keys });
    const c = q.counts;
    const wrong = rows.filter((x) => q.states.get(x.id).state === 'wrong').map((x) => {
      const s = q.states.get(x.id);
      return { id: x.id, got: s.got, gold: x.gold, from: s.from, by: s.program ? (s.learned ? 'learned' : 'kept') : null, program: s.program ? s.program.text : null, level: s.program ? s.program.level : null };
    });
    let learnedRight = 0, learnedWrong = 0;
    for (const x of rows) { const s = q.states.get(x.id); if (s.learned) { if (s.state === 'right') learnedRight++; else if (s.state === 'wrong') learnedWrong++; } }
    return { name, answered: c.right + c.wrong, correct: c.right, wrong: c.wrong, refused: c.refused, asked: c.asked, learnedRight, learnedWrong, wrongRows: wrong, states: q.states, ms: q.ms };
  };
  const pr = (tag, a) => {
    out(`SELF-LEARN ${tag} ${a.name}: asked ${a.asked}, answered ${a.answered}, correct ${a.correct}, wrong ${a.wrong}, refused ${a.refused}; by a learned program right ${a.learnedRight}, wrong ${a.learnedWrong}; ${a.ms} ms`);
    for (const w of a.wrongRows) out(`SELF-LEARN ${tag}   wrong ${w.id} got ${w.got} gold ${w.gold} from ${w.from}${w.by ? ' by ' + w.by + ' ' + w.level + ' ' + w.program : ''}`);
  };
  const hm = await arm('merged (kept, its retracted forms removed, + learned)', merged, H.rows);
  pr('(b)', hm);
  P.resetPrograms();
  const tier0 = { ...P.PROGRAM_TIER };
  const hp = await arm('production loader (act/prompt.mjs default store, its retracted forms removed, learned entries appended)', undefined, H.rows);
  pr('(b2)', hp);
  const tierD = {};
  for (const k of ['loads', 'learned', 'learnedRefused', 'learnedFailures', 'learnedContradicted', 'learnedUnchecked', 'retracted', 'retractUnapplied']) tierD[k] = (P.PROGRAM_TIER[k] || 0) - (tier0[k] || 0);
  hp.loader = tierD;
  out(`SELF-LEARN (b2) the production loader read the stores ${tierD.loads} time(s): learned entries loaded ${tierD.learned}, refused for provenance ${tierD.learnedRefused}, refused by its devRows check ${tierD.learnedContradicted}, unchecked ${tierD.learnedUnchecked}, unreadable ${tierD.learnedFailures}; forms retracted ${tierD.retracted}, retractions unapplied ${tierD.retractUnapplied}`);
  const hc = await arm('control (kept alone)', kept, H.rows);
  pr('(c)', hc);
  const gained = H.rows.filter((x) => hm.states.get(x.id).state === 'right' && hc.states.get(x.id).state !== 'right').map((x) => x.id);
  const lost = H.rows.filter((x) => hc.states.get(x.id).state === 'right' && hm.states.get(x.id).state !== 'right').map((x) => x.id);
  const withdrawn = H.rows.filter((x) => hc.states.get(x.id).state === 'wrong' && hm.states.get(x.id).state === 'refused').map((x) => x.id);
  const trainRows = r.counts.train + r.counts.trainHeldOut;
  out(`SELF-LEARN (b-c) held-out ${H.rows.length} rows of the ${trainRows} train-split rows (ids sha256 ${H.idsSha256}): merged correct ${hm.correct} vs control ${hc.correct} (gain ${hm.correct - hc.correct}, the bar ${BAR.gain}); merged wrong ${hm.wrong} vs control ${hc.wrong} (the bar ${BAR.wrong}); right only with the learned store ${gained.length}${gained.length ? ' ' + gained.join(' ') : ''}; right only without it ${lost.length}${lost.length ? ' ' + lost.join(' ') : ''}; control wrong now refused ${withdrawn.length}${withdrawn.length ? ' ' + withdrawn.join(' ') : ''}`);

  // (d) the ledger's 130 GSM8K rows, both ways, graded once (not in --iterate)
  let lrows = [], ledgerSplit = null, lm = null, tpop = null;
  if (!iterate) {
    const dev = L.developmentIds(ROOT);
    const ledger = fs.readFileSync(path.join(ROOT, L.FILES.ledger), 'utf8').split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l)).filter((x) => x.source === 'gsm8k');
    const testLines = fs.readFileSync(path.join(ROOT, L.FILES.test), 'utf8').split(/\r?\n/);
    lrows = ledger.map((x) => {
      const i = Number(String(x.id).split('.')[1]);
      const rec = JSON.parse(testLines[i]);
      return { id: String(x.id), question: rec.question, gold: goldOf(rec), split: dev.has(String(x.id)) ? 'development' : 'test' };
    });
    // the test population: every GSM8K test record outside the 200 development ids (the ledger's test rows among them)
    const ledgerIds = new Set(lrows.map((x) => x.id));
    const trows = [];
    for (let i = 0; i < testLines.length; i++) {
      if (!testLines[i].trim()) continue;
      const id = 'gsm8k.' + i;
      if (dev.has(id) || ledgerIds.has(id)) continue;
      const rec = JSON.parse(testLines[i]);
      trows.push({ id, question: rec.question, gold: goldOf(rec), split: 'test' });
    }
    const all = [...lrows, ...trows];
    lm = await arm('merged', merged, all);
    const lc = await arm('control', kept, all);
    ledgerSplit = {};
    for (const split of ['development', 'test']) {
      const rs = lrows.filter((x) => x.split === split);
      const tally = (a) => { const t = { rows: rs.length, correct: 0, wrong: 0, refused: 0 }; for (const x of rs) { const s = a.states.get(x.id).state; t[s === 'right' ? 'correct' : s]++; } return t; };
      ledgerSplit[split] = { merged: tally(lm), control: tally(lc) };
      const a = ledgerSplit[split];
      out(`SELF-LEARN (d) ledger ${split} ${rs.length} rows: merged correct ${a.merged.correct}, wrong ${a.merged.wrong}, refused ${a.merged.refused}; control correct ${a.control.correct}, wrong ${a.control.wrong}, refused ${a.control.refused}`);
    }
    const learnedOn = (rs) => { let right = 0, wrong = 0; for (const x of rs) { const st = lm.states.get(x.id); if (st.learned) { if (st.state === 'right') right++; else if (st.state === 'wrong') wrong++; } } return { right, wrong }; };
    const ll = learnedOn(lrows);
    lm.ledgerLearned = ll;
    out(`SELF-LEARN (d) ledger ${lrows.length} rows: by a learned program right ${ll.right}, wrong ${ll.wrong}`);
    const tp = all.filter((x) => x.split === 'test');
    const tt = (a) => { const t = { rows: tp.length, correct: 0, wrong: 0, refused: 0 }; for (const x of tp) { const st = a.states.get(x.id).state; t[st === 'right' ? 'correct' : st]++; } return t; };
    const tl = learnedOn(tp);
    const wrongNow = tp.filter((x) => lc.states.get(x.id).state === 'refused' && lm.states.get(x.id).state === 'wrong').map((x) => x.id);
    const learnedWrongRows = lm.wrongRows.filter((w) => w.by === 'learned' && tp.some((x) => x.id === w.id));
    tpop = { rows: tp.length, ledgerTest: tp.length - trows.length, merged: tt(lm), control: tt(lc), learnedRight: tl.right, learnedWrong: tl.wrong, wrongNow, learnedWrongRows, idsSha256: sha(tp.map((x) => x.id).join('\n')), gradedOnce: true };
    out(`SELF-LEARN (d) test population ${tpop.rows} rows (every GSM8K test record outside the 200 development ids, the ledger's ${tpop.ledgerTest} among them; ids sha256 ${tpop.idsSha256}): merged correct ${tpop.merged.correct}, wrong ${tpop.merged.wrong}, refused ${tpop.merged.refused}; control correct ${tpop.control.correct}, wrong ${tpop.control.wrong}, refused ${tpop.control.refused}; by a learned program right ${tl.right}, wrong ${tl.wrong}; a refusal now wrong ${wrongNow.length}`);
    for (const w of learnedWrongRows) out(`SELF-LEARN (d)   wrong by a learned program ${w.id} got ${w.got} gold ${w.gold} ${w.level} ${w.program}`);
    // THE RULE 7 DISCLOSURE (board 36, item learn): the test population against bench/verdicts/ns.json's split and the
    // records the kept store fit (its devRows), counted from the ids only (no record is read for this)
    const nsJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'bench/verdicts/ns.json'), 'utf8'));
    const nsDev = new Set(nsJ.rows.development.map((x) => String(x.id)));
    const nsHeld = new Set(((nsJ.split && nsJ.split.heldOut && nsJ.split.heldOut.ids) || []).map(String));
    const keptFit = new Set(((kept.devRows && kept.devRows.rows) || []).map((x) => String(x[0])));
    tpop.split = {
      inNsDevelopment: tp.filter((x) => nsDev.has(x.id)).length,
      inNsHeldOut: tp.filter((x) => nsHeld.has(x.id)).length,
      neither: tp.filter((x) => !nsDev.has(x.id) && !nsHeld.has(x.id)).length,
      inKeptDevRows: tp.filter((x) => keptFit.has(x.id)).length,
    };
    const kd = kept.devRows && kept.devRows.split ? kept.devRows.split : null;
    tpop.keptDevRowsSplit = kd;
    out(`SELF-LEARN (d) rule 7: the test population's ${tp.length} rows: in bench/verdicts/ns.json rows.development ${tpop.split.inNsDevelopment}, in its heldOut ${tpop.split.inNsHeldOut}, in neither ${tpop.split.neither}; records the kept store fit (its devRows) ${tpop.split.inKeptDevRows}; the kept store's devRows ${kd ? 'rows ' + kd.rows + ', in the 200 math.json development ids ' + kd.inMathDevelopment + ', outside them ' + kd.outsideMathDevelopment + ', in ns.json rows.development ' + kd.inNsDevelopment + ', in its heldOut ' + kd.inNsHeldOut : 'split absent'}`);
  }

  // (e) the cross-validation, development rows only: the same steps on one half, graded on the other, both ways
  const cv = await L.crossValidate({ rows: r.population, states: r.beforeStates, kept, levels: r.levels, folds: 2, invariant: kept.invariant || 'whole', at });
  out(`SELF-LEARN (e) development 2-fold, ${cv.rows} rows each graded once by the half it was not in: kept alone right ${cv.keptRight}, wrong ${cv.keptWrong}; merged right ${cv.mergedRight}, wrong ${cv.mergedWrong}; by a learned program right ${cv.learnedRight}, wrong ${cv.learnedWrong}; outcomes fixed ${cv.fixed}, learned ${cv.learned}, withdrawn ${cv.withdrawn}, wrong-now ${cv.wrongNow}, lost ${cv.lost}; learned entries ${cv.learnedEntries}, forms retracted ${cv.retractedForms}; the support gate validated others ${cv.others.map((o) => (o === null ? 'none' : o)).join(' and ')} on the halves; ceiling of any rule over role-pattern programs ${cv.ceiling}; ${cv.ms} ms`);

  // the tests
  const tr = spawnSync(process.execPath, ['--test', 'test/self-learn.test.mjs'], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
  const num = (k) => { const m = new RegExp('^\\S+ ' + k + ' (\\d+)$', 'm').exec(tr.stdout || ''); return m ? Number(m[1]) : null; };
  const tests = { pass: num('pass'), fail: num('fail'), exit: tr.status };
  out(`SELF-LEARN tests node --test test/self-learn.test.mjs: pass ${tests.pass}, fail ${tests.fail}, exit ${tests.exit}`);

  const sockets = SOCKETS.connect + SOCKETS.fetch + L.socketAttempts();
  const checks = {
    gain: hm.correct >= hc.correct + BAR.gain,
    wrong: hm.wrong === BAR.wrong,
    tests: tests.fail === 0 && tests.pass > 0 && tests.exit === 0,
    sockets: sockets === 0,
    noLeak: leak.length === 0 && r.opened.heldOut === 0 && r.opened.test === 0 && pop.opened.heldOut === 0,
    noContradiction: recount.contradicted === 0 && recount.fitsBelowRule === 0,
    outOfSampleWrong: cv.learnedWrong === 0,
    testWrong: tpop ? tpop.learnedWrong === 0 && tpop.wrongNow.length === 0 : null,
  };
  const barMet = Object.values(checks).every((v) => v === true);
  const failed = Object.entries(checks).filter(([, v]) => v === false).map(([k]) => k);
  if (!failed.length && !barMet) failed.push('the ledger and the test population are not graded in --iterate');
  const statement = (barMet ? 'BAR MET' : 'BAR NOT MET (' + failed.join(', ') + ')') + `: with the model off the organism asked ${r.rows} development rows, learned ${r.programs} programs from its ${r.mistakes} mistakes by the rule (fits at least the support the gate validates of other development rows of the same lesson and contradicts none of its pattern; the gate asks 0 wrong and at least ${L.GATE.minRight} right from programs learned on one half and asked on the other: ${r.gate.tried.map((t) => 'at ' + t.others + ' others right ' + t.right + ' wrong ' + t.wrong).join(', ')}, so ${r.gate.others === null ? 'no support was validated and nothing is kept' : 'the rule keeps with ' + r.gate.others + ' others'}; recount contradicted ${recount.contradicted}) and retracted ${r.retracted.forms} question forms of ${r.retracted.entries} kept entries on ${r.retracted.wrongRows} wrong development answers; on ${H.rows.length} held-out rows it never saw the merged store answered ${hm.correct} right and ${hm.wrong} wrong against the kept store's ${hc.correct} right and ${hc.wrong} wrong (gain ${hm.correct - hc.correct}, the bar ${BAR.gain}; wrong the bar ${BAR.wrong}); the production loader (retractions applied: ${hp.loader.retracted} forms retracted, ${hp.loader.retractUnapplied} unapplied) ${hp.correct} right and ${hp.wrong} wrong; a learned program answered ${hm.learnedRight} held-out rows right and ${hm.learnedWrong} wrong; on development rows the learner did not see (2-fold) a learned program answered ${cv.learnedRight} right and ${cv.learnedWrong} wrong of ${cv.rows}, the retractions withdrew ${cv.withdrawn} wrong answers and lost ${cv.lost} right ones, and the ceiling of any rule over this store shape is ${cv.ceiling} of ${cv.rows}; ${tpop ? 'on the ' + tpop.rows + ' GSM8K test records outside the 200, graded once, a learned program answered ' + tpop.learnedRight + ' right and ' + tpop.learnedWrong + ' wrong' : 'the test population is not graded in --iterate'}; tests ${tests.pass} pass ${tests.fail} fail; sockets ${sockets}. The ceiling by cause (development leave-one-out: a program another development row of the same role form offers gives the row's gold): before ${ceil.before.table.reachable} of ${ceil.before.table.rows} reachable, after the straight-line chain programs ${ceil.after.table.reachable} (two-fold ${ceil.before.table.twoFold} then ${ceil.after.table.twoFold}); the ${ceil.after.table.unreachable} rows left unreachable: ${L.CAUSES.map((c) => '(' + c.k + ') ' + c.name + ' ' + ceil.after.table.causes[c.k]).join(', ')}; the largest cause left is (${ceil.after.table.largest.k}) ${ceil.after.table.largest.name}, ${ceil.after.table.largest.rows} rows${ceil.after.table.largest.k === 4 ? ' (the parse reads a quantity the chain never uses ' + ceil.after.table.pattern.notWhole + ', more leaves than the window ' + ceil.after.table.pattern.window + ', own role form ' + ceil.after.table.pattern.ownForm + ', shared role form ' + ceil.after.table.pattern.sharedForm + ')' : ''}; the support gate with the chain programs off: ${gb.tried.map((t) => 'at ' + t.others + ' others right ' + t.right + ' wrong ' + t.wrong).join(', ')}.`;
  out('SELF-LEARN ' + statement);
  out(`SELF-LEARN ${Date.now() - t0} ms`);
  if (iterate) return;
  const verdict = {
    at, command: COMMAND, author: L.AUTHOR, isTheBar: true, barMet, bar: { gain: BAR.gain, wrong: BAR.wrong, tests: 'pass', sockets: 0, contradicted: 0, outOfSampleWrong: 0, testWrong: 0 }, checks,
    split: {
      development: { rows: r.rows, ledgerDevelopment: r.counts.ledgerDevelopment, mathDevelopment: r.counts.mathDevelopment, train: r.counts.train, idsSha256: r.store.development.idsSha256, what: 'the GSM8K ledger rows among the 200 bench/verdicts/math.json development ids, the other ids of those 200, and every train-split row not held out. The kept store bench/verdicts/induce-programs.json (the control and the base of every arm) was fit before board 35 on bench/verdicts/ns.json rows.development, not on the 200 only: ' + (tpop && tpop.keptDevRowsSplit ? 'of the ' + tpop.keptDevRowsSplit.rows + ' records it fits (its devRows), ' + tpop.keptDevRowsSplit.inMathDevelopment + ' are among the 200 and ' + tpop.keptDevRowsSplit.outsideMathDevelopment + ' are GSM8K test records outside them (devRows.split, the rule 7 disclosure)' : 'its devRows split is absent') + '; the learner itself opens no test record outside the 200' },
      heldOut: { file: HELDOUT, rows: H.rows.length, of: 'the ' + trainRows + ' train-split rows', seed: H.seed, idsSha256: H.idsSha256, writtenBefore: 'self/learn.mjs', opened: r.opened.heldOut, inProvenance: leak.length },
      ledgerTest: { rows: lrows.filter((x) => x.split === 'test').length, gradedOnce: true, what: 'the ledger GSM8K rows outside the 200 development ids, read by this bench only after the learner ran, graded once per bar run and never iterated on' },
      testPopulation: { rows: tpop.rows, idsSha256: tpop.idsSha256, gradedOnce: true, inNsDevelopment: tpop.split.inNsDevelopment, inNsHeldOut: tpop.split.inNsHeldOut, neither: tpop.split.neither, inKeptDevRows: tpop.split.inKeptDevRows, what: 'every GSM8K test record outside the 200 development ids (the ledger test rows among them), read by this bench only after the learner ran, graded once per bar run and never iterated on. The rule 7 disclosure (board 36): of the ' + tpop.rows + ', ' + tpop.split.inNsDevelopment + ' are in bench/verdicts/ns.json rows.development (the rows the kept store was induced on before board 35), ' + tpop.split.inNsHeldOut + ' in its heldOut and ' + tpop.split.neither + ' in neither, and ' + tpop.split.inKeptDevRows + ' are records the kept store fits (its devRows): for the kept store, and so for the control and the merged arms built on it, the ' + tpop.split.inNsDevelopment + ' are development, not held out; only a learned program is measured here on records it never read' },
      contaminated: 'the held-out list and the learner were written by the same board 35 builder, and the learner was revised (the strict contradiction rule, the retractions, the support gate) after the (b) and (c) held-out counts of earlier runs were printed and read (the loop the item allows: edit and re-run on (b) and (c) only); one scratch check during the first design parsed the first 2000 train questions, held-out included (no gold read, nothing learned). The learner never opens a held-out record (its record spy counts 0) and no held-out id is in the store. The design choices of this revision were measured on the development 2-fold (e) and on scratch development-only 2-fold runs (a required fit of 3 to 12 rows of the lesson, fits per question form, fits that follow the worked chain), not on the held-out rows; the skeptic report of learned programs answering the test population was read before the support gate was written, and the test population (d) is graded once, by this run. Board 36, item learn-2: the ceiling by cause and the straight-line chain programs were designed on the development rows only (the --ceiling tables and scratch development 2-fold runs of rules over the chain programs); the learn-2 builder never opened a held-out record, and read the previous verdict (its printed held-out counts: gain 0, the control 2 wrong on gsm8k-train.209 and gsm8k-train.5502) before the design. The learn-2 fix round read the printed lines of the build and of the skeptic (the same held-out counts) before its edits; its edits (the cause classifier by the operation limit of each arm, the window part of cause 4) and its scratch measurements (2-fold selector variants over role-form programs) read development rows only and opened no held-out record.',
    },
    learn: { rows: r.rows, mistakes: r.mistakes, programs: r.programs, entries: entries.length, patterns: r.patterns, inducedFrom: r.inducedFrom, byLevel: r.byLevel, byLesson: r.byLesson, tally: r.tally, levels: r.levels, floor: r.floor, before: r.before, after: r.after, outcomes: r.outcomes, learnedAnswered: r.learnedAnswered, gate: r.gate, retracted: r.retracted, merged: r.mergedCounts, refusedByReason: r.refusedByReason, opened: r.opened, file: r.file, sha256: r.sha256, bytes: r.bytes, recount },
    heldOut: {
      merged: { answered: hm.answered, correct: hm.correct, wrong: hm.wrong, refused: hm.refused, learnedRight: hm.learnedRight, learnedWrong: hm.learnedWrong, wrongRows: hm.wrongRows },
      production: { answered: hp.answered, correct: hp.correct, wrong: hp.wrong, refused: hp.refused, learnedRight: hp.learnedRight, learnedWrong: hp.learnedWrong, wrongRows: hp.wrongRows, loader: hp.loader, what: 'ask() with no opts.programs: act/prompt.mjs loads the default store and applies learned-programs.json: since board 36 (item learn) it applies the retract list as self/learn.mjs mergeStores does (each retracted form removed from the kept entry, the entry kept, so gate 7 refuses that form) and appends the learned entries its devRows check passes' },
      control: { answered: hc.answered, correct: hc.correct, wrong: hc.wrong, refused: hc.refused, wrongRows: hc.wrongRows },
      gain: hm.correct - hc.correct, gained, lost, withdrawn,
    },
    ledger: { rows: lrows.length, split: ledgerSplit, learnedRight: lm.ledgerLearned.right, learnedWrong: lm.ledgerLearned.wrong, gradedOnce: true },
    testPopulation: tpop,
    crossValidation: cv,
    ceiling: { what: 'board 36, item learn-2: the ceiling by cause over the development rows (self/learn.mjs ceilingByCause, CAUSES), before and after the straight-line programs read from the worked chains (self/learn.mjs CHAIN, reason/induce.mjs chainProgram)', causes: L.CAUSES, chainRule: L.CHAIN, before: ceil.before.table, after: ceil.after.table, gateBefore: { chain: false, others: gb.others, tried: gb.tried, ms: gb.ms }, gateAfter: { chain: true, others: r.gate.others, tried: r.gate.tried, ms: r.gate.ms }, fromChain: r.tally.fromChain },
    tests, sockets, statement, printed,
  };
  fs.writeFileSync(path.join(ROOT, VERDICT), JSON.stringify(verdict, null, 1) + '\n');
  out(`SELF-LEARN verdict ${VERDICT} written`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--write-heldout')) console.log(JSON.stringify(writeHeldout()));
  else if (process.argv.includes('--ceiling')) await ceilingOnly();
  else await main();
}
