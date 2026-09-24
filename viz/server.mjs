// viz/server.mjs - THE WINDOW. node:http only, zero dependencies, nothing external.
//
//   startViz(brain, { port = 0, host = '127.0.0.1' }) -> { url, port, close, ready }
//
// `url` and `port` are live getters. When port 0 is used (the default) the kernel picks
// the port, so read them after `await viz.ready` (ready resolves to the same object).
// With an explicit port they are correct immediately. close() returns a promise that
// resolves once the listener and every open stream are gone.
//
// Routes:
//   GET  /                 index.html
//   GET  /client/<x>.js    client modules
//   GET  /api/summary      brain.summary()
//   GET  /api/graph        cells, edges, regions, positions (?refine=N to re-layout)
//   GET  /api/layout       positions only (?refine=N)
//   GET  /api/cell/:id     brain.inspect(id)
//   GET  /api/events       Server Sent Events, batched (policy below)
//   POST /api/inject       { cell, port, kind, data }
//   POST /api/tick         { n }
//
// The server reads the brain. It never mutates it except through the two POST routes,
// which are the demo surface: inject a signal, advance the clock.
import http from 'node:http';
import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Clock } from '../core/clock.mjs';
import { getKind, hasKind } from '../core/cell.mjs';
import { dataFromJSON } from '../core/signal.mjs';
import { layoutBrain, regionColors } from './layout.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// SSE BATCH POLICY. Printed here because the client has to be able to trust it.
//
//   Ledger events are never forwarded one at a time. Every event is folded into an
//   accumulator by identity and the accumulator is flushed on a fixed cadence:
//
//     batch frame    every  50 ms  (20 frames/s)   event: batch
//     summary frame  every 250 ms  ( 4 frames/s)   event: summary
//
//   Folding is by identity, not by occurrence: 10,000 cell.run events per second spread
//   over 1,200 cells become at most 1,200 [idx, count] pairs per frame. The wire cost is
//   therefore bounded by the SIZE OF THE BRAIN and never by the EVENT RATE. A brain
//   running a million runs per second sends the same frame as one running a thousand,
//   only with larger counts.
//
//   Hard caps per frame (anything past a cap is dropped and counted in frame.dropped):
//     4096 run pairs, 4096 signal triples, 512 edge events, 256 proposals, 256 decisions.
//
//   Backpressure: a frame is skipped for a viewer whose socket already holds more than
//   BACKPRESSURE_BYTES of unflushed bytes, so a slow client can never make the server
//   queue memory. The accumulator keeps folding meanwhile, so nothing is lost except
//   resolution in time. Note what this rule is NOT: the return value of res.write() is
//   false for any frame larger than the 16 KB stream watermark, which a 5,000 cell frame
//   always is, so keying backpressure off that boolean starves every big brain.
// ---------------------------------------------------------------------------
export const BATCH_MS = 50;
export const SUMMARY_MS = 250;
export const CAPS = Object.freeze({ runs: 4096, sigs: 4096, edges: 512, proposals: 256, decisions: 256 });
export const BACKPRESSURE_BYTES = 1 << 20;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

