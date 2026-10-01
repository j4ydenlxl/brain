// grow/app-slug.mjs: IS THIS PROMPT A BUILD REQUEST, AND WHICH APP (his NEXT-WEEK.md Day 2 builder arm: "make me a
// todo app" makes the organism write it, run it in the sandbox and serve it at a URL). Pure: no import at all,
// because act/ask-http.mjs imports it inside the Vercel function and grown/apps.mjs imports it on every ask.
//
// buildRequest(prompt) returns { name, slug } or null, deterministically:
//   1. null for a prompt that is not a string of 1 to MAX_PROMPT (120) characters after trim.
//   2. Normalize: lower case, curly quotes to straight, runs of space to one, trailing [.!?]+ cut, then any
//      trailing politeness cut: TAIL_RE = /(?:\s*,?\s*(?:please|pls|thanks|thank you|for me))+$/.
//   3. HEAD_RE must match the whole text:
//        ^(?:(?:please|pls)\s*,?\s+)?
//         (?:(?:can|could|would|will) you\s+(?:please\s+)?|i want you to\s+|i need(?: you to)?\s+)?
//         (make|build|create|write|code|generate|develop|design)
//         (?:\s+(?:me|us))?(?:\s+(?:a|an|the))?\s+(.+)$
//      so a request OPENS with the verb (after "please", "can you", "could you", "i want you to", "i need").
//   4. The rest is the noun phrase: 1 to 6 words, each /^[a-z0-9][a-z0-9'-]*$/ (no punctuation), none of them a
//      CLAUSE word (that, which, who, whom, whose, about, of, if, because): "create a function that reverses a
//      string" and "write an essay about the ocean" are asks for text, never an app.
//   5. The phrase contains an APP_NOUNS entry (a multi-word one as consecutive words): "make a sandwich" and
//      "build muscle" carry none and are null.
//   6. name: the phrase, with a trailing DROP word (app, application, web app, webapp, website, site, web page,
//      webpage, widget) removed when another word stays ("todo app" -> "todo", "web app" stays "web app").
//   7. slug: the name lower cased, every run of [^a-z0-9] -> "-", "-" trimmed from both ends, cut to 40 characters
//      and trimmed again; it must match SLUG_RE = /^[a-z0-9][a-z0-9-]{0,39}$/, else null.
// "make me a todo app" -> { name: 'todo', slug: 'todo' }; "build a pomodoro timer" -> 'pomodoro timer' /
// 'pomodoro-timer'; "write me a tip calculator app please" -> 'tip calculator' / 'tip-calculator'.
// Author: Opus 5.5 builder for the Fable 5.1 orchestrator, Day 2 (2026-10-01), his NEXT-WEEK.md builder arm.

export const MAX_PROMPT = 120;
export const MAX_WORDS = 6;
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const APP_NOUNS = Object.freeze([
  'app', 'application', 'web app', 'webapp', 'website', 'site', 'web page', 'webpage', 'page', 'tool', 'game', 'widget',
  'calculator', 'timer', 'stopwatch', 'clock', 'counter', 'todo', 'to-do', 'todo list', 'notes', 'notepad', 'checklist',
  'tracker', 'converter', 'dashboard', 'editor', 'planner', 'journal', 'quiz', 'calendar', 'player', 'generator', 'picker',
  'board', 'list',
]);
/** The trailing words a name sheds when another word stays, longest first. */
export const DROP = Object.freeze(['web app', 'web page', 'application', 'website', 'webpage', 'webapp', 'widget', 'site', 'app']);
export const CLAUSE = Object.freeze(['that', 'which', 'who', 'whom', 'whose', 'about', 'of', 'if', 'because']);
export const VERBS = Object.freeze(['make', 'build', 'create', 'write', 'code', 'generate', 'develop', 'design']);
export const TAIL_RE = /(?:\s*,?\s*(?:please|pls|thanks|thank you|for me))+$/;
export const HEAD_RE = new RegExp(
  '^(?:(?:please|pls)\\s*,?\\s+)?'
  + '(?:(?:can|could|would|will) you\\s+(?:please\\s+)?|i want you to\\s+|i need(?: you to)?\\s+)?'
  + '(' + VERBS.join('|') + ')'
  + '(?:\\s+(?:me|us))?(?:\\s+(?:a|an|the))?\\s+(.+)$');
const WORD_RE = /^[a-z0-9][a-z0-9'-]*$/;

const wordsOf = (s) => s.split(' ').filter(Boolean);
/** true when the words hold the phrase as consecutive words at index i. */
const at = (words, phrase, i) => phrase.every((w, k) => words[i + k] === w);
const holds = (words, phrase) => { for (let i = 0; i + phrase.length <= words.length; i++) if (at(words, phrase, i)) return true; return false; };

/** The slug of a name, or null when nothing of it survives SLUG_RE. */
export function slugOf(name) {
  const s = String(name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40).replace(/-+$/g, '');
  return SLUG_RE.test(s) ? s : null;
}

/**
 * A build request's app name and slug, or null when the prompt is not one (see the header for the exact rule).
 * @param {string} prompt what a person typed
 * @returns {{ name: string, slug: string } | null}
 */
export function buildRequest(prompt) {
  if (typeof prompt !== 'string') return null;
  const raw = prompt.trim();
  if (!raw || raw.length > MAX_PROMPT) return null;
  const text = raw.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').replace(/[.!?]+$/, '').trim().replace(TAIL_RE, '').trim();
  const m = HEAD_RE.exec(text);
  if (!m) return null;
  const words = wordsOf(m[2]);
  if (words.length < 1 || words.length > MAX_WORDS) return null;
  if (!words.every((w) => WORD_RE.test(w))) return null;
  if (words.some((w) => CLAUSE.includes(w))) return null;
  if (!APP_NOUNS.some((n) => holds(words, wordsOf(n)))) return null;
  let nameWords = words;
  for (const d of DROP) { // the longest DROP the phrase ends with decides: shed when another word stays, else kept whole
    const dw = wordsOf(d);
    if (words.length < dw.length || !at(words, dw, words.length - dw.length)) continue;
    if (words.length > dw.length) nameWords = words.slice(0, words.length - dw.length);
    break;
  }
  const name = nameWords.join(' ');
  const slug = slugOf(name);
  return slug ? { name, slug } : null;
}
