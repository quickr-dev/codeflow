import { expect, test } from "bun:test";
import { convertGraphToMermaid } from "./graph-to-mermaid";

test("convertGraphToMermaid", () => {
  const paths = [
    "memory",
    "memory->graph",
    "memory->graph->save",
    "memory->graph->button",
  ];
  const result = convertGraphToMermaid(paths);

  expect(result).toEqual(`flowchart TD
node0["Memory"]
node1["Graph"]
node2["Save"]
node3["Button"]
node0 --> node1
node1 --> node2
node1 --> node3
`);
});
