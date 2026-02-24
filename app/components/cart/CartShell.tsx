"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { products } from "@/lib/products";
import { useCart } from "./CartContext";

export function CartShell() {
  const { items, isOpen, toggle, close, removeItem, updateQty, clear } = useCart();
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const enriched = useMemo(() => {
    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const variant = product?.variants.find((v) => v.colorValue === item.color) ??
        product?.variants[0];
      return {
        key: `${item.productId}_${item.color}_${item.size}`,
        item,
        product,
        variant,
        image: variant?.images?.[0] ?? "",
        colorLabel: variant?.colorLabel ?? item.color,
        price: product?.price ?? 0,
      };
    });
  }, [items]);

  const subtotal = enriched.reduce((sum, row) => sum + row.price * row.item.quantity, 0);

  async function checkoutAll() {
    try {
      setLoadingKey("all");
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <>
      <button
        onClick={toggle}
        className="fixed bottom-6 right-6 z-40 rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-lg backdrop-blur hover:bg-white/20"
      >
        Cart ({totalItems})
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-white/10 bg-zinc-950/95 p-6 text-zinc-50 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Your cart</h2>
              <button onClick={close} className="text-sm text-zinc-400 hover:text-zinc-200">
                Close
              </button>
            </div>

            {items.length === 0 && (
              <div className="mt-10 text-sm text-zinc-400">Your cart is empty.</div>
            )}

            {items.length > 0 && (
              <div className="mt-6 space-y-4">
                {enriched.map((row) => (
                  <div key={row.key} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
                      {row.image ? (
                        <Image src={row.image} alt={row.product?.name ?? "Item"} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {row.product?.name ?? row.item.productId}
                      </div>
                      <div className="mt-1 text-xs text-zinc-400">
                        {row.colorLabel} • {row.item.size}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => updateQty(row.item, row.item.quantity - 1)}
                          className="h-6 w-6 rounded-full border border-white/10 text-xs text-zinc-300"
                        >
                          −
                        </button>
                        <span className="text-xs">{row.item.quantity}</span>
                        <button
                          onClick={() => updateQty(row.item, row.item.quantity + 1)}
                          className="h-6 w-6 rounded-full border border-white/10 text-xs text-zinc-300"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(row.item)}
                          className="ml-auto text-xs text-zinc-400 hover:text-zinc-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right text-sm font-semibold">{row.price} €</div>
                  </div>
                ))}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-semibold">{subtotal} €</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={checkoutAll}
                    disabled={loadingKey === "all"}
                    className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
                  >
                    {loadingKey === "all" ? "Processing..." : `Checkout all (${items.length})`}
                  </button>
                  <button
                    onClick={clear}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-white/10"
                  >
                    Clear cart
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500">
                  All items will be checked out together.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
