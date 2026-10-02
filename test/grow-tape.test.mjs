// test/grow-tape.test.mjs: THE TAPE (grow/tape.mjs), offline: a fake fetch, a fake clock, a temp root per test.
// Every rule has a test that fails when the rule is dropped: the allowlist, GET only, the per-host clock, a 429 backs
// off, the byte cap, the pack cap and the thinning, idempotence within an era, the rotation covers every key, discover
// stays on the allowlist and is bounded, a body that is not JSON is refused and named, the pack validates under
// grow/know.mjs, a host that fails five eras in a row is parked and named.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as T from '../grow/tape.mjs';
import { pack as knowPack, packs as knowPacks, lookup, loadPacks } from '../grow/know.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TREE = path.resolve(HERE, '..');
const H = 'data.example.com', H2 = 'other.example.org', OFF = 'evil.example.net';
const START = Date.UTC(2026, 9, 2, 12, 0, 0);

function mkRoot(seeds) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tape-test-'));
  fs.mkdirSync(path.join(root, 'neo'), { recursive: true });
  if (seeds) fs.writeFileSync(path.join(root, 'neo', 'tapes-seeds.json'), JSON.stringify(seeds));
  return root;
}
const rm = (root) => fs.rmSync(root, { recursive: true, force: true });
function fakeClock(start = START) {
  let t = start;
  return { clock: () => t, sleep: async (ms) => { t += ms; }, advance: (ms) => { t += ms; } };
}
/** route(url, n) => { status, body, headers } | null (404) */
function fakeNet(route, clk) {
  const calls = [];
  const fetch = async (url, init = {}) => {
    calls.push({ url, at: clk.clock(), method: init.method, host: new URL(url).hostname });
    const r = route(url, calls.length);
    if (!r) return new Response('no route', { status: 404 });
    return new Response(r.body ?? '', { status: r.status ?? 200, headers: r.headers ?? {} });
  };
  return { fetch, calls };
}
const json = (v, headers = {}) => ({ status: 200, body: JSON.stringify(v), headers: { 'content-type': 'application/json', ...headers } });
const list = (n) => Array.from({ length: n }, (_, i) => ({ sym: 'K' + String(i).padStart(3, '0'), price: 10 + i, vol: n - i }));
const tape = (id, extra = {}) => ({ id, url: 'https://' + H + '/v1/' + id, root: '', key: 'sym', keyLabel: 'symbol', fields: [{ path: 'price', label: 'price' }, { path: 'vol', label: 'volume' }], top: 50, rotate: 50, ...extra });
const seeds = (tapes, extra = {}) => ({ allowedHosts: [H, H2], tapes, ...extra });
const run = (root, net, clk, o = {}) => T.pull(root, { fetch: net.fetch, clock: clk.clock, sleep: clk.sleep, codeRoot: root, maxMs: 600000, ...o });
const reg = (root) => JSON.parse(fs.readFileSync(path.join(root, 'neo', 'tapes.json'), 'utf8'));
const packFile = (root, id) => path.join(root, 'neo', 'know', 'tape-' + id + '.json');
const readText = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return null; } };

test('the allowlist: off-list host, http, credentials, a port, an order/wallet/account path or a key in the query are refused', () => {
  const ok = [H];
  assert.equal(T.urlRefusal('https://' + H + '/v1/tickers?limit=5', ok), '');
  assert.match(T.urlRefusal('https://' + OFF + '/v1/tickers', ok), /not on the allowlist/);
  assert.match(T.urlRefusal('http://' + H + '/v1/tickers', ok), /not https/);
  assert.match(T.urlRefusal('https://u:p@' + H + '/v1', ok), /credentials/);
  assert.match(T.urlRefusal('https://' + H + ':8443/v1', ok), /non-default port/);
  for (const p of ['/v1/orders', '/api/wallet/x', '/v2/accounts', '/withdraw', '/v1/swap', '/oauth/token', '/v1/balances']) assert.match(T.urlRefusal('https://' + H + p, ok), /order, wallet, account or credential/, p);
  for (const q of ['apikey=1', 'api_key=1', 'token=x', 'access_token=x', 'key=1', 'signature=s']) assert.match(T.urlRefusal('https://' + H + '/v1/x?' + q, ok), /carries a key/, q);
  assert.match(T.urlRefusal('not a url', ok), /not a URL/);
});

