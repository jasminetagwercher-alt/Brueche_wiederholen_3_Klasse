import {getStrategy} from '../didactics/strategy-registry.js';
import {renderAllMath} from './math-renderer.js';

function escapeHtml(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

export function strategyHelpTemplate(skill){
  const strategy=getStrategy(skill);if(!strategy)return'';
  return `<aside class="strategy-help" aria-label="So geht's"><div class="strategy-help-head"><div><span class="eyebrow">So geht's</span><h3>${escapeHtml(strategy.title)}</h3></div><button type="button" class="text-button" id="closeStrategy" aria-label="Erklärung schließen">Schließen</button></div><p class="strategy-rule">${escapeHtml(strategy.rule)}</p><ol class="strategy-steps">${strategy.steps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol><div class="strategy-example"><span>Beispiel mit anderen Zahlen</span><div class="math" data-tex="${escapeHtml(strategy.exampleTex)}"></div></div></aside>`;
}

export function renderStrategyHelp(container,skill){container.innerHTML=strategyHelpTemplate(skill);renderAllMath(container)}
