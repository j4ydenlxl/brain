// test/developers.test.mjs: the developers bar (bench/developers.mjs), board 32 item developers.
// The block parser on a fixture string, the prints comparison and the answer checks on fixed strings
// (a planted wrong answer line, a planted wrong JSON field and an error body must fail), the argv
// splitter's refusals, the model-off rule, the sources check against the real verdict files with
// planted wrong numbers ("3 of 5" where the file says 4 of 5), the quotes check with planted quotes,
// the claims check with planted claims, the README's library example run from a scratch file, a mutant
// run of the whole bar on planted document texts (it must not be met), and the verdict's shape after
// one bar run written to a scratch path (the committed verdict is never touched by the tests). Model
// OFF throughout: every child runs with the model variable names removed, every ask is provider null.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ROOT, DOCS, RUNNABLE, BOARD_FILES, parseBlocks, expectationOf, firstLine, compare, splitArgv,
  rewriteImports, tablesAfter, quotesIn, valueAt, jsonEquals, numberTokens, numberMatches, plantNumber, plantValue,
  checkAnswer, requiresAnswer, modelOff, checkSources, checkQuotes, checkClaims, runBar,
} from '../bench/developers.mjs';

const TMP_PARENT = process.env.BRAIN_SCRATCH || os.tmpdir();
const EM_DASH = String.fromCharCode(0x2014);
function childEnv(stateDir) {
  const env = { ...process.env };
  for (const k of ['BRAIN_LLM_BASE', 'BRAIN_LLM_KEY', 'BRAIN_LLM_MODEL', 'VERCEL_OIDC_TOKEN', 'BRAIN_SOLVED', 'FORCE_COLOR']) delete env[k];
  env.NO_COLOR = '1';
  env.BRAIN_STATE_DIR = stateDir;
  return env;
}
const readDocs = () => DOCS.map((f) => ({ file: f, text: fs.readFileSync(path.join(ROOT, f), 'utf8') }));
const VISION = fs.readFileSync(path.join(ROOT, 'docs', 'VISION.md'), 'utf8');

const FIXTURE = [
  '# title',
  '',
  '```bash',
  'node bin/brain.mjs ask x "hey" --provider null',
  '```',
  '<!-- prints: ask x  abc  3 chars -->',
  '<!-- needs: tools/a.mjs -->',
  '<!-- needs: tools/b.mjs -->',
  '<!-- line: route direct  provenance native -->',
  '<!-- line: second  line -->',
  '<!-- line-matches: ^a \\d+ b$ -->',
  '',
  '```js',
  "import { ask } from './act/prompt.mjs';",
  '```',
  '<!-- file: example.mjs -->',
  '',
  '```bash',
  'npm pack ../brain',
  '```',
  'a prose line ends the directives',
  '<!-- prints: never attached -->',
  '',
  '```bash',
  'curl -s https://example.invalid',
  '```',
  '<!-- prints-json: text -->',
  '<!-- prints-json: other -->',
  '<!-- json: exact.answer = 391 -->',
  '<!-- cwd: fresh -->',
].join('\n');

// the real outputs of two documented asks (bin/brain.mjs with NO_COLOR, and the site's POST)
const CLI_391 = [
  'ask dev  c2fc4240bc023880  19 chars',
  '------------------------------------------------------------------------',
  'answered exactly by exact.arith, with no model and no network.',
  '- read "what is 17 times 23" as 17 * 23',
  '391',
  '------------------------------------------------------------------------',
  'answered from memory  memory hits 0  web pages 0  llm null/- 0.00ms  exact 1594400 ns',
  'route direct  provenance exact',
  'cites: (none)',
].join('\n');
const JSON_391 = '{"ok":true,"text":"answered exactly by exact.arith, with no model and no network.\\n391","from":"exact","route":"direct","provenance":{"answer":"exact","method":"exact.arith"},"exact":{"answer":"391"},"native":null,"llm":{"provider":null},"footer":["text","from"],"promptHash":"c2fc4240bc023880"}';
const ERROR_BODY = '{"ok":false,"text":"prompt too long","error":"413"}';
const blockWith = (d) => ({ directives: { line: [], 'line-matches': [], 'store-line': [], 'no-store-line': [], json: [], needs: [], ...d } });

