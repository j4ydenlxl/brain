// grow/fixtures/echo-cell/cell.mjs: the sandbox runner's own fixture candidate (grow/CONTRACT.md).
// can(q) is true for exactly one prompt, "h", so a run of it proves the path, not a skill; answer(q) echoes q, so
// every got string in a result shows the row's own q crossed into the sandbox and back unchanged.
// Author: board 37 sandbox builder, 2026-09-30.
export const meta = { id: 'echo-fixture', class: 'fixture', generation: 1, lane: 'fixture', grownFrom: ['h'], version: 1 };

export const REPLY = 'You typed h. Say a whole word or ask a question.';

export function can(q) {
  return q === 'h';
}

export function answer(q) {
  return 'You typed ' + q + '. Say a whole word or ask a question.';
}

export const examples = [{ q: 'h', expect: { notRefusal: true, minWords: 6, contains: ['h'] } }];
