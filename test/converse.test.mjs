// test/converse.test.mjs: THE NATIVE CONVERSATION REGION (act/converse.mjs) and its wiring at the
// head of act/prompt.mjs ask().
//
// His order, 2026-09-26 20:20 EDT: "it cant even respond to 'hi.' what a shame"; 2026-09-27 09:28
// EDT: "Yeah but i said hey to it and it said it couldnt respond". The bar: every conversational
// turn the grammar carries is answered with provenance native, no model, no memory read, in
// microseconds (the median nanoseconds are PRINTED by this file, never typed); compounds ("hey, how
// are you"), typos and shorthand ("heyyy", "how r u", "thx") are carried; and no real question is
// shadowed: a prompt with a digit, an operator, a fact question, code, a URL or more than ten words
// returns null from converse() and ask() answers it the way it did before (the exact path prints
// 391 for "17 times 23" with a greeting in front of it). The file runs in a browser tab byte for
// byte: no runtime global, no Node import (asserted on the source and under a shadowed scope).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import * as P from '../act/prompt.mjs';
import { converse, normalise, examples, CONVERSE_KINDS, MAX_CHARS, MAX_WORDS } from '../act/converse.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_PATH = path.join(HERE, '..', 'act', 'converse.mjs');

after(() => { if (typeof P.closeKnowledge === 'function') P.closeKnowledge(); });

let nb = 0;
const brain = () => { const b = new Brain({ name: 'converse-' + (++nb), ledger: 'full', pruneEvery: 0 }); attachMemory(b, { name: 'converse-' + nb }); return b; };
const DOWN = { base: 'http://127.0.0.1:9', probeMs: 150, timeoutMs: 400, spawn: false, provider: 'null' };
const expectKind = (pairs) => {
  for (const [prompt, kind] of pairs) {
    const c = converse(prompt);
    assert.ok(c, 'a turn: ' + JSON.stringify(prompt));
    assert.equal(c.kind, kind, JSON.stringify(prompt) + ' read as ' + JSON.stringify(c.form));
  }
  return pairs.length;
};

test('every kind the region carries is recognised from its example prompt', () => {
  const ex = examples();
  assert.equal(ex.length, CONVERSE_KINDS.length, 'one example per kind');
  assert.deepEqual(ex.map((e) => e.kind), [...CONVERSE_KINDS], 'the examples cover the atoms in order');
  for (const e of ex) {
    const c = converse(e.prompt);
    assert.ok(c, 'a turn: ' + e.prompt);
    assert.equal(c.kind, e.kind, e.prompt);
    assert.ok(c.answer.length > 20, 'a sentence, not a token');
    assert.ok(Number.isInteger(c.ns) && c.ns > 0, 'nanoseconds measured, above zero');
  }
});

test('the forms a person types: case, punctuation, emoji, a trailing please or the name', () => {
  const turns = [
    ['Hi!', 'greeting'], ['HELLO', 'greeting'], ['hey there', 'greeting'], ['hi dilation', 'greeting'], ['Good morning', 'greeting'],
    ['yo', 'greeting'], ['hello 👋', 'greeting'], ['sup', 'greeting'], ['hey', 'greeting'], ['Hey', 'greeting'],
    ['how are you doing?', 'wellbeing'], ["what's up", 'wellbeing'],
    ['who are you', 'identity'], ['What are you?', 'identity'], ['are you an AI?', 'identity'], ['are you chatgpt', 'identity'],
    ["What's your name?", 'name'], ['do you have a name', 'name'],
    ['help', 'ability'], ['what can you do?', 'ability'], ['how does this work', 'ability'], ['help me please', 'ability'],
    ['Thanks!', 'thanks'], ['thank you so much', 'thanks'], ['ty', 'thanks'], ['thanks, brain', 'thanks'],
    ['ok', 'ack'], ['cool', 'ack'], ['yes', 'ack'],
    ['bye', 'farewell'], ['Good night', 'farewell'], ['see you later', 'farewell'],
    // moved by his order of 09:28 (item converse-cover): presence is its own atom now
    ['are you there', 'presence'], ['you there?', 'presence'], ['are you awake', 'presence'],
    ['are you alive', 'nature'],
  ];
  expectKind(turns);
});

