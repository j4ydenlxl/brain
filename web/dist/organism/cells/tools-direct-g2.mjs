// tools-direct-g2: one-line git, bash and curl commands for a fixed set of tasks.
export const meta = { id: 'tools-direct-g2', class: 'tools', generation: 2, lane: 'direct', grownFrom: ["the git command to undo the last commit but keep the changes","how do I list files sorted by size in bash","curl command to download a file","git command to create a new branch and switch to it","how do I count how many files are in a folder in bash","curl command to send a json post request","git command to see the log on one line per commit","how do I find a file by name in bash"], version: 1 };

export const examples = [
  {"q":"the git command to undo the last commit but keep the changes","expect":{"contains":["git reset"],"containsAny":["--soft","HEAD~1","HEAD^"],"notRefusal":true}},
  {"q":"how do I list files sorted by size in bash","expect":{"containsAny":["ls -lS","ls -S","du ","sort -"],"notRefusal":true}},
  {"q":"curl command to download a file","expect":{"contains":["curl"],"containsAny":["-O","-o ","--output"],"notRefusal":true}},
  {"q":"git command to create a new branch and switch to it","expect":{"containsAny":["git checkout -b","git switch -c"],"notRefusal":true}},
  {"q":"how do I count how many files are in a folder in bash","expect":{"containsAny":["wc -l"],"notRefusal":true}},
  {"q":"curl command to send a json post request","expect":{"contains":["curl"],"containsAny":["-X POST","--data","-d ","--json"],"notRefusal":true}},
  {"q":"git command to see the log on one line per commit","expect":{"containsAny":["--oneline","--pretty=oneline","--format"],"notRefusal":true}},
  {"q":"how do I find a file by name in bash","expect":{"containsAny":["find ","locate ","fd "],"notRefusal":true}}
];

const fmt = (cmd, say) => '```sh\n' + cmd + '\n```\n' + say;

