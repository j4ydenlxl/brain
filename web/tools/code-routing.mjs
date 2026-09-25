// Orthogonal paths through the corridors between system boundaries.
export function campusRouter(systems) {
  const obstacles = systems.map(r => ({ x: r.x - 10, y: r.y - 10, w: r.w + 20, h: r.h + 20 }));
  const xs = new Set([12, ...obstacles.flatMap(o => [o.x, o.x + o.w])]), ys = new Set([12, ...obstacles.flatMap(o => [o.y, o.y + o.h])]);
  const blocked = (a, b) => obstacles.some(o => a[0] === b[0] ? a[0] > o.x && a[0] < o.x + o.w && Math.max(a[1], b[1]) > o.y && Math.min(a[1], b[1]) < o.y + o.h : a[1] > o.y && a[1] < o.y + o.h && Math.max(a[0], b[0]) > o.x && Math.min(a[0], b[0]) < o.x + o.w);
  return (start, end) => {
    const x = [...new Set([...xs, start[0], end[0]])].sort((a, b) => a - b), y = [...new Set([...ys, start[1], end[1]])].sort((a, b) => a - b), width = x.length;
    const id = p => y.indexOf(p[1]) * width + x.indexOf(p[0]), point = i => [x[i % width], y[Math.floor(i / width)]], first = id(start), last = id(end);
    const costs = new Map([[first, 0]]), previous = new Map(), open = new Set([first]);
    while (open.size) {
      let current, min = Infinity; for (const i of open) { const p = point(i), score = costs.get(i) + Math.abs(p[0] - end[0]) + Math.abs(p[1] - end[1]); if (score < min) { min = score; current = i; } }
      if (current === last) { const points = []; for (let i = current; i !== undefined; i = previous.get(i)) points.unshift(point(i)); return points.filter((p, i) => i === 0 || i === points.length - 1 || !(points[i - 1][0] === p[0] && p[0] === points[i + 1][0] || points[i - 1][1] === p[1] && p[1] === points[i + 1][1])); }
      open.delete(current); const a = point(current), xi = current % width, yi = Math.floor(current / width);
      for (const [nx, ny] of [[xi - 1, yi], [xi + 1, yi], [xi, yi - 1], [xi, yi + 1]]) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= y.length) continue;
        const b = [x[nx], y[ny]], next = ny * width + nx; if (blocked(a, b)) continue;
        const cost = costs.get(current) + Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
        if (cost >= (costs.get(next) ?? Infinity)) continue; costs.set(next, cost); previous.set(next, current); open.add(next);
      }
    }
    throw new Error('No factory corridor could be routed.');
  };
}
