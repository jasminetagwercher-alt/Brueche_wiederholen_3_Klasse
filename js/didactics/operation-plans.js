import {Fraction,gcd,lcm} from '../core/fraction.js';

function tex(f){return `\\frac{${f.numerator}}{${f.denominator}}`}
function pairTex(a,op,b){return `${tex(a)} ${op} ${tex(b)}`}
function rawFraction(n,d){return new Fraction(n,d)}

function cancelPair(a,b){
  const g1=gcd(Math.abs(a.numerator),b.denominator);
  const g2=gcd(Math.abs(b.numerator),a.denominator);
  return {
    changed:g1>1||g2>1,
    left:rawFraction(a.numerator/g1,a.denominator/g2),
    right:rawFraction(b.numerator/g2,b.denominator/g1)
  };
}

function addSubtractPlan(skill,a,b,result){
  const symbol=skill==='add'?'+':'-';
  const common=lcm(a.denominator,b.denominator);
  const left=rawFraction(a.numerator*(common/a.denominator),common);
  const right=rawFraction(b.numerator*(common/b.denominator),common);
  const rawNumerator=skill==='add'?left.numerator+right.numerator:left.numerator-right.numerator;
  const raw=rawFraction(rawNumerator,common);
  const steps=[];
  if(a.denominator!==b.denominator){
    steps.push({id:'make-like',kind:'pair',operator:symbol,expected:[left,right],prompt:`Mache die Brüche zuerst gleichnamig. Verwende den kleinsten sinnvollen gemeinsamen Nenner.`,success:'Die Brüche sind richtig gleichnamig gemacht.',displayTex:pairTex(left,symbol,right),keepInPartial:true});
  }
  steps.push({id:'combine',kind:'fraction',expected:raw,prompt:`Rechne jetzt die Zähler ${skill==='add'?'zusammen':'voneinander ab'}. Der Nenner bleibt gleich.`,success:'Dieser Rechenschritt stimmt.',displayTex:tex(raw),keepInPartial:false,exactRepresentation:true});
  if(!raw.isReduced())steps.push({id:'reduce',kind:'fraction',expected:result,prompt:'Kürze das Ergebnis vollständig.',success:'Vollständig gekürzt.',displayTex:tex(result),keepInPartial:true,requireReduced:true});
  else steps[steps.length-1].keepInPartial=true;
  return {skill,originalTex:pairTex(a,symbol,b),steps,finalAnswer:result};
}

function multiplyPlan(a,b,result){
  const cancelled=cancelPair(a,b),steps=[];
  if(cancelled.changed){
    steps.push({id:'cancel',kind:'pair',operator:'\\cdot',expected:[cancelled.left,cancelled.right],prompt:'Kürze, wenn möglich, vor dem Multiplizieren.',success:'Richtig gekürzt. Jetzt sind die Zahlen kleiner.',displayTex:pairTex(cancelled.left,'\\cdot',cancelled.right),keepInPartial:true,exactRepresentation:true});
  }
  const left=cancelled.changed?cancelled.left:a,right=cancelled.changed?cancelled.right:b;
  const raw=rawFraction(left.numerator*right.numerator,left.denominator*right.denominator);
  steps.push({id:'multiply',kind:'fraction',expected:raw,prompt:'Multipliziere Zähler mit Zähler und Nenner mit Nenner.',success:'Das Produkt stimmt.',displayTex:tex(raw),keepInPartial:false,exactRepresentation:true});
  if(!raw.isReduced())steps.push({id:'reduce',kind:'fraction',expected:result,prompt:'Kürze das Ergebnis vollständig.',success:'Vollständig gekürzt.',displayTex:tex(result),keepInPartial:true,requireReduced:true});
  else steps[steps.length-1].keepInPartial=true;
  return {skill:'multiply',originalTex:pairTex(a,'\\cdot',b),steps,finalAnswer:result};
}

function dividePlan(a,b,result){
  const reciprocal=rawFraction(b.denominator,b.numerator);
  const steps=[{id:'reciprocal',kind:'right-fraction',left:a,operator:'\\cdot',expected:reciprocal,prompt:'Bilde den Kehrwert des zweiten Bruchs und schreibe die Division als Multiplikation an.',success:'Kehrwert richtig gebildet.',displayTex:pairTex(a,'\\cdot',reciprocal),keepInPartial:true,exactRepresentation:true}];
  const cancelled=cancelPair(a,reciprocal);
  if(cancelled.changed){
    steps.push({id:'cancel',kind:'pair',operator:'\\cdot',expected:[cancelled.left,cancelled.right],prompt:'Kürze, wenn möglich, vor dem Multiplizieren.',success:'Richtig gekürzt.',displayTex:pairTex(cancelled.left,'\\cdot',cancelled.right),keepInPartial:false,exactRepresentation:true});
  }
  const left=cancelled.changed?cancelled.left:a,right=cancelled.changed?cancelled.right:reciprocal;
  const raw=rawFraction(left.numerator*right.numerator,left.denominator*right.denominator);
  steps.push({id:'multiply',kind:'fraction',expected:raw,prompt:'Multipliziere jetzt Zähler mit Zähler und Nenner mit Nenner.',success:'Das Ergebnis stimmt.',displayTex:tex(raw),keepInPartial:false,exactRepresentation:true});
  if(!raw.isReduced())steps.push({id:'reduce',kind:'fraction',expected:result,prompt:'Kürze das Ergebnis vollständig.',success:'Vollständig gekürzt.',displayTex:tex(result),keepInPartial:true,requireReduced:true});
  else steps[steps.length-1].keepInPartial=true;
  return {skill:'divide',originalTex:pairTex(a,':',b),steps,finalAnswer:result};
}

export function buildOperationSolutionPlan(skill,a,b,result){
  if(skill==='add'||skill==='subtract')return addSubtractPlan(skill,a,b,result);
  if(skill==='multiply')return multiplyPlan(a,b,result);
  if(skill==='divide')return dividePlan(a,b,result);
  return null;
}
