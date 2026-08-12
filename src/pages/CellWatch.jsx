import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Battery as BatteryIcon } from "lucide-react";
import FleetSidebar from "@/components/cellwatch/FleetSidebar";
import CellDashboard from "@/components/cellwatch/CellDashboard";

// Fallback mock dataset for local offline development
const MOCK_BATTERIES = [
  {
    id: "syn-602a6",
    name: "syn-602a6",
    chemistry: "LFP",
    capacity: "100Ah",
    soh: 77.0,
    cycles: 120,
    status: "REPLACE SOON",
    temperature: 51,
    depth_of_discharge: 0.65,
    c_rate: 2.3,
    max_cycles: 180,
    fade_rate: 0.1930,
  },
  {
    id: "syn-481c9",
    name: "syn-481c9",
    chemistry: "LFP",
    capacity: "100Ah",
    soh: 61.6,
    cycles: 130,
    status: "CRITICAL",
    temperature: 42,
    depth_of_discharge: 0.70,
    c_rate: 2.7,
    max_cycles: 130,
    fade_rate: 0.2980,
  }
];

const MOCK_PREDICTIONS = [
  { battery_id: "syn-602a6", rul_best: 0, rul_likely: 0, rul_worst: 0 },
  { battery_id: "syn-481c9", rul_best: 0, rul_likely: 0, rul_worst: 0 }
];

const MOCK_ALERTS = [
  { id: 1, battery_id: "syn-602a6", status: "active", message: "High temperature exposure" },
  { id: 2, battery_id: "syn-481c9", status: "active", message: "Critical SoH degradation" }
];

export default function CellWatch() {
  const [batteries, setBatteries] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
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
    } catch (e) {
      console.warn("Backend offline. Loading local mock dataset.", e);
      // Fallback to local mock data so the UI renders completely
      setBatteries(MOCK_BATTERIES);
      setPredictions(MOCK_PREDICTIONS);
      setAlerts(MOCK_ALERTS);
      setSelectedId(MOCK_BATTERIES[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onGenerate = async (params) => {
    try {
      const res = await base44.functions.invoke("generateSyntheticProfile", params);
      await load();
      if (res.data?.battery?.id) setSelectedId(res.data.battery.id);
    } catch (e) {
      // Offline fallback: dynamically create a synthetic cell locally
      const newId = `syn-${Math.random().toString(36).substring(2, 8)}`;
      const newBattery = {
        id: newId,
        name: newId,
        chemistry: params?.chemistry || "LFP",
        capacity: "100Ah",
        soh: 85.5,
        cycles: params?.maxCycles || 120,
        status: "MODERATE",
        temperature: params?.temperature || 45,
        depth_of_discharge: params?.depthOfDischarge || 0.6,
        c_rate: params?.cRate || 2.0,
        max_cycles: params?.maxCycles || 150,
        fade_rate: 0.2100,
      };
      setBatteries((prev) => [newBattery, ...prev]);
      setSelectedId(newId);
    }
  };

  const onDelete = async (b) => {
    try {
      await base44.entities.CycleTelemetry.deleteMany({ battery_id: b.id });
      await base44.entities.RULPrediction.deleteMany({ battery_id: b.id });
      await base44.entities.Alert.deleteMany({ battery_id: b.id });
      await base44.entities.Battery.delete(b.id);
      await load();
    } catch (e) {
      // Local offline deletion fallback
      setBatteries((prev) => prev.filter((item) => item.id !== b.id));
      const remaining = batteries.filter((item) => item.id !== b.id);
      setSelectedId(remaining.length > 0 ? remaining[0].id : null);
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