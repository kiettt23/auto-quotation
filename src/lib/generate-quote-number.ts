/**
 * Generate a quote number in format: BG-2026-0042
 * @param prefix - Template like "BG-{YYYY}-"
 * @param nextNumber - Sequential number
 */
export function generateQuoteNumber(
  prefix: string,
  nextNumber: number
): string {
  const year = new Date().getFullYear();
  const resolvedPrefix = prefix.replace("{YYYY}", year.toString());
  const paddedNumber = nextNumber.toString().padStart(4, "0");
  return `${resolvedPrefix}${paddedNumber}`;
}
