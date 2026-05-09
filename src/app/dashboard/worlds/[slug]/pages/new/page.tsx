import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canCreatePage } from "@/lib/permissions";
import { NewPageForm } from "./form";

export default async function NewPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });
  if (!world) notFound();
  if (!canCreatePage(session?.user, world, world.members)) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/dashboard/worlds/${world.slug}`} className="text-xs text-muted-foreground hover:underline">← {world.name}</Link>
        <h1 className="font-serif text-3xl font-semibold mt-1">New page</h1>
        <p className="text-sm text-muted-foreground">Create a new entry in <span className="font-medium">{world.name}</span>.</p>
      </div>
      <NewPageForm worldId={world.id} worldSlug={world.slug} />
    </div>
  );
}
