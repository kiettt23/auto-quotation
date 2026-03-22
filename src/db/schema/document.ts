import { pgTable, text, timestamp, jsonb, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { company } from "./company";
import { customer } from "./customer";

/** @deprecated Kept for backward compat. Use templateId instead. */
export const documentTypeEnum = ["QUOTATION", "DELIVERY_ORDER"] as const;
export type DocumentType = (typeof documentTypeEnum)[number];

/** All business documents (quotes, PXK, PGH) stored in one table */
export const document = pgTable("document", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  companyId: text("company_id").notNull().references(() => company.id),
  customerId: text("customer_id").references(() => customer.id),
  /** @deprecated Use templateId instead */
  type: text("type", { enum: documentTypeEnum }).notNull(),
  /** References template registry ID: "quotation", "delivery-order" */
  templateId: text("template_id"),
  documentNumber: text("document_number").notNull(),
  /**
   * All form data stored as JSONB:
   * { customerName, customerAddress, receiverName, receiverPhone,
   *   items: [{ productName, unit, quantity, unitPrice, amount }],
   *   notes, validityDays, paymentTerms, ... }
   */
  data: jsonb("data").notNull().default({}),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique("uq_document_number").on(t.companyId, t.documentNumber),
]);
