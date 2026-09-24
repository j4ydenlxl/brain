// capability/grid-invent.mjs: THE GRID VOCABULARY INVENTS ITS OWN WORDS (P14).
//
// bench/verdicts/grid.json: capability/grid-search.mjs over the 196 words of
// capability/grid-dsl.mjs solved 148 of 400 ARC-AGI-1 training tasks at 3000 ms and 236 ran out
// of clock. Those 236 are the box: the fixed vocabulary could not reach them in the budget. This
// file grows new words from three sources and lets one into the vocabulary only after it solved
// a task it was not invented from (a HELD OUT task), through the authority gate
// (mind/imagine.mjs keep, kind imagine.keep):
//
//   (i)   COLLAPSE. A composition that solved a task (the depth 2, 3 and 4 programs in
//         grid.json, learned last step removed) becomes ONE named step, plus its siblings
//         generalised over parameters (each word swapped for another of its family: a quarter
//         turn for a half turn, the rare colour for the top colour). A depth 4 program becomes a
//         depth 1 step, so the search reaches what lay past its clock.
//   (ii)  TIMEOUTS. For a task that ran out of clock, a short search records the partial
//         programs whose outputs have the wanted shape and the best pixel agreement with the
//         wanted outputs (colours matched through one map across every train pair, the way the
//         colormap learner would). The best of them, generalised over parameters, are candidate
//         words for OTHER tasks.
//   (iii) IMAGINATION. mind/imagine.mjs propose() over the DSL: combinators the chain grammar
//         cannot express at any depth (a word applied to each object in place, to each cell of a
//         separated grid, to each colour layer; a grid superposed with or laid beside its own
//         transform; four transforms tiled in quarters; a word iterated to its fixed point) and
//         conjugations, each kept only when it sits outside memory (the vocabulary, the solved
//         programs, the words of (i) and (ii)) and outside the recombination null.
//
// A word is a SPEC, plain JSON: { k: 'op', op } | { k: 'chain', ops } | { k: 'each', mode, f } |
// { k: 'cells', f } | { k: 'layers', f } | { k: 'both', how, f, g } | { k: 'quad', fs } |
// { k: 'fix', f }. It runs as a real cell: kind grid.invent, params { spec }. A program that uses
// one is graded the way grid-search.mjs grades every program: wired as a chain of grid.dsl and
// grid.invent cells, every train pair checked by a grid.dsl.match cell, and the test answer is
// what the cells emit.
//
// THE NULL. Every claim here is against a null arm at the same budget: random compositions of
// the fixed vocabulary and pairwise recombinations of the solved programs, as many as the
// invented library holds, admitted to each task by the same ranking, the same count, the same
// cost, the same clock. bench/imagine.mjs runs both arms on the 236 timeouts, interleaved.
import {
  PRIMS, LEARNERS, applyStep, hashValue, sameGrid, isAnswerGrid, isGrid, byName, components, grid, BG, MAX_SIDE,
} from './grid-dsl.mjs';
import { buildSearchBrain } from './grid-search.mjs';
import { defineKind, hasKind } from '../core/cell.mjs';
import { RNG } from '../core/rng.mjs';
import { propose, memoryIndex, noveltyOf, keep } from '../mind/imagine.mjs';

export const INVENT_DEFAULTS = Object.freeze({
  cost: 1,            // search cost of every added word, in both arms: admitted words are tried first
  admit: 32,          // added words admitted to one task's search, in both arms
  mineTop: 4,         // partial programs kept per timed out task
  variantsPer: 6,     // parameter siblings per invented chain
  maxObjects: 40,     // per object lifting refuses a grid with more components than this
  fixSteps: 12,       // a fixed point is looked for this many steps
  rounds: 2,          // rounds of imagination; round 2 nests round 1's words
  doubt: false,       // keep a memorised program as a fallback and search on (see memorised)
});
const now = () => performance.now();
const LEARNER_NAMES = new Set(LEARNERS.map((l) => l.name));
const BASE = new Map(PRIMS.map((p) => [p.name, p]));
const fit = (g) => (g && isGrid(g) && g.w >= 1 && g.h >= 1 && g.w <= MAX_SIDE && g.h <= MAX_SIDE ? g : null);

// ---------------------------------------------------------------- families (generalisation over parameters)
const FAMILY_RULES = [
  [/^(rot90|rot180|rot270|flipH|flipV|transpose|antiTranspose)$/, 'sym'],
  [/^up(\d|ByColors)$/, 'up'], [/^down(\d|Auto)$/, 'down'], [/^tile\d+x\d+$/, 'tile'], [/^mirror/, 'mirror'],
  [/^(left|right|top|bottom)Half$/, 'half'], [/^(and|or|xor|nor|aNotB|bNotA)(LR|TB)$/, 'logic'], [/^overlay/, 'overlay'],
  [/^cells/, 'cells'], [/^gravity/, 'gravity'], [/^slide/, 'slide'], [/^shift/, 'shift'], [/^roll/, 'roll'],
  [/^ray/, 'ray'], [/^pixelRay/, 'pixelRay'], [/^symFill/, 'symFill'], [/^unmask/, 'unmask'], [/^periodic/, 'periodic'],
  [/^extend/, 'extend'], [/^(keep|drop)(Top|Rare)Color$/, 'keepColor'], [/^(cropBBox|cropBBoxMajority|trimBorder|dropBgLines)$/, 'crop'],
  [/^dedupe/, 'dedupe'], [/^(fillEnclosed|outline8|outline4|hollow|bboxObjects|fillBBoxes|frame)$/, 'paint'],
  [/^connect/, 'connect'], [/^recolor/, 'recolor'], [/^objects/, 'objects'],
];
/** The family of one base word: words of one family differ by a parameter. */
export function familyOf(name) {
  const p = BASE.get(name);
  if (!p) return null;
  for (const [re, f] of FAMILY_RULES) if (re.test(name)) return f;
  if (p.from === 'objects' && p.to === 'objects') return 'select';
  if (p.from === 'objects' && p.to === 'grid') return 'render';
  return p.from + '>' + p.to + ':' + name;
}
/** The other words of a word's family with the same input and output types. */
export function siblings(name) {
  const f = familyOf(name), p = BASE.get(name);
  if (!f || !p) return [];
  return PRIMS.filter((q) => q.name !== name && q.from === p.from && q.to === p.to && familyOf(q.name) === f).map((q) => q.name);
}

