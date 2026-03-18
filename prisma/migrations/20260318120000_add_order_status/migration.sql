-- Add a proper order status enum to keep track of order lifecycle.
-- This migration updates existing rows to use the new status values and adds a constraint to prevent invalid strings.

PRAGMA foreign_keys = OFF;

-- Recreate Order table with status constraint
CREATE TABLE "Order_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    "checkoutSessionId" TEXT UNIQUE,
    "stripeSessionId" TEXT NOT NULL UNIQUE,
    "paymentIntentId" TEXT UNIQUE,

    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK ("status" IN ('PENDING_PAYMENT','PAID','SENT_TO_PRINTFUL','IN_PRODUCTION','SHIPPED','CANCELLED','FAILED')),
    "paymentStatus" TEXT,
    "amountTotal" INTEGER,
    "currency" TEXT,
    "draftId" TEXT,

    "productId" TEXT,
    "color" TEXT,
    "size" TEXT,

    "customerEmail" TEXT,
    "shippingName" TEXT,
    "shippingLine1" TEXT,
    "shippingLine2" TEXT,
    "shippingCity" TEXT,
    "shippingPostal" TEXT,
    "shippingState" TEXT,
    "shippingCountry" TEXT,

    "itemsJson" TEXT
);

INSERT INTO "Order_new" (
  "id",
  "createdAt",
  "checkoutSessionId",
  "stripeSessionId",
  "paymentIntentId",
  "status",
  "paymentStatus",
  "amountTotal",
  "currency",
  "draftId",
  "productId",
  "color",
  "size",
  "customerEmail",
  "shippingName",
  "shippingLine1",
  "shippingLine2",
  "shippingCity",
  "shippingPostal",
  "shippingState",
  "shippingCountry",
  "itemsJson"
)
SELECT
  "id",
  "createdAt",
  "checkoutSessionId",
  "stripeSessionId",
  "paymentIntentId",
  CASE
    WHEN upper(coalesce("status", '')) = 'PENDING' THEN 'PENDING_PAYMENT'
    WHEN upper(coalesce("status", '')) = 'PAID' THEN 'PAID'
    WHEN upper(coalesce("status", '')) = 'SHIPPED' THEN 'SHIPPED'
    WHEN upper(coalesce("status", '')) = 'CANCELLED' THEN 'CANCELLED'
    WHEN upper(coalesce("status", '')) = 'FAILED' THEN 'FAILED'
    WHEN upper(coalesce("status", '')) = 'IN_PRODUCTION' THEN 'IN_PRODUCTION'
    WHEN upper(coalesce("status", '')) = 'SENT_TO_PRINTFUL' THEN 'SENT_TO_PRINTFUL'
    ELSE 'PENDING_PAYMENT'
  END,
  "paymentStatus",
  "amountTotal",
  "currency",
  "draftId",
  "productId",
  "color",
  "size",
  "customerEmail",
  "shippingName",
  "shippingLine1",
  "shippingLine2",
  "shippingCity",
  "shippingPostal",
  "shippingState",
  "shippingCountry",
  "itemsJson"
FROM "Order";

DROP TABLE "Order";
ALTER TABLE "Order_new" RENAME TO "Order";

CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
CREATE UNIQUE INDEX "Order_paymentIntentId_key" ON "Order"("paymentIntentId");
CREATE UNIQUE INDEX "Order_checkoutSessionId_key" ON "Order"("checkoutSessionId");

-- Recreate OrderDraft table with status constraint
CREATE TABLE "OrderDraft_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK ("status" IN ('PENDING_PAYMENT','PAID','SENT_TO_PRINTFUL','IN_PRODUCTION','SHIPPED','CANCELLED','FAILED')),
    "items" TEXT NOT NULL
);

INSERT INTO "OrderDraft_new" (
  "id",
  "createdAt",
  "updatedAt",
  "stripeSessionId",
  "status",
  "items"
)
SELECT
  "id",
  "createdAt",
  "updatedAt",
  "stripeSessionId",
  CASE
    WHEN upper(coalesce("status", '')) = 'PENDING' THEN 'PENDING_PAYMENT'
    WHEN upper(coalesce("status", '')) = 'PAID' THEN 'PAID'
    WHEN upper(coalesce("status", '')) = 'SHIPPED' THEN 'SHIPPED'
    WHEN upper(coalesce("status", '')) = 'CANCELLED' THEN 'CANCELLED'
    WHEN upper(coalesce("status", '')) = 'FAILED' THEN 'FAILED'
    WHEN upper(coalesce("status", '')) = 'IN_PRODUCTION' THEN 'IN_PRODUCTION'
    WHEN upper(coalesce("status", '')) = 'SENT_TO_PRINTFUL' THEN 'SENT_TO_PRINTFUL'
    ELSE 'PENDING_PAYMENT'
  END,
  "items"
FROM "OrderDraft";

DROP TABLE "OrderDraft";
ALTER TABLE "OrderDraft_new" RENAME TO "OrderDraft";

CREATE UNIQUE INDEX "OrderDraft_stripeSessionId_key" ON "OrderDraft"("stripeSessionId");

PRAGMA foreign_keys = ON;
