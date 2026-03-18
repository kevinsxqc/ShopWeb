import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOrderStatus } from "@/lib/orderStatus";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { id?: string } }
) {
  const adminToken = process.env.ADMIN_TOKEN;
  const token = req.nextUrl.searchParams.get("token");

  if (!adminToken || token !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const status = body?.status;
  const bodyOrderId = body?.orderId;
  const queryOrderId = req.nextUrl.searchParams.get("id");

  const orderId = params?.id || bodyOrderId || queryOrderId;

  if (!orderId) {
    console.warn("Missing order id for status update", { params, body, query: req.nextUrl.searchParams.toString() });
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  if (!isOrderStatus(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ status: updated.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Failed to update status:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
