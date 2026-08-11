export const CHEMISTRIES = {
  LFP: { nominal: 3.2, refCycles: 3000 },
  NMC: { nominal: 3.7, refCycles: 1000 },
  NCA: { nominal: 3.6, refCycles: 500 },
  LCO: { nominal: 3.7, refCycles: 800 },
  LTO: { nominal: 2.4, refCycles: 5000 },
};

export const STATUS_STYLES = {
  healthy: { label: "Healthy", dot: "bg-good", badge: "border-good/40 text-good bg-good/10" },
  monitor: { label: "Monitor", dot: "bg-warn", badge: "border-warn/40 text-warn bg-warn/10" },
  replace_soon: { label: "Replace soon", dot: "bg-bad", badge: "border-bad/40 text-bad bg-bad/10" },
  critical: { label: "Critical", dot: "bg-bad", badge: "border-bad/40 text-bad bg-bad/10" },
};

export const SEVERITY_STYLES = {
  info: "border-info/40 text-info bg-info/10",
  warning: "border-warn/40 text-warn bg-warn/10",
  critical: "border-bad/40 text-bad bg-bad/10",
};

export const STATUS_NOTE = {
  healthy: "Battery health is within normal operating range for its cycle count.",
  monitor: "Slight degradation detected. Monitor trend and stressors closely.",
  replace_soon: "Approaching end-of-life threshold. Plan replacement.",
  critical: "Below safe operating margin. Replace immediately.",
};

export function sohColor(soh) {
  if (soh >= 90) return "hsl(var(--good))";
  if (soh >= 80) return "hsl(var(--warn))";
  if (soh >= 70) return "#fb923c";
  return "hsl(var(--bad))";
}

export function statusFromSoh(soh) {
  if (soh < 70) return "critical";
  if (soh < 80) return "replace_soon";
  if (soh < 90) return "monitor";
  return "healthy";
}

function mean(a) { return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; }

function driverRow(label, intensity, z, detail) {
  const i = Math.max(0, Math.min(1, intensity));
  const zr = Math.round(z * 100) / 100;
  let status = "LOW";
  if (i >= 0.5) status = "HIGH";
  else if (i >= 0.2) status = "NOMINAL";
  return { label, intensity: i, z: zr, status, detail };
}

const DEFAULT_DRIVERS = [
  ["High Current Bursts", "% of cycles exceeded 2C peak current"],
  ["Temperature Exposure", "% of cycles exceeded 45°C"],
  ["Deep Discharge Cycles", "% of cycles discharged below 20% SOC"],
  ["Internal Resistance Growth", "recent vs earlier resistance ratio"],
];

export function computeDriverDiagnostics(cycles, cap) {
  if (!cycles || !cycles.length) {
    return DEFAULT_DRIVERS.map(([l, d]) => driverRow(l, 0, 0, d));
  }
  const n = cycles.length;
  const tempPct = cycles.filter((c) => (c.max_temperature || 0) > 45 || (c.avg_temperature || 0) > 40).length / n;
  const deepPct = cycles.filter((c) => (c.discharge_depth || 0) > 0.8).length / n;
  const cPct = cap > 0 ? cycles.filter((c) => (c.peak_current || 0) / cap > 2).length / n : 0;
  const sorted = [...cycles].sort((a, b) => a.cycle_id - b.cycle_id);
  const half = Math.floor(sorted.length / 2);
  const recent = mean(sorted.slice(half).map((c) => c.internal_resistance_proxy || 0));
  const older = mean(sorted.slice(0, Math.max(half, 1)).map((c) => c.internal_resistance_proxy || 0));
  const ratio = older > 0 ? recent / older : 1;
  return [
    driverRow("High Current Bursts", cPct, (cPct - 0.15) / 0.15, `${Math.round(cPct * 100)}% of cycles exceeded 2C peak current`),
    driverRow("Temperature Exposure", tempPct, (tempPct - 0.2) / 0.15, `${Math.round(tempPct * 100)}% of cycles exceeded 45°C`),
    driverRow("Deep Discharge Cycles", deepPct, (deepPct - 0.25) / 0.2, `${Math.round(deepPct * 100)}% of cycles discharged below 20% SOC`),
    driverRow("Internal Resistance Growth", (ratio - 1) / 0.6, (ratio - 1) / 0.3, `recent/earlier resistance ratio ${ratio.toFixed(2)}`),
  ];
}

// Derive a representative charge->discharge waveform (0..60 min) from a cycle summary.
export function buildWaveform(cycle, nominalVoltage) {
  if (!cycle) return [];
  const points = [];
  const socStart = cycle.soc_start ?? 100;
  const socEnd = cycle.soc_end ?? (100 - (cycle.discharge_depth || 0) * 100);
  const iAvg = cycle.avg_current ?? 0;
  const tAvg = cycle.avg_temperature ?? 25;
  const tMax = cycle.max_temperature ?? tAvg + 5;
  const vNom = nominalVoltage || 3.2;
  const N = 30;
  for (let k = 0; k <= N; k++) {
    const frac = k / N;
    const t = frac * 60;
    let soc;
    if (frac <= 0.5) {
      const f = frac / 0.5;
      soc = socStart - (socStart - socEnd) * f;
    } else {
      const f = (frac - 0.5) / 0.5;
      soc = socEnd + (socStart - socEnd) * f;
    }
    let cur;
    if (frac < 0.05 || frac > 0.95) cur = 0;
    else if (frac <= 0.5) cur = -Math.abs(iAvg);
    else cur = Math.abs(iAvg) * 0.8;
    const v = vNom * (0.9 + 0.1 * (soc / 100)) - (Math.abs(cur) / 100) * 0.03;
    const temp = tAvg + (tMax - tAvg) * Math.sin(Math.PI * frac);
    points.push({
      t: +t.toFixed(1),
      voltage: +v.toFixed(3),
      current: +cur.toFixed(1),
      temperature: +temp.toFixed(1),
      soc: +soc.toFixed(1),
    });
  }
  return points;
}