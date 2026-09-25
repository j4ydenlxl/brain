// Evidence-first audit model shared by the browser and MCP bridge.
// It ranks static facts for attention; it never invents health or test outcomes.
const fnv = value => { let hash = 0x811c9dc5; for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 0x01000193); } return (hash >>> 0).toString(36).padStart(7, '0'); };
const pct = value => Math.round(Number(value || 0) * 1000) / 10;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const partRef = part => `P-${fnv(part.id)}`;

export function buildAudit(snapshot, anatomy) {
  const byRef = new Map(), parts = anatomy.parts.map(part => {
    const metrics = part.metrics || {}, reasons = [];
    if ((metrics.cyclomatic || 1) >= 8) reasons.push(`${metrics.cyclomatic} control paths`);
    if ((metrics.blastRadius || 0) >= 8) reasons.push(`${metrics.blastRadius} transitive consumers`);
    if ((metrics.fanOut || 0) >= 8) reasons.push(`${metrics.fanOut} outgoing part connections`);
    if ((metrics.lines || 0) >= 120) reasons.push(`${metrics.lines} source lines`);
    if ((metrics.churn || 0) >= 10) reasons.push(`${metrics.churn} commits in sampled history`);
    const attention = clamp((metrics.cyclomatic || 1) - 1, 0, 20) + clamp(metrics.blastRadius || 0, 0, 25) + clamp(metrics.fanIn || 0, 0, 15) + clamp(metrics.fanOut || 0, 0, 15) + clamp(Math.floor((metrics.lines || 0) / 30), 0, 10) + clamp(Math.floor((metrics.churn || 0) / 4), 0, 15);
    const record = { ref: partRef(part), id: part.id, name: part.name, kind: part.kind, path: part.path, line: part.line, endLine: part.endLine, system: part.system, metrics, lenses: part.lenses || ['structure'], reasons, attention, evidence: `${part.path}:${part.line}-${part.endLine}` };
    byRef.set(record.ref, record); return record;
  });
  const ranked = parts.slice().sort((a, b) => b.attention - a.attention || b.metrics.blastRadius - a.metrics.blastRadius || a.evidence.localeCompare(b.evidence));
  const boundaries = (snapshot.orthogonality || []).map(item => ({ ...item, leakagePercent: pct(item.leakage), scorePercent: pct(item.score), evidence: item.worst?.evidence || [] })).sort((a, b) => a.score - b.score || b.crossBoundaryEdges - a.crossBoundaryEdges);
  const lenses = ['errors','async','network','io','filesystem','config','logging','security','churn'].map(name => ({ name, parts: parts.filter(part => part.lenses.includes(name)).length }));
  const findings = [
    ...(snapshot.coverage?.complete === false ? [{ kind: 'coverage-partial', ref: 'CV-1', count: snapshot.coverage.truncationReasons?.length || 1, summary: 'Repository-wide conclusions are limited to the indexed and analyzed subset.', evidence: (snapshot.coverage.truncationReasons || ['Coverage is incomplete.']).slice(0, 20) }] : []),
    ...snapshot.cycles.map((members, index) => ({ kind: 'import-cycle', ref: `C-${index + 1}`, count: members.length, summary: `${members.length} files form an import cycle.`, evidence: members })),
    ...boundaries.filter(item => item.crossBoundaryEdges).map(item => ({ kind: 'boundary-leak', ref: `B-${fnv(item.system)}`, count: item.crossBoundaryEdges, summary: `${item.system} has ${item.crossBoundaryEdges} cross-boundary import${item.crossBoundaryEdges === 1 ? '' : 's'}; its weakest file sets ${item.scorePercent}% orthogonality.`, evidence: item.evidence })),
    ...ranked.filter(item => item.reasons.length).slice(0, 40).map(item => ({ kind: 'part-concentration', ref: item.ref, count: item.attention, summary: `${item.name}: ${item.reasons.join(', ')}.`, evidence: [item.evidence] })),
    ...(snapshot.unresolved.length ? [{ kind: 'unresolved-reference', ref: 'U-1', count: snapshot.unresolved.length, summary: `${snapshot.unresolved.length} local references were not resolved by static analysis.`, evidence: snapshot.unresolved.slice(0, 20).map(item => `${item.from}:${item.line}`) }] : [])
  ];
  return {
    schema: 'code-universe.audit.v2', repository: snapshot.repository, capturedAt: snapshot.capturedAt, fingerprint: `A-${fnv(`${snapshot.repository.fullName}|${snapshot.repository.commit || snapshot.repository.ref}|${snapshot.live?.sequence || 0}|${snapshot.capturedAt}|${parts.length}|${snapshot.edges.length}`)}`,
    execution: { testsExecuted: false, runtimeMeasured: false, health: null, statement: 'Static evidence only. Repository code and tests were not executed.' },
    coverage: { ...snapshot.coverage, parts: parts.length, operations: anatomy.operations.length, blocks: anatomy.blocks?.length || 0, valueFlows: anatomy.dataEdges?.filter(edge => edge.kind === 'value').length || 0, typeLinks: anatomy.dataEdges?.filter(edge => edge.kind === 'type').length || 0 },
    boundaries, ranked, lenses, findings, byRef,
    surfaces: { routes: snapshot.runtime?.routes || [], environment: snapshot.runtime?.env || [], types: snapshot.runtime?.types || [], tables: snapshot.runtime?.tables || [], publicApi: snapshot.runtime?.publicApi || [], dependencies: snapshot.dependencies || [] }
  };
}

