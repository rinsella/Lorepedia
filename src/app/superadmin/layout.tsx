import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessSuperadmin } from "@/lib/permissions";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!canAccessSuperadmin(session?.user)) redirect("/dashboard");

  return (
    <div className="container py-6 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1 text-sm">
        <Link href="/superadmin" className="block px-3 py-2 rounded hover:bg-accent">Overview</Link>
        <Link href="/superadmin/admins" className="block px-3 py-2 rounded hover:bg-accent">Admins</Link>
        <Link href="/superadmin/export" className="block px-3 py-2 rounded hover:bg-accent">Export & Migration</Link>
        <Link href="/superadmin/diagnostics" className="block px-3 py-2 rounded hover:bg-accent">Diagnostics</Link>
      </aside>
      <section>{children}</section>
    </div>
  );
}
