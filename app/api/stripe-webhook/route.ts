import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { products } from "@/lib/products";

export const runtime = "nodejs";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-11-17.clover",
});

type CartItem = {
  productId: string;
  color: string;
  size: string;
  quantity: number;
};

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

export async function POST(req: NextRequest) {
  try {
    if (!stripeSecretKey || !webhookSecret) {
      console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
      return new NextResponse("Server misconfigured", { status: 500 });
    }

    const sig = req.headers.get("stripe-signature");
    if (!sig) return new NextResponse("Missing stripe-signature", { status: 400 });

    const rawBody = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    // ✅ Always ACK quickly for events we don't care about
    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Only save when paid
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const draftId = session.metadata?.draftId;
    if (!draftId) {
      console.warn("No draftId in session metadata, cannot finalize order");
      return NextResponse.json({ received: true });
    }

    const draft = await prisma.orderDraft.findUnique({
      where: { id: draftId },
    });

    if (!draft) {
      console.warn("OrderDraft not found:", draftId);
      return NextResponse.json({ received: true });
    }

    if (draft.status === "PAID") {
      console.log("Draft already paid, skipping duplicate:", draftId);
      return NextResponse.json({ received: true });
    }

    // Parse items from draft
    let items: CartItem[] = [];
    try {
      items = JSON.parse(draft.items);
    } catch {
      console.error("Failed to parse draft items");
      return NextResponse.json({ received: true });
    }

    // Validate + compute totals server-side
    for (const it of items) {
      const p = products.find((x) => x.id === it.productId);
      if (!p) {
        console.error("Product not found during finalization:", it.productId);
        return NextResponse.json({ received: true });
      }
    }

    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : null;
    const primaryItem = items[0] ?? null;
    const sessionWithShipping = session as SessionWithShippingDetails;
    const { address, name } = resolveAddress(sessionWithShipping);
    const customerEmail = session.customer_details?.email ?? null;

    // ✅ Create order record
    try {
      await prisma.order.create({
        data: {
          stripeSessionId: session.id,
          paymentIntentId,
          status: session.payment_status ?? null,
          paymentStatus: session.payment_status ?? null,
          amountTotal: session.amount_total ?? null,
          currency: session.currency ?? null,
          draftId,
          productId: primaryItem?.productId ?? null,
          color: primaryItem?.color ?? null,
          size: primaryItem?.size ?? null,
          customerEmail,
          shippingName: name,
          shippingLine1: address?.line1 ?? null,
          shippingLine2: address?.line2 ?? null,
          shippingCity: address?.city ?? null,
          shippingPostal: address?.postal_code ?? null,
          shippingState: address?.state ?? null,
          shippingCountry: address?.country ?? null,
          itemsJson: JSON.stringify(items),
        },
      });

      await prisma.$executeRaw`
        UPDATE "Order"
        SET "checkoutSessionId" = ${session.id}
        WHERE "stripeSessionId" = ${session.id}
      `;

      // Mark draft as paid
      await prisma.orderDraft.update({
        where: { id: draftId },
        data: { status: "PAID" },
      });

      console.log("✅ Order finalized:", session.id);
    } catch (dbErr: unknown) {
      const message = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error("❌ Order creation failed:", message);
      // Still ACK 200 so Stripe doesn't keep retrying
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ Webhook crashed:", message);
    return new NextResponse("Webhook crashed", { status: 500 });
  }
}