// ---------------------------------------------------------------- specs
const INVERSE = Object.freeze({ rot90: 'rot270', rot270: 'rot90', rot180: 'rot180', flipH: 'flipH', flipV: 'flipV', transpose: 'transpose', antiTranspose: 'antiTranspose', invert: 'invert' });
export const LIFT_MODES = Object.freeze(['c8', 'm8']);
export const BOTH_HOWS = Object.freeze(['overlay', 'under', 'hcat', 'vcat']);
export const SEL_MODES = Object.freeze(['c4', 'c8']);
/** The base words that pick some objects out of all of them (objects to objects). */
export const SELECTORS = Object.freeze(PRIMS.filter((p) => p.from === 'objects' && p.to === 'objects').map((p) => p.name));
const SELECTOR_SET = new Set(SELECTORS);

/** A chain of one word is that word; anything else is itself. */
export function chainSpec(ops) {
  if (!Array.isArray(ops) || !ops.length) return null;
  return ops.length === 1 ? { k: 'op', op: ops[0] } : { k: 'chain', ops: ops.slice() };
}

/** The canonical key of a spec: equal keys are one word. */
export function specKey(s) {
  if (!s) return 'id';
  switch (s.k) {
    case 'op': return s.op;
    case 'chain': return 'chain(' + s.ops.join(',') + ')';
    case 'each': return 'each.' + s.mode + '(' + specKey(s.f) + ')';
    case 'cells': return 'cells(' + specKey(s.f) + ')';
    case 'layers': return 'layers(' + specKey(s.f) + ')';
    case 'both': return 'both.' + s.how + '(' + specKey(s.f) + ',' + specKey(s.g) + ')';
    case 'quad': return 'quad(' + s.fs.map(specKey).join(',') + ')';
    case 'fix': return 'fix(' + specKey(s.f) + ')';
    case 'sel': return 'sel.' + s.mode + '.' + s.pick + '(' + specKey(s.f) + ')';
    default: return '?';
  }
}
/** The ordered structural tokens of a spec: the hypervector's content in mind/imagine.mjs. */
export function specWords(s) {
  if (!s) return ['id'];
  switch (s.k) {
    case 'op': return [s.op];
    case 'chain': return s.ops.slice();
    case 'each': return ['each', s.mode, ...specWords(s.f)];
    case 'cells': return ['cells', ...specWords(s.f)];
    case 'layers': return ['layers', ...specWords(s.f)];
    case 'both': return ['both', s.how, ...specWords(s.f), ...specWords(s.g)];
    case 'quad': return ['quad', ...s.fs.flatMap(specWords)];
    case 'fix': return ['fix', ...specWords(s.f)];
    case 'sel': return ['sel', s.mode, s.pick, ...specWords(s.f)];
    default: return ['?'];
  }
}
/** A readable title, the text the knowledge corpus is asked for an exact article title. */
export function specTitle(s) { return specWords(s).join(' '); }

/** The input and output types of a spec, or null when it does not type check. */
export function specType(s) {
  if (!s) return { from: 'grid', to: 'grid' };
  const gg = (x) => { const t = specType(x); return !!t && t.from === 'grid' && t.to === 'grid'; };
  switch (s.k) {
    case 'op': { const p = BASE.get(s.op); return p ? { from: p.from, to: p.to } : null; }
    case 'chain': {
      if (!Array.isArray(s.ops) || !s.ops.length) return null;
      let from = null, t = null;
      for (const op of s.ops) {
        const p = BASE.get(op);
        if (!p) return null;
        if (t === null) { from = p.from; t = p.to; continue; }
        if (p.from !== t) return null;
        t = p.to;
      }
      return { from, to: t };
    }
    case 'each': return LIFT_MODES.includes(s.mode) && gg(s.f) ? { from: 'grid', to: 'grid' } : null;
    case 'cells': case 'layers': case 'fix': return gg(s.f) ? { from: 'grid', to: 'grid' } : null;
    case 'both': return BOTH_HOWS.includes(s.how) && (s.f === null || gg(s.f)) && gg(s.g) ? { from: 'grid', to: 'grid' } : null;
    case 'quad': return Array.isArray(s.fs) && s.fs.length === 4 && s.fs.every((f) => f === null || gg(f)) ? { from: 'grid', to: 'grid' } : null;
    case 'sel': return SEL_MODES.includes(s.mode) && SELECTOR_SET.has(s.pick) && gg(s.f) ? { from: 'grid', to: 'grid' } : null;
    default: return null;
  }
}
/** A spec that type checks grid to grid. */
export const isGridWord = (s) => { const t = specType(s); return !!t && t.from === 'grid' && t.to === 'grid'; };

// ---------------------------------------------------------------- the combinators
const blank = (w, h) => grid(w, h); // BG is 0, a fresh grid is all background
const pasteOver = (out, r, ox, oy) => {
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const c = r.cells[y * r.w + x];
    if (c === BG) continue;
    const X = ox + x, Y = oy + y;
    if (X < 0 || Y < 0 || X >= out.w || Y >= out.h) continue;
    out.cells[Y * out.w + X] = c;
  }
};
/** f applied to each object alone (cut out on background), pasted back centred on its box. */
export function eachObject(g, mode, f) {
  const list = components(g, mode);
  if (!list.length || list.length > INVENT_DEFAULTS.maxObjects) return null;
  const out = blank(g.w, g.h);
  for (const o of list) {
    const w = o.x1 - o.x0 + 1, h = o.y1 - o.y0 + 1;
    const s = blank(w, h);
    for (const i of o.idx) { const x = i % g.w, y = (i / g.w) | 0; s.cells[(y - o.y0) * w + (x - o.x0)] = g.cells[i]; }
    const r = f(s);
    if (!r || !isGrid(r)) return null;
    pasteOver(out, r, o.x0 + Math.floor((w - r.w) / 2), o.y0 + Math.floor((h - r.h) / 2));
  }
  return out;
}
/**
 * f applied to the objects one base selector picks (each cut out on background, pasted back
 * centred on its box); every other cell of the grid is left as it was.
 */