test('the allowlist holds on a pull: an off-list tape is named and never fetched; every request is a GET', async () => {
  const root = mkRoot(seeds([tape('good'), tape('bad', { url: 'https://' + OFF + '/v1/bad' })]));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(3)), clk);
    const out = await run(root, net, clk, { era: 1 });
    assert.ok(out.blocked.some((l) => /^tape bad: url: the host evil\.example\.net is not on the allowlist/.test(l)), out.blocked.join(' | '));
    assert.deepEqual(net.calls.map((c) => c.host), [H]);
    assert.ok(net.calls.every((c) => c.method === 'GET'));
    assert.equal(out.pulled, 1);
  } finally { rm(root); }
});

test('a redirect to a host off the list is refused before it is fetched', async () => {
  const clk = fakeClock();
  const net = fakeNet((u) => (u.includes(OFF) ? json([]) : { status: 302, headers: { location: 'https://' + OFF + '/x' } }), clk);
  await assert.rejects(T.fetchGet('https://' + H + '/v1/x', { fetch: net.fetch, allowed: [H] }), (e) => e.kind === 'refused' && /redirect refused before the fetch/.test(e.message));
  assert.deepEqual(net.calls.map((c) => c.host), [H]);
});

test('the byte cap: a body over the cap is refused, by its content-length and while streamed', async () => {
  const clk = fakeClock();
  const big = 'x'.repeat(1000);
  const a = fakeNet(() => ({ status: 200, body: big, headers: { 'content-length': '1000' } }), clk);
  await assert.rejects(T.fetchGet('https://' + H + '/a', { fetch: a.fetch, allowed: [H], maxBytes: 100 }), (e) => e.kind === 'size');
  const b = fakeNet(() => ({ status: 200, body: big }), clk);
  await assert.rejects(T.fetchGet('https://' + H + '/b', { fetch: async (u, i) => { const r = await b.fetch(u, i); return { status: r.status, url: '', headers: { get: () => null }, body: r.body }; }, allowed: [H], maxBytes: 100 }), (e) => e.kind === 'size');
  const c = fakeNet(() => ({ status: 200, body: '[1]' }), clk);
  const got = await T.fetchGet('https://' + H + '/c', { fetch: c.fetch, allowed: [H], maxBytes: 100 });
  assert.equal(got.bytes.toString(), '[1]');
  // a declared length over the cap is refused before one byte of the body is read
  let reads = 0;
  const stream = new ReadableStream({ pull(ctl) { reads++; ctl.enqueue(new TextEncoder().encode(big)); ctl.close(); } }, { highWaterMark: 0 });
  const lying = async () => ({ status: 200, url: '', headers: { get: (k) => (k.toLowerCase() === 'content-length' ? '1000' : null) }, body: stream });
  await assert.rejects(T.fetchGet('https://' + H + '/d', { fetch: lying, allowed: [H], maxBytes: 100 }), (e) => e.kind === 'size' && /1000 bytes, 100 allowed/.test(e.message));
  assert.equal(reads, 0);
});

test('one request a second per host: three tapes on one host are at least 1000 ms apart; hostGapMs slows a host', async () => {
  const root = mkRoot(seeds([tape('a'), tape('b'), tape('c')]));
  const root2 = mkRoot(seeds([tape('d', { url: 'https://' + H2 + '/d' }), tape('e', { url: 'https://' + H2 + '/e' })], { hostGapMs: { [H2]: 2500 } }));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(2)), clk);
    await run(root, net, clk, { era: 1 });
    assert.equal(net.calls.length, 3);
    for (let i = 1; i < 3; i++) assert.ok(net.calls[i].at - net.calls[i - 1].at >= 1000, 'gap ' + (net.calls[i].at - net.calls[i - 1].at));
    const clk2 = fakeClock(), net2 = fakeNet(() => json(list(2)), clk2);
    await run(root2, net2, clk2, { era: 1 });
    assert.equal(net2.calls.length, 2);
    assert.ok(net2.calls[1].at - net2.calls[0].at >= 2500, 'gap ' + (net2.calls[1].at - net2.calls[0].at));
  } finally { rm(root); rm(root2); }
});

