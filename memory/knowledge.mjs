// memory/knowledge.mjs. THE KNOWLEDGE TIER: an encyclopedia held on disk, keyed by hypervectors.
//
// What it holds. Every article of an ingested dump becomes items: a TITLE item, the FIRST sentence
// fact, the other LEAD sentences, SECTION sentences and one CATEGORIES fact. The text of every item
// lives on disk in an append-only record file (records.bin, each record framed so the index can be
// rebuilt from it by a scan), and a fixed width index (items.bin) says where each one is.
//
// How it is keyed. The key of an item is an 8192 lane hypervector in the SAME space the organism
// already asks its episodic tier with: act/prompt.mjs encodePrompt() is
// bundle(words.map(w => hvFromSeed('word:' + w))), and a knowledge key is that bundle over the
// item's words (a fact's article title words twice, then its own content words). So the vector the
// organism builds for a prompt is already a query of this tier.
//
// Why not the semantic tier or memory.assoc. Both keep every key as 8192 dense bytes and scan it:
// the semantic tier holds what its declared byte budget holds (memory/semantic.mjs, 256 MB by
// default since Board 11), memory.assoc keeps 4096 and scans all of them per query, the episodic
// tier's bound is 65536. bench/knowledge.mjs measures all three at growing
// counts and prints which holds; at an encyclopedia's scale none does, so this tier keeps what the
// episodic tier's own index keeps and nothing more: the SIGN BITS of the key at fixed lanes (the
// first SIG_BITS lanes; the lanes of a bundle of seeded vectors are independent, so any fixed lane
// set is an unbiased sample of the full similarity), 32 bytes a key instead of 8192. The full key
// is never stored because it is a pure function of the text: the head of a ranking is rescored at
// the full 8192 lanes by rebuilding the keys from their records. promote() writes the hottest
// title keys into a SemanticMemory through its public learn(), up to that tier's capacity.
//
// How it is asked. recall(query) ranks by hypervector similarity first and uses a text index
// second: (1) the query is encoded; (2) the title keys are searched through banded signature
// buckets (plus an exact normalised title table) and the best titles bring their facts; (3) an
// inverted index over the facts' words (postings on disk, read per query) brings facts from other
// articles; (4) every candidate is ranked by signature similarity, the head is rescored exactly at
// 8192 lanes, and the best come back with provenance "memory" and their article title.
import fs from 'node:fs';
import path from 'node:path';
import { RNG, hash32 } from '../core/rng.mjs';

export const D = 8192;            // the organism's hypervector width (core/signal.mjs D)
export const SIG_BITS = 256;      // sign bits kept per key
export const SIG_WORDS = SIG_BITS / 32;
export const BANDS = 8;           // title buckets: 8 bands of 16 bits of the title signature
export const KIND = Object.freeze({ title: 0, first: 1, lead: 2, section: 3, categories: 4 });
export const KIND_NAME = Object.freeze(['title', 'first', 'lead', 'section', 'categories']);
export const FORMAT = 2;
export const PRIOR_TOP = 8;       // heads kept per category
export const PRIOR_WEIGHT = 8;    // an answer's score gains PRIOR_WEIGHT x (share of the category); chosen on held-out records outside the bar's draw
export const WRITER_DEFAULTS = Object.freeze({ leadMax: 8, sectionMax: 4, maxSections: 24 });
export const HELDOUT_DEFAULTS = Object.freeze({ seed: 'knowledge-heldout-2026-09-23', every: 400 });
const REC_HEAD = 12;              // u32 len, u8 kind, u8 section, u16 flags, u32 article

// ----------------------------------------------------------------------------- words
export const STOP = new Set(('a an the and or but if then else of in on at by for with to from as into onto upon about above below over under after before during since until than that this these those there here which who whom whose what when where why how is are was were be been being am do does did done has have had having it its itself he him his she her hers they them their theirs we us our ours you your yours i me my mine not no nor so such too very can could may might must shall should will would also only just more most other some any each every all both either neither own same few many much one two three s t d ll m re ve y o per via etc like including include includes included within without across along around among between through throughout against toward towards near while whether because although though however yet still even ever often usually sometimes well de la le el du des der die das von van').split(' '));

/** Lowercase, diacritics folded, letters and digits of any script. @returns {string[]} */
export function tokens(s) {
  return String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}
/** The words a key is made of: tokens that are not stop words. */
export function contentWords(s) {
  const out = [];
  for (const t of tokens(s)) if (!STOP.has(t) && (t.length > 1 || /\d/.test(t))) out.push(t);
  return out;
}
export function uniq(list) { return [...new Set(list)]; }
/** A title's key words: its content words, or every token when all of them are stop words. */
export function titleWords(title) { const c = uniq(contentWords(title)); return c.length ? c : uniq(tokens(title)); }
/** The normalised title an exact lookup compares: every token, in order. */
export function normTitle(s) { return tokens(s).join(' '); }
export function normText(s) { return tokens(s).join(' '); }

/** The subject of "What is X?" (and who/which, are/was/were); otherwise the whole query. */
export function querySubject(q) {
  const m = /^\s*(?:what|who|which)\s+(?:is|are|was|were)\s+(.*?)[\s?.!]*$/i.exec(String(q));
  return (m ? m[1] : String(q)).trim();
}
/** The words a query is encoded from: the subject's key words. */
export function queryWords(q) { return titleWords(querySubject(q)); }

