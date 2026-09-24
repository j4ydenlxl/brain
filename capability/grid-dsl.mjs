// capability/grid-dsl.mjs: THE GRID VOCABULARY. A typed set of grid primitives that a
// search composes into programs, written against what the ARC-AGI-1 TRAINING tasks ask for.
//
// WHY THIS FILE EXISTS. public-arc.json printed 1 of 400 evaluation tasks solved, 399
// "exhausted the vocabulary" at 3000 ms and 0 timed out. The search in tasks/grid.mjs was
// not short of time; it was short of words. Its vocabulary was seven geometric moves, eight
// rolls, three tiles and a colour map, which is the vocabulary of the generator it was built
// to invert and not the vocabulary ARC is written in. Icecuber, the published no-model row at
// 17 percent, is about a hundred hand-written grid transforms searched to depth three or four.
// This file is that kind of vocabulary.
//
// THE TYPES. A value is one of three things, and every primitive declares which it eats and
// which it makes:
//   grid     { w, h, cells: Uint16Array }, row major, colours 0 to 9, plus placeholders
//   objects  { t: 'objects', src, list }, a set of connected components of one source grid
//   color    { t: 'color', c }, one colour read off a grid
// so a program can say "the components, the largest one, cropped" as three typed steps
// (grid to objects, objects to objects, objects to grid) instead of one bespoke function.
//
// PLACEHOLDER COLOURS. A primitive that paints something new (an outline, a filled hole, a
// line between two cells) paints it in colour 10 or above, which no ARC grid contains. The
// search's terminal colour map then learns which real colour the placeholder is from the
// train pairs. A grid that still holds a placeholder is never an answer: the search rejects
// it at the test inputs. This is what lets one "fill enclosed" primitive serve every task
// that fills holes, whatever colour that task happens to fill them with.
//
// LEARNED PRIMITIVES. Some steps have parameters no enumeration could guess (a colour map,
// a local rewrite table, which of eight symmetries goes in which tile). Each is a learner:
// learn(stateGrids, wantedGrids, testGrids) reads the parameters off the train pairs or
// refuses, and apply(grid, params) is then an ordinary pure grid function. The search runs
// them only as the LAST step of a program, against the grids the prefix produced.
//
// Every primitive runs as a real cell: kind grid.dsl with params { op, learned }. The search
// uses the pure functions to try thousands of candidates, and the program that wins is then
// wired as a chain of grid.dsl cells and graded by a grid.dsl.match cell, the same contract
// tasks/grid.mjs keeps: what gets graded is what the cells emit.
import { defineKind, hasKind } from '../core/cell.mjs';

export const MAX_SIDE = 30;   // ARC's own limit: every grid is 1 to 30 on a side
export const P = 10;          // the first placeholder colour
export const BG = 0;          // ARC's background, black, in the large majority of tasks

export const TYPES = Object.freeze({ GRID: 'grid', OBJECTS: 'objects', COLOR: 'color' });

// ---------------------------------------------------------------- grid basics
export function grid(w, h) { return { w, h, cells: new Uint16Array(w * h) }; }
export function fromRows(rows) {
  const h = rows.length, w = rows[0].length;
  const g = grid(w, h);
  for (let y = 0; y < h; y++) {
    if (rows[y].length !== w) throw new Error('grid-dsl: ragged rows');
    for (let x = 0; x < w; x++) g.cells[y * w + x] = rows[y][x];
  }
  return g;
}
export function toRows(g) {
  const out = [];
  for (let y = 0; y < g.h; y++) out.push(Array.from(g.cells.subarray(y * g.w, y * g.w + g.w)));
  return out;
}
export function sameGrid(a, b) {
  if (!a || !b || a.w !== b.w || a.h !== b.h) return false;
  const x = a.cells, y = b.cells;
  for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  return true;
}
/** True when every cell is a real ARC colour, 0 to 9: a placeholder left over is not an answer. */
export function isAnswerGrid(g) {
  if (!isGrid(g) || g.w > MAX_SIDE || g.h > MAX_SIDE) return false;
  for (let i = 0; i < g.cells.length; i++) if (g.cells[i] > 9) return false;
  return true;
}
export function isGrid(v) {
  return !!v && v.t === undefined && Number.isInteger(v.w) && Number.isInteger(v.h) && v.w > 0 && v.h > 0 && v.cells && v.cells.length === v.w * v.h;
}
const fit = (g) => (g && g.w >= 1 && g.h >= 1 && g.w <= MAX_SIDE && g.h <= MAX_SIDE ? g : null);
const copy = (g) => ({ w: g.w, h: g.h, cells: g.cells.slice() });

// Two 32-bit FNV style hashes folded into one 53-bit number. A collision would only make the
// search skip a state as already seen; it can never make a wrong answer, because an answer is
// re-run through cells and compared cell by cell.
export function hashGrid(g) {
  if (g._h !== undefined) return g._h;
  let a = (0x811c9dc5 ^ g.w) >>> 0, b = (0x9747b28c ^ Math.imul(g.h, 0x2c1b3c6d)) >>> 0;
  const c = g.cells;
  for (let i = 0; i < c.length; i++) {
    a = Math.imul(a ^ c[i], 16777619);
    b = Math.imul(b ^ (c[i] + 0x9e37), 0x5bd1e995); b ^= b >>> 15;
  }
  const h = (a >>> 0) * 2097152 + ((b >>> 0) & 0x1fffff);
  Object.defineProperty(g, '_h', { value: h, enumerable: false });
  return h;
}
export function hashValue(v) {
  if (!v) return 0;
  if (v.t === 'color') return 7919 + v.c * 104729;
  if (v.t === 'objects') {
    let a = hashGrid(v.src) % 2147483647;
    for (const o of v.list) a = (Math.imul(a ^ o.idx[0], 16777619) ^ o.size) >>> 0;
    return a * 3 + 1;
  }
  return hashGrid(v);
}

// ---------------------------------------------------------------- colour statistics
function colorCounts(g) {
  if (g._cc) return g._cc;
  const m = new Map();
  for (let i = 0; i < g.cells.length; i++) { const v = g.cells[i]; m.set(v, (m.get(v) || 0) + 1); }
  Object.defineProperty(g, '_cc', { value: m, enumerable: false });
  return m;
}
/** Colours ordered by count, most first, ties by the smaller colour; bg excluded when asked. */
function byFreq(g, skipBg) {
  const out = [];
  for (const [c, n] of colorCounts(g)) if (!(skipBg && c === BG)) out.push([c, n]);
  out.sort((p, q) => q[1] - p[1] || p[0] - q[0]);
  return out;
}
function uniqueTop(list) { return list.length && (list.length === 1 || list[0][1] !== list[1][1]) ? list[0][0] : null; }
function uniqueBottom(list) {
  const n = list.length;
  return n && (n === 1 || list[n - 1][1] !== list[n - 2][1]) ? list[n - 1][0] : null;
}

// ---------------------------------------------------------------- geometry
function rot90(g) { const o = grid(g.h, g.w); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.cells[x * o.w + (g.h - 1 - y)] = g.cells[y * g.w + x]; return o; }
function rot180(g) { const o = grid(g.w, g.h); const n = g.cells.length; for (let i = 0; i < n; i++) o.cells[n - 1 - i] = g.cells[i]; return o; }
function rot270(g) { const o = grid(g.h, g.w); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.cells[(g.w - 1 - x) * o.w + y] = g.cells[y * g.w + x]; return o; }
function flipH(g) { const o = grid(g.w, g.h); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.cells[y * g.w + (g.w - 1 - x)] = g.cells[y * g.w + x]; return o; }
function flipV(g) { const o = grid(g.w, g.h); for (let y = 0; y < g.h; y++) o.cells.set(g.cells.subarray(y * g.w, y * g.w + g.w), (g.h - 1 - y) * g.w); return o; }
function transpose(g) { const o = grid(g.h, g.w); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.cells[x * o.w + y] = g.cells[y * g.w + x]; return o; }
function antiTranspose(g) { const o = grid(g.h, g.w); for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.cells[(g.w - 1 - x) * o.w + (g.h - 1 - y)] = g.cells[y * g.w + x]; return o; }
export const SYMMETRIES = Object.freeze({ id: (g) => g, rot90, rot180, rot270, flipH, flipV, transpose, antiTranspose });

// ---------------------------------------------------------------- crops
function sub(g, x, y, w, h) {
  if (w < 1 || h < 1 || x < 0 || y < 0 || x + w > g.w || y + h > g.h) return null;
  const o = grid(w, h);
  for (let j = 0; j < h; j++) { const s = (y + j) * g.w + x; o.cells.set(g.cells.subarray(s, s + w), j * w); }
  return o;
}
function bboxWhere(g, pred) {
  let x0 = g.w, y0 = g.h, x1 = -1, y1 = -1;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (pred(g.cells[y * g.w + x])) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}
function cropNot(g, bg) { const b = bboxWhere(g, (v) => v !== bg); return b ? sub(g, b.x0, b.y0, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1) : null; }

// ---------------------------------------------------------------- scale, tile, mirror
function up(g, k) {
  if (g.w * k > MAX_SIDE || g.h * k > MAX_SIDE) return null;
  const o = grid(g.w * k, g.h * k);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.cells[y * o.w + x] = g.cells[((y / k) | 0) * g.w + ((x / k) | 0)];
  return o;
}
function downUniform(g, k) {
  if (g.w % k || g.h % k) return null;
  const o = grid(g.w / k, g.h / k);
  for (let by = 0; by < o.h; by++) for (let bx = 0; bx < o.w; bx++) {
    const v = g.cells[by * k * g.w + bx * k];
    for (let y = 0; y < k; y++) for (let x = 0; x < k; x++) if (g.cells[(by * k + y) * g.w + bx * k + x] !== v) return null;
    o.cells[by * o.w + bx] = v;
  }
  return o;
}
function downAuto(g) {
  for (let k = Math.min(g.w, g.h); k >= 2; k--) { const d = downUniform(g, k); if (d) return d; }
  return null;
}
function tile(g, nx, ny) {
  if (g.w * nx > MAX_SIDE || g.h * ny > MAX_SIDE) return null;
  const o = grid(g.w * nx, g.h * ny);
  for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) o.cells[y * o.w + x] = g.cells[(y % g.h) * g.w + (x % g.w)];
  return o;
}
function place(o, g, ox, oy) { for (let y = 0; y < g.h; y++) o.cells.set(g.cells.subarray(y * g.w, y * g.w + g.w), (oy + y) * o.w + ox); }
function hcat(a, b) { if (a.h !== b.h || a.w + b.w > MAX_SIDE) return null; const o = grid(a.w + b.w, a.h); place(o, a, 0, 0); place(o, b, a.w, 0); return o; }
function vcat(a, b) { if (a.w !== b.w || a.h + b.h > MAX_SIDE) return null; const o = grid(a.w, a.h + b.h); place(o, a, 0, 0); place(o, b, 0, a.h); return o; }
function mirror4(g) { const top = hcat(g, flipH(g)); return top ? vcat(top, flipV(top)) : null; }

