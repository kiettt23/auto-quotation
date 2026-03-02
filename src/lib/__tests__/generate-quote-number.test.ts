import { describe, it, expect } from "vitest";
import { generateQuoteNumber } from "../generate-quote-number";

describe("Tạo mã báo giá (generateQuoteNumber)", () => {
  const namHienTai = new Date().getFullYear();

  it("tạo đúng format chuẩn: BG-{NĂM}-{SỐ}", () => {
    const ketQua = generateQuoteNumber("BG-{YYYY}-", 42);
    expect(ketQua).toBe(`BG-${namHienTai}-0042`);
  });

  it("đệm số thứ tự đủ 4 chữ số (0001, 0042, ...)", () => {
    const ketQua = generateQuoteNumber("BG-{YYYY}-", 1);
    expect(ketQua).toMatch(/-0001$/);
  });

  it("không đệm khi số thứ tự > 4 chữ số", () => {
    const ketQua = generateQuoteNumber("BG-{YYYY}-", 10001);
    expect(ketQua).toMatch(/-10001$/);
  });

  it("hỗ trợ tiền tố tùy chỉnh (QT-{YYYY}/)", () => {
    const ketQua = generateQuoteNumber("QT-{YYYY}/", 5);
    expect(ketQua).toBe(`QT-${namHienTai}/0005`);
  });

  it("thay {YYYY} bằng năm hiện tại tự động", () => {
    const ketQua = generateQuoteNumber("TEST-{YYYY}-", 1);
    expect(ketQua).toContain(namHienTai.toString());
  });
});