// ------------------------------------------------------------------- the key space
// The lanes are the values core/signal.mjs gives the same names: hvFromSeed(label) draws lane i
// as (u32 & 1) ? 1 : -1 from new RNG('hv:' + label), and bundle() breaks a zero lane with the
// first member times the tie vector hvRandom(new RNG('bundle:tie')). They are recomputed here in
// plain typed arrays so the tier never asks for the wasm heap; test/knowledge.test.mjs checks
// both against core/signal.mjs lane for lane.
let TIE = null;
function tie() {
  if (!TIE) { const r = new RNG('bundle:tie'); TIE = new Int8Array(D); for (let i = 0; i < D; i++) TIE[i] = (r.u32() & 1) ? 1 : -1; }
  return TIE;
}
const PREFIX = new Map(), PREFIX_CAP = 200000;
/** The first SIG_BITS lanes of hvFromSeed('word:' + w). */
export function wordPrefix(w) {
  let v = PREFIX.get(w);
  if (v) return v;
  const r = new RNG('hv:word:' + w);
  v = new Int8Array(SIG_BITS);
  for (let i = 0; i < SIG_BITS; i++) v[i] = (r.u32() & 1) ? 1 : -1;
  if (PREFIX.size < PREFIX_CAP) PREFIX.set(w, v);
  return v;
}
const FULL = new Map(), FULL_CAP = 4096;
/** All 8192 lanes of hvFromSeed('word:' + w), from a small recently used cache. */
export function wordVector(w) {
  let v = FULL.get(w);
  if (v) { FULL.delete(w); FULL.set(w, v); return v; }
  const r = new RNG('hv:word:' + w);
  v = new Int8Array(D);
  for (let i = 0; i < D; i++) v[i] = (r.u32() & 1) ? 1 : -1;
  FULL.set(w, v);
  if (FULL.size > FULL_CAP) FULL.delete(FULL.keys().next().value);
  return v;
}
/** bundle(members.map(w => hvFromSeed('word:' + w))) at the full width. @returns {Int8Array} */
export function keyVector(members) {
  const out = new Int8Array(D);
  if (!members.length) return out;
  const acc = new Int16Array(D), T = tie();
  for (const w of members) { const v = wordVector(w); for (let i = 0; i < D; i++) acc[i] += v[i]; }
  const f = wordVector(members[0]);
  for (let i = 0; i < D; i++) out[i] = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * T[i] || 1);
  return out;
}
/** The signature of the same bundle, from the first SIG_BITS lanes only. @returns {Uint32Array} */
export function sigOf(members, out = new Uint32Array(SIG_WORDS), off = 0) {
  for (let w = 0; w < SIG_WORDS; w++) out[off + w] = 0;
  if (!members.length) return out;
  const acc = new Int16Array(SIG_BITS), T = tie();
  for (const m of members) { const v = wordPrefix(m); for (let i = 0; i < SIG_BITS; i++) acc[i] += v[i]; }
  const f = wordPrefix(members[0]);
  for (let i = 0; i < SIG_BITS; i++) {
    const lane = acc[i] > 0 ? 1 : acc[i] < 0 ? -1 : (f[i] * T[i] || 1);
    if (lane > 0) out[off + (i >>> 5)] |= (1 << (i & 31));
  }
  return out;
}
/** The signature of a full vector: the sign bits of its first SIG_BITS lanes. */
export function sigOfVector(v, out = new Uint32Array(SIG_WORDS)) {
  out.fill(0);
  for (let i = 0; i < SIG_BITS; i++) if (v[i] > 0) out[i >>> 5] |= (1 << (i & 31));
  return out;
}
export function dot(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
export function simOf(a, b) { return dot(a, b) / a.length; }
function popcount32(x) {
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  x = (x + (x >>> 4)) & 0x0f0f0f0f;
  return (Math.imul(x, 0x01010101) >>> 24);
}
/** The members of a fact key: the article's title words twice, then the fact's own words. */
export function factMembers(tw, text) { return [...tw, ...tw, ...uniq(contentWords(text))]; }

// ------------------------------------------------------------ the same key, bit sliced
// keyVector() adds 8192 lanes per member into an Int16Array and takes signs: 78.7% of an answer()
// was spent there (a CPU profile of recall on this store, notes/native.md). The bundle of bipolar
// lanes is a MAJORITY, and a majority is a count, so the same key is computed here 32 lanes to a
// machine word: each member is its sign bits (bit set = lane +1), the per lane count of +1 is held
// in vertical binary counter planes (a ripple carry add per member), and the sign is the count
// compared with half the member count, from the most significant plane down. A tie (an even member
// count, exactly half +1) takes the first member times the tie vector, as bundle() does: +1 where
// the two agree. The result is keyVector's signs bit for bit (test/native.test.mjs checks it lane
// for lane), and simBits() is its similarity exactly: dot = D - 2 x hamming, the same integer.
const WORDS = D >>> 5;
let TIE_BITS = null;
/** The tie vector's sign bits. */
export function tieBits() {
  if (!TIE_BITS) { const t = tie(); TIE_BITS = new Int32Array(WORDS); for (let i = 0; i < D; i++) if (t[i] > 0) TIE_BITS[i >>> 5] |= (1 << (i & 31)); }
  return TIE_BITS;
}
// Two generations: a word read again while it is young or old stays; a full young generation
// becomes the old one and the oldest is dropped whole. 1 KB a word, at most 2 x BITS_GEN words.
const BITS_GEN = 32768;
let BITS_YOUNG = new Map(), BITS_OLD = new Map();
/** All 8192 lanes of hvFromSeed('word:' + w) as sign bits, 32 lanes a word. @returns {Int32Array} */
export function wordBits(w) {
  let v = BITS_YOUNG.get(w);
  if (v) return v;
  v = BITS_OLD.get(w);
  if (!v) {
    const r = new RNG('hv:word:' + w);
    v = new Int32Array(WORDS);
    for (let i = 0; i < D; i++) if (r.u32() & 1) v[i >>> 5] |= (1 << (i & 31));
  }
  if (BITS_YOUNG.size >= BITS_GEN) { BITS_OLD = BITS_YOUNG; BITS_YOUNG = new Map(); }
  BITS_YOUNG.set(w, v);
  return v;
}
const PLANES = 16;
const CNT = new Int32Array(PLANES * WORDS);
/**
 * The sign bits of keyVector(members), computed without the 8192 lane accumulator.
 * @param {string[]} members
 * @param {Int32Array} [out] WORDS words to write into
 * @returns {Int32Array|null} null for no members (keyVector's all zero vector)
 */
export function keyBits(members, out = new Int32Array(WORDS)) {
  const k = members.length;
  if (!k) return null;
  if (k >= 1 << PLANES) throw new Error('keyBits: ' + k + ' members is past the ' + ((1 << PLANES) - 1) + ' a counter holds');
  const B = 32 - Math.clz32(k);
  CNT.fill(0, 0, B * WORDS);
  for (let m = 0; m < k; m++) {
    const x = wordBits(members[m]);
    for (let j = 0; j < WORDS; j++) {
      let carry = x[j];
      for (let o = j; carry !== 0; o += WORDS) { const p = CNT[o]; CNT[o] = p ^ carry; carry = p & carry; }
    }
  }
  const t = k >>> 1, even = (k & 1) === 0, f = wordBits(members[0]), T = tieBits();
  for (let j = 0; j < WORDS; j++) {
    let gt = 0, eq = -1;
    for (let b = B - 1; b >= 0; b--) {
      const p = CNT[b * WORDS + j], tb = ((t >>> b) & 1) ? -1 : 0;
      gt |= eq & p & ~tb;
      eq &= ~(p ^ tb);
    }
    out[j] = even ? (gt | (eq & ~(f[j] ^ T[j]))) : gt;
  }
  return out;
}
/** simOf(keyVector(a), keyVector(b)) from their keyBits: (D - 2 x hamming) / D; 0 when either is empty. */
export function simBits(a, b) {
  if (!a || !b) return 0;
  let h = 0;
  for (let j = 0; j < WORDS; j++) h += popcount32(a[j] ^ b[j]);
  return (D - 2 * h) / D;
}
const KB = new Int32Array(WORDS);

/**
 * The confidence of a ranked answer list: the first answer's share of the summed positive scores,
 * 0 when there is none. act/prompt.mjs knowledgeAnswer() and memory/direct.mjs fill both read it
 * here, so the table and the ask path cannot disagree on which answers clear a floor.
 * @param {Array<{score: number}>} answers
 * @returns {number}
 */
export function confidenceOf(answers) {
  const top = answers && answers[0];
  if (!top) return 0;
  let total = 0;
  for (const a of answers) total += Math.max(0, a.score);
  return total > 0 ? Math.max(0, top.score) / total : 0;
}

// ------------------------------------------------------------ where and when
// A where or when question asks for a SPAN of the subject's own facts, not a key noun phrase:
// a date for when, a place for where. The spans are read from the facts of the subject's own
// article that recall() returns, and each is scored by the summed similarity of the facts that
// hold it divided by the fact's rank plus one, so a span in the best fact outweighs one repeated
// lower down. Nothing here was tuned on the held-out draw (notes/native.md).
const MONTH = '(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\\.?';
const DATE_RE = new RegExp('\\b(?:' + MONTH + '\\s+\\d{1,2},?\\s+\\d{3,4}|\\d{1,2}\\s+' + MONTH + ',?\\s+\\d{3,4}|' + MONTH + '\\s+\\d{3,4}|\\d{3,4}\\s*(?:BC|BCE|AD|CE)|\\d{4})\\b', 'g');
const PLACE_RE = /\b(?:in|at|near|on|of|from)\s+((?:the\s+)?\p{Lu}[\p{L}'’.-]*(?:(?:\s+|,\s+)(?:\p{Lu}[\p{L}'’.-]*|of|the|de|du|la|del|upon)){0,5})/gu;
const PLACE_TRIM = /(?:\s+|,\s*)(?:of|the|de|du|la|del|upon)$/;
// A place word may hold a period ("St. Louis", "D.C."), so the sentence's own full stop is caught
// with it: a word of four letters or more is not an abbreviation, and its final period is dropped.
const PLACE_STOP = /(\p{L}{4,})\.$/u;
const MONTH_ONLY = new RegExp('^(?:the\\s+)?' + MONTH + '$');
/** The spans of one kind in one text ('when': dates; 'where': capitalised places after in, at, near, on, of, from). */
export function spansOf(text, kind) {
  const out = [];
  if (kind === 'when') {
    for (const m of String(text).matchAll(DATE_RE)) out.push({ span: m[0], at: m.index });
  } else if (kind === 'where') {
    for (const m of String(text).matchAll(PLACE_RE)) {
      let s = m[1];
      s = s.replace(PLACE_STOP, (m, w) => w);
      while (PLACE_TRIM.test(s)) s = s.replace(PLACE_TRIM, '');
      if (!MONTH_ONLY.test(s)) out.push({ span: s, at: m.index });
    }
  }
  return out;
}

