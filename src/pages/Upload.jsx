import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { UploadCloud, FileUp, Radio, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

const EXPECTED_COLS = ["cycle_id", "voltage", "current", "temperature", "soc", "time"];

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return { headers: [], rows: [], error: "Empty file" };
  const delim = lines[0].includes(",") ? "," : /\s+|;|,/;
  const headers = lines[0].split(delim).map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const parts = line.split(delim);
    const obj = {};
    headers.forEach((h, i) => { obj[h] = parts[i]?.trim(); });
    return obj;
  });
  const missing = EXPECTED_COLS.filter((c) => !headers.includes(c));
  if (missing.length) return { headers, rows, error: `Missing columns: ${missing.join(", ")}` };
  return { headers, rows, error: null };
}

export default function Upload() {
  const [batteries, setBatteries] = useState([]);
  const [batteryId, setBatteryId] = useState("");
  const [tab, setTab] = useState("csv");
  const [parsed, setParsed] = useState(null);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [streamText, setStreamText] = useState("");

  useEffect(() => {
    base44.entities.Battery.list("-updated_date", 200).then((b) => { setBatteries(b); if (b[0]) setBatteryId(b[0].id); });
  }, []);

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null); setError("");
    const text = await file.text();
    const { headers, rows, error: perr } = parseCSV(text);
    if (perr) { setError(perr); setParsed(null); return; }
    const samples = rows.map((r) => ({
      cycle_id: r.cycle_id ? Number(r.cycle_id) : undefined,
      voltage: Number(r.voltage),
      current: Number(r.current),
      temperature: Number(r.temperature),
      soc: Number(r.soc),
      time: Number(r.time),
      soh: r.soh ? Number(r.soh) : undefined,
    })).filter((s) => !Number.isNaN(s.voltage));
    setParsed({ samples, headers });
  };

  const process = async (samples, fnName) => {
    if (!batteryId) { setError("Select a battery first."); return; }
    setProcessing(true); setResult(null); setError("");
    try {
      const res = await base44.functions.invoke(fnName, { battery_id: batteryId, samples });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setProcessing(false);
    }
  };

  const sendStream = async () => {
    setError(""); setResult(null);
    let payload;
    try { payload = JSON.parse(streamText); } catch { setError("Invalid JSON"); return; }
    const samples = Array.isArray(payload) ? payload : payload.samples;
    if (!Array.isArray(samples) || !samples.length) { setError("Provide a samples array"); return; }
    if (!samples[0]?.voltage !== undefined && typeof samples[0]?.voltage !== "number" && samples[0]?.voltage == null) { /* allow */ }
    process(samples, "streamTelemetry");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 font-mono">← BACK TO FLEET</Link>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Ingest telemetry</h1>
      <p className="text-sm text-muted-foreground mb-6">Upload cycle CSVs or push a real-time stream batch. The engine computes SoH, RUL bands and drivers.</p>

      {/* Battery selector */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Target battery</label>
        <select value={batteryId} onChange={(e) => setBatteryId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
          {batteries.length === 0 && <option value="">No batteries — register one on the dashboard</option>}
          {batteries.map((b) => <option key={b.id} value={b.id}>{b.name} · {b.serial_number}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("csv")} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${tab === "csv" ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted/40"}`}>
          <FileUp className="w-4 h-4" /> CSV upload
        </button>
        <button onClick={() => setTab("stream")} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${tab === "stream" ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted/40"}`}>
          <Radio className="w-4 h-4" /> API stream
        </button>
      </div>

      {tab === "csv" ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-10 cursor-pointer hover:border-primary/50 transition">
            <UploadCloud className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm font-medium">{fileName || "Choose a CSV file"}</span>
            <span className="text-xs text-muted-foreground">Columns: cycle_id, voltage, current, temperature, soc, time [, soh]</span>
            <input type="file" accept=".csv,.txt" className="hidden" onChange={onFile} />
          </label>

          {parsed && !error && (
            <div className="mt-4 text-sm text-muted-foreground">
              Parsed <span className="font-medium text-foreground">{parsed.samples.length}</span> rows · <span className="font-medium text-foreground">{new Set(parsed.samples.map((s) => s.cycle_id)).size}</span> cycles
            </div>
          )}
          {error && <div className="mt-3 text-sm text-destructive flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> {error}</div>}

          <div className="mt-4 flex justify-end">
            <button onClick={() => process(parsed?.samples, "processTelemetry")} disabled={!parsed?.samples || processing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />} Process telemetry
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-2">Paste a JSON batch of samples (as a forwarder would POST to the stream endpoint). Each sample: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{`{cycle_id, voltage, current, temperature, soc, time}`}</code>.</p>
          <textarea value={streamText} onChange={(e) => setStreamText(e.target.value)} rows={8} placeholder={`[\n  {"cycle_id": 41, "voltage": 3.45, "current": -18, "temperature": 38, "soc": 80, "time": 0}\n]`} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono" />
          <div className="mt-3 flex justify-end">
            <button onClick={sendStream} disabled={!streamText || processing} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />} Push batch
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-2xl border border-good/30 bg-good/10 p-4">
          <div className="flex items-center gap-2 text-good font-medium text-sm"><CheckCircle2 className="w-4 h-4" /> Processed {result.cycles_processed} cycles</div>
          <div className="mt-2 text-sm text-good/80">{result.rul?.safety_summary}</div>
          <div className="mt-2 flex gap-4 text-xs text-good">
            <span>SoH: {result.rul?.current_soh}%</span>
            <span>Likely RUL: {result.rul?.predicted_cycles_remaining >= 9999 ? "∞" : result.rul?.predicted_cycles_remaining} cyc</span>
            <span>Decay: {result.rul?.decay_rate_per_cycle} pts/cyc</span>
          </div>
        </div>
      )}

      <div className="mt-5 rounded-xl border border-warn/30 bg-warn/10 p-3 text-[11px] leading-relaxed text-warn/80 flex gap-2">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Safety: these SoH/RUL estimates are inferred from charge/discharge telemetry, not lab testing. Uncertainty bands reflect decay-rate variability. Never use these outputs to bypass BMS safeguards or exceed rated operating limits.</span>
      </div>
    </div>
  );
}