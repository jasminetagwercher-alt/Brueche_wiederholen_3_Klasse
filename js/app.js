import {CONFIG} from './config.js';
import {LocalStorageAdapter} from './storage/local-storage.js';
import {RemoteStorageAdapter} from './storage/remote-storage.js';
import {createSession,recordAttempt,scorePhase,exportSession} from './learning/session.js';
import {phaseSkillSequence,adaptDifficulty} from './learning/adaptive-engine.js';
import {chooseSupportMode,supportLabel} from './learning/support-engine.js';
import {generateTask} from './generators/registry.js';
import {validateAnswer} from './core/answer-validator.js';
import {inputTemplate,wireInput,collectAnswer} from './ui/inputs.js';
import {renderAllMath} from './ui/math-renderer.js';
import {NumberLine} from './ui/number-line.js';
import {CalculationLine} from './ui/calculation-line.js';
import {renderStrategyHelp} from './ui/strategy-help.js';
import {hasStrategy} from './didactics/strategy-registry.js';
import {phaseRoadmap,overviewTemplate,breakTemplate} from './ui/navigation.js';

const root=document.querySelector('#app');
const local=new LocalStorageAdapter(CONFIG.storageKey);
const remote=new RemoteStorageAdapter(CONFIG.remoteStorageUrl);
let session=hydrateSession(await local.load());
let sequence=[],currentTask=null,hintLevel=0,numberLine=null,calculationLine=null,orderItems=[],draftAnswer=null,supportMode='free',strategyOpened=false;

const phaseMeta={
  diagnostic:{title:'Phase 1 – Bruch-Check',shortTitle:'Bruch-Check',length:CONFIG.diagnosticLength,next:'training',description:'Kurzer Standortcheck mit verschiedenen Bruchthemen.',intro:'Du bekommst kurze Aufgaben aus unterschiedlichen Bereichen. Es geht darum herauszufinden, was schon sicher sitzt.'},
  training:{title:'Phase 2 – Individuelles Training',shortTitle:'Training',length:CONFIG.trainingLength,next:'mix',description:'Unsichere Bereiche kommen häufiger, sichere seltener.',intro:'Jetzt richtet sich die Auswahl stärker nach deinem bisherigen Ergebnis. Bei unsicheren Rechenarten wird der Rechenweg zuerst geführt und später schrittweise freier.'},
  mix:{title:'Phase 3 – Bruch-Mix',shortTitle:'Bruch-Mix',length:CONFIG.mixLength,next:'final',description:'Verschiedene Strategien werden bewusst gemischt.',intro:'Jetzt steht nicht mehr über der Aufgabe, welche Rechenidee du brauchst. Entscheide zuerst, was sinnvoll ist. Nur bei Bedarf bleibt ein Teil des Rechenwegs gestützt.'},
  final:{title:'Phase 4 – Abschlusscheck',shortTitle:'Abschlusscheck',length:CONFIG.finalLength,next:'results',description:'Kurzer unabhängiger Check zum Vergleich mit dem Start.',intro:'Zum Schluss kommt ein neuer kurzer Check ohne geführte Rechenwege. Danach siehst du deine Kompetenzübersicht.'}
};

function hydrateSession(value){
  if(!value)return null;
  value.recentTaskSignatures??=[];value.breaksSeen??=[];value.breaksTaken??=0;value.phaseSequence??=null;
  return value;
}
function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function page(html){root.innerHTML=html;renderAllMath(root);window.scrollTo({top:0,behavior:'smooth'})}
function phaseIndependent(phase){return session.answers.filter(a=>a.phase===phase&&a.correct&&a.hintLevel===0).length}
function phaseCompletedAttempts(phase){return new Set(session.answers.filter(a=>a.phase===phase&&a.correct).map(a=>a.taskId)).size}
function currentPart(){return Math.floor(session.taskIndex/CONFIG.breakEvery)+1}
function totalParts(){return Math.ceil(sequence.length/CONFIG.breakEvery)}

