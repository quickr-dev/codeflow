import { serve } from "bun";
import { renderToReadableStream } from "react-dom/server";
import { z } from "zod";
import { HomePage } from "./client/home-page";
import { Layout } from "./client/layout";
import { db } from "./lib/db";
import { ProjectFileSchema } from "./lib/schemas";

const server = serve({
	port: 8000,
	development: true,
	routes: {
		"/projects/:project": async (req) => {
			const data = db
				.query("SELECT * FROM project_files WHERE project = $project")
				.all({ project: req.params.project });

			const projectFiles = z.array(ProjectFileSchema).parse(data);

			const stream = await renderToReadableStream(
				<Layout>
					<HomePage files={projectFiles} />
				</Layout>,
			);

			return new Response(stream, {
				headers: { "Content-Type": "text/html" },
			});
		},

		"/api/projects/:project/files": {
			POST: async (req) => {
				const dataSchema = z.object({
					files: z.array(
						z.object({
							path: z.string(),
							content: z.string(),
						}),
					),
				});
				const body = await req.json();
				const data = dataSchema.parse(body);

				// @TODO Wrap in transaction
				db.query("DELETE FROM project_files WHERE project = $project").run({
					project: req.params.project,
				});

				for (const file of data.files) {
					db.query(
						"INSERT INTO project_files (project, path, content) VALUES ($project, $path, $content)",
					).run({
						project: req.params.project,
						path: file.path,
						content: file.content,
					});
				}

				return Response.json({ success: true });
			},
		},
	},
});

console.log(`Listening on localhost:${server.port}`);
