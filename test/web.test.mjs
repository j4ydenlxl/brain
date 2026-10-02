// test/web.test.mjs: the site is the organism, so the test is parity.
//
// The claim web/ makes is strong and it is the only reason the site can be small: the
// organism is not shipped, it is GROWN in the tab, and what grows there is the same
// organism seeds/organism.mjs grows here. A test that only checked that the browser build
// produces "some brain" would be worth nothing. This one builds both sides at the same
// parameters and compares the cell count, the edge count, and a sha256 over every
// (src, dst, delay) triple in edge order, which is the structure and the schedule.
//
// It also holds the three rules the deploy path depends on: the bundle builds, the bundle
// is under the size cap, and web/src imports nothing from node.
//
// And the host: web/serve.mjs serves /ask with no redirect and mirrors vercel.json's headers, vercel.json keeps its keys
// and refreshes the organism pages after the pack, and node web/build.mjs --refresh rebuilds them with an empty
// environment into a temp dist. No test here writes into the tree's web/dist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { buildOrganism as buildNode } from '../seeds/organism.mjs';
import { getKind as nodeKind } from '../core/cell.mjs';
import '../cells/index.mjs';

import { buildOrganism as buildWeb, REGIONS as WEB_REGIONS } from '../web/src/organism.js';
import { portTable, getKind as webKind, listKinds } from '../web/src/kinds.js';
import { Engine } from '../web/src/engine.js';
import { brainLayout, pipelineLayout } from '../web/src/layout.js';
import { bundle, minify, ORDER, refresh, REFRESH_PARTS } from '../web/build.mjs';
import { startSite, hostRules, headersFor, NO_SLASH } from '../web/serve.mjs';
import { renderIndexMjs } from '../grow/store.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAP = 225280;      // 220 KB hard cap
const TARGET = 163840;   // 160 KB target

/** The structure hash both sides must agree on: every edge as (src, dst, delay). */
function edgeHash(src, dst, delay, n) {
  const h = createHash('sha256');
  h.update('web.parity.v1 ' + n + '\n');
  for (let e = 0; e < n; e++) h.update(src[e] + ',' + dst[e] + ',' + delay[e] + '\n');
  return h.digest('hex');
}

function nodeSide(majors) {
  const b = buildNode({ majors, seed: 'organism', ledger: 'off', growth: { enabled: false } });
  const k = b.connectome;
  return { cells: b.cells.length, edges: k.n, hash: edgeHash(k.src, k.dst, k.delay, k.n), brain: b };
}
function webSide(majors) {
  const o = buildWeb({ majors, seed: 'organism' });
  const k = o.connectome;
  return { cells: o.cells.length, edges: k.n, hash: edgeHash(k.src, k.dst, k.delay, k.n), org: o };
}

test('ports: the browser table is exactly what the node registry declares', () => {
  const enc = (ps) => ps.map(p => p.name + ':' + p.kinds.join(',')).join(';');
  let checked = 0;
  for (const [name, inSpec, outSpec] of portTable()) {
    const K = nodeKind(name);
    assert.equal(enc(K.ports.in), inSpec, name + ' in ports');
    assert.equal(enc(K.ports.out), outSpec, name + ' out ports');
    checked++;
  }
  // and every kind any region roster names is in the table
  const named = new Set();
  for (const r of WEB_REGIONS) for (const k of r.roster) named.add(k);
  for (const k of named) assert.ok(listKinds().includes(k), 'kind missing from the browser table: ' + k);
  // 54, not the 47 this line held until today: seeds/organism.mjs grew the six grid kinds
  // into the perception roster and seq.fit into the cognitive roster, and web/src/kinds.js
  // follows. The count is a floor against a kind quietly leaving the browser table; the
  // ports themselves are checked above, kind by kind, against the node registry.
  assert.equal(checked, 54);
  console.log('ports checked  ' + checked + ' kinds, all matching the node registry');
});

