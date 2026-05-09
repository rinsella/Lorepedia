import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canViewWorld, canEditWorld } from "@/lib/permissions";

export default async function WorldDashboard({ params }: { params: { slug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: {
      members: true,
      pages: { orderBy: { updatedAt: "desc" }, take: 50 },
      _count: { select: { pages: true, members: true } },
    },
  });
  if (!world) notFound();
  if (!canViewWorld(session?.user, world, world.members)) notFound();

  const editable = canEditWorld(session?.user, world, world.members);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">{world.name}</h1>
          <p className="text-sm text-muted-foreground">/{world.slug} · {world.visibility.toLowerCase()} · {world._count.pages} pages · {world._count.members} members</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/w/${world.slug}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Public view</Link>
          {editable && (
            <Link href={`/dashboard/worlds/${world.slug}/pages/new`} className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm">New page</Link>
          )}
        </div>
      </header>

      <nav className="flex gap-2 text-sm">
        <Link href={`/dashboard/worlds/${world.slug}`} className="px-3 py-1.5 rounded hover:bg-accent">Pages</Link>
        <Link href={`/dashboard/worlds/${world.slug}/links`} className="px-3 py-1.5 rounded hover:bg-accent">Broken links</Link>
        <Link href={`/dashboard/worlds/${world.slug}/settings`} className="px-3 py-1.5 rounded hover:bg-accent">Settings</Link>
        <Link href={`/dashboard/worlds/${world.slug}/export`} className="px-3 py-1.5 rounded hover:bg-accent">Export</Link>
      </nav>

      <ul className="divide-y rounded-lg border bg-card">
        {world.pages.length === 0 && <li className="p-4 text-muted-foreground">No pages yet.</li>}
        {world.pages.map((p) => (
          <li key={p.id} className="p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/dashboard/worlds/${world.slug}/pages/${p.slug}`} className="font-medium hover:underline truncate">{p.title}</Link>
              <p className="text-xs text-muted-foreground truncate">{p.type.toLowerCase()} · {p.status.toLowerCase()} · {p.visibility.toLowerCase()} · /{p.slug}</p>
            </div>
            {p.status === "PUBLISHED" && (
              <Link href={`/w/${world.slug}/${p.slug}`} className="text-sm text-primary hover:underline shrink-0">View</Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
