import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Customer/client records */
export const customer = pgTable("customer", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  taxCode: text("tax_code"),
  /** Default delivery info — auto-fill when creating documents */
  deliveryAddress: text("delivery_address"),
  /** Delivery contact name (e.g. "Nguyễn Văn A") */
  deliveryName: text("delivery_name"),
  receiverName: text("receiver_name"),
  receiverPhone: text("receiver_phone"),
  /** Flexible key-value data for template-specific autofill */
  customData: jsonb("custom_data").$type<Record<string, string | number>>(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
