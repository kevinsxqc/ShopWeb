import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type CartItem = {
  productId: string;
  color: string;
  size: string;
  quantity: number;
};

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

    const body = await req.json().catch(() => null);
    const { items } = body ?? {};

    // Support both old single-item and new multi-item format
    let cartItems: CartItem[] = [];
    if (Array.isArray(items) && items.length > 0) {
      cartItems = items;
    } else if (body?.productId) {
      // Fallback for single-item checkout
      cartItems = [
        {
          productId: body.productId,
          color: body.color ?? "",
          size: body.size ?? "",
          quantity: 1,
        },
      ];
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Validate + build line_items
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const it of cartItems) {
      if (
        !it ||
        typeof it.productId !== "string" ||
        typeof it.color !== "string" ||
        typeof it.size !== "string"
      ) {
        return NextResponse.json({ error: "Invalid cart item" }, { status: 400 });
      }

      const qty = Math.max(1, Math.min(99, Number(it.quantity || 1)));
      const p = products.find((x) => x.id === it.productId);

      if (!p) {
        return NextResponse.json(
          { error: `Product not found: ${it.productId}` },
          { status: 404 }
        );
      }

      if (!p.stripePriceId?.startsWith("price_")) {
        return NextResponse.json(
          { error: `Invalid price ID for ${p.id}` },
          { status: 500 }
        );
      }

      // Validate color + size exist
      const hasColor = p.variants.some((v) => v.colorValue === it.color);
      const hasSize = p.sizes.includes(it.size);
      if (!hasColor || !hasSize) {
        return NextResponse.json({ error: "Invalid variant/size" }, { status: 400 });
      }

      line_items.push({
        price: p.stripePriceId,
        quantity: qty,
      });
    }

    // Save draft to DB
    const draft = await prisma.orderDraft.create({
      data: {
        items: JSON.stringify(cartItems),
        status: "PENDING_PAYMENT",
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const primaryItem = cartItems[0];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      shipping_address_collection: {
        allowed_countries: ["SE", "FI"],
      },
      billing_address_collection: "required",
      metadata: {
        draftId: draft.id,
        productId: primaryItem?.productId,
        color: primaryItem?.color,
        size: primaryItem?.size,
      },
    });

    // Update draft with session ID
    await prisma.orderDraft.update({
      where: { id: draft.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
