// tools/footprint-probe.mjs: WHERE DOES THE POCKET FOOTPRINT GO, MODULE BY MODULE.
//
// bench/footprint.mjs measured a fixed cost of roughly 600 MB RSS at build for every organism
// size, which fails the declared 512 MB pocket budget at every size. That bench measures the
// whole brain; it cannot say which module holds the floor. This probe answers that question by
// importing ONE module at a time in a BRAND NEW child process and printing the rss and heapUsed
// delta that import cost, so no module's cost is measured on top of another's.
//
// The module list is the import graph of bin/brain.mjs: its five node: builtins and its two
// eager project imports, plus the three modules it loads on first use (cli/ops.mjs,
// cli/control.mjs, cli/run.mjs) and everything those reach, including seeds/whole.mjs, which is
// the module bench/footprint.mjs itself builds from. A dynamic import('...') with a literal
// specifier counts as an edge: that is how bin/brain.mjs reaches its heavy half.
//
// Two figures per module:
//   rssAlone     the rss delta of importing that module and nothing else, in its own process.
//                This is the module plus everything it imports: a leaf's own cost, a root's
//                whole subtree.
//   rssOverDeps  rssAlone minus the largest rssAlone among its direct project dependencies.
//                A module whose deps are all cheap and whose own number is large is holding the
//                memory itself. This is an attribution, not a measurement, and is labelled so.
//
//   node tools/footprint-probe.mjs [--json] [--repeat 1] [--only core/simd.mjs,...]
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const SELF = fileURLToPath(import.meta.url);
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const has = (k) => args.includes('--' + k);
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const mb = (b) => Number((b / 1048576).toFixed(1));
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

export const PROBE_ROOT = 'bin/brain.mjs';

// ---------------------------------------------------------------- the import graph
// A deliberately small scanner: it reads the source text and takes every specifier that a
// static import or a literal dynamic import names. It is not a parser, so it also sees a
// specifier inside a comment or a string; that only ever adds a module to the probe, and a
// module that does not resolve on disk is dropped, so an over-read cannot invent a number.
const SPEC = /(?:^|[^\w$.])import\s*(?:[^'"]*?\sfrom\s*)?['"]([^'"]+)['"]|(?:^|[^\w$.])import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

export function specifiersOf(source) {
  const out = [];
  for (const m of source.matchAll(SPEC)) { const s = m[1] || m[2]; if (s) out.push(s); }
  return out;
}

// Walks the graph from bin/brain.mjs. Returns [{id, file, deps}] in discovery order, where a
// dep is another project module's id and a node: builtin keeps its specifier as its id.
export function walkGraph(rootFile) {
  const seen = new Map();
  const queue = [rootFile];
  while (queue.length) {
    const file = queue.shift();
    const id = rel(file);
    if (seen.has(id)) continue;
    let src = '';
    try { src = readFileSync(file, 'utf8'); } catch { continue; }
    const deps = [];
    for (const spec of specifiersOf(src)) {
      if (spec.startsWith('node:')) {
        if (!deps.includes(spec)) deps.push(spec);
        if (!seen.has(spec)) seen.set(spec, { id: spec, file: null, deps: [], builtin: true });
        continue;
      }
      if (!spec.startsWith('.')) continue; // this project has no dependencies; nothing else resolves
      const resolved = path.resolve(path.dirname(file), spec);
      if (!existsSync(resolved)) continue;
      const depId = rel(resolved);
      if (!deps.includes(depId)) deps.push(depId);
      queue.push(resolved);
    }
    seen.set(id, { id, file, deps, builtin: false });
  }
  return [...seen.values()];
}

// ================================================================== child mode
// One module, imported in a process that has done nothing else, printing one JSON line on
// stdout. The baseline is read in this same process immediately before the import, so the
// delta never carries another module's cost or another machine's node startup.
async function runChildProbe() {
  const id = String(opt('module', ''));
  const spec = id.startsWith('node:') ? id : pathToFileURL(path.join(ROOT, id)).href;
  const before = process.memoryUsage();
  const t0 = Number(process.hrtime.bigint()) / 1e6;
  let error = null;
  try { await import(spec); } catch (e) { error = String((e && e.message) || e); }
  const importMs = Number(process.hrtime.bigint()) / 1e6 - t0;
  const after = process.memoryUsage();
  process.stdout.write(JSON.stringify({
    id, error,
    importMs: Number(importMs.toFixed(1)),
    rssBefore: mb(before.rss), rssAfter: mb(after.rss), rssDelta: mb(after.rss - before.rss),
    heapBefore: mb(before.heapUsed), heapAfter: mb(after.heapUsed), heapDelta: mb(after.heapUsed - before.heapUsed),
    externalDelta: mb(after.external - before.external),
    arrayBuffersDelta: mb(after.arrayBuffers - before.arrayBuffers),
  }) + '\n');
}

if (isMain && has('child-probe')) { await runChildProbe(); process.exit(0); }

// ================================================================== parent mode
// Exported so bench/footprint.mjs can carry the probe table into its verdict without
// re-implementing the spawn loop, and so the test can run a two module probe cheaply.
export function probeModules(ids, { repeat = 1, env = null } = {}) {
  const rows = [];
  for (const id of ids) {
    const runs = [];
    for (let r = 0; r < repeat; r++) {
      const res = spawnSync(process.execPath, [SELF, '--child-probe', '--module', id], { encoding: 'utf8', cwd: ROOT, maxBuffer: 1024 * 1024 * 16, env: env ? { ...process.env, ...env } : process.env });
      if (res.status !== 0) { runs.push({ id, error: 'child exited ' + res.status + ': ' + String(res.stderr || '').slice(-400) }); continue; }
      const line = String(res.stdout || '').trim().split('\n').filter(Boolean).pop();
      if (!line) { runs.push({ id, error: 'no JSON line on stdout' }); continue; }
      try { runs.push(JSON.parse(line)); } catch (e) { runs.push({ id, error: 'bad JSON: ' + e.message }); }
    }
    // repeat > 1 keeps the median run, so one noisy process cannot set a published number
    const ok = runs.filter((r) => !r.error);
    if (!ok.length) { rows.push({ id, error: runs[0] ? runs[0].error : 'no run', runs: runs.length }); continue; }
    ok.sort((a, b) => a.rssDelta - b.rssDelta);
    rows.push({ ...ok[Math.floor(ok.length / 2)], runs: ok.length });
  }
  return rows;
}

// rssOverDeps: an attribution, not a measurement. See the header.
export function attribute(rows, graph) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const deps = new Map(graph.map((n) => [n.id, n.deps]));
  for (const r of rows) {
    if (r.error) continue;
    let worst = 0;
    for (const d of deps.get(r.id) || []) {
      const dr = byId.get(d);
      if (dr && !dr.error && dr.rssDelta > worst) worst = dr.rssDelta;
    }
    r.depsMaxRss = Number(worst.toFixed(1));
    r.rssOverDeps = Number((r.rssDelta - worst).toFixed(1));
  }
  return rows;
}

