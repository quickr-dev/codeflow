import * as vscode from "vscode";
import { CodeflowDocumentManager } from "./codeflowDocumentManager";
import { CodeflowGraphManager } from "./codeflowGraphManager";

export function activate(context: vscode.ExtensionContext) {
  console.log("CodeFlow Navigator is now active");

  const graphManager = new CodeflowGraphManager();
  const documentManager = new CodeflowDocumentManager(graphManager);

  // Initialize the graph by scanning files
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    graphManager.initializeGraph(rootPath).catch((err) => {
      vscode.window.showErrorMessage(
        `Failed to initialize CodeFlow graph: ${err.message}`,
      );
    });
  }

  const codeflowCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      { pattern: "**" },
      {
        provideCompletionItems(document, position) {
          const line = document.lineAt(position).text;

          if ("@codeflow".includes(line.slice(line.indexOf("@")))) {
            const item = new vscode.CompletionItem("@codeflow");
            item.insertText = "codeflow";

            return [item];
          }
          return undefined;
        },
        resolveCompletionItem(item) {
          return item;
        },
      },
      "@",
    );

  const segmentCompletionProvider =
    vscode.languages.registerCompletionItemProvider(
      { pattern: "**" },
      {
        provideCompletionItems(document, position) {
          const line = document.lineAt(position).text;
          if (!line.includes("@codeflow ")) {
            return undefined;
          }

          const segment = line.split("@codeflow ")[1];
          return graphManager.getCompletionItems(segment);
        },
        resolveCompletionItem(item) {
          return item;
        },
      },
      " ",
      "-",
      ">",
    );

  const linkProvider = vscode.languages.registerDocumentLinkProvider(
    { pattern: "**" },
    {
      provideDocumentLinks(document) {
        const links = [];

        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          const text = line.text;

          const atCodeflow = "@codeflow";
          if (text.includes(atCodeflow)) {
            const startIndex = text.indexOf(atCodeflow);
            const range = new vscode.Range(
              i,
              startIndex,
              i,
              startIndex + atCodeflow.length,
            );

            // const workspaceFolders = vscode.workspace.workspaceFolders;
            // if (workspaceFolders && workspaceFolders.length > 0) {
            //   const rootPath = workspaceFolders[0].uri.fsPath;
            //   getProjectName(rootPath).then((projectName) => {
            //     if (projectName) {
            //       vscode.env.openExternal(
            //         vscode.Uri.parse(
            //           `https://codeflow.quickr.dev/${projectName}`,
            //         ),
            //       );
            //     } else {
            //       vscode.window.showErrorMessage(
            //         "Could not find project name in .codeflow.json",
            //       );
            //     }
            //   });
            // }

            const link = new vscode.DocumentLink(
              range,
              vscode.Uri.parse("https://codeflow.quickr.dev/project"),
            );

            links.push(link);
          }
        }

        return links;
      },
    },
  );

  const definitionProvider = vscode.languages.registerDefinitionProvider(
    { pattern: "**" },
    {
      provideDefinition(document, position) {
        const line = document.lineAt(position).text;
        if (!line.includes("@codeflow")) {
          return undefined;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
          return null;
        }

        const word = document.getText(wordRange);
        const linePath = line.split("@codeflow ")[1];
        const clickedPath = linePath.slice(
          0,
          linePath.indexOf(word) + word.length,
        );

        const definition = graphManager.getDefinitionLocation(clickedPath);
        return definition;
      },
    },
  );

  const scanCommand = vscode.commands.registerCommand(
    "codeflow.scan",
    async function forceRebuildGraph() {
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (workspaceFolders && workspaceFolders.length > 0) {
        const rootPath = workspaceFolders[0].uri.fsPath;

        vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Scanning for @codeflow annotations",
            cancellable: false,
          },
          async () => {
            try {
              await graphManager.initializeGraph(rootPath, true);
              vscode.window.showInformationMessage(
                "CodeFlow annotation scanning complete",
              );
            } catch (err) {
              if (err instanceof Error) {
                vscode.window.showErrorMessage(
                  `Failed to scan CodeFlow annotations: ${err.message}`,
                );
              }
            }
          },
        );
      } else {
        vscode.window.showErrorMessage("No workspace folder found");
      }
    },
  );

  // Update graph when files change
  const fileWatcher = vscode.workspace.createFileSystemWatcher("**/*");
  fileWatcher.onDidChange((uri) => {
    documentManager.handleFileChange(uri.fsPath);
  });
  fileWatcher.onDidDelete((uri) => {
    documentManager.handleFileDelete(uri.fsPath);
  });

  context.subscriptions.push(
    codeflowCompletionProvider,
    segmentCompletionProvider,
    definitionProvider,
    linkProvider,
    scanCommand,
    fileWatcher,
  );
}

export function deactivate() {
  console.log("CodeFlow Navigator is deactivated");
}
