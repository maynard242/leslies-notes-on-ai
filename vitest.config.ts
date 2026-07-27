import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: [
      { find: "server-only", replacement: path.resolve(__dirname, "tests/server-only.ts") },
      { find: "@", replacement: path.resolve(__dirname, ".") },
    ],
  },
});
