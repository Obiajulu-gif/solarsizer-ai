"use client";

import { useState } from "react";
import ApplianceTable from "@/components/ApplianceTable";
import ResultCards from "@/components/ResultCards";
import { CITIES } from "@/lib/cities";
import type { SunResult } from "@/lib/sun";
import type { Appliance } from "@/lib/types";

const DEMO = "1 freezer, 2 standing fans, a TV and 6 bulbs";

export default function Home() {
  const [text, setText] = useState("");
  const [cityId, setCityId] = useState("lagos");
  const [fuel, setFuel] = useState("");
  const [appliances, setAppliances] = useState<Appliance[] | null>(null);
  const [sun, setSun] = useState<SunResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadSun(id: string) {
    const res = await fetch(`/api/sun?city=${id}`);
    setSun(await res.json());
  }

  async function size() {
    setLoading(true);
    setError("");
    try {
      const [parseRes] = await Promise.all([
        fetch("/api/parse", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) }),
        loadSun(cityId),
      ]);
      const data = await parseRes.json();
      if (!parseRes.ok) {
        setError(data.error ?? "Something went wrong");
        setAppliances((a) => a ?? []); // still allow manual entry
      } else {
        setAppliances(data.appliances);
      }
    } catch {
      setError("Network error, check your connection and try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Solar<span className="text-amber">Sizer</span> AI
        </h1>
        <p className="mt-2 text-lg text-muted">Right-size your solar. Kill the generator bill.</p>
      </header>

      <section className="mb-6 space-y-4 rounded-2xl border border-line bg-panel p-5">
        <label className="block">
          <span className="mb-1 block font-semibold">What do you want to power?</span>
          <textarea className="w-full px-3 py-2" rows={3} maxLength={500} placeholder={DEMO}
            value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-semibold">City</span>
            <select className="w-full px-3 py-2" value={cityId}
              onChange={(e) => { setCityId(e.target.value); if (appliances) loadSun(e.target.value); }}>
              {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block font-semibold">Weekly petrol spend (₦)</span>
            <input className="w-full px-3 py-2" type="number" min={0} inputMode="numeric" placeholder="25000"
              value={fuel} onChange={(e) => setFuel(e.target.value)} />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="rounded-xl bg-amber px-5 py-3 font-bold text-[#0b1426] disabled:opacity-50"
            disabled={loading || !text.trim()} onClick={size}>
            {loading ? "Sizing…" : "Size my system"}
          </button>
          <button className="text-sm text-muted underline" onClick={() => { setText(DEMO); setFuel("25000"); }}>
            Try the demo shop
          </button>
        </div>
        {error && <p role="alert" className="text-bad">{error}</p>}
      </section>

      {appliances && (
        <div className="space-y-6">
          <ApplianceTable appliances={appliances} onChange={setAppliances} />
          {sun && <ResultCards appliances={appliances} sunHours={sun.sunHours} source={sun.source} weeklyFuel={Number(fuel)} />}
        </div>
      )}
    </main>
  );
}
