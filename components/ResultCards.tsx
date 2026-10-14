import { paybackMonths, paybackSeries, priceSystem } from "@/lib/pricing";
import { PANEL_W, sizeSystem } from "@/lib/sizing";
import type { Appliance } from "@/lib/types";
import PaybackChart from "./PaybackChart";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

type Props = { appliances: Appliance[]; sunHours: number; source: "nasa" | "estimate"; weeklyFuel: number };

function Spec({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="py-5 sm:px-6 sm:first:pl-0">
      <div className="font-display text-5xl font-extrabold tracking-tight">
        {value}
        <span className="ml-1.5 text-2xl font-bold text-muted">{unit}</span>
      </div>
      <div className="mt-1 text-lg text-muted">{label}</div>
    </div>
  );
}

export default function ResultCards({ appliances, sunHours, source, weeklyFuel }: Props) {
  const size = sizeSystem(appliances, sunHours);
  const quote = priceSystem(size);
  const payback = paybackMonths(quote.total, weeklyFuel);

  if (size.dailyWh === 0) {
    return <p className="text-lg text-muted">Add at least one appliance below to see your system.</p>;
  }

  const lines = [
    [`Inverter, ${size.inverterKVA} kVA`, quote.inverter],
    [`Battery, ${size.batteryKWh} kWh`, quote.battery],
    [`Panels, ${size.panelCount} × ${PANEL_W} W`, quote.panels],
    ["Installation and cabling", quote.install],
  ] as const;

  return (
    <section className="space-y-6" aria-live="polite">
      <p className="max-w-[40rem] font-display text-[clamp(1.6rem,3vw,2.4rem)] font-bold leading-tight">
        {payback === null
          ? "Enter how much petrol you buy each week to see when solar pays for itself."
          : `Solar pays for itself in about ${payback} months, then the petrol money stays in your pocket.`}
      </p>

      <div className="grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Spec value={String(size.inverterKVA)} unit="kVA" label="Inverter" />
        <Spec value={String(size.batteryKWh)} unit="kWh" label="Battery" />
        <Spec value={String(size.panelCount)} unit={`× ${PANEL_W} W`} label="Solar panels" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-3xl bg-panel p-6 shadow-[0_1px_0_#ead9bd,0_20px_40px_-24px_rgba(120,80,20,0.35)] lg:col-span-2">
          <h3 className="font-display text-xl font-bold">Estimated cost</h3>
          <dl className="mt-4 space-y-2.5">
            {lines.map(([label, amount]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-muted">{label}</dt>
                <dd>{naira.format(amount)}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-xl font-bold">
              <dt>Total</dt>
              <dd>{naira.format(quote.total)}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-3xl bg-panel p-6 shadow-[0_1px_0_#ead9bd,0_20px_40px_-24px_rgba(120,80,20,0.35)] lg:col-span-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-xl font-bold">Money spent over time</h3>
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-gen" /> Generator petrol</span>
              <span className="flex items-center gap-1.5"><span className="h-1 w-5 rounded bg-solar" /> Solar system</span>
            </div>
          </div>
          <PaybackChart series={paybackSeries(quote.total, weeklyFuel)} payback={payback} />
        </div>
      </div>

      <p className="num text-muted">
        You use about {(size.dailyWh / 1000).toFixed(1)} kWh a day, with a peak load of {size.peakW} W. {" "}
        {source === "nasa" ? "NASA POWER" : "Our estimate"} gives your city {sunHours.toFixed(1)} sun hours a day. Prices
        are planning estimates, so get a final quote from a certified installer.
      </p>
    </section>
  );
}
