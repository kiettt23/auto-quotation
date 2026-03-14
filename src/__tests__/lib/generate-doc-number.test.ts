import { describe, it, expect, beforeEach, vi } from "vitest";
import { generateDocNumber } from "@/lib/generate-doc-number";

describe("generate-doc-number.ts - Document number generation", () => {
  beforeEach(() => {
    // Mock Date.prototype.getFullYear to control year in tests
    vi.setSystemTime(new Date("2026-03-14"));
  });

  describe("year placeholder substitution", () => {
    it("should replace {YYYY} with current year", () => {
      const result = generateDocNumber("BG-{YYYY}-", 1);
      expect(result).toContain("2026");
      expect(result).not.toContain("{YYYY}");
    });

    it("should handle different prefixes with year", () => {
      const result = generateDocNumber("DOC-{YYYY}-", 5);
      expect(result).toContain("2026");
      expect(result.startsWith("DOC-2026-")).toBe(true);
    });

    it("should replace only first {YYYY} placeholder", () => {
      const result = generateDocNumber("PO-{YYYY}-{YYYY}-", 42);
      expect(result).toContain("2026");
      // Only first {YYYY} is replaced, second remains
      expect(result).toBe("PO-2026-{YYYY}-0042");
    });

    it("should handle prefix without {YYYY}", () => {
      const result = generateDocNumber("QUOTE-", 1);
      expect(result).toBe("QUOTE-0001");
    });

    it("should handle empty prefix", () => {
      const result = generateDocNumber("", 1);
      expect(result).toBe("0001");
    });
  });

  describe("number padding", () => {
    it("should pad single digit numbers with zeros", () => {
      expect(generateDocNumber("BG-{YYYY}-", 1)).toContain("0001");
      expect(generateDocNumber("BG-{YYYY}-", 5)).toContain("0005");
    });

    it("should pad two digit numbers", () => {
      expect(generateDocNumber("BG-{YYYY}-", 10)).toContain("0010");
      expect(generateDocNumber("BG-{YYYY}-", 99)).toContain("0099");
    });

    it("should pad three digit numbers", () => {
      expect(generateDocNumber("BG-{YYYY}-", 100)).toContain("0100");
      expect(generateDocNumber("BG-{YYYY}-", 999)).toContain("0999");
    });

    it("should not pad four digit numbers", () => {
      expect(generateDocNumber("BG-{YYYY}-", 1000)).toContain("1000");
      expect(generateDocNumber("BG-{YYYY}-", 9999)).toContain("9999");
    });

    it("should handle large numbers without truncation", () => {
      const result = generateDocNumber("BG-{YYYY}-", 12345);
      expect(result).toContain("12345");
    });

    it("should handle zero", () => {
      const result = generateDocNumber("BG-{YYYY}-", 0);
      expect(result).toContain("0000");
    });
  });

  describe("format correctness", () => {
    it("should generate BG quote number format", () => {
      const result = generateDocNumber("BG-{YYYY}-", 42);
      expect(result).toBe("BG-2026-0042");
    });

    it("should generate DOC document number format", () => {
      const result = generateDocNumber("DOC-{YYYY}-", 7);
      expect(result).toBe("DOC-2026-0007");
    });

    it("should generate PO purchase order format", () => {
      const result = generateDocNumber("PO-{YYYY}-", 123);
      expect(result).toBe("PO-2026-0123");
    });

    it("should handle custom prefixes", () => {
      const result = generateDocNumber("INV-{YYYY}-", 999);
      expect(result).toBe("INV-2026-0999");
    });
  });

  describe("sequential numbering", () => {
    it("should increment numbers correctly", () => {
      const prefix = "BG-{YYYY}-";
      const numbers = [1, 2, 3, 10, 42, 100, 999].map((n) =>
        generateDocNumber(prefix, n)
      );

      expect(numbers[0]).toBe("BG-2026-0001");
      expect(numbers[1]).toBe("BG-2026-0002");
      expect(numbers[2]).toBe("BG-2026-0003");
      expect(numbers[4]).toBe("BG-2026-0042");
      expect(numbers[6]).toBe("BG-2026-0999");
    });

    it("should maintain consistent formatting across sequence", () => {
      const prefix = "DOC-{YYYY}-";
      const seq1 = generateDocNumber(prefix, 1);
      const seq2 = generateDocNumber(prefix, 2);

      // Both should have same format structure
      expect(seq1.match(/DOC-\d{4}-\d{4}/)).toBeTruthy();
      expect(seq2.match(/DOC-\d{4}-\d{4}$/)).toBeTruthy();
    });
  });

  describe("edge cases", () => {
    it("should handle prefix with special characters", () => {
      const result = generateDocNumber("BG/QT-{YYYY}-", 1);
      expect(result).toBe("BG/QT-2026-0001");
    });

    it("should handle prefix with spaces", () => {
      const result = generateDocNumber("BG {YYYY} ", 1);
      expect(result).toBe("BG 2026 0001");
    });

    it("should handle very long prefixes", () => {
      const longPrefix = "VERY_LONG_PREFIX_{YYYY}_";
      const result = generateDocNumber(longPrefix, 1);
      expect(result).toContain("VERY_LONG_PREFIX_2026_");
      expect(result).toContain("0001");
    });

    it("should return string type", () => {
      const result = generateDocNumber("BG-{YYYY}-", 1);
      expect(typeof result).toBe("string");
    });

    it("should always return non-empty string", () => {
      const cases = [
        ["BG-{YYYY}-", 1],
        ["", 0],
        ["X", 999999],
      ];

      cases.forEach(([prefix, num]) => {
        const result = generateDocNumber(prefix as string, num as number);
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe("year-based separation", () => {
    it("should allow easy filtering by year", () => {
      const docNum = generateDocNumber("BG-{YYYY}-", 42);
      const year = docNum.match(/BG-(\d{4})-/)?.[1];
      expect(year).toBe("2026");
    });

    it("should support multi-year tracking", () => {
      vi.setSystemTime(new Date("2025-01-01"));
      const doc2025 = generateDocNumber("BG-{YYYY}-", 1);

      vi.setSystemTime(new Date("2026-12-31"));
      const doc2026 = generateDocNumber("BG-{YYYY}-", 1);

      expect(doc2025).toContain("2025");
      expect(doc2026).toContain("2026");
      expect(doc2025).not.toEqual(doc2026);
    });
  });

  describe("Vietnamese use cases", () => {
    it("should support BG (Báo Giá) quote numbering", () => {
      const quoteNum = generateDocNumber("BG-{YYYY}-", 10);
      expect(quoteNum).toBe("BG-2026-0010");
      expect(quoteNum.startsWith("BG-")).toBe(true);
    });

    it("should support DOC document numbering", () => {
      const docNum = generateDocNumber("DOC-{YYYY}-", 5);
      expect(docNum).toBe("DOC-2026-0005");
    });

    it("should work for monthly tracking", () => {
      // Example: BG-01-{YYYY}- for January quotes
      const monthlyPrefix = "BG-01-{YYYY}-";
      const quoteNum = generateDocNumber(monthlyPrefix, 42);
      expect(quoteNum).toBe("BG-01-2026-0042");
    });
  });
});
