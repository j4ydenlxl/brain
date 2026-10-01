// planning-direct-g2: day-by-day and week-by-week plans, grown in lane direct.
// Pure, synchronous, deterministic: the same prompt always gives the same plan.

export const meta = { id: 'planning-direct-g2', class: 'planning', generation: 2, lane: 'direct', grownFrom: ["plan a 3-day trip to Rome","make a 5-day study plan for a biology exam","a 4-week plan to run a 5k","give me a 7 day meal plan","a study schedule for 3 days","plan a 2-day trip to Paris","a 6-week plan to learn the guitar"], version: 1 };

export const examples = [
  {"q":"plan a 3-day trip to Rome","expect":{"contains":["day 1","day 2","day 3","rome"],"minWords":60,"notRefusal":true}},
  {"q":"make a 5-day study plan for a biology exam","expect":{"contains":["day 1","day 5","biology"],"minWords":60,"notRefusal":true}},
  {"q":"a 4-week plan to run a 5k","expect":{"contains":["week 1","week 4"],"minWords":60,"notRefusal":true,"containsAny":["run","5k"]}},
  {"q":"give me a 7 day meal plan","expect":{"contains":["day 1","day 7"],"minWords":80,"notRefusal":true,"containsAny":["breakfast","lunch","dinner"]}},
  {"q":"a study schedule for 3 days","expect":{"contains":["day 1","day 3"],"minWords":40,"notRefusal":true}},
  {"q":"plan a 2-day trip to Paris","expect":{"contains":["day 1","day 2","paris"],"minWords":40,"notRefusal":true}},
  {"q":"a 6-week plan to learn the guitar","expect":{"contains":["week 1","week 6","guitar"],"minWords":60,"notRefusal":true}}
];

// ---------- counting ----------

const WORDNUM = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  'twenty one': 21, 'twenty eight': 28
};
const NUMWORD = '(?:twenty[- ]one|twenty[- ]eight|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty)';
const COUNT_RE = new RegExp('\\b(\\d{1,3}|' + NUMWORD + ')\\s*[- ]?\\s*(day|week)s?\\b', 'i');
const ONE_RE = /\b(?:(?:for|in|over|within|across|during)\s+(?:a|an|one)\s+(day|week)\b|(?:a|one)[- ](day|week)[- ](?:long[- ])?(?:plan|trip|itinerary|schedule|routine|program|programme|meal|workout|study|vacation|holiday|getaway|tour|challenge|diet|menu|training|course))/i;

function toNum(s) {
  const t = s.toLowerCase().replace('-', ' ');
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  return WORDNUM[t] || 0;
}

function parseCount(q) {
  let m = COUNT_RE.exec(q);
  if (m) {
    const n = toNum(m[1]);
    if (n >= 1) return { n, unit: m[2].toLowerCase(), span: m[0] };
  }
  m = ONE_RE.exec(q);
  if (m) return { n: 1, unit: (m[1] || m[2]).toLowerCase(), span: m[0] };
  m = /\bfortnight\b/i.exec(q);
  if (m) return { n: 2, unit: 'week', span: m[0] };
  m = /\b(?:a\s+|one\s+)?weekend\b/i.exec(q);
  if (m) return { n: 2, unit: 'day', span: m[0] };
  m = /\bweekly\b/i.exec(q);
  if (m) return { n: 1, unit: 'week', span: m[0] };
  return null;
}

const TRIGGER = /\b(?:plan\b|plans\b(?!\s+to\b)|planner|planning|schedules?|itinerar(?:y|ies)|routines?|programs?|programmes?|regimen|timetable|agenda|roadmap|curriculum|split|trip|vacation|holiday|getaway|tour|course|bootcamp|challenge|menu|meal prep|how (?:should i|to|do i|would you) spend|what (?:to|should i|can i) do|things to do|guide me|break (?:it )?down)\b/i;
const REJECT = /\bhow (?:many|much|long|far|fast|old)\b|\btotal\b|\baltogether\b|\bin all\b|\bcalculate\b|\bcompute\b|\bsolve\b|\baverage\b|\bper cent\b|\bpercent\b|\d\s*[+*\/=x×÷^]\s*\d|\bequation\b|\bwho are you\b|\bwhat are you\b/i;

export function can(q) {
  if (typeof q !== 'string') return false;
  const s = q.trim();
  if (s.length < 6 || s.length > 400) return false;
  if (REJECT.test(s)) return false;
  const c = parseCount(s);
  if (!c) return false;
  if (c.unit === 'day' && c.n > 100) return false;
  if (c.unit === 'week' && c.n > 52) return false;
  if (!TRIGGER.test(s)) return false;
  return true;
}

// ---------- helpers ----------

function pick(list, i) { return list[((i % list.length) + list.length) % list.length]; }
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function titleCase(s) { return s.split(/\s+/).map(w => /^(of|the|and|de|la|del|da|di)$/i.test(w) ? w.toLowerCase() : cap(w)).join(' '); }
function stage(k, n, len) { return n <= 1 ? 0 : Math.min(len - 1, Math.floor((k - 1) * len / n)); }
function plural(n, unit) { return n + '-' + unit; }
function an(n) { return /^(?:8|11|18|80|8\d)$/.test(String(n)) ? 'an' : 'a'; }

function stripCount(q, span) {
  return q.replace(span, ' ').replace(/\s+/g, ' ').trim();
}

