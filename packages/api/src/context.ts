import { ORPCError, os } from "@orpc/server";
import { initAuthHandler } from "@rectangular-labs/auth";
import { createDb } from "@rectangular-labs/db";
import { apiEnv } from "./env";
import { authMiddleware } from "./lib/auth";
import { asyncStorageMiddleware } from "./lib/context-storage";
import { loggerMiddleware } from "./lib/logger";
import type { InitialContext } from "./types";

export const createApiContext = (args: Omit<InitialContext, "db" | "auth">) => {
  const env = apiEnv();
  const db = createDb();

  return {
    db,
    auth: initAuthHandler({
      baseURL: args.url.origin,
      credentialVerificationType: args.credentialVerificationType,
      db,
      encryptionKey: env.AUTH_ENCRYPTION_KEY,
      fromEmail: env.AUTH_FROM_EMAIL,
      discordClientId: env.AUTH_DISCORD_ID,
      discordClientSecret: env.AUTH_DISCORD_SECRET,
      githubClientId: env.AUTH_GITHUB_ID,
      githubClientSecret: env.AUTH_GITHUB_SECRET,
      googleClientId: env.AUTH_GOOGLE_ID,
      googleClientSecret: env.AUTH_GOOGLE_SECRET,
      redditClientId: env.AUTH_REDDIT_ID,
      redditClientSecret: env.AUTH_REDDIT_SECRET,
    }),
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
  const { session, user } = context;
  if (!session || !user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next();
});
