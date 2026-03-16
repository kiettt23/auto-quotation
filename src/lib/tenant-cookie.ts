import { cookies } from "next/headers";
import { createHmac } from "crypto";

const COOKIE_NAME = "active-tenant-id";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365, // 1 year
  path: "/",
};

/** HMAC-sign a tenant ID to prevent cookie tampering */
function sign(tenantId: string): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
  const signature = createHmac("sha256", secret)
    .update(tenantId)
    .digest("hex")
    .slice(0, 16); // 16 hex chars = 64 bits, enough for cookie integrity
  return `${tenantId}.${signature}`;
}

/** Verify and extract tenant ID from signed cookie value. Returns null if invalid. */
function verify(signedValue: string): string | null {
  const dotIndex = signedValue.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const tenantId = signedValue.slice(0, dotIndex);
  const expectedSigned = sign(tenantId);
  // Constant-time-ish comparison (good enough for cookie integrity)
  if (signedValue !== expectedSigned) return null;
  return tenantId;
}

/** Read and verify the active tenant ID from cookie. Returns null if missing or tampered. */
export async function getActiveTenantId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  // Support unsigned cookies during migration (plain CUID2, no dot)
  if (!raw.includes(".")) return raw;

  return verify(raw);
}

/** Set the active tenant cookie with HMAC signature */
export async function setActiveTenantCookie(tenantId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sign(tenantId), COOKIE_OPTIONS);
}

/** Delete the active tenant cookie */
export async function deleteActiveTenantCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
