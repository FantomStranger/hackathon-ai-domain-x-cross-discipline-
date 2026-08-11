import { forwardRef } from "react";

export const Label = forwardRef(function Label({ className = "", ...props }, ref) {
  return <label ref={ref} className={`text-sm font-medium text-foreground ${className}`} {...props} />;
});
