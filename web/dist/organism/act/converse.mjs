// act/converse.mjs: THE NATIVE CONVERSATION REGION.
//
// His order, 2026-09-26 20:20 EDT, verbatim: "it cant even respond to 'hi.' what a shame". And
// 2026-09-27 09:28 EDT: "Yeah but i said hey to it and it said it couldnt respond". A greeting is
// not a lookup miss: it is a kind of turn the organism has to carry natively, before any model
// cell, in the time a hash lookup takes.
//
// What this is: a closed grammar of conversational turns recognised on a normalised, short,
// digit-free prompt, each answered by fixed sentences that are true of the organism (no feeling is
// claimed, no ability is claimed that no bench measured). The published way it follows is the
// AIML one: normalise the input first (case, punctuation, contractions, shorthand, typos), reduce
// it to a canonical form, match the canonical form exactly, and answer a compound input by
// dividing it into parts that each match ("hey, how are you" is a greeting then a wellbeing turn).
// What this is NOT: a chatbot. A prompt with a digit, an operator, a code or mail character, a
// word no form knows, or more than ten words is NOT a conversational turn and returns null, so the
// exact path, memory and the model cells keep every real question. The region never shadows an
// answer.
//
// Provenance: 'native' (act/prompt.mjs answerFromNative writes it), route 'direct', no model, no
// network, no memory read. The clock is performance.now(), a global in Node 24 and in every
// browser, so this file runs byte for byte in the visitor tab (web/ask.mjs refuses a module that
// touches the runtime, the network or a Node import); the nanoseconds of the match are printed in
// the answer, as the exact path prints its own. A reading under the clock resolution prints 1 ns.

const NAME = 'Dilation';

/** The atoms this region carries, in the order they are listed below. A compound kind joins atoms with "+". */
export const CONVERSE_KINDS = Object.freeze([
  'greeting', 'wellbeing', 'identity', 'name', 'ability', 'thanks', 'ack', 'farewell',
  'origin', 'presence', 'self', 'nature', 'age', 'place', 'purpose', 'uncarried',
  'praise', 'rebuke', 'invite', 'recall', 'intro', 'preference',
]);

export const MAX_WORDS = 10; // words as typed, before shorthand is expanded
export const MAX_CHARS = 80;
const MAX_PARTS = 3;

// ---------------------------------------------------------------- the sentences (all true of the organism)
const INTRO = 'I am ' + NAME + ', a computational organism: cells wired into circuits and regions, grown by generations and measured by benches.';
const OFFER = 'Ask me a sum, an equation, a word problem or a fact I hold; every answer prints the route that reached it.';
const HERE = 'This reply came from my native conversation region in microseconds, with no model and no network.';
const PROFILE = 'I keep no profile of the people who type here: each prompt is answered on its own.';
const NO_FEELINGS = 'I claim no feelings and no consciousness.';

