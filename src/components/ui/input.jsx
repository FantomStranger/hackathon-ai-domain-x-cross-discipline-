import { forwardRef } from "react";

export const Input = forwardRef(function Input({ className = "", ...props }, ref) {
  return <input ref={ref} className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground outline-none focus:ring-1 focus:ring-ring ${className}`} {...props} />;
});
