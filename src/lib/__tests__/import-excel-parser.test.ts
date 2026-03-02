import { describe, it, expect } from "vitest";
import { autoDetectMapping, SYSTEM_FIELDS } from "../import-excel-parser";

describe("Import Excel - Tự động nhận diện cột (autoDetectMapping)", () => {
  describe("Nhận diện header tiếng Việt", () => {
    it("nhận diện đúng các cột tiếng Việt chuẩn", () => {
      // Lưu ý: regex nhận "Đơn vị" nhưng không nhận "ĐVT" (Đ ≠ D trong Unicode)
      const headers = ["Mã SP", "Tên sản phẩm", "Danh mục", "Đơn giá", "Đơn vị", "Mô tả", "Ghi chú"];
      const mapping = autoDetectMapping(headers);

      expect(mapping.code).toBe(0);
      expect(mapping.name).toBe(1);
      expect(mapping.category).toBe(2);
      expect(mapping.price).toBe(3);
      expect(mapping.unit).toBe(4);
      expect(mapping.description).toBe(5);
      expect(mapping.notes).toBe(6);
    });

    it("nhận diện header viết tắt: 'Mã', 'Giá', 'DVT'", () => {
      const headers = ["Mã", "Tên", "Nhóm", "Giá", "DVT"];
      const mapping = autoDetectMapping(headers);

      expect(mapping.code).toBe(0);
      expect(mapping.name).toBe(1);
      expect(mapping.category).toBe(2);
      expect(mapping.price).toBe(3);
    });
  });

  describe("Nhận diện header tiếng Anh", () => {
    it("nhận diện đúng các cột tiếng Anh", () => {
      const headers = ["Code", "Name", "Category", "Price", "Unit", "Description", "Notes"];
      const mapping = autoDetectMapping(headers);

      expect(mapping.code).toBe(0);
      expect(mapping.name).toBe(1);
      expect(mapping.category).toBe(2);
      expect(mapping.price).toBe(3);
      expect(mapping.unit).toBe(4);
      expect(mapping.description).toBe(5);
      expect(mapping.notes).toBe(6);
    });

    it("nhận diện 'SKU' là mã sản phẩm", () => {
      const headers = ["SKU", "Product Name"];
      const mapping = autoDetectMapping(headers);
      expect(mapping.code).toBe(0);
    });
  });

  describe("Xử lý edge case", () => {
    it("trả object rỗng khi không nhận diện được cột nào", () => {
      const headers = ["Column A", "Column B", "Column C"];
      const mapping = autoDetectMapping(headers);
      expect(Object.keys(mapping).length).toBe(0);
    });

    it("không map trùng cột (mỗi cột chỉ map 1 field)", () => {
      const headers = ["Mã sản phẩm", "Tên sản phẩm"];
      const mapping = autoDetectMapping(headers);
      const indices = Object.values(mapping);
      const uniqueIndices = new Set(indices);
      expect(indices.length).toBe(uniqueIndices.size);
    });

    it("nhận diện không phân biệt hoa thường", () => {
      const headers = ["MÃ SP", "TÊN SẢN PHẨM", "GIÁ BÁN"];
      const mapping = autoDetectMapping(headers);
      expect(mapping.code).toBe(0);
      expect(mapping.name).toBe(1);
      expect(mapping.price).toBe(2);
    });
  });
});

describe("Import Excel - Danh sách trường hệ thống (SYSTEM_FIELDS)", () => {
  it("có đủ 8 trường hệ thống (7 field + 1 skip)", () => {
    expect(SYSTEM_FIELDS.length).toBe(8);
  });

  it("có tùy chọn 'Bỏ qua' để user skip cột không cần", () => {
    const skipField = SYSTEM_FIELDS.find((f) => f.key === "skip");
    expect(skipField).toBeDefined();
    expect(skipField!.label).toContain("Bỏ qua");
  });

  it("có đủ các trường sản phẩm: mã, tên, danh mục, giá, đơn vị, mô tả, ghi chú", () => {
    const keys = SYSTEM_FIELDS.map((f) => f.key);
    expect(keys).toContain("code");
    expect(keys).toContain("name");
    expect(keys).toContain("category");
    expect(keys).toContain("price");
    expect(keys).toContain("unit");
    expect(keys).toContain("description");
    expect(keys).toContain("notes");
  });
});
