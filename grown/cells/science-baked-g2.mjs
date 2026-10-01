// science-baked-g2: why / how / what-causes questions about the everyday natural world.
// Lane baked: the organism's knowledge tier knew none of these topics, so every answer below is baked data.

export const meta = { id: 'science-baked-g2', class: 'science', generation: 2, lane: 'baked', grownFrom: ["why is the sky blue","how do vaccines work","what causes the tides","why do leaves change color in autumn","how do airplanes fly","what causes earthquakes","how does the heart pump blood"], version: 1 };

export const examples = [
  {"q":"why is the sky blue","expect":{"contains":["blue"],"containsAny":["scatter","scattering","rayleigh"],"minWords":40,"notRefusal":true}},
  {"q":"how do vaccines work","expect":{"contains":["immune"],"containsAny":["antibod","antigen","memory"],"minWords":40,"notRefusal":true}},
  {"q":"what causes the tides","expect":{"contains":["moon"],"containsAny":["gravity","gravitational","pull"],"minWords":40,"notRefusal":true}},
  {"q":"why do leaves change color in autumn","expect":{"contains":["chlorophyll"],"containsAny":["green","yellow","orange","red"],"minWords":40,"notRefusal":true}},
  {"q":"how do airplanes fly","expect":{"contains":["wing"],"containsAny":["lift","pressure"],"minWords":40,"notRefusal":true}},
  {"q":"what causes earthquakes","expect":{"contains":["plate"],"containsAny":["fault","crust","tectonic"],"minWords":40,"notRefusal":true}},
  {"q":"how does the heart pump blood","expect":{"contains":["blood"],"containsAny":["chamber","ventricle","atri","contract"],"minWords":40,"notRefusal":true}}
];

