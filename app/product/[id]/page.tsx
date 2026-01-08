"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { products } from "@/lib/products";

export default function ProductPage() {
  const params = useParams<{ id: string }>();

  const product = useMemo(
    () => products.find((p) => p.id === params.id),
    [params.id]
  );

  // Use lazy initializer to avoid accessing product when it's undefined
  const [variantValue, setVariantValue] = useState(() => product?.variants[0]?.colorValue ?? "");
  const [size, setSize] = useState(() => product?.sizes[0] ?? "M");
  const [imgIndex, setImgIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variant = useMemo(
    () => product?.variants.find((v) => v.colorValue === variantValue) ?? product?.variants[0],
    [product?.variants, variantValue]
  );

  // Reset gallery to first image whenever color changes
  useEffect(() => {
    setImgIndex(0);
  }, [variantValue]);

  const images = variant?.images ?? [];
  const mainImage = images[Math.min(imgIndex, images.length - 1)];

  if (!product) return notFound();

  async function buy() {
    if (!product || !variant) return;

    try {
      setError(null);
      setLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          color: variant.colorValue,
          size,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Checkout failed");
        return;
      }

      if (data?.url) window.location.href = data.url;
      else setError("No checkout URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function prev() {
    if (images.length === 0) return;
    setImgIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }
  function next() {
    if (images.length === 0) return;
    setImgIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to shop
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* Gallery */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40">
              {mainImage ? (
                <Image src={mainImage} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-zinc-400">
                  No images found for this color
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm hover:bg-white/10"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-zinc-950/50 px-3 py-2 text-sm hover:bg-white/10"
                    aria-label="Next image"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setImgIndex(i)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-xl border transition ${
                      i === imgIndex ? "border-white/30" : "border-white/10 hover:border-white/20"
                    }`}
                    aria-label={`Select image ${i + 1}`}
                  >
                    <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="text-xs tracking-widest text-zinc-400">DROP ITEM</p>
            <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
            <p className="mt-2 text-zinc-300">{product.price} €</p>

            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="mt-6">
              <p className="text-sm text-zinc-300">Color</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.colorValue}
                    onClick={() => setVariantValue(v.colorValue)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      variantValue === v.colorValue
                        ? "border-white/30 bg-white/10"
                        : "border-white/10 bg-zinc-950/30 hover:bg-white/5"
                    }`}
                  >
                    {v.colorLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-zinc-300">Size</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      size === s
                        ? "border-white/30 bg-white/10"
                        : "border-white/10 bg-zinc-950/30 hover:bg-white/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={buy}
              disabled={loading}
              className="mt-8 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-zinc-200 disabled:opacity-60"
            >
              {loading ? "Redirecting..." : "Buy now"}
            </button>

            <p className="mt-3 text-xs text-zinc-500">
              Color & size are sent to Stripe as metadata (for PoD automation later).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
