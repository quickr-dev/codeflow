import { memory } from "@/lib/memory";
import { Diagram } from "./diagram";

export default function Page() {
  // @codeflow memory->graph->render
  return (
    <div>
      <Diagram memory={memory} />
    </div>
  );
}
