/*
  Warnings:

  - You are about to drop the column `amount` on the `Order` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeSessionId" TEXT NOT NULL,
    "paymentStatus" TEXT,
    "amountTotal" INTEGER,
    "currency" TEXT,
    "productId" TEXT,
    "color" TEXT,
    "size" TEXT
);
INSERT INTO "new_Order" ("color", "createdAt", "currency", "id", "productId", "size", "stripeSessionId") SELECT "color", "createdAt", "currency", "id", "productId", "size", "stripeSessionId" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