// -------------------------------------------------------------------- the answer rule
const COPULA = new Set(['is', 'was', 'are', 'were']);
const NP_SKIP = new Set(['a', 'an', 'the', 'also', 'often', 'usually', 'sometimes', 'now', 'still', 'currently', 'generally', 'commonly', 'mainly', 'mostly', 'any', 'some', 'very', 'most', 'both', 'either', 'only', 'just', 'probably', 'perhaps', 'typically', 'formerly', 'originally', 'officially', 'possibly', 'actually', 'always', 'once', 'today', 'widely', 'considered', 'regarded', 'thought', 'believed', 'said', 'called', 'known', 'described', 'seen', 'recognized', 'recognised', 'as', 'be', 'to', 'being', 'another', 'certain', 'particular', 'famous', 'popular']);
const NP_STOP = new Set(['of', 'in', 'on', 'at', 'by', 'for', 'with', 'to', 'from', 'that', 'which', 'who', 'whom', 'whose', 'where', 'when', 'near', 'between', 'about', 'as', 'into', 'during', 'since', 'until', 'than', 'and', 'or', 'but', 'located', 'found', 'made', 'used', 'born', 'known', 'called', 'named', 'based', 'written', 'directed', 'released', 'created', 'played', 'produced', 'published', 'formed', 'built', 'founded', 'set', 'the', 'a', 'an', 'is', 'was', 'are', 'were', 'has', 'have', 'had', 'it', 'its', 'their', 'his', 'her', 'there', 'this', 'these', 'those', 'like', 'such', 'including', 'within', 'without', 'across', 'along', 'around', 'after', 'before', 'under', 'over', 'above', 'below', 'through', 'throughout', 'against', 'among', 'towards', 'toward', 'upon', 'via', 'per', 'not', 'so', 'if', 'because', 'while', 'whether', 'being', 'can', 'could', 'may', 'will', 'would', 'should', 'living', 'working', 'best', 'mostly', 'mainly', 'usually', 'also', 'often', 'today']);
const CONTAINER = new Set(['type', 'types', 'kind', 'kinds', 'species', 'form', 'forms', 'genus', 'group', 'member', 'part', 'family', 'sort', 'variety', 'piece', 'set', 'breed', 'style', 'branch', 'subspecies', 'class', 'series', 'collection', 'name', 'unit', 'category', 'one', 'number', 'list', 'lot', 'range', 'order', 'subfamily', 'tribe', 'line', 'pair', 'couple', 'section', 'division', 'area']);
/** Heads that name a container of articles, never what one article is. */
export const GENERIC_HEAD = new Set(['people', 'births', 'deaths', 'stubs', 'articles', 'pages', 'things', 'lists', 'list', 'establishments', 'disestablishments']);
const PRONOUN = new Set(['it', 'this', 'he', 'she', 'they', 'these', 'there', 'its', 'both']);

