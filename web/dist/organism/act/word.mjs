// act/word.mjs: THE WORD PROBLEM READER. A whole word problem read into one exact expression, or null.
// Author: board 18 builder (cloud session, queue item 1). His orders: 2026-09-26 10:05 EDT "Every
// request should be less than a token and it should be done in microseconds", 10:48 EDT "400 B
// parameters in microseconds is not optional".
//
// spokenExpression (act/exact-read.mjs) reads "what is 17 times 23" into 17 * 23. This file does the
// same for a sentence problem: "Natalia sold clips to 48 of her friends in April, and then she sold half
// as many clips in May. How many clips did Natalia sell altogether in April and May?" is read into
// 48 + 48 / 2 and evaluated with BigInt rationals through tasks/exact.mjs, never a float.
//
// HOW IT READS. The text is cut into sentences and each sentence into clauses. Every number (digits,
// money, percent, number words, "a dozen", fractions) becomes a token; every capitalised word the
// grammar does not know becomes a NAME, bound to the entity it names; he, she, his, her and they are
// bound to the entity they point back to. Each clause must be matched WHOLE by one rule of the grammar
// below (a quantity owned, an event with its verb and its time, a relation: "twice as many", "half as
// many", "3 times as many", "5 more than", "4 fewer than", an age, a rate: "each", "per", "every", a
// price), and each rule adds linear equations over named quantities. The question sentence decides
// which quantity is asked (a sum over a verb and its times, what is left, how many more, how much
// money, how old). The equations are solved by exact substitution; the asked quantity must come out
// determined, or the record is null.
//
// THE REFUSAL RULE IS THE WHOLE POINT. A clause no rule reads whole, a word no rule consumes, a name
// the question asks about that no sentence bound, a pronoun with nothing to point at, a quantity the
// equations leave undetermined, an answer that is not a whole count where a count is asked: each one
// makes the whole record null. A partial reading is never an answer, because it would arrive wearing
// provenance exact. wordRefusal(text) returns the clause and the first word the reader stopped at.
//
// PURITY. This file imports tasks/exact.mjs and act/exact-read.mjs and nothing else: no module of the
// runtime, no file, no socket, no clock, no randomness. web/ask.mjs copies it byte for byte into the
// browser organism on dilation.dev. It is deterministic: the same text gives the same answer.
import * as E from '../tasks/exact.mjs';
import { tokenize, parseWhole, evalExact } from './exact-read.mjs';

export const WORD_METHOD = 'exact.word';
const MAX_CHARS = 4000;

// ================================================================ vocabulary
const UNITS_WORDS = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS_WORDS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const FRACTION_DEN = { half: 2, halves: 2, third: 3, thirds: 3, quarter: 4, quarters: 4, fourth: 4, fourths: 4, fifth: 5, fifths: 5, sixth: 6, sixths: 6, seventh: 7, sevenths: 7, eighth: 8, eighths: 8, ninth: 9, ninths: 9, tenth: 10, tenths: 10 };
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const PRONOUNS = ['he', 'she', 'they', 'it', 'i', 'we', 'you', 'him', 'her', 'them', 'his', 'hers', 'their', 'theirs', 'its', 'me', 'my', 'us', 'our', 'your', 'himself', 'herself', 'themselves'];

// Verbs, by their forms. The lemma is the key a quantity is filed under, so "sold" in the body and
// "sell" in the question are the same event. A verb not in this table is a word the grammar does not
// know, and a clause that needs it is refused.
const VERB_FORMS = {};
function verbs(list) {
  for (const row of list) {
    const [lemma, ...forms] = row.split(' ');
    VERB_FORMS[lemma] = lemma;
    for (const f of forms) VERB_FORMS[f] = lemma;
  }
}
verbs([
  'sell sells sold selling', 'buy buys bought buying', 'eat eats ate eaten eating', 'make makes made making', 'bake bakes baked baking',
  'pick picks picked picking', 'catch catches caught catching', 'find finds found finding', 'collect collects collected collecting',
  'read reads reading', 'write writes wrote written writing', 'get gets got gotten getting', 'receive receives received receiving',
  'give gives gave given giving', 'earn earns earned earning', 'spend spends spent spending', 'pay pays paid paying',
  'score scores scored scoring', 'run runs ran running', 'walk walks walked walking', 'drive drives drove driven driving',
  'swim swims swam swimming', 'ride rides rode ridden riding', 'win wins won winning', 'lose loses lost losing', 'plant plants planted planting',
  'grow grows grew grown growing', 'drink drinks drank drunk drinking', 'use uses used using', 'save saves saved saving',
  'watch watches watched watching', 'play plays played playing', 'work works worked working', 'sleep sleeps slept sleeping',
  'cook cooks cooked cooking', 'fold folds folded folding', 'wash washes washed washing', 'paint paints painted painting',
  'build builds built building', 'draw draws drew drawn drawing', 'sew sews sewed sewn sewing', 'knit knits knitted knitting',
  'order orders ordered ordering', 'send sends sent sending', 'bring brings brought bringing', 'take takes took taken taking',
  'see sees saw seen seeing', 'count counts counted counting', 'visit visits visited visiting', 'travel travels traveled travelled traveling travelling',
  'fly flies flew flown flying', 'jump jumps jumped jumping', 'hike hikes hiked hiking', 'bike bikes biked biking', 'lay lays laid laying',
  'produce produces produced producing', 'harvest harvests harvested harvesting', 'gather gathers gathered gathering', 'borrow borrows borrowed borrowing',
  'donate donates donated donating', 'raise raises raised raising', 'solve solves solved solving', 'answer answers answered answering',
  'complete completes completed completing', 'finish finishes finished finishing', 'sing sings sang sung singing', 'type types typed typing',
  'feed feeds fed feeding', 'fill fills filled filling', 'deliver delivers delivered delivering', 'shoot shoots shot shooting',
  'throw throws threw thrown throwing', 'kick kicks kicked kicking', 'climb climbs climbed climbing', 'mow mows mowed mown mowing',
  'clean cleans cleaned cleaning', 'teach teaches taught teaching', 'study studies studied studying', 'practice practices practiced practicing',
  'recycle recycles recycled recycling', 'pack packs packed packing', 'carry carries carried carrying', 'post posts posted posting',
  'download downloads downloaded downloading', 'bike bikes biked biking', 'row rows rowed rowing', 'skate skates skated skating',
  'need needs needed needing', 'have has had having', 'own owns owned owning', 'cost costs costing', 'weigh weighs weighed weighing',
  'contain contains contained containing', 'hold holds held holding', 'keep keeps kept keeping', 'share shares shared sharing',
  'split splits splitting', 'charge charges charged charging', 'plan plans planned planning', 'want wants wanted wanting',
  'decide decides decided deciding', 'go goes went gone going', 'come comes came coming', 'do does did done doing', 'be is are was were been being',
  'add adds added adding', 'put puts putting', 'lift lifts lifted lifting', 'sort sorts sorted sorting', 'invite invites invited inviting',
  'hire hires hired hiring', 'feed feeds fed feeding', 'rent rents rented renting', 'print prints printed printing',
  'live lives lived living', 'like likes liked liking', 'love loves loved loving', 'enjoy enjoys enjoyed enjoying', 'meet meets met meeting',
  'attend attends attended attending', 'host hosts hosted hosting', 'join joins joined joining', 'open opens opened opening',
  'start starts started starting', 'begin begins began begun beginning', 'hope hopes hoped hoping', 'try tries tried trying',
  'celebrate celebrates celebrated celebrating', 'prepare prepares prepared preparing', 'organize organizes organized organizing',
  'notice notices noticed noticing', 'realize realizes realized realizing', 'learn learns learned learnt learning', 'know knows knew known knowing',
  'think thinks thought thinking', 'look looks looked looking', 'stay stays stayed staying', 'wait waits waited waiting', 'arrive arrives arrived arriving',
]);
// the verbs whose object is spent out of, or added into, a stock the owner holds (for "left")
const LOSS_VERBS = new Set(['sell', 'eat', 'give', 'lose', 'spend', 'use', 'drink', 'donate', 'share']);
const GAIN_VERBS = new Set(['buy', 'get', 'receive', 'find', 'pick', 'catch', 'collect', 'earn', 'win', 'bake', 'make', 'grow', 'harvest', 'gather', 'borrow', 'save', 'produce']);

// Words a noun phrase can never be: they carry structure, and a noun slot that swallowed one would
// read a sentence it does not understand.
const RESERVED = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'as', 'than', 'into', 'onto', 'over', 'under',
  'more', 'less', 'fewer', 'times', 'each', 'every', 'per', 'how', 'many', 'much', 'what', 'which', 'who', 'whom', 'whose', 'if', 'then', 'that',
  'this', 'these', 'those', 'twice', 'thrice', 'half', 'double', 'triple', 'total', 'altogether', 'together', 'left', 'remaining', 'rest',
  'remainder', 'all', 'some', 'other', 'another', 'same', 'so', 'also', 'only', 'just', 'still', 'now', 'already', 'first', 'second', 'third',
  'next', 'last', 'after', 'before', 'while', 'when', 'during', 'there', 'here', 'not', 'no', 'any', 'both', 'either', 'neither', 'own',
  'again', 'too', 'very', 'about', 'around', 'up', 'down', 'out', 'off', 'away', 'back', 'will', 'would', 'can', 'could', 'should', 'must',
  'may', 'might', 'shall', 'number', 'amount', 'average', 'percent', 'percentage', 'daily', 'weekly', 'monthly', 'yearly', 'today',
  'yesterday', 'tomorrow', 'dozen', 'dozens', 'altogether', 'overall', 'combined', 'initially', 'originally', 'currently',
  'instead', 'equally', 'evenly', 'extra', 'additional', 'else', 'than', 'did', 'does', 'do', 'is', 'are', 'was', 'were', 'be', 'been',
  'has', 'have', 'had', 'old', 'older', 'younger', 'age', 'ages', 'years', 'year', 'ago',
  ...PRONOUNS, ...MONTHS, ...WEEKDAYS,
]);
for (const f of Object.keys(VERB_FORMS)) RESERVED.add(f);

// Plural to singular, so "clips" and "clip", "loaves" and "loaf" are one quantity across sentences.
const IRREGULAR_PLURALS = {
  children: 'child', people: 'person', men: 'man', women: 'woman', feet: 'foot', teeth: 'tooth', geese: 'goose', mice: 'mouse',
  loaves: 'loaf', leaves: 'leaf', knives: 'knife', wives: 'wife', lives: 'life', halves: 'half', shelves: 'shelf', wolves: 'wolf',
  calves: 'calf', scarves: 'scarf', sheep: 'sheep', fish: 'fish', deer: 'deer', series: 'series', species: 'species', cookies: 'cookie',
  pies: 'pie', movies: 'movie', calories: 'calorie', brownies: 'brownie', zombies: 'zombie', ties: 'tie', goalies: 'goalie', veggies: 'veggie',
  smoothies: 'smoothie', selfies: 'selfie', rookies: 'rookie', lies: 'lie', dies: 'die', hippies: 'hippie', aunties: 'auntie', kiddies: 'kiddie',
  bus: 'bus', buses: 'bus', gas: 'gas', glass: 'glass', dress: 'dress', class: 'class', grass: 'grass', boss: 'boss', pants: 'pants',
  jeans: 'jeans', shorts: 'shorts', scissors: 'scissors', glasses: 'glass', dresses: 'dress', classes: 'class', bosses: 'boss', kids: 'kid',
};
export function singular(w) {
  if (IRREGULAR_PLURALS[w]) return IRREGULAR_PLURALS[w];
  if (w.length <= 3) return w;
  if (/ss$/.test(w) || /us$/.test(w) || /is$/.test(w)) return w;
  if (/ies$/.test(w)) return w.slice(0, -3) + 'y';
  if (/(?:ch|sh|x|z|ss)es$/.test(w)) return w.slice(0, -2);
  if (/oes$/.test(w)) return w.slice(0, -2);
  if (/ves$/.test(w)) return w.slice(0, -3) + 'f';
  if (/s$/.test(w)) return w.slice(0, -1);
  return w;
}

