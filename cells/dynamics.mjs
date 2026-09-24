// cells/dynamics.mjs: cells whose state moves through continuous or discrete time on
// its own: a liquid time-constant cell, an echo state reservoir, an oscillator, a timer
// and a leaky integrate-and-fire spiker. Importing this module registers the kinds.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';
import { RNG } from '../core/rng.mjs';

const first = (m) => (m.length ? m[m.length - 1].sig : null);

// ---------------------------------------------------------------- liquid.cfc
defineKind('liquid.cfc', {
  doc: 'Closed-form continuous-time cell (liquid time-constant): hidden state h decays exponentially each tick toward tanh(Wx x + b), each unit at its own learned rate 1/tau. Vec in, vec out.',
  ports: { in: [{ name: 'x', kinds: ['vec'] }], out: [{ name: 'h', kinds: ['vec'] }] },
  defaults: { nin: 4, nhid: 8, dt: 1, tauMin: 2, tauMax: 20, seed: 'cfc' },
  init: (p, cell) => {
    const rng = new RNG(p.seed + ':' + cell.id);
    const Wx = new Float32Array(p.nhid * p.nin), b = new Float32Array(p.nhid), tau = new Float32Array(p.nhid);
    const scale = 1 / Math.sqrt(p.nin);
    for (let i = 0; i < Wx.length; i++) Wx[i] = rng.gauss() * scale;
    for (let j = 0; j < p.nhid; j++) { b[j] = rng.gauss() * 0.1; tau[j] = p.tauMin + rng.next() * (p.tauMax - p.tauMin); }
    return { Wx, b, tau, h: new Float32Array(p.nhid) };
  },
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    const p = cell.params, st = cell.state, x = s.data, h = new Float32Array(p.nhid);
    for (let j = 0; j < p.nhid; j++) {
      let a = st.b[j]; for (let i = 0; i < p.nin; i++) a += st.Wx[j * p.nin + i] * (x[i] || 0);
      const drive = Math.tanh(a), gate = 1 - Math.exp(-p.dt / st.tau[j]);
      h[j] = st.h[j] + (drive - st.h[j]) * gate;
    }
    st.h = h;
    return [{ kind: 'vec', data: h }];
  },
  serialize: (s) => ({ Wx: S.dataToJSON('vec', s.Wx), b: S.dataToJSON('vec', s.b), tau: S.dataToJSON('vec', s.tau), h: S.dataToJSON('vec', s.h) }),
  deserialize: (j) => ({ Wx: S.dataFromJSON('vec', j.Wx), b: S.dataFromJSON('vec', j.b), tau: S.dataFromJSON('vec', j.tau), h: S.dataFromJSON('vec', j.h) }),
});

