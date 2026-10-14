"use client";

import type { Appliance } from "@/lib/types";

type Props = { appliances: Appliance[]; onChange: (next: Appliance[]) => void };

const num = (v: string, min: number, max: number, int = false) => {
  const n = int ? Math.round(Number(v)) : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

export default function ApplianceTable({ appliances, onChange }: Props) {
  const update = (i: number, patch: Partial<Appliance>) =>
    onChange(appliances.map((a, j) => (j === i ? { ...a, ...patch } : a)));

  return (
    <div className="rounded-3xl bg-panel p-6 shadow-[0_1px_0_#ead9bd,0_20px_40px_-24px_rgba(120,80,20,0.35)]">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-xl font-bold">What the AI read from your list</h3>
        <span className="text-muted">Change any number and the results above update</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-1 font-medium">Appliance</th>
              <th className="font-medium">Watts</th>
              <th className="font-medium">Hours/day</th>
              <th className="font-medium">Qty</th>
              <th className="font-medium">Motor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {appliances.map((a, i) => (
              <tr key={i}>
                <td className="py-1 pr-2">
                  <input aria-label="Appliance name" className="w-full px-2 py-1" value={a.name} maxLength={60}
                    onChange={(e) => update(i, { name: e.target.value })} />
                </td>
                <td className="pr-2">
                  <input aria-label="Watts" type="number" min={1} max={5000} className="w-20 px-2 py-1" value={a.watts}
                    onChange={(e) => update(i, { watts: num(e.target.value, 1, 5000) })} />
                </td>
                <td className="pr-2">
                  <input aria-label="Hours per day" type="number" min={0} max={24} step={0.5} className="w-20 px-2 py-1" value={a.hours}
                    onChange={(e) => update(i, { hours: num(e.target.value, 0, 24) })} />
                </td>
                <td className="pr-2">
                  <input aria-label="Quantity" type="number" min={1} max={50} className="w-16 px-2 py-1" value={a.qty}
                    onChange={(e) => update(i, { qty: num(e.target.value, 1, 50, true) })} />
                </td>
                <td className="pr-2 text-center">
                  <input aria-label="Has a motor" type="checkbox" checked={a.motor} onChange={(e) => update(i, { motor: e.target.checked })} />
                </td>
                <td>
                  <button aria-label={`Remove ${a.name}`} className="rounded-full px-2.5 py-1 text-bad hover:bg-bad/10" onClick={() => onChange(appliances.filter((_, j) => j !== i))}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="mt-4 font-bold text-amber underline-offset-4 hover:underline"
        onClick={() => onChange([...appliances, { name: "New appliance", watts: 100, hours: 4, qty: 1, motor: false }])}>
        + Add appliance
      </button>
    </div>
  );
}
