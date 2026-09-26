// Dependency-free coordination state for human-authored Code Universe workflows.
// This module only transforms supplied data. It never reads, writes, imports, or executes repository code.

export const WORKFLOW_VERSION = 'code-universe.workflow.v1';
export const DEFAULT_LEASE_MS = 5 * 60_000;

const BAD_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const TERMINAL = new Set(['completed', 'cancelled']);
const UNIT_STATUSES = new Set(['pending', 'claimed', 'blocked', 'review', 'approved', 'completed', 'cancelled']);
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function fail(message) { throw new Error(message); }
function finite(value, label) { if (!Number.isFinite(value)) fail(`${label} must be a finite number`); return value; }
function integer(value, label, min = 0) { if (!Number.isInteger(value) || value < min) fail(`${label} must be an integer >= ${min}`); return value; }
function text(value, label, max = 2048, allowEmpty = false) {
  if (typeof value !== 'string') fail(`${label} must be a string`);
  const clean = value.trim();
  if ((!allowEmpty && !clean) || clean.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(clean)) fail(`${label} is invalid`);
  return clean;
}
function id(value, label) {
  const clean = text(value, label, 128);
  if (!ID_RE.test(clean) || BAD_KEYS.has(clean)) fail(`${label} is invalid`);
  return clean;
}
function optionalText(value, label, max = 2048) { return value == null || value === '' ? null : text(value, label, max); }
function unique(values) { return [...new Set(values)]; }
function stringList(value, label, maxItems = 256, maxLength = 256) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > maxItems) fail(`${label} must be an array with at most ${maxItems} items`);
  return unique(value.map((item, index) => text(item, `${label}[${index}]`, maxLength)));
}

export function normalizeRepoPath(value, label = 'path') {
  const path = text(value, label, 2048).replaceAll('\\', '/');
  if (path.startsWith('/') || /^[A-Za-z]:/.test(path) || path.endsWith('/') || path.includes('//')) fail(`${label} must be repository-relative`);
  const parts = path.split('/');
  if (parts.some(part => !part || part === '.' || part === '..' || /[\u0000-\u001f]/.test(part))) fail(`${label} must be repository-relative`);
  return parts.join('/');
}

// Copies JSON-shaped untrusted input while rejecting accessors, exotic prototypes,
// prototype-pollution keys, excessive depth/size, and non-finite values.
export function sanitizeInput(value, options = {}) {
  const limits = {
    maxDepth: options.maxDepth ?? 24,
    maxNodes: options.maxNodes ?? 100_000,
    maxArray: options.maxArray ?? 20_000,
    maxKeys: options.maxKeys ?? 20_000,
    maxString: options.maxString ?? 1_000_000
  };
  let nodes = 0;
  function visit(item, depth) {
    if (++nodes > limits.maxNodes) fail('Input is too large');
    if (depth > limits.maxDepth) fail('Input is too deeply nested');
    if (item === null || typeof item === 'boolean') return item;
    if (typeof item === 'number') return finite(item, 'number');
    if (typeof item === 'string') { if (item.length > limits.maxString) fail('Input string is too large'); return item; }
    if (typeof item !== 'object') fail('Input must contain JSON-safe values only');
    if (Array.isArray(item)) {
      if (item.length > limits.maxArray) fail('Input array is too large');
      return item.map(child => visit(child, depth + 1));
    }
    const proto = Object.getPrototypeOf(item);
    if (proto !== Object.prototype && proto !== null) fail('Input objects must be plain objects');
    const descriptors = Object.getOwnPropertyDescriptors(item);
    const keys = Object.keys(descriptors);
    if (keys.length > limits.maxKeys) fail('Input object has too many keys');
    const out = Object.create(null);
    for (const key of keys) {
      if (BAD_KEYS.has(key)) fail(`Unsafe input key: ${key}`);
      const descriptor = descriptors[key];
      if (!('value' in descriptor)) fail('Input accessors are not allowed');
      out[key] = visit(descriptor.value, depth + 1);
    }
    return out;
  }
  return visit(value, 0);
}

