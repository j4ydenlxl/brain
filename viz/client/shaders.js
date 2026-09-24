// client/shaders.js - every shader, written by hand in GLSL ES 3.00.
//
// Cells are CRISP points. Every node is the same size; what separates them is how bright
// they are and how warm, and both come from the cell: its capability score sets the
// steady glow and the colour temperature, the fold it sits in darkens it into the sulcus,
// and a run flares it for a moment. There is no fog, no wide halo and no idle twinkle: a
// node that did not run is simply sitting there at its own steady level.
//
// Edges are lines whose alpha comes from the learned weight, carrying a travelling packet
// when a signal moves along them. The picture gets a light bright pass so the hottest
// cores lift, not a bloom wash.

export const CELL_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aColor;
in float aCap;      // capability score of this cell, 0..1
in float aFold;     // 0 at the bottom of a sulcus, 1 on the crown of a gyrus
in float aLastRun;
uniform mat4 uVP;
uniform float uTime;
uniform float uDecay;
uniform float uPointScale;
uniform float uSelected;
uniform vec2 uFog;
in float aIdx;
out vec3 vColor;
out float vAct;
out float vSel;
out float vFog;
out float vCap;
out float vFold;
void main() {
  vec4 clip = uVP * vec4(aPos, 1.0);
  gl_Position = clip;
  // depth cue only: the far side of the sheet is dimmer, it is not fogged out
  // A DEPTH CUE, NOT A FOG. The near surface of the sheet is at full level and the far
  // side of the same sheet is a quarter of it, which is what lets the eye read one
  // folded surface instead of two hemispheres and an interior superimposed.
  vFog = clamp((uFog.y - clip.w) / max(0.001, uFog.y - uFog.x), 0.10, 1.0);
  vFog = vFog * vFog;
  // THE ONLY SOURCE OF LIGHT THAT MOVES. aLastRun is the second at which the ledger last
  // reported this cell running; 0 means it never has, and then act is exactly 0 forever.
  float age = max(0.0, uTime - aLastRun);
  float act = aLastRun > 0.0 ? exp(-age / uDecay) : 0.0;
  vAct = act;
  vCap = aCap;
  vFold = aFold;
  vSel = (abs(aIdx - uSelected) < 0.5) ? 1.0 : 0.0;
  float w = max(0.15, clip.w);
  // EVERY NODE IS THE SAME SIZE. Only the selection ring and the perspective change it.
  gl_PointSize = clamp(uPointScale * (1.0 + 0.55 * vSel) / w, 1.0, 26.0);
  vColor = aColor;
}`;

export const CELL_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAct;
in float vSel;
in float vFog;
in float vCap;
in float vFold;
uniform float uGain;
uniform float uRim;     // how much of a glow rim a point is allowed, small by design
uniform float uFlare;
out vec4 frag;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  // a crisp disc with a thin soft edge, plus a small rim of glow: not a halo
  float disc = smoothstep(0.25, 0.10, r2);
  float rim = exp(-r2 * 13.0) * uRim;
  float ring = vSel * smoothstep(0.24, 0.20, r2) * smoothstep(0.13, 0.17, r2) * 2.2;
  float a = disc + rim + ring;
  // capability sets the steady level and the colour temperature: a high capability cell
  // is brighter and warmer, a simple one is dimmer and cooler, and neither is bigger
  float steady = 0.20 + 0.85 * vCap;
  // the sulci are the grooves: a cell down in a fold is darker than one on the crown
  float fold = mix(0.10, 1.0, vFold);
  vec3 warm = mix(vColor, vec3(1.0, 0.86, 0.62), 0.26 * vCap);
  // A RUN LIFTS THE CELL IN ITS OWN COLOUR. Washing it to white would erase the region
  // the cell belongs to at exactly the moment the viewer wants to know which region is
  // working, so a flare only warms the hue a little under half the way.
  vec3 c = mix(warm, vec3(1.0, 0.94, 0.86), vAct * vAct * 0.42);
  float lvl = steady * fold * vFog + uFlare * vAct + vSel;
  frag = vec4(c * a * uGain * lvl, a * clamp(lvl, 0.0, 1.0));
}`;

