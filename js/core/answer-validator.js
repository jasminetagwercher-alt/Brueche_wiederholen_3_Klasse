import {Fraction,decimalToFraction} from './fraction.js';
import {detectMisconception} from '../learning/misconception-engine.js';
export function parseAnswer(raw,type){try{
  if(type==='fraction'){const n=Number(raw.numerator),d=Number(raw.denominator);if(!Number.isInteger(n)||!Number.isInteger(d))return{valid:false,message:'Bitte Zähler und Nenner vollständig eingeben.'};if(d===0)return{valid:false,message:'Der Nenner darf nicht 0 sein.'};return{valid:true,answer:{kind:'fraction',numerator:n,denominator:d},fraction:new Fraction(n,d)}}
  if(type==='mixed'){const w=Number(raw.whole),n=Number(raw.numerator),d=Number(raw.denominator);if(![w,n,d].every(Number.isInteger)||d===0)return{valid:false,message:'Bitte die gemischte Zahl vollständig und mit Nenner ungleich 0 eingeben.'};const sign=w<0?-1:1;return{valid:true,answer:{kind:'mixed',whole:w,numerator:n,denominator:d},fraction:new Fraction(w*d+sign*n,d)}}
  if(type==='decimal'){const fraction=decimalToFraction(raw.value);return{valid:true,answer:{kind:'decimal',value:String(raw.value)},fraction}}
  if(type==='number'){const v=Number(String(raw.value).replace(',','.'));if(!Number.isFinite(v))return{valid:false,message:'Bitte eine Zahl eingeben.'};return{valid:true,answer:{kind:'number',value:v},value:v}}
  if(type==='choice'||type==='comparison')return{valid:true,answer:{kind:type,value:raw.value},value:raw.value};
}catch(e){return{valid:false,message:e.message}}return{valid:false,message:'Diese Eingabe konnte nicht geprüft werden.'}}
export function validateAnswer(task,raw){const parsed=parseAnswer(raw,task.answerType);if(!parsed.valid)return{status:'invalid',correct:false,message:parsed.message};
  let correct=false,almost=false;
  if(task.answerType==='fraction'||task.answerType==='mixed'||task.answerType==='decimal')correct=parsed.fraction.equals(task.correctAnswer);
  else correct=String(parsed.value)===String(task.correctAnswer);
  if(correct&&task.requireReduced&&parsed.fraction&&!parsed.fraction.isReduced())almost=true;
  if(almost)return{status:'almost',correct:false,message:'Richtig gerechnet – du kannst das Ergebnis noch vollständig kürzen.'};
  if(correct)return{status:'correct',correct:true,message:'Richtig.'};
  const misconception=detectMisconception(task,parsed.answer);return{status:'wrong',correct:false,message:misconception?.message||'Noch nicht richtig. Prüfe deinen Rechenweg und nutze bei Bedarf einen Hinweis.',misconception:misconception?.id||null};
}
