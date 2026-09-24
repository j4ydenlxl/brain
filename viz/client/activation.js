// client/activation.js - when a node is allowed to be lit, and by how much.
//
// THE RULE, and it has no exceptions: a node lights because its cell ran, and for no
// other reason. There is no idle twinkle, no ambient shimmer, no animation that touches
// a node the brain did not touch. A cell that never runs never blinks, for as long as
// the page is open.
//
// The renderer holds one number per cell, the wall clock second at which that cell was
// last seen running in a batch frame, and zero for "never". The shader decays that into
// an activation, and this module is the same rule in plain JavaScript so it can be
// graded in a test without a GPU: `Activation.value` and the `act` line in CELL_VS are
// deliberately the same expression.

export class Activation {
  constructor(n) {
    this.lastRun = new Float32Array(n);   // seconds, 0 = this cell has never run
    this.dirty = false;
  }
  get length() { return this.lastRun.length; }

  /** Cell `idx` ran at `time` (seconds since the page opened, always > 0). */
  noteRun(idx, time) {
    if (!(idx >= 0) || idx >= this.lastRun.length) return false;
    this.lastRun[idx] = time;
    this.dirty = true;
    return true;
  }

  /**
   * Fold one batch frame in. `frame.runs` is [cellIdx, count, ...] straight off the
   * ledger's cell.run events; nothing else in the frame may light a node.
   */
  applyFrame(frame, time) {
    let lit = 0;
    const runs = (frame && frame.runs) || [];
    for (let i = 0; i < runs.length; i += 2) if (this.noteRun(runs[i], time)) lit++;
    return lit;
  }

  /** Activation of cell `idx` at `time`, in 0..1. Exactly 0 when the cell never ran. */
  value(idx, time, decay = 0.30) {
    const last = this.lastRun[idx];
    if (!(last > 0)) return 0;
    const age = Math.max(0, time - last);
    return Math.exp(-age / decay);
  }

  /** Every cell that has never run, as an array of indices. Used by the test. */
  neverRan() {
    const out = [];
    for (let i = 0; i < this.lastRun.length; i++) if (!(this.lastRun[i] > 0)) out.push(i);
    return out;
  }
}
