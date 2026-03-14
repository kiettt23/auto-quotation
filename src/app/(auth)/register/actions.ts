"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { acceptInvite } from "@/services/invite-service";

/** Accept an invite token for the currently authenticated user. */
export async function acceptInviteAction(token: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthenticated");
  return acceptInvite(token, session.user.id);
}
