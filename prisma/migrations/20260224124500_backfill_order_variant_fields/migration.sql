-- Backfill Order.productId/color/size from first item in itemsJson for legacy rows
UPDATE "Order"
SET
  "productId" = COALESCE("productId", json_extract("itemsJson", '$[0].productId')),
  "color" = COALESCE("color", json_extract("itemsJson", '$[0].color')),
  "size" = COALESCE("size", json_extract("itemsJson", '$[0].size'))
WHERE "itemsJson" IS NOT NULL;
