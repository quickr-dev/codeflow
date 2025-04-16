import axios from "axios";
import * as fs from "fs/promises";
import ignore, { Ignore } from "ignore";
import * as path from "path";
import * as vscode from "vscode";
import { scanFileForAnnotations } from "./fileScanner";
import { CodeflowAnnotation, CodeflowGraph } from "./types";

export class CodeflowGraphManager {
  private graph: CodeflowGraph = { nodes: {} };
  private annotations: CodeflowAnnotation[] = [];
  private cachePath = "";
  private initialized = false;

  /**
   * Initialize the graph either from cache or by scanning files
   */
  async initializeGraph(rootPath: string, forceRescan = false): Promise<void> {
    if (this.initialized && !forceRescan) {
      return;
    }

    this.cachePath = path.join(rootPath, ".codeflow", "graph.json");

    try {
      // Check if cache directory exists, create if not
      const cacheDir = path.dirname(this.cachePath);
      try {
        await fs.access(cacheDir);
      } catch {
        await fs.mkdir(cacheDir, { recursive: true });
      }

      // Try to load from cache if not forcing rescan
      if (!forceRescan) {
        try {
          await fs.access(this.cachePath);
          const cacheContent = await fs.readFile(this.cachePath, "utf-8");
          this.graph = JSON.parse(cacheContent);
          this.initialized = true;
          return;
        } catch (err) {
          // Cache doesn't exist or is invalid, continue to scanning
          console.log("No valid cache found, scanning files...");
        }
      }

      // Scan project files
      this.graph = { nodes: {} };
      await this.scanProject(rootPath);
      await this.saveGraphToCache();
      this.initialized = true;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to initialize graph: ${err.message}`);
      }
      throw err;
    }
  }

  /**
   * Get completion items for a given path prefix.
   *
   * Example:
   * "some->pat" matches:
   * - "some->path"
   * - "some->path->deep"
   * - "some->path->deep->deeper"
   * - etc
   */
  getCompletionItems(segment: string): vscode.CompletionItem[] {
    const completionItems: vscode.CompletionItem[] = [];

    for (const path of this.getAllPaths()) {
      if (path.startsWith(segment)) {
        const item = new vscode.CompletionItem(
          path,
          vscode.CompletionItemKind.Reference,
        );
        item.insertText = path.replace(segment, "");
        completionItems.push(item);
      }
    }

    return completionItems;
  }

  /**
   * Get location of a definition for the given path
   */
  getDefinitionLocation(path: string): vscode.Location | undefined {
    const node = this.graph.nodes[path];
    if (!node) {
      return undefined;
    }

    const uri = vscode.Uri.file(node.filePath);
    const position = new vscode.Position(node.lineNumber, 0);
    return new vscode.Location(uri, position);
  }

  /**
   * Scan a project for CodeFlow annotations
   */
  private async scanProject(rootPath: string): Promise<void> {
    try {
      // Read .gitignore if it exists
      const ignoreFilter = ignore();
      try {
        const gitignorePath = path.join(rootPath, ".gitignore");
        const gitignoreContent = await fs.readFile(gitignorePath, "utf-8");
        ignoreFilter.add(gitignoreContent);
      } catch (err) {
        // No .gitignore or can't read it, continue without ignore rules
      }

      // Always ignore node_modules and .git
      ignoreFilter.add(["node_modules", ".git", "dist", "build", "out"]);

      await this.scanDirectory(rootPath, rootPath, ignoreFilter);
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Failed to scan project: ${err.message}`);
      }
      throw err;
    }
  }

  /**
   * Recursively scan a directory for files
   */
  private async scanDirectory(
    rootPath: string,
    currentDir: string,
    ignoreFilter: Ignore,
  ): Promise<void> {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      if (ignoreFilter.ignores(relativePath.replace(/\\/g, "/"))) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(rootPath, fullPath, ignoreFilter);
      } else {
        await this.scanFile(fullPath);
      }
    }
  }

  /**
   * Scan a single file for CodeFlow annotations
   */
  async scanFile(filePath: string): Promise<void> {
    try {
      this.annotations = await scanFileForAnnotations(filePath);

      // Update graph with annotations
      for (const annotation of this.annotations) {
        this.graph.nodes[annotation.path] = {
          filePath: filePath,
          lineNumber: annotation.lineNumber,
        };
      }
    } catch (err) {
      console.error(`Error scanning file ${filePath}:`, err);
    }
  }

  /**
   * Remove annotations from a file that was deleted
   */
  async handleFileDelete(filePath: string): Promise<void> {
    if (!this.initialized) return;

    // Find and remove all nodes for this file
    const pathsToRemove: string[] = [];

    for (const [path, node] of Object.entries(this.graph.nodes)) {
      if (node.filePath === filePath) {
        pathsToRemove.push(path);
      }
    }

    for (const path of pathsToRemove) {
      delete this.graph.nodes[path];
    }

    await this.saveGraphToCache();
  }

  /**
   * Update annotations for a file that changed
   */
  async updateFile(filePath: string): Promise<void> {
    if (!this.initialized) return;

    // Remove existing annotations for this file
    await this.handleFileDelete(filePath);

    // Add new annotations
    await this.scanFile(filePath);

    await Promise.all([
      // @codeflow(diagram->view#2, { lines: 1 }))
      this.updateProject(),
      this.saveGraphToCache(),
    ]);
  }

  // @codeflow(diagram->view#3))
  async updateProject(): Promise<void> {
    console.log(">>> updating project");
    const data: (CodeflowAnnotation & { fileContent: string })[] = [];

    for (const annotation of this.annotations) {
      data.push({
        ...annotation,
        fileContent: await fs.readFile(annotation.filePath, "utf-8"),
      });
    }

    await axios.post("http://localhost:3000/api/graphs", data);
  }

  /**
   * Save the graph to the cache file
   */
  private async saveGraphToCache(): Promise<void> {
    try {
      await fs.writeFile(
        this.cachePath,
        JSON.stringify(this.graph, null, 2),
        "utf-8",
      );
    } catch (err) {
      console.error("Failed to save graph to cache:", err);
    }
  }

  /**
   * Get all paths in the graph
   */
  private getAllPaths(): string[] {
    return Object.keys(this.graph.nodes);
  }
}
