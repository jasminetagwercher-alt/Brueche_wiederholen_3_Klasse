export class NumberLine{
  constructor(container,{min=0,max=1,subdivisions=4,target=0.5,mode='place',tolerance=.06}={}){Object.assign(this,{container,min,max,subdivisions,target,mode,tolerance,value:min});this.render()}
  render(){
    const span=this.max-this.min;let ticks='';
    for(let i=0;i<=this.subdivisions;i++){
      const p=i/this.subdivisions*100,v=this.min+span*i/this.subdivisions;
      const showLabel=i===0||i===this.subdivisions||Math.abs(v-Math.round(v))<1e-9;
      ticks+=`<span class="number-line-tick" style="left:${p}%"></span>${showLabel?`<span class="number-line-label" style="left:${p}%">${String(Number(v.toFixed(2))).replace('.',',')}</span>`:''}`;
    }
    const targetP=(this.target-this.min)/span*100;
    this.container.innerHTML=`<div class="number-line" role="application" aria-label="Zahlenstrahl"><div class="number-line-track"></div>${ticks}${this.mode==='read'?`<span class="number-line-mark" style="left:${targetP}%"></span>`:`<span class="number-line-target" tabindex="0" role="slider" aria-valuemin="${this.min}" aria-valuemax="${this.max}" aria-valuenow="${this.min}" style="left:0%" aria-label="Markierung auf dem Zahlenstrahl verschieben"></span>`}</div>`;
    if(this.mode==='place')this.wire();
  }
  setStep(stepIndex){
    const index=Math.max(0,Math.min(this.subdivisions,stepIndex)),p=index/this.subdivisions;
    this.value=this.min+p*(this.max-this.min);
    const dot=this.container.querySelector('.number-line-target');if(dot){dot.style.left=`${p*100}%`;dot.setAttribute('aria-valuenow',String(Number(this.value.toFixed(4))))}
  }
  wire(){
    const line=this.container.querySelector('.number-line'),dot=this.container.querySelector('.number-line-target');
    const set=clientX=>{const r=line.getBoundingClientRect(),p=Math.max(0,Math.min(1,(clientX-r.left)/r.width));this.setStep(Math.round(p*this.subdivisions))};
    line.addEventListener('pointerdown',e=>set(e.clientX));
    dot.addEventListener('keydown',e=>{let current=Math.round((this.value-this.min)/(this.max-this.min)*this.subdivisions);if(['ArrowLeft','ArrowDown'].includes(e.key)){current--;e.preventDefault()}else if(['ArrowRight','ArrowUp'].includes(e.key)){current++;e.preventDefault()}else return;this.setStep(current)});
  }
  getAnswer(){return this.value}
  isCorrect(){return Math.abs(this.value-this.target)<=this.tolerance*(this.max-this.min)}
}
