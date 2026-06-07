# Gesetzeslinks

Logseq-/hypha-Plugin, das deutsche Gesetzesreferenzen wie `§ 433 BGB` oder
`Art. 5 GG` erkennt und sie automatisch in klickbare Links auf
[gesetze-im-internet.de](https://www.gesetze-im-internet.de) umwandelt.

## Funktionsweise

1. Beim Tippen werden rohe Referenzen erkannt und (idempotent) in ein
   Makro umgeschrieben: `{{renderer :gesetz, BGB, 433, § 433 BGB}}`.
2. Das Makro wird als klickbarer Link gerendert
   (`https://www.gesetze-im-internet.de/bgb/__433.html`).

Erkannt werden u. a. `§`, `§§`, `Art.`/`Art`, inklusive Zusätzen wie
`Abs.`, `Satz`, `Nr.` und mehrteilige Abkürzungen (`SGB V`).

## Installation

Es gibt zwei Wege – je nachdem, ob du hypha als **Desktop-App** oder als
**Web-App** (gehostete hypha-Instanz) nutzt.

### A) Web-App (gehostetes hypha, nur Browser-Zugriff)

In der Web-Variante gibt es **kein** „Load unpacked plugin". Plugins werden
über eine **HTTPS-URL** geladen. Wichtig: hypha erzwingt `COEP=credentialless`
– der Plugin-Host **muss** den Header `cross-origin-resource-policy` senden.
**jsDelivr** tut das (GitHub Pages z. B. nicht). Deshalb:

1. Plugin in ein **öffentliches GitHub-Repo** pushen (Dateien im Repo-Root).
2. hypha → **Developer mode** aktivieren (Settings → Advanced).
3. Plugins-Dashboard öffnen (`t p`).
4. **Install from web URL** wählen und die **jsDelivr-URL** eintragen:

   ```
   https://cdn.jsdelivr.net/gh/teuffel/gesetzeslinks@master/
   ```

   (Statt `@master` kann ein Tag/Commit gepinnt werden, z. B. `@v0.1.0`.)
5. **Install** klicken.

> Hinweis: Die GitHub-`https://github.com/...`-URL funktioniert hier **nicht**
> für eigene Plugins – sie zeigt hypha auf den offiziellen Marketplace-CDN.
> Verwende die jsDelivr-`/gh/`-URL.

### B) Desktop-App (Electron)

1. hypha öffnen → **Developer mode** aktivieren.
2. Plugins-Dashboard öffnen (`t p`).
3. **Load unpacked plugin** → diesen Ordner auswählen.

Das SDK (`@logseq/libs` 0.3.3, passend zum hypha-Core) ist als
`lsplugin.user.js` mitgeliefert; kein Build-Schritt nötig.

## Unbekannte Gesetze ergänzen

Ist eine Abkürzung nicht im eingebauten Mapping (~30 Top-Gesetze), wird der
Link gestrichelt dargestellt und zeigt auf die passende Teilliste. Über das
`＋` daneben öffnet sich ein Formular: **Abkürzung**, **URL-Slug** (z. B.
`bdsg_2018`) und **Anker-Schema** (`§` oder `Art.`) eingeben → wird in den
Plugin-Einstellungen gespeichert und ab sofort verwendet. Eigene Zuordnungen
überschreiben das eingebaute Mapping.

## Einstellungen

- **Automatisch umschreiben** (Standard: an). Aus → Umwandlung nur per
  Slash-Command `/Gesetzeslinks` im aktuellen Block.
- **Eigene Gesetz-Zuordnungen** – per Formular gepflegt.

## Tests

```
node test.js
```

Prüft URL-Bildung (inkl. Sonderfälle GG/StVO/SGB), Erkennung und Idempotenz.
