import { describe, expect, test } from "bun:test";
import { pathsToMermaid } from "./mermaid";

describe("convertGraphToMermaid", () => {
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

		expect(result).toStartWith(`flowchart LR
memory-->graph
edges-->diagram
diagram-->view
diagram-->add

click graph call didClickLeafNode("memory->graph")
click view call didClickLeafNode("edges->diagram->view")
click add call didClickLeafNode("edges->diagram->add")
`);
	});
});