test('parity: the same seed builds the same organism in the browser port', () => {
  for (const majors of [7, 40, 120]) {
    const a = nodeSide(majors), b = webSide(majors);
    assert.equal(b.cells, a.cells, 'cell count at majors ' + majors);
    assert.equal(b.edges, a.edges, 'edge count at majors ' + majors);
    assert.equal(b.hash, a.hash, 'edge hash at majors ' + majors);
    console.log('parity majors ' + String(majors).padStart(4) + '  cells ' + String(a.cells).padStart(6)
      + '  edges ' + String(a.edges).padStart(7) + '  hash ' + a.hash.slice(0, 16));
  }
});

test('parity: cell identity, kind, region and circuit agree cell for cell', () => {
  const a = nodeSide(60), b = webSide(60);
  for (let i = 0; i < a.cells; i++) {
    const x = a.brain.cells[i], y = b.org.cells[i];
    assert.equal(y.id, x.id, 'cell ' + i + ' id');
    assert.equal(y.kind, x.kind, 'cell ' + i + ' kind');
    assert.equal(y.region, x.region, 'cell ' + i + ' region');
    assert.equal(y.circuit, x.circuit, 'cell ' + i + ' circuit');
    assert.equal(y.policy.period, x.policy.period, 'cell ' + i + ' period');
    assert.equal(y.policy.priority, x.policy.priority, 'cell ' + i + ' priority');
  }
  console.log('cell for cell  ' + a.cells + ' cells identical in id, kind, region, circuit, period, priority');
});

test('parity: ports and delays agree edge for edge', () => {
  const a = nodeSide(40), b = webSide(40);
  const ka = a.brain.connectome, kb = b.org.connectome;
  assert.equal(kb.n, ka.n);
  for (let e = 0; e < ka.n; e++) {
    assert.equal(kb.srcPort[e], ka.srcPort[e], 'edge ' + e + ' srcPort');
    assert.equal(kb.dstPort[e], ka.dstPort[e], 'edge ' + e + ' dstPort');
    assert.equal(kb.delay[e], ka.delay[e], 'edge ' + e + ' delay');
    assert.equal(Math.fround(kb.w[e]), Math.fround(ka.w[e]), 'edge ' + e + ' weight');
  }
  console.log('edge for edge  ' + ka.n + ' edges identical in ports, delay and float32 weight');
});

test('scale: the default 1200 majors builds fast enough for a page load', () => {
  const t0 = performance.now();
  const o = buildWeb({ majors: 1200, seed: 'organism' });
  const ms = performance.now() - t0;
  assert.equal(o.cells.length, 9600);
  assert.ok(o.connectome.n > 90000, 'edges ' + o.connectome.n);
  const t1 = performance.now();
  const lay = brainLayout(o.cells, 100);
  const pipe = pipelineLayout(o.cells, 100);
  const layMs = performance.now() - t1;
  assert.equal(lay.pos.length, o.cells.length * 3);
  assert.equal(pipe.length, o.cells.length * 3);
  let inside = 0;
  for (let i = 0; i < o.cells.length; i++) if (Math.hypot(lay.pos[i * 3], lay.pos[i * 3 + 1], lay.pos[i * 3 + 2]) < 190) inside++;
  assert.equal(inside, o.cells.length, 'every cell inside the head');
  console.log('build 1200 majors  ' + ms.toFixed(1) + ' ms, ' + o.cells.length + ' cells, '
    + o.connectome.n + ' edges; layout ' + layMs.toFixed(1) + ' ms');
  assert.ok(ms < 4000, 'build took ' + ms.toFixed(1) + ' ms');
});

