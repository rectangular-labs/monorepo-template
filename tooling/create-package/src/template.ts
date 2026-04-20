import { createTemplate } from "bingo";
import type { UserConfig } from "vite-plus";
import z from "zod";

import pkgJson from "../package.json" with { type: "json" };

const ORGANIZATION = "@rectangular-labs";
type VitePackConfig = NonNullable<UserConfig["pack"]>;
type PackageFramework = "none" | "react";
type PackageJson = Record<string, unknown>;
type PackageJsonTransform = (basePackageJson: PackageJson) => PackageJson;

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

function toCamelCase(value: string) {
  return value.replace(/-([a-z0-9])/g, (_, char: string) => char.toUpperCase());
}

function withReactPackageJson(basePackageJson: PackageJson) {
  return {
    ...basePackageJson,
    devDependencies: {
      ...(basePackageJson.devDependencies as Record<string, string>),
      "@rollup/plugin-babel": "catalog:",
      "@types/react": "catalog:",
      "@types/react-dom": "catalog:",
      "babel-plugin-react-compiler": "catalog:",
      react: "catalog:",
      "react-dom": "catalog:",
    },
    peerDependencies: {
      "@rectangular-labs/ui": "workspace:*",
      react: "catalog:",
      "react-dom": "catalog:",
    },
  };
}

function withEnvPackageJson(basePackageJson: PackageJson) {
  return {
    ...basePackageJson,
    dependencies: {
      ...(basePackageJson.dependencies as Record<string, string> | undefined),
      "@t3-oss/env-core": "catalog:",
      arktype: "catalog:",
    },
  };
}

function createPublicPackageJson(
  packageName: string,
  description: string,
  transforms: PackageJsonTransform[] = [],
) {
  const packageJson = {
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
  return transforms.reduce<PackageJson>(
    (currentPackageJson, transform) => transform(currentPackageJson),
    packageJson,
  );
}

function createPrivatePackageJson(
  packageName: string,
  description: string,
  transforms: PackageJsonTransform[] = [],
) {
  const packageJson = {
    name: `${ORGANIZATION}/${packageName}`,
    description,
    type: "module",
    private: true,
    version: "0.0.1",
    exports: {},
    publishConfig: {},
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
  return transforms.reduce<PackageJson>(
    (currentPackageJson, transform) => transform(currentPackageJson),
    packageJson,
  );
}

function createTsConfig(framework: PackageFramework) {
  return {
    extends: "@rectangular-labs/typescript/tsconfig.base.json",
    compilerOptions:
      framework === "react" ? { jsx: "react-jsx", lib: ["ES2024", "DOM", "DOM.Iterable"] } : {},
    include: ["src"],
  };
}

function createViteConfig(
  type: "public" | "private",
  framework: PackageFramework,
  hasEnv: boolean,
) {
  const packConfig: VitePackConfig = {
    ...(framework === "react"
      ? {
          platform: "neutral" as const,
        }
      : {}),
    dts: {
      tsgo: true,
    },
    exports: {
      enabled: true,
      devExports: true,
    },
    entry: [
      "./src/index.ts",
      ...(hasEnv ? ["./src/env.ts"] : []),
      ...(framework === "react" ? [{ "components/*": "./src/components/*" }] : []),
    ],
    format: ["esm"],
    sourcemap: "hidden",
    clean: true,
    failOnWarn: "ci-only",
    ...(type === "public" ? { publint: true } : {}),
  };
  const serializedPackConfig = JSON.stringify(packConfig, null, 2)
    .slice(2, -2)
    .split("\n")
    .map((line) => `    ${line}`)
    .join("\n");

  return `import { defineConfig } from "vite-plus";
${framework === "react" ? 'import pluginBabel from "@rollup/plugin-babel";' : ""}

export default defineConfig(({ command }) => {
  const isBuild = command === "build";
  return {
    pack: {
      ${
        // We have this here because we can't have the pluginBabel or it will get evaluated
        framework === "react"
          ? `plugins: [
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
            neverBundle: ["react", "react-dom", /^react\\//, /^@rectangular-labs\\/ui/],
          },`
          : ""
      }
${serializedPackConfig},
      minify: isBuild,
    },
  };
});
`;
}

function createSourceFile(packageName: string, framework: PackageFramework, hasEnv: boolean) {
  const packageEnvName = `${toCamelCase(packageName)}Env`;

  return {
    "index.ts": `export const name = "${packageName}";\n`,
    ...(hasEnv && {
      "env.ts": `import { createEnv } from "@t3-oss/env-core";

export const ${packageEnvName} = () =>
  createEnv({
    server: { },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });`,
    }),
    ...(framework === "react" && {
      components: {
        "index.tsx": `export function Example() {
  return <div>Hello World</div>;
}`,
      },
    }),
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
      .describe("Package name (you can skip the @rectangular-labs/ prefix)"),
    description: z.string().trim().describe("package description").default("Internal Package"),
    framework: z
      .union([z.literal("none"), z.literal("react")])
      .describe("package framework")
      .default("none"),
    env: z.boolean().describe("whether the package includes env support").default(false),
    type: z.union([z.literal("private"), z.literal("public")]).describe("package publication type"),
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
    const packageJsonTransforms = [
      ...(options.framework === "react" ? [withReactPackageJson] : []),
      ...(options.env ? [withEnvPackageJson] : []),
    ];
    const sourceFile = createSourceFile(packageName, options.framework, options.env);
    const packageJson =
      options.type === "public"
        ? createPublicPackageJson(packageName, description, packageJsonTransforms)
        : createPrivatePackageJson(packageName, description, packageJsonTransforms);

    return {
      files: {
        "package.json": toJson(packageJson),
        "tsconfig.json": toJson(createTsConfig(options.framework)),
        "vite.config.ts": createViteConfig(options.type, options.framework, options.env),
        src: {
          ...sourceFile,
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