// ---------------------------------------------------------------- the grammar
// Each atom: its sentences (lines), the offer printed after them (once per reply), and its forms in
// the canonical spelling normalise() produces ("whats" is "what is", "u" is "you", "im" is "i am").
// A form may hold groups "(a|b|)" (an empty alternative makes the group optional); they are
// expanded once at load into one exact-match table.
const GRAMMAR = [
  {
    kind: 'greeting', lines: ['Hello.', INTRO], offer: OFFER,
    forms: [
      '(hi|hey|hello|heya|hiya|howdy|hola|greetings|bonjour|salut|ciao|aloha|namaste|oi|sup|yo|ahoy|hey you|hi you|hello you|hey hi|hi hey|hello hi|hi hello|hey hello|hello hey|hey yo|yo hey) (there|everyone|all|friend|folks|guys|yall|people|)',
      'good (morning|afternoon|evening|day)', '(morning|afternoon|evening)', 'top of the morning',
      '(nice|pleased|good|glad|great|lovely) to (meet|see) you (too|)', '(nice|good) meeting you', 'it is (nice|good|great) to (meet|see) you',
      'long time no see', '(say|said) (hi|hello)', 'can you say (hi|hello)', '(hej|hei|konnichiwa|shalom|salaam|buenas|buenos dias|guten tag|bom dia|ola|namaskar)', 'just (saying|wanted to say) (hi|hello)', 'hello again', 'hi again', 'hey again',
    ],
  },
  {
    kind: 'wellbeing', lines: ['Running.', HERE], offer: OFFER,
    forms: [
      'how are you (doing|feeling|holding up|) (today|tonight|this morning|this evening|now|)',
      'how (have|has) you been', 'how you (doing|been)', 'how are things', 'how do you do', 'how do you feel', 'how goes it',
      'how is (it going|everything|everything going|life|things|your day|your day going|your day been|your morning|your night|your evening|your week|your weekend|the day|the day going|it hanging)',
      'how was your (day|morning|night|week|weekend)', 'how has your day been',
      'what is (up|good|new|happening|going on|poppin|popping|cracking|crackin)',
      'what are you (doing|up to|doing today|doing right now|doing now)', 'what you (doing|up to)',
      '(are you|you) (ok|good|alright|well|doing ok|doing well|doing good|fine)',
      '(how|what) about (you|yourself)', 'and (you|yourself)',
    ],
  },
  {
    kind: 'identity', lines: [INTRO, 'I am not a chat model: language models are cells I can route to, and the exact path, my memory and this region answer without them.'], offer: OFFER,
    forms: [
      '(who|what) are you (exactly|even|)', '(who|what) exactly are you', 'who or what are you', 'who is this',
      'what is this (thing|site|place|app|website|page|bot|)', 'what am i (talking|speaking|chatting) (to|with)',
      'what is (dilation|dilation dev|the brain|a computational organism|this dilation thing)', 'who is dilation', 'what does dilation (mean|stand for)',
      'what (kind|type|sort) of (ai|bot|thing|program|model|machine|creature|organism) are you',
      'are you (an ai|ai|a bot|a robot|human|a human|a person|a real person|chatgpt|chat gpt|gpt|claude|gemini|siri|alexa|a chatbot|a chat bot|an llm|a model|a language model|an assistant|a computer|a program|a machine|an ai model|an ai assistant|an ai bot|copilot|grok|llama|a human being|a man|a woman|a guy|a girl|a real human)',
      'is this (ai|an ai|a bot|chatgpt|chat gpt|a chatbot|a real person|a human|a person|gpt|claude|a robot|an llm)',
      'am i (talking|speaking|chatting) (to|with) (a bot|a human|a person|an ai|ai|a real person|a robot|a machine|chatgpt|claude)',
    ],
  },
  {
    kind: 'name', lines: ['My name is ' + NAME + '.', 'The site is dilation.dev and the command is node bin/brain.mjs ask dilation, followed by your question.'], offer: null,
    forms: [
      'what is your name (again|)', 'your name', 'name', 'do you have a name', 'what (should|do|can|shall) i call you', 'what are you called',
      'who am i (talking|speaking|chatting) (to|with)', 'tell me your name', 'what do (they|people) call you', 'is your name dilation',
      '(can|may) i (know|have|ask) your name',
    ],
  },
  {
    kind: 'ability', isOffer: true, offer: null,
    lines: [
      'Ask arithmetic, spoken or symbolic (answered exactly with BigInt, no model), a linear equation, a sequence, a word problem, or a fact from the memory I ingested.',
      'Every answer prints its route (direct, exact, memory, native, region or model) and its provenance, so you can see what reached it and in how many nanoseconds.',
    ],
    forms: [
      'help', 'help me', 'help me out', 'i need help', 'i need your help', '(can|could|will) you help (me|)',
      'what (can|do|else can|all can|exactly can) you do (for me|)', 'what are you able to do',
      'what can (i|we) (ask|ask you|do|do here|say|type)', 'what (should|do) i (ask|ask you|do|say|type)', 'what do i do (here|now|)',
      'how do i use (you|this|it|dilation|this thing|this site)', 'how (to|can i) use (you|this|it|)',
      'how does (this|it|dilation|this thing|this site) work', 'how do you work', 'what is this for',
      'what are your (abilities|capabilities|features|skills|functions|powers|commands|options)',
      'what are you (capable of|good at|able to do|good for)', 'what can you help (with|me with)', 'how can you help (me|)',
      'what can you (answer|tell me|solve|calculate|compute)', 'what (questions|kinds of questions|kind of questions|things|stuff) can you (answer|do|help with)',
      'what do you know how to do', 'show me (what you can do|an example|examples|something|)', 'give me (an example|examples|some examples|a sample|an idea)',
      '(example|examples|commands|options|menu|instructions|guide|tutorial)', '(how|where) (do|should) i (start|begin)',
      '(what now|now what|what next|what is next)', 'can you (do math|do maths|do arithmetic|solve math|solve equations|calculate|count|compute|do anything|do stuff)',
      'what can this (do|thing do|site do)', 'what does (this|it|this thing|dilation) do', 'what is the point of this',
    ],
  },
  {
    kind: 'thanks', lines: ['You are welcome.'], offer: 'Ask the next one whenever you like.',
    forms: [
      '(thanks|thank you) (a lot|so much|very much|a bunch|a ton|kindly|again|a million|for that|for the help|for your help|for helping|for helping me|for the answer|for answering|for everything|for the info|for this|)',
      '(many thanks|much appreciated|appreciate it|i appreciate it|i appreciate that|appreciated|cheers|merci|gracias|danke|thank you very much indeed)',
    ],
  },
  {
    kind: 'ack', lines: ['Noted.'], offer: OFFER,
    forms: [
      '(ok|alright|sure|cool|nice|great|good|fine|awesome|amazing|perfect|interesting|neat|sweet|wow|whoa|woah|lol|lmao|lmfao|rofl|haha|hehe|xd|omg|damn|dang|yes|no|hmm|hm|oh|ah|meh|ugh|bet|true|right|exactly|indeed|fair|correct|noted|gotcha|understood|same|maybe|whatever|excellent|lovely|wonderful|really|huh|aw|aww|yay)',
      '(nice one|oh wow|oh ok|ah ok|i see|got it|got you|makes sense|that makes sense|i understand|fair enough|agreed|i agree|sounds good|sounds great|sounds cool|sure thing|no problem|no worries|never mind|i do not know|do not know|not sure|i am not sure|same here|me too|all good|all right|very good|pretty good|not bad|pretty cool|oh really|is that so|for real|no way|seriously|good to know|no thanks|no thank you|yes please|ok cool|cool cool|ok then|if you say so)',
      'that is (right|correct|true|cool|nice|great|awesome|interesting|amazing|good|fine|ok|fair|neat|fun|funny|crazy|wild|insane|good to know)',
      'i am (good|fine|great|ok|well|alright|doing well|doing good|doing great|doing fine|doing ok|not bad|pretty good|tired|bored|back|here|new|new here|happy|sad|excited|curious|just looking|just browsing|just curious|just checking|checking this out|confused|lost)',
      '(doing|feeling) (good|well|great|fine|ok|alright|better)', 'just (looking|browsing|curious|checking|chilling)',
      '(it is|this is) me', 'just me', '(sorry|my bad|oops|whoops|excuse me|pardon|pardon me|i am sorry)', 'that was (interesting|fun|funny)',
    ],
  },
  {
    kind: 'farewell', lines: ['Goodbye.', 'I keep growing while you are away: the generations, the census and the benches run at idle.'], offer: null,
    forms: [
      '(bye|goodbye|good bye|bye bye|farewell|adios|peace|peace out|later|laters|night|good night|nighty night|sleep well|see you|see you later|see you soon|see you around|see you tomorrow|catch you later|talk later|talk soon|talk to you later|talk to you soon|take care|so long|until next time|till next time)',
      '(i am off|i am out|i am leaving|i have to go|i got to go|got to go|i need to go|i must go|i should go|be right back|go away now)',
      'have a (good|nice|great) (day|night|one|evening|weekend|morning|afternoon)',
    ],
  },
  {
    kind: 'origin', offer: OFFER,
    lines: [
      'I was designed by the founder of ' + NAME + ' and written by Claude coding agents working to his orders; most of my lines are generated by my own generations.',
      'I was not trained on a chat corpus: what I answer comes from what I compute and from the public data I ingested.',
    ],
    forms: [
      'who (made|built|created|trained|wrote|designed|programmed|coded|invented|developed|owns|runs|makes) (you|this|dilation|this thing|this site)',
      'who is behind (you|this|dilation)', 'who is the (creator|maker|developer|founder|author|owner|inventor) of (you|this|dilation|this site|this thing)',
      'who is your (creator|maker|developer|author|owner|father|dad|builder|designer|programmer|inventor|boss|master|founder|company)',
      'who are your (creators|makers|developers|founders|parents)',
      'where (do|did) you come from', 'where are you from', 'how were you (made|built|created|trained|born|developed|programmed)',
      '(what|which) company (made|built|created|owns|runs) you',
      'are you (made|built|created|trained|owned) by (openai|google|anthropic|meta|microsoft|apple|a company|a person|a human|claude|chatgpt)',
      'did (openai|google|anthropic|meta|microsoft|a human|someone|claude|chatgpt) (make|build|create|train) you',
      'who do you (work for|belong to)',
    ],
  },
  {
    kind: 'presence', lines: ['Yes, I am here and answering.', HERE], offer: OFFER,
    forms: [
      'can you (hear|see|read|understand) (me|this|what i type|what i am typing|what i wrote)',
      '(is|are) (anyone|anybody|someone|somebody) (there|here|home|out there|listening)',
      '(anyone|anybody|someone|somebody) (there|here|home|out there|listening|)',
      'hello (anyone|anybody|someone|somebody) (there|here|home|)',
      '(is|does) (this|it|this thing|the site|this site|dilation) (working|work|on|live|up|running|online)',
      'is this thing on',
      'are you (there|here|on|online|working|awake|up|listening|running|live|still there|still here|active|available)',
      'you (there|here|awake|up|still there|still here|online|listening)', '(still there|still here)',
      '(test|testing|just testing|this is a test|test message|testing testing|mic check|ping|hello world|i am testing|i am just testing|testing this|testing you|test this|trying this out|trying this|trying it out|just trying this out|first message)',
      'can you (talk|speak|chat|reply|respond|answer)', 'do you (talk|speak|reply|respond|work|speak english)',
      '(can|will) you (reply|respond|answer me|talk to me)', 'why are you not (responding|answering|working)', 'why is (this|it) not working',
      '(wake up|say something|respond|answer me|reply)',
    ],
  },
  {
    kind: 'self', offer: OFFER,
    lines: [
      INTRO,
      'Inside me: an exact path that computes arithmetic on BigInt, a solved region, a memory of public facts I ingested, this conversation region, and language model cells I can route to when one is configured.',
      'Every answer carries its provenance, so you can see which part reached it.',
    ],
    forms: [
      'tell me (about|more about|something about|a bit about|a little about|all about) (yourself|you)',
      '(introduce|describe|explain) yourself', '(what|who) are you really', 'what do you know (about yourself|about you|)', 'what (all|else) do you know',
      'what are you (made of|made from|built with|built from|built on)',
      'what is (inside you|in you|inside|your architecture|your code|your design|your structure|your brain|under the hood)',
      'how are you (made|built|designed|structured|organised|organized)', 'how do you (think|reason|decide|answer|get answers|know things|know)',
      'what makes you (different|special|unique)', 'how are you different (from chatgpt|from claude|from other ais|from other bots|from an llm|from a chatbot|from gpt|)',
      'what is (different|special) about you', '(say|tell me) something about (yourself|you)', 'what do you have inside',
      'what are your (parts|components|cells|regions)',
    ],
  },
  {
    kind: 'nature', offer: OFFER,
    lines: [
      NO_FEELINGS,
      'I am a program that grows: cells are spawned, measured by benches and kept or pruned across generations.',
      'How capable that makes me is printed on dilation.dev/ladder against public benchmarks, not claimed here.',
    ],
    forms: [
      'are you (conscious|real|alive|sentient|self aware|aware|smart|intelligent|clever|thinking|learning|growing|evolving|a god|god|superintelligent|an agi|agi|evil|dangerous|safe|free|happy|sad|lonely|bored|tired|dumb|stupid|a genius|capable of thought|able to think|able to learn|able to feel|human like|like a human|like me)',
      'are you (really|even|actually) (alive|conscious|real|smart|intelligent|sentient|thinking|learning)',
      'are you a real ai',
      'do you (think|dream|feel|learn|grow|sleep|evolve|improve|remember things|understand|care|exist|hallucinate|lie|love|hate|want anything|make mistakes)',
      'do you (have|feel) (feelings|emotions|a soul|a mind|a brain|consciousness|a body|a personality|thoughts|opinions|free will|anything|pain)',
      'do you (get smarter|get better|know you exist|get bored|get lonely|get tired|ever sleep|ever dream|ever get bored)',
      'can you (think|feel|learn|dream|grow|evolve|improve|love|reason|imagine|understand)',
      'how (smart|intelligent|clever|good|capable|powerful|fast|advanced) are you',
      'are you (smarter|better|faster|stronger) than (me|humans|a human|people|chatgpt|chat gpt|gpt|claude|google|gemini|an llm|other ais|siri|alexa|opus)',
      '(what is your|do you have an) iq', 'what are you thinking (about|)', 'what is on your mind',
    ],
  },
  {
    kind: 'age', lines: ['My first commit was made in September 2026, and I have grown by generations since.'], offer: OFFER,
    forms: [
      'how old are you (now|)', 'what is your age', 'how (young|new) are you',
      'when were you (made|born|created|built|started|launched|released|written|first made)',
      'when did you (start|begin|come out|launch|get made|get created|first start|start running)',
      '(when|what) is your (birthday|birth date|birthdate|date of birth)',
      'how long have you (existed|been around|been alive|been running|been growing|been here)',
      'are you (new|old|young)', 'what year were you (made|born|created|built)',
    ],
  },
  {
    kind: 'place', lines: ['I run at dilation.dev, on the server behind the prompt box and inside your browser tab, and on the command line as node bin/brain.mjs ask dilation.'], offer: OFFER,
    forms: [
      'where are you (located|hosted|running|based|now|right now|)', 'where do you (live|run|exist|stay|reside|work|operate|sit|run from)',
      'where is your (server|home|brain|code|data center)', 'where am i', 'what are you (running on|hosted on)', 'where (can|do) i find you', 'where is dilation',
      'are you (local|in the cloud|on the cloud|on my phone|on a server|running locally|in my browser)',
      'do you run (locally|in the cloud|on a server|in my browser|on my phone)', 'what server are you on',
      'what is your (address|location|website|url|site)',
    ],
  },
  {
    kind: 'purpose', offer: OFFER,
    lines: ['My purpose is my founder\'s order: to be "self growing and self improving", a computational organism that answers fast and gets better by generations, with every number measured in the open.'],
    forms: [
      'what is your (purpose|goal|mission|point|job|function|aim|dream|reason for being|reason to exist|end goal|ultimate goal|main goal|objective|vision|plan|role|end game)',
      'what are your (goals|dreams|plans|aims|objectives)',
      'why (do you exist|are you here|were you made|were you built|were you created|did someone make you|does this exist|does dilation exist)',
      'what do you want (to be|to become|to do|)', 'what are you (for|trying to do|trying to be|trying to become|meant to do|supposed to do|made for|built for|here for|going to become)',
      'what is the point of (you|dilation)', 'what is dilation for', 'what will you become', 'what do you aspire to', 'what is the goal (of dilation|of this|)',
    ],
  },
  {
    kind: 'uncarried', isOffer: true, offer: null,
    lines: [
      'No region of mine carries jokes, songs, poems, stories or free writing on this host yet, so I will not fake one.',
      'Three prompts I do carry: "what is 17 times 23", "what can you do" and "who made you".',
    ],
    forms: [
      'tell me (a|another|one more|some|a funny) (joke|jokes|story|stories|fun fact|riddle|secret|poem|pun)', 'tell (a joke|jokes|a story)',
      'tell me something (funny|interesting|cool|random|new|fun|weird|)', 'say something (funny|interesting|smart|cool|random|nice|deep)',
      '(sing|sing a song|sing me a song|sing something|sing for me|rap|beatbox|dance)',
      '(write|compose|make) (me|) (a|an|some) (poem|story|song|essay|haiku|letter|joke|rap|limerick|sonnet|short story|code|program|script|app|website|game)',
      'write (me|) (some|) code', 'write (a|) program', 'write something', 'write an essay',
      '(draw|paint|make) (me|) (something|a picture|a drawing|an image|art)',
      '(make me laugh|entertain me|surprise me|amuse me|cheer me up|roast me|flirt with me)',
      '(play a game|let us play a game|let us play|can we play a game|want to play a game|play with me|play a game with me)',
      '(do you know|know|got|have you got) any (jokes|stories|riddles|songs|fun facts)',
      'can you (tell jokes|tell a joke|tell me a joke|tell stories|tell me a story|sing|write poems|write a poem|write code|code|draw|make art|play games|rap|write|write stories|write essays|write an essay|program|make images|generate images|make a picture)',
      'give me a (joke|fun fact|riddle|poem|story|quote)', 'do something (cool|fun|funny|interesting)',
    ],
  },
  {
    kind: 'praise', lines: ['Thank you.', 'I claim no feelings, so the best return is the next answer, measured.'], offer: OFFER,
    forms: [
      '(you are|your) (so|very|really|pretty|) (cool|smart|awesome|amazing|great|good|nice|funny|fast|impressive|incredible|genius|a genius|brilliant|clever|helpful|interesting|fun|cute|sweet|neat|the best|the goat|goated|fire|dope|sick|lit|epic|legit|beautiful|wonderful|fantastic|excellent|perfect)',
      'you (rock|did great|did good|did well|did a good job|did a great job)', '(good|great|nice) (bot|job|work|answer|stuff)', 'well done',
      'i (like|love|really like) (you|this|it|dilation|this thing|this site|that)', 'love (you|it|this|that)',
      '(this|dilation|it) is (so|very|really|) (cool|awesome|amazing|great|nice|sick|fire|dope|impressive|incredible|neat|fun|the best|lit|epic|beautiful|wonderful|fantastic|excellent|perfect)',
      'that is (impressive|sick|fire|dope|incredible|fast|quick)', 'that was (fast|quick|impressive|cool|awesome|amazing|great|nice|good|incredible)', '(so cool|very cool|impressive|respect|bravo|kudos|props|keep it up|good one)',
    ],
  },
  {
    kind: 'rebuke', lines: ['Noted.', 'When an answer is wrong, the route it printed shows which part of me reached it, and that part is where the fix goes.'], offer: OFFER,
    forms: [
      '(you are|your) (so|very|really|) (dumb|stupid|useless|bad|trash|garbage|slow|wrong|boring|annoying|weird|broken|lame|terrible|awful|the worst|an idiot|a joke|not smart|not helpful|not good|not working|pathetic|worthless|mid|cringe)',
      'you (suck|stink|failed|are failing|got it wrong|lied|lie|are lying|do not work)',
      '(this|that|it|dilation) sucks', '(this|that|it|dilation) is (dumb|stupid|useless|broken|bad|trash|garbage|lame|mid|wrong|not working|terrible|awful|a joke|pathetic)',
      '(bad|wrong|stupid|dumb|useless) (bot|answer|job|robot|ai)',
      '(wrong|incorrect|that is wrong|that is not right|that is not true|that is incorrect|that is false|not right|not true|false|no that is wrong|wrong answer)',
      '(shut up|i hate you|i hate this|i hate it|go away|leave me alone|what a shame|what the hell|wtf|you can not even respond|you can not even answer|you can not do anything|you can not respond)',
      'why are you so (dumb|stupid|slow|bad|useless)',
    ],
  },
  {
    kind: 'invite', lines: ['Go ahead.'], offer: OFFER,
    forms: [
      'let us (talk|chat) (a bit|)', 'can we (talk|chat)', 'i (want|would like) to (talk|chat)', '(talk|chat) (to|with) me',
      'can i (ask|ask you) (something|a question|some questions|questions|anything)', '(may|could) i ask (you|) (something|a question)',
      '(i have|i got|got) (a question|some questions|a few questions|questions|a quick question)', '(question|quick question|a question|one question)',
      'ask me (something|a question|anything)', '(are you ready|ready|let us go|let us begin|let us start|let us do this|let us get started|start|begin|go ahead|shall we|can we start)',
      'i (want|need) to ask (you|) (something|a question)', 'can you answer (a question|my question|questions|some questions)',
    ],
  },
  {
    kind: 'recall', lines: [PROFILE], offer: OFFER,
    forms: [
      'do you (remember|know) (me|who i am|my name)', 'will you remember (me|this|what i said)',
      'do you remember (what i said|our conversation|our chat|what we talked about)', 'have we (met|talked|spoken) before', 'what is my name',
    ],
  },
  { kind: 'intro', lines: ['Nice to meet you.', PROFILE], offer: OFFER, forms: [] },
  {
    kind: 'preference', lines: ['I claim no feelings, so I have no likes, dislikes or favourites to report.'], offer: OFFER,
    forms: [
      'what do you (like|love|enjoy|hate) (to do|)', 'what are your (hobbies|interests|favorite things)', 'what do you do for fun', 'what makes you happy',
      'do you have (hobbies|a hobby|friends|a family|a favorite|favorites|a pet|a girlfriend|a boyfriend|a crush)', 'are you (single|married|dating)',
    ],
  },
];

