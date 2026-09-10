import {Fraction} from '../core/fraction.js';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const F=(n,d)=>new Fraction(n,d), id=s=>`${s}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
export function generateOperation(skill,difficulty=1){
 const pools={add:[[F(1,3),F(1,4)],[F(2,5),F(3,10)],[F(5,6),F(2,3)]],subtract:[[F(3,4),F(1,2)],[F(5,6),F(1,3)],[F(7,8),F(1,4)]],multiply:[[F(2,3),F(3,5)],[F(4,7),F(2,3)],[F(5,6),F(9,10)]],divide:[[F(3,4),F(2,5)],[F(2,3),F(4,9)],[F(5,6),F(10,9)]]};
 if(!pools[skill])return null;const [a,b]=pick(pools[skill]);const op={add:'+',subtract:'-',multiply:'\\cdot',divide:':' }[skill];const result={add:a.add(b),subtract:a.subtract(b),multiply:a.multiply(b),divide:a.divide(b)}[skill];
 const hints={add:['Beim Addieren müssen die Brüche gleichnamig sein.','Finde einen gemeinsamen Nenner.'],subtract:['Beim Subtrahieren müssen die Brüche gleichnamig sein.','Finde einen gemeinsamen Nenner.'],multiply:['Multipliziere Zähler mit Zähler und Nenner mit Nenner.'],divide:['Ersetze die Division durch eine Multiplikation mit dem Kehrwert des zweiten Bruchs.']}[skill];
 return{id:id(skill),skill,difficulty,type:'fraction',answerType:'fraction',promptText:'Berechne und kürze vollständig.',promptTex:`\\frac{${a.numerator}}{${a.denominator}} ${op} \\frac{${b.numerator}}{${b.denominator}}`,operands:[a,b],correctAnswer:result,requireReduced:true,hints,solutionSteps:[`Ergebnis: \\frac{${result.numerator}}{${result.denominator}}`]};
}
