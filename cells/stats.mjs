// cells/stats.mjs: online statistics: running moments, a histogram, running
// correlation, a z-score anomaly detector and an event rate meter. Importing this
// module registers the kinds.
import { defineKind } from '../core/cell.mjs';
import * as S from '../core/signal.mjs';

const first = (m) => (m.length ? m[m.length - 1].sig : null);

// ---------------------------------------------------------------- stat.running
defineKind('stat.running', {
  doc: 'Mean, variance (sample, Welford), min and max of num inputs; emits an event summary every params.every values received.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { every: 10 },
  init: () => ({ n: 0, mean: 0, M2: 0, min: Infinity, max: -Infinity, sinceEmit: 0 }),
  compute: (ins, cell) => {
    const st = cell.state;
    for (const it of ins[0]) {
      const x = S.ratToNumber(it.sig.data);
      st.n++; const d = x - st.mean; st.mean += d / st.n; st.M2 += d * (x - st.mean);
      if (x < st.min) st.min = x;
      if (x > st.max) st.max = x;
      st.sinceEmit++;
    }
    if (st.n > 0 && st.sinceEmit >= cell.params.every) {
      st.sinceEmit = 0;
      return [{ kind: 'event', data: { n: st.n, mean: st.mean, variance: st.n > 1 ? st.M2 / (st.n - 1) : 0, min: st.min, max: st.max } }];
    }
    return [null];
  },
});

// ---------------------------------------------------------------- stat.histogram
defineKind('stat.histogram', {
  doc: 'Fixed-width bins over [params.min, params.max) with params.bins buckets (values outside the range clamp to the nearest edge bin); emits { counts } whenever a value lands.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { min: 0, max: 1, bins: 10 },
  init: (p) => ({ counts: new Array(p.bins).fill(0) }),
  compute: (ins, cell) => {
    const p = cell.params, st = cell.state; let changed = false;
    for (const it of ins[0]) {
      const x = S.ratToNumber(it.sig.data);
      let i = Math.floor((x - p.min) / (p.max - p.min) * p.bins);
      i = Math.max(0, Math.min(p.bins - 1, i));
      st.counts[i]++; changed = true;
    }
    return [changed ? { kind: 'event', data: { counts: st.counts.slice() } } : null];
  },
  serialize: (s) => ({ counts: s.counts.slice() }),
  deserialize: (j) => ({ counts: j.counts.slice() }),
});

// ---------------------------------------------------------------- stat.correlate
defineKind('stat.correlate', {
  doc: 'Running Pearson correlation (Welford-style online covariance) of the x and y ports; a sample is a pair delivered on the same run. Emits { n, r }.',
  ports: { in: [{ name: 'x', kinds: ['num'] }, { name: 'y', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] },
  init: () => ({ n: 0, meanX: 0, meanY: 0, M2X: 0, M2Y: 0, C: 0 }),
  compute: (ins, cell) => {
    const a = first(ins[0]), b = first(ins[1]); if (!a || !b) return [null];
    const x = S.ratToNumber(a.data), y = S.ratToNumber(b.data), st = cell.state;
    st.n++;
    const dx = x - st.meanX; st.meanX += dx / st.n;
    const dy = y - st.meanY; st.meanY += dy / st.n;
    st.C += dx * (y - st.meanY); st.M2X += dx * (x - st.meanX); st.M2Y += dy * (y - st.meanY);
    const denom = Math.sqrt(st.M2X * st.M2Y);
    return [{ kind: 'event', data: { n: st.n, r: (st.n > 1 && denom > 0) ? st.C / denom : 0 } }];
  },
});

// ---------------------------------------------------------------- anomaly.zscore
defineKind('anomaly.zscore', {
  doc: 'Running mean/std (Welford) of num inputs; once past params.warmup samples, emits { anomaly: true, z, value } when |z| exceeds params.threshold.',
  ports: { in: [{ name: 'in', kinds: ['num'] }], out: [{ name: 'out', kinds: ['event'] }] },
  defaults: { threshold: 3, warmup: 5 },
  init: () => ({ n: 0, mean: 0, M2: 0 }),
  compute: (ins, cell) => {
    const s = first(ins[0]); if (!s) return [null];
    const x = S.ratToNumber(s.data), st = cell.state, p = cell.params;
    st.n++; const d = x - st.mean; st.mean += d / st.n; st.M2 += d * (x - st.mean);
    const variance = st.n > 1 ? st.M2 / (st.n - 1) : 0, std = Math.sqrt(variance);
    if (st.n > p.warmup && std > 0) {
      const z = (x - st.mean) / std;
      if (Math.abs(z) > p.threshold) return [{ kind: 'event', data: { anomaly: true, z, value: x } }];
    }
    return [null];
  },
});

// ---------------------------------------------------------------- rate.meter
defineKind('rate.meter', {
  doc: 'Events per second over a trailing params.windowMs sliding window of wall ticks (ms); recomputes and emits the current rate every run, so it also decays toward 0 when no new events arrive.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['num'] }] },
  defaults: { windowMs: 1000 },
  init: () => ({ times: [], head: 0 }),
  compute: (ins, cell, ctx) => {
    // The window is a queue read through a head index, not shift(): once the window is full
    // every run expires a tick's worth of entries, and shift() on a long array is a move of
    // everything behind it (7.2 s of a 117 s profile, all of it after t=1000, 2026-09-17).
    const st = cell.state, t = ctx.t, cut = t - cell.params.windowMs;
    for (const _ of ins[0]) st.times.push(t);
    while (st.head < st.times.length && st.times[st.head] < cut) st.head++;
    if (st.head > 1024 && st.head * 2 > st.times.length) { st.times = st.times.slice(st.head); st.head = 0; }
    const rate = (st.times.length - st.head) / (cell.params.windowMs / 1000);
    return [{ kind: 'num', data: S.flt(rate) }];
  },
  serialize: (s) => ({ times: s.times.slice(s.head) }),
  deserialize: (j) => ({ times: j.times.slice(), head: 0 }),
});
