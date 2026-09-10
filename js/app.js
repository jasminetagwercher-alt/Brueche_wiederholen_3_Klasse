import {CONFIG} from './config.js';
import {LocalStorageAdapter} from './storage/local-storage.js';
import {RemoteStorageAdapter} from './storage/remote-storage.js';
import {createSession,recordAttempt,scorePhase,exportSession} from './learning/session.js';
import {adaptDifficulty} from './learning/adaptive-engine.js';
import {chooseSupportMode,supportLabel} from './learning/support-engine.js';
import {DIAGNOSTIC_SKILLS,FINAL_SKILLS,buildMissionSequence,getMission,missionDashboardSummary} from './learning/missions.js';
import {generateTask} from './generators/registry.js';
import {validateAnswer} from './core/answer-validator.js';
import {inputTemplate,wireInput,collectAnswer} from './ui/inputs.js';
import {renderAllMath} from './ui/math-renderer.js';
import {NumberLine} from './ui/number-line.js';
import {CalculationLine} from './ui/calculation-line.js';
import {renderStrategyHelp} from './ui/strategy-help.js';
import {hasStrategy} from './didactics/strategy-registry.js';
import {journeyNav,missionDashboardTemplate,missionCompleteTemplate,progressDots,quickBreakTemplate} from './ui/mission-dashboard.js';

const root=document.querySelector('#app');
const local=new LocalStorageAdapter(CONFIG.storageKey);
const remote=new RemoteStorageAdapter(CONFIG.remoteStorageUrl);

let session=hydrateSession(await local.load());
let sequence=[];
let currentTask=null;
let hintLevel=0;
let numberLine=null;
let calculationLine=null;
let orderItems=[];
let draftAnswer=null;
let supportMode='free';
let strategyOpened=false;
let strategyHelpUsed=false;

function hydrateSession(value){
  if(!value)return null;
  value.recentTaskSignatures??=[];
  value.phaseSequence??=null;
  value.quickBreakSeen??=false;
  value.missions??={};
  value.activeMission??=null;
  return value;
}

