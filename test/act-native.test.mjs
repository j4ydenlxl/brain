// test/act-native.test.mjs: act/native.mjs, THE NATIVE ANSWER (contract c11), and its tier in act/prompt.mjs ask().
//
// Every test builds its own root under the OS temp dir (neo/know/INDEX.json and one file per pack) and removes it, so
// nothing here reads the tree's neo/ or grown/, and nothing reaches the network. The rule this file exists to prove is
// "right or null, never wrong": each regression prompt of the brief has a test that fails when the reading that
// refuses it is dropped (an unexplained word, two readings, a follow-up with no thread).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  NATIVE, OPS, keyNorm, labelStems, nativeAnswer, nativeStatus, plural, resetNative, show, stem, wordsOf,
} from '../act/native.mjs';
import { ask } from '../act/prompt.mjs';
import { Brain } from '../core/brain.mjs';

// ---------------------------------------------------------------- fixtures
export const PACKS = Object.freeze({
  'samayo-capital': { columns: ['country', 'capital'], rows: [['France', 'Paris'], ['Germany', 'Berlin'], ['Peru', 'Lima'], ['Tajikistan', 'Dushanbe'], ['Chile', 'Santiago'], ['Singapore', 'Singapore']] },
  'samayo-continent': { columns: ['country', 'continent'], rows: [['France', 'Europe'], ['Germany', 'Europe'], ['Peru', 'South America'], ['Chile', 'South America'], ['Tajikistan', 'Asia'], ['South Africa', 'Africa'], ['Egypt', 'Africa'], ['Papua New Guinea', 'Oceania'], ['Guinea', 'Africa']] },
  'samayo-population': { columns: ['country', 'population'], rows: [['France', 67000000], ['Germany', 83000000], ['Peru', 33000000], ['Chile', 33000000]] },
  'world-cities': { columns: ['city', 'country'], rows: [['Paris', 'France'], ['Paris', 'United States'], ['Lima', 'Peru']] },
  'corpora-fruits': { columns: ['item', 'member'], rows: [['banana', 'yes'], ['apple', 'yes'], ['carrot', 'no']] },
  'corpora-instruments': { columns: ['item', 'member'], rows: [['oboe', 'yes'], ['toaster', 'no']] },
  'co2-mauna-loa': { columns: ['year', 'mean CO2 level at Mauna Loa'], rows: [[1990, 354.45], [2000, 369.71]] },
});

