// web/src/scene.js: the picture. WebGL2, written by hand, no libraries.
//
// HIS RULE, VERBATIM: "Dont make the neurons so very shiny and foggy it should be clear
// but not glowing slightly glowing. Not a fog". So: every node is a CRISP disc, every node
// is THE SAME SIZE, there is no fog volume, no wide halo and no bloom wash. A node carries
// a thin rim of glow and nothing more. What separates one node from another is how bright
// it is and how warm it is, and both come from its capability score. What moves is a cell
// that actually RAN this tick and a packet that is actually in flight.
//
// Three things are drawn, in this order:
//   1. edges, thin and dim, alpha from the learned weight, so the wiring is visible as
//      texture rather than as spaghetti;
//   2. conduits, one line per ordered pair of regions, with packets riding them at the
//      speed the delay says: arrival is t + 1 + delay, so a delay 3 bundle is half the
//      speed of a delay 1 bundle;
//   3. cells, on top, crisp.
//
// Anatomy and pipeline are two position buffers and one uniform between them, so pressing
// v does not rebuild anything: the organism walks from one shape into the other.

const CELL_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aPipe;
in vec3 aColor;
in float aCap;
in float aFold;
in float aLastRun;
in float aIdx;
uniform mat4 uVP;
uniform float uTime;
uniform float uDecay;
uniform float uPointScale;
uniform float uSelected;
uniform float uMorph;
uniform vec2 uDepth;
out vec3 vColor;
out float vAct;
out float vSel;
out float vDepth;
out float vCap;
out float vFold;
void main() {
  vec3 p = mix(aPos, aPipe, uMorph);
  vec4 clip = uVP * vec4(p, 1.0);
  gl_Position = clip;
  vDepth = clamp((uDepth.y - clip.w) / max(0.001, uDepth.y - uDepth.x), 0.40, 1.0);
  float age = max(0.0, uTime - aLastRun);
  vAct = aLastRun > 0.0 ? exp(-age / uDecay) : 0.0;
  vCap = aCap;
  vFold = aFold;
  vSel = (abs(aIdx - uSelected) < 0.5) ? 1.0 : 0.0;
  float w = max(0.15, clip.w);
  gl_PointSize = clamp(uPointScale * (1.0 + 0.6 * vSel) / w, 1.0, 22.0);
  vColor = aColor;
}`;

const CELL_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAct;
in float vSel;
in float vDepth;
in float vCap;
in float vFold;
uniform float uRim;
out vec4 frag;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  float disc = smoothstep(0.25, 0.09, r2);
  float rim = exp(-r2 * 15.0) * uRim;
  float ring = vSel * smoothstep(0.245, 0.205, r2) * smoothstep(0.125, 0.165, r2) * 2.4;
  float a = disc + rim + ring;
  float steady = 0.30 + 0.70 * vCap;
  float fold = mix(0.34, 1.0, vFold);
  vec3 warm = mix(vColor, vec3(1.0, 0.88, 0.66), 0.42 * vCap);
  vec3 c = mix(warm, vec3(1.0), vAct * vAct * 0.65);
  float lvl = 1.55 * steady * fold * vDepth + 1.05 * vAct * vAct + vSel;
  frag = vec4(c * a * lvl, a * clamp(lvl, 0.0, 1.0));
}`;

const LINE_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aPipe;
in vec3 aColor;
in float aAlpha;
uniform mat4 uVP;
uniform float uMorph;
uniform float uGain;
out vec3 vColor;
out float vAlpha;
void main() {
  vec3 p = mix(aPos, aPipe, uMorph);
  vec4 clip = uVP * vec4(p, 1.0);
  gl_Position = clip;
  vColor = aColor;
  vAlpha = aAlpha * uGain;
}`;

const LINE_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAlpha;
out vec4 frag;
void main() { frag = vec4(vColor * vAlpha, vAlpha); }`;

