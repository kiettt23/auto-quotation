import { describe, it, expect } from "vitest";
import {
  productSchema,
  pricingTierSchema,
  volumeDiscountSchema,
} from "../validations/product-schemas";

describe("Validation sản phẩm (productSchema)", () => {
  const sanPhamHopLe = {
    code: "SW-001",
    name: "Switch Cisco 24 port",
    categoryId: "cat-001",
    unitId: "unit-001",
    pricingType: "FIXED" as const,
    basePrice: 5000000,
  };

  describe("Trường bắt buộc", () => {
    it("chấp nhận sản phẩm có đầy đủ thông tin", () => {
      const ketQua = productSchema.safeParse(sanPhamHopLe);
      expect(ketQua.success).toBe(true);
    });

    it("bắt buộc nhập mã sản phẩm (code)", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, code: "" });
      expect(ketQua.success).toBe(false);
    });

    it("bắt buộc nhập tên sản phẩm (name)", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, name: "" });
      expect(ketQua.success).toBe(false);
    });

    it("bắt buộc chọn danh mục (categoryId)", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, categoryId: "" });
      expect(ketQua.success).toBe(false);
    });

    it("bắt buộc chọn đơn vị tính (unitId)", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, unitId: "" });
      expect(ketQua.success).toBe(false);
    });
  });

  describe("Loại giá (pricingType)", () => {
    it("chấp nhận FIXED (giá cố định)", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, pricingType: "FIXED" });
      expect(ketQua.success).toBe(true);
    });

    it("chấp nhận TIERED (giá theo bậc)", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, pricingType: "TIERED" });
      expect(ketQua.success).toBe(true);
    });

    it("từ chối loại giá không hợp lệ", () => {
      const ketQua = productSchema.safeParse({ ...sanPhamHopLe, pricingType: "HOURLY" });
      expect(ketQua.success).toBe(false);
    });
  });

  describe("Trường tùy chọn", () => {
    it("chấp nhận sản phẩm có mô tả và ghi chú", () => {
      const ketQua = productSchema.safeParse({
        ...sanPhamHopLe,
        description: "Switch 24 port PoE+",
        notes: "Bảo hành 3 năm",
      });
      expect(ketQua.success).toBe(true);
    });

    it("chấp nhận sản phẩm có bậc giá (pricingTiers)", () => {
      const ketQua = productSchema.safeParse({
        ...sanPhamHopLe,
        pricingType: "TIERED",
        pricingTiers: [
          { minQuantity: 1, maxQuantity: 9, price: 5000000 },
          { minQuantity: 10, maxQuantity: null, price: 4500000 },
        ],
      });
      expect(ketQua.success).toBe(true);
    });

    it("chấp nhận sản phẩm có chiết khấu theo số lượng", () => {
      const ketQua = productSchema.safeParse({
        ...sanPhamHopLe,
        volumeDiscounts: [
          { minQuantity: 10, discountPercent: 5 },
          { minQuantity: 50, discountPercent: 10 },
        ],
      });
      expect(ketQua.success).toBe(true);
    });
  });
});

describe("Validation bậc giá (pricingTierSchema)", () => {
  it("chấp nhận bậc giá hợp lệ có giới hạn trên", () => {
    const ketQua = pricingTierSchema.safeParse({
      minQuantity: 1, maxQuantity: 9, price: 5000000,
    });
    expect(ketQua.success).toBe(true);
  });

  it("chấp nhận bậc giá không giới hạn trên (maxQuantity = null)", () => {
    const ketQua = pricingTierSchema.safeParse({
      minQuantity: 50, maxQuantity: null, price: 4000000,
    });
    expect(ketQua.success).toBe(true);
  });

  it("từ chối SL tối thiểu < 1", () => {
    const ketQua = pricingTierSchema.safeParse({
      minQuantity: 0, maxQuantity: 10, price: 5000000,
    });
    expect(ketQua.success).toBe(false);
  });

  it("từ chối giá âm", () => {
    const ketQua = pricingTierSchema.safeParse({
      minQuantity: 1, maxQuantity: 10, price: -1000,
    });
    expect(ketQua.success).toBe(false);
  });
});

describe("Validation chiết khấu theo SL (volumeDiscountSchema)", () => {
  it("chấp nhận CK hợp lệ (5% khi mua từ 10)", () => {
    const ketQua = volumeDiscountSchema.safeParse({
      minQuantity: 10, discountPercent: 5,
    });
    expect(ketQua.success).toBe(true);
  });

  it("từ chối CK > 100%", () => {
    const ketQua = volumeDiscountSchema.safeParse({
      minQuantity: 10, discountPercent: 150,
    });
    expect(ketQua.success).toBe(false);
  });

  it("từ chối CK < 0%", () => {
    const ketQua = volumeDiscountSchema.safeParse({
      minQuantity: 10, discountPercent: -5,
    });
    expect(ketQua.success).toBe(false);
  });
});
