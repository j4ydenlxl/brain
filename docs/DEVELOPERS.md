# The BRAIN for developers

`README.md` gives one command per surface. This page goes deeper: what each surface returns, what answers with no data and no model, what needs the knowledge store, how to add a model, the HTTP limits, and where every number on both pages comes from. Every fenced command below whose first word is `node`, `curl` or `npm` is run, exactly as written, by `node bench/developers.mjs`: its first printed line is compared with the line written under it, and for every ask the answer is checked too (the answer line, the footer's route and provenance, or the JSON fields). Every table marked as a claim is asked through `ask()` with no model, and every number in a sources table is compared with the verdict field it names. Each of those checks must also reject a planted wrong expectation. The verdict is `bench/verdicts/developers.json`.

His order behind this page: "and for developesr all across".

## The command line

`bin/brain.mjs` is the whole command line; `node bin/brain.mjs --help` lists every command. A brain is a named directory under the state root, `state/` in the checkout unless `BRAIN_STATE_DIR` points elsewhere. Make one, then ask it:

```bash
node bin/brain.mjs init dev
```
<!-- prints: initialized dev  seed=basic -->

```bash
node bin/brain.mjs ask dev "what is 17 times 23" --provider null
```
<!-- prints: ask dev  c2fc4240bc023880  19 chars -->
<!-- line: answered exactly by exact.arith, with no model and no network. -->
<!-- line: 391 -->
<!-- line: route direct  provenance exact -->

The output has three parts. The header names the brain, the first 16 hex characters of the prompt's hash, and the prompt's length. The answer comes next, starting with one line that says how it was reached (here: answered exactly by `exact.arith`, with no model and no network), then the steps and the answer, `391`. The footer is last; its second line names the route and the provenance (here: `direct` and `exact`). Add `--json` for one JSON object instead, and `--no-color` (or `NO_COLOR=1`) for plain text.

A fact goes to the knowledge tier. With the store built (see below), this prints the article it came from and ends with the answer line, `answer [knowledge "Capital of France"]: paris`, on the route `knowledge`; without it, the memory miss, which begins `I do not carry that yet` and names what the brain does carry. The bar checks whichever case holds on the machine it runs on, and `README.md` asks the packed copy, which never carries the store, for the miss:

```bash
node bin/brain.mjs ask dev "What is the capital of France?" --provider null
```
<!-- prints: ask dev  115049a298532be2  30 chars -->
<!-- store-line: answer [knowledge "Capital of France"]: paris -->
<!-- store-line: route knowledge  provenance memory -->
<!-- no-store-line: I do not carry that yet: I answer greetings and questions about myself natively, arithmetic and equations exactly, word problems with my own programs and facts I ingested from memory; no language model is configured on this host. -->
<!-- no-store-line: route direct  provenance memory -->

## What answers without the knowledge store

These answer on a fresh brain with no model (provider `null`, no socket) and with the knowledge tier switched off. The bar asks every row and checks the provenance and the answer:

<!-- claims: no-store -->
| prompt | provenance | answer or kind |
| --- | --- | --- |
| `hey` | `native` | `greeting` |
| `thanks` | `native` | `thanks` |
| `who are you` | `native` | `identity` |
| `what can you do` | `native` | `ability` |
| `what is your name` | `native` | `name` |
| `bye` | `native` | `farewell` |
| `what is 17 times 23` | `exact` | `391` |
| `2*x+3=11` | `exact` | `4` |
| `2, 4, 8, 16, ?` | `exact` | `32` |
| `1/3 + 1/6` | `exact` | `1/2` |
| `Lisa earns $15 an hour and works 8 hours. How much does she earn?` | `exact` | `120` |
| `h` | `miss` | `none` |
| `write a haiku about rain` | `miss` | `none` |
| `A baker made 24 cupcakes and sold 9. How many are left?` | `miss` | `none` |
| `What is the capital of France?` | `miss` | `none` |

Where each one comes from:

- `native` is the conversation region (`act/converse.mjs`): greetings, thanks, farewells and questions about the brain itself, answered with no model and no memory read.
- `exact` is `solve()` in `act/solve.mjs`: arithmetic on BigInt, linear equations written with an explicit `*`, sequences, fractions and the word problems it can parse. An exact answer is never a guess.
- `program` is the program tier: word problems answered by programs the brain induced and kept in `bench/verdicts/induce-programs.json`.
- The direct table (a precomputed answer table) and the solved memory are checked first when present; the solved memory is off unless `BRAIN_SOLVED=1`.
- A model cell answers what is left, when one is configured (see below).
- `miss` is the memory miss: the answer says it does not carry that yet and suggests what to ask. It is never an invented answer.

### A wrong answer now refused

The program tier used to answer this one wrong (`31`; the correct answer is `4`, which `2*x+3=11` gets from the exact tier above). The program guard (`programGuard` in `act/prompt.mjs`) now keeps it from the program tier, so it is the memory miss. It is listed so the bar notices the day it changes:

<!-- claims: no-store -->
| prompt | provenance | answer or kind |
| --- | --- | --- |
| `solve 2x + 3 = 11` | `miss` | `none` |

## What needs the knowledge store

Facts come from the knowledge tier, a store built from the Simple English Wikipedia dump. The store is not committed (it lives under `bench/fixtures/`, which is gitignored) and the package does not carry it. Build it on your machine:

- `node tools/ingest-wiki.mjs --download` fetches the dump into `bench/fixtures/wiki/` (its url, size and hash are in `bench/fixtures/wiki/SOURCES.md` after the download).
- `node tools/ingest-wiki.mjs` builds the store at `bench/fixtures/wiki/store`.

The last measured build read 385846687 compressed bytes, took 100.92 seconds on the owner's machine, and wrote 284749 articles and 1911943 facts into 13 files totalling 388459374 bytes (from `bench/verdicts/knowledge.json`). `knowledgeReady()` in `act/prompt.mjs` says whether a finished store is present.

With the store, these answer from the knowledge tier; without it, each one is the memory miss. The bar asks both ways when the store is present:

<!-- claims: store -->
| prompt | article | answer |
| --- | --- | --- |
| `What is the capital of France?` | `Capital of France` | `paris` |
| `What is the capital of Japan?` | `Capital of Japan` | `tokyo` |

The tier is narrow. With the store present, these are still the memory miss today:

<!-- claims: store-miss -->
| prompt | note |
| --- | --- |
| `Who wrote Hamlet?` | a fact about a work |
| `What is the capital of Germany?` | the same question shape as above, another country |
| `What is the largest planet?` | a superlative |

## The model cell

Everything the tiers above do not answer can go to a model you choose. The brain never holds the model's address or key: you name three environment variables, and `act/llm.mjs` reads their values at request time, puts the key in one header, and scrubs it from every string that leaves the module. The names:

- `BRAIN_LLM_BASE`: the base url of an OpenAI compatible chat completions endpoint.
- `BRAIN_LLM_KEY`: the key for that endpoint.
- `BRAIN_LLM_MODEL`: the model name to ask for.

Set them in your own shell or your host's secret store. No value is ever written into this repository, a verdict, a log or a document, and no command on this page prints one. Then pass the names (not values) to the command line:

```bash
node bin/brain.mjs ask dev "write a haiku about rain" --provider env --env-base BRAIN_LLM_BASE --env-key BRAIN_LLM_KEY
```
<!-- prints: ask dev  71b030dadf9e60fe  24 chars -->
<!-- line: nothing in memory matches write, haiku, about, rain. -->
<!-- line-matches: ^answered from memory  memory hits 0  web pages 0  llm null/null .*fell back from env: environment variable BRAIN_LLM_BASE is not set$ -->
<!-- line: route direct  provenance memory -->

The bar runs this with the three names removed from the environment, so no model is called: the answer is the one line memory miss, `nothing in memory matches write, haiku, about, rain.`, and the footer says the env provider fell back because `BRAIN_LLM_BASE` is not set (it names the variable, never a value). With the names set, the footer's `llm` field names the provider and the model that answered. The HTTP endpoint uses the model cell when `BRAIN_LLM_BASE` is set on the host together with `BRAIN_LLM_KEY`, or together with `VERCEL_OIDC_TOKEN` when `BRAIN_LLM_KEY` is unset (`keyNameFor` in `act/ask-http.mjs`). In the library, pass `{ provider: 'env', envBase: 'BRAIN_LLM_BASE', envKey: 'BRAIN_LLM_KEY' }` to `ask()`.

## The library

`ask(brain, prompt, opts)` in `act/prompt.mjs` is the one entry point; the command line, the HTTP endpoint and the MCP server all call it. `README.md` has a runnable example. The options a developer needs:

- `provider`: `'null'` (no model, no socket), `'ollama'` (a local model server) or `'env'` (the model cell above). Left unset, an ask that reaches the model tier probes a local Ollama's `/api/tags` and uses it when it answers (`askModel` in `act/prompt.mjs`), so pass `'null'` when you want no model and no socket. The command line takes the same choice as `--provider`.
- `knowledge`: `false` switches the knowledge tier off.
- `solved`: `true` turns on the solved memory.
- `events`: an array the ask appends its trace to.

`knowledgeReady()` reports whether the store is present, and `closeKnowledge()` releases it when you are done.

## HTTP

The site serves `POST /api/ask` (`api/ask.mjs`, which hands the request to `act/ask-http.mjs`). A GET prints the usage line, the footer field names and whether a model and a store are configured on that host:

```bash
curl -s https://dilation.dev/api/ask
```
<!-- prints-json: usage -->
<!-- json: ok = true -->
<!-- json: footer = text,from,route,provenance,exact,native,llm,promptHash,promptChars,redacted,serverUs,host,knowledge -->
<!-- json: model.configured = false -->
<!-- json: knowledge.ready = true -->

On the live site today `model.configured` is false and `knowledge.ready` is true: the site has no model cell yet (the provider variables are his hand in the Vercel project, never typed here), and the store it answers from is the packed sample under `bench/fixtures/wiki/` that ships inside the function. The bar checks both, so this line has to change the day the model cell is configured there.

```bash
curl -s -X POST https://dilation.dev/api/ask -H "content-type: application/json" -d '{"prompt":"what is 17 times 23"}'
```
<!-- prints-json: text -->
<!-- json: ok = true -->
<!-- json: route = direct -->
<!-- json: provenance.answer = exact -->
<!-- json: exact.answer = 391 -->
<!-- json: llm.provider = null -->
<!-- json: promptHash = c2fc4240bc023880 -->

It answers `391` from the exact tier (`exact.answer`), with no model (`llm.provider` is null), and its `promptHash` is the one the command line printed for the same prompt.

To run the same endpoint on your machine, `node bin/ask-serve.mjs --port 0` prints the address it listens on.

The limits, from `LIMITS` in `act/ask-http.mjs`:

- a prompt of at most `2000` characters, and a body of at most `32768` bytes;
- `20` asks a minute per client and `300` a minute per server instance, refilled continuously;
- `25000` ms for a model call.

The status codes: `200` with the answer; `400` for a body that is not JSON or has no prompt; `403` when a browser sends an Origin that names another host (the endpoint answers its own site only); `405` for a method other than GET, POST or OPTIONS; `413` for a prompt or body over the limit; `429` with a `Retry-After` header past a rate limit; `204` for OPTIONS; `500` when the ask itself throws.

## The footer fields

The endpoint returns these fields (GET lists them), the same ones the command line prints:

- `text`: the answer, starting with the line that says how it was reached.
- `from`: the short name of what produced the text, `native` for a greeting.
- `route`: the path through `ask()` that answered, such as `direct` or `knowledge`.
- `provenance`: where the answer came from, with `answer` naming the kind (native, exact, program or memory) and counts of memory hits and web pages used.
- `exact`: the exact solver's result when it answered, else null.
- `native`: the conversation region's kind and answer when it answered, else null.
- `llm`: the model call, with its provider, model, time and whether it ran; null provider means no model was asked.
- `promptHash`: the first 16 hex characters of the prompt's hash, the same one the command line prints.
- `promptChars`: the prompt's length in characters.
- `redacted`: how many times a secret was scrubbed from the text.
- `serverUs`: the time the server spent on the ask, in microseconds.
- `host`: the region that served the request (`local` on your machine).
- `knowledge`: whether the knowledge store is ready on that host, and why not when it is not.

## MCP

`tools/mcp.mjs` speaks MCP over stdio (JSON-RPC, one message per line) with four tools:

- `ask` takes `prompt`, and optionally `brain` and `provider` (`none` by default: no model).
- `knowledge` takes `query` and optionally `k`, and returns the top answers and recalled facts from the store, or says plainly that the store is absent.
- `verdict` takes `name` and returns that bench verdict's time, bar and statement.
- `status` returns the vision count and the ladder's line.

Register it as `README.md` shows, or with `claude mcp add --scope project brain -- node /absolute/path/to/brain/tools/mcp.mjs`. `notes/mcp.md` and `bench/verdicts/mcp.json` have the details and the measurements.

## The packed install

`npm pack` packs only what `package.json` lists in `files`: the code and none of the runtime data. `README.md` walks through packing, installing into an empty directory and asking the installed copy. `bench/install.mjs` checks what the tarball holds and that every module the command line imports is inside it.

## Where every number comes from

<!-- sources -->
| what | number | verdict file | field | at |
| --- | --- | --- | --- | --- |
| compressed dump bytes read by the last store build | 385846687 | `bench/verdicts/knowledge.json` | `dump.bytes` | `2026-09-27T13:42:48.550Z` |
| seconds the last store build took | 100.92 | `bench/verdicts/knowledge.json` | `ingest.seconds` | `2026-09-27T13:42:48.550Z` |
| articles and facts in the store | 284749 articles, 1911943 facts | `bench/verdicts/knowledge.json` | `ingest.counts.articles`, `ingest.facts` | `2026-09-27T13:42:48.550Z` |
| store files and bytes | 13 files, 388459374 bytes | `bench/verdicts/knowledge.json` | `store.fingerprint.files`, `store.fingerprint.bytes` | `2026-09-27T13:42:48.550Z` |
| the ladder, composite day over day (in `README.md`) | +6.15 percent | `bench/verdicts/ladder.json` | `lastDelta` | `2026-09-28T01:41:41.300Z` |
| the packed tarball (in `README.md`) | 238 files, 1729955 bytes packed, 5713504 bytes unpacked | `bench/verdicts/install.json` | `files`, `tarballBytes`, `unpackedBytes` | `2026-09-28T01:14:09.037Z` |
| his bare prompts answered by the installed copy (in `README.md`) | 4 of 5 | `bench/verdicts/install.json` | `prompts[answered=true].length`, `prompts.length` | `2026-09-28T01:14:09.037Z` |
| his probe prompts answered by the site (in `README.md`) | 3 of 5 | `bench/verdicts/site-probe.json` | `ok`, `n` | `2026-09-28T01:24:06.785Z` |

The limits and status codes above are constants read from `act/ask-http.mjs`, not measurements. The bar re-checks every row: the row names one field per number, in order, and each number must equal that field's value in the file it cites (a value may be rounded to the decimals the row wrote, as the store build's seconds are). A field is a dot separated path: a name, an array index, `length` on an array, or `name[key=value]`, which keeps the array elements whose key reads that value. A row whose file has moved to a newer `at` is reported as stale.
