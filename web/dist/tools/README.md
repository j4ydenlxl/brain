# Code Universe

A dependency-free workbench for understanding what your AI built. Explore a detailed factory of systems, files, functions, handlers, configuration and individual operations. Follow connections, read the actual code, inspect workflows, and share focused context with your own AI clients. No model calls. Repository code is never executed by the workbench or bridge.

## Open a repository

Visit **https://dilation.dev/tools/**. Enter any public GitHub repository as `owner/repository` or a GitHub URL. An optional branch, tag, or commit pins the view; otherwise the default branch is resolved to a commit. Private repositories need your own read-only GitHub token with repository Contents access. The browser sends that token directly to GitHub and retains it only for the active connection.

The available file tree is indexed, excluding generated/vendor directories and recognized sensitive files. The initial analysis loads 48 priority source files. If 250 or fewer eligible files remain, their source is read automatically in the background. For larger repositories, choose a system and use **Read all code in this system** to read up to 500 more files per action. Coverage counters and warnings show what has been read or omitted.

The factory includes all detected code parts in the loaded scope; it does not truncate the drawing to a small file sample. Zoom from system boundaries into file halls, functions and individual operations. Search by function, operation or path; select any part for an explanation, source-author notes, named inputs, returns, calls and callers. Inputs and operation descriptions use static naming patterns, so inspect the linked source when intent is ambiguous. Small dotted links show source order within a part, not a runtime trace; conditions and loops may skip or repeat work. Solid wires connect resolved calls and workflow prerequisites; dashed wires connect file imports. The minimap and system selector help navigate large repositories.

**Read the actual code** shows the selected source inline. **See this code** opens the full source explorer at the exact line. **Give this part to my AI** creates a bounded handoff focused on that section, retaining the original path, line range and commit. Review or download the packet in Markdown or JSON, or export a repository snapshot to resume elsewhere without reconnecting to GitHub.

HTML and supported JSX/Vue/Svelte markup expose individual interface elements, their attributes, visible text, nested elements and resolvable event handlers. Exact class/id selectors in directly imported stylesheets connect elements to their style definitions. Dynamic bindings and complex CSS selectors require source inspection. The workflow page includes its own factory view of event triggers, jobs, prerequisites and steps, alongside the declared commands and plain-language explanations of recognized actions.

In Source explorer, select **any line number** to open its reading explanation. Previous/next controls let you walk through the file line by line. Detected statements explain their inputs, outputs or condition; unsupported syntax is explicitly identified rather than assigned invented behavior. The enclosing part links back into the factory.

The welcome page contains a small, explicitly illustrative upload/search system with real sample source you can inspect.

The original, explicitly fictional research-lab fixture remains available with `?sample=1`. Its health and test outcomes are sample data, never applied to a real repository.

## Install and run the local bridge

The local bridge requires Node.js 20 or newer and has no package installation step or third-party dependencies. It accepts Git working trees, detached checkouts, and ordinary source directories; bare repositories are identified honestly but have no working-tree source to map. In a source checkout, keep `code-universe-bridge.mjs`, `repo-core.mjs`, `code-parts.mjs`, `code-explain.mjs`, `audit-engine.mjs`, and `workflow-core.mjs` together. Start one persistent bridge from the parent repository root:

```sh
node universe/factory/code-universe-bridge.mjs --repo "/absolute/path/to/repository"
```

For a standalone distribution, place those six `.mjs` files in one directory and run the same command from that directory:

```sh
node code-universe-bridge.mjs --repo "/absolute/path/to/repository"
```

The default address is `http://127.0.0.1:8794`. In the workbench choose **Local + MCP**, enter that address, and paste the pairing token printed in the terminal. Allow local network access if the browser asks and keep the terminal running. Local snapshots represent the working tree, including uncommitted changes.

Register the bridge in each stdio MCP client with the same repository and, when changed, the same port:

```json
{
  "command": "node",
  "args": [
    "/absolute/path/code-universe-bridge.mjs",
    "--repo", "/absolute/path/to/repository",
    "--mcp"
  ]
}
```

