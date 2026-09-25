// Pipeline detail: the reference dashboard's second screen, for one automation line in the repo.
(function () {
  const F = window.FACTORY, D = F.D, W = window.WEB, esc = W.esc, icon = W.icon;
  const P = (window.PAGES = window.PAGES || {});
  const OPEN = { approval: 'waiting on you', running: 'working', gate: 'at the QC gate', queued: 'queued', done: 'done' };
  const PILL = { ok: ['', 'Online'], warn: ['warn', 'Watch'], crit: ['crit', 'Needs a human'] };
  const k = x => `<span class="tk-k">${x}</span>`, s = x => `<span class="tk-s">${esc(x)}</span>`;
  const c = x => `<span class="tk-c">${esc(x)}</span>`, n = x => `<span class="tk-n">${x}</span>`;
  const code = (file, note, lines) => `<div class="code"><div class="code-h"><span class="mono">${file}</span><span>${note}</span></div><ol>${lines.map(l => `<li>${l}</li>`).join('')}</ol></div>`;
  const tabs = (attr, list, on) => `<div class="itabs" role="tablist">${list.map(([id, label]) => `<button type="button" role="tab" ${attr}="${id}" aria-selected="${id === on}">${label}</button>`).join('')}</div>`;

  P.pipeline = function (main, ctx, lineId) {
    const l = D.lines.find(x => x.id === lineId) || D.lines[0], set = new Set(l.stations);
    const ps = l.stations.map(id => F.byId.get(id)), stop = l.state === 'stopped' ? l.stations.indexOf(l.stopAt) : -1;
    const after = i => stop >= 0 && i > stop;
    const scope = l.blockers.length ? l.blockers.map(p => p.id) : l.stations, pk = F.packet(scope);
    const sysNames = [...new Set(ps.map(p => D.systems.find(x => x.id === p.sys).name))];
    const last = l.runs.length - 1, lastPass = l.runs[last] === 'P';
    const state = { running: ['', 'Running'], stopped: ['crit', 'Stopped'], idle: ['idle', 'Idle'] }[l.state];
    const tasks = ctx.tasks.filter(t => t.scope.some(id => set.has(id)));
    const linked = D.lines.filter(x => x !== l && x.stations.some(id => set.has(id) || F.out.get(id).some(e => set.has(e.to)) || F.inc.get(id).some(e => set.has(e.from))));
    const issues = [...F.V.filter(v => v.parties.some(id => set.has(id))).map(v => ({ sev: v.sev, title: `${v.id} · ${v.title}`, sub: v.fix })),
      ...ps.filter(p => p.failing).map(p => ({ sev: 'crit', title: `${p.id}: ${F.plural(p.failing, 'failing test')}`, sub: p.issues.filter(x => x[0] === 'fail').map(x => x[1]).join(', ') }))];
    const repos = D.repos.filter(r => ps.some(p => D.systems.find(x => x.id === p.sys).repo === r.name));
    const maxSecs = Math.max(...l.secs);

    const panels = {
      stages: () => `<div class="tscroll"><table class="t"><thead><tr><th>Station</th><th>Stage</th><th>Kind</th><th>Tests clean</th><th>Health</th><th>Blast radius</th><th>Status</th></tr></thead><tbody>${ps.map((p, i) => {
        const [cls, label] = i === stop ? ['crit', 'Stopped here'] : after(i) ? ['idle', 'Waiting'] : PILL[p.status];
        return `<tr><td class="mono"><span class="ic" style="--c:${W.HUE[F.sysIx[p.sys]]}">${icon(p.kind)}</span>${p.id}</td><td>${p.stage} · ${F.stageName(p.stage)}</td><td>${p.kind}</td><td>${p.clean} / ${p.tests}</td><td class="${p.status}-t">${p.health}</td><td>${F.plural(F.downstream(p.id).size, 'part')}</td><td><span class="pill ${cls}">${label}</span></td></tr>`;
      }).join('')}</tbody></table></div>`,
      logs: () => `<ul class="logs">${[...l.runs].map((r, i) => ({ r, i })).reverse().slice(0, 8).map(({ r, i }) => `<li><span>run ${i + 1}</span>${r === 'P' ? `<b class="ok-t">PASS</b> all ${ps.length} stations · ${l.secs[i]} s` : `<b class="crit-t">FAIL</b> ${esc(l.reason || 'a station failed')} · ${l.secs[i]} s`}</li>`).join('')}</ul>`,
      metrics: () => `<div class="tscroll"><table class="t"><tbody>${[['Yield', `${l.yield}% of ${l.runs.length} runs passed`], ['Median passing run', `${l.p50} s`], ['Hermetic tests', `${ps.reduce((a, p) => a + p.clean, 0)} of ${ps.reduce((a, p) => a + p.tests, 0)} clean`], ['Weakest station', `${ps.slice().sort((a, b) => a.health - b.health)[0].id} · health ${Math.min(...ps.map(p => p.health))}`], ['Context packet', `${F.fmt(pk.tokens)} tokens · the repo is ${F.fmt(pk.repo)}`]].map(([a, b]) => `<tr><td class="muted">${a}</td><td>${b}</td></tr>`).join('')}</tbody></table></div>`,
      dependencies: () => {
        const deps = F.edges.filter(e => set.has(e.from) !== set.has(e.to) || (set.has(e.from) && e.sev));
        return `<div class="tscroll"><table class="t"><thead><tr><th>Direction</th><th>From</th><th>To</th><th>Type</th><th>Rule</th></tr></thead><tbody>${deps.map(e => `<tr><td>${set.has(e.from) && set.has(e.to) ? 'inside' : set.has(e.to) ? 'in' : 'out'}</td><td class="mono">${e.from}</td><td class="mono">${e.to}</td><td>${e.type}</td><td>${e.sev ? `<span class="pill ${e.sev}">${e.tag}</span>` : '<span class="muted">clean</span>'}</td></tr>`).join('')}</tbody></table></div>`;
      },
      packet: () => code('packet.yaml', `${F.fmt(pk.tokens)} tokens · ${Math.round(pk.ratio)}× smaller than the repo`, [
        c('# what an AI reads for this line, over MCP'), `${k('line')}: ${s(l.id)}`, `${k('scope')}: [${scope.map(s).join(', ')}]`, `${k('parts')}:`,
        ...pk.parts.map(([label, t]) => `  - ${s(label)}  ${c(`# ${F.fmt(t)} tokens`)}`),
        `${k('neighbours')}: [${pk.neighbours.map(s).join(', ')}]`, `${k('total_tokens')}: ${n(F.fmt(pk.tokens))}`,
        `${k('whole_repo_tokens')}: ${n(F.fmt(pk.repo))}  ${c(`# ${F.fmt(pk.repoLines)} lines × ${F.T.perLine}`)}`, `${k('tokens_on_our_side')}: ${n(0)}`]),
      config: () => code('.mcp.json', 'local stdio · makes no model calls', ['{', `  ${s('"mcpServers"')}: {`, `    ${s('"code-universe"')}: {`, `      ${k('"command"')}: ${s('"node"')},`, `      ${k('"args"')}: [${s('"universe/mcp.mjs"')}]`, '    }', '  }', '}']),
      tasks: () => tasks.length ? `<ul class="ctx">${tasks.map(t => `<li>${icon('send')}<div>${esc(t.title)}<small>${t.id} · ${esc((F.agentById.get(t.agent) || { name: t.agent }).name)} ${OPEN[t.status]}</small></div><em>${F.fmt(F.packet(t.scope).tokens)} tok</em></li>`).join('')}</ul>` : '<p class="pad muted">No AI is working on this line.</p>',
      repos: () => `<ul class="ctx">${repos.map(r => `<li>${icon('repo')}<div>${esc(r.name)}<small>${r.branch} @ ${r.commit} · ${r.files} files</small></div><em>${r.synced}</em></li>`).join('')}</ul>`,
      mcps: () => `<ul class="ctx">${D.connectors.map(x => `<li>${icon('mcp')}<div>${esc(x.name)}<small>${esc(x.role)}</small></div><em>${esc(x.where)}</em></li>`).join('')}</ul>`,
      workflows: () => `<ul class="ctx">${linked.map(x => `<li>${icon('flow')}<div><button type="button" data-line="${x.id}">${x.id}</button><small>${esc(x.trigger)}</small></div><em>${x.state}</em></li>`).join('')}</ul>`,
      issues: () => issues.length ? `<ul class="ctx">${issues.map(x => `<li>${icon('gate')}<div>${esc(x.title)}<small>${esc(x.sub)}</small></div><em class="${x.sev}-t">${x.sev}</em></li>`).join('')}</ul>` : '<p class="pad muted">No broken rules or failing tests on this line.</p>',
    };

    const topo = (() => {
      const cx = 80, gap = 72, H = 40 + ps.length * gap; let g = '';
      ps.forEach((p, i) => {
        const y = 30 + i * gap, col = { ok: '#3DD68C', warn: '#F2B64C', crit: '#FF6166' }[p.status];
        if (i) g += `<line x1="${cx}" y1="${y - gap + 30}" x2="${cx}" y2="${y - 13}" stroke="${after(i) ? '#FF6166' : '#34466C'}" stroke-width="1.5" ${after(i) ? 'stroke-dasharray="3 3"' : ''}/>`;
        F.inc.get(p.id).filter(e => !set.has(e.from)).forEach((e, j) => { const yy = y - 6 + j * 7; g += `<line x1="16" y1="${yy}" x2="${cx - 14}" y2="${y}" stroke="#223050"/><circle cx="14" cy="${yy}" r="2.5" fill="#48546C"><title>${e.from} → ${p.id}</title></circle>`; });
        F.out.get(p.id).filter(e => !set.has(e.to)).forEach((e, j) => { const yy = y - 6 + j * 7; g += `<line x1="${cx + 14}" y1="${y}" x2="144" y2="${yy}" stroke="#223050"/><circle cx="146" cy="${yy}" r="2.5" fill="#48546C"><title>${p.id} → ${e.to}</title></circle>`; });
        g += `<circle cx="${cx}" cy="${y}" r="12" fill="#0B1424" stroke="${col}" stroke-width="1.5"/><circle cx="${cx}" cy="${y}" r="3.5" fill="${col}"/><text class="tl ${after(i) ? 'dim' : ''}" x="${cx}" y="${y + 27}" text-anchor="middle">${p.id}</text>`;
      });
      return `<svg viewBox="0 0 160 ${H}" role="img" aria-label="Topology of ${l.id}">${g}</svg>`;
    })();

    main.innerHTML = `<div class="pl">
      <section class="card pl-left">
        <div class="pad">
          <div class="pl-name"><h2 class="mono">${l.id}</h2><span class="pill ${state[0]}">${state[1]}</span></div>
          <p>Runs ${esc(l.trigger)}. ${ps.length} stations from ${ps[0].id} to ${ps[ps.length - 1].id}, across ${sysNames.join(', ')}.</p>
          <div class="btns"><button type="button" class="btn sm" data-tab="logs">${icon('logs')}Logs</button><button type="button" class="btn sm" data-act="edit">${icon('edit')}Edit</button><button type="button" class="btn sm" data-act="settings">${icon('gear')}Settings</button></div>
          <dl class="kv"><dt>Type</dt><dd>Pipeline</dd><dt>Repository</dt><dd class="mono">${repos.map(r => r.name).join(', ')}</dd><dt>Last run</dt><dd>${lastPass ? 'Passed' : 'Failed'} in ${l.secs[last]} s</dd><dt>Yield</dt><dd>${l.yield}% of ${l.runs.length} runs</dd><dt>Status</dt><dd class="${l.state === 'stopped' ? 'crit-t' : l.state === 'running' ? 'ok-t' : 'muted'}">${l.state === 'stopped' ? `Stopped at ${l.stopAt}` : l.state === 'running' ? 'Healthy' : 'Idle until its next run'}</dd></dl>
        </div>
        ${l.state === 'stopped' ? `<div class="stopnote"><b>Stopped at ${l.stopAt}</b>${esc(l.reason)}. Release is yours, once it passes.</div>` : ''}
        <div class="ch"><h3>Related MCPs</h3></div>
        <ul class="rel">${D.connectors.map(x => `<li>${icon('mcp')}<span>${esc(x.name)}</span><span class="pill">Active</span></li>`).join('')}</ul>
      </section>
      <section class="card pl-flow">
        <div class="ch"><h3>Pipeline Flow</h3><div class="linepick">${D.lines.map(x => `<button type="button" data-line="${x.id}" aria-pressed="${x === l}"><i class="${x.state}"></i>${x.id}</button>`).join('')}</div></div>
        <div class="flow">${ps.map((p, i) => `${i ? `<span class="arr ${after(i) ? 'halt' : ''}">${icon('arrow')}</span>` : ''}<button type="button" class="st ${i === stop ? 'stop' : after(i) ? 'wait' : ''}" data-focus="${p.id}" style="--c:${W.HUE[F.sysIx[p.sys]]}" title="Show ${p.id} in the web"><span class="ic">${icon(p.kind)}</span><b>${p.id}</b><small>${p.stage} · ${F.stageName(p.stage)}</small><span class="h ${p.status}-t">${p.clean}/${p.tests} tests · health ${p.health}</span></button>`).join('')}</div>
        <div class="ch"><h3>Last ${l.runs.length} runs</h3><span class="sub">bar height is run time · red failed</span></div>
        <div class="runs" style="padding-top:8px;padding-bottom:14px;height:60px">${[...l.runs].map((r, i) => `<i class="${r === 'F' ? 'f' : ''}" style="height:${Math.max(8, 100 * l.secs[i] / maxSecs).toFixed(0)}%" title="run ${i + 1}: ${r === 'P' ? 'pass' : 'fail'}, ${l.secs[i]} s"></i>`).join('')}</div>
      </section>
      <section class="card pl-stages">${tabs('data-tab', [['stages', 'Stages'], ['logs', 'Logs'], ['metrics', 'Metrics'], ['dependencies', 'Dependencies']], 'stages')}<div data-panel="tab">${panels.stages()}</div></section>
      <section class="card pl-code"><div class="ch"><h3>Code Segments</h3></div>${tabs('data-ctab', [['packet', 'Context Packet'], ['config', 'MCP Config'], ['tasks', `Tasks (${tasks.length})`]], 'packet')}<div data-panel="ctab">${panels.packet()}</div></section>
      <section class="card pl-ctx"><div class="ch"><h3>Related Context</h3></div>${tabs('data-rtab', [['repos', `Repos (${repos.length})`], ['mcps', `MCPs (${D.connectors.length})`], ['workflows', `Workflows (${linked.length})`], ['issues', `Issues (${issues.length})`]], 'repos')}<div data-panel="rtab">${panels.repos()}</div></section>
      <section class="card pl-topo topo"><div class="ch"><h3>Pipeline Topology</h3></div><div class="pad">${topo}</div></section>
    </div>`;

    const root = main.firstElementChild;
    root.addEventListener('click', ev => {
      const b = ev.target.closest('[data-tab],[data-ctab],[data-rtab],[data-line],[data-focus],[data-act]'); if (!b) return;
      const kind = ['tab', 'ctab', 'rtab'].find(a => b.hasAttribute('data-' + a));
      if (kind) {
        const id = b.getAttribute('data-' + kind);
        root.querySelectorAll(`[data-${kind}]`).forEach(x => { if (x.getAttribute('role') === 'tab') x.setAttribute('aria-selected', String(x.getAttribute('data-' + kind) === id)); });
        root.querySelector(`[data-panel="${kind}"]`).innerHTML = panels[id]();
      } else if (b.dataset.line) ctx.go('pipeline', b.dataset.line);
      else if (b.dataset.focus) ctx.go('overview', b.dataset.focus);
      else if (b.dataset.act === 'edit') ctx.toast('Edits happen in your editor or through your AI. Code Universe reads the repo and never writes to it.');
      else if (b.dataset.act === 'settings') ctx.toast(`${l.id} is defined in the repo. Change its trigger in code and the web redraws after the next sync.`);
    });
    return () => {};
  };
})();
