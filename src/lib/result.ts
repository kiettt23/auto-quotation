/**
 * Discriminated union Result type for explicit error handling
 * without throwing exceptions in business logic layers.
 */
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/** Wrap a successful value */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Wrap an error */
export function err<E = string>(error: E): Result<never, E> {
  return { ok: false, error };
}

/** Unwrap value or throw */
export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value;
  throw new Error(String(result.error));
}
