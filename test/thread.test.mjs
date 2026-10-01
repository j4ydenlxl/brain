// test/thread.test.mjs: THE NATIVE MULTI-TURN CARRY (act/thread.mjs). Pure and offline: no file is written,
// no network, no model. Every rule has a test that fails when the rule is dropped, and every case the
// carry must NOT make has its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { carry, subjectOf, frameOf, RULES, MAX_TURNS } from '../act/thread.mjs';
import { readExact } from '../act/exact-read.mjs';
import { renderSolved } from '../act/solve.mjs';

// turns from prompts: a string is a turn with no answer text; an object is a turn as given
const T = (...ps) => ps.map((p) => (typeof p === 'string' ? { prompt: p, text: '' } : p));
const out = (turns, p) => carry(turns, p).prompt;
const same = (turns, p) => assert.deepEqual(carry(turns, p), { prompt: p, carried: false, from: null, rule: null }, JSON.stringify(p) + ' must not carry');

// ---------------------------------------------------------------- the exports

test('RULES is the frozen list of the six rule names, MAX_TURNS is 20', () => {
  assert.deepEqual([...RULES], ['repeat', 'continue', 'arith', 'correction', 'subject', 'frame']);
  assert.equal(Object.isFrozen(RULES), true);
  assert.equal(MAX_TURNS, 20);
});

test('nothing to carry: the input comes back unchanged, byte for byte, with carried false', () => {
  for (const p of ['What is the capital of France?', '  odd   spacing  ', '', 'hi']) {
    assert.deepEqual(carry([], p), { prompt: p, carried: false, from: null, rule: null });
    assert.deepEqual(carry(T('who was ada lovelace'), p), { prompt: p, carried: false, from: null, rule: null });
  }
});

// ---------------------------------------------------------------- subject: a new subject into the last frame

test('subject: "and germany?", "what about spain", "how about japan?", "germany?" after the capital of france', () => {
  const h = T('what is the capital of france');
  assert.deepEqual(carry(h, 'and germany?'), { prompt: 'what is the capital of germany', carried: true, from: 0, rule: 'subject' });
  assert.equal(out(h, 'what about spain'), 'what is the capital of spain');
  assert.equal(out(h, 'how about japan?'), 'what is the capital of japan');
  assert.equal(out(h, 'germany?'), 'what is the capital of germany');
  assert.equal(out(h, 'And Germany?'), 'what is the capital of Germany');
});

test('subject: each follow-up reads the frame of the question two turns back, and from names the turn it leaned on', () => {
  const h = T('what is the capital of france', 'and germany?');
  assert.deepEqual(carry(h, 'what about spain'), { prompt: 'what is the capital of spain', carried: true, from: 1, rule: 'subject' });
  const h2 = T('what is the capital of france', 'and germany?', 'what about spain');
  assert.equal(out(h2, 'how about japan?'), 'what is the capital of japan');
});

test('subject: the case of the question and of the new subject is kept; the question mark is dropped', () => {
  assert.equal(out(T('What is the capital of France?'), 'and Germany?'), 'What is the capital of Germany');
});

test('subject: every frame takes a new subject (how big, who wrote, when was born, what does mean, tell me about, possessive)', () => {
  assert.equal(out(T('how big is france'), 'what about spain'), 'how big is spain');
  assert.equal(out(T('who wrote hamlet'), 'and macbeth?'), 'who wrote macbeth');
  assert.equal(out(T('when was ada lovelace born'), 'and charles babbage?'), 'when was charles babbage born');
  assert.equal(out(T('what does serendipity mean'), 'and ephemeral?'), 'what does ephemeral mean');
  assert.equal(out(T('tell me about france'), 'what about spain'), 'tell me about spain');
  assert.equal(out(T("what is france's population"), 'and the united states?'), "what is the united states' population");
  assert.equal(out(T("what is france's population"), 'and japan?'), "what is japan's population");
});