function showStart(){
  const saved=session&&!session.completed&&session.profile?.name;
  page(`<section class="card start-card"><p class="eyebrow">Mathematik · 3. Klasse Mittelschule</p><h1>Bruch-Check</h1><p class="lead">Vier überschaubare Abschnitte statt einer langen Aufgabenserie. Dazwischen gibt es kurze Stopps. Es wird keine Schulnote vergeben.</p><div class="start-roadmap"><div><strong>1</strong><span>Bruch-Check</span></div><div><strong>2</strong><span>Training</span></div><div><strong>3</strong><span>Bruch-Mix</span></div><div><strong>4</strong><span>Abschluss</span></div></div>${saved?`<div class="feedback">Gespeicherter Stand für <strong>${escapeHtml(session.profile.name)}</strong> gefunden.</div><div class="actions"><button id="resume">Fortsetzen</button><button id="restart" class="secondary">Neu starten</button></div>`:`<div class="grid two profile-fields"><label class="field">Name oder Kürzel<input id="name" autocomplete="off"></label><label class="field">Klasse<input id="class" value="3b" autocomplete="off"></label></div><div class="actions"><button id="start">Bruch-Check starten</button></div>`}</section>`);
  if(saved){
    root.querySelector('#resume').onclick=()=>resumeSession();
    root.querySelector('#restart').onclick=async()=>{await local.clear();session=null;showStart()};
  }else{
    root.querySelector('#start').onclick=async()=>{const name=root.querySelector('#name').value.trim();if(!name){root.querySelector('#name').focus();return}session=createSession({name,className:root.querySelector('#class').value.trim()});await local.save(session);showPhaseIntro('diagnostic',true)};
  }
}

function resumeSession(){
  if(session.completed){showResults();return}
  startPhase(session.phase,session.taskIndex||0,{reuseSavedSequence:true});
}

function showPhaseIntro(phase,isFirst=false){
  const meta=phaseMeta[phase];
  page(`<section class="card phase-intro">${phaseRoadmap(phase)}<p class="eyebrow">${meta.title}</p><h1>${meta.shortTitle}</h1><p class="lead">${meta.intro}</p><div class="section-facts"><span>${meta.length} Aufgaben</span><span>Pause etwa alle ${CONFIG.breakEvery} Aufgaben</span></div><div class="actions"><button id="beginPhase">${isFirst?'Los geht’s':'Abschnitt starten'}</button><button id="introOverview" class="secondary">Übersicht</button></div></section>`);
  root.querySelector('#beginPhase').onclick=()=>startPhase(phase,0,{forceNew:true});
  root.querySelector('#introOverview').onclick=()=>{session.phase=phase;showOverview()};
}

function startPhase(phase,index=0,{forceNew=false,reuseSavedSequence=false}={}){
  session.phase=phase;session.taskIndex=index;
  const saved=session.phaseSequence;
  if(!forceNew&&(reuseSavedSequence||index>0)&&saved?.phase===phase&&Array.isArray(saved.items)&&saved.items.length){sequence=[...saved.items]}
  else{sequence=phaseSkillSequence(phase,session.skills,phaseMeta[phase].length);session.phaseSequence={phase,items:[...sequence]}}
  currentTask=null;draftAnswer=null;calculationLine=null;void local.save(session);showTask();
}

function taskProgress(){return Math.round(session.taskIndex/sequence.length*100)}
function breakMarker(){return `${session.phase}:${session.taskIndex}`}
function shouldShowBreak(){return session.taskIndex>0&&session.taskIndex<sequence.length&&session.taskIndex%CONFIG.breakEvery===0&&!session.breaksSeen.includes(breakMarker())}
function rememberTask(task){
  if(!task?.signature)return;
  session.recentTaskSignatures.push(task.signature);
  session.recentTaskSignatures=session.recentTaskSignatures.slice(-CONFIG.recentTaskMemory);
}

