import { pgTable, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { category } from "./category";
import { unit } from "./unit";

/** Products/services catalog */
export const product = pgTable("product", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  categoryId: text("category_id").references(() => category.id),
  unitId: text("unit_id").references(() => unit.id),
  /** Price in VND (stored as integer to avoid floating point) */
  unitPrice: integer("unit_price").notNull().default(0),
  specification: text("specification"),
  description: text("description"),
  /** Flexible key-value data for template-specific autofill */
  customData: jsonb("custom_data").$type<Record<string, string | number>>(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
