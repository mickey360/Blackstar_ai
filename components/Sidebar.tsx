'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Command, History, LayoutTemplate, Plus, Search, Settings2, Sparkles, Workflow as WorkflowIcon, X } from 'lucide-react';
import { NODE_META, NODE_KINDS } from '@/lib/nodes';
import type { NodeKind } from '@/types/workflow';

export function Sidebar({ onAdd, onTemplates, onNew, onClose, mobile = false }: { onAdd: (k: NodeKind) => void; onTemplates: () => void; onNew: () => void; onClose?: () => void; mobile?: boolean }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => NODE_KINDS.filter(k => `${NODE_META[k].title} ${NODE_META[k].description}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <aside className={`${mobile ? 'mobile-sidebar' : 'desktop-sidebar'} sidebar-shell`}>
      <div className="sidebar-brand-row">
        <button className="sidebar-brand" onClick={() => onClose?.()}><span className="sidebar-logo"><Sparkles size={14} /></span><span><b>BLACKSTAR</b><small>AI STUDIO</small></span></button>
        {mobile && <button className="icon-button" onClick={onClose} aria-label="Close menu"><X size={17} /></button>}
      </div>
      <button className="new-workflow" onClick={onNew}><Plus size={15} /><span>New workflow</span><kbd>⌘ N</kbd></button>
      <div className="sidebar-search"><Search size={14} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a node" /><kbd>⌘ K</kbd></div>
      <nav className="sidebar-nav">
        <button className="sidebar-nav-item active"><span><WorkflowIcon size={15} /></span>Workflows</button>
        <button onClick={onTemplates} className="sidebar-nav-item"><span><LayoutTemplate size={15} /></span>Templates</button>
        <button className="sidebar-nav-item"><span><History size={15} /></span>Executions</button>
      </nav>
      <div className="sidebar-section-label"><span>Build blocks</span><ChevronDown size={13} /></div>
      <div className="node-list">
        {filtered.map(k => <button key={k} draggable onDragStart={e => e.dataTransfer.setData('blackstar/node', k)} onClick={() => { onAdd(k); onClose?.(); }} className="node-library-item"><span className={`node-library-icon ${NODE_META[k].color}`}>{NODE_META[k].icon}</span><span><b>{NODE_META[k].title}</b><small>{NODE_META[k].description}</small></span></button>)}
      </div>
      <div className="sidebar-bottom"><button className="sidebar-nav-item"><span><Settings2 size={15} /></span>Settings</button><div className="sidebar-status"><span className="live-dot" /> Local-first workspace <span className="mono">v1.0</span></div></div>
    </aside>
  );
}
