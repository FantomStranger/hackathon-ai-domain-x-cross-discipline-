import React from "react";
import { computeDriverDiagnostics } from "@/lib/batteryUtils";

export default function DriverPanel({ cycles, capacity }) {
  const drivers = computeDriverDiagnostics(cycles, capacity);
  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Degradation Drivers</div>
      <div className="text-sm text-foreground mb-3">What's Aging This Cell</div>
      <div className="space-y-3">
        {drivers.map((d) => (
          <div key={d.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground">{d.label}</span>
              <span className="font-mono text-muted-foreground">{d.status} · z {d.z > 0 ? "+" : ""}{d.z}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-good" style={{ width: `${Math.max(2, d.intensity * 100)}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{d.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}