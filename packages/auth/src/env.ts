import { dbEnv } from "@rectangular-labs/db/env";
import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const authEnv = () =>
  createEnv({
    extends: [dbEnv()],
    server: {
      AUTH_PRODUCTION_URL: type("string.url"),
      AUTH_ENCRYPTION_KEY: type("string >= 32"),
      AUTH_DISCORD_ID: type("string|undefined"),
      AUTH_DISCORD_SECRET: type("string|undefined"),
      AUTH_GITHUB_ID: type("string|undefined"),
      AUTH_GITHUB_SECRET: type("string|undefined"),
    },
    clientPrefix: "VITE_",
    client: {
      VITE_APP_URL: type("string.url"),
    },
    runtimeEnv:
      typeof window !== "undefined"
        ? (import.meta as unknown as { env: Record<string, string> }).env
        : process.env,
    emptyStringAsUndefined: true,
  });
