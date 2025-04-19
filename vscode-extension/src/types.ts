export interface CodeflowGraph {
  nodes: {
    [path: string]: CodeflowAnnotation;
  };
}

export interface CodeflowAnnotation {
  path: string;
  options: Record<string, string>;
  filePath: string;
  lineNumber: number;
}
