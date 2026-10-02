// test/grow-know.test.mjs: THE SHELF (grow/know.mjs, contract c5). Every table the absorber pulled becomes a knowledge
// pack under neo/know/, re-pulled through absorb's own fetch with the sha the absorber recorded, parsed by absorb's own
// parser, capped at 2 MB a pack and 30 MB in all, read back by packs, pack and lookup. Offline: the network is a stub,
// every root is a temp directory removed afterwards; nothing here reads the tree's neo/ or grown/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { FORBIDDEN } from '../grow/contract.mjs';
import { knowGet } from '../grow/neo-kernel.mjs';
import {
  KNOW_DIR, INDEX, PACK_RE, PACK_MAX_BYTES, PACKS_MAX_BYTES, tableOf, packOf, readIndex, packs, pack, loadPacks, lookup, shelve, status, main, parseArgs,
  LONG_STATE, LONG_RECHECK_MS, longShape, longPackOf,
} from '../grow/know.mjs';
import { MIN_TABLE_ROWS } from '../grow/frontier.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const KNOW_FILE = path.join(HERE, '..', 'grow', 'know.mjs');
const sha = (b) => createHash('sha256').update(b).digest('hex');
const RAW = 'https://raw.githubusercontent.com/x/y/main/';

const CAPITALS = JSON.stringify([
  { country: 'France', city: 'Paris' }, { country: 'Japan', city: 'Tokyo' }, { country: "Côte d'Ivoire", city: 'Yamoussoukro' },
  { country: 'Narnia', city: 'eval(1)' }, { country: 'Chad', city: "N'Djamena" },
]);
const POP = 'name,pop\nFrance,"67,390,000"\nJapan,125800000\nChad,16.5\nAtlantis,lots\n';
const FRUIT = JSON.stringify({ fruits: ['apple', 'pear', 'Plum'], not: ['brick', 'pear', 'stone'] });
const SOURCES = [
  { id: 'caps', kind: 'json-relation', url: RAW + 'caps.json', make: { relations: [{ key: 'country', value: 'city', keyLabel: 'country', valueLabel: 'capital', task: 'cap' }] } },
  { id: 'pop', kind: 'csv-numeric', url: RAW + 'pop.csv', make: { key: 'name', numerics: [{ value: 'pop', noun: 'population', task: 'pop' }] } },
  { id: 'fruit', kind: 'list-membership', url: RAW + 'fruit.json', make: { root: 'fruits', decoys: ['brick', 'pear', 'stone'], noun: 'fruit', task: 'fruit' } },
  { id: 'never', kind: 'json-relation', url: RAW + 'never.json', make: { relations: [{ key: 'a', value: 'b', task: 'n' }] } },
  { id: 'evil', kind: 'json-relation', url: 'https://example.com/evil.json', make: { relations: [{ key: 'a', value: 'b', task: 'e' }] } },
];
const BYTES = { [RAW + 'caps.json']: CAPITALS, [RAW + 'pop.csv']: POP, [RAW + 'fruit.json']: FRUIT, 'https://example.com/evil.json': '[{"a":"x","b":"y"}]' };

function tree({ sources = SOURCES, pulled } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-know-'));
  fs.mkdirSync(path.join(root, 'neo'), { recursive: true });
  fs.writeFileSync(path.join(root, 'neo', 'sources.json'), JSON.stringify({ sources }));
  const rows = pulled || [
    { id: 'caps', sha256: sha(Buffer.from(CAPITALS)) }, { id: 'pop', sha256: sha(Buffer.from(POP)) }, { id: 'fruit', sha256: sha(Buffer.from(FRUIT)) },
    { id: 'evil', sha256: sha(Buffer.from(BYTES['https://example.com/evil.json'])) }, { id: 'never', sha256: 'f'.repeat(64), blocked: 'the adapter failed' },
  ];
  fs.writeFileSync(path.join(root, 'neo', 'ABSORB.json'), JSON.stringify({ cursor: 0, pulled: rows, bytes: 0, rows: 0 }));
  return root;
}
function stub(map = BYTES) {
  const calls = [];
  const fetch = async (url) => { calls.push(url); return Object.hasOwn(map, url) ? new Response(map[url], { status: 200 }) : new Response('', { status: 404 }); };
  return { fetch, calls };
}
const rm = (d) => fs.rmSync(d, { recursive: true, force: true });
const readJson = (root, rel) => JSON.parse(fs.readFileSync(path.join(root, ...rel.split('/')), 'utf8'));

