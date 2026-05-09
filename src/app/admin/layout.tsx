import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessAdmin, isPlatformStaff } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!isPlatformStaff(session?.user)) redirect("/dashboard");

  return (
    <div className="container py-4 sm:py-6 grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] gap-4 md:gap-6 lg:gap-8">
      <aside className="text-sm md:space-y-1 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto md:overflow-visible">
        <div className="flex md:flex-col gap-1 whitespace-nowrap md:whitespace-normal">
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-accent">Overview</Link>
          <Link href="/admin/users" className="block px-3 py-2 rounded hover:bg-accent">Users</Link>
          <Link href="/admin/worlds" className="block px-3 py-2 rounded hover:bg-accent">Worlds</Link>
          <Link href="/admin/comments" className="block px-3 py-2 rounded hover:bg-accent">Comments</Link>
          <Link href="/admin/reports" className="block px-3 py-2 rounded hover:bg-accent">Reports</Link>
          {canAccessAdmin(session?.user) && (
            <Link href="/admin/settings" className="block px-3 py-2 rounded hover:bg-accent">Settings</Link>
          )}
          <Link href="/admin/audit" className="block px-3 py-2 rounded hover:bg-accent">Audit log</Link>
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
