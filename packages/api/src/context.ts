import { os } from "@orpc/server";
import { createDb } from "@rectangular-labs/db";
import { asyncStorageMiddleware } from "./lib/context-storage";
import { loggerMiddleware } from "./lib/logger";
import type { InitialContext } from "./types";

export const createApiContext = (
  args: Omit<InitialContext, "db"> & { dbUrl: string },
) => {
  return {
    db: createDb(args.dbUrl),
    ...args,
  };
};

/**
 * Base oRPC instance with typed initial context
 * Use this instead of the raw `os` import for type-safe dependency injection
 */
export const base = os
  .$context<InitialContext>()
  .use(loggerMiddleware)
  .use(asyncStorageMiddleware);
