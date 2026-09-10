const ORDER=['diagnostic','training','mix','final','results'];
const LABELS={diagnostic:'1 · Bruch-Check',training:'2 · Training',mix:'3 · Bruch-Mix',final:'4 · Abschluss',results:'Ergebnis'};

export function phaseRoadmap(current){
  const currentIndex=ORDER.indexOf(current);
  return `<nav class="phase-roadmap" aria-label="Lernstrecke">${ORDER.slice(0,4).map((phase,index)=>{
    const state=index<currentIndex?'done':index===currentIndex?'current':'upcoming';
    return `<span class="phase-step ${state}" aria-current="${state==='current'?'step':'false'}"><span class="phase-dot">${index<currentIndex?'✓':index+1}</span><span>${LABELS[phase].replace(/^\d · /,'')}</span></span>`;
  }).join('')}</nav>`;
}

export function overviewTemplate(session,phaseMeta){
  const current=ORDER.indexOf(session.phase);
  const cards=ORDER.slice(0,4).map((phase,index)=>{
    const meta=phaseMeta[phase],progress=index===current?` · Aufgabe ${Math.min((session.taskIndex||0)+1,meta.length)} von ${meta.length}`:'';
    const state=index<current?'Abgeschlossen':index===current?`Du bist hier${progress}`:'Kommt später';
    return `<div class="overview-stage ${index===current?'active':''}"><span class="stage-number">${index+1}</span><div><strong>${meta.shortTitle||meta.title}</strong><p>${meta.description||''}</p><span class="stage-state">${state}</span></div></div>`;
  }).join('');
  return `<section class="card">${phaseRoadmap(session.phase)}<div class="section-heading"><p class="eyebrow">Deine Lernstrecke</p><h1>Wo du gerade stehst</h1><p>Die Strecke ist bewusst in kurze Abschnitte geteilt. Du kannst nach jedem Stopp aufhören und später an derselben Stelle weitermachen.</p></div><div class="overview-list">${cards}</div><div class="actions"><button id="backToTask">Zur aktuellen Aufgabe</button></div></section>`;
}

export function breakTemplate({session,phaseMeta,completed,total,phaseIndependent}){
  const meta=phaseMeta[session.phase];
  return `<section class="card break-card">${phaseRoadmap(session.phase)}<div class="break-icon" aria-hidden="true">Ⅱ</div><p class="eyebrow">Kurze Pause</p><h1>${completed} von ${total} Aufgaben geschafft</h1><p>Dieser Teil ist erledigt. Schau für einen Moment weg vom Bildschirm, lockere Hände und Schultern und mache weiter, wenn du bereit bist.</p><div class="break-stats"><div><strong>${phaseIndependent}</strong><span>davon ohne Hilfe</span></div><div><strong>${total-completed}</strong><span>Aufgaben in dieser Phase übrig</span></div></div><div class="actions"><button id="continueAfterBreak">Weiter mit ${meta.shortTitle||meta.title}</button><button id="breakOverview" class="secondary">Übersicht</button></div></section>`;
}
