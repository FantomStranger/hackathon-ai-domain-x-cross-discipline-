import { createContext, useContext } from "react";

const SelectContext = createContext({});

export function Select({ value, onValueChange, children }) {
  return <SelectContext.Provider value={{ value, onValueChange }}>{children}</SelectContext.Provider>;
}

export function SelectTrigger({ className = "", children }) {
  const { value, onValueChange } = useContext(SelectContext);
  return <select value={value} onChange={(event) => onValueChange?.(event.target.value)} className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ${className}`}>{children}</select>;
}

export function SelectValue() { return null; }
export function SelectContent({ children }) { return <>{children}</>; }
export function SelectItem({ value, children }) { return <option value={value}>{children}</option>; }
