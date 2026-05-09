import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canViewWorld } from "@/lib/permissions";
import { PageTypeBadge, VisibilityBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen, Search } from "lucide-react";

export async function generateMetadata({ params }: { params: { worldSlug: string } }): Promise<Metadata> {
  const world = await prisma.world.findUnique({ where: { slug: params.worldSlug } });
  if (!world || world.visibility === "PRIVATE") return { robots: { index: false, follow: false } };
  return {
    title: world.name,
    description: world.description ?? undefined,
    alternates: { canonical: `/w/${world.slug}` },
    openGraph: {
      title: world.name,
      description: world.description ?? undefined,
      type: "website",
    },
  };
}

const TYPE_ORDER = [
  "CHARACTER", "LOCATION", "FACTION", "ITEM", "EVENT",
  "ARTICLE", "BLOG_POST", "NOTE",
] as const;

export default async function PublicWorldHome({
  params,
  searchParams,
}: {
  params: { worldSlug: string };
  searchParams: { q?: string; type?: string };
}) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.worldSlug },
    include: { members: true, _count: { select: { pages: true, members: true } } },
  });
  if (!world) notFound();
  if (!canViewWorld(session?.user, world, world.members)) notFound();

  const q = (searchParams.q ?? "").trim();
  const typeFilter = (searchParams.type ?? "").trim() as (typeof TYPE_ORDER)[number] | "";

  const where = {
    worldId: world.id,
    status: "PUBLISHED" as const,
    visibility: { in: ["PUBLIC", "UNLISTED"] as Array<"PUBLIC" | "UNLISTED"> },
    deletedAt: null,
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { summary: { contains: q, mode: "insensitive" as const } },
            { contentMarkdown: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [pages, byType] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 60,
      select: { id: true, title: true, slug: true, summary: true, type: true, updatedAt: true },
    }),
    prisma.page.groupBy({
      by: ["type"],
      where: {
        worldId: world.id,
        status: "PUBLISHED",
        visibility: { in: ["PUBLIC", "UNLISTED"] },
        deletedAt: null,
      },
      _count: { _all: true },
    }),
  ]);

  const typeCount = new Map(byType.map((b) => [b.type, b._count._all]));

  return (
    <div className="container py-6 sm:py-10 max-w-6xl space-y-6 sm:space-y-8">
      {/* Cover header */}
      <header className="surface-parchment rounded-xl overflow-hidden">
        <div className="h-32 sm:h-40 md:h-56 bg-gradient-to-br from-primary/35 via-accent to-[hsl(var(--gold)/0.35)]"
          style={world.cover ? { backgroundImage: `url(${world.cover})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          aria-hidden
        />
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">World</p>
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold mt-1 break-words">{world.name}</h1>
              {world.description && (
                <p className="text-muted-foreground mt-2 sm:mt-3 max-w-2xl text-sm sm:text-base leading-relaxed">{world.description}</p>
              )}
            </div>
            <VisibilityBadge visibility={world.visibility} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-5 flex-wrap">
            <span className="inline-flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {world._count.pages} pages</span>
            <span>· {world._count.members} member{world._count.members === 1 ? "" : "s"}</span>
            <span>· {world.language ?? "en"}</span>
          </div>
        </div>
      </header>

      {/* In-world search & type filter */}
      <form className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder={`Search in ${world.name}…`}
            className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
          />
        </div>
        <select
          name="type"
          defaultValue={typeFilter}
          className="rounded-md border bg-background px-2 sm:px-3 py-2 text-sm max-w-[10rem] sm:max-w-none"
        >
          <option value="">All types</option>
          {TYPE_ORDER.map((t) => (
            <option key={t} value={t}>{t.replace("_", " ").toLowerCase()} ({typeCount.get(t) ?? 0})</option>
          ))}
        </select>
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90">Search</button>
      </form>

      {/* Type chips */}
      {!q && !typeFilter && (
        <div className="flex flex-wrap gap-2">
          {TYPE_ORDER.filter((t) => (typeCount.get(t) ?? 0) > 0).map((t) => (
            <Link
              key={t}
              href={`/w/${world.slug}?type=${t}`}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-xs hover:border-primary/40 hover:text-primary transition"
            >
              <PageTypeBadge type={t} />
              <span className="text-muted-foreground">{typeCount.get(t)}</span>
            </Link>
          ))}
        </div>
      )}

      {/* Pages */}
      <section>
        <h2 className="font-serif text-xl font-semibold mb-4">
          {q ? `Results for “${q}”` : typeFilter ? `${typeFilter.replace("_", " ").toLowerCase()} pages` : "Recent pages"}
          <span className="ml-2 text-sm text-muted-foreground font-normal">{pages.length}</span>
        </h2>
        {pages.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-5 w-5" />}
            title={q ? "No matches" : "No public pages yet"}
            description={q ? "Try a different search term or browse by type." : "This world has no published pages yet."}
          />
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((p) => (
              <li key={p.id} className="rounded-lg border bg-card p-5 hover:border-primary/40 transition">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Link href={`/w/${world.slug}/${p.slug}`} className="font-serif text-lg font-semibold hover:text-primary leading-tight">
                    {p.title}
                  </Link>
                  <PageTypeBadge type={p.type} />
                </div>
                {p.summary && <p className="text-sm text-muted-foreground line-clamp-3">{p.summary}</p>}
                <p className="text-[11px] text-muted-foreground mt-3">Updated {p.updatedAt.toISOString().slice(0, 10)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
