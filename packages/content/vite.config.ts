import pluginBabel from "@rollup/plugin-babel";
import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  return {
    pack: {
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
      platform: "neutral",
      dts: {
        tsgo: true,
      },
      exports: {
        enabled: true,
        devExports: true,
      },
      entry: [
        "./src/config.ts",
        "./src/source.ts",
        "./src/style.css",
        // {
        //   "components/*": "./src/components/*",
        // },
      ],
      format: ["esm"],
      sourcemap: "hidden",
      clean: true,
      failOnWarn: "ci-only",
      minify: isBuild,
    },
  };
});
