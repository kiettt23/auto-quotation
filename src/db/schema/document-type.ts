import { pgTable, text, timestamp, jsonb, boolean, integer, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

/** Configurable document types with custom column templates per user */
export const documentType = pgTable("document_type", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  /** Internal key e.g. "QUOTATION", "WAREHOUSE_EXPORT", or user-defined */
  key: text("key").notNull(),
  /** Display name e.g. "Báo giá" */
  label: text("label").notNull(),
  /** Short prefix for document numbers e.g. "BG" */
  shortLabel: text("short_label").notNull(),
  /** Column definitions as JSON array of ColumnDef */
  columns: jsonb("columns").notNull().default([]),
  /** Whether to show total row in PDF/form */
  showTotal: boolean("show_total").notNull().default(true),
  /** Signature block labels, e.g. ["Bên mua", "Bên bán"] or ["Thủ kho", "Tài xế", "Người nhận"] */
  signatureLabels: jsonb("signature_labels").notNull().default(["Bên mua", "Bên bán"]),
  /** PDF template ID — references template-registry. null = "default" */
  templateId: text("template_id"),
  /** Display order in type selector */
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  unique("uq_document_type_user_key").on(t.userId, t.key),
]);