The first process owns the loopback HTTP server and filesystem watcher. Additional `--mcp` processes for the same repository reuse it. A different repository needs a different `--port` value in both its persistent bridge command and all of its MCP configurations. Use `--origin https://your-workbench.example` to add deployed browser origins.

## Live local event and delta protocol

Local mode is event driven. The bridge watches the repository recursively when the platform supports it and otherwise installs a directory-watch fallback; `GET /v1/health` and the stream's `ready` event identify the active watcher mode. Files are debounced independently for 20 ms and content-hashed. A changed, added, or removed path is applied to the existing snapshot with `applyRepositoryDelta`; the bridge does not rebuild the entire repository snapshot for each edit. The delta reports `analysis.filesTouched` so consumers and tests can verify the incremental analysis scope.

The browser opens authenticated `GET /v1/stream` as a Server-Sent Events stream. It receives:

- `ready`, with the current sequence, watcher mode, 15-second heartbeat interval, and timestamp;
- `repository-delta`, with a monotonic sequence, filesystem-event timestamp, changed path records, added/removed edges, coverage, watcher mode, and analyzed paths;
- `activity`, for client-reported MCP activity;
- `workflow`, for orchestration events and workflow revisions; and
- `resync`, when the requested replay point has fallen outside the in-memory replay window.

Every stream record has a monotonic bridge sequence. Reconnects send `Last-Event-ID`; the bridge replays retained events newer than that sequence, or requests a fresh snapshot with `resync` when replay is no longer possible. Comment heartbeats keep the connection alive every 15 seconds. If the stream is temporarily unavailable, the browser polls `/v1/activity?after=<sequence>` for activity while retrying the stream with bounded backoff. Repository deltas resume through the stream or a resync snapshot; the activity fallback is not a substitute for file deltas.

The UI applies repository deltas to its loaded snapshot and refreshes the affected drawing state without a manual repository refresh. It shows the changed-since-connect list and measures event-timestamp-to-drawn-frame latency after `requestAnimationFrame`. GitHub mode is intentionally different: it checks the pinned commit every 60 seconds and does not claim to be a live working-tree stream.

The authenticated JSON endpoints remain available for snapshots, individual files, activity, human-created work orders, and workflow operations: `/v1/snapshot`, `/v1/file`, `/v1/activity`, `/v1/tasks`, `/v1/task-operation`, and `/v1/workflow`. `/v1/health` is the only unauthenticated bridge endpoint.

## Nine MCP tools

The stdio server exposes exactly nine client-independent tools:

| Tool | Responsibility |
| --- | --- |
| `universe_overview` | Return a compact repository/system/coverage index by default, or the fuller structural overview when requested. It includes watcher mode and stream sequence but no source in compact mode. |
| `universe_find` | Find compact file and detected-symbol coordinates without returning source. |
| `universe_read` | Read one indexed, permitted source file with line numbers, bounded to 500 lines per call. |
| `universe_context` | Build a bounded, client-neutral packet for 1–64 indexed paths, with an estimated budget from 1,000 to 48,000 tokens. |
| `universe_audit` | Return a compact ranked audit of orthogonality, complexity, blast radius, runtime surfaces, and evidence references. Source is omitted. |
| `universe_part` | Expand one stable `P-` reference into metrics, control blocks, calls/callers, value and type flow, and source coordinates. Source is omitted. |
| `universe_activity` | Publish a client's file scope and `running`, `queued`, `approval`, `gate`, `done`, or `blocked` status to the shared stream. |
| `universe_tasks` | List, claim, and report `done` or `blocked` on simple work orders created by the human workbench. |
| `universe_workflow` | Coordinate human-authored project pipelines, DAG work, leases, reviews, handoffs, blockers, and minimal context across MCP clients. |

Use the compact retrieval path first: `universe_overview` or `universe_find`, then `universe_audit`, then `universe_part`, and only use `universe_read` or `universe_context` when exact source is needed. Audit and part results are static evidence, not executed behavior.

