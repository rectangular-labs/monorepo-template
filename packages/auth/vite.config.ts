import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => ({
  pack: {
    dts: {
      tsgo: true,
    },
    exports: {
      enabled: true,
      devExports: true,
    },
    entry: [
      { index: "./src/server.ts" },
      "./src/client.ts",
      "./src/env.ts",
      "./src/adapter/better-auth.ts",
      "./src/adapter/types.ts",
    ],
    format: ["esm" as const],
    sourcemap: "hidden",
    minify: command === "build",
    clean: true,
    failOnWarn: "ci-only",
  },
}));