export function startViz(brain, { port = 0, host = '127.0.0.1', layout = {}, staticDir = HERE } = {}) {
  const clients = new Set();
  let acc = newAcc();
  const lastOut = new Map(); // cell id -> the last signal it emitted, from the ledger
  let unsubscribe = null;
  let batchTimer = null, summaryTimer = null;
  let frameSeq = 0;
  let cache = null; // { layout, at }
  let closed = false;
  // The rates are differences of the brain's own cumulative counters, not of events
  // seen by the SSE listener, because that listener is detached whenever nobody is
  // watching. Reading them off the ledger would make a plain `curl /api/summary`
  // report 0 runs/s on a brain doing 40,000 a second.
  const rate = { lastT: Date.now(), runs: -1, signals: -1, runsPerSec: 0, signalsPerSec: 0, t: -1, ticksPerSec: 0 };
  // MICROSECONDS. Core does not time individual cell runs and I may not edit it, so the
  // viz measures what it can measure honestly: the wall clock around the ticks it drives
  // itself, divided by the runs those ticks performed. That is wall time per cell run,
  // including the scheduler and the delivery, which is the number a viewer of a pipeline
  // actually cares about. When nobody drives through this server (the brain is ticked by
  // its own process), there is no timed window, and the readout falls back to the
  // reciprocal of the observed run rate and says so.
  const timing = { usPerRun: 0, usPerPacket: 0, source: 'none', runsTimed: 0, packetsTimed: 0, nsTimed: 0 };
  function timeTicks(n) {
    const runs0 = brain.stats.runs | 0, del0 = brain.stats.delivered | 0;
    const t0 = process.hrtime.bigint();
    brain.tick(n);
    const ns = Number(process.hrtime.bigint() - t0);
    const runs = (brain.stats.runs | 0) - runs0;
    if (runs > 0) {
      timing.runsTimed += runs; timing.nsTimed += ns;
      // an exponential window, so a warm brain is not judged by its first tick
      const us = ns / 1000 / runs;
      timing.usPerRun = timing.usPerRun ? timing.usPerRun * 0.7 + us * 0.3 : us;
      timing.source = 'measured';
    }
    // and the same wall clock over the packets those ticks actually delivered: the
    // machine cost of moving one signal along one edge, which is a microsecond number
    // even when a hop of the organism clock is not.
    const packets = (brain.stats.delivered | 0) - del0;
    if (packets > 0) {
      timing.packetsTimed += packets;
      const usp = ns / 1000 / packets;
      timing.usPerPacket = timing.usPerPacket ? timing.usPerPacket * 0.7 + usp * 0.3 : usp;
    }
    return ns;
  }

  const server = http.createServer(handle);
  server.on('clientError', (err, socket) => { try { socket.destroy(); } catch {} });

  // ------------------------------------------------------------------ layout
  function getLayout(iterations) {
    const iters = iterations == null
      ? (cache ? cache.layout.iterations : (brain.cells.length > 2000 ? 120 : (layout.iterations ?? 240)))
      : iterations;
    if (cache && iterations == null && cache.cells === brain.cells.length && cache.edges === brain.connectome.size()) return cache.layout;
    const l = layoutBrain(brain, { seed: layout.seed ?? brain.name, iterations: iters, scale: layout.scale ?? 100 });
    cache = { layout: l, cells: brain.cells.length, edges: brain.connectome.size(), at: Date.now() };
    return l;
  }

  // ------------------------------------------------------------------ routes
  function handle(req, res) {
    let u;
    try { u = new URL(req.url, 'http://' + (req.headers.host || host + ':' + (server.address()?.port ?? port))); }
    catch { return send(res, 400, { error: 'bad url' }); }
    const p = u.pathname;
    try {
      if (req.method === 'GET' && (p === '/' || p === '/index.html')) return sendFile(res, path.join(staticDir, 'index.html'));
      if (req.method === 'GET' && p.startsWith('/client/')) {
        const name = p.slice('/client/'.length);
        if (!/^[A-Za-z0-9._-]+\.(js|css)$/.test(name) || name.includes('..')) return send(res, 404, { error: 'not found' });
        return sendFile(res, path.join(staticDir, 'client', name));
      }
      if (req.method === 'GET' && p === '/api/summary') return send(res, 200, summaryPayload());
      if (req.method === 'GET' && p === '/api/graph') return send(res, 200, graphPayload(intParam(u, 'refine')));
      if (req.method === 'GET' && p === '/api/layout') {
        const l = getLayout(intParam(u, 'refine'));
        return send(res, 200, { n: l.n, pos: Array.from(l.pos), iterations: l.iterations, stats: l.stats, scale: l.scale, shape: l.shape });
      }
      if (req.method === 'GET' && p.startsWith('/api/cell/')) {
        const id = decodeURIComponent(p.slice('/api/cell/'.length));
        if (!id) return send(res, 404, { error: 'no cell' });
        let ins;
        try { ins = brain.inspect(id); } catch (e) { return send(res, 404, { error: String(e.message || e) }); }
        ins.periodLabel = Clock.label(ins.policy.period);
        // The real ports of the real cell, named and typed, so the panel is showing the
        // component and not a decoration: these are the same port objects the connectome
        // wires srcPort and dstPort against.
        const cl = brain.cells[ins.idx];
        ins.ports = {
          in: cl.ports.in.map((pt, i) => ({ i, name: pt.name, kinds: pt.kinds })),
          out: cl.ports.out.map((pt, i) => ({ i, name: pt.name, kinds: pt.kinds })),
        };
        ins.lastOut = lastOutput(id, ins.idx);
        // what this node can do and what it is for, in plain words off the kind registry
        ins.capability = capabilityOf(cl, brain.connectome.degree(ins.idx));
        ins.fn = functionOf(cl.kind);
        return send(res, 200, jsonSafe(ins));
      }
      if (req.method === 'GET' && p === '/api/events') return subscribe(req, res);
      if (req.method === 'POST' && p === '/api/inject') return body(req, res, (b) => send(res, 200, doInject(b)));
      if (req.method === 'POST' && p === '/api/tick') return body(req, res, (b) => {
        const n = Math.max(0, Math.min(1e7, Number(b.n ?? 1) | 0));
        const ns = timeTicks(n);
        return send(res, 200, { ticked: n, ms: Math.round(ns / 1e3) / 1e3, ...summaryPayload() });
      });
      return send(res, 404, { error: 'not found', path: p });
    } catch (err) {
      return send(res, 500, { error: String(err && err.message || err) });
    }
  }

  function doInject(b) {
    const { cell, port: pt, kind, data } = b || {};
    if (!cell || !kind) return { ok: false, error: 'inject needs { cell, port, kind, data }' };
    try {
      const sig = brain.inject(cell, pt ?? 0, { kind, data: dataFromJSON(kind, data) }, { delay: Number(b.delay) || 0 });
      return { ok: true, cell, port: sig.port, kind: sig.kind, t: sig.t, seq: sig.seq };
    } catch (e) { return { ok: false, error: String(e.message || e) }; }
  }

  function summaryPayload() {
    const s = brain.summary();
    tickRate(s.stats);
    return {
      ...s,
      runsPerSec: rate.runsPerSec, signalsPerSec: rate.signalsPerSec,
      proposalsPending: brain.gate.listPending().length,
      ticksPerSec: rate.ticksPerSec,
      timing: timingPayload(),
      ledgerCounts: brain.ledger.summary(),
      viewers: clients.size,
    };
  }

  function graphPayload(refineIters) { return buildGraph(brain, getLayout(refineIters), layout); }

  // What this cell last said, and what it said. The kind, port and tick come from the
  // ledger, which records every emission. The VALUE is not in the ledger (only a content
  // hash is), so it is recovered from where the signal actually went: a signal in flight
  // is sitting in the mailbox of a downstream cell, and one that had nowhere to go is in
  // the brain's outbox. If neither still holds it, the kind and the hash stand alone,
  // which is the honest answer rather than an invented one.
  function lastOutput(id, idx) {
    // The live stream fills lastOut, but a page can ask about a cell with no stream ever
    // attached. The ledger's own ring is the same record, so fall back to it rather than
    // reporting nothing: this is the brain's history either way.
    let seen = lastOut.get(id) || null;
    if (!seen) {
      const recent = brain.ledger.recent(4000, 'signal');
      for (let i = recent.length - 1; i >= 0; i--) {
        const e = recent[i];
        if (e.cell === id) { seen = { t: e.t, port: e.port, kind: e.kind, hash: e.hash, seq: e.seq }; break; }
      }
    }
    const out = seen ? { ...seen, value: null, from: null } : null;
    let best = null;
    for (const sig of brain.outbox) if (sig.src === idx && (!best || sig.seq > best.sig.seq)) best = { sig, from: 'outbox' };
    for (const e of brain.connectome.outOf(idx)) {
      const dst = brain.cells[brain.connectome.dst[e]];
      if (!dst) continue;
      for (const box of dst.mailbox) {
        for (const it of box) {
          const sig = it && it.sig ? it.sig : it;
          if (sig && sig.src === idx && (!best || (sig.seq ?? -1) > (best.sig.seq ?? -1))) best = { sig, from: 'in flight to ' + dst.id };
        }
      }
    }
    if (!best) return out;
    const v = { kind: best.sig.kind, t: best.sig.t, port: best.sig.port, seq: best.sig.seq, value: summarize(best.sig.data), from: best.from };
    return out ? { ...out, ...v } : v;
  }

  // ------------------------------------------------------------------ SSE
  function onEvent(e) { foldEvent(brain, acc, e, lastOut); }
  function tickRate(stats) {
    const runs = (stats && stats.runs) | 0, signals = (stats && stats.signals) | 0;
    const t = brain.clock.t | 0;
    const now = Date.now(), dt = (now - rate.lastT) / 1000;
    if (rate.runs < 0) { rate.runs = runs; rate.signals = signals; rate.t = t; rate.lastT = now; return; }
    if (dt >= 0.2) {
      rate.runsPerSec = Math.max(0, Math.round((runs - rate.runs) / dt));
      rate.signalsPerSec = Math.max(0, Math.round((signals - rate.signals) / dt));
      rate.ticksPerSec = Math.max(0, Math.round((t - rate.t) / dt));
      rate.runs = runs; rate.signals = signals; rate.t = t; rate.lastT = now;
    }
  }
  // Microseconds per cell run, per delivered packet, and per tick of the organism's
  // clock. All three are wall time off the same hrtime windows, never a guess.
  function timingPayload() {
    const measured = timing.usPerRun > 0;
    const usPerRun = measured
      ? Math.round(timing.usPerRun * 1000) / 1000
      : (rate.runsPerSec > 0 ? Math.round((1e6 / rate.runsPerSec) * 1000) / 1000 : 0);
    const usPerTick = rate.ticksPerSec > 0 ? Math.round((1e6 / rate.ticksPerSec) * 10) / 10 : 0;
    return {
      usPerRun,
      source: measured ? 'measured around driven ticks' : (rate.runsPerSec > 0 ? 'derived from the observed run rate' : 'no traffic yet'),
      runsTimed: timing.runsTimed,
      usPerPacket: timing.usPerPacket > 0 ? Math.round(timing.usPerPacket * 1000) / 1000 : 0,
      packetsTimed: timing.packetsTimed,
      usPerTick, ticksPerSec: rate.ticksPerSec,
    };
  }
  function flushBatch() {
    if (!clients.size) return;
    if (!acc.types.size) return;
    const a = acc;
    acc = newAcc();
    broadcast('batch', drainFrame(brain, a, frameSeq++));
  }
  function flushSummary() {
    if (!clients.size) return;
    broadcast('summary', summaryPayload());
  }
  function broadcast(name, data) {
    const payload = 'event: ' + name + '\ndata: ' + JSON.stringify(data) + '\n\n';
    for (const c of clients) {
      if (c.res.writableLength > BACKPRESSURE_BYTES) { c.skipped++; continue; }
      try { c.res.write(payload); } catch { /* the close handler drops it */ }
    }
  }
  function subscribe(req, res) {
    res.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    });
    const c = { res, skipped: 0 };
    clients.add(c);
    res.write('retry: 1000\n\n');
    // The first thing a new viewer gets is a full summary, so the HUD is never empty.
    try { res.write('event: summary\ndata: ' + JSON.stringify(summaryPayload()) + '\n\n'); } catch {}
    if (!unsubscribe) unsubscribe = brain.ledger.on(onEvent);
    if (!batchTimer) { batchTimer = setInterval(flushBatch, BATCH_MS); batchTimer.unref?.(); }
    if (!summaryTimer) { summaryTimer = setInterval(flushSummary, SUMMARY_MS); summaryTimer.unref?.(); }
    const drop = () => {
      clients.delete(c);
      if (!clients.size) stopStreams();
      try { res.end(); } catch {}
    };
    req.on('close', drop); req.on('error', drop); res.on('error', drop);
  }
  function stopStreams() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    if (batchTimer) { clearInterval(batchTimer); batchTimer = null; }
    if (summaryTimer) { clearInterval(summaryTimer); summaryTimer = null; }
    acc = newAcc();
  }

  // ------------------------------------------------------------------ listen
  const ready = new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => { server.removeListener('error', reject); resolve(api); });
  });

  const api = {
    server, brain,
    get port() { return server.address()?.port ?? port; },
    get url() { const a = server.address(); const h = a && a.address === '::' ? 'localhost' : host; return 'http://' + h + ':' + (a?.port ?? port); },
    get viewers() { return clients.size; },
    ready,
    layout: getLayout,
    close() {
      if (closed) return Promise.resolve();
      closed = true;
      stopStreams();
      for (const c of clients) { try { c.res.end(); } catch {} }
      clients.clear();
      return new Promise((resolve) => {
        server.close(() => resolve());
        server.closeAllConnections?.();
      });
    },
  };
  return api;
}