function npTokens(s) {
  return String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/\([^()]*\)/g, ' ').replace(/\([^()]*\)/g, ' ')
    .match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*|[,;:.!?]/gu) || [];
}
const isWord = (t) => /^[\p{L}\p{N}]/u.test(t);
const validHead = (t) => /^\p{L}[\p{L}'’-]{2,}$/u.test(t) && !STOP.has(t) && !COPULA.has(t) && !NP_STOP.has(t);

const ORDINAL = new Set(['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'last', 'largest', 'biggest', 'smallest', 'oldest', 'highest', 'longest']);
const PARTICIPLE = new Set(['spoken', 'written', 'given', 'taken', 'seen', 'shown', 'drawn', 'grown', 'held', 'sold', 'told', 'kept', 'left', 'won', 'run', 'done', 'begun', 'chosen', 'driven', 'eaten', 'fallen', 'hidden', 'ridden', 'risen', 'stolen', 'thrown', 'worn', 'situated', 'bordered', 'surrounded', 'owned', 'operated', 'managed', 'governed', 'ruled', 'led', 'inhabited', 'populated', 'consisting', 'containing', 'having', 'starting', 'beginning', 'ending', 'running', 'flowing', 'lying', 'living', 'serving', 'covering', 'meaning', 'referring']);
const BREAK_AFTER = (t) => t === undefined || !isWord(t) || NP_STOP.has(t) || COPULA.has(t);
/** A participle that opens a reduced clause: "-ed", "-ing" or an irregular form followed by a preposition, a stop word or punctuation. */
const opensClause = (t, next) => (PARTICIPLE.has(t) || /(?:ed|ing)$/.test(t)) && BREAK_AFTER(next);

function collectNP(tk, i) {
  const np = [];
  while (i < tk.length && np.length < 6) {
    const t = tk[i];
    if (!isWord(t) || COPULA.has(t)) break;
    if ((t === 'and' || t === 'or') && np.length === 1 && ORDINAL.has(np[0]) && isWord(tk[i + 1] ?? '') && !NP_STOP.has(tk[i + 1])) { np.push(t); i++; continue; }
    if (NP_STOP.has(t) || opensClause(t, tk[i + 1])) break;
    if (PARTICIPLE.has(t) && np.length > 0) break;
    np.push(t); i++;
  }
  return [np, i];
}
function skip(tk, i) { while (i < tk.length && NP_SKIP.has(tk[i])) i++; return i; }

/**
 * The key noun phrase of a definitional sentence: the words after the first copula (is, was,
 * are, were; within the first 25 tokens once parentheses are removed), past determiners and
 * hedges, up to the first preposition, conjunction, relative word, participle or punctuation,
 * at most six words. "One of the", and container heads such as "a type of" or "a species of",
 * are stepped through to the noun phrase after "of". The head is the last word and must be a
 * word of three letters or more that is not a stop word. When the sentence opens with the title
 * (after an optional "the"), the copula is looked for after it, so a title that holds one
 * ("The Killers Are Our Guests is a movie") is not cut at its own verb.
 * @param {string} sentence
 * @param {string} [title]
 * @returns {{np: string, head: string, words: string[], subject: string[]}|null}
 */
export function keyNounPhrase(sentence, title) {
  const tk = npTokens(sentence);
  let from = 0;
  if (title) {
    const tt = npTokens(title).filter(isWord);
    const o = tk[0] === 'the' && tt[0] !== 'the' ? 1 : 0;
    if (tt.length && tt.every((w, j) => tk[o + j] === w)) from = o + tt.length;
  }
  let c = -1;
  for (let i = from; i < Math.min(tk.length, from + 25); i++) if (COPULA.has(tk[i])) { c = i; break; }
  if (c < 1) return null;
  const subject = tk.slice(0, c).filter(isWord);
  let i = skip(tk, c + 1);
  if (tk[i] === 'one' && tk[i + 1] === 'of') i = skip(tk, i + 2);
  let [np, j] = collectNP(tk, i);
  for (let hop = 0; hop < 2 && np.length && CONTAINER.has(np[np.length - 1]) && tk[j] === 'of'; hop++) {
    const [np2, j2] = collectNP(tk, skip(tk, j + 1));
    if (!np2.length) break;
    np = np2; j = j2;
  }
  while (np.length && !validHead(np[np.length - 1])) np.pop();
  if (!np.length) return null;
  return { np: np.join(' '), head: np[np.length - 1], words: np, subject };
}

/**
 * THE HELD-OUT RULE's eligibility: the first sentence has a key noun phrase AND is about the
 * title, so "What is <title>?" asks what the sentence answers. About the title means its subject
 * (the words before the copula) holds a word of the title (plural folded), or is a pronoun.
 * @returns {{np, head, words, subject}|null}
 */
export function heldAnswer(title, sentence) {
  const kp = keyNounPhrase(sentence, title);
  if (!kp) return null;
  const tw = new Set(titleWords(title).map(fold));
  const about = kp.subject.some((w) => tw.has(fold(w))) || (kp.subject.length === 1 && PRONOUN.has(kp.subject[0]));
  if (!about) return null;
  return kp;
}

/** The category names a categories fact lists. */
export function categoryNames(text) { return String(text).replace(/^Categories:\s*/, '').replace(/\.$/, '').split('; ').filter(Boolean); }

/** The noun phrase of a category name: its words up to the first stop word ("Capitals in Europe" is "capitals"). */
export function categoryNP(name) {
  const [np] = collectNP(npTokens(name), 0);
  while (np.length && !validHead(np[np.length - 1])) np.pop();
  return np.length ? { np: np.join(' '), head: np[np.length - 1], words: np } : null;
}

/** A simple plural fold, applied to both sides of every comparison. */
export function fold(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && /(ss|x|z|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) return w.slice(0, -1);
  return w;
}
/** True when the gold head is one of the answer's words (both folded). */
export function answerMatches(answerWords, goldHead) {
  const g = fold(goldHead);
  for (const w of answerWords) if (fold(w) === g) return true;
  return false;
}

/**
 * The answers a recalled fact gives to "What is <subject>?". A sentence answers only when it is
 * about the subject: its own subject contains every query word, or it comes from the subject's
 * own article and its subject is a pronoun or "the <noun>". A categories fact answers only for its
 * own article. @returns {Array<{np, head, words}>}
 */
export function answersOf(fact, subjectWords, sameArticle) {
  if (fact.kind === 'categories') {
    if (!sameArticle) return [];
    return categoryNames(fact.text).map(categoryNP).filter(Boolean);
  }
  const kp = keyNounPhrase(fact.text, fact.title);
  if (!kp) return [];
  const subj = new Set(kp.subject);
  const all = subjectWords.length > 0 && subjectWords.every((w) => subj.has(w));
  const anaphor = sameArticle && (kp.subject.length === 0 || (kp.subject.length === 1 && PRONOUN.has(kp.subject[0])) || (kp.subject.length === 2 && kp.subject[0] === 'the'));
  return all || anaphor ? [kp] : [];
}

/** The seeded held-out mark on a title. */
export function heldMark(title, o = HELDOUT_DEFAULTS) {
  const every = Math.max(1, Math.floor(o.every ?? HELDOUT_DEFAULTS.every));
  return every === 1 || hash32((o.seed ?? HELDOUT_DEFAULTS.seed) + '\u0000' + title) % every === 0;
}

// ---------------------------------------------------------------- growable arrays
class U32 {
  constructor(cap = 1 << 16) { this.a = new Uint32Array(cap); this.n = 0; }
  push(x) { if (this.n === this.a.length) { const b = new Uint32Array(this.a.length * 2); b.set(this.a); this.a = b; } this.a[this.n++] = x; }
  view() { return this.a.subarray(0, this.n); }
}

// ------------------------------------------------------------------------- writer
/**
 * Builds a store in one pass. addArticle() appends records and index entries as it goes;
 * finish() writes the text index, the title buckets and meta.json.
 */
export class KnowledgeWriter {
  constructor(dir, opts = {}) {
    this.dir = dir;
    this.o = { ...WRITER_DEFAULTS };
    for (const k of Object.keys(WRITER_DEFAULTS)) if (Number.isFinite(opts[k])) this.o[k] = opts[k];
    this.source = opts.source ?? null;
    fs.mkdirSync(dir, { recursive: true });
    for (const f of ['records.bin', 'items.bin', 'sigs.bin', 'articles.bin', 'heldout.jsonl']) fs.writeFileSync(path.join(dir, f), '');
    this.fd = {
      records: fs.openSync(path.join(dir, 'records.bin'), 'a'),
      items: fs.openSync(path.join(dir, 'items.bin'), 'a'),
      sigs: fs.openSync(path.join(dir, 'sigs.bin'), 'a'),
      articles: fs.openSync(path.join(dir, 'articles.bin'), 'a'),
      heldout: fs.openSync(path.join(dir, 'heldout.jsonl'), 'a'),
    };
    this.recPos = 0;
    this.nItems = 0;
    this.nArticles = 0;
    this.titleSigs = new U32(1 << 16);
    this.titleHash = new U32(1 << 14);
    this.vocab = new Map();
    this.pw = new U32(1 << 20); this.pi = new U32(1 << 20);
    this.hidden = new Set();
    this.catHeads = new Map(); // category name -> Map(head -> articles whose visible first sentence has that head)
    this.stats = { facts: 0, titles: 0, byKind: [0, 0, 0, 0, 0], sentencesSeen: 0, sentencesKept: 0, sectionsSeen: 0, sectionsKept: 0, leaksDropped: 0, heldout: 0, truncated: 0 };
    // batched writes: small buffers flushed when full
    this.buf = { records: [], items: [], sigs: [], articles: [] };
    this.bufBytes = 0;
    this.sig = new Uint32Array(SIG_WORDS);
  }

  _record(kind, section, article, text) {
    let bytes = Buffer.from(text, 'utf8');
    if (bytes.length > 65535) { bytes = bytes.subarray(0, 65535); this.stats.truncated++; }
    const head = Buffer.allocUnsafe(REC_HEAD);
    head.writeUInt32LE(bytes.length, 0); head.writeUInt8(kind, 4); head.writeUInt8(Math.min(section, 255), 5); head.writeUInt16LE(0, 6); head.writeUInt32LE(article, 8);
    const off = this.recPos + REC_HEAD;
    if (off + bytes.length > 0xffffffff) throw new Error('knowledge: records.bin past 4 GB; the index holds 32 bit offsets');
    this.buf.records.push(head, bytes);
    this.recPos += REC_HEAD + bytes.length;
    const it = Buffer.allocUnsafe(8);
    it.writeUInt32LE(off, 0); it.writeUInt16LE(bytes.length, 4); it.writeUInt8(kind, 6); it.writeUInt8(Math.min(section, 255), 7);
    this.buf.items.push(it);
    this.buf.sigs.push(Buffer.from(this.sig.buffer.slice(0)));
    this.bufBytes += REC_HEAD + bytes.length + 8 + SIG_BITS / 8;
    if (this.bufBytes > (8 << 20)) this._flush();
    return this.nItems++;
  }

  _flush() {
    for (const k of ['records', 'items', 'sigs', 'articles']) {
      if (!this.buf[k].length) continue;
      fs.writeSync(this.fd[k], Buffer.concat(this.buf[k]));
      this.buf[k] = [];
    }
    this.bufBytes = 0;
  }

  /**
   * @param {object} a { title, pageId, sections: [{heading, sentences}], categories: string[], hide: null | {sentence, np, head} }
   * @returns {{article: number, items: number, facts: number}}
   */
  addArticle(a) {
    const article = this.nArticles++;
    const tw = titleWords(a.title);
    const first = this.nItems;
    // the title item: its key is the title words alone
    sigOf(tw, this.sig);
    this._record(KIND.title, 0, article, a.title);
    for (let w = 0; w < SIG_WORDS; w++) this.titleSigs.push(this.sig[w]);
    this.titleHash.push(hash32(normTitle(a.title)));
    this.stats.titles++;
    let facts = 0;
    const addFact = (kind, section, text) => {
      const nt = normText(text);
      if (this.hidden.has(nt)) { this.stats.leaksDropped++; return; }
      const own = uniq(contentWords(text));
      sigOf([...tw, ...tw, ...own], this.sig);
      const id = this._record(kind, section, article, text);
      for (const w of own) {
        let wid = this.vocab.get(w);
        if (wid === undefined) { wid = this.vocab.size; this.vocab.set(w, wid); }
        this.pw.push(wid); this.pi.push(id);
      }
      this.stats.facts++; this.stats.byKind[kind]++; facts++;
    };
    const secs = a.sections || [];
    for (let s = 0; s < secs.length; s++) {
      const sents = secs[s].sentences || [];
      this.stats.sentencesSeen += sents.length;
      this.stats.sectionsSeen++;
      if (s > this.o.maxSections) continue;
      if (sents.length) this.stats.sectionsKept++;
      const cap = s === 0 ? this.o.leadMax : this.o.sectionMax;
      for (let k = 0; k < Math.min(cap, sents.length); k++) {
        if (s === 0 && k === 0 && a.hide) {
          this.hidden.add(normText(sents[0]));
          const rec = { article, title: a.title, pageId: a.pageId ?? 0, sentence: sents[0], np: a.hide.np, head: a.hide.head };
          fs.writeSync(this.fd.heldout, JSON.stringify(rec) + '\n');
          this.stats.heldout++;
          continue;
        }
        this.stats.sentencesKept++;
        addFact(s === 0 ? (k === 0 ? KIND.first : KIND.lead) : KIND.section, s, sents[k]);
      }
    }
    const cats = uniq((a.categories || []).map((c) => c.replace(/_/g, ' ').replace(/;/g, ',').trim()).filter(Boolean));
    if (cats.length) addFact(KIND.categories, 255, 'Categories: ' + cats.join('; ') + '.');
    // THE CATEGORY PRIOR: what the articles of a category are, read off their own first sentences.
    // A hidden first sentence is never counted, so the prior never carries a held-out answer.
    const lead0 = secs[0]?.sentences?.[0];
    if (cats.length && lead0 && !a.hide) {
      const kp = heldAnswer(a.title, lead0);
      if (kp) {
        const h = fold(kp.head);
        for (const c of cats) { let m = this.catHeads.get(c); if (!m) { m = new Map(); this.catHeads.set(c, m); } m.set(h, (m.get(h) || 0) + 1); }
      }
    }
    const ab = Buffer.allocUnsafe(12);
    ab.writeUInt32LE(first, 0); ab.writeUInt32LE(this.nItems - first, 4); ab.writeUInt32LE((a.pageId ?? 0) >>> 0, 8);
    this.buf.articles.push(ab);
    return { article, items: this.nItems - first, facts };
  }

  /** Write the text index, the title buckets, the title table and meta.json; close everything. */
  finish(extra = {}) {
    this._flush();
    for (const k of Object.keys(this.fd)) fs.closeSync(this.fd[k]);
    const dir = this.dir;
    // the text index: postings in item order per word (a counting sort), and a dictionary of
    // two 32 bit hashes per word, sorted, so a reader binary searches without a string table
    const V = this.vocab.size, pw = this.pw.view(), pi = this.pi.view();
    const cnt = new Uint32Array(V + 1);
    for (let i = 0; i < pw.length; i++) cnt[pw[i] + 1]++;
    for (let v = 0; v < V; v++) cnt[v + 1] += cnt[v];
    const post = new Uint32Array(pw.length), fill = cnt.slice(0, V);
    for (let i = 0; i < pw.length; i++) post[fill[pw[i]]++] = pi[i];
    fs.writeFileSync(path.join(dir, 'postings.bin'), Buffer.from(post.buffer, 0, post.byteLength));
    const h1 = new Uint32Array(V), h2 = new Uint32Array(V);
    for (const [w, id] of this.vocab) { h1[id] = hash32(w); h2[id] = hash2(w); }
    const order = new Uint32Array(V); for (let v = 0; v < V; v++) order[v] = v;
    order.sort((a, b) => (h1[a] - h1[b]) || (h2[a] - h2[b]));
    const dict = new Uint32Array(V * 4);
    for (let k = 0; k < V; k++) { const v = order[k]; dict[4 * k] = h1[v]; dict[4 * k + 1] = h2[v]; dict[4 * k + 2] = cnt[v]; dict[4 * k + 3] = cnt[v + 1] - cnt[v]; }
    fs.writeFileSync(path.join(dir, 'dict.bin'), Buffer.from(dict.buffer));
    // title buckets: BANDS bands of 16 bits, each a CSR over 65536 buckets
    const A = this.nArticles, ts = this.titleSigs.view();
    const bands = new Uint32Array(BANDS * (65537 + A));
    for (let b = 0; b < BANDS; b++) {
      const base = b * (65537 + A), offs = bands.subarray(base, base + 65537), ids = bands.subarray(base + 65537, base + 65537 + A);
      const val = (a) => (ts[a * SIG_WORDS + (b >>> 1)] >>> ((b & 1) * 16)) & 0xffff;
      for (let a = 0; a < A; a++) offs[val(a) + 1]++;
      for (let x = 0; x < 65536; x++) offs[x + 1] += offs[x];
      const at = offs.slice(0, 65536);
      for (let a = 0; a < A; a++) ids[at[val(a)]++] = a;
    }
    fs.writeFileSync(path.join(dir, 'tbands.bin'), Buffer.from(bands.buffer));
    // exact normalised title table, open addressing on hash32(normTitle)
    let T = 1; while (T < A * 2) T <<= 1;
    const table = new Uint32Array(Math.max(2, T)), th = this.titleHash.view();
    for (let a = 0; a < A; a++) { let s = th[a] & (table.length - 1); while (table[s] !== 0) s = (s + 1) & (table.length - 1); table[s] = a + 1; }
    fs.writeFileSync(path.join(dir, 'ttable.bin'), Buffer.from(table.buffer));
    fs.writeFileSync(path.join(dir, 'thash.bin'), Buffer.from(th.buffer, th.byteOffset, th.byteLength));
    // the category prior: a sorted (hash32, hash2) directory over a text blob of JSON rows
    // [total, head, count, head, count, ...] (the PRIOR_TOP most frequent heads)
    const cnames = [...this.catHeads.keys()];
    const ch1 = cnames.map((c) => hash32(c)), ch2 = cnames.map((c) => hash2(c));
    const corder = cnames.map((_, i) => i).sort((a, b) => (ch1[a] - ch1[b]) || (ch2[a] - ch2[b]));
    const cdir = new Uint32Array(cnames.length * 4), blobs = [];
    let cpos = 0;
    corder.forEach((ci, k) => {
      const m = this.catHeads.get(cnames[ci]);
      let tot = 0; for (const v of m.values()) tot += v;
      const top = [...m.entries()].sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1)).slice(0, PRIOR_TOP);
      const b = Buffer.from(JSON.stringify([tot, ...top.flat()]), 'utf8');
      cdir[4 * k] = ch1[ci]; cdir[4 * k + 1] = ch2[ci]; cdir[4 * k + 2] = cpos; cdir[4 * k + 3] = b.length;
      blobs.push(b); cpos += b.length;
    });
    fs.writeFileSync(path.join(dir, 'catdir.bin'), Buffer.from(cdir.buffer));
    fs.writeFileSync(path.join(dir, 'catheads.txt'), Buffer.concat(blobs));
    this.stats.categoriesWithPrior = cnames.length;
    this.catHeads = null;
    const files = {};
    for (const f of ['records.bin', 'items.bin', 'sigs.bin', 'articles.bin', 'postings.bin', 'dict.bin', 'tbands.bin', 'ttable.bin', 'thash.bin', 'catdir.bin', 'catheads.txt', 'heldout.jsonl']) files[f] = fs.statSync(path.join(dir, f)).size;
    const knowledgeBytes = Object.entries(files).filter(([f]) => f !== 'heldout.jsonl').reduce((s, [, b]) => s + b, 0);
    // what open() holds in memory: every file but the records and the postings, which stay on disk
    const residentBytes = files['items.bin'] + files['sigs.bin'] + files['articles.bin'] + files['dict.bin'] + files['tbands.bin'] + files['ttable.bin'] + files['thash.bin'] + files['catdir.bin'];
    const meta = {
      format: FORMAT, d: D, sigBits: SIG_BITS, bands: BANDS, kinds: KIND_NAME, writer: this.o, source: this.source,
      articles: A, items: this.nItems, facts: this.stats.facts, titles: this.stats.titles, vocab: V, postings: pw.length,
      stats: this.stats, files, knowledgeBytes, residentBytes, extra: sanitize(extra),
    };
    fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta, null, 1));
    this.vocab = null; this.pw = null; this.pi = null;
    const held = Math.max(1, extra.counts?.held ?? A);
    return {
      facts: this.stats.facts, titles: this.stats.titles, items: this.nItems, vocab: V, postings: pw.length, writerStats: this.stats,
      disk: { bytes: knowledgeBytes, files, bytesPerArticle: knowledgeBytes / held },
      memory: { bytes: residentBytes, bytesPerArticle: residentBytes / held },
    };
  }
}

