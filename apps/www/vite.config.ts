import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import tsConfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { http2 } from "./vite-http2-plugin";

export default defineConfig({
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    // needed for now to let tanstack start work with mkcert for https on localhost
    http2(),
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
    port: 6969,
  },
});