function escapeHtml(value){
  return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function page(html){
  root.innerHTML=html;
  renderAllMath(root);
  window.scrollTo({top:0,behavior:'smooth'});
}

function save(){return local.save(session)}

function resetTaskState(){
  currentTask=null;
  hintLevel=0;
  numberLine=null;
  calculationLine=null;
  orderItems=[];
  draftAnswer=null;
  supportMode='free';
  strategyOpened=false;
  strategyHelpUsed=false;
}

function rememberTask(task){
  if(!task?.signature)return;
  session.recentTaskSignatures.push(task.signature);
  session.recentTaskSignatures=session.recentTaskSignatures.slice(-CONFIG.recentTaskMemory);
}

function showStart(){
  const saved=session&&!session.completed&&session.profile?.name;
  page(`<section class="card start-card">
    <p class="eyebrow">Mathematik · 3. Klasse Mittelschule</p>
    <h1>Bruch-Check</h1>
    <p class="lead">Ein kurzer Schnellcheck zeigt, was schon sitzt. Danach trainierst du nur die Bereiche, die dir wirklich etwas bringen.</p>
    <div class="start-journey">
      <div><strong>1</strong><span>Schnellcheck</span><small>10 kurze Aufgaben</small></div>
      <div><strong>2</strong><span>Missionen</span><small>Du wählst, was du trainierst.</small></div>
      <div><strong>3</strong><span>Final Check</span><small>Zeig, was jetzt sicher klappt.</small></div>
    </div>
    ${saved?`
      <div class="feedback">Gespeicherter Stand für <strong>${escapeHtml(session.profile.name)}</strong> gefunden.</div>
      <div class="actions"><button id="resume">Fortsetzen</button><button id="restart" class="secondary">Neu starten</button></div>
    `:`
      <div class="grid two profile-fields">
        <label class="field">Name oder Kürzel<input id="name" autocomplete="off"></label>
        <label class="field">Klasse<input id="class" value="3b" autocomplete="off"></label>
      </div>
      <div class="actions"><button id="start">Schnellcheck starten</button></div>
    `}
  </section>`);

  if(saved){
    root.querySelector('#resume').onclick=resumeSession;
    root.querySelector('#restart').onclick=async()=>{await local.clear();session=null;showStart()};
  }else{
    root.querySelector('#start').onclick=async()=>{
      const name=root.querySelector('#name').value.trim();
      if(!name){root.querySelector('#name').focus();return}
      session=createSession({name,className:root.querySelector('#class').value.trim()});
      await save();
      beginDiagnostic();
    };
  }
}

function resumeSession(){
  if(!session)return showStart();
  if(session.completed||session.phase==='results')return showResults();
  if(session.phase==='dashboard')return showDashboard();
  if(session.phase==='mission'&&session.activeMission)return startMission(session.activeMission);
  if(session.phase==='final')return beginFinal({resume:true});
  return beginDiagnostic({resume:true});
}

function beginDiagnostic({resume=false}={}){
  session.phase='diagnostic';
  session.activeMission=null;
  sequence=resume&&session.phaseSequence?.phase==='diagnostic'
    ?[...session.phaseSequence.items]
    :DIAGNOSTIC_SKILLS.slice(0,CONFIG.diagnosticLength);
  if(!resume)session.taskIndex=0;
  session.phaseSequence={phase:'diagnostic',items:[...sequence]};
  resetTaskState();
  void save();
  showTask();
}

function beginFinal({resume=false}={}){
  session.phase='final';
  session.activeMission=null;
  sequence=resume&&session.phaseSequence?.phase==='final'
    ?[...session.phaseSequence.items]
    :FINAL_SKILLS.slice(0,CONFIG.finalLength);
  if(!resume)session.taskIndex=0;
  session.phaseSequence={phase:'final',items:[...sequence]};
  resetTaskState();
  void save();
  showTask();
}

function ensureMissionProgress(id){
  const mission=getMission(id);if(!mission)return null;
  session.missions[id]??={completed:false,index:0,sequence:null,runs:0,startedAt:null,completedAt:null};
  return session.missions[id];
}

function startMission(id,{restart=false}={}){
  const mission=getMission(id);if(!mission)return showDashboard();
  const progress=ensureMissionProgress(id);
  const needsNew=restart||!Array.isArray(progress.sequence)||progress.sequence.length===0||progress.index>=progress.sequence.length;
  if(needsNew){
    progress.sequence=buildMissionSequence(id,session.skills);
    progress.index=0;
    progress.completed=false;
    progress.startedAt=new Date().toISOString();
  }
  session.phase='mission';
  session.activeMission=id;
  session.taskIndex=progress.index||0;
  session.phaseSequence=null;
  sequence=[...progress.sequence];
  resetTaskState();
  void save();
  showTask();
}

function showDashboard({justFinishedDiagnostic=false}={}){
  session.phase='dashboard';
  session.activeMission=null;
  session.taskIndex=0;
  session.phaseSequence=null;
  resetTaskState();
  void save();
  page(missionDashboardTemplate(session,{justFinishedDiagnostic}));
  root.querySelectorAll('.mission-start').forEach(button=>{
    button.onclick=()=>startMission(button.dataset.mission,{restart:button.dataset.restart==='true'});
  });
  root.querySelector('#startFinal').onclick=()=>beginFinal();
}

function taskContext(){
  if(session.phase==='diagnostic')return{stage:'diagnostic',eyebrow:'Schnellcheck',title:'Was sitzt schon?',label:`Frage ${session.taskIndex+1}`,mission:null};
  if(session.phase==='final')return{stage:'final',eyebrow:'Final Check',title:'Gemischte Aufgaben',label:`Aufgabe ${session.taskIndex+1}`,mission:null};
  const mission=getMission(session.activeMission);
  return{stage:'missions',eyebrow:'Mission',title:mission?.title||'Training',label:`Aufgabe ${session.taskIndex+1}`,mission};
}

function shouldShowQuickBreak(){
  return session.phase==='diagnostic'&&!session.quickBreakSeen&&session.taskIndex===CONFIG.quickBreakAfter;
}

function showQuickBreak(){
  page(quickBreakTemplate(session.taskIndex,sequence.length));
  root.querySelector('#continueQuickCheck').onclick=()=>{
    session.quickBreakSeen=true;
    void save();
    showTask({skipQuickBreak:true});
  };
}

function showTask({reuse=false,skipQuickBreak=false}={}){
  if(session.taskIndex>=sequence.length)return finishCurrentBlock();
  if(!skipQuickBreak&&shouldShowQuickBreak())return showQuickBreak();

  if(!reuse){
    hintLevel=0;
    strategyOpened=false;
    strategyHelpUsed=false;
    calculationLine=null;
    numberLine=null;
    orderItems=[];
  }

  const skill=sequence[session.taskIndex];
  if(!reuse||!currentTask||currentTask.skill!==skill){
    const skillState=session.skills[skill]||{difficulty:1,errors:0,correctNoHelp:0};
    currentTask=generateTask(skill,adaptDifficulty(skillState),{avoidSignatures:session.recentTaskSignatures});
    rememberTask(currentTask);
    draftAnswer=null;
    void save();
  }

  supportMode=chooseSupportMode({phase:session.phase,skillState:session.skills[skill],task:currentTask});
  const usesCalcLine=Boolean(currentTask.solutionPlan&&supportMode!=='free');
  const strategyAvailable=session.phase==='mission'&&hasStrategy(skill);
  const context=taskContext();
  const supportBadge=session.phase==='mission'&&currentTask.solutionPlan
    ?`<span class="support-badge">${escapeHtml(supportLabel(supportMode))}</span>`:'';
  const missionCode=context.mission?`<span class="mission-mini-code">${context.mission.code}</span>`:'';
  const dashboardButton=session.phase==='mission'?'<button id="toDashboard" class="text-button" type="button">Missionen</button>':'';
  const promptMath=!usesCalcLine&&currentTask.promptTex
    ?`<div class="math question-math" data-tex="${escapeHtml(currentTask.promptTex)}"></div>`:'';

  page(`<section class="card task-card">
    ${journeyNav(context.stage)}
    <div class="task-toolbar">
      <div>
        <span class="eyebrow">${context.eyebrow}</span>
        <div class="task-mission-title">${missionCode}<strong>${escapeHtml(context.title)}</strong></div>
      </div>
      <div class="toolbar-actions">${supportBadge}${dashboardButton}</div>
    </div>
    <div class="task-context-row">${progressDots(session.taskIndex,sequence.length)}<span class="task-context-label">${context.label}</span></div>
    <div class="question"><p>${escapeHtml(currentTask.promptText||'')}</p>${promptMath}</div>
    <div id="interaction" class="interaction"></div>
    <div id="strategyHelp"></div>
    <div id="feedback"></div>
    <div id="hint"></div>
    <div class="actions task-actions">
      <button id="check">Prüfen</button>
      <button id="hintBtn" class="secondary">Hinweis</button>
      ${strategyAvailable?'<button id="strategyBtn" class="secondary" type="button">So geht’s</button>':''}
    </div>
  </section>`);

  const interaction=root.querySelector('#interaction');
  if(usesCalcLine){
    calculationLine=new CalculationLine(interaction,currentTask,{mode:supportMode});
  }else if(currentTask.type==='numberLine'){
    interaction.innerHTML='<p class="interaction-note">Klicke auf die passende Stelle oder bewege die Markierung mit den Pfeiltasten.</p><div id="numberline"></div>';
    numberLine=new NumberLine(interaction.querySelector('#numberline'),currentTask.numberLine);
  }else if(currentTask.type==='order'){
    if(!reuse||!orderItems.length)orderItems=currentTask.items.map(x=>x);
    interaction.innerHTML='<p class="interaction-note">Verschiebe die Brüche mit den Pfeilen, bis die Reihenfolge stimmt.</p><div id="orderMount"></div>';
    renderOrder(interaction.querySelector('#orderMount'));
  }else{
    interaction.innerHTML=inputTemplate(currentTask);
    wireInput(interaction,currentTask);
  }

  restoreDraft();
  root.querySelector('#check').onclick=checkCurrent;
  root.querySelector('#hintBtn').onclick=showHint;
  root.querySelector('#strategyBtn')?.addEventListener('click',toggleStrategyHelp);
  root.querySelector('#toDashboard')?.addEventListener('click',()=>{stashDraft();returnToDashboard()});
  renderAllMath(root);
}

function returnToDashboard(){
  if(session.phase==='mission'&&session.activeMission){
    const progress=ensureMissionProgress(session.activeMission);
    progress.index=session.taskIndex;
  }
  showDashboard();
}

function toggleStrategyHelp(){
  const mount=root.querySelector('#strategyHelp'),button=root.querySelector('#strategyBtn');
  if(!mount||!button)return;
  strategyOpened=!strategyOpened;
  if(strategyOpened){
    renderStrategyHelp(mount,currentTask.skill);
    button.textContent='Erklärung schließen';
    if(!strategyHelpUsed){
      strategyHelpUsed=true;
      hintLevel=Math.max(1,hintLevel);
      session.hintsUsed++;
      void save();
    }
    mount.querySelector('#closeStrategy')?.addEventListener('click',()=>{
      strategyOpened=false;
      mount.innerHTML='';
      button.textContent='So geht’s';
    });
  }else{
    mount.innerHTML='';
    button.textContent='So geht’s';
  }
}

function stashDraft(){
  if(!currentTask)return;
  try{
    if(calculationLine)draftAnswer={calculation:calculationLine.exportState()};
    else if(currentTask.type==='numberLine')draftAnswer={value:numberLine?.getAnswer()};
    else if(currentTask.type==='order')draftAnswer={order:[...orderItems]};
    else draftAnswer=collectAnswer(root.querySelector('#interaction'),currentTask);
  }catch{draftAnswer=null}
}

function restoreDraft(){
  if(!draftAnswer||!currentTask)return;
  const interaction=root.querySelector('#interaction');
  if(calculationLine&&draftAnswer.calculation){calculationLine.restoreState(draftAnswer.calculation);return}
  if(currentTask.type==='numberLine'&&Number.isFinite(draftAnswer.value)){
    numberLine.value=draftAnswer.value;
    const dot=interaction.querySelector('.number-line-target');
    if(dot){const p=(draftAnswer.value-numberLine.min)/(numberLine.max-numberLine.min)*100;dot.style.left=`${p}%`}
    return;
  }
  if(currentTask.type==='order'&&draftAnswer.order){
    orderItems=[...draftAnswer.order];
    renderOrder(interaction.querySelector('#orderMount'));
    return;
  }
  const pairs={whole:draftAnswer.whole,num:draftAnswer.numerator,den:draftAnswer.denominator,value:draftAnswer.value};
  Object.entries(pairs).forEach(([id,value])=>{
    const input=interaction.querySelector(`#${id}`);
    if(input&&value!==undefined){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}))}
  });
  if(draftAnswer.value!==undefined&&['choice','comparison'].includes(currentTask.answerType)){
    const button=[...interaction.querySelectorAll('.choice')].find(b=>b.dataset.value===String(draftAnswer.value));
    button?.click();
  }
}

