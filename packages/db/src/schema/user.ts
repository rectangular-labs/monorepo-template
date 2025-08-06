import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-arktype";
import { relations } from "drizzle-orm";
import { serial, text } from "drizzle-orm/pg-core";
import { timestamps } from "./_helper";
import { pgAppTable } from "./_table";

export const userTable = pgAppTable(
  "user",
  {
    id: serial("user_id").primaryKey(),
    username: text("username").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    ...timestamps,
  },
  () => {
    return [];
  },
);
export type SelectUser = typeof userTable.$inferSelect;
export type InsertUser = typeof userTable.$inferInsert;

export const insertUserSchema = createInsertSchema(userTable);
export const updateUserSchema = createUpdateSchema(userTable);
export const selectUserSchema = createSelectSchema(userTable);

export const userRelations = relations(userTable, () => {
  return {};
});