test('parseBlocks reads fences, languages, directives, repeated directives and the lines they end on', () => {
  const b = parseBlocks(FIXTURE);
  assert.equal(b.length, 4);
  assert.deepEqual(b.map((x) => x.lang), ['bash', 'js', 'bash', 'bash']);
  assert.equal(b[0].code, 'node bin/brain.mjs ask x "hey" --provider null');
  assert.equal(b[0].line, 3);
  assert.equal(b[0].directives.prints, 'ask x  abc  3 chars', 'a prints value keeps its inner double spaces');
  assert.deepEqual(b[0].directives.needs, ['tools/a.mjs', 'tools/b.mjs']);
  assert.deepEqual(b[0].directives.line, ['route direct  provenance native', 'second  line'], 'line repeats and keeps its inner spaces');
  assert.deepEqual(b[0].directives['line-matches'], ['^a \\d+ b$']);
  assert.equal(b[1].directives.file, 'example.mjs');
  assert.equal(b[2].directives.prints, undefined, 'a prose line between the fence and a directive detaches it');
  assert.equal(expectationOf(b[2]), null);
  assert.equal(b[3].directives['prints-json'], 'text');
  assert.deepEqual(b[3].unknown, ['duplicate prints-json']);
  assert.deepEqual(b[3].directives.json, ['exact.answer = 391']);
  assert.equal(b[3].directives.cwd, 'fresh', 'a directive after a duplicate is still read');
  assert.deepEqual(expectationOf(b[0]), { kind: 'prints', value: 'ask x  abc  3 chars' });
});

test('compare: exact, regex, json field, ANSI, CRLF, the first non-empty line, and every failure', () => {
  assert.deepEqual(compare({ kind: 'prints', value: 'hello  world' }, 'hello  world\nsecond\n'), { ok: true, expected: 'hello  world', got: 'hello  world' });
  const miss = compare({ kind: 'prints', value: 'hello world' }, 'hello  world\n');
  assert.equal(miss.ok, false, 'one space of difference fails');
  assert.equal(miss.got, 'hello  world');
  assert.equal(compare({ kind: 'prints', value: 'initialized dilation  seed=basic (planted)' }, 'initialized dilation  seed=basic\n').ok, false);
  assert.equal(compare({ kind: 'prints', value: 'x' }, '\u001b[1mx\u001b[0m  \r\nmore').ok, true, 'ANSI and trailing space are stripped');
  assert.equal(compare({ kind: 'prints', value: 'first' }, '\n\n   \r\nfirst\r\nsecond').got, 'first');
  assert.equal(compare({ kind: 'prints-matches', value: '^brain-\\d+\\.\\d+\\.\\d+\\.tgz$' }, 'brain-0.1.0.tgz\n').ok, true);
  assert.equal(compare({ kind: 'prints-matches', value: '^brain-\\d+\\.\\d+\\.\\d+\\.tgz$' }, 'npm notice brain-0.1.0.tgz\n').ok, false);
  const bad = compare({ kind: 'prints-matches', value: '(' }, 'anything');
  assert.equal(bad.ok, false);
  assert.match(bad.got, /does not compile/);
  assert.equal(compare({ kind: 'prints-json', value: 'text' }, '{"ok":true,"text":"hi"}\n').ok, true);
  assert.equal(compare({ kind: 'prints-json', value: 'text' }, '{"ok":true,"text":7}').ok, false, 'the field must be a string');
  assert.equal(compare({ kind: 'prints-json', value: 'text' }, '<html>').ok, false, 'not JSON fails');
  assert.equal(compare({ kind: 'prints-json', value: 'text' }, '["text"]').ok, false, 'an array is not an object');
  assert.equal(compare(null, 'anything').ok, false, 'a block with no stated output fails');
  assert.equal(compare({ kind: 'prints', value: 'x' }, '').got, '');
  assert.equal(firstLine('\n  \nA  \n'), 'A');
});

