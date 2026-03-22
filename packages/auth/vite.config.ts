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
    entry: ["./src/server.ts", "./src/client.ts", "./src/env.ts"],
    format: ["esm" as const],
    sourcemap: "hidden",
    minify: command === "build",
    clean: true,
    failOnWarn: "ci-only",
  },
}));
