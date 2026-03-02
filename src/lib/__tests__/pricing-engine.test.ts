import { describe, it, expect } from "vitest";
import {
  calculateUnitPrice,
  calculateLineDiscount,
  calculateLineTotal,
  calculateQuoteTotals,
  type PricingProduct,
} from "../pricing-engine";

// ─── Dữ liệu mẫu ──────────────────────────────────────

const sanPhamGiaCoDinh: PricingProduct = {
  pricingType: "FIXED",
  basePrice: 500000,
  pricingTiers: [],
  volumeDiscounts: [
    { minQuantity: 10, discountPercent: 5 },
    { minQuantity: 50, discountPercent: 10 },
  ],
};

const sanPhamGiaTheoBac: PricingProduct = {
  pricingType: "TIERED",
  basePrice: 1000000,
  pricingTiers: [
    { minQuantity: 1, maxQuantity: 9, price: 1000000 },
    { minQuantity: 10, maxQuantity: 49, price: 900000 },
    { minQuantity: 50, maxQuantity: null, price: 800000 },
  ],
  volumeDiscounts: [],
};

// ─── Tính đơn giá ──────────────────────────────────────

describe("Tính đơn giá (calculateUnitPrice)", () => {
  describe("Sản phẩm giá cố định (FIXED)", () => {
    it("luôn trả về giá gốc dù số lượng thay đổi", () => {
      expect(calculateUnitPrice(sanPhamGiaCoDinh, 1)).toBe(500000);
      expect(calculateUnitPrice(sanPhamGiaCoDinh, 100)).toBe(500000);
    });
  });

  describe("Sản phẩm giá theo bậc (TIERED)", () => {
    it("trả đúng giá bậc 1 khi SL 1-9", () => {
      expect(calculateUnitPrice(sanPhamGiaTheoBac, 1)).toBe(1000000);
      expect(calculateUnitPrice(sanPhamGiaTheoBac, 9)).toBe(1000000);
    });

    it("trả đúng giá bậc 2 khi SL 10-49", () => {
      expect(calculateUnitPrice(sanPhamGiaTheoBac, 10)).toBe(900000);
      expect(calculateUnitPrice(sanPhamGiaTheoBac, 49)).toBe(900000);
    });

    it("trả đúng giá bậc 3 khi SL >= 50 (không giới hạn trên)", () => {
      expect(calculateUnitPrice(sanPhamGiaTheoBac, 50)).toBe(800000);
      expect(calculateUnitPrice(sanPhamGiaTheoBac, 1000)).toBe(800000);
    });

    it("trả giá gốc khi không có bậc nào được cấu hình", () => {
      const khongCoBac: PricingProduct = {
        pricingType: "TIERED",
        basePrice: 500000,
        pricingTiers: [],
        volumeDiscounts: [],
      };
      expect(calculateUnitPrice(khongCoBac, 5)).toBe(500000);
    });
  });
});

// ─── Chiết khấu dòng ───────────────────────────────────

describe("Chiết khấu theo số lượng (calculateLineDiscount)", () => {
  it("trả 0% khi SL chưa đạt ngưỡng chiết khấu", () => {
    expect(calculateLineDiscount(sanPhamGiaCoDinh, 5)).toBe(0);
  });

  it("áp dụng chiết khấu cao nhất phù hợp với SL", () => {
    // SL 10 → 5%, SL 50 → 10%
    expect(calculateLineDiscount(sanPhamGiaCoDinh, 10)).toBe(5);
    expect(calculateLineDiscount(sanPhamGiaCoDinh, 50)).toBe(10);
  });

  it("ưu tiên chiết khấu thủ công khi được nhập tay", () => {
    expect(calculateLineDiscount(sanPhamGiaCoDinh, 50, 15)).toBe(15);
  });

  it("cho phép nhập CK thủ công = 0% (không áp tự động)", () => {
    expect(calculateLineDiscount(sanPhamGiaCoDinh, 50, 0)).toBe(0);
  });
});

