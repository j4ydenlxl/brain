# BRAIN

The BRAIN is a persistent computational organism named Dilation: cells wired into circuits and regions, grown by generations, measured by benches, and asked through one function, `ask()` in `act/prompt.mjs`. Node `>=24`, ES modules, zero dependencies.

## What it is, in his words

The owner wrote what the BRAIN must become. It is to be "a pro at everything", it "should know everything that exists or existed", and "Anyone on their smartphones should be able to use it". His test for every claim is his own: "I SHOULD BE ABLE TO TEST AND USE IT". This page exists because of his order 44: "I want the Brain to be a very important tool", "even for you for further ambitious projects", "and for developesr all across". And the rule this page is held to: "My vision must be reached, not predicted".

So this page promises only what a command prints. `node bench/developers.mjs` runs every command below: each shell command exactly as written, the library example from a scratch copy whose `./` imports point at the checkout, and the MCP snippet with its placeholder path set to the checkout. It compares the first line each one printed with the line written under it (an HTML comment, so it does not render here), and for every ask it also checks the answer itself: the answer line, the route and provenance line of the footer, or the JSON fields. A planted wrong line must fail every one of those checks. The verdict is `bench/verdicts/developers.json`.

## Where it stands

The ladder's line, from `bench/verdicts/ladder.json` at `2026-09-28T01:41:41.300Z`:

> day over day: composite +6.15 percent, target 5 to 10 percent: met

What answers today, with no model: greetings and questions about itself (the conversation region), arithmetic, equations, sequences and fractions (exact, in `act/solve.mjs`), and facts from an ingested Wikipedia store when that store is built on the machine (the knowledge tier). Everything else is the memory miss unless a model cell is configured; `docs/DEVELOPERS.md` lists each case and how to add a model. The packed copy answered 4 of 5 of his bare prompts; the fifth, a fact, needs the store, which the package does not carry. The site answered 2 of 5 of his probe prompts, because the site has no model cell and no store yet.

Each number here equals the field named beside it in the verdict file that measured it:

<!-- sources -->
| what | number | verdict file | field | at |
| --- | --- | --- | --- | --- |
| the ladder, composite day over day | +6.15 percent | `bench/verdicts/ladder.json` | `lastDelta` | `2026-09-28T01:41:41.300Z` |
| the packed tarball | 238 files, 1729955 bytes packed, 5713504 bytes unpacked | `bench/verdicts/install.json` | `files`, `tarballBytes`, `unpackedBytes` | `2026-09-28T01:14:09.037Z` |
| his bare prompts answered by the installed copy | 4 of 5 | `bench/verdicts/install.json` | `prompts[answered=true].length`, `prompts.length` | `2026-09-28T01:14:09.037Z` |
| his probe prompts answered by the site | 3 of 5 | `bench/verdicts/site-probe.json` | `ok`, `n` | `2026-09-28T01:24:06.785Z` |

## The command line

From the checkout, make a brain, then ask it:

```bash
node bin/brain.mjs init dilation
```
<!-- prints: initialized dilation  seed=basic -->

```bash
node bin/brain.mjs ask dilation "hey" --provider null
```
<!-- prints: ask dilation  fa690b82061edfd2  3 chars -->
<!-- line-matches: ^answered natively by the conversation region \(kind greeting, \d+ ns\), with no model, no memory read and no network\.$ -->
<!-- line-matches: ^Hello\. I am Dilation, a computational organism -->
<!-- line-matches: ^answered from memory  memory hits 0  web pages 0  llm null/- \d+\.\d+ms$ -->
<!-- line: route direct  provenance native -->

The first line names the brain, the prompt's hash and its length; the answer follows (here: answered natively by the conversation region, with no model, no memory read and no network), then a footer that says which route answered and whether any model, memory or network was used (here: memory hits 0, web pages 0, llm null, route direct, provenance native). `--provider null` asks no model and opens no socket; without a `--provider`, an ask that reaches the model tier first probes a local Ollama (`askModel` in `act/prompt.mjs`), so every ask on this page names its provider. `node bin/brain.mjs --help` lists every command. State lives under `state/` in the checkout, or wherever `BRAIN_STATE_DIR` points.

## The library

Save this as `example.mjs` in the checkout and run it:

