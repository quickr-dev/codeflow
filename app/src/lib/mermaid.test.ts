import { describe, expect, test } from "bun:test";
import { pathsToMermaid } from "./mermaid";

describe("pathsToMermaid", () => {
  test("handles single path", () => {
    const paths = [
      "memory->graph#1",
      "memory->graph#2",
      "memory->graph#3",
      "memory->graph#4",
    ];
    const result = pathsToMermaid(paths);

    expect(result).toStartWith(`flowchart LR
memory-->graph
`);
  });

  test("handles multiple paths", () => {
    const paths = [
      "memory->graph#2",
      "memory->graph#4",
      "memory->graph#1",
      "memory->graph#3",
      "app->users->add#1",
      "app->users->add#2",
      "edges->diagram->view#1",
      "edges->diagram->view#2",
      "edges->diagram->add#2",
      "edges->diagram->add#1",
    ];
    const result = pathsToMermaid(paths);

    expect(result).toStartWith(`flowchart LR
memory-->graph
app-->users
users-->add
edges-->diagram
diagram-->view
diagram-->add
`);
  });

  test("adds click events to leaf nodes", () => {
    const paths = [
      "memory->graph#2",
      "memory->graph#1",
      "edges->diagram->view#1",
      "edges->diagram->add#1",
      "edges->diagram->add#0",
    ];
    const result = pathsToMermaid(paths);

    expect(result).toContain(
      `click graph call didClickLeafNode("memory->graph")`,
    );
    expect(result).toContain(
      `click view call didClickLeafNode("edges->diagram->view")`,
    );
    expect(result).toContain(
      `click add call didClickLeafNode("edges->diagram->add")`,
    );
  });

  test("applies selected-node style to the selected node", () => {
    const paths = [
      "memory->graph#1",
      "app->users->add#1",
      "edges->diagram->view#1",
    ];
    const selectedPath = "app->users->add";
    const result = pathsToMermaid(paths, selectedPath);

    expect(result).toContain("class add selected-node");
  });

  test("doesn't apply styling when no path is selected", () => {
    const paths = ["memory->graph#1", "app->users->add#1"];
    const result = pathsToMermaid(paths);

    expect(result).not.toContain("style ");
    expect(result).not.toContain("selected-node");
  });

  test("handles selected path that doesn't exist in paths", () => {
    const paths = ["memory->graph#1", "app->users->add#1"];
    const selectedPath = "non->existent->path";
    const result = pathsToMermaid(paths, selectedPath);

    expect(result).not.toContain("style ");
    expect(result).not.toContain("selected-node");
  });
});
