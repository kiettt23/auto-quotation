/**
 * Seed script — populates staging DB with test data for all features.
 *
 * Usage: pnpm db:seed
 *
 * Creates:
 * - 1 user (test@test.com / Test@1234)
 * - 2 companies (with driver/vehicle info for delivery docs)
 * - 3 categories
 * - 4 units
 * - 6 products (across categories/units)
 * - 3 customers (with delivery defaults)
 * - 4 documents (2 quotations + 2 delivery orders, across companies)
 */
import { config } from "dotenv";
config({ path: ".env.local", override: true });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashPassword } from "better-auth/crypto";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// --- IDs (deterministic for easy reference) ---
const USER_ID = "seed-user-001";
const ACCOUNT_ID = "seed-account-001";

const COMPANY_A = "seed-company-fpt";
const COMPANY_B = "seed-company-jesang";

const CAT_TELECOM = "seed-cat-telecom";
const CAT_CABLE = "seed-cat-cable";
const CAT_SERVICE = "seed-cat-service";

const UNIT_CAI = "seed-unit-cai";
const UNIT_MET = "seed-unit-met";
const UNIT_BO = "seed-unit-bo";
const UNIT_GOI = "seed-unit-goi";

const PROD_ROUTER = "seed-prod-router";
const PROD_ONT = "seed-prod-ont";
const PROD_CAP_QUANG = "seed-prod-cap-quang";
const PROD_CAP_LAN = "seed-prod-cap-lan";
const PROD_LAP_DAT = "seed-prod-lap-dat";
const PROD_BAO_TRI = "seed-prod-bao-tri";

const CUST_VINA = "seed-cust-vina";
const CUST_MINH = "seed-cust-minh";
const CUST_HOANG = "seed-cust-hoang";

const DOC_BG1 = "seed-doc-bg1";
const DOC_BG2 = "seed-doc-bg2";
const DOC_PGH1 = "seed-doc-pgh1";
const DOC_PGH2 = "seed-doc-pgh2";

