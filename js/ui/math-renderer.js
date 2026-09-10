export function fracTex(f){return `\\frac{${f.numerator}}{${f.denominator}}`}
export function mixedTex(m){return `${m.whole}\,\\frac{${m.numerator}}{${m.denominator}}`}
export function renderMath(el,tex){if(tex===undefined||tex===null||tex==='')return;if(!/[\\0-9<>=+\-:]/.test(tex)){el.textContent=tex;return}if(window.katex){window.katex.render(tex,el,{throwOnError:false,displayMode:false})}else el.textContent=tex}
export function renderAllMath(root=document){root.querySelectorAll('[data-tex]').forEach(el=>renderMath(el,el.dataset.tex))}
export function decimalDE(value){return String(value).replace('.',',')}
