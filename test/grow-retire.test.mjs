// grow/retire.mjs: a prompt the locked judge names as held-out is never shown to an arm again.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { namedPrompts, retire, readRetired, isRetired, keepLive, scrub, collect, shaOf, main, RETIRED, PLACEHOLDER } from '../grow/retire.mjs';

const tmp = (t) => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'retire-')); t.after(() => fs.rmSync(d, { recursive: true, force: true })); return d; };
const put = (root, rel, text) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, text); };
const jsonl = (rows) => rows.map((r) => JSON.stringify(r) + '\n').join('');

test('namedPrompts reads the two reasons of the selector that name held-out prompts, and no other reason', () => {
  const why = [
    'the cell\'s files quote held-out prompts: "what does filter do in javascript", "is 221 prime"',
    'the cell was grown on held-out rows: "factorial of 5"',
    'held-out score 1 (14/14) is not above the baseline\'s 1 (14/14)',
    'the cell shadows a right answer: "hello there"',
    'an example failed: "what is 2 + 2" (contains)',
  ];
  assert.deepEqual(namedPrompts(why), ['what does filter do in javascript', 'is 221 prime', 'factorial of 5']);
  assert.deepEqual(namedPrompts(undefined), []);
  assert.deepEqual(namedPrompts(['the cell\'s files quote held-out prompts: nothing quoted here']), []);
});

