import type { TocItem } from "@/lib/toc";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav aria-label="Table of contents" className="rounded-lg border bg-card text-sm">
      <p className="px-4 py-2.5 border-b font-serif font-semibold text-foreground/80">Contents</p>
      <ol className="px-4 py-3 space-y-1.5 list-decimal list-inside marker:text-muted-foreground">
        {items.map((it) => (
          <li key={it.slug}>
            <a href={`#${it.slug}`} className="text-foreground hover:text-primary hover:underline">{it.text}</a>
            {it.children.length > 0 && (
              <ol className="mt-1 ml-4 list-[lower-alpha] list-inside space-y-1 marker:text-muted-foreground">
                {it.children.map((c) => (
                  <li key={c.slug}>
                    <a href={`#${c.slug}`} className="text-muted-foreground hover:text-primary hover:underline">{c.text}</a>
                  </li>
                ))}
              </ol>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
