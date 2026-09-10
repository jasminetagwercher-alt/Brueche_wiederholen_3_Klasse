export function chooseSupportMode({phase,skillState,task}){
  if(!task?.solutionPlan)return'free';
  if(phase==='diagnostic'||phase==='final')return'free';
  const confidence=skillState?.confidence||'noch nicht geprüft';
  if(phase==='training'){
    if(confidence==='unsicher'||confidence==='noch nicht geprüft')return'guided';
    if(confidence==='im Aufbau')return'partial';
    return'free';
  }
  if(phase==='mix'){
    if(confidence==='unsicher')return'partial';
    return'free';
  }
  return'free';
}

export function supportLabel(mode){
  return{guided:'Geführter Rechenweg',partial:'Teilweise geführter Rechenweg',free:'Freies Rechnen'}[mode]||'Freies Rechnen';
}
