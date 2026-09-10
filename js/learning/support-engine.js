export function chooseSupportMode({phase,skillState,task}){
  if(!task?.solutionPlan)return'free';
  if(phase==='diagnostic'||phase==='final')return'free';
  const confidence=skillState?.confidence||'noch nicht geprüft';
  const clearFailure=(skillState?.errors||0)>0&&(skillState?.correctNoHelp||0)===0;
  if(phase==='mission'||phase==='training'){
    if(clearFailure||confidence==='unsicher'||confidence==='noch nicht geprüft')return'guided';
    if(confidence==='im Aufbau')return'partial';
    return'free';
  }
  if(phase==='mix'){
    if(clearFailure||confidence==='unsicher')return'partial';
    return'free';
  }
  return'free';
}

export function supportLabel(mode){
  return{guided:'Geführter Rechenweg',partial:'Teilweise geführter Rechenweg',free:'Freies Rechnen'}[mode]||'Freies Rechnen';
}
