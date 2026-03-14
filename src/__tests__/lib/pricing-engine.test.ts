import { describe, it, expect } from "vitest";
import {
  calculateUnitPrice,
  calculateLineDiscount,
  calculateLineTotal,
  calculateQuoteTotals,
  type PricingProduct,
  type VolumeDiscount,
  type PricingTier,
  type QuoteItemInput,
} from "@/lib/pricing-engine";

describe("pricing-engine.ts - Pricing calculations", () => {
  describe("calculateUnitPrice() - FIXED pricing", () => {
    it("should return base price for fixed pricing type", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000, // 100k VND
        pricingTiers: [],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 1)).toBe(100000);
      expect(calculateUnitPrice(product, 10)).toBe(100000);
      expect(calculateUnitPrice(product, 100)).toBe(100000);
    });

    it("should ignore quantity for fixed pricing", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 50000,
        pricingTiers: [],
        volumeDiscounts: [],
      };

      const prices = [1, 5, 10, 50, 100, 1000].map((qty) =>
        calculateUnitPrice(product, qty)
      );

      expect(new Set(prices).size).toBe(1); // All same price
      expect(prices[0]).toBe(50000);
    });

    it("should handle zero base price", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 0,
        pricingTiers: [],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 1)).toBe(0);
    });

    it("should handle large prices", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 999999999,
        pricingTiers: [],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 1)).toBe(999999999);
    });
  });

  describe("calculateUnitPrice() - TIERED pricing", () => {
    it("should return correct price for each tier", () => {
      const product: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 100000,
        pricingTiers: [
          { minQuantity: 1, maxQuantity: 10, price: 100000 },
          { minQuantity: 11, maxQuantity: 50, price: 90000 },
          { minQuantity: 51, maxQuantity: null, price: 80000 },
        ],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 1)).toBe(100000);
      expect(calculateUnitPrice(product, 10)).toBe(100000);
      expect(calculateUnitPrice(product, 11)).toBe(90000);
      expect(calculateUnitPrice(product, 50)).toBe(90000);
      expect(calculateUnitPrice(product, 51)).toBe(80000);
      expect(calculateUnitPrice(product, 1000)).toBe(80000);
    });

    it("should handle null maxQuantity (unlimited upper bound)", () => {
      const product: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 100000,
        pricingTiers: [
          { minQuantity: 1, maxQuantity: 10, price: 100000 },
          { minQuantity: 11, maxQuantity: null, price: 80000 },
        ],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 11)).toBe(80000);
      expect(calculateUnitPrice(product, 999999)).toBe(80000);
    });

    it("should fallback to last tier price", () => {
      const product: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 100000,
        pricingTiers: [
          { minQuantity: 1, maxQuantity: 10, price: 100000 },
          { minQuantity: 11, maxQuantity: 50, price: 90000 },
        ],
        volumeDiscounts: [],
      };

      // Quantity 100 exceeds all tiers, should return last tier price
      expect(calculateUnitPrice(product, 100)).toBe(90000);
    });

    it("should handle empty tier list", () => {
      const product: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [],
      };

      // Should fallback to base price
      expect(calculateUnitPrice(product, 1)).toBe(100000);
      expect(calculateUnitPrice(product, 100)).toBe(100000);
    });

    it("should sort tiers by minimum quantity", () => {
      const product: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 100000,
        // Deliberately out of order
        pricingTiers: [
          { minQuantity: 51, maxQuantity: null, price: 80000 },
          { minQuantity: 1, maxQuantity: 10, price: 100000 },
          { minQuantity: 11, maxQuantity: 50, price: 90000 },
        ],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 1)).toBe(100000);
      expect(calculateUnitPrice(product, 11)).toBe(90000);
      expect(calculateUnitPrice(product, 51)).toBe(80000);
    });

    it("should handle overlapping tier ranges", () => {
      const product: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 100000,
        pricingTiers: [
          { minQuantity: 1, maxQuantity: 50, price: 100000 },
          { minQuantity: 25, maxQuantity: 75, price: 90000 }, // Overlaps first
        ],
        volumeDiscounts: [],
      };

      // Should use first matching tier
      expect(calculateUnitPrice(product, 25)).toBe(100000);
      expect(calculateUnitPrice(product, 50)).toBe(100000);
      expect(calculateUnitPrice(product, 75)).toBe(90000);
    });
  });

  describe("calculateLineDiscount() - volume discounts", () => {
    it("should return highest applicable discount", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [
          { minQuantity: 10, discountPercent: 5 },
          { minQuantity: 50, discountPercent: 10 },
          { minQuantity: 100, discountPercent: 15 },
        ],
      };

      expect(calculateLineDiscount(product, 1)).toBe(0); // No discount
      expect(calculateLineDiscount(product, 10)).toBe(5);
      expect(calculateLineDiscount(product, 50)).toBe(10);
      expect(calculateLineDiscount(product, 100)).toBe(15);
      expect(calculateLineDiscount(product, 1000)).toBe(15); // Max discount applies
    });

    it("should use manual discount when provided", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [{ minQuantity: 10, discountPercent: 10 }],
      };

      expect(calculateLineDiscount(product, 50, 25)).toBe(25); // Manual overrides
      expect(calculateLineDiscount(product, 10, 0)).toBe(0); // Manual zero
    });

    it("should ignore negative manual discounts", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [{ minQuantity: 10, discountPercent: 10 }],
      };

      // Negative manual discount should use volume discount instead
      expect(calculateLineDiscount(product, 50, -5)).toBe(10);
    });

    it("should handle empty volume discounts", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [],
      };

      expect(calculateLineDiscount(product, 1)).toBe(0);
      expect(calculateLineDiscount(product, 1000)).toBe(0);
    });

    it("should return zero for quantities below minimum", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [
          { minQuantity: 100, discountPercent: 20 },
          { minQuantity: 50, discountPercent: 10 },
        ],
      };

      expect(calculateLineDiscount(product, 1)).toBe(0);
      expect(calculateLineDiscount(product, 49)).toBe(0);
    });

    it("should handle zero discount percent", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 100000,
        pricingTiers: [],
        volumeDiscounts: [{ minQuantity: 10, discountPercent: 0 }],
      };

      expect(calculateLineDiscount(product, 10)).toBe(0);
    });
  });

  describe("calculateLineTotal() - line item calculation", () => {
    it("should calculate basic line total", () => {
      // unitPrice=100k, qty=5, discount=0% => 500k
      expect(calculateLineTotal(100000, 5, 0)).toBe(500000);
    });

    it("should apply discount correctly", () => {
      // unitPrice=100k, qty=10, discount=10% => 100k*10*(1-0.1) = 900k
      expect(calculateLineTotal(100000, 10, 10)).toBe(900000);
    });

    it("should handle 100% discount", () => {
      expect(calculateLineTotal(100000, 10, 100)).toBe(0);
    });

    it("should round results to nearest integer (VND)", () => {
      // Test rounding with fractional result
      // unitPrice=333, qty=3, discount=33.33% => 333*3*(1-0.3333) = 666.67 => 667
      const result = calculateLineTotal(333, 3, 33.33);
      expect(typeof result).toBe("number");
      expect(result).toBe(Math.round(333 * 3 * (1 - 33.33 / 100)));
    });

    it("should handle zero quantity", () => {
      expect(calculateLineTotal(100000, 0, 0)).toBe(0);
      expect(calculateLineTotal(100000, 0, 50)).toBe(0);
    });

    it("should handle zero unit price", () => {
      expect(calculateLineTotal(0, 10, 0)).toBe(0);
      expect(calculateLineTotal(0, 10, 50)).toBe(0);
    });

    it("should handle large quantities", () => {
      const result = calculateLineTotal(100000, 1000000, 0);
      expect(result).toBe(100000000000);
    });

    it("should calculate typical Vietnamese quote scenarios", () => {
      // Scenario: Internet package 500k/month, buy 12 months, 10% corporate discount
      const monthlyPrice = 500000;
      const quantity = 12;
      const discount = 10;

      const total = calculateLineTotal(monthlyPrice, quantity, discount);
      expect(total).toBe(5400000); // 500k*12*0.9 = 5.4M
    });
  });

  describe("calculateQuoteTotals() - complete quote calculation", () => {
    it("should calculate subtotal from line items", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 2, discountPercent: 0 }, // 200k
        { unitPrice: 50000, quantity: 4, discountPercent: 0 }, // 200k
      ];

      const totals = calculateQuoteTotals(items, 0, 0);
      expect(totals.subtotal).toBe(400000);
    });

    it("should apply global discount", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 0 }, // 1M
      ];

      const totals = calculateQuoteTotals(items, 10, 0); // 10% global discount
      expect(totals.subtotal).toBe(1000000);
      expect(totals.discountAmount).toBe(100000);
      expect(totals.afterDiscount).toBe(900000);
    });

    it("should apply VAT correctly", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 0 }, // 1M
      ];

      const totals = calculateQuoteTotals(items, 0, 10); // 10% VAT
      expect(totals.subtotal).toBe(1000000);
      expect(totals.afterDiscount).toBe(1000000);
      expect(totals.vatAmount).toBe(100000);
      expect(totals.total).toBe(1100000);
    });

    it("should add shipping fee", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 0 }, // 1M
      ];

      const totals = calculateQuoteTotals(items, 0, 0, 50000); // 50k shipping
      expect(totals.total).toBe(1050000);
    });

    it("should add other fees", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 0 }, // 1M
      ];

      const totals = calculateQuoteTotals(items, 0, 0, 0, 20000); // 20k other fees
      expect(totals.total).toBe(1020000);
    });

    it("should calculate complex scenario with all components", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 5, discountPercent: 5 }, // 475k
        { unitPrice: 200000, quantity: 3, discountPercent: 0 }, // 600k
      ];

      const totals = calculateQuoteTotals(items, 10, 10, 50000, 30000);

      // Subtotal: 475k + 600k = 1,075k
      expect(totals.subtotal).toBe(1075000);

      // Discount: 1,075k * 10% = 107.5k
      expect(totals.discountAmount).toBe(107500);

      // After discount: 1,075k - 107.5k = 967.5k
      expect(totals.afterDiscount).toBe(967500);

      // VAT: 967.5k * 10% = 96.75k
      expect(totals.vatAmount).toBe(96750);

      // Total: 967.5k + 96.75k + 50k + 30k = 1,144.25k
      expect(totals.total).toBe(1144250);
    });

    it("should handle empty items list", () => {
      const totals = calculateQuoteTotals([], 0, 0);

      expect(totals.subtotal).toBe(0);
      expect(totals.discountAmount).toBe(0);
      expect(totals.afterDiscount).toBe(0);
      expect(totals.vatAmount).toBe(0);
      expect(totals.total).toBe(0);
    });

    it("should handle items with individual discounts", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 5 }, // 950k
        { unitPrice: 100000, quantity: 10, discountPercent: 10 }, // 900k
      ];

      const totals = calculateQuoteTotals(items, 0, 0);
      expect(totals.subtotal).toBe(1850000);
    });

    it("should round all amounts to nearest VND", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 333, quantity: 3, discountPercent: 33.33 },
      ];

      const totals = calculateQuoteTotals(items, 11.11, 12.34);

      // All values should be integers
      expect(Number.isInteger(totals.subtotal)).toBe(true);
      expect(Number.isInteger(totals.discountAmount)).toBe(true);
      expect(Number.isInteger(totals.afterDiscount)).toBe(true);
      expect(Number.isInteger(totals.vatAmount)).toBe(true);
      expect(Number.isInteger(totals.total)).toBe(true);
    });

    it("should return object with all required fields", () => {
      const totals = calculateQuoteTotals([], 0, 0);

      expect(totals).toHaveProperty("subtotal");
      expect(totals).toHaveProperty("discountAmount");
      expect(totals).toHaveProperty("afterDiscount");
      expect(totals).toHaveProperty("vatAmount");
      expect(totals).toHaveProperty("total");
    });

    it("should support Vietnamese corporate discount scenario", () => {
      // FPT Internet package: 500k/month, 24 month contract, 15% corporate discount, 10% VAT
      const items: QuoteItemInput[] = [
        { unitPrice: 500000, quantity: 24, discountPercent: 15 }, // 10.2M
      ];

      const totals = calculateQuoteTotals(items, 0, 10);

      expect(totals.subtotal).toBe(10200000);
      expect(totals.afterDiscount).toBe(10200000);
      expect(totals.vatAmount).toBe(1020000);
      expect(totals.total).toBe(11220000);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle zero prices gracefully", () => {
      const product: PricingProduct = {
        pricingType: "FIXED",
        basePrice: 0,
        pricingTiers: [],
        volumeDiscounts: [],
      };

      expect(calculateUnitPrice(product, 1)).toBe(0);
      expect(() => calculateLineTotal(0, 0, 0)).not.toThrow();
    });

    it("should handle zero discounts", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 0 },
      ];

      const totals = calculateQuoteTotals(items, 0, 0);
      expect(totals.discountAmount).toBe(0);
      expect(totals.vatAmount).toBe(0);
    });

    it("should handle maximum discount", () => {
      const items: QuoteItemInput[] = [
        { unitPrice: 100000, quantity: 10, discountPercent: 100 },
      ];

      const totals = calculateQuoteTotals(items, 100, 0);
      expect(totals.total).toBe(0);
    });
  });
});
