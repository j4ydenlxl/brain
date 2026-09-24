// cells/grid.mjs: ORTHOGONAL GRID PRIMITIVES. Small integer-coloured grids travel as
// event signals { w, h, cells: [...] }, row major, cells.length === w * h. Eleven cell
// kinds, each one operation and nothing else, so that a program over grids is a path
// through the connectome rather than a function somebody wrote for one task.
//
// Seven of them are grid to grid and therefore composable: rotate, flip, transpose,
// colormap, crop, translate, tile. Three are readings that leave the grid domain:
// count colours, connected components, symmetry detect. One takes two grids: overlay.
// tasks/grid.mjs searches compositions of the seven; the other four are measured on
// their own in test/tasks.test.mjs, because an operation nothing has ever run is not a
// capability.
//
// The pure functions are exported as G so a search can try thousands of candidate
// programs without paying for a tick each time; the program that wins is then executed
// through real cells, and that execution is what gets graded.
import { defineKind } from '../core/cell.mjs';

const first = (mail) => (mail.length ? mail[mail.length - 1].sig : null);

// ---------------------------------------------------------------- pure grid algebra
export const G = {
  make(w, h, fill = 0) { return { w, h, cells: new Array(w * h).fill(fill) }; },
  from(rows) { const h = rows.length, w = rows[0].length; const cells = []; for (const r of rows) { if (r.length !== w) throw new Error('grid: ragged rows'); cells.push(...r); } return { w, h, cells }; },
  rows(g) { const out = []; for (let y = 0; y < g.h; y++) out.push(g.cells.slice(y * g.w, y * g.w + g.w)); return out; },
  clone(g) { return { w: g.w, h: g.h, cells: g.cells.slice() }; },
  at(g, x, y) { return g.cells[y * g.w + x]; },
  valid(g) { return !!g && Number.isInteger(g.w) && Number.isInteger(g.h) && g.w > 0 && g.h > 0 && Array.isArray(g.cells) && g.cells.length === g.w * g.h; },
  equal(a, b) {
    if (!a || !b || a.w !== b.w || a.h !== b.h) return false;
    for (let i = 0; i < a.cells.length; i++) if (a.cells[i] !== b.cells[i]) return false;
    return true;
  },
  key(g) { return g.w + 'x' + g.h + ':' + g.cells.join(','); },
  toString(g) { return G.rows(g).map(r => r.join('')).join('\n'); },

  // 90 degrees clockwise per turn
  rotate(g, turns = 1) {
    let cur = G.clone(g);
    const t = ((turns % 4) + 4) % 4;
    for (let k = 0; k < t; k++) {
      const out = { w: cur.h, h: cur.w, cells: new Array(cur.w * cur.h) };
      for (let y = 0; y < cur.h; y++) for (let x = 0; x < cur.w; x++) {
        const nx = cur.h - 1 - y, ny = x;
        out.cells[ny * out.w + nx] = cur.cells[y * cur.w + x];
      }
      cur = out;
    }
    return cur;
  },
  // 'h' mirrors left to right, 'v' mirrors top to bottom
  flip(g, axis = 'h') {
    const out = G.make(g.w, g.h);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      const sx = axis === 'h' ? g.w - 1 - x : x;
      const sy = axis === 'v' ? g.h - 1 - y : y;
      out.cells[y * g.w + x] = g.cells[sy * g.w + sx];
    }
    return out;
  },
  transpose(g) {
    const out = { w: g.h, h: g.w, cells: new Array(g.w * g.h) };
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) out.cells[x * out.w + y] = g.cells[y * g.w + x];
    return out;
  },
  colormap(g, map) {
    const out = G.clone(g);
    for (let i = 0; i < out.cells.length; i++) { const v = map[out.cells[i]]; if (v !== undefined) out.cells[i] = v; }
    return out;
  },
  crop(g, x, y, w, h) {
    if (w <= 0 || h <= 0 || x < 0 || y < 0 || x + w > g.w || y + h > g.h) return null;
    const out = G.make(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) out.cells[j * w + i] = g.cells[(y + j) * g.w + (x + i)];
    return out;
  },
  // tightest rectangle holding every cell that is not the background colour
  cropBBox(g, bg = 0) {
    let x0 = g.w, y0 = g.h, x1 = -1, y1 = -1;
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (g.cells[y * g.w + x] !== bg) {
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
    if (x1 < 0) return G.clone(g);            // nothing but background: a bbox of nothing is the grid itself
    return G.crop(g, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  },
  translate(g, dx, dy, { wrap = false, fill = 0 } = {}) {
    const out = G.make(g.w, g.h, fill);
    for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
      let nx = x + dx, ny = y + dy;
      if (wrap) { nx = ((nx % g.w) + g.w) % g.w; ny = ((ny % g.h) + g.h) % g.h; }
      else if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
      out.cells[ny * g.w + nx] = g.cells[y * g.w + x];
    }
    return out;
  },
  tile(g, nx = 2, ny = 1) {
    if (nx < 1 || ny < 1) return null;
    const out = G.make(g.w * nx, g.h * ny);
    for (let by = 0; by < ny; by++) for (let bx = 0; bx < nx; bx++)
      for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++)
        out.cells[(by * g.h + y) * out.w + (bx * g.w + x)] = g.cells[y * g.w + x];
    return out;
  },
  countColors(g) {
    const counts = {};
    for (const c of g.cells) counts[c] = (counts[c] || 0) + 1;
    return { counts, total: g.cells.length, distinct: Object.keys(counts).length };
  },
  // 4-neighbour by default; a component is a maximal run of one non-background colour
  components(g, { bg = 0, diagonal = false } = {}) {
    const labels = G.make(g.w, g.h, 0);
    const sizes = [], colors = [];
    const nbr = diagonal ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let label = 0;
    for (let y0 = 0; y0 < g.h; y0++) for (let x0 = 0; x0 < g.w; x0++) {
      const color = g.cells[y0 * g.w + x0];
      if (color === bg || labels.cells[y0 * g.w + x0] !== 0) continue;
      label++;
      let size = 0;
      const stack = [[x0, y0]];
      labels.cells[y0 * g.w + x0] = label;
      while (stack.length) {
        const [x, y] = stack.pop();
        size++;
        for (const [ax, ay] of nbr) {
          const nx = x + ax, ny = y + ay;
          if (nx < 0 || ny < 0 || nx >= g.w || ny >= g.h) continue;
          const i = ny * g.w + nx;
          if (labels.cells[i] !== 0 || g.cells[i] !== color) continue;
          labels.cells[i] = label;
          stack.push([nx, ny]);
        }
      }
      sizes.push(size); colors.push(color);
    }
    return { count: label, sizes, colors, labels };
  },
  symmetry(g) {
    const sq = g.w === g.h;
    return {
      horizontal: G.equal(g, G.flip(g, 'h')),
      vertical: G.equal(g, G.flip(g, 'v')),
      rot180: G.equal(g, G.rotate(g, 2)),
      rot90: sq && G.equal(g, G.rotate(g, 1)),
      diagonal: sq && G.equal(g, G.transpose(g)),
      antidiagonal: sq && G.equal(g, G.rotate(G.transpose(g), 2)),
    };
  },
  // b wins wherever it is not the background colour; the result is the larger extent
  overlay(a, b, { bg = 0 } = {}) {
    const w = Math.max(a.w, b.w), h = Math.max(a.h, b.h);
    const out = G.make(w, h, bg);
    for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) out.cells[y * w + x] = a.cells[y * a.w + x];
    for (let y = 0; y < b.h; y++) for (let x = 0; x < b.w; x++) { const v = b.cells[y * b.w + x]; if (v !== bg) out.cells[y * w + x] = v; }
    return out;
  },
};

