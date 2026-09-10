import {Fraction} from '../core/fraction.js';
import {makeId,pick,randomReducedFraction,shuffle} from './generator-utils.js';

export function generateOrder(difficulty=1){
  const values=[];
  while(values.length<4){
    const f=randomReducedFraction({minDen:2,maxDen:difficulty>2?10:8,allowImproper:difficulty>2,minValue:.2,maxValue:difficulty>2?1.6:.95});
    if(!values.some(x=>x.equals(f)))values.push(f);
  }
  const sorted=[...values].sort((a,b)=>a.compare(b));let shuffled=shuffle(values);
  if(shuffled.every((x,i)=>x.equals(sorted[i])))shuffled=shuffle(values);
  return{id:makeId('order'),skill:'order',difficulty,type:'order',answerType:'order',promptText:'Ordne die Brüche von klein nach groß.',items:shuffled,correctAnswer:sorted,hints:['Suche zuerst Ankerwerte: kleiner oder größer als 1/2? kleiner oder größer als 1?','Vergleiche danach nur noch die Brüche, deren Reihenfolge noch unklar ist.'],solutionSteps:sorted.map(f=>`\\frac{${f.numerator}}{${f.denominator}}`)};
}

const errorPatterns=[
  {tex:'\\frac{2}{3}+\\frac{1}{4}=\\frac{3}{7}',correct:'addParts',options:[['addParts','Zähler und Nenner wurden getrennt addiert.'],['reduce','Es wurde falsch gekürzt.'],['reciprocal','Der Kehrwert fehlt.']],hint:'Beim Addieren müssen die Bruchteile zuerst gleich groß gemacht werden.'},
  {tex:'\\frac{3}{4}-\\frac{1}{2}=\\frac{2}{2}',correct:'subtractParts',options:[['subtractParts','Zähler und Nenner wurden getrennt subtrahiert.'],['multiply','Die Brüche wurden multipliziert.'],['reduce','Nur das Kürzen ist falsch.']],hint:'Prüfe, ob Zähler und Nenner einfach getrennt voneinander verrechnet wurden.'},
  {tex:'\\frac{3}{4}:\\frac{2}{5}=\\frac{6}{20}',correct:'noReciprocal',options:[['noReciprocal','Es wurde ohne Kehrwert multipliziert.'],['addParts','Zähler und Nenner wurden addiert.'],['mixed','Die gemischte Zahl wurde falsch umgewandelt.']],hint:'Bei einer Division von Brüchen wird der zweite Bruch verändert.'},
  {tex:'3\\,\\frac{2}{5}=\\frac{15}{5}',correct:'missingRemainder',options:[['missingRemainder','Der Restzähler 2 wurde vergessen.'],['denominator','Der Nenner müsste 3 sein.'],['reciprocal','Der Kehrwert wurde vergessen.']],hint:'Nach Ganze · Nenner ist die Umwandlung noch nicht fertig.'}
];

const plausibilityPatterns=[
  {tex:'\\frac{3}{4}+\\frac{1}{2}=\\frac{5}{24}',answer:'nein',hint:'Zu 3/4 wird noch eine positive Zahl addiert. Das Ergebnis muss also größer als 3/4 sein.'},
  {tex:'\\frac{2}{3}\\cdot\\frac{1}{2}=\\frac{5}{6}',answer:'nein',hint:'Wenn du eine positive Zahl kleiner als 1 mit 1/2 multiplizierst, wird das Ergebnis kleiner, nicht größer.'},
  {tex:'\\frac{5}{6}-\\frac{1}{6}=\\frac{2}{3}',answer:'ja',hint:'Beide Brüche sind gleichnamig. Du kannst die Größenordnung schon ohne langen Rechenweg prüfen.'},
  {tex:'\\frac{3}{5}:\\frac{1}{5}=3',answer:'ja',hint:'Frage dich: Wie oft steckt 1/5 in 3/5?'}
];

export function generateThinking(skill='plausibility',difficulty=1){
  if(skill==='error_analysis'){
    const p=pick(errorPatterns);
    return{id:makeId(skill),skill,difficulty,type:'choice',answerType:'choice',promptText:'Welche Beschreibung trifft den Denkfehler am besten?',promptTex:p.tex,options:shuffle(p.options).map(([value,label])=>({value,label})),correctAnswer:p.correct,hints:[p.hint,'Beschreibe zuerst, welche Rechenregel hier eigentlich nötig wäre.']};
  }
  const p=pick(plausibilityPatterns);
  return{id:makeId(skill),skill,difficulty,type:'choice',answerType:'choice',promptText:'Ohne die Rechnung vollständig neu auszurechnen: Kann das Ergebnis stimmen?',promptTex:p.tex,options:[{value:'ja',label:'Ja, das ist plausibel.'},{value:'nein',label:'Nein, das kann so nicht stimmen.'}],correctAnswer:p.answer,hints:[p.hint]};
}
