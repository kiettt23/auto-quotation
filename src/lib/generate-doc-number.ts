/**
 * Generate a document number from a prefix template and sequential counter.
 * Supports {YYYY} placeholder replaced with current year.
 *
 * @example generateDocNumber("BG-{YYYY}-", 42) => "BG-2026-0042"
 * @example generateDocNumber("DOC-{YYYY}-", 7) => "DOC-2026-0007"
 */
export function generateDocNumber(prefix: string, nextNumber: number): string {
  const year = new Date().getFullYear();
  const resolvedPrefix = prefix.replace("{YYYY}", year.toString());
  const paddedNumber = nextNumber.toString().padStart(4, "0");
  return `${resolvedPrefix}${paddedNumber}`;
}