// ---------------------------------------------------------------- halves and partitions
function halves(g, horizontal) {
  if (horizontal) {
    if (g.w < 2) return null;
    const hw = g.w >> 1, skip = g.w % 2;
    return [sub(g, 0, 0, hw, g.h), sub(g, hw + skip, 0, hw, g.h)];
  }
  if (g.h < 2) return null;
  const hh = g.h >> 1, skip = g.h % 2;
  return [sub(g, 0, 0, g.w, hh), sub(g, 0, hh + skip, g.w, hh)];
}
// A partition is the rectangles between full rows and columns of ONE separator colour.
function partition(g) {
  if (g._part !== undefined) return g._part;
  let best = null;
  const cand = new Set();
  for (let y = 0; y < g.h; y++) { const v = g.cells[y * g.w]; let full = true; for (let x = 1; x < g.w; x++) if (g.cells[y * g.w + x] !== v) { full = false; break; } if (full) cand.add(v); }
  for (let x = 0; x < g.w; x++) { const v = g.cells[x]; let full = true; for (let y = 1; y < g.h; y++) if (g.cells[y * g.w + x] !== v) { full = false; break; } if (full) cand.add(v); }
  for (const c of [...cand].sort((a, b) => (a === BG) - (b === BG) || a - b)) {
    const sepRow = [], sepCol = [];
    for (let y = 0; y < g.h; y++) { let full = true; for (let x = 0; x < g.w; x++) if (g.cells[y * g.w + x] !== c) { full = false; break; } sepRow.push(full); }
    for (let x = 0; x < g.w; x++) { let full = true; for (let y = 0; y < g.h; y++) if (g.cells[y * g.w + x] !== c) { full = false; break; } sepCol.push(full); }
    const bands = (flags) => { const out = []; let s = -1; for (let i = 0; i <= flags.length; i++) { if (i < flags.length && !flags[i]) { if (s < 0) s = i; } else if (s >= 0) { out.push([s, i - s]); s = -1; } } return out; };
    const rb = bands(sepRow), cb = bands(sepCol);
    if (!rb.length || !cb.length || rb.length * cb.length < 2) continue;
    if (rb.length === 1 && cb.length === 1) continue;
    const cells = [];
    for (const [y, h] of rb) for (const [x, w] of cb) cells.push({ x, y, w, h });
    best = { sep: c, rows: rb.length, cols: cb.length, cells };
    break;
  }
  Object.defineProperty(g, '_part', { value: best, enumerable: false });
  return best;
}
function partGrids(g) { const p = partition(g); return p ? p.cells.map((r) => sub(g, r.x, r.y, r.w, r.h)) : null; }
function sameSize(list) { return list && list.length >= 2 && list.every((q) => q && q.w === list[0].w && q.h === list[0].h); }
// the two halves: by separator when one splits the grid in two, else by the middle
function twoParts(g, horizontal) {
  const p = partition(g);
  if (p && p.cells.length === 2 && ((horizontal && p.cols === 2) || (!horizontal && p.rows === 2))) {
    const parts = partGrids(g);
    if (sameSize(parts)) return parts;
  }
  return halves(g, horizontal);
}
function boolParts(parts, op) {
  if (!sameSize(parts)) return null;
  const o = grid(parts[0].w, parts[0].h);
  for (let i = 0; i < o.cells.length; i++) {
    let on = 0;
    for (const q of parts) if (q.cells[i] !== BG) on++;
    const n = parts.length;
    const hit = op === 'and' ? on === n : op === 'or' ? on > 0 : op === 'xor' ? on === 1 : op === 'nor' ? on === 0
      : op === 'aNotB' ? (parts[0].cells[i] !== BG && parts[1].cells[i] === BG) : (parts[0].cells[i] === BG && parts[1].cells[i] !== BG);
    if (hit) o.cells[i] = P;
  }
  return o;
}
function overlayParts(parts, reverse) {
  if (!sameSize(parts)) return null;
  const o = grid(parts[0].w, parts[0].h);
  const seq = reverse ? parts.slice().reverse() : parts;
  for (const q of seq) for (let i = 0; i < o.cells.length; i++) if (q.cells[i] !== BG) o.cells[i] = q.cells[i];
  return o;
}

// ---------------------------------------------------------------- components
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
/**
 * Connected components of non-background cells. mode c4 and c8 join same coloured cells by
 * 4 or 8 adjacency; m4 and m8 join any non-background cells; col groups every cell of one
 * colour into one object. Cached on the grid, because many primitives ask for the same set.
 */
export function components(g, mode) {
  const cache = g._comp || (Object.defineProperty(g, '_comp', { value: {}, enumerable: false }), g._comp);
  if (cache[mode]) return cache[mode];
  const list = [];
  if (mode === 'col') {
    const by = new Map();
    for (let i = 0; i < g.cells.length; i++) { const v = g.cells[i]; if (v === BG) continue; if (!by.has(v)) by.set(v, []); by.get(v).push(i); }
    for (const [, idx] of [...by].sort((a, b) => a[0] - b[0])) list.push(makeObj(g, Int32Array.from(idx)));
  } else {
    const nb = mode === 'c8' || mode === 'm8' ? N8 : N4;
    const multi = mode === 'm4' || mode === 'm8';
    const seen = new Uint8Array(g.cells.length);
    const stack = [];
    for (let s = 0; s < g.cells.length; s++) {
      if (seen[s] || g.cells[s] === BG) continue;
      const color = g.cells[s];
      const idx = [];
      seen[s] = 1; stack.push(s);
      while (stack.length) {
        const i = stack.pop(); idx.push(i);
        const x = i % g.w, y = (i / g.w) | 0;
        for (const [dx, dy] of nb) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
          const j = ny * g.w + nx;
          if (seen[j]) continue;
          const v = g.cells[j];
          if (v === BG || (!multi && v !== color)) continue;
          seen[j] = 1; stack.push(j);
        }
      }
      idx.sort((a, b) => a - b);
      list.push(makeObj(g, Int32Array.from(idx)));
    }
  }
  cache[mode] = list;
  return list;
}
function makeObj(g, idx) {
  let x0 = g.w, y0 = g.h, x1 = -1, y1 = -1;
  const colors = new Map();
  for (const i of idx) {
    const x = i % g.w, y = (i / g.w) | 0;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    const v = g.cells[i]; colors.set(v, (colors.get(v) || 0) + 1);
  }
  let color = -1, top = -1;
  for (const [c, n] of colors) if (n > top || (n === top && c < color)) { top = n; color = c; }
  return { idx, size: idx.length, x0, y0, x1, y1, color, ncolors: colors.size };
}
function objShapeKey(g, o) {
  if (o.sk !== undefined) return o.sk;
  const w = o.x1 - o.x0 + 1;
  let s = w + ':' + (o.y1 - o.y0 + 1) + ':';
  for (const i of o.idx) s += (((i / g.w) | 0) - o.y0) * w + (i % g.w - o.x0) + ',';
  o.sk = s;
  return s;
}
function touchesBorder(g, o) { return o.x0 === 0 || o.y0 === 0 || o.x1 === g.w - 1 || o.y1 === g.h - 1; }
function hasHole(g, o) {
  const w = o.x1 - o.x0 + 1, h = o.y1 - o.y0 + 1;
  if (w < 3 || h < 3) return false;
  const mask = new Uint8Array(w * h);
  for (const i of o.idx) mask[(((i / g.w) | 0) - o.y0) * w + (i % g.w - o.x0)] = 1;
  const seen = new Uint8Array(w * h); const st = [];
  for (let x = 0; x < w; x++) for (const y of [0, h - 1]) { const k = y * w + x; if (!mask[k] && !seen[k]) { seen[k] = 1; st.push(k); } }
  for (let y = 0; y < h; y++) for (const x of [0, w - 1]) { const k = y * w + x; if (!mask[k] && !seen[k]) { seen[k] = 1; st.push(k); } }
  while (st.length) { const k = st.pop(); const x = k % w, y = (k / w) | 0; for (const [dx, dy] of N4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue; const j = ny * w + nx; if (!mask[j] && !seen[j]) { seen[j] = 1; st.push(j); } } }
  for (let k = 0; k < w * h; k++) if (!mask[k] && !seen[k]) return true;
  return false;
}
const objs = (src, list) => (list && list.length ? { t: 'objects', src, list } : null);
function pickUnique(list, score, wantMax) {
  let best = null, bestScore = wantMax ? -Infinity : Infinity, ties = 0;
  for (const o of list) {
    const s = score(o);
    if (wantMax ? s > bestScore : s < bestScore) { best = o; bestScore = s; ties = 0; } else if (s === bestScore) ties++;
  }
  return best && ties === 0 ? [best] : null;
}
function renderObjs(v, w, h, ox, oy) {
  const o = grid(w, h);
  for (const ob of v.list) for (const i of ob.idx) {
    const x = i % v.src.w - ox, y = ((i / v.src.w) | 0) - oy;
    if (x >= 0 && y >= 0 && x < w && y < h) o.cells[y * w + x] = v.src.cells[i];
  }
  return o;
}
function unionBox(v) {
  let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1;
  for (const o of v.list) { x0 = Math.min(x0, o.x0); y0 = Math.min(y0, o.y0); x1 = Math.max(x1, o.x1); y1 = Math.max(y1, o.y1); }
  return { x0, y0, x1, y1 };
}

