import {validateCalculationStep} from '../core/step-validator.js';
import {renderAllMath} from './math-renderer.js';

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function fractionSlot(prefix,label='Bruch'){
  return `<span class="calc-fraction-input" role="group" aria-label="${escapeHtml(label)}"><input id="${prefix}-num" inputmode="numeric" autocomplete="off" aria-label="${escapeHtml(label)} Zähler"><span class="calc-frac-bar" aria-hidden="true"></span><input id="${prefix}-den" inputmode="numeric" autocomplete="off" aria-label="${escapeHtml(label)} Nenner"></span>`;
}
function fixedTex(tex,cls=''){return `<span class="calc-fixed ${cls}" data-tex="${escapeHtml(tex)}"></span>`}

export class CalculationLine{
  constructor(container,task,{mode='guided'}={}){
    this.container=container;this.task=task;this.mode=mode;this.plan=task.solutionPlan;
    const all=this.plan?.steps||[];
    this.steps=mode==='partial'?all.filter((step,index)=>step.keepInPartial||index===all.length-1):all;
    if(!this.steps.length&&all.length)this.steps=[all[all.length-1]];
    this.index=0;this.lastResult=null;this.render();
  }
  get activeStep(){return this.steps[this.index]||null}
  get complete(){return this.index>=this.steps.length}
  expressionInput(step){
    if(step.kind==='fraction')return fractionSlot('calc','Ergebnis');
    if(step.kind==='right-fraction')return `<span class="calc-expression">${fixedTex(`\\frac{${step.left.numerator}}{${step.left.denominator}}`)}${fixedTex(step.operator,'calc-operator')}${fractionSlot('calc','Kehrwert')}</span>`;
    if(step.kind==='pair')return `<span class="calc-expression">${fractionSlot('calc-left','erster Bruch')}${fixedTex(step.operator,'calc-operator')}${fractionSlot('calc-right','zweiter Bruch')}</span>`;
    return '';
  }
  render(){
    const step=this.activeStep;
    const completed=this.steps.slice(0,this.index).map(s=>`<span class="calc-equals" aria-hidden="true">=</span>${fixedTex(s.displayTex,'calc-completed')}`).join('');
    const active=step?`<span class="calc-equals" aria-hidden="true">=</span><span class="calc-active">${this.expressionInput(step)}</span>`:'';
    const prompt=step?step.prompt:'Rechenweg vollständig.';
    this.container.innerHTML=`<div class="calc-shell"><div class="calc-guidance"><div><span class="calc-mode">${this.mode==='guided'?'Geführter Rechenweg':'Rechenweg'}</span><strong>${escapeHtml(prompt)}</strong></div><span class="calc-counter">${this.complete?this.steps.length:`${this.index+1}`} / ${this.steps.length}</span></div><div class="calculation-scroll" tabindex="0" aria-label="Rechenzeile horizontal scrollbar"><div class="calculation-line">${fixedTex(this.plan.originalTex,'calc-original')}${completed}${active}</div></div><p class="calc-note">Die Rechnung bleibt wie im Heft in einer Zeile. Bei wenig Platz kannst du die Zeile seitlich verschieben.</p></div>`;
    renderAllMath(this.container);
    this.container.querySelector('input')?.focus();
  }
  collect(){
    const step=this.activeStep;if(!step)return null;
    const read=prefix=>({numerator:this.container.querySelector(`#${prefix}-num`)?.value,denominator:this.container.querySelector(`#${prefix}-den`)?.value});
    if(step.kind==='pair')return{left:read('calc-left'),right:read('calc-right')};
    return read('calc');
  }
  checkCurrent(){
    if(this.complete)return{valid:true,correct:true,complete:true,message:'Der Rechenweg ist vollständig.'};
    const result=validateCalculationStep(this.activeStep,this.collect());this.lastResult=result;
    if(!result.correct){this.container.querySelector('.calc-active')?.classList.add('calc-invalid');return{...result,complete:false}}
    this.index++;this.render();return{...result,complete:this.complete};
  }
  exportState(){return{mode:this.mode,index:this.index}}
  restoreState(state){if(!state)return;this.index=Math.max(0,Math.min(Number(state.index)||0,this.steps.length));this.render()}
  getRawAnswer(){return{kind:'calculation-line',mode:this.mode,completedSteps:this.index,totalSteps:this.steps.length}}
}
