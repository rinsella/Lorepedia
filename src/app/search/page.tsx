import Link from "next/link";
import { prisma } from "@/lib/db";
import { Search as SearchIcon, BookOpen, Globe2 } from "lucide-react";
import { PageTypeBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Search" };
export const revalidate = 0;

export default async function GlobalSearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();

  let worlds: Array<{ id: string; name: string; slug: string; description: string | null }> = [];
  let pages: Array<{
    id: string; title: string; slug: string; summary: string | null; type: string;
    world: { slug: string; name: string };
  }> = [];

  if (q.length >= 2) {
    [worlds, pages] = await Promise.all([
      prisma.world.findMany({
        where: {
          visibility: "PUBLIC",
          status: "ACTIVE",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: { id: true, name: true, slug: true, description: true },
      }),
      prisma.page.findMany({
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
          deletedAt: null,
          world: { visibility: "PUBLIC", status: "ACTIVE" },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { contentMarkdown: { contains: q, mode: "insensitive" } },
          ],
        },
        orderBy: { updatedAt: "desc" },
        take: 30,
        select: {
          id: true, title: true, slug: true, summary: true, type: true,
          world: { select: { slug: true, name: true } },
        },
      }),
    ]);
  }

  return (
    <div className="container py-10 max-w-5xl space-y-8">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Global search</p>
        <h1 className="font-serif text-4xl font-semibold mt-1">Search every public world.</h1>
        <p className="text-muted-foreground mt-2">Search across all public worlds and pages on Lorepedia.</p>
      </header>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Search worlds, characters, locations, lore…"
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2.5"
          />
        </div>
        <button className="rounded-md bg-primary text-primary-foreground px-5 font-medium">Search</button>
      </form>

      {q.length < 2 ? (
        <EmptyState
          icon={<SearchIcon className="h-5 w-5" />}
          title="Type at least 2 characters to search"
          description="Search across public world names, page titles, summaries, and full Markdown content."
        />
      ) : (
        <>
          <section>
            <h2 className="font-serif text-xl font-semibold flex items-center gap-2 mb-3">
              <Globe2 className="h-5 w-5 text-primary" /> Worlds <span className="text-sm text-muted-foreground font-normal">{worlds.length}</span>
            </h2>
            {worlds.length === 0 ? (
              <p className="text-sm text-muted-foreground">No worlds match.</p>
            ) : (
              <ul className="grid sm:grid-cols-2 gap-3">
                {worlds.map((w) => (
                  <li key={w.id} className="rounded-lg border bg-card p-4 hover:border-primary/40">
                    <Link href={`/w/${w.slug}`} className="font-serif font-semibold hover:text-primary">{w.name}</Link>
                    {w.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{w.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold flex items-center gap-2 mb-3">
              <BookOpen className="h-5 w-5 text-primary" /> Pages <span className="text-sm text-muted-foreground font-normal">{pages.length}</span>
            </h2>
            {pages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pages match.</p>
            ) : (
              <ul className="space-y-2">
                {pages.map((p) => (
                  <li key={p.id} className="rounded-lg border bg-card p-4 hover:border-primary/40">
                    <div className="flex items-center gap-2">
                      <Link href={`/w/${p.world.slug}/${p.slug}`} className="font-serif font-semibold hover:text-primary">{p.title}</Link>
                      <PageTypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">in <Link href={`/w/${p.world.slug}`} className="hover:underline">{p.world.name}</Link></span>
                    </div>
                    {p.summary && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.summary}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
