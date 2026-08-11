import React from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";

export default function SoHForecastChart({ cycles, prediction }) {
  const history = cycles.map((c) => ({ cycle: c.cycle_id, sohHist: c.soh, sohFc: null }));
  const last = cycles.length ? { cycle: cycles[cycles.length - 1].cycle_id, soh: cycles[cycles.length - 1].soh } : null;

  const fc = [];
  if (prediction && last && prediction.decay_rate_per_cycle < -0.005) {
    fc.push({ cycle: last.cycle, sohHist: null, sohFc: last.soh });
    const step = Math.max(5, Math.round((last.cycle || 50) / 12));
    let cyc = last.cycle;
    for (let k = 1; k <= 30; k++) {
      cyc += step;
      const s = last.soh + prediction.decay_rate_per_cycle * (cyc - last.cycle);
      if (s < 65) break;
      fc.push({ cycle: cyc, sohHist: null, sohFc: +s.toFixed(2) });
    }
  }

  const data = [...history, ...fc];

  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">State of Health · Trend & Forecast</div>
      <div className="mt-3" style={{ height: 240 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
              <defs>
                <linearGradient id="sohFillDk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--good))" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="hsl(var(--good))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis dataKey="cycle" tick={{ fontSize: 10, fill: "#666" }} stroke="#262626" />
              <YAxis domain={[60, 105]} ticks={[70, 80, 90, 100]} tick={{ fontSize: 10, fill: "#666" }} stroke="#262626" />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: 8, fontSize: 11, color: "#e5e5e5" }}
                labelStyle={{ color: "#888" }}
                formatter={(v) => [`${v}%`, "SoH"]}
                labelFormatter={(l) => `Cycle ${l}`}
              />
              <ReferenceLine y={80} stroke="#ff4d4d" strokeDasharray="4 4" />
              {last && (
                <ReferenceLine x={last.cycle} stroke="#00f5ff" strokeDasharray="3 3" label={{ value: "NOW", fill: "#00f5ff", fontSize: 9, position: "top" }} />
              )}
              <Area type="monotone" dataKey="sohHist" stroke="none" fill="url(#sohFillDk)" />
              <Line type="monotone" dataKey="sohHist" stroke="hsl(var(--good))" strokeWidth={2} dot={false} connectNulls />
              <Line type="monotone" dataKey="sohFc" stroke="hsl(var(--good))" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No telemetry yet. Generate a profile or ingest data.</div>
        )}
      </div>
    </div>
  );
}