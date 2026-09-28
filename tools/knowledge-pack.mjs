#!/usr/bin/env node
// tools/knowledge-pack.mjs. THE KNOWLEDGE PACK (board 29, item cloud-cell; docs/VISION.md order 42
// clause (d), his 2026-09-16 "runs AI itself").
//
// Why it exists. GET https://dilation.dev/api/ask printed knowledge ready false, "no finished ingest
// at bench/fixtures/wiki/store": the store is 388,459,374 bytes on disk and bench/fixtures is never
// deployed, while a Vercel function bundle has a stated size limit (docs/research/cloud-cell.md cites
// the page). This tool writes a SMALLER store in the SAME format, one the reader in act/prompt.mjs
// (knowledgeReady, knowledgeStore) opens with no change, under a stated byte cap.
//
//   node tools/knowledge-pack.mjs --cap 200 [--rule core-rank] [--delete-after]
//        read bench/fixtures/wiki/store through act/prompt.mjs, write bench/fixtures/wiki/pack-200/,
//        measure it in a fresh child process, and merge its row into bench/verdicts/knowledge-pack.json
//   node tools/knowledge-pack.mjs --measure-full
//        the control: the same measurement on the full store, merged as the verdict's full row
//   node tools/knowledge-pack.mjs --dev --scratch DIR [--dev-caps 100,50]
//        the rule choice: every rule of RULES packed at each cap into DIR and graded on the held-out
//        records OUTSIDE the bar's draw (bench/recall.mjs tuningRecords), never on the draw; writes
//        bench/verdicts/knowledge-pack-dev-partial.json and deletes every pack it wrote
//   node tools/knowledge-pack.mjs --probe DIR|none
//        his five probe prompts (bench/site-ask.mjs HIS_PROBE) through ask() with the model cell off
//   options: --from DIR (the source store), --out DIR (the pack directory)
//
// THE RULE (one order over the store, the cap takes its longest prefix that fits):
//   cats-prior (the default, chosen by --dev on the records outside the draw, see DEFAULT_RULE)
//              the WHOLE store's category prior (catdir.bin, catheads.txt: 4,326,990 bytes) first,
//              then as cats-first. The prior is what the articles of each category are, counted by
//              the full ingest from every visible first sentence (never a held-out one), so a pack
//              that keeps an article's categories fact keeps what its category says it is, even
//              when the pack has no room for its first sentence.
//   cats-first every article's title and categories facts first, in dump order; then each
//              article's other facts breadth first in item order (the first of them, its first
//              sentence where it has one, of every article before the second of any).
//   core-rank  every article's CORE is its title item, its
//              first sentence fact and its categories fact; articles enter core first, ranked by
//              their item count, most first, ties in dump order (the order KnowledgeStore.promote()
//              already uses for "the hottest articles"). Once every article's core is in, the rest
//              of the facts (lead sentences, then section sentences, in item order) enter breadth
//              first: the second fact of every article, in the same article order, before the third
//              of any. The categories fact is in the core because the category prior reads it; the
//              first sentence is in the core because it is the answer to "What is X?" and the prior
//              is counted from it.
//   core-dump  the same, articles in dump order.
//   dump       whole articles in dump order (the first N articles, every fact of each).
// A kept article is written with its kept items in their original order, articles in dump order.
// The packed store is exactly what KnowledgeWriter would write for those items: its records, item
// index, postings, dictionary, title buckets and category prior are rebuilt by the writer itself,
// and the signatures are copied from the source (they are a pure function of title and text).
// heldout.jsonl is copied WHOLE, so every pack is graded on the same drawn questions as the full
// store; its article field numbers the full store's articles.
//
// THE CAP. N MB is N x 1,000,000 bytes (the stricter reading of "MB") and counts EVERY file of the
// pack directory, meta.json and heldout.jsonl included. The plan predicts every file but meta.json
// exactly (the writer's own arithmetic), keeps META_RESERVE bytes for meta.json, and the written
// directory is summed from disk and checked against the cap before anything is recorded.
//
// Zero dependencies, Node 24 ESM. It never writes the source store; it writes only under
// bench/fixtures/wiki/pack-<cap>/ (or --out, or the --scratch of --dev) and the verdict files above.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { hash32 } from '../core/rng.mjs';
import { KnowledgeWriter, KIND, SIG_WORDS, BANDS, PRIOR_TOP, titleWords, normTitle, contentWords, uniq, categoryNames, heldAnswer, fold } from '../memory/knowledge.mjs';
import { KNOWLEDGE_DIR, knowledgeReady, knowledgeStore, closeKnowledge } from '../act/prompt.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
export const PACK_PARENT = path.join(ROOT, 'bench', 'fixtures', 'wiki');
export const VERDICT = path.join(ROOT, 'bench', 'verdicts', 'knowledge-pack.json');
export const DEV_VERDICT = path.join(ROOT, 'bench', 'verdicts', 'knowledge-pack-dev-partial.json');
export const MB = 1_000_000;
export const META_RESERVE = 16384;
export const RULES = Object.freeze(['core-rank', 'core-dump', 'cats-first', 'cats-prior', 'dump']);
/** What each rule keeps first, in words (the verdict carries the chosen one). */
export const RULE_TEXT = Object.freeze({
  'core-rank': 'every article keeps its title, first sentence and categories facts (its core) first, articles ranked by item count, most first, ties in dump order; then the other facts breadth first (the second fact of every article before the third of any)',
  'core-dump': 'every article keeps its title, first sentence and categories facts (its core) first, articles in dump order; then the other facts breadth first (the second fact of every article before the third of any)',
  'cats-first': 'every article keeps its title and categories facts first, articles in dump order; then its other facts breadth first in item order (the first of them, which is the first sentence where the article has one, of every article before the second of any)',
  'cats-prior': 'the category prior of the WHOLE store (catdir.bin and catheads.txt, what the articles of each category are, counted from every visible first sentence, never a held-out one) is kept first, whole; then as cats-first: every article keeps its title and categories facts, articles in dump order; then its other facts breadth first in item order',
  'dump': 'whole articles in dump order',
});
/** Rules whose article opening unit is the title and categories only (the first sentence is an extra). */
const CATS_RULES = new Set(['cats-first', 'cats-prior']);
/**
 * The rule the caps are packed with: the --dev winner on the 428 held-out records OUTSIDE the bar's
 * draw (bench/verdicts/knowledge-pack-dev-partial.json, 2026-09-27T23:29:53Z, caps 200, 100, 50):
 * tuning recall first cats-prior 64.3, 64.3, 28.3; cats-first 64.3, 51.2, 22; core-dump 63.8, 42.5,
 * 17.8; core-rank 63.8, 28, 10.3; dump 26.4, 12.6, 2.8 (summed 156.9, 137.5, 124.1, 102.1, 41.8).
 * The verdict re-reads that file and barMet requires the two to agree.
 */
