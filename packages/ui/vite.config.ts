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
        neverBundle: ["react", "react-dom", /^react\//],
      },
      dts: {
        tsgo: true,
      },
      exports: {
        enabled: true,
        devExports: true,
      },
      entry: [
        "./src/animation/*",
        "./src/hooks/*",
        "./src/utils/index.ts",
        {
          "background/*": "./src/components/background/*",
          "core/*": "./src/components/core/*",
          "components/*": "./src/components/ui/*",
          "components/icons": "./src/components/icon.tsx",
          "components/theme": "./src/components/theme-provider.tsx",
        },
      ],
      format: ["esm" as const],
      sourcemap: "hidden",
      minify: isBuild,
      clean: true,
      failOnWarn: "ci-only",
    },
  };
});