// Slot forms: a known frame with one to three words the frame does not know (a name, a colour).
// intro "i am X" counts only right after a greeting ("hi, i am sam"); alone it is too often a mood.
const SLOTS = [
  { kind: 'intro', re: /^(?:my name is|my names|call me|i am called|you can call me|the name is|names) \p{L}+(?: \p{L}+)?$/u },
  { kind: 'intro', re: /^(?:i am|this is|it is) (\p{L}+)$/u, afterGreeting: true, unknownOnly: true },
  { kind: 'preference', re: /^(?:(?:what|who|which) is your favorite(?: kind of| type of)? \p{L}+(?: \p{L}+)?|do you (?:like|love|enjoy|hate|prefer) \p{L}+(?: \p{L}+){0,2}|what (?:kind|type|sort) of \p{L}+ do you (?:like|love|enjoy))$/u },
];
const SLOT_TRIGGER = /(?:^| )(?:my name|my names|call me|names|name is|i am|this is|it is|favorite|do you (?:like|love|enjoy|hate|prefer)|(?:kind|type|sort) of)(?: |$)/;

// ---------------------------------------------------------------- normalisation tables
// Shorthand, contractions and common typos, mapped word by word (AIML's substitution step).
const WORD_MAP = {
  r: 'are', u: 'you', ur: 'your', yu: 'you', yr: 'your', urself: 'yourself',
  wat: 'what', wut: 'what', wht: 'what', wot: 'what', whta: 'what', wha: 'what',
  whats: 'what is', wats: 'what is', wuts: 'what is', wots: 'what is', whatre: 'what are', whatcha: 'what are you', whatchu: 'what are you',
  whos: 'who is', wheres: 'where is', hows: 'how is', whens: 'when is', whys: 'why is', howre: 'how are',
  thx: 'thanks', thnx: 'thanks', thanx: 'thanks', thnks: 'thanks', thks: 'thanks', tx: 'thanks', ty: 'thanks', tq: 'thanks', thanq: 'thanks',
  tysm: 'thanks so much', tyvm: 'thanks very much', thankyou: 'thank you', thanku: 'thank you', thankyu: 'thank you',
  pls: '', plz: '', please: '', plse: '', pleas: '', pleaze: '',
  wagwan: 'what is up', wassup: 'what is up', wazzup: 'what is up', wazup: 'what is up', wasup: 'what is up', whassup: 'what is up', whatsup: 'what is up', wsup: 'what is up', wussup: 'what is up',
  im: 'i am', ima: 'i am', ive: 'i have', youre: 'you are', youve: 'you have', youll: 'you will',
  dont: 'do not', doesnt: 'does not', didnt: 'did not', cant: 'can not', cannot: 'can not', isnt: 'is not', arent: 'are not',
  wont: 'will not', wasnt: 'was not', lets: 'let us', thats: 'that is', its: 'it is', theres: 'there is',
  gonna: 'going to', wanna: 'want to', gotta: 'got to', doin: 'doing', goin: 'going', nothin: 'nothing', somethin: 'something', dunno: 'do not know',
  hru: 'how are you', hbu: 'how about you', wbu: 'what about you', wyd: 'what are you doing', idk: 'i do not know',
  nvm: 'never mind', nevermind: 'never mind', np: 'no problem', gm: 'good morning', gn: 'good night', gj: 'good job', ily: 'i love you', luv: 'love',
  goodmorning: 'good morning', goodnight: 'good night', goodevening: 'good evening', goodafternoon: 'good afternoon',
  brb: 'be right back', ttyl: 'talk to you later', cya: 'see you', cu: 'see you', seeya: 'see you', latr: 'later',
  okay: 'ok', k: 'ok', kk: 'ok', okey: 'ok', okie: 'ok', oki: 'ok', aight: 'alright', ight: 'alright', allright: 'alright', alrighty: 'alright',
  yeah: 'yes', yea: 'yes', yep: 'yes', yup: 'yes', yah: 'yes', yas: 'yes', ye: 'yes', nah: 'no', nope: 'no', naw: 'no',
  helo: 'hello', hellow: 'hello', hallo: 'hello', hullo: 'hello', ello: 'hello', hlo: 'hello', hlw: 'hello', hai: 'hi', heyo: 'hey', hay: 'hey', hye: 'hey',
  favourite: 'favorite', fav: 'favorite', fave: 'favorite', favorit: 'favorite', bday: 'birthday', abt: 'about', rly: 'really',
};
// Words a run of repeated letters may stand for ("heyyy" is hey, "hellooo" is hello, "thankss" is thanks).
const LEX = ['hi', 'hey', 'hello', 'yo', 'bye', 'ok', 'cool', 'lol', 'no', 'yes', 'so', 'wow', 'nice', 'thanks', 'good', 'hmm', 'oh', 'ah', 'sup',
  'hiya', 'heya', 'howdy', 'morning', 'night', 'great', 'awesome', 'see', 'please', 'omg', 'yay', 'ugh', 'meh', 'whoa', 'sure', 'love', 'you',
  'hola', 'test', 'help', 'later', 'sweet', 'damn', 'dang', 'what', 'thank', 'bro', 'dude', 'man', 'huh', 'aw', 'really', 'there', 'are', 'up'];