// ---------------------------------------------------------------- tables
test('tableOf: a relation gives one labelled column per path; a list value renders with "and" under maxMany', () => {
  const src = { kind: 'json-relation', make: { relations: [{ key: 'k', value: 'v', keyLabel: 'country', valueLabel: 'capital' }, { key: 'k', value: 'langs', many: 'all', keyLabel: 'country', valueLabel: 'languages', maxMany: 2 }] } };
  const t = tableOf(src, [{ k: 'A', v: 'a1', langs: ['x', 'y'] }, { k: 'B', v: 'b1', langs: ['x', 'y', 'z'] }, { k: 'C', langs: [] }, { v: 'orphan' }]);
  assert.deepEqual(t.columns, ['country', 'capital', 'languages']);
  assert.deepEqual(t.rows, [['A', 'a1', 'x and y'], ['B', 'b1', ''], ['C', '', ''], ['', 'orphan', '']]);
});
test('tableOf: a numeric source gives the key column (its path, lower case) and the noun, the values numbers', () => {
  const src = { kind: 'csv-numeric', make: { key: '{city}, {state}', numerics: [{ value: 'pop', noun: 'population' }] } };
  const t = tableOf(src, [{ city: 'Austin', state: 'Texas', pop: '1,000' }, { city: 'Nowhere', state: 'X', pop: '1e5' }]);
  assert.deepEqual(t.columns, ['city, state', 'population']);
  assert.deepEqual(t.rows, [['Austin, Texas', 1000], ['Nowhere, X', '']]);
});
test('tableOf: a membership list gives item and member, yes for a member, no for a decoy that is not one', () => {
  const t = tableOf({ kind: 'list-membership', make: { decoys: ['Brick', 'PEAR'] } }, [{ $: 'apple' }, { $: 'pear' }, { $: 'Apple' }]);
  assert.deepEqual(t, { columns: ['item', 'member'], rows: [['apple', 'yes'], ['pear', 'yes'], ['Brick', 'no']] });
});
test('packOf: a cell naming a FORBIDDEN pattern drops its row; rows past the byte bar are cut in source order and counted', () => {
  const pk = packOf(SOURCES[0], Buffer.from(CAPITALS), { at: 'T' });
  assert.equal(pk.dropped, 1);
  assert.ok(pk.rows.every((r) => r.every((v) => !FORBIDDEN.some(([re]) => re.test(String(v))))));
  assert.deepEqual(Object.keys(pk).slice(0, 6), ['id', 'from', 'sha', 'columns', 'rows', 'at']);
  assert.equal(pk.sha, sha(Buffer.from(CAPITALS)));
  const full = Buffer.byteLength(JSON.stringify(pk) + '\n');
  const small = packOf(SOURCES[0], Buffer.from(CAPITALS), { at: 'T', maxBytes: full - 10 });
  assert.ok(small.cut >= 1 && small.rows.length === pk.rows.length - small.cut);
  assert.deepEqual(small.rows, pk.rows.slice(0, small.rows.length), 'the first rows stay');
  assert.ok(Buffer.byteLength(JSON.stringify(small) + '\n') <= full - 10);
  assert.equal(packOf({ id: 'x', kind: 'json-relation', make: {} }, Buffer.from('[]'), {}), null, 'no relation, no table');
});

