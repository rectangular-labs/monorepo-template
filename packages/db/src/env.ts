import { createEnv } from "@t3-oss/env-core";
import { type } from "arktype";

export const dbEnv = () =>
  createEnv({
    server: {
      DATABASE_URL: type("string"),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });
