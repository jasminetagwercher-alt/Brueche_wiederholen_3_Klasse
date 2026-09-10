export function gcd(a,b){a=Math.abs(Number(a));b=Math.abs(Number(b));while(b){[a,b]=[b,a%b]}return a||1}
export function lcm(a,b){return Math.abs(a*b)/gcd(a,b)}
export class Fraction{
  constructor(numerator,denominator=1){if(!Number.isInteger(numerator)||!Number.isInteger(denominator))throw new TypeError('Brüche benötigen ganze Zahlen.');if(denominator===0)throw new RangeError('Der Nenner darf nicht 0 sein.');if(denominator<0){numerator*=-1;denominator*=-1}this.numerator=numerator;this.denominator=denominator}
  reduce(){const g=gcd(this.numerator,this.denominator);return new Fraction(this.numerator/g,this.denominator/g)}
  expand(factor){if(!Number.isInteger(factor)||factor===0)throw new RangeError('Ungültiger Erweiterungsfaktor.');return new Fraction(this.numerator*factor,this.denominator*factor)}
  add(other){other=asFraction(other);return new Fraction(this.numerator*other.denominator+other.numerator*this.denominator,this.denominator*other.denominator).reduce()}
  subtract(other){other=asFraction(other);return new Fraction(this.numerator*other.denominator-other.numerator*this.denominator,this.denominator*other.denominator).reduce()}
  multiply(other){other=asFraction(other);return new Fraction(this.numerator*other.numerator,this.denominator*other.denominator).reduce()}
  divide(other){other=asFraction(other);if(other.numerator===0)throw new RangeError('Division durch 0.');return new Fraction(this.numerator*other.denominator,this.denominator*other.numerator).reduce()}
  compare(other){other=asFraction(other);return Math.sign(this.numerator*other.denominator-other.numerator*this.denominator)}
  equals(other){return this.compare(other)===0}
  isReduced(){return gcd(this.numerator,this.denominator)===1}
  toMixed(){const whole=Math.trunc(this.numerator/this.denominator);const rem=Math.abs(this.numerator%this.denominator);return{whole,numerator:rem,denominator:this.denominator}}
  toDecimal(){return this.numerator/this.denominator}
  toJSON(){return{numerator:this.numerator,denominator:this.denominator}}
}
export function asFraction(value){return value instanceof Fraction?value:new Fraction(value.numerator,value.denominator)}
export function normalizeFraction(f){return asFraction(f)}
export function reduceFraction(f){return asFraction(f).reduce()}
export function expandFraction(f,k){return asFraction(f).expand(k)}
export function addFractions(a,b){return asFraction(a).add(b)}
export function subtractFractions(a,b){return asFraction(a).subtract(b)}
export function multiplyFractions(a,b){return asFraction(a).multiply(b)}
export function divideFractions(a,b){return asFraction(a).divide(b)}
export function compareFractions(a,b){return asFraction(a).compare(b)}
export function areEquivalentFractions(a,b){return asFraction(a).equals(b)}
export function mixedToImproper(whole,numerator,denominator){if(denominator===0)throw new RangeError('Nenner 0');const sign=whole<0?-1:1;return new Fraction(whole*denominator+sign*numerator,denominator).reduce()}
export function improperToMixed(f){return asFraction(f).toMixed()}
export function decimalToFraction(value){const s=String(value).trim().replace(',','.');if(!/^-?\d+(\.\d+)?$/.test(s))throw new TypeError('Ungültige Dezimalzahl.');const neg=s.startsWith('-');const raw=neg?s.slice(1):s;const [w,d='']=raw.split('.');const den=10**d.length;const num=Number(w)*den+Number(d||0);return new Fraction((neg?-1:1)*num,den).reduce()}
export function fractionToDecimal(f){return asFraction(f).toDecimal()}
export function fractionOfQuantity(f,quantity){const x=asFraction(f).multiply(new Fraction(quantity,1));return x.denominator===1?x.numerator:x}
export function wholeFromFractionPart(f,part){const x=new Fraction(part,1).divide(asFraction(f));return x.denominator===1?x.numerator:x}
