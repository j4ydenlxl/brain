// test/web-daemon.test.mjs: the organism page's live view of the daemon, both ways.
//
// When the daemon runs, the state panel shows the numbers daemon/health.mjs readHealth() returns;
// when it does not, it shows "daemon not running" and why. The page asks "health" on its own
// origin, which web/serve.mjs answers by asking the daemon's endpoint. Here the real endpoint
// (startHealth) serves a fixture state directory, the real proxy (startSite) sits in front of it,
// and the page's own reader (readDaemon in web/src/hud.js) reads through it. Then the endpoint is
// closed and the same reader must say "daemon not running". Every server is closed in after();
// ports are chosen by the system; no network beyond loopback, no model.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { startHealth } from '../daemon/health.mjs';
import { startSite } from '../web/serve.mjs';
import { daemonRows, readDaemon } from '../web/src/hud.js';

const temps = [];
const closers = [];
after(async () => {
  for (const c of closers.splice(0)) await c().catch(() => {});
  for (const d of temps) rmSync(d, { recursive: true, force: true });
});
const text = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/** A state directory as bin/serve.mjs leaves it: a fresh supervisor status, a checkpoint, its meta. */
function stateFixture({ updatedAgoS = 1 } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'web-daemon-'));
  temps.push(dir);
  const now = Date.now();
  mkdirSync(path.join(dir, 'cloud'), { recursive: true });
  writeFileSync(path.join(dir, 'cloud', 'serve.json'), JSON.stringify({
    instance: 'fixture-a', startedAt: new Date(now - 3723000).toISOString(), updatedAt: new Date(now - updatedAgoS * 1000).toISOString(),
    restarts: 2, budgetKills: 1,
    child: { pid: 4242, startedAt: new Date(now - 60000).toISOString(), lastT: 1234567, ticksPerSec: 812.25, rssMb: 97.4 },
  }));
  writeFileSync(path.join(dir, 'cloud', 'meta.json'), JSON.stringify({ t: 1230000, savedAt: new Date(now - 30000).toISOString() }));
  writeFileSync(path.join(dir, 'cloud', 'snapshot.json'), '{"fixture":true}');
  return dir;
}

test('no health: the rows say "daemon not running" and why, and invent no number', () => {
  const rows = text(daemonRows(null, 'nothing answers /health here (HTTP 404)'));
  assert.match(rows, /daemon daemon not running/);
  assert.match(rows, /nothing answers \/health here \(HTTP 404\)/);
  assert.doesNotMatch(rows.replace('HTTP 404', ''), /[0-9]/, 'no number but the status code it quotes');
  const refused = text(daemonRows({ ok: false, restarts: 3, error: 'the daemon health endpoint did not answer: ECONNREFUSED' }));
  assert.match(refused, /daemon not running/);
  assert.match(refused, /health answered, ok false, restarts 3: the daemon health endpoint did not answer: ECONNREFUSED/);
  // an ok field that is not the boolean true is not a running daemon
  assert.match(text(daemonRows({ ok: 'yes', tick: 5 })), /daemon not running/);
  // markup in a reason is escaped, never rendered
  assert.doesNotMatch(daemonRows(null, '<img src=x onerror=alert(1)>'), /<img/);
});

test('the reader: a missing endpoint, a page that is not health JSON, and a timeout all read as not running', async () => {
  const html404 = async () => ({ status: 404, text: async () => 'not found' });
  const a = await readDaemon('health', 1000, html404);
  assert.equal(a.health, null);
  assert.equal(a.why, 'nothing answers /health here (HTTP 404)');
  const hang = (url, init) => new Promise((resolve, reject) => { init.signal.addEventListener('abort', () => { const e = new Error('aborted'); e.name = 'AbortError'; reject(e); }); });
  const b = await readDaemon('health', 30, hang);
  assert.equal(b.health, null);
  assert.match(b.why, /timed out/);
  const noOk = async () => ({ status: 200, text: async () => '{"tick": 5}' });
  assert.equal((await readDaemon('health', 1000, noOk)).health, null, 'JSON without a boolean ok is not health');
});

