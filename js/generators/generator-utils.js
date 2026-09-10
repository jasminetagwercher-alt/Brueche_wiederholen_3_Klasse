import {Fraction,gcd} from '../core/fraction.js';

export function randomInt(min,max){return Math.floor(Math.random()*(max-min+1))+min}
export function pick(values){return values[randomInt(0,values.length-1)]}
export function shuffle(values){const out=[...values];for(let i=out.length-1;i>0;i--){const j=randomInt(0,i);[out[i],out[j]]=[out[j],out[i]]}return out}
export function randomReducedFraction({minDen=2,maxDen=10,allowImproper=false,minValue=0,maxValue=2}={}){
  for(let i=0;i<80;i++){
    const d=randomInt(minDen,maxDen);
    const maxNum=allowImproper?Math.max(1,Math.floor(d*maxValue)):d-1;
    const minNum=allowImproper?Math.max(1,Math.ceil(d*minValue)):1;
    if(minNum>maxNum)continue;
    const n=randomInt(minNum,maxNum);
    if(gcd(n,d)===1)return new Fraction(n,d);
  }
  return new Fraction(1,2);
}
export function taskSignature(task){
  const answer=task.correctAnswer;
  const normalizedAnswer=Array.isArray(answer)?answer.map(x=>x?.toJSON?.()||x):answer?.toJSON?.()||answer;
  return JSON.stringify({skill:task.skill,type:task.type,promptText:task.promptText||'',promptTex:task.promptTex||'',answer:normalizedAnswer});
}
export function uniqueTask(factory,avoidSignatures=[],attempts=24){
  const blocked=new Set(avoidSignatures||[]);let task=null;
  for(let i=0;i<attempts;i++){
    task=factory();task.signature=taskSignature(task);
    if(!blocked.has(task.signature))return task;
  }
  return task;
}
export function makeId(skill){return `${skill}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
