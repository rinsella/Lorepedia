import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  accent?: "primary" | "gold" | "muted" | "destructive";
  className?: string;
}

const accents = {
  primary: "text-primary",
  gold: "text-[hsl(var(--gold))]",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
};

export function StatCard({ label, value, hint, icon, accent = "primary", className }: StatCardProps) {
  return (
    <div className={cn("surface-parchment rounded-lg p-3.5 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && <span className={cn("opacity-70", accents[accent])}>{icon}</span>}
      </div>
      <p className={cn("text-2xl sm:text-3xl font-semibold mt-1.5 sm:mt-2 font-serif", accents[accent])}>{value}</p>
      {hint && <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
