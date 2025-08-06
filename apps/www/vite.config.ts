import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { createJiti } from "jiti";
import mkcert from "vite-plugin-mkcert";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import type { serverEnv } from "~/lib/env";

const jiti = createJiti(import.meta.url);
const env = await jiti.import("./src/lib/env");
// parses all the required env vars (server env is a super set of client env)
(env as { serverEnv: () => ReturnType<typeof serverEnv> }).serverEnv();

const config = defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    mkcert(),
    tanstackStart({
      customViteReactPlugin: true,
    }),
    viteReact(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  server: {
    proxy: {},
    port: 6969,
  },
});

export default config;
