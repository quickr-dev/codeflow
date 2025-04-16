export function convertGraphToMermaid(paths: string[]): string {
  const nodeMap = createNodeMap(paths);
  const connections = identifyConnections(paths, nodeMap);
  return generateMermaidSyntax(nodeMap, connections);
}

/**
 * Assign a unique ID to each node to avoid conflicts with Mermaid keywords.
 */
function createNodeMap(paths: string[]): Map<string, string> {
  const nodeMap = new Map<string, string>();
  let nodeCounter = 0;

  for (const path of paths) {
    const segments = path.split("->");
    for (const segment of segments) {
      if (!nodeMap.has(segment)) {
        nodeMap.set(segment, `node${nodeCounter++}`);
      }
    }
  }

  return nodeMap;
}

export function identifyConnections(
  paths: string[],
  nodeMap: Map<string, string>,
): Array<[string, string]> {
  const connectionSet = new Set<string>();

  for (const path of paths) {
    const segments = path.split("->");
    for (let i = 0; i < segments.length - 1; i++) {
      const fromId = nodeMap.get(segments[i]);
      const toId = nodeMap.get(segments[i + 1]);
      if (!fromId || !toId) {
        continue;
      }

      connectionSet.add(`${fromId}->${toId}`);
    }
  }

  return Array.from(connectionSet).map((conn) => {
    const [from, to] = conn.split("->");
    return [from, to];
  });
}

export function generateMermaidSyntax(
  nodeMap: Map<string, string>,
  connections: Array<[string, string]>,
): string {
  let mermaidCode = "flowchart TD\n";

  for (const [nodeName, id] of nodeMap.entries()) {
    mermaidCode += `${id}["${capitalize(nodeName)}"]\n`;
  }

  for (const [from, to] of connections) {
    mermaidCode += `${from} --> ${to}\n`;
  }

  return mermaidCode;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.replaceAll("_", " ").slice(1);
}