// ─── Thành tiền dòng ────────────────────────────────────

describe("Tính thành tiền mỗi dòng (calculateLineTotal)", () => {
  it("thành tiền = đơn giá × số lượng khi CK = 0%", () => {
    expect(calculateLineTotal(500000, 10, 0)).toBe(5000000);
  });

  it("trừ chiết khấu đúng tỷ lệ", () => {
    // 500.000 × 10 × (1 - 10%) = 4.500.000
    expect(calculateLineTotal(500000, 10, 10)).toBe(4500000);
  });

  it("trả 0 khi số lượng = 0", () => {
    expect(calculateLineTotal(500000, 0, 0)).toBe(0);
  });

  it("trả 0 khi CK = 100% (miễn phí)", () => {
    expect(calculateLineTotal(500000, 10, 100)).toBe(0);
  });

  it("làm tròn số nguyên khi kết quả lẻ", () => {
    // 333.333 × 3 × 0.93 = 929.999,07 → làm tròn 929999
    expect(calculateLineTotal(333333, 3, 7)).toBe(Math.round(333333 * 3 * 0.93));
  });
});

// ─── Tổng cộng báo giá ─────────────────────────────────

describe("Tính tổng cộng báo giá (calculateQuoteTotals)", () => {
  const danhSachSanPham = [
    { unitPrice: 500000, quantity: 10, discountPercent: 0 },  // 5.000.000
    { unitPrice: 300000, quantity: 5, discountPercent: 10 },   // 1.350.000
  ];
  // Tạm tính = 6.350.000

  it("tính đúng tạm tính (subtotal) = tổng thành tiền các dòng", () => {
    const ketQua = calculateQuoteTotals(danhSachSanPham);
    expect(ketQua.subtotal).toBe(5000000 + 1350000);
  });

  it("áp dụng chiết khấu tổng đơn (global discount)", () => {
    const ketQua = calculateQuoteTotals(danhSachSanPham, 5);
    expect(ketQua.discountAmount).toBe(Math.round(6350000 * 0.05));
    expect(ketQua.afterDiscount).toBe(6350000 - ketQua.discountAmount);
  });

  it("tính VAT trên số tiền sau CK", () => {
    const ketQua = calculateQuoteTotals(danhSachSanPham, 0, 10);
    expect(ketQua.vatAmount).toBe(Math.round(6350000 * 0.1));
  });

  it("cộng phí vận chuyển + phí khác vào tổng cộng", () => {
    const ketQua = calculateQuoteTotals(danhSachSanPham, 0, 0, 50000, 20000);
    expect(ketQua.total).toBe(6350000 + 50000 + 20000);
  });

  it("trả tất cả = 0 khi không có sản phẩm nào", () => {
    const ketQua = calculateQuoteTotals([]);
    expect(ketQua).toEqual({
      subtotal: 0,
      discountAmount: 0,
      afterDiscount: 0,
      vatAmount: 0,
      total: 0,
    });
  });

  it("tính đúng khi áp dụng đầy đủ: CK tổng + VAT + phí ship + phí khác", () => {
    // Tạm tính = 6.350.000
    // CK 5% = 317.500 → Sau CK = 6.032.500
    // VAT 10% = 603.250
    // Ship = 100.000, Phí khác = 50.000
    // Tổng = 6.032.500 + 603.250 + 100.000 + 50.000 = 6.785.750
    const ketQua = calculateQuoteTotals(danhSachSanPham, 5, 10, 100000, 50000);
    expect(ketQua.subtotal).toBe(6350000);
    expect(ketQua.discountAmount).toBe(317500);
    expect(ketQua.afterDiscount).toBe(6032500);
    expect(ketQua.vatAmount).toBe(603250);
    expect(ketQua.total).toBe(6785750);
  });
});
