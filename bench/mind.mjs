// bench/mind.mjs: the mind, measured. Bits per byte for all five arms on held out text, the
// training time, the model size in bytes broken down by part, and the inference throughput.
// Writes bench/verdicts/mind.json. Every number in notes/mind.md comes from this file.
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { split } from '../mind/corpus.mjs';
import { MindModel } from '../mind/model.mjs';
import { generate } from '../mind/generate.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const f = (x, n = 4) => Number(x).toFixed(n);
const out = (s) => process.stdout.write(s + '\n');

const data = split();
out('corpus: ' + data.documents + ' documents, train ' + data.trainBytes + ' bytes in ' + data.trainFiles.length + ' files, held out ' + data.heldoutBytes + ' bytes in ' + data.heldoutFiles.length + ' files');

const model = new MindModel({ vocabSize: 512, order: 4, bits: 11, context: 4 });
const t0 = Date.now();
const learned = model.train(data.train);
const trainMs = Date.now() - t0;
out('tokenizer: ' + learned.vocab + ' tokens (' + learned.tokenizer.merges + ' learned merges over the 256 bytes) in ' + learned.tokenizer.ms + ' ms, ' + learned.tokenizer.startTokens + ' bytes to ' + learned.tokenizer.endTokens + ' tokens');
out('train: ' + learned.trainTokens + ' tokens in ' + trainMs + ' ms, hv buckets ' + learned.hv.buckets + ' of ' + learned.hv.capacity + ' with ' + learned.hv.writes + ' writes');
out('chosen on a dev slice of train: hv sharpness ' + f(learned.hv.beta, 2) + ', mixture weights ngram ' + f(learned.weights.ngram, 2) + ' hv ' + f(learned.weights.hv, 2) + ' unigram ' + f(learned.weights.uni, 2));

const ev = model.evaluate(data.heldout);
const size = model.sizeBytes();
out('');
out('BITS PER BYTE on held out (' + data.heldoutBytes + ' bytes, ' + ev.tokens + ' tokens, ' + f(ev.bytesPerToken, 3) + ' bytes per token)');
out('  arm       bits/byte   bits/token   vs uniform');
const arms = ['uniform', 'unigram', 'ngram', 'hv', 'mixture'];
for (const a of arms) out('  ' + a.padEnd(9) + ' ' + f(ev.bitsPerByte[a]).padStart(9) + '   ' + f(ev.bitsPerToken[a]).padStart(10) + '   ' + f(ev.bitsPerByte.uniform - ev.bitsPerByte[a]).padStart(9));
out('');
out('model bytes ' + size.total + ' = tokenizer ' + size.tokenizer + ' + codebook ' + size.codebook + ' + ngram ' + size.ngram + ' + hv ' + size.hv);
out('inference ' + f(ev.tokensPerSecond, 1) + ' tokens per second (' + ev.tokens + ' tokens in ' + ev.evalMs + ' ms)');

const g = generate(model, 'The cell is ', { maxTokens: 48, temperature: 0.8, topK: 40, seed: 'bench' });
out('generation ' + f(g.tokensPerSecond, 1) + ' tokens per second, ' + f(g.bitsPerToken) + ' bits per token');
out('sample: ' + JSON.stringify(g.full));

const verdict = {
  at: new Date().toISOString(), node: process.version,
  corpus: { documents: data.documents, trainBytes: data.trainBytes, heldoutBytes: data.heldoutBytes, trainFiles: data.trainFiles.length, heldoutFiles: data.heldoutFiles.length, heldoutFileList: data.heldoutFiles },
  tokenizer: learned.tokenizer, vocab: learned.vocab, d: model.tok.d,
  train: { tokens: learned.trainTokens, ms: trainMs, devStart: learned.devStart, ngramContexts: learned.ngram, hv: learned.hv },
  chosenOnDev: { beta: learned.hv.beta, weights: learned.weights, devBits: learned.devBits },
  heldout: { bytes: ev.bytes, tokens: ev.tokens, bytesPerToken: ev.bytesPerToken, bitsPerByte: ev.bitsPerByte, bitsPerToken: ev.bitsPerToken },
  sizeBytes: size,
  throughput: { evalMs: ev.evalMs, tokensPerSecond: ev.tokensPerSecond, generateTokensPerSecond: g.tokensPerSecond },
  sample: g.full,
  checks: {
    ngramBeatsUniform: ev.bitsPerByte.ngram < ev.bitsPerByte.uniform,
    mixtureWithinNgramPlus005: ev.bitsPerByte.mixture <= ev.bitsPerByte.ngram + 0.05,
    hvBeatsUniform: ev.bitsPerByte.hv < ev.bitsPerByte.uniform,
  },
};
verdict.verdict = Object.values(verdict.checks).every(Boolean) ? 'GREEN' : 'RED';
mkdirSync(path.join(HERE, 'verdicts'), { recursive: true });
writeFileSync(path.join(HERE, 'verdicts', 'mind.json'), JSON.stringify(verdict, null, 2));
out('');
out('MIND ' + verdict.verdict + ': ngram beats uniform ' + verdict.checks.ngramBeatsUniform + ', hv beats uniform ' + verdict.checks.hvBeatsUniform + ', mixture within ngram+0.05 ' + verdict.checks.mixtureWithinNgramPlus005);
process.exit(verdict.verdict === 'GREEN' ? 0 : 1);
