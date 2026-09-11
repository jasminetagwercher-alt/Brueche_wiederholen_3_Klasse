# Task Sheets – sichtbare Aufgabenmenge

Bruch-Check verwendet ab Version 4 für Schnellcheck, Missionen und Final Check ein **Task-Sheet-Prinzip**.

## Ziel

Schülerinnen und Schüler sollen nicht das Gefühl haben, dass das Programm unbegrenzt neue Aufgaben nachliefert. Vor dem Start eines Blocks werden deshalb alle konkreten Aufgaben dieses Blocks erzeugt und gemeinsam angezeigt.

Die Oberfläche bietet drei Ebenen:

1. **Gesamtweg:** Schnellcheck → Missionen → Final Check
2. **Missions-Dashboard:** alle Kompetenzbereiche, Empfehlungen und überspringbare sichere Bereiche
3. **Task Sheet:** alle konkreten Aufgaben der aktuellen Mission bzw. des Checks

## Verhalten

- Alle Aufgaben eines Blocks werden vor der Bearbeitung erzeugt.
- Die konkreten Zahlenwerte sind auf dem Task Sheet sichtbar.
- Schülerinnen und Schüler können Aufgaben in beliebiger Reihenfolge öffnen.
- Schwierige Aufgaben können zunächst ausgelassen und später bearbeitet werden.
- Erledigte Aufgaben werden mit einem Häkchen markiert.
- Während einer Aufgabe bleibt eine nummerierte Navigation zu allen Aufgaben sichtbar.
- Über **Alle Aufgaben ansehen** ist das Task Sheet jederzeit erreichbar.
- Eingaben werden beim Wechsel zwischen Aufgaben als Entwurf gespeichert.
- Aufgaben werden nicht neu generiert, wenn die Seite neu geladen wird.
- Nach Reload werden gespeicherte Brüche wieder als `Fraction`-Objekte hergestellt.

## Technische Trennung

- `js/learning/task-sets.js`: Erzeugen, Wiederherstellen und Fortschrittslogik für feste Aufgabensätze
- `js/ui/task-sheet.js`: Task-Sheet und permanente Aufgaben-Navigation
- `js/app.js`: koordiniert Wechsel zwischen Dashboard, Task Sheet und Einzelaufgabe
- `js/storage/local-storage.js`: stellt gespeicherte Fraction-Werte nach Reload wieder her

Die Aufgabengeneratoren bleiben unverändert modular. Das Task Sheet friert lediglich die für einen konkreten Durchgang erzeugten Aufgaben ein.

## Bewertung

Schnellcheck und Final Check werden pro Aufgabe anhand des **ersten bewertbaren Versuchs** ausgewertet. Ein späteres Wiederholen bereits gelöster Aufgaben verändert den Check-Wert dadurch nicht künstlich.