const compactMetrics = metrics => ({ complexity: metrics.cyclomatic || 1, fanIn: metrics.fanIn || 0, fanOut: metrics.fanOut || 0, blastRadius: metrics.blastRadius || 0, lines: metrics.lines || 0, churn: metrics.churn || 0 });
const compactSurface = (item, kind) => {
  const base = { kind, path: item.path, line: item.line };
  if (kind === 'route') return { ...base, method: item.method, route: item.route, handler: item.handler || null };
  if (kind === 'environment') return { ...base, key: item.key };
  if (kind === 'type') return { ...base, name: item.name, declaration: item.kind, generics: item.generics || [] };
  if (kind === 'table') return { ...base, name: item.name, columns: (item.columns || []).map(column => typeof column === 'string' ? column : column.name || column.column || String(column)) };
  if (kind === 'publicApi') return { ...base, name: item.name, declaration: item.kind };
  return { kind: 'dependency', name: item.name, ecosystem: item.ecosystem || 'unknown', packageRoot: item.packageRoot || '', requested: item.requested || null, resolved: item.resolved || null, direct: !!item.direct, imports: item.imports?.length || 0, systems: item.usageDepth || 0, manifests: item.manifests || [] };
};

export function compactAudit(audit, { limit = 6, focus = '', detail = 'index' } = {}) {
  limit = Math.max(1, Math.min(50, Number(limit) || 6));
  detail = ['index', 'full', 'surfaces'].includes(detail) ? detail : 'index';
  const needle = String(focus || '').trim().toLowerCase(), matches = value => !needle || String(value || '').toLowerCase().includes(needle);
  const ranked = audit.ranked.filter(item => matches(`${item.ref} ${item.name} ${item.kind} ${item.path} ${item.system} ${item.lenses.join(' ')}`)).slice(0, limit).map(({ ref, name, kind, evidence, metrics, reasons, lenses }) => ({ ref, name, kind, at: evidence, metrics: compactMetrics(metrics), why: reasons, lenses }));
  const boundaries = audit.boundaries.filter(item => matches(`${item.system} ${item.worst?.path || ''}`)).slice(0, Math.min(limit, detail === 'index' ? 3 : limit)).map(item => ({ system: item.system, orthogonalityPercent: item.scorePercent, crossBoundaryEdges: item.crossBoundaryEdges, weakestPath: item.worst?.path || null, evidence: item.evidence.slice(0, detail === 'index' ? 2 : 5) }));
  const findings = audit.findings.filter(item => matches(`${item.ref} ${item.kind} ${item.summary} ${item.evidence.join(' ')}`) && item.kind !== 'part-concentration').slice(0, limit).map(item => ({ kind: item.kind, ref: item.ref, summary: item.summary, evidence: item.evidence.slice(0, detail === 'index' ? 2 : 5) }));
  const surfaceCounts = Object.fromEntries(Object.entries(audit.surfaces).map(([key, value]) => [key, value.length]));
  const base = { schema: 'code-universe.audit.index.v2', audit: audit.fingerprint, repo: audit.repository.fullName, ref: audit.repository.commit || audit.repository.ref, focus: needle || null, sourceIncluded: false, health: null, testsExecuted: false, execution: { runtimeMeasured: false }, coverage: audit.coverage, counts: { findings: audit.findings.length, rankedParts: audit.ranked.length, importCycles: audit.findings.filter(item => item.kind === 'import-cycle').length, boundaryLeaks: audit.findings.filter(item => item.kind === 'boundary-leak').length, unresolvedGroups: audit.findings.filter(item => item.kind === 'unresolved-reference').length, surfaces: surfaceCounts }, ranked, boundaries, findings, next: ranked[0] ? { inspectPart: `universe_part {"ref":"${ranked[0].ref}"}`, source: `universe_read {"path":"${ranked[0].at.split(':')[0]}","start":1,"limit":120}`, packet: 'Use universe_context only for paths actively needed.' } : { locate: 'Use universe_find with a path or symbol query.' } };
  if (detail === 'index') return base;
  if (detail === 'surfaces') return { ...base, schema: 'code-universe.audit.surfaces.v2', ranked: [], boundaries: [], findings: [], surfaces: { routes: audit.surfaces.routes.filter(item => matches(`${item.method} ${item.route} ${item.handler} ${item.path}`)).slice(0, limit).map(item => compactSurface(item, 'route')), environment: audit.surfaces.environment.filter(item => matches(`${item.key} ${item.path}`)).slice(0, limit).map(item => compactSurface(item, 'environment')), types: audit.surfaces.types.filter(item => matches(`${item.name} ${item.kind} ${item.path}`)).slice(0, limit).map(item => compactSurface(item, 'type')), tables: audit.surfaces.tables.filter(item => matches(`${item.name} ${item.path}`)).slice(0, limit).map(item => compactSurface(item, 'table')), publicApi: audit.surfaces.publicApi.filter(item => matches(`${item.name} ${item.kind} ${item.path}`)).slice(0, limit).map(item => compactSurface(item, 'publicApi')), dependencies: audit.surfaces.dependencies.filter(item => matches(`${item.name} ${item.requested} ${item.resolved}`)).slice(0, limit).map(item => compactSurface(item, 'dependency')) } };
  return { ...base, schema: 'code-universe.audit.full-index.v2', lenses: audit.lenses, boundaries: audit.boundaries.filter(item => matches(`${item.system} ${item.worst?.path || ''}`)).slice(0, limit).map(item => ({ system: item.system, orthogonalityPercent: item.scorePercent, crossBoundaryEdges: item.crossBoundaryEdges, totalEdges: item.totalEdges, weakestPath: item.worst?.path || null, evidence: item.evidence.slice(0, 5) })), findings: audit.findings.filter(item => matches(`${item.ref} ${item.kind} ${item.summary} ${item.evidence.join(' ')}`)).slice(0, limit).map(item => ({ kind: item.kind, ref: item.ref, count: item.count, summary: item.summary, evidence: item.evidence.slice(0, 5) })) };
}