export const DEFAULT_RULE = 'cats-prior';
export const CAPS = Object.freeze([200, 100, 50]);
export const DRAW_N = 200;
/**
 * THE SECOND POPULATION. The held-out draw is articles whose first sentence was hidden from the ingest,
 * so it is answered from the other facts and the category prior; a rule tuned on it could drop what the
 * other 281,813 articles are answered from (their own first sentence) and never be seen to. The visible
 * draw is DRAW_N articles of the SOURCE store with a first sentence and a key noun phrase, ranked by
 * hash32(VISIBLE_SEED + title): "What is <title>?" graded on that sentence's head (the same ruler,
 * nothing excluded). It measures retention, not recall of hidden text; the full store is its control.
 */
export const VISIBLE_SEED = 'knowledge-pack-visible-2026-09-27';
/** His five probe prompts, as bench/site-ask.mjs HIS_PROBE lists them (line 70). */
export const HIS_PROBE = Object.freeze(['h', 'hey', 'hi', 'What is the capital of France?', 'Write a short essay on why the ocean is salty.']);
const REC_HEAD = 12;
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

// ------------------------------------------------------------------ the store, read once
/**
 * Every item of an open store, through the reader's own accessors: kind, section, byte length,
 * text, the ids of its own content words (the writer's postings), and per article its first item,
 * item count, page id, title, first-sentence item, categories item, key noun head and categories.
 * @param {object} store a KnowledgeStore (knowledgeStore(dir) of act/prompt.mjs)
 */
export function scanStore(store) {
  const A = store.A, N = store.n;
  const kind = new Uint8Array(N), section = new Uint8Array(N), len = new Uint32Array(N);
  const texts = new Array(N);
  const wStart = new Uint32Array(N + 1);
  let wIds = new Uint32Array(1 << 20), wN = 0;
  const vocab = new Map();
  for (let i = 0; i < N; i++) {
    const w1 = store.items.get(2 * i + 1);
    len[i] = w1 & 0xffff; kind[i] = (w1 >>> 16) & 0xff; section[i] = w1 >>> 24;
    const t = store.text(i);
    texts[i] = t;
    wStart[i] = wN;
    if (kind[i] === KIND.title) continue;
    for (const w of uniq(contentWords(t))) {
      let id = vocab.get(w);
      if (id === undefined) { id = vocab.size; vocab.set(w, id); }
      if (wN === wIds.length) { const b = new Uint32Array(wIds.length * 2); b.set(wIds); wIds = b; }
      wIds[wN++] = id;
    }
  }
  wStart[N] = wN;
  const first = new Uint32Array(A), count = new Uint32Array(A), pageId = new Uint32Array(A);
  const firstItem = new Int32Array(A).fill(-1), catItem = new Int32Array(A).fill(-1);
  const titles = new Array(A), kpHead = new Array(A).fill(null), cats = new Array(A).fill(null);
  for (let a = 0; a < A; a++) {
    first[a] = store.art.get(3 * a); count[a] = store.art.get(3 * a + 1); pageId[a] = store.art.get(3 * a + 2);
    titles[a] = texts[first[a]];
    for (let i = first[a] + 1; i < first[a] + count[a]; i++) {
      if (kind[i] === KIND.first && firstItem[a] < 0) firstItem[a] = i;
      else if (kind[i] === KIND.categories) catItem[a] = i;
    }
    if (catItem[a] >= 0) cats[a] = categoryNames(texts[catItem[a]]);
    if (firstItem[a] >= 0) { const kp = heldAnswer(titles[a], texts[firstItem[a]]); if (kp) kpHead[a] = fold(kp.head); }
  }
  return { A, N, V: vocab.size, kind, section, len, texts, wStart, wIds: wIds.subarray(0, wN), first, count, pageId, firstItem, catItem, titles, kpHead, cats };
}

/** The core items of article a (title, first sentence, categories) and its other facts, in item order. */
export function coreAndExtras(scan, a, withFirst = true) {
  const core = [scan.first[a]], extras = [];
  for (let i = scan.first[a] + 1; i < scan.first[a] + scan.count[a]; i++) {
    if ((withFirst && i === scan.firstItem[a]) || i === scan.catItem[a]) core.push(i); else extras.push(i);
  }
  return { core, extras };
}

/** Article order of a rule: dump order, or item count most first with ties in dump order. */
export function articleOrder(scan, rule) {
  const order = Array.from({ length: scan.A }, (_, a) => a);
  if (rule === 'core-rank') order.sort((x, y) => scan.count[y] - scan.count[x] || x - y);
  return order;
}

// ------------------------------------------------------------------ the byte arithmetic
/** The smallest power of two at or above 2A, as KnowledgeWriter.finish() sizes the title table (at least 2). */
export function tableSlots(A) { let T = 1; while (T < A * 2) T <<= 1; return Math.max(2, T); }

/** Bytes of every file but the category prior and meta.json, from the counts the writer would see. */
export function bytesOf({ recBytes, items, articles, postings, distinct, heldoutBytes }) {
  return recBytes + 8 * items + (4 * SIG_WORDS) * items + 12 * articles + 4 * postings + 16 * distinct
    + 4 * BANDS * (65537 + articles) + 4 * tableSlots(articles) + 4 * articles + heldoutBytes;
}

/**
 * The category prior's bytes (catdir.bin and catheads.txt) the writer builds from these articles:
 * a first sentence with a key noun phrase counts its head once for each of its categories.
 */
export function priorBytes(scan, arts) {
  const m = new Map();
  for (const a of arts) {
    const h = scan.kpHead[a], cs = scan.cats[a];
    if (h === null || !cs || !cs.length) continue;
    for (const c of cs) { let x = m.get(c); if (!x) { x = new Map(); m.set(c, x); } x.set(h, (x.get(h) || 0) + 1); }
  }
  let bytes = 0;
  for (const x of m.values()) {
    let tot = 0; for (const v of x.values()) tot += v;
    const top = [...x.entries()].sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1)).slice(0, PRIOR_TOP);
    bytes += 16 + Buffer.byteLength(JSON.stringify([tot, ...top.flat()]), 'utf8');
  }
  return { categories: m.size, bytes };
}

/**
 * The plan: the longest prefix of the rule's order whose store fits under capBytes - META_RESERVE.
 * Every file but meta.json is predicted exactly; the prior is computed exactly for the prefix.
 * @returns {{rule, capBytes, budget, units, kept, articles, items, facts, predicted, prior, introduced: Uint8Array, extrasKept: Uint32Array, all: boolean}}
 */
