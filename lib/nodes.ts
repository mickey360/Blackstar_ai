import type { NodeKind } from '@/types/workflow';
export const NODE_META: Record<NodeKind,{title:string;icon:string;color:string;description:string}> = {
 trigger:{title:'Trigger',icon:'⚡',color:'amber',description:'Start a workflow with input data.'},
 http:{title:'HTTP Request',icon:'↗',color:'blue',description:'Call a public API with fetch.'},
 transform:{title:'Transform',icon:'✦',color:'violet',description:'Map, pick and reshape JSON.'},
 python:{title:'Python',icon:'🐍',color:'emerald',description:'Run safe Python-like data operations on Vercel.'},
 condition:{title:'Condition',icon:'◇',color:'orange',description:'Branch based on an expression.'},
 delay:{title:'Delay',icon:'◷',color:'slate',description:'Pause briefly between steps.'},
 ai:{title:'AI Copilot',icon:'✺',color:'fuchsia',description:'Generate, classify or summarize text.'},
 code:{title:'JavaScript',icon:'</>',color:'cyan',description:'Run a sandboxed expression transform.'},
 output:{title:'Output',icon:'✓',color:'green',description:'Expose the final workflow result.'}
};
export const NODE_KINDS = Object.keys(NODE_META) as NodeKind[];
