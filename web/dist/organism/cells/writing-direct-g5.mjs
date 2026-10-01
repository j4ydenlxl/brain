// Writing cell: short creative pieces (poem, haiku, limerick, story, thank you note, slogan, birthday message).
export const meta = { id: 'writing-direct-g5', class: 'writing', generation: 5, lane: 'direct', grownFrom: ["write a short poem about the moon","write a haiku about rain","write a limerick about a cat","write a short story about a dragon","write a thank you note to my teacher","write a slogan for a coffee shop","write a birthday message for my mom","write a short poem about the sea"], version: 1 };

export const examples = [
  {"q":"write a short poem about the moon","expect":{"contains":["moon"],"minWords":20,"maxWords":200,"notRefusal":true}},
  {"q":"write a haiku about rain","expect":{"contains":["rain"],"minWords":5,"maxWords":30,"notRefusal":true}},
  {"q":"write a limerick about a cat","expect":{"contains":["cat"],"minWords":20,"maxWords":80,"notRefusal":true}},
  {"q":"write a short story about a dragon","expect":{"contains":["dragon"],"minWords":100,"notRefusal":true}},
  {"q":"write a thank you note to my teacher","expect":{"contains":["thank"],"containsAny":["teacher","teach"],"minWords":30,"notRefusal":true}},
  {"q":"write a slogan for a coffee shop","expect":{"contains":["coffee"],"maxWords":25,"notRefusal":true}},
  {"q":"write a birthday message for my mom","expect":{"contains":["birthday","mom"],"minWords":15,"notRefusal":true}},
  {"q":"write a short poem about the sea","expect":{"contains":["sea"],"minWords":20,"maxWords":200,"notRefusal":true}}
];

const KINDS = [
  ['poem', /^(?:short\s+|little\s+|brief\s+|small\s+)?(?:poem|verse|rhyme)$/],
  ['haiku', /^(?:short\s+|little\s+)?haiku$/],
  ['limerick', /^(?:short\s+|funny\s+|silly\s+)?limerick$/],
  ['story', /^(?:short\s+|little\s+|brief\s+|tiny\s+)?(?:story|tale|fable)$/],
  ['thanks', /^(?:short\s+|little\s+|brief\s+|quick\s+)?thank[\s-]?you\s+(?:note|card|message|letter)$/],
  ['slogan', /^(?:short\s+|catchy\s+|good\s+)?(?:slogan|tagline|motto)$/],
  ['birthday', /^(?:short\s+|happy\s+|sweet\s+)?birthday\s+(?:message|note|card|wish|wishes|greeting)$/]
];

const RX = /^\s*(?:please\s+|can you\s+|could you\s+)?(?:write|compose|create|make|give)\s+(?:me\s+|us\s+)?(?:a|an|one)\s+(.+?)\s+(about|on|of|for|to)\s+(.+?)\s*[.!?]*\s*$/i;
const BAD = /\b(essay|code|program|function|script|report|summary|explain|why|how)\b|\?/i;

