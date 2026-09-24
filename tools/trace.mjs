#!/usr/bin/env node
// tools/trace.mjs: walk a ledger event upstream through the signals and cell runs that
// produced it. core/ledger.mjs already has a trace(seq, depth), but it only names seqs;
// this attaches the cell kind at each hop and, where a signal crossed the connectome
// (rather than just being one cell's own emission), the edge weight and delay that
// carried it. See DESIGN.md section 12: "trace <seq> walks upstream ... to name what
// contributed."
//
// Usage: node tools/trace.mjs <snapshot-or-dir> --seq N [--depth 12] [--mermaid] [--json]
import { fileURLToPath } from 'node:url';

import {
  loadBrainAt, ledgerIndexFor, cellKindOf, parseArgs, makeStyler, padRight, hr,
} from './lib.mjs';

// ---------------------------------------------------------------- the trace itself
// A ledger causal chain alternates: a cell.run's `consumed` seqs are the signals it read;
// each signal's `from` is the cell.run that emitted it. Seqs only ever increase forward
// in time, so walking `consumed`/`from` backwards from a given seq is a walk over a DAG
// (no cycles are possible), bounded by `depth` hops.
//
// A signal's own emission (cell.run -> the signal it produced) is not a connectome wire,
// it is the same cell talking to the ledger about its own output port. The connectome
// only enters at the *next* hop, when that signal is delivered to a different cell: we
// look up the edge(s) from (emitting cell, its out port) to (consuming cell) and, when
// exactly one matches, report its weight and delay. The ledger does not record which
// connectome edge index carried a given delivery (see brain.mjs _tick: `consumed` is a
// flat seq list), so an ambiguous case (more than one edge with the same src/srcPort/dst)
// is reported as ambiguous rather than guessed at.
function connectomeEdgesBetween(brain, srcCellId, srcPort, dstCellId) {
  if (srcCellId == null || srcCellId === 'external' || dstCellId == null) return [];
  let a, b;
  try { a = brain.cell(srcCellId).idx; b = brain.cell(dstCellId).idx; } catch { return []; }
  const out = [];
  for (const e of brain.connectome.into(b)) {
    if (brain.connectome.src[e] === a && brain.connectome.srcPort[e] === srcPort) out.push(brain.connectome.edge(e));
  }
  return out;
}

function baseNode(brain, e) {
  return {
    seq: e.seq, t: e.t, type: e.type,
    cell: e.cell ?? null,
    kind: e.type === 'signal' ? (e.kind ?? null) : (e.cell ? cellKindOf(brain, e.cell) : null),
    port: e.port ?? null,
    consumed: e.type === 'cell.run' ? (e.consumed || []) : null,
  };
}

// Exported for programmatic use: traceTree(brain, seq, depth) -> { root, depth, tree, nodes, edges }.
// `tree` is the printable shape (root at the top, `up: [{ edge, node }]` are its causes,
// recursively). `nodes` and `edges` are the same graph flattened, for --json/--mermaid.
export function traceTree(brain, seq, depth = 12) {
  const idx = ledgerIndexFor(brain);
  const flatNodes = new Map();
  const edgeKey = (ed) => ed.from + '->' + ed.to + ':' + ed.via;
  const flatEdges = new Map();

  function build(s, d) {
    const e = idx.get(s);
    if (!e) return { seq: s, missing: true, up: [] };
    if (!flatNodes.has(s)) flatNodes.set(s, baseNode(brain, e));
    const node = { ...flatNodes.get(s), up: [] };
    if (d >= depth) { node.truncated = true; return node; }
    if (e.type === 'cell.run') {
      for (const cs of e.consumed || []) {
        const sigEv = idx.get(cs);
        const edgeMeta = { from: cs, to: s, via: 'consumed' };
        if (sigEv) {
          const matches = connectomeEdgesBetween(brain, sigEv.cell, sigEv.port, e.cell);
          if (matches.length === 1) { edgeMeta.w = matches[0].w; edgeMeta.delay = matches[0].delay; }
          else if (matches.length > 1) edgeMeta.ambiguous = matches.length;
        }
        flatEdges.set(edgeKey(edgeMeta), edgeMeta);
        node.up.push({ edge: edgeMeta, node: build(cs, d + 1) });
      }
    } else if (e.type === 'signal' && e.from != null) {
      const edgeMeta = { from: e.from, to: s, via: 'emit' };
      flatEdges.set(edgeKey(edgeMeta), edgeMeta);
      node.up.push({ edge: edgeMeta, node: build(e.from, d + 1) });
    }
    return node;
  }

  const tree = build(seq, 0);
  return { root: seq, depth, tree, nodes: [...flatNodes.values()].sort((a, b) => a.seq - b.seq), edges: [...flatEdges.values()] };
}

