"use client";

import { useState } from "react";
import { products } from "@/lib/products";

export default function HomePage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleBuy(productId: string) {
    try {
      setLoadingId(productId);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Checkout error", res.status, text);
        alert("Checkout failed: " + text);
        return;
      }

      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Checkout failed. Check console.");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="ebk-shell">
      {/* NAVBAR */}
      <nav className="ebk-nav">
        <div className="ebk-logo">Elite Ball Knowledge</div>
        <div className="ebk-nav-links">
          <button className="ebk-nav-link">Shop</button>
          <button className="ebk-nav-link">About</button>
          <button className="ebk-nav-link ebk-nav-cart">Cart (0)</button>
        </div>
      </nav>

      <main className="ebk-main">
        {/* HERO */}
        <section className="ebk-hero">
          <div className="ebk-hero-text">
            <p className="ebk-pill">New • Street ready • Court inspired</p>
            <h1>Minimal basket streetwear for everyday rotation.</h1>
            <p>
              Hoodies, tees och caps designade för att funka både på planen och
              i skolan. Första droppen är på väg.
            </p>
            <div className="ebk-hero-actions">
              <button className="ebk-button-primary">Shop drop 01</button>
              <button className="ebk-button-ghost">Lookbook</button>
            </div>
          </div>

          <div className="ebk-hero-card">
            <div className="ebk-hero-ghost-item" />
            <div className="ebk-hero-ghost-footer">
              <span>Essential Hoodies</span>
              <span className="ebk-dot" />
              <span>S / M / L / XL</span>
            </div>
          </div>
        </section>

        {/* PRODUCTS GRID */}
        <section className="ebk-products-section">
          <div className="ebk-products-header">
            <h2>Featured pieces</h2>
            <p>Här är placeholders för bilder – lägg in riktiga mockups senare.</p>
          </div>

          <div className="ebk-products-grid">
            {products.map((p) => (
              <article key={p.id} className="ebk-product-card">
                <div
                  className={`ebk-product-image ebk-${p.kind?.toLowerCase() || 'default'}`}
                  aria-hidden="true"
                >
                  <span className="ebk-kind-pill">{p.kind}</span>
                </div>

                <div className="ebk-product-info">
                  <h3>{p.name}</h3>
                  <div className="ebk-product-meta">
                    <span className="ebk-price">{p.price} €</span>
                    <button
                      className="ebk-add-button"
                      onClick={() => handleBuy(p.id)}
                      disabled={loadingId === p.id}
                    >
                      {loadingId === p.id ? "Opening..." : "Buy now"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
