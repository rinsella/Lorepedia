import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="container py-6 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1 text-sm">
        <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-accent">Overview</Link>
        <Link href="/dashboard/worlds" className="block px-3 py-2 rounded hover:bg-accent">My Worlds</Link>
        <Link href="/dashboard/account" className="block px-3 py-2 rounded hover:bg-accent">Account</Link>
        {(session.user.role === "ADMIN" || session.user.role === "SUPERADMIN" || session.user.role === "MODERATOR") && (
          <Link href="/admin" className="block px-3 py-2 rounded hover:bg-accent">Admin</Link>
        )}
        {session.user.role === "SUPERADMIN" && (
          <Link href="/superadmin" className="block px-3 py-2 rounded hover:bg-accent">Superadmin</Link>
        )}
      </aside>
      <section>{children}</section>
    </div>
  );
}
