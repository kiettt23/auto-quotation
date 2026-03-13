import { pgEnum } from "drizzle-orm/pg-core";

// Pricing strategy for products
export const pricingTypeEnum = pgEnum("pricing_type", ["FIXED", "TIERED"]);

// Quote lifecycle status
export const quoteStatusEnum = pgEnum("quote_status", [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]);

// Tenant member roles
export const memberRoleEnum = pgEnum("member_role", [
  "OWNER",
  "ADMIN",
  "MEMBER",
  "VIEWER",
]);

// Document template file type
export const fileTypeEnum = pgEnum("file_type_enum", ["excel", "pdf"]);
