import Link from "next/link";

type OrderResponse = {
  id: string;
  status: string;
  createdAt: string;
  customerEmail?: string | null;
  shipping: {
    name?: string | null;
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    postal?: string | null;
    state?: string | null;
    country?: string | null;
  };
  items: Array<{
    productId?: string;
    name?: string;
    color?: string;
    size?: string;
    unitPrice?: number;
    quantity?: number;
  }>;
};

export default async function OrderPage({ params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Back to shop
          </Link>
          <h1 className="mt-6 text-3xl font-bold">Order not found</h1>
          <p className="mt-2 text-zinc-300">
            No order with id <span className="text-zinc-100">{params.id}</span>.
          </p>
        </div>
      </main>
    );
  }

  const order = (await res.json()) as OrderResponse;
  const subtotal = order.items.reduce(
    (sum, it) => sum + (it.unitPrice ?? 0) * (it.quantity ?? 1),
    0
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to shop
        </Link>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          <p className="text-xs tracking-widest text-zinc-400">ORDER STATUS</p>
          <h1 className="mt-2 text-3xl font-bold">#{order.id}</h1>

          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1">
              Status: <span className="font-semibold">{prettyStatus(order.status)}</span>
            </span>
            <span className="rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1">
              Placed: <span className="font-semibold">{new Date(order.createdAt).toLocaleString()}</span>
            </span>
            {order.customerEmail && (
              <span className="rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1">
                Email: <span className="font-semibold">{order.customerEmail}</span>
              </span>
            )}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-5">
              <h2 className="text-lg font-semibold">Items</h2>
              <div className="mt-4 space-y-3">
                {order.items.map((it, idx) => (
                  <div
                    key={`${it.productId ?? it.name ?? "item"}-${idx}`}
                    className="flex items-start justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold">{it.name ?? it.productId ?? "Product"}</p>
                      <p className="text-sm text-zinc-300">
                        {it.color ? `Color: ${it.color}` : null}
                        {it.size ? ` • Size: ${it.size}` : null}
                        {` • Qty: ${it.quantity ?? 1}`}
                      </p>
                    </div>
                    <p className="text-sm text-zinc-200">
                      {((it.unitPrice ?? 0) * (it.quantity ?? 1)).toFixed(2)} €
                    </p>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 text-sm">
                  <span className="text-zinc-300">Subtotal</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} €</span>
                </div>
                <p className="text-xs text-zinc-500">
                  Shipping/tax is handled in Stripe Checkout.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-zinc-950/30 p-5">
              <h2 className="text-lg font-semibold">Shipping</h2>
              <div className="mt-4 space-y-1 text-sm text-zinc-200">
                <p className="font-semibold">{order.shipping.name ?? "—"}</p>
                <p>{order.shipping.line1 ?? "—"}</p>
                {order.shipping.line2 ? <p>{order.shipping.line2}</p> : null}
                <p>
                  {(order.shipping.postal ?? "—")} {(order.shipping.city ?? "")}
                </p>
                {order.shipping.state ? <p>{order.shipping.state}</p> : null}
                <p>{order.shipping.country ?? "—"}</p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                {statusMessage(order.status)}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function prettyStatus(s: string) {
  const v = (s ?? "").toUpperCase();
  if (v === "PAID") return "Paid ✅";
  if (v === "PROCESSING") return "Processing 🛠️";
  if (v === "SHIPPED") return "Shipped 🚚";
  if (v === "CANCELLED") return "Cancelled";
  return s;
}

function statusMessage(s: string) {
  const v = (s ?? "").toUpperCase();
  if (v === "PAID") return "Payment received. Your order will be processed soon.";
  if (v === "PROCESSING") return "Your order is being prepared for production/shipping.";
  if (v === "SHIPPED") return "Your order has been shipped.";
  return "Order status updated by the shop.";
}
