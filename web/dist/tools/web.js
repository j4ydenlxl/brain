// Code Universe: a contained factory with deterministic orthogonal wiring.
(function () {
 function createFactoryWeb(F) {
  const D = F.D;
  // Compatibility palette for the unchanged dashboard; never used by the factory drawing.
  const HUE = ['#5B8CFF', '#2FC6C0', '#9B7BFF', '#CF7DF5', '#52D6A0', '#E3A857'];
  const STATUS = { crit: '#FF6166', warn: '#F2B64C', ok: '#3DD68C' };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ICON = {
    step: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
    store: '<ellipse cx="12" cy="6" rx="7" ry="2.6"/><path d="M5 6v12c0 1.45 3.1 2.6 7 2.6s7-1.15 7-2.6V6M5 12c0 1.45 3.1 2.6 7 2.6s7-1.15 7-2.6"/>',
    gate: '<path d="M12 3l7.5 2.8v5.6c0 4.6-3.2 8-7.5 9.6-4.3-1.6-7.5-5-7.5-9.6V5.8z"/><path d="M8.8 12.2l2.2 2.2 4.2-4.4"/>',
    trigger: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5v4.8l3 1.9"/>',
    mcp: '<path d="M9 3v4.5M15 3v4.5M6.5 7.5h11V11a5.5 5.5 0 0 1-11 0zM12 16.5V21"/>',
    repo: '<circle cx="7" cy="5.5" r="2.2"/><circle cx="7" cy="18.5" r="2.2"/><circle cx="17" cy="8.5" r="2.2"/><path d="M7 7.7v8.6M17 10.7c0 3.6-4.6 3.9-9 5.9"/>',
    star: '<path d="M12 1.8c.8 5.5 4.7 9.4 10.2 10.2-5.5.8-9.4 4.7-10.2 10.2C11.2 16.7 7.3 12.8 1.8 12 7.3 11.2 11.2 7.3 12 1.8z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    layers: '<path d="M12 3.5l8.5 4.5-8.5 4.5L3.5 8z"/><path d="M3.5 12.5l8.5 4.5 8.5-4.5M3.5 16.5l8.5 4.5 8.5-4.5"/>',
    web: '<circle cx="12" cy="12" r="2.2"/><circle cx="5" cy="6" r="1.8"/><circle cx="19" cy="6" r="1.8"/><circle cx="5.5" cy="18.5" r="1.8"/><circle cx="18.5" cy="18" r="1.8"/><path d="M6.4 7.2l4 3.4M17.6 7.2l-4 3.4M7 17.4l3.3-3.8M17 16.8l-3.2-3.2"/>',
    branch: '<circle cx="6" cy="5.5" r="2"/><circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="12" r="2"/><path d="M6 7.5v9M6 12h10"/>',
    flow: '<rect x="3" y="4" width="6" height="6" rx="1.5"/><rect x="15" y="14" width="6" height="6" rx="1.5"/><path d="M9 7h4a3 3 0 0 1 3 3v4"/>',
    gauge: '<path d="M3.5 14a8.5 8.5 0 0 1 17 0"/><path d="M12 14l4-4.5"/><path d="M3.5 18.5h17"/>',
    lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    org: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8.5 8h2M13.5 8h2M8.5 12h2M13.5 12h2M10 20.5v-4h4v4"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    send: '<path d="M4 12l16-8-6 16-3-7z"/>',
    pause: '<path d="M9 5.5v13M15 5.5v13"/>',
    play: '<path d="M8 5.5l11 6.5-11 6.5z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    logs: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    flask: '<path d="M9.5 3.5h5M10.5 3.5v6L5 19a1.3 1.3 0 0 0 1.1 2h11.8A1.3 1.3 0 0 0 19 19l-5.5-9.5v-6"/><path d="M7.5 15h9"/>',
  };
  const attrs = k => (k === 'star' ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"');
  const icon = (k, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" ${attrs(k)} aria-hidden="true">${ICON[k]}</svg>`;
  // Geometry is deterministic and independent of the DOM. Every lens retains system ownership.
  const LEVEL_NAMES = ['Plant', 'Halls', 'Machines', 'Parts'];
  const OPEN = { approval: 'waiting on you', running: 'editing now', gate: 'at the QC gate', queued: 'queued' };
  const sysById = new Map(D.systems.map(s => [s.id, s]));
  const clientName = id => F.agentById.get(id)?.name || id;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const sortParts = ids => ids.slice().sort((a, b) => F.stageIx[F.byId.get(a).stage] - F.stageIx[F.byId.get(b).stage] || a.localeCompare(b));
  const rect = (x, y, w, h) => ({ x, y, w, h });
  const centreOf = r => [r.x + r.w / 2, r.y + r.h / 2];
  const contains = (a, b) => b.x >= a.x && b.y >= a.y && b.x + b.w <= a.x + a.w && b.y + b.h <= a.y + a.h;
  const pathOf = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
  const badge = s => ({ crit: 'CRIT', warn: 'WARN', ok: 'OK', unknown: '?' }[s] || '?');
  const healthLabel = h => h === null || h === undefined ? '—' : h + '%';

  function groupsFor(lens) {
    const all = D.primitives;
    if (lens === 'stage') return D.stages.map(s => ({ id: s.id, name: `${s.id} · ${s.name}`, ids: all.filter(p => p.stage === s.id).map(p => p.id) }));
    if (lens === 'health') return [['crit', 'Needs a human'], ['warn', 'Watch'], ['ok', 'Healthy'], ['unknown', 'Unverified']].map(([id, name]) => ({ id, name, ids: all.filter(p => p.status === id).map(p => p.id) }));
    if (lens === 'repo') return D.repos.map(r => ({ id: r.name, name: r.name, ids: all.filter(p => sysById.get(p.sys).repo === r.name).map(p => p.id) }));
    return [{ id: 'system', name: 'Systems', ids: all.map(p => p.id) }];
  }

  function layout(lens = 'system') {
    const MW = 250, MH = Math.max(80, ...D.primitives.map(p => 46 + Math.ceil(p.tests / 10) * 9)), GAP = 40, PAD = 18, HEADER = 52;
    const machines = new Map(), halls = [], zones = [], parts = [], docks = [];
    const columns = lens === 'system' ? Math.min(3, D.systems.length) : lens === 'stage' ? 4 : lens === 'health' ? 3 : 2;
    const groupList = groupsFor(lens).filter(g => g.ids.length);
    let plantW, plantH;
    function makeHall(sys, ids, x, y, w = PAD * 2 + MW * 2 + GAP, requestedCols = 2) {
      const cols = Math.min(ids.length, requestedCols);
      const height = D.observed ? Math.max(80, ...ids.map(id => 46 + Math.ceil(F.byId.get(id).tests / 10) * 9)) : MH;
      const h = HEADER + Math.ceil(ids.length / cols) * (height + GAP) - GAP + PAD;
      const hall = { ...rect(x, y, w, h), id: `hall:${halls.length}`, sys: sys.id, name: sys.name, ids: sortParts(ids) };
      hall.health = ids.some(id => F.byId.get(id).health === null) ? null : Math.min(...ids.map(id => F.byId.get(id).health));
      hall.status = hall.health === null ? 'unknown' : F.byId.get(ids.find(id => F.byId.get(id).health === hall.health)).status;
      halls.push(hall);
      hall.ids.forEach((id, i) => {
        const m = { ...rect(x + PAD + (i % cols) * (MW + GAP), y + HEADER + Math.floor(i / cols) * (height + GAP), MW, height), id, hall: hall.id, p: F.byId.get(id), parts: [] };
        machines.set(id, m);
        for (let j = 0; j < m.p.tests; j++) {
          const issue = m.p.issues[j], test = m.p.testCases?.[j], part = { ...rect(m.x + 16 + j % 10 * 16, m.y + 40 + Math.floor(j / 10) * 9, 10, 6), machine: id, index: j, kind: test?.status || issue?.[0] || 'clean', name: test?.name || issue?.[1] || `Sample test ${j + 1}`, channel: issue?.[2] };
          m.parts.push(part); parts.push(part);
        }
      });
      return hall;
    }
    if (lens === 'system' && D.observed) {
      // Large directories are divided into named bays, retaining their real ownership.
      const bays = D.systems.flatMap(s => {
        const ids = D.primitives.filter(p => p.sys === s.id).map(p => p.id), result = [];
        for (let i = 0; i < ids.length; i += 6) result.push({ s: { ...s, name: s.name + (ids.length > 6 ? ` / bay ${i / 6 + 1}` : '') }, ids: ids.slice(i, i + 6) });
        return result;
      });
      const cols = Math.min(2, bays.length), W = PAD * 2 + MW * 3 + GAP * 2, bottoms = Array(cols).fill(98);
      bays.forEach(({ s, ids }) => {
        const col = bottoms.indexOf(Math.min(...bottoms));
        const hall = makeHall(s, ids, 44 + col * (W + 60), bottoms[col], W, 3);
        bottoms[col] += hall.h + 46;
      });
      plantW = cols * (W + 60) + 28; plantH = Math.max(...bottoms) + 4;
    } else if (lens === 'system') {
      const machineCols = D.systems.length === 1 ? Math.min(5, Math.max(2, Math.ceil(Math.sqrt(D.primitives.length * 1.5)))) : 2;
      const W = PAD * 2 + MW * machineCols + GAP * (machineCols - 1);
      let y = 98;
      for (let i = 0; i < D.systems.length; i += columns) {
        const row = D.systems.slice(i, i + columns), added = [];
        row.forEach((s, j) => {
          const col = Math.floor(i / columns) % 2 ? columns - 1 - j : j;
          added.push(makeHall(s, D.primitives.filter(p => p.sys === s.id).map(p => p.id), 44 + col * (W + 60), y, W, machineCols));
        });
        const H = Math.max(...added.map(h => h.h)); added.forEach(h => { h.h = H; }); y += H + 62;
      }
      plantW = columns * (W + 60) + 28;
      plantH = y - 12;
    } else {
      // A grouping is a zone; its machines still sit inside their actual system's hall.
      const W = 2 * MW + GAP + 2 * PAD, zoneW = W + 40;
      const zoneSpecs = groupList.map(g => {
        const sub = D.systems.map(s => ({ s, ids: g.ids.filter(id => F.byId.get(id).sys === s.id) })).filter(x => x.ids.length);
        return { ...g, sub, h: 62 + sub.reduce((h, s) => h + HEADER + Math.ceil(s.ids.length / (s.ids.length === 1 ? 1 : 2)) * (MH + GAP) - GAP + PAD + 30, 0) };
      });
      let y = 112;
      for (let i = 0; i < zoneSpecs.length; i += columns) {
        const row = zoneSpecs.slice(i, i + columns), height = Math.max(...row.map(z => z.h));
        row.forEach((z, j) => {
          const x = 36 + j * (zoneW + 44), zone = { ...rect(x, y, zoneW, z.h), id: z.id, name: z.name, count: z.ids.length };
          zones.push(zone); let hy = y + 54;
          z.sub.forEach(({ s, ids }) => { const hall = makeHall(s, ids, x + 20, hy, W); hall.zone = zone.id; hy += hall.h + 30; });
        });
        y += height + 60;
      }
      plantW = Math.min(columns, zoneSpecs.length) * (zoneW + 44) + 28;
      plantH = y + 4;
    }
    const plant = { ...rect(0, 0, plantW, plantH), id: 'hub', name: 'Code Universe' };
    D.repos.forEach((r, i) => docks.push({ ...rect(36 + i * 220, -40, 204, 40), id: 'repo:' + r.name, type: 'repo', r, name: r.name }));
    D.connectors.forEach((c, i) => docks.push({ ...rect(plantW - 36 - (D.connectors.length - i) * 200, -40, 184, 40), id: c.name === 'code-universe' ? 'mcp:code-universe' : 'mcp:' + c.name, type: 'mcp', c, name: c.name }));
    const result = { lens, plant, halls, machines, zones, parts, docks };
    result.routes = routeEdges(result);
    return result;
  }

  // An orthogonal visibility graph routes around machine bodies and hall headings.
  // All rendered conveyors correspond to model edges; there are no invented connections.
  function router(L) {
    const obstacles = [...L.machines.values()].map(m => rect(m.x - 8, m.y - 8, m.w + 16, m.h + 16));
    L.halls.forEach(h => obstacles.push(rect(h.x + 12, h.y + 10, h.w - 24, 38)));
    L.zones.forEach(z => obstacles.push(rect(z.x + 10, z.y + 10, z.w - 20, 30)));
    obstacles.push(rect(16, 4, L.plant.w - 32, 80));
    const baseX = new Set([16, L.plant.w - 16]), baseY = new Set([90, L.plant.h - 18]);
    obstacles.forEach(o => { baseX.add(o.x); baseX.add(o.x + o.w); baseY.add(o.y); baseY.add(o.y + o.h); });
    const inside = (x, y, o) => x > o.x + .01 && x < o.x + o.w - .01 && y > o.y + .01 && y < o.y + o.h - .01;
    const clear = (a, b) => !obstacles.some(o => {
      if (a[0] === b[0]) return a[0] > o.x + .01 && a[0] < o.x + o.w - .01 && Math.max(a[1], b[1]) > o.y + .01 && Math.min(a[1], b[1]) < o.y + o.h - .01;
      return a[1] > o.y + .01 && a[1] < o.y + o.h - .01 && Math.max(a[0], b[0]) > o.x + .01 && Math.min(a[0], b[0]) < o.x + o.w - .01;
    });
    return (start, end) => {
      const xs = [...new Set([...baseX, start[0], end[0]])].sort((a, b) => a - b), ys = [...new Set([...baseY, start[1], end[1]])].sort((a, b) => a - b), width = xs.length;
      const idx = (x, y) => y * width + x, point = id => [xs[id % width], ys[Math.floor(id / width)]];
      const first = idx(xs.indexOf(start[0]), ys.indexOf(start[1])), last = idx(xs.indexOf(end[0]), ys.indexOf(end[1]));
      const distance = new Map([[first * 3, 0]]), prev = new Map(), heap = [];
      function push(item) { let i = heap.length; heap.push(item); while (i) { const p = (i - 1) >> 1; if (heap[p][0] <= item[0]) break; heap[i] = heap[p]; i = p; } heap[i] = item; }
      function pop() { const root = heap[0], tail = heap.pop(); if (heap.length) { let i = 0; while (i * 2 + 1 < heap.length) { let c = i * 2 + 1; if (c + 1 < heap.length && heap[c + 1][0] < heap[c][0]) c++; if (heap[c][0] >= tail[0]) break; heap[i] = heap[c]; i = c; } heap[i] = tail; } return root; }
      push([0, first * 3, 0]); let done;
      while (heap.length) {
        const [, key, cost] = pop(); if (cost !== distance.get(key)) continue;
        const id = Math.floor(key / 3), dir = key % 3, a = point(id), xi = id % width, yi = Math.floor(id / width);
        if (id === last) { done = key; break; }
        const neighbours = [[xi - 1, yi, 1], [xi + 1, yi, 1], [xi, yi - 1, 2], [xi, yi + 1, 2]];
        for (const [x, y, d] of neighbours) {
          if (x < 0 || y < 0 || x >= width || y >= ys.length) continue;
          const b = [xs[x], ys[y]]; if (obstacles.some(o => inside(...b, o)) || !clear(a, b)) continue;
          const next = idx(x, y) * 3 + d, step = Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + (dir && dir !== d ? 22 : 0), value = cost + step;
          if (value >= (distance.get(next) ?? Infinity)) continue;
          distance.set(next, value); prev.set(next, key);
          push([value + Math.abs(b[0] - end[0]) + Math.abs(b[1] - end[1]), next, value]);
        }
      }
      if (done === undefined) throw new Error('No clear factory route');
      const pts = []; for (let k = done; k !== undefined; k = prev.get(k)) pts.unshift(point(Math.floor(k / 3)));
      return pts.filter((p, i) => !i || i === pts.length - 1 || !((pts[i - 1][0] === p[0] && p[0] === pts[i + 1][0]) || (pts[i - 1][1] === p[1] && p[1] === pts[i + 1][1])));
    };
  }
  function routeEdges(L) {
    const find = router(L);
    return F.edges.map(e => {
      const a = L.machines.get(e.from), b = L.machines.get(e.to);
      const start = [a.x + a.w, a.y + 25], end = [b.x, b.y + 25];
      const points = [start, ...find([start[0] + 8, start[1]], [end[0] - 8, end[1]]), end];
      return { ...e, points, d: pathOf(points) };
    });
  }

  let serial = 0;
  function mount(host, opts = {}) {
    const uid = `factory-${++serial}`, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const st = { lens: opts.lens || 'system', k: .45, tx: 0, ty: 0, W: 0, H: 0, sel: null, tab: 'details', tasks: opts.tasks || D.workOrders, moved: false, dead: false, lv: -1, test: null };
    let L = layout(st.lens), anim = 0, snap = 0, drag = null, beamPaths = [], noticeTimer = 0;
    const symbols = ['step', 'store', 'gate', 'trigger', 'mcp', 'repo', 'star'].map(k => `<symbol id="${uid}-${k}" viewBox="0 0 24 24" ${attrs(k)}>${ICON[k]}</symbol>`).join('');
    host.innerHTML = `<div class="web" tabindex="0" aria-label="Factory architecture. Scroll to zoom, drag to pan. Use arrows to pan, plus or minus to zoom, zero to fit, Escape to close the inspector.">
      <svg class="w-canvas" aria-label="Nested factory architecture"><defs>${symbols}<pattern id="${uid}-grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r=".7" fill="#252525"/></pattern><marker id="${uid}-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3L0 6" fill="none" stroke="#999"/></marker></defs><g class="world"></g></svg>
      <div class="w-layer" aria-hidden="true"></div>
      <div class="w-breadcrumb"><button data-w="fit" title="Fit the whole plant">Plant</button><span class="w-path">/ All systems</span><span class="w-sample">${D.observed ? 'REPOSITORY' : 'SAMPLE'}</span></div>
      <div class="w-legend"><span><i class="lg-system"></i>System</span><span><i class="lg-mcp"></i>MCP Server</span><span><i class="lg-repo"></i>Repository</span><span><i class="lg-line"></i>Connection</span></div>
      <div class="w-ctrl"><div class="w-level" role="group" aria-label="Zoom level">${LEVEL_NAMES.map((n, i) => `<button type="button" data-w="level" data-lv="${i}" aria-pressed="false">${n}</button>`).join('')}</div><div class="w-zoom"><button type="button" data-w="in" aria-label="Zoom in">${icon('plus')}</button><button type="button" data-w="out" aria-label="Zoom out">${icon('minus')}</button><button type="button" data-w="fit" aria-label="Fit the whole factory">${icon('fit')}</button><button type="button" data-w="expand" aria-label="Expand architecture">${icon('layers')}</button></div></div>
      <div class="w-pct" aria-live="off"></div><div class="w-help">Scroll to explore · Click a part to inspect</div>
      <aside class="w-inspector" aria-label="Factory inspector" hidden></aside><div class="w-notice" role="status" hidden></div><div class="w-sr" aria-live="polite"></div>
    </div>`;
    const root = host.firstElementChild, world = root.querySelector('.world'), layer = root.querySelector('.w-layer'), card = root.querySelector('.w-inspector');
    const openTasks = () => st.tasks.filter(t => OPEN[t.status]);
    const use = (kind, x, y, size = 16) => `<use href="#${uid}-${kind}" x="${x}" y="${y}" width="${size}" height="${size}" class="w-icon"/>`;
    const box = (r, cls = '', extra = '') => `<rect class="${cls}" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" ${extra || 'rx="4"'}/>`;
    const nodeAttrs = (id, label) => `data-node="${esc(id)}" tabindex="0" role="button" aria-label="${esc(label)}"`;
    const getNode = id => L.machines.get(id) || L.halls.find(h => h.id === id) || L.docks.find(d => d.id === id) || (id === 'hub' ? L.plant : null);

    function build() {
      world.innerHTML = `<rect x="-8000" y="-8000" width="16000" height="16000" fill="url(#${uid}-grid)"/>
        <g class="w-plant" ${nodeAttrs('hub', 'Code Universe plant. ' + (D.observed ? 'Health unverified.' : 'Health ' + F.plant.health + ' percent'))}>
          ${box(L.plant, 'plant-boundary')}<path class="plant-rule" d="M0 84H${L.plant.w}"/>
          ${L.zones.map(z => `<g class="w-zone">${box(z, 'zone-boundary')}</g>`).join('')}
          ${L.halls.map(h => `<g class="w-hall s-${h.status}" ${nodeAttrs(h.id, h.name + '. ' + h.ids.length + (D.observed ? ' files. Health unverified.' : ' primitives. Health ' + h.health + ' percent'))}>${box(h, 'hall-boundary')}<path class="hall-rule" d="M${h.x + 12} ${h.y + 49}H${h.x + h.w - 12}"/></g>`).join('')}
          <g class="w-conveyors">${L.routes.map(e => `<path class="w-edge t-${e.type} ${e.sev ? 's-' + e.sev : ''}" data-edge="${e.i}" d="${e.d}" marker-end="url(#${uid}-arrow)"><title>${esc(e.from)} → ${esc(e.to)} · ${e.type}${e.sev ? ' · ' + e.tag : ''}</title></path>`).join('')}</g>
          <g class="w-beams"></g>
          ${L.halls.map(h => `<g class="w-machines" data-owner="${esc(h.sys)}">${h.ids.map(id => {
            const m = L.machines.get(id), p = m.p;
            return `<g class="w-machine s-${p.status}" ${nodeAttrs(id, D.observed ? `${id}. ${p.language}. ${p.tests} discovered tests. Health unverified.` : `${id}. ${p.kind}. Health ${p.health}. ${p.clean} of ${p.tests} hermetic tests clean.`)}>${box(m, 'machine-boundary')}${use(p.kind, m.x + 9, m.y + 15, 18)}<path class="machine-rule" d="M${m.x + 10} ${m.y + 35}H${m.x + m.w - 10}"/>
              <rect class="machine-health-track" x="${m.x + 16}" y="${m.y + 54}" width="158" height="3"/><rect class="machine-health" x="${m.x + 16}" y="${m.y + 54}" width="${158 * p.health / 100}" height="3"/>
              <g class="w-tests">${m.parts.map(t => `<g data-test="${t.index}" data-machine="${esc(id)}" role="button" tabindex="-1" aria-label="${esc(t.name)}: ${t.kind}${t.channel ? ', ' + t.channel : ''}">${box(t, 'test-part test-' + t.kind, 'rx="1"')}<title>${esc(t.name)} · ${t.kind}${t.channel ? ' · ' + t.channel : ''}</title>${t.kind === 'fail' ? `<path class="test-cross" d="M${t.x + 2} ${t.y + 1}l6 4m0 -4l-6 4"/>` : ''}</g>`).join('')}</g>
              <circle class="machine-port" cx="${m.x}" cy="${m.y + 25}" r="3"/><circle class="machine-port" cx="${m.x + m.w}" cy="${m.y + 25}" r="3"/>
            </g>`;
          }).join('')}</g>`).join('')}
        </g>
        ${L.docks.map(d => `<g class="w-dock ${d.type}" ${nodeAttrs(d.id, d.type + ': ' + d.name)}>${box(d, 'dock-boundary')}${use(d.type, d.x + 10, d.y + 12, 16)}<path class="dock-link" d="M${d.x + d.w / 2} 0v14"/></g>`).join('')}`;
      layer.innerHTML = `<div class="w-label plant-label" data-label="hub"><b>CODE UNIVERSE <span> / FACTORY</span></b><small>${D.systems.length} systems · ${D.primitives.length} ${D.observed ? 'files' : 'primitives'} · ${F.tests.total} ${D.observed ? 'discovered tests' : 'tests'} · health ${healthLabel(F.plant.health)}</small></div>
        <div class="w-label plant-note"><b>HUMAN OPERATIONAL CONTROL</b><small>Health follows the weakest part</small></div>
        ${L.zones.map(z => `<div class="w-label zone-label" data-zone="${esc(z.id)}"><b>${esc(z.name)}</b><small>${F.plural(z.count, 'primitive')}</small></div>`).join('')}
        ${L.halls.map((h, i) => `<div class="w-label hall-label" data-label="${h.id}"><b><span class="w-number">${String(i + 1).padStart(2, '0')}</span>${esc(h.name)}<em class="w-status s-${h.status}">${badge(h.status)} · ${healthLabel(h.health)}</em></b><small>${h.ids.length} ${D.observed ? 'files · tests not run' : 'primitives · weakest ' + healthLabel(h.health)}</small></div>`).join('')}
        ${[...L.machines.values()].map(m => `<div class="w-label machine-label" data-label="${esc(m.id)}"><b>${esc(D.observed ? m.id.split('/').pop() : m.id)}</b><small>${D.observed ? `${m.p.language} · ${m.p.lines === null ? 'not analyzed' : m.p.lines + ' lines'}` : `${F.stageName(m.p.stage)} · ${m.p.health}% · ${m.p.clean}/${m.p.tests} clean`}</small></div>`).join('')}
        ${L.docks.map(d => `<div class="w-label dock-label" data-label="${esc(d.id)}"><b>${esc(d.name.replace('sample/', ''))}</b></div>`).join('')}
        <div class="w-activity-labels"></div>`;
      buildBeams(); highlight(); apply();
    }

    function buildBeams() {
      const dock = L.docks.find(d => d.id === 'mcp:code-universe'); if (!dock) return;
      const from = [dock.x + dock.w / 2, 90], find = router(L);
      beamPaths = openTasks().flatMap(t => t.scope.filter(id => L.machines.has(id)).map((id, j) => {
        const m = L.machines.get(id), end = [m.x + m.w, m.y + 25], pts = [[from[0], 0], ...find(from, [end[0] + 8, end[1]]), end];
        return { t, id, main: j === 0, d: pathOf(pts) };
      }));
      root.querySelector('.w-beams').innerHTML = beamPaths.map(b => `<path class="w-beam s-${b.t.status}" data-beam="${esc(b.t.id)}" data-target="${esc(b.id)}" d="${b.d}"><title>${esc(clientName(b.t.agent))} · ${OPEN[b.t.status]} · ${esc(b.id)}</title></path>`).join('');
      layer.querySelector('.w-activity-labels').innerHTML = beamPaths.filter(b => b.main).map(b => `<div class="w-label beam-label" data-task="${esc(b.t.id)}" data-target="${esc(b.id)}"><span>${esc(clientName(b.t.agent))} · ${OPEN[b.t.status]}</span></div>`).join('');
    }

    function highlight() {
      const linked = new Set(), edges = new Set();
      if (L.machines.has(st.sel)) {
        linked.add(st.sel); F.downstream(st.sel).forEach(id => linked.add(id));
        F.inc.get(st.sel).forEach(e => linked.add(e.from));
        F.edges.forEach(e => { if (linked.has(e.from) && linked.has(e.to)) edges.add(e.i); });
      } else if (st.sel?.startsWith('hall:')) L.halls.find(h => h.id === st.sel)?.ids.forEach(id => linked.add(id));
      else if (st.sel?.startsWith('repo:')) D.primitives.filter(p => sysById.get(p.sys).repo === st.sel.slice(5)).forEach(p => linked.add(p.id));
      root.classList.toggle('has-selection', linked.size > 0);
      root.querySelectorAll('.w-machine').forEach(el => { el.classList.toggle('related', linked.has(el.dataset.node)); el.classList.toggle('selected', el.dataset.node === st.sel); });
      root.querySelectorAll('.w-edge').forEach(el => el.classList.toggle('related', edges.has(+el.dataset.edge)));
      root.querySelectorAll('.w-beam,.beam-label').forEach(el => el.classList.toggle('related', !st.sel || linked.has(el.dataset.target)));
      root.querySelectorAll('.machine-label').forEach(el => { el.classList.toggle('related', linked.has(el.dataset.label)); el.classList.toggle('selected', el.dataset.label === st.sel); });
    }

    const cameraCentre = () => [card.hidden || st.W < 650 ? st.W / 2 : (st.W + 310) / 2, 94 + (st.H - 150) / 2];
    function view(r = L.plant, cap = 1.35) {
      const top = r === L.plant ? 94 : 98, pad = 30, space = card.hidden || st.W < 650 ? 0 : 314;
      const k = clamp(Math.min((st.W - space - pad * 2) / r.w, (st.H - top - 52) / (r.h + (r === L.plant ? 42 : 0))), .09, cap);
      return { k, tx: (st.W + space) / 2 - (r.x + r.w / 2) * k, ty: top + (st.H - top - 52) / 2 - (r.y + r.h / 2 - (r === L.plant ? 21 : 0)) * k };
    }
    function apply() {
      if (st.dead || !st.W) return;
      world.setAttribute('transform', `translate(${st.tx} ${st.ty}) scale(${st.k})`);
      root.style.setProperty('--k', st.k);
      st.lv = st.k < .3 ? 0 : st.k < .8 ? 1 : st.k < 1.6 ? 2 : 3;
      root.dataset.level = st.lv; root.dataset.zoom = st.k.toFixed(4);
      root.querySelectorAll('[data-lv]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.lv === st.lv)));
      root.querySelector('.w-pct').textContent = Math.round(st.k * 100) + '%';
      root.querySelector('.w-path').textContent = st.sel && L.machines.has(st.sel) ? ` / ${sysById.get(F.byId.get(st.sel).sys).name} / ${st.sel}` : ` / ${st.lens === 'system' ? 'All systems' : 'Grouped by ' + st.lens}`;
      const place = (el, x, y, w, show = true) => {
        const sx = x * st.k + st.tx, sy = y * st.k + st.ty;
        el.style.transform = `translate(${sx}px,${sy}px)`; el.style.width = w + 'px';
        el.hidden = !show || sx + w < 0 || sx > st.W || sy < 72 || sy > st.H - 50;
      };
      const header = layer.querySelector('.plant-label'); place(header, 22, 18, Math.max(210, L.plant.w * st.k * .58));
      place(layer.querySelector('.plant-note'), L.plant.w - 455, 22, 430 * st.k, st.k > .33 && st.W > 600);
      L.zones.forEach(z => place([...layer.querySelectorAll('[data-zone]')].find(el => el.dataset.zone === z.id), z.x + 14, z.y + 10, z.w * st.k - 20, z.w * st.k > 90));
      L.halls.forEach(h => { const el = layer.querySelector(`[data-label="${h.id}"]`); place(el, h.x + 13, st.lv === 0 ? h.y + h.h / 2 - 5 / st.k : h.y + 11, h.w * st.k - 12, h.w * st.k > 85); el.classList.toggle('compact', h.w * st.k < 190); });
      for (const m of L.machines.values()) {
        const el = layer.querySelector(`[data-label="${CSS.escape(m.id)}"]`);
        const x = m.x + (st.lv < 2 ? 9 : 32), y = m.y + (st.lv < 2 ? 14 : 10), w = (m.w - (st.lv < 2 ? 18 : 42)) * st.k;
        place(el, x, y, w, st.lv >= 1); el.title = m.id;
      }
      L.docks.forEach(d => place(layer.querySelector(`[data-label="${CSS.escape(d.id)}"]`), d.x + 30, d.y + 11, (d.w - 36) * st.k, st.k >= .32));
      const occupied = [];
      [...layer.querySelectorAll('.beam-label')].sort((a, b) => Number(b.dataset.target === st.sel) - Number(a.dataset.target === st.sel)).forEach(el => {
        const m = L.machines.get(el.dataset.target), w = Math.min(235, Math.max(145, (m.w + 40) * st.k)), x = (m.x + 8) * st.k + st.tx, y = (m.y + m.h + 3) * st.k + st.ty;
        const candidate = rect(x, y, w, 18), collide = occupied.some(r => x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + 18 > r.y);
        const show = st.lv >= 1 && !collide && (!st.sel || el.classList.contains('related'));
        place(el, m.x + 8, m.y + m.h + 3, w, show); if (show && !el.hidden) occupied.push(candidate);
      });
      root.querySelectorAll('.w-machine').forEach(el => { el.setAttribute('tabindex', st.lv >= 1 ? '0' : '-1'); el.setAttribute('aria-hidden', String(st.lv === 0)); });
      root.querySelectorAll('[data-test]').forEach(el => { el.setAttribute('tabindex', st.lv === 3 ? '0' : '-1'); el.setAttribute('aria-hidden', String(st.lv !== 3)); });
      root.querySelector('.w-help').textContent = st.lv === 0 ? 'Whole plant · Click a system to explore' : st.lv === 3 ? 'Each tile is a test · Click to inspect' : 'Scroll to explore · Click a part to inspect';
    }
    function cancel() { cancelAnimationFrame(anim); clearTimeout(snap); }
    function fly(to, ms = 300) {
      cancel(); if (st.dead) return;
      if (reduce || document.hidden || !ms) { Object.assign(st, to); apply(); return; }
      const from = { k: st.k, tx: st.tx, ty: st.ty }, t0 = performance.now();
      const finish = () => { if (!st.dead) { Object.assign(st, to); apply(); } };
      function frame(now) { const u = clamp((now - t0) / ms, 0, 1), e = 1 - (1 - u) ** 3; for (const key of ['k', 'tx', 'ty']) st[key] = from[key] + (to[key] - from[key]) * e; apply(); if (u < 1) anim = requestAnimationFrame(frame); }
      anim = requestAnimationFrame(frame); snap = setTimeout(finish, ms + 80);
    }
    function zoomAt(factor, x, y, animate = true) { const k = clamp(st.k * factor, .09, 3.2), r = k / st.k, to = { k, tx: x - (x - st.tx) * r, ty: y - (y - st.ty) * r }; st.moved = true; if (animate) fly(to); else { cancel(); Object.assign(st, to); apply(); } }
    function fit() { select(null); st.moved = false; fly(view()); }
    function focus(id, parts = false) {
      const n = getNode(id); if (!n) return;
      select(id); st.moved = true;
      if (L.machines.has(id)) { const [cx, cy] = cameraCentre(), k = parts ? 1.85 : Math.max(.95, Math.min(1.3, st.k)), [x, y] = centreOf(n); fly({ k, tx: cx - x * k, ty: cy - y * k }); }
      else fly(view(n, id === 'hub' ? .7 : 1.35));
    }
    function level(lv) {
      if (lv === 0) { select(null); const v = view(); const k = Math.min(.25, v.k), [x, y] = centreOf(L.plant), [cx, cy] = cameraCentre(); st.moved = true; fly({ k, tx: cx - x * k, ty: cy - y * k }); return; }
      if (lv === 1) { select(null); const v = view(); if (v.k < .3) { const h = L.halls[0]; Object.assign(v, view(h, .55)); } v.k = clamp(v.k, .3, .79); st.moved = true; fly(v); return; }
      const id = L.machines.has(st.sel) ? st.sel : F.plant.weakest.id;
      focus(id, lv === 3);
    }

    function select(id) {
      st.sel = getNode(id) ? id : null; st.tab = 'details'; st.test = null;
      renderCard(); highlight(); apply();
      if (opts.onSelect) opts.onSelect(st.sel);
      root.querySelector('.w-sr').textContent = st.sel ? `Selected ${L.machines.has(st.sel) ? st.sel : getNode(st.sel).name}` : 'Showing all systems';
    }
    const closeButton = '<button type="button" class="mc-x" data-w="close" aria-label="Close inspector">×</button>';
    const kv = (a, b) => `<div class="mc-kv"><span>${a}</span><b>${b}</b></div>`;
    const nodeButton = id => `<button type="button" class="w-node-link mono" data-focus="${esc(id)}">${esc(id)}<span>↗</span></button>`;
    function renderCard() {
      card.hidden = !st.sel; if (!st.sel) { card.innerHTML = ''; return; }
      const n = getNode(st.sel);
      if (opts.renderInspector) { const html = opts.renderInspector(n, { tab: st.tab, test: st.test }); if (html) { card.innerHTML = html; return; } }
      if (L.machines.has(st.sel)) {
        const p = n.p, pk = F.packet([p.id]), down = F.downstream(p.id), line = D.lines.find(l => l.stations.includes(p.id)), tasks = openTasks().filter(t => t.scope.includes(p.id));
        let body;
        if (st.tab === 'tests') {
          body = `<p class="mc-desc">Each tile is one test inside this primitive. ${p.clean} clean · ${p.leakCount} leaking · ${p.flaky} flaky · ${p.failing} failing.</p><div class="w-test-key"><span>□ Clean</span><span>▨ Leak</span><span>┄ Flaky</span><span>× Fail</span></div><ol class="w-test-list">${n.parts.map(t => `<li class="${st.test === t.index ? 'chosen' : ''}"><span class="w-test-state test-${t.kind}">${{ clean: '□', leak: '▨', flaky: '┄', fail: '×' }[t.kind]}</span><div>${esc(t.name)}<small>${t.kind === 'clean' ? 'Clean · unnamed in sample fixture' : esc(t.kind + (t.channel ? ' · ' + t.channel : ''))}</small></div></li>`).join('')}</ol>`;
        } else if (st.tab === 'context') {
          body = `<p class="mc-desc">A bounded packet for your own AI. These are sample estimates derived from the primitive contract and its neighbours.</p>${kv('Packet estimate', F.fmt(pk.tokens) + ' tokens')}${kv('Whole repository estimate', F.fmt(pk.repo) + ' tokens')}<div class="w-packet">${pk.parts.map(([label, count]) => kv(esc(label), F.fmt(count))).join('')}</div><p class="mc-desc">Immediate neighbours</p>${pk.neighbours.map(nodeButton).join('')}<div class="mc-act"><button class="btn sm" data-w="copy">${icon('copy')}Copy packet</button><button class="btn sm" data-w="download">Download JSON</button></div>`;
        } else {
          body = `<p class="mc-desc">${esc(p.desc)}</p><div class="mc-row"><div class="mc-big"><b>${p.health}<span>%</span></b><small>${badge(p.status)} · weakest-part health</small></div></div><details class="w-math"><summary>Why this score?</summary><div class="mc-math">100${p.healthParts.map(([label, v]) => `<br>−${-v} <em>${esc(label)}</em>`).join('')}${!p.healthParts.length ? ' · nothing deducted' : ''}</div></details>${kv('Hermetic tests', `${p.clean} of ${p.tests} clean`)}<div class="chans">${F.CHANNELS.map(c => `<span class="${p.chan[c] ? 'on' : ''}" title="${p.chan[c]} leaking tests through ${c}">${c}${p.chan[c] ? ' ' + p.chan[c] : ''}</span>`).join('')}</div>${kv('Blast radius', F.plural(down.size, 'primitive') + ' downstream')}${kv('Context estimate', F.fmt(pk.tokens) + ' tokens')}${p.violations.map(v => `<div class="w-finding"><b>${badge(v.sev)} · ${esc(v.rule)}</b><p>${esc(v.fix)}</p></div>`).join('')}<details class="w-dependencies"><summary>${F.inc.get(p.id).length} inputs · ${F.out.get(p.id).length} outputs</summary>${[...new Set([...F.inc.get(p.id).map(e => e.from), ...F.out.get(p.id).map(e => e.to)])].map(nodeButton).join('')}</details>${tasks.map(t => kv(esc(clientName(t.agent)), `${esc(OPEN[t.status])}<em>${esc(t.id)}</em>`)).join('')}<div class="mc-act"><button class="btn sm" data-w="parts">Inspect tests</button>${line ? `<button class="btn sm" data-w="line" data-line="${line.id}">Open pipeline</button>` : ''}<button class="btn sm" data-w="handoff">${icon('send')}Draft handoff</button></div><div class="handoff" hidden><small>Sample queue only. Choose the client you use; no MCP message will be sent.</small><div>${D.agents.filter(a => a.state !== 'offline').map(a => `<button class="btn sm" data-w="send" data-client="${a.id}">${esc(a.name)}</button>`).join('')}</div></div>`;
        }
        card.innerHTML = `<div class="mc-h"><span class="mc-ic">${icon(p.kind)}</span><div><b class="mono">${esc(p.id)}</b><small>${esc(sysById.get(p.sys).name)} / ${F.stageName(p.stage)} / ${p.kind}</small></div>${closeButton}</div><div class="w-inspector-tabs" role="tablist" aria-label="Primitive detail">${['details', 'tests', 'context'].map(t => `<button role="tab" aria-selected="${st.tab === t}" data-w="tab" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div><div class="w-inspector-body" role="tabpanel">${body}</div>`;
      } else if (st.sel.startsWith('hall:')) {
        card.innerHTML = `<div class="mc-h"><span class="mc-ic">${icon('layers')}</span><div><b>${esc(n.name)}</b><small>System hall · ${esc(sysById.get(n.sys).repo)}</small></div>${closeButton}</div><p class="mc-desc">Primitives remain inside their owning system in every grouping.</p>${kv('Health', n.health + '% · minimum')}${kv('Primitives in this view', n.ids.length)}${n.ids.map(nodeButton).join('')}<div class="mc-act"><button class="btn sm" data-w="zoom">Focus hall</button></div>`;
      } else if (n.type === 'repo') {
        card.innerHTML = `<div class="mc-h"><span class="mc-ic">${icon('repo')}</span><div><b>${esc(n.name)}</b><small>Repository dock · sample</small></div>${closeButton}</div>${kv('Branch', esc(n.r.branch))}${kv('Commit', esc(n.r.commit))}${kv('Files', n.r.files)}${kv('Systems', D.systems.filter(s => s.repo === n.name).map(s => esc(s.name)).join(', '))}`;
      } else if (n.type === 'mcp') {
        card.innerHTML = `<div class="mc-h"><span class="mc-ic">${icon('mcp')}</span><div><b>${esc(n.name)}</b><small>MCP boundary port · sample</small></div>${closeButton}</div><p class="mc-desc">${esc(n.c.role)}</p>${kv('Transport', esc(n.c.where))}${kv('Model calls by Code Universe', '0')}<p class="mc-desc">Activity arrives from the AI you already use. This published sample is not connected to a live MCP server.</p>`;
      } else {
        card.innerHTML = `<div class="mc-h"><span class="mc-ic">${icon('org')}</span><div><b>Code Universe</b><small>Human operational control</small></div>${closeButton}</div><p class="mc-desc">The whole factory: systems contain primitives; primitives contain their tests. A mismanaged part limits the health of everything.</p>${kv('Plant health', F.plant.health + '% · minimum')}${nodeButton(F.plant.weakest.id)}${kv('Orthogonality', F.ortho.score + '%')}${kv('Clean connections', F.ortho.clean + ' of ' + F.ortho.total)}${kv('Hermetic tests', F.tests.clean + ' of ' + F.tests.total + ' clean')}${kv('Model calls', '0')}<p class="mc-desc">Sample research lab. GitHub, tests and MCP activity here are fixtures, not live measurements.</p>`;
      }
    }
    function packetText() {
      if (!L.machines.has(st.sel)) return '';
      const p = F.byId.get(st.sel), pk = F.packet([p.id]);
      return JSON.stringify({ source: 'sample', primitive: p.id, system: sysById.get(p.sys).name, contract: p.desc, health: p.health, healthRule: 'minimum of primitive health', inputs: F.inc.get(p.id).map(({ from, type }) => ({ from, type })), outputs: F.out.get(p.id).map(({ to, type }) => ({ to, type })), tests: { total: p.tests, clean: p.clean, issues: p.issues }, audit: p.violations.map(v => ({ rule: v.rule, fix: v.fix })), contextEstimate: pk, modelCalls: 0 }, null, 2);
    }
    function notice(message) { const el = root.querySelector('.w-notice'); el.textContent = message; el.hidden = false; clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { el.hidden = true; }, 3500); }
    async function action(b) {
      if (opts.onAction?.(b, st.sel)) return;
      const w = b.dataset.w, [cx, cy] = cameraCentre();
      if (w === 'in' || w === 'out') zoomAt(w === 'in' ? 1.35 : 1 / 1.35, cx, cy);
      else if (w === 'fit') fit();
      else if (w === 'level') level(+b.dataset.lv);
      else if (w === 'close') { select(null); root.focus({ preventScroll: true }); }
      else if (w === 'zoom') focus(st.sel);
      else if (w === 'parts') { focus(st.sel, true); st.tab = 'tests'; renderCard(); }
      else if (w === 'line') opts.onLine?.(b.dataset.line);
      else if (w === 'tab') { st.tab = b.dataset.tab; st.test = null; renderCard(); card.querySelector(`[data-tab="${st.tab}"]`).focus({ preventScroll: true }); }
      else if (w === 'handoff') { const el = card.querySelector('.handoff'); el.hidden = !el.hidden; }
      else if (w === 'send') { opts.onSend?.(st.sel, b.dataset.client); notice('Draft added to the sample queue. No MCP message sent.'); }
      else if (w === 'copy') { try { await navigator.clipboard.writeText(packetText()); notice('Sample context packet copied.'); } catch { notice('Clipboard unavailable. Use Download JSON.'); } }
      else if (w === 'download') { const a = document.createElement('a'), url = URL.createObjectURL(new Blob([packetText()], { type: 'application/json' })); a.href = url; a.download = st.sel + '-context.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      else if (w === 'expand') { root.classList.toggle('expanded'); b.setAttribute('aria-label', root.classList.contains('expanded') ? 'Collapse architecture' : 'Expand architecture'); b.setAttribute('aria-pressed', String(root.classList.contains('expanded'))); st.moved = false; }
    }
    const ac = new AbortController(), events = { signal: ac.signal };
    root.addEventListener('click', ev => {
      if (drag?.moved || root.dataset.suppress === '1') return;
      const b = ev.target.closest('[data-w]'); if (b) { action(b); return; }
      const link = ev.target.closest('[data-focus]'); if (link) { focus(link.dataset.focus); return; }
      if (ev.target.closest('.w-inspector')) return;
      const test = ev.target.closest('[data-test]');
      if (test) { select(test.dataset.machine); st.tab = 'tests'; st.test = +test.dataset.test; renderCard(); card.querySelector('.chosen')?.scrollIntoView({ block: 'nearest' }); return; }
      const n = ev.target.closest('[data-node]');
      if (n) { if (L.machines.has(n.dataset.node) || (st.lv === 0 && n.dataset.node.startsWith('hall:'))) focus(n.dataset.node); else select(n.dataset.node); }
      else select(null);
    }, events);
    root.addEventListener('dblclick', ev => { if (ev.target.closest('.w-inspector,.w-ctrl')) return; const n = ev.target.closest('[data-node]'); if (n) focus(n.dataset.node, true); }, events);
    const pointers = new Map(); let pinch = null;
    root.addEventListener('pointerdown', ev => {
      if (ev.button !== 0 || ev.target.closest('.w-inspector,.w-ctrl,.w-breadcrumb')) return;
      pointers.set(ev.pointerId, [ev.clientX, ev.clientY]);
      if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { distance: Math.hypot(a[0] - b[0], a[1] - b[1]), centre: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; drag = null; return; }
      root.dataset.suppress = '0'; drag = { x: ev.clientX, y: ev.clientY, tx: st.tx, ty: st.ty, moved: false, id: ev.pointerId };
    }, events);
    root.addEventListener('pointermove', ev => {
      if (pointers.has(ev.pointerId)) pointers.set(ev.pointerId, [ev.clientX, ev.clientY]);
      if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()], distance = Math.hypot(a[0] - b[0], a[1] - b[1]), c = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], bounds = root.getBoundingClientRect(); zoomAt(distance / (pinch.distance || 1), c[0] - bounds.left, c[1] - bounds.top, false); st.tx += c[0] - pinch.centre[0]; st.ty += c[1] - pinch.centre[1]; pinch = { distance, centre: c }; root.dataset.suppress = '1'; apply(); return; }
      if (!drag) return;
      const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      drag.moved = true; root.dataset.suppress = '1'; root.classList.add('drag'); root.setPointerCapture(drag.id); cancel();
      st.tx = drag.tx + dx; st.ty = drag.ty + dy; st.moved = true; apply();
    }, events);
    function endPointer(ev) { pointers.delete(ev.pointerId); if (root.hasPointerCapture(ev.pointerId)) root.releasePointerCapture(ev.pointerId); drag = null; if (pointers.size < 2) pinch = null; root.classList.remove('drag'); }
    root.addEventListener('pointerup', endPointer, events); root.addEventListener('pointercancel', endPointer, events);
    root.addEventListener('wheel', ev => { if (ev.target.closest('.w-inspector')) return; ev.preventDefault(); const r = root.getBoundingClientRect(), delta = ev.deltaY * (ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? st.H : 1); zoomAt(Math.exp(-delta * (ev.ctrlKey ? .006 : .0016)), ev.clientX - r.left, ev.clientY - r.top, false); }, { ...events, passive: false });
    root.addEventListener('keydown', ev => {
      if (ev.target.closest('input,textarea,select')) return;
      if (ev.key === 'Escape') { select(null); if (root.classList.contains('expanded')) { root.classList.remove('expanded'); st.moved = false; } root.focus({ preventScroll: true }); return; }
      if (ev.target.closest('.w-inspector')) return;
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.matches('[data-node],[data-test]')) { ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
      const [cx, cy] = cameraCentre();
      const keys = { '+': () => zoomAt(1.3, cx, cy), '=': () => zoomAt(1.3, cx, cy), '-': () => zoomAt(1 / 1.3, cx, cy), '0': fit };
      if (keys[ev.key]) { ev.preventDefault(); keys[ev.key](); }
      else if (ev.key.startsWith('Arrow')) { ev.preventDefault(); cancel(); st.tx += ({ ArrowLeft: 50, ArrowRight: -50 }[ev.key] || 0); st.ty += ({ ArrowUp: 50, ArrowDown: -50 }[ev.key] || 0); st.moved = true; apply(); }
    }, events);
    function setLens(lens) {
      if (!['system', 'stage', 'health', 'repo'].includes(lens) || st.dead || lens === st.lens) return;
      cancel(); st.lens = lens; L = layout(lens); st.sel = null; card.hidden = true; st.moved = false; build(); Object.assign(st, view()); apply();
      root.querySelector('.w-sr').textContent = `Grouped by ${lens}. ${L.halls.length} system halls. Ownership preserved.`;
    }
    build();
    const ro = new ResizeObserver(() => {
      if (st.dead) return; const r = root.getBoundingClientRect(); if (!r.width || !r.height) return;
      const oldW = st.W, oldH = st.H; st.W = r.width; st.H = r.height;
      if (!oldW || !st.moved) Object.assign(st, view()); else { st.tx += (st.W - oldW) / 2; st.ty += (st.H - oldH) / 2; }
      apply();
    });
    ro.observe(root);
    return { setLens, select, focus, setTasks(list) { st.tasks = list; buildBeams(); renderCard(); highlight(); apply(); }, destroy() { st.dead = true; ro.disconnect(); ac.abort(); cancel(); clearTimeout(noticeTimer); root.classList.remove('expanded'); } };
  }
  return { mount, icon, HUE, STATUS, esc, layout, contains };
}
 window.createFactoryWeb = createFactoryWeb;
 window.WEB = createFactoryWeb(window.FACTORY);
})();