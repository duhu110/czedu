import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "happy-dom",
    pool: "threads",
    setupFiles: ["./tests/setup.ts"],
  },
});