test('a 429 backs off: the gap doubles, the rest of the host waits, nothing is asked before Retry-After, then it is asked at the slower gap', async () => {
  const root = mkRoot(seeds([tape('a'), tape('b'), tape('c')]));
  try {
    const clk = fakeClock();
    const net = fakeNet((u, n) => (n === 1 ? { status: 429, body: 'slow down', headers: { 'retry-after': '120' } } : json(list(2))), clk);
    const t0 = clk.clock();
    const o1 = await run(root, net, clk, { era: 1 });
    assert.equal(net.calls.length, 1);
    assert.equal(o1.waiting, 3);
    let hs = reg(root).state.hosts[H];
    assert.equal(hs.gapMs, 2000);
    assert.equal(hs.until, t0 + 120000);
    clk.advance(60000);
    const o2 = await run(root, net, clk, { era: 2 });
    assert.equal(net.calls.length, 1, 'asked before Retry-After');
    assert.equal(o2.waiting, 3);
    clk.advance(61000);
    const o3 = await run(root, net, clk, { era: 3 });
    assert.equal(o3.pulled, 3);
    const later = net.calls.slice(1);
    for (let i = 1; i < later.length; i++) assert.ok(later[i].at - later[i - 1].at >= 2000, 'gap ' + (later[i].at - later[i - 1].at));
    hs = reg(root).state.hosts[H];
    assert.equal(hs.gapMs, 1800, 'a clean era eases the gap by a tenth, never under the base');
  } finally { rm(root); }
});

test('thinIndex: the oldest half thins first, the snapshot nearest its older neighbour, never the newest', () => {
  const g = (mins) => mins.map((m) => ({ time: T.isoSecond(START + m * 60000) }));
  assert.equal(T.thinIndex(g([0])), -1);
  assert.equal(T.thinIndex(g([0, 10])), 0);
  assert.equal(T.thinIndex(g([0, 10, 20])), 0);
  // nine snapshots: the oldest half of the eight older ones is indices 0..3; index 2 is 1 minute after index 1
  assert.equal(T.thinIndex(g([0, 10, 11, 30, 40, 41, 50, 60, 70])), 2);
  const eight = g([0, 10, 20, 30, 40, 41, 42, 43]);
  const i = T.thinIndex(eight);
  assert.ok(i >= 1 && i < 4, 'index ' + i);
});

test('the cap: a pack never passes it; the newest two snapshots stay; old snapshots are thinned, not the new', () => {
  const t = tape('capped');
  let prev = null;
  const cap = 3000;
  const times = [];
  for (let s = 0; s < 25; s++) {
    const at = T.isoSecond(START + s * 3600000);
    times.push(at);
    const rows = T.snapshotRows(list(8).map((r) => [r.sym, r]), t, at);
    const out = T.appendSnapshot(prev, t, rows, { at, era: s, cap });
    assert.ok(out.pk, out.why);
    assert.ok(out.size <= cap, 'size ' + out.size);
    assert.equal(Buffer.byteLength(out.text), out.size);
    const ts = [...new Set(out.pk.rows.map((r) => r[1]))];
    assert.equal(ts.at(-1), at, 'the newest snapshot is kept');
    if (s >= 1) assert.equal(ts.at(-2), times[s - 1], 'the second newest is kept');
    prev = JSON.parse(out.text);
  }
  assert.ok(prev.tape.thinned > 0);
  assert.equal(prev.tape.first, times[0], 'the oldest snapshot anchors the window while the old half thins');
  // the newest alone over the cap: its last rows are cut, never a pack over the cap
  const huge = T.snapshotRows(list(200).map((r) => [r.sym, r]), t, T.isoSecond(START));
  const cut = T.appendSnapshot(null, t, huge, { at: T.isoSecond(START), cap: 4096 });
  assert.ok(cut.size <= 4096 && cut.cut > 0 && cut.pk.rows[0][0] === 'K000');
  // a cap that not even one row fits: no pack at all, never a pack over its cap
  const none = T.appendSnapshot(null, t, huge, { at: T.isoSecond(START), cap: 200 });
  assert.equal(none.pk, null);
  assert.match(none.why, /over the cap of 200 bytes/);
});

test('appendSnapshot maps an older pack to the tape columns by name and never appends one time twice', () => {
  const t = tape('m');
  const prev = { id: 'tape-m', columns: ['symbol', 'time', 'price'], rows: [['A', T.isoSecond(START), 1]] };
  const at = T.isoSecond(START + 60000);
  const out = T.appendSnapshot(prev, t, [['A', at, 2, 7]], { at });
  assert.deepEqual(out.pk.columns, ['symbol', 'time', 'price', 'volume']);
  assert.deepEqual(out.pk.rows, [['A', T.isoSecond(START), 1, ''], ['A', at, 2, 7]]);
  const again = T.appendSnapshot(out.pk, t, [['A', at, 3, 8]], { at });
  assert.equal(again.pk, null);
});

