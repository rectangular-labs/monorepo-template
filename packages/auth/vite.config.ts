import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  return {
    pack: {
      platform: "neutral",
      // refer to https://github.com/rolldown/tsdown/blob/main/skills/tsdown/references/recipe-react.md#react-compiler for full details
      plugins: [
        pluginBabel({
          babelHelpers: "bundled",
          parserOpts: {
            sourceType: "module",
            plugins: ["jsx", "typescript"],
          },
          plugins: ["babel-plugin-react-compiler"],
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        }),
      ],
      deps: {
        neverBundle: ["react", "react-dom", /^react\//, /^@rectangular-labs\/ui/],
      },
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
        "./src/adapter/*",
        "./src/components/core/*",
        "./src/components/field-groups/*",
        "./src/components/forms/*",
        "./src/components/social-providers.tsx",
        "./src/components/use-auth-flow.ts",
      ],
      format: ["esm" as const],
      sourcemap: "hidden",
      minify: isBuild,
      clean: true,
      failOnWarn: "ci-only",
    },
  };
});
