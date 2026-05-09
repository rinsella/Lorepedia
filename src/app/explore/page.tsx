import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata = { title: "Explore worlds" };

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
  const worlds = await prisma.world.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 60,
    include: { _count: { select: { pages: true } } },
  });

  return (
    <div className="container py-10 max-w-5xl space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-semibold">Explore public worlds</h1>
        <p className="text-muted-foreground">Discover universes built by the community.</p>
      </header>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search worlds…" className="flex-1 rounded-md border bg-background px-3 py-2" />
        <button className="rounded-md bg-primary text-primary-foreground px-4">Search</button>
      </form>
      {worlds.length === 0 ? (
        <p className="text-muted-foreground">No public worlds match.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {worlds.map((w) => (
            <li key={w.id} className="rounded-lg border bg-card p-5">
              <Link href={`/w/${w.slug}`} className="font-serif text-lg font-medium hover:underline">{w.name}</Link>
              <p className="text-sm text-muted-foreground line-clamp-3 mt-1">{w.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{w._count.pages} pages</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
