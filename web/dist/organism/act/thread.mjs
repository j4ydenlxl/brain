// act/thread.mjs: THE NATIVE MULTI-TURN CARRY.
//
// His words (grow/NEO.md head, 2026-10-01): "Should work exactly like llms fronteir level" and "The
// whole point is a new way of ai, an ai datacenter in the cloud and in the pocket that works exactly
// like fronteir ai + the features i told u". A frontier model reads a follow-up against the turns
// before it: "and germany?" after "what is the capital of france" asks for the capital of germany.
// This file does the same BY RULE, with no model: carry(turns, prompt) rewrites a follow-up that
// leans on earlier turns into one prompt that stands alone, and the organism answers that prompt on
// its usual path (the exact reader, the conversation region, memory, the cells).
//
// THE RULES (RULES below, each by name):
//   subject     a new subject into the last frame: "and germany?", "what about spain", "how about
//               japan?", "germany?" after "what is the capital of france" give "what is the capital of
//               germany".
//   frame       a new frame onto the last subject: a pronoun (it, its, they, their, them, he, she, his,
//               her, that, this, there) replaced by that subject with the possessive kept right ("its
//               population" gives "japan's population", "where did he die" gives "where did ada
//               lovelace die", "there" gives "in japan"); also "and the population?" (a relation
//               onto the subject) and "how big?" (an adjective onto it).
//   repeat      "again", "say that again", "repeat that": the last prompt as it was asked.
//   continue    "more", "tell me more", "go on", "explain more": "tell me more about <subject>";
//               "why?" or "how?" after a yes or no question: "why <that question>", "how <that question>".
//   arith       "plus 9", "times 2", "divide that by 3", "and squared": "what is <answer> plus 9", the
//               answer being the last numeric answer, read from the last turn's text by rule (its last
//               line, which is where every exact answer of the organism prints its value).
//   correction  "no, i meant spain": the last frame with the new subject; a class noun ("i mean the
//               city", "i meant the country") names which one the old subject was: "georgia (country)",
//               the way the ingested encyclopedia titles its pages.
//
// CONSERVATIVE BY CONSTRUCTION. A wrong carry is worse than none, so a rule refuses (the prompt goes on
// unchanged) whenever two readings are possible:
//   - a prompt that stands alone (it names its own subject and has no pronoun or ellipsis) never carries;
//   - a pronoun with no earlier subject, or across a turn this file could not read, does not carry;
//   - he, she, his, him and her do not carry when two different people were asked about;
//   - after a question whose ANSWER is itself an entity ("what is the capital of france" answers a city,
//     "who wrote hamlet" answers a person), a pronoun that could mean that answer does not carry;
//   - expletive it ("what time is it", "is it true that", "how long does it take to", "how hot is it")
//     does not carry;
//   - a pronoun prompt with a clause joined to it ("and", "but", a comma) does not carry, even when the
//     frames would read the result ("what is its population and area"): its pronoun may point inside
//     the prompt;
//   - after a subject, frame or correction rewrite, the prompt must read as one of the frames below with
//     the subject in its slot, or nothing is carried (the frames are the grammar of what this file may
//     produce); repeat, continue and arith produce fixed shapes ("tell me more about X", "why <question>",
//     "what is A plus N");
//   - a bare follow-up subject ("paris?") that the last answer itself names is an echo of that answer,
//     not a new subject: it does not carry;
//   - "why?" and "how?" carry only after a yes or no question, "more" only after a question whose answer
//     is not itself an entity.
// A greeting, thanks, farewell or any other turn act/converse.mjs carries is answered by that region:
// it neither carries nor becomes a subject.
//
// THE HISTORY. turns are [{ prompt, text }], oldest first, as the person typed them and as the organism
// answered. At most MAX_TURNS are read (the newest), each prompt cut at 2000 characters. Each earlier
// turn is itself resolved against the turns before it, so "and germany?" then "what about spain" both
// read the frame of the question two turns back.
//
// PURITY. This file imports act/converse.mjs only (itself free of any runtime import): no node: module,
// no process, no Buffer, no require, no clock read, no randomness, no network, no model. The same turns
// and prompt give the same answer in Node 22, Node 24 and a browser tab.
import { converse } from './converse.mjs';

/** The most turns read, the newest ones. */
export const MAX_TURNS = 20;
const MAX_CHARS = 2000; // each prompt is cut here; a longer prompt to carry stands alone
const MAX_LINE = 200; // the answer line of a turn's text is read up to here
const SLOT = '{}';

/** The rules, by name, in the order they are tried after the conversation region. */
export const RULES = Object.freeze(['repeat', 'continue', 'arith', 'correction', 'subject', 'frame']);