function jsonClone(value) { return sanitizeInput(value); }
function nowValue(value) { return integer(value, 'now', 0); }
function leaseDuration(value) { return integer(value ?? DEFAULT_LEASE_MS, 'leaseMs', 1); }
function pipelineOf(state, pipelineId) {
  const pipeline = state.project.pipelines[id(pipelineId, 'pipelineId')];
  if (!pipeline) fail(`Unknown pipeline: ${pipelineId}`);
  return pipeline;
}
function unitOf(state, pipelineId, unitId) {
  const pipeline = pipelineOf(state, pipelineId);
  const unit = pipeline.workUnits[id(unitId, 'unitId')];
  if (!unit) fail(`Unknown work unit: ${unitId}`);
  return { pipeline, unit };
}
function addEvent(state, type, now, data) {
  const event = { sequence: state.nextSequence++, ts: nowValue(now), type: text(type, 'event type', 128), data: jsonClone(data) };
  state.events.push(event);
  return event;
}
function evolve(source, options, mutation) {
  validateWorkflowState(source);
  const expected = options?.expectedRevision;
  if (expected != null && integer(expected, 'expectedRevision') !== source.revision) fail(`Revision conflict: expected ${expected}, current ${source.revision}`);
  const state = jsonClone(source);
  const result = mutation(state, nowValue(options?.now ?? 0), (type, data) => addEvent(state, type, options?.now ?? 0, data));
  state.revision++;
  validateWorkflowState(state);
  return { state, ...(result || {}) };
}

export function createProject(input, now = 0) {
  const clean = sanitizeInput(input);
  const projectId = id(clean.id, 'project.id');
  const state = {
    version: WORKFLOW_VERSION,
    revision: 1,
    nextSequence: 2,
    project: {
      id: projectId,
      name: text(clean.name, 'project.name', 256),
      repository: optionalText(clean.repository, 'project.repository', 2048),
      authoredBy: optionalText(clean.authoredBy, 'project.authoredBy', 256),
      metadata: sanitizeInput(clean.metadata ?? {}),
      pipelines: Object.create(null)
    },
    events: [{ sequence: 1, ts: nowValue(now), type: 'project.created', data: { projectId } }]
  };
  validateWorkflowState(state);
  return state;
}

export function addPipeline(state, input, options = {}) {
  const clean = sanitizeInput(input);
  return evolve(state, options, (next, now, emit) => {
    const pipelineId = id(clean.id, 'pipeline.id');
    if (next.project.pipelines[pipelineId]) fail(`Pipeline already exists: ${pipelineId}`);
    next.project.pipelines[pipelineId] = {
      id: pipelineId,
      name: text(clean.name, 'pipeline.name', 256),
      description: optionalText(clean.description, 'pipeline.description', 4096),
      workUnits: Object.create(null)
    };
    emit('pipeline.created', { pipelineId });
    return { pipeline: next.project.pipelines[pipelineId] };
  });
}

// Records a bounded, JSON-safe control-plane event for an external side effect
// (for example, provisioning a Git lane) while retaining the same revision/CAS
// guarantees as every in-memory workflow mutation.
export function recordWorkflowEvent(state, type, data = {}, options = {}) {
  return evolve(state, options, (next, now, emit) => { const event = emit(type, data); return { event }; });
}

function cleanScope(scope = {}) {
  const clean = sanitizeInput(scope);
  const paths = stringList(clean.paths, 'scope.paths', 1024, 2048).map((path, index) => normalizeRepoPath(path, `scope.paths[${index}]`));
  const parts = stringList(clean.parts, 'scope.parts', 1024, 512);
  if (!paths.length && !parts.length) fail('A work unit scope needs at least one path or code part');
  return {
    paths,
    parts,
    branch: optionalText(clean.branch, 'scope.branch', 256),
    worktree: optionalText(clean.worktree, 'scope.worktree', 1024)
  };
}
function hasDependencyPath(pipeline, from, target, seen = new Set()) {
  if (from === target) return true;
  if (seen.has(from)) return false;
  seen.add(from);
  const unit = pipeline.workUnits[from];
  return !!unit && unit.dependencies.some(dep => hasDependencyPath(pipeline, dep, target, seen));
}