test('subject: a bare follow-up carries only with a question mark or a leading "and"; typed alone it stands', () => {
  const h = T('what is the capital of france');
  same(h, 'germany');
  assert.equal(out(h, 'and germany'), 'what is the capital of germany');
  assert.equal(out(h, 'germany?'), 'what is the capital of germany');
});

test('subject: a time, a number, an adjective or an interjection is not a subject; a name holding an adjective is', () => {
  const h = T('what is the capital of france');
  for (const p of ['tomorrow?', 'two?', 'bigger?', 'what about next monday', 'what about tomorrow morning', 'seriously?', 'and why?', 'explain?'])
    same(h, p);
  assert.equal(out(h, 'what about new york'), 'what is the capital of new york');
  assert.equal(out(T('how tall is the eiffel tower'), 'and big ben?'), 'how tall is big ben');
});

test('subject: "paris?" after an answer that says Paris is an echo of that answer, not a new subject', () => {
  const h = T({ prompt: 'what is the capital of france', text: 'Paris is the capital of France.' });
  same(h, 'paris?');
  same(h, 'and paris?');
  assert.equal(out(h, 'germany?'), 'what is the capital of germany');
  assert.equal(out(h, 'what about paris'), 'what is the capital of paris', 'a named new subject is not an echo');
});

test('subject: a follow-up holding a pronoun, a person word or a class noun is not a new subject', () => {
  const h = T('what is the capital of france');
  for (const p of ['what about her husband', 'and you?', 'what about me', 'what about it', 'and the city?', 'what about that one'])
    same(h, p);
});

// ---------------------------------------------------------------- frame: a new frame onto the last subject

test('frame: she, he, it and its after "who was ada lovelace" and "tell me about japan"', () => {
  const ada = T('who was ada lovelace');
  assert.deepEqual(carry(ada, 'when was she born'), { prompt: 'when was ada lovelace born', carried: true, from: 0, rule: 'frame' });
  assert.equal(out(ada, 'where did he die'), 'where did ada lovelace die');
  assert.equal(out(ada, 'is she still alive?'), 'is ada lovelace still alive');
  assert.equal(out(ada, 'what did she invent'), 'what did ada lovelace invent');
  const jp = T('tell me about japan');
  assert.equal(out(jp, 'what is its population'), "what is japan's population");
  assert.equal(out(jp, 'how big is it'), 'how big is japan');
  assert.equal(out(jp, 'why is it famous'), 'why is japan famous');
  assert.equal(out(jp, 'where is it located?'), 'where is japan located');
  assert.equal(out(jp, 'what is it known for'), 'what is japan known for');
});

test('frame: the possessive is kept right (its, their, his; her before a noun; a subject ending in s)', () => {
  assert.equal(out(T('who was ada lovelace'), 'what was her name'), "what was ada lovelace's name");
  assert.equal(out(T('who was ada lovelace'), 'what is his wife'), "what is ada lovelace's wife");
  assert.equal(out(T('tell me about the united states'), 'what is their population'), "what is the united states' population");
  assert.equal(out(T('tell me about the united states'), 'what is its capital?'), "what is the united states' capital");
});

test('frame: her as an object is the subject itself, them and they too', () => {
  assert.equal(out(T('who was ada lovelace'), 'tell me about her'), 'tell me about ada lovelace');
  assert.equal(out(T('who were the vikings'), 'tell me about them'), 'tell me about the vikings');
  assert.equal(out(T('who were the vikings'), 'what did they eat'), 'what did the vikings eat');
});

test('frame: there is a place (in it), and an existential there does not carry', () => {
  const jp = T('tell me about japan');
  assert.equal(out(jp, 'how many people live there'), 'how many people live in japan');
  assert.equal(out(jp, 'what is the weather like there?'), 'what is the weather like in japan');
  assert.equal(out(jp, 'what language is spoken there'), 'what language is spoken in japan');
  same(jp, 'is there a king');
  same(jp, 'what is there');
  same(T('who was ada lovelace'), 'how many people live there');
});

