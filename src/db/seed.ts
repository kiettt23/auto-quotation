/**
 * Comprehensive demo seeder — realistic Vietnamese business data.
 * Run with: pnpm db:seed
 */
import { db } from "./index";
import {
  tenants, tenantMembers, categories, units, products,
  pricingTiers, volumeDiscounts, customers, quotes, quoteItems,
  documentTemplates, documents, tenantInvites,
} from "./schema";
import { auth } from "../auth";
import {
  DEFAULT_GREETING, DEFAULT_TERMS, DEFAULT_PRIMARY_COLOR, DEFAULT_QUOTE_PREFIX,
} from "../lib/constants";
import { createId } from "@paralleldrive/cuid2";

async function getOrCreateUser(name: string, email: string, password: string) {
  try {
    const { user } = await auth.api.signUpEmail({ body: { name, email, password } });
    return user;
  } catch {
    // User already exists — fetch by email
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (!existing) throw new Error(`Cannot find or create user: ${email}`);
    return existing;
  }
}

async function seed() {
  console.log("🌱 Seeding database…\n");

  // ── 1. Users (4 roles) ───────────────────────────────────
  const owner = await getOrCreateUser("Nguyễn Văn Owner", "owner@demo.com", "password123");
  const adminUser = await getOrCreateUser("Phạm Thị Admin", "admin@demo.com", "password123");
  const memberUser = await getOrCreateUser("Trần Thị Member", "member@demo.com", "password123");
  const viewerUser = await getOrCreateUser("Lê Văn Viewer", "viewer@demo.com", "password123");
  console.log("✅ Created/found 4 users");

  // ── 2. Tenant ─────────────────────────────────────────────
  const existingTenant = await db.query.tenants.findFirst({
    where: (t, { eq }) => eq(t.slug, "demo"),
  });
  if (existingTenant) {
    console.log("⏭️  Tenant already exists, skipping seed.");
    return;
  }

  const [tenant] = await db.insert(tenants).values({
    name: "Công ty TNHH Giải Pháp Số",
    slug: "demo",
    companyName: "Công ty TNHH Giải Pháp Số",
    address: "Tầng 12, Toà nhà Viettel, 285 Cách Mạng Tháng 8, Quận 10, TP.HCM",
    phone: "028 3833 9999", email: "info@giaiphapso.vn",
    taxCode: "0312345678", website: "https://giaiphapso.vn",
    bankName: "Vietcombank - CN Sài Gòn", bankAccount: "0071001234567",
    bankOwner: "CONG TY TNHH GIAI PHAP SO",
    primaryColor: DEFAULT_PRIMARY_COLOR, greetingText: DEFAULT_GREETING,
    defaultTerms: DEFAULT_TERMS, quotePrefix: DEFAULT_QUOTE_PREFIX,
    showAmountInWords: true, showBankInfo: true, showSignatureBlocks: true,
    onboardingComplete: true, quoteNextNumber: 4,
  }).returning();
  console.log("✅ Created tenant:", tenant.name);

  // ── 3. Tenant members ────────────────────────────────────
  await db.insert(tenantMembers).values([
    { tenantId: tenant.id, userId: owner.id, role: "OWNER" },
    { tenantId: tenant.id, userId: adminUser.id, role: "ADMIN" },
    { tenantId: tenant.id, userId: memberUser.id, role: "MEMBER" },
    { tenantId: tenant.id, userId: viewerUser.id, role: "VIEWER" },
  ]);

  // ── 4. Categories ─────────────────────────────────────────
  const [catIT, catFurniture, catPrinting, catNetwork] = await db.insert(categories).values([
    { tenantId: tenant.id, name: "Thiết bị CNTT", sortOrder: 0 },
    { tenantId: tenant.id, name: "Nội thất văn phòng", sortOrder: 1 },
    { tenantId: tenant.id, name: "Thiết bị in ấn", sortOrder: 2 },
    { tenantId: tenant.id, name: "Thiết bị mạng", sortOrder: 3 },
  ]).returning();

  // ── 5. Units ──────────────────────────────────────────────
  const [uCai, uBo, uChiec, uHop, uMet] = await db.insert(units).values([
    { tenantId: tenant.id, name: "Cái" },
    { tenantId: tenant.id, name: "Bộ" },
    { tenantId: tenant.id, name: "Chiếc" },
    { tenantId: tenant.id, name: "Hộp" },
    { tenantId: tenant.id, name: "Mét" },
  ]).returning();

  // ── 6. Products (10, mixed pricing) ───────────────────────
  const allProducts = await db.insert(products).values([
    { tenantId: tenant.id, code: "LAPTOP-001", name: "Laptop Dell Latitude 5540",
      description: "Intel Core i7-1365U, 16GB RAM, 512GB SSD, 15.6\" FHD",
      categoryId: catIT.id, unitId: uCai.id, basePrice: "28500000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "LAPTOP-002", name: "MacBook Air M3 2024",
      description: "Apple M3, 8GB RAM, 256GB SSD, 13.6\" Liquid Retina",
      categoryId: catIT.id, unitId: uCai.id, basePrice: "32990000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "MON-001", name: "Màn hình Dell P2422H 24\"",
      description: "IPS FHD, USB-C, xoay nghiêng",
      categoryId: catIT.id, unitId: uCai.id, basePrice: "5890000", pricingType: "TIERED" as const },
    { tenantId: tenant.id, code: "DESK-001", name: "Bàn làm việc chữ L",
      description: "Gỗ MDF phủ melamine, chân sắt, 140x120cm",
      categoryId: catFurniture.id, unitId: uBo.id, basePrice: "4200000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "CHAIR-001", name: "Ghế công thái học Sihoo M57",
      description: "Tựa lưng lưới, tựa đầu điều chỉnh, tay gập",
      categoryId: catFurniture.id, unitId: uChiec.id, basePrice: "4990000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "CHAIR-002", name: "Ghế chân quỳ lưới",
      description: "Lưng lưới, đệm ngồi, cố định",
      categoryId: catFurniture.id, unitId: uChiec.id, basePrice: "890000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "PRINT-001", name: "Máy in HP LaserJet Pro M404dn",
      description: "In 2 mặt tự động, in mạng, 40 trang/phút",
      categoryId: catPrinting.id, unitId: uCai.id, basePrice: "8900000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "TONER-001", name: "Hộp mực HP 58A (CF258A)",
      description: "Mực in chính hãng, ~3000 trang",
      categoryId: catPrinting.id, unitId: uHop.id, basePrice: "1850000", pricingType: "TIERED" as const },
    { tenantId: tenant.id, code: "SW-001", name: "Switch TP-Link TL-SG1024D",
      description: "24 cổng Gigabit, không quản lý, rack-mount",
      categoryId: catNetwork.id, unitId: uCai.id, basePrice: "2190000", pricingType: "FIXED" as const },
    { tenantId: tenant.id, code: "CAB-001", name: "Cáp mạng CAT6 Commscope",
      description: "Cáp đồng nguyên chất, vỏ PVC",
      categoryId: catNetwork.id, unitId: uMet.id, basePrice: "8500", pricingType: "TIERED" as const },
  ]).returning();
  console.log("✅ Created 10 products");

  const p = (code: string) => allProducts.find((x) => x.code === code)!;

  // Pricing tiers for TIERED products
  await db.insert(pricingTiers).values([
    { productId: p("MON-001").id, minQuantity: "1", maxQuantity: "4", price: "5890000" },
    { productId: p("MON-001").id, minQuantity: "5", maxQuantity: "19", price: "5590000" },
    { productId: p("MON-001").id, minQuantity: "20", maxQuantity: null, price: "5290000" },
    { productId: p("TONER-001").id, minQuantity: "1", maxQuantity: "9", price: "1850000" },
    { productId: p("TONER-001").id, minQuantity: "10", maxQuantity: null, price: "1650000" },
    { productId: p("CAB-001").id, minQuantity: "1", maxQuantity: "99", price: "8500" },
    { productId: p("CAB-001").id, minQuantity: "100", maxQuantity: "999", price: "7500" },
    { productId: p("CAB-001").id, minQuantity: "1000", maxQuantity: null, price: "6800" },
  ]);

  await db.insert(volumeDiscounts).values([
    { productId: p("MON-001").id, minQuantity: "10", discountPercent: "3" },
    { productId: p("MON-001").id, minQuantity: "50", discountPercent: "5" },
    { productId: p("TONER-001").id, minQuantity: "20", discountPercent: "5" },
  ]);
  console.log("✅ Pricing tiers + volume discounts");

  // ── 7. Customers (5) ──────────────────────────────────────
  const [custABC, , , custSchool, custHotel] = await db.insert(customers).values([
    { tenantId: tenant.id, name: "Nguyễn Văn Hùng", company: "Công ty CP ABC",
      phone: "0912 345 678", email: "hung.nv@abc.com.vn",
      address: "56 Nguyễn Huệ, Quận 1, TP.HCM", notes: "Khách VIP, ưu tiên giao nhanh" },
    { tenantId: tenant.id, name: "Trần Minh Tú", company: "TNHH XYZ Trading",
      phone: "0987 654 321", email: "tu.tm@xyztrading.vn",
      address: "123 Lê Lợi, Hải Châu, Đà Nẵng" },
    { tenantId: tenant.id, name: "Phạm Thị Hoa", company: "Công ty TNHH Sao Việt",
      phone: "0909 111 222", email: "hoa.pt@saoviet.tech",
      address: "789 Hoàng Văn Thụ, Tân Bình, TP.HCM" },
    { tenantId: tenant.id, name: "Lê Quang Minh", company: "Trường THPT Nguyễn Du",
      phone: "0903 444 555", email: "minh.lq@nguyendu.edu.vn",
      address: "45 Đinh Tiên Hoàng, Quận 1, TP.HCM", notes: "Đơn vị công lập, cần xuất VAT" },
    { tenantId: tenant.id, name: "Đặng Thanh Long", company: "Khách sạn Sunrise",
      phone: "0918 777 888", email: "long.dt@sunrisehotel.vn",
      address: "200 Trần Phú, Nha Trang" },
  ]).returning();
  console.log("✅ Created 5 customers");

  // ── 8. Quotes (3 statuses) ────────────────────────────────
  const in30d = new Date(Date.now() + 30 * 86400000);
  const shareToken = createId();
  const lt = (qty: number, price: number, disc = 0) =>
    String(Math.round(qty * price * (1 - disc / 100)));

  // Q1: DRAFT — IT equipment
  const [q1] = await db.insert(quotes).values({
    tenantId: tenant.id, quoteNumber: "BG-2026-001",
    customerId: custABC.id, customerName: custABC.name, customerCompany: custABC.company,
    customerPhone: custABC.phone, customerEmail: custABC.email, customerAddress: custABC.address,
    status: "DRAFT", validUntil: in30d, vatPercent: "10", shippingFee: "350000",
    terms: DEFAULT_TERMS,
    subtotal: "97280000", vatAmount: "9728000", total: "107358000",
  }).returning();
  await db.insert(quoteItems).values([
    { quoteId: q1.id, productId: p("LAPTOP-001").id, sortOrder: 0,
      name: p("LAPTOP-001").name, description: p("LAPTOP-001").description,
      unit: "Cái", quantity: 2, unitPrice: "28500000", lineTotal: lt(2, 28500000) },
    { quoteId: q1.id, productId: p("MON-001").id, sortOrder: 1,
      name: p("MON-001").name, description: p("MON-001").description,
      unit: "Cái", quantity: 4, unitPrice: "5890000", lineTotal: lt(4, 5890000) },
    { quoteId: q1.id, productId: p("CHAIR-001").id, sortOrder: 2,
      name: p("CHAIR-001").name, description: p("CHAIR-001").description,
      unit: "Chiếc", quantity: 4, unitPrice: "4990000", discountPercent: "5",
      lineTotal: lt(4, 4990000, 5) },
  ]);
  console.log("✅ BG-2026-001 (DRAFT) — IT equipment");

  // Q2: SENT — Furniture for school (with share link)
  const [q2] = await db.insert(quotes).values({
    tenantId: tenant.id, quoteNumber: "BG-2026-002",
    customerId: custSchool.id, customerName: custSchool.name, customerCompany: custSchool.company,
    customerPhone: custSchool.phone, customerEmail: custSchool.email, customerAddress: custSchool.address,
    status: "SENT", validUntil: in30d, shareToken,
    vatPercent: "10", globalDiscountPercent: "5",
    otherFees: "500000", otherFeesLabel: "Phí lắp đặt",
    terms: "- Thanh toán 100% sau nghiệm thu\n- Giao hàng 10 ngày\n- Bảo hành 24 tháng",
    subtotal: "95800000", discountAmount: "4790000", vatAmount: "9101000", total: "100611000",
  }).returning();
  await db.insert(quoteItems).values([
    { quoteId: q2.id, productId: p("DESK-001").id, sortOrder: 0,
      name: p("DESK-001").name, description: "Cho phòng máy tính",
      unit: "Bộ", quantity: 10, unitPrice: "4200000", lineTotal: lt(10, 4200000) },
    { quoteId: q2.id, productId: p("CHAIR-002").id, sortOrder: 1,
      name: p("CHAIR-002").name, description: p("CHAIR-002").description,
      unit: "Chiếc", quantity: 40, unitPrice: "890000", lineTotal: lt(40, 890000) },
    { quoteId: q2.id, sortOrder: 2, name: "Kệ sách treo tường",
      description: "Kệ gỗ 60x30cm, gắn tường", unit: "Cái",
      quantity: 10, unitPrice: "380000", lineTotal: lt(10, 380000), isCustomItem: true },
  ]);
  console.log("✅ BG-2026-002 (SENT) — Furniture [share link active]");

  // Q3: ACCEPTED — Network for hotel
  const [q3] = await db.insert(quotes).values({
    tenantId: tenant.id, quoteNumber: "BG-2026-003",
    customerId: custHotel.id, customerName: custHotel.name, customerCompany: custHotel.company,
    customerPhone: custHotel.phone, customerEmail: custHotel.email, customerAddress: custHotel.address,
    status: "ACCEPTED", validUntil: in30d, vatPercent: "10", shippingFee: "1500000",
    globalDiscountPercent: "2", otherFees: "3000000", otherFeesLabel: "Phí thi công hạ tầng mạng",
    terms: "- Tạm ứng 30%\n- Thi công 21 ngày\n- Bảo hành 36 tháng",
    subtotal: "43350000", discountAmount: "867000", vatAmount: "4248300", total: "51231300",
    notes: "Khách yêu cầu thi công ngoài giờ hành chính",
  }).returning();
  await db.insert(quoteItems).values([
    { quoteId: q3.id, productId: p("SW-001").id, sortOrder: 0,
      name: p("SW-001").name, description: p("SW-001").description,
      unit: "Cái", quantity: 5, unitPrice: "2190000", lineTotal: lt(5, 2190000) },
    { quoteId: q3.id, productId: p("CAB-001").id, sortOrder: 1,
      name: p("CAB-001").name, description: "CAT6 cho tầng 1-5",
      unit: "Mét", quantity: 2000, unitPrice: "6800", lineTotal: lt(2000, 6800) },
    { quoteId: q3.id, productId: p("PRINT-001").id, sortOrder: 2,
      name: p("PRINT-001").name, description: p("PRINT-001").description,
      unit: "Cái", quantity: 2, unitPrice: "8900000", discountPercent: "5",
      lineTotal: lt(2, 8900000, 5) },
    { quoteId: q3.id, productId: p("TONER-001").id, sortOrder: 3,
      name: p("TONER-001").name, description: p("TONER-001").description,
      unit: "Hộp", quantity: 5, unitPrice: "1850000", lineTotal: lt(5, 1850000) },
  ]);
  console.log("✅ BG-2026-003 (ACCEPTED) — Network setup");

  // ── 9. Document Templates ─────────────────────────────────
  const [tmplPXK, tmplBBNT] = await db.insert(documentTemplates).values([
    {
      tenantId: tenant.id,
      name: "Phiếu xuất kho",
      description: "Mẫu phiếu xuất kho cơ bản",
      fileType: "excel" as const,
      fileBase64: "",
      sheetName: "Sheet1",
      placeholders: [
        { cellRef: "B3", label: "Số phiếu", type: "text" },
        { cellRef: "B4", label: "Ngày xuất", type: "date" },
        { cellRef: "B5", label: "Người nhận", type: "text" },
      ],
      tableRegion: { startRow: 8, columns: [
        { letter: "A", label: "STT" },
        { letter: "B", label: "Tên hàng" },
        { letter: "C", label: "Số lượng" },
        { letter: "D", label: "Đơn giá" },
      ] },
      docPrefix: "PXK-{YYYY}-",
      docNextNumber: 1,
    },
    {
      tenantId: tenant.id,
      name: "Biên bản nghiệm thu",
      description: "Mẫu biên bản nghiệm thu công trình",
      fileType: "excel" as const,
      fileBase64: "",
      sheetName: "Sheet1",
      placeholders: [
        { cellRef: "B2", label: "Số biên bản", type: "text" },
        { cellRef: "B3", label: "Ngày", type: "date" },
        { cellRef: "B4", label: "Công trình", type: "text" },
        { cellRef: "B5", label: "Chủ đầu tư", type: "text" },
      ],
      tableRegion: null,
      docPrefix: "BBNT-{YYYY}-",
      docNextNumber: 1,
    },
  ]).returning();
  console.log("✅ Created 2 document templates");

  // ── 10. Document Entries ──────────────────────────────────
  await db.insert(documents).values([
    {
      templateId: tmplPXK.id,
      docNumber: "PXK-2026-001",
      fieldData: { B3: "PXK-2026-001", B4: "14/03/2026", B5: "Nguyễn Văn Hùng" },
      tableRows: [
        { A: "1", B: "Laptop Dell Latitude 5540", C: "2", D: "28500000" },
        { A: "2", B: "Màn hình Dell P2422H", C: "4", D: "5890000" },
      ],
    },
    {
      templateId: tmplPXK.id,
      docNumber: "PXK-2026-002",
      fieldData: { B3: "PXK-2026-002", B4: "14/03/2026", B5: "Trần Minh Tú" },
      tableRows: [
        { A: "1", B: "Switch TP-Link TL-SG1024D", C: "5", D: "2190000" },
      ],
    },
    {
      templateId: tmplBBNT.id,
      docNumber: "BBNT-2026-001",
      fieldData: {
        B2: "BBNT-2026-001",
        B3: "14/03/2026",
        B4: "Văn phòng Giải Pháp Số - Tầng 12",
        B5: "Công ty TNHH Giải Pháp Số",
      },
      tableRows: [],
    },
  ]);
  console.log("✅ Created 3 document entries");

  // ── 11. Tenant Invites ────────────────────────────────────
  await db.insert(tenantInvites).values({
    tenantId: tenant.id,
    email: "invited@demo.com",
    role: "MEMBER" as const,
    token: "demo-invite-token-123",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  console.log("✅ Created 1 pending invite");

  console.log("\n🎉 Seed complete!");
  console.log("   4 users | 1 tenant | 4 categories | 5 units | 10 products | 5 customers | 3 quotes");
  console.log("   2 doc templates | 3 doc entries | 1 invite");
  console.log(`   Share: /share/${shareToken}`);
  console.log("   Login (password: password123):");
  console.log("   • owner@demo.com  (OWNER)  • admin@demo.com  (ADMIN)");
  console.log("   • member@demo.com (MEMBER) • viewer@demo.com (VIEWER)");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
