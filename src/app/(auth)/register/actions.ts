"use server";

import { acceptInvite } from "@/services/invite-service";

/** Accept an invite token for a newly registered user. Called after signUp succeeds. */
export async function acceptInviteAction(token: string, userId: string) {
  return acceptInvite(token, userId);
}