export function addWorkUnit(state, pipelineId, input, options = {}) {
  const clean = sanitizeInput(input);
  return evolve(state, options, (next, now, emit) => {
    const pipeline = pipelineOf(next, pipelineId);
    const unitId = id(clean.id, 'workUnit.id');
    if (pipeline.workUnits[unitId]) fail(`Work unit already exists: ${unitId}`);
    const dependencies = stringList(clean.dependencies, 'workUnit.dependencies', 256, 128).map((dep, index) => id(dep, `workUnit.dependencies[${index}]`));
    for (const dependency of dependencies) if (!pipeline.workUnits[dependency]) fail(`Unknown dependency: ${dependency}`);
    const unit = {
      id: unitId,
      title: text(clean.title, 'workUnit.title', 512),
      description: optionalText(clean.description, 'workUnit.description', 8192),
      scope: cleanScope(clean.scope),
      dependencies,
      capabilities: stringList(clean.capabilities, 'workUnit.capabilities', 64, 128),
      affinity: stringList(clean.affinity, 'workUnit.affinity', 64, 128),
      priority: integer(clean.priority ?? 0, 'workUnit.priority', 0),
      status: 'pending',
      lease: null,
      lastClient: null,
      checkpoints: [],
      blocker: null,
      handoffs: [],
      review: null
    };
    pipeline.workUnits[unitId] = unit;
    if (dependencies.some(dep => hasDependencyPath(pipeline, dep, unitId))) fail(`Dependency cycle involving ${unitId}`);
    emit('work.created', { pipelineId: pipeline.id, unitId, dependencies, scope: unit.scope });
    return { workUnit: unit };
  });
}

function activeLease(lease, now) { return !!lease && lease.expiresAt > now; }
function dependenciesReady(pipeline, unit) { return unit.dependencies.every(dep => pipeline.workUnits[dep]?.status === 'completed'); }
function lane(scope) { return scope.worktree ? `worktree:${scope.worktree}` : scope.branch ? `branch:${scope.branch}` : 'shared'; }
function overlaps(a, b) {
  const ap = new Set(a.paths), bp = new Set(b.paths);
  const pathOverlap = [...ap].some(path => bp.has(path) || [...bp].some(other => path.startsWith(`${other}/`) || other.startsWith(`${path}/`)));
  const partOverlap = a.parts.some(part => b.parts.includes(part));
  return pathOverlap || partOverlap;
}
function claimConflict(state, targetPipelineId, target, now) {
  for (const pipeline of Object.values(state.project.pipelines)) {
    for (const unit of Object.values(pipeline.workUnits)) {
      if (pipeline.id === targetPipelineId && unit.id === target.id) continue;
      if (unit.status !== 'claimed' || !activeLease(unit.lease, now)) continue;
      if (lane(unit.scope) === lane(target.scope) || overlaps(unit.scope, target.scope)) return { pipelineId: pipeline.id, unitId: unit.id, client: unit.lease.client, lane: lane(unit.scope) };
    }
  }
  return null;
}
function clientProfile(value) {
  const clean = sanitizeInput(value);
  return {
    id: id(clean.id, 'client.id'),
    capabilities: stringList(clean.capabilities, 'client.capabilities', 128, 128),
    affinity: stringList(clean.affinity, 'client.affinity', 128, 128)
  };
}

export function readiness(state, pipelineId, unitId, now = 0) {
  validateWorkflowState(state);
  const { pipeline, unit } = unitOf(state, pipelineId, unitId);
  const current = nowValue(now);
  const missingDependencies = unit.dependencies.filter(dep => pipeline.workUnits[dep]?.status !== 'completed');
  const conflict = claimConflict(state, pipeline.id, unit, current);
  const reasons = [];
  if (TERMINAL.has(unit.status)) reasons.push(`status:${unit.status}`);
  if (unit.status === 'blocked') reasons.push('blocked');
  if (unit.status === 'review') reasons.push('in-review');
  if (unit.status === 'approved') reasons.push('approved-awaiting-completion');
  if (unit.status === 'claimed' && activeLease(unit.lease, current)) reasons.push('leased');
  if (missingDependencies.length) reasons.push('dependencies');
  if (conflict) reasons.push('scope-or-lane-conflict');
  return { ready: reasons.length === 0, reasons, missingDependencies, conflict };
}

