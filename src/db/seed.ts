/**
 * Demo data seeder — populates a fresh database with one tenant and sample data.
 * Run with: pnpm db:seed
 */
import { db } from "./index";
import { tenants, tenantMembers, categories, units, products, customers } from "./schema";
import { auth } from "../auth";
import {
  DEFAULT_GREETING,
  DEFAULT_TERMS,
  DEFAULT_PRIMARY_COLOR,
  DEFAULT_QUOTE_PREFIX,
} from "../lib/constants";

async function seed() {
  console.log("Seeding database…");

  // 1. Create demo user via Better Auth
  const { user } = await auth.api.signUpEmail({
    body: {
      name: "Demo User",
      email: "demo@example.com",
      password: "password123",
    },
  });
  console.log("Created user:", user.email);

  // 2. Create demo tenant
  const [tenant] = await db
    .insert(tenants)
    .values({
      name: "Demo Company",
      slug: "demo",
      companyName: "Demo Company Ltd.",
      address: "123 Main Street, Hanoi",
      phone: "0901234567",
      email: "info@demo.com",
      primaryColor: DEFAULT_PRIMARY_COLOR,
      greetingText: DEFAULT_GREETING,
      defaultTerms: DEFAULT_TERMS,
      quotePrefix: DEFAULT_QUOTE_PREFIX,
    })
    .returning();
  console.log("Created tenant:", tenant.slug);

  // 3. Add user as OWNER of tenant
  await db.insert(tenantMembers).values({
    tenantId: tenant.id,
    userId: user.id,
    role: "OWNER",
  });

  // 4. Seed categories
  const [catElectronics, catFurniture] = await db
    .insert(categories)
    .values([
      { tenantId: tenant.id, name: "Electronics", sortOrder: 0 },
      { tenantId: tenant.id, name: "Furniture", sortOrder: 1 },
    ])
    .returning();

  // 5. Seed units
  const [unitPcs, unitSet] = await db
    .insert(units)
    .values([
      { tenantId: tenant.id, name: "Pcs" },
      { tenantId: tenant.id, name: "Set" },
    ])
    .returning();

  // 6. Seed products
  await db.insert(products).values([
    {
      tenantId: tenant.id,
      code: "LAPTOP-001",
      name: "Business Laptop 14\"",
      description: "High-performance business laptop",
      categoryId: catElectronics.id,
      unitId: unitPcs.id,
      basePrice: "25000000",
      pricingType: "FIXED",
    },
    {
      tenantId: tenant.id,
      code: "CHAIR-001",
      name: "Ergonomic Office Chair",
      description: "Adjustable lumbar support",
      categoryId: catFurniture.id,
      unitId: unitPcs.id,
      basePrice: "4500000",
      pricingType: "FIXED",
    },
    {
      tenantId: tenant.id,
      code: "DESK-SET-001",
      name: "Standing Desk Set",
      description: "Height-adjustable desk with drawer unit",
      categoryId: catFurniture.id,
      unitId: unitSet.id,
      basePrice: "12000000",
      pricingType: "FIXED",
    },
  ]);

  // 7. Seed customers
  await db.insert(customers).values([
    {
      tenantId: tenant.id,
      name: "Nguyen Van A",
      company: "ABC Corporation",
      phone: "0912345678",
      email: "a.nguyen@abc.com",
      address: "456 Le Loi, Ho Chi Minh City",
    },
    {
      tenantId: tenant.id,
      name: "Tran Thi B",
      company: "XYZ Technology",
      phone: "0987654321",
      email: "b.tran@xyz.com",
      address: "789 Nguyen Hue, Da Nang",
    },
  ]);

  console.log("Seed complete.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