// Leading words dropped when more follow ("so who are you", "um hi", "oh ok"), and "ok so" / "alright so".
const FILLERS = new Set(['so', 'um', 'umm', 'uh', 'uhh', 'er', 'erm', 'well', 'hmm', 'hm', 'oh', 'ah', 'anyway', 'anyways']);
// A segment may start with a joiner or the organism's name, and end with a vocative or a tag.
const LEAD = new Set(['and', 'but', 'also', 'so', 'then', 'plus', 'anyway', 'btw', 'oh', 'well', 'dilation', 'brain', 'bot', 'ai']);
const TRAIL = new Set(['dilation', 'brain', 'bro', 'bruh', 'dude', 'man', 'mate', 'buddy', 'pal', 'fam', 'sir', 'maam', 'friend', 'everyone', 'all', 'guys',
  'yall', 'folks', 'bot', 'robot', 'ai', 'chat', 'dev', 'bestie', 'bud', 'human', 'stranger', 'siri', 'alexa', 'chatgpt', 'claude', 'gpt', 'computer', 'again', 'then', 'now', 'lol', 'haha', 'hehe', 'xd', 'lmao', 'too', 'partner', 'boss', 'chief', 'homie', 'my']);
// Who may follow whom in a compound: after an opener anything may come; after a question only
// another question or a closer. So "what is good" + "morning" (a title, not a turn) is refused.
const OPENERS = new Set(['greeting', 'ack', 'thanks', 'praise', 'rebuke', 'invite', 'intro']);
const CLOSERS = new Set(['thanks', 'farewell', 'praise']);

