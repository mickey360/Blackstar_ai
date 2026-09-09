import type { Workflow } from '@/types/workflow';
const base=(name:string,nodes:any[],edges:any[]):Workflow=>({id:crypto.randomUUID?.()||String(Date.now()),name,description:'Blackstar template',version:1,active:false,nodes,edges,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
export const templates:Workflow[]=[
 base('API Data Cleaner',[{id:'t',type:'trigger',position:{x:80,y:180},data:{label:'Input',config:{}}},{id:'h',type:'http',position:{x:330,y:180},data:{label:'Fetch JSON',config:{url:'https://jsonplaceholder.typicode.com/todos/1'}}},{id:'p',type:'python',position:{x:600,y:180},data:{label:'Python Stats',config:{mode:'stats'}}},{id:'o',type:'output',position:{x:870,y:180},data:{label:'Result',config:{}}}],[{id:'1',source:'t',target:'h'},{id:'2',source:'h',target:'p'},{id:'3',source:'p',target:'o'}]),
 base('AI Text Triage',[{id:'t',type:'trigger',position:{x:80,y:180},data:{label:'Message',config:{}}},{id:'a',type:'ai',position:{x:380,y:180},data:{label:'Classify',config:{task:'classify'}}},{id:'o',type:'output',position:{x:680,y:180},data:{label:'Decision',config:{}}}],[{id:'1',source:'t',target:'a'},{id:'2',source:'a',target:'o'}])
];