// ---------------------------------------------------------------- rendering
function nodeLabel(n, ST) {
  if (n.missing) return ST.red('seq ' + n.seq + ' (not in ledger)');
  const bits = [ST.cyan('#' + n.seq), ST.grey('t=' + n.t), ST.yellow(n.type)];
  if (n.cell) bits.push(ST.magenta(n.cell));
  if (n.kind) bits.push(ST.grey('(' + n.kind + ')'));
  if (n.port != null) bits.push(ST.grey('port=' + n.port));
  if (n.consumed && n.consumed.length) bits.push(ST.grey('consumed=[' + n.consumed.join(',') + ']'));
  return bits.join(' ');
}
function edgeLabel(edge, ST) {
  if (!edge) return '';
  if (edge.via === 'emit') return ST.grey('  (emits)');
  if (edge.w != null) return ST.grey('  via edge w=' + fmtW(edge.w) + ' delay=' + edge.delay);
  if (edge.ambiguous) return ST.grey('  via ' + edge.ambiguous + ' matching edges (ambiguous)');
  return ST.grey('  (no matching connectome edge)');
}
function fmtW(w) { return Number.isInteger(w) ? String(w) : w.toFixed(4); }

// Renders only the descendants (the "up" causes) of a node that was already printed by its
// parent, at one indent step deeper.
function renderIndentedChildren(node, ST, prefix) {
  const lines = [];
  const kids = node.up || [];
  kids.forEach((child, i) => {
    const last = i === kids.length - 1;
    const branch = last ? '  \\-- ' : '  |-- ';
    const childPrefix = prefix + (last ? '      ' : '  |   ');
    lines.push(prefix + branch + nodeLabel(child.node, ST) + edgeLabel(child.edge, ST));
    if (child.node.truncated) lines.push(childPrefix + ST.grey('... depth limit reached'));
    if (!child.node.missing) lines.push(...renderIndentedChildren(child.node, ST, childPrefix));
  });
  return lines;
}

function renderMermaid(result) {
  const lines = ['graph BT'];
  const safe = (s) => String(s).replace(/[^A-Za-z0-9_]/g, '_');
  for (const n of result.nodes) {
    const label = (n.cell ? n.cell + '\\n' : '') + n.type + ' #' + n.seq;
    lines.push('  n' + safe(n.seq) + '["' + label + '"]');
  }
  for (const e of result.edges) {
    const label = e.via === 'emit' ? 'emits' : (e.w != null ? 'w=' + fmtW(e.w) + ' d=' + e.delay : e.via);
    lines.push('  n' + safe(e.from) + ' --> |' + label + '| n' + safe(e.to));
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------- CLI
async function main(argv) {
  const { opts, pos } = parseArgs(argv, ['mermaid', 'json', 'color', 'help']);
  if (opts.help || !pos[0]) {
    process.stdout.write([
      'usage: node tools/trace.mjs <snapshot-or-dir> --seq N [--depth 12] [--mermaid] [--json]',
      '',
      '  <snapshot-or-dir>  a brain state dir, or a direct path to its snapshot.json',
      '  --seq N            the ledger seq to trace upstream from (required)',
      '  --depth N          max hops to walk upstream (default 12)',
      '  --mermaid          print a mermaid graph instead of the indented tree',
      '  --json             print { root, depth, nodes, edges } as JSON',
      '  --color            colorize the indented tree (off by default)',
    ].join('\n') + '\n');
    return opts.help ? 0 : 1;
  }
  if (opts.seq == null) { process.stderr.write('trace: --seq N is required\n'); return 1; }
  const seq = Number(opts.seq);
  if (!Number.isInteger(seq) || seq < 0) { process.stderr.write('trace: --seq must be a non-negative integer, got ' + opts.seq + '\n'); return 1; }
  const depth = Number.isFinite(Number(opts.depth)) ? Number(opts.depth) : 12;

  const brain = loadBrainAt(pos[0]);
  const result = traceTree(brain, seq, depth);

  if (opts.json) {
    process.stdout.write(JSON.stringify({ root: result.root, depth: result.depth, nodes: result.nodes, edges: result.edges }, null, 2) + '\n');
    return 0;
  }
  if (opts.mermaid) {
    process.stdout.write(renderMermaid(result) + '\n');
    return 0;
  }
  const ST = makeStyler(!!opts.color);
  const lines = [];
  lines.push(ST.bold('trace seq=' + seq + ' depth=' + depth) + ST.grey('  (' + result.nodes.length + ' nodes, ' + result.edges.length + ' edges)'));
  lines.push(hr());
  lines.push(nodeLabel(result.tree, ST));
  lines.push(...renderIndentedChildren(result.tree, ST, ''));
  process.stdout.write(lines.join('\n') + '\n');
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  main(process.argv.slice(2)).then((code) => process.exit(code)).catch((err) => { process.stderr.write('trace: ' + (err && err.message || err) + '\n'); process.exit(1); });
}
