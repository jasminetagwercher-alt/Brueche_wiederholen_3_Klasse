import assert from 'node:assert/strict';
import {Fraction} from '../js/core/fraction.js';
import {createSkillState} from '../js/learning/skills.js';
import {buildTaskList,reviveTaskList,completedCount,nextOpenIndex,allTasksCompleted} from '../js/learning/task-sets.js';

const skills=createSkillState();
const generated=buildTaskList(['add','divide','fraction_of_quantity'],skills,[]);
assert.equal(generated.length,3);
assert.ok(generated.every(task=>task.id&&task.skill));

const stored=JSON.parse(JSON.stringify(generated));
const revived=reviveTaskList(stored);
assert.ok(revived[0].correctAnswer instanceof Fraction,'Endergebnisse müssen nach LocalStorage wieder Fraction-Objekte sein.');
assert.ok(revived[1].solutionPlan.steps.some(step=>step.expected instanceof Fraction||Array.isArray(step.expected)),'Rechenweg muss wieder mathematisch prüfbar sein.');

const session={answers:[]};
assert.equal(completedCount(session,revived),0);
assert.equal(nextOpenIndex(session,revived,-1),0);
session.answers.push({taskId:revived[0].id,correct:true});
assert.equal(completedCount(session,revived),1);
assert.equal(nextOpenIndex(session,revived,0),1);
session.answers.push({taskId:revived[1].id,correct:true},{taskId:revived[2].id,correct:true});
assert.equal(allTasksCompleted(session,revived),true);
assert.equal(nextOpenIndex(session,revived,0),-1);

console.log('Task-Set-Tests erfolgreich.');