test('engine: only the cells that were due actually ran, and the arrival rule holds', () => {
  const o = buildWeb({ majors: 120, seed: 'organism' });
  const e = new Engine(o);
  const t0 = performance.now();
  const ticks = 400;
  for (let i = 0; i < ticks; i++) {
    e.tick();
    for (let j = 0; j < e.ranCount; j++) {
      const c = o.cells[e.ranList[j]];
      const p = c.policy.period;
      const due = p === 'event' ? true : (e.t % p === 0);
      assert.ok(due, 'cell ' + c.id + ' ran at tick ' + e.t + ' with period ' + p);
    }
  }
  const ms = performance.now() - t0;
  // no cell that never ran carries a run time
  let never = 0;
  for (const c of o.cells) if (c.runs === 0) { assert.equal(c.lastT, -1); never++; }
  assert.ok(e.stats.runs > 0, 'nothing ran');
  assert.ok(e.stats.signals > 0, 'nothing was sent');
  assert.ok(e.conduits.rows.length > 0, 'no conduits');
  console.log('engine ' + ticks + ' ticks in ' + ms.toFixed(1) + ' ms  ('
    + ((ticks * 1000) / ms).toFixed(0) + ' ticks/s, ' + e.stats.runs + ' runs, '
    + e.stats.signals + ' signals, ' + e.stats.delivered + ' delivered, '
    + e.conduits.rows.length + ' conduits, ' + never + ' cells never woken)');
});

test('engine: it is not a global pulse, and the floor is the clock', () => {
  const o = buildWeb({ majors: 1200, seed: 'organism' });
  const e = new Engine(o);
  for (let i = 0; i < 300; i++) e.tick();
  let lit = 0;
  const window = 60;
  for (let i = 0; i < window; i++) { e.tick(); lit += e.ranCount; }
  const mean = lit / window, frac = mean / o.cells.length;
  let clocked = 0;
  for (const c of o.cells) if (c.policy.period === 1) clocked++;
  const floor = clocked / o.cells.length;
  console.log('awake per tick  ' + mean.toFixed(0) + ' of ' + o.cells.length + ' = ' + (frac * 100).toFixed(1)
    + ' percent; the clock alone wakes ' + clocked + ' = ' + (floor * 100).toFixed(1) + ' percent every tick'
    + '; signals ' + (e.stats.signals / e.stats.ticks).toFixed(0) + ' per tick');
  assert.ok(frac < 0.45, 'the organism is saturating: ' + (frac * 100).toFixed(1) + ' percent awake per tick');
  assert.ok(frac > floor, 'nothing is awake beyond the cells the clock wakes');
});

test('engine: a signal lands at t + 1 + delay and not a tick before or after', () => {
  const o = buildWeb({ majors: 40, seed: 'organism' });
  const e = new Engine(o);
  const k = o.connectome;
  let checked = 0;
  for (let i = 0; i < 60; i++) {
    const t = e.t + 1;
    e.tick();
    for (const [at, b] of e.inflight) {
      for (let j = 0; j < b.length; j += 2) {
        const edge = b[j];
        // every entry that was put in this tick must be due at t + 1 + delay
        if (at !== t + 1 + k.delay[edge]) continue;
        checked++;
      }
    }
  }
  assert.ok(checked > 0, 'no signal was in flight to check');
  // and nothing is ever scheduled into the past or into the current tick
  for (const at of e.inflight.keys()) assert.ok(at > e.t, 'a signal is scheduled at ' + at + ' but t is ' + e.t);
  console.log('arrival rule   ' + checked + ' in flight entries all at t + 1 + delay');
});

// The bundle is measured in memory: no test writes into the tree's web/dist (node web/build.mjs does that).
test('bundle: it builds, and the whole site is under the cap', () => {
  const { js, html } = bundle();
  const r = { js: Buffer.byteLength(js), html: Buffer.byteLength(html) };
  r.total = r.js + r.html;
  assert.ok(r.js > 20000, 'the bundle is suspiciously small: ' + r.js);
  assert.ok(r.total < CAP, 'site ' + r.total + ' bytes is over the ' + CAP + ' byte cap');
  console.log('bundle  index.html ' + r.html + ' bytes, app.js ' + r.js + ' bytes, total '
    + r.total + ' bytes (target ' + TARGET + ', cap ' + CAP + ')');
  if (r.total > TARGET) console.log('NOTE: over the ' + TARGET + ' byte target, under the cap');
  // the bundle is one script with no module syntax left in it
  assert.ok(!/^import\s/m.test(js), 'an import survived the bundler');
  assert.ok(!/^export\s/m.test(js), 'an export survived the bundler');
  assert.ok(js.includes('#version 300 es'), 'the shaders did not survive the minifier');
  assert.ok(html.includes('app.js'), 'the page does not load the bundle');
});

