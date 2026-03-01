import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

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
    ["Cái", "Bộ", "Mét", "Cuộn", "Gói", "Giờ"].map((name) =>
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
      primaryColor: "#0369A1",
      quotePrefix: "BG-{YYYY}-",
      quoteNextNumber: 1,
      defaultVatPercent: 10,
      defaultValidityDays: 30,
      defaultShipping: 0,
    },
  });
  console.log("  Settings singleton seeded");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
