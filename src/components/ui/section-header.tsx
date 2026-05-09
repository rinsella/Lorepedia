import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, eyebrow, actions, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4 flex-wrap", className)}>
      <div>
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-2xl font-semibold leading-tight mt-1">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
