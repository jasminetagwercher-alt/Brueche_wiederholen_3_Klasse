import {Fraction} from '../core/fraction.js';
import {makeId,randomInt,randomReducedFraction,shuffle} from './generator-utils.js';

export function generateMixedNumbers(difficulty=1){
  const den=randomInt(3,Math.min(10,6+difficulty)),whole=randomInt(1,Math.min(5,2+difficulty)),num=randomInt(1,den-1),improper=new Fraction(whole*den+num,den);
  if(Math.random()<.5){
    return{id:makeId('mixed_numbers'),skill:'mixed_numbers',difficulty,type:'fraction',answerType:'fraction',promptText:'Wandle die gemischte Zahl in einen unechten Bruch um.',promptTex:`${whole}\\,\\frac{${num}}{${den}}`,correctAnswer:improper,requireReduced:false,meta:{mode:'mixedToImproper',whole,numerator:num,denominator:den},hints:['Multipliziere die ganzen Teile mit dem Nenner.','Addiere danach den Zähler. Der Nenner bleibt gleich.'],solutionSteps:[`${whole}\\cdot${den}+${num}=${whole*den+num}`,`\\frac{${whole*den+num}}{${den}}`]};
  }
  return{id:makeId('mixed_numbers'),skill:'mixed_numbers',difficulty,type:'mixed',answerType:'mixed',promptText:'Wandle den unechten Bruch in eine gemischte Zahl um.',promptTex:`\\frac{${improper.numerator}}{${improper.denominator}}`,correctAnswer:improper,requireReduced:false,hints:['Wie oft passt der Nenner vollständig in den Zähler?','Der Rest wird zum Zähler des Bruchteils.'],solutionSteps:[`${improper.numerator}:${den}=${whole}\\text{ Rest }${num}`,`${whole}\\,\\frac{${num}}{${den}}`]};
}

export function generateEquivalence(difficulty=1){
  const base=randomReducedFraction({minDen:3,maxDen:Math.min(11,7+difficulty)}),factor=randomInt(2,Math.min(6,3+difficulty)),eq=base.expand(factor),wrongA=new Fraction(eq.numerator+1,eq.denominator),wrongB=new Fraction(base.denominator,base.numerator);
  const options=shuffle([{value:'eq',tex:`\\frac{${eq.numerator}}{${eq.denominator}}`},{value:'wrongA',tex:`\\frac{${wrongA.numerator}}{${wrongA.denominator}}`},{value:'wrongB',tex:`\\frac{${wrongB.numerator}}{${wrongB.denominator}}`}]);
  return{id:makeId('equivalence'),skill:'equivalence',difficulty,type:'choice',answerType:'choice',promptText:'Welcher Bruch ist gleichwertig?',promptTex:`\\frac{${base.numerator}}{${base.denominator}}`,options,correctAnswer:'eq',hints:['Bei gleichwertigen Brüchen werden Zähler und Nenner mit derselben Zahl verändert.','Prüfe durch Erweitern oder Kürzen.'],solutionSteps:[`\\frac{${base.numerator}}{${base.denominator}}=\\frac{${eq.numerator}}{${eq.denominator}}`]};
}
