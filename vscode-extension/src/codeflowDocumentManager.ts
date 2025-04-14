import { CodeflowGraphManager } from "./codeflowGraphManager";

export class CodeflowDocumentManager {
  private graphManager: CodeflowGraphManager;

  constructor(graphManager: CodeflowGraphManager) {
    this.graphManager = graphManager;
  }

  /**
   * Handle a file change event
   */
  async handleFileChange(filePath: string): Promise<void> {
    await this.graphManager.updateFile(filePath);
  }

  /**
   * Handle a file deletion event
   */
  async handleFileDelete(filePath: string): Promise<void> {
    await this.graphManager.handleFileDelete(filePath);
  }
}
