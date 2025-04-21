import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm/table";

export type ProjectFile = InferSelectModel<typeof projectFilesTbl>;

export const projectFilesTbl = pgTable("project_files", {
  id: serial("id").primaryKey(),
  project: text("project").notNull(),
  path: text("path").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
