# Cloud cell: where the knowledge store lives when dilation.dev answers

Board 31, item cloud-cell, 2026-09-27. Model OFF for every measurement here (provider null, no socket, no model call, port 11434 never touched). Every number below was printed by a command named in the Measured section; the web facts were read on 2026-09-27 from the URL beside each one.

## The published limits (read first)

| Fact | Value | Source |
| --- | --- | --- |
| Function bundle, uncompressed | 250 MB (500 MB Python); "The maximum size for a Function includes your JavaScript code, imported libraries and files ... and all files bundled in the function" | https://vercel.com/docs/functions/limitations (last_updated 2026-08-24) |
| Large functions Beta | up to 5 GB uncompressed; needs fluid compute with Active CPU; new projects eligible, existing ones set `VERCEL_SUPPORT_LARGE_FUNCTIONS=1`; only used for functions over the standard limit | same page, and https://vercel.com/changelog/vercel-functions-can-now-be-up-to-5-gb-in-package-size (June 29, 2026) |
| includeFiles | "A glob pattern to match files that should be included in your Vercel Function"; it counts toward the bundle | https://vercel.com/docs/project-configuration/vercel-json and the limitations page ("includeFiles and excludeFiles ... may affect the function size") |
| Max duration (fluid) | Hobby 300 s default and maximum; Pro 300 s default, 800 s maximum, 1800 s extended Beta; our vercel.json sets `maxDuration` 60 for api/ask.mjs | limitations page |
| Memory | Hobby 2 GB / 1 vCPU; Pro up to 4 GB / 2 vCPU | limitations page |
| Writable /tmp size | not stated on the limitations page; not measured | limitations page |
| Static / CLI uploads | the limits page lists CLI static file uploads 100 MB Hobby, 1 GB Pro; a changelog of June 17, 2026 says "We've removed CLI-specific deployment limits" without numbers | https://vercel.com/docs/limits (updated 2026-09-16), https://vercel.com/changelog/cli-deployment-limits-removed |
| Blob | max file 5 TB; cache limit 512 MB per blob; Hobby includes 1 GB storage and 10 GB transfer; example rates storage $0.023/GB, data transfer (iad1) $0.05/GB, Fast Origin Transfer (iad1) $0.06/GB, simple ops $0.40/1M, advanced ops $5.00/1M | https://vercel.com/docs/vercel-blob/usage-and-pricing (updated 2026-09-23) |
| Edge Config (now Global Config) | maximum store size 1 MB on every plan: no store of ours fits | https://vercel.com/docs/global-config/global-config-limits |
| VPS | DigitalOcean Basic droplets: 2 GiB / 1 vCPU $12.00/mo, 4 GiB / 2 vCPU $24.00/mo, 8 GiB / 4 vCPU $48.00/mo | https://www.digitalocean.com/pricing/droplets |
| Ollama over HTTP | OpenAI-compatible `/v1/chat/completions`; the API key is "required but ignored" | https://docs.ollama.com/api/openai-compatibility |
| Hosted model | Groq `openai/gpt-oss-20b` $0.075 input and $0.30 output per million tokens, about 1000 tokens/s, OpenAI-compatible base under api.groq.com/openai/v1 | https://console.groq.com/docs/models |

What the tree does today: `act/prompt.mjs` line 476 fixes `KNOWLEDGE_DIR` to `bench/fixtures/wiki/store` with no environment override, and `.vercelignore` drops `/bench/fixtures`, so the live function carries no store at all (the "none" row below). `act/llm.mjs` has three providers (null, ollama, env); the env provider posts to `base + '/chat/completions'` (line 207) with `Bearer ` plus the key (line 210). `act/ask-http.mjs` picks env only when both `BRAIN_LLM_BASE` and `BRAIN_LLM_KEY` are set and sends `BRAIN_LLM_MODEL` as the model (lines 20 to 27, 53 to 55).

## What the packs measured (bench/verdicts/knowledge-pack.json, rule cats-prior, barMet true)

Same 200-article held-out draw as bench/knowledge.mjs, plus a second population (200 visible articles with their own first sentence, seed knowledge-pack-visible-2026-09-27):

