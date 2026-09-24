// test/fixtures/knowledge/wiki50.mjs. A synthetic MediaWiki pages-articles dump of 50 invented
// articles, one redirect and one talk page, for test/knowledge.test.mjs. Every name is invented,
// so nothing here is anyone's text. wiki50.xml.bz2 beside it is this XML compressed by Git Bash
// bzip2 1.0.8 as TWO streams (articles 0 to 24 with the header, then the rest), the way the real
// multistream dump is built; regenerate it with:
//   node -e "import('./test/fixtures/knowledge/wiki50.mjs').then(m=>process.stdout.write(m.wiki50Part(0)))" | bzip2 -9 > a.bz2
//   node -e "import('./test/fixtures/knowledge/wiki50.mjs').then(m=>process.stdout.write(m.wiki50Part(1)))" | bzip2 -9 > b.bz2
//   cat a.bz2 b.bz2 > test/fixtures/knowledge/wiki50.xml.bz2
const SYL = ['ka', 'lo', 'mi', 'ren', 'tu', 'sha', 'vor', 'bel', 'dri', 'zan'];
export const NOUNS = [['river', 'Rivers'], ['city', 'Cities'], ['mountain', 'Mountains'], ['bird', 'Birds'], ['language', 'Languages'], ['planet', 'Planets'], ['village', 'Villages'], ['painter', 'Painters'], ['lake', 'Lakes'], ['island', 'Islands']];
export const PLACES = ['Norland', 'Estovia', 'Quarrin', 'Valdessa', 'Morrowmere'];
const ADJ = ['large', 'small', 'old', 'famous', 'quiet'];
const cap = (s) => s[0].toUpperCase() + s.slice(1);

/** The 50 articles as { title, noun, place, adj, wikitext }. */
export function wiki50Articles() {
  const out = [];
  for (let i = 0; i < 50; i++) {
    const title = cap(SYL[i % 10] + SYL[(Math.floor(i / 10) * 3 + 1) % 10] + SYL[(i * 7 + 2) % 10]) + (i >= 10 ? ' ' + cap(SYL[(i * 3) % 10] + 'n') : '');
    const [noun, plural] = NOUNS[i % 10], place = PLACES[i % 5], adj = ADJ[(i * 2 + 1) % 5];
    const wikitext = [
      `{{Infobox thing|name=${title}|image=Pic${i}.jpg}}`,
      `'''${title}''' is a [[${adj}|${adj}]] [[${noun}]] in [[${place}]].<ref>A book about ${place}, page ${i}.</ref> It is known for its ${10 + i} old stones and a road of {{convert|${i + 2}|km}}.`,
      `Many visitors from [[${place}|the land of ${place}]] come to see it every year.`,
      '',
      '== History ==',
      `People in ${place} first wrote about ${title} in the year ${1200 + i * 7}. Every ${noun} in ${place} has a story, and the story of ${title} is the oldest.`,
      '',
      '=== Today ===',
      `[[File:Pic${i}.jpg|thumb|A picture]] Today about ${100 + i} people study it. {{cite web|url=http://example.org|title=x}}`,
      '',
      '== References ==',
      '{{reflist}}',
      '',
      `[[Category:${plural} of ${place}]]`,
      `[[Category:${cap(adj)} things]]`,
      '[[en:Something]]',
    ].join('\n');
    out.push({ title, noun, place, adj, wikitext });
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const page = (id, title, ns, text, redirect) => `  <page>\n    <title>${esc(title)}</title>\n    <ns>${ns}</ns>\n    <id>${id}</id>\n${redirect ? `    <redirect title="${esc(redirect)}" />\n` : ''}    <revision>\n      <id>${9000 + id}</id>\n      <text bytes="${Buffer.byteLength(text)}" xml:space="preserve">${esc(text)}</text>\n    </revision>\n  </page>\n`;

/** The XML in two parts, split between article 24 and 25; part 1 closes the document. */
export function wiki50Part(k) {
  const arts = wiki50Articles();
  if (k === 0) {
    let s = '<mediawiki xmlns="http://www.mediawiki.org/xml/export-0.11/" version="0.11" xml:lang="en">\n  <siteinfo>\n    <sitename>Test</sitename>\n  </siteinfo>\n';
    for (let i = 0; i < 25; i++) s += page(i + 1, arts[i].title, 0, arts[i].wikitext);
    s += page(101, 'Old ' + arts[0].title, 0, '#REDIRECT [[' + arts[0].title + ']]', arts[0].title);
    return s;
  }
  let s = page(102, 'Talk:' + arts[1].title, 1, 'Is this a ' + arts[1].noun + '? Yes it is.');
  for (let i = 25; i < 50; i++) s += page(i + 1, arts[i].title, 0, arts[i].wikitext);
  return s + '</mediawiki>\n';
}
export function wiki50Xml() { return wiki50Part(0) + wiki50Part(1); }
