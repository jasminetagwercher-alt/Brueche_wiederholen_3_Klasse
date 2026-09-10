import {Fraction,fractionOfQuantity,wholeFromFractionPart,gcd} from '../core/fraction.js';
import {makeId,pick,randomInt,randomReducedFraction} from './generator-utils.js';

const F=(n,d)=>new Fraction(n,d);
const common=(skill,difficulty)=>({id:makeId(skill),skill,difficulty,hints:[],solutionSteps:[],requireReduced:false});

function finiteFraction(){
  const den=pick([2,4,5,8,10]);
  let num=randomInt(1,den-1);
  while(gcd(num,den)!==1)num=randomInt(1,den-1);
  return F(num,den);
}

export function generateBasic(skill,difficulty=1){
  const base=common(skill,difficulty);

  if(skill==='fraction_meaning'){
    const den=randomInt(4,10),num=randomInt(1,den-1),f=F(num,den);
    return{...base,type:'choice',answerType:'choice',promptTex:`\\frac{${num}}{${den}}`,promptText:'Welche Aussage beschreibt den Bruch richtig?',options:[{value:'a',label:`${num} von ${den} gleich großen Teilen werden betrachtet.`},{value:'b',label:`${den} von ${num} gleich großen Teilen werden betrachtet.`},{value:'c',label:'Der Zähler sagt, in wie viele gleich große Teile das Ganze geteilt wird.'}],correctAnswer:'a',hints:['Der Nenner beschreibt die Anzahl gleich großer Teile des Ganzen.','Der Zähler sagt, wie viele dieser Teile gemeint sind.']};
  }

  if(skill==='proper_improper'){
    const kind=pick(['echt','unecht','uneigentlich']);let f;
    if(kind==='echt'){const den=randomInt(3,10);f=F(randomInt(1,den-1),den)}
    else if(kind==='uneigentlich'){const den=randomInt(2,8);f=F(den*randomInt(1,3),den)}
    else{const den=randomInt(3,9);let num=randomInt(den+1,den*2+2);while(num%den===0)num++;f=F(num,den)}
    return{...base,type:'choice',answerType:'choice',promptTex:`\\frac{${f.numerator}}{${f.denominator}}`,promptText:'Welche Art von Bruch ist das?',options:[{value:'echt',label:'echter Bruch'},{value:'unecht',label:'unechter Bruch'},{value:'uneigentlich',label:'uneigentlicher Bruch'}],correctAnswer:kind,hints:['Vergleiche Zähler und Nenner.','Ein uneigentlicher Bruch ergibt eine ganze Zahl.']};
  }

  if(skill==='mixed_numbers'){
    const whole=randomInt(1,Math.min(4,difficulty+2)),den=randomInt(3,9),num=randomInt(1,den-1),improper=F(whole*den+num,den);
    if(Math.random()<0.5){
      return{...base,type:'fraction',answerType:'fraction',promptTex:`${whole}\\,\\frac{${num}}{${den}}`,promptText:'Wandle die gemischte Zahl in einen unechten Bruch um.',correctAnswer:improper,meta:{mode:'mixedToImproper',whole,denominator:den,numerator:num},hints:['Multipliziere die ganzen Teile mit dem Nenner.','Addiere danach den Zähler. Der Nenner bleibt gleich.'],solutionSteps:[`${whole}\\cdot${den}+${num}=${improper.numerator}`,`\\frac{${improper.numerator}}{${den}}`]};
    }
    return{...base,type:'mixed',answerType:'mixed',promptTex:`\\frac{${improper.numerator}}{${den}}`,promptText:'Wandle den unechten Bruch in eine gemischte Zahl um.',correctAnswer:improper,hints:['Wie oft passt der Nenner vollständig in den Zähler?','Der Rest wird zum Zähler des Bruchteils.'],solutionSteps:[`${improper.numerator}:${den}=${whole}\\text{ Rest }${num}`,`${whole}\\,\\frac{${num}}{${den}}`]};
  }

  if(skill==='simplify'){
    const reduced=randomReducedFraction({minDen:3,maxDen:Math.min(12,7+difficulty)}),factor=randomInt(2,Math.min(6,difficulty+3)),shown=reduced.expand(factor);
    return{...base,type:'fraction',answerType:'fraction',promptTex:`\\frac{${shown.numerator}}{${shown.denominator}}`,promptText:'Kürze vollständig.',correctAnswer:reduced,requireReduced:true,hints:['Suche einen gemeinsamen Teiler von Zähler und Nenner.',`Zähler und Nenner sind beide durch ${factor} teilbar.`],solutionSteps:[`${shown.numerator}:${factor}=${reduced.numerator}`,`${shown.denominator}:${factor}=${reduced.denominator}`,`\\frac{${reduced.numerator}}{${reduced.denominator}}`]};
  }

  if(skill==='expand'||skill==='equivalence'){
    const f=randomReducedFraction({minDen:3,maxDen:Math.min(11,7+difficulty)}),factor=randomInt(2,Math.min(6,difficulty+3));
    return{...base,type:'fraction',answerType:'fraction',promptTex:`\\frac{${f.numerator}}{${f.denominator}}`,promptText:`Erweitere mit ${factor}.`,correctAnswer:f.expand(factor),hints:['Multipliziere Zähler und Nenner mit derselben Zahl.'],solutionSteps:[`${f.numerator}\\cdot${factor}=${f.numerator*factor}`,`${f.denominator}\\cdot${factor}=${f.denominator*factor}`]};
  }

  if(skill==='compare'){
    let a=randomReducedFraction({minDen:2,maxDen:10,allowImproper:difficulty>2,minValue:0.15,maxValue:difficulty>2?1.6:0.95}),b;
    if(Math.random()<0.18){b=a.expand(randomInt(2,4))}
    else{do{b=randomReducedFraction({minDen:2,maxDen:10,allowImproper:difficulty>2,minValue:0.15,maxValue:difficulty>2?1.6:0.95})}while(a.equals(b))}
    return{...base,type:'comparison',answerType:'comparison',promptTex:`\\frac{${a.numerator}}{${a.denominator}}\;?\;\\frac{${b.numerator}}{${b.denominator}}`,promptText:'Setze <, > oder = ein.',correctAnswer:a.compare(b)<0?'<':a.compare(b)>0?'>':'=',hints:['Vergleiche zuerst mit bekannten Größen wie 1/2 oder 1.','Wenn das nicht reicht, bringe beide Brüche auf einen gemeinsamen Nenner.']};
  }

  if(skill==='fraction_to_decimal'){
    const f=finiteFraction();
    return{...base,type:'decimal',answerType:'decimal',promptTex:`\\frac{${f.numerator}}{${f.denominator}}`,promptText:'Schreibe als Dezimalzahl.',correctAnswer:f,hints:['Ein Bruchstrich bedeutet Division.','Teile den Zähler durch den Nenner.']};
  }

  if(skill==='decimal_to_fraction'){
    const f=finiteFraction(),decimal=String(f.toDecimal()).replace('.',',');
    return{...base,type:'fraction',answerType:'fraction',promptText:`Schreibe ${decimal} als vollständig gekürzten Bruch.`,correctAnswer:f,requireReduced:true,hints:['Schreibe die Dezimalzahl zuerst als Zehntel, Hundertstel oder Tausendstel.','Kürze den entstandenen Bruch vollständig.']};
  }

  if(skill==='fraction_of_quantity'){
    const den=randomInt(3,Math.min(8,5+difficulty)),num=randomInt(1,den-1),f=F(num,den).reduce(),unit=randomInt(2,Math.min(12,6+difficulty*2)),quantity=f.denominator*unit;
    return{...base,type:'number',answerType:'number',promptTex:`\\frac{${f.numerator}}{${f.denominator}}\\text{ von }${quantity}`,promptText:'Berechne den Bruchteil.',correctAnswer:fractionOfQuantity(f,quantity),hints:[`Teile zuerst ${quantity} durch ${f.denominator}.`,`Multipliziere einen Teil anschließend mit ${f.numerator}.`],solutionSteps:[`${quantity}:${f.denominator}=${unit}`,`${unit}\\cdot${f.numerator}=${unit*f.numerator}`]};
  }

  if(skill==='whole_from_part'){
    const den=randomInt(3,Math.min(8,5+difficulty)),num=randomInt(1,den-1),f=F(num,den).reduce(),unit=randomInt(2,Math.min(12,6+difficulty*2)),part=unit*f.numerator;
    return{...base,type:'number',answerType:'number',promptTex:`\\frac{${f.numerator}}{${f.denominator}}\\text{ sind }${part}`,promptText:'Wie groß ist das Ganze?',correctAnswer:wholeFromFractionPart(f,part),hints:[`${f.numerator} Teile entsprechen ${part}. Bestimme zuerst einen Teil.`,`Das Ganze besteht aus ${f.denominator} solchen Teilen.`],solutionSteps:[`${part}:${f.numerator}=${unit}`,`${unit}\\cdot${f.denominator}=${unit*f.denominator}`]};
  }

  if(skill==='number_line'){
    const max=difficulty>2&&Math.random()<0.65?2:1,subdivisions=pick(max===1?[4,5,6,8]:[4,6,8]),tick=randomInt(1,subdivisions*max-1),target=F(tick,subdivisions).reduce();
    return{...base,type:'numberLine',answerType:'numberLine',promptText:'Setze den Bruch an die richtige Stelle auf dem Zahlenstrahl.',promptTex:`\\frac{${target.numerator}}{${target.denominator}}`,correctAnswer:target,numberLine:{min:0,max,subdivisions:subdivisions*max,target:target.toDecimal(),mode:'place',tolerance:.035},hints:['Bestimme zuerst, zwischen welchen ganzen Zahlen der Bruch liegt.','Nutze die gleich großen Unterteilungen des Zahlenstrahls.']};
  }

  return null;
}
