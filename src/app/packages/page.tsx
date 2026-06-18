"use client";

import { useState } from "react";
import { PACKAGES, type PackageKey } from "@/lib/packages";
import { Nav } from "@/components/sections/Nav";
import { Footer } from "@/components/sections/Footer";

const packageKeys: PackageKey[] = ["landing", "standard", "premium"];

export default function PackagesPage() {
  const [selected, setSelected] = useState<PackageKey | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!selected || !name.trim() || !email.trim()) {
      setError("Please fill in your name, email, and choose a package.");
      return;
    }
    const pkg = PACKAGES[selected];
    const subject = `New build enquiry — ${pkg.name} (£${pkg.price.toLocaleString()})`;
    const body = [
      `Package: ${pkg.name} — £${pkg.price.toLocaleString()} (£${pkg.deposit.toLocaleString()} deposit)`,
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      `Business: ${business.trim() || "—"}`,
      ``,
      `Project details:`,
      details.trim() || "—",
    ].join("\n");
    window.location.href = `mailto:sam@webflowoutreach.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }


  return (
    <>
      <Nav />
      <main className="min-h-svh bg-bg pt-32 pb-24 px-8">
        <div className="max-w-5xl mx-auto">

          <div className="mb-20">
            <p className="font-display text-xs font-medium tracking-[0.2em] text-text-sec uppercase mb-6">
              Begin your build
            </p>
            <h1 className="font-display font-light text-4xl md:text-5xl text-text leading-tight max-w-2xl">
              Choose your package.
            </h1>
            <p className="font-sans text-text-sec text-base leading-relaxed max-w-md mt-6">
              Select your package, tell us about your business, and we&apos;ll be in touch within 24 hours.
              A 50% deposit secures your spot — the rest is due when you approve the finished site.
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
                      £{pkg.price.toLocaleString()}
                    </p>
                    <p className="font-sans text-xs text-accent font-medium">
                      £{pkg.deposit.toLocaleString()} deposit to start
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

          {/* Form */}
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

              <div>
                <label className="font-sans text-xs tracking-wide text-text-sec uppercase block mb-2">
                  Business name
                </label>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Acme Ltd"
                  className="w-full bg-surface border border-border px-4 py-3 font-sans text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-200"
                />
              </div>

              <div>
                <label className="font-sans text-xs tracking-wide text-text-sec uppercase block mb-2">
                  Tell us about your project
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="What does your business do, what do you need, and when do you need it?"
                  rows={4}
                  className="w-full bg-surface border border-border px-4 py-3 font-sans text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors duration-200 resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="font-sans text-sm text-red-400 mb-6">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full font-display text-sm font-medium tracking-wide uppercase px-8 py-4 bg-accent text-bg hover:bg-accent-hover transition-colors duration-200"
              style={{ borderRadius: 0 }}
            >
              {`Commit to your build${selected ? ` — ${PACKAGES[selected].name} (£${PACKAGES[selected].price.toLocaleString()})` : ""}`}
            </button>

            <p className="font-sans text-xs text-text-muted mt-4 leading-relaxed">
              This opens your email client with everything pre-filled. We&apos;ll reply within 24 hours with next steps.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
