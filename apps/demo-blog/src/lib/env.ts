import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

const shouldSkipValidation = !!process.env.CI || process.env.npm_lifecycle_event === "lint";

export const clientEnv = () =>
  createEnv({
    extends: [],
    clientPrefix: "VITE_",
    client: {
      VITE_APP_URL: type("string.url"),
      VITE_BLOG_URL: type("string.url"),
    },
    runtimeEnv: import.meta.env,
    emptyStringAsUndefined: true,
    skipValidation: shouldSkipValidation,
  });

export const serverEnv = () =>
  createEnv({
    extends: [clientEnv()],
    server: {},
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    skipValidation: shouldSkipValidation,
  });
