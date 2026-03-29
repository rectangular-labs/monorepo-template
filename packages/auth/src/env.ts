import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const authEnv = () =>
  createEnv({
    server: {
      AUTH_PRODUCTION_URL: type("string.url"),
      AUTH_ENCRYPTION_KEY: type("string >= 32"),
      AUTH_FROM_EMAIL: type("string.email"),
      AUTH_CREDENTIAL_VERIFICATION_TYPE: type("'code'|'token'|undefined"),
      AUTH_DISCORD_ID: type("string|undefined"),
      AUTH_DISCORD_SECRET: type("string|undefined"),
      AUTH_GITHUB_ID: type("string|undefined"),
      AUTH_GITHUB_SECRET: type("string|undefined"),
      AUTH_REDDIT_ID: type("string|undefined"),
      AUTH_REDDIT_SECRET: type("string|undefined"),
      AUTH_GOOGLE_ID: type("string|undefined"),
      AUTH_GOOGLE_SECRET: type("string|undefined"),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });
