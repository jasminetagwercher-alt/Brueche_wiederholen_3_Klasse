import {MISSIONS,missionDashboardSummary,missionProgress,missionStatus} from '../learning/missions.js';

function escapeHtml(value){return String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}

export function journeyNav(stage){
  const order=['diagnostic','missions','final'];
  const current=Math.max(0,order.indexOf(stage));
  const labels={diagnostic:'Schnellcheck',missions:'Missionen',final:'Final Check'};
  return `<nav class="journey-nav" aria-label="Bruch-Check Lernweg">${order.map((id,index)=>{
    const state=index<current?'done':index===current?'current':'upcoming';
    return `<span class="journey-step ${state}" ${state==='current'?'aria-current="step"':''}><span class="journey-dot">${index<current?'✓':index+1}</span><span>${labels[id]}</span></span>`;
  }).join('')}</nav>`;
}

export function progressDots(current,total){
  return `<div class="progress-dots" aria-label="Fortschritt: Aufgabe ${Math.min(current+1,total)}"><span class="sr-only">Aufgabe ${Math.min(current+1,total)} von ${total}</span>${Array.from({length:total},(_,index)=>`<span class="progress-dot ${index<current?'done':index===current?'current':''}" aria-hidden="true"></span>`).join('')}</div>`;
}

function cardStateText(status,progress){
  if(status==='completed')return'Mission geschafft';
  if(status==='in_progress')return`Begonnen · ${progress.index} von ${progress.total} erledigt`;
  if(status==='recommended')return'Training empfohlen';
  if(status==='secure')return'Im Schnellcheck sicher';
  return'Optional';
}

function cardButtonText(status){
  if(status==='completed')return'Noch einmal üben';
  if(status==='in_progress')return'Fortsetzen';
  if(status==='recommended')return'Mission starten';
  if(status==='secure')return'Trotzdem üben';
  return'Ausprobieren';
}

export function missionDashboardTemplate(session){
  const summary=missionDashboardSummary(session);
  const cards=MISSIONS.map(mission=>{
    const status=missionStatus(session,mission),progress=missionProgress(session,mission.id);
    return `<article class="mission-card ${status}">
      <div class="mission-card-top"><span class="mission-code">${mission.code}</span><span class="mission-status">${cardStateText(status,progress)}</span></div>
      <h2>${escapeHtml(mission.title)}</h2>
      <p>${escapeHtml(mission.subtitle)}</p>
      <div class="mission-meta"><span>${mission.length} kurze Aufgaben</span>${status==='recommended'?'<span class="recommended-chip">Empfohlen</span>':''}</div>
      <button class="mission-start ${status==='secure'||status==='completed'?'secondary':''}" data-mission="${mission.id}" data-restart="${status==='completed'?'true':'false'}">${cardButtonText(status)}</button>
    </article>`;
  }).join('');
  const open=summary.recommended;
  const finalText=open>0?`${open} ${open===1?'empfohlene Mission ist':'empfohlene Missionen sind'} noch offen. Du kannst den Final Check trotzdem starten.`:'Alle empfohlenen Missionen sind erledigt. Du bist bereit für den Final Check.';
  return `<section class="card dashboard-card">
    ${journeyNav('missions')}
    <div class="dashboard-hero">
      <div><p class="eyebrow">Dein Bruch-Check</p><h1>Wähle deine nächste Mission</h1><p class="lead">Du musst nicht alles bearbeiten. Sichere Bereiche kannst du überspringen. Trainiere dort, wo es dir etwas bringt.</p></div>
      <div class="dashboard-score"><strong>${summary.secure}</strong><span>von ${summary.total}<br>sicher oder geschafft</span></div>
    </div>
    <div class="dashboard-summary"><span><strong>${summary.completed}</strong> Missionen geschafft</span><span><strong>${open}</strong> empfohlen</span></div>
    <div class="mission-grid">${cards}</div>
    <section class="final-panel ${open===0?'ready':''}">
      <div><p class="eyebrow">Final Check</p><h2>Zeig, dass du die passende Strategie selbst erkennst.</h2><p>${finalText}</p></div>
      <button id="startFinal" class="${open>0?'secondary':''}">${open>0?'Final Check trotzdem starten':'Final Check starten'}</button>
    </section>
  </section>`;
}

export function missionCompleteTemplate({mission,stats}){
  return `<section class="card mission-complete-card">
    ${journeyNav('missions')}
    <div class="mission-complete-mark">✓</div>
    <p class="eyebrow">Mission geschafft</p>
    <h1>${escapeHtml(mission.title)}</h1>
    <p class="lead">Dieser Bereich ist erledigt. Du kannst jetzt aufhören oder dir eine andere Mission aussuchen.</p>
    <div class="mission-result-grid">
      <div><strong>${stats.total}</strong><span>Aufgaben gelöst</span></div>
      <div><strong>${stats.independent}</strong><span>selbstständig</span></div>
      <div><strong>${stats.withHelp}</strong><span>mit Hilfe</span></div>
    </div>
    <div class="actions"><button id="backToMissions">Zu meinen Missionen</button></div>
  </section>`;
}

export function quickBreakTemplate(completed,total){
  return `<section class="card quick-break-card">
    ${journeyNav('diagnostic')}
    <div class="quick-break-mark">Ⅱ</div>
    <p class="eyebrow">Kurzer Stopp</p>
    <h1>Halbzeit im Schnellcheck</h1>
    <p class="lead">${completed} kurze Aufgaben sind geschafft. Schau einen Moment vom Bildschirm weg und mach weiter, wenn du bereit bist.</p>
    ${progressDots(completed,total)}
    <div class="actions"><button id="continueQuickCheck">Weiter</button></div>
  </section>`;
}
