import type {Workflow,WorkflowNode,WorkflowEdge,NodeKind} from '@/types/workflow';import {uid} from './ids';
export function createWorkflow(name='Untitled workflow'):Workflow{return{id:uid('wf'),name,description:'',version:1,active:false,nodes:[],edges:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
export function createNode(type:NodeKind,x=200,y=160):WorkflowNode{return{id:uid('node'),type,position:{x,y},data:{label:type[0].toUpperCase()+type.slice(1),kind:type,config:{}}}}
export function createEdge(source:string,target:string):WorkflowEdge{return{id:uid('edge'),source,target}}
export function cloneWorkflow(w:Workflow):Workflow{return JSON.parse(JSON.stringify(w))}
