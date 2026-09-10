import assert from 'node:assert/strict';
import {generateTask} from '../js/generators/registry.js';

const dynamicSkills=['fraction_meaning','proper_improper','mixed_numbers','simplify','expand','equivalence','compare','order','number_line','fraction_to_decimal','decimal_to_fraction','fraction_of_quantity','whole_from_part','add','subtract','multiply','divide'];

for(const skill of dynamicSkills){
  const recent=[];
  for(let i=0;i<25;i++){
    const task=generateTask(skill,2,{avoidSignatures:recent.slice(-8)});
    assert.ok(task,`${skill}: Aufgabe fehlt`);
    assert.equal(task.skill,skill,`${skill}: falscher Skill`);
    assert.ok(task.id,`${skill}: ID fehlt`);
    assert.ok(task.signature,`${skill}: Signatur fehlt`);
    assert.ok(!recent.slice(-8).includes(task.signature),`${skill}: Aufgabe wurde zu früh wiederholt`);
    if(task.correctAnswer?.denominator!==undefined)assert.notEqual(task.correctAnswer.denominator,0,`${skill}: Nenner 0`);
    recent.push(task.signature);
  }
}

for(const skill of ['error_analysis','plausibility']){
  for(let i=0;i<10;i++){
    const task=generateTask(skill,2);
    assert.ok(task?.options?.length>=2,`${skill}: Antwortoptionen fehlen`);
    assert.ok(task.options.some(option=>String(option.value)===String(task.correctAnswer)),`${skill}: richtige Antwort fehlt in den Optionen`);
  }
}

for(const skill of ['add','subtract','multiply','divide']){
  for(let difficulty=1;difficulty<=4;difficulty++){
    for(let i=0;i<30;i++){
      const task=generateTask(skill,difficulty);
      assert.ok(Number.isInteger(task.correctAnswer.numerator));
      assert.ok(Number.isInteger(task.correctAnswer.denominator));
      assert.notEqual(task.correctAnswer.denominator,0);
      assert.ok(task.correctAnswer.denominator<=30,`${skill}: unnötig großer Nenner`);
    }
  }
}

console.log('Alle Generator-Smoke-Tests erfolgreich.');
