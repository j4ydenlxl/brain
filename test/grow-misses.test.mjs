// test/grow-misses.test.mjs: the miss-log reader (grow/misses.mjs; board 37, item misses).
// Author: board 37 builder, item misses, 2026-09-30.
// Nothing here reaches Supabase: a node:http stub on 127.0.0.1 stands in for the REST API and RECORDS every
// request (method, path, headers, body), so what the reader sends is a measurement. The CLI surface (exit
// codes, stdout, stderr, stdin) runs in child processes; the logic runs in process through main() and the
// exported functions.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  CLASSES, COMMON, NO_KEY, STRANGE_PAIRS, classify, classesOf, consonantRun, oneRow, rowWalk, strangePair, isCommon, mashShape,
  main, readMisses, markMisses, rowOf,
} from '../grow/misses.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLI = path.join(ROOT, 'grow', 'misses.mjs');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-misses-test-'));
process.on('exit', () => { try { fs.rmSync(TMP, { recursive: true, force: true }); } catch { /* best effort */ } });
const SVC = 'svc-planted-key-2718281828';
const SEEDS = ['h', 'jgkafsjka', 'the capital of France', 'Write a short essay on why the ocean is salty.', 'hello', 'write an essay on trees'];
const writeJsonl = (name, rows) => { const f = path.join(TMP, name); fs.writeFileSync(f, rows.map((r) => JSON.stringify(r)).join('\n') + '\n'); return f; };
// a child with no SUPABASE name from this machine's environment, plus the ones a test names
const cli = (args, { env = {}, input } = {}) => spawnSync(process.execPath, [CLI, ...args], { cwd: ROOT, env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT || '', ...env }, input, encoding: 'utf8', timeout: 60_000 });
const lines = (s) => String(s).split(/\r?\n/).filter(Boolean);
async function run(argv, env = {}, extra = {}) {
  const out = [], err = [];
  const code = await main(argv, { env, out: (s) => out.push(s), err: (s) => err.push(s), ...extra });
  return { code, out, err };
}

async function restStub(handler) {
  const seen = [];
  const srv = http.createServer((req, res) => {
    let b = '';
    req.on('data', (d) => { b += d; });
    req.on('end', () => {
      const rec = { method: req.method, url: req.url, apikey: req.headers.apikey, auth: req.headers.authorization, prefer: req.headers.prefer, body: b ? JSON.parse(b) : null };
      seen.push(rec);
      const [status, body] = handler(rec);
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(body === undefined ? '' : JSON.stringify(body));
    });
  });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  return { srv, seen, base: 'http://127.0.0.1:' + srv.address().port };
}

// ---------------------------------------------------------------- the classes
test('the four seed misses and two controls land in fragment, mash, capital-of, essay-ocean-salt, other and essay, in that order', () => {
  assert.deepEqual(SEEDS.map(classify), ['fragment', 'mash', 'capital-of', 'essay-ocean-salt', 'other', 'essay']);
  const c = classesOf(SEEDS.map((prompt, i) => ({ id: i + 1, prompt })));
  assert.deepEqual(c.lines.map((l) => l.class), ['fragment', 'mash', 'capital-of', 'essay-ocean-salt', 'other', 'essay']);
  assert.deepEqual(c.lines[0], { id: 1, prompt: 'h', class: 'fragment' });
  assert.deepEqual(Object.keys(c.summary.byClass), CLASSES.slice());
  assert.deepEqual(Object.values(c.summary.byClass), [1, 1, 1, 1, 1, 1]);
  assert.equal(c.summary.rows, 6);
  // a summary line (no prompt) in the input is skipped, so `read | classes` works
  assert.equal(classesOf([{ rows: 0, source: 'supabase', reason: NO_KEY }, { prompt: 'h' }]).summary.rows, 1);
});

