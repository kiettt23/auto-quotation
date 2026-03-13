import { z } from "zod";

// Shared Zod helpers used across validation schemas

/** Non-empty trimmed string */
export const requiredString = z.string().trim().min(1, "Required");

/** Optional string that defaults to empty string */
export const optionalString = z.string().trim().default("");

/** Positive integer */
export const positiveInt = z.number().int().positive();

/** Non-negative integer */
export const nonNegativeInt = z.number().int().min(0);

/** Non-negative numeric value (for prices in VND) */
export const nonNegativeNumeric = z.number().min(0);

/** Percentage 0–100 with up to 2 decimal places */
export const percentSchema = z
  .number()
  .min(0, "Must be at least 0")
  .max(100, "Must be at most 100");

/** Pagination query params */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

/** Generic ID param */
export const idParamSchema = z.object({
  id: requiredString,
});