// ------------------------------------------------------------- capability
// Every node is drawn the same size, so the thing that separates a powerful cell from a
// simple one has to be readable some other way: brightness and colour temperature. This
// is the score behind them, and it is computed from the cell itself, not from the
// picture. Five terms, each normalised to 0..1 and then weighted:
//
//   cost     what the kind declares it costs the scheduler to run it, once
//   ports    how many ports it has, in and out: a wide cell wires into more of the brain
//   kinds    how many distinct signal kinds it accepts: a general cell versus a narrow one
//   memory   the footprint of its own state, which is what it carries between runs
//   usage    how much of the connectome it actually touches (degree) and how hard it has
//            worked (runs), because capability that never fires is potential, not power
//
// Two cells only come out identical when they are the same kind with the same wiring and
// the same history, which is exactly when they should look identical.
export function capabilityOf(cell, degree) {
  const kind = hasKind(cell.kind) ? getKind(cell.kind) : null;
  const cost = kind ? (kind.cost ?? 1) : 1;
  const nports = cell.ports.in.length + cell.ports.out.length;
  const kinds = new Set();
  for (const p of [...cell.ports.in, ...cell.ports.out]) for (const k of p.kinds || []) kinds.add(k);
  const mem = stateBytes(cell.state);
  const deg = (degree ? degree.in + degree.out : 0);
  const runs = cell.stats ? cell.stats.runs | 0 : 0;
  const parts = {
    cost: clamp01(Math.log2(1 + cost) / 4),
    ports: clamp01(Math.log2(1 + nports) / 4),
    kinds: clamp01(Math.log2(1 + kinds.size) / 3),
    memory: clamp01(Math.log10(1 + mem) / 5),
    usage: clamp01(0.6 * (Math.log10(1 + deg) / 2.5) + 0.4 * (Math.log10(1 + runs) / 5)),
  };
  const score = 0.24 * parts.cost + 0.20 * parts.ports + 0.16 * parts.kinds + 0.20 * parts.memory + 0.20 * parts.usage;
  return { score: Math.round(clamp01(score) * 1000) / 1000, parts, cost, ports: nports, kinds: kinds.size, bytes: mem, degree: deg, runs };
}
function clamp01(v) { return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0; }
// A bounded estimate of what a cell carries between runs. Typed arrays are counted by
// their real byte length; plain structures are walked to a fixed depth so a pathological
// state cannot turn the graph payload into a traversal.
export function stateBytes(v, depth = 0) {
  if (v == null || depth > 4) return 0;
  if (ArrayBuffer.isView(v)) return v.byteLength;
  if (typeof v === 'string') return v.length * 2;
  if (typeof v === 'number') return 8;
  if (typeof v === 'boolean') return 4;
  if (Array.isArray(v)) {
    let t = 0;
    for (let i = 0; i < Math.min(v.length, 512); i++) t += stateBytes(v[i], depth + 1);
    return v.length > 512 ? Math.round((t * v.length) / 512) : t;
  }
  if (typeof v === 'object') {
    let t = 0;
    for (const k of Object.keys(v).slice(0, 256)) t += k.length * 2 + stateBytes(v[k], depth + 1);
    return t;
  }
  return 0;
}
/** What this cell does, in the words the kind itself declares. */
export function functionOf(kindName) {
  if (!hasKind(kindName)) return '';
  const k = getKind(kindName);
  return (k.doc || '').trim();
}

