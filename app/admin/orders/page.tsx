import { prisma } from "@/lib/prisma";
import { products } from "@/lib/products";
import Link from "next/link";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { token?: string };
}) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || searchParams?.token !== adminToken) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-50">
        <div className="mx-auto max-w-2xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs tracking-widest text-zinc-400">ADMIN</p>
            <h1 className="mt-2 text-2xl font-bold">Access denied</h1>
            <p className="mt-4 text-sm text-zinc-400">
              Add ADMIN_TOKEN in .env.local and open this page with
              <span className="font-mono"> ?token=YOUR_TOKEN</span>.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs tracking-widest text-zinc-400">ADMIN</p>
            <h1 className="mt-2 text-3xl font-bold">Orders</h1>
            <p className="mt-1 text-sm text-zinc-400">Demo-only overview (no login).</p>
          </div>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
            ← Back to shop
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-5 gap-4 border-b border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-widest text-zinc-400">
            <span>Order ID</span>
            <span>Product</span>
            <span>Color / Size</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-white/10">
            {orders.length === 0 && (
              <div className="px-4 py-6 text-sm text-zinc-400">No orders yet.</div>
            )}
            {orders.map((order) => (
              <div key={order.id} className="grid grid-cols-5 gap-4 px-4 py-4 text-sm">
                <span className="truncate font-mono text-xs text-zinc-300">{order.id}</span>
                <span className="text-zinc-200">
                  {products.find((p) => p.id === order.productId)?.name ?? order.productId ?? "-"}
                </span>
                <span className="text-zinc-300">
                  {(order.color ?? "-") + " / " + (order.size ?? "-")}
                </span>
                <span className="text-zinc-400">
                  {order.createdAt.toLocaleDateString("sv-SE", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
                <span className="text-emerald-300">
                  {order.status ?? order.paymentStatus ?? "paid"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