export function planPack(scan, { capBytes, rule = DEFAULT_RULE, heldoutBytes = 0 }) {
  if (!RULES.includes(rule)) throw new Error('knowledge-pack: rule must be one of ' + RULES.join(', ') + ', got ' + rule);
  const order = articleOrder(scan, rule);
  const A = scan.A;
  const ce = new Array(A);
  for (let a = 0; a < A; a++) ce[a] = coreAndExtras(scan, a, !CATS_RULES.has(rule));
  // units: [article, item or -1 for the article's opening unit]
  const uArt = [], uItem = [];
  if (rule === 'dump') for (const a of order) { uArt.push(a); uItem.push(-1); }
  else {
    for (const a of order) { uArt.push(a); uItem.push(-1); }
    let maxE = 0; for (let a = 0; a < A; a++) maxE = Math.max(maxE, ce[a].extras.length);
    for (let p = 0; p < maxE; p++) for (const a of order) if (ce[a].extras.length > p) { uArt.push(a); uItem.push(ce[a].extras[p]); }
  }
  const U = uArt.length;
  const cumRec = new Float64Array(U + 1), cumPost = new Float64Array(U + 1);
  const cumItems = new Uint32Array(U + 1), cumDistinct = new Uint32Array(U + 1), cumArt = new Uint32Array(U + 1), cumFacts = new Uint32Array(U + 1);
  const seen = new Uint8Array(scan.V);
  // the category prior counts an article once its first sentence AND its categories are both in (as KnowledgeWriter counts it)
  const pFirst = new Uint8Array(A), pCats = new Uint8Array(A), priorSeq = [], cumPrior = new Uint32Array(U + 1);
  let rec = 0, post = 0, items = 0, distinct = 0, arts = 0, facts = 0;
  const addItem = (i, a) => {
    if (i === scan.firstItem[a]) pFirst[a] = 1;
    if (i === scan.catItem[a]) pCats[a] = 1;
    if ((i === scan.firstItem[a] || i === scan.catItem[a]) && pFirst[a] && pCats[a] && scan.kpHead[a] !== null && scan.cats[a] && scan.cats[a].length) priorSeq.push(a);
    rec += REC_HEAD + scan.len[i]; items++;
    if (scan.kind[i] !== KIND.title) facts++;
    for (let k = scan.wStart[i]; k < scan.wStart[i + 1]; k++) { post++; const id = scan.wIds[k]; if (!seen[id]) { seen[id] = 1; distinct++; } }
  };
  for (let u = 0; u < U; u++) {
    const a = uArt[u];
    if (uItem[u] < 0) {
      arts++;
      if (rule === 'dump') for (let i = scan.first[a]; i < scan.first[a] + scan.count[a]; i++) addItem(i, a);
      else for (const i of ce[a].core) addItem(i, a);
    } else addItem(uItem[u], a);
    cumPrior[u + 1] = priorSeq.length;
    cumRec[u + 1] = rec; cumPost[u + 1] = post; cumItems[u + 1] = items; cumDistinct[u + 1] = distinct; cumArt[u + 1] = arts; cumFacts[u + 1] = facts;
  }
  const base = (m) => bytesOf({ recBytes: cumRec[m], items: cumItems[m], articles: cumArt[m], postings: cumPost[m], distinct: cumDistinct[m], heldoutBytes });
  const priorCache = new Map();
  // cats-prior: the whole store's prior, whatever the prefix (every article with a head and categories, as the full ingest counted it)
  const wholePrior = rule === 'cats-prior' ? priorBytes(scan, wholePriorArticles(scan)) : null;
  const priorAt = wholePrior ? () => wholePrior : (m) => { const k = cumPrior[m]; if (!priorCache.has(k)) priorCache.set(k, priorBytes(scan, priorSeq.slice(0, k))); return priorCache.get(k); };
  const budget = capBytes - META_RESERVE;
  // the upper end: base bytes only (the prior only adds), then the largest prefix whose exact total fits
  let hi = 0; while (hi < U && base(hi + 1) <= budget) hi++;
  let lo = 0;
  if (base(0) + priorAt(0).bytes > budget) throw new Error('knowledge-pack: even an empty store (' + (base(0) + priorAt(0).bytes) + ' bytes) does not fit under ' + budget);
  while (lo < hi) { const mid = (lo + hi + 1) >>> 1; if (base(mid) + priorAt(mid).bytes <= budget) lo = mid; else hi = mid - 1; }
  const m = lo;
  const introduced = new Uint8Array(A), extrasKept = new Uint32Array(A);
  for (let u = 0; u < m; u++) { if (uItem[u] < 0) introduced[uArt[u]] = 1; else extrasKept[uArt[u]]++; }
  if (rule === 'dump') for (let a = 0; a < A; a++) if (introduced[a]) extrasKept[a] = ce[a].extras.length;
  const prior = priorAt(m);
  return {
    rule, capBytes, budget, units: U, kept: m, all: m === U,
    articles: cumArt[m], items: cumItems[m], facts: cumFacts[m], vocab: cumDistinct[m], postings: cumPost[m],
    predicted: base(m) + prior.bytes, prior, next: m < U ? base(m + 1) + priorAt(m + 1).bytes : null,
    introduced, extrasKept, ce,
  };
}

/** Every article the full ingest counted into the category prior: a key noun head from its first sentence and at least one category. */
export function wholePriorArticles(scan) {
  const out = [];
  for (let a = 0; a < scan.A; a++) if (scan.kpHead[a] !== null && scan.cats[a] && scan.cats[a].length) out.push(a);
  return out;
}

/** The writer's category prior map counted over the given articles (KnowledgeWriter.addArticle's own rule). */
export function priorMap(scan, arts) {
  const m = new Map();
  for (const a of arts) for (const c of scan.cats[a]) { let x = m.get(c); if (!x) { x = new Map(); m.set(c, x); } x.set(scan.kpHead[a], (x.get(scan.kpHead[a]) || 0) + 1); }
  return m;
}

// ------------------------------------------------------------------ the writer, driven item by item
function copySig(store, i, out) { for (let w = 0; w < SIG_WORDS; w++) out[w] = store.sigs.get(i * SIG_WORDS + w); }

/**
 * One kept article through KnowledgeWriter's own record path: what addArticle() does after it has
 * split the sentences, with the kind and section the source store holds and its signature copied.
 */
export function addKept(w, store, scan, a, factItems) {
  const title = scan.titles[a];
  const article = w.nArticles++;
  const firstId = w.nItems;
  copySig(store, scan.first[a], w.sig);
  w._record(KIND.title, 0, article, title);
  for (let k = 0; k < SIG_WORDS; k++) w.titleSigs.push(w.sig[k]);
  w.titleHash.push(hash32(normTitle(title)));
  w.stats.titles++;
  let lead0 = null, cats = null;
  for (const i of factItems) {
    const text = scan.texts[i], kind = scan.kind[i];
    copySig(store, i, w.sig);
    const id = w._record(kind, scan.section[i], article, text);
    for (const word of uniq(contentWords(text))) {
      let wid = w.vocab.get(word);
      if (wid === undefined) { wid = w.vocab.size; w.vocab.set(word, wid); }
      w.pw.push(wid); w.pi.push(id);
    }
    w.stats.facts++; w.stats.byKind[kind]++;
    if (kind === KIND.first && lead0 === null) lead0 = text;
    if (kind === KIND.categories) cats = categoryNames(text);
  }
  if (cats && cats.length && lead0 !== null) {
    const kp = heldAnswer(title, lead0);
    if (kp) {
      const h = fold(kp.head);
      for (const c of cats) { let m = w.catHeads.get(c); if (!m) { m = new Map(); w.catHeads.set(c, m); } m.set(h, (m.get(h) || 0) + 1); }
    }
  }
  const ab = Buffer.allocUnsafe(12);
  ab.writeUInt32LE(firstId, 0); ab.writeUInt32LE(w.nItems - firstId, 4); ab.writeUInt32LE(scan.pageId[a] >>> 0, 8);
  w.buf.articles.push(ab);
  return w.nItems - firstId;
}

