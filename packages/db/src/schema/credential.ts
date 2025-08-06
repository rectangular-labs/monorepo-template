import { relations } from "drizzle-orm";
import {
  bigint,
  integer,
  serial,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { timestamps } from "./_helper";
import { pgAppTable } from "./_table";
import { userTable } from "./user";

export const credentialTable = pgAppTable(
  "credential",
  {
    id: serial("id").primaryKey(),
    credentialId: text().notNull(),
    userId: integer()
      .notNull()
      .references(() => userTable.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    publicKey: text().notNull(),
    counter: bigint({ mode: "number" }).notNull(),
    ...timestamps,
  },
  (table) => {
    return [
      uniqueIndex("credential_id_unique_idx").on(table.credentialId),
      uniqueIndex("credential_user_id_idx").on(table.userId),
    ];
  },
);

export const credentialRelations = relations(credentialTable, ({ one }) => ({
  user: one(userTable, {
    fields: [credentialTable.userId],
    references: [userTable.id],
  }),
}));

export type SelectCredential = typeof credentialTable.$inferSelect;
export type InsertCredential = typeof credentialTable.$inferInsert;