// ---------------------------------------------------------------- shelve
test('shelve: every pulled source becomes neo/know/<id>.json and an INDEX entry; blocked, unpulled and off-allowlist sources do not', async () => {
  const root = tree();
  try {
    const { fetch, calls } = stub();
    const r = await shelve(root, { fetch, now: () => '2026-10-01T00:00:00.000Z' });
    assert.deepEqual(r.shelved, ['caps', 'fruit', 'pop'].sort((a, b) => SOURCES.findIndex((s) => s.id === a) - SOURCES.findIndex((s) => s.id === b)));
    assert.ok(!calls.includes('https://example.com/evil.json'), 'a host off the allowlist is refused before any fetch');
    assert.ok(r.blocked.some((b) => b.startsWith('evil: ') && /ALLOWED_HOSTS/.test(b)));
    assert.ok(!calls.includes(RAW + 'never.json'), 'a blocked pull is not shelved');
    const idx = readJson(root, INDEX);
    assert.deepEqual(Object.keys(idx), ['packs']);
    assert.deepEqual(idx.packs.map((p) => p.id), ['caps', 'fruit', 'pop'], 'sorted by id');
    for (const e of idx.packs) {
      assert.deepEqual(Object.keys(e), ['id', 'columns', 'rows', 'sha']);
      assert.match(e.id, PACK_RE);
      const pk = readJson(root, KNOW_DIR + '/' + e.id + '.json');
      assert.equal(pk.rows.length, e.rows);
      assert.equal(pk.sha, e.sha);
      assert.equal(pk.at, '2026-10-01T00:00:00.000Z');
      assert.equal(pk.from, SOURCES.find((s) => s.id === e.id).url);
      assert.ok(pk.rows.every((row) => row.every((v) => typeof v === 'string' || Number.isFinite(v))));
    }
    assert.deepEqual(pack(root, 'pop').rows, [['France', 67390000], ['Japan', 125800000], ['Chad', 16.5], ['Atlantis', '']]);
    assert.deepEqual(pack(root, 'fruit').rows, [['apple', 'yes'], ['pear', 'yes'], ['Plum', 'yes'], ['brick', 'no'], ['stone', 'no']]);
    assert.equal(r.packs, 3);
    assert.equal(r.rows, idx.packs.reduce((s, p) => s + p.rows, 0));
    assert.deepEqual(status(root), { packs: 3, rows: r.rows, bytes: r.total });
  } finally { rm(root); }
});
test('shelve: a pack that already holds the pulled sha is not fetched again; a new pull is', async () => {
  const root = tree();
  try {
    await shelve(root, stub());
    const again = stub();
    const r = await shelve(root, again);
    assert.equal(again.calls.filter((u) => u.startsWith(RAW)).length, 0);
    assert.equal(r.unchanged, 3);
    assert.deepEqual(r.shelved, []);
    const ab = readJson(root, 'neo/ABSORB.json');
    const POP2 = 'name,pop\nFrance,1\n';
    ab.pulled.push({ id: 'pop', sha256: sha(Buffer.from(POP2)) });
    fs.writeFileSync(path.join(root, 'neo', 'ABSORB.json'), JSON.stringify(ab));
    const third = stub({ ...BYTES, [RAW + 'pop.csv']: POP2 });
    const r3 = await shelve(root, third);
    assert.deepEqual(r3.shelved, ['pop'], 'the latest pull of a source is the one that counts');
    assert.deepEqual(pack(root, 'pop').rows, [['France', 1]]);
    assert.equal(readIndex(root).packs.find((p) => p.id === 'pop').rows, 1);
  } finally { rm(root); }
});
test('shelve: bytes whose sha is not the one the absorber pulled are refused as sha drift and never shelved', async () => {
  const root = tree();
  try {
    const r = await shelve(root, stub({ ...BYTES, [RAW + 'caps.json']: CAPITALS.replace('Tokyo', 'Kyoto') }));
    assert.ok(r.blocked.some((b) => b.startsWith('caps: sha drift')));
    assert.ok(!r.shelved.includes('caps'));
    assert.equal(pack(root, 'caps'), null);
    assert.ok(!readIndex(root).packs.some((p) => p.id === 'caps'));
  } finally { rm(root); }
});
test('shelve: a pack over the per-pack bar is cut, a pack past the bar for all packs is not written', async () => {
  const root = tree();
  try {
    const r = await shelve(root, { ...stub(), maxPackBytes: 300 });
    assert.ok(r.shelved.some((s) => /^caps \(\d+ rows cut\)$/.test(s)), r.shelved.join());
    assert.ok(fs.statSync(path.join(root, 'neo', 'know', 'caps.json')).size <= 300);
    assert.ok(Number.isInteger(pack(root, 'caps').cut));
    const root2 = tree();
    try {
      const r2 = await shelve(root2, { ...stub(), maxTotalBytes: 400 });
      assert.ok(r2.total <= 400);
      assert.ok(r2.blocked.some((b) => /over the 400 bytes all packs may be/.test(b)));
    } finally { rm(root2); }
  } finally { rm(root); }
});
test('shelve: a spent time budget leaves the rest to the next shelve, which finishes it', async () => {
  const root = tree();
  try {
    let t = 0;
    const r = await shelve(root, { ...stub(), maxMs: 5, clock: () => (t += 3) });
    assert.ok(r.blocked.some((b) => /the time budget of 5 ms is spent; \d+ sources wait/.test(b)));
    assert.ok(r.shelved.length < 3);
    const r2 = await shelve(root, stub());
    assert.equal(r2.shelved.length + r2.unchanged, 3);
  } finally { rm(root); }
});
test('shelve: a bad registry fails, a missing ABSORB shelves nothing and still writes an empty INDEX', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-know-'));
  try {
    await assert.rejects(shelve(root, stub()), /sources\.json is missing/);
    fs.mkdirSync(path.join(root, 'neo'));
    fs.writeFileSync(path.join(root, 'neo', 'sources.json'), JSON.stringify({ sources: SOURCES }));
    const r = await shelve(root, stub());
    assert.equal(r.packs, 0);
    assert.deepEqual(readJson(root, INDEX), { packs: [] });
  } finally { rm(root); }
});

