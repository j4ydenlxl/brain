# Published benchmark numbers, read from the web (data, not our measurements)

Every number in this file was read from a public page on the date given and is quoted as a
citation. Nothing here was measured by this tree. The organism's own scores on the same task
sets go in bench/verdicts/ and are compared to these rows in the docs with both sources named.
Web text never becomes a proposal.

## ARC Prize leaderboard, https://arcprize.org/leaderboard (read 2026-09-18 08:49 EDT)

Three task families. ARC-AGI-1 and ARC-AGI-2 are grid induction tasks (train pairs, then a test
grid), scored on a semi private set; ARC-AGI-3 is interactive environments, agents adapting on the
fly. Every row carries a cost per task, and the page's own words are that intelligence is
"solving them efficiently with minimal resources". Kaggle Systems run under strict compute limits
with no frontier API, which is the regime the organism runs in.

Rows as printed (score, cost per task), ARC-AGI-1 / ARC-AGI-2:

| system | ARC-AGI-1 | ARC-AGI-2 |
|---|---|---|
| GPT-6 Astra (Max) | 97.5%, $0.433 | 95.0%, $1.12 |
| GPT-6 Astra (None, no reasoning) | 86.0%, $0.214 | 59.6%, $0.370 |
| Claude Fable 5.1 (Max) | 97.5%, $1.40 | 90.0%, $4.49 |
| Claude Fable 5.1 (Low) | 90.0%, $0.366 | 78.3%, $0.952 |
| Claude Opus 5 (High) | 97.5%, $0.470 | 88.3%, $1.45 |
| Claude Opus 5 (Max) | 97.5%, $0.700 | 90.4%, $2.06 |
| Gemini 3.7 Flash (High) | 95.5%, $0.120 | 84.6%, $0.249 |
| Gemini 3.1 Pro (Preview) | 98.0%, $0.522 | 77.1%, $0.962 |
| DeepSeek V4 Flash 0731 (Max) | 89.0%, $0.021 | 61.4%, $0.042 |
| DeepSeek V4 Flash 0731 (None) | 11.8%, $0.002 | 2.1%, $0.004 |
| DeepSeek V4 Pro 0813 (None) | 13.0%, $0.023 | 0.8%, $0.040 |
| Grok 4.6 (XHigh) | 87.0%, $0.348 | 67.1%, $0.757 |
| GPT-5.6 Luna 2026-07-30 (None) | 3.3%, $0.005 | 0.8%, $0.008 |
| GPT-5.4 Nano (Low) | 18.3%, $0.010 | 1.5%, $0.010 |
| Inkling Small (None) | 5.5%, $0.006 | 0.0%, $0.011 |
| Kimi K3 (Max) | 94.5%, $0.770 | 60.4%, $1.59 |
| GLM-5 | 44.7%, $0.170 | 4.9%, $0.270 |
| Claude Sonnet 4.6 (High) | 86.5%, $1.19 | 60.4%, $2.70 |
| GPT-5.2 (no reasoning) | 12.3%, $0.047 | 0.8%, $0.082 |

ARC-AGI-3 (interactive): GPT-6 Astra (High) 54.8% Standard harness at $40.7K, 99.9% with the
Provider Adapter harness at $18.8K; Claude Opus 5 (High) 30.2% at $20.7K; most other rows 0 to 8%.

What the table says for this project, read plainly: reasoning frontier models have saturated
ARC-AGI-1 (97 to 98 percent) and stand at 85 to 95 percent on ARC-AGI-2, at $0.2 to $5 a task.
Without extended reasoning the same models drop to 3 to 13 percent on ARC-AGI-1 and near 0 on
ARC-AGI-2. The organism's program induction runs on a CPU at no cost per task; its honest place
on this chart is the cost axis, and its score on the public evaluation set is the number to
measure, whatever it is.

Kaggle Systems and the human panel on the same page, as printed:

| system | ARC-AGI-1 | ARC-AGI-2 |
|---|---|---|
| Human Panel | 98.0%, $17.00 | 100.0%, $17.00 |
| NVARC (Kaggle) | N/A | 27.6%, $0.200 |
| Icecuber (Kaggle, program search over a hand written DSL) | 17.0%, $0.200 | 1.6%, $0.130 |