// -------------------------------------------------------------- the conduits
// A fibre tract. Thousands of individual axons between two regions are not fifty
// thousand lines on a screen, they are a bundle, and drawing them as a bundle is both
// the honest picture and the readable one. Every edge whose ends sit in different
// regions is merged into the conduit for that ordered region pair; the endpoints are the
// centroids of the cells actually involved, so a conduit starts and ends where its own
// traffic does.
export function buildConduits(brain, l) {
  const c = brain.connectome, n = c.size();
  const regionOf = brain.cells.map(cl => cl.region || 'default');
  const byPair = new Map();
  const conduitOfEdge = new Int32Array(n).fill(-1);
  for (let e = 0; e < n; e++) {
    const a = c.src[e], b = c.dst[e];
    const ra = regionOf[a], rb = regionOf[b];
    if (!ra || !rb || ra === rb) continue;          // intra-region wiring stays local
    const key = ra + '\0' + rb;
    let cd = byPair.get(key);
    if (!cd) {
      cd = { id: byPair.size, from: ra, to: rb, edges: 0, delaySum: 0, wSum: 0, a: [0, 0, 0], b: [0, 0, 0], na: 0, nb: 0 };
      byPair.set(key, cd);
    }
    cd.edges++;
    cd.delaySum += c.delay[e];
    cd.wSum += Math.abs(c.w[e]);
    for (let k = 0; k < 3; k++) { cd.a[k] += l.pos[a * 3 + k]; cd.b[k] += l.pos[b * 3 + k]; }
    cd.na++; cd.nb++;
    conduitOfEdge[e] = cd.id;
  }
  const conduits = [...byPair.values()].map(cd => ({
    id: cd.id, from: cd.from, to: cd.to, edges: cd.edges,
    meanDelay: cd.edges ? Math.round((cd.delaySum / cd.edges) * 100) / 100 : 0,
    meanW: cd.edges ? Math.round((cd.wSum / cd.edges) * 1000) / 1000 : 0,
    a: cd.a.map(v => v / Math.max(1, cd.na)),
    b: cd.b.map(v => v / Math.max(1, cd.nb)),
  }));
  return { conduits, conduitOfEdge };
}

