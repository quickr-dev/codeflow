"use client";

import type { Memory } from "@/lib/memory";
import Dagre from "@dagrejs/dagre";
import {
  Background,
  type Edge,
  type Node,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { CodeEditorNode } from "./code-editor-node";

const nodeTypes = {
  codeEditor: CodeEditorNode,
};

export function FlowViewer({ flow }: { flow: Memory["annotations"] }) {
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

  const layouted = getLayoutedElements(initialNodes, initialEdges);
  const [nodes, _setNodes, onNodesChange] = useNodesState(layouted.nodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(layouted.edges);

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        className="border border-gray-300"
        noWheelClassName="CodeEditorNode"
        panOnScroll
        fitView
      >
        <Background />
        <Panel position="top-left">{flow[0].path.split("#")[0]}</Panel>
      </ReactFlow>
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
      width: CodeEditorNode.WIDTH,
      height: CodeEditorNode.HEIGHT,
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
