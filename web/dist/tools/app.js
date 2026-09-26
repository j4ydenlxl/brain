// The shell: top bar, sidebar, routing, search, toasts and the hand-off to your own AI over MCP.
(function () {
  const events = new AbortController();
  const listen = (target, name, fn) => target.addEventListener(name, fn, { signal: events.signal });
  const F = window.FACTORY, D = F.D, W = window.WEB, P = window.PAGES, esc = W.esc, icon = W.icon;
  const top = document.getElementById('top'), side = document.getElementById('side'), main = document.getElementById('main'), toastEl = document.getElementById('toast');
  const TABS = [['overview', 'Overview'], ['systems', 'Systems'], ['mcps', 'MCPs'], ['workflows', 'Workflows'], ['repositories', 'Repositories'], ['audit', 'Audit'], ['analytics', 'Analytics']];
  const NAV = [['Infrastructure'],
    ['overview', 'Overview', 'grid'], ['systems', 'Systems', 'layers'], ['mcps', 'MCP Servers', 'mcp'], ['webs', 'Webs', 'web'],
    ['pipelines', 'Pipelines', 'flow'], ['sources', 'Data Sources', 'store'], ['workflows', 'Workflows', 'branch'], ['audit', 'Audit & Performance', 'gauge'],
    ['Repos'],
    ['repositories', 'GitHub', 'repo', D.repos.length], ['private', 'Private Repos', 'lock', D.repos.filter(r => r.private).length],
    ['orgs', 'Organizations', 'org', new Set(D.repos.map(r => r.name.split('/')[0])).size]];
  const ROUTE = { overview: 'overview', systems: 'overview', webs: 'overview', mcps: 'mcp', sources: 'mcp', repositories: 'mcp', private: 'mcp', orgs: 'mcp',
    pipelines: 'pipeline', workflows: 'pipeline', audit: 'audit', analytics: 'audit' };
  const TAB_FOR = { webs: 'overview', pipelines: 'workflows', sources: 'repositories', private: 'repositories', orgs: 'repositories' };
  const HOME = { overview: 'overview', pipeline: 'workflows', mcp: 'mcps', audit: 'audit' };
  const firstLine = (D.lines.find(l => l.stopAt && F.byId.get(l.stopAt).failing) || D.lines[0]).id;
  const state = { route: 'overview', arg: null, nav: 'overview' };
  const line = () => D.lines.find(l => l.id === state.arg) || D.lines[0];

  let tt = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.hidden = false; clearTimeout(tt); tt = setTimeout(() => { toastEl.hidden = true; }, 5200); }

  const ctx = {
    tasks: D.workOrders.map(t => ({ ...t })), web: null, go, toast,
    setWeb(w) { ctx.web = w; },
    handoff(id, who) {
      const name = (F.agentById.get(who) || { name: who }).name, pk = F.packet([id]);
      const t = { id: `WO-0${422 + ctx.tasks.filter(x => x.opened === 'now').length}`, title: `Work on ${id}`, status: 'queued', agent: who, opened: 'now', scope: [id] };
      ctx.tasks.unshift(t);
      if (ctx.web) ctx.web.setTasks(ctx.tasks);
      toast(`${t.id} was added to the sample queue for ${name}. Context estimate: ${F.fmt(pk.tokens)} tokens. No MCP message was sent.`);
    },
  };

  function renderTop() {
    const brand = `<div class="brand">${icon('star')}Code Universe</div>`;
    if (state.route === 'pipeline') {
      const l = line(), count = {};
      l.stations.forEach(id => { const s = F.byId.get(id).sys; count[s] = (count[s] || 0) + 1; });
      const sys = F.systems.find(s => s.id === Object.keys(count).sort((a, b) => count[b] - count[a])[0]);
      const pill = { stopped: ['crit', 'Line stopped'], running: ['live', 'System Online'], idle: ['idle', 'Idle'] }[l.state];
      top.innerHTML = `${brand}<nav class="crumbs" aria-label="Breadcrumb"><button type="button" data-nav="workflows">Workflows</button><span>›</span><button type="button" data-crumb="${sys.weakest.id}">${esc(sys.name)}</button><span>›</span><b class="mono">${l.id}</b></nav>
        <div class="top-r"><span class="pill ${pill[0]}">${pill[1]}</span><button type="button" class="btn sm primary" data-top="release">${icon('play')}${l.state === 'stopped' ? 'Release line' : 'Run now'}</button><button type="button" class="btn sm" data-top="pause">${icon('pause')}Pause</button><button type="button" class="btn sm" data-top="settings">${icon('gear')}Settings</button><div class="avatar" title="Signed in">JL</div></div>`;
      return;
    }
    const cur = TAB_FOR[state.nav] || state.nav, names = [...D.primitives.map(p => p.id), ...D.lines.map(l => l.id), ...D.systems.map(s => s.name), ...D.repos.map(r => r.name), ...D.connectors.map(c => c.name)];
    top.innerHTML = `${brand}<nav class="tabs" aria-label="Sections">${TABS.map(([id, label]) => `<button type="button" class="tab" data-nav="${id}" ${id === cur ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>
      <div class="top-r"><label class="search">${icon('search')}<input id="q" type="search" list="q-list" autocomplete="off" placeholder="Search systems, repos, MCPs, or nodes..." aria-label="Search"><kbd>⌘K</kbd></label>
      <datalist id="q-list">${names.map(x => `<option value="${esc(x)}"></option>`).join('')}</datalist>
      <div class="gh">${icon('branch')}<span>GitHub<small>Connected</small></span></div><div class="avatar" title="Signed in">JL</div></div>`;
  }
  function renderSide() {
    side.innerHTML = NAV.map(n => n.length === 1 ? `<h6>${n[0]}</h6>`
      : `<button type="button" class="nav" data-nav="${n[0]}" ${state.nav === n[0] ? 'aria-current="page"' : ''}>${icon(n[2])}${esc(n[1])}${n[3] != null ? `<span class="count">${n[3]}</span>` : ''}</button>`).join('')
      + `<div class="side-card">${icon('star')}<div><b>Code Universe</b><span>Repository workbench</span><span>v0.1.0 · sample data</span></div></div>`;
  }

  let cleanup = null;
  function go(route, arg, nav) {
    if (cleanup) { cleanup(); cleanup = null; }
    if (route === 'pipeline' && !D.lines.some(l => l.id === arg)) arg = firstLine;
    state.route = route; state.arg = arg || null; state.nav = nav || HOME[route];
    renderTop(); renderSide();
    main.scrollTop = 0;
    cleanup = P[route](main, ctx, route === 'pipeline' ? state.arg : undefined) || null;
    if (route === 'overview' && state.arg) setTimeout(() => { if (ctx.web) ctx.web.focus(state.arg); }, 90);
    try { history.replaceState(null, '', `#${route}${state.arg ? '/' + encodeURIComponent(state.arg) : ''}`); } catch (_) { /* sandboxed */ }
  }

  function find(q) {
    const s = q.trim().toLowerCase(); if (!s) return;
    const lists = [[D.primitives, p => p.id, p => go('overview', p.id)], [D.lines, l => l.id, l => go('pipeline', l.id)],
      [F.systems, x => x.name, x => go('overview', x.weakest.id, 'systems')], [D.repos, r => r.name, r => go('overview', 'repo:' + r.name, 'repositories')],
      [D.connectors, c => c.name, c => go('overview', c.name === 'code-universe' ? 'hub' : 'mcp:' + c.name, 'mcps')], [D.tools, t => t.name, () => go('mcp')]];
    for (const test of [v => v === s, v => v.includes(s)]) for (const [list, key, open] of lists) {
      const hit = list.find(x => test(key(x).toLowerCase()));
      if (hit) return open(hit);
    }
    toast(`Nothing is named "${q}". Try chunk.split, docs-upload or sample/eval-harness.`);
  }

  listen(document, 'click', ev => {
    const n = ev.target.closest('[data-nav]');
    if (n && (top.contains(n) || side.contains(n))) return go(ROUTE[n.dataset.nav], null, n.dataset.nav);
    const c = ev.target.closest('[data-crumb]');
    if (c) return go('overview', c.dataset.crumb, 'systems');
    const t = ev.target.closest('[data-top]'); if (!t) return;
    const l = line();
    if (t.dataset.top === 'release') toast(l.state === 'stopped' ? `Release stays locked until ${l.stopAt} passes. ${l.reason}.` : `${l.id} runs ${l.trigger}. The next run starts on that trigger.`);
    else if (t.dataset.top === 'pause') toast('Pausing goes through the factory_line MCP tool, which is still planned. Nothing was paused.');
    else toast(`${l.id} is defined in the repo. Change it in code and this page redraws after the next sync.`);
  });
  listen(top, 'keydown', ev => { if (ev.target.id === 'q' && ev.key === 'Enter') { ev.preventDefault(); find(ev.target.value); } });
  listen(top, 'input', ev => { if (ev.target.id === 'q' && (!ev.inputType || ev.inputType === 'insertReplacementText')) find(ev.target.value); });
  listen(document, 'keydown', ev => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === 'k') { const q = document.getElementById('q'); if (q) { ev.preventDefault(); q.focus(); q.select(); } }
  });

  window.FACTORY_APP = { destroy() { if (cleanup) cleanup(); cleanup = null; events.abort(); clearTimeout(tt); } };
  const [r, a] = location.hash.slice(1).split('/');
  go(P[r] ? r : 'overview', a ? decodeURIComponent(a) : null);
})();
