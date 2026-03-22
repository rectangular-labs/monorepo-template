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
      "./src/client.ts",
      "./src/server.ts",
      "./src/context.ts",
      "./src/env.ts",
      "./src/types.ts",
      "./src/schema/*.ts",
    ],
    format: ["esm" as const],
    sourcemap: "hidden",
    minify: command === "build",
    clean: true,
    failOnWarn: "ci-only",
  },
}));
