import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Battery as BatteryIcon, Search, Trash2, UploadCloud, AlertTriangle, Plus, CircuitBoard } from "lucide-react";
import { STATUS_STYLES } from "@/lib/batteryUtils";
import SyntheticGenerator from "./SyntheticGenerator";
import BatteryForm from "@/components/BatteryForm";

function Group({ label, items, Item }) {
  return (
    <div className="mb-2">
      <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      {items.map((b) => <Item key={b.id} b={b} />)}
    </div>
  );
}

export default function FleetSidebar({ batteries, predictions, alerts, selectedId, onSelect, onGenerate, onDelete, onReload }) {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const predFor = (id) => predictions.find((p) => p.battery_id === id);
  const q = search.toLowerCase();
  const filtered = batteries.filter((b) => !q || b.name?.toLowerCase().includes(q) || b.serial_number?.toLowerCase().includes(q));
  const synthetic = filtered.filter((b) => b.source === "synthetic");
  const real = filtered.filter((b) => b.source !== "synthetic");

  const Item = ({ b }) => {
    const st = STATUS_STYLES[b.status] || STATUS_STYLES.healthy;
    const active = b.id === selectedId;
    return (
      <div
        onClick={() => onSelect(b.id)}
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer border-l-2 ${active ? "bg-sidebar-accent border-good" : "border-transparent hover:bg-sidebar-accent/50"}`}
      >
        <span className={`w-2 h-2 rounded-full ${st.dot} shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono text-foreground truncate">{b.name}</div>
          <div className="text-[10px] text-muted-foreground font-mono">{b.cycle_count || 0}c · {(b.current_soh || 100).toFixed(1)}%</div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(b); }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-bad transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  };

  return (
    <aside className="w-72 shrink-0 h-screen flex flex-col border-r border-border bg-sidebar">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-good to-emerald-600 flex items-center justify-center">
            <BatteryIcon className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-wide text-foreground font-mono">CELLWATCH</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">SOH / RUL · LITHIUM</div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">
          <CircuitBoard className="w-3.5 h-3.5" /> Battery Fleet
        </div>
        <SyntheticGenerator onGenerate={onGenerate} />
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter cells…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-good/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {synthetic.length > 0 && <Group label={`Synthetic (${synthetic.length})`} items={synthetic} Item={Item} />}
        {real.length > 0 && <Group label={`Real (${real.length})`} items={real} Item={Item} />}
        {filtered.length === 0 && <div className="text-center text-xs text-muted-foreground py-6">No cells. Generate a profile or add a real cell.</div>}
      </div>

      <div className="px-3 py-3 border-t border-border space-y-1">
        <button onClick={() => setFormOpen(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition">
          <Plus className="w-3.5 h-3.5" /> Add real cell
        </button>
        <Link to="/upload" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition">
          <UploadCloud className="w-3.5 h-3.5" /> Ingest telemetry
        </Link>
        <Link to="/alerts" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition">
          <AlertTriangle className="w-3.5 h-3.5" /> Alerts
          {alerts?.length ? <span className="ml-auto text-bad font-mono">{alerts.length}</span> : null}
        </Link>
      </div>

      <BatteryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onCreated={(b) => { onSelect(b.id); onReload(); }}
      />
    </aside>
  );
}