// daemon/health.mjs: THE HEALTH ENDPOINT of the served organism (his P13), and the door it
// multiplies through (his P15: "multiplying, duplicating, all within cloud").
//
//   GET /health            JSON read FROM DISK on every request, nothing held in memory:
//                          uptime, restarts, tick, checkpoint age seconds and bytes, the last
//                          ladder row, the native share when bench/verdicts/ladder.json has one,
//                          and instances alive from <state>/instances.json.
//   GET /duplicate?seed=N  copies the last checkpoint (<state>/<name>/snapshot.json and
//                          meta.json) to <state>/dup-N, through a temp dir and one rename, so
//                          a second container started with BRAIN_NAME=dup-N resumes from it.
//
// The files it reads are the ones bin/serve.mjs and daemon/run.mjs write:
//   <state>/<name>/serve.json      the supervisor's status (restarts, child tick, peaks), once a second
//   <state>/<name>/meta.json       written at every checkpoint (t, savedAt)
//   <state>/<name>/snapshot.json   the checkpoint itself (bytes, mtime)
//   <state>/instances.json         one row per serve.mjs, heartbeat every minute
//   bench/verdicts/ladder.json     the ladder series ($BRAIN_LADDER_SERIES overrides)
//   <state>/<name>/multiply.json   a population instance's status (daemon/multiply.mjs), once a
//                                  second: its id, duplications made, elites imported and
//                                  exported, and <popDir>, whose instances/<id>.json heartbeats
//                                  give instances alive (fresh within 10 s, pid alive, not ended)
//
// It imports node builtins only, so it cannot reach into a live organism by accident; a test
// holds that line.
//
//   node daemon/health.mjs          standalone, from HEALTH_PORT, HEALTH_HOST, BRAIN_STATE_DIR, BRAIN_NAME
import http from 'node:http';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, mkdirSync, copyFileSync, writeFileSync, renameSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(HERE, '..');
export const DEFAULT_SERIES = path.join(ROOT, 'bench', 'verdicts', 'ladder.json');
export const ALIVE_WINDOW_MS = 150_000; // bin/serve.mjs heartbeats every 60 s
export const SEED_RE = /^[0-9]{1,9}$/;
/** A population instance heartbeats every second; one older than this is not alive. */
export const POP_ALIVE_MS = 10_000;

const readJson = (file) => { try { return JSON.parse(readFileSync(file, 'utf8')); } catch { return null; } };
const statOf = (file) => { try { return statSync(file); } catch { return null; } };
const round1 = (x) => Math.round(x * 10) / 10;

function dirBytes(dir) {
  let n = 0, entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entries) { const f = path.join(dir, e.name); try { n += e.isDirectory() ? dirBytes(f) : statSync(f).size; } catch { /* raced */ } }
  return n;
}

// a key named native / nativeShare anywhere in the day's row, as a number or {share}
function findNative(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 6) return null;
  for (const [k, v] of Object.entries(obj)) {
    if (/^native(share)?$/i.test(k)) {
      if (typeof v === 'number') return { share: v, key: k };
      if (v && typeof v === 'object' && typeof v.share === 'number') return { share: v.share, key: k, latencyUs: v.latencyUs ?? v.meanUs ?? null };
    }
  }
  for (const v of Object.values(obj)) { const r = findNative(v, depth + 1); if (r) return r; }
  return null;
}

/** The last day of the ladder series, reduced to what a health reader needs. */
export function lastLadderRow(seriesFile = DEFAULT_SERIES) {
  const s = readJson(seriesFile);
  if (!s || !Array.isArray(s.days) || !s.days.length) return { row: null, native: null, reason: existsSync(seriesFile) ? 'the series has no days' : 'no series file' };
  const d = s.days[s.days.length - 1];
  const columns = {};
  for (const [k, v] of Object.entries(d.columns || {})) columns[k] = v && typeof v === 'object' ? (v.score ?? null) : v;
  const native = findNative(d);
  return {
    row: { date: d.date, tier: d.tier ?? null, composite: d.composite ?? null, columns, delta: d.delta ?? d.compositeDelta ?? null, file: d.file ?? null, at: d.at ?? null },
    native, reason: native ? null : 'ladder.json has no native share yet',
  };
}

const pidAlive = (pid) => { if (!(Number.isInteger(pid) && pid > 0)) return false; try { process.kill(pid, 0); return true; } catch (e) { return !!(e && e.code === 'EPERM'); } };

/**
 * The instances of a population (daemon/multiply.mjs) alive at atMs: a heartbeat file
 * <popDir>/instances/<id>.json written within POP_ALIVE_MS, not marked ended, whose pid answers.
 * @returns {{ alive: number, ids: string[] }}
 */