export function listAllocatable(state, pipelineId, client, now = 0) {
  validateWorkflowState(state);
  const pipeline = pipelineOf(state, pipelineId);
  const profile = clientProfile(client);
  const caps = new Set(profile.capabilities), affinities = new Set(profile.affinity);
  return Object.values(pipeline.workUnits).flatMap(unit => {
    const ready = readiness(state, pipelineId, unit.id, now);
    const missingCapabilities = unit.capabilities.filter(capability => !caps.has(capability));
    if (!ready.ready || missingCapabilities.length) return [];
    const affinityMatches = unit.affinity.filter(value => affinities.has(value));
    return [{
      unitId: unit.id,
      score: unit.priority * 100 + affinityMatches.length * 10 - unit.dependencies.length,
      affinityMatches,
      lane: lane(unit.scope),
      scope: jsonClone(unit.scope)
    }];
  }).sort((a, b) => b.score - a.score || a.unitId.localeCompare(b.unitId));
}

export function claimWork(state, pipelineId, unitId, client, options = {}) {
  if (options.expectedRevision == null) fail('claimWork requires expectedRevision for atomic compare-and-swap');
  const profile = clientProfile(client);
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    if (unit.status === 'claimed' && activeLease(unit.lease, now)) fail(`Work unit already claimed by ${unit.lease.client}`);
    if (unit.status === 'claimed' && unit.lease) emit('lease.expired', { pipelineId: pipeline.id, unitId: unit.id, previousClient: unit.lease.client, expiredAt: unit.lease.expiresAt });
    if (TERMINAL.has(unit.status) || ['blocked', 'review', 'approved'].includes(unit.status)) fail(`Work unit is not claimable from status ${unit.status}`);
    if (!dependenciesReady(pipeline, unit)) fail(`Dependencies are not complete: ${unit.dependencies.filter(dep => pipeline.workUnits[dep]?.status !== 'completed').join(', ')}`);
    const missing = unit.capabilities.filter(capability => !profile.capabilities.includes(capability));
    if (missing.length) fail(`Client lacks required capabilities: ${missing.join(', ')}`);
    const conflict = claimConflict(next, pipeline.id, unit, now);
    if (conflict) fail(`Claim conflicts with ${conflict.pipelineId}/${conflict.unitId} held by ${conflict.client}`);
    unit.status = 'claimed';
    unit.lastClient = profile.id;
    unit.lease = { client: profile.id, acquiredAt: now, expiresAt: now + leaseDuration(options.leaseMs), revision: next.revision + 1 };
    emit('work.claimed', { pipelineId: pipeline.id, unitId: unit.id, client: profile.id, lane: lane(unit.scope), expiresAt: unit.lease.expiresAt });
    return { workUnit: unit, lease: unit.lease };
  });
}

function requireOwner(unit, clientId, now) {
  const client = id(clientId, 'clientId');
  if (unit.status !== 'claimed' || !activeLease(unit.lease, now) || unit.lease.client !== client) fail('An active lease owned by this client is required');
  return client;
}

export function renewClaim(state, pipelineId, unitId, clientId, options = {}) {
  if (options.expectedRevision == null) fail('renewClaim requires expectedRevision');
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const client = requireOwner(unit, clientId, now);
    unit.lease.expiresAt = now + leaseDuration(options.leaseMs);
    unit.lease.revision = next.revision + 1;
    emit('lease.renewed', { pipelineId: pipeline.id, unitId: unit.id, client, expiresAt: unit.lease.expiresAt });
    return { lease: unit.lease };
  });
}

function cleanEvidence(value) {
  if (!Array.isArray(value) || value.length > 256) fail('verification must be an array with at most 256 items');
  return value.map((raw, index) => {
    const item = sanitizeInput(raw);
    return {
      kind: text(item.kind, `verification[${index}].kind`, 128),
      command: optionalText(item.command, `verification[${index}].command`, 2048),
      result: text(item.result, `verification[${index}].result`, 8192),
      passed: item.passed == null ? null : !!item.passed
    };
  });
}