export function eachSelected(g, mode, pick, f) {
  const all = applyStep({ op: 'objects' + mode.toUpperCase() }, g);
  if (!all || !Array.isArray(all.list) || !all.list.length || all.list.length > INVENT_DEFAULTS.maxObjects) return null;
  const chosen = applyStep({ op: pick }, all);
  if (!chosen || !Array.isArray(chosen.list) || !chosen.list.length) return null;
  const out = { w: g.w, h: g.h, cells: g.cells.slice() };
  const cuts = [];
  for (const o of chosen.list) {
    const w = o.x1 - o.x0 + 1, h = o.y1 - o.y0 + 1, c = blank(w, h);
    for (const i of o.idx) { const x = i % g.w, y = (i / g.w) | 0; c.cells[(y - o.y0) * w + (x - o.x0)] = g.cells[i]; out.cells[i] = BG; }
    cuts.push({ o, c, w, h });
  }
  for (const { o, c, w, h } of cuts) {
    const r = f(c);
    if (!r || !isGrid(r)) return null;
    pasteOver(out, r, o.x0 + Math.floor((w - r.w) / 2), o.y0 + Math.floor((h - r.h) / 2));
  }
  return out;
}
/** The cells of a grid cut by full rows and columns of one separator colour, or null. */
export function partitionOf(g) {
  const present = new Set(g.cells);
  for (const c of [...present].sort((a, b) => a - b)) {
    if (c === BG || c > 9) continue;
    const rows = [], cols = [];
    for (let y = 0; y < g.h; y++) { let all = true; for (let x = 0; x < g.w; x++) if (g.cells[y * g.w + x] !== c) { all = false; break; } if (all) rows.push(y); }
    for (let x = 0; x < g.w; x++) { let all = true; for (let y = 0; y < g.h; y++) if (g.cells[y * g.w + x] !== c) { all = false; break; } if (all) cols.push(x); }
    if (!rows.length && !cols.length) continue;
    const seg = (cuts, n) => { const out = []; let s = 0; for (const k of [...cuts, n]) { if (k > s) out.push([s, k - s]); s = k + 1; } return out; };
    const rs = seg(rows, g.h), cs = seg(cols, g.w);
    const cells = [];
    for (const [y, h] of rs) for (const [x, w] of cs) cells.push({ x, y, w, h });
    if (cells.length >= 2) return { color: c, cells };
  }
  return null;
}
/** f applied to each separated cell of the grid, each result written back in place. */
export function eachCell(g, f) {
  const p = partitionOf(g);
  if (!p) return null;
  const out = { w: g.w, h: g.h, cells: g.cells.slice() };
  for (const r of p.cells) {
    const s = blank(r.w, r.h);
    for (let j = 0; j < r.h; j++) s.cells.set(g.cells.subarray((r.y + j) * g.w + r.x, (r.y + j) * g.w + r.x + r.w), j * r.w);
    const o = f(s);
    if (!o || !isGrid(o) || o.w !== r.w || o.h !== r.h) return null;
    for (let j = 0; j < r.h; j++) out.cells.set(o.cells.subarray(j * r.w, j * r.w + r.w), (r.y + j) * g.w + r.x);
  }
  return out;
}
/** f applied to each colour layer alone, the layers laid back in ascending colour order. */
export function eachLayer(g, f) {
  const colours = [...new Set(g.cells)].filter((c) => c !== BG).sort((a, b) => a - b);
  if (colours.length < 2 || colours.length > 9) return null;
  const out = blank(g.w, g.h);
  for (const c of colours) {
    const L = blank(g.w, g.h);
    for (let i = 0; i < g.cells.length; i++) if (g.cells[i] === c) L.cells[i] = c;
    const r = f(L);
    if (!r || !isGrid(r) || r.w !== g.w || r.h !== g.h) return null;
    pasteOver(out, r, 0, 0);
  }
  return out;
}
/** Two grids made from one input, superposed or laid side by side. */
export function combine(a, b, how) {
  if (how === 'overlay') {
    if (a.w !== b.w || a.h !== b.h) return null;
    const out = { w: a.w, h: a.h, cells: a.cells.slice() };
    pasteOver(out, b, 0, 0);
    return out;
  }
  if (how === 'under') {
    // the input's own cells win: b only paints where a is background
    if (a.w !== b.w || a.h !== b.h) return null;
    const out = { w: b.w, h: b.h, cells: b.cells.slice() };
    pasteOver(out, a, 0, 0);
    return out;
  }
  if (how === 'hcat') {
    if (a.h !== b.h) return null;
    const out = blank(a.w + b.w, a.h);
    for (let y = 0; y < a.h; y++) { out.cells.set(a.cells.subarray(y * a.w, y * a.w + a.w), y * out.w); out.cells.set(b.cells.subarray(y * b.w, y * b.w + b.w), y * out.w + a.w); }
    return out;
  }
  if (how === 'vcat') {
    if (a.w !== b.w) return null;
    const out = blank(a.w, a.h + b.h);
    out.cells.set(a.cells, 0); out.cells.set(b.cells, a.cells.length);
    return out;
  }
  return null;
}
function quadOf(parts) {
  const [a, b, c, d] = parts;
  if (!parts.every((p) => p && isGrid(p) && p.w === a.w && p.h === a.h)) return null;
  const top = combine(a, b, 'hcat'), bottom = combine(c, d, 'hcat');
  return top && bottom ? combine(top, bottom, 'vcat') : null;
}

/**
 * Run one word on one value: a base word through grid-dsl.mjs applyStep, a combinator here.
 * @param {object|null} spec null is the identity
 * @param {object} v a grid, objects or colour value
 * @returns {object|null}
 */
export function runSpec(spec, v) {
  if (!v) return null;
  if (!spec) return v;
  switch (spec.k) {
    case 'op': return applyStep({ op: spec.op }, v);
    case 'chain': { let x = v; for (const op of spec.ops) { x = applyStep({ op }, x); if (!x) return null; } return x; }
    case 'each': return isGrid(v) ? fit(eachObject(v, spec.mode, (g) => runSpec(spec.f, g))) : null;
    case 'cells': return isGrid(v) ? fit(eachCell(v, (g) => runSpec(spec.f, g))) : null;
    case 'layers': return isGrid(v) ? fit(eachLayer(v, (g) => runSpec(spec.f, g))) : null;
    case 'both': {
      if (!isGrid(v)) return null;
      const a = runSpec(spec.f, v), b = runSpec(spec.g, v);
      return a && b && isGrid(a) && isGrid(b) ? fit(combine(a, b, spec.how)) : null;
    }
    case 'quad': return isGrid(v) ? fit(quadOf(spec.fs.map((f) => runSpec(f, v)))) : null;
    case 'sel': return isGrid(v) ? fit(eachSelected(v, spec.mode, spec.pick, (g) => runSpec(spec.f, g))) : null;
    case 'fix': {
      if (!isGrid(v)) return null;
      let x = runSpec(spec.f, v);
      if (!x || !isGrid(x)) return null;
      for (let i = 0; i < INVENT_DEFAULTS.fixSteps; i++) {
        const y = runSpec(spec.f, x);
        if (!y || !isGrid(y) || sameGrid(y, x)) return x;
        x = y;
      }
      return x;
    }
    default: return null;
  }
}

/**
 * A word as the search sees it: a primitive with a name, types, a cost and a pure apply.
 * @param {{spec: object, key?: string, sources?: string[]}} c
 * @param {number} [cost]
 */
export function asPrimitive(c, cost = INVENT_DEFAULTS.cost) {
  const t = specType(c.spec);
  if (!t) return null;
  const key = c.key || specKey(c.spec);
  return Object.freeze({ name: 'inv:' + key, key, from: t.from, to: t.to, cost, spec: c.spec, invented: true, apply: (v) => { const r = runSpec(c.spec, v); return r && isGrid(r) ? fit(r) : r; } });
}