const TOPICS = [
  {
    id: 'twinkle',
    match: (s) => /\btwinkl|\bstars?\b.*\b(flicker|shimmer|sparkle|blink)/.test(s),
    text: 'Stars twinkle because of the atmosphere. Starlight reaches us as a thin beam from a single point, and on its way down it passes through layers of moving air at different temperatures and densities. Each layer bends (refracts) the light a little differently, and as the turbulent air shifts, the beam is bent this way and that many times a second. The star seems to flicker, jump and change brightness and colour. Planets look like tiny discs rather than points, so their light averages out and they twinkle much less; above the atmosphere, in space, stars do not twinkle at all.'
  },
  {
    id: 'rainbow',
    match: (s) => /\brainbows?\b/.test(s),
    text: 'A rainbow forms when sunlight shines into raindrops while the sun is behind you. As white light enters a drop it is refracted (bent), reflected off the back of the drop, and refracted again as it leaves. Each colour of light bends by a slightly different amount, a spreading called dispersion, so the white light is split into red, orange, yellow, green, blue, indigo and violet. Light exits the drops at about 42 degrees for red and 40 degrees for violet, so you see an arc of colours, with red on the outside.'
  },
  {
    id: 'thunder',
    match: (s) => /\bthunder/.test(s),
    text: 'Thunder is caused by lightning. A lightning bolt is a huge electrical discharge that heats the air along its path to around 30,000 degrees Celsius, hotter than the surface of the sun, in a fraction of a second. The heated air expands violently and explosively, creating a shock wave that turns into the sound wave we hear as thunder. Because light travels much faster than sound, you see the lightning flash first; nearby strikes sound like a sharp crack, while distant thunder rumbles as the sound echoes and arrives from different parts of the long bolt.'
  },
  {
    id: 'ice',
    match: (s) => /\b(ice|icebergs?|ice cubes?)\b/.test(s) && /\b(float|floats|floating|sink|sinks|dense|density|lighter|top)\b/.test(s),
    text: 'Ice floats because it is less dense than liquid water. When water freezes, its molecules lock into a hexagonal crystal lattice held together by hydrogen bonds, and that open structure holds the molecules farther apart than in the liquid. So the same mass of water takes up about nine percent more volume as ice, giving it a lower density (about 0.92 grams per cubic centimetre against 1.0 for water). Anything less dense than the liquid around it floats, which is why ice cubes bob in a drink and icebergs float with most of their bulk below the surface.'
  },
  {
    id: 'seasons',
    match: (s) => /\bseasons?\b|\bseasonal\b|\b(summer|winter)\b.*\b(summer|winter|hot|cold|warm|cool)/.test(s),
    text: 'We have seasons because the Earth\'s axis is tilted by about 23.5 degrees relative to its orbit around the sun. As the Earth orbits, the tilt stays pointed the same way in space, so for part of the year the northern hemisphere leans toward the sun and gets more direct sunlight and longer days: that is summer there. Six months later it leans away, the sunlight arrives at a low angle and spreads out, days are short, and it is winter. The distance to the sun changes very little and is not the cause; the tilt of the axis is.'
  },
  {
    id: 'sky',
    match: (s) => /\bsky\b|\bskies\b/.test(s),
    text: 'The sky is blue because of Rayleigh scattering. Sunlight looks white but contains all colours. When it enters the atmosphere it hits nitrogen and oxygen molecules that are much smaller than the wavelength of light, and these molecules scatter short wavelengths, blue and violet, far more strongly than long wavelengths like red. That scattered blue light comes at us from every direction across the sky. Our eyes are more sensitive to blue than violet, and some violet is absorbed high up, so the sky looks blue. At sunset light travels through more air, the blue is scattered away, and reds and oranges remain.'
  },
  {
    id: 'vaccine',
    match: (s) => /\bvaccin|\bimmuni[sz]|\binoculat|\b(flu|booster) shots?\b|\bjabs?\b/.test(s),
    text: 'Vaccines work by training the immune system to recognise a germ before you ever meet it. A vaccine contains a harmless piece or version of a virus or bacterium, such as a weakened or killed germ, a protein, or mRNA instructions to make one protein. These carry antigens, the markers the body recognises. Immune cells respond by making antibodies and activating T cells against those antigens, and they also create long-lived memory cells. Later, if the real germ infects you, the memory cells recognise it at once and the immune system attacks it quickly, so you are protected from serious illness.'
  },
  {
    id: 'tides',
    match: (s) => /\btides?\b|\btidal\b|\b(high|low) water\b/.test(s),
    text: 'Tides are caused mainly by the moon\'s gravity, with help from the sun. The moon\'s gravitational pull is slightly stronger on the side of the Earth facing it and weaker on the far side, and this difference stretches the oceans into two bulges of water, one toward the moon and one opposite it. As the Earth rotates through these bulges, most coasts get two high tides and two low tides about every 24 hours and 50 minutes. When the sun and moon line up, at new and full moon, their pull combines to make larger spring tides; at right angles they make smaller neap tides.'
  },
  {
    id: 'leaves',
    match: (s) => /\b(leaf|leaves|foliage)\b/.test(s) && /\b(colou?rs?|autumn|fall|red|yellow|orange|brown|turn|turns|turning|change|changes|changing)\b/.test(s),
    text: 'Leaves change colour in autumn because trees stop making chlorophyll. Chlorophyll is the green pigment that captures sunlight for photosynthesis, and all summer it is so abundant that it hides the other pigments. As days shorten and nights grow cold, deciduous trees prepare to drop their leaves and break the chlorophyll down. The green fades, revealing yellow and orange carotenoids that were there all along. Some trees, like maples, also make new red and purple pigments called anthocyanins from sugars trapped in the leaf, and finally the leaves turn brown and fall.'
  },
  {
    id: 'flight',
    match: (s) => /\b(air)?planes?\b|\baeroplanes?\b|\baircraft\b|\bjets?\b|\bairliners?\b|\bgliders?\b|\bwings?\b.*\blift\b|\blift\b.*\bwings?\b/.test(s) && !/\bplanet/.test(s),
    text: 'Airplanes fly because their wings make lift. A wing is shaped and tilted (its angle of attack) so that it turns the oncoming air downward as the plane moves forward. Air flowing over the curved top of the wing speeds up and its pressure drops, while air beneath the wing is slowed and pushed down, so pressure is higher below than above. That pressure difference, together with the downward push on the air, produces an upward force called lift. Engines provide thrust to keep air moving over the wings; when lift exceeds the plane\'s weight, it climbs, and drag resists the motion.'
  },
  {
    id: 'quake',
    match: (s) => /\bearthquakes?\b|\bquakes?\b|\bseismic\b|\btremors?\b|\bground\b.*\bshak/.test(s),
    text: 'Earthquakes are caused by the movement of tectonic plates. The Earth\'s crust is broken into huge plates that slowly drift on the hot mantle beneath them, a few centimetres a year. Where plates meet, along faults, their rough edges get stuck while the plates keep pushing, so stress and energy build up in the rock. When the stress becomes greater than the friction holding the fault, the rock suddenly slips and breaks, releasing that energy as seismic waves that travel through the ground and make it shake. Most earthquakes happen along plate boundaries such as the Pacific Ring of Fire.'
  },
  {
    id: 'heart',
    match: (s) => (/\bhearts?\b/.test(s) && /\b(pump|pumps|pumping|blood|beat|beats|beating|work|works|circulat\w*)\b/.test(s)) || /\bblood\b.*\b(circulat|pump|flow)/.test(s) || /\bcirculat\w*\b.*\bblood\b/.test(s),
    text: 'The heart pumps blood by rhythmic contraction of its four chambers. The two upper chambers, the atria, receive blood: the right atrium collects oxygen-poor blood from the body and the left atrium oxygen-rich blood from the lungs. They contract and push blood into the two lower chambers, the ventricles. The right ventricle then pumps blood to the lungs to pick up oxygen, and the stronger left ventricle pumps it out through the aorta to the whole body. Valves keep blood flowing one way, and an electrical signal from the sinoatrial node times each heartbeat.'
  }
];

const ASKS = /^(why|how|explain|describe|what (causes?|caused|makes?|made|produces?|creates?|happens|drives?|keeps?|lets?|allows?|gives?|is (the )?(reason|cause|science|mechanism)|are (the )?(reasons|causes))|what's (the )?(reason|cause|science)|whats (the )?(reason|cause)|can you explain|could you explain|please explain|tell me (why|how|what causes)|i wonder (why|how)|do you know (why|how|what causes)|is it true that)\b/;
const WHAT_IS = /^(what is|what's|whats|what are|define|definition of|meaning of|who|when|where)\b/;

function norm(q) {
  return String(q == null ? '' : q).toLowerCase().replace(/[‘’]/g, "'").replace(/[?!.,;:"]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function topic(q) {
  const s = norm(q);
  if (!s || s.length > 300) return null;
  if (!ASKS.test(s)) return null;
  if (WHAT_IS.test(s) && !/^(what is|what's|whats|what are) (the )?(reasons?|causes?|science|mechanism)\b/.test(s)) return null;
  for (const t of TOPICS) if (t.match(s)) return t;
  return null;
}

export function can(q) {
  return topic(q) !== null;
}

export function answer(q) {
  const t = topic(q);
  return t ? t.text : null;
}
