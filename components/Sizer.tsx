"use client";

import { useState, type ReactNode } from "react";
import ApplianceTable from "@/components/ApplianceTable";
import ResultCards from "@/components/ResultCards";
import { CITIES } from "@/lib/cities";
import type { SunResult } from "@/lib/sun";
import type { Appliance } from "@/lib/types";

const DEMO = "1 freezer, 2 standing fans, a TV and 6 bulbs";

export default function Sizer({ intro }: { intro: ReactNode }) {
  const [text, setText] = useState("");
  const [cityId, setCityId] = useState("lagos");
  const [fuel, setFuel] = useState("");
  const [appliances, setAppliances] = useState<Appliance[] | null>(null);
  const [sun, setSun] = useState<SunResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSun(id: string) {
    const res = await fetch(`/api/sun?city=${id}`);
    if (res.ok) setSun(await res.json());
  }

  async function size() {
    setLoading(true);
    setError("");
    try {
      const [parseRes] = await Promise.all([
        fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }),
        loadSun(cityId),
      ]);
      const data = await parseRes.json();
      if (!parseRes.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        setAppliances((a) => a ?? []); // still allow manual entry
      } else {
        setAppliances(data.appliances);
        requestAnimationFrame(() =>
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    } catch {
      setError("No connection. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:pt-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">{intro}</div>
        <div className="lg:col-span-6">
          <div className="rounded-3xl border border-line/80 bg-panel/90 p-5 shadow-[0_30px_80px_-30px_rgba(255,122,26,0.35)] backdrop-blur sm:p-6">
            <label className="block">
              <span className="mb-2 block text-lg font-semibold">
                What do you want to power?
              </span>
              <textarea
                className="w-full px-4 py-3 text-base"
                rows={3}
                maxLength={500}
                placeholder={DEMO}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </label>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block font-semibold">City</span>
                <select
                  className="w-full px-3 py-2.5"
                  value={cityId}
                  onChange={(e) => {
                    setCityId(e.target.value);
                    if (appliances) loadSun(e.target.value);
                  }}
                >
                  {CITIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-semibold">
                  Petrol you buy each week (₦)
                </span>
                <input
                  className="w-full px-3 py-2.5"
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="25000"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                />
              </label>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button
                className="rounded-full bg-amber px-6 py-3 text-lg font-bold text-night transition-colors hover:bg-[#ffc24d] disabled:opacity-50"
                disabled={loading || !text.trim()}
                onClick={size}
              >
                {loading ? "Reading your list…" : "Size my system"}
              </button>
              <button
                className="text-muted underline decoration-line underline-offset-4 hover:text-foreground"
                onClick={() => {
                  setText(DEMO);
                  setFuel("25000");
                }}
              >
                Fill in an example shop
              </button>
            </div>
            {loading && (
              <p className="mt-3 text-sm text-muted">
                The AI is reading your list. This takes about 10 seconds.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-3 text-bad">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {appliances && (
        <section id="results" className="mt-16 scroll-mt-6 space-y-6">
          <h2 className="font-display text-3xl font-bold">Your system</h2>
          <ApplianceTable appliances={appliances} onChange={setAppliances} />
          {sun && (
            <ResultCards
              appliances={appliances}
              sunHours={sun.sunHours}
              source={sun.source}
              weeklyFuel={Number(fuel)}
            />
          )}
        </section>
      )}
    </section>
  );
}
