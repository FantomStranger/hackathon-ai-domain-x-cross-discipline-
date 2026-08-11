import { Link } from "react-router-dom";

export default function PageNotFound() {
  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center">
        <p className="font-mono text-good text-sm">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Page not found</h1>
        <Link className="mt-4 inline-block text-sm text-good hover:underline" to="/">Return to CELLWATCH</Link>
      </div>
    </main>
  );
}
