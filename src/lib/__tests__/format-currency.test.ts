import { describe, it, expect } from "vitest";
import { formatCurrency, parseCurrency } from "../format-currency";

describe("Định dạng tiền VNĐ (formatCurrency)", () => {
  it("thêm dấu chấm ngăn cách hàng nghìn: 5500000 → '5.500.000'", () => {
    expect(formatCurrency(5500000)).toBe("5.500.000");
  });

  it("không thêm dấu chấm cho số < 1.000", () => {
    expect(formatCurrency(500)).toBe("500");
  });

  it("hiển thị đúng số 0", () => {
    expect(formatCurrency(0)).toBe("0");
  });

  it("làm tròn số thập phân thành số nguyên", () => {
    expect(formatCurrency(1234567.89)).toBe("1.234.568");
  });

  it("chấp nhận input dạng string", () => {
    expect(formatCurrency("5500000")).toBe("5.500.000");
  });

  it("trả '0' khi input không phải số (NaN)", () => {
    expect(formatCurrency("abc")).toBe("0");
  });

  it("hiển thị đúng số lớn hàng tỷ", () => {
    expect(formatCurrency(1500000000)).toBe("1.500.000.000");
  });
});

describe("Parse chuỗi tiền VNĐ về số (parseCurrency)", () => {
  it("bỏ dấu chấm và trả về số: '5.500.000' → 5500000", () => {
    expect(parseCurrency("5.500.000")).toBe(5500000);
  });

  it("xử lý chuỗi không có dấu chấm", () => {
    expect(parseCurrency("500")).toBe(500);
  });

  it("trả 0 khi chuỗi rỗng", () => {
    expect(parseCurrency("")).toBe(0);
  });

  it("trả 0 khi chuỗi không phải số", () => {
    expect(parseCurrency("abc")).toBe(0);
  });

  it("parse đúng số hàng tỷ", () => {
    expect(parseCurrency("1.500.000.000")).toBe(1500000000);
  });
});
