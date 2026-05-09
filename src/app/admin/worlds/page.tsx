import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessAdmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge, VisibilityBadge } from "@/components/ui/badges";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Globe2 } from "lucide-react";

export const metadata = { title: "Admin · Worlds" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

async function archive(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  await prisma.world.update({ where: { id }, data: { status: "ARCHIVED" } });
  await audit({ actorId: session!.user.id, action: "world.archive", target: id });
  revalidatePath("/admin/worlds");
}
async function restore(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  await prisma.world.update({ where: { id }, data: { status: "ACTIVE" } });
  await audit({ actorId: session!.user.id, action: "world.restore", target: id });
  revalidatePath("/admin/worlds");
}
async function makePrivate(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  await prisma.world.update({ where: { id }, data: { visibility: "PRIVATE" } });
  await audit({ actorId: session!.user.id, action: "world.makePrivate", target: id });
  revalidatePath("/admin/worlds");
}

export default async function AdminWorldsPage({
  searchParams,
}: {
  searchParams: { q?: string; visibility?: string; status?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const visibility = (searchParams.visibility ?? "").trim();
  const status = (searchParams.status ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(visibility ? { visibility: visibility as any } : {}),
    ...(status ? { status: status as any } : {}),
  };

  const [total, worlds] = await Promise.all([
    prisma.world.count({ where }),
    prisma.world.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        owner: { select: { id: true, email: true, username: true } },
        _count: { select: { pages: true, members: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Admin</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Worlds</h1>
        <p className="text-sm text-muted-foreground">{total} total · page {page} of {totalPages}</p>
      </header>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
        <div className="flex-1 min-w-[16rem]">
          <label className="text-xs text-muted-foreground">Search</label>
          <div className="relative mt-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder="World name, slug, or description…"
              className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Visibility</label>
          <select name="visibility" defaultValue={visibility} className="mt-1 rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="PUBLIC">Public</option>
            <option value="UNLISTED">Unlisted</option>
            <option value="PRIVATE">Private</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select name="status" defaultValue={status} className="mt-1 rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Filter</button>
        {(q || visibility || status) && (
          <Link href="/admin/worlds" className="text-xs text-muted-foreground hover:underline">Clear</Link>
        )}
      </form>

      {worlds.length === 0 ? (
        <EmptyState icon={<Globe2 className="h-5 w-5" />} title="No worlds match" description="Try a broader search or clear the filters." />
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">World</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Visibility</th>
                <th className="p-3">Status</th>
                <th className="p-3">Pages</th>
                <th className="p-3">Members</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {worlds.map((w) => (
                <tr key={w.id} className="border-t hover:bg-accent/30">
                  <td className="p-3">
                    <Link href={`/w/${w.slug}`} className="font-medium hover:text-primary">{w.name}</Link>
                    <div className="text-[11px] text-muted-foreground">/{w.slug}</div>
                  </td>
                  <td className="p-3 text-xs">{w.owner.username ?? w.owner.email}</td>
                  <td className="p-3"><VisibilityBadge visibility={w.visibility} /></td>
                  <td className="p-3"><StatusBadge status={w.status} /></td>
                  <td className="p-3 tabular-nums">{w._count.pages}</td>
                  <td className="p-3 tabular-nums">{w._count.members}</td>
                  <td className="p-3 text-xs text-muted-foreground">{w.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {w.visibility !== "PRIVATE" && (
                      <form action={makePrivate} className="inline">
                        <input type="hidden" name="id" value={w.id} />
                        <ConfirmButton message={`Force ${w.name} to private visibility?`} variant="ghost">Make private</ConfirmButton>
                      </form>
                    )}
                    {w.status === "ACTIVE" && (
                      <form action={archive} className="inline">
                        <input type="hidden" name="id" value={w.id} />
                        <ConfirmButton message={`Archive ${w.name}?`} variant="destructive">Archive</ConfirmButton>
                      </form>
                    )}
                    {w.status !== "ACTIVE" && (
                      <form action={restore} className="inline">
                        <input type="hidden" name="id" value={w.id} />
                        <ConfirmButton message={`Restore ${w.name} to active?`}>Restore</ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        basePath="/admin/worlds"
        query={{ q, visibility, status }}
      />
    </div>
  );
}
