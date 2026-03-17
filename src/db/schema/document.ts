import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { company } from "./company";
import { customer } from "./customer";

/**
 * Document types:
 * - QUOTATION: Báo giá (BG)
 * - WAREHOUSE_EXPORT: Phiếu xuất kho (PXK)
 * - DELIVERY_ORDER: Phiếu giao hàng (PGH)
 */
export const documentTypeEnum = ["QUOTATION", "WAREHOUSE_EXPORT", "DELIVERY_ORDER"] as const;
export type DocumentType = (typeof documentTypeEnum)[number];

export const documentStatusEnum = ["DRAFT", "FINAL"] as const;
export type DocumentStatus = (typeof documentStatusEnum)[number];

/** All business documents (quotes, PXK, PGH) stored in one table */
export const document = pgTable("document", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => company.id),
  customerId: text("customer_id").references(() => customer.id),
  type: text("type", { enum: documentTypeEnum }).notNull(),
  status: text("status", { enum: documentStatusEnum }).notNull().default("DRAFT"),
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
});
