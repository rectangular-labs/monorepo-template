import { dbEnv } from "@rectangular-labs/db/env";
import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const apiEnv = (
  runtimeEnv?: Record<string, string | number | boolean | undefined>,
) =>
  createEnv({
    extends: [dbEnv()],
    server: {
      ENCRYPTION_KEY: type("string >= 32"),
    },
    runtimeEnv: runtimeEnv ?? process.env,
    emptyStringAsUndefined: true,
  });
