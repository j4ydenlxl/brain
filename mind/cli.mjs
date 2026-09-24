#!/usr/bin/env node
// mind/cli.mjs: the instrument for the mind. Adding a command to bin/brain.mjs is not one
// line (every command there carries a usage string, a doc line, a json payload and a human
// renderer), so the mind gets its own entry point instead of a half built one there.
//
//   node mind/cli.mjs corpus                      byte counts of train and held out
//   node mind/cli.mjs train [--vocab 512]         train and print the bits per byte table
//   node mind/cli.mjs generate "prompt" [--temperature 0.8] [--top-k 40] [--tokens 64]
//   node mind/cli.mjs tick "text"                 run the language region inside a Brain
import { split } from './corpus.mjs';
import { MindModel } from './model.mjs';
import { generate } from './generate.mjs';

const argv = process.argv.slice(2);
const cmd = argv.shift() || 'help';
const pos = [], opts = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) opts[k] = true; else { opts[k] = v; i++; } }
  else pos.push(a);
}
const numOpt = (v, dflt) => (v === undefined || v === true ? dflt : Number(v));
const out = (s) => process.stdout.write(s + '\n');
const f = (x, n = 4) => Number(x).toFixed(n);

async function trainModel() {
  const data = split();
  const model = new MindModel({ vocabSize: numOpt(opts.vocab, 512), order: numOpt(opts.order, 4), bits: numOpt(opts.bits, 11), context: numOpt(opts.context, 4) });
  const learned = model.train(data.train);
  return { data, model, learned };
}

function table(data, learned, model, ev) {
  const size = model.sizeBytes();
  const rows = [
    ['corpus documents', String(data.documents)],
    ['train bytes', String(data.trainBytes) + ' in ' + data.trainFiles.length + ' files'],
    ['held out bytes', String(data.heldoutBytes) + ' in ' + data.heldoutFiles.length + ' files'],
    ['vocabulary', String(learned.vocab) + ' (' + learned.tokenizer.merges + ' learned merges over 256 bytes)'],
    ['train tokens', String(learned.trainTokens)],
    ['held out tokens', String(ev.tokens) + ' (' + f(ev.bytesPerToken, 3) + ' bytes per token)'],
    ['hv buckets used', learned.hv.buckets + ' of ' + learned.hv.capacity + ', ' + learned.hv.writes + ' writes'],
    ['mixture weights', 'ngram ' + f(learned.weights.ngram, 2) + '  hv ' + f(learned.weights.hv, 2) + '  unigram ' + f(learned.weights.uni, 2)],
    ['hv sharpness', f(ev.beta, 2) + ' (chosen on a dev slice of train)'],
    ['model bytes', String(size.total) + ' (tokenizer ' + size.tokenizer + ', codebook ' + size.codebook + ', ngram ' + size.ngram + ', hv ' + size.hv + ')'],
    ['tokenizer ms', String(learned.tokenizer.ms)],
    ['train ms', String(learned.trainMs)],
    ['tokens per second', f(ev.tokensPerSecond, 1)],
  ];
  const w = Math.max(...rows.map(r => r[0].length));
  for (const [k, v] of rows) out(k.padEnd(w) + '  ' + v);
  out('');
  out('bits per byte on held out (lower is better)');
  const b = ev.bitsPerByte, t = ev.bitsPerToken;
  const arms = ['uniform', 'unigram', 'ngram', 'hv', 'mixture'];
  out('  arm       bits/byte   bits/token   vs uniform');
  for (const a of arms) out('  ' + a.padEnd(9) + ' ' + f(b[a]).padStart(9) + '   ' + f(t[a]).padStart(10) + '   ' + f(b.uniform - b[a]).padStart(9));
}

if (cmd === 'corpus') {
  const data = split();
  out('documents ' + data.documents);
  out('train     ' + data.trainBytes + ' bytes in ' + data.trainFiles.length + ' files');
  out('held out  ' + data.heldoutBytes + ' bytes in ' + data.heldoutFiles.length + ' files');
  out('');
  out('held out files:');
  for (const file of data.heldoutFiles) out('  ' + file);
} else if (cmd === 'train') {
  const { data, model, learned } = await trainModel();
  const ev = model.evaluate(data.heldout);
  table(data, learned, model, ev);
} else if (cmd === 'generate') {
  const { data, model, learned } = await trainModel();
  const prompt = pos.join(' ') || 'The cell is ';
  const g = generate(model, prompt, {
    maxTokens: numOpt(opts.tokens, 64), temperature: numOpt(opts.temperature, 0.8),
    topK: numOpt(opts['top-k'], 40), seed: opts.seed === undefined || opts.seed === true ? 'mind:gen' : String(opts.seed),
  });
  out('vocabulary ' + learned.vocab + ', train bytes ' + data.trainBytes + ', ' + g.tokens + ' tokens at ' + f(g.tokensPerSecond, 1) + ' per second, ' + f(g.bitsPerToken) + ' bits per token');
  out('');
  out(g.full);
} else if (cmd === 'tick') {
  const { model } = await trainModel();
  const { Brain } = await import('../core/brain.mjs');
  const { registerMind, installLanguage, feed } = await import('./index.mjs');
  registerMind('default', model);
  const brain = new Brain({ name: 'mind', ledger: 'runs' });
  const ids = installLanguage(brain, { model: 'default' });
  const text = pos.join(' ') || 'the cell is a persistent computational object';
  const r = feed(brain, ids, text);
  out('fed ' + JSON.stringify(text));
  out('ticks ' + r.ticks + ', tokens scored ' + r.tokens + ', mean surprise ' + f(r.meanBits) + ' bits per token');
  out('assoc cell surprise field ' + f(brain.cell(ids.assoc).stats.surprise));
  out('');
  for (const p of r.predictions.slice(0, 12)) out('  saw ' + JSON.stringify(p.observedText) + ' p=' + f(p.pObserved, 5) + ' bits=' + f(p.bits, 3) + '  best guess ' + JSON.stringify(p.text));
} else {
  out('mind: our own language model, held as cells.');
  out('  node mind/cli.mjs corpus');
  out('  node mind/cli.mjs train [--vocab 512] [--order 4] [--bits 11] [--context 4]');
  out('  node mind/cli.mjs generate "prompt" [--tokens 64] [--temperature 0.8] [--top-k 40] [--seed s]');
  out('  node mind/cli.mjs tick "text"');
}
