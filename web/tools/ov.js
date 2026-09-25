// Overview: the reference dashboard's first screen. The architecture card holds the factory web.
(function () {
  const F = window.FACTORY, D = F.D, W = window.WEB, esc = W.esc, icon = W.icon;
  const P = (window.PAGES = window.PAGES || {});
  const OPEN = ['approval', 'running', 'gate', 'queued'];
  const WHO = { audit: 'Audit', 'qc gate': 'QC gate', github: 'GitHub sync' };
  const KIND = { human: ['acc', 'Audit'], agent: ['', 'AI via MCP'], stop: ['crit', 'Pipeline'], crit: ['crit', 'Rule broken'], sync: ['idle', 'Repository'] };
  const total = xs => xs.reduce((a, x) => a + x, 0);
  const week = s => { const a = total(s.slice(-7)), b = total(s.slice(-14, -7)); return Math.round(100 * (a - b) / b); };
  const signed = n => `${n >= 0 ? '+' : ''}${n}%`;
  const f1 = n => n.toFixed(1);

  function axes(max, step, x0, x1, Y) {
    let g = '';
    for (let v = 0; v <= max; v += step) g += `<line class="gridl" x1="${x0}" x2="${x1}" y1="${f1(Y(v))}" y2="${f1(Y(v))}"/><text class="axis" x="${x0 - 6}" y="${f1(Y(v) + 3)}" text-anchor="end">${v}</text>`;
    return g;
  }
  function lineChart(vals, prev, labels, max, step) {
    const x0 = 30, x1 = 300, y0 = 8, y1 = 102, X = i => x0 + (x1 - x0) * i / (vals.length - 1), Y = v => y1 - (y1 - y0) * v / max;
    const pts = vals.map((v, i) => `${f1(X(i))},${f1(Y(v))}`), n = vals.length - 1;
    return `<svg viewBox="0 0 320 120" role="img" aria-label="Commits per day, this week against last week">
      <defs><linearGradient id="ov-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6C9BFF" stop-opacity=".3"/><stop offset="1" stop-color="#6C9BFF" stop-opacity="0"/></linearGradient></defs>
      ${axes(max, step, x0, x1, Y)}
      <polyline points="${prev.map((v, i) => `${f1(X(i))},${f1(Y(v))}`).join(' ')}" fill="none" stroke="#34466C" stroke-width="1.2" stroke-dasharray="3 3"/>
      <path d="M${pts.join('L')}L${x1},${y1}L${x0},${y1}Z" fill="url(#ov-area)"/>
      <polyline points="${pts.join(' ')}" fill="none" stroke="#6C9BFF" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="${f1(X(n))}" cy="${f1(Y(vals[n]))}" r="3.2" fill="#8FB0FF" stroke="#0B1220" stroke-width="1.5"/>
      ${labels.map((l, i) => `<text class="axis" x="${f1(X(i))}" y="116" text-anchor="middle">${l}</text>`).join('')}
    </svg>`;
  }
  function barChart(vals, labels, max, step) {
    const x0 = 34, x1 = 312, y0 = 8, y1 = 102, bw = (x1 - x0) / vals.length, Y = v => y1 - (y1 - y0) * v / max;
    return `<svg viewBox="0 0 320 120" role="img" aria-label="MCP tool calls per day this week">
      ${axes(max, step, x0, x1, Y)}
      ${vals.map((v, i) => `<rect x="${f1(x0 + i * bw + bw * 0.24)}" y="${f1(Y(v))}" width="${f1(bw * 0.52)}" height="${f1(y1 - Y(v))}" rx="2" fill="${i === vals.length - 1 ? '#8FB0FF' : '#3D63C9'}"><title>${labels[i]}: ${v} calls</title></rect>`).join('')}
      ${labels.map((l, i) => `<text class="axis" x="${f1(x0 + i * bw + bw / 2)}" y="116" text-anchor="middle">${l}</text>`).join('')}
    </svg>`;
  }

  P.overview = function (main, ctx) {
    const open = ctx.tasks.filter(t => OPEN.includes(t.status));
    const count = (xs, k, v) => xs.filter(x => x[k] === v).length;
    const kpis = [
      ['Total Systems', D.systems.length, `${D.primitives.length} primitives · ${D.repos.length} repos`],
      ['MCP Servers', D.connectors.length, `${D.tools.length} tools · ${D.tools.filter(t => t.today).length} live today`],
      ['Active Workflows', open.length, `${count(open, 'status', 'running')} running · ${count(open, 'status', 'approval')} needs you`],
      ['Data Pipelines', D.lines.length, `${count(D.lines, 'state', 'running')} running · ${count(D.lines, 'state', 'stopped')} stopped`],
      ['System Health', F.plant.health + '%', `weakest: ${F.plant.weakest.id}`, F.plant.weakest.status],
    ];
    const acts = D.activity.slice(0, 5).map(a => {
      const [cls, type] = KIND[a.kind], wo = a.claim && ctx.tasks.find(t => t.id === a.claim);
      const who = WHO[a.who] || (F.agentById.get(a.who) || { name: a.who }).name;
      const text = a.claim ? `Claimed ${a.claim} over MCP: ${wo ? wo.title : ''}` : a.text;
      return `<li><span class="dot ${cls}"></span><div><b>${esc(who)}</b><p title="${esc(text)}">${esc(text)}</p></div><em>${type}<br>${a.t.slice(0, 5)}</em></li>`;
    }).join('');
    const health = F.systems.map((s, i) => `<li tabindex="0" data-focus="${s.weakest.id}" title="Show the weakest part, ${s.weakest.id}"><i class="sw" style="--c:${'#a0a0a0'}"></i><span>${esc(s.name)}</span><span class="pill ${s.status === 'ok' ? '' : s.status}">${s.status === 'crit' ? 'Needs a human' : s.status === 'warn' ? 'Watch' : 'Online'}</span><span class="pc">${s.health}%</span></li>`).join('');
    const pk = open.map(t => ({ t, n: F.packet(t.scope).tokens })), big = Math.max(...pk.map(x => x.n));
    const days = D.days.slice(-7);

    main.innerHTML = `<div class="ov">
      <div class="ov-head">
        <div class="title"><h1>Code Universe</h1><p>MCP Sandbox · Data Infrastructure · System Visualizer</p><p>Your AI infrastructure, visualized. Connect. Monitor. Orchestrate.</p></div>
        <div class="kpis">${kpis.map(([k, v, s, st]) => `<div class="kpi ${st === 'crit' ? 'crit' : ''}"><span>${k}</span><b>${v}</b><small title="${esc(s)}">${esc(s)}</small></div>`).join('')}</div>
      </div>
      <section class="card arch">
        <div class="ch"><h3>System Architecture</h3><span class="pill live">LIVE</span><span class="sub">${esc(D.project.repo)} · orthogonality ${F.ortho.score}% · ${F.ortho.clean} of ${F.ortho.total} connections clean · sample data</span>
          <div class="lens" role="group" aria-label="Group by"><span>Group by</span>${[['system', 'System'], ['stage', 'Stage'], ['health', 'Health'], ['repo', 'Repo']].map(([k, n]) => `<button type="button" data-lens="${k}" aria-pressed="${k === 'system'}">${n}</button>`).join('')}</div>
        </div>
        <div class="web-host"></div>
      </section>
      <aside class="rail">
        <section class="card"><div class="ch"><h3>Recent Activity</h3><button type="button" class="more" data-go="mcp">View all →</button></div><ul class="act">${acts}</ul></section>
        <section class="card"><div class="ch"><h3>System Health</h3><button type="button" class="more" data-go="audit">View all →</button></div><ul class="health">${health}</ul></section>
        <section class="card sync">${icon('branch')}<div><b>GitHub Sync</b><small>Last synced ${esc(D.project.synced)}</small><small class="mono">${esc(D.project.repo)} @ ${esc(D.project.commit)}</small></div><button type="button" class="btn sm" data-act="sync">Sync now</button></section>
      </aside>
      <div class="charts">
        <section class="card chart"><div class="ch"><h3>Code Activity</h3><span class="sub">commits merged</span><div class="delta">${signed(week(D.series.commits))}<small>vs previous 7 days</small></div></div>${lineChart(D.series.commits.slice(-7), D.series.commits.slice(-14, -7), days, 40, 10)}</section>
        <section class="card chart"><div class="ch"><h3>MCP Invocations</h3><span class="sub">tool calls</span><div class="delta">${signed(week(D.series.calls))}<small>vs previous 7 days</small></div></div>${barChart(D.series.calls.slice(-7), days.map(d => d.replace('Sep ', '')), 400, 100)}</section>
        <section class="card chart"><div class="ch"><h3>Resource Usage</h3><span class="sub">tokens per task</span><div class="delta">0 tokens<small>spent on our side</small></div></div>
          <ul class="usage">${pk.map(({ t, n }) => `<li title="${esc(t.title)} · the whole repo is ${F.fmt(F.packet(t.scope).repo)} tokens"><span class="mono">${t.id}</span><span class="bar"><i style="width:${f1(100 * n / big)}%"></i></span><span class="t">${F.fmt(n)}</span></li>`).join('')}
          <li class="zero"><span>Code Universe</span><span class="bar"></span><span class="t">0</span></li></ul></section>
      </div>
    </div>`;

    const root = main.firstElementChild;
    const web = W.mount(root.querySelector('.web-host'), { tasks: ctx.tasks, onLine: id => ctx.go('pipeline', id), onSend: (id, client) => ctx.handoff(id, client) });
    ctx.setWeb(web);
    root.addEventListener('click', ev => {
      const b = ev.target.closest('[data-lens],[data-go],[data-act],[data-focus]'); if (!b) return;
      if (b.dataset.lens) { web.setLens(b.dataset.lens); root.querySelectorAll('[data-lens]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }
      else if (b.dataset.go) ctx.go(b.dataset.go);
      else if (b.dataset.act === 'sync') ctx.toast(`Sample data: ${D.project.repo} is a fixture at ${D.project.commit}. No GitHub sync was requested.`);
      else if (b.dataset.focus) web.focus(b.dataset.focus);
    });
    root.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.focus) web.focus(ev.target.dataset.focus); });
    return () => { web.destroy(); ctx.setWeb(null); };
  };
})();
