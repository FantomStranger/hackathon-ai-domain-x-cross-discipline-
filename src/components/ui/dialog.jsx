export function Dialog({ open, children }) {
  return open ? <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">{children}</div> : null;
}

export function DialogContent({ className = "", children }) {
  return <section role="dialog" aria-modal="true" className={`w-full rounded-xl border border-border bg-card p-5 shadow-xl ${className}`}>{children}</section>;
}

export function DialogHeader({ children }) { return <header className="mb-4">{children}</header>; }
export function DialogTitle({ children }) { return <h2 className="text-lg font-semibold">{children}</h2>; }
export function DialogFooter({ children }) { return <footer className="mt-5 flex justify-end gap-2">{children}</footer>; }
