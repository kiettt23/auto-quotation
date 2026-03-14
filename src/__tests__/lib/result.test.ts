import { describe, it, expect } from "vitest";
import { ok, err, unwrap } from "@/lib/result";

describe("result.ts - Result type helpers", () => {
  describe("ok()", () => {
    it("should wrap a successful value", () => {
      const result = ok(42);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(42);
    });

    it("should wrap string values", () => {
      const result = ok("success");
      expect(result.ok).toBe(true);
      expect(result.value).toBe("success");
    });

    it("should wrap object values", () => {
      const obj = { id: 1, name: "test" };
      const result = ok(obj);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(obj);
    });

    it("should wrap array values", () => {
      const arr = [1, 2, 3];
      const result = ok(arr);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(arr);
    });

    it("should wrap null values", () => {
      const result = ok(null);
      expect(result.ok).toBe(true);
      expect(result.value).toBe(null);
    });
  });

  describe("err()", () => {
    it("should wrap an error message", () => {
      const result = err("Something went wrong");
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Something went wrong");
    });

    it("should wrap error objects", () => {
      const error = new Error("Test error");
      const result = err(error);
      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });

    it("should support generic error types", () => {
      const errorCode = { code: "INVALID_INPUT", message: "Input is invalid" };
      const result = err(errorCode);
      expect(result.ok).toBe(false);
      expect(result.error).toBe(errorCode);
    });
  });

  describe("unwrap()", () => {
    it("should return the value from ok result", () => {
      const result = ok(42);
      expect(unwrap(result)).toBe(42);
    });

    it("should return complex objects from ok result", () => {
      const obj = { id: 1, data: "test" };
      const result = ok(obj);
      expect(unwrap(result)).toBe(obj);
    });

    it("should throw error from err result", () => {
      const result = err("Something failed");
      expect(() => unwrap(result)).toThrow("Something failed");
    });

    it("should throw Error with stringified error", () => {
      const result = err({ code: "CUSTOM_ERROR" });
      expect(() => unwrap(result)).toThrow();
    });

    it("should preserve null values", () => {
      const result = ok(null);
      expect(unwrap(result)).toBe(null);
    });
  });

  describe("type safety", () => {
    it("should create discriminated union for pattern matching", () => {
      const result: ReturnType<typeof ok<number>> = ok(42);

      if (result.ok) {
        expect(result.value).toBe(42);
      } else {
        expect.fail("Should not reach error branch");
      }
    });

    it("should distinguish error branch", () => {
      const result: ReturnType<typeof err<string>> = err("failed");

      if (!result.ok) {
        expect(result.error).toBe("failed");
      } else {
        expect.fail("Should not reach success branch");
      }
    });
  });
});
