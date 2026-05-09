import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="container py-4 sm:py-6 grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] gap-4 md:gap-6 lg:gap-8">
      <aside className="text-sm md:space-y-1 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto md:overflow-visible">
        <div className="flex md:flex-col gap-1 whitespace-nowrap md:whitespace-normal">
          <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-accent">Overview</Link>
          <Link href="/dashboard/worlds" className="block px-3 py-2 rounded hover:bg-accent">My Worlds</Link>
          <Link href="/dashboard/account" className="block px-3 py-2 rounded hover:bg-accent">Account</Link>
          {(session.user.role === "ADMIN" || session.user.role === "SUPERADMIN" || session.user.role === "MODERATOR") && (
            <Link href="/admin" className="block px-3 py-2 rounded hover:bg-accent">Admin</Link>
          )}
          {session.user.role === "SUPERADMIN" && (
            <Link href="/superadmin" className="block px-3 py-2 rounded hover:bg-accent">Superadmin</Link>
          )}
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
