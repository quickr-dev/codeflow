"use client";

import { convertGraphToMermaid } from "@/lib/graph-to-mermaid";
import type { Memory } from "@/lib/memory";
import mermaid from "mermaid";
import { useEffect } from "react";

// @codeflow memory->graph->render
export function Diagram({ memory }: { memory: Memory }) {
  useEffect(() => {
    window.callback = () => {
      alert("A callback was triggered");
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
        {convertGraphToMermaid(memory.graph.map((node) => node.name))}
      </pre>
    </div>
  );
}
