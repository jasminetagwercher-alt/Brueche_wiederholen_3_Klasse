import {generateBasic} from './basic.js';
import {generateOperation} from './operations.js';
import {generateOrder,generateThinking} from './compare-order.js';
export function generateTask(skill,difficulty=1){
  if(['add','subtract','multiply','divide'].includes(skill))return generateOperation(skill,difficulty);
  if(skill==='order')return generateOrder(difficulty);
  if(['error_analysis','plausibility'].includes(skill))return generateThinking(skill,difficulty);
  const task=generateBasic(skill,difficulty);
  if(task)return task;
  return generateThinking('plausibility',difficulty);
}