test('checkAnswer: the answer, not the header; a planted wrong answer, a planted JSON field and an error body fail', () => {
  const header = compare({ kind: 'prints', value: 'ask dev  c2fc4240bc023880  19 chars' }, CLI_391);
  assert.equal(header.ok, true);
  const right = blockWith({ line: ['answered exactly by exact.arith, with no model and no network.', '391', 'route direct  provenance exact'], 'line-matches': ['^answered from memory  memory hits 0  web pages 0  llm null/- '] });
  const r = checkAnswer(right, CLI_391);
  assert.equal(r.ok, true, JSON.stringify(r.failed));
  assert.equal(r.checked, 4);
  // the same header with a different answer: the header passes, the answer check does not
  const wrongOut = CLI_391.replace('\n391\n', '\n392\n');
  assert.equal(compare({ kind: 'prints', value: 'ask dev  c2fc4240bc023880  19 chars' }, wrongOut).ok, true, 'the header depends only on the prompt');
  assert.equal(checkAnswer(right, wrongOut).ok, false, 'a wrong answer under the right header fails');
  assert.equal(checkAnswer(blockWith({ line: ['392'] }), CLI_391).ok, false, 'a planted wrong answer line fails');
  assert.equal(checkAnswer(blockWith({ line: ['route direct  provenance native'] }), CLI_391).ok, false, 'a planted wrong provenance fails');
  assert.equal(checkAnswer(blockWith({ line: ['39'] }), CLI_391).ok, false, 'a line is whole, not a substring');
  assert.equal(checkAnswer(blockWith({ 'line-matches': ['('] }), CLI_391).ok, false, 'a regex that does not compile fails');
  // store-line and no-store-line: only the case that holds is checked; the other is recorded as not exercised
  const cond = blockWith({ 'store-line': ['391'], 'no-store-line': ['not printed'] });
  const withStore = checkAnswer(cond, CLI_391, { storeReady: true });
  assert.equal(withStore.ok, true);
  assert.equal(withStore.checked, 1);
  assert.equal(withStore.notExercised.length, 1);
  assert.equal(checkAnswer(cond, CLI_391, { storeReady: false }).ok, false, 'without the store the no-store line is checked and missing');
  // JSON fields: the answer 391 and the provider, and an error body with a text field passes prints-json but not these
  const j = blockWith({ json: ['ok = true', 'provenance.answer = exact', 'exact.answer = 391', 'llm.provider = null', 'native = null', 'footer = text,from'] });
  assert.equal(checkAnswer(j, JSON_391).ok, true, JSON.stringify(checkAnswer(j, JSON_391).failed));
  assert.equal(checkAnswer(blockWith({ json: ['exact.answer = 392'] }), JSON_391).ok, false, 'a planted wrong JSON answer fails');
  assert.equal(checkAnswer(blockWith({ json: ['llm.provider = ollama'] }), JSON_391).ok, false);
  assert.equal(checkAnswer(blockWith({ json: ['footer = text'] }), JSON_391).ok, false, 'an array is compared whole');
  assert.equal(checkAnswer(blockWith({ json: ['exact = 391'] }), JSON_391).ok, false, 'an object is never equal to a scalar');
  assert.equal(compare({ kind: 'prints-json', value: 'text' }, ERROR_BODY).ok, true, 'an error body has a text field');
  assert.equal(checkAnswer(j, ERROR_BODY).ok, false, 'and fails the answer fields');
  assert.equal(checkAnswer(blockWith({ json: ['no spaces'] }), JSON_391).ok, false, 'not PATH = VALUE fails');
  assert.equal(checkAnswer(j, '<html>').ok, false, 'not JSON fails');
});

test('requiresAnswer and modelOff: an ask must state its answer and must keep the model off', () => {
  const b = parseBlocks(FIXTURE);
  assert.equal(requiresAnswer(b[0], splitArgv(b[0].code).argv), 'line');
  assert.equal(requiresAnswer(b[3], splitArgv(b[3].code).argv), 'json');
  assert.equal(requiresAnswer({ directives: { prints: 'x' } }, ['node', 'bin/brain.mjs', 'init', 'dev']), null);
  assert.equal(requiresAnswer({ directives: { prints: 'x' } }, ['node', 'node_modules/brain/bin/brain.mjs', 'ask', 'dev', 'hey']), 'line');
  assert.equal(modelOff(['node', 'bin/brain.mjs', 'ask', 'dev', 'hey', '--provider', 'null']).ok, true);
  assert.equal(modelOff(['node', 'bin/brain.mjs', 'ask', 'dev', 'hey', '--provider', 'env']).ok, true);
  assert.equal(modelOff(['node', 'bin/brain.mjs', 'ask', 'dev', 'hey']).ok, false, 'no provider probes a local Ollama');
  assert.equal(modelOff(['node', 'bin/brain.mjs', 'ask', 'dev', 'hey', '--provider', 'ollama']).ok, false);
});

