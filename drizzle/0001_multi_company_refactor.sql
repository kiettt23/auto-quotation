-- Phase 1: Multi-company refactor migration
-- Add userId to all entity tables, add new fields, drop companyId from non-document tables

-- 1. Company: rename ownerId → userId, add driverName, vehicleId, deletedAt
ALTER TABLE "company" RENAME COLUMN "owner_id" TO "user_id";
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "driver_name" text;
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "vehicle_id" text;
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "deleted_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;

-- 2. Customer: add userId (populate from company.userId), add deliveryName, drop companyId
--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "user_id" text;
--> statement-breakpoint
ALTER TABLE "customer" ADD COLUMN "delivery_name" text;
--> statement-breakpoint
UPDATE "customer" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "customer"."company_id");
--> statement-breakpoint
ALTER TABLE "customer" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "customer" DROP CONSTRAINT "customer_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN "company_id";

-- 3. Product: add userId, drop companyId
--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "product" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "product"."company_id");
--> statement-breakpoint
ALTER TABLE "product" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "product" DROP COLUMN "company_id";

-- 4. Category: add userId, drop companyId
--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "category" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "category"."company_id");
--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "category" DROP CONSTRAINT "category_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "category" DROP COLUMN "company_id";

-- 5. Unit: add userId, drop companyId
--> statement-breakpoint
ALTER TABLE "unit" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "unit" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "unit"."company_id");
--> statement-breakpoint
ALTER TABLE "unit" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "unit" ADD CONSTRAINT "unit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "unit" DROP CONSTRAINT "unit_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "unit" DROP COLUMN "company_id";

-- 6. Document type: add userId, drop companyId, update unique constraint
--> statement-breakpoint
ALTER TABLE "document_type" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "document_type" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "document_type"."company_id");
--> statement-breakpoint
ALTER TABLE "document_type" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "document_type" ADD CONSTRAINT "document_type_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "document_type" DROP CONSTRAINT "uq_document_type_company_key";
--> statement-breakpoint
ALTER TABLE "document_type" ADD CONSTRAINT "uq_document_type_user_key" UNIQUE ("user_id", "key");
--> statement-breakpoint
ALTER TABLE "document_type" DROP CONSTRAINT "document_type_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "document_type" DROP COLUMN "company_id";

-- 7. Document: add userId (keep companyId)
--> statement-breakpoint
ALTER TABLE "document" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "document" SET "user_id" = (SELECT "user_id" FROM "company" WHERE "company"."id" = "document"."company_id");
--> statement-breakpoint
ALTER TABLE "document" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
