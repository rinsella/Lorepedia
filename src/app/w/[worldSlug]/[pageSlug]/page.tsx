import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canViewPage, canViewWorld } from "@/lib/permissions";
import { renderMarkdown } from "@/lib/markdown";

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
    title: `${ctx.page.title}`,
    description: ctx.page.summary ?? undefined,
    alternates: { canonical: `/w/${ctx.world!.slug}/${ctx.page.slug}` },
    openGraph: {
      title: ctx.page.title,
      description: ctx.page.summary ?? undefined,
      type: "article",
    },
    twitter: { card: "summary", title: ctx.page.title, description: ctx.page.summary ?? undefined },
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

  // Build resolved-slug set for this world (used by wikilink renderer)
  const allSlugs = await prisma.page.findMany({
    where: { worldId: world.id, deletedAt: null },
    select: { slug: true },
  });
  const html = await renderMarkdown(page.contentMarkdown, {
    worldSlug: world.slug,
    resolvedSlugs: new Set(allSlugs.map((p) => p.slug)),
  });

  const incoming = await prisma.pageLink.findMany({
    where: { worldId: world.id, toPageId: page.id },
    include: { fromPage: { select: { slug: true, title: true, status: true, visibility: true } } },
  });
  const visibleIncoming = incoming.filter(
    (l) => l.fromPage && l.fromPage.status === "PUBLISHED" && l.fromPage.visibility !== "PRIVATE",
  );

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
    <article className="container py-10 max-w-3xl">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link href={`/w/${world.slug}`} className="hover:underline">{world.name}</Link>
        <span className="mx-1">/</span>
        <span>{page.title}</span>
      </nav>

      <header className="border-b pb-4 mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{page.type.toLowerCase()}</p>
        <h1 className="font-serif text-4xl font-semibold mt-1">{page.title}</h1>
        {page.summary && <p className="text-muted-foreground mt-2">{page.summary}</p>}
      </header>

      <div className="prose-wiki" dangerouslySetInnerHTML={{ __html: html }} />

      {visibleIncoming.length > 0 && (
        <section className="mt-12 border-t pt-6">
          <h2 className="font-serif text-xl mb-2">Backlinks</h2>
          <ul className="list-disc pl-6 text-sm">
            {visibleIncoming.map((l) => (
              <li key={l.id}>
                <Link href={`/w/${world.slug}/${l.fromPage!.slug}`} className="text-primary hover:underline">{l.fromPage!.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </article>
  );
}
