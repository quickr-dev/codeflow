import type { Memory } from "@/lib/memory";
import CodeMirror from "@uiw/react-codemirror";
import { Handle, Position } from "@xyflow/react";

export function CodeEditorNode({
  data,
}: { data: { node: Memory["annotations"][number] } }) {
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ top: 15 }} />
      <Handle type="source" position={Position.Right} style={{ top: 15 }} />

      <div className="border border-gray-300">
        <div className="border-b-2 py-1 px-2 bg-white border-gray-200">
          #{data.node.path[data.node.path.length - 1]}- {data.node.filePath}
        </div>
        <CodeMirror
          value={data.node.fileContent}
          autoFocus
          height="50rem"
          width="38rem"
        />
      </div>
    </>
  );
}