/** Bytes of every file in a directory (not recursive), and the list. */
export function dirBytes(dir) {
  let bytes = 0; const files = {};
  for (const n of fs.readdirSync(dir).sort()) { const st = fs.statSync(path.join(dir, n)); if (st.isFile()) { files[n] = st.size; bytes += st.size; } }
  return { bytes, files };
}

/**
 * Write the plan's store into outDir with KnowledgeWriter (removing outDir first).
 * @returns {{dir, bytes, files, metaBytes, predicted, meta}}
 */
export function writePack(store, scan, plan, outDir, { sourceDir, heldout } = {}) {
  fs.rmSync(outDir, { recursive: true, force: true });
  const srcMeta = sourceDir ? JSON.parse(fs.readFileSync(path.join(sourceDir, 'meta.json'), 'utf8')) : {};
  const w = new KnowledgeWriter(outDir, { source: 'pack of ' + (srcMeta.source || 'a knowledge store') });
  for (let a = 0; a < scan.A; a++) {
    if (!plan.introduced[a]) continue;
    const { core, extras } = plan.ce[a];
    const facts = core.slice(1).concat(extras.slice(0, plan.extrasKept[a])).sort((x, y) => x - y);
    addKept(w, store, scan, a, facts);
  }
  if (heldout && heldout.length) { fs.writeSync(w.fd.heldout, heldout); w.stats.heldout = heldout.toString('utf8').split('\n').filter(Boolean).length; }
  // cats-prior: the writer is handed the whole store's prior map, so finish() writes the source's catdir.bin and catheads.txt
  if (plan.rule === 'cats-prior') w.catHeads = priorMap(scan, wholePriorArticles(scan));
  const extra = {
    complete: true,
    pack: {
      rule: plan.rule, capBytes: plan.capBytes, budget: plan.budget, units: plan.units, keptUnits: plan.kept, all: plan.all,
      from: sourceDir ? rel(sourceDir) : null, sourceArticles: srcMeta.articles ?? scan.A, sourceFacts: srcMeta.facts ?? null,
      predictedBytesWithoutMeta: plan.predicted,
    },
  };
  const r = w.finish(extra);
  const d = dirBytes(outDir);
  const meta = JSON.parse(fs.readFileSync(path.join(outDir, 'meta.json'), 'utf8'));
  return { dir: outDir, bytes: d.bytes, files: d.files, metaBytes: d.files['meta.json'], predicted: plan.predicted, meta, writer: r };
}

