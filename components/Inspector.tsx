'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Cpu, Trash2, X, Zap } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow';

const modelOptions = [
  { id: 'google/gemma-4-26B-A4B-it', name: 'Gemma 4 · 26B-A4B', meta: 'Google · Hugging Face' },
  { id: 'google/gemma-4-E4B-it', name: 'Gemma 4 · E4B', meta: 'Google · lighter local option' },
  { id: 'Qwen/Qwen3-4B-Thinking-2507', name: 'Qwen 3 · 4B Thinking', meta: 'Hugging Face' },
];

export function Inspector({ node, onChange, onDelete, onClose, mobile = false }: { node: WorkflowNode; onChange: (n: WorkflowNode) => void; onDelete: () => void; onClose: () => void; mobile?: boolean }) {
  const [openModel, setOpenModel] = useState(false);
  const config = node.data.config || {};
  const model = useMemo(() => modelOptions.find(x => x.id === config.model) || modelOptions[0], [config.model]);
  const set = (key: string, value: any) => onChange({ ...node, data: { ...node.data, config: { ...config, [key]: value } } });

  return (
    <aside className={`${mobile ? 'mobile-inspector' : 'floating-inspector'} inspector-shell`}>
      <div className="inspector-head"><div className="inspector-title"><span className="inspector-spark"><Zap size={13} /></span><span><b>{node.data.label}</b><small>{node.type} node</small></span></div><button className="icon-button" onClick={onClose} aria-label="Close inspector"><X size={16} /></button></div>
      <div className="inspector-body">
        <label className="field"><span>Label</span><input value={node.data.label} onChange={e => onChange({ ...node, data: { ...node.data, label: e.target.value } })} /></label>
        <div className="field"><span>Type</span><div className="read-only-field mono">{node.type}</div></div>

        {node.type === 'ai' && <>
          <div className="inspector-section"><div className="inspector-section-title"><span><Cpu size={13} /> Intelligence</span><span className="connected-pill">Ready</span></div>
            <div className="provider-switch"><button className={config.provider !== 'local' ? 'selected' : ''} onClick={() => set('provider', 'huggingface')}>Hugging Face</button><button className={config.provider === 'local' ? 'selected' : ''} onClick={() => set('provider', 'local')}>Local</button></div>
            <div className="model-select-wrap"><button className="model-select" onClick={() => setOpenModel(!openModel)}><span><b>{model.name}</b><small>{config.provider === 'local' ? 'Local runtime' : model.meta}</small></span><ChevronDown size={14} /></button>{openModel && <div className="model-menu">{modelOptions.map(option => <button key={option.id} onClick={() => { set('model', option.id); setOpenModel(false); }}><span><b>{option.name}</b><small>{option.meta}</small></span>{model.id === option.id && <span className="check">✓</span>}</button>)}</div>}</div>
            {config.provider === 'local' && <p className="helper">Local mode uses an OpenAI-compatible runtime when configured. On Vercel, keep Hugging Face selected unless your local endpoint is reachable from the server.</p>}
          </div>
          <label className="field"><span>Task</span><select value={config.task || 'summarize'} onChange={e => set('task', e.target.value)}><option value="summarize">Summarize</option><option value="classify">Classify</option><option value="extract">Extract</option><option value="reason">Reason / answer</option></select></label>
          <label className="field"><span>Temperature <b className="field-value">{Number(config.temperature ?? 0.4).toFixed(1)}</b></span><input className="range" type="range" min="0" max="1" step="0.1" value={Number(config.temperature ?? 0.4)} onChange={e => set('temperature', Number(e.target.value))} /></label>
        </>}

        {node.type === 'http' && <><label className="field"><span>URL</span><input value={config.url || ''} onChange={e => set('url', e.target.value)} placeholder="https://api.example.com" /></label><label className="field"><span>Method</span><select value={config.method || 'GET'} onChange={e => set('method', e.target.value)}><option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option></select></label></>}
        {node.type === 'transform' && <><label className="field"><span>Mode</span><select value={config.mode || 'pick'} onChange={e => set('mode', e.target.value)}><option value="pick">Pick fields</option><option value="map">Map</option></select></label><label className="field"><span>Fields / path</span><input value={config.fields || ''} onChange={e => set('fields', e.target.value)} placeholder="id,title" /></label></>}
        {node.type === 'python' && <label className="field"><span>Operation</span><select value={config.mode || 'stats'} onChange={e => set('mode', e.target.value)}><option value="stats">Numeric stats</option><option value="dedupe">Dedupe JSON</option><option value="clean">Pass through</option></select></label>}
        {node.type === 'condition' && <><label className="field"><span>Path</span><input value={config.path || ''} onChange={e => set('path', e.target.value)} placeholder="input.status" /></label><label className="field"><span>Operator</span><select value={config.operator || 'exists'} onChange={e => set('operator', e.target.value)}><option value="exists">Exists</option><option value="equals">Equals</option><option value="contains">Contains</option><option value="gt">Greater than</option></select></label><label className="field"><span>Value</span><input value={config.value ?? ''} onChange={e => set('value', e.target.value)} /></label></>}
        {node.type === 'delay' && <label className="field"><span>Milliseconds</span><input type="number" value={config.ms || 250} onChange={e => set('ms', Number(e.target.value))} /></label>}
        {node.type === 'code' && <label className="field"><span>Mode</span><select value={config.mode || 'pass'} onChange={e => set('mode', e.target.value)}><option value="pass">Pass through</option><option value="json">Parse JSON</option><option value="pluck">Pluck path</option></select></label>}
      </div>
      <div className="inspector-foot"><button className="delete-button" onClick={onDelete}><Trash2 size={13} /> Delete node</button><span className="mono">autosaved locally</span></div>
    </aside>
  );
}
