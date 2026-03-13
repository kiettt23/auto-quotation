import { pgTable, text, integer, json, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { documents } from "./documents";
import { fileTypeEnum } from "./enums";

// Document templates — Excel or PDF based fill-in-the-blank templates
export const documentTemplates = pgTable(
  "doc_templates",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    // "excel" | "pdf"
    fileType: fileTypeEnum("file_type").default("excel").notNull(),
    // Original file stored as base64 text
    fileBase64: text("file_base64").notNull(),
    // Excel: sheet name to use; PDF: unused
    sheetName: text("sheet_name").default("").notNull(),
    // Excel: [{ cellRef, label, type }]; PDF: [{ id, label, x, y, width, height, fontSize, type }]
    placeholders: json("placeholders").default([]).notNull(),
    // Excel only: repeating row region { startRow, columns }
    tableRegion: json("table_region"),
    // Auto-numbering
    docPrefix: text("doc_prefix").default("DOC-{YYYY}-").notNull(),
    docNextNumber: integer("doc_next_number").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => [index("doc_templates_tenant_idx").on(t.tenantId)]
);

export const documentTemplatesRelations = relations(documentTemplates, ({ one, many }) => ({
  tenant: one(tenants, { fields: [documentTemplates.tenantId], references: [tenants.id] }),
  documents: many(documents),
}));

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type NewDocumentTemplate = typeof documentTemplates.$inferInsert;