function renderOrder(container){
  container.innerHTML=`<div class="order-list">${orderItems.map((f,i)=>`
    <div class="order-item">
      <span class="order-position">${i+1}</span>
      <span class="order-fraction" data-tex="\\frac{${f.numerator}}{${f.denominator}}"></span>
      <div class="order-controls">
        <button class="secondary move" data-i="${i}" data-dir="-1" aria-label="Bruch nach links verschieben">←</button>
        <button class="secondary move" data-i="${i}" data-dir="1" aria-label="Bruch nach rechts verschieben">→</button>
      </div>
    </div>`).join('')}</div>`;
  container.querySelectorAll('.move').forEach(button=>button.onclick=()=>{
    const i=Number(button.dataset.i),j=i+Number(button.dataset.dir);
    if(j<0||j>=orderItems.length)return;
    [orderItems[i],orderItems[j]]=[orderItems[j],orderItems[i]];
    renderOrder(container);
  });
  renderAllMath(container);
}

function hintLine(text){
  const value=String(text||'');
  if(value.includes('\\'))return `<div class="hint-line math" data-tex="${escapeHtml(value)}"></div>`;
  return `<div class="hint-line">${escapeHtml(value)}</div>`;
}

function showHint(){
  const hints=currentTask.hints||[],solutions=currentTask.solutionSteps||[];
  if(hintLevel<4){hintLevel++;session.hintsUsed++;void save()}
  let content;
  if(calculationLine?.activeStep&&hintLevel<=2)content=hintLine(calculationLine.activeStep.prompt);
  else if(hintLevel<=2)content=hintLine(hints[Math.min(hintLevel-1,hints.length-1)]||'Überlege, welche bekannte Bruchregel hier passt.');
  else if(hintLevel===3)content=hintLine(solutions[0]||hints.at(-1)||'Zerlege die Aufgabe in kleine Rechenschritte.');
  else content=(solutions.length?solutions:[`Die Lösung lautet ${formatAnswer(currentTask.correctAnswer)}.`]).map(hintLine).join('');
  root.querySelector('#hint').innerHTML=`<div class="hint"><div class="hint-title"><strong>Hilfe ${hintLevel} von 4</strong><span>${hintLevel===4?'Lösungsweg':'Noch ohne vollständige Lösung'}</span></div>${content}</div>`;
  renderAllMath(root);
}

