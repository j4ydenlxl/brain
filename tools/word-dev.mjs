// tools/word-dev.mjs: THE DEVELOPMENT RECORD EXTRACTOR for the word problem reader (act/word.mjs).
// Author: board 18 builder (cloud session, queue item 1, his 10:05 EDT order: "Every request should
// be less than a token and it should be done in microseconds").
//
// The split is sacred. The rules of act/word.mjs are written reading ONLY the GSM8K development
// records: the 200 ids bench/verdicts/math.json lists under records.ids plus the three the math
// prompts were probed on (bench/public.mjs gsm8kDevIds and GSM8K_PROBED, imported, never retyped).
// This tool reads bench/fixtures/public/gsm8k/test.jsonl line by line and PARSES ONLY the lines
// whose index is a development id; every other line is skipped unparsed, so no held-out record is
// ever decoded, printed or written. Out: state/self/word-dev.jsonl (gitignored), one record a line
// { id, question, gold } with gold through bench/public.mjs finalAnswer, and the count printed.
//
//   node tools/word-dev.mjs            writes state/self/word-dev.jsonl and prints the count
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gsm8kDevIds, GSM8K_PROBED, finalAnswer } from '../bench/public.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
export const FIXTURE = path.join(ROOT, 'bench', 'fixtures', 'public', 'gsm8k', 'test.jsonl');
export const DEV_FILE = path.join(ROOT, 'state', 'self', 'word-dev.jsonl');

/** The development records, and nothing else, as { id, question, gold }. */
export function extractDev(fixture = FIXTURE) {
  const dev = gsm8kDevIds();
  const want = new Set();
  for (const id of dev.set) { const m = /^gsm8k\.(\d+)$/.exec(id); if (m) want.add(Number(m[1])); }
  const src = fs.readFileSync(fixture, 'utf8').split(/\r?\n/).filter((l) => l.trim().length);
  const out = [];
  for (let i = 0; i < src.length; i++) {
    if (!want.has(i)) continue;                 // a held-out line is never parsed
    const r = JSON.parse(src[i]);
    out.push({ id: 'gsm8k.' + i, question: r.question, gold: finalAnswer(r) });
  }
  return { records: out, source: dev.source, probed: GSM8K_PROBED.slice(), wanted: want.size };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && !process.argv.includes('--round')) {
  const { records, source, wanted } = extractDev();
  fs.mkdirSync(path.dirname(DEV_FILE), { recursive: true });
  fs.writeFileSync(DEV_FILE, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
  console.log('word-dev: ' + records.length + ' development records of ' + wanted + ' wanted (' + source + ') written to ' + path.relative(ROOT, DEV_FILE).split(path.sep).join('/'));
}

// THE ROUND: act/word.mjs over every development record, printing answered, correct, wrong, refused
// and the first stop word of each refusal grouped by frequency, so the next rule is the most frequent
// stop. It reads state/self/word-dev.jsonl only (development by definition).
//   node tools/word-dev.mjs --round [--show N] [--wrong] [--answered]
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes('--round')) {
  const { wordRead } = await import('../act/word.mjs');
  const { sameInteger } = await import('../bench/public.mjs');
  let recs = fs.readFileSync(DEV_FILE, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const only = process.argv.includes('--id') ? process.argv[process.argv.indexOf('--id') + 1].split(',') : null;
  if (only) { recs = recs.filter((r) => only.includes(r.id)); for (const r of recs) console.log(r.id + ' gold ' + r.gold + ' ' + JSON.stringify(wordRead(r.question + '\n\nAnswer with the final number.'))); }
  let answered = 0, correct = 0;
  const wrong = [], stops = new Map(), ok = [];
  for (const r of recs) {
    const x = wordRead(r.question + '\n\nAnswer with the final number.');
    if (x.ok) {
      answered++;
      if (sameInteger(x.result.answer, r.gold)) { correct++; ok.push(r.id + ' ' + x.result.expression + ' = ' + x.result.answer); }
      else wrong.push(r.id + ' got ' + x.result.answer + ' gold ' + r.gold + ' expression ' + x.result.expression);
    } else {
      const k = process.argv.includes('--shape') ? (x.shape || x.word) : x.word;
      if (!stops.has(k)) stops.set(k, []);
      stops.get(k).push(r.id + ': ' + String(x.stop).slice(0, 110));
    }
  }
  console.log('round: ' + recs.length + ' development records; answered ' + answered + ', correct ' + correct + ', wrong ' + wrong.length + ', refused ' + (recs.length - answered) + '; share ' + (answered / recs.length).toFixed(4) + ', accuracy ' + (answered ? (correct / answered).toFixed(4) : 'n/a'));
  for (const w of wrong) console.log('WRONG ' + w);
  if (process.argv.includes('--answered')) for (const a of ok) console.log('RIGHT ' + a);
  const show = Number((process.argv[process.argv.indexOf('--show') + 1]) || 25);
  const sorted = [...stops.entries()].sort((a, b) => b[1].length - a[1].length);
  for (const [k, v] of sorted.slice(0, show)) console.log('stop ' + v.length + ' "' + k + '"  e.g. ' + v[0]);
}
