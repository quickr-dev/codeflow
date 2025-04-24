interface ParsedPath {
  fullPath: string;
  segments: string[];
  leafNode: string;
}

interface PathData {
  connections: Set<string>;
  leafNodePaths: Map<string, string[]>;
  selectedNode: string | null;
}

function parsePath(path: string): ParsedPath {
  const [fullPath] = path.split("#");
  const segments = fullPath.split("->");
  const leafNode = segments[segments.length - 1];

  return { fullPath, segments, leafNode };
}

/**
 * Extract connections and leaf node data from paths
 */
function extractPathData(paths: string[], selectedPath?: string): PathData {
  const connections = new Set<string>();
  const leafNodePaths = new Map<string, string[]>();
  let selectedNode: string | null = null;

  for (const path of paths) {
    const { fullPath, segments, leafNode } = parsePath(path);

    // Check if this is the selected path
    if (selectedPath && fullPath === selectedPath) {
      selectedNode = leafNode;
    }

    // Store leaf node paths for click handlers
    if (!leafNodePaths.has(leafNode)) {
      leafNodePaths.set(leafNode, []);
    }
    leafNodePaths.get(leafNode)?.push(fullPath);

    // Create connections between nodes
    for (let i = 0; i < segments.length - 1; i++) {
      const connection = `${segments[i]}-->${segments[i + 1]}`;
      connections.add(connection);
    }
  }

  return { connections, leafNodePaths, selectedNode };
}

function generateMermaidCode(pathData: PathData): string {
  const { connections, leafNodePaths, selectedNode } = pathData;
  let result = "flowchart LR\n";

  // Add connections
  for (const connection of connections) {
    result += `${connection}\n`;
  }

  // Add class for selected node if applicable
  if (selectedNode) {
    result += `\nclass ${selectedNode} selected-node\n`;
  }

  // Add click handlers for leaf nodes
  if (leafNodePaths.size > 0) {
    result += "\n";

    for (const [leafNode, fullPaths] of leafNodePaths.entries()) {
      const uniqueFullPaths = [...new Set(fullPaths)];

      for (const fullPath of uniqueFullPaths) {
        result += `click ${leafNode} call didClickLeafNode("${fullPath}")\n`;
      }
    }
  }

  return result;
}

/**
 * Convert path strings to Mermaid flowchart definition
 */
export function pathsToMermaid(paths: string[], selectedPath?: string): string {
  const pathData = extractPathData(paths, selectedPath);
  return generateMermaidCode(pathData);
}