// ---------------------------------------------------------------- the cells
const gridIn = [{ name: 'in', kinds: ['event'] }];
const gridOut = [{ name: 'out', kinds: ['event'] }];
// A cell whose compute is one pure grid function of the latest grid it was handed.
function unary(name, doc, defaults, fn) {
  defineKind(name, {
    doc, ports: { in: gridIn, out: gridOut }, defaults,
    compute: (ins, cell) => {
      const sig = first(ins[0]);
      if (!sig || !G.valid(sig.data)) return [null];
      const out = fn(sig.data, cell.params);
      return [out ? { kind: 'event', data: out } : null];
    },
  });
}

unary('grid.rotate', 'Rotates a grid by params.turns quarter turns clockwise.', { turns: 1 }, (g, p) => G.rotate(g, p.turns));
unary('grid.flip', 'Mirrors a grid: params.axis h (left to right) or v (top to bottom).', { axis: 'h' }, (g, p) => G.flip(g, p.axis));
unary('grid.transpose', 'Reflects a grid across its main diagonal.', {}, (g) => G.transpose(g));
unary('grid.colormap', 'Recolours a grid through params.map, an object of old colour to new colour. Colours with no entry are left alone.', { map: {} }, (g, p) => G.colormap(g, p.map));
unary('grid.crop', 'Crops a grid. params.mode bbox takes the tightest rectangle around every non-background cell; params.mode rect takes params.x, y, w, h.', { mode: 'bbox', bg: 0, x: 0, y: 0, w: 1, h: 1 },
  (g, p) => (p.mode === 'bbox' ? G.cropBBox(g, p.bg) : G.crop(g, p.x, p.y, p.w, p.h)));
