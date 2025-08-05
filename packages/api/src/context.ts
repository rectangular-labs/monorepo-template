import { os } from "@orpc/server";
import { createDb, type DB } from "@rectangular-labs/db";
import type { CookieSerializeOptions } from "./types";

/**
 * Initial context type definition for oRPC procedures
 * This defines the required dependencies that must be passed when calling procedures
 */
export interface InitialContext {
  db: DB;
  headers: {
    get: (headerName: string) => string | null;
    set: (headerName: string, headerValue: string) => void;
  };
  cookies: {
    get: (cookieName: string) => string | undefined;
    set: (
      cookieName: string,
      cookieValue: string,
      options?: CookieSerializeOptions,
    ) => void;
  };
}

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
export const base = os.$context<InitialContext>();
