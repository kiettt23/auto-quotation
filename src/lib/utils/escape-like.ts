/** Escape special LIKE/ILIKE characters to prevent wildcard injection */
export function escapeLike(value: string): string {
  return value.replace(/%/g, "\\%").replace(/_/g, "\\_");
}