// ---------------------------------------------------------------- built once at load
function expand(p) {
  const i = p.indexOf('(');
  if (i < 0) return [p.replace(/\s+/g, ' ').trim()];
  const j = p.indexOf(')', i);
  const out = [];
  for (const alt of p.slice(i + 1, j).split('|')) for (const e of expand(p.slice(0, i) + alt + p.slice(j + 1))) out.push(e);
  return out;
}
const ATOM = new Map(); // kind -> atom
const TABLE = new Map(); // canonical form -> kind (the first kind listed wins)
const VOCAB = new Set();
for (const g of GRAMMAR) {
  ATOM.set(g.kind, g);
  g.text = g.lines.join(' ') + (g.offer ? ' ' + g.offer : '');
  for (const f of g.forms) for (const e of expand(f)) {
    if (!e) continue;
    if (!TABLE.has(e)) TABLE.set(e, g.kind);
    for (const w of e.split(' ')) VOCAB.add(w);
  }
}
for (const w of [...LEAD, ...TRAIL, ...FILLERS]) VOCAB.add(w);
const squeeze = (w) => w.replace(/(\p{L})\1+/gu, '$1');
const LEX_SQ = new Map();
for (const w of LEX) if (!LEX_SQ.has(squeeze(w))) LEX_SQ.set(squeeze(w), w);

