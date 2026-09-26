import { campusRouter } from './code-routing.mjs';
import { explainOperation, explainSourceLine } from './code-explain.mjs';
import { sourceWindow } from './code-preview.mjs';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shape = { function: 'ƒ', method: 'ƒ', class: '▣', module: '↳', handler: '⚑', decision: '◇', result: '→', value: '≡', test: '✓', call: '↗', input: '⇥', output: '⇢', network: '↔', storage: '▤', event: '⚑', transform: '⋈', guard: '◇', observe: '·', import: '↳' };
const label = { function: 'Function', method: 'Method', class: 'Class', module: 'Setup', handler: 'Handler', decision: 'Decision', result: 'Return', value: 'Value', test: 'Test', call: 'Call', input: 'Read', output: 'Output', network: 'Request', storage: 'Data', event: 'Event', transform: 'Transform', guard: 'Guard', observe: 'Log', import: 'Import' };
Object.assign(shape, { loop: '↻', config: '≡', job: '▷', automation: '▷', query: '▤', schema: '▣', style: '◈', document: '¶' });
Object.assign(label, { loop: 'Loop', config: 'Configuration', job: 'Workflow job', automation: 'Step', query: 'Query', schema: 'Schema', style: 'Style', document: 'Document' });
Object.assign(shape, {element:'▧',trigger:'⚑'}); Object.assign(label,{element:'Interface element',trigger:'Workflow event'});
Object.assign(shape,{section:'≡'});Object.assign(label,{section:'Source section'});
Object.assign(shape,{type:'T'});Object.assign(label,{type:'Type contract'});
const inputHelp = name => { const key = name.split(':')[0].trim(); return ({__proto__:null,req:'the incoming request',request:'the incoming request',res:'the outgoing response',response:'the outgoing response',reply:'the outgoing response',callback:'a function to call when this step finishes',next:'the next step in the processing chain',props:'settings passed into this interface component',children:'content placed inside this component',context:'shared information for this operation',ctx:'shared information for this operation'})[key] || ''; };
const codeLanguages = /^(?:JavaScript|TypeScript|Python|Go|Rust|Java|Kotlin|C#|C|C\+\+|Ruby|PHP|Swift|Scala|Elixir|Vue|Svelte|Shell|PowerShell)$/;
const point = r => [r.x + r.w / 2, r.y + r.h / 2];
const poly = pts => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');

export function anatomyLayout(model, previous = null) {
  const useful = model.files.filter(f => f.analyzed && model.byFile.get(f.path)?.length);
  const groups = model.systems.map(s => ({ ...s, files: useful.filter(f => f.system === s.id) })).filter(s => s.files.length);
  const systems = [], modules = [], parts = new Map(), operations = new Map();
  const PW = 276, PG = 30, PAD = 20;
  let sx = 50, maxH = 0;
  for (const system of groups) {
    const moduleSpecs = system.files.map(file => {
      const nodes = model.byFile.get(file.path) || [], cols = nodes.length > 3 ? 3 : Math.max(1, nodes.length);
      const bottoms = Array(cols).fill(0), placements = nodes.map(p => { const col = bottoms.indexOf(Math.min(...bottoms)), rows = Math.max(Math.ceil((p.operations?.length || 0) / 3), Math.min(3, Math.max(0, (p.blocks?.length || 1) - 1))), h = 102 + rows * 25, dy = bottoms[col]; bottoms[col] += h + 28; return { p, col, h, dy }; });
      return { file, nodes, cols, placements, w: 2 * PAD + cols * PW + (cols - 1) * PG, h: 94 + Math.max(...bottoms, 0) };
    }).sort((a, b) => b.nodes.length - a.nodes.length || a.file.path.localeCompare(b.file.path));
    const columnWidth = Math.max(850, ...moduleSpecs.map(m => m.w)), ncols = Math.max(1, Math.min(moduleSpecs.length, 8, Math.ceil(Math.sqrt(moduleSpecs.reduce((sum, m) => sum + m.h + 65, 0) / columnWidth)))), bottoms = Array(ncols).fill(140), sys = { id: system.id, name: system.name, x: sx, y: 50, w: ncols * (columnWidth + 56) + 32, h: 0, files: moduleSpecs.length, count: moduleSpecs.reduce((n, m) => n + m.nodes.length, 0) };
    for (const spec of moduleSpecs) {
      const col = bottoms.indexOf(Math.min(...bottoms)), x = sx + 38 + col * (columnWidth + 56), y = bottoms[col], module = { ...spec, id: spec.file.path, x, y, w: columnWidth, h: spec.h, system: sys.id };
      modules.push(module);
      spec.placements.forEach(({ p, col, h, dy }, pi) => {
        const designator = `P${String(pi + 1).padStart(2, '0')}`, r = { ...p, designator, x: x + PAD + col * (PW + PG), y: y + 72 + dy, w: PW, h }; parts.set(p.id, r);
        (p.operations || []).forEach((op, oi) => operations.set(op.id, { ...op, x: r.x + 12 + oi % 3 * 84, y: r.y + 82 + Math.floor(oi / 3) * 25, w: 76, h: 19 }));
      }); bottoms[col] += module.h + 65;
    }
    sys.h = Math.max(...bottoms) - 50; systems.push(sys); sx += sys.w + 100; maxH = Math.max(maxH, sys.y + sys.h);
  }
  // Fold systems into a legible campus; inner geometry stays literal containment.
  const targetWidth = Math.max(2100, Math.sqrt(Math.max(1, systems.reduce((a, s) => a + s.w * s.h, 0))) * 1.4);
  let x = 50, y = 80, rowH = 0;
  for (const sys of systems) {
    if (x > 50 && x + sys.w > targetWidth) { x = 50; y += rowH + 110; rowH = 0; }
    const dx = x - sys.x, dy = y - sys.y; sys.x = x; sys.y = y;
    for (const module of modules.filter(m => m.system === sys.id)) { module.x += dx; module.y += dy; }
    for (const p of parts.values()) if (p.system === sys.id) { p.x += dx; p.y += dy; for (const op of p.operations) { const r = operations.get(op.id); r.x += dx; r.y += dy; } }
    x += sys.w + 100; rowH = Math.max(rowH, sys.h);
  }
  // A live refresh pins every existing hall, file and part. New files append below
  // their hall and new parts use free rows in their file; unrelated geometry never moves.
  if (previous) {
    const oldSystems = new Map(previous.systems.map(system => [system.id, system])), oldModules = previous.moduleById, oldParts = previous.parts, oldOperations = previous.operations;
    for (const sys of systems) {
      const oldSystem = oldSystems.get(sys.id); if (!oldSystem) continue;
      sys.x = oldSystem.x; sys.y = oldSystem.y; sys.w = Math.max(sys.w, oldSystem.w); sys.h = Math.max(sys.h, oldSystem.h);
      const owned = modules.filter(module => module.system === sys.id), pinned = owned.filter(module => oldModules.has(module.id));
      let appendY = Math.max(sys.y + 140, ...pinned.map(module => oldModules.get(module.id).y + oldModules.get(module.id).h + 65));
      for (const module of owned) {
        const oldModule = oldModules.get(module.id), targetX = oldModule?.x ?? (sys.x + 38), targetY = oldModule?.y ?? appendY, dx = targetX - module.x, dy = targetY - module.y;
        module.x = targetX; module.y = targetY; module.w = Math.max(module.w, oldModule?.w || 0); module.h = Math.max(module.h, oldModule?.h || 0);
        for (const part of module.nodes) {
          const geometry = parts.get(part.id); geometry.x += dx; geometry.y += dy;
          for (const operation of part.operations || []) { const op = operations.get(operation.id); if (op) { op.x += dx; op.y += dy; } }
          const oldPart = oldParts.get(part.id); if (oldPart) {
            const pdx = oldPart.x - geometry.x, pdy = oldPart.y - geometry.y; geometry.x = oldPart.x; geometry.y = oldPart.y; geometry.w = oldPart.w; geometry.h = Math.max(geometry.h, oldPart.h);
            for (const operation of part.operations || []) { const op = operations.get(operation.id), oldOp = oldOperations.get(operation.id); if (op && oldOp) Object.assign(op, { x: oldOp.x, y: oldOp.y, w: oldOp.w, h: oldOp.h }); else if (op) { op.x += pdx; op.y += pdy; } }
          }
        }
        if (oldModule) {
          let newY = Math.max(module.y + 72, ...module.nodes.filter(part => oldParts.has(part.id)).map(part => { const item = parts.get(part.id); return item.y + item.h + 28; }));
          for (const part of module.nodes.filter(part => !oldParts.has(part.id))) { const item = parts.get(part.id), dx2 = module.x + PAD - item.x, dy2 = newY - item.y; item.x += dx2; item.y += dy2; for (const operation of part.operations || []) { const op = operations.get(operation.id); if (op) { op.x += dx2; op.y += dy2; } } newY += item.h + 28; }
          module.h = Math.max(module.h, newY - module.y + 18);
        }
        if (!oldModule) appendY = module.y + module.h + 65;
      }
      sys.w = Math.max(sys.w, ...owned.map(module => module.x + module.w - sys.x + 32)); sys.h = Math.max(sys.h, ...owned.map(module => module.y + module.h - sys.y + 35));
    }
  }
  const moduleById = new Map(modules.map(m => [m.id, m]));
  const systemById = new Map(systems.map(s => [s.id, s])), outer = campusRouter(systems), routesBySystems = new Map();
  function corridor(a, b, fromY, toY) {
    const sa = systemById.get(a.system), sb = systemById.get(b.system), start = [a.x - 14, fromY], end = [b.x - 14, toY];
    if (a === b) return [start, [end[0], start[1]], end];
    if (sa === sb) return [start, [start[0], sa.y + 58], [end[0], sa.y + 58], end];
    const key = sa.id + '>' + sb.id;
    if (!routesBySystems.has(key)) routesBySystems.set(key, outer([sa.x - 24, sa.y + 58], [sb.x - 24, sb.y + 58]));
    return [start, [start[0], sa.y + 58], ...routesBySystems.get(key), [end[0], sb.y + 58], end];
  }
  const routes = model.edges.filter(e => parts.has(e.from) && parts.has(e.to)).map((e, i) => {
    const a = parts.get(e.from), b = parts.get(e.to), from = [a.x + a.w, a.y + 24], to = [b.x, b.y + 24];
    const ma = moduleById.get(parts.get(e.from).path), mb = moduleById.get(b.path);
    // Wires leave parts through the row gutters; cross-file wires travel outside file walls.
    const exit = ma.y + ma.h - 16, entry = mb.y + mb.h - 16;
    const pts = ma === mb ? [from, [from[0] + 11, from[1]], [from[0] + 11, exit], [to[0] - 11, exit], [to[0] - 11, to[1]], to] : [from, [from[0] + 11, from[1]], [from[0] + 11, exit], ...corridor(ma, mb, exit, entry), [to[0] - 11, entry], [to[0] - 11, to[1]], to];
    return { ...e, points: pts, d: poly(pts) };
  });
  const fileRoutes = model.fileEdges.filter(e => moduleById.has(e.from) && moduleById.has(e.to)).map((e, i) => {
    const a = moduleById.get(e.from), b = moduleById.get(e.to), points = [[a.x, a.y + 38], ...corridor(a, b, a.y + 38, b.y + 38), [b.x, b.y + 38]];
    return { ...e, points, d: poly(points) };
  });
  const endpoint = (id, side) => { const r = operations.get(id) || parts.get(id); return r ? [side === 'from' ? r.x + r.w : r.x, r.y + Math.min(24, r.h / 2)] : null; };
  const dataRoutes = (model.dataEdges || []).map(edge => {
    const from = endpoint(edge.from, 'from'), to = endpoint(edge.to, 'to'); if (!from || !to) return null;
    const a = operations.get(edge.from) || parts.get(edge.from), b = operations.get(edge.to) || parts.get(edge.to), ap = parts.get(a.owner) || a, bp = parts.get(b.owner) || b, sameOwner = ap.id === bp.id;
    let points;
    if (sameOwner) { const bend=Math.max(from[0]+5,(from[0]+to[0])/2); points=[from,[bend,from[1]],[bend,to[1]],to]; }
    else {
      const ma=moduleById.get(ap.path), mb=moduleById.get(bp.path), exit=ma.y+ma.h-10, entry=mb.y+mb.h-10, ax=ap.x+ap.w+11, bx=bp.x-11;
      points=ma===mb ? [from,[ax,from[1]],[ax,exit],[bx,exit],[bx,to[1]],to] : [from,[ax,from[1]],[ax,exit],...corridor(ma,mb,exit,entry),[bx,entry],[bx,to[1]],to];
    }
    return { ...edge, points, d: poly(points) };
  }).filter(Boolean);
  return { systems, modules, moduleById, parts, operations, routes, dataRoutes, fileRoutes, w: Math.max(900, ...systems.map(s => s.x + s.w)) + 50, h: Math.max(500, ...systems.map(s => s.y + s.h)) + 70 };
}

let serial = 0;
export function mountCodeMap(host, model, { onSource = () => {}, onContext = () => {}, onAnalyze = () => {}, initialFile = null, sample = false, docked = true } = {}) {
  let currentModel = model, L = anatomyLayout(currentModel), partElements = [], arrivalTimer = 0;
  const uid = 'anatomy-' + ++serial;
  const state = { k: .58, tx: 0, ty: 0, W: 0, H: 0, selected: null, moved: false, dead: false, connections: true, drag: null, follow: null, wrap: true, lens: null, tasks: [] };
  host.innerHTML = `<div class="code-map" tabindex="0" aria-label="Code factory engineering drawing. Drag to pan. Scroll or use plus and minus to zoom. Select a function, operation or file to inspect its source."><svg class="cm-canvas" aria-label="Detailed code factory"><defs><pattern id="${uid}-grid" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="15" cy="15" r=".6" fill="#323232"/></pattern><marker id="${uid}-arrow" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="#ccc"/></marker><marker id="${uid}-type-arrow" viewBox="0 0 7 7" refX="6" refY="3.5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 .5L6 3.5L0 6.5Z" fill="none" stroke="#eee"/></marker></defs><g class="cm-world"></g></svg><div class="cm-top"><div><span class="cm-mark">${sample ? 'ILLUSTRATIVE CODE' : 'SOURCE-BACKED MAP'}</span><b class="cm-location">The whole factory</b><span class="cm-lens-readout" aria-live="polite">LENS / ALL</span></div><button data-cm="fit">Whole map ↗</button></div><div class="cm-topology"></div><aside class="cm-inspector" aria-label="Explain this code" hidden></aside><div class="cm-bottom"><span class="cm-legend">▣ System <i></i> File <i></i> ƒ Part <i></i> ┄ Value <i></i> ═ Type <i></i> → Call</span><span class="cm-tip">Select a part · Scroll to explore · Drag to move</span></div><div class="cm-title-block" aria-label="Drawing title block"></div><div class="cm-controls"><button data-cm="out" aria-label="Zoom out">−</button><output>58%</output><button data-cm="in" aria-label="Zoom in">+</button><button data-cm="fit" aria-label="Fit all code">⌂</button><button data-cm="wires" aria-label="Toggle all connections" aria-pressed="true">⌁</button><button data-cm="expand" aria-label="Expand code factory">⛶</button></div><div class="cm-minimap" aria-label="Factory navigation"></div></div>`;
  const root = host.firstElementChild, world = root.querySelector('.cm-world'), inspector = root.querySelector('.cm-inspector');
  const stage=document.createElement('div'); stage.className='cm-stage'; [...root.children].filter(el=>el!==inspector).forEach(el=>stage.append(el)); root.prepend(stage); root.classList.toggle('cm-docked',docked);
  let preview=null;
  const attrs = (id, what) => `data-part="${esc(id)}" role="button" tabindex="0" aria-label="${esc(what)}"`;
  const titleData = () => { const repo = currentModel.repository || currentModel.repo || currentModel.project || {}, repoName=typeof repo === 'string' ? repo : repo.fullName || repo.name; return { repo: repoName || currentModel.repoName || 'LOCAL SOURCE', scope: currentModel.scope || currentModel.systems?.map(s => s.name).join(' / ') || 'ALL SYSTEMS', revision: (typeof repo === 'object' && (repo.commit || repo.revision || repo.ref)) || currentModel.revision || '—' }; };
  const ruler = () => { const xs=[], ys=[]; for(let x=0;x<=L.w;x+=100)xs.push(`<path d="M${x} 0v${x%500?10:18}"/><text x="${x+4}" y="28">${x}</text>`); for(let y=0;y<=L.h;y+=100)ys.push(`<path d="M0 ${y}h${y%500?10:18}"/><text x="22" y="${y+4}">${y}</text>`); return `<g class="cm-rulers" aria-hidden="true">${xs.join('')}${ys.join('')}</g>`; };
  function renderMap(changedPaths = []) {
    const changed = new Set(changedPaths || []), blockMarkup = p => (p.blocks || []).filter(b => b.kind !== 'entry').slice(0,3).map((b,i) => { const y=p.y+61+i*7, inset=Math.min(42,Math.max(0,(b.depth||0)*7)); return `<g class="cm-control-block block-${esc(b.kind)}"><rect x="${p.x+12+inset}" y="${y}" width="${Math.max(30,p.w-24-inset)}" height="5"/><title>${esc(b.label)} · L${b.line}–${b.endLine}</title></g>`; }).join('');
    world.innerHTML = `<rect x="-10000" y="-10000" width="40000" height="40000" fill="url(#${uid}-grid)"/>${ruler()}${L.systems.map((s,i) => `<g class="cm-system"><rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}"/><text x="${s.x + 24}" y="${s.y + 30}">SYS-${String(i+1).padStart(2,'0')} / ${esc(s.name)}<tspan dx="15">${s.files} files · ${s.count} parts</tspan></text></g>`).join('')}
      <g class="cm-import-wires">${L.fileRoutes.map(e => `<path data-file-from="${esc(e.from)}" data-file-to="${esc(e.to)}" d="${e.d}" marker-end="url(#${uid}-arrow)"/>`).join('')}</g>
      ${L.modules.map((m,i) => `<g class="cm-file${changed.has(m.id)?' arriving':''}" ${attrs(m.id, `File ${m.id}. ${m.nodes.length} code parts`)}><rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}"/><rect class="cm-file-tab" x="${m.x}" y="${m.y}" width="${m.w}" height="52"/><text x="${m.x + 18}" y="${m.y + 24}">F-${String(i+1).padStart(3,'0')} / ${esc(m.id)}<tspan class="cm-file-meta" x="${m.x + 18}" dy="17">${esc(m.file.language)} · ${m.file.lines} lines · ${m.nodes.length} parts${m.file.history?.churn ? ` · Δ${m.file.history.churn}` : ''}</tspan></text></g>`).join('')}
      <g class="cm-call-wires">${L.routes.map(e => `<path data-wire="${esc(e.id)}" role="button" tabindex="0" aria-label="${esc(e.label)} connection at ${esc(e.evidence)}" data-from="${esc(e.from)}" data-to="${esc(e.to)}" d="${e.d}" marker-end="url(#${uid}-arrow)"><title>${esc(e.label)} · ${esc(e.evidence)}</title></path>`).join('')}</g>
      <g class="cm-data-wires">${L.dataRoutes.map(e => `<path class="cm-${e.kind}-wire" data-data-wire="${esc(e.id)}" data-from="${esc(e.from)}" data-to="${esc(e.to)}" d="${e.d}" ${e.kind==='type'?`marker-end="url(#${uid}-type-arrow)"`:''}><title>${esc(e.kind)} / ${esc(e.value || '')} · ${esc(e.evidence || '')}</title></path>`).join('')}</g>
      ${[...L.parts.values()].map(p => `<g class="cm-part kind-${p.kind}${changed.has(p.path)?' arriving':''}" data-lenses="${esc((p.lenses||[]).join(' '))}" ${attrs(p.id, `${label[p.kind] || p.kind} ${p.name}. Line ${p.line}`)}><rect class="cm-part-body" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}"/><text class="cm-designator" x="${p.x+p.w-12}" y="${p.y+17}" text-anchor="end">${p.designator}</text><text class="cm-kind-icon" x="${p.x + 12}" y="${p.y + 23}">${shape[p.kind] || '·'}</text><text class="cm-part-name" x="${p.x + 33}" y="${p.y + 23}">${esc(p.name.length > 25 ? p.name.slice(0, 23) + '…' : p.name)}</text><text class="cm-part-meta" x="${p.x + 12}" y="${p.y + 44}">${label[p.kind] || p.kind} · L${p.line}–${p.endLine} · C${p.metrics?.cyclomatic || 1} / FI${p.metrics?.fanIn || 0} / FO${p.metrics?.fanOut || 0}</text><path class="cm-rule" d="M${p.x + 12} ${p.y + 55}H${p.x + p.w - 12}"/>${blockMarkup(p)}<circle class="cm-port" cx="${p.x}" cy="${p.y + 24}" r="3"/><circle class="cm-port" cx="${p.x + p.w}" cy="${p.y + 24}" r="3"/><g class="cm-operation-slot"></g></g>`).join('')}`;
    const coverage=currentModel.coverage||{}, td=titleData();
    root.querySelector('.cm-topology').innerHTML = `<span>${L.parts.size.toLocaleString()} parts</span><span>${L.operations.size.toLocaleString()} ops</span><span>${coverage.blocks ?? currentModel.blocks?.length ?? 0} blocks</span><span>${L.dataRoutes.length} data/type nets</span>`;
    root.querySelector('.cm-title-block').innerHTML=`<span>CODE FACTORY / ENGINEERING DRAWING</span><b>${esc(td.repo)}</b><i>SCOPE ${esc(td.scope)}</i><i>REV ${esc(String(td.revision).slice(0,12))}</i>`;
    root.querySelector('.cm-minimap').innerHTML = `<svg viewBox="0 0 ${L.w} ${L.h}" preserveAspectRatio="xMidYMid meet">${L.modules.map(m => `<rect data-mini="${esc(m.id)}" x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}"/>`).join('')}<rect class="cm-viewport"/></svg>`;
    partElements = [...world.querySelectorAll('.cm-part')].map(el => ({el,p:L.parts.get(el.dataset.part),slot:el.querySelector('.cm-operation-slot')}));
    applyLens();
  }
  renderMap();
  function renderOperations(p) {
    const links = p.operations.slice(1).map((op,i) => { const a=L.operations.get(p.operations[i].id), b=L.operations.get(op.id), from=[a.x+a.w,a.y+a.h/2], to=[b.x,b.y+b.h/2]; const points=a.y===b.y?[from,to]:[from,[from[0]+3,from[1]],[from[0]+3,a.y+22],[to[0]-3,a.y+22],[to[0]-3,to[1]],to]; return '<path class="cm-op-link" d="'+poly(points)+'"><title>Source order, not a runtime trace</title></path>'; }).join('');
    return links + p.operations.map(op => { const r = L.operations.get(op.id); return `<g class="cm-operation" ${attrs(op.id, `${op.label}. Line ${op.line}`)}><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="2"/><text x="${r.x + r.w / 2}" y="${r.y + 12}" text-anchor="middle">${shape[op.kind]} ${esc(op.name.split(".").at(-1).slice(0, 9))}</text><title>${esc(op.name)} · ${esc(op.label)} · L${op.line}</title></g>`; }).join('');
  }
  function apply() {
    world.setAttribute('transform', `translate(${state.tx},${state.ty}) scale(${state.k})`);
    root.dataset.detail = state.k < .25 ? 'systems' : state.k < .48 ? 'files' : state.k < .95 ? 'parts' : 'operations';
    root.querySelector('output').textContent = Math.round(state.k * 100) + '%';
    const view = root.querySelector('.cm-viewport'); for (const [key, value] of Object.entries({ x: -state.tx / state.k, y: -state.ty / state.k, width: state.W / state.k, height: state.H / state.k })) view.setAttribute(key, value);
    const visible = r => !!r && r.x * state.k + state.tx < state.W && (r.x + r.w) * state.k + state.tx > 0 && r.y * state.k + state.ty < state.H - 45 && (r.y + r.h) * state.k + state.ty > 85;
    partElements.forEach(({el,p,slot}) => { const shown = !!p && state.k >= .25 && visible(p); if (el.dataset.visible !== String(shown)) { el.dataset.visible = shown; el.setAttribute('aria-hidden', !shown); el.setAttribute('tabindex', shown ? '0' : '-1'); slot.innerHTML = shown ? renderOperations(p) : ''; } slot.querySelectorAll('.cm-operation').forEach(op => { const focusable = shown && state.k >= .65; if (op.getAttribute('tabindex') !== (focusable ? '0' : '-1')) op.setAttribute('tabindex', focusable ? '0' : '-1'); }); });
    root.querySelectorAll('.cm-file').forEach(el => { const shown = visible(L.moduleById.get(el.dataset.part)); el.setAttribute('aria-hidden', !shown); el.setAttribute('tabindex', shown ? '0' : '-1'); });
  }
  function camera(rect, fit = false) {
    const left = docked || inspector.hidden ? 0 : Math.min(340, state.W * .43), available = Math.max(200, state.W - left - 50), height = Math.max(200, state.H - 135);
    state.k = Math.max(.004, Math.min(fit ? 1 : 1.25, available / (rect.w + 60), height / (rect.h + 40)));
    const [cx, cy] = point(rect); state.tx = left + (state.W - left) / 2 - cx * state.k; state.ty = 83 + height / 2 - cy * state.k; apply();
  }
  function zoom(factor, x = state.W / 2, y = state.H / 2) { const k = Math.max(.004, Math.min(2.8, state.k * factor)), f = k / state.k; state.tx = x - (x - state.tx) * f; state.ty = y - (y - state.ty) * f; state.k = k; state.moved = true; apply(); }
  function highlight(id) {
    const op = L.operations.get(id), p = op ? L.parts.get(op.owner) : L.parts.get(id), m = L.moduleById.get(id), related = new Set(p ? [p.id] : []);
    if (p) L.routes.filter(e => e.from === p.id || e.to === p.id).forEach(e => { related.add(e.from); related.add(e.to); });
    root.classList.toggle('cm-selected', !!id); root.classList.toggle('cm-file-selected', !!m);
    root.querySelectorAll('.cm-part').forEach(el => { const n = L.parts.get(el.dataset.part); el.classList.toggle('related', !!n && (related.has(n.id) || m?.id === n.path)); el.classList.toggle('selected', n?.id === p?.id); });
    root.querySelectorAll('.cm-call-wires path').forEach(el => el.classList.toggle('related', el.dataset.from === p?.id || el.dataset.to === p?.id || m && (L.parts.get(el.dataset.from)?.path === m.id || L.parts.get(el.dataset.to)?.path === m.id)));
    root.querySelectorAll('.cm-file').forEach(el => el.classList.toggle('related', el.dataset.part === m?.id || el.dataset.part === p?.path));
    root.querySelectorAll('.cm-import-wires path').forEach(el => el.classList.toggle('related', [p?.path, m?.id].includes(el.dataset.fileFrom) || [p?.path, m?.id].includes(el.dataset.fileTo)));
    root.querySelectorAll('.cm-data-wires path').forEach(el => el.classList.toggle('related', [p?.id, op?.id].includes(el.dataset.from) || [p?.id, op?.id].includes(el.dataset.to)));
  }
  function lensMatch(part, lens) {
    if (!lens) return true;
    if (typeof lens === 'function') return !!lens(part);
    if (Array.isArray(lens)) return lens.some(item => lensMatch(part, item));
    const key = typeof lens === 'object' ? lens.id || lens.name || lens.lens : lens;
    return key === 'all' || key === 'structure' || (part.lenses || []).includes(String(key));
  }
  function applyLens() {
    if (!root) return;
    const active = !!state.lens && state.lens !== 'all' && state.lens !== 'structure'; root.classList.toggle('cm-lens-active', active);
    root.querySelectorAll('.cm-part').forEach(el => { const p=L.parts.get(el.dataset.part); el.classList.toggle('lens-match', !!p && lensMatch(p,state.lens)); });
    const name = typeof state.lens === 'string' ? state.lens : state.lens?.name || state.lens?.id || (state.lens ? 'CUSTOM' : 'ALL'); root.querySelector('.cm-lens-readout').textContent=`LENS / ${String(name).toUpperCase()}`;
  }
  function sourceButton(path, line, text = 'See this code') { return `<button data-source="${esc(path)}" data-line="${line}">${text} <span>L${line} ↗</span></button>`; }
  function select(id, move = false, automatic = false) {
    const op = L.operations.get(id), p = op ? L.parts.get(op.owner) : L.parts.get(id), m = L.moduleById.get(id); state.selected = id; state.userSelected=!!id && !automatic;
    inspector.hidden = !id && !docked; highlight(automatic ? null : id);
    if (!id) { inspector.innerHTML = `<div class="cm-dock-empty"><span class="cm-dock-kicker">SOURCE / INSPECTOR</span><div class="cm-dock-icon">&lt;/&gt;</div><h3>Follow the code.</h3><p>Select a part on the map to see its real source here. Choose an operation to understand what it does, then follow its connections.</p><div class="cm-empty-guide"><span>01</span> Select a part<br><span>02</span> Inspect its source<br><span>03</span> Follow a connection</div></div>`; root.querySelector('.cm-location').textContent = 'The whole factory'; return; }
    const title = op?.name || p?.name || m?.id, path = p?.path || m?.id, line = op?.line || p?.line || 1;
    root.querySelector('.cm-location').textContent = path;
    const heading = `<div class="cm-inspector-head"><span class="cm-dock-kicker">INSPECTOR / ${op ? label[op.kind] : p ? label[p.kind] : 'File'}</span><button data-cm="close" aria-label="Close explanation">×</button></div><h3>${esc(title)}</h3><small class="cm-source-path">${esc(path)} · L${line}</small>`;
    let body;
    if (op) body = `<h4>What happens here</h4><p>${esc(explainOperation(op))}</p><pre>${esc(op.expression)}</pre><h4>Where it leads</h4>${op.target ? `<button data-focus="${esc(op.target)}">Follow ${esc(L.parts.get(op.target)?.name)} →</button>` : `<p>${op.kind === 'call' ? 'The exact target was not resolved in the loaded code. It may be a library, a dynamic call, or a file that has not been read yet.' : 'This operation is detected from its name and source. Open the code to inspect the full arguments and behavior.'}</p>`}<button data-focus="${esc(p.id)}">← Back to ${esc(p.name)}</button>`;
    else if (p) {
      const calls = L.routes.filter(e => e.from === p.id), consumers = L.routes.filter(e => e.to === p.id), configuration = ['config','job','trigger','element','section','document','style','schema','query'].includes(p.kind);
      const metrics=p.metrics||{}, technical=`<div class="cm-technical-facts" aria-label="Engineering metrics"><span>CYC <b>${metrics.cyclomatic ?? 1}</b></span><span>FAN IN <b>${metrics.fanIn ?? 0}</b></span><span>FAN OUT <b>${metrics.fanOut ?? 0}</b></span><span>BLAST <b>${metrics.blastRadius ?? 0}</b></span><span>CHURN <b>${metrics.churn ?? 0}</b></span></div><p class="cm-lens-list">LENSES / ${esc((p.lenses||['structure']).join(' · ').toUpperCase())}</p>`;
      body = `<h4>What this part does</h4><p>${esc(p.summary)}</p>${technical}${p.doc ? `<h4>Notes in the source</h4><p class="cm-source-notes">${esc(p.doc)}</p>` : ""}<div class="cm-facts"><div><span>${configuration ? "Defined as" : "Receives"}</span><b>${configuration ? esc(label[p.kind] || p.kind) : p.parameters.length ? p.parameters.map(name => esc(name) + (inputHelp(name) ? ' — ' + esc(inputHelp(name)) : '')).join('<br>') : 'No named inputs detected'}</b></div><div><span>${configuration ? 'Contains' : 'Gives back'}</span><b>${configuration ? p.operations.length + ' entries / steps' : p.returns.length ? p.returns.slice(0, 3).map(r => esc(r.expression)).join('<br>') : ['class','type'].includes(p.kind) ? 'A reusable type contract' : 'No explicit return detected'}</b></div></div>${p.operations.length ? `<h4>Operations in source order <em>${p.operations.length}</em></h4><ol class="cm-operation-list">${p.operations.map(o => `<li><button data-focus="${esc(o.id)}"><i>${shape[o.kind]}</i><span><b>${esc(o.name)}</b><small>${esc(o.label)}</small></span><em>L${o.line}</em></button></li>`).join('')}</ol>` : ''}${calls.length ? `<h4>${p.kind === "job" || p.kind === "trigger" ? "Continues into" : "Connected parts"}</h4>${calls.map(e => `<button data-focus="${esc(e.to)}">${esc(L.parts.get(e.to).name)} <em>${esc(e.kind)} →</em></button>`).join('')}` : ''}${consumers.length ? `<h4>${p.kind === "job" ? "Runs after" : "Used by"}</h4>${consumers.map(e => `<button data-focus="${esc(e.from)}">${esc(L.parts.get(e.from).name)} ↗</button>`).join('')}` : ''}`;
    } else body = `<h4>What is inside this file</h4><p>${m.nodes.length} code parts and ${m.nodes.reduce((n, p) => n + p.operations.length, 0)} operations detected across ${m.file.lines} lines. Choose a part to see its role, inputs and connections.</p>${m.nodes.map(p => `<button data-focus="${esc(p.id)}"><span>${shape[p.kind]} ${esc(p.name)}</span><em>L${p.line} →</em></button>`).join('')}`;
    const source=currentModel.sources[path]||'', from=p?.line||1, to=p?.endLine||source.split('\n').length, window=sourceWindow(source,from,to,line);
    preview={path,source,from,to,line,window};
    inspector.innerHTML = heading + `<div class="cm-dock-tools">${sourceButton(path,line,'Open file')}<button data-cm="copy-code" aria-label="Copy displayed source">Copy code</button></div><section class="cm-source-preview" data-wrap="${state.wrap}" aria-label="Selected source preview"><div class="cm-source-bar"><span>ACTUAL SOURCE</span><button data-cm="wrap-code" aria-pressed="${state.wrap}">Wrap</button><span class="cm-source-range">L${window.start}—${window.end}</span></div><div class="cm-code-scroll" tabindex="0" aria-label="Source code. Select a line number to explain it.">${window.html}</div>${window.limited?`<div class="cm-source-paging"><span>Excerpt · ${to-from+1} lines in this part</span><button data-preview="previous" ${window.start<=from?'disabled':''}>←</button><button data-preview="next" ${window.end>=to?'disabled':''}>→</button></div>`:''}</section><div class="cm-line-reading" hidden></div><div class="cm-inspector-body">${body}<div class="cm-actions"><button data-context="${esc(path)}" data-context-unit="${esc(p?.id || '')}">Give this ${p ? 'part' : 'file'} to my AI ↗</button></div><p class="cm-evidence">Read from source. Wires are static matches. Operation order follows the source; branches can skip or repeat steps. Runtime behavior and test outcomes are not verified.</p></div>`;
    const codeScroll=inspector.querySelector('.cm-code-scroll'), row=inspector.querySelector('.cm-code-line.is-current'); if(row)codeScroll.scrollTop=Math.max(0,row.offsetTop-codeScroll.offsetTop-60);

    if (move && p) camera(p); else if (move && m) camera(m);
  }
  function fit() { highlight(null); root.querySelector('.cm-location').textContent='The whole factory'; state.moved = true; camera({ x: 0, y: 0, w: L.w, h: L.h }, true); }
  const signal = new AbortController();
  root.addEventListener('click', ev => {
    if (state.drag?.moved) return;
    const source = ev.target.closest('[data-source]'); if (source) return onSource(source.dataset.source, +source.dataset.line);
    const context = ev.target.closest('[data-context]'); if (context) { const focus = L.parts.get(context.dataset.contextUnit); return onContext(context.dataset.context, focus ? {name:focus.name,line:focus.line,endLine:focus.endLine} : null); }
    const codeLine=ev.target.closest('[data-code-line]'); if(codeLine && preview){const line=+codeLine.dataset.codeLine, parts=currentModel.byFile.get(preview.path)||[], file=currentModel.files.find(f=>f.path===preview.path), info=explainSourceLine(file,preview.source,line,parts); inspector.querySelectorAll('.cm-code-line').forEach(row=>row.classList.toggle('is-current',+row.dataset.codeRow===line));const reading=inspector.querySelector('.cm-line-reading');reading.hidden=false;reading.innerHTML=`<span>LINE ${line}</span>${info.explanations.map(text=>`<p>${esc(text)}</p>`).join('')}`;return;}
    const paging=ev.target.closest('[data-preview]');if(paging&&preview){const line=paging.dataset.preview==='next'?preview.window.end+21:Math.max(preview.from,preview.window.start-140);preview.window=sourceWindow(preview.source,preview.from,preview.to,line);const area=inspector.querySelector('.cm-code-scroll');area.innerHTML=preview.window.html;area.scrollTop=0;inspector.querySelector('.cm-source-bar span:last-child').textContent=`L${preview.window.start}—${preview.window.end}`;inspector.querySelector('[data-preview=previous]').disabled=preview.window.start<=preview.from;inspector.querySelector('[data-preview=next]').disabled=preview.window.end>=preview.to;return;}
    const focus = ev.target.closest('[data-focus]'); if (focus) return select(focus.dataset.focus, true);
    const mini = ev.target.closest('[data-mini]'); if (mini) { state.moved = true; return select(mini.dataset.mini,true); }
    const action = ev.target.closest('[data-cm]')?.dataset.cm;
    if (action === 'close') select(null);
    if(action==='wrap-code'){state.wrap=!state.wrap;inspector.querySelector('.cm-source-preview').dataset.wrap=state.wrap;inspector.querySelector('[data-cm=wrap-code]').setAttribute('aria-pressed',state.wrap);return;}
    if(action==='copy-code' && preview){navigator.clipboard.writeText(preview.window.source).then(()=>{const button=inspector.querySelector('[data-cm=copy-code]');if(button){button.textContent='Copied';setTimeout(()=>{if(button.isConnected)button.textContent='Copy code';},1800);}}).catch(()=>{const button=inspector.querySelector('[data-cm=copy-code]');if(button)button.textContent='Use Open file';});return;}
    if (action === 'fit') fit();
    if (action === 'in' || action === 'out') zoom(action === 'in' ? 1.3 : 1 / 1.3);
    if (action === 'wires') { state.connections = !state.connections; root.classList.toggle('cm-quiet-wires', !state.connections); ev.target.closest('button').setAttribute('aria-pressed', state.connections); }
    if (action === 'expand') { root.classList.toggle('cm-expanded'); state.moved = false; }
    const wire = ev.target.closest('[data-wire]'); if (wire) { const edge = L.routes.find(e => e.id === wire.dataset.wire); select(edge.kind === "needs" ? edge.to : edge.operation || edge.from); return; }
    const part = ev.target.closest('[data-part]'); if (part) { state.moved = true; select(part.dataset.part); }
  }, { signal: signal.signal });
  root.addEventListener('wheel', ev => { if (ev.target.closest('.cm-inspector')) return; ev.preventDefault(); const r = stage.getBoundingClientRect(); zoom(Math.exp(-ev.deltaY * .0015), ev.clientX - r.left, ev.clientY - r.top); }, { passive: false, signal: signal.signal });
  const pointers = new Map(); let pinch = null;
  root.addEventListener('pointerdown', ev => {
    if (ev.target.closest('.cm-inspector,button,.cm-minimap')) return; pointers.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
    state.drag = { x: ev.clientX, y: ev.clientY, tx: state.tx, ty: state.ty, moved: false };
  }, { signal: signal.signal });
  root.addEventListener('pointermove', ev => {
    if (!pointers.has(ev.pointerId) || !state.drag) return; pointers.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (pointers.size === 2) { const [a, b] = [...pointers.values()], distance = Math.hypot(a[0] - b[0], a[1] - b[1]), r = stage.getBoundingClientRect(); if (pinch) zoom(distance / pinch, (a[0] + b[0]) / 2 - r.left, (a[1] + b[1]) / 2 - r.top); pinch = distance; state.drag.moved = true; return; }
    const dx = ev.clientX - state.drag.x, dy = ev.clientY - state.drag.y; if (Math.abs(dx) + Math.abs(dy) < 4 && !state.drag.moved) return;
    if (!root.hasPointerCapture(ev.pointerId)) root.setPointerCapture(ev.pointerId); state.drag.moved = true; state.moved = true; state.tx = state.drag.tx + dx; state.ty = state.drag.ty + dy; apply();
  }, { signal: signal.signal });
  const up = ev => { pointers.delete(ev.pointerId); pinch = null; if (root.hasPointerCapture(ev.pointerId)) root.releasePointerCapture(ev.pointerId); setTimeout(() => { if (!pointers.size) state.drag = null; }, 0); };
  root.addEventListener('pointerup', up, { signal: signal.signal }); root.addEventListener('pointercancel', up, { signal: signal.signal });
  root.addEventListener('keydown', ev => {
    if (ev.target.closest('.cm-inspector')) return;
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest('[data-wire]')) { ev.preventDefault(); ev.target.closest('[data-wire]').dispatchEvent(new MouseEvent('click', { bubbles: true })); return; }
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest('[data-part]')) { ev.preventDefault(); select(ev.target.closest('[data-part]').dataset.part, true); return; }
    if (ev.key === 'Escape') { select(null); root.classList.remove('cm-expanded'); }
    if (ev.key === '+' || ev.key === '=') zoom(1.3); if (ev.key === '-') zoom(1 / 1.3); if (ev.key === '0') fit();
    if (ev.key.startsWith('Arrow')) { ev.preventDefault(); state.tx += ev.key === 'ArrowLeft' ? 60 : ev.key === 'ArrowRight' ? -60 : 0; state.ty += ev.key === 'ArrowUp' ? 60 : ev.key === 'ArrowDown' ? -60 : 0; state.moved = true; apply(); }
  }, { signal: signal.signal });
  const observer = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect; if (!width || !height) return; const dx = width - state.W, dy = height - state.H; state.W = width; state.H = height;
    if (!state.moved) {
      const start = L.moduleById.get(initialFile) || L.modules.filter(m => codeLanguages.test(m.file.language) && m.nodes.length >= 3 && m.nodes.length <= 25 && !/test|example/.test(m.id)).sort((a, b) => b.nodes.length - a.nodes.length)[0] || L.modules[0];
      if (start) { const first = L.parts.get((start.nodes.find(p => ['function','method','handler','job'].includes(p.kind) && p.operations.length) || start.nodes[0])?.id); if(docked && first && !state.selected)select(first.id,false,true); camera(state.W < 600 && first ? { ...first, h: Math.min(first.h, 400) } : { ...start, h: Math.min(start.h, 640) }); root.querySelector('.cm-location').textContent = start.id; }
      else camera({ x: 0, y: 0, w: L.w, h: L.h }, true);
    } else { state.tx += dx / 2; state.ty += dy / 2; apply(); }
  }); observer.observe(stage);
  if(docked)select(null);
  function setTasks(tasks) {
    state.tasks = tasks || [];
    let layer = world.querySelector('.cm-activity'); if (!layer) { layer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); layer.setAttribute('class', 'cm-activity'); world.append(layer); }
    const active = state.tasks.filter(t => ['running', 'queued', 'approval', 'gate'].includes(t.status)), perFile = new Map();
    for (const t of active) for (const path of t.scope) if (L.moduleById.has(path)) { if (!perFile.has(path)) perFile.set(path, []); perFile.get(path).push(t); }
    const systems = new Set([...perFile.keys()].map(path => L.moduleById.get(path).system));
    layer.innerHTML = [...systems].map(id => { const s = L.systems.find(s => s.id === id); return `<g><rect class="cm-mcp-port" x="${s.x + s.w - 135}" y="${s.y + 17}" width="105" height="25" rx="3"/><text x="${s.x + s.w - 123}" y="${s.y + 34}">MCP activity</text></g>`; }).join('') + [...perFile].map(([path, tasks]) => { const m = L.moduleById.get(path), s = L.systems.find(s => s.id === m.system), tag = tasks.map(t => `${t.agent} · ${t.status}`).join(' / '); return `<g><path class="cm-activity-beam" d="${poly([[s.x + s.w - 82, s.y + 42], [s.x + s.w - 82, s.y + 58], [m.x - 20, s.y + 58], [m.x - 20, m.y + 22], [m.x, m.y + 22]])}"/><rect class="cm-activity-frame" x="${m.x - 5}" y="${m.y - 5}" width="${m.w + 10}" height="${m.h + 10}" rx="9"/><text class="cm-activity-label" x="${m.x + 15}" y="${m.y - 14}">${esc(tag)}</text></g>`; }).join('');
  }
  function setLens(lens = null) { state.lens = lens; applyLens(); return [...L.parts.values()].filter(part => lensMatch(part,lens)).map(part => part.id); }
  function getView() { return { k:state.k, tx:state.tx, ty:state.ty, selected:state.selected, lens:state.lens, detail:root.dataset.detail }; }
  function refresh(nextModel, changedPaths = []) {
    if (!nextModel || state.dead) return false;
    const previous=L, selected=state.selected, oldPart=previous.parts.get(previous.operations.get(selected)?.owner || selected), oldOp=previous.operations.get(selected), view={k:state.k,tx:state.tx,ty:state.ty,moved:state.moved};
    currentModel=nextModel; L=anatomyLayout(currentModel, previous);
    const paths=(changedPaths || []).map(item => typeof item === 'string' ? item : item?.path).filter(Boolean); renderMap(paths);
    let nextSelection=selected;
    if (selected && !L.parts.has(selected) && !L.operations.has(selected) && !L.moduleById.has(selected)) {
      const replacement=oldPart && [...L.parts.values()].find(p=>p.path===oldPart.path && p.name===oldPart.name && p.kind===oldPart.kind);
      nextSelection=oldOp && replacement ? replacement.operations?.find(op=>op.name===oldOp.name && op.line===oldOp.line)?.id || replacement.id : replacement?.id || (L.moduleById.has(oldPart?.path)?oldPart.path:null);
    }
    state.k=view.k;state.tx=view.tx;state.ty=view.ty;state.moved=view.moved; state.selected=nextSelection;
    if(nextSelection)select(nextSelection,false,!state.userSelected);else { state.selected=null; highlight(null); if(docked)select(null); }
    if(state.tasks.length)setTasks(state.tasks); apply();
    clearTimeout(arrivalTimer); if(paths.length)arrivalTimer=setTimeout(()=>root.querySelectorAll('.arriving').forEach(el=>el.classList.remove('arriving')),1800);
    return true;
  }
  const api = { getSelection() { return state.userSelected ? state.selected : null; }, focus(id) { select(id, true); }, select, fit, setLens, getView, refresh, setTasks, destroy() { state.dead = true; clearTimeout(arrivalTimer); signal.abort(); observer.disconnect(); host.innerHTML = ''; } };
  Object.defineProperty(api,'layout',{enumerable:true,get(){return L;}}); return api;
}