// ---------------------------------------------------------------- the cells
const lastSig = (mail) => (mail.length ? mail[mail.length - 1].sig : null);
if (!hasKind('grid.invent')) {
  defineKind('grid.invent', {
    doc: 'One invented word of capability/grid-invent.mjs: params.spec is its JSON program (a chain of grid.dsl words, or a combinator over them: per object, per separated cell, per colour layer, superposed, side by side, in quarters, iterated to a fixed point). Emits the value the word makes, or nothing when it refuses.',
    ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
    defaults: { spec: null },
    compute: (ins, cell) => {
      const sig = lastSig(ins[0]);
      if (!sig) return [null];
      const out = runSpec(cell.params.spec, sig.data);
      return [out ? { kind: 'event', data: out } : null];
    },
  });
}

let wireSeq = 0;
/** Wire a program (base, learned and invented steps) as cells; push one input; read the cells. */
export function runInventCells(brain, steps, input, want = null) {
  const tag = 'inv' + (wireSeq++);
  const ids = steps.map((s, i) => {
    const id = tag + '.' + i;
    if (s.spec) brain.addCell({ id, kind: 'grid.invent', region: 'cognitive', circuit: 'grid', params: { spec: s.spec }, policy: { period: 'event' } });
    else brain.addCell({ id, kind: 'grid.dsl', region: 'cognitive', circuit: 'grid', params: { op: s.op, learned: s.learned ?? null }, policy: { period: 'event' } });
    if (i > 0) brain.connect(tag + '.' + (i - 1), 'out', id, 'in');
    return id;
  });
  let matchId = null;
  if (want) {
    matchId = tag + '.match';
    brain.addCell({ id: matchId, kind: 'grid.dsl.match', region: 'cognitive', circuit: 'grid', policy: { period: 'event' } });
    if (ids.length) brain.connect(ids[ids.length - 1], 'out', matchId, 'a');
    else brain.inject(matchId, 'a', { kind: 'event', data: input });
    brain.inject(matchId, 'b', { kind: 'event', data: want });
  }
  if (ids.length) brain.inject(ids[0], 'in', { kind: 'event', data: input });
  brain.tick(steps.length + 2);
  const out = brain.takeOutbox();
  if (want) {
    const idx = brain.cell(matchId).idx;
    const sig = out.filter((s) => s.src === idx).pop();
    return { match: sig ? sig.data : null, cells: ids.length + 1 };
  }
  if (!ids.length) return { value: input, cells: 0 };
  const idx = brain.cell(ids[ids.length - 1]).idx;
  const sig = out.filter((s) => s.src === idx).pop();
  return { value: sig ? sig.data : null, cells: ids.length };
}
/** Grade a program on the train pairs through match cells, then answer the tests through cells. */
export function gradeInvented(steps, train, tests, brain = buildSearchBrain('grid.invent')) {
  let cells = 0;
  for (const p of train) {
    const r = runInventCells(brain, steps, p.input, p.output);
    cells += r.cells;
    if (!r.match || !r.match.equal) return { ok: false, cells, reason: 'a match cell said a train pair differs' };
  }
  const outputs = [];
  for (const t of tests) {
    const r = runInventCells(brain, steps, t);
    cells += r.cells;
    if (!r.value || !isAnswerGrid(r.value)) return { ok: false, cells, reason: 'the cells made no answer grid for a test input' };
    outputs.push(r.value);
  }
  return { ok: true, cells, outputs };
}

// ---------------------------------------------------------------- pixel agreement
/**
 * How much of the wanted outputs a set of grids already is, colours matched through ONE map from
 * made colour to wanted colour across every pair (the map the colormap learner would read).
 * 0 when any pair has the wrong shape.
 */
export function mappedAgreement(made, wanted) {
  const co = new Map();
  let total = 0;
  for (let d = 0; d < made.length; d++) {
    const a = made[d], b = wanted[d];
    if (!a || !isGrid(a) || a.w !== b.w || a.h !== b.h) return 0;
    for (let i = 0; i < a.cells.length; i++) { const k = a.cells[i] * 16 + b.cells[i]; co.set(k, (co.get(k) || 0) + 1); }
    total += a.cells.length;
  }
  const best = new Map();
  for (const [k, n] of co) { const c = Math.floor(k / 16); if (n > (best.get(c) || 0)) best.set(c, n); }
  let s = 0;
  for (const n of best.values()) s += n;
  return total ? s / total : 0;
}

// ---------------------------------------------------------------- the search
function stateKey(vals, type) {
  let a = type === 'grid' ? 17 : type === 'objects' ? 31 : 47, b = 0x2545f491;
  for (const v of vals) {
    const h = hashValue(v);
    a = Math.imul(a ^ (h % 1000000007), 0x01000193) >>> 0;
    b = Math.imul(b ^ Math.floor(h / 1000000007), 0x5bd1e995) >>> 0;
  }
  return a * 2097152 + (b & 0x1fffff);
}
const FAST = LEARNERS.filter((l) => l.name === 'colormap');
const SLOW = LEARNERS.filter((l) => l.name !== 'colormap');
/** The DSL's top learner cost: its neighbourhood and template learners (localRule, stamp, rayLearned). */
export const DOUBT_COST = Math.max(...LEARNERS.map((l) => l.cost));
/**
 * A learner memorised the train pairs when, refit on all pairs but one, it predicts NONE of the
 * pairs left out. Only learners of the DSL's top cost are asked: a colour map is not, since a right
 * colour map often needs every pair to see every colour. Reads the train pairs only.
 */
export function memorised(L, tr, wanted) {
  if (!L || !(L.cost >= DOUBT_COST) || tr.length < 2) return false;
  for (let i = 0; i < tr.length; i++) {
    const trX = tr.filter((_, j) => j !== i), wX = wanted.filter((_, j) => j !== i);
    let p = null;
    try { p = L.learn(trX, wX, [tr[i]]); } catch { p = null; }
    const g = p ? applyStep({ op: L.name, learned: p }, tr[i]) : null;
    if (g && sameGrid(g, wanted[i])) return false;
  }
  return true;
}

/**
 * capability/grid-search.mjs searchGrid with added words: the same uniform cost order, memoised
 * states, exact train pair pruning, wall clock, placeholder and unchanged-input refusals, and
 * cell grading; the added words are tried before the base words of equal cost. With opts.mine
 * above zero it also records the best partial programs by mapped pixel agreement.
 * @param {{train: object[], test: object[]}} task grids in the DSL's form
 * @param {object[]} extras primitives from asPrimitive()
 * @param {object} [opts] budgetMs, deadline, maxDepth, slowDepth, maxStates, mine
 */
