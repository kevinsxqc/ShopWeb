"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/products";
import { prettyStatus, statusMessage } from "@/lib/orderStatus";

type OrderLineItem = {
  productId: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
};

type OrderInfo = {
  orderId: string | null;
  sessionId: string;
  paymentIntentId: string | null;
  status: string | null;
  paymentStatus: string | null;
  amountTotal: number | null;
  currency: string | null;
  productId: string | null;
  color: string | null;
  size: string | null;
  items: OrderLineItem[];
  customerEmail: string | null;
  shippingAddress: {
    name: string | null;
    line1: string | null;
    line2: string | null;
    city: string | null;
    postal_code: string | null;
    state: string | null;
    country: string | null;
  } | null;
  error?: string;
};

function formatCurrency(amount: number, currency: string | null) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: (currency ?? "EUR").toUpperCase(),
  }).format(amount);
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      if (!sessionId) {
        setData({
          orderId: null,
          sessionId: "",
          paymentIntentId: null,
          status: null,
          paymentStatus: null,
          amountTotal: null,
          currency: null,
          productId: null,
          color: null,
          size: null,
          items: [],
          customerEmail: null,
          shippingAddress: null,
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`);
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [sessionId]);

  const orderItems = data?.items ?? [];
  const totalQuantity = orderItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const totalPriceText =
    typeof data?.amountTotal === "number"
      ? formatCurrency(data.amountTotal / 100, data.currency)
      : "-";

  const statusText = prettyStatus(data?.status ?? data?.paymentStatus);
  const statusNote = statusMessage(data?.status ?? data?.paymentStatus);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs tracking-widest text-zinc-400">RECEIPT</p>
          <h1 className="mt-2 text-3xl font-bold">Thanks for your order</h1>

          {loading && <p className="mt-6 text-zinc-300">Loading order details...</p>}

          {!loading && !sessionId && (
            <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
              Missing session_id in URL. Try buying again so Stripe redirects correctly.
            </div>
          )}

          {!loading && data?.error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {data.error}
            </div>
          )}

          {!loading && data && !data.error && (
            <div className="mt-6 space-y-4 text-sm text-zinc-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-zinc-400">
                      Order summary
                    </div>
                    <div className="mt-2 text-base font-semibold">
                      {totalQuantity > 0 ? `${totalQuantity} item${totalQuantity === 1 ? "" : "s"}` : "Items"}
                    </div>
                    <div className="mt-1 text-xs text-zinc-400">
                      {orderItems.length > 1
                        ? `${orderItems.length} products in this order`
                        : "Product details"}
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold">{totalPriceText}</div>
                </div>

                <div className="mt-4 space-y-3">
                  {orderItems.length > 0 ? (
                    orderItems.map((item, index) => {
                      const product = item.productId
                        ? products.find((p) => p.id === item.productId)
                        : undefined;
                      const lineTotal =
                        product != null
                          ? formatCurrency(product.price * item.quantity, data.currency)
                          : `${item.quantity} pcs`;

                      return (
                        <div
                          key={`${item.productId ?? "item"}-${item.color ?? "no-color"}-${item.size ?? "no-size"}-${index}`}
                          className="flex items-start justify-between gap-4"
                        >
                          <div>
                            <div className="font-semibold">
                              {product?.name ?? item.productId ?? "Product"}
                            </div>
                            <div className="mt-1 text-xs text-zinc-400">
                              Color: {item.color ?? "-"} • Size: {item.size ?? "-"} • Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="text-right text-sm font-medium text-zinc-300">
                            {lineTotal}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-zinc-400">
                      Product details are being prepared. Refresh the page in a moment.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Status</span>
                <span className="text-right">{statusText}</span>
              </div>
              {statusNote ? (
                <div className="mt-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-200">
                  {statusNote}
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Order ID</span>
                <span className="text-right font-mono text-xs">
                  {data.orderId ?? data.sessionId}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Session</span>
                <span className="text-right font-mono text-xs">{data.sessionId}</span>
              </div>
            </div>
          )}

          {!loading && data && !data.error && (
            <p className="mt-6 text-sm text-zinc-300">
              You&apos;ll receive a confirmation email{data.customerEmail ? ` at ${data.customerEmail}` : ""}.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Continue shopping
            </Link>
            {data?.orderId ? (
              <Link
                href={`/order/${data.orderId}`}
                className="rounded-2xl border border-white/10 bg-zinc-950/30 px-4 py-3 text-sm hover:bg-white/5"
              >
                Track order
              </Link>
            ) : (
              <button
                disabled
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 opacity-60"
              >
                Track order
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
