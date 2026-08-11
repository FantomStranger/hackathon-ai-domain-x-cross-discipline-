import React from "react";
import { STATUS_STYLES, STATUS_NOTE } from "@/lib/batteryUtils";

export default function SystemHealthCard({ status }) {
  const st = STATUS_STYLES[status] || STATUS_STYLES.healthy;
  return (
    <div className="rounded-xl border border-border bg-card p-4 h-full flex flex-col">
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">System Health</div>
      <div className="mt-3 flex items-center gap-3">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-lg font-semibold tracking-wide ${st.badge}`}>
          <span className={`w-2 h-2 rounded-full ${st.dot}`} />
          {(STATUS_STYLES[status]?.label || "Healthy").toUpperCase()}
        </span>
      </div>
      <p className="mt-auto pt-4 text-xs text-muted-foreground leading-relaxed">
        {STATUS_NOTE[status] || STATUS_NOTE.healthy}
      </p>
    </div>
  );
}