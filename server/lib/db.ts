import { Database } from "bun:sqlite";

export const db = new Database("db.sqlite", { strict: true });

db.exec(`
	CREATE TABLE IF NOT EXISTS project_files (
		id INTEGER PRIMARY KEY,
		project TEXT,
		path TEXT,
		content TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)
`);