test('the transcript he saw on 2026-09-27: every opener the live API answered, and "hey, how are you", which fell to memory', () => {
  for (const p of ['hey', 'Hey', 'hey there', 'yo', "what's up"]) assert.ok(converse(p), p);
  const c = converse('hey, how are you');
  assert.ok(c, 'hey, how are you is carried now');
  assert.equal(c.kind, 'greeting+wellbeing');
  assert.deepEqual(c.parts.map((p) => p.kind), ['greeting', 'wellbeing']);
});

test('twenty-four compounds: two or three carried atoms joined by a space, a comma, "and" or "but"', () => {
  const n = expectKind([
    ['hey, how are you', 'greeting+wellbeing'], ['hi who are you', 'greeting+identity'], ['hello, what can you do?', 'greeting+ability'],
    ['hey whats your name', 'greeting+name'], ['hello? can you hear me', 'greeting+presence'], ['hey there, who built you?', 'greeting+origin'],
    ['thanks, bye', 'thanks+farewell'], ['ok thanks', 'ack+thanks'], ['ok, what can you do', 'ack+ability'], ['cool, who made you', 'ack+origin'],
    ['hi, how are you, what can you do', 'greeting+wellbeing+ability'], ['hey! are you conscious?', 'greeting+nature'],
    ['hi how old are you', 'greeting+age'], ['hello, tell me about yourself', 'greeting+self'], ['hey where do you run', 'greeting+place'],
    ['hi what is your purpose', 'greeting+purpose'], ['hey tell me a joke', 'greeting+uncarried'], ['thank you so much, goodbye', 'thanks+farewell'],
    ['good morning, how are you today?', 'greeting+wellbeing'], ['hi, i am sam', 'greeting+intro'],
    ['hey, how are you and what can you do', 'greeting+wellbeing+ability'], ["i'm good, and you?", 'ack+wellbeing'],
    ['nice, thanks bye', 'ack+thanks+farewell'], ['who are you but what can you do', 'identity+ability'],
  ]);
  assert.ok(n >= 20);
  // a greeting said twice, or two greetings, is one greeting
  assert.equal(converse('hey hello').kind, 'greeting');
  assert.equal(converse('hi hi hi').kind, 'greeting');
});

test('a compound answer: the parts in order, a repeated sentence printed once, one offer at the end', () => {
  const hi = converse('hi').answer, well = converse('how are you').answer, who = converse('who are you').answer;
  const c = converse('hey, how are you');
  assert.ok(c.answer.startsWith('Hello. '), c.answer);
  assert.ok(c.answer.indexOf('Hello.') < c.answer.indexOf('Running.'), 'greeting before wellbeing');
  const offer = 'Ask me a sum, an equation, a word problem or a fact I hold; every answer prints the route that reached it.';
  assert.ok(hi.endsWith(offer) && well.endsWith(offer), 'both parts end with the same offer alone');
  assert.equal(c.answer.split(offer).length - 1, 1, 'the offer is printed once');
  assert.ok(c.answer.endsWith(offer), 'and last');
  const intro = 'I am Dilation, a computational organism: cells wired into circuits and regions, grown by generations and measured by benches.';
  assert.ok(hi.includes(intro) && who.includes(intro));
  const d = converse('hi, who are you');
  assert.equal(d.answer.split(intro).length - 1, 1, 'the sentence both parts carry is printed once');
  const e = converse('hello, what can you do');
  assert.ok(!e.answer.includes(offer), 'no offer after the ability sentences, which are the offer');
  const sentences = (s) => s.match(/[^.;]+[.;]/g).map((x) => x.trim());
  for (const p of ['hey, how are you', 'hi who are you', 'hi, how are you, what can you do', 'thanks, bye', 'nice, thanks bye']) {
    const ss = sentences(converse(p).answer);
    assert.equal(new Set(ss).size, ss.length, p + ': no sentence twice');
  }
});