// ---------------------------------------------------------------- the lexicon
const set = (s) => new Set(s.split('|'));
// Words that cannot sit in a subject: pronouns (that is what the frame rule is for), first and second
// person, and the function words of a clause (a subject is a noun phrase, never a clause).
const PRONOUNS = set('it|its|he|she|him|his|her|hers|they|them|their|theirs|this|that|there|these|those|itself|himself|herself|themselves');
const BLOCK = new Set([...PRONOUNS, ...set('i|me|my|mine|you|your|yours|we|us|our|ours|here|from|to|than|compared|versus|vs|with|without|if|when|because|since|while|during|after|before|for|about|is|are|was|were|be|been|being|am|do|does|did|done|can|could|will|would|should|shall|may|might|must|have|has|had|not|why|how|what|who|whom|whose|where|which')]);
const BAD_START = set('and|or|but|of|in|on|at|by|so|then|also|just|very|really|please|ok|okay|yes|no|some|any|every|each|all|more|most|less|other|another|same|next|last|previous|only');
const BAD_END = set('the|a|an|of|in|on|at|and|or|by');
const FUNCTION = set('the|a|an|of|in|on|at|by|and|or');
// Words a follow-up subject typed alone may not hold: time, numbers, comparatives, adjectives,
// imperatives and interjections. "germany?" is a subject; "tomorrow?", "bigger?", "explain?" are not.
// A time or number word anywhere in a follow-up subject refuses it ("what about next monday"); the
// rest refuse it only when every content word is one of them ("what about new york" is a subject).
const TIME_NUM_WORDS = 'today|tomorrow|yesterday|tonight|now|later|earlier|soon|morning|evening|afternoon|night|week|weekend|month|year|monday|tuesday|wednesday|thursday|friday|saturday|sunday'
  + '|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|hundred|thousand|million|billion|first|second|third|half|ones|once|twice';
const TIME_NUM = set(TIME_NUM_WORDS);
const ELLIPSIS_BAD = set(TIME_NUM_WORDS
  + '|bigger|smaller|larger|older|younger|taller|shorter|longer|faster|slower|higher|lower|better|worse|best|worst|closer|farther|further|cheaper|richer|poorer|hotter|colder|warmer|cooler|heavier|lighter|deeper|wider|easier|harder|less|least|more|most'
  + '|big|small|good|bad|nice|cool|true|false|real|sure|right|wrong|correct|important|interesting|possible|likely|safe|dangerous|easy|hard|difficult|expensive|cheap|old|new|young|fast|slow|hot|cold|warm|high|low|long|short|tall|large|little|huge|tiny|rich|poor|famous|popular|different|similar|great|amazing|awesome|weird|strange|funny|serious|alive|dead|married|single|free|open|closed|done|finished|ready|available|fine'
  + '|seriously|actually|exactly|definitely|probably|maybe|perhaps|sometimes|always|never|often|usually|again|instead|too|either|neither|both|none|else|anything|something|nothing|everything|everyone|someone|nobody|thanks|thank|please|yes|yeah|no|nope|ok|okay|hmm|huh|wow|lol|why|how'
  + '|explain|continue|elaborate|stop|wait|go|tell|show|give|say|repeat|define|describe|list|compare|help|try|calculate|compute|solve|write|read|check|look|find|search|translate|summarize|summarise|clarify|expand|proceed|next|back|skip|retry|more');
// Relations a question asks of a subject ("the capital of france"). An ATTRIBUTE answers a value (a
// number, a date, a description) that no later "it" can mean; any other relation answers an entity.
const RELATIONS = set('capital|capital city|largest city|population|area|size|president|prime minister|king|queen|leader|ruler|currency|language|official language|flag|anthem|national anthem|gdp|climate|weather|history|government|religion|ceo|founder|owner|height|age|length|width|depth|weight|mass|diameter|radius|temperature|distance|speed|density|color|colour|birthday|birthplace|wife|husband|father|mother|spouse|nationality|occupation|net worth|motto|time zone|highest point|longest river|tallest building|mayor|governor|author|inventor|creator|meaning|origin|name|full name|real name|nickname|headquarters|economy|culture|cuisine|national sport|national animal|national bird|national flower|chancellor|emperor');
const ATTRIBUTES = set('population|area|size|height|age|length|width|depth|weight|mass|diameter|radius|temperature|climate|weather|history|gdp|economy|speed|density|distance|volume|elevation|altitude|birthday|date of birth|nationality|occupation|net worth|color|colour|meaning|origin|motto|time zone|shape|value|price|cost|lifespan|life expectancy|population density|surface area|boiling point|melting point|atomic number|atomic weight|name|full name|real name|nickname|culture|cuisine|government|religion');
const PERSON_RELATIONS = set('president|prime minister|king|queen|leader|ruler|ceo|founder|owner|wife|husband|father|mother|spouse|mayor|governor|author|inventor|creator|chancellor|emperor');
const PLACE_ANSWERS = set('capital|capital city|largest city|birthplace|headquarters|hometown|location|highest point|longest river|tallest building');
const PLACE_SUBJECTS = set('capital|capital city|largest city|population|area|president|prime minister|king|queen|currency|flag|anthem|national anthem|official language|gdp|climate|mayor|governor|time zone|motto|national animal|national bird|national flower|highest point|longest river|tallest building|economy|culture|cuisine|national sport|chancellor|government');
// Class nouns a correction names ("i mean the city"): the old subject, of that class.
const CLASSES = set('city|country|state|nation|province|region|island|town|village|river|mountain|lake|sea|ocean|planet|moon|star|band|group|singer|actor|actress|person|man|woman|movie|film|book|novel|song|album|game|video game|show|series|tv series|company|brand|team|club|language|programming language|animal|plant|element|ship|car|god|goddess|king|queen|president|emperor|play|painting|poem|word|letter|name');
// "there" after these is a destination ("go there" is "go to japan"); after a preposition it is the
// place itself ("from there" is "from japan"); otherwise a location ("live there" is "live in japan").
const MOTION = set('go|goes|going|went|gone|get|gets|getting|got|travel|travels|traveling|travelling|fly|flies|flying|drive|driving|move|moved|moving|walk|sail|ride|return|returned|come|came|coming|send|sent|ship|emigrate|emigrated|immigrate|immigrated');
const PREPS = set('from|near|around|in|at|over|into|across|through|of|to|toward|towards|beyond|inside|outside|within');
// "her" before one of these is the object ("tell me about her"); before anything else, the possessive.
const AFTER_OBJECT = set('to|for|with|about|in|on|at|from|by|and|or|as|than|again|now|then|first|last|ever|after|before|up|down|so|too|today|still');
// "it" is not a referent here: the weather and the clock ("is it raining", "what time is it"), and a
// clause that follows it ("is it true that", "how long does it take to"): those are expletive.
const EXPLETIVE_NEXT = set('raining|snowing|sunny|cloudy|windy|hot|cold|warm|cool|dark|light|late|early|night|day|morning|evening|noon|midnight|true|false|possible|okay|ok|safe|legal|normal|necessary|worth|time|now|today|tomorrow|yesterday');
const CLOCK = set('time|day|date|year|month|season|weather|temperature');
const CLAUSE = set('to|that|if|whether');
const JOINS = set('and|or|but|while|because|although|though|whereas|unless|since');
const ODD_PRONOUNS = set('hers|theirs|these|those|itself|himself|herself|themselves');
// Number words a follow-up operand may be typed in ("plus nine").
const ONES = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const SCALES = { hundred: 100, thousand: 1000, million: 1000000 };

