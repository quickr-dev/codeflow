import { FlowViewer } from "@/app/flow-viewer";
import { db } from "@/db/db";
import { projectFilesTbl } from "@/db/schema";
import { buildAnnotations } from "@/lib/file-annotations";
import { pathsToMermaid } from "@/lib/mermaid";
import { eq } from "drizzle-orm";
import { Diagram } from "../../diagram";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function Page({ searchParams, params }: Props) {
  const projectFiles = await db
    .select()
    .from(projectFilesTbl)
    .where(eq(projectFilesTbl.project, (await params).id));

  const annotations = buildAnnotations(projectFiles);
  const paths = Object.keys(annotations);
  const mermaidString = pathsToMermaid(paths);

  // @codeflow(diagram->view#5)
  const selectedNode = (await searchParams).node;
  const selectedFlow = annotations[selectedNode];

  return (
    <div className="p-6">
      <div>
        {paths.length > 0 ? (
          <Diagram mermaidString={mermaidString} />
        ) : (
          <p>Project {(await params).id} has no data</p>
        )}
      </div>

      {selectedFlow && (
        <div className="h-150">
          <FlowViewer annotations={selectedFlow} projectFiles={projectFiles} />
        </div>
      )}
    </div>
  );
}
