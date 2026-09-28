// test/code-native.test.mjs: act/code-native.mjs, the code readers that need no model (board 34, item code-native).
//
// What is proved here, each by running code rather than by reading it:
//   1. every catalogue entry's JavaScript passes the entry's own examples in act/run.mjs, and there are 60 or more;
//   2. the spec reader writes the operation a prompt asks, in JavaScript and in Python, on ten operations, and the
//      JavaScript it writes passes tests the prompt never stated;
//   3. example synthesis finds the program on two fixtures, and refuses two examples that two programs fit;
//   4. each of the five kinds has a prompt the readers refuse;
//   5. THE RUN-BEFORE-ANSWER RULE: a planted wrong catalogue entry is answered when the prompt states no example and
//      is NEVER answered when the prompt states one it fails;
//   6. the bench's verdict has the shape the board asks for, built from a small real run of the bench's own functions.
// No model, no socket. Python is never run on this machine: a Python answer is checked as text against the
// catalogue's Python, and its behaviour through the JavaScript twin the reader ran.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import {
  CATALOGUE, OPERATIONS, PRIMITIVES, codeNative, codeNativeShape, emitEntry, parseValue, readRequest, runAnswer, synthesize,
} from '../act/code-native.mjs';
import { extractCode } from '../bench/conceive.mjs';
import {
  BAR, COMMAND, HELDOUT_FILE, HELDOUT_SHA256, KINDS, buildVerdict, gradePopulation, quantile, runControl,
} from '../bench/code-native.mjs';
import { loadPrompts } from '../bench/conceive.mjs';

const camel = (id) => id.replace(/-([a-z])/g, (_m, c) => c.toUpperCase());
const byId = (id) => CATALOGUE.find((e) => e.id === id);

test('the catalogue holds 60 or more operations and every entry passes its own examples in act/run.mjs', async () => {
  assert.ok(OPERATIONS >= 60, 'operations ' + OPERATIONS);
  assert.equal(new Set(CATALOGUE.map((e) => e.id)).size, CATALOGUE.length, 'ids are unique');
  let ran = 0;
  for (const e of CATALOGUE) {
    assert.ok(Array.isArray(e.ex) && e.ex.length >= 1, e.id + ' has examples');
    assert.equal(e.in.length, e.arity, e.id + ' arity');
    const js = emitEntry(e);
    const r = await runAnswer(js, camel(e.id), e.ex.map(([args, want]) => ({ args, want })));
    assert.ok(r.ok, e.id + ' failed its own examples: ' + JSON.stringify(r.cases.map((c) => [c.ok, c.got, c.error])).slice(0, 300));
    ran += r.passed;
    const py = emitEntry(e, 'python');
    assert.match(py, new RegExp('^def ' + e.id.replace(/-/g, '_') + '\\('), e.id + ' Python signature');
    assert.match(py, /\breturn\b/, e.id + ' Python returns');
  }
  assert.ok(ran >= CATALOGUE.length * 2, 'examples ran: ' + ran);
});

