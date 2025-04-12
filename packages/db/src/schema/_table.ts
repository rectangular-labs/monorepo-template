import { pgTableCreator } from "drizzle-orm/pg-core";

export const pgAppTable = pgTableCreator((name) => `ra_${name}`);