test('frame: a relation onto the subject ("and the population?", "its capital?", "what is the population")', () => {
  const fr = T('what is the capital of france');
  assert.deepEqual(carry(fr, 'and the population?'), { prompt: 'what is the population of france', carried: true, from: 0, rule: 'frame' });
  assert.equal(out(fr, 'what about the currency'), 'what is the currency of france');
  assert.equal(out(fr, 'and the president?'), 'who is the president of france');
  assert.equal(out(fr, 'what is the population'), 'what is the population of france');
  assert.equal(out(T('tell me about japan'), 'its capital?'), 'what is the capital of japan');
  assert.equal(out(T('tell me about japan'), 'and the weather?'), 'what is the weather in japan');
  same(fr, 'population');
  same(T('who was ada lovelace'), 'and the population?');
});

test('frame: an adjective onto the subject ("how big?"), and not after a question whose answer is a place', () => {
  assert.equal(out(T('tell me about japan'), 'how big?'), 'how big is japan');
  assert.equal(out(T('who was ada lovelace'), 'how old?'), 'how old is ada lovelace');
  same(T('what is the capital of france'), 'how big?');
});

test('frame: a leading "and", "so" or "ok" does not stop a carry', () => {
  const ada = T('who was ada lovelace');
  assert.equal(out(ada, 'and when was she born?'), 'when was ada lovelace born');
  assert.equal(out(ada, 'so where did she die'), 'where did ada lovelace die');
  assert.equal(out(ada, 'ok, how old was she'), 'how old was ada lovelace');
});

// ---------------------------------------------------------------- repeat

test('repeat: "again", "say that again", "repeat that", "can you repeat that please" give the last prompt', () => {
  const h = T('what is the capital of france');
  for (const p of ['again', 'say that again', 'repeat that', 'Repeat that!', 'can you repeat that please', 'one more time'])
    assert.deepEqual(carry(h, p), { prompt: 'what is the capital of france', carried: true, from: 0, rule: 'repeat' }, p);
});

test('repeat: a carried turn repeats as the prompt it stood for; a greeting between is skipped; no history is no carry', () => {
  assert.deepEqual(carry(T('what is the capital of france', 'and germany?'), 'again'), { prompt: 'what is the capital of germany', carried: true, from: 1, rule: 'repeat' });
  assert.deepEqual(carry(T('what is the capital of france', 'thanks!'), 'say that again'), { prompt: 'what is the capital of france', carried: true, from: 0, rule: 'repeat' });
  same([], 'again');
  same(T('hi', 'thanks'), 'repeat that');
});

// ---------------------------------------------------------------- continue

test('continue: "more", "tell me more", "go on", "explain more" give "tell me more about <subject>"', () => {
  const jp = T('tell me about japan');
  for (const p of ['more', 'tell me more', 'Tell me more!', 'go on', 'explain more', 'keep going', 'please elaborate'])
    assert.deepEqual(carry(jp, p), { prompt: 'tell me more about japan', carried: true, from: 0, rule: 'continue' }, p);
  assert.equal(out(T('who was ada lovelace'), 'tell me more'), 'tell me more about ada lovelace');
});

test('continue: "why?" and "how?" after a yes or no question give "why <question>" and "how <question>"', () => {
  const h = T('Is Pluto a planet?');
  assert.deepEqual(carry(h, 'why?'), { prompt: 'why is Pluto a planet', carried: true, from: 0, rule: 'continue' });
  assert.equal(out(h, 'how?'), 'how is Pluto a planet');
  assert.equal(out(h, 'why is that?'), 'why is Pluto a planet');
  assert.equal(out(h, 'and why?'), 'why is Pluto a planet');
  assert.equal(out(T('does the moon have water'), 'how come?'), 'why does the moon have water');
});

test('continue: "why?" after a question that is not yes or no, and "more" after an answer that is itself an entity, do not carry', () => {
  same(T('what is the capital of france'), 'why?');
  same(T('who was ada lovelace'), 'how?');
  same(T('is it raining'), 'why?');
  same(T('what is the capital of france'), 'tell me more');
  same(T('who wrote hamlet'), 'more');
  same([], 'tell me more');
});

