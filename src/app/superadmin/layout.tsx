import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canAccessSuperadmin } from "@/lib/permissions";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!canAccessSuperadmin(session?.user)) redirect("/dashboard");

  return (
    <div className="container py-4 sm:py-6 grid md:grid-cols-[200px_1fr] lg:grid-cols-[220px_1fr] gap-4 md:gap-6 lg:gap-8">
      <aside className="text-sm md:space-y-1 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto md:overflow-visible">
        <div className="flex md:flex-col gap-1 whitespace-nowrap md:whitespace-normal">
          <Link href="/superadmin" className="block px-3 py-2 rounded hover:bg-accent">Overview</Link>
          <Link href="/superadmin/admins" className="block px-3 py-2 rounded hover:bg-accent">Admins</Link>
          <Link href="/superadmin/export" className="block px-3 py-2 rounded hover:bg-accent">Export &amp; Migration</Link>
          <Link href="/superadmin/diagnostics" className="block px-3 py-2 rounded hover:bg-accent">Diagnostics</Link>
        </div>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
