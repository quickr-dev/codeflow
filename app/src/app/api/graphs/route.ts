import { MemorySchema, memory } from "@/lib/memory";
import type { NextRequest } from "next/server";

// @codeflow(diagram->view#4)
export const POST = async (req: NextRequest) => {
  const data = await req.json();
  console.log(">>>", data);
  memory.annotations = MemorySchema.parse({ annotations: data }).annotations;

  return new Response(null, {
    status: 200,
  });
};
