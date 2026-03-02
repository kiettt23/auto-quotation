import { describe, it, expect } from "vitest";
import { customerSchema } from "../validations/customer-schemas";

describe("Validation khách hàng (customerSchema)", () => {
  const khachHangHopLe = {
    name: "Nguyễn Văn A",
    company: "Công ty ABC",
    phone: "0901234567",
    email: "abc@example.com",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    notes: "Khách hàng VIP",
  };

  describe("Trường bắt buộc", () => {
    it("chấp nhận khách hàng đầy đủ thông tin", () => {
      const ketQua = customerSchema.safeParse(khachHangHopLe);
      expect(ketQua.success).toBe(true);
    });

    it("bắt buộc nhập tên khách hàng", () => {
      const ketQua = customerSchema.safeParse({ ...khachHangHopLe, name: "" });
      expect(ketQua.success).toBe(false);
    });
  });

  describe("Validation email", () => {
    it("chấp nhận email hợp lệ", () => {
      const ketQua = customerSchema.safeParse({ ...khachHangHopLe, email: "test@gmail.com" });
      expect(ketQua.success).toBe(true);
    });

    it("chấp nhận email rỗng (không bắt buộc)", () => {
      const ketQua = customerSchema.safeParse({ ...khachHangHopLe, email: "" });
      expect(ketQua.success).toBe(true);
    });

    it("từ chối email sai định dạng", () => {
      const ketQua = customerSchema.safeParse({ ...khachHangHopLe, email: "not-email" });
      expect(ketQua.success).toBe(false);
    });
  });

  describe("Trường tùy chọn", () => {
    it("chấp nhận khi chỉ có tên (các trường khác rỗng)", () => {
      const ketQua = customerSchema.safeParse({
        name: "Khách vãng lai",
        company: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
      });
      expect(ketQua.success).toBe(true);
    });
  });
});