test('thirty-eight typos and shorthands, repaired inside normalise() only', () => {
  const n = expectKind([
    ['heyyy', 'greeting'], ['hiii', 'greeting'], ['hellooo', 'greeting'], ['helo', 'greeting'], ['hey hey', 'greeting'], ['hi hi', 'greeting'],
    ['yo yo', 'greeting'], ['yooo', 'greeting'], ['wassup', 'wellbeing'], ['wazzup', 'wellbeing'], ['wsup', 'wellbeing'], ['how r u', 'wellbeing'],
    ['hru', 'wellbeing'], ['r u ok', 'wellbeing'], ['wat r u', 'identity'], ['wut is ur name', 'name'], ['wats ur name', 'name'], ['thx', 'thanks'],
    ['tysm', 'thanks'], ['thank u', 'thanks'], ['pls help', 'ability'], ['so who are you', 'identity'], ['ok so what can you do', 'ability'],
    ['um hi', 'greeting'], ['u there?', 'presence'], ['r u real', 'nature'], ['gm', 'greeting'], ['gn', 'farewell'], ['cya', 'farewell'],
    ['ttyl', 'farewell'], ['lmaooo', 'ack'], ['okkk', 'ack'], ['whos ur creator', 'origin'], ['how old r u', 'age'],
    ['what’s up', 'wellbeing'], ['how’s it going?', 'wellbeing'], ['are you self-aware?', 'nature'], ['good-bye', 'farewell'],
  ]);
  assert.ok(n >= 30);
  assert.equal(normalise('heyyy'), 'hey');
  assert.equal(normalise('how r u'), 'how are you');
  assert.equal(normalise('ok so what can you do'), 'what can you do');
  assert.equal(normalise('wassup'), 'what is up');
  assert.equal(normalise('hey hey'), 'hey');
  assert.equal(normalise('please help'), 'help');
});

test('every new atom, several forms each, and their answers stay true (no feeling claimed)', () => {
  expectKind([
    ['who made you', 'origin'], ['who built you?', 'origin'], ['who created you', 'origin'], ['who trained you', 'origin'], ['who wrote you', 'origin'],
    ['who is your creator', 'origin'], ['where do you come from', 'origin'],
    ['can you hear me', 'presence'], ['is anyone there', 'presence'], ['anyone there?', 'presence'], ['is this working', 'presence'], ['does this work', 'presence'],
    ['is this thing on?', 'presence'], ['test', 'presence'], ['testing', 'presence'], ['hello world', 'presence'], ['are you working', 'presence'],
    ['tell me about yourself', 'self'], ['introduce yourself', 'self'], ['describe yourself', 'self'], ['what do you know', 'self'],
    ['what are you made of', 'self'], ['what is inside you', 'self'],
    ['are you conscious', 'nature'], ['are you real', 'nature'], ['are you alive', 'nature'], ['do you think', 'nature'], ['do you dream', 'nature'],
    ['do you feel', 'nature'], ['do you learn', 'nature'], ['are you learning', 'nature'], ['do you grow', 'nature'], ['are you smart', 'nature'],
    ['are you intelligent', 'nature'], ['how smart are you', 'nature'], ['are you sentient', 'nature'],
    ['how old are you', 'age'], ['when were you made', 'age'], ['when were you born', 'age'],
    ['where are you', 'place'], ['where do you live', 'place'], ['where do you run', 'place'],
    ['what is your purpose', 'purpose'], ['why do you exist', 'purpose'], ['what do you want', 'purpose'], ['what are you for', 'purpose'],
    ['tell me a joke', 'uncarried'], ['sing', 'uncarried'], ['write a poem', 'uncarried'], ['write an essay', 'uncarried'], ['write code', 'uncarried'],
    ['you are cool', 'praise'], ['that is wrong', 'rebuke'], ['can i ask you something', 'invite'], ['do you remember me', 'recall'],
    ['my name is sam', 'intro'], ["what's your favorite color", 'preference'], ['do you like music', 'preference'],
  ]);
  const age = converse('how old are you').answer;
  assert.match(age, /September 2026/, 'the month and year of the first commit');
  const purpose = converse('what is your purpose').answer;
  assert.ok(purpose.includes('"self growing and self improving"'), 'his words from docs/VISION.md section 1, one short clause');
  const un = converse('tell me a joke').answer;
  assert.match(un, /No region of mine carries/);
  for (const q of ['what is 17 times 23', 'what can you do', 'who made you']) {
    assert.ok(un.includes('"' + q + '"'), 'offers ' + q);
    if (q !== 'what is 17 times 23') assert.ok(converse(q), q + ' is itself carried by this region');
  }
  // no answer claims a feeling, a mood or a like
  for (const e of examples()) assert.doesNotMatch(converse(e.prompt).answer, /\bI (feel|felt|am feeling|love|enjoy|am happy|am sad|am glad|like)\b/, e.kind);
  for (const a of examples().map((e) => converse(e.prompt).answer)) assert.doesNotMatch(a, /—/, 'no em-dash');
});

