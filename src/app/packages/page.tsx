"use client";

import { useState } from "react";
import { PACKAGES, type PackageKey } from "@/lib/stripe";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";

const packageKeys: PackageKey[] = ["landing", "standard", "premium"];

export default function PackagesPage() {
  const [selected, setSelected] = useState<PackageKey | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (!selected || !name.trim() || !email.trim()) {
      setError("Please fill in your name, email, and choose a package.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ package: selected, name: name.trim(), email: email.trim() }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-svh bg-bg pt-32 pb-24 px-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="mb-20">
            <p className="font-display text-xs font-medium tracking-[0.2em] text-text-sec uppercase mb-6">
              Begin your build
            </p>
            <h1 className="font-display font-light text-4xl md:text-5xl text-text leading-tight max-w-2xl">
              Choose your package.
            </h1>
            <p className="font-sans text-text-sec text-base leading-relaxed max-w-md mt-6">
              Pay a 50% deposit now to get started. The remaining balance is charged
              automatically once you&apos;ve approved the finished site - no second card entry needed.
            </p>
          </div>

          {/* Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            {packageKeys.map((key) => {
              const pkg = PACKAGES[key];
              const isSelected = selected === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`bg-surface-el p-8 flex flex-col h-full border text-left transition-colors duration-200 ${
                    isSelected ? "border-accent" : "border-border hover:border-text-muted"
                  }`}
                >
                  <div className="mb-6">
                    <p className="font-display text-xs font-medium tracking-[0.18em] text-text-sec uppercase mb-3">
                      {pkg.name}
                    </p>
                    <p className="font-display font-light text-2xl text-text mb-1">
                      from £{pkg.price.toLocaleString()}
                    </p>
                    <p className="font-sans text-xs text-accent font-medium">
                      £{pkg.deposit.toLocaleString()} deposit today
                    </p>
                  </div>

                  <p className="font-sans text-sm text-text-sec leading-relaxed mb-8">
                    {pkg.description}
                  </p>

                  <ul className="mt-auto space-y-3">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="text-accent mt-0.5 text-xs">-</span>
                        <span className="font-sans text-sm text-text-sec">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isSelected && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="font-sans text-xs text-accent font-medium tracking-wide uppercase">
                        Selected
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Checkout form */}
          <div className="max-w-md border-t border-border pt-12">
            <p className="font-display text-sm font-medium text-text mb-8">
              Your details
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="font-sans text-xs tracking-wide text-text-sec uppercase block mb-2">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full bg-surface border border-border px-4 py-3 font-sans text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-200"
                />
              </div>

              <div>
                <label className="font-sans text-xs tracking-wide text-text-sec uppercase block mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@yourbusiness.com"
                  className="w-full bg-surface border border-border px-4 py-3 font-sans text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-200"
                />
              </div>
            </div>

            {error && (
              <p className="font-sans text-sm text-red-400 mb-6">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full font-display text-sm font-medium tracking-wide uppercase px-8 py-4 bg-accent text-bg hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-200"
              style={{ borderRadius: 0 }}
            >
              {loading ? "Redirecting to payment..." : `Pay deposit${selected ? ` — £${PACKAGES[selected].deposit.toLocaleString()}` : ""}`}
            </button>

            <p className="font-sans text-xs text-text-muted mt-4 leading-relaxed">
              Payments are processed securely by Stripe. Your card is saved to charge
              the remaining 50% when your site is complete and approved. You can cancel
              any time before the build begins.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
