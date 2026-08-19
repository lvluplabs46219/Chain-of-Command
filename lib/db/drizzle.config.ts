import { defineConfig } from "drizzle-kit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Drizzle-kit may fail if connecting to remote DB.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/acquit_dev",
  },
});