// ---------------------------------------------------------------- the frames
// A frame is a question with one slot for its subject, read whole: (head)(slot)(tail). They are the
// shapes the organism already reads (act/prompt.mjs factQuestion: what, who and which with a copula,
// "what does X mean", where, when; act/converse.mjs keeps the conversational turns), and every carry
// this file makes must land in one of them. Each frame types its subject (person, place, thing or
// unknown) and the answer it asks for (an entity a later pronoun could mean, or a value no pronoun can).
// Tried in order; the first whose slot is a valid subject wins.
const typeOfRelation = (rel) => (PLACE_SUBJECTS.has(rel) ? 'place' : null);
const answerOfRelation = (rel, wh) => {
  if (ATTRIBUTES.has(rel)) return null;
  if (wh === 'who' || PERSON_RELATIONS.has(rel)) return 'person';
  return PLACE_ANSWERS.has(rel) ? 'place' : 'thing';
};
const lc = (s) => String(s ?? '').toLowerCase();
const FRAMES = [
  { id: 'relation', re: /^(?<head>(?<wh>what|who|which) (?:is|was|are|were) the (?<rel>[\p{L}'-]+(?: [\p{L}'-]+){0,2}?) (?:of|in) )(?<slot>.+?)(?<tail>)$/iu,
    type: (g) => typeOfRelation(lc(g.rel)), ans: (g) => answerOfRelation(lc(g.rel), lc(g.wh)) },
  { id: 'possessive', re: /^(?<head>(?:(?<wh>what|who|which|where|when) (?:is|was|are|were)|how (?:big|tall|old|large|long|far|many|much) (?:is|was|are|were)) )(?<slot>.+?)(?<tail>(?:'s|') (?<rel>[\p{L}'-]+(?: [\p{L}'-]+){0,2}))$/iu,
    type: (g) => typeOfRelation(lc(g.rel)), ans: (g) => answerOfRelation(lc(g.rel), lc(g.wh)) },
  { id: 'made', re: /^(?<head>who (?:wrote|invented|discovered|founded|painted|directed|created|built|designed|composed|sang|killed|owns|owned|started|made|produced|developed|named|led|won|assassinated|voiced|sculpted|coined|proposed|starred in|first climbed) )(?<slot>.+?)(?<tail>)$/iu,
    type: () => 'thing', ans: () => 'person' },
  { id: 'participle', re: /^(?<head>(?:when|where) (?:is|was|are|were) )(?<slot>.+?)(?<tail> (?<verb>born|buried|elected|crowned|founded|built|established|created|made|released|formed|started|opened|invented|discovered|published|written|signed|located|found|based|situated|named|launched|held|killed|painted|composed|recorded|destroyed|completed))$/iu,
    type: (g) => (/^(?:born|buried|elected|crowned)$/i.test(g.verb) ? 'person' : /^(?:located|situated)$/i.test(g.verb) ? 'place' : null), ans: () => null },
  { id: 'mean', re: /^(?<head>what (?:does|do|did) (?:the (?:word|term|name) )?)(?<slot>.+?)(?<tail> mean)$/iu,
    type: () => 'thing', ans: () => null },
  { id: 'did', re: /^(?<head>(?:when|where|how|why|what|who) (?:did|does|do) )(?<slot>.+?)(?<tail> (?<verb>die|live|grow up|study|work|start|begin|end|happen|form|fall|win|lose|invent|discover|write|paint|compose|build|found|create|say|do|eat|look like|come from|originate|become famous|break up|split up|retire|marry|get married|go to school|go to university|graduate|rise to power|come to power|reign|rule|play|sing|act|move|travel|stand for|cost|weigh|sell|make|produce|believe|teach|appear|exist|evolve|spread|collapse))$/iu,
    type: (g) => (/^(?:die|marry|get married|retire|graduate|go to school|go to university|grow up|study|rise to power|come to power|reign|sing|act)$/i.test(g.verb) ? 'person' : null), ans: () => null },
  { id: 'measure', re: /^(?<head>how (?:big|tall|old|large|long|far|deep|high|heavy|fast|wide|hot|cold|small|rich|famous|popular|bright|massive|dense|far away) (?:is|was|are|were) )(?<slot>.+?)(?<tail>)$/iu,
    type: () => null, ans: () => null },
  { id: 'why', re: /^(?<head>why (?:is|was|are|were) )(?<slot>.+?)(?<tail> (?:famous|so famous|important|so important|significant|known|popular|so popular|special|remembered|celebrated|controversial|dangerous))$/iu,
    type: () => null, ans: () => null },
  { id: 'known', re: /^(?<head>what (?:is|was|are|were) )(?<slot>.+?)(?<tail> (?:famous for|known for|best known for|noted for|remembered for|used for|made of|made from|named after))$/iu,
    type: () => null, ans: () => null },
  { id: 'spoken', re: /^(?<head>(?:what|which) (?:language|languages|currency|religion|religions|sport|sports) (?:is|are|was|were) (?:spoken|used|practiced|practised|played|popular|common) in )(?<slot>.+?)(?<tail>)$/iu,
    type: () => 'place', ans: () => 'thing' },
  { id: 'live', re: /^(?<head>how many (?:people|inhabitants|residents|citizens) (?:live|lived|are living|reside) in )(?<slot>.+?)(?<tail>)$/iu,
    type: () => 'place', ans: () => null },
  { id: 'weather', re: /^(?<head>(?:what is the weather(?: like)?|what is the weather forecast|what is the time|what is the temperature) in )(?<slot>.+?)(?<tail>)$/iu,
    type: () => 'place', ans: () => null },
  { id: 'married', re: /^(?<head>who (?:is|was) )(?<slot>.+?)(?<tail> married to)$/iu,
    type: () => 'person', ans: () => 'person' },
  { id: 'state', re: /^(?<head>(?:is|was|are|were) )(?<slot>.+?)(?<tail> (?<adj>alive|still alive|dead|married|real|a country|a city|a planet|a state|an island|a person|famous|big|small|dangerous|old|rich))$/iu,
    type: (g) => (/^(?:alive|still alive|dead|married)$/i.test(g.adj) ? 'person' : null), ans: () => null },
  { id: 'count', re: /^(?<head>how many [\p{L}-]+(?: [\p{L}-]+)? (?:does|did|do) )(?<slot>.+?)(?<tail> have)$/iu,
    type: () => null, ans: () => null },
  { id: 'about', re: /^(?<head>(?:tell me (?:more |something |a bit |all )?about|what do you know about|define|describe|explain|summarize|summarise|information about|facts about) )(?<slot>.+?)(?<tail>)$/iu,
    type: () => null, ans: () => null },
  { id: 'where', re: /^(?<head>where (?:is|are|was|were) )(?<slot>.+?)(?<tail>(?: (?<post>from|located|situated|based|found|now|today))?)$/iu,
    type: (g) => (g.post && /^from$/i.test(g.post) ? null : 'place'), ans: () => null },
  { id: 'when', re: /^(?<head>when (?:is|are|was|were) )(?<slot>.+?)(?<tail>)$/iu,
    type: () => 'thing', ans: () => null },
  { id: 'def', re: /^(?<head>(?<wh>what|who|which) (?:is|was|are|were) )(?<slot>.+?)(?<tail>)$/iu,
    type: (g) => (lc(g.wh) === 'who' ? 'person' : 'thing'), ans: () => null },
];
// A that or this in these frames points at a statement more often than at an entity ("what is that",
// "what does that mean", "tell me about that"): two readings, so it does not carry there.
const STATEMENT_FRAMES = set('def|mean|about');

