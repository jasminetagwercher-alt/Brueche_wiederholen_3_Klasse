import assert from 'node:assert/strict';
import {gcd,lcm,Fraction,reduceFraction,areEquivalentFractions,addFractions,subtractFractions,multiplyFractions,divideFractions,mixedToImproper,improperToMixed,compareFractions,decimalToFraction,fractionOfQuantity,wholeFromFractionPart} from '../js/core/fraction.js';

assert.equal(gcd(18,24),6);assert.equal(lcm(6,8),24);
assert.deepEqual(reduceFraction(new Fraction(18,24)).toJSON(),{numerator:3,denominator:4});
assert.equal(areEquivalentFractions(new Fraction(3,4),new Fraction(6,8)),true);
assert.deepEqual(addFractions(new Fraction(1,2),new Fraction(1,4)).toJSON(),{numerator:3,denominator:4});
assert.deepEqual(subtractFractions(new Fraction(3,4),new Fraction(1,2)).toJSON(),{numerator:1,denominator:4});
assert.deepEqual(multiplyFractions(new Fraction(2,3),new Fraction(3,5)).toJSON(),{numerator:2,denominator:5});
assert.deepEqual(divideFractions(new Fraction(3,4),new Fraction(2,5)).toJSON(),{numerator:15,denominator:8});
assert.deepEqual(mixedToImproper(3,2,5).toJSON(),{numerator:17,denominator:5});
assert.deepEqual(improperToMixed(new Fraction(7,4)),{whole:1,numerator:3,denominator:4});
assert.equal(compareFractions(new Fraction(2,3),new Fraction(3,4)),-1);
assert.deepEqual(decimalToFraction('0,75').toJSON(),{numerator:3,denominator:4});
assert.equal(fractionOfQuantity(new Fraction(3,4),20),15);
assert.equal(wholeFromFractionPart(new Fraction(3,4),18),24);
assert.throws(()=>new Fraction(1,0));
console.log('Alle Fraction-Core-Tests erfolgreich.');
