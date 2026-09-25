import { contextPacket } from './repo-core.mjs';

// Adapter to the factory drawing. Unexecuted tests and unknown health stay unknown.
export function factoryFor(snapshot, paths, activity = []) {
  const selected = new Set(paths), files = snapshot.files.filter(f => selected.has(f.path));
  const stages = [{ id: 'A', name: 'Source' }, { id: 'B', name: 'Tests' }, { id: 'C', name: 'Automation' }, { id: 'D', name: 'Configuration' }];
  const systems = [...new Set(files.map(f => f.system))].map(id => ({ id, name: id, repo: snapshot.repository.fullName }));
  const primitives = files.map(f => ({ id: f.path, sys: f.system, stage: f.test ? 'B' : /^\.github\/|Dockerfile|Makefile|Jenkinsfile/.test(f.path) ? 'C' : ['JSON', 'YAML', 'TOML'].includes(f.language) ? 'D' : 'A', kind: 'step', language: f.language,
    lines: f.lines ?? null, exports: (f.symbols || []).filter(s => s.exported).length, tests: (f.tests || []).length, testCases: f.tests || [], clean: null, failing: 0, flaky: 0, leakCount: 0, issues: [], health: null, healthParts: [], status: 'unknown', violations: [], chan: {}, desc: `${f.language} file in ${f.system}. ${f.analyzed ? 'Source inspected with static patterns.' : 'Source not yet analyzed.'}` }));
  const byId = new Map(primitives.map(p => [p.id, p])), out = new Map(primitives.map(p => [p.id, []])), inc = new Map(primitives.map(p => [p.id, []]));
  const edges = snapshot.edges.filter(e => selected.has(e.from) && selected.has(e.to)).map((e, i) => ({ ...e, i, type: 'reads', sev: null }));
  edges.forEach(e => { out.get(e.from).push(e); inc.get(e.to).push(e); });
  function closure(id, direction) { const seen = new Set(), queue = [id]; while (queue.length) { const current = queue.shift(); for (const e of (direction === 'out' ? out : inc).get(current) || []) { const next = e[direction === 'out' ? 'to' : 'from']; if (next !== id && !seen.has(next)) { seen.add(next); queue.push(next); } } } return seen; }
  const clients = [...new Set(activity.map(a => a.client))].map(id => ({ id, name: id, state: 'working' }));
  const latestActivity = [...new Map(activity.map(a => [a.client + ':' + a.id, a])).values()];
  const workOrders = latestActivity.filter(a => ['running', 'queued', 'approval', 'gate'].includes(a.status)).map(a => ({ id: a.id, agent: a.client, status: a.status, scope: (a.paths || []).filter(p => selected.has(p)), title: a.summary || a.status })).filter(t => t.scope.length);
  const repo = { name: snapshot.repository.fullName, branch: snapshot.repository.ref, commit: snapshot.repository.commit, files: snapshot.coverage.indexed, synced: snapshot.capturedAt, private: !!snapshot.repository.private };
  const D = { observed: true, project: { repo: repo.name }, systems, primitives, stages, repos: [repo], connectors: [{ name: 'code-universe', where: 'local stdio bridge', role: 'Client-independent repository context and activity.' }], workOrders, agents: clients, lines: [], tools: [], edges: [] };
  const F = { D, byId, out, inc, edges, systems, agentById: new Map(clients.map(a => [a.id, a])), stageIx: Object.fromEntries(stages.map((s, i) => [s.id, i])), sysIx: Object.fromEntries(systems.map((s, i) => [s.id, i])), stageName: id => stages.find(s => s.id === id)?.name || id,
    tests: { total: primitives.reduce((n, p) => n + p.tests, 0), clean: null }, plant: { health: null, weakest: primitives[0], crit: 0, warn: 0 }, V: [], CHANNELS: [], T: {}, ortho: { score: null, clean: null, total: edges.length },
    downstream: id => closure(id, 'inc'), upstream: id => closure(id, 'out'), blastEdges: (id, set) => new Set(edges.filter(e => set.has(e.from) || e.from === id).map(e => e.i)), linesTouching: () => [], plural: (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`, fmt: n => Number(n).toLocaleString('en-US'),
    packet(scope) { const p = contextPacket(snapshot, scope); return { tokens: p.tokenEstimate.total, parts: [], neighbours: p.neighbours, repo: Math.ceil(Object.values(snapshot.contents).reduce((n, s) => n + s.length, 0) / 4), repoLines: files.reduce((n, f) => n + (f.lines || 0), 0), ratio: null }; } };
  systems.forEach(s => { s.count = primitives.filter(p => p.sys === s.id).length; s.health = null; s.status = 'unknown'; });
  return F;
}