test('each rule holds on its own shape and fails on the shape next to it', () => {
  // fragment: letters only, 1 to 3, and not a turn the conversation region answers
  assert.equal(classify('ab'), 'fragment');
  assert.equal(classify('  x '), 'fragment', 'trimmed');
  assert.equal(classify('hi'), 'other', 'the conversation region answers hi');
  assert.equal(classify('yo'), 'other', 'the conversation region answers yo');
  assert.equal(classify('h1'), 'other', 'a digit is not a fragment');
  assert.equal(classify('abcd'), 'other', 'four letters is not a fragment');
  // mash: 6+ letters, no space, one of four keyboard shapes, not a common word; each shape alone makes a mash
  const shapes = (w) => [consonantRun(w), oneRow(w), rowWalk(w), strangePair(w)];
  assert.deepEqual(shapes('prtsklm'), [true, false, false, false], 'a run of 5 with no vowel, alone');
  assert.deepEqual(shapes('hadjsak'), [false, true, false, false], 'every letter on the home row, alone');
  assert.deepEqual(shapes('wertyu'), [false, false, true, false], '5 neighbouring keys in order, alone');
  assert.deepEqual(shapes('fkeiru'), [false, false, false, true], 'a strange pair (fk), alone');
  for (const w of ['prtsklm', 'hadjsak', 'wertyu', 'fkeiru', 'asdfgh', 'qwerty', 'xkcdzq', 'zxcvbn']) assert.equal(classify(w), 'mash', w);
  assert.deepEqual(shapes('jgkafsjka'), [false, true, false, true], 'the seed: home row and the pair jg');
  assert.equal(classify('banana'), 'other', 'vowels in every run, two rows, no strange pair');
  assert.equal(classify('jgkaf'), 'other', 'five letters is not a mash');
  assert.equal(classify('jgkaf sjka'), 'other', 'a space is not a mash');
  assert.equal(classify('asdfghs'), 'mash', 'an ending on a word outside COMMON is still a mash');
  // the digraphs count as one letter: English clusters are not a run of 5
  assert.equal(consonantRun('strengths'), false, 'ngths is 3 letters once ng and th count as one');
  assert.equal(consonantRun('armstrong'), true, 'rmstr is 5: a real word the shape flags, so COMMON holds it');
  assert.equal(classify('armstrong'), 'other');
  assert.equal(oneRow('equity'), false, 'the top row is not a mash row: it holds e, i, o, u and y');
  assert.equal(rowWalk('liberty'), false, 'erty is 4 keys, not 5');
  // every strange pair alone, in a string of vowels, makes a mash: none of the 83 is dead weight
  assert.equal(STRANGE_PAIRS.length, 83);
  assert.equal(new Set(STRANGE_PAIRS).size, 83);
  for (const p of STRANGE_PAIRS) { assert.match(p, /^[a-z]{2}$/); assert.equal(classify('a' + p + 'aeio'), 'mash', p); }
  // an ending on a COMMON word is that word
  assert.equal(isCommon('sportswriters'), true);
  assert.equal(isCommon('Dallas'), true);
  assert.equal(isCommon('asdfghs'), false);
  // capital-of: the bare shape, not the question the knowledge tier answers
  assert.equal(classify('capital of Peru'), 'capital-of');
  assert.equal(classify('France capital of what'), 'capital-of');
  assert.equal(classify('What is the capital of France?'), 'other');
  assert.equal(classify('which is the capital of Peru'), 'other');
  assert.equal(classify('where is the capital of Chile'), 'other');
  assert.equal(classify('capital letters'), 'other');
  // the essays
  assert.equal(classify('an essay on salt in seawater'), 'essay-ocean-salt');
  assert.equal(classify('Essay: why is the SEA salty'), 'essay-ocean-salt');
  assert.equal(classify('an essay on the ocean'), 'essay', 'no salt: the plain essay class');
  assert.equal(classify('why is the ocean salty'), 'other', 'no essay: not an essay class');
  assert.equal(classify(''), 'other');
  assert.equal(classify(null), 'other');
});

test('COMMON is 200 distinct words of 6+ letters and every one WOULD be a mash without the list', () => {
  assert.equal(COMMON.length, 200);
  assert.equal(new Set(COMMON).size, 200);
  for (const w of COMMON) {
    assert.match(w, /^[a-z]{6,}$/, w);
    assert.equal(mashShape(w), true, w + ' is dead weight: the mash rule never flags it');
    assert.equal(classify(w), 'other', w);
    assert.equal(classify(w.toUpperCase()), 'other', 'the list is case-insensitive: ' + w);
  }
});

test('the English words the first cut classed as mash are other now, by the shape and not by the list', () => {
  // the first cut (round 1): a 4 letter window with no vowel, or every letter on any one row
  const firstCut = (s) => { for (let i = 0; i + 4 <= s.length; i++) if (!/[aeiouy]/.test(s.slice(i, i + 4))) return true; return ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].some((r) => [...s].every((c) => r.includes(c))); };
  const words = ['equity', 'rupture', 'strengthened', 'breakthrough', 'nightlife', 'angstrom', 'pewter', 'teeter', 'trotter', 'sprightly', 'worldview', 'hardships', 'earthquakes', 'lengthen', 'twelfths', 'property', 'instrument', 'handstands', 'typewriter', 'territory'];
  for (const w of words) {
    assert.equal(firstCut(w), true, w + ': the first cut flagged it (so this row can fail)');
    assert.equal(mashShape(w), false, w + ': the shape flags it');
    assert.equal(COMMON.includes(w), false, w + ': the list hides it');
    assert.equal(classify(w), 'other', w);
  }
  // and the seeds' mash still is one, under both
  assert.equal(firstCut('jgkafsjka'), true);
  assert.equal(classify('jgkafsjka'), 'mash');
});

// ---------------------------------------------------------------- read and mark, with no key and from a file
test('read with no service key prints the summary with rows 0 and the reason, exit 0; the CLI surface', () => {
  const r = cli(['read']);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(lines(r.stdout), [JSON.stringify({ rows: 0, source: 'supabase', reason: 'SUPABASE_SERVICE_KEY absent (his hand)' })]);
  assert.equal(r.stderr, '');
  const help = cli(['--help']);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /^usage: node grow\/misses\.mjs read/);
  for (const bad of [['nope'], ['read', '--status', 'lost'], ['read', '--limit', '0'], ['read', '--since', 'yesterday'], ['read', '--wat'], ['mark', 'x', '--status', 'grown'], ['mark', '1', '--status', 'open'], ['mark', '1', '--status', 'grown', '--cell', 'Bad Id'], []]) {
    const b = cli(bad);
    assert.equal(b.status, 2, bad.join(' ') + ': ' + b.stdout);
    assert.equal(b.stdout, '', bad.join(' '));
    assert.equal(lines(b.stderr).length, 1, 'one line of reason: ' + b.stderr);
    assert.match(b.stderr, /^misses: /);
  }
  const m = cli(['mark', '1,2', '--status', 'grown']);
  assert.equal(m.status, 0);
  assert.deepEqual(JSON.parse(m.stdout), { marked: 0, ids: ['1', '2'], status: 'grown', source: 'supabase', reason: NO_KEY });
});