/** sha256 of a file, or null when it is absent. */
export function sha256File(f) { try { return crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex'); } catch { return null; } }

/** Open a source store through act/prompt.mjs, whole in memory for the scan (the env name is set for the open only). */
export function openSource(dir, residentMb = 512) {
  const ready = knowledgeReady(dir);
  if (!ready.ok) throw new Error('knowledge-pack: the source is not a finished ingest: ' + ready.reason);
  const had = Object.prototype.hasOwnProperty.call(process.env, 'BRAIN_KNOWLEDGE_RESIDENT_MB'), was = process.env.BRAIN_KNOWLEDGE_RESIDENT_MB;
  process.env.BRAIN_KNOWLEDGE_RESIDENT_MB = String(residentMb);
  try { return knowledgeStore(dir); } finally { if (had) process.env.BRAIN_KNOWLEDGE_RESIDENT_MB = was; else delete process.env.BRAIN_KNOWLEDGE_RESIDENT_MB; }
}

/** Pack one store into outDir under capMB: scan, plan, write, check the cap. Pure of the verdict. */
export function pack({ from, out, capMB, rule = DEFAULT_RULE, scan = null, store = null }) {
  const capBytes = Math.round(capMB * MB);
  const src = store || openSource(from);
  if (!src) throw new Error('knowledge-pack: the reader opened nothing at ' + from);
  const t0 = Date.now();
  const s = scan || scanStore(src);
  const tScan = Date.now();
  const heldout = fs.existsSync(path.join(from, 'heldout.jsonl')) ? fs.readFileSync(path.join(from, 'heldout.jsonl')) : Buffer.alloc(0);
  const plan = planPack(s, { capBytes, rule, heldoutBytes: heldout.length });
  const tPlan = Date.now();
  const wr = writePack(src, s, plan, out, { sourceDir: from, heldout });
  const tWrite = Date.now();
  const underCap = wr.bytes <= capBytes;
  const exact = wr.bytes - wr.metaBytes === plan.predicted;
  return { capMB, capBytes, rule, plan, write: wr, underCap, exact, scan: s, store: src, ms: { scan: tScan - t0, plan: tPlan - tScan, write: tWrite - tPlan } };
}

// ------------------------------------------------------------------ measurement (a fresh process)
/**
 * The knowledge bar's grader (bench/knowledge.mjs drawHeldout + gradeDraw, the same draw seed) and
 * the recall bar's wiki arm (ask() with the tier on, provider null, graded by bench/recall.mjs
 * gradeWiki) on one store directory. The store is opened through act/prompt.mjs with the default
 * resident cap, as the site would open it.
 */
export async function measureDir(dir, visibleFrom = KNOWLEDGE_DIR) {
  const { drawHeldout, gradeDraw, DRAW_SEED } = await import('../bench/knowledge.mjs');
  const { gradeWiki, modelAsked } = await import('../bench/recall.mjs');
  const { ask } = await import('../act/prompt.mjs');
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  const ready = knowledgeReady(dir);
  if (!ready.ok) return { ok: false, reason: ready.reason };
  const t0 = Date.now();
  const store = knowledgeStore(dir);
  const openMs = Date.now() - t0;
  const { pool, drawn } = drawHeldout(dir, DRAW_N);
  const drawHash = crypto.createHash('sha256').update(drawn.map((h) => h.title).join('\n')).digest('hex');
  const g = gradeDraw(store, drawn);
  const brain = new Brain({ name: 'knowledge-pack', ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name: 'knowledge-pack' });
  const opts = { provider: 'null', route: 'direct', spawn: false, knowledge: dir };
  await ask(brain, 'What is a question that no article answers?', opts);
  const rows = [];
  for (const h of drawn) {
    const ts = process.hrtime.bigint();
    const a = await ask(brain, 'What is ' + h.title + '?', opts);
    const us = Number(process.hrtime.bigint() - ts) / 1e3;
    const gw = gradeWiki(a.text, h.head);
    rows.push({ ok: gw.ok, native: !modelAsked(a), us });
  }
  const native = rows.filter((x) => x.native);
  const census = store.census();
  // the second population, drawn from the source store, graded on this one (after the timed grading above)
  const vis = visibleDraw(knowledgeStore(visibleFrom), DRAW_N);
  const visibleDrawHash = crypto.createHash('sha256').update(vis.map((h) => h.title).join('\n')).digest('hex');
  const gv = gradeDraw(store, vis);
  // the local read floor: every file of the store read whole, after the grading (the page cache is warm, so this is a floor)
  const tr = process.hrtime.bigint();
  let readBytes = 0;
  for (const n of fs.readdirSync(dir).sort()) { const st = fs.statSync(path.join(dir, n)); if (st.isFile()) readBytes += fs.readFileSync(path.join(dir, n)).length; }
  const readMs = Number(process.hrtime.bigint() - tr) / 1e6;
  const r1 = (x) => Math.round(x * 10) / 10;
  return {
    ok: true, dir: rel(dir), drawSeed: DRAW_SEED, pool, n: g.n, drawHash,
    recallFirst: r1(100 * g.recall1), recallTop5: r1(100 * g.recall5), nullFirst: r1(100 * g.null1), nullTop5: r1(100 * g.null5),
    visible: { n: gv.n, seed: VISIBLE_SEED, from: rel(visibleFrom), drawHash: visibleDrawHash, recallFirst: r1(100 * gv.recall1), recallTop5: r1(100 * gv.recall5), nullFirst: r1(100 * gv.null1), msPerQuery: Math.round(gv.meanMs * 1000) / 1000 },
    answered: r1(100 * g.answered), msPerQuery: Math.round(g.meanMs * 1000) / 1000, p50Ms: Math.round(g.p50Ms * 1000) / 1000, p95Ms: Math.round(g.p95Ms * 1000) / 1000, leaks: g.leaks,
    askPath: { n: rows.length, correct: rows.filter((x) => x.ok).length, native: native.length, nativeMeanUs: native.length ? r1(native.reduce((s, x) => s + x.us, 0) / native.length) : null },
    read: { bytes: readBytes, ms: Math.round(readMs * 10) / 10, mbPerS: Math.round(readBytes / 1e6 / (readMs / 1000)) }, open: { ms: openMs, mode: census.mode, capMb: census.capMb, residentBytes: census.residentBytes, indexBytes: census.indexBytes },
    meta: (() => { const m = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); return { articles: m.articles, items: m.items, facts: m.facts }; })(),
  };
}

/** The visible draw (VISIBLE_SEED) over an open source store: {title, np, head}, the first sentence never excluded. */
export function visibleDraw(store, n = DRAW_N, seed = VISIBLE_SEED) {
  const ranked = new Array(store.A);
  for (let a = 0; a < store.A; a++) ranked[a] = [hash32(seed + '\u0000' + store.title(a)), a];
  ranked.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const out = [];
  for (const [, a] of ranked) {
    if (out.length >= n) break;
    const fi = store.itemsOf(a).find((i) => store.kindOf(i) === KIND.first);
    if (fi === undefined) continue;
    const title = store.title(a), kp = heldAnswer(title, store.text(fi));
    if (!kp) continue;
    out.push({ title, np: kp.np, head: kp.head, sentence: '' });
  }
  return out;
}

/** Run measureDir in a child node process (a clean heap for the timing), and parse its one JSON line. */
export function measureInChild(dir, visibleFrom = KNOWLEDGE_DIR) {
  const r = spawnSync(process.execPath, ['--max-old-space-size=4000', fileURLToPath(import.meta.url), '--measure-dir', dir, '--visible-from', visibleFrom], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const line = String(r.stdout || '').split('\n').find((l) => l.startsWith('MEASURE '));
  if (r.status !== 0 || !line) return { ok: false, reason: 'the measuring child exited ' + r.status + ': ' + String(r.stderr || '').split('\n').slice(0, 3).join(' | ') };
  return JSON.parse(line.slice('MEASURE '.length));
}

// ------------------------------------------------------------------ the verdict
function readJson(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } }

/**
 * The number tokens of a text: digits not glued to a letter, a digit or a dot on the left, nor to a
 * letter or a decimal on the right (p50, v24.15.0 and pack-v2 are names, not numbers; "62.5." is 62.5).
 */
export function numbersIn(text) { return String(text ?? '').match(/(?<![\w.])\d+(?:\.\d+)?(?!\w|\.\d)/g) || []; }

/**
 * Every number a statement quotes that no printed line carries: the rule "never quote a number a
 * command did not print" as a check. Empty when every number of the statement was printed.
 */
export function unprintedNumbers(statement, printedLines) {
  const printed = new Set();
  for (const l of printedLines || []) for (const n of numbersIn(l)) printed.add(n);
  return [...new Set(numbersIn(statement))].filter((n) => !printed.has(n));
}

/** The lines the verdict's own commands printed: every cap row's and the control's (full.printed). */
export function printedLinesOf(v) {
  const out = [];
  for (const r of v.caps || []) if (r && Array.isArray(r.printed)) out.push(...r.printed);
  if (v.full && Array.isArray(v.full.printed)) out.push(...v.full.printed);
  return out;
}

/** The row barMet counts: packed under its bytes, measured, the same draw as the full store, no leak, and the reader opens it. */
export function rowMet(row, fullDrawHash) {
  return !!row && row.bytes <= row.capBytes && row.ready === true && Number.isFinite(row.recallFirst) && Number.isFinite(row.recallTop5)
    && Number.isFinite(row.msPerQuery) && row.leaks === 0 && (fullDrawHash ? row.drawHash === fullDrawHash : true);
}

/** Recompute barMet and the statement from the rows on disk. Pure. */
export function finishVerdict(v) {
  const rows = CAPS.map((c) => (v.caps || []).find((r) => r.capMB === c) || null);
  const fullHash = v.full && v.full.control ? v.full.control.drawHash : null;
  const checks = {
    everyCapPacked: rows.every(Boolean),
    everyCapUnderItsBytes: rows.every((r) => r && r.bytes <= r.capBytes),
    everyCapMeasured: rows.every((r) => r && Number.isFinite(r.recallFirst) && Number.isFinite(r.recallTop5) && Number.isFinite(r.msPerQuery)),
    readerOpensEvery: rows.every((r) => r && r.ready === true),
    sameDrawAsFull: !!fullHash && rows.every((r) => r && r.drawHash === fullHash),
    noLeaks: rows.every((r) => r && r.leaks === 0),
    visibleMeasured: !!(v.full && v.full.control && v.full.control.visible) && rows.every((r) => r && r.visible && Number.isFinite(r.visible.recallFirst) && r.visible.drawHash === v.full.control.visible.drawHash),
    controlMeasured: !!(v.full && v.full.control && Number.isFinite(v.full.control.recallFirst)),
    ruleChosenOutsideDraw: !!(v.split && v.split.development && v.split.development.chosen === v.rule),
  };
  const f = v.full || {};
  const c = f.control || {};
  const txt = rows.filter(Boolean).map((r) => `${r.capMB} MB: ${r.bytes} bytes, ${r.articles} of ${f.articles} articles and ${r.facts} of ${f.facts} facts, recall first ${r.recallFirst} and top five ${r.recallTop5} at ${r.msPerQuery} ms per query, visible recall first ${r.visible ? r.visible.recallFirst : 'n/a'} and top five ${r.visible ? r.visible.recallTop5 : 'n/a'}`).join('; ');
  const capWords = CAPS.slice(0, -1).join(', ') + ' and ' + CAPS[CAPS.length - 1];
  const body = `The encyclopedia the organism answers from (all ${f.articles ?? 'n/a'} Simple English Wikipedia articles, ${f.facts ?? 'n/a'} facts, ${f.bytes ?? 'n/a'} bytes on disk) is not deployed with the site (bench/fixtures is never deployed, and docs/research/cloud-cell.md cites the platform function bundle limit it would have to fit), so tools/knowledge-pack.mjs writes smaller stores in the same format by one rule (${v.rule}: ${RULE_TEXT[v.rule] || 'unknown'}), under caps of ${capWords} MB counted over every file. The rule was chosen on the held-out records outside the graded draw, never on the draw. On the same ${c.n ?? 'n/a'} held-out questions the full store answers with recall first ${c.recallFirst ?? 'n/a'} and top five ${c.recallTop5 ?? 'n/a'} percent in this session (bench/verdicts/knowledge.json recorded ${f.recallFirst} and ${f.recallTop5}), against ${c.nullFirst ?? 'n/a'} and ${c.nullTop5 ?? 'n/a'} for the title alone, and on ${c.visible ? c.visible.n : 'n/a'} other articles whose own first sentence is in the store (the visible draw, seed ${c.visible ? c.visible.seed : 'n/a'}: retention, not recall of hidden text) with recall first ${c.visible ? c.visible.recallFirst : 'n/a'} and top five ${c.visible ? c.visible.recallTop5 : 'n/a'}; the packs: ${txt || 'none yet'}. The act/prompt.mjs reader opens every pack unchanged.`;
  // every number the statement quotes must be on a line one of the verdict's commands printed
  const unprinted = unprintedNumbers(body, printedLinesOf(v));
  checks.statementNumbersPrinted = unprinted.length === 0;
  v.unprintedNumbers = unprinted;
  v.checks = checks;
  v.barMet = Object.values(checks).every(Boolean);
  v.statement = body + ` The bar (every cap packed under its bytes and measured on both draws, the same draws as the full store, with no hidden sentence in any pack, by the rule chosen outside the draw, every number above printed by the bar commands) ${v.barMet ? 'is met' : 'is not met'}.`;
  return v;
}

function mergeVerdict(update) {
  const v = readJson(VERDICT) || { caps: [] };
  Object.assign(v, update.top || {});
  if (update.full) v.full = { ...(v.full || {}), ...update.full };
  if (update.row) { v.caps = (v.caps || []).filter((r) => r.capMB !== update.row.capMB).concat([update.row]).sort((x, y) => y.capMB - x.capMB); }
  v.at = new Date().toISOString(); v.node = process.version; v.isTheBar = true;
  v.commands = { ...(v.commands || {}), ...(update.command || {}) };
  v.command = CAPS.map((c) => v.commands['cap' + c] || 'node tools/knowledge-pack.mjs --cap ' + c).concat([v.commands.full || 'node tools/knowledge-pack.mjs --measure-full']).join(' ; ');
  finishVerdict(v);
  fs.mkdirSync(path.dirname(VERDICT), { recursive: true });
  fs.writeFileSync(VERDICT, JSON.stringify(v, null, 1) + '\n');
  return v;
}

function verdictTop(rule) {
  const dev = readJson(DEV_VERDICT);
  return {
    rule,
    ruleText: RULE_TEXT[rule] + '. The cap takes the longest prefix of that order whose store fits. Kept articles are written in dump order with their kept items in their original order, by KnowledgeWriter itself; signatures are copied; heldout.jsonl is copied whole so every pack is graded on the same questions.',
    capUnit: 'N MB = N x 1,000,000 bytes, summed over every file of the pack directory (meta.json and heldout.jsonl included)',
    split: {
      development: { what: 'the rule: ' + RULES.join(', ') + ' packed at the --dev caps and graded on the held-out records OUTSIDE the bar draw (bench/recall.mjs tuningRecords); the winner by summed recall first', file: rel(DEV_VERDICT), records: dev ? dev.tuning : null, chosen: dev ? dev.chosen : null },
      heldOut: { what: 'the 200 held-out first sentences of bench/knowledge.mjs drawHeldout (its DRAW_SEED), the same questions bench/verdicts/knowledge.json grades, graded once per cap after the rule was fixed', n: DRAW_N },
      contaminated: false,
      why: 'the rule and its parameters were fixed on records outside the draw before any pack was graded on the draw; every pack is a subset of the full store, whose ingest never wrote a hidden first sentence, and the leak count of every row is printed',
    },
    contaminated: false,
    control: 'the full store measured by the same code in the same session (full.control), and the null arm of bench/knowledge.mjs (the title alone: nullFirst, nullTop5)',
    recallBench: 'bench/recall.mjs takes --store DIR (its header line 10 and main()), but its command line writes bench/verdicts/recall.json or recall-partial.json, which this item does not own; so its graders (gradeWiki, modelAsked) are imported read-only and ask() is run on each pack the way its tier-on arm runs it (provider null, route direct, spawn off, knowledge = the pack): the askPath field of every row',
    writes: 'a pack is written under bench/fixtures/wiki/pack-<cap>/ (never committed): up to 200 MB for pack-200, which is kept; pack-100 and pack-50 are deleted after measuring (deletedAfterMeasuring in their rows)',
    budget: 'each command runs under tools/budget.mjs watching only what it writes, so the commands run in any order whatever else bench/fixtures/wiki holds: --disk-mb <cap> --dir bench/fixtures/wiki/pack-<cap> for a cap (MiB, above the cap in MB), --disk-mb 1 --dir bench/verdicts/knowledge-pack.json for --measure-full; --ram-mb 4000 and --max-old-space-size=4000 for every one',
    budgetCommands: CAPS.map((c) => 'node tools/budget.mjs --ram-mb 4000 --disk-mb ' + c + ' --dir bench/fixtures/wiki/pack-' + c + ' -- node --max-old-space-size=4000 tools/knowledge-pack.mjs --cap ' + c + (c === CAPS[0] ? '' : ' --delete-after')).concat(['node tools/budget.mjs --ram-mb 4000 --disk-mb 1 --dir bench/verdicts/knowledge-pack.json -- node --max-old-space-size=4000 tools/knowledge-pack.mjs --measure-full']),
    bar: 'every cap (200, 100, 50 MB) packed under its bytes and measured: recall first and top five and ms per query on the same 200-question draw as the full store, leaks 0, the act/prompt.mjs reader opens it',
  };
}

// ------------------------------------------------------------------ main
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i === -1 ? def : process.argv[i + 1]; }
const has = (name) => process.argv.includes('--' + name);

