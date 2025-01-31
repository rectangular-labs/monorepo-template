import { sqliteTableCreator } from "drizzle-orm/sqlite-core";

export const sqliteAppTable = sqliteTableCreator((name) => `ra_${name}`);