// ---------------------------------------------------------------- physics and painting
function gravity(g, dir) {
  const o = grid(g.w, g.h);
  if (dir === 'down' || dir === 'up') {
    for (let x = 0; x < g.w; x++) {
      const vals = [];
      for (let y = 0; y < g.h; y++) { const v = g.cells[y * g.w + x]; if (v !== BG) vals.push(v); }
      const s = dir === 'down' ? g.h - vals.length : 0;
      for (let k = 0; k < vals.length; k++) o.cells[(s + k) * g.w + x] = vals[k];
    }
  } else {
    for (let y = 0; y < g.h; y++) {
      const vals = [];
      for (let x = 0; x < g.w; x++) { const v = g.cells[y * g.w + x]; if (v !== BG) vals.push(v); }
      const s = dir === 'right' ? g.w - vals.length : 0;
      for (let k = 0; k < vals.length; k++) o.cells[y * g.w + s + k] = vals[k];
    }
  }
  return o;
}
// Every multicolour object slides as a rigid body until it meets the wall or a settled one.
function objectGravity(g, dir) {
  const list = components(g, 'm8');
  if (list.length < 1) return null;
  const [dx, dy] = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] }[dir];
  const order = list.slice().sort((a, b) => (dir === 'down' ? b.y1 - a.y1 : dir === 'up' ? a.y0 - b.y0 : dir === 'right' ? b.x1 - a.x1 : a.x0 - b.x0));
  const o = grid(g.w, g.h);
  const filled = new Uint8Array(g.cells.length);
  for (const ob of order) {
    let k = 0;
    for (;;) {
      let okMove = true;
      for (const i of ob.idx) {
        const x = i % g.w + dx * (k + 1), y = ((i / g.w) | 0) + dy * (k + 1);
        if (x < 0 || y < 0 || x >= g.w || y >= g.h || filled[y * g.w + x]) { okMove = false; break; }
      }
      if (!okMove) break;
      k++;
    }
    for (const i of ob.idx) { const x = i % g.w + dx * k, y = ((i / g.w) | 0) + dy * k; o.cells[y * g.w + x] = g.cells[i]; filled[y * g.w + x] = 1; }
  }
  return o;
}
function reachFromBorder(g, pass) {
  const seen = new Uint8Array(g.cells.length); const st = [];
  const push = (i) => { if (!seen[i] && pass(g.cells[i])) { seen[i] = 1; st.push(i); } };
  for (let x = 0; x < g.w; x++) { push(x); push((g.h - 1) * g.w + x); }
  for (let y = 0; y < g.h; y++) { push(y * g.w); push(y * g.w + g.w - 1); }
  while (st.length) { const i = st.pop(); const x = i % g.w, y = (i / g.w) | 0; for (const [ax, ay] of N4) { const nx = x + ax, ny = y + ay; if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) push(ny * g.w + nx); } }
  return seen;
}
function fillEnclosed(g) {
  const seen = reachFromBorder(g, (v) => v === BG);
  const o = copy(g); let any = false;
  for (let i = 0; i < o.cells.length; i++) if (o.cells[i] === BG && !seen[i]) { o.cells[i] = P; any = true; }
  return o;
}
function outline(g, nb) {
  const o = copy(g); let any = false;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    if (g.cells[y * g.w + x] !== BG) continue;
    for (const [dx, dy] of nb) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h && g.cells[ny * g.w + nx] !== BG) { o.cells[y * g.w + x] = P; any = true; break; } }
  }
  return o;
}
function hollow(g) {
  const o = copy(g); let any = false;
  for (let y = 1; y < g.h - 1; y++) for (let x = 1; x < g.w - 1; x++) {
    const i = y * g.w + x; if (g.cells[i] === BG) continue;
    let inner = true; for (const [dx, dy] of N8) if (g.cells[(y + dy) * g.w + x + dx] === BG) { inner = false; break; }
    if (inner) { o.cells[i] = BG; any = true; }
  }
  return o;
}
// Paint the cells between two cells of one colour on one row or column, if only bg lies between.
function connect(g, horiz, vert, paintP) {
  const o = copy(g); let any = false;
  if (horiz) for (let y = 0; y < g.h; y++) { let lx = -1, lc = -1; for (let x = 0; x < g.w; x++) { const v = g.cells[y * g.w + x]; if (v === BG) continue; if (v === lc && x - lx > 1) { for (let k = lx + 1; k < x; k++) o.cells[y * g.w + k] = paintP ? P : v; any = true; } lx = x; lc = v; } }
  if (vert) for (let x = 0; x < g.w; x++) { let ly = -1, lc = -1; for (let y = 0; y < g.h; y++) { const v = g.cells[y * g.w + x]; if (v === BG) continue; if (v === lc && y - ly > 1) { for (let k = ly + 1; k < y; k++) if (o.cells[k * g.w + x] === BG) o.cells[k * g.w + x] = paintP ? P : v; any = true; } ly = y; lc = v; } }
  return o;
}
// From every non-background cell, extend through background in the given directions.
function rays(g, dirs, stopAtObjects, onlyPixels) {
  const o = copy(g); let any = false;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const v = g.cells[y * g.w + x]; if (v === BG) continue;
    if (onlyPixels) { let lone = true; for (const [dx, dy] of N8) { const nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h && g.cells[ny * g.w + nx] !== BG) { lone = false; break; } } if (!lone) continue; }
    for (const [dx, dy] of dirs) {
      let nx = x + dx, ny = y + dy;
      while (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) {
        if (g.cells[ny * g.w + nx] !== BG) { if (stopAtObjects) break; } else if (o.cells[ny * g.w + nx] === BG) { o.cells[ny * g.w + nx] = v; any = true; }
        nx += dx; ny += dy;
      }
    }
  }
  return o;
}
// Fill hole cells from their mirror images under a group of symmetries.
function symFill(g, hole, maps) {
  const o = copy(g); let changed = false;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const i = y * g.w + x; if (g.cells[i] !== hole) continue;
    for (const m of maps) { const [mx, my] = m(x, y); const v = g.cells[my * g.w + mx]; if (v !== hole) { o.cells[i] = v; changed = true; break; } }
  }
  return o;
}
function symMaps(g, kind) {
  const W = g.w - 1, H = g.h - 1;
  const h = (x, y) => [W - x, y], v = (x, y) => [x, H - y], r = (x, y) => [W - x, H - y];
  if (kind === 'H') return [h];
  if (kind === 'V') return [v];
  if (kind === 'HV') return [h, v, r];
  if (g.w !== g.h) return null;
  const t = (x, y) => [y, x], a = (x, y) => [H - y, W - x], r1 = (x, y) => [H - y, x], r3 = (x, y) => [y, W - x];
  return [h, v, r, t, a, r1, r3];
}
function solidRectColor(g) {
  let best = null, bestArea = 0;
  for (const [c, n] of colorCounts(g)) {
    const b = bboxWhere(g, (v) => v === c);
    const area = (b.x1 - b.x0 + 1) * (b.y1 - b.y0 + 1);
    if (area === n && n > bestArea && n < g.cells.length) { best = { c, ...b }; bestArea = n; }
  }
  return best;
}
function unmask(g, kind, cropIt) {
  const r = solidRectColor(g); if (!r) return null;
  const maps = symMaps(g, kind); if (!maps) return null;
  const f = symFill(g, r.c, maps); if (!f) return null;
  return cropIt ? sub(f, r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1) : f;
}
function kron(g, inverse) {
  if (g.w * g.w > MAX_SIDE || g.h * g.h > MAX_SIDE) return null;
  const o = grid(g.w * g.w, g.h * g.h);
  for (let by = 0; by < g.h; by++) for (let bx = 0; bx < g.w; bx++) {
    const on = g.cells[by * g.w + bx] !== BG;
    if (on !== !inverse) continue;
    place(o, g, bx * g.w, by * g.h);
  }
  return o;
}
// Always a grid: the rows of g with every run of identical rows collapsed to one.
function dedupeRowsOf(g) {
  const keep = [];
  for (let y = 0; y < g.h; y++) { if (y > 0) { let same = true; for (let x = 0; x < g.w; x++) if (g.cells[y * g.w + x] !== g.cells[(y - 1) * g.w + x]) { same = false; break; } if (same) continue; } keep.push(y); }
  const o = grid(g.w, keep.length); keep.forEach((y, j) => o.cells.set(g.cells.subarray(y * g.w, y * g.w + g.w), j * g.w));
  return o;
}
// A grid with nothing to collapse passes through unchanged: one train pair may need no change
// while another does. A step that changes NO grid makes a state the search has already seen,
// and the memo drops it there, which is the only place a no-op should be dropped.
function dedupe(g, rowsToo, colsToo) {
  let cur = g;
  if (rowsToo) cur = dedupeRowsOf(cur);
  if (colsToo) cur = transpose(dedupeRowsOf(transpose(cur)));
  return cur;
}
function dropBgLines(g) {
  const rows = [], cols = [];
  for (let y = 0; y < g.h; y++) { for (let x = 0; x < g.w; x++) if (g.cells[y * g.w + x] !== BG) { rows.push(y); break; } }
  for (let x = 0; x < g.w; x++) { for (let y = 0; y < g.h; y++) if (g.cells[y * g.w + x] !== BG) { cols.push(x); break; } }
  if (!rows.length || !cols.length) return null;
  const o = grid(cols.length, rows.length);
  rows.forEach((y, j) => cols.forEach((x, i) => { o.cells[j * o.w + i] = g.cells[y * g.w + x]; }));
  return o;
}
function shift(g, dx, dy, wrap) {
  const o = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    let nx = x + dx, ny = y + dy;
    if (wrap) { nx = (nx + g.w) % g.w; ny = (ny + g.h) % g.h; } else if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
    o.cells[ny * g.w + nx] = g.cells[y * g.w + x];
  }
  return o;
}
function recolorObjects(g, mode, colorOf) {
  const list = components(g, mode); if (!list.length) return copy(g);
  const o = copy(g); let any = false;
  list.forEach((ob, k) => { const c = colorOf(ob, k, list); if (c === null || c === undefined) return; for (const i of ob.idx) o.cells[i] = c; any = true; });
  return o;
}
function sizeRanks(list) {
  const sizes = [...new Set(list.map((o) => o.size))].sort((a, b) => b - a);
  return new Map(sizes.map((s, r) => [s, r]));
}
function keepColor(g, c, keep) {
  if (c === null) return null;
  const o = copy(g); let any = false;
  for (let i = 0; i < o.cells.length; i++) { const v = o.cells[i]; if (v !== BG && ((v === c) !== keep)) { o.cells[i] = BG; any = true; } }
  return o;
}
function invert(g) {
  const fg = byFreq(g, true); if (fg.length !== 1) return null;
  const f = fg[0][0]; const o = copy(g);
  for (let i = 0; i < o.cells.length; i++) o.cells[i] = o.cells[i] === BG ? f : BG;
  return o;
}
function frame(g) {
  if (g.w < 2 || g.h < 2) return null;
  const o = copy(g);
  for (let x = 0; x < g.w; x++) { o.cells[x] = P; o.cells[(g.h - 1) * g.w + x] = P; }
  for (let y = 0; y < g.h; y++) { o.cells[y * g.w] = P; o.cells[y * g.w + g.w - 1] = P; }
  return o;
}
function removeNoise(g) {
  const list = components(g, 'm8'); const o = copy(g); let any = false;
  for (const ob of list) if (ob.size === 1) { o.cells[ob.idx[0]] = BG; any = true; }
  return o;
}
function majorityFilter(g) {
  // every cell takes the colour most of its 3x3 neighbourhood holds, which erases salt noise
  const o = copy(g); let any = false;
  const cnt = new Map();
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    cnt.clear();
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue; const v = g.cells[ny * g.w + nx]; cnt.set(v, (cnt.get(v) || 0) + 1); }
    let bc = g.cells[y * g.w + x], bn = 0; for (const [c, n] of cnt) if (n > bn) { bn = n; bc = c; }
    if (bn >= 5 && bc !== o.cells[y * g.w + x]) { o.cells[y * g.w + x] = bc; any = true; }
  }
  return o;
}
function bboxObjects(g) {
  // draw each multicolour object's bounding box border in the placeholder, where it is bg
  const list = components(g, 'm8'); if (!list.length) return null;
  const o = copy(g); let any = false;
  for (const ob of list) {
    const x0 = Math.max(0, ob.x0 - 1), y0 = Math.max(0, ob.y0 - 1), x1 = Math.min(g.w - 1, ob.x1 + 1), y1 = Math.min(g.h - 1, ob.y1 + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if ((y === y0 || y === y1 || x === x0 || x === x1) && o.cells[y * g.w + x] === BG) { o.cells[y * g.w + x] = P; any = true; }
    }
  }
  return o;
}
function fillBBoxes(g) {
  // the background inside each single colour object's bounding box, painted placeholder
  const list = components(g, 'c8'); if (!list.length) return null;
  const o = copy(g); let any = false;
  for (const ob of list) for (let y = ob.y0; y <= ob.y1; y++) for (let x = ob.x0; x <= ob.x1; x++) if (o.cells[y * g.w + x] === BG) { o.cells[y * g.w + x] = P; any = true; }
  return o;
}
function colorCountBar(g) {
  // one row per colour present, as long as its count, most frequent first: a histogram
  const fq = byFreq(g, true); if (!fq.length) return null;
  const w = fq[0][1]; if (w > MAX_SIDE || fq.length > MAX_SIDE) return null;
  const o = grid(w, fq.length);
  fq.forEach(([c, n], y) => { for (let x = 0; x < n; x++) o.cells[y * w + x] = c; });
  return o;
}
function cellsPick(g, how) {
  const parts = partGrids(g); if (!parts || parts.length < 2) return null;
  if (how === 'unique') {
    if (parts.length < 3) return null;
    const keys = parts.map(hashGrid); const counts = new Map(); for (const k of keys) counts.set(k, (counts.get(k) || 0) + 1);
    const uniq = parts.filter((q, i) => counts.get(keys[i]) === 1);
    return uniq.length === 1 ? uniq[0] : null;
  }
  const score = (q) => { let n = 0; for (const v of q.cells) if (v !== BG) n++; return how === 'distinct' ? new Set(q.cells).size : n; };
  const scored = parts.map((q) => [q, score(q)]);
  scored.sort((a, b) => (how === 'least' ? a[1] - b[1] : b[1] - a[1]));
  return scored[0][1] !== scored[1][1] ? scored[0][0] : null;
}
function cellsDominant(g) {
  const p = partition(g); if (!p) return null;
  const o = grid(p.cols, p.rows);
  p.cells.forEach((r, k) => {
    const m = new Map();
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { const v = g.cells[y * g.w + x]; if (v !== BG && v !== p.sep) m.set(v, (m.get(v) || 0) + 1); }
    let bc = BG, bn = 0; for (const [c, n] of m) if (n > bn || (n === bn && c < bc)) { bn = n; bc = c; }
    o.cells[k] = bc;
  });
  return o;
}
// THE PERIODIC LATTICE. The smallest tiling that every non-hole cell agrees with: periods px
// across and py down, with each band of py rows shifted sx columns from the one above, so a
// diagonal wallpaper is a lattice too. null when no lattice smaller than half the grid fits.
function lattice(g, hole) {
  const memo = g._lat || (Object.defineProperty(g, '_lat', { value: new Map(), enumerable: false }), g._lat);
  if (memo.has(hole)) return memo.get(hole);
  const L = latticeOf(g, hole);
  memo.set(hole, L);
  return L;
}
function latticeOf(g, hole) {
  const cap = (g.w * g.h) / 2;
  // A period that fails on one row alone fails on the grid: every row of any lattice, shifted
  // or not, repeats with period px. So px is filtered row by row first, and py column by
  // column for the unshifted lattices, which is exact and turns most grids away in a pass.
  const periodicAlong = (n, m, get, p) => {
    const rep = new Int32Array(p);
    for (let k = 0; k < m; k++) {
      rep.fill(-1);
      for (let i = 0; i < n; i++) {
        const v = get(k, i); if (v === hole) continue;
        const r = i % p;
        if (rep[r] === -1) rep[r] = v; else if (rep[r] !== v) return false;
      }
    }
    return true;
  };
  const rowGet = (y, x) => g.cells[y * g.w + x], colGet = (x, y) => g.cells[y * g.w + x];
  const pxs = [], pys = new Set();
  for (let px = 1; px <= g.w; px++) if (periodicAlong(g.w, g.h, rowGet, px)) pxs.push(px);
  for (let py = 1; py <= g.h; py++) if (periodicAlong(g.h, g.w, colGet, py)) pys.add(py);
  const cands = [];
  for (const px of pxs) for (let py = 1; py <= g.h; py++) if (px * py <= cap) cands.push([px, py]);
  cands.sort((a, b) => a[0] * a[1] - b[0] * b[1] || a[1] - b[1]);
  const rep = new Int32Array(g.w * g.h);
  for (const [px, py] of cands) {
    const shifts = py < g.h && px * 2 <= g.w ? px : 1;
    for (let sx = 0; sx < shifts; sx++) {
      if (sx === 0 && !pys.has(py)) continue;
      rep.fill(-1, 0, px * py);
      let okL = true;
      for (let y = 0; y < g.h && okL; y++) {
        const shift = Math.floor(y / py) * sx;
        for (let x = 0; x < g.w; x++) {
          const v = g.cells[y * g.w + x];
          if (v === hole) continue;
          const k = (y % py) * px + ((((x - shift) % px) + px) % px);
          if (rep[k] === -1) rep[k] = v; else if (rep[k] !== v) { okL = false; break; }
        }
      }
      if (!okL) continue;
      let full = true;
      for (let k = 0; k < px * py; k++) if (rep[k] === -1) { full = false; break; }
      if (!full) continue;
      return { px, py, sx, rep: rep.slice(0, px * py) };
    }
  }
  return null;
}
function latticeAt(L, x, y) {
  const shift = Math.floor(y / L.py) * L.sx;
  return L.rep[(y % L.py) * L.px + ((((x - shift) % L.px) + L.px) % L.px)];
}
function periodicFill(g, hole) {
  if (!colorCounts(g).has(hole)) return g;
  const L = lattice(g, hole); if (!L) return null;
  const o = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) o.cells[y * g.w + x] = latticeAt(L, x, y);
  return o;
}
function periodicUnmask(g, cropIt) {
  const r = solidRectColor(g); if (!r) return null;
  const f = periodicFill(g, r.c); if (!f) return null;
  return cropIt ? sub(f, r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1) : f;
}
function periodicExtend(g, w, h) {
  if (w > MAX_SIDE || h > MAX_SIDE || w < 1 || h < 1) return null;
  const L = lattice(g, -1); if (!L) return null;
  const o = grid(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) o.cells[y * w + x] = latticeAt(L, x, y);
  return o;
}
// MIRROR AXES THAT ARE NOT THE MIDDLE. A pattern that is symmetric about a line off the grid's
// centre (the pattern was cropped) still says what lies under a hole: find the axis (as the sum
// x + x') that the most non-hole pairs agree on with no pair disagreeing, then fill from it.
function bestAxis(g, hole, horizontal) {
  const n = horizontal ? g.w : g.h, m = horizontal ? g.h : g.w;
  let best = null, bestAgree = 0;
  for (let c = 1; c <= 2 * n - 3; c++) {
    let agree = 0, bad = false;
    for (let a = 0; a < n && !bad; a++) {
      const b = c - a; if (b <= a || b >= n) continue;
      for (let k = 0; k < m; k++) {
        const va = horizontal ? g.cells[k * g.w + a] : g.cells[a * g.w + k];
        const vb = horizontal ? g.cells[k * g.w + b] : g.cells[b * g.w + k];
        if (va === hole || vb === hole) continue;
        if (va !== vb) { bad = true; break; }
        agree++;
      }
    }
    if (!bad && agree > bestAgree) { bestAgree = agree; best = c; }
  }
  return best !== null && bestAgree >= m ? best : null;
}
function symFillOffset(g, hole, dirs) {
  let cur = g;
  for (let pass = 0; pass < 2; pass++) {
    for (const horizontal of dirs) {
      const c = bestAxis(cur, hole, horizontal); if (c === null) continue;
      const o = copy(cur);
      for (let y = 0; y < cur.h; y++) for (let x = 0; x < cur.w; x++) {
        const i = y * cur.w + x; if (cur.cells[i] !== hole) continue;
        const mx = horizontal ? c - x : x, my = horizontal ? y : c - y;
        if (mx < 0 || my < 0 || mx >= cur.w || my >= cur.h) continue;
        const v = cur.cells[my * cur.w + mx]; if (v !== hole) o.cells[i] = v;
      }
      cur = o;
    }
  }
  return cur;
}
function unmaskOffset(g, cropIt) {
  const r = solidRectColor(g); if (!r) return null;
  const f = symFillOffset(g, r.c, [true, false]);
  for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) if (f.cells[y * g.w + x] === r.c) return null;
  return cropIt ? sub(f, r.x0, r.y0, r.x1 - r.x0 + 1, r.y1 - r.y0 + 1) : f;
}
function connectDiag(g) {
  const o = copy(g);
  for (const [dx, dy] of [[1, 1], [1, -1]]) {
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const v = g.cells[y * g.w + x]; if (v === BG) continue;
      let nx = x + dx, ny = y + dy, steps = 0;
      while (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h && g.cells[ny * g.w + nx] === BG) { nx += dx; ny += dy; steps++; }
      if (steps > 0 && nx >= 0 && ny >= 0 && nx < g.w && ny < g.h && g.cells[ny * g.w + nx] === v) {
        for (let k = 1; k <= steps; k++) o.cells[(y + dy * k) * g.w + x + dx * k] = v;
      }
    }
  }
  return o;
}
function colorRowOfObjects(v) {
  if (v.list.length > MAX_SIDE) return null;
  const o = grid(v.list.length, 1); for (let i = 0; i < o.w; i++) o.cells[i] = P;
  return o;
}

