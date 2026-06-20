import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/tests/**/*.test.ts"],
    setupFiles: [],
    env: {
      GROQ_API_KEY: "test-key-placeholder",
      NODE_ENV: "test",
    },
  },
});