test('a pull keeps every tape pack under its own maxBytes over many eras, and every pack validates', async () => {
  const root = mkRoot(seeds([tape('small', { maxBytes: 4096 })]));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(12)), clk);
    for (let e = 1; e <= 12; e++) {
      const out = await run(root, net, clk, { era: e });
      assert.equal(out.pulled, 1);
      assert.ok(fs.statSync(packFile(root, 'small')).size <= 4096);
      assert.ok(knowPack(root, 'tape-small'), 'valid under know.pack');
      clk.advance(3600000);
    }
    assert.ok(knowPack(root, 'tape-small').tape.thinned > 0);
  } finally { rm(root); }
});

test('idempotent within one era: a second pull of the same era asks nothing and changes no byte; a new era appends', async () => {
  const root = mkRoot(seeds([tape('a'), tape('b', { url: 'https://' + H2 + '/b' })]));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(4)), clk);
    const o1 = await run(root, net, clk, { era: 7 });
    assert.equal(o1.pulled, 2);
    const files = [packFile(root, 'a'), packFile(root, 'b'), path.join(root, 'neo', 'know', 'INDEX.json'), path.join(root, 'neo', 'tapes.json')];
    const before = files.map(readText);
    clk.advance(120000);
    const o2 = await run(root, net, clk, { era: 7 });
    assert.equal(o2.requests, 0);
    assert.equal(o2.unchanged, 2);
    assert.deepEqual(files.map(readText), before);
    // a pull stopped after the pack and before the registry: the pack itself says the era is done
    const r = reg(root);
    delete r.state.tapes.a.lastEra;
    fs.writeFileSync(path.join(root, 'neo', 'tapes.json'), JSON.stringify(r));
    const o3 = await run(root, net, clk, { era: 7 });
    assert.equal(o3.requests, 0);
    assert.equal(readText(packFile(root, 'a')), before[0]);
    // the registry alone marks the era done: with the pack gone, the same era still asks nothing
    fs.rmSync(packFile(root, 'b'));
    const o3b = await run(root, net, clk, { era: 7 });
    assert.equal(o3b.requests, 0);
    const o4 = await run(root, net, clk, { era: 8 });
    assert.equal(o4.pulled, 2);
    assert.equal(knowPack(root, 'tape-a').tape.snapshots, 2);
  } finally { rm(root); }
});

test('rotation: a listing longer than top + rotate keeps the top keys in every snapshot and sees every key over the eras', async () => {
  // ranked by price, the top five are the LAST five of the listing (the listing order is not the rank)
  const root = mkRoot(seeds([tape('wide', { rankBy: 'price', top: 5, rotate: 30 })]));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(200)), clk);
    for (let e = 1; e <= 7; e++) { const out = await run(root, net, clk, { era: e }); assert.equal(out.keys, 35); clk.advance(60000); }
    const pk = knowPack(root, 'tape-wide');
    const seen = new Set(pk.rows.map((r) => r[0]));
    assert.equal(seen.size, 200, 'every key seen over seven eras');
    const byTime = new Map();
    for (const r of pk.rows) { if (!byTime.has(r[1])) byTime.set(r[1], new Set()); byTime.get(r[1]).add(r[0]); }
    assert.equal(byTime.size, 7);
    for (const ks of byTime.values()) for (const top of ['K199', 'K198', 'K197', 'K196', 'K195']) assert.ok(ks.has(top), top);
    assert.ok(reg(root).state.tapes.wide.cycles >= 1);
  } finally { rm(root); }
});

test('selectKeys: the window walks the rest in key order from the cursor and wraps; a missing or forbidden key is dropped', () => {
  const t = { id: 'x', key: 'sym', top: 1, rotate: 2, rankBy: 'vol' };
  const recs = [{ sym: 'a', vol: 9 }, { sym: 'b', vol: 1 }, { sym: 'c', vol: 2 }, { sym: 'd', vol: 3 }, { sym: 'a', vol: 0 }, { vol: 5 }, { sym: 'process', vol: 1 }, { sym: '<b>', vol: 1 }];
  const s1 = T.selectKeys(recs, t, null);
  assert.deepEqual(s1.chosen.map((c) => c[0]), ['a', 'b', 'c']);
  assert.equal(s1.dupes, 1);
  assert.equal(s1.dropped, 1);
  assert.equal(s1.nokey, 2);
  const s2 = T.selectKeys(recs, t, s1.cursor);
  assert.deepEqual(s2.chosen.map((c) => c[0]), ['a', 'd', 'b']);
  assert.equal(s2.wrapped, true);
  const one = T.selectKeys([{ v: 1 }, { v: 2 }], { id: 'solo', key: null, top: 1, rotate: 0 }, null);
  assert.deepEqual(one.chosen.map((c) => c[0]), ['solo']);
});