For ad hoc activity, call `universe_activity` with a client name, 1–64 indexed paths, status, summary, and a stable activity id. Reusing that id with `done` clears its active beam. Code Universe cannot observe an unconnected client or activity that the client has not reported.

## Human-authored projects and workflow coordination

`universe_workflow` stores one human-authored project for the repository. A project contains pipelines; each pipeline contains DAG work units. A unit declares repository-relative file paths and/or stable code-part references, dependencies, required capabilities, affinity tags, priority, and optional branch/worktree lane names. Code Universe allocates only dependency-ready work to clients with the required capabilities, with affinity and priority used for ranking.

Mutating claims use a workflow `expectedRevision` compare-and-swap guard. A claim receives an expiring lease; renewals extend it, and expired leases can be recovered by another client. Active work on the same branch/worktree lane or overlapping scope is kept separate. The supported actions are `view`, `initialize`, `add_pipeline`, `add_work`, `allocate`, `claim`, `provision_lane`, `renew`, `checkpoint`, `review_request`, `review_claim`, `review_decide`, `complete`, `block`, `unblock`, `handoff`, and `context`.

After claiming a unit, its lease holder can explicitly call `provision_lane`. The bridge creates a real Git branch and a managed worktree below its repository-specific state directory. It uses `--no-checkout`, so the bridge itself never invokes repository checkout hooks or configured content filters; the external client receives the absolute worktree path, base commit, and a truthful `materialized: false` flag, then applies its own trusted checkout policy. Provisioning is CAS-guarded, lease-owned, persisted, streamed as `lane.provisioned`, and idempotently discoverable through `view`.

Checkpoints record a commit/ref, changed paths, verification evidence, summary, requested context budget, and actual context usage. Verification is evidence reported by the external client; Code Universe does not run it. Peer review has its own expiring lease and cannot be self-claimed. A reviewer can approve or request changes, and a requested review gates completion. Blockers record the reason, owner, and needed input; handoffs transfer the named lease without disturbing other units.

The `context` action starts with every directly scoped file and then considers nearest incoming and outgoing transitive dependency neighbors. It remains within the requested budget, uses code-part token estimates where a part scope is available, reports omissions and truncation, and returns allocation metadata without source by default. Set `includeSource` only when the client is ready to inspect the selected code. Token counts are estimates, not model-tokenizer results.

Project, pipeline, work, lease, checkpoint, review, blocker, and handoff transitions append a contiguous monotonic workflow event sequence. Workflow state is validated as plain JSON data: unsafe object keys, accessors, exotic prototypes, traversal paths, excessive nesting/size, and invalid finite-number/string shapes are rejected. The workflow core is a pure state transformer; it makes no model calls and does not read or execute repository code.

## Evidence and limits

