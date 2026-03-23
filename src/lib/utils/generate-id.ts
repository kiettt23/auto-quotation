/** Generate a URL-safe unique ID using crypto.randomUUID */
export function generateId(): string {
  return crypto.randomUUID();
}