// ---------------------------------------------------------------- the vocabulary
// cost is what a search pays to use the step; cheaper steps are tried first, so the order
// of search is the order in which an explanation is plausible, not the order of this list.
export const PRIMS = [];
const BY_NAME = new Map();
function prim(name, from, to, cost, apply, doc) {
  const p = Object.freeze({ name, from, to, cost, apply, doc, learned: false });
  if (BY_NAME.has(name)) throw new Error('grid-dsl: duplicate primitive ' + name);
  PRIMS.push(p); BY_NAME.set(name, p);
}
const GG = (name, cost, fn, doc) => prim(name, 'grid', 'grid', cost, (g) => fit(fn(g)), doc);

// geometry
GG('rot90', 1, rot90, 'rotate a quarter turn clockwise');
GG('rot180', 1, rot180, 'rotate a half turn');
GG('rot270', 1, rot270, 'rotate a quarter turn anticlockwise');
GG('flipH', 1, flipH, 'mirror left to right');
GG('flipV', 1, flipV, 'mirror top to bottom');
GG('transpose', 1, transpose, 'reflect across the main diagonal');
GG('antiTranspose', 1, antiTranspose, 'reflect across the anti diagonal');
// crops
GG('cropBBox', 1, (g) => cropNot(g, BG), 'crop to the bounding box of every non background cell');
GG('cropBBoxMajority', 2, (g) => { const m = byFreq(g, false)[0][0]; return m === BG ? null : cropNot(g, m); }, 'crop away the majority colour when it is not black');
GG('trimBorder', 2, (g) => sub(g, 1, 1, g.w - 2, g.h - 2), 'remove the outermost ring of cells');
GG('dropBgLines', 2, dropBgLines, 'delete every all background row and column');
GG('dedupeRows', 2, (g) => dedupe(g, true, false), 'collapse runs of identical rows');
GG('dedupeCols', 2, (g) => dedupe(g, false, true), 'collapse runs of identical columns');
GG('dedupeBoth', 2, (g) => dedupe(g, true, true), 'collapse runs of identical rows and columns');
// scale and tile
for (const k of [2, 3, 4, 5]) GG('up' + k, 2, (g) => up(g, k), 'scale every cell up to a ' + k + 'x' + k + ' block');
for (const k of [2, 3]) GG('down' + k, 2, (g) => downUniform(g, k), 'scale down by ' + k + ' where every block is one colour');
GG('downAuto', 2, downAuto, 'scale down by the largest factor whose blocks are uniform');
for (const [nx, ny] of [[2, 1], [1, 2], [2, 2], [3, 3], [3, 1], [1, 3], [4, 4]]) GG('tile' + nx + 'x' + ny, 2, (g) => tile(g, nx, ny), 'repeat the grid ' + nx + ' across and ' + ny + ' down');
GG('mirrorRight', 2, (g) => hcat(g, flipH(g)), 'the grid then its mirror image to the right');
GG('mirrorLeft', 2, (g) => hcat(flipH(g), g), 'the mirror image then the grid');
GG('mirrorDown', 2, (g) => vcat(g, flipV(g)), 'the grid then its mirror image below');
GG('mirrorUp', 2, (g) => vcat(flipV(g), g), 'the mirror image above the grid');
GG('mirror4', 2, mirror4, 'the grid in the top left of a four way kaleidoscope');
GG('kron', 3, (g) => kron(g, false), 'a copy of the grid wherever the grid itself is coloured');
GG('kronInverse', 3, (g) => kron(g, true), 'a copy of the grid wherever the grid itself is background');
// halves, partitions, logic
GG('leftHalf', 2, (g) => twoParts(g, true)?.[0], 'the left half, or the part left of a separator');
GG('rightHalf', 2, (g) => twoParts(g, true)?.[1], 'the right half, or the part right of a separator');
GG('topHalf', 2, (g) => twoParts(g, false)?.[0], 'the top half, or the part above a separator');
GG('bottomHalf', 2, (g) => twoParts(g, false)?.[1], 'the bottom half, or the part below a separator');
for (const op of ['and', 'or', 'xor', 'nor', 'aNotB', 'bNotA']) {
  GG(op + 'LR', 2, (g) => { const p = twoParts(g, true); return p && boolParts(p, op); }, op + ' of the left and right halves, painted placeholder');
  GG(op + 'TB', 2, (g) => { const p = twoParts(g, false); return p && boolParts(p, op); }, op + ' of the top and bottom halves, painted placeholder');
}
GG('overlayLR', 2, (g) => { const p = twoParts(g, true); return p && overlayParts(p, false); }, 'the right half laid over the left, colours kept');
GG('overlayRL', 2, (g) => { const p = twoParts(g, true); return p && overlayParts(p, true); }, 'the left half laid over the right, colours kept');
GG('overlayTB', 2, (g) => { const p = twoParts(g, false); return p && overlayParts(p, false); }, 'the bottom half laid over the top, colours kept');
GG('overlayBT', 2, (g) => { const p = twoParts(g, false); return p && overlayParts(p, true); }, 'the top half laid over the bottom, colours kept');
GG('cellsOverlay', 2, (g) => { const p = partGrids(g); return p && p.length > 2 && overlayParts(p, false); }, 'every separated cell laid over the first');
GG('cellsAnd', 2, (g) => { const p = partGrids(g); return p && p.length > 2 && boolParts(p, 'and'); }, 'where every separated cell is coloured');
GG('cellsXor', 2, (g) => { const p = partGrids(g); return p && p.length > 2 && boolParts(p, 'xor'); }, 'where exactly one separated cell is coloured');
GG('cellsDominant', 2, cellsDominant, 'each separated cell shrunk to one pixel of its dominant colour');
GG('cellsUnique', 2, (g) => cellsPick(g, 'unique'), 'the separated cell that differs from all the others');
GG('cellsMost', 2, (g) => cellsPick(g, 'most'), 'the separated cell with the most coloured pixels');
GG('cellsLeast', 2, (g) => cellsPick(g, 'least'), 'the separated cell with the fewest coloured pixels');
GG('cellsDistinct', 2, (g) => cellsPick(g, 'distinct'), 'the separated cell with the most distinct colours');
// physics
for (const d of ['down', 'up', 'left', 'right']) GG('gravity' + d[0].toUpperCase() + d.slice(1), 2, (g) => gravity(g, d), 'every coloured cell falls ' + d);
for (const d of ['down', 'up', 'left', 'right']) GG('slide' + d[0].toUpperCase() + d.slice(1), 3, (g) => objectGravity(g, d), 'every object slides ' + d + ' as a rigid body until it is blocked');
for (const [n, dx, dy] of [['shiftRight', 1, 0], ['shiftLeft', -1, 0], ['shiftDown', 0, 1], ['shiftUp', 0, -1]]) GG(n, 3, (g) => shift(g, dx, dy, false), n + ' by one cell, background fills the gap');
for (const [n, dx, dy] of [['rollRight', 1, 0], ['rollLeft', -1, 0], ['rollDown', 0, 1], ['rollUp', 0, -1]]) GG(n, 3, (g) => shift(g, dx, dy, true), n + ' by one cell, wrapping round');
// painting
GG('fillEnclosed', 2, fillEnclosed, 'background not reachable from the border is painted placeholder');
GG('outline8', 2, (g) => outline(g, N8), 'background touching a coloured cell at a side or corner is painted placeholder');
GG('outline4', 2, (g) => outline(g, N4), 'background touching a coloured cell at a side is painted placeholder');
GG('hollow', 2, hollow, 'the interior of every solid shape is cleared');
GG('bboxObjects', 3, bboxObjects, 'a placeholder box drawn round every object');
GG('fillBBoxes', 3, fillBBoxes, 'the background inside every object bounding box painted placeholder');
GG('frame', 3, frame, 'the outer ring painted placeholder');
GG('connectH', 2, (g) => connect(g, true, false, false), 'same coloured cells on a row joined by a line of their colour');
GG('connectV', 2, (g) => connect(g, false, true, false), 'same coloured cells on a column joined by a line of their colour');
GG('connectHV', 2, (g) => connect(g, true, true, false), 'same coloured cells joined along rows and columns');
GG('connectHVP', 2, (g) => connect(g, true, true, true), 'same coloured cells joined along rows and columns in placeholder');
const R = { R: [1, 0], L: [-1, 0], D: [0, 1], U: [0, -1] };
for (const [n, dirs] of [['R', [R.R]], ['L', [R.L]], ['D', [R.D]], ['U', [R.U]], ['H', [R.R, R.L]], ['V', [R.D, R.U]], ['4', [R.R, R.L, R.D, R.U]], ['X', [[1, 1], [1, -1], [-1, 1], [-1, -1]]]]) {
  GG('ray' + n, 3, (g) => rays(g, dirs, true, false), 'every coloured cell shoots a ray ' + n + ' until it meets something');
  GG('pixelRay' + n, 3, (g) => rays(g, dirs, false, true), 'every lone pixel shoots a ray ' + n + ' to the edge');
}
// symmetry
for (const k of ['H', 'V', 'HV', 'D4']) {
  GG('symFill' + k, 2, (g) => { const m = symMaps(g, k); return m && symFill(g, BG, m); }, 'background filled from its mirror images under ' + k);
  GG('unmask' + k, 2, (g) => unmask(g, k, false), 'the solid rectangle of one colour replaced by what symmetry ' + k + ' says is under it');
  GG('unmaskCrop' + k, 2, (g) => unmask(g, k, true), 'what symmetry ' + k + ' says lies under the solid rectangle, cropped to it');
}
for (const k of ['H', 'V', 'HV']) {
  const dirs = k === 'H' ? [true] : k === 'V' ? [false] : [true, false];
  GG('symFillOffset' + k, 2, (g) => symFillOffset(g, BG, dirs), 'background filled from a mirror axis ' + k + ' found anywhere in the grid, not only at the middle');
}
GG('unmaskOffset', 2, (g) => unmaskOffset(g, false), 'the solid rectangle replaced by what an off centre mirror axis says is under it');
GG('unmaskOffsetCrop', 2, (g) => unmaskOffset(g, true), 'what an off centre mirror axis says lies under the solid rectangle, cropped to it');
// periodic lattices
GG('periodicFill', 2, (g) => periodicFill(g, BG), 'background filled from the smallest wallpaper lattice every coloured cell agrees with');
GG('periodicUnmask', 2, (g) => periodicUnmask(g, false), 'the solid rectangle replaced by the wallpaper lattice around it');
GG('periodicUnmaskCrop', 2, (g) => periodicUnmask(g, true), 'what the wallpaper lattice says lies under the solid rectangle, cropped to it');
GG('extendRight2', 3, (g) => periodicExtend(g, g.w * 2, g.h), 'the wallpaper continued to twice the width');
GG('extendDown2', 3, (g) => periodicExtend(g, g.w, g.h * 2), 'the wallpaper continued to twice the height');
GG('extendDown15', 3, (g) => (g.h % 2 ? null : periodicExtend(g, g.w, g.h * 1.5)), 'the wallpaper continued to one and a half times the height');
GG('connectX', 2, connectDiag, 'same coloured cells on a diagonal joined by a line of their colour');
GG('upByColors', 2, (g) => { const k = byFreq(g, true).length; return k >= 2 ? up(g, k) : null; }, 'scale up by the number of distinct colours');
// colour masks
GG('keepTopColor', 2, (g) => keepColor(g, uniqueTop(byFreq(g, true)), true), 'only the most frequent non background colour kept');
GG('keepRareColor', 2, (g) => keepColor(g, uniqueBottom(byFreq(g, true)), true), 'only the least frequent colour kept');
GG('dropTopColor', 2, (g) => keepColor(g, uniqueTop(byFreq(g, true)), false), 'the most frequent non background colour removed');
GG('dropRareColor', 2, (g) => keepColor(g, uniqueBottom(byFreq(g, true)), false), 'the least frequent colour removed');
GG('invert', 2, invert, 'background and the one foreground colour swapped');
GG('removeNoise', 2, removeNoise, 'every lone pixel removed');
GG('majorityFilter', 3, majorityFilter, 'every cell takes the majority colour of its 3x3 neighbourhood');
GG('colorHistogram', 3, colorCountBar, 'one bar per colour as long as its count, most first');
// object recolouring
GG('recolorSizeRank', 2, (g) => { const l = components(g, 'c8'); const r = sizeRanks(l); return recolorObjects(g, 'c8', (o) => P + r.get(o.size)); }, 'every object painted placeholder by its size rank, largest first');
GG('recolorSize4', 2, (g) => recolorObjects(g, 'c4', (o) => P + o.size), 'every 4-connected object painted placeholder by its size');
GG('recolorSize8', 2, (g) => recolorObjects(g, 'c8', (o) => P + o.size), 'every 8-connected object painted placeholder by its size');
GG('recolorLargest', 2, (g) => { const l = components(g, 'c8'); const m = Math.max(...l.map((o) => o.size)); return recolorObjects(g, 'c8', (o) => (o.size === m ? P : null)); }, 'the largest objects painted placeholder');
GG('recolorSmallest', 2, (g) => { const l = components(g, 'c8'); const m = Math.min(...l.map((o) => o.size)); return recolorObjects(g, 'c8', (o) => (o.size === m ? P : null)); }, 'the smallest objects painted placeholder');
GG('recolorHoles', 2, (g) => recolorObjects(g, 'c8', (o) => (hasHole(g, o) ? P : null)), 'objects that enclose background painted placeholder');
GG('recolorBorder', 3, (g) => recolorObjects(g, 'c8', (o) => (touchesBorder(g, o) ? P : null)), 'objects touching the border painted placeholder');
GG('recolorShape', 3, (g) => { const l = components(g, 'c8'); const keys = new Map(); for (const o of l) { const k = objShapeKey(g, o); if (!keys.has(k)) keys.set(k, keys.size); } return recolorObjects(g, 'c8', (o) => P + keys.get(objShapeKey(g, o))); }, 'objects painted placeholder by shape, one placeholder per distinct shape in reading order');
// objects: grid to objects
for (const m of ['c4', 'c8', 'm4', 'm8', 'col']) prim('objects' + m.toUpperCase(), 'grid', 'objects', 1, (g) => objs(g, components(g, m)), 'the ' + m + ' components of the grid');
// objects to objects
const OO = (name, cost, pick, doc) => prim(name, 'objects', 'objects', cost, (v) => { const l = pick(v.list, v.src); return l && l.length ? objs(v.src, l) : null; }, doc);
OO('largest', 1, (l) => pickUnique(l, (o) => o.size, true), 'the one largest object');
OO('smallest', 1, (l) => pickUnique(l, (o) => o.size, false), 'the one smallest object');
OO('largestBox', 1, (l) => pickUnique(l, (o) => (o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1), true), 'the object with the largest bounding box');
OO('smallestBox', 2, (l) => pickUnique(l, (o) => (o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1), false), 'the object with the smallest bounding box');
OO('allLargest', 2, (l) => { const m = Math.max(...l.map((o) => o.size)); const r = l.filter((o) => o.size === m); return r.length < l.length ? r : null; }, 'every object of the largest size');
OO('dropLargest', 2, (l) => { const m = Math.max(...l.map((o) => o.size)); const r = l.filter((o) => o.size !== m); return r.length ? r : null; }, 'every object but the largest');
OO('dropSmallest', 2, (l) => { const m = Math.min(...l.map((o) => o.size)); const r = l.filter((o) => o.size !== m); return r.length ? r : null; }, 'every object but the smallest');
OO('uniqueColor', 1, (l) => { const c = new Map(); for (const o of l) c.set(o.color, (c.get(o.color) || 0) + 1); const r = l.filter((o) => c.get(o.color) === 1); return r.length === 1 ? r : null; }, 'the one object whose colour no other object has');
OO('commonColor', 2, (l) => { const c = new Map(); for (const o of l) c.set(o.color, (c.get(o.color) || 0) + 1); const r = l.filter((o) => c.get(o.color) > 1); return r.length && r.length < l.length ? r : null; }, 'the objects whose colour is shared');
OO('uniqueShape', 1, (l, g) => { const k = l.map((o) => objShapeKey(g, o)); const c = new Map(); for (const s of k) c.set(s, (c.get(s) || 0) + 1); const r = l.filter((o, i) => c.get(k[i]) === 1); return r.length === 1 ? r : null; }, 'the one object whose shape no other object has');
OO('commonShape', 2, (l, g) => { const k = l.map((o) => objShapeKey(g, o)); const c = new Map(); for (const s of k) c.set(s, (c.get(s) || 0) + 1); let top = 0; for (const n of c.values()) top = Math.max(top, n); const r = l.filter((o, i) => c.get(k[i]) === top); return top > 1 && r.length < l.length ? r : null; }, 'the objects of the most common shape');
OO('mostColors', 1, (l) => pickUnique(l, (o) => o.ncolors, true), 'the object with the most distinct colours');
OO('withHole', 2, (l, g) => { const r = l.filter((o) => hasHole(g, o)); return r.length && r.length < l.length ? r : null; }, 'the objects that enclose background');
OO('withoutHole', 2, (l, g) => { const r = l.filter((o) => !hasHole(g, o)); return r.length && r.length < l.length ? r : null; }, 'the objects that enclose nothing');
OO('touchBorder', 2, (l, g) => { const r = l.filter((o) => touchesBorder(g, o)); return r.length && r.length < l.length ? r : null; }, 'the objects touching the border');
OO('interior', 2, (l, g) => { const r = l.filter((o) => !touchesBorder(g, o)); return r.length && r.length < l.length ? r : null; }, 'the objects clear of the border');
OO('topmost', 2, (l) => pickUnique(l, (o) => o.y0, false), 'the highest object');
OO('bottommost', 2, (l) => pickUnique(l, (o) => o.y1, true), 'the lowest object');
OO('leftmost', 2, (l) => pickUnique(l, (o) => o.x0, false), 'the leftmost object');
OO('rightmost', 2, (l) => pickUnique(l, (o) => o.x1, true), 'the rightmost object');
OO('dropPixels', 2, (l) => { const r = l.filter((o) => o.size > 1); return r.length && r.length < l.length ? r : null; }, 'every object larger than one cell');
OO('densest', 2, (l) => pickUnique(l, (o) => o.size / ((o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1)), true), 'the object that fills most of its bounding box');
OO('sparsest', 2, (l) => pickUnique(l, (o) => o.size / ((o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1)), false), 'the object that fills least of its bounding box');
// objects to grid
prim('crop', 'objects', 'grid', 1, (v) => { const b = unionBox(v); return fit(renderObjs(v, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1, b.x0, b.y0)); }, 'the objects alone, cropped to their bounding box');
prim('cropRegion', 'objects', 'grid', 1, (v) => { const b = unionBox(v); return fit(sub(v.src, b.x0, b.y0, b.x1 - b.x0 + 1, b.y1 - b.y0 + 1)); }, 'the source grid cropped to the objects bounding box');
prim('render', 'objects', 'grid', 1, (v) => fit(renderObjs(v, v.src.w, v.src.h, 0, 0)), 'the objects alone, in place, on a blank grid of the source size');
prim('erase', 'objects', 'grid', 2, (v) => { const o = copy(v.src); for (const ob of v.list) for (const i of ob.idx) o.cells[i] = BG; return fit(o); }, 'the source grid with these objects erased');
prim('highlight', 'objects', 'grid', 2, (v) => { const o = copy(v.src); for (const ob of v.list) for (const i of ob.idx) o.cells[i] = P; return fit(o); }, 'the source grid with these objects painted placeholder');
prim('countRow', 'objects', 'grid', 3, (v) => fit(colorRowOfObjects(v)), 'one placeholder cell per object, in a row');
prim('colorOf', 'objects', 'color', 1, (v) => { const m = new Map(); for (const ob of v.list) for (const i of ob.idx) { const c = v.src.cells[i]; m.set(c, (m.get(c) || 0) + 1); } let bc = null, bn = 0; for (const [c, n] of m) if (n > bn) { bn = n; bc = c; } return bc === null ? null : { t: 'color', c: bc }; }, 'the dominant colour of the objects');
// grid to colour, colour to grid
prim('majorityColor', 'grid', 'color', 2, (g) => ({ t: 'color', c: byFreq(g, false)[0][0] }), 'the most frequent colour, background included');
prim('topColor', 'grid', 'color', 2, (g) => { const c = uniqueTop(byFreq(g, true)); return c === null ? null : { t: 'color', c }; }, 'the most frequent non background colour');
prim('rareColor', 'grid', 'color', 2, (g) => { const c = uniqueBottom(byFreq(g, true)); return c === null ? null : { t: 'color', c }; }, 'the least frequent colour');
prim('pixel', 'color', 'grid', 1, (v) => { const o = grid(1, 1); o.cells[0] = v.c; return o; }, 'a 1x1 grid of the colour');

