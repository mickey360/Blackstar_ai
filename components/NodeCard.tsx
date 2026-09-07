'use client';

import { Handle, Position } from '@xyflow/react';
import { NODE_META } from '@/lib/nodes';
import type { NodeKind, WorkflowNode } from '@/types/workflow';

export function NodeCard({
  node,
  selected,
}: {
  node: WorkflowNode;
  selected?: boolean;
}) {
  // WorkflowNode.data doesn't currently declare `kind`,
  // but the studio stores the node kind inside data.kind.
  const nodeData = node.data as WorkflowNode['data'] & {
    kind?: NodeKind;
  };

  const kind = (nodeData.kind ?? node.type ?? 'transform') as NodeKind;
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
        className="!bg-zinc-500 !w-2 !h-2"
      />

      <div className="px-3 py-2.5 border-b border-[var(--border)] flex items-center gap-2">
        <span className="text-sm">{meta.icon}</span>

        <div className="min-w-0">
          <div className="text-xs font-semibold truncate">
            {node.data.label}
          </div>

          <div className="text-[10px] text-[var(--muted)]">
            {meta.title}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 text-[10px] text-[var(--muted)] leading-relaxed">
        {meta.description}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-zinc-500 !w-2 !h-2"
      />
    </div>
  );
}
