// bench/invariants.mjs - runs test/invariants.test.mjs and writes
// bench/verdicts/invariants.json. These are the properties the brain must hold whatever
// it is wired to do: determinism, snapshot equality, arrival never earlier than t + 1 +
// delay, kinds that cannot cross a port, a gate that cannot approve what a human owns.
// Most of them are also the tests that kill a mutant bench/mutants.mjs would otherwise
// leave alive, which is why this file and that one are run together.
//
//   node bench/invariants.mjs
//
// Exit code 0 only if every test passed and at least one test ran.
import { runFile } from './runner.mjs';
process.exit(await runFile('INVARIANTS', 'test/invariants.test.mjs', 'invariants.json'));
