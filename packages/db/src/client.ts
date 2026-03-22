import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import * as authSchema from "./schema/auth-schema";

export * from "drizzle-orm";

const schema = {
  ...authSchema,
};

type DbInstance = NodePgDatabase<typeof schema> & { $client: Pool };

export const createDb = (connectionString: string): DbInstance => {
  return drizzle(connectionString, {
    schema,
    casing: "snake_case",
    logger: true,
  });
};

export type DB = ReturnType<typeof createDb>;