export function knowRoot(packs = PACKS) {
  const root = mkdtempSync(path.join(tmpdir(), 'act-native-'));
  const dir = path.join(root, 'neo', 'know');
  mkdirSync(dir, { recursive: true });
  const index = { packs: [] };
  for (const [id, p] of Object.entries(packs)) {
    writeFileSync(path.join(dir, id + '.json'), JSON.stringify({ id, from: 'fixture', sha: 'sha-' + id, columns: p.columns, rows: p.rows, at: 'fixture' }));
    index.packs.push({ id, columns: p.columns, rows: p.rows.length, sha: 'sha-' + id });
  }
  writeFileSync(path.join(dir, 'INDEX.json'), JSON.stringify(index));
  return root;
}
function rooted(t, packs) {
  const root = knowRoot(packs);
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
const A = (q, root, o = {}) => { const r = nativeAnswer(q, { root, ...o }); return r ? r.answer : null; };

// ---------------------------------------------------------------- the three regression prompts of the brief
test('regression: "which country has the capital Paris" is France, never Dushanbe', (t) => {
  const root = rooted(t);
  const r = nativeAnswer('which country has the capital Paris', { root });
  assert.equal(r.answer, 'France is the country whose capital is Paris.');
  assert.deepEqual([r.via.pack, r.via.key, r.via.column, r.via.keyColumn, r.via.op], ['samayo-capital', 'Paris', 'country', 'capital', 'lookup']);
  assert.ok(!/Dushanbe|Tajikistan/.test(r.answer));
  assert.ok(Number.isFinite(r.ms) && r.ms >= 0);
});

test('regression: "what continent is Peru in" is South America', (t) => {
  const root = rooted(t);
  assert.equal(A('what continent is Peru in', root), 'The continent of Peru is South America.');
  assert.equal(A('Which continent is PERU located in?', root), 'The continent of Peru is South America.', 'case, punctuation and a function word change nothing');
});

test('regression: "and germany?" reuses the thread\'s relation, by opts.last or by opts.thread, and is null with neither', (t) => {
  const root = rooted(t);
  const first = nativeAnswer('what continent is Peru in', { root });
  const byLast = nativeAnswer('and germany?', { root, last: first.via });
  assert.equal(byLast.answer, 'The continent of Germany is Europe.');
  assert.equal(byLast.via.follow, true);
  assert.equal(A('and germany?', root, { thread: ['hello', 'what continent is Peru in'] }), 'The continent of Germany is Europe.');
  assert.equal(A('what about chile', root, { thread: ['what is the capital of france'] }), 'The capital of Chile is Santiago.');
  // no thread: "and germany" names no relation, so it is not answered (never the capital, never the population)
  assert.equal(A('and germany?', root), null);
  // a follow-up whose entity is not in the relation's key column falls back to reading the turn alone
  assert.equal(A('and atlantis?', root, { last: first.via }), null);
  // a thread older than NATIVE.follow prompts is not read
  const old = ['what continent is Peru in', ...Array.from({ length: NATIVE.follow }, () => 'hello there')];
  assert.equal(A('and germany?', root, { thread: old }), null);
  // a stale last (a pack the root does not hold) is ignored
  assert.equal(A('and germany?', root, { last: { pack: 'gone', column: 'continent', keyColumn: 'country' } }), null);
});

// ---------------------------------------------------------------- right or null
test('one unexplained word and the reading is dropped: "capital gains tax of france" is null', (t) => {
  const root = rooted(t);
  assert.equal(A('what is the capital gains tax of france', root), null);
  assert.equal(A('what is the capital of france', root), 'The capital of France is Paris.');
  assert.equal(A('what is the capital of france spain', root), null, 'a word that is no cell of the key column');
  assert.equal(A('which country is in africa', root), null, 'two rows answer a singular question: never one of them');
});

test('two readings that answer differently, or one key with two values, are null', (t) => {
  const root = rooted(t);
  assert.equal(A('what country is paris in', root), null, 'Paris is a capital of France and a city of two countries');
  const two = rooted(t, { a: { columns: ['country', 'capital'], rows: [['Atlantis', 'Poseidonia']] }, b: { columns: ['country', 'capital'], rows: [['Atlantis', 'Mu']] } });
  assert.equal(A('what is the capital of atlantis', two), null);
  const same = rooted(t, { a: { columns: ['country', 'capital'], rows: [['Atlantis', 'Mu']] }, b: { columns: ['country', 'capital'], rows: [['Atlantis', 'mu']] } });
  const r = nativeAnswer('what is the capital of atlantis', { root: same });
  assert.equal(r.answer, 'The capital of Atlantis is Mu.', 'two packs that agree answer once');
  assert.deepEqual(r.via.packs, ['a', 'b']);
});

test('the longest entity wins: "papua new guinea" is not "guinea"', (t) => {
  const root = rooted(t);
  assert.equal(A('what continent is papua new guinea in', root), 'The continent of Papua New Guinea is Oceania.');
  assert.equal(A('what continent is guinea in', root), 'The continent of Guinea is Africa.');
  // a run inside a longer run of the same column is no second entity: "is new york a city" names one item, not two
  const cities = rooted(t, { 'corpora-cities': { columns: ['item', 'member'], rows: [['New York', 'yes'], ['York', 'yes'], ['Atlantis', 'no']] } });
  assert.equal(A('is new york a city', cities), 'Yes, New York is a city.');
  assert.equal(A('is york a city', cities), 'Yes, York is a city.');
});

test('a value equal to its own entity reads the question back: "the capital of Singapore" is never "Singapore"', (t) => {
  const root = rooted(t);
  assert.equal(A('what is the capital of singapore', root), null);
  assert.equal(A('what is the capital of chile', root), 'The capital of Chile is Santiago.', 'a value that differs from its entity still answers');
});

test('a thread carries a lookup relation only: a comparison or a membership before "and X?" names no relation', (t) => {
  const root = rooted(t);
  assert.ok(nativeAnswer('which has the larger population, france or germany', { root }).via.op === 'larger');
  assert.equal(A('and chile?', root, { thread: ['which has the larger population, france or germany'] }), null);
  assert.equal(nativeAnswer('is a banana a fruit', { root }).via.op, 'member');
  assert.equal(A('and apple?', root, { thread: ['is a banana a fruit'] }), null);
  // an older lookup behind them still carries
  assert.equal(A('and chile?', root, { thread: ['what is the population of peru', 'which has the larger population, france or germany'] }), 'The population of Chile is 33,000,000.');
});

// ---------------------------------------------------------------- every operation
test('the operations: list, count, larger, smaller, sum, difference, yes-no, each, a year key, member (describe: its own test)', (t) => {
  const root = rooted(t);
  assert.equal(A('which countries are in africa', root), 'The countries whose continent is Africa are Egypt, Guinea and South Africa.');
  assert.equal(A('how many countries are in south america', root), 'There are 2 countries whose continent is South America.');
  assert.equal(A('which has a larger population, france or germany', root), 'Germany has the larger population: 83,000,000, against 67,000,000 for France.');
  assert.equal(A('which has the smaller population, france or germany', root), 'France has the smaller population: 67,000,000, against 83,000,000 for Germany.');
  assert.equal(A('what is the combined population of france and peru', root), 'The combined population of France and Peru is 100,000,000 (France 67,000,000, Peru 33,000,000).');
  assert.equal(A('what is the difference in population between germany and peru', root), 'The difference in population between Germany and Peru is 50,000,000 (Germany 83,000,000, Peru 33,000,000).');
  assert.equal(A('is france larger than germany in population', root), 'No: the population of France is 67,000,000 and of Germany is 83,000,000.');
  assert.equal(A('is germany larger than france in population', root), 'Yes: the population of Germany is 83,000,000 and of France is 67,000,000.');
  assert.equal(A('which has a larger population, peru or chile', root), 'Peru and Chile have the same population, 33,000,000.');
  assert.equal(A('what are the capitals of peru and chile', root), 'The capital of Peru is Lima, and the capital of Chile is Santiago.');
  assert.equal(A('what was the mean co2 level at mauna loa in 1990', root), 'The mean CO2 level at Mauna Loa in 1990 is 354.45.');
  assert.equal(A('is a banana a fruit', root), 'Yes, banana is a fruit.');
  assert.equal(A('is a carrot a fruit', root), 'No, carrot is not a fruit.');
  assert.equal(A('is an oboe an instrument', root), 'Yes, oboe is an instrument.');
  assert.equal(A('is a potato a fruit', root), null, 'an item the pack does not hold is not answered no');
  assert.equal(A('which has a larger capital, france or germany', root), null, 'a comparison over a text column is null');
  assert.equal(A('which is larger and smaller, france or germany in population', root), null, 'both directions: null');
  assert.deepEqual(OPS.slice().sort(), ['count', 'describe', 'difference', 'each', 'larger', 'list', 'lookup', 'member', 'smaller', 'sum', 'yes-no']);
});

test('via names the pack, the key, the column, the key column and the operation', (t) => {
  const root = rooted(t);
  const r = nativeAnswer('what is the combined population of france and peru', { root });
  assert.deepEqual({ ...r.via }, { pack: 'samayo-population', key: 'France and Peru', column: 'population', keyColumn: 'country', op: 'sum', packs: ['samayo-population'] });
  assert.equal(nativeAnswer('is a banana a fruit', { root }).via.op, 'member');
  assert.equal(nativeAnswer('how many countries are in south america', { root }).via.op, 'count');
});

// ---------------------------------------------------------------- totality and the shelf
test('total: never throws, null for no shelf, a bad index, a missing pack, a non-string, an empty or an overlong question', (t) => {
  const root = rooted(t);
  for (const q of [undefined, null, 42, {}, [], '', '   ', 'x'.repeat(NATIVE.maxQ + 1), '\u0000￿', '?!?', 'the the the', 'of of of capital']) {
    assert.equal(nativeAnswer(q, { root }), null, String(q).slice(0, 20));
  }
  const bare = mkdtempSync(path.join(tmpdir(), 'act-native-bare-'));
  t.after(() => rmSync(bare, { recursive: true, force: true }));
  assert.equal(nativeAnswer('what is the capital of france', { root: bare }), null, 'no neo/know');
  mkdirSync(path.join(bare, 'neo', 'know'), { recursive: true });
  writeFileSync(path.join(bare, 'neo', 'know', 'INDEX.json'), '{ not json');
  assert.equal(nativeAnswer('what is the capital of france', { root: bare }), null, 'an index that does not parse');
  const lost = rooted(t);
  unlinkSync(path.join(lost, 'neo', 'know', 'samayo-capital.json'));
  resetNative();
  assert.equal(nativeAnswer('what is the capital of france', { root: lost }), null, 'a pack the index names but the shelf lost');
  assert.equal(nativeAnswer('what continent is Peru in', { root: lost }).answer, 'The continent of Peru is South America.', 'the other packs still answer');
  assert.doesNotThrow(() => nativeAnswer('and germany', { root, last: { pack: 1, column: null } }));
  assert.doesNotThrow(() => nativeAnswer('and germany', { root, thread: [1, null, {}, 'what continent is Peru in'] }));
});

test('the shelf is read again when INDEX.json changes; resetNative drops the cache; nativeStatus counts the packs', (t) => {
  const root = rooted(t, { a: { columns: ['country', 'capital'], rows: [['Atlantis', 'Mu']] } });
  assert.equal(A('what is the capital of atlantis', root), 'The capital of Atlantis is Mu.');
  assert.equal(nativeStatus(root).packs, 1);
  const dir = path.join(root, 'neo', 'know');
  writeFileSync(path.join(dir, 'b.json'), JSON.stringify({ id: 'b', from: 'fixture', sha: 'sha-b', columns: ['country', 'continent'], rows: [['Atlantis', 'Ocean']], at: 'x' }));
  writeFileSync(path.join(dir, 'INDEX.json'), JSON.stringify({ packs: [{ id: 'a', columns: ['country', 'capital'], rows: 1, sha: 'sha-a' }, { id: 'b', columns: ['country', 'continent'], rows: 1, sha: 'sha-b' }] }));
  resetNative();
  assert.equal(A('what continent is atlantis in', root), 'The continent of Atlantis is Ocean.');
  assert.equal(nativeStatus(root).packs, 2);
  assert.equal(nativeStatus(path.join(root, 'nowhere')).packs, 0);
});

test('the words: wordsOf, keyNorm, stem, plural, labelStems, show', () => {
  assert.deepEqual(wordsOf('  Curaçao, the ISLAND!  '), ['curacao', 'the', 'island']);
  assert.equal(keyNorm('The Gambia'), 'gambia');
  assert.equal(keyNorm(1990), '1990');
  assert.equal(keyNorm(null), '');
  assert.deepEqual(['countries', 'zones', 'boxes', 'status', 'bus', 'is', 'cities', 'capital'].map(stem), ['country', 'zone', 'box', 'status', 'bus', 'is', 'city', 'capital']);
  assert.deepEqual(['country', 'capital', 'box', 'day'].map(plural), ['countries', 'capitals', 'boxes', 'days']);
  assert.deepEqual(labelStems('mean CO2 level at Mauna Loa'), ['mean', 'co2', 'level', 'mauna', 'loa']);
  assert.deepEqual([show(67000000), show(354.4567891), show('Lima'), show(0), show(1990), show(9999), show(10000), show(-25000)], ['67,000,000', '354.4568', 'Lima', '0', '1990', '9999', '10,000', '-25,000']);
});

// ---------------------------------------------------------------- the tier in ask()
const newBrain = () => new Brain({ name: 'native-tier', ledger: 'off', pruneEvery: 0 });
async function tierRoot(t) {
  const root = rooted(t);
  mkdirSync(path.join(root, 'grown'), { recursive: true });
  writeFileSync(path.join(root, 'grown', 'index.mjs'), 'export const GROWN = Object.freeze([]);\nexport function grownAnswer() { return null; }\n');
  return root;
}

test('ask(): the native tier answers with route native, from native, the via and the provenance; native false and prose skip it', async (t) => {
  const root = await tierRoot(t);
  const brain = newBrain();
  const a = await ask(brain, 'which country has the capital Paris', { provider: 'null', root });
  assert.deepEqual([a.ok, a.from, a.route, a.text], [true, 'native', 'native', 'France is the country whose capital is Paris.']);
  assert.deepEqual([a.native.kind, a.native.form, a.native.via.pack, a.native.via.op], ['know:lookup', 'know', 'samayo-capital', 'lookup']);
  assert.deepEqual([a.provenance.answer, a.provenance.source, a.provenance.tier, a.provenance.title, a.provenance.method], ['native', 'know', 'native', 'samayo-capital', 'lookup']);
  assert.equal(a.provenance.llm.provider, null);
  assert.equal(a.words, 8);
  const off = await ask(brain, 'which country has the capital Paris', { provider: 'null', root, native: false });
  assert.notEqual(off.route, 'native', 'opts.native false skips the tier');
  // the exact path still answers before it: arithmetic is never read against a pack
  assert.equal((await ask(brain, 'what is 17 times 23', { provider: 'null', root })).from, 'exact');
  // a question it cannot read in full falls through untouched
  const tax = await ask(brain, 'what is the capital gains tax of france', { provider: 'null', root });
  assert.notEqual(tax.route, 'native');
  assert.ok(!/Paris/.test(tax.text));
});

test('ask(): a follow-up through opts.thread and opts.last', async (t) => {
  const root = await tierRoot(t);
  const brain = newBrain();
  const first = await ask(brain, 'what continent is Peru in', { provider: 'null', root });
  const viaThread = await ask(brain, 'and germany?', { provider: 'null', root, thread: ['what continent is Peru in'] });
  const viaLast = await ask(brain, 'and germany?', { provider: 'null', root, last: first.native.via });
  assert.equal(viaThread.text, 'The continent of Germany is Europe.');
  assert.equal(viaLast.text, viaThread.text);
  assert.notEqual((await ask(brain, 'and germany?', { provider: 'null', root })).route, 'native', 'no thread: not answered natively');
});

test('ask(): the shelf reads before the grown cells; a cell answers only what the shelf cannot read, and every prompt with native false', async (t) => {
  const root = await tierRoot(t);
  const brain = newBrain();
  // a colony that answers everything with the generation 6 misreading
  let calls = 0;
  const grown = (q) => { calls++; return { id: 'capital-country-neo-g6', class: 'capital-country', generation: 6, answer: 'Dushanbe is the capital of Tajikistan.' }; };
  const a = await ask(brain, 'which country has the capital Paris', { provider: 'null', root, grown });
  assert.deepEqual([a.route, a.text, calls], ['native', 'France is the country whose capital is Paris.', 0], 'the cell is never asked a prompt the shelf reads');
  const b = await ask(brain, 'what continent is Peru in', { provider: 'null', root, grown });
  assert.deepEqual([b.route, b.text, calls], ['native', 'The continent of Peru is South America.', 0]);
  // what the shelf cannot read still reaches the cell, before the exact path
  const c = await ask(brain, 'name a colour of the sky at dusk', { provider: 'null', root, grown });
  assert.deepEqual([c.from, c.text, calls], ['cell', 'Dushanbe is the capital of Tajikistan.', 1]);
  // native false (or prose): the cells first for every prompt, as before
  const d = await ask(brain, 'which country has the capital Paris', { provider: 'null', root, grown, native: false });
  assert.deepEqual([d.from, calls], ['cell', 2]);
  // the exact reader likewise: a prompt it reads never reaches a cell; exact false (or prose) puts the cells first again
  assert.deepEqual([(await ask(brain, 'how many seconds are in an hour', { provider: 'null', root, grown })).from, calls], ['exact', 2]);
  assert.deepEqual([(await ask(brain, 'what is 17 times 23', { provider: 'null', root, grown })).from, calls], ['exact', 2]);
  assert.deepEqual([(await ask(brain, 'what is 17 times 23', { provider: 'null', root, grown, exact: false })).from, calls], ['cell', 3]);
});

test('describe: "what is X", "define X", "what does X mean" read the facts of one entity of a key column', (t) => {
  const root = rooted(t, {
    ...PACKS,
    'http-status-codes': { columns: ['HTTP status code', 'reason phrase'], rows: [[200, 'OK'], [404, 'Not Found'], [500, 'Internal Server Error']] },
    'iso-numeric': { columns: ['country', 'numeric code'], rows: [['Kenya', '404'], ['France', '250'], ['Peru', '604']] },
    'periodic-table': { columns: ['element', 'symbol', 'atomic number'], rows: [['Gold', 'Au', 79], ['Iron', 'Fe', 26], ['Lead', 'Pb', 82]] },
    'city-country': { columns: ['city', 'country'], rows: [['Lima', 'Peru'], ['Cusco', 'Peru'], ['Arequipa', 'Peru'], ['Lyon', 'France'], ['Nice', 'France']] },
    'crypto-tickers': { columns: ['crypto ticker', 'cryptocurrency'], rows: [['ZEUS', 'Zeus Network'], ['BTC', 'Bitcoin'], ['ETH', 'Ethereum']] },
    'corpora-greek-gods': { columns: ['item', 'member'], rows: [['Zeus', 'yes'], ['Hera', 'yes'], ['Thor', 'no']] },
    'planets-moons': { columns: ['moon', 'planet'], rows: [['Io', 'Jupiter'], ['Europa', 'Jupiter'], ['Titan', 'Saturn']] },
    'us-cities': { columns: ['US city', 'state'], rows: [['Jupiter', 'Florida'], ['Austin', 'Texas'], ['Boston', 'Massachusetts']] },
  });
  assert.equal(A('what does HTTP status 404 mean', root), '404 is the HTTP status code whose reason phrase is Not Found.');
  assert.equal(nativeAnswer('what does HTTP status 404 mean', { root }).via.op, 'describe');
  assert.equal(A('what is 404', root), null, 'a status code and a numeric code: two kinds');
  assert.equal(A('define gold', root), 'Gold is the element whose symbol is Au and whose atomic number is 79.');
  assert.equal(A('what is Au', root), 'Au is the symbol whose element is Gold and whose atomic number is 79.');
  // the country's packs in shelf order; city-country is not a key column of country (five rows, two countries)
  assert.equal(A('what is Peru', root), 'Peru is the country whose capital is Lima, whose continent is South America, whose population is 33,000,000 and whose numeric code is 604.');
  // two senses, the shelf cannot tell which is asked: Paris a capital and a city; Zeus a Greek god (a membership yes)
  // and a crypto ticker; Jupiter a planet (not a key column: many moons) and a US city. A label word picks one.
  assert.equal(A('what is Paris', root), null);
  assert.equal(A('who is Zeus', root), null);
  assert.equal(A('what is Jupiter', root), null);
  assert.equal(A('what is the capital Paris', root), 'Paris is the capital whose country is France.');
  assert.equal(A('what is the US city Jupiter', root), 'Jupiter is the US city whose state is Florida.');
  assert.equal(A('what is BTC', root), 'BTC is the crypto ticker whose cryptocurrency is Bitcoin.');
  // a membership no is not a sense, and a membership yes alone has no facts
  assert.equal(A('who is Thor', root), null);
  assert.equal(A('who is Hera', root), null);
  // a column whose cells repeat is not a key: Saturn has one moon here, yet "planet" is not what a moon is a fact of
  assert.equal(A('what is the planet Saturn', root), null);
  // no frame, an unexplained word, an operation word, a membership pack, an unknown thing: null
  for (const q of ['Peru', 'what is Peru famous for', 'what is more Peru', 'what is a banana', 'what is photosynthesis', 'define entropy', 'what is Gold and Iron']) assert.equal(A(q, root), null, q);
  // a relation still reads first
  assert.equal(A('what is the capital of Peru', root), 'The capital of Peru is Lima.');
});
