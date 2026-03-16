"use server";

import { redirect } from "next/navigation";
import { deleteActiveTenantCookie } from "@/lib/tenant-cookie";

/**
 * Clear the active tenant cookie and redirect to sign-in.
 * Call this server action alongside Better Auth's client signOut.
 */
export async function logoutAction() {
  await deleteActiveTenantCookie();
  redirect("/sign-in");
}
