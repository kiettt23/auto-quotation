/**
 * Format number to VND string with dot separators.
 * Example: 5500000 → "5.500.000"
 */
export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Parse VND formatted string back to number.
 * Example: "5.500.000" → 5500000
 */
export function parseCurrency(value: string): number {
  return parseInt(value.replace(/\./g, ""), 10) || 0;
}
