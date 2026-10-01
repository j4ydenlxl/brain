// grow/fixtures/echo-cell/test.mjs: the fixture's own tests (node:test, imports ./cell.mjs only).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { meta, can, answer, examples, REPLY } from './cell.mjs';

test('can is true for "h" only', () => {
  assert.equal(can('h'), true);
  for (const q of ['H', 'hh', ' h', 'hello', '', 'hi']) assert.equal(can(q), false, JSON.stringify(q));
});

test('answer echoes q: the fixed reply for h, and every example is answered', () => {
  assert.equal(answer('h'), REPLY);
  assert.equal(answer('hh'), 'You typed hh. Say a whole word or ask a question.');
  assert.equal(answer('h'), 'You typed h. Say a whole word or ask a question.');
  for (const ex of examples) { assert.equal(can(ex.q), true); assert.equal(typeof answer(ex.q), 'string'); }
  assert.equal(meta.id, 'echo-fixture');
});