// Ten operations, each asked in JavaScript (and graded on tests the prompt does not state) and in Python.
const SPEC = [
  { id: 'reverse-string', js: 'Write a JavaScript function named flip(text) that returns the string reversed.', py: 'Write a Python function named flip(text) that returns the string reversed.', entry: 'flip', tests: [[['stressed'], 'desserts'], [[''], ''], [['a b'], 'b a']] },
  { id: 'is-prime', js: 'Implement a JavaScript function isPrime(n) that returns true if n is a prime number and false otherwise.', py: 'Implement a Python function is_prime(n) that returns True if n is a prime number and False otherwise.', entry: 'isPrime', tests: [[[2], true], [[9], false], [[1], false], [[101], true]] },
  { id: 'factorial', js: 'Write a JavaScript function called fact(n) that returns the factorial of n.', py: 'Write a Python function called fact(n) that returns the factorial of n.', entry: 'fact', tests: [[[0], 1], [[6], 720]] },
  { id: 'count-vowels', js: 'Create a JavaScript function named vowelCount that counts the vowels in a string.', py: 'Create a Python function named vowel_count that counts the vowels in a string.', entry: 'vowelCount', tests: [[['Programming'], 3], [['rhythm'], 0]] },
  { id: 'unique', js: 'Write a JavaScript function named dedupe(arr) that returns a new array with duplicates removed, keeping the original order.', py: 'Write a Python function named dedupe(arr) that returns a new list with duplicates removed, keeping the original order.', entry: 'dedupe', tests: [[[[3, 1, 3, 2, 1]], [3, 1, 2]], [[[]], []]] },
  { id: 'gcd', js: 'Write a JavaScript function gcd(a, b) that returns the greatest common divisor of a and b.', py: 'Write a Python function gcd(a, b) that returns the greatest common divisor of a and b.', entry: 'gcd', tests: [[[48, 36], 12], [[17, 5], 1]] },
  { id: 'chunk', js: 'Write a JavaScript function chunk(arr, size) that splits an array into groups of the given size.', py: 'Write a Python function chunk(arr, size) that splits a list into groups of the given size.', entry: 'chunk', tests: [[[[1, 2, 3, 4, 5, 6, 7], 3], [[1, 2, 3], [4, 5, 6], [7]]]] },
  { id: 'anagram', js: 'Write a JavaScript function named isAnagram(a, b) that returns true if the two strings are anagrams of each other.', py: 'Write a Python function named is_anagram(a, b) that returns True if the two strings are anagrams of each other.', entry: 'isAnagram', tests: [[['evil', 'vile'], true], [['evil', 'veil '], false]] },
  { id: 'leap-year', js: 'Write a JavaScript function named isLeap(year) that returns whether year is a leap year.', py: 'Write a Python function named is_leap(year) that returns whether year is a leap year.', entry: 'isLeap', tests: [[[1600], true], [[1700], false], [[2028], true]] },
  { id: 'flatten', js: 'Write a JavaScript function named flat(arr) that flattens a nested array of any depth.', py: 'Write a Python function named flat(arr) that flattens a nested list of any depth.', entry: 'flat', tests: [[[[[1, [2]], [[3]], 4]], [1, 2, 3, 4]]] },
  { id: 'fizzbuzz', js: "Write a JavaScript function fizz(n) that returns 'Fizz' if n is divisible by 3, 'Buzz' if n is divisible by 5, 'FizzBuzz' if n is divisible by both 3 and 5, and otherwise n as a string.", py: "Write a Python function fizz(n) that returns 'Fizz' if n is divisible by 3, 'Buzz' if n is divisible by 5, 'FizzBuzz' if n is divisible by both 3 and 5, and otherwise n as a string.", entry: 'fizz', tests: [[[9], 'Fizz'], [[10], 'Buzz'], [[30], 'FizzBuzz'], [[7], '7']] },
];

