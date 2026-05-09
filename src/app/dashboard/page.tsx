import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardHome() {
  const session = await auth();
  const userId = session!.user.id;

  const [worlds, pageCount] = await Promise.all([
    prisma.world.findMany({
      where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }], status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { _count: { select: { pages: true } } },
    }),
    prisma.page.count({ where: { createdById: userId } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Welcome back{session?.user.name ? `, ${session.user.name}` : ""}.</h1>
        <p className="text-muted-foreground">You have authored {pageCount} page{pageCount === 1 ? "" : "s"}.</p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl">Recent worlds</h2>
        <Link href="/dashboard/worlds/new" className="text-sm rounded-md bg-primary text-primary-foreground px-3 py-1.5">New world</Link>
      </div>

      {worlds.length === 0 ? (
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="font-medium">No worlds yet.</p>
          <p className="text-sm text-muted-foreground">Create your first world to start building lore.</p>
          <Link href="/dashboard/worlds/new" className="inline-block mt-4 rounded-md bg-primary text-primary-foreground px-4 py-2">Create world</Link>
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {worlds.map((w) => (
            <li key={w.id} className="rounded-lg border bg-card p-5">
              <Link href={`/dashboard/worlds/${w.slug}`} className="font-serif text-lg font-medium hover:underline">{w.name}</Link>
              <p className="text-sm text-muted-foreground line-clamp-2">{w.description}</p>
              <p className="text-xs text-muted-foreground mt-2">{w._count.pages} page{w._count.pages === 1 ? "" : "s"} · {w.visibility.toLowerCase()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