export function probeTable({ repeat = 1, only = null, env = null } = {}) {
  const graph = walkGraph(path.join(ROOT, PROBE_ROOT));
  const ids = (only && only.length) ? only : graph.map((n) => n.id);
  const rows = attribute(probeModules(ids, { repeat, env }), graph);
  const bare = probeModules(['node:path'], { repeat, env })[0]; // a builtin node already loaded: this instrument's own floor
  return { root: PROBE_ROOT, modules: graph.length, repeat, bareRssDelta: bare && !bare.error ? bare.rssDelta : null, rows };
}

/**
 * The same ids under two environments, INTERLEAVED id by id and repeat by repeat, so a
 * machine that gets busier halfway through moves both arms and not one. `arms` is
 * {name: envObject}; the answer is {name: [row, ...]} with the rows in the order of ids.
 */
export function probeArms(ids, arms, { repeat = 1 } = {}) {
  const out = {}, names = Object.keys(arms);
  for (const name of names) out[name] = ids.map((id) => ({ id, runs: [] }));
  for (let r = 0; r < repeat; r++) {
    for (let i = 0; i < ids.length; i++) {
      for (const name of names) {
        const row = probeModules([ids[i]], { repeat: 1, env: arms[name] })[0];
        out[name][i].runs.push(row);
      }
    }
  }
  for (const name of names) {
    out[name] = out[name].map((slot) => {
      const ok = slot.runs.filter((x) => x && !x.error);
      if (!ok.length) return { id: slot.id, error: slot.runs[0] ? slot.runs[0].error : 'no run' };
      ok.sort((a, b) => a.rssDelta - b.rssDelta);
      return { ...ok[Math.floor(ok.length / 2)], runs: ok.length, arm: name };
    });
  }
  return out;
}

if (isMain) {
  const repeat = Number(opt('repeat', 1));
  const only = opt('only', '') ? String(opt('only', '')).split(',').map((s) => s.trim()).filter(Boolean) : null;
  const t = probeTable({ repeat, only });
  const sorted = [...t.rows].filter((r) => !r.error).sort((a, b) => b.rssDelta - a.rssDelta);
  if (has('json')) {
    process.stdout.write(JSON.stringify(t, null, 2) + '\n');
  } else {
    console.log('probe of ' + t.root + ': ' + t.modules + ' modules in the graph, ' + t.rows.length + ' measured, ' + repeat + ' run(s) each, instrument floor (node:path alone) ' + t.bareRssDelta + ' MB rss');
    console.log('module'.padEnd(30) + 'rssAlone'.padStart(10) + 'overDeps'.padStart(10) + 'heap'.padStart(9) + 'external'.padStart(10) + 'arrBuf'.padStart(9) + 'ms'.padStart(9));
    for (const r of sorted) {
      console.log(r.id.padEnd(30) + String(r.rssDelta).padStart(10) + String(r.rssOverDeps).padStart(10) + String(r.heapDelta).padStart(9) + String(r.externalDelta).padStart(10) + String(r.arrayBuffersDelta).padStart(9) + String(r.importMs).padStart(9));
    }
    for (const r of t.rows) if (r.error) console.log(r.id + ': NO, ' + r.error);
  }
}
