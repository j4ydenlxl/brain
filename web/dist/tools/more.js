// Audit & Performance, and MCP: the two pages behind the sidebar's other links.
(function () {
  const F = window.FACTORY, D = F.D, W = window.WEB, esc = W.esc, icon = W.icon;
  const P = (window.PAGES = window.PAGES || {});
  const TASK = { approval: ['warn', 'Waiting on you'], running: ['acc', 'Working'], gate: ['vio', 'At the QC gate'], queued: ['idle', 'Queued'], done: ['', 'Done'] };
  const client = id => (F.agentById.get(id) || { name: id }).name;
  const kpis = list => `<div class="kpis">${list.map(([k, v, s, st]) => `<div class="kpi ${st || ''}"><span>${k}</span><b>${v}</b><small>${esc(s)}</small></div>`).join('')}</div>`;
  const wire = (main, ctx) => {
    const root = main.firstElementChild;
    root.addEventListener('click', ev => {
      const b = ev.target.closest('[data-focus],[data-line]'); if (!b) return;
      if (b.dataset.focus) ctx.go('overview', b.dataset.focus); else ctx.go('pipeline', b.dataset.line);
    });
    return () => {};
  };

  P.audit = function (main, ctx) {
    const T = F.tests, ps = D.primitives.slice().sort((a, b) => a.health - b.health || a.id.localeCompare(b.id));
    main.innerHTML = `<div class="pg">
      <div class="pg-head"><div class="title"><h1>Audit &amp; Performance</h1><p>Orthogonal primitives: one mismanaged part sets the health of the whole system.</p><p>Every number here is computed from the repo. Sample data.</p></div>
        ${kpis([['System Health', F.plant.health + '%', `the weakest part: ${F.plant.weakest.id}`, 'crit'], ['Orthogonality', F.ortho.score + '%', `${F.ortho.clean} of ${F.ortho.total} connections clean`],
          ['Rules broken', F.V.length, `${F.V.filter(v => v.sev === 'crit').length} critical · ${F.V.filter(v => v.sev === 'warn').length} warning`], ['Hermetic tests', `${T.clean}/${T.total}`, `${T.leaking} leaking · ${T.flaky} flaky · ${T.failing} failing`],
          ['Parts at risk', F.plant.crit + F.plant.warn, `${F.plant.crit} need a human · ${F.plant.warn} to watch`]])}</div>
      <div class="grid2">
        <section class="card"><div class="ch"><h3>Findings</h3><span class="sub">single writer · layers · cycles</span></div>
          ${F.V.map(v => { const pk = F.packet(v.scope); return `<div class="finding"><span class="sev ${v.sev}">${v.id}<small>${v.sev}</small></span><div><h4>${esc(v.title)}</h4><p>${esc(v.text)}</p>
            <span class="fix"><b>Fix:</b> ${esc(v.fix)}</span><span class="fix"><b>Context an AI needs:</b> ${F.fmt(pk.tokens)} tokens for ${v.scope.join(', ')}, instead of ${F.fmt(pk.repo)} for the repo</span>
            <button type="button" class="btn sm" data-focus="${v.scope[0]}">Show in the web</button></div></div>`; }).join('')}
        </section>
        <section class="card"><div class="ch"><h3>Health</h3><span class="sub">100 minus named penalties, lowest first</span></div>
          <div class="weights">${Object.entries(F.W).map(([k, v]) => `<span>${k} −${v}</span>`).join('')}<span>system = its weakest part</span></div>
          <div class="tscroll"><table class="t"><thead><tr><th>Primitive</th><th>Health</th><th>Deductions</th></tr></thead><tbody>${ps.map(p => `<tr><td class="mono"><button type="button" data-focus="${p.id}">${p.id}</button></td><td><span class="hb ${p.status === 'ok' ? '' : p.status}"><span>${p.health}</span><i><b style="width:${p.health}%"></b></i></span></td><td class="muted" style="white-space:normal;font-size:11.5px">${p.healthParts.map(([t, v]) => `${v} ${esc(t)}`).join(' · ') || 'none'}</td></tr>`).join('')}</tbody></table></div>
        </section>
      </div>
      <section class="card"><div class="ch"><h3>Hermetic tests</h3><span class="sub">a hermetic test touches no network, disk, clock, environment or randomness</span></div>
        <div class="tscroll"><table class="t"><thead><tr><th>Primitive</th><th class="c">Tests</th><th class="c">Clean</th>${F.CHANNELS.map(c => `<th class="c">${c}</th>`).join('')}<th class="c">Flaky</th><th class="c">Failing</th></tr></thead><tbody>
          ${D.primitives.map(p => `<tr><td class="mono">${p.id}</td><td class="c">${p.tests}</td><td class="c">${p.clean}</td>${F.CHANNELS.map(c => `<td class="c"><span class="cell ${p.chan[c] ? 'on' : ''}" title="${p.chan[c]} leaking through ${c}"></span>${p.chan[c] ? ' ' + p.chan[c] : ''}</td>`).join('')}<td class="c"><span class="cell ${p.flaky ? 'fl' : ''}"></span>${p.flaky ? ' ' + p.flaky : ''}</td><td class="c"><span class="cell ${p.failing ? 'fa' : ''}"></span>${p.failing ? ' ' + p.failing : ''}</td></tr>`).join('')}
          <tr><td><b>All ${D.primitives.length}</b></td><td class="c"><b>${T.total}</b></td><td class="c"><b>${T.clean}</b></td>${F.CHANNELS.map(c => `<td class="c"><b>${T.chan[c]}</b></td>`).join('')}<td class="c"><b>${T.flaky}</b></td><td class="c"><b>${T.failing}</b></td></tr>
        </tbody></table></div></section>
    </div>`;
    return wire(main, ctx);
  };

  P.mcp = function (main, ctx) {
    const live = D.tools.filter(t => t.today).length, on = D.agents.filter(a => a.state !== 'offline'), off = D.agents.filter(a => a.state === 'offline');
    const WHO = { audit: 'Audit', 'qc gate': 'QC gate', github: 'GitHub sync' };
    main.innerHTML = `<div class="pg">
      <div class="pg-head"><div class="title"><h1>MCP Servers</h1><p>Code Universe connects over MCP to the AI you already use and draws what it is doing.</p><p>There is no AI on our side. Tokens spent here: 0.</p></div>
        ${kpis([['MCP Servers', D.connectors.length, 'all connected'], ['Tools', D.tools.length, `${live} live today · ${D.tools.length - live} planned`], ['AI apps connected', on.length, `${off.length} offline`], ['Open tasks', ctx.tasks.filter(t => t.status !== 'done').length, 'handed to your AI over MCP'], ['Tokens on our side', 0, 'no model calls, no API']])}</div>
      <div class="grid3">
        <section class="card"><div class="ch"><h3>Servers</h3><span class="sub">${D.connectors.length} connected</span></div>${D.connectors.map(c => `<div class="srv"><div class="row"><span class="mc-ic" style="--c:#52D6A0;width:26px;height:26px">${icon('mcp')}</span><b>${esc(c.name)}</b><span class="pill">Connected</span></div><p>${esc(c.role)} · ${esc(c.where)}</p></div>`).join('')}</section>
        <section class="card"><div class="ch"><h3>What your AI is doing</h3><span class="sub">tasks arriving over MCP</span></div>${ctx.tasks.map(t => `<div class="client"><span class="mc-ic" style="--c:${t.status === 'approval' ? '#F2B64C' : '#6C9BFF'}">${icon('send')}</span><div><b>${esc(t.title)}</b><small>${t.id} · ${esc(client(t.agent))} · ${F.fmt(F.packet(t.scope).tokens)} tokens</small></div><div class="acts"><span class="pill ${TASK[t.status][0]}">${TASK[t.status][1]}</span></div></div>`).join('')}
          <div class="srv"><p>Connected: ${on.map(a => esc(a.name)).join(', ')}${off.length ? ` · offline: ${off.map(a => esc(a.name)).join(', ')}` : ''}</p></div></section>
        <section class="card"><div class="ch"><h3>Repositories</h3><span class="sub">through the GitHub connector</span></div>${D.repos.map(r => `<div class="srv"><div class="row"><span class="mc-ic" style="--c:#C9D3E6;width:26px;height:26px">${icon('repo')}</span><b class="mono">${esc(r.name)}</b><span class="pill ${r.private ? 'vio' : 'acc'}">${r.private ? 'Private' : 'Public'}</span></div><p>${r.branch} @ ${r.commit} · ${r.files} files · synced ${r.synced}</p></div>`).join('')}
          ${D.lines.map(l => `<div class="srv"><div class="row"><span class="mc-ic" style="--c:#9B7BFF;width:26px;height:26px">${icon('flow')}</span><button type="button" class="mono" data-line="${l.id}">${l.id}</button><span class="pill ${l.state === 'stopped' ? 'crit' : l.state === 'idle' ? 'idle' : ''}">${l.state}</span></div></div>`).join('')}</section>
      </div>
      <section class="card"><div class="ch"><h3>Tools</h3><span class="sub">the MCP surface your AI calls</span></div><div class="tscroll"><table class="t"><thead><tr><th>Tool</th><th>What it does</th><th>Status</th></tr></thead><tbody>${D.tools.map(t => `<tr><td class="mono">${t.name}</td><td>${esc(t.does)}</td><td>${t.today ? `<span class="pill">Live · ${t.today}</span>` : '<span class="pill idle">Planned</span>'}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card"><div class="ch"><h3>Activity</h3><span class="sub">everything that reached the factory today</span></div><ul class="act">${D.activity.map(a => `<li><span class="dot ${a.kind === 'crit' || a.kind === 'stop' ? 'crit' : a.kind === 'sync' ? 'idle' : a.kind === 'human' ? 'acc' : ''}"></span><div><b>${esc(WHO[a.who] || client(a.who))}</b><p>${esc(a.claim ? `Claimed ${a.claim} over MCP` : a.text)}</p></div><em>${a.t}</em></li>`).join('')}</ul></section>
    </div>`;
    return wire(main, ctx);
  };
})();