// ---------------------------------------------------------------- arith: a chain on the last numeric answer

const ARITH = T({ prompt: 'what is 17 times 23', text: 'answered exactly by exact.arith, with no model and no network.\n- expression 17 * 23\n391' });

test('arith: "plus 9" after 17 times 23 is "what is 391 plus 9", the number read from the last line of the last turn', () => {
  assert.deepEqual(carry(ARITH, 'plus 9'), { prompt: 'what is 391 plus 9', carried: true, from: 0, rule: 'arith' });
});

test('arith: every follow-up operation, in words and in symbols', () => {
  const cases = {
    'times 2': 'what is 391 times 2', 'divide that by 3': 'what is 391 divided by 3', 'and squared': 'what is 391 squared',
    'cubed': 'what is 391 cubed', 'the square root of that': 'what is the square root of 391', 'minus 4': 'what is 391 minus 4',
    'to the power of 2': 'what is 391 to the power of 2', 'add 5 to that': 'what is 391 plus 5', 'subtract 3 from that': 'what is 391 minus 3',
    'multiply that by 3': 'what is 391 times 3', 'double it': 'what is 391 times 2', 'half of it': 'what is 391 divided by 2',
    'plus nine': 'what is 391 plus 9', 'plus twenty five': 'what is 391 plus 25', '+ 9': 'what is 391 plus 9', 'x 2': 'what is 391 times 2',
    'what is that plus 1': 'what is 391 plus 1', 'Divided by 17?': 'what is 391 divided by 17',
  };
  for (const [p, want] of Object.entries(cases)) assert.equal(out(ARITH, p), want, p);
});

test('arith: the answer number is read by rule: thousands commas dropped, "= N", "is N.", a fraction, a negative', () => {
  const after = (text) => out(T({ prompt: 'what is a sum', text }), 'plus 1');
  assert.equal(after('1,234'), 'what is 1234 plus 1');
  assert.equal(after('17 * 23 = 391'), 'what is 391 plus 1');
  assert.equal(after('The answer is 42.'), 'what is 42 plus 1');
  assert.equal(after('steps\n400/3'), 'what is 400/3 plus 1');
  assert.equal(after('-7'), 'what is -7 plus 1');
  assert.equal(after('2.5'), 'what is 2.5 plus 1');
});

test('arith: no number on the last line, no last turn, or an operand that is not a number: no carry', () => {
  same(T({ prompt: 'what is the capital of france', text: 'Paris.' }), 'plus 9');
  same(T({ prompt: 'what is 2 plus 2', text: '4\nroute exact' }), 'plus 9');
  same([], 'plus 9');
  same(ARITH, 'plus that');
  same(ARITH, 'times many');
});

test('arith: only the LAST turn\'s text is read: a turn after the sum (even a thanks) breaks the chain', () => {
  same([...ARITH, { prompt: 'thanks', text: 'You are welcome.' }], 'plus 9');
  assert.equal(out([{ prompt: 'thanks', text: 'You are welcome.' }, ...ARITH], 'plus 9'), 'what is 391 plus 9');
});

test('arith: a chain through the organism\'s own exact path gives the right value at every step', () => {
  const turns = [];
  const ask = (p) => {
    const c = carry(turns, p);
    const r = readExact(c.prompt);
    assert.ok(r, 'the exact reader reads ' + c.prompt);
    turns.push({ prompt: p, text: renderSolved(r) });
    return r.answer;
  };
  assert.equal(ask('what is 17 times 23'), '391');
  assert.equal(ask('plus 9'), '400');
  assert.equal(ask('times 2'), '800');
  assert.equal(ask('divide that by 3'), '800/3');
  assert.equal(ask('times 3'), '800');
  assert.equal(ask('and squared'), '640000');
  assert.equal(ask('the square root of that'), '800');
  assert.equal(ask('minus 1000'), '-200');
});

// ---------------------------------------------------------------- correction

