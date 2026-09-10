import {renderAllMath} from './math-renderer.js';

function fractionEntry(){
  return `<div class="fraction-entry" role="group" aria-label="Bruch eingeben">
    <label class="fraction-part"><span>Zähler</span><input id="num" inputmode="numeric" autocomplete="off" aria-label="Zähler"></label>
    <span class="fraction-entry-bar" aria-hidden="true"></span>
    <label class="fraction-part"><input id="den" inputmode="numeric" autocomplete="off" aria-label="Nenner"><span>Nenner</span></label>
  </div>`;
}
function preview(){return `<div class="answer-preview"><span class="preview-label">Vorschau</span><div class="math preview-math" id="live-preview" aria-label="Mathematische Vorschau">–</div></div>`}

export function inputTemplate(task){
  if(task.answerType==='fraction')return `<div class="answer-workspace">${fractionEntry()}${preview()}</div>`;
  if(task.answerType==='mixed')return `<div class="answer-workspace"><div class="mixed-entry"><label class="whole-part"><span>Ganze</span><input id="whole" inputmode="numeric" autocomplete="off" aria-label="Ganze Zahl"></label>${fractionEntry()}</div>${preview()}</div>`;
  if(task.answerType==='decimal')return `<label class="field single-answer">Dezimalzahl<input id="value" inputmode="decimal" autocomplete="off" placeholder="z. B. 0,75"></label>`;
  if(task.answerType==='number')return `<label class="field single-answer">Ergebnis<input id="value" inputmode="decimal" autocomplete="off"></label>`;
  if(task.answerType==='comparison')return `<div class="comparison-choices" role="group" aria-label="Vergleich auswählen"><button type="button" class="choice secondary" data-value="&lt;" aria-label="kleiner als">&lt;</button><button type="button" class="choice secondary" data-value="=" aria-label="gleich">=</button><button type="button" class="choice secondary" data-value="&gt;" aria-label="größer als">&gt;</button></div><input id="choice-value" type="hidden">`;
  if(task.answerType==='choice')return `<div class="choice-grid" role="group" aria-label="Antwort auswählen">${task.options.map(o=>`<button type="button" class="choice secondary" data-value="${String(o.value).replace(/"/g,'&quot;')}">${o.tex?`<span data-tex="${o.tex}"></span>`:`<span>${o.label}</span>`}</button>`).join('')}</div><input id="choice-value" type="hidden">`;
  return '';
}

export function wireInput(root,task){
  root.querySelectorAll('.choice').forEach(button=>button.addEventListener('click',()=>{
    root.querySelectorAll('.choice').forEach(x=>{x.classList.add('secondary');x.setAttribute('aria-pressed','false')});
    button.classList.remove('secondary');button.setAttribute('aria-pressed','true');root.querySelector('#choice-value').value=button.dataset.value;
  }));
  const update=()=>{
    const p=root.querySelector('#live-preview');if(!p)return;
    const n=root.querySelector('#num')?.value,d=root.querySelector('#den')?.value,w=root.querySelector('#whole')?.value;
    if(n&&d&&d!=='0'){
      p.dataset.tex=task.answerType==='mixed'&&w!==''?`${w}\\,\\frac{${n}}{${d}}`:`\\frac{${n}}{${d}}`;p.textContent='';
    }else{p.removeAttribute('data-tex');p.textContent='–'}
    renderAllMath(root);
  };
  root.querySelectorAll('input').forEach(input=>input.addEventListener('input',update));renderAllMath(root);
}

export function collectAnswer(root,task){
  if(task.answerType==='fraction')return{numerator:root.querySelector('#num').value,denominator:root.querySelector('#den').value};
  if(task.answerType==='mixed')return{whole:root.querySelector('#whole').value,numerator:root.querySelector('#num').value,denominator:root.querySelector('#den').value};
  if(['decimal','number'].includes(task.answerType))return{value:root.querySelector('#value').value};
  if(['choice','comparison'].includes(task.answerType))return{value:root.querySelector('#choice-value').value};
  return{};
}