export function populationAlive(popDir, { atMs = Date.now(), windowMs = POP_ALIVE_MS, checkPid = true } = {}) {
  let names;
  try { names = readdirSync(path.join(popDir, 'instances')); } catch { return { alive: 0, ids: [] }; }
  const ids = [];
  for (const n of names) {
    if (!n.endsWith('.json')) continue;
    const r = readJson(path.join(popDir, 'instances', n));
    if (!r || r.ended || !Number.isFinite(r.atMs) || atMs - r.atMs > windowMs) continue;
    if (checkPid && !pidAlive(r.pid)) continue;
    ids.push(String(r.id));
  }
  ids.sort();
  return { alive: ids.length, ids };
}

/** Everything /health returns, from disk, at `atMs`. */
export function readHealth({ stateDir, name = 'cloud', seriesFile = process.env.BRAIN_LADDER_SERIES || DEFAULT_SERIES, atMs = Date.now() } = {}) {
  const brainDir = path.join(stateDir, name);
  const serve = readJson(path.join(brainDir, 'serve.json'));
  const meta = readJson(path.join(brainDir, 'meta.json'));
  const snap = statOf(path.join(brainDir, 'snapshot.json'));
  const inst = readJson(path.join(stateDir, 'instances.json'));
  const rows = Object.values((inst && inst.instances) || {}).filter((r) => r && atMs - Date.parse(r.lastSeen) <= ALIVE_WINDOW_MS);
  const ladder = lastLadderRow(seriesFile);
  const updatedAgeS = serve && serve.updatedAt ? round1((atMs - Date.parse(serve.updatedAt)) / 1000) : null;
  const child = serve && serve.child;
  // a population instance (daemon/multiply.mjs) has no serve.json: its own status file says it runs
  const mult = readJson(path.join(brainDir, 'multiply.json'));
  const multAgeS = mult && mult.updatedAt ? round1((atMs - Date.parse(mult.updatedAt)) / 1000) : null;
  const multOk = Boolean(mult && multAgeS !== null && multAgeS * 1000 < POP_ALIVE_MS && mult.pid && !mult.ended);
  const pop = mult && mult.popDir ? populationAlive(mult.popDir, { atMs }) : null;
  return {
    // alive: the supervisor wrote in the last 30 s and a daemon runs (or the 04:00 ladder holds it)
    ok: Boolean(serve && updatedAgeS !== null && updatedAgeS < 30 && ((child && child.pid && !serve.lastExit) || (child && child.pid && serve.lastExit && Date.parse(child.startedAt) >= Date.parse(serve.lastExit.at)) || (serve.ladder && serve.ladder.running))) || multOk,
    at: new Date(atMs).toISOString(),
    instance: serve ? serve.instance : mult ? mult.instance : null,
    name,
    uptimeS: serve && serve.startedAt ? round1((atMs - Date.parse(serve.startedAt)) / 1000) : null,
    statusAgeS: updatedAgeS,
    restarts: serve ? serve.restarts : null,
    budgetKills: serve ? serve.budgetKills : null,
    tick: child ? child.lastT : mult ? mult.tick ?? null : null,
    ticksPerSec: child ? child.ticksPerSec : null,
    resumedAt: child ? child.resumedAt : null,
    daemonPid: child ? child.pid : null,
    rssMb: child ? child.rssMb : mult ? mult.rssMb ?? null : null,
    // where the daemon memory sits (the child reports it; the episodic record is the grower)
    memory: child ? { heapUsedMb: child.heapUsedMb ?? null, arrayBuffersMb: child.arrayBuffersMb ?? null, episodic: child.episodic ?? null } : null,
    peak: serve ? serve.peak : null,
    lastExit: serve ? serve.lastExit : null,
    checkpoint: snap ? { tick: meta && Number.isFinite(meta.t) ? meta.t : null, savedAt: meta ? meta.savedAt || null : null, ageS: round1((atMs - snap.mtimeMs) / 1000), bytes: snap.size } : null,
    ladder: ladder.row,
    nativeShare: ladder.native,
    nativeReason: ladder.reason,
    nextLadderAt: serve && serve.ladder ? serve.ladder.nextAt : null,
    instancesAlive: pop ? pop.alive : rows.length,
    instances: pop ? pop.ids : rows.map((r) => r.id).sort(),
    multiply: mult ? {
      instance: mult.instance ?? null, seed: mult.seed ?? null, parent: mult.parent ?? null, pid: mult.pid ?? null, statusAgeS: multAgeS,
      instancesAlive: pop ? pop.alive : null, duplications: mult.duplications ?? 0, elitesImported: mult.elitesImported ?? 0, elitesExported: mult.elitesExported ?? 0,
      storeRows: mult.storeRows ?? null, evals: mult.evals ?? null, exchanges: mult.exchanges ?? null, resumed: !!mult.resumed, resumedAt: mult.resumedAt ?? null, ended: !!mult.ended,
    } : null,
    ledger: serve ? serve.ledger : null,
    egressAllow: serve && serve.egress ? serve.egress.allow.map((e) => e.host + ':' + e.port) : null,
  };
}

