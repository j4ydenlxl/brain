// fragment-direct-g1: a cell for the failure class "fragment" (grow/CONTRACT.md), lane direct, generation 1.
// A fragment is one to three letters and nothing else; the site got "h" and refused. This cell answers
// such a prompt by echoing it in double quotes, saying how many letters came through, and inviting a
// whole word or a question. It never answers a short reply the conversation region already carries.
// Pure and synchronous, no import: everything it needs is data below.
// Author: board 38 arm direct:fragment (claude-opus-5-5), 2026-09-30.

export const meta = { id: 'fragment-direct-g1', class: 'fragment', generation: 1, lane: 'direct', grownFrom: ['h'], version: 1 };

// ------------------------------------------------------------------ data
// Short replies the conversation region answers already. Group one: the task's own list. Group two: every
// one to three letter string act/converse.mjs converse() answered when all 18,278 lowercase strings of
// one to three letters were put to it (98 of them). A prompt in either group is never this cell's.
const TASK_SHORT = ['hi', 'yo', 'ok', 'no', 'ya', 'hey', 'bye', 'sup', 'hmm', 'um', 'lol', 'brb', 'idk', 'thx', 'ty', 'yes', 'wow', 'k', 'thanks', 'hello'];
const REGION_SHORT = (
  'aah aaw ah ahh aw aww bet brb bye ccu cu cuu cya ggj ggm ggn gj gjj gm gmm gn gnn hai hay hbu hei hej hey hhi hhm ' +
  'hi hii hlo hlw hm hmm hru huh hye idk ily k kk kkk lol meh nah naw nno nnp no noo np npp nvm oh ohh oi ok oki okk ' +
  'ola omg ooh ook rap rly sup thx tq tqq ttq ttx tty tx txx ty tyy ugh wbu wow wtf wyd xd ya yah yas yay ye yea yee ' +
  'yep yes yo yoo yup yye yyo'
).split(' ');
const SHORT = new Set([...TASK_SHORT, ...REGION_SHORT]);

// Common English words of two and three letters: they change the wording only, never whether the cell answers.
const WORDS = new Set((
  'am an as at be by do go he if in is it me my of on or so to up us we ' +
  'act add age ago aid air all and ant any ape arm art ask ate bad bag ban bat bed bee big bit box boy bus but buy ' +
  'can cap car cat cow cry cup cut dad day did die dig dog dot dry due ear eat egg end eye fan far fat few fit fix fly ' +
  'for fox fun gas get god got gun guy had ham has hat her hid him hip his hit hot ice ink its jam jar jet job joy key ' +
  'kid kit lab lap law lay leg let lid lie lip log lot low mad man map mat may men mix mom mud mug net new nor not now ' +
  'nut oak odd off oil old one our out owl own pan pay pen pet pie pig pin pit pop pot put ran rat raw red rib rid ' +
  'rip rob rod row rub rug run sad sat saw say sea see set sew she shy sip sir sit six sky son spy sum sun tag tan tap ' +
  'tax tea ten the tie tin tip toe ton too top toy try tub two use van vet war was way web wet who why win wit won yet ' +
  'you zip zoo'
).split(' '));
const QUESTION_WORDS = new Set(['who', 'how', 'why']);
const ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
const COUNT = ['', 'one letter', 'two letters', 'three letters'];

// ------------------------------------------------------------------ the class
const FRAGMENT_RE = /^[A-Za-z]{1,3}$/;

/** True only for one to three letters (A to Z, either case) that are not a short reply the organism carries. */
export function can(q) {
  if (typeof q !== 'string') return false;
  const t = q.trim();
  if (!FRAGMENT_RE.test(t)) return false;
  return !SHORT.has(t.toLowerCase());
}

// A stable pick among phrasings, so the same prompt always reads the same and different prompts do not.
function pick(list, key) {
  let h = 7;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 1000003;
  return list[h % list.length];
}

const oneRow = (w) => ROWS.some((r) => [...w].every((c) => r.includes(c)));
const allSame = (w) => [...w].every((c) => c === w[0]);

/** The reply for a person, or null when the prompt is not a fragment after all. */
export function answer(q) {
  if (!can(q)) return null;
  const t = q.trim();
  const w = t.toLowerCase();
  const n = w.length;
  const echo = '"' + t + '"';
  const count = COUNT[n];

  if (w === 'a') {
    return 'You typed ' + echo + ', one letter that is also a whole word on its own. What comes after it? Send the whole sentence or ask me a question.';
  }
  if (w === 'i') {
    return 'You typed ' + echo + ', one letter, and it sounds like the start of a sentence. Go on: finish the thought or ask me a question.';
  }
  if (n === 1) {
    return pick([
      'You typed ' + echo + ', just one letter. Did the rest of the message get lost on the way? Type a whole word or ask me a question and I will answer it.',
      'I only got ' + echo + ', a single letter on its own. Send the whole word or the full question and I will take it from there.',
      'Just ' + echo + ' came through, one letter and nothing after it. What did you mean to ask? A whole word or a question works best.',
    ], w);
  }
  if (allSame(w)) {
    return 'You typed ' + echo + ', the same letter ' + (n === 2 ? 'twice' : 'three times') + ', which reads like a key held down or a slip. Type a whole word or a question and I will answer it.';
  }
  if (QUESTION_WORDS.has(w)) {
    return 'You typed ' + echo + ', a question word with nothing after it. Finish the question, with the thing you want to know about, and I will answer what I can.';
  }
  if (WORDS.has(w)) {
    return 'You typed ' + echo + ', ' + (n === 2 ? 'a two letter word' : 'one short word') + ' on its own. What would you like to know about it? Put it in a whole question and I will try.';
  }
  if (oneRow(w)) {
    return pick([
      'You typed ' + echo + ', ' + count + ' from one row of the keyboard, which looks like a slip of the fingers. Type a whole word or a question and I will answer it.',
      'I got ' + echo + ', ' + count + ' from the same keyboard row and nothing else. Was there more you meant to send? A whole word or a full question gives me something to answer.',
    ], w);
  }
  return pick([
    'I got ' + echo + ', ' + count + ' and nothing else. Was there more you meant to send? A whole word or a full question gives me something to answer.',
    'Only ' + count + ' came through: ' + echo + '. Type the whole word you had in mind, or ask me a question, and I will answer it.',
    'I only have ' + echo + ' to go on, ' + count + ' and nothing more. Type the whole word or ask a full question and I will answer it.',
  ], w);
}

// ------------------------------------------------------------------ the rows it was grown from (judge/dev/fragment.jsonl, verbatim)
export const examples = [
  { q: 'h', expect: { notRefusal: true, minWords: 6, contains: ['"h"'] } },
  { q: 'j', expect: { notRefusal: true, minWords: 6, contains: ['"j"'] } },
  { q: 'q', expect: { notRefusal: true, minWords: 6, contains: ['"q"'] } },
  { q: 'hh', expect: { notRefusal: true, minWords: 6, contains: ['"hh"'] } },
  { q: 'xz', expect: { notRefusal: true, minWords: 6, contains: ['"xz"'] } },
  { q: 'zx', expect: { notRefusal: true, minWords: 6, contains: ['"zx"'] } },
  { q: 'g', expect: { notRefusal: true, minWords: 6, contains: ['"g"'] } },
  { q: 'fj', expect: { notRefusal: true, minWords: 6, contains: ['"fj"'] } },
];
