import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditWorld } from "@/lib/permissions";

export default async function ExportWorldPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });
  if (!world) notFound();
  if (!canEditWorld(session?.user, world, world.members)) notFound();

  return (
    <div className="space-y-4 max-w-xl">
      <Link href={`/dashboard/worlds/${world.slug}`} className="text-xs text-muted-foreground hover:underline">← {world.name}</Link>
      <h1 className="font-serif text-2xl font-semibold">Export {world.name}</h1>
      <p className="text-sm text-muted-foreground">
        Download a ZIP containing every page as Markdown plus a JSON snapshot of the world&apos;s metadata.
      </p>
      <a className="inline-block rounded-md bg-primary text-primary-foreground px-4 py-2" href={`/api/worlds/${world.slug}/export`}>
        Download ZIP
      </a>
    </div>
  );
}
