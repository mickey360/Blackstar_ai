import type { Workflow } from '@/types/workflow';
const KEY='blackstar-ai:workflows:v1';
export function loadWorkflows():Workflow[]{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return []}}
export function saveWorkflows(w:Workflow[]){if(typeof window!=='undefined')localStorage.setItem(KEY,JSON.stringify(w));}
