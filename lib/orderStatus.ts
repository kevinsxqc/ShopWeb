export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "SENT_TO_PRINTFUL",
  "IN_PRODUCTION",
  "SHIPPED",
  "CANCELLED",
  "FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ORDER_STATUSES.includes(value as OrderStatus);
}

export function prettyStatus(status: string | null | undefined): string {
  const s = (status ?? "").toString().toUpperCase();
  switch (s) {
    case "PENDING_PAYMENT":
      return "Pending payment";
    case "PAID":
      return "Paid ✅";
    case "SENT_TO_PRINTFUL":
      return "Sent to production";
    case "IN_PRODUCTION":
      return "In production";
    case "SHIPPED":
      return "Shipped 🚚";
    case "CANCELLED":
      return "Cancelled";
    case "FAILED":
      return "Failed";
    default:
      return status ?? "Unknown";
  }
}

export function statusMessage(status: string | null | undefined): string {
  const s = (status ?? "").toString().toUpperCase();
  switch (s) {
    case "PENDING_PAYMENT":
      return "Your payment is pending. Please complete payment to proceed.";
    case "PAID":
      return "Payment received. Your order will be processed soon.";
    case "SENT_TO_PRINTFUL":
      return "Your order has been sent to our production partner.";
    case "IN_PRODUCTION":
      return "Your order is being prepared in production.";
    case "SHIPPED":
      return "Your order has been shipped.";
    case "CANCELLED":
      return "This order has been cancelled.";
    case "FAILED":
      return "Something went wrong with your order. Please contact support.";
    default:
      return "Order status updated by the shop.";
  }
}