function showTask({reuse=false,skipBreak=false}={}){
  const meta=phaseMeta[session.phase];
  if(session.taskIndex>=sequence.length){finishPhase();return}
  if(!skipBreak&&shouldShowBreak()){showBreak();return}
  hintLevel=0;strategyOpened=false;calculationLine=null;
  const skill=sequence[session.taskIndex];
  if(!reuse||!currentTask||currentTask.skill!==skill){
    currentTask=generateTask(skill,adaptDifficulty(session.skills[skill]||{difficulty:1,errors:0,correctNoHelp:0}),{avoidSignatures:session.recentTaskSignatures});
    rememberTask(currentTask);draftAnswer=null;void local.save(session);
  }
  supportMode=chooseSupportMode({phase:session.phase,skillState:session.skills[skill],task:currentTask});
  const count=session.taskIndex+1,usesCalcLine=currentTask.solutionPlan&&supportMode!=='free';
  const strategyAvailable=hasStrategy(skill)&&['training','mix'].includes(session.phase);
  const supportBadge=currentTask.solutionPlan&&['training','mix'].includes(session.phase)?`<span class="support-badge">${escapeHtml(supportLabel(supportMode))}</span>`:'';
  const promptMath=!usesCalcLine&&currentTask.promptTex?`<div class="math question-math" data-tex="${escapeHtml(currentTask.promptTex)}"></div>`:'';
  page(`<section class="card task-card">${phaseRoadmap(session.phase)}<div class="task-toolbar"><div><span class="eyebrow">${meta.shortTitle}</span><strong>Aufgabe ${count} von ${sequence.length}</strong></div><div class="toolbar-actions">${supportBadge}<span class="part-label">Teil ${currentPart()} von ${totalParts()}</span><button id="overview" class="text-button" type="button">Übersicht</button></div></div><div class="progress" aria-label="Fortschritt in diesem Abschnitt"><span style="width:${taskProgress()}%"></span></div><div class="question"><p>${currentTask.promptText||''}</p>${promptMath}</div><div id="interaction" class="interaction"></div><div id="strategyHelp"></div><div id="feedback"></div><div id="hint"></div><div class="actions task-actions"><button id="check">Prüfen</button><button id="hintBtn" class="secondary">Hinweis</button>${strategyAvailable?'<button id="strategyBtn" class="secondary" type="button">So geht’s</button>':''}</div></section>`);
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
  }else{interaction.innerHTML=inputTemplate(currentTask);wireInput(interaction,currentTask)}
  restoreDraft();
  root.querySelector('#check').onclick=checkCurrent;
  root.querySelector('#hintBtn').onclick=showHint;
  root.querySelector('#overview').onclick=()=>{stashDraft();showOverview()};
  root.querySelector('#strategyBtn')?.addEventListener('click',toggleStrategyHelp);
  renderAllMath(root);
}

function toggleStrategyHelp(){
  const mount=root.querySelector('#strategyHelp'),button=root.querySelector('#strategyBtn');if(!mount||!button)return;
  strategyOpened=!strategyOpened;
  if(strategyOpened){
    renderStrategyHelp(mount,currentTask.skill);button.textContent='Erklärung schließen';
    hintLevel=Math.max(1,hintLevel);session.hintsUsed++;void local.save(session);
    mount.querySelector('#closeStrategy')?.addEventListener('click',()=>{strategyOpened=false;mount.innerHTML='';button.textContent='So geht’s'});
  }else{mount.innerHTML='';button.textContent='So geht’s'}
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
    numberLine.value=draftAnswer.value;const dot=interaction.querySelector('.number-line-target');if(dot){const p=(draftAnswer.value-numberLine.min)/(numberLine.max-numberLine.min)*100;dot.style.left=`${p}%`}
    return;
  }
  if(currentTask.type==='order'&&draftAnswer.order){orderItems=[...draftAnswer.order];renderOrder(interaction.querySelector('#orderMount'));return}
  const pairs={whole:draftAnswer.whole,num:draftAnswer.numerator,den:draftAnswer.denominator,value:draftAnswer.value};
  Object.entries(pairs).forEach(([id,value])=>{const input=interaction.querySelector(`#${id}`);if(input&&value!==undefined){input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}))}});
  if(draftAnswer.value!==undefined&&['choice','comparison'].includes(currentTask.answerType)){const button=[...interaction.querySelectorAll('.choice')].find(b=>b.dataset.value===String(draftAnswer.value));button?.click()}
}

function showOverview(){
  page(overviewTemplate(session,phaseMeta));
  root.querySelector('#backToTask').onclick=()=>{
    if(!sequence.length||session.phaseSequence?.phase!==session.phase)sequence=session.phaseSequence?.items||phaseSkillSequence(session.phase,session.skills,phaseMeta[session.phase].length);
    if(shouldShowBreak())showBreak();else showTask({reuse:true});
  };
}

function showBreak(){
  const completed=session.taskIndex,total=sequence.length;
  page(breakTemplate({session,phaseMeta,completed,total,phaseIndependent:phaseIndependent(session.phase)}));
  root.querySelector('#continueAfterBreak').onclick=()=>{
    const marker=breakMarker();if(!session.breaksSeen.includes(marker))session.breaksSeen.push(marker);session.breaksTaken=(session.breaksTaken||0)+1;currentTask=null;draftAnswer=null;calculationLine=null;void local.save(session);showTask({skipBreak:true});
  };
  root.querySelector('#breakOverview').onclick=showOverview;
}

