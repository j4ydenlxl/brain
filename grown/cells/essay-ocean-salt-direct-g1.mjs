// cell essay-ocean-salt-direct-g1: generation 1, lane direct, class essay-ocean-salt (grow/CONTRACT.md).
// It answers a request for an essay, a paragraph or an explanation of why the ocean or the sea is salty.
// Pure and synchronous: every word it can say is data in this file. Author: board 38 arm, 2026-09-30.
export const meta = {
  id: 'essay-ocean-salt-direct-g1',
  class: 'essay-ocean-salt',
  generation: 1,
  lane: 'direct',
  grownFrom: ['Write a short essay on why the ocean is salty.'],
  version: 1,
};

// the three things a prompt of this class names: a water body, its salt, and a request to write or explain
const WATER_RE = /\b(?:oceans?|seas?|seawater|sea-water)\b/;
const SALT_RE = /\b(?:salt|salts|salty|saltier|saltiness|saltwater|saline|salinity)\b/;
const ASK_RE = /\b(?:write|writing|essay|essays|paragraph|paragraphs|explain|explaining|explanation|describe|describing|description|why|how|write-up|writeup)\b/;
// a bare definition ("define ocean") is the organism's own; it stays false unless it also asks for prose
const DEFINE_RE = /^\s*(?:define|definition of|meaning of)\b/;
const PROSE_RE = /\b(?:write|essay|paragraph|explain|explaining|describe)\b/;
// prompts that name sea and salt but ask something else: this essay would be a guess there, so false
const ELSEWHERE_RE = /\b(?:fish|fishes|drink|drinking|drinkable|desalinat\w*|recipe|cook|cooking|taffy|aquarium|bath|trade|dead sea|salt lake)\b/;
const MAX_Q = 300;

function norm(q) {
  return typeof q === 'string' ? q.trim().toLowerCase().replace(/\u2019/g, "'") : '';
}

export function can(q) {
  const t = norm(q);
  if (!t || t.length > MAX_Q) return false;
  if (!WATER_RE.test(t) || !SALT_RE.test(t) || !ASK_RE.test(t)) return false;
  if (DEFINE_RE.test(t) && !PROSE_RE.test(t)) return false;
  if (ELSEWHERE_RE.test(t)) return false;
  return true;
}

// the noun the prompt used, so the title and the opening speak its words
function nounOf(t) {
  if (/\bsea-?water\b|\bsea water\b/.test(t)) return { n: 'seawater', title: 'Why Seawater Is Salty', is: 'is', it: 'it' };
  if (/\boceans\b/.test(t)) return { n: 'the oceans', title: 'Why the Oceans Are Salty', is: 'are', it: 'them' };
  if (/\bocean\b/.test(t)) return { n: 'the ocean', title: 'Why the Ocean Is Salty', is: 'is', it: 'it' };
  if (/\bseas\b/.test(t)) return { n: 'the seas', title: 'Why the Seas Are Salty', is: 'are', it: 'them' };
  return { n: 'the sea', title: 'Why the Sea Is Salty', is: 'is', it: 'it' };
}

// the shape of the request, read from its wording
function kindOf(t) {
  if (/\bparagraphs?\b/.test(t)) return 'paragraph';
  if (/\bshort\b|\bbrief\b|\bquick\b/.test(t)) return 'short';
  if (/\bexplain\w*|\bexplanation\b/.test(t)) return 'explain';
  if (/\bdescrib\w*|\bdescription\b/.test(t)) return 'describe';
  if (/\b(?:can|could|would) you\b|\bplease\b|\bme\b/.test(t)) return 'request';
  if (/\?|^\s*why\b|\bwhy (?:is|are|does|do)\b|^\s*how\b/.test(t)) return 'question';
  return 'plain';
}

