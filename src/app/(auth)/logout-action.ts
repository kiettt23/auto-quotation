"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Clear the active tenant cookie and redirect to sign-in.
 * Call this server action alongside Better Auth's client signOut.
 */
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("active-tenant-id");
  redirect("/sign-in");
}
