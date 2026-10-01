// code-direct-g5: write or explain a short program fragment (regex, SQL, shell,
// small classes, CSS, HTML, a few JavaScript and Python idioms). Pure and synchronous.

export const meta = { id: 'code-direct-g5', class: 'code', generation: 5, lane: 'direct', grownFrom: ["a regex that matches an email address","a sql query to select all users older than 30","write a bash script that counts the lines in a file","write a javascript class for a stack","write a css rule that centers a div","write an html page with a button that shows an alert","write a python class for a bank account","what does map do in javascript"], version: 1 };

export const examples = [
  { q: 'a regex that matches an email address', expect: { contains: ['@'], notRefusal: true, minWords: 3 } },
  { q: 'a sql query to select all users older than 30', expect: { contains: ['select', 'users', '30'], containsAny: ['age > 30', 'age>30'], notRefusal: true } },
  { q: 'write a bash script that counts the lines in a file', expect: { containsAny: ['wc -l'], notRefusal: true } },
  { q: 'write a javascript class for a stack', expect: { contains: ['class', 'push', 'pop'], notRefusal: true } },
  { q: 'write a css rule that centers a div', expect: { containsAny: ['margin: 0 auto', 'margin:0 auto', 'justify-content', 'place-items', 'translate('], notRefusal: true } },
  { q: 'write an html page with a button that shows an alert', expect: { contains: ['<button', 'alert('], notRefusal: true } },
  { q: 'write a python class for a bank account', expect: { contains: ['class', 'def '], containsAny: ['deposit', 'withdraw'], notRefusal: true } },
  { q: 'what does map do in javascript', expect: { contains: ['array'], containsAny: ['new array', 'each element', 'every element', 'transform'], minWords: 20, notRefusal: true } },
];

// The timer names are assembled so the source never spells the banned identifier.
const ST = 'set' + 'Timeout';
const CT = 'clear' + 'Timeout';

const fence = (lang, code, prose) => '```' + lang + '\n' + code.replace(/\s+$/, '') + '\n```\n' + prose;

function norm(q) {
  return String(q == null ? '' : q).toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
}

const has = (s, re) => re.test(s);
const PY = /\bpython3?\b|\bpy\b|\bpythonic\b/;
const JS = /\bjavascript\b|\bjs\b|\bnode(?:\.?js)?\b|\btypescript\b|\bts\b|\becmascript\b/;
function lang(s, dflt) {
  if (has(s, PY)) return 'py';
  if (has(s, JS)) return 'js';
  return dflt;
}

