import assert from 'node:assert/strict';
import {Fraction} from '../js/core/fraction.js';
import {buildOperationSolutionPlan} from '../js/didactics/operation-plans.js';
import {validateCalculationStep} from '../js/core/step-validator.js';
import {chooseSupportMode} from '../js/learning/support-engine.js';

const F=(n,d)=>new Fraction(n,d);

const add=buildOperationSolutionPlan('add',F(2,3),F(1,4),F(11,12));
assert.equal(add.steps[0].id,'make-like');
assert.deepEqual(add.steps[0].expected.map(f=>f.toJSON()),[{numerator:8,denominator:12},{numerator:3,denominator:12}]);
assert.equal(validateCalculationStep(add.steps[0],{left:{numerator:8,denominator:12},right:{numerator:3,denominator:12}}).correct,true);

const divide=buildOperationSolutionPlan('divide',F(3,4),F(2,5),F(15,8));
assert.equal(divide.steps[0].id,'reciprocal');
assert.deepEqual(divide.steps[0].expected.toJSON(),{numerator:5,denominator:2});
assert.equal(validateCalculationStep(divide.steps[0],{numerator:5,denominator:2}).correct,true);
assert.equal(validateCalculationStep(divide.steps[0],{numerator:10,denominator:4}).correct,false,'Zwischenschritt soll die erwartete Kehrwertdarstellung verlangen');

const multiply=buildOperationSolutionPlan('multiply',F(2,3),F(9,10),F(3,5));
assert.equal(multiply.steps[0].id,'cancel');
assert.deepEqual(multiply.steps[0].expected.map(f=>f.toJSON()),[{numerator:1,denominator:1},{numerator:3,denominator:5}]);

const task={solutionPlan:divide};
assert.equal(chooseSupportMode({phase:'diagnostic',skillState:{confidence:'unsicher'},task}),'free');
assert.equal(chooseSupportMode({phase:'training',skillState:{confidence:'unsicher'},task}),'guided');
assert.equal(chooseSupportMode({phase:'training',skillState:{confidence:'im Aufbau',errors:0,correctNoHelp:1},task}),'partial');
assert.equal(chooseSupportMode({phase:'training',skillState:{confidence:'im Aufbau',errors:1,correctNoHelp:0},task}),'guided','Fehler in der Diagnose soll trotz Status im Aufbau zu Führung führen');
assert.equal(chooseSupportMode({phase:'training',skillState:{confidence:'sicher',errors:0,correctNoHelp:3},task}),'free');
assert.equal(chooseSupportMode({phase:'final',skillState:{confidence:'unsicher'},task}),'free');

console.log('Rechenweg- und Scaffolding-Tests erfolgreich.');
