import type { CodeFlowAnnotation } from "@/lib/file-annotations";
import { Handle, Position } from "@xyflow/react";
import { CodeEditor } from "./code-editor";

CodeEditorNode.WIDTH = 600;
CodeEditorNode.HEIGHT = 600;

export interface CodeEditorNodeData extends CodeFlowAnnotation {
  fileContent: string;
}

interface CodeEditorNodeProps {
  data: {
    annotation: CodeEditorNodeData;
  };
}

export function CodeEditorNode({ data }: CodeEditorNodeProps) {
  const fileName = data.annotation.filePath.split("/").pop() ?? "";

  return (
    <>
      <Handle type="target" position={Position.Left} style={{ top: 15 }} />
      <Handle type="source" position={Position.Right} style={{ top: 15 }} />

      <div className="border border-gray-300">
        <div
          className="border-b-2 py-1 px-2 bg-white border-gray-200 text-xs"
          title={data.annotation.filePath}
        >
          {fileName}
        </div>
        <CodeEditor
          className="CodeEditorNode"
          autoFocus
          lineNumber={data.annotation.lineNumber}
          height={`${CodeEditorNode.HEIGHT}px`}
          width={`${CodeEditorNode.WIDTH}px`}
          value={data.annotation.fileContent}
          highlightRegExp={
            new RegExp(`@codeflow\\(${data.annotation.path}.*\\)`, "ig")
          }
        />
      </div>
    </>
  );
}
