// cli/format.mjs: THE TERMINAL SURFACE. His manual says the system is largely CLI based,
// so the terminal is the primary instrument: fixed width tables, a compact one line summary,
// and a full report. Colour is ANSI only (no dependency) and switches itself off when stdout
// is not a TTY, when NO_COLOR is set, or when --no-color is passed.

const ANSI = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', magenta: '\x1b[35m', cyan: '\x1b[36m', grey: '\x1b[90m',
};
const ANSI_RE = /\x1b\[[0-9;]*m/g;

export function visible(s) { return String(s).replace(ANSI_RE, ''); }
export function width(s) { return visible(s).length; }

export function colorOn(opts = {}) {
  if (opts['no-color'] || opts.noColor === true) return false;
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stdout.isTTY);
}

export function styler(on) {
  const mk = (code) => (on ? (s) => code + String(s) + ANSI.reset : (s) => String(s));
  return {
    on,
    bold: mk(ANSI.bold), dim: mk(ANSI.dim), grey: mk(ANSI.grey),
    red: mk(ANSI.red), green: mk(ANSI.green), yellow: mk(ANSI.yellow),
    blue: mk(ANSI.blue), magenta: mk(ANSI.magenta), cyan: mk(ANSI.cyan),
    plain: (s) => String(s),
  };
}
export const NO_STYLE = styler(false);

// ---------------------------------------------------------------- JSON that never throws
// Snapshots and cell state carry BigInt rationals and typed arrays. Machine output has to
// survive both, so every value is coerced before JSON.stringify sees it.
export function jsonSafe(v, depth = 0) {
  if (v === null || v === undefined) return null;
  const t = typeof v;
  if (t === 'bigint') return v.toString();
  if (t === 'number') return Number.isFinite(v) ? v : String(v);
  if (t === 'string' || t === 'boolean') return v;
  if (t === 'function') return '[function ' + (v.name || 'anonymous') + ']';
  if (t === 'symbol') return String(v);
  if (ArrayBuffer.isView(v)) return { $typed: v.constructor.name, length: v.length, head: Array.from(v.subarray(0, Math.min(8, v.length))) };
  if (depth > 24) return '[depth]';
  if (Array.isArray(v)) return v.map((x) => jsonSafe(x, depth + 1));
  if (v instanceof Map) return jsonSafe([...v.entries()], depth + 1);
  if (v instanceof Set) return jsonSafe([...v.values()], depth + 1);
  if (v instanceof Error) return { error: v.message };
  const o = {};
  for (const [k, val] of Object.entries(v)) o[k] = jsonSafe(val, depth + 1);
  return o;
}
export function stringify(v, pretty = true) {
  return JSON.stringify(jsonSafe(v), null, pretty ? 2 : 0);
}

// ---------------------------------------------------------------- tables
// columns: ['a', 'b'] or [{ key, label, align: 'left'|'right', value: (row) => any }]
export function table(columns, rows, st = NO_STYLE) {
  const cols = columns.map((c) => (typeof c === 'string' ? { key: c, label: c } : { align: 'left', label: c.key, ...c }));
  const body = rows.map((r) => cols.map((c) => {
    const v = typeof c.value === 'function' ? c.value(r) : r[c.key];
    return v === undefined || v === null ? '' : String(v);
  }));
  const w = cols.map((c, i) => Math.max(width(c.label), ...body.map((r) => width(r[i])), 1));
  const pad = (s, n, align) => {
    const gap = ' '.repeat(Math.max(0, n - width(s)));
    return align === 'right' ? gap + s : s + gap;
  };
  const head = cols.map((c, i) => st.bold(pad(c.label, w[i], c.align))).join('  ');
  const rule = st.grey(cols.map((c, i) => '-'.repeat(w[i])).join('  '));
  const lines = body.map((r) => cols.map((c, i) => pad(r[i], w[i], c.align)).join('  '));
  return [head, rule, ...lines].join('\n');
}

export function kv(obj, st = NO_STYLE, indent = '  ') {
  const keys = Object.keys(obj);
  if (!keys.length) return indent + st.grey('(empty)');
  const w = Math.max(...keys.map((k) => k.length));
  return keys.map((k) => indent + st.grey(k.padEnd(w)) + '  ' + fmtValue(obj[k], st)).join('\n');
}

export function fmtValue(v, st = NO_STYLE) {
  if (v === null || v === undefined) return st.grey('null');
  if (typeof v === 'number') return st.cyan(num(v));
  if (typeof v === 'boolean') return v ? st.green('true') : st.red('false');
  if (typeof v === 'bigint') return st.cyan(v.toString());
  if (Array.isArray(v)) return v.length <= 8 ? '[' + v.map((x) => fmtValue(x, st)).join(', ') + ']' : '[' + v.length + ' items]';
  if (typeof v === 'object') return JSON.stringify(jsonSafe(v));
  return String(v);
}

export function num(n) {
  if (!Number.isFinite(n)) return String(n);
  if (Number.isInteger(n)) return n.toLocaleString('en-US');
  if (Math.abs(n) >= 1000) return n.toFixed(1);
  if (Math.abs(n) >= 1) return n.toFixed(3);
  return n.toPrecision(3);
}
export function ms(x) { return Number.isFinite(x) ? (x >= 1000 ? (x / 1000).toFixed(2) + 's' : x.toFixed(2) + 'ms') : String(x); }
export function truncate(s, n) { s = String(s); return s.length <= n ? s : s.slice(0, Math.max(0, n - 1)) + '…'; }
export function hr(n = 64, st = NO_STYLE) { return st.grey('-'.repeat(n)); }
export function bar(value, max, w = 20, st = NO_STYLE) {
  const filled = max > 0 ? Math.max(0, Math.min(w, Math.round((value / max) * w))) : 0;
  return st.cyan('#'.repeat(filled)) + st.grey('.'.repeat(w - filled));
}

// ---------------------------------------------------------------- the one line summary
// Everything that matters about a brain on a single line, for a prompt or a log.
export function oneLine(s, st = NO_STYLE) {
  const parts = [
    st.bold(s.name),
    't=' + num(s.t),
    'gen=' + num(s.gen),
    'cells=' + num(s.cells),
    'edges=' + num(s.liveEdges) + '/' + num(s.edges),
    'runs=' + num(s.stats?.runs ?? 0),
    'sig=' + num(s.stats?.signals ?? 0),
    'out=' + num(s.outbox ?? 0),
    'pend=' + num(s.gate?.held ?? 0),
    'seq=' + num(s.ledger ?? 0),
  ];
  return parts.join(' ');
}

// ---------------------------------------------------------------- the full report
export function report(p, st = NO_STYLE) {
  const s = p.summary;
  const out = [];
  out.push(st.bold('BRAIN ') + st.magenta(s.name) + '  ' + (p.live ? st.green('live') + st.grey(' @ ' + (p.control?.url || '?') + ' pid ' + (p.control?.pid ?? '?')) : st.grey('snapshot')) + (p.paused ? '  ' + st.yellow('PAUSED') : '') + (p.seed ? st.grey('  seed=' + p.seed) : ''));
  out.push(hr(72, st));
  out.push(kv({
    t: s.t, gen: s.gen, cells: s.cells,
    edges: s.edges, liveEdges: s.liveEdges,
    ticks: s.stats.ticks, runs: s.stats.runs, signals: s.stats.signals, delivered: s.stats.delivered,
    outbox: s.outbox, ...(s.mail !== undefined ? { mail: s.mail } : {}), ledgerSeq: s.ledger,
  }, st));
  if (s.mailTop && s.mailTop.length) out.push(st.grey('  mail waits at ' + s.mailTop.map((m) => m.id + ' ' + m.mail).join(', ')));
  out.push('');
  out.push(st.bold('regions'));
  const regions = Object.entries(s.regions).map(([name, r]) => ({ region: name, cells: r.cells, circuits: r.circuits, budget: r.budget }));
  out.push(table([{ key: 'region' }, { key: 'cells', align: 'right' }, { key: 'circuits', align: 'right' }, { key: 'budget', align: 'right' }], regions, st));
  out.push('');
  out.push(st.bold('scheduler') + st.grey('  (attention economy)'));
  out.push(kv(s.scheduler, st));
  out.push(st.bold('gate') + st.grey('  (computation is not authority)'));
  out.push(kv(s.gate, st));
  out.push(st.bold('connectome'));
  out.push(kv(s.connectome, st));
  if (p.ledgerCounts && Object.keys(p.ledgerCounts).length) {
    out.push('');
    out.push(st.bold('ledger events on disk'));
    out.push(kv(p.ledgerCounts, st));
  }
  if (p.labels && p.labels.length) {
    out.push('');
    out.push(st.bold('labelled snapshots'));
    out.push(table([{ key: 'label' }, { key: 'bytes', align: 'right' }, { key: 'saved' }], p.labels, st));
  }
  if (p.proposals && p.proposals.length) {
    out.push('');
    out.push(st.bold('pending proposals') + st.grey('  (approve <name> <id>)'));
    out.push(table([{ key: 'id', align: 'right' }, { key: 'kind' }, { key: 'by' }, { key: 'why' }], p.proposals, st));
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- command renderers
export function renderCell(c, st = NO_STYLE) {
  const out = [];
  out.push(st.bold('cell ') + st.magenta(c.id) + st.grey('  #' + c.idx + '  ' + c.kind) + '  ' + st.grey(c.region + '/' + c.circuit));
  if (c.doc) out.push(st.grey('  ' + c.doc));
  out.push(hr(72, st));
  out.push(kv({ period: c.periodLabel, priority: c.policy.priority, budget: c.policy.budget, backend: c.policy.backend, learn: c.policy.learn ?? 'none' }, st));
  out.push(st.bold('ports'));
  out.push(table([{ key: 'dir' }, { key: 'i', align: 'right' }, { key: 'name' }, { key: 'kinds' }, { key: 'mail', align: 'right' }], c.portRows, st));
  out.push(st.bold('stats'));
  out.push(kv(c.stats, st));
  out.push(st.bold('edges out') + st.grey(' (' + c.edgesOut.length + ')'));
  out.push(c.edgesOut.length ? table([{ key: 'e', align: 'right' }, { key: 'to' }, { key: 'w', align: 'right' }, { key: 'delay', align: 'right' }, { key: 'usage', align: 'right' }, { key: 'conf', align: 'right' }, { key: 'state' }], c.edgesOut, st) : st.grey('  (none)'));
  out.push(st.bold('edges in') + st.grey(' (' + c.edgesIn.length + ')'));
  out.push(c.edgesIn.length ? table([{ key: 'e', align: 'right' }, { key: 'from' }, { key: 'w', align: 'right' }, { key: 'delay', align: 'right' }, { key: 'usage', align: 'right' }, { key: 'conf', align: 'right' }, { key: 'state' }], c.edgesIn, st) : st.grey('  (none)'));
  out.push(st.bold('state') + st.grey('  (serialized)'));
  out.push('  ' + truncate(JSON.stringify(jsonSafe(c.state)), 400));
  if (c.memory) { out.push(st.bold('memory')); out.push(kv(c.memory, st)); }
  return out.join('\n');
}

export function renderSignals(sigs, st = NO_STYLE, title = 'outbox') {
  if (!sigs.length) return st.grey('(' + title + ' empty)');
  return st.bold(title) + ' (' + sigs.length + ')\n' + table(
    [{ key: 't', align: 'right' }, { key: 'cell' }, { key: 'port' }, { key: 'kind' }, { key: 'text' }],
    sigs.map((s) => ({ ...s, text: truncate(s.text, 80) })), st,
  );
}

export function renderTrace(tr, st = NO_STYLE) {
  const out = [st.bold('trace ') + st.magenta('#' + tr.root) + st.grey('  depth ' + tr.depth + ', ' + tr.nodes.length + ' nodes')];
  out.push(hr(72, st));
  for (const n of tr.nodes) {
    const pad = '  '.repeat(n.depth);
    let line = pad + st.grey('#' + String(n.seq).padStart(6));
    if (n.type === 'cell.run') {
      line += ' ' + st.cyan('run') + ' ' + st.magenta(n.cell) + st.grey(' [' + (n.kind || '?') + ' ' + (n.region || '?') + '/' + (n.circuit || '?') + ']');
      if (n.consumed && n.consumed.length) line += st.grey(' consumed ' + n.consumed.length);
      if (n.memory) line += st.grey(' memory ' + n.memory);
      if (n.surprise) line += st.yellow(' surprise ' + num(n.surprise));
    } else if (n.type === 'signal') {
      line += ' ' + st.green('sig') + ' ' + (n.cell === 'external' ? st.yellow('external') : st.magenta(n.cell)) + st.grey('.' + (n.portName ?? n.port) + ' ' + n.sigKind);
      if (n.edge) line += st.grey(' via e' + n.edge.e + ' w=' + num(n.edge.w) + (n.edge.delay ? ' d=' + n.edge.delay : ''));
      if (n.hash) line += st.grey(' #' + n.hash);
    } else {
      line += ' ' + st.grey(n.type);
    }
    out.push(line);
  }
  if (tr.missing.length) out.push(st.yellow('  missing seqs: ' + tr.missing.join(', ')));
  return out.join('\n');
}

export function renderLedger(rows, st = NO_STYLE) {
  if (!rows.length) return st.grey('(no ledger events)');
  return table([
    { key: 'seq', align: 'right' }, { key: 't', align: 'right' }, { key: 'type' },
    { key: 'what' },
  ], rows, st);
}

export function renderDiff(d, st = NO_STYLE) {
  const out = [];
  out.push(st.bold('diff ') + st.magenta(d.a) + st.grey(' -> ') + st.magenta(d.b));
  out.push(hr(72, st));
  out.push(kv({
    t: d.clock.a.t + ' -> ' + d.clock.b.t + '  (' + signed(d.clock.b.t - d.clock.a.t) + ')',
    gen: d.clock.a.gen + ' -> ' + d.clock.b.gen + '  (' + signed(d.clock.b.gen - d.clock.a.gen) + ')',
    cells: d.cells.a + ' -> ' + d.cells.b,
    edges: d.edges.a + ' -> ' + d.edges.b,
  }, st));
  out.push('');
  out.push(st.bold('cells changed') + st.grey(' (' + d.cellChanges.length + ' of ' + d.cells.b + ')'));
  out.push(d.cellChanges.length
    ? table([{ key: 'cell' }, { key: 'runs' }, { key: 'fired' }, { key: 'skips' }, { key: 'errors' }, { key: 'surprise' }], d.cellChanges.map(fmtChange), st)
    : st.grey('  (no cell stats moved)'));
  if (d.cellsAdded.length) out.push(st.green('  added cells: ') + d.cellsAdded.join(', '));
  if (d.cellsRemoved.length) out.push(st.red('  removed cells: ') + d.cellsRemoved.join(', '));
  out.push('');
  out.push(st.bold('edges'));
  if (d.edgesAdded.length) out.push(st.green('  added   ') + d.edgesAdded.map((e) => e.key).join(', '));
  if (d.edgesRemoved.length) out.push(st.red('  removed ') + d.edgesRemoved.map((e) => e.key).join(', '));
  out.push(d.weightChanges.length
    ? table([{ key: 'edge' }, { key: 'wa', label: 'w(a)', align: 'right' }, { key: 'wb', label: 'w(b)', align: 'right' }, { key: 'dw', label: 'delta', align: 'right' }], d.weightChanges.map((w) => ({ edge: w.key, wa: num(w.a), wb: num(w.b), dw: signed(w.b - w.a) })), st)
    : st.grey('  (no weights moved)'));
  return out.join('\n');
}
function fmtChange(c) {
  const f = (k) => (c[k] ? c[k][0] + ' -> ' + c[k][1] : '');
  return { cell: c.cell, runs: f('runs'), fired: f('fired'), skips: f('skips'), errors: f('errors'), surprise: f('surprise') };
}
export function signed(x) { return (x > 0 ? '+' : '') + num(x); }
