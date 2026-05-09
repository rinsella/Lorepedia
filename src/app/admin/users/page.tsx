import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessAdmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/badges";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Users as UsersIcon } from "lucide-react";

export const metadata = { title: "Admin · Users" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

async function suspend(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role === "SUPERADMIN") return;
  await prisma.user.update({ where: { id }, data: { status: "SUSPENDED" } });
  await audit({ actorId: session!.user.id, action: "user.suspend", target: id });
  revalidatePath("/admin/users");
}
async function reinstate(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  await prisma.user.update({ where: { id }, data: { status: "ACTIVE" } });
  await audit({ actorId: session!.user.id, action: "user.reinstate", target: id });
  revalidatePath("/admin/users");
}
async function verify(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessAdmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  await prisma.user.update({ where: { id }, data: { emailVerified: new Date() } });
  await audit({ actorId: session!.user.id, action: "user.verify", target: id });
  revalidatePath("/admin/users");
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; role?: string; status?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const role = (searchParams.role ?? "").trim();
  const status = (searchParams.status ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const where = {
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { username: { contains: q, mode: "insensitive" as const } },
            { name: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(role ? { role: role as any } : {}),
    ...(status ? { status: status as any } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true, email: true, username: true, name: true, role: true, status: true,
        emailVerified: true, createdAt: true,
        _count: { select: { worlds: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--gold))] font-medium">Admin</p>
        <h1 className="font-serif text-3xl font-semibold mt-1">Users</h1>
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
              placeholder="Email, username, or name…"
              className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Role</label>
          <select name="role" defaultValue={role} className="mt-1 rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Superadmin</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Status</label>
          <select name="status" defaultValue={status} className="mt-1 rounded-md border bg-background px-3 py-2 text-sm">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
        <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Filter</button>
        {(q || role || status) && (
          <Link href="/admin/users" className="text-xs text-muted-foreground hover:underline">Clear</Link>
        )}
      </form>

      {users.length === 0 ? (
        <EmptyState icon={<UsersIcon className="h-5 w-5" />} title="No users match" description="Try clearing the filters." />
      ) : (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Worlds</th>
                <th className="p-3">Joined</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t hover:bg-accent/30">
                  <td className="p-3">
                    <div className="font-medium">{u.email}</div>
                    {!u.emailVerified && <div className="text-[11px] text-amber-700 dark:text-amber-300">unverified</div>}
                  </td>
                  <td className="p-3">{u.username ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide">{u.role}</span>
                  </td>
                  <td className="p-3"><StatusBadge status={u.status} /></td>
                  <td className="p-3 tabular-nums">{u._count.worlds}</td>
                  <td className="p-3 text-xs text-muted-foreground">{u.createdAt.toISOString().slice(0, 10)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    {!u.emailVerified && (
                      <form action={verify} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmButton message="Mark this email as verified?" variant="ghost">Verify</ConfirmButton>
                      </form>
                    )}
                    {u.role !== "SUPERADMIN" && u.status !== "SUSPENDED" && (
                      <form action={suspend} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmButton message={`Suspend ${u.email}?`} variant="destructive">Suspend</ConfirmButton>
                      </form>
                    )}
                    {u.status === "SUSPENDED" && (
                      <form action={reinstate} className="inline">
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmButton message={`Reinstate ${u.email}?`}>Reinstate</ConfirmButton>
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
        basePath="/admin/users"
        query={{ q, role, status }}
      />
    </div>
  );
}