// ---------------------------------------------------------------- reading
test('pack and packs: only a pack id, only a file of the pack shape under the bar; loadPacks keeps the bar for all packs', async () => {
  const root = tree();
  try {
    await shelve(root, stub());
    assert.equal(pack(root, '../neo/sources'), null);
    assert.equal(pack(root, 'Caps'), null);
    assert.equal(pack(root, 'nope'), null);
    const f = path.join(root, 'neo', 'know', 'pop.json');
    const good = fs.readFileSync(f, 'utf8');
    fs.writeFileSync(f, JSON.stringify({ id: 'pop', columns: ['a'], rows: [['x', 'y']] }));
    assert.equal(pack(root, 'pop'), null, 'a row wider than the columns');
    fs.writeFileSync(f, JSON.stringify({ id: 'other', columns: ['a'], rows: [] }));
    assert.equal(pack(root, 'pop'), null, 'an id that is not its file name');
    fs.writeFileSync(f, JSON.stringify({ id: 'pop', columns: ['a'], rows: [[{}]] }));
    assert.equal(pack(root, 'pop'), null, 'a cell that is not text or a number');
    fs.writeFileSync(f, ' '.repeat(PACK_MAX_BYTES + 1));
    assert.equal(pack(root, 'pop'), null, 'over the bar');
    fs.writeFileSync(f, good);
    assert.deepEqual(packs(root).map((p) => p.id), ['caps', 'fruit', 'pop']);
    const all = loadPacks(root);
    assert.deepEqual(all.packs.map((p) => p.id), ['caps', 'fruit', 'pop']);
    const capped = loadPacks(root, { maxBytes: fs.statSync(path.join(root, 'neo', 'know', 'caps.json')).size });
    assert.deepEqual(capped.packs.map((p) => p.id), ['caps']);
    assert.equal(capped.blocked.length, 2);
    assert.equal(PACKS_MAX_BYTES, 30 * 1024 * 1024);
    assert.equal(PACK_MAX_BYTES, 2 * 1024 * 1024);
  } finally { rm(root); }
});
test('pack: a well formed pack padded past the per-pack bar is null; a file whose id is no pack id is null even when it names itself', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-know-'));
  try {
    const dir = path.join(root, 'neo', 'know');
    fs.mkdirSync(dir, { recursive: true });
    const body = JSON.stringify({ id: 'big', columns: ['a'], rows: [['x']] });
    fs.writeFileSync(path.join(dir, 'big.json'), body);
    assert.deepEqual(pack(root, 'big').rows, [['x']], 'under the bar it reads');
    fs.writeFileSync(path.join(dir, 'big.json'), body + ' '.repeat(PACK_MAX_BYTES + 1000 - body.length));
    assert.equal(pack(root, 'big'), null, 'a valid pack just over the bar');
    fs.writeFileSync(path.join(dir, 'A_B.json'), JSON.stringify({ id: 'A_B', columns: ['a'], rows: [['x']] }));
    assert.equal(pack(root, 'A_B'), null);
  } finally { rm(root); }
});
test('readIndex: an entry with a bad id, a non-text column, a fractional or negative row count, or no object is dropped', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'grow-know-'));
  try {
    fs.mkdirSync(path.join(root, 'neo', 'know'), { recursive: true });
    const good = { id: 'ok', columns: ['a'], rows: 1, sha: 'x' };
    fs.writeFileSync(path.join(root, ...INDEX.split('/')), JSON.stringify({ packs: [good, { id: '../x', columns: [], rows: 1 }, { id: 'y', columns: [1], rows: 1 }, { id: 'z', columns: [], rows: 1.5 }, { id: 'w', columns: [], rows: -1 }, 'str', null] }));
    assert.deepEqual(readIndex(root).packs, [good]);
    fs.writeFileSync(path.join(root, ...INDEX.split('/')), '{"packs": 3}');
    assert.deepEqual(readIndex(root).packs, []);
  } finally { rm(root); }
});
test('shelve: a pack file gone from disk is fetched again even though INDEX still holds its sha', async () => {
  const root = tree();
  try {
    await shelve(root, stub());
    fs.rmSync(path.join(root, 'neo', 'know', 'caps.json'));
    const again = stub();
    const r = await shelve(root, again);
    assert.deepEqual(r.shelved, ['caps']);
    assert.ok(again.calls.includes(RAW + 'caps.json'));
    assert.ok(pack(root, 'caps'));
  } finally { rm(root); }
});
test('shelve: a re-shelved pack replaces its old size under the bar for all packs (it is not counted twice)', async () => {
  const root = tree();
  try {
    const r = await shelve(root, stub());
    const ab = readJson(root, 'neo/ABSORB.json');
    const POP2 = 'name,pop\nFrance,1\n';
    ab.pulled.push({ id: 'pop', sha256: sha(Buffer.from(POP2)) });
    fs.writeFileSync(path.join(root, 'neo', 'ABSORB.json'), JSON.stringify(ab));
    const r2 = await shelve(root, { ...stub({ ...BYTES, [RAW + 'pop.csv']: POP2 }), maxTotalBytes: r.total });
    assert.deepEqual(r2.shelved, ['pop'], r2.blocked.join('; '));
    assert.ok(r2.total < r.total);
  } finally { rm(root); }
});
test('shelve: a source of a kind no adapter reads is never fetched and never shelved', async () => {
  const odd = { id: 'odd', kind: 'not-a-kind', url: RAW + 'caps.json', make: { relations: [{ key: 'country', value: 'city', task: 'o' }] } };
  const root = tree({ sources: [...SOURCES, odd], pulled: [{ id: 'odd', sha256: sha(Buffer.from(CAPITALS)) }] });
  try {
    const s = stub();
    const r = await shelve(root, s);
    assert.equal(s.calls.length, 0);
    assert.deepEqual(r.shelved, []);
    assert.equal(r.blocked.length, 0);
    assert.equal(pack(root, 'odd'), null);
  } finally { rm(root); }
});
test('lookup: case, accents, punctuation and "the" fold; an absent or ambiguous key is null; the kernel registry is left empty', () => {
  const pk = { id: 'cap', columns: ['country', 'capital'], rows: [['France', 'Paris'], ["Côte d'Ivoire", 'Yamoussoukro'], ['The Gambia', 'Banjul'], ['Twin', 'one'], ['twin', 'two'], ['Same', 'x'], ['same', 'X.']] };
  assert.equal(lookup(pk, 'country', 'FRANCE', 'capital'), 'Paris');
  assert.equal(lookup(pk, 'country', 'cote d ivoire', 'capital'), 'Yamoussoukro');
  assert.equal(lookup(pk, 'country', 'gambia', 'capital'), 'Banjul');
  assert.equal(lookup(pk, 'country', 'the Gambia.', 'capital'), 'Banjul');
  assert.equal(lookup(pk, 'capital', 'paris', 'country'), 'France');
  assert.equal(lookup(pk, 'country', 'Atlantis', 'capital'), null);
  assert.equal(lookup(pk, 'country', 'twin', 'capital'), null);
  assert.equal(lookup(pk, 'country', 'same', 'capital'), 'x');
  assert.equal(lookup(pk, 'country', 'France', 'mayor'), null);
  assert.equal(lookup(null, 'country', 'France', 'capital'), null);
  assert.equal(knowGet('q-cap', 'country', 'France', 'capital'), null);
});