test('correction: "no, i meant spain", "i mean japan", "sorry, i meant italy" give the last frame with the new subject', () => {
  const h = T('what is the capital of france');
  assert.deepEqual(carry(h, 'no, i meant spain'), { prompt: 'what is the capital of spain', carried: true, from: 0, rule: 'correction' });
  assert.equal(out(h, 'i mean japan'), 'what is the capital of japan');
  assert.equal(out(h, 'sorry, i meant italy'), 'what is the capital of italy');
  assert.equal(out(h, 'No, I meant Spain!'), 'what is the capital of Spain');
  assert.equal(out(T('who was ada lovelace'), 'i meant charles babbage'), 'who was charles babbage');
});

test('correction: a class noun names which one the subject was, the way the encyclopedia titles its pages', () => {
  const g = T('what is the population of georgia');
  assert.deepEqual(carry(g, 'i mean the country'), { prompt: 'what is the population of georgia (country)', carried: true, from: 0, rule: 'correction' });
  assert.equal(out(T('what is the population of georgia', 'i mean the country'), 'no, i meant the state'), 'what is the population of georgia (state)');
  assert.equal(out(T('what is the population of new york'), 'i mean the city'), 'what is the population of new york (city)');
});

test('correction: with no frame before it, or naming a relation, a time or a pronoun, it does not carry', () => {
  same([], 'no, i meant spain');
  same(T('hi'), 'i mean spain');
  same(T('what is the capital of france'), 'i meant the population');
  same(T('what is the capital of france'), 'i meant tomorrow');
  same(T('what is the capital of france'), 'i meant her');
});

// ---------------------------------------------------------------- what must NOT carry

test('a prompt that stands alone never carries, whatever came before', () => {
  const h = T('what is the capital of france', 'who was ada lovelace', { prompt: 'what is 2 plus 2', text: '4' });
  for (const p of ['what is the capital of germany', 'who wrote hamlet', 'when was charles babbage born', 'tell me about spain', 'how big is the moon', 'what is 3 times 4', 'and what is the capital of italy?'])
    same(h, p);
});

test('a pronoun with no earlier subject does not carry', () => {
  for (const p of ['when was she born', 'what is its population', 'how big is it', 'tell me about him', 'how many people live there'])
    same([], p);
  same(T({ prompt: 'what is 17 times 23', text: '391' }), 'how big is it');
});

test('a pronoun does not reach back across a turn this file could not read', () => {
  same(T('who was ada lovelace', 'blorp zing fazz quux'), 'when was she born');
  same(T('tell me about japan', 'compare the economies of several asian nations over time'), 'what is its population');
  assert.equal(out(T('who was ada lovelace', 'hello'), 'when was she born'), 'when was ada lovelace born', 'a greeting is not a turn it cannot read');
});

test('he and she do not carry when two different people were asked about', () => {
  same(T('who was ada lovelace', 'who was charles babbage'), 'when was he born');
  same(T('who was ada lovelace', 'when was charles babbage born'), 'where did she die');
  same(T('who was ada lovelace', 'tell me about charles babbage'), 'when was he born');
  assert.equal(out(T('who was ada lovelace', 'when was ada lovelace born'), 'where did she die'), 'where did ada lovelace die', 'the same person twice is one person');
});

test('after a question whose answer is itself an entity, a pronoun that could mean that answer does not carry', () => {
  const fr = T('what is the capital of france');
  same(fr, 'what is its population');
  same(fr, 'how big is it');
  same(fr, 'how many people live there');
  const hm = T('who wrote hamlet');
  same(hm, 'when was he born');
  same(hm, 'where did he live');
  assert.equal(out(hm, 'when was it written'), 'when was hamlet written', 'it cannot mean the person who wrote it');
  same(T('who is the president of france'), 'how old is he');
});

test('a pronoun of the wrong kind for the subject does not carry (it for a person, she or there for a place)', () => {
  same(T('who was ada lovelace'), 'what is its population');
  same(T('who was ada lovelace'), 'how big is it');
  same(T('what is the currency of japan'), 'when was she born');
});

