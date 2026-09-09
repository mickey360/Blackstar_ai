'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState,
  type Connection, type Node as RFNode, type NodeProps, type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowLeft, Check, CheckCircle2, ChevronDown, Download, FileJson, History, Loader2, Menu,
  Play, Plus, Save, Search, Sparkles, Upload, X, Zap,
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { NodeCard } from './NodeCard';
import { Inspector } from './Inspector';
import { ThemeToggle } from './ThemeToggle';
import { templates } from '@/lib/templates';
import { loadWorkflows, saveWorkflows } from '@/lib/storage';
import { validateWorkflow } from '@/lib/validate';
import { NODE_META } from '@/lib/nodes';
import type { NodeKind, Workflow, WorkflowNode } from '@/types/workflow';

const CustomNode = ({ id, data, selected }: NodeProps) => <NodeCard node={{ id, type: data.kind || 'transform', position: { x: 0, y: 0 }, data } as WorkflowNode} selected={selected} />;
const rfTypes: NodeTypes = { custom: CustomNode };

function makeNode(type: NodeKind, x = 180, y = 180): RFNode {
  return { id: crypto.randomUUID(), type: 'custom', position: { x, y }, data: { label: NODE_META[type].title, description: NODE_META[type].description, config: type === 'ai' ? { provider: 'huggingface', model: 'google/gemma-4-26B-A4B-it', task: 'summarize', temperature: 0.4 } : {}, kind: type } } as RFNode;
}
function initial(): Workflow { return templates[0]; }
function toRFNodes(w: Workflow) { return w.nodes.map(n => ({ ...n, type: 'custom', data: { ...n.data, kind: n.type } })); }
function toWorkflow(workflow: Workflow, nodes: any[], edges: any[]): Workflow { return { ...workflow, nodes: nodes.map(n => ({ id: n.id, type: (n.data?.kind || 'transform') as NodeKind, position: n.position, data: n.data })), edges, updatedAt: new Date().toISOString() }; }

