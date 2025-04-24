"use client";

import type { ProjectFile } from "@/db/schema";
import type { CodeFlowAnnotation } from "@/lib/file-annotations";
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
import { useEffect } from "react";
import { CodeEditorNode, type CodeEditorNodeData } from "./code-editor-node";

const nodeTypes = {
  codeEditor: CodeEditorNode,
};

interface FlowViewerProps {
  annotations: CodeFlowAnnotation[];
  projectFiles: ProjectFile[];
}

function getNodeId(annotation: CodeFlowAnnotation) {
  return `${annotation.path}#${annotation.step}`;
}

export function FlowViewer({ annotations, projectFiles }: FlowViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    const initialNodes: Node[] = annotations.map((node) => {
      const annotation: CodeEditorNodeData = {
        ...node,
        fileContent:
          projectFiles.find((f) => f.path === node.filePath)?.content ??
          "File not found",
      };

      return {
        id: getNodeId(node),
        data: { annotation },
        position: { x: 0, y: 0 },
        type: "codeEditor",
      };
    });

    const initialEdges: Edge[] = [];
    for (let i = 0; i < annotations.length - 1; i++) {
      initialEdges.push({
        id: `edge-${getNodeId(annotations[i])}->${getNodeId(annotations[i + 1])}`,
        source: getNodeId(annotations[i]),
        target: getNodeId(annotations[i + 1]),
        animated: true,
      });
    }

    const layouted = getLayoutedElements(initialNodes, initialEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [annotations, projectFiles, setNodes, setEdges]);

  const fitNodes = annotations
    .slice(0, 3)
    .map((node) => ({ id: getNodeId(node) }));

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
        fitViewOptions={{
          nodes: fitNodes,
          maxZoom: 1,
        }}
      >
        <Background />
        <Panel position="top-left">{annotations[0].path.split("#")[0]}</Panel>
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
