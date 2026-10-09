/**
 * Database connection for the API server.
 * FAIL FAST: never silently substitute a mock DB in a legal product.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as workspaceSchema from "@workspace/db";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL || !String(DATABASE_URL).trim()) {
  throw new Error(
    "[Chain of Command] DATABASE_URL is required. Refusing to start with a mock database."
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: true }
      : process.env.PGSSLMODE === "disable"
        ? false
        : { rejectUnauthorized: false },
});

const db = drizzle(pool, {
  schema: workspaceSchema,
});

export { db, pool };
export * from "drizzle-orm";
export default db;
