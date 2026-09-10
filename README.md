# Bruch-Check – Bruchrechnen wiederholen

Interaktive, diagnostische und adaptive Lernplattform für die 3. Klasse Mittelschule Österreich. Version 1 ist als statische GitHub-Pages-Anwendung ohne Build-Schritt konzipiert.

## Funktionen

- vier klar sichtbare Phasen: Bruch-Check, individuelles Training, Bruch-Mix, Abschlusscheck
- Lernstrecken-Übersicht und Abschnittsnavigation
- kurze Konzentrationsstopps etwa alle fünf Aufgaben sowie ein deutlicher Übergang nach jeder Phase
- exakte zentrale Bruchrechnung über `Fraction`
- echte/unechte Brüche und gemischte Zahlen
- Kürzen, Erweitern und Äquivalenz
- Vergleichen und Ordnen
- interaktiver Zahlenstrahl mit Raster-Snapping und Tastaturbedienung
- Bruch ↔ Dezimalzahl
- Bruchteil einer Zahl und Ganzes aus Bruchteil
- Addition, Subtraktion, Multiplikation und Division
- gestufte Hilfen
- einfache Fehlkonzept-Erkennung
- Kompetenzmodell und regelbasierte Adaptivität
- dynamische Aufgabengeneratoren mit Schwierigkeitsstufen und Sperre gegen zu frühe Wiederholungen
- lokaler Sitzungsstand per `localStorage`
- vorbereitete Remote-Speicherschnittstelle
- JSON-Ergebnisexport
- KaTeX-Darstellung
- automatische Core- und Generator-Smoke-Tests über GitHub Actions

## Lokale Nutzung

Da ES Modules verwendet werden, sollte die Anwendung über einen kleinen lokalen Webserver geöffnet werden und nicht direkt per `file://`.

Beispiel:

```bash
python -m http.server 8000
```

Danach `http://localhost:8000` öffnen.

Die Tests benötigen nur Node.js:

```bash
npm test
```

Es werden keine npm-Pakete installiert; der Testbefehl verwendet ausschließlich Node-Bordmittel.

## GitHub Pages

1. Repository auf GitHub öffnen.
2. **Settings → Pages**.
3. Als Quelle **Deploy from a branch** wählen.
4. Branch `main`, Ordner `/ (root)` auswählen.
5. Speichern.

Die Anwendung benötigt keinen Build-Schritt. `index.html` liegt im Repository-Root. KaTeX wird über jsDelivr geladen; Schülergeräte benötigen deshalb beim ersten Laden Internetzugriff.

## Projektstruktur

```text
/
├─ index.html
├─ css/
│  └─ main.css
├─ js/
│  ├─ app.js                  # Ablaufkoordination
│  ├─ config.js               # zentrale Konfiguration
│  ├─ core/
│  │  ├─ fraction.js          # exakte Bruchrechnung
│  │  └─ answer-validator.js  # semantische Antwortprüfung
│  ├─ generators/
│  │  ├─ registry.js          # verbindet Skills mit Generatoren
│  │  ├─ generator-utils.js   # Zufall, Signaturen, Wiederholungssperre
│  │  ├─ basic.js
│  │  ├─ conversions.js
│  │  ├─ operations.js
│  │  └─ compare-order.js
│  ├─ learning/
│  │  ├─ skills.js
│  │  ├─ adaptive-engine.js
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
│     └─ number-line.js
├─ tests/
│  ├─ fraction.test.mjs
│  └─ generators.test.mjs
└─ .github/workflows/tests.yml
```

## Lernfluss und Pausen

Die Anwendung soll nicht als lange ununterbrochene Aufgabenserie wirken. Jede Phase besitzt eine sichtbare Position in der Lernstrecke. Innerhalb längerer Phasen wird nach einer konfigurierbaren Anzahl von Aufgaben ein kurzer Stopp angezeigt. Der Schüler entscheidet selbst, wann er fortsetzt. Nach jeder Phase folgt eine eigene Abschluss- und Übergangsseite.

Die Anzahl der Aufgaben zwischen zwei Stopps wird zentral in `js/config.js` über `breakEvery` festgelegt. Die Übersicht kann während der Bearbeitung geöffnet werden; abgeschlossene Phasen und die aktuelle Position bleiben sichtbar.

## Mathematische Architektur

Alle Brüche werden zentral als `Fraction` mit ganzzahligem `numerator` und `denominator` behandelt. Die Kernoperationen normalisieren Vorzeichen, verbieten Nenner 0 und reduzieren Ergebnisse exakt. Vergleich und Äquivalenz basieren auf Kreuzmultiplikation statt auf gerundeten Dezimalwerten. Dezimaleingaben werden zunächst als rationale Zahl rekonstruiert.

Generatoren dürfen mathematische Operationen nicht selbst nachimplementieren. Sie erzeugen nur Aufgabenparameter und verwenden die Core-Engine für Ergebnisse.

## Aufgabengeneratoren und Wiederholungen

Version 1 verwendet keine kleinen festen Listen als primäre Aufgabenquelle. Zahlenwerte werden innerhalb didaktisch begrenzter Bereiche dynamisch erzeugt. Die Schwierigkeit beeinflusst unter anderem Nennerbereiche, gemeinsamen Nenner und das Auftreten unechter Ergebnisse.

