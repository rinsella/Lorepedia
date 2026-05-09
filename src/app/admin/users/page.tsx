import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessAdmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";

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

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, email: true, username: true, role: true, status: true, createdAt: true },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Users</h1>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr className="text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Username</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Joined</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.username ?? "—"}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2">{u.createdAt.toISOString().slice(0, 10)}</td>
              <td className="p-2 space-x-2">
                {u.role !== "SUPERADMIN" && u.status !== "SUSPENDED" && (
                  <form action={suspend} className="inline">
                    <input type="hidden" name="id" value={u.id} />
                    <button className="text-destructive hover:underline">Suspend</button>
                  </form>
                )}
                {u.status === "SUSPENDED" && (
                  <form action={reinstate} className="inline">
                    <input type="hidden" name="id" value={u.id} />
                    <button className="text-primary hover:underline">Reinstate</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