// --------------------------------------------------------------- graph payload
// One builder for the live route and for the snapshot, so a static page and a served
// page are fed exactly the same object.
export function buildGraph(brain, l, layout = {}) {
  const c = brain.connectome, n = c.size();
  const tracts = buildConduits(brain, l);
  const names = [...brain.regions.keys()];
  const colors = regionColors(names);
  const regions = l.regions.map(r => ({ ...r, color: colors[r.name] || r.color, doc: brain.regions.get(r.name)?.doc || '' }));
  return {
    name: brain.name, t: brain.clock.t, gen: brain.clock.gen,
    scale: l.scale, shape: l.shape,
    regions,
    // Every node the renderer draws is one of these, and every field on it is read off
    // the running brain: the id, the kind that implements it, the region and circuit it
    // was declared in, its declared ports with the signal kinds they accept, its own
    // counters, and its degree in the live connectome. Nothing here is decorative and
    // nothing is invented for the picture.
    cells: brain.cells.map(cl => ({
      id: cl.id, idx: cl.idx, kind: cl.kind, region: cl.region, circuit: cl.circuit,
      period: Clock.label(cl.policy.period), periodRaw: cl.policy.period === 'event' ? 0 : cl.policy.period,
      ports: {
        in: cl.ports.in.map(p => ({ name: p.name, kinds: p.kinds })),
        out: cl.ports.out.map(p => ({ name: p.name, kinds: p.kinds })),
      },
      stats: cl.stats,
      degree: c.degree(cl.idx),
      // what it can do, and what it is for
      capability: capabilityOf(cl, c.degree(cl.idx)),
      fn: functionOf(cl.kind),
    })),
    // edges as parallel arrays: src, dst, w, flags, usage (plus ports and delay). Flat
    // arrays because 50,000 objects is 6 MB of JSON and 50,000 numbers is 300 KB.
    edges: {
      n,
      src: Array.from(c.src.subarray(0, n)),
      dst: Array.from(c.dst.subarray(0, n)),
      w: Array.from(c.w.subarray(0, n), v => Math.round(v * 1e4) / 1e4),
      flags: Array.from(c.flags.subarray(0, n)),
      usage: Array.from(c.usage.subarray(0, n)),
      srcPort: Array.from(c.srcPort.subarray(0, n)),
      dstPort: Array.from(c.dstPort.subarray(0, n)),
      delay: Array.from(c.delay.subarray(0, n)),
      // -1 means the edge is local to one region and is drawn as itself; anything else
      // is the index of the conduit that carries it
      conduit: Array.from(tracts.conduitOfEdge),
    },
    conduits: tracts.conduits,
    pos: Array.from(l.pos),
    // where each cell sits in the cortical fold: 0 at the bottom of a sulcus, 1 on the
    // crown of a gyrus. The renderer darkens the grooves with it, which is what makes
    // the surface read as a brain instead of a shell of dots.
    folds: l.folds ? Array.from(l.folds, v => Math.round(v * 1000) / 1000) : null,
    // The second view travels with the first. Both are the same cells in the same order,
    // so the client toggles between them by interpolating one array into the other, and
    // a snapshot on a static host carries both without asking for anything.
    pipeline: l.pipeline ? { pos: Array.from(l.pipeline.pos), stages: l.pipeline.stages, order: l.pipeline.order } : null,
    layout: { iterations: l.iterations, stats: l.stats, seed: layout.seed ?? brain.name },
    batchPolicy: { batchMs: BATCH_MS, summaryMs: SUMMARY_MS, caps: CAPS },
  };
}