Jede erzeugte Aufgabe erhält eine inhaltliche Signatur. `generateTask()` kann eine Liste zuletzt gezeigter Signaturen erhalten und erzeugt dann eine neue Variante. Die Länge dieses Gedächtnisses wird in `js/config.js` über `recentTaskMemory` gesteuert. Dadurch werden identische Zahlenkombinationen nicht unnötig kurz hintereinander wiederholt.

## Neuen Skill ergänzen

1. Neue Skill-ID in `js/learning/skills.js` registrieren.
2. Einen Generator implementieren oder einen bestehenden Generator erweitern.
3. `generateTask()` in `js/generators/registry.js` mit der neuen Skill-ID verbinden.
4. Falls nötig einen neuen UI-Aufgabentyp ergänzen.
5. Diagnose-, Mix- oder Abschluss-Sequenz in `adaptive-engine.js` erweitern.
6. Tests ergänzen.

Die Skill-ID sollte dauerhaft stabil bleiben, weil sie in gespeicherten Ergebnisdaten vorkommt.

## Neuen Aufgabengenerator ergänzen

Ein Generator soll ein Task-Objekt mit mindestens folgenden Feldern liefern:

```js
{
  id,
  skill,
  difficulty,
  type,
  answerType,
  promptText,
  promptTex,
  correctAnswer,
  hints,
  solutionSteps
}
```

Optionale Metadaten wie `operands`, `requireReduced`, `meta` oder Komponenten-Konfigurationen können ergänzt werden. Die Antwortprüfung soll nicht im Generator dupliziert werden. Neue dynamische Generatoren sollten über `generator-utils.js` eine Aufgabe-Signatur erhalten und in `generators.test.mjs` mindestens mit einem Smoke-Test abgedeckt werden.

## Neue Fehlkonzept-Regel ergänzen

`js/learning/misconception-engine.js` enthält die Regeln. Eine Regel erhält die Aufgabe und die semantisch geparste Schülerantwort und gibt bei Treffer z. B. zurück:

```js
{
  id: 'divide_no_reciprocal',
  message: '...'
}
```

Die UI kennt die konkrete Regel nicht; sie zeigt nur das Feedback der Engine an.

## Adaptivität

Version 1 verwendet bewusst transparente Regeln:

- unsichere Skills werden stärker gewichtet
- sichere Skills werden seltener eingestreut
- unmittelbar wiederholte Skills werden abgewertet
- zwei sichere Lösungen können die Schwierigkeit erhöhen
- wiederholte Fehler können sie senken
- zuletzt gezeigte konkrete Aufgabenvarianten werden zusätzlich über ihre Signatur vermieden

Die Skill-Auswahl liegt in `js/learning/adaptive-engine.js`; die Vermeidung konkreter Aufgabenwiederholungen liegt in der Generator-Schicht. Beide Mechanismen können unabhängig weiterentwickelt werden.

## Speicherung und späterer Google-Sheets-Anschluss

`LocalStorageAdapter` speichert den aktuellen Sitzungsstand lokal im Browser. Die Anwendung kann nach einem Reload fortgesetzt werden. Auch Lernphase, Aufgabensequenz, bereits angezeigte Aufgaben-Signaturen und absolvierte Pausen werden gespeichert.

`RemoteStorageAdapter` ist bereits vorbereitet. Die URL wird ausschließlich in `js/config.js` über `remoteStorageUrl` konfiguriert. Solange sie leer ist, arbeitet Bruch-Check vollständig lokal.

Für eine spätere Google-Apps-Script-/Google-Sheets-Anbindung sollte der Endpoint JSON entgegennehmen und keine geheimen Schlüssel im Frontend verlangen. GitHub Pages ist öffentlich; Secrets dürfen daher niemals in `config.js` oder anderem Browsercode gespeichert werden.

## Ergebnisdaten

Am Ende werden u. a. exportiert:

- Zeitstempel und Session-ID
- Name/Kürzel und Klasse
- Diagnose- und Abschlusswert
- Kompetenzdaten je Skill
- Fehlversuche
- Hilfen
- erkannte Fehlkonzepte
- absolvierte Konzentrationsstopps
- Bearbeitungsdauer

Die Anwendung erzeugt bewusst keine automatische Schulnote.

## Erweiterung auf weitere Mathematikthemen

Die aktuelle Trennung von Mathematik-Core, Generatoren, Skills, Adaptivität, Feedback/UI, Navigation und Storage ist darauf ausgelegt, später Themen wie Prozentrechnung, rationale Zahlen, Terme oder Gleichungen hinzuzufügen. Dabei soll die Bruch-Engine als eigenständiges Modul bestehen bleiben und `app.js` weiterhin primär den Ablauf koordinieren.

## Bekannte Grenzen von Version 1

- Die Adaptivität ist regelbasiert, nicht statistisch oder KI-basiert.
- Der Zahlenstrahl verwendet in Version 1 hauptsächlich das Platzieren; der Komponentenmodus für das Ablesen markierter Werte kann in weiteren Generatoren stärker genutzt werden.
- Ordnung erfolgt barriereärmer über Links-/Rechts-Buttons statt ausschließlich über Drag-and-Drop.
- Remote-Speicherung ist vorbereitet, aber ohne konfigurierte URL absichtlich deaktiviert.

Diese Grenzen sind Erweiterungspunkte und keine Platzhalterbuttons in der Schüleroberfläche.
