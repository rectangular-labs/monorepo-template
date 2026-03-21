import { createTemplate } from "bingo";
import z from "zod";

import pkgJson from "../package.json" with { type: "json" };

const scope = "@rectangular-labs";

function toJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sanitizeName(name: string) {
  return name.replace(new RegExp(`^${scope}/`), "").trim();
}

function toDashCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function createPublicPackageJson(packageName: string, directoryName: string, description: string) {
  return {
    name: `${scope}/${packageName}`,
    version: "0.0.1",
    type: "module",
    publishConfig: { access: "public" },
    description,
    keywords: ["rectangular-labs"],
    repository: {
      type: "git",
      url: "git+https://github.com/ElasticBottle/rectangular-labs.git",
      directory: `packages/${directoryName}`,
    },
    license: "MIT",
    homepage: `https://github.com/ElasticBottle/rectangular-labs/tree/main/packages/${directoryName}#readme`,
    files: ["dist", "!dist/**/*.map", "README.md"],
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    scripts: {
      build: "tsup",
      dev: "tsup --watch",
      clean: "git clean -xdf .turbo node_modules dist .cache",
    },
    devDependencies: {
      "@rectangular-labs/typescript": "workspace:*",
      tsup: "^8.4.0",
      typescript: "catalog:",
    },
  };
}

function createPrivatePackageJson(packageName: string, description: string) {
  return {
    name: `${scope}/${packageName}`,
    private: true,
    version: "0.0.1",
    type: "module",
    description,
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        default: "./src/index.ts",
      },
    },
    scripts: {
      build: "tsc",
      dev: "tsc --watch",
      clean: "git clean -xdf .turbo node_modules dist .cache",
    },
    devDependencies: {
      "@rectangular-labs/typescript": "workspace:*",
      typescript: "^5.9.2",
    },
  };
}

export default createTemplate({
  about: {
    name: pkgJson.name,
    description: pkgJson.description,
  },

  options: {
    name: z
      .string()
      .trim()
      .min(1, "Package name is required")
      .describe("package name (you can skip the @rectangular-labs/ prefix)"),
    description: z.string().trim().optional().describe("optional package description"),
    type: z.union([z.literal("public"), z.literal("private")]).describe("package type"),
  },
  prepare: (args) => {
    return {
      // @ts-expect-error - this is from vite +
      name: args.options.directory,
    };
  },
  produce({ options }) {
    const packageName = sanitizeName(options.name);
    const directoryName = toDashCase(packageName);
    const description = options.description ?? "";
    const packageJson =
      options.type === "public"
        ? createPublicPackageJson(packageName, directoryName, description)
        : createPrivatePackageJson(packageName, description);

    return {
      files: {
        "package.json": toJson(packageJson),
        "tsconfig.json": toJson({
          extends: "@rectangular-labs/typescript/tsconfig.internal-package.json",
          compilerOptions: {
            rootDir: "src",
          },
          include: ["src"],
          exclude: ["node_modules"],
        }),
        src: {
          "index.ts": `export const name = "${packageName}";\n`,
        },
        ...(options.type === "public"
          ? {
              "tsup.config.ts": `import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const isWatch = options.watch;
  return {
    ...options,
    entry: ["src/index.ts"],
    format: ["esm" as const],
    splitting: true,
    sourcemap: !isWatch,
    minify: !isWatch,
    clean: !isWatch,
    onSuccess: "tsc",
  };
});
`,
            }
          : {}),
      },
      scripts: [
        {
          commands: [],
        },
      ],
    };
  },
});
