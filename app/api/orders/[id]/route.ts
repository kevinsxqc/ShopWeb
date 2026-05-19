import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = safeParseJson(order.itemsJson);

    return NextResponse.json({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      customerEmail: order.customerEmail,
      shipping: {
        name: order.shippingName,
        line1: order.shippingLine1,
        line2: order.shippingLine2,
        city: order.shippingCity,
        postal: order.shippingPostal,
        state: order.shippingState,
        country: order.shippingCountry,
      },
      items,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET order error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function safeParseJson(value: unknown) {
  try {
    if (!value) return [];
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch {
    return [];
  }
}