test('classes reads the six-row file and stdin alike; read --file filters status, since and limit, newest first', () => {
  const f = writeJsonl('seeds6.jsonl', SEEDS.map((prompt, i) => ({ id: i + 1, prompt })));
  const c = cli(['classes', '--file', f]);
  assert.equal(c.status, 0, c.stderr);
  const got = lines(c.stdout).map((l) => JSON.parse(l));
  assert.deepEqual(got.slice(0, 6).map((l) => l.class), ['fragment', 'mash', 'capital-of', 'essay-ocean-salt', 'other', 'essay']);
  assert.equal(got[6].rows, 6);
  const s = cli(['classes'], { input: fs.readFileSync(f, 'utf8') });
  assert.equal(s.status, 0, s.stderr);
  assert.equal(s.stdout, c.stdout);
  const rows = [
    { id: 1, at: '2026-09-30T20:00:00Z', prompt: 'h', status: 'open' },
    { id: 2, at: '2026-09-30T21:00:00Z', prompt: 'jgkafsjka' },
    { id: 3, at: '2026-09-29T10:00:00Z', prompt: 'the capital of France', status: 'grown' },
    { id: 4, prompt: 'no time at all' },
    { id: 5, at: '2026-09-30T22:00:00Z', prompt: '' },
  ];
  const g = writeJsonl('rows.jsonl', rows);
  const all = cli(['read', '--file', g]);
  assert.equal(all.status, 0, all.stderr);
  const L = lines(all.stdout).map((l) => JSON.parse(l));
  assert.deepEqual(L.slice(0, -1).map((r) => r.id), [2, 1, 4], 'open rows, newest first, the untimed row last');
  assert.deepEqual(Object.keys(L[0]), ['id', 'at', 'prompt', 'reply', 'route', 'status']);
  assert.equal(L[0].status, 'open', 'a row with no status is open');
  assert.deepEqual(L.at(-1), { rows: 3, source: 'file', reason: 'read rows.jsonl (5 lines, 1 without a prompt)' });
  const since = lines(cli(['read', '--file', g, '--since', '2026-09-30T20:30:00Z']).stdout).map((l) => JSON.parse(l));
  assert.deepEqual(since.slice(0, -1).map((r) => r.id), [2], 'since drops the older row and the row with no time');
  const grown = lines(cli(['read', '--file', g, '--status', 'grown']).stdout).map((l) => JSON.parse(l));
  assert.deepEqual(grown.slice(0, -1).map((r) => r.id), [3]);
  assert.equal(lines(cli(['read', '--file', g, '--status', 'any', '--limit', '2']).stdout).length, 3);
  const broken = path.join(TMP, 'broken.jsonl');
  fs.writeFileSync(broken, '{"prompt":"h"}\nnot json\n');
  const b = cli(['classes', '--file', broken]);
  assert.equal(b.status, 1);
  assert.match(b.stderr, /line 2 is not JSON/);
});