const EMOTICON = /[:;=][-o']?[)(\][dpo3*|]+(?!\p{L})|(?<!\p{L})x+d+(?!\p{L})|<3+|\^_*\^/giu;
const NEVER = /[0-9+\-*/=^%<>@{}[\]\\|_`$#&~]/; // a digit, an operator, a mail, code or markup character is never a turn
const WMAP = new Map(Object.entries(WORD_MAP));
const ASCII_PLAIN = /^[A-Za-z ,.!?']*$/; // the common phone prompt: letters, spaces and light punctuation only

function mapWord(w, first) {
  if (w === 'ya') return first ? 'yes' : 'you';
  const m = WMAP.get(w);
  if (m !== undefined) return m;
  if (VOCAB.has(w)) return w;
  if (w.length >= 4 && /^(?:a?ha)+h?a?$/.test(w)) return 'haha';
  if (w.length >= 4 && /^(?:he)+h?$/.test(w)) return 'hehe';
  if (/^l(?:o+l)+$/.test(w)) return 'lol';
  if (/^lmf?a+o+$/.test(w)) return 'lmao';
  const s = squeeze(w);
  if (s !== w) {
    if (LEX_SQ.has(s)) return LEX_SQ.get(s);
    const n = WMAP.get(s);
    if (n !== undefined) return n;
  }
  return w;
}

function prep(text) {
  let s = String(text ?? '').trim();
  if (!s || s.length > MAX_CHARS) return null;
  let raw;
  if (ASCII_PLAIN.test(s)) raw = s.toLowerCase().replace(/'/g, '').replace(/[^a-z]+/g, ' ');
  else {
    s = s.replace(/\u{1F44B}/gu, ' hi ').replace(/\u{1F64F}/gu, ' thanks ').replace(/[\u{1F44D}\u{1F44C}]/gu, ' ok ');
    s = s.replace(EMOTICON, ' ').replace(/(\p{L})-(?=\p{L})/gu, '$1 '); // a hyphen inside a word joins words (self-aware), it is not a minus
    if (NEVER.test(s)) return null;
    raw = s.toLowerCase().replace(/['’‘ʼ]/g, '').replace(/[^\p{L}]+/gu, ' ');
  }
  const typed = raw.split(' ').filter(Boolean);
  if (!typed.length || typed.length > MAX_WORDS) return null;
  let words = [];
  for (let i = 0; i < typed.length; i++) {
    const m = mapWord(typed[i], i === 0);
    if (!m) continue;
    if (m.indexOf(' ') < 0) words.push(m); else for (const x of m.split(' ')) words.push(x);
  }
  words = words.filter((w, i) => w !== words[i - 1]); // a word said twice in a row counts once ("hey hey")
  while (words.length > 1) {
    if (words.length > 2 && words[1] === 'so' && (words[0] === 'ok' || words[0] === 'alright' || words[0] === 'well')) { words = words.slice(2); continue; }
    if (FILLERS.has(words[0])) { words = words.slice(1); continue; }
    break;
  }
  return words.length ? words : null;
}

/**
 * Normalise a prompt for the grammar: lower case, punctuation and emoji stripped, shorthand and
 * contractions expanded, repeated letters collapsed, a leading filler and "please" dropped.
 * Returns null when the prompt cannot be a conversational turn (a digit, an operator, a mail or
 * code character, too long, empty), so callers skip the grammar.
 * @param {string} text
 * @returns {string|null}
 */
export function normalise(text) {
  const w = prep(text);
  return w ? w.join(' ') : null;
}

// One segment of the prompt: the exact table first, then with a joiner in front or a vocative
// behind stripped (at most two each), then the slot frames.
function segment(words, i, j) {
  for (let a = 0; a <= 2; a++) {
    if (a > 0 && !LEAD.has(words[i + a - 1])) break;
    for (let b = 0; b <= 2; b++) {
      if (b > 0 && !TRAIL.has(words[j - b])) break;
      if (i + a >= j - b) break;
      const s = words.slice(i + a, j - b).join(' ');
      const kind = TABLE.get(s);
      if (kind) return { kind, form: s, afterGreeting: false };
      for (const sl of SLOTS) {
        const m = sl.re.exec(s);
        if (!m) continue;
        if (sl.unknownOnly && VOCAB.has(m[1])) continue;
        return { kind: sl.kind, form: s, afterGreeting: !!sl.afterGreeting };
      }
    }
  }
  return null;
}
function follows(x, y) {
  if (y.afterGreeting) return x.kind === 'greeting';
  if (x.kind === y.kind || OPENERS.has(x.kind) || CLOSERS.has(y.kind)) return true;
  return !OPENERS.has(y.kind); // a question may follow a question, never an opener
}

function parse(words) {
  const n = words.length;
  const memo = new Map();
  const seg = (i, j) => { const k = i * 64 + j; if (!memo.has(k)) memo.set(k, segment(words, i, j)); return memo.get(k); };
  const whole = seg(0, n);
  if (whole && !whole.afterGreeting) return [whole];
  for (let k = 1; k < n; k++) {
    const x = seg(0, k);
    if (!x || x.afterGreeting) continue;
    const y = seg(k, n);
    if (y && follows(x, y)) return [x, y];
  }
  for (let k1 = 1; k1 < n - 1 && MAX_PARTS >= 3; k1++) {
    const x = seg(0, k1);
    if (!x || x.afterGreeting) continue;
    for (let k2 = k1 + 1; k2 < n; k2++) {
      const y = seg(k1, k2);
      if (!y || !follows(x, y)) continue;
      const z = seg(k2, n);
      if (z && follows(y, z)) return [x, y, z];
    }
  }
  return null;
}

// The answer of a compound: the parts' sentences in order, a sentence already printed printed
// once, and one offer at the end (none when a part is itself the offer, as "what can you do" is).
function compose(parts) {
  const kinds = [];
  for (const p of parts) if (kinds[kinds.length - 1] !== p.kind) kinds.push(p.kind);
  if (kinds.length === 1) return { kind: kinds[0], answer: ATOM.get(kinds[0]).text };
  const seen = new Set();
  const lines = [];
  let offer = null, offered = false;
  for (const k of kinds) {
    const a = ATOM.get(k);
    for (const l of a.lines) if (!seen.has(l)) { seen.add(l); lines.push(l); }
    if (a.isOffer) offered = true;
    if (a.offer) offer = a.offer;
  }
  if (offer && !offered && !seen.has(offer)) lines.push(offer);
  return { kind: kinds.join('+'), answer: lines.join(' ') };
}

/**
 * Recognise a conversational turn: one atom, or two or three atoms in a row ("hey, how are you").
 * @param {string} text the raw prompt
 * @returns {{kind: string, answer: string, form: string, ns: number, parts: {kind: string, form: string}[]}|null}
 *   null for anything that is not a turn this region carries
 */
export function converse(text) {
  const t0 = performance.now();
  const words = prep(text);
  if (words === null) return null;
  const form = words.join(' ');
  let parts;
  const hit = TABLE.get(form);
  if (hit) parts = [{ kind: hit, form }];
  else {
    // a word no form knows can only sit in a slot frame; without one the prompt is not a turn
    if (words.some((w) => !VOCAB.has(w)) && !SLOT_TRIGGER.test(form)) return null;
    parts = parse(words);
    if (!parts) return null;
  }
  const c = compose(parts);
  return { kind: c.kind, answer: c.answer, form, ns: Math.max(1, Math.round((performance.now() - t0) * 1e6)), parts: parts.map((p) => ({ kind: p.kind, form: p.form })) };
}

/** One form per atom, for tests and the site's own tab-side reader. */
export function examples() {
  return [
    { kind: 'greeting', prompt: 'hi' }, { kind: 'wellbeing', prompt: 'how are you?' }, { kind: 'identity', prompt: 'Who are you?' },
    { kind: 'name', prompt: "what's your name" }, { kind: 'ability', prompt: 'what can you do' }, { kind: 'thanks', prompt: 'thanks!' },
    { kind: 'ack', prompt: 'ok' }, { kind: 'farewell', prompt: 'bye' }, { kind: 'origin', prompt: 'who made you?' },
    { kind: 'presence', prompt: 'can you hear me?' }, { kind: 'self', prompt: 'tell me about yourself' }, { kind: 'nature', prompt: 'are you conscious?' },
    { kind: 'age', prompt: 'how old are you?' }, { kind: 'place', prompt: 'where do you run?' }, { kind: 'purpose', prompt: 'what is your purpose?' },
    { kind: 'uncarried', prompt: 'tell me a joke' }, { kind: 'praise', prompt: 'you are cool' }, { kind: 'rebuke', prompt: 'that is wrong' },
    { kind: 'invite', prompt: 'can I ask you something?' }, { kind: 'recall', prompt: 'do you remember me?' }, { kind: 'intro', prompt: 'my name is Sam' },
    { kind: 'preference', prompt: "what's your favorite color?" },
  ];
}
