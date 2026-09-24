// tools/frontier-check.mjs: one call to a frontier model through the env provider, so the
// frontier comparison can be set up without a key ever passing through this repository.
//
// The two variables are NAMED here and their values live only in the user's environment:
//   BRAIN_FRONTIER_BASE  the base url, for Anthropic's OpenAI compatible endpoint
//                        https://api.anthropic.com/v1 (path /chat/completions is appended)
//   BRAIN_FRONTIER_KEY   the key, sent once in the authorization header by act/llm.mjs and
//                        scrubbed from every string that module returns
// This tool prints whether each variable is set, never a value, then asks the model one
// arithmetic question and prints ok, ms, tokens and the answer text. Exit 1 when the call
// did not go through, with the provider's reason (already scrubbed).
//
//   node tools/frontier-check.mjs [--model claude-opus-5] [--base-name X] [--key-name Y]
import { complete } from '../act/llm.mjs';

const argv = process.argv.slice(2);
const flag = (name, dflt) => { const i = argv.indexOf('--' + name); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : dflt; };
const model = flag('model', 'claude-opus-5');
const baseName = flag('base-name', 'BRAIN_FRONTIER_BASE');
const keyName = flag('key-name', 'BRAIN_FRONTIER_KEY');

const setOrNot = (n) => (process.env[n] ? 'set' : 'unset');
console.log('frontier check: model ' + model);
console.log('  ' + baseName + ' ' + setOrNot(baseName));
console.log('  ' + keyName + ' ' + setOrNot(keyName));
if (!process.env[baseName] || !process.env[keyName]) {
  console.log('not configured: set both variables in your own shell (never paste a key here), then reopen the app so this process inherits them');
  process.exit(1);
}
const r = await complete({
  provider: 'env', envBase: baseName, envKey: keyName, model,
  system: 'Answer with the number only.',
  prompt: 'What is 4759123 times 8823?',
  maxTokens: 64, timeoutMs: 60_000,
});
console.log('  ok ' + r.ok + (r.reason ? ' (' + r.reason + ')' : '') + ', ' + r.ms + ' ms, ' + r.tokens + ' tokens, model ' + r.model);
console.log('  answer: ' + JSON.stringify(r.text.trim()));
console.log('  exact:  ' + (4759123n * 8823n).toString());
process.exit(r.ok ? 0 : 1);
