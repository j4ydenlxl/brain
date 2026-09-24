// bench/native.mjs. THE NATIVE BAR (Board 11, item "native"): the ask path answers a factual
// question from what the organism holds, MEMORY FIRST, and a question it has answered before in
// ONE table lookup (memory/direct.mjs), with no model call.
//
// Two modes.
//
//   --before   run against the ask() path AS IT STANDS, before the item's change lands: the
//              internal suite tally (the 725 of tasks/index.mjs SUITES, the same loop bench/tasks.mjs
//              prints, without writing its verdict), the same 725 questions asked THROUGH ask()
//              with every exact answer recorded by id, and the 200 held-out wiki questions through
//              ask(). Writes bench/verdicts/native-before-partial.json (isTheBar false), with the
//              sha256 of act/prompt.mjs and memory/knowledge.mjs so the file says which code it ran.
//
//   (default)  THE BAR, after the change:
//              (1) FILL a direct table: every suite question ask() answers with provenance exact,
//                  and the knowledge tier's answer to "What is <title>?" for every article title of
//                  the store (2 worker threads, memory/direct.mjs fillFromStore). The table is saved,
//                  read back and compared slot for slot (in the system temp directory, removed after).
//                  It is handed to ask() as opts.direct. The store directory is not this item's, so
//                  the bar does not write ask()'s default table there; --persist does, when its owner
//                  wants the direct step on for every ask of that store.
//              (2) ASK the 200 held-out first sentence facts bench/knowledge.mjs draws THROUGH
//                  ask(): recall@1 with provenance memory or direct, the mean microseconds of the
//                  answers that made no model call, the direct hit share, against three nulls: the
//                  title alone (bench/knowledge.mjs nullAnswers), ask() with the tier and the table
//                  off, and a CONTROL table filled from every title EXCEPT the 200 drawn.
//              (3) TIME the table with process.hrtime.bigint over 1,000,000 lookups of stored keys
//                  (hits) and 1,000,000 of keys never stored (misses), and ask the held-out paraphrase
//                  shapes (who, which, define, "X is") through ask() for the hit share of each.
//              (4) THE SUITE AGAIN: the tasks tally, and the 725 through ask() with the table on and
//                  off; not one exact answer of the before run may be lost, by id.
//              (5) The semantic tier's byte budget: keys held and bytes at the default budget.
//              Writes bench/verdicts/native.json once, when every step above has printed.
//
// Two rulers, stated. The 200 drawn are bench/knowledge.mjs's draw (seed knowledge-draw-2026-09-23),
// the same records bench/recall.mjs graded; their first sentences were never ingested. Nothing in
// this item was tuned on them: the floor 0.2 was chosen by bench/recall.mjs --tune on the 428
// held-out records OUTSIDE the draw, and the development of the where/when locator and the direct
// keys used the titles of articles that are not held out.
//
// Offline: the model cell is provider 'null' (no socket; a model call is counted, never made).
//
//   node --max-old-space-size=6000 bench/native.mjs [--before] [--workers 2] [--lookups 1000000]
//        [--limit N (fill only the first N titles plus the draw: a narrow run, written -partial)]
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { isMainThread } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const VERDICTS = path.join(HERE, 'verdicts');
const BEFORE_FILE = path.join(VERDICTS, 'native-before-partial.json');
export const BAR = Object.freeze({ wiki: 200, share: 0.5, lookups: 1000000 });

const argv = process.argv.slice(2);
const flag = (name) => argv.includes('--' + name);
function arg(name, def) { const i = argv.indexOf('--' + name); return i === -1 ? def : argv[i + 1]; }
const pct = (x) => (100 * x).toFixed(1) + '%';
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const r4 = (x) => Math.round(x * 1e4) / 1e4;
const since = (t0) => Number(process.hrtime.bigint() - t0) / 1e3;
const peakMb = () => r1(process.resourceUsage().maxRSS / 1024);
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ------------------------------------------------------------------ the suite
/** The tasks tally, the loop bench/tasks.mjs prints, with the id of every item a suite got wrong. */
async function tasksTally() {
  const { SUITES } = await import('../tasks/index.mjs');
  const out = { n: 0, correct: 0, suites: {}, failures: [] };
  for (const s of SUITES) {
    const r = s.run({}).report;
    out.n += r.n; out.correct += r.correct;
    out.suites[s.name] = { n: r.n, correct: r.correct };
    for (const f of r.allFailures || r.failures || []) out.failures.push(s.name + ':' + (f.id ?? JSON.stringify(f).slice(0, 80)));
  }
  out.failures.sort();
  return out;
}

/** The suite questions of bench/answer.mjs buildQuestions, every item of the three suites (725). */
async function suiteQuestions() {
  const { buildQuestions } = await import('./answer.mjs');
  return buildQuestions({ tasksPerSuite: 1e9 }).filter((q) => q.source !== 'fixture');
}

function newBrain(Brain, attachMemory, name) {
  const brain = new Brain({ name, ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name });
  return brain;
}

/**
 * Ask every suite question through ask(). An answer is EXACT when solve() computed it: provenance
 * exact, or a direct hit whose entry was filled from an exact answer.
 */
