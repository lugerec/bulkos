import { defineConfig } from "vitest/config";
import path from "path";

// Separate from vite.config.ts on purpose: the app's Vite config wires up
// Figma-specific asset resolution and plugins that Vitest doesn't need.
// Only the "@" alias is shared, since utils under test import via "@/...".
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