unary('grid.translate', 'Shifts a grid by params.dx, params.dy. params.wrap true rolls the edges round; false fills the gap with params.fill.', { dx: 1, dy: 0, wrap: true, fill: 0 },
  (g, p) => G.translate(g, p.dx, p.dy, { wrap: p.wrap, fill: p.fill }));
unary('grid.tile', 'Repeats a grid params.nx times across and params.ny times down.', { nx: 2, ny: 1 }, (g, p) => G.tile(g, p.nx, p.ny));

defineKind('grid.count', {
  doc: 'Counts the cells of each colour in a grid. Emits { counts, total, distinct }, exact integers, no sampling.',
  ports: { in: gridIn, out: gridOut },
  compute: (ins) => { const s = first(ins[0]); if (!s || !G.valid(s.data)) return [null]; return [{ kind: 'event', data: G.countColors(s.data) }]; },
});

defineKind('grid.components', {
  doc: 'Connected components of same-coloured non-background cells. params.diagonal true uses 8 neighbours. Emits { count, sizes, colors, labels } where labels is itself a grid.',
  ports: { in: gridIn, out: gridOut },
  defaults: { bg: 0, diagonal: false },
  compute: (ins, cell) => { const s = first(ins[0]); if (!s || !G.valid(s.data)) return [null]; return [{ kind: 'event', data: G.components(s.data, cell.params) }]; },
});

defineKind('grid.symmetry', {
  doc: 'Detects which symmetries a grid has. Emits { horizontal, vertical, rot180, rot90, diagonal, antidiagonal }; the square-only ones are false on a rectangle.',
  ports: { in: gridIn, out: gridOut },
  compute: (ins) => { const s = first(ins[0]); if (!s || !G.valid(s.data)) return [null]; return [{ kind: 'event', data: G.symmetry(s.data) }]; },
});

defineKind('grid.overlay', {
  doc: 'Overlays the latest grid on port b onto the latest on port a; b wins wherever it is not params.bg. Both grids are held until replaced, so the two can arrive on different ticks.',
  ports: { in: [{ name: 'a', kinds: ['event'] }, { name: 'b', kinds: ['event'] }], out: gridOut },
  defaults: { bg: 0 },
  init: () => ({ a: null, b: null }),
  compute: (ins, cell) => {
    const a = first(ins[0]), b = first(ins[1]);
    if (a && G.valid(a.data)) cell.state.a = a.data;
    if (b && G.valid(b.data)) cell.state.b = b.data;
    if (!cell.state.a || !cell.state.b) return [null];
    return [{ kind: 'event', data: G.overlay(cell.state.a, cell.state.b, cell.params) }];
  },
});

export const GRID_KINDS = Object.freeze([
  'grid.rotate', 'grid.flip', 'grid.transpose', 'grid.colormap', 'grid.crop',
  'grid.translate', 'grid.tile', 'grid.count', 'grid.components', 'grid.symmetry', 'grid.overlay',
]);
