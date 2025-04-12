import { drizzle } from "drizzle-orm/node-postgres";
import * as user from "./schema/user";

const schema = {
  ...user,
};

export const createDb = (connectionString: string) => {
  return drizzle(connectionString, { schema, casing: "snake_case" });
};

export type DB = ReturnType<typeof createDb>;