async function askSuite(P, brain, qs, opts, gradeAnswer) {
  const rows = [];
  for (const q of qs) {
    const t0 = process.hrtime.bigint();
    const a = await P.ask(brain, q.q, opts);
    const us = since(t0);
    const g = gradeAnswer(a.text, q);
    const prov = a.provenance.answer;
    const exact = prov === 'exact' || (prov === 'direct' && a.provenance.source === 'exact');
    rows.push({ id: q.id, source: q.source, prov, exact, ok: g.ok, us, value: a.provenance.value ?? null });
  }
  const byProvenance = rows.reduce((m, x) => { m[x.prov] = (m[x.prov] || 0) + 1; return m; }, {});
  const exactCorrect = rows.filter((x) => x.exact && x.ok).map((x) => x.id).sort();
  return {
    n: rows.length, correct: rows.filter((x) => x.ok).length, exact: rows.filter((x) => x.exact).length,
    exactCorrect: exactCorrect.length, byProvenance,
    meanUs: r1(rows.reduce((s, x) => s + x.us, 0) / (rows.length || 1)),
    exactCorrectIds: exactCorrect,
    digest: crypto.createHash('sha256').update(exactCorrect.join('\n')).digest('hex').slice(0, 16),
    rows,
  };
}

// ------------------------------------------------------------------ the wiki draw
function summarizeWiki(rows) {
  const n = rows.length || 1;
  const native = rows.filter((x) => x.native);
  const us = native.map((x) => x.us).sort((a, b) => a - b);
  const q = (p) => (us.length ? r1(us[Math.floor(p * (us.length - 1))]) : null);
  const byProvenance = rows.reduce((m, x) => { m[x.provenance] = (m[x.provenance] || 0) + 1; return m; }, {});
  const counted = rows.filter((x) => x.ok && x.native && (x.provenance === 'memory' || x.provenance === 'direct'));
  return {
    n: rows.length, recallAt1: counted.length, recallAt1Share: r4(counted.length / n),
    correct: rows.filter((x) => x.ok).length, native: native.length, modelCalls: rows.filter((x) => !x.native).length,
    direct: rows.filter((x) => x.provenance === 'direct').length, directShare: r4(rows.filter((x) => x.provenance === 'direct').length / n),
    directCorrect: rows.filter((x) => x.provenance === 'direct' && x.ok).length,
    nativeMeanUs: us.length ? r1(us.reduce((s, x) => s + x, 0) / us.length) : null, nativeP50Us: q(0.5), nativeP95Us: q(0.95),
    abstained: rows.filter((x) => x.abstained).length, byProvenance,
  };
}

async function askWiki(P, brain, items, opts, gradeWiki, modelAsked) {
  const rows = [];
  for (const it of items) {
    const t0 = process.hrtime.bigint();
    const a = await P.ask(brain, it.q, opts);
    const us = since(t0);
    const g = gradeWiki(a.text, it.head);
    rows.push({ title: it.title, native: !modelAsked(a), ok: g.ok, abstained: g.abstained, us, provenance: a.provenance.answer, route: a.route, lookupNs: a.provenance.lookupNs ?? null, keyNs: a.provenance.keyNs ?? null, line: g.line, answerTitle: a.provenance.title ?? null, value: answerValue(a.text) });
  }
  return rows;
}

// The value of an answer line "answer [<tier> "<title>"]: <value>", or null.
function answerValue(text) {
  const ls = String(text ?? '').trim().split('\n'), l = ls[ls.length - 1];
  const i = l.indexOf('"]: ');
  return l.startsWith('answer [') && i >= 0 ? l.slice(i + 4) : null;
}

// Each item asked once per arm, the arms in an order that rotates with the item, so no arm is
// always the one that meets a cold cache.
async function askWikiArms(P, brain, items, arms, gradeWiki, modelAsked) {
  const names = Object.keys(arms), rows = Object.fromEntries(names.map((k) => [k, []]));
  for (let i = 0; i < items.length; i++) {
    for (let r = 0; r < names.length; r++) {
      const k = names[(i + r) % names.length];
      rows[k].push((await askWiki(P, brain, [items[i]], arms[k], gradeWiki, modelAsked))[0]);
    }
  }
  return rows;
}

