import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import { defineConfig } from "vite-plus";

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
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
    port: 6969,
  },
});

export default config;
