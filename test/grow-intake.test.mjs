// test/grow-intake.test.mjs: grow/intake.mjs, SELF-OPENED TASKS (contract c10).
//
// Every test builds a temp root (neo/know packs, neo/requests.jsonl, neo/probes.jsonl, a ledger) and removes it; nothing
// here reads the tree's neo/ or grown/, and nothing reaches the network (the miss log is a stub fetch). The held-out files
// read below are the ones intake wrote into the temp root.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  INTAKE_FILE, LIMITS, PHRASINGS, SERVICE_NAME, main, parseArgs, phrasingsOf, readRequests, relationKeys, relationOf, rowsOf, slotOf, step,
} from '../grow/intake.mjs';
import { validateTaskDir, shaText, normQ, MIN_ROWS } from '../grow/teach.mjs';
import { probeTask } from '../grow/measure.mjs';
import { shaOf } from '../grow/retire.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const NAMES = ['Avalon', 'Brigadoon', 'Cockaigne', 'Dinas', 'Eldor', 'Freedonia', 'Genovia', 'Hyrule', 'Ishtar', 'Jarnia',
  'Krakoa', 'Latveria', 'Molvania', 'Narnia', 'Oceania', 'Panem', 'Qumar', 'Ruritania', 'Sokovia', 'Tazbekistan',
  'Ummland', 'Vulgaria', 'Wakanda', 'Xanadu', 'Yerba', 'Zubrowka', 'Arstotzka', 'Bialya', 'Corto', 'Daleria',
  'Elbonia', 'Florin', 'Grand Fenwick', 'Hav', 'Idris', 'Jumbo', 'Kamistan', 'Lilliput', 'Mypos', 'New Rome', 'Orsinia', 'Pottsylvania'];
const capitals = (n = NAMES.length) => NAMES.slice(0, n).map((c, i) => [c, 'Port ' + c.split(' ')[0] + ' ' + (i + 1)]);

