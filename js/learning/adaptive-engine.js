export function chooseTrainingSkill(skillState,recentSkills=[]){
  const entries=Object.values(skillState).filter(s=>!['mixed_practice'].includes(s.id));
  const weighted=[];
  for(const s of entries){let w=s.confidence==='unsicher'?6:s.confidence==='im Aufbau'?4:s.confidence==='sicher'?1:3;if(recentSkills.includes(s.id))w*=.35;for(let i=0;i<Math.ceil(w);i++)weighted.push(s.id)}
  return weighted[Math.floor(Math.random()*weighted.length)]||'simplify';
}
export function adaptDifficulty(skill){if(skill.correctNoHelp>=2&&skill.errors===0)return Math.min(4,(skill.difficulty||1)+1);if(skill.errors>=2)return Math.max(1,(skill.difficulty||2)-1);return skill.difficulty||1}
export function phaseSkillSequence(phase,skillState,length){
  if(phase==='diagnostic')return ['fraction_meaning','proper_improper','mixed_numbers','simplify','expand','compare','number_line','fraction_to_decimal','decimal_to_fraction','fraction_of_quantity','whole_from_part','add','multiply','divide'].slice(0,length);
  if(phase==='final')return ['mixed_numbers','simplify','compare','number_line','fraction_to_decimal','fraction_of_quantity','whole_from_part','add','subtract','divide'].slice(0,length);
  if(phase==='mix')return ['equivalence','order','error_analysis','plausibility','add','subtract','multiply','divide','number_line','whole_from_part'].slice(0,length);
  const out=[],recent=[];while(out.length<length){const s=chooseTrainingSkill(skillState,recent);out.push(s);recent.push(s);if(recent.length>2)recent.shift()}return out;
}
