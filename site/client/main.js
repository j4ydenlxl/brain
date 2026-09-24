// client/main.js - wiring. Loads the graph, opens the event stream, drives the camera,
// routes the keyboard, and runs the frame loop.
//
//   drag        rotate            wheel   zoom
//   click cell  inspect panel     space   pause the render
//   r           re-layout         a       auto drive the brain (tick + inject)
//   i           inject one event  t       tick 100     h  hide the instruments
//   v           switch between the brain anatomy and the pipeline stages
//
//   ?synthetic=5000   build a synthetic graph of 5,000 cells and 50,000 edges in the
//                     browser and run the identical render path against it, to measure
//                     frames per second at a size the seed brain has not reached yet.
//   ?drive=1          start the auto driver immediately.
//   ?snapshot=x.json  play a recorded snapshot instead of talking to a server. This is
//                     the static mode: index.html, client/*.js and one JSON file are a
//                     complete, publishable page, with no node process anywhere. Opened
//                     from a file:// URL or from a plain static host with no /api behind
//                     it, the page falls back to ./snapshot.json on its own.
import { Scene } from './scene.js';
import { HUD } from './hud.js';
import { getJSON, postJSON, buildRenderGraph, connectEvents, syntheticGraph, SyntheticDriver, loadSnapshot, SnapshotPlayer } from './data.js';

const params = new URLSearchParams(location.search);
const SYNTHETIC = parseInt(params.get('synthetic') || '0', 10) || 0;
const EDGES_PER = parseInt(params.get('edges') || '10', 10) || 10;
const SNAPSHOT = params.get('snapshot');
const canvas = document.getElementById('gl');
const hud = new HUD(document.body);

// 'live' talks to the server, 'synthetic' and 'snapshot' never touch the network again
// once loaded. Everything that would POST or fetch is gated on isLive().
let mode = SYNTHETIC ? 'synthetic' : 'live';
const isLive = () => mode === 'live';
let player = null;
let scene, graph, es = null, driver = null, synthSeed = 0x5eed;
let paused = false, autoDrive = params.get('drive') === '1';
const t0 = performance.now();
const now = () => (performance.now() - t0) / 1000 + 1; // +1 so "never ran" stays at 0

// The default is a three quarter lateral view, which is the angle a brain is drawn from:
// the frontal lobe to the right, the occipital pole to the left, the cerebellum low and
// back. From here the cloud reads as a brain silhouette before anything moves.
const camera = { az: 1.28, el: 0.12, dist: 310, target: [0, 0, 0], fov: 0.9 };
let auto = true, lastInput = 0, dragging = false, dragged = 0, lastXY = [0, 0];
const local = { runs: 0, signals: 0, runsPerSec: 0, signalsPerSec: 0, lastRate: performance.now(), t: 0 };
let anim = null; // { from, to, start, dur }

// THE TWO VIEWS. Both are the same cells, the same edges and the same frames: only the
// positions differ. 'brain' is the anatomical layout, 'pipeline' lays the same cells out
// as stages left to right in the order signals move through them. basePos keeps the
// anatomical positions because scene.setPositions writes through graph.pos.
let view = params.get('view') === 'pipeline' ? 'pipeline' : 'brain';
let basePos = null;
// The brain's own clock, measured from the tick stamp on the frames that arrive. It sets
// how long a quantum takes to cross an edge on screen: core delivers at t + 1 + delay, so
// one tick of screen time per tick of brain time makes the flight honest.
const tickClock = { t: -1, at: 0, perSec: 0 };

boot().catch((e) => {
  hud.setStatus(String(e && e.message || e), 'bad');
  const pre = document.createElement('pre');
  pre.className = 'fatal';
  pre.textContent = String(e && e.stack || e);
  document.body.appendChild(pre);
});

