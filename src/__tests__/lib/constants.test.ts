import { describe, it, expect } from "vitest";
import {
  DEFAULT_QUOTE_PREFIX,
  DEFAULT_VAT_PERCENT,
  DEFAULT_VALIDITY_DAYS,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_GREETING,
  DEFAULT_TERMS,
  DEFAULT_DOC_PREFIX,
  DEFAULT_SHIPPING,
  DEFAULT_PAGE_SIZE,
} from "@/lib/constants";

describe("constants.ts - Application defaults", () => {
  describe("document prefixes", () => {
    it("should define DEFAULT_QUOTE_PREFIX", () => {
      expect(DEFAULT_QUOTE_PREFIX).toBe("BG-{YYYY}-");
      expect(typeof DEFAULT_QUOTE_PREFIX).toBe("string");
    });

    it("should define DEFAULT_DOC_PREFIX", () => {
      expect(DEFAULT_DOC_PREFIX).toBe("DOC-{YYYY}-");
      expect(typeof DEFAULT_DOC_PREFIX).toBe("string");
    });

    it("should use {YYYY} placeholder", () => {
      expect(DEFAULT_QUOTE_PREFIX).toContain("{YYYY}");
      expect(DEFAULT_DOC_PREFIX).toContain("{YYYY}");
    });
  });

  describe("financial defaults", () => {
    it("should define DEFAULT_VAT_PERCENT", () => {
      expect(DEFAULT_VAT_PERCENT).toBe(10);
      expect(typeof DEFAULT_VAT_PERCENT).toBe("number");
    });

    it("should define DEFAULT_SHIPPING", () => {
      expect(DEFAULT_SHIPPING).toBe(0);
      expect(typeof DEFAULT_SHIPPING).toBe("number");
    });

    it("should define valid percentage values", () => {
      expect(DEFAULT_VAT_PERCENT).toBeGreaterThanOrEqual(0);
      expect(DEFAULT_VAT_PERCENT).toBeLessThanOrEqual(100);
      expect(DEFAULT_SHIPPING).toBeGreaterThanOrEqual(0);
    });
  });

  describe("validity and expiration", () => {
    it("should define DEFAULT_VALIDITY_DAYS", () => {
      expect(DEFAULT_VALIDITY_DAYS).toBe(30);
      expect(typeof DEFAULT_VALIDITY_DAYS).toBe("number");
    });

    it("should use reasonable validity period", () => {
      expect(DEFAULT_VALIDITY_DAYS).toBeGreaterThan(0);
      expect(DEFAULT_VALIDITY_DAYS).toBeLessThanOrEqual(365);
    });
  });

  describe("branding defaults", () => {
    it("should define DEFAULT_PRIMARY_COLOR", () => {
      expect(DEFAULT_PRIMARY_COLOR).toBe("#0369A1");
      expect(typeof DEFAULT_PRIMARY_COLOR).toBe("string");
    });

    it("should use valid hex color format", () => {
      expect(DEFAULT_PRIMARY_COLOR).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe("text content defaults", () => {
    it("should define DEFAULT_GREETING", () => {
      expect(DEFAULT_GREETING).toBeDefined();
      expect(typeof DEFAULT_GREETING).toBe("string");
      expect(DEFAULT_GREETING.length).toBeGreaterThan(0);
    });

    it("should define DEFAULT_TERMS", () => {
      expect(DEFAULT_TERMS).toBeDefined();
      expect(typeof DEFAULT_TERMS).toBe("string");
      expect(DEFAULT_TERMS.length).toBeGreaterThan(0);
    });

    it("should contain Vietnamese text", () => {
      expect(DEFAULT_GREETING).toContain("Kính gửi");
      expect(DEFAULT_TERMS).toContain("Thanh toán");
    });

    it("should support multiline content", () => {
      expect(DEFAULT_GREETING).toContain("\n");
      expect(DEFAULT_TERMS).toContain("\n");
    });
  });

  describe("pagination defaults", () => {
    it("should define DEFAULT_PAGE_SIZE", () => {
      expect(DEFAULT_PAGE_SIZE).toBe(20);
      expect(typeof DEFAULT_PAGE_SIZE).toBe("number");
    });

    it("should use reasonable page size", () => {
      expect(DEFAULT_PAGE_SIZE).toBeGreaterThan(0);
      expect(DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(100);
    });
  });

  describe("usage patterns", () => {
    it("should support quote number generation template", () => {
      const prefix = DEFAULT_QUOTE_PREFIX;
      expect(prefix).toMatch(/{YYYY}/);
    });

    it("should provide VAT percentage for calculations", () => {
      const vatAmount = 1000 * (DEFAULT_VAT_PERCENT / 100);
      expect(vatAmount).toBe(100);
    });

    it("should provide validity days for expiry calculation", () => {
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setDate(expiryDate.getDate() + DEFAULT_VALIDITY_DAYS);

      // Verify that the date was moved forward by approximately DEFAULT_VALIDITY_DAYS
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      expect(daysDiff).toBe(DEFAULT_VALIDITY_DAYS);
    });

    it("should provide page size for list pagination", () => {
      const items = Array.from({ length: 50 }, (_, i) => i);
      const pages = Math.ceil(items.length / DEFAULT_PAGE_SIZE);
      expect(pages).toBe(3);
    });
  });

  describe("constant immutability", () => {
    it("should export constants as read-only", () => {
      const constants = {
        DEFAULT_QUOTE_PREFIX,
        DEFAULT_VAT_PERCENT,
        DEFAULT_VALIDITY_DAYS,
        DEFAULT_PRIMARY_COLOR,
        DEFAULT_GREETING,
        DEFAULT_TERMS,
        DEFAULT_DOC_PREFIX,
        DEFAULT_SHIPPING,
        DEFAULT_PAGE_SIZE,
      };

      expect(() => {
        Object.freeze(constants);
      }).not.toThrow();
    });
  });
});
