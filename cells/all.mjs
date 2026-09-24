// cells/all.mjs: EVERY KIND THIS REPOSITORY DEFINES, in one import. cells/index.mjs is the
// cell library proper; this barrel adds the kinds that live with their own subsystem, so a
// process that only has a snapshot can deserialize it.
//
// Why it exists: Brain.restore needs a kind registered before it can rebuild a cell of that
// kind, and cli/state.mjs loadBrain used to import cells/basic.mjs alone, so `brain status
// whole` threw on the first substrate, phv, memory, mind, world or solve cell it met
// (notes/whole.md request 2). Importing this module registers all of them.
//
// Not here on purpose: bench/parallel.mjs and bench/throughput.mjs both define the kind
// 'bench.relay', so importing both would throw 'cell kind already defined'. They are bench
// scaffolding, never in a snapshot, and each bench imports its own.
import './index.mjs';        // basic, perception, dynamics, reasoning, stats, control, sequence, graph, fhrr
import './grid.mjs';         // grid.count, grid.components, grid.symmetry, grid.overlay
import './learning.mjs';     // reward.source, error.aggregate, modulator, learn.apply, learn.explore
import './memory.mjs';       // memory.working, episodic, semantic, procedural, sequence, self, consolidate, forget
import './simulate.mjs';     // simulate.plan, decide.argmax, workspace.*, attention.goal, simulate.counterfactual
import '../core/substrate.mjs';    // substrate
import '../capability/router.mjs'; // solve
import '../capability/skills.mjs'; // skill
import '../mind/index.mjs';        // mind.tokenize, mind.context, mind.assoc, mind.decode
import '../world/actuators.mjs';   // world.relay, world.http, world.fs, world.proc, world.clock, world.net.listen
import '../world/senses.mjs';      // sense.poll, sense.watch, sense.stdin
import '../io/sources.mjs';        // source.file, source.stdin, source.timer, source.http, source.watch
import '../io/sinks.mjs';          // sink.stdout, sink.file, sink.http
import '../tasks/sequence.mjs';    // seq.fit
import '../lab/kinds.mjs';         // lab.answer
import '../generations/palette.mjs'; // gen.node, gen.ema

export { listKinds, hasKind, getKind } from '../core/cell.mjs';
