// bench/induce.mjs: THE INDUCE BAR (board 23 builder, item induce; ROUTE A of docs/RESEARCH-PARADIGM.md).
//
// The flaw it measures against: the word reader and the templates answered 1 of 200 held-out GSM8K
// records (bench/verdicts/ns.json heldOut), because a template is the same question with other
// numbers and a held-out record is a new question. This bench asks the held-out records through
// PROGRAMS instead: reason/induce.mjs parses each development question into quantities with roles,
// searches bottom-up (depth 4: four operations over five leaves, observational equivalence, the last
// level by top-down inversion) every program in its DSL that reproduces the development answer, keeps
// the programs that reproduce at least two development records under one cue pattern (the library),
// writes the library to bench/verdicts/induce-programs.json, and only THEN opens the held-out records
// and answers each through the kept programs only. Model OFF: no provider, no socket, no model call.
//
// THE SPLIT, never crossed. Development: the ids bench/verdicts/ns.json rows.development lists (the
// records bench/public.mjs gsm8kDevIds names plus every record a journal under bench/verdicts named
// when ns.json was written). Held out: the 200 ids ns.json split.heldOut.ids lists. The search opens
// records through a reader that logs every id it opened (reason/induce.mjs makeRecordReader); the
// verdict prints how many held-out ids it opened (the bar needs 0). The held-out records are read by a
// second reader, after the library is written and its sha256 recorded.
//
// Printed and written from its own measurements: development reproduced (n and share, and the part
// whose program follows the record's own worked chain), programs kept, the development leave-one-out
// (each development record answered with its own support removed, per cue level), held-out answered,
// held-out right, right with a program that follows the held-out record's worked chain (graded after
// the answer, never shown to a rule), median ns per answer (1,000 repeats a record, two passes, beside
// an empty clock bracket), the PLACEBO control (the same programs with the cue patterns shuffled), and
// the template row of ns.json beside it.
//
//   node --max-old-space-size=4000 bench/induce.mjs [--limit N] [--wall-minutes M] [--repeats R]
//
// A run over fewer than every development record (--limit, or the wall clock ran out) writes
// bench/verdicts/induce-partial.json (isTheBar false) and says what it covered. The full run writes
// bench/verdicts/induce.json.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import * as I from '../reason/induce.mjs';
import { RNG } from '../core/rng.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');
const FIXTURE = path.join(ROOT, 'bench', 'fixtures', 'public', 'gsm8k', 'test.jsonl');
const STORE = path.join(VERDICTS, 'induce-programs.json');
const AUTHOR = 'board 23 builder (item induce)';
const PLACEBO_SEED = 'induce/placebo/1';

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const rel = (p) => path.relative(ROOT, p).replaceAll('\\', '/');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const r4 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 1e4) / 1e4);
const r1 = (x) => (x === null || x === undefined || !Number.isFinite(x) ? null : Math.round(x * 10) / 10);
const pct = (x) => (x === null || x === undefined || !Number.isFinite(x) ? 'n/a' : (100 * x).toFixed(1) + '%');

function dist(a) {
  const s = Float64Array.from(a).sort();
  const q = (p) => (s.length ? s[Math.floor(p * (s.length - 1))] : null);
  let sum = 0;
  for (const x of s) sum += x;
  return { n: s.length, median: r1(q(0.5)), p90: r1(q(0.9)), p99: r1(q(0.99)), min: s.length ? r1(s[0]) : null, max: s.length ? r1(s[s.length - 1]) : null, mean: s.length ? r1(sum / s.length) : null };
}
const copies = (text, n) => { const out = new Array(n); for (let i = 0; i < n; i++) out[i] = Buffer.from(text).toString(); return out; };

/** The same library with each level's pattern-to-programs map shuffled: the cue link destroyed, everything else kept. */
export function placeboOf(kept, seed = PLACEBO_SEED) {
  const rng = new RNG(seed);
  const out = { ...kept, levels: {} };
  for (const lv of Object.keys(kept.levels)) {
    const pats = Object.keys(kept.levels[lv]);
    const lists = pats.map((p) => kept.levels[lv][p]);
    rng.shuffle(lists);
    out.levels[lv] = Object.fromEntries(pats.map((p, i) => [p, lists[i]]));
  }
  return out;
}

