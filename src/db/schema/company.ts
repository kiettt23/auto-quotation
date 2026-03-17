import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/** Company info — 1:1 with user (owner) */
export const company = pgTable("company", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  taxCode: text("tax_code"),
  email: text("email"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  ownerId: text("owner_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
