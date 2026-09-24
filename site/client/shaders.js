// client/shaders.js - every shader, written by hand in GLSL ES 3.00.
// Cells are additive point sprites (a hot core and a wide halo) whose brightness decays
// after the cell runs. Edges are lines whose alpha comes from the learned weight and
// which carry a travelling bead of light when a signal moves along them. The picture is
// then bright passed, blurred twice and composited back, which is the bloom.

export const CELL_VS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec3 aColor;
in float aSize;
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
void main() {
  vec4 clip = uVP * vec4(aPos, 1.0);
  gl_Position = clip;
  // depth cue: without it the far half of the cloud adds onto the near half and the
  // whole brain reads as one white blob instead of a volume
  vFog = clamp((uFog.y - clip.w) / max(0.001, uFog.y - uFog.x), 0.18, 1.0);
  float age = max(0.0, uTime - aLastRun);
  float act = aLastRun > 0.0 ? exp(-age / uDecay) : 0.0;
  vAct = act;
  vSel = (abs(aIdx - uSelected) < 0.5) ? 1.0 : 0.0;
  float w = max(0.15, clip.w);
  gl_PointSize = clamp(uPointScale * aSize * (1.0 + 2.0 * act + 1.2 * vSel) / w, 1.5, 96.0);
  vColor = aColor;
}`;

export const CELL_FS = `#version 300 es
precision highp float;
in vec3 vColor;
in float vAct;
in float vSel;
in float vFog;
uniform float uGain;
uniform float uHalo;
uniform float uFlare;
out vec4 frag;
void main() {
  vec2 d = gl_PointCoord - vec2(0.5);
  float r2 = dot(d, d);
  if (r2 > 0.25) discard;
  float core = exp(-r2 * 46.0);
  float halo = exp(-r2 * 7.0) * uHalo;
  float ring = vSel * smoothstep(0.20, 0.17, r2) * smoothstep(0.12, 0.15, r2) * 2.0;
  float a = core + halo + ring;
  // the colour is the cell's region, and only the flare of a run washes toward white
  vec3 c = mix(vColor, vec3(1.0), vAct * vAct * 0.55);
  float f = mix(vFog * vFog, 1.0, vAct * 0.5 + vSel);
  frag = vec4(c * a * uGain * f * (0.45 + uFlare * vAct + vSel), a * f);
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
  vAlpha = clamp(0.035 + 0.34 * abs(aW), 0.015, 0.55);
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
  // gentle filmic shoulder so the hot cores stay coloured instead of clipping to white
  c = c / (c + vec3(0.85));
  c = pow(c, vec3(0.86));
  vec2 d = vUV - vec2(0.5);
  float vig = 1.0 - 0.75 * dot(d, d);
  // the substrate: a very dark blue that is never pure black
  vec3 ground = vec3(0.012, 0.016, 0.030) * (1.0 - 0.6 * dot(d, d));
  frag = vec4(c * vig + ground, 1.0);
}`;
