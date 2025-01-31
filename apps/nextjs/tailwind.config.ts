import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "@rectangular-labs/ui/tailwind.web.config";

module.exports = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx,mdx}",
  ],
  presets: [baseConfig],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config;