/** Ask records through a library; grade after the answer. */
function askAll(recs, kept, gradeChain) {
  const rows = [];
  for (const r of recs) {
    const a = I.answerFromPrograms(r.question, kept);
    const row = { id: r.id, answered: !!a, answer: a ? a.answer : null, program: a ? a.program : null, level: a ? a.level : null, support: a ? a.support : null, ns: a ? a.ns : null };
    // grading: the key is read only here, after the answer exists
    const gold = I.goldOf(r);
    row.gold = gold;
    row.right = !!a && Number(a.answer) === gold;
    if (a && gradeChain) row.followsChain = I.followsChain(I.readProgram(a.program), I.leafTable(I.parse(r.question)), I.chainNumbers(r.answer));
    rows.push(row);
  }
  return rows;
}
function tallyLevels(rows) {
  const out = {};
  for (const r of rows) if (r.answered) { const t = out[r.level] || (out[r.level] = { answered: 0, right: 0 }); t.answered++; if (r.right) t.right++; }
  for (const t of Object.values(out)) t.precision = r4(t.right / t.answered);
  return out;
}

async function main() {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  const command = 'node ' + ['bench/induce.mjs', ...argv].join(' ');
  const limit = arg('limit', null) === null ? null : Math.max(1, parseInt(arg('limit'), 10) || 1);
  const wallMinutes = Math.max(0.1, parseFloat(arg('wall-minutes', '40')) || 40);
  const reps = Math.max(1, parseInt(arg('repeats', '1000'), 10) || 1000);
  const t0 = Date.now();
  const deadline = t0 + wallMinutes * 60000;
  say(`induce: ${command} (node ${process.version}, model off: no provider, no socket, no model call)`);
  const code = Object.fromEntries(['reason/induce.mjs', 'bench/induce.mjs'].map((f) => [f, sha(fs.readFileSync(path.join(ROOT, f))).slice(0, 16)]));
  say(`code: ${Object.entries(code).map(([f, h]) => f + ' ' + h).join(', ')}`);
  say(`dsl: ${I.PRIMITIVES.length} primitives (${I.PRIMITIVES.map((p) => p.name).join(', ')}), programs of at most ${I.MAX_OPS} operations, each leaf used at most once`);
  if (!fs.existsSync(FIXTURE)) { say('BAR NOT MET: the GSM8K fixture ' + rel(FIXTURE) + ' is absent on this host'); process.exitCode = 1; return; }

  // THE SPLIT, from ns.json
  const nsFile = path.join(VERDICTS, 'ns.json');
  const nsv = JSON.parse(fs.readFileSync(nsFile, 'utf8'));
  const devAll = nsv.rows.development.map((r) => r.id);
  const heldIds = nsv.split.heldOut.ids.slice();
  const heldSet = new Set(heldIds);
  const PUB = await import('./public.mjs');
  const devPublic = PUB.gsm8kDevIds();
  const devSet = new Set(devAll);
  const publicInDev = [...devPublic.set].filter((id) => devSet.has(id)).length;
  const overlap = devAll.filter((id) => heldSet.has(id)).length;
  const devIds = limit ? devAll.slice(0, limit) : devAll;
  say(`split: development ${devAll.length} ids from bench/verdicts/ns.json rows.development (ns.json at ${nsv.at}; its journals ${nsv.split.development.journals.length}, gsm8kDevIds ${devPublic.set.size} of which ${publicInDev} in it), held out ${heldIds.length} ids from ns.json split.heldOut.ids; overlap ${overlap}${limit ? `; this run searches the first ${devIds.length} development records only (--limit)` : ''}`);

  // THE DEVELOPMENT RUN: only development ids pass through this reader
  const devReader = I.makeRecordReader(FIXTURE);
  const s0 = Date.now();
  const res = I.induce(devReader, devIds, { deadline });
  const searchMs = Date.now() - s0;
  const openedHeld = devReader.opened.filter((id) => heldSet.has(id)).length;
  const openedNotDev = devReader.opened.filter((id) => !devSet.has(id)).length;
  const covered = res.covered;
  const reproduced = res.rows.filter((r) => r.programs > 0).length;
  const chainReproduced = res.rows.filter((r) => r.chainPrograms > 0).length;
  const searchNs = dist(res.rows.filter((r) => r.searchNs).map((r) => r.searchNs));
  const programsFound = res.rows.reduce((n, r) => n + (r.programs || 0), 0);
  say(`search: ${covered} development records searched in ${(searchMs / 1000).toFixed(1)} s (median ${searchNs.median} ns a record, max ${searchNs.max} ns); reproduced ${reproduced} (${pct(reproduced / covered)}), with a program that follows the record's worked chain ${chainReproduced} (${pct(chainReproduced / covered)}); programs found ${programsFound}; the reader opened ${devReader.opened.length} records, held-out ids among them ${openedHeld}, ids outside development ${openedNotDev}`);
  const kept = res.kept;
  say(`abstract: ${kept.programs} distinct programs kept (each reproduces at least ${kept.minSupport} development records under one cue pattern, following the worked chain), filed under ${kept.patterns} patterns across the levels ${I.LEVELS.join(' > ')}`);

  // THE DEVELOPMENT LEAVE-ONE-OUT: each record answered with its own support removed
  const qOf = new Map();
  for (const id of devIds.slice(0, covered)) { const r = devReader.get(id); if (r) qOf.set(id, r); }
  const looRows = [];
  for (const [id, r] of qOf) {
    const a = I.answerFromPrograms(r.question, kept, { exclude: id });
    looRows.push({ id, answered: !!a, level: a ? a.level : null, right: !!a && Number(a.answer) === I.goldOf(r) });
  }
  const loo = { n: looRows.length, answered: looRows.filter((x) => x.answered).length, right: looRows.filter((x) => x.right).length, byLevel: tallyLevels(looRows) };
  loo.precision = r4(loo.right / loo.answered);
  say(`development leave-one-out: ${loo.answered} of ${loo.n} answered, ${loo.right} right (precision ${pct(loo.precision)}); by level ${Object.entries(loo.byLevel).map(([k, v]) => k + ' ' + v.right + '/' + v.answered).join(', ')}`);
  kept.devLoo = loo.byLevel;

  // THE LIBRARY, written and frozen before any held-out record is opened
  const store = {
    at, command, author: AUTHOR, what: 'the kept programs of reason/induce.mjs: per cue level and pattern, the programs that reproduce at least minSupport development GSM8K records (following the worked chain), ranked; records are the provenance',
    dsl: I.PRIMITIVES.map((p) => ({ name: p.name, arity: p.arity, kind: p.kind, meaning: p.meaning })), maxOps: I.MAX_OPS,
    development: { source: 'bench/verdicts/ns.json rows.development', records: covered, idsSha256: sha(devIds.slice(0, covered).join('\n')) },
    ...kept,
  };
  fs.mkdirSync(VERDICTS, { recursive: true });
  const storeText = JSON.stringify(store) + '\n';
  fs.writeFileSync(STORE, storeText);
  const storeSha = sha(storeText);
  const back = JSON.parse(fs.readFileSync(STORE, 'utf8'));
  say(`store: ${rel(STORE)} written (${Buffer.byteLength(storeText)} bytes, sha256 ${storeSha.slice(0, 16)}), read back: ${back.programs} programs, ${back.patterns} patterns`);

  // HELD OUT: a second reader, opened only now, answered through the read-back library only
  const heldReader = I.makeRecordReader(FIXTURE);
  const heldRecs = heldIds.map((id) => heldReader.get(id)).filter(Boolean);
  const heldRows = askAll(heldRecs, back, true);
  const answered = heldRows.filter((r) => r.answered).length, right = heldRows.filter((r) => r.right).length;
  const rightChain = heldRows.filter((r) => r.right && r.followsChain).length;
  const byLevel = tallyLevels(heldRows);
  say(`held out: ${heldRecs.length} records asked through the kept programs only: answered ${answered} (${pct(answered / heldRecs.length)}), right ${right} (${pct(right / heldRecs.length)} of held out; precision ${pct(answered ? right / answered : null)}); right with a program that follows the record's worked chain ${rightChain}; by level ${Object.entries(byLevel).map(([k, v]) => k + ' ' + v.right + '/' + v.answered).join(', ')}`);

  // THE PLACEBO: the same programs, the cue patterns shuffled
  const plac = askAll(heldRecs, placeboOf(back), false);
  const pAns = plac.filter((r) => r.answered).length, pRight = plac.filter((r) => r.right).length;
  say(`control, placebo (seed ${PLACEBO_SEED}: every level's pattern-to-programs map shuffled): answered ${pAns}, right ${pRight} (${pct(pRight / heldRecs.length)})`);
  const tpl = nsv.heldOut || {};
  say(`control, the template row (bench/verdicts/ns.json heldOut at ${nsv.at}): sub-token answered ${tpl.subToken} of ${tpl.n} (share ${tpl.share}), right ${tpl.subTokenCorrect}`);

  // TIMING: the whole answer (parse, pattern lookup, program runs) on fresh string copies
  const empty = [];
  for (let i = 0; i < reps; i++) { const a = process.hrtime.bigint(); empty.push(Number(process.hrtime.bigint() - a)); }
  const passes = [];
  const runNs = [], runBatch = [];
  for (let p = 0; p < 2; p++) {
    const all = [], ans = [];
    for (const r of heldRecs) {
      const cs = copies(r.question, reps);
      let hit = false;
      for (let i = 0; i < reps; i++) { const a = process.hrtime.bigint(); const out = I.answerFromPrograms(cs[i], back); const d = Number(process.hrtime.bigint() - a); all.push(d); if (out) { ans.push(d); hit = true; } }
      if (p === 0 && hit) {
        // the program run alone, the leaf table built once
        const a0 = I.answerFromPrograms(r.question, back);
        const f = I.compile(I.readProgram(a0.program));
        const L = I.leafTable(I.parse(r.question));
        for (let i = 0; i < reps; i++) { const a = process.hrtime.bigint(); f(L); runNs.push(Number(process.hrtime.bigint() - a)); }
        // the same runs in one bracket: the cost below the clock's own resolution
        let sink = 0;
        const b0 = process.hrtime.bigint();
        for (let i = 0; i < reps; i++) sink += f(L);
        runBatch.push(Number(process.hrtime.bigint() - b0) / reps);
        if (sink === -1) console.log('');
      }
    }
    passes.push({ all: dist(all), answered: dist(ans) });
  }
  const emptyD = dist(empty), runD = dist(runNs);
  say(`timing: answerFromPrograms on every held-out record, ${reps} repeats a record, pass 1 median ${passes[0].all.median} ns (p99 ${passes[0].all.p99}), pass 2 median ${passes[1].all.median} ns; on the answered ones median ${passes[0].answered.median} ns and ${passes[1].answered.median} ns; the program run alone median ${runD.median} ns a timed run (below the clock's resolution), ${dist(runBatch).median} ns a run in one bracket of ${reps}; an empty clock bracket median ${emptyD.median} ns`);

  const complete = !limit && covered === devAll.length;
  const met = {
    split: overlap === 0 && openedHeld === 0 && openedNotDev === 0,
    development: reproduced > 0,
    heldOut: heldRecs.length === heldIds.length && right > 0 && heldRows.filter((r) => r.answered).every((r) => typeof r.program === 'string' && r.program.length > 0),
    complete,
  };
  const barMet = complete && met.split && met.development && met.heldOut;
  const peak = r1(process.resourceUsage().maxRSS / 1024);
  say(`BAR: split ${met.split ? 'clean (held-out opened by the search 0)' : 'CROSSED'}; development reproduced ${reproduced}/${covered}; held-out right ${right} of ${heldRecs.length} (${pct(right / heldRecs.length)}) with provenance program, against the bar of 1 and the template row's ${tpl.subTokenCorrect}; placebo right ${pRight}; ${complete ? '' : 'a partial run (covered ' + covered + ' of ' + devAll.length + ' development records): '}${barMet ? 'BAR MET' : 'BAR NOT MET'}`);
  say(`peak rss ${peak} MB; wall ${((Date.now() - t0) / 1000).toFixed(1)} s`);

  const statement = `The organism answered held-out GSM8K word problems with programs it induced itself, with no model call. `
    + `It parsed each of ${covered} development questions into quantities with roles, searched bottom-up, one class per leaf set and value, the programs of at most ${I.MAX_OPS} operations in a DSL of ${I.PRIMITIVES.length} primitives that reproduces the development answer (it found one for ${reproduced}, ${pct(reproduced / covered)}; for ${chainReproduced} the program follows the record's own worked solution), and kept ${kept.programs} programs that each reproduce at least ${kept.minSupport} development records under one cue pattern. `
    + `Asked through those kept programs only, the ${heldRecs.length} held-out records (never opened while the parse, the DSL or a program was written: the search opened ${openedHeld} of them) were answered ${answered} times and ${right} answers were right (${pct(right / heldRecs.length)} of held out, precision ${pct(answered ? right / answered : null)}), each with its program as provenance; ${rightChain} of the right ones used a program that follows the record's worked solution. `
    + `The template and word reader row on the same ${heldRecs.length} was ${tpl.subTokenCorrect} right. The placebo control, the same programs with the cue patterns shuffled, got ${pRight} right. `
    + `An answer takes a median ${passes[0].answered.median} ns (parse, lookup and program run), the program run alone ${dist(runBatch).median} ns (a bracket of ${reps} runs). `
    + `On development, leaving each record's own support out, ${loo.right} of ${loo.answered} answers were right (${pct(loo.precision)}): most answers are still wrong, which is the next rung (the residual miner and a better parse), stated here so the number is not read as solved.`;
  const verdict = {
    at, command, node: process.version, isTheBar: complete, barMet, met, author: AUTHOR, modelCalls: 0,
    split: {
      development: { what: 'the GSM8K ids bench/verdicts/ns.json rows.development lists: bench/public.mjs gsm8kDevIds plus every record a journal under bench/verdicts named when ns.json was written; the parse, the DSL and every program were written and searched against these only', source: 'bench/verdicts/ns.json rows.development', nsAt: nsv.at, journals: nsv.split.development.journals, gsm8kDevIds: devPublic.source, records: devAll.length, searched: covered, ids: devIds.slice(0, covered), idsSha256: store.development.idsSha256, readByAuthor: 'gsm8k.0 to gsm8k.39 and gsm8k.300 to gsm8k.329 read in full while the parse was written; every development record through the probes' },
      heldOut: { what: 'the 200 ids bench/verdicts/ns.json split.heldOut.ids lists (sampleIds at seed public/1), opened by a second reader after the library was written', source: 'bench/verdicts/ns.json split.heldOut.ids', ids: heldIds, asked: heldRecs.length },
      overlap, openedBySearch: { held: openedHeld, outsideDevelopment: openedNotDev, total: devReader.opened.length },
      contaminated: overlap === 0 && openedHeld === 0 && openedNotDev === 0 ? false : 'a held-out id was development or was opened by the search',
    },
    statement, code,
    development: { searched: covered, reproduced, share: r4(reproduced / covered), chainReproduced, chainShare: r4(chainReproduced / covered), programsFound, searchMs, searchNs, leaveOneOut: loo },
    kept: { programs: kept.programs, patterns: kept.patterns, minSupport: kept.minSupport, keepBy: kept.keepBy, rankBy: kept.rankBy, invariant: kept.invariant, levels: I.LEVELS, store: rel(STORE), storeSha256: storeSha, storeBytes: Buffer.byteLength(storeText) },
    heldOut: { n: heldRecs.length, answered, right, share: r4(right / heldRecs.length), answeredShare: r4(answered / heldRecs.length), precision: r4(answered ? right / answered : null), rightFollowingChain: rightChain, byLevel, bar: 1 },
    control: { placebo: { seed: PLACEBO_SEED, what: 'the same kept programs, each level\'s pattern-to-programs map shuffled', answered: pAns, right: pRight, share: r4(pRight / heldRecs.length) }, templateRow: { file: 'bench/verdicts/ns.json', at: nsv.at, n: tpl.n, subToken: tpl.subToken, share: tpl.share, right: tpl.subTokenCorrect }, emptyBracket: emptyD },
    timing: { repeats: reps, passes, programRun: runD, programRunBatchNs: dist(runBatch) },
    rows: heldRows.map((r) => ({ id: r.id, answered: r.answered, answer: r.answer, gold: r.gold, right: r.right, program: r.program, level: r.level, support: r.support, followsChain: r.followsChain ?? null })),
    peakRssMb: peak, wallMs: Date.now() - t0, writesOver100MB: false, printed: lines,
  };
  const file = path.join(VERDICTS, complete ? 'induce.json' : 'induce-partial.json');
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  console.log('wrote ' + rel(file));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