test('daemon running: health.mjs through web/serve.mjs to the rows, then closed: "daemon not running"', async () => {
  const stateDir = stateFixture();
  const series = path.join(stateDir, 'no-series.json');
  const health = await startHealth({ port: 0, stateDir, seriesFile: series });
  let healthOpen = true;
  closers.push(() => (healthOpen ? health.close() : Promise.resolve()));
  const dist = mkdtempSync(path.join(os.tmpdir(), 'web-dist-'));
  temps.push(dist);
  mkdirSync(path.join(dist, 'ladder'), { recursive: true });
  writeFileSync(path.join(dist, 'index.html'), '<!doctype html><title>organism</title>');
  writeFileSync(path.join(dist, 'ladder', 'index.html'), '<!doctype html><title>ladder</title>');
  const site = await startSite({ port: 0, dist, healthUrl: health.url + '/health' });
  closers.push(site.close);

  // the endpoint itself says ok, and the proxy passes it through unchanged
  const direct = await (await fetch(health.url + '/health')).json();
  assert.equal(direct.ok, true, 'a fresh serve.json with a child pid and no last exit is a running daemon');
  const r = await readDaemon(site.url + 'health', 2500);
  assert.equal(r.why, null);
  assert.equal(r.health.ok, true);
  for (const k of ['instance', 'tick', 'ticksPerSec', 'restarts', 'budgetKills', 'rssMb', 'instancesAlive']) assert.deepEqual(r.health[k], direct[k], k + ' passes through');

  const rows = text(daemonRows(r.health, null));
  assert.match(rows, /daemon running fixture-a/);
  assert.match(rows, /daemon tick 1 234 567/);
  assert.match(rows, /daemon ticks \/ s 812\.3/);
  assert.match(rows, /uptime 62\.[0-9] min/);
  assert.match(rows, /restarts 2 budget kills 1/);
  assert.match(rows, /daemon rss 97\.4 MB/);
  assert.match(rows, /checkpoint tick 1 230 000/);
  assert.match(rows, /instances alive 0/);
  assert.match(rows, /native share no series file/, 'no native share is reported as the reason, not as zero');
  assert.match(rows, new RegExp('from GET /health at ' + r.health.at.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(rows, /not running/);

  // the site itself: the ladder page, the redirect that keeps its relative links working, the walls
  const lad = await fetch(site.url + 'ladder', { redirect: 'manual' });
  assert.equal(lad.status, 301);
  assert.equal(lad.headers.get('location'), '/ladder/');
  await lad.arrayBuffer();
  const page = await fetch(site.url + 'ladder/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<title>ladder<\/title>/);
  const out = await fetch(site.url + '..%2fpackage.json');
  assert.equal(out.status, 403, 'nothing outside the built site is served');
  await out.arrayBuffer();
  const post = await fetch(site.url + 'health', { method: 'POST' });
  assert.equal(post.status, 405);
  await post.arrayBuffer();
  const dup = await fetch(site.url + 'duplicate?seed=1');
  assert.equal(dup.status, 404, 'the proxy forwards /health only');
  await dup.arrayBuffer();

  // the daemon's endpoint goes away: the same reader, through the same proxy, reads "not running"
  await health.close();
  healthOpen = false;
  const gone = await readDaemon(site.url + 'health', 2500);
  assert.equal(gone.health && gone.health.ok, false);
  const goneRows = text(daemonRows(gone.health, gone.why));
  assert.match(goneRows, /daemon not running/);
  assert.match(goneRows, /the daemon health endpoint did not answer/);

  // and with no proxy at all, a port nothing listens on
  const nobody = await readDaemon(health.url + '/health', 2500);
  assert.equal(nobody.health, null);
  assert.match(nobody.why, /no health endpoint answered/);
  assert.match(text(daemonRows(nobody.health, nobody.why)), /daemon not running/);
});

test('a supervisor status older than 30 s is not a running daemon', async () => {
  const stateDir = stateFixture({ updatedAgoS: 45 });
  const health = await startHealth({ port: 0, stateDir, seriesFile: path.join(stateDir, 'no-series.json') });
  closers.push(health.close);
  const r = await readDaemon(health.url + '/health', 2500);
  assert.equal(r.health.ok, false);
  assert.match(text(daemonRows(r.health, r.why)), /daemon not running.*health answered, ok false, restarts 2/);
});