test('expletive it (the clock, the weather, the ambient, a clause after it) does not carry; a thing\'s it does', () => {
  const jp = T('tell me about japan');
  for (const p of ['what time is it', 'what day is it?', 'is it raining', 'is it true that cats fly', 'how long does it take to get there', 'is it possible', 'how far is it'])
    same(jp, p);
  same(T('tell me about the sun'), 'how hot is it');
  same(T('tell me about the sun'), 'how hot is it?');
  assert.equal(out(T('tell me about the sun'), 'how big is it'), 'how big is the sun');
  assert.equal(out(jp, 'where is it now'), 'where is japan now');
});

test('a pronoun prompt with a clause joined to it, a comma inside, or two pronouns does not carry', () => {
  const jp = T('tell me about japan');
  same(jp, 'what is its population and its area');
  same(jp, 'what is its population and area');
  same(jp, 'what is its capital or largest city');
  same(jp, 'how big is it, really');
  same(jp, 'how big is it or not');
  same(T('who was ada lovelace'), 'how did she meet her husband');
  same(T('who was ada lovelace'), 'did she do it herself');
});

test('that and this in "what is that", "what does that mean", "tell me about that" do not carry; "tell me about it" does', () => {
  const jp = T('tell me about japan');
  for (const p of ['what is that', 'what is this?', 'what does that mean', 'tell me about that', 'what is that country\'s capital'])
    same(jp, p);
  assert.equal(out(jp, 'tell me about it'), 'tell me about japan');
  assert.equal(out(jp, 'tell me more about it'), 'tell me more about japan');
});

test('a greeting, thanks or farewell neither carries nor becomes a subject; a turn between them is read through', () => {
  for (const p of ['hi', 'thanks!', 'bye', 'hello there', 'how are you?', 'ok'])
    same(T('who was ada lovelace'), p);
  same(T('hi'), 'germany?');
  same(T('thanks'), 'when was she born');
  assert.equal(out(T('what is the capital of france', 'thanks!'), 'and germany?'), 'what is the capital of germany');
  assert.equal(carry(T('what is the capital of france', 'thanks!'), 'and germany?').from, 0);
  assert.equal(subjectOf('hi'), null);
});

// ---------------------------------------------------------------- the history: its window, its cuts, its garbage

test('at most MAX_TURNS turns are read, the newest; from is the index in the whole list', () => {
  const filler = Array.from({ length: MAX_TURNS }, () => ({ prompt: 'hi', text: 'Hello.' }));
  same([{ prompt: 'what is the capital of france', text: '' }, ...filler], 'and germany?');
  const late = [...filler.slice(0, 5), { prompt: 'what is the capital of france', text: '' }, ...filler.slice(0, MAX_TURNS - 1)];
  assert.deepEqual(carry(late, 'and germany?'), { prompt: 'what is the capital of germany', carried: true, from: 5, rule: 'subject' });
});

test('each prompt is cut at 2000 characters: a longer follow-up stands alone, a longer earlier prompt is read cut', () => {
  const h = T('what is the capital of france');
  same(h, 'and germany?' + ' '.repeat(2000));
  const long = 'what is the capital of france' + ' x'.repeat(1200);
  same(T(long), 'and germany?');
  assert.equal(out(T('who was ada lovelace' + ' '.repeat(1990) + 'tail words here'), 'when was she born'), 'when was ada lovelace born');
});

test('garbage history never throws: null turns, a missing prompt, a number for a prompt, a non-array', () => {
  assert.deepEqual(carry(null, 'and germany?'), { prompt: 'and germany?', carried: false, from: null, rule: null });
  assert.deepEqual(carry('nope', 'again'), { prompt: 'again', carried: false, from: null, rule: null });
  same([null, 7, {}, { prompt: 42 }, { text: 'x' }], 'when was she born');
  same([{ prompt: 'who was ada lovelace' }, null], 'when was she born');
  assert.equal(out([{ prompt: 'who was ada lovelace' }], 'when was she born'), 'when was ada lovelace born', 'a turn with no text is still read');
  assert.equal(carry([], undefined).prompt, '');
  assert.equal(carry([], 42).prompt, '42');
});

