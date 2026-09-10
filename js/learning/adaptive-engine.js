export function adaptDifficulty(skill){
  if(skill.correctNoHelp>=2&&skill.errors===0)return Math.min(4,(skill.difficulty||1)+1);
  if(skill.errors>=2)return Math.max(1,(skill.difficulty||2)-1);
  return skill.difficulty||1;
}