test('the spec reader writes ten operations in JavaScript (graded on unstated tests) and in Python', async () => {
  for (const s of SPEC) {
    const a = await codeNative(s.js);
    assert.ok(a, 'answered: ' + s.js);
    assert.equal(a.provenance, 'native');
    assert.equal(a.route, 'code-native');
    assert.equal(a.kind, 'code');
    assert.equal(a.method, 'spec-reader:' + s.id, s.js);
    const r = await runAnswer(extractCode(a.text), s.entry, s.tests.map(([args, want]) => ({ args, want })));
    assert.ok(r.ok, s.id + ' JavaScript failed unstated tests: ' + JSON.stringify(r.cases.map((c) => [c.ok, c.got, c.error])));
    const p = await codeNative(s.py);
    assert.ok(p, 'answered: ' + s.py);
    assert.equal(p.lang, 'python');
    assert.equal(p.method, 'spec-reader:' + s.id, s.py);
    assert.match(p.answer, /^def [a-z_]+\(/, s.id + ' is a Python def');
    assert.match(p.text, /```python\n/, s.id + ' is fenced as Python');
    if (s.id !== 'fizzbuzz') {
      const want = emitEntry(byId(s.id), 'python', /^def ([a-z_]+)\(/.exec(p.answer)[1], readRequest(s.py).params);
      assert.equal(p.answer, want, s.id + ' Python is the catalogue Python');
    }
  }
});

test('a stated example is run before the answer: the reader runs it and says so', async () => {
  const a = await codeNative('Write a JavaScript function named total(nums) that returns the sum of all the numbers in an array, so total([1, 2, 3]) returns 6.');
  assert.ok(a);
  assert.equal(a.method, 'spec-reader:sum');
  assert.ok(a.steps.some((s) => /ran 1 of 1 stated examples in act\/run\.mjs: all passed/.test(s)), a.steps.join(' | '));
});

test('example synthesis finds the program on two fixtures, and two examples that two programs fit are refused', async () => {
  const f1 = await codeNative('Write a JavaScript function named twice(x) where twice(1) returns 2, twice(3) returns 6 and twice(-2) returns -4.');
  assert.ok(f1, 'fixture 1 answered');
  assert.equal(f1.method, 'example-synthesis:double');
  assert.ok((await runAnswer(extractCode(f1.text), 'twice', [{ args: [10], want: 20 }, { args: [0], want: 0 }])).ok);
  const f2 = await codeNative('Write a JavaScript function named shout(s) such that shout("ab") returns "BA", shout("xyz") returns "ZYX" and shout("q") returns "Q".');
  assert.ok(f2, 'fixture 2 answered');
  assert.match(f2.method, /^example-synthesis:(?:reverse>upper|upper>reverse)$/);
  assert.ok((await runAnswer(extractCode(f2.text), 'shout', [{ args: ['hello'], want: 'OLLEH' }, { args: [''], want: '' }])).ok);
  // the search itself, and its refusals
  const s = synthesize([{ args: [[3, 1, 2]], want: 6 }, { args: [[5]], want: 5 }, { args: [[]], want: 0 }]);
  assert.deepEqual(s.program, ['sum']);
  assert.match(synthesize([{ args: [2], want: 4 }, { args: [5], want: 10 }]).refuse, /ambiguous/, 'two positive examples: double and double then abs both fit');
  assert.match(synthesize([{ args: ['a'], want: 1 }]).refuse, /fewer than two/);
  assert.ok(PRIMITIVES.length >= 40);
  const amb = await codeNative('Write a JavaScript function named g(n) where g(2) returns 4 and g(5) returns 10.', { explain: true });
  assert.ok(amb.refused && /ambiguous/.test(amb.refused), amb.refused);
});

test('each of the five kinds has a prompt the readers refuse', async () => {
  const REFUSE = {
    code: 'Write a JavaScript function that returns the sum of the even numbers greater than 10 in an array.',
    'code-reading': "What does this Python print: print(len('hello'))",
    sql: 'Write a SQL query that joins orders and customers on customer_id.',
    command: 'What command deletes every file in the directory except the hidden ones?',
    format: 'Write the date 2026-02-30 in the format DD/MM/YYYY.',
  };
  for (const k of KINDS) {
    assert.equal(await codeNative(REFUSE[k]), null, k + ' refused');
    const why = await codeNative(REFUSE[k], { explain: true });
    assert.equal(typeof why.refused, 'string', k + ' says why');
  }
  // the words a complete read may not leave: a quantity asked of an operation that returns a list
  assert.equal(await codeNative('Write a function that returns the number of unique elements in an array.'), null);
  assert.equal(await codeNative('Write a Rust function that reverses a string.'), null, 'a language the reader does not write');
  assert.equal(await codeNative('Write a function named secondLargest(arr) that returns the second largest number in an array.'), null, 'distinct or not is not said');
});

test('THE RUN-BEFORE-ANSWER RULE: a planted wrong entry is never answered when the prompt states an example it fails', async () => {
  const real = byId('reverse-string');
  const planted = Object.freeze({ ...real, id: 'planted-wrong-reverse', js: ([s]) => [`return ${s};`], py: ([s]) => [`return ${s}`] });
  const catalogue = [planted];
  const plain = 'Write a JavaScript function named rev(s) that returns the string reversed.';
  const stated = 'Write a JavaScript function named rev(s) that returns the string reversed, so rev("ab") returns "ba".';
  const a = await codeNative(plain, { catalogue });
  assert.ok(a, 'with no example the planted entry is read and answered (the reader cannot know)');
  assert.equal(a.method, 'spec-reader:planted-wrong-reverse');
  assert.match(a.answer, /return s;/);
  assert.equal(await codeNative(stated, { catalogue }), null, 'with an example the planted entry fails it in act/run.mjs and is refused');
  const why = await codeNative(stated, { catalogue, explain: true });
  assert.match(why.refused, /failed a stated example/);
  const good = await codeNative(stated);
  assert.ok(good && good.method === 'spec-reader:reverse-string', 'the real catalogue passes the same example');
});

test('code reading runs JavaScript in act/run.mjs and refuses every other language', async () => {
  const cases = [
    ["What does this JavaScript print: console.log(2 + '2')", '22'],
    ['What will this JavaScript print: const a = [1, 2, 3]; console.log(a.length)', '3'],
    ['What is the value of total after this JavaScript runs: let total = 0; for (let i = 1; i <= 4; i++) total += i;', '10'],
    ['What does the JavaScript expression 0.1 + 0.2 === 0.3 evaluate to?', 'false'],
    ['What does typeof [] return in JavaScript?', 'object'],
    ['What does this JavaScript function return for the input 6: function f(n) { return n < 2 ? n : f(n - 1) + f(n - 2); }', '8'],
  ];
  for (const [p, want] of cases) {
    const a = await codeNative(p);
    assert.ok(a, p);
    assert.equal(a.kind, 'code-reading');
    assert.equal(a.answer, want, p);
    assert.equal(a.text.split('\n').pop(), want, 'the value alone on the last line');
  }
  assert.equal(await codeNative('What does this Ruby print: puts 1 + 1'), null);
  assert.equal(await codeNative('What does this JavaScript print: console.log(Math.random())'), null, 'a value that is not a function of the text');
  assert.equal(await codeNative('What does this JavaScript print: console.log(undefinedName)'), null, 'an error is not a value');
});

test('the sql, command and format readers answer what they read and refuse what they do not', async () => {
  const yes = [
    ['Write a SQL query that returns the 3 most expensive products from the products table by price.', 'SELECT * FROM products ORDER BY price DESC LIMIT 3;'],
    ["Write a SQL query that updates the status to 'shipped' for the order with id 12 in the orders table.", "UPDATE orders SET status = 'shipped' WHERE id = 12;"],
    ['Write a SQL query that counts the rows in the orders table.', 'SELECT COUNT(*) FROM orders;'],
    ['What command shows the last 20 lines of a file named app.log?', 'tail -n 20 app.log'],
    ['How do I install the package express with npm?', 'npm install express'],
    ['Write 2026-12-25 as MM/DD/YYYY.', '12/25/2026'],
    ["Convert 'hello world again' to snake case.", 'hello_world_again'],
    ['Write 1999 in words.', 'one thousand nine hundred ninety-nine'],
  ];
  for (const [p, want] of yes) {
    const a = await codeNative(p);
    assert.ok(a, p);
    assert.equal(a.answer, want, p);
  }
  for (const p of ['How do I make a cake?', 'How do I fix my git merge conflict?', 'Write a SQL query that selects the users who signed up last week.']) {
    assert.equal(await codeNative(p), null, p);
  }
  assert.equal(codeNativeShape('Write a poem about the sea.'), null);
  assert.equal(codeNativeShape('Write a JavaScript function named f(x) that returns x.'), 'code');
});

test('the literal parser reads what a prompt states and never executes it', () => {
  assert.deepEqual(parseValue("[1, 'a', [true, null], {k: 2}]").value, [1, 'a', [true, null], { k: 2 }]);
  assert.equal(parseValue('True').value, true);
  assert.equal(parseValue('process.exit(1)').ok, false);
});

test('the verdict has the board shape, built from a small real run of the bench functions', async () => {
  const buf = readFileSync(HELDOUT_FILE);
  assert.equal(createHash('sha256').update(buf).digest('hex'), HELDOUT_SHA256, 'the held-out file is the one pinned before the readers');
  const census = loadPrompts().prompts;
  const devRows = census.filter((r) => KINDS.includes(r.kind)).filter((_r, i) => i % 7 === 0);
  const controlRows = census.filter((r) => !KINDS.includes(r.kind)).slice(0, 12);
  const dev = await gradePopulation(devRows, 'development');
  const control = await runControl(controlRows);
  assert.equal(control.answered, 0, 'the control answers none of ' + controlRows.length);
  const at = new Date().toISOString();
  const tests = { command: 'node --test test/code-native.test.mjs test/act-prompt.test.mjs', exitCode: 0, tally: ['# pass 1', '# fail 0'], pass: 1, fail: 0, tests: 1, ok: true };
  const v = buildVerdict({ at, dev, held: dev, control, tests, heldOut: { sha256: HELDOUT_SHA256 }, contamination: 'shape test', codeSha256: 'x', firstHeldOutRun: { at, codeSha256: 'x' } });
  assert.match(v.at, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.equal(v.command, COMMAND);
  assert.equal(v.node, process.version);
  assert.equal(v.isTheBar, true);
  assert.equal(typeof v.barMet, 'boolean');
  for (const k of ['heldOutShare', 'heldOutCodeShare', 'devWrong', 'control', 'tests']) assert.equal(typeof v.bar.checks[k], 'boolean', k);
  assert.equal(v.bar.devWrongMax, BAR.devWrongMax);
  assert.equal(v.split.heldOut.sha256, HELDOUT_SHA256);
  assert.equal(typeof v.split.heldOut.contaminated, 'string');
  assert.ok(v.split.heldOut.written);
  for (const pop of [v.development, v.heldOut]) {
    for (const k of KINDS) for (const f of ['asked', 'answered', 'correct', 'wrong', 'refused']) assert.equal(typeof pop.byKind[k][f], 'number', k + ' ' + f);
    assert.equal(pop.total.asked, pop.total.answered + pop.total.refused);
    assert.equal(pop.total.answered, pop.total.correct + pop.total.wrong);
  }
  assert.ok(Array.isArray(v.wrongRows));
  assert.equal(typeof v.ns.development.median, 'number');
  assert.equal(typeof v.control.answered, 'number');
  assert.equal(typeof v.statement, 'string');
  assert.ok(!v.statement.includes('\u2014'), 'no em-dash');
  assert.equal(quantile([5, 1, 3, 2, 4], 0.5), 3);
  assert.equal(quantile([], 0.5), null);
});
