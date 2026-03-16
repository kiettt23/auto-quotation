import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";

// Tenant-scoped customer records
export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    company: text("company").default("").notNull(),
    phone: text("phone").default("").notNull(),
    email: text("email").default("").notNull(),
    address: text("address").default("").notNull(),
    notes: text("notes").default("").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [index("customers_tenant_idx").on(t.tenantId)]
);

export const customersRelations = relations(customers, ({ one }) => ({
  tenant: one(tenants, { fields: [customers.tenantId], references: [tenants.id] }),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
