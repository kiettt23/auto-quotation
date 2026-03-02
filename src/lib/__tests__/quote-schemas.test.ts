import { describe, it, expect } from "vitest";
import { quoteFormSchema, quoteItemSchema } from "../validations/quote-schemas";

describe("Validation sản phẩm trong báo giá (quoteItemSchema)", () => {
  const dongSanPhamHopLe = {
    productId: "prod-001",
    name: "Switch Cisco 24 port",
    description: "",
    unit: "Cái",
    quantity: 5,
    unitPrice: 5000000,
    discountPercent: 0,
    isCustomItem: false,
    sortOrder: 0,
  };

  it("chấp nhận dòng sản phẩm hợp lệ", () => {
    const ketQua = quoteItemSchema.safeParse(dongSanPhamHopLe);
    expect(ketQua.success).toBe(true);
  });

  it("bắt buộc nhập tên sản phẩm", () => {
    const ketQua = quoteItemSchema.safeParse({ ...dongSanPhamHopLe, name: "" });
    expect(ketQua.success).toBe(false);
  });

  it("số lượng phải >= 1", () => {
    const ketQua = quoteItemSchema.safeParse({ ...dongSanPhamHopLe, quantity: 0 });
    expect(ketQua.success).toBe(false);
  });

  it("đơn giá phải >= 0", () => {
    const ketQua = quoteItemSchema.safeParse({ ...dongSanPhamHopLe, unitPrice: -1000 });
    expect(ketQua.success).toBe(false);
  });

  it("chiết khấu dòng phải trong khoảng 0-100%", () => {
    expect(quoteItemSchema.safeParse({ ...dongSanPhamHopLe, discountPercent: -1 }).success).toBe(false);
    expect(quoteItemSchema.safeParse({ ...dongSanPhamHopLe, discountPercent: 101 }).success).toBe(false);
  });

  it("cho phép sản phẩm tự nhập (isCustomItem = true, productId = null)", () => {
    const sanPhamTuNhap = {
      ...dongSanPhamHopLe,
      productId: null,
      isCustomItem: true,
      name: "Dịch vụ lắp đặt",
    };
    const ketQua = quoteItemSchema.safeParse(sanPhamTuNhap);
    expect(ketQua.success).toBe(true);
  });
});

describe("Validation form báo giá (quoteFormSchema)", () => {
  const baoGiaHopLe = {
    customerId: "cust-001",
    customerName: "Nguyễn Văn A",
    customerCompany: "Công ty ABC",
    customerPhone: "0901234567",
    customerEmail: "abc@example.com",
    customerAddress: "123 Nguyễn Huệ",
    items: [
      {
        productId: "prod-001",
        name: "Switch Cisco",
        description: "",
        unit: "Cái",
        quantity: 5,
        unitPrice: 5000000,
        discountPercent: 0,
        isCustomItem: false,
        sortOrder: 0,
      },
    ],
    globalDiscountPercent: 0,
    vatPercent: 10,
    shippingFee: 0,
    otherFees: 0,
    otherFeesLabel: "",
    notes: "",
    terms: "Thanh toán 100% trước giao hàng",
    validUntil: "2026-04-01",
  };

  it("chấp nhận báo giá đầy đủ thông tin", () => {
    const ketQua = quoteFormSchema.safeParse(baoGiaHopLe);
    expect(ketQua.success).toBe(true);
  });

  it("bắt buộc có ít nhất 1 sản phẩm", () => {
    const ketQua = quoteFormSchema.safeParse({ ...baoGiaHopLe, items: [] });
    expect(ketQua.success).toBe(false);
  });

  it("chiết khấu tổng đơn phải 0-100%", () => {
    expect(
      quoteFormSchema.safeParse({ ...baoGiaHopLe, globalDiscountPercent: -1 }).success
    ).toBe(false);
    expect(
      quoteFormSchema.safeParse({ ...baoGiaHopLe, globalDiscountPercent: 101 }).success
    ).toBe(false);
  });

  it("VAT phải 0-100%", () => {
    expect(
      quoteFormSchema.safeParse({ ...baoGiaHopLe, vatPercent: -1 }).success
    ).toBe(false);
    expect(
      quoteFormSchema.safeParse({ ...baoGiaHopLe, vatPercent: 101 }).success
    ).toBe(false);
  });

  it("phí vận chuyển phải >= 0", () => {
    const ketQua = quoteFormSchema.safeParse({ ...baoGiaHopLe, shippingFee: -1000 });
    expect(ketQua.success).toBe(false);
  });

  it("cho phép báo giá không chọn khách hàng (customerId = null)", () => {
    const ketQua = quoteFormSchema.safeParse({
      ...baoGiaHopLe,
      customerId: null,
      customerName: "Khách vãng lai",
    });
    expect(ketQua.success).toBe(true);
  });

  it("chấp nhận nhiều sản phẩm trong 1 báo giá", () => {
    const ketQua = quoteFormSchema.safeParse({
      ...baoGiaHopLe,
      items: [
        ...baoGiaHopLe.items,
        {
          productId: null,
          name: "Dịch vụ lắp đặt",
          description: "Lắp đặt tại công trình",
          unit: "Gói",
          quantity: 1,
          unitPrice: 2000000,
          discountPercent: 0,
          isCustomItem: true,
          sortOrder: 1,
        },
      ],
    });
    expect(ketQua.success).toBe(true);
  });
});