```js
import { ask } from './act/prompt.mjs';
import { seedBasic } from './seeds/basic.mjs';
const brain = seedBasic({ name: 'dilation', ledger: 'off' });
const a = await ask(brain, 'hey', { provider: 'null' });
console.log(a.route + ' ' + a.provenance.answer + '\n' + a.text);
```
<!-- file: example.mjs -->

```bash
node example.mjs
```
<!-- prints: direct native -->
<!-- line-matches: ^answered natively by the conversation region \(kind greeting, \d+ ns\), with no model, no memory read and no network\.$ -->

`provider: 'null'` means no model and no socket. The returned object carries the same fields the command line prints; `docs/DEVELOPERS.md` names each one.

## HTTP

The site's endpoint takes the same prompt and returns the footer fields as one JSON object:

```bash
curl -s -X POST https://dilation.dev/api/ask -H "content-type: application/json" -d '{"prompt":"hey"}'
```
<!-- prints-json: text -->
<!-- json: ok = true -->
<!-- json: route = direct -->
<!-- json: provenance.answer = native -->
<!-- json: native.kind = greeting -->
<!-- json: llm.provider = null -->
<!-- json: promptHash = fa690b82061edfd2 -->

It answers the greeting from the conversation region (`provenance.answer` is `native`, `native.kind` is `greeting`) and asks no model (`llm.provider` is null). A GET on the same path prints the usage line and the field names. Limits and status codes are in `docs/DEVELOPERS.md`.

## MCP (the BRAIN as a tool for Claude and other MCP clients)

`tools/mcp.mjs` is a stdio MCP server with four tools: `ask`, `knowledge`, `verdict` and `status`. Register it in a project's `.mcp.json`, with the absolute path of your checkout:

```json
{
  "mcpServers": {
    "brain": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/brain/tools/mcp.mjs"]
    }
  }
}
```
<!-- mcp-tools: ask, knowledge, verdict, status -->
<!-- needs: tools/mcp.mjs -->

Or from a shell: `claude mcp add --scope project brain -- node /absolute/path/to/brain/tools/mcp.mjs`. The `ask` tool runs with no model unless it is asked for one; `notes/mcp.md` has the details.

## The packed install

From an empty directory beside your checkout (here the checkout is the folder `brain`):

```bash
npm pack ../brain
```
<!-- prints-matches: ^brain-\d+\.\d+\.\d+\.tgz$ -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

```bash
npm init -y
```
<!-- prints-matches: ^Wrote to .*package\.json:$ -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

```bash
npm install ./brain-0.1.0.tgz --no-audit --no-fund
```
<!-- prints-matches: ^added \d+ packages? in -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

```bash
node node_modules/brain/bin/brain.mjs --version
```
<!-- prints: 0.1.0 -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

```bash
node node_modules/brain/bin/brain.mjs init dilation
```
<!-- prints: initialized dilation  seed=basic -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

```bash
node node_modules/brain/bin/brain.mjs ask dilation "hey" --provider null
```
<!-- prints: ask dilation  fa690b82061edfd2  3 chars -->
<!-- line-matches: ^answered natively by the conversation region \(kind greeting, \d+ ns\), with no model, no memory read and no network\.$ -->
<!-- line: route direct  provenance native -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

The installed copy answers the greeting natively, as the checkout does. A fact needs the knowledge store, which the package does not carry, so the installed copy says it does not carry that yet:

```bash
node node_modules/brain/bin/brain.mjs ask dilation "What is the capital of France?" --provider null
```
<!-- prints: ask dilation  115049a298532be2  30 chars -->
<!-- line: I do not carry that yet: I answer greetings and questions about myself natively, arithmetic and equations exactly, word problems with my own programs and facts I ingested from memory; no language model is configured on this host. -->
<!-- line: route direct  provenance memory -->
<!-- cwd: fresh -->
<!-- needs: bench/verdicts/install.json -->

The package carries the code and none of the runtime data: no `state/`, no knowledge store, no verdicts. `bench/install.mjs` is the bar that checks what the tarball holds.

## Going deeper

`docs/DEVELOPERS.md` covers each surface in depth: what answers without the knowledge store and what needs it, how to build the store, the model cell's three variable names, every footer field, the HTTP limits, and where every number on both pages comes from.

## Licence

The source is proprietary: `LICENSE` reserves all rights, and no licence to copy, modify or redistribute it is granted without written permission from the owner.
