import { pgTable, text, numeric, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { categories } from "./categories";
import { units } from "./units";
import { pricingTypeEnum } from "./enums";

// Products table
export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description").default("").notNull(),
    notes: text("notes").default("").notNull(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    unitId: text("unit_id").references(() => units.id, { onDelete: "set null" }),
    basePrice: numeric("base_price", { precision: 15, scale: 0 }).default("0").notNull(),
    pricingType: pricingTypeEnum("pricing_type").default("FIXED").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
    deletedAt: timestamp("deleted_at"),
  },
  (t) => [
    index("products_tenant_idx").on(t.tenantId),
    uniqueIndex("products_tenant_code_uniq").on(t.tenantId, t.code),
    index("products_category_idx").on(t.categoryId),
  ]
);

// Pricing tiers for TIERED pricing type
export const pricingTiers = pgTable(
  "pricing_tiers",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    minQuantity: numeric("min_quantity", { precision: 15, scale: 0 }).notNull(),
    maxQuantity: numeric("max_quantity", { precision: 15, scale: 0 }),
    price: numeric("price", { precision: 15, scale: 0 }).notNull(),
  },
  (t) => [index("pricing_tiers_product_idx").on(t.productId)]
);

// Volume discounts applied based on quantity thresholds
export const volumeDiscounts = pgTable(
  "volume_discounts",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    minQuantity: numeric("min_quantity", { precision: 15, scale: 0 }).notNull(),
    discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).notNull(),
  },
  (t) => [index("volume_discounts_product_idx").on(t.productId)]
);

export const productsRelations = relations(products, ({ one, many }) => ({
  tenant: one(tenants, { fields: [products.tenantId], references: [tenants.id] }),
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  unit: one(units, { fields: [products.unitId], references: [units.id] }),
  pricingTiers: many(pricingTiers),
  volumeDiscounts: many(volumeDiscounts),
}));

export const pricingTiersRelations = relations(pricingTiers, ({ one }) => ({
  product: one(products, { fields: [pricingTiers.productId], references: [products.id] }),
}));

export const volumeDiscountsRelations = relations(volumeDiscounts, ({ one }) => ({
  product: one(products, { fields: [volumeDiscounts.productId], references: [products.id] }),
}));

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type PricingTier = typeof pricingTiers.$inferSelect;
export type VolumeDiscount = typeof volumeDiscounts.$inferSelect;