export function searchWith(task, extras = [], opts = {}) {
  const o = { budgetMs: 3000, maxDepth: 4, slowDepth: 2, maxStates: 200_000, mine: 0, doubt: INVENT_DEFAULTS.doubt, ...opts };
  const t0 = now(), deadline = typeof o.deadline === 'number' ? o.deadline : t0 + o.budgetMs;
  const vocab = extras.concat(PRIMS);
  const train = task.train, tests = task.test.map((t) => t.input || t);
  const nTrain = train.length, wanted = train.map((p) => p.output);
  const alwaysChanges = train.every((p) => !sameGrid(p.input, p.output));
  let searched = 0, rejected = 0, stored = 0, cellsUsed = 0;
  let fallback = null, doubted = 0; // with o.doubt: the first memorised program found, and how many were
  const popped = [], seen = new Map(), buckets = [], heads = [];
  let minCost = 0;
  const mined = [];
  const baseline = o.mine ? mappedAgreement(train.map((p) => p.input), wanted) : 0;
  const mineAt = (vals, steps, cost) => {
    const tr = vals.slice(0, nTrain);
    for (let i = 0; i < nTrain; i++) if (tr[i].w !== wanted[i].w || tr[i].h !== wanted[i].h) return;
    const a = mappedAgreement(tr, wanted);
    if (a <= baseline) return;
    if (mined.length >= o.mine && a <= mined[mined.length - 1].agreement) return;
    mined.push({ ops: steps.map((s) => s.op), agreement: Math.round(a * 1e4) / 1e4, cost });
    mined.sort((x, y) => y.agreement - x.agreement || x.cost - y.cost || (x.ops.join() < y.ops.join() ? -1 : 1));
    if (mined.length > o.mine) mined.length = o.mine;
  };

  const finish = (status0, hit0) => {
    // a memorised program found earlier answers only when the search ends without a better one
    const hit = hit0 || fallback, status = hit0 ? status0 : fallback ? 'found' : status0;
    return {
    status, doubted, fromFallback: !hit0 && !!fallback, steps: hit ? hit.steps : null, names: hit ? hit.steps.map((s) => s.op) : null,
    depth: hit ? hit.steps.length : null, outputs: hit ? hit.outputs : null,
    used: hit ? hit.steps.filter((s) => s.spec).map((s) => s.op.slice(4)) : [],
    searched, states: seen.size, rejected, popped, ms: Math.round((now() - t0) * 100) / 100, cells: cellsUsed,
    vocabulary: vocab.length + LEARNERS.length, mined: o.mine ? mined : undefined, baseline: o.mine ? Math.round(baseline * 1e4) / 1e4 : undefined,
    };
  };
  const accept = (steps, testOuts) => {
    if (!testOuts.every((g) => g && isAnswerGrid(g))) { rejected++; return null; }
    if (alwaysChanges && testOuts.some((g, i) => sameGrid(g, tests[i]))) { rejected++; return null; }
    const graded = gradeInvented(steps, train, tests);
    cellsUsed += graded.cells;
    if (!graded.ok) { rejected++; return null; }
    for (let i = 0; i < testOuts.length; i++) if (!sameGrid(graded.outputs[i], testOuts[i])) { rejected++; return null; }
    return { steps, outputs: graded.outputs };
  };
  const terminals = (state, learners, exact) => {
    if (state.type !== 'grid') return null;
    const tr = state.vals.slice(0, nTrain), te = state.vals.slice(nTrain);
    if (exact) {
      searched++;
      let all = true;
      for (let i = 0; i < nTrain; i++) if (!sameGrid(tr[i], wanted[i])) { all = false; break; }
      if (all) { const r = accept(state.steps, te); if (r) return r; }
    }
    for (const L of learners) {
      if (now() > deadline) return null;
      searched++;
      let params = null;
      try { params = L.learn(tr, wanted, te); } catch { params = null; }
      if (!params) continue;
      const step = { op: L.name, learned: params };
      let fits = true;
      for (let i = 0; i < nTrain; i++) { const g = applyStep(step, tr[i]); if (!g || !sameGrid(g, wanted[i])) { fits = false; break; } }
      if (!fits) continue;
      const r = accept(state.steps.concat([step]), te.map((g) => applyStep(step, g)));
      if (r && o.doubt && memorised(L, tr, wanted)) { doubted++; if (!fallback) fallback = r; continue; }
      if (r) return r;
    }
    return null;
  };
  const conflicts = (vals) => {
    for (let i = 0; i < nTrain; i++) for (let j = i + 1; j < nTrain; j++) {
      if (hashValue(vals[i]) === hashValue(vals[j]) && !sameGrid(wanted[i], wanted[j])) return true;
    }
    return false;
  };
  const push = (s) => {
    if (stored >= o.maxStates) return;
    stored++;
    (buckets[s.cost] || (buckets[s.cost] = [], heads[s.cost] = 0, buckets[s.cost])).push(s);
    if (s.cost < minCost) minCost = s.cost;
  };
  const pop = () => {
    for (let c = minCost; c < buckets.length; c++) {
      const b = buckets[c];
      if (b && heads[c] < b.length) { minCost = c; const s = b[heads[c]]; b[heads[c]++] = null; return s; }
    }
    return null;
  };

  const root = { vals: train.map((p) => p.input).concat(tests), type: 'grid', steps: [], depth: 0, cost: 0 };
  seen.set(stateKey(root.vals, 'grid'), 0);
  const r0 = terminals(root, FAST.concat(SLOW), true);
  if (r0) return finish('found', r0);
  push(root);
  for (;;) {
    const s = pop();
    if (!s) return finish('exhausted', null);
    popped[s.depth] = (popped[s.depth] || 0) + 1;
    if (s.depth > 0 && s.depth <= o.slowDepth && s.type === 'grid') {
      const r = terminals(s, SLOW, false);
      if (r) return finish('found', r);
      if (now() > deadline) return finish('timeout', null);
    }
    for (const p of vocab) {
      if (p.from !== s.type) continue;
      if (now() > deadline) return finish('timeout', null);
      const vals = new Array(s.vals.length);
      let bad = false;
      for (let i = 0; i < s.vals.length; i++) {
        let v = null;
        try { v = p.apply(s.vals[i]); } catch { v = null; }
        if (!v) { bad = true; break; }
        vals[i] = v;
      }
      if (bad) continue;
      searched++;
      const depth = s.depth + 1;
      const key = stateKey(vals, p.to);
      const had = seen.get(key);
      if (had !== undefined && had <= depth) continue;
      seen.set(key, depth);
      if (conflicts(vals)) continue;
      const step = p.invented ? { op: p.name, spec: p.spec } : { op: p.name };
      const child = { vals, type: p.to, steps: s.steps.concat([step]), depth, cost: s.cost + p.cost };
      if (child.type === 'grid') {
        if (o.mine && !p.invented) mineAt(vals, child.steps, child.cost);
        const r = terminals(child, FAST, true);
        if (r) return finish('found', r);
      }
      if (depth < o.maxDepth) push(child);
    }
  }
}

