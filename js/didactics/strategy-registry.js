const STRATEGIES={
  fraction_meaning:{
    title:'Zähler und Nenner verstehen',
    rule:'Der Nenner zeigt, in wie viele gleich große Teile das Ganze geteilt wird. Der Zähler zeigt, wie viele dieser Teile gemeint sind.',
    steps:['Lies zuerst den Nenner: So viele gleich große Teile gibt es insgesamt.','Lies dann den Zähler: So viele Teile werden betrachtet.'],
    exampleTex:'\\frac{3}{5}:\\quad 5\\text{ gleich große Teile, davon }3\\text{ gemeint}'
  },
  proper_improper:{
    title:'Brucharten unterscheiden',
    rule:'Bei einem echten Bruch ist der Zähler kleiner als der Nenner. Bei einem unechten Bruch ist der Zähler größer oder gleich dem Nenner. Ist der Zähler durch den Nenner teilbar, liegt ein uneigentlicher Bruch vor.',
    steps:['Vergleiche Zähler und Nenner.','Prüfe bei einem Bruch mit Zähler ≥ Nenner zusätzlich, ob die Division ohne Rest aufgeht.'],
    exampleTex:'\\frac{3}{5}\\text{ echt},\\qquad\\frac{7}{4}\\text{ unecht},\\qquad\\frac{8}{4}=2\\text{ uneigentlich}'
  },
  mixed_numbers:{
    title:'Gemischte Zahl und unechter Bruch',
    rule:'Eine gemischte Zahl kann als unechter Bruch geschrieben werden. Umgekehrt kann ein unechter Bruch als gemischte Zahl dargestellt werden.',
    steps:['Gemischt → unecht: Ganze mit dem Nenner multiplizieren und den Zähler dazuzählen.','Unecht → gemischt: Zähler durch Nenner dividieren; der Rest wird zum neuen Zähler.'],
    exampleTex:'2\\,\\frac{3}{5}=\\frac{2\\cdot5+3}{5}=\\frac{13}{5}'
  },
  simplify:{
    title:'Brüche kürzen',
    rule:'Beim Kürzen werden Zähler und Nenner durch dieselbe Zahl dividiert. Der Wert des Bruchs bleibt gleich.',
    steps:['Finde einen gemeinsamen Teiler von Zähler und Nenner.','Dividiere Zähler und Nenner durch dieselbe Zahl.','Prüfe, ob der Bruch noch weiter gekürzt werden kann.'],
    exampleTex:'\\frac{18}{24}=\\frac{18:6}{24:6}=\\frac{3}{4}'
  },
  expand:{
    title:'Brüche erweitern',
    rule:'Beim Erweitern werden Zähler und Nenner mit derselben Zahl multipliziert. Der Wert des Bruchs bleibt gleich.',
    steps:['Bestimme den Erweiterungsfaktor.','Multipliziere Zähler und Nenner mit diesem Faktor.'],
    exampleTex:'\\frac{2}{3}=\\frac{2\\cdot4}{3\\cdot4}=\\frac{8}{12}'
  },
  equivalence:{
    title:'Gleichwertige Brüche erkennen',
    rule:'Gleichwertige Brüche haben denselben Wert. Sie entstehen zum Beispiel durch Erweitern oder Kürzen.',
    steps:['Prüfe, ob Zähler und Nenner mit demselben Faktor verändert wurden.','Alternativ kannst du beide Brüche vollständig kürzen und vergleichen.'],
    exampleTex:'\\frac{3}{4}=\\frac{6}{8}=\\frac{9}{12}'
  },
  compare:{
    title:'Brüche vergleichen',
    rule:'Brüche lassen sich besonders leicht vergleichen, wenn sie gleichnamig sind. Oft hilft auch der Vergleich mit bekannten Größen wie 1/2 oder 1.',
    steps:['Prüfe zuerst, ob ein schneller Vergleich möglich ist.','Sonst mache die Brüche gleichnamig.','Vergleiche danach die Zähler.'],
    exampleTex:'\\frac{2}{3}=\\frac{8}{12}<\\frac{9}{12}=\\frac{3}{4}'
  },
  order:{
    title:'Brüche ordnen',
    rule:'Zum Ordnen vergleichst du die Brüche systematisch. Ein gemeinsamer Nenner kann mehrere Brüche direkt vergleichbar machen.',
    steps:['Suche zuerst leicht erkennbare Größen, etwa kleiner oder größer als 1/2 bzw. 1.','Mache die übrigen Brüche bei Bedarf gleichnamig.','Ordne dann von klein nach groß oder umgekehrt.'],
    exampleTex:'\\frac{1}{2}<\\frac{2}{3}<\\frac{3}{4}<\\frac{5}{6}'
  },
  number_line:{
    title:'Brüche am Zahlenstrahl',
    rule:'Am Zahlenstrahl ist jeder Bruch eine Zahl. Der Nenner hilft zu erkennen, in wie viele gleich große Schritte ein Ganzes geteilt wird.',
    steps:['Bestimme zuerst, zwischen welchen ganzen Zahlen der Bruch liegt.','Teile den passenden Abschnitt entsprechend dem Nenner in gleich große Schritte.','Zähle so viele Schritte, wie der Zähler angibt.'],
    exampleTex:'\\frac{5}{4}=1\\,\\frac{1}{4}'
  },
  fraction_to_decimal:{
    title:'Bruch in Dezimalzahl umwandeln',
    rule:'Der Bruchstrich bedeutet Division. Teile den Zähler durch den Nenner.',
    steps:['Lies den Bruch als Division.','Berechne Zähler : Nenner.','Schreibe im deutschen UI das Dezimalkomma.'],
    exampleTex:'\\frac{3}{4}=3:4=0{,}75'
  },
  decimal_to_fraction:{
    title:'Dezimalzahl in Bruch umwandeln',
    rule:'Schreibe die Dezimalzahl zuerst als Zehntel, Hundertstel oder Tausendstel und kürze danach vollständig.',
    steps:['Eine Nachkommastelle → Zehntel, zwei → Hundertstel, drei → Tausendstel.','Schreibe die Zahl als Bruch.','Kürze vollständig.'],
    exampleTex:'0{,}75=\\frac{75}{100}=\\frac{3}{4}'
  },
  add:{
    title:'Brüche addieren',
    rule:'Brüche müssen vor dem Addieren gleichnamig sein. Danach werden die Zähler addiert; der Nenner bleibt gleich.',
    steps:['Falls nötig: gemeinsamen Nenner finden.','Brüche passend erweitern und damit gleichnamig machen.','Zähler addieren.','Ergebnis vollständig kürzen.'],
    exampleTex:'\\frac{2}{3}+\\frac{1}{4}=\\frac{8}{12}+\\frac{3}{12}=\\frac{11}{12}'
  },
  subtract:{
    title:'Brüche subtrahieren',
    rule:'Brüche müssen vor dem Subtrahieren gleichnamig sein. Danach werden die Zähler subtrahiert; der Nenner bleibt gleich.',
    steps:['Falls nötig: gemeinsamen Nenner finden.','Brüche passend erweitern und damit gleichnamig machen.','Zähler subtrahieren.','Ergebnis vollständig kürzen.'],
    exampleTex:'\\frac{5}{6}-\\frac{1}{4}=\\frac{10}{12}-\\frac{3}{12}=\\frac{7}{12}'
  },
  multiply:{
    title:'Brüche multiplizieren',
    rule:'Beim Multiplizieren werden Zähler mit Zähler und Nenner mit Nenner multipliziert. Wenn möglich, kann schon vor dem Multiplizieren gekürzt werden.',
    steps:['Prüfe, ob sich Zähler und Nenner über Kreuz kürzen lassen.','Multipliziere die Zähler.','Multipliziere die Nenner.','Prüfe das Ergebnis nochmals auf vollständiges Kürzen.'],
    exampleTex:'\\frac{2}{3}\\cdot\\frac{9}{10}=\\frac{1}{1}\\cdot\\frac{3}{5}=\\frac{3}{5}'
  },
  divide:{
    title:'Brüche dividieren',
    rule:'Beim Dividieren wird der erste Bruch mit dem Kehrwert des zweiten Bruchs multipliziert.',
    steps:['Bilde den Kehrwert des zweiten Bruchs.','Schreibe die Division als Multiplikation an.','Kürze, wenn möglich, vor dem Multiplizieren.','Multipliziere und prüfe, ob das Ergebnis vollständig gekürzt ist.'],
    exampleTex:'\\frac{3}{4}:\\frac{2}{5}=\\frac{3}{4}\\cdot\\frac{5}{2}=\\frac{15}{8}'
  },
  fraction_of_quantity:{
    title:'Bruchteil einer Zahl',
    rule:'Um einen Bruchteil einer Zahl zu berechnen, wird zuerst durch den Nenner dividiert und danach mit dem Zähler multipliziert.',
    steps:['Teile die Zahl durch den Nenner. Damit erhältst du einen Teil.','Multipliziere diesen Teil mit dem Zähler.'],
    exampleTex:'\\frac{3}{4}\\text{ von }20:\\quad20:4=5,\\quad5\\cdot3=15'
  },
  whole_from_part:{
    title:'Das Ganze bestimmen',
    rule:'Wenn ein Bruchteil gegeben ist, wird zuerst der Wert eines Teils bestimmt und danach auf alle Teile hochgerechnet.',
    steps:['Teile den gegebenen Wert durch den Zähler. Damit erhältst du einen Teil.','Multipliziere den Wert eines Teils mit dem Nenner.'],
    exampleTex:'\\frac{3}{4}\\text{ sind }18:\\quad18:3=6,\\quad6\\cdot4=24'
  },
  error_analysis:{
    title:'Fehler in einem Rechenweg finden',
    rule:'Bei der Fehleranalyse suchst du nicht nur das falsche Ergebnis, sondern den ersten Rechenschritt, an dem eine Regel verletzt wurde.',
    steps:['Lies den Rechenweg von links nach rechts.','Prüfe jeden Schritt gegen die passende Rechenregel.','Beschreibe möglichst genau, was falsch gemacht wurde.'],
    exampleTex:'\\frac{2}{3}+\\frac{1}{4}\\ne\\frac{3}{7}'
  },
  plausibility:{
    title:'Ergebnisse auf Plausibilität prüfen',
    rule:'Oft kann man erkennen, dass ein Ergebnis nicht stimmen kann, ohne die ganze Rechnung neu auszurechnen.',
    steps:['Schätze die Größe der Ausgangszahlen.','Überlege, ob das Ergebnis größer oder kleiner sein müsste.','Vergleiche mit 0, 1/2 oder 1, wenn das hilfreich ist.'],
    exampleTex:'\\frac{3}{4}+\\frac{1}{2}>\\frac{3}{4}'
  }
};

export function getStrategy(skill){return STRATEGIES[skill]||null}
export function hasStrategy(skill){return Boolean(STRATEGIES[skill])}