async function mainCap() {
  const capMB = Number(arg('cap'));
  if (!Number.isFinite(capMB) || capMB <= 0) throw new Error('--cap N: a positive number of MB');
  const from = path.resolve(arg('from', KNOWLEDGE_DIR));
  const out = path.resolve(arg('out', path.join(PACK_PARENT, 'pack-' + capMB)));
  const rule = String(arg('rule', DEFAULT_RULE));
  const command = 'node tools/knowledge-pack.mjs' + process.argv.slice(2).map((a) => ' ' + a).join('');
  const printed = [];
  const say = (s) => { printed.push(s); console.log(s); };
  const tAll = Date.now();
  say(`knowledge pack: ${command}`);
  const r = pack({ from, out, capMB, rule });
  const p = r.plan, wr = r.write;
  say(`source ${rel(from)}: ${r.scan.A} articles, ${r.scan.N} items, ${r.scan.V} words; scan ${r.ms.scan} ms, plan ${r.ms.plan} ms, write ${r.ms.write} ms`);
  say(`rule ${rule}: kept ${p.kept} of ${p.units} units${p.all ? ' (all)' : ''}: ${p.articles} articles, ${p.facts} facts, ${p.items} items, ${p.vocab} words, prior ${p.prior.categories} categories`);
  say(`bytes: ${wr.bytes} on disk under the cap ${r.capBytes}: ${r.underCap ? 'yes' : 'NO'}; predicted without meta.json ${p.predicted}, written without meta.json ${wr.bytes - wr.metaBytes}: ${r.exact ? 'exact' : 'DIFFERENT'}; the next unit would make ${p.next ?? 'n/a'}`);
  const srcCat = sha256File(path.join(from, 'catdir.bin')) === sha256File(path.join(out, 'catdir.bin')) && sha256File(path.join(from, 'catheads.txt')) === sha256File(path.join(out, 'catheads.txt'));
  say(`written (its meta.json): ${wr.meta.articles} articles, ${wr.meta.facts} facts, ${wr.meta.items} items, ${wr.meta.vocab} words`);
  say(`category prior byte-identical to the source: ${srcCat}`);
  const ready = knowledgeReady(out);
  say(`reader: knowledgeReady ${ready.ok ? 'ok' : 'NOT OK ' + ready.reason}`);
  closeKnowledge();
  r.scan.texts = null;
  const m = ready.ok ? measureInChild(out, from) : { ok: false, reason: ready.reason };
  if (m.ok) say(`measured on ${m.n} drawn held-out questions (a fresh process, default resident cap, ${m.open.mode} ${m.open.capMb} MB): recall first ${m.recallFirst}, top five ${m.recallTop5} (null ${m.nullFirst} / ${m.nullTop5}), ${m.msPerQuery} ms per query (p50 ${m.p50Ms}, p95 ${m.p95Ms}), answered ${m.answered}, leaks ${m.leaks}; ask path ${m.askPath.correct}/${m.askPath.n} correct, ${m.askPath.native} native, mean ${m.askPath.nativeMeanUs} us; open ${m.open.ms} ms; read whole ${m.read.bytes} bytes in ${m.read.ms} ms`);
  if (m.ok) say(`visible draw (${m.visible.n} source articles with a first sentence, seed ${m.visible.seed}): recall first ${m.visible.recallFirst}, top five ${m.visible.recallTop5} (null ${m.visible.nullFirst}), ${m.visible.msPerQuery} ms per query`);
  if (!m.ok) say(`measure FAILED: ${m.reason}`);
  let deleted = false;
  if (has('delete-after')) { fs.rmSync(out, { recursive: true, force: true }); deleted = !fs.existsSync(out); say(`deleted ${rel(out)} after measuring: ${deleted}`); }
  const wall = (Date.now() - tAll) / 1000;
  say(`wall ${wall.toFixed(1)} s`);
  const row = {
    capMB, capBytes: r.capBytes, dir: rel(out), kept: !deleted, deletedAfterMeasuring: deleted,
    bytes: wr.bytes, predictedWithoutMeta: p.predicted, metaBytes: wr.metaBytes, exactPrediction: r.exact, nextUnitBytes: p.next,
    articles: wr.meta.articles, facts: wr.meta.facts, items: wr.meta.items, vocab: wr.meta.vocab, priorCategories: p.prior.categories, priorIdenticalToFull: srcCat,
    files: wr.files, ready: ready.ok,
    recallFirst: m.ok ? m.recallFirst : null, recallTop5: m.ok ? m.recallTop5 : null, nullFirst: m.ok ? m.nullFirst : null, nullTop5: m.ok ? m.nullTop5 : null,
    msPerQuery: m.ok ? m.msPerQuery : null, p50Ms: m.ok ? m.p50Ms : null, p95Ms: m.ok ? m.p95Ms : null, leaks: m.ok ? m.leaks : null, drawHash: m.ok ? m.drawHash : null,
    visible: m.ok ? m.visible : null,
    askPath: m.ok ? m.askPath : null, open: m.ok ? m.open : null, ms: { ...r.ms, wall: Math.round(wall * 1000) },
    printed,
  };
  const v = mergeVerdict({ top: verdictTop(rule), row, command: { ['cap' + capMB]: command } });
  say(`wrote ${rel(VERDICT)}: barMet ${v.barMet} (${Object.entries(v.checks).map(([k, x]) => k + ' ' + (x ? 'yes' : 'NO')).join(', ')})`);
  if (!r.underCap || !m.ok) process.exitCode = 1;
}