// ---------------------------------------------------------------- learned last steps
// Each learner reads its parameters off the train pairs, or refuses with null. The search
// calls learn() with the grids a program prefix produced for the train inputs, the wanted
// outputs, and the grids it produced for the test inputs (a learner that cannot cover a test
// input refuses rather than guess).
export const LEARNERS = [];
function learner(name, cost, learn, apply, doc) {
  const l = Object.freeze({ name, from: 'grid', to: 'grid', cost, learn, apply, doc, learned: true });
  if (BY_NAME.has(name)) throw new Error('grid-dsl: duplicate primitive ' + name);
  LEARNERS.push(l); BY_NAME.set(name, l);
}

learner('colormap', 1, (states, wanted, tests) => {
  const map = new Map();
  for (let d = 0; d < states.length; d++) {
    const a = states[d], b = wanted[d];
    if (a.w !== b.w || a.h !== b.h) return null;
    for (let i = 0; i < a.cells.length; i++) {
      const s = map.get(a.cells[i]);
      if (s === undefined) map.set(a.cells[i], b.cells[i]); else if (s !== b.cells[i]) return null;
    }
  }
  // a test colour the train pairs never showed has no mapping to read, so the map refuses
  // rather than pass it through unchanged and call that a prediction
  for (const t of tests || []) for (let i = 0; i < t.cells.length; i++) if (!map.has(t.cells[i])) return null;
  const obj = {}; let identity = true;
  for (const [k, v] of map) { obj[k] = v; if (k !== v) identity = false; }
  return identity ? null : { map: obj };
}, (g, p) => { const o = copy(g); for (let i = 0; i < o.cells.length; i++) { const v = p.map[o.cells[i]]; if (v !== undefined) o.cells[i] = v; } return o; }, 'recolour through a map read off the train pairs');

