import React from "react";
import { AlertTriangle } from "lucide-react";

const ITEMS = [
  "SOH is derived as capacity-equivalent fade from charge/discharge telemetry, not certified lab or calendar testing.",
  "RUL assumes the recent linear decay rate continues; degradation commonly accelerates near end-of-life.",
  "Best / likely / worst bands reflect decay-rate variability, not a probabilistic lifetime guarantee.",
  "Driver Z-scores compare this cell against a nominal reference distribution, not the live fleet.",
  "Confidence rises with more cycles and cleaner sensors; estimates degrade on sparse, noisy data.",
];

export default function AssumptionsDisclaimer() {
  return (
    <div className="grid lg:grid-cols-2 gap-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Assumptions & Uncertainty</div>
        <ol className="space-y-1.5">
          {ITEMS.map((t, i) => (
            <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
              <span className="font-mono text-foreground/70">{String(i + 1).padStart(2, "0")}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border border-bad/40 bg-bad/5 p-4">
        <div className="flex items-center gap-2 text-bad text-[11px] font-medium uppercase tracking-wider mb-2">
          <AlertTriangle className="w-3.5 h-3.5" /> Safety Disclaimer
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">
          ADVISORY ONLY. These SoH and RUL estimates are statistical inferences from limited telemetry. They do not
          constitute certified battery testing. Never bypass, disable, or override BMS protections or exceed rated
          operating limits on the basis of these outputs.
        </p>
      </div>
    </div>
  );
}