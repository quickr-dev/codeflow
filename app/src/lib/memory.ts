import { z } from "zod";

export type Memory = z.output<typeof MemorySchema>;
export const MemorySchema = z.object({
  graph: z.array(
    z.object({
      name: z.string(),
      filePath: z.string(),
      lineNumber: z.number(),
      fileContent: z.string(),
    }),
  ),
});

// @codeflow memory
export const memory: Memory = {
  // @codeflow memory->graph
  graph: [],
};