test('pure and deterministic: the same turns give the same answer, and the turns are not touched', () => {
  const turns = T('what is the capital of france', 'and germany?', 'who was ada lovelace');
  const before = JSON.stringify(turns);
  const a = carry(turns, 'when was she born'), b = carry(turns, 'when was she born');
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(turns), before);
  turns.forEach((x) => Object.freeze(x));
  assert.deepEqual(carry(Object.freeze(turns), 'when was she born'), a);
});

// ---------------------------------------------------------------- subjectOf and frameOf

test('subjectOf: the entity a question is about, as typed, or null', () => {
  assert.equal(subjectOf('Who was Ada Lovelace?'), 'Ada Lovelace');
  assert.equal(subjectOf('what is the capital of france'), 'france');
  assert.equal(subjectOf("what is japan's population"), 'japan');
  assert.equal(subjectOf('when was the eiffel tower built'), 'the eiffel tower');
  for (const p of ['when was she born', 'hi', 'what is 2 plus 2', 'and germany?', 'what is the population', '', null, 'x'.repeat(2001)])
    assert.equal(subjectOf(p), null, String(p).slice(0, 40));
});

test('frameOf: the question with its subject replaced by a slot', () => {
  assert.deepEqual(frameOf('what is the capital of france?'), { frame: 'what is the capital of {}', subject: 'france' });
  assert.deepEqual(frameOf("what is japan's population"), { frame: "what is {}'s population", subject: 'japan' });
  assert.deepEqual(frameOf('when was ada lovelace born'), { frame: 'when was {} born', subject: 'ada lovelace' });
  assert.deepEqual(frameOf('tell me about spain'), { frame: 'tell me about {}', subject: 'spain' });
  assert.equal(frameOf('how big is it'), null);
  assert.equal(frameOf('thanks'), null);
});

// ---------------------------------------------------------------- browser safe

test('browser safe: one relative import (act/converse.mjs), nothing of node, no clock, no randomness, no network', () => {
  const src = readFileSync(new URL('../act/thread.mjs', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/^\s*import\s[^;]*?from\s+'([^']+)'/gm)].map((m) => m[1]);
  assert.deepEqual(imports, ['./converse.mjs']);
  const code = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const bad of [/\bnode:/, /\bprocess\./, /\bBuffer\b/, /\brequire\(/, /\bfetch\(/, /Math\.random/, /Date\.now|new Date/, /\bimport\(/, /\beval\(|new Function/])
    assert.equal(bad.test(code), false, String(bad));
});

// ---------------------------------------------------------------- a whole conversation

test('a twelve-turn conversation carries each follow-up by its rule', () => {
  const script = [
    ['what is the capital of france', 'Paris.', 'what is the capital of france', null],
    ['and germany?', 'Berlin.', 'what is the capital of germany', 'subject'],
    ['what about spain', 'Madrid.', 'what is the capital of spain', 'subject'],
    ['no, i meant japan', 'Tokyo.', 'what is the capital of japan', 'correction'],
    ['thanks!', 'You are welcome.', 'thanks!', null],
    ['who was ada lovelace', 'An English mathematician.', 'who was ada lovelace', null],
    ['when was she born', '10 December 1815.', 'when was ada lovelace born', 'frame'],
    ['where did she die', 'London.', 'where did ada lovelace die', 'frame'],
    ['tell me more', 'She wrote the first program.', 'tell me more about ada lovelace', 'continue'],
    ['what is 17 times 23', '391', 'what is 17 times 23', null],
    ['plus 9', '400', 'what is 391 plus 9', 'arith'],
    ['say that again', '400', 'what is 391 plus 9', 'repeat'],
  ];
  const turns = [];
  for (const [p, text, want, rule] of script) {
    const c = carry(turns, p);
    assert.equal(c.prompt, want, p);
    assert.equal(c.rule, rule, p);
    assert.equal(c.carried, rule !== null, p);
    turns.push({ prompt: p, text });
  }
  assert.equal(turns.length, 12);
});
