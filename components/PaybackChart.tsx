import type { PaybackPoint } from "@/lib/pricing";

const W = 640, H = 260, PAD = 40;

export default function PaybackChart({ series, payback }: { series: PaybackPoint[]; payback: number | null }) {
  const maxM = series[series.length - 1].month;
  const maxY = Math.max(...series.map((p) => Math.max(p.generator, p.solar)), 1);
  const x = (m: number) => PAD + (m / maxM) * (W - PAD * 1.5);
  const y = (v: number) => H - PAD - (v / maxY) * (H - PAD * 1.6);
  const line = (key: "generator" | "solar") => series.map((p) => `${x(p.month)},${y(p[key])}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
      aria-label={payback ? `Solar pays back in month ${payback}` : "Payback chart"}>
      <line x1={PAD} y1={H - PAD} x2={W - PAD / 2} y2={H - PAD} stroke="#33477f" strokeWidth={2} />
      <line x1={PAD} y1={PAD / 2} x2={PAD} y2={H - PAD} stroke="#33477f" strokeWidth={2} />
      <text x={W - PAD / 2} y={H - 10} fill="#9aa7bd" fontSize={13} textAnchor="end">months →</text>
      <text x={PAD + 6} y={PAD / 2 + 4} fill="#9aa7bd" fontSize={13}>₦ spent</text>
      <polyline points={line("solar")} fill="none" stroke="#3ddc97" strokeWidth={3} />
      <polyline points={line("generator")} fill="none" stroke="#ff5a5f" strokeWidth={3} />
      {payback !== null && (
        <g>
          <line x1={x(payback)} y1={PAD / 2} x2={x(payback)} y2={H - PAD} stroke="#ffb020" strokeWidth={2} strokeDasharray="6 5" />
          <text x={x(payback) + 6} y={PAD + 8} fill="#ffb020" fontSize={14} fontWeight={700}>payback</text>
        </g>
      )}
    </svg>
  );
}
