// io/runner.mjs: the heartbeat. Ticks a Brain in real (wall clock) time instead of the
// as-fast-as-possible tick(n) loop the core tests use, with drift correction so a slow
// tick does not push every later tick later too, and drains brain.takeOutbox() (signals
// that reached no downstream cell: the brain's output to the world) into a set of
// registered sink cells each real tick.
import { createCell, runCell } from '../core/cell.mjs';
import { MS } from '../core/clock.mjs';
import { flushSink, closeSink } from './sinks.mjs';

function hrNowMs() { return Number(process.hrtime.bigint()) / 1e6; }

export class Runner {
  // brain: a core/brain.mjs Brain. msPerTick: how many wall ms each brain.tick() should
  // represent (default 1 tick = 1ms, matching clock.mjs's MS). maxTicks: stop after this
  // many ticks (default: run until stop() is called). sinks: initial registered sinks,
  // each either an already-built cell (createCell(...) result) or a spec { id, kind, params }.
  constructor(brain, { msPerTick = 1 * MS, maxTicks = Infinity, sinks = [] } = {}) {
    this.brain = brain;
    this.msPerTick = msPerTick;
    this.maxTicks = maxTicks;
    this.sinks = [];
    for (const s of sinks) this.addSink(s);
    this.running = false;
    this._timer = null;
    this._startMs = 0;
    this._nextAt = 0; // ideal ms-since-start of the next tick, on a fixed grid
    this.stats = { ticks: 0, lateTicks: 0, meanMs: 0, maxMs: 0, totalMs: 0 };
    this._ctx = { brain, t: 0, gen: 0 };
    this.done = new Promise((resolve) => { this._resolveDone = resolve; });
  }

  // Register a sink the runner will hand every drained signal to (the ones whose in
  // port accepts that signal's kind). Returns the cell so its state (e.g. sink.http's
  // sent/failed counts) can be inspected later.
  addSink(spec) {
    const cell = (spec && spec.kind && spec.ports) ? spec
      : createCell({ id: spec.id || ('sink$' + this.sinks.length), kind: spec.kind, params: spec.params, policy: { period: 'event', ...(spec.policy || {}) } });
    this.sinks.push(cell);
    return cell;
  }

  _drain() {
    if (!this.sinks.length) { this.brain.takeOutbox(); return; }
    const outbox = this.brain.takeOutbox();
    if (!outbox.length) return;
    this._ctx.t = this.brain.clock.t; this._ctx.gen = this.brain.clock.gen;
    for (const sig of outbox) {
      const mailItem = { sig, w: 1, edge: -1, from: -1 };
      for (const cell of this.sinks) {
        const dp = cell.ports.in.findIndex((port) => port.kinds.includes(sig.kind));
        if (dp < 0) continue;
        const ins = cell.ports.in.map((_, i) => (i === dp ? [mailItem] : []));
        runCell(cell, ins, this._ctx);
      }
    }
  }

  start() {
    if (this.running) return this;
    this.running = true;
    this._startMs = hrNowMs();
    this._nextAt = 0;
    this._scheduleNext();
    return this;
  }

  _scheduleNext() {
    if (!this.running) return;
    if (this.stats.ticks >= this.maxTicks) { this.stop(); return; }
    const elapsed = hrNowMs() - this._startMs;
    const delay = Math.max(0, this._nextAt - elapsed);
    this._timer = setTimeout(() => this._runTick(), delay);
  }

  _runTick() {
    if (!this.running) return;
    const wantAt = this._nextAt;
    const startedAt = hrNowMs() - this._startMs;
    // Late: this tick began more than one full period behind its slot on the ideal grid.
    if (startedAt > wantAt + this.msPerTick) this.stats.lateTicks++;
    const before = process.hrtime.bigint();
    this.brain.tick();
    this._drain();
    const tookMs = Number(process.hrtime.bigint() - before) / 1e6;
    this.stats.ticks++;
    this.stats.totalMs += tookMs;
    this.stats.meanMs = this.stats.totalMs / this.stats.ticks;
    if (tookMs > this.stats.maxMs) this.stats.maxMs = tookMs;
    // Drift correction: the next slot is wantAt + msPerTick on the fixed grid, never
    // "now + msPerTick" - otherwise a string of slow ticks would keep pushing every
    // later tick later still, instead of catching back up.
    this._nextAt = wantAt + this.msPerTick;
    if (this.stats.ticks >= this.maxTicks) { this.stop(); return; }
    this._scheduleNext();
  }

  stop() {
    const wasRunning = this.running;
    this.running = false;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    for (const cell of this.sinks) { flushSink(cell); closeSink(cell); }
    if (wasRunning) this._resolveDone(this.stats);
    return this.stats;
  }
}

// runOnce(brain, ticks): tick a brain synchronously ticks times (no wall-clock pacing,
// no sinks) and return whatever landed in the outbox across all of them, in order.
export function runOnce(brain, ticks = 1) {
  const out = [];
  for (let i = 0; i < ticks; i++) { brain.tick(); out.push(...brain.takeOutbox()); }
  return out;
}
