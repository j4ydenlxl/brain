# notes/mind.md : requests from the mind (our own LLM)

His words this note answers: "What if we made our own LLM?", "runs AI itself",
"Instead of tokens, qubits are like quantum tokens". The manual: "Language
representations, memory, prediction, simulation, mathematical computation,
symbolic structures, probabilistic inference, and evaluation mechanisms can all
participate in the same computational process."

mind/ is that sentence built as cells. A token is not an integer with an
embedding table trained by gradient descent. A token is a **quantum**: an hv
item in the same signal algebra every other cell already speaks. A sequence is a
bundle of permuted token quanta, so context is one vector, not a growing list.
Prediction is an associative read, addressed by that vector. Learning is one
pass with local rules only. No gradient anywhere in mind/.

## What was built

- `mind/tokenizer.mjs` : bytes plus a learned byte-pair merge vocabulary of our
  own (no external vocab file). Exact round trip. Every token id carries an hv
  quantum from the shared `ItemMemory`, dimension printed by every command.
- `mind/corpus.mjs` : our own text only. `research/*.md`, `notes/*.md`,
  `docs/*.md`, and the comments lifted out of `brain/**/*.mjs`. MANUAL.md is HIS
  and is never training text. Split by file, deterministic, byte counts printed.
- `mind/model.mjs` : five predictors graded on the same held out tokens.
  uniform, unigram, n-gram backoff, hv associative, and the mixture.
- `mind/index.mjs` : four cell kinds (`mind.tokenize`, `mind.context`,
  `mind.assoc`, `mind.decode`) and a region `language` with circuits
  `tokenizer`, `context`, `memory`, `decode`, so a Brain holds the model as
  cells and ticks it.
- `mind/generate.mjs` + `mind/cli.mjs` : sampling with temperature and top k.
- `bench/mind.mjs` writes `bench/verdicts/mind.json`. `test/mind.test.mjs` is in
  the gate.

## Requests to core (none blocking)

1. **A cell kind cannot hold a live object in params.** Same constraint memory/
   hit, same answer: `mind/index.mjs` keeps a registry and cells carry
   `params.model` as a string. If core ever grows a first class "resource"
   binding on cells, mind/ should move to it. Not blocking, and copying the
   memory/ pattern is cheaper than changing core.
2. **Two edges out of one cell arriving together.** `mind.context` emits the
   context hv and the observed token on two ports in the same run, and
   `mind.assoc` needs both in the same run to score a prediction. That works
   today only because both edges carry the same delay. A per cell "emit as one
   frame" would make this structural rather than incidental. Not blocking.
3. **`cell.stats.surprise` has no writer in core.** `runCell` reads it into the
   ledger but nothing sets it. mind/ sets it to the bits of surprise of the last
   observed token, which is exactly the field's name. If another library wants a
   different unit there, core should say which.

## The defect this build found: growth closed the loop

A fixed pipeline whose cells all fire on every tick is the loudest co-activation
signal in a brain. After eight ticks the tracker proposed an edge between the
decoder and the tokenizer, the gate approved it on that evidence (both ports
carry `event`, so `compatiblePorts` matches), and the decoded token was then fed
back into the perception port as though it were text from the world. Measured
before the fix: a 45 byte sentence encoded to 16 tokens, the tokenizer queue
stalled at 4 and never drained, and the memory went on scoring 120 tokens that
nobody ever fed it. Every one of those 120 numbers would have been quotable and
every one would have been false.

Two fixes, both in mind/, neither touching core/:

- **Perception takes input from outside.** `mind.tokenize` ignores an item that
  arrived over an edge (`it.e >= 0`) unless `params.acceptWired` says otherwise,
  and ignores any event carrying neither `text` nor `bytes`.
- **The gate seals the region.** `sealRegion` wraps the brain's policy so a grow
  or replace proposal touching a language cell is refused and everything else
  goes to the policy that was already there. Computation is not authority: this
  pipeline is engineered structure, not discovered structure, and the refusal is
  a ledger event, so the seal is observable rather than invisible.

The general lesson is wider than mind/: any region wired by hand, whose cells
fire together by construction, will be rewired by growth unless something says
no. Co-firing is evidence of a shared clock, not evidence of a useful pathway.

## The measurement, and what it is not

Bits per byte, not bits per token, so a tokenizer that makes longer tokens
cannot buy the number. All five arms are graded on the same held out files,
which no arm saw and which chose nothing. The mixture weights and the one
decoding temperature of the hv arm are chosen on a **dev slice of train**, never
on held out. The uniform arm is the null: a model that has learned nothing pays
log2(V) bits per token.

What this is not: it is not a transformer, it has no attention, and nothing here
claims to reach a transformer's bits per byte. The claim is narrower and
measured: a language model built entirely out of cells in this signal algebra,
trained in one pass with local rules, beats the uniform null by the margin
`bench/mind.mjs` prints, and the hv associative arm carries information that the
n gram arm does not (the mixture is graded to say by how much).
