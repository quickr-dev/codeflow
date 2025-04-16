export interface CodeflowNode {
  filePath: string;
  lineNumber: number;
}

export interface CodeflowGraph {
  nodes: {
    [path: string]: CodeflowNode;
  };
}

export interface CodeflowAnnotation {
  path: string;
  options: Record<string, string>;
  filePath: string;
  lineNumber: number;
}