export function recordCheckpoint(state, pipelineId, unitId, clientId, checkpoint, options = {}) {
  const clean = sanitizeInput(checkpoint);
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const client = requireOwner(unit, clientId, now);
    const item = {
      sequence: unit.checkpoints.length + 1,
      ts: now,
      client,
      ref: text(clean.ref, 'checkpoint.ref', 512),
      changedPaths: stringList(clean.changedPaths, 'checkpoint.changedPaths', 2048, 2048).map((path, index) => normalizeRepoPath(path, `checkpoint.changedPaths[${index}]`)),
      verification: cleanEvidence(clean.verification ?? []),
      context: {
        budget: integer(clean.context?.budget ?? 0, 'checkpoint.context.budget', 0),
        actual: integer(clean.context?.actual ?? 0, 'checkpoint.context.actual', 0)
      },
      summary: optionalText(clean.summary, 'checkpoint.summary', 8192)
    };
    unit.checkpoints.push(item);
    emit('checkpoint.recorded', { pipelineId: pipeline.id, unitId: unit.id, client, checkpoint: item });
    return { checkpoint: item };
  });
}

export function requestPeerReview(state, pipelineId, unitId, clientId, input = {}, options = {}) {
  const clean = sanitizeInput(input);
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const client = requireOwner(unit, clientId, now);
    if (!unit.checkpoints.length) fail('A checkpoint is required before peer review');
    unit.review = { status: 'requested', requestedBy: client, requestedAt: now, capabilities: stringList(clean.capabilities, 'review.capabilities', 64, 128), lease: null, reviewer: null, decision: null, note: optionalText(clean.note, 'review.note', 4096) };
    unit.status = 'review';
    unit.lease = null;
    emit('review.requested', { pipelineId: pipeline.id, unitId: unit.id, requestedBy: client, capabilities: unit.review.capabilities });
    return { review: unit.review };
  });
}

export function claimPeerReview(state, pipelineId, unitId, client, options = {}) {
  if (options.expectedRevision == null) fail('claimPeerReview requires expectedRevision');
  const profile = clientProfile(client);
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const review = unit.review;
    if (!review || unit.status !== 'review') fail('Peer review is not requested');
    if (profile.id === review.requestedBy) fail('The author cannot claim their own peer review');
    if (review.status === 'claimed' && activeLease(review.lease, now)) fail(`Review already claimed by ${review.reviewer}`);
    if (review.status === 'claimed' && review.lease) emit('review.lease.expired', { pipelineId: pipeline.id, unitId: unit.id, previousReviewer: review.reviewer });
    const missing = review.capabilities.filter(capability => !profile.capabilities.includes(capability));
    if (missing.length) fail(`Reviewer lacks required capabilities: ${missing.join(', ')}`);
    review.status = 'claimed';
    review.reviewer = profile.id;
    review.lease = { client: profile.id, acquiredAt: now, expiresAt: now + leaseDuration(options.leaseMs), revision: next.revision + 1 };
    emit('review.claimed', { pipelineId: pipeline.id, unitId: unit.id, reviewer: profile.id, expiresAt: review.lease.expiresAt });
    return { review };
  });
}

export function decidePeerReview(state, pipelineId, unitId, reviewerId, decision, note, options = {}) {
  const verdict = text(decision, 'decision', 32);
  if (!['approved', 'changes-requested'].includes(verdict)) fail('decision must be approved or changes-requested');
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const reviewer = id(reviewerId, 'reviewerId');
    const review = unit.review;
    if (!review || review.status !== 'claimed' || !activeLease(review.lease, now) || review.reviewer !== reviewer) fail('An active review lease owned by this reviewer is required');
    review.status = verdict;
    review.decision = { verdict, note: optionalText(note, 'review note', 8192), ts: now, reviewer };
    review.lease = null;
    unit.status = verdict === 'approved' ? 'approved' : 'pending';
    emit(`review.${verdict}`, { pipelineId: pipeline.id, unitId: unit.id, reviewer, note: review.decision.note });
    return { review };
  });
}

export function completeWork(state, pipelineId, unitId, clientId, options = {}) {
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const client = id(clientId, 'clientId');
    if (unit.status === 'approved') {
      if (unit.lastClient !== client) fail('Only the work owner can complete approved work');
    } else requireOwner(unit, client, now);
    if (!unit.checkpoints.length) fail('A checkpoint is required before completion');
    if (unit.review && unit.review.status !== 'approved') fail('Requested peer review must be approved before completion');
    unit.status = 'completed';
    unit.lease = null;
    emit('work.completed', { pipelineId: pipeline.id, unitId: unit.id, client, checkpointCount: unit.checkpoints.length });
    return { workUnit: unit };
  });
}

