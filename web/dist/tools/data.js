// SAMPLE DATA. An invented research lab, used only to sketch the factory.
// Nothing here is a measurement of a real repository. Every total, score and token count on
// screen is computed from these rows in model.js, so a changed row changes the page.
window.FACTORY_DATA = {
  project: { repo: 'sample/research-lab', branch: 'main', commit: '8c41d2e', synced: '2 min ago', date: '2026-09-13' },

  stages: [
    { id: 'A', name: 'Intake' }, { id: 'B', name: 'Parse' }, { id: 'C', name: 'Refine' }, { id: 'D', name: 'Embed' },
    { id: 'E', name: 'Store' }, { id: 'F', name: 'Retrieve' }, { id: 'G', name: 'Reason' }, { id: 'H', name: 'Ship' },
  ],

  // repo: the GitHub repository each system's code lives in.
  systems: [
    { id: 'S1', name: 'Crawl', repo: 'sample/research-lab' }, { id: 'S2', name: 'Documents', repo: 'sample/research-lab' },
    { id: 'S3', name: 'Index', repo: 'sample/research-lab' }, { id: 'S4', name: 'Answer', repo: 'sample/research-lab' },
    { id: 'S5', name: 'Quality', repo: 'sample/eval-harness' }, { id: 'S6', name: 'Platform', repo: 'sample/research-lab' },
  ],

  // Store rule: data out of stage E must go through stage F first.
  rules: { storeStage: 'E', retrieveStage: 'F' },

  // kind: step | store | gate | trigger.  issues: [type, test name, leak channel]
  primitives: [
    { id: 'crawl.fetch', sys: 'S1', stage: 'A', kind: 'step', owner: 'claude-desktop', lines: 412, exports: 3, tests: 24,
      desc: 'Downloads one page from a source. Never writes a store.',
      issues: [['leak', 'retries on 503', 'NET'], ['leak', 'follows redirects', 'NET'], ['leak', 'honours robots.txt', 'NET'], ['flaky', 'times out slow hosts']] },
    { id: 'html.extract', sys: 'S1', stage: 'B', kind: 'step', owner: 'cursor', lines: 538, exports: 4, tests: 31,
      desc: 'Pulls readable text and links out of a page.', issues: [] },
    { id: 'dedupe.simhash', sys: 'S1', stage: 'C', kind: 'step', owner: 'claude-code', lines: 244, exports: 2, tests: 12,
      desc: 'Drops pages that are near-copies of pages already seen.', issues: [['flaky', 'near-duplicate threshold']] },
    { id: 'upload.intake', sys: 'S2', stage: 'A', kind: 'step', owner: 'cursor', lines: 188, exports: 2, tests: 9,
      desc: 'Accepts a file someone uploads and checks its type.', issues: [] },
    { id: 'pdf.parse', sys: 'S2', stage: 'B', kind: 'step', owner: 'codex', lines: 690, exports: 3, tests: 22,
      desc: 'Turns a PDF into plain text with page numbers.', issues: [] },
    { id: 'chunk.split', sys: 'S2', stage: 'C', kind: 'step', owner: 'codex', lines: 286, exports: 4, tests: 18,
      desc: 'Cuts text into chunks sized for a model. The declared single writer of store.chunks.',
      issues: [['fail', 'writes are idempotent'], ['leak', 'stamps chunk ids', 'CLOCK'], ['leak', 'loads the sample PDF text', 'FS'],
               ['flaky', 'splits at sentence ends'], ['flaky', 'respects the token budget']] },
    { id: 'embed.batch', sys: 'S3', stage: 'D', kind: 'step', owner: 'codex', lines: 322, exports: 2, tests: 14,
      desc: 'Turns chunks into vectors, 64 at a time.', issues: [] },
    { id: 'store.chunks', sys: 'S3', stage: 'E', kind: 'store', writer: 'chunk.split', owner: 'claude-code', lines: 210, exports: 5, tests: 16,
      desc: 'Where every chunk lives. One writer allowed: chunk.split.', issues: [] },
    { id: 'store.vectors', sys: 'S3', stage: 'E', kind: 'store', writer: 'embed.batch', owner: 'claude-code', lines: 264, exports: 5, tests: 11,
      desc: 'Where every vector lives. One writer allowed: embed.batch.', issues: [['flaky', 'upsert under load']] },
    { id: 'retrieve.rank', sys: 'S4', stage: 'F', kind: 'step', owner: 'cursor', lines: 476, exports: 3, tests: 26,
      desc: 'Finds and orders the chunks that answer a question.', issues: [['leak', 'ties break stably', 'RAND']] },
    { id: 'answer.compose', sys: 'S4', stage: 'G', kind: 'step', owner: 'claude-desktop', lines: 598, exports: 2, tests: 19,
      desc: 'Writes the answer from the ranked chunks.', issues: [['flaky', 'cites every claim']] },
    { id: 'cite.verify', sys: 'S4', stage: 'G', kind: 'step', owner: 'claude-desktop', lines: 402, exports: 2, tests: 21,
      desc: 'Checks every quoted span against its source.', issues: [] },
    { id: 'report.render', sys: 'S4', stage: 'H', kind: 'step', owner: 'gemini-cli', lines: 356, exports: 3, tests: 13,
      desc: 'Lays out the answer and its citations as a report.', issues: [] },
    { id: 'golden.set', sys: 'S5', stage: 'F', kind: 'store', writer: null, owner: 'claude-code', lines: 120, exports: 2, tests: 6,
      desc: 'Questions with known-good answers. Read-only.', issues: [] },
    { id: 'eval.grade', sys: 'S5', stage: 'G', kind: 'step', owner: 'claude-code', lines: 388, exports: 3, tests: 15,
      desc: 'Scores each report against the golden set.', issues: [] },
    { id: 'regress.gate', sys: 'S5', stage: 'H', kind: 'gate', owner: 'codex', lines: 164, exports: 1, tests: 8,
      desc: 'Blocks a change that scores worse than the last one.', issues: [] },
    { id: 'schedule.cron', sys: 'S6', stage: 'A', kind: 'trigger', owner: 'gemini-cli', lines: 96, exports: 2, tests: 5,
      desc: 'Starts lines on a timetable.', issues: [] },
    { id: 'clock.source', sys: 'S6', stage: 'B', kind: 'step', owner: 'gemini-cli', lines: 58, exports: 1, tests: 4,
      desc: 'The one place the system reads the time.', issues: [] },
    { id: 'config.env', sys: 'S6', stage: 'C', kind: 'step', owner: 'cursor', lines: 142, exports: 2, tests: 7,
      desc: 'The one place the system reads settings.', issues: [['leak', 'defaults the model name', 'ENV']] },
    { id: 'cache.kv', sys: 'S6', stage: 'E', kind: 'store', writer: null, owner: 'codex', lines: 176, exports: 4, tests: 11,
      desc: 'Short-lived answers, expired by clock.source.', issues: [] },
  ],

  // [from, to, type, introduced by]   type: flow | writes | reads | signal
  edges: [
    ['crawl.fetch', 'html.extract', 'flow'],
    ['html.extract', 'dedupe.simhash', 'flow'],
    ['dedupe.simhash', 'store.chunks', 'writes', 'WO-0418'],
    ['upload.intake', 'pdf.parse', 'flow'],
    ['pdf.parse', 'chunk.split', 'flow'],
    ['chunk.split', 'store.chunks', 'writes'],
    ['chunk.split', 'embed.batch', 'flow'],
    ['embed.batch', 'store.vectors', 'writes'],
    ['store.chunks', 'retrieve.rank', 'reads'],
    ['store.vectors', 'retrieve.rank', 'reads'],
    ['store.vectors', 'answer.compose', 'reads', 'WO-0409'],
    ['cache.kv', 'retrieve.rank', 'reads'],
    ['retrieve.rank', 'answer.compose', 'flow'],
    ['retrieve.rank', 'cite.verify', 'flow'],
    ['answer.compose', 'report.render', 'flow'],
    ['cite.verify', 'report.render', 'flow'],
    ['report.render', 'eval.grade', 'flow'],
    ['golden.set', 'eval.grade', 'reads'],
    ['eval.grade', 'regress.gate', 'flow'],
    ['regress.gate', 'retrieve.rank', 'flow', 'WO-0412'],
    ['clock.source', 'cache.kv', 'signal'],
    ['config.env', 'embed.batch', 'signal'],
    ['config.env', 'answer.compose', 'signal'],
  ],

  // Automation lines. runs: oldest → newest, P pass / F fail; secs: cycle time of each run.
  lines: [
    { id: 'nightly-crawl', trigger: 'schedule.cron · 02:00 daily', stations: ['schedule.cron', 'crawl.fetch', 'html.extract', 'dedupe.simhash', 'store.chunks'],
      state: 'stopped', stopAt: 'dedupe.simhash', reason: 'Audit gate: a second writer on store.chunks',
      runs: 'PPPPPPPPPPPPPF', secs: [402, 398, 411, 405, 396, 420, 409, 401, 399, 415, 407, 403, 410, 131] },
    { id: 'docs-upload', trigger: 'on every upload', stations: ['upload.intake', 'pdf.parse', 'chunk.split', 'embed.batch', 'store.vectors'],
      state: 'stopped', stopAt: 'chunk.split', reason: 'Test failed: chunk.split › writes are idempotent',
      runs: 'PPPPPPPPPPPPFF', secs: [38, 41, 37, 40, 39, 36, 42, 38, 40, 37, 39, 41, 12, 11] },
    { id: 'answer-report', trigger: 'on every question', stations: ['cache.kv', 'retrieve.rank', 'answer.compose', 'cite.verify', 'report.render'],
      state: 'running', runs: 'PPPPPPPPPPPPPP', secs: [4.2, 3.9, 4.4, 4.1, 3.8, 4.0, 4.3, 4.1, 3.9, 4.2, 4.0, 4.4, 4.1, 3.9] },
    { id: 'weekly-eval', trigger: 'schedule.cron · Sun 04:00', stations: ['golden.set', 'eval.grade', 'regress.gate'],
      state: 'idle', runs: 'PPPPPPPPPPPPPP', secs: [912, 934, 901, 925, 918, 940, 909, 921, 915, 930, 906, 927, 919, 911] },
  ],

  // AI clients connected over MCP. Each spends its own tokens under its own plan.
  agents: [
    { id: 'claude-code', name: 'Claude Code', surface: 'terminal', via: 'MCP · stdio', state: 'working' },
    { id: 'codex', name: 'Codex CLI', surface: 'terminal', via: 'MCP · stdio', state: 'working' },
    { id: 'claude-desktop', name: 'Claude Desktop', surface: 'desktop app', via: 'MCP connector', state: 'idle' },
    { id: 'cursor', name: 'Cursor', surface: 'editor', via: 'MCP · stdio', state: 'idle' },
    { id: 'gemini-cli', name: 'Gemini CLI', surface: 'terminal', via: 'MCP · stdio', state: 'offline' },
  ],

  // status: approval (waiting on you) | queued | running | gate (QC gate) | done
  workOrders: [
    { id: 'WO-0421', title: 'Restore one writer on store.chunks', status: 'approval', agent: 'claude-code', opened: '14:32',
      scope: ['dedupe.simhash', 'chunk.split', 'store.chunks'], detail: 'Route dedupe.simhash through chunk.split and delete the direct write.' },
    { id: 'WO-0420', title: 'Pin the clock in chunk.split tests', status: 'running', agent: 'codex', opened: '14:31', scope: ['chunk.split'] },
    { id: 'WO-0419', title: 'Record and replay the network in crawl.fetch tests', status: 'gate', agent: 'claude-desktop', opened: '13:58', scope: ['crawl.fetch'] },
    { id: 'WO-0417', title: 'Seed the ranker in retrieve.rank tests', status: 'queued', agent: 'cursor', opened: '13:40', scope: ['retrieve.rank'] },
    { id: 'WO-0418', title: 'Write crawl chunks straight to the store', status: 'done', agent: 'claude-code', opened: '14:02',
      scope: ['dedupe.simhash', 'store.chunks'], flag: 'Added the second writer on store.chunks' },
    { id: 'WO-0416', title: 'Batch embeddings 64 at a time', status: 'done', agent: 'codex', opened: '12:15', scope: ['embed.batch'] },
  ],

  activity: [
    { t: '14:32:10', who: 'audit', kind: 'human', text: 'Drafted WO-0421 to restore one writer. Waiting on your approval.' },
    { t: '14:31:44', who: 'codex', kind: 'agent', claim: 'WO-0420' },
    { t: '14:30:52', who: 'qc gate', kind: 'stop', text: 'Stopped docs-upload at chunk.split: writes are idempotent failed.' },
    { t: '14:29:40', who: 'audit', kind: 'crit', text: 'Single writer broken: store.chunks now has two writers.' },
    { t: '14:12:03', who: 'claude-code', kind: 'agent', text: 'Merged WO-0418. dedupe.simhash now writes store.chunks.' },
    { t: '13:58:20', who: 'claude-desktop', kind: 'agent', text: 'Sent WO-0419 to the QC gate.' },
    { t: '13:41:07', who: 'github', kind: 'sync', text: 'Synced sample/research-lab at 8c41d2e. 3 files changed.' },
  ],

  // The last 14 days, oldest first: the 7 before this week, then this week.
  days: ['Aug 31', 'Sep 1', 'Sep 2', 'Sep 3', 'Sep 4', 'Sep 5', 'Sep 6', 'Sep 7', 'Sep 8', 'Sep 9', 'Sep 10', 'Sep 11', 'Sep 12', 'Sep 13'],
  series: {
    commits: [18, 22, 17, 25, 21, 19, 24, 23, 28, 26, 31, 27, 33, 38],        // commits merged per day
    calls: [210, 240, 198, 265, 251, 230, 244, 268, 290, 275, 312, 298, 301, 322], // MCP tool calls per day
  },

  repos: [
    { name: 'sample/research-lab', branch: 'main', commit: '8c41d2e', synced: '2 min ago', files: 186, private: true },
    { name: 'sample/eval-harness', branch: 'main', commit: '1f09ab3', synced: '2 min ago', files: 41, private: false },
  ],

  connectors: [
    { name: 'code-universe', where: 'local · stdio', role: 'This factory. Reads the repo, draws the floor, runs the audit. Makes no model calls.' },
    { name: 'GitHub', where: 'Claude connector', role: 'Repo sync, branches and pull requests.' },
    { name: 'Filesystem', where: 'local · stdio', role: 'Lets a connected AI read and edit the working tree.' },
  ],

  // The factory's MCP surface. `today` names the tool in universe/mcp.mjs that already covers it.
  tools: [
    { name: 'factory_floor', does: 'The map: primitives, edges, lines and health', today: 'universe_overview' },
    { name: 'factory_find', does: 'Find a primitive by name or path', today: 'universe_find' },
    { name: 'factory_primitive', does: 'One primitive: contract, owner, tests, health', today: 'universe_planet' },
    { name: 'factory_blast', does: 'Everything downstream of a change', today: 'universe_neighbourhood' },
    { name: 'factory_audit', does: 'Orthogonality rules: single writer, layers, cycles', today: 'universe_audit' },
    { name: 'factory_tests', does: 'Hermetic test ledger with leak channels', today: null },
    { name: 'factory_packet', does: 'The smallest context one work order needs', today: null },
    { name: 'factory_dispatch', does: 'Post a work order for a named AI', today: null },
    { name: 'factory_claim', does: 'An AI takes a work order and reads its packet', today: null },
    { name: 'factory_report', does: 'An AI reports a result and the QC gate runs', today: null },
    { name: 'factory_line', does: 'Stop or release a line. Release is human-only.', today: null },
  ],
};