function parse(q) {
  if (typeof q !== 'string' || q.length > 300) return null;
  const s = q.trim().toLowerCase().replace(/\s+/g, ' ');
  if (BAD.test(s)) return null;
  const m = s.match(RX);
  if (!m) return null;
  let kind = null;
  for (const [k, r] of KINDS) if (r.test(m[1])) { kind = k; break; }
  if (!kind) return null;
  const prep = m[2];
  if ((kind === 'thanks' || kind === 'birthday') && !(prep === 'to' || prep === 'for')) return null;
  if (kind === 'slogan' && !(prep === 'for' || prep === 'about' || prep === 'of')) return null;
  if (['poem', 'haiku', 'limerick', 'story'].includes(kind) && !(prep === 'about' || prep === 'on' || prep === 'of')) return null;
  let subj = m[3].replace(/["'`]+/g, '').trim();
  let mine = false;
  const art = subj.match(/^(a|an|the|my|our|some)\s+/);
  if (art) { if (art[1] === 'my' || art[1] === 'our') mine = true; subj = subj.slice(art[0].length); }
  subj = subj.trim();
  if (!subj || !/[a-z]/.test(subj) || subj.split(' ').length > 8) return null;
  return { kind, subj, mine, article: art ? art[1] : '' };
}

export function can(q) { return parse(q) !== null; }

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const aan = (t) => (/^[aeiou]/.test(t) ? 'an ' : 'a ') + t;
const plural = (t) => /s$/.test(t) && !/ss$/.test(t);

function poem(x) {
  const the = 'the ' + x;
  return [
    `I went to find ${the} today,`,
    `and found it waiting on my way,`,
    `as patient as an open door,`,
    `as quiet as a sandy shore.`,
    ``,
    `O ${x}, you keep a gentle light,`,
    `you warm the morning, hold the night;`,
    `you ask for nothing, give it all,`,
    `and answer when the weary call.`,
    ``,
    `So here I write of ${the} I know,`,
    `in simple words and lines that flow,`,
    `and when the busy hours are through,`,
    `my thoughts, dear ${x}, return to you.`
  ].join('\n');
}

function haiku(x) {
  return `${cap(x)} softly here,\nquiet as the morning light,\nthe world holds its breath.`;
}

function limerick(x) {
  const who = aan(x);
  return [
    `There once was ${who} so bold`,
    `who wandered out into the cold.`,
    `It danced in the snow,`,
    `put on quite a show,`,
    `and the tale of that ${x} still gets told.`
  ].join('\n');
}

function story(x) {
  const X = cap(x);
  return [
    `Once upon a time, in a village at the edge of a deep green forest, people told stories about ${aan(x)} that no one had ever truly seen. Some said the ${x} brought luck, others said it brought trouble, and the children whispered about it every night before bed.`,
    ``,
    `One autumn morning, a curious girl named Lila packed bread, a lantern and a warm scarf, and set out to find the ${x} for herself. She crossed a cold river, climbed a rocky hill and followed a narrow path until the trees grew tall and silent.`,
    `There, in a clearing full of golden light, she found it at last. The ${x} was nothing like the stories. It was gentle, a little lonely, and glad to have a visitor.`,
    ``,
    `Lila stayed until sunset, sharing her bread and her questions. When she went home, she told everyone the truth. From that day on, the village stopped fearing the ${x}, and visitors came often to the clearing. ${X} and village became friends, and the old stories were replaced by a better one.`
  ].join('\n');
}

function thanks(x, mine) {
  const who = mine ? 'my ' + x : x;
  return [
    `Dear ${cap(x)},`,
    ``,
    `Thank you so much for everything you have done for me. Your kindness, patience and support have meant more than I can easily say. Having you as ${mine ? 'my ' + x : who} has made my days brighter and my path easier, and I am truly grateful.`,
    ``,
    `Thank you again, from the bottom of my heart.`,
    ``,
    `With warm thanks and appreciation`
  ].join('\n');
}

function slogan(x) {
  return `${cap(x)}: where every visit feels like coming home.`;
}

function birthday(x, mine) {
  const who = mine ? x : x;
  return `Happy birthday, ${cap(who)}! Thank you for all the love, laughter and care you bring into my life. I hope your day is as wonderful as you are, and that the year ahead is full of joy. Happy birthday, ${who}!`;
}

export function answer(q) {
  const p = parse(q);
  if (!p) return null;
  const x = p.subj;
  switch (p.kind) {
    case 'poem': return poem(x);
    case 'haiku': return haiku(x);
    case 'limerick': return limerick(x);
    case 'story': return story(x);
    case 'thanks': return thanks(x, p.mine);
    case 'slogan': return slogan(x);
    case 'birthday': return birthday(x, p.mine);
  }
  return null;
}
