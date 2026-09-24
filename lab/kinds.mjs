// lab/kinds.mjs : primitives that exist so an experiment can be SCORED, not so the organism
// can think. His manual asks the system to "support controlled experiments on new primitives",
// and the first thing a controlled experiment needs is a place for the answer to land where
// the harness can read it back without reaching inside another cell's private state.
//
// lab.answer is the recorder: it takes whatever event reaches it and keeps the data verbatim,
// with the tick it arrived on. It lives INSIDE the experimental region in both arms, wired
// from whichever store or policy the arm installed, so the two arms are scored by exactly the
// same instrument and no arm gets a private path to the scoreboard.
import { defineKind } from '../core/cell.mjs';

defineKind('lab.answer', {
  doc: 'Records the events it receives, verbatim and in order, so an experiment can score them.',
  ports: { in: [{ name: 'in', kinds: ['event'] }], out: [] },
  defaults: { keep: 8192 },
  init: () => ({ seen: [] }),
  compute: (ins, cell) => {
    for (const it of ins[0]) {
      cell.state.seen.push({ t: it.sig.t, data: it.sig.data });
      if (cell.state.seen.length > cell.params.keep) cell.state.seen.shift();
    }
    return [];
  },
  serialize: (s) => ({ seen: s.seen }),
  deserialize: (j) => ({ seen: j.seen || [] }),
  cost: 1,
});

export const LAB_KINDS = Object.freeze(['lab.answer']);

/** The events a lab.answer cell has recorded, oldest first. @param {Brain} brain @param {string} id */
export function answers(brain, id = 'lab.answer') { return brain.cell(id).state.seen; }
/** The last event a lab.answer cell recorded, or null. @param {Brain} brain @param {string} id */
export function lastAnswer(brain, id = 'lab.answer') { const s = brain.cell(id).state.seen; return s.length ? s[s.length - 1] : null; }
