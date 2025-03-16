import { resolve } from "node:path";
import build from "@hono/vite-build/node";
import devServer from "@hono/vite-dev-server";
import nodeAdapter from "@hono/vite-dev-server/node";
import mkcert from "vite-plugin-mkcert";
import { defineConfig } from "vitest/config";

const entry = "./src/routes/index.ts";
export default defineConfig({
  environments: {
    ssr: {
      keepProcessEnv: true,
    },
  },
  plugins: [
    mkcert(),
    devServer({
      entry,
      adapter: nodeAdapter,
    }),
    build({
      entry,
      port: 3922,
    }),
  ],
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
