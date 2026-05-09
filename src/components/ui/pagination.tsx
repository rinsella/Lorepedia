import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  query?: Record<string, string | undefined>;
  className?: string;
}

export function Pagination({ page, totalPages, basePath, query = {}, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const nums: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) nums.push(i);
  return (
    <nav className={cn("flex items-center justify-center gap-1 text-sm", className)} aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn("px-3 py-1.5 rounded border bg-background hover:bg-accent", page <= 1 && "pointer-events-none opacity-50")}
      >
        Prev
      </Link>
      {start > 1 && (
        <>
          <Link href={buildHref(1)} className="px-3 py-1.5 rounded border bg-background hover:bg-accent">1</Link>
          {start > 2 && <span className="px-2 text-muted-foreground">…</span>}
        </>
      )}
      {nums.map((n) => (
        <Link
          key={n}
          href={buildHref(n)}
          className={cn(
            "px-3 py-1.5 rounded border",
            n === page ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent",
          )}
        >
          {n}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-2 text-muted-foreground">…</span>}
          <Link href={buildHref(totalPages)} className="px-3 py-1.5 rounded border bg-background hover:bg-accent">{totalPages}</Link>
        </>
      )}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn("px-3 py-1.5 rounded border bg-background hover:bg-accent", page >= totalPages && "pointer-events-none opacity-50")}
      >
        Next
      </Link>
    </nav>
  );
}