// ------------------------------------------------------------- the frame folder
// Shared by the live stream and by the snapshot recorder, so a frame replayed from a
// static file is byte-for-byte the same shape the socket would have sent.
function newAcc() {
  return { runs: new Map(), sigs: new Map(), edges: [], prunes: [], proposals: [], decisions: [], types: new Map(), dropped: 0 };
}
function foldEvent(brain, a, e, lastOut = null) {
  a.types.set(e.type, (a.types.get(e.type) || 0) + 1);
  if (lastOut && e.type === 'signal' && e.cell && e.cell !== 'external') {
    // What a cell last said, kept per cell so the panel can show it. The ledger records
    // the kind, the port and a content hash of every signal a cell emits; the value
    // itself is recovered separately in cellPayload, from the mailbox it landed in.
    lastOut.set(e.cell, { t: e.t, port: e.port, kind: e.kind, hash: e.hash, seq: e.seq });
  }
  switch (e.type) {
    case 'cell.run': {
      const k = e.idx;
      if (a.runs.has(k)) a.runs.set(k, a.runs.get(k) + 1);
      else if (a.runs.size < CAPS.runs) a.runs.set(k, 1);
      else a.dropped++;
      break;
    }
    case 'signal': {
      const idx = e.cell === 'external' ? -1 : (brain.byId.get(e.cell)?.idx ?? -1);
      const k = idx * 256 + (e.port | 0);
      if (a.sigs.has(k)) a.sigs.set(k, a.sigs.get(k) + 1);
      else if (a.sigs.size < CAPS.sigs) a.sigs.set(k, 1);
      else a.dropped++;
      break;
    }
    case 'edge.add':
      if (a.edges.length < CAPS.edges) a.edges.push([e.e, brain.byId.get(e.src)?.idx ?? -1, brain.byId.get(e.dst)?.idx ?? -1, e.w ?? 1, e.srcPort | 0, e.dstPort | 0]);
      else a.dropped++;
      break;
    case 'edge.prune':
      if (a.prunes.length < CAPS.edges) a.prunes.push(e.e); else a.dropped++;
      break;
    case 'proposal':
      if (a.proposals.length < CAPS.proposals) a.proposals.push({ id: e.id, kind: e.kind, why: e.why, by: e.by, status: e.status }); else a.dropped++;
      break;
    case 'decision':
      if (a.decisions.length < CAPS.decisions) a.decisions.push({ proposal: e.proposal, kind: e.kind, status: e.status, by: e.by }); else a.dropped++;
      break;
    default: break;
  }
  return a;
}
function drainFrame(brain, a, seq) {
  const runs = [];
  for (const [idx, n] of a.runs) runs.push(idx, n);
  const sigs = [];
  for (const [k, n] of a.sigs) sigs.push(Math.floor(k / 256), ((k % 256) + 256) % 256, n);
  return {
    seq, t: brain.clock.t, gen: brain.clock.gen, ms: Date.now(),
    types: Object.fromEntries(a.types),
    runs, sigs, edges: a.edges, prunes: a.prunes,
    proposals: a.proposals, decisions: a.decisions,
    dropped: a.dropped,
  };
}

