import {generateBasic} from './basic.js';
import {generateOperation} from './operations.js';
import {generateOrder,generateThinking} from './compare-order.js';
import {generateMixedNumbers,generateEquivalence} from './conversions.js';
import {uniqueTask} from './generator-utils.js';

function createTask(skill,difficulty){
  if(['add','subtract','multiply','divide'].includes(skill))return generateOperation(skill,difficulty);
  if(skill==='mixed_numbers')return generateMixedNumbers(difficulty);
  if(skill==='equivalence')return generateEquivalence(difficulty);
  if(skill==='order')return generateOrder(difficulty);
  if(['error_analysis','plausibility'].includes(skill))return generateThinking(skill,difficulty);
  return generateBasic(skill,difficulty)||generateThinking('plausibility',difficulty);
}

export function generateTask(skill,difficulty=1,{avoidSignatures=[]}={}){
  return uniqueTask(()=>createTask(skill,difficulty),avoidSignatures);
}
