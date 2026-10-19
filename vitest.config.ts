import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@chain-of-command/shared": fileURLToPath(
        new URL("./packages/shared/src/index.ts", import.meta.url),
      ),
    },
  },
  test: {
    include: ["packages/*/src/**/*.test.ts", "tests/**/*.test.ts"],
    // The API smoke scripts start an HTTP server and run separately via tsx.
    exclude: ["apps/**", "archive/**", ".devcontainer/**", "**/node_modules/**"],
    pool: "forks",
    maxWorkers: 2,
  },
});
