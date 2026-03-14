import { pgTable, text, numeric, integer, boolean, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { customers } from "./customers";
import { products } from "./products";
import { quoteStatusEnum } from "./enums";

// Quotes table
export const quotes = pgTable(
  "quotes",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    quoteNumber: text("quote_number").notNull(),
    customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
    // Denormalized customer snapshot at time of quote creation
    customerName: text("customer_name").default("").notNull(),
    customerCompany: text("customer_company").default("").notNull(),
    customerPhone: text("customer_phone").default("").notNull(),
    customerEmail: text("customer_email").default("").notNull(),
    customerAddress: text("customer_address").default("").notNull(),
    // Status
    status: quoteStatusEnum("status").default("DRAFT").notNull(),
    validUntil: timestamp("valid_until"),
    // Pricing
    globalDiscountPercent: numeric("global_discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
    vatPercent: numeric("vat_percent", { precision: 5, scale: 2 }).default("10").notNull(),
    shippingFee: numeric("shipping_fee", { precision: 15, scale: 0 }).default("0").notNull(),
    otherFees: numeric("other_fees", { precision: 15, scale: 0 }).default("0").notNull(),
    otherFeesLabel: text("other_fees_label").default("").notNull(),
    // Content
    notes: text("notes").default("").notNull(),
    terms: text("terms").default("").notNull(),
    // Sharing
    shareToken: text("share_token").unique(),
    shareTokenExpiresAt: timestamp("share_token_expires_at"),
    // Stored computed totals for fast reads
    subtotal: numeric("subtotal", { precision: 15, scale: 0 }).default("0").notNull(),
    discountAmount: numeric("discount_amount", { precision: 15, scale: 0 }).default("0").notNull(),
    vatAmount: numeric("vat_amount", { precision: 15, scale: 0 }).default("0").notNull(),
    total: numeric("total", { precision: 15, scale: 0 }).default("0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => [
    index("quotes_tenant_idx").on(t.tenantId),
    index("quotes_customer_idx").on(t.customerId),
    index("quotes_status_idx").on(t.status),
    index("quotes_share_token_idx").on(t.shareToken),
    uniqueIndex("quotes_tenant_number_uniq").on(t.tenantId, t.quoteNumber),
  ]
);

// Line items within a quote
export const quoteItems = pgTable(
  "quote_items",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    quoteId: text("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    // Denormalized item details
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    unit: text("unit").default("").notNull(),
    // Pricing
    quantity: integer("quantity").default(1).notNull(),
    unitPrice: numeric("unit_price", { precision: 15, scale: 0 }).default("0").notNull(),
    discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0").notNull(),
    lineTotal: numeric("line_total", { precision: 15, scale: 0 }).default("0").notNull(),
    isCustomItem: boolean("is_custom_item").default(false).notNull(),
  },
  (t) => [
    index("quote_items_quote_idx").on(t.quoteId),
    index("quote_items_product_idx").on(t.productId),
  ]
);

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  tenant: one(tenants, { fields: [quotes.tenantId], references: [tenants.id] }),
  customer: one(customers, { fields: [quotes.customerId], references: [customers.id] }),
  items: many(quoteItems),
}));

export const quoteItemsRelations = relations(quoteItems, ({ one }) => ({
  quote: one(quotes, { fields: [quoteItems.quoteId], references: [quotes.id] }),
  product: one(products, { fields: [quoteItems.productId], references: [products.id] }),
}));

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