// ------------------------------------------------------------------ --before
async function before(command) {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  say(`native --before: ${command}`);
  const P = await import('../act/prompt.mjs');
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  const { gradeAnswer } = await import('./answer.mjs');
  const { gradeWiki, modelAsked } = await import('./recall.mjs');
  const { drawHeldout, DRAW_SEED } = await import('./knowledge.mjs');
  const code = { prompt: sha(path.join(ROOT, 'act', 'prompt.mjs')), knowledge: sha(path.join(ROOT, 'memory', 'knowledge.mjs')), semantic: sha(path.join(ROOT, 'memory', 'semantic.mjs')) };
  say(`code: act/prompt.mjs sha256 ${code.prompt.slice(0, 16)}, memory/knowledge.mjs ${code.knowledge.slice(0, 16)}, memory/semantic.mjs ${code.semantic.slice(0, 16)}`);

  const tasks = await tasksTally();
  say(`tasks tally (the loop bench/tasks.mjs prints): ${tasks.correct}/${tasks.n} ${Object.entries(tasks.suites).map(([k, v]) => k + ' ' + v.correct + '/' + v.n).join(', ')}; wrong: ${tasks.failures.join(' ') || 'none'}`);

  const qs = await suiteQuestions();
  const brain = newBrain(Brain, attachMemory, 'native-before');
  const base = { provider: 'null', route: 'direct', spawn: false };
  await P.ask(brain, 'What is a question that no article answers?', base);
  const suite = await askSuite(P, brain, qs, base, gradeAnswer);
  say(`suite through ask(): ${suite.n} questions, correct ${suite.correct}, exact ${suite.exact}, exact and correct ${suite.exactCorrect} (ids digest ${suite.digest}), provenance ${JSON.stringify(suite.byProvenance)}, mean ${suite.meanUs} us`);

  const store = P.KNOWLEDGE_DIR;
  const { pool, drawn } = drawHeldout(store, BAR.wiki);
  const items = drawn.map((h) => ({ q: 'What is ' + h.title + '?', title: h.title, head: h.head }));
  const wikiRows = await askWiki(P, brain, items, { ...base, knowledge: store }, gradeWiki, modelAsked);
  const wiki = summarizeWiki(wikiRows);
  say(`wiki through ask(): ${wiki.n} of ${pool} held out (seed ${DRAW_SEED}); recall@1 with provenance memory or direct and no model call ${wiki.recallAt1}/${wiki.n} (${pct(wiki.recallAt1Share)}), native ${wiki.native}, model calls ${wiki.modelCalls}, native mean ${wiki.nativeMeanUs} us (p50 ${wiki.nativeP50Us}, p95 ${wiki.nativeP95Us}), provenance ${JSON.stringify(wiki.byProvenance)}`);
  say(`peak rss ${peakMb()} MB`);

  const statement = `Before the native item changed anything, the ask path of act/prompt.mjs (sha256 ${code.prompt.slice(0, 16)}) was run on one bare brain with the model cell offline. The tasks suites scored ${tasks.correct} of ${tasks.n}. The same ${suite.n} suite questions asked through ask() were answered exactly (provenance exact) ${suite.exact} times, ${suite.exactCorrect} of them correct. Of the ${wiki.n} held-out wiki questions of the knowledge bar's draw, ${wiki.recallAt1} were answered correctly at recall@1 with provenance memory and no model call, in a mean ${wiki.nativeMeanUs} microseconds per native answer. This is a baseline for bench/native.mjs, not the bar.`;
  const verdict = {
    at, command, node: process.version, isTheBar: false, statement, code,
    tasks, suite: { ...suite, rows: undefined }, wiki, wikiRows: wikiRows.map((x) => ({ title: x.title, ok: x.ok, native: x.native, provenance: x.provenance, us: r1(x.us) })),
    peakRssMb: peakMb(), printed: lines,
  };
  fs.mkdirSync(VERDICTS, { recursive: true });
  fs.writeFileSync(BEFORE_FILE, JSON.stringify(verdict, null, 2) + '\n');
  console.log(`wrote ${rel(BEFORE_FILE)}`);
  P.closeKnowledge();
}

// ------------------------------------------------------------------ the bar
function lostExact(beforeIds, after) {
  const have = new Set(after.exactCorrectIds);
  return beforeIds.filter((id) => !have.has(id));
}

// Two tables are the same table: every slot, every column, every string.
function sameTable(a, b) {
  if (a.cap !== b.cap || a.n !== b.n) return false;
  const eq = (x, y) => x.byteLength === y.byteLength && Buffer.compare(Buffer.from(x.buffer, x.byteOffset, x.byteLength), Buffer.from(y.buffer, y.byteOffset, y.byteLength)) === 0;
  const n = a.n;
  if (!eq(a.kh, b.kh) || !eq(a.kl, b.kl) || !eq(a.vh, b.vh) || !eq(a.vl, b.vl) || !eq(a.ref, b.ref)) return false;
  if (!eq(a.src.subarray(0, n), b.src.subarray(0, n)) || !eq(a.conf.subarray(0, n), b.conf.subarray(0, n)) || !eq(a.item.subarray(0, n), b.item.subarray(0, n))) return false;
  for (let i = 0; i < n; i++) if (a.answers[i] !== b.answers[i] || a.titles[i] !== b.titles[i] || a.notes[i] !== b.notes[i]) return false;
  return true;
}

/**
 * THE MEASURED LOOP: n lookups of keys the table holds (drawn uniformly over its occupied slots)
 * and n of keys it does not (a random 64 bit fold and a random 64 bit verifier, which is what the
 * fold of a word set never stored is), each timed whole with process.hrtime.bigint, reps times,
 * hits and misses interleaved, beside the same loop with the lookup taken out.
 */
