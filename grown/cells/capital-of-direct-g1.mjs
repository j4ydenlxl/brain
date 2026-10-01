// capital-of-direct-g1: a cell for the failure class "capital-of" (grow/CONTRACT.md), generation 1, lane direct.
// The site got "the capital of France" and refused: a bare capital lookup with no question word. This cell
// answers "the capital of X", "capital of X", "X capital", "X's capital", "capital city of X" and "the French
// capital" (a demonym before "capital"), any case, with or without a trailing question mark, from a table of
// every sovereign state (plus Kosovo, Taiwan, Palestine, the Vatican and the four UK nations). A text that
// opens with what, which, where or is is not this class (the knowledge tier answers those), and a name the
// table does not hold is not answered: can is false and answer is null, a miss and never a guess.
// Pure and synchronous: no imports, no sockets, no timers. Spelling is ASCII only.
// Author: board 38 arm direct:capital-of, 2026-09-30.

export const meta = { id: 'capital-of-direct-g1', class: 'capital-of', generation: 1, lane: 'direct', grownFrom: ['the capital of France'], version: 1 };

// One row a state: display | capital phrase | aliases (comma separated) | demonyms (comma separated).
// The sentence is "The capital of <display> is <capital phrase>."
const ROWS = [
  'Afghanistan|Kabul||afghan',
  'Albania|Tirana||albanian',
  'Algeria|Algiers||algerian',
  'Andorra|Andorra la Vella||andorran',
  'Angola|Luanda||angolan',
  "Antigua and Barbuda|Saint John's (St. John's)|antigua|antiguan",
  'Argentina|Buenos Aires||argentine,argentinian',
  'Armenia|Yerevan||armenian',
  'Australia|Canberra||australian',
  'Austria|Vienna||austrian',
  'Azerbaijan|Baku||azerbaijani,azeri',
  'the Bahamas|Nassau||bahamian',
  'Bahrain|Manama||bahraini',
  'Bangladesh|Dhaka||bangladeshi',
  'Barbados|Bridgetown||barbadian',
  'Belarus|Minsk|byelorussia,belorussia|belarusian',
  'Belgium|Brussels||belgian',
  'Belize|Belmopan||belizean',
  'Benin|Porto-Novo, and the seat of government is Cotonou|dahomey|beninese',
  'Bhutan|Thimphu||bhutanese',
  'Bolivia|Sucre (the constitutional capital), and the seat of government is La Paz||bolivian',
  'Bosnia and Herzegovina|Sarajevo|bosnia,bosnia herzegovina,bih|bosnian',
  'Botswana|Gaborone||',
  'Brazil|Brasilia|brasil|brazilian',
  'Brunei|Bandar Seri Begawan|brunei darussalam|bruneian',
  'Bulgaria|Sofia||bulgarian',
  'Burkina Faso|Ouagadougou|burkina,upper volta|burkinabe',
  'Burundi|Gitega (the political capital since 2019), and the economic capital is Bujumbura||burundian',
  'Cabo Verde|Praia|cape verde|cape verdean',
  'Cambodia|Phnom Penh|kampuchea|cambodian',
  'Cameroon|Yaounde||cameroonian',
  'Canada|Ottawa||canadian',
  'the Central African Republic|Bangui||',
  'Chad|N\'Djamena||chadian',
  'Chile|Santiago||chilean',
  'China|Beijing|prc,peoples republic of china,mainland china|chinese',
  'Colombia|Bogota||colombian',
  'the Comoros|Moroni||comorian',
  'the Democratic Republic of the Congo|Kinshasa|democratic republic of congo,dr congo,drc,congo kinshasa,zaire|',
  'the Republic of the Congo|Brazzaville|republic of congo,congo brazzaville,congo republic|',
  'Costa Rica|San Jose||costa rican',
  "Cote d'Ivoire (Ivory Coast)|Yamoussoukro, and the economic capital is Abidjan|cote divoire,cote d ivoire,ivory coast|ivorian",
  'Croatia|Zagreb|hrvatska|croatian',
  'Cuba|Havana||cuban',
  'Cyprus|Nicosia||cypriot',
  'the Czech Republic|Prague|czechia|czech',
  'Denmark|Copenhagen||danish',
  'Djibouti|Djibouti (Djibouti City)||djiboutian',
  'Dominica|Roseau||',
  'the Dominican Republic|Santo Domingo||',
  'Ecuador|Quito||ecuadorian',
  'Egypt|Cairo||egyptian',
  'El Salvador|San Salvador||salvadoran',
  'Equatorial Guinea|Malabo||equatoguinean',
  'Eritrea|Asmara||eritrean',
  'Estonia|Tallinn||estonian',
  'Eswatini|Mbabane (the administrative capital), and the legislative capital is Lobamba|swaziland|swazi',
  'Ethiopia|Addis Ababa|abyssinia|ethiopian',
  'Fiji|Suva||fijian',
  'Finland|Helsinki|suomi|finnish',
  'France|Paris||french',
  'Gabon|Libreville||gabonese',
  'the Gambia|Banjul||gambian',
  'Germany|Berlin|deutschland|german',
  'Ghana|Accra||ghanaian',
  'Greece|Athens|hellas|greek',
  "Grenada|Saint George's (St. George's)||grenadian",
  'Guatemala|Guatemala City||guatemalan',
  'Guinea|Conakry|guinea conakry|',
  'Guinea-Bissau|Bissau||',
  'Guyana|Georgetown||guyanese',
  'Haiti|Port-au-Prince||haitian',
  'Honduras|Tegucigalpa||honduran',
  'Hungary|Budapest||hungarian',
  'Iceland|Reykjavik||icelandic',
  'India|New Delhi|bharat|indian',
  'Indonesia|Jakarta||indonesian',
  'Iran|Tehran|persia|iranian,persian',
  'Iraq|Baghdad||iraqi',
  'Ireland|Dublin|republic of ireland,eire|irish',
  'Israel|Jerusalem (its status is disputed internationally, and many embassies are in Tel Aviv)||israeli',
  'Italy|Rome|italia|italian',
  'Jamaica|Kingston||jamaican',
  'Japan|Tokyo|nippon|japanese',
  'Jordan|Amman||jordanian',
  'Kazakhstan|Astana||kazakh',
  'Kenya|Nairobi||kenyan',
  'Kiribati|South Tarawa (Tarawa)||',
  'Kosovo|Pristina||kosovar',
  'Kuwait|Kuwait City||kuwaiti',
  'Kyrgyzstan|Bishkek|kyrgyzia,kirghizia|kyrgyz',
  'Laos|Vientiane|lao pdr|lao,laotian',
  'Latvia|Riga||latvian',
  'Lebanon|Beirut||lebanese',
  'Lesotho|Maseru||',
  'Liberia|Monrovia||liberian',
  'Libya|Tripoli||libyan',
  'Liechtenstein|Vaduz||',
  'Lithuania|Vilnius||lithuanian',
  'Luxembourg|Luxembourg (Luxembourg City)||luxembourgish',
  'Madagascar|Antananarivo||malagasy',
  'Malawi|Lilongwe||malawian',
  'Malaysia|Kuala Lumpur, and the administrative capital is Putrajaya||malaysian',
  'the Maldives|Male||maldivian',
  'Mali|Bamako||malian',
  'Malta|Valletta||maltese',
  'the Marshall Islands|Majuro||marshallese',
  'Mauritania|Nouakchott||mauritanian',
  'Mauritius|Port Louis||mauritian',
  'Mexico|Mexico City||mexican',
  'Micronesia|Palikir|federated states of micronesia|micronesian',
  'Moldova|Chisinau||moldovan',
  'Monaco|Monaco||monegasque',
  'Mongolia|Ulaanbaatar (Ulan Bator)||mongolian',
  'Montenegro|Podgorica||montenegrin',
  'Morocco|Rabat||moroccan',
  'Mozambique|Maputo||mozambican',
  'Myanmar|Naypyidaw (Nay Pyi Taw)|burma|burmese',
  'Namibia|Windhoek||namibian',
  'Nauru|Yaren (Nauru has no official capital, and Yaren District is the seat of government)||nauruan',
  'Nepal|Kathmandu||nepalese,nepali',
  'the Netherlands|Amsterdam, and the seat of government is The Hague|holland|dutch',
  'New Zealand|Wellington|aotearoa|',
  'Nicaragua|Managua||nicaraguan',
  'Niger|Niamey||',
  'Nigeria|Abuja||nigerian',
  'North Korea|Pyongyang|dprk,democratic peoples republic of korea|north korean',
  'North Macedonia|Skopje|macedonia|macedonian',
  'Norway|Oslo||norwegian',
  'Oman|Muscat||omani',
  'Pakistan|Islamabad||pakistani',
  'Palau|Ngerulmud||palauan',
  'Palestine|Ramallah (the administrative seat), and East Jerusalem is the proclaimed capital|state of palestine,palestinian territories|palestinian',
  'Panama|Panama City||panamanian',
  'Papua New Guinea|Port Moresby|png|',
  'Paraguay|Asuncion||paraguayan',
  'Peru|Lima||peruvian',
  'the Philippines|Manila||filipino,philippine',
  'Poland|Warsaw||polish',
  'Portugal|Lisbon||portuguese',
  'Qatar|Doha||qatari',
  'Romania|Bucharest||romanian',
  'Russia|Moscow|russian federation|russian',
  'Rwanda|Kigali||rwandan',
  'Saint Kitts and Nevis|Basseterre|saint kitts,saint christopher and nevis|',
  'Saint Lucia|Castries||',
  'Saint Vincent and the Grenadines|Kingstown|saint vincent|',
  'Samoa|Apia|western samoa|samoan',
  'San Marino|San Marino (the City of San Marino)||sammarinese',
  'Sao Tome and Principe|Sao Tome||',
  'Saudi Arabia|Riyadh||saudi',
  'Senegal|Dakar||senegalese',
  'Serbia|Belgrade||serbian',
  'Seychelles|Victoria||seychellois',
  'Sierra Leone|Freetown||',
  'Singapore|Singapore||singaporean',
  'Slovakia|Bratislava|slovak republic|slovak',
  'Slovenia|Ljubljana||slovenian',
  'the Solomon Islands|Honiara||',
  'Somalia|Mogadishu||somali',
  'South Africa|Pretoria (the executive capital), with Cape Town the legislative capital and Bloemfontein the judicial capital|rsa|south african',
  'South Korea|Seoul|republic of korea|south korean',
  'South Sudan|Juba||south sudanese',
  'Spain|Madrid|espana|spanish',
  'Sri Lanka|Sri Jayawardenepura Kotte (the legislative capital), and Colombo is the executive and commercial capital|ceylon|sri lankan',
  'Sudan|Khartoum||sudanese',
  'Suriname|Paramaribo|surinam|surinamese',
  'Sweden|Stockholm|sverige|swedish',
  'Switzerland|Bern (Berne)||swiss',
  'Syria|Damascus||syrian',
  'Taiwan|Taipei|republic of china|taiwanese',
  'Tajikistan|Dushanbe||tajik',
  'Tanzania|Dodoma, and the largest city is Dar es Salaam||tanzanian',
  'Thailand|Bangkok|siam|thai',
  'Timor-Leste|Dili|east timor|timorese',
  'Togo|Lome||togolese',
  "Tonga|Nuku'alofa||tongan",
  'Trinidad and Tobago|Port of Spain|trinidad|trinidadian',
  'Tunisia|Tunis||tunisian',
  'Turkey|Ankara|turkiye|turkish',
  'Turkmenistan|Ashgabat||turkmen',
  'Tuvalu|Funafuti||tuvaluan',
  'Uganda|Kampala||ugandan',
  'Ukraine|Kyiv (also spelled Kiev)||ukrainian',
  'the United Arab Emirates|Abu Dhabi|uae,emirates|emirati',
  'the United Kingdom|London|uk,britain,great britain,gb|british',
  'England|London||english',
  'Scotland|Edinburgh||scottish',
  'Wales|Cardiff||welsh',
  'Northern Ireland|Belfast||',
  'the United States|Washington, D.C.|united states of america,usa,us,america|american',
  'Uruguay|Montevideo||uruguayan',
  'Uzbekistan|Tashkent||uzbek',
  'Vanuatu|Port Vila||',
  'Vatican City|Vatican City|vatican,holy see|',
  'Venezuela|Caracas||venezuelan',
  'Vietnam|Hanoi|viet nam|vietnamese',
  "Yemen|Sanaa (Sana'a)||yemeni",
  'Zambia|Lusaka||zambian',
  'Zimbabwe|Harare||zimbabwean',
];

