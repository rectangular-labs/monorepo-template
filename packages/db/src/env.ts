import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const dbEnv = (
  runtimeEnv?: Record<string, string | number | boolean | undefined>,
) =>
  createEnv({
    server: {
      DATABASE_URL: type("string"),
    },
    runtimeEnv: runtimeEnv ?? process.env,
    emptyStringAsUndefined: true,
  });
