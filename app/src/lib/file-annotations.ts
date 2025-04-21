import type { ProjectFile } from "@/db/schema";

export interface CodeFlowAnnotation {
  path: string;
  step: number;
  lineNumber: number;
  filePath: string;
}

export interface AnnotationsMap {
  [key: string]: CodeFlowAnnotation[];
}

type ProjectFileSubset = Pick<ProjectFile, "path" | "content">;

export function buildAnnotations(
  projectFiles: ProjectFileSubset[],
): AnnotationsMap {
  const combinedAnnotations: AnnotationsMap = {};

  for (const file of projectFiles) {
    const fileAnnotations = getAnnotations(file);

    for (const path in fileAnnotations) {
      if (!combinedAnnotations[path]) {
        combinedAnnotations[path] = [];
      }

      combinedAnnotations[path].push(...fileAnnotations[path]);
    }
  }

  for (const path in combinedAnnotations) {
    combinedAnnotations[path].sort((a, b) => a.step - b.step);
  }

  return combinedAnnotations;
}

export function getAnnotations(file: ProjectFileSubset): AnnotationsMap {
  const annotations: AnnotationsMap = {};
  const lines = file.content.split("\n");

  lines.forEach((line, index) => {
    const match = line.match(/@codeflow\(([^)]+)\)/);
    if (match) {
      const [path, stepStr] = match[1].split("#");
      const step = Number.parseInt(stepStr, 10);

      if (!annotations[path]) {
        annotations[path] = [];
      }

      annotations[path].push({
        path,
        step,
        lineNumber: index + 1,
        filePath: file.path,
      });
    }
  });

  return annotations;
}
