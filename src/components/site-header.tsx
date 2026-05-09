import Link from "next/link";
import { auth } from "@/lib/auth";
import { LogOut, User as UserIcon } from "lucide-react";
import { signOut } from "@/lib/auth";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold">
          <span className="inline-block h-6 w-6 rounded bg-primary" aria-hidden />
          Lorepedia
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/explore" className="px-3 py-2 rounded hover:bg-accent">Explore</Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-accent">Dashboard</Link>
              {(session.user.role === "ADMIN" || session.user.role === "SUPERADMIN" || session.user.role === "MODERATOR") && (
                <Link href="/admin" className="px-3 py-2 rounded hover:bg-accent">Admin</Link>
              )}
              <Link href="/dashboard/account" className="px-3 py-2 rounded hover:bg-accent inline-flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                {session.user.name ?? session.user.email}
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="px-3 py-2 rounded hover:bg-accent inline-flex items-center gap-1" type="submit">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 rounded hover:bg-accent">Sign in</Link>
              <Link
                href="/register"
                className="px-3 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
              >
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
