import type { Memory } from "@/lib/memory";
import { Handle, Position } from "@xyflow/react";
import { CodeEditor } from "./code-editor";

CodeEditorNode.WIDTH = 600;
CodeEditorNode.HEIGHT = 400;

interface CodeEditorNodeProps {
  data: {
    node: Memory["annotations"][number];
  };
}

export function CodeEditorNode({ data }: CodeEditorNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ top: 15 }} />
      <Handle type="source" position={Position.Right} style={{ top: 15 }} />

      <div className="border border-gray-300">
        <div className="border-b-2 py-1 px-2 bg-white border-gray-200">
          {data.node.filePath}
        </div>
        <CodeEditor
          className="CodeEditorNode"
          autoFocus
          lineNumber={data.node.lineNumber}
          height={`${CodeEditorNode.HEIGHT}px`}
          width={`${CodeEditorNode.WIDTH}px`}
          value={data.node.fileContent}
        />
      </div>
    </>
  );
}
