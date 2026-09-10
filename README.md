# Bruch-Check – Bruchrechnen wiederholen

Interaktive, diagnostische und adaptive Lernplattform für die 3. Klasse Mittelschule Österreich. Die Anwendung läuft als statische GitHub-Pages-Seite ohne Build-Schritt.

## Funktionen

- vier klar sichtbare Phasen: Bruch-Check, individuelles Training, Bruch-Mix, Abschlusscheck
- Lernstrecken-Übersicht und Konzentrationsstopps
- exakte zentrale Bruchrechnung über `Fraction`
- dynamische Aufgabengeneratoren mit Wiederholungssperre
- österreichische mathematische Terminologie
- „So geht’s“-Erklärungen mit unabhängigen Beispielen
- horizontale Rechenzeilen wie im Mathematikheft
- geführte, teilweise geführte und freie Rechenwege
- semantische Prüfung einzelner Rechenschritte
- Adaptivität: Schwierigkeit und Unterstützungsgrad sind getrennte Achsen
- Brucharten, gemischte Zahlen, Kürzen, Erweitern und Gleichwertigkeit
- Vergleichen, Ordnen und interaktiver Zahlenstrahl
- Bruch ↔ Dezimalzahl
- Bruchteil einer Zahl und Ganzes aus einem Bruchteil
- Addition, Subtraktion, Multiplikation und Division
- Fehlkonzept-Erkennung, Hilfestufen und Plausibilitätsfragen
- lokaler Sitzungsstand per `localStorage`
- vorbereitete Remote-Speicherschnittstelle und JSON-Ergebnisexport
- KaTeX-Darstellung
- automatische Core-, Generator- und Rechenweg-Tests über GitHub Actions

## Lokale Nutzung