test('the first commit month in the age answer is the one git prints (when the clone has its history)', (t) => {
  let shallow = 'unknown', first = null;
  try {
    shallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], { cwd: HERE, encoding: 'utf8' }).trim();
    first = execFileSync('git', ['log', '--reverse', '--format=%cs'], { cwd: HERE, encoding: 'utf8' }).split('\n')[0].trim();
  } catch { /* no git on this host */ }
  if (shallow !== 'false' || !first) { t.skip('no full git history here (shallow ' + shallow + ')'); return; }
  const [y, m] = first.split('-').map(Number);
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1];
  console.log('CONVERSE first commit ' + first + ' -> ' + month + ' ' + y);
  assert.ok(converse('how old are you').answer.includes(month + ' ' + y), 'age answer names ' + month + ' ' + y);
});

test('forty-eight non-turns return null: arithmetic, word problems, facts, one-word nouns, a URL, a mail, code', () => {
  const notTurns = [
    // arithmetic, spoken and symbolic
    'what is 2 plus 2', 'what is two plus two', 'seventeen times twenty three', 'what is five minus three', 'how much is ten divided by two',
    '17 * 23', 'x + 3 = 7', 'square root of one forty four', 'what is half of eight', 'hi, what is 17 times 23', 'five - three',
    // word problems shaped like GSM8K
    'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?',
    "Janet's ducks lay sixteen eggs per day and she eats three",
    'A robe takes two bolts of blue fiber and half that much white fiber',
    'If a train travels sixty miles in an hour how far does it go',
    'Tom has three apples and gives one to Sam how many are left',
    // questions about the world
    'what is the capital of france', 'how many legs does a spider have', 'who is the president of france', 'who wrote hamlet', 'what is photosynthesis',
    'when did world war two end', 'how far is the moon', 'what is the weather today', 'what time is it', 'who made the eiffel tower', 'where is paris',
    'how old is the earth', 'what is love', 'what is the meaning of life', 'do you know einstein', 'translate hello to french', 'define entropy',
    'hey, what is the weather', 'tell me about the moon', 'write a poem about the sea', 'what is good morning', 'how are you computing that',
    'what can you do about climate change', 'what is your name in binary', 'hello world program in python',
    // one-word nouns
    'france', 'apple', 'photosynthesis', 'banana',
    // a URL, a mail address, code
    'https://dilation.dev', 'www.google.com', 'hello@example.com', "console.log('hi')", 'def hello(): pass', 'function hi() { return 1 }',
    'print("hello world")', 'SELECT * FROM users',
    // over the caps, empty
    'hi there my friend how are you doing today on this fine morning', '', '   ', 'hi5', 'thanks for the 3 answers',
  ];
  assert.ok(notTurns.length >= 40, notTurns.length + ' non-turns');
  for (const p of notTurns) assert.equal(converse(p), null, 'not a turn: ' + JSON.stringify(p));
  assert.equal(normalise('what is 2 plus 2'), null, 'a digit stops the grammar before any match');
  assert.equal(normalise('a'.repeat(MAX_CHARS + 1)), null, 'over the length cap (' + MAX_CHARS + ' chars)');
  assert.equal(converse('a'.repeat(65)), null, 'a long nonsense word is not a turn');
  assert.equal(normalise(Array(MAX_WORDS + 1).fill('hi').join(' ')), null, 'over the word cap (' + MAX_WORDS + ' words as typed)');
  console.log('CONVERSE non-turns null ' + notTurns.length + ' of ' + notTurns.length);
});