// ---------------------------------------------------------------- the CLI
test('CLI: shelve and status print one JSON line; --era is carried; a bad flag or verb is usage (exit 2)', async () => {
  const root = tree();
  try {
    const r = await main(['shelve', '--root', root, '--era', '7', '--max-ms', '60000'], stub());
    assert.equal(r.era, 7);
    assert.equal(r.packs, 3);
    assert.deepEqual(await main(['status', '--root', root]), status(root));
    assert.deepEqual(await main(['--help']), { usage: true });
    for (const argv of [['shelve', '--bogus', '1'], ['shelve', '--max-ms', '0'], ['shelve', '--era', '-1'], ['shelve', 'extra'], ['burn'], ['shelve', '--root']]) {
      await assert.rejects(main(argv), (e) => e.code === 2, argv.join(' '));
    }
    assert.throws(() => parseArgs(['--max-ms']), (e) => e.code === 2);
    const child = spawnSync(process.execPath, [KNOW_FILE, 'status', '--root', root], { encoding: 'utf8' });
    assert.equal(child.status, 0);
    const lines = child.stdout.trim().split('\n');
    assert.deepEqual(JSON.parse(lines.at(-1)), status(root));
    const bad = spawnSync(process.execPath, [KNOW_FILE, 'burn'], { encoding: 'utf8' });
    assert.equal(bad.status, 2);
    assert.match(bad.stderr, /unknown verb burn/);
  } finally { rm(root); }
});
test('safety: the shelf reads no runtime or held-out file, runs nothing it fetched, and holds no em-dash', () => {
  const src = fs.readFileSync(KNOW_FILE, 'utf8');
  assert.ok(!/state\/|heldout|control\.jsonl/.test(src.replace(/^\/\/.*$/gm, '')), 'no path to state/, held-out or control files in code');
  assert.ok(!/\beval\s*\(|new\s+Function|\bimport\s*\(/.test(src), 'nothing fetched is evaluated or imported');
  assert.ok(!/—/.test(src));
  assert.ok(!/grown\//.test(src.replace(/^\/\/.*$/gm, '')), 'the shelf never writes grown/');
});

// ---------------------------------------------------------------- long tables (part 4)
const LRAW = 'https://raw.githubusercontent.com/ds/pop/main/';
const NAMES = ['Aland', 'Borea', 'Cyrene', 'Dalmar', 'Elbon', 'Fenwick'];
const LONG_CSV = 'Region Name,Region Code,Year,Value,Note\n' + NAMES.flatMap((n, i) => [2000, 2001, 2002, 2003, 2004].map((y) => `${n},${n.slice(0, 3).toUpperCase()},${y},${1000 + i * 100 + (y - 2000) * 7},x`)).join('\n') + '\n';
const KEYED_CSV = 'name,size\n' + Array.from({ length: 25 }, (_, i) => `Item${String.fromCharCode(65 + i)},${i}`).join('\n') + '\n';
const MONTHLY_CSV = 'site,month,reading\n' + ['North', 'South', 'East', 'West'].flatMap((s, i) => ['2020-01', '2020-02', '2020-03', '2020-04', '2020-05', '2020-06'].map((m, j) => `${s},${m},${i * 10 + j}`)).join('\n') + '\n';
const PKG = JSON.stringify({ name: 'pop', licenses: [{ name: 'ODC-PDDL-1.0' }], resources: [{ path: 'data/pop.csv' }, { path: 'data/keyed.csv' }, { path: 'https://example.com/x.csv' }, { path: ['data/notes.md'] }] });
const NCPKG = JSON.stringify({ name: 'nc', licenses: [{ name: 'CC-BY-NC-4.0' }], resources: [{ path: 'data/nc.csv' }] });
const SEED_LIST = [
  { url: LRAW + 'datapackage.json', domain: 'open data', license: 'ODC-PDDL-1.0' },
  { url: 'https://raw.githubusercontent.com/ds/nc/main/datapackage.json', domain: 'open data', license: 'ODC-PDDL-1.0' },
  { url: 'https://raw.githubusercontent.com/ds/sites/main/monthly.csv', domain: 'open data', license: 'CC0-1.0' },
  { url: 'https://raw.githubusercontent.com/ds/closed/main/closed.csv', domain: 'open data', license: 'CC-BY-NC-4.0' },
  { url: 'https://raw.githubusercontent.com/ds/doc/main/README.md', domain: 'open data', license: 'CC0-1.0' },
];
const LBYTES = {
  ...BYTES, [LRAW + 'datapackage.json']: PKG, [LRAW + 'data/pop.csv']: LONG_CSV, [LRAW + 'data/keyed.csv']: KEYED_CSV,
  'https://raw.githubusercontent.com/ds/nc/main/datapackage.json': NCPKG, 'https://raw.githubusercontent.com/ds/nc/main/data/nc.csv': LONG_CSV,
  'https://raw.githubusercontent.com/ds/sites/main/monthly.csv': MONTHLY_CSV, 'https://raw.githubusercontent.com/ds/closed/main/closed.csv': LONG_CSV,
};
function longTree(seeds = SEED_LIST) {
  const root = tree();
  fs.writeFileSync(path.join(root, 'neo', 'frontier-seeds.json'), JSON.stringify({ seeds }));
  return root;
}
const recsOf = (csv) => { const [h, ...rows] = csv.trim().split('\n').map((l) => l.split(',')); return rows.map((r) => Object.fromEntries(h.map((c, i) => [c, r[i]]))); };
const colsOf = (csv) => csv.split('\n')[0].split(',');

test('longShape: entity and time columns that repeat, every pair once, and the number columns beside them; anything else is no long table', () => {
  assert.deepEqual(longShape(recsOf(LONG_CSV), colsOf(LONG_CSV)), { entity: 'Region Name', time: 'Year', values: ['Value'] });
  assert.deepEqual(longShape(recsOf(MONTHLY_CSV), colsOf(MONTHLY_CSV)), { entity: 'site', time: 'month', values: ['reading'] });
  assert.equal(longShape(recsOf(KEYED_CSV), colsOf(KEYED_CSV)), null, 'a key column: the frontier reads it');
  const twice = LONG_CSV + 'Aland,ALA,2000,5,x\n';
  assert.equal(longShape(recsOf(twice), colsOf(twice)), null, 'a pair written twice');
  const notTime = LONG_CSV.replace('Aland,ALA,2003', 'Aland,ALA,soon');
  assert.equal(longShape(recsOf(notTime), colsOf(notTime)), null, 'a time cell that is no time');
  const few = LONG_CSV.split('\n').slice(0, 20).join('\n') + '\n';
  assert.equal(longShape(recsOf(few), colsOf(few)), null, 'under ' + MIN_TABLE_ROWS + ' pairs');
  const noNum = LONG_CSV.replace(/,\d+,x$/gm, ',y,x');
  assert.equal(longShape(recsOf(noNum), colsOf(noNum)), null, 'no number column');
  assert.equal(longShape(null, null), null);
});

test('longPackOf: the entity, time and value columns, the long field and the licence; a FORBIDDEN row drops; rows past the bar are cut', () => {
  const pk = longPackOf('lt-pop-pop', LRAW + 'data/pop.csv', Buffer.from(LONG_CSV), { at: 'T', license: 'ODC-PDDL-1.0' });
  assert.deepEqual(pk.columns, ['Region Name', 'Year', 'Value']);
  assert.deepEqual(pk.long, ['Region Name', 'Year']);
  assert.equal(pk.license, 'ODC-PDDL-1.0');
  assert.equal(pk.rows.length, 30);
  assert.deepEqual(pk.rows[0], ['Aland', '2000', 1000]);
  assert.equal(pk.sha, sha(Buffer.from(LONG_CSV)));
  const evil = LONG_CSV.replace('Fenwick,FEN,2004', 'eval(1),FEN,2004');
  assert.equal(longPackOf('x', LRAW + 'e.csv', Buffer.from(evil), { at: 'T' }).dropped, 1);
  const full = Buffer.byteLength(JSON.stringify(pk) + '\n');
  const small = longPackOf('lt-pop-pop', LRAW + 'data/pop.csv', Buffer.from(LONG_CSV), { at: 'T', license: 'ODC-PDDL-1.0', maxBytes: full - 40 });
  assert.ok(small.cut >= 1 && small.rows.length === 30 - small.cut);
  assert.ok(Buffer.byteLength(JSON.stringify(small) + '\n') <= full - 40);
  assert.match(longPackOf('x', LRAW + 'k.csv', Buffer.from(KEYED_CSV), { at: 'T' }).why, /not a long table/);
  assert.match(longPackOf('x', LRAW + 'k.md', Buffer.from('# hi'), { at: 'T' }).why, /not a table/);
});

test('shelve: the root\'s seeds give long packs (open licences only, off-allowlist resources never fetched), indexed as kind long', async () => {
  const root = longTree();
  try {
    const s = stub(LBYTES);
    const r = await shelve(root, { ...s, now: () => '2026-10-02T00:00:00.000Z' });
    assert.deepEqual(r.shelved.filter((x) => x.startsWith('lt-')), ['lt-pop-pop (long)', 'lt-sites-monthly (long)']);
    assert.deepEqual(r.long, { packs: 2, notLong: 1, waiting: 0 });
    assert.ok(!s.calls.includes('https://example.com/x.csv'), 'a resource off the allowlist is never fetched');
    assert.ok(!s.calls.includes('https://raw.githubusercontent.com/ds/nc/main/data/nc.csv'), 'a package under a non-commercial licence gives no table');
    assert.ok(!s.calls.includes('https://raw.githubusercontent.com/ds/closed/main/closed.csv'), 'a table seed under a closed licence is never fetched');
    assert.ok(!s.calls.some((u) => u.endsWith('README.md') || u.endsWith('notes.md')), 'a page is no long table');
    const e = readIndex(root).packs.find((p) => p.id === 'lt-pop-pop');
    assert.deepEqual(e, { id: 'lt-pop-pop', columns: ['Region Name', 'Year', 'Value'], rows: 30, sha: sha(Buffer.from(LONG_CSV)), kind: 'long', long: ['Region Name', 'Year'], from: LRAW + 'data/pop.csv' });
    const loaded = loadPacks(root).packs.find((p) => p.id === 'lt-pop-pop');
    assert.deepEqual(loaded.long, ['Region Name', 'Year'], 'the loaded pack carries its long field to the search');
    assert.equal(pack(root, 'caps').id, 'caps', 'the registry packs are shelved as before');
    const st = readJson(root, LONG_STATE);
    assert.equal(st.seen[LRAW + 'data/keyed.csv'].why, 'not a long table');
    assert.equal(st.seen['https://raw.githubusercontent.com/ds/nc/main/datapackage.json'].why, 'licence not open');
    // the next shelve looks at nothing it has seen within LONG_RECHECK_MS
    const s2 = stub(LBYTES);
    const r2 = await shelve(root, s2);
    assert.deepEqual(s2.calls, [], 'nothing fetched again');
    assert.deepEqual(r2.long, { packs: 2, notLong: 0, waiting: 0 });
    // past LONG_RECHECK_MS the same bytes are unchanged; changed bytes rewrite the same pack
    const later = Date.now() + LONG_RECHECK_MS + 1000;
    const s3 = stub({ ...LBYTES, [LRAW + 'data/pop.csv']: LONG_CSV.replace('Aland,ALA,2000,1000', 'Aland,ALA,2000,999') });
    const r3 = await shelve(root, { ...s3, clock: () => later });
    assert.deepEqual(r3.shelved, ['lt-pop-pop (long)']);
    assert.equal(r3.unchanged, 4, 'three registry packs and the monthly table');
    assert.equal(pack(root, 'lt-pop-pop').rows[0][2], 999);
  } finally { rm(root); }
});

test('shelve: at most longFetches fetches a shelve; the rest waits and the next shelve goes on from there', async () => {
  const root = longTree();
  try {
    const r = await shelve(root, { ...stub(LBYTES), longFetches: 2 });
    assert.deepEqual(r.shelved.filter((x) => x.startsWith('lt-')), ['lt-pop-pop (long)']);
    assert.ok(r.long.waiting >= 1);
    const s2 = stub(LBYTES);
    const r2 = await shelve(root, { ...s2, longFetches: 2 });
    assert.ok(!s2.calls.includes(LRAW + 'data/pop.csv'), 'a table shelved is not fetched again');
    assert.ok(s2.calls.includes(LRAW + 'data/keyed.csv'), 'the package left unfinished is finished');
    const s3 = stub(LBYTES);
    const r3 = await shelve(root, { ...s3, longFetches: 2 });
    assert.deepEqual([...r2.shelved, ...r3.shelved].filter((x) => x.startsWith('lt-')), ['lt-sites-monthly (long)']);
    const root0 = longTree();
    try { assert.equal((await shelve(root0, { ...stub(LBYTES), longFetches: 0 })).long.packs, 0); } finally { rm(root0); }
  } finally { rm(root); }
});

test('shelve: a root with no frontier-seeds.json of its own looks for no long table (never another tree\'s seeds)', async () => {
  const root = tree();
  try {
    const s = stub(LBYTES);
    const r = await shelve(root, s);
    assert.ok(s.calls.every((u) => SOURCES.some((x) => x.url === u)), s.calls.join(' '));
    assert.equal(r.long.packs, 0);
    assert.ok(!fs.existsSync(path.join(root, ...LONG_STATE.split('/'))));
  } finally { rm(root); }
});

test('shelve: a long id never takes a registry source id, and two tables of one name get two ids', async () => {
  const seeds = [{ url: 'https://raw.githubusercontent.com/ds/pop/main/pop.csv', domain: 'open data', license: 'CC0-1.0' }, { url: 'https://raw.githubusercontent.com/ds/pop/dev/pop.csv', domain: 'open data', license: 'CC0-1.0' }];
  const root = longTree(seeds);
  const reg = readJson(root, 'neo/sources.json');
  reg.sources.push({ id: 'lt-pop-pop', kind: 'not-a-kind', url: RAW + 'caps.json', make: {} });
  fs.writeFileSync(path.join(root, 'neo', 'sources.json'), JSON.stringify(reg));
  try {
    const r = await shelve(root, stub({ ...BYTES, [seeds[0].url]: LONG_CSV, [seeds[1].url]: MONTHLY_CSV }));
    assert.deepEqual(r.shelved.filter((x) => x.startsWith('lt-')), ['lt-pop-pop-2 (long)', 'lt-pop-pop-3 (long)']);
  } finally { rm(root); }
});
