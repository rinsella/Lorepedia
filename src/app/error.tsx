"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand/logo";
import { RefreshCw, Home } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Lorepedia error:", error);
  }, [error]);

  return (
    <div className="container py-24 max-w-2xl text-center">
      <BrandMark size={56} className="mx-auto mb-6" />
      <p className="text-[11px] uppercase tracking-[0.18em] text-destructive font-medium">Something went wrong</p>
      <h1 className="font-serif text-4xl md:text-5xl font-semibold mt-3">
        A page from the archive failed to load.
      </h1>
      <p className="text-muted-foreground mt-4">
        We’ve recorded what happened. You can try again, or return home.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground mt-3 font-mono">Error digest: {error.digest}</p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 font-medium hover:opacity-90"
        >
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 font-medium hover:bg-accent"
        >
          <Home className="h-4 w-4" /> Home
        </Link>
      </div>
    </div>
  );
}