test('mark --file rewrites only the named rows; grown stamps grown_at, cell and generation', async () => {
  const g = writeJsonl('mark.jsonl', [{ id: 1, prompt: 'h' }, { id: 2, prompt: 'jgkafsjka' }, { id: 3, prompt: 'hello' }]);
  const r = await markMisses(['1', '2'], { env: {}, status: 'grown', cell: 'frag-h', generation: 1, file: g, now: Date.parse('2026-09-30T23:00:00Z') });
  assert.deepEqual(r, { marked: 2, ids: ['1', '2'], status: 'grown', source: 'file', reason: 'rewrote mark.jsonl' });
  const after = fs.readFileSync(g, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(after[0], { id: 1, prompt: 'h', status: 'grown', cell: 'frag-h', generation: 1, grown_at: '2026-09-30T23:00:00.000Z' });
  assert.deepEqual(after[2], { id: 3, prompt: 'hello' }, 'an unnamed row is untouched');
  const open = await readMisses({ env: {}, file: g });
  assert.deepEqual(open.rows.map((x) => x.id), [3]);
  assert.deepEqual(rowOf({ prompt: 'p' }), { id: null, at: null, prompt: 'p', reply: null, route: null, status: 'open' });
});

test('mark --file takes the file ids of grow/seed-misses.jsonl (seed-1 to seed-4); the log still takes integers only', async () => {
  const seed = path.join(ROOT, 'grow', 'seed-misses.jsonl');
  const copy = path.join(TMP, 'seed-copy.jsonl');
  fs.copyFileSync(seed, copy);
  const ids = fs.readFileSync(seed, 'utf8').trim().split(/\r?\n/).map((l) => JSON.parse(l).id);
  assert.deepEqual(ids, ['seed-1', 'seed-2', 'seed-3', 'seed-4'], 'the seed file ids this test is about');
  const r = cli(['mark', 'seed-1,seed-3', '--status', 'growing', '--generation', '1', '--file', copy]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(lines(r.stdout).map((l) => JSON.parse(l)), [{ marked: 2, ids: ['seed-1', 'seed-3'], status: 'growing', source: 'file', reason: 'rewrote seed-copy.jsonl' }]);
  const after = fs.readFileSync(copy, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(after.map((x) => [x.id, x.status, x.generation ?? null]), [['seed-1', 'growing', 1], ['seed-2', 'open', null], ['seed-3', 'growing', 1], ['seed-4', 'open', null]]);
  const open = lines(cli(['read', '--file', copy]).stdout).map((l) => JSON.parse(l));
  assert.deepEqual(open.slice(0, -1).map((x) => x.id), ['seed-2', 'seed-4'], 'the marked seeds left the open read');
  // the same through main() in this process
  const m = await run(['mark', 'seed-4', '--status', 'skipped', '--file', copy]);
  assert.equal(m.code, 0, m.err.join('\n'));
  assert.equal(JSON.parse(m.out[0]).marked, 1);
  assert.deepEqual((await readMisses({ env: {}, file: copy })).rows.map((x) => x.id), ['seed-2']);
  // a file id is still a word: a space or a leading dash is refused
  for (const bad of ['seed 1', '-x']) {
    const b = cli(['mark', bad, '--status', 'growing', '--file', copy]);
    assert.equal(b.status, 2, bad);
    assert.match(b.stderr, /^misses: mark needs ids: mark seed-1,seed-2/);
  }
  // without --file the ids go to the log, whose ids are integers: refused before any request
  const n = cli(['mark', 'seed-1', '--status', 'growing'], { env: { SUPABASE_SERVICE_KEY: SVC } });
  assert.equal(n.status, 2);
  assert.equal(n.stderr.trim(), 'misses: mark needs ids: mark 1,2,3 --status grown (the log ids are integers)');
  let calls = 0;
  await assert.rejects(markMisses(['seed-1'], { env: { SUPABASE_SERVICE_KEY: SVC }, status: 'growing', fetch: async () => { calls++; return new Response('[]'); } }), /the log ids are integers: seed-1/);
  assert.equal(calls, 0, 'no PATCH left for a string id');
  const ok = await markMisses(['7'], { env: { SUPABASE_SERVICE_KEY: SVC }, status: 'growing', fetch: async () => { calls++; return new Response('[{"id":7}]', { status: 200 }); } });
  assert.equal(ok.marked, 1);
  assert.equal(calls, 1, 'an integer id reaches the log (the control for the refusal above)');
});

// ---------------------------------------------------------------- read and mark against a REST stub
test('read with the service key GETs the open misses newest first with the key in apikey and Bearer, and prints them', async () => {
  const stub = await restStub(() => [200, [
    { id: 7, at: '2026-09-30T21:00:00Z', prompt: 'jgkafsjka', reply: 'I am growing a cell for this.', route: { from: 'memory' }, status: 'open' },
    { id: 6, at: '2026-09-30T20:00:00Z', prompt: 'h', reply: null, route: null, status: 'open' },
  ]]);
  try {
    const r = await run(['read', '--api-base', stub.base], { SUPABASE_SERVICE_KEY: SVC });
    assert.equal(r.code, 0, r.err.join('\n'));
    assert.equal(stub.seen.length, 1);
    const s = stub.seen[0];
    assert.equal(s.method, 'GET');
    const u = new URL(s.url, stub.base);
    assert.equal(u.pathname, '/rest/v1/misses');
    assert.equal(u.searchParams.get('status'), 'eq.open');
    assert.equal(u.searchParams.get('order'), 'at.desc');
    assert.equal(u.searchParams.get('limit'), '200');
    assert.equal(u.searchParams.get('select'), 'id,at,prompt,reply,route,status');
    assert.equal(s.apikey, SVC);
    assert.equal(s.auth, 'Bearer ' + SVC);
    assert.equal(r.out.length, 3);
    assert.deepEqual(JSON.parse(r.out[0]), { id: 7, at: '2026-09-30T21:00:00Z', prompt: 'jgkafsjka', reply: 'I am growing a cell for this.', route: { from: 'memory' }, status: 'open' });
    assert.deepEqual(JSON.parse(r.out[2]), { rows: 2, source: 'supabase', reason: 'GET /rest/v1/misses answered 200' });
    assert.ok(!r.out.join('\n').includes(SVC), 'the key is in the output');
    // since, a status and a limit reach the query
    await run(['read', '--api-base', stub.base, '--since', '2026-09-30T00:00:00Z', '--status', 'growing', '--limit', '5'], { SUPABASE_SERVICE_KEY: SVC });
    const q = new URL(stub.seen[1].url, stub.base).searchParams;
    assert.deepEqual([q.get('at'), q.get('status'), q.get('limit')], ['gte.2026-09-30T00:00:00.000Z', 'eq.growing', '5']);
    await run(['read', '--api-base', stub.base, '--status', 'any'], { SUPABASE_SERVICE_KEY: SVC });
    assert.equal(new URL(stub.seen[2].url, stub.base).searchParams.get('status'), null, 'any reads every status');
  } finally { stub.srv.close(); }
});

test('mark with the service key PATCHes id=in.(..) with status, cell, generation and grown_at, and counts the rows it changed', async () => {
  const stub = await restStub(() => [200, [{ id: 1 }, { id: 2 }]]);
  try {
    const r = await run(['mark', '1,2', '--status', 'grown', '--cell', 'frag-h', '--generation', '1', '--api-base', stub.base], { SUPABASE_SERVICE_KEY: SVC });
    assert.equal(r.code, 0, r.err.join('\n'));
    const s = stub.seen[0];
    assert.equal(s.method, 'PATCH');
    assert.equal(decodeURIComponent(s.url), '/rest/v1/misses?id=in.(1,2)&select=id');
    assert.equal(s.prefer, 'return=representation');
    assert.equal(s.apikey, SVC);
    assert.deepEqual(Object.keys(s.body).sort(), ['cell', 'generation', 'grown_at', 'status']);
    assert.equal(s.body.status, 'grown');
    assert.equal(s.body.cell, 'frag-h');
    assert.equal(s.body.generation, 1);
    assert.ok(Number.isFinite(Date.parse(s.body.grown_at)));
    assert.deepEqual(JSON.parse(r.out[0]), { marked: 2, ids: ['1', '2'], status: 'grown', source: 'supabase', reason: 'PATCH /rest/v1/misses answered 200' });
    // growing carries no grown_at
    await run(['mark', '3', '--status', 'growing', '--api-base', stub.base], { SUPABASE_SERVICE_KEY: SVC });
    assert.deepEqual(stub.seen[1].body, { status: 'growing' });
  } finally { stub.srv.close(); }
});

test('a refused or silent log is a one-line reason and exit 1, and the key never appears in it', async () => {
  const stub = await restStub(() => [401, { message: 'Invalid API key ' + SVC }]);
  try {
    // in process: a spawnSync child would block this process, and the stub with it
    const r = await run(['read', '--api-base', stub.base], { SUPABASE_SERVICE_KEY: SVC });
    assert.equal(r.code, 1);
    assert.deepEqual(r.out, []);
    assert.deepEqual(r.err, ['misses: GET /rest/v1/misses answered 401: Invalid API key <key>']);
    assert.ok(!r.err.join('').includes(SVC));
    const m = await run(['mark', '1', '--status', 'skipped', '--api-base', stub.base], { SUPABASE_SERVICE_KEY: SVC });
    assert.equal(m.code, 1);
    assert.match(m.err[0], /^misses: PATCH \/rest\/v1\/misses answered 401/);
  } finally { stub.srv.close(); }
  const hang = (url, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' }))); });
  await assert.rejects(readMisses({ env: { SUPABASE_SERVICE_KEY: SVC }, fetch: hang, timeoutMs: 30 }), /did not answer in 30 ms/);
  await assert.rejects(readMisses({ env: { SUPABASE_SERVICE_KEY: SVC }, fetch: async () => { throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED' } }); } }), /could not be reached \(ECONNREFUSED\)/);
  await assert.rejects(readMisses({ env: { SUPABASE_SERVICE_KEY: SVC }, fetch: async () => new Response('{"a":1}', { status: 200 }) }), /not a list/);
});
