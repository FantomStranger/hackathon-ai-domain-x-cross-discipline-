import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { SEVERITY_STYLES } from "@/lib/batteryUtils";

const sevIcon = { info: Info, warning: AlertTriangle, critical: ShieldAlert };

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  const load = async () => {
    setLoading(true);
    const list = await base44.entities.Alert.list("-created_date", 200);
    setAlerts(filter === "active" ? list.filter((a) => a.status === "active") : list);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const acknowledge = async (id) => {
    await base44.entities.Alert.update(id, { status: "acknowledged" });
    load();
  };

  const active = alerts.filter((a) => a.status === "active");

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 font-mono">← BACK TO FLEET</Link>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Safety alerts</h1>
      <p className="text-sm text-muted-foreground mb-6">Batteries flagged by the health engine for close monitoring or replacement.</p>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter("active")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "active" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>Active ({active.length})</button>
        <button onClick={() => setFilter("all")} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>All</button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm">Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <CheckCircle2 className="w-10 h-10 mx-auto text-good mb-3" />
          <p className="text-sm text-muted-foreground">No active alerts. All batteries within healthy range.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {alerts.map((a) => {
            const Icon = sevIcon[a.severity] || Info;
            const st = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.info;
            return (
              <div key={a.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${st}`}><Icon className="w-4 h-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/?cell=${a.battery_id}`} className="text-sm font-medium hover:underline">{a.battery_name || "Battery"}</Link>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${st}`}>{a.severity}</span>
                      {a.status === "acknowledged" && <span className="text-[11px] text-muted-foreground">acknowledged</span>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{a.message}</p>
                  </div>
                  {a.status === "active" && (
                    <button onClick={() => acknowledge(a.id)} className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted/40">Acknowledge</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}