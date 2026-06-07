// Erkennung roher Gesetzesreferenzen und idempotente Umschreibung in Makros.
//
// Makro-Form:  {{renderer :gesetz, <ABK>, <NR>, <LABEL>}}
//   <ABK>   normalisierte Abkürzung, z.B. "BGB" oder "SGB V"
//   <NR>    Paragraphen-/Artikelnummer, z.B. "433" oder "8a"
//   <LABEL> exakter Originaltext, der angezeigt wird, z.B. "§ 433 Abs. 2 BGB"

// Symbol: "§" oder "Art." / "Art" (Grundgesetz). Nummer: Ziffern + optional ein Buchstabe.
// Mittelteil (Abs./Satz/Nr.) wird mitgeschluckt, damit das Label vollständig ist,
// fließt aber nicht in die URL ein.
// Abkürzung: Großbuchstabenwort (2+), optional gefolgt von römischer Zahl (SGB V).
const REF_RE =
  /(§§?|Art\.?)\s*(\d+[a-z]?)((?:\s+(?:Abs\.?|Satz|S\.|Nr\.?|Halbsatz|Alt\.?)\s*\d+[a-z]?)*)\s+([A-ZÄÖÜ][A-ZÄÖÜa-z]*(?:\s+[IVXLC]+)?)/g;

// Erkennt, ob eine Position bereits innerhalb eines {{...}}-Makros liegt,
// damit wir bereits umgeschriebene Referenzen nicht erneut anfassen (Idempotenz).
function spansInsideMacros(text) {
  const spans = [];
  const re = /\{\{[^]*?\}\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    spans.push([m.index, m.index + m[0].length]);
  }
  return spans;
}

function isInside(spans, start, end) {
  return spans.some(([s, e]) => start >= s && end <= e);
}

// Findet alle rohen Referenzen außerhalb bestehender Makros.
// Liefert [{ symbol, nr, label, index, length, abbr }].
function findRefs(text) {
  const macroSpans = spansInsideMacros(text);
  const out = [];
  let m;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(text)) !== null) {
    const start = m.index;
    const end = start + m[0].length;
    if (isInside(macroSpans, start, end)) continue;
    out.push({
      symbol: m[1],
      nr: m[2],
      label: m[0].trim(),
      abbr: m[4].replace(/\s+/g, ' ').trim(),
      index: start,
      length: m[0].length,
    });
  }
  return out;
}

// Schreibt rohe Referenzen in Makros um. Idempotent: bereits in Makros stehende
// Referenzen werden ignoriert. Gibt { text, count } zurück.
function rewrite(text) {
  const refs = findRefs(text);
  if (refs.length === 0) return { text, count: 0 };
  // Von hinten nach vorne ersetzen, damit Indizes gültig bleiben.
  let out = text;
  for (let i = refs.length - 1; i >= 0; i--) {
    const r = refs[i];
    const macro = `{{renderer :gesetz, ${r.abbr}, ${r.nr}, ${r.label}}}`;
    out = out.slice(0, r.index) + macro + out.slice(r.index + r.length);
  }
  return { text: out, count: refs.length };
}

// Parst die Argumente eines :gesetz-Makros zurück: "BGB, 433, § 433 BGB".
function parseMacroArgs(argString) {
  const parts = argString.split(',').map((s) => s.trim());
  return { abbr: parts[0], nr: parts[1], label: parts.slice(2).join(', ') || `${parts[0]} ${parts[1]}` };
}

const api = { REF_RE, findRefs, rewrite, parseMacroArgs, spansInsideMacros };

if (typeof module !== 'undefined' && module.exports) module.exports = api;
if (typeof window !== 'undefined') window.GLParser = api;
