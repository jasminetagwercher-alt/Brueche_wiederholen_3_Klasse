import {StorageAdapter} from './storage-interface.js';
export class LocalStorageAdapter extends StorageAdapter{constructor(key){super();this.key=key}async load(){try{return JSON.parse(localStorage.getItem(this.key)||'null')}catch{return null}}async save(data){localStorage.setItem(this.key,JSON.stringify(data));return true}async clear(){localStorage.removeItem(this.key)}}
