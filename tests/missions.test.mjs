import assert from 'node:assert/strict';
import {MISSIONS,DIAGNOSTIC_SKILLS,FINAL_SKILLS,buildMissionSequence,getMission,missionStatus,missionDashboardSummary,missionProgress} from '../js/learning/missions.js';

assert.equal(DIAGNOSTIC_SKILLS.length,10);
assert.equal(FINAL_SKILLS.length,8);
assert.equal(MISSIONS.length,7);

const skillState=Object.fromEntries([
  'fraction_meaning','proper_improper','mixed_numbers','simplify','expand','equivalence','compare','order','number_line','fraction_to_decimal','decimal_to_fraction','fraction_of_quantity','whole_from_part','add','subtract','multiply','divide'
].map(id=>[id,{id,confidence:'im Aufbau',difficulty:1,errors:0,correctNoHelp:0}]));

for(const mission of MISSIONS){
  const seq=buildMissionSequence(mission.id,skillState);
  assert.equal(seq.length,mission.length,`${mission.id}: falsche Missionslänge`);
  assert.ok(seq.every(skill=>mission.skills.includes(skill)),`${mission.id}: fremder Skill in Mission`);
  for(const skill of mission.skills){
    assert.ok(seq.includes(skill),`${mission.id}: Skill ${skill} fehlt trotz ausreichender Missionslänge`);
  }
}

const session={
  missions:{},
  answers:[
    {phase:'diagnostic',skill:'fraction_meaning',status:'correct',correct:true,hintLevel:0},
    {phase:'diagnostic',skill:'proper_improper',status:'correct',correct:true,hintLevel:0},
    {phase:'diagnostic',skill:'add',status:'wrong',correct:false,hintLevel:0},
    {phase:'diagnostic',skill:'add',status:'correct',correct:true,hintLevel:0},
    {phase:'diagnostic',skill:'divide',status:'correct',correct:true,hintLevel:0}
  ]
};

assert.equal(missionStatus(session,getMission('bruchcode')),'secure');
assert.equal(missionStatus(session,getMission('operatoren')),'recommended');
session.missions.operatoren={completed:false,index:0,startedAt:new Date().toISOString(),tasks:[{id:'op-1'},{id:'op-2'},{id:'op-3'},{id:'op-4'},{id:'op-5'}]};
assert.equal(missionStatus(session,getMission('operatoren')),'in_progress');
session.answers.push({phase:'mission',missionId:'operatoren',taskId:'op-1',correct:true,status:'correct'});
assert.equal(missionProgress(session,'operatoren').index,1);
session.missions.operatoren.completed=true;
assert.equal(missionStatus(session,getMission('operatoren')),'completed');

const summary=missionDashboardSummary(session);
assert.ok(summary.secure>=2);
assert.equal(summary.completed,1);

console.log('Missionen-Tests erfolgreich.');
