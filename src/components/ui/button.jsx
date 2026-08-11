import { forwardRef } from "react";

export const Button = forwardRef(function Button({ className = "", variant = "default", ...props }, ref) {
  const styles = variant === "outline"
    ? "border border-border bg-transparent text-foreground hover:bg-muted"
    : "bg-primary text-primary-foreground hover:opacity-90";
  return <button ref={ref} className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50 ${styles} ${className}`} {...props} />;
});
