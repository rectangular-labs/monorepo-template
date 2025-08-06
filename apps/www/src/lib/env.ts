import { apiEnv } from "@rectangular-labs/api/env";
import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const clientEnv = () =>
  createEnv({
    extends: [],
    clientPrefix: "VITE_",
    client: {
      VITE_APP_URL: type("string"),
    },
    runtimeEnv: import.meta.env,
    emptyStringAsUndefined: true,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });

export const serverEnv = () =>
  createEnv({
    extends: [clientEnv(), apiEnv()],
    server: {},
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
