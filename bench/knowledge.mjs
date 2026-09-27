#!/usr/bin/env node
// bench/knowledge.mjs. THE KNOWLEDGE BAR (Board 9, his P10: "should know everything that exists or existed").
//
//   node bench/knowledge.mjs                 ingest the whole dump, draw 200 held-out facts, grade, write the verdict
//   node bench/knowledge.mjs --limit 20000   a smoke run of the first 20000 articles (writes knowledge-partial.json)
//   options: --workers N (bz2 decode threads, default 4), --store DIR, --dump FILE, --n 200, --probe 0 (skip the tier probe)
//
// What it measures. tools/ingest-wiki.mjs streams the dump through its own bz2 reader into the
// knowledge tier (memory/knowledge.mjs). THE HELD-OUT RULE: a seeded mark on the title picks
// articles; a marked article whose first sentence is about its title and has a key noun phrase
// (knowledge.mjs keyNounPhrase) has that sentence hidden from the ingest. The bench draws `n` of
// them by seed, asks the tier "What is <title>?" and grades the key noun phrase answers it
// derives from what it recalled: recall@1 when the first answer holds the hidden sentence's head
// noun, recall@5 when one of the first five does (plural folded). The null arm is the title alone:
// its answers are the question's own words, last first. Mean ms per query is the recall time.
// The tier probe asks the organism's other memory kinds to hold the same title keys through their
// public APIs at growing counts and prints which of them holds at the ingested size.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hash32 } from '../core/rng.mjs';
import { ingest, DUMP_PATH, STORE_DIR } from '../tools/ingest-wiki.mjs';
import { KnowledgeStore, HELDOUT_DEFAULTS, normText, titleWords, answerMatches, keyVector, SIG_BITS } from '../memory/knowledge.mjs';

// board 19 builder: the split the bar was measured on (the gate's CONTAMINATION row needs an object).
// board 23 builder (item contamination-split): contaminated is decided from the grade's own leak
// count (gradeOne counts a hidden sentence the store returns, and excludes it from the answer):
// a count above 0 is the reason. Board 23 fix pass: when the caller passes the count (main() always
// does), null means the leak check gave no count, and an unmeasured count is never read as clean
// (heldOut.leaks says null and contaminated says why). A call that passes no count at all (the board 19
// planted case) states the construction rule: the ingest never writes a marked first sentence, so
// contaminated false, and heldOut.leakCheck says no count was passed.
/** What the knowledge bar developed on and what it graded: pure, from the draw size, the seed and the leak count. */
export function splitFor(opts = {}) {
  const passed = 'leaks' in opts;
  const leaks = Number.isInteger(opts.leaks) ? opts.leaks : null;
  return {
    development: { what: 'the ingested dump: every article tools/ingest-wiki.mjs streamed into the knowledge tier, with the marked first sentences left out' },
    heldOut: { what: 'the first sentences a seeded title mark hid from the ingest (notes/knowledge.md held-out rule), drawn by seed and never ingested', n: opts.n ?? null, seed: opts.seed ?? null, leaks, leakCheck: passed ? 'counted by the run' : 'not passed: the split states the construction rule (the ingest never writes a marked first sentence)' },
    contaminated: !passed
      ? false
      : leaks === null
        ? 'the leak check did not run, so the hidden first sentences are not known to be absent from the store'
        : leaks > 0
          ? leaks + ' hidden first sentences of the draw were found in the ingested store (excluded from the answers, but present)'
          : false,
  };
}

// board 23 builder (item contamination-split, fix pass): the store a run grades is the store it wrote.
// When --store names a directory other than the default (a scratch copy, so the shared store other
// benches read is never rewritten under them), the verdict carries both stores' content hashes: the
// same hash means the graded store is byte for byte bench/fixtures/wiki/store, which stays on disk.
/** A content hash of a store directory: sha256 over each file's name, size and bytes, in name order; null when it is absent. */
export function storeFingerprint(dir) {
  let names;
  try { names = fs.readdirSync(dir).filter((n) => fs.statSync(path.join(dir, n)).isFile()).sort(); } catch { return null; }
  const all = crypto.createHash('sha256');
  const buf = Buffer.allocUnsafe(1 << 22);
  const files = [];
  let bytes = 0;
  for (const name of names) {
    const one = crypto.createHash('sha256');
    const fd = fs.openSync(path.join(dir, name), 'r');
    let size = 0;
    try {
      let r;
      while ((r = fs.readSync(fd, buf, 0, buf.length, size)) > 0) { one.update(buf.subarray(0, r)); size += r; }
    } finally { fs.closeSync(fd); }
    const sha256 = one.digest('hex');
    all.update(name + '\0' + size + '\0' + sha256 + '\n');
    files.push({ name, bytes: size, sha256 });
    bytes += size;
  }
  return { sha256: all.digest('hex'), files: files.length, bytes, perFile: files };
}

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VERDICTS = path.join(HERE, 'verdicts');
export const DRAW_SEED = 'knowledge-draw-2026-09-23';
export const BAR = Object.freeze({ n: 200, msPerQuery: 50, fullDumpMinutes: 40 });

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i === -1 ? def : process.argv[i + 1]; }
const pct = (x) => (100 * x).toFixed(1) + '%';

/** The held-out records of a store, drawn by seed: ranked by hash32(seed, title), the first n. */
export function drawHeldout(storeDir, n, seed = DRAW_SEED) {
  const lines = fs.readFileSync(path.join(storeDir, 'heldout.jsonl'), 'utf8').split('\n').filter(Boolean);
  const all = lines.map((l) => JSON.parse(l));
  const ranked = all.map((h) => [hash32(seed + '\u0000' + h.title), h]).sort((a, b) => a[0] - b[0] || (a[1].title < b[1].title ? -1 : 1));
  return { pool: all.length, drawn: ranked.slice(0, n).map((x) => x[1]) };
}

/** The null arm: the answers the question itself offers, the title's words from the last. */
export function nullAnswers(title) { return titleWords(title).slice().reverse().map((w) => ({ np: w, words: [w] })); }

/** Grade one held-out record against the tier and the null arm. */
export function gradeOne(store, h) {
  const q = 'What is ' + h.title + '?';
  const hidden = normText(h.sentence);
  let leaks = 0;
  const r = store.answer(q, { exclude: (f) => { if (normText(f.text) === hidden) { leaks++; return true; } return false; } });
  const at = (list, k) => list.slice(0, k).some((a) => answerMatches(a.words, h.head));
  const nul = nullAnswers(h.title);
  return {
    title: h.title, gold: h.np, head: h.head, q,
    answer: r.answers[0]?.np ?? null, answerTitle: r.answers[0]?.title ?? null, answerKind: r.answers[0]?.kind ?? null,
    provenance: r.answers[0]?.provenance ?? null,
    r1: at(r.answers, 1), r5: at(r.answers, 5), n1: at(nul, 1), n5: at(nul, 5),
    answers: r.answers.length, ms: r.recall.ms, candidates: r.recall.candidates, leaks,
  };
}

/** Grade a draw. The first query of a fresh store pays for the JIT; one warm-up query on a title outside the draw is run and not counted. */
export function gradeDraw(store, drawn) {
  const warm = store.title(0);
  store.recall('What is ' + warm + '?');
  const rows = drawn.map((h) => gradeOne(store, h));
  const n = rows.length || 1;
  const mean = (f) => rows.reduce((s, x) => s + f(x), 0) / n;
  const ms = rows.map((x) => x.ms).sort((a, b) => a - b);
  return {
    rows,
    n: rows.length,
    recall1: mean((x) => (x.r1 ? 1 : 0)), recall5: mean((x) => (x.r5 ? 1 : 0)),
    null1: mean((x) => (x.n1 ? 1 : 0)), null5: mean((x) => (x.n5 ? 1 : 0)),
    answered: mean((x) => (x.answers > 0 ? 1 : 0)),
    meanMs: mean((x) => x.ms), p50Ms: ms[Math.floor(0.5 * (ms.length - 1))] ?? 0, p95Ms: ms[Math.floor(0.95 * (ms.length - 1))] ?? 0, maxMs: ms[ms.length - 1] ?? 0,
    leaks: rows.reduce((s, x) => s + x.leaks, 0),
    provenance: [...new Set(rows.map((x) => x.provenance).filter(Boolean))],
  };
}

// ------------------------------------------------------------------ the tier probe
/**
 * Put the title keys of the first N articles into each memory kind through its public API and
 * ask each for `queries` of them back. A kind HOLDS at the ingested size when it keeps every key
 * it was given, finds them (recall@1 of 1.0), and its per query time scaled to the ingested count
 * stays under the bar.
 */