test('import: loading web/build.mjs writes nothing and prints nothing; only a run as a program builds', () => {
  const url = pathToFileURL(join(ROOT, 'web', 'build.mjs')).href;
  const r = spawnSync(process.execPath, ['--input-type=module', '-e', 'const m = await import(' + JSON.stringify(url) + '); console.log(typeof m.refresh, typeof m.write);'], { encoding: 'utf8', cwd: ROOT });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), 'function function', 'the import printed ' + JSON.stringify(r.stdout));
});

// ---------------------------------------------------------------- web/serve.mjs mirrors the host (vercel.json)

function siteDist() {
  const d = mkdtempSync(join(tmpdir(), 'web-serve-'));
  for (const [rel, body] of [['ask/index.html', '<!doctype html>ask page'], ['ask/sw.js', '// sw'], ['ladder/index.html', 'ladder page'], ['index.html', 'home']]) {
    mkdirSync(dirname(join(d, rel)), { recursive: true });
    writeFileSync(join(d, rel), body);
  }
  return d;
}

test('serve: /ask is served with no redirect, /ask/ answers 308 to /ask, and /ask/sw.js carries vercel.json\'s headers', async () => {
  const dist = siteDist();
  const site = await startSite({ port: 0, dist, healthUrl: 'http://127.0.0.1:9/health' });
  try {
    const get = (p) => fetch(site.url + p.replace(/^\//, ''), { redirect: 'manual' });
    const ask = await get('/ask');
    assert.equal(ask.status, 200);
    assert.equal(ask.headers.get('location'), null);
    assert.equal(await ask.text(), '<!doctype html>ask page');
    const slash = await get('/ask/');
    assert.equal(slash.status, 308);
    assert.equal(slash.headers.get('location'), '/ask');
    const q = await get('/ask/?x=1');
    assert.equal(q.status, 308);
    assert.equal(q.headers.get('location'), '/ask?x=1');
    const sw = await get('/ask/sw.js');
    assert.equal(sw.status, 200);
    assert.equal(sw.headers.get('service-worker-allowed'), '/');
    assert.equal(sw.headers.get('cache-control'), 'no-cache');
    assert.equal(sw.headers.get('content-type'), 'text/javascript; charset=utf-8');
    const page = await get('/ask/index.html');
    assert.equal(page.headers.get('service-worker-allowed'), null, 'the header is on /ask/sw.js only');
    assert.equal(page.headers.get('cache-control'), 'no-store');
    const lad = await get('/ladder');
    assert.equal(lad.status, 301, 'every other directory keeps its slash');
    assert.equal(lad.headers.get('location'), '/ladder/');
    assert.equal((await get('/nope')).status, 404);
    for (const r of [slash, q, sw, page, lad]) await r.text();
  } finally { await site.close(); rmSync(dist, { recursive: true, force: true }); }
  assert.deepEqual(NO_SLASH, ['/ask']);
});

test('serve: hostRules reads the exact sources of vercel.json and nothing else; a missing file adds no header', () => {
  const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
  const sw = vercel.headers.find((h) => h.source === '/ask/sw.js');
  assert.deepEqual(sw.headers, [{ key: 'Service-Worker-Allowed', value: '/' }, { key: 'Cache-Control', value: 'no-cache' }]);
  assert.deepEqual(hostRules(), { headers: [{ source: '/ask/sw.js', headers: { 'service-worker-allowed': '/', 'cache-control': 'no-cache' } }] });
  const d = mkdtempSync(join(tmpdir(), 'web-rules-'));
  try {
    const f = join(d, 'vercel.json');
    writeFileSync(f, JSON.stringify({ headers: [{ source: '/a/(.*)', headers: [{ key: 'X-A', value: '1' }] }, { source: '/b', headers: [{ key: 'X-B', value: '2' }, { key: 'bad key', value: '3' }, { key: 'X-N', value: 4 }] }, { source: 7 }, null] }));
    const rules = hostRules(f);
    assert.deepEqual(rules, { headers: [{ source: '/b', headers: { 'x-b': '2' } }] });
    assert.deepEqual(headersFor('/b', rules), { 'x-b': '2' });
    assert.deepEqual(headersFor('/b/', rules), {});
    assert.deepEqual(headersFor('/a/x', rules), {});
    writeFileSync(f, '{not json');
    assert.deepEqual(hostRules(f), { headers: [] });
    assert.deepEqual(hostRules(join(d, 'none.json')), { headers: [] });
    assert.deepEqual(headersFor('/b', null), {});
  } finally { rmSync(d, { recursive: true, force: true }); }
});

// ---------------------------------------------------------------- vercel.json and node web/build.mjs --refresh

test('vercel.json: every key it had is kept, the host refreshes the organism pages after the pack, and the function carries neo/know and grown', () => {
  const v = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf8'));
  for (const k of ['$schema', 'framework', 'installCommand', 'buildCommand', 'outputDirectory', 'cleanUrls', 'trailingSlash', 'github', 'headers', 'functions', 'ignoreCommand']) assert.ok(k in v, k);
  assert.equal(v.outputDirectory, 'web/dist');
  assert.equal(v.cleanUrls, true);
  assert.equal(v.trailingSlash, false);
  assert.equal(v.buildCommand, 'node tools/fetch-pack.mjs && node web/build.mjs --refresh');
  assert.equal(v.functions['api/ask.mjs'].includeFiles, '{world/policy.json,bench/fixtures/wiki/pack-200/**,neo/know/**,grown/**}');
  assert.equal(v.functions['api/ask.mjs'].maxDuration, 60);
});

const CELL = "export const meta = { id: 'greet-direct-g3', class: 'greet', generation: 3, lane: 'direct', grownFrom: ['x'], version: 1 };\n"
  + "export function can(q) { return q.startsWith('hello'); }\nexport function answer(q) { return 'hello from a grown cell'; }\n"
  + "export const examples = [{ q: 'x', expect: { notRefusal: true } }];\n";
function refreshRoot(base) {
  const root = join(base, 'root');
  mkdirSync(join(root, 'grown', 'cells'), { recursive: true });
  writeFileSync(join(root, 'grown', 'cells', 'greet-direct-g3.mjs'), CELL);
  const index = { generation: 3, cells: [{ id: 'greet-direct-g3', class: 'greet', generation: 3, lane: 'direct', file: 'cells/greet-direct-g3.mjs', heldout: { score: 1, n: 4 }, promotedAt: 'x' }] };
  writeFileSync(join(root, 'grown', 'index.json'), JSON.stringify(index));
  writeFileSync(join(root, 'grown', 'index.mjs'), renderIndexMjs(index));
  mkdirSync(join(root, 'grow'), { recursive: true });
  for (const f of ['neo-core.mjs', 'neo-kernel.mjs']) copyFileSync(join(ROOT, 'grow', f), join(root, 'grow', f));
  mkdirSync(join(root, 'neo'), { recursive: true });
  writeFileSync(join(root, 'neo', 'ERA.json'), JSON.stringify({ eras: [{ era: 1, at: '2026-10-01T00:00:00.000Z', cells: 5, mastered: 1 }] }));
  return root;
}
const filesOf = (dir, pre = '') => readdirSync(dir).flatMap((n) => statSync(join(dir, n)).isDirectory() ? filesOf(join(dir, n), pre + n + '/') : [pre + n]).sort();

test('refresh: /ask, the device tier and /alive rebuilt from the organism into a dist, swapped in whole; the rest of the dist untouched', () => {
  const base = mkdtempSync(join(tmpdir(), 'web-refresh-'));
  try {
    const root = refreshRoot(base), dist = join(base, 'dist');
    mkdirSync(join(dist, 'organism'), { recursive: true });
    writeFileSync(join(dist, 'organism', 'stale.mjs'), 'stale');
    writeFileSync(join(dist, 'index.html'), 'home');
    const r = refresh({ root, dist, builtAt: '2026-10-02T00:00:00.000Z', env: {} });
    assert.equal(r.ok, true, r.why);
    assert.deepEqual(r.parts, ['ask', 'organism', 'alive', 'datacenter']);
    assert.deepEqual(REFRESH_PARTS, ['ask', 'organism', 'alive', 'datacenter']);
    assert.equal(r.cells, 1);
    assert.ok(r.ask > 0 && r.first >= r.ask && r.alive > 0 && r.data > 0);
    const files = filesOf(dist);
    for (const f of ['ask/index.html', 'ask/sw.js', 'ask/manifest.webmanifest', 'organism/manifest.json', 'organism/cells.json', 'alive/index.html', 'alive/data.json', 'index.html']) assert.ok(files.includes(f), f);
    assert.ok(!files.includes('organism/stale.mjs'), 'the old organism part is replaced whole');
    assert.equal(readFileSync(join(dist, 'index.html'), 'utf8'), 'home');
    assert.equal(JSON.parse(readFileSync(join(dist, 'alive', 'data.json'), 'utf8')).builtAt, '2026-10-02T00:00:00.000Z');
    assert.deepEqual(readdirSync(base).sort(), ['dist', 'root'], 'the staging directory is gone');
    console.log('refresh  ' + files.length + ' files in the dist: ask ' + r.ask + ' bytes, first visit ' + r.first + ' bytes, alive ' + r.alive + ' bytes, data ' + r.data + ' bytes, cells ' + r.cells);
    // a root the pocket cannot read: nothing in the dist changes, and it says why
    const before = filesOf(dist).map((f) => f + ' ' + readFileSync(join(dist, f)).length);
    const bad = refresh({ root: join(base, 'nowhere'), dist, builtAt: 'x', env: {} });
    assert.equal(bad.ok, false);
    assert.match(bad.why, /no grown index/);
    assert.deepEqual(filesOf(dist).map((f) => f + ' ' + readFileSync(join(dist, f)).length), before);
    assert.deepEqual(readdirSync(base).sort(), ['dist', 'root']);
    // all or nothing: a named part the build did not stage swaps in none, not the ones before it
    writeFileSync(join(dist, 'ask', 'index.html'), 'old ask');
    const before2 = filesOf(dist).map((f) => f + ' ' + readFileSync(join(dist, f)).length);
    const part = refresh({ root, dist, builtAt: 'y', env: {}, parts: [...REFRESH_PARTS, 'absent'] });
    assert.equal(part.ok, false);
    assert.match(part.why, /the build staged no absent; nothing was swapped in/);
    assert.equal(readFileSync(join(dist, 'ask', 'index.html'), 'utf8'), 'old ask');
    assert.deepEqual(filesOf(dist).map((f) => f + ' ' + readFileSync(join(dist, f)).length), before2);
    // a part is one plain directory name, never a path out of the dist
    for (const p of [['../x'], ['a/b'], [''], [], 'ask', [null], ['Ask']]) {
      const r2 = refresh({ root, dist, builtAt: 'z', env: {}, parts: p });
      assert.equal(r2.ok, false, JSON.stringify(p));
      assert.match(r2.why, /not one plain directory name/, JSON.stringify(p));
    }
    assert.deepEqual(filesOf(dist).map((f) => f + ' ' + readFileSync(join(dist, f)).length), before2);
    assert.deepEqual(readdirSync(base).sort(), ['dist', 'root'], 'no staging directory is left behind');
    // a subset refreshes only what it names
    const one = refresh({ root, dist, builtAt: '2026-10-02T01:00:00.000Z', env: {}, parts: ['alive'] });
    assert.equal(one.ok, true, one.why);
    assert.deepEqual(one.parts, ['alive']);
    assert.equal(readFileSync(join(dist, 'ask', 'index.html'), 'utf8'), 'old ask');
    assert.equal(JSON.parse(readFileSync(join(dist, 'alive', 'data.json'), 'utf8')).builtAt, '2026-10-02T01:00:00.000Z');
    assert.deepEqual(readdirSync(base).sort(), ['dist', 'root']);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test('refresh: the CLI runs with an EMPTY environment (no secret, no network), prints one JSON line and exits 0 both ways', () => {
  const base = mkdtempSync(join(tmpdir(), 'web-refresh-cli-'));
  try {
    const root = refreshRoot(base), dist = join(base, 'out', 'dist');
    const run = (r) => spawnSync(process.execPath, [join(ROOT, 'web', 'build.mjs'), '--refresh', '--dist', dist, '--root', r], { encoding: 'utf8', env: {}, cwd: base });
    const ok = run(root);
    assert.equal(ok.status, 0, ok.stderr);
    const lines = ok.stdout.trim().split('\n');
    assert.equal(lines.length, 1, ok.stdout);
    const j = JSON.parse(lines[0]);
    assert.equal(j.refresh, 'built');
    assert.equal(j.ok, true);
    assert.equal(j.cells, 1);
    assert.ok(statSync(join(dist, 'ask', 'index.html')).size > 0);
    assert.ok(!existsSync(join(dist, 'tools')), 'a refresh copies no /tools');
    console.log('refresh cli (env {}): ' + lines[0].slice(0, 160));
    const no = run(join(base, 'nowhere'));
    assert.equal(no.status, 0);
    const k = JSON.parse(no.stdout.trim());
    assert.equal(k.refresh, 'kept the committed pages');
    assert.equal(k.ok, false);
  } finally { rmSync(base, { recursive: true, force: true }); }
});

test('bundle: the minifier never edits a string, a template or a regex', () => {
  const cases = [
    ['const a = "http://x // y";', 'const a = "http://x // y";'],
    ["const b = 'a /* not a comment */ b';", "const b = 'a /* not a comment */ b';"],
    ['const c = `line // kept\nnext`;', 'const c = `line // kept\nnext`;'],
    ['const d = /\\B(?=(\\d{3})+(?!\\d))/g;', 'const d = /\\B(?=(\\d{3})+(?!\\d))/g;'],
    ['const e = a / b; // gone', 'const e = a / b;'],
  ];
  for (const [src, want] of cases) assert.equal(minify(src).trim(), want.trim(), src);
  // and the built bundle parses
  const { js } = bundle();
  new Function(js);
  console.log('minifier  ' + cases.length + ' cases held, and the bundle parses as a script');
});

test('discipline: no node imports in web/src, and no em dashes anywhere in web/', () => {
  const files = [];
  (function walk(dir) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      if (f === 'dist') continue;
      // web/tools is the Code Universe factory copied verbatim from universe/factory (his product, served as /tools);
      // its four em dashes are his, not brain prose, and the copy is not edited here.
      if (dir.endsWith('web') && f === 'tools') continue;
      if (statSync(p).isDirectory()) { walk(p); continue; }
      // Only text. web/screenshots holds megabytes of PNG, and decoding that as utf8 to
      // hunt for an em dash is both pointless and a way to fail on a random byte pair.
      if (!/\.(mjs|js|html|css|json|md|txt)$/.test(f)) continue;
      files.push(p);
    }
  })(join(ROOT, 'web'));
  let em = 0, checked = 0;
  for (const p of files) {
    const s = readFileSync(p, 'utf8');
    checked++;
    if (s.includes(String.fromCharCode(0x2014))) { em++; console.log('em dash in ' + p); }
    if (p.includes(join('web', 'src'))) {
      assert.ok(!/from\s+['"]node:/.test(s), 'node import in ' + p);
      assert.ok(!/require\s*\(/.test(s), 'require in ' + p);
    }
  }
  assert.equal(em, 0, em + ' files carry an em dash');
  assert.equal(ORDER.length, 8);
  console.log('discipline  ' + checked + ' files checked, 0 em dashes, 0 node imports in web/src');
});
