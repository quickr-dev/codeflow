/**
 * Converts an array of paths to Mermaid flowchart syntax
 * @param paths Array of paths in the format "node1->node2->node3#stepNumber"
 * @returns Mermaid flowchart syntax string
 */
export function convertGraphToMermaid(paths: string[]): string {
  const uniquePaths = new Set<string>();
  const pathsWithoutIds = new Map<string, string[]>();

  for (const path of paths) {
    const [fullPath] = path.split("#");

    const pathSegments = fullPath.split("->");
    const leafNodePath = pathSegments.join("->");
    const leafNode = pathSegments[pathSegments.length - 1];

    if (!pathsWithoutIds.has(leafNode)) {
      pathsWithoutIds.set(leafNode, []);
    }
    pathsWithoutIds.get(leafNode)?.push(leafNodePath);

    for (let i = 0; i < pathSegments.length - 1; i++) {
      const connection = `${pathSegments[i]}-->${pathSegments[i + 1]}`;
      uniquePaths.add(connection);
    }
  }

  let result = "flowchart LR\n";

  for (const path of uniquePaths) {
    result += `${path}\n`;
  }

  if (pathsWithoutIds.size > 0) {
    result += "\n";

    for (const [leafNode, fullPaths] of pathsWithoutIds.entries()) {
      const uniqueFullPaths = [...new Set(fullPaths)];

      for (const fullPath of uniqueFullPaths) {
        result += `click ${leafNode} call didClickLeafNode("${fullPath}")\n`;
      }
    }
  }

  return result;
}
