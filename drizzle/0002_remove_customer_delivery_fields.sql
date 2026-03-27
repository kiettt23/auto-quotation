-- Remove delivery_name and delivery_address from customer table
-- Delivery location is now selected as a separate customer record in documents
ALTER TABLE "customer" DROP COLUMN IF EXISTS "delivery_name";
--> statement-breakpoint
ALTER TABLE "customer" DROP COLUMN IF EXISTS "delivery_address";
