import { db } from "@/db";
import { tenantInvites, tenantMembers } from "@/db/schema";
import { eq, and, gt, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { ok, err } from "@/lib/result";
import type { Result } from "@/lib/result";
import type { TenantInvite } from "@/db/schema";

const INVITE_EXPIRY_DAYS = 7;

/** Create a new invite — returns the invite URL token */
export async function createInvite(
  tenantId: string,
  email: string,
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER"
): Promise<Result<{ token: string; inviteUrl: string }>> {
  try {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    await db.insert(tenantInvites).values({ tenantId, email, role, token, expiresAt });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return ok({ token, inviteUrl: `${baseUrl}/register?invite=${token}` });
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tạo lời mời");
  }
}

/** Accept an invite — creates tenant_member record and marks invite as accepted */
export async function acceptInvite(
  token: string,
  userId: string
): Promise<Result<void>> {
  try {
    const invite = await db.query.tenantInvites.findFirst({
      where: and(
        eq(tenantInvites.token, token),
        isNull(tenantInvites.acceptedAt),
        gt(tenantInvites.expiresAt, new Date())
      ),
    });

    if (!invite) {
      return err("Lời mời không hợp lệ hoặc đã hết hạn");
    }

    // Add member to tenant
    await db.insert(tenantMembers).values({
      tenantId: invite.tenantId,
      userId,
      role: invite.role,
    }).onConflictDoNothing();

    // Mark invite as accepted
    await db.update(tenantInvites)
      .set({ acceptedAt: new Date() })
      .where(eq(tenantInvites.id, invite.id));

    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi chấp nhận lời mời");
  }
}

/** List pending (not yet accepted, not expired) invites for a tenant */
export async function getInvites(tenantId: string): Promise<Result<TenantInvite[]>> {
  try {
    const invites = await db.query.tenantInvites.findMany({
      where: and(
        eq(tenantInvites.tenantId, tenantId),
        isNull(tenantInvites.acceptedAt),
        gt(tenantInvites.expiresAt, new Date())
      ),
    });
    return ok(invites);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi tải danh sách lời mời");
  }
}

/** Revoke (delete) an invite */
export async function revokeInvite(
  tenantId: string,
  inviteId: string
): Promise<Result<void>> {
  try {
    await db.delete(tenantInvites).where(
      and(eq(tenantInvites.id, inviteId), eq(tenantInvites.tenantId, tenantId))
    );
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Lỗi thu hồi lời mời");
  }
}
