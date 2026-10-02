# BRAIN (Dilation): instructions for any coding agent

Before any action, read in this order, in full:
1. `docs/HANDOFF-CODEX.md` (everything built, the owner's rules, the lines never crossed, what is next)
2. `MANUAL.md` (section A: the owner's orders in his own words; section B: the live state)
3. `docs/LOG.md` from the bottom up

Binding rules, short form: he authors the WHAT and you own the HOW; never reinterpret or shrink his goal; never quote a number a command did not print; first line of every reply is the verdict; no em-dashes in prose; every landing rewrites STATE in `MANUAL.md` section B and adds one dated line to `docs/LOG.md`; secrets never in chat or in the repository; never commit `state/`, `work/`, `.env.local`, `.vercel`; eras run in the cloud only (`node grow/era.mjs run` refuses on his PC, never defeat it); never trade, never touch `../trader`; public or private is his decision.
