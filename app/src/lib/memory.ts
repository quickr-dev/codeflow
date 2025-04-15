interface CodeflowNode {
	filePath: string;
	lineNumber: number;
}

interface CodeflowGraph {
	nodes: {
		[path: string]: CodeflowNode;
	};
}

export const memory: { graph: CodeflowGraph } = {
	graph: { nodes: {} },
};