test('discover: URLs a record names become tapes only on the allowlist, at most max a pull, never twice, with a time to live', async () => {
  const recs = [
    { sym: 'A', link: 'https://' + H + '/item/A' }, { sym: 'B', link: 'https://' + OFF + '/item/B' }, { sym: 'C', link: 'https://' + H + '/item/C' },
    { sym: 'D', link: 'https://' + H + '/item/D' }, { sym: 'E', link: 'http://' + H + '/item/E' }, { sym: 'F', link: 'https://' + H + '/wallets/F' },
  ];
  const as = { root: '', key: 'sym', keyLabel: 'symbol', fields: [{ path: 'price', label: 'price' }], top: 1, rotate: 0 };
  const root = mkRoot(seeds([tape('src', { fields: [], discover: { path: 'link', max: 2, as } })]));
  try {
    const clk = fakeClock();
    const net = fakeNet((u) => (u.endsWith('/v1/src') ? json(recs) : json({ sym: u.split('/').pop(), price: 1 })), clk);
    const o1 = await run(root, net, clk, { era: 1 });
    assert.equal(o1.discovered.length, 2);
    assert.equal(o1.offList, 1);
    let r = reg(root);
    const found = r.tapes.filter((t) => t.from === 'discover:src');
    assert.deepEqual(found.map((t) => t.url), ['https://' + H + '/item/A', 'https://' + H + '/item/C']);
    for (const t of found) { assert.equal(T.urlRefusal(t.url, r.allowedHosts), ''); assert.equal(t.expires, START + T.TTL_MS); assert.deepEqual(T.tapeErrors(t, r.allowedHosts), []); }
    clk.advance(60000);
    const o2 = await run(root, net, clk, { era: 2 });
    assert.deepEqual(o2.discovered.length, 1, 'D only: A and C are known, E is http, F names a wallet');
    assert.ok(o2.offList >= 2);
    r = reg(root);
    const urls = r.tapes.map((t) => t.url);
    assert.equal(new Set(urls).size, urls.length, 'never twice');
    assert.ok(!urls.some((u) => u.includes(OFF) || u.startsWith('http:') || u.includes('wallets')));
    assert.equal(o2.pulled, 3, 'src and the two tapes found in era 1');
    // a tape past its time to live leaves the registry
    clk.advance(T.TTL_MS);
    const o3 = await run(root, net, clk, { era: 3, maxDiscover: 0 });
    assert.ok(o3.retired >= 2);
    assert.equal(o3.discovered.length, 0);
  } finally { rm(root); }
});

test('discover never adds a URL the registry already watches, whoever names it', async () => {
  const as = { root: '', key: 'sym', keyLabel: 'symbol', fields: [{ path: 'price', label: 'price' }], top: 1, rotate: 0 };
  const links = (xs) => xs.map((x) => ({ sym: x, link: 'https://' + H + '/item/' + x }));
  const root = mkRoot(seeds([
    tape('one', { fields: [], discover: { path: 'link', max: 5, as } }),
    tape('two', { fields: [], url: 'https://' + H2 + '/v1/two', discover: { path: 'link', max: 5, as } }),
    tape('watched', { url: 'https://' + H + '/item/A' }),
  ]));
  try {
    const clk = fakeClock();
    const net = fakeNet((u) => (u.endsWith('/v1/one') ? json(links(['A', 'B'])) : u.endsWith('/v1/two') ? json(links(['A', 'B', 'C'])) : json({ sym: 'x', price: 1, vol: 1 })), clk);
    const out = await run(root, net, clk, { era: 1 });
    const urls = reg(root).tapes.map((t) => t.url);
    assert.equal(new Set(urls).size, urls.length, 'no URL twice');
    assert.deepEqual(out.discovered.length, 2, 'B and C, never A again');
    assert.equal(urls.filter((u) => u.endsWith('/item/A')).length, 1);
  } finally { rm(root); }
});