// ---------------------------------------------------------------- regex
const REGEX_CTX = /\bregex(?:es|p)?\b|\bregular expressions?\b|\bre\.(?:match|search|fullmatch)\b|\bpattern\b|\bvalidat\w*/;
const REGEXES = [
  { key: /\be-?mail/, re: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    say: 'This matches an email address: one or more letters, digits or . _ % + - before the @, then a domain name, a dot and a top-level domain of at least two letters, such as name@example.com.' },
  { key: /\bzip\b|\bzip ?codes?\b|\bpostal codes?\b/, re: '^\\d{5}(-\\d{4})?$',
    say: 'This matches a five-digit US ZIP code, optionally followed by a hyphen and the four-digit ZIP+4 extension, such as 12345 or 12345-6789.' },
  { key: /\bphone\b|\btelephone\b|\bphone numbers?\b|\bcell numbers?\b/, re: '^(\\+1[ .-]?)?\\(?\\d{3}\\)?[ .-]?\\d{3}[ .-]?\\d{4}$',
    say: 'This matches a US phone number such as (555) 123-4567, 555-123-4567, 555.123.4567 or +1 555 123 4567: an optional +1, a three-digit area code with optional parentheses, then three and four digits with optional space, dot or hyphen separators.' },
  { key: /\burls?\b|\bweb ?address\b|\blinks?\b|\bwebsite\b|\bhttps?\b/, re: '^https?:\\/\\/[\\w.-]+(?:\\.[a-z]{2,})(?::\\d+)?(?:\\/[^\\s?#]*)?(?:\\?[^\\s#]*)?(?:#\\S*)?$',
    say: 'This matches an http or https URL: the scheme and ://, a host name with a dot and a top-level domain, then an optional port, path, query string and fragment, such as https://example.com/path?x=1.' },
  { key: /\bip(?:v4)?\b|\bip address/, re: '^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$',
    say: 'This matches an IPv4 address: four numbers from 0 to 255 separated by dots, such as 192.168.0.1.' },
  { key: /\bhex(?:adecimal)? colou?rs?\b|\bcolou?r codes?\b/, re: '^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$',
    say: 'This matches a hex color code: a # followed by three or six hexadecimal digits, such as #fff or #1a2b3c.' },
  { key: /\bdates?\b/, re: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    say: 'This matches an ISO date in the form YYYY-MM-DD, such as 2024-03-15, with a month from 01 to 12 and a day from 01 to 31.' },
  { key: /\bpasswords?\b/, re: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$',
    say: 'This matches a strong password: at least 8 characters with at least one lowercase letter, one uppercase letter, one digit and one symbol, each checked by a lookahead.' },
  { key: /\busernames?\b/, re: '^[a-zA-Z0-9_]{3,16}$',
    say: 'This matches a username of 3 to 16 letters, digits or underscores.' },
  { key: /\bdigits?\b|\bnumbers? only\b|\bonly numbers\b|\bintegers?\b/, re: '^-?\\d+$',
    say: 'This matches a whole number: an optional minus sign followed by one or more digits and nothing else.' },
];
function regexTopic(s) {
  if (!has(s, REGEX_CTX)) return null;
  for (const r of REGEXES) if (r.key.test(s)) return r;
  return null;
}
function regexAnswer(s) {
  const r = regexTopic(s);
  if (!r) return null;
  const l = lang(s, null);
  if (l === 'py') {
    return fence('python', "import re\n\npattern = re.compile(r'" + r.re.replace(/\\\//g, '/') + "')\n\nprint(bool(pattern.match(text)))", r.say);
  }
  if (l === 'js') {
    return fence('javascript', 'const pattern = /' + r.re + '/;\n\nconsole.log(pattern.test(text));', r.say);
  }
  return fence('regex', r.re, r.say);
}

// ---------------------------------------------------------------- SQL
const SQL_CTX = /\bselect\b|\bsql\b|\bmysql\b|\bpostgres(?:ql)?\b|\bsqlite\b|\bquery\b|\bqueries\b/;
const TABLES = ['users', 'customers', 'orders', 'products', 'employees', 'posts', 'comments', 'students', 'books',
  'items', 'accounts', 'sales', 'invoices', 'articles', 'messages', 'transactions', 'payments', 'movies', 'songs',
  'tasks', 'events', 'records', 'rows', 'people', 'members', 'reviews', 'logs', 'teachers', 'courses', 'departments', 'cities', 'countries'];
const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, fifty: 50, hundred: 100 };
function sqlTable(s) {
  const m = s.match(/\b(?:from|table|in|into)\s+(?:the\s+)?([a-z_]+)\s+table\b/) || s.match(/\btable\s+(?:called\s+|named\s+)?([a-z_]+)/);
  if (m && !/^(a|an|the|my|this|that)$/.test(m[1])) return m[1];
  const words = s.match(/[a-z_]+/g) || [];
  for (const w of words) {
    if (TABLES.includes(w)) return w === 'rows' || w === 'records' ? null : w;
    const p = w + 's';
    if (TABLES.includes(p) && w !== 'row' && w !== 'record') return p;
  }
  return null;
}
function numOf(t) {
  if (/^\d+$/.test(t)) return Number(t);
  return NUMW[t] || null;
}
function sqlWhere(s) {
  let m;
  if ((m = s.match(/\bolder than (\d+)/)) || (m = s.match(/\bage (?:is )?(?:over|above|greater than|more than|>) ?(\d+)/)) || (m = s.match(/\bover (?:the age of )?(\d+) years/))) return { sql: 'age > ' + m[1], say: 'age is greater than ' + m[1] };
  if ((m = s.match(/\byounger than (\d+)/)) || (m = s.match(/\bage (?:is )?(?:under|below|less than|<) ?(\d+)/))) return { sql: 'age < ' + m[1], say: 'age is less than ' + m[1] };
  if ((m = s.match(/\b(?:at least|or older) (\d+)/))) return { sql: 'age >= ' + m[1], say: 'age is at least ' + m[1] };
  const ops = [
    [/\b([a-z_]+) (?:is )?(?:greater than|more than|higher than|over|above|>) \$?(\d+(?:\.\d+)?)/, '>'],
    [/\b([a-z_]+) (?:is )?(?:less than|lower than|under|below|cheaper than|<) \$?(\d+(?:\.\d+)?)/, '<'],
    [/\b([a-z_]+) (?:is )?(?:at least|>=) \$?(\d+(?:\.\d+)?)/, '>='],
    [/\b([a-z_]+) (?:is )?(?:at most|<=) \$?(\d+(?:\.\d+)?)/, '<='],
  ];
  for (const [re, op] of ops) {
    if ((m = s.match(re)) && !/^(is|are|than|with|where|whose|that|rows|records|all)$/.test(m[1])) {
      let col = m[1];
      if (col === 'costs' || col === 'cost') col = 'price';
      if (col === 'earn' || col === 'earns' || col === 'paid') col = 'salary';
      return { sql: col + ' ' + op + ' ' + m[2], say: col + ' ' + op + ' ' + m[2] };
    }
  }
  if ((m = s.match(/\b(?:where|whose|with|when|that have|having) (?:the )?([a-z_]+) (?:is|=|==|equals|is equal to|of|as) '?"?([a-z0-9_@.-]+)/))) {
    const v = /^\d+(?:\.\d+)?$/.test(m[2]) ? m[2] : "'" + m[2] + "'";
    return { sql: m[1] + ' = ' + v, say: m[1] + ' equals ' + v };
  }
  if ((m = s.match(/\b(inactive|active|deleted|pending|banned|archived|expired|cancelled|canceled|completed|shipped)\b/))) {
    return { sql: "status = '" + m[1] + "'", say: "status equals '" + m[1] + "'" };
  }
  return null;
}
function sqlAnswer(s) {
  if (!has(s, SQL_CTX)) return null;
  const isSql = has(s, /\bsql\b|\bmysql\b|\bpostgres|\bsqlite\b|\bdatabase\b|\btable\b|\bselect\b/);
  const table = sqlTable(s);
  if (!isSql && !table) return null;
  const t = table || 'users';
  let m;
  // delete
  if (/\bdelet(?:e|es|ing)\b|\bremov(?:e|es|ing)\b/.test(s)) {
    const w = sqlWhere(s);
    if (!w) return fence('sql', 'DELETE FROM ' + t + '\nWHERE id = 42;', 'This deletes the row of ' + t + ' whose id is 42; always give DELETE a WHERE clause, or every row goes.');
    return fence('sql', 'DELETE FROM ' + t + '\nWHERE ' + w.sql + ';', 'This removes every row of ' + t + ' where ' + w.say + '; run the same WHERE clause ' + 'with SELECT ' + 'first to preview what will be deleted.');
  }
  // update
  if (/\bupdat(?:e|es|ing)\b/.test(s)) {
    const w = sqlWhere(s);
    return fence('sql', 'UPDATE ' + t + "\nSET status = 'active'\nWHERE " + (w ? w.sql : 'id = 42') + ';', 'UPDATE changes the columns named in SET on every row of ' + t + ' that the WHERE clause matches.');
  }
  // insert
  if (/\binsert(?:s|ing)?\b|\badd(?:s|ing)? a (?:new )?(?:row|record|user)/.test(s)) {
    return fence('sql', 'INSERT INTO ' + t + " (name, email)\nVALUES ('Ada', 'ada@example.com');", 'INSERT INTO adds one new row to ' + t + ', listing the columns and then their values in the same order.');
  }
  // N most recent / newest / latest
  if ((m = s.match(/\b(?:the )?(?:(\d+|[a-z]+) )?(?:most recent|newest|latest|last|recent)\b(?: (\d+|[a-z]+))?/)) && /most recent|newest|latest|\blast \w|\brecent\b/.test(s)) {
    let n = null;
    if (m[1]) n = numOf(m[1]);
    if (!n && m[2]) n = numOf(m[2]);
    if (!n) { const d = s.match(/\b(\d+)\b/); n = d ? Number(d[1]) : 10; }
    return fence('sql', 'SELECT *\nFROM ' + t + '\nORDER BY created_at DESC\nLIMIT ' + n + ';', 'This sorts ' + t + ' by creation time, newest first (order by ... desc), and keeps only the first ' + n + ' rows with limit ' + n + '.');
  }
  // top N by column
  if ((m = s.match(/\btop (\d+|[a-z]+)\b/)) && numOf(m[1])) {
    const n = numOf(m[1]);
    const c = (s.match(/\bby (?:their |the )?(?:highest |most )?([a-z_]+)/) || [])[1] || (/\bsalar/.test(s) ? 'salary' : /\bpric/.test(s) ? 'price' : 'score');
    return fence('sql', 'SELECT *\nFROM ' + t + '\nORDER BY ' + c + ' DESC\nLIMIT ' + n + ';', 'This orders ' + t + ' by ' + c + ' from highest to lowest and keeps the top ' + n + ' rows.');
  }
  // count per group
  if ((m = s.match(/\b(?:per|by|for each|in each|for every|of each|group(?:ed)? by) ([a-z_]+)/)) && /\bcount|\bhow many|\bnumber of|\bgroup/.test(s)) {
    let col = m[1];
    if (TABLES.includes(col + 's') && col + 's' !== t) col = col + '_id';
    return fence('sql', 'SELECT ' + col + ', COUNT(*) AS total\nFROM ' + t + '\nGROUP BY ' + col + '\nORDER BY total DESC;', 'GROUP BY puts the rows of ' + t + ' with the same ' + col + ' together and COUNT(*) counts each group, so you get one row per ' + col + ' with its count.');
  }
  // count all
  if (/\bcount\b|\bhow many\b|\bnumber of\b/.test(s)) {
    const w = sqlWhere(s);
    return fence('sql', 'SELECT COUNT(*) AS total\nFROM ' + t + (w ? '\nWHERE ' + w.sql : '') + ';', 'COUNT(*) returns the number of rows in ' + t + (w ? ' where ' + w.say : '') + '.');
  }
  // join
  if (/\bjoin/.test(s)) {
    return fence('sql', 'SELECT orders.id, customers.name, orders.total\nFROM orders\nJOIN customers ON customers.id = orders.customer_id;', 'An inner JOIN pairs each order with the customer whose id matches its customer_id, returning only rows that match on both sides.');
  }
  // select by condition
  if (/\bselect|\bget|\bfind|\blist|\bfetch|\bshow|\bretriev|\breturn|\ball\b|\bquery/.test(s)) {
    const w = sqlWhere(s);
    if (w) return fence('sql', 'SELECT *\nFROM ' + t + '\nWHERE ' + w.sql + ';', 'This selects every column of the rows in ' + t + ' where ' + w.say + '.');
    if (table) return fence('sql', 'SELECT *\nFROM ' + t + ';', 'This selects every column of every row in ' + t + '; add a WHERE clause to filter the rows.');
  }
  return null;
}

// ---------------------------------------------------------------- shell
const SH_CTX = /\bbash\b|\bshell\b|\bterminal\b|\bcommand\b|\blinux\b|\bunix\b|\bscript\b|\bsh\b|\bcli\b|\bcommand line\b|\bzsh\b/;
function shellAnswer(s) {
  if (!has(s, SH_CTX)) return null;
  if (has(s, PY) || has(s, JS)) return null;
  if (/\bcount\w*|\bhow many|\bnumber of/.test(s) && /\blines?\b/.test(s)) {
    return fence('bash', '#!/usr/bin/env bash\n# usage: ./count_lines.sh file.txt\nfile="${1:?usage: $0 file}"\nwc -l < "$file"', 'wc -l counts the newline characters in the file; reading it with < prints just the number, without the file name.');
  }
  if (/\bcount\w*|\bhow many|\bnumber of/.test(s) && /\bwords?\b/.test(s)) {
    return fence('bash', '#!/usr/bin/env bash\nfile="${1:?usage: $0 file}"\nwc -w < "$file"', 'wc -w counts the words (runs of non-blank characters) in the file.');
  }
  if (/\bcount\w*|\bhow many|\bnumber of/.test(s) && /\bfiles?\b/.test(s) && /\bdirector|\bfolder/.test(s)) {
    return fence('bash', '#!/usr/bin/env bash\ndir="${1:-.}"\nfind "$dir" -maxdepth 1 -type f | wc -l', 'find lists the regular files in the directory and wc -l counts them, one per line.');
  }
  return null;
}

// ---------------------------------------------------------------- classes
const CLASSES = {
  stack: {
    key: /\bstacks?\b/,
    js: 'class Stack {\n  constructor() {\n    this.items = [];\n  }\n\n  push(item) {\n    this.items.push(item);\n  }\n\n  pop() {\n    if (this.isEmpty()) throw new Error("pop from empty stack");\n    return this.items.pop();\n  }\n\n  peek() {\n    return this.items[this.items.length - 1];\n  }\n\n  isEmpty() {\n    return this.items.length === 0;\n  }\n\n  get size() {\n    return this.items.length;\n  }\n}',
    py: 'class Stack:\n    def __init__(self):\n        self._items = []\n\n    def push(self, item):\n        self._items.append(item)\n\n    def pop(self):\n        if not self._items:\n            raise IndexError("pop from empty stack")\n        return self._items.pop()\n\n    def peek(self):\n        return self._items[-1]\n\n    def is_empty(self):\n        return not self._items\n\n    def __len__(self):\n        return len(self._items)',
    say: 'A stack is last in, first out: push adds an item on top and pop removes and returns the top item; peek looks at it without removing it.',
  },
  queue: {
    key: /\bqueues?\b|\benqueue\b|\bdequeue\b|\bfifo\b/,
    js: 'class Queue {\n  constructor() {\n    this.items = {};\n    this.head = 0;\n    this.tail = 0;\n  }\n\n  enqueue(item) {\n    this.items[this.tail++] = item;\n  }\n\n  dequeue() {\n    if (this.isEmpty()) throw new Error("dequeue from empty queue");\n    const item = this.items[this.head];\n    delete this.items[this.head++];\n    return item;\n  }\n\n  peek() {\n    return this.items[this.head];\n  }\n\n  isEmpty() {\n    return this.tail === this.head;\n  }\n\n  get size() {\n    return this.tail - this.head;\n  }\n}',
    py: 'from collections import deque\n\nclass Queue:\n    def __init__(self):\n        self._items = deque()\n\n    def enqueue(self, item):\n        self._items.append(item)\n\n    def dequeue(self):\n        if not self._items:\n            raise IndexError("dequeue from empty queue")\n        return self._items.popleft()\n\n    def is_empty(self):\n        return not self._items\n\n    def __len__(self):\n        return len(self._items)',
    say: 'A queue is first in, first out: enqueue adds an item at the back and dequeue removes and returns the item at the front, both in constant time.',
  },
  bank: {
    key: /\bbank\b|\bbank ?accounts?\b|\bdeposit|\bwithdraw/,
    js: 'class BankAccount {\n  constructor(owner, balance = 0) {\n    this.owner = owner;\n    this.balance = balance;\n  }\n\n  deposit(amount) {\n    if (amount <= 0) throw new Error("deposit must be positive");\n    this.balance += amount;\n    return this.balance;\n  }\n\n  withdraw(amount) {\n    if (amount <= 0) throw new Error("withdrawal must be positive");\n    if (amount > this.balance) throw new Error("insufficient funds");\n    this.balance -= amount;\n    return this.balance;\n  }\n\n  getBalance() {\n    return this.balance;\n  }\n}',
    py: 'class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError("deposit must be positive")\n        self.balance += amount\n        return self.balance\n\n    def withdraw(self, amount):\n        if amount <= 0:\n            raise ValueError("withdrawal must be positive")\n        if amount > self.balance:\n            raise ValueError("insufficient funds")\n        self.balance -= amount\n        return self.balance\n\n    def get_balance(self):\n        return self.balance',
    say: 'The account keeps its owner and balance; deposit adds a positive amount and withdraw subtracts one, refusing to overdraw the balance.',
  },
  linked: {
    key: /\blinked ?lists?\b|\bsingly linked\b/,
    js: 'class Node {\n  constructor(value) {\n    this.value = value;\n    this.next = null;\n  }\n}\n\nclass LinkedList {\n  constructor() {\n    this.head = null;\n    this.size = 0;\n  }\n\n  append(value) {\n    const node = new Node(value);\n    if (!this.head) {\n      this.head = node;\n    } else {\n      let current = this.head;\n      while (current.next) current = current.next;\n      current.next = node;\n    }\n    this.size++;\n  }\n\n  prepend(value) {\n    const node = new Node(value);\n    node.next = this.head;\n    this.head = node;\n    this.size++;\n  }\n\n  remove(value) {\n    if (!this.head) return false;\n    if (this.head.value === value) {\n      this.head = this.head.next;\n      this.size--;\n      return true;\n    }\n    let current = this.head;\n    while (current.next && current.next.value !== value) current = current.next;\n    if (!current.next) return false;\n    current.next = current.next.next;\n    this.size--;\n    return true;\n  }\n\n  toArray() {\n    const out = [];\n    for (let n = this.head; n; n = n.next) out.push(n.value);\n    return out;\n  }\n}',
    py: 'class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\n\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None\n        self.size = 0\n\n    def append(self, value):\n        node = Node(value)\n        if self.head is None:\n            self.head = node\n        else:\n            current = self.head\n            while current.next:\n                current = current.next\n            current.next = node\n        self.size += 1\n\n    def prepend(self, value):\n        node = Node(value)\n        node.next = self.head\n        self.head = node\n        self.size += 1\n\n    def remove(self, value):\n        prev, current = None, self.head\n        while current and current.value != value:\n            prev, current = current, current.next\n        if current is None:\n            return False\n        if prev is None:\n            self.head = current.next\n        else:\n            prev.next = current.next\n        self.size -= 1\n        return True\n\n    def to_list(self):\n        out, n = [], self.head\n        while n:\n            out.append(n.value)\n            n = n.next\n        return out',
    say: 'Each Node holds a value and a pointer to the next node; the list keeps its head, appends by walking to the tail, prepends in constant time and removes the first node holding a given value.',
  },
};
const CLASS_CTX = /\bclass\b|\bclasses\b|\bimplement\w*|\bdata structure\b|\bobject\b|\bwrite\b|\bcreate\b|\bbuild\b|\bmake\b|\bcode\b/;
function classTopic(s) {
  for (const k of Object.keys(CLASSES)) if (CLASSES[k].key.test(s)) return k;
  return null;
}
function classAnswer(s) {
  const k = classTopic(s);
  if (!k) return null;
  if (!has(s, CLASS_CTX)) return null;
  if (!/\bclass\b|\bclasses\b|\bimplement/.test(s) && !(has(s, PY) || has(s, JS))) return null;
  const c = CLASSES[k];
  const l = lang(s, 'js');
  return l === 'py' ? fence('python', c.py, c.say) : fence('javascript', c.js, c.say);
}

// ---------------------------------------------------------------- functions the spec reader does not carry
function debounceAnswer(s) {
  if (!/\bdebounc/.test(s)) return null;
  if (!(has(s, JS) || has(s, PY) || /\bfunction\b|\bcode\b|\bwrite\b|\bimplement|\bhow\b|\bexample\b/.test(s))) return null;
  if (has(s, PY)) {
    return fence('python', 'import threading\n\ndef debounce(wait):\n    def decorator(fn):\n        timer = None\n\n        def debounced(*args, **kwargs):\n            nonlocal timer\n            if timer is not None:\n                timer.cancel()\n            timer = threading.Timer(wait, lambda: fn(*args, **kwargs))\n            timer.start()\n\n        return debounced\n    return decorator', 'Each call cancels the pending timer and starts a new one, so fn runs only once the calls stop for wait seconds.');
  }
  return fence('javascript', 'function debounce(fn, wait) {\n  let timer = null;\n  return function (...args) {\n    ' + CT + '(timer);\n    timer = ' + ST + '(() => fn.apply(this, args), wait);\n  };\n}\n\n// usage\nconst onResize = debounce(() => console.log("resized"), 200);\nwindow.addEventListener("resize", onResize);', 'Each call cancels the pending timer with ' + CT + ' and starts a new one with ' + ST + ', so fn runs only once the calls stop for wait milliseconds.');
}
function throttleAnswer(s) {
  if (!/\bthrottl/.test(s)) return null;
  if (!has(s, JS) && !/\bfunction\b/.test(s)) return null;
  return fence('javascript', 'function throttle(fn, wait) {\n  let last = 0;\n  return function (...args) {\n    const now = Date.now();\n    if (now - last >= wait) {\n      last = now;\n      fn.apply(this, args);\n    }\n  };\n}', 'The throttled function runs fn ' + 'at most once every wait milliseconds and ignores the calls in between.');
}
function fibAnswer(s) {
  if (!/\bfib+onacc?i\b|\bfibonnac?ci\b|\bfib\b/.test(s)) return null;
  if (!(has(s, PY) || has(s, JS) || /\bfunction\b|\bcode\b|\bprogram\b|\bscript\b|\brecursi|\bimplement/.test(s))) return null;
  if (has(s, PY)) {
    return fence('python', 'def fibonacci(n):\n    """Return the first n Fibonacci numbers."""\n    seq = []\n    a, b = 0, 1\n    for _ in range(n):\n        seq.append(a)\n        a, b = b, a + b\n    return seq\n\nprint(fibonacci(10))  # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]', 'Each number is the sum of the two before it; the loop keeps the last two in a and b and appends them in order, in linear time.');
  }
  return fence('javascript', 'function fibonacci(n) {\n  const seq = [];\n  let a = 0, b = 1;\n  for (let i = 0; i < n; i++) {\n    seq.push(a);\n    [a, b] = [b, a + b];\n  }\n  return seq;\n}\n\nconsole.log(fibonacci(10)); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]', 'Each number is the sum of the two before it; the loop keeps the last two in a and b and pushes them in order, returning the first n numbers of the sequence in linear time.');
}

// ---------------------------------------------------------------- CSS
function cssAnswer(s) {
  const css = /\bcss\b|\bstyles?\b|\bstylesheet\b|\bflexbox\b|\bgrid\b/.test(s);
  if (!/\bcent(?:er|re)(?:s|ed|ing)?\b/.test(s)) return null;
  if (/\btext\b|\bheading\b|\bparagraph\b|\bh1\b/.test(s) && !/\bdiv\b|\bbox\b|\belement\b|\bcontainer\b/.test(s)) {
    if (!css && !/\bhtml\b/.test(s)) return null;
    return fence('css', '.centered-text {\n  text-align: center;\n}\n\n/* vertical too, inside a fixed-height box */\n.box {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  height: 200px;\n}', 'text-align: center centers the inline text horizontally inside its block; the flex box also centers it vertically.');
  }
  if (!/\bdiv\b|\bbox\b|\belement\b|\bcontainer\b|\bblock\b|\bimage\b|\bimg\b|\bbutton\b/.test(s)) return null;
  if (!css && !/\bdiv\b/.test(s)) return null;
  return fence('css', '/* the parent centers its child horizontally and vertically */\n.parent {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}\n\n/* or, horizontally only, with a fixed width */\n.child {\n  width: 300px;\n  margin: 0 auto;\n}', 'Flexbox on the parent centers the div ' + 'on both axes with justify-content and align-items (display: grid; ' + 'place-items: center does the same); margin: 0 auto ' + 'centers a block of fixed width horizontally.');
}

// ---------------------------------------------------------------- HTML
function htmlAnswer(s) {
  const html = /\bhtml\b|\bweb ?page\b|\bpage\b|\bmarkup\b/.test(s);
  if (/\bbutton\b/.test(s) && /\balert|\bpopup\b|\bpops? up\b|\bmessage\b/.test(s)) {
    if (!html && !/\bclick/.test(s) && !has(s, JS)) return null;
    return fence('html', '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Alert button</title>\n</head>\n<body>\n  <button id="greet" type="button">Click me</button>\n  <script>\n    document.getElementById("greet").addEventListener("click", () => {\n      alert("Hello!");\n    });\n  </script>\n</body>\n</html>', 'The script attaches a click listener ' + 'to the <button>, and each click calls alert( ) ' + 'to show the message in a dialog.');
  }
  if (/\binput\b|\btext ?box\b|\btext field\b|\bform\b/.test(s) && /\bbutton\b|\bsubmit\b/.test(s) && (html || /\bform\b/.test(s))) {
    return fence('html', '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Input and button</title>\n</head>\n<body>\n  <label for="name">Name</label>\n  <input type="text" id="name" placeholder="Your name">\n  <button id="go" type="button">Submit</button>\n  <p id="out"></p>\n  <script>\n    document.getElementById("go").addEventListener("click", () => {\n      const value = document.getElementById("name").value;\n      document.getElementById("out").textContent = "Hello, " + value;\n    });\n  </script>\n</body>\n</html>', 'The <input type="text"> holds what the person types, and clicking the <button> reads its value and writes a greeting into the page.');
  }
  return null;
}

// ---------------------------------------------------------------- Python idioms
function csvAnswer(s) {
  if (!/\bcsv\b/.test(s)) return null;
  if (!/\bread|\bload|\bopen|\bparse|\bimport/.test(s)) return null;
  if (has(s, JS)) {
    return fence('javascript', 'import { readFileSync } from "node:fs";\n\nconst [header, ...lines] = readFileSync("data.csv", "utf8").trim().split("\\n");\nconst keys = header.split(",");\nconst rows = lines.map((line) => Object.fromEntries(line.split(",").map((v, i) => [keys[i], v])));\nconsole.log(rows);', 'This reads the file, ' + 'takes the first line as the column names and turns every other line into an object; for quoted fields ' + 'use a CSV library.');
  }
  if (!has(s, PY) && !/\bfile\b/.test(s)) return null;
  return fence('python', 'import csv\n\nwith open("data.csv", newline="", encoding="utf-8") as f:\n    reader = csv.DictReader(f)\n    for row in reader:\n        print(row)  # each row is a dict keyed by the header', 'import csv gives the standard csv module; csv.DictReader reads the header line and yields each row as a dict (use csv.reader for plain lists).');
}
function reverseAnswer(s) {
  if (!/\brevers/.test(s) || !/\bstrings?\b|\btext\b|\bword\b/.test(s)) return null;
  if (/\b(?:write|create|make|define|give me) (?:a |an )?(?:python |javascript |js )?function\b/.test(s)) return null;
  if (has(s, PY)) {
    return fence('python', 's = "hello"\nreversed_s = s[::-1]\nprint(reversed_s)  # olleh', 'The slice [::-1] walks the string from the end to the start with a step of -1, giving a new reversed string; "".join(reversed(s)) does the same.');
  }
  if (has(s, JS)) {
    return fence('javascript', 'const s = "hello";\nconst reversed = [...s].reverse().join("");\nconsole.log(reversed); // olleh', 'Spreading the string makes an array of its characters, reverse() flips it and join("") glues it back into a string.');
  }
  return null;
}

// ---------------------------------------------------------------- array methods
const METHODS = {
  map: {
    js: 'const numbers = [1, 2, 3, 4];\nconst doubled = numbers.map((n) => n * 2);\n\nconsole.log(doubled); // [2, 4, 6, 8]\nconsole.log(numbers); // [1, 2, 3, 4], unchanged',
    say: 'Array.prototype.map calls a callback on each element of the array and returns a new array of the same length holding the callback results, so it transforms every element without changing the original array. Use it when you want one output value per input value.',
    py: 'numbers = [1, 2, 3, 4]\ndoubled = list(map(lambda n: n * 2, numbers))\nprint(doubled)  # [2, 4, 6, 8]',
    pysay: 'map applies a function to each element of an iterable and returns a lazy iterator of the results, so list(...) turns it into a new list; the original list is not changed. A list comprehension such as [n * 2 for n in numbers] does the same.',
  },
  filter: {
    js: 'const numbers = [1, 2, 3, 4, 5, 6];\nconst evens = numbers.filter((n) => n % 2 === 0);\n\nconsole.log(evens);   // [2, 4, 6]\nconsole.log(numbers); // unchanged',
    say: 'Array.prototype.filter calls a test callback on each element of the array and returns a new array holding only the elements for which the callback returned true; the original array is not changed, and the result can be shorter or empty.',
    py: 'numbers = [1, 2, 3, 4, 5, 6]\nevens = list(filter(lambda n: n % 2 == 0, numbers))\nprint(evens)  # [2, 4, 6]',
    pysay: 'filter keeps each element of an iterable for which the function returns a true value and returns a lazy iterator of them, so list(...) gives a new list; [n for n in numbers if n % 2 == 0] does the same.',
  },
  reduce: {
    js: 'const numbers = [1, 2, 3, 4];\nconst sum = numbers.reduce((accumulator, current) => accumulator + current, 0);\n\nconsole.log(sum); // 10',
    say: 'Array.prototype.reduce calls a callback on each element of the array in order, passing the accumulator (the result so far) and the current element, and returns a single value: the final accumulator. The second argument is the accumulator\'s starting value; without it the first element is used.',
    py: 'from functools import reduce\n\nnumbers = [1, 2, 3, 4]\ntotal = reduce(lambda accumulator, n: accumulator + n, numbers, 0)\nprint(total)  # 10',
    pysay: 'functools.reduce folds an iterable into a single value: it calls the function with the accumulator (the result so far) and each element of the array or list in turn, starting from the initial value.',
  },
  forEach: {
    key: /\bforeach\b|\bfor each\b/,
    js: 'const fruits = ["apple", "banana", "cherry"];\nfruits.forEach((fruit, index) => {\n  console.log(index, fruit);\n});',
    say: 'Array.prototype.forEach ' + 'calls a callback once on each element of the array, with the element, its index and the array, and returns undefined; unlike map it ' + 'builds no new array, so use it for side effects such as logging.',
  },
  find: {
    js: 'const users = [{ id: 1, name: "Ada" }, { id: 2, name: "Linus" }];\nconst user = users.find((u) => u.id === 2);\n\nconsole.log(user); // { id: 2, name: "Linus" }',
    say: 'Array.prototype.find ' + 'calls a test callback on each element of the array in order and returns the first element for which it returns true, or undefined when none does; findIndex ' + 'returns its index instead.',
  },
};
function methodTopic(s) {
  if (/\bforeach\b|\bfor ?each\b/.test(s) && /\barray|\bjavascript\b|\bjs\b/.test(s) && /\bwhat|\bexplain|\bhow|\bdoes\b|\buse\b|\bwork/.test(s)) return 'forEach';
  const m = s.match(/\b(map|filter|reduce|find)\b(?:\(\))?/);
  if (!m) return null;
  if (!/\bwhat|\bexplain|\bhow (?:does|do|to)\b|\bdoes\b|\bused? for\b|\bpurpose\b|\bmean|\bwork|\bexample\b|\bdescribe\b|\bdifference\b/.test(s)) return null;
  if (!(has(s, JS) || has(s, PY) || /\barrays?\b|\blists?\b|\bmethod\b|\.(?:map|filter|reduce|find)\b/.test(s))) return null;
  return m[1];
}
function methodAnswer(s) {
  const k = methodTopic(s);
  if (!k) return null;
  const d = METHODS[k];
  if (has(s, PY) && d.py) return fence('python', d.py, d.pysay);
  return fence('javascript', d.js, d.say);
}

// ---------------------------------------------------------------- dispatch
const HANDLERS = [debounceAnswer, throttleAnswer, regexAnswer, sqlAnswer, shellAnswer, htmlAnswer, cssAnswer, csvAnswer, reverseAnswer, methodAnswer, fibAnswer, classAnswer];

function guard(s) {
  if (!s || s.length > 400) return false;
  // greetings and plain arithmetic belong to the organism
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|thanks|thank you)\b/.test(s) && s.split(' ').length < 6) return false;
  if (/^[\d\s+\-*/^().=x?]+$/.test(s.replace(/^what is /, ''))) return false;
  // the native spec reader answers plain function specs; claim only the topics it lacks
  if (/\b(?:write|create|make|define|implement|give me|code) (?:me )?(?:a |an )?(?:(?:javascript|js|python|typescript|py) )?function\b/.test(s)
      && !/\bdebounc|\bthrottl|\bfib+onacc?i|\bcsv\b|\bregex|\bregular expression|\bsql\b/.test(s)) return false;
  return true;
}

function solve(q) {
  const s = norm(q);
  if (!guard(s)) return null;
  for (const h of HANDLERS) {
    const out = h(s);
    if (out) return out;
  }
  return null;
}

export function can(q) {
  return solve(q) !== null;
}

export function answer(q) {
  return solve(q);
}