function cleanPhrase(s) {
  if (!s) return '';
  let t = s.replace(/[?!.,;:"]+/g, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/\b(?:please|thanks|thank you|for me|for us)\b/gi, ' ').replace(/\s+/g, ' ').trim();
  t = t.replace(/^(?:the|a|an|my|our|your|some)\s+/i, '');
  t = t.replace(/\s+(?:for|in|over|within|across|during|with|starting|from|on|by|that|which|so|and|plan|schedule|itinerary|trip|exam|test)$/i, '');
  t = t.replace(/\s+(?:for|in|over|within|across|during|with|starting|from|on|by)\s*$/i, '');
  return t.trim();
}

const BAD_SUBJECT = /^(?:a|an|the|my|me|it|this|that|plan|schedule|study|studying|days?|weeks?|routine|program|programme|exam|test|final|finals|\d+.*|)$/i;

// ---------- category detection ----------

function category(q) {
  const s = q.toLowerCase();
  if (/\b(?:meal|meals|diet|eating|menu|food plan|nutrition|meal prep|recipes?|breakfasts?|lunches|dinners)\b/.test(s)) return 'meal';
  if (/\b(?:trip|travel|travell?ing|vacation|holiday|itinerary|getaway|visit|visiting|sightseeing|tour|honeymoon|road trip|things to do|what to do|backpacking)\b/.test(s) && !/\b(?:study|exam|workout|learn)\b/.test(s)) return 'travel';
  if (/\b(?:\d+\s*k|5k|10k|marathon|half[- ]marathon|run|running|jog|jogging|couch to)\b/.test(s)) return 'run';
  if (/\b(?:workout|work out|exercise|fitness|gym|strength|lift|lifting|weights|muscle|lose weight|weight loss|get fit|get in shape|toned?|cardio|hiit|abs|core|push-?ups?|pull-?ups?|squats?|yoga|pilates|stretching|flexibility|calisthenics|bodyweight|training split|split)\b/.test(s)) return 'workout';
  if (/\b(?:exam|exams|test|tests|midterms?|finals?|quiz|gcse|a-level|sat|act|mcat|lsat|gre|gmat|bar exam|boards?|certification)\b/.test(s)) return 'study';
  if (/\b(?:learn|learning|practi[sc]e|practi[sc]ing|master|get better at|improve at|pick up|teach myself|become fluent|fluent in)\b/.test(s)) return 'learn';
  if (/\b(?:study|studying|revision|revise|revising|review|reviewing|homework|coursework|cram|cramming)\b/.test(s)) return 'study';
  if (/\b(?:spend|spending|weekend|days? in|weeks? in|explore|exploring)\b/.test(s) && /\b(?:in|to|around|through|across)\s+[A-Z]/.test(q)) return 'travel';
  for (const k of Object.keys(CITIES)) if (new RegExp('\\b' + k + '\\b').test(s)) return 'travel';
  return 'generic';
}

// ---------- travel ----------

const CITIES = {
  rome: { sights: ['the Colosseum and the Roman Forum', 'the Palatine Hill', 'the Vatican Museums and the Sistine Chapel', "St. Peter's Basilica and its dome climb", 'the Pantheon', 'the Trevi Fountain and the Spanish Steps', "Piazza Navona and Campo de' Fiori", 'the Trastevere neighborhood', 'the Borghese Gallery and gardens', 'the Appian Way and the catacombs', "Castel Sant'Angelo"], food: ['cacio e pepe in Trastevere', "carbonara near Campo de' Fiori", 'gelato near the Pantheon', 'suppli and pizza al taglio', 'an aperitivo on Piazza Navona'], trip: 'a day trip to Ostia Antica or Tivoli' },
  paris: { sights: ['the Eiffel Tower and the Champ de Mars', 'the Louvre', 'Notre-Dame and the Ile de la Cite', 'Sainte-Chapelle', "the Musee d'Orsay", 'Montmartre and the Sacre-Coeur', 'the Latin Quarter and the Luxembourg Gardens', 'the Arc de Triomphe and the Champs-Elysees', 'the Marais', 'a Seine river cruise', 'the Centre Pompidou'], food: ['croissants from a neighborhood boulangerie', 'a bistro dinner of steak frites', 'crepes in Montparnasse', 'falafel in the Marais', 'wine and cheese by the Seine'], trip: 'a day trip to Versailles' },
  london: { sights: ['the Tower of London and Tower Bridge', 'Westminster Abbey and the Houses of Parliament', 'the British Museum', "Buckingham Palace and St. James's Park", 'the National Gallery and Trafalgar Square', 'the South Bank and the London Eye', 'Borough Market', 'Camden Market', 'the Natural History Museum', 'Covent Garden', 'Hyde Park'], food: ['a full English breakfast', 'fish and chips', 'a Sunday roast in a pub', 'curry on Brick Lane', 'afternoon tea'], trip: 'a day trip to Windsor or Oxford' },
  tokyo: { sights: ['Senso-ji temple in Asakusa', 'the Meiji Shrine and Harajuku', 'Shibuya Crossing', 'Shinjuku Gyoen garden', 'the Tsukiji outer market', 'the Imperial Palace East Gardens', 'Akihabara', 'Ueno Park and the Tokyo National Museum', 'teamLab Planets', 'the Tokyo Skytree', 'Odaiba'], food: ['ramen in Shinjuku', 'sushi at the Tsukiji outer market', 'yakitori in Omoide Yokocho', 'a convenience-store snack crawl', 'izakaya small plates'], trip: 'a day trip to Nikko or Kamakura' },
  'new york': { sights: ['Central Park', 'the Metropolitan Museum of Art', 'the Statue of Liberty and Ellis Island', 'the 9/11 Memorial', 'the Brooklyn Bridge and DUMBO', 'Times Square and Broadway', 'the High Line and Chelsea Market', 'the Empire State Building', 'the Museum of Modern Art', 'Greenwich Village', 'Grand Central Terminal'], food: ['bagels and lox', 'a slice of New York pizza', 'dumplings in Chinatown', 'a pastrami sandwich', 'dinner in the West Village'], trip: 'a day exploring Williamsburg in Brooklyn' },
  barcelona: { sights: ['the Sagrada Familia', 'Park Guell', 'the Gothic Quarter', 'La Rambla and the Boqueria market', 'Casa Batllo and Casa Mila', 'the Picasso Museum', 'Barceloneta beach', 'Montjuic', 'El Born'], food: ['tapas in El Born', 'paella by the beach', 'churros con chocolate', 'vermouth and pintxos'], trip: 'a day trip to Montserrat' },
  berlin: { sights: ['the Brandenburg Gate and the Reichstag', 'the Memorial to the Murdered Jews of Europe', 'Museum Island', 'the East Side Gallery', 'Checkpoint Charlie', 'Tiergarten', 'the Berlin Wall Memorial', 'Kreuzberg'], food: ['currywurst', 'a doner kebab', 'breakfast in Prenzlauer Berg', 'beer in a biergarten'], trip: 'a day trip to Potsdam' },
  amsterdam: { sights: ['the Rijksmuseum', 'the Van Gogh Museum', 'the Anne Frank House', 'a canal cruise', 'the Jordaan', 'Vondelpark', 'the Albert Cuyp market'], food: ['stroopwafels', 'Dutch pancakes', 'Indonesian rijsttafel', 'bitterballen in a brown cafe'], trip: 'a day trip to Zaanse Schans' },
  lisbon: { sights: ['the Alfama and Sao Jorge Castle', 'Belem Tower and Jeronimos Monastery', 'tram 28', 'the Bairro Alto', 'the LX Factory', 'the Miradouro da Senhora do Monte'], food: ['pasteis de nata', 'grilled sardines', 'a bifana sandwich', 'fado and dinner in Alfama'], trip: 'a day trip to Sintra' },
  madrid: { sights: ['the Prado Museum', 'the Royal Palace', 'Retiro Park', 'Plaza Mayor', 'the Reina Sofia', 'Gran Via'], food: ['churros at San Gines', 'tapas in La Latina', 'a bocadillo de calamares', 'cocido madrileno'], trip: 'a day trip to Toledo' },
  florence: { sights: ["the Duomo and Brunelleschi's dome", 'the Uffizi Gallery', "the Accademia and Michelangelo's David", 'the Ponte Vecchio', 'the Pitti Palace and Boboli Gardens', 'Piazzale Michelangelo at sunset'], food: ['bistecca alla fiorentina', 'a lampredotto sandwich', 'gelato', 'Chianti in Oltrarno'], trip: 'a day trip into Tuscany' },
  venice: { sights: ["St. Mark's Basilica", "the Doge's Palace", 'the Rialto Bridge', 'a gondola ride', "the Gallerie dell'Accademia", 'Murano and Burano'], food: ['cicchetti in a bacaro', 'squid ink pasta', 'tiramisu', 'a spritz'], trip: 'a boat to Murano and Burano' },
  prague: { sights: ['Prague Castle', 'the Charles Bridge', 'Old Town Square and the Astronomical Clock', 'the Jewish Quarter', 'Petrin Hill', 'Vysehrad'], food: ['goulash and dumplings', 'trdelnik', 'Czech beer', 'svickova'], trip: 'a day trip to Kutna Hora' },
  vienna: { sights: ['Schonbrunn Palace', "St. Stephen's Cathedral", 'the Hofburg', 'the Belvedere', 'the Kunsthistorisches Museum', 'the Naschmarkt'], food: ['Wiener schnitzel', 'Sachertorte', 'a coffee house breakfast', 'a heuriger wine tavern'], trip: 'a day trip to the Wachau valley' },
  istanbul: { sights: ['Hagia Sophia', 'the Blue Mosque', 'Topkapi Palace', 'the Grand Bazaar', 'the Basilica Cistern', 'a Bosphorus cruise', 'Galata Tower'], food: ['a Turkish breakfast', 'balik ekmek by the Galata Bridge', 'baklava', 'meze in Karakoy'], trip: "a ferry to the Princes' Islands" },
  kyoto: { sights: ['Fushimi Inari shrine', 'Kinkaku-ji', 'the Arashiyama bamboo grove', 'Kiyomizu-dera', 'the Gion district', 'Nishiki Market'], food: ['a kaiseki dinner', 'matcha sweets', 'tofu in Arashiyama', 'street food at Nishiki Market'], trip: 'a day trip to Nara' },
  athens: { sights: ['the Acropolis and the Parthenon', 'the Acropolis Museum', 'the Ancient Agora', 'Plaka', 'Lycabettus Hill', 'the National Archaeological Museum'], food: ['souvlaki', 'a Greek salad and grilled fish', 'loukoumades', 'meze in Psyrri'], trip: 'a trip to Cape Sounion' },
  dublin: { sights: ['Trinity College and the Book of Kells', 'the Guinness Storehouse', 'Temple Bar', 'Kilmainham Gaol', "St. Stephen's Green"], food: ['an Irish breakfast', 'Irish stew', 'a pint in a traditional pub'], trip: 'a day trip to Howth or Glendalough' },
  edinburgh: { sights: ['Edinburgh Castle', 'the Royal Mile', "Arthur's Seat", 'Holyrood Palace', 'the National Museum of Scotland', 'Calton Hill'], food: ['haggis, neeps and tatties', 'a whisky tasting', 'fish and chips'], trip: 'a day trip into the Highlands' },
  budapest: { sights: ['the Parliament building', "Buda Castle and the Fisherman's Bastion", 'the Szechenyi baths', 'the Chain Bridge', 'the ruin bars of the Jewish Quarter'], food: ['goulash', 'langos', 'chimney cake'], trip: 'a day trip to Szentendre' },
  sydney: { sights: ['the Sydney Opera House', 'the Harbour Bridge', 'Bondi Beach and the coastal walk', 'the Rocks', 'the Royal Botanic Garden', 'a ferry to Manly'], food: ['fish and chips at Manly', 'brunch in Surry Hills', 'a meat pie'], trip: 'a day trip to the Blue Mountains' },
  bangkok: { sights: ['the Grand Palace', 'Wat Pho', 'Wat Arun', 'Chatuchak market', 'a canal boat tour', 'Chinatown'], food: ['pad thai', 'street food on Yaowarat Road', 'mango sticky rice'], trip: 'a day trip to Ayutthaya' },
  singapore: { sights: ['Gardens by the Bay', 'Marina Bay Sands', 'Chinatown', 'Little India', 'Sentosa', 'the Singapore Botanic Gardens'], food: ['chicken rice at a hawker centre', 'chilli crab', 'kaya toast'], trip: 'an afternoon on Sentosa' },
  seoul: { sights: ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'Myeongdong', 'N Seoul Tower', 'Gwangjang Market', 'Insadong'], food: ['Korean barbecue', 'bibimbap', 'tteokbokki'], trip: 'a tour to the DMZ' },
  'san francisco': { sights: ['the Golden Gate Bridge', 'Alcatraz', "Fisherman's Wharf", 'Chinatown', 'Golden Gate Park', 'the Mission District'], food: ['clam chowder in a sourdough bowl', 'a Mission burrito', 'dim sum'], trip: 'a day trip to Muir Woods or Napa' },
  chicago: { sights: ['Millennium Park and the Bean', 'the Art Institute', 'an architecture river cruise', 'Navy Pier', 'Willis Tower'], food: ['deep-dish pizza', 'a Chicago hot dog', 'Italian beef'], trip: 'a walk along the Lakefront Trail' }
};

function extractPlace(q, span) {
  const s = stripCount(q, span);
  const tries = [
    /\b(?:trip|travel|travell?ing|vacation|holiday|itinerary|getaway|tour|honeymoon|visit|visiting|stay|weekend|go|going|things to do|what to do|spend|plan)\b[^]*?\b(?:to|in|of|around|through|across|at|for|visiting)\s+(.+)$/i,
    /\b(?:visit|visiting|explore|exploring|see|seeing)\s+(.+)$/i,
    /^(?:.*?\b(?:plan|make|give me|create|write|build)\s+(?:me\s+)?(?:a|an|my)?\s*)?(.+?)\s+(?:trip|vacation|holiday|itinerary|getaway|tour)\b/i
  ];
  for (const re of tries) {
    const m = re.exec(s);
    if (!m) continue;
    let p = m[1];
    p = p.replace(/\s+(?:for|in|over|with|on|during|under|this|next|starting|from|by|and)\b.*$/i, '');
    p = p.replace(/\s+(?:trip|vacation|holiday|itinerary|getaway|tour|plan|schedule)\b.*$/i, '');
    p = cleanPhrase(p);
    if (!p || /^(?:a|an|the|me|us|my|plan|trip|day|days|week|weeks|budget|family|kids?|friends?|solo|couple|it|there|travel|vacation|holiday|itinerary)$/i.test(p) || /\d/.test(p) || p.split(' ').length > 5) continue;
    return p;
  }
  return '';
}

function travel(q, c) {
  const place = extractPlace(q, c.span);
  const key = place.toLowerCase().replace(/\s+city$/, '');
  const city = CITIES[key] || CITIES[key.replace(/\s+(?:italy|france|japan|spain|england|uk|usa|germany)$/, '')];
  const P = place ? (/[A-Z]/.test(place) ? place : titleCase(place)) : 'your destination';
  const days = c.unit === 'week' ? Math.min(c.n * 7, 60) : c.n;
  const out = [];
  out.push(`Here is ${an(days)} ${days}-day itinerary for ${P}, one heading per day, paced so you see the highlights without rushing.`);
  const generic = [
    [`Arrive in ${P}, check in and drop your bags`, `walk the historic center of ${P} to get your bearings`, `dinner at a local restaurant serving the regional specialty`],
    [`Visit the main museum or landmark of ${P} early, before the crowds`, `lunch at a market hall or food stalls`, `an afternoon walking tour of the oldest quarter of ${P}`],
    [`Explore a lively neighborhood of ${P} on foot, with its cafes and shops`, `a park, garden or riverside walk in the afternoon`, `sunset from the best viewpoint in ${P}`],
    [`A day trip from ${P} to a nearby town, coast or countryside`, `a picnic or a long lunch on the road`, `back in ${P} for a relaxed dinner`],
    [`A food tour or cooking class in ${P}`, `a second museum, gallery or historic site you skipped`, `evening at a concert, show or night market`],
    [`A slow morning at a cafe in ${P}`, `shopping for local crafts and souvenirs`, `a farewell dinner somewhere special`],
    [`Revisit your favourite corner of ${P}`, `a guided tour of a site that needs context, such as a palace or cathedral`, `an evening stroll through a district you have not seen yet`]
  ];
  for (let d = 1; d <= days; d++) {
    if (c.unit === 'week' && (d - 1) % 7 === 0) out.push(`\nWeek ${(d - 1) / 7 + 1}`);
    let items;
    const last = d === days && days > 1;
    if (city) {
      const s = city.sights;
      const a = pick(s, (d - 1) * 2), b = pick(s, (d - 1) * 2 + 1);
      if (d === 1) items = [`Arrive in ${P} and start with ${a}`, `continue to ${b}`, `dinner: ${pick(city.food, 0)}`];
      else if (d === 4 && days >= 5) items = [`${cap(city.trip)} from ${P}`, `back in ${P} in the late afternoon`, `dinner: ${pick(city.food, d)}`];
      else if (last) items = [`Last morning in ${P}: ${a}`, `pick up souvenirs and try ${pick(city.food, d)}`, `head to the airport or station with time to spare`];
      else items = [`Morning: ${a}`, `afternoon: ${b}`, `evening in ${P}: ${pick(city.food, d)}`];
    } else {
      items = last ? [`A final breakfast in ${P}`, `one last sight or a walk through your favourite area`, `depart ${P} with time to spare for the airport or station`] : pick(generic, d - 1);
    }
    out.push(`Day ${d}: ${items[0]}`);
    for (const it of items.slice(1)) out.push(`- ${cap(it)}`);
  }
  out.push(`\nTips: book timed tickets for the busiest sights in ${P} ahead of time, wear comfortable shoes, and leave some slack each day for wandering.`);
  return out.join('\n');
}

// ---------- meals ----------

const MEALS = {
  standard: {
    b: ['oatmeal with berries and a spoon of peanut butter', 'Greek yogurt with granola and banana', 'scrambled eggs on wholegrain toast with spinach', 'a smoothie of spinach, banana, oats and milk', 'avocado toast with a poached egg', 'whole-wheat pancakes with fruit', 'overnight oats with chia and apple'],
    l: ['grilled chicken salad with quinoa and vegetables', 'a turkey and hummus wrap with a side salad', 'lentil soup with crusty bread', 'a tuna and white bean salad', 'a chicken and vegetable rice bowl', 'a whole-wheat pasta salad with feta and tomatoes', 'a black bean and corn burrito bowl'],
    d: ['baked salmon with roasted potatoes and broccoli', 'chicken stir-fry with peppers and brown rice', 'turkey chili with beans', 'spaghetti with tomato sauce, lean beef and a green salad', 'sheet-pan chicken thighs with sweet potato and carrots', 'shrimp tacos with cabbage slaw', 'a vegetable curry with chickpeas and rice']
  },
  vegetarian: {
    b: ['oatmeal with berries and walnuts', 'Greek yogurt with granola and honey', 'a spinach and feta omelette', 'a fruit and oat smoothie', 'avocado toast with a fried egg', 'banana pancakes', 'chia pudding with mango'],
    l: ['a caprese sandwich with a side salad', 'lentil soup with bread', 'a falafel wrap with tahini', 'a quinoa salad with roasted vegetables and halloumi', 'a black bean burrito bowl', 'a vegetable and egg fried rice', 'a Greek salad with chickpeas'],
    d: ['vegetable lasagna', 'a chickpea and spinach curry with rice', 'a tofu and vegetable stir-fry', 'mushroom risotto', 'bean chili with cornbread', 'stuffed peppers with rice and cheese', 'pasta primavera']
  },
  vegan: {
    b: ['oatmeal with soy milk, berries and flaxseed', 'a tofu scramble with peppers', 'peanut butter toast with banana', 'a green smoothie with oats and plant protein', 'chia pudding with coconut milk', 'avocado toast with tomatoes', 'a muesli bowl with almond milk'],
    l: ['a hummus and roasted vegetable wrap', 'red lentil soup', 'a quinoa and black bean salad', 'a falafel bowl with tahini', 'a chickpea salad sandwich', 'a soba noodle salad with edamame', 'a burrito bowl with beans and salsa'],
    d: ['a chickpea and sweet potato curry', 'a tofu stir-fry with brown rice', 'lentil bolognese with pasta', 'black bean tacos', 'a vegetable and tempeh noodle bowl', 'a stuffed squash with wild rice', 'a bean and vegetable stew']
  },
  lowcarb: {
    b: ['scrambled eggs with spinach and avocado', 'Greek yogurt with a few berries and nuts', 'a cheese and mushroom omelette', 'chia pudding with coconut milk', 'smoked salmon with cream cheese and cucumber', 'eggs and turkey sausage', 'a frittata with peppers'],
    l: ['a chicken Caesar salad without croutons', 'a tuna salad lettuce wrap', 'a cobb salad', 'zucchini noodles with pesto and chicken', 'a burger patty with a side salad', 'egg salad in lettuce cups', 'grilled halloumi with roasted vegetables'],
    d: ['baked salmon with asparagus', 'steak with garlic butter and green beans', 'roast chicken with cauliflower mash', 'shrimp stir-fry with vegetables', 'pork chops with roasted Brussels sprouts', 'a beef and vegetable curry with cauliflower rice', 'stuffed zucchini boats']
  }
};
const SNACKS = ['an apple with almonds', 'carrot sticks and hummus', 'a handful of mixed nuts', 'a pear with walnuts', 'berries with seeds'];

function meal(q, c) {
  const s = q.toLowerCase();
  let kind = 'standard', label = 'balanced';
  if (/\b(?:vegan|plant[- ]based)\b/.test(s)) { kind = 'vegan'; label = 'vegan'; }
  else if (/\b(?:vegetarian|veggie|meatless)\b/.test(s)) { kind = 'vegetarian'; label = 'vegetarian'; }
  else if (/\b(?:keto|low[- ]carb|diabetic)\b/.test(s)) { kind = 'lowcarb'; label = 'low-carb'; }
  else if (/\b(?:high[- ]protein|muscle|bulk)/.test(s)) label = 'high-protein';
  else if (/\b(?:lose weight|weight loss|healthy|cutting|low[- ]calorie)\b/.test(s)) label = 'healthy, portion-aware';
  const M = MEALS[kind];
  const days = c.unit === 'week' ? Math.min(c.n * 7, 60) : c.n;
  const out = [`Here is ${an(days)} ${days}-day ${label} meal plan with breakfast, lunch and dinner for each day, plus a snack.`];
  for (let d = 1; d <= days; d++) {
    if (c.unit === 'week' && (d - 1) % 7 === 0) out.push(`\nWeek ${(d - 1) / 7 + 1}`);
    const r = Math.floor((d - 1) / 7);
    out.push(`Day ${d}`);
    out.push(`- Breakfast: ${pick(M.b, d - 1 + r)}`);
    out.push(`- Lunch: ${pick(M.l, d + 1 + r * 2)}`);
    out.push(`- Dinner: ${pick(M.d, d + 3 + r * 3)}`);
    out.push(`- Snack: ${pick(SNACKS, d - 1)}`);
  }
  out.push(`\nTips: shop once for the whole plan, cook grains and proteins in bulk on Day 1, drink water through the day, and adjust portions to your hunger and energy needs.`);
  return out.join('\n');
}

// ---------- running ----------

function run(q, c) {
  const s = q.toLowerCase();
  let goal = '5k', dist = 5, m;
  if (/half[- ]marathon/.test(s)) { goal = 'half marathon'; dist = 21.1; }
  else if (/marathon/.test(s)) { goal = 'marathon'; dist = 42.2; }
  else if ((m = /\b(\d{1,2})\s*k\b/.exec(s))) { goal = m[1] + 'k'; dist = parseInt(m[1], 10); }
  else if ((m = /\b(\d{1,2})\s*(?:km|kilomet)/.exec(s))) { goal = m[1] + ' km'; dist = parseInt(m[1], 10); }
  else if (/\bmile\b/.test(s)) { goal = 'one mile'; dist = 1.6; }
  const beginner = /\b(?:beginner|couch|from scratch|never run|new to)/.test(s) || dist <= 5;
  const N = c.n;
  const out = [`Here is ${an(N)} ${plural(N, c.unit)} plan to run a ${goal}${beginner ? ', built for a beginner' : ''}: three or four runs per week, always with an easy warm-up walk and a cool-down stretch.`];
  if (c.unit === 'week') {
    for (let w = 1; w <= N; w++) {
      const f = N === 1 ? 1 : (w - 1) / (N - 1);
      const last = w === N;
      const taper = !last && w === N - 1 && N >= 4;
      const longKm = Math.max(1, Math.round((dist * (0.35 + 0.6 * f)) * 10) / 10);
      const runMin = Math.round(1 + f * 9);
      const walkMin = Math.max(1, Math.round(3 - f * 2));
      out.push(`Week ${w}`);
      if (last) {
        out.push(`- Two short easy runs early in the week, 20 to 30 minutes each, with a few 20-second strides`);
        out.push(`- Rest the two days before race day and eat and sleep well`);
        out.push(`- Race day: run your ${goal}, start slower than you want and finish strong`);
      } else if (dist <= 5 && beginner) {
        out.push(`- Run 1: ${runMin} min jog / ${walkMin} min walk, repeated for about 25 minutes`);
        out.push(`- Run 2: the same intervals on a different route`);
        out.push(`- Run 3: a longer run-walk covering about ${longKm} km at a conversational pace${taper ? ' (keep it gentle, you are tapering)' : ''}`);
      } else {
        out.push(`- Easy run: ${Math.round(25 + f * 25)} minutes at a conversational pace`);
        out.push(`- Quality session: ${w % 2 ? 'intervals, 6 x 400 m faster with 90 s jog recovery' : 'a tempo run, 15 to 25 minutes comfortably hard'}`);
        out.push(`- Long run: ${taper ? Math.round(longKm * 0.6 * 10) / 10 : longKm} km slow and steady${taper ? ', cut back this week to taper' : ''}`);
        out.push(`- Optional: 20 minutes of cross-training or strength work`);
      }
    }
  } else {
    for (let d = 1; d <= N; d++) {
      const f = N === 1 ? 1 : (d - 1) / (N - 1);
      const kindI = (d - 1) % 3;
      out.push(`Day ${d}`);
      if (d === N) out.push(`- Run your ${goal} at an even pace, then walk and stretch for ten minutes`);
      else if (kindI === 0) out.push(`- Run-walk: ${Math.round(1 + f * 9)} min run / 1 min walk for ${Math.round(20 + f * 15)} minutes`);
      else if (kindI === 1) out.push(`- Rest or cross-train: a brisk walk, bike ride or swim for 30 minutes, plus calf and hip stretches`);
      else out.push(`- Steady run of about ${Math.max(1, Math.round(dist * (0.3 + 0.6 * f) * 10) / 10)} km at a pace where you can still talk`);
    }
  }
  out.push(`\nTips: increase total running by no more than about ten percent per week, take a rest day after every hard day, and repeat a week if your legs feel heavy.`);
  return out.join('\n');
}

// ---------- workout ----------

const WORKOUT_DAYS = [
  ['Full-body strength', 'squats 3 x 10', 'push-ups 3 x 8 to 12', 'dumbbell rows 3 x 10 per arm', 'plank 3 x 30 seconds'],
  ['Cardio', '30 minutes of brisk walking, cycling or jogging', '5 minutes of jumping jacks or skipping as a finisher', 'easy stretching for 10 minutes'],
  ['Lower body', 'lunges 3 x 10 per leg', 'Romanian deadlifts 3 x 10', 'glute bridges 3 x 15', 'calf raises 3 x 20'],
  ['Upper body', 'overhead press 3 x 10', 'push-ups or bench press 3 x 10', 'band or dumbbell rows 3 x 12', 'biceps curls and triceps dips 2 x 12'],
  ['HIIT and core', '8 rounds of 30 seconds hard, 30 seconds easy (burpees, mountain climbers, high knees)', 'dead bugs 3 x 10', 'side planks 2 x 30 seconds per side'],
  ['Mobility and yoga', '20 minutes of yoga flow', 'hip openers and hamstring stretches', 'foam rolling for 10 minutes'],
  ['Rest and active recovery', 'a 30 to 45 minute walk', 'light stretching', 'sleep at least 7 hours']
];

function workout(q, c) {
  const s = q.toLowerCase();
  const home = /\b(?:home|no equipment|bodyweight|calisthenics)\b/.test(s);
  const goal = /\b(?:lose weight|weight loss|fat)\b/.test(s) ? 'lose fat and build fitness' : /\b(?:muscle|bulk|strength|strong)\b/.test(s) ? 'build strength and muscle' : /\b(?:yoga|flexib|stretch)/.test(s) ? 'improve flexibility and mobility' : 'build general fitness';
  const out = [`Here is ${an(c.n)} ${plural(c.n, c.unit)} workout plan to ${goal}${home ? ', with exercises you can do at home' : ''}. Warm up for 5 to 10 minutes before each session.`];
  if (c.unit === 'day') {
    for (let d = 1; d <= c.n; d++) {
      const w = pick(WORKOUT_DAYS, d - 1);
      const round = Math.floor((d - 1) / 7);
      out.push(`Day ${d}: ${w[0]} workout${round ? ` (round ${round + 1}, add a set or a few reps)` : ''}`);
      for (const it of w.slice(1)) out.push(`- ${cap(home ? it.replace(/band or dumbbell |dumbbell |or bench press /g, '').replace('Romanian deadlifts', 'single-leg hip hinges').replace('overhead press', 'pike push-ups') : it)}`);
    }
  } else {
    for (let k = 1; k <= c.n; k++) {
      const f = c.n === 1 ? 0 : (k - 1) / (c.n - 1);
      const sets = 2 + Math.round(f * 2);
      const deload = c.n >= 6 && k % 4 === 0;
      out.push(`Week ${k}${deload ? ' (lighter week to recover)' : ''}`);
      out.push(`- Monday: full-body strength workout, squats, push-ups, rows and planks, ${deload ? 2 : sets} sets each`);
      out.push(`- Tuesday: ${Math.round(20 + f * 20)} minutes of cardio exercise`);
      out.push(`- Wednesday: mobility, yoga or a rest day`);
      out.push(`- Thursday: lower body, lunges, hip hinges and glute bridges, ${deload ? 2 : sets} sets`);
      out.push(`- Friday: upper body and core, presses, rows, dead bugs and side planks`);
      out.push(`- Weekend: one HIIT session of ${Math.round(10 + f * 10)} minutes and one long walk`);
    }
  }
  out.push(`\nTips: add a little weight or a few reps each week when the last set feels easy, keep good form over speed, and eat enough protein to recover.`);
  return out.join('\n');
}

// ---------- study ----------

const SUBJECT_TOPICS = {
  biology: ['cell structure and organelles', 'cell membranes and transport', 'biological molecules and enzymes', 'cell respiration and photosynthesis', 'DNA, replication and protein synthesis', 'genetics and inheritance', 'evolution and natural selection', 'ecology and ecosystems', 'human physiology: circulation, respiration and digestion', 'the nervous and endocrine systems', 'plant biology'],
  chemistry: ['atomic structure and the periodic table', 'bonding and molecular shapes', 'stoichiometry and the mole', 'states of matter and gas laws', 'thermochemistry', 'reaction rates and equilibrium', 'acids, bases and pH', 'redox and electrochemistry', 'organic chemistry and functional groups'],
  physics: ['units, vectors and kinematics', "forces and Newton's laws", 'work, energy and power', 'momentum and collisions', 'circular motion and gravitation', 'waves and sound', 'electricity and circuits', 'magnetism and induction', 'light and optics', 'thermal and modern physics'],
  math: ['algebra and equations', 'functions and graphs', 'trigonometry', 'sequences and series', 'differentiation', 'integration', 'probability', 'statistics', 'vectors and geometry'],
  calculus: ['limits and continuity', 'derivatives and the rules of differentiation', 'applications of derivatives', 'integrals and antiderivatives', 'techniques of integration', 'applications of integrals', 'series'],
  history: ['the timeline and key dates', 'causes of the major events', 'key figures and their roles', 'political and economic changes', 'social and cultural changes', 'consequences and turning points', 'source analysis and essay practice'],
  psychology: ['research methods', 'biological psychology', 'memory', 'social influence', 'attachment and development', 'psychopathology', 'cognition and perception'],
  economics: ['supply and demand', 'elasticity', 'market structures', 'market failure', 'macroeconomic indicators', 'fiscal and monetary policy', 'international trade'],
  english: ['the set texts and their plots', 'themes and characters', 'key quotations', 'language and structure analysis', 'context', 'timed essay practice'],
  spanish: ['core vocabulary', 'present tense verbs', 'past tenses', 'future and conditional', 'listening practice', 'speaking practice', 'reading and writing practice']
};
SUBJECT_TOPICS.maths = SUBJECT_TOPICS.math; SUBJECT_TOPICS.mathematics = SUBJECT_TOPICS.math; SUBJECT_TOPICS.algebra = SUBJECT_TOPICS.math;

function extractStudySubject(q, span) {
  const s = stripCount(q, span);
  const tries = [
    /\b(?:for|on|about|in)\s+(?:a|an|the|my|our)?\s*(.+?)\s+(?:exams?|tests?|midterms?|finals?|quiz(?:zes)?|class|course|module|paper)\b/i,
    /\b(?:study|studying|revision|revise|revising|review|reviewing|cram|cramming)\s+(?:plan|schedule|timetable|routine|guide)?\s*(?:for|of|on)\s+(?:a|an|the|my)?\s*(.+)$/i,
    /\b(?:study|studying|revise|revising|review|reviewing|cram|cramming)\s+(?!plan\b|schedule\b|timetable\b|routine\b|for\b)(.+)$/i,
    /\b(?:make|give me|create|plan|write|build)\s+(?:me\s+)?(?:a|an|my)?\s*(.+?)\s+(?:study|revision)\s+(?:plan|schedule|timetable)/i,
    /^(?:a|an|my)?\s*(.+?)\s+(?:exams?|tests?|midterms?|finals?)\b/i
  ];
  for (const re of tries) {
    const m = re.exec(s);
    if (!m) continue;
    let p = m[1].replace(/\s+(?:for|in|over|within|with|starting|from|by|before|next|this|that|so)\b.*$/i, '');
    p = p.replace(/\b(?:study|revision|plan|schedule|timetable|exam|test|final)\b/gi, ' ');
    p = cleanPhrase(p);
    if (!p || BAD_SUBJECT.test(p) || /\b(?:days?|weeks?|me|plan|schedule)\b/i.test(p) || p.split(' ').length > 5) continue;
    return p;
  }
  return '';
}

function study(q, c) {
  const subj = extractStudySubject(q, c.span);
  const S = subj || 'your subject';
  const isExam = /\b(?:exam|test|midterm|final|quiz|gcse|a-level|sat|act|mcat|lsat|gre|gmat|certification)s?\b/i.test(q);
  const key = subj.toLowerCase();
  const topics = SUBJECT_TOPICS[key] || SUBJECT_TOPICS[key.split(' ').pop()] || (subj
    ? [`the core concepts of ${S}`, `key terms and definitions in ${S}`, `the hardest chapter of ${S}`, `worked examples and problem types in ${S}`, `the second half of the ${S} syllabus`, `connections between ${S} topics`, `facts and formulas to memorise for ${S}`]
    : ['your notes on the first unit', 'key terms and definitions', 'the topic you find hardest', 'worked examples and problem types', 'the remaining units of the syllabus', 'connections between topics', 'facts and formulas to memorise']);
  const N = c.n;
  const H = c.unit === 'week' ? 'Week' : 'Day';
  const target = isExam ? `the ${S} exam` : S;
  const out = [`Here is ${an(N)} ${plural(N, c.unit)} study plan for ${target}. Each session is 2 to 3 hours in 25 to 50 minute focused blocks with short breaks.`];
  const per = Math.max(1, Math.min(3, Math.ceil(topics.length / Math.max(1, N - 1))));
  let ti = 0;
  for (let k = 1; k <= N; k++) {
    const last = k === N && N > 1;
    if (last) {
      out.push(`${H} ${k}: final review of ${S}`);
      out.push(`- Do one full timed practice ${isExam ? 'exam' : 'test'} on ${S} under real conditions`);
      out.push(`- Mark it and revisit only the weakest areas, using your summary sheets`);
      out.push(`- Light review in the evening, then sleep early${isExam ? ' and pack what you need for the exam' : ''}`);
      continue;
    }
    if (N === 1) {
      out.push(`${H} 1: ${S} in one ${c.unit}`);
      out.push(`- Morning: skim the whole syllabus and list every topic of ${S}, marking the weak ones`);
      out.push(`- Midday: active recall and practice questions on ${topics.slice(0, 3).join(', ')}`);
      out.push(`- Afternoon: a timed practice paper on ${S}, then correct it`);
      out.push(`- Evening: a one-page summary sheet and a short review before bed`);
      continue;
    }
    const chunk = [];
    for (let j = 0; j < per; j++) chunk.push(topics[(ti + j) % topics.length]);
    ti += per;
    out.push(`${H} ${k}: ${S}, ${chunk.join('; ')}`);
    out.push(`- ${k === 1 ? `Gather your ${subj ? S + ' ' : ''}notes, the syllabus and past papers, and list your weak topics` : `Start with a 15-minute recall quiz on what you covered in ${H} ${k - 1}`}`);
    out.push(`- Study ${chunk.join('; ')}: read, then close the book and write what you remember`);
    out.push(`- Practice questions on these topics and make flashcards for anything you missed`);
  }
  out.push(`\nTips: test yourself instead of rereading, space your reviews of each topic across the ${c.unit}s, and protect your sleep.`);
  return out.join('\n');
}

// ---------- learning a skill ----------

const INSTRUMENTS = /\b(acoustic guitar|electric guitar|bass guitar|guitar|piano|keyboard|ukulele|violin|viola|cello|drums|flute|clarinet|saxophone|trumpet|harmonica|banjo|mandolin|singing)\b/i;
const LANGUAGES = /\b(spanish|french|german|italian|portuguese|japanese|chinese|mandarin|cantonese|korean|russian|arabic|hindi|dutch|swedish|norwegian|danish|greek|turkish|polish|hebrew|vietnamese|thai|indonesian|english|latin|sign language)\b/i;
const CODING = /\b(python|javascript|typescript|java|rust|golang|ruby|php|swift|kotlin|sql|html|css|react|coding|programming|to code|web development|data science|machine learning)\b/i;

function gerund(p) {
  const w = p.split(' ');
  let v = w[0].toLowerCase();
  if (/ing$/.test(v)) return p;
  if (/ie$/.test(v)) v = v.slice(0, -2) + 'ying';
  else if (/[^e]e$/.test(v) && v.length > 2) v = v.slice(0, -1) + 'ing';
  else if (/^[^aeiou]*[aeiou][^aeiouwxy]$/.test(v)) v = v + v.slice(-1) + 'ing';
  else v = v + 'ing';
  w[0] = v;
  return w.join(' ');
}

function extractSkill(q, span) {
  const s = stripCount(q, span);
  const m = /\b(?:learn|learning|practi[sc]e|practi[sc]ing|master|get better at|improve at|improve my|pick up|teach myself|become fluent in|fluent in|study)\s+(how\s+to\s+|to\s+)?(?:play\s+)?(?:the\s+|a\s+|an\s+|some\s+|basic\s+|my\s+)?(.+)$/i.exec(s);
  if (!m) return '';
  let p = m[2].replace(/\s+(?:for|in|over|within|with|starting|from|by|before|as a|as an|so|from scratch|and)\b.*$/i, '');
  p = p.replace(/\s+(?:plan|schedule|routine)$/i, '');
  p = cleanPhrase(p);
  if (!p || BAD_SUBJECT.test(p) || p.split(' ').length > 6) return '';
  return m[1] ? gerund(p) : p;
}

const STAGES = {
  instrument: (S) => [
    [`Learn the parts of the ${S}, how to hold it and tune it`, `practise clean single notes or basic technique 15 minutes a day`, `learn your first simple melody on the ${S}`],
    [`Learn the first basic chords or scales on the ${S}`, `slow, clean transitions with a metronome`, `play along with one easy song`],
    [`Add new chords or scale positions on the ${S}`, `basic rhythm and strumming or fingering patterns`, `learn a second song and play it start to finish`],
    [`Work on speed and smooth changes on the ${S}`, `learn to read simple tabs or sheet music`, `record yourself and note what to fix`],
    [`Learn a few new techniques on the ${S}, such as barre chords, slurs or dynamics`, `practise songs with more changes`, `begin simple improvisation over a backing track`],
    [`Polish two or three full songs on the ${S}`, `play for a friend or record a clean take`, `set goals for the next stage`]
  ],
  language: (S) => [
    [`Learn the ${S} alphabet or sounds and basic pronunciation`, `greetings and the 100 most common ${S} words`, `10 minutes a day with flashcards`],
    [`Core ${S} grammar: present tense and basic sentence order`, `numbers, days, food and family vocabulary`, `listen to a beginner ${S} podcast daily`],
    [`Common ${S} verbs and questions`, `write five short sentences a day about your life`, `shadow short audio clips aloud`],
    [`Past tense in ${S}`, `read graded readers or simple articles in ${S}`, `first conversation practice with a tutor or exchange partner`],
    [`Future plans and opinions in ${S}`, `watch a show in ${S} with subtitles`, `keep a short daily journal in ${S}`],
    [`Review all ${S} grammar so far`, `a 20-minute conversation in ${S}`, `set the next goal, such as a level test`]
  ],
  coding: (S) => [
    [`Set up your tools for ${S} and run a first program`, `variables, types and basic operations in ${S}`, `solve five tiny exercises`],
    [`Conditionals and loops in ${S}`, `functions and how to break a problem into steps`, `write a small number-guessing game`],
    [`Data structures in ${S}: lists, maps and strings`, `reading and writing files`, `practise on short coding challenges daily`],
    [`Modules, libraries and debugging in ${S}`, `learn version control with git`, `start a small project of your own`],
    [`Build the main features of your ${S} project`, `write tests for your code`, `read other people's ${S} code`],
    [`Finish and polish the ${S} project`, `write a short README and share it`, `choose the next topic to go deeper`]
  ],
  skill: (S) => [
    [`Learn the fundamentals of ${S} from one good beginner resource`, `gather what you need to practise ${S}`, `practise the most basic technique for 20 to 30 minutes`],
    [`Break ${S} into its core sub-skills and drill the first one`, `copy a simple example from someone skilled at ${S}`, `note what feels hardest`],
    [`Drill the next sub-skill of ${S}`, `combine the first two sub-skills in a small piece of practice`, `get feedback from a teacher, forum or friend`],
    [`Deliberate practice on your weakest area of ${S}`, `attempt a slightly harder exercise or project`, `review your progress against your first attempt`],
    [`A small complete project or performance in ${S}`, `refine based on feedback`, `practise consistently every day, even briefly`],
    [`Review everything you learned about ${S}`, `show your result to someone`, `set the goal for your next stage of ${S}`]
  ]
};

function learn(q, c) {
  let S = extractSkill(q, c.span);
  let kind = 'skill';
  let m;
  if ((m = INSTRUMENTS.exec(q))) { kind = 'instrument'; S = m[1].toLowerCase(); }
  else if ((m = LANGUAGES.exec(q))) { kind = 'language'; S = m[1].toLowerCase() === 'sign language' ? 'sign language' : cap(m[1].toLowerCase()); }
  else if ((m = CODING.exec(q))) { kind = 'coding'; S = /^(?:coding|programming|to code)$/i.test(m[1]) ? 'programming' : m[1]; }
  if (!S) S = 'your new skill';
  const N = c.n;
  const st = STAGES[kind](S);
  const H = c.unit === 'week' ? 'Week' : 'Day';
  const dose = c.unit === 'week' ? '30 to 45 minutes a day, five or six days a week' : 'about an hour each day';
  const out = [`Here is ${an(N)} ${plural(N, c.unit)} plan to learn ${kind === 'instrument' && S !== 'singing' ? 'the ' + S : S}, with ${dose}.`];
  for (let k = 1; k <= N; k++) {
    const si = stage(k, N, st.length);
    const repeat = k > 1 && stage(k - 1, N, st.length) === si;
    out.push(`${H} ${k}: ${S}${repeat ? ', consolidate and go further' : ''}`);
    for (const it of st[si]) out.push(`- ${cap(it)}`);
  }
  out.push(`\nTips: practise a little every day rather than a lot once a week, keep a short log of what you practised in ${S}, and repeat a ${c.unit} whenever it felt too fast.`);
  return out.join('\n');
}

// ---------- generic goal ----------

function extractGoal(q, span) {
  const s = stripCount(q, span);
  const m = /\b(?:plan|schedule|routine|program|programme|roadmap|challenge|guide)\s+(?:to|for|on|about)\s+(?:help me\s+)?(.+)$/i.exec(s)
    || /\b(?:to|for)\s+(.+)$/i.exec(s)
    || /^(?:.*?\b(?:a|an|my)\s+)?(.+?)\s+(?:plan|schedule|routine|program|programme|roadmap|challenge)\b/i.exec(s);
  if (!m) return '';
  let p = m[1].replace(/\s+(?:in|over|within|starting|from|by)\s*$/i, '');
  p = p.replace(/\s+(?:plan|schedule|routine)$/i, '');
  p = cleanPhrase(p);
  if (!p || BAD_SUBJECT.test(p) || /^(?:make|give|create|write|me)\b/i.test(p) || p.split(' ').length > 10) return '';
  return p;
}

const FOCUS = ['write tomorrow\'s first step tonight', 'do the task before checking your phone', 'pair the habit with something you already do daily', 'tell a friend what you did today', 'cut one distraction for the whole day', 'spend ten extra minutes on the hardest part', 'review your log and note one improvement', 'prepare everything you need the night before', 'take a short walk and reflect on what is working', 'celebrate a small win'];

function generic(q, c) {
  const g0 = extractGoal(q, c.span);
  const g = g0.replace(/\bmy\b/gi, 'your').replace(/\bme\b/gi, 'you').replace(/\bI\b/g, 'you').replace(/\bmyself\b/gi, 'yourself');
  const verb = !!g && /\b(?:plan|schedule|routine|program|programme|roadmap|challenge|guide)?\s*to\s+/i.test(stripCount(q, c.span)) && !/^(?:my|the|a|an)\b/i.test(g) && !/\bfor\s+/i.test(stripCount(q, c.span).split(/\bto\s+/i)[0] || '');
  const head = g ? cap(g) : 'Your goal';
  const G = g ? (verb ? `your goal to ${g}` : g) : 'your goal';
  const N = c.n;
  const H = c.unit === 'week' ? 'Week' : 'Day';
  const st = [
    [`Define what success looks like for ${G} in one sentence`, `list the steps and what you need`, `take the first small action today`],
    [`Set up a daily routine for ${G}: a fixed time and place`, `remove one obstacle that would stop you`, `track what you do in a simple log`],
    [`Build momentum on ${G}: do the main work for 30 to 60 minutes`, `ask someone for advice or accountability`, `note what is working`],
    [`Tackle the hardest part of ${G}`, `break it into smaller pieces if it stalls`, `reward yourself for finishing`],
    [`Increase the effort on ${G} a little`, `fix the weak spots your log shows`, `keep the routine even on busy days`],
    [`Review your progress on ${G} against the definition of success`, `finish the remaining tasks`, `plan how to keep it going after this plan ends`]
  ];
  const out = [`Here is ${an(N)} ${plural(N, c.unit)} plan ${g ? (verb ? 'to ' : 'for ') + g : 'for your goal'}, one heading per ${c.unit}, each with concrete actions.`];
  for (let k = 1; k <= N; k++) {
    out.push(`${H} ${k}: ${head}`);
    for (const it of st[stage(k, N, st.length)]) out.push(`- ${cap(it)}`);
    if (N > st.length) out.push(`- Focus for ${H} ${k}: ${pick(FOCUS, k - 1)}`);
  }
  out.push(`\nTips: keep each ${c.unit}'s task small enough to finish, write down what you did, and adjust the next ${c.unit} from what you learned.`);
  return out.join('\n');
}

// ---------- answer ----------

export function answer(q) {
  if (!can(q)) return null;
  const s = q.trim();
  const c = parseCount(s);
  if (!c) return null;
  let text;
  switch (category(s)) {
    case 'meal': text = meal(s, c); break;
    case 'travel': text = travel(s, c); break;
    case 'run': text = run(s, c); break;
    case 'workout': text = workout(s, c); break;
    case 'study': text = study(s, c); break;
    case 'learn': text = learn(s, c); break;
    default: text = generic(s, c);
  }
  return text || null;
}