export function blockWork(state, pipelineId, unitId, clientId, blocker, options = {}) {
  const clean = sanitizeInput(blocker);
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const client = requireOwner(unit, clientId, now);
    unit.blocker = { reason: text(clean.reason, 'blocker.reason', 8192), owner: optionalText(clean.owner, 'blocker.owner', 256), needs: stringList(clean.needs, 'blocker.needs', 64, 512), reportedBy: client, ts: now };
    unit.status = 'blocked';
    unit.lease = null;
    emit('work.blocked', { pipelineId: pipeline.id, unitId: unit.id, blocker: unit.blocker });
    return { blocker: unit.blocker };
  });
}

export function resolveBlocker(state, pipelineId, unitId, resolution, options = {}) {
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    if (unit.status !== 'blocked' || !unit.blocker) fail('Work unit is not blocked');
    const previous = unit.blocker;
    unit.blocker = null;
    unit.status = 'pending';
    emit('work.unblocked', { pipelineId: pipeline.id, unitId: unit.id, resolution: text(resolution, 'resolution', 8192), previous });
    return { workUnit: unit };
  });
}

export function handoffWork(state, pipelineId, unitId, fromClient, toClient, note, options = {}) {
  if (options.expectedRevision == null) fail('handoffWork requires expectedRevision');
  return evolve(state, options, (next, now, emit) => {
    const { pipeline, unit } = unitOf(next, pipelineId, unitId);
    const from = requireOwner(unit, fromClient, now), to = id(toClient, 'toClient');
    if (from === to) fail('Handoff recipient must be different');
    const handoff = { sequence: unit.handoffs.length + 1, from, to, note: text(note, 'handoff note', 8192), ts: now };
    unit.handoffs.push(handoff);
    unit.lastClient = to;
    unit.lease = { client: to, acquiredAt: now, expiresAt: now + leaseDuration(options.leaseMs), revision: next.revision + 1 };
    emit('work.handed-off', { pipelineId: pipeline.id, unitId: unit.id, handoff, expiresAt: unit.lease.expiresAt });
    return { handoff, lease: unit.lease };
  });
}

function compactFile(raw, index) {
  const file = sanitizeInput(raw);
  const path = normalizeRepoPath(file.path, `files[${index}].path`);
  const tokens = integer(file.tokens, `files[${index}].tokens`, 0);
  const dependencies = stringList(file.dependencies, `files[${index}].dependencies`, 2048, 2048).map((dep, depIndex) => normalizeRepoPath(dep, `files[${index}].dependencies[${depIndex}]`));
  const parts = Array.isArray(file.parts) ? file.parts.map((part, partIndex) => {
    const clean = sanitizeInput(part);
    return { id: text(clean.id, `files[${index}].parts[${partIndex}].id`, 512), tokens: integer(clean.tokens, `files[${index}].parts[${partIndex}].tokens`, 0) };
  }) : [];
  return { path, tokens, dependencies, parts };
}

