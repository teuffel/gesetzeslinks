// Mapping deutscher Gesetzes-Abkürzungen auf gesetze-im-internet.de.
//
// Jeder Eintrag: slug = URL-Pfadsegment, anchor = Anker-Schema.
//   anchor "p"   -> /<slug>/__<nr>.html      (Standard, "§")
//   anchor "art" -> /<slug>/art_<nr>.html    (Grundgesetz, "Art.")
//
// Verifizierte Sonderfälle: GG (art_), StVO (stvo_2013), SGB V (sgb_5).

(function () {
const BASE = 'https://www.gesetze-im-internet.de';

// Eingebautes Mapping: Top-Gesetze des Alltags. Schlüssel sind GROSSGESCHRIEBEN
// und whitespace-normalisiert (z.B. "SGB V").
const BUILTIN = {
  BGB: { slug: 'bgb', anchor: 'p' },
  HGB: { slug: 'hgb', anchor: 'p' },
  STGB: { slug: 'stgb', anchor: 'p' },
  STPO: { slug: 'stpo', anchor: 'p' },
  ZPO: { slug: 'zpo', anchor: 'p' },
  GG: { slug: 'gg', anchor: 'art' },
  AO: { slug: 'ao_1977', anchor: 'p' },
  ESTG: { slug: 'estg', anchor: 'p' },
  USTG: { slug: 'ustg_1980', anchor: 'p' },
  GMBHG: { slug: 'gmbhg', anchor: 'p' },
  AKTG: { slug: 'aktg', anchor: 'p' },
  GEWO: { slug: 'gewo', anchor: 'p' },
  VWVFG: { slug: 'vwvfg', anchor: 'p' },
  VWGO: { slug: 'vwgo', anchor: 'p' },
  STVO: { slug: 'stvo_2013', anchor: 'p' },
  STVG: { slug: 'stvg', anchor: 'p' },
  KSCHG: { slug: 'kschg', anchor: 'p' },
  ARBGG: { slug: 'arbgg', anchor: 'p' },
  BETRVG: { slug: 'betrvg', anchor: 'p' },
  TVG: { slug: 'tvg', anchor: 'p' },
  BURLG: { slug: 'burlg', anchor: 'p' },
  TZBFG: { slug: 'tzbfg', anchor: 'p' },
  OWIG: { slug: 'owig_1968', anchor: 'p' },
  GKG: { slug: 'gkg_2004', anchor: 'p' },
  RVG: { slug: 'rvg', anchor: 'p' },
  'SGB I': { slug: 'sgb_1', anchor: 'p' },
  'SGB II': { slug: 'sgb_2', anchor: 'p' },
  'SGB III': { slug: 'sgb_3', anchor: 'p' },
  'SGB IV': { slug: 'sgb_4', anchor: 'p' },
  'SGB V': { slug: 'sgb_5', anchor: 'p' },
  'SGB VI': { slug: 'sgb_6', anchor: 'p' },
  'SGB VII': { slug: 'sgb_7', anchor: 'p' },
  'SGB VIII': { slug: 'sgb_8', anchor: 'p' },
  'SGB IX': { slug: 'sgb_9_2018', anchor: 'p' },
  'SGB X': { slug: 'sgb_10', anchor: 'p' },
  'SGB XI': { slug: 'sgb_11', anchor: 'p' },
  'SGB XII': { slug: 'sgb_12', anchor: 'p' },
};

// Schlüssel normalisieren: trimmen, Mehrfach-Whitespace zu einem Space, upcase.
function normKey(abbr) {
  return abbr.trim().replace(/\s+/g, ' ').toUpperCase();
}

// userMappings (aus Plugin-Settings) gewinnen vor BUILTIN.
// userMappings-Format: { "DSGVO": { slug: "...", anchor: "p"|"art" }, ... }
function resolve(abbr, userMappings) {
  const key = normKey(abbr);
  const user = userMappings || {};
  for (const k of Object.keys(user)) {
    if (normKey(k) === key) return user[k];
  }
  return BUILTIN[key] || null;
}

// Baut die Ziel-URL. nr ist die Paragraphen-/Artikelnummer (String, evtl. mit Buchstabe wie "8a").
function buildUrl(abbr, nr, userMappings) {
  const entry = resolve(abbr, userMappings);
  if (!entry) {
    // Fallback: Teilliste nach Anfangsbuchstabe der Abkürzung.
    const letter = normKey(abbr).charAt(0);
    return { url: `${BASE}/Teilliste_${letter}.html`, known: false };
  }
  const num = String(nr).toLowerCase();
  const path =
    entry.anchor === 'art'
      ? `${entry.slug}/art_${num}.html`
      : `${entry.slug}/__${num}.html`;
  return { url: `${BASE}/${path}`, known: true };
}

const api = { BASE, BUILTIN, normKey, resolve, buildUrl };

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.GLGesetze = api;
})();