/** One ARC task through searchWith, graded against its test outputs when the JSON has them. */
export function solveWith(json, extras, opts = {}) {
  const task = { train: json.train.map((p) => ({ input: fromArcRows(p.input), output: fromArcRows(p.output) })), test: json.test.map((p) => ({ input: fromArcRows(p.input) })) };
  const r = searchWith(task, extras, opts);
  let solved = null;
  if (json.test.every((t) => Array.isArray(t.output))) {
    solved = !!r.outputs && json.test.every((t, i) => sameGrid(r.outputs[i], fromArcRows(t.output)));
  }
  return { ...r, solved, steps: undefined, outputs: undefined };
}
function fromArcRows(rows) {
  const h = rows.length, w = rows[0].length, g = grid(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) g.cells[y * w + x] = rows[y][x];
  return g;
}
/** An ARC JSON task in the DSL's grids. */
export function arcTask(json) {
  return { train: json.train.map((p) => ({ input: fromArcRows(p.input), output: fromArcRows(p.output) })), test: json.test.map((p) => ({ input: fromArcRows(p.input), output: Array.isArray(p.output) ? fromArcRows(p.output) : null })) };
}

// ---------------------------------------------------------------- admission to one task
/**
 * How much of the change a train pair asks for a word already made: over every pair, with ONE
 * colour map from made colour to wanted colour, the cells that had to change and now match,
 * minus the cells that were right and now do not, over the cells that had to change. 1 is the
 * whole change made (up to a colour map the colormap learner reads), 0 is no better than the
 * input, negative is worse. When the wanted shape differs from the input's, it is plain mapped
 * agreement. -1 when a made grid has the wrong shape.
 */
export function improvement(made, inputs, wanted) {
  for (let d = 0; d < made.length; d++) if (!made[d] || made[d].w !== wanted[d].w || made[d].h !== wanted[d].h) return -1;
  const sameShape = inputs.every((g, d) => g.w === wanted[d].w && g.h === wanted[d].h);
  if (!sameShape) return mappedAgreement(made, wanted);
  const co = new Map();
  for (let d = 0; d < made.length; d++) {
    const a = made[d].cells, b = wanted[d].cells;
    for (let i = 0; i < a.length; i++) { const k = a[i] * 16 + b[i]; co.set(k, (co.get(k) || 0) + 1); }
  }
  const map = new Map(), top = new Map();
  for (const [k, n] of co) { const c = Math.floor(k / 16); if (n > (top.get(c) || 0)) { top.set(c, n); map.set(c, k % 16); } }
  let need = 0, fixed = 0, broken = 0;
  for (let d = 0; d < made.length; d++) {
    const a = made[d].cells, b = wanted[d].cells, x = inputs[d].cells;
    for (let i = 0; i < a.length; i++) {
      const ok = map.get(a[i]) === b[i];
      if (x[i] !== b[i]) { need++; if (ok) fixed++; } else if (!ok) broken++;
    }
  }
  return need ? (fixed - broken) / need : -1;
}

/**
 * Rank a library of words for one task by what each does to the task's train inputs (only the
 * train pairs and the test INPUTS are read; the test outputs never are) and admit the top k.
 * Two stages under one clock: every word is run on the first train input and scored there
 * (a refusal, the wrong shape or no change drops it), the best 4k are run on every train input
 * and every test input and scored by improvement(). Ties break by key, so the order of the
 * library cannot decide. The same function admits the null arm's words.
 * @returns {{admitted: object[], screened: number, scored: number, ms: number, cut: boolean}}
 */
export function admitFor(library, task, k = INVENT_DEFAULTS.admit, deadline = Infinity) {
  const t0 = now();
  const ins = task.train.map((p) => p.input), wanted = task.train.map((p) => p.output), tests = task.test.map((t) => t.input || t);
  const byKey = (a, b) => b.score - a.score || (a.c.key < b.c.key ? -1 : a.c.key > b.c.key ? 1 : 0);
  const first = [];
  let screened = 0, cut = false;
  for (const c of library) {
    if ((screened & 15) === 0 && now() > deadline) { cut = true; break; }
    screened++;
    const r = runSpec(c.spec, ins[0]);
    if (!r || !isGrid(r) || sameGrid(r, ins[0])) continue;
    const s = improvement([r], [ins[0]], [wanted[0]]);
    first.push({ c, score: s, r0: r });
  }
  first.sort(byKey);
  const scored = [];
  for (const f of first.slice(0, 4 * k)) {
    if (now() > deadline) { cut = true; break; }
    const outs = [f.r0];
    let ok = true;
    for (let i = 1; i < ins.length; i++) { const r = runSpec(f.c.spec, ins[i]); if (!r || !isGrid(r)) { ok = false; break; } outs.push(r); }
    if (!ok) continue;
    for (const g of tests) { const r = runSpec(f.c.spec, g); if (!r || !isGrid(r)) { ok = false; break; } }
    if (!ok) continue;
    scored.push({ c: f.c, score: improvement(outs, ins, wanted) });
  }
  scored.sort(byKey);
  return { admitted: scored.slice(0, k).map((s) => s.c), screened, scored: scored.length, ms: Math.round((now() - t0) * 100) / 100, cut };
}

// ---------------------------------------------------------------- source (i): collapse
/** The part of a solved program the search could reuse: its words minus a learned last step. */
export function unlearned(names) {
  const ops = (names || []).slice();
  while (ops.length && LEARNER_NAMES.has(ops[ops.length - 1])) ops.pop();
  return ops.every((op) => BASE.has(op)) ? ops : [];
}
/** Every variant of a chain with one word swapped for a family sibling. */
export function generalise(ops, limit = INVENT_DEFAULTS.variantsPer) {
  const out = [];
  for (let i = 0; i < ops.length && out.length < limit; i++) {
    for (const s of siblings(ops[i])) {
      const v = ops.slice(); v[i] = s;
      const spec = chainSpec(v);
      if (isGridWord(spec)) out.push(v);
      if (out.length >= limit) break;
    }
  }
  return out;
}
const word = (spec, source, sources, extra = {}) => ({ spec, key: specKey(spec), source, sources: [...new Set(sources)].sort(), ...extra });
function mergeInto(map, c) {
  const had = map.get(c.key);
  if (!had) { map.set(c.key, c); return; }
  had.sources = [...new Set([...had.sources, ...c.sources])].sort();
}
/**
 * Source (i): every contiguous run of two or more unlearned words of a solved program that
 * type checks grid to grid, collapsed into one word, plus its parameter siblings.
 * @param {{id: string, names: string[]}[]} solved rows of bench/verdicts/grid.json with solved true
 */
