export type Value = unknown;
export type NodeKind = 'trigger'|'http'|'transform'|'python'|'condition'|'delay'|'ai'|'code'|'output';
export type PortType = 'input'|'output';
export interface WorkflowNode { id:string; type:NodeKind; position:{x:number;y:number}; data:{label:string;description?:string;config:Record<string,any>}; }
export interface WorkflowEdge { id:string; source:string; target:string; sourceHandle?:string|null; targetHandle?:string|null; label?:string; }
export interface Workflow { id:string; name:string; description:string; version:number; active:boolean; nodes:WorkflowNode[]; edges:WorkflowEdge[]; createdAt:string; updatedAt:string; }
export interface ExecutionContext { input:Value; data:Record<string,Value>; logs:ExecutionLog[]; vars:Record<string,Value>; }
export interface ExecutionLog { nodeId:string; level:'info'|'success'|'error'|'warn'; message:string; data?:Value; at:string; durationMs?:number; }
export interface ExecutionResult { ok:boolean; output:Value; logs:ExecutionLog[]; error?:string; startedAt:string; finishedAt:string; }
export interface WorkflowTemplate { id:string; name:string; description:string; category:string; workflow:Omit<Workflow,'id'|'createdAt'|'updatedAt'>; }
