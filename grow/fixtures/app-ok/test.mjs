// grow/fixtures/app-ok/test.mjs: the todo app's own tests (node:test over the pure functions of ./app.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addTodo, toggleTodo, removeTodo, render } from './app.mjs';

test('addTodo appends trimmed text as an open item, ignores blank text, never mutates', () => {
  const a = [];
  const b = addTodo(a, '  buy milk ');
  assert.deepEqual(b, [{ text: 'buy milk', done: false }]);
  assert.deepEqual(a, []);
  assert.deepEqual(addTodo(b, '   '), b);
  assert.notEqual(addTodo(b, ''), b);
});

test('toggleTodo flips only item i', () => {
  const l = addTodo(addTodo([], 'a'), 'b');
  const t = toggleTodo(l, 1);
  assert.deepEqual(t.map((x) => x.done), [false, true]);
  assert.deepEqual(toggleTodo(t, 1).map((x) => x.done), [false, false]);
  assert.deepEqual(l.map((x) => x.done), [false, false]);
});

test('removeTodo drops item i and keeps the order of the rest', () => {
  const l = addTodo(addTodo(addTodo([], 'a'), 'b'), 'c');
  assert.deepEqual(removeTodo(l, 1).map((x) => x.text), ['a', 'c']);
  assert.equal(removeTodo(l, 9).length, 3);
});

test('render escapes the text, marks done items, and shows an empty state', () => {
  assert.match(render([]), /Nothing to do yet/);
  const html = render(toggleTodo(addTodo([], '<b>x</b> & y'), 0));
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt; &amp; y/);
  assert.ok(!html.includes('<b>'));
  assert.match(html, /class="done"/);
  assert.match(html, /checked/);
});
