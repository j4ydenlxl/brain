// act/converse.mjs: THE NATIVE CONVERSATION REGION.
//
// His order, 2026-09-26 20:20 EDT, verbatim: "it cant even respond to 'hi.' what a shame". Until
// tonight `node bin/brain.mjs ask dilation hi` fell through the direct table, the solved region,
// spawn, the exact path, the knowledge tier and the regions, and printed "nothing in memory
// matches this prompt." A greeting is not a lookup miss: it is a kind of turn the organism has
// to carry natively, before any model cell, in the microseconds a regular expression takes.
//
// What this is: a closed grammar of conversational turns (greeting, wellbeing, identity, name,
// ability, thanks, acknowledgement, farewell) recognised on a normalised, short, digit-free
// prompt, each answered by a fixed sentence that says what the organism is and how to use it.
// What this is NOT: a chatbot. A prompt with a digit, an operator, a question about the world,
// or more than a few words is NOT a conversational turn and returns null, so the exact path,
// memory and the model cells keep every real question. The region never shadows an answer.
//
// Provenance: 'native' (act/prompt.mjs answerFromNative writes it), route 'direct', no model, no
// network, no memory read; the nanoseconds of the match are measured with process.hrtime.bigint
// and printed in the answer, as the exact path prints its own.

const NAME = 'Dilation';

/** The kinds this region carries, in the order they are tried. */
export const CONVERSE_KINDS = Object.freeze(['greeting', 'wellbeing', 'identity', 'name', 'ability', 'thanks', 'ack', 'farewell']);

const MAX_WORDS = 8;
const MAX_CHARS = 64;

// Each kind: a list of whole-prompt forms (after normalise) and the sentence that answers it.
const GRAMMAR = [
  {
    kind: 'greeting',
    re: /^(hi|hii+|hello|hey|heya|hiya|yo|sup|howdy|hola|greetings|good (morning|afternoon|evening|day))( there| dilation| brain| you| everyone| all| friend)?$/,
    answer: 'Hello. I am ' + NAME + ', a computational organism: cells, circuits and regions that grow by generations. Ask me a sum, an equation, a word problem or a fact I hold; every answer prints the route that reached it.',
  },
  {
    kind: 'wellbeing',
    re: /^(how are you( doing| today)?|how is it going|hows it going|how do you do|whats up|what is up|how are things|you good|you ok|you okay|are you ok|are you okay|are you there|are you alive|are you awake|you there)$/,
    answer: 'Running. This reply came from my native conversation region in microseconds, with no model and no network. Ask me something and I will print how I reached the answer.',
  },
  {
    kind: 'identity',
    re: /^(who are you|what are you|who is this|what is this|what is dilation|who is dilation|what is the brain|are you an ai|are you ai|are you a bot|are you a robot|are you human|are you chatgpt|are you claude|are you a model|are you an llm|what is a computational organism)$/,
    answer: 'I am ' + NAME + ', a computational organism, not a chat model: cells wired into circuits and regions, grown by generations and measured by benches. Language models are cells I can route to; the exact path, my memory and this region answer without them.',
  },
  {
    kind: 'name',
    re: /^(what is your name|whats your name|your name|do you have a name|what should i call you|who am i talking to|who am i speaking to)$/,
    answer: 'My name is ' + NAME + '. The site is dilation.dev and the command is node bin/brain.mjs ask dilation, followed by your question.',
  },
  {
    kind: 'ability',
    re: /^(help|help me|what can you do|what do you do|what can i ask|what can i ask you|what should i ask|what should i ask you|how do i use you|how do i use this|how does this work|how do you work|what are you for|what is this for|show me|give me an example|examples?)$/,
    answer: 'Ask arithmetic, spoken or symbolic (answered exactly with BigInt, no model), a linear equation, a sequence, a word problem, or a fact from the memory I ingested. Every answer prints its route (direct, exact, memory, native, region or model) and its provenance, so you can see what reached it and in how many nanoseconds.',
  },
  {
    kind: 'thanks',
    re: /^(thanks|thank you|thankyou|thx|ty|tysm|cheers|appreciate it|appreciated|much appreciated|thanks a lot|thank you so much|thanks so much|thank u|thanks dilation|thank you dilation)$/,
    answer: 'You are welcome. Ask the next one whenever you like.',
  },
  {
    kind: 'ack',
    re: /^(ok|okay|k|kk|cool|nice|great|good|fine|alright|sure|got it|i see|makes sense|understood|right|yes|yep|yeah|no|nope|nah|hmm|hm|oh|ah|wow|lol|haha)$/,
    answer: 'Noted. Ask me a question and I will answer it with its route and provenance printed.',
  },
  {
    kind: 'farewell',
    re: /^(bye|goodbye|good bye|bye bye|see you|see ya|see you later|later|good night|goodnight|night|cya|take care|im off|i am off|gotta go|talk later)$/,
    answer: 'Goodbye. I keep growing while you are away: the generations, the census and the benches run at idle.',
  },
];

/**
 * Normalise a prompt for the grammar: lower case, punctuation and emoji stripped, spaces
 * collapsed, a trailing "please" or "!" removed. Returns null when the prompt cannot be a
 * conversational turn (a digit, an operator, too long, empty), so callers skip the grammar.
 * @param {string} text
 * @returns {string|null}
 */
export function normalise(text) {
  const s = String(text ?? '').trim();
  if (!s || s.length > MAX_CHARS) return null;
  if (/[0-9+\-*/=^%<>]/.test(s)) return null; // a digit or an operator is never a greeting
  const t = s.toLowerCase()
    .replace(/[^\p{L}\s']/gu, ' ') // punctuation, emoji, digits already excluded
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(please |pls )/, '')
    .replace(/( please| pls| dilation| brain)$/, '');
  if (!t) return null;
  if (t.split(' ').length > MAX_WORDS) return null;
  return t;
}

/**
 * Recognise a conversational turn.
 * @param {string} text the raw prompt
 * @returns {{kind: string, answer: string, form: string, ns: number}|null} null for anything that is not a turn this region carries
 */
export function converse(text) {
  const t0 = process.hrtime.bigint();
  const t = normalise(text);
  if (t === null) return null;
  for (const g of GRAMMAR) {
    if (g.re.test(t)) return { kind: g.kind, answer: g.answer, form: t, ns: Number(process.hrtime.bigint() - t0) };
  }
  return null;
}

/** Every form the grammar carries, one per kind, for tests and the site's own tab-side reader. */
export function examples() {
  return [
    { kind: 'greeting', prompt: 'hi' }, { kind: 'wellbeing', prompt: 'how are you?' }, { kind: 'identity', prompt: 'Who are you?' },
    { kind: 'name', prompt: "what's your name" }, { kind: 'ability', prompt: 'what can you do' }, { kind: 'thanks', prompt: 'thanks!' },
    { kind: 'ack', prompt: 'ok' }, { kind: 'farewell', prompt: 'bye' },
  ];
}
