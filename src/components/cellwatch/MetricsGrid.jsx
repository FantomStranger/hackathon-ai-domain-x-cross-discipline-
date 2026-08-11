import React from "react";

function Tile({ label, value, accent }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 text-lg font-mono tabular-nums leading-none" style={{ color: accent }}>{value}</div>
    </div>
  );
}

export default function MetricsGrid({ prediction, soh, cycleCount }) {
  const inf = (v) => (v == null ? "—" : v >= 9999 ? "∞" : v);
  const fade = prediction ? Math.abs(prediction.decay_rate_per_cycle).toFixed(4) : "0.0000";
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 h-full">
      <Tile label="Current SoH" value={`${(soh || 100).toFixed(1)}%`} accent="hsl(var(--good))" />
      <Tile label="RUL · Best" value={inf(prediction?.best_case_cycles)} accent="hsl(var(--good))" />
      <Tile label="RUL · Likely" value={inf(prediction?.predicted_cycles_remaining)} accent="hsl(var(--chart-4))" />
      <Tile label="RUL · Worst" value={inf(prediction?.worst_case_cycles)} accent="hsl(var(--bad))" />
      <Tile label="Fade Rate" value={`${fade}%`} accent="hsl(var(--info))" />
      <Tile label="Cycles" value={cycleCount || 0} accent="hsl(var(--foreground))" />
    </div>
  );
}