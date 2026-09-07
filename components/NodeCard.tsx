'use client';

import { Handle, Position } from '@xyflow/react';
import { NODE_META } from '@/lib/nodes';
import type { WorkflowNode } from '@/types/workflow';

interface NodeCardProps {
  node: WorkflowNode;
  selected?: boolean;
}

export function NodeCard({ node, selected = false }: NodeCardProps) {
  const kind = node.type;
  const meta = NODE_META[kind];

  return (
    <div
      className={`w-[210px] rounded-xl border bg-[var(--panel)] shadow-sm ${
        selected
          ? 'border-[var(--text)] ring-2 ring-black/5 dark:ring-white/10'
          : 'border-[var(--border)]'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !bg-zinc-500"
      />

      <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2.5">
        <span className="text-sm">{meta.icon}</span>

        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">
            {node.data.label}
          </div>

          <div className="text-[10px] text-[var(--muted)]">
            {meta.title}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 text-[10px] leading-relaxed text-[var(--muted)]">
        {meta.description}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !bg-zinc-500"
      />
    </div>
  );
}
