import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { VisibilityBadge } from "./badges";

interface WorldCardProps {
  href: string;
  name: string;
  description?: string | null;
  visibility?: string;
  pageCount?: number;
  memberCount?: number;
  cover?: string | null;
  meta?: ReactNode;
  className?: string;
}

export function WorldCard({
  href,
  name,
  description,
  visibility,
  pageCount,
  memberCount,
  cover,
  meta,
  className,
}: WorldCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative block overflow-hidden rounded-lg border bg-card hover:border-primary/40 transition shadow-sm hover:shadow-md",
        className,
      )}
    >
      <div
        className="h-24 w-full bg-gradient-to-br from-primary/20 via-accent to-[hsl(var(--gold)/0.2)]"
        style={cover ? { backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        aria-hidden
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold leading-tight group-hover:text-primary transition">
            {name}
          </h3>
          {visibility && <VisibilityBadge visibility={visibility} />}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5">{description}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
          {typeof pageCount === "number" && <span>{pageCount} page{pageCount === 1 ? "" : "s"}</span>}
          {typeof memberCount === "number" && <span>· {memberCount} member{memberCount === 1 ? "" : "s"}</span>}
          {meta}
        </div>
      </div>
    </Link>
  );
}
