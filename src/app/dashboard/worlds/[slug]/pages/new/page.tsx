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
      <h1 className="font-serif text-2xl font-semibold">New page in {world.name}</h1>
      <NewPageForm worldId={world.id} />
    </div>
  );
}