Icecuber is the closest published relative of the organism's grid induction: a search over a
fixed vocabulary of grid operations with no language model. Its 17.0 percent on ARC-AGI-1 is the
bar for that class, and the frontier reasoning rows above it are the other class. Both are named
when the organism's public evaluation score is printed beside them.


## HumanEval, GSM8K and their relatives (read 2026-09-18 09:10 EDT)

Sources, each read on that date: the README table of https://github.com/openai/simple-evals (OpenAI's own
evaluation harness; HumanEval is Python pass@1, "Other Models (Reported)" rows are as the vendors report
them); the instruction tuned table of the Llama 3.1 model card at
https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/MODEL_CARD.md; Table 8 of the Qwen3
Technical Report at https://arxiv.org/html/2505.09388v1 (base models, before post training); and the
abstract of the Codex paper at https://arxiv.org/abs/2107.03374, which introduced HumanEval.

| benchmark | system | score | metric | source |
|---|---|---|---|---|
| HumanEval | o4-mini-high | 99.3 | pass@1 | simple-evals |
| HumanEval | gpt-4.1-2025-04-14 | 94.5 | pass@1 | simple-evals |
| HumanEval | Claude 3.5 Sonnet (reported) | 92.0 | pass@1 | simple-evals |
| HumanEval | gpt-4o-2024-11-20 | 90.2 | pass@1 | simple-evals |
| HumanEval | o3-high | 88.4 | pass@1 | simple-evals |
| HumanEval | Llama 3.1 8b | 72.6 | pass@1 | simple-evals |
| HumanEval | Codex 12B (2021) | 28.8 | pass@1 | Codex abstract |
| HumanEval | Codex 12B, 100 samples (2021) | 70.2 | pass@100 | Codex abstract |
| HumanEval | GPT-J (2021) | 11.4 | pass@1 | Codex abstract |
| HumanEval | GPT-3 (2021) | 0 | pass@1 | Codex abstract |
| MultiPL-E HumanEval | Llama 3.1 405B / 70B / 8B Instruct | 75.2 / 65.5 / 50.8 | pass@1, 0-shot, average over languages | Llama 3.1 card |
| GSM8K | Llama 3.1 405B / 70B / 8B Instruct | 96.8 / 95.1 / 84.5 | em_maj1@1, 8-shot CoT | Llama 3.1 card |
| GSM8K | Llama 3 8B Instruct | 80.6 | em_maj1@1, 8-shot CoT | Llama 3.1 card |
| GSM8K | Qwen3-1.7B-Base | 75.44 | 4-shot CoT | Qwen3 report, Table 8 |
| GSM8K | Qwen2.5-1.5B-Base | 68.54 | 4-shot CoT | Qwen3 report, Table 8 |
| GSM8K | Qwen3-0.6B-Base | 59.59 | 4-shot CoT | Qwen3 report, Table 8 |
| GSM8K | Gemma-3-1B-Base | 2.20 | 4-shot CoT | Qwen3 report, Table 8 |
| EvalPlus | Qwen3-1.7B-Base / Qwen3-0.6B-Base | 52.70 / 36.23 | as the report prints it | Qwen3 report, Table 8 |

Read plainly. Both sets are saturated at the frontier: HumanEval pass@1 runs from 88 to 99 percent and GSM8K
from 95 to 97 percent for the large instruction tuned models, so a score there is a floor a system must
clear, not a place to beat anyone. The model this tree runs against, qwen3:1.7b on the local Ollama, is
reported by its own authors at 75.44 percent on GSM8K and 52.70 on EvalPlus as a base model (the post
trained weights we run are not in that table). The number this project can own is not the model's score:
it is the gap between the same small model alone and the same model inside the organism, on the same
questions, measured here, printed beside these rows. HumanEval in this tree runs as MultiPL-E's
JavaScript translation (bench/fixtures/public/SOURCES.md says why), so the MultiPL-E row is the nearer
relative and the Python rows are the far one.