// Selects all directly scoped paths first, then the nearest incoming/outgoing dependency
// neighbors. Scoped files are never omitted: when necessary they receive a fair truncated
// allocation. Contents are deliberately absent; a bridge may safely read only selected paths.
export function computeContextAllocation(input) {
  const clean = sanitizeInput(input);
  const budget = integer(clean.tokenBudget, 'tokenBudget', 1);
  const scope = cleanScope(clean.scope);
  const files = (clean.files ?? []).map(compactFile);
  const byPath = new Map(files.map(file => [file.path, file]));
  for (const path of scope.paths) if (!byPath.has(path)) fail(`Missing file metadata for scoped path: ${path}`);
  const partSet = new Set(scope.parts), partOwners = new Map();
  for (const file of files) for (const part of file.parts) if (partSet.has(part.id)) partOwners.set(part.id, file.path);
  for (const ref of partSet) if (!partOwners.has(ref)) fail(`Missing file metadata for scoped code part: ${ref}`);
  const scopedPaths = unique([...scope.paths, ...partOwners.values()]);
  const selected = [], chosen = new Set();
  const scoped = scopedPaths.map(path => byPath.get(path));
  const cost = file => {
    const matching = file.parts.filter(part => partSet.has(part.id));
    return matching.length ? Math.min(file.tokens, matching.reduce((sum, part) => sum + part.tokens, 0)) : file.tokens;
  };
  const totalRequired = scoped.reduce((sum, file) => sum + cost(file), 0);
  let remaining = budget;
  for (let i = 0; i < scoped.length; i++) {
    const file = scoped[i], wanted = cost(file), filesLeft = scoped.length - i;
    const allocation = totalRequired <= budget ? wanted : Math.min(wanted, Math.floor(remaining / filesLeft));
    selected.push({ path: file.path, reason: 'scope', distance: 0, estimatedTokens: wanted, allocatedTokens: allocation, truncated: allocation < wanted });
    chosen.add(file.path); remaining -= allocation;
  }
  const incoming = new Map(files.map(file => [file.path, []]));
  for (const file of files) for (const dependency of file.dependencies) if (incoming.has(dependency)) incoming.get(dependency).push(file.path);
  const queue = scopedPaths.map(path => ({ path, distance: 0 }));
  const seen = new Set(scopedPaths);
  while (queue.length) {
    const current = queue.shift(), file = byPath.get(current.path);
    const neighbors = unique([...(file?.dependencies ?? []), ...(incoming.get(current.path) ?? [])]).filter(path => byPath.has(path)).sort();
    for (const path of neighbors) {
      if (seen.has(path)) continue;
      seen.add(path);
      const distance = current.distance + 1;
      queue.push({ path, distance });
      const neighbor = byPath.get(path), wanted = neighbor.tokens;
      if (remaining >= wanted) {
        selected.push({ path, reason: 'dependency-neighbor', distance, estimatedTokens: wanted, allocatedTokens: wanted, truncated: false });
        chosen.add(path); remaining -= wanted;
      }
    }
  }
  return {
    budget,
    actual: budget - remaining,
    remaining,
    selected,
    omitted: files.filter(file => !chosen.has(file.path)).map(file => file.path).sort(),
    truncated: selected.some(file => file.truncated),
    policy: 'scoped-files-then-nearest-transitive-dependency-neighbors'
  };
}

export function validateWorkflowState(value) {
  const state = value;
  if (!state || typeof state !== 'object' || state.version !== WORKFLOW_VERSION) fail('Unsupported workflow state');
  integer(state.revision, 'state.revision', 1);
  integer(state.nextSequence, 'state.nextSequence', 2);
  id(state.project?.id, 'state.project.id');
  text(state.project?.name, 'state.project.name', 256);
  if (!state.project.pipelines || typeof state.project.pipelines !== 'object' || Array.isArray(state.project.pipelines)) fail('state.project.pipelines must be an object');
  if (!Array.isArray(state.events)) fail('state.events must be an array');
  for (let index = 0; index < state.events.length; index++) {
    if (state.events[index].sequence !== index + 1) fail('Event sequences must be contiguous and monotonic');
    nowValue(state.events[index].ts);
  }
  if (state.nextSequence !== state.events.length + 1) fail('nextSequence does not follow the event log');
  for (const [pipelineId, pipeline] of Object.entries(state.project.pipelines)) {
    if (id(pipelineId, 'pipeline key') !== id(pipeline.id, 'pipeline.id') || pipelineId !== pipeline.id) fail('Pipeline key/id mismatch');
    if (!pipeline.workUnits || typeof pipeline.workUnits !== 'object' || Array.isArray(pipeline.workUnits)) fail('pipeline.workUnits must be an object');
    for (const [unitId, unit] of Object.entries(pipeline.workUnits)) {
      if (id(unitId, 'work unit key') !== id(unit.id, 'workUnit.id') || unitId !== unit.id) fail('Work unit key/id mismatch');
      if (!UNIT_STATUSES.has(unit.status)) fail(`Invalid work unit status: ${unit.status}`);
      for (const dependency of unit.dependencies) if (!pipeline.workUnits[dependency]) fail(`Unknown dependency in state: ${dependency}`);
    }
  }
  return true;
}

export function serializeWorkflowState(state) {
  validateWorkflowState(state);
  return JSON.stringify(sanitizeInput(state));
}

export function deserializeWorkflowState(source) {
  if (typeof source !== 'string' || source.length > 20_000_000) fail('Serialized workflow state is invalid or too large');
  const state = sanitizeInput(JSON.parse(source));
  validateWorkflowState(state);
  return state;
}
