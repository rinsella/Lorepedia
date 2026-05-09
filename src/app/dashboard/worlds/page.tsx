import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function WorldsList() {
  const session = await auth();
  const userId = session!.user.id;
  const worlds = await prisma.world.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      status: { not: "DELETED" },
    },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { pages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold">My Worlds</h1>
        <Link href="/dashboard/worlds/new" className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm">New world</Link>
      </div>
      {worlds.length === 0 ? (
        <p className="text-muted-foreground">No worlds yet.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {worlds.map((w) => (
            <li key={w.id} className="p-4 flex items-center justify-between">
              <div>
                <Link href={`/dashboard/worlds/${w.slug}`} className="font-medium hover:underline">{w.name}</Link>
                <p className="text-xs text-muted-foreground">/{w.slug} · {w.visibility.toLowerCase()} · {w._count.pages} pages</p>
              </div>
              <Link href={`/w/${w.slug}`} className="text-sm text-primary hover:underline">Public view</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