// ------------------------------------------------------------------- snapshots
// A snapshot is the whole window frozen into one JSON file: the graph exactly as
// /api/graph would serve it, a summary, and a recording of real batch frames. Fed to
// index.html with ?snapshot=<file>, the page renders and animates with NO SERVER AT
// ALL, which is what makes it publishable as static hosting.
//
// The recording is driven by ticks, not by wall clock, so it is reproducible: each
// frame is one call to `drive` (default: tick once) with everything the ledger emitted
// during it folded exactly as the live stream folds it.
export function captureSnapshot(brain, { frames = 240, ticks = 1, drive = null, frameMs = 50, layout = {} } = {}) {
  const l = layoutBrain(brain, {
    seed: layout.seed ?? brain.name,
    iterations: layout.iterations ?? (brain.cells.length > 2000 ? 120 : 240),
    scale: layout.scale ?? 100,
  });
  const graph = buildGraph(brain, l, layout);
  let acc = newAcc();
  const unsub = brain.ledger.on((e) => foldEvent(brain, acc, e));
  const out = [];
  try {
    for (let i = 0; i < frames; i++) {
      if (drive) drive(brain, i); else brain.tick(ticks);
      const a = acc; acc = newAcc();
      const f = drainFrame(brain, a, i);
      f.ms = i * frameMs;
      out.push(f);
    }
  } finally { unsub(); }
  const s = brain.summary();
  const span = (frames * frameMs) / 1000;
  const runs = out.reduce((a, f) => a + (f.types['cell.run'] || 0), 0);
  const sigs = out.reduce((a, f) => a + (f.types.signal || 0), 0);
  return {
    kind: 'brain.snapshot', version: 1, name: brain.name,
    capturedAt: new Date().toISOString(),
    frameMs, graph,
    summary: {
      ...s,
      runsPerSec: Math.round(runs / Math.max(0.001, span)),
      signalsPerSec: Math.round(sigs / Math.max(0.001, span)),
      proposalsPending: brain.gate.listPending().length,
      ledgerCounts: brain.ledger.summary(),
      viewers: 0,
    },
    frames: out,
  };
}

// Writes a self contained directory: index.html, client/*.js and snapshot.json, with
// nothing else to install and no server to run. Open index.html and the brain moves.
export function writeStatic(brain, outDir, opts = {}) {
  const src = opts.staticDir || HERE;
  mkdirSync(path.join(outDir, 'client'), { recursive: true });
  writeFileSync(path.join(outDir, 'index.html'), readFileSync(path.join(src, 'index.html')));
  for (const f of readdirSync(path.join(src, 'client'))) {
    if (/\.(js|css)$/.test(f)) writeFileSync(path.join(outDir, 'client', f), readFileSync(path.join(src, 'client', f)));
  }
  const snap = captureSnapshot(brain, opts);
  const json = JSON.stringify(snap);
  writeFileSync(path.join(outDir, 'snapshot.json'), json);
  return { dir: outDir, bytes: Buffer.byteLength(json), frames: snap.frames.length, cells: snap.graph.cells.length, edges: snap.graph.edges.n };
}

