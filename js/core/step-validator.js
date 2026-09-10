import {Fraction} from './fraction.js';

function parseInteger(value){
  if(value===null||value===undefined||String(value).trim()==='')return null;
  const n=Number(value);return Number.isInteger(n)?n:null;
}
function parseFraction(raw){
  const numerator=parseInteger(raw?.numerator),denominator=parseInteger(raw?.denominator);
  if(numerator===null||denominator===null)return{valid:false,message:'Bitte Zähler und Nenner eingeben.'};
  if(denominator===0)return{valid:false,message:'Der Nenner darf nicht 0 sein.'};
  return{valid:true,fraction:new Fraction(numerator,denominator)};
}
function sameRepresentation(a,b){return a.numerator===b.numerator&&a.denominator===b.denominator}
function checkFraction(raw,expected,{exactRepresentation=false,requireReduced=false}={}){
  const parsed=parseFraction(raw);if(!parsed.valid)return parsed;
  const f=parsed.fraction;
  if(exactRepresentation&&!sameRepresentation(f,expected)){
    if(f.equals(expected))return{valid:true,correct:false,message:'Der Wert stimmt, aber für diesen Zwischenschritt brauchen wir genau diese Darstellung.'};
    return{valid:true,correct:false,message:'Dieser Bruch passt noch nicht zu diesem Rechenschritt.'};
  }
  if(!f.equals(expected))return{valid:true,correct:false,message:'Dieser Bruch passt noch nicht zu diesem Rechenschritt.'};
  if(requireReduced&&!f.isReduced())return{valid:true,correct:false,message:'Richtig gerechnet – der Bruch ist aber noch nicht vollständig gekürzt.'};
  return{valid:true,correct:true,fraction:f};
}

export function validateCalculationStep(step,raw){
  if(!step)return{valid:false,correct:false,message:'Kein Rechenschritt vorhanden.'};
  if(step.kind==='fraction'||step.kind==='right-fraction'){
    const result=checkFraction(raw,step.expected,step);
    return result.correct?{...result,message:step.success||'Rechenschritt stimmt.'}:result;
  }
  if(step.kind==='pair'){
    const left=checkFraction(raw?.left,step.expected[0],step),right=checkFraction(raw?.right,step.expected[1],step);
    if(!left.valid)return left;if(!right.valid)return right;
    if(left.correct&&right.correct)return{valid:true,correct:true,message:step.success||'Rechenschritt stimmt.'};
    return{valid:true,correct:false,message:'Prüfe beide Brüche in diesem Zwischenschritt noch einmal.'};
  }
  return{valid:false,correct:false,message:'Dieser Rechenschritt kann noch nicht geprüft werden.'};
}
