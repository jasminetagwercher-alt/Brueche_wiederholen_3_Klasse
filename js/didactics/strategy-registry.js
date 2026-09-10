const STRATEGIES={
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
  mixed_numbers:{
    title:'Gemischte Zahl und unechter Bruch',
    rule:'Eine gemischte Zahl kann als unechter Bruch geschrieben werden. Umgekehrt kann ein unechter Bruch als gemischte Zahl dargestellt werden.',
    steps:['Gemischt → unecht: Ganze mit dem Nenner multiplizieren und den Zähler dazuzählen.','Unecht → gemischt: Zähler durch Nenner dividieren; der Rest wird zum neuen Zähler.'],
    exampleTex:'2\\,\\frac{3}{5}=\\frac{2\\cdot5+3}{5}=\\frac{13}{5}'
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
    exampleTex:'\\frac{3}{4}\\text{ von }20:\quad20:4=5,\\quad5\\cdot3=15'
  },
  whole_from_part:{
    title:'Das Ganze bestimmen',
    rule:'Wenn ein Bruchteil gegeben ist, wird zuerst der Wert eines Teils bestimmt und danach auf alle Teile hochgerechnet.',
    steps:['Teile den gegebenen Wert durch den Zähler. Damit erhältst du einen Teil.','Multipliziere einen Teil mit dem Nenner.'],
    exampleTex:'\\frac{3}{4}\\text{ sind }18:\quad18:3=6,\\quad6\\cdot4=24'
  }
};

export function getStrategy(skill){return STRATEGIES[skill]||null}
export function hasStrategy(skill){return Boolean(STRATEGIES[skill])}
