import { requireSession } from "./get-session";

/** Get current authenticated user ID — use in server actions that require auth */
export async function requireUserId(): Promise<string> {
  const session = await requireSession();
  return session.user.id;
}