function formatAnswer(answer){
  if(answer?.numerator!==undefined)return `${answer.numerator}/${answer.denominator}`;
  return String(answer);
}

function setFeedback(result,detail=''){
  const cls=result.status==='correct'?'ok':result.status==='almost'?'warn':'error';
  root.querySelector('#feedback').innerHTML=`<div class="feedback ${cls}">${escapeHtml(result.message||'')}${detail}</div>`;
}

function recordWrong(result,raw){
  recordAttempt(session,currentTask,{status:'wrong',correct:false,message:result.message,misconception:result.misconception||null},hintLevel,raw);
  void save();
}

function checkCurrent(){
  const button=root.querySelector('#check');
  button.disabled=true;

  if(calculationLine){
    const stepBefore=calculationLine.activeStep;
    const rawStep=calculationLine.collect();
    const stepResult=calculationLine.checkCurrent();
    if(!stepResult.valid){
      setFeedback({status:'error',message:stepResult.message});
      button.disabled=false;
      return;
    }
    if(!stepResult.correct){
      recordWrong({message:stepResult.message}, {kind:'calculation-step',step:stepBefore?.id||null,value:rawStep});
      setFeedback({status:'error',message:stepResult.message});
      button.disabled=false;
      return;
    }
    if(!stepResult.complete){
      setFeedback({status:'correct',message:stepResult.message},'<span class="feedback-detail">Der nächste Rechenschritt ist jetzt aktiv.</span>');
      button.disabled=false;
      return;
    }
    const result={status:'correct',correct:true,message:'Der Rechenweg stimmt.'};
    recordAttempt(session,currentTask,result,hintLevel,calculationLine.getRawAnswer());
    void save();
    showCorrectResult(result);
    return;
  }

  let result,raw;
  if(currentTask.type==='numberLine'){
    raw={value:numberLine.getAnswer()};
    result=numberLine.isCorrect()
      ?{status:'correct',correct:true,message:'Richtig platziert.'}
      :{status:'wrong',correct:false,message:'Noch nicht an der richtigen Stelle. Achte auf die Unterteilungen.'};
  }else if(currentTask.type==='order'){
    raw=orderItems.map(x=>x.toJSON());
    const correct=orderItems.every((x,i)=>x.equals(currentTask.correctAnswer[i]));
    result=correct
      ?{status:'correct',correct:true,message:'Richtig geordnet.'}
      :{status:'wrong',correct:false,message:'Die Reihenfolge stimmt noch nicht. Vergleiche zuerst benachbarte Brüche.'};
  }else{
    raw=collectAnswer(root.querySelector('#interaction'),currentTask);
    result=validateAnswer(currentTask,raw);
  }

  if(result.status==='invalid'||result.status==='almost'){
    setFeedback(result);
    button.disabled=false;
    return;
  }

  recordAttempt(session,currentTask,result,hintLevel,raw);
  void save();

  if(result.correct)showCorrectResult(result);
  else{
    setFeedback(result);
    button.disabled=false;
  }
}

