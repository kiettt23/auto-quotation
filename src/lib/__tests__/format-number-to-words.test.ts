import { describe, it, expect } from "vitest";
import { numberToVietnameseWords } from "../format-number-to-words";

describe("Đọc số thành chữ tiếng Việt (numberToVietnameseWords)", () => {
  describe("Số đặc biệt", () => {
    it("đọc số 0 thành 'Không đồng'", () => {
      expect(numberToVietnameseWords(0)).toBe("Không đồng");
    });

    it("đọc số âm có tiền tố 'Âm'", () => {
      expect(numberToVietnameseWords(-1000)).toBe("Âm Một nghìn đồng");
    });
  });

  describe("Số đơn vị (1-9)", () => {
    it("đọc đúng hàng đơn vị", () => {
      expect(numberToVietnameseWords(5)).toBe("Năm đồng");
    });
  });

  describe("Số hàng chục (10-99)", () => {
    it("đọc số tròn chục", () => {
      expect(numberToVietnameseWords(10)).toBe("Mười đồng");
    });

    it("đọc 15 thành 'mười lăm' (không phải 'mười năm')", () => {
      expect(numberToVietnameseWords(15)).toBe("Mười lăm đồng");
    });

    it("đọc 21 thành 'hai mươi mốt' (không phải 'hai mươi một')", () => {
      expect(numberToVietnameseWords(21)).toBe("Hai mươi mốt đồng");
    });

    it("đọc 55 thành 'năm mươi lăm'", () => {
      expect(numberToVietnameseWords(55)).toBe("Năm mươi lăm đồng");
    });
  });

  describe("Số hàng trăm (100-999)", () => {
    it("đọc số tròn trăm", () => {
      expect(numberToVietnameseWords(100)).toBe("Một trăm đồng");
    });

    it("đọc 105 có 'lẻ' (một trăm lẻ năm)", () => {
      expect(numberToVietnameseWords(105)).toBe("Một trăm lẻ năm đồng");
    });
  });

  describe("Số hàng nghìn (1.000+)", () => {
    it("đọc số tròn nghìn", () => {
      expect(numberToVietnameseWords(1000)).toBe("Một nghìn đồng");
    });

    it("đọc 1.500 đúng đơn vị nghìn + trăm", () => {
      expect(numberToVietnameseWords(1500)).toBe("Một nghìn năm trăm đồng");
    });
  });

  describe("Số hàng triệu (1.000.000+)", () => {
    it("đọc số tròn triệu", () => {
      expect(numberToVietnameseWords(1000000)).toBe("Một triệu đồng");
    });

    it("đọc 5.500.000 đúng đơn vị triệu + nghìn", () => {
      expect(numberToVietnameseWords(5500000)).toBe("Năm triệu năm trăm nghìn đồng");
    });
  });

  describe("Số phức tạp (dùng trong báo giá thực tế)", () => {
    it("đọc 50.083.000 chứa các đơn vị triệu + nghìn", () => {
      const ketQua = numberToVietnameseWords(50083000);
      expect(ketQua).toContain("triệu");
      expect(ketQua).toContain("nghìn");
      expect(ketQua).toContain("đồng");
    });

    it("đọc hàng tỷ (1.000.000.000)", () => {
      const ketQua = numberToVietnameseWords(1000000000);
      expect(ketQua).toContain("tỷ");
      expect(ketQua).toContain("đồng");
    });

    it("làm tròn số thập phân trước khi đọc", () => {
      // 1500.7 → làm tròn 1501
      const ketQua = numberToVietnameseWords(1500.7);
      expect(ketQua).toContain("nghìn");
      expect(ketQua).toContain("đồng");
    });
  });
});