function timeTable(table, n, RNG, reps = 3) {
  const occ = new Int32Array(table.n);
  let m = 0;
  for (let s = 0; s < table.cap; s++) if (table.ref[s] >= 0) occ[m++] = s;
  const rng = new RNG('native-lookups-2026-09-24');
  const H = new Uint32Array(4 * n), M = new Uint32Array(4 * n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const s = occ[rng.u32() % m];
    H[j] = table.kh[s]; H[j + 1] = table.kl[s]; H[j + 2] = table.vh[s]; H[j + 3] = table.vl[s];
    M[j] = rng.u32(); M[j + 1] = rng.u32(); M[j + 2] = rng.u32(); M[j + 3] = rng.u32();
  }
  let hitsFound = 0, missesFound = 0;
  for (let j = 0; j < 4 * n; j += 4) {
    if (table.lookup(H[j], H[j + 1], H[j + 2], H[j + 3]) >= 0) hitsFound++;
    if (table.lookup(M[j], M[j + 1], M[j + 2], M[j + 3]) >= 0) missesFound++;
  }
  const loop = (K) => { let acc = 0; const t0 = process.hrtime.bigint(); for (let j = 0; j < K.length; j += 4) acc += table.lookup(K[j], K[j + 1], K[j + 2], K[j + 3]); return { ns: Number(process.hrtime.bigint() - t0), acc }; };
  const bare = (K) => { let acc = 0; const t0 = process.hrtime.bigint(); for (let j = 0; j < K.length; j += 4) acc += (K[j] ^ K[j + 1] ^ K[j + 2] ^ K[j + 3]) & 1; return { ns: Number(process.hrtime.bigint() - t0), acc }; };
  const hit = [], miss = [], empty = [];
  let sink = 0;
  for (let r = 0; r < reps; r++) {
    const a = loop(H), b = loop(M), c = bare(H);
    hit.push(a.ns / n); miss.push(b.ns / n); empty.push(c.ns / n); sink += a.acc + b.acc + c.acc;
  }
  const PN = Math.min(n, 100000);
  let hp = 0, mp = 0;
  for (let j = 0; j < 4 * PN; j += 4) {
    hp += table.probe({ hi: H[j], lo: H[j + 1], vh: H[j + 2], vl: H[j + 3] }).probes;
    mp += table.probe({ hi: M[j], lo: M[j + 1], vh: M[j + 2], vl: M[j + 3] }).probes;
  }
  const med = (xs) => xs.slice().sort((x, y) => x - y)[xs.length >> 1];
  return {
    lookups: n, reps, hitNs: hit.map(r2), missNs: miss.map(r2), emptyLoopNs: empty.map(r2),
    hitNsMedian: r2(med(hit)), missNsMedian: r2(med(miss)), emptyLoopNsMedian: r2(med(empty)),
    hitsFound, missesFound, meanProbesHit: r4(hp / PN), meanProbesMiss: r4(mp / PN), probeSample: PN,
    slots: table.cap, entries: table.n, load: r4(table.n / table.cap), sink,
  };
}