function sanitize(x) { return JSON.parse(JSON.stringify(x ?? {})); }

/** A second, independent 32 bit string hash (FNV-1a over UTF-16 units with a different basis and a final mix). */
export function hash2(s) {
  let h = 0x9747b28c >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15; }
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16;
  return h >>> 0;
}

// ------------------------------------------------------------------------- reader
function readTyped(file, Ctor) {
  const b = fs.readFileSync(file);
  const ab = new ArrayBuffer(b.length);
  new Uint8Array(ab).set(b);
  return new Ctor(ab);
}

export const RECALL_DEFAULTS = Object.freeze({ k: 5, titleK: 3, titleMin: 0.5, rescore: 32, maxCandidates: 20000, maxPosting: 200000 });

export class KnowledgeStore {
  /** @param {string} dir a directory a KnowledgeWriter finished */
  static open(dir) { return new KnowledgeStore(dir); }

  constructor(dir) {
    this.dir = dir;
    this.meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
    if (this.meta.format !== FORMAT || this.meta.sigBits !== SIG_BITS) throw new Error('knowledge: store format ' + this.meta.format + '/' + this.meta.sigBits + ' is not ' + FORMAT + '/' + SIG_BITS);
    const items = readTyped(path.join(dir, 'items.bin'), Uint8Array);
    this.n = items.length / 8;
    this.itemOff = new Uint32Array(items.buffer); // stride 2
    this.itemU16 = new Uint16Array(items.buffer); // len at 4i + 2
    this.itemU8 = items;                          // kind at 8i + 6, section at 8i + 7
    this.sigs = readTyped(path.join(dir, 'sigs.bin'), Uint32Array);
    const arts = readTyped(path.join(dir, 'articles.bin'), Uint32Array);
    this.A = arts.length / 3;
    this.art = arts;
    this.dict = readTyped(path.join(dir, 'dict.bin'), Uint32Array);
    this.V = this.dict.length / 4;
    this.bands = readTyped(path.join(dir, 'tbands.bin'), Uint32Array);
    this.table = readTyped(path.join(dir, 'ttable.bin'), Uint32Array);
    this.thash = readTyped(path.join(dir, 'thash.bin'), Uint32Array);
    this.fdRec = fs.openSync(path.join(dir, 'records.bin'), 'r');
    this.fdPost = fs.openSync(path.join(dir, 'postings.bin'), 'r');
    this.catdir = readTyped(path.join(dir, 'catdir.bin'), Uint32Array);
    this.C = this.catdir.length / 4;
    this.fdCat = fs.openSync(path.join(dir, 'catheads.txt'), 'r');
    this._mark = new Uint32Array(this.n);
    this._stamp = 0;
    this.stats = { queries: 0, candidates: 0, rescored: 0, postingsRead: 0, titleHits: 0 };
    this._textBuf = Buffer.allocUnsafe(65536);
  }

