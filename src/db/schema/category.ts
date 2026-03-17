import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { company } from "./company";

/** Product categories */
export const category = pgTable("category", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => company.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
