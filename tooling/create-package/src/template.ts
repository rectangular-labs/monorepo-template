import { createTemplate } from "bingo";
import type { UserConfig } from "vite-plus";
import z from "zod";

import pkgJson from "../package.json" with { type: "json" };

const ORGANIZATION = "@rectangular-labs";
type VitePackConfig = NonNullable<UserConfig["pack"]>;

function toJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

// this converts camelCase to kebab-case
function toDashCase(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function sanitizeName(name: string) {
  return toDashCase(name.replace(new RegExp(`^${ORGANIZATION}/`), "").trim());
}

function createPublicPackageJson(packageName: string, description: string) {
  return {
    name: `${ORGANIZATION}/${packageName}`,
    description,
    type: "module",
    license: "MIT",
    version: "0.0.1",
    keywords: [""],
    repository: {
      type: "git",
      url: "git+https://github.com/rectangular-labs/vite-plus-monorepo-template.git",
      directory: `packages/${packageName}`,
    },
    homepage: `https://github.com/rectangular-labs/vite-plus-monorepo-template/tree/main/packages/${packageName}#readme`,
    files: ["dist", "!dist/**/*.map", "README.md", "package.json"],
    publishConfig: { access: "public" },
    exports: {},
    scripts: {
      build: "vp pack",
      dev: "vp pack --watch",
      clean: "git clean -xdf node_modules dist .cache",
    },
    devDependencies: {
      "@rectangular-labs/typescript": "workspace:*",
      "@typescript/native-preview": "catalog:",
      publint: "catalog:",
      typescript: "catalog:",
      "vite-plus": "catalog:",
    },
  };
}

function createPrivatePackageJson(packageName: string, description: string) {
  return {
    name: `${ORGANIZATION}/${packageName}`,
    description,
    type: "module",
    private: true,
    version: "0.0.1",
    exports: {},
    scripts: {
      build: "vp pack",
      dev: "vp pack --watch",
      clean: "git clean -xdf node_modules dist .cache",
    },
    devDependencies: {
      "@rectangular-labs/typescript": "workspace:*",
      "@typescript/native-preview": "catalog:",
      typescript: "catalog:",
      "vite-plus": "catalog:",
    },
  };
}

function createTsConfig() {
  return {
    extends: "@rectangular-labs/typescript/tsconfig.base.json",
    compilerOptions: {},
    include: ["src"],
    exclude: ["node_modules"],
  };
}

function createViteConfig(type: "public" | "private") {
  const packConfig: VitePackConfig = {
    dts: {
      tsgo: true,
    },
    exports: {
      enabled: true,
      devExports: true,
    },
    entry: ["./src/index.ts"],
    format: ["esm"],
    sourcemap: "hidden",
    clean: true,
    failOnWarn: "ci-only",
    ...(type === "public" ? { publint: true } : {}),
  };
  const serializedPackConfig = JSON.stringify(packConfig, null, 2)
    .slice(2, -2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

  return `import { defineConfig } from "vite-plus";

export default defineConfig(({ command }) => ({
  pack: {
${serializedPackConfig},
    minify: command === "build",
  },
}));
`;
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
      .describe("Package name (you can skip the @rectangular-labs/ prefix)"),
    description: z.string().trim().describe("package description").default("Internal Package"),
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
    const description = options.description ?? "";
    const packageJson =
      options.type === "public"
        ? createPublicPackageJson(packageName, description)
        : createPrivatePackageJson(packageName, description);

    return {
      files: {
        "package.json": toJson(packageJson),
        "tsconfig.json": toJson(createTsConfig()),
        "vite.config.ts": createViteConfig(options.type),
        src: {
          "index.ts": `export const name = "${packageName}";\n`,
        },
      },
      scripts: [
        {
          commands: ["vp i", "vp run build"],
        },
      ],
    };
  },
});
