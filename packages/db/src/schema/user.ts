import { relations } from "drizzle-orm";
import { integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sqliteAppTable } from "./_table";

export const userTable = sqliteAppTable(
  "user",
  {
    id: integer("user_id").primaryKey({ autoIncrement: true }),
    username: text(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$onUpdateFn(() => new Date()),
    deletedAt: integer("deleted_at", { mode: "timestamp" }),
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