export function collapseSolved(solved) {
  const map = new Map();
  for (const r of solved) {
    const ops = unlearned(r.names);
    for (let a = 0; a < ops.length; a++) for (let b = a + 2; b <= ops.length; b++) {
      const run = ops.slice(a, b), spec = chainSpec(run);
      if (!isGridWord(spec)) continue;
      mergeInto(map, word(spec, 'collapse', [r.id]));
      for (const v of generalise(run)) mergeInto(map, word(chainSpec(v), 'collapse.generalised', [r.id]));
    }
  }
  return [...map.values()];
}
/**
 * Source (ii): the mined partial programs of timed out tasks (two words or more), each with its
 * parameter siblings; a word's sources are the tasks it was mined from.
 * @param {{id: string, mined: {ops: string[], agreement: number}[]}[]} rows
 */
export function fromTimeouts(rows) {
  const map = new Map();
  for (const r of rows) for (const m of r.mined || []) {
    if (m.ops.length < 2) continue;
    const spec = chainSpec(m.ops);
    if (!isGridWord(spec)) continue;
    mergeInto(map, word(spec, 'timeout', [r.id], { agreement: m.agreement }));
    for (const v of generalise(m.ops)) mergeInto(map, word(chainSpec(v), 'timeout.generalised', [r.id]));
  }
  return [...map.values()];
}

// ---------------------------------------------------------------- source (iii): imagination over the DSL
const GRID_WORDS = PRIMS.filter((p) => p.from === 'grid' && p.to === 'grid').map((p) => p.name);
const SYM = ['rot90', 'rot180', 'rot270', 'flipH', 'flipV', 'transpose', 'antiTranspose'];
const BY_FROM = { grid: PRIMS.filter((p) => p.from === 'grid'), objects: PRIMS.filter((p) => p.from === 'objects'), color: PRIMS.filter((p) => p.from === 'color') };

/** A random composition of two or three base words that type checks grid to grid (the null). */
export function randomChain(rng) {
  for (let tries = 0; tries < 64; tries++) {
    const d = 2 + rng.int(2);
    let type = 'grid';
    const ops = [];
    for (let i = 0; i < d; i++) {
      const pool = i === d - 1 ? BY_FROM[type].filter((p) => p.to === 'grid') : BY_FROM[type];
      if (!pool.length) break;
      const p = rng.pick(pool);
      ops.push(p.name); type = p.to;
    }
    if (ops.length === d && type === 'grid') return chainSpec(ops);
  }
  return null;
}
const opsOf = (spec) => (!spec ? [] : spec.k === 'op' ? [spec.op] : spec.k === 'chain' ? spec.ops : null);
/** A pairwise recombination of two memory words: a prefix of one then a suffix of the other (the null). */
export function recombineChains(a, b, rng) {
  const x = opsOf(a && a.spec), y = opsOf(b && b.spec);
  if (!x || !y || !x.length || !y.length) return null;
  for (let tries = 0; tries < 16; tries++) {
    const i = 1 + rng.int(x.length), j = rng.int(y.length);
    const ops = x.slice(0, i).concat(y.slice(j));
    if (ops.length < 2 || ops.length > 4) continue;
    const spec = chainSpec(ops);
    if (isGridWord(spec)) return { spec };
  }
  return null;
}

/**
 * The space mind/imagine.mjs propose() imagines in over the DSL. Its operators build words the
 * chain grammar cannot say (lift, superpose, quarter, fixed point) and conjugations and
 * analogies of what memory holds; its null is randomChain and recombineChains.
 * @param {{memoryChains?: object[]}} [opts] grid to grid chains from memory, raw material for
 *   conjugation and analogy
 */
export function dslSpace(opts = {}) {
  const chains = (opts.memoryChains || []).filter((c) => c && c.spec && isGridWord(c.spec) && opsOf(c.spec));
  const inners = (opts.inners || []).filter((c) => c && c.spec && isGridWord(c.spec));
  const pickInner = (rng) => {
    if (inners.length && rng.int(2) === 0) return rng.pick(inners).spec;
    return chains.length && rng.int(4) === 0 ? rng.pick(chains).spec : { k: 'op', op: rng.pick(GRID_WORDS) };
  };
  const make = (spec) => (spec && isGridWord(spec) ? { spec } : null);
  return {
    type: 'primitive',
    key: (c) => specKey(c.spec),
    words: (c) => specWords(c.spec),
    title: (c) => specTitle(c.spec),
    valid: (c) => !!c && isGridWord(c.spec),
    random: (rng) => { const s = randomChain(rng); return s ? { spec: s } : null; },
    recombine: (a, b, rng) => recombineChains(a, b, rng),
    operators: [
      { name: 'lift.object', make: (m, rng) => make({ k: 'each', mode: rng.pick(LIFT_MODES), f: pickInner(rng) }) },
      { name: 'lift.cell', make: (m, rng) => make({ k: 'cells', f: pickInner(rng) }) },
      { name: 'lift.layer', make: (m, rng) => make({ k: 'layers', f: pickInner(rng) }) },
      { name: 'superpose', make: (m, rng) => make({ k: 'both', how: rng.pick(BOTH_HOWS), f: null, g: pickInner(rng) }) },
      { name: 'quarter', make: (m, rng) => make({ k: 'quad', fs: [null, { k: 'op', op: rng.pick(SYM) }, { k: 'op', op: rng.pick(SYM) }, { k: 'op', op: rng.pick(SYM) }] }) },
      { name: 'fixpoint', make: (m, rng) => make({ k: 'fix', f: pickInner(rng) }) },
      { name: 'lift.select', make: (m, rng) => make({ k: 'sel', mode: rng.pick(SEL_MODES), pick: rng.pick(SELECTORS), f: pickInner(rng) }) },
      {
        name: 'conjugate',
        make: (m, rng) => {
          const t = rng.pick([...SYM, 'invert']);
          const inner = opsOf(pickInner(rng));
          return inner && inner.length <= 2 ? make(chainSpec([t, ...inner, INVERSE[t]])) : null;
        },
      },
      {
        name: 'analogy',
        make: (m, rng) => {
          const src = chains.length ? rng.pick(chains) : null;
          const ops = src ? opsOf(src.spec) : null;
          if (!ops || !ops.length) return null;
          const i = rng.int(ops.length), sib = siblings(ops[i]);
          if (!sib.length) return null;
          const v = ops.slice(); v[i] = rng.pick(sib);
          return make(chainSpec(v));
        },
      },
    ],
  };
}

/**
 * Source (iii): imagine over the DSL. Memory is the base vocabulary (each word alone), the solved
 * programs and every word (i) and (ii) invented; the candidates come back outside all of it and
 * outside the null.
 * @returns {{words: object[], report: object}}
 */
