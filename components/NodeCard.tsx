'use client';

import { Handle, Position } from '@xyflow/react';
import { NODE_META } from '@/lib/nodes';
import type { WorkflowNode } from '@/types/workflow';

interface NodeCardProps { node: WorkflowNode; selected?: boolean; }

export function NodeCard({ node, selected = false }: NodeCardProps) {
  const meta = NODE_META[node.type];
  return (
    <div className={`blackstar-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-[var(--bg)] !bg-[var(--accent)]" />
      <div className="blackstar-node-head"><span className={`node-library-icon ${meta.color}`}>{meta.icon}</span><div className="min-w-0"><b>{node.data.label}</b><small>{meta.title}</small></div><span className="node-menu-dot">•••</span></div>
      <div className="blackstar-node-body">{meta.description}</div>
      <div className="blackstar-node-foot"><span className="node-status-dot" /> Ready <span className="mono">{node.type}</span></div>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-[var(--bg)] !bg-[var(--accent)]" />
    </div>
  );
}
