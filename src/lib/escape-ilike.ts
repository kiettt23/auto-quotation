/**
 * Escapes special characters in a string for use in SQL ILIKE patterns.
 * Prevents wildcard injection via %, _ or \ in user-supplied search input.
 */
export function escapeIlike(str: string): string {
  return str.replace(/[\\%_]/g, (c) => "\\" + c);
}
