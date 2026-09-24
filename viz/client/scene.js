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
import { Activation } from './activation.js';

// A conduit is drawn as a bundle: a few lanes, each a bowed curve, each subdivided
// enough to look like a tube rather than a wire.
const LANES = 5, LANE_SEGS = 18;

// How many intra-region lines may be drawn at once. A hundred thousand faint lines is
// not a connectome on screen, it is a grey wash with the anatomy lost inside it, so the
// local wiring is drawn as the strongest LOCAL_BUDGET edges and the rest is carried by
// the conduits and by the counters in the HUD, which always report the true totals.
const LOCAL_BUDGET = 6000;

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
    this.vaoConduit = gl.createVertexArray();
    this.vaoQuad = gl.createVertexArray();
    this.scene = null; this.bloomA = null; this.bloomB = null;
    this.w = 0; this.h = 0; this.dpr = 1;
    this.graph = null;
    this.selected = -1;
    this.opts = { decay: 0.25, tickSec: 0.18, bloom: 0.28, exposure: 1.10, threshold: 0.80, pointScale: 3.2, edgeGain: 1.0, cellGain: 1.0, rim: 0.16, flare: 1.6, conduitGain: 1.0, conduitBase: 0.22 };
    this.vp = mat4(); this.proj = mat4(); this.view = mat4();
    this.pulsesDirty = false; this.cellsDirty = false;
    this.drawn = { cells: 0, edges: 0 };
  }

  setGraph(g) {
    const gl = this.gl;
    this.dispose(false);
    const n = g.n, m = g.edges.n;
    this.graph = g;
    // one activation per cell, and it only ever moves when a cell.run arrives
    this.activation = new Activation(n);
    this.lastRun = this.activation.lastRun;
    this.idxAttr = new Float32Array(n);
    for (let i = 0; i < n; i++) this.idxAttr[i] = i;
    this.bufPos = makeBuffer(gl, g.pos, gl.DYNAMIC_DRAW);
    this.bufColor = makeBuffer(gl, g.color);
    this.bufCap = makeBuffer(gl, g.capability || new Float32Array(n).fill(0.3));
    this.bufFold = makeBuffer(gl, g.fold || new Float32Array(n).fill(1));
    this.bufIdx = makeBuffer(gl, this.idxAttr);
    this.bufRun = makeBuffer(gl, this.lastRun, gl.DYNAMIC_DRAW);
    gl.bindVertexArray(this.vaoCell);
    attrib(gl, this.progCell, 'aPos', this.bufPos, 3);
    attrib(gl, this.progCell, 'aColor', this.bufColor, 3);
    attrib(gl, this.progCell, 'aCap', this.bufCap, 1);
    attrib(gl, this.progCell, 'aFold', this.bufFold, 1);
    attrib(gl, this.progCell, 'aIdx', this.bufIdx, 1);
    attrib(gl, this.progCell, 'aLastRun', this.bufRun, 1);
    gl.bindVertexArray(null);

    // Two vertices per LOCAL edge. An edge that leaves its region is not drawn as a
    // line at all: it is carried by the conduit for its region pair, below. Fifty
    // thousand individual long lines are a fog; the same wiring as a dozen bundles is a
    // picture of the system.
    const { src, dst, w } = g.edges;
    const delay = g.edges.delay || null;
    const conduitOf = g.edges.conduit || null;
    let local = [];
    for (let e = 0; e < m; e++) if (!conduitOf || conduitOf[e] < 0) local.push(e);
    this.localTotal = local.length;
    if (local.length > LOCAL_BUDGET) {
      // strongest first, then by index so the choice is deterministic and stable
      local.sort((a, b) => (Math.abs(w ? w[b] : 1) - Math.abs(w ? w[a] : 1)) || (a - b));
      local = local.slice(0, LOCAL_BUDGET);
      local.sort((a, b) => a - b);
    }
    this.localEdges = Uint32Array.from(local);
    const lm = local.length;
    this.edgePos = new Float32Array(lm * 6);
    const ecol = new Float32Array(lm * 6), eend = new Float32Array(lm * 2), ew = new Float32Array(lm * 2), eid = new Float32Array(lm * 2);
    const edl = new Float32Array(lm * 2);
    for (let i = 0; i < lm; i++) {
      const e = local[i], a = src[e], b = dst[e];
      for (let k = 0; k < 3; k++) {
        this.edgePos[i * 6 + k] = g.pos[a * 3 + k];
        this.edgePos[i * 6 + 3 + k] = g.pos[b * 3 + k];
        ecol[i * 6 + k] = g.color[a * 3 + k] * 0.8;
        ecol[i * 6 + 3 + k] = g.color[b * 3 + k] * 0.8;
      }
      eend[i * 2] = 0; eend[i * 2 + 1] = 1;
      ew[i * 2] = ew[i * 2 + 1] = w ? w[e] : 1;
      eid[i * 2] = eid[i * 2 + 1] = e;
      edl[i * 2] = edl[i * 2 + 1] = delay ? delay[e] : 0;
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

    this.drawnEdges = lm;
    this.buildConduits(g);
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
    this.drawn = { cells: n, edges: lm, localTotal: this.localTotal, conduits: this.conduits ? this.conduits.length : 0 };
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
    // Crisp, not foggy. A cell keeps a constant, small size on screen whatever the
    // organism does; only the gain falls with density, so a big brain does not add up to
    // white. The bloom is deliberately small and its threshold high: a rim on the few
    // hottest points, never a wash over the picture.
    const local = Math.max(1, this.drawnEdges || m);
    this.opts.cellGain = clamp(1.7 * Math.pow(60 / Math.max(1, n), 0.09), 0.55, 1.6);
    this.opts.edgeGain = clamp(0.9 * Math.pow(40 / local, 0.55), 0.010, 0.55);
    this.opts.conduitGain = clamp(0.55 * Math.pow(12 / Math.max(1, this.conduits ? this.conduits.length : 1), 0.35), 0.12, 0.70);
    this.opts.pointScale = clamp(1.30 * Math.pow(400 / Math.max(40, n), 0.05), 1.00, 1.50);
    this.opts.bloom = 0.26;
    this.opts.threshold = 0.82;
    this.opts.exposure = 1.10;
    this.opts.rim = 0.16;
    this.opts.flare = 1.9;
  }

  // Move every cell to a new layout (r re-layouts). Positions are lerped by the caller.
  setPositions(pos) {
    const gl = this.gl, g = this.graph;
    if (!g) return;
    g.pos.set(pos);
    updateBuffer(gl, this.bufPos, g.pos);
    const { src, dst } = g.edges;
    const local = this.localEdges || [];
    for (let i = 0; i < local.length; i++) {
      const e = local[i], a = src[e], b = dst[e];
      for (let k = 0; k < 3; k++) {
        this.edgePos[i * 6 + k] = g.pos[a * 3 + k];
        this.edgePos[i * 6 + 3 + k] = g.pos[b * 3 + k];
      }
    }
    updateBuffer(gl, this.bufEdgePos, this.edgePos);
    // the conduits are anchored on the cells they carry, so they move with them
    this.buildConduits(g, true);
    // The pipeline layout is several times wider than the anatomical one, so a fog range
    // taken from the nominal scale would swallow the far stages whole. Measure it.
    this.radius = extent(g.pos);
  }

  // THE FIBRE TRACTS. One conduit per ordered region pair, drawn as a bundle of a few
  // bowed lanes running between the centroids of the cells that actually wire that pair.
  // The individual axons are not drawn at all; the tract is, and the packets run in it.
  buildConduits(g, moveOnly = false) {
    const gl = this.gl;
    const list = g.conduits || [];
    this.conduits = list;
    this.conduitOf = g.edges.conduit || null;
    if (!list.length) { this.conduitVerts = 0; this.condPackets = new Float64Array(0); return; }
    const colorOf = new Map();
    for (const r of (g.regions || [])) colorOf.set(r.name, r.rgb || null);
    // region colours as the renderer already has them: take them off the cells
    if (g.meta && g.color) {
      for (let i = 0; i < g.n; i++) {
        const nm = g.meta[i] && g.meta[i].region;
        if (nm && !colorOf.get(nm)) colorOf.set(nm, [g.color[i * 3], g.color[i * 3 + 1], g.color[i * 3 + 2]]);
      }
    }
    const verts = list.length * LANES * LANE_SEGS * 2;
    const pos = new Float32Array(verts * 3), col = new Float32Array(verts * 3);
    const end = new Float32Array(verts), wv = new Float32Array(verts), id = new Float32Array(verts), dl = new Float32Array(verts);
    let v = 0;
    for (const cd of list) {
      const a = cd.a, b = cd.b;
      const rgbA = colorOf.get(cd.from) || [0.45, 0.75, 1], rgbB = colorOf.get(cd.to) || [0.85, 0.65, 1];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) || 1;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, mz = (a[2] + b[2]) / 2;
      const mr = Math.hypot(mx, my, mz) || 1;
      // a tract does not cut through the middle of the head, it arcs outward
      const bow = 0.16 * len / mr;
      for (let L = 0; L < LANES; L++) {
        const ang = (L / LANES) * Math.PI * 2;
        const spread = Math.min(len * 0.05, 14) * (0.4 + 0.6 * (L % 2));
        const ox = Math.cos(ang) * spread, oy = Math.sin(ang) * spread * 0.7, oz = Math.cos(ang + 1.1) * spread;
        const ax = a[0] + ox * 0.3, ay = a[1] + oy * 0.3, az = a[2] + oz * 0.3;
        const bx = b[0] + ox * 0.3, by = b[1] + oy * 0.3, bz = b[2] + oz * 0.3;
        const cx = mx * (1 + bow) + ox, cy = my * (1 + bow) + oy, cz = mz * (1 + bow) + oz;
        const at = (t) => {
          const u = 1 - t;
          return [u * u * ax + 2 * u * t * cx + t * t * bx, u * u * ay + 2 * u * t * cy + t * t * by, u * u * az + 2 * u * t * cz + t * t * bz];
        };
        for (let seg = 0; seg < LANE_SEGS; seg++) {
          const t0 = seg / LANE_SEGS, t1 = (seg + 1) / LANE_SEGS;
          const P0 = at(t0), P1 = at(t1);
          for (let k = 0; k < 2; k++) {
            const P = k ? P1 : P0, t = k ? t1 : t0;
            pos[v * 3] = P[0]; pos[v * 3 + 1] = P[1]; pos[v * 3 + 2] = P[2];
            col[v * 3] = rgbA[0] * (1 - t) + rgbB[0] * t;
            col[v * 3 + 1] = rgbA[1] * (1 - t) + rgbB[1] * t;
            col[v * 3 + 2] = rgbA[2] * (1 - t) + rgbB[2] * t;
            end[v] = t;
            // two lanes carry the light, the rest are the body of the tube
            wv[v] = L === 0 ? 1.5 : L === 2 ? 1.0 : 0.40;
            id[v] = cd.id;
            dl[v] = cd.meanDelay || 0;
            v++;
          }
        }
      }
    }
    this.conduitVerts = v;
    if (moveOnly && this.bufCondPos) { updateBuffer(gl, this.bufCondPos, pos); return; }
    this.bufCondPos = makeBuffer(gl, pos, gl.DYNAMIC_DRAW);
    this.bufCondCol = makeBuffer(gl, col);
    this.bufCondEnd = makeBuffer(gl, end);
    this.bufCondW = makeBuffer(gl, wv);
    this.bufCondId = makeBuffer(gl, id);
    this.bufCondDelay = makeBuffer(gl, dl);
    gl.bindVertexArray(this.vaoConduit);
    attrib(gl, this.progEdge, 'aPos', this.bufCondPos, 3);
    attrib(gl, this.progEdge, 'aColor', this.bufCondCol, 3);
    attrib(gl, this.progEdge, 'aEnd', this.bufCondEnd, 1);
    attrib(gl, this.progEdge, 'aW', this.bufCondW, 1);
    attrib(gl, this.progEdge, 'aEdge', this.bufCondId, 1);
    attrib(gl, this.progEdge, 'aDelay', this.bufCondDelay, 1);
    gl.bindVertexArray(null);
    this.condPulse = createDataTexture(gl, Math.max(1, list.length));
    // packets seen per conduit since the HUD last read them
    this.condPackets = new Float64Array(list.length);
  }

  // Packets counted per conduit since the last call. The HUD turns this into packets
  // per second; nothing else consumes it, so it is safe to reset on read.
  takePackets() {
    if (!this.condPackets) return [];
    const out = Array.from(this.condPackets);
    this.condPackets.fill(0);
    return out;
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
      const cd = this.conduitOf ? this.conduitOf[e] : -1;
      if (cd >= 0 && this.condPulse) {
        // the packet travels in the tract, not on a line of its own
        this.condPulse.data[cd] = time;
        this.condPackets[cd]++;
        this.condDirty = true;
      } else {
        this.pulse.data[e] = time;
        this.pulsesDirty = true;
      }
      lit++;
    }
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
    if (this.condDirty && this.condPulse) { uploadDataTexture(gl, this.condPulse); this.condDirty = false; }

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

    if (this.graph && this.drawnEdges) {
      const p = this.progEdge;
      gl.useProgram(p);
      gl.uniformMatrix4fv(p.u.uVP, false, vp);
      gl.uniform2f(p.u.uFog, fogNear, fogFar);
      gl.uniform1f(p.u.uTime, time);
      gl.uniform1f(p.u.uGain, this.opts.edgeGain);
      gl.uniform1f(p.u.uBase, 1.0);
      gl.uniform1f(p.u.uTickSec, this.opts.tickSec);
      gl.uniform1i(p.u.uPulseW, this.pulse.w);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pulse.tex);
      gl.uniform1i(p.u.uPulse, 0);
      gl.bindVertexArray(this.vaoEdge);
      gl.drawArrays(gl.LINES, 0, this.drawnEdges * 2);
    }
    // the tracts, with their packets, on the same program as the local wiring
    if (this.graph && this.conduitVerts) {
      const p = this.progEdge;
      gl.useProgram(p);
      gl.uniformMatrix4fv(p.u.uVP, false, vp);
      gl.uniform2f(p.u.uFog, fogNear, fogFar);
      gl.uniform1f(p.u.uTime, time);
      gl.uniform1f(p.u.uGain, this.opts.conduitGain);
      gl.uniform1f(p.u.uBase, this.opts.conduitBase ?? 0.22);
      gl.uniform1f(p.u.uTickSec, this.opts.tickSec);
      gl.uniform1i(p.u.uPulseW, this.condPulse.w);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.condPulse.tex);
      gl.uniform1i(p.u.uPulse, 0);
      gl.bindVertexArray(this.vaoConduit);
      gl.drawArrays(gl.LINES, 0, this.conduitVerts);
    }
    if (this.graph && this.graph.n) {
      const p = this.progCell;
      gl.useProgram(p);
      gl.uniformMatrix4fv(p.u.uVP, false, vp);
      gl.uniform2f(p.u.uFog, fogNear, fogFar);
      gl.uniform1f(p.u.uTime, time);
      gl.uniform1f(p.u.uDecay, this.opts.decay);
      gl.uniform1f(p.u.uGain, this.opts.cellGain);
      gl.uniform1f(p.u.uRim, this.opts.rim ?? 0.16);
      gl.uniform1f(p.u.uFlare, this.opts.flare ?? 1.6);
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
    for (const b of ['bufPos', 'bufColor', 'bufCap', 'bufFold', 'bufIdx', 'bufRun', 'bufEdgePos', 'bufEdgeCol', 'bufEdgeEnd', 'bufEdgeW', 'bufEdgeId', 'bufEdgeDelay',
      'bufCondPos', 'bufCondCol', 'bufCondEnd', 'bufCondW', 'bufCondId', 'bufCondDelay']) {
      if (this[b]) { gl.deleteBuffer(this[b]); this[b] = null; }
    }
    if (this.pulse) { gl.deleteTexture(this.pulse.tex); this.pulse = null; }
    if (this.condPulse) { gl.deleteTexture(this.condPulse.tex); this.condPulse = null; }
    this.conduitVerts = 0;
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