async function seed() {
  console.log("Seeding database...");
  const dbUrl = process.env.DATABASE_URL!;
  console.log(`Target: ${dbUrl.includes("pooler") ? dbUrl.split("@")[1]?.split("/")[0] : "unknown"}`);

  // --- 1. User + Account (better-auth compatible) ---
  const hashedPw = await hashPassword("Test@1234");

  await db.insert(schema.user).values({
    id: USER_ID,
    name: "Test User",
    email: "test@test.com",
    emailVerified: true,
  }).onConflictDoNothing();

  await db.insert(schema.account).values({
    id: ACCOUNT_ID,
    accountId: USER_ID,
    providerId: "credential",
    userId: USER_ID,
    password: hashedPw,
  }).onConflictDoNothing();

  console.log("  User: test@test.com / Test@1234");

  // --- 2. Companies ---
  await db.insert(schema.company).values([
    {
      id: COMPANY_A,
      userId: USER_ID,
      name: "Công Ty TNHH Viễn Thông FPT",
      address: "Lô L29B-31B-33B, Đường Tân Thuận, KCX Tân Thuận, Q.7, TP.HCM",
      phone: "1900 6600",
      taxCode: "0101778163",
      email: "hotro@fpt.vn",
      bankName: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
      bankAccount: "0071001234567",
      headerLayout: "left",
    },
    {
      id: COMPANY_B,
      userId: USER_ID,
      name: "Công Ty TNHH Jesang Vina",
      address: "Lô C, Đường N11, KCN Minh Hưng III, Chơn Thành, Bình Phước",
      phone: "0271 356 7890",
      taxCode: "3801234567",
      email: "info@jesangvina.com",
      driverName: "Trần Văn Bình",
      vehicleId: "93H-12345",
      headerLayout: "center",
      customData: { warehouseCode: "WH-03", contactPerson: "Nguyễn Văn Hùng" },
    },
  ]).onConflictDoNothing();

  console.log("  Companies: 2 (FPT Telecom, Jesang Vina)");

  // --- 3. Categories ---
  await db.insert(schema.category).values([
    { id: CAT_TELECOM, userId: USER_ID, name: "Thiết bị viễn thông" },
    { id: CAT_CABLE, userId: USER_ID, name: "Cáp & phụ kiện" },
    { id: CAT_SERVICE, userId: USER_ID, name: "Dịch vụ" },
  ]).onConflictDoNothing();

  console.log("  Categories: 3");

  // --- 4. Units ---
  await db.insert(schema.unit).values([
    { id: UNIT_CAI, userId: USER_ID, name: "Cái" },
    { id: UNIT_MET, userId: USER_ID, name: "Mét" },
    { id: UNIT_BO, userId: USER_ID, name: "Bộ" },
    { id: UNIT_GOI, userId: USER_ID, name: "Gói" },
  ]).onConflictDoNothing();

  console.log("  Units: 4");

  // --- 5. Products ---
  await db.insert(schema.product).values([
    {
      id: PROD_ROUTER,
      userId: USER_ID,
      name: "Router WiFi 6 AX3000",
      categoryId: CAT_TELECOM,
      unitId: UNIT_CAI,
      unitPrice: 1250000,
      specification: "WiFi 6, 2.4GHz/5GHz, 4 anten",
      customData: { warranty: "24 tháng", origin: "Việt Nam" },
    },
    {
      id: PROD_ONT,
      userId: USER_ID,
      name: "ONT GPON HG8145X6",
      categoryId: CAT_TELECOM,
      unitId: UNIT_CAI,
      unitPrice: 850000,
      specification: "1G GPON, WiFi 6, 4 LAN",
    },
    {
      id: PROD_CAP_QUANG,
      userId: USER_ID,
      name: "Cáp quang indoor FTTH",
      categoryId: CAT_CABLE,
      unitId: UNIT_MET,
      unitPrice: 5500,
      specification: "1 core, SM, G.657A2",
    },
    {
      id: PROD_CAP_LAN,
      userId: USER_ID,
      name: "Cáp mạng Cat6 UTP",
      categoryId: CAT_CABLE,
      unitId: UNIT_MET,
      unitPrice: 8000,
      specification: "Cat6, UTP, 23AWG",
    },
    {
      id: PROD_LAP_DAT,
      userId: USER_ID,
      name: "Lắp đặt Internet cáp quang",
      categoryId: CAT_SERVICE,
      unitId: UNIT_GOI,
      unitPrice: 350000,
      specification: "Bao gồm kéo cáp + đấu nối + test",
    },
    {
      id: PROD_BAO_TRI,
      userId: USER_ID,
      name: "Bảo trì thiết bị mạng",
      categoryId: CAT_SERVICE,
      unitId: UNIT_GOI,
      unitPrice: 200000,
      specification: "Kiểm tra, vệ sinh, cập nhật firmware",
    },
  ]).onConflictDoNothing();

  console.log("  Products: 6");

  // --- 6. Customers ---
  await db.insert(schema.customer).values([
    {
      id: CUST_VINA,
      userId: USER_ID,
      name: "Công Ty TNHH Kyong Gi Vina",
      address: "KCN Minh Hưng III, Chơn Thành, Bình Phước",
      phone: "0271 356 1234",
      taxCode: "3801567890",
      deliveryName: "Kho hàng Kyong Gi Vina",
      deliveryAddress: "Lô A5, Đường N3, KCN Minh Hưng III, Chơn Thành, Bình Phước",
      receiverName: "Nguyễn Thị Mai",
      receiverPhone: "0901234567",
      customData: { department: "Phòng vật tư", purchaseOrderPrefix: "PO-KG" },
    },
    {
      id: CUST_MINH,
      userId: USER_ID,
      name: "Cửa hàng Minh Phát",
      address: "123 Nguyễn Trãi, Q.1, TP.HCM",
      phone: "028 3925 1234",
      receiverName: "Trần Minh Phát",
      receiverPhone: "0912345678",
    },
    {
      id: CUST_HOANG,
      userId: USER_ID,
      name: "Văn phòng Hoàng Gia",
      address: "456 Lê Lợi, Q.3, TP.HCM",
      phone: "028 3821 5678",
      email: "info@hoanggia.vn",
      receiverName: "Lê Hoàng",
      receiverPhone: "0923456789",
    },
  ]).onConflictDoNothing();

  console.log("  Customers: 3");

  // --- 7. Documents ---
  // Quotation 1 — FPT company, Minh Phát customer
  await db.insert(schema.document).values([
    {
      id: DOC_BG1,
      userId: USER_ID,
      companyId: COMPANY_A,
      customerId: CUST_MINH,
      type: "QUOTATION",
      templateId: "quotation",
      documentNumber: "BG-2026-001",
      data: {
        customerName: "Cửa hàng Minh Phát",
        customerAddress: "123 Nguyễn Trãi, Q.1, TP.HCM",
        receiverName: "Trần Minh Phát",
        receiverPhone: "0912345678",
        date: "2026-03-20",
        notes: "Giá trên chưa bao gồm VAT 10%. Báo giá có hiệu lực 30 ngày.",
        items: [
          { productId: PROD_ROUTER, productName: "Router WiFi 6 AX3000", specification: "WiFi 6, 2.4GHz/5GHz, 4 anten", unit: "Cái", quantity: 10, unitPrice: 1250000, amount: 12500000 },
          { productId: PROD_ONT, productName: "ONT GPON HG8145X6", specification: "1G GPON, WiFi 6, 4 LAN", unit: "Cái", quantity: 10, unitPrice: 850000, amount: 8500000 },
          { productId: PROD_CAP_QUANG, productName: "Cáp quang indoor FTTH", specification: "1 core, SM, G.657A2", unit: "Mét", quantity: 500, unitPrice: 5500, amount: 2750000 },
          { productId: PROD_LAP_DAT, productName: "Lắp đặt Internet cáp quang", specification: "Kéo cáp + đấu nối + test", unit: "Gói", quantity: 10, unitPrice: 350000, amount: 3500000 },
        ],
      },
    },
    // Quotation 2 — FPT company, Hoàng Gia customer (small quote)
    {
      id: DOC_BG2,
      userId: USER_ID,
      companyId: COMPANY_A,
      customerId: CUST_HOANG,
      type: "QUOTATION",
      templateId: "quotation",
      documentNumber: "BG-2026-002",
      data: {
        customerName: "Văn phòng Hoàng Gia",
        customerAddress: "456 Lê Lợi, Q.3, TP.HCM",
        receiverName: "Lê Hoàng",
        receiverPhone: "0923456789",
        date: "2026-03-21",
        notes: "Bảo hành 12 tháng.",
        items: [
          { productId: PROD_CAP_LAN, productName: "Cáp mạng Cat6 UTP", specification: "Cat6, UTP, 23AWG", unit: "Mét", quantity: 200, unitPrice: 8000, amount: 1600000 },
          { productId: PROD_BAO_TRI, productName: "Bảo trì thiết bị mạng", specification: "Kiểm tra, vệ sinh, cập nhật firmware", unit: "Gói", quantity: 2, unitPrice: 200000, amount: 400000 },
        ],
      },
    },
    // Delivery Order 1 — Jesang company, Kyong Gi customer (with templateFields)
    {
      id: DOC_PGH1,
      userId: USER_ID,
      companyId: COMPANY_B,
      customerId: CUST_VINA,
      type: "DELIVERY_ORDER",
      templateId: "delivery-order",
      documentNumber: "PGH-2026-001",
      data: {
        customerName: "Công Ty TNHH Kyong Gi Vina",
        customerAddress: "KCN Minh Hưng III, Chơn Thành, Bình Phước",
        receiverName: "Nguyễn Thị Mai",
        receiverPhone: "0901234567",
        date: "2026-03-22",
        templateFields: {
          deliveryName: "Kho hàng Kyong Gi Vina",
          deliveryAddress: "Lô A5, Đường N3, KCN Minh Hưng III, Chơn Thành, Bình Phước",
          driverName: "Trần Văn Bình",
          vehicleId: "93H-12345",
        },
        items: [
          { productName: "Thép cuộn HRC SS400", customFields: { contractNo: "HĐ-2026-088", lotNo: "L2026-001", boxQty: "12", netWeight: "25400", invoiceVat: "0012345" } },
          { productName: "Thép tấm SPHC 2.0mm", customFields: { contractNo: "HĐ-2026-088", lotNo: "L2026-002", boxQty: "8", netWeight: "18200", invoiceVat: "0012346" } },
          { productName: "Inox 304 cuộn 1.2mm", customFields: { contractNo: "HĐ-2026-092", lotNo: "L2026-003", boxQty: "5", netWeight: "9800", invoiceVat: "0012500" } },
        ],
      },
    },
    // Delivery Order 2 — Jesang company, Minh Phát customer
    {
      id: DOC_PGH2,
      userId: USER_ID,
      companyId: COMPANY_B,
      customerId: CUST_MINH,
      type: "DELIVERY_ORDER",
      templateId: "delivery-order",
      documentNumber: "PGH-2026-002",
      data: {
        customerName: "Cửa hàng Minh Phát",
        customerAddress: "123 Nguyễn Trãi, Q.1, TP.HCM",
        receiverName: "Trần Minh Phát",
        receiverPhone: "0912345678",
        date: "2026-03-22",
        templateFields: {
          deliveryName: "Cửa hàng Minh Phát - Chi nhánh Q.1",
          deliveryAddress: "123 Nguyễn Trãi, Phường Bến Thành, Q.1, TP.HCM",
          driverName: "Trần Văn Bình",
          vehicleId: "93H-12345",
        },
        items: [
          { productName: "Ống thép mạ kẽm D27", customFields: { contractNo: "HĐ-2026-100", lotNo: "L2026-010", boxQty: "20", netWeight: "3200", invoiceVat: "0013001" } },
        ],
      },
    },
  ]).onConflictDoNothing();

  console.log("  Documents: 4 (2 quotations + 2 delivery orders)");
  console.log("\nSeed complete!");
  console.log("Login: test@test.com / Test@1234");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
