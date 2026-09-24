// client/scene.js - the renderer. One draw call for every edge in the connectome, one
// for every cell, then three small fullscreen passes for the glow.
//
// Per frame uploads are avoided on purpose: the time a cell last ran lives in a vertex
// attribute and the time an edge last carried a signal lives in a float data texture, and
// both are only re-uploaded when an event batch arrives (about 20 times a second). The
// decay itself happens in the shaders from a single uTime uniform, so a still brain
// costs nothing and a screaming brain costs one 200 KB upload per batch.
import { initGL, makeProgram, makeBuffer, updateBuffer, attrib, createTarget, destroyTarget, createDataTexture, uploadDataTexture, mat4, perspective, lookAt, multiply, project } from './gl.js';
import { CELL_VS, CELL_FS, EDGE_VS, EDGE_FS, QUAD_VS, BRIGHT_FS, BLUR_FS, COMPOSITE_FS } from './shaders.js';

const ACTIVE = 1; // connectome flag

export class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = this.gl = initGL(canvas);
    this.progCell = makeProgram(gl, CELL_VS, CELL_FS);
    this.progEdge = makeProgram(gl, EDGE_VS, EDGE_FS);
    this.progBright = makeProgram(gl, QUAD_VS, BRIGHT_FS);
    this.progBlur = makeProgram(gl, QUAD_VS, BLUR_FS);
    this.progComposite = makeProgram(gl, QUAD_VS, COMPOSITE_FS);
    this.vaoCell = gl.createVertexArray();
    this.vaoEdge = gl.createVertexArray();
    this.vaoQuad = gl.createVertexArray();
    this.scene = null; this.bloomA = null; this.bloomB = null;
    this.w = 0; this.h = 0; this.dpr = 1;
    this.graph = null;
    this.selected = -1;
    this.opts = { decay: 0.30, tickSec: 0.18, bloom: 1.25, exposure: 1.15, threshold: 0.42, pointScale: 0.55, edgeGain: 1.0, cellGain: 1.0, halo: 0.5, flare: 2.4 };
    this.vp = mat4(); this.proj = mat4(); this.view = mat4();
    this.pulsesDirty = false; this.cellsDirty = false;
    this.drawn = { cells: 0, edges: 0 };
  }

  setGraph(g) {
    const gl = this.gl;
    this.dispose(false);
    const n = g.n, m = g.edges.n;
    this.graph = g;
    this.lastRun = new Float32Array(n);      // seconds, 0 = never
    this.idxAttr = new Float32Array(n);
    for (let i = 0; i < n; i++) this.idxAttr[i] = i;
    this.bufPos = makeBuffer(gl, g.pos, gl.DYNAMIC_DRAW);
    this.bufColor = makeBuffer(gl, g.color);
    this.bufSize = makeBuffer(gl, g.size);
    this.bufIdx = makeBuffer(gl, this.idxAttr);
    this.bufRun = makeBuffer(gl, this.lastRun, gl.DYNAMIC_DRAW);
    gl.bindVertexArray(this.vaoCell);
    attrib(gl, this.progCell, 'aPos', this.bufPos, 3);
    attrib(gl, this.progCell, 'aColor', this.bufColor, 3);
    attrib(gl, this.progCell, 'aSize', this.bufSize, 1);
    attrib(gl, this.progCell, 'aIdx', this.bufIdx, 1);
    attrib(gl, this.progCell, 'aLastRun', this.bufRun, 1);
    gl.bindVertexArray(null);

    // two vertices per edge
    this.edgePos = new Float32Array(m * 6);
    const ecol = new Float32Array(m * 6), eend = new Float32Array(m * 2), ew = new Float32Array(m * 2), eid = new Float32Array(m * 2);
    const edl = new Float32Array(m * 2);
    const { src, dst, w } = g.edges;
    const delay = g.edges.delay || null;
    for (let e = 0; e < m; e++) {
      const a = src[e], b = dst[e];
      for (let k = 0; k < 3; k++) {
        this.edgePos[e * 6 + k] = g.pos[a * 3 + k];
        this.edgePos[e * 6 + 3 + k] = g.pos[b * 3 + k];
        ecol[e * 6 + k] = g.color[a * 3 + k] * 0.85;
        ecol[e * 6 + 3 + k] = g.color[b * 3 + k] * 0.85;
      }
      eend[e * 2] = 0; eend[e * 2 + 1] = 1;
      ew[e * 2] = ew[e * 2 + 1] = w ? w[e] : 1;
      eid[e * 2] = eid[e * 2 + 1] = e;
      edl[e * 2] = edl[e * 2 + 1] = delay ? delay[e] : 0;
    }
    this.bufEdgePos = makeBuffer(gl, this.edgePos, gl.DYNAMIC_DRAW);
    this.bufEdgeCol = makeBuffer(gl, ecol);
    this.bufEdgeEnd = makeBuffer(gl, eend);
    this.bufEdgeW = makeBuffer(gl, ew);
    this.bufEdgeId = makeBuffer(gl, eid);
    this.bufEdgeDelay = makeBuffer(gl, edl);
    gl.bindVertexArray(this.vaoEdge);
    attrib(gl, this.progEdge, 'aPos', this.bufEdgePos, 3);
    attrib(gl, this.progEdge, 'aColor', this.bufEdgeCol, 3);
    attrib(gl, this.progEdge, 'aEnd', this.bufEdgeEnd, 1);
    attrib(gl, this.progEdge, 'aW', this.bufEdgeW, 1);
    attrib(gl, this.progEdge, 'aEdge', this.bufEdgeId, 1);
    attrib(gl, this.progEdge, 'aDelay', this.bufEdgeDelay, 1);
    gl.bindVertexArray(null);

    this.pulse = createDataTexture(gl, Math.max(1, m));
    // adjacency by source cell, counting sort, so a signal event can find its edges
    const ptr = new Uint32Array(n + 1), list = new Uint32Array(m);
    for (let e = 0; e < m; e++) ptr[src[e] + 1]++;
    for (let i = 0; i < n; i++) ptr[i + 1] += ptr[i];
    const fill = ptr.slice();
    for (let e = 0; e < m; e++) list[fill[src[e]]++] = e;
    this.outPtr = ptr; this.outList = list;
    this.edgeSrcPort = g.edges.srcPort || null;
    this.edgeFlags = g.edges.flags || null;
    this.drawn = { cells: n, edges: m };
    this.cellsDirty = true; this.pulsesDirty = true;
    this.radius = extent(g.pos);
    this.autoTune(n, m);
  }

  // Additive blending is unforgiving: a seventeen cell seed brain and a five thousand
  // cell organism cannot share one exposure, or the big one is a white blob and the small
  // one is invisible. Gains fall with density so both read as a point cloud of neurons.
  autoTune(n, m) {
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    // Measured against a 5,000 cell, 42,800 edge organism in the pane: the cells have to
    // win over the edges or fifty thousand faint lines fill the volume with haze and the
    // anatomy disappears inside its own wiring. The edge gain falls off much faster than
    // the cell gain for exactly that reason.
    this.opts.cellGain = clamp(2.0 * Math.pow(20 / Math.max(1, n), 0.22), 0.12, 1.0);
    this.opts.edgeGain = clamp(1.4 * Math.pow(40 / Math.max(1, m), 0.62), 0.012, 1.0);
    this.opts.pointScale = clamp(0.55 * Math.pow(400 / Math.max(40, n), 0.20), 0.18, 0.55);
    this.opts.bloom = clamp(1.35 * Math.pow(300 / Math.max(60, n), 0.12), 0.45, 1.35);
    this.opts.threshold = n > 1500 ? 0.55 : 0.42;
    this.opts.exposure = n > 1500 ? 1.5 : 1.15;
    this.opts.halo = clamp(0.5 * Math.pow(300 / Math.max(60, n), 0.20), 0.14, 0.5);
    this.opts.flare = clamp(2.4 * Math.pow(300 / Math.max(60, n), 0.22), 1.0, 2.4);
  }

  // Move every cell to a new layout (r re-layouts). Positions are lerped by the caller.
  setPositions(pos) {
    const gl = this.gl, g = this.graph;
    if (!g) return;
    g.pos.set(pos);
    updateBuffer(gl, this.bufPos, g.pos);
    const { src, dst } = g.edges, m = g.edges.n;
    for (let e = 0; e < m; e++) {
      const a = src[e], b = dst[e];
      for (let k = 0; k < 3; k++) {
        this.edgePos[e * 6 + k] = g.pos[a * 3 + k];
        this.edgePos[e * 6 + 3 + k] = g.pos[b * 3 + k];
      }
    }
    updateBuffer(gl, this.bufEdgePos, this.edgePos);
    // The pipeline layout is several times wider than the anatomical one, so a fog range
    // taken from the nominal scale would swallow the far stages whole. Measure it.
    this.radius = extent(g.pos);
  }

  noteRun(idx, time) {
    if (idx < 0 || idx >= this.lastRun.length) return;
    this.lastRun[idx] = time;
    this.cellsDirty = true;
  }
  // A signal left cell `idx` on port `port`: every live outgoing edge on that port lights.
  noteSignal(idx, port, time, budget) {
    if (!this.graph || idx < 0 || idx >= this.outPtr.length - 1) return 0;
    let lit = 0;
    for (let p = this.outPtr[idx]; p < this.outPtr[idx + 1]; p++) {
      if (budget !== undefined && lit >= budget) break;
      const e = this.outList[p];
      if (this.edgeSrcPort && port >= 0 && this.edgeSrcPort[e] !== port) continue;
      if (this.edgeFlags && !(this.edgeFlags[e] & ACTIVE)) continue;
      this.pulse.data[e] = time;
      lit++;
    }
    if (lit) this.pulsesDirty = true;
    return lit;
  }
  setSelected(idx) { this.selected = idx == null ? -1 : idx; }

  resize() {
    const gl = this.gl, c = this.canvas;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.floor(c.clientWidth * dpr)), h = Math.max(1, Math.floor(c.clientHeight * dpr));
    if (w === this.w && h === this.h && this.scene) return;
    this.w = w; this.h = h; this.dpr = dpr;
    c.width = w; c.height = h;
    destroyTarget(gl, this.scene); destroyTarget(gl, this.bloomA); destroyTarget(gl, this.bloomB);
    this.scene = createTarget(gl, w, h, true);
    const bw = Math.max(1, w >> 2), bh = Math.max(1, h >> 2);
    this.bloomA = createTarget(gl, bw, bh, true);
    this.bloomB = createTarget(gl, bw, bh, true);
  }

  // camera = { az, el, dist, target:[x,y,z], fov }
  viewProjection(camera) {
    const aspect = this.w / Math.max(1, this.h);
    const ce = Math.cos(camera.el), se = Math.sin(camera.el);
    const eye = [
      camera.target[0] + camera.dist * ce * Math.sin(camera.az),
      camera.target[1] + camera.dist * se,
      camera.target[2] + camera.dist * ce * Math.cos(camera.az),
    ];
    perspective(this.proj, camera.fov || 0.9, aspect, 1, 20000);
    lookAt(this.view, eye, camera.target, [0, 1, 0]);
    multiply(this.vp, this.proj, this.view);
    this.eye = eye;
    return this.vp;
  }

  render(camera, time) {
    const gl = this.gl;
    this.resize();
    const vp = this.viewProjection(camera);
    if (this.cellsDirty) { updateBuffer(gl, this.bufRun, this.lastRun); this.cellsDirty = false; }
    if (this.pulsesDirty) { uploadDataTexture(gl, this.pulse); this.pulsesDirty = false; }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.scene.fbo);
    gl.viewport(0, 0, this.w, this.h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    // fog range: the near face of the cloud is full brightness, the far face fades out
    const R = Math.max(40, (this.radius || (this.graph ? this.graph.scale || 100 : 100)) * 1.30);
    const fogNear = Math.max(1, camera.dist - R), fogFar = camera.dist + R;

    if (this.graph && this.graph.edges.n) {
      const p = this.progEdge;
      gl.useProgram(p);
      gl.uniformMatrix4fv(p.u.uVP, false, vp);
      gl.uniform2f(p.u.uFog, fogNear, fogFar);
      gl.uniform1f(p.u.uTime, time);
      gl.uniform1f(p.u.uGain, this.opts.edgeGain);
      gl.uniform1f(p.u.uTickSec, this.opts.tickSec);
      gl.uniform1i(p.u.uPulseW, this.pulse.w);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pulse.tex);
      gl.uniform1i(p.u.uPulse, 0);
      gl.bindVertexArray(this.vaoEdge);
      gl.drawArrays(gl.LINES, 0, this.graph.edges.n * 2);
    }
    if (this.graph && this.graph.n) {
      const p = this.progCell;
      gl.useProgram(p);
      gl.uniformMatrix4fv(p.u.uVP, false, vp);
      gl.uniform2f(p.u.uFog, fogNear, fogFar);
      gl.uniform1f(p.u.uTime, time);
      gl.uniform1f(p.u.uDecay, this.opts.decay);
      gl.uniform1f(p.u.uGain, this.opts.cellGain);
      gl.uniform1f(p.u.uHalo, this.opts.halo ?? 0.5);
      gl.uniform1f(p.u.uFlare, this.opts.flare ?? 2.4);
      gl.uniform1f(p.u.uSelected, this.selected);
      const fov = camera.fov || 0.9;
      gl.uniform1f(p.u.uPointScale, this.opts.pointScale * (this.h * 0.5) / Math.tan(fov / 2));
      gl.bindVertexArray(this.vaoCell);
      gl.drawArrays(gl.POINTS, 0, this.graph.n);
    }
    gl.bindVertexArray(this.vaoQuad);

    // bright pass into the quarter resolution target
    gl.blendFunc(gl.ONE, gl.ZERO);
    gl.disable(gl.BLEND);
    this._pass(this.progBright, this.bloomA, (p) => {
      gl.uniform1f(p.u.uThreshold, this.opts.threshold);
      this._tex(p.u.uTex, this.scene.tex, 0);
    });
    this._pass(this.progBlur, this.bloomB, (p) => {
      gl.uniform2f(p.u.uDir, 1 / this.bloomA.w, 0);
      this._tex(p.u.uTex, this.bloomA.tex, 0);
    });
    this._pass(this.progBlur, this.bloomA, (p) => {
      gl.uniform2f(p.u.uDir, 0, 1 / this.bloomB.h);
      this._tex(p.u.uTex, this.bloomB.tex, 0);
    });
    // composite to the screen
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.w, this.h);
    const p = this.progComposite;
    gl.useProgram(p);
    this._tex(p.u.uScene, this.scene.tex, 0);
    this._tex(p.u.uBloom, this.bloomA.tex, 1);
    gl.uniform1f(p.u.uBloomAmount, this.opts.bloom);
    gl.uniform1f(p.u.uExposure, this.opts.exposure);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }
  _pass(prog, target, setup) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.w, target.h);
    gl.useProgram(prog);
    setup(prog);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  _tex(loc, tex, unit) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, unit);
  }

  // CPU picking: project every cell once on click. 5,000 projections is microseconds and
  // it costs nothing while the mouse is not clicking.
  pick(camera, px, py, radiusPx = 16) {
    if (!this.graph) return -1;
    const vp = this.viewProjection(camera);
    const g = this.graph, n = g.n;
    const hw = this.canvas.clientWidth / 2, hh = this.canvas.clientHeight / 2;
    let best = -1, bestD = radiusPx * radiusPx, bestW = Infinity;
    for (let i = 0; i < n; i++) {
      const [cx, cy, cw] = project(vp, g.pos[i * 3], g.pos[i * 3 + 1], g.pos[i * 3 + 2]);
      if (cw <= 0.001) continue;
      const sx = (cx / cw) * hw + hw, sy = -(cy / cw) * hh + hh;
      const dx = sx - px, dy = sy - py, d2 = dx * dx + dy * dy;
      if (d2 <= bestD && (d2 < bestD * 0.5 || cw < bestW)) { best = i; bestD = d2; bestW = cw; }
    }
    return best;
  }

  dispose(full = true) {
    const gl = this.gl;
    for (const b of ['bufPos', 'bufColor', 'bufSize', 'bufIdx', 'bufRun', 'bufEdgePos', 'bufEdgeCol', 'bufEdgeEnd', 'bufEdgeW', 'bufEdgeId', 'bufEdgeDelay']) {
      if (this[b]) { gl.deleteBuffer(this[b]); this[b] = null; }
    }
    if (this.pulse) { gl.deleteTexture(this.pulse.tex); this.pulse = null; }
    if (full) { destroyTarget(gl, this.scene); destroyTarget(gl, this.bloomA); destroyTarget(gl, this.bloomB); this.scene = this.bloomA = this.bloomB = null; }
  }
}

// The radius of the point cloud actually on screen, in world units. The fog needs the
// real extent, not the nominal scale: the pipeline layout is several times wider than
// the brain, and fogging it by the brain's radius would erase the outer stages.
function extent(pos) {
  let r2 = 0;
  for (let i = 0; i < pos.length; i += 3) {
    const d = pos[i] * pos[i] + pos[i + 1] * pos[i + 1] + pos[i + 2] * pos[i + 2];
    if (d > r2) r2 = d;
  }
  return Math.sqrt(r2);
}