Da ES Modules verwendet werden, sollte die Anwendung über einen kleinen lokalen Webserver geöffnet werden:

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
│  └─ calculation.css
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
│     ├─ navigation.js
│     ├─ number-line.js
│     ├─ calculation-line.js
│     └─ strategy-help.js
├─ tests/
│  ├─ fraction.test.mjs
│  ├─ generators.test.mjs
│  └─ solution-plans.test.mjs
└─ .github/workflows/tests.yml
```

## Mathematische Architektur

Alle Brüche werden zentral als `Fraction` mit ganzzahligem `numerator` und `denominator` behandelt. Die Kernoperationen normalisieren Vorzeichen, verbieten Nenner 0 und reduzieren Ergebnisse exakt. Vergleich und Äquivalenz basieren auf exakter Bruchrechnung statt auf gerundeten Dezimalwerten.

Generatoren implementieren keine eigene Bruchrechnung. Sie erzeugen Aufgabenparameter und verwenden die Core-Engine für Ergebnisse.

## Österreichische Terminologie

`js/didactics/terminology-at.js` ist die zentrale Stelle für die fachsprachlichen Begriffe. In der Schüleroberfläche soll österreichische Schulbuchterminologie verwendet werden. Dazu gehören insbesondere:

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

Die Formulierung „Scheinbruch“ wurde in der Schüleroberfläche durch „uneigentlicher Bruch“ ersetzt.

## Fachdidaktische Referenzen

Die eigenen Erklärtexte orientieren sich fachsprachlich und bei typischen Lösungswegen an frei zugänglichen österreichischen öbv-Materialien. Inhalte werden nicht wörtlich übernommen; die Quellen dienen als Terminologie- und Strukturreferenz.

- öbv, *Schritt für Schritt Mathematik 2*, Brüche und gemischte Zahlen: https://www.oebv.at/flippingbook/9783209090003/39/
- öbv, *Lösungswege 1*, Brucharten und gemischte Zahlen: https://www.oebv.at/flippingbook/9783209111258/94/
- öbv, *Lösungswege 2*, Zusammenfassung Bruchrechnen: https://www.oebv.at/flippingbook/9783209122520/112/
- öbv, *Lösungswege 3*, Multiplizieren und Dividieren rationaler Zahlen: https://www.oebv.at/flippingbook/9783209111272/42/

Für neue Inhalte soll zuerst geprüft werden, ob die verwendeten Begriffe und Rechenwege zur österreichischen Schulbuchsprache passen.

## Rechenweg-Architektur

Die Grundrechnungsarten können einen strukturierten `solutionPlan` mitführen. Dieser beschreibt nicht bloß die Endlösung, sondern mathematische Zwischenschritte.

Beispiel Division:

```text
3/4 : 2/5
→ Kehrwert bilden / Division als Multiplikation anschreiben
→ wenn sinnvoll kürzen
→ multiplizieren
→ Endergebnis prüfen
```

In der Oberfläche wird dieser Ablauf als **eine horizontale Rechenzeile** dargestellt, zum Beispiel sinngemäß:

```text
3/4 : 2/5 = 3/4 · 5/2 = … = 15/8
```

Erledigte Schritte bleiben sichtbar; der nächste Eingabeschritt wird rechts angefügt. Dadurch ähnelt der Rechenweg einer Rechnung im Heft statt einer vertikalen Formularfolge. Auf kleinen Bildschirmen kann die Rechenzeile horizontal verschoben werden, ohne mathematische Elemente zu verkleinern.

`step-validator.js` prüft Zwischenschritte semantisch. Die UI kennt die mathematische Prüflogik nicht.

## Schwierigkeit und Unterstützung getrennt

Die mathematische Schwierigkeit einer Aufgabe und der Unterstützungsgrad sind bewusst getrennt.

Unterstützungsmodi:

- `guided`: geführter Rechenweg mit mehreren geprüften Zwischenschritten
- `partial`: nur zentrale strategische Zwischenschritte werden vorgegeben
- `free`: normale freie Ergebniseingabe

Aktuelle Regel in `support-engine.js`:

- Diagnose: freies Rechnen
- individuelles Training, unsicher: geführt
- individuelles Training, im Aufbau: teilweise geführt
- individuelles Training, sicher: frei
- Bruch-Mix: höchstens teilweise geführt bei weiterhin unsicheren Bereichen
- Abschlusscheck: freies Rechnen

Damit kann Unterstützung schrittweise ausgeblendet werden, ohne gleichzeitig die Zahlenwerte einfacher machen zu müssen.

## „So geht’s“-Erklärungen

`strategy-registry.js` enthält kurze Erklärungen für die zentralen Kompetenzen. Jede Erklärung besteht aus:

- einer Regel in österreichischer Fachsprache
- wenigen nachvollziehbaren Denkschritten
- einem Beispiel mit **anderen Zahlen als in der aktuellen Aufgabe**

Die Erklärung wird im Training bzw. Bruch-Mix über „So geht’s“ geöffnet. Ihre Nutzung zählt als Hilfe; dadurch wird eine danach gelöste Aufgabe nicht fälschlich als vollständig selbstständig gewertet.

## Aufgabengeneratoren und Wiederholungen

Zahlenwerte werden innerhalb didaktisch begrenzter Bereiche dynamisch erzeugt. Die Schwierigkeit beeinflusst unter anderem Nennerbereiche, gemeinsamen Nenner und das Auftreten unechter Ergebnisse.

Jede Aufgabe erhält eine inhaltliche Signatur. `generateTask()` kann zuletzt gezeigte Signaturen vermeiden; die Gedächtnislänge steht in `js/config.js` unter `recentTaskMemory`.

## Neuen Skill ergänzen

1. Skill-ID in `js/learning/skills.js` registrieren.
2. Generator implementieren oder erweitern.
3. Skill in `js/generators/registry.js` verbinden.
4. Passende Erklärung in `didactics/strategy-registry.js` ergänzen.
5. Falls ein geführter Rechenweg sinnvoll ist, einen strukturierten Lösungsplan ergänzen.
6. Gegebenenfalls neuen UI-Aufgabentyp implementieren.
7. Diagnose-, Training-, Mix- oder Abschlusslogik anpassen.
8. Tests ergänzen.

## Neue Rechenweg-Art ergänzen

Rechenweg-Pläne liegen nicht in der UI. Ein Plan definiert Schritte etwa mit:

```js
{
  id: 'make-like',
  kind: 'pair',
  operator: '+',
  expected: [leftFraction, rightFraction],
  prompt: 'Mache die Brüche zuerst gleichnamig.',
  displayTex: '...',
  keepInPartial: true
}
```

`CalculationLine` rendert diese Daten. `step-validator.js` prüft die Eingaben. Dadurch können später Rechenwege für Prozentrechnung, Terme oder Gleichungen mit eigenen Schrittarten ergänzt werden, ohne die gesamte Aufgabenoberfläche neu zu schreiben.

## Fehlkonzept-Regeln

`js/learning/misconception-engine.js` enthält typische Fehlerregeln. Die Feedback-Engine ist von UI und Generatoren getrennt. Neue Regeln sollen möglichst erklären, **welcher Denkfehler wahrscheinlich vorliegt**, statt nur „falsch“ zurückzugeben.

## Speicherung

`LocalStorageAdapter` speichert den Sitzungsstand lokal. `RemoteStorageAdapter` ist vorbereitet; seine URL wird ausschließlich in `js/config.js` konfiguriert. Es dürfen keine geheimen Schlüssel in GitHub-Pages-Browsercode gespeichert werden.

Am Ende können unter anderem Diagnose, Abschluss, Kompetenzstände, Fehlversuche, Hilfen, Fehlkonzepte und Bearbeitungsdauer exportiert werden. Es wird keine automatische Schulnote erzeugt.

## Qualitätssicherung

`npm test` prüft aktuell:

- Syntax zentraler Browsermodule
- mathematische Fraction-Core-Funktionen
- Generator-Smoke-Tests und Aufgabenvielfalt
- strukturierte Rechenweg-Pläne
- semantische Zwischenschrittprüfung
- Auswahl des Unterstützungsgrads

GitHub Actions führt diese Tests bei Änderungen automatisch aus.

## Bekannte Erweiterungspunkte

- Geführte horizontale Rechenwege sind zunächst für die vier Grundrechnungsarten umgesetzt. Dieselbe Architektur kann anschließend auf Kürzen, Erweitern, gemischte Zahlen sowie Bruchteil/Ganzes ausgeweitet werden.
- Die Adaptivität ist regelbasiert, nicht statistisch oder KI-basiert.
- Zahlenstrahl-Ableseaufgaben können noch stärker ausgebaut werden.
- Ordnen erfolgt zusätzlich über barrierearme Links-/Rechts-Steuerung.
- Remote-Speicherung ist ohne konfigurierte URL absichtlich deaktiviert.
