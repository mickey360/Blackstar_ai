'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  type Connection,
  type Node as RFNode,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {
  Play,
  Save,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { Sidebar } from './Sidebar';
import { NodeCard } from './NodeCard';
import { Inspector } from './Inspector';
import { ThemeToggle } from './ThemeToggle';

import { templates } from '@/lib/templates';
import { loadWorkflows, saveWorkflows } from '@/lib/storage';
import { validateWorkflow } from '@/lib/validate';
import { NODE_META } from '@/lib/nodes';

import type {
  NodeKind,
  Workflow,
  WorkflowNode,
} from '@/types/workflow';

/*
 * React Flow expects custom node components to receive
 * React Flow's NodeProps directly.
 *
 * Your existing NodeCard expects:
 * {
 *   node: WorkflowNode;
 *   selected?: boolean;
 * }
 *
 * This adapter converts React Flow's props into that shape.
 */
const CustomNode = ({ id, data, selected }: NodeProps) => {
  const node = {
    id,
    type: data.kind || 'transform',
    position: { x: 0, y: 0 },
    data,
  } as WorkflowNode;

  return <NodeCard node={node} selected={selected} />;
};

const rfTypes: NodeTypes = {
  custom: CustomNode,
};

function makeNode(
  type: NodeKind,
  x = 180,
  y = 180
): RFNode {
  const id = crypto.randomUUID();

  return {
    id,
    type: 'custom',
    position: { x, y },
    data: {
      label: NODE_META[type].title,
      description: NODE_META[type].description,
      config: {},
      kind: type,
    },
  } as RFNode;
}

function initial(): Workflow {
  return templates[0];
}

export function BlackstarStudio() {
  const [workflow, setWorkflow] = useState<Workflow>(initial);

  const [nodes, setNodes, onNodesChange] = useNodesState<any>(
    workflow.nodes.map((n) => ({
      ...n,
      type: 'custom',
      data: {
        ...n.data,
        kind: n.type,
      },
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState<any>(
    workflow.edges
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAI, setShowAI] = useState(false);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const all = loadWorkflows();

    if (all[0]) {
      setWorkflow(all[0]);

      setNodes(
        all[0].nodes.map((n) => ({
          ...n,
          type: 'custom',
          data: {
            ...n.data,
            kind: n.type,
          },
        }))
      );

      setEdges(all[0].edges);
    }
  }, [setNodes, setEdges]);

  const sync = (ns: any[], es: any[]) => {
    const w: Workflow = {
      ...workflow,
      nodes: ns.map((n: any) => ({
        id: n.id,
        type:
          n.data?.kind ||
          (n.type === 'custom' ? 'transform' : n.type),
        position: n.position,
        data: n.data,
      })),
      edges: es,
      updatedAt: new Date().toISOString(),
    };

    setWorkflow(w);
    setSaved(false);
  };

  const add = (kind: NodeKind) => {
    const n = makeNode(
      kind,
      220 + nodes.length * 30,
      220 + nodes.length * 20
    );

    n.data = {
      ...n.data,
      kind,
    };

    const ns = [...nodes, n];

    setNodes(ns);
    sync(ns, edges);
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      const es = addEdge(connection, edges);

      setEdges(es);
      sync(nodes, es);
    },
    [nodes, edges]
  );

  const select = (node: any) => {
    setSelected(node.id);
  };

  const updateNode = (node: WorkflowNode) => {
    const ns = nodes.map((x: any) =>
      x.id === node.id
        ? {
            ...x,
            type: 'custom',
            data: {
              ...node.data,
              kind: node.type,
            },
          }
        : x
    );

    setNodes(ns);
    sync(ns, edges);
  };

  const del = () => {
    if (!selected) return;

    const ns = nodes.filter(
      (n: any) => n.id !== selected
    );

    const es = edges.filter(
      (e: any) =>
        e.source !== selected &&
        e.target !== selected
    );

    setNodes(ns);
    setEdges(es);
    setSelected(null);

    sync(ns, es);
  };

  const save = () => {
    const w: Workflow = {
      ...workflow,
      nodes: nodes.map((n: any) => ({
        id: n.id,
        type: (n.data?.kind || 'transform') as NodeKind,
        position: n.position,
        data: n.data,
      })),
      edges,
      updatedAt: new Date().toISOString(),
    };

    const all = loadWorkflows().filter(
      (x) => x.id !== w.id
    );

    saveWorkflows([w, ...all]);

    setWorkflow(w);
    setSaved(true);
  };

  const run = async () => {
    setRunning(true);
    setResult(null);

    const w: Workflow = {
      ...workflow,
      nodes: nodes.map((n: any) => ({
        id: n.id,
        type: (n.data?.kind || 'transform') as NodeKind,
        position: n.position,
        data: n.data,
      })),
      edges,
    };

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: w,
          input: {
            message: 'Hello from Blackstar',
            items: [1, 2, 2, 3, 5],
            urgent: false,
          },
        }),
      });

      setResult(await response.json());
    } catch (error: any) {
      setResult({
        ok: false,
        error: error.message,
      });
    } finally {
      setRunning(false);
    }
  };

  const exportW = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            ...workflow,
            nodes: nodes.map((n: any) => ({
              ...n,
              type: n.data?.kind || 'transform',
            })),
            edges,
          },
          null,
          2
        ),
      ],
      {
        type: 'application/json',
      }
    );

    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);

    a.download = `${workflow.name
      .toLowerCase()
      .replace(/\s+/g, '-')}.json`;

    a.click();

    URL.revokeObjectURL(a.href);
  };

  const importW = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = '.json';

    input.onchange = async () => {
      const file = input.files?.[0];

      if (!file) return;

      const w = JSON.parse(await file.text());

      setWorkflow(w);

      setNodes(
        w.nodes.map((n: any) => ({
          ...n,
          type: 'custom',
          data: {
            ...n.data,
            kind: n.type,
          },
        }))
      );

      setEdges(w.edges || []);
      setSaved(false);
    };

    input.click();
  };

  const generate = async () => {
    if (!aiPrompt.trim()) return;

    const prompt = aiPrompt.toLowerCase();

    const w = prompt.includes('api')
      ? templates[0]
      : templates[1];

    setWorkflow({
      ...w,
      id: crypto.randomUUID(),
      name: 'AI Generated Flow',
    });

    setNodes(
      w.nodes.map((n) => ({
        ...n,
        type: 'custom',
        data: {
          ...n.data,
          kind: n.type,
        },
      }))
    );

    setEdges(w.edges);
    setShowAI(false);
    setAiPrompt('');
    setSaved(false);
  };

  const sel = nodes.find(
    (n: any) => n.id === selected
  );

  const validation = useMemo(
    () =>
      validateWorkflow({
        ...workflow,
        nodes: nodes.map((n: any) => ({
          id: n.id,
          type: (n.data?.kind || 'transform') as NodeKind,
          position: n.position,
          data: n.data,
        })),
        edges,
      }),
    [workflow, nodes, edges]
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[var(--bg)]">
      <Sidebar
        onAdd={add}
        onTemplates={() => setShowTemplates(true)}
        onNew={() => {
          const w = {
            ...initial(),
            id: crypto.randomUUID(),
            name: 'Untitled workflow',
          };

          setWorkflow(w);
          setNodes([]);
          setEdges([]);
          setSelected(null);
          setSaved(false);
        }}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 shrink-0 border-b border-[var(--border)] flex items-center px-4 gap-3 bg-[var(--panel)]">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[var(--accent)] text-[var(--bg)] grid place-items-center font-bold text-xs">
              B
            </div>

            <div>
              <div className="text-xs font-semibold">
                Blackstar AI
              </div>

              <div className="text-[9px] text-[var(--muted)]">
                Workflow studio
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-[var(--border)] mx-2" />

          <input
            value={workflow.name}
            onChange={(e) => {
              setWorkflow({
                ...workflow,
                name: e.target.value,
              });

              setSaved(false);
            }}
            className="bg-transparent outline-none text-xs font-medium w-48"
          />

          <div className="ml-auto flex items-center gap-1.5">
            <span
              className={`text-[10px] flex items-center gap-1 mr-2 ${
                validation.valid
                  ? 'text-emerald-500'
                  : 'text-red-500'
              }`}
            >
              {validation.valid ? (
                <CheckCircle2 size={12} />
              ) : (
                <AlertCircle size={12} />
              )}

              {saved ? 'Saved' : 'Unsaved'}
            </span>

            <button
              onClick={() => setShowAI(true)}
              className="px-2.5 h-9 rounded-lg border border-[var(--border)] text-xs flex gap-1.5 items-center hover:bg-[var(--panel2)]"
            >
              <Sparkles size={14} />
              Copilot
            </button>

            <button
              onClick={run}
              disabled={running}
              className="px-3 h-9 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-xs font-semibold flex gap-1.5 items-center"
            >
              {running ? (
                <Loader2
                  className="animate-spin"
                  size={14}
                />
              ) : (
                <Play size={14} />
              )}

              Run
            </button>

            <button
              onClick={save}
              className="h-9 w-9 rounded-lg border border-[var(--border)] grid place-items-center"
              aria-label="Save workflow"
            >
              <Save size={15} />
            </button>

            <button
              onClick={exportW}
              className="h-9 w-9 rounded-lg border border-[var(--border)] grid place-items-center"
              aria-label="Export workflow"
            >
              <Download size={15} />
            </button>

            <button
              onClick={importW}
              className="h-9 w-9 rounded-lg border border-[var(--border)] grid place-items-center"
              aria-label="Import workflow"
            >
              <Upload size={15} />
            </button>

            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 min-h-0 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={(changes) => {
              onNodesChange(changes);
              setSaved(false);
            }}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              setSaved(false);
            }}
            onConnect={onConnect}
            onNodeClick={(_, node) => select(node)}
            nodeTypes={rfTypes}
            fitView
            className="canvas-grid"
          >
            <Background gap={20} size={1} />

            <Controls />

            <MiniMap
              nodeColor="var(--muted)"
              maskColor="rgba(128,128,128,.1)"
            />
          </ReactFlow>

          {result && (
            <div className="absolute left-4 bottom-4 w-[430px] max-h-[280px] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
              <div className="p-3 border-b border-[var(--border)] flex items-center">
                <span className="text-xs font-semibold">
                  Execution result
                </span>

                <button
                  onClick={() => setResult(null)}
                  className="ml-auto text-[var(--muted)]"
                >
                  ×
                </button>
              </div>

              <pre className="p-3 text-[10px] mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {!validation.valid && (
            <div className="absolute left-4 top-4 rounded-lg border border-red-500/20 bg-[var(--panel)] px-3 py-2 text-[10px] text-red-500">
              {validation.errors.join(' ')}
            </div>
          )}
        </div>
      </main>

      {sel && (
        <Inspector
          node={
            {
              ...sel,
              type: (sel.data?.kind ||
                'transform') as any,
              data: sel.data,
            } as any
          }
          onChange={updateNode}
          onDelete={del}
          onClose={() => setSelected(null)}
        />
      )}

      {showTemplates && (
        <Modal
          title="Templates"
          onClose={() => setShowTemplates(false)}
        >
          <div className="grid gap-3">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setWorkflow({
                    ...t,
                    id: crypto.randomUUID(),
                  });

                  setNodes(
                    t.nodes.map((n) => ({
                      ...n,
                      type: 'custom',
                      data: {
                        ...n.data,
                        kind: n.type,
                      },
                    }))
                  );

                  setEdges(t.edges);
                  setShowTemplates(false);
                  setSaved(false);
                  setSelected(null);
                }}
                className="text-left p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--panel2)]"
              >
                <div className="text-xs font-semibold">
                  {t.name}
                </div>

                <div className="text-[10px] text-[var(--muted)] mt-1">
                  {t.description}
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showAI && (
        <Modal
          title="Blackstar Copilot"
          onClose={() => setShowAI(false)}
        >
          <p className="text-xs text-[var(--muted)] mb-3">
            Describe an automation. Blackstar will turn it
            into a ready-to-run workflow template.
          </p>

          <textarea
            autoFocus
            value={aiPrompt}
            onChange={(e) =>
              setAiPrompt(e.target.value)
            }
            placeholder="e.g. Fetch an API, clean the data with Python, then classify it with AI"
            className="w-full h-28 resize-none rounded-lg border border-[var(--border)] bg-[var(--panel2)] p-3 text-xs outline-none"
          />

          <button
            onClick={generate}
            className="mt-3 w-full py-2.5 rounded-lg bg-[var(--accent)] text-[var(--bg)] text-xs font-semibold"
          >
            Generate workflow
          </button>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center">
          <span className="font-semibold text-sm">
            {title}
          </span>

          <button
            onClick={onClose}
            className="ml-auto text-lg"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