// Names that point at two states: the answer names both, which is the truth, never a pick.
const BOTH = [
  ['congo,the congo', 'congolese', 'The capital of the Democratic Republic of the Congo is Kinshasa, and the capital of the Republic of the Congo is Brazzaville.'],
  ['korea', 'korean', 'The capital of South Korea is Seoul, and the capital of North Korea is Pyongyang.'],
  ['georgia', 'georgian', 'The capital of Georgia (the country) is Tbilisi, and the capital of the US state of Georgia is Atlanta.'],
];

/** The lookup key of a place name: lower case, no leading "the", no dots or apostrophes, "st" read as "saint". */
function keyOf(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[.']/g, '')
    .replace(/[-,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^the /, '')
    .replace(/\bst\b/g, 'saint');
}

function sentence(display, capital) {
  const s = 'The capital of ' + display + ' is ' + capital;
  return s.endsWith('.') ? s : s + '.';
}

const NAMES = new Map();
const DEMONYMS = new Map();
export const CAPITALS = Object.freeze(ROWS.map((row) => {
  const [display, capital, aliases, demonyms] = row.split('|');
  const reply = sentence(display, capital);
  const entry = Object.freeze({ display, capital, reply });
  for (const a of [display.replace(/ \(.*\)$/, ''), ...aliases.split(',')]) if (a.trim()) NAMES.set(keyOf(a), entry);
  for (const d of demonyms.split(',')) if (d.trim()) DEMONYMS.set(keyOf(d), entry);
  return entry;
}));
for (const [names, demonyms, reply] of BOTH) {
  const entry = Object.freeze({ display: names.split(',')[0], capital: null, reply });
  for (const n of names.split(',')) NAMES.set(keyOf(n), entry);
  for (const d of demonyms.split(',')) DEMONYMS.set(keyOf(d), entry);
}

// A text that opens with a question word belongs to the knowledge tier, not to this cell.
const QUESTION = new Set(['what', 'whats', 'which', 'where', 'wheres', 'is', 'isnt', 'who', 'whos', 'how', 'why', 'when']);
const OF_RE = /^(?:the\s+)?capital(?:\s+city)?\s+of\s+(.+)$/;
const TAIL_RE = /^(?:the\s+)?(.+?)(?:'s|')?\s+capital(?:\s+city)?$/;

/** The table entry a text asks for, or null when the text is not a bare capital lookup of a known state. */
function lookup(q) {
  if (typeof q !== 'string' || q.length > 160) return null;
  const t = q
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u00b4`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[\s?.!]+$/, '');
  if (!t) return null;
  const first = t.split(' ')[0].replace(/'/g, '');
  if (QUESTION.has(first)) return null;
  let m = OF_RE.exec(t);
  if (m) return NAMES.get(keyOf(m[1])) || null;
  m = TAIL_RE.exec(t);
  if (m) {
    const k = keyOf(m[1]);
    return NAMES.get(k) || DEMONYMS.get(k) || null;
  }
  return null;
}

export function can(q) {
  return lookup(q) !== null;
}

export function answer(q) {
  const e = lookup(q);
  return e ? e.reply : null;
}

export const examples = [
  { q: 'the capital of France', expect: { contains: ['Paris'], notRefusal: true } },
  { q: 'capital of Japan', expect: { contains: ['Tokyo'], notRefusal: true } },
  { q: 'Brazil capital', expect: { contains: ['Brasilia'], notRefusal: true } },
  { q: 'the capital of Egypt', expect: { contains: ['Cairo'], notRefusal: true } },
  { q: 'capital of Italy', expect: { contains: ['Rome'], notRefusal: true } },
  { q: 'Finland capital', expect: { contains: ['Helsinki'], notRefusal: true } },
  { q: 'the capital of Turkey', expect: { contains: ['Ankara'], notRefusal: true } },
  { q: 'capital of Austria', expect: { contains: ['Vienna'], notRefusal: true } },
];