learner('constant', 1, (states, wanted) => {
  for (let d = 1; d < wanted.length; d++) if (!sameGrid(wanted[d], wanted[0])) return null;
  return { rows: toRows(wanted[0]) };
}, (g, p) => fromRows(p.rows), 'the one output every train pair shares');

const SYM_NAMES = ['id', 'flipH', 'flipV', 'rot180', 'transpose', 'antiTranspose', 'rot90', 'rot270'];
learner('tileSym', 2, (states, wanted, tests) => {
  let nx = null, ny = null;
  for (let d = 0; d < states.length; d++) {
    const s = states[d], o = wanted[d];
    if (o.w % s.w || o.h % s.h) return null;
    const a = o.w / s.w, b = o.h / s.h;
    if (nx === null) { nx = a; ny = b; } else if (nx !== a || ny !== b) return null;
  }
  if (nx * ny < 2) return null;
  for (const t of tests) if (t.w * nx > MAX_SIDE || t.h * ny > MAX_SIDE) return null;
  const blocks = [];
  for (let by = 0; by < ny; by++) for (let bx = 0; bx < nx; bx++) {
    let chosen = null;
    for (const name of SYM_NAMES.concat(['blank'])) {
      let okAll = true;
      for (let d = 0; d < states.length && okAll; d++) {
        const s = states[d], o = wanted[d];
        const t = name === 'blank' ? grid(s.w, s.h) : SYMMETRIES[name](s);
        if (t.w !== s.w || t.h !== s.h) { okAll = false; break; }
        for (let y = 0; y < s.h && okAll; y++) for (let x = 0; x < s.w; x++) if (o.cells[(by * s.h + y) * o.w + bx * s.w + x] !== t.cells[y * s.w + x]) { okAll = false; break; }
      }
      if (okAll) { chosen = name; break; }
    }
    if (!chosen) return null;
    blocks.push(chosen);
  }
  return { nx, ny, blocks };
}, (g, p) => {
  if (g.w * p.nx > MAX_SIDE || g.h * p.ny > MAX_SIDE) return null;
  const o = grid(g.w * p.nx, g.h * p.ny);
  for (let by = 0; by < p.ny; by++) for (let bx = 0; bx < p.nx; bx++) {
    const name = p.blocks[by * p.nx + bx];
    if (name === 'blank') continue;
    const t = SYMMETRIES[name](g);
    if (t.w !== g.w || t.h !== g.h) return null;
    place(o, t, bx * g.w, by * g.h);
  }
  return o;
}, 'the output as tiles, each tile one of the eight symmetries of the input or blank, read off the train pairs');

learner('fixedCrop', 2, (states, wanted) => {
  const W = wanted[0].w, H = wanted[0].h;
  for (const o of wanted) if (o.w !== W || o.h !== H) return null;
  // an output of one colour is a colour decision, and a window that happens to land on that
  // colour in every train pair is a coincidence, not a crop
  if (wanted.every((o) => colorCounts(o).size === 1)) return null;
  for (const anchor of ['tl', 'tr', 'bl', 'br']) {
    const s0 = states[0];
    for (let oy = 0; oy + H <= s0.h; oy++) for (let ox = 0; ox + W <= s0.w; ox++) {
      let okAll = true;
      for (let d = 0; d < states.length && okAll; d++) {
        const s = states[d];
        const x = anchor[1] === 'l' ? ox : s.w - W - ox, y = anchor[0] === 't' ? oy : s.h - H - oy;
        const c = sub(s, x, y, W, H);
        if (!c || !sameGrid(c, wanted[d])) okAll = false;
      }
      if (okAll) return { anchor, ox, oy, w: W, h: H };
    }
  }
  return null;
}, (g, p) => sub(g, p.anchor[1] === 'l' ? p.ox : g.w - p.w - p.ox, p.anchor[0] === 't' ? p.oy : g.h - p.h - p.oy, p.w, p.h), 'a fixed window of the grid, anchored to one corner, read off the train pairs');

// THE LOCAL RULE. Output cell = f(a description of the input cell's surroundings), with f a
// lookup table read off every cell of every train pair. The descriptions run from the least
// specific to the most, and the first one that is consistent on every train cell AND has seen
// every description a test cell presents is taken: the simplest rule that explains the pairs
// and can answer the test without guessing.
function rayColor(g, x, y, dx, dy) {
  let nx = x + dx, ny = y + dy;
  while (nx >= 0 && ny >= 0 && nx < g.w && ny < g.h) { const v = g.cells[ny * g.w + nx]; if (v !== BG) return v; nx += dx; ny += dy; }
  return -1;
}
const at = (g, x, y) => (x < 0 || y < 0 || x >= g.w || y >= g.h ? -1 : g.cells[y * g.w + x]);
const FEATURES = Object.freeze({
  n4: (g, x, y) => g.cells[y * g.w + x] + '|' + at(g, x + 1, y) + ',' + at(g, x - 1, y) + ',' + at(g, x, y + 1) + ',' + at(g, x, y - 1),
  n4count: (g, x, y) => { let n = 0; for (const [dx, dy] of N4) { const v = at(g, x + dx, y + dy); if (v > 0) n++; } return g.cells[y * g.w + x] + '|' + n; },
  n8count: (g, x, y) => { let n = 0; for (const [dx, dy] of N8) { const v = at(g, x + dx, y + dy); if (v > 0) n++; } return g.cells[y * g.w + x] + '|' + n; },
  n8colors: (g, x, y) => { const s = new Set(); for (const [dx, dy] of N8) { const v = at(g, x + dx, y + dy); if (v > 0) s.add(v); } return g.cells[y * g.w + x] + '|' + [...s].sort((a, b) => a - b).join(','); },
  rays4: (g, x, y) => g.cells[y * g.w + x] + '|' + rayColor(g, x, y, 1, 0) + ',' + rayColor(g, x, y, -1, 0) + ',' + rayColor(g, x, y, 0, 1) + ',' + rayColor(g, x, y, 0, -1),
  rowcol: (g, x, y) => { const r = new Set(), c = new Set(); for (let i = 0; i < g.w; i++) { const v = g.cells[y * g.w + i]; if (v > 0) r.add(v); } for (let j = 0; j < g.h; j++) { const v = g.cells[j * g.w + x]; if (v > 0) c.add(v); } return g.cells[y * g.w + x] + '|' + [...r].sort().join(',') + '|' + [...c].sort().join(','); },
  n8: (g, x, y) => { let s = String(g.cells[y * g.w + x]); for (const [dx, dy] of N8) s += ',' + at(g, x + dx, y + dy); return s; },
  rays8: (g, x, y) => { let s = String(g.cells[y * g.w + x]); for (const [dx, dy] of N8) s += ',' + rayColor(g, x, y, dx, dy); return s; },
  parity: (g, x, y) => g.cells[y * g.w + x] + '|' + (x % 2) + (y % 2),
  n8parity: (g, x, y) => FEATURES.n8(g, x, y) + '|' + (x % 2) + (y % 2),
  // the colour a cell is BETWEEN: the same colour seen both ways along a row, or a column
  rays4pair: (g, x, y) => { const r = rayColor(g, x, y, 1, 0), l = rayColor(g, x, y, -1, 0), d = rayColor(g, x, y, 0, 1), u = rayColor(g, x, y, 0, -1); return g.cells[y * g.w + x] + '|' + (r === l ? r : 'x') + '|' + (d === u ? d : 'x'); },
  mod3: (g, x, y) => g.cells[y * g.w + x] + '|' + (x % 3) + (y % 3),
});
export const FEATURE_ORDER = Object.freeze(['n4count', 'n8count', 'n8colors', 'n4', 'rowcol', 'rays4', 'parity', 'n8', 'rays8', 'n8parity', 'rays4pair', 'mod3']);
learner('localRule', 3, (states, wanted, tests) => {
  for (let d = 0; d < states.length; d++) if (states[d].w !== wanted[d].w || states[d].h !== wanted[d].h) return null;
  for (const name of FEATURE_ORDER) {
    const f = FEATURES[name];
    const table = new Map();
    let consistent = true, changes = 0;
    for (let d = 0; d < states.length && consistent; d++) {
      const s = states[d], o = wanted[d];
      for (let y = 0; y < s.h && consistent; y++) for (let x = 0; x < s.w; x++) {
        const k = f(s, x, y), want = o.cells[y * s.w + x];
        const had = table.get(k);
        if (had === undefined) { table.set(k, want); if (want !== s.cells[y * s.w + x]) changes++; } else if (had !== want) { consistent = false; break; }
      }
    }
    if (!consistent || changes === 0) continue;
    let covered = true;
    for (const t of tests) { for (let y = 0; y < t.h && covered; y++) for (let x = 0; x < t.w; x++) if (!table.has(f(t, x, y))) { covered = false; break; } if (!covered) break; }
    if (!covered) continue;
    return { feature: name, table: Object.fromEntries(table) };
  }
  return null;
}, (g, p) => {
  const f = FEATURES[p.feature]; const o = grid(g.w, g.h);
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) { const v = p.table[f(g, x, y)]; if (v === undefined) return null; o.cells[y * g.w + x] = v; }
  return o;
}, 'every cell rewritten by a table from a description of its neighbourhood, the simplest description consistent with every train cell');

