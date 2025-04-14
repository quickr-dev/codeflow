import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Get project name from .codeflow.json file
 */
export async function getProjectName(rootPath: string): Promise<string | null> {
  try {
    const configPath = join(rootPath, ".codeflow.json");
    const configContent = await readFile(configPath, "utf-8");
    const config = JSON.parse(configContent);

    return config.project || null;
  } catch (err) {
    return null;
  }
}
