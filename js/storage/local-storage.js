import {StorageAdapter} from './storage-interface.js';
import {Fraction} from '../core/fraction.js';

function reviveFraction(_key,value){
  if(!value||typeof value!=='object'||Array.isArray(value))return value;
  const keys=Object.keys(value).sort();
  if(keys.length===2&&keys[0]==='denominator'&&keys[1]==='numerator'&&Number.isInteger(value.numerator)&&Number.isInteger(value.denominator)&&value.denominator!==0){
    return new Fraction(value.numerator,value.denominator);
  }
  return value;
}

export class LocalStorageAdapter extends StorageAdapter{
  constructor(key){super();this.key=key}
  async load(){
    try{return JSON.parse(localStorage.getItem(this.key)||'null',reviveFraction)}catch{return null}
  }
  async save(data){localStorage.setItem(this.key,JSON.stringify(data));return true}
  async clear(){localStorage.removeItem(this.key)}
}
