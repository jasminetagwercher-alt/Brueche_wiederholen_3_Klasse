# Bruch-Check – Bruchrechnen wiederholen

Interaktive, diagnostische und adaptive Lernplattform für die 3. Klasse Mittelschule Österreich. Die Anwendung läuft als statische GitHub-Pages-Seite ohne Build-Schritt.

## Lernidee

Bruch-Check ist bewusst **keine lange lineare Aufgabenserie**. Der Lernfluss besteht aus drei klaren Etappen:

1. **Schnellcheck** – 10 kurze Diagnoseaufgaben; nach fünf Aufgaben gibt es einen kurzen Stopp.
2. **Missionen** – ein Dashboard zeigt sichere und empfohlene Bereiche. Schülerinnen und Schüler wählen selbst, welche Mission sie bearbeiten. Sichere Bereiche können übersprungen werden.
3. **Final Check** – 8 gemischte Aufgaben ohne geführte Rechenwege.

Damit soll die Diagnose tatsächlich Zeit sparen: Wer einen Bereich im Schnellcheck sicher zeigt, muss ihn nicht automatisch nochmals vollständig trainieren.

## Missionen

Aktuell gibt es sieben kurze Trainingsmissionen mit jeweils 3–5 Aufgaben:

- Brüche verstehen
- Gemischte Zahlen
- Kürzen & Erweitern
- Vergleichen & Zahlenstrahl
- Bruch & Dezimalzahl
- Bruchteil & Ganzes
- Rechnen mit Brüchen

Eine Mission kann den Status **Training empfohlen**, **Im Schnellcheck sicher**, **Begonnen** oder **Mission geschafft** haben. Begonnene Missionen speichern ihren Fortschritt und können später fortgesetzt werden.

## Zentrale Funktionen

- exakte zentrale Bruchrechnung über `Fraction`
- dynamische Aufgabengeneratoren mit Wiederholungssperre
- österreichische mathematische Terminologie
- „So geht’s“-Erklärungen mit unabhängigen Beispielen
- horizontale Rechenzeilen wie im Mathematikheft
- geführte, teilweise geführte und freie Rechenwege
- semantische Prüfung einzelner Rechenschritte
- getrennte Achsen für mathematische Schwierigkeit und Unterstützungsgrad
- Brucharten, gemischte Zahlen, Kürzen, Erweitern und Gleichwertigkeit
- Vergleichen, Ordnen und interaktiver Zahlenstrahl
- Bruch ↔ Dezimalzahl
- Bruchteil einer Zahl und Ganzes aus einem Bruchteil
- Addition, Subtraktion, Multiplikation und Division
- Fehlkonzept-Erkennung und gestufte Hilfen
- LocalStorage-Fortschritt
- vorbereitete Remote-Speicherschnittstelle
- JSON-Ergebnisexport
- KaTeX-Darstellung
- automatische Core-, Generator-, Rechenweg- und Missionstests über GitHub Actions

## Lokale Nutzung

