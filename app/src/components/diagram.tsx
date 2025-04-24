"use client";

import mermaid from "mermaid";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    didClickLeafNode: (nodeId: string) => void;
  }
}

// @codeflow(diagram->view#6)
export function Diagram({ mermaidString }: { mermaidString: string }) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (mermaidRef.current) {
      window.didClickLeafNode = (nodeId: string) => {
        const searchParams = new URLSearchParams({
          node: nodeId,
        });
        router.push(`?${searchParams.toString()}`);
      };

      mermaid.initialize({
        startOnLoad: true,
        theme: "base",
        securityLevel: "loose",
        themeVariables: {
          primaryColor: "#fff",
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "cardinal",
        },
      });

      mermaidRef.current.innerHTML = "";

      const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
      mermaid.render(id, mermaidString).then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
          result.bindFunctions?.(mermaidRef.current);
        }
      });
    }
  }, [mermaidString, router]);

  return <div ref={mermaidRef} />;
}