test('the source is browser safe: no runtime global, no Node import, no require, no network', () => {
  const src = readFileSync(SRC_PATH, 'utf8');
  assert.ok(!src.includes('process.'), 'no "process." in act/converse.mjs');
  assert.ok(!src.includes('node:'), 'no "node:" in act/converse.mjs');
  assert.ok(!/\brequire\(/.test(src), 'no require');
  assert.ok(!/\bfetch\(/.test(src), 'no fetch');
  assert.ok(!/^\s*import\s/m.test(src), 'no import at all');
  // the same test web/ask.mjs runs before it copies a module into the visitor tab
  assert.ok(!/\bfrom\s*['"]node:|\brequire\(|\bprocess\.|\bfetch\(/.test(src), 'web/ask.mjs would accept this file');
  assert.ok(!src.includes('—'), 'no em-dash');
});

test('converse() runs with the runtime global shadowed to undefined and still answers "hey" (the browser proof)', () => {
  const src = readFileSync(SRC_PATH, 'utf8').replace(/^export /gm, '');
  // eslint-disable-next-line no-new-func
  const make = new Function('process', 'require', 'globalThis', 'module', src + '\nreturn { converse, examples };');
  const fake = { performance: globalThis.performance };
  const m = make(undefined, undefined, fake, undefined);
  const c = m.converse('hey');
  assert.ok(c, 'hey is answered with process shadowed');
  assert.equal(c.kind, 'greeting');
  assert.ok(Number.isInteger(c.ns) && c.ns > 0);
  assert.equal(m.converse('hey, how are you').kind, 'greeting+wellbeing');
  assert.equal(m.converse('what is 2 plus 2'), null);
  for (const e of m.examples()) assert.equal(m.converse(e.prompt).kind, e.kind, e.prompt);
});

test('ask() answers hi natively: provenance native, no model, no memory, route direct, and prints the nanoseconds', async () => {
  const a = await P.ask(brain(), 'hi', DOWN);
  assert.equal(a.ok, true);
  assert.equal(a.from, 'native');
  assert.equal(a.provenance.answer, 'native');
  assert.equal(a.provenance.tier, 'native');
  assert.equal(a.provenance.method, 'greeting');
  assert.equal(a.provenance.llm.ok, false);
  assert.match(a.provenance.llm.reason, /not asked/);
  assert.equal(a.route, 'direct');
  assert.equal(a.exact, null);
  assert.equal(a.native.kind, 'greeting');
  assert.ok(a.text.includes(a.native.answer), 'the text carries the answer sentence');
  assert.ok(a.text.includes(a.native.ns + ' ns'), 'the text prints the nanoseconds');
  assert.equal(a.provenance.memoryHits, 0);
  assert.ok(Number.isInteger(a.seq), 'logged to the ledger like every ask');
});

test('ask() answers "hey, how are you" natively as one compound turn, not from memory', async () => {
  const a = await P.ask(brain(), 'hey, how are you', DOWN);
  assert.equal(a.from, 'native');
  assert.equal(a.provenance.answer, 'native');
  assert.equal(a.provenance.method, 'greeting+wellbeing');
  assert.equal(a.route, 'direct');
  assert.equal(a.provenance.memoryHits, 0);
  assert.ok(!/nothing in memory/.test(a.text), a.text);
  assert.ok(a.text.includes('Hello.') && a.text.includes('Running.'));
});

test('ask() with converse off skips the region; a sum is still the exact path; a greeting with a sum is never a turn', async () => {
  const off = await P.ask(brain(), 'hi', { ...DOWN, converse: false });
  assert.notEqual(off.from, 'native', 'the region is skippable');
  const sum = await P.ask(brain(), 'what is 17 times 23', DOWN);
  assert.equal(sum.from, 'exact', 'the exact path still answers a sum first');
  assert.equal(String(sum.exact.answer), '391');
  // MEASURED 2026-09-26 on the CLI: "hi, what is 17 times 23" was provenance memory (a miss) before
  // this region existed and stays so after it; the region returns null (a digit), it does not shadow.
  const mixed = await P.ask(brain(), 'hi, what is 17 times 23', DOWN);
  assert.notEqual(mixed.from, 'native', 'a greeting with a digit is not a turn');
  assert.notEqual(mixed.provenance.answer, 'native', 'the provenance is whatever the old chain gave, never native');
  assert.equal(converse('hi, what is 17 times 23'), null, 'the grammar itself returns null on a digit');
});

test('the microseconds: the median of 1000 matches is under 1 ms (printed, not typed)', () => {
  const ex = examples();
  const ns = [];
  for (let i = 0; i < 1000; i++) {
    const c = converse(ex[i % ex.length].prompt);
    assert.ok(c);
    ns.push(c.ns);
  }
  ns.sort((a, b) => a - b);
  const median = ns[Math.floor(ns.length / 2)], p95 = ns[Math.floor(ns.length * 0.95)];
  console.log('CONVERSE median ' + median + ' ns, p95 ' + p95 + ' ns, max ' + ns[ns.length - 1] + ' ns over ' + ns.length + ' matches');
  assert.ok(median < 1_000_000, 'median under one millisecond: ' + median + ' ns');
  const cns = [];
  for (let i = 0; i < 1000; i++) cns.push(converse('hey, how are you').ns);
  cns.sort((a, b) => a - b);
  console.log('CONVERSE compound median ' + cns[500] + ' ns, p95 ' + cns[950] + ' ns over 1000 matches of "hey, how are you"');
  assert.ok(cns[500] < 1_000_000, 'compound median under one millisecond: ' + cns[500] + ' ns');
});