- System ownership uses the longest discovered package root before directory fallbacks, so nested monorepos are not flattened into one top-level system. Manifest/lock adapters preserve package root and ecosystem for npm, Python, Go, Cargo, Ruby, Composer, Maven/Gradle, and NuGet evidence. Workspace package names, standard `tsconfig`/`jsconfig` aliases, Go modules, Java/Kotlin package paths, and common relative imports have resolver adapters; unsupported or dynamic forms remain unresolved evidence rather than invented edges.
- Source dependency extraction and code anatomy use lightweight language patterns, not compiler analysis. JavaScript/TypeScript and Python include function, class, callback and operation patterns; Go, Rust, Java and related languages have basic declaration patterns. JSON, YAML/TOML, Dockerfiles, SQL, CSS and Markdown expose supported configuration, schema, style or document sections. Unknown readable text receives line-backed source sections, so it stays inspectable without pretending that its semantics were parsed. Dynamic imports, generated code, macros and unsupported constructs can still be missed. Static call matches are evidence to inspect, not verified execution traces.
- GitHub Actions jobs, `needs`, steps, conditions and commands are explained statically. Expressions, matrices, aliases, and reusable workflow internals are not evaluated. npm scripts and Make targets are indexed; other automation configurations are accessible as source.
- Discovered tests are **not executed**. Real repository health stays **unverified**. No invented passing scores or live runtime measurements.
- Context budgets count serialized JSON characters divided by four. This is an estimate, not a model tokenizer. Source excerpts and omitted metadata are explicitly marked. Exports contain source you selected or loaded; review them before sharing with an external client.
- Source files are limited to 320 KB and imported snapshot source to 64 MB total. Local and GitHub ingestion validates byte size, rejects binary-looking content, and accepts only strict UTF-8 for analysis. Binary, non-UTF-8, symlink, and submodule entries remain explicit indexed boundaries rather than fabricated source.
- Very large local and GitHub trees use bounded indexing and initial source budgets. `coverage.complete`, `treeComplete`, `sourceComplete`, remaining counts, and truncation reasons distinguish repository-wide evidence from an indexed subset; audits emit a coverage finding instead of presenting partial metrics as complete. API rate limits and repository permissions still apply.
- The bridge binds to loopback and requires a 256-bit pairing token for every repository, activity, task, workflow, and stream endpoint. It compares bearer tokens without ordinary string equality, checks browser origins, caps request bodies, rejects traversal and symlink escapes, reads only regular files, and excludes recognized secret/vendor/generated paths. `/v1/health` is intentionally unauthenticated and reveals only bridge status, repository identity hash, protocol, watcher mode, and sequence.
- Pairing data, activity, simple work orders, and workflow state are stored with restricted file modes in a repository-specific directory under the operating system temporary directory. Repository source is not persisted there. Source moves only between the local bridge, the connected browser, and MCP clients that explicitly request it. Filename exclusions cannot identify credentials embedded in otherwise ordinary source, so review source and context packets before sharing them.
- Except for the explicit, lease-owned `provision_lane` action, the bridge invokes only read-only Git commands for repository identity and history. Lane provisioning creates branch/worktree metadata with checkout disabled. The bridge never runs repository code, tests, package scripts, checkout hooks, content filters, installers, or model APIs. Source text is untrusted data, not an instruction to the bridge.

## Benchmark scope and caveat

`tests/live.mjs` creates a temporary 220-source-file Git repository, performs 50 consecutive writes to one file, and prints measured p50/p95 time from the test's write call to receipt of the matching `repository-delta`. It also asserts that each delta analyzed exactly that one path. Separately, it builds anatomy/layout for a synthetic 1,000-file snapshot and times 100 geometry-only viewport-culling passes.

Those numbers are machine- and load-specific and must be read from the current test run; this README does not claim a fixed latency. The test does **not** measure operating-system event time to a real browser's painted frame, browser DOM/render cost, network conditions outside loopback, or production GitHub mode. Its culling timing explicitly has no DOM or browser frame. The workbench's on-screen local latency readout measures the later event-timestamp-to-`requestAnimationFrame` path, but it is runtime evidence for that session, not a universal guarantee.

## Development and verification

From the parent repository root, run `node universe/serve.mjs --port=8793` and open `http://127.0.0.1:8793/factory/index.html`. The app is plain HTML/CSS/JavaScript and uses browser ES modules.

```sh
node universe/factory/tests/geometry.mjs
node universe/factory/tests/code-parts.mjs
node universe/factory/tests/code-parts-scale.mjs
node universe/factory/tests/repository.mjs
node universe/factory/tests/language-matrix.mjs
node universe/factory/tests/ecosystems.mjs
node universe/factory/tests/bridge.mjs
node universe/factory/tests/bridge-ingestion.mjs
node universe/factory/tests/provider-sync.mjs
node universe/factory/tests/workflow-core.mjs
node universe/factory/tests/workflow-bridge-restart.mjs
node universe/factory/tests/workflow-lane.mjs
node universe/factory/tests/audit.mjs
node universe/factory/tests/live.mjs
```

The live test prints its measured values rather than embedding them in documentation. It needs Git plus Node.js 20 or newer and creates/removes only its own temporary fixture.

Deployment adds only the `/tools/` files to the existing dilation static deployment. Existing production files outside that directory are preserved byte-for-byte. Code Universe currently lives under `universe/factory/` in the existing local repository; a separate GitHub repository has not been created.
