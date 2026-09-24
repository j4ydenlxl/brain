// web/src/main.js: boot. Build the organism in the tab, lay it out, run it, draw it.
//
// Nothing is downloaded but this one file. The organism is GROWN here, from a seed, in the
// viewer's own machine, which is why the whole site is tens of kilobytes instead of tens
// of megabytes and why the numbers on screen are the viewer's numbers.

import { buildOrganism } from './organism.js';
import { Engine } from './engine.js';
import { brainLayout, pipelineLayout, REGION_SPEC } from './layout.js';
import { Scene } from './scene.js';
import { Hud, readDaemon } from './hud.js';

const DEFAULT_MAJORS = 1200;
const MAX_MAJORS = 5000;

const canvas = document.getElementById('gl');
const hudRoot = document.getElementById('hud');
const boot = document.getElementById('boot');
const slider = document.getElementById('majors');
const sliderOut = document.getElementById('majorsOut');

const hud = new Hud(hudRoot);
let org = null, engine = null, scene = null;
let paused = false, selected = -1;

// Let the browser paint once, then run the work. A frame is the right moment when the tab
// is on screen, but a BACKGROUND TAB NEVER GETS A FRAME, so a build scheduled on
// requestAnimationFrame alone would sit at "growing 1200 majors" forever in a tab the
// viewer opened and has not looked at yet. A timer is the fallback, and whichever fires
// first wins: the organism is grown either way and is ready the moment the tab is looked at.
function afterPaint(fn) {
  let done = false;
  const go = () => { if (done) return; done = true; fn(); };
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(go, 120);
}

function build(majors) {
  boot.style.display = '';
  boot.textContent = 'growing ' + majors + ' majors';
  afterPaint(() => {
    org = buildOrganism({ majors, seed: 'organism' });
    const t0 = performance.now();
    const lay = brainLayout(org.cells, 100);
    const pipe = pipelineLayout(org.cells, 100);
    const layoutMs = performance.now() - t0;
    engine = new Engine(org);
    scene = new Scene(canvas, org, lay, pipe, engine, REGION_SPEC);
    hud.setBuild(org, layoutMs);
    hud.update(engine, scene, true);
    selected = -1;
    hud.select(null);
    boot.style.display = 'none';
  });
}

// One handle on the running organism, so the console and any harness can read the same
// objects the picture is drawn from rather than a copy of them.
window.BRAIN = {
  build,
  state: () => ({ org, engine, scene, hud, selected, ready: !!scene }),
  // The frame loop is the only thing that refreshes the readouts, and a background tab gets
  // no frames, so a harness that ticks the organism by hand needs a way to bring the numbers
  // on screen up to date without waiting for a frame that is never coming.
  refresh: () => { if (!scene) return false; hud.update(engine, scene, true); hud.select(selected >= 0 ? org.cells[selected] : null, engine); return true; },
  daemon: () => hud.daemon || null,
};

// ---------------------------------------------------------------- the daemon
// The served organism's health, from GET health on this page's own origin: web/serve.mjs passes
// it through from daemon/health.mjs. Nothing answers there on dilation.dev, because no daemon is
// deployed, and the state panel says "daemon not running". A running daemon is asked every 5 s,
// an absent one every 30 s, and a hidden tab asks nothing.
const HEALTH = 'health';
function pollDaemon() {
  if (location.protocol === 'file:') { hud.setDaemon(null, 'opened from a file: there is no origin to ask'); return; }
  if (document.hidden) { setTimeout(pollDaemon, 5000); return; }
  readDaemon(HEALTH, 2500).then(function (r) {
    hud.setDaemon(r.health, r.why);
    if (scene) hud.update(engine, scene, true);
    setTimeout(pollDaemon, r.health && r.health.ok ? 5000 : 30000);
  });
}
pollDaemon();

// ---------------------------------------------------------------- the loop
let last = performance.now();
function frame(t) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (t - last) / 1000);
  last = t;
  if (!scene) return;
  if (!paused) {
    // the tick is where all the motion comes from, and it is given a WALL BUDGET rather
    // than a fixed count: up to 5 ms of this frame, at most 4 ticks, so a big organism
    // slows its own clock down instead of dropping the frame rate
    const until = performance.now() + 5;
    for (let i = 0; i < 4; i++) { engine.tick(); if (performance.now() > until) break; }
  }
  scene.draw(t / 1000, dt);
  hud.update(engine, scene, false);
  if (selected >= 0) hud.select(org.cells[selected], engine);
}
requestAnimationFrame(frame);

// ---------------------------------------------------------------- input
let dragging = false, lx = 0, ly = 0, moved = 0;
canvas.addEventListener('pointerdown', (e) => { dragging = true; moved = 0; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', (e) => {
  if (!dragging || !scene) return;
  const dx = e.clientX - lx, dy = e.clientY - ly;
  lx = e.clientX; ly = e.clientY;
  moved += Math.abs(dx) + Math.abs(dy);
  scene.yaw -= dx * 0.006;
  scene.pitch = Math.max(-1.2, Math.min(1.2, scene.pitch + dy * 0.005));
});
canvas.addEventListener('pointerup', (e) => {
  dragging = false;
  if (moved > 6 || !scene) return;
  const r = canvas.getBoundingClientRect();
  const i = scene.pick(e.clientX - r.left, e.clientY - r.top, 14);
  selected = i;
  scene.selected = i;
  hud.select(i >= 0 ? org.cells[i] : null, engine);
});
canvas.addEventListener('wheel', (e) => {
  if (!scene) return;
  e.preventDefault();
  scene.dist = Math.max(90, Math.min(900, scene.dist * (1 + Math.sign(e.deltaY) * 0.10)));
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (!scene) return;
  const k = e.key.toLowerCase();
  if (k === 'v') scene.targetMorph = scene.targetMorph > 0.5 ? 0 : 1;
  else if (k === ' ') { paused = !paused; e.preventDefault(); }
  else if (k === 's') scene.spin = scene.spin === 0 ? 0.035 : 0;
  else if (k === 'escape') { selected = -1; scene.selected = -1; hud.select(null); }
  else if (k === 'g') { slider.value = String(MAX_MAJORS); sliderOut.textContent = MAX_MAJORS; build(MAX_MAJORS); }
});

slider.addEventListener('input', () => { sliderOut.textContent = slider.value; });
slider.addEventListener('change', () => { build(Number(slider.value)); });

slider.value = String(DEFAULT_MAJORS);
sliderOut.textContent = String(DEFAULT_MAJORS);
build(DEFAULT_MAJORS);
