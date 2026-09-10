export const MISSIONS=Object.freeze([
  {id:'bruchcode',code:'01',title:'Brüche verstehen',subtitle:'Zähler, Nenner und Brucharten',skills:['fraction_meaning','proper_improper'],diagnosticSkills:['fraction_meaning','proper_improper'],length:3},
  {id:'formenwechsel',code:'02',title:'Gemischte Zahlen',subtitle:'Gemischte Zahl und unechter Bruch',skills:['mixed_numbers'],diagnosticSkills:['mixed_numbers'],length:3},
  {id:'umbau',code:'03',title:'Kürzen & Erweitern',subtitle:'Brüche geschickt umformen',skills:['simplify','expand','equivalence'],diagnosticSkills:['simplify','expand'],length:4},
  {id:'position',code:'04',title:'Vergleichen & Zahlenstrahl',subtitle:'Brüche einordnen und anordnen',skills:['compare','order','number_line'],diagnosticSkills:['compare'],length:4},
  {id:'uebersetzen',code:'05',title:'Bruch & Dezimalzahl',subtitle:'Zwischen Darstellungen wechseln',skills:['fraction_to_decimal','decimal_to_fraction'],diagnosticSkills:['fraction_to_decimal'],length:3},
  {id:'anteil',code:'06',title:'Bruchteil & Ganzes',subtitle:'Anteile berechnen und zurückrechnen',skills:['fraction_of_quantity','whole_from_part'],diagnosticSkills:['fraction_of_quantity'],length:4},
  {id:'operatoren',code:'07',title:'Rechnen mit Brüchen',subtitle:'Addieren, Subtrahieren, Multiplizieren, Dividieren',skills:['add','subtract','multiply','divide'],diagnosticSkills:['add','divide'],length:5}
]);

export const DIAGNOSTIC_SKILLS=Object.freeze([
  'fraction_meaning','proper_improper','mixed_numbers','simplify','expand','compare','fraction_to_decimal','fraction_of_quantity','add','divide'
]);

export const FINAL_SKILLS=Object.freeze([
  'mixed_numbers','simplify','order','decimal_to_fraction','whole_from_part','subtract','multiply','divide'
]);

export function getMission(id){return MISSIONS.find(m=>m.id===id)||null}

function shuffle(values){
  const out=[...values];
  for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}
  return out;
}

function weakness(skillState,id){
  const s=skillState?.[id];
  if(!s)return 2;
  if((s.errors||0)>0&&(s.correctNoHelp||0)===0)return 8;
  if(s.confidence==='unsicher')return 7;
  if(s.confidence==='im Aufbau')return 4;
  if(s.confidence==='sicher')return 1;
  return 3;
}

export function buildMissionSequence(missionId,skillState={}){
  const mission=getMission(missionId);if(!mission)return[];
  const base=shuffle(mission.skills);
  const result=[];
  for(const skill of base){if(result.length<mission.length)result.push(skill)}
  while(result.length<mission.length){
    const weighted=[];
    for(const skill of mission.skills){
      const weight=weakness(skillState,skill)*(result.at(-1)===skill?.id?0.3:1);
      for(let i=0;i<Math.max(1,Math.ceil(weight));i++)weighted.push(skill);
    }
    let next=weighted[Math.floor(Math.random()*weighted.length)]||mission.skills[0];
    if(next===result.at(-1)&&mission.skills.length>1)next=mission.skills.find(s=>s!==next)||next;
    result.push(next);
  }
  return result;
}

function diagnosticRows(session,skill){
  return (session.answers||[]).filter(a=>a.phase==='diagnostic'&&a.skill===skill&&a.status!=='invalid'&&a.status!=='almost');
}

export function diagnosticSkillStatus(session,skill){
  const rows=diagnosticRows(session,skill);
  if(!rows.length)return'not_checked';
  const hadError=rows.some(a=>!a.correct);
  const usedHelp=rows.some(a=>(a.hintLevel||0)>0);
  const solved=rows.some(a=>a.correct);
  if(solved&&!hadError&&!usedHelp)return'secure';
  return'practice';
}

export function missionStatus(session,missionOrId){
  const mission=typeof missionOrId==='string'?getMission(missionOrId):missionOrId;
  if(!mission)return'unknown';
  const progress=session.missions?.[mission.id];
  if(progress?.completed)return'completed';
  if((progress?.index||0)>0)return'in_progress';
  const statuses=mission.diagnosticSkills.map(skill=>diagnosticSkillStatus(session,skill));
  if(statuses.some(s=>s==='practice'))return'recommended';
  if(statuses.some(s=>s==='secure')&&!statuses.some(s=>s==='not_checked'))return'secure';
  if(statuses.some(s=>s==='secure'))return'secure';
  return'optional';
}

export function missionDashboardSummary(session){
  const statuses=MISSIONS.map(m=>missionStatus(session,m));
  return{
    secure:statuses.filter(s=>s==='secure'||s==='completed').length,
    completed:statuses.filter(s=>s==='completed').length,
    recommended:statuses.filter(s=>s==='recommended'||s==='in_progress').length,
    total:MISSIONS.length
  };
}

export function missionProgress(session,id){
  const mission=getMission(id);if(!mission)return null;
  const p=session.missions?.[id]||{};
  return{index:p.index||0,total:(p.sequence?.length||mission.length),completed:Boolean(p.completed),runs:p.runs||0};
}
