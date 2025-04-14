import * as fs from "fs/promises";
import { CodeflowAnnotation } from "./types";

/**
 * Pattern to match @codeflow annotations
 * Captures the path after @codeflow
 */
const ANNOTATION_PATTERN = /@codeflow\s+([^@\s]+)/g;

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
    const matches = [...line.matchAll(ANNOTATION_PATTERN)];

    for (const match of matches) {
      const path = match[1];
      annotations.push({
        path,
        filePath,
        lineNumber: i,
      });
    }
  }

  return annotations;
}
