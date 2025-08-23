import { ORPCError, os } from "@orpc/server";
import { initAuthHandler } from "@rectangular-labs/auth";
import { createDb } from "@rectangular-labs/db";
import { authMiddleware } from "./lib/auth";
import { asyncStorageMiddleware } from "./lib/context-storage";
import { loggerMiddleware } from "./lib/logger";
import type { InitialContext } from "./types";

export const createApiContext = (
  args: Omit<InitialContext, "db" | "auth"> & { dbUrl: string },
) => {
  return {
    db: createDb(args.dbUrl),
    auth: initAuthHandler(),
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
  .use(asyncStorageMiddleware)
  .use(authMiddleware);

export const protectedBase = base.use(({ context, next }) => {
  const session = context.session;
  if (!session) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next();
});