test('splitArgv follows the shell for quotes and continuations and refuses what needs a shell', () => {
  assert.deepEqual(splitArgv('node bin/brain.mjs ask dilation "hey"').argv, ['node', 'bin/brain.mjs', 'ask', 'dilation', 'hey']);
  assert.deepEqual(splitArgv('curl -s -X POST https://dilation.dev/api/ask -H "content-type: application/json" -d \'{"prompt":"hey"}\'').argv,
    ['curl', '-s', '-X', 'POST', 'https://dilation.dev/api/ask', '-H', 'content-type: application/json', '-d', '{"prompt":"hey"}']);
  assert.deepEqual(splitArgv('node a.mjs \\\n  --x "a \\"b\\""').argv, ['node', 'a.mjs', '--x', 'a "b"']);
  assert.deepEqual(splitArgv('node a.mjs ""').argv, ['node', 'a.mjs', '']);
  for (const bad of ['node a.mjs | head', 'node a.mjs > out', 'node a.mjs; node b.mjs', 'node a.mjs && x', 'echo $HOME', 'node "$HOME"', 'ls *.mjs', 'node "unclosed']) {
    assert.equal(splitArgv(bad).argv, null, bad);
    assert.equal(typeof splitArgv(bad).error, 'string');
  }
  assert.equal(splitArgv('node a.mjs\nnode b.mjs').argv, null, 'one command per block');
});

test('paths, numbers and plants: valueAt, jsonEquals, numberTokens, numberMatches, plantNumber, plantValue', () => {
  const o = { a: { b: [1, 2, 3] }, rows: [{ ok: true }, { ok: false }, { ok: true }], n: 3, s: '7', z: null };
  assert.deepEqual(valueAt(o, 'a.b.length'), { ok: true, value: 3 });
  assert.deepEqual(valueAt(o, 'a.b.1'), { ok: true, value: 2 });
  assert.deepEqual(valueAt(o, 'rows[ok=true].length'), { ok: true, value: 2 });
  assert.deepEqual(valueAt(o, 'rows[ok=false].length'), { ok: true, value: 1 });
  assert.equal(valueAt(o, 'a.c').ok, false);
  assert.equal(valueAt(o, 'z.y').ok, false);
  assert.equal(valueAt(o, 'n[ok=true]').ok, false, 'a filter on a non-array fails');
  assert.equal(valueAt(o, 'a..b').ok, false);
  assert.equal(jsonEquals(null, 'null'), true);
  assert.equal(jsonEquals(undefined, 'null'), false);
  assert.equal(jsonEquals(false, 'false'), true);
  assert.equal(jsonEquals(['a', 'b'], 'a,b'), true);
  assert.equal(jsonEquals({ a: 1 }, '[object Object]'), false);
  assert.deepEqual(numberTokens('4 of 5'), ['4', '5']);
  assert.deepEqual(numberTokens('+6.15 percent'), ['+6.15']);
  assert.deepEqual(numberTokens('236 files, 1,717,617 bytes'), ['236', '1717617']);
  assert.deepEqual(numberTokens('-0.6 day-2'), ['-0.6', '2']);
  assert.equal(numberMatches('100.92', 100.9205858), true);
  assert.equal(numberMatches('100.93', 100.9205858), false);
  assert.equal(numberMatches('4', 4), true);
  for (const wrong of ['3', '5', '0', '1']) assert.equal(numberMatches(wrong, 4), false, wrong + ' is not 4');
  assert.equal(numberMatches('+6.15', 6.15), true);
  assert.equal(numberMatches('6.15', -6.15), false);
  assert.equal(numberMatches('-0.6', -0.6), true);
  assert.equal(numberMatches('7', '7'), true, 'a numeric string field');
  assert.equal(numberMatches('7', 'seven'), false);
  assert.equal(numberMatches('7', null), false);
  assert.equal(plantNumber('4 of 5', 0), '3 of 5');
  assert.equal(plantNumber('4 of 5', 1), '4 of 4');
  assert.equal(plantNumber('+6.15 percent', 0), '+5.15 percent');
  assert.equal(plantNumber('0 of 5', 0), '1 of 5');
  assert.equal(plantValue('391'), '390');
  assert.equal(plantValue('greeting'), 'greeting planted');
});

test('checkSources: the documents pass; every wrong count the old check accepted now fails', () => {
  const real = checkSources(readDocs());
  assert.ok(real.rows >= 8, 'the documents carry sources rows (' + real.rows + ')');
  assert.equal(real.failed.length, 0, JSON.stringify(real.failed));
  assert.equal(real.numbers >= real.rows, true, 'every row states at least one number');
  const head = '<!-- sources -->\n| what | number | verdict file | field | at |\n| --- | --- | --- | --- | --- |\n';
  const row = (num, file, fields, at = '`x`') => head + '| w | ' + num + ' | `' + file + '` | ' + fields + ' | ' + at + ' |\n';
  const one = (text) => checkSources([{ file: 't', text }]);
  const install = '`prompts[answered=true].length`, `prompts.length`';
  // the verify plane measured the old digit search accepting 0, 1, 3 and 5 for install.json
  const truth = JSON.parse(fs.readFileSync(path.join(ROOT, 'bench', 'verdicts', 'install.json'), 'utf8'));
  const answered = truth.prompts.filter((p) => p.answered).length;
  assert.equal(one(row(answered + ' of ' + truth.prompts.length, 'bench/verdicts/install.json', install)).failed.length, 0);
  for (const k of [0, 1, 2, 3, 4, 5].filter((x) => x !== answered)) {
    assert.equal(one(row(k + ' of ' + truth.prompts.length, 'bench/verdicts/install.json', install)).failed.length, 1, k + ' of ' + truth.prompts.length + ' must fail');
  }
  // and 0, 1 and 4 for site-probe.json
  const probe = JSON.parse(fs.readFileSync(path.join(ROOT, 'bench', 'verdicts', 'site-probe.json'), 'utf8'));
  assert.equal(one(row(probe.ok + ' of ' + probe.n, 'bench/verdicts/site-probe.json', '`ok`, `n`')).failed.length, 0);
  for (const k of [0, 1, 2, 3, 4, 5].filter((x) => x !== probe.ok)) {
    assert.equal(one(row(k + ' of ' + probe.n, 'bench/verdicts/site-probe.json', '`ok`, `n`')).failed.length, 1, k + ' of ' + probe.n + ' must fail');
  }
  assert.equal(one(row(probe.ok + ' of ' + probe.n, 'bench/verdicts/site-probe.json', '`ok`')).failed.length, 1, 'one field per number');
  assert.equal(one(row(probe.ok + ' of ' + probe.n, 'bench/verdicts/site-probe.json', '`n`, `ok`')).failed.length, 1, 'fields in order');
  assert.equal(one(row('2', 'bench/verdicts/site-probe.json', '`absentField`')).failed.length, 1, 'a field that is not there fails');
  assert.equal(one(row('2', 'bench/verdicts/no-such-verdict.json', '`ok`')).failed.length, 1, 'an unreadable file fails');
  assert.equal(one(row('none', 'bench/verdicts/site-probe.json', '`ok`')).failed.length, 1, 'a row with no number fails');
  assert.equal(one(head + '| w | 2 | `bench/verdicts/site-probe.json` | `x` |\n').failed.length, 1, 'a row of four cells fails');
  const stale = one(row(probe.ok + ' of ' + probe.n, 'bench/verdicts/site-probe.json', '`ok`, `n`', '`2000-01-01T00:00:00.000Z`'));
  assert.equal(stale.failed.length, 0);
  assert.equal(stale.stale.length, 1, 'an old at is reported stale');
});

