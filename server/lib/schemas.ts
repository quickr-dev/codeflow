import { z } from "zod";

export type ProjectFile = z.infer<typeof ProjectFileSchema>;
export const ProjectFileSchema = z.object({
	project: z.string(),
	path: z.string(),
	content: z.string(),
});
