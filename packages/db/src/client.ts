import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "./schema/auth-schema";

export * from "drizzle-orm";

const schema = {
  ...authSchema,
};

export const createDb = (connectionString: string) => {
  return drizzle(connectionString, {
    schema,
    casing: "snake_case",
    logger: true,
  });
};

export type DB = ReturnType<typeof createDb>;
