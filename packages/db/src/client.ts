import { drizzle } from "drizzle-orm/node-postgres";
import * as credential from "./schema/credential";
import * as user from "./schema/user";

export * from "drizzle-orm";
export const schema = {
  ...user,
  ...credential,
};

export const createDb = (connectionString: string) => {
  return drizzle(connectionString, { schema, casing: "snake_case" });
};

export type DB = ReturnType<typeof createDb>;
