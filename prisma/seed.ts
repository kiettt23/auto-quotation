import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ─── Categories ───────────────────────────────────────
  const categories = await Promise.all(
    [
      { name: "Thiết bị mạng", sortOrder: 1 },
      { name: "Thiết bị viễn thông", sortOrder: 2 },
      { name: "Camera & Giám sát", sortOrder: 3 },
      { name: "Cáp & Phụ kiện", sortOrder: 4 },
      { name: "Dịch vụ", sortOrder: 5 },
      { name: "Giải pháp", sortOrder: 6 },
      { name: "Gói Internet", sortOrder: 7 },
    ].map((cat) =>
      prisma.category.upsert({
        where: { id: cat.name.toLowerCase().replace(/\s+/g, "-") },
        update: { name: cat.name, sortOrder: cat.sortOrder },
        create: { id: cat.name.toLowerCase().replace(/\s+/g, "-"), ...cat },
      })
    )
  );
  console.log(`  ${categories.length} categories seeded`);

  // ─── Units ────────────────────────────────────────────
  const units = await Promise.all(
    ["Cái", "Bộ", "Mét", "Cuộn", "Gói", "Giờ", "Tháng"].map((name) =>
      prisma.unit.upsert({
        where: { id: name.toLowerCase() },
        update: { name },
        create: { id: name.toLowerCase(), name },
      })
    )
  );
  console.log(`  ${units.length} units seeded`);

  // ─── Settings (singleton) ─────────────────────────────
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "ABC TELECOM",
      address: "123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
      phone: "028 1234 5678",
      email: "sales@abctelecom.vn",
      taxCode: "0123456789",
      bankName: "Vietcombank",
      bankAccount: "1234567890",
      bankOwner: "CONG TY TNHH ABC TELECOM",
      primaryColor: "#0369A1",
      quotePrefix: "BG-{YYYY}-",
      quoteNextNumber: 1,
      defaultVatPercent: 10,
      defaultValidityDays: 30,
      defaultShipping: 0,
    },
  });
  console.log("  Settings singleton seeded");

  // ─── Products ─────────────────────────────────────────
  // helper: lookup category/unit id by name slug
  const catId = (name: string) => name.toLowerCase().replace(/\s+/g, "-");
  const unitId = (name: string) => name.toLowerCase();

  const products = [
    // Thiết bị mạng
    {
      code: "SW-24P-TP",
      name: "Switch TP-Link 24 Port 10/100Mbps",
      categoryId: catId("Thiết bị mạng"),
      unitId: unitId("Cái"),
      basePrice: 1850000,
    },
    {
      code: "SW-48P-HP",
      name: "Switch HP 48 Port Gigabit Managed",
      categoryId: catId("Thiết bị mạng"),
      unitId: unitId("Cái"),
      basePrice: 12500000,
    },
    {
      code: "RT-WIFI6-AX",
      name: "Router WiFi 6 AX3000 Dual Band",
      categoryId: catId("Thiết bị mạng"),
      unitId: unitId("Cái"),
      basePrice: 3200000,
    },
    {
      code: "AP-CISCO-AIR",
      name: "Access Point Cisco Aironet 2800",
      categoryId: catId("Thiết bị mạng"),
      unitId: unitId("Cái"),
      basePrice: 8900000,
    },
    // Thiết bị viễn thông
    {
      code: "ONU-GPON-4P",
      name: "ONU GPON 4 Port Ethernet",
      categoryId: catId("Thiết bị viễn thông"),
      unitId: unitId("Cái"),
      basePrice: 950000,
    },
    {
      code: "OLT-8PON",
      name: "OLT 8 PON Port GPON/EPON",
      categoryId: catId("Thiết bị viễn thông"),
      unitId: unitId("Cái"),
      basePrice: 45000000,
    },
    {
      code: "MEDIA-CONV-FE",
      name: "Media Converter Quang-Điện 100Mbps",
      categoryId: catId("Thiết bị viễn thông"),
      unitId: unitId("Bộ"),
      basePrice: 480000,
    },
    // Camera & Giám sát
    {
      code: "CAM-2MP-HIK",
      name: "Camera IP Hikvision 2MP Dome",
      categoryId: catId("Camera & Giám sát"),
      unitId: unitId("Cái"),
      basePrice: 1250000,
    },
    {
      code: "CAM-4MP-DAH",
      name: "Camera Dahua 4MP WizSense",
      categoryId: catId("Camera & Giám sát"),
      unitId: unitId("Cái"),
      basePrice: 1950000,
    },
    {
      code: "NVR-8CH-POE",
      name: "Đầu ghi NVR 8 kênh PoE 4K",
      categoryId: catId("Camera & Giám sát"),
      unitId: unitId("Cái"),
      basePrice: 4200000,
    },
    {
      code: "HDD-4TB-SURV",
      name: "Ổ cứng Camera Seagate SkyHawk 4TB",
      categoryId: catId("Camera & Giám sát"),
      unitId: unitId("Cái"),
      basePrice: 2800000,
    },
    // Cáp & Phụ kiện
    {
      code: "CAP-CAT6-LINK",
      name: "Cáp mạng Cat6 LinkSys (305m/cuộn)",
      categoryId: catId("Cáp & Phụ kiện"),
      unitId: unitId("Cuộn"),
      basePrice: 1200000,
    },
    {
      code: "CAP-QUANG-SM",
      name: "Cáp quang Single Mode 4 lõi (1000m)",
      categoryId: catId("Cáp & Phụ kiện"),
      unitId: unitId("Cuộn"),
      basePrice: 4500000,
    },
    {
      code: "RJ45-CAT6-100",
      name: "Hạt RJ45 Cat6 (hộp 100 cái)",
      categoryId: catId("Cáp & Phụ kiện"),
      unitId: unitId("Gói"),
      basePrice: 180000,
    },
    {
      code: "PATCH-PANEL-24",
      name: "Patch Panel 24 Port Cat6",
      categoryId: catId("Cáp & Phụ kiện"),
      unitId: unitId("Cái"),
      basePrice: 850000,
    },
    // Gói Internet (FPT-style)
    {
      code: "FPT-GIGA",
      name: "Internet Giga 300Mbps WiFi 6",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 195000,
    },
    {
      code: "FPT-SKY",
      name: "Internet Sky 1Gbps WiFi 6",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 195000,
    },
    {
      code: "FPT-FGAME",
      name: "Internet F-Game 1Gbps Gaming UltraFast",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 225000,
    },
    {
      code: "FPT-SKYF1",
      name: "Internet Sky F1 1Gbps + 1 Access Point",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 210000,
    },
    {
      code: "FPT-SKYF2",
      name: "Internet Sky F2 1Gbps + 2 Access Points",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 230000,
    },
    {
      code: "FPT-COMBO-SKY",
      name: "Combo Sky Internet 1Gbps + FPT Play Box + Premier League",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 299000,
    },
    {
      code: "FPT-COMBO-SKYF1",
      name: "Combo Sky F1 Internet + Access Point + FPT Play Box",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 319000,
    },
    {
      code: "FPT-COMBO-META",
      name: "Combo Meta 1Gbps Symmetric WiFi 7 + FPT Play",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 399000,
    },
    {
      code: "FPT-SPEEDX2",
      name: "SpeedX2 2Gbps Symmetric XGS-PON WiFi 7",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 999000,
    },
    {
      code: "FPT-SPEEDX10",
      name: "SpeedX10 10Gbps Symmetric XGS-PON WiFi 7",
      categoryId: catId("Gói Internet"),
      unitId: unitId("Tháng"),
      basePrice: 1599000,
    },
    // Dịch vụ
    {
      code: "SVC-INSTALL-NET",
      name: "Thi công lắp đặt hệ thống mạng",
      categoryId: catId("Dịch vụ"),
      unitId: unitId("Gói"),
      basePrice: 5000000,
    },
    {
      code: "SVC-SUPPORT-Y",
      name: "Bảo trì hệ thống mạng (1 năm)",
      categoryId: catId("Dịch vụ"),
      unitId: unitId("Gói"),
      basePrice: 12000000,
    },
    {
      code: "SVC-CONSULT-H",
      name: "Tư vấn thiết kế hạ tầng mạng",
      categoryId: catId("Dịch vụ"),
      unitId: unitId("Giờ"),
      basePrice: 800000,
    },
  ];

  let productCount = 0;
  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: { name: p.name, basePrice: p.basePrice },
      create: p,
    });
    productCount++;
  }
  console.log(`  ${productCount} products seeded`);

  // ─── Customers ────────────────────────────────────────
  const customers = [
    {
      name: "Nguyễn Văn An",
      company: "Công ty TNHH Thương mại Bình Minh",
      phone: "0901 234 567",
      email: "an.nguyen@binhminh.com",
      address: "45 Lê Lợi, Quận 1, TP. HCM",
      notes: "Khách hàng thân thiết, ưu tiên giao hàng nhanh",
    },
    {
      name: "Trần Thị Bích",
      company: "Trường THPT Nguyễn Du",
      phone: "0912 345 678",
      email: "bich.tran@nguyendu.edu.vn",
      address: "123 Đinh Tiên Hoàng, Quận Bình Thạnh, TP. HCM",
      notes: "",
    },
    {
      name: "Lê Hoàng Minh",
      company: "Bệnh viện Đa khoa Hòa Bình",
      phone: "0933 456 789",
      email: "minh.le@bvhoabinh.vn",
      address: "88 Nguyễn Thị Minh Khai, Quận 3, TP. HCM",
      notes: "Cần xuất hóa đơn GTGT",
    },
    {
      name: "Phạm Quốc Hùng",
      company: "Khách sạn Sài Gòn Star",
      phone: "0944 567 890",
      email: "hung.pham@saigonstar.com",
      address: "200 Bùi Viện, Quận 1, TP. HCM",
      notes: "",
    },
    {
      name: "Võ Thị Thu",
      company: "Siêu thị Co.opMart Nguyễn Kiệm",
      phone: "0955 678 901",
      email: "thu.vo@coopmart.vn",
      address: "365 Nguyễn Kiệm, Gò Vấp, TP. HCM",
      notes: "Liên hệ qua email trước khi gọi",
    },
    {
      name: "Hoàng Văn Đức",
      company: "Văn phòng Kiến trúc HDK",
      phone: "0988 765 432",
      email: "duc.hoang@hdk-arch.vn",
      address: "56 Phan Xích Long, Phú Nhuận, TP. HCM",
      notes: "Đăng ký internet cho văn phòng mới",
    },
  ];

  let customerCount = 0;
  for (const c of customers) {
    const existing = await prisma.customer.findFirst({
      where: { email: c.email },
    });
    if (!existing) {
      await prisma.customer.create({ data: c });
      customerCount++;
    }
  }
  console.log(`  ${customerCount} customers seeded`);

  // ─── Quotes (sample data) ─────────────────────────────
  // Fetch created customers & products for IDs
  const [custBinhMinh, custTruong, custBenhVien, custKhachSan] =
    await Promise.all([
      prisma.customer.findFirst({ where: { email: "an.nguyen@binhminh.com" } }),
      prisma.customer.findFirst({ where: { email: "bich.tran@nguyendu.edu.vn" } }),
      prisma.customer.findFirst({ where: { email: "minh.le@bvhoabinh.vn" } }),
      prisma.customer.findFirst({ where: { email: "hung.pham@saigonstar.com" } }),
    ]);

  const [pSwitch, pRouter, pONU, pCam2M, pNVR, pCap, pInstall, pSupport] =
    await Promise.all([
      prisma.product.findUnique({ where: { code: "SW-24P-TP" } }),
      prisma.product.findUnique({ where: { code: "RT-WIFI6-AX" } }),
      prisma.product.findUnique({ where: { code: "ONU-GPON-4P" } }),
      prisma.product.findUnique({ where: { code: "CAM-2MP-HIK" } }),
      prisma.product.findUnique({ where: { code: "NVR-8CH-POE" } }),
      prisma.product.findUnique({ where: { code: "CAP-CAT6-LINK" } }),
      prisma.product.findUnique({ where: { code: "SVC-INSTALL-NET" } }),
      prisma.product.findUnique({ where: { code: "SVC-SUPPORT-Y" } }),
    ]);

  const validUntil30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const validUntilExpired = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

  const existingQuotes = await prisma.quote.count();
  if (existingQuotes === 0 && custBinhMinh && custTruong && custBenhVien && custKhachSan) {
    // BG-2026-0001: Bình Minh - ACCEPTED
    const q1Subtotal = 5 * 1850000 + 3 * 3200000;  // Switch x5 + Router x3 = 18.850.000
    const q1Vat = Math.round(q1Subtotal * 0.1);
    const q1Total = q1Subtotal + q1Vat;
    await prisma.quote.create({
      data: {
        quoteNumber: "BG-2026-0001",
        customerId: custBinhMinh.id,
        customerName: custBinhMinh.name,
        customerCompany: custBinhMinh.company,
        customerPhone: custBinhMinh.phone,
        customerEmail: custBinhMinh.email,
        customerAddress: custBinhMinh.address,
        status: "ACCEPTED",
        vatPercent: 10,
        shareToken: "demo-binhminh-2026",
        validUntil: validUntil30,
        subtotal: q1Subtotal,
        vatAmount: q1Vat,
        total: q1Total,
        terms: "- Giao hàng trong 3 ngày làm việc\n- Bảo hành 12 tháng\n- Thanh toán chuyển khoản",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: pSwitch?.id,
              sortOrder: 0,
              name: "Switch TP-Link 24 Port 10/100Mbps",
              unit: "Cái",
              quantity: 5,
              unitPrice: 1850000,
              discountPercent: 0,
              lineTotal: 5 * 1850000,
            },
            {
              productId: pRouter?.id,
              sortOrder: 1,
              name: "Router WiFi 6 AX3000 Dual Band",
              unit: "Cái",
              quantity: 3,
              unitPrice: 3200000,
              discountPercent: 0,
              lineTotal: 3 * 3200000,
            },
          ],
        },
      },
    });

    // BG-2026-0002: Trường THPT - SENT
    const q2Subtotal = 20 * 950000 + 2 * 1200000;  // ONU x20 + Cáp x2 = 21.400.000
    const q2Vat = Math.round(q2Subtotal * 0.1);
    const q2Total = q2Subtotal + q2Vat;
    await prisma.quote.create({
      data: {
        quoteNumber: "BG-2026-0002",
        customerId: custTruong.id,
        customerName: custTruong.name,
        customerCompany: custTruong.company,
        customerPhone: custTruong.phone,
        customerEmail: custTruong.email,
        customerAddress: custTruong.address,
        status: "SENT",
        vatPercent: 10,
        shareToken: "demo-truongnd-2026",
        validUntil: validUntil30,
        subtotal: q2Subtotal,
        vatAmount: q2Vat,
        total: q2Total,
        terms: "- Lắp đặt miễn phí trong nội thành\n- Bảo hành 12 tháng",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: pONU?.id,
              sortOrder: 0,
              name: "ONU GPON 4 Port Ethernet",
              unit: "Cái",
              quantity: 20,
              unitPrice: 950000,
              discountPercent: 0,
              lineTotal: 20 * 950000,
            },
            {
              productId: pCap?.id,
              sortOrder: 1,
              name: "Cáp mạng Cat6 LinkSys (305m/cuộn)",
              unit: "Cuộn",
              quantity: 2,
              unitPrice: 1200000,
              discountPercent: 0,
              lineTotal: 2 * 1200000,
            },
          ],
        },
      },
    });

    // BG-2026-0003: Bệnh viện - DRAFT (lớn, có chiết khấu)
    const q3Items = [
      { p: pCam2M, name: "Camera IP Hikvision 2MP Dome", unit: "Cái", qty: 24, price: 1250000 },
      { p: pNVR, name: "Đầu ghi NVR 8 kênh PoE 4K", unit: "Cái", qty: 3, price: 4200000 },
      { p: pInstall, name: "Thi công lắp đặt hệ thống mạng", unit: "Gói", qty: 1, price: 5000000 },
      { p: pSupport, name: "Bảo trì hệ thống mạng (1 năm)", unit: "Gói", qty: 1, price: 12000000 },
    ];
    const q3Subtotal = q3Items.reduce((s, i) => s + i.qty * i.price, 0); // 55.800.000
    const q3Discount = Math.round(q3Subtotal * 0.05); // CK 5%
    const q3After = q3Subtotal - q3Discount;
    const q3Vat = Math.round(q3After * 0.1);
    const q3Total = q3After + q3Vat;
    await prisma.quote.create({
      data: {
        quoteNumber: "BG-2026-0003",
        customerId: custBenhVien.id,
        customerName: custBenhVien.name,
        customerCompany: custBenhVien.company,
        customerPhone: custBenhVien.phone,
        customerEmail: custBenhVien.email,
        customerAddress: custBenhVien.address,
        status: "DRAFT",
        vatPercent: 10,
        globalDiscountPercent: 5,
        validUntil: validUntil30,
        subtotal: q3Subtotal,
        discountAmount: q3Discount,
        vatAmount: q3Vat,
        total: q3Total,
        notes: "Hệ thống camera toàn bệnh viện, 3 tòa nhà",
        terms: "- Thi công ngoài giờ hành chính\n- Bảo hành camera 24 tháng\n- Thanh toán 50% trước, 50% sau nghiệm thu",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        items: {
          create: q3Items.map((i, idx) => ({
            productId: i.p?.id,
            sortOrder: idx,
            name: i.name,
            unit: i.unit,
            quantity: i.qty,
            unitPrice: i.price,
            discountPercent: 0,
            lineTotal: i.qty * i.price,
          })),
        },
      },
    });

    // BG-2026-0004: Khách sạn - EXPIRED
    const q4Subtotal = 8 * 1250000 + 1 * 4200000; // Cam x8 + NVR x1 = 14.200.000
    const q4Vat = Math.round(q4Subtotal * 0.1);
    const q4Total = q4Subtotal + q4Vat;
    await prisma.quote.create({
      data: {
        quoteNumber: "BG-2026-0004",
        customerId: custKhachSan.id,
        customerName: custKhachSan.name,
        customerCompany: custKhachSan.company,
        customerPhone: custKhachSan.phone,
        customerEmail: custKhachSan.email,
        customerAddress: custKhachSan.address,
        status: "EXPIRED",
        vatPercent: 10,
        validUntil: validUntilExpired,
        subtotal: q4Subtotal,
        vatAmount: q4Vat,
        total: q4Total,
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              productId: pCam2M?.id,
              sortOrder: 0,
              name: "Camera IP Hikvision 2MP Dome",
              unit: "Cái",
              quantity: 8,
              unitPrice: 1250000,
              discountPercent: 0,
              lineTotal: 8 * 1250000,
            },
            {
              productId: pNVR?.id,
              sortOrder: 1,
              name: "Đầu ghi NVR 8 kênh PoE 4K",
              unit: "Cái",
              quantity: 1,
              unitPrice: 4200000,
              discountPercent: 0,
              lineTotal: 4200000,
            },
          ],
        },
      },
    });

    console.log("  4 sample quotes seeded");
  } else {
    console.log("  Quotes already exist, skipping");
  }

  // ─── FPT sample quotes (luôn tạo mới, mã sinh tự động không trùng) ──
  {
    const cfg = await prisma.settings.findUnique({ where: { id: "default" } });
    let seq = cfg?.quoteNextNumber ?? 1;
    const pfx = (cfg?.quotePrefix ?? "BG-{YYYY}-").replace("{YYYY}", String(new Date().getFullYear()));
    const nextCode = () => `${pfx}${String(seq++).padStart(4, "0")}`;

    const [cust1, cust2, cust3] = await Promise.all([
      prisma.customer.findFirst({ where: { email: "an.nguyen@binhminh.com" } }),
      prisma.customer.findFirst({ where: { email: "bich.tran@nguyendu.edu.vn" } }),
      prisma.customer.findFirst({ where: { email: "hung.pham@saigonstar.com" } }),
    ]);

    const [pSky, pSkyF1, pFGame, pComboMeta, pSpeedX2] = await Promise.all([
      prisma.product.findUnique({ where: { code: "FPT-SKY" } }),
      prisma.product.findUnique({ where: { code: "FPT-SKYF1" } }),
      prisma.product.findUnique({ where: { code: "FPT-FGAME" } }),
      prisma.product.findUnique({ where: { code: "FPT-COMBO-META" } }),
      prisma.product.findUnique({ where: { code: "FPT-SPEEDX2" } }),
    ]);

    // Quote A: gói 3 tháng thử nghiệm (DRAFT)
    if (cust2) {
      const items = [
        { p: pSky,   name: "Internet Sky 1Gbps WiFi 6",         qty: 3, price: 195000 },
        { p: pFGame, name: "Internet F-Game 1Gbps Gaming",       qty: 3, price: 225000 },
      ];
      const sub = items.reduce((s, i) => s + i.qty * i.price, 0);
      const vat = Math.round(sub * 0.1);
      await prisma.quote.create({ data: {
        quoteNumber: nextCode(),
        customerId: cust2.id, customerName: cust2.name, customerCompany: cust2.company,
        customerPhone: cust2.phone, customerEmail: cust2.email, customerAddress: cust2.address,
        status: "DRAFT", vatPercent: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: sub, vatAmount: vat, total: sub + vat,
        terms: "- Gói thử nghiệm 3 tháng\n- Miễn phí lắp đặt và modem WiFi",
        items: { create: items.map((i, idx) => ({
          productId: i.p?.id, sortOrder: idx, name: i.name,
          unit: "Tháng", quantity: i.qty, unitPrice: i.price,
          discountPercent: 0, lineTotal: i.qty * i.price,
        })) },
      } });
    }

    // Quote B: gói 6 tháng văn phòng (SENT) - có phí lắp đặt
    if (cust1) {
      const items = [
        { p: pSkyF1, name: "Internet Sky F1 1Gbps + 1 Access Point", qty: 6, price: 210000 },
      ];
      const sub = items.reduce((s, i) => s + i.qty * i.price, 0);
      const vat = Math.round(sub * 0.1);
      const shipping = 150000; // phí lắp đặt
      await prisma.quote.create({ data: {
        quoteNumber: nextCode(),
        customerId: cust1.id, customerName: cust1.name, customerCompany: cust1.company,
        customerPhone: cust1.phone, customerEmail: cust1.email, customerAddress: cust1.address,
        status: "SENT", vatPercent: 10, shippingFee: shipping,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: sub, vatAmount: vat, total: sub + vat + shipping,
        terms: "- Gói 6 tháng, gia hạn 12 tháng giảm thêm 5%\n- Phí lắp đặt một lần 150.000đ",
        items: { create: items.map((i, idx) => ({
          productId: i.p?.id, sortOrder: idx, name: i.name,
          unit: "Tháng", quantity: i.qty, unitPrice: i.price,
          discountPercent: 0, lineTotal: i.qty * i.price,
        })) },
      } });
    }

    // Quote C: gói 12 tháng cao cấp có chiết khấu (ACCEPTED)
    if (cust3) {
      const items = [
        { p: pComboMeta, name: "Combo Meta 1Gbps Symmetric WiFi 7 + FPT Play", qty: 12, price: 399000, disc: 10 },
        { p: pSpeedX2,   name: "SpeedX2 2Gbps Symmetric XGS-PON WiFi 7",       qty: 12, price: 999000, disc: 10 },
      ];
      const sub = items.reduce((s, i) => s + Math.round(i.qty * i.price * (1 - i.disc / 100)), 0);
      const vat = Math.round(sub * 0.1);
      await prisma.quote.create({ data: {
        quoteNumber: nextCode(),
        customerId: cust3.id, customerName: cust3.name, customerCompany: cust3.company,
        customerPhone: cust3.phone, customerEmail: cust3.email, customerAddress: cust3.address,
        status: "ACCEPTED", vatPercent: 10,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: sub, vatAmount: vat, total: sub + vat,
        terms: "- Hợp đồng 12 tháng, chiết khấu 10%\n- SLA 99.9% uptime\n- Hỗ trợ kỹ thuật 24/7",
        items: { create: items.map((i, idx) => ({
          productId: i.p?.id, sortOrder: idx, name: i.name,
          unit: "Tháng", quantity: i.qty, unitPrice: i.price,
          discountPercent: i.disc, lineTotal: Math.round(i.qty * i.price * (1 - i.disc / 100)),
        })) },
      } });
    }

    await prisma.settings.update({ where: { id: "default" }, data: { quoteNextNumber: seq } });
    console.log("  FPT sample quotes seeded");
  }

  // ─── Doc Templates (Excel Template Engine) ──────────
  // Note: Real templates require uploading an Excel file via the UI.
  // Seed data is skipped since fileBase64 requires an actual Excel file.
  const existingTemplates = await prisma.docTemplate.count();
  if (existingTemplates === 0) {
    console.log("  No doc templates (upload Excel files via /mau-chung-tu/tao-moi)");
  } else {
    console.log(`  ${existingTemplates} doc templates already exist`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