async function bar(command) {
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();
  const limit = arg('limit', null) === null ? null : Math.max(0, parseInt(arg('limit'), 10) || 0);
  const lookups = Math.max(1000, parseInt(arg('lookups', String(BAR.lookups)), 10) || BAR.lookups);
  const workers = Math.max(1, Math.min(2, parseInt(arg('workers', '2'), 10) || 2));
  const semMb = Number(arg('semantic-mb', '256'));
  const narrow = limit !== null || lookups < BAR.lookups;
  say(`native: ${command}`);
  if (!fs.existsSync(BEFORE_FILE)) throw new Error('native: ' + rel(BEFORE_FILE) + ' is missing; run node bench/native.mjs --before on the code as it stood');
  const pre = JSON.parse(fs.readFileSync(BEFORE_FILE, 'utf8'));
  const os = await import('node:os');
  const P = await import('../act/prompt.mjs');
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  const { gradeAnswer } = await import('./answer.mjs');
  const { gradeWiki, modelAsked } = await import('./recall.mjs');
  const { drawHeldout, nullAnswers, DRAW_SEED } = await import('./knowledge.mjs');
  const D = await import('../memory/direct.mjs');
  const K = await import('../memory/knowledge.mjs');
  const { RNG } = await import('../core/rng.mjs');
  const { SemanticMemory } = await import('../memory/semantic.mjs');
  const code = { prompt: sha(path.join(ROOT, 'act', 'prompt.mjs')), knowledge: sha(path.join(ROOT, 'memory', 'knowledge.mjs')), semantic: sha(path.join(ROOT, 'memory', 'semantic.mjs')), direct: sha(path.join(ROOT, 'memory', 'direct.mjs')) };
  say(`code: act/prompt.mjs sha256 ${code.prompt.slice(0, 16)}, memory/knowledge.mjs ${code.knowledge.slice(0, 16)}, memory/semantic.mjs ${code.semantic.slice(0, 16)}, memory/direct.mjs ${code.direct.slice(0, 16)}`);
  say(`before (${rel(BEFORE_FILE)}, ${pre.at}, act/prompt.mjs ${pre.code.prompt.slice(0, 16)}${pre.code.prompt === code.prompt ? ', THE SAME CODE AS NOW' : ', not the code now'}): tasks ${pre.tasks.correct}/${pre.tasks.n}, suite exact and correct ${pre.suite.exactCorrect} (digest ${pre.suite.digest}), wiki recall@1 ${pre.wiki.recallAt1}/${pre.wiki.n}`);

  // (1) the suite as the bar requires it: the tasks tally, and the 725 through ask() with the table off
  const tasks = await tasksTally();
  const tasksSame = tasks.correct === pre.tasks.correct && tasks.n === pre.tasks.n && JSON.stringify(tasks.failures) === JSON.stringify(pre.tasks.failures);
  say(`tasks tally: before ${pre.tasks.correct}/${pre.tasks.n}, after ${tasks.correct}/${tasks.n} (${Object.entries(tasks.suites).map(([k, v]) => k + ' ' + v.correct + '/' + v.n).join(', ')}); wrong after: ${tasks.failures.join(' ') || 'none'}; ${tasksSame ? 'unchanged' : 'CHANGED'}`);
  const qs = await suiteQuestions();
  const brain = newBrain(Brain, attachMemory, 'native-bar');
  const base = { provider: 'null', route: 'direct', spawn: false };
  await P.ask(brain, 'What is a question that no article answers?', { ...base, direct: false });
  const suiteOff = await askSuite(P, brain, qs, { ...base, direct: false }, gradeAnswer);
  const lostOff = lostExact(pre.suite.exactCorrectIds, suiteOff);
  say(`suite through ask(), direct step off: exact ${suiteOff.exact}, exact and correct ${suiteOff.exactCorrect} (digest ${suiteOff.digest}), lost against before ${lostOff.length}, mean ${suiteOff.meanUs} us`);

  // (2) the fill: the suite's exact answers, then the tier's answer for every title
  const suiteT = new D.DirectTable({ capacity: 2048 });
  const suiteFill = await askSuite(P, brain, qs, { ...base, direct: suiteT, learnDirect: true }, gradeAnswer);
  const sc = suiteT.counts();
  say(`fill, suite: ${suiteFill.n} asked through ask() with a learning table: ${sc.exact} exact entries, ${sc.memory} memory entries, fold collisions ${suiteT.stats.foldCollisions}, exact and correct ${suiteFill.exactCorrect}`);
  const ks = K.KnowledgeStore.open(P.KNOWLEDGE_DIR);
  const floor = P.KNOWLEDGE.floor;
  const to = limit === null ? ks.A : Math.min(ks.A, limit);
  const { pool, drawn } = drawHeldout(P.KNOWLEDGE_DIR, BAR.wiki);
  const f0 = Date.now();
  let nextPct = 10;
  const cols = await D.fillFromStore({
    storeDir: P.KNOWLEDGE_DIR, pool: P.KNOWLEDGE.pool, from: 0, to, workers, chunk: 1000,
    onProgress: (done, total, entries) => {
      const p = (100 * done) / total;
      if (p >= nextPct) { say(`  fill ${done}/${total} titles, ${entries} entries, ${((Date.now() - f0) / 1000).toFixed(1)} s`); while (nextPct <= p) nextPct += 10; }
    },
  });
  const meta = D.bindingOf(ks.meta, floor);
  const drawnCanon = new Set(drawn.map((h) => K.normTitle(h.title)));
  const full = D.tableFromColumns(cols, { meta, exactFrom: suiteT });
  const control = D.tableFromColumns(cols, { meta, exactFrom: suiteT, keep: (i) => !drawnCanon.has(K.normTitle(cols.asked[i])) });
  if (limit !== null) for (const h of drawn) { const e = D.titleEntry(ks, h.title, P.KNOWLEDGE.pool); if (e) full.set(D.factKey(h.title, 'what'), { source: 'memory', ...e }); }
  let aboveFloor = 0;
  for (let i = 0; i < full.n; i++) if (full.src[i] === 1 && full.conf[i] >= floor) aboveFloor++;
  // What a shared fold is: the same question twice (same verifier, the entry replaced), two
  // wordings of one bag of title words (the verifier tells them apart), or two different bags,
  // which is the only true collision of the 64 bit fold.
  const folds = new Map(), shared = { sameQuestion: 0, sameBag: 0, differentBags: 0 };
  for (let i = 0; i < cols.n; i++) {
    const f = cols.keys[4 * i] + ':' + cols.keys[4 * i + 1], v = cols.keys[4 * i + 2] + ':' + cols.keys[4 * i + 3];
    const bag = K.titleWords(cols.asked[i]).slice().sort().join(' ');
    const prev = folds.get(f);
    if (!prev) { folds.set(f, [{ v, bag }]); continue; }
    if (prev.some((p) => p.v === v)) shared.sameQuestion++;
    else if (prev.some((p) => p.bag === bag)) shared.sameBag++;
    else shared.differentBags++;
    prev.push({ v, bag });
  }
  folds.clear();
  const inFull = drawn.filter((h) => full.get(D.factKey(h.title, 'what')) >= 0).length;
  const inControl = drawn.filter((h) => control.get(D.factKey(h.title, 'what')) >= 0).length;
  const fb = full.bytes(), fc = full.counts();
  say(`fill, wiki: ${to} of ${ks.A} titles on ${workers} worker threads in ${(cols.ms / 1000).toFixed(1)} s, ${cols.n} answered by the tier; table ${fc.entries} entries (${fc.exact} exact, ${fc.memory} memory, ${aboveFloor} memory at or above the floor ${floor}), ${full.cap} slots, ${fb.typed} typed bytes + ${fb.strings} string bytes, fold collisions ${full.stats.foldCollisions}, probe collisions ${full.stats.probeCollisions}, replaced ${full.stats.replaced}`);
  say(`shared folds among the ${cols.n} filled: ${shared.sameQuestion} the same question again, ${shared.sameBag} another wording of the same title words (told apart by the verifier), ${shared.differentBags} between different word sets (a true 64 bit fold collision)`);
  say(`drawn titles in the table: ${inFull}/${drawn.length}; in the control table (every title but the drawn): ${inControl}/${drawn.length}`);
  const tableFile = path.join(os.tmpdir(), `native-direct-${process.pid}.bin`);
  let saved = null, roundTrip = false;
  try {
    saved = full.save(tableFile);
    roundTrip = sameTable(full, D.DirectTable.load(tableFile));
  } finally {
    fs.rmSync(tableFile, { force: true });
    fs.rmSync(tableFile + '.tmp', { force: true });
  }
  say(`save and load: ${saved.bytes} bytes on disk, read back ${roundTrip ? 'identical in every slot, column and string' : 'DIFFERENT'} (temp file removed)`);
  if (flag('persist')) {
    const mem = D.tableFromColumns(cols, { meta });
    const file = path.join(P.KNOWLEDGE_DIR, P.DIRECT_FILE);
    const w = mem.save(file);
    P.resetDirect();
    say(`--persist: wrote ${mem.n} memory entries, ${w.bytes} bytes, to ${file}`);
  }

  // (3) the 200 through ask(): the table, the tier alone, the control table, nothing
  const items = drawn.map((h) => ({ q: 'What is ' + h.title + '?', title: h.title, head: h.head }));
  const kdir = P.KNOWLEDGE_DIR;
  // One unrecorded pass through the tier first, so no arm pays for the store's first reads of an
  // item: the first run of this bench let the tier arm meet them for 3 items in 4 (rotation alone
  // does not balance which arm reads the store first) and its mean was twice the control arm's.
  const w0 = process.hrtime.bigint();
  for (const it of items) await P.ask(brain, it.q, { ...base, knowledge: kdir, direct: false });
  say(`warm: ${items.length} unrecorded asks through the tier alone in ${r1(since(w0) / 1000)} ms, before the four arms`);
  const tier0 = { ...P.DIRECT_TIER };
  const arms = await askWikiArms(P, brain, items, {
    direct: { ...base, knowledge: kdir, direct: full },
    tier: { ...base, knowledge: kdir, direct: false },
    control: { ...base, knowledge: kdir, direct: control },
    none: { ...base, knowledge: false, direct: false },
  }, gradeWiki, modelAsked);
  const tier1 = { ...P.DIRECT_TIER };
  const S = Object.fromEntries(Object.entries(arms).map(([k, rows]) => [k, summarizeWiki(rows)]));
  const titleAlone = drawn.filter((h) => { const a = nullAnswers(h.title)[0]; return !!a && K.answerMatches(a.words, h.head); }).length;
  let agree = 0, directRows = 0;
  arms.direct.forEach((x, i) => { if (x.provenance !== 'direct') return; directRows++; const y = arms.tier[i]; if (x.value === y.value && x.answerTitle === y.answerTitle && x.ok === y.ok) agree++; });
  const hitRows = arms.direct.filter((x) => x.provenance === 'direct');
  const hitUs = hitRows.map((x) => x.us).sort((a, b) => a - b);
  const hitLookupNs = hitRows.map((x) => x.lookupNs).sort((a, b) => a - b);
  const hitKeyNs = hitRows.map((x) => x.keyNs).sort((a, b) => a - b);
  const mean = (xs) => (xs.length ? r1(xs.reduce((s, x) => s + x, 0) / xs.length) : null);
  const mid = (xs) => (xs.length ? r1(xs[xs.length >> 1]) : null);
  const line = (k, s) => `${k}: recall@1 memory or direct, no model call ${s.recallAt1}/${s.n} (${pct(s.recallAt1Share)}); direct ${s.direct} (${pct(s.directShare)}), of them correct ${s.directCorrect}; native ${s.native}, model calls ${s.modelCalls}; native mean ${s.nativeMeanUs} us (p50 ${s.nativeP50Us}, p95 ${s.nativeP95Us}); provenance ${JSON.stringify(s.byProvenance)}`;
  say(`wiki: ${items.length} of ${pool} held out (seed ${DRAW_SEED}), asked "What is <title>?" through ask(), four arms interleaved`);
  say('  ' + line('direct table', S.direct));
  say('  ' + line('tier alone (direct off)', S.tier));
  say('  ' + line('control table (drawn titles left out)', S.control));
  say('  ' + line('null: tier and table off', S.none));
  say(`  null: the title alone (bench/knowledge.mjs nullAnswers) ${titleAlone}/${drawn.length}`);
  say(`  direct hits agree with the tier alone (same answer, same article, same grade): ${agree}/${directRows}`);
  say(`  direct hits through ask(): mean ${mean(hitUs)} us a whole ask (p50 ${mid(hitUs)}); lookup ${mean(hitLookupNs)} ns mean (p50 ${mid(hitLookupNs)}), key ${mean(hitKeyNs)} ns mean (p50 ${mid(hitKeyNs)}), as ask() printed them`);
  say(`  direct step counters over the four arms: asked ${tier1.asked - tier0.asked}, hits ${tier1.hits - tier0.hits}, misses ${tier1.misses - tier0.misses}, skipped ${tier1.skipped - tier0.skipped}`);

  // the other factual shapes of the same 200, table on
  const SHAPES = [['who', (t) => 'Who is ' + t + '?'], ['which', (t) => 'Which is ' + t + '?'], ['define', (t) => 'Define ' + t], ['x-is', (t) => t + ' is?'], ['meaning', (t) => 'What does ' + t + ' mean?']];
  const shapes = {};
  for (const [name, f] of SHAPES) {
    const rows = await askWiki(P, brain, drawn.map((h) => ({ q: f(h.title), title: h.title, head: h.head })), { ...base, knowledge: kdir, direct: full }, gradeWiki, modelAsked);
    const s = summarizeWiki(rows);
    shapes[name] = { recallAt1: s.recallAt1, direct: s.direct, directShare: s.directShare, native: s.native, nativeMeanUs: s.nativeMeanUs, byProvenance: s.byProvenance };
    say(`  shape ${name} ("${f('X')}"): direct ${s.direct}/${s.n} (${pct(s.directShare)}), recall@1 memory or direct ${s.recallAt1}/${s.n}, native mean ${s.nativeMeanUs} us`);
  }

  // (4) the measured loop
  const timing = timeTable(full, lookups, RNG, 3);
  say(`direct table, ${timing.lookups} lookups a run, ${timing.reps} runs, process.hrtime.bigint around each whole run: ns per hit ${timing.hitNs.join(' / ')} (median ${timing.hitNsMedian}), ns per miss ${timing.missNs.join(' / ')} (median ${timing.missNsMedian}), the same loop without the lookup ${timing.emptyLoopNs.join(' / ')} ns; hit keys found ${timing.hitsFound}/${timing.lookups}, miss keys found ${timing.missesFound}/${timing.lookups}; mean probes ${timing.meanProbesHit} a hit, ${timing.meanProbesMiss} a miss (${timing.probeSample} sampled); ${timing.entries} entries in ${timing.slots} slots, load ${timing.load}`);

  // (5) the suite again, with the full table on (its exact entries answer by text key)
  const suiteOn = await askSuite(P, brain, qs, { ...base, direct: full }, gradeAnswer);
  const lostOn = lostExact(pre.suite.exactCorrectIds, suiteOn);
  say(`suite through ask(), direct step on (the full table): exact ${suiteOn.exact}, exact and correct ${suiteOn.exactCorrect} (digest ${suiteOn.digest}), provenance ${JSON.stringify(suiteOn.byProvenance)}, lost against before ${lostOn.length}${lostOn.length ? ' (' + lostOn.slice(0, 10).join(' ') + ')' : ''}, mean ${suiteOn.meanUs} us`);

  // (6) the semantic tier's byte budget
  const sem = new SemanticMemory({ budgetMb: semMb });
  const semLine = sem.budget();
  say(`semantic tier at its declared budget (--semantic-mb ${semMb}): ${semLine.line}`);
  const tiny = new SemanticMemory({ budgetMb: 1, log: (l) => say('  budget evicts: ' + l) });
  const want = tiny.capacity + 16;
  for (let a = 0; a < want; a++) tiny.learn('knowledge:' + ks.title(a), K.keyVector(K.titleWords(ks.title(a))));
  const tinyLine = tiny.budget();
  say(`semantic tier at a 1 MB budget after ${want} keys learned: ${tinyLine.line}`);

  // the verdict
  const need = Math.ceil(BAR.share * BAR.wiki);
  const met = {
    share: S.direct.n === BAR.wiki && S.direct.recallAt1 >= need,
    suite: tasksSame && lostOff.length === 0 && lostOn.length === 0,
    ns: timing.lookups >= BAR.lookups && Number.isFinite(timing.hitNsMedian) && timing.hitsFound === timing.lookups,
  };
  const barMet = met.share && met.suite && met.ns;
  say(`BAR: recall@1 memory or direct ${S.direct.recallAt1}/${S.direct.n} against ${need} needed: ${met.share ? 'met' : 'MISSED'}; suite unchanged (tasks tally, and not one exact answer lost with the table off or on): ${met.suite ? 'met' : 'MISSED'}; ns per direct hit from a measured loop of ${timing.lookups}: ${timing.hitNsMedian} ns ${met.ns ? 'printed' : 'MISSED'}; ${barMet ? 'BAR MET' : 'BAR NOT MET'}${narrow ? ' (a narrow run: written -partial)' : ''}`);
  const peak = peakMb();
  say(`peak rss ${peak} MB (the whole process, fill workers included)`);

  const statement = `The ask path of act/prompt.mjs now tries a direct table first and the knowledge tier before any model cell. `
    + `On the ${S.direct.n} held-out first-sentence facts of the knowledge bar's draw (seed ${DRAW_SEED}), asked through ask() with the model cell offline, ${S.direct.recallAt1} were answered correctly at recall@1 with provenance memory or direct and no model call (${pct(S.direct.recallAt1Share)}, the bar is ${need}); ${S.direct.direct} came from the direct table in one lookup, and ${agree} of those ${directRows} gave the answer the tier alone gave. `
    + `The same questions scored ${S.tier.recallAt1} with the tier alone, ${S.control.recallAt1} with a control table that holds every title but the drawn ones (${S.control.direct} direct hits), ${S.none.recallAt1} with the tier and the table off, and ${titleAlone} when the answer is the title's own last word. `
    + `The table memoises the tier: it was filled by asking the tier "What is <title>?" for ${to} titles, the drawn titles among them, and none of the hidden sentences was ever in the store. `
    + `After one unrecorded warm pass, native answers took a mean ${S.direct.nativeMeanUs} microseconds a whole ask with the table on, ${S.tier.nativeMeanUs} with the tier alone and ${S.control.nativeMeanUs} with the control table. `
    + `Over ${timing.lookups} lookups a run the table took a median ${timing.hitNsMedian} ns a hit and ${timing.missNsMedian} ns a miss, measured with process.hrtime.bigint on a shared machine. `
    + `The tasks suites scored ${pre.tasks.correct} of ${pre.tasks.n} before and ${tasks.correct} of ${tasks.n} after, and of the ${pre.suite.exactCorrect} suite questions ask() answered exactly and correctly before the change, ${lostOff.length} were lost with the table off and ${lostOn.length} with it on. `
    + `The semantic tier is now bounded by a declared ${r1(semLine.budgetBytes / 1048576)} MB byte budget, room for ${semLine.capacity} named keys, instead of 4,096 keys.`;
  const file = path.join(VERDICTS, narrow ? 'native-partial.json' : 'native.json');
  const verdict = {
    at, command, node: process.version, isTheBar: !narrow, barMet, met, statement,
    rulers: {
      bar: `the ${BAR.wiki} held-out records bench/knowledge.mjs draws by seed ${DRAW_SEED} (their first sentences never ingested), and the ${suiteOff.n} suite questions of bench/answer.mjs buildQuestions`,
      development: 'the confidence floor 0.2 was chosen by bench/recall.mjs --tune on the 428 held-out records outside the draw; the where and when locator, the factual shapes and the direct keys were developed on titles that are not held out and on the suite; the draw was read only by bench/native.mjs --before and by this run',
    },
    code, before: { file: rel(BEFORE_FILE), at: pre.at, tasks: { correct: pre.tasks.correct, n: pre.tasks.n, failures: pre.tasks.failures }, suite: { exact: pre.suite.exact, exactCorrect: pre.suite.exactCorrect, digest: pre.suite.digest }, wiki: pre.wiki },
    tasks, tasksSame,
    suite: { off: { ...suiteOff, rows: undefined, exactCorrectIds: undefined }, fill: { ...suiteFill, rows: undefined, exactCorrectIds: undefined }, on: { ...suiteOn, rows: undefined, exactCorrectIds: undefined }, lostOff, lostOn },
    fill: { titles: to, of: ks.A, workers, ms: cols.ms, answered: cols.n, entries: fc, aboveFloor, floor, slots: full.cap, bytes: fb, stats: full.stats, sharedFolds: shared, suiteEntries: sc, drawnInTable: inFull, drawnInControl: inControl, savedBytes: saved.bytes, roundTrip },
    wiki: { n: items.length, pool, drawSeed: DRAW_SEED, arms: S, titleAlone, agree, directRows, hitUs: { mean: mean(hitUs), p50: mid(hitUs) }, hitLookupNs: { mean: mean(hitLookupNs), p50: mid(hitLookupNs) }, hitKeyNs: { mean: mean(hitKeyNs), p50: mid(hitKeyNs) }, counters: { asked: tier1.asked - tier0.asked, hits: tier1.hits - tier0.hits, misses: tier1.misses - tier0.misses, skipped: tier1.skipped - tier0.skipped } },
    shapes, timing, semantic: { declared: { ...semLine, line: undefined }, tiny: { ...tinyLine, line: undefined }, lines: [semLine.line, tinyLine.line] },
    rows: arms.direct.map((x, i) => ({ title: x.title, ok: x.ok, provenance: x.provenance, us: r1(x.us), lookupNs: x.lookupNs, tier: arms.tier[i].provenance, tierOk: arms.tier[i].ok, control: arms.control[i].provenance })),
    peakRssMb: peak, printed: lines,
  };
  fs.mkdirSync(VERDICTS, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(verdict, null, 2) + '\n');
  console.log(`wrote ${rel(file)}`);
  ks.close();
  P.closeKnowledge();
}

// ------------------------------------------------------------------ main
async function main() {
  const command = 'node ' + ['bench/native.mjs', ...argv].join(' ');
  if (flag('before')) return before(command);
  return bar(command);
}

if (isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => { console.error(e && e.stack || e); process.exitCode = 1; });
}