// ---------------------------------------------------------------------------- helpers
function intParam(u, name) {
  const v = u.searchParams.get(name);
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? Math.max(0, Math.min(5000, n)) : null;
}
function send(res, code, obj) {
  const b = Buffer.from(JSON.stringify(obj));
  res.writeHead(code, { 'content-type': MIME['.json'], 'content-length': b.length, 'cache-control': 'no-store' });
  res.end(b);
}
function sendFile(res, file) {
  if (!existsSync(file) || !statSync(file).isFile()) return send(res, 404, { error: 'not found' });
  const b = readFileSync(file);
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'content-length': b.length, 'cache-control': 'no-store' });
  res.end(b);
}
function body(req, res, fn) {
  let size = 0; const chunks = [];
  req.on('data', (c) => {
    size += c.length;
    if (size > 1 << 20) { send(res, 413, { error: 'body too large' }); req.destroy(); return; }
    chunks.push(c);
  });
  req.on('end', () => {
    if (res.writableEnded) return;
    let b = {};
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    if (raw) { try { b = JSON.parse(raw); } catch (e) { return send(res, 400, { error: 'bad json: ' + e.message }); } }
    try { fn(b); } catch (e) { send(res, 500, { error: String(e.message || e) }); }
  });
  req.on('error', () => { if (!res.writableEnded) send(res, 400, { error: 'request error' }); });
}

// A one line description of a signal's payload, for the panel. A hypervector is not
// going to be printed, but its density is worth a line, and a number is just a number.
export function summarize(data) {
  if (data === null || data === undefined) return 'null';
  const t = typeof data;
  if (t === 'number') return String(Math.round(data * 1e4) / 1e4);
  if (t === 'bigint') return data.toString();
  if (t === 'string') return data.length > 60 ? JSON.stringify(data.slice(0, 57)) + '...' : JSON.stringify(data);
  if (t === 'boolean') return String(data);
  if (ArrayBuffer.isView(data)) {
    let on = 0;
    const len = data.length;
    const step = Math.max(1, Math.floor(len / 4096));
    let sampled = 0;
    for (let i = 0; i < len; i += step) { sampled++; if (data[i]) on++; }
    const dens = sampled ? on / sampled : 0;
    return data.constructor.name + '[' + len + '], ' + (dens * 100).toFixed(1) + '% nonzero';
  }
  if (Array.isArray(data)) return 'array[' + data.length + ']' + (data.length && typeof data[0] === 'number' ? ' ' + data.slice(0, 4).map(v => Math.round(v * 1e3) / 1e3).join(', ') + (data.length > 4 ? ', ...' : '') : '');
  if (t === 'object') {
    const keys = Object.keys(data);
    const head = keys.slice(0, 4).map(k => k + '=' + summarize(data[k])).join(', ');
    return '{ ' + head + (keys.length > 4 ? ', ... ' + (keys.length - 4) + ' more' : '') + ' }';
  }
  return String(t);
}

// Cell state can hold typed arrays, BigInt rationals and item memories. None of that is
// JSON. Rather than refuse to show it, describe it: the panel shows what a cell IS.
export function jsonSafe(v, depth = 0) {
  if (v === null || v === undefined) return v ?? null;
  const t = typeof v;
  if (t === 'bigint') return v.toString();
  if (t === 'number') return Number.isFinite(v) ? v : String(v);
  if (t === 'string' || t === 'boolean') return v;
  if (t === 'function') return '[function ' + (v.name || 'anonymous') + ']';
  if (depth > 6) return '[deep]';
  if (ArrayBuffer.isView(v)) {
    const arr = Array.from(v.subarray ? v.subarray(0, 8) : [].slice.call(v, 0, 8), x => typeof x === 'bigint' ? x.toString() : x);
    return { $type: v.constructor.name, length: v.length, head: arr };
  }
  if (Array.isArray(v)) return v.length > 256 ? [...v.slice(0, 256).map(x => jsonSafe(x, depth + 1)), '[' + (v.length - 256) + ' more]'] : v.map(x => jsonSafe(x, depth + 1));
  if (v instanceof Map) return { $type: 'Map', size: v.size, entries: [...v].slice(0, 64).map(([k, val]) => [String(k), jsonSafe(val, depth + 1)]) };
  if (v instanceof Set) return { $type: 'Set', size: v.size, values: [...v].slice(0, 64).map(x => jsonSafe(x, depth + 1)) };
  const out = {};
  for (const k of Object.keys(v)) out[k] = jsonSafe(v[k], depth + 1);
  return out;
}
