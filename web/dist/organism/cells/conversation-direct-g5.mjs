// conversation-direct-g5: advice and recommendation turns (books, films, podcasts, food,
// pet names, hobbies, sport, encouragement, quotes, sleep, nerves before an event, friends).
// Pure and synchronous: a topic router over normalized words, then a template filled with
// the subject the person named. A turn it cannot place returns null (can is false there).

export const meta = { id: 'conversation-direct-g5', class: 'conversation', generation: 5, lane: 'direct', grownFrom: ["recommend a good book to read","what should I cook tonight","suggest a name for my cat","say something encouraging","i cannot sleep what should i do","give me a motivational quote","i have a job interview tomorrow any tips","what hobby should I pick up"], version: 1 };

export const examples = [
  { q: 'recommend a good book to read', expect: { contains: ['book'], minWords: 15, notRefusal: true } },
  { q: 'what should I cook tonight', expect: { containsAny: ['pasta', 'rice', 'soup', 'salad', 'stir-fry', 'stir fry', 'eggs', 'chicken', 'curry', 'tacos', 'noodles', 'pizza', 'omelette', 'omelet', 'sandwich', 'beans', 'tofu', 'fish', 'stew'], minWords: 15, notRefusal: true } },
  { q: 'suggest a name for my cat', expect: { contains: ['cat'], minWords: 10, notRefusal: true } },
  { q: 'say something encouraging', expect: { containsAny: ['you can', "you've got", 'you have got', 'keep going', 'proud', 'believe', 'capable', 'you are', "you're"], minWords: 10, notRefusal: true } },
  { q: 'i cannot sleep what should i do', expect: { contains: ['sleep'], containsAny: ['screen', 'phone', 'breath', 'dark', 'routine', 'read', 'warm', 'cool', 'light', 'caffeine', 'coffee'], minWords: 20, notRefusal: true } },
  { q: 'give me a motivational quote', expect: { minWords: 8, maxWords: 80, notRefusal: true } },
  { q: 'i have a job interview tomorrow any tips', expect: { contains: ['interview'], minWords: 30, notRefusal: true } },
  { q: 'what hobby should I pick up', expect: { containsAny: ['draw', 'paint', 'cook', 'garden', 'run', 'read', 'music', 'guitar', 'photograph', 'hik', 'chess', 'writ', 'knit', 'bak', 'climb', 'swim', 'bike', 'cycl', 'cod'], minWords: 20, notRefusal: true } },
];

