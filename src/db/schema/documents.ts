import { pgTable, text, json, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { documentTemplates } from "./document-templates";

// Documents (entries) created from templates
export const documents = pgTable(
  "doc_entries",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    templateId: text("template_id")
      .notNull()
      .references(() => documentTemplates.id, { onDelete: "cascade" }),
    docNumber: text("doc_number").notNull(),
    // Key-value map of placeholder data: { placeholderCellRef: value }
    fieldData: json("field_data").default({}).notNull(),
    // Array of table row data: [{ colLetter: value }]
    tableRows: json("table_rows").default([]).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => [
    index("doc_entries_template_idx").on(t.templateId),
    index("doc_entries_doc_number_idx").on(t.docNumber),
    uniqueIndex("doc_entries_template_number_uniq").on(t.templateId, t.docNumber),
  ]
);

export const documentsRelations = relations(documents, ({ one }) => ({
  template: one(documentTemplates, {
    fields: [documents.templateId],
    references: [documentTemplates.id],
  }),
}));

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
