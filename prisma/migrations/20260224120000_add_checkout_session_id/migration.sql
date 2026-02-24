-- Add new checkout session reference on orders
ALTER TABLE "Order" ADD COLUMN "checkoutSessionId" TEXT;

-- Backfill existing rows from legacy stripeSessionId
UPDATE "Order"
SET "checkoutSessionId" = "stripeSessionId"
WHERE "checkoutSessionId" IS NULL;

-- Ensure uniqueness for new lookup key
CREATE UNIQUE INDEX "Order_checkoutSessionId_key" ON "Order"("checkoutSessionId");