async function boot() {
  scene = new Scene(canvas);
  if (SYNTHETIC) {
    hud.setMode('synthetic ' + SYNTHETIC + ' cells');
    graph = syntheticGraph(SYNTHETIC, EDGES_PER, 100, synthSeed);
    scene.setGraph(graph);
    hud.setGraph(graph);
    driver = new SyntheticDriver(SYNTHETIC, { runsPerSec: parseInt(params.get('rate') || '20000', 10) });
    afterGraph();
    hud.setStatus('synthetic graph: ' + graph.n + ' cells, ' + graph.edges.n + ' edges', 'good');
  } else if (SNAPSHOT) {
    await bootSnapshot(SNAPSHOT);
  } else {
    hud.setMode('live');
    hud.setStatus('loading the connectome', '');
    let raw = null;
    try { raw = await getJSON('/api/graph'); }
    catch (e) {
      // No server behind this page. That is a legitimate way to open it (a file:// URL,
      // or a static host), so look for the snapshot a static build ships with before
      // giving up. Only if that is missing too is this actually an error.
      await bootSnapshot('snapshot.json', 'no /api here, playing the snapshot');
    }
    if (raw) {
      graph = buildRenderGraph(raw);
      scene.setGraph(graph);
      hud.setGraph(graph);
      afterGraph();
      hud.setStatus(graph.n + ' cells, ' + graph.edges.n + ' edges, layout ' + raw.layout.iterations + ' iterations', 'good');
      es = connectEvents({
        onBatch: onBatch,
        onSummary: (s) => hud.onSummary(s),
        onOpen: () => hud.setStatus('stream open', 'good'),
        onError: () => hud.setStatus('stream lost, retrying', 'warn'),
      });
    }
  }
  applyCamera();
  installInput();
  // A debug handle, and with it the render bench. requestAnimationFrame is capped by the
  // display and can be throttled by the host window, so the honest way to ask "does this
  // hold 60 fps at 5,000 cells and 50,000 edges" is to render N frames back to back and
  // make the GPU finish before stopping the clock.
  window.__brain = {
    scene, camera, hud, get graph() { return graph; },
    bench(n = 120) {
      const gl = scene.gl;
      // gl.finish() does not reliably stall through ANGLE, so the pipeline is drained by
      // reading one pixel back, which cannot return until the frame is actually drawn.
      const px = new Uint8Array(4);
      const drain = () => { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
      scene.render(camera, now()); drain();
      const t0 = performance.now();
      for (let i = 0; i < n; i++) { camera.az += 0.002; scene.render(camera, now()); drain(); }
      const ms = (performance.now() - t0) / n;
      return { frames: n, msPerFrame: +ms.toFixed(3), fps: +(1000 / ms).toFixed(1), cells: graph.n, edges: graph.edges.n, w: scene.w, h: scene.h };
    },
  };
  requestAnimationFrame(frame);
  setInterval(drive, 200);
  if (SYNTHETIC || params.get('bench') === '1') {
    setTimeout(() => {
      const b = window.__brain.bench(120);
      benchLine = 'bench ' + b.msPerFrame.toFixed(2) + ' ms/frame = ' + b.fps.toFixed(0) + ' fps at ' + b.cells + ' cells, ' + b.edges + ' edges, ' + b.w + 'x' + b.h;
      hud.setStatus(benchLine, b.fps >= 60 ? 'good' : b.fps >= 30 ? 'warn' : 'bad');
    }, 1200);
  }
}
let benchLine = '';
let lastSnapSummary = 0;

// Static mode. The graph and the frames both come out of one JSON file that a real
// brain recorded, so nothing here talks to a server: this is the path that survives
// being copied onto plain static hosting.
async function bootSnapshot(url, note) {
  const snap = await loadSnapshot(url);
  mode = 'snapshot';
  graph = buildRenderGraph(snap.graph);
  scene.setGraph(graph);
  hud.setGraph(graph);
  hud.setMode('snapshot');
  afterGraph();
  player = new SnapshotPlayer(snap, { loop: true, speed: 1 });
  hud.onSummary(player.summary());
  const secs = Math.round((player.length * player.frameMs) / 100) / 10;
  hud.setStatus((note ? note + ': ' : '') + graph.n + ' cells, ' + graph.edges.n + ' edges, ' +
    player.length + ' recorded frames, ' + secs + ' s, looping', 'good');
}

// Called after every scene.setGraph. The graph object is rebuilt whenever the connectome
// grows, so the anatomical positions and the current view have to be re-established.
// One preset per view. The anatomy is seen from a three quarter lateral angle; the
// pipeline is seen from the side, far enough back to hold every stage at once.
function applyCamera() {
  const sc = (graph && graph.scale) || 100;
  if (view === 'pipeline') { camera.az = 0.20; camera.el = 0.22; camera.dist = sc * 7.0; }
  else { camera.az = 1.28; camera.el = 0.12; camera.dist = sc * 3.1; }
  camera.target = [0, 0, 0];
}

function afterGraph() {
  basePos = graph.pos.slice();
  anim = null;
  if (view === 'pipeline') {
    if (graph.pipeline) {
      scene.setPositions(graph.pipeline.pos);
      hud.setStages(hud.stageRates(graph.pipeline.order));
      hud.setMode(mode + ' / pipeline');
    }
    else view = 'brain';
  }
}

// v. The same cells, re-read as a production line, with the same pulses flowing through
// the same edges: perception on the left, motor on the right, every edge that crosses a
// stage gap is a signal leaving one stage of the brain for the next.
function setView(next) {
  if (next === view) return;
  if (next === 'pipeline' && !graph.pipeline) {
    hud.setStatus('this graph carries no pipeline layout', 'warn');
    return;
  }
  view = next;
  const to = view === 'pipeline' ? graph.pipeline.pos : basePos;
  anim = { from: graph.pos.slice(), to: Float32Array.from(to), start: performance.now(), dur: 900 };
  applyCamera();
  if (view === 'pipeline') {
    hud.setStages(hud.stageRates(graph.pipeline.order));
    hud.setStatus('pipeline view: ' + graph.pipeline.stages.map(st => st.name).join(' to '), 'good');
  } else {
    hud.setLegend();
    hud.setStatus('brain view: ' + graph.n + ' cells on the anatomy', 'good');
  }
  hud.setMode(mode + ' / ' + (view === 'pipeline' ? 'pipeline' : 'anatomy'));
  auto = false; lastInput = performance.now();
}

function onBatch(frame) {
  const time = now();
  for (let i = 0; i < frame.runs.length; i += 2) scene.noteRun(frame.runs[i], time);
  let budget = 6000;
  for (let i = 0; i < frame.sigs.length; i += 3) {
    if (budget <= 0) break;
    budget -= scene.noteSignal(frame.sigs[i], frame.sigs[i + 1], time, 64);
  }
  // new edges arrive live: rebuild rather than pretend they are not there
  if (frame.edges.length && isLive()) scheduleRefresh();
  if (frame.proposals.length) hud.setStatus('proposal ' + frame.proposals[frame.proposals.length - 1].kind, 'warn');
  hud.onBatch(frame);
  local.runs += frame.types['cell.run'] || 0;
  local.signals += frame.types.signal || 0;
  local.t = frame.t;
  noteTick(frame.t);
}

// Ticks per second, from the tick stamp the server puts on every frame. A quantum then
// takes (1 + delay) tick lengths of screen time to cross an edge, which is exactly the
// schedule core uses, and the readout says how far the viewer's clock is from the brain's.
function noteTick(t) {
  if (!Number.isFinite(t) || t === tickClock.t) return;
  const n = performance.now();
  if (tickClock.t >= 0 && n > tickClock.at) {
    const per = ((t - tickClock.t) * 1000) / (n - tickClock.at);
    if (per > 0) tickClock.perSec = tickClock.perSec ? tickClock.perSec * 0.8 + per * 0.2 : per;
  }
  tickClock.t = t; tickClock.at = n;
  if (tickClock.perSec > 0) {
    const sec = Math.max(0.08, Math.min(0.60, 1 / tickClock.perSec));
    scene.opts.tickSec = sec;
    hud.setFlight(sec * 1000, sec * tickClock.perSec);
  }
}

let refreshTimer = null;
function scheduleRefresh() {
  if (refreshTimer) return;
  refreshTimer = setTimeout(async () => {
    refreshTimer = null;
    try {
      const raw = await getJSON('/api/graph');
      graph = buildRenderGraph(raw);
      scene.setGraph(graph);
      hud.setGraph(graph);
      afterGraph();
    } catch {}
  }, 1500);
}

function frame() {
  requestAnimationFrame(frame);
  const time = now();
  measure();
  if (driver && !paused) onBatch(driver.frame(performance.now()));
  if (player && !paused) {
    for (const f of player.due(performance.now())) onBatch(f);
    if (performance.now() - lastSnapSummary > 250) { lastSnapSummary = performance.now(); hud.onSummary(player.summary()); }
  }
  if (anim) {
    const k = Math.min(1, (performance.now() - anim.start) / anim.dur);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const p = new Float32Array(anim.to.length);
    for (let i = 0; i < p.length; i++) p[i] = anim.from[i] + (anim.to[i] - anim.from[i]) * e;
    scene.setPositions(p);
    if (k >= 1) anim = null;
  }
  if (auto && performance.now() - lastInput > 2500) camera.az += 0.055 * (1 / 60);
  if (!paused) scene.render(camera, time);
  hud.drawStrip();
  rates();
}

let frames = 0, fpsT = performance.now(), fpsEma = 60, frameMs = 16;
function measure() {
  frames++;
  const n = performance.now(), dt = n - fpsT;
  if (dt >= 500) {
    // A hidden page gets a handful of animation frames a second no matter how fast it
    // draws, so the rate measured there is the browser's, not the renderer's. Report it
    // as idle instead of publishing a number that means nothing. Press the bench
    // (?bench=1) for the real one: that renders back to back and waits for the GPU.
    if (document.hidden) hud.setFps(null);
    else {
      const fps = (frames * 1000) / dt;
      fpsEma = fpsEma * 0.4 + fps * 0.6;
      frameMs = dt / frames;
      hud.setFps(fpsEma, frameMs);
    }
    frames = 0; fpsT = n;
  }
}
function rates() {
  const n = performance.now();
  if (n - local.lastRate < 500) return;
  const dt = (n - local.lastRate) / 1000;
  local.runsPerSec = Math.round(local.runs / dt);
  local.signalsPerSec = Math.round(local.signals / dt);
  local.runs = 0; local.signals = 0; local.lastRate = n;
  if (view === 'pipeline' && graph && graph.pipeline) hud.setStages(hud.stageRates(graph.pipeline.order));
  if (!isLive()) hud.onLocal({ t: local.t, cells: graph.n, edges: graph.edges.n, runsPerSec: local.runsPerSec, signalsPerSec: local.signalsPerSec });
}

// The auto driver: keep the organism moving so the page is alive without a terminal.
let driveN = 0;
async function drive() {
  if (!autoDrive || !isLive() || paused) return;
  try {
    if (driveN % 5 === 0 && graph.meta.length) {
      const target = graph.meta.find(c => c.region === 'perception') || graph.meta[0];
      const words = ['hello brain', 'the fly connectome', 'nine point one one', 'ask the cognitive region', 'stop', 'greet the operator'];
      await postJSON('/api/inject', { cell: target.id, port: 0, kind: 'event', data: { text: words[driveN % words.length] } });
    }
    driveN++;
    await postJSON('/api/tick', { n: 40 });
  } catch (e) { hud.setStatus('drive failed: ' + (e.message || e), 'bad'); }
}

async function relayout() {
  hud.setStatus('re-layout', 'warn');
  try {
    if (mode === 'snapshot') {
      hud.setStatus('re-layout needs the server: a snapshot ships one fixed layout', 'warn');
      return;
    }
    if (SYNTHETIC) {
      synthSeed = (synthSeed + 0x9e37) >>> 0;
      graph = syntheticGraph(SYNTHETIC, EDGES_PER, 100, synthSeed);
      anim = null;
      scene.setGraph(graph);
      hud.setGraph(graph);
      afterGraph();
      hud.setStatus('re-layout: new synthetic graph, ' + graph.n + ' cells, ' + graph.edges.n + ' edges', 'good');
    } else {
      const l = await getJSON('/api/layout?refine=260');
      basePos = Float32Array.from(l.pos);
      if (view === 'brain') anim = { from: graph.pos.slice(), to: basePos.slice(), start: performance.now(), dur: 700 };
      hud.setStatus('re-layout: ' + l.iterations + ' iterations, mean edge ' + l.stats.meanEdgeBefore.toFixed(3) + ' to ' + l.stats.meanEdgeAfter.toFixed(3), 'good');
    }
  } catch (e) { hud.setStatus('re-layout failed: ' + (e.message || e), 'bad'); }
}

async function openCell(idx) {
  scene.setSelected(idx);
  if (idx < 0) { hud.hideCell(); return; }
  const meta = graph.meta[idx];
  if (!isLive()) { hud.showCell({ ...meta, edgesIn: [], edgesOut: [], periodLabel: meta.period }); return; }
  try { hud.showCell(await getJSON('/api/cell/' + encodeURIComponent(meta.id))); }
  catch (e) { hud.showCell({ id: meta.id, error: String(e.message || e) }); }
}

function installInput() {
  const mark = () => { lastInput = performance.now(); };
  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; dragged = 0; lastXY = [e.clientX, e.clientY]; mark();
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastXY[0], dy = e.clientY - lastXY[1];
    lastXY = [e.clientX, e.clientY];
    dragged += Math.abs(dx) + Math.abs(dy);
    camera.az -= dx * 0.005;
    camera.el = Math.max(-1.45, Math.min(1.45, camera.el + dy * 0.005));
    mark();
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false; mark();
    if (dragged < 5) {
      const r = canvas.getBoundingClientRect();
      openCell(scene.pick(camera, e.clientX - r.left, e.clientY - r.top, 18));
    }
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.dist = Math.max(40, Math.min(2400, camera.dist * Math.exp(e.deltaY * 0.0012)));
    mark();
  }, { passive: false });
  window.addEventListener('keydown', (e) => {
    if (e.target && /input|textarea/i.test(e.target.tagName)) return;
    switch (e.key) {
      case ' ':
        e.preventDefault(); paused = !paused;
        hud.setStatus(paused ? 'render paused (space)' : 'running', paused ? 'warn' : 'good');
        break;
      case 'r': case 'R': relayout(); break;
      case 'a': case 'A':
        autoDrive = !autoDrive;
        hud.setStatus(autoDrive ? 'auto drive on' : 'auto drive off', autoDrive ? 'good' : '');
        break;
      case 'i': case 'I':
        if (isLive()) postJSON('/api/inject', { cell: (graph.meta.find(c => c.region === 'perception') || graph.meta[0]).id, port: 0, kind: 'event', data: { text: 'hello brain' } })
          .then(() => postJSON('/api/tick', { n: 8 }))
          .then(() => hud.setStatus('injected one event', 'good'))
          .catch((err) => hud.setStatus('inject failed: ' + err.message, 'bad'));
        break;
      case 't': case 'T':
        if (isLive()) postJSON('/api/tick', { n: 100 }).then(() => hud.setStatus('ticked 100', 'good')).catch(() => {});
        break;
      case 'v': case 'V': setView(view === 'pipeline' ? 'brain' : 'pipeline'); break;
      case 'h': case 'H': document.body.classList.toggle('bare'); break;
      case 'Escape': openCell(-1); break;
      default: break;
    }
  });
  window.addEventListener('beforeunload', () => { if (es) es.close(); });
}
