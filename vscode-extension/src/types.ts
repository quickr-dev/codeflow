export enum CodeflowNodeType {
  Annotation = "annotation",
}

export interface CodeflowNode {
  type: CodeflowNodeType;
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
  filePath: string;
  lineNumber: number;
}