export function compactPart(audit, anatomy, ref) {
  const record = audit.byRef.get(ref) || audit.ranked.find(item => item.id === ref || item.name === ref); if (!record) return null;
  const part = anatomy.byId.get(record.id), inbound = anatomy.edges.filter(edge => edge.to === record.id), outbound = anatomy.edges.filter(edge => edge.from === record.id), data = anatomy.dataEdges.filter(edge => edge.from === record.id || edge.to === record.id);
  return { schema: 'code-universe.part.v2', audit: audit.fingerprint, sourceIncluded: false, ...record, summary: part.summary, parameters: part.parameterDetails || part.parameters, returns: part.returns, blocks: (part.blocks || []).map(block => ({ kind: block.kind, label: block.label, line: block.line, endLine: block.endLine, statements: block.statements.length })), calls: outbound.slice(0, 30).map(edge => ({ to: partRef(anatomy.byId.get(edge.to)), name: anatomy.byId.get(edge.to)?.name, kind: edge.kind, evidence: edge.evidence })), callers: inbound.slice(0, 30).map(edge => ({ from: partRef(anatomy.byId.get(edge.from)), name: anatomy.byId.get(edge.from)?.name, kind: edge.kind, evidence: edge.evidence })), valueAndTypeFlows: data.slice(0, 40).map(edge => ({ kind: edge.kind, value: edge.value, evidence: edge.evidence })) };
}
