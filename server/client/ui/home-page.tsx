import { buildAnnotations } from "@client/lib/file-annotations";
import { pathsToMermaid } from "@client/lib/mermaid";
import type { ProjectFile } from "@schemas";
import { Diagram } from "./diagram";

interface HomePageProps {
	projectFiles: ProjectFile[];
}

export function HomePage({ projectFiles }: HomePageProps) {
	const annotations = buildAnnotations(projectFiles);
	const paths = Object.keys(annotations);
	const mermaidString = pathsToMermaid(paths);

	// const graph = memory.annotations;
	// const selectedNode = (await searchParams).node;
	// const selectedFlow = selectedNode
	//   ? graph.filter((node) => node.path.startsWith(selectedNode))
	//   : [];

	return (
		<div className="p-6">
			<div>
				<Diagram mermaidString={mermaidString} />
			</div>

			{/* {selectedFlow.length > 0 && (
				<div className="h-screen">
					<FlowViewer flow={selectedFlow} />
				</div>
			)} */}
		</div>
	);
}
