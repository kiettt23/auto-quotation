import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

const statements = [
  // 1. Company: rename ownerId → userId, add driverName, vehicleId, deletedAt, FK
  `ALTER TABLE "company" RENAME COLUMN "owner_id" TO "user_id"`,
  `ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "driver_name" text`,
  `ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "vehicle_id" text`,
  `ALTER TABLE "company" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone`,
  `ALTER TABLE "company" ADD CONSTRAINT "company_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,

  // 2. Customer: add userId, deliveryName, populate, drop companyId
  `ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "user_id" text`,
  `ALTER TABLE "customer" ADD COLUMN IF NOT EXISTS "delivery_name" text`,
  `UPDATE "customer" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "customer"."company_id") WHERE "user_id" IS NULL`,
  `ALTER TABLE "customer" ALTER COLUMN "user_id" SET NOT NULL`,
  `ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "customer_company_id_company_id_fk"`,
  `ALTER TABLE "customer" DROP COLUMN IF EXISTS "company_id"`,

  // 3. Product: add userId, populate, drop companyId
  `ALTER TABLE "product" ADD COLUMN IF NOT EXISTS "user_id" text`,
  `UPDATE "product" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "product"."company_id") WHERE "user_id" IS NULL`,
  `ALTER TABLE "product" ALTER COLUMN "user_id" SET NOT NULL`,
  `ALTER TABLE "product" ADD CONSTRAINT "product_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "product" DROP CONSTRAINT IF EXISTS "product_company_id_company_id_fk"`,
  `ALTER TABLE "product" DROP COLUMN IF EXISTS "company_id"`,

  // 4. Category: add userId, populate, drop companyId
  `ALTER TABLE "category" ADD COLUMN IF NOT EXISTS "user_id" text`,
  `UPDATE "category" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "category"."company_id") WHERE "user_id" IS NULL`,
  `ALTER TABLE "category" ALTER COLUMN "user_id" SET NOT NULL`,
  `ALTER TABLE "category" ADD CONSTRAINT "category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "category" DROP CONSTRAINT IF EXISTS "category_company_id_company_id_fk"`,
  `ALTER TABLE "category" DROP COLUMN IF EXISTS "company_id"`,

  // 5. Unit: add userId, populate, drop companyId
  `ALTER TABLE "unit" ADD COLUMN IF NOT EXISTS "user_id" text`,
  `UPDATE "unit" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "unit"."company_id") WHERE "user_id" IS NULL`,
  `ALTER TABLE "unit" ALTER COLUMN "user_id" SET NOT NULL`,
  `ALTER TABLE "unit" ADD CONSTRAINT "unit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "unit" DROP CONSTRAINT IF EXISTS "unit_company_id_company_id_fk"`,
  `ALTER TABLE "unit" DROP COLUMN IF EXISTS "company_id"`,

  // 6. Document type: add userId, populate, update unique, drop companyId
  `ALTER TABLE "document_type" ADD COLUMN IF NOT EXISTS "user_id" text`,
  `UPDATE "document_type" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "document_type"."company_id") WHERE "user_id" IS NULL`,
  `ALTER TABLE "document_type" ALTER COLUMN "user_id" SET NOT NULL`,
  `ALTER TABLE "document_type" ADD CONSTRAINT "document_type_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
  `ALTER TABLE "document_type" DROP CONSTRAINT IF EXISTS "uq_document_type_company_key"`,
  `ALTER TABLE "document_type" ADD CONSTRAINT "uq_document_type_user_key" UNIQUE ("user_id", "key")`,
  `ALTER TABLE "document_type" DROP CONSTRAINT IF EXISTS "document_type_company_id_company_id_fk"`,
  `ALTER TABLE "document_type" DROP COLUMN IF EXISTS "company_id"`,

  // 7. Document: add userId (keep companyId)
  `ALTER TABLE "document" ADD COLUMN IF NOT EXISTS "user_id" text`,
  `UPDATE "document" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "document"."company_id") WHERE "user_id" IS NULL`,
  `ALTER TABLE "document" ALTER COLUMN "user_id" SET NOT NULL`,
  `ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action`,
];

async function main() {
  console.log(`Running ${statements.length} migration statements...`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      console.log(`[${i + 1}/${statements.length}] ✓ ${stmt.substring(0, 80)}...`);
    } catch (err: any) {
      // Skip "already exists" errors for idempotency
      if (err.message?.includes("already exists") || err.message?.includes("duplicate")) {
        console.log(`[${i + 1}/${statements.length}] ⚠ Skipped (already exists): ${stmt.substring(0, 60)}...`);
      } else {
        console.error(`[${i + 1}/${statements.length}] ✗ FAILED: ${stmt.substring(0, 80)}...`);
        console.error(`  Error: ${err.message}`);
        process.exit(1);
      }
    }
  }
  console.log("\n✓ Migration complete!");

  // Verify
  const cols = await sql.query("SELECT table_name, column_name FROM information_schema.columns WHERE column_name = 'user_id' AND table_schema = 'public' ORDER BY table_name");
  console.log("\nTables with user_id column:", cols.map((r: any) => r.table_name));
}

main();