test('discover by template: fields are URL-encoded into the template, a record missing one names nothing', () => {
  const d = { template: 'https://' + H + '/t/{chain}/{addr}' };
  assert.deepEqual(T.discoverUrls({ chain: 'sol', addr: 'X/../Y' }, d), ['https://' + H + '/t/sol/X%2F..%2FY']);
  assert.deepEqual(T.discoverUrls({ chain: 'sol' }, d), []);
  assert.deepEqual(T.discoverUrls({ links: ['https://a', 'https://b', 7] }, { path: 'links' }), ['https://a', 'https://b']);
  assert.ok(T.ID_RE.test(T.discoverId('a-very-long-parent-name-that-goes-on-and-on-and-on', 'https://x/y')));
});

test('a body that is not JSON is refused and named, and no pack is written; markup is not CSV; a CSV tape reads', async () => {
  const root = mkRoot(seeds([tape('page'), tape('sheet', { format: 'csv', url: 'https://' + H2 + '/sheet.csv' }), tape('table', { format: 'csv', url: 'https://' + H2 + '/table.csv' })]));
  try {
    const clk = fakeClock();
    const net = fakeNet((u) => (u.endsWith('/page') ? { status: 200, body: '<html><body>hi</body></html>', headers: { 'content-type': 'text/html' } }
      : u.endsWith('sheet.csv') ? { status: 200, body: '<!doctype html><p>no</p>' } : { status: 200, body: 'sym,price,vol\nA,1.5,10\nB,"2,000",20\n' }), clk);
    const out = await run(root, net, clk, { era: 1 });
    assert.ok(out.blocked.some((l) => /^tape page: the body is not JSON \(\d+ bytes, text\/html\)/.test(l)), out.blocked.join(' | '));
    assert.ok(out.blocked.some((l) => /^tape sheet: the body is markup, not CSV/.test(l)));
    assert.equal(readText(packFile(root, 'page')), null);
    assert.equal(reg(root).state.tapes.page.fails, 1);
    const pk = knowPack(root, 'tape-table');
    assert.deepEqual(pk.rows.map((r) => [r[0], r[2], r[3]]), [['A', 1.5, 10], ['B', 2000, 20]]);
  } finally { rm(root); }
  assert.throws(() => T.recordsFrom(Buffer.from('{"a":'), { format: 'json' }), (e) => e.kind === 'body' && /not JSON/.test(e.message));
});

test('the pack validates under grow/know.mjs: its index entry, pack(), packs(), loadPacks(), lookup on one snapshot, other packs kept', async () => {
  const root = mkRoot(seeds([tape('px')]));
  try {
    const know = path.join(root, 'neo', 'know');
    fs.mkdirSync(know, { recursive: true });
    fs.writeFileSync(path.join(know, 'countries.json'), JSON.stringify({ id: 'countries', from: 'x', sha: 'y', columns: ['country', 'capital'], rows: [['France', 'Paris']], at: 'z' }) + '\n');
    fs.writeFileSync(path.join(know, 'INDEX.json'), JSON.stringify({ packs: [{ id: 'countries', columns: ['country', 'capital'], rows: 1, sha: 'y' }] }));
    const clk = fakeClock(), net = fakeNet(() => json(list(3)), clk);
    await run(root, net, clk, { era: 1 });
    const ids = knowPacks(root).map((p) => p.id);
    assert.deepEqual(ids, ['countries', 'tape-px']);
    const entry = knowPacks(root).find((p) => p.id === 'tape-px');
    const pk = knowPack(root, 'tape-px');
    assert.ok(pk);
    assert.deepEqual(pk.columns, ['symbol', 'time', 'price', 'volume']);
    assert.equal(entry.rows, pk.rows.length);
    assert.equal(entry.sha, pk.sha);
    assert.deepEqual(entry.columns, pk.columns);
    assert.equal(loadPacks(root).blocked.length, 0);
    assert.equal(String(lookup(pk, 'symbol', 'K001', 'price')), '11');
    assert.ok(Buffer.byteLength(fs.readFileSync(packFile(root, 'px'))) <= T.TAPE_MAX_BYTES);
  } finally { rm(root); }
});