const PACKET_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aColor;
in float aSize;
uniform mat4 uVP;
out vec3 vColor;
void main() {
  vec4 clip = uVP * vec4(aPos, 1.0);
  gl_Position = clip;
  gl_PointSize = clamp(aSize * 260.0 / max(0.15, clip.w), 1.5, 9.0);
  vColor = aColor;
}`;

const PACKET_FS = `#version 300 es
precision highp float;
in vec3 vColor;
out vec4 frag;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  float a = smoothstep(0.25, 0.04, r2);
  frag = vec4(mix(vColor, vec3(1.0), 0.55) * a * 1.6, a);
}`;

function compile(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('shader: ' + gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link: ' + gl.getProgramInfoLog(p));
  const loc = {};
  const na = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < na; i++) { const a = gl.getActiveAttrib(p, i); loc[a.name] = gl.getAttribLocation(p, a.name); }
  const nu = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < nu; i++) { const u = gl.getActiveUniform(p, i); loc[u.name] = gl.getUniformLocation(p, u.name); }
  return { p, loc };
}

function buf(gl, data, usage) {
  const b = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
  return b;
}
function attach(gl, prog, name, b, size) {
  const l = prog.loc[name];
  if (l === undefined || l < 0) return;
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.enableVertexAttribArray(l);
  gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0);
}

// ---------------------------------------------------------------- small matrix math
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function lookAt(eye, center, up) {
  let z0 = eye[0] - center[0], z1 = eye[1] - center[1], z2 = eye[2] - center[2];
  let l = Math.hypot(z0, z1, z2) || 1; z0 /= l; z1 /= l; z2 /= l;
  let x0 = up[1] * z2 - up[2] * z1, x1 = up[2] * z0 - up[0] * z2, x2 = up[0] * z1 - up[1] * z0;
  l = Math.hypot(x0, x1, x2) || 1; x0 /= l; x1 /= l; x2 /= l;
  const y0 = z1 * x2 - z2 * x1, y1 = z2 * x0 - z0 * x2, y2 = z0 * x1 - z1 * x0;
  return new Float32Array([
    x0, y0, z0, 0, x1, y1, z1, 0, x2, y2, z2, 0,
    -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]),
    -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]),
    -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]), 1,
  ]);
}
function mul(a, b) {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
    o[i * 4 + j] = a[j] * b[i * 4] + a[4 + j] * b[i * 4 + 1] + a[8 + j] * b[i * 4 + 2] + a[12 + j] * b[i * 4 + 3];
  }
  return o;
}

// ---------------------------------------------------------------- the scene
export class Scene {
  constructor(canvas, org, layout, pipe, engine, regionSpec) {
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('this browser has no WebGL2');
    this.gl = gl; this.canvas = canvas; this.org = org; this.engine = engine;
    this.regionSpec = regionSpec || {};
    this.cells = org.cells; this.k = org.connectome;
    this.anat = layout.pos; this.pipe = pipe; this.fold = layout.fold;
    this.morph = 0; this.targetMorph = 0;
    this.selected = -1;
    // The opening shot is the LATERAL VIEW, looking down the x axis at one hemisphere, which
    // is the view a brain is drawn in: frontal pole to the left, occipital to the right,
    // temporal lobe below the Sylvian line, cerebellum tucked under the back, stem hanging.
    // A few degrees off true lateral so the far hemisphere gives the near one some depth.
    this.yaw = 1.42; this.pitch = 0.10; this.dist = 285; this.spin = 0.035;
    this.tickSec = 0.05;
    this.cellProg = compile(gl, CELL_VS, CELL_FS);
    this.lineProg = compile(gl, LINE_VS, LINE_FS);
    this.packProg = compile(gl, PACKET_VS, PACKET_FS);
    this.buildCells();
    this.buildEdges();
    this.buildConduits();
    gl.enable(gl.BLEND);
    // ONE, ONE and not SRC_ALPHA, ONE. Every fragment shader in this file writes its colour
    // ALREADY MULTIPLIED BY ITS OWN ALPHA (rgb = colour * a * level), which is what lets a
    // disc fade at its edge without a halo. SRC_ALPHA would multiply by the alpha a SECOND
    // time, so a cell meant to sit at 0.22 brightness was drawn at 0.22 squared, about five
    // percent, and the organism came out nearly black with only the hottest cells visible.
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
  }

  buildCells() {
    const gl = this.gl, n = this.cells.length;
    const color = new Float32Array(n * 3), cap = new Float32Array(n), idx = new Float32Array(n);
    this.lastRun = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const c = this.cells[i], col = this.regionColor(c.region);
      color[i * 3] = col[0]; color[i * 3 + 1] = col[1]; color[i * 3 + 2] = col[2];
      cap[i] = c.cap; idx[i] = i;
    }
    this.cellBufs = {
      pos: buf(gl, this.anat), pipe: buf(gl, this.pipe), color: buf(gl, color),
      cap: buf(gl, cap), fold: buf(gl, this.fold), idx: buf(gl, idx),
      last: buf(gl, this.lastRun, gl.DYNAMIC_DRAW),
    };
  }

  regionColor(name) {
    const s = this.regionSpec && this.regionSpec[name];
    return s ? s.color : [0.72, 0.76, 0.86];
  }

  /** Edges, subsampled to a cap so the texture of the wiring shows without a wall of hair. */
  buildEdges(limit) {
    const gl = this.gl, k = this.k, cells = this.cells;
    const max = limit || 45000;
    const step = Math.max(1, Math.ceil(k.n / max));
    const ids = [];
    for (let e = 0; e < k.n; e += step) ids.push(e);
    const m = ids.length;
    const pos = new Float32Array(m * 6), pipe = new Float32Array(m * 6), col = new Float32Array(m * 6), al = new Float32Array(m * 2);
    for (let j = 0; j < m; j++) {
      const e = ids[j], a = k.src[e], b = k.dst[e];
      for (let q = 0; q < 3; q++) {
        pos[j * 6 + q] = this.anat[a * 3 + q]; pos[j * 6 + 3 + q] = this.anat[b * 3 + q];
        pipe[j * 6 + q] = this.pipe[a * 3 + q]; pipe[j * 6 + 3 + q] = this.pipe[b * 3 + q];
      }
      const ca = this.regionColor(cells[a].region), cb = this.regionColor(cells[b].region);
      for (let q = 0; q < 3; q++) { col[j * 6 + q] = ca[q] * 0.8; col[j * 6 + 3 + q] = cb[q] * 0.8; }
      const w = Math.min(0.5, 0.012 + 0.07 * Math.abs(k.w[e]));
      al[j * 2] = w; al[j * 2 + 1] = w;
    }
    this.edgeCount = m * 2;
    this.edgeBufs = { pos: buf(gl, pos), pipe: buf(gl, pipe), color: buf(gl, col), alpha: buf(gl, al) };
  }

  /**
   * One line per conduit, between the centroids of the two regions it joins, plus a pool
   * of packets that ride it. A packet's speed is 1 / (1 + meanDelay) of a tick, which is
   * the arrival rule and not a look.
   */
  buildConduits() {
    const gl = this.gl, rows = this.engine.conduits.rows, cells = this.cells;
    const cen = new Map();
    for (const c of cells) {
      let a = cen.get(c.region);
      if (!a) { a = [0, 0, 0, 0, 0, 0, 0]; cen.set(c.region, a); }
      a[0] += this.anat[c.idx * 3]; a[1] += this.anat[c.idx * 3 + 1]; a[2] += this.anat[c.idx * 3 + 2];
      a[3] += this.pipe[c.idx * 3]; a[4] += this.pipe[c.idx * 3 + 1]; a[5] += this.pipe[c.idx * 3 + 2];
      a[6]++;
    }
    for (const a of cen.values()) for (let q = 0; q < 6; q++) a[q] /= a[6];
    this.centroid = cen;
    const m = rows.length;
    const pos = new Float32Array(m * 6), pipe = new Float32Array(m * 6), col = new Float32Array(m * 6), al = new Float32Array(m * 2);
    for (let j = 0; j < m; j++) {
      const r = rows[j], A = cen.get(r.from), B = cen.get(r.to);
      for (let q = 0; q < 3; q++) {
        pos[j * 6 + q] = A[q]; pos[j * 6 + 3 + q] = B[q];
        pipe[j * 6 + q] = A[3 + q]; pipe[j * 6 + 3 + q] = B[3 + q];
      }
      const ca = this.regionColor(r.from), cb = this.regionColor(r.to);
      for (let q = 0; q < 3; q++) { col[j * 6 + q] = ca[q]; col[j * 6 + 3 + q] = cb[q]; }
      al[j * 2] = 0.20; al[j * 2 + 1] = 0.20;
    }
    this.conduitCount = m * 2;
    this.conduitBufs = { pos: buf(gl, pos), pipe: buf(gl, pipe), color: buf(gl, col), alpha: buf(gl, al) };
    // packets
    const per = 14;
    this.packN = m * per;
    this.packRow = new Int32Array(this.packN);
    this.packT = new Float32Array(this.packN);
    this.packPos = new Float32Array(this.packN * 3);
    this.packCol = new Float32Array(this.packN * 3);
    this.packSize = new Float32Array(this.packN);
    for (let j = 0; j < m; j++) for (let q = 0; q < per; q++) {
      const i = j * per + q;
      this.packRow[i] = j;
      this.packT[i] = q / per;
      const c = this.regionColor(rows[j].to);
      this.packCol[i * 3] = c[0]; this.packCol[i * 3 + 1] = c[1]; this.packCol[i * 3 + 2] = c[2];
    }
    this.packBufs = {
      pos: buf(gl, this.packPos, gl.DYNAMIC_DRAW),
      color: buf(gl, this.packCol),
      size: buf(gl, this.packSize, gl.DYNAMIC_DRAW),
    };
  }

  /** Move every packet along its conduit by one frame of the organism's own clock. */
  stepPackets(dt) {
    const rows = this.engine.conduits.rows, cen = this.centroid;
    const A = this.anat, P = this.pipe, mo = this.morph;
    for (let i = 0; i < this.packN; i++) {
      const r = rows[this.packRow[i]];
      const speed = 1 / ((1 + r.meanDelay) * this.tickSec);
      this.packT[i] += dt * speed;
      if (this.packT[i] > 1) this.packT[i] -= 1;
      const a = cen.get(r.from), b = cen.get(r.to), t = this.packT[i];
      for (let q = 0; q < 3; q++) {
        const an = a[q] + (b[q] - a[q]) * t;
        const pn = a[3 + q] + (b[3 + q] - a[3 + q]) * t;
        this.packPos[i * 3 + q] = an + (pn - an) * mo;
      }
      // a conduit carrying nothing shows nothing
      this.packSize[i] = r.pps > 0 ? Math.min(1, 0.25 + Math.log10(1 + r.pps) * 0.35) : 0;
    }
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.packBufs.pos);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.packPos);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.packBufs.size);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.packSize);
    void A; void P;
  }

  /** Push the engine's run record into the attribute the shader lights cells from. */
  syncActivity(nowSec) {
    const e = this.engine, n = this.cells.length;
    // only the cells that ran this tick change, so this is a walk over the run list
    for (let j = 0; j < e.ranCount; j++) this.lastRun[e.ranList[j]] = nowSec;
    void n;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cellBufs.last);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.lastRun);
  }

  viewProjection() {
    const c = this.canvas;
    const aspect = c.width / Math.max(1, c.height);
    const proj = perspective(0.85, aspect, 4, 2400);
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const eye = [Math.sin(this.yaw) * cp * this.dist, sp * this.dist + 4, Math.cos(this.yaw) * cp * this.dist];
    const view = lookAt(eye, [0, 0, 0], [0, 1, 0]);
    this.eye = eye;
    return mul(proj, view);
  }

  draw(nowSec, dt) {
    const gl = this.gl, c = this.canvas;
    const w = Math.floor(c.clientWidth * Math.min(2, window.devicePixelRatio || 1));
    const h = Math.floor(c.clientHeight * Math.min(2, window.devicePixelRatio || 1));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    this.morph += (this.targetMorph - this.morph) * Math.min(1, dt * 3.2);
    this.yaw += this.spin * dt;
    const vp = this.viewProjection();
    this.vp = vp;
    gl.viewport(0, 0, c.width, c.height);
    gl.clearColor(0.010, 0.013, 0.026, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 1. edges
    let P = this.lineProg;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.loc.uVP, false, vp);
    gl.uniform1f(P.loc.uMorph, this.morph);
    // Low, and deliberately so. These lines are TEXTURE, not subject: with the blend fixed
    // they add up honestly, and 22500 of them at the old gain became the fog he ruled out.
    gl.uniform1f(P.loc.uGain, 0.14);
    attach(gl, P, 'aPos', this.edgeBufs.pos, 3);
    attach(gl, P, 'aPipe', this.edgeBufs.pipe, 3);
    attach(gl, P, 'aColor', this.edgeBufs.color, 3);
    attach(gl, P, 'aAlpha', this.edgeBufs.alpha, 1);
    gl.drawArrays(gl.LINES, 0, this.edgeCount);

    // 2. conduits and their packets
    gl.uniform1f(P.loc.uGain, 0.60);
    attach(gl, P, 'aPos', this.conduitBufs.pos, 3);
    attach(gl, P, 'aPipe', this.conduitBufs.pipe, 3);
    attach(gl, P, 'aColor', this.conduitBufs.color, 3);
    attach(gl, P, 'aAlpha', this.conduitBufs.alpha, 1);
    gl.drawArrays(gl.LINES, 0, this.conduitCount);

    this.stepPackets(dt);
    P = this.packProg;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.loc.uVP, false, vp);
    attach(gl, P, 'aPos', this.packBufs.pos, 3);
    attach(gl, P, 'aColor', this.packBufs.color, 3);
    attach(gl, P, 'aSize', this.packBufs.size, 1);
    gl.drawArrays(gl.POINTS, 0, this.packN);

    // 3. cells
    this.syncActivity(nowSec);
    P = this.cellProg;
    gl.useProgram(P.p);
    gl.uniformMatrix4fv(P.loc.uVP, false, vp);
    gl.uniform1f(P.loc.uTime, nowSec);
    gl.uniform1f(P.loc.uDecay, 0.13);
    // gl_PointSize is in DRAWING BUFFER pixels, so on a 1.5x display a node drawn at 520
    // came out two thirds of the size it was meant to be. Scale by the ratio the canvas is
    // actually backed at, and every node is the same size on screen on every machine.
    gl.uniform1f(P.loc.uPointScale, 780 * (c.width / Math.max(1, c.clientWidth)));
    gl.uniform1f(P.loc.uSelected, this.selected);
    gl.uniform1f(P.loc.uMorph, this.morph);
    gl.uniform1f(P.loc.uRim, 0.16);
    gl.uniform2f(P.loc.uDepth, this.dist * 0.45, this.dist * 1.7);
    attach(gl, P, 'aPos', this.cellBufs.pos, 3);
    attach(gl, P, 'aPipe', this.cellBufs.pipe, 3);
    attach(gl, P, 'aColor', this.cellBufs.color, 3);
    attach(gl, P, 'aCap', this.cellBufs.cap, 1);
    attach(gl, P, 'aFold', this.cellBufs.fold, 1);
    attach(gl, P, 'aLastRun', this.cellBufs.last, 1);
    attach(gl, P, 'aIdx', this.cellBufs.idx, 1);
    gl.drawArrays(gl.POINTS, 0, this.cells.length);
  }

  /** Nearest cell to a click, in pixels, or -1. Every node is clickable. */
  pick(px, py, radius) {
    const vp = this.vp;
    if (!vp) return -1;
    const W = this.canvas.width, H = this.canvas.height;
    const sx = px * (W / this.canvas.clientWidth), sy = py * (H / this.canvas.clientHeight);
    const lim = (radius || 14) * (W / this.canvas.clientWidth);
    let best = -1, bestD = lim * lim;
    const A = this.anat, Pp = this.pipe, mo = this.morph;
    for (let i = 0; i < this.cells.length; i++) {
      const x = A[i * 3] + (Pp[i * 3] - A[i * 3]) * mo;
      const y = A[i * 3 + 1] + (Pp[i * 3 + 1] - A[i * 3 + 1]) * mo;
      const z = A[i * 3 + 2] + (Pp[i * 3 + 2] - A[i * 3 + 2]) * mo;
      const cw = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
      if (cw <= 0) continue;
      const cx = (vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / cw;
      const cy = (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / cw;
      const ex = (cx * 0.5 + 0.5) * W - sx, ey = (1 - (cy * 0.5 + 0.5)) * H - sy;
      const d = ex * ex + ey * ey;
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }
}

export { perspective, lookAt, mul };
