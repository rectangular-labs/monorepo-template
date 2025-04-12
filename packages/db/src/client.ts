import { drizzle as drizzleBetterSqlite } from "drizzle-orm/better-sqlite3";
import * as user from "./schema/user";

const sqliteSchema = {
  ...user,
};

export const createDb = (fileName: string) =>
  drizzleBetterSqlite(fileName, {
    schema: sqliteSchema,
  });
export type DB = ReturnType<typeof createDb>;