test('a host that fails five eras in a row is parked and named; a day later one probe; a success before the fifth resets it', async () => {
  const root = mkRoot(seeds([tape('ok'), tape('bad1', { url: 'https://' + H2 + '/bad1' }), tape('bad2', { url: 'https://' + H2 + '/bad2' })]));
  try {
    const clk = fakeClock();
    const net = fakeNet((u) => (u.includes(H2) ? { status: 500, body: 'down' } : json(list(2))), clk);
    for (let e = 1; e <= 4; e++) { const o = await run(root, net, clk, { era: e }); assert.equal(o.parked.length, 0, 'era ' + e); clk.advance(60000); }
    const o5 = await run(root, net, clk, { era: 5 });
    assert.ok(o5.parked.some((l) => l.startsWith(H2 + ': HTTP 500 (5 eras in a row')), o5.parked.join(' | '));
    const n5 = net.calls.filter((c) => c.host === H2).length;
    clk.advance(60000);
    await run(root, net, clk, { era: 6 });
    assert.equal(net.calls.filter((c) => c.host === H2).length, n5, 'a parked host is not asked');
    // a tape new to the registry on a parked host is not asked either
    const r = reg(root);
    r.tapes.push(tape('bad3', { url: 'https://' + H2 + '/bad3' }));
    fs.writeFileSync(path.join(root, 'neo', 'tapes.json'), JSON.stringify(r));
    await run(root, net, clk, { era: 6 });
    assert.equal(net.calls.filter((c) => c.host === H2).length, n5, 'a parked host is not asked for a new tape');
    clk.advance(T.PARK_RETRY_MS);
    const o7 = await run(root, net, clk, { era: 7 });
    assert.equal(net.calls.filter((c) => c.host === H2).length, n5 + 1, 'one probe a day');
    assert.ok(o7.parked.some((l) => l.startsWith(H2)));
  } finally { rm(root); }
  const root2 = mkRoot(seeds([tape('flaky', { url: 'https://' + H2 + '/flaky' })]));
  try {
    const clk = fakeClock();
    let up = false;
    const net = fakeNet(() => (up ? json(list(2)) : { status: 503, body: 'x' }), clk);
    for (let e = 1; e <= 4; e++) { await run(root2, net, clk, { era: e }); clk.advance(60000); }
    assert.equal(reg(root2).state.hosts[H2].fails, 4);
    up = true;
    await run(root2, net, clk, { era: 5 });
    assert.equal(reg(root2).state.hosts[H2].fails, 0);
    up = false;
    clk.advance(60000);
    const o = await run(root2, net, clk, { era: 6 });
    assert.equal(o.parked.length, 0);
  } finally { rm(root2); }
});

test('a deadline: tapes past --max-ms wait, and the next pull takes the least recently pulled first', async () => {
  const root = mkRoot(seeds(['t1', 't2', 't3', 't4', 't5'].map((id) => tape(id))));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(2)), clk);
    const o1 = await run(root, net, clk, { era: 1, maxMs: 3500 });
    assert.equal(o1.pulled, 3);
    assert.equal(o1.left, 2);
    assert.ok(o1.blocked.some((l) => /time budget/.test(l)));
    clk.advance(60000);
    const n = net.calls.length;
    await run(root, net, clk, { era: 2, maxMs: 3500 });
    assert.deepEqual(net.calls.slice(n, n + 2).map((c) => c.url.split('/').pop()), ['t4', 't5']);
  } finally { rm(root); }
});

test('the registry is made from the seeds on the first pull; an invalid seed is named and never pulled', async () => {
  const root = mkRoot(seeds([tape('fine'), { id: 'Bad Id', url: 'https://' + H + '/x' }, tape('nofields', { top: 0, rotate: 0 })]));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(2)), clk);
    const out = await run(root, net, clk, { era: 1 });
    assert.equal(out.created, true);
    const r = reg(root);
    assert.deepEqual(r.allowedHosts, [H, H2]);
    assert.equal(r.tapes.length, 3);
    assert.ok(out.blocked.some((l) => /^tape Bad Id: id is/.test(l)));
    assert.ok(out.blocked.some((l) => /^tape nofields: top and rotate/.test(l)));
    assert.equal(net.calls.length, 1);
    const again = await run(root, net, clk, { era: 2 });
    assert.equal(again.created, undefined);
  } finally { rm(root); }
});

test('numberOf reads JSON numbers, numeric strings with an exponent or thousands commas, and booleans; nothing else', () => {
  assert.equal(T.numberOf(1.5), 1.5);
  assert.equal(T.numberOf('1.23e-7'), 1.23e-7);
  assert.equal(T.numberOf(' 0.00000012 '), 0.00000012);
  assert.equal(T.numberOf('1,234.5'), 1234.5);
  assert.equal(T.numberOf(true), 1);
  assert.equal(T.numberOf(false), 0);
  for (const v of ['', 'abc', '12abc', null, undefined, NaN, Infinity, {}, [], '1e999']) assert.equal(T.numberOf(v), null, String(v));
});