| Store | Bytes | Recall first | Top five | Visible first / top five | ms per query | Whole read (warm) |
| --- | --- | --- | --- | --- | --- | --- |
| full store | 388,459,374 | 62.5 | 78.5 | 72 / 98.5 | 4.257 | 113.6 ms |
| pack-200 | 199,984,995 | 62 | 78 | 72.5 / 98.5 | 3.319 | 68.4 ms |
| pack-100 | 99,984,881 | 59.5 | 77 | 67 / 90.5 | 3.036 | 35.4 ms |
| pack-50 | 49,984,699 | 29 | 38 | 31 / 42.5 | 2.565 | 21.3 ms |

Null arm (title words alone) 9 / 13 on the held-out draw, 15.5 on the visible draw. pack-200 is kept at bench/fixtures/wiki/pack-200 (13 files, largest records.bin 96,168,954 bytes); pack-100 and pack-50 were deleted after measuring.

## The four options

### (i) A packed store inside the function bundle

The api/ask.mjs static import closure is 137 files, 2,884,003 bytes, plus world/policy.json 1,613 bytes (includeFiles): 2,885,616 bytes of code. pack-200 plus that code is 202,870,611 bytes, 47,129,389 bytes under 250,000,000 (59,273,389 under 250 MiB). The full store plus code is 391,344,990 bytes, over the standard limit by 141,344,990, so it fits only through the 5 GB large-functions Beta. pack-200 is the largest measured cap that fits beside the code. Cold start adds no fetch: the pack is on the function's disk; locally it opens in 5 ms and reads whole in 68.4 ms (warm page cache, the floor). Monthly cost: no new line item. Wiring it needs edits this item does not own: `KNOWLEDGE_DIR` (or copying the pack to that path in the deploy tree), an `includeFiles` glob in vercel.json, and an exception in .vercelignore.

### (ii) The full store on Blob (or any static host), fetched at cold start

Fetch time for 388,459,374 bytes at a stated bandwidth (not measured on Vercel): 15.54 s at 25 MB/s, 3.88 s at 100 MB/s, 1.55 s at 250 MB/s, which is 25.9%, 6.5% and 2.6% of maxDuration 60 s. pack-200 would take 8.00 s, 2.00 s and 0.80 s. The local floor after the fetch is the whole-read time above (113.6 ms full). Every file is under Blob's 512 MB cache limit (largest store file records.bin 204,470,158 bytes). The files must land somewhere writable, and the limitations page states no /tmp size. Cost: storage $0.0089/mo for the full store, $0.0194 of data transfer per cold start, so the Hobby 10 GB transfer covers 25 cold starts a month. Edge Config (1 MB) is not a host for either store. It buys 0.5 recall-first points over pack-200 (62.5 against 62) for a cold start measured in seconds.

### (iii) An always-on VPS running ollama

qwen3:1.7b's model layer in the local ollama manifest is 1,359,279,776 bytes (1.27 GiB); the resident size under `ollama ps` was not measured because this board forbids port 11434. A 2 GiB droplet ($12.00/mo) leaves 0.73 GiB beside the weights for the OS, ollama and the context; a 4 GiB droplet ($24.00/mo) leaves 2.73 GiB. The function already reaches it with no code change: ollama speaks OpenAI-compatible `/v1/chat/completions` and ignores the key, so `BRAIN_LLM_BASE` pointed at the droplet's `/v1` plus any placeholder `BRAIN_LLM_KEY` takes the env path. No cold start on the model side once loaded. A VPS can also hold the full store on its own disk, but then answers leave the function.

### (iv) BRAIN_LLM_BASE / BRAIN_LLM_KEY / BRAIN_LLM_MODEL pointed at a provider

Supported today by act/llm.mjs's env provider (OpenAI-compatible, `/chat/completions`, Bearer). Groq `openai/gpt-oss-20b` at $0.075 / $0.30 per million tokens costs $0.2325 per 1,000 asks at 300 input plus 700 output tokens, $2.325 per 10,000. No bytes in the bundle, no cold fetch. Not measured here (model OFF); the key is set by him in the project environment, never in the repository.

