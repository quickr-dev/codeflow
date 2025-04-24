import { Diagram } from "@/components/diagram";
import { FlowViewer } from "@/components/flow-viewer";
import { db } from "@/db/db";
import { projectFilesTbl } from "@/db/schema";
import { buildAnnotations } from "@/lib/file-annotations";
import { pathsToMermaid } from "@/lib/mermaid";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page({ searchParams, params }: Props) {
  const projectFiles = await db
    .select()
    .from(projectFilesTbl)
    .where(eq(projectFilesTbl.project, (await params).id));

  const annotationsByPath = buildAnnotations(projectFiles);
  const paths = Object.keys(annotationsByPath);

  // @codeflow(diagram->view#5)
  const selectedNode = (await searchParams).node;
  const selectedPathAnnotations = annotationsByPath[selectedNode];
  const mermaidString = pathsToMermaid(paths, selectedNode);

  return (
    <div className="p-6">
      <div>
        {paths.length > 0 ? (
          <Diagram mermaidString={mermaidString} />
        ) : (
          <p>Project {(await params).id} has no data</p>
        )}
      </div>

      {selectedPathAnnotations && (
        <div className="h-150 mt-10">
          <FlowViewer
            annotations={selectedPathAnnotations}
            projectFiles={projectFiles}
          />
        </div>
      )}
    </div>
  );
}