function writePacks(root, packs) {
  const dir = path.join(root, 'neo', 'know');
  mkdirSync(dir, { recursive: true });
  const index = { packs: [] };
  for (const [id, p] of Object.entries(packs)) {
    writeFileSync(path.join(dir, id + '.json'), JSON.stringify({ id, from: 'fixture', sha: 'sha-' + id, columns: p.columns, rows: p.rows, at: 'fixture' }));
    index.packs.push({ id, columns: p.columns, rows: p.rows.length, sha: 'sha-' + id });
  }
  writeFileSync(path.join(dir, 'INDEX.json'), JSON.stringify(index));
}
function tmpRoot(t, packs = { 'atlas-capital': { columns: ['country', 'capital'], rows: capitals() } }) {
  const root = mkdtempSync(path.join(tmpdir(), 'grow-intake-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writePacks(root, packs);
  return root;
}
const jsonl = (f) => readFileSync(f, 'utf8').split('\n').filter(Boolean).map((s) => JSON.parse(s));
const ledger = (root) => JSON.parse(readFileSync(path.join(root, 'neo', 'LEDGER.json'), 'utf8'));
const intake = (root) => JSON.parse(readFileSync(path.join(root, ...INTAKE_FILE.split('/')), 'utf8'));
const keyOfRow = (r) => /^The .+? of (.+) is .+\.$/.exec(r.answer)[1];
const NOENV = {};
const opts = (o = {}) => ({ env: NOENV, gen: 7, now: () => '2026-10-02T00:00:00.000Z', ...o });

// ---------------------------------------------------------------- a pack pair becomes a task
test('every pack column pair not yet a task opens one that passes teach validateTaskDir, frozen in the ledger', async (t) => {
  const root = tmpRoot(t);
  const r = await step(root, opts());
  const want = [probeTask('atlas-capital', 'country', 'capital'), probeTask('atlas-capital', 'capital', 'country')];
  assert.deepEqual(r.opened, want);
  assert.deepEqual(r.refused, []);
  assert.equal(r.pending, 0);
  const led = ledger(root);
  for (const name of want) {
    const dir = path.join(root, 'neo', 'tasks', name);
    const v = validateTaskDir(dir, { n: 7 });
    assert.ok(v.ok, v.why.join('; '));
    assert.deepEqual(Object.keys(v.task).sort(), ['by', 'domain', 'generation', 'rule', 'skill', 'task']);
    assert.deepEqual([v.task.task, v.task.skill, v.task.by, v.task.generation], [name, name, 'intake:pack', 7]);
    const row = led.tasks.find((x) => x.task === name);
    assert.equal(row.devSha, shaText(readFileSync(path.join(dir, 'dev.jsonl'), 'utf8')));
    assert.equal(row.heldoutSha, shaText(readFileSync(path.join(dir, 'heldout.jsonl'), 'utf8')));
    assert.deepEqual([row.dev, row.heldout, row.generation, row.by], [v.dev.length, v.heldout.length, 7, 'intake:pack']);
    assert.ok(v.dev.length >= MIN_ROWS.dev && v.heldout.length >= MIN_ROWS.heldout);
    // held-out keys are disjoint from dev keys
    const devKeys = new Set(v.dev.map(keyOfRow)), heldKeys = v.heldout.map(keyOfRow);
    assert.equal(heldKeys.filter((k) => devKeys.has(k)).length, 0, 'a held-out key is a dev key');
    // at least three phrasings, each holding at least two dev prompts
    const shapes = new Map();
    for (const d of v.dev) { const k = keyOfRow(d); const s = normQ(d.q.replace(k, 'KEYSLOT')); shapes.set(s, (shapes.get(s) || 0) + 1); }
    assert.ok(shapes.size >= PHRASINGS.min, 'phrasings: ' + [...shapes.keys()].join(' | '));
    for (const [s, c] of shapes) assert.ok(c >= 2, s + ' holds ' + c + ' prompts');
    for (const d of v.dev) assert.deepEqual(d.expect, { contains: [d.answer.match(/ is (.+)\.$/)[1]], notRefusal: true });
  }
  const x = intake(root);
  assert.deepEqual([x.opened, x.pending, x.generation], [want, 0, 7]);
  assert.match(x.misses, new RegExp('skipped: ' + SERVICE_NAME));
});

test('idempotent: a second step over the same inputs opens nothing, refuses nothing and leaves every file as it was', async (t) => {
  const root = tmpRoot(t);
  await step(root, opts());
  const snap = () => { const d = path.join(root, 'neo', 'tasks'); return JSON.stringify([readFileSync(path.join(root, 'neo', 'LEDGER.json'), 'utf8'), readdirSync(d).map((n) => readdirSync(path.join(d, n)).map((f) => readFileSync(path.join(d, n, f), 'utf8')))]); };
  const before = snap();
  const r = await step(root, opts());
  assert.deepEqual(r, { opened: [], refused: [], pending: 0 });
  assert.equal(snap(), before);
});

test('bounded: LIMITS.perStep a step, LIMITS.perEra an era, --max-ms; the rest is pending', async (t) => {
  const packs = {};
  for (let i = 0; i < 8; i++) packs['atlas-' + String.fromCharCode(97 + i)] = { columns: ['country', 'capital'], rows: capitals() };
  const root = tmpRoot(t, packs);
  const s1 = await step(root, opts({ era: 3 }));
  assert.equal(s1.opened.length, LIMITS.perStep);
  assert.equal(s1.pending, 16 - LIMITS.perStep);
  const s2 = await step(root, opts({ era: 3 }));
  assert.equal(s2.opened.length, LIMITS.perEra - LIMITS.perStep);
  const s3 = await step(root, opts({ era: 3 }));
  assert.deepEqual([s3.opened.length, s3.pending], [0, 16 - LIMITS.perEra], 'the era bound holds');
  const s4 = await step(root, opts({ era: 4 }));
  assert.deepEqual([s4.opened.length, s4.pending], [16 - LIMITS.perEra, 0]);
  // a spent clock opens nothing and leaves everything pending
  const fresh = tmpRoot(t);
  let tick = 0;
  const r = await step(fresh, opts({ maxMs: 5, clock: () => (tick += 10) }));
  assert.deepEqual([r.opened.length, r.pending], [0, 2]);
});

// ---------------------------------------------------------------- requests
test('a request opens its relation\'s task with its own wording first; a request naming nothing is refused, kept and not retried', async (t) => {
  const root = tmpRoot(t);
  writeFileSync(path.join(root, 'neo', 'requests.jsonl'), [
    { at: '2026-10-02T00:00:00Z', q: "What's the capital city of Narnia?", from: 'ask-http' },
    { at: '2026-10-02T00:00:01Z', q: 'how tall is the moon', from: 'ask-http' },
    'not json',
  ].map((x) => (typeof x === 'string' ? x : JSON.stringify(x))).join('\n') + '\n');
  const r = await step(root, opts());
  const base = probeTask('atlas-capital', 'country', 'capital');
  assert.equal(r.opened[0], base, 'the request outranks the pair');
  const dev = jsonl(path.join(root, 'neo', 'tasks', base, 'dev.jsonl'));
  assert.ok(dev.some((d) => /^What's the capital city of .+\?$/.test(d.q)), 'the request\'s wording is a phrasing');
  assert.equal(JSON.parse(readFileSync(path.join(root, 'neo', 'tasks', base, 'task.json'), 'utf8')).by, 'intake:request');
  assert.equal(r.refused.length, 1);
  assert.match(r.refused[0].why, /no pack holds a relation it names/);
  const again = await step(root, opts());
  assert.deepEqual(again.refused, [], 'a refused request is not read again while the shelf is the same');
  // a new shelf retries it
  writePacks(root, { 'atlas-capital': { columns: ['country', 'capital'], rows: capitals() }, moon: { columns: ['body', 'height'], rows: [['moon', 1], ['sun', 2], ['star', 3]] } });
  const retried = await step(root, opts());
  assert.equal(retried.refused.filter((x) => x.task.startsWith('request:')).length, 1, 'retried on a new shelf');
});

test('a request whose relation is taken opens a task of its own wording; a base wording is covered; a retired prompt is never read', async (t) => {
  const root = tmpRoot(t);
  await step(root, opts());
  writeFileSync(path.join(root, 'neo', 'requests.jsonl'), [
    JSON.stringify({ at: 'a', q: 'Narnia has which capital', from: 'x' }),
    JSON.stringify({ at: 'b', q: 'tell me the capital of Narnia', from: 'x' }),
    JSON.stringify({ at: 'c', q: 'the capital of Hyrule, please', from: 'x' }),
  ].join('\n') + '\n');
  mkdirSync(path.join(root, 'grow'), { recursive: true });
  writeFileSync(path.join(root, 'grow', 'retired.jsonl'), JSON.stringify({ sha: shaOf('the capital of Hyrule, please'), ids: [] }) + '\n');
  const r = await step(root, opts());
  assert.equal(r.opened.length, 1);
  const name = r.opened[0];
  assert.match(name, /^atlas-capital-country-to-capital-[0-9a-f]{6}$|^atlas-capital-country-to-capit[a-z-]*-[0-9a-f]{6}$/);
  const dev = jsonl(path.join(root, 'neo', 'tasks', name, 'dev.jsonl'));
  assert.ok(dev.some((d) => / has which capital$/.test(d.q)));
  const x = intake(root);
  const covered = Object.values(x.decided).filter((d) => d.status === 'covered');
  assert.ok(covered.length >= 1, 'the base wording is covered by the relation task');
  assert.equal(Object.keys(x.decided).filter((k) => k.startsWith('request:')).length, 2, 'the retired prompt was never a candidate');
});

test('the miss log is read only with SUPABASE_SERVICE_KEY (a stub fetch here), its rows are requests', async (t) => {
  const root = tmpRoot(t);
  const calls = [];
  const fetch = async (url, init) => { calls.push({ url: String(url), auth: Boolean(init && init.headers) }); return new Response(JSON.stringify([{ id: 1, at: '2026-10-02T00:00:00Z', prompt: 'which capital does Wakanda have', status: 'open' }]), { status: 200 }); };
  const r = await step(root, opts({ env: { [SERVICE_NAME]: 'test-key-not-real', SUPABASE_URL: 'http://127.0.0.1:9' }, fetch }));
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/rest\/v1\/misses\?/);
  const dev = jsonl(path.join(root, 'neo', 'tasks', r.opened[0], 'dev.jsonl'));
  assert.ok(dev.some((d) => /^which capital does .+ have$/.test(d.q)));
  assert.ok(!readFileSync(path.join(root, ...INTAKE_FILE.split('/')), 'utf8').includes('test-key-not-real'), 'the key is never written');
  const none = tmpRoot(t);
  await step(none, opts({ fetch: async () => { throw new Error('must not be called'); } }));
  assert.match(intake(none).misses, /skipped/);
});

// ---------------------------------------------------------------- probes and refusals
test('a probe opens its task with its template first; teach\'s validators refuse a locked class; a class column and too few keys are refused', async (t) => {
  const root = tmpRoot(t, {
    'atlas-capital': { columns: ['country', 'capital'], rows: capitals() },
    'corpora-things': { columns: ['item', 'member'], rows: NAMES.map((n, i) => [n, i % 2 ? 'yes' : 'no']) },
    tiny: { columns: ['country', 'motto'], rows: capitals(12) },
  });
  const ptask = probeTask('atlas-capital', 'country', 'capital');
  writeFileSync(path.join(root, 'neo', 'probes.jsonl'), JSON.stringify({ at: 'x', era: 1, task: ptask, pack: 'atlas-capital', sha: 'sha-atlas-capital', key: 'country', value: 'capital', template: 'which city is the capital of {country}', rows: 42, keys: 42, by: 'measure' }) + '\n');
  // a locked class named like the reverse pair
  const lockedName = probeTask('atlas-capital', 'capital', 'country');
  mkdirSync(path.join(root, 'judge', 'dev'), { recursive: true });
  writeFileSync(path.join(root, 'judge', 'dev', lockedName + '.jsonl'), '');
  const r = await step(root, opts());
  assert.equal(r.opened[0], ptask);
  const t0 = JSON.parse(readFileSync(path.join(root, 'neo', 'tasks', ptask, 'task.json'), 'utf8'));
  assert.equal(t0.by, 'intake:probe');
  assert.ok(jsonl(path.join(root, 'neo', 'tasks', ptask, 'dev.jsonl')).some((d) => d.q.startsWith('which city is the capital of ')));
  const why = Object.fromEntries(r.refused.map((x) => [x.task, x.why]));
  assert.match(why[lockedName], /is a locked class/, 'teach validateTaskDir refuses it');
  assert.ok(!existsSync(path.join(root, 'neo', 'tasks', lockedName)), 'a refused task never reaches neo/tasks/');
  assert.match(why[probeTask('corpora-things', 'item', 'member')], /a class, not a relation/);
  assert.match(why[probeTask('tiny', 'country', 'motto')], /too few unique keys/);
});

test('a task directory the ledger does not hold is refused, never overwritten', async (t) => {
  const root = tmpRoot(t);
  const name = probeTask('atlas-capital', 'country', 'capital');
  mkdirSync(path.join(root, 'neo', 'tasks', name), { recursive: true });
  writeFileSync(path.join(root, 'neo', 'tasks', name, 'task.json'), '{"keep":true}');
  const r = await step(root, opts());
  assert.match(r.refused.find((x) => x.task === name).why, /already exists but the ledger has no row/);
  assert.equal(readFileSync(path.join(root, 'neo', 'tasks', name, 'task.json'), 'utf8'), '{"keep":true}');
});

// ---------------------------------------------------------------- the parts
test('relationOf: a label and one unique key; the template keeps the request\'s own words; two equal relations are refused', (t) => {
  const root = tmpRoot(t, {
    'atlas-capital': { columns: ['country', 'capital'], rows: capitals() },
    'atlas-anthem': { columns: ['country', 'anthem'], rows: capitals().map(([c], i) => [c, 'Song ' + i]) },
  });
  const r = relationOf(root, 'So, what is the capital of Grand Fenwick?');
  assert.deepEqual(r, { pack: 'atlas-capital', key: 'country', value: 'capital', entity: 'Grand Fenwick', template: 'So, what is the capital of {key}?' });
  assert.equal(relationOf(root, 'capital and anthem of Narnia').why.startsWith('it names 2 relations'), true);
  assert.match(relationOf(root, 'what is the capital of nowhere').why, /no pack holds/);
  assert.match(relationOf(root, '').why, /empty/);
  assert.match(relationOf(root, 'x'.repeat(LIMITS.maxQ + 1)).why, /over/);
});

test('slotOf, phrasingsOf, relationKeys, rowsOf, readRequests, parseArgs', (t) => {
  assert.equal(slotOf('what is the capital of {country}'), 'what is the capital of {key}');
  assert.equal(slotOf('no slot'), null);
  assert.equal(slotOf('{a} and {b}'), null);
  const p = phrasingsOf(['what is the capital of {country}'], 'capital');
  assert.deepEqual(p, ['what is the capital of {key}', 'tell me the capital of {key}', 'name the capital of {key}']);
  assert.equal(phrasingsOf([], 'calling_code')[0], 'what is the calling code of {key}');
  assert.equal(phrasingsOf(['a {x}', 'b {x}', 'c {x}', 'd {x}', 'e {x}'], 'v').length, PHRASINGS.max);
  const rk = relationKeys({ rows: [['A', 'x'], ['a', 'y'], ['B', 'B'], ['C', 'z'], ['', 'q'], ['D', null]] }, 0, 1);
  assert.deepEqual(rk.keys, [{ k: 'C', v: 'z' }], 'a repeated key, a key equal to its value and an empty cell are dropped');
  const keys = capitals().map(([k, v]) => ({ k, v }));
  const a = rowsOf('t-one', keys, p, 'capital'), b = rowsOf('t-one', keys, p, 'capital'), c = rowsOf('t-two', keys, p, 'capital');
  assert.deepEqual(a, b, 'deterministic');
  assert.notDeepEqual(a.heldout.map(keyOfRow), c.heldout.map(keyOfRow), 'the split depends on the task');
  assert.equal(a.heldout.length, Math.ceil(keys.length / 3));
  const bad = rowsOf('t-bad', [{ k: 'X', v: 'require(1)' }, ...keys], p, 'capital');
  assert.ok(![...bad.dev, ...bad.heldout].some((r) => r.answer.includes('require(')), 'a row teach rowErrors refuses is dropped');
  const root = tmpRoot(t);
  writeFileSync(path.join(root, 'neo', 'requests.jsonl'), '{"at":"1","q":"first","from":"x"}\n{"at":"2","q":"  second  ","from":"y"}\n{"q":""}\n[1]\n');
  assert.deepEqual(readRequests(root).map((r) => r.q), ['second', 'first']);
  assert.deepEqual(parseArgs(['step', '--era', '3', '--max-ms', '10']), { verb: 'step', flags: { era: '3', 'max-ms': '10' } });
  assert.throws(() => parseArgs(['step', '--bogus', '1']), /unknown flag --bogus/);
  assert.throws(() => parseArgs(['step', '--era']), /needs a value/);
});

test('the command line: step prints exactly one line {opened, refused, pending}; usage exits 2', async (t) => {
  const root = tmpRoot(t);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'grow', 'intake.mjs'), 'step', '--root', root, '--gen', '2', '--era', '1'], { encoding: 'utf8', env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.split('\n').filter(Boolean);
  assert.equal(lines.length, 1);
  const j = JSON.parse(lines[0]);
  assert.deepEqual(Object.keys(j), ['opened', 'refused', 'pending']);
  assert.equal(j.opened.length, 2);
  const bad = spawnSync(process.execPath, [path.join(ROOT, 'grow', 'intake.mjs'), 'step', '--era', 'x', '--root', root], { encoding: 'utf8' });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /--era is an integer/);
  const verb = spawnSync(process.execPath, [path.join(ROOT, 'grow', 'intake.mjs'), 'open'], { encoding: 'utf8' });
  assert.equal(verb.status, 2);
  assert.match((await main(['--help'])).usage, /grow\/intake\.mjs step/);
});