test('tapeErrors: labels unique and not "time", a discover row declares its tapes and they do not discover', () => {
  const ok = [H];
  assert.deepEqual(T.tapeErrors(tape('x'), ok), []);
  assert.ok(T.tapeErrors(tape('x', { fields: [{ path: 'a', label: 'time' }] }), ok).length);
  assert.ok(T.tapeErrors(tape('x', { fields: [{ path: 'a', label: 'p' }, { path: 'b', label: 'p' }] }), ok).length);
  assert.ok(T.tapeErrors(tape('x', { discover: { path: 'link' } }), ok).some((e) => /discover.as/.test(e)));
  assert.ok(T.tapeErrors(tape('x', { discover: { path: 'link', as: { key: 'k', discover: { path: 'y', as: {} } } } }), ok).some((e) => /does not discover/.test(e)));
  assert.ok(T.tapeErrors(tape('x', { top: 900, rotate: 200 }), ok).length);
  assert.ok(T.tapeErrors(tape('x', { format: 'xml' }), ok).length);
});

test('the seed file of this tree: every seed validates on its own allowlist, was checked with status 200, and the seeds span several domains', () => {
  const doc = JSON.parse(fs.readFileSync(path.join(TREE, 'neo', 'tapes-seeds.json'), 'utf8'));
  assert.ok(Array.isArray(doc.tapes) && doc.tapes.length >= 8);
  const allowed = new Set(doc.allowedHosts);
  const ids = new Set();
  for (const t of doc.tapes) {
    assert.deepEqual(T.tapeErrors(t, allowed), [], t.id);
    assert.equal(t.checked && t.checked.status, 200, t.id);
    assert.ok(!ids.has(t.id), 'unique id ' + t.id);
    ids.add(t.id);
  }
  assert.ok(new Set(doc.tapes.map((t) => t.domain)).size >= 4, 'several domains');
  for (const h of doc.allowedHosts) assert.ok(T.HOST_RE.test(h), h);
  for (const [h, ms] of Object.entries(doc.hostGapMs || {})) assert.ok(allowed.has(h) && ms >= T.PER_HOST_MS && ms <= T.MAX_GAP_MS, h);
});

test('the CLI: help prints the usage, an unknown verb or flag exits 2, status prints one JSON line, main pull carries the era', async () => {
  const cli = path.join(TREE, 'grow', 'tape.mjs');
  const help = spawnSync(process.execPath, [cli, 'help'], { encoding: 'utf8' });
  assert.equal(help.status, 0);
  assert.match(help.stdout, /usage: node grow\/tape\.mjs/);
  assert.equal(spawnSync(process.execPath, [cli, 'nope'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [cli, 'pull', '--bogus', '1'], { encoding: 'utf8' }).status, 2);
  assert.equal(spawnSync(process.execPath, [cli, 'pull', '--era', 'x'], { encoding: 'utf8' }).status, 2);
  // a --root that is not there is refused before any request, and nothing is made there
  const missing = path.join(os.tmpdir(), 'tape-test-missing-' + process.pid + '-' + Date.now());
  const clk0 = fakeClock(), net0 = fakeNet(() => json(list(3)), clk0);
  await assert.rejects(T.main(['pull', '--root', missing, '--era', '1'], { fetch: net0.fetch, clock: clk0.clock, sleep: clk0.sleep }), (e) => e.code === 2 && /is not a directory/.test(e.message));
  assert.equal(net0.calls.length, 0);
  assert.equal(fs.existsSync(missing), false);
  const root = mkRoot(seeds([tape('cli')]));
  try {
    const clk = fakeClock(), net = fakeNet(() => json(list(3)), clk);
    const out = await T.main(['pull', '--root', root, '--era', '3', '--max-ms', '60000'], { fetch: net.fetch, clock: clk.clock, sleep: clk.sleep, codeRoot: root });
    assert.equal(out.era, 3);
    assert.equal(out.pulled, 1);
    const st = spawnSync(process.execPath, [cli, 'status', '--root', root], { encoding: 'utf8' });
    assert.equal(st.status, 0);
    const line = JSON.parse(st.stdout.trim().split('\n').pop());
    assert.equal(line.packs, 1);
    assert.equal(line.rows, 3);
    assert.equal(line.keys2, 0);
  } finally { rm(root); }
});