export function imagineWords({ memory, budget = 400, seed = 'grid-invent', floor, knowledge = null, rounds = INVENT_DEFAULTS.rounds }) {
  const memoryChains = memory.filter((m) => m.spec && m.spec.k === 'chain');
  const words = [], reports = [];
  let mem = memory, inners = [];
  for (let round = 1; round <= Math.max(1, rounds); round++) {
    const space = dslSpace({ memoryChains, inners });
    const n = round === 1 ? budget : Math.max(1, Math.floor(budget / 2));
    const report = propose({ space, memory: mem, floor, seed: round === 1 ? seed : seed + ':round' + round, knowledge }, n);
    const got = report.candidates.map((c) => word(c.spec, 'imagine', [], { operator: c.operator, novelty: c.novelty, nearest: c.nearest, round }));
    words.push(...got);
    reports.push({ ...report, candidates: undefined, round, kept: got.length });
    mem = mem.concat(got.map((w) => ({ spec: w.spec })));
    inners = got;
  }
  const rejected = {};
  for (const r of reports) for (const [k, v] of Object.entries(r.rejected)) rejected[k] = (rejected[k] || 0) + v;
  const draws = reports.reduce((a, r) => a + r.draws, 0);
  return { words, report: { rounds: reports, rejected, draws, floor: reports[0].floor, knowledgeChecked: reports[0].knowledgeChecked, ms: Math.round(reports.reduce((a, r) => a + r.ms, 0) * 100) / 100 } };
}

/** The base vocabulary as memory items: each word alone. */
export function vocabularyMemory() {
  return PRIMS.map((p) => ({ spec: { k: 'op', op: p.name } }));
}
/**
 * Novelty of words against what the organism held before it invented anything, two rulers:
 *   novelty0     distance from every word of the base vocabulary (each word alone): how far a
 *                word is from the words the search already had. This is the number a kept word
 *                carries to the gate.
 *   noveltyHeld  distance from the vocabulary AND the solved programs as they were (learned last
 *                step included): a collapsed program sits near the program it came from.
 * @param {object[]} words
 * @param {{names: string[]}[]} solved
 */
export function noveltyAgainst(words, solved) {
  const space = dslSpace();
  const vocab = memoryIndex(space, vocabularyMemory());
  const held = memoryIndex(space, vocabularyMemory().concat(solved.map((r) => ({ spec: { k: 'chain', ops: r.names.slice() } }))));
  for (const w of words) {
    if (typeof w.novelty0 !== 'number') w.novelty0 = noveltyOf(space, w, vocab).distance;
    if (typeof w.noveltyHeld !== 'number') w.noveltyHeld = noveltyOf(space, w, held).distance;
  }
  return words;
}

// ---------------------------------------------------------------- the null library
/**
 * As many null words as the invented library holds: half random compositions of the fixed
 * vocabulary, half pairwise recombinations of memory, distinct keys, none a base word.
 */
export function nullLibrary(n, memory, seed = 'grid-invent:null') {
  const rng = new RNG(seed);
  const out = new Map();
  const chains = memory.filter((m) => m && m.spec && opsOf(m.spec));
  let guard = 0;
  while (out.size < n && guard++ < n * 40) {
    let spec = null, source = 'null.random';
    if (out.size % 2 === 1 && chains.length >= 1) {
      const r = recombineChains(rng.pick(chains), rng.pick(chains), rng);
      spec = r && r.spec; source = 'null.recombine';
    } else spec = randomChain(rng);
    if (!spec || spec.k === 'op' || !isGridWord(spec)) continue;
    const key = specKey(spec);
    if (!out.has(key)) out.set(key, word(spec, source, []));
  }
  return [...out.values()];
}

// ---------------------------------------------------------------- the vocabulary, through the gate
/**
 * The words that passed. submit() sends a word with its evidence to the authority gate as kind
 * imagine.keep; only an approved word enters. Every entry records its novelty distance and the
 * held out tasks it solved.
 */
export class InventedVocabulary {
  /** @param {{gate: object}} opts */
  constructor({ gate } = {}) {
    if (!gate) throw new Error('grid-invent: the vocabulary needs a gate');
    this.gate = gate;
    this.entries = new Map();
    this.refused = 0;
  }
  /**
   * @param {object} w a word ({spec, key, sources})
   * @param {{solved: string[], novelty: number}} evidence
   * @returns {object} the gate's proposal
   */
  submit(w, evidence) {
    const key = w.key || specKey(w.spec);
    const p = keep({ ...w, key, type: 'primitive' }, { novelty: evidence.novelty, solved: evidence.solved || [], sources: w.sources || [], source: w.source, operator: w.operator ?? null }, { gate: this.gate, by: 'grid-invent' });
    if (p.status !== 'approved') { this.refused++; return p; }
    const had = this.entries.get(key);
    const solved = [...new Set([...(had ? had.solved : []), ...evidence.solved.filter((t) => !(w.sources || []).includes(t))])].sort();
    this.entries.set(key, { key, spec: w.spec, source: w.source, operator: w.operator ?? null, round: w.round ?? null, novelty: evidence.novelty, solved, sources: w.sources || [], proposal: p.id });
    return p;
  }
  has(key) { return this.entries.has(key); }
  get size() { return this.entries.size; }
  list() { return [...this.entries.values()]; }
  /** The entered words as search primitives. */
  primitives(cost = INVENT_DEFAULTS.cost) { return this.list().map((e) => asPrimitive(e, cost)).filter(Boolean); }
}

/**
 * A code patch for the autopilot: register one kept chain word in capability/grid-dsl.mjs as a
 * named primitive. Only chains (their words are already in that file); a combinator would need
 * this file's interpreter, so none is proposed for it. The autopilot, not this file, measures a
 * patch: it is proposed with verified false and the gate holds it.
 */
export function patchFor(entry) {
  if (!entry || !entry.spec || entry.spec.k !== 'chain') return null;
  const name = 'inv' + entry.spec.ops.map((s) => s[0].toUpperCase() + s.slice(1)).join('');
  const line = "prim('" + name + "', 'grid', 'grid', " + INVENT_DEFAULTS.cost + ", (g) => { let v = g; for (const op of " + JSON.stringify(entry.spec.ops) + ") { v = v && BY_NAME.get(op).apply(v); } return v || null; }, 'invented by capability/grid-invent.mjs: " + entry.spec.ops.join(' then ') + ", kept after solving " + entry.solved.join(' ') + "');";
  return { type: 'patch', target: 'capability/grid-dsl.mjs', test: 'test/grid.test.mjs', key: 'patch:' + entry.key, anchor: "// ---------------------------------------------------------------- learned last steps", insert: line, word: entry.key };
}

export { byName };
