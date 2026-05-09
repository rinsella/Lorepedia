import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditWorld } from "@/lib/permissions";

export default async function BrokenLinksPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });
  if (!world) notFound();
  if (!canEditWorld(session?.user, world, world.members)) notFound();

  const broken = await prisma.pageLink.findMany({
    where: { worldId: world.id, isResolved: false },
    include: { fromPage: { select: { slug: true, title: true } } },
    take: 200,
  });

  // Group by target
  const grouped = new Map<string, { title: string; slug: string; from: typeof broken }>();
  for (const link of broken) {
    const k = link.targetSlug ?? link.targetTitle;
    const cur = grouped.get(k) ?? { title: link.targetTitle, slug: link.targetSlug ?? "", from: [] as any };
    cur.from.push(link);
    grouped.set(k, cur);
  }

  return (
    <div className="space-y-6">
      <header>
        <Link href={`/dashboard/worlds/${world.slug}`} className="text-xs text-muted-foreground hover:underline">← {world.name}</Link>
        <h1 className="font-serif text-2xl font-semibold">Broken links</h1>
        <p className="text-sm text-muted-foreground">Wikilinks pointing at pages that don&apos;t exist yet.</p>
      </header>
      {grouped.size === 0 ? (
        <p className="text-sm text-muted-foreground">No broken links. Nice.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {Array.from(grouped.values()).map((g) => (
            <li key={g.slug || g.title} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{g.title}</div>
                <p className="text-xs text-muted-foreground">Linked from: {g.from.map((l) => l.fromPage?.title ?? "?").join(", ")}</p>
              </div>
              <Link
                href={`/dashboard/worlds/${world.slug}/pages/new?title=${encodeURIComponent(g.title)}`}
                className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5"
              >
                Create
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
