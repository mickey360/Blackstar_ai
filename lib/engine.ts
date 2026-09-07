import type { Workflow, WorkflowNode, ExecutionContext, ExecutionResult, Value } from '@/types/workflow';
import { aiGenerate } from './ai';
const now=()=>new Date().toISOString();
const get=(obj:any,path:string)=>path.split('.').filter(Boolean).reduce((a,k)=>a?.[k],obj);
const interpolate=(s:string,ctx:ExecutionContext)=>s.replace(/\{\{\s*([^}]+)\s*\}\}/g,(_,p)=>String(get({input:ctx.input,data:ctx.data,vars:ctx.vars},p.trim())??''));
function topo(workflow:Workflow){ const indeg=new Map(workflow.nodes.map(n=>[n.id,0])); for(const e of workflow.edges) indeg.set(e.target,(indeg.get(e.target)||0)+1); const q=workflow.nodes.filter(n=>indeg.get(n.id)===0).map(n=>n.id); const out:string[]=[]; while(q.length){const id=q.shift()!;out.push(id);for(const e of workflow.edges.filter(e=>e.source===id)){const d=(indeg.get(e.target)||0)-1;indeg.set(e.target,d);if(d===0)q.push(e.target)}} return out.length===workflow.nodes.length?out:workflow.nodes.map(n=>n.id); }
async function runNode(n:WorkflowNode, input:Value, ctx:ExecutionContext):Promise<Value>{
 const c=n.data.config||{};
 switch(n.type){
  case 'trigger': return input;
  case 'output': return input;
  case 'transform': { const obj:any=input??{}; if(c.mode==='pick'){const o:any={};for(const k of String(c.fields||'').split(',').map(x=>x.trim()).filter(Boolean))o[k]=get(obj,k);return o;} if(c.mode==='map'){return Array.isArray(obj)?obj.map((x:any)=>({...x,[c.field||'value']:c.value})):obj;} return obj; }
  case 'http': {const url=interpolate(String(c.url||''),ctx); if(!url)return input; const r=await fetch(url,{method:c.method||'GET',headers:{'Content-Type':'application/json',...(c.headers||{})},body:['GET','HEAD'].includes(c.method||'GET')?undefined:JSON.stringify(c.body||{})}); const text=await r.text(); let body:any;try{body=JSON.parse(text)}catch{body=text} if(!r.ok)throw new Error(`HTTP ${r.status}`);return body;}
  case 'python': {const mode=c.mode||'clean'; if(mode==='stats'&&Array.isArray(input)){const nums=input.filter(x=>typeof x==='number') as number[];return {count:nums.length,min:Math.min(...nums),max:Math.max(...nums),avg:nums.reduce((a,b)=>a+b,0)/(nums.length||1)}} if(mode==='dedupe'&&Array.isArray(input))return [...new Set(input.map(x=>JSON.stringify(x)))].map(x=>JSON.parse(x)); return input;}
  case 'condition': {const op=c.operator||'exists';const a=get(input,c.path||'');const b=c.value;return op==='exists'?Boolean(a):op==='equals'?a==b:op==='contains'?String(a??'').includes(String(b??'')):op==='gt'?Number(a)>Number(b):Boolean(a);}
  case 'delay': {const ms=Math.min(Number(c.ms||250),2000);await new Promise(r=>setTimeout(r,ms));return input;}
  case 'ai': return aiGenerate({task:c.task||'summarize',input,model:c.model});
  case 'code': { if(c.mode==='json'){try{return JSON.parse(String(input))}catch{return input}} if(c.mode==='pluck')return get(input,String(c.path||'')); return input; }
 }
}
export async function executeWorkflow(workflow:Workflow,input:Value):Promise<ExecutionResult>{
 const startedAt=now(); const ctx:ExecutionContext={input,data:{},logs:[],vars:{}}; let current=input;
 try{for(const id of topo(workflow)){const n=workflow.nodes.find(x=>x.id===id)!;const t=Date.now();try{current=await runNode(n,current,ctx);ctx.data[id]=current;ctx.logs.push({nodeId:id,level:'success',message:`${n.data.label} completed`,data:current,at:now(),durationMs:Date.now()-t});}catch(e:any){ctx.logs.push({nodeId:id,level:'error',message:e?.message||'Node failed',at:now(),durationMs:Date.now()-t});throw e;}} return {ok:true,output:current,logs:ctx.logs,startedAt,finishedAt:now()};}catch(e:any){return {ok:false,output:current,logs:ctx.logs,error:e?.message||'Workflow failed',startedAt,finishedAt:now()};}
}