export async function tierProbe(store, sizes, queries = 50) {
  const { SemanticMemory } = await import('../memory/semantic.mjs');
  const { EpisodicStore } = await import('../memory/episodic.mjs');
  await import('../cells/basic.mjs');
  const { createCell, runCell } = await import('../core/cell.mjs');
  const out = [];
  const A = store.A;
  for (const N0 of sizes) {
    const N = Math.min(N0, A);
    const keys = new Array(N), titles = new Array(N);
    for (let a = 0; a < N; a++) { titles[a] = store.title(a); keys[a] = keyVector(titleWords(titles[a])); }
    const qs = []; for (let j = 0; j < queries; j++) qs.push(Math.floor((j + 0.5) * N / queries));
    const row = { N, queries: qs.length, tiers: {} };
    const time = (f) => { const t = process.hrtime.bigint(); f(); return Number(process.hrtime.bigint() - t) / 1e6; };
    // semantic: learn(name, hv), recognize(hv).name
    {
      const sm = new SemanticMemory();
      const tIns = time(() => { for (let a = 0; a < N; a++) sm.learn('t' + a, keys[a]); });
      let hit = 0; const tq = time(() => { for (const a of qs) if (sm.recognize(keys[a]).name === 't' + a) hit++; });
      row.tiers.semantic = { capacity: sm.capacity, held: sm.size(), recall1: hit / qs.length, msPerQuery: tq / qs.length, msInsert: tIns, bytesPerKey: 8192 };
    }
    // memory.assoc: the cell kind, through runCell with key/value/query ports
    {
      const cell = createCell({ id: 'probe.assoc', kind: 'memory.assoc' });
      const ctx = {};
      const tIns = time(() => { for (let a = 0; a < N; a++) runCell(cell, [[{ sig: { kind: 'hv', data: keys[a] } }], [{ sig: { kind: 'event', data: { a } } }], []], ctx); });
      let hit = 0; const tq = time(() => { for (const a of qs) { const o = runCell(cell, [[], [], [{ sig: { kind: 'hv', data: keys[a] } }]], ctx); if (o[0]?.data?.hit && o[0].data.value.a === a) hit++; } });
      row.tiers.assoc = { capacity: cell.params.capacity, held: cell.state.keys.length, recall1: hit / qs.length, msPerQuery: tq / qs.length, msInsert: tIns, bytesPerKey: 8192 };
    }
    // episodic: append({key, value}), retrieve(query, {k: 1})
    {
      const ep = new EpisodicStore();
      const tIns = time(() => { for (let a = 0; a < N; a++) ep.append({ key: keys[a], value: { a }, t: a }); });
      let hit = 0; const tq = time(() => { for (const a of qs) { const r = ep.retrieve(keys[a], { k: 1 }); if (r[0]?.value?.a === a) hit++; } });
      row.tiers.episodic = { capacity: ep.maxEpisodes, held: ep.n, recall1: hit / qs.length, msPerQuery: tq / qs.length, msInsert: tIns, bytesPerKey: 8192 };
    }
    // knowledge: the same keys are already in it, all A of them; its title search is recall()'s first stage
    {
      let hit = 0; const tq = time(() => { for (const a of qs) { const r = store.recall('What is ' + titles[a] + '?', { k: 1 }); if (r.titles.some((t) => t.article === a)) hit++; } });
      row.tiers.knowledge = { capacity: null, held: A, recall1: hit / qs.length, msPerQuery: tq / qs.length, msInsert: null, bytesPerKey: SIG_BITS / 8 };
    }
    out.push(row);
  }
  // which holds at A: capacity at or above A, recall@1 of 1 at the largest N, and the per query
  // time scaled linearly from the largest N to A (the three dense kinds scan every key they hold)
  const last = out[out.length - 1], verdict = {};
  for (const [k, t] of Object.entries(last.tiers)) {
    const cap = t.capacity === null ? Infinity : t.capacity;
    const msAtA = k === 'knowledge' ? t.msPerQuery : t.msPerQuery * (A / Math.max(1, t.held));
    verdict[k] = { holds: cap >= A && t.held === (k === 'knowledge' ? A : last.N) && t.recall1 === 1 && msAtA < BAR.msPerQuery, capacity: t.capacity, heldOfN: t.held + '/' + last.N, recall1: t.recall1, msAtA, keyBytesAtA: t.bytesPerKey * A };
  }
  return { sizes: out, atArticles: A, verdict };
}

