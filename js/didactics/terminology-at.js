export const AT_TERMS=Object.freeze({
  numerator:'Zähler',
  denominator:'Nenner',
  fractionBar:'Bruchstrich',
  properFraction:'echter Bruch',
  improperFraction:'unechter Bruch',
  apparentWholeFraction:'uneigentlicher Bruch',
  mixedNumber:'gemischte Zahl',
  equivalentFractions:'gleichwertige Brüche',
  commonDenominator:'gemeinsamer Nenner',
  makeLikeDenominators:'gleichnamig machen',
  reciprocal:'Kehrwert',
  reduce:'kürzen',
  expand:'erweitern',
  dividend:'Dividend',
  divisor:'Divisor',
  product:'Produkt',
  quotient:'Quotient'
});

export function term(key){return AT_TERMS[key]||key}
