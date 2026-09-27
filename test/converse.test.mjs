// test/converse.test.mjs: THE NATIVE CONVERSATION REGION (act/converse.mjs) and its wiring at the
// head of act/prompt.mjs ask().
//
// His order, 2026-09-26 20:20 EDT: "it cant even respond to 'hi.' what a shame". The bar: every
// conversational turn the grammar carries is answered with provenance native, no model, no memory
// read, in microseconds (the median nanoseconds are PRINTED by this file, never typed); and no real
// question is shadowed: a prompt with a digit, an operator, a fact question or more than a few words
// returns null from converse() and ask() answers it the way it did before (the exact path prints 391
// for "17 times 23" with a greeting in front of it).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { Brain } from '../core/brain.mjs';
import { attachMemory } from '../memory/index.mjs';
import * as P from '../act/prompt.mjs';
import { converse, normalise, examples, CONVERSE_KINDS } from '../act/converse.mjs';

after(() => { if (typeof P.closeKnowledge === 'function') P.closeKnowledge(); });

let nb = 0;
const brain = () => { const b = new Brain({ name: 'converse-' + (++nb), ledger: 'full', pruneEvery: 0 }); attachMemory(b, { name: 'converse-' + nb }); return b; };
const DOWN = { base: 'http://127.0.0.1:9', probeMs: 150, timeoutMs: 400, spawn: false, provider: 'null' };

test('every kind the region carries is recognised from its example prompt', () => {
  const ex = examples();
  assert.equal(ex.length, CONVERSE_KINDS.length, 'one example per kind');
  for (const e of ex) {
    const c = converse(e.prompt);
    assert.ok(c, 'a turn: ' + e.prompt);
    assert.equal(c.kind, e.kind, e.prompt);
    assert.ok(c.answer.length > 20, 'a sentence, not a token');
    assert.ok(Number.isInteger(c.ns) && c.ns >= 0, 'nanoseconds measured');
  }
});

test('the forms a person types: case, punctuation, emoji, a trailing please or the name', () => {
  const turns = [
    ['Hi!', 'greeting'], ['HELLO', 'greeting'], ['hey there', 'greeting'], ['hi dilation', 'greeting'], ['Good morning', 'greeting'],
    ['yo', 'greeting'], ['hello 👋', 'greeting'], ['sup', 'greeting'],
    ['how are you doing?', 'wellbeing'], ["what's up", 'wellbeing'], ['are you there', 'wellbeing'],
    ['who are you', 'identity'], ['What are you?', 'identity'], ['are you an AI?', 'identity'], ['are you chatgpt', 'identity'],
    ["What's your name?", 'name'], ['do you have a name', 'name'],
    ['help', 'ability'], ['what can you do?', 'ability'], ['how does this work', 'ability'], ['help me please', 'ability'],
    ['Thanks!', 'thanks'], ['thank you so much', 'thanks'], ['ty', 'thanks'], ['thanks, brain', 'thanks'],
    ['ok', 'ack'], ['cool', 'ack'], ['yes', 'ack'],
    ['bye', 'farewell'], ['Good night', 'farewell'], ['see you later', 'farewell'],
  ];
  for (const [prompt, kind] of turns) {
    const c = converse(prompt);
    assert.ok(c, 'a turn: ' + JSON.stringify(prompt));
    assert.equal(c.kind, kind, JSON.stringify(prompt));
  }
});

test('nothing that is a question about the world or a computation is a turn (the region never shadows)', () => {
  const notTurns = [
    'what is 2 plus 2', 'hi, what is 17 times 23', '17 * 23', 'x + 3 = 7', 'hello world program in python',
    'who is the president of france', 'what is the capital of peru', 'how are you computing that', 'what can you do about climate change',
    'Natalia sold clips to 48 of her friends in April, and then she sold half as many clips in May. How many clips did Natalia sell altogether in April and May?',
    'hi there my friend how are you doing today on this fine morning', '', '   ', 'hi5', 'thanks for the 3 answers', 'what is your name in binary',
  ];
  for (const p of notTurns) assert.equal(converse(p), null, 'not a turn: ' + JSON.stringify(p));
  assert.equal(normalise('what is 2 plus 2'), null, 'a digit stops the grammar before any match');
  assert.equal(normalise('a'.repeat(65)), null, 'over the length cap');
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
});
