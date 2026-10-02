// writing-direct-g6: a short creative piece (poem, haiku, limerick, story,
// thank you note, slogan, birthday message) on the subject the prompt names.

export const meta = { id: 'writing-direct-g6', class: 'writing', generation: 6, lane: 'direct', grownFrom: [], version: 1 };

const LEAD = /^(?:(?:so|ok|okay|hey|hi)[,\s]+)?(?:what\s+is\s+the\s+|the\s+)?(?:(?:please|kindly)\s+)?(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?)?(?:i\s+(?:need|want|would\s+like)\s+(?:you\s+to\s+)?)?/;
const VERB = /^(?:(?:write|pen|compose|create|make|craft|draft|produce|generate|give|tell|share|invent|dream\s+up|whip\s+up|come\s+up\s+with|think\s+up|put\s+together|jot\s+down|do)\s+)?(?:(?:me|us|for\s+me)\s+)?(?:(?:a|an|one|some|the|my)\s+)?/;
const ADJ = '(?:(?:short|little|tiny|brief|quick|small|funny|silly|cute|sweet|happy|sad|simple|nice|lovely|beautiful|catchy|rhyming|heartfelt|warm|gentle|cheerful|whimsical|original|creative|good|new|bedtime|kind|great|fun|traditional|classic|japanese)\\s+)*';
const FORMS = [
  ['haiku', '(?:haikus?|haiku\\s+poem)'],
  ['limerick', '(?:limericks?|limerick\\s+poem)'],
  ['poem', '(?:poems?|verse|rhyme|poetry|ode)'],
  ['story', '(?:story|stories|tale|fable|narrative)'],
  ['thanks', '(?:thank[\\s-]*you\\s+(?:note|letter|message|card|email)|thanks\\s+(?:note|letter|message|card)|(?:note|letter|message|card)\\s+of\\s+(?:thanks|gratitude)|(?:note|letter|message|card)\\s+(?:thanking|to\\s+thank))'],
  ['slogan', '(?:slogans?|tag\\s*lines?|motto|catch\\s*phrase)'],
  ['birthday', '(?:(?:happy\\s+)?(?:birthday|bday|b-day)\\s+(?:message|note|wish|wishes|greeting|card|text|letter|poem))']
];
const PREP = '(?:about|on|of|for|to|regarding|featuring|celebrating|involving|starring|describing|honou?ring|dedicated\\s+to)';
const BAD = /\b(?:essay|code|program|function|script|python|javascript|sql|algorithm|report|summary|explain|explanation|define|definition|meaning|history)\b/;

function norm(q) {
  return String(q == null ? '' : q).toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim().replace(/[\s.!?;:,]+$/, '').trim();
}

function parse(q) {
  let s = norm(q);
  if (!s || s.length > 200) return null;
  s = s.replace(LEAD, '');
  s = s.replace(VERB, '');
  for (const [kind, rx] of FORMS) {
    const prep = kind === 'thanks' && /thanking|to\s+thank/.test(s) ? '(?:' + PREP + '\\s+)?' : PREP + '\\s+';
    const m = new RegExp('^' + ADJ + rx + '\\s+' + prep + '(.+)$').exec(s);
    if (!m) continue;
    let subj = m[1].replace(/\s*,?\s*(?:please|thanks|thank you)$/, '').trim();
    if (!subj || BAD.test(subj)) return null;
    if (subj.split(' ').length > 12) return null;
    if (!/[a-z]/.test(subj)) return null;
    return { kind, subj };
  }
  return null;
}

function parts(subj) {
  const m = /^(a|an|the|my|our|your)\s+(.+)$/.exec(subj);
  const art = m ? m[1] : '';
  const bare = m ? m[2] : subj;
  const first = subj;
  const again = art === 'a' || art === 'an' ? 'the ' + bare : subj;
  return { art, bare, first, again };
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function pick(arr, key) { let h = 7; for (const c of key) h = (h * 31 + c.charCodeAt(0)) >>> 0; return arr[h % arr.length]; }

function poem(p) {
  return pick([
    `I went to find ${p.first} today,\nand found it waiting on my way,\nas patient as an open door,\nas quiet as a sandy shore.\n\nO ${p.bare}, you keep a gentle light,\nyou warm the morning, hold the night;\nyou ask for nothing, give it all,\nand catch me softly when I fall.`,
    `There is a hush that ${p.again} brings,\na quiet song of little things,\nof morning light and evening gold,\nof stories new and stories old.\n\nSo here I sit and simply stay\nwith ${p.again} at the close of day,\nand count it, as the stars appear,\nthe dearest thing I've wondered here.`
  ], p.bare);
}
function haiku(p) {
  return pick([
    `${cap(p.again)} at dawn,\nquiet as a held breath, still,\nthe whole world listens.`,
    `Soft light on ${p.again},\na small breeze carries the hush,\nthe day leans closer.`
  ], p.bare);
}
function limerick(p) {
  return pick([
    `Said a sage on a hill by the sea,\n"${cap(p.again)} is the wonder for me!"\nhe would sing it all day\nin his whimsical way,\nas happy as happy can be.`,
    `A poet who lived down the lane\nwrote of ${p.again} again and again;\nshe would scribble at night\ntill the morning grew bright,\nthen she'd start the whole poem again.`
  ], p.bare);
}
function story(p) {
  return `Mira had heard tales of ${p.first} ever since she was small. Her grandmother told them by the fire on winter evenings, and every version was a little different, as if the story itself kept growing.\n\nOne autumn morning, Mira packed a loaf of bread, a lantern and her grandmother's old map, and set out to see ${p.again} for herself. The road climbed through pine woods and over a cold, bright river. People she met along the way laughed and said it was only a legend, but Mira kept walking.\n\nAt dusk she reached the place the map had marked, and there, at last, was ${p.again}. It was stranger and gentler than any story had promised. Mira stayed until the stars came out, learning what the tales had left out.\n\nWhen she came home, she sat by the fire and told her grandmother everything. The old woman smiled and said that now the story of ${p.again} belonged to Mira, and it was her turn to make it grow.`;
}
function thanks(p) {
  const to = p.art === 'my' || p.art === 'our' ? `${p.art} ${p.bare}` : p.first;
  return `Dear ${p.art === 'my' || p.art === 'our' ? p.bare : p.first},\n\nThank you so much for everything you have done for me. Your kindness, patience and support have meant more than I can easily say. Having you as ${p.art === 'our' ? 'our' : 'my'} ${p.bare} has made my days brighter and my path easier, and I am truly grateful.\n\nWith heartfelt thanks to ${to},\nme`;
}
function slogan(p) {
  const b = cap(p.bare);
  return pick([
    `${b}: where every visit feels like coming home.`,
    `${b}: made with care, loved by everyone.`,
    `Choose ${p.bare}. You will be glad you did.`
  ], p.bare);
}
function birthday(p) {
  const who = p.bare;
  return `Happy birthday, ${cap(who)}! Thank you for all the love, laughter and care you bring into my life every single day. I hope this birthday is as wonderful as you are, and that the year ahead brings you joy, good health and every happiness you deserve. Love you always!`;
}

const MAKE = { poem, haiku, limerick, story, thanks, slogan, birthday };

export function can(q) { return parse(q) !== null; }

export function answer(q) {
  const r = parse(q);
  if (!r) return null;
  return MAKE[r.kind](parts(r.subj));
}

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
