import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditPage, canViewPage } from "@/lib/permissions";
import { EditPageForm } from "./form";
import { deletePage } from "../actions";

export default async function EditPage({ params }: { params: { slug: string; pageSlug: string } }) {
  const session = await auth();
  const world = await prisma.world.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });
  if (!world) notFound();
  const page = await prisma.page.findUnique({
    where: { worldId_slug: { worldId: world.id, slug: params.pageSlug } },
    include: { incomingLinks: { include: { fromPage: { select: { slug: true, title: true } } } } },
  });
  if (!page) notFound();
  if (!canViewPage(session?.user, world, page, world.members)) notFound();

  const editable = canEditPage(session?.user, world, page, world.members);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <Link href={`/dashboard/worlds/${world.slug}`} className="text-xs text-muted-foreground hover:underline">← {world.name}</Link>
          <h1 className="font-serif text-2xl font-semibold">{page.title}</h1>
          <p className="text-xs text-muted-foreground">{page.type.toLowerCase()} · {page.status.toLowerCase()} · /{page.slug}</p>
        </div>
        <div className="flex gap-2">
          {page.status === "PUBLISHED" && (
            <Link href={`/w/${world.slug}/${page.slug}`} className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent">Public view</Link>
          )}
          {editable && (
            <form action={deletePage}>
              <input type="hidden" name="id" value={page.id} />
              <button className="rounded-md border border-destructive text-destructive px-3 py-1.5 text-sm hover:bg-destructive hover:text-destructive-foreground">Delete</button>
            </form>
          )}
        </div>
      </header>

      {editable ? (
        <EditPageForm
          page={{
            id: page.id,
            title: page.title,
            summary: page.summary ?? "",
            contentMarkdown: page.contentMarkdown,
            status: page.status,
            visibility: page.visibility,
          }}
        />
      ) : (
        <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">{page.contentMarkdown}</pre>
      )}

      <section>
        <h2 className="font-serif text-lg mb-2">Backlinks</h2>
        {page.incomingLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pages link here yet.</p>
        ) : (
          <ul className="text-sm list-disc pl-5">
            {page.incomingLinks.map((l) => (
              <li key={l.id}>
                {l.fromPage ? (
                  <Link href={`/dashboard/worlds/${world.slug}/pages/${l.fromPage.slug}`} className="hover:underline">{l.fromPage.title}</Link>
                ) : (
                  <span className="text-muted-foreground">(deleted page)</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
