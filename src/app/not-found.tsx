import Link from "next/link";
import { BrandMark } from "@/components/brand/logo";
import { Compass, Home, LayoutDashboard, Search } from "lucide-react";

export const metadata = { title: "Page lost in the archives" };

export default function NotFound() {
  return (
    <div className="container py-24 max-w-2xl text-center">
      <BrandMark size={56} className="mx-auto mb-6" />
      <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">404 — Lost scroll</p>
      <h1 className="font-serif text-5xl md:text-6xl font-semibold mt-3">This page is lost in the archives.</h1>
      <p className="text-muted-foreground mt-4 leading-relaxed">
        The lore you’re looking for may have been moved, renamed, or never written.
        Try one of the paths below — every legend has more than one ending.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-2.5 font-medium hover:opacity-90"
        >
          <Home className="h-4 w-4" /> Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 font-medium hover:bg-accent"
        >
          <Compass className="h-4 w-4" /> Explore worlds
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 font-medium hover:bg-accent"
        >
          <Search className="h-4 w-4" /> Search
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-md border bg-background px-5 py-2.5 font-medium hover:bg-accent"
        >
          <LayoutDashboard className="h-4 w-4" /> My dashboard
        </Link>
      </div>
    </div>
  );
}
