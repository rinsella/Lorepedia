import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canViewWorld } from "@/lib/permissions";

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

export default async function PublicWorldHome({ params }: { params: { worldSlug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.worldSlug },
    include: { members: true },
  });
  if (!world) notFound();
  if (!canViewWorld(session?.user, world, world.members)) notFound();

  const pages = await prisma.page.findMany({
    where: {
      worldId: world.id,
      status: "PUBLISHED",
      visibility: { in: ["PUBLIC", "UNLISTED"] },
      deletedAt: null,
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: { id: true, title: true, slug: true, summary: true, type: true },
  });

  return (
    <div className="container py-10 max-w-4xl">
      <header className="border-b pb-6 mb-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{world.visibility.toLowerCase()} world</p>
        <h1 className="font-serif text-4xl font-semibold mt-1">{world.name}</h1>
        {world.description && <p className="text-muted-foreground mt-2 max-w-2xl">{world.description}</p>}
      </header>

      <h2 className="font-serif text-xl mb-3">Pages</h2>
      {pages.length === 0 ? (
        <p className="text-muted-foreground">No published pages yet.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {pages.map((p) => (
            <li key={p.id} className="rounded-lg border bg-card p-4">
              <Link href={`/w/${world.slug}/${p.slug}`} className="font-medium hover:underline">{p.title}</Link>
              <p className="text-xs text-muted-foreground">{p.type.toLowerCase()}</p>
              {p.summary && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