// ================================================================ the text as tokens
// A token is { k: 'num'|'name'|'word'|'p', w: lower text, raw, v?: rational, money?, pct?, frac? }.
function cleanText(text) {
  let s = String(text ?? '');
  s = s.replace(/[\u2018\u2019\u02bc\u2032`]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, ' - ');
  s = s.replace(/\s+/g, ' ').trim();
  // the instruction the public benches append, a sentence the grammar reads as no quantity
  s = s.replace(/\s*Answer with the final number\.?\s*$/i, '');
  s = s.replace(/\b(Mr|Mrs|Ms|Dr|St|Jr|Sr)\./g, '$1');
  s = s.replace(/\b(?:Mr|Mrs|Ms|Miss|Dr|Mister|Uncle|Aunt|Grandma|Grandpa) (?=[A-Z][a-z])/g, '');
  s = s.replace(/\b([ap])\.m\./gi, '$1m');
  s = s.replace(/\$\s?(\d{1,3})((?: \d{3})+)(?!\d)/g, (m, a, b) => '$' + a + b.replace(/ /g, ''));
  return s;
}

function splitSentences(s) {
  const out = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    cur += c;
    if (c === '.' || c === '?' || c === '!') {
      const prev = s[i - 1] || '', next = s[i + 1] || '';
      if (c === '.' && /[\d$]/.test(prev) && /\d/.test(next)) continue;        // a decimal point
      if (c === '.' && prev === ' ' && /\d/.test(next)) continue;              // ".5"
      if (next === '' || next === ' ' || next === '"') {
        while (s[i + 1] === '"') { cur += '"'; i++; }
        out.push(cur.trim());
        cur = '';
      }
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const TOKEN_RE = /\$\s?\d{1,3}(?:,\d{3})+(?:\.\d+)?|\$\s?\d+(?:\.\d+)?|\$\.\d+|\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?(?:\/\d+)?|\.\d+|[A-Za-z]+(?:['-][A-Za-z]+)*'?|[,;:%()"!?.]|\S/g;

function rawTokens(sentence) {
  const out = [];
  for (const m of sentence.matchAll(TOKEN_RE)) out.push({ t: m[0], at: m.index, end: m.index + m[0].length });
  return out;
}

function numQ(text) {
  const t = text.replace(/,/g, '');
  if (t.includes('/')) { const [a, b] = t.split('/'); const bq = E.qFromString(b); if (bq.n === 0n) return null; return E.qDiv(E.qFromString(a), bq); }
  return E.qFromString(t);
}

/** The sentence as tokens, numbers read, or { stop } naming the first thing it cannot tokenize. */
function lexSentence(sentence) {
  const raw = rawTokens(sentence);
  const toks = [];
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i], t = r.t;
    const glued = (j) => raw[j] && raw[j].at === raw[j - 1].end;
    if (/^\$/.test(t)) { const q = numQ(t.replace(/^\$\s?/, '')); if (!q) return { stop: t }; toks.push({ k: 'num', w: '$', raw: t, v: q, money: true }); continue; }
    if (/^[\d.]/.test(t) && /\d/.test(t)) {
      const q = numQ(t);
      if (!q) return { stop: t };
      const tok = { k: 'num', w: '#', raw: t, v: q, frac: t.includes('/') };
      // "4th", "20th", "1st": an ordinal, a word and not a quantity
      if (glued(i + 1) && /^(st|nd|rd|th)$/i.test(raw[i + 1].t)) { toks.push({ k: 'word', w: 'ordinal', raw: t + raw[i + 1].t }); i++; continue; }
      if (tok.frac && glued(i + 1) && /^(ths?|rds?|nds?)$/i.test(raw[i + 1].t)) i++;       // "3/4ths"
      if (glued(i + 1) && raw[i + 1].t === '%') { tok.pct = true; i++; }
      // "2:15" is a clock time, which this reader does not read
      if (glued(i + 1) && raw[i + 1].t === ':' && raw[i + 2] && /^\d/.test(raw[i + 2].t)) return { stop: t + ':' + raw[i + 2].t };
      toks.push(tok);
      // "60-mile", "10-hour": the number, then the unit word
      if (glued(i + 1) && raw[i + 1].t === '-' && raw[i + 2] && /^[A-Za-z]/.test(raw[i + 2].t)) i++;
      continue;
    }
    if (/^[A-Za-z]/.test(t)) {
      let word = t;
      let poss = null;
      if (/'s$/i.test(word)) { poss = "'s"; word = word.slice(0, -2); }
      else if (/s'$/i.test(word)) { poss = "'"; word = word.slice(0, -1); }
      else if (/'$/.test(word)) word = word.slice(0, -1);
      // hyphenated number words and fractions are split so the number reader sees their parts
      const parts = word.split('-');
      const lowParts = parts.map((p) => p.toLowerCase());
      const numberish = lowParts.every((p) => p in UNITS_WORDS || p in TENS_WORDS || p in FRACTION_DEN || p === 'a' || p === 'hundred' || p === 'thousand');
      if (parts.length > 1 && (numberish || lowParts[0] === 'half')) { for (const p of parts) toks.push({ k: 'word', w: p.toLowerCase(), raw: p, cap: /^[A-Z]/.test(p) }); }
      else toks.push({ k: 'word', w: word.toLowerCase(), raw: word, cap: /^[A-Z]/.test(word) });
      if (poss) toks.push({ k: 'word', w: "'s", raw: poss });
      continue;
    }
    if (t === '"' || t === '(' || t === ')') continue;           // quotation marks and brackets carry no quantity
    if (t === '%') { const last = toks[toks.length - 1]; if (last && last.k === 'num') { last.pct = true; continue; } return { stop: '%' }; }
    if (t === ',' || t === ';' || t === ':' || t === '?' || t === '.' || t === '!') { toks.push({ k: 'p', w: t, raw: t }); continue; }
    return { stop: t };
  }
  return { toks: numberWords(toks) };
}

// Number words: "twenty five", "a dozen", "two dozen", "three and a half", "one third", "two-thirds",
// "a quarter of", "half an hour". Everything else stays a word.
function numberWords(toks) {
  const out = [];
  const isW = (t, w) => t && t.k === 'word' && t.w === w;
  for (let i = 0; i < toks.length; i++) {
    const t = toks[i];
    if (t.k !== 'word') { out.push(t); continue; }
    const w = t.w;
    let val = null, j = i;
    if (w in UNITS_WORDS || w in TENS_WORDS) {
      val = BigInt(UNITS_WORDS[w] ?? TENS_WORDS[w]);
      j = i + 1;
      if (w in TENS_WORDS && toks[j] && toks[j].k === 'word' && toks[j].w in UNITS_WORDS && UNITS_WORDS[toks[j].w] > 0 && UNITS_WORDS[toks[j].w] < 10) { val += BigInt(UNITS_WORDS[toks[j].w]); j++; }
      if (isW(toks[j], 'hundred')) { val *= 100n; j++; if (toks[j] && toks[j].k === 'word' && (toks[j].w in UNITS_WORDS || toks[j].w in TENS_WORDS)) { let r = BigInt(UNITS_WORDS[toks[j].w] ?? TENS_WORDS[toks[j].w]); j++; if (toks[j] && toks[j].k === 'word' && toks[j].w in UNITS_WORDS) { r += BigInt(UNITS_WORDS[toks[j].w]); j++; } val += r; } }
      if (isW(toks[j], 'thousand')) { val *= 1000n; j++; }
      // "one third", "two thirds", "three quarters" (not "the third", which is an ordinal)
      if (toks[j] && toks[j].k === 'word' && toks[j].w in FRACTION_DEN && val > 0n && val < 10n && !(val === 1n && toks[j].w === 'half' && false)) {
        const den = BigInt(FRACTION_DEN[toks[j].w]);
        const plural = /s$/.test(toks[j].w);
        if ((val === 1n && !plural) || (val > 1n && plural)) { out.push({ k: 'num', w: '#', raw: toks.slice(i, j + 1).map((x) => x.raw).join(' '), v: E.Q(val, den), frac: true }); i = j; continue; }
      }
      // "three and a half"
      if (isW(toks[j], 'and') && isW(toks[j + 1], 'a') && isW(toks[j + 2], 'half')) { out.push({ k: 'num', w: '#', raw: toks.slice(i, j + 3).map((x) => x.raw).join(' '), v: E.Q(val * 2n + 1n, 2n) }); i = j + 2; continue; }
      if (isW(toks[j], 'dozen')) { out.push({ k: 'num', w: '#', raw: toks.slice(i, j + 1).map((x) => x.raw).join(' '), v: E.Q(val * 12n) }); i = j; continue; }
      out.push({ k: 'num', w: '#', raw: toks.slice(i, j).map((x) => x.raw).join(' '), v: E.Q(val), word: true, one: val === 1n && j === i + 1 });
      i = j - 1;
      continue;
    }
    if (w === 'a' || w === 'an') {
      const n = toks[i + 1];
      if (isW(n, 'dozen')) { out.push({ k: 'num', w: '#', raw: 'a dozen', v: E.Q(12n) }); i += 1; continue; }
      if (n && n.k === 'word' && (n.w === 'third' || n.w === 'quarter' || n.w === 'fourth' || n.w === 'fifth' || n.w === 'tenth')) { out.push({ k: 'num', w: '#', raw: 'a ' + n.w, v: E.Q(1n, BigInt(FRACTION_DEN[n.w])), frac: true }); i += 1; continue; }
      if (isW(n, 'half') && !(out.length && out[out.length - 1].k === 'word' && out[out.length - 1].w === 'and')) { out.push({ k: 'num', w: '#', raw: 'a half', v: E.Q(1n, 2n), frac: true }); i += 1; continue; }
    }
    if (w === 'half' && toks[i + 1] && toks[i + 1].k === 'word' && (toks[i + 1].w === 'a' || toks[i + 1].w === 'an')) {
      if (isW(toks[i + 2], 'dozen')) { out.push({ k: 'num', w: '#', raw: 'half a dozen', v: E.Q(6n) }); i += 2; continue; }
      out.push({ k: 'num', w: '#', raw: 'half ' + toks[i + 1].w, v: E.Q(1n, 2n), frac: true }); i += 1; continue;
    }
    if (w === 'dozen' && out.length && out[out.length - 1].k === 'num') { const last = out[out.length - 1]; last.v = E.qMul(last.v, E.Q(12n)); last.raw += ' dozen'; continue; }
    if (w === 'percent' && out.length && out[out.length - 1].k === 'num') { out[out.length - 1].pct = true; continue; }
    if ((w === 'dollars' || w === 'dollar') && out.length && out[out.length - 1].k === 'num' && !out[out.length - 1].money) { out[out.length - 1].money = true; continue; }
    if ((w === 'cents' || w === 'cent') && out.length && out[out.length - 1].k === 'num' && !out[out.length - 1].money) { const last = out[out.length - 1]; last.v = E.qDiv(last.v, E.Q(100n)); last.money = true; continue; }
    out.push(t);
  }
  return out;
}

// ================================================================ names
const KNOWN_CAPITALS = new Set([...MONTHS, ...WEEKDAYS, 'i', 'if', 'the', 'a', 'an', 'how', 'what', 'there', 'each', 'every', 'after', 'before', 'on', 'in', 'at', 'for', 'then', 'she', 'he', 'they', 'it', 'his', 'her', 'their', 'its', 'we', 'you', 'my', 'our', 'your', 'when', 'while', 'last', 'this', 'next', 'today', 'yesterday', 'tomorrow', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'so', 'but', 'and', 'also', 'finally', 'first', 'later', 'now', 'meanwhile', 'however', 'calculate', 'find', 'determine', 'together', 'altogether', 'some', 'all', 'both', 'half', 'twice']);

/** Every capitalised word the grammar does not know is a name; returns the set of name keys. */
function findNames(sentences) {
  const lowerSeen = new Set();
  for (const s of sentences) for (const t of s) if (t.k === 'word' && !t.cap) lowerSeen.add(t.w);
  const names = new Set();
  for (const s of sentences) {
    for (let i = 0; i < s.length; i++) {
      const t = s[i];
      if (t.k !== 'word' || !t.cap || t.w === "'s") continue;
      if (KNOWN_CAPITALS.has(t.w) || VERB_FORMS[t.w]) continue;
      if (i === 0 && (lowerSeen.has(t.w) || RESERVED.has(t.w))) continue;
      names.add(t.w);
    }
  }
  return names;
}

// ================================================================ exact expressions and linear forms
// An expression tree prints the answer's arithmetic in the grammar act/exact-read.mjs parses, and the
// value is checked back through that parser before anything is returned.
const lit = (q) => ({ op: 'q', v: q });
const isLit = (e) => e.op === 'q';
const zero = (e) => isLit(e) && E.qIsZero(e.v);
function xAdd(a, b) { if (zero(a)) return b; if (zero(b)) return a; if (isLit(b) && b.v.n < 0n) return { op: '-', a, b: lit(E.qNeg(b.v)) }; if (b.op === 'neg') return xSub(a, b.a); if (a.op === 'neg') return xSub(b, a.a); return { op: '+', a, b }; }
function xSub(a, b) { if (zero(b)) return a; if (isLit(b) && b.v.n < 0n) return { op: '+', a, b: lit(E.qNeg(b.v)) }; if (b.op === 'neg') return xAdd(a, b.a); if (zero(a)) return xNeg(b); return { op: '-', a, b }; }
function xNeg(a) { if (isLit(a)) return lit(E.qNeg(a.v)); if (a.op === 'neg') return a.a; return { op: 'neg', a }; }
function xMulQ(a, k) {
  if (E.qEq(k, E.Q1)) return a;
  if (E.qEq(k, E.qNeg(E.Q1))) return xNeg(a);
  if (isLit(a) && (E.qIsZero(a.v) || k.d === 1n && k.n === -1n)) return lit(E.qMul(a.v, k));
  if (k.n === 1n) return { op: '/', a, b: lit(E.Q(k.d)) };
  if (k.n === -1n) return xNeg({ op: '/', a, b: lit(E.Q(k.d)) });
  return { op: '*', a: lit(k), b: a };
}
function xMul(a, b) { if (isLit(b)) return xMulQ(a, b.v); if (isLit(a)) return xMulQ(b, a.v); return { op: '*', a, b }; }
function xDiv(a, b) { if (isLit(b)) return xMulQ(a, E.qDiv(E.Q1, b.v)); return { op: '/', a, b }; }
const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, q: 4 };
function qText(q) { const d = E.qToDecimal(q); return d !== null ? d : E.qToString(q); }
export function exprText(e, parent = 0, right = false) {
  if (e.op === 'q') {
    const s = qText(e.v);
    return e.v.n < 0n && parent > 0 ? '(' + s + ')' : s;
  }
  const p = PREC[e.op];
  const s = e.op === 'neg' ? '-' + exprText(e.a, 3) : exprText(e.a, p) + ' ' + e.op + ' ' + exprText(e.b, p, true);
  return p < parent || (right && p === parent) ? '(' + s + ')' : s;
}

// A linear form: value = c + sum over t of coefficient times variable. c carries its expression.
function fConst(q, x) { return { c: q, x: x || lit(q), t: new Map() }; }
function fVar(name) { return { c: E.Q0, x: lit(E.Q0), t: new Map([[name, E.Q1]]) }; }
function fAdd(f, g) {
  const t = new Map(f.t);
  for (const [k, v] of g.t) { const s = E.qAdd(t.get(k) || E.Q0, v); if (E.qIsZero(s)) t.delete(k); else t.set(k, s); }
  return { c: E.qAdd(f.c, g.c), x: xAdd(f.x, g.x), t };
}
function fScale(f, k, kx) {
  const t = new Map();
  for (const [key, v] of f.t) { const s = E.qMul(v, k); if (!E.qIsZero(s)) t.set(key, s); }
  return { c: E.qMul(f.c, k), x: kx ? xMul(f.x, kx) : xMulQ(f.x, k), t };
}
function fSub(f, g) { return fAdd(f, fScale(g, E.qNeg(E.Q1))); }
const fKnown = (f) => f.t.size === 0;

// Exact substitution: each solved variable is replaced everywhere by its form. The order is the order
// the equations came in, so the same text always solves the same way.
class System {
  constructor() { this.sub = new Map(); this.bad = null; }
  reduce(f) {
    let out = { c: f.c, x: f.x, t: new Map() };
    for (const [k, v] of f.t) {
      const s = this.sub.get(k);
      if (s) out = fAdd(out, fScale(s, v));
      else { const cur = E.qAdd(out.t.get(k) || E.Q0, v); if (E.qIsZero(cur)) out.t.delete(k); else out.t.set(k, cur); }
    }
    return out;
  }
  /** lhs = rhs. Returns false when the equation contradicts what is already known. */
  eq(lhs, rhs) {
    const l = this.reduce(lhs), r = this.reduce(rhs);
    const d = fSub(l, r);
    if (d.t.size === 0) { if (!E.qIsZero(d.c)) { this.bad = 'contradiction'; return false; } return true; }
    // solve for a variable of the left side when it has one, else of the right
    let v = null;
    for (const k of l.t.keys()) if (d.t.has(k)) { v = k; break; }
    if (v === null) for (const k of d.t.keys()) { v = k; break; }
    const a = d.t.get(v);
    // v = (r - (l without v)) / a, with l and r kept apart so the expression reads the way the text did
    const lRest = { c: l.c, x: l.x, t: new Map(l.t) }; const la = lRest.t.get(v) || E.Q0; lRest.t.delete(v);
    const rRest = { c: r.c, x: r.x, t: new Map(r.t) }; const ra = rRest.t.get(v) || E.Q0; rRest.t.delete(v);
    const coef = E.qSub(la, ra);
    let sol = fSub(rRest, lRest);
    sol = fScale(sol, E.qDiv(E.Q1, coef));
    this.sub.set(v, sol);
    for (const [k, f] of this.sub) if (k !== v && f.t.has(v)) this.sub.set(k, this.reduce(f));
    return true;
  }
  value(f) { const r = this.reduce(f); return r.t.size === 0 ? r : null; }
}

// ================================================================ units
// Only the conversions that are definitions. A month is four weeks in one problem and thirty days in
// another, so a month converts to nothing unless the text says so.
const UNIT_OF = {
  second: 'second', seconds: 'second', sec: 'second', secs: 'second', minute: 'minute', minutes: 'minute', min: 'minute', mins: 'minute',
  hour: 'hour', hours: 'hour', hr: 'hour', hrs: 'hour', day: 'day', days: 'day', week: 'week', weeks: 'week', month: 'month', months: 'month',
  year: 'year', years: 'year', inch: 'inch', inches: 'inch', foot: 'foot', feet: 'foot', yard: 'yard', yards: 'yard', dollar: 'dollar', dollars: 'dollar',
  cent: 'cent', cents: 'cent', night: 'night', nights: 'night', morning: 'morning', afternoon: 'afternoon', evening: 'evening',
};
const BASE = { second: [ 'time', 1n ], minute: [ 'time', 60n ], hour: [ 'time', 3600n ], day: [ 'time', 86400n ], week: [ 'time', 604800n ], inch: [ 'len', 1n ], foot: [ 'len', 12n ], yard: [ 'len', 36n ], cent: [ 'money', 1n ], dollar: [ 'money', 100n ] };
const PAIRS = { 'year>month': 12n, 'year>week': 52n, 'year>day': 365n, 'month>week': 4n, 'month>day': 30n };
/** How many `to` are in one `from`, as a rational, or null when no definition says. */
function unitsIn(from, to, world) {
  if (from === to) return E.Q1;
  const said = world && world.conv.get(from + '>' + to);
  if (said) return said;
  const back = world && world.conv.get(to + '>' + from);
  if (back) return E.qDiv(E.Q1, back);
  if (PAIRS[from + '>' + to]) return E.Q(PAIRS[from + '>' + to]);
  if (PAIRS[to + '>' + from]) return E.Q(1n, PAIRS[to + '>' + from]);
  const a = BASE[from], b = BASE[to];
  if (a && b && a[0] === b[0]) return E.Q(a[1], b[1]);
  return null;
}
const isTimeUnit = (u) => u === 'second' || u === 'minute' || u === 'hour' || u === 'day' || u === 'week' || u === 'month' || u === 'year';

// ================================================================ the world the sentences build
class World {
  constructor(names) {
    this.names = names;
    this.sys = new System();
    this.facts = [];          // { owner, item, verb, time, v, nums }
    this.rates = [];          // { owner, verb, num, den, v, nums }  num per one den
    this.durations = [];      // { owner, verb, q (in unit), unit, nums }
    this.ages = new Map();    // owner -> variable
    this.eqs = [];            // { vars: Set, nums: Set }: what the unused-number check walks
    this.groups = new Map();  // group key -> members
    this.conv = new Map();
    this.totals = [];         // { item, q, nums }: "a total of 341 cards"
    this.freeNums = new Set(); // numbers a rule checked against the text (a count of names)
    this.nvar = 0;
    this.lastPerson = null;
    this.persons = [];
    this.lastFact = null;
    this.lastItem = null;
    this.lastGroup = null;
    this.steps = 0;
  }
  newVar(label) { return 'v' + (this.nvar++) + ':' + label; }
  person(key) {
    if (!this.persons.includes(key)) this.persons.push(key);
    this.lastPerson = key;
    return key;
  }
  /** lhs = rhs, remembering which numbers of the text it used. */
  equate(v, form, nums) {
    this.eqs.push({ vars: new Set([v, ...form.t.keys()]), nums: new Set(nums || []) });
    this.steps++;
    return this.sys.eq(fVar(v), form);
  }
  fact(owner, item, verb, time, form, nums) {
    // a quantity another sentence already pointed at ("twice as many as Rory") is the same quantity
    // and a quantity restated ("If Samantha has 27 paintings") is the same quantity as well
    const same = (x) => x.owner === owner && x.verb === verb && (x.time || null) === (time || null);
    let ph = verb === 'have' ? this.facts.filter((x) => same(x) && x.item === item) : this.facts.filter((x) => same(x) && x.ref && x.item === item);
    if (!ph.length) ph = this.facts.filter((x) => same(x) && x.ref && itemMatch(x.item, item));
    ph = ph.length === 1 ? ph[0] : null;
    if (ph) {
      ph.ref = false;
      if (form && !this.equate(ph.v, form, nums)) return null;
      this.lastFact = ph; this.lastItem = ph.item;
      return ph;
    }
    const v = this.newVar(owner + '|' + item + '|' + verb + '|' + (time || ''));
    const f = { owner, item, verb, time: time || null, v };
    this.facts.push(f);
    if (form && !this.equate(v, form, nums)) return null;
    this.lastFact = f;
    this.lastItem = item;
    return f;
  }
  /** The fact for this owner, verb, item and time, made unknown when no sentence gave it yet. */
  factFor(owner, item, verb, time, exactOnly = false) {
    const same = (f) => f.owner === owner && f.verb === verb && (f.time || null) === (time || null);
    let hit = this.facts.filter((f) => same(f) && f.item === item);
    if (!hit.length && !exactOnly) hit = this.facts.filter((f) => same(f) && itemMatch(f.item, item));
    if (hit.length === 1) return hit[0];
    if (hit.length > 1) return null;
    const v = this.newVar(owner + '|' + item + '|' + verb + '|' + (time || ''));
    const f = { owner, item, verb, time: time || null, v, ref: true };
    this.facts.push(f);
    return f;
  }
  rate(owner, verb, num, den, form, nums) {
    const v = this.newVar('rate|' + owner + '|' + num + '/' + den);
    const x = { owner, verb, num, den, v };
    this.rates.push(x);
    if (!this.equate(v, form, nums)) return null;
    this.lastItem = den;
    return x;
  }
  ageVar(owner) {
    if (!this.ages.has(owner)) this.ages.set(owner, this.newVar('age|' + owner));
    return this.ages.get(owner);
  }
  /** Every number the answer's variables depend on, through the equations that mention them. */
  usedNums(vars) {
    const seen = new Set(vars), nums = new Set();
    let grew = true;
    while (grew) {
      grew = false;
      for (const e of this.eqs) {
        if (e.done) continue;
        let touch = false;
        for (const v of e.vars) if (seen.has(v)) { touch = true; break; }
        if (!touch) continue;
        e.done = true; grew = true;
        for (const v of e.vars) seen.add(v);
        for (const n of e.nums) nums.add(n);
      }
    }
    for (const e of this.eqs) delete e.done;
    return nums;
  }
}

// ================================================================ noun phrases
function npWords(s) { return s.split(' '); }
function npKey(s) {
  // "pails of water" -> "pail of water"; "rose bushes" -> "rose bush"; a leading "of" phrase keeps its own words
  const [head, ...rest] = s.split(' of ');
  const hw = head.split(' ');
  const h = hw.map((w, i) => (i === hw.length - 1 ? singular(w) : w)).join(' ');
  if (!rest.length) return h;
  const tail = rest.join(' of ').replace(/^(?:the|his|her|their) /, '').split(' ');
  tail[tail.length - 1] = singular(tail[tail.length - 1]);
  return h + ' of ' + tail.join(' ');
}
function npOk(s) {
  const ws = s.replace(/ of (?:the |his |her |their )?/g, ' ').split(' ');
  return ws.length > 0 && ws.length <= 6 && ws.every((w) => /^[a-z][a-z'-]*$/.test(w) && !RESERVED.has(w));
}
/** Same quantity? Equal after the plural is dropped, or the same head with one side's modifiers a subset. */
const MEASURES = new Set(['ounce', 'pound', 'cup', 'liter', 'litre', 'gallon', 'quart', 'pint', 'gram', 'kilogram', 'kilo', 'kg', 'ton', 'tablespoon', 'teaspoon', 'milliliter', 'ml', 'oz', 'lb']);
function itemMatch(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  // "ounces of sugar" is sugar, measured: a measure word before "of" is not the thing counted
  const strip = (x) => { const m = /^([a-z]+) of (.+)$/.exec(x); return m && MEASURES.has(m[1]) ? m[2] : null; };
  const sa = strip(a), sb = strip(b);
  if (sa && !sb && itemMatch(sa, b)) return true;
  if (sb && !sa && itemMatch(a, sb)) return true;
  const [ah, ao] = a.split(' of '), [bh, bo] = b.split(' of ');
  if (ao && bo && ao !== bo) return false;
  const A = ah.split(' '), B = bh.split(' ');
  if (A[A.length - 1] !== B[B.length - 1]) return false;
  const [s, l] = A.length <= B.length ? [A, B] : [B, A];
  return s.every((w) => l.includes(w));
}
const unitOf = (item) => UNIT_OF[item.split(' of ')[0]] || null;

// ================================================================ clauses
function markClause(toks, nums) {
  const parts = [];
  for (const t of toks) {
    if (t.k === 'num') { const i = nums.length; nums.push(t); parts.push((t.money ? '$' : '') + '#' + i + (t.pct ? '%' : '')); }
    else if (t.k === 'name') parts.push('@' + t.w);
    else if (t.k === 'word' && t.w !== "'s" && !RESERVED.has(t.w) && !LITERALS.has(t.w)) parts.push('~' + t.w);
    else parts.push(t.w);
  }
  return parts.join(' ').replace(/ 's\b/g, "'s").replace(/ ,/g, ',').replace(/ ;/g, ';').replace(/ :/g, ':');
}
// Every word a pattern spells (filled in once the rules are built): such a word is structure, never marked open.
const LITERALS = new Set();
const SOURCES = [];
function learnLiterals() {
  for (const x of [...SOURCES, ...Object.values(F)]) {
    const t = String(x).replace(/\{[A-Z]\w*(?::\w+)?\}/g, ' ').replace(/\(\?<\w+>/g, ' ').replace(/\\[a-z]/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/~[a-z]*/g, ' ');
    for (const w of t.matchAll(/[a-z]+/g)) if (!RESERVED.has(w[0])) LITERALS.add(w[0]);
  }
}
/** A match with its captured text unmarked, the marked captures kept as raw. */
function unmark(m) {
  const groups = {};
  for (const [k, v] of Object.entries(m.groups || {})) groups[k] = v === undefined ? undefined : v.replace(/~/g, '');
  const out = [m[0].replace(/~/g, '')];
  out.groups = groups; out.raw = m.groups || {}; out.indices = m.indices; out.marked = m[0];
  return out;
}

// An open word (a noun, an adjective, a word no rule spells) is marked "~word" when the clause is marked,
// so a noun slot is one short pattern and never a list of every reserved word. The words a pattern spells
// itself stay unmarked, and of those only the few below may also stand in a noun slot.
const NOUNISH = ['day', 'days', 'week', 'weeks', 'month', 'months', 'hour', 'minute', 'night', 'morning', 'afternoon', 'evening', 'time', 'game', 'games', 'round', 'test', 'stop', 'stores', 'piece', 'money', 'dollars'];
const W = "(?:~[a-z][a-z'-]*|(?:" + NOUNISH.join('|') + ")(?![a-z'-]))";
const TIMEW = '(?:' + [...MONTHS, ...WEEKDAYS].join('|') + '|the (?:first|second|third|fourth|fifth|sixth|seventh|next|last|following|previous) (?:day|week|month|year|game|round|test|time|stop|hour)|(?:the )?(?:morning|afternoon|evening|night)|(?:' + WEEKDAYS.join('|') + ') (?:morning|afternoon|evening|night))';
const NPX = W + '(?: ' + W + '){0,3}(?: of (?:the |his |her |their )?' + W + '(?: ' + W + '){0,2})?';
const F = {
  NP: W + '(?: ' + W + '){0,3}(?: of (?:the |his |her |their )?' + W + '(?: ' + W + '){0,2})?',
  SUBJ: "@[a-z]+(?:'s ~?[a-z]+)?(?:&(?:@[a-z]+(?:'s ~?[a-z]+)?|(?:his|her|their) ~?[a-z]+))*|(?:his|her|their) ~?[a-z]+(?: @[a-z]+)?|he|she|they|i|we|you|(?:the|a|an) " + W + '(?: ' + W + '){0,2}',
  QTY: '\\$?#\\d+%?',
  NUM: '#\\d+',
  MONEY: '\\$#\\d+',
  PCT: '#\\d+%',
  MULT: 'twice|thrice|half|#\\d+ times|#\\d+',
  VPRE: '(?:(?:can|could|will|would|should|must|also|always|usually|only|then|now|already|still|just|each|both|all|normally|typically|often|(?:wants?|wanted|needs?|needed|has|have|had|plans?|planned|decided|decides|tries|tried|(?:is|was|are|were) going|agreed|agrees|hopes?|hoped|likes?|liked|loves?|loved|is able|was able|were able|are able) to) )*',
  TIME: '(?:(?:in|on|during|at) ' + TIMEW + '|today|yesterday|tomorrow|last (?:week|month|year|night)|this (?:week|month|year|morning)|next (?:week|month|year)|' + TIMEW + ')',
  TIMES: TIMEW + '(?:(?:, ' + TIMEW + ')*,? and ' + TIMEW + ')?',
  FREQ: '(?:per|a|an|every|each) ' + W + '|daily|weekly|monthly|yearly|hourly',
  TOTAL: '(?:altogether|in total|total|in all|combined|together|all together|overall)',
  W: '~?[a-z]+',
  TIMEW2: TIMEW,
  QL: '(?:(?:exactly|only|just) )?(?:\\$?#\\d+|a|an) ' + NPX + '(?:(?:,|, and| and) (?:\\$?#\\d+|a|an) ' + NPX + ')*',
};
let INTRO_TIME_RE, FREQ_ITEM_RE, LEAD_TIME;
function pat(s) {
  const frag = (f) => { if (typeof F[f] !== 'string') throw new Error('act/word.mjs: no fragment ' + f); return F[f]; };
  const src = s.replace(/\{(\w+):(\w+)\}/g, (m, f, n) => '(?<' + n + '>' + frag(f) + ')').replace(/\{([A-Z]\w*)\}/g, (m, f) => '(?:' + frag(f) + ')');
  return new RegExp('^' + src + '$', 'd');
}
function timeKey(s) {
  if (!s) return null;
  return s.replace(/^(?:in|on|during|at) /, '').replace(/^the /, '');
}
function freqUnit(s) {
  if (!s) return null;
  const m = /^(?:per|a|an|every|each) (.+)$/.exec(s);
  const w = m ? m[1] : ({ daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year', hourly: 'hour' })[s];
  return w ? singular(w) : null;
}

const KIN = { mother: 'mother', mom: 'mother', mum: 'mother', father: 'father', dad: 'father', brother: 'brother', sister: 'sister', son: 'son', daughter: 'daughter', wife: 'wife', husband: 'husband', friend: 'friend', cousin: 'cousin', aunt: 'aunt', uncle: 'uncle', grandmother: 'grandmother', grandma: 'grandmother', grandfather: 'grandfather', grandpa: 'grandfather', boss: 'boss', neighbor: 'neighbor', teacher: 'teacher', coach: 'coach', partner: 'partner', roommate: 'roommate' };
function relative(world, base, rel) {
  const k = KIN[rel];
  if (!k || !base) return null;
  const key = base + "'s " + k;
  return world.person(key);
}
/** The entity a subject phrase names, bound through the world (pronouns to what they point back to). */
function entityOf(world, s) {
  if (!s) return null;
  if (s.includes('&')) {
    const members = s.split('&').map((x) => entityOf(world, x));
    if (members.some((x) => !x)) return null;
    const key = members.join('+');
    world.groups.set(key, members);
    world.lastGroup = key;
    return key;
  }
  if (s[0] === '@') {
    const m = /^@([a-z]+)(?:'s ([a-z]+))?$/.exec(s);
    if (!m) return null;
    if (m[2]) { const b = world.person(m[1]); return relative(world, b, m[2]); }
    return world.person(m[1]);
  }
  if (s === 'he' || s === 'she') return world.lastPerson && !world.groups.has(world.lastPerson) ? world.lastPerson : null;
  if (s === 'i') return world.person('_i');
  if (s === 'we') return world.person('_we');
  if (s === 'they') return world.lastGroup || null;
  let m = /^(his|her|their) ([a-z]+)(?: @([a-z]+))?$/.exec(s);
  if (m) {
    const base = m[1] === 'their' ? world.lastGroup : world.lastPerson;
    const k = relative(world, base, m[2]);
    if (!k) return null;
    if (m[3]) { world.persons.push(m[3]); world.aliases = world.aliases || new Map(); world.aliases.set(m[3], k); }
    return k;
  }
  m = /^(?:the|a|an) (.+)$/.exec(s);
  if (m && npOk(m[1])) return world.person('_' + npKey(m[1]));
  return null;
}
/** An entity named in a reference position ("than Rory", "Sarah's books"): it does not move "he". */
function refEntity(world, s) { const lp = world.lastPerson; const e = entityOf(world, s); world.lastPerson = lp; return e; }
function ownerKey(world, k) { return (world.aliases && world.aliases.get(k)) || k; }
function membersOf(world, k) { return world.groups.get(k) || [k]; }

function numIdx(tok) { const m = /#(\d+)/.exec(tok || ''); return m ? Number(m[1]) : null; }
function numOf(ctx, tok) { const i = numIdx(tok); return i === null ? null : ctx.nums[i]; }
function qf(ctx, tok) { const n = numOf(ctx, tok); return n ? fConst(n.pct ? E.qDiv(n.v, E.Q(100n)) : n.v) : null; }
function multOf(ctx, s) {
  if (!s) return null;
  if (s === 'twice') return E.Q(2n);
  if (s === 'thrice') return E.Q(3n);
  if (s === 'half') return E.Q(1n, 2n);
  const m = /^(#\d+)( times)?$/.exec(s);
  if (!m) return null;
  const n = numOf(ctx, m[1]);
  if (!n || n.money || n.pct) return null;
  if (!m[2] && !n.frac) return null;
  return n.v;
}
function numsIn(s) { return [...String(s || '').matchAll(/#(\d+)/g)].map((x) => Number(x[1])); }
function vlemma(w) { return VERB_FORMS[w] || null; }
const POSSESS = new Set(['have', 'own']);

// A list of quantities: "#0 red cars, #1 action figures, and a doll"
function qlist(ctx, s) {
  const parts = s.replace(/^(?:exactly|only|just) /, '').split(/, and |, | and /);
  const out = [];
  for (const p of parts) {
    let m = /^(\$?#\d+) (.+)$/.exec(p);
    if (m) {
      const n = numOf(ctx, m[1]);
      if (!n || n.pct || !npOk(m[2])) return null;
      out.push({ q: n.v, item: npKey(m[2]), nums: [numIdx(m[1])], money: n.money });
      continue;
    }
    m = /^(?:a|an) (.+)$/.exec(p);
    if (m && npOk(m[1])) { out.push({ q: E.Q1, item: npKey(m[1]), nums: [] }); continue; }
    m = /^(\$#\d+)$/.exec(p);
    if (m) { out.push({ q: numOf(ctx, m[1]).v, item: 'dollar', nums: [numIdx(m[1])], money: true }); continue; }
    return null;
  }
  return out;
}

INTRO_TIME_RE = new RegExp('(?:^| )(?:on|in|during) (' + TIMEW + ')(?= |$)');
FREQ_ITEM_RE = new RegExp('^(\\$?#\\d+)(?: (' + F.NP + '))? (' + F.FREQ + ')$');
LEAD_TIME = new RegExp('^(?:(?:on|in|during|by) )?(' + TIMEW + '|today|yesterday|last (?:week|month|year|night)|this (?:week|month|year))(?:,)? (.+)$');

// ================================================================ the rules
// Each rule is a pattern over the marked clause and a reader that adds equations; the reader returns
// false to refuse. The development sentence that motivated each rule is named in notes/word.md.
const RULES = [];
// A rule runs its strict pattern only after two cheap gates pass: its own literal gate (a word it cannot
// match without) and the same pattern with the reserved-word check loosened (a clause the loose one
// refuses, the strict one refuses too). The gates change the speed, never what is read.
function loose(s) {
  const L = { ...F, NP: "[a-z][a-z'-]*(?: [a-z][a-z'-]*){0,3}(?: of (?:the |his |her |their )?[a-z][a-z'-]*(?: [a-z][a-z'-]*){0,2})?" };
  const src = s.replace(/\{(\w+):(\w+)\}/g, (m, f, n) => '(?:' + (L[f] || F[f]).split(W).join("[a-z][a-z'-]*") + ')').replace(/\{([A-Z]\w*)\}/g, (m, f) => '(?:' + (L[f] || F[f]).split(W).join("[a-z][a-z'-]*") + ')').replace(/\(\?<[a-z0-9]+>/g, '(?:');
  return new RegExp('^' + src.split(W).join("[a-z][a-z'-]*") + '$');
}
const GATES = {
  'event.to': / to [$]?#/, 'event.rel': / as (?:many|much)/, 'event.cmp': / (?:more|fewer|less)\b/, 'event.cmp2': / (?:more|fewer|less) than /,
  'event.num': /(?:number|amount) of|that (?:many|much)/, 'event.poss': /'s /, 'event.what': / of what /, there: /^there /, 'there.cmp': /^there /,
  'there.each': /^there /, 'there.total': /^there /, each: /^(?:each|every|a|an|one) /, 'each.after': / (?:each|apiece|a piece)$/, 'each.they': /^(?:they|these|those) /,
  duration: / for #/, 'age.is': / (?:is|was|will be) /, 'age.diff': / (?:older|younger) than /, 'age.mult': / (?:is|was) /, 'buy.for': / for [$]#/,
  'event.foreach': / for each of /, makes: /^[$]?#/, named: / (?:named|called) /, 'spend.on': / on /, 'event.ofthem': / of /, 'need.to': / to /,
  'kind.are': / (?:are|were|is|was) /, 'kind.rest': /\b(?:rest|remainder|others|remaining)\b/, 'event.share': / of /, 'share.equally': / (?:equally|evenly) /,
  intro: /^[^#$]*$/, 'rate.freq': /(?:per|a|an|every|each) [a-z]+|daily|weekly|monthly|yearly|hourly/, 'rate.freq.list': /(?:per|a|an|every|each) [a-z]+.* and /,
};
function rule(name, s, fn) { SOURCES.push(s); RULES.push({ name, re: pat(s), gate: GATES[name] || null, fn }); }

// "Natalia sold 48 clips in April", "Dan plants 3 rose bushes", "Gretchen has 110 coins", a list of them
rule('event', '{SUBJ:s} {VPRE}{W:v} {QL:l}(?: {TIME:t})?(?: (?:to|for) (?<to>@[a-z]+|(?:his|her|their) ~?[a-z]+(?: @[a-z]+)?))?(?: for (?:his|her|their|the|a|an) ~?[a-z]+(?: ~?[a-z]+)?)?(?: {TIME:t2})?', RULES_EVENT);
function RULES_EVENT(w, m, ctx) {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || verb === 'be' || verb === 'do' || verb === 'cost') return false;
  const list = qlist(ctx, m.groups.l);
  if (!list) return false;
  const time = timeKey(m.groups.t || m.groups.t2) || ctx.time || null;
  const to = m.groups.to ? refEntity(w, m.groups.to) : null;
  if (m.groups.to && (!to || !(verb === 'give' || verb === 'send' || verb === 'sell' || verb === 'lend' || verb === 'donate' || verb === 'buy'))) return false;
  for (const x of list) {
    const f = w.fact(ownerKey(w, who), x.item, POSSESS.has(verb) ? 'have' : verb, time, fConst(x.q), x.nums);
    if (!f) return false;
    // what one gives, the other receives: "gave 5 apples to his sister"
    if (to && verb !== 'buy' && !w.fact(ownerKey(w, to), x.item, 'receive', time, fVar(f.v), [])) return false;
    if (to) w.lastFact = f;
  }
  return true;
}
// "Natalia sold clips to 48 of her friends in April": one each, so 48 clips
rule('event.to', '{SUBJ:s} {VPRE}{W:v} {NP:n} to {NUM:q} of (?:his|her|their) {NP:n2}(?: {TIME:t})?', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || verb === 'be' || POSSESS.has(verb)) return false;
  return !!w.fact(ownerKey(w, who), npKey(m.groups.n), verb, timeKey(m.groups.t) || ctx.time || null, qf(ctx, m.groups.q), numsIn(m.groups.q));
});

/** The quantity a relation points at: an explicit owner, a time, or the one just mentioned. */
function refFact(w, ctx, { who, verb, item, time, refS, refT }) {
  if (refS) {
    const other = refEntity(w, refS);
    if (!other) return null;
    return w.factFor(ownerKey(w, other), item, verb, refT !== undefined && refT !== null ? timeKey(refT) : time);
  }
  if (refT) return w.factFor(who, item, verb, timeKey(refT));
  const last = w.lastFact;
  if (!last || !itemMatch(last.item, item)) return null;
  if (last.verb !== verb && !(POSSESS.has(verb) && POSSESS.has(last.verb))) return null;
  return last;
}
const REFS = '(?: as {SUBJ:rs}(?: (?:did|does|do|has|had|have|was|is|can|could|will|would))?(?: {TIME:rt})?| as (?:on|in) {TIMEW2:rt2}| than {SUBJ:cs}(?: (?:did|does|do|has|had|have|was|is|can|could))?(?: {TIME:ct})?)?';
// "she sold half as many clips in May", "Jada makes twice as many clay dishes as Rory",
// "Kyle has 5 more marbles than Jane", "Samantha has 12 fewer paintings than Shelley",
// "Pierson... Nikita scored 11 more than half as many as Pierson"
rule('event.rel', '{SUBJ:s} {VPRE}{W:v} (?:(?<add>\\$?#\\d+) (?<dir>more|fewer|less) than )?(?<k>{MULT}) as (?:many|much)(?: {NP:n})?' + REFS + '(?: {TIME:t})?', relRule);
rule('event.cmp', '{SUBJ:s} {VPRE}{W:v} (?<add>\\$?#\\d+) (?<dir>more|fewer|less)(?: {NP:n})?(?: than {SUBJ:cs}(?: (?:did|does|do|has|had|have|was|is|can|could))?(?: {TIME:ct})?)?(?: {TIME:t})?', relRule);
rule('event.num', '{SUBJ:s} {VPRE}{W:v} (?:(?<add>\\$?#\\d+) (?<dir>more|fewer|less) than )?(?<k>{MULT}) (?:the (?:number|amount) of|that (?:number|amount) of|that many|that much)(?: {NP:n})?(?:(?: {SUBJ:rs})? (?:did|does|had|has|made|got)(?: {TIME:rt})?|(?: that)? {SUBJ:cs2} (?:did|does|had|has|have|made|got))?(?: {TIME:t})?', relRule);
rule('event.poss', "{SUBJ:s} {VPRE}{W:v} (?:(?<add>\\$?#\\d+) (?<dir>more|fewer|less) than )?(?<k>{MULT}) the (?:number|amount) of (?<po>@[a-z]+)'s {NP:n}(?: {TIME:t})?", relRule);
function relRule(w, m, ctx) {
  const g = m.groups;
  const who0 = entityOf(w, g.s); const verb0 = vlemma(g.v);
  if (!who0 || !verb0 || verb0 === 'be' || verb0 === 'do' || verb0 === 'cost') return false;
  const who = ownerKey(w, who0);
  const verb = POSSESS.has(verb0) ? 'have' : verb0;
  const time = timeKey(g.t) || ctx.time || null;
  let item = g.n ? npKey(g.n) : null;
  if (!item) { if (w.lastFact) item = w.lastFact.item; else if (w.lastItem) item = w.lastItem; else return false; }
  let ref;
  if (g.po) ref = w.factFor(ownerKey(w, refEntity(w, g.po)), item, verb, time);
  else ref = refFact(w, ctx, { who, verb, item, time, refS: g.rs || g.cs || g.cs2, refT: g.rt || g.rt2 || g.ct });
  if (!ref) return false;
  let form = fVar(ref.v);
  const nums = [];
  if (g.k) { const k = multOf(ctx, g.k); if (!k) return false; form = fScale(form, k); nums.push(...numsIn(g.k)); }
  if (g.add) {
    const a = numOf(ctx, g.add); if (!a || a.pct) return false;
    nums.push(numIdx(g.add));
    form = g.dir === 'more' ? fAdd(form, fConst(a.v)) : fSub(form, fConst(a.v));
  }
  if (!g.k && !g.add) return false;
  const f = w.fact(who, ref.item, verb, time, form, nums);
  return !!f;
}

// "There are 6 girls in the park", "There were 175 diamonds, 35 fewer rubies than diamonds"
rule('there', 'there (?:are|were|is|was|will be) {QL:l}(?: (?:in|on|at|inside) (?:the|his|her|their) {NP:p})?', (w, m, ctx) => {
  const list = qlist(ctx, m.groups.l);
  if (!list) return false;
  const owner = m.groups.p ? '_' + npKey(m.groups.p) : '_world';
  for (const x of list) if (!w.fact(owner, x.item, 'have', null, fConst(x.q), x.nums)) return false;
  return true;
});

// Rates. "Each rose bush has 25 roses", "each bus carried 35 people", "Each tire costs 25 cents"
rule('each', '(?:each|every|a|an|one) {NP:d} {VPRE}{W:v} {QTY:q}(?: {NP:n})?', (w, m, ctx) => {
  const verb = vlemma(m.groups.v);
  if (!verb || verb === 'do') return false;
  const n = numOf(ctx, m.groups.q); if (!n || n.pct) return false;
  const num = n.money ? 'dollar' : (m.groups.n ? npKey(m.groups.n) : null);
  if (!num) return false;
  if (m.groups.n && n.money) return false;
  return !!w.rate('_any', verb, num, npKey(m.groups.d), fConst(n.v), [numIdx(m.groups.q)]);
});
// "They cost $60 each", "The shirts are $10 each"
rule('each.after', '(?:the )?{NP:d} (?:cost|costs|are|is|was|were|sell for|sold for) {MONEY:q} (?:each|apiece|a piece)', (w, m, ctx) => {
  return !!w.rate('_any', 'cost', 'dollar', npKey(m.groups.d), qf(ctx, m.groups.q), [numIdx(m.groups.q)]);
});
rule('each.they', '(?:they|these|those) (?:cost|are|were) {MONEY:q} (?:each|apiece|a piece)', (w, m, ctx) => {
  if (!w.lastFact) return false;
  return !!w.rate('_any', 'cost', 'dollar', w.lastFact.item, qf(ctx, m.groups.q), [numIdx(m.groups.q)]);
});
// "Janet's ducks lay 16 eggs per day", "He can collect 2 peaches a minute", "She earns $10 an hour"
rule('rate.freq', '{SUBJ:s} {VPRE}{W:v} {QTY:q}(?: {NP:n})? {FREQ:f}(?: for (?:his|her|their|the|a|an) ~?[a-z]+(?: ~?[a-z]+)?)?', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || verb === 'be' || verb === 'do') return false;
  const n = numOf(ctx, m.groups.q); if (!n || n.pct) return false;
  const num = n.money ? 'dollar' : (m.groups.n ? npKey(m.groups.n) : null);
  if (!num || (m.groups.n && n.money)) return false;
  const den = freqUnit(m.groups.f);
  if (!den) return false;
  return !!w.rate(ownerKey(w, who), POSSESS.has(verb) ? 'have' : verb, num, den, fConst(n.v), [numIdx(m.groups.q)]);
});
// "John collects peaches for 3 hours"
rule('duration', '{SUBJ:s} {VPRE}{W:v}(?: {NP:n})? for {NUM:q} {W:u}', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  const unit = UNIT_OF[m.groups.u];
  if (!who || !verb || !unit || !isTimeUnit(unit)) return false;
  const n = numOf(ctx, m.groups.q);
  w.durations.push({ owner: ownerKey(w, who), verb, q: n.v, unit, nums: [numIdx(m.groups.q)], item: m.groups.n ? npKey(m.groups.n) : null });
  w.steps++;
  return true;
});

// Ages. "Trent is 5 years older than Jane", "If Quinn is 30", "Shawna's father is five times as old as Shawna"
function ageEq(w, whoS, form, nums) {
  const who = entityOf(w, whoS);
  if (!who) return false;
  const v = w.ageVar(ownerKey(w, who));
  w.eqs.push({ vars: new Set([v, ...form.t.keys()]), nums: new Set(nums) });
  w.steps++;
  return w.sys.eq(fVar(v), form);
}
function ageOf(w, s) { const e = refEntity(w, s); return e ? fVar(w.ageVar(ownerKey(w, e))) : null; }
rule('age.is', '{SUBJ:s} (?<v>is|was|will be)(?: now| currently)? {NUM:q}(?: years? old| years of age)?(?: now| today)?', (w, m, ctx) => ageEq(w, m.groups.s, qf(ctx, m.groups.q), numsIn(m.groups.q)));
rule('age.diff', '{SUBJ:s} (?<v>is|was)(?: now| currently)? {NUM:q} years? (?<dir>older|younger) than {SUBJ:o}', (w, m, ctx) => {
  const o = ageOf(w, m.groups.o); if (!o) return false;
  const q = qf(ctx, m.groups.q);
  return ageEq(w, m.groups.s, m.groups.dir === 'older' ? fAdd(o, q) : fSub(o, q), numsIn(m.groups.q));
});
rule('age.mult', '{SUBJ:s} (?<v>is|was)(?: now| currently)? (?<k>{MULT}) (?:as old as|times older than|older than|times as old as|the age of|times the age of) {SUBJ:o}', (w, m, ctx) => {
  const o = ageOf(w, m.groups.o); if (!o) return false;
  const k = m.groups.k === 'half' ? E.Q(1n, 2n) : /^#\d+$/.test(m.groups.k) ? (numOf(ctx, m.groups.k) || {}).v : multOf(ctx, m.groups.k);
  if (!k) return false;
  return ageEq(w, m.groups.s, fScale(o, k), numsIn(m.groups.k));
});

// A clause with no quantity in it: a place, a plan, who is who. It is read as carrying nothing, which
// is only safe when it holds no word that could carry a quantity or change one.
const INTRO_BAN = /(?:^| )(?:#|\$#|away|off|out|up|back|down|rid|ones|them|it|those|these|everything|nothing|anything|something|some|all|none|no|not|never|half|twice|more|less|fewer|each|every|per|rest|remaining|remainder|left|same|times|double[a-z]*|triple[a-z]*|halve[a-z]*|increase[a-z]*|decrease[a-z]*|rose|fell|drop[a-z]*|reduce[a-z]*|other|again|only|except|without|instead|extra|additional|than|total|many|much|number|amount|dozen|pair|pairs|percent|n't|twice|also|too|both)(?= |$)/;
const INTRO_VERBS = new Set(['be', 'go', 'come', 'decide', 'want', 'plan', 'like', 'love', 'live', 'visit', 'attend', 'host', 'join', 'open', 'start', 'enjoy', 'work', 'play', 'sign', 'try', 'hope', 'meet', 'need']);
rule('intro', '{SUBJ:s} {VPRE}{W:v}(?: (?:~?[a-z\'-]+|@[a-z]+(?:\'s)?|~?[a-z]+\'s))*', (w, m, ctx) => {
  const clause = m[0];
  if (INTRO_BAN.test(clause)) return false;
  const verb = vlemma(m.groups.v);
  if (!verb) return false;
  // any other verb only before a bare noun ("make clay dishes", "gets water from a well"): never before a determiner
  const after = m.marked && m.indices.groups.v ? m.marked.slice(m.indices.groups.v[1]).trim().split(' ')[0] : '';
  if (!INTRO_VERBS.has(verb) && (!/^~/.test(after) || LOSS_VERBS.has(verb))) return false;
  if (!entityOf(w, m.groups.s)) return false;
  const t = INTRO_TIME_RE.exec(clause);
  if (t) ctx.time = timeKey(t[1]);
  // every word after the verb is a determiner, a preposition, a name, a verb form or a noun
  return true;
});

// Purchases and sales with a price. "He buys a house for $80,000", "John buys milk for 2 dollars, eggs
// for 3 dollars", "Terry sells 6 milkshakes for $5.50 each": the money is a quantity of the same event.
function buyItems(ctx, s) {
  const parts = s.split(/, and |, | and /);
  const out = [];
  for (const p of parts) {
    const m = /^(?:(\$?#\d+|a|an) )?(.+?) for (\$#\d+)(?: (each|apiece|a piece|per (.+)))?$/.exec(p);
    if (!m || !npOk(m[2])) return null;
    const cnt = m[1] && m[1][0] === '#' || (m[1] && m[1][0] === '$') ? numOf(ctx, m[1]) : null;
    if (cnt && (cnt.money || cnt.pct)) return null;
    const price = numOf(ctx, m[3]);
    if (m[5] && npKey(m[5]) !== npKey(m[2]).split(' of ')[0] && unitOf(npKey(m[5])) === null && !itemMatch(npKey(m[5]), npKey(m[2]))) return null;
    out.push({ count: cnt ? cnt.v : E.Q1, countNum: cnt ? numIdx(m[1]) : null, item: npKey(m[2]), price: price.v, priceNum: numIdx(m[3]), each: !!m[4] });
  }
  return out;
}
rule('buy.for', '{SUBJ:s} {VPRE}{W:v} (?<l>(?:(?:\\$?#\\d+|a|an) )?' + F.NP + ' for \\$#\\d+(?: (?:each|apiece|a piece|per ' + F.NP + '))?(?:(?:,|, and| and) (?:(?:\\$?#\\d+|a|an) )?' + F.NP + ' for \\$#\\d+(?: (?:each|apiece|a piece|per ' + F.NP + '))?)*)(?: {TIME:t})?', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || !(INCOME.includes(verb) || EXPENSE.includes(verb))) return false;
  const items = buyItems(ctx, m.groups.l);
  if (!items) return false;
  const owner = ownerKey(w, who), time = timeKey(m.groups.t) || ctx.time || null;
  for (const x of items) {
    const nums = [x.priceNum]; if (x.countNum !== null) nums.push(x.countNum);
    // the count is kept (a later "how many" can ask it); the money is a quantity of the same event
    const cf = w.fact(owner, x.item, verb, time, fConst(x.count), x.countNum !== null ? [x.countNum] : []);
    if (!cf) return false;
    cf.priced = true;
    const money = x.each && x.countNum !== null ? fScale(fConst(x.price), x.count, lit(x.count)) : fConst(x.price);
    if (!x.each && x.countNum !== null && !E.qEq(x.count, E.Q1)) { /* "2 kilos of bananas for $2 per kilo" is each; a bare total for a count is the total */ }
    const mf = w.fact(owner, 'dollar', verb, time, x.each ? fScale(fConst(x.price), x.count, lit(x.count)) : money, nums);
    if (!mf) return false;
    mf.from = cf;
  }
  return true;
});
// "John buys 2 pairs of shoes for each of his 3 children": 2 for each of 3 is 6
rule('event.foreach', '{SUBJ:s} {VPRE}{W:v} {QTY:q} {NP:n} for each of (?:his|her|their|the) {NUM:k} {NP:d}(?: {TIME:t})?', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || verb === 'be' || verb === 'do') return false;
  const a = numOf(ctx, m.groups.q), b = numOf(ctx, m.groups.k);
  if (!a || !b || a.pct || b.pct || b.money) return false;
  return !!w.fact(ownerKey(w, who), npKey(m.groups.n), POSSESS.has(verb) ? 'have' : verb, timeKey(m.groups.t) || ctx.time || null, fScale(fConst(a.v), b.v, lit(b.v)), [numIdx(m.groups.q), numIdx(m.groups.k)]);
});
// Several rates in one clause: "He gets 5 pails of water every morning and 6 pails of water every afternoon"
rule('rate.freq.list', '{SUBJ:s} {VPRE}{W:v} (?<l>\\$?#\\d+(?: ' + F.NP + ')? (?:' + F.FREQ + ')(?:(?:,|, and| and) \\$?#\\d+(?: ' + F.NP + ')? (?:' + F.FREQ + '))+)', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || verb === 'be' || verb === 'do') return false;
  for (const p of m.raw.l.split(/, and |, | and /)) {
    const x0 = FREQ_ITEM_RE.exec(p);
    const x = x0 && x0.map((y) => (y === undefined ? y : y.replace(/~/g, '')));
    if (!x) return false;
    const n = numOf(ctx, x[1]); if (!n || n.pct) return false;
    const num = n.money ? 'dollar' : (x[2] ? npKey(x[2]) : null);
    const den = freqUnit(x[3]);
    if (!num || !den || (x[2] && n.money)) return false;
    if (!w.rate(ownerKey(w, who), POSSESS.has(verb) ? 'have' : verb, num, den, fConst(n.v), [numIdx(x[1])])) return false;
  }
  return true;
});
// "There are 30 more gold coins than silver coins", "twice as many emeralds as rubies"
rule('there.cmp', 'there (?:are|were|is|was) (?:(?<add>#\\d+) (?<dir>more|fewer|less) {NP:a} than {NP:b}|(?<k>{MULT}) as many {NP:a2} as {NP:b2})(?: (?:in|on|at) (?:the|a|an|his|her|their) {NP:p})?', (w, m, ctx) => {
  const g = m.groups;
  let owner = g.p ? '_' + npKey(g.p) : '_world';
  const a = npKey(g.a || g.a2), b = npKey(g.b || g.b2);
  const head = (x) => x.split(' of ')[0].split(' ').pop();
  const whole = !g.p && w.lastFact && w.lastFact.verb === 'have' && !w.lastFact.item.includes(' ') && head(a) === w.lastFact.item && head(b) === w.lastFact.item ? w.lastFact : null;
  if (whole) owner = whole.owner;
  const fb = w.factFor(owner, b, 'have', null, true);
  if (!fb) return false;
  let form = fVar(fb.v); const nums = [];
  if (g.k) { const k = multOf(ctx, g.k); if (!k) return false; form = fScale(form, k); nums.push(...numsIn(g.k)); }
  else { const d = numOf(ctx, g.add); nums.push(numIdx(g.add)); form = g.dir === 'more' ? fAdd(form, fConst(d.v)) : fSub(form, fConst(d.v)); }
  const fa = w.fact(owner, a, 'have', null, form, nums);
  if (!fa) return false;
  // the two kinds are the whole: "Gretchen has 110 coins. There are 30 more gold coins than silver coins."
  if (whole && !w.equate(whole.v, fAdd(fVar(fa.v), fVar(fb.v)), [])) return false;
  return true;
});
// "Gretchen has 110 coins" then "There are 30 more gold coins than silver coins": the kinds are parts
// of the whole only when the whole's noun is the head of both kinds.

// "Samantha has 12 fewer paintings than Shelley, and Shelley has 8 paintings more than Kim"
rule('event.cmp2', '{SUBJ:s} {VPRE}{W:v} (?<add>\\$?#\\d+) {NP:n} (?<dir>more|fewer|less) than {SUBJ:cs}(?: (?:did|does|do|has|had|have|was|is|can|could))?(?: {TIME:t})?', relRule);
// "His friend James slept only 2/3 of what Harry slept"
rule('event.what', '{SUBJ:s} {VPRE}{W:v}(?: only| just| exactly)? (?<k>{MULT}) of what {SUBJ:ws} (?:did|does|do|has|had|{W:v2})(?: {TIME:wt})?(?: {TIME:t})?', (w, m, ctx) => {
  const g = m.groups;
  const who = entityOf(w, g.s); const verb0 = vlemma(g.v);
  if (!who || !verb0 || verb0 === 'be' || verb0 === 'do') return false;
  if (g.v2 && vlemma(g.v2) !== verb0) return false;
  const verb = POSSESS.has(verb0) ? 'have' : verb0;
  const other = refEntity(w, g.ws); if (!other) return false;
  const k = multOf(ctx, g.k); if (!k) return false;
  const cands = w.facts.filter((f) => f.owner === ownerKey(w, other) && f.verb === verb && defined(w, f.v));
  if (cands.length !== 1) return false;
  w.person(ownerKey(w, who));
  return !!w.fact(ownerKey(w, who), cands[0].item, verb, timeKey(g.t) || ctx.time || null, fScale(fVar(cands[0].v), k), numsIn(g.k));
});
// "If there are 30 sheets of paper on a pad of paper": a rate, one of the second to so many of the first
rule('there.each', 'there (?:are|is|were|was) {QTY:q} {NP:n} (?:on|in|inside|per) (?<det>a|an|each|every|one) {NP:d}', (w, m, ctx) => {
  const n = numOf(ctx, m.groups.q); if (!n || n.pct || n.money) return false;
  // "in a basket" is one basket holding them, and it is the rate per basket as well
  if (/^(?:a|an|one)$/.test(m.groups.det) && !w.fact('_' + npKey(m.groups.d), npKey(m.groups.n), 'have', null, fConst(n.v), [numIdx(m.groups.q)])) return false;
  return !!w.rate('_any', 'have', npKey(m.groups.n), npKey(m.groups.d), fConst(n.v), [numIdx(m.groups.q)]);
});
// "There is a total of 341 cards": the owners' counts sum to it (applied when the question is read)
rule('there.total', 'there (?:is|was|are|were) a total of {NUM:q} {NP:n}', (w, m, ctx) => {
  const n = numOf(ctx, m.groups.q); if (!n) return false;
  w.totals.push({ item: npKey(m.groups.n), q: n.v, nums: [numIdx(m.groups.q)] });
  w.lastItem = npKey(m.groups.n);
  w.steps++;
  return true;
});
// "If 6 potatoes makes 36 hash browns": so many of the second per one of the first
rule('makes', '{QTY:a} {NP:d} (?:make|makes|made|yield|yields|produce|produces|give|gives) {QTY:b} {NP:n}', (w, m, ctx) => {
  const a = numOf(ctx, m.groups.a), b = numOf(ctx, m.groups.b);
  if (!a || !b || a.pct || b.pct || a.money || b.money || E.qIsZero(a.v)) return false;
  const form = fScale(fConst(b.v), E.qDiv(E.Q1, a.v), lit(E.qDiv(E.Q1, a.v)));
  const x = w.rate('_any', 'make', npKey(m.groups.n), npKey(m.groups.d), { ...form, x: { op: '/', a: lit(b.v), b: lit(a.v) } }, [numIdx(m.groups.a), numIdx(m.groups.b)]);
  return !!x;
});
// "Emily has 4 kids named Amy, Jackson, Corey, and James": the count is checked against the names
rule('named', "{SUBJ:s} (?:has|had|have) {NUM:q} {NP:n} (?:named|called) (?<l>@[a-z]+(?:&@[a-z]+)+)", (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); if (!who) return false;
  const names = m.groups.l.split('&');
  const n = numOf(ctx, m.groups.q);
  if (!n || !E.qEq(n.v, E.Q(BigInt(names.length)))) return false;
  for (const x of names) w.persons.push(x.slice(1));
  w.freeNums.add(numIdx(m.groups.q));
  w.steps++;
  return true;
});
// "A company spends $15000 on advertising", "then spends a third of that amount on advertising"
rule('spend.on', '{SUBJ:s} {VPRE}{W:v} (?:(?<q>\\$#\\d+)|(?<k>{MULT}) of (?:that|this|the same) (?:amount|much|money)) on {NP:n}(?: for (?:a|an|one|another|the next|the following|the second|the first) (?<per>year|month|week|day))?', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || !EXPENSE.includes(verb) && !INCOME.includes(verb)) return false;
  const owner = ownerKey(w, who);
  const slot = m.groups.per ? m.groups.per + ':' + (w.facts.filter((f) => f.owner === owner && f.item === 'dollar').length + 1) : (ctx.time || null);
  if (m.groups.q) return !!w.fact(owner, 'dollar', verb, slot, qf(ctx, m.groups.q), [numIdx(m.groups.q)]);
  const last = w.lastFact;
  if (!last || last.item !== 'dollar' || last.owner !== owner) return false;
  const k = multOf(ctx, m.groups.k); if (!k) return false;
  return !!w.fact(owner, 'dollar', verb, slot, fScale(fVar(last.v), k), numsIn(m.groups.k));
});
// "he lost 2 of them", "she ate 3 of the cookies"
rule('event.ofthem', '{SUBJ:s} {VPRE}{W:v} {NUM:q} of (?:them|those|these|the {NP:n})(?: {TIME:t})?', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); const verb = vlemma(m.groups.v);
  if (!who || !verb || !(LOSS_VERBS.has(verb) || GAIN_VERBS.has(verb))) return false;
  const item = m.groups.n ? npKey(m.groups.n) : w.lastItem;
  if (!item) return false;
  return !!w.fact(ownerKey(w, who), item, verb, timeKey(m.groups.t) || ctx.time || null, qf(ctx, m.groups.q), [numIdx(m.groups.q)]);
});
// "Mason needs 30 ounces of sugar to make a batch of suckers": so much of the first per one of the second
rule('need.to', '{SUBJ:s} {VPRE}(?<v>needs|need|needed|uses|use|used|requires|require|required) {QTY:q} {NP:n} to {W:v2} (?:a|an|one|each) {NP:d}', (w, m, ctx) => {
  const who = entityOf(w, m.groups.s); if (!who || !vlemma(m.groups.v2)) return false;
  const n = numOf(ctx, m.groups.q); if (!n || n.pct) return false;
  return !!w.rate(ownerKey(w, who), 'need', n.money ? 'dollar' : npKey(m.groups.n), npKey(m.groups.d), fConst(n.v), [numIdx(m.groups.q)]);
});

// A whole and its kinds. "There are 12 apples in a basket. 5 apples are red. The rest are green."
function wholeOf(w, item) {
  for (let i = w.facts.length - 1; i >= 0; i--) {
    const f = w.facts[i];
    if (f.verb === 'have' && !f.kind && defined(w, f.v) && (!item || itemMatch(f.item, item) && f.item.split(' ').length <= item.split(' ').length)) return f;
  }
  return null;
}
function kindFact(w, whole, adjItem, form, nums) {
  const f = w.fact(whole.owner, adjItem, 'have', whole.time, form, nums);
  if (!f) return null;
  f.kind = whole;
  w.lastFact = whole; w.lastItem = whole.item;
  return f;
}
rule('kind.are', '(?:out of (?:the|his|her|their) (?<wq>#\\d+) {NP:wn}(?: (?:in|on|at) (?:the|a|an|his|her|their) {NP:wp})?, )?(?:(?<q>#\\d+%?)(?: of (?:them|the {NP:on}|those|these))?|(?<k>#\\d+) of (?:them|the {NP:on2}|those|these))(?: {NP:n})? (?:are|were|is|was) {W:adj}(?: {NP:n2})?', (w, m, ctx) => {
  const g = m.groups;
  let whole = null;
  const nums = [];
  if (g.wq) { const wq = numOf(ctx, g.wq); whole = w.fact(g.wp ? '_' + npKey(g.wp) : '_world', npKey(g.wn), 'have', null, fConst(wq.v), [numIdx(g.wq)]); if (!whole) return false; }
  const named = g.n || g.on || g.on2 || g.n2;
  whole = whole || wholeOf(w, named ? npKey(named) : null);
  if (!whole) return false;
  if (named && !itemMatch(npKey(named), whole.item)) return false;
  if (RESERVED.has(g.adj) || VERB_FORMS[g.adj] || !/^[a-z]+$/.test(g.adj)) return false;
  const qt = g.q || g.k;
  const n = numOf(ctx, qt); if (!n || n.money) return false;
  nums.push(numIdx(qt));
  const form = n.pct ? fScale(fVar(whole.v), E.qDiv(n.v, E.Q(100n)), lit(E.qDiv(n.v, E.Q(100n)))) : n.frac ? fScale(fVar(whole.v), n.v) : fConst(n.v);
  if (g.k && !n.frac) return false;
  if (g.q && !n.pct && n.frac) return false;
  return !!kindFact(w, whole, g.n2 ? npKey(g.n2) : g.adj + ' ' + whole.item.split(' of ')[0].split(' ').pop(), form, nums);
});
rule('kind.rest', '(?:if )?the (?:rest|remainder|others|remaining(?: {NP:rn})?)(?: of (?:the|them|those) ?(?:{NP:on})?)? (?:are|were|is|was)(?: made up of)? {W:adj}(?: {NP:n2})?', (w, m) => {
  const g = m.groups;
  const whole = wholeOf(w, g.on || g.rn ? npKey(g.on || g.rn) : null);
  if (!whole) return false;
  const kinds = w.facts.filter((f) => f.kind === whole);
  if (!kinds.length) return false;
  if (RESERVED.has(g.adj) || VERB_FORMS[g.adj]) return false;
  const form = kinds.reduce((acc, f) => fSub(acc, fVar(f.v)), fVar(whole.v));
  return !!kindFact(w, whole, g.n2 ? npKey(g.n2) : g.adj + ' ' + whole.item.split(' of ')[0].split(' ').pop(), form, []);
});
// "She gives 25% of her marbles to Tim", "He ate half of the cookies": a share of what the owner holds
rule('event.share', '{SUBJ:s} {VPRE}{W:v} (?<k>#\\d+%|#\\d+|half) of (?:his|her|their|the|them|those|these)(?: {NP:n})?(?: (?:to|with) (?<to>@[a-z]+|(?:his|her|their) ~?[a-z]+(?: @[a-z]+)?))?(?: {TIME:t})?', (w, m, ctx) => {
  const g = m.groups;
  const who = entityOf(w, g.s); const verb = vlemma(g.v);
  if (!who || !verb || !(LOSS_VERBS.has(verb) || verb === 'keep')) return false;
  const owner = ownerKey(w, who);
  const item = g.n ? npKey(g.n) : w.lastItem;
  if (!item) return false;
  let k, nums = [];
  if (g.k === 'half') k = E.Q(1n, 2n);
  else { const n = numOf(ctx, g.k); if (!n || n.money) return false; if (!n.pct && !n.frac) return false; k = n.pct ? E.qDiv(n.v, E.Q(100n)) : n.v; nums.push(numIdx(g.k)); }
  const st = stock(w, item, [owner]);
  if (!st) return false;
  const f = w.fact(owner, item, verb, timeKey(g.t) || ctx.time || null, fScale(st.form, k, lit(k)), nums);
  if (!f) return false;
  if (g.to) { const to = refEntity(w, g.to); if (!to || !w.fact(ownerKey(w, to), item, 'receive', f.time, fVar(f.v), [])) return false; w.lastFact = f; }
  return true;
});
// "shared the remaining equally with his four friends": each gets an equal part of what is left
rule('share.equally', '{SUBJ:s} {VPRE}(?:shared|shares|share|split|splits|divided|divides|divide|gave|gives|give) (?:the (?:remaining|rest|remainder)|them|all of them|the {NP:n}) (?:equally|evenly) (?:with|among|between|to) (?:his|her|their|the) {NUM:q} {NP:r}', (w, m, ctx) => {
  const g = m.groups;
  const who = entityOf(w, g.s); if (!who) return false;
  const owner = ownerKey(w, who);
  const item = g.n ? npKey(g.n) : w.lastItem;
  if (!item) return false;
  const base = w.facts.filter((f) => f.owner === owner && f.verb === 'have' && itemMatch(f.item, item) && defined(w, f.v));
  if (base.length !== 1) return false;
  let form = fVar(base[0].v);
  for (const f of w.facts) if (f.owner === owner && f.verb !== 'have' && itemMatch(f.item, item) && defined(w, f.v)) { if (LOSS_VERBS.has(f.verb) || f.verb === 'keep') form = fSub(form, fVar(f.v)); else if (GAIN_VERBS.has(f.verb)) form = fAdd(form, fVar(f.v)); else return false; }
  const n = numOf(ctx, g.q); if (!n || n.money || n.pct || E.qIsZero(n.v)) return false;
  const x = w.rate('_share', 'receive', item, npKey(g.r), fScale(form, E.qDiv(E.Q1, n.v)), [numIdx(g.q)]);
  return !!x;
});

// Coins and bills, by what each is worth in dollars.
const COIN = { penny: E.Q(1n, 100n), nickel: E.Q(5n, 100n), dime: E.Q(10n, 100n), quarter: E.Q(25n, 100n), 'dollar bill': E.Q1, 'piece of dollar bill': E.Q1, 'half dollar': E.Q(1n, 2n) };

// ================================================================ questions
const QRULES = [];
function qrule(name, s, fn) { SOURCES.push(s); QRULES.push({ name, re: pat(s), gate: null, fn }); }
const INCOME = ['sell', 'earn', 'make', 'get', 'receive', 'charge', 'win', 'raise', 'collect'];
const EXPENSE = ['buy', 'pay', 'spend', 'cost', 'order', 'rent'];
const DAYISH = new Set(['morning', 'afternoon', 'evening', 'night']);

function defined(w, v) { for (const e of w.eqs) if (e.vars.has(v)) return true; return false; }

/**
 * The amount of an item a filter names, as a linear form: the facts that give it; else, for money,
 * each priced count times its price; else each rate times the amount of what the rate is per (a
 * duration, or another item). Null when any part is missing or two readings could double count.
 */
function amount(w, item, filt, depth = 0) {
  if (depth > 6) return null;
  const okOwner = (o) => !filt.owners || filt.owners.includes(o);
  const okVerb = (v) => !filt.verbs || filt.verbs.includes(v);
  const okTime = (t) => !filt.times || filt.times.includes(t);
  // "how many dozens of eggs": the eggs, twelve to a dozen
  const dz = /^dozen of (.+)$/.exec(item);
  if (dz) {
    const a = amount(w, dz[1], filt, depth + 1);
    if (!a) return null;
    const k = w.sys.value(a.form);
    if (!k) return null;
    return { ...a, form: fScale(k, E.Q(1n, 12n), lit(E.Q(12n)).v ? undefined : undefined), vars: [...(a.vars || []), ...a.form.t.keys()] };
  }
  if (!filt.dur) {
    let fs = w.facts.filter((f) => okOwner(f.owner) && okVerb(f.verb) && itemMatch(f.item, item) && okTime(f.time) && defined(w, f.v));
    const exact = fs.filter((f) => f.item === item);
    if (exact.length) fs = exact;
    if (fs.length) {
      if (filt.times && !filt.times.every((t) => fs.some((f) => f.time === t))) return null;
      return { form: fs.reduce((acc, f) => fAdd(acc, fVar(f.v)), fConst(E.Q0)), nums: [] };
    }
    if (item === 'dollar') {
      const priced = w.facts.filter((f) => okOwner(f.owner) && okVerb(f.verb) && f.item !== 'dollar' && !f.priced && okTime(f.time) && defined(w, f.v));
      if (priced.length) {
        let form = null; const vars = [];
        for (const f of priced) {
          const ps = w.rates.filter((x) => x.num === 'dollar' && itemMatch(x.den, f.item));
          if (ps.length !== 1) return null;
          const pv = w.sys.value(fVar(ps[0].v)), cv = w.sys.value(fVar(f.v));
          if (!pv || !cv) return null;
          const part = fScale(cv, pv.c, pv.x);
          vars.push(f.v, ps[0].v);
          form = form ? fAdd(form, part) : part;
        }
        return { form, nums: [], vars };
      }
    }
  }
  const rs = w.rates.filter((x) => itemMatch(x.num, item) && (x.owner === '_any' || okOwner(x.owner)) && (x.owner === '_any' || okVerb(x.verb)));
  if (!rs.length) return null;
  // two rates of one item add up only when each is per a time and they are different times of day
  if (rs.length > 1 && !rs.every((x) => (isTimeUnit(x.den) || DAYISH.has(x.den)) && rs.filter((y) => y.den === x.den && y.owner === x.owner).length === 1)) return null;
  let form = null; const vars = []; const nums = [];
  for (const rt of rs) {
    const rv = w.sys.value(fVar(rt.v));
    if (!rv) return null;
    vars.push(rt.v);
    let part;
    if (isTimeUnit(rt.den) || DAYISH.has(rt.den)) {
      let dur = filt.dur || null;
      if (!dur) {
        const ds = w.durations.filter((d) => (rt.owner === '_any' || d.owner === rt.owner) && d.verb === rt.verb);
        if (ds.length === 1) dur = ds[0];
        else if (ds.length === 0 && isTimeUnit(rt.den)) {
          // "earns $10 an hour" and "worked 5 hours on Monday and 3 hours on Tuesday": the hours are the duration
          const hs = w.facts.filter((f) => (rt.owner === '_any' ? okOwner(f.owner) : f.owner === rt.owner) && unitOf(f.item) && isTimeUnit(unitOf(f.item)) && f.item.split(' ').length === 1 && defined(w, f.v) && (!filt.times || filt.times.includes(f.time)));
          const units = [...new Set(hs.map((f) => unitOf(f.item)))];
          if (!hs.length || units.length !== 1) return null;
          const k0 = unitsIn(units[0], rt.den, w); if (!k0) return null;
          let hf = null;
          for (const f of hs) { const hv = w.sys.value(fVar(f.v)); if (!hv) return null; hf = hf ? fAdd(hf, hv) : hv; vars.push(f.v); }
          dur = { qx: hf, q: hf.c, unit: units[0], nums: [] };
        } else return null;
      }
      const k = unitsIn(dur.unit, DAYISH.has(rt.den) ? 'day' : rt.den, w);
      if (!k) return null;
      nums.push(...(dur.nums || []));
      let d = dur.qx ? dur.qx : fConst(dur.q);
      if (!E.qEq(k, E.Q1)) d = fScale(d, k, lit(k));
      part = fScale(d, rv.c, rv.x);
    } else {
      const sub = amount(w, rt.den, filt, depth + 1);
      if (!sub) return null;
      const sk = w.sys.value(sub.form);
      nums.push(...(sub.nums || []));
      vars.push(...(sub.vars || []), ...sub.form.t.keys());
      part = sk ? fScale(sk, rv.c, rv.x) : fScale(sub.form, rv.c, rv.x);
    }
    form = form ? fAdd(form, part) : part;
  }
  return { form, nums, vars };
}

/** What an owner holds after the events that took from it or added to it. */
function stock(w, item, owners) {
  const okOwner = (o) => !owners || owners.includes(o);
  const base = w.facts.filter((f) => okOwner(f.owner) && f.verb === 'have' && itemMatch(f.item, item) && defined(w, f.v));
  if (!base.length) return null;
  let form = base.reduce((acc, f) => fAdd(acc, fVar(f.v)), fConst(E.Q0));
  for (const f of w.facts) {
    if (!okOwner(f.owner) || !itemMatch(f.item, item) || !defined(w, f.v) || f.verb === 'have') continue;
    if (LOSS_VERBS.has(f.verb)) form = fSub(form, fVar(f.v));
    else if (GAIN_VERBS.has(f.verb)) form = fAdd(form, fVar(f.v));
    else return null;
  }
  return { form, nums: [] };
}

function ownersFor(w, s) {
  if (!s) return null;
  const e = entityOf(w, s);
  if (!e) return null;
  const k = ownerKey(w, e);
  return [k, ...membersOf(w, k).filter((x) => x !== k)];
}
F.SCOPE = '(?:(?:in|over|during|for|after|within) (?:the next |the first |a |an |one )?(?:#\\d+ )?' + W + '|every ' + W + '|per ' + W + '|a ' + W + '|each ' + W + '|daily|weekly|monthly|yearly)';
function scopeOf(w, ctx, s) {
  if (!s) return null;
  const m = /^(?:(?:in|over|during|for|after|within) (?:the next |the first |a |an |one )?(?:(#\d+) )?|every |per |a |each )?([a-z]+)$/.exec(s);
  if (!m) return false;
  let unit = UNIT_OF[m[2]] || ({ daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' })[m[2]];
  if (!unit || !isTimeUnit(unit)) return false;
  const n = m[1] ? numOf(ctx, m[1]) : null;
  return { q: n ? n.v : E.Q1, unit, nums: n ? [numIdx(m[1])] : [] };
}

// "How many clips did Natalia sell altogether in April and May?", "How many peaches does he collect?",
// "how many liters of water does he get every day", "how many dozens of eggs will she eat in 4 weeks"
qrule('q.event', 'how many {NP:n} (?:did|does|do|will|would|can|could) {SUBJ:s} {VPRE}{W:v}(?: {TOTAL})?(?: (?:in|on|during) {TIMES:ts}| {SCOPE:sc}| (?:after|in|over|during|for) (?:all|the|all the) (?<nd>#\\d+) (?:days|weeks|months|years|games|stores))?(?: {TOTAL})?', (w, m, ctx) => {
  const verb = vlemma(m.groups.v); if (!verb) return null;
  const owners = ownersFor(w, m.groups.s); if (!owners) return null;
  const times = m.groups.ts ? m.groups.ts.split(/,? and |, /).map((x) => x.replace(/^the /, '')) : null;
  const dur = scopeOf(w, ctx, m.groups.sc);
  if (dur === false) return null;
  const item = npKey(m.groups.n);
  const verbs = item === 'dollar' ? (INCOME.includes(verb) ? INCOME : EXPENSE.includes(verb) ? EXPENSE : null) : [POSSESS.has(verb) ? 'have' : verb];
  if (!verbs) return null;
  const a = amount(w, item, { owners, verbs, times, dur });
  if (!a) return null;
  const extra = dur ? dur.nums : [];
  if (m.groups.nd) {
    // "after all three days": the count must be the number of times the summed facts name
    const ts = new Set(w.facts.filter((f) => a.form.t.has(f.v) || [...a.form.t.keys()].length === 0).map((f) => f.time));
    const used = new Set(w.facts.filter((f) => owners.includes(f.owner) && verbs.includes(f.verb) && itemMatch(f.item, item) && defined(w, f.v)).map((f) => f.time));
    const n = numOf(ctx, m.groups.nd);
    if (!n || !E.qEq(n.v, E.Q(BigInt(used.size))) || used.has(null)) return null;
    extra.push(numIdx(m.groups.nd));
  }
  return { ...a, nums: [...(a.nums || []), ...extra], count: item !== 'dollar' };
});
// "How many thorns are there total?", "How many gems were there in the chest?"
qrule('q.there', 'how many (?:of the )?{NP:n} (?:are|were|is|will be) there(?: {TOTAL})?(?: (?:in|on|at) (?:the|a) {NP:p})?(?: {TOTAL})?', (w, m) => {
  const a = amount(w, npKey(m.groups.n), { owners: null, verbs: null });
  return a ? { ...a, count: true } : null;
});
// "How many coins does Gretchen have?", "how many crabs do they have together", "... have left"
qrule('q.have', 'how many {NP:n} (?:does|do|did|will) {SUBJ:s}(?<cur> currently| now| still)? (?:have|own)(?<left> left| now| remaining| currently)?(?: {TOTAL})?', (w, m) => {
  const owners = ownersFor(w, m.groups.s); if (!owners) return null;
  const item = npKey(m.groups.n);
  let a = m.groups.left || m.groups.cur ? stock(w, item, owners) : amount(w, item, { owners, verbs: ['have'] });
  if (!a && !m.groups.left && !m.groups.cur) {
    const vs = [...new Set(w.facts.filter((f) => owners.includes(f.owner) && itemMatch(f.item, item) && defined(w, f.v)).map((f) => f.verb))];
    if (vs.length === 1) a = amount(w, item, { owners, verbs: vs });
  }
  return a ? { ...a, count: true } : null;
});
// "How many loaves of bread did they have left?"
qrule('q.left', 'how many {NP:n} (?:are|were|is|was) (?:left|remaining)', (w, m) => {
  const a = stock(w, npKey(m.groups.n), null);
  return a ? { ...a, count: true } : null;
});
// "How much money does he make in total?", "How much did he pay?", "how much did everything cost"
qrule('q.money', 'how much(?: money)? (?:did|does|do|will|would) {SUBJ:s} {VPRE}{W:v}(?: {TOTAL})?(?: {SCOPE:sc})?(?: {TOTAL})?', (w, m, ctx) => {
  const verb = vlemma(m.groups.v); if (!verb) return null;
  const owners = ownersFor(w, m.groups.s); if (!owners) return null;
  const verbs = INCOME.includes(verb) ? INCOME : EXPENSE.includes(verb) ? EXPENSE : null;
  if (!verbs) return null;
  const dur = scopeOf(w, ctx, m.groups.sc);
  if (dur === false) return null;
  const a = amount(w, 'dollar', { owners, verbs, dur });
  return a ? { ...a, nums: [...(a.nums || []), ...(dur ? dur.nums : [])], count: false } : null;
});
// "What's the total amount the company spent on advertising for the two years?"
qrule('q.money.total', '(?:what is|what\'s|calculate|find) the total (?:amount|amount of money|money|cost)(?: that)? {SUBJ:s} {W:v}(?: on {NP:on})?(?: (?:for|in|over) the (?<nd>#\\d+) (?:years|months|weeks|days))?', (w, m, ctx) => {
  const verb = vlemma(m.groups.v); if (!verb) return null;
  const owners = ownersFor(w, m.groups.s); if (!owners) return null;
  const verbs = INCOME.includes(verb) ? INCOME : EXPENSE.includes(verb) ? EXPENSE : null;
  if (!verbs) return null;
  const fs = w.facts.filter((f) => owners.includes(f.owner) && verbs.includes(f.verb) && f.item === 'dollar' && defined(w, f.v));
  const a = amount(w, 'dollar', { owners, verbs });
  if (!a) return null;
  const nums = [];
  if (m.groups.nd) { const n = numOf(ctx, m.groups.nd); if (!n || !E.qEq(n.v, E.Q(BigInt(fs.length)))) return null; nums.push(numIdx(m.groups.nd)); }
  return { ...a, nums: [...(a.nums || []), ...nums], count: false };
});
qrule('q.cost.all', 'how much did (?:everything|it all|they|it) cost(?: {TOTAL})?', (w) => {
  const a = amount(w, 'dollar', { owners: null, verbs: EXPENSE });
  return a ? { ...a, count: false } : null;
});
// "How old is Trent?", "how old is Shawna's father"
qrule('q.age', "how old (?:is|was) {SUBJ:s}(?: now)?", (w, m) => {
  const f = ageOf(w, m.groups.s);
  return f ? { form: f, nums: [], count: false } : null;
});
// "How many more hours did Harry sleep than James?", "how many more pages did Denise read than Daniel"
qrule('q.more', 'how many more {NP:n} (?:did|does|do|will) {SUBJ:a} {VPRE}{W:v} than {SUBJ:b}(?: (?:did|does|do))?', (w, m) => {
  const verb0 = vlemma(m.groups.v); if (!verb0) return null;
  const verb = POSSESS.has(verb0) ? 'have' : verb0;
  const item = npKey(m.groups.n);
  const A = ownersFor(w, m.groups.a), B = ownersFor(w, m.groups.b);
  if (!A || !B) return null;
  const a = amount(w, item, { owners: A, verbs: [verb] }), b = amount(w, item, { owners: B, verbs: [verb] });
  if (!a || !b) return null;
  return { form: fSub(a.form, b.form), nums: [...(a.nums || []), ...(b.nums || [])], vars: [...(a.vars || []), ...(b.vars || [])], count: true };
});

// "calculate the total number of crabs the three have together", "how many clay dishes they all make together"
qrule('q.total', '(?:calculate|find|what is|what\'s|determine) the total (?:number|amount) of {NP:n}(?: that)? (?:(?<all>the (?:two|three|four|five|#\\d+)|they(?: all| both)?)|{SUBJ:s}) (?:(?:all|both) )?{W:v}(?: {TOTAL})?', (w, m, ctx) => totalQ(w, m, ctx));
qrule('q.they', 'how many {NP:n}(?: (?:did|do|does|will|can))? (?:(?<all>they(?: all| both)?|the (?:two|three|four|#\\d+))|{SUBJ:s}) (?:(?:all|both) )?{W:v}(?: {TOTAL})?', (w, m, ctx) => totalQ(w, m, ctx));
function totalQ(w, m, ctx) {
  const g = m.groups;
  const verb0 = vlemma(g.v); if (!verb0) return null;
  const verb = POSSESS.has(verb0) ? 'have' : verb0;
  let owners;
  if (g.all) {
    const people = w.persons.filter((p) => !w.groups.has(p) && !p.startsWith('_'));
    const want = /#(\d+)/.exec(g.all);
    const wordN = { two: 2, three: 3, four: 4, five: 5 }[g.all.split(' ').pop()];
    if (want) { const n = numOf(ctx, want[0]); if (!n || !E.qEq(n.v, E.Q(BigInt(people.length)))) return null; w.freeNums.add(Number(want[1])); }
    else if (wordN && wordN !== people.length) return null;
    owners = g.all.startsWith('they') && w.lastGroup ? membersOf(w, w.lastGroup) : people;
  } else owners = ownersFor(w, g.s);
  if (!owners) return null;
  const item = npKey(g.n);
  let form = null; const vars = [];
  for (const o of owners) {
    let a = amount(w, item, { owners: [o], verbs: [verb] });
    if (!a && verb === 'have') a = amount(w, item, { owners: [o], verbs: null });
    if (!a) return null;
    vars.push(...(a.vars || []));
    form = form ? fAdd(form, a.form) : a.form;
  }
  return { form, nums: [], vars, count: true };
}
// "What is the difference between the ages of Alice and Erica"
qrule('q.agediff', 'what is the difference (?:between|in) (?:the )?ages? of {SUBJ:a}', (w, m) => {
  const g = m.groups.a;
  if (!g.includes('&')) return null;
  const [x, y] = g.split('&');
  const A = ageOf(w, x), B = ageOf(w, y);
  if (!A || !B) return null;
  const d = fSub(A, B);
  const v = w.sys.value(d);
  if (!v) return null;
  return { form: v.c.n < 0n ? fSub(B, A) : d, nums: [], count: false };
});
// "How many lollipops did each of his friends receive?"
qrule('q.each', 'how many {NP:n} (?:did|does|do|will|would|can) each(?: of (?:his|her|their|the))? {NP:r} (?:receive|get|have)', (w, m) => {
  const rs = w.rates.filter((x) => x.owner === '_share' && itemMatch(x.num, npKey(m.groups.n)) && itemMatch(x.den, npKey(m.groups.r)));
  if (rs.length !== 1) return null;
  return { form: fVar(rs[0].v), nums: [], vars: [rs[0].v], count: true };
});
// "How many apples are green?"
qrule('q.kind', 'how many(?: of the)? {NP:n} (?:are|were|is|was) {W:adj}', (w, m) => {
  const item = npKey(m.groups.n);
  const head = item.split(' of ')[0].split(' ').pop();
  const fs = w.facts.filter((f) => f.kind && f.item === m.groups.adj + ' ' + head && defined(w, f.v));
  if (fs.length !== 1) return null;
  return { form: fVar(fs[0].v), nums: [], count: true };
});
// "How much sugar does he need to make 8 batches of suckers and 1 batch of fudge?"
qrule('q.need', 'how much {NP:n} (?:does|do|did|will) {SUBJ:s} need to {W:v} (?<l>' + F.QL + ')', (w, m, ctx) => {
  const owners = ownersFor(w, m.groups.s); if (!owners) return null;
  const list = qlist(ctx, m.groups.l); if (!list) return null;
  const item = npKey(m.groups.n);
  let form = null; const vars = [], nums = [];
  for (const x of list) {
    const rs = w.rates.filter((r) => r.verb === 'need' && owners.includes(r.owner) && itemMatch(r.num, item) && itemMatch(r.den, x.item));
    if (rs.length !== 1) return null;
    const rv = w.sys.value(fVar(rs[0].v)); if (!rv) return null;
    vars.push(rs[0].v); nums.push(...x.nums);
    const part = fScale(fConst(x.q), rv.c, rv.x);
    form = form ? fAdd(form, part) : part;
  }
  return { form, nums, vars, count: false };
});
// "how many hash browns can you make out of 96 potatoes?"
qrule('q.outof', 'how many {NP:n} (?:can|could|will|would) (?:you|we|he|she|they|i) {W:v} (?:out of|from|with) {QTY:q} {NP:d}', (w, m, ctx) => {
  const rs = w.rates.filter((r) => itemMatch(r.num, npKey(m.groups.n)) && itemMatch(r.den, npKey(m.groups.d)));
  if (rs.length !== 1) return null;
  const rv = w.sys.value(fVar(rs[0].v)); if (!rv) return null;
  const n = numOf(ctx, m.groups.q); if (!n || n.money || n.pct) return null;
  return { form: fScale(fConst(n.v), rv.c, rv.x), nums: [numIdx(m.groups.q)], vars: [rs[0].v], count: true };
});
// "How much does Brady have in his piggy bank in dollars?": the coins, each at what it is worth
qrule('q.coins', 'how much(?: money)? (?:does|do|did) {SUBJ:s} have(?: in (?:his|her|their|the) {NP:p})?(?: in dollars)?', (w, m) => {
  const owners = ownersFor(w, m.groups.s); if (!owners) return null;
  const fs = w.facts.filter((f) => owners.includes(f.owner) && f.verb === 'have' && defined(w, f.v));
  if (!fs.length) return null;
  let form = null; const vars = [];
  for (const f of fs) {
    const worth = f.item === 'dollar' ? E.Q1 : COIN[f.item];
    if (!worth) return null;
    const cv = w.sys.value(fVar(f.v)); if (!cv) return null;
    vars.push(f.v);
    const part = E.qEq(worth, E.Q1) ? cv : fScale(cv, worth, lit(worth));
    form = form ? fAdd(form, part) : part;
  }
  return { form, nums: [], vars, count: false };
});

learnLiterals();

// ================================================================ reading a text
const GROUP_RE = /(^|, |\bif |\bdid |\bdo |\bdoes |\bwill |\bthat |\bcan |\bhave |\bhas |\bwere |\bare |\bbetween |\bwould |\bnamed |\bcalled |\bof )(@[a-z]+(?:'s ~?[a-z]+)?(?:, @[a-z]+(?:'s ~?[a-z]+)?)*,? and (?:@[a-z]+(?:'s ~?[a-z]+)?|(?:his|her|their) ~?[a-z]+))(?= |$|,)/g;
function mergeGroups(marked) {
  return marked.replace(GROUP_RE, (m, pre, list) => {
    const parts = list.split(/,? and |, /);
    if (new Set(parts).size !== parts.length) return m;
    if (parts.length === 2 && /, and /.test(list)) return m;
    return pre + parts.join('&');
  });
}
function splitClauses(marked) {
  // a list of names is one subject; ", and then", ", then", ", and <subject>", "; " split clauses; ", who"
  // opens a clause about the name before it
  let s = mergeGroups(marked);
  s = s.replace(/(@[a-z]+), who /g, '$1; $1 ');
  return s.split(/, and then |, then | and then |, and (?=(?:he|she|they|i|we|@[a-z]+|there|the|his|her|their) )|, but |; |, while | while (?=(?:he|she|they|@[a-z]+) )/);
}

const SHAPE_WORDS = new Set(['more', 'fewer', 'less', 'than', 'times', 'twice', 'half', 'as', 'many', 'much', 'each', 'every', 'per', 'left', 'rest', 'remaining', 'total', 'how', 'of', 'the', 'a', 'an']);
/** The clause as a shape: numbers #, names @, verbs V, nouns N, structure words themselves. */
export function shapeOf(clause) {
  const out = [];
  for (const x of String(clause).replace(/~/g, '').split(' ')) {
    const b = x.replace(/[,;:]$/, '');
    let t;
    if (/^\$#/.test(b)) t = '$';
    else if (/^#\d+%$/.test(b)) t = '%';
    else if (/^#/.test(b)) t = '#';
    else if (/^@/.test(b)) t = '@';
    else if (SHAPE_WORDS.has(b) || PRONOUNS.includes(b)) t = b;
    else if (VERB_FORMS[b]) t = 'V';
    else if (RESERVED.has(b)) t = b;
    else t = 'N';
    if (t === 'N' && out[out.length - 1] === 'N') continue;
    out.push(t);
  }
  return out.join(' ');
}
function stopOf(clause) {
  for (const x of String(clause).replace(/~/g, '').split(' ')) {
    const b = x.replace(/[,;:]$/, '').replace(/'s$/, '');
    if (/^[$#@]/.test(b)) continue;
    if (!RESERVED.has(b) && !VERB_FORMS[b]) return b;
  }
  return shapeOf(clause).split(' ').slice(0, 3).join(' ');
}

/**
 * The whole reading, for the reader, the refusal and the development tool.
 * @param {string} text
 * @returns {{ok: true, result: object}|{ok: false, stop: string, word: string}}
 */
export function wordRead(text) {
  const s = cleanText(text);
  if (!s || s.length > MAX_CHARS) return { ok: false, stop: 'empty or too long', word: '' };
  const sents = splitSentences(s);
  if (sents.length < 2 && !/^if [^?]*, (?:how|what)\b/i.test(s)) return { ok: false, stop: s.slice(0, 80), word: 'one sentence' };
  const lexed = [];
  for (const st of sents) {
    const lx = lexSentence(st);
    if (lx.stop) return { ok: false, stop: st, word: lx.stop };
    lexed.push({ text: st, toks: lx.toks });
  }
  const names = findNames(lexed.map((x) => x.toks));
  for (const x of lexed) for (const t of x.toks) if (t.k === 'word' && t.cap && names.has(t.w)) t.k = 'name';
  const qi = lexed.length - 1;
  const qs = lexed.filter((x) => /\?$/.test(x.text));
  if (qs.length > 1 || (qs.length === 1 && qs[0] !== lexed[qi])) return { ok: false, stop: (qs[0] || lexed[qi]).text, word: 'question not last' };
  const world = new World(names);
  const ctx = { nums: [] };
  const snapshot = () => ({ facts: world.facts.length, rates: world.rates.length, eqs: world.eqs.length, durations: world.durations.length, sub: new Map(world.sys.sub), lastFact: world.lastFact, lastItem: world.lastItem, lastPerson: world.lastPerson, lastGroup: world.lastGroup, persons: world.persons.length, steps: world.steps, totals: world.totals.length, free: new Set(world.freeNums), refs: world.facts.map((f) => f.ref), time: ctx.time });
  const restore = (x) => {
    world.facts.length = x.facts; world.rates.length = x.rates; world.eqs.length = x.eqs; world.durations.length = x.durations;
    world.sys.sub = x.sub; world.sys.bad = null; world.lastFact = x.lastFact; world.lastItem = x.lastItem; world.lastPerson = x.lastPerson;
    world.lastGroup = x.lastGroup; world.persons.length = x.persons; world.steps = x.steps; world.totals.length = x.totals; world.freeNums = x.free;
    world.facts.forEach((f, i) => { f.ref = x.refs[i]; }); ctx.time = x.time;
  };
  const tryClause = (c) => {
    for (const ru of RULES) {
      if (ru.gate && !ru.gate.test(c)) continue;
      const m0 = ru.re.exec(c);
      const m = m0 && unmark(m0);
      if (!m) continue;
      const snap = snapshot();
      if (ru.fn(world, m, ctx) && !world.sys.bad) {
        if (m.raw.s) { world.lastSubj = m.raw.s; world.lastSubjVerb = m.indices.groups.v ? c.slice(0, m.indices.groups.v[1]) : null; }
        return true;
      }
      restore(snap);
    }
    return false;
  };
  const readOne = (c, depth = 0) => {
    if (tryClause(c)) return true;
    if (depth > 3) return false;
    // "and then spends a third of that amount": the subject of the clause before
    const w0 = c.split(' ')[0];
    if (world.lastSubj && VERB_FORMS[w0] && !/^(?:is|are|was|were|has|have|had)$/.test(w0)) { const snap = snapshot(); if (tryClause(world.lastSubj + ' ' + c)) return true; restore(snap); }
    // "On Tuesday she bought ...": the time goes with the clause
    const lt = LEAD_TIME.exec(c);
    if (lt) { const snap = snapshot(); ctx.time = timeKey(lt[1]); if (readOne(lt[2], depth + 1)) return true; restore(snap); }
    // "After transferring to a new school, Amy made ...": a circumstance with no quantity in it
    const lc = /^(?:after|before|while|during|in|on|at|for|over|according to|with|since|because|as) ([^,]*), (.+)$/.exec(c);
    if (lc && !INTRO_BAN.test(lc[1]) && !/[#@$]/.test(lc[1])) { if (readOne(lc[2], depth + 1)) return true; }
    // "Amy is 5 years older than Jackson and 2 years younger than Corey": the subject carries over
    const cuts = [...c.matchAll(/,? and |,? but /g)];
    for (const cut of cuts) {
      const left = c.slice(0, cut.index), right = c.slice(cut.index + cut[0].length);
      const snap = snapshot();
      world.lastSubj = null;
      if (readOne(left, depth + 1) && world.lastSubj) {
        const subj = world.lastSubj;
        const sv = world.lastSubjVerb;
        const again = /^(?:he|she|they|it|@|the |his |her |their |there )/.test(right) ? right : /^\$?#/.test(right) && sv ? sv + ' ' + right : subj + ' ' + right.replace(/^(?:also|then) /, '');
        if (readOne(again, depth + 1)) return true;
      }
      restore(snap);
    }
    return false;
  };
  const readClauses = (marked) => {
    for (let c of splitClauses(marked)) {
      c = c.replace(/^(?:if|then|so|and|also|finally|later|meanwhile|now|after that|but|however|in addition|additionally),? /, '').replace(/[,;:]$/, '').trim();
      if (!c) continue;
      if (!readOne(c)) return { ok: false, stop: c.replace(/~/g, ''), word: stopOf(c), shape: shapeOf(c) };
    }
    return null;
  };
  for (let i = 0; i < qi; i++) {
    ctx.time = null;
    const toks = lexed[i].toks.filter((t) => !(t.k === 'p' && /[.!?]/.test(t.w)));
    const bad = readClauses(markClause(toks, ctx.nums));
    if (bad) return bad;
  }
  const qtoks = lexed[qi].toks.filter((t) => !(t.k === 'p' && /[.!?]/.test(t.w)));
  let qm = mergeGroups(markClause(qtoks, ctx.nums));
  const lead = /^(.*), ((?:how|what|calculate|find)\b.*)$/.exec(qm);
  ctx.time = null;
  if (lead) { const bad = readClauses(lead[1]); if (bad) return bad; qm = lead[2]; }
  const tail = /^((?:how|what)\b.*?),? if (.+)$/.exec(qm);
  if (tail) { const bad = readClauses(tail[2]); if (bad) return bad; qm = tail[1]; }
  for (const t of world.totals) {
    const fs = world.facts.filter((f) => f.verb === 'have' && itemMatch(f.item, t.item));
    if (!fs.length) return { ok: false, stop: qm, word: 'a total of nothing' };
    world.eqs.push({ vars: new Set(fs.map((f) => f.v)), nums: new Set(t.nums) });
    if (!world.sys.eq(fs.reduce((acc, f) => fAdd(acc, fVar(f.v)), fConst(E.Q0)), fConst(t.q))) return { ok: false, stop: qm, word: 'contradiction' };
  }
  let q = null;
  const tried = [];
  for (const qr of QRULES) {
    const m0 = qr.re.exec(qm);
    const m = m0 && unmark(m0);
    if (!m) continue;
    tried.push(qr.name);
    q = qr.fn(world, m, ctx);
    if (q) break;
  }
  if (!q) return { ok: false, stop: qm.replace(/~/g, ''), word: tried.length ? 'question read, quantity not found (' + tried.join(', ') + ')' : stopOf(qm), shape: shapeOf(qm) };
  if (world.sys.bad) return { ok: false, stop: qm, word: world.sys.bad };
  const val = world.sys.value(q.form);
  if (!val) return { ok: false, stop: qm, word: 'undetermined' };
  // THE UNUSED NUMBER RULE: a number the text gave that the answer does not depend on is a quantity
  // the reader bound but did not understand, so the reading is refused.
  const used = world.usedNums([...q.form.t.keys(), ...(q.vars || [])]);
  for (const n of numsIn(qm)) used.add(n);
  for (const n of q.nums || []) used.add(n);
  for (const n of world.freeNums) used.add(n);
  for (let i = 0; i < ctx.nums.length; i++) if (!used.has(i)) return { ok: false, stop: ctx.nums[i].raw, word: 'unused number' };
  const v = val.c;
  if (v.n < 0n) return { ok: false, stop: qm, word: 'negative' };
  if (q.count && v.d !== 1n) return { ok: false, stop: qm, word: 'not a whole count' };
  if (!q.count && E.qToDecimal(v) === null) return { ok: false, stop: qm, word: 'not a decimal' };
  const expression = exprText(val.x);
  const back = evalExact(parseWhole(tokenize(expression)));
  if (!back || !E.qEq(back, v)) return { ok: false, stop: expression, word: 'expression check' };
  const answer = qText(v);
  const steps = ['read as a word problem: ' + world.steps + ' equations over the quantities the sentences bound; every word consumed by a rule, a bound name or a unit', 'expression ' + expression, 'exact rational arithmetic on BigInt, no rounding at any step'];
  return { ok: true, result: { answer, method: WORD_METHOD, steps, expression } };
}

/**
 * The word problem as an exact answer, or null. Null unless EVERY clause was read whole.
 * @param {string} text
 * @returns {{answer: string, method: 'exact.word', steps: string[], expression: string}|null}
 */
export function readWord(text) {
  let r;
  try { r = wordRead(text); } catch { return null; }
  return r.ok ? r.result : null;
}

/**
 * Where the reader stopped: the first word no rule consumed and the clause it is in, or null when the
 * reader read the whole text.
 * @param {string} text
 * @returns {string|null}
 */
export function wordRefusal(text) {
  let r;
  try { r = wordRead(text); } catch (e) { return 'the reader failed: ' + String(e && e.message); }
  if (r.ok) return null;
  return '"' + r.word + '" in: ' + r.stop;
}