test('checkQuotes: his words pass; an altered, an invented and an overlong quote fail', () => {
  const real = checkQuotes(readDocs(), VISION);
  assert.ok(real.checked > 0);
  assert.equal(real.failed.length, 0, JSON.stringify(real.failed));
  const q = (t) => checkQuotes([{ file: 't', text: t }], VISION);
  assert.equal(q('he wrote "and for developesr all across"').failed.length, 0);
  assert.equal(q('he wrote "and for developers all across"').failed.length, 1, 'a corrected spelling is not his words');
  assert.equal(q('he wrote "and for developesr all across planted"').failed.length, 1);
  assert.equal(q('he wrote "a sentence he never wrote"').failed.length, 1);
  const line = VISION.split(/\r?\n/).filter((l) => !/["`<>|]/.test(l)).map((l) => l.trim().split(' ').slice(0, 15).join(' ')).find((w) => w.split(' ').length === 15 && VISION.includes(w) && !/\s{2}/.test(w));
  assert.ok(line, 'docs/VISION.md has a 15 word span to plant');
  const long = q('he wrote "' + line + '"');
  assert.equal(long.failed.length, 1);
  assert.match(long.failed[0].why, /15 words, the rule is under 15/);
});

test('checkClaims: the documents hold; planted wrong answers, kinds and misses fail (provider null)', { timeout: 60_000 }, async () => {
  const head = '<!-- claims: no-store -->\n| prompt | provenance | answer or kind |\n| --- | --- | --- |\n';
  const rows = [
    ['what is 17 times 23', 'exact', '391', true],
    ['what is 17 times 23', 'exact', '392', false],
    ['hey', 'native', 'greeting', true],
    ['hey', 'native', 'farewell', false],
    ['bye', 'native', 'greeting', false],
    ['hey', 'miss', 'none', false],
    ['write a haiku about rain', 'miss', 'none', true],
    ['write a haiku about rain', 'exact', 'planted', false],
    ['2*x+3=11', 'exact', '4', true],
    ['2*x+3=11', 'program', '4', false],
    ['hey', 'nonsense', 'x', false],
  ];
  const text = head + rows.map(([p, w, v]) => '| `' + p + '` | `' + w + '` | `' + v + '` |').join('\n') + '\n';
  const r = await checkClaims([{ file: 't', text }]);
  assert.equal(r.noStore.checked, rows.length);
  assert.deepEqual(r.rows.map((x) => x.ok), rows.map((x) => x[3]), JSON.stringify(r.rows.map((x) => [x.prompt, x.want, x.value, x.ok])));
  assert.equal(r.noStore.failed.length, rows.filter((x) => !x[3]).length);
  const real = await checkClaims(readDocs());
  assert.ok(real.noStore.checked >= 10, 'the documents carry no-store claims');
  assert.equal(real.noStore.failed.length, 0, JSON.stringify(real.noStore.failed));
  assert.equal(real.store.failed.length, 0, JSON.stringify(real.store.failed));
  assert.ok(real.store.withoutStore > 0, 'the store claims are asked without the store');
});

test('tables and quotes: the helpers the claims, sources and quotes checks stand on', () => {
  const t = tablesAfter('x\n<!-- claims: store -->\n| a | b |\n| --- | --- |\n| `p` | `q` |\n| `r` | `s` |\n\ntext', 'claims');
  assert.equal(t.length, 1);
  assert.equal(t[0].arg, 'store');
  assert.deepEqual(t[0].rows.map((r) => r.cells), [['`p`', '`q`'], ['`r`', '`s`']]);
  const q = quotesIn('he said "a pro at everything" and `"not this"`\n```\n"nor this"\n```\n<!-- "nor" -->');
  assert.deepEqual(q.map((x) => x.text), ['a pro at everything']);
});

test('every runnable block in both documents states its first line, and every ask states its answer with the model off', () => {
  let runnable = 0, asks = 0;
  for (const f of DOCS) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.equal(text.includes(EM_DASH), false, f + ' has no em-dash');
    for (const b of parseBlocks(text)) {
      if (b.lang !== 'bash' || !RUNNABLE.includes(b.code.trim().split(/\s+/)[0])) continue;
      runnable++;
      assert.notEqual(expectationOf(b), null, f + ':' + b.line + ' states what it prints');
      const sp = splitArgv(b.code);
      assert.equal(sp.error, null, f + ':' + b.line + ' runs without a shell');
      for (const n of b.directives.needs) assert.ok(BOARD_FILES.includes(n), f + ':' + b.line + ' needs only a board file, ' + n);
      const need = requiresAnswer(b, sp.argv);
      if (need === 'line') {
        asks++;
        assert.equal(modelOff(sp.argv).ok, true, f + ':' + b.line + ' names --provider null or env');
        const always = b.directives.line.length + b.directives['line-matches'].length;
        const bothCases = b.directives['store-line'].length > 0 && b.directives['no-store-line'].length > 0;
        assert.ok(always > 0 || bothCases, f + ':' + b.line + ' states an answer line that holds with and without the store');
      }
      if (need === 'json') { asks++; assert.ok(b.directives.json.length > 0, f + ':' + b.line + ' checks JSON fields'); }
    }
  }
  assert.ok(runnable >= 10, 'the documents hold the runnable blocks the bar runs (found ' + runnable + ')');
  assert.ok(asks >= 7, 'the documents hold the asks the bar checks the answers of (found ' + asks + ')');
});

test('the README library example runs from a scratch file and prints its stated first line', () => {
  const text = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  const blocks = parseBlocks(text);
  const ex = blocks.find((b) => b.lang === 'js' && b.directives.file === 'example.mjs');
  assert.ok(ex, 'README carries the js example');
  const runner = blocks.find((b) => b.lang === 'bash' && b.code.trim() === 'node example.mjs');
  assert.ok(runner, 'README runs it');
  const rw = rewriteImports(ex.code);
  assert.equal(rw.rewrote, 2);
  assert.equal(rw.code.includes("'./"), false);
  const dir = fs.mkdtempSync(path.join(TMP_PARENT, 'developers-test-'));
  try {
    const file = path.join(dir, 'example.mjs');
    fs.writeFileSync(file, rw.code + '\n');
    const r = spawnSync(process.execPath, [file], { cwd: dir, env: childEnv(path.join(dir, 'state')), encoding: 'utf8', timeout: 50_000, windowsHide: true });
    assert.equal(r.status, 0, r.stderr);
    const c = compare(expectationOf(runner), r.stdout);
    assert.equal(c.got, 'direct native');
    assert.equal(c.ok, true);
    assert.equal(checkAnswer(runner, r.stdout).ok, true, 'the answer line under the example');
    assert.match(r.stdout, /Dilation/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('a mutant run of the whole bar on planted texts is not met, and names each planted error', { timeout: 90_000 }, async () => {
  const [readme, dev] = readDocs().map((d) => d.text);
  const plant = (s, a, b) => { assert.ok(s.includes(a), 'the plant site exists: ' + a); return s.replace(a, b); };
  let r = plant(readme, '<!-- prints: 0.1.0 -->', '<!-- prints: 0.1.1 -->');
  r = plant(r, '| 4 of 5 |', '| 3 of 5 |');
  r = plant(r, '"and for developesr all across"', '"and for developers all across"');
  let d = plant(dev, '| `bye` | `native` | `farewell` |', '| `bye` | `native` | `greeting` |');
  d = plant(d, '<!-- line: 391 -->', '<!-- line: 392 -->');
  d = plant(d, '<!-- json: exact.answer = 391 -->', '<!-- json: exact.answer = 392 -->');
  const dir = fs.mkdtempSync(path.join(TMP_PARENT, 'developers-mutant-'));
  try {
    const v = await runBar({ docTexts: { 'README.md': r, 'docs/DEVELOPERS.md': d }, write: false, scratch: dir, log: () => {} });
    assert.equal(v.barMet, false);
    assert.deepEqual(v.planted, ['README.md', 'docs/DEVELOPERS.md']);
    for (const k of ['failedZero', 'claimsHold', 'sourcesHold', 'quotesHold']) assert.equal(v.conditions[k], false, k + ' is unmet');
    const failed = v.docs.flatMap((x) => x.failed.map((f) => x.file + ' ' + f.cmd + ' | ' + f.expected + ' | ' + f.got));
    assert.ok(failed.some((f) => f.includes('--version') && f.includes('0.1.1')), 'the planted version line: ' + failed.join('\n'));
    assert.ok(failed.some((f) => f.includes('what is 17 times 23" --provider null') && f.includes('line 392')), 'the planted CLI answer');
    assert.ok(failed.some((f) => f.includes('curl') && f.includes('exact.answer = 392')), 'the planted JSON answer');
    assert.equal(v.docs.reduce((a, x) => a + x.failed.length, 0), 3, 'exactly the three planted blocks failed');
    assert.deepEqual(v.claims.noStore.failed.map((f) => f.prompt), ['bye']);
    assert.ok(v.sources.failed.some((f) => /3 is not prompts\[answered=true\]\.length/.test(f.got)), JSON.stringify(v.sources.failed));
    assert.deepEqual(v.quotes.failed.map((f) => f.quote), ['and for developers all across']);
    assert.equal(fs.readdirSync(dir).filter((n) => n.startsWith('developers-')).length, 0, 'the bar removed its scratch directory');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('one bar run writes a verdict of the stated shape, and its statement quotes only printed numbers', { timeout: 90_000 }, () => {
  const dir = fs.mkdtempSync(path.join(TMP_PARENT, 'developers-bar-'));
  try {
    const out = path.join(dir, 'v.json');
    const r = spawnSync(process.execPath, [path.join(ROOT, 'bench', 'developers.mjs'), '--out', out, '--scratch', dir],
      { cwd: ROOT, env: childEnv(path.join(dir, 'state')), encoding: 'utf8', timeout: 88_000, windowsHide: true });
    assert.ok(r.status === 0 || r.status === 1, 'the bar exits 0 (met) or 1 (not met), got ' + r.status + ' ' + r.stderr);
    const v = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.equal(v.isTheBar, true);
    assert.equal(v.command, 'node bench/developers.mjs');
    assert.equal(v.node, process.version);
    assert.equal(typeof v.barMet, 'boolean');
    assert.equal(r.status, v.barMet ? 0 : 1, 'the exit code is the verdict');
    assert.equal(v.barMet, Object.values(v.conditions).every(Boolean));
    assert.ok(!Number.isNaN(Date.parse(v.at)));
    assert.deepEqual(v.docs.map((d) => d.file), ['README.md', 'docs/DEVELOPERS.md']);
    for (const d of v.docs) {
      assert.ok(d.blocks > 0 && d.ran > 0, d.file + ' ran blocks');
      assert.ok(d.passed <= d.ran && d.passed + d.failed.length >= d.ran, d.file + ': every ran block passed or failed');
      assert.equal(v.runs.filter((x) => x.doc === d.file).length, d.ran, d.file + ': one run record per ran block');
      assert.equal(d.asWritten + d.adapted, d.ran, d.file + ': every run is as written or adapted');
      for (const f of d.failed) assert.deepEqual(Object.keys(f).sort(), ['cmd', 'expected', 'got']);
      for (const s of d.skipped) assert.deepEqual(Object.keys(s).sort(), ['cmd', 'reason']);
    }
    assert.equal(v.totals.ran, v.docs.reduce((a, d) => a + d.ran, 0));
    assert.equal(v.totals.adapted, v.runs.filter((x) => x.asWritten === false).length, 'the adapted runs are the ones marked adapted');
    assert.ok(v.runs.filter((x) => x.asWritten === false).every((x) => typeof x.adapted === 'string'), 'each adapted run says how');
    assert.ok(v.totals.answersChecked > 0, 'answers were checked');
    assert.equal(typeof v.numbersChecked, 'number');
    assert.ok(v.numbersChecked > 0, 'the numbers tool saw numbers');
    assert.equal(typeof v.numbersFailed, 'number');
    assert.equal(v.split.heldOut, 'none');
    assert.equal(typeof v.split.why, 'string');
    assert.equal(v.split.contaminated, false);
    assert.equal(typeof v.control, 'string');
    assert.equal(v.canary.caught, true, 'every planted wrong expectation was rejected');
    for (const k of ['firstLine', 'answer', 'claims', 'sources', 'quotes']) {
      assert.ok(v.canary[k].planted > 0, k + ' controls were planted');
      assert.equal(v.canary[k].caught, v.canary[k].planted, k + ' controls were all caught');
    }
    assert.ok(v.claims.noStore.checked > 0);
    assert.ok(v.sources.rows > 0 && v.sources.numbers >= v.sources.rows);
    assert.ok(v.quotes.checked > 0);
    assert.equal(typeof v.statement, 'string');
    // rule (1): the statement quotes no number the command did not print
    const printed = new Set(r.stdout.match(/\d+/g) || []);
    const unprinted = (v.statement.match(/\d+/g) || []).filter((n) => !printed.has(n));
    assert.deepEqual(unprinted, [], 'every number in the statement is printed by the bar');
    assert.ok(r.stdout.includes('total blocks ' + v.totals.blocks + ' ran ' + v.totals.ran), 'the totals the statement uses are printed');
    assert.equal(JSON.stringify(v).includes(EM_DASH), false);
    assert.equal(fs.readdirSync(dir).filter((n) => n.startsWith('developers-')).length, 0, 'the bar removed its scratch directory');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