function norm(q) {
  return String(q == null ? '' : q).toLowerCase().replace(/[‘’`]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
}

const FOLDER = /\b(folder|folders|director(y|ies)|dir|subfolders?|path|tree)\b/;
const FILES = /\bfiles?\b/;
const GITWORD = /\b(git|commit|commits|committed|branch|branches|stash|repo|repository|staged|unstaged|working tree|head)\b/;
const CURLWORD = /\b(curl|wget|http|https|url|urls|endpoint|api|web ?page|website|server|request)\b/;
const SHELLWORD = /\b(bash|shell|terminal|command line|command|linux|unix|mac|macos|ubuntu|zsh|sh|cli|console)\b/;

const TASKS = [
  // git
  { id: 'git-amend', test: q => /\bamend\b/.test(q) && /\bcommit\b|\bgit\b/.test(q)
      || /\b(change|edit|fix|rename|reword|modify|correct|update|rewrite|redo)\b.*\bcommit (message|msg|text|title)/.test(q)
      || /\bcommit (message|msg)\b.*\b(change|edit|fix|reword|modify|correct|update|wrong|typo)/.test(q)
      || /\b(message|msg)\b/.test(q) && /\bcommit\b/.test(q) && /\b(change|edit|fix|rename|reword|modify|correct|update|rewrite|redo|wrong|typo)\b/.test(q),
    out: () => fmt('git commit --amend -m "new message"', 'Replaces the message of the last commit (run git commit --amend alone to edit it in your editor).') },
  { id: 'git-undo-commit', test: q => /\b(undo|revert|uncommit|un-commit|cancel|roll ?back|reverse|remove|drop|reset|take back|delete)\b/.test(q)
      && /\b(last|latest|previous|most recent|recent|my|the) commit\b|\bcommit (i just|i made|just made)|\blast git commit\b/.test(q) && !/\bmessage\b/.test(q),
    out: () => fmt('git reset --soft HEAD~1', 'Undoes the last commit but keeps its changes staged in your working tree (use --mixed to keep them unstaged, git reset HEAD~1).') },
  { id: 'git-branch', test: q => /\bbranch\b/.test(q) && /\b(create|creating|make|new|start|open|add)\b/.test(q) && !/\b(delete|remove|rename|list|merge)\b/.test(q),
    out: () => fmt('git checkout -b new-branch', 'Creates the branch new-branch and switches to it (the newer form is git switch -c new-branch).') },
  { id: 'git-log', test: q => /\b(log|history|commits)\b/.test(q) && (/\bgit\b|\bcommits?\b/.test(q))
      && /\b(one line|oneline|one-line|single line|single-line|1 line|compact|condensed|short|brief|concise|summary|summarized|per line|each line)\b/.test(q),
    out: () => fmt('git log --oneline', 'Shows the commit history with one line per commit: the short hash and the subject.') },
  { id: 'git-stash', test: q => /\bstash\b/.test(q)
      || GITWORD.test(q) && /\b(save|shelve|set aside|put aside|put away|hide|park|temporarily (save|store|remove|keep))\b/.test(q) && /\b(changes|work|modifications|edits)\b/.test(q) && !/\bcommit\b/.test(q.replace(/without committing|uncommitted/g, '')),
    out: () => fmt('git stash', 'Saves your uncommitted changes aside and cleans the working tree; git stash pop brings them back.') },
  { id: 'git-discard-file', test: q => /\b(discard|throw away|throw out|revert|undo|reset|drop|lose|get rid of|restore|cancel|remove|abandon|wipe)\b/.test(q)
      && /\b(changes|modifications|edits|change|local changes)\b/.test(q) && (/\bfile\b/.test(q) || /\bgit\b/.test(q)) && !/\bcommit(ted)?\b/.test(q.replace(/uncommitted/g, '')),
    out: () => fmt('git restore path/to/file', 'Throws away the uncommitted changes to that one file (older git: git checkout -- path/to/file).') },
  // bash
  { id: 'ps', test: q => /\bps aux\b/.test(q) || /\bproc(?:ess|esses)\b/.test(q) && /\b(running|list|show|see|all|view|display|active|current|currently)\b/.test(q) && !/\b(kill|stop|end)\b/.test(q),
    out: () => fmt('ps aux', 'Lists every running program on the machine with its user, PID, CPU and memory use.') },
  { id: 'grep', test: q => /\bgrep\b/.test(q) && !/\bgrep -c\b/.test(q)
      || /\b(search|find|look|grep|look for|search for)\b/.test(q) && /\b(word|text|string|phrase|pattern|term|keyword)\b/.test(q) && (/\bfiles\b/.test(q) || FOLDER.test(q) || /\bevery file|each file|all files|any file\b/.test(q)),
    out: () => fmt('grep -rn "word" .', 'Searches the word in every file under the current folder, recursively, and prints each match with its file and line number.') },
  { id: 'ls-size', test: q => FILES.test(q) && (/\b(sort|sorted|order|ordered|by size|biggest|largest|smallest|heaviest)\b/.test(q) && /\bsize|biggest|largest|smallest|heaviest\b/.test(q)),
    out: () => fmt('ls -lS', 'Lists the files in long format sorted by size, largest first (add -r for smallest first, -h for readable sizes).') },
  { id: 'count-files', test: q => /\b(count|how many|number of|total)\b/.test(q) && FILES.test(q) && (FOLDER.test(q) || SHELLWORD.test(q) || /\b(here|ls|wc)\b/.test(q)) && !/\blines?\b|\bwords?\b/.test(q) && !/\.[a-z0-9]{1,5}\b/.test(q.replace(/\b(e\.g|i\.e)\./g, '')),
    out: () => fmt('ls | wc -l', 'Counts the entries in the current folder (for every file in subfolders too: find . -type f | wc -l).') },
  { id: 'du', test: q => FOLDER.test(q) && /\b(size|how big|disk usage|space|how much (disk|space|storage)|takes up|weigh)\b/.test(q),
    out: () => fmt('du -sh folder', 'Prints the total disk size of the folder in human readable units.') },
  { id: 'find', test: q => /\b(find|locate|search|look|where is|search for|look for)\b/.test(q) && /\bfiles?\b/.test(q) && /\b(name|named|called|filename|file name)\b/.test(q),
    out: () => fmt('find . -name "filename"', 'Searches the current folder and every subfolder for a file with that name (use -iname to ignore case, wildcards like "*.txt" work).') },
  // curl
  { id: 'curl-headers', test: q => /\bheaders?\b/.test(q) && (/\bcurl\b/.test(q) || /\b(response|http|url)\b/.test(q)) && !/\b(send|add|set|with a|custom)\b/.test(q),
    out: () => fmt('curl -I https://example.com', 'Sends a HEAD request and prints only the response headers.') },
  { id: 'curl-redirect', test: q => /\bredirect(s|ed|ion)?\b/.test(q) && (/\bcurl\b/.test(q) || CURLWORD.test(q)),
    out: () => fmt('curl -L https://example.com', 'Follows every redirect until the final page and prints it.') },
  { id: 'curl-post', test: q => (/\bcurl\b/.test(q) || CURLWORD.test(q)) && (/\bpost\b/.test(q) || /\bjson\b/.test(q) && /\b(send|submit|upload|request)\b/.test(q)),
    out: () => fmt('curl -X POST -H "Content-Type: application/json" -d \'{"key":"value"}\' https://example.com/api', 'Sends the JSON body in a POST request with the JSON content-type header.') },
  { id: 'curl-download', test: q => /\b(download|downloading|save|fetch|grab|pull down|get)\b/.test(q) && (/\bcurl\b/.test(q) || /\bdownload/.test(q) && (CURLWORD.test(q) || SHELLWORD.test(q) || FILES.test(q))) && !/\bpost\b/.test(q),
    out: () => fmt('curl -O https://example.com/file.zip', 'Downloads the file and saves it under its remote name (use -o name.zip to choose the name, add -L to follow redirects).') },
];

const ASKED_ELSEWHERE = /\b(mkdir|rmdir|cp|mv|rm|head|tail|cat|touch|chmod)\b|\b(first|last|top|bottom) \d+ lines\b|\blines (in|of)\b/;

function pick(q) {
  const s = norm(q);
  if (!s || s.length > 300) return null;
  if (ASKED_ELSEWHERE.test(s) && !/\b(git|curl|grep|find|du|ps|ls)\b/.test(s)) return null;
  if (/^(hi|hello|hey|thanks|thank you)\b/.test(s)) return null;
  for (const t of TASKS) if (t.test(s)) return t;
  return null;
}

export function can(q) { return pick(q) !== null; }

export function answer(q) {
  const t = pick(q);
  return t ? t.out() : null;
}
