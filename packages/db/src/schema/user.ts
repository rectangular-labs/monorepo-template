import { relations } from "drizzle-orm";
import { serial, text, uniqueIndex } from "drizzle-orm/pg-core";
import { timestamps } from "./_helper";
import { pgAppTable } from "./_table";

export const userTable = pgAppTable(
  "user",
  {
    id: serial("user_id").primaryKey(),
    username: text("username"),
    firstName: text("first_name"),
    lastName: text("last_name"),
    ...timestamps,
  },
  (table) => {
    return [uniqueIndex("user_username_unique_idx").on(table.username)];
  },
);
export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export const userRelations = relations(userTable, () => {
  return {};
});