function renderOrder(container){
  container.innerHTML=`<div class="order-list">${orderItems.map((f,i)=>`<div class="order-item"><span class="order-position">${i+1}</span><span class="order-fraction" data-tex="\\frac{${f.numerator}}{${f.denominator}}"></span><div class="order-controls"><button class="secondary move" data-i="${i}" data-dir="-1" aria-label="Bruch nach links verschieben">←</button><button class="secondary move" data-i="${i}" data-dir="1" aria-label="Bruch nach rechts verschieben">→</button></div></div>`).join('')}</div>`;
  container.querySelectorAll('.move').forEach(button=>button.onclick=()=>{const i=Number(button.dataset.i),j=i+Number(button.dataset.dir);if(j<0||j>=orderItems.length)return;[orderItems[i],orderItems[j]]=[orderItems[j],orderItems[i]];renderOrder(container)});renderAllMath(container);
}

function hintLine(text){
  const value=String(text||'');
  if(value.includes('\\'))return `<div class="hint-line math" data-tex="${escapeHtml(value)}"></div>`;
  return `<div class="hint-line">${escapeHtml(value)}</div>`;
}
function showHint(){
  const hints=currentTask.hints||[],solutions=currentTask.solutionSteps||[];
  hintLevel=Math.min(4,hintLevel+1);session.hintsUsed++;
  let content;
  if(calculationLine?.activeStep&&hintLevel<=2)content=hintLine(calculationLine.activeStep.prompt);
  else if(hintLevel<=2)content=hintLine(hints[Math.min(hintLevel-1,hints.length-1)]||'Überlege, welche bekannte Bruchregel hier passt.');
  else if(hintLevel===3)content=hintLine(solutions[0]||hints.at(-1)||'Zerlege die Aufgabe in kleine Rechenschritte.');
  else content=(solutions.length?solutions:[`Die Lösung lautet ${formatAnswer(currentTask.correctAnswer)}.`]).map(hintLine).join('');
  root.querySelector('#hint').innerHTML=`<div class="hint"><div class="hint-title"><strong>Hilfe ${hintLevel} von 4</strong><span>${hintLevel===4?'Lösungsweg':'Noch ohne vollständige Lösung'}</span></div>${content}</div>`;
  renderAllMath(root);void local.save(session);
}
function formatAnswer(answer){if(answer?.numerator!==undefined)return `${answer.numerator}/${answer.denominator}`;return String(answer)}

function feedback(result,detail=''){
  const fb=root.querySelector('#feedback'),cls=result.status==='correct'?'ok':result.status==='almost'?'warn':'error';
  fb.innerHTML=`<div class="feedback ${cls}">${escapeHtml(result.message)}${detail}</div>`;
}

function checkCurrent(){
  const btn=root.querySelector('#check');btn.disabled=true;let result,raw;
  if(calculationLine){
    const stepResult=calculationLine.checkCurrent();
    if(!stepResult.valid||!stepResult.correct){feedback({status:'wrong',message:stepResult.message});btn.disabled=false;return}
    if(!stepResult.complete){feedback({status:'correct',message:stepResult.message},'<span class="feedback-detail">Der nächste Schritt erscheint direkt in derselben Rechenzeile.</span>');btn.disabled=false;return}
    raw=calculationLine.getRawAnswer();result={status:'correct',correct:true,message:'Der Rechenweg stimmt.'};
  }else if(currentTask.type==='numberLine'){
    raw={value:numberLine.getAnswer()};result=numberLine.isCorrect()?{status:'correct',correct:true,message:'Richtig platziert.'}:{status:'wrong',correct:false,message:'Noch nicht an der richtigen Stelle. Achte auf die Unterteilungen.'};
  }else if(currentTask.type==='order'){
    raw=orderItems.map(x=>x.toJSON());const correct=orderItems.every((x,i)=>x.equals(currentTask.correctAnswer[i]));result=correct?{status:'correct',correct:true,message:'Richtig geordnet.'}:{status:'wrong',correct:false,message:'Die Reihenfolge stimmt noch nicht. Vergleiche zuerst benachbarte Brüche.'};
  }else{raw=collectAnswer(root.querySelector('#interaction'),currentTask);result=validateAnswer(currentTask,raw)}
  if(!result.correct){feedback(result);if(result.status==='invalid'||result.status==='almost'||result.status==='wrong')btn.disabled=false;return}
  const effectiveHelp=supportMode==='free'?hintLevel:Math.max(1,hintLevel);
  const detail=supportMode==='guided'?'<span class="feedback-detail">Mit geführtem Rechenweg gelöst. Wenn das sicher klappt, wird die Unterstützung später reduziert.</span>':supportMode==='partial'?'<span class="feedback-detail">Mit teilweise geführtem Rechenweg gelöst.</span>':effectiveHelp===0?'<span class="feedback-detail">Ohne Hilfe gelöst.</span>':'<span class="feedback-detail">Mit Hinweis gelöst – ähnliche Aufgaben kommen später wieder.</span>';
  feedback(result,detail);
  recordAttempt(session,currentTask,result,effectiveHelp,raw);void local.save(session);
  const fb=root.querySelector('#feedback');fb.innerHTML+=`<div class="actions"><button id="next">Weiter</button></div>`;
  root.querySelector('#next').onclick=()=>{session.taskIndex++;currentTask=null;draftAnswer=null;orderItems=[];calculationLine=null;void local.save(session);showTask()};
}

