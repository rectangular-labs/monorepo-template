import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as user from "./schema/user";

const schema = {
  ...user,
};

export const createDb = (connectionString: string) => {
  const client = postgres(connectionString);
  return drizzle(client, { schema, casing: "snake_case" });
};

export type DB = ReturnType<typeof createDb>;
