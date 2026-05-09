import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditWorld, canDeleteWorld } from "@/lib/permissions";
import { deleteWorld, updateWorld } from "../../actions";

export default async function WorldSettings({ params }: { params: { slug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });
  if (!world) notFound();
  if (!canEditWorld(session?.user, world, world.members)) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <Link href={`/dashboard/worlds/${world.slug}`} className="text-xs text-muted-foreground hover:underline">← {world.name}</Link>
        <h1 className="font-serif text-2xl font-semibold">World settings</h1>
      </header>

      <form action={async (fd: FormData) => { "use server"; await updateWorld(undefined, fd); }} className="space-y-4">
        <input type="hidden" name="id" value={world.id} />
        <div>
          <label className="text-sm font-medium">Name</label>
          <input name="name" defaultValue={world.name} maxLength={120} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" defaultValue={world.description ?? ""} rows={4} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Visibility</label>
          <select name="visibility" defaultValue={world.visibility} className="mt-1 w-full rounded-md border bg-background px-3 py-2">
            <option value="PRIVATE">Private</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PUBLIC">Public</option>
          </select>
        </div>
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2">Save</button>
      </form>

      {canDeleteWorld(session?.user, world) && (
        <section className="border border-destructive/40 rounded-lg p-4 bg-destructive/5">
          <h2 className="font-serif text-lg text-destructive">Danger zone</h2>
          <p className="text-sm text-muted-foreground mb-3">Soft-deletes the world. Pages remain on disk and can be restored by admins.</p>
          <form action={deleteWorld}>
            <input type="hidden" name="id" value={world.id} />
            <button className="rounded-md border border-destructive text-destructive px-3 py-1.5 hover:bg-destructive hover:text-destructive-foreground">
              Delete world
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
