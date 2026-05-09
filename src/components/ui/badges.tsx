import { cn } from "@/lib/utils";

const PAGE_TYPE_STYLES: Record<string, string> = {
  ARTICLE: "bg-muted text-foreground",
  CHARACTER: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
  LOCATION: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  FACTION: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  ITEM: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  EVENT: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  RACE: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
  RELIGION: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300",
  LANGUAGE: "bg-teal-500/15 text-teal-700 dark:text-teal-300",
  CONCEPT: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-300",
  BLOG_POST: "bg-pink-500/15 text-pink-700 dark:text-pink-300",
};

export function PageTypeBadge({ type, className }: { type: string; className?: string }) {
  const cls = PAGE_TYPE_STYLES[type] ?? PAGE_TYPE_STYLES.ARTICLE;
  const label = type.replace("_", " ").toLowerCase();
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide", cls, className)}>
      {label}
    </span>
  );
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  REVIEW: "bg-amber-500/20 text-amber-800 dark:text-amber-200",
  PUBLISHED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  ARCHIVED: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
  ACTIVE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  SUSPENDED: "bg-destructive/15 text-destructive",
  PENDING: "bg-amber-500/20 text-amber-800 dark:text-amber-200",
  OPEN: "bg-amber-500/20 text-amber-800 dark:text-amber-200",
  RESOLVED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  DISMISSED: "bg-muted text-muted-foreground",
  HIDDEN: "bg-amber-500/20 text-amber-800 dark:text-amber-200",
  REMOVED: "bg-destructive/15 text-destructive",
  VISIBLE: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", cls, className)}>
      {status.toLowerCase()}
    </span>
  );
}

const VISIBILITY_STYLES: Record<string, string> = {
  PUBLIC: "border-emerald-500/40 text-emerald-700 dark:text-emerald-300",
  UNLISTED: "border-amber-500/40 text-amber-700 dark:text-amber-300",
  PRIVATE: "border-zinc-400/40 text-zinc-600 dark:text-zinc-400",
};

export function VisibilityBadge({ visibility, className }: { visibility: string; className?: string }) {
  const cls = VISIBILITY_STYLES[visibility] ?? VISIBILITY_STYLES.PRIVATE;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium bg-background", cls, className)}>
      {visibility.toLowerCase()}
    </span>
  );
}