  close() {
    if (this.fdRec !== null) { fs.closeSync(this.fdRec); this.fdRec = null; }
    if (this.fdPost !== null) { fs.closeSync(this.fdPost); this.fdPost = null; }
    if (this.fdCat !== null) { fs.closeSync(this.fdCat); this.fdCat = null; }
  }

  /** Bytes this store holds in memory once open. */
  residentBytes() {
    return this.itemU8.byteLength + this.sigs.byteLength + this.art.byteLength + this.dict.byteLength + this.bands.byteLength + this.table.byteLength + this.thash.byteLength + this.catdir.byteLength + this._mark.byteLength;
  }

  kindOf(i) { return this.itemU8[8 * i + 6]; }
  sectionOf(i) { return this.itemU8[8 * i + 7]; }
  /** The text of item i, read from records.bin. */
  text(i) {
    const off = this.itemOff[2 * i], len = this.itemU16[4 * i + 2];
    const b = len <= this._textBuf.length ? this._textBuf : Buffer.allocUnsafe(len);
    let got = 0;
    while (got < len) { const r = fs.readSync(this.fdRec, b, got, len - got, off + got); if (r <= 0) break; got += r; }
    return b.toString('utf8', 0, got);
  }
  /** The article an item belongs to (articles hold contiguous item ranges). */
  articleOf(i) {
    let lo = 0, hi = this.A - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >>> 1; if (this.art[3 * mid] <= i) lo = mid; else hi = mid - 1; }
    return lo;
  }
  titleItem(a) { return this.art[3 * a]; }
  title(a) { return this.text(this.art[3 * a]); }
  itemsOf(a) { const f = this.art[3 * a], n = this.art[3 * a + 1]; const out = []; for (let i = f + 1; i < f + n; i++) out.push(i); return out; }

  /** Articles whose normalised title equals this one's. */
  titleLookup(q) {
    const nt = normTitle(q), h = hash32(nt), T = this.table, mask = T.length - 1, out = [];
    for (let s = h & mask; T[s] !== 0; s = (s + 1) & mask) {
      const a = T[s] - 1;
      if (this.thash[a] === h && normTitle(this.title(a)) === nt) out.push(a);
    }
    return out;
  }

  /** The category prior of one category: { total, heads: [[head, count]...] } or null. */
  categoryPrior(name) {
    const a = hash32(name), b = hash2(name), d = this.catdir;
    let lo = 0, hi = this.C - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1, x = d[4 * mid], y = d[4 * mid + 1];
      if (x < a || (x === a && y < b)) lo = mid + 1;
      else if (x > a || (x === a && y > b)) hi = mid - 1;
      else {
        const buf = Buffer.allocUnsafe(d[4 * mid + 3]);
        fs.readSync(this.fdCat, buf, 0, buf.length, d[4 * mid + 2]);
        const j = JSON.parse(buf.toString('utf8')), heads = [];
        for (let k = 1; k + 1 < j.length; k += 2) heads.push([j[k], j[k + 1]]);
        return { total: j[0], heads };
      }
    }
    return null;
  }
  /** The category names of article a (its categories fact), or []. */
  categoriesOf(a) {
    const f = this.art[3 * a], n = this.art[3 * a + 1];
    for (let i = f + n - 1; i > f; i--) if (this.kindOf(i) === KIND.categories) return categoryNames(this.text(i));
    return [];
  }

  /** @returns {{off: number, cnt: number}|null} the postings of word w */
  posting(w) {
    const a = hash32(w), b = hash2(w), d = this.dict;
    let lo = 0, hi = this.V - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1, x = d[4 * mid], y = d[4 * mid + 1];
      if (x < a || (x === a && y < b)) lo = mid + 1;
      else if (x > a || (x === a && y > b)) hi = mid - 1;
      else return { off: d[4 * mid + 2], cnt: d[4 * mid + 3] };
    }
    return null;
  }
  readPosting(p) {
    const b = Buffer.allocUnsafe(p.cnt * 4);
    let got = 0;
    while (got < b.length) { const r = fs.readSync(this.fdPost, b, got, b.length - got, p.off * 4 + got); if (r <= 0) break; got += r; }
    this.stats.postingsRead += p.cnt;
    return new Uint32Array(b.buffer, b.byteOffset, p.cnt);
  }

  _sigSim(i, qs, table) {
    const S = table ?? this.sigs, off = i * SIG_WORDS;
    let h = 0;
    for (let w = 0; w < SIG_WORDS; w++) h += popcount32(S[off + w] ^ qs[w]);
    return 1 - (2 * h) / SIG_BITS;
  }

  /**
   * The best facts for a query, by hypervector similarity first and the text index second.
   * @param {string} query "What is X?" or any text
   * @param {object} [opts] see RECALL_DEFAULTS
   * @returns {{facts: object[], words: string[], titles: object[], ms: number, candidates: number}}
   */
  recall(query, opts = {}) {
    const o = { ...RECALL_DEFAULTS, ...opts };
    const t0 = process.hrtime.bigint();
    this.stats.queries++;
    const words = queryWords(query);
    if (!words.length) return { facts: [], words, titles: [], ms: 0, candidates: 0 };
    // the query key as sign bits (keyBits is keyVector's signs, bit for bit); its first
    // SIG_WORDS words ARE sigOfVector(keyVector(words))
    const qb = keyBits(words), qs = new Uint32Array(SIG_WORDS);
    for (let w = 0; w < SIG_WORDS; w++) qs[w] = qb[w] >>> 0;
    // (1) titles by hypervector: the exact normalised table and the banded signature buckets
    const tcand = new Set(this.titleLookup(querySubject(query)));
    for (let b = 0; b < BANDS; b++) {
      const base = b * (65537 + this.A), v = (qs[b >>> 1] >>> ((b & 1) * 16)) & 0xffff;
      const s = this.bands[base + v], e = this.bands[base + v + 1];
      for (let x = s; x < e && tcand.size < 4096; x++) tcand.add(this.bands[base + 65537 + x]);
    }
    const tscored = [];
    for (const a of tcand) tscored.push([a, this._sigSim(this.titleItem(a), qs)]);
    tscored.sort((x, y) => y[1] - x[1]);
    const titles = [];
    for (const [a] of tscored.slice(0, 16)) {
      const t = this.title(a);
      const s = simBits(qb, keyBits(titleWords(t), KB));
      if (s >= o.titleMin) titles.push({ article: a, title: t, sim: s });
    }
    titles.sort((x, y) => y.sim - x.sim || x.title.length - y.title.length);
    const top = titles.slice(0, o.titleK);
    this.stats.titleHits += top.length ? 1 : 0;
    // candidates: every fact of the matched articles, then facts the text index finds
    const stamp = ++this._stamp, cand = [], via = new Map();
    const add = (i, how) => { if (this._mark[i] !== stamp) { this._mark[i] = stamp; cand.push(i); via.set(i, how); } };
    for (const t of top) for (const i of this.itemsOf(t.article)) add(i, 'hv.title');
    // (2) the text index: rarest word first, intersected while the intersection is not empty
    const posts = words.map((w) => [w, this.posting(w)]).filter(([, p]) => p && p.cnt > 0 && p.cnt <= o.maxPosting).sort((x, y) => x[1].cnt - y[1].cnt);
    let set = null;
    for (const [, p] of posts) {
      const list = this.readPosting(p);
      if (set === null) { set = list; continue; }
      const next = intersect(set, list);
      if (!next.length) break;
      set = next;
    }
    if (set) for (let x = 0; x < set.length && cand.length < o.maxCandidates; x++) add(set[x], 'text.index');
    this.stats.candidates += cand.length;
    // (3) rank by signature similarity, rescore the head at the full 8192 lanes
    const scored = cand.map((i) => [i, this._sigSim(i, qs)]);
    scored.sort((x, y) => y[1] - x[1]);
    const head = scored.slice(0, Math.max(o.rescore, o.k));
    this.stats.rescored += head.length;
    const artTitle = new Map();
    const facts = head.map(([i, approx]) => {
      const a = this.articleOf(i);
      let t = artTitle.get(a); if (t === undefined) { t = this.title(a); artTitle.set(a, t); }
      const text = this.text(i);
      const s = simBits(qb, keyBits(factMembers(titleWords(t), text), KB));
      return { text, title: t, provenance: 'memory', tier: 'knowledge', sim: s, approx, via: via.get(i), kind: KIND_NAME[this.kindOf(i)], section: this.sectionOf(i), article: a, item: i };
    });
    facts.sort((x, y) => y.sim - x.sim || y.approx - x.approx || x.text.length - y.text.length);
    const ms = Number(process.hrtime.bigint() - t0) / 1e6;
    return { facts: facts.slice(0, o.k), words, titles: top, ms, candidates: cand.length };
  }

  /**
   * The best answers to "What is X?" from memory. Every recalled fact about X offers key noun
   * phrases (answersOf); an answer's score is the number of facts that offer it plus its SUPPORT,
   * the summed similarity of the recalled facts whose words contain its head noun. Heads that name
   * a category container (people, births, deaths...) are not answers. Ties keep recall order.
   * @param {string} query
   * @param {object} [opts] { pool: facts recalled (40), exclude(fact): true drops a fact }
   * @returns {{answers: object[], recall: object}}
   */
  answer(query, opts = {}) {
    const r = this.recall(query, { ...opts, k: opts.pool ?? 40 });
    const subject = querySubject(query), sw = titleWords(subject), nt = normTitle(subject);
    const facts = opts.exclude ? r.facts.filter((f) => !opts.exclude(f)) : r.facts;
    const m = new Map();
    for (const f of facts) {
      const same = normTitle(f.title) === nt;
      for (const a of answersOf(f, sw, same)) {
        if (GENERIC_HEAD.has(a.head)) continue;
        const key = fold(a.head);
        let e = m.get(key);
        if (!e) { e = { a: { ...a, fact: f.text, title: f.title, kind: f.kind, provenance: 'memory', sim: f.sim, item: f.item }, votes: 0, support: 0, order: m.size }; m.set(key, e); }
        e.votes++;
      }
    }
    if (m.size) {
      const toks = facts.map((f) => new Set(tokens(f.text).map(fold)));
      for (const [key, e] of m) for (let i = 0; i < facts.length; i++) if (toks[i].has(key)) e.support += Math.max(0, facts[i].sim);
    }
    // the category prior of the subject's own article: what the other members of its categories are
    const own = r.titles.find((t) => normTitle(t.title) === nt);
    if (own && opts.prior !== false) {
      for (const c of this.categoriesOf(own.article)) {
        const p = this.categoryPrior(c);
        if (!p) continue;
        for (const [hd, v] of p.heads) {
          if (GENERIC_HEAD.has(hd)) continue;
          let e = m.get(hd);
          if (!e) { e = { a: { np: hd, head: hd, words: [hd], fact: 'Category "' + c + '": ' + v + ' of ' + p.total + ' of its articles with a definition are a ' + hd + '.', title: own.title, kind: 'category.prior', provenance: 'memory', sim: 0, item: -1 }, votes: 0, support: 0, order: m.size }; m.set(hd, e); }
          e.prior = (e.prior || 0) + PRIOR_WEIGHT * v / p.total;
        }
      }
    }
    const sc = (e) => e.votes + e.support + (e.prior || 0);
    const answers = [...m.values()].sort((x, y) => sc(y) - sc(x) || x.order - y.order)
      .map((e) => ({ ...e.a, score: sc(e), votes: e.votes, support: e.support, prior: e.prior || 0 }));
    return { answers, recall: { ...r, facts } };
  }

  /**
   * The answer to "Where is X?" or "When was X?": a place or a date span of the subject's own
   * facts. Scored by summed fact similarity over rank plus one; the answers carry the fact, its
   * item and its article title like answer()'s do, with kind 'locate.where' or 'locate.when'.
   * @param {string} subject X
   * @param {'where'|'when'} kind
   * @param {object} [opts] { pool: facts recalled (40) }
   * @returns {{answers: object[], recall: object}}
   */
  locate(subject, kind, opts = {}) {
    const r = this.recall('What is ' + subject + '?', { ...opts, k: opts.pool ?? 40 });
    const nt = normTitle(subject), own = r.facts.filter((f) => normTitle(f.title) === nt);
    const m = new Map();
    own.forEach((f, rank) => {
      const seen = new Set();
      for (const { span } of spansOf(f.text, kind)) {
        const key = normText(span);
        if (!key || key === nt || seen.has(key)) continue;
        seen.add(key);
        let e = m.get(key);
        if (!e) { e = { np: span, head: tokens(span).slice(-1)[0] || key, words: tokens(span), fact: f.text, title: f.title, kind: 'locate.' + kind, provenance: 'memory', sim: f.sim, item: f.item, score: 0, order: m.size }; m.set(key, e); }
        e.score += Math.max(0, f.sim) / (rank + 1);
      }
    });
    const answers = [...m.values()].sort((x, y) => y.score - x.score || x.order - y.order);
    return { answers, recall: { ...r, facts: own.length ? own : r.facts } };
  }

  /**
   * Write the title keys of the articles with the most facts into a SemanticMemory through its
   * public learn(), at most the keys its byte budget holds (its capacity getter, memory/semantic.mjs).
   * @returns {number} concepts written
   */
  promote(semantic, opts = {}) {
    const cap = Number.isFinite(opts.n) ? opts.n : semantic.capacity;
    if (!Number.isFinite(cap)) throw new Error('knowledge.promote: the semantic tier states no capacity (its byte budget over its bytes per key)');
    const n = Math.min(cap, this.A);
    const order = Array.from({ length: this.A }, (_, a) => a).sort((x, y) => this.art[3 * y + 1] - this.art[3 * x + 1] || x - y).slice(0, n);
    for (const a of order) semantic.learn('knowledge:' + this.title(a), keyVector(titleWords(this.title(a))));
    return order.length;
  }
}

function intersect(a, b) {
  const out = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { out.push(a[i]); i++; j++; } else if (a[i] < b[j]) i++; else j++; }
  return Uint32Array.from(out);
}

/** Open the store, or null when the directory holds none. */
export function openKnowledge(dir) {
  try { return fs.existsSync(path.join(dir, 'meta.json')) ? KnowledgeStore.open(dir) : null; } catch { return null; }
}
