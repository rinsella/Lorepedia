import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdmin, isPlatformStaff } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isPlatformStaff(session?.user)) redirect("/dashboard");

  return (
    <div className="container py-6 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1 text-sm">
        <Link href="/admin" className="block px-3 py-2 rounded hover:bg-accent">Overview</Link>
        <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-accent">Users</Link>
        <Link href="/admin/worlds" className="block px-3 py-2 rounded hover:bg-accent">Worlds</Link>
        <Link href="/admin/comments" className="block px-3 py-2 rounded hover:bg-accent">Comments</Link>
        <Link href="/admin/reports" className="block px-3 py-2 rounded hover:bg-accent">Reports</Link>
        {canAccessAdmin(session?.user) && (
          <Link href="/admin/settings" className="block px-3 py-2 rounded hover:bg-accent">Settings</Link>
        )}
        <Link href="/admin/audit" className="block px-3 py-2 rounded hover:bg-accent">Audit log</Link>
      </aside>
      <section>{children}</section>
    </div>
  );
}