test('retire appends a row per prompt with the ids it retired and never the prompt text; a second call adds nothing', (t) => {
  const root = tmp(t);
  put(root, 'grow/dreams.jsonl', jsonl([{ id: 'dream-2-code-4', prompt: 'What does filter do in JavaScript?' }, { id: 'dream-2-code-3', prompt: 'write a javascript debounce function' }]));
  put(root, 'grow/curriculum.jsonl', jsonl([{ id: 'cur-code-8', prompt: 'what does map do in javascript' }]));
  const added = retire(root, ['what does filter do in javascript', 'is 221 prime'], { generation: 3, where: 'verdicts of generation 3', at: '2026-10-01T13:13:14.276Z' });
  assert.equal(added.length, 2);
  assert.deepEqual(added[0].ids, ['dream-2-code-4']);
  assert.deepEqual(added[0].from, ['grow/dreams.jsonl']);
  assert.deepEqual(added[1].ids, []);
  const text = fs.readFileSync(path.join(root, RETIRED), 'utf8');
  assert.ok(!/filter do in javascript/i.test(text), 'the ledger holds no prompt text');
  assert.ok(!/221/.test(text.replace(/"sha":"[0-9a-f]+"/g, '').replace(/"at":"[^"]+"/g, '')), 'no prompt text beside the sha and the stamp');
  assert.equal(retire(root, ['WHAT does filter do in javascript?'], { generation: 4 }).length, 0, 'the judge\'s key decides sameness');
  const r = readRetired(root);
  assert.equal(r.rows.length, 2);
  assert.ok(r.ids.has('dream-2-code-4'));
  assert.ok(isRetired(r, 'what does filter do in javascript'));
  assert.ok(!isRetired(r, 'what does map do in javascript'));
});

test('keepLive drops a retired miss, dream or dev row and keeps the rest in order', (t) => {
  const root = tmp(t);
  retire(root, ['is 221 prime'], { generation: 3 });
  const r = readRetired(root);
  const rows = [{ id: 1, prompt: 'is 97 prime' }, { id: 2, prompt: 'Is 221 prime?' }, { id: 3, q: 'is 221 prime' }, { id: 4, q: 'gcd of 12 and 18' }];
  assert.deepEqual(keepLive(r, rows).map((x) => x.id), [1, 4]);
  assert.deepEqual(keepLive(readRetired(tmp(t)), rows).map((x) => x.id), [1, 2, 3, 4], 'an empty ledger keeps every row');
});

test('scrub replaces a quoted retired prompt in each quote the judge reads and touches nothing else', (t) => {
  const root = tmp(t);
  retire(root, ['factorial of 5', 'is 221 prime'], { generation: 3 });
  const r = readRetired(root);
  const text = 'n factorial ("what is 6 factorial", "factorial of 5", "7!"), a primality question (`is 221 prime`, \'is 97 a prime number\'), it\'s fine.';
  const got = scrub(text, r);
  assert.ok(!got.includes('factorial of 5') && !got.includes('is 221 prime'));
  assert.ok(got.includes('"what is 6 factorial"') && got.includes('\'is 97 a prime number\'') && got.includes('it\'s fine.'));
  assert.equal(got.split(PLACEHOLDER).length - 1, 2);
  assert.equal(scrub(text, readRetired(tmp(t))), text, 'an empty ledger changes nothing');
});

test('collect reads the verdicts of a generation, retires what they name, and says how many', (t) => {
  const root = tmp(t);
  put(root, 'grow/dreams.jsonl', jsonl([{ id: 'dream-2-code-4', prompt: 'what does filter do in javascript' }]));
  put(root, 'work/grow/gen-3/direct/code-direct-g3/verdict.json', JSON.stringify({ survived: false, why: ['the cell\'s files quote held-out prompts: "what does filter do in javascript"'] }));
  put(root, 'work/grow/gen-3/direct/code-direct-g3-2/verdict.json', JSON.stringify({ survived: false, why: ['the cell was grown on held-out rows: "what does filter do in javascript"'] }));
  put(root, 'work/grow/gen-3/baked/math-baked-g3/verdict.json', JSON.stringify({ survived: false, why: ['the cell\'s files quote held-out prompts: "factorial of 5", "is 221 prime"'] }));
  put(root, 'work/grow/gen-3/direct/tools-direct-g3/verdict.json', JSON.stringify({ survived: false, why: ['held-out score 1 (12/12) is not above the baseline\'s 1 (12/12)'] }));
  put(root, 'work/grow/gen-3/direct/brief-code.md', 'a file beside the candidates is not a candidate');
  const got = collect(root, 3, { at: '2026-10-01T13:13:14.276Z' });
  assert.deepEqual(got, { generation: 3, verdicts: 4, named: 3, retired: 3, ids: ['dream-2-code-4'], total: 3 });
  assert.deepEqual(collect(root, 3), { generation: 3, verdicts: 4, named: 3, retired: 0, ids: [], total: 3 }, 'a second collect retires nothing new');
  assert.deepEqual(collect(root, 9), { generation: 9, verdicts: 0, named: 0, retired: 0, ids: [], total: 3 }, 'a generation with no verdict retires nothing');
});

test('the verbs: collect, add and status print one JSON line; a bad call prints the usage and exits 2', async (t) => {
  const root = tmp(t);
  const lines = [];
  const io = { out: (s) => lines.push(s) };
  assert.equal(await main(['add', '--prompt', 'is 221 prime', '--where', 'the run log of generation 3', '--gen', '3', '--root', root], io), 0);
  assert.deepEqual(JSON.parse(lines.pop()), { retired: 1, ids: [], total: 1 });
  assert.equal(readRetired(root).rows[0].sha, shaOf('is 221 prime'));
  assert.equal(await main(['status', '--root', root], io), 0);
  assert.deepEqual(JSON.parse(lines.pop()), { rows: 1, ids: [] });
  assert.equal(await main(['collect', '--gen', '3', '--root', root], io), 0);
  assert.equal(JSON.parse(lines.pop()).verdicts, 0);
  assert.equal(await main(['collect', '--root', root], io), 2);
  assert.equal(await main(['add', '--prompt', 'x', '--root', root], io), 2);
  assert.equal(await main(['nope'], io), 2);
});

test('grow/misses.mjs read never returns a retired prompt, from a file or from the log, and says how many it dropped', async (t) => {
  const { readMisses } = await import('../grow/misses.mjs');
  const root = tmp(t);
  retire(root, ['is 221 prime'], { generation: 3 });
  const ledger = readRetired(root);
  put(root, 'grow/dreams.jsonl', jsonl([{ id: 'dream-2-math-1', prompt: 'Is 221 prime?', status: 'open' }, { id: 'dream-2-math-2', prompt: 'is 97 prime', status: 'open' }]));
  const got = await readMisses({ file: path.join(root, 'grow/dreams.jsonl'), retired: ledger });
  assert.deepEqual(got.rows.map((r) => r.id), ['dream-2-math-2']);
  assert.match(got.summary.reason, /, 1 retired\)$/);
  const none = await readMisses({ file: path.join(root, 'grow/dreams.jsonl'), retired: readRetired(tmp(t)) });
  assert.equal(none.rows.length, 2);
  assert.doesNotMatch(none.summary.reason, /retired/);
  const fetch = async () => ({ ok: true, status: 200, text: async () => JSON.stringify([{ id: 7, prompt: 'is 221 prime', status: 'open' }, { id: 8, prompt: 'gcd of 12 and 18', status: 'open' }]) });
  const log = await readMisses({ env: { SUPABASE_SERVICE_KEY: 'k', SUPABASE_URL: 'http://127.0.0.1:9' }, fetch, retired: ledger });
  assert.deepEqual(log.rows.map((r) => r.id), [8]);
  assert.match(log.summary.reason, /\(1 retired\)$/);
});

test('collect --commit commits the ledger alone as jayden with the cortex trailer; nothing new is nothing to commit', async (t) => {
  const { execFileSync } = await import('node:child_process');
  const root = tmp(t);
  const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' });
  git('init', '-q');
  git('config', 'user.email', 'j@example.test');
  put(root, 'other.txt', 'not shipped');
  put(root, 'work/grow/gen-4/direct/code-direct-g4/verdict.json', JSON.stringify({ survived: false, why: ['the cell was grown on held-out rows: "a held-out prompt"'] }));
  const lines = [];
  const io = { out: (s) => lines.push(s) };
  assert.equal(await main(['collect', '--gen', '4', '--commit', '--no-push', '--root', root], io), 0);
  const first = JSON.parse(lines.pop());
  assert.equal(first.retired, 1);
  assert.equal(first.committed, true);
  assert.equal(first.pushed, 'skipped (--no-push)');
  assert.equal(git('log', '-1', '--format=%an|%s').trim(), 'jayden|gen 4: retired 1 prompt the judge named as held-out');
  assert.match(git('log', '-1', '--format=%b'), /Co-Authored-By: Claude Opus 5\.5 <noreply@anthropic\.com>/);
  assert.deepEqual(git('show', '--name-only', '--format=', 'HEAD').trim().split(/\r?\n/), [RETIRED]);
  assert.equal(await main(['collect', '--gen', '4', '--commit', '--no-push', '--root', root], io), 0);
  assert.equal(JSON.parse(lines.pop()).committed, 'nothing to commit');
});
