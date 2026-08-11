import React from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { buildWaveform } from "@/lib/batteryUtils";

function norm(v, a, b) { if (b === a) return 50; return ((v - a) / (b - a)) * 100; }

function WfTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-[11px] font-mono">
      <div className="text-muted-foreground mb-1">t = {p.t} min</div>
      <div className="text-good">SOC {p.soc}%</div>
      <div style={{ color: "#007bff" }}>V {p.voltage}</div>
      <div style={{ color: "#a855f7" }}>I {p.current} A</div>
      <div style={{ color: "#f59e0b" }}>T {p.temperature}°C</div>
    </div>
  );
}

export default function WaveformChart({ cycle, nominal }) {
  const wf = buildWaveform(cycle, nominal);
  let data = [];
  if (wf.length) {
    const vs = wf.map((p) => p.voltage);
    const is = wf.map((p) => p.current);
    const ts = wf.map((p) => p.temperature);
    const vMin = Math.min(...vs), vMax = Math.max(...vs);
    const iMax = Math.max(...is.map(Math.abs)) || 1;
    const tMin = Math.min(...ts), tMax = Math.max(...ts);
    data = wf.map((p) => ({
      t: p.t,
      voltage: p.voltage, current: p.current, temperature: p.temperature, soc: p.soc,
      vN: norm(p.voltage, vMin, vMax),
      iN: norm(p.current, -iMax, iMax),
      tN: norm(p.temperature, tMin, tMax),
      sN: p.soc,
    }));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-baseline justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Charge → Discharge Waveform</div>
        <div className="text-[10px] text-muted-foreground">derived · normalized 0–100</div>
      </div>
      <div className="mt-3" style={{ height: 220 }}>
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#666" }} stroke="#262626" label={{ value: "min", position: "insideBottomRight", fontSize: 9, fill: "#666", offset: -2 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#666" }} stroke="#262626" />
              <Tooltip content={<WfTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#888" }} />
              <Line type="monotone" dataKey="vN" name="V" stroke="#007bff" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="iN" name="I" stroke="#a855f7" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="tN" name="T" stroke="#f59e0b" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="sN" name="SOC" stroke="#00f5ff" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No cycle data.</div>
        )}
      </div>
    </div>
  );
}