import { defineConfig } from "vite-plus";

const cacheEnv = ["DOTENV_PRIVATE_KEY", "DOTENV_PRIVATE_KEY_PRODUCTION"];
const untrackedEnv = ["NODE_ENV", "npm_lifecycle_event"];
const envFiles = ["**/.env", "**/.env.*"];
const buildInputs = [{ auto: true }, ...envFiles, "!**/.cache/tsbuildinfo.json", "!**/dist/**"];

const ignorePatterns = ["**/*.hbs", "**/*.gen.ts", "**/worker-configuration.d.ts"];

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  run: {
    enablePrePostScripts: true,
    cache: {
      tasks: true,
      scripts: false,
    },
    tasks: {
      install: {
        command: "vp i",
      },
      fmt: {
        command: "vp fmt",
      },
      build: {
        command: "vp run -r build",
        env: cacheEnv,
        untrackedEnv,
        input: buildInputs,
      },
      "build:preview": {
        command: "vp run -r build:preview",
        dependsOn: ["build"],
        env: cacheEnv,
        untrackedEnv,
        input: buildInputs,
      },
      "build:production": {
        command: "vp run -r build:production",
        dependsOn: ["build"],
        env: cacheEnv,
        untrackedEnv,
        input: buildInputs,
      },
    },
  },
  lint: {
    ignorePatterns,
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
  fmt: {
    ignorePatterns,
    sortTailwindcss: {
      stylesheet: "./packages/ui/src/styles.css",
      functions: ["clsx", "cn", "cva", "tw"],
      preserveDuplicates: false,
      preserveWhitespace: false,
    },
    sortPackageJson: true,
  },
});
