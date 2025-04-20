import { memory } from "@/lib/memory";
import { Diagram } from "./diagram";
import { FlowViewer } from "./flow-viewer";

export default async function Page({
  searchParams,
}: { searchParams: Promise<Record<string, string>> }) {
  // @codeflow(diagram->view#5)
  const graph = memory.annotations;
  const selectedNode = (await searchParams).node;
  const selectedFlow = selectedNode
    ? graph.filter((node) => node.path.startsWith(selectedNode))
    : [];

  return (
    <div className="p-6">
      <div>
        <Diagram graph={graph} />
      </div>

      {selectedFlow.length > 0 && (
        <div className="h-screen">
          <FlowViewer flow={selectedFlow} />
        </div>
      )}
    </div>
  );
}
