import {taskCompletion,taskEstimate} from '../learning/task-sets.js';

function escapeHtml(value){return String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
function fracTex(f){return `\\frac{${f.numerator}}{${f.denominator}}`}

function previewTex(task){
  if(task?.promptTex)return task.promptTex;
  if(task?.type==='order'&&Array.isArray(task.items))return task.items.map(fracTex).join(',\\;');
  return'';
}

function taskRow(task,index,done,current=false){
  const tex=previewTex(task);
  return `<button type="button" class="sheet-task ${done?'done':''} ${current?'current':''}" data-task-index="${index}">
    <span class="sheet-task-number">${done?'✓':index+1}</span>
    <span class="sheet-task-body">
      <span class="sheet-task-prompt">${escapeHtml(task.promptText||'Mathematikaufgabe')}</span>
      ${tex?`<span class="sheet-task-math" data-tex="${escapeHtml(tex)}"></span>`:''}
    </span>
    <span class="sheet-task-state">${done?'erledigt':'offen'}</span>
  </button>`;
}

export function taskSheetTemplate({session,tasks,title,eyebrow='Aufgabenübersicht',description='',journey='',backLabel='',showStart=true,currentIndex=-1}){
  const completion=taskCompletion(session,tasks);
  const done=completion.filter(Boolean).length;
  const remaining=tasks.length-done;
  return `<section class="card task-sheet-card">
    ${journey}
    <div class="sheet-head">
      <div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="lead">${escapeHtml(description)}</p></div>
      <div class="sheet-total"><strong>${tasks.length}</strong><span>Aufgaben</span><small>ca. ${taskEstimate(tasks)}</small></div>
    </div>
    <div class="sheet-status"><span><strong>${done}</strong> erledigt</span><span><strong>${remaining}</strong> offen</span><span>Alle Aufgaben sind von Anfang an sichtbar.</span></div>
    <div class="sheet-task-list">${tasks.map((task,index)=>taskRow(task,index,completion[index],index===currentIndex)).join('')}</div>
    <div class="actions sheet-actions">
      ${showStart&&remaining>0?`<button id="sheetContinue">${done?'Nächste offene Aufgabe':'Starten'}</button>`:''}
      ${backLabel?`<button id="sheetBack" class="secondary">${escapeHtml(backLabel)}</button>`:''}
    </div>
  </section>`;
}

export function taskNavigatorTemplate({session,tasks,currentIndex,label='Aufgaben'}){
  const completion=taskCompletion(session,tasks);
  return `<div class="task-navigator" aria-label="${escapeHtml(label)}">
    <div class="task-nav-top"><span>${escapeHtml(label)}</span><button type="button" id="openTaskSheet" class="text-button">Alle Aufgaben ansehen</button></div>
    <div class="task-nav-buttons">${tasks.map((task,index)=>`<button type="button" class="task-nav-button ${completion[index]?'done':''} ${index===currentIndex?'current':''}" data-task-jump="${index}" aria-label="Aufgabe ${index+1}${completion[index]?', erledigt':''}" ${index===currentIndex?'aria-current="step"':''}>${completion[index]?'✓':index+1}</button>`).join('')}</div>
  </div>`;
}