const OPENINGS = {
  paragraph: [
    'In a single paragraph, the reason {n} {is} salty comes down to a slow trade between the land, the sky and the seafloor.',
    'Put into one paragraph, the saltiness of {n} is the result of a quiet exchange among rock, river, vent and sun.',
  ],
  short: [
    'The short version is simple: {n} {is} salty because the land keeps dissolving into {it} while the sun keeps lifting the water back out.',
    'Briefly put, {n} {is} salty because salt flows in from the land and very little of it ever leaves.',
  ],
  explain: [
    'To explain why {n} {is} salty, it helps to follow a single drop of rain from the sky to the shore and back again.',
    'The clearest way to explain the salt in {n} is to follow the water, because the water travels while the salt stays.',
  ],
  describe: [
    'Describing why {n} {is} salty means describing a cycle that has quietly run for billions of years.',
    'The saltiness of {n} is easiest to describe as a cycle that has never stopped.',
  ],
  request: [
    'Here is an essay on why {n} {is} salty, a question whose answer is written in rock, river and steam.',
    'Here it is. The saltiness of {n} is a story that begins on land, far from any shore.',
  ],
  question: [
    'Why {is} {n} salty when the rain that feeds {it} is fresh? The answer begins on land, not in the water.',
    'The salt in {n} comes from a place that surprises most people: the land, slowly dissolving into {it}.',
  ],
  plain: [
    'Anyone who has swallowed a mouthful of seawater knows the taste of salt, yet the rivers that pour into {n} taste fresh. The reason lies in a slow exchange between land, sea and sky.',
    'The salt in {n} was not always there. It was gathered, grain by grain, from the land over billions of years.',
  ],
};

const BODY = [
  'Rain is not perfectly pure. As it falls, it absorbs a little carbon dioxide from the air and becomes a very weak acid. Over many years that water wears down rocks on land, a slow weathering that frees minerals such as sodium, calcium, magnesium and potassium. Rivers gather these dissolved minerals and carry them to the sea. River water still tastes fresh because the amounts are tiny, but the delivery never stops.',
  'The seafloor adds its own share. At hydrothermal vents along the mid-ocean ridges, seawater seeps into hot volcanic rock, trades chemicals with it and rises again loaded with dissolved minerals. Undersea eruptions and volcanic gases have supplied much of the chloride.',
  'Evaporation makes the difference. The sun lifts water from the surface as vapor, but the salt cannot rise with it and stays behind. The vapor forms clouds and falls as fresh rain, which is why rain is fresh while the sea it came from is salty. Each turn of this cycle leaves the salt in the ocean and sends the water back to collect more.',
  'Today the salinity of the open ocean averages roughly 3.5 percent, about 35 grams of salt in every kilogram of seawater. Sodium and chloride, the two halves of ordinary table salt, make up about 85 percent of it. The sea does not grow saltier without end, because salt also leaves it, locked into seafloor sediments and new minerals, so what arrives and what is buried stay close to balanced.',
];

const CLOSING = 'The salt of the sea, in the end, is the land itself, dissolved and delivered one river at a time.';

function hash(t) {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return h;
}

function fill(s, w) {
  return s.replace(/\{n\}/g, w.n).replace(/\{is\}/g, w.is).replace(/\{it\}/g, w.it);
}

export function answer(q) {
  if (!can(q)) return null;
  const t = norm(q);
  const w = nounOf(t);
  const kind = kindOf(t);
  const list = OPENINGS[kind];
  const opening = fill(list[hash(t) % list.length], w);
  if (kind === 'paragraph') return w.title + '\n\n' + [opening, ...BODY, CLOSING].join(' ');
  return w.title + '\n\n' + [opening + ' ' + BODY[0], ...BODY.slice(1), CLOSING].join('\n\n');
}

export const examples = [
  {"q":"Write a short essay on why the ocean is salty.","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
  {"q":"write an essay about why the sea is salty","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
  {"q":"Essay: why is the ocean salty?","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
  {"q":"Explain in an essay why seawater is salty","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
  {"q":"Can you write me an essay on why oceans are salty?","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
  {"q":"why is the ocean salty? write an essay","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
  {"q":"write an essay explaining the ocean's salt","expect":{"minWords":150,"notRefusal":true,"contains":["salt"],"containsAny":["river","rivers","rock","rocks","mineral","minerals","evaporat"]}},
];
