import { pgTable, text, boolean, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tenantMembers } from "./tenant-members";
import { categories } from "./categories";
import { units } from "./units";
import { products } from "./products";
import { customers } from "./customers";
import { quotes } from "./quotes";
import { documentTemplates } from "./document-templates";

// Tenants table — merges old Settings singleton; each tenant is a company workspace
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  // Branding
  logoUrl: text("logo_url").default("").notNull(),
  primaryColor: text("primary_color").default("#0369A1").notNull(),
  // Company info
  companyName: text("company_name").default("").notNull(),
  address: text("address").default("").notNull(),
  phone: text("phone").default("").notNull(),
  email: text("email").default("").notNull(),
  taxCode: text("tax_code").default("").notNull(),
  website: text("website").default("").notNull(),
  // Bank info
  bankName: text("bank_name").default("").notNull(),
  bankAccount: text("bank_account").default("").notNull(),
  bankOwner: text("bank_owner").default("").notNull(),
  // Quote content defaults
  greetingText: text("greeting_text").default("").notNull(),
  defaultTerms: text("default_terms").default("").notNull(),
  // Display options
  showAmountInWords: boolean("show_amount_in_words").default(true).notNull(),
  showBankInfo: boolean("show_bank_info").default(true).notNull(),
  showSignatureBlocks: boolean("show_signature_blocks").default(true).notNull(),
  showFooterNote: boolean("show_footer_note").default(false).notNull(),
  footerNote: text("footer_note").default("").notNull(),
  // Quote numbering & defaults
  quotePrefix: text("quote_prefix").default("BG-{YYYY}-").notNull(),
  quoteNextNumber: integer("quote_next_number").default(1).notNull(),
  defaultVatPercent: numeric("default_vat_percent", { precision: 5, scale: 2 }).default("10").notNull(),
  defaultValidityDays: integer("default_validity_days").default(30).notNull(),
  defaultShipping: numeric("default_shipping", { precision: 15, scale: 0 }).default("0").notNull(),
  // Onboarding
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const tenantsRelations = relations(tenants, ({ many }) => ({
  members: many(tenantMembers),
  categories: many(categories),
  units: many(units),
  products: many(products),
  customers: many(customers),
  quotes: many(quotes),
  documentTemplates: many(documentTemplates),
}));

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
