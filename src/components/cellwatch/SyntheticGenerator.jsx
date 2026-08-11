import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PRESETS = {
  Mild: { temperature: 25, dod: 0.4, crate: 0.5, max_cycles: 100 },
  Moderate: { temperature: 35, dod: 0.6, crate: 1.5, max_cycles: 120 },
  Aggressive: { temperature: 45, dod: 0.8, crate: 3, max_cycles: 150 },
  Extreme: { temperature: 55, dod: 0.95, crate: 4.5, max_cycles: 160 },
};

function Slider({ label, value, min, max, step, onChange, fmt }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-0.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{fmt}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-good h-1.5 cursor-pointer"
      />
    </div>
  );
}

export default function SyntheticGenerator({ onGenerate }) {
  const [preset, setPreset] = useState("Moderate");
  const [p, setP] = useState(PRESETS.Moderate);
  const [chemistry, setChemistry] = useState("LFP");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setP((s) => ({ ...s, [k]: v }));
  const applyPreset = (name) => { setPreset(name); setP(PRESETS[name]); };

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onGenerate({
        chemistry,
        temperature: p.temperature,
        dod: p.dod,
        crate: p.crate,
        max_cycles: p.max_cycles,
      });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Synthetic Generator</div>
      <Select value={preset} onValueChange={applyPreset}>
        <SelectTrigger className="h-8 bg-muted border-border text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.keys(PRESETS).map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
        </SelectContent>
      </Select>
      <Slider label="Temperature" value={p.temperature} min={15} max={60} step={1} onChange={(v) => set("temperature", v)} fmt={`${p.temperature}°C`} />
      <Slider label="Depth of Discharge" value={p.dod} min={0.2} max={1} step={0.05} onChange={(v) => set("dod", v)} fmt={p.dod.toFixed(2)} />
      <Slider label="C-Rate" value={p.crate} min={0.2} max={5} step={0.1} onChange={(v) => set("crate", v)} fmt={`${p.crate.toFixed(1)}C`} />
      <Slider label="Max Cycles" value={p.max_cycles} min={10} max={200} step={10} onChange={(v) => set("max_cycles", v)} fmt={`${p.max_cycles}`} />
      <Select value={chemistry} onValueChange={setChemistry}>
        <SelectTrigger className="h-8 bg-muted border-border text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {["LFP", "NMC", "NCA", "LCO", "LTO"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
      {error && <div className="text-[10px] text-bad">{error}</div>}
      <button
        onClick={submit}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-good text-black text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        Generate Profile
      </button>
    </div>
  );
}