Da ES Modules verwendet werden, die Anwendung über einen kleinen lokalen Webserver öffnen:

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` öffnen.

Tests:

```bash
npm test
```

Es werden keine npm-Pakete benötigt; die Tests verwenden Node-Bordmittel.

## GitHub Pages

1. Repository öffnen.
2. **Settings → Pages**.
3. **Deploy from a branch** wählen.
4. Branch `main`, Ordner `/ (root)` auswählen.
5. Speichern.

KaTeX wird über jsDelivr geladen; Schülergeräte benötigen beim Laden Internetzugriff.

## Projektstruktur

```text
/
├─ index.html
├─ css/
│  ├─ main.css
│  ├─ calculation.css
│  └─ missions.css
├─ js/
│  ├─ app.js
│  ├─ config.js
│  ├─ core/
│  │  ├─ fraction.js
│  │  ├─ answer-validator.js
│  │  └─ step-validator.js
│  ├─ didactics/
│  │  ├─ terminology-at.js
│  │  ├─ strategy-registry.js
│  │  └─ operation-plans.js
│  ├─ generators/
│  │  ├─ registry.js
│  │  ├─ generator-utils.js
│  │  ├─ basic.js
│  │  ├─ conversions.js
│  │  ├─ operations.js
│  │  └─ compare-order.js
│  ├─ learning/
│  │  ├─ skills.js
│  │  ├─ missions.js
│  │  ├─ adaptive-engine.js
│  │  ├─ support-engine.js
│  │  ├─ misconception-engine.js
│  │  └─ session.js
│  ├─ storage/
│  │  ├─ storage-interface.js
│  │  ├─ local-storage.js
│  │  └─ remote-storage.js
│  └─ ui/
│     ├─ inputs.js
│     ├─ math-renderer.js
│     ├─ number-line.js
│     ├─ calculation-line.js
│     ├─ strategy-help.js
│     └─ mission-dashboard.js
├─ tests/
│  ├─ fraction.test.mjs
│  ├─ generators.test.mjs
│  ├─ solution-plans.test.mjs
│  └─ missions.test.mjs
└─ .github/workflows/tests.yml
```

## Mathematische Architektur

Alle Brüche werden zentral als `Fraction` mit ganzzahligem `numerator` und `denominator` behandelt. Die Kernoperationen normalisieren Vorzeichen, verbieten Nenner 0 und reduzieren Ergebnisse exakt. Vergleich und Äquivalenz basieren auf exakter Bruchrechnung statt auf gerundeten Dezimalwerten.

Generatoren implementieren keine eigene Bruchrechnung. Sie erzeugen Aufgabenparameter und verwenden die Core-Engine für Ergebnisse.

## Mission-Architektur

`js/learning/missions.js` enthält die Mission Registry. Jede Mission definiert:

```js
{
  id,
  code,
  title,
  subtitle,
  skills,
  diagnosticSkills,
  length
}
```

`diagnosticSkills` legt fest, welche Schnellcheck-Aufgaben als Indikatoren für eine Mission dienen. Fehler oder Hilfe im Schnellcheck führen zu **Training empfohlen**. Eine fehlerfrei und ohne Hilfe gelöste Diagnose kann einen Bereich als **Im Schnellcheck sicher** markieren.

Das Dashboard liegt in `js/ui/mission-dashboard.js`. Die Lernlogik bleibt davon getrennt.

### Neue Mission ergänzen

1. Mission in `js/learning/missions.js` registrieren.
2. Bestehende Skill-IDs verwenden oder neue Skills anlegen.
3. Missionlänge auf 3–5 Aufgaben begrenzen.
4. Sinnvolle `diagnosticSkills` festlegen.
5. Falls nötig neue Generatoren bzw. Erklärungen ergänzen.
6. `tests/missions.test.mjs` erweitern.

## Schnellcheck und Final Check

Der Schnellcheck verwendet aktuell 10 repräsentative Skills. Er soll eine **schnelle Lernentscheidung** ermöglichen und nicht jeden Unterpunkt vollständig prüfen.

Der Final Check verwendet 8 neue Aufgaben und enthält auch Kompetenzen, die im Schnellcheck nicht exakt gleich abgefragt wurden. Dadurch wird geprüft, ob Wissen auf verwandte Aufgaben übertragen werden kann.

Die Sequenzen liegen zentral in `js/learning/missions.js` als `DIAGNOSTIC_SKILLS` und `FINAL_SKILLS`.

## Schwierigkeit und Unterstützung getrennt

`adaptive-engine.js` steuert die mathematische Schwierigkeit. `support-engine.js` entscheidet unabhängig davon über den Unterstützungsgrad.

Unterstützungsmodi:

- `guided`: geführter Rechenweg mit mehreren geprüften Zwischenschritten
- `partial`: nur zentrale strategische Zwischenschritte werden vorgegeben
- `free`: freie Ergebniseingabe

Aktuelle Regel:

- Schnellcheck: frei
- Trainingsmission, deutlich unsicher: geführt
- Trainingsmission, im Aufbau: teilweise geführt
- Trainingsmission, sicher: frei
- Final Check: frei

## Rechenweg-Architektur

Die vier Grundrechnungsarten können einen strukturierten `solutionPlan` mitführen. Die Oberfläche zeigt daraus **eine horizontale Rechenzeile** wie im Heft.

Beispiel Division:

```text
3/4 : 2/5 = 3/4 · 5/2 = … = 15/8
```

Typische Schritte:

- Kehrwert bilden
- Division als Multiplikation anschreiben
- wenn sinnvoll kürzen
- multiplizieren
- Endergebnis prüfen

`operation-plans.js` erzeugt die fachliche Schrittfolge. `step-validator.js` prüft Eingaben semantisch. `CalculationLine` rendert den Rechenweg. Die UI enthält keine eigene Bruchlogik.

## „So geht’s“-Erklärungen

`strategy-registry.js` enthält kurze Erklärungen mit:

- Regel in österreichischer Fachsprache
- wenigen Denkschritten
- Beispiel mit **anderen Zahlen als in der aktuellen Aufgabe**

Die Nutzung zählt als Hilfe. Damit wird eine danach gelöste Aufgabe nicht fälschlich als vollständig selbstständig gewertet.

## Österreichische Terminologie

`js/didactics/terminology-at.js` ist die zentrale Stelle für österreichische Fachbegriffe. Verwendet werden unter anderem:

- Zähler und Nenner
- echter Bruch
- unechter Bruch
- uneigentlicher Bruch
- gemischte Zahl
- gleichwertige Brüche
- gleichnamig machen
- gemeinsamer Nenner
- kürzen und erweitern
- Kehrwert

Die Formulierung „Scheinbruch“ wird in der Schüleroberfläche nicht verwendet.

## Fachdidaktische Referenzen

Die eigenen Erklärtexte orientieren sich fachsprachlich und bei typischen Lösungswegen an frei zugänglichen österreichischen öbv-Materialien. Inhalte werden nicht wörtlich übernommen; die Quellen dienen als Terminologie- und Strukturreferenz.

- öbv, *Schritt für Schritt Mathematik 2*, Brüche und gemischte Zahlen: https://www.oebv.at/flippingbook/9783209090003/39/
- öbv, *Lösungswege 1*, Brucharten und gemischte Zahlen: https://www.oebv.at/flippingbook/9783209111258/94/
- öbv, *Lösungswege 2*, Zusammenfassung Bruchrechnen: https://www.oebv.at/flippingbook/9783209122520/112/
- öbv, *Lösungswege 3*, Multiplizieren und Dividieren rationaler Zahlen: https://www.oebv.at/flippingbook/9783209111272/42/

## Aufgabengeneratoren und Wiederholungen

Zahlenwerte werden innerhalb didaktisch begrenzter Bereiche dynamisch erzeugt. Jede Aufgabe erhält eine inhaltliche Signatur. `generateTask()` kann zuletzt gezeigte Signaturen vermeiden; die Gedächtnislänge steht in `js/config.js` unter `recentTaskMemory`.

## Neuen Skill ergänzen

1. Skill-ID in `js/learning/skills.js` registrieren.
2. Generator implementieren oder erweitern.
3. Skill in `js/generators/registry.js` verbinden.
4. Passende Erklärung in `didactics/strategy-registry.js` ergänzen.
5. Falls ein geführter Rechenweg sinnvoll ist, einen strukturierten Lösungsplan ergänzen.
6. Skill einer Mission und/oder Schnellcheck-/Final-Sequenz zuordnen.
7. Tests ergänzen.

## Speicherung

`LocalStorageAdapter` speichert Schnellcheck, Missionsfortschritt, laufende Missionssequenzen und Final Check lokal im Browser. Der aktuelle Storage-Key ist absichtlich versioniert, damit inkompatible Prototyp-Sitzungen nicht in die neue Missionsarchitektur übernommen werden.

`RemoteStorageAdapter` ist vorbereitet; seine URL wird ausschließlich in `js/config.js` konfiguriert. Es dürfen keine geheimen Schlüssel in GitHub-Pages-Browsercode gespeichert werden.

Am Ende können unter anderem Schnellcheck, Final Check, Missionsstände, Kompetenzstände, Fehlversuche, Hilfen, Fehlkonzepte und Bearbeitungsdauer exportiert werden. Es wird keine automatische Schulnote erzeugt.

## Qualitätssicherung

`npm test` prüft aktuell:

- Syntax zentraler Browsermodule
- mathematische Fraction-Core-Funktionen
- Generator-Smoke-Tests und Aufgabenvielfalt
- strukturierte Rechenweg-Pläne
- semantische Zwischenschrittprüfung
- Auswahl des Unterstützungsgrads
- Missionslängen, Skill-Zuordnung und Empfehlungssystem

GitHub Actions führt diese Tests bei Änderungen automatisch aus.

## Bekannte Erweiterungspunkte

- Geführte horizontale Rechenwege sind zunächst für die vier Grundrechnungsarten umgesetzt. Dieselbe Architektur kann auf Kürzen, Erweitern, gemischte Zahlen sowie Bruchteil/Ganzes ausgeweitet werden.
- Die Diagnose arbeitet mit repräsentativen Stichproben und ist keine vollständige Kompetenzmessung jedes Unterbereichs.
- Zahlenstrahl-Ableseaufgaben können noch stärker ausgebaut werden.
- Ordnen erfolgt zusätzlich über barrierearme Links-/Rechts-Steuerung.
- Remote-Speicherung ist ohne konfigurierte URL absichtlich deaktiviert.
