import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { CHEMISTRIES } from "@/lib/batteryUtils";
import SystemHealthCard from "./SystemHealthCard";
import MetricsGrid from "./MetricsGrid";
import SoHForecastChart from "./SoHForecastChart";
import DriverPanel from "./DriverPanel";
import WaveformChart from "./WaveformChart";
import PerCycleSparklines from "./PerCycleSparklines";
import AssumptionsDisclaimer from "./AssumptionsDisclaimer";

export default function CellDashboard({ battery, prediction }) {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const cyc = await base44.entities.CycleTelemetry.filter({ battery_id: battery.id }, "cycle_id", 500);
        if (alive) setCycles(cyc.sort((a, b) => a.cycle_id - b.cycle_id));
      } catch {
        if (alive) setCycles([]);
      }
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [battery.id]);

  const refLife = battery.reference_cycle_life || CHEMISTRIES[battery.chemistry]?.refCycles || "—";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground shrink-0">Selected Cell</span>
          <span className="font-mono text-sm text-foreground truncate">{battery.name}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground font-mono">{battery.id.slice(-6)}</span>
          <span className="text-muted-foreground hidden sm:inline">·</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">{battery.chemistry} · {battery.capacity_ah}Ah</span>
        </div>
        <div className="text-xs text-muted-foreground font-mono shrink-0">reference cycle-life · {refLife}</div>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading cell telemetry…</div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1"><SystemHealthCard status={battery.status} /></div>
              <div className="lg:col-span-2"><MetricsGrid prediction={prediction} soh={battery.current_soh} cycleCount={battery.cycle_count} /></div>
            </div>
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2"><SoHForecastChart cycles={cycles} prediction={prediction} /></div>
              <div className="lg:col-span-1"><DriverPanel cycles={cycles} capacity={battery.capacity_ah} /></div>
            </div>
            <WaveformChart cycle={cycles[cycles.length - 1]} nominal={battery.nominal_voltage} />
            <PerCycleSparklines cycles={cycles} />
            <AssumptionsDisclaimer />
            <div className="text-center text-[10px] font-mono text-muted-foreground pt-2">
              CELLWATCH · MVP · Statistical inference from limited telemetry · Never bypass or override BMS safety systems.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