// THE STAMP. Every source of one key gets the same picture painted around it, read off the
// train pairs. A source is one cell of a colour (mode 'cell') or one single colour object of a
// colour and shape (mode 'shape'). An offset joins the stamp only when every train instance
// that can see it shows the same colour there. Paint lands on background, or on the source
// itself; never on another object. The stamp must rebuild every train output exactly. A test
// source whose key no train pair showed is a refusal, unless the key is a bare colour (mode
// 'cell') and the train pairs showed at least two colours that paint nothing: then an unseen
// colour is taken to paint nothing too. Shapes vary too much for that default.
function stampSources(g, mode) {
  if (mode === 'cell') {
    const out = [];
    for (let i = 0; i < g.cells.length; i++) if (g.cells[i] !== BG) { const x = i % g.w, y = (i / g.w) | 0; out.push({ key: String(g.cells[i]), x0: x, y0: y, x1: x, y1: y, own: [i] }); }
    return out;
  }
  return components(g, 'c8').map((o) => ({ key: o.color + '/' + objShapeKey(g, o), x0: o.x0, y0: o.y0, x1: o.x1, y1: o.y1, own: o.idx }));
}
function stampPaint(g, p) {
  const o = copy(g);
  for (const s of stampSources(g, p.mode)) {
    const st = p.stamps[s.key];
    if (st === undefined) { if (p.inertDefault) continue; return null; }
    const own = new Set(s.own);
    for (const [dx, dy, v] of st) {
      const x = s.x0 + dx, y = s.y0 + dy;
      if (x < 0 || y < 0 || x >= g.w || y >= g.h) continue;
      const i = y * g.w + x;
      if (g.cells[i] === BG || own.has(i)) o.cells[i] = v;
    }
  }
  return o;
}
function stampLearn(states, wanted, tests, mode, r) {
  const acc = new Map(), seenTimes = new Map();
  for (let d = 0; d < states.length; d++) {
    const s = states[d], o = wanted[d];
    for (const src of stampSources(s, mode)) {
      let m = acc.get(src.key); if (!m) acc.set(src.key, m = new Map());
      seenTimes.set(src.key, (seenTimes.get(src.key) || 0) + 1);
      const own = new Set(src.own);
      for (let y = src.y0 - r; y <= src.y1 + r; y++) for (let x = src.x0 - r; x <= src.x1 + r; x++) {
        if (x < 0 || y < 0 || x >= s.w || y >= s.h) continue;
        const i = y * s.w + x;
        if (s.cells[i] !== BG && !own.has(i)) continue;
        const k = (x - src.x0) + ',' + (y - src.y0), v = o.cells[i];
        const had = m.get(k);
        if (had === undefined) m.set(k, v); else if (had !== v) m.set(k, -1);
      }
    }
  }
  if (!acc.size) return null;
  const stamps = {};
  for (const [key, m] of acc) {
    const st = [];
    for (const [k, v] of m) { if (v < 0) continue; const [dx, dy] = k.split(',').map(Number); st.push([dx, dy, v]); }
    stamps[key] = st;
  }
  const p = { mode, r, stamps, inertDefault: false };
  const fits = () => { for (let d = 0; d < states.length; d++) { const got = stampPaint(states[d], p); if (!got || !sameGrid(got, wanted[d])) return false; } return true; };
  if (!fits()) return null;
  // MINIMAL: drop every entry the train pairs do not need, the farthest first, so an offset
  // that only ever saw paint from a neighbouring source does not travel to the test
  for (const key of Object.keys(stamps)) {
    const st = stamps[key];
    const order = st.map((e, i) => i).sort((a, b) => (Math.abs(st[b][0]) + Math.abs(st[b][1])) - (Math.abs(st[a][0]) + Math.abs(st[a][1])));
    const keep = new Array(st.length).fill(true);
    for (const i of order) {
      keep[i] = false;
      stamps[key] = st.filter((e, j) => keep[j]);
      if (!fits()) keep[i] = true;
    }
    stamps[key] = st.filter((e, j) => keep[j]);
  }
  // a key is active when painting its stamp changed a cell of some train input
  const active = new Set();
  for (const st of states) for (const src of stampSources(st, mode)) {
    if (active.has(src.key)) continue;
    const own = new Set(src.own);
    for (const [dx, dy, v] of stamps[src.key]) {
      const x = src.x0 + dx, y = src.y0 + dy;
      if (x < 0 || y < 0 || x >= st.w || y >= st.h) continue;
      const i = y * st.w + x;
      if ((st.cells[i] === BG || own.has(i)) && st.cells[i] !== v) { active.add(src.key); break; }
    }
  }
  if (!active.size) return null;
  // SEEN TWICE: a stamp the train pairs showed on one source only is a fit to that source, not
  // a rule; every key that paints must have been seen at least twice
  for (const key of active) if (seenTimes.get(key) < 2) return null;
  p.inertDefault = mode === 'cell' && acc.size - active.size >= 2;
  for (const t of tests) for (const src of stampSources(t, mode)) if (!acc.has(src.key) && !p.inertDefault) return null;
  return p;
}
learner('stamp', 3, (states, wanted, tests) => {
  for (let d = 0; d < states.length; d++) if (states[d].w !== wanted[d].w || states[d].h !== wanted[d].h) return null;
  // STABLE ONLY: a window one cell wider must learn too and answer every test the same way. A
  // pattern that runs past its window would be cut short on a bigger test, so it is refused.
  for (const [mode, r] of [['cell', 1], ['shape', 1], ['cell', 2], ['shape', 2]]) {
    const p = stampLearn(states, wanted, tests, mode, r);
    if (!p) continue;
    const q = stampLearn(states, wanted, tests, mode, r + 1);
    if (!q) continue;
    let same = true;
    for (const t of tests) { const a = stampPaint(t, p), b = stampPaint(t, q); if (!a || !b || !sameGrid(a, b)) { same = false; break; } }
    if (same) return p;
  }
  return null;
}, stampPaint, 'a picture painted around every cell of a colour, or every object of a colour and shape, read off the train pairs');

// THE LEARNED RAY. Each colour's sources shoot rays in the directions the train pairs show,
// painted in the colour they show, over background only. A source is a single pixel (mode
// 'pixel') or any cell (mode 'cell'); a ray either stops at the first cell that is not
// background ('stop') or passes it and goes on to the border ('pass'). An unseen test colour is
// a refusal, unless the train pairs showed at least two colours that shoot nothing. A colour
// that shoots must have been seen as a source at least twice, the stamp's rule.
const DIR8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
function raySources(g, mode) {
  if (mode === 'cell') { const out = []; for (let i = 0; i < g.cells.length; i++) if (g.cells[i] !== BG) out.push(i); return out; }
  return components(g, 'c8').filter((o) => o.size === 1).map((o) => o.idx[0]);
}
function rayWalk(g, i, dx, dy, stop, visit) {
  let x = i % g.w + dx, y = ((i / g.w) | 0) + dy;
  while (x >= 0 && y >= 0 && x < g.w && y < g.h) {
    const j = y * g.w + x;
    if (g.cells[j] !== BG) { if (stop) return; } else visit(j);
    x += dx; y += dy;
  }
}
function rayPaint(g, p) {
  const o = copy(g);
  for (const i of raySources(g, p.mode)) {
    const rs = p.rays[g.cells[i]];
    if (rs === undefined) { if (p.inertDefault) continue; return null; }
    for (const [dir, v] of rs) { const [dx, dy] = DIR8[dir]; rayWalk(g, i, dx, dy, p.stop, (j) => { o.cells[j] = v; }); }
  }
  return o;
}
learner('rayLearned', 3, (states, wanted, tests) => {
  for (let d = 0; d < states.length; d++) if (states[d].w !== wanted[d].w || states[d].h !== wanted[d].h) return null;
  for (const [mode, stop] of [['pixel', true], ['pixel', false], ['cell', true], ['cell', false]]) {
    // per colour and direction: the one colour every ray cell shows, or -1 when they disagree
    const seen = new Map(), times = new Map();
    for (let d = 0; d < states.length; d++) {
      const s = states[d], o = wanted[d];
      for (const i of raySources(s, mode)) {
        const c = s.cells[i];
        times.set(c, (times.get(c) || 0) + 1);
        let per = seen.get(c); if (!per) seen.set(c, per = new Array(8).fill(undefined));
        for (let dir = 0; dir < 8; dir++) {
          const [dx, dy] = DIR8[dir];
          rayWalk(s, i, dx, dy, stop, (j) => { const v = o.cells[j]; per[dir] = per[dir] === undefined ? v : per[dir] === v ? v : -1; });
        }
      }
    }
    if (!seen.size) continue;
    const rays = {};
    let any = false, inert = 0;
    for (const [c, per] of seen) { rays[c] = []; for (let dir = 0; dir < 8; dir++) if (per[dir] !== undefined && per[dir] > BG) { rays[c].push([dir, per[dir]]); any = true; } if (!rays[c].length) inert++; }
    if (!any) continue;
    if (Object.keys(rays).some((c) => rays[c].length && times.get(Number(c)) < 2)) continue;
    const inertDefault = inert >= 2;
    let covered = true;
    for (const t of tests) for (const i of raySources(t, mode)) if (!seen.has(t.cells[i]) && !inertDefault) { covered = false; break; }
    if (!covered) continue;
    const p = { mode, stop, rays, inertDefault };
    let ok = true;
    for (let d = 0; d < states.length && ok; d++) { const got = rayPaint(states[d], p); if (!got || !sameGrid(got, wanted[d])) ok = false; }
    if (ok) return p;
  }
  return null;
}, rayPaint, 'rays from every source of a colour in the directions and colours the train pairs show, over background');

