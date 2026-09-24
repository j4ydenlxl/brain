// lab/cli.mjs : one door to the research instrument. Every subcommand prints numbers that a
// file on disk can be checked against, and nothing here computes a number it does not print.
//
//   node lab/cli.mjs list                        the shipped experiments and their verdicts
//   node lab/cli.mjs run <name|all> [--json]     run an experiment, write lab/verdicts/<name>.json
//   node lab/cli.mjs verdict <name> [--json]     print a verdict that was already written
//   node lab/cli.mjs replay <dir> [--ticks N]    deterministic replay from a snapshot + ledger
//   node lab/cli.mjs compare <a> <b> [--buckets] compare two state directories
//   node lab/cli.mjs cost [--scale N]            the cost instrument, writes bench/verdicts/cost.json
//   node lab/cli.mjs integrate <name>            propose a confirmed experiment through the gate
import { fileURLToPath } from 'node:url';
import { parseArgs, renderTable } from '../tools/lib.mjs';
import { EXPERIMENTS, EXPERIMENT_NAMES, loadExperiment } from './experiments/index.mjs';
import { run, renderVerdict, readVerdict, listVerdicts, VERDICTS_DIR } from './experiment.mjs';

const BOOLS = ['json', 'quiet', 'no-write'];

export async function cmdList(opts = {}) {
  const written = new Map(listVerdicts().map((v) => [v.name, v]));
  const rows = EXPERIMENT_NAMES.map((name) => {
    const v = written.get(name);
    return {
      name,
      metric: EXPERIMENTS[name].metric,
      verdict: v ? v.verdict : 'not run',
      effect: v ? v.effect.mean : '',
      share: v ? v.permutation.share : '',
      seeds: v ? v.k : '',
    };
  });
  for (const v of written.values()) if (!EXPERIMENTS[v.name]) rows.push({ name: v.name, metric: v.metric, verdict: v.verdict, effect: v.effect.mean, share: v.permutation.share, seeds: v.k });
  if (opts.json) return { rows, verdictsDir: VERDICTS_DIR, json: JSON.stringify(rows, null, 2) };
  const text = renderTable([
    { key: 'name', label: 'experiment', width: 18 },
    { key: 'metric', label: 'metric', width: 20 },
    { key: 'verdict', label: 'verdict', width: 11 },
    { key: 'effect', label: 'effect', width: 12, align: 'r' },
    { key: 'share', label: 'share', width: 11, align: 'r' },
    { key: 'seeds', label: 'seeds', width: 7, align: 'r' },
  ], rows);
  return { rows, verdictsDir: VERDICTS_DIR, text: text + '\nverdicts in ' + VERDICTS_DIR };
}

export async function cmdRun(name, opts = {}) {
  const names = !name || name === 'all' ? EXPERIMENT_NAMES : [name];
  const out = [];
  for (const n of names) {
    const exp = await loadExperiment(n);
    out.push(await run(exp, { write: opts['no-write'] ? false : true }));
  }
  return out;
}

export async function main(argv) {
  const { opts, pos } = parseArgs(argv, BOOLS);
  const cmd = pos[0] || 'list';
  const w = (s) => process.stdout.write(s + '\n');
  switch (cmd) {
    case 'list': {
      const r = await cmdList(opts);
      w(opts.json ? r.json : r.text);
      return 0;
    }
    case 'run': {
      const records = await cmdRun(pos[1], opts);
      if (opts.json) { w(JSON.stringify(records, null, 2)); return records.every((r) => r.verdict !== 'error') ? 0 : 1; }
      for (const r of records) { w(renderVerdict(r)); w(''); }
      w('verdicts: ' + records.map((r) => r.name + '=' + r.verdict).join('  '));
      return 0;
    }
    case 'verdict': {
      if (!pos[1]) throw new Error('lab verdict: name required, one of ' + EXPERIMENT_NAMES.join(', '));
      const v = readVerdict(pos[1]);
      w(opts.json ? JSON.stringify(v, null, 2) : renderVerdict(v));
      return 0;
    }
    case 'replay': {
      if (!pos[1]) throw new Error('lab replay: a state directory is required');
      const { replay, renderReplay } = await import('./replay.mjs');
      const r = replay(pos[1], { ticks: opts.ticks === undefined ? undefined : Number(opts.ticks) });
      w(opts.json ? JSON.stringify(r, null, 2) : renderReplay(r));
      return r.ok ? 0 : 1;
    }
    case 'compare': {
      if (!pos[1] || !pos[2]) throw new Error('lab compare: two state directories are required');
      const { compareStates, renderCompare, DEFAULT_BUCKETS } = await import('./compare.mjs');
      const c = compareStates(pos[1], pos[2], { labels: [pos[1], pos[2]], buckets: opts.buckets ? Number(opts.buckets) : DEFAULT_BUCKETS });
      w(opts.json ? JSON.stringify({ ...c, diff: undefined }, null, 2) : renderCompare(c));
      return 0;
    }
    case 'cost': {
      const { measureCost, renderCost } = await import('./cost.mjs');
      const r = await measureCost({ scale: opts.scale ? Number(opts.scale) : 1, seed: opts.seed ? String(opts.seed) : undefined, write: !opts['no-write'] });
      w(opts.json ? JSON.stringify(r, null, 2) : renderCost(r));
      return r.external.networkCalls === 0 ? 0 : 1;
    }
    case 'integrate': {
      if (!pos[1]) throw new Error('lab integrate: a verdict name is required');
      const [{ Brain }, { proposeIntegration, renderIntegration }] = await Promise.all([import('../core/brain.mjs'), import('./integrate.mjs')]);
      const brain = new Brain({ name: 'lab.integrate', seed: 'lab:integrate', ledger: 'full' });
      const r = proposeIntegration(brain, { name: pos[1] });
      w(opts.json ? JSON.stringify({ ...r, proposal: { ...r.proposal, evidence: undefined } }, null, 2) : renderIntegration(r));
      return r.approved ? 0 : 1;
    }
    default:
      throw new Error('lab: unknown command ' + cmd + '. one of list, run, verdict, replay, compare, cost, integrate');
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main(process.argv.slice(2)).then((c) => process.exit(c)).catch((e) => { process.stderr.write('lab: ' + (e && e.message || e) + '\n'); process.exit(2); });
