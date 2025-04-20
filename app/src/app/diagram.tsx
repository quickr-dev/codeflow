"use client";

import { convertGraphToMermaid } from "@/lib/graph-to-mermaid";
import type { Memory } from "@/lib/memory";
import mermaid from "mermaid";
import { useEffect } from "react";

// @codeflow(diagram->view#6)
export function Diagram({ graph }: { graph: Memory["annotations"] }) {
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
  }, []);

  return (
    <div>
      <pre className="mermaid">
        {convertGraphToMermaid(graph.map((node) => node.path))}
      </pre>
    </div>
  );
}