function norm(q) {
  return String(q == null ? '' : q).toLowerCase()
    .replace(/[‘’`]/g, "'")
    .replace(/\bcan't\b|\bcant\b/g, 'cannot').replace(/\bcan not\b/g, 'cannot')
    .replace(/\bi'm\b|\bim\b/g, 'i am').replace(/\bwhat's\b/g, 'what is')
    .replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function pick(list, s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length];
}

const has = (s, re) => re.test(s);

// Turns other regions own, or that are not advice at all.
function excluded(s) {
  if (!s) return true;
  if (s.split(" ").length > 30) return true; // a prompt, not a paragraph
  if (/\d\s*[-+*\/x^=]\s*\d|\bplus\b|\bminus\b|\btimes\b|\bdivided\b|\bsquare root\b|\bsolve\b|\bequation\b/.test(s)) return true;
  if (/^(what|who|where|when|why|how) (is|are|was|were|did|does|do you)\b/.test(s) && !/\b(should|tips?|advice|recommend|suggest)\b/.test(s)) return true;
  if (/^(define|definition|meaning of|explain|calculate|compute|convert)\b/.test(s)) return true;
  if (/\b(who are you|what can you do|your name|about yourself|are you)\b/.test(s)) return true;
  if (/\b(joke|poem|limerick|haiku|story|song lyrics|riddle)\b/.test(s) && !/\b(recommend|suggest)\b/.test(s)) return true;
  return false;
}

const ASK = /\b(recommend|recommendation|recommendations|suggest|suggestion|suggestions|ideas?|any good|good|best|favorite|favourite|what should i|what can i|what to|give me|tell me|share|need|want|looking for|help me (pick|choose|find)|pick|choose)\b/;

// ---- media
const BOOKS = {
  fantasy: 'For fantasy, read the book The Name of the Wind by Patrick Rothfuss: a gifted young man tells his own legend, with gorgeous prose and a magic system that feels like real science. If you want something finished and shorter, A Wizard of Earthsea by Ursula K. Le Guin is a perfect classic book.',
  scifi: 'For science fiction, read the book Project Hail Mary by Andy Weir: a lone astronaut wakes up with no memory and has to save Earth, and it is funny, clever and hard to put down. Another great book in the genre is The Left Hand of Darkness by Ursula K. Le Guin.',
  mystery: 'For a mystery, read the book The Thursday Murder Club by Richard Osman: four retirees solve a real murder, and it is witty and warm. For a darker page turner, Gone Girl by Gillian Flynn is a thriller book with twists you will not see coming.',
  history: 'For history, read the book Sapiens by Yuval Noah Harari, a lively tour of how humans went from foragers to empires. If you prefer one era told like a novel, The Guns of August by Barbara Tuchman is a gripping book about the start of the First World War.',
  romance: 'For romance, read the book Pride and Prejudice by Jane Austen: sharp, funny and still the model for every slow burn love story. For something modern, Beach Read by Emily Henry is a warm, witty book about two writers who swap genres.',
  horror: 'For horror, read the book The Haunting of Hill House by Shirley Jackson: quiet, eerie and unforgettable. If you want something longer and scarier, It by Stephen King is the classic book about childhood friends facing a shapeshifting evil.',
  science: 'For nonfiction about science, read the book A Short History of Nearly Everything by Bill Bryson: funny, clear and full of wonder about how we know what we know. The Body by the same author is another great book about how we work inside.',
  selfhelp: 'For self improvement, read the book Atomic Habits by James Clear: it shows how tiny daily changes compound into big results, with practical steps you can start today. Another useful book is Mindset by Carol Dweck, about why believing you can grow helps you grow.',
  kids: 'For a younger reader, try the book Matilda by Roald Dahl: a brilliant girl, terrible grown ups and a lot of laughs. Charlotte\'s Web by E. B. White is another gentle, moving book that kids and adults both love.',
  classic: 'For a classic, read the book To Kill a Mockingbird by Harper Lee: a child\'s view of justice and courage in a small Southern town, moving and very readable. Another classic book worth your time is Jane Eyre by Charlotte Bronte.',
  biography: 'For a biography, read the book Steve Jobs by Walter Isaacson, a candid portrait of a brilliant and difficult inventor. If you like memoirs, Educated by Tara Westover is an extraordinary book about growing up without school and finding your way to learning.',
  general: [
    'I recommend the book Project Hail Mary by Andy Weir: an astronaut wakes up alone on a spaceship with no memory and has to save Earth. It is funny, clever and impossible to put down. If you want something gentler, The Midnight Library by Matt Haig is a warm book about the lives we might have lived.',
    'Try the book The Midnight Library by Matt Haig: a woman gets to try the other lives she could have lived, and it is warm, hopeful and quick to read. If you like a page turner, Project Hail Mary by Andy Weir is a funny, clever space adventure book.',
  ],
};
const BOOK_GENRE = [
  [/fantas|magic|dragon/, 'fantasy'], [/sci ?fi|science fiction|space|futur/, 'scifi'],
  [/myster|thrill|crime|detective|suspense/, 'mystery'], [/histor|war\b/, 'history'],
  [/roman|love/, 'romance'], [/horror|scary|creepy/, 'horror'],
  [/self help|self improvement|productiv|habit|motivat|personal growth/, 'selfhelp'],
  [/scien|nonfiction|non fiction|learn/, 'science'], [/kid|child|son|daughter|teen|young/, 'kids'],
  [/classic/, 'classic'], [/biograph|memoir/, 'biography'],
];

const MOVIES = {
  comedy: 'For a comedy, watch Paddington 2: it is genuinely hilarious, kind hearted and beautifully made, and works for any age. If you want something sillier, the movie Game Night is a sharp, fast comedy with a great cast.',
  horror: 'For horror, watch Get Out by Jordan Peele: tense, smart and full of details you notice on a second viewing. If you want pure scares, the movie A Quiet Place keeps you holding your breath almost the whole way.',
  scifi: 'For science fiction, watch Arrival: a linguist tries to talk with visitors from space, and the ending will stay with you for days. Interstellar is another stunning movie if you want something big about space and time.',
  animated: 'For something animated, watch Spirited Away by Hayao Miyazaki: a girl lost in a spirit world, with breathtaking imagination. Pixar\'s Coco is another wonderful movie about family, music and memory.',
  romance: 'For romance, watch About Time: a young man can travel back through his own life, and it is funny, tender and wise about what matters. The movie Before Sunrise is another beautiful, simple love story.',
  action: 'For action, watch Mad Max: Fury Road: two hours of breathtaking chases and real stunts, with surprising heart. If you prefer spies, the movie Mission: Impossible Fallout has some of the best action scenes ever filmed.',
  drama: 'For drama, watch The Shawshank Redemption: a story of friendship and hope in a prison that earns every emotion. The movie Good Will Hunting is another moving drama about talent, grief and being seen.',
  documentary: 'For a documentary, watch My Octopus Teacher: a diver befriends an octopus in a kelp forest, and it is gentle and astonishing. Free Solo is another gripping documentary about climbing El Capitan without ropes.',
  general: [
    'I recommend the movie Paddington 2: funny, warm and beautifully made, and it works whether you watch alone, with friends or with family. If you want something more thrilling, Arrival is a smart science fiction movie with an ending that stays with you.',
    'Watch the movie Arrival: a linguist tries to talk with visitors from space, and it is tense, moving and clever. If you want something lighter afterwards, Paddington 2 is a genuinely funny and kind film for any mood.',
  ],
};
const MOVIE_GENRE = [
  [/comed|funny|laugh/, 'comedy'], [/horror|scary|creepy/, 'horror'], [/sci ?fi|science fiction|space/, 'scifi'],
  [/animat|cartoon|kid|family|child/, 'animated'], [/roman|love|date night/, 'romance'], [/action|thrill/, 'action'],
  [/drama|sad|cry/, 'drama'], [/documentar/, 'documentary'],
];

const SHOWS = {
  comedy: 'For comedy, watch The Good Place: a woman lands in the afterlife by mistake, and it is hilarious and surprisingly thoughtful. Ted Lasso is another warm, funny show that will leave you smiling.',
  drama: 'For drama, watch Breaking Bad: a chemistry teacher turns into a drug kingpin, and it is one of the best written shows ever made. If you want something calmer, The Crown is a beautifully acted series.',
  scifi: 'For science fiction, watch Severance: office workers split their work and home memories, and it is eerie, funny and gripping. The Expanse is another space series worth watching, with real physics.',
  crime: 'For crime, watch Mindhunter: FBI agents interview serial killers to understand them, and it is tense and fascinating. Broadchurch is another gripping crime series set in a small seaside town.',
  general: [
    'I recommend the show Ted Lasso: an American football coach takes over an English soccer team, and it is funny, kind and quietly moving. If you want something gripping instead, Severance is a clever, eerie series about splitting work and home memories.',
    'Try the series Severance: office workers have their work and home memories split, and every episode ends on a hook. For something lighter, The Good Place is a funny, smart show about the afterlife.',
  ],
};
const SHOW_GENRE = [[/comed|funny|laugh/, 'comedy'], [/drama/, 'drama'], [/sci ?fi|science fiction|space/, 'scifi'], [/crime|myster|detective|thrill/, 'crime']];

const PODCASTS = {
  crime: 'For true crime, try the podcast Serial: one reporter reinvestigates a single case over a season, and it is gripping and careful. Casefile is another excellent podcast, calm in tone and thorough with its research.',
  history: 'For history, try the podcast Hardcore History by Dan Carlin: long, vivid episodes that make ancient wars feel immediate. For shorter episodes, The Rest Is History is a funny, smart podcast by two British historians.',
  science: 'For science, try the podcast Radiolab: each episode turns one curious question into a beautifully produced story. Ologies is another fun podcast where a host interviews an expert on a different field every week.',
  comedy: 'For comedy, try the podcast Conan O\'Brien Needs a Friend: relaxed, very funny conversations with celebrities. Comedy Bang! Bang! is another podcast full of absurd improvised characters.',
  business: 'For business, try the podcast How I Built This: founders tell the honest story of how their companies started, failures included. Planet Money is another podcast that explains the economy with clever short stories.',
  news: 'For news, try the podcast The Daily: about twenty minutes each weekday on one big story, told clearly. Up First is another short news podcast that covers the morning headlines in about fifteen minutes.',
  general: [
    'Try the podcast Radiolab: each episode takes one curious question about science or people and turns it into a vivid story, usually 30 to 60 minutes, which fits a commute or a walk well. If you prefer shorter episodes, 99% Invisible tells the hidden design stories behind everyday objects.',
    'I recommend the podcast 99% Invisible: short, fascinating stories about the design hidden in everyday things, from flags to sidewalks. If you enjoy it, Radiolab is another beautifully produced podcast about science and curious questions.',
  ],
};
const POD_GENRE = [[/true crime|crime|murder/, 'crime'], [/histor/, 'history'], [/scien|learn|curious/, 'science'], [/comed|funny|laugh/, 'comedy'], [/business|money|entrepreneur|startup|econom/, 'business'], [/news|current events|politic/, 'news']];

const MUSIC = {
  general: [
    'Try the album Rumours by Fleetwood Mac: every song is catchy and the harmonies are perfect, a record people love on the first listen. If you want something newer, the music of Phoebe Bridgers is gentle, clever and quietly heartbreaking.',
    'Listen to the album Kind of Blue by Miles Davis: relaxed, beautiful jazz music that works for focus, cooking or a quiet evening. For something upbeat, Random Access Memories by Daft Punk is a joyful, danceable album.',
  ],
  study: 'For studying, try the album Kind of Blue by Miles Davis or any lofi beats playlist: calm music without lyrics helps you focus. Ludovico Einaudi\'s piano pieces are another great choice for long study sessions.',
  workout: 'For a workout, put on a playlist with Lose Yourself by Eminem, Titanium by David Guetta and Eye of the Tiger by Survivor: songs with a strong beat help you push through the last set. Upbeat music around 120 to 140 beats per minute matches a steady run.',
};

const GAMES = {
  board: 'For a board game, try Ticket to Ride: easy to learn in ten minutes, fun for families and friends, and every game is tense to the end. If your group likes a bit more strategy, Catan is a classic game of trading and building.',
  general: [
    'Try the game Stardew Valley: you restore an old farm, grow crops, make friends in a small town, and it is relaxing and absorbing at the same time. If you want an adventure, The Legend of Zelda: Breath of the Wild is a beautiful open world game.',
    'I recommend the game Hades: fast, stylish action where every escape attempt teaches you something, with a great story and voice acting. For something calm, Stardew Valley is a cozy farming game you can play for months.',
  ],
};

function genreOf(table, s) {
  for (const [re, k] of table) if (re.test(s)) return k;
  return null;
}

function media(s) {
  const want = /\b(recommend|suggest|good|best|great|favorite|favourite|any|some|give me|tell me|need|looking for|what (book|novel|movie|film|show|series|podcast|song|album|game|music))\b/;
  const verbAsk = /\bwhat should i (read|watch|listen to|play|binge)\b|\bwhat (can|could) i (read|watch|listen to|play)\b/;
  if (!want.test(s) && !verbAsk.test(s)) return null;
  const strip = s.replace(/\b(recommend|suggest)\w*\b/g, ' ');
  if (/\b(podcasts?)\b/.test(s) || /\blisten to on my commute\b/.test(s)) {
    const g = genreOf(POD_GENRE, strip);
    return g ? PODCASTS[g] : pick(PODCASTS.general, s);
  }
  if (/\b(audiobooks?)\b/.test(s)) return 'Try the audiobook of Project Hail Mary by Andy Weir: the narration by Ray Porter is wonderful and the story of a lone astronaut saving Earth is funny and gripping. The audiobook of Born a Crime by Trevor Noah, read by the author, is another favorite.';
  if (/\b(books?|novels?|read|reading)\b/.test(s)) {
    const g = genreOf(BOOK_GENRE, strip);
    let t = g ? BOOKS[g] : pick(BOOKS.general, s);
    if (/\bnovels?\b/.test(s) && !/novel/.test(t)) t = t.replace('the book', 'the novel');
    return t;
  }
  if (/\b(documentar(y|ies))\b/.test(s)) return MOVIES.documentary;
  if (/\b(anime)\b/.test(s)) return 'For anime, watch Spirited Away by Hayao Miyazaki: a girl lost in a spirit world, with breathtaking imagination and heart. If you want a series, Fullmetal Alchemist: Brotherhood is a gripping anime about two brothers, with a story that pays off beautifully.';
  if (/\b(movies?|films?|watch tonight|watch)\b/.test(s) && !/\b(tv|shows?|series|binge)\b/.test(s)) {
    const g = genreOf(MOVIE_GENRE, strip);
    let t = g ? MOVIES[g] : pick(MOVIES.general, s);
    if (/\bfilms?\b/.test(s) && !/\bfilm\b/.test(t)) t = t.replace('the movie', 'the film');
    if (/\bmovies?\b/.test(s) && !/\bmovie\b/.test(t)) t += ' Either movie is a great pick tonight.';
    return t;
  }
  if (/\b(tv|shows?|series|binge)\b/.test(s)) {
    const g = genreOf(SHOW_GENRE, strip);
    let t = g ? SHOWS[g] : pick(SHOWS.general, s);
    if (/\bshows?\b/.test(s) && !/\bshow\b/.test(t)) t += ' It is a show worth starting tonight.';
    if (/\bseries\b/.test(s) && !/\bseries\b/.test(t)) t += ' The whole series is worth it.';
    return t;
  }
  if (/\b(video games?|board games?|games?|play)\b/.test(s) && !/\bplay (a |an )?(sport|instrument|guitar|piano)\b/.test(s)) {
    if (/\b(board|card|family|party|tabletop)\b/.test(s)) return GAMES.board;
    return pick(GAMES.general, s);
  }
  if (/\b(songs?|music|albums?|bands?|artists?|singers?|playlist|listen to)\b/.test(s)) {
    if (/\b(study|studying|focus|work|concentrat)\b/.test(s)) return MUSIC.study;
    if (/\b(workout|gym|run|running|exercise)\b/.test(s)) return MUSIC.workout;
    let t = pick(MUSIC.general, s);
    const m = s.match(/\b(songs?|albums?|bands?|artists?|singers?)\b/);
    if (m && !t.includes(m[1].replace(/s$/, ''))) t += ' Either ' + m[1].replace(/s$/, '') + ' is a great place to start.';
    return t;
  }
  return null;
}

// ---- food
function food(s) {
  const asks = /\b(what should (i|we) (cook|make|eat|have|bake|order)|what (can|could) (i|we) (cook|make|eat|bake)|what to (cook|make|eat|bake)|(dinner|lunch|breakfast|meal|snack|dessert|recipe|supper|food|baking) (ideas?|suggestions?|recommendations?)|(recommend|suggest)\w* (a |an |some |me )*(good |easy |quick |healthy |simple )*(dinner|lunch|breakfast|meal|snack|dessert|recipe|dish|food|something to (eat|cook|make)))\b/;
  if (!asks.test(s)) return null;
  if (/\bbreakfast\b/.test(s)) return 'For breakfast, make a veggie omelette: whisk two or three eggs, pour them into a buttered pan, add spinach, tomato and a little cheese, then fold it over. With toast and fruit it takes ten minutes. On a lazy day, overnight oats with banana and peanut butter are even easier.';
  if (/\blunch\b/.test(s)) return 'For lunch, try a big chicken and avocado wrap: grilled or leftover chicken, avocado, lettuce, tomato and a squeeze of lime in a tortilla. It is ready in ten minutes and keeps you full. If you want something warm, a quick tomato soup with a grilled cheese sandwich is perfect.';
  if (/\b(dessert|sweet|bake|baking)\b/.test(s)) return 'Bake a batch of banana bread: mash three ripe bananas, mix with melted butter, sugar, an egg, flour and baking soda, and bake about an hour. It makes the house smell wonderful. For something faster, a mug brownie cooks in the microwave in about a minute.';
  if (/\bsnack\b/.test(s)) return 'For a snack, try apple slices with peanut butter, or hummus with carrot and cucumber sticks: quick, filling and fresh. If you want something warm, a slice of toast with avocado, salt and chili flakes is ready in three minutes.';
  if (/\b(vegetarian|vegan|plant based|no meat|meatless)\b/.test(s)) return 'Make a chickpea curry: soften onion, garlic and ginger, add curry powder, a can of chickpeas, a can of coconut milk and a handful of spinach, and simmer fifteen minutes. Serve it over rice. It is filling, cheap and fully vegetarian, and leftovers taste even better.';
  if (/\b(healthy|light|diet)\b/.test(s)) return 'Try a salmon and vegetable sheet pan dinner: salmon fillets, broccoli and sweet potato cubes with olive oil, lemon and garlic, roasted at 200 C for about 20 minutes. It is healthy, quick and only one pan to wash. A big salad with chickpeas is a lighter option.';
  if (/\b(quick|fast|easy|simple|lazy|tired)\b/.test(s)) return 'Make a quick garlic pasta: boil spaghetti, and while it cooks, warm olive oil with sliced garlic and chili flakes, then toss everything with parmesan and a handful of spinach. Dinner in fifteen minutes. Fried rice with eggs and frozen vegetables is another easy option.';
  return pick([
    'How about a chicken stir-fry tonight: slice chicken and whatever vegetables you have, like peppers, broccoli and carrots, cook them hot and fast in a pan with garlic, soy sauce and a little honey, and serve over rice or noodles. It takes about twenty minutes. If you want comfort food instead, a creamy tomato pasta is easy too.',
    'Try homemade tacos tonight: brown some chicken or beans with cumin, chili and garlic, warm the tortillas, and top them with lettuce, tomato, cheese and a squeeze of lime. It takes about twenty minutes and everyone can build their own. A simple pasta with garlic and parmesan is a lazier backup.',
  ], s);
}

// ---- names
const PET_NAMES = {
  cat: ['Luna', 'Miso', 'Pumpkin', 'Oliver', 'Mochi', 'Willow'],
  kitten: ['Mochi', 'Pip', 'Luna', 'Biscuit', 'Clementine', 'Nugget'],
  dog: ['Scout', 'Maple', 'Bear', 'Rosie', 'Murphy', 'Juniper'],
  puppy: ['Biscuit', 'Maple', 'Scout', 'Pepper', 'Ziggy', 'Juniper'],
  rabbit: ['Clover', 'Thumper', 'Hazel', 'Pudding', 'Bun Bun', 'Daisy'],
  bunny: ['Clover', 'Hazel', 'Pudding', 'Cinnamon', 'Daisy', 'Marshmallow'],
  hamster: ['Peanut', 'Nibbles', 'Hazel', 'Gizmo', 'Cookie', 'Pip'],
  'guinea pig': ['Potato', 'Hazel', 'Peanut', 'Butterscotch', 'Squeak', 'Clover'],
  fish: ['Bubbles', 'Finn', 'Nemo', 'Splash', 'Goldie', 'Captain'],
  goldfish: ['Goldie', 'Bubbles', 'Finn', 'Sunny', 'Mango', 'Nemo'],
  bird: ['Kiwi', 'Sunny', 'Mango', 'Pip', 'Skye', 'Echo'],
  parrot: ['Kiwi', 'Mango', 'Rio', 'Captain', 'Echo', 'Paco'],
  turtle: ['Shelly', 'Tank', 'Sheldon', 'Mossy', 'Tortellini', 'Speedy'],
  tortoise: ['Sheldon', 'Mossy', 'Tank', 'Methuselah', 'Shelby', 'Pebble'],
  horse: ['Maverick', 'Willow', 'Apollo', 'Juniper', 'Dakota', 'Ginger'],
  snake: ['Noodle', 'Sir Hiss', 'Slinky', 'Medusa', 'Kaa', 'Basil'],
  lizard: ['Ziggy', 'Rex', 'Pickles', 'Spike', 'Gecko', 'Mango'],
  gecko: ['Ziggy', 'Pickles', 'Mango', 'Gizmo', 'Leo', 'Echo'],
  ferret: ['Bandit', 'Noodle', 'Ziggy', 'Pepper', 'Socks', 'Rascal'],
  chicken: ['Henrietta', 'Nugget', 'Penny', 'Goldie', 'Marigold', 'Peep'],
  hen: ['Henrietta', 'Penny', 'Marigold', 'Clucky', 'Goldie', 'Hazel'],
  goat: ['Billy', 'Clover', 'Pepper', 'Hazel', 'Gruff', 'Daisy'],
  pig: ['Wilbur', 'Hamlet', 'Truffle', 'Petunia', 'Peanut', 'Porkchop'],
  mouse: ['Pip', 'Squeak', 'Nibbles', 'Whiskers', 'Cheddar', 'Hazel'],
  rat: ['Remy', 'Pip', 'Nibbles', 'Cheddar', 'Gizmo', 'Socks'],
  cow: ['Daisy', 'Buttercup', 'Clover', 'Bessie', 'Moo', 'Hazel'],
  plant: ['Fernando', 'Leafy', 'Sprout', 'Olive', 'Basil', 'Planty McPlantface'],
  car: ['Blue Thunder', 'Betty', 'Rosie', 'The Comet', 'Old Faithful', 'Maverick'],
  boat: ['Serenity', 'Sea Breeze', 'Wanderer', 'Second Wind', 'Lucky Star', 'Driftwood'],
  band: ['Velvet Static', 'The Paper Lanterns', 'Neon Orchard', 'Midnight Postcards', 'Glass Animals Club', 'Copper Moth'],
};
const PET_WORDS = Object.keys(PET_NAMES).sort((a, b) => b.length - a.length);

function names(s) {
  if (!/\bnames?\b|\bname (my|our|the)\b/.test(s)) return null;
  if (!/\b(suggest|recommend|give me|need|ideas?|good|cute|funny|cool|what should (i|we) (name|call)|help me name|what (to|can i) name|pick|choose|name for|names for)\b/.test(s)) return null;
  let animal = null;
  for (const w of PET_WORDS) if (new RegExp('\\b' + w + 's?\\b').test(s)) { animal = w; break; }
  if (/\bbab(y|ies)\b/.test(s)) {
    const girl = /\b(girl|daughter)\b/.test(s), boy = /\b(boy|son)\b/.test(s);
    const list = girl ? 'Eleanor, Iris, Clara, Hazel or Maya' : boy ? 'Theo, Elliot, Felix, Jonah or Leo' : 'Eleanor, Theo, Iris, Felix or Hazel';
    return 'For your baby, how about ' + list + '? They are classic but not overused, easy to spell and they age well from childhood to adulthood. Say each one out loud with your last name and pick the one that makes you smile.';
  }
  if (!animal) {
    const m = s.match(/\bname (?:ideas )?for (?:my|a|our|the) (?:new |little |sweet |black |white |orange |grey |gray )?([a-z]+)/) || s.match(/\bname (?:my|our) (?:new |little )?([a-z]+)/);
    if (!m || /^(company|business|startup|brand|website|app|channel|blog|shop|store|team|project|character|book|story|novel|song|kid|child|son|daughter)$/.test(m[1])) return null;
    animal = m[1];
    return 'Here are some name ideas for your ' + animal + ': Juniper, Biscuit, Scout, Maple, Ziggy or Pepper. Short names with two syllables are easy to say and fun to call out, so pick the one that best fits your ' + animal + '\'s personality.';
  }
  const list = PET_NAMES[animal];
  const off = s.length % 2;
  const first = list[off], rest = list.filter((_, i) => i !== off);
  const word = animal;
  if (animal === 'plant' || animal === 'car' || animal === 'boat' || animal === 'band') {
    return 'How about ' + first + ' for your ' + word + '? Other ideas: ' + rest.slice(0, 4).join(', ') + ' or ' + rest[4] + '. Pick the one that makes you smile every time you say it, because a good name for a ' + word + ' should feel a little personal.';
  }
  return 'How about ' + first + ' for your ' + word + '? It is short, sweet and easy to call. Other favorites: ' + rest.slice(0, 4).join(', ') + ' or ' + rest[4] + '. Watch your ' + word + '\'s personality for a day or two and pick the one that fits; a name with two syllables is easiest for a ' + word + ' to learn.';
}

// ---- encouragement
function encourage(s) {
  const m = /\b(say|tell me|give me|write|share) (something|some|a few words|a message|words?)( of)? ?(really |very )?(encouraging|encouragement|nice|kind|positive|uplifting|sweet|motivating|motivational|inspiring|comforting|wholesome|cheerful|good)\b/.test(s)
    || /\b(cheer me up|encourage me|motivate me|compliment me|make me (smile|feel better)|i need (some )?(encouragement|motivation|a pep talk|a compliment|cheering up)|give me (a pep talk|encouragement|motivation|a compliment|some motivation|some encouragement)|pep talk)\b/.test(s)
    || /\bi (feel|am feeling|am) (so |really |very |a bit |kind of )?(down|sad|discouraged|unmotivated|hopeless|like a failure|like giving up|worthless|defeated)\b/.test(s)
    || /\bi want to give up\b/.test(s);
  if (!m) return null;
  if (/\b(sad|down|hopeless|failure|giving up|give up|worthless|defeated|discouraged)\b/.test(s)) {
    return 'I am sorry it feels this heavy right now. You are not a failure; you are a person having a hard stretch, and hard stretches end. You have gotten through every difficult day so far. Be gentle with yourself today: drink some water, step outside for a few minutes, and talk to someone you trust. Keep going, one small step at a time.';
  }
  if (/\b(nice|kind|sweet|wholesome|compliment|smile)\b/.test(s)) {
    return pick([
      'You are doing better than you think. The fact that you keep showing up, even on the tired days, says a lot about you. You make the people around you a little lighter, and the world is genuinely better with you in it.',
      'You have a kind heart, and it shows in the small things you do. You are more capable than you give yourself credit for, and someone out there smiles just because you exist. I hope today is gentle with you.',
    ], s);
  }
  return pick([
    'You are stronger than you think. Every step you take, even the small and messy ones, is moving you forward. You have handled hard things before and you can handle this too. Keep going; I believe in you, and you should be proud of how far you have come.',
    'You have got this. Progress is rarely a straight line, and the days that feel slow still count. You are capable, you are learning, and you are further along than you were a month ago. Keep going and be proud of yourself.',
  ], s);
}

// ---- quotes
const QUOTES = {
  motivation: [
    '"The secret of getting ahead is getting started." Mark Twain. Pick one small thing and begin it today.',
    '"It always seems impossible until it is done." Nelson Mandela. Take the first step today, and let the next one follow.',
    '"Believe you can and you are halfway there." Theodore Roosevelt. Start with one small step, and keep going.',
  ],
  success: ['"Success is not final, failure is not fatal: it is the courage to continue that counts." Winston Churchill. Keep going, one day at a time.'],
  life: ['"Life is what happens when you are busy making other plans." John Lennon. Enjoy the small moments along the way.'],
  courage: ['"Courage is not the absence of fear, but the triumph over it." Nelson Mandela. Being afraid and doing it anyway is what courage means.'],
  happiness: ['"Happiness is not something ready made. It comes from your own actions." Dalai Lama. Do one small kind thing today.'],
  friendship: ['"A friend is someone who knows all about you and still loves you." Elbert Hubbard. Send a message to a friend today.'],
  perseverance: ['"It does not matter how slowly you go as long as you do not stop." Confucius. Small steady steps still get you there.'],
  love: ['"Where there is love there is life." Mahatma Gandhi. Tell someone you love them today.'],
  learning: ['"Live as if you were to die tomorrow. Learn as if you were to live forever." Mahatma Gandhi. Learn one new thing today.'],
  work: ['"The only way to do great work is to love what you do." Steve Jobs. Look for the part of your work you truly care about.'],
};
const QUOTE_TOPIC = [
  [/succe/, 'success'], [/\blife\b/, 'life'], [/courage|brave|fear/, 'courage'], [/happ|joy/, 'happiness'],
  [/friend/, 'friendship'], [/persever|persist|never give up|hard times|resilien|failure/, 'perseverance'],
  [/\blove\b/, 'love'], [/learn|study|educat|school/, 'learning'], [/\bwork|career|job/, 'work'],
];
function quote(s) {
  if (!/\bquotes?\b|\bquotation\b|\bwords of wisdom\b|\bsaying\b/.test(s)) return null;
  if (!/\b(give|share|tell|need|want|send|motivat|inspir|encourag|positive|uplifting|favorite|favourite|good|recommend|suggest|daily|wise|famous|a quote|some)\b/.test(s)) return null;
  const t = genreOf(QUOTE_TOPIC, s);
  return pick(QUOTES[t || 'motivation'], s);
}

// ---- sleep
function sleep(s) {
  if (!/\b(cannot sleep|unable to sleep|trouble sleeping|hard time sleeping|insomnia|fall asleep|stay asleep|sleep better|help me sleep|tips (for|to) sleep|sleep tips|keep waking up|not sleeping|no sleep|sleepless|better sleep|improve my sleep)\b/.test(s)) return null;
  return 'Sorry you are struggling with sleep. Put your phone and other screens away, keep the room dark and cool, and try slow breathing: in for four counts, hold for seven, out for eight. If you are still awake after about twenty minutes, get up, read something calm under a dim light, and return to bed when you feel drowsy. Tomorrow, skip caffeine after noon and keep a steady routine.';
}

// ---- nerves before an event
const EVENTS = [
  { re: /\bjob interview|\binterviews?\b/, key: 'interview' },
  { re: /\bdriving test|driver'?s test|road test\b/, key: 'driving' },
  { re: /\b(exams?|tests?|quiz|quizzes|finals|midterms?|sats?|gre|gmat|mcat|lsat)\b/, key: 'exam' },
  { re: /\b(presentation|speech|public speaking|talk|pitch)\b/, key: 'presentation' },
  { re: /\b(first date|a date|date tonight|date tomorrow)\b/, key: 'date' },
  { re: /\b(audition|recital|performance|concert|perform|play on stage|stage)\b/, key: 'performance' },
  { re: /\b(race|marathon|game|match|tournament|competition|meet)\b/, key: 'competition' },
  { re: /\bfirst day\b|\bnew job\b|\bnew school\b/, key: 'firstday' },
  { re: /\b(surgery|dentist|doctor'?s appointment|procedure)\b/, key: 'appointment' },
  { re: /\bwedding\b/, key: 'wedding' },
];
function nerves(s) {
  const cue = /\b(nervous|anxious|scared|afraid|worried|terrified|freaking out|stressed|stress|panicking|dreading|tips?|advice|how (do|can|should) i (prepare|get ready|calm|stay calm|do well|ace|pass|survive)|help me prepare|prepare for|get ready for|tomorrow|tonight|next week|this week|on monday|on friday)\b/;
  if (!cue.test(s)) return null;
  let ev = null;
  for (const e of EVENTS) if (e.re.test(s)) { ev = e.key; break; }
  if (!ev) return null;
  if (ev !== 'interview' && ev !== 'exam' && !/\b(nervous|anxious|scared|afraid|worried|terrified|freaking out|stressed|stress|panicking|dreading|tips?|advice|prepare|get ready|calm|do well)\b/.test(s)) return null;
  if (ev === 'competition' && !/\b(my|our|a|the big)\b/.test(s)) return null;
  const nerv = /\b(nervous|anxious|scared|afraid|worried|terrified|freaking|panick|dread|stress)/.test(s);
  if (ev === 'interview') {
    return (nerv ? 'Feeling nervous before an interview is normal and shows you care. ' : '') +
      'Tonight, research the company: what it does, its recent news and the role itself. Prepare three short stories from your experience using the STAR method (situation, task, action, result) and practice saying them out loud. Pick your outfit, plan your route and get a full night of sleep. In the interview, arrive ten minutes early, smile, listen carefully, and ask one or two thoughtful questions at the end. Send a short thank you note afterwards. You can do this.';
  }
  if (ev === 'exam') {
    const nounM = s.match(/\b(exams?|tests?|quiz|quizzes|finals|midterms?|sats?|gre|gmat|mcat|lsat)\b/);
    const noun = nounM ? nounM[1].replace(/s$/, '') : 'exam';
    const word = noun === 'exam' ? 'exam' : noun + ' (like any exam)';
    const subjM = s.match(/\b(math|maths|algebra|calculus|geometry|statistics|physics|chemistry|biology|history|english|spanish|french|german|economics|science|literature|geography|psychology|programming|coding)\b/);
    const subj = subjM ? subjM[1] : '';
    const quant = /^(math|maths|algebra|calculus|geometry|statistics|physics|chemistry|economics|programming|coding)$/.test(subj);
    const study = quant
      ? 'Tonight, review the key formulas and redo a few practice problems you already know how to solve, rather than cramming new material.'
      : subj
        ? 'Tonight, do a light review of your notes and flashcards for the key ' + subj + ' terms and ideas, rather than cramming new material.'
        : 'Tonight, do a light review of your notes and the key ideas rather than cramming, and check yourself with a few practice questions.';
    return 'Feeling nervous before your ' + (subj ? subj + ' ' : '') + word + ' is normal and shows you care. ' + study +
      ' Pack what you need, then get a full night of sleep. Tomorrow, eat a real breakfast, drink some water and arrive early. In the exam, read every question first, start with the ones you know best, and if panic rises, take three slow, deep breaths. You have prepared more than you think, and you can do this.';
  }
  if (ev === 'presentation') return 'Feeling nervous before a presentation is completely normal; even experienced speakers feel it. Practice it out loud two or three times, ideally standing up, and time yourself. Know your first sentence by heart so you start strong. Before you begin, take three slow breaths and drop your shoulders. Speak a little slower than feels natural, look at a few friendly faces, and remember the audience wants you to do well. You can do this.';
  if (ev === 'date') return 'Feeling nervous before a first date is normal and a little sweet: it means you care. Pick a relaxed place where you can talk, like a coffee shop or a walk in a park. Dress in something you feel comfortable in, arrive on time, and ask open questions about what they love doing, then really listen. Put your phone away. Do not aim for perfect, aim to have a good time; the right person will like the real you.';
  if (ev === 'driving') return 'Feeling nervous before a driving test is normal. Tonight, review the road signs and the maneuvers you practiced, like parallel parking and three point turns, then get a good night of sleep. Tomorrow, arrive early, adjust your seat and mirrors calmly, and check mirrors often and obviously. Drive a little slower and smoother than usual. If you make a small mistake, breathe and keep going; one slip rarely fails a driving test.';
  if (ev === 'performance') return 'Feeling nervous before a performance is normal; most performers feel it, and that energy can make you sharper. Run through your piece slowly once today, then stop and rest. Get a good night of sleep, eat something light beforehand and drink water. Just before you go on, take three slow breaths and shake out your hands. Focus on the music or the story, not the audience. You have practiced for this, and you are ready.';
  if (ev === 'competition') return 'Feeling nervous before a competition is normal; it is your body getting ready. Tonight, prepare your gear, eat a good meal with plenty of carbs and get a full night of sleep. Tomorrow, eat a light breakfast, drink water and warm up properly. Focus on your own plan, not your rivals, and take slow breaths to calm the jitters. Trust your training and enjoy it; you earned your place there.';
  if (ev === 'firstday') return 'Feeling nervous before a first day is completely normal. Tonight, lay out your clothes, pack what you need, plan your route and get a good night of sleep. Tomorrow, arrive a little early, smile, and introduce yourself to the people around you; asking questions is expected on a first day, not a weakness. Learn names by repeating them once. Nobody expects you to know everything yet, and in a week it will feel familiar.';
  if (ev === 'appointment') return 'Feeling nervous before a medical appointment is very common. Write down your questions beforehand so you do not forget them, and follow any instructions about eating or drinking. Bring someone you trust if you can. While you wait, try slow breathing: in for four counts, out for six. Tell the staff you are anxious; they deal with it every day and can explain each step to make it easier.';
  if (ev === 'wedding') return 'Feeling nervous before a wedding is completely normal. Tonight, lay out everything you need, eat a proper meal and try to get a good night of sleep. On the day, eat breakfast, drink water and leave extra time. If you have a speech, keep it short and practice it out loud. When the nerves rise, take a few slow breaths and look at the people who love you. Enjoy it; it goes by fast.';
  return null;
}

// ---- stress and calm (no named event)
function calm(s) {
  if (!/\bi (feel|am feeling|am|get) (so |really |very |a bit |kind of )?(stressed|anxious|overwhelmed|nervous|burned out|burnt out|tense|worried)\b|\b(tips|advice|how (can|do) i) (for |to )?(deal with|manage|reduce|handle|cope with|calm) (stress|anxiety|nerves)\b|\bhow (can|do) i (calm down|relax|stop worrying|stop overthinking)\b|\bhelp me (calm down|relax)\b/.test(s)) return null;
  return 'That sounds hard, and it is okay to feel this way. Try this right now: breathe in slowly for four counts and out for six, five times. Then write down what is on your mind and pick just one small thing you can do today. A short walk, some water and a call to a friend all help. You do not have to fix everything at once; you are doing better than you think.';
}

// ---- friends
function friends(s) {
  if (!/\b(make|making|find|meet|meeting) (new )?(friends|people)\b|\bi (feel|am) (so |really |very )?lonely\b|\bi have no friends\b|\bnew (city|town|country|school|place)\b.*\b(friends|people|lonely|tips|advice)\b/.test(s)) return null;
  return 'Making friends somewhere new takes a little time, and you are not alone in finding it hard. Join one regular activity, like a sports club, a class, a choir or a volunteering group, because seeing the same faces every week is how friendships grow. Say yes to invitations, ask people about themselves, and suggest a coffee after the second or third meeting. Be patient with yourself; it usually takes a few months to feel at home.';
}

// ---- hobbies, sport, activities
function hobby(s) {
  if (!/\bhobb(y|ies)\b|\bsomething new to (learn|try)\b|\bnew skill\b|\bskill to learn\b|\bwhat should i learn\b|\bpick up a new\b/.test(s)) return null;
  if (!ASK.test(s) && !/\bshould i\b|\bwhat\b/.test(s)) return null;
  if (/\b(cheap|free|budget|money)\b/.test(s)) return 'For a hobby that costs almost nothing, try running, drawing with a pencil and sketchbook, or reading from your local library. Hiking local trails is free too. Running needs only shoes, and free apps can coach you from zero to 5K in a couple of months.';
  if (/\b(home|indoor|inside)\b/.test(s)) return 'For a hobby at home, try drawing, knitting, baking bread or learning guitar: each needs little space and you can see your progress week by week. Indoor gardening with herbs on a windowsill is another relaxing choice, and you can cook with what you grow.';
  if (/\b(outdoor|outside|active|fit)\b/.test(s)) return 'For an active hobby, try hiking, rock climbing at a local gym, cycling or swimming. Climbing is especially fun because it is like solving puzzles with your body, and gyms rent shoes so you can start right away. Running is the easiest to begin: just shoes and a route.';
  return pick([
    'Try drawing: all you need is a pencil and a sketchbook, it is relaxing, and you can see yourself improve week by week. If you want something more active, hiking or rock climbing gets you outside, and if you like music, learning guitar with free online lessons is very rewarding.',
    'Pick up cooking or baking: you learn a little every time, and you get to eat the results. If you want something calmer, gardening or knitting is wonderfully relaxing, and if you want to move, running or swimming builds a healthy routine.',
  ], s);
}

function sport(s) {
  if (!/\b(sports?|exercise|workout|work out|get fit|stay fit|get in shape|stay active|fitness)\b/.test(s)) return null;
  if (!/\b(what|which|recommend|suggest|ideas?|should i|good|best|start|tips|advice|how (can|do) i)\b/.test(s)) return null;
  return 'Try swimming: it works your whole body, is gentle on your joints and is easy to start at any fitness level. If you enjoy a team, join a recreational soccer, volleyball or basketball league, which makes exercise social. Running or cycling are great too, since you can begin today. Start with three short sessions a week and build up slowly so it becomes a habit.';
}

function weekend(s) {
  if (!/\bwhat (should|can|could) (i|we) do\b|\bthings to do\b|\bsomething (fun )?to do\b|\b(weekend|day off|date) (ideas?|plans?)\b|\bideas for (the|this|a) (weekend|day off|rainy day|date)\b/.test(s)) return null;
  if (/\b(sleep|nervous|anxious|worried|interview|exam|test|cook|eat|name)\b/.test(s)) return null;
  if (/\brain(y)?\b/.test(s)) return 'For a rainy day, make it cozy: bake cookies or banana bread, start a good movie marathon, or pick up a book you have been meaning to read. A board game or a jigsaw puzzle with tea is lovely too. If you want to get out, visit a museum or a cafe you have not tried.';
  if (/\bdate\b/.test(s)) return 'For a date, try a picnic in a park with food you each pick, a cooking night where you make fresh pasta together, or a walk followed by a cafe or a small museum. Mini golf or a board game cafe is great if you want something playful that makes conversation easy.';
  if (/\bbored\b/.test(s) || /\b(today|tonight|now)\b/.test(s)) return 'Try something small and new: go for a walk somewhere you have never been, cook a recipe you have never made, call a friend, or start a book or a short online course. If you want to stay in, a puzzle, drawing or a good movie can turn a slow day into a nice one.';
  return 'This weekend, try a mix of fun and rest: take a hike or a long walk in a park, visit a farmers market or a museum, and cook something new with friends or family. Leave one slow morning for reading and coffee. If the weather is bad, a movie marathon and a board game night are a great backup.';
}

function gift(s) {
  if (!/\b(gifts?|presents?)\b/.test(s)) return null;
  if (!/\b(ideas?|recommend|suggest|what (should|can) i (get|buy|give)|for my|for a)\b/.test(s)) return null;
  const who = (s.match(/\bfor (?:my |a |our )?(mom|mother|dad|father|wife|husband|girlfriend|boyfriend|partner|friend|best friend|sister|brother|grandma|grandmother|grandpa|grandfather|boss|coworker|teacher|son|daughter|kid|child)\b/) || [])[1];
  const forWho = who ? 'for your ' + who : 'for someone special';
  return 'A thoughtful gift ' + forWho + ' is something tied to what they love: a book by an author they enjoy, a cooking class or concert tickets to share, or a framed photo of a favorite memory with a handwritten note. Experiences together are often remembered longer than objects, and a personal note makes any present feel special.';
}

function travel(s) {
  if (!/\b(where should (i|we) (go|travel|visit)|travel (destination|ideas?|recommendations?)|vacation (ideas?|spot|destination)|holiday (ideas?|destination)|(recommend|suggest)\w* (a |some )?(place|city|country|destination) to (visit|travel|go))\b/.test(s)) return null;
  return 'Try Lisbon, Portugal: sunny, walkable and affordable, with hilly old neighborhoods, great seafood, pastel de nata pastries and day trips to Sintra\'s palaces. If you prefer nature, the national parks of Utah or the coast of New Zealand are breathtaking, and Japan is wonderful for food, culture and very safe solo travel.';
}

function focus(s) {
  if (!/\b(tips|advice|how (can|do) i|help me)\b/.test(s)) return null;
  if (!/\b(focus|concentrate|stay motivated|procrastinat|be more productive|productivity|study better|stay focused|get motivated)\b/.test(s)) return null;
  return 'Try the Pomodoro method: work for 25 minutes with your phone in another room, then take a 5 minute break, and after four rounds take a longer one. Start each session with one small, clear task so beginning feels easy. Keep your desk tidy, drink water, and reward yourself when you finish. Motivation often follows action, so start before you feel ready.';
}

const ROUTES = [nerves, sleep, names, quote, encourage, calm, friends, food, hobby, sport, gift, travel, focus, media, weekend];

function route(q) {
  const s = norm(q);
  if (excluded(s)) return null;
  for (const r of ROUTES) {
    const t = r(s);
    if (t) return t;
  }
  return null;
}

export function can(q) {
  return route(q) !== null;
}

export function answer(q) {
  return route(q);
}
