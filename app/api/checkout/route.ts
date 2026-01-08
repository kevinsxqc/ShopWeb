import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/products";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    console.log("=== /api/checkout HIT ===");
    console.log("CWD:", process.cwd());
    console.log("Has STRIPE_SECRET_KEY:", Boolean(stripeSecretKey));
    console.log("Has NEXT_PUBLIC_BASE_URL:", Boolean(process.env.NEXT_PUBLIC_BASE_URL));
    console.log("Products count:", products?.length);

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY (env not loaded)" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-06-20" });

    const body = await req.json().catch(() => null);
    console.log("Request body:", body);

    const { productId, size, color } = body ?? {};
    if (typeof productId !== "string") {
      return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
    }

    const product = products.find((p) => p.id === productId);
    console.log("Matched product:", product);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!product.stripePriceId?.startsWith("price_")) {
      return NextResponse.json(
        { error: `Invalid stripePriceId for ${product.id}: ${product.stripePriceId}` },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: product.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/success`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        productId: product.id,
        size: typeof size === "string" ? size : "",
        color: typeof color === "string" ? color : "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error (server):", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