// THE OBJECT RULE. Every object is recoloured whole (colour 0 deletes it) or kept, by a table
// from ONE description of the object read off the train pairs: its size, its size rank, its
// shape, whether it is the largest, whether it encloses background, and so on. Background must
// come through untouched. The first description that is consistent on every train object and
// has seen every test object's description wins, the same Occam rule as the local rule.
function shapeKeyRot(g, o) {
  const w = o.x1 - o.x0 + 1, h = o.y1 - o.y0 + 1;
  const m = grid(w, h);
  for (const i of o.idx) m.cells[(((i / g.w) | 0) - o.y0) * w + (i % g.w - o.x0)] = 1;
  let best = null;
  for (const f of Object.values(SYMMETRIES)) { const t = f(m); const k = t.w + ':' + t.h + ':' + t.cells.join(''); if (best === null || k < best) best = k; }
  return best;
}
const OBJ_FEATURES = Object.freeze({
  isLargest: (g, o, l) => o.size === Math.max(...l.map((q) => q.size)),
  isSmallest: (g, o, l) => o.size === Math.min(...l.map((q) => q.size)),
  hasHole: (g, o) => hasHole(g, o),
  touchesBorder: (g, o) => touchesBorder(g, o),
  isRect: (g, o) => o.size === (o.x1 - o.x0 + 1) * (o.y1 - o.y0 + 1),
  size: (g, o) => o.size,
  sizeRank: (g, o, l) => [...new Set(l.map((q) => q.size))].sort((a, b) => b - a).indexOf(o.size),
  sizeRankUp: (g, o, l) => [...new Set(l.map((q) => q.size))].sort((a, b) => a - b).indexOf(o.size),
  height: (g, o) => o.y1 - o.y0 + 1,
  width: (g, o) => o.x1 - o.x0 + 1,
  shape: (g, o) => objShapeKey(g, o),
  shapeRot: (g, o) => shapeKeyRot(g, o),
  colorSize: (g, o) => o.color + '/' + o.size,
  colorShape: (g, o) => o.color + '/' + objShapeKey(g, o),
  shapeCount: (g, o, l) => { const k = objShapeKey(g, o); return l.filter((q) => objShapeKey(g, q) === k).length; },
  colorCount: (g, o, l) => l.filter((q) => q.color === o.color).length,
});
learner('objectRecolor', 2, (states, wanted, tests) => {
  for (let d = 0; d < states.length; d++) if (states[d].w !== wanted[d].w || states[d].h !== wanted[d].h) return null;
  for (const mode of ['c8', 'c4', 'm8']) {
    // what each train object became: one colour, or kept as it was
    const seen = [];
    let okMode = true;
    for (let d = 0; d < states.length && okMode; d++) {
      const s = states[d], o = wanted[d];
      for (let i = 0; i < s.cells.length; i++) if (s.cells[i] === BG && o.cells[i] !== BG) { okMode = false; break; }
      if (!okMode) break;
      const list = components(s, mode);
      for (const ob of list) {
        const c0 = o.cells[ob.idx[0]];
        let uniform = true, kept = true;
        for (const i of ob.idx) { if (o.cells[i] !== c0) uniform = false; if (o.cells[i] !== s.cells[i]) kept = false; }
        if (!uniform && !kept) { okMode = false; break; }
        seen.push({ d, ob, list, target: uniform ? c0 : -2, own: ob.ncolors === 1 ? ob.color : -1 });
      }
    }
    if (!okMode || !seen.length) continue;
    if (seen.every((e) => e.target === e.own || e.target === -2)) continue;   // nothing changed
    for (const [fname, f] of Object.entries(OBJ_FEATURES)) {
      const table = new Map();
      for (const e of seen) {
        const k = String(f(states[e.d], e.ob, e.list));
        if (!table.has(k)) table.set(k, []);
        table.get(k).push(e);
      }
      const rule = {};
      let consistent = true;
      for (const [k, es] of table) {
        if (es.every((e) => e.target === es[0].target && e.target !== -2)) rule[k] = es[0].target;
        else if (es.every((e) => e.target === -2 || e.target === e.own)) rule[k] = 'keep';
        else { consistent = false; break; }
      }
      if (!consistent) continue;
      let covered = true;
      for (const t of tests) { const l = components(t, mode); for (const ob of l) if (!(String(f(t, ob, l)) in rule)) { covered = false; break; } if (!covered) break; }
      if (!covered) continue;
      return { mode, feature: fname, rule };
    }
  }
  return null;
}, (g, p) => {
  const f = OBJ_FEATURES[p.feature]; const list = components(g, p.mode);
  const o = copy(g);
  for (const ob of list) {
    const r = p.rule[String(f(g, ob, list))];
    if (r === undefined) return null;
    if (r === 'keep') continue;
    for (const i of ob.idx) o.cells[i] = r;
  }
  return o;
}, 'every object recoloured, deleted or kept by a table from one description of it, read off the train pairs');

// THE LEARNED KRONECKER. The output is the input's own grid of blocks: block (i, j) is a copy
// of the input, a blank, or the input's inverse, decided by the colour of input cell (i, j).
learner('kronLearned', 2, (states, wanted, tests) => {
  const rule = new Map();
  for (let d = 0; d < states.length; d++) {
    const s = states[d], o = wanted[d];
    if (o.w !== s.w * s.w || o.h !== s.h * s.h) return null;
    const inv = grid(s.w, s.h);
    const fg = byFreq(s, true); const f = fg.length ? fg[0][0] : 1;
    for (let i = 0; i < s.cells.length; i++) inv.cells[i] = s.cells[i] === BG ? f : BG;
    for (let by = 0; by < s.h; by++) for (let bx = 0; bx < s.w; bx++) {
      const blk = sub(o, bx * s.w, by * s.h, s.w, s.h);
      const kind = sameGrid(blk, s) ? 'copy' : blk.cells.every((v) => v === BG) ? 'blank' : sameGrid(blk, inv) ? 'inverse' : null;
      if (!kind) return null;
      const c = s.cells[by * s.w + bx];
      const had = rule.get(c);
      if (had === undefined) rule.set(c, kind); else if (had !== kind) return null;
    }
  }
  if (![...rule.values()].some((k) => k !== 'blank')) return null;
  for (const t of tests) { if (t.w * t.w > MAX_SIDE || t.h * t.h > MAX_SIDE) return null; for (const v of t.cells) if (!rule.has(v)) return null; }
  return { rule: Object.fromEntries(rule) };
}, (g, p) => {
  if (g.w * g.w > MAX_SIDE || g.h * g.h > MAX_SIDE) return null;
  const o = grid(g.w * g.w, g.h * g.h);
  const fg = byFreq(g, true); const f = fg.length ? fg[0][0] : 1;
  const inv = grid(g.w, g.h); for (let i = 0; i < g.cells.length; i++) inv.cells[i] = g.cells[i] === BG ? f : BG;
  for (let by = 0; by < g.h; by++) for (let bx = 0; bx < g.w; bx++) {
    const kind = p.rule[g.cells[by * g.w + bx]];
    if (kind === undefined) return null;
    if (kind === 'copy') place(o, g, bx * g.w, by * g.h); else if (kind === 'inverse') place(o, inv, bx * g.w, by * g.h);
  }
  return o;
}, 'a grid of blocks, each a copy, a blank or the inverse of the input by the colour of one input cell, read off the train pairs');

learner('extendTo', 2, (states, wanted, tests) => {
  const W = wanted[0].w, H = wanted[0].h;
  if (!wanted.every((o) => o.w === W && o.h === H)) return null;
  if (states.every((s) => s.w === W && s.h === H)) return null;
  return { w: W, h: H };
}, (g, p) => periodicExtend(g, p.w, p.h), 'the wallpaper of the grid continued to the one output size every train pair shares');

export function byName(name) { return BY_NAME.get(name) || null; }
export const VOCABULARY_SIZE = PRIMS.length + LEARNERS.length;

// ---------------------------------------------------------------- macros (capability/grid-library.mjs)
// A macro is a named composition of two or more base primitives, learned by
// capability/grid-library.mjs from programs that solved TRAINING tasks. It is registered here so
// applyStep, and therefore the grid.dsl cell, runs it by name like any other word (a program that
// uses one is still wired and graded as grid.dsl cells, and the census counts those cells). It is
// NOT pushed onto PRIMS: a search that was not handed the library never tries a macro, and
// VOCABULARY_SIZE stays the base vocabulary. The name IS the composition (the ops joined by '+'),
// so a program's names can be expanded back to base words without the library in hand.
export const MACRO_JOIN = '+';
const MACROS = new Map();
export function macroNameOf(ops) { return ops.join(MACRO_JOIN); }
/**
 * Register one macro: ops are base primitive names (not learners, not macros) whose types chain.
 * Registering the same composition again is a no-op; the registered primitive is returned.
 */
export function defineMacro(ops) {
  if (!Array.isArray(ops) || ops.length < 2) throw new Error('grid-dsl: a macro is two or more base primitives');
  const name = macroNameOf(ops);
  const had = MACROS.get(name);
  if (had) return had;
  const parts = ops.map((op) => {
    const p = BY_NAME.get(op);
    if (!p || p.learned || MACROS.has(op)) throw new Error('grid-dsl: macro step ' + op + ' is not a base primitive');
    return p;
  });
  for (let i = 1; i < parts.length; i++) if (parts[i].from !== parts[i - 1].to) throw new Error('grid-dsl: macro ' + name + ' does not type check at ' + parts[i].name);
  const apply = (v) => {
    let x = v;
    for (const p of parts) { x = p.apply(x); if (!x) return null; }
    return x;
  };
  const cost = parts.reduce((s, p) => s + p.cost, 0);
  const m = Object.freeze({ name, from: parts[0].from, to: parts[parts.length - 1].to, cost, apply, doc: 'macro: ' + parts.map((p) => p.doc).join(', then '), learned: false, macro: true, ops: Object.freeze(ops.slice()) });
  if (BY_NAME.has(name)) throw new Error('grid-dsl: macro name ' + name + ' collides with a primitive');
  MACROS.set(name, m); BY_NAME.set(name, m);
  return m;
}
export function isMacro(name) { return MACROS.has(name); }
/** The base words of a name: a registered macro's ops, a '+' joined composition split, or the name itself. */
export function expandName(name) {
  const m = MACROS.get(name);
  if (m) return m.ops.slice();
  return String(name).includes(MACRO_JOIN) ? String(name).split(MACRO_JOIN) : [name];
}
export function macroCount() { return MACROS.size; }

/** Apply one program step (a primitive, or a learner with its learned params) to one value. */
export function applyStep(step, value) {
  const p = BY_NAME.get(step.op);
  if (!p || !value) return null;
  try { return p.learned ? fit(p.apply(value, step.learned)) : p.apply(value); } catch { return null; }
}

// ---------------------------------------------------------------- the cells
const lastSig = (mail) => (mail.length ? mail[mail.length - 1].sig : null);
if (!hasKind('grid.dsl')) {
  defineKind('grid.dsl', {
    doc: 'One step of the grid vocabulary in capability/grid-dsl.mjs: params.op names the primitive, params.learned carries the parameters a learner read off the train pairs. Emits the value the step makes, or nothing when the step refuses.',
    ports: { in: [{ name: 'in', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
    defaults: { op: '', learned: null },
    compute: (ins, cell) => {
      const sig = lastSig(ins[0]);
      if (!sig) return [null];
      const out = applyStep({ op: cell.params.op, learned: cell.params.learned }, sig.data);
      return [out ? { kind: 'event', data: out } : null];
    },
  });
}
if (!hasKind('grid.dsl.match')) {
  defineKind('grid.dsl.match', {
    doc: 'Compares the grid on port a with the grid on port b cell by cell. Emits { equal, diff, sameShape }. Holds each side until it is replaced, so the two may arrive on different ticks.',
    ports: { in: [{ name: 'a', kinds: ['event'] }, { name: 'b', kinds: ['event'] }], out: [{ name: 'out', kinds: ['event'] }] },
    init: () => ({ a: null, b: null }),
    compute: (ins, cell) => {
      const a = lastSig(ins[0]), b = lastSig(ins[1]);
      if (a) cell.state.a = a.data;
      if (b) cell.state.b = b.data;
      const A = cell.state.a, B = cell.state.b;
      if (!A || !B) return [null];
      const sameShape = isGrid(A) && isGrid(B) && A.w === B.w && A.h === B.h;
      let diff = sameShape ? 0 : -1;
      if (sameShape) for (let i = 0; i < A.cells.length; i++) if (A.cells[i] !== B.cells[i]) diff++;
      return [{ kind: 'event', data: { equal: sameShape && diff === 0, diff, sameShape } }];
    },
  });
}
export const DSL_KINDS = Object.freeze(['grid.dsl', 'grid.dsl.match']);
