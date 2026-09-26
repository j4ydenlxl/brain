import { parseRepository, analyzeRepository, applyRepositoryDelta, readablePath, excludedPath, safePath, sensitivePath, textLooksBinary, SOURCE_LIMIT, validateSnapshot } from './repo-core.mjs';
const encoded = path => path.split('/').map(encodeURIComponent).join('/');
const strictUtf8 = new TextDecoder('utf-8', { fatal: true });
function decodeSource(bytes, path) {
  if (bytes.byteLength > SOURCE_LIMIT) throw new Error(`File exceeds the 320 KB source-view limit: ${path}`);
  let text; try { text = strictUtf8.decode(bytes); } catch { throw new Error(`Source is not valid UTF-8 and was not analyzed: ${path}`); }
  if (textLooksBinary(text)) throw new Error(`File appears binary and was not analyzed: ${path}`); return text;
}
async function responseError(r) {
  if (r.status === 403 || r.status === 429) { const reset = r.headers.get('x-ratelimit-reset'); return `GitHub access or rate limit reached.${reset ? ' Rate limit resets at ' + new Date(Number(reset) * 1000).toLocaleTimeString() + '.' : ''} A read-only token may be needed.`; }
  if (r.status === 404) return 'Repository or ref not found. Check the name and branch; private repositories require a token with Contents: read access.';
  if (r.status === 401) return 'GitHub did not accept this token. Check its repository access and Contents: read permission.';
  return `Request failed (${r.status}). Try again or import a local snapshot.`;
}
export async function openGitHub(value, { ref = '', token = '', signal, progress = () => {} } = {}) {
  const parsed = parseRepository(value); let secret = token.trim();
  const root = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  async function api(suffix, accept = 'application/vnd.github+json') {
    const headers = { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' }; if (secret) headers.Authorization = 'Bearer ' + secret;
    const r = await fetch(root + suffix, { headers, signal, credentials: 'omit', referrerPolicy: 'no-referrer' }); if (!r.ok) throw new Error(await responseError(r)); return accept.includes('raw') ? new Uint8Array(await r.arrayBuffer()) : r.json();
  }
  progress('Reading repository and pinning its commit…');
  const meta = await api(''), branch = ref.trim() || parsed.refHint || meta.default_branch;
  const commit = await api('/commits/' + encodeURIComponent(branch));
  const repository = { fullName: meta.full_name, ref: branch, commit: commit.sha, url: meta.html_url, description: meta.description || '', private: meta.private, language: meta.language, local: false };
  progress('Indexing the repository tree…');
  let warnings = [];
  async function loadTree(treeSha, targetWarnings = warnings, targetCoverage = {}) {
    const recursive = await api('/git/trees/' + encodeURIComponent(treeSha) + '?recursive=1');
    let nextTree = recursive.tree || [];
    let remainingDirectories = 0;
    if (recursive.truncated) {
      targetWarnings.push('GitHub truncated its recursive tree. Directory trees were expanded separately.');
      const queue = [{ sha: treeSha, prefix: '' }]; nextTree = []; let requests = 0;
      while (queue.length && requests < 80 && nextTree.length < 100000) {
        const item = queue.shift(); progress(`Expanding large repository: ${requests + 1} directories…`);
        let part; try { part = await api('/git/trees/' + encodeURIComponent(item.sha)); } catch (error) { targetWarnings.push('Partial tree: ' + error.message); queue.push(item); break; }
        requests++;
        for (const node of part.tree || []) { const entry = { ...node, path: item.prefix + node.path }; nextTree.push(entry); if (node.type === 'tree' && !excludedPath(entry.path + '/')) queue.push({ sha: node.sha, prefix: entry.path + '/' }); }
      }
      remainingDirectories = queue.length;
      if (queue.length) targetWarnings.push(`Partial index: ${queue.length} directories remain. Narrow the repository locally with the MCP bridge for complete coverage.`);
    }
    Object.assign(targetCoverage, { treeComplete: !remainingDirectories, remainingDirectories, truncationReasons: remainingDirectories ? [`${remainingDirectories} Git tree directories remain unindexed after the bounded API expansion.`] : [] });
    return nextTree.filter(f => safePath(f.path));
  }
  let treeCoverage = {}, tree = await loadTree(commit.commit.tree.sha, warnings, treeCoverage);
  let contents = Object.create(null), byPath = new Map(tree.map(f => [f.path, f])), current = null;
  async function readFile(path) {
    if (!safePath(path) || sensitivePath(path) || !byPath.has(path)) throw new Error('File is outside this repository or is a sensitive configuration file.');
    if (Object.hasOwn(contents, path)) return contents[path];
    const entry = byPath.get(path);
    if (entry.type !== 'blob' || entry.mode === '120000' || !readablePath(path)) throw new Error('This file is a repository boundary or is not supported as text. Open it on GitHub.');
    if (entry.size > SOURCE_LIMIT) throw new Error('File exceeds the 320 KB source-view limit. Its path remains in the index.');
    let bytes;
    if (secret || repository.private) bytes = await api('/contents/' + encoded(path) + '?ref=' + encodeURIComponent(repository.commit), 'application/vnd.github.raw+json');
    else { const r = await fetch(`https://raw.githubusercontent.com/${encoded(meta.full_name)}/${repository.commit}/${encoded(path)}`, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' }); if (!r.ok) throw new Error(`Source unavailable (${r.status}): ${path}`); bytes = new Uint8Array(await r.arrayBuffer()); }
    const text = decodeSource(bytes, path);
    contents[path] = text;
    if (current) { current = applyRepositoryDelta(current, [{ kind: current.files.some(file => file.path === path) ? 'changed' : 'added', path, source: text, size: entry.size, sha: entry.sha }], { activity: current.activity, warnings }); current.coverage.sourceLoaded = Object.keys(contents).length; current.coverage.sourceComplete = current.coverage.sourceLoaded >= (current.coverage.sourceCandidates || 0); current.coverage.complete = !!current.coverage.treeComplete && current.coverage.sourceComplete; current.coverage.scope = current.coverage.complete ? 'repository' : 'indexed subset'; if (current.coverage.sourceComplete) { current.coverage.truncationReasons = (current.coverage.truncationReasons || []).filter(reason => !/source files (?:were not initially analyzed|require on-demand analysis)/.test(reason)); warnings = warnings.filter(message => !/^Source coverage:/.test(message)); current.warnings = current.warnings.filter(message => !/^Source coverage:/.test(message)); } }
    return text;
  }
  const rank = f => /^\.github\/workflows\//.test(f.path) ? 0 : /^(?:package\.json|README\.md|pyproject\.toml|Cargo\.toml|go\.mod|Makefile|Dockerfile)$/.test(f.path) ? 1 : /^(?:src|lib|app)\//.test(f.path) || /^(?:index|main|app|server)\./.test(f.path) ? 2 : /^packages\//.test(f.path) ? 3 : /(?:^|\/)(?:package\.json|Makefile|Dockerfile)$/.test(f.path) ? 4 : 5;
  let candidates = tree.filter(f => f.type === 'blob' && f.mode !== '120000' && !excludedPath(f.path) && readablePath(f.path) && (f.size || 0) <= SOURCE_LIMIT).sort((a, b) => rank(a) - rank(b) || a.path.localeCompare(b.path));
  const initial = candidates.slice(0, 48); let completed = 0, next = 0;
  async function worker() { while (next < initial.length) { const file = initial[next++]; try { await readFile(file.path); } catch (e) { if (signal?.aborted) throw e; warnings.push(e.message); } completed++; progress(`Analyzing source ${completed}/${initial.length} · ${file.path}`); } }
  await Promise.all(Array.from({ length: Math.min(6, initial.length) }, worker));
  if (candidates.length > initial.length) warnings.push(`Source coverage: ${initial.length} priority files initially requested. Open any other file to analyze it, or analyze the current scope. The full indexed tree stays browsable.`);
  const initialCoverage = { ...treeCoverage, complete: !!treeCoverage.treeComplete && candidates.length <= initial.length, sourceComplete: candidates.length <= initial.length, sourceCandidates: candidates.length, sourceLoaded: Object.keys(contents).length, truncationReasons: [...(treeCoverage.truncationReasons || []), ...(candidates.length > initial.length ? [`${candidates.length - initial.length} indexed source files were not initially analyzed.`] : [])] };
  current = analyzeRepository({ repository, tree, contents, warnings: [...warnings], coverage: initialCoverage });
  const snapshot = () => current;
  let timer = 0, stopped = false;
  const subscribe = listener => {
    stopped = false;
    const check = async () => {
      if (stopped) return;
      const checkedAt = new Date().toISOString();
      try {
        const head = await api('/commits/' + encodeURIComponent(branch));
        if (head.sha !== repository.commit) {
          const from = repository.commit;
          const comparison = await api('/compare/' + encodeURIComponent(from) + '...' + encodeURIComponent(head.sha));
          const nextWarnings = [...warnings], nextCoverage = {}, nextTree = await loadTree(head.commit.tree.sha, nextWarnings, nextCoverage), nextByPath = new Map(nextTree.map(file => [file.path, file])), nextContents = Object.create(null);
          for (const [path, text] of Object.entries(contents)) if (nextByPath.get(path)?.sha === byPath.get(path)?.sha) nextContents[path] = text;
          const nextRepository = { ...repository, commit: head.sha }, nextCandidates = nextTree.filter(f => f.type === 'blob' && f.mode !== '120000' && !excludedPath(f.path) && readablePath(f.path) && (f.size || 0) <= SOURCE_LIMIT), sourceLoaded = Object.keys(nextContents).length;
          Object.assign(nextCoverage, { complete: !!nextCoverage.treeComplete && sourceLoaded >= nextCandidates.length, sourceComplete: sourceLoaded >= nextCandidates.length, sourceCandidates: nextCandidates.length, sourceLoaded, truncationReasons: [...(nextCoverage.truncationReasons || []), ...(sourceLoaded < nextCandidates.length ? [`${nextCandidates.length - sourceLoaded} indexed source files require on-demand analysis after the head changed.`] : [])] });
          const nextCurrent = analyzeRepository({ repository: nextRepository, tree: nextTree, contents: nextContents, warnings: nextWarnings, coverage: nextCoverage });
          Object.assign(repository, nextRepository); nextCurrent.repository = repository; tree = nextTree; byPath = nextByPath; contents = nextContents; warnings = nextWarnings; treeCoverage = nextCoverage; candidates = nextCandidates; current = nextCurrent;
          listener({ kind: 'github-check', checkedAt, intervalMs: 60000, moved: true, from, to: head.sha, changes: (comparison.files || []).map(file => ({ path: file.filename, status: file.status, additions: file.additions, deletions: file.deletions, changes: file.changes })) });
        } else listener({ kind: 'github-check', checkedAt, intervalMs: 60000, moved: false, commit: repository.commit, changes: [] });
      } catch (error) { listener({ kind: 'github-check', checkedAt, intervalMs: 60000, error: error.message, changes: [] }); }
      if (!stopped) timer = setTimeout(check, 60000);
    };
    timer = setTimeout(check, 60000);
    return () => { stopped = true; clearTimeout(timer); };
  };
  return { mode: 'github', repository, readFile, snapshot, subscribe, dispose() { stopped = true; clearTimeout(timer); secret = ''; } };
}

export async function openLocalBridge(address, token, { signal } = {}) {
  const base = new URL(address || 'http://127.0.0.1:8794');
  if (base.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(base.hostname) || base.username || base.password || base.pathname !== '/' || base.search || base.hash) throw new Error('The bridge must be a loopback address such as http://127.0.0.1:8794.');
  let secret = String(token).trim(); if (!secret) throw new Error('Enter the pairing token printed by the local bridge.');
  async function request(path, options = {}) {
    const r = await fetch(base.origin + path, { ...options, headers: { Authorization: 'Bearer ' + secret, ...(options.body ? { 'Content-Type': 'application/json' } : {}) }, signal: options.signal || signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    let payload; try { payload = await r.json(); } catch { payload = null; }
    if (!r.ok) throw new Error(r.status === 401 ? 'The pairing token is incorrect.' : payload?.error || `Local bridge returned ${r.status}.`); return payload;
  }
  const snapshotSequence = value => Math.max(Number(value.live?.sequence) || 0, 0, ...(value.activity || []).map(event => Number(event.sequence) || 0));
  async function loadSnapshot() {
    const data = await request('/v1/snapshot'), clean = validateSnapshot(data);
    clean.warnings = Array.isArray(data.warnings) ? data.warnings.map(String) : [];
    clean.activity = Array.isArray(data.activity) ? data.activity.slice(-300) : [];
    if (data.ingestion && typeof data.ingestion === 'object') clean.ingestion = data.ingestion;
    if (data.live && typeof data.live === 'object') clean.live = { sequence: Number(data.live.sequence) || 0, ts: Number(data.live.ts) || 0, watchMode: String(data.live.watchMode || ''), analysisTouched: Array.isArray(data.live.analysisTouched) ? data.live.analysisTouched.filter(safePath) : [] };
    return clean;
  }
  let current = await loadSnapshot();
  let stopped = false, streamAbort = null, lastSequence = snapshotSequence(current);
  let resyncSnapshot = null;
  const provider = { mode: 'local', get repository() { return current.repository; },
    async readFile(path) { const data = await request('/v1/file?path=' + encodeURIComponent(path)); const file = current.files.find(file => file.path === path); current = applyRepositoryDelta(current, [{ kind: file ? 'changed' : 'added', path, source: data.source, size: new TextEncoder().encode(data.source).length, sha: file?.sha || '' }], { activity: current.activity, warnings: current.warnings }); return data.source; },
    snapshot: () => current,
    async refresh() { if (resyncSnapshot) return resyncSnapshot; const clean = await loadSnapshot(); current = clean; lastSequence = Math.max(lastSequence, snapshotSequence(clean)); return current; },
    async activity(after = 0) { return request('/v1/activity?after=' + after); },
    async createTask(task) { return request('/v1/tasks', { method: 'POST', body: JSON.stringify(task) }); },
    async tasks() { return request('/v1/tasks'); },
    async workflow(operation = { action: 'view' }) { return operation.action === 'view' || !operation.action ? request('/v1/workflow?after=' + (operation.after || 0)) : request('/v1/workflow', { method: 'POST', body: JSON.stringify(operation) }); },
    subscribe(listener) {
      stopped = false;
      const parse = async block => {
        let kind = 'message', id = 0, data = null;
        for (const line of block.split('\n')) { if (line.startsWith('event:')) kind = line.slice(6).trim(); if (line.startsWith('id:')) id = Number(line.slice(3).trim()) || id; if (line.startsWith('data:')) { try { data = JSON.parse(line.slice(5).trim()); } catch {} } }
        if (!data) return;
        const eventSequence = id || Number(data.sequence) || 0;
        if (kind === 'resync') {
          const fresh = await loadSnapshot();
          current = fresh; lastSequence = Math.max(lastSequence, eventSequence, snapshotSequence(fresh)); resyncSnapshot = fresh;
          try { await listener({ kind, data, snapshot: current, receivedAt: performance.now() }); } finally { resyncSnapshot = null; }
          return;
        }
        lastSequence = Math.max(lastSequence, eventSequence);
        if (kind === 'repository-delta') {
          current = applyRepositoryDelta(current, data.changes || [], { sequence: data.sequence, ts: data.ts, activity: current.activity || [], warnings: current.warnings || [] });
          current.live = { ...(current.live || {}), sequence: data.sequence, ts: data.ts, watchMode: data.watchMode, analysisTouched: data.analysis?.filesTouched || [] };
        } else if (kind === 'activity') {
          current.activity = [...new Map([...(current.activity || []), data].map(event => [event.sequence, event])).values()].slice(-300);
        }
        await listener({ kind, data, snapshot: current, receivedAt: performance.now() });
      };
      const pump = async () => {
        let failures = 0;
        while (!stopped && secret) {
          streamAbort = new AbortController();
          try {
            const response = await fetch(base.origin + '/v1/stream', { headers: { Authorization: 'Bearer ' + secret, Accept: 'text/event-stream', 'Last-Event-ID': String(lastSequence || 0) }, signal: streamAbort.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
            if (!response.ok || !response.body) throw new Error(`Stream returned ${response.status}.`);
            listener({ kind: 'stream-status', status: 'event stream', connected: true, lastSequence }); failures = 0;
            const reader = response.body.getReader(), decoder = new TextDecoder(); let buffer = '';
            while (!stopped) { const { value, done } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }).replaceAll('\r\n', '\n'); let at; while ((at = buffer.indexOf('\n\n')) >= 0) { const block = buffer.slice(0, at); buffer = buffer.slice(at + 2); if (!block.startsWith(':')) await parse(block); } }
          } catch (error) {
            if (stopped || error.name === 'AbortError') break;
            failures++; listener({ kind: 'stream-status', status: 'activity fallback', connected: false, error: error.message, lastSequence });
            try { const data = await request('/v1/activity?after=' + lastSequence); for (const event of data.events || []) await parse(`id: ${event.sequence}\nevent: activity\ndata: ${JSON.stringify(event)}`); } catch {}
            await new Promise(done => setTimeout(done, Math.min(3000, 250 * 2 ** failures)));
          }
        }
      };
      pump(); return () => { stopped = true; streamAbort?.abort(); };
    },
    dispose() { stopped = true; streamAbort?.abort(); secret = ''; }
  };
  return provider;
}
export function importedProvider(value) {
  const current = validateSnapshot(value);
  return { mode: 'import', repository: current.repository, snapshot: () => current, async readFile(path) { if (!Object.hasOwn(current.contents, path)) throw new Error('Source is not included in this snapshot. Connect the repository to load it.'); return current.contents[path]; }, dispose() {} };
}
