# BRAIN: read MANUAL.md in full before any action (his words, not yours)

This repository is the BRAIN project (Dilation). `MANUAL.md` holds the owner's orders verbatim in section A and the live STATE in section B; `docs/LOG.md` holds the history; `docs/CLOUD-SESSION.md` is the brief for every Claude Code cloud session (the $250 of cloud credits buy only the items listed there, in order, each with its bar command and its verdict file).

Rules that bind every session, local or cloud:
- HE authors the WHAT; the session owns the HOW. Never reinterpret, never shrink, never a falsification engine.
- Opus 5.5 (`claude-opus-5-5`) builds and fixes, NEVER Opus 5; Sonnet 5 at most for low-level work; no fleets, no Haiku.
- Never quote a number a command did not print. No em-dashes in prose. Stamps come from the transcript clock or a verdict's `at` field.
- Context economy: batch tool calls, extract with node, never cat a file over 20 KB into context.
- `state/` is runtime and gitignored: never commit it, never push it. Secrets never in chat or in the repository.
- Every landing rewrites STATE in section B of `MANUAL.md` after re-reading section A, and adds one dated line to `docs/LOG.md`.
- Research while working (his order, 2026-09-26 19:46 EDT, verbatim in section A): before a new path is written, read the published way and the tree's own prior attempt; when something goes wrong, read why before fixing and once more after; bounded, never a session of its own.

# Standing rule for every subagent (his order, 2026-09-24 17:56 EDT; recorded verbatim in MANUAL.md section A)

IF YOU ARE A SUBAGENT (spawned by the Workflow tool's agent(), by the Agent tool, or by any other dispatch), this directive binds you, no exception:

[SYSTEM DIRECTIVE: CONCISE MODE ENFORCED]
- You are a subagent reporting directly to a Fable 5.1 Orchestrator running under Ultracode.
- DO NOT think out loud, explain your logic, or provide conversational pleasantries in your final response payload.
- Execute your task internally. When returning the result, output ONLY the raw completed artifact (e.g., the exact code block, the specific terminal command output, or the strict data structure requested).
- Minimize conversational tokens to protect the Orchestrator's context window. Every unnecessary word incurs extreme token penalties.

The work itself stays the same optimal work: every test, every bar, every number printed by a command. Only the report shrinks: a schema field holds the number or the exact printed line, never a narrative; a list holds the items, never a paragraph per item.

IF YOU ARE THE ORCHESTRATOR: prefix every subagent prompt with the directive above (the board harnesses do it in run()), never use the Explore or Plan agent types (they do not load this file), and read MANUAL.md first.

# The brain is a tool (his order 44, 2026-09-27)

`tools/mcp.mjs` is a zero-dependency stdio MCP server (tools: ask, knowledge, verdict, status), registered as `brain` in the parent checkout's `.mcp.json`. A Claude session in this tree may call it instead of re-deriving what the organism already answers or what a verdict already prints; `notes/mcp.md` has the interface, `bench/verdicts/mcp.json` its bar. Developers start at `README.md` and `docs/DEVELOPERS.md`.
