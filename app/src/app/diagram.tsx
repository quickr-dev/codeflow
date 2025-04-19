"use client";

import { convertGraphToMermaid } from "@/lib/graph-to-mermaid";
import type { Memory } from "@/lib/memory";
import Dagre from "@dagrejs/dagre";
import CodeMirror from "@uiw/react-codemirror";
import {
  Background,
  type Edge,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import mermaid from "mermaid";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CodeEditorNode } from "./CodeEditorNode";

// @codeflow(diagram->view#6)
export function Diagram({ graph }: { graph: Memory["annotations"] }) {
  const searchParams = useSearchParams();
  const selectedNode = searchParams.get("node");
  const selectedFlow = selectedNode
    ? graph.filter((node) => node.path.startsWith(selectedNode))
    : undefined;

  useEffect(() => {
    window.didClickLeafNode = (nodeId: string) => {
      location.href = `?node=${nodeId}`;
    };

    mermaid.initialize({
      startOnLoad: true,
      securityLevel: "loose",
      theme: "default",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "cardinal",
      },
    });
  });

  return (
    <div>
      <pre className="mermaid">
        {convertGraphToMermaid(graph.map((node) => node.path))}
      </pre>

      {selectedFlow && (
        <div className="h-screen">
          <Flow flow={selectedFlow} />
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  codeEditor: CodeEditorNode,
};
function LayoutFlow({
  initialNodes,
  initialEdges,
}: { initialNodes: Node[]; initialEdges: Edge[] }) {
  const layouted = getLayoutedElements(initialNodes, initialEdges);
  const [nodes, _setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      panOnScroll
      fitView
    >
      <Background />
    </ReactFlow>
  );
}

function Flow({ flow }: { flow: Memory["annotations"] }) {
  const sortedFlow = flow.sort((a, b) => a.path.localeCompare(b.path));
  const initialNodes: Node[] = sortedFlow.map((node) => ({
    id: node.path,
    data: { node },
    position: { x: 0, y: 0 },
    type: "codeEditor",
  }));

  const initialEdges: Edge[] = [];
  for (let i = 0; i < sortedFlow.length - 1; i++) {
    initialEdges.push({
      id: `${sortedFlow[i].path}-${sortedFlow[i + 1].path}`,
      source: sortedFlow[i].path,
      target: sortedFlow[i + 1].path,
      animated: true,
    });
  }

  return (
    <>
      <ReactFlowProvider>
        <LayoutFlow initialNodes={initialNodes} initialEdges={initialEdges} />
      </ReactFlowProvider>
    </>
  );
}

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR" });

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }
  for (const node of nodes) {
    g.setNode(node.id, {
      ...node,
      width: 38 * 16,
      height: 50 * 16,
    });
  }

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

function FlowTabs({ flow }: { flow: Memory["annotations"] }) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <section role="tablist">
        {flow.map((node, i) => (
          <button
            type="button"
            role="tab"
            key={node.path}
            onClick={() => setSelectedTab(i)}
            className="border py-1 px-2"
          >
            <h2>{node.filePath}</h2>
          </button>
        ))}

        <div role="tabpanel">
          <CodeMirror value={flow[selectedTab].fileContent} autoFocus />
        </div>
      </section>
    </>
  );
}
