import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";

/** Get current authenticated session (server-side only, cached per request) */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
});

/** Get current session or throw — use in server actions that require auth */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