// ------------------------------------------------------------------------ main
async function main() {
  const limitArg = arg('limit', null);
  const limit = limitArg === null ? null : Number(limitArg);
  const workers = Number(arg('workers', 4));
  const store = path.resolve(arg('store', STORE_DIR));
  const dump = path.resolve(arg('dump', DUMP_PATH));
  const n = Number(arg('n', BAR.n));
  const probe = arg('probe', '1') !== '0';
  const every = limit ? Math.max(1, Math.floor(limit / 600)) : HELDOUT_DEFAULTS.every;
  const command = 'node bench/knowledge.mjs' + process.argv.slice(2).map((a) => ' ' + a).join('');
  const lines = [];
  const say = (s) => { lines.push(s); console.log(s); };
  const at = new Date().toISOString();

  say(`knowledge bar: ${command}`);
  say(`dump ${path.relative(path.join(HERE, '..'), dump)} (${fs.statSync(dump).size} bytes), store ${path.relative(path.join(HERE, '..'), store)}, ${limit ? '--limit ' + limit : 'the whole dump'}, held-out every ${every} by seed ${HELDOUT_DEFAULTS.seed}`);
  const rssBefore = process.memoryUsage().rss;
  let peakRss = rssBefore;
  const tick = setInterval(() => { peakRss = Math.max(peakRss, process.memoryUsage().rss); }, 500);
  let r;
  try {
    r = await ingest({ dump, store, limit: limit ?? Infinity, workers, heldout: { seed: HELDOUT_DEFAULTS.seed, every }, log: (s) => console.log(s) });
  } finally { clearInterval(tick); }
  peakRss = Math.max(peakRss, process.memoryUsage().rss);
  const c = r.counts;
  say(`ingest: ${c.articles} articles read (${r.complete ? 'the whole dump' : 'stopped at --limit'}) in ${r.seconds.toFixed(1)} s, ${(c.articles / r.seconds).toFixed(1)} articles/s; bz2 ${r.bz2.bytesIn} bytes in, ${r.bz2.bytesOut} out, ${r.bz2.streams} streams, ${workers} workers`);
  say(`held: ${c.held} articles with at least one fact, ${c.empty} empty, ${c.redirects} redirects skipped; ${r.facts} facts + ${r.titles} title items; breadth ${c.held}/${c.articles} = ${(c.held / c.articles).toFixed(4)}`);
  say(`bytes: ${r.disk.bytesPerArticle.toFixed(0)} disk bytes/article (${r.disk.bytes} total), ${r.memory.bytesPerArticle.toFixed(0)} memory bytes/article (${r.memory.bytes} resident); ingest peak RSS ${(peakRss / 1048576).toFixed(0)} MB`);
  let fullArithmetic;
  if (r.complete) fullArithmetic = `the whole dump ingested in ${(r.seconds / 60).toFixed(2)} min, under the ${BAR.fullDumpMinutes} min cap`;
  else {
    const frac = r.bz2.bytesIn / fs.statSync(dump).size;
    const est = r.seconds / Math.max(1e-9, frac);
    fullArithmetic = `read ${r.bz2.bytesIn} of ${fs.statSync(dump).size} compressed bytes (${pct(frac)}) in ${r.seconds.toFixed(1)} s, so the whole dump is ${r.seconds.toFixed(1)} / ${frac.toFixed(4)} = ${(est / 60).toFixed(1)} min`;
  }
  say(`full dump: ${fullArithmetic}`);
  say(`held-out: ${c.heldout} first sentences hidden (${c.heldoutIneligible} marked articles had no key noun phrase about their title)`);

  const ks = KnowledgeStore.open(store);
  const { pool, drawn } = drawHeldout(store, n);
  const g = gradeDraw(ks, drawn);
  say(`draw: ${g.n} of ${pool} held-out facts by seed ${DRAW_SEED}`);
  say(`recall@1 tier ${pct(g.recall1)} vs null (title alone) ${pct(g.null1)}; recall@5 tier ${pct(g.recall5)} vs null ${pct(g.null5)}; answered ${pct(g.answered)}; provenance ${g.provenance.join(',') || 'none'}`);
  say(`ms per query: mean ${g.meanMs.toFixed(2)}, p50 ${g.p50Ms.toFixed(2)}, p95 ${g.p95Ms.toFixed(2)}, max ${g.maxMs.toFixed(2)} at ${ks.A} articles (${ks.n} items); hidden sentences found in memory and excluded: ${g.leaks}`);
  for (const x of g.rows.filter((x) => x.r1).slice(0, 2).concat(g.rows.filter((x) => !x.r5).slice(0, 1))) say(`  e.g. ${JSON.stringify(x.q)} gold "${x.gold}" -> "${x.answer}" [${x.answerKind} of ${JSON.stringify(x.answerTitle)}, ${x.provenance}] ${x.r1 ? 'r@1' : x.r5 ? 'r@5' : 'miss'}`);

  let tp = null;
  if (probe) {
    tp = await tierProbe(ks, [1024, 4096, 16384]);
    for (const row of tp.sizes) say(`tier probe N=${row.N}: ` + Object.entries(row.tiers).map(([k, t]) => `${k} held ${t.held} r@1 ${t.recall1.toFixed(2)} ${t.msPerQuery.toFixed(2)} ms/q`).join('; '));
    say(`holds at ${tp.atArticles} articles: ` + Object.entries(tp.verdict).map(([k, v]) => `${k} ${v.holds ? 'HOLDS' : 'no'} (capacity ${v.capacity ?? 'disk'}, ${v.msAtA.toFixed(2)} ms/q scaled, ${(v.keyBytesAtA / 1048576).toFixed(1)} MB of keys)`).join('; '));
  }
  const residentOpen = ks.residentBytes();
  ks.close();

  // board 23 fix pass: the graded store's content hash, and the default store's when --store named another directory
  const posix = (p) => path.relative(path.join(HERE, '..'), p).split(path.sep).join('/');
  const defaultStore = path.resolve(STORE_DIR);
  const isDefault = path.resolve(store) === defaultStore;
  const fpRun = storeFingerprint(store);
  const fpDefault = isDefault ? fpRun : storeFingerprint(defaultStore);
  const sameAsDefault = fpRun && fpDefault ? fpRun.sha256 === fpDefault.sha256 : null;
  const storeRec = { dir: posix(store), isDefault, writtenByThisRun: true, fingerprint: fpRun, default: { dir: posix(defaultStore), fingerprint: isDefault ? 'the same directory' : fpDefault }, sameAsDefault };
  say(`store: this run wrote ${storeRec.dir} from the dump, ${fpRun ? fpRun.files + ' files, ' + fpRun.bytes + ' bytes, sha256 ' + fpRun.sha256 : 'absent'}; ${isDefault ? 'it is the default store' : 'the default store ' + storeRec.default.dir + ' is ' + (fpDefault ? fpDefault.files + ' files, ' + fpDefault.bytes + ' bytes, sha256 ' + fpDefault.sha256 : 'absent') + ': ' + (sameAsDefault ? 'the same bytes' : 'NOT the same bytes')}`);

  const full = r.complete;
  const checks = {
    ingestedTheDump: full,
    drew200: g.n >= BAR.n,
    beatsNullAt1: g.recall1 > g.null1,
    beatsNullAt5: g.recall5 > g.null5,
    under50ms: g.meanMs < BAR.msPerQuery,
  };
  const barMet = checks.ingestedTheDump && checks.drew200 && checks.beatsNullAt1 && checks.beatsNullAt5 && checks.under50ms;
  say(`bar: ${Object.entries(checks).map(([k, v]) => `${k} ${v ? 'yes' : 'NO'}`).join(', ')} -> ${barMet ? 'MET' : 'NOT MET'}`);

  const holds = tp ? Object.entries(tp.verdict).filter(([, v]) => v.holds).map(([k]) => k) : [];
  const statement = `The knowledge tier ingested ${full ? 'the whole' : 'the first ' + c.articles + ' articles of the'} Simple English Wikipedia dump (${c.articles} articles${full ? '' : ', ' + fullArithmetic}) at ${(c.articles / r.seconds).toFixed(1)} articles/s with a bz2 reader written for it, holding ${c.held} articles (breadth ${(c.held / c.articles).toFixed(4)}) as ${r.facts} facts at ${r.disk.bytesPerArticle.toFixed(0)} disk and ${r.memory.bytesPerArticle.toFixed(0)} memory bytes per article. On ${g.n} held-out first sentences drawn by seed, asked "What is <title>?", its first answer held the hidden key noun's head ${pct(g.recall1)} of the time and one of its first five ${pct(g.recall5)}, against ${pct(g.null1)} and ${pct(g.null5)} for the title alone, at a mean ${g.meanMs.toFixed(2)} ms per query over ${ks.A} articles. ${tp ? 'Of the organism\'s memory kinds asked to hold the same title keys, ' + (holds.length ? holds.join(' and ') + ' held at this scale' : 'none held') + '; semantic and assoc stop at their 4096 capacity and episodic at 65536.' : ''} ${isDefault ? 'The store graded is the default store.' : 'The store graded was written by this run to ' + storeRec.dir + ', so the shared store other benches read was never rewritten under them, and its ' + (fpRun ? fpRun.files + ' files and ' + fpRun.bytes + ' bytes' : 'content') + (sameAsDefault ? ' hash the same as ' : ' do NOT hash the same as ') + storeRec.default.dir + '.'} The bar ${barMet ? 'is met' : 'is not met'}.`;
  const verdict = {
    at, command, node: process.version, isTheBar: full, barMet, contaminated: null, statement,
    split: splitFor({ n: g.n, seed: DRAW_SEED, leaks: g.leaks }),
    store: storeRec,
    bar: { ...BAR, checks, met: barMet },
    machine: { platform: process.platform, cpus: os.cpus().length, totalMemMB: Math.round(os.totalmem() / 1048576) },
    dump: { file: path.basename(dump), bytes: fs.statSync(dump).size, source: 'https://dumps.wikimedia.org/simplewiki/latest/' + path.basename(dump), licence: 'CC BY-SA 4.0' },
    ingest: { complete: r.complete, limit: r.limit, seconds: r.seconds, articlesPerSecond: c.articles / r.seconds, counts: c, facts: r.facts, titles: r.titles, vocab: r.vocab, postings: r.postings, bz2: r.bz2, writerStats: r.writerStats, fullDumpArithmetic: fullArithmetic, peakRssMB: peakRss / 1048576 },
    breadth: { held: c.held, articlesInDump: full ? c.articles : null, articlesRead: c.articles, ratio: c.held / c.articles },
    bytes: { diskPerArticle: r.disk.bytesPerArticle, memoryPerArticle: r.memory.bytesPerArticle, disk: r.disk, residentOpen },
    heldout: { rule: 'seeded title mark (hash32(seed + NUL + title) % every == 0); first sentence hidden when it is about the title and has a key noun phrase; graded on the head noun, plural folded', seed: HELDOUT_DEFAULTS.seed, every, pool, drawSeed: DRAW_SEED },
    grade: { n: g.n, recall1: g.recall1, recall5: g.recall5, null1: g.null1, null5: g.null5, answered: g.answered, meanMs: g.meanMs, p50Ms: g.p50Ms, p95Ms: g.p95Ms, maxMs: g.maxMs, leaksExcluded: g.leaks, provenance: g.provenance },
    tierProbe: tp,
    rows: g.rows.map((x) => ({ title: x.title, gold: x.gold, head: x.head, answer: x.answer, from: x.answerTitle, kind: x.answerKind, r1: x.r1, r5: x.r5, n1: x.n1, n5: x.n5, ms: Number(x.ms.toFixed(3)) })),
    printed: lines,
  };
  // board 23 fix pass: the gate counts contaminated only when it is true, so a reason in the split is marked at the top level and said in the statement
  verdict.contaminated = typeof verdict.split.contaminated === 'string';
  if (verdict.contaminated) verdict.statement += ' Contaminated: ' + verdict.split.contaminated + '.';
  say(`split: contaminated ${verdict.contaminated ? verdict.split.contaminated : 'false'} (hidden sentences found in the store: ${g.leaks})`);
  fs.mkdirSync(VERDICTS, { recursive: true });
  const file = path.join(VERDICTS, full ? 'knowledge.json' : 'knowledge-partial.json');
  fs.writeFileSync(file, JSON.stringify(verdict, null, 1) + '\n');
  console.log(`wrote ${path.relative(path.join(HERE, '..'), file)} (isTheBar ${full})`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
