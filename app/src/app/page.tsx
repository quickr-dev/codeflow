import { memory } from "@/lib/memory";
import { Diagram } from "./diagram";

export default function Page() {
  // @codeflow(diagram->view#5)
  const graph = memory.annotations;
  return (
    <div>
      <Diagram graph={graph} />
    </div>
  );
}