export const EDGE_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aColor;
in float aEnd;
in float aW;
in float aEdge;
in float aDelay;
uniform mat4 uVP;
uniform sampler2D uPulse;
uniform int uPulseW;
uniform float uTime;
// Seconds of screen time for ONE TICK of the brain's clock. The flight time of a quantum
// is not a look: core schedules delivery at t + 1 + delay, so an edge of delay 3 takes
// exactly twice as long to traverse as an edge of delay 1, and this uniform is the only
// thing that converts the organism's clock into the viewer's.
uniform float uTickSec;
// How loud the STANDING wire is allowed to be. A tract is drawn quiet on purpose: what
// the eye should catch in a conduit is the packet going through it, not the tube.
uniform float uBase;
uniform vec2 uFog;
out vec3 vColor;
out float vT;
out float vAlpha;
out float vPulse;
out float vFog;
void main() {
  vec4 clip = uVP * vec4(aPos, 1.0);
  gl_Position = clip;
  vFog = clamp((uFog.y - clip.w) / max(0.001, uFog.y - uFog.x), 0.18, 1.0);
  vColor = aColor;
  vT = aEnd;
  vAlpha = clamp(0.035 + 0.34 * abs(aW), 0.015, 0.55) * uBase;
  int id = int(aEdge + 0.5);
  ivec2 uv = ivec2(id % uPulseW, id / uPulseW);
  float start = texelFetch(uPulse, uv, 0).r;
  float age = uTime - start;
  float flight = (1.0 + aDelay) * uTickSec;   // arrival = t + 1 + delay
  vPulse = (start > 0.0 && age >= 0.0 && age <= flight) ? age / flight : -1.0;
}`;

export const EDGE_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vT;
in float vAlpha;
in float vPulse;
in float vFog;
uniform float uGain;
out vec4 frag;
void main() {
  float a = vAlpha * vFog * vFog;
  vec3 c = vColor;
  if (vPulse >= 0.0) {
    float d = vT - vPulse;
    float bead = exp(-(d * d) / 0.0022);
    float trail = exp(-max(0.0, d) * 10.0) * 0.30;
    a += bead * 1.10 + trail;
    c = mix(c, vec3(1.0), clamp(bead, 0.0, 1.0) * 0.85);
  }
  frag = vec4(c * a * uGain, a);
}`;

// Fullscreen triangle. No vertex buffer: the position comes from gl_VertexID.
export const QUAD_VS = `#version 300 es
precision highp float;
out vec2 vUV;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUV = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const BRIGHT_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
uniform float uThreshold;
out vec4 frag;
void main() {
  vec3 c = texture(uTex, vUV).rgb;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  float k = max(0.0, l - uThreshold) / max(0.0001, l);
  frag = vec4(c * k, 1.0);
}`;

export const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uTex;
uniform vec2 uDir;
out vec4 frag;
void main() {
  float w[5];
  w[0] = 0.227027; w[1] = 0.1945946; w[2] = 0.1216216; w[3] = 0.054054; w[4] = 0.016216;
  vec3 c = texture(uTex, vUV).rgb * w[0];
  for (int i = 1; i < 5; i++) {
    vec2 o = uDir * float(i);
    c += texture(uTex, vUV + o).rgb * w[i];
    c += texture(uTex, vUV - o).rgb * w[i];
  }
  frag = vec4(c, 1.0);
}`;

export const COMPOSITE_FS = `#version 300 es
precision highp float;
in vec2 vUV;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform float uBloomAmount;
uniform float uExposure;
out vec4 frag;
void main() {
  vec3 scene = texture(uScene, vUV).rgb;
  vec3 bloom = texture(uBloom, vUV).rgb;
  vec3 c = scene + bloom * uBloomAmount;
  c *= uExposure;
  // a shoulder only where the picture is genuinely hot, so a lit cell stays a lit point
  // and never smears into the cells around it
  c = c / (c + vec3(1.25));
  c = pow(c, vec3(0.92));
  vec2 d = vUV - vec2(0.5);
  float vig = 1.0 - 0.75 * dot(d, d);
  // the substrate: a very dark blue that is never pure black
  vec3 ground = vec3(0.012, 0.016, 0.030) * (1.0 - 0.6 * dot(d, d));
  frag = vec4(c * vig + ground, 1.0);
}`;
