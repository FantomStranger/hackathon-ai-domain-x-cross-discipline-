import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Battery as BatteryIcon } from "lucide-react";
import FleetSidebar from "@/components/cellwatch/FleetSidebar";
import CellDashboard from "@/components/cellwatch/CellDashboard";

export default function CellWatch() {
  const [batteries, setBatteries] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [bats, preds, alrts] = await Promise.all([
      base44.entities.Battery.list("-updated_date", 300),
      base44.entities.RULPrediction.list("-updated_date", 300),
      base44.entities.Alert.filter({ status: "active" }),
    ]);
    setBatteries(bats);
    setPredictions(preds);
    setAlerts(alrts);
    setSelectedId((prev) => {
      if (prev && bats.find((b) => b.id === prev)) return prev;
      const cell = new URLSearchParams(window.location.search).get("cell");
      if (cell && bats.find((b) => b.id === cell)) return cell;
      return bats[0]?.id || null;
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onGenerate = async (params) => {
    const res = await base44.functions.invoke("generateSyntheticProfile", params);
    await load();
    if (res.data?.battery?.id) setSelectedId(res.data.battery.id);
  };

  const onDelete = async (b) => {
    try {
      await base44.entities.CycleTelemetry.deleteMany({ battery_id: b.id });
      await base44.entities.RULPrediction.deleteMany({ battery_id: b.id });
      await base44.entities.Alert.deleteMany({ battery_id: b.id });
      await base44.entities.Battery.delete(b.id);
      await load();
    } catch (e) {
      console.error(e);
    }
  };

  const selected = batteries.find((b) => b.id === selectedId) || null;
  const predFor = (id) => predictions.find((p) => p.battery_id === id) || null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <FleetSidebar
        batteries={batteries}
        predictions={predictions}
        alerts={alerts}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onGenerate={onGenerate}
        onDelete={onDelete}
        onReload={load}
      />
      <main className="flex-1 min-w-0 overflow-hidden">
        {loading ? (
          <div className="p-10 text-muted-foreground text-sm">Loading fleet…</div>
        ) : selected ? (
          <CellDashboard key={selected.id} battery={selected} prediction={predFor(selected.id)} />
        ) : (
          <div className="p-10 text-center text-muted-foreground text-sm">
            <BatteryIcon className="w-8 h-8 mx-auto mb-3 opacity-40" />
            No cells yet. Use the generator to create a synthetic profile, or add a real cell.
          </div>
        )}
      </main>
    </div>
  );
}