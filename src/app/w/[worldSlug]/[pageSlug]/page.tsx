import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canViewPage, canViewWorld } from "@/lib/permissions";
import { renderMarkdown } from "@/lib/markdown";
import { extractToc, applyHeadingIds } from "@/lib/toc";
import { TableOfContents } from "@/components/wiki/table-of-contents";
import { Infobox } from "@/components/wiki/infobox";
import { PageTypeBadge } from "@/components/ui/badges";

interface Params {
  worldSlug: string;
  pageSlug: string;
}

async function loadCtx(params: Params) {
  const world = await prisma.world.findUnique({
    where: { slug: params.worldSlug },
    include: { members: true },
  });
  if (!world) return null;
  const page = await prisma.page.findUnique({
    where: { worldId_slug: { worldId: world.id, slug: params.pageSlug } },
  });
  if (!page) return { world, page: null };
  return { world, page };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const ctx = await loadCtx(params);
  if (!ctx?.page || ctx.page.visibility === "PRIVATE" || ctx.page.status !== "PUBLISHED") {
    return { robots: { index: false, follow: false } };
  }
  return {
    title: ctx.page.title,
    description: ctx.page.summary ?? undefined,
    alternates: { canonical: `/w/${ctx.world!.slug}/${ctx.page.slug}` },
    openGraph: {
      title: ctx.page.title,
      description: ctx.page.summary ?? undefined,
      type: "article",
      images: ctx.page.coverImage ? [{ url: ctx.page.coverImage }] : undefined,
    },
    twitter: {
      card: ctx.page.coverImage ? "summary_large_image" : "summary",
      title: ctx.page.title,
      description: ctx.page.summary ?? undefined,
    },
  };
}

export default async function PublicPage({ params }: { params: Params }) {
  const session = await auth();
  const ctx = await loadCtx(params);
  if (!ctx || !ctx.world) notFound();
  const { world, page } = ctx;
  if (!page) notFound();
  if (!canViewWorld(session?.user, world, world.members)) notFound();
  if (!canViewPage(session?.user, world, page, world.members)) notFound();

  const allSlugs = await prisma.page.findMany({
    where: { worldId: world.id, deletedAt: null },
    select: { slug: true },
  });
  const rawHtml = await renderMarkdown(page.contentMarkdown, {
    worldSlug: world.slug,
    resolvedSlugs: new Set(allSlugs.map((p) => p.slug)),
  });
  const html = applyHeadingIds(rawHtml);
  const toc = extractToc(page.contentMarkdown);

  const incoming = await prisma.pageLink.findMany({
    where: { worldId: world.id, toPageId: page.id },
    include: { fromPage: { select: { slug: true, title: true, status: true, visibility: true, type: true } } },
  });
  const visibleIncoming = incoming.filter(
    (l) => l.fromPage && l.fromPage.status === "PUBLISHED" && l.fromPage.visibility !== "PRIVATE",
  );

  // Related pages: same type, recently updated.
  const related = await prisma.page.findMany({
    where: {
      worldId: world.id,
      type: page.type,
      id: { not: page.id },
      status: "PUBLISHED",
      visibility: { in: ["PUBLIC", "UNLISTED"] },
      deletedAt: null,
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { slug: true, title: true, summary: true },
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.title,
    description: page.summary ?? undefined,
    datePublished: page.publishedAt?.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    inLanguage: world.language ?? "en",
    isPartOf: { "@type": "CreativeWork", name: world.name },
  };

  return (
    <div className="container py-8 max-w-7xl grid lg:grid-cols-[14rem_minmax(0,1fr)_18rem] gap-8">
      {/* Left: TOC */}
      <aside className="hidden lg:block sticky top-20 self-start">
        <TableOfContents items={toc} />
        <div className="mt-4 rounded-lg border bg-card p-4 text-xs text-muted-foreground">
          <p className="font-serif text-foreground font-semibold mb-2">{world.name}</p>
          <Link href={`/w/${world.slug}`} className="text-primary hover:underline">← Back to world</Link>
        </div>
      </aside>

      {/* Article */}
      <article>
        <nav className="text-xs text-muted-foreground mb-4 flex flex-wrap items-center gap-1.5">
          <Link href="/explore" className="hover:underline">Explore</Link>
          <span>/</span>
          <Link href={`/w/${world.slug}`} className="hover:underline">{world.name}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{page.title}</span>
        </nav>

        <header className="border-b pb-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <PageTypeBadge type={page.type} />
            <span className="text-xs text-muted-foreground">in {world.name}</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">{page.title}</h1>
          {page.summary && <p className="text-lg text-muted-foreground mt-3 italic">{page.summary}</p>}
          <p className="text-xs text-muted-foreground mt-3">
            Last updated {page.updatedAt.toISOString().slice(0, 10)}
            {page.publishedAt && ` · Published ${page.publishedAt.toISOString().slice(0, 10)}`}
          </p>
        </header>

        {/* Mobile TOC */}
        {toc.length > 0 && (
          <details className="lg:hidden mb-6 rounded-lg border bg-card">
            <summary className="px-4 py-3 cursor-pointer font-serif font-semibold">Contents</summary>
            <div className="px-4 pb-4">
              <TableOfContents items={toc} />
            </div>
          </details>
        )}

        <Infobox
          title={page.title}
          type={page.type}
          summary={page.summary}
          data={(page.infoboxJson as Record<string, unknown> | null) ?? null}
          cover={page.coverImage}
        />

        <div className="prose-wiki" dangerouslySetInnerHTML={{ __html: html }} />

        {visibleIncoming.length > 0 && (
          <section className="mt-12 border-t pt-6 clear-both">
            <h2 className="font-serif text-xl font-semibold mb-3">Backlinks</h2>
            <p className="text-xs text-muted-foreground mb-3">{visibleIncoming.length} page{visibleIncoming.length === 1 ? "" : "s"} reference this article.</p>
            <ul className="grid sm:grid-cols-2 gap-2 text-sm">
              {visibleIncoming.map((l) => (
                <li key={l.id} className="rounded border bg-card px-3 py-2 hover:border-primary/40">
                  <Link href={`/w/${world.slug}/${l.fromPage!.slug}`} className="text-primary hover:underline font-medium">
                    {l.fromPage!.title}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">{l.fromPage!.type.toLowerCase()}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </article>

      {/* Right: related */}
      <aside className="hidden lg:block sticky top-20 self-start space-y-4">
        {related.length > 0 && (
          <div className="rounded-lg border bg-card p-4 text-sm">
            <p className="font-serif font-semibold text-foreground/80 mb-3">More <PageTypeBadge type={page.type} /></p>
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/w/${world.slug}/${r.slug}`} className="text-primary hover:underline font-medium">{r.title}</Link>
                  {r.summary && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{r.summary}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-lg border bg-card p-4 text-xs text-muted-foreground">
          <p>Want to build your own world like this?</p>
          <Link href="/register" className="inline-block mt-2 rounded-md bg-primary text-primary-foreground px-3 py-1.5 font-medium">Start free →</Link>
        </div>
      </aside>
    </div>
  );
}