// ---------------------------------------------------------------- reservoir.echo
defineKind('reservoir.echo', {
  doc: 'Echo state network: fixed random input weights and a fixed random recurrent matrix scaled toward params.spectralRadius (entries ~ N(0, (spectralRadius/sqrt(nres))^2), which by the circular law puts the spectral radius near the target as nres grows), leaky-integrated tanh state. A linear readout is trained online by the delta (Widrow-Hoff) rule when a target arrives.',
  ports: { in: [{ name: 'x', kinds: ['vec'] }, { name: 'target', kinds: ['vec'] }], out: [{ name: 'state', kinds: ['vec'] }, { name: 'y', kinds: ['vec'] }, { name: 'error', kinds: ['num'] }] },
  defaults: { nin: 1, nres: 32, nout: 1, spectralRadius: 0.9, leak: 0.3, lr: 0.05, seed: 'echo' },
  init: (p, cell) => {
    const rng = new RNG(p.seed + ':' + cell.id);
    const Win = new Float32Array(p.nres * p.nin);
    for (let i = 0; i < Win.length; i++) Win[i] = (rng.next() * 2 - 1) * 0.5;
    const W = new Float32Array(p.nres * p.nres), sigma = p.spectralRadius / Math.sqrt(p.nres);
    for (let i = 0; i < W.length; i++) W[i] = rng.gauss() * sigma;
    return { Win, W, Wout: new Float32Array(p.nout * p.nres), h: new Float32Array(p.nres), lastY: null };
  },
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state;
    const xs = first(ins[0]), tg = first(ins[1]);
    const out = [null, null, null];
    if (xs) {
      const x = xs.data, pre = new Float32Array(p.nres);
      for (let j = 0; j < p.nres; j++) {
        let a = 0;
        for (let i = 0; i < p.nin; i++) a += st.Win[j * p.nin + i] * (x[i] || 0);
        for (let k = 0; k < p.nres; k++) a += st.W[j * p.nres + k] * st.h[k];
        pre[j] = a;
      }
      const h = new Float32Array(p.nres);
      for (let j = 0; j < p.nres; j++) h[j] = (1 - p.leak) * st.h[j] + p.leak * Math.tanh(pre[j]);
      st.h = h;
      const y = new Float32Array(p.nout);
      for (let k = 0; k < p.nout; k++) { let a = 0; for (let j = 0; j < p.nres; j++) a += st.Wout[k * p.nres + j] * h[j]; y[k] = a; }
      st.lastY = y;
      out[0] = { kind: 'vec', data: h };
      out[1] = { kind: 'vec', data: y };
    }
    if (tg && st.lastY) {
      const t = tg.data; let se = 0;
      for (let k = 0; k < p.nout; k++) {
        const err = t[k] - st.lastY[k]; se += err * err;
        for (let j = 0; j < p.nres; j++) st.Wout[k * p.nres + j] += p.lr * err * st.h[j];
      }
      const rmse = Math.sqrt(se / p.nout);
      cell.stats.surprise = rmse;
      out[2] = { kind: 'num', data: S.flt(rmse) };
    }
    return out;
  },
  serialize: (s) => ({ Win: S.dataToJSON('vec', s.Win), W: S.dataToJSON('vec', s.W), Wout: S.dataToJSON('vec', s.Wout), h: S.dataToJSON('vec', s.h) }),
  deserialize: (j) => ({ Win: S.dataFromJSON('vec', j.Win), W: S.dataFromJSON('vec', j.W), Wout: S.dataFromJSON('vec', j.Wout), h: S.dataFromJSON('vec', j.h), lastY: null }),
});

// ---------------------------------------------------------------- oscillator
defineKind('oscillator', {
  doc: 'Emits a vec of sin components, one per params.periods entry (ticks per cycle), for rhythm and timing.',
  ports: { in: [], out: [{ name: 'out', kinds: ['vec'] }] },
  defaults: { periods: [4, 16, 64, 256] },
  compute: (ins, cell, ctx) => {
    const periods = cell.params.periods, out = new Float32Array(periods.length);
    for (let i = 0; i < periods.length; i++) out[i] = Math.sin(2 * Math.PI * ctx.t / periods[i]);
    return [{ kind: 'vec', data: out }];
  },
});

// ---------------------------------------------------------------- timer
defineKind('timer', {
  doc: 'Counts down params.ticks (or event.data.ticks if given) after a trigger event, then emits { expired: true } once and goes idle until retriggered.',
  ports: { in: [{ name: 'trigger', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { ticks: 10 },
  init: () => ({ remaining: -1 }),
  compute: (ins, cell) => {
    for (const it of ins[0]) cell.state.remaining = (it.sig.data && it.sig.data.ticks != null) ? it.sig.data.ticks : cell.params.ticks;
    if (cell.state.remaining < 0) return [null];
    cell.state.remaining--;
    if (cell.state.remaining <= 0) { cell.state.remaining = -1; return [{ kind: 'event', data: { expired: true } }]; }
    return [null];
  },
});

// ---------------------------------------------------------------- integrate.leaky
defineKind('integrate.leaky', {
  doc: 'Leaky integrate-and-fire on a num input: v decays by params.decay each tick and accumulates the input; emits { spike: true } and resets v to 0 when it crosses params.threshold, then holds silent for params.refractory ticks.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'spike', kinds: ['event'] }] },
  defaults: { threshold: 1, decay: 0.9, refractory: 5 },
  init: () => ({ v: 0, refCount: 0 }),
  compute: (ins, cell) => {
    const st = cell.state, p = cell.params;
    if (st.refCount > 0) { st.refCount--; return [null]; }
    st.v *= p.decay;
    for (const it of ins[0]) st.v += S.ratToNumber(it.sig.data);
    if (st.v >= p.threshold) { st.v = 0; st.refCount = p.refractory; return [{ kind: 'event', data: { spike: true } }]; }
    return [null];
  },
});