export function BlackstarStudio({ onBack }: { onBack?: () => void }) {
  const [workflow, setWorkflow] = useState<Workflow>(initial);
  const [nodes, setNodes, onNodesChange] = useNodesState<any>(toRFNodes(initial()));
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(initial().edges);
  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [saved, setSaved] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileInspector, setMobileInspector] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const all = loadWorkflows();
    if (all[0]) {
      setWorkflow(all[0]); setNodes(toRFNodes(all[0])); setEdges(all[0].edges);
    }
  }, [setNodes, setEdges]);

  const sync = useCallback((ns: any[], es: any[]) => { setWorkflow(current => toWorkflow(current, ns, es)); setSaved(false); }, []);
  const add = useCallback((kind: NodeKind) => { const n = makeNode(kind, 260 + nodes.length * 28, 150 + nodes.length * 22); const ns = [...nodes, n]; setNodes(ns); sync(ns, edges); }, [nodes, edges, setNodes, sync]);
  const onConnect = useCallback((connection: Connection) => { const es = addEdge({ ...connection, animated: true, style: { stroke: 'var(--accent)', strokeWidth: 1.5 } }, edges); setEdges(es); sync(nodes, es); }, [nodes, edges, setEdges, sync]);
  const select = (node: any) => { setSelected(node.id); setMobileInspector(true); };

  const updateNode = (node: WorkflowNode) => {
    const ns = nodes.map((x: any) => x.id === node.id ? { ...x, type: 'custom', data: { ...node.data, kind: node.type } } : x);
    setNodes(ns); sync(ns, edges);
  };
  const del = () => {
    if (!selected) return;
    const ns = nodes.filter((n: any) => n.id !== selected); const es = edges.filter((e: any) => e.source !== selected && e.target !== selected);
    setNodes(ns); setEdges(es); setSelected(null); setMobileInspector(false); sync(ns, es);
  };
  const save = () => { const w = toWorkflow(workflow, nodes, edges); saveWorkflows([w, ...loadWorkflows().filter(x => x.id !== w.id)]); setWorkflow(w); setSaved(true); };
  const run = async () => {
    setRunning(true); setResult(null); setShowExecution(true);
    try {
      const response = await fetch('/api/execute', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workflow: toWorkflow(workflow, nodes, edges), input: { message: 'Hello from Blackstar', items: [1, 2, 2, 3, 5], urgent: false } }) });
      setResult(await response.json());
    } catch (error: any) { setResult({ ok: false, error: error.message }); }
    finally { setRunning(false); }
  };
  const exportW = () => { const blob = new Blob([JSON.stringify(toWorkflow(workflow, nodes, edges), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${workflow.name.toLowerCase().replace(/\s+/g, '-')}.json`; a.click(); URL.revokeObjectURL(url); };
  const importW = () => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json'; input.onchange = async () => { const file = input.files?.[0]; if (!file) return; try { const w = JSON.parse(await file.text()) as Workflow; setWorkflow(w); setNodes(toRFNodes(w)); setEdges(w.edges || []); setSaved(false); } catch { alert('That workflow file could not be read.'); } }; input.click(); };
  const generate = async () => {
    if (!aiPrompt.trim()) return;
    try {
      const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task: 'workflow design', input: aiPrompt, model: 'google/gemma-4-26B-A4B-it', provider: 'huggingface' }) });
      const ai = await response.json();
      const base = ai?.result ? templates[0] : (aiPrompt.toLowerCase().includes('api') ? templates[0] : templates[1]);
      const w = { ...base, id: crypto.randomUUID(), name: 'AI Generated Flow', description: ai?.result ? String(ai.result).slice(0, 180) : base.description };
      setWorkflow(w); setNodes(toRFNodes(w)); setEdges(w.edges); setShowAI(false); setAiPrompt(''); setSaved(false);
    } catch { setShowAI(false); }
  };
  const applyTemplate = (t: Workflow) => { const w = { ...t, id: crypto.randomUUID() }; setWorkflow(w); setNodes(toRFNodes(w)); setEdges(w.edges); setShowTemplates(false); setSaved(false); setSelected(null); };
  const newWorkflow = () => { const w = { ...initial(), id: crypto.randomUUID(), name: 'Untitled workflow', nodes: [] }; setWorkflow(w); setNodes([]); setEdges([]); setSelected(null); setSaved(false); };

  const sel = nodes.find((n: any) => n.id === selected);
  const validation = useMemo(() => validateWorkflow(toWorkflow(workflow, nodes, edges)), [workflow, nodes, edges]);

  const onDrop = (event: React.DragEvent) => { event.preventDefault(); const kind = event.dataTransfer.getData('blackstar/node') as NodeKind; if (!kind) return; const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect(); const position = { x: event.clientX - bounds.left - 100, y: event.clientY - bounds.top - 40 }; const n = makeNode(kind, position.x, position.y); const ns = [...nodes, n]; setNodes(ns); sync(ns, edges); };

  return (
    <div className="studio-shell">
      <div className="studio-ambient ambient-a" /><div className="studio-ambient ambient-b" />
      <div className="desktop-sidebar-wrap"><Sidebar onAdd={add} onTemplates={() => setShowTemplates(true)} onNew={newWorkflow} /></div>
      {mobileMenu && <Sidebar mobile onAdd={add} onTemplates={() => setShowTemplates(true)} onNew={newWorkflow} onClose={() => setMobileMenu(false)} />}

      <main className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-left">
            <button className="mobile-only icon-button" onClick={() => setMobileMenu(true)}><Menu size={18} /></button>
            {onBack && <button className="top-back" onClick={onBack}><ArrowLeft size={14} /><span>Blackstar</span></button>}
            <div className="workflow-title"><span className="status-dot" /><input value={workflow.name} onChange={e => { setWorkflow({ ...workflow, name: e.target.value }); setSaved(false); }} /><ChevronDown size={13} /></div>
          </div>
          <div className="topbar-center"><div className="studio-pill"><span className="live-dot" /> {running ? 'Executing workflow' : 'Studio ready'}</div></div>
          <div className="topbar-actions">
            <button className="top-icon mobile-hide" onClick={importW} title="Import"><Upload size={15} /></button>
            <button className="top-icon mobile-hide" onClick={exportW} title="Export"><Download size={15} /></button>
            <button className="top-icon mobile-hide" onClick={save} title="Save"><Save size={15} /></button>
            <ThemeToggle />
            <button className="copilot-button" onClick={() => setShowAI(true)}><Sparkles size={14} /> <span>Copilot</span></button>
            <button className="run-button" onClick={run} disabled={running}>{running ? <Loader2 size={14} className="spin" /> : <Play size={14} fill="currentColor" />}<span>{running ? 'Running' : 'Run'}</span></button>
          </div>
        </header>

        <div className="workspace" onDrop={onDrop} onDragOver={e => e.preventDefault()}>
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={changes => { onNodesChange(changes); setSaved(false); }} onEdgesChange={changes => { onEdgesChange(changes); setSaved(false); }} onConnect={onConnect} onNodeClick={(_, node) => select(node)} nodeTypes={rfTypes} fitView className="blackstar-flow">
            <Background gap={24} size={1} color="var(--grid-dot)" />
            <Controls showInteractive={false} />
            <MiniMap nodeColor="var(--accent)" maskColor="rgba(0,0,0,.18)" />
          </ReactFlow>

          {nodes.length === 0 && <div className="empty-workspace"><div className="empty-orb"><Sparkles size={22} /></div><span className="section-kicker">Blank canvas</span><h2>Build your next workflow.</h2><p>Drag a block from the sidebar, or let Copilot draft a starting point.</p><div><button className="empty-primary" onClick={() => setShowAI(true)}><Sparkles size={14} /> Generate with AI</button><button className="empty-secondary" onClick={() => add('trigger')}><Plus size={14} /> Add trigger</button></div></div>}

          {!validation.valid && <div className="validation-chip"><span>!</span>{validation.errors[0]}</div>}
          {saved && <div className="canvas-save"><Check size={12} /> Saved</div>}

          {showExecution && result && <div className="execution-float"><div className="execution-head"><div><span className="section-kicker">Last execution</span><b>{result.ok ? 'Workflow completed' : 'Workflow failed'}</b></div><button className="icon-button" onClick={() => setShowExecution(false)}><X size={15} /></button></div><div className="execution-summary"><span className={result.ok ? 'success-badge' : 'error-badge'}>{result.ok ? 'SUCCESS' : 'ERROR'}</span><span>{result.logs?.length || 0} steps</span><span>{result.finishedAt && result.startedAt ? `${Math.max(1, new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime())}ms` : '—'}</span></div><pre>{JSON.stringify(result.output ?? result.error, null, 2)}</pre></div>}
        </div>

        <footer className="studio-statusbar"><div><span className="live-dot" /> Local workspace</div><div className="status-center"><span>{nodes.length} nodes</span><span>{edges.length} connections</span><span>{validation.valid ? 'Workflow valid' : `${validation.errors.length} issue${validation.errors.length > 1 ? 's' : ''}`}</span></div><div><button onClick={() => setShowExecution(true)}><History size={12} /> Executions</button><span className="mono">⌘ K</span></div></footer>
      </main>

      {sel && <Inspector node={{ ...sel, type: (sel.data?.kind || 'transform') as any, data: sel.data } as any} onChange={updateNode} onDelete={del} onClose={() => { setSelected(null); setMobileInspector(false); }} />}
      {sel && mobileInspector && <div className="mobile-inspector-overlay"><Inspector mobile node={{ ...sel, type: (sel.data?.kind || 'transform') as any, data: sel.data } as any} onChange={updateNode} onDelete={del} onClose={() => { setSelected(null); setMobileInspector(false); }} /></div>}

      <div className="mobile-bottom-bar"><button onClick={() => setMobileMenu(true)}><Menu size={17} /><span>Menu</span></button><button onClick={() => add('ai')}><Plus size={17} /><span>Add</span></button><button onClick={() => { if (sel) setMobileInspector(true); else setShowAI(true); }}><Sparkles size={17} /><span>{sel ? 'Inspect' : 'AI'}</span></button><button onClick={run} disabled={running}><Play size={17} fill="currentColor" /><span>Run</span></button></div>

      {showTemplates && <Modal title="Workflow templates" onClose={() => setShowTemplates(false)}><div className="template-grid">{templates.map(t => <button key={t.id} onClick={() => applyTemplate(t)} className="template-card"><span className="template-icon"><FileJson size={15} /></span><div><b>{t.name}</b><small>{t.description}</small></div><ArrowIcon /></button>)}</div></Modal>}
      {showAI && <Modal title="Blackstar Copilot" onClose={() => setShowAI(false)}><div className="copilot-modal"><div className="copilot-hero"><span><Sparkles size={16} /></span><div><b>Describe the outcome.</b><small>Copilot will prepare a workflow starting point.</small></div></div><textarea autoFocus value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. Analyze customer feedback, classify urgency, then send urgent cases to an API." /><div className="copilot-model"><span><span className="live-dot" /> Gemma 4</span><small>Hugging Face · configured by environment</small></div><button className="modal-primary" onClick={generate}><Sparkles size={14} /> Generate workflow</button></div></Modal>}
    </div>
  );
}

function ArrowIcon() { return <span className="template-arrow">→</span>; }
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) { return <div className="modal-backdrop"><div className="modal-shell"><div className="modal-head"><div><span className="section-kicker">Blackstar</span><b>{title}</b></div><button className="icon-button" onClick={onClose}><X size={17} /></button></div><div className="modal-body">{children}</div></div></div>; }
