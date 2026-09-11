import {createSkillState,updateSkill} from './skills.js';

export function createSession(profile={name:'',className:''}){
  return{
    version:4,
    id:crypto.randomUUID?.()||Math.random().toString(36).slice(2),
    profile,
    startedAt:new Date().toISOString(),
    phase:'diagnostic',
    taskIndex:0,
    skills:createSkillState(),
    answers:[],
    hintsUsed:0,
    independentCorrect:0,
    diagnosticScore:null,
    finalScore:null,
    completed:false,
    recentTaskSignatures:[],
    phaseSequence:null,
    quickBreakSeen:false,
    missions:{},
    activeMission:null,
    blockTasks:{diagnostic:null,final:null},
    drafts:{}
  };
}

export function recordAttempt(session,task,result,hintLevel,rawAnswer){
  const alreadyCompleted=session.answers.some(answer=>answer.taskId===task.id&&answer.correct);
  session.answers.push({
    timestamp:new Date().toISOString(),
    phase:session.phase,
    missionId:session.phase==='mission'?(session.activeMission||null):null,
    taskId:task.id,
    taskSignature:task.signature||null,
    skill:task.skill,
    correct:result.correct,
    status:result.status,
    hintLevel,
    misconception:result.misconception||null,
    rawAnswer
  });
  if(!alreadyCompleted&&result.status!=='almost'&&result.status!=='invalid')updateSkill(session.skills,task.skill,{correct:result.correct,hintLevel,misconception:result.misconception});
  if(!alreadyCompleted&&result.correct&&!hintLevel)session.independentCorrect++;
  return session;
}

export function scorePhase(session,phase){
  const rows=session.answers.filter(a=>a.phase===phase&&a.status!=='invalid'&&a.status!=='almost');
  const firstByTask=new Map();
  for(const row of rows){if(!firstByTask.has(row.taskId))firstByTask.set(row.taskId,row)}
  const firstAttempts=[...firstByTask.values()];
  if(!firstAttempts.length)return 0;
  return Math.round(firstAttempts.filter(a=>a.correct).length/firstAttempts.length*100);
}

export function exportSession(session){
  return{
    timestamp:new Date().toISOString(),
    sessionId:session.id,
    name:session.profile.name,
    className:session.profile.className,
    diagnostic:session.diagnosticScore,
    final:session.finalScore,
    missions:Object.fromEntries(Object.entries(session.missions||{}).map(([id,m])=>[id,{completed:Boolean(m.completed),runs:m.runs||0}])),
    skillScores:Object.fromEntries(Object.entries(session.skills).map(([id,s])=>[id,{confidence:s.confidence,attempts:s.attempts,correctNoHelp:s.correctNoHelp,correctWithHelp:s.correctWithHelp,errors:s.errors,misconceptions:s.misconceptions}])),
    errors:session.answers.filter(a=>!a.correct&&a.status==='wrong').length,
    hints:session.hintsUsed,
    misconceptions:session.answers.filter(a=>a.misconception).map(a=>a.misconception),
    durationSeconds:Math.round((Date.now()-new Date(session.startedAt).getTime())/1000)
  };
}