/**
 * Copy the last checkpoint to <stateDir>/dup-<seed>. Returns { status, body } for the HTTP
 * layer. The copy lands in a temp dir first and becomes dup-<seed> with one rename, so a
 * reader never sees half a checkpoint; the source is re-statted after the copy and a size or
 * mtime change (a checkpoint landed mid-copy) is retried once.
 */
export function duplicate({ stateDir, name = 'cloud', seed, diskCapMb = Infinity }) {
  const s = String(seed ?? '');
  if (!SEED_RE.test(s)) return { status: 400, body: { ok: false, error: 'seed must be 1 to 9 digits, got ' + JSON.stringify(s) } };
  const src = path.join(stateDir, name);
  const snap = path.join(src, 'snapshot.json');
  if (!existsSync(snap)) return { status: 404, body: { ok: false, error: 'no checkpoint yet at ' + snap } };
  const dest = path.join(stateDir, 'dup-' + s);
  if (existsSync(dest)) return { status: 409, body: { ok: false, error: 'dup-' + s + ' already exists', dir: dest } };
  if (Number.isFinite(diskCapMb) && dirBytes(stateDir) > diskCapMb * 1048576) return { status: 507, body: { ok: false, error: 'state is over its disk cap of ' + diskCapMb + ' MB' } };
  const tmp = path.join(stateDir, '.dup-' + s + '.' + process.pid + '.tmp');
  for (let attempt = 0; attempt < 2; attempt++) {
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    const before = statSync(snap);
    copyFileSync(snap, path.join(tmp, 'snapshot.json'));
    const after = statSync(snap);
    if (before.size !== after.size || before.mtimeMs !== after.mtimeMs) continue;
    const meta = readJson(path.join(src, 'meta.json')) || {};
    const bytes = statSync(path.join(tmp, 'snapshot.json')).size;
    const sha256 = createHash('sha256').update(readFileSync(path.join(tmp, 'snapshot.json'))).digest('hex');
    const dupMeta = { ...meta, name: 'dup-' + s, duplicatedFrom: name, duplicatedAt: new Date().toISOString(), seed: Number(s), sourceTick: meta.t ?? null, sha256 };
    writeFileSync(path.join(tmp, 'meta.json'), JSON.stringify(dupMeta, null, 2) + '\n');
    renameSync(tmp, dest);
    return { status: 200, body: { ok: true, seed: Number(s), name: 'dup-' + s, dir: dest, from: snap, bytes, sha256, fromTick: meta.t ?? null, start: 'BRAIN_NAME=dup-' + s + ' on the same /state volume resumes from this copy' } };
  }
  rmSync(tmp, { recursive: true, force: true });
  return { status: 503, body: { ok: false, error: 'a checkpoint landed during both copy attempts; try again' } };
}

/** Start the endpoint. Resolves once listening. */
export function startHealth({ port = Number(process.env.HEALTH_PORT) || 8080, host = process.env.HEALTH_HOST || '127.0.0.1', stateDir, name = 'cloud', seriesFile, diskCapMb, onDuplicate = null } = {}) {
  if (!stateDir) throw new Error('startHealth: stateDir is required');
  const server = http.createServer((req, res) => {
    const send = (status, body) => { const text = JSON.stringify(body); res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store', 'content-length': Buffer.byteLength(text) }); res.end(text); };
    let u;
    try { u = new URL(req.url, 'http://x'); } catch { return send(400, { ok: false, error: 'bad url' }); }
    if (req.method !== 'GET') return send(405, { ok: false, error: 'GET only' });
    try {
      if (u.pathname === '/health') return send(200, readHealth({ stateDir, name, seriesFile: seriesFile || process.env.BRAIN_LADDER_SERIES || DEFAULT_SERIES }));
      // a population instance passes its own duplicate (daemon/multiply.mjs duplicateInstance)
      if (u.pathname === '/duplicate') { const r = onDuplicate ? onDuplicate(u.searchParams.get('seed')) : duplicate({ stateDir, name, seed: u.searchParams.get('seed'), diskCapMb }); return send(r.status, r.body); }
      return send(404, { ok: false, error: 'GET /health or GET /duplicate?seed=N' });
    } catch (e) { return send(500, { ok: false, error: String((e && e.message) || e).split('\n')[0] }); }
  });
  server.keepAliveTimeout = 1000;
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      const a = server.address();
      const shown = a.address === '0.0.0.0' || a.address === '::' ? '127.0.0.1' : a.address;
      resolve({ server, port: a.port, host: a.address, url: 'http://' + shown + ':' + a.port, close: () => new Promise((r) => { server.closeAllConnections?.(); server.close(() => r()); }) });
    });
  });
}

const isMain = Boolean(process.argv[1]) && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const stateDir = path.resolve(process.env.BRAIN_STATE_DIR || path.join(ROOT, 'state'));
  const h = await startHealth({ stateDir, name: process.env.BRAIN_NAME || 'cloud' });
  console.log('[health] ' + h.url + '/health reading ' + stateDir);
}
