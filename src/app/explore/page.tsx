import Link from "next/link";
import { prisma } from "@/lib/db";
import { WorldCard } from "@/components/ui/world-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Compass, Search } from "lucide-react";

export const metadata = { title: "Explore worlds" };
export const revalidate = 30;

export default async function ExplorePage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim();
  const where = {
    visibility: "PUBLIC" as const,
    status: "ACTIVE" as const,
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
  const [worlds, total] = await Promise.all([
    prisma.world.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 60,
      include: { _count: { select: { pages: true, members: true } } },
    }),
    prisma.world.count({ where }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative border-b bg-card/40">
        <div className="container py-10 sm:py-14 max-w-4xl text-center">
          <Compass className="mx-auto h-9 w-9 sm:h-10 sm:w-10 text-primary" />
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-semibold mt-3 sm:mt-4">Explore public worlds</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3 max-w-2xl mx-auto">
            Discover universes built by the Lorepedia community — fantasy realms, sci-fi
            galaxies, post-apocalyptic dustlands, and everything in between.
          </p>
          <form className="mt-5 sm:mt-7 max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Search worlds…"
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 sm:py-2.5 text-sm sm:text-base"
              />
            </div>
            <button className="rounded-md bg-primary text-primary-foreground px-4 sm:px-5 text-sm sm:text-base font-medium">Search</button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Looking for pages instead? Try <Link href="/search" className="text-primary hover:underline">global search</Link>.
          </p>
        </div>
      </section>

      <section className="container py-8 sm:py-10 max-w-6xl">
        <div className="flex items-end justify-between mb-5 sm:mb-6">
          <p className="text-sm text-muted-foreground">{total} public world{total === 1 ? "" : "s"}{q && ` matching “${q}”`}</p>
        </div>
        {worlds.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-5 w-5" />}
            title={q ? "No worlds match that search" : "No public worlds yet"}
            description={q ? "Try a broader term, or create the world you wish existed." : "Be the first to publish a world to the community."}
            actionLabel="Create your world"
            actionHref="/register"
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {worlds.map((w) => (
              <WorldCard
                key={w.id}
                href={`/w/${w.slug}`}
                name={w.name}
                description={w.description}
                visibility={w.visibility}
                pageCount={w._count.pages}
                memberCount={w._count.members}
                cover={w.cover}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
