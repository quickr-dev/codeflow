import * as fs from "fs/promises";
import { parseCodeflowDefinition } from "./lib/parser";
import { CodeflowAnnotation } from "./types";

/**
 * Scan a file for @codeflow annotations
 */
export async function scanFileForAnnotations(
  filePath: string,
): Promise<CodeflowAnnotation[]> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return extractAnnotations(content, filePath);
  } catch (err) {
    // Skip files that can't be read as text
    return [];
  }
}

/**
 * Extract annotations from file content
 */
export function extractAnnotations(
  content: string,
  filePath: string,
): CodeflowAnnotation[] {
  const annotations: CodeflowAnnotation[] = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("@codeflow")) {
      continue;
    }

    const params = parseCodeflowDefinition(line);

    annotations.push({
      path: params.pathDefinition,
      options: params.options,
      filePath,
      lineNumber: i,
    });
  }

  return annotations;
}
