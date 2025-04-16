import { z } from "zod";

export type Memory = z.output<typeof MemorySchema>;
export const MemorySchema = z.object({
  annotations: z.array(
    z.object({
      path: z.string(),
      options: z.object({
        lineNumber: z.number().optional().default(15),
      }),
      filePath: z.string(),
      lineNumber: z.number(),
      fileContent: z.string(),
    }),
  ),
});

// @codeflow memory
export const memory: Memory = {
  // @codeflow memory->graph
  annotations: [],
};