function showCorrectResult(result){
  const reinforcement=hintLevel===0
    ?'<span class="feedback-detail">Selbstständig gelöst.</span>'
    :'<span class="feedback-detail">Mit Unterstützung gelöst. Eine ähnliche Aufgabe kann später wiederkommen.</span>';
  setFeedback(result,reinforcement);
  root.querySelector('#feedback').innerHTML+=`<div class="actions"><button id="next">Weiter</button></div>`;
  root.querySelector('#next').onclick=advanceTask;
}

function advanceTask(){
  session.taskIndex++;
  if(session.phase==='mission'&&session.activeMission){
    const progress=ensureMissionProgress(session.activeMission);
    progress.index=session.taskIndex;
  }
  resetTaskState();
  void save();
  showTask();
}

function missionRunStats(id,startedAt){
  const rows=session.answers.filter(a=>a.missionId===id&&(!startedAt||a.timestamp>=startedAt));
  const solvedIds=[...new Set(rows.filter(a=>a.correct).map(a=>a.taskId))];
  const independent=solvedIds.filter(taskId=>{
    const taskRows=rows.filter(a=>a.taskId===taskId);
    return !taskRows.some(a=>!a.correct)&&taskRows.some(a=>a.correct&&(a.hintLevel||0)===0);
  }).length;
  return{total:solvedIds.length,independent,withHelp:Math.max(0,solvedIds.length-independent)};
}