## Table

| Option | Bytes in the function | Cold start added | Monthly cost | "h" | "hey" | "hi" | "What is the capital of France?" | Essay |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| none (live today) | 2,885,616 | 0 | $0 | not carried | native | native | not carried | not carried |
| (i) pack-200 in bundle | 202,870,611 | 0 fetch; 5 ms open, 68.4 ms whole read locally | $0 | not carried | native | native | knowledge route, article "Capital of France", first line is its categories fact | not carried |
| (ii) full store on Blob | 2,885,616 plus 388,459,374 fetched | 1.55 s to 15.54 s at 250 to 25 MB/s | $0.0089 storage plus $0.0194 per cold start | not carried | native | native | same as (i) | not carried |
| (iii) VPS plus ollama qwen3:1.7b | 2,885,616 | 0 (always on) | $12.00 or $24.00 | model (unmeasured) | native | native | model (unmeasured) | model (unmeasured) |
| (iv) env provider, Groq gpt-oss-20b | 2,885,616 | 0 | $0.2325 per 1,000 asks | model (unmeasured) | native | native | model (unmeasured) | model (unmeasured) |

"not carried" is the printed first line "I do not carry that yet: ..."; "native" is "answered natively by the conversation region (kind greeting ...)". The France answer does not contain Paris on its first line on either the store or pack-200; Paris appears only in a lower lead line. A store answers at most 3 of the five probes; the essay and "h" need a model, which only (iii) and (iv) supply, and either combines with (i).

## Recommendation

Ship (i) pack-200 inside the function and add (iv) for what no store answers: the deciding number is 0.5, the recall-first points the full store adds over pack-200 (62.5 against 62 on the same 200-article draw), which does not pay for a cold fetch of 1.55 s to 15.54 s.

## Measured

- `node tools/budget.mjs --ram-mb 4000 --disk-mb 200 --dir bench/fixtures/wiki/pack-200 --interval-ms 500 --record <scratch>/budget-200.json -- node --max-old-space-size=4000 tools/knowledge-pack.mjs --cap 200`, the same with `--disk-mb 100 --dir bench/fixtures/wiki/pack-100` and `--cap 100 --delete-after`, with `--disk-mb 50 --dir bench/fixtures/wiki/pack-50` and `--cap 50 --delete-after`, and `--disk-mb 1 --dir bench/verdicts/knowledge-pack.json` for `--measure-full`: the store rows and bench/verdicts/knowledge-pack.json (its `budgetCommands` lists the four). Run in the order 200, 100, 50, full with pack-200 already on disk: peak RAM 1519.5, 1332.0, 1265.2 and 503.3 MB, peak watched dir 190.7, 95.4, 47.7 and 0.0 MB (budget MB are MiB).
- `node tools/knowledge-pack.mjs --probe bench/fixtures/wiki/pack-200`, `--probe bench/fixtures/wiki/store`, `--probe none`: the five probe rows (provider null), recorded under `probes` in the verdict.
- A static import walk of api/ask.mjs (137 files, 2,884,003 bytes), a file listing of pack-200 and the store, and a small arithmetic script for the fetch times, headroom and prices above.
- Each budget watches only the directory its command writes (a missing directory is 0 bytes to tools/budget.mjs DirMeter), so no command depends on what else bench/fixtures/wiki holds or on the order the four run in. The earlier sequence watched all of bench/fixtures/wiki and was refused at `--disk-mb 900` once pack-200 was on disk (929.2 MiB before start).
- Every number in the verdict statement is checked against the lines the four commands printed (`checks.statementNumbersPrinted`, `unprintedNumbers`); the full store counts (284749 articles, 1911943 facts, 2196692 items) are now printed by `--measure-full`, and the statement quotes no platform limit.
- Read: act/prompt.mjs, act/llm.mjs, act/ask-http.mjs, api/ask.mjs, vercel.json, .vercelignore, bench/knowledge.mjs, bench/recall.mjs, memory/knowledge.mjs, the qwen3:1.7b ollama manifest file.
