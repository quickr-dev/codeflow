import { serve } from "bun";
import { Database } from "bun:sqlite";
import { z } from "zod";

const db = new Database("db.sqlite", { strict: true });
db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    id INTEGER PRIMARY KEY,
    project TEXT,
    path TEXT,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
const fileSchema = z.object({
	project: z.string(),
	path: z.string(),
	content: z.string(),
});
const filesSchema = z.array(fileSchema);

const server = serve({
	port: 8000,
	development: true,
	routes: {
		"/api/projects/:project/files": {
			GET: async (req) => {
				const files = db
					.query("SELECT * FROM files WHERE project = $project")
					.all({ project: req.params.project });

				return Response.json({
					files: filesSchema.parse(files),
				});
			},

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
				db.query("DELETE FROM files WHERE project = $project").run({
					project: req.params.project,
				});

				for (const file of data.files) {
					db.query(
						"INSERT INTO files (project, path, content) VALUES ($project, $path, $content)",
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
