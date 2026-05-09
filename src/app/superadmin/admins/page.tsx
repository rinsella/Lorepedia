import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canAccessSuperadmin } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import type { UserRole } from "@prisma/client";

const ROLES: UserRole[] = ["USER", "VERIFIED_USER", "MODERATOR", "ADMIN", "SUPERADMIN"];

async function changeRole(formData: FormData) {
  "use server";
  const session = await auth();
  if (!canAccessSuperadmin(session?.user)) redirect("/dashboard");
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as UserRole;
  if (!ROLES.includes(role)) return;
  if (id === session!.user.id && role !== "SUPERADMIN") return; // can't demote self
  await prisma.user.update({ where: { id }, data: { role } });
  await audit({ actorId: session!.user.id, action: "user.role_change", target: id, metadata: { role } });
  revalidatePath("/superadmin/admins");
}

export default async function SuperadminAdmins() {
  const users = await prisma.user.findMany({
    where: { role: { in: ["MODERATOR", "ADMIN", "SUPERADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, role: true, status: true },
  });
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Admins</h1>
      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-muted">
          <tr className="text-left">
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Status</th>
            <th className="p-2">Change role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.status}</td>
              <td className="p-2">
                <form action={changeRole} className="flex gap-2 items-center">
                  <input type="hidden" name="id" value={u.id} />
                  <select name="role" defaultValue={u.role} className="rounded border bg-background px-2 py-1">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button className="text-primary hover:underline">Apply</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