// ---------------------------------------------------------------- reading one prompt
const POSSESSIVE_BEFORE = set('is|was|of|about|for|in|on|with|at|from|by');
const capLike = (word, to) => (/^\p{Lu}/u.test(word) ? to[0].toUpperCase() + to.slice(1) : to);

// The prompt as this file reads it: cut, quotes and spaces made plain, a trailing question mark or
// full stop dropped (q says whether it was a question), "what's" and "it's" spelled out. Case is kept.
function clean(text) {
  let s = String(text ?? '').slice(0, MAX_CHARS).replace(/[‘’ʼ`]/g, "'").replace(/\s+/g, ' ').trim();
  const q = /\?[\s?!.]*$/.test(s);
  for (let k = 0; k < 3; k++) {
    s = s.replace(/[\s?!]+$/, '');
    const last = s.slice(s.lastIndexOf(' ') + 1), bare = last.replace(/\.+$/, '');
    if (bare !== last && !bare.includes('.')) s = s.slice(0, s.length - (last.length - bare.length));
  }
  s = s.replace(/\s*,\s*/g, ', ').replace(/,$/, '').trim();
  s = s.replace(/\b(what|who|where|when|how|that|there|he|she)'s\b/giu, '$1 is')
    .replace(/\b(they|you|we)'re\b/giu, '$1 are')
    .replace(/\b(whats|whos|wheres|whens|hows)\b/giu, (m) => m.slice(0, -1) + ' is');
  const words = s.split(' ');
  for (let i = 0; i < words.length; i++) {
    if (lc(words[i]) !== "it's") continue;
    words[i] = capLike(words[i], POSSESSIVE_BEFORE.has(lc(words[i - 1])) ? 'its' : 'it is'); // "what is it's population" is a typo for its
  }
  return { t: words.join(' ').trim(), q };
}

const bareWord = (w) => lc(w).replace(/[()]/g, '').replace(/'s$|'$/, '');
const WORD_RE = /^\(?[\p{L}\p{M}][\p{L}\p{M}'.&-]*\)?$/u;

// A subject: one to six words, letters only (a digit makes it arithmetic or a date, never a subject),
// no pronoun and no clause word, not starting or ending on a function word, at least one content word.
function validNP(np) {
  const s = String(np ?? '').trim();
  if (!s || /\d/.test(s)) return false;
  const words = s.split(' ');
  if (words.length > 6) return false;
  let depth = 0, content = 0;
  for (let i = 0; i < words.length; i++) {
    const w = words[i], b = bareWord(w);
    if (!WORD_RE.test(w)) return false;
    depth += (w.match(/\(/g) || []).length - (w.match(/\)/g) || []).length;
    if (depth < 0 || BLOCK.has(b) || (i === 0 && BAD_START.has(b))) return false;
    if (!FUNCTION.has(b)) content++;
  }
  return depth === 0 && !BAD_END.has(bareWord(words[words.length - 1])) && content > 0;
}

// The frame a cleaned prompt reads as, or null: { id, head, tail, subject, type, ans }.
function parse(t) {
  if (!t) return null;
  for (const f of FRAMES) {
    const m = f.re.exec(t);
    if (!m) continue;
    const g = m.groups;
    const subject = g.slot.trim();
    if (subject !== g.slot || !validNP(subject)) continue;
    if (g.rel && lc(g.rel).split(' ').some((w) => BLOCK.has(w))) continue;
    return { id: f.id, head: g.head, tail: g.tail, subject, type: f.type(g), ans: f.ans(g) };
  }
  return null;
}

const isConverse = (raw) => converse(raw) !== null;

// THE NUMERIC ANSWER of a turn, read from its text by rule: the last non-empty line (the exact path
// prints its value there, act/solve.mjs renderSolved), when that line is one number, or ends "is N",
// "= N", "equals N" or ": N". Thousands commas are dropped. Anything else is no number.
const NUM = '(-?(?:\\d{1,3}(?:,\\d{3})+|\\d+)(?:\\.\\d+)?(?:/\\d+)?)';
const NUM_ONLY = new RegExp('^' + NUM + '$');
const NUM_TAIL = new RegExp('(?:^|\\s)(?:=|is|equals|makes|gives|:)\\s*' + NUM + '$', 'i');
function answerNumber(text) {
  if (typeof text !== 'string') return null;
  const lines = text.slice(-MAX_CHARS).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  if (!lines.length) return null;
  const last = lines[lines.length - 1].slice(0, MAX_LINE).replace(/[.!]+$/, '').trim();
  const m = NUM_ONLY.exec(last) || NUM_TAIL.exec(last);
  return m ? m[1].replace(/,/g, '') : null;
}

// An operand as digits: a numeral as typed, or number words up to the millions ("nine", "twenty five").
function operand(s) {
  const t = lc(s).trim();
  if (/^-?\d+(?:\.\d+)?(?:\/\d+)?$/.test(t)) return t;
  const words = t.replace(/-/g, ' ').split(' ').filter((w) => w && w !== 'and');
  if (!words.length || words.length > 4) return null;
  let total = 0, part = 0, seen = false;
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (w === 'a' && i === 0 && words.length > 1 && SCALES[words[1]]) { part = 1; continue; }
    if (ONES[w] !== undefined) part += ONES[w];
    else if (TENS[w] !== undefined) part += TENS[w];
    else if (SCALES[w] !== undefined) { part = (part || 1) * SCALES[w]; if (SCALES[w] >= 1000) { total += part; part = 0; } }
    else return null;
    seen = true;
  }
  return seen ? String(total + part) : null;
}

// THE FOLLOW-UP OPERATION: an operator with its operand and no left operand ("plus 9", "times 2",
// "divide that by 3", "squared", "double it", "the square root of that"), or null.
const REF = '(?:that|it|this|the answer|the result|the total|that number|the number|that answer)';
const OPS = [
  [new RegExp('^(?:plus|\\+|add|added to|increased by) (.+)$'), 'plus'],
  [new RegExp('^(?:minus|-|less|take away|subtract|decreased by|reduced by) (.+)$'), 'minus'],
  [new RegExp('^(?:times|\\*|x|multiplied by) (.+)$'), 'times'],
  [new RegExp('^(?:divided by|over|/) (.+)$'), 'divided by'],
  [new RegExp('^(?:to the power of|to the power|raised to the power of|raised to|\\^) (.+)$'), 'to the power of'],
  [new RegExp('^add (.+?) to ' + REF + '$'), 'plus'],
  [new RegExp('^subtract (.+?) from ' + REF + '$'), 'minus'],
  [new RegExp('^(?:multiply|times) ' + REF + ' by (.+)$'), 'times'],
  [new RegExp('^divide ' + REF + ' by (.+)$'), 'divided by'],
  [new RegExp('^(?:raise|take) ' + REF + ' to the power of (.+)$'), 'to the power of'],
];
const UNARY = [
  [new RegExp('^(?:' + REF + ' )?squared$'), 'squared'], [new RegExp('^(?:' + REF + ' )?cubed$'), 'cubed'],
  [new RegExp('^square ' + REF + '$'), 'squared'], [new RegExp('^cube ' + REF + '$'), 'cubed'],
  [new RegExp('^double ' + REF + '$'), 'times', '2'], [new RegExp('^triple ' + REF + '$'), 'times', '3'],
  [new RegExp('^(?:halve|half of|half) ' + REF + '$'), 'divided by', '2'],
  [new RegExp('^(?:take )?the square root(?: of ' + REF + ')?$'), 'sqrt'], [new RegExp('^(?:the )?(?:square root|sqrt) of ' + REF + '$'), 'sqrt'],
];
function readOp(l) {
  let s = l.replace(/^(?:what is|how much is) /, '');
  for (const [re, op, n] of UNARY) if (re.test(s)) return { op, n: n || null };
  s = s.replace(new RegExp('^' + REF + ' '), '');
  for (const [re, op] of OPS) {
    const m = re.exec(s);
    if (!m) continue;
    const n = operand(m[1]);
    if (n !== null) return { op, n }; // "add 5 to that" first matches "add (.+)": a later form may still read it
  }
  return null;
}

// <RULES>
// ---------------------------------------------------------------- the history state
// st.last   the newest turn that is not a conversational one: { idx, prompt (as resolved), t (cleaned) }
// st.frame  the frame that turn read as, or null when it read as none (a turn this file could not read:
//           no pronoun reaches back across it): { f, idx, text (the organism's answer to it) }
// st.people every subject a frame typed as a person (he and she need exactly one candidate)
// num       the numeric answer of the newest turn of all, read from its text: { n, idx } or null

// Words a follow-up may open with that do not change what it asks ("and germany?", "so how big is it").
const LEAD_RE = /^(?:(?:and|so|ok|okay|then|also|now|but|oh)(?:,)? )+/i;
function lead(t) {
  const m = LEAD_RE.exec(t);
  if (!m) return { rest: t, led: [] };
  return { rest: t.slice(m[0].length), led: lc(m[0]).replace(/,/g, '').trim().split(' ') };
}
// A request made politely is the same request ("can you say that again please").
const bare = (l) => l.replace(/^(?:(?:can|could|would|will) you (?:please )?|please )/, '').replace(/ please$/, '').trim();

const REPEAT_FORMS = set('again|say that again|say it again|say again|repeat|repeat that|repeat it|repeat the question|repeat the last question|ask that again|ask it again|ask again|one more time|once more|do that again|do it again|same question|same again|come again');
const MORE_FORMS = set('more|tell me more|say more|go on|keep going|continue|explain more|explain further|elaborate|more info|more information|more details|more detail');
const WHY_FORMS = new Map([['why', 'why'], ['why so', 'why'], ['why is that', 'why'], ['how come', 'why'], ['why though', 'why'], ['how', 'how'], ['how so', 'how']]);
const YESNO_RE = /^(?:is|are|was|were|do|does|did|can|could|will|would|has|have|had|should|must) /i;
const ABOUT_RE = /^(?:(?:what|how) about|what of|same for|same question for|and for|also for) (.+)$/i;
const CORRECT_RE = /^(?:(?:no|nope|sorry|oops|actually|wait|oh|my bad)[, ]+)*(?:i )?(?:meant|mean)(?: to (?:say|ask|type|write))?(?: about)? (.+)$/i;
const ADJ_RE = /^how (big|tall|old|large|long|far|deep|high|heavy|fast|wide|hot|cold|small|rich|famous|popular)$/;
const PERSONAL = set('he|she|him|his|her');
const NEUTER = set('it|its');
const PLURAL = set('they|them|their');
const DEMONSTRATIVE = set('this|that');
const EXISTENTIAL = set('is|are|was|were|be');
const IN_RELATIONS = set('weather|temperature');

const hasWord = (text, np) => (' ' + lc(text).replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ') + ' ').includes(' ' + lc(np) + ' ');
const poss = (np) => (/s$/i.test(np) ? np + "'" : np + "'s");

// A follow-up subject: a noun phrase, not a time or a number, not only adjectives or interjections,
// not a relation ("the population" asks a new relation, below) and not a class noun ("the city" is
// a correction's word, two readings anywhere else), and not a conversational turn.
function subjectOk(np) {
  if (!validNP(np) || isConverse(np)) return false;
  const ws = lc(np).split(' ').map(bareWord);
  if (ws.some((w) => TIME_NUM.has(w))) return false;
  if (ws.filter((w) => !FUNCTION.has(w)).every((w) => ELLIPSIS_BAD.has(w))) return false;
  const core = lc(np).replace(/^(?:the|a|an) /, '');
  return !RELATIONS.has(core) && !CLASSES.has(core);
}

// A relation asked with its subject left out: "and the population?", "its capital?", "what is the
// president", "how about the currency". bare: typed alone with no article, pronoun or question head.
function elided(rest) {
  const l0 = lc(rest);
  const l1 = l0.replace(/^(?:what|how) about /, '');
  const l2 = l1.replace(/^(?:what|who) (?:is|was|are|were) /, '');
  const m = /^(?:(the|its|their|his|her) )?(.+)$/.exec(l2);
  if (!m || !RELATIONS.has(m[2])) return null;
  const pron = m[1] && m[1] !== 'the' ? m[1] : null;
  if (pron && l2 !== l1) return null; // "what is its population": the pronoun rule keeps the question as typed
  return { rel: m[2], pron, bare: l2 === l0 && !m[1] };
}

// The last frame with a new subject in its slot, read back through the frames: the subject must land
// in the slot, or nothing is carried.
function fill(fr, np) {
  const f = fr.f;
  const tail = f.id === 'possessive' ? (/s$/i.test(np) ? "'" : "'s") + f.tail.replace(/^'s?/, '') : f.tail;
  const out = f.head + np + tail;
  const g = parse(out);
  return g && lc(g.subject) === lc(np) ? { prompt: out, from: fr.idx } : null;
}

// Is the "it" at low[i] the weather's or the clock's, not a thing's? "is it raining", "is it true",
// "was it late" (a copula opens the prompt and one of EXPLETIVE_NEXT follows it), "what time is it",
// "what year was it" (a clock word anywhere), "how hot is it", "how far is it" (the ambient and the
// distance: "how hot is the sun" is the other reading, so it does not carry). "where is it now" is a
// thing's it and carries.
const COPULA = set('is|was|will|would|be|isnt|wasnt');
const AMBIENT = set('hot|cold|warm|cool|dark|light|late|early|sunny|windy|cloudy|rainy|humid|dry|wet|far|bright|quiet|loud|busy|crowded');
function expletive(low, i) {
  if (i === 1 && COPULA.has(low[0]) && EXPLETIVE_NEXT.has(low[2])) return true;
  if (low.some((w) => CLOCK.has(w))) return true;
  return i === 3 && low[0] === 'how' && AMBIENT.has(low[1]) && COPULA.has(low[2]);
}

// May this pronoun mean the last subject, and only it?
function pronounOk(st, p) {
  const f = st.frame.f;
  if (PERSONAL.has(p)) {
    if (f.type !== 'person' && f.type !== null) return false;
    const people = new Set(st.people);
    people.add(lc(f.subject));
    if (people.size > 1) return false; // two different people were asked about
    if (f.ans === 'person') return false; // he could be the person the last answer named
    return true;
  }
  if (PLURAL.has(p)) return f.ans === null;
  if (p === 'there') return (f.type === 'place' || f.type === null) && f.ans === null;
  if (NEUTER.has(p) || DEMONSTRATIVE.has(p)) return f.type !== 'person' && (f.ans === null || f.ans === 'person');
  return false;
}

function ruleRepeat(st, l) {
  if (!REPEAT_FORMS.has(l) || !st.last) return null;
  return { prompt: st.last.prompt, from: st.last.idx };
}

function ruleContinue(st, l) {
  if (MORE_FORMS.has(l)) {
    const fr = st.frame;
    if (!fr || fr.f.ans !== null) return null; // more about the subject or about the entity it answered: two readings
    return { prompt: 'tell me more about ' + fr.f.subject, from: fr.idx };
  }
  const how = WHY_FORMS.get(l);
  if (!how || !st.last) return null;
  const q = st.last.t;
  if (!YESNO_RE.test(q) || q.split(' ').some((w) => PRONOUNS.has(bareWord(w)))) return null;
  return { prompt: how + ' ' + q[0].toLowerCase() + q.slice(1), from: st.last.idx };
}

function ruleArith(l, num) {
  if (!num) return null;
  const op = readOp(l);
  if (!op) return null;
  if (op.op === 'squared' || op.op === 'cubed') return { prompt: 'what is ' + num.n + ' ' + op.op, from: num.idx };
  if (op.op === 'sqrt') return { prompt: 'what is the square root of ' + num.n, from: num.idx };
  return { prompt: 'what is ' + num.n + ' ' + op.op + ' ' + op.n, from: num.idx };
}

function ruleCorrection(st, rest) {
  const m = CORRECT_RE.exec(rest);
  if (!m || !st.frame) return null;
  let np = m[1].trim();
  const cm = /^(?:the|a|an) (.+)$/i.exec(np);
  if (cm && CLASSES.has(lc(cm[1]))) np = st.frame.f.subject.replace(/ \([^)]*\)$/, '') + ' (' + lc(cm[1]) + ')';
  else if (!subjectOk(np)) return null;
  return fill(st.frame, np);
}

function ruleSubject(st, rest, led, q) {
  const fr = st.frame;
  if (!fr) return null;
  const m = ABOUT_RE.exec(rest);
  let np = null;
  if (m) np = m[1];
  else if (q || led.includes('and') || led.includes('also')) {
    np = rest;
    if (hasWord(fr.text, np)) return null; // "paris?" after an answer that says Paris echoes it
  }
  if (np === null || !subjectOk(np)) return null;
  return fill(fr, np);
}

function ruleFrame(st, rest, led, q) {
  const fr = st.frame;
  if (!fr) return null;
  const f = fr.f, subj = f.subject;
  // (a) a relation onto the subject
  const er = elided(rest);
  if (er) {
    if (er.bare && !q && !led.includes('and')) return null;
    if (er.pron) { if (!pronounOk(st, er.pron)) return null; } else if (f.id !== 'relation' && f.id !== 'possessive' && f.ans !== null) return null;
    if (f.type === 'person' && (PLACE_SUBJECTS.has(er.rel) || IN_RELATIONS.has(er.rel))) return null;
    const out = (PERSON_RELATIONS.has(er.rel) ? 'who' : 'what') + ' is the ' + er.rel + (IN_RELATIONS.has(er.rel) ? ' in ' : ' of ') + subj;
    const g = parse(out);
    return g && lc(g.subject) === lc(subj) ? { prompt: out, from: fr.idx } : null;
  }
  // (b) an adjective onto it
  const adj = ADJ_RE.exec(lc(rest));
  if (adj) {
    if (f.ans !== null) return null;
    const out = 'how ' + adj[1] + ' is ' + subj;
    const g = parse(out);
    return g && lc(g.subject) === lc(subj) ? { prompt: out, from: fr.idx } : null;
  }
  // (c) one pronoun, replaced by the subject
  if (rest.includes(',')) return null;
  const words = rest.split(' ');
  const low = words.map((w) => lc(w));
  if (low.some((w) => JOINS.has(w) || ODD_PRONOUNS.has(w))) return null;
  const at = [];
  for (let i = 0; i < low.length; i++) if (PRONOUNS.has(low[i])) at.push(i);
  if (at.length !== 1) return null;
  const i = at[0], p = low[i], prev = low[i - 1], next = low[i + 1];
  if (p === 'it' && expletive(low, i)) return null; // "is it raining", "what time is it", "how hot is it"
  if ((NEUTER.has(p) || DEMONSTRATIVE.has(p)) && low.slice(i + 1).some((w) => CLAUSE.has(w))) return null; // "how long does it take to"
  if (p === 'there' && (EXISTENTIAL.has(prev) || EXISTENTIAL.has(next))) return null; // "is there", "there is"
  if (!pronounOk(st, p)) return null;
  let to;
  if (p === 'its' || p === 'their' || p === 'his') to = poss(subj);
  else if (p === 'her') to = next === undefined || AFTER_OBJECT.has(next) ? subj : poss(subj);
  else if (p === 'there') to = PREPS.has(prev) ? subj : (MOTION.has(prev) ? 'to ' : 'in ') + subj;
  else to = subj;
  const out = [...words.slice(0, i), to, ...words.slice(i + 1)].join(' ');
  const g = parse(out);
  if (!g || lc(g.subject) !== lc(subj)) return null;
  if (DEMONSTRATIVE.has(p) && STATEMENT_FRAMES.has(g.id)) return null; // "what is that": a statement more often than a thing
  return { prompt: out, from: fr.idx };
}

// One prompt against the state of the turns before it: { prompt, from, rule } or null (it stands as typed).
function resolve(st, raw, num) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > MAX_CHARS || isConverse(raw)) return null;
  const { t, q } = clean(raw);
  const { rest, led } = lead(t);
  if (!rest) return null;
  if (!elided(rest) && parse(rest)) return null; // it names its own subject: it stands alone
  const l = bare(lc(rest).replace(/,/g, ''));
  const tries = [
    ['repeat', () => ruleRepeat(st, l)],
    ['continue', () => ruleContinue(st, l)],
    ['arith', () => ruleArith(l, num)],
    ['correction', () => ruleCorrection(st, rest)],
    ['subject', () => ruleSubject(st, rest, led, q)],
    ['frame', () => ruleFrame(st, rest, led, q)],
  ];
  for (const [rule, fn] of tries) {
    const r = fn();
    if (r) return { prompt: r.prompt, from: r.from, rule };
  }
  return null;
}

// The history, oldest first: each turn resolved against the ones before it.
function walk(win, off) {
  const st = { last: null, frame: null, people: new Set() };
  for (let k = 0; k < win.length; k++) {
    const turn = win[k], idx = off + k;
    if (!turn || typeof turn !== 'object' || typeof turn.prompt !== 'string') { st.last = null; st.frame = null; continue; }
    const raw = turn.prompt.slice(0, MAX_CHARS);
    if (!raw.trim() || isConverse(raw)) continue; // a greeting, thanks or farewell is not a subject
    const before = k > 0 ? numberOf(win[k - 1], idx - 1) : null;
    const r = resolve(st, raw, before);
    const prompt = r ? r.prompt : raw;
    const t = lead(clean(prompt).t).rest;
    const f = t && !elided(t) ? parse(t) : null;
    st.last = { idx, prompt, t };
    st.frame = f ? { f, idx, text: typeof turn.text === 'string' ? turn.text : '' } : null;
    if (f && f.type === 'person') st.people.add(lc(f.subject));
  }
  return st;
}
const numberOf = (turn, idx) => {
  const n = turn && typeof turn === 'object' ? answerNumber(turn.text) : null;
  return n === null ? null : { n, idx };
};
// </RULES>

// <API>
/**
 * Carry a follow-up: rewrite a prompt that leans on the turns before it into one that stands alone.
 * @param {{prompt: string, text?: string}[]} turns the conversation so far, oldest first (the newest
 *   MAX_TURNS are read, each prompt cut at 2000 characters)
 * @param {string} prompt the prompt just typed
 * @returns {{prompt: string, carried: boolean, from: number|null, rule: string|null}} prompt is the one
 *   to ask (the input unchanged when nothing carries); from is the index in turns of the turn it leaned
 *   on; rule is one of RULES
 */
export function carry(turns, prompt) {
  const input = typeof prompt === 'string' ? prompt : String(prompt ?? '');
  const list = Array.isArray(turns) ? turns : [];
  const win = list.slice(-MAX_TURNS), off = list.length - win.length;
  const st = walk(win, off);
  const r = resolve(st, input, win.length ? numberOf(win[win.length - 1], off + win.length - 1) : null);
  return r ? { prompt: r.prompt, carried: true, from: r.from, rule: r.rule } : { prompt: input, carried: false, from: null, rule: null };
}

function frameRead(prompt) {
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > MAX_CHARS || isConverse(prompt)) return null;
  const rest = lead(clean(prompt).t).rest;
  return rest && !elided(rest) ? parse(rest) : null;
}

/**
 * The entity a question is about ("who was Ada Lovelace" gives "Ada Lovelace"), as typed, or null.
 * @param {string} prompt
 * @returns {string|null}
 */
export function subjectOf(prompt) {
  const f = frameRead(prompt);
  return f ? f.subject : null;
}

/**
 * The question with its subject replaced by a slot: "what is the capital of france" gives
 * { frame: "what is the capital of {}", subject: "france" }; null when it reads as no frame.
 * @param {string} prompt
 * @returns {{frame: string, subject: string}|null}
 */
export function frameOf(prompt) {
  const f = frameRead(prompt);
  return f ? { frame: f.head + SLOT + f.tail, subject: f.subject } : null;
}
// </API>