async function finishPhase(){
  const finished=session.phase;
  if(finished==='diagnostic')session.diagnosticScore=scorePhase(session,'diagnostic');
  if(finished==='final')session.finalScore=scorePhase(session,'final');
  const next=phaseMeta[finished].next;
  if(next==='results'){
    session.completed=true;session.phaseSequence=null;await local.save(session);await remote.save(exportSession(session)).catch(()=>null);showResults();return;
  }
  const completed=phaseCompletedAttempts(finished),independent=phaseIndependent(finished);
  session.phase=next;session.taskIndex=0;session.phaseSequence=null;currentTask=null;sequence=[];calculationLine=null;await local.save(session);
  page(`<section class="card break-card section-complete">${phaseRoadmap(next)}<div class="break-icon" aria-hidden="true">✓</div><p class="eyebrow">Abschnitt geschafft</p><h1>${phaseMeta[finished].shortTitle} ist abgeschlossen</h1><p>Mach hier ruhig kurz Schluss oder starte den nächsten Abschnitt, wenn du noch konzentriert bist.</p><div class="break-stats"><div><strong>${completed}</strong><span>Aufgaben abgeschlossen</span></div><div><strong>${independent}</strong><span>davon ohne Hilfe</span></div></div><div class="next-section-preview"><span>Als Nächstes</span><strong>${phaseMeta[next].shortTitle}</strong><p>${phaseMeta[next].description}</p></div><div class="actions"><button id="nextPhase">Nächsten Abschnitt ansehen</button><button id="sectionOverview" class="secondary">Übersicht</button></div></section>`);
  root.querySelector('#nextPhase').onclick=()=>showPhaseIntro(next);
  root.querySelector('#sectionOverview').onclick=showOverview;
}

function showResults(){
  const rows=Object.values(session.skills).filter(s=>s.attempts>0).sort((a,b)=>a.label.localeCompare(b.label)),improvement=(session.finalScore??0)-(session.diagnosticScore??0);
  const secure=rows.filter(s=>s.confidence==='sicher').length,practice=rows.filter(s=>s.confidence==='unsicher'||s.confidence==='im Aufbau').length;
  page(`<section class="card results-card">${phaseRoadmap('results')}<p class="eyebrow">Bruch-Check abgeschlossen</p><h1>Deine Kompetenzübersicht</h1><div class="result-hero"><div><span>Start</span><strong>${session.diagnosticScore??0}%</strong></div><div class="result-arrow">→</div><div><span>Abschluss</span><strong>${session.finalScore??0}%</strong></div><div class="result-change ${improvement>=0?'positive':''}">${improvement>=0?'+':''}${improvement} Prozentpunkte</div></div><div class="result-summary"><div><strong>${secure}</strong><span>sichere Bereiche</span></div><div><strong>${practice}</strong><span>Bereiche zum Weiterüben</span></div><div><strong>${session.independentCorrect}</strong><span>selbstständig gelöst</span></div><div><strong>${session.hintsUsed}</strong><span>Hilfen genutzt</span></div></div><div class="skill-list">${rows.map(s=>`<div class="skill-row"><span>${escapeHtml(s.label)}</span><span class="tag ${s.confidence==='sicher'?'secure':''}">${escapeHtml(s.confidence)}</span></div>`).join('')}</div><div class="actions"><button id="export">Ergebnisdaten herunterladen</button><button id="new" class="secondary">Neue Runde</button></div></section>`);
  root.querySelector('#export').onclick=()=>{const blob=new Blob([JSON.stringify(exportSession(session),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`bruch-check-${session.profile.name||'session'}.json`;a.click();URL.revokeObjectURL(a.href)};
  root.querySelector('#new').onclick=async()=>{await local.clear();session=null;sequence=[];currentTask=null;calculationLine=null;showStart()};
}

showStart();
