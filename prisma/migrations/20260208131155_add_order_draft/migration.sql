-- AlterTable
ALTER TABLE "Order" ADD COLUMN "draftId" TEXT;
ALTER TABLE "Order" ADD COLUMN "itemsJson" TEXT;

-- CreateTable
CREATE TABLE "OrderDraft" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stripeSessionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "items" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderDraft_stripeSessionId_key" ON "OrderDraft"("stripeSessionId");