async function mainFull() {
  const from = path.resolve(arg('from', KNOWLEDGE_DIR));
  const command = 'node tools/knowledge-pack.mjs' + process.argv.slice(2).map((a) => ' ' + a).join('');
  const printed = [];
  const say = (s) => { printed.push(s); console.log(s); };
  say(`knowledge pack control: ${command}`);
  const t0 = Date.now();
  const m = measureInChild(from, from);
  const kj = readJson(path.join(ROOT, 'bench', 'verdicts', 'knowledge.json'));
  const meta = readJson(path.join(from, 'meta.json')) || {};
  const d = dirBytes(from);
  say(`full store ${rel(from)} (its meta.json): ${meta.articles} articles, ${meta.facts} facts, ${meta.items} items; ${d.bytes} bytes over its ${Object.keys(d.files).length} files`);
  const full = {
    dir: rel(from), bytes: d.bytes, knowledgeBytes: meta.knowledgeBytes, articles: meta.articles, facts: meta.facts, items: meta.items,
    recallFirst: kj ? Math.round(kj.grade.recall1 * 1000) / 10 : null, recallTop5: kj ? Math.round(kj.grade.recall5 * 1000) / 10 : null,
    msPerQuery: kj ? Math.round(kj.grade.meanMs * 1000) / 1000 : null, from: 'bench/verdicts/knowledge.json grade (' + (kj ? kj.at : 'absent') + ')',
    control: m.ok ? { ...m, measuredAt: new Date().toISOString() } : { ok: false, reason: m.reason },
  };
  if (m.ok) say(`full store ${full.bytes} bytes, measured on ${m.n} drawn held-out questions: recall first ${m.recallFirst}, top five ${m.recallTop5} (null ${m.nullFirst} / ${m.nullTop5}), ${m.msPerQuery} ms per query (${m.open.mode} ${m.open.capMb} MB), leaks ${m.leaks}; ask path ${m.askPath.correct}/${m.askPath.n} correct, ${m.askPath.native} native, mean ${m.askPath.nativeMeanUs} us; open ${m.open.ms} ms; read whole ${m.read.bytes} bytes in ${m.read.ms} ms; knowledge.json recorded ${full.recallFirst} / ${full.recallTop5} at ${full.msPerQuery} ms`);
  if (m.ok) say(`visible draw (${m.visible.n} articles with a first sentence, seed ${m.visible.seed}): recall first ${m.visible.recallFirst}, top five ${m.visible.recallTop5} (null ${m.visible.nullFirst}), ${m.visible.msPerQuery} ms per query`);
  else say(`control measure FAILED: ${m.reason}`);
  say(`wall ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  full.printed = printed;
  const v = mergeVerdict({ top: verdictTop(String(arg('rule', DEFAULT_RULE))), full, command: { full: command } });
  console.log(`wrote ${rel(VERDICT)}: barMet ${v.barMet}`);
  if (!m.ok) process.exitCode = 1;
}

async function mainDev() {
  const scratch = arg('scratch', null);
  if (!scratch) throw new Error('--dev needs --scratch DIR (a directory outside the repository)');
  const caps = String(arg('dev-caps', '100,50')).split(',').map(Number);
  const from = path.resolve(arg('from', KNOWLEDGE_DIR));
  const { gradeDraw } = await import('../bench/knowledge.mjs');
  const { tuningRecords } = await import('../bench/recall.mjs');
  const command = 'node tools/knowledge-pack.mjs' + process.argv.slice(2).map((a) => ' ' + a).join('');
  console.log(`knowledge pack rule choice: ${command}`);
  const tuning = tuningRecords(from, DRAW_N);
  const src = openSource(from);
  const t0 = Date.now();
  const scan = scanStore(src);
  console.log(`scan ${Date.now() - t0} ms; tuning records outside the draw: ${tuning.length}`);
  const rows = [];
  for (const capMB of caps) {
    for (const rule of RULES) {
      const out = path.join(path.resolve(scratch), 'dev-' + rule + '-' + capMB);
      const r = pack({ from, out, capMB, rule, scan, store: src });
      const st = knowledgeStore(out);
      const g = gradeDraw(st, tuning);
      st.close();
      fs.rmSync(out, { recursive: true, force: true });
      const row = { capMB, rule, bytes: r.write.bytes, underCap: r.underCap, articles: r.write.meta.articles, facts: r.write.meta.facts, recallFirst: Math.round(g.recall1 * 1000) / 10, recallTop5: Math.round(g.recall5 * 1000) / 10, nullFirst: Math.round(g.null1 * 1000) / 10, msPerQuery: Math.round(g.meanMs * 1000) / 1000, leaks: g.leaks };
      rows.push(row);
      console.log(`dev ${capMB} MB ${rule.padEnd(9)}: ${row.bytes} bytes, ${row.articles} articles, ${row.facts} facts; tuning recall first ${row.recallFirst}, top five ${row.recallTop5} (null ${row.nullFirst}), ${row.msPerQuery} ms/q, leaks ${row.leaks}`);
    }
  }
  const score = (rule) => rows.filter((x) => x.rule === rule).reduce((s, x) => s + x.recallFirst, 0);
  const score5 = (rule) => rows.filter((x) => x.rule === rule).reduce((s, x) => s + x.recallTop5, 0);
  const chosen = [...RULES].sort((a, b) => score(b) - score(a) || score5(b) - score5(a))[0];
  console.log(`chosen: ${chosen} (summed tuning recall first ${RULES.map((r) => r + ' ' + score(r).toFixed(1)).join(', ')})`);
  const v = { at: new Date().toISOString(), command, node: process.version, isTheBar: false, tuning: tuning.length, caps, rows, chosen, statement: `The pack rule was chosen on the ${tuning.length} held-out records outside the 200-question draw: each of ${RULES.join(', ')} was packed at ${caps.join(' and ')} MB and graded with bench/knowledge.mjs gradeDraw; ${chosen} had the highest summed recall first. The draw itself was not read. This is not the bar; it is where the bar's rule comes from.` };
  fs.writeFileSync(DEV_VERDICT, JSON.stringify(v, null, 1) + '\n');
  console.log(`wrote ${rel(DEV_VERDICT)}`);
  closeKnowledge();
}

async function mainProbe() {
  const spec = String(arg('probe'));
  const { ask } = await import('../act/prompt.mjs');
  const { Brain } = await import('../core/brain.mjs');
  const { attachMemory } = await import('../memory/index.mjs');
  const brain = new Brain({ name: 'knowledge-pack-probe', ledger: 'runs', pruneEvery: 0 });
  attachMemory(brain, { name: 'knowledge-pack-probe' });
  const knowledge = spec === 'none' ? false : path.resolve(spec);
  console.log(`probe: his five prompts through ask(), provider null, knowledge ${knowledge === false ? 'off' : rel(knowledge)}`);
  const rows = [];
  for (const q of HIS_PROBE) {
    const ts = process.hrtime.bigint();
    const a = await ask(brain, q, { provider: 'null', route: 'direct', spawn: false, knowledge });
    const us = Number(process.hrtime.bigint() - ts) / 1e3;
    // the first visible line, and the line after it when the first only announces a list ("best first:")
    const lines = String(a.text || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const shown = lines.length > 1 && /:$/.test(lines[0]) ? lines[0] + ' ' + lines[1] : (lines[0] || '');
    const row = { prompt: q, route: a.route, provenance: a.provenance ? a.provenance.answer : null, model: a.provenance && a.provenance.llm ? a.provenance.llm.provider : null, us: Math.round(us), shown: shown.slice(0, 240) };
    rows.push(row);
    console.log(`PROBE ${JSON.stringify(q)} route ${row.route} provenance ${row.provenance} model ${row.model} ${row.us} us: ${row.shown}`);
  }
  closeKnowledge();
  const label = knowledge === false ? 'none' : rel(knowledge);
  const v = readJson(VERDICT) || { caps: [] };
  const probes = { ...(v.probes || {}), [label]: { at: new Date().toISOString(), command: 'node tools/knowledge-pack.mjs --probe ' + spec, provider: 'null', rows } };
  mergeVerdict({ top: { probes } });
  console.log(`wrote the probe rows for ${label} into ${rel(VERDICT)} (probes; not part of the bar)`);
}

async function main() {
  if (has('measure-dir')) { const m = await measureDir(path.resolve(arg('measure-dir')), path.resolve(arg('visible-from', KNOWLEDGE_DIR))); console.log('MEASURE ' + JSON.stringify(m)); closeKnowledge(); if (!m.ok) process.exitCode = 1; return; }
  if (has('measure-full')) return mainFull();
  if (has('dev')) return mainDev();
  if (has('probe')) return mainProbe();
  if (has('cap')) return mainCap();
  console.log('usage: node tools/knowledge-pack.mjs --cap N [--rule R] [--delete-after] | --measure-full | --dev --scratch DIR | --probe DIR|none');
  process.exitCode = 2;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main().catch((err) => { console.error(err && err.stack || err); process.exitCode = 1; });
