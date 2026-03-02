import { describe, it, expect } from "vitest";
import {
  companyInfoSchema,
  quoteTemplateSchema,
  defaultsSchema,
  categorySchema,
  unitSchema,
} from "../validations/settings-schemas";

describe("Validation thông tin công ty (companyInfoSchema)", () => {
  const congTyHopLe = {
    companyName: "CÔNG TY TNHH ABC TELECOM",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    phone: "028 1234 5678",
    email: "info@abctelecom.vn",
    taxCode: "0123456789",
    website: "https://abctelecom.vn",
    bankName: "Vietcombank",
    bankAccount: "1234567890",
    bankOwner: "NGUYỄN VĂN A",
  };

  it("chấp nhận thông tin công ty đầy đủ", () => {
    const ketQua = companyInfoSchema.safeParse(congTyHopLe);
    expect(ketQua.success).toBe(true);
  });

  it("bắt buộc nhập tên công ty", () => {
    const ketQua = companyInfoSchema.safeParse({ ...congTyHopLe, companyName: "" });
    expect(ketQua.success).toBe(false);
  });

  it("bắt buộc nhập địa chỉ", () => {
    const ketQua = companyInfoSchema.safeParse({ ...congTyHopLe, address: "" });
    expect(ketQua.success).toBe(false);
  });

  it("bắt buộc nhập số điện thoại", () => {
    const ketQua = companyInfoSchema.safeParse({ ...congTyHopLe, phone: "" });
    expect(ketQua.success).toBe(false);
  });

  it("email không bắt buộc (cho phép rỗng)", () => {
    const ketQua = companyInfoSchema.safeParse({ ...congTyHopLe, email: "" });
    expect(ketQua.success).toBe(true);
  });

  it("từ chối email sai định dạng", () => {
    const ketQua = companyInfoSchema.safeParse({ ...congTyHopLe, email: "not-email" });
    expect(ketQua.success).toBe(false);
  });

  it("mã số thuế, website, ngân hàng không bắt buộc", () => {
    const ketQua = companyInfoSchema.safeParse({
      companyName: "Công ty XYZ",
      address: "456 Lê Lợi",
      phone: "0901234567",
    });
    expect(ketQua.success).toBe(true);
  });
});

describe("Validation mẫu báo giá (quoteTemplateSchema)", () => {
  const mauHopLe = {
    primaryColor: "#0369A1",
    greetingText: "Kính gửi Quý khách",
    defaultTerms: "Thanh toán 100%",
    showAmountInWords: true,
    showBankInfo: true,
    showSignatureBlocks: true,
    showFooterNote: false,
    footerNote: "",
  };

  it("chấp nhận cấu hình mẫu hợp lệ", () => {
    const ketQua = quoteTemplateSchema.safeParse(mauHopLe);
    expect(ketQua.success).toBe(true);
  });

  it("bắt buộc chọn màu chủ đạo (primaryColor)", () => {
    const ketQua = quoteTemplateSchema.safeParse({ ...mauHopLe, primaryColor: "" });
    expect(ketQua.success).toBe(false);
  });

  it("cho phép tắt/bật hiển thị số tiền bằng chữ", () => {
    const ketQua = quoteTemplateSchema.safeParse({ ...mauHopLe, showAmountInWords: false });
    expect(ketQua.success).toBe(true);
  });

  it("cho phép tắt/bật hiển thị thông tin ngân hàng", () => {
    const ketQua = quoteTemplateSchema.safeParse({ ...mauHopLe, showBankInfo: false });
    expect(ketQua.success).toBe(true);
  });
});

describe("Validation cài đặt mặc định (defaultsSchema)", () => {
  const macDinhHopLe = {
    quotePrefix: "BG-{YYYY}-",
    quoteNextNumber: 1,
    defaultVatPercent: 10,
    defaultValidityDays: 30,
    defaultShipping: 0,
  };

  it("chấp nhận cài đặt mặc định hợp lệ", () => {
    const ketQua = defaultsSchema.safeParse(macDinhHopLe);
    expect(ketQua.success).toBe(true);
  });

  it("bắt buộc nhập tiền tố mã báo giá", () => {
    const ketQua = defaultsSchema.safeParse({ ...macDinhHopLe, quotePrefix: "" });
    expect(ketQua.success).toBe(false);
  });

  it("số bắt đầu phải >= 1", () => {
    const ketQua = defaultsSchema.safeParse({ ...macDinhHopLe, quoteNextNumber: 0 });
    expect(ketQua.success).toBe(false);
  });

  it("VAT mặc định phải 0-100%", () => {
    expect(defaultsSchema.safeParse({ ...macDinhHopLe, defaultVatPercent: -1 }).success).toBe(false);
    expect(defaultsSchema.safeParse({ ...macDinhHopLe, defaultVatPercent: 101 }).success).toBe(false);
  });

  it("số ngày hiệu lực phải >= 1", () => {
    const ketQua = defaultsSchema.safeParse({ ...macDinhHopLe, defaultValidityDays: 0 });
    expect(ketQua.success).toBe(false);
  });

  it("phí ship mặc định phải >= 0", () => {
    const ketQua = defaultsSchema.safeParse({ ...macDinhHopLe, defaultShipping: -1000 });
    expect(ketQua.success).toBe(false);
  });
});

describe("Validation danh mục (categorySchema)", () => {
  it("chấp nhận danh mục có tên", () => {
    expect(categorySchema.safeParse({ name: "Thiết bị mạng" }).success).toBe(true);
  });

  it("từ chối danh mục tên rỗng", () => {
    expect(categorySchema.safeParse({ name: "" }).success).toBe(false);
  });
});

describe("Validation đơn vị tính (unitSchema)", () => {
  it("chấp nhận đơn vị tính có tên", () => {
    expect(unitSchema.safeParse({ name: "Cái" }).success).toBe(true);
  });

  it("từ chối đơn vị tính tên rỗng", () => {
    expect(unitSchema.safeParse({ name: "" }).success).toBe(false);
  });
});
