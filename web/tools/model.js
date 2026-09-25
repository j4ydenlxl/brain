// The model. Every number the page shows is derived here from data.js: health, rules,
// orthogonality, blast radius, test totals and context-packet sizes. Weights are named
// constants so the inspector can print the arithmetic next to the result.
(function () {
  const D = window.FACTORY_DATA;
  const byId = new Map(D.primitives.map(p => [p.id, p]));
  const stageIx = Object.fromEntries(D.stages.map((s, i) => [s.id, i]));
  const sysIx = Object.fromEntries(D.systems.map((s, i) => [s.id, i]));
  const agentById = new Map(D.agents.map(a => [a.id, a]));
  const stageName = id => D.stages[stageIx[id]].name;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const fmt = n => Number(n).toLocaleString('en-US');

  const edges = D.edges.map(([from, to, type, since], i) => ({ i, from, to, type, since: since || null, sev: null, tag: null }));
  const out = new Map(), inc = new Map();
  D.primitives.forEach(p => { out.set(p.id, []); inc.set(p.id, []); });
  edges.forEach(e => { out.get(e.from).push(e); inc.get(e.to).push(e); });

  // ── hermetic tests ──────────────────────────────────────────
  const CHANNELS = ['NET', 'FS', 'CLOCK', 'ENV', 'RAND'];
  D.primitives.forEach(p => {
    p.leaks = p.issues.filter(x => x[0] === 'leak');
    p.leakCount = p.leaks.length;
    p.flaky = p.issues.filter(x => x[0] === 'flaky').length;
    p.failing = p.issues.filter(x => x[0] === 'fail').length;
    p.clean = p.tests - p.issues.length;
    p.chan = Object.fromEntries(CHANNELS.map(c => [c, p.leaks.filter(x => x[2] === c).length]));
  });
  const sum = f => D.primitives.reduce((a, p) => a + f(p), 0);
  const tests = {
    total: sum(p => p.tests), clean: sum(p => p.clean), leaking: sum(p => p.leakCount),
    flaky: sum(p => p.flaky), failing: sum(p => p.failing),
    chan: Object.fromEntries(CHANNELS.map(c => [c, sum(p => p.chan[c])])),
  };

  // ── orthogonality rules ─────────────────────────────────────
  const V = [];
  // 1. single writer: a store accepts writes from exactly one primitive
  D.primitives.filter(p => p.kind === 'store').forEach(s => {
    const writers = inc.get(s.id).filter(e => e.type === 'writes');
    if (writers.length < 2) return;
    const extra = writers.filter(e => e.from !== s.writer);
    const by = extra.map(e => e.since).filter(Boolean);
    V.push({
      rule: 'Single writer', sev: 'crit', tag: '2nd writer',
      title: `${s.id} has ${writers.length} writers`,
      text: `Declared writer: ${s.writer}. Also writing: ${extra.map(e => e.from).join(', ')}${by.length ? `, added by ${by.join(', ')}` : ''}. Two writers means neither one's tests describe what is in the store.`,
      parties: [s.id, ...writers.map(e => e.from)], edges: extra.map(e => e.i),
      fix: `Route ${extra.map(e => e.from).join(', ')} through ${s.writer} and delete the direct write.`,
    });
  });
  // 2. layer skip: data leaving the store stage must pass through the retrieve stage
  const sI = stageIx[D.rules.storeStage], rI = stageIx[D.rules.retrieveStage];
  edges.forEach(e => {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (a.kind !== 'store' || stageIx[a.stage] !== sI || e.type === 'signal' || stageIx[b.stage] <= rI) return;
    const door = out.get(a.id).map(x => byId.get(x.to)).find(x => stageIx[x.stage] === rI);
    V.push({
      rule: 'Layer skip', sev: 'warn', tag: 'layer skip',
      title: `${b.id} reads ${a.id} directly`,
      text: `${stageName(a.stage)} data must pass through ${stageName(D.rules.retrieveStage)} first. This read jumps from stage ${a.stage} to stage ${b.stage}${e.since ? `, added by ${e.since}` : ''}.`,
      parties: [a.id, b.id], edges: [e.i],
      fix: door ? `Have ${b.id} ask ${door.id} instead of reading ${a.id}.` : `Remove the direct read.`,
    });
  });
  // 3. cycles: strongly connected components over data edges
  (function tarjan() {
    let n = 0; const stack = [], on = new Set(), idx = new Map(), low = new Map();
    const next = id => out.get(id).filter(e => e.type !== 'signal').map(e => e.to);
    const visit = v => {
      idx.set(v, n); low.set(v, n); n++; stack.push(v); on.add(v);
      for (const w of next(v)) {
        if (!idx.has(w)) { visit(w); low.set(v, Math.min(low.get(v), low.get(w))); }
        else if (on.has(w)) low.set(v, Math.min(low.get(v), idx.get(w)));
      }
      if (low.get(v) !== idx.get(v)) return;
      const comp = []; let w;
      do { w = stack.pop(); on.delete(w); comp.push(w); } while (w !== v);
      if (comp.length < 2) return;
      const set = new Set(comp);
      const inner = edges.filter(e => e.type !== 'signal' && set.has(e.from) && set.has(e.to));
      const span = e => stageIx[byId.get(e.from).stage] - stageIx[byId.get(e.to).stage];
      const back = inner.slice().sort((x, y) => span(y) - span(x))[0];
      // shortest path from the back edge's target round to its source, for the sentence
      const prev = new Map([[back.to, null]]); const q = [back.to];
      while (q.length) { const u = q.shift(); if (u === back.from) break;
        for (const e of inner) if (e.from === u && e !== back && !prev.has(e.to)) { prev.set(e.to, u); q.push(e.to); } }
      const path = []; for (let u = back.from; u; u = prev.get(u)) path.unshift(u);
      V.push({
        rule: 'Cycle', sev: 'warn', tag: 'cycle',
        title: `A loop through ${comp.length} primitives`,
        text: `${path.concat(back.to).join(' → ')}. A change to any of them can come back around and change itself${back.since ? `. Closed by ${back.since}` : ''}.`,
        parties: [back.from, back.to], members: comp, edges: [back.i],
        fix: `Have ${back.from} publish a result that ${back.to} reads on its next run, instead of feeding it directly.`,
      });
    };
    D.primitives.forEach(p => { if (!idx.has(p.id)) visit(p.id); });
  })();
  V.forEach((v, k) => {
    v.id = `R${k + 1}`;
    v.edges.forEach(i => { const e = edges[i]; if (e.sev !== 'crit') { e.sev = v.sev; e.tag = v.tag; } });
    v.scope = [...new Set(v.parties)];
  });

  // ── health: 100 minus named penalties. The plant runs at its weakest part. ──
  const W = { crit: 40, warn: 15, leak: 8, flaky: 4, fail: 12 };
  D.primitives.forEach(p => {
    const vs = V.filter(v => v.parties.includes(p.id));
    const crit = vs.filter(v => v.sev === 'crit').length, warn = vs.length - crit;
    const parts = [];
    if (crit) parts.push([`${plural(crit, 'critical rule')} broken × ${W.crit}`, -W.crit * crit]);
    if (warn) parts.push([`${plural(warn, 'warning rule')} × ${W.warn}`, -W.warn * warn]);
    if (p.leakCount) parts.push([`${plural(p.leakCount, 'leaking test')} × ${W.leak}`, -W.leak * p.leakCount]);
    if (p.flaky) parts.push([`${plural(p.flaky, 'flaky test')} × ${W.flaky}`, -W.flaky * p.flaky]);
    if (p.failing) parts.push([`${plural(p.failing, 'failing test')} × ${W.fail}`, -W.fail * p.failing]);
    p.violations = vs;
    p.healthParts = parts;
    p.health = Math.max(0, 100 + parts.reduce((a, x) => a + x[1], 0));
    p.status = crit || p.failing || p.health < 50 ? 'crit' : warn || p.leakCount || p.health < 80 ? 'warn' : 'ok';
  });
  const weakest = D.primitives.slice().sort((a, b) => a.health - b.health)[0];
  const plant = {
    health: weakest.health, weakest,
    mean: Math.round(sum(p => p.health) / D.primitives.length),
    crit: D.primitives.filter(p => p.status === 'crit').length,
    warn: D.primitives.filter(p => p.status === 'warn').length,
  };
  const worst = ps => ps.slice().sort((a, b) => a.health - b.health)[0];
  const systems = D.systems.map(s => {
    const ps = D.primitives.filter(p => p.sys === s.id), w = worst(ps);
    return { ...s, count: ps.length, health: w.health, status: w.status, weakest: w };
  });
  const dirty = new Set(V.flatMap(v => v.edges));
  const ortho = { total: edges.length, dirty: dirty.size, clean: edges.length - dirty.size,
    score: Math.round(100 * (edges.length - dirty.size) / edges.length) };

  // ── blast radius ────────────────────────────────────────────
  function closure(id, dir) {
    const seen = new Set(), q = [id];
    while (q.length) {
      const v = q.shift();
      for (const e of (dir === 'down' ? out : inc).get(v)) {
        const w = dir === 'down' ? e.to : e.from;
        if (w !== id && !seen.has(w)) { seen.add(w); q.push(w); }
      }
    }
    return seen;
  }
  const downstream = id => closure(id, 'down');
  const upstream = id => closure(id, 'up');
  const blastEdges = (id, set) => new Set(edges.filter(e => (e.from === id || set.has(e.from)) && set.has(e.to)).map(e => e.i));

  // ── lines ───────────────────────────────────────────────────
  const median = xs => { const s = xs.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  D.lines.forEach(l => {
    const runs = [...l.runs], passes = runs.filter(c => c === 'P').length;
    l.yield = Math.round(100 * passes / runs.length);
    l.p50 = median(l.secs.filter((_, i) => runs[i] === 'P'));
    l.blockers = l.stations.map(id => byId.get(id)).filter(p => p.status === 'crit');
  });
  const linesTouching = ids => D.lines.filter(l => l.stations.some(s => ids.has(s)));

  // ── context packets: what an AI reads instead of the repository ──
  const T = { header: 180, contract: 60, export: 40, failing: 220, neighbour: 24, perLine: 11 };
  function packet(scope) {
    const set = new Set(scope), nb = new Set();
    scope.forEach(id => {
      out.get(id).forEach(e => { if (!set.has(e.to)) nb.add(e.to); });
      inc.get(id).forEach(e => { if (!set.has(e.from)) nb.add(e.from); });
    });
    const ps = scope.map(id => byId.get(id));
    const ex = ps.reduce((a, p) => a + p.exports, 0), fl = ps.reduce((a, p) => a + p.failing, 0);
    const parts = [
      ['work order and house rules', T.header],
      [`${plural(ps.length, 'contract')} × ${T.contract}`, ps.length * T.contract],
      [`${plural(ex, 'export signature')} × ${T.export}`, ex * T.export],
    ];
    if (fl) parts.push([`${plural(fl, 'failing test output')} × ${T.failing}`, fl * T.failing]);
    parts.push([`${plural(nb.size, 'neighbour name')} × ${T.neighbour}`, nb.size * T.neighbour]);
    const tokens = parts.reduce((a, x) => a + x[1], 0);
    const repoLines = sum(p => p.lines), repo = repoLines * T.perLine;
    return { tokens, parts, neighbours: [...nb], repoLines, repo, ratio: repo / tokens };
  }

  window.FACTORY = {
    D, byId, stageIx, sysIx, stageName, agentById, edges, out, inc, CHANNELS, tests, V, W, T,
    plant, systems, ortho, downstream, upstream, blastEdges, linesTouching, packet, plural, fmt,
  };
})();
