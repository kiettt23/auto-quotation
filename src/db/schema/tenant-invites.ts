import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { tenants } from "./tenants";
import { memberRoleEnum } from "./enums";

// Pending invitations for new members to join a tenant workspace
export const tenantInvites = pgTable("tenant_invites", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: memberRoleEnum("role").default("MEMBER").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tenantInvitesRelations = relations(tenantInvites, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantInvites.tenantId],
    references: [tenants.id],
  }),
}));

export type TenantInvite = typeof tenantInvites.$inferSelect;
export type NewTenantInvite = typeof tenantInvites.$inferInsert;
