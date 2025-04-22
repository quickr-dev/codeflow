import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

declare global {
  // eslint-disable-next-line
  var pg: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing env var: DATABASE_URL");
}

const client =
  global.pg ||
  postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 30,
  });

if (process.env.NODE_ENV !== "production") {
  global.pg = client;
}

export const db = drizzle(client);
