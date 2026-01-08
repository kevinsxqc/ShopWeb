"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { products } from "@/lib/products";

function KindBadge({ kind }: { kind: string }) {
  const cls =
    kind === "Hoodie"
      ? "bg-purple-500/15 text-purple-200 border-purple-400/20"
      : kind === "Tee"
      ? "bg-cyan-500/15 text-cyan-200 border-cyan-400/20"
      : "bg-amber-500/15 text-amber-200 border-amber-400/20";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {kind}
    </span>
  );
}

export default function HomePage() {
  const dropName = useMemo(() => {
    // kan vara statiskt eller dynamiskt senare
    return "DROP 001 — NIGHT COURT";
  }, []);

  return (
    <main className="ebk-grain min-h-screen bg-zinc-950 text-zinc-50">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />
        <div className="absolute top-40 right-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[-160px] left-[-120px] h-[480px] w-[480px] rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      {/* Top bar */}
      <header className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex items-center justify-between">
          <div className="text-sm tracking-widest text-zinc-300">
            ELITE BALL <span className="text-zinc-500">KNOWLEDGE</span>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.75)]" />
              Drop live
            </span>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
              Secure checkout • Stripe
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.35),transparent_45%),radial-gradient(circle_at_90%_30%,rgba(34,211,238,0.25),transparent_45%)]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {dropName}
              </span>
              <span className="text-xs text-zinc-400">
                Small drops • Limited vibes • No refunds on aura
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Streetwear for hoop heads.
              <span className="block text-zinc-300">Dark. Minimal. Loud energy.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-300">
              Premium pieces inspired by the game. Built for late-night runs, tunnel fits,
              and court-side confidence.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#shop"
                className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-zinc-200"
              >
                Shop the drop
              </a>
              <span className="text-xs text-zinc-400">
                Tip: click a product → Stripe Checkout
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="shop" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured pieces</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Mockups now. Printful/Printify automation later.
            </p>
          </div>
          <div className="text-xs text-zinc-400 hidden sm:block">
            Prices set by you (in Stripe) • Payments handled by Stripe
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link href={`/product/${p.id}`} key={p.id} className="block">
              <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/20">
                <div className="relative aspect-4/3 w-full overflow-hidden">
                  <Image
                    src={p.variants[0]?.images[0] ?? ""}
                    alt={p.name}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-zinc-950/10 to-transparent" />

                  <div className="absolute left-4 top-4">
                    <KindBadge kind={p.kind} />
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="rounded-full border border-white/10 bg-zinc-950/50 px-3 py-1 text-sm font-semibold">
                      {p.price} €
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-zinc-400">
                    Limited drop. Secure checkout. Fast vibes.
                  </p>

                  <div className="mt-4 w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-2 text-sm font-semibold text-zinc-100 text-center">
                    View details
                  </div>

                  <p className="mt-2 text-xs text-zinc-500">
                    Ships via PoD later • Demo checkout now
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto max-w-6xl px-6 text-xs text-zinc-500">
          © {new Date().getFullYear()} Elite Ball Knowledge • Built with Next.js + Stripe
        </div>
      </footer>
    </main>
  );
}
