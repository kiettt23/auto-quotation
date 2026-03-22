import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Company info — many per user */
export const company = pgTable("company", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  taxCode: text("tax_code"),
  email: text("email"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  /** Company logo as data URL (base64) or external URL */
  logoUrl: text("logo_url"),
  /** Header layout: "left" (logo left, info right) or "center" (centered) */
  headerLayout: text("header_layout").default("left"),
  /** Owner user ID */
  userId: text("user_id").notNull().references(() => user.id),
  /** Default driver name for delivery documents */
  driverName: text("driver_name"),
  /** Default vehicle ID for delivery documents */
  vehicleId: text("vehicle_id"),
  /** Flexible key-value data for template-specific autofill */
  customData: jsonb("custom_data").$type<Record<string, string | number>>(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
