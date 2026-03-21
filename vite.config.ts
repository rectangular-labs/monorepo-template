import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    options: { typeAware: true, typeCheck: true },
    plugins: ["oxc", "typescript", "unicorn", "react", "promise", "vitest", "import"],
    rules: {
      "no-dupe-else-if": "error",
      "no-empty": "error",
      "no-restricted-globals": "error",
      "react/exhaustive-deps": "error",
      "react/rules-of-hooks": "error",
      "typescript/array-type": "error",
      "typescript/consistent-type-exports": "error",
      "typescript/no-floating-promises": "error",
      "typescript/no-misused-promises": "error",
      "typescript/no-namespace": "error",
      "typescript/prefer-for-of": "error",
      "typescript/require-await": "error",
      "unicorn/no-new-buffer": "error",
    },
  },
  fmt: {},
});
