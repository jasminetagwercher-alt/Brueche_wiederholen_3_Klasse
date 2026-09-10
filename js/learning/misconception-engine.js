import {Fraction} from '../core/fraction.js';
export function detectMisconception(task,answer){
  if(!answer||answer.kind!=='fraction')return null;
  const a=new Fraction(answer.numerator,answer.denominator);
  const [x,y]=task.operands||[];
  if(task.skill==='add'&&x&&y&&a.equals(new Fraction(x.numerator+y.numerator,x.denominator+y.denominator)))return{id:'add_num_den',message:'Du hast vermutlich Zähler und Nenner getrennt addiert. Beim Addieren müssen zuerst gleich große Teile hergestellt werden.'};
  if(task.skill==='subtract'&&x&&y&&x.denominator!==y.denominator&&a.numerator===x.numerator-y.numerator&&a.denominator===Math.abs(x.denominator-y.denominator||1))return{id:'subtract_num_den',message:'Du hast vermutlich Zähler und Nenner getrennt subtrahiert. Brüche brauchen vor dem Subtrahieren einen gemeinsamen Nenner.'};
  if(task.skill==='divide'&&x&&y&&a.equals(new Fraction(x.numerator*y.numerator,x.denominator*y.denominator)))return{id:'divide_no_reciprocal',message:'Du hast offenbar direkt multipliziert. Beim Dividieren durch einen Bruch wird zuerst mit seinem Kehrwert multipliziert.'};
  if(task.skill==='mixed_numbers'&&task.meta?.mode==='mixedToImproper'&&a.equals(new Fraction(task.meta.whole*task.meta.denominator,task.meta.denominator)))return{id:'mixed_missing_remainder',message:'Beim Umwandeln wurde vermutlich der Restzähler vergessen: Ganze × Nenner und anschließend den Zähler dazuzählen.'};
  return null;
}
