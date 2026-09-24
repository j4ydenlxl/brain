// cli/run.mjs: THE PERSISTENT PROCESS. His manual: the brain is meant to stay active rather
// than exist for the duration of one request. Two modes:
//
//   --realtime  one tick per millisecond of wall time, drift corrected. The loop never counts
//               its own ticks as time. It reads the clock, computes how many ticks wall time
//               is owed, runs exactly that many, and reports how far behind it fell. Drift is
//               measured, not assumed.
//   --fast      as fast as the CPU allows, in chunks, yielding to the event loop between them
//               so the control plane keeps answering while the organism runs flat out.
//
// Both autosave a snapshot every N ticks and on SIGINT, so a killed process loses at most N.
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const yieldLoop = () => new Promise((r) => setImmediate(r));

export function makeRunner(brain, {
  mode = 'fast',
  ticks = Infinity,
  autosave = 1000,
  save = () => {},
  onProgress = null,
  progressEveryMs = 1000,
  maxCatchup = 20_000,
  chunk = 2000,
  // 'timer' parks the loop in setTimeout, which costs almost no CPU but inherits the host
  // timer granularity (measured at about 15 ms on this Windows desk, so about 15 ticks of
  // lag per wake). 'spin' yields through setImmediate instead: sub millisecond lag, one core
  // busy. Both correct their own drift, and both report what the drift actually was.
  precision = 'timer',
} = {}) {
  const state = {
    mode, ticks, autosave, precision,
    paused: false, stopping: false, reason: null,
    done: 0, saves: 0, lastSaveAt: 0,
    startedAt: 0, finishedAt: 0,
    drift: { last: 0, max: 0, sum: 0, n: 0, behindTicks: 0 },
  };

  // Realtime baseline. Reset on start and on every resume, so a pause never shows up as drift.
  let baseWall = 0, baseTicks = 0;

  function pause() { if (!state.paused) { state.paused = true; } return state; }
  function resume() {
    if (state.paused) { state.paused = false; baseWall = performance.now(); baseTicks = state.done; }
    return state;
  }
  function stop(reason = 'stop') { state.stopping = true; state.reason = state.reason || reason; return state; }

  function maybeSave(force = false) {
    if (!force && (!autosave || state.done - state.lastSaveAt < autosave)) return false;
    save(brain);
    state.saves++; state.lastSaveAt = state.done;
    return true;
  }

  function driftSample(behind) {
    state.drift.last = behind;
    state.drift.behindTicks = behind;
    if (behind > state.drift.max) state.drift.max = behind;
    state.drift.sum += behind; state.drift.n++;
  }

  function snapshotState() {
    const wall = (state.finishedAt || performance.now()) - state.startedAt;
    return {
      mode: state.mode, precision: state.precision, paused: state.paused, stopping: state.stopping, reason: state.reason,
      done: state.done, target: Number.isFinite(state.ticks) ? state.ticks : null,
      saves: state.saves, lastSaveAt: state.lastSaveAt,
      wallMs: Number(wall.toFixed(1)),
      ticksPerSec: wall > 0 ? Math.round(state.done / (wall / 1000)) : null,
      drift: {
        lastTicks: state.drift.last,
        maxTicks: state.drift.max,
        meanTicks: state.drift.n ? Number((state.drift.sum / state.drift.n).toFixed(3)) : 0,
        samples: state.drift.n,
      },
    };
  }

  async function run() {
    state.startedAt = performance.now();
    baseWall = state.startedAt; baseTicks = 0;
    let lastProgress = state.startedAt;
    while (!state.stopping && state.done < ticks) {
      if (state.paused) { await sleep(2); continue; }
      if (mode === 'realtime') {
        const now = performance.now();
        const owed = baseTicks + Math.floor(now - baseWall);
        const target = Math.min(ticks, owed);
        const behind = target - state.done;
        if (behind > 0) {
          const n = Math.min(behind, maxCatchup);
          brain.tick(n);
          state.done += n;
          driftSample(behind);
        }
        maybeSave();
        if (onProgress && performance.now() - lastProgress >= progressEveryMs) { lastProgress = performance.now(); onProgress(snapshotState(), brain); }
        if (state.done < ticks) { if (precision === 'spin') await yieldLoop(); else await sleep(1); }
      } else {
        // Never step past an autosave boundary, so "every N ticks" means exactly that
        // however large the chunk is.
        const toSave = autosave ? Math.max(1, autosave - (state.done - state.lastSaveAt)) : Infinity;
        const n = Math.min(chunk, ticks - state.done, toSave);
        brain.tick(n);
        state.done += n;
        maybeSave();
        if (onProgress && performance.now() - lastProgress >= progressEveryMs) { lastProgress = performance.now(); onProgress(snapshotState(), brain); }
        await yieldLoop();
      }
    }
    state.finishedAt = performance.now();
    if (!state.reason) state.reason = state.done >= ticks ? 'ticks' : 'stopped';
    return snapshotState();
  }

  return { state, run, pause, resume, stop, snapshotState, maybeSave };
}
