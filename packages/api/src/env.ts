import { authEnv } from "@rectangular-labs/auth/env";
import { dbEnv } from "@rectangular-labs/db/env";
import { createEnv } from "@t3-oss/env-core";

export const apiEnv = () =>
  createEnv({
    extends: [dbEnv(), authEnv()],
    server: {},
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  });
