import {Fraction,gcd,lcm} from '../core/fraction.js';
import {makeId,pick,randomInt,randomReducedFraction} from './generator-utils.js';

const F=(n,d)=>new Fraction(n,d);
function properWithDen(den){let n=randomInt(1,den-1);while(gcd(n,den)!==1)n=randomInt(1,den-1);return F(n,den)}
function cleanResult(result){const r=result.reduce();return Math.abs(r.numerator)<=36&&r.denominator<=30}
function manageableCommonDenominator(a,b){return lcm(a.denominator,b.denominator)<=30}

function addOperands(difficulty){
  if(difficulty<=1){const d=pick([5,7,8,9]);let a=properWithDen(d),b=properWithDen(d);while(a.numerator+b.numerator>=d){a=properWithDen(d);b=properWithDen(d)}return[a,b]}
  if(difficulty===2){const small=pick([2,3,4,5]),factor=pick([2,3]),large=small*factor;return[properWithDen(small),properWithDen(large)]}
  if(difficulty===3){for(let i=0;i<60;i++){const a=randomReducedFraction({minDen:3,maxDen:9}),b=randomReducedFraction({minDen:3,maxDen:9}),r=a.add(b);if(manageableCommonDenominator(a,b)&&cleanResult(r))return[a,b]}return[F(2,3),F(3,8)]}
  for(let i=0;i<60;i++){const a=randomReducedFraction({minDen:3,maxDen:10}),b=randomReducedFraction({minDen:3,maxDen:10}),r=a.add(b);if(r.numerator>r.denominator&&manageableCommonDenominator(a,b)&&cleanResult(r))return[a,b]}
  return[F(5,6),F(3,4)];
}

function subtractOperands(difficulty){
  for(let i=0;i<60;i++){
    let a,b;
    if(difficulty<=1){const d=pick([5,7,8,9]);a=properWithDen(d);b=properWithDen(d)}
    else if(difficulty===2){const small=pick([2,3,4,5]),large=small*pick([2,3]);a=properWithDen(small);b=properWithDen(large)}
    else{a=randomReducedFraction({minDen:3,maxDen:10,allowImproper:difficulty>3,minValue:.3,maxValue:difficulty>3?1.7:.95});b=randomReducedFraction({minDen:3,maxDen:10,minValue:.1,maxValue:.9})}
    if(a.compare(b)>0&&manageableCommonDenominator(a,b)&&cleanResult(a.subtract(b)))return[a,b];
  }
  return[F(5,6),F(1,4)];
}

function multiplyOperands(difficulty){
  for(let i=0;i<50;i++){
    const maxDen=difficulty<=1?6:10;
    const a=randomReducedFraction({minDen:2,maxDen}),b=randomReducedFraction({minDen:2,maxDen}),r=a.multiply(b);
    if(cleanResult(r))return[a,b];
  }
  return[F(2,3),F(3,5)];
}

function divideOperands(difficulty){
  for(let i=0;i<50;i++){
    const maxDen=difficulty<=1?6:10;
    const a=randomReducedFraction({minDen:2,maxDen}),b=randomReducedFraction({minDen:2,maxDen}),r=a.divide(b);
    if(cleanResult(r)&&r.toDecimal()<=4)return[a,b];
  }
  return[F(3,4),F(2,5)];
}

function solutionSteps(skill,a,b,result){
  if(skill==='add'||skill==='subtract'){
    const common=lcm(a.denominator,b.denominator),aNum=a.numerator*(common/a.denominator),bNum=b.numerator*(common/b.denominator),symbol=skill==='add'?'+':'-';
    return[`Gemeinsamer Nenner: ${common}`,`\\frac{${aNum}}{${common}} ${symbol} \\frac{${bNum}}{${common}}`,`Ergebnis vollständig gekürzt: \\frac{${result.numerator}}{${result.denominator}}`];
  }
  if(skill==='multiply')return[`Zähler: ${a.numerator}\\cdot${b.numerator}`,`Nenner: ${a.denominator}\\cdot${b.denominator}`,`Vollständig gekürzt: \\frac{${result.numerator}}{${result.denominator}}`];
  return[`Kehrwert des zweiten Bruchs: \\frac{${b.denominator}}{${b.numerator}}`,`Dann multiplizieren und kürzen.`,`Ergebnis: \\frac{${result.numerator}}{${result.denominator}}`];
}

export function generateOperation(skill,difficulty=1){
  const factories={add:addOperands,subtract:subtractOperands,multiply:multiplyOperands,divide:divideOperands};
  if(!factories[skill])return null;
  const [a,b]=factories[skill](difficulty),op={add:'+',subtract:'-',multiply:'\\cdot',divide:':' }[skill],result={add:a.add(b),subtract:a.subtract(b),multiply:a.multiply(b),divide:a.divide(b)}[skill];
  const hints={add:['Beim Addieren müssen die Teile gleich groß sein.','Finde einen gemeinsamen Nenner und erweitere beide Brüche passend.'],subtract:['Beim Subtrahieren müssen die Teile gleich groß sein.','Finde einen gemeinsamen Nenner und erweitere beide Brüche passend.'],multiply:['Multipliziere Zähler mit Zähler und Nenner mit Nenner.','Prüfe danach, ob du vollständig kürzen kannst.'],divide:['Beim Dividieren brauchst du den Kehrwert des zweiten Bruchs.','Multipliziere anschließend mit diesem Kehrwert.']}[skill];
  return{id:makeId(skill),skill,difficulty,type:'fraction',answerType:'fraction',promptText:'Berechne und kürze vollständig.',promptTex:`\\frac{${a.numerator}}{${a.denominator}} ${op} \\frac{${b.numerator}}{${b.denominator}}`,operands:[a,b],correctAnswer:result,requireReduced:true,hints,solutionSteps:solutionSteps(skill,a,b,result)};
}
