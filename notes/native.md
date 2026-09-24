# native: memory first, the direct hit, and a byte budget (Board 11)

The item covers P4's NATIVE SHARE and DIRECT HIT, and P10's open line "the ask path does not call the
tier yet". It has three builds and one bar. Every number below was printed by `node bench/native.mjs`
and is stored in `bench/verdicts/native.json` (at 2026-09-24T08:52:48.473Z, node v24.15.0). The
baseline is in `bench/verdicts/native-before-partial.json`. The verdict records the sha256 of the four
code files it ran. They match the files as they stand: act/prompt.mjs 76d8cb89feb40a8d,
memory/knowledge.mjs fb5c1218c9ebc90c, memory/semantic.mjs 18c34e1445a6df7a, memory/direct.mjs
395e2356aac8b11d.

## What was built

1. **Memory first** (`act/prompt.mjs`, `memory/knowledge.mjs`).
   - `factQuestion()` reads these factual shapes:
     - what, who and which with a copula
     - "define X"
     - "the meaning (or definition) of X"
     - "what does X mean"
     - "X is"
     - "where is X"
     - "when was X"
   - A shape whose subject is arithmetic is not a factual shape. The test (`isMathSubject`) is a
     digit, an operator, and no word that is not an operator word. "What is 17 * 23?" goes past
     memory, while "Sin City", "COVID-19", "Tan Dun" and "Apollo 11" stay factual.
   - ask() runs solve() first, then the knowledge tier, then a model cell.
   - At or above the floor (0.2), the answer's provenance is `memory`, with the article title and
     the fact.
   - Below the floor, the model is shown memory's facts, and the answer says `model+memory`.
   - Where and when read a place span or a date span from the subject's own facts
     (`KnowledgeStore.locate()`).
2. **The direct hit** (`memory/direct.mjs`). This is an open addressing table over typed arrays.
   - The key is the knowledge tier's own 256 bit signature of the question's key words, folded to
     64 bits, plus a 64 bit verifier of the canonical question.
   - ask() tries it FIRST. A hit has provenance `direct`, prints its nanoseconds, and costs one
     probe of integers.
3. **The byte budget** (`memory/semantic.mjs`). The 4,096 key count cap is gone.
   - The tier holds keys until their bytes pass a declared budget: 256 MB by default.
   - The budget is set by `BRAIN_SEMANTIC_BUDGET_MB`, `budgetMb` or `budgetBytes`.
   - `budget()` prints the keys held and their bytes.

## What the bar printed

- **Recall.** I asked the 200 held-out facts through ask().
  - Recall@1 with provenance memory or direct and no model call: **122/200 (61.0%)**, against 100
    needed.
  - 176 of the 200 were direct hits. All 176 gave the same answer the tier alone gave.
- **Nulls.**
  - The tier alone: 122.
  - The control table (every title but the drawn ones): 122, with 0 direct hits.
  - The tier and the table off: 0.
  - The title's own last word: 18.
- **Timing.** I timed 1,000,000 lookups a run, for 3 runs, with process.hrtime.bigint.
  - **42.21 ns a hit** (median) and 15.38 ns a miss.
  - The hit set found 1000000 of 1000000 keys. The miss set found 0 of 1000000.
- **Whole-ask means.** After one unrecorded warm pass, native answers took:
  - 30.6 us a whole ask with the table on (p50 27.7);
  - 1065.8 us with the tier alone;
  - 1044.7 us with the control table.
- **Suite.**
  - The tasks scored 724/725 before and 724/725 after. grid.d2.13 was wrong both times.
  - 724 suite questions were answered exactly and correctly before. **0 were lost** with the table
    off, and 0 with it on. The digest was aaa9480b6cfcd764 both ways.
- **Semantic tier.** At 256 MB, it has room for 15416 named keys at 17412 bytes a key. At 1 MB it
  held 60 keys and dropped 16, and it printed each eviction.
- **Fill.** 284749 titles, on 2 worker threads, in 218.9 s. The table held 282253 entries in
  1048576 slots, and its file was 37021584 bytes.
- **Peak RSS:** 1371.6 MB.

## Two rulers

- **The bar** used two sets of records:
  - the 200 records `bench/knowledge.mjs` draws by seed `knowledge-draw-2026-09-23` (their first
    sentences were never ingested);
  - the 725 suite questions of `bench/answer.mjs`.
- **Development** used other records:
  - The floor 0.2 came from `bench/recall.mjs --tune`, on the 428 held-out records outside the draw.
  - The shapes, the locator and the keys were built on titles that are not held out, and on the
    suite.
  - The arithmetic rule came from a failing unit test on a planted store.
- **Runs that saw the draw.** `--before` read it, and so did two full bar runs.
  - I read the first bar run (at 2026-09-24T08:43:53.820Z) before the second run.
  - It led to the warm pass, because its tier-alone mean was 3238.6 us against 1656.5 us for the
    control arm.
  - The draw's recall did not move between the two runs: 122 both times. The direct hits went from
    175 to 176, after the arithmetic rule stopped blocking one subject.

## Read this before quoting the numbers

- **The table memoises the tier.**
  - It was filled by asking the tier about every title, the drawn ones included. So a direct hit is
    the tier's own answer, served from a lookup.
  - It is not new knowledge, which is why recall@1 is 122 both with the table and without it.
  - The control table shows the hits come from the fill: it made 0 direct hits on the 200.
- **A shared fold is almost always one bag of words.**
  - Among 281819 filled titles, 2654 share a fold with another wording of the same title words, and
    286 were the same question asked again.
  - 0 share a fold between different sets of words. The verifier tells the wordings apart.
- **The warm pass matters.**
  - Without it, rotating the arm order did not balance which arm first read the store for an item.
    The first run printed 3238.6 us for the tier arm and 1656.5 us for the control arm, which does
    the same work.
  - With it, the two arms printed 1065.8 us and 1044.7 us.
  - As ask() printed them, a direct hit's key cost 13591.5 ns on average, and its lookup 1172.7 ns
    (timer included).
  - All latencies were measured on a shared machine, with other builders' processes running.
- **The null arm's provenance says `memory`.** With the tier and the table off, the offline provider
  is a fixture, so the organism answers from its episodic recall (a rule that predates this item).
  The bench counts every one of those 200 answers as a model call, and native as 0.
- **What bits did.** A CPU profile during development put 78.7% of answer() in keyVector(). The bit
  sliced keyBits() computes the same signs 32 lanes to a word. The test checks it lane for lane.

## Open (files this item does not own)

- `test/recall.test.mjs:161` expects `model` for a below-floor answer. The item requires
  `model+memory`, so that test now fails there. Its owner should change the expected value.
- `bench/ladder.mjs` reads `PROVENANCE`, which does not list `direct`. The new list is
  `ANSWER_PROVENANCE`.
- `cells/basic.mjs` `memory.assoc` still has a count cap of 4096.
- ask()'s default table is `<store>/direct-native.bin`. The bar does not write it, because the store
  directory is not this item's. `node bench/native.mjs --persist` writes it.
- On the region route, the model is not shown the tier's facts, so its answers stay `model`.
- solve() does not parse "What is 17 * 23?". That wording now goes to the model, never to memory.
