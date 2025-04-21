import { db } from "@/db/db";
import { projectFilesTbl } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const dataSchema = z.object({
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    }),
  ),
});

// @codeflow(diagram->view#4)
export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const body = await req.json();
  const data = dataSchema.parse(body);

  const project = (await params).id;
  const newFiles = data.files.map((file) => ({
    project,
    path: file.path,
    content: file.content,
  }));

  await db.transaction(async (tx) => {
    await tx
      .delete(projectFilesTbl)
      .where(eq(projectFilesTbl.project, project));
    await tx.insert(projectFilesTbl).values(newFiles);
  });

  return new Response(null, { status: 200 });
};
