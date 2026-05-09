import { prisma } from "@/lib/db";
import { extractWikilinks } from "@/lib/markdown";

/**
 * Recompute the PageLink rows for a given page based on its markdown content.
 * Resolves links by looking up Page rows in the same world by slug.
 */
export async function syncPageLinks(pageId: string): Promise<void> {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, worldId: true, contentMarkdown: true },
  });
  if (!page) return;

  const links = extractWikilinks(page.contentMarkdown);
  const slugs = Array.from(new Set(links.map((l) => l.targetSlug)));

  const targets = slugs.length
    ? await prisma.page.findMany({
        where: { worldId: page.worldId, slug: { in: slugs } },
        select: { id: true, slug: true },
      })
    : [];
  const bySlug = new Map(targets.map((t) => [t.slug, t.id]));

  await prisma.$transaction([
    prisma.pageLink.deleteMany({ where: { fromPageId: page.id } }),
    ...(links.length
      ? [
          prisma.pageLink.createMany({
            data: links.map((l) => ({
              worldId: page.worldId,
              fromPageId: page.id,
              targetTitle: l.targetTitle,
              targetSlug: l.targetSlug,
              label: l.label,
              toPageId: bySlug.get(l.targetSlug) ?? null,
              isResolved: bySlug.has(l.targetSlug),
            })),
          }),
        ]
      : []),
  ]);
}

/**
 * When a page's slug or title changes, refresh any links pointing at it
 * (they may now resolve, or stop resolving).
 */
export async function refreshIncomingLinks(worldId: string, slug: string, pageId: string | null) {
  await prisma.pageLink.updateMany({
    where: { worldId, targetSlug: slug },
    data: { toPageId: pageId, isResolved: pageId !== null },
  });
}
