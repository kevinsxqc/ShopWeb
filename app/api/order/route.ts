import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) throw new Error("Missing STRIPE_SECRET_KEY in .env.local");

const stripe = new Stripe(stripeSecretKey, { apiVersion: "2025-11-17.clover" });

type SessionWithShippingDetails = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null;
    address?: Stripe.Address | null;
  } | null;
};

function resolveAddress(session: SessionWithShippingDetails) {
  const shippingAddress = session.shipping_details?.address ?? null;
  const customerAddress = session.customer_details?.address ?? null;
  const address = shippingAddress ?? customerAddress;

  const shippingName = session.shipping_details?.name ?? null;
  const customerName = session.customer_details?.name ?? null;
  const name = shippingName ?? customerName;

  return { address, name };
}

type OrderByCheckoutRow = {
  id: string;
  checkoutSessionId: string | null;
  stripeSessionId: string;
  paymentIntentId: string | null;
  status: string | null;
  paymentStatus: string | null;
  amountTotal: number | null;
  currency: string | null;
  productId: string | null;
  color: string | null;
  size: string | null;
  customerEmail: string | null;
  shippingName: string | null;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingPostal: string | null;
  shippingState: string | null;
  shippingCountry: string | null;
  itemsJson: string | null;
};

type OrderItem = {
  productId: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
};

function itemsFromJson(value: string | null): OrderItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
      .map((item) => ({
        productId: typeof item.productId === "string" ? item.productId : null,
        color: typeof item.color === "string" ? item.color : null,
        size: typeof item.size === "string" ? item.size : null,
        quantity:
          typeof item.quantity === "number" && Number.isFinite(item.quantity)
            ? Math.max(1, item.quantity)
            : 1,
      }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid or missing session_id" }, { status: 400 });
  }

  try {
    const orderByCheckout = await prisma.$queryRaw<OrderByCheckoutRow[]>`
      SELECT
        "id",
        "checkoutSessionId",
        "stripeSessionId",
        "paymentIntentId",
        "status",
        "paymentStatus",
        "amountTotal",
        "currency",
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
      FROM "Order"
      WHERE "checkoutSessionId" = ${sessionId}
      LIMIT 1
    `;

    const checkoutOrder = orderByCheckout[0] ?? null;

    if (checkoutOrder) {
      const items = itemsFromJson(checkoutOrder.itemsJson);
      const firstItem = items[0] ?? null;
      return NextResponse.json({
        orderId: checkoutOrder.id,
        sessionId: checkoutOrder.checkoutSessionId ?? checkoutOrder.stripeSessionId,
        paymentIntentId: checkoutOrder.paymentIntentId,
        status: checkoutOrder.status,
        paymentStatus: checkoutOrder.paymentStatus,
        amountTotal: checkoutOrder.amountTotal,
        currency: checkoutOrder.currency,
        productId: checkoutOrder.productId ?? firstItem?.productId ?? null,
        color: checkoutOrder.color ?? firstItem?.color ?? null,
        size: checkoutOrder.size ?? firstItem?.size ?? null,
        items,
        customerEmail: checkoutOrder.customerEmail,
        shippingAddress: {
          name: checkoutOrder.shippingName,
          line1: checkoutOrder.shippingLine1,
          line2: checkoutOrder.shippingLine2,
          city: checkoutOrder.shippingCity,
          postal_code: checkoutOrder.shippingPostal,
          state: checkoutOrder.shippingState,
          country: checkoutOrder.shippingCountry,
        },
      });
    }

    const dbOrder = await prisma.order.findUnique({
      where: { stripeSessionId: sessionId },
    });

    if (dbOrder) {
      const items = itemsFromJson(dbOrder.itemsJson);
      const firstItem = items[0] ?? null;
      return NextResponse.json({
        orderId: dbOrder.id,
        sessionId: dbOrder.stripeSessionId,
        paymentIntentId: dbOrder.paymentIntentId,
        status: dbOrder.status,
        paymentStatus: dbOrder.paymentStatus,
        amountTotal: dbOrder.amountTotal,
        currency: dbOrder.currency,
        productId: dbOrder.productId ?? firstItem?.productId ?? null,
        color: dbOrder.color ?? firstItem?.color ?? null,
        size: dbOrder.size ?? firstItem?.size ?? null,
        items,
        customerEmail: dbOrder.customerEmail,
        shippingAddress: {
          name: dbOrder.shippingName,
          line1: dbOrder.shippingLine1,
          line2: dbOrder.shippingLine2,
          city: dbOrder.shippingCity,
          postal_code: dbOrder.shippingPostal,
          state: dbOrder.shippingState,
          country: dbOrder.shippingCountry,
        },
      });
    }

    const session = (await stripe.checkout.sessions.retrieve(
      sessionId
    )) as SessionWithShippingDetails;
    const { address, name } = resolveAddress(session);

    const meta = session.metadata ?? {};
    const draftId = meta.draftId;
    let fallbackItems: OrderItem[] = [];

    if (typeof draftId === "string" && draftId.length > 0) {
      const draft = await prisma.orderDraft.findUnique({
        where: { id: draftId },
      });
      fallbackItems = itemsFromJson(draft?.items ?? null);
    }

    if (fallbackItems.length === 0) {
      fallbackItems = meta.productId
        ? [
            {
              productId: meta.productId ?? null,
              color: meta.color ?? null,
              size: meta.size ?? null,
              quantity: 1,
            },
          ]
        : [];
    }

    const fallbackItem = fallbackItems[0] ?? null;

    return NextResponse.json({
      orderId: null,
      sessionId: session.id,
      paymentIntentId:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
      status: session.payment_status ?? null,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      productId: fallbackItem?.productId ?? null,
      color: fallbackItem?.color ?? null,
      size: fallbackItem?.size ?? null,
      items: fallbackItems,
      customerEmail: session.customer_details?.email ?? null,
      shippingAddress: address
        ? {
            name,
            line1: address.line1 ?? null,
            line2: address.line2 ?? null,
            city: address.city ?? null,
            postal_code: address.postal_code ?? null,
            state: address.state ?? null,
            country: address.country ?? null,
          }
        : null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Order fetch error:", message);
    return NextResponse.json({ error: "Could not fetch order" }, { status: 500 });
  }
}
