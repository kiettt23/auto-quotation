import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Units of measurement (cái, cây, kg, m, ...) */
export const unit = pgTable("unit", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
