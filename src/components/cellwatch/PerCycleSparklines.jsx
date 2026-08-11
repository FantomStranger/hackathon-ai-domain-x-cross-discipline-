import React from "react";
import { Line, LineChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";

function Sparkline({ data, dataKey, color, label, unit }) {
  const vals = data.map((d) => d[dataKey]).filter((v) => v != null);
  if (!vals.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="h-20 flex items-center justify-center text-[10px] text-muted-foreground mt-1">No data</div>
      </div>
    );
  }
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">{min.toFixed(1)} – {max.toFixed(1)}{unit}</div>
      <div className="mt-1" style={{ height: 80 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <YAxis domain={[min, max]} hide />
            <Tooltip
              contentStyle={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 8, fontSize: 10, color: "#e5e5e5" }}
              formatter={(v) => [`${(+v).toFixed(2)}${unit}`, label]}
              labelFormatter={(l) => `Cycle ${l}`}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function PerCycleSparklines({ cycles }) {
  const data = cycles.map((c) => ({
    cycle_id: c.cycle_id,
    temp: c.avg_temperature,
    res: c.internal_resistance_proxy,
    cap: c.capacity_released_ah,
    time: c.charge_time_s,
  }));
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Sparkline data={data} dataKey="temp" color="#f59e0b" label="Avg Temperature" unit="°C" />
      <Sparkline data={data} dataKey="res" color="#a855f7" label="Internal Resistance" unit="mΩ" />
      <Sparkline data={data} dataKey="cap" color="#00f5ff" label="Discharge Capacity" unit="Ah" />
      <Sparkline data={data} dataKey="time" color="#007bff" label="Charge Time" unit="s" />
    </div>
  );
}