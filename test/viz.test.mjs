// test/viz.test.mjs - the visualization, graded. node:test + node:assert/strict.
// Run from the brain directory:  node --test test/viz.test.mjs
//
// Everything here talks to a real listening socket with node:http and no keep alive, so
// a passing run also proves the server lets go of its port and of the event loop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { readdirSync, existsSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedBasic } from '../seeds/basic.mjs';
import { startViz, captureSnapshot, writeStatic, buildConduits, capabilityOf, functionOf, stateBytes } from '../viz/server.mjs';
import { Activation } from '../viz/client/activation.js';
import { computeLayout, layoutBrain, insideBrain, pipelineLayout, PIPELINE_ORDER, REGION_ORDER, sheetAt, cerebralProfile, CEREBRUM, CEREBELLUM, VOL } from '../viz/layout.mjs';

const CLIENT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'viz', 'client');

// ---------------------------------------------------------------- plumbing
function req(url, { method = 'GET', body = null } = {}) {
  const u = new URL(url);
  return new Promise((resolve, reject) => {
    const r = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname + u.search, method, agent: false,
      headers: body ? { 'content-type': 'application/json' } : {},
    }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve({ status: res.statusCode, headers: res.headers, text, json: () => JSON.parse(text) });
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

// A live Server Sent Events reader. Frames are { event, data }.
function openStream(url) {
  const u = new URL(url);
  const frames = [], waiters = [];
  let buf = '', res = null;
  const r = http.request({ hostname: u.hostname, port: u.port, path: u.pathname, agent: false, headers: { accept: 'text/event-stream' } }, (response) => {
    res = response;
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      buf += chunk;
      let i;
      while ((i = buf.indexOf('\n\n')) >= 0) {
        const raw = buf.slice(0, i); buf = buf.slice(i + 2);
        let name = null, data = null;
        for (const line of raw.split('\n')) {
          if (line.startsWith('event: ')) name = line.slice(7).trim();
          else if (line.startsWith('data: ')) data = line.slice(6);
        }
        if (!name || data == null) continue;
        const f = { event: name, data: JSON.parse(data) };
        frames.push(f);
        for (const w of waiters.slice()) {
          if (w.pred(f)) { waiters.splice(waiters.indexOf(w), 1); clearTimeout(w.timer); w.resolve(f); }
        }
      }
    });
  });
  r.on('error', () => {});
  r.end();
  return {
    frames,
    wait(pred, ms = 4000, what = 'frame') {
      for (const f of frames) if (pred(f)) return Promise.resolve(f);
      return new Promise((resolve, reject) => {
        const w = { pred, resolve };
        w.timer = setTimeout(() => {
          waiters.splice(waiters.indexOf(w), 1);
          reject(new Error('timed out waiting for ' + what + ' after ' + ms + ' ms. saw: ' + frames.map(f => f.event).join(',')));
        }, ms);
        waiters.push(w);
      });
    },
    close() { for (const w of waiters) clearTimeout(w.timer); try { r.destroy(); } catch {} try { res && res.destroy(); } catch {} },
  };
}

async function boot(brainOpts) {
  const brain = seedBasic(brainOpts);
  const viz = startViz(brain, { port: 0, host: '127.0.0.1' });
  await viz.ready;
  return { brain, viz, base: viz.url };
}

// ---------------------------------------------------------------- tests
test('startViz on seedBasic serves index.html, and every served file is offline clean', async () => {
  const { viz, base } = await boot();
  try {
    const root = await req(base + '/');
    assert.equal(root.status, 200);
    assert.match(root.headers['content-type'], /text\/html/);
    assert.match(root.text, /<canvas id="gl">/);
    assert.match(root.text, /src="client\/main\.js"/);
    assert.match(root.text, /BRAIN/);

    // every module the page can load, fetched over the wire and checked for anything external
    const names = readdirSync(CLIENT_DIR).filter(f => f.endsWith('.js'));
    assert.ok(names.includes('main.js'), 'client/main.js exists');
    const served = [{ name: 'index.html', text: root.text }];
    for (const n of names) {
      const r = await req(base + '/client/' + n);
      assert.equal(r.status, 200, '/client/' + n + ' status');
      assert.match(r.headers['content-type'], /javascript/);
      served.push({ name: n, text: r.text });
    }
    for (const f of served) {
      assert.ok(!/https?:\/\//i.test(f.text), f.name + ' must not reference any absolute url');
      assert.ok(!/(src|href|from|import\()\s*=?\s*["'`]\/\//i.test(f.text), f.name + ' must not use a protocol relative url');
      assert.ok(!/(unpkg\.|jsdelivr\.|cdnjs\.|esm\.sh|googleapis\.)/i.test(f.text), f.name + ' must not reference a cdn host');
    }
    // the page points at exactly one script, by a DOCUMENT relative path. It has to be
    // document relative rather than root relative so the same file also opens from a
    // file:// URL with no server under it (see the static snapshot test).
    const srcs = [...root.text.matchAll(/src="([^"]+)"/g)].map(m => m[1]);
    assert.deepEqual(srcs, ['client/main.js']);
    // path traversal is refused
    assert.equal((await req(base + '/client/..%2Fserver.mjs')).status, 404);
    assert.equal((await req(base + '/client/server.mjs')).status, 404);
  } finally { await viz.close(); }
});

test('/api/graph returns every cell with a position, and the connectome as columns', async () => {
  const { brain, viz, base } = await boot();
  try {
    const g = (await req(base + '/api/graph')).json();
    assert.equal(g.cells.length, brain.cells.length);
    assert.ok(g.cells.length > 0);
    assert.equal(g.pos.length, g.cells.length * 3, 'three coordinates per cell');
    for (const c of g.cells) {
      assert.ok(typeof c.id === 'string' && c.id.length, 'cell id');
      assert.equal(typeof c.idx, 'number');
      assert.ok(c.kind && c.region && c.circuit, 'cell ' + c.id + ' carries kind, region, circuit');
      assert.ok(typeof c.period === 'string', 'period label');
      assert.ok(c.stats && typeof c.stats.runs === 'number', 'stats');
      const [x, y, z] = [g.pos[c.idx * 3], g.pos[c.idx * 3 + 1], g.pos[c.idx * 3 + 2]];
      assert.ok(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z), c.id + ' has a finite position');
      assert.ok(Math.hypot(x, y, z) > 0, c.id + ' is not at the origin');
    }
    // no two cells share a position: a point cloud where two neurons overlap is a lie
    const seen = new Set();
    for (const c of g.cells) {
      const key = [0, 1, 2].map(k => g.pos[c.idx * 3 + k].toFixed(3)).join(',');
      assert.ok(!seen.has(key), 'positions are distinct (' + c.id + ')');
      seen.add(key);
    }
    const e = g.edges;
    assert.equal(e.n, brain.connectome.size());
    for (const col of ['src', 'dst', 'w', 'flags', 'usage']) {
      assert.ok(Array.isArray(e[col]), 'edge column ' + col);
      assert.equal(e[col].length, e.n, 'edge column ' + col + ' length');
    }
    for (let i = 0; i < e.n; i++) {
      assert.ok(e.src[i] < g.cells.length && e.dst[i] < g.cells.length, 'edge endpoints are cells');
    }
    assert.ok(g.regions.length >= 5, 'regions');
    for (const r of g.regions) assert.match(r.color, /^#[0-9a-f]{6}$/i, r.name + ' has a colour');
    assert.equal(g.batchPolicy.batchMs, 50);
  } finally { await viz.close(); }
});

test('/api/events streams a summary frame and a cell.run batch after a tick', async () => {
  const { viz, base } = await boot();
  const s = openStream(base + '/api/events');
  try {
    const first = await s.wait(f => f.event === 'summary', 4000, 'the opening summary frame');
    assert.equal(typeof first.data.t, 'number');
    assert.equal(typeof first.data.cells, 'number');
    assert.ok('proposalsPending' in first.data, 'summary carries proposals pending');
    assert.ok('runsPerSec' in first.data, 'summary carries runs per second');

    const ticked = (await req(base + '/api/tick', { method: 'POST', body: { n: 4 } })).json();
    assert.equal(ticked.ticked, 4);

    const batch = await s.wait(f => f.event === 'batch' && (f.data.types['cell.run'] || 0) > 0, 4000, 'a batch carrying cell.run');
    assert.ok(batch.data.types['cell.run'] >= 1, 'at least one cell.run in the batch');
    assert.ok(batch.data.runs.length >= 2, 'runs are folded into [idx, count] pairs');
    assert.equal(batch.data.runs.length % 2, 0);
    assert.equal(batch.data.dropped, 0);
    // folding, not forwarding: the pairs are unique cell indices
    const idxs = batch.data.runs.filter((_, i) => i % 2 === 0);
    assert.equal(new Set(idxs).size, idxs.length, 'one pair per cell, counts folded');

    // and a periodic summary keeps arriving on its own cadence
    const before = s.frames.filter(f => f.event === 'summary').length;
    await s.wait(f => f.event === 'summary' && s.frames.filter(x => x.event === 'summary').length > before, 3000, 'a periodic summary frame');
  } finally { s.close(); await viz.close(); }
});

test('POST /api/inject then POST /api/tick produces a signal event from the injected cell', async () => {
  const brain = seedBasic();
  brain.tick(1); // step past t=0 so the only signals left to see are the ones we cause
  const viz = startViz(brain, { port: 0, host: '127.0.0.1' });
  await viz.ready;
  const base = viz.url;
  const s = openStream(base + '/api/events');
  try {
    await s.wait(f => f.event === 'summary', 4000, 'the opening summary frame');
    const injected = (await req(base + '/api/inject', {
      method: 'POST',
      body: { cell: 'p.encode', port: 'in', kind: 'event', data: { text: 'hello brain' } },
    })).json();
    assert.equal(injected.ok, true, JSON.stringify(injected));
    await req(base + '/api/tick', { method: 'POST', body: { n: 3 } });

    const idx = brain.byId.get('p.encode').idx;
    const frame = await s.wait(
      f => f.event === 'batch' && (f.data.types.signal || 0) > 0 && hasSig(f.data.sigs, idx),
      4000, 'a batch carrying a signal emitted by p.encode');
    assert.ok(frame.data.types.signal >= 1);
    assert.equal(frame.data.sigs.length % 3, 0, 'signals are folded into [idx, port, count] triples');
    // a bad injection is refused rather than silently dropped
    const bad = (await req(base + '/api/inject', { method: 'POST', body: { cell: 'nope', port: 0, kind: 'event', data: {} } })).json();
    assert.equal(bad.ok, false);
    assert.match(bad.error, /no cell/);
  } finally { s.close(); await viz.close(); }
});
// The microsecond readouts are MEASURED, not modelled: the server wraps hrtime around the
// ticks it drives and divides by the runs and by the packets those ticks actually made.
test('the microsecond readouts are measured wall time, per cell run and per packet moved', async () => {
  const brain = seedBasic();
  const viz = startViz(brain, { port: 0, host: '127.0.0.1' });
  await viz.ready;
  const base = viz.url;
  try {
    const cold = (await req(base + '/api/summary')).json().timing;
    assert.equal(cold.source, 'no traffic yet');
    assert.equal(cold.usPerPacket, 0, 'nothing has been timed yet');

    await req(base + '/api/inject', { method: 'POST', body: { cell: 'p.encode', port: 'in', kind: 'event', data: { text: 'hello brain' } } });
    const runs0 = brain.stats.runs, del0 = brain.stats.delivered;
    const ticked = (await req(base + '/api/tick', { method: 'POST', body: { n: 40 } })).json();
    assert.equal(ticked.ticked, 40);
    assert.ok(brain.stats.runs > runs0, 'the driven ticks ran cells');
    assert.ok(brain.stats.delivered > del0, 'the driven ticks delivered packets');

    const t = (await req(base + '/api/summary')).json().timing;
    assert.equal(t.source, 'measured around driven ticks');
    assert.ok(t.usPerRun > 0, 'a cell run takes a positive number of microseconds');
    assert.ok(t.usPerPacket > 0, 'moving a packet takes a positive number of microseconds');
    assert.equal(t.runsTimed, brain.stats.runs - runs0);
    assert.equal(t.packetsTimed, brain.stats.delivered - del0);
    // a tick of the organism is the sum of the work in it, so it cannot be cheaper than one run
    assert.ok(t.usPerRun < 1e6 && t.usPerPacket < 1e6, 'these are microseconds, not seconds');
  } finally { await viz.close(); }
});
function hasSig(sigs, idx) {
  for (let i = 0; i < sigs.length; i += 3) if (sigs[i] === idx) return true;
  return false;
}

test('/api/cell/:id returns the inspect record, and an unknown cell is a 404', async () => {
  const { viz, base } = await boot();
  try {
    const c = (await req(base + '/api/cell/p.encode')).json();
    assert.equal(c.id, 'p.encode');
    assert.equal(c.kind, 'encode.hv');
    assert.equal(c.periodLabel, 'event');
    assert.ok(Array.isArray(c.edgesOut) && c.edgesOut.length >= 1, 'edges out');
    assert.ok(Array.isArray(c.edgesIn), 'edges in');
    assert.ok(c.stats && typeof c.stats.runs === 'number');
    JSON.stringify(c); // the record must survive a round trip even though state holds typed arrays
    const missing = await req(base + '/api/cell/does.not.exist');
    assert.equal(missing.status, 404);
    const summary = (await req(base + '/api/summary')).json();
    assert.equal(summary.cells, 17);
    assert.equal(typeof summary.liveEdges, 'number');
  } finally { await viz.close(); }
});

test('close() frees the port', async () => {
  const { viz, base } = await boot();
  const port = viz.port;
  assert.ok(port > 0);
  assert.equal((await req(base + '/api/summary')).status, 200);
  await viz.close();
  await assert.rejects(() => req('http://127.0.0.1:' + port + '/api/summary'), (err) => {
    assert.ok(/ECONNREFUSED|ECONNRESET|socket hang up/.test(String(err.code || err.message)), String(err));
    return true;
  });
  await viz.close(); // idempotent
});

test('the layout is deterministic, and the refinement tightens edges without collapsing cells', () => {
  const brain = seedBasic();
  const a = layoutBrain(brain, { iterations: 120 });
  const b = layoutBrain(brain, { iterations: 120 });
  assert.deepEqual(Array.from(a.pos), Array.from(b.pos), 'same brain, same seed, same coordinates');
  assert.ok(a.stats.meanEdgeAfter < a.stats.meanEdgeBefore, 'edges pulled together: ' + a.stats.meanEdgeBefore + ' to ' + a.stats.meanEdgeAfter);
  // The springs are allowed to pull the closest pair closer, and on the cortical sheet
  // they do (measured 0.273 to 0.236 on the seed brain). What is not allowed is a
  // collapse, so the closest pair is also graded in absolute terms: no two cells may end
  // up inside a hundredth of the layout scale of each other, where they would render as
  // one point.
  assert.ok(a.stats.minDistAfter >= a.stats.minDistBefore * 0.8, 'cells not collapsed: ' + a.stats.minDistBefore + ' to ' + a.stats.minDistAfter);
  let closest = Infinity;
  for (let i = 0; i < a.n; i++) {
    for (let j = i + 1; j < a.n; j++) {
      const d = Math.hypot(a.pos[i * 3] - a.pos[j * 3], a.pos[i * 3 + 1] - a.pos[j * 3 + 1], a.pos[i * 3 + 2] - a.pos[j * 3 + 2]);
      if (d < closest) closest = d;
    }
  }
  assert.ok(closest > a.scale * 0.01, 'two cells landed on the same point: ' + closest);
  for (const r of a.regions) assert.ok(r.cells > 0, r.name);

  // regions stay apart: the mean position of perception is not the mean of motor
  const mean = (name) => {
    const ids = brain.cells.filter(c => c.region === name).map(c => c.idx);
    const m = [0, 0, 0];
    for (const i of ids) for (let k = 0; k < 3; k++) m[k] += a.pos[i * 3 + k] / ids.length;
    return m;
  };
  const p = mean('perception'), mo = mean('motor');
  assert.ok(Math.hypot(p[0] - mo[0], p[1] - mo[1], p[2] - mo[2]) > 20, 'perception and motor occupy different lobes');

  // and it scales: 5,000 cells with 50,000 edges is the size the renderer is graded at
  const cells = [];
  for (let i = 0; i < 5000; i++) cells.push({ idx: i, region: ['perception', 'association', 'cognitive', 'motor', 'memory'][i % 5], circuit: 'c' + (i % 41) });
  const src = new Uint32Array(50000), dst = new Uint32Array(50000), w = new Float32Array(50000);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let e = 0; e < 50000; e++) { src[e] = Math.floor(rnd() * 5000); dst[e] = Math.floor(rnd() * 5000); w[e] = rnd(); }
  const big = computeLayout({ cells, edges: { src, dst, w }, seed: 'big', iterations: 24 });
  assert.equal(big.pos.length, 15000);
  for (let i = 0; i < big.pos.length; i++) assert.ok(Number.isFinite(big.pos[i]), 'finite coordinate at ' + i);
});

// The static page. No server: captureSnapshot freezes the graph plus a recording of
// real batch frames into one JSON file, and writeStatic lays out a directory that can
// be copied onto plain static hosting and opened with nothing running behind it.
test('captureSnapshot records real frames, and writeStatic writes a page that needs no server', () => {
  const brain = seedBasic();
  const snap = captureSnapshot(brain, {
    frames: 24, layout: { iterations: 40 },
    drive: (b, i) => {
      if (i % 4 === 0) b.inject('p.encode', 'in', { kind: 'event', data: { text: 'hello brain ' + i } });
      b.tick(3);
    },
  });
  assert.equal(snap.kind, 'brain.snapshot');
  assert.equal(snap.frames.length, 24);
  assert.equal(snap.graph.cells.length, brain.cells.length, 'every cell is in the snapshot');
  assert.equal(snap.graph.pos.length, brain.cells.length * 3, 'every cell has a position');

  // the recording has to contain actual work, not empty frames
  const runs = snap.frames.reduce((a, f) => a + (f.types['cell.run'] || 0), 0);
  const sigs = snap.frames.reduce((a, f) => a + (f.types.signal || 0), 0);
  assert.ok(runs > 0, 'recorded cell.run events: ' + runs);
  assert.ok(sigs > 0, 'recorded signal events: ' + sigs);
  assert.ok(snap.summary.runsPerSec > 0, 'the frozen summary carries a real rate: ' + snap.summary.runsPerSec);
  // folded, not raw: a frame lists each cell once with a count
  for (const f of snap.frames) {
    assert.equal(f.runs.length % 2, 0);
    const seen = new Set();
    for (let i = 0; i < f.runs.length; i += 2) {
      assert.ok(!seen.has(f.runs[i]), 'cell ' + f.runs[i] + ' folded to one entry');
      seen.add(f.runs[i]);
    }
  }
  // and it survives the only transport it has: JSON on disk
  const round = JSON.parse(JSON.stringify(snap));
  assert.deepEqual(round.frames[3], snap.frames[3]);

  const dir = mkdtempSync(path.join(tmpdir(), 'brainviz-'));
  try {
    const out = writeStatic(brain, dir, { frames: 8, layout: { iterations: 20 } });
    assert.equal(out.cells, brain.cells.length);
    assert.ok(existsSync(path.join(dir, 'index.html')), 'index.html');
    assert.ok(existsSync(path.join(dir, 'snapshot.json')), 'snapshot.json');
    assert.ok(existsSync(path.join(dir, 'client', 'main.js')), 'client/main.js');
    const html = readFileSync(path.join(dir, 'index.html'), 'utf8');
    // a page opened from a file:// URL cannot resolve a root relative script src, and
    // must never reach for the network
    assert.ok(!/https?:\/\//.test(html), 'no absolute URLs in the static page');
    assert.ok(!/src="\//.test(html), 'no root relative script src: ' + (html.match(/src="[^"]*"/g) || []).join(' '));
    assert.match(html, /src="client\/main\.js"/);
    const written = JSON.parse(readFileSync(path.join(dir, 'snapshot.json'), 'utf8'));
    assert.equal(written.kind, 'brain.snapshot');
    assert.equal(written.frames.length, 8);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ------------------------------------------------------- the anatomy holds
// Every cell is a component of the brain, so every cell has to land inside the brain:
// the cerebral ellipsoid, the cerebellum, or the brainstem capsule. Nothing floats.
// The force refinement runs after the seed placement and is the part that could push a
// cell out, so this is graded on the refined positions, at two very different sizes.
test('the layout places every cell inside the brain volume', async () => {
  const brain = seedBasic();
  const scale = 100;
  const real = layoutBrain(brain, { scale });
  const outside = [];
  for (let i = 0; i < real.n; i++) {
    const x = real.pos[i * 3] / scale, y = real.pos[i * 3 + 1] / scale, z = real.pos[i * 3 + 2] / scale;
    if (!insideBrain(x, y, z)) outside.push([brain.cells[i].id, x, y, z]);
  }
  assert.equal(outside.length, 0, 'outside the volume: ' + JSON.stringify(outside.slice(0, 5)));

  // and at organism scale, where the clusters are dense enough for repulsion to shove
  const cells = [];
  for (let i = 0; i < 5000; i++) {
    cells.push({ idx: i, region: REGION_ORDER[i % REGION_ORDER.length], circuit: 'c' + (i % 37) });
  }
  const src = new Int32Array(20000), dst = new Int32Array(20000), w = new Float32Array(20000).fill(1);
  for (let e = 0; e < 20000; e++) { src[e] = (e * 7919) % 5000; dst[e] = (e * 104729 + 13) % 5000; }
  const big = computeLayout({ cells, edges: { src, dst, w }, seed: 'anatomy', iterations: 120, scale });
  let bad = 0;
  for (let i = 0; i < big.n; i++) {
    if (!insideBrain(big.pos[i * 3] / scale, big.pos[i * 3 + 1] / scale, big.pos[i * 3 + 2] / scale)) bad++;
  }
  assert.equal(bad, 0, bad + ' of ' + big.n + ' cells left the brain volume');

  // the midline gap is real: no cerebral cell sits on the plane between the hemispheres
  const stemmed = new Set(brain.cells.filter(c => c.region === 'homeostasis').map(c => c.idx));
  for (let i = 0; i < real.n; i++) {
    if (stemmed.has(i)) continue;
    assert.ok(Math.abs(real.pos[i * 3]) > 0, 'cell ' + i + ' sits on the midline');
  }
});

// -------------------------------------------------- the pipeline is ordered
// The second view is the same cells read as a production line. Left to right must be the
// order signals actually move in: perception, association, memory, cognitive, motor,
// homeostasis, with every cell of a stage inside that stage's slab.
test('the pipeline view orders stages left to right by region', async () => {
  const brain = seedBasic();
  const scale = 100;
  const l = layoutBrain(brain, { scale });
  assert.ok(l.pipeline, 'the layout carries a pipeline view');
  const { pos, stages, order } = l.pipeline;

  const present = PIPELINE_ORDER.filter(r => order.includes(r));
  assert.deepEqual(order.filter(r => PIPELINE_ORDER.includes(r)), present, 'stages follow the flow order');
  for (let i = 1; i < stages.length; i++) {
    assert.ok(stages[i].x > stages[i - 1].x, stages[i].name + ' must stand to the right of ' + stages[i - 1].name);
  }

  // every cell of a region sits in its own stage, measured against the stage centres
  const xOf = new Map(stages.map(st => [st.name, st.x]));
  let placed = 0;
  for (const c of brain.cells) {
    const want = xOf.get(c.region);
    assert.ok(want !== undefined, 'region ' + c.region + ' has a stage');
    assert.ok(Math.abs(pos[c.idx * 3] - want) < scale * 0.12, c.id + ' is not in the ' + c.region + ' slab');
    placed++;
  }
  assert.equal(placed, brain.cells.length);

  // means per region are monotonic in the flow order, which is what the eye reads
  let last = -Infinity;
  for (const name of present) {
    const members = brain.cells.filter(c => c.region === name);
    const mean = members.reduce((a, c) => a + pos[c.idx * 3], 0) / members.length;
    assert.ok(mean > last, name + ' breaks the left to right order');
    last = mean;
  }

  // and the same object reaches the client over the wire
  const viz = startViz(brain, { port: 0, host: '127.0.0.1' });
  await viz.ready;
  try {
    const g = await req(viz.url + '/api/graph');
    assert.equal(g.status, 200);
    const wire = g.json();
    assert.ok(wire.pipeline, '/api/graph carries the pipeline layout');
    assert.deepEqual(wire.pipeline.order, order);
    assert.equal(wire.pipeline.pos.length, brain.cells.length * 3);
    assert.deepEqual(wire.pipeline.stages.map(st => st.name), stages.map(st => st.name));
    // the anatomical positions travel in the same payload: one object, two views
    assert.equal(wire.pos.length, wire.pipeline.pos.length);
  } finally { await viz.close(); }

  // determinism: the same cells and seed give the same line, twice
  const cells = brain.cells.map(c => ({ idx: c.idx, region: c.region, circuit: c.circuit }));
  const a = pipelineLayout({ cells, seed: brain.name, scale });
  const b = pipelineLayout({ cells, seed: brain.name, scale });
  assert.deepEqual(Array.from(a.pos), Array.from(b.pos));
});

// ---------------------------------------------------------------------------
// NOTHING PULSES BY ITSELF. A node is allowed to be lit only because its cell ran, and
// the module that decides that is the same module the vertex shader mirrors line for
// line (see client/activation.js and the `act` line in CELL_VS). Grading it here needs
// no GPU: a frame goes in, and every cell the frame did not name must be exactly zero.
test('no node has a nonzero activation in a frame in which its cell did not run', () => {
  const N = 64;
  const a = new Activation(N);
  assert.equal(a.neverRan().length, N, 'a fresh brain has nothing lit');
  for (let i = 0; i < N; i++) assert.equal(a.value(i, 1.0), 0, 'cell ' + i + ' lit before any frame');

  // one real frame shape: [cellIdx, count, ...] exactly as the server folds cell.run
  const ran = [3, 3, 11, 1, 40, 17];
  const lit = a.applyFrame({ runs: ran, sigs: [5, 0, 9, 7, 1, 4], edges: [] }, 2.0);
  assert.equal(lit, 3);
  const didRun = new Set([3, 11, 40]);
  for (let i = 0; i < N; i++) {
    const v = a.value(i, 2.0);
    if (didRun.has(i)) assert.ok(v > 0.99, 'cell ' + i + ' ran and is not lit: ' + v);
    else assert.equal(v, 0, 'cell ' + i + ' did not run in this frame and is lit: ' + v);
  }
  // signals in the frame move packets along conduits, they never light a node
  for (const idx of [5, 7]) assert.equal(a.value(idx, 2.0), 0, 'an emitting cell was lit by its signal, not by a run');

  // it decays, and it decays to a floor of zero rather than to an idle twinkle
  const decayed = a.value(3, 2.0 + 0.30 * 4);
  assert.ok(decayed > 0 && decayed < 0.02, 'activation decays: ' + decayed);
  assert.equal(a.value(4, 1e6), 0, 'a cell that never ran is still dark after a million seconds');
  assert.equal(a.neverRan().length, N - 3);

  // and the clamp: an index outside the brain cannot light anything
  assert.equal(a.noteRun(-1, 5), false);
  assert.equal(a.noteRun(N, 5), false);
});

// Every inter-region edge is carried by exactly one conduit, and no conduit is invented:
// its endpoints are the centroids of the cells it actually joins.
test('conduits carry every inter-region edge and nothing else', () => {
  const brain = seedBasic();
  brain.tick(40);
  const l = layoutBrain(brain, { seed: brain.name });
  const { conduits, conduitOfEdge } = buildConduits(brain, l);
  const c = brain.connectome, n = c.size();
  const regionOf = brain.cells.map(cl => cl.region || 'default');
  let inter = 0;
  for (let e = 0; e < n; e++) {
    const cross = regionOf[c.src[e]] !== regionOf[c.dst[e]];
    if (cross) { inter++; assert.ok(conduitOfEdge[e] >= 0, 'edge ' + e + ' crosses regions and has no conduit'); }
    else assert.equal(conduitOfEdge[e], -1, 'a local edge was put in a conduit');
  }
  assert.equal(conduits.reduce((s, cd) => s + cd.edges, 0), inter, 'the conduits do not add up to the crossing edges');
  const seen = new Set();
  for (const cd of conduits) {
    assert.notEqual(cd.from, cd.to);
    assert.ok(!seen.has(cd.from + '>' + cd.to), 'two conduits for one region pair');
    seen.add(cd.from + '>' + cd.to);
    assert.ok(cd.edges > 0 && cd.meanDelay >= 0);
    for (const p of [cd.a, cd.b]) for (const v of p) assert.ok(Number.isFinite(v));
    assert.ok(Math.hypot(cd.a[0] - cd.b[0], cd.a[1] - cd.b[1], cd.a[2] - cd.b[2]) > 0, 'a conduit with no length');
  }
});

// Two cells look identical only when they are the same kind with the same stats.
test('capability separates cells, and every part of the score is read off the cell', () => {
  const brain = seedBasic();
  brain.tick(60);
  const c = brain.connectome;
  const scores = brain.cells.map(cl => capabilityOf(cl, c.degree(cl.idx)));
  for (const s of scores) {
    assert.ok(s.score >= 0 && s.score <= 1, 'score out of range: ' + s.score);
    assert.ok(s.cost > 0, 'a kind with no declared cost');
    assert.ok(s.ports >= 0 && s.kinds >= 0 && s.bytes >= 0);
    for (const v of Object.values(s.parts)) assert.ok(v >= 0 && v <= 1);
  }
  const distinct = new Set(scores.map(s => s.score.toFixed(6)));
  assert.ok(distinct.size > 1, 'every cell in the seed brain scored the same');
  // the doc string of the kind is the plain words shown in the panel
  const fns = brain.cells.map(cl => functionOf(cl.kind));
  assert.ok(fns.every(f => typeof f === 'string'));
  assert.ok(fns.some(f => f.length > 10), 'no kind in the seed brain documents what it does');
});

// ---------------------------------------------------------- the rules the survivors named
// Every test below was written against a mutant that lived through this file as it stood
// (bench/mutants.mjs, the viz sweep), and each one names the mutant it kills. A survivor is
// a hole in the grading, not a compliment.

test('anatomy: the default margin IS the fold allowance, and the layout does not need it', () => {
  // vz07: insideBrain's default margin cut from 1.06 to 1.00. Nothing pinned the default,
  // because every cell the layout places sits well inside the nominal shell anyway.
  // A point 3 percent outside the cerebellum's own shell, straight back along z, is
  // outside the cerebrum and outside the stem, so it exercises exactly one boundary.
  const p = [CEREBELLUM.c[0], CEREBELLUM.c[1], CEREBELLUM.c[2] - CEREBELLUM.r[2] * 1.03];
  assert.equal(insideBrain(p[0], p[1], p[2], 1.0), false, 'the nominal shell must exclude it');
  assert.equal(insideBrain(p[0], p[1], p[2], 1.06), true, 'the declared allowance must include it');
  assert.equal(insideBrain(p[0], p[1], p[2]), true, 'the DEFAULT margin is the declared allowance');
  const far = [CEREBELLUM.c[0], CEREBELLUM.c[1], CEREBELLUM.c[2] - CEREBELLUM.r[2] * 1.12];
  assert.equal(insideBrain(far[0], far[1], far[2]), false, 'and the allowance is not unbounded');

  // and the honest number: how much of that allowance the real layout actually uses.
  const brain = seedBasic();
  const l = layoutBrain(brain, { seed: brain.name, scale: 100 });
  let worst = 0, counted = 0;
  for (let i = 0; i < l.n; i++) {
    const x = l.pos[i * 3] / 100, y = l.pos[i * 3 + 1] / 100, z = l.pos[i * 3 + 2] / 100;
    let r = 0;
    if (l.vols[i] === VOL.CEREBRUM) {
      const a = (x - CEREBRUM.c[0]) / CEREBRUM.r[0], b = (y - CEREBRUM.c[1]) / CEREBRUM.r[1], c = (z - CEREBRUM.c[2]) / CEREBRUM.r[2];
      r = Math.hypot(a, b, c) / cerebralProfile(a, b, c);
    } else if (l.vols[i] === VOL.CEREBELLUM) {
      const a = (x - CEREBELLUM.c[0]) / CEREBELLUM.r[0], b = (y - CEREBELLUM.c[1]) / CEREBELLUM.r[1], c = (z - CEREBELLUM.c[2]) / CEREBELLUM.r[2];
      r = Math.hypot(a, b, c);
    } else continue;
    counted++;
    if (r > worst) worst = r;
  }
  assert.ok(worst <= 1.06, 'a cell used more than the whole allowance: ' + worst);
  console.log('anatomy      ' + counted + ' cells in the two masses, worst radius/profile ' + worst.toFixed(6)
    + ' against a declared allowance of 1.06');
});

test('the cortical sheet stays in its band: no cell leaks through the folded shell', () => {
  // vz11: the containment band widened eightfold on the OUTSIDE. Every cell was still
  // inside the brain, so nothing failed, and the cortex quietly stopped being a sheet.
  const brain = seedBasic();
  const l = layoutBrain(brain, { seed: brain.name, scale: 100 });
  const BAND = 0.115 * 0.40;      // FOLD * 0.40, the band contain() holds the sheet in
  let sheet = 0, worstOut = -Infinity, worstIn = -Infinity;
  for (let i = 0; i < l.n; i++) {
    if (l.sheets[i] !== 1 || l.vols[i] !== VOL.CEREBRUM) continue;
    sheet++;
    const a = (l.pos[i * 3] / 100 - CEREBRUM.c[0]) / CEREBRUM.r[0];
    const b = (l.pos[i * 3 + 1] / 100 - CEREBRUM.c[1]) / CEREBRUM.r[1];
    const c = (l.pos[i * 3 + 2] / 100 - CEREBRUM.c[2]) / CEREBRUM.r[2];
    const d = Math.hypot(a, b, c);
    const shell = sheetAt(a, b, c).r * cerebralProfile(a, b, c);
    worstOut = Math.max(worstOut, d - shell);
    worstIn = Math.max(worstIn, shell - d);
  }
  assert.ok(sheet > 5, 'the seed brain must place cells on the cortical sheet: ' + sheet);
  assert.ok(worstOut <= BAND, 'a sheet cell sits ' + worstOut.toFixed(6) + ' outside its own shell, past the '
    + BAND.toFixed(6) + ' band');
  assert.ok(worstIn <= BAND + 1e-6, 'a sheet cell sank ' + worstIn.toFixed(6) + ' below its own shell');
  console.log('sheet band   ' + sheet + ' cerebral sheet cells, furthest out ' + worstOut.toFixed(6)
    + ', furthest in ' + worstIn.toFixed(6) + ', band ' + BAND.toFixed(6));
});

test('a conduit is directed, and its ends are the centroids of the cells it joins', () => {
  // vz17: the conduit key sorted its two region names, so a to b and b to a merged into
  // one bundle. The seed brain has no reciprocal region pair, so nothing noticed. This
  // grades buildConduits on an input that HAS one, built by hand.
  const pos = new Float32Array([
    0, 0, 0,     10, 0, 0,        // region a: cells 0, 1
    0, 20, 0,    0, 40, 0,        // region b: cells 2, 3
  ]);
  const fake = {
    cells: [{ region: 'a' }, { region: 'a' }, { region: 'b' }, { region: 'b' }],
    connectome: {
      size: () => 4,
      src: [0, 2, 1, 3], dst: [2, 0, 3, 1],
      delay: [1, 2, 3, 4], w: [1, -1, 2, 0.5],
    },
  };
  const { conduits, conduitOfEdge } = buildConduits(fake, { pos });
  assert.equal(conduits.length, 2, 'a to b and b to a are two bundles, not one');
  const ab = conduits.find(c => c.from === 'a' && c.to === 'b');
  const ba = conduits.find(c => c.from === 'b' && c.to === 'a');
  assert.ok(ab && ba, 'both directions are present: ' + JSON.stringify(conduits.map(c => c.from + '>' + c.to)));
  assert.equal(ab.edges, 2); assert.equal(ba.edges, 2);
  assert.notEqual(conduitOfEdge[0], conduitOfEdge[1], 'an edge and its reverse share a conduit');
  // vz19: the ends are MEANS. Cells 0 and 1 sit at x 0 and 10, so the a end is x 5, and
  // the sum, 10, is a point outside the picture entirely.
  assert.deepEqual(ab.a, [5, 0, 0], 'the a end is the centroid of cells 0 and 1');
  assert.deepEqual(ab.b, [0, 30, 0], 'the b end is the centroid of cells 2 and 3');
  assert.equal(ab.meanDelay, 2, 'delays 1 and 3 average to 2');
  assert.equal(ab.meanW, 1.5, 'weights 1 and 2 average to 1.5');

  // and on the real brain, every endpoint equals the centroid computed independently
  const brain = seedBasic();
  brain.tick(40);
  const l = layoutBrain(brain, { seed: brain.name });
  const real = buildConduits(brain, l).conduits;
  const c = brain.connectome, n = c.size();
  const regionOf = brain.cells.map(cl => cl.region || 'default');
  const want = new Map();
  for (let e = 0; e < n; e++) {
    const ra = regionOf[c.src[e]], rb = regionOf[c.dst[e]];
    if (!ra || !rb || ra === rb) continue;
    const key = ra + '>' + rb;
    let w = want.get(key);
    if (!w) { w = { a: [0, 0, 0], b: [0, 0, 0], n: 0 }; want.set(key, w); }
    for (let j = 0; j < 3; j++) { w.a[j] += l.pos[c.src[e] * 3 + j]; w.b[j] += l.pos[c.dst[e] * 3 + j]; }
    w.n++;
  }
  assert.equal(real.length, want.size);
  let worst = 0, sum = 0, bundled = 0;
  for (const cd of real) {
    const w = want.get(cd.from + '>' + cd.to);
    assert.ok(w, 'a conduit for a pair with no crossing edges: ' + cd.from + '>' + cd.to);
    if (w.n > 1) bundled++;
    for (let j = 0; j < 3; j++) {
      worst = Math.max(worst, Math.abs(cd.a[j] - w.a[j] / w.n), Math.abs(cd.b[j] - w.b[j] / w.n));
      sum = Math.max(sum, Math.abs(w.a[j]));
    }
  }
  assert.ok(worst < 1e-6, 'a conduit end is not the centroid of its own traffic: off by ' + worst);
  assert.ok(bundled > 0, 'no conduit on the real brain bundles more than one edge, so no mean was graded');
  console.log('conduits     ' + real.length + ' bundles, worst |end - centroid| ' + worst.toExponential(2)
    + ' world units, where the raw sum reaches ' + sum.toFixed(1));
});

test('capability is read off the cell: what it can say, what it carries, how hard it worked', () => {
  // vz20: the usage term dropped out of the score. vz21: out ports stopped counting.
  // vz27: a typed array of state counted as zero bytes. All three survived because the
  // suite only ever checked that the parts were in range, never that they MOVED.
  const mk = (out, state, runs) => ({
    kind: 'not.a.registered.kind',
    ports: { in: [{ name: 'in', kinds: ['num'] }], out },
    state, stats: { runs },
  });
  const idle = capabilityOf(mk([], null, 0), { in: 0, out: 0 });
  const worked = capabilityOf(mk([], null, 4096), { in: 40, out: 40 });
  assert.ok(worked.parts.usage > 0.5, 'a cell with 80 edges and 4096 runs has no usage: ' + worked.parts.usage);
  assert.equal(idle.parts.usage, 0, 'an unwired cell that never ran has usage: ' + idle.parts.usage);
  assert.ok(worked.score > idle.score + 0.05, 'working changed nothing: ' + idle.score + ' to ' + worked.score);

  const mute = capabilityOf(mk([], null, 0), { in: 0, out: 0 });
  const speaks = capabilityOf(mk([{ name: 'out', kinds: ['num'] }, { name: 'o2', kinds: ['vec'] }], null, 0), { in: 0, out: 0 });
  assert.equal(mute.ports, 1, 'one in port');
  assert.equal(speaks.ports, 3, 'one in port and two out ports');
  assert.ok(speaks.score > mute.score, 'what a cell can SAY does not count: ' + mute.score + ' to ' + speaks.score);
  assert.ok(speaks.kinds > mute.kinds, 'the out port kinds are not counted');

  const fat = capabilityOf(mk([], { w: new Float64Array(4096) }, 0), { in: 0, out: 0 });
  assert.equal(stateBytes(new Float64Array(4096)), 32768, 'a typed array is counted by its real byte length');
  assert.ok(fat.bytes >= 32768, 'a cell carrying 32 KB reports ' + fat.bytes + ' bytes');
  assert.ok(fat.parts.memory > 0.5 && fat.score > idle.score, 'the memory a cell carries does not count');
  console.log('capability   idle ' + idle.score + ', worked ' + worked.score + ' (usage ' + worked.parts.usage.toFixed(3)
    + '), speaking ' + speaks.score + ', carrying 32 KB ' + fat.score + ' (' + fat.bytes + ' bytes)');
});
