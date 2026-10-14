import { paybackMonths, paybackSeries, priceSystem } from "@/lib/pricing";
import { PANEL_W, sizeSystem } from "@/lib/sizing";
import type { Appliance } from "@/lib/types";
import PaybackChart from "./PaybackChart";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

type Props = { appliances: Appliance[]; sunHours: number; source: "nasa" | "estimate"; weeklyFuel: number };

function Card({ label, value, accent = "text-amber" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-1 font-mono text-2xl font-bold sm:text-3xl ${accent}`}>{value}</div>
    </div>
  );
}

export default function ResultCards({ appliances, sunHours, source, weeklyFuel }: Props) {
  const size = sizeSystem(appliances, sunHours);
  const quote = priceSystem(size);
  const payback = paybackMonths(quote.total, weeklyFuel);

  return (
    <section className="space-y-4" aria-live="polite">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card label="Inverter" value={`${size.inverterKVA} kVA`} />
        <Card label="Battery" value={`${size.batteryKWh} kWh`} />
        <Card label="Panels" value={`${size.panelCount} × ${PANEL_W} W`} />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card label="Estimated total cost" value={naira.format(quote.total)} accent="text-foreground" />
        <Card label="Beats your generator in"
          value={payback === null ? "Enter your fuel spend to see payback" : `${payback} months`}
          accent={payback === null ? "text-muted !text-base" : "text-ok"} />
      </div>
      <div className="rounded-2xl border border-line bg-panel p-4">
        <div className="mb-2 flex flex-wrap gap-4 text-sm">
          <span><span className="text-bad">━━</span> Generator fuel</span>
          <span><span className="text-ok">━━</span> Solar system</span>
        </div>
        <PaybackChart series={paybackSeries(quote.total, weeklyFuel)} payback={payback} />
      </div>
      <p className="text-sm text-muted">
        Daily energy {(size.dailyWh / 1000).toFixed(2)} kWh · peak load {size.peakW} W · sun hours {sunHours.toFixed(1)}{" "}
        ({source === "nasa" ? "NASA POWER" : "estimate"}). Prices are estimates. Get a quote from a certified installer.
      </p>
    </section>
  );
}
