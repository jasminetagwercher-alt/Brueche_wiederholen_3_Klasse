import {Fraction} from '../core/fraction.js';
import {generateTask} from '../generators/registry.js';
import {adaptDifficulty} from './adaptive-engine.js';

function isFractionShape(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const keys=Object.keys(value).sort();
  return keys.length===2&&keys[0]==='denominator'&&keys[1]==='numerator'&&Number.isInteger(value.numerator)&&Number.isInteger(value.denominator)&&value.denominator!==0;
}

export function reviveFractions(value){
  if(Array.isArray(value))return value.map(reviveFractions);
  if(isFractionShape(value))return new Fraction(value.numerator,value.denominator);
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,reviveFractions(item)]));
  return value;
}

export function reviveTaskList(tasks=[]){
  return Array.isArray(tasks)?tasks.map(task=>reviveFractions(task)):[];
}

export function buildTaskList(skills,skillState={},avoidSignatures=[]){
  const memory=[...avoidSignatures];
  const tasks=[];
  for(const skill of skills){
    const state=skillState?.[skill]||{difficulty:1,errors:0,correctNoHelp:0};
    const task=generateTask(skill,adaptDifficulty(state),{avoidSignatures:memory});
    tasks.push(task);
    if(task?.signature){memory.push(task.signature);if(memory.length>40)memory.shift()}
  }
  return tasks;
}

export function completedTaskIds(session,tasks=[]){
  const ids=new Set(tasks.map(task=>task.id));
  return new Set((session?.answers||[]).filter(answer=>answer.correct&&ids.has(answer.taskId)).map(answer=>answer.taskId));
}

export function taskCompletion(session,tasks=[]){
  const completed=completedTaskIds(session,tasks);
  return tasks.map(task=>completed.has(task.id));
}

export function completedCount(session,tasks=[]){
  return completedTaskIds(session,tasks).size;
}

export function allTasksCompleted(session,tasks=[]){
  return tasks.length>0&&completedCount(session,tasks)===tasks.length;
}

export function nextOpenIndex(session,tasks=[],fromIndex=-1){
  if(!tasks.length)return -1;
  const completed=completedTaskIds(session,tasks);
  for(let offset=1;offset<=tasks.length;offset++){
    const index=(fromIndex+offset+tasks.length)%tasks.length;
    if(!completed.has(tasks[index].id))return index;
  }
  return -1;
}

export function taskEstimate(tasks=[]){
  const count=tasks.length;
  const min=Math.max(2,Math.round(count*0.9));
  const max=Math.max(min+1,Math.round(count*1.6));
  return `${min}–${max} Min.`;
}
