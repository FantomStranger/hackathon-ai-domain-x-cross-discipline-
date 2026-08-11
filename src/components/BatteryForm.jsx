import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

export default function BatteryForm({ open, onOpenChange, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    serial_number: "",
    capacity_ah: "",
    nominal_voltage: "",
    chemistry: "LFP",
    install_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setError("");
    if (!form.name || !form.serial_number || !form.capacity_ah || !form.nominal_voltage) {
      setError("Name, serial, capacity and voltage are required.");
      return;
    }
    setSaving(true);
    try {
      const created = await base44.entities.Battery.create({
        name: form.name,
        serial_number: form.serial_number,
        capacity_ah: Number(form.capacity_ah),
        nominal_voltage: Number(form.nominal_voltage),
        chemistry: form.chemistry,
        install_date: form.install_date || null,
        current_soh: 100,
        status: "healthy",
        cycle_count: 0,
      });
      onCreated?.(created);
      onOpenChange?.(false);
      setForm({ name: "", serial_number: "", capacity_ah: "", nominal_voltage: "", chemistry: "LFP", install_date: "" });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a battery</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Pack A-12" />
          </div>
          <div className="grid gap-1.5">
            <Label>Serial number</Label>
            <Input value={form.serial_number} onChange={(e) => update("serial_number", e.target.value)} placeholder="LFP-0001" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Capacity (Ah)</Label>
              <Input type="number" value={form.capacity_ah} onChange={(e) => update("capacity_ah", e.target.value)} placeholder="100" />
            </div>
            <div className="grid gap-1.5">
              <Label>Nominal voltage (V)</Label>
              <Input type="number" value={form.nominal_voltage} onChange={(e) => update("nominal_voltage", e.target.value)} placeholder="3.2" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Chemistry</Label>
              <Select value={form.chemistry} onValueChange={(v) => update("chemistry", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["LFP", "NMC", "NCA", "LCO", "LTO"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Install date</Label>
              <Input type="date" value={form.install_date} onChange={(e) => update("install_date", e.target.value)} />
            </div>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Saving…" : "Register battery"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}