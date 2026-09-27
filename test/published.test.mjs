// test/published.test.mjs: the published rows of research/published.json (board 23, item published-rows).
// Author: board 23 builder (item published-rows), 2026-09-26.
//
// Every row carries a source URL and a date; every accuracy is a number in [0,100]; the GPT-4o
// rows exist on GSM8K and HumanEval; the Claude Opus 5.5 and Claude Fable 5.1 pairs either have a
// published row or an OMITTED line in notes/published.md naming where it was looked for, never
// both and never neither; bench/public.mjs publishedFor returns the rows. The checker is shown to
// reject broken copies of real rows of both kinds (earlier boards' rows and this item's), so no
// assertion here is true of nothing. Reads files only. No model, no socket, no set re-run.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  rowProblems, modelOf, omissionsOf, matrix, mutants, readPublished,
  NOTES_FILE, FULL_CITATION_FROM, MODELS, BENCHMARKS,
} from './published-rows-bar.mjs';
import { publishedFor, SET_META, SETS } from '../bench/public.mjs';

const doc = readPublished();
const rows = doc.rows;
const added = rows.filter((r) => String(r.readAt || '').slice(0, 10) >= FULL_CITATION_FROM);
const earlier = rows.filter((r) => String(r.readAt || '').slice(0, 10) < FULL_CITATION_FROM);
const omitted = omissionsOf(readFileSync(NOTES_FILE, 'utf8'));
const of = (model, benchmark) => rows.filter((r) => r.benchmark === benchmark && modelOf(r) === model);

test('the population checked holds both kinds of row: earlier boards\' rows and the rows this item added', () => {
  assert.ok(Array.isArray(rows) && rows.length > 0, 'research/published.json has rows');
  assert.ok(earlier.length > 0, 'rows written before ' + FULL_CITATION_FROM + ' are in the population');
  assert.ok(added.length > 0, 'rows added on ' + FULL_CITATION_FROM + ' are in the population');
  for (const b of BENCHMARKS) assert.ok(rows.some((r) => r.benchmark === b), 'a row for ' + b);
  assert.deepEqual(BENCHMARKS.slice().sort(), SETS.map((s) => SET_META[s].benchmark).sort(), 'the benchmark keys are the ones SET_META uses');
});

test('every row has a source URL and a date read', () => {
  for (const r of rows) {
    assert.match(String(r.source), /https?:\/\/\S+/, r.system + ' has a URL in its source');
    assert.match(String(r.readAt), /^\d{4}-\d{2}-\d{2}/, r.system + ' has the date it was read');
  }
});

test('every accuracy is a number in [0,100]', () => {
  for (const r of rows) {
    assert.equal(typeof r.score, 'number', r.system + ' score is a number');
    assert.ok(Number.isFinite(r.score) && r.score >= 0 && r.score <= 100, r.system + ' score ' + r.score + ' is in [0,100]');
  }
});

test('every row passes the row check; an added row carries model, metric, the printed value and a quote under 15 words that holds it', () => {
  for (const r of rows) assert.deepEqual(rowProblems(r), [], r.system + ' (' + r.benchmark + ')');
  for (const r of added) {
    assert.ok(r.model && r.metric && r.printed && r.quote, r.system + ' carries model, metric, printed, quote');
    assert.ok(r.quote.trim().split(/\s+/).length < 15, r.system + ' quote is under 15 words');
    assert.ok(r.quote.includes(r.printed), r.system + ' quote holds ' + r.printed);
    assert.equal(r.readAt.slice(0, 10), '2026-09-26', r.system + ' was read today');
  }
});

test('control: the row check rejects broken copies of real rows of both kinds, and accepts a clean one', () => {
  const ms = mutants(rows);
  assert.ok(ms.length >= 12, 'mutants of both an earlier row and an added row: ' + ms.length);
  assert.ok(ms.some((m) => /url removed/.test(m.name)) && ms.some((m) => /quote padded/.test(m.name)), 'both kinds of mutant are present');
  for (const m of ms) assert.ok(rowProblems(m.row).length > 0, 'rejected: ' + m.name);
  assert.deepEqual(rowProblems({ benchmark: 'gsm8k', system: 'X', score: 50, source: 'https://x.example', readAt: '2026-09-18 00:00 EDT' }), [], 'an earlier-format clean row passes');
  assert.deepEqual(rowProblems({ benchmark: 'gsm8k', system: 'X', model: 'X', metric: 'm', score: 4.5, printed: '0.045', quote: 'score 0.045', source: 'https://x.example', readAt: '2026-09-26 00:00 EDT' }), [], 'a fraction printed as 0.045 is the percent 4.5');
  assert.ok(rowProblems({ benchmark: 'gsm8k', system: 'X', model: 'X', metric: 'm', score: 4.5, printed: '0.46', quote: 'score 0.46', source: 'https://x.example', readAt: '2026-09-26 00:00 EDT' }).length > 0, '0.46 is not 4.5');
  assert.ok(rowProblems({ benchmark: 'gsm8k', system: 'X', score: -1, source: 'https://x.example', readAt: '2026-09-18' }).length > 0, 'a negative score is rejected');
  assert.ok(rowProblems({ benchmark: 'gsm8k', system: 'X', score: NaN, source: 'https://x.example', readAt: '2026-09-18' }).length > 0, 'NaN is rejected');
});

test('the GPT-4o rows exist for GSM8K and HumanEval (and ARC-AGI-1), each with a URL', () => {
  for (const b of ['gsm8k', 'humaneval', 'arc-agi-1']) {
    const got = of('GPT-4o', b);
    assert.ok(got.length > 0, 'a GPT-4o row for ' + b);
    for (const r of got) assert.match(r.source, /https?:\/\//);
  }
  const gsm = of('GPT-4o', 'gsm8k').find((r) => r.readAt.startsWith('2026-09-26'));
  assert.equal(gsm.score, 96.1);
  assert.match(gsm.metric, /8-shot, CoT/);
  assert.doesNotMatch(gsm.system, /405B/, 'the GPT-4o row can never be taken for the 405B row');
  assert.ok(!rows.some((r) => /gpt-4o-mini/i.test(r.system) && modelOf(r) === 'GPT-4o'), 'gpt-4o-mini is not counted as GPT-4o');
});

test('Claude Opus 5.5: a published row on ARC-AGI-1; on GSM8K and HumanEval a row or an OMITTED line with where it was looked, never both, never neither', () => {
  const arc = of('Claude Opus 5.5', 'arc-agi-1');
  assert.ok(arc.length > 0, 'an Opus 5.5 ARC-AGI-1 row');
  assert.ok(arc.every((r) => /^https:\/\/arcprize\.org\//.test(r.source)), 'the ARC rows cite arcprize.org');
  for (const b of ['gsm8k', 'humaneval']) {
    const has = of('Claude Opus 5.5', b).length > 0;
    const om = omitted.find((o) => o.model === 'Claude Opus 5.5' && o.benchmark === b);
    assert.ok(has !== !!om, 'Opus 5.5 ' + b + ': exactly one of a row (' + has + ') or an omission line (' + !!om + ')');
    if (om) assert.ok(om.urls >= 2, 'the omission names at least two places looked: ' + om.urls);
  }
});

test('no pair of the three models and three sets is silent: each has a row or an OMITTED line, and no omission contradicts a row', () => {
  const mx = matrix(rows, omitted);
  assert.equal(mx.length, MODELS.length * BENCHMARKS.length);
  for (const c of mx) {
    assert.ok(c.rows.length > 0 || c.omitted, c.model + ' ' + c.benchmark + ' has a row or an omission line');
    assert.ok(!(c.rows.length > 0 && c.omitted), c.model + ' ' + c.benchmark + ' is not both found and omitted');
  }
  for (const o of omitted) {
    assert.ok(MODELS.some((m) => m.name === o.model), 'omission names a known model: ' + o.model);
    assert.ok(BENCHMARKS.includes(o.benchmark), 'omission names a known benchmark: ' + o.benchmark);
    assert.ok(o.urls >= 1, 'omission names a URL looked at: ' + o.model + ' ' + o.benchmark);
  }
  const parsed = omissionsOf('text\nOMITTED | GPT-4o | gsm8k | looked: https://a.example ; https://b.example\nOMITTED GPT-4o gsm8k\n');
  assert.deepEqual(parsed.map((o) => [o.model, o.benchmark, o.urls]), [['GPT-4o', 'gsm8k', 2]], 'the omission parser reads only well-formed lines');
});

test('Fable 5.1 rows only from a published source with a URL (P15)', () => {
  const fable = rows.filter((r) => modelOf(r) === 'Claude Fable 5.1');
  assert.ok(fable.length > 0, 'a Fable 5.1 row exists');
  for (const r of fable) assert.match(r.source, /https?:\/\//, r.system + ' cites a URL');
  const first = rows.find((r) => r.benchmark === 'arc-agi-1' && /Fable 5\.1/i.test(r.system || '') && /https?:\/\//.test(r.source || ''));
  assert.ok(first && Number.isFinite(first.score), 'the row bench/ladder.mjs orchestratorRowOf would pick for arc-agi-1');
});

test('bench/public.mjs publishedFor returns the GPT-4o, Opus 5.5 and Fable 5.1 rows with their source and date', () => {
  for (const b of BENCHMARKS) {
    const through = publishedFor(b);
    for (const m of MODELS) {
      const inFile = of(m.name, b);
      const got = through.filter((r) => modelOf(r) === m.name);
      assert.equal(got.length, inFile.length, m.name + ' ' + b + ': publishedFor returns every row the file holds');
      for (const r of inFile) {
        const g = got.find((x) => x.system === r.system && x.source === r.source);
        assert.ok(g, 'publishedFor returns ' + r.system + ' for ' + b);
        assert.equal(g.score, r.score);
        assert.equal(g.readAt, r.readAt);
      }
    }
  }
  assert.ok(publishedFor('gsm8k').some((r) => modelOf(r) === 'GPT-4o'), 'GPT-4o GSM8K through publishedFor');
  assert.ok(publishedFor('humaneval').some((r) => modelOf(r) === 'GPT-4o'), 'GPT-4o HumanEval through publishedFor');
  assert.ok(publishedFor('arc-agi-1').some((r) => modelOf(r) === 'Claude Opus 5.5'), 'Opus 5.5 ARC-AGI-1 through publishedFor');
});

test('the rows other benches read first are unchanged: publishedFor("gsm8k")[0] is still the Llama 3.1 405B row', () => {
  const gsm = publishedFor('gsm8k');
  assert.match(gsm[0].system, /Llama 3\.1 405B/, 'bench/ns.mjs reads publishedFor("gsm8k")[0]');
  assert.equal(gsm[0].score, 96.8);
  const r405 = gsm.find((r) => /405B/.test(String(r.system)));
  assert.equal(r405.system, gsm[0].system, 'the 405B row bench/public.mjs ladderRows finds');
  assert.equal(added.filter((r) => /405B/i.test(r.system + ' ' + (r.class || ''))).length, 0, 'no added row can be read as a 405B row');
});
