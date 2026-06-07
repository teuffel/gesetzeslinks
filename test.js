// Lokaler Test ohne hypha:  node test.js
const assert = require('assert');
const { buildUrl } = require('./gesetze');
const { rewrite, findRefs } = require('./parser');

let pass = 0;
function eq(actual, expected, msg) {
  assert.strictEqual(actual, expected, `${msg}\n  expected: ${expected}\n  actual:   ${actual}`);
  pass++;
}

// --- URL-Builder ---
eq(buildUrl('BGB', '433').url, 'https://www.gesetze-im-internet.de/bgb/__433.html', 'BGB 433');
eq(buildUrl('GG', '5').url, 'https://www.gesetze-im-internet.de/gg/art_5.html', 'GG art_5');
eq(buildUrl('SGB V', '7').url, 'https://www.gesetze-im-internet.de/sgb_5/__7.html', 'SGB V 7');
eq(buildUrl('StVO', '1').url, 'https://www.gesetze-im-internet.de/stvo_2013/__1.html', 'StVO 1');
eq(buildUrl('BGB', '8a').url, 'https://www.gesetze-im-internet.de/bgb/__8a.html', 'BGB 8a');
eq(buildUrl('XYZ', '1').known, false, 'unbekannt -> known false');
eq(buildUrl('XYZ', '1').url, 'https://www.gesetze-im-internet.de/Teilliste_X.html', 'unbekannt -> Teilliste');

// userMapping überschreibt builtin
const um = { BGB: { slug: 'foo', anchor: 'p' }, DSGVO: { slug: 'dsgvo', anchor: 'art' } };
eq(buildUrl('BGB', '1', um).url, 'https://www.gesetze-im-internet.de/foo/__1.html', 'user overrides builtin');
eq(buildUrl('DSGVO', '6', um).url, 'https://www.gesetze-im-internet.de/dsgvo/art_6.html', 'user new mapping');

// --- Parser ---
eq(findRefs('Siehe § 433 BGB hier').length, 1, 'findet eine Referenz');
eq(findRefs('Siehe § 433 BGB hier')[0].abbr, 'BGB', 'abbr BGB');
eq(findRefs('§ 1 Abs. 2 Satz 3 StGB')[0].label, '§ 1 Abs. 2 Satz 3 StGB', 'label mit Abs/Satz');
eq(findRefs('§ 1 Abs. 2 Satz 3 StGB')[0].nr, '1', 'nr ohne Abs');
eq(findRefs('Art. 5 GG')[0].abbr, 'GG', 'Art. 5 GG abbr');
eq(findRefs('§ 7 SGB V garantiert')[0].abbr, 'SGB V', 'SGB V mehrteilig');

// Idempotenz
const once = rewrite('Text § 433 BGB Text');
eq(once.count, 1, 'rewrite count 1');
eq(once.text, 'Text {{renderer :gesetz, BGB, 433, § 433 BGB}} Text', 'rewrite output');
const twice = rewrite(once.text);
eq(twice.count, 0, 'zweites rewrite ändert nichts (idempotent)');
eq(twice.text, once.text, 'idempotent text gleich');

// Mehrere Treffer
eq(rewrite('§ 1 BGB und § 2 HGB').count, 2, 'zwei Treffer');

console.log(`\nOK – ${pass} Assertions bestanden.`);
