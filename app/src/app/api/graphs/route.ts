import { MemorySchema, memory } from "@/lib/memory";
import type { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  const graph = await req.json();
  // @codeflow memory->graph->save
  memory.graph = MemorySchema.parse({ graph }).graph;

  return new Response(null, {
    status: 200,
  });
};