async function finishCurrentBlock(){
  if(session.phase==='diagnostic'){
    session.diagnosticScore=scorePhase(session,'diagnostic');
    session.phaseSequence=null;
    session.taskIndex=0;
    await save();
    showDashboard({justFinishedDiagnostic:true});
    return;
  }
  if(session.phase==='mission'){
    const id=session.activeMission,mission=getMission(id),progress=ensureMissionProgress(id);
    progress.completed=true;
    progress.index=sequence.length;
    progress.completedAt=new Date().toISOString();
    progress.runs=(progress.runs||0)+1;
    const stats=missionRunStats(id,progress.startedAt);
    session.phase='dashboard';
    session.activeMission=null;
    session.taskIndex=0;
    resetTaskState();
    await save();
    page(missionCompleteTemplate({mission,stats}));
    root.querySelector('#backToMissions').onclick=()=>showDashboard();
    return;
  }
  if(session.phase==='final'){
    session.finalScore=scorePhase(session,'final');
    session.completed=true;
    session.phase='results';
    session.phaseSequence=null;
    await save();
    await remote.save(exportSession(session)).catch(()=>null);
    showResults();
  }
}

function showResults(){
  const rows=Object.values(session.skills).filter(s=>s.attempts>0).sort((a,b)=>a.label.localeCompare(b.label));
  const improvement=(session.finalScore??0)-(session.diagnosticScore??0);
  const missionSummary=missionDashboardSummary(session);
  const secure=rows.filter(s=>s.confidence==='sicher').length;
  const practice=rows.filter(s=>s.confidence==='unsicher'||s.confidence==='im Aufbau').length;

  page(`<section class="card results-card">
    ${journeyNav('results')}
    <p class="eyebrow">Bruch-Check abgeschlossen</p>
    <h1>Deine Kompetenzübersicht</h1>
    <div class="result-hero">
      <div><span>Schnellcheck</span><strong>${session.diagnosticScore??0}%</strong></div>
      <div class="result-arrow">→</div>
      <div><span>Final Check</span><strong>${session.finalScore??0}%</strong></div>
      <div class="result-change ${improvement>=0?'positive':''}">${improvement>=0?'+':''}${improvement} Prozentpunkte</div>
    </div>
    <div class="result-summary">
      <div><strong>${missionSummary.completed}</strong><span>Missionen trainiert</span></div>
      <div><strong>${secure}</strong><span>sichere Kompetenzen</span></div>
      <div><strong>${practice}</strong><span>noch im Aufbau</span></div>
      <div><strong>${session.independentCorrect}</strong><span>selbstständig gelöst</span></div>
    </div>
    <div class="skill-list">${rows.map(s=>`<div class="skill-row"><span>${escapeHtml(s.label)}</span><span class="tag ${s.confidence==='sicher'?'secure':''}">${escapeHtml(s.confidence)}</span></div>`).join('')}</div>
    <div class="actions"><button id="export">Ergebnisdaten herunterladen</button><button id="new" class="secondary">Neue Runde</button></div>
  </section>`);

  root.querySelector('#export').onclick=()=>{
    const blob=new Blob([JSON.stringify(exportSession(session),null,2)],{type:'application/json'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=`bruch-check-${session.profile.name||'session'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  root.querySelector('#new').onclick=async()=>{await local.clear();session=null;sequence=[];resetTaskState();showStart()};
}

showStart();